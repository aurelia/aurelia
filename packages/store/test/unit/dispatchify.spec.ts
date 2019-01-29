import { Container } from "aurelia-dependency-injection";
import { skip } from "rxjs/operators";

import { dispatchify, Store } from "../../src/store";
import { createTestStore, testState } from "./helpers";
import { expect } from 'chai';

describe("dispatchify", () => {
  it("should help create dispatchifyable functions", done => {
    const cont = new Container().makeGlobal();
    const { store } = createTestStore();
    const fakeAction = (currentState: testState, param1: number, param2: number) => {
      return Object.assign({}, currentState, { foo: param1 + param2 })
    };

    store.registerAction("FakeAction", fakeAction as any);
    cont.registerInstance(Store, store);

    dispatchify(fakeAction)(1, 2);

    store.state.pipe(
      skip(1)
    ).subscribe((state) => {
      expect(state.foo).to.equal(3);
      done();
    });
  });

  it("should return the promise from dispatched calls", async () => {
    const cont = new Container().makeGlobal();
    const { store } = createTestStore();
    const fakeAction = (currentState: testState, param1: number, param2: number) => {
      return Object.assign({}, currentState, { foo: param1 + param2 })
    };

    store.registerAction("FakeAction", fakeAction as any);
    cont.registerInstance(Store, store);

    const result = dispatchify(fakeAction)(1, 2);
    expect(result.then).not.to.equal(undefined);

    await result;
  });

  it("should accept the reducers registered name", done => {
    const cont = new Container().makeGlobal();
    const { store } = createTestStore();
    const fakeAction = (currentState: testState, param1: number, param2: number) => {
      return Object.assign({}, currentState, { foo: param1 + param2 })
    };
    const fakeActionRegisteredName = "FakeAction";

    store.registerAction(fakeActionRegisteredName, fakeAction as any);
    cont.registerInstance(Store, store);

    dispatchify(fakeActionRegisteredName)("A", "B");

    store.state.pipe(
      skip(1)
    ).subscribe((state) => {
      expect(state.foo).to.equal("AB");
      done();
    });
  });

  it("should throw if any string given that doesn't reflect a registered action name", async () => {
    const cont = new Container().makeGlobal();
    const { store } = createTestStore();
    const fakeAction = (currentState: testState, param1: number, param2: number) => {
      return Object.assign({}, currentState, { foo: param1 + param2 })
    };
    const fakeActionRegisteredName = "FakeAction";

    store.registerAction(fakeActionRegisteredName, fakeAction as any);
    cont.registerInstance(Store, store);

    expect(dispatchify("ABC")("A", "B")).rejects.toBeInstanceOf(Error);
  });
});
