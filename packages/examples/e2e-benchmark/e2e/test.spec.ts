import { expect } from 'chai';
import { browser, loadUrl } from './common/browser';
import { processMeasurements } from './common/measurements';
import { AppPage } from './page-objects/app.page';

describe(`App page`, () => {
  beforeEach(async () => {
    await loadUrl(`http://localhost:3000`);
  });

  afterEach(async () => {
    await processMeasurements();
  });

  after(async () => {
    await browser.quit();
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

  for (const count of [10000]) {
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

      it(`add ${count} todos and insert 10 todos spread evenly 5 times`, async () => {
        await AppPage.setCountInputValue(count);
        await AppPage.addTodo();
        await AppPage.insertTodos();
        await AppPage.insertTodos();
        await AppPage.insertTodos();
        await AppPage.insertTodos();
        await AppPage.insertTodos();
      });

      it(`add ${count} todos and remove 10 todos spread evenly 5 times`, async () => {
        await AppPage.setCountInputValue(count);
        await AppPage.addTodo();
        await AppPage.removeTodos();
        await AppPage.removeTodos();
        await AppPage.removeTodos();
        await AppPage.removeTodos();
        await AppPage.removeTodos();
      });

      it(`add ${count} todos and swap 2 todos 5 times`, async () => {
        await AppPage.setCountInputValue(count);
        await AppPage.addTodo();
        await AppPage.swapTodos();
        await AppPage.swapTodos();
        await AppPage.swapTodos();
        await AppPage.swapTodos();
        await AppPage.swapTodos();
      });
    });
  }
});
