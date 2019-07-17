describe('foobar', () => {
  beforeEach(() => { cy.visit('/'); });

  it('whatever', () => {
    cy.wrap({ amount: 10 }).should('have.property', 'amount').and('eq', 10);
  });

});
