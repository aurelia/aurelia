import {
  applyLimits,
  executeSteps,
  jump,
  nextStateHistory,
  StateHistory
} from "@aurelia/store-v1";
import { assert } from "@aurelia/testing";

import {
  createStoreWithStateAndOptions,
  createUndoableTestStore,
  testState
} from "./helpers.js";

describe("an undoable store", function () {
  it("should throw if state is not matching type of StateHistory", function () {
    const simpleState: testState = {
      foo: "Bar"
    };

    assert.throws(() => jump(simpleState as any, 0));
  });

  it("should return state as is from applyLimits if not matching type of StateHistory", function () {
    const simpleState: testState = {
      foo: "Bar"
    };

    assert.equal(applyLimits(simpleState, 0), simpleState);
  });

  it("should jump back and forth in time", async function () {
    const { store } = createUndoableTestStore();

    const actionA = async (currentState: StateHistory<testState>) => Promise.resolve(nextStateHistory(currentState, { foo: "A" }));
    const actionB = async (currentState: StateHistory<testState>) => Promise.resolve(nextStateHistory(currentState, { foo: "B" }));
    const actionC = async (currentState: StateHistory<testState>) => Promise.resolve(nextStateHistory(currentState, { foo: "C" }));
    store.registerAction("Action A", actionA);
    store.registerAction("Action B", actionB);
    store.registerAction("Action C", actionC);

    await executeSteps(
      store,
      false,
      async () => store.dispatch(actionA),
      (res) => { assert.equal(res.present.foo, "A"); store.dispatch(actionB).catch(() => { /**/ }); },
      (res) => { assert.equal(res.present.foo, "B"); store.dispatch(actionC).catch(() => { /**/ }); },
      (res) => { assert.equal(res.present.foo, "C"); store.dispatch(jump, -1).catch(() => { /**/ }); },
      (res) => { assert.equal(res.present.foo, "B"); store.dispatch(jump, 1).catch(() => { /**/ }); },
      (res) => assert.equal(res.present.foo, "C")
    );
  });

  it("should return the same state if jumping zero times", async function () {
    const { store } = createUndoableTestStore();
    const actionA = async (currentState: StateHistory<testState>) => Promise.resolve(nextStateHistory(currentState, { foo: "A" }));
    const actionB = async (currentState: StateHistory<testState>) => Promise.resolve(nextStateHistory(currentState, { foo: "B" }));

    store.registerAction("Action A", actionA);
    store.registerAction("Action B", actionB);

    await executeSteps(
      store,
      false,
      async () => store.dispatch(actionA),
      (res) => { assert.equal(res.present.foo, "A"); store.dispatch(actionB).catch(() => { /**/ }); },
      (res) => { assert.equal(res.present.foo, "B"); store.dispatch(jump, 0).catch(() => { /**/ }); },
      (res) => assert.equal(res.present.foo, "B")
    );
  });

  it("should return the same state if jumping too far into future", async function () {
    const { store } = createUndoableTestStore();
    const actionA = async (currentState: StateHistory<testState>) => Promise.resolve(nextStateHistory(currentState, { foo: "A" }));
    const actionB = async (currentState: StateHistory<testState>) => Promise.resolve(nextStateHistory(currentState, { foo: "B" }));

    store.registerAction("Action A", actionA);
    store.registerAction("Action B", actionB);

    await executeSteps(
      store,
      false,
      async () => store.dispatch(actionA),
      (res) => { assert.equal(res.present.foo, "A"); store.dispatch(actionB).catch(() => { /**/ }); },
      (res) => { assert.equal(res.present.foo, "B"); store.dispatch(jump, 3).catch(() => { /**/ }); },
      (res) => assert.equal(res.present.foo, "B")
    );
  });

  it("should return the same state if jumping too far into past", async function () {
    const { store } = createUndoableTestStore();
    const actionA = async (currentState: StateHistory<testState>) => Promise.resolve(nextStateHistory(currentState, { foo: "A" }));
    const actionB = async (currentState: StateHistory<testState>) => Promise.resolve(nextStateHistory(currentState, { foo: "B" }));

    store.registerAction("Action A", actionA);
    store.registerAction("Action B", actionB);

    await executeSteps(
      store,
      false,
      async () => store.dispatch(actionA),
      (res) => { assert.equal(res.present.foo, "A"); store.dispatch(actionB).catch(() => { /**/ }); },
      (res) => { assert.equal(res.present.foo, "B"); store.dispatch(jump, -3).catch(() => { /**/ }); },
      (res) => assert.equal(res.present.foo, "B")
    );
  });

  it("should limit the resulting states past if option is passed", async function () {
    const initialState: StateHistory<testState> = {
      past: [],
      present: { foo: "bar" },
      future: []
    };
    const limit = 3;
    const store = createStoreWithStateAndOptions(initialState, { history: { undoable: true, limit } });
    const fakeAction = async (currentState: StateHistory<testState>, idx: number) => Promise.resolve(nextStateHistory(currentState, { foo: idx.toString() }));

    store.registerAction("FakeAction", fakeAction);

    await executeSteps(
      store,
      false,
      ...Array.from(new Array(limit + limit)).map((_, idx) => {
        return (res: StateHistory<testState>) => {
          store.dispatch(fakeAction, idx + 1).catch(() => { /**/ });

          assert.equal(res.past.length, idx >= limit ? limit : idx);
        };
      }),
      (res) => {
        assert.equal(res.past.length, limit);
        assert.deepEqual(res.past.map(i => i.foo), Array.from(new Array(limit)).map((_, idx) => (limit + idx).toString()));
      }
    );
  });

  it("should limit the resulting states future if option is passed", async function () {
    const initialState: StateHistory<testState> = {
      past: [],
      present: { foo: "bar" },
      future: []
    };
    const limit = 3;
    const store = createStoreWithStateAndOptions(initialState, { history: { undoable: true, limit } });
    const stateAfterInitial = {
      past: Array.from(new Array(limit)).map((_, idx) => ({ foo: idx.toString() })),
      present: { foo: "x" },
      future: Array.from(new Array(limit)).map((_, idx) => ({ foo: (limit + idx).toString() }))
    };

    const fakeAction = async (_: StateHistory<testState>) => {
      return Promise.resolve(stateAfterInitial);
    };

    store.registerAction("FakeAction", fakeAction);

    await executeSteps(
      store,
      false,
      async () => store.dispatch(fakeAction),
      (res) => { assert.equal(res, stateAfterInitial); store.dispatch(jump, - limit).catch(() => { /**/ }); },
      (res) => {
        assert.equal(res.future.length, limit);
        assert.equal(res.present, stateAfterInitial.past[0]);
        assert.deepEqual(res.past, []);
        assert.deepEqual(res.future, [ ...stateAfterInitial.past.slice(1), stateAfterInitial.present]);
      }
    );
  });
});
