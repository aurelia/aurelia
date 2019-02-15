/// <reference types="Cypress" />

// Tests the router and default route screen renders
describe('Router Default', function() {

  it('contains an au-viewport tag', function() {
    cy.visit('http://localhost:9001/');

    cy.get('au-viewport')
      .should('exist')
      .and('have.class', 'au')
      .and('have.attr', 'default', 'routerHome')
      .and('have.attr', 'name', 'app');
  });

  it('contains an empty au-nav tag', function() {
    cy.visit('http://localhost:9001/');

    cy.get('au-nav')
      .should('exist')
      .find('li')
      .should('not.exist');
  });

  it('default route displays', function() {
    cy.visit('http://localhost:9001/');

    cy.contains('Viewport: app').should('exist');
    cy.contains('Router Home').should('exist');
  });

});
