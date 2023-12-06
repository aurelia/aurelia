import { Subscription } from 'rxjs';

import { pluck, distinctUntilChanged } from "rxjs/operators";

import { customElement, IWindow } from '@aurelia/runtime-html';
import { assert } from "@aurelia/testing";
import { ConstructableClass, DI, Registration } from '@aurelia/kernel';
import { STORE, Store, connectTo } from '@aurelia/store-v1';

import { createCallCounter, createDI } from "./helpers.js";

interface DemoState {
  foo: string;
  bar: string;
}

type ITestViewModel<T> = {
  created?(...args: any[]): any;
  binding?(...args: any[]): any;
  bound?(...args: any[]): any;
  unbinding?(...args: any[]): any;
  detached?(...args: any[]): any;
  _stateSubscriptions?: Subscription[];
} & T;

function arrange<T>(Component: ConstructableClass<T>) {
  const initialState = { foo: 'Lorem', bar: 'Ipsum' };
  const container = DI.createContainer();
  const { logger, storeWindow } = createDI();
  const store: Store<DemoState> = new Store(initialState, logger, storeWindow);
  container.register(
    Registration.instance(Store, store),
    Registration.instance(IWindow, storeWindow),
  );

  STORE.container = container;

  const sut: ITestViewModel<T> = new Component();

  return { initialState, store, sut };
}

