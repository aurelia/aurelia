// tslint:disable:mocha-no-side-effect-code
// tslint:disable:typedef
import { expect } from 'chai';
import { AppPage } from './app.page';
import { isSafari, isEdge } from '../common';

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

describe(`Select App - `, () => {
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

  // TODO: make this work for safari
  if (!isSafari()) {
    describe(`Change single selection`, () => {

      it(`select each item one by one by index`, () => {
        for (let i = 0; i < 10; ++i) {
          AppPage.setSelectByIndex(i);
          expect(AppPage.getSelectedValue()).to.equal(i+'');
        }
      });
    });
  }

  // TODO: make this work for edge/safari
  if (!(isEdge() || isSafari())) {
    describe(`Change multiple selection`, () => {
      beforeEach(() => {
        AppPage.checkCheckbox();
      });


      it(`select each item simultaneously`, () => {
        AppPage.setSelectByIndex(0); // deselect first element before starting loop
        for (let i = 0; i < 10; ++i) {
          AppPage.setSelectByIndex(i);
          expect(AppPage.option(i).isSelected()).to.be.true;
        }
      });

      it(`select and deselects each item right away`, () => {
        AppPage.setSelectByIndex(0); // deselect first element before starting loop
        for (let i = 0; i < 10; ++i) {
          AppPage.setSelectByIndex(i);
          AppPage.setSelectByIndex(i);
          expect(AppPage.option(i).isSelected()).to.be.false;
        }

        expect(AppPage.options.filter(o => o.isSelected()).length).to.equal(0);
      });
    });
  }
});
