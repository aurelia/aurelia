import { AboutComponent, AuthorsComponent, Shared } from './selectors.po';

describe('doc-example', () => {
  it('navigates to default route', () => {
    cy.visit('/')
      .url()
      .should('contain', '/authors+about');
  });

  describe('default route', () => {
    before(() => {
      cy.visit('/');
    });

    it('redirects to the default route', () => {
      cy.url()
        .should('contain', '/authors+about');
    });

    it('sets the correct nav items as active', () => {

      // retrieve all active elements and 'save' into a variable within Cypress
      cy.get(Shared.appMenuNavItemsActive)
        .as('activeNavigation');

      // retrieve the elements from the variable and check for length
      cy.get('@activeNavigation')
        .should('have.length', 2);

      const labels = [
        'Authors',
        'About'
      ];

      // this checks for both order and value
      labels.forEach((l, i) => {
        // access the element via the index
        cy.get('@activeNavigation')
          .eq(i)
          .should('contain', l);
      });
    });

    it('displays the correct viewports', () => {
      cy.get(Shared.listsViewportHeader)
        .should('contain', 'Viewport: lists  : authors');

      cy.get(Shared.contentViewportHeader)
        .should('contain', 'Viewport: content  : about');

      cy.get(Shared.chatViewportHeader)
        .should('contain', 'Viewport: chat  : null');
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

    describe('authors component', () => {
      it('displays the correct author names', () => {
        cy.get(AuthorsComponent.authorLinks)
          .as('authorLinks');

        cy.get('@authorLinks')
          .should('have.length', 4);

        const authors = [
          {
            name: 'Terry Pratchett',
            href: 'author=1'
          },
          {
            name: 'Stephen King',
            href: 'author=2'
          },
          {
            name: 'Patrick Rothfus',
            href: 'author=3'
          },
          {
            name: 'Neil Gaiman',
            href: 'author=4'
          }
        ];

        cy.get(AuthorsComponent.authorLinks)
          .as('authorLinks');

        authors.forEach((a, i) => {
          cy.get('@authorLinks')
            .eq(i)
            .should('contain', a.name)
            .and('have.attr', 'href', a.href);
        });
      });

      it('displays the correct book titles', () => {
        cy.get(AuthorsComponent.bookTitles)
          .as('bookTitles');

        cy.get('@bookTitles')
          .should('have.length', 9);

        const books = [
          'The Colour of Magic',
          'Jingo',
          'Night Watch',
          'Good Omens',
          'It',
          'The Shining',
          'The Name of the Wind',
          'The Wise Man\'s Fear',
          'Good Omens'
        ];

        books.forEach((b, i) => {
          cy.get('@bookTitles')
            .eq(i)
            .should('contain', b);
        });
      });
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
  });
});