describe("store-v1/decorator.spec.ts", function () {
  it("should lazy load the store inside the decorator", function () {
    @customElement({
      name: 'connect-to-vm',
      template: `<template></template>`
    })
    @connectTo()
    class ConnectToVm {

    }

    const { sut } = arrange(ConnectToVm);

    assert.equal(typeof sut.binding, "function");
  });

  it("should be possible to decorate a class and assign the subscribed result to the state property", function () {
    @connectTo()
    class DemoStoreConsumer {
      public state: DemoState;
    }

    const { initialState, sut } = arrange(DemoStoreConsumer);
    assert.equal(sut.state, undefined);

    sut.binding();

    assert.equal(sut.state, initialState);
    assert.notEqual(sut._stateSubscriptions, undefined);
  });

  it("should be possible to provide a state selector", function () {
    @connectTo<DemoState>((store) => store.state.pipe(pluck("bar")))
    class DemoStoreConsumer {
      public state: DemoState;
    }
    const { initialState, sut } = arrange(DemoStoreConsumer);
    assert.equal(sut.state, undefined);

    sut.binding();

    assert.equal(sut.state, initialState.bar);
  });

  describe("with a complex settings object", function () {
    it("should be possible to provide a selector", function () {
      @connectTo<DemoState>({
        selector: (store) => store.state.pipe(pluck("bar"))
      })
      class DemoStoreConsumer {
        public state: DemoState;
      }
      const { initialState, sut } = arrange(DemoStoreConsumer);
      assert.equal(sut.state, undefined);

      sut.binding();

      assert.equal(sut.state, initialState.bar);
    });

    it("should be possible to provide an undefined selector and still get the state property", function () {
      @connectTo<DemoState>({
        selector: undefined
      } as any)
      class DemoStoreConsumer {
        public state: DemoState;
      }
      const { initialState, sut } = arrange(DemoStoreConsumer);
      assert.equal(sut.state, undefined);

      sut.binding();

      assert.equal(sut.state, initialState);
    });

    it("should be possible to provide an object with multiple selectors", function () {
      @connectTo<DemoState>({
        selector: {
          barTarget: (store) => store.state.pipe(pluck("bar")),
          fooTarget: (store) => store.state.pipe(pluck("foo"))
        }
      })
      class DemoStoreConsumer {
        public state: DemoState;
        public barTarget: string;
        public fooTarget: string;
      }
      const { initialState, sut } = arrange(DemoStoreConsumer);
      sut.binding();

      assert.equal(sut.state, undefined);
      assert.equal(sut.barTarget, initialState.bar);
      assert.equal(sut.fooTarget, initialState.foo);
    });

    it("should use the default state observable if selector does not return an observable", function () {
      @connectTo<DemoState>({
        selector: () => "foobar" as any
      })
      class DemoStoreConsumer {
        public state: DemoState;
      }
      const { initialState, sut } = arrange(DemoStoreConsumer);
      assert.equal(sut.state, undefined);

      sut.binding();

      assert.equal(sut.state, initialState);
    });

    it("should be possible to override the target property", function () {
      @connectTo<DemoState>({
        selector: (store) => store.state.pipe(pluck("bar")),
        target: "foo"
      })
      class DemoStoreConsumer {
        public foo: DemoState;
      }
      const { initialState, sut } = arrange(DemoStoreConsumer);
      assert.equal(sut.foo, undefined);

      sut.binding();

      assert.equal(sut['state'], undefined);
      assert.equal(sut.foo, initialState.bar);
    });

    it("should be possible to use the target as the parent object for the multiple selector targets", function () {
      @connectTo<DemoState>({
        selector: {
          barTarget: (store) => store.state.pipe(pluck("bar")),
          fooTarget: (store) => store.state.pipe(pluck("foo"))
        },
        target: "foo"
      })
      class DemoStoreConsumer {
        public foo: DemoState;
      }
      const { initialState, sut } = arrange(DemoStoreConsumer);
      assert.equal(sut.foo, undefined);

      sut.binding();

      assert.equal(sut['state'], undefined);
      assert.notEqual(sut.foo, undefined);
      assert.notEqual(sut.foo['barTarget'], undefined);
      assert.notEqual(sut.foo['fooTarget'], undefined);
      assert.equal(sut.foo['barTarget'], initialState.bar);
      assert.equal(sut.foo['fooTarget'], initialState.foo);
    });
  });

  it("should apply original binding method after patch", function () {
    @connectTo()
    class DemoStoreConsumer {
      public state: DemoState;
      public test: string = "";

      public binding() {
        this.test = "foobar";
      }
    }
    const { initialState, sut } = arrange(DemoStoreConsumer);

    sut.binding();

    assert.equal(sut.state, initialState);
    assert.equal(sut.test, "foobar");
  });

  describe("the unbinding lifecycle-method", function () {
    it("should apply original unbinding method after patch", function () {
      @connectTo()
      class DemoStoreConsumer {
        public state: DemoState;
        public test: string = "";

        public unbinding() {
          this.test = "foobar";
        }
      }
      const { initialState, sut } = arrange(DemoStoreConsumer);

      sut.binding();

      assert.equal(sut.state, initialState);

      sut.unbinding();

      assert.equal(sut.test, "foobar");
    });

    it("should automatically unsubscribe when unbinding is called", function () {
      @connectTo()
      class DemoStoreConsumer {
        public state: DemoState;
      }
      const { initialState, sut } = arrange(DemoStoreConsumer);
      assert.equal(sut.state, undefined);

      sut.binding();
      const subscriptions = sut._stateSubscriptions;
      assert.equal(subscriptions.length, 1);
      const subscription = subscriptions[0];
      const { spyObj } = createCallCounter(subscription, "unsubscribe");

      assert.equal(sut.state, initialState);
      assert.equal(subscription.closed, false);

      sut.unbinding();

      assert.notEqual(subscription, undefined);
      assert.equal(subscription.closed, true);
      assert.greaterThanOrEqualTo(spyObj.callCounter, 1);
    });

    it("should automatically unsubscribe from all sources when unbinding is called", function () {
      @connectTo({
        selector: {
          barTarget: (store) => store.state.pipe(pluck("bar")),
          stateTarget: () => "foo" as any
        }
      })
      class DemoStoreConsumer {
        public state: DemoState;
      }
      const { sut } = arrange(DemoStoreConsumer);
      assert.equal(sut.state, undefined);

      sut.binding();
      const subscriptions = sut._stateSubscriptions;
      assert.equal(subscriptions.length, 2);
      const { spyObj: spyObj1 } = createCallCounter(subscriptions[0], "unsubscribe");
      const { spyObj: spyObj2 } = createCallCounter(subscriptions[1], "unsubscribe");

      assert.equal(subscriptions[0].closed, false);
      assert.equal(subscriptions[1].closed, false);

      sut.unbinding();

      assert.notEqual(subscriptions[0], undefined);
      assert.notEqual(subscriptions[1], undefined);
      assert.equal(subscriptions[0].closed, true);
      assert.equal(subscriptions[1].closed, true);
      assert.greaterThanOrEqualTo(spyObj1.callCounter, 1);
      assert.greaterThanOrEqualTo(spyObj2.callCounter, 1);
    });

    it("should not unsubscribe if subscription is already closed", function () {
      @connectTo()
      class DemoStoreConsumer {
        public state: DemoState;
      }
      const { initialState, sut } = arrange(DemoStoreConsumer);
      assert.equal(sut.state, undefined);

      sut.binding();
      const subscriptions = sut._stateSubscriptions;
      assert.equal(subscriptions.length, 1);
      const subscription = subscriptions[0];
      subscription.unsubscribe();

      assert.equal(sut.state, initialState);
      assert.equal(subscription.closed, true);

      const { spyObj } = createCallCounter(subscription, "unsubscribe");

      sut.unbinding();

      assert.notEqual(subscription, undefined);
      assert.equal(spyObj.callCounter, 0);
    });

    [null, {}].forEach((stateSubscription: any) => {
      it("should not unsubscribe if state subscription changes and is not an array", function () {
        @connectTo()
        class DemoStoreConsumer {
          public state: DemoState;
        }
        const { sut } = arrange(DemoStoreConsumer);
        assert.equal(sut.state, undefined);

        sut.binding();
        const subscriptions = sut._stateSubscriptions;
        sut._stateSubscriptions = stateSubscription;
        const subscription = subscriptions[0];
        const { spyObj } = createCallCounter(subscription, "unsubscribe");

        sut.unbinding();

        assert.notEqual(subscription, undefined);
        assert.equal(spyObj.callCounter, 0);
      });
    });
  });

  describe("with custom setup and teardown settings", function () {
    it("should return the value from the original setup / teardown functions", function () {
      const expectedbindingResult = "foo";
      const expectedunbindingResult = "bar";
      @connectTo<DemoState>({
        selector: (store) => store.state
      })
      class DemoStoreConsumer {
        public state: DemoState;

        public binding() {
          return expectedbindingResult;
        }

        public unbinding() {
          return expectedunbindingResult;
        }
      }
      const { sut } = arrange(DemoStoreConsumer);

      assert.equal(sut.binding(), expectedbindingResult);
      assert.equal(sut.unbinding(), expectedunbindingResult);
    });

    it("should allow to specify a lifecycle hook for the subscription", function () {
      @connectTo<DemoState>({
        selector: (store) => store.state,
        setup: "created"
      })
      class DemoStoreConsumer {
        public state: DemoState;
      }
      const { initialState, sut } = arrange(DemoStoreConsumer);
      assert.notEqual(sut.created, undefined);

      sut.created();

      assert.equal(sut.state, initialState);
      assert.notEqual(sut._stateSubscriptions, undefined);
    });

    it("should allow to specify a lifecycle hook for the unsubscription", function () {
      @connectTo<DemoState>({
        selector: (store) => store.state,
        teardown: "detached"
      })
      class DemoStoreConsumer {
        public state: DemoState;
      }
      const { initialState, sut } = arrange(DemoStoreConsumer);

      sut.binding();

      const subscriptions = sut._stateSubscriptions;
      assert.equal(subscriptions.length, 1);
      const subscription = subscriptions[0];
      const { spyObj } = createCallCounter(subscription, "unsubscribe");

      assert.equal(sut.state, initialState);
      assert.equal(subscription.closed, false);
      assert.notEqual((sut as any).detached, undefined);
      sut.detached();

      assert.notEqual(subscription, undefined);
      assert.equal(subscription.closed, true);
      assert.greaterThanOrEqualTo(spyObj.callCounter, 1);
    });
  });

  describe("with handling changes", function () {
    it("should call stateChanged when exists on VM by default", function () {
      const oldState: DemoState = { foo: "a", bar: "b" };

      @connectTo<DemoState>({
        selector: (store) => store.state,
      })
      class DemoStoreConsumer {
        public state: DemoState = oldState;

        public stateChanged(state: DemoState) { return state; }
      }
      const { initialState, sut } = arrange(DemoStoreConsumer);
      const { spyObj } = createCallCounter(sut, "stateChanged");

      sut.binding();

      assert.equal(sut.state, initialState);
      assert.equal(spyObj.callCounter, 1);
      assert.equal(spyObj.lastArgs[0], initialState);
      assert.equal(spyObj.lastArgs[1], oldState);
    });

    it("should accept a string for onChanged and call the respective handler passing the new state", function () {
      @connectTo<DemoState>({
        onChanged: "stateChanged",
        selector: (store) => store.state,
      })
      class DemoStoreConsumer {
        public state: DemoState;
        public stateChanged(state: DemoState) { return state; }
      }
      const { initialState, sut } = arrange(DemoStoreConsumer);
      const { spyObj } = createCallCounter(sut, "stateChanged");

      sut.binding();

      assert.equal(sut.state, initialState);
      assert.equal(spyObj.callCounter, 1);
      assert.equal(spyObj.lastArgs[0], initialState);
      assert.equal(spyObj.lastArgs[1], undefined);
    });

    it("should be called before assigning the new state, so there is still access to the previous state", function () {
      @connectTo<DemoState>({
        onChanged: "stateChanged",
        selector: (store) => store.state,
      })
      class DemoStoreConsumer {
        public state: DemoState;

        public stateChanged(state: DemoState) {
          assert.equal(sut.state, undefined);
          assert.equal(state, initialState);
        }
      }

      const { initialState, sut } = arrange(DemoStoreConsumer);

      sut.binding();
    });

    it("should call the targetChanged handler on the VM, if existing, with the new and old state", function () {
      let targetValOnChange = null;

      @connectTo<DemoState>({
        selector: {
          targetProp: (store) => store.state
        }
      })
      class DemoStoreConsumer {
        public state: DemoState;
        public targetProp: string = "foobar";

        public targetPropChanged() {
          targetValOnChange = sut.targetProp;
        }
      }
      const { initialState, sut } = arrange(DemoStoreConsumer);
      const { spyObj } = createCallCounter(sut, "targetPropChanged");

      sut.binding();

      assert.equal(targetValOnChange, "foobar");
      assert.equal(sut.targetProp, initialState);
      assert.equal(spyObj.callCounter, 1);
      assert.equal(spyObj.lastArgs[0], initialState);
      assert.equal(spyObj.lastArgs[1], "foobar");
      spyObj.reset();
    });

    it("should call the propertyChanged handler on the VM, if existing, with the new and old state", function () {
      @connectTo<DemoState>({
        selector: {
          targetProp: (store) => store.state
        }
      })
      class DemoStoreConsumer {
        public state: DemoState;
        public targetProp: string = "foobar";

        public propertyChanged(prop, state, value) {
          assert.equal(initialState, state);
          assert.equal(prop, "targetProp");
          assert.equal(value, "foobar");
        }
      }
      const { initialState, sut } = arrange(DemoStoreConsumer);

      sut.binding();

      assert.equal(sut.targetProp, initialState);
    });

    it("should call all change handlers on the VM, if existing, in order and with the correct args", function () {
      const calledHandlersInOrder = [] as string[];

      @connectTo<DemoState>({
        onChanged: "customHandler",
        selector: {
          targetProp: (store) => store.state
        }
      })
      class DemoStoreConsumer {
        public state: DemoState;
        public targetProp: string = "foobar";

        public customHandler(state, value) {
          calledHandlersInOrder.push("customHandler");
          assert.equal(initialState, state);
          assert.equal(value, "foobar");
        }
        public targetPropChanged(state, value) {
          calledHandlersInOrder.push("targetPropChanged");
          assert.equal(initialState, state);
          assert.equal(value, "foobar");
        }
        public propertyChanged(targetProp, state, value) {
          calledHandlersInOrder.push("propertyChanged");
          assert.equal(targetProp, "targetProp");
          assert.equal(initialState, state);
          assert.equal(value, "foobar");
        }
      }
      const { initialState, sut } = arrange(DemoStoreConsumer);

      sut.binding();

      assert.equal(sut.targetProp, initialState);
      assert.deepEqual(calledHandlersInOrder, ["customHandler", "targetPropChanged", "propertyChanged"]);
    });

    it("should call the targetOnChanged handler and not each multiple selector, if existing, with the 3 args", function () {
      @connectTo<DemoState>({
        target: "foo",
        selector: {
          targetProp: (store) => store.state
        }
      })
      class DemoStoreConsumer {
        public state: DemoState;
        public foo: { targetProp: string} = {
          targetProp: "foobar"
        };

        public targetPropChanged() { /**/ }

        public fooChanged(targetProp, state, value) {
          assert.equal(targetProp, "targetProp");
          assert.equal(initialState, state);
          assert.equal(value, "foobar");
        }
      }
      const { initialState, sut } = arrange(DemoStoreConsumer);

      const { spyObj } = createCallCounter(sut, "targetPropChanged");

      sut.binding();

      assert.equal(sut.foo.targetProp, initialState);
      assert.equal(spyObj.callCounter, 0);
    });

      it("should call changed handler for multiple selectors only when their state slice is affected", async function () {

        @connectTo<DemoState>({
          selector: {
            foo: (pStore) => pStore.state.pipe(pluck("foo"), distinctUntilChanged()),
            bar: (pStore) => pStore.state.pipe(pluck("bar"), distinctUntilChanged())
          }
        })
        class DemoStoreConsumer {
          public barCalls: number = 0;
          public fooCalls: number = 0;

          public barChanged() { this.barCalls++; }

          public fooChanged() { this.fooCalls++; }
        }
        const { store, sut } = arrange(DemoStoreConsumer);
        const changeOnlyBar = (state: DemoState) => ({ ...state, bar: "changed" });
        store.registerAction("changeOnlyBar", changeOnlyBar);

        sut.binding();

        await store.dispatch(changeOnlyBar);

        assert.equal(sut.barCalls, 2);
        assert.equal(sut.fooCalls, 1);
      });

      it("should check whether the method exists before calling it and throw a meaningful error", function () {
        @connectTo<DemoState>({
          onChanged: "stateChanged",
          selector: (store) => store.state,
        })
        class DemoStoreConsumer {
          public state: DemoState;
        }
        const { sut } = arrange(DemoStoreConsumer);

        assert.throws(() => sut.binding());
      });
  });
});
