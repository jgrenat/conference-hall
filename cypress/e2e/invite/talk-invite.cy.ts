import InvitationPage from '../../page-objects/invitation.page.ts';
import SpeakerTalkPage from '../../page-objects/speaker/talk.page.ts';

describe('Invite to talk', () => {
  beforeEach(() => {
    cy.task('seedDB', 'invite/talk-invite');
  });

  const invite = new InvitationPage();
  const talk = new SpeakerTalkPage();

  it('accepts talk invite', () => {
    cy.login('Bruce Wayne');
    invite.visit('talk', '123');
    cy.findByText('Awesome talk').should('exist');

    invite.acceptInvite();
    talk.isPageVisible();
  });
});
