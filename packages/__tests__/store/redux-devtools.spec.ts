import { skip as _skip, delay as _delay } from "rxjs/operators/index.js";
import type { skip as $skip, delay as $delay } from "rxjs/operators";

const skip = _skip as typeof $skip;
const delay = _delay as typeof $delay;

import { DevToolsOptions, Store, DevToolsRemoteDispatchError } from '@aurelia/store';
import {
  testState,
  createDI,
  DevToolsMock,
  createCallCounter,
  createTestStore
} from './helpers.js';
import { assert } from '@aurelia/testing';

describe("redux devtools", function () {
  it("should not setup devtools if disabled via options", function () {
    const { logger, storeWindow } = createDI();
    const store = new Store<testState>({ foo: "bar " }, logger, storeWindow, { devToolsOptions: { disable: true } });

    assert.equal((store as any).devToolsAvailable, false);
  });

  it("should init devtools if available", function () {
    class InitTrackerMock extends DevToolsMock {
      public async init() {
        await new Promise<void>((resolve) => {
          setTimeout(() => assert.equal((store as any).devToolsAvailable, true));
          resolve();
        });
      }
    }
    const { logger, storeWindow } = createDI({
      __REDUX_DEVTOOLS_EXTENSION__: {
        connect: (devToolsOptions?: DevToolsOptions) => new InitTrackerMock(devToolsOptions)
      }
    });

    const store = new Store<testState>({ foo: "bar " }, logger, storeWindow);
  });

  it("should use DevToolsOptions if available", function () {
    const { logger, storeWindow } = createDI();
    const options = { serialize: false };
    const store = new Store<testState>({ foo: "bar " }, logger, storeWindow, { devToolsOptions: options });

    assert.notEqual((store as any).devTools.devToolsOptions, undefined);
    assert.equal((store as any).devTools.devToolsOptions.serialize, options.serialize);
  });

  it("should receive time-travel notification from devtools", function () {
    const { logger, storeWindow } = createDI();

    const store = new Store<testState>({ foo: "bar " }, logger, storeWindow);
    const devtools = ((store as any).devTools as DevToolsMock);
    const expectedStateChange = "from-redux-devtools";

    assert.equal(devtools.subscriptions.length, 1);

    devtools.subscriptions[0]({ state: JSON.stringify({ foo: expectedStateChange }) });
  });

  it("should update state when receiving JUMP_TO_STATE message", function (done) {
    const { logger, storeWindow } = createDI();

    const store = new Store<testState>({ foo: "bar " }, logger, storeWindow);
    const devtools = ((store as any).devTools as DevToolsMock);
    const expectedStateChange = "from-redux-devtools";

    assert.equal(devtools.subscriptions.length, 1);

    devtools.subscriptions[0]({ type: "DISPATCH", payload: { type: "JUMP_TO_STATE" }, state: JSON.stringify({ foo: expectedStateChange }) });

    store.state.subscribe((timeTravelledState) => {
      assert.equal(timeTravelledState.foo, expectedStateChange);
      done();
    });
  });

  it("should update state when receiving JUMP_TO_ACTION message", function (done) {
    const { logger, storeWindow } = createDI();

    const store = new Store<testState>({ foo: "bar " }, logger, storeWindow);
    const devtools = ((store as any).devTools as DevToolsMock);
    const expectedStateChange = "from-redux-devtools";

    assert.equal(devtools.subscriptions.length, 1);

    devtools.subscriptions[0]({ type: "DISPATCH", payload: { type: "JUMP_TO_ACTION" }, state: JSON.stringify({ foo: expectedStateChange }) });

    store.state.subscribe((timeTravelledState) => {
      assert.equal(timeTravelledState.foo, expectedStateChange);
      done();
    });
  });

  it("should not update state when receiving COMMIT payload but re-init devtools with current state", function () {
    const { logger, storeWindow } = createDI();

    const store = new Store<testState>({ foo: "bar " }, logger, storeWindow);
    const devtools = ((store as any).devTools as DevToolsMock);
    const { spyObj: nextSpy } = createCallCounter((store as any)._state, "next");
    const { spyObj: devtoolsSpy } = createCallCounter(devtools, "init");

    assert.equal(devtools.subscriptions.length, 1);

    devtools.subscriptions[0]({
      type: "DISPATCH",
      state: undefined,
      payload: { type: "COMMIT", timestamp: 1578982516267 }
    });

    assert.equal(nextSpy.callCounter, 0);
    assert.equal(devtoolsSpy.callCounter, 1);
    assert.equal(devtoolsSpy.lastArgs[0], (store as any)._state.getValue());

    nextSpy.reset();
    devtoolsSpy.reset();
  });

  it("should reset initial state when receiving RESET and re-init devtools", function () {
    const { logger, storeWindow } = createDI();

    const initialState = { foo: "bar " };
    const store = new Store<testState>(initialState, logger, storeWindow);
    const devtools = ((store as any).devTools as DevToolsMock);
    const { spyObj: resetSpy } = createCallCounter(store, "resetToState");
    const { spyObj: devtoolsSpy } = createCallCounter(devtools, "init");

    assert.equal(devtools.subscriptions.length, 1);

    devtools.subscriptions[0]({
      type: "DISPATCH",
      state: undefined,
      payload: { type: "RESET", timestamp: 1578982516267 }
    });

    assert.equal(devtoolsSpy.lastArgs[0], initialState);
    assert.equal(resetSpy.lastArgs[0], initialState);

    resetSpy.reset();
    devtoolsSpy.reset();
  });

  it("should rollback to provided state when receiving ROLLBACK and re-init devtools", function (done) {
    const { logger, storeWindow } = createDI();

    const rolledBackState = { foo: "pustekuchen" };
    const store = new Store<testState>({ foo: "bar " }, logger, storeWindow);
    const devtools = ((store as any).devTools as DevToolsMock);
    const { spyObj: resetSpy } = createCallCounter(store, "resetToState");
    const { spyObj: devtoolsSpy } = createCallCounter(devtools, "init");

    assert.equal(devtools.subscriptions.length, 1);

    devtools.subscriptions[0]({
      type: "DISPATCH",
      state: JSON.stringify(rolledBackState),
      payload: { type: "ROLLBACK", timestamp: 1578982516267 }
    });

    store.state.subscribe(() => {
      assert.deepEqual(devtoolsSpy.lastArgs[0], rolledBackState);
      assert.deepEqual(resetSpy.lastArgs[0], rolledBackState);

      done();
    });
  });

  it("should update Redux DevTools", function (done) {
    const { store } = createTestStore();
    const devtools = ((store as any).devTools as DevToolsMock);
    const { spyObj: devtoolsSpy } = createCallCounter(devtools, "send");

    const fakeAction = (currentState: testState, foo: string) => {
      return { ...currentState, foo };
    };

    store.registerAction("FakeAction", fakeAction);
    store.dispatch(fakeAction, "bert").catch(() => { /**/ });

    store.state.pipe(
      skip(1),
      delay(1)
    ).subscribe(() => {
      assert.equal(devtoolsSpy.callCounter, 1);
      assert.deepEqual(devtoolsSpy.lastArgs, [{
        params: ["bert"], type: "FakeAction"
      }, { foo: "bert" }]);

      done();
    });
  });

  it("should send the newly dispatched actions to the devtools if available", function (done) {
    const { store } = createTestStore();
    (store as any).devToolsAvailable = true;
    const devtools = ((store as any).devTools as DevToolsMock);
    const { spyObj: devtoolsSpy } = createCallCounter(devtools, "send");

    const modifiedState = { foo: "bert" };
    const fakeAction = (currentState: testState) => {
      return { ...currentState, ...modifiedState };
    };

    store.registerAction("FakeAction", fakeAction);
    store.dispatch(fakeAction).catch(() => { /**/ });

    store.state.pipe(
      skip(1),
      delay(1)
    ).subscribe(() => {
      assert.equal(devtoolsSpy.callCounter, 1);
      devtoolsSpy.reset();
      done();
    });
  });

  describe("dispatching actions", function () {
    it("should react to the ACTION type and execute the intended action", function (done) {
      const devToolsValue = "dispatched value by devtools";

      const { logger, storeWindow } = createDI();

      const fakeAction = (currentState: testState, newValue: string) => {
        return { ...currentState, foo: newValue };
      };

      const store = new Store<testState>({ foo: "bar " }, logger, storeWindow, {
        devToolsOptions: {
          actionCreators: { "FakeAction": fakeAction }
        }
      });

      store.registerAction("FakeAction", fakeAction);

      const devtools = ((store as any).devTools as DevToolsMock);

      assert.equal(devtools.subscriptions.length, 1);

      devtools.subscriptions[0]({
        type: "ACTION",
        state: null,
        payload: { name: "FakeAction", args: [null, devToolsValue].map((arg) => JSON.stringify(arg)) }
      });

      store.state.pipe(skip(1)).subscribe((state) => {
        assert.deepEqual(state.foo, devToolsValue);
        done();
      });
    });

    it("should detect action by function name if not found via registered type", function (done) {
      const devToolsValue = "dispatched value by devtools";

      const { logger, storeWindow } = createDI();

      const fakeAction = (currentState: testState, newValue: string) => {
        return { ...currentState, foo: newValue };
      };

      const store = new Store<testState>({ foo: "bar " }, logger, storeWindow, {
        devToolsOptions: {
          actionCreators: { "Foobert": fakeAction }
        }
      });

      store.registerAction("FakeAction", fakeAction);

      const devtools = ((store as any).devTools as DevToolsMock);

      assert.equal(devtools.subscriptions.length, 1);

      devtools.subscriptions[0]({
        type: "ACTION",
        state: null,
        payload: { name: "fakeAction", args: [null, devToolsValue].map((arg) => JSON.stringify(arg)) }
      });

      store.state.pipe(skip(1)).subscribe((state) => {
        assert.deepEqual(state.foo, devToolsValue);
        done();
      });
    });

    it("should throw when dispatching an unregistered action", function () {
      const { logger, storeWindow } = createDI();

      const fakeAction = (currentState: testState, newValue: string) => {
        return { ...currentState, foo: newValue };
      };

      const store = new Store<testState>({ foo: "bar " }, logger, storeWindow, {
        devToolsOptions: {
          actionCreators: { "FakeAction": fakeAction }
        }
      });

      const devtools = ((store as any).devTools as DevToolsMock);

      assert.equal(devtools.subscriptions.length, 1);
      assert.throws(() => {
        devtools.subscriptions[0]({
          type: "ACTION",
          state: null,
          payload: { name: "FakeAction", args: [null, "foobar"].map((arg) => JSON.stringify(arg)) }
        });
      }, DevToolsRemoteDispatchError);
    });

    it("should throw when no arguments are provided", function () {
      const { logger, storeWindow } = createDI();

      const fakeAction = (currentState: testState, newValue: string) => {
        return { ...currentState, foo: newValue };
      };

      const store = new Store<testState>({ foo: "bar " }, logger, storeWindow, {
        devToolsOptions: {
          actionCreators: { "FakeAction": fakeAction }
        }
      });

      store.registerAction("FakeAction", fakeAction);

      const devtools = ((store as any).devTools as DevToolsMock);

      assert.equal(devtools.subscriptions.length, 1);
      assert.throws(() => {
        devtools.subscriptions[0]({
          type: "ACTION",
          state: null,
          payload: { name: "FakeAction", args: [] }
        });
      }, DevToolsRemoteDispatchError);
    });
  });
});
