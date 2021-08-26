import { skip, take } from "rxjs/operators";

import { assert } from '@aurelia/testing';
import {
  MiddlewarePlacement,
  logMiddleware,
  localStorageMiddleware,
  rehydrateFromLocalStorage,
  Middleware,
  StateHistory,
  executeSteps,
  LogLevel,
  STORE
} from "@aurelia/store-v1";

import {
  createStoreWithState,
  createStoreWithStateAndOptions,
  createCallCounter
} from "./helpers.js";

function mockLocalStorage(patch: unknown) {
  Object.defineProperty(globalThis, "localStorage", {
    value: patch,
    configurable: true
  });
}

describe("middlewares", function () {
  this.timeout(100);
  this.beforeEach(function () {
    STORE.container = null!;
  });

  interface TestState {
    counter: number;
  }

  const initialState: TestState = {
    counter: 1
  };

  const initialHistoryState: StateHistory<TestState> = {
    past: [],
    present: { counter: 1 },
    future: [],
  };

  const incrementAction = (currentState: TestState) => {
    const newState = { ...currentState };
    newState.counter++;

    return newState;
  };

  it("should allow registering middlewares without parameters", function () {
    const store = createStoreWithState(initialState);
    const noopMiddleware = () => { /**/ };

    assert.doesNotThrow(() => store.registerMiddleware(noopMiddleware, MiddlewarePlacement.Before));
  });

  it("should allow registering middlewares with additional settings", async function () {
    const store = createStoreWithState(initialState);
    const fakeSettings = { foo: "bar" };
    const settingsMiddleware = (_: TestState, __: TestState | undefined, settings: typeof fakeSettings) => {
      try {
        assert.equal(settings.foo, fakeSettings.foo);
      } catch {
        assert.fail("No settings were passed");
      }
    };

    assert.doesNotThrow(() => store.registerMiddleware(settingsMiddleware, MiddlewarePlacement.Before, fakeSettings));

    store.registerAction("IncrementAction", incrementAction);

    await store.dispatch(incrementAction);
  });

  it("should allow unregistering middlewares", async function () {
    const store = createStoreWithState(initialState);
    const decreaseBefore = (currentState: TestState) => {
      const newState = { ...currentState };
      newState.counter += 1000;

      return newState;
    };

    store.registerMiddleware(decreaseBefore, MiddlewarePlacement.Before);
    store.registerAction("IncrementAction", incrementAction);

    await executeSteps(
      store,
      false,
      async () => store.dispatch(incrementAction),
      (res: TestState) => {
        assert.equal(res.counter, 1002);
        store.unregisterMiddleware(decreaseBefore);
        store.dispatch(incrementAction).catch(() => { /**/ });
      },
      (res: TestState) => assert.equal(res.counter, 1003)
    );
  });

  it("should not try to delete previously unregistered middlewares", function () {
    const store = createStoreWithState(initialState, false);
    (store as any).middlewares.delete = () => assert.fail("actually tried to delete non existing middleware");

    const decreaseBefore = (currentState: TestState) => {
      const newState = { ...currentState };
      newState.counter -= 1000;

      return newState;
    };

    store.registerAction("IncrementAction", incrementAction);
    store.unregisterMiddleware(decreaseBefore);
  });

  it("should allow checking for registered middlewares", function () {
    const store = createStoreWithState(initialState);
    const testMiddleware = (): false => {
      return false;
    };

    store.registerMiddleware(testMiddleware, MiddlewarePlacement.Before);
    assert.equal(store.isMiddlewareRegistered(testMiddleware), true);
  });

  it("should have a reference to the calling action name and its parameters", async function () {
    const store = createStoreWithStateAndOptions<TestState>(initialState, { propagateError: true });
    const expectedActionName = "ActionObservedByMiddleware";

    const actionObservedByMiddleware = (state: TestState, foo: string, bar: string) => {
      return { ...state, counter: foo.length + bar.length };
    };

    const actionAwareMiddleware: Middleware<TestState> = (_, __, ___, action) => {
      assert.equal(action.name, expectedActionName);
      assert.deepEqual(action.params, ["A", "B"]);
    };

    store.registerAction(expectedActionName, actionObservedByMiddleware);
    store.registerMiddleware(actionAwareMiddleware, MiddlewarePlacement.After);

    await executeSteps(
      store,
      false,
      async () => store.dispatch(actionObservedByMiddleware, "A", "B"),
      (res: TestState) => { assert.equal(res.counter, 2); }
    );
  });

  it("should have a reference all piped actions", async function () {
    const store = createStoreWithStateAndOptions<TestState>(initialState, { propagateError: true });
    const expectedActionName1 = "FirstActionObservedByMiddleware";
    const expectedActionName2 = "SecondActionObservedByMiddleware";

    const firstActionObservedByMiddleware = (state: TestState, _foo: string) => state;
    const secondActionObservedByMiddleware = (state: TestState, _bar: string) => state;

    const actionAwareMiddleware: Middleware<TestState> = (_, __, ___, action) => {
      assert.equal(action.name, `${expectedActionName1}->${expectedActionName2}`);
      assert.deepEqual(action.params, ["A", "B"]);
      assert.deepEqual(action.pipedActions, [
        { name: expectedActionName1, params: ["A"] },
        { name: expectedActionName2, params: ["B"] }
      ]);
    };

    store.registerAction(expectedActionName1, firstActionObservedByMiddleware);
    store.registerAction(expectedActionName2, secondActionObservedByMiddleware);
    store.registerMiddleware(actionAwareMiddleware, MiddlewarePlacement.After);

    await executeSteps(
      store,
      false,
      async () => store
        .pipe(firstActionObservedByMiddleware, "A")
        .pipe(secondActionObservedByMiddleware, "B")
        .dispatch()
    );
  });

  describe("which are applied before action dispatches", function () {
    it("should synchronously change the provided present state", async function () {
      const store = createStoreWithState(initialState);

      const decreaseBefore = (currentState: TestState) => {
        const newState = { ...currentState };
        newState.counter--;

        return newState;
      };

      store.registerMiddleware(decreaseBefore, MiddlewarePlacement.Before);

      store.registerAction("IncrementAction", incrementAction);
      store.dispatch(incrementAction).catch(() => { /**/ });

      await new Promise<void>((resolve) => {
        store.state.subscribe((state) => {
          assert.equal(state.counter, 1);
          resolve();
        });
      }).catch(() => assert.fail("did not work :("));
    });

    it("should support async middlewares", async function () {
      const store = createStoreWithState(initialState);

      const decreaseBefore = async (currentState: TestState) => {
        const newState = { ...currentState };
        newState.counter = 0;

        return Promise.resolve(newState);
      };

      store.registerMiddleware(decreaseBefore, MiddlewarePlacement.Before);

      store.registerAction("IncrementAction", incrementAction);
      store.dispatch(incrementAction).catch(() => { /**/ });

      await new Promise<void>((resolve) => {
        store.state.subscribe((state) => {
          assert.equal(state.counter, 1);
          resolve();
        });
      }).catch(() => assert.fail("did not work :("));
    });

    it("should get additionally the original state, before prev modifications passed in", function (done) {
      const store = createStoreWithState(initialState);

      const decreaseBefore = (currentState: TestState, originalState?: TestState) => {
        const newState = { ...currentState };
        newState.counter = originalState.counter;

        return newState;
      };

      store.registerMiddleware(decreaseBefore, MiddlewarePlacement.Before);

      const resetBefore = (currentState: TestState, originalState?: TestState) => {
        assert.equal(currentState.counter, 0);
        return originalState;
      };

      store.registerMiddleware(resetBefore, MiddlewarePlacement.Before);

      store.registerAction("IncrementAction", incrementAction);
      store.dispatch(incrementAction).catch(() => { /**/ });

      store.state.pipe(
        skip(1),
        take(1)
      ).subscribe((state) => {
        assert.equal(state.counter, 2);
        done();
      });
    });
  });

  describe("which are applied after the action dispatches", function () {
    it("should synchronously change the resulting state", function (done) {
      const store = createStoreWithState(initialState);

      const decreaseBefore = (currentState: TestState) => {
        const newState = { ...currentState };
        newState.counter = 1000;

        return newState;
      };

      store.registerMiddleware(decreaseBefore, MiddlewarePlacement.After);

      store.registerAction("IncrementAction", incrementAction);
      store.dispatch(incrementAction).catch(() => { /**/ });

      store.state.pipe(
        skip(1),
        take(1)
      ).subscribe((state) => {
        assert.equal(state.counter, 1000);
        done();
      });
    });

    it("should asynchronously change the resulting state", function (done) {
      const store = createStoreWithState(initialState);

      const fixedValueAfter = async (currentState: TestState) => {
        const newState = { ...currentState };
        newState.counter = 1000;

        return Promise.resolve(newState);
      };

      store.registerMiddleware(fixedValueAfter, MiddlewarePlacement.After);

      store.registerAction("IncrementAction", incrementAction);
      store.dispatch(incrementAction).catch(() => { /**/ });

      store.state.pipe(
        skip(1),
        take(1)
      ).subscribe((state) => {
        assert.equal(state.counter, 1000);
        done();
      });
    });

    it("should get additionally the original state, before prev modifications passed in", function (done) {
      const store = createStoreWithState(initialState);

      const decreaseAfter = (currentState: TestState, originalState: TestState | undefined) => {
        const newState = { ...currentState };
        newState.counter = originalState.counter;

        return newState;
      };

      store.registerMiddleware(decreaseAfter, MiddlewarePlacement.After);

      store.registerAction("IncrementAction", incrementAction);
      store.dispatch(incrementAction).catch(() => { /**/ });

      store.state.pipe(
        skip(1),
        take(1)
      ).subscribe((state) => {
        assert.equal(state.counter, 1);
        done();
      });
    });
  });

  it("should handle throwing middlewares and maintain queue", function (done) {
    const store = createStoreWithState(initialState);
    const decreaseBefore = () => {
      throw new Error("Failed on purpose");
    };

    store.registerMiddleware(decreaseBefore, MiddlewarePlacement.Before);

    store.registerAction("IncrementAction", incrementAction);
    store.dispatch(incrementAction).catch(() => { /**/ });

    store.state.pipe(
      skip(1)
    ).subscribe((state: TestState) => {
      assert.equal(state.counter, 2);
      done();
    });
  });

  it("should not swallow errors from middlewares and interrupt queue if option provided", async function () {
    const errorMsg = "Failed on purpose";
    const store = createStoreWithStateAndOptions(initialState, { propagateError: true });
    const decreaseBefore = () => {
      throw new Error(errorMsg);
    };
    store.registerMiddleware(decreaseBefore, MiddlewarePlacement.Before);

    store.registerAction("IncrementAction", incrementAction);

    try {
      await store.dispatch(incrementAction);
    } catch (e) {
      assert.equal(e.message, errorMsg);
    }
  });

  it("should interrupt queue action if middleware returns sync false", async function () {
    const store = createStoreWithStateAndOptions(initialState, {});
    const { spyObj } = createCallCounter(store['_state'], "next");
    const syncFalseMiddleware = (): false => {
      return false;
    };
    store.registerMiddleware(syncFalseMiddleware, MiddlewarePlacement.Before);
    store.registerAction("IncrementAction", incrementAction);

    await store.dispatch(incrementAction);

    assert.equal(spyObj.callCounter, 0);
  });

  it("should interrupt queue action if after placed middleware returns sync false", async function () {
    const store = createStoreWithStateAndOptions(initialState, {});
    const { spyObj } = createCallCounter(store['_state'], "next");
    const syncFalseMiddleware = (): false => {
      return false;
    };
    store.registerMiddleware(syncFalseMiddleware, MiddlewarePlacement.After);
    store.registerAction("IncrementAction", incrementAction);

    await store.dispatch(incrementAction);

    assert.equal(spyObj.callCounter, 0);
  });

  it("should interrupt queue action if middleware returns async false", async function () {
    const store = createStoreWithStateAndOptions(initialState, {});
    const { spyObj } = createCallCounter(store['_state'], "next");
    const syncFalseMiddleware = async (): Promise<false> => {
      return Promise.resolve<false>(false);
    };
    store.registerMiddleware(syncFalseMiddleware, MiddlewarePlacement.Before);
    store.registerAction("IncrementAction", incrementAction);

    await store.dispatch(incrementAction);

    assert.equal(spyObj.callCounter, 0);
  });

  it("should not continue with next middleware if error propagation is turned on", async function () {
    const errorMsg = "Failed on purpose";
    const store = createStoreWithStateAndOptions(initialState, { propagateError: true });
    let secondMiddlewareIsCalled = false;
    const firstMiddleware = () => {
      throw new Error(errorMsg);
    };
    const secondMiddleware = () => {
      secondMiddlewareIsCalled = true;
    };
    store.registerMiddleware(firstMiddleware, MiddlewarePlacement.Before);
    store.registerMiddleware(secondMiddleware, MiddlewarePlacement.Before);

    store.registerAction("IncrementAction", incrementAction);

    try {
      await store.dispatch(incrementAction);
    } catch (e) {
      assert.equal(e.message, errorMsg);
    }

    assert.equal(secondMiddlewareIsCalled, false);
  });

  it("should handle multiple middlewares", function (done) {
    const store = createStoreWithState(initialState);

    const middlewareFactory = (increaseByX: number) => (currentState: TestState) => {
      const newState = { ...currentState };
      newState.counter += increaseByX;

      return newState;
    };

    const increaseByTwoBefore = middlewareFactory(2);
    const increaseByTenBefore = middlewareFactory(10);

    store.registerMiddleware(increaseByTwoBefore, MiddlewarePlacement.Before);
    store.registerMiddleware(increaseByTenBefore, MiddlewarePlacement.Before);

    store.registerAction("IncrementAction", incrementAction);
    store.dispatch(incrementAction).catch(() => { /**/ });

    store.state.pipe(
      skip(1),
      take(1)
    ).subscribe((state) => {
      assert.equal(state.counter, 14);
      done();
    });
  });

  it("should maintain the order of applying middlewares", function (done) {
    interface State {
      values: string[];
    }
    const initState: State = {
      values: []
    };
    const store = createStoreWithState(initState);

    const middlewareFactory = (value: string) => (currentState: State) => {
      const newState = { ...currentState };
      newState.values.push(value);

      return newState;
    };

    new Array(26).fill("")
      .forEach((_, idx) => store.registerMiddleware(
        middlewareFactory(String.fromCharCode(65 + idx)),
        MiddlewarePlacement.After)
      );

    const demoAction = (currentState: State) => {
      const newState = { ...currentState };
      newState.values.push("Demo");

      return newState;
    };

    store.registerAction("Demo", demoAction);
    store.dispatch(demoAction).catch(() => { /**/ });

    store.state.pipe(
      skip(1),
      take(1)
    ).subscribe((state) => {
      assert.deepEqual(state.values, ["Demo", ...new Array(26).fill("").map((_, idx) => String.fromCharCode(65 + idx))]);
      done();
    });
  });

  it("should handle middlewares not returning a state", async function () {
    const store = createStoreWithState(initialState);

    const { spyObj } = createCallCounter(console, "log", false);

    const customLogMiddleware = (currentState: TestState) => console.log(currentState);
    store.registerMiddleware(customLogMiddleware, MiddlewarePlacement.Before);

    store.registerAction("IncrementAction", incrementAction);
    store.dispatch(incrementAction).catch(() => { /**/ });

    await new Promise<void>((resolve) => {
      store.state.pipe(
        skip(1)
      ).subscribe(() => {
        assert.greaterThanOrEqualTo(spyObj.callCounter, 1);
        spyObj.reset();
        resolve();
      });
    }).catch(() => { assert.fail("Did not call console in test middleware"); });
  });

  describe("default implementation", function () {
    it("should provide a default log middleware", function (done) {
      const store = createStoreWithState(initialState);
      const { spyObj } = createCallCounter(console, "log", false);

      store.registerMiddleware(logMiddleware, MiddlewarePlacement.After);

      store.registerAction("IncrementAction", incrementAction);
      store.dispatch(incrementAction).catch(() => { /**/ });

      store.state.pipe(
        skip(1)
      ).subscribe((state) => {
        assert.equal(state.counter, 2);
        assert.greaterThanOrEqualTo(spyObj.callCounter, 1);
        spyObj.reset();

        done();
      });
    });

    it("should accept settinsg to override the log behavior for the log middleware", function (done) {
      const store = createStoreWithState(initialState);
      const { spyObj } = createCallCounter(console, "warn", false);

      store.registerMiddleware(logMiddleware, MiddlewarePlacement.After, { logType: LogLevel.warn });

      store.registerAction("IncrementAction", incrementAction);
      store.dispatch(incrementAction).catch(() => { /**/ });

      store.state.pipe(
        skip(1)
      ).subscribe((state) => {
        assert.equal(state.counter, 2);
        assert.greaterThanOrEqualTo(spyObj.callCounter, 1);
        spyObj.reset();

        done();
      });
    });

    it("should provide a localStorage middleware", function (done) {
      const store = createStoreWithState(initialState);

      mockLocalStorage({
        store: { foo: "bar" },
        getItem(key: string) {
          return this.store[key] || null;
        },
        setItem(key: string, value: string) {
          this.store[key] = value;
        }
      });

      store.registerMiddleware(localStorageMiddleware, MiddlewarePlacement.After);

      store.registerAction("IncrementAction", incrementAction);
      store.dispatch(incrementAction).catch(() => { /**/ });

      store.state.pipe(
        skip(1)
      ).subscribe((state) => {
        assert.equal(state.counter, 2);
        assert.equal(globalThis.localStorage.getItem("aurelia-store-state"), JSON.stringify(state));
        done();
      });
    });

    it("should provide a localStorage middleware supporting a custom key", function (done) {
      const store = createStoreWithState(initialState);
      const storageKey = "foobar";
      mockLocalStorage({
        store: { foo: "bar" },
        getItem(key: string) {
          return this.store[key] || null;
        },
        setItem(key: string, value: string) {
          this.store[key] = value;
        }
      });

      store.registerMiddleware(localStorageMiddleware, MiddlewarePlacement.After, { key: storageKey });

      store.registerAction("IncrementAction", incrementAction);
      store.dispatch(incrementAction).catch(() => { /**/ });

      store.state.pipe(
        skip(1)
      ).subscribe((state) => {
        assert.equal(state.counter, 2);
        assert.equal(globalThis.localStorage.getItem(storageKey), JSON.stringify(state));
        done();
      });
    });

    it("should rehydrate state from localStorage", function (done) {
      const store = createStoreWithState(initialState);

      mockLocalStorage({
        getItem() {
          const storedState = { ...initialState };
          storedState.counter = 1000;

          return JSON.stringify(storedState);
        }
      });

      store.registerMiddleware(localStorageMiddleware, MiddlewarePlacement.After);
      store.registerAction("Rehydrate", rehydrateFromLocalStorage);
      store.dispatch(rehydrateFromLocalStorage).catch(() => { /**/ });

      store.state.pipe(
        skip(1)
      ).subscribe((state) => {
        assert.equal(state.counter, 1000);
        done();
      });
    });

    it("should rehydrate state from localStorage using a custom key", function (done) {
      const store = createStoreWithState(initialState);
      const key = "foobar";

      mockLocalStorage({
        getItem() {
          const storedState = { ...initialState };
          storedState.counter = 1000;

          return JSON.stringify(storedState);
        }
      });

      store.registerMiddleware(localStorageMiddleware, MiddlewarePlacement.After, { key });
      store.registerAction("Rehydrate", rehydrateFromLocalStorage);
      store.dispatch(rehydrateFromLocalStorage).catch(() => { /**/ });

      store.state.pipe(
        skip(1)
      ).subscribe((state) => {
        assert.equal(state.counter, 1000);
        done();
      });
    });

    it("should rehydrate from previous state if localStorage is not available", function (done) {
      const store = createStoreWithState(initialState);

      mockLocalStorage(undefined);

      store.registerMiddleware(localStorageMiddleware, MiddlewarePlacement.After);
      store.registerAction("Rehydrate", rehydrateFromLocalStorage);
      store.dispatch(rehydrateFromLocalStorage).catch(() => { /**/ });

      store.state.pipe(
        skip(1)
      ).subscribe((state) => {
        assert.equal(state.counter, 1);
        done();
      });
    });

    it("should rehydrate from previous state if localStorage is empty", function (done) {
      const store = createStoreWithState(initialState);

      mockLocalStorage({
        getItem() {
          return null;
        }
      });

      store.registerMiddleware(localStorageMiddleware, MiddlewarePlacement.After);
      store.registerAction("Rehydrate", rehydrateFromLocalStorage);
      store.dispatch(rehydrateFromLocalStorage).catch(() => { /**/ });

      store.state.pipe(
        skip(1)
      ).subscribe((state) => {
        assert.equal(state.counter, 1);
        done();
      });
    });

    it("should rehydrate from history state", function (done) {
      const store = createStoreWithState(initialHistoryState, true);

      mockLocalStorage({
        getItem() {
          const storedState = { ...initialState };
          storedState.counter = 1000;

          return JSON.stringify({ past: [], present: storedState, future: [] });
        }
      });

      store.registerMiddleware(localStorageMiddleware, MiddlewarePlacement.After);
      store.registerAction("Rehydrate", rehydrateFromLocalStorage);
      store.dispatch(rehydrateFromLocalStorage).catch(() => { /**/ });

      store.state.pipe(
        skip(1)
      ).subscribe((state) => {
        assert.equal(state.present.counter, 1000);
        done();
      });
    });

    it("should return the previous state if localStorage state cannot be parsed", function (done) {
      const store = createStoreWithState(initialState);

      mockLocalStorage({
        getItem() {
          return typeof globalThis !== 'undefined' ? globalThis : window;
        }
      });

      store.registerMiddleware(localStorageMiddleware, MiddlewarePlacement.After);
      store.registerAction("Rehydrate", rehydrateFromLocalStorage);
      store.dispatch(rehydrateFromLocalStorage).catch(() => {/* empt */});

      store.state.pipe(
        skip(1)
      ).subscribe((state) => {
        assert.equal(state.counter, 1);
        done();
      });
    });
  });
});
