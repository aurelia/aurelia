import * as de from '../../src/locales/de/translations.json';
import * as en from '../../src/locales/en/translations.json';

describe('i18n', () => {
  beforeEach(() => { cy.visit('/'); });

  const assertContent = (selector: string, expected: string, isHtmlContent: boolean | undefined = false) => {
    cy.get(selector).should(isHtmlContent ? 'have.html' : 'have.text', expected);
  };

  const specs = [
    {
      name: 'should work for simple text-content',
      suts: [{ selector: `#i18n-simple`, expected: en.simple.text, expectedDe: de.simple.text }]
    },
  ];

  for (const { name, suts } of specs) {
    it(name, () => {
      for (const sut of suts) {
        assertContent(sut.selector, sut.expected);
      }
    });
  }

});
