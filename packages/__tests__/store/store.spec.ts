import { skip } from "rxjs/operators";
import {
  LogLevel,
  PerformanceMeasurement,
  UnregisteredActionError,
  ActionRegistrationError,
  ReducerNoStateError
} from "@aurelia/store";

import {
  createTestStore,
  testState,
  createStoreWithStateAndOptions,
  createCallCounter
} from "./helpers";
import { assert } from '@aurelia/testing';

describe("store", function () {
  it("should accept an initial state", function (done) {
    const { initialState, store } = createTestStore();

    store.state.subscribe((state) => {
      assert.equal(state, initialState);
      done();
    });
  });

  it("should fail when dispatching unknown actions", function () {
    const { store } = createTestStore();
    const unregisteredAction = (currentState: testState, param1: number, param2: number) => {
      return { ...currentState, foo: param1 + param2 };
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    assert.rejects(() => (store.dispatch as any)(unregisteredAction), UnregisteredActionError);
  });

  it("should fail when dispatching non actions", function () {
    const { store } = createTestStore();

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    assert.rejects(async () => store.dispatch(undefined as any), UnregisteredActionError);
  });

  it("should only accept reducers taking at least one parameter", function () {
    const { store } = createTestStore();
    const fakeAction = () => { /**/ };

    assert.throws(() => {
      store.registerAction("FakeAction", fakeAction as any);
    }, ActionRegistrationError);
  });

  it("should force reducers to return a new state", function () {
    const { store } = createTestStore();
    const fakeAction = (_: testState) => { /**/ };

    store.registerAction("FakeAction", fakeAction as any);
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    assert.rejects(async () => store.dispatch(fakeAction as any), ReducerNoStateError);
  });

  it("should also accept false and stop queue", async function () {
    const { store } = createTestStore();
    const { spyObj } = createCallCounter((store as any)._state, "next");
    const fakeAction = (_: testState): false => false;

    store.registerAction("FakeAction", fakeAction);
    await store.dispatch(fakeAction).catch(() => { /**/ });

    assert.equal(spyObj.callCounter, 0);
  });

  it("should also accept async false and stop queue", async function () {
    const { store } = createTestStore();
    const { spyObj } = createCallCounter((store as any)._state, "next");
    const fakeAction = async (_: testState): Promise<false> => Promise.resolve<false>(false);

    store.registerAction("FakeAction", fakeAction);
    await store.dispatch(fakeAction);

    assert.equal(spyObj.callCounter, 0);
  });

  it("should unregister previously registered actions", async function () {
    const { store } = createTestStore();
    const fakeAction = (currentState: testState) => currentState;

    store.registerAction("FakeAction", fakeAction);
    await store.dispatch(fakeAction);

    store.unregisterAction(fakeAction);
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    assert.rejects(async () => store.dispatch(fakeAction), UnregisteredActionError);
  });

  it("should not try to unregister previously unregistered actions", function () {
    const { store } = createTestStore();
    const fakeAction = (currentState: testState) => currentState;

    try {
      store.unregisterAction(fakeAction);
    } catch {
      assert.fail("threw error instead");
    }
  });

  it("should allow checking for already registered functions via Reducer", function () {
    const { store } = createTestStore();
    const fakeAction = (currentState: testState) => currentState;

    store.registerAction("FakeAction", fakeAction);
    assert.equal(store.isActionRegistered(fakeAction), true);
  });

  it("should allow checking for already registered functions via previously registered name", function () {
    const { store } = createTestStore();
    const fakeAction = (currentState: testState) => currentState;

    store.registerAction("FakeAction", fakeAction);
    assert.equal(store.isActionRegistered("FakeAction"), true);
  });

  it("should accept reducers taking multiple parameters", function (done) {
    const { store } = createTestStore();
    const fakeAction = (currentState: testState, param1: string, param2: string) => {
      return { ...currentState, foo: param1 + param2 };
    };

    store.registerAction("FakeAction", fakeAction as any);
    store.dispatch(fakeAction, "A", "B").catch(() => { /**/ });

    store.state.pipe(
      skip(1)
    ).subscribe((state) => {
      assert.equal(state.foo, "AB");
      done();
    });
  });

  it("should queue the next state after dispatching an action", function (done) {
    const { store } = createTestStore();
    const modifiedState = { foo: "bert" };
    const fakeAction = (currentState: testState) => {
      return { ...currentState, ...modifiedState };
    };

    store.registerAction("FakeAction", fakeAction);
    store.dispatch(fakeAction).catch(() => { /**/ });

    store.state.pipe(
      skip(1)
    ).subscribe((state) => {
      assert.deepEqual(state, modifiedState);
      done();
    });
  });

  it("should the previously registered action name as dispatch argument", function (done) {
    const { store } = createTestStore();
    const modifiedState = { foo: "bert" };
    const fakeAction = async (_: testState) => Promise.resolve(modifiedState);
    const fakeActionRegisteredName = "FakeAction";

    store.registerAction(fakeActionRegisteredName, fakeAction);
    store.dispatch(fakeActionRegisteredName).catch(() => { /**/ });

    // since the async action is coming at a later time we need to skip the initial state
    store.state.pipe(
      skip(1)
    ).subscribe((state) => {
      assert.deepEqual(state, modifiedState);
      done();
    });
  });

  it("should support promised actions", function (done) {
    const { store } = createTestStore();
    const modifiedState = { foo: "bert" };
    const fakeAction = async (_: testState) => Promise.resolve(modifiedState);

    store.registerAction("FakeAction", fakeAction);
    store.dispatch(fakeAction).catch(() => { /**/ });

    // since the async action is coming at a later time we need to skip the initial state
    store.state.pipe(
      skip(1)
    ).subscribe((state) => {
      assert.deepEqual(state, modifiedState);
      done();
    });
  });

  it("should dispatch actions one after another", function (done) {
    const { store } = createTestStore();

    const actionA = async (currentState: testState) => Promise.resolve({ foo: `${currentState.foo}A` });
    const actionB = async (currentState: testState) => Promise.resolve({ foo: `${currentState.foo}B` });

    store.registerAction("Action A", actionA);
    store.registerAction("Action B", actionB);
    store.dispatch(actionA).catch(() => { /**/ });
    store.dispatch(actionB).catch(() => { /**/ });

    store.state.pipe(
      skip(2)
    ).subscribe((state) => {
      assert.equal(state.foo, "barAB");
      done();
    });
  });

  it("should maintain queue of execution in concurrency constraints", function () {
    const { store } = createTestStore();
    createCallCounter((store as any).dispatchQueue, "push");
    const { spyObj } = createCallCounter(store, "handleQueue");

    const actionA = async (_: testState) => Promise.resolve({ foo: "A" });

    store.registerAction("Action A", actionA);
    store.dispatch(actionA).catch(() => { /**/ });

    assert.equal(spyObj.callCounter, 0);
  });

  it("should log info about dispatched action if turned on via options", function () {
    const initialState: testState = {
      foo: "bar"
    };

    const store = createStoreWithStateAndOptions<testState>(initialState, { logDispatchedActions: true });
    const { spyObj: loggerSpy } = createCallCounter((store as any).logger, LogLevel.info);
    const actionA = async (_: testState) => Promise.resolve({ foo: "A" });

    store.registerAction("Action A", actionA);
    store.dispatch(actionA).catch(() => { /**/ });

    assert.equal(loggerSpy.callCounter, 1);
    loggerSpy.reset();
  });

  it("should log info about dispatched action if turned on via options via custom loglevel", function () {
    const initialState: testState = {
      foo: "bar"
    };

    const store = createStoreWithStateAndOptions<testState>(initialState, {
      logDispatchedActions: true,
      logDefinitions: {
        dispatchedActions: LogLevel.debug
      }
    });
    const { spyObj: loggerSpy } = createCallCounter((store as any).logger, LogLevel.debug);

    const actionA = async (_: testState) => Promise.resolve({ foo: "A" });

    store.registerAction("Action A", actionA);
    store.dispatch(actionA).catch(() => { /**/ });

    assert.equal(loggerSpy.callCounter, 1);
    loggerSpy.reset();
  });

  it("should log info about dispatched action and return to default log level if wrong one provided", function () {
    const initialState: testState = {
      foo: "bar"
    };

    const store = createStoreWithStateAndOptions<testState>(initialState, {
      logDispatchedActions: true,
      logDefinitions: {
        dispatchedActions: "foo" as any
      }
    });
    const { spyObj: loggerSpy } = createCallCounter((store as any).logger, LogLevel.info);

    const actionA = async (_: testState) => Promise.resolve({ foo: "A" });

    store.registerAction("Action A", actionA);
    store.dispatch(actionA).catch(() => { /**/ });

    assert.equal(loggerSpy.callCounter, 1);
    loggerSpy.reset();
  });

  it("should log start-end dispatch duration if turned on via options", async function () {
    const initialState: testState = {
      foo: "bar"
    };

    const store = createStoreWithStateAndOptions<testState>(
      initialState,
      { measurePerformance: PerformanceMeasurement.StartEnd }
    );
    const { spyObj: loggerSpy } = createCallCounter((store as any).logger, LogLevel.info, false);

    const actionA = async (_: testState) => {
      return new Promise<testState>((resolve) => {
        setTimeout(() => resolve({ foo: "A" }), 1);
      });
    };

    store.registerAction("Action A", actionA);
    await store.dispatch(actionA);

    assert.typeOf(loggerSpy.lastArgs[0], "string");
    assert.equal(Array.isArray(loggerSpy.lastArgs[1]), true);
  });

  it("should log all dispatch durations if turned on via options", async function () {
    const initialState: testState = {
      foo: "bar"
    };

    const store = createStoreWithStateAndOptions<testState>(
      initialState,
      { measurePerformance: PerformanceMeasurement.All }
    );
    const { spyObj: loggerSpy } = createCallCounter((store as any).logger, LogLevel.info, false);

    const actionA = async (_: testState) => {
      return new Promise<testState>((resolve) => {
        setTimeout(() => resolve({ foo: "A" }), 1);
      });
    };

    store.registerAction("Action A", actionA);
    await store.dispatch(actionA);

    assert.typeOf(loggerSpy.lastArgs[0], "string");
    assert.equal(Array.isArray(loggerSpy.lastArgs[1]), true);
  });

  it("should reset the state without going through the internal dispatch queue", async function () {
    const { initialState, store } = createTestStore();
    const demoAction = (currentState: testState) => {
      return { ...currentState, foo: "demo" };
    };

    store.registerAction("demoAction", demoAction);

    await store.dispatch(demoAction);

    const { spyObj: internalDispatchSpy } = createCallCounter((store as any), "internalDispatch");
    store.resetToState(initialState);

    await new Promise<void>((resolve) => store.state.subscribe((state) => {
      assert.equal(internalDispatchSpy.callCounter, 0);
      assert.equal(state.foo, initialState.foo);

      internalDispatchSpy.reset();
      resolve();
    }));
  });

  describe("piped dispatch", function () {
    it("should fail when dispatching unknown actions", function () {
      const { store } = createTestStore();
      const unregisteredAction = (currentState: testState, param1: string) => {
        return { ...currentState, foo: param1 };
      };

      assert.throws(() => store.pipe(unregisteredAction, "foo"), UnregisteredActionError);
    });

    it("should fail when at least one action is unknown", function () {
      const { store } = createTestStore();
      const fakeAction = (currentState: testState) => ({ ...currentState });
      store.registerAction("FakeAction", fakeAction);
      const unregisteredAction = (currentState: testState, param1: string) => ({ ...currentState, foo: param1 });

      const pipedDispatch = store.pipe(fakeAction);

      assert.throws(() => pipedDispatch.pipe(unregisteredAction, "foo"), UnregisteredActionError);
    });

    it("should fail when dispatching non actions", function () {
      const { store } = createTestStore();

      assert.throws(() => store.pipe(undefined as any), UnregisteredActionError);
    });

    it("should fail when at least one action is no action", function () {
      const { store } = createTestStore();
      const fakeAction = (currentState: testState) => ({ ...currentState });
      store.registerAction("FakeAction", fakeAction);

      const pipedDispatch = store.pipe(fakeAction);

      assert.throws(() => pipedDispatch.pipe(undefined as any), UnregisteredActionError);
    });

    it("should force reducer to return a new state", function () {
      const { store } = createTestStore();
      const fakeAction = (_: testState) => { /**/ };

      store.registerAction("FakeAction", fakeAction as any);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      assert.rejects(async () => store.pipe(fakeAction as any).dispatch(), ReducerNoStateError);
    });

    it("should force all reducers to return a new state", function () {
      const { store } = createTestStore();
      const fakeActionOk = (currentState: testState) => ({ ...currentState });
      const fakeActionNok = (_: testState) => { /**/ };
      store.registerAction("FakeActionOk", fakeActionOk);
      store.registerAction("FakeActionNok", fakeActionNok as any);

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      assert.rejects(async () => store.pipe(fakeActionNok as any).pipe(fakeActionOk).dispatch(), ReducerNoStateError);
    });

    it("should also accept false and stop queue", function () {
      const { store } = createTestStore();
      const { spyObj: nextSpy } = createCallCounter((store as any)._state, "next");
      const fakeAction = (_: testState): false => false;

      store.registerAction("FakeAction", fakeAction);
      store.pipe(fakeAction).dispatch().catch(() => { /**/ });

      assert.equal(nextSpy.callCounter, 0);
    });

    it("should also accept async false and stop queue", function () {
      const { store } = createTestStore();
      const { spyObj: nextSpy } = createCallCounter((store as any)._state, "next");
      const fakeAction = async (_: testState): Promise<false> => Promise.resolve<false>(false);

      store.registerAction("FakeAction", fakeAction);
      store.pipe(fakeAction).dispatch().catch(() => { /**/ });

      assert.equal(nextSpy.callCounter, 0);
    });

    it("should accept reducers taking multiple parameters", function (done) {
      const { store } = createTestStore();
      const fakeAction = (currentState: testState, param1: string, param2: string) => {
        return { ...currentState, foo: param1 + param2 };
      };

      store.registerAction("FakeAction", fakeAction as any);
      store.pipe(fakeAction, "A", "B").dispatch().catch(() => { /**/ });

      store.state.pipe(
        skip(1)
      ).subscribe((state) => {
        assert.equal(state.foo, "AB");
        done();
      });
    });

    it("should queue the next state after dispatching an action", function (done) {
      const { store } = createTestStore();
      const modifiedState = { foo: "bert" };
      const fakeAction = (currentState: testState) => {
        return { ...currentState, ...modifiedState };
      };

      store.registerAction("FakeAction", fakeAction);
      store.pipe(fakeAction).dispatch().catch(() => { /**/ });

      store.state.pipe(
        skip(1)
      ).subscribe((state) => {
        assert.deepEqual(state, modifiedState);
        done();
      });
    });

    it("should accept the previously registered action name as pipe argument", function (done) {
      const { store } = createTestStore();
      const modifiedState = { foo: "bert" };
      const fakeAction = async (_: testState) => Promise.resolve(modifiedState);
      const fakeActionRegisteredName = "FakeAction";

      store.registerAction(fakeActionRegisteredName, fakeAction);
      store.pipe(fakeActionRegisteredName).dispatch().catch(() => { /**/ });

      // since the async action is coming at a later time we need to skip the initial state
      store.state.pipe(
        skip(1)
      ).subscribe((state) => {
        assert.deepEqual(state, modifiedState);
        done();
      });
    });

    it("should not accept an unregistered action name as pipe argument", function () {
      const { store } = createTestStore();
      const unregisteredActionId = "UnregisteredAction";

      assert.throws(() => store.pipe(unregisteredActionId), UnregisteredActionError);
    });

    it("should support promised actions", function (done) {
      const { store } = createTestStore();
      const modifiedState = { foo: "bert" };
      const fakeAction = async (_: testState) => Promise.resolve(modifiedState);

      store.registerAction("FakeAction", fakeAction);
      store.pipe(fakeAction).dispatch().catch(() => { /**/ });

      // since the async action is coming at a later time we need to skip the initial state
      store.state.pipe(
        skip(1)
      ).subscribe((state) => {
        assert.deepEqual(state, modifiedState);
        done();
      });
    });

    it("should dispatch actions one after another", function (done) {
      const { store } = createTestStore();

      const actionA = async (currentState: testState) => Promise.resolve({ foo: `${currentState.foo}A` });
      const actionB = async (currentState: testState) => Promise.resolve({ foo: `${currentState.foo}B` });

      store.registerAction("Action A", actionA);
      store.registerAction("Action B", actionB);
      store.pipe(actionA).dispatch().catch(() => { /**/ });
      store.pipe(actionB).dispatch().catch(() => { /**/ });

      store.state.pipe(
        skip(2)
      ).subscribe((state) => {
        assert.equal(state.foo, "barAB");
        done();
      });
    });

    it("should maintain queue of execution in concurrency constraints", function () {
      const { store } = createTestStore();
      createCallCounter((store as any).dispatchQueue, "push");
      const { spyObj } = createCallCounter(store, "handleQueue");

      const actionA = async (_: testState) => Promise.resolve({ foo: "A" });

      store.registerAction("Action A", actionA);
      store.pipe(actionA).dispatch().catch(() => { /**/ });

      assert.equal(spyObj.callCounter, 0);
    });

    it("should log info about dispatched action if turned on via options", function () {
      const initialState: testState = {
        foo: "bar"
      };

      const store = createStoreWithStateAndOptions<testState>(initialState, { logDispatchedActions: true });
      const { spyObj: loggerSpy } = createCallCounter((store as any).logger, LogLevel.info);

      const actionA = async (_: testState) => Promise.resolve({ foo: "A" });

      store.registerAction("Action A", actionA);
      store.pipe(actionA).dispatch().catch(() => { /**/ });

      assert.equal(loggerSpy.callCounter, 1);
    });

    it("should log info about dispatched action if turned on via options via custom loglevel", function () {
      const initialState: testState = {
        foo: "bar"
      };

      const store = createStoreWithStateAndOptions<testState>(initialState, {
        logDispatchedActions: true,
        logDefinitions: {
          dispatchedActions: LogLevel.debug
        }
      });
      const { spyObj: loggerSpy } = createCallCounter((store as any).logger, LogLevel.debug);
      const actionA = async (_: testState) => Promise.resolve({ foo: "A" });

      store.registerAction("Action A", actionA);
      store.pipe(actionA).dispatch().catch(() => { /**/ });

      assert.equal(loggerSpy.callCounter, 1);
    });

    it("should log info about dispatched action and return to default log level if wrong one provided", function () {
      const initialState: testState = {
        foo: "bar"
      };

      const store = createStoreWithStateAndOptions<testState>(initialState, {
        logDispatchedActions: true,
        logDefinitions: {
          dispatchedActions: "foo" as any
        }
      });
      const { spyObj: loggerSpy } = createCallCounter((store as any).logger, LogLevel.info);
      const actionA = async (_: testState) => Promise.resolve({ foo: "A" });

      store.registerAction("Action A", actionA);
      store.pipe(actionA).dispatch().catch(() => { /**/ });

      assert.equal(loggerSpy.callCounter, 1);
    });

    it("should log start-end dispatch duration if turned on via options", async function () {
      const initialState: testState = {
        foo: "bar"
      };

      const store = createStoreWithStateAndOptions<testState>(
        initialState,
        { measurePerformance: PerformanceMeasurement.StartEnd }
      );
      const { spyObj: loggerSpy } = createCallCounter((store as any).logger, LogLevel.info, false);
      const actionA = async (_: testState) => {
        return new Promise<testState>((resolve) => {
          setTimeout(() => resolve({ foo: "A" }), 1);
        });
      };

      store.registerAction("Action A", actionA);
      await store.pipe(actionA).dispatch();

      assert.typeOf(loggerSpy.lastArgs[0], "string");
      assert.equal(Array.isArray(loggerSpy.lastArgs[1]), true);
    });

    it("should log all dispatch durations if turned on via options", async function () {
      const initialState: testState = {
        foo: "bar"
      };

      const store = createStoreWithStateAndOptions<testState>(
        initialState,
        { measurePerformance: PerformanceMeasurement.All }
      );
      const { spyObj: loggerSpy } = createCallCounter((store as any).logger, LogLevel.info, false);

      const actionA = async (_: testState) => {
        return new Promise<testState>((resolve) => {
          setTimeout(() => resolve({ foo: "A" }), 1);
        });
      };

      store.registerAction("Action A", actionA);
      await store.pipe(actionA).dispatch();

      assert.typeOf(loggerSpy.lastArgs[0], "string");
      assert.equal(Array.isArray(loggerSpy.lastArgs[1]), true);
    });
  });

  describe("internalDispatch", function () {
    it("should throw an error when called with unregistered actions", function () {
      const { store } = createTestStore();
      const unregisteredAction = (currentState: testState, param1: string) => {
        return { ...currentState, foo: param1 };
      };

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      assert.rejects(() => (store as any).internalDispatch([{ reducer: unregisteredAction, params: ["foo"] }]), UnregisteredActionError);
    });

    it("should throw an error when one action of multiple actions is unregistered", function () {
      const { store } = createTestStore();
      const registeredAction = (currentState: testState) => currentState;
      const unregisteredAction = (currentState: testState) => currentState;
      store.registerAction("RegisteredAction", registeredAction);

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      assert.rejects(() => (store as any).internalDispatch([
        { reducer: registeredAction, params: [] },
        { reducer: unregisteredAction, params: [] }
      ]), UnregisteredActionError);
    });

    it("should throw an error about the first of many unregistered actions", function () {
      const { store } = createTestStore();
      const registeredAction = (currentState: testState) => currentState;
      const firstUnregisteredAction = (currentState: testState) => currentState;
      const secondUnregisteredAction = (currentState: testState) => currentState;
      store.registerAction("RegisteredAction", registeredAction);

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      assert.rejects((store as any).internalDispatch([
        { reducer: registeredAction, params: [] },
        { reducer: firstUnregisteredAction, params: [] },
        { reducer: secondUnregisteredAction, params: [] }
      ]), UnregisteredActionError);
    });
  });
});
