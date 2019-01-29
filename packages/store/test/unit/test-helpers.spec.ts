import {
  createTestStore,
  testState
} from "./helpers";
import { executeSteps } from "../../src/test-helpers";


describe("test helpers", () => {
  it("should provide easy means to test sequences", async () => {
    expect.assertions(3);
    const { store } = createTestStore();

    const actionA = (_: testState) => Promise.resolve({ foo: "A" });
    const actionB = (_: testState) => Promise.resolve({ foo: "B" });
    const actionC = (_: testState) => Promise.resolve({ foo: "C" });
    store.registerAction("Action A", actionA);
    store.registerAction("Action B", actionB);
    store.registerAction("Action C", actionC);

    await executeSteps(
      store,
      false,
      () => store.dispatch(actionA),
      (res) => { expect(res.foo).toBe("A"); store.dispatch(actionB); },
      (res) => { expect(res.foo).toBe("B"); store.dispatch(actionC); },
      (res) => expect(res.foo).toBe("C")
    );
  });

  it("should reject with error if step fails", async () => {
    expect.assertions(4);
    const { store } = createTestStore();

    const actionA = (_: testState) => Promise.resolve({ foo: "A" });
    const actionB = (_: testState) => Promise.resolve({ foo: "B" });
    const actionC = (_: testState) => Promise.resolve({ foo: "C" });
    store.registerAction("Action A", actionA);
    store.registerAction("Action B", actionB);
    store.registerAction("Action C", actionC);

    await executeSteps(
      store,
      false,
      () => store.dispatch(actionA),
      (res) => { expect(res.foo).toBe("A"); store.dispatch(actionB); },
      (res) => { expect(res.foo).toBe("B"); store.dispatch(actionC); throw Error("on purpose"); },
      (res) => expect(res.foo).toBe("C")
    ).catch((e: Error) => {
      expect(e.message).toBe("on purpose");
    });
  });

  it("should provide console information during executeSteps", async () => {
    expect.assertions(6);
    const { store } = createTestStore();

    ["log", "group", "groupEnd"].forEach((fct) => {
      (global.console as any)[fct] = jest.fn();
    });

    const actionA = (_: testState) => Promise.resolve({ foo: "A" });
    const actionB = (_: testState) => Promise.resolve({ foo: "B" });
    const actionC = (_: testState) => Promise.resolve({ foo: "C" });
    store.registerAction("Action A", actionA);
    store.registerAction("Action B", actionB);
    store.registerAction("Action C", actionC);

    await executeSteps(
      store,
      true,
      () => store.dispatch(actionA),
      (res) => { expect(res.foo).toBe("A"); store.dispatch(actionB); },
      (res) => { expect(res.foo).toBe("B"); store.dispatch(actionC); },
      (res) => expect(res.foo).toBe("C")
    );

    ["log", "group", "groupEnd"].forEach((fct) => {
      expect((global.console as any)[fct]).toHaveBeenCalled();

      ((global.console as any)[fct] as any).mockReset();
      ((global.console as any)[fct] as any).mockRestore();
    });
  });
})
