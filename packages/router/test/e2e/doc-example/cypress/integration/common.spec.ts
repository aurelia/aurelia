import { AboutComponent, Shared } from './selectors.po';

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
});
