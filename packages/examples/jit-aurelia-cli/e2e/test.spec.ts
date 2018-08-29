// tslint:disable:mocha-no-side-effect-code
// tslint:disable:typedef
import { expect } from 'chai';
import { browser, loadUrl } from './common/browser';
import { AppPage } from './page-objects/app.page';

describe(`App page`, () => {
  beforeEach(async () => {
    await loadUrl(`http://localhost:3000`)
  });

  after(async () => {
    await browser.quit();
  });

  describe(`loads with correct initial values`, () => {
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

  async function verifyTodos(count: number, appDescr: string, todoDescr: string, done: boolean) {
    const todos = await AppPage.getTodos();
    expect(todos.length).to.equal(count);
    for (let i = 0; i < count; ++i) {
      const todo = todos[i];
      const actual = await todo.getText();
      expect(actual).to.equal(`#${i} - ${appDescr} - ${todoDescr}${done ? ' Done' : ''}`);
    }
  }

  it(`adds 1 todo`, async () => {
    await AppPage.addTodo();
    await verifyTodos(1, 'Hello World', 'Hello World', false);
  });

  it(`adds 1 todo and removes it`, async () => {
    await AppPage.addTodo();
    await AppPage.clearTodos();
    await verifyTodos(0, null, null, false);
  });

  it(`adds 10 todos one by one`, async () => {
    for (let i = 0; i < 10; ++i) {
      await AppPage.addTodo();
    }
    await verifyTodos(10, 'Hello World', 'Hello World', false);
  });

  it(`adds 10 todos at once`, async () => {
    await AppPage.setCountInputValue(10);
    await AppPage.addTodo();
    await verifyTodos(10, 'Hello World', 'Hello World', false);
  });

  it(`adds 10 todos at once and removes them`, async () => {
    await AppPage.setCountInputValue(10);
    await AppPage.addTodo();
    await AppPage.clearTodos();
    await verifyTodos(0, null, null, false);
  });

  it(`adds 1 todo with different text beforehand`, async () => {
    await AppPage.setDescriptionInputValue('foo');
    await AppPage.addTodo();
    await verifyTodos(1, 'foo', 'foo', false);
  });

  it(`adds 10 todos with different text beforehand one by one`, async () => {
    await AppPage.setDescriptionInputValue('foo');
    for (let i = 0; i < 10; ++i) {
      await AppPage.addTodo();
    }
    await verifyTodos(10, 'foo', 'foo', false);
  });

  it(`adds 10 todos with different text beforehand at once`, async () => {
    await AppPage.setDescriptionInputValue('foo');
    await AppPage.setCountInputValue(10);
    await AppPage.addTodo();
    await verifyTodos(10, 'foo', 'foo', false);
  });

  it(`adds 1 todo with different text afterwards`, async () => {
    await AppPage.addTodo();
    await AppPage.setDescriptionInputValue('foo');
    await verifyTodos(1, 'foo', 'Hello World', false);
  });

  it(`adds 10 todos with different text afterwards one by one`, async () => {
    for (let i = 0; i < 10; ++i) {
      await AppPage.addTodo();
    }
    await AppPage.setDescriptionInputValue('foo');
    await verifyTodos(10, 'foo', 'Hello World', false);
  });

  it(`adds 10 todos with different text afterwards at once`, async () => {
    await AppPage.setCountInputValue(10);
    await AppPage.addTodo();
    await AppPage.setDescriptionInputValue('foo');
    await verifyTodos(10, 'foo', 'Hello World', false);
  });

  it(`adds 10 todos and toggles them one by one`, async () => {
    await AppPage.setCountInputValue(10);
    await AppPage.addTodo();
    for (let i = 0; i < 10; ++i) {
      await AppPage.clickTodoDoneCheckbox(i);
    }
    await verifyTodos(10, 'Hello World', 'Hello World', true);
  });

  it(`adds 10 todos and toggles them one by one and back off again`, async () => {
    await AppPage.setCountInputValue(10);
    await AppPage.addTodo();
    for (let i = 0; i < 10; ++i) {
      await AppPage.clickTodoDoneCheckbox(i);
      await AppPage.clickTodoDoneCheckbox(i);
    }
    await verifyTodos(10, 'Hello World', 'Hello World', false);
  });

  it(`adds 10 todos and toggles them all at once`, async () => {
    await AppPage.setCountInputValue(10);
    await AppPage.addTodo();
    await AppPage.toggleTodos();
    await verifyTodos(10, 'Hello World', 'Hello World', true);
  });

  it(`adds 10 todos and toggles them on all at once and back off again`, async () => {
    await AppPage.setCountInputValue(10);
    await AppPage.addTodo();
    await AppPage.toggleTodos();
    await AppPage.toggleTodos();
    await verifyTodos(10, 'Hello World', 'Hello World', false);
  });

});
