import type { Event, Team, User } from '@prisma/client';
import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';

import { db } from '~/libs/db.ts';
import { ForbiddenOperationError } from '~/libs/errors.ts';

import { CfpReviewsSearch } from './CfpReviewsSearch.ts';

describe('CfpReviewsSearch', () => {
  let owner: User, reviewer: User, speaker: User;
  let team: Team;
  let event: Event;

  beforeEach(async () => {
    owner = await userFactory({ traits: ['clark-kent'] });
    reviewer = await userFactory({ traits: ['bruce-wayne'] });
    speaker = await userFactory({ traits: ['peter-parker'] });
    team = await teamFactory({ owners: [owner], reviewers: [reviewer] });
    event = await eventFactory({ team });
  });

  describe('#search', () => {
    it('returns event proposals info', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const proposals = await CfpReviewsSearch.for(owner.id, team.slug, event.slug).search({ status: 'pending' });

      expect(proposals.results).toEqual([
        {
          id: proposal.id,
          title: proposal.title,
          deliberationStatus: proposal.deliberationStatus,
          confirmationStatus: proposal.confirmationStatus,
          publicationStatus: proposal.publicationStatus,
          speakers: [{ name: speaker.name, picture: speaker.picture }],
          reviews: {
            summary: { negatives: 0, positives: 0, average: null },
            you: { note: null, feeling: null, comment: null },
          },
        },
      ]);

      expect(proposals.filters).toEqual({ status: 'pending' });
      expect(proposals.statistics).toEqual({ reviewed: 0, total: 1 });
      expect(proposals.pagination).toEqual({ current: 1, total: 1 });
    });

    it('does not return speakers when display proposal speakers is false', async () => {
      await db.event.update({ data: { displayProposalsSpeakers: false }, where: { id: event.id } });
      await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      let proposals = await CfpReviewsSearch.for(owner.id, team.slug, event.slug).search({});
      expect(proposals.results[0]?.speakers).toEqual([]);

      proposals = await CfpReviewsSearch.for(owner.id, team.slug, event.slug).search({ query: 'parker' });
      expect(proposals.results.length).toEqual(0);
    });

    it('does not return reviews when display proposal reviews is false', async () => {
      await db.event.update({ data: { displayProposalsReviews: false }, where: { id: event.id } });
      await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      let proposals = await CfpReviewsSearch.for(owner.id, team.slug, event.slug).search({});
      expect(proposals.results[0].reviews.summary).toBeUndefined();
    });

    it('returns empty results of an event without proposals', async () => {
      const proposals = await CfpReviewsSearch.for(owner.id, team.slug, event.slug).search({});

      expect(proposals.results).toEqual([]);

      expect(proposals.filters).toEqual({});
      expect(proposals.statistics).toEqual({ reviewed: 0, total: 0 });
      expect(proposals.pagination).toEqual({ current: 1, total: 0 });
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      const event = await eventFactory();
      await proposalFactory({ event, talk: await talkFactory({ speakers: [user] }) });
      const reviewsSearch = CfpReviewsSearch.for(user.id, team.slug, event.slug);
      await expect(reviewsSearch.search({})).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#forJsonExport', () => {
    it('export reviews to json', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const result = await CfpReviewsSearch.for(owner.id, team.slug, event.slug).forJsonExport({});

      expect(result).toEqual([
        {
          id: proposal.id,
          title: proposal.title,
          deliberationStatus: proposal.deliberationStatus,
          confirmationStatus: proposal.confirmationStatus,
          abstract: proposal.abstract,
          comments: proposal.comments,
          languages: proposal.languages,
          references: proposal.references,
          level: proposal.level,
          categories: [],
          formats: [],
          reviews: {
            negatives: 0,
            positives: 0,
            average: null,
          },
          speakers: [
            {
              name: speaker.name,
              email: speaker.email,
              bio: speaker.bio,
              picture: speaker.picture,
              company: speaker.company,
              address: speaker.address,
              references: speaker.references,
              socials: speaker.socials,
            },
          ],
        },
      ]);
    });

    it('does not export speakers when display speakers setting is false', async () => {
      await db.event.update({ data: { displayProposalsSpeakers: false }, where: { id: event.id } });

      await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const result = await CfpReviewsSearch.for(owner.id, team.slug, event.slug).forJsonExport({});

      expect(result[0].speakers).toBeUndefined();
    });

    it('does not export reviews when display reviews setting is false', async () => {
      await db.event.update({ data: { displayProposalsReviews: false }, where: { id: event.id } });

      await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const result = await CfpReviewsSearch.for(owner.id, team.slug, event.slug).forJsonExport({});

      expect(result[0].reviews).toBeUndefined();
    });
  });

  describe('#forCardsExport', () => {
    it('export a proposal', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const result = await CfpReviewsSearch.for(owner.id, team.slug, event.slug).forCardsExport({});

      expect(result).toEqual([
        {
          id: proposal.id,
          title: proposal.title,
          languages: proposal.languages,
          level: proposal.level,
          categories: [],
          formats: [],
          reviews: {
            negatives: 0,
            positives: 0,
            average: null,
          },
          speakers: [speaker.name],
        },
      ]);
    });

    it('does not export speakers when display speakers setting is false', async () => {
      await db.event.update({ data: { displayProposalsSpeakers: false }, where: { id: event.id } });

      await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const result = await CfpReviewsSearch.for(owner.id, team.slug, event.slug).forCardsExport({});

      expect(result[0].speakers).toBeUndefined();
    });

    it('does not export reviews when display reviews setting is false', async () => {
      await db.event.update({ data: { displayProposalsReviews: false }, where: { id: event.id } });

      await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const result = await CfpReviewsSearch.for(owner.id, team.slug, event.slug).forCardsExport({});

      expect(result[0].reviews).toBeUndefined();
    });
  });
});
