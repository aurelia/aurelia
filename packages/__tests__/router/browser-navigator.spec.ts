import { BrowserNavigator, INavigatorState } from '@aurelia/router';
import { assert, MockBrowserHistoryLocation, TestContext } from '@aurelia/testing';

describe('BrowserNavigator', function () {
  this.timeout(5000);
  let browserNavigator;
  let callbackCount = 0;
  const callback = ((info) => {
    callbackCount++;
  });
  class MockWindow {
    public window: Window;
    public history: History;
    public location: Location;

    public constructor(window: Window, history: History, location: Location) {
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
    const { lifecycle, scheduler, dom } = ctx;
    // const originalWnd = ctx.wnd;

    // const mockWnd = new MockWindow(originalWnd, originalWnd.history, originalWnd.location);
    // const addEventListener = createSpy(mockWnd, 'addEventListener');
    // const removeEventListener = createSpy(mockWnd, 'removeEventListener');

    // (DOM as Writable<typeof DOM>).window = mockWnd;

    const sut = new BrowserNavigator(scheduler, dom);
    const mockBrowserHistoryLocation = new MockBrowserHistoryLocation();
    mockBrowserHistoryLocation.changeCallback = sut.handlePopstate;
    sut.history = mockBrowserHistoryLocation as any;
    sut.location = mockBrowserHistoryLocation as any;

    function tearDown() {
      // (DOM as Writable<typeof DOM>).window = originalWnd;
    }

    callbackCount = 0;
    const callback = ((info) => {
      callbackCount++;
    });

    return { sut, tearDown, callback, lifecycle };
  }

  it('can be created', function () {
    const { sut, tearDown, callback } = setup();

    assert.notStrictEqual(sut, null, `sut`);
    tearDown();
  });

  it('can be activated', function () {
    const { sut, tearDown, callback } = setup();

    sut.activate({ callback });

    assert.strictEqual(sut['isActive'], true, `sut.isActive`);
    // assert.strictEqual(addEventListener.calls.length, 1, `addEventListener.calls.length`);

    sut.deactivate();

    tearDown();
  });

  it('can be deactivated', function () {
    const { sut, tearDown, callback } = setup();

    sut.activate({ callback });
    assert.strictEqual(sut['isActive'], true, `sut.isActive`);
    // assert.strictEqual(addEventListener.calls.length, 1, `addEventListener.calls.length`);

    sut.deactivate();

    assert.strictEqual(sut['isActive'], false, `sut.isActive`);
    // assert.strictEqual(removeEventListener.calls.length, 1, `removeEventListener.calls.length`);

    tearDown();
  });

  it('throws when activated while active', function () {
    const { sut, tearDown, callback } = setup();

    sut.activate({ callback });
    assert.strictEqual(sut['isActive'], true, `sut.isActive`);

    let err;
    try {
      sut.activate({ callback });
    } catch (e) {
      err = e;
    }
    assert.strictEqual(err.message, 'Browser navigation has already been activated', `err.message`);

    sut.deactivate();

    tearDown();
  });

  it('suppresses popstate event callback', async function () {
    const { sut, tearDown, callback } = setup();

    let counter = 0;
    sut.activate({
      callback:
        // Called once for each url/location change (no longer in as part of activation)
        function () {
          counter++;
        }
    });

    await sut.pushNavigatorState(toNavigatorState('one'));
    assert.strictEqual(sut.history.state.currentEntry.instruction, 'one', `sut.history.state.currentEntry.instruction`);
    await sut.pushNavigatorState(toNavigatorState('two'));
    assert.strictEqual(sut.history.state.currentEntry.instruction, 'two', `sut.history.state.currentEntry.instruction`);
    await sut.go(-1, true);
    await Promise.resolve();
    assert.strictEqual(sut.history.state.currentEntry.instruction, 'one', `sut.history.state.currentEntry.instruction`);

    assert.strictEqual(counter, 0, `counter`); // Not the above 'go' (and no longer initial)

    sut.deactivate();

    tearDown();
  });

  it('queues consecutive calls', async function () {
    const { sut, tearDown, callback } = setup();

    sut.activate({ callback });
    await wait();

    const length = sut['pendingCalls'].length;
    sut.pushNavigatorState(toNavigatorState('one')); // 1 item, cost 1
    sut.replaceNavigatorState(toNavigatorState('two')); // 1 item, cost 1
    sut.go(-1); // 2 items (forwardState + go), cost 0 + 1
    sut.go(1); // 2 items (forwardState + go), cost 0 + 1
    const noOfItems = 6;
    const processedItems = 3; // sut.allowedNoOfExecsWithinTick === 2
    assert.strictEqual(sut['pendingCalls'].length, length + noOfItems - processedItems, `sut.pendingCalls.length`);
    await wait();

    sut.deactivate();

    tearDown();
  });

  it('awaits go', async function () {
    const { sut, tearDown, callback } = setup();

    let counter = 0;
    sut.activate({
      callback:
        // Called once for each url/location change (no longer in as part of activation)
        function () {
          counter++;
        }
    });

    await sut.pushNavigatorState(toNavigatorState('one'));
    assert.strictEqual(sut.history.state.currentEntry.instruction, 'one', `sut.history.state.currentEntry.instruction`);
    await sut.pushNavigatorState(toNavigatorState('two'));
    assert.strictEqual(sut.history.state.currentEntry.instruction, 'two', `sut.history.state.currentEntry.instruction`);
    await sut.go(-1);
    await Promise.resolve();
    assert.strictEqual(sut.history.state.currentEntry.instruction, 'one', `sut.history.state.currentEntry.instruction`);

    assert.strictEqual(counter, 1, `counter`);

    sut.deactivate();

    tearDown();
  });

  it('defaults to using url fragment hash', async function () {
    const { sut, tearDown, callback } = setup();

    let instruction;
    sut.activate({
      callback:
        function (state) {
          instruction = state;
        }
    });

    await sut.pushNavigatorState(toNavigatorState('one'));
    assert.strictEqual(sut.history.state.currentEntry.instruction, 'one', `sut.history.state.currentEntry.instruction`);
    await sut.pushNavigatorState(toNavigatorState('two'));
    assert.strictEqual(sut.history.state.currentEntry.instruction, 'two', `sut.history.state.currentEntry.instruction`);
    await sut.go(-1);
    await Promise.resolve();
    assert.strictEqual(sut.history.state.currentEntry.instruction, 'one', `sut.history.state.currentEntry.instruction`);

    assert.strictEqual(instruction.instruction, '/one', `instruction.instruction`);
    assert.strictEqual(instruction.path, '/', `instruction.path`);
    assert.strictEqual(instruction.hash, '#/one', `instruction.hash`);

    sut.deactivate();

    tearDown();
  });

  it('can be set to not using url fragment hash', async function () {
    const { sut, tearDown, callback } = setup();

    let instruction;
    sut.activate({
      callback:
        function (state) {
          instruction = state;
        },
      useUrlFragmentHash: false,
    });

    await sut.pushNavigatorState(toNavigatorState('one'));
    assert.strictEqual(sut.history.state.currentEntry.instruction, 'one', `sut.history.state.currentEntry.instruction`);
    await sut.pushNavigatorState(toNavigatorState('two'));
    assert.strictEqual(sut.history.state.currentEntry.instruction, 'two', `sut.history.state.currentEntry.instruction`);
    await sut.go(-1);
    await Promise.resolve();
    assert.strictEqual(sut.history.state.currentEntry.instruction, 'one', `sut.history.state.currentEntry.instruction`);

    assert.strictEqual(instruction.instruction, '/one', `instruction.instruction`);
    assert.strictEqual(instruction.path, '/one', `instruction.path`);
    assert.strictEqual(instruction.hash, '', `instruction.hash`);

    sut.deactivate();

    tearDown();
  });
});

const toNavigatorState = (instruction: string): INavigatorState => {
  return {
    entries: [],
    currentEntry: {
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
