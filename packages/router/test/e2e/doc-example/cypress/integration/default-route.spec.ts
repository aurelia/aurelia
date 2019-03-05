import { AuthorsComponent, Shared, AuthorComponent } from './selectors.po';

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
      .should('exist');
    cy.get(Shared.listsViewportHeader)
      .should('contain', 'Viewport: lists  : authors');

    cy.get(Shared.contentViewportHeader)
      .should('exist');
    cy.get(Shared.contentViewportHeader)
      .should('contain', 'Viewport: content  : about');

    cy.get(Shared.chatViewportHeader)
      .should('exist');
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

  describe('author details component', () => {
    before(() => {
      cy.visit("/#/author(1)");
    });

    it('displays the correct viewport', () => {
      cy.get(Shared.contentViewport)
        .should('exist');
      cy.get(Shared.contentViewportHeader)
        .should('contain', 'Viewport: content  : author');

      cy.get(AuthorComponent.authorTabsViewport)
        .should('exist');
      cy.get(AuthorComponent.authorTabsViewportHeader)
        .should('contain', 'Viewport: author-tabs  : author-details');
    });

    it('display the correct author details', () => {
      cy.get(AuthorComponent.authorName)
        .should('contain', 'Terry Pratchett');

      cy.get(AuthorComponent.authorBirthYear)
        .should('contain', 'Born: 1948');

      const books = [
        'The Colour of Magic',
        'Jingo',
        'Night Watch',
        'Good Omens'
      ];

      cy.get(AuthorComponent.bookLinks)
        .as('books');

      books.forEach((b, i) => {
        cy.get('@books')
          .eq(i)
          .should('contain', b);
      });
    });

    it('displays the correct author tabs', () => {
      const tabs = [
        'Details',
        'About authors',
        'Author information'
      ];

      cy.get(AuthorComponent.authorMenuNavItems)
        .as('authorTabs');

      tabs.forEach((t, i) => {
        cy.get('@authorTabs')
          .eq(i)
          .should('contain', t);
      });
    });

    it('toggles author tabs', () => {
      cy.get(AuthorComponent.authorTabsViewport)
        .should('exist');

      cy.get(AuthorComponent.hideTabsCheckbox)
        .click();

      cy.get(AuthorComponent.authorTabsViewport)
        .should('not.exist');

      cy.get(AuthorComponent.hideTabsCheckbox)
        .click();
    });
  });
});
