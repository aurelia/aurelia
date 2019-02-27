describe('router / doc-example', () => {
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
      cy.get('au-nav li.nav-active')
        .as('activeNavigation');

      // retreive the elements from the variable and check for length
      cy.get('@activeNavigation')
        .should('have.length', 2);

      const labels = [
        'Authors',
        'About'
      ];

      // this chekcs for both order and value
      labels.forEach((l, i) => {
        // access the element via the index
        cy.get('@activeNavigation')
          .eq(i)
          .should('contain', l);
      });
    });

    it('displays the correct viewports', () => {
      cy.get('au-viewport[name=lists] .viewport-header')
        .should('contain', 'Viewport: lists  : authors');

      cy.get('au-viewport[name=content] .viewport-header')
        .should('contain', 'Viewport: content  : about');

      cy.get('au-viewport[name=chat] .viewport-header')
        .should('contain', 'Viewport: chat  : null');
    });

    describe('authors component', () => {
      it('displays the correct author names', () => {
        cy.get('[data-test=authors-element-author-link]')
          .as('authorLinks');

        cy.get('@authorLinks')
          .should('have.length', 4);

        const authors = [
          'Terry Pratchett',
          'Stephen King',
          'Patrick Rothfus',
          'Neil Gaiman'
        ];

        authors.forEach((a, i) => {
          cy.get('@authorLinks')
            .eq(i)
            .should('contain', a);
        });
      });

      it('displays the correct book titles', () => {
        cy.get('[data-test=authors-element-book-name]')
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
  });
});
