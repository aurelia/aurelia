// tslint:disable:mocha-no-side-effect-code
// tslint:disable:typedef
import { expect } from 'chai';
import { TestSession } from './common/test-session';
import { AppPage } from './page-objects/app.page';

describe(`App page`, () => {
  let session: TestSession;
  let page: AppPage;

  before(async () => {
    session = await TestSession.start();
    page = new AppPage(session.browser);
  });
  beforeEach(async () => {
    await page.loadUrl(`http://${TestSession.APP_HOST}:${TestSession.APP_PORT}`)
  });

  after(async () => {
    await session.stop();
  });

  describe(`loads with correct initial values`, () => {
    const descriptionText = 'Hello World';
    const countValue = 1;

    it(`description interpolation text: "${descriptionText}"`, async () => {
      expect(await page.getDescriptionInterpolationText()).to.equal(descriptionText);
    });

    it(`count input value: ${countValue}`, async () => {
      expect(await page.getCountInputValue()).to.equal(countValue);
    });

    it(`description input value: "${descriptionText}"`, async () => {
      expect(await page.getDescriptionInputValue()).to.equal(descriptionText);
    });
  });

  async function verifyTodos(count: number, appDescr: string, todoDescr: string, done: boolean) {
    const todos = await page.getTodos();
    expect(todos.length).to.equal(count);
    for (let i = 0; i < count; ++i) {
      const todo = todos[i];
      // the replace + trim is a workaround for safari which renders lots of spaces and newlines
      const actual = (await todo.getText()).replace(/\n/g, '').replace(/ +/g, ' ').trim();
      expect(actual).to.equal(`#${i} - ${appDescr} - ${todoDescr}${done ? ' Done' : ''}`);
    }
  }

  it(`adds 1 todo`, async () => {
    await page.addTodo();
    await verifyTodos(1, 'Hello World', 'Hello World', false);
  });

  it(`adds 1 todo and removes it`, async () => {
    await page.addTodo();
    await page.clearTodos();
    await verifyTodos(0, null, null, false);
  });

  it(`adds 10 todos one by one`, async () => {
    for (let i = 0; i < 10; ++i) {
      await page.addTodo();
    }
    await verifyTodos(10, 'Hello World', 'Hello World', false);
  });

  it(`adds 10 todos at once`, async () => {
    await page.setCountInputValue(10);
    await page.addTodo();
    await verifyTodos(10, 'Hello World', 'Hello World', false);
  });

  it(`adds 10 todos at once and removes them`, async () => {
    await page.setCountInputValue(10);
    await page.addTodo();
    await page.clearTodos();
    await verifyTodos(0, null, null, false);
  });

  it(`adds 1 todo with different text beforehand`, async () => {
    await page.setDescriptionInputValue('foo');
    await page.addTodo();
    await verifyTodos(1, 'foo', 'foo', false);
  });

  it(`adds 10 todos with different text beforehand one by one`, async () => {
    await page.setDescriptionInputValue('foo');
    for (let i = 0; i < 10; ++i) {
      await page.addTodo();
    }
    await verifyTodos(10, 'foo', 'foo', false);
  });

  it(`adds 10 todos with different text beforehand at once`, async () => {
    await page.setDescriptionInputValue('foo');
    await page.setCountInputValue(10);
    await page.addTodo();
    await verifyTodos(10, 'foo', 'foo', false);
  });

  it(`adds 1 todo with different text afterwards`, async () => {
    await page.addTodo();
    await page.setDescriptionInputValue('foo');
    await verifyTodos(1, 'foo', 'Hello World', false);
  });

  it(`adds 10 todos with different text afterwards one by one`, async () => {
    for (let i = 0; i < 10; ++i) {
      await page.addTodo();
    }
    await page.setDescriptionInputValue('foo');
    await verifyTodos(10, 'foo', 'Hello World', false);
  });

  it(`adds 10 todos with different text afterwards at once`, async () => {
    await page.setCountInputValue(10);
    await page.addTodo();
    await page.setDescriptionInputValue('foo');
    await verifyTodos(10, 'foo', 'Hello World', false);
  });

  it(`adds 10 todos and toggles them one by one`, async () => {
    await page.setCountInputValue(10);
    await page.addTodo();
    for (let i = 0; i < 10; ++i) {
      await page.clickTodoDoneCheckbox(i);
    }
    await verifyTodos(10, 'Hello World', 'Hello World', true);
  });

  it(`adds 10 todos and toggles them one by one and back off again`, async () => {
    await page.setCountInputValue(10);
    await page.addTodo();
    for (let i = 0; i < 10; ++i) {
      await page.clickTodoDoneCheckbox(i);
      await page.clickTodoDoneCheckbox(i);
    }
    await verifyTodos(10, 'Hello World', 'Hello World', false);
  });

  it(`adds 10 todos and toggles them all at once`, async () => {
    await page.setCountInputValue(10);
    await page.addTodo();
    await page.toggleTodos();
    await verifyTodos(10, 'Hello World', 'Hello World', true);
  });

  it(`adds 10 todos and toggles them on all at once and back off again`, async () => {
    await page.setCountInputValue(10);
    await page.addTodo();
    await page.toggleTodos();
    await page.toggleTodos();
    await verifyTodos(10, 'Hello World', 'Hello World', false);
  });

});
