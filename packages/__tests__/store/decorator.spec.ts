import { Subscription } from 'rxjs';
import { distinctUntilChanged, pluck } from 'rxjs/operators';
import { customElement } from '@aurelia/runtime-html';
import { assert } from "@aurelia/testing";
import { DI, Registration } from '@aurelia/kernel';
import { STORE, Store, connectTo } from '@aurelia/store';

import { createCallCounter, createDI } from "./helpers";

interface DemoState {
  foo: string;
  bar: string;
}

function arrange() {
  const initialState = { foo: 'Lorem', bar: 'Ipsum' };
  const container = DI.createContainer();
  const { logger, storeWindow } = createDI();
  const store: Store<DemoState> = new Store(initialState, logger, storeWindow);
  container.register(Registration.instance(Store, store));

  STORE.container = container;

  return { initialState, store };
}

describe("using decorators", function () {
  it("should lazy load the store inside the decorator", function () {
    arrange();

    @customElement({
      name: 'connect-to-vm',
      template: `<template></template>`
    })
    @connectTo()
    class ConnectToVm {

    }

    const component = new ConnectToVm();
    assert.equal(typeof (component as any).beforeBind, "function");
  });

  it("should be possible to decorate a class and assign the subscribed result to the state property", function () {
    const { initialState } = arrange();

    @connectTo()
    class DemoStoreConsumer {
      public state: DemoState;
    }

    const sut = new DemoStoreConsumer();
    assert.equal(sut.state, undefined);

    (sut as any).beforeBind();

    assert.equal(sut.state, initialState);
    assert.notEqual((sut as any)._stateSubscriptions, undefined);
  });

  it("should be possible to provide a state selector", function () {
    const { initialState } = arrange();

    @connectTo<DemoState>((store) => store.state.pipe(pluck("bar")))
    class DemoStoreConsumer {
      public state: DemoState;
    }

    const sut = new DemoStoreConsumer();
    assert.equal(sut.state, undefined);

    (sut as any).beforeBind();

    assert.equal(sut.state, initialState.bar);
  });

  describe("with a complex settings object", function () {
    it("should be possible to provide a selector", function () {
      const { initialState } = arrange();

      @connectTo<DemoState>({
        selector: (store) => store.state.pipe(pluck("bar"))
      })
      class DemoStoreConsumer {
        public state: DemoState;
      }

      const sut = new DemoStoreConsumer();
      assert.equal(sut.state, undefined);

      (sut as any).beforeBind();

      assert.equal(sut.state, initialState.bar);
    });

    it("should be possible to provide an undefined selector and still get the state property", function () {
      const { initialState } = arrange();

      @connectTo<DemoState>({
        selector: undefined
      } as any)
      class DemoStoreConsumer {
        public state: DemoState;
      }

      const sut = new DemoStoreConsumer();
      assert.equal(sut.state, undefined);

      (sut as any).beforeBind();

      assert.equal(sut.state, initialState);
    });

    it("should be possible to provide an object with multiple selectors", function () {
      const { initialState } = arrange();

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

      const sut = new DemoStoreConsumer();

      (sut as any).beforeBind();

      assert.equal(sut.state, undefined);
      assert.equal(sut.barTarget, initialState.bar);
      assert.equal(sut.fooTarget, initialState.foo);
    });

    it("should use the default state observable if selector does not return an observable", function () {
      const { initialState } = arrange();

      @connectTo<DemoState>({
        selector: () => "foobar" as any
      })
      class DemoStoreConsumer {
        public state: DemoState;
      }

      const sut = new DemoStoreConsumer();
      assert.equal(sut.state, undefined);

      (sut as any).beforeBind();

      assert.equal(sut.state, initialState);
    });

    it("should be possible to override the target property", function () {
      const { initialState } = arrange();

      @connectTo<DemoState>({
        selector: (store) => store.state.pipe(pluck("bar")),
        target: "foo"
      })
      class DemoStoreConsumer {
        public foo: DemoState;
      }

      const sut = new DemoStoreConsumer();
      assert.equal(sut.foo, undefined);

      (sut as any).beforeBind();

      assert.equal((sut as any).state, undefined);
      assert.equal(sut.foo, initialState.bar);
    });

    it("should be possible to use the target as the parent object for the multiple selector targets", function () {
      const { initialState } = arrange();

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

      const sut = new DemoStoreConsumer();
      assert.equal(sut.foo, undefined);

      (sut as any).beforeBind();

      assert.equal((sut as any).state, undefined);
      assert.notEqual(sut.foo, undefined);
      assert.notEqual((sut.foo as any).barTarget, undefined);
      assert.notEqual((sut.foo as any).fooTarget, undefined);
      assert.equal((sut.foo as any).barTarget, initialState.bar);
      assert.equal((sut.foo as any).fooTarget, initialState.foo);
    });
  });

  it("should apply original beforeBind method after patch", function () {
    const { initialState } = arrange();

    @connectTo()
    class DemoStoreConsumer {
      public state: DemoState;
      public test: string = "";

      public beforeBind() {
        this.test = "foobar";
      }
    }

    const sut = new DemoStoreConsumer();

    (sut as any).beforeBind();

    assert.equal(sut.state, initialState);
    assert.equal(sut.test, "foobar");
  });

  describe("the afterUnbind lifecycle-method", function () {
    it("should apply original afterUnbind method after patch", function () {
      const { initialState } = arrange();

      @connectTo()
      class DemoStoreConsumer {
        public state: DemoState;
        public test: string = "";

        public afterUnbind() {
          this.test = "foobar";
        }
      }

      const sut = new DemoStoreConsumer();

      (sut as any).beforeBind();

      assert.equal(sut.state, initialState);

      (sut as any).afterUnbind();

      assert.equal(sut.test, "foobar");
    });

    it("should automatically unsubscribe when afterUnbind is called", function () {
      const { initialState } = arrange();

      @connectTo()
      class DemoStoreConsumer {
        public state: DemoState;
      }

      const sut = new DemoStoreConsumer();
      assert.equal(sut.state, undefined);

      (sut as any).beforeBind();
      const subscriptions = ((sut as any)._stateSubscriptions as Subscription[]);
      assert.equal(subscriptions.length, 1);
      const subscription = subscriptions[0];
      const { spyObj } = createCallCounter(subscription, "unsubscribe");

      assert.equal(sut.state, initialState);
      assert.equal(subscription.closed, false);

      (sut as any).afterUnbind();

      assert.notEqual(subscription, undefined);
      assert.equal(subscription.closed, true);
      assert.greaterThanOrEqualTo(spyObj.callCounter, 1);
    });

    it("should automatically unsubscribe from all sources when afterUnbind is called", function () {
      arrange();

      @connectTo({
        selector: {
          barTarget: (store) => store.state.pipe(pluck("bar")),
          stateTarget: () => "foo" as any
        }
      })
      class DemoStoreConsumer {
        public state: DemoState;
      }

      const sut = new DemoStoreConsumer();
      assert.equal(sut.state, undefined);

      (sut as any).beforeBind();
      const subscriptions = ((sut as any)._stateSubscriptions as Subscription[]);
      assert.equal(subscriptions.length, 2);
      const { spyObj: spyObj1 } = createCallCounter(subscriptions[0], "unsubscribe");
      const { spyObj: spyObj2 } = createCallCounter(subscriptions[1], "unsubscribe");

      assert.equal(subscriptions[0].closed, false);
      assert.equal(subscriptions[1].closed, false);

      (sut as any).afterUnbind();

      assert.notEqual(subscriptions[0], undefined);
      assert.notEqual(subscriptions[1], undefined);
      assert.equal(subscriptions[0].closed, true);
      assert.equal(subscriptions[1].closed, true);
      assert.greaterThanOrEqualTo(spyObj1.callCounter, 1);
      assert.greaterThanOrEqualTo(spyObj2.callCounter, 1);
    });

    it("should not unsubscribe if subscription is already closed", function () {
      const { initialState } = arrange();

      @connectTo()
      class DemoStoreConsumer {
        public state: DemoState;
      }

      const sut = new DemoStoreConsumer();
      assert.equal(sut.state, undefined);

      (sut as any).beforeBind();
      const subscriptions = ((sut as any)._stateSubscriptions as Subscription[]);
      assert.equal(subscriptions.length, 1);
      const subscription = subscriptions[0];
      subscription.unsubscribe();

      assert.equal(sut.state, initialState);
      assert.equal(subscription.closed, true);

      const { spyObj } = createCallCounter(subscription, "unsubscribe");

      (sut as any).afterUnbind();

      assert.notEqual(subscription, undefined);
      assert.equal(spyObj.callCounter, 0);
    });

    [null, {}].forEach((stateSubscription: any) => {
      it("should not unsubscribe if state subscription changes and is not an array", function () {
        arrange();

        @connectTo()
        class DemoStoreConsumer {
          public state: DemoState;
        }

        const sut = new DemoStoreConsumer();
        assert.equal(sut.state, undefined);

        (sut as any).beforeBind();
        const subscriptions = ((sut as any)._stateSubscriptions as Subscription[]);
        (sut as any)._stateSubscriptions = stateSubscription;
        const subscription = subscriptions[0];
        const { spyObj } = createCallCounter(subscription, "unsubscribe");

        (sut as any).afterUnbind();

        assert.notEqual(subscription, undefined);
        assert.equal(spyObj.callCounter, 0);
      });
    });
  });

  describe("with custom setup and teardown settings", function () {
    it("should return the value from the original setup / teardown functions", function () {
      arrange();

      const expectedBeforeBindResult = "foo";
      const expectedafterUnbindResult = "bar";

      @connectTo<DemoState>({
        selector: (store) => store.state
      })
      class DemoStoreConsumer {
        public state: DemoState;

        public beforeBind() {
          return expectedBeforeBindResult;
        }

        public afterUnbind() {
          return expectedafterUnbindResult;
        }
      }

      const sut = new DemoStoreConsumer();

      assert.equal(sut.beforeBind(), expectedBeforeBindResult);
      assert.equal(sut.afterUnbind(), expectedafterUnbindResult);
    });

    it("should allow to specify a lifecycle hook for the subscription", function () {
      const { initialState } = arrange();

      @connectTo<DemoState>({
        selector: (store) => store.state,
        setup: "create"
      })
      class DemoStoreConsumer {
        public state: DemoState;
      }

      const sut = new DemoStoreConsumer();

      assert.notEqual((sut as any).create, undefined);
      (sut as any).create();

      assert.equal(sut.state, initialState);
      assert.notEqual((sut as any)._stateSubscriptions, undefined);
    });

    it("should allow to specify a lifecycle hook for the unsubscription", function () {
      const { initialState } = arrange();

      @connectTo<DemoState>({
        selector: (store) => store.state,
        teardown: "detached"
      })
      class DemoStoreConsumer {
        public state: DemoState;
      }

      const sut = new DemoStoreConsumer();

      (sut as any).beforeBind();

      const subscriptions = ((sut as any)._stateSubscriptions as Subscription[]);
      assert.equal(subscriptions.length, 1);
      const subscription = subscriptions[0];
      const { spyObj } = createCallCounter(subscription, "unsubscribe");

      assert.equal(sut.state, initialState);
      assert.equal(subscription.closed, false);
      assert.notEqual((sut as any).detached, undefined);
      (sut as any).detached();

      assert.notEqual(subscription, undefined);
      assert.equal(subscription.closed, true);
      assert.greaterThanOrEqualTo(spyObj.callCounter, 1);
    });
  });

  describe("with handling changes", function () {
    it("should call stateChanged when exists on VM by default", function () {
      const { initialState } = arrange();
      const oldState: DemoState = { foo: "a", bar: "b" };

      @connectTo<DemoState>({
        selector: (store) => store.state,
      })
      class DemoStoreConsumer {
        public state: DemoState = oldState;

        public stateChanged(state: DemoState) { return state; }
      }

      const sut = new DemoStoreConsumer();
      const { spyObj } = createCallCounter(sut, "stateChanged");

      (sut as any).beforeBind();

      assert.equal(sut.state, initialState);
      assert.equal(spyObj.callCounter, 1);
      assert.equal(spyObj.lastArgs[0], initialState);
      assert.equal(spyObj.lastArgs[1], oldState);
    });

    it("should accept a string for onChanged and call the respective handler passing the new state", function () {
      const { initialState } = arrange();

      @connectTo<DemoState>({
        onChanged: "stateChanged",
        selector: (store) => store.state,
      })
      class DemoStoreConsumer {
        public state: DemoState;

        public stateChanged(state: DemoState) { return state; }
      }

      const sut = new DemoStoreConsumer();
      const { spyObj } = createCallCounter(sut, "stateChanged");

      (sut as any).beforeBind();

      assert.equal(sut.state, initialState);
      assert.equal(spyObj.callCounter, 1);
      assert.equal(spyObj.lastArgs[0], initialState);
      assert.equal(spyObj.lastArgs[1], undefined);
    });

    it("should be called before assigning the new state, so there is still access to the previous state", function () {
      const { initialState } = arrange();

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

      const sut = new DemoStoreConsumer();
      (sut as any).beforeBind();
    });

    it("should call the targetChanged handler on the VM, if existing, with the new and old state", function () {
      const { initialState } = arrange();
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

      const sut = new DemoStoreConsumer();
      const { spyObj } = createCallCounter(sut, "targetPropChanged");

      (sut as any).beforeBind();

      assert.equal(targetValOnChange, "foobar");
      assert.equal(sut.targetProp, initialState);
      assert.equal(spyObj.callCounter, 1);
      assert.equal(spyObj.lastArgs[0], initialState);
      assert.equal(spyObj.lastArgs[1], "foobar");
      spyObj.reset();
    });

    it("should call the propertyChanged handler on the VM, if existing, with the new and old state", function () {
      const { initialState } = arrange();

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

      const sut = new DemoStoreConsumer();

      (sut as any).beforeBind();

      assert.equal(sut.targetProp, initialState);
    });

    it("should call all change handlers on the VM, if existing, in order and with the correct args", function () {
      const { initialState } = arrange();
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

      const sut = new DemoStoreConsumer();
      (sut as any).beforeBind();

      assert.equal(sut.targetProp, initialState);
      assert.deepEqual(calledHandlersInOrder, ["customHandler", "targetPropChanged", "propertyChanged"]);
    });

    it("should call the targetOnChanged handler and not each multiple selector, if existing, with the 3 args", function () {
      const { initialState } = arrange();

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

      const sut = new DemoStoreConsumer();
      const { spyObj } = createCallCounter(sut, "targetPropChanged");

      (sut as any).beforeBind();

      assert.equal(sut.foo.targetProp, initialState);
      assert.equal(spyObj.callCounter, 0);
    });

      it("should call changed handler for multiple selectors only when their state slice is affected", async function () {
        const { store } = arrange();
        const changeOnlyBar = (state: DemoState) => ({ ...state, bar: "changed" });
        store.registerAction("changeOnlyBar", changeOnlyBar);

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

        const sut = new DemoStoreConsumer();

        (sut as any).beforeBind();

        await store.dispatch(changeOnlyBar);

        assert.equal(sut.barCalls, 2);
        assert.equal(sut.fooCalls, 1);
      });

      it("should check whether the method exists before calling it and throw a meaningful error", function () {
        arrange();

        @connectTo<DemoState>({
          onChanged: "stateChanged",
          selector: (store) => store.state,
        })
        class DemoStoreConsumer {
          public state: DemoState;
        }

        const sut = new DemoStoreConsumer();

        assert.throws(() => (sut as any).beforeBind());
      });
  });
});
