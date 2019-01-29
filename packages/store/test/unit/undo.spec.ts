import {
  createStoreWithStateAndOptions,
  createUndoableTestStore,
  testState
} from "./helpers";
import {
  applyLimits,
  jump,
  nextStateHistory
} from "../../src/history";

import { executeSteps } from "../../src/test-helpers";
import { StateHistory } from "../../src/aurelia-store";

describe("an undoable store", () => {
  it("should return state as is if not matching type of StateHistory", () => {
    const simpleState: testState = {
      foo: "Bar"
    };

    expect(jump(simpleState, 0)).toBe(simpleState);
  });

  it("should return state as is from applyLimits if not matching type of StateHistory", () => {
    const simpleState: testState = {
      foo: "Bar"
    };

    expect(applyLimits(simpleState, 0)).toBe(simpleState);
  });

  it("should jump back and forth in time", async () => {
    const { store } = createUndoableTestStore();

    const actionA = (currentState: StateHistory<testState>) => Promise.resolve(nextStateHistory(currentState, { foo: "A" }));
    const actionB = (currentState: StateHistory<testState>) => Promise.resolve(nextStateHistory(currentState, { foo: "B" }));
    const actionC = (currentState: StateHistory<testState>) => Promise.resolve(nextStateHistory(currentState, { foo: "C" }));
    store.registerAction("Action A", actionA);
    store.registerAction("Action B", actionB);
    store.registerAction("Action C", actionC);

    await executeSteps(
      store,
      false,
      () => store.dispatch(actionA),
      (res) => { expect(res.present.foo).toBe("A"); store.dispatch(actionB); },
      (res) => { expect(res.present.foo).toBe("B"); store.dispatch(actionC); },
      (res) => { expect(res.present.foo).toBe("C"); store.dispatch(jump, -1); },
      (res) => { expect(res.present.foo).toBe("B"); store.dispatch(jump, 1); },
      (res) => expect(res.present.foo).toBe("C")
    );
  });

  it("should return the same state if jumping zero times", async () => {
    const { store } = createUndoableTestStore();
    const actionA = (currentState: StateHistory<testState>) => Promise.resolve(nextStateHistory(currentState, { foo: "A" }));
    const actionB = (currentState: StateHistory<testState>) => Promise.resolve(nextStateHistory(currentState, { foo: "B" }));

    store.registerAction("Action A", actionA);
    store.registerAction("Action B", actionB);

    await executeSteps(
      store,
      false,
      () => store.dispatch(actionA),
      (res) => { expect(res.present.foo).toBe("A"); store.dispatch(actionB); },
      (res) => { expect(res.present.foo).toBe("B"); store.dispatch(jump, 0); },
      (res) => expect(res.present.foo).toBe("B")
    );
  });

  it("should return the same state if jumping too far into future", async () => {
    const { store } = createUndoableTestStore();
    const actionA = (currentState: StateHistory<testState>) => Promise.resolve(nextStateHistory(currentState, { foo: "A" }));
    const actionB = (currentState: StateHistory<testState>) => Promise.resolve(nextStateHistory(currentState, { foo: "B" }));

    store.registerAction("Action A", actionA);
    store.registerAction("Action B", actionB);

    await executeSteps(
      store,
      false,
      () => store.dispatch(actionA),
      (res) => { expect(res.present.foo).toBe("A"); store.dispatch(actionB); },
      (res) => { expect(res.present.foo).toBe("B"); store.dispatch(jump, 3); },
      (res) => expect(res.present.foo).toBe("B")
    );
  });

  it("should return the same state if jumping too far into past", async () => {
    const { store } = createUndoableTestStore();
    const actionA = (currentState: StateHistory<testState>) => Promise.resolve(nextStateHistory(currentState, { foo: "A" }));
    const actionB = (currentState: StateHistory<testState>) => Promise.resolve(nextStateHistory(currentState, { foo: "B" }));

    store.registerAction("Action A", actionA);
    store.registerAction("Action B", actionB);

    await executeSteps(
      store,
      false,
      () => store.dispatch(actionA),
      (res) => { expect(res.present.foo).toBe("A"); store.dispatch(actionB); },
      (res) => { expect(res.present.foo).toBe("B"); store.dispatch(jump, -3); },
      (res) => expect(res.present.foo).toBe("B")
    );
  });

  it("should limit the resulting states past if option is passed", async () => {
    const initialState: StateHistory<testState> = {
      past: [],
      present: { foo: "bar" },
      future: []
    };
    const limit = 3;
    const store = createStoreWithStateAndOptions(initialState, { history: { undoable: true, limit } });
    const fakeAction = (currentState: StateHistory<testState>, idx: number) => Promise.resolve(nextStateHistory(currentState, { foo: idx.toString() }));

    store.registerAction("FakeAction", fakeAction);

    await executeSteps(
      store,
      false,
      ...Array.from(new Array(limit + limit)).map((_, idx) => {
        return (res: StateHistory<testState>) => {
          store.dispatch(fakeAction, idx + 1);

          expect(res.past.length).toBe(idx >= limit ? limit : idx);
        };
      }),
      (res) => {
        expect(res.past.length).toBe(limit)
        expect(res.past.map(i => i.foo)).toEqual(Array.from(new Array(limit)).map((_, idx) => (limit + idx).toString()));
      }
    );
  });

  it("should limit the resulting states future if option is passed", async () => {
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

    const fakeAction = (_: StateHistory<testState>) => {
      return Promise.resolve(stateAfterInitial);
    };

    store.registerAction("FakeAction", fakeAction);

    await executeSteps(
      store,
      false,
      () => store.dispatch(fakeAction),
      (res) => { expect(res).toEqual(stateAfterInitial); store.dispatch(jump, - limit); },
      (res) => {
        expect(res.future.length).toBe(limit);
        expect(res.present).toEqual(stateAfterInitial.past[0]);
        expect(res.past).toEqual([]);
        expect(res.future).toEqual([ ...stateAfterInitial.past.slice(1), stateAfterInitial.present]);
      }
    );
  });
});
