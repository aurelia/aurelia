import { assert, TestContext, createSpy, MockBrowserHistoryLocation } from '@aurelia/testing';
import { DOM } from '@aurelia/runtime-html';
import { Writable } from '@aurelia/kernel';
import { BrowserNavigation, INavigationState } from '@aurelia/router';

describe('BrowserNavigation', function () {
  this.timeout(5000);
  let browserNavigation;
  let callbackCount = 0;
  const callback = ((info) => {
    callbackCount++;
  });
  interface MockWindow extends Window { }
  class MockWindow {
    public window: Window;
    public history: History;
    public location: Location;

    constructor(window: Window, history: History, location: Location) {
      this.window = window;
      this.history = history;
      this.location = location;
    }

    public addEventListener(event, handler, preventDefault) {
      this.window.addEventListener(event, handler, preventDefault);
    }
    public removeEventListener(event, handler) {
      this.window.removeEventListener(event, handler);
    }
  }

  function setup() {
    const ctx = TestContext.createHTMLTestContext();
    const { lifecycle, dom } = ctx;
    // const originalWnd = ctx.wnd;

    // const mockWnd = new MockWindow(originalWnd, originalWnd.history, originalWnd.location);
    // const addEventListener = createSpy(mockWnd, 'addEventListener');
    // const removeEventListener = createSpy(mockWnd, 'removeEventListener');

    // (DOM as Writable<typeof DOM>).window = mockWnd;

    lifecycle.startTicking();
    const sut = new BrowserNavigation(lifecycle, dom);
    const mockBrowserHistoryLocation = new MockBrowserHistoryLocation();
    mockBrowserHistoryLocation.changeCallback = sut.handlePopstate;
    sut.history = mockBrowserHistoryLocation as any;
    sut.location = mockBrowserHistoryLocation as any;

    function tearDown() {
      // (DOM as Writable<typeof DOM>).window = originalWnd;
      lifecycle.stopTicking();
    }

    callbackCount = 0;
    const callback = ((info) => {
      callbackCount++;
    });

    return { sut, tearDown, callback, lifecycle };
  }

  it('can be created', function () {
    const { sut, tearDown, callback } = setup();

    assert.notStrictEqual(sut, null, 'sut');
    tearDown();
  });

  it('can be activated', async function () {
    const { sut, tearDown, callback } = setup();

    await sut.activate(callback);

    assert.strictEqual(sut['isActive'], true, 'sut.isActive');
    // assert.strictEqual(addEventListener.calls.length, 1, `addEventListener.calls.length`);

    sut.deactivate();

    tearDown();
  });

  it('can be deactivated', async function () {
    const { sut, tearDown, callback } = setup();

    await sut.activate(callback);
    assert.strictEqual(sut['isActive'], true, 'sut.isActive');
    // assert.strictEqual(addEventListener.calls.length, 1, `addEventListener.calls.length`);

    sut.deactivate();

    assert.strictEqual(sut['isActive'], false, 'sut.isActive');
    // assert.strictEqual(removeEventListener.calls.length, 1, `removeEventListener.calls.length`);

    tearDown();
  });

  it('throws when activated while active', async function () {
    const { sut, tearDown, callback } = setup();

    await sut.activate(callback);
    assert.strictEqual(sut['isActive'], true, 'sut.isActive');

    let err;
    try {
      await sut.activate(callback);
    } catch (e) {
      err = e;
    }
    assert.strictEqual(err.message, 'Browser navigation has already been activated', 'err.message');

    sut.deactivate();

    tearDown();
  });

  it('suppresses popstate event callback', async function () {
    const { sut, tearDown, callback } = setup();

    let counter = 0;
    await sut.activate(
      // Called once as part of activation and then for each url/location change
      function () {
        counter++;
      });

    await sut.pushNavigationState(toNavigationState('one'));
    assert.strictEqual(sut.history.state.NavigationEntry.instruction, 'one', 'sut.history.state.NavigationEntry.instruction');
    await sut.pushNavigationState(toNavigationState('two'));
    assert.strictEqual(sut.history.state.NavigationEntry.instruction, 'two', 'sut.history.state.NavigationEntry.instruction');
    await sut.go(-1, true);
    await Promise.resolve();
    assert.strictEqual(sut.history.state.NavigationEntry.instruction, 'one', 'sut.history.state.NavigationEntry.instruction');

    assert.strictEqual(counter, 1, 'counter'); // Initial (and not + the above 'go')

    sut.deactivate();

    tearDown();
  });

  it('queues consecutive calls', async function () {
    const { sut, tearDown, callback } = setup();

    await sut.activate(callback);
    await wait();

    const length = sut['pendingCalls'].length;
    sut.pushNavigationState(toNavigationState('one')); // 1 item, cost 1
    sut.replaceNavigationState(toNavigationState('two')); // 1 item, cost 1
    sut.go(-1); // 2 items (forwardState + go), cost 0 + 1
    sut.go(1); // 2 items (forwardState + go), cost 0 + 1
    const noOfItems = 6;
    const processedItems = 3; // sut.allowedNoOfExecsWithinTick === 2
    assert.strictEqual(sut['pendingCalls'].length, length + noOfItems - processedItems, 'sut.pendingCalls.length');
    await wait();

    sut.deactivate();

    tearDown();
  });

  it('awaits go', async function () {
    const { sut, tearDown, callback } = setup();

    let counter = 0;
    await sut.activate(
      // Called once as part of activation and then for each url/location change
      function () {
        counter++;
      });

    await sut.pushNavigationState(toNavigationState('one'));
    assert.strictEqual(sut.history.state.NavigationEntry.instruction, 'one', 'sut.history.state.NavigationEntry.instruction');
    await sut.pushNavigationState(toNavigationState('two'));
    assert.strictEqual(sut.history.state.NavigationEntry.instruction, 'two', 'sut.history.state.NavigationEntry.instruction');
    await sut.go(-1);
    await Promise.resolve();
    assert.strictEqual(sut.history.state.NavigationEntry.instruction, 'one', 'sut.history.state.NavigationEntry.instruction');

    assert.strictEqual(counter, 2, 'counter');

    sut.deactivate();

    tearDown();
  });
});

const toNavigationState = (instruction: string): INavigationState => {
  return {
    NavigationEntries: [],
    NavigationEntry: {
      instruction: instruction,
      fullStateInstruction: null,
      path: instruction,
    }
  };
};

const wait = async (time = 100) => {
  await new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};
