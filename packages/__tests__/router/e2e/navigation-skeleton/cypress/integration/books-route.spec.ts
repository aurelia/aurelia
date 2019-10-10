import { BooksComponent, Shared, BookComponent } from './selectors.po';

describe('doc-example / books route', function() {
  it('navigates to books route', function() {
    cy.visit('/#/books+about')
      .url()
      .should('contain', '/#/books+about');
  });

  it('displays the correct viewports', function() {
    cy.get(Shared.listsViewport)
      .should('exist');
    cy.get(Shared.listsViewportHeader)
      .should('contain', 'Viewport: lists  : books');

    cy.get(Shared.contentViewport)
      .should('exist');
    cy.get(Shared.contentViewportHeader)
      .should('contain', 'Viewport: content  : about');

    cy.get(Shared.chatViewport)
      .should('exist');
    cy.get(Shared.chatViewportHeader)
      .should('contain', 'Viewport: chat  : null');
  });

  describe('books component', function() {
    it('displays the correct titles and authors', function() {
      const books = [
        {
          title: 'The Colour of Magic',
          href: 'book(1)',
          authors: [
            'Terry Pratchett'
          ]
        },
        {
          title: 'Jingo',
          href: 'book(2)',
          authors: [
            'Terry Pratchett'
          ]
        },
        {
          title: 'Night Watch',
          href: 'book(3)',
          authors: [
            'Terry Pratchett'
          ]
        },
        {
          title: 'It',
          href: 'book(4)',
          authors: [
            'Stephen King'
          ]
        },
        {
          title: 'The Shining',
          href: 'book(5)',
          authors: [
            'Stephen King'
          ]
        },
        {
          title: 'The Name of the Wind',
          href: 'book(6)',
          authors: [
            'Patrick Rothfuss'
          ]
        },
        {
          title: 'The Wise Man\'s Fear',
          href: 'book(7)',
          authors: [
            'Patrick Rothfuss'
          ]
        },
        {
          title: 'Good Omens',
          href: 'book(8)',
          authors: [
            'Terry Pratchett',
            'Neil Gaiman'
          ]
        }
      ];

      cy.get(BooksComponent.items)
        .as('bookListItems');

      books.forEach((b, i) => {
        cy.get('@bookListItems')
          .eq(i)
          .within(_ => {
            cy.get(BooksComponent.bookLinks)
              .should('contain', b.title)
              .and('have.attr', 'href', b.href);

            cy.get(BooksComponent.authorNames)
              .as('bookAuthors');

            b.authors.forEach((a, ii) => {
              cy.get('@bookAuthors')
                .eq(ii)
                .should('contain', a);
            });
          });
      });
    });
  });

  describe('book details component', function() {
    before(() => {
      cy.get(BooksComponent.bookLinks)
        .eq(0)
        .click();
    });

    it('displays the correct viewports', function() {
      cy.get(Shared.contentViewport)
        .should('exist');
      cy.get(Shared.contentViewportHeader)
        .should('contain', 'Viewport: content  : book');

      cy.get(BookComponent.bookTabsViewport)
        .should('exist');
      cy.get(BookComponent.bookTabsViewportHeader)
        .should('contain', 'Viewport: book-tabs  : book-details');
    });

    it('displays the correct book details', function() {
      cy.get(BookComponent.bookName)
        .should('contain', 'The Colour of Magic');

      cy.get(BookComponent.publishYear)
        .should('contain', 'Published: 1983');

      const authors = [
        {
          name: 'Terry Pratchett',
          href: 'author(1)'
        }
      ];

      cy.get(BookComponent.authorLinks)
        .as('authorLinks');

      authors.forEach((a, i) => {
        cy.get('@authorLinks')
          .eq(i)
          .should('have.attr', 'href', a.href)
          .and('contain', a.name);
      });
    });

    it('displays the correct book tabs', function() {
      const tabs = [
        'Details',
        'About books',
        'Book information',
        'Redirect information',
        'Redirect about'
      ];

      cy.get(BookComponent.bookMenuNavItems)
        .as('bookTabs');

      tabs.forEach((t, i) => {
        cy.get('@bookTabs')
          .eq(i)
          .should('contain', t);
      });
    });
  });
});
