// tslint:disable:mocha-no-side-effect-code
// tslint:disable:typedef
import { expect } from 'chai';
import { AppPage } from './app.page';

const selectMap = {
  0: 'zero',
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
  7: 'seven',
  8: 'eight',
  9: 'nine'
};

describe(`Select App`, () => {
  beforeEach(() => {
    browser.url('index.select.html');
  });

  describe(`Loads with correct initial values`, () => {
    const selectText = 'zero';
    const selectValue = '0';

    it(`selected text: "${selectText}"`, () => {
      expect(AppPage.getSelectedText()).to.equal(selectText);
    });

    it(`selected value: ${selectValue}`, () => {
      expect(AppPage.getSelectedValue()).to.equal(selectValue);
    });
  });

  describe(`Change single selection`, () => {

    it(`select each item one by one by index`, () => {
      for (let i = 0; i < 10; ++i) {
        AppPage.setSelectByIndex(i);
        expect(AppPage.getSelectedText()).to.equal(selectMap[i]);
        expect(AppPage.getSelectedValue()).to.equal(i+'');
      }
    });

    it(`select each item one by one by value`, () => {
      for (let i = 0; i < 10; ++i) {
        AppPage.setSelectByValue(i+'');
        expect(AppPage.getSelectedText()).to.equal(selectMap[i]);
        expect(AppPage.getSelectedValue()).to.equal(i+'');
      }
    });

    it(`select each item one by one by text`, () => {
      for (let i = 0; i < 10; ++i) {
        AppPage.setSelectByVisibleText(selectMap[i]);
        expect(AppPage.getSelectedText()).to.equal(selectMap[i]);
        expect(AppPage.getSelectedValue()).to.equal(i+'');
      }
    });
  });

  describe(`Change multiple selection`, () => {
    beforeEach(() => {
      AppPage.checkCheckbox();
    });

  });
});
