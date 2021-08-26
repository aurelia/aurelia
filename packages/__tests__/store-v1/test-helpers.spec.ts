import { executeSteps } from "@aurelia/store-v1";
import { assert } from "@aurelia/testing";

import {
  createTestStore,
  testState
} from "./helpers.js";

describe("test helpers", function () {
  this.timeout(100);
  it("should provide easy means to test sequences", async function () {
    const { store } = createTestStore();

    const actionA = async (_: testState) => Promise.resolve({ foo: "A" });
    const actionB = async (_: testState) => Promise.resolve({ foo: "B" });
    const actionC = async (_: testState) => Promise.resolve({ foo: "C" });
    store.registerAction("Action A", actionA);
    store.registerAction("Action B", actionB);
    store.registerAction("Action C", actionC);

    await executeSteps(
      store,
      false,
      async () => store.dispatch(actionA),
      (res) => { assert.equal(res.foo, "A"); store.dispatch(actionB).catch(() => { /**/ }); },
      (res) => { assert.equal(res.foo, "B"); store.dispatch(actionC).catch(() => { /**/ }); },
      (res) => assert.equal(res.foo, "C")
    );
  });

  it("should reject with error if step fails", async function () {
    const { store } = createTestStore();

    const actionA = async (_: testState) => Promise.resolve({ foo: "A" });
    const actionB = async (_: testState) => Promise.resolve({ foo: "B" });
    const actionC = async (_: testState) => Promise.resolve({ foo: "C" });
    store.registerAction("Action A", actionA);
    store.registerAction("Action B", actionB);
    store.registerAction("Action C", actionC);

    await executeSteps(
      store,
      false,
      async () => store.dispatch(actionA),
      (res) => { assert.equal(res.foo, "A"); store.dispatch(actionB).catch(() => { /**/ }); },
      (res) => { assert.equal(res.foo, "B"); store.dispatch(actionC).catch(() => { /**/ }); throw Error("on purpose"); },
      (res) => assert.equal(res.foo, "C")
    ).catch((e: Error) => {
      assert.equal(e.message, "on purpose");
    });
  });

  it("should provide console information during executeSteps", async function () {
    const { store } = createTestStore();
    const origConsole = {};
    const callTracker = {};
    const global = typeof globalThis === 'undefined' ? window : globalThis;

    ["log", "group", "groupEnd"].forEach((fct) => {
      origConsole[fct] = (global.console as any)[fct];
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      global.console[fct] = () => { callTracker[fct] = callTracker[fct] + 1 || 1; };
    });

    const actionA = async (_: testState) => Promise.resolve({ foo: "A" });
    const actionB = async (_: testState) => Promise.resolve({ foo: "B" });
    const actionC = async (_: testState) => Promise.resolve({ foo: "C" });
    store.registerAction("Action A", actionA);
    store.registerAction("Action B", actionB);
    store.registerAction("Action C", actionC);

    await executeSteps(
      store,
      true,
      async () => store.dispatch(actionA),
      (res) => { assert.equal(res.foo, "A"); store.dispatch(actionB).catch(() => { /**/ }); },
      (res) => { assert.equal(res.foo, "B"); store.dispatch(actionC).catch(() => { /**/ }); },
      (res) => assert.equal(res.foo, "C")
    );

    ["log", "group", "groupEnd"].forEach((fct) => {
      assert.greaterThanOrEqualTo(callTracker[fct], 1);
      (global.console as any)[fct] = origConsole[fct];
    });
  });
});
