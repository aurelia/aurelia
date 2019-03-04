import { AboutComponent, Shared, ChatComponent, ChatUsersComponent, ChatDetailsComponent } from './selectors.po';

describe('doc-example / common elements', () => {
  before(() => {
    cy.visit('/');
  });

  it('sets the default checkboxes values', () => {
    cy.get(Shared.noDelayCheckbox)
      .should('be.checked');

    cy.get(Shared.allowEnterAuthorDetailsCheckbox)
      .should('be.checked');
  });

  it('sets the default info background color', () => {
    cy.get(Shared.infoBackgroundColor)
      .should('have.text', 'lightgreen');
  });

  describe('about component', () => {
    it('allows entry to the input box', () => {
      cy.get(AboutComponent.aboutInput)
        .should('be.enabled')
        .and('be.empty')
        .type('sample text')
        .should('have.value', 'sample text')
        .clear();
    });
  });

  describe('chat component', () => {
    beforeEach(() => {
      cy.visit('/#/chat');
    });

    afterEach(() => {
      cy.get(ChatComponent.close)
        .click();
    });

    it('displays the default viewports', () => {
      cy.get(ChatComponent.chatMainViewport)
        .should('exist');
      cy.get(ChatComponent.chatMainViewportHeader)
        .should('contain', 'Viewport: chat-main  : chat-users');

      cy.get(ChatComponent.chatDetailsViewport)
        .should('exist');
      cy.get(ChatComponent.chatDetailsViewportHeader)
        .should('contain', 'Viewport: chat-details  : null');
    });

    it('displays the correct chat users', () => {
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
              .and('contain', `${u.id} (${u.name})`)
              .click();
          });
      });
    });

    it('displays the correct user', () => {
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

      cy.get(ChatUsersComponent.userLinks)
        .as('chatUsers');

      users.forEach((u, i) => {
        cy.get('@chatUsers')
          .eq(i)
          .click();

        cy.get(ChatDetailsComponent.chatTitle)
          .should('contain', `Chatting with ${u.id} (${u.name})`);
      });
    });
  });
});
