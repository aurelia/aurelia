import { QueuedBrowserHistory } from '@aurelia/router';
import { assert, createSpy, TestContext } from '@aurelia/testing';
import { DOM } from '@aurelia/runtime-html';
import { Writable, DI } from '@aurelia/kernel';
import { ILifecycle } from '@aurelia/runtime';

describe('QueuedBrowserHistory', function () {
  this.timeout(5000);
  interface MockWindow extends Window {}
  class MockWindow {
    public history: History;

    constructor(history: History) {
      this.history = history;
    }

    public addEventListener(event, handler, preventDefault) { return; }
    public removeEventListener(handler) { return; }
  }

  function setup() {
    const ctx = TestContext.createHTMLTestContext();
    const originalWnd = ctx.wnd;

    const mockWnd = new MockWindow(originalWnd.history);
    const addEventListener = createSpy(mockWnd, 'addEventListener');
    const removeEventListener = createSpy(mockWnd, 'removeEventListener');

    (DOM as Writable<typeof DOM>).window = mockWnd;

    const lifecycle = DI.createContainer().get(ILifecycle);
    lifecycle.startTicking();
    const sut = new QueuedBrowserHistory(lifecycle);

    function tearDown() {
      (DOM as Writable<typeof DOM>).window = originalWnd;
      lifecycle.stopTicking();
    }

    let callbackCount = 0;
    const callback = ((info) => {
      callbackCount++;
    });

    return { addEventListener, removeEventListener, sut, tearDown, callback, lifecycle };
  }

  it('can be activated', function () {
    const { sut, tearDown, addEventListener, callback } = setup();

    sut.activate(callback);

    assert.strictEqual(sut['isActive'], true, `sut.isActive`);

    assert.deepStrictEqual(
      addEventListener.calls,
      [
        ['popstate', sut['handlePopstate']],
      ],
      `addEventListener.calls`,
    );

    sut.deactivate();

    tearDown();
  });

  it('can be deactivated', function () {
    const { sut, tearDown, removeEventListener, callback } = setup();

    sut.activate(callback);

    assert.strictEqual(sut['isActive'], true, `sut.isActive`);

    sut.deactivate();

    assert.strictEqual(sut['isActive'], false, `sut.isActive`);

    assert.deepStrictEqual(
      removeEventListener.calls,
      [
        ['popstate', sut['handlePopstate']],
      ],
      `removeEventListener.calls`,
    );

    tearDown();
  });

  it('throws when activated while active', function () {
    const { sut, tearDown, callback } = setup();

    sut.activate(callback);

    assert.strictEqual(sut['isActive'], true, `sut.isActive`);

    let err;
    try {
      sut.activate(callback);
    } catch (e) {
      err = e;
    }
    assert.includes(err.message, 'Queued browser history has already been activated', `err.message`);

    sut.deactivate();

    tearDown();
  });

  it('queues consecutive calls', async function () {
    const { sut, tearDown, callback } = setup();

    const callbackSpy = createSpy(sut, 'dequeue' as keyof typeof sut);
    sut.activate(callback);

    const length = sut.length;
    sut.pushState({}, null, '#one');
    sut.replaceState("test", null, '#two');
    sut.back();
    sut.forward();

    assert.deepStrictEqual(
      callbackSpy.calls,
      [],
      `callbackSpy.calls`,
    );

    assert.strictEqual(sut.length, length, `sut.length`);
    assert.strictEqual(sut['queue'].length, 4, `sut.queue.length`);
    await wait();

    sut.deactivate();

    tearDown();
  });

  xit('awaits go', async function () {
    const { sut, tearDown, callback } = setup();

    let counter = 0;
    sut.activate(function () {
      counter++;
    });

    await sut.pushState('one', null, '#one');
    assert.strictEqual(sut.state, 'one', `sut.state`);
    await sut.pushState('two', null, '#two');
    assert.strictEqual(sut.state, 'two', `sut.state`);
    await sut.go(-1);
    await Promise.resolve();
    assert.strictEqual(sut.state, 'one', `sut.state`);

    assert.strictEqual(counter, 1, `counter`);

    sut.deactivate();

    tearDown();
  });

  xit('suppresses popstate event callback', async function () {
    const { sut, tearDown, callback } = setup();

    let counter = 0;
    sut.activate(function () {
      counter++;
    });

    await sut.pushState('one', null, '#one');
    assert.strictEqual(sut.state, 'one', `sut.state`);
    await sut.pushState('two', null, '#two');
    assert.strictEqual(sut.state, 'two', `sut.state`);
    await sut.go(-1, true);
    await Promise.resolve();
    assert.strictEqual(sut.state, 'one', `sut.state`);

    assert.strictEqual(counter, 0, `counter`);

    sut.deactivate();

    tearDown();
  });
});

const wait = async (time = 100) => {
  await new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};
