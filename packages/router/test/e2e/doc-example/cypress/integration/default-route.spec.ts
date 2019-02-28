import { AuthorsComponent, Shared } from './selectors.po';

describe('doc-example / default route', () => {
  it('navigates to default route', () => {
    cy.visit('/')
      .url()
      .should('contain', '/authors+about');
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

  describe('authors component', () => {
    it('displays the correct author and books', () => {
      const authors = [
        {
          name: 'Terry Pratchett',
          href: 'author(1)',
          books: [
            'The Colour of Magic',
            'Jingo',
            'Night Watch',
            'Good Omens'
          ]
        },
        {
          name: 'Stephen King',
          href: 'author(2)',
          books: [
            'It',
            'The Shining'
          ]
        },
        {
          name: 'Patrick Rothfus',
          href: 'author(3)',
          books: [
            'The Name of the Wind',
            'The Wise Man\'s Fear'
          ]
        },
        {
          name: 'Neil Gaiman',
          href: 'author(4)',
          books: [
            'Good Omens'
          ]
        }
      ];

      cy.get(AuthorsComponent.items)
        .as('authorListItems');

      authors.forEach((a, i) => {
        cy.get('@authorListItems')
          .eq(i)
          .within(_ => {
            cy.get(AuthorsComponent.authorLinks)
              .should('contain', a.name)
              .and('have.attr', 'href', a.href);

            cy.get(AuthorsComponent.bookTitles)
              .as('bookTitles');

            a.books.forEach((b, ii) => {
              cy.get('@bookTitles')
                .eq(ii)
                .should('contain', b);
            });
          });
      });
    });
  });
});
