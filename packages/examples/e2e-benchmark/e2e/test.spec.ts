// tslint:disable:mocha-no-side-effect-code
// tslint:disable:typedef
import { expect } from 'chai';
import { writeFileSync } from 'fs';
import { browser, getAllEntries, loadUrl } from './common/browser';
import { processMeasurements } from './common/measurements';
import { AppPage } from './page-objects/app.page';

describe(`App page`, () => {
  const entries = [];

  beforeEach(async () => {
    await loadUrl(`http://localhost:3000`);
  });

  afterEach(async () => {
    await processMeasurements();
    entries.push(...(await getAllEntries()));
  });

  after(async () => {
    await browser.quit();
    const results = JSON.stringify(entries, null, 2);
    writeFileSync('./performance-entries.json', results, { encoding: 'utf8' })
  });

  describe(`warmup`, () => {
    const descriptionText = 'Hello World';
    const countValue = 1;

    it(`description interpolation text: "${descriptionText}"`, async () => {
      expect(await AppPage.getDescriptionInterpolationText()).to.equal(descriptionText);
    });

    it(`count input value: ${countValue}`, async () => {
      expect(await AppPage.getCountInputValue()).to.equal(countValue);
    });

    it(`description input value: "${descriptionText}"`, async () => {
      expect(await AppPage.getDescriptionInputValue()).to.equal(descriptionText);
    });
  });

  for (const count of [10, 100, 1000, 10000]) {
    describe(`benchmark x${count}`, () => {

      it(`add and remove ${count} todos`, async () => {
        await AppPage.setCountInputValue(count);
        await AppPage.addTodo();
        await AppPage.clearTodos();
        await AppPage.addTodo();
        await AppPage.clearTodos();
      });

      it(`add ${count} todos and change text`, async () => {
        await AppPage.setCountInputValue(count);
        await AppPage.addTodo();
        await AppPage.setDescriptionInputValue('foo');
        await AppPage.updateTodos();
        await AppPage.setDescriptionInputValue('bar');
        await AppPage.updateTodos();
      });

      it(`add and toggle ${count} todos`, async () => {
        await AppPage.setCountInputValue(count);
        await AppPage.addTodo();
        await AppPage.toggleTodos();
        await AppPage.toggleTodos();
        await AppPage.toggleTodos();
        await AppPage.toggleTodos();
      });

      it(`add and reverse ${count} todos`, async () => {
        await AppPage.setCountInputValue(count);
        await AppPage.addTodo();
        await AppPage.reverseTodos();
        await AppPage.reverseTodos();
      });
    });
  }
});
