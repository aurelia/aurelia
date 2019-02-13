// Tests the router and default route screen renders
describe('Router Default', function() {
  it('default route displays', function() {
    cy.visit('http://localhost:9001/');

    cy.contains('Router Home').should('exist');
  });
});
