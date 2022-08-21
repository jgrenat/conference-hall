import { eventCategoryFactory } from '../../../tests/factories/categories';
import { eventFactory } from '../../../tests/factories/events';
import { eventFormatFactory } from '../../../tests/factories/formats';
import { userFactory } from '../../../tests/factories/users';

export const seed = async () => {
  await userFactory({ traits: ['clark-kent'] });

  const event = await eventFactory({
    attributes: {
      name: 'Devfest Nantes',
      slug: 'devfest-nantes',
      address: 'Nantes, France',
      description: 'The event !',
      conferenceStart: '2020-10-05T00:00:00.000Z',
      conferenceEnd: '2020-10-05T00:00:00.000Z',
      websiteUrl: 'https://devfest.gdgnantes.com',
      contactEmail: 'contact@example.com',
      codeOfConductUrl: 'https://devfest.gdgnantes.com/cod.html',
    },
    traits: ['conference-cfp-open'],
  });

  await eventFormatFactory({ event, attributes: { name: 'Format 1', description: 'Format description 1' } });
  await eventCategoryFactory({ event, attributes: { name: 'Category 1', description: 'Category description 1' } });

  await eventFactory({
    attributes: {
      slug: 'event-cfp-future',
    },
    traits: ['conference-cfp-future'],
  });

  await eventFactory({
    attributes: {
      slug: 'event-cfp-past',
    },
    traits: ['conference-cfp-past'],
  });
};
