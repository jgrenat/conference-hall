import invariant from 'tiny-invariant';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { sessionRequired } from '~/libs/auth/auth.server';
import { mapErrorToResponse } from '~/libs/errors';
import { Container } from '~/design-system/Container';
import { H2, Subtitle } from '~/design-system/Typography';
import { ButtonLink } from '~/design-system/Buttons';
import { MaxProposalsReached } from './components/MaxProposalsReached';
import { SubmissionTalksList } from './components/SubmissionTalksList';
import { getProposalCountsForEvent, listTalksToSubmit } from './server/list-talks-to-submit.server';
import { IconLabel } from '~/design-system/IconLabel';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export const handle = { step: 'selection' };

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  invariant(params.event, 'Invalid event slug');

  try {
    const talks = await listTalksToSubmit(uid, params.event);
    const proposalsCount = await getProposalCountsForEvent(uid, params.event);
    return json({ talks, proposalsCount });
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export default function EventSubmitRoute() {
  const data = useLoaderData<typeof loader>();
  const { max, submitted } = data.proposalsCount;

  if (max && submitted >= max) {
    return (
      <Container className="mt-8">
        <MaxProposalsReached maxProposals={max} />
      </Container>
    );
  }

  return (
    <Container className="my-4 space-y-8 sm:my-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <H2 mb={1}>Proposal selection</H2>
          <Subtitle>Select or create a new proposal to submit.</Subtitle>
        </div>
        <ButtonLink to="new">Create a new proposal</ButtonLink>
      </div>

      {Boolean(max) && (
        <IconLabel icon={ExclamationTriangleIcon} strong>
          You can submit a maximum of {max} proposals. ({submitted} out of {max})
        </IconLabel>
      )}

      <SubmissionTalksList talks={data?.talks} />
    </Container>
  );
}
