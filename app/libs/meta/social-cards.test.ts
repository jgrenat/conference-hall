import { eventSocialCard } from './social-cards.ts';

describe('#eventSocialCard', () => {
  it('returns an event social card with a logo', () => {
    const socialCard = eventSocialCard({ name: 'Devfest', slug: 'devfest', logoUrl: 'https://devfest.com/logo.png' });

    expect(socialCard).toEqual([
      { content: "Devfest's call for papers", property: 'og:title' },
      { content: "Submit your proposal to Devfest's call for papers.", property: 'og:description' },
      { content: 'event', property: 'og:type' },
      { content: 'https://conference-hall.io/devfest', property: 'og:url' },
      { content: "Devfest's call for papers", name: 'twitter:title' },
      { content: 'https://devfest.com/logo.png', property: 'og:image' },
      { content: '200', property: 'og:image:width' },
      { content: '200', property: 'og:image:height' },
      { content: 'https://devfest.com/logo.png', name: 'twitter:image' },
      { content: 'summary_large_image', name: 'twitter:card' },
    ]);
  });

  it('returns an event social card without a logo', () => {
    const socialCard = eventSocialCard({ name: 'Devfest', slug: 'devfest', logoUrl: null });

    expect(socialCard).toEqual([
      { content: "Devfest's call for papers", property: 'og:title' },
      { content: "Submit your proposal to Devfest's call for papers.", property: 'og:description' },
      { content: 'event', property: 'og:type' },
      { content: 'https://conference-hall.io/devfest', property: 'og:url' },
      { content: "Devfest's call for papers", name: 'twitter:title' },
      { content: 'summary', name: 'twitter:card' },
    ]);
  });
});
