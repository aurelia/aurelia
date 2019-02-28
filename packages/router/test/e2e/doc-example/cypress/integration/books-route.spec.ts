import { BooksComponent, Shared } from './selectors.po';

describe('doc-example / books route', () => {
  it('navigates to books route', () => {
    cy.visit('/#/books')
      .url()
      .should('contain', '/#/books+about');
  });

  it('displays the correct viewports', () => {
    cy.get(Shared.listsViewportHeader)
      .should('contain', 'Viewport: lists  : books');

    cy.get(Shared.contentViewportHeader)
      .should('contain', 'Viewport: content  : about');

    cy.get(Shared.chatViewportHeader)
      .should('contain', 'Viewport: chat  : null');
  });

  describe('books component', () => {
      it('displays the correct titles and authors', () => {
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
});
