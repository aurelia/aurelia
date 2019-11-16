import { AboutComponent, ChatComponent, ChatDetailsComponent, ChatUsersComponent, Shared } from './selectors.po';

describe('doc-example / common elements', function() {
  before(() => {
    cy.visit('/');
  });

  it('sets the default checkboxes values', function() {
    cy.get(Shared.noDelayCheckbox)
      .should('be.checked');

    cy.get(Shared.allowEnterAuthorDetailsCheckbox)
      .should('be.checked');
  });

  it('sets the default info background color', function() {
    cy.get(Shared.infoBackgroundColor)
      .should('have.text', 'lightgreen');
  });

  describe('about component', function() {
    it('allows entry to the input box', function() {
      cy.get(AboutComponent.aboutInput)
        .should('be.enabled')
        .and('be.empty')
        .type('sample text')
        .should('have.value', 'sample text')
        .clear();
    });
  });

  describe('chat component', function() {
    before(() => {
      cy.visit('/#/chat');
    });

    after(() => {
      cy.get(ChatComponent.close)
        .click();
    });

    it('sets the correct nav items as active', function() {
      const labels = [
        'Authors',
        'About',
        'Chat'
      ];

      cy.get(Shared.appMenuNavItemsActive)
        .as('activeNavigation');

      cy.get('@activeNavigation')
        .should('have.length', labels.length);

      labels.forEach((l, i) => {
        cy.get('@activeNavigation')
          .eq(i)
          .should('contain', l);
      });
    });

    it('displays the default viewports', function() {
      cy.get(ChatComponent.chatMainViewport)
        .should('exist');
      cy.get(ChatComponent.chatMainViewportHeader)
        .should('contain', 'Viewport: chat-main  : chat-users');

      cy.get(ChatComponent.chatDetailsViewport)
        .should('exist');
      cy.get(ChatComponent.chatDetailsViewportHeader)
        .should('contain', 'Viewport: chat-details  : null');
    });

    it('displays the correct chat users', function() {
      const users = [
        {
          id: 'eisenbergeffect',
          name: 'Rob Eisenberg'
        },
        {
          id: 'jwx',
          name: 'Jürgen Wenzel'
        },
        {
          id: 'shahabganji',
          name: 'Saeed Ganji'
        }
      ];

      cy.get(ChatUsersComponent.items)
        .as('chatUsers');

      cy.get('@chatUsers')
        .should('have.length', users.length);

      users.forEach((u, i) => {
        cy.get('@chatUsers')
          .eq(i)
          .within(_ => {
            cy.get(ChatUsersComponent.userLinks)
              .should('have.attr', 'href', `chat-user(${u.id})`)
              .and('contain', `${u.id} (${u.name})`);
          });
      });
    });

    it('displays the correct user', function() {
      cy.get(ChatUsersComponent.userLinks)
        .as('chatUsers');

      cy.get('@chatUsers')
        .eq(0)
        .click();

      cy.get(ChatDetailsComponent.chatTitle)
        .should('contain', `Chatting with eisenbergeffect (Rob Eisenberg)`);
    });
  });
});
