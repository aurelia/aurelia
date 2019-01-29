mport { Container } from "aurelia-framework";
import { Subscription } from "rxjs";
import { pluck, distinctUntilChanged } from "rxjs/operators";

import { Store } from "../../src/store";
import { connectTo } from "../../src/decorator";
import { Spied } from "./helpers";

interface DemoState {
  foo: string;
  bar: string;
}

function arrange() {
  const initialState = { foo: "Lorem", bar: "Ipsum" };
  const store: Store<DemoState> = new Store(initialState);
  const container = new Container().makeGlobal();
  container.registerInstance(Store, store);

  return { initialState, store };
}

describe("using decorators", () => {
  it("should throw an descriptive error if Object.entries is not available", () => {
    const originalEntries = (Object as any).entries;

    (Object as any).entries = undefined;

    expect(() => {
      connectTo();
    }).toThrowError(/Object.entries/);

    (Object as any).entries = originalEntries;
  });

  it("should be possible to decorate a class and assign the subscribed result to the state property", () => {
    const { initialState } = arrange();

    @connectTo()
    class DemoStoreConsumer {
      state: DemoState;
    }

    const sut = new DemoStoreConsumer();
    expect(sut.state).toEqual(undefined);

    (sut as any).bind();

    expect(sut.state).toEqual(initialState);
    expect((sut as any)._stateSubscriptions).toBeDefined();
  });

  it("should be possible to provide a state selector", () => {
    const { initialState } = arrange();

    @connectTo<DemoState>((store) => store.state.pipe(pluck("bar")))
    class DemoStoreConsumer {
      state: DemoState;
    }

    const sut = new DemoStoreConsumer();
    expect(sut.state).toEqual(undefined);

    (sut as any).bind();

    expect(sut.state).toEqual(initialState.bar);
  });

  describe("with a complex settings object", () => {
    it("should be possible to provide a selector", () => {
      const { initialState } = arrange();

      @connectTo<DemoState>({
        selector: (store) => store.state.pipe(pluck("bar"))
      })
      class DemoStoreConsumer {
        state: DemoState;
      }

      const sut = new DemoStoreConsumer();
      expect(sut.state).toEqual(undefined);

      (sut as any).bind();

      expect(sut.state).toEqual(initialState.bar);
    });

    it("should be possible to provide an undefined selector and still get the state property", () => {
      const { initialState } = arrange();

      @connectTo<DemoState>({
        selector: undefined
      } as any)
      class DemoStoreConsumer {
        state: DemoState;
      }

      const sut = new DemoStoreConsumer();
      expect(sut.state).toEqual(undefined);

      (sut as any).bind();

      expect(sut.state).toEqual(initialState);
    });

    it("should be possible to provide an object with multiple selectors", () => {
      const { initialState } = arrange();

      @connectTo<DemoState>({
        selector: {
          barTarget: (store) => store.state.pipe(pluck("bar")),
          fooTarget: (store) => store.state.pipe(pluck("foo"))
        }
      })
      class DemoStoreConsumer {
        state: DemoState;
        barTarget: string;
        fooTarget: string;
      }

      const sut = new DemoStoreConsumer();

      (sut as any).bind();

      expect(sut.state).not.toBeDefined();
      expect(sut.barTarget).toBe(initialState.bar);
      expect(sut.fooTarget).toBe(initialState.foo);
    });

    it("should use the default state observable if selector does not return an observable", () => {
      const { initialState } = arrange();

      @connectTo<DemoState>({
        selector: () => "foobar" as any
      })
      class DemoStoreConsumer {
        state: DemoState;
      }

      const sut = new DemoStoreConsumer();
      expect(sut.state).toEqual(undefined);

      (sut as any).bind();

      expect(sut.state).toEqual(initialState);
    });

    it("should be possible to override the target property", () => {
      const { initialState } = arrange();

      @connectTo<DemoState>({
        selector: (store) => store.state.pipe(pluck("bar")),
        target: "foo"
      })
      class DemoStoreConsumer {
        foo: DemoState;
      }

      const sut = new DemoStoreConsumer();
      expect(sut.foo).toEqual(undefined);

      (sut as any).bind();

      expect((sut as any).state).not.toBeDefined();
      expect(sut.foo).toEqual(initialState.bar);
    });

    it("should be possible to use the target as the parent object for the multiple selector targets", () => {
      const { initialState } = arrange();

      @connectTo<DemoState>({
        selector: {
          barTarget: (store) => store.state.pipe(pluck("bar")),
          fooTarget: (store) => store.state.pipe(pluck("foo"))
        },
        target: "foo"
      })
      class DemoStoreConsumer {
        foo: DemoState;
      }

      const sut = new DemoStoreConsumer();
      expect(sut.foo).toEqual(undefined);

      (sut as any).bind();

      expect((sut as any).state).not.toBeDefined();
      expect(sut.foo).toBeDefined();
      expect((sut.foo as any).barTarget).toBeDefined();
      expect((sut.foo as any).fooTarget).toBeDefined();
      expect((sut.foo as any).barTarget).toBe(initialState.bar);
      expect((sut.foo as any).fooTarget).toBe(initialState.foo);
    });
  })

  it("should apply original bind method after patch", () => {
    const { initialState } = arrange();

    @connectTo()
    class DemoStoreConsumer {
      state: DemoState;
      test = "";

      public bind() {
        this.test = "foobar";
      }
    }

    const sut = new DemoStoreConsumer();

    (sut as any).bind();

    expect(sut.state).toEqual(initialState);
    expect(sut.test).toEqual("foobar");
  });

  describe("the unbind lifecycle-method", () => {
    it("should apply original unbind method after patch", () => {
      const { initialState } = arrange();

      @connectTo()
      class DemoStoreConsumer {
        state: DemoState;
        test = "";

        public unbind() {
          this.test = "foobar";
        }
      }

      const sut = new DemoStoreConsumer();

      (sut as any).bind();

      expect(sut.state).toEqual(initialState);

      (sut as any).unbind();

      expect(sut.test).toEqual("foobar");
    });

    it("should automatically unsubscribe when unbind is called", () => {
      const { initialState } = arrange();

      @connectTo()
      class DemoStoreConsumer {
        state: DemoState;
      }

      const sut = new DemoStoreConsumer();
      expect(sut.state).toEqual(undefined);

      (sut as any).bind();
      const subscriptions = ((sut as any)._stateSubscriptions as Array<Subscription>);
      expect(subscriptions.length).toEqual(1);
      const subscription = subscriptions[0];
      spyOn(subscription, "unsubscribe").and.callThrough();

      expect(sut.state).toEqual(initialState);
      expect(subscription.closed).toBe(false);

      (sut as any).unbind();

      expect(subscription).toBeDefined();
      expect(subscription.closed).toBe(true);
      expect(subscription.unsubscribe).toHaveBeenCalled();
    });

    it("should automatically unsubscribe from all sources when unbind is called", () => {
      arrange();

      @connectTo({
        selector: {
          barTarget: (store) => store.state.pipe(pluck("bar")),
          stateTarget: () => "foo" as any
        }
      })
      class DemoStoreConsumer {
        state: DemoState;
      }

      const sut = new DemoStoreConsumer();
      expect(sut.state).toEqual(undefined);

      (sut as any).bind();
      const subscriptions = ((sut as any)._stateSubscriptions as Array<Subscription>);
      expect(subscriptions.length).toEqual(2);
      spyOn(subscriptions[0], "unsubscribe").and.callThrough();
      spyOn(subscriptions[1], "unsubscribe").and.callThrough();

      expect(subscriptions[0].closed).toBe(false);
      expect(subscriptions[1].closed).toBe(false);

      (sut as any).unbind();

      expect(subscriptions[0]).toBeDefined();
      expect(subscriptions[1]).toBeDefined();
      expect(subscriptions[0].closed).toBe(true);
      expect(subscriptions[1].closed).toBe(true);
      expect(subscriptions[0].unsubscribe).toHaveBeenCalled();
      expect(subscriptions[1].unsubscribe).toHaveBeenCalled();
    });

    it("should not unsubscribe if subscription is already closed", () => {
      const { initialState } = arrange();

      @connectTo()
      class DemoStoreConsumer {
        state: DemoState;
      }

      const sut = new DemoStoreConsumer();
      expect(sut.state).toEqual(undefined);

      (sut as any).bind();
      const subscriptions = ((sut as any)._stateSubscriptions as Array<Subscription>);
      expect(subscriptions.length).toEqual(1);
      const subscription = subscriptions[0];
      subscription.unsubscribe();

      expect(sut.state).toEqual(initialState);
      expect(subscription.closed).toBe(true);

      spyOn(subscription, "unsubscribe");

      (sut as any).unbind();

      expect(subscription).toBeDefined();
      expect(subscription.unsubscribe).not.toHaveBeenCalled();
    });

    [null, {}].forEach((stateSubscription: any) => {
      it("should not unsubscribe if state subscription changes and is not an array", () => {
        arrange();

        @connectTo()
        class DemoStoreConsumer {
          state: DemoState;
        }

        const sut = new DemoStoreConsumer();
        expect(sut.state).toEqual(undefined);

        (sut as any).bind();
        const subscriptions = ((sut as any)._stateSubscriptions as Array<Subscription>);
        (sut as any)._stateSubscriptions = stateSubscription;
        const subscription = subscriptions[0];
        spyOn(subscription, "unsubscribe");

        (sut as any).unbind();

        expect(subscription).toBeDefined();
        expect(subscription.unsubscribe).not.toHaveBeenCalled();
      });
    });
  });

  describe("with custom setup and teardown settings", () => {
    it("should return the value from the original setup / teardown functions", () => {
      arrange();

      const expectedBindResult = "foo";
      const expectedUnbindResult = "bar";

      @connectTo<DemoState>({
        selector: (store) => store.state
      })
      class DemoStoreConsumer {
        state: DemoState;

        public bind() {
          return expectedBindResult;
        }

        public unbind() {
          return expectedUnbindResult;
        }
      }

      const sut = new DemoStoreConsumer();

      expect(sut.bind()).toBe(expectedBindResult);
      expect(sut.unbind()).toBe(expectedUnbindResult);
    });

    it("should allow to specify a lifecycle hook for the subscription", () => {
      const { initialState } = arrange();

      @connectTo<DemoState>({
        selector: (store) => store.state,
        setup: "created"
      })
      class DemoStoreConsumer {
        state: DemoState;
      }

      const sut = new DemoStoreConsumer();

      expect((sut as any).created).toBeDefined();
      (sut as any).created();

      expect(sut.state).toEqual(initialState);
      expect((sut as any)._stateSubscriptions).toBeDefined();
    });

    it("should allow to specify a lifecycle hook for the unsubscription", () => {
      const { initialState } = arrange();

      @connectTo<DemoState>({
        selector: (store) => store.state,
        teardown: "detached"
      })
      class DemoStoreConsumer {
        state: DemoState;
      }

      const sut = new DemoStoreConsumer();

      (sut as any).bind();

      const subscriptions = ((sut as any)._stateSubscriptions as Array<Subscription>);
      expect(subscriptions.length).toEqual(1);
      const subscription = subscriptions[0];
      spyOn(subscription, "unsubscribe").and.callThrough();

      expect(sut.state).toEqual(initialState);
      expect(subscription.closed).toBe(false);
      expect((sut as any).detached).toBeDefined();
      (sut as any).detached();

      expect(subscription).toBeDefined();
      expect(subscription.closed).toBe(true);
      expect(subscription.unsubscribe).toHaveBeenCalled();
    });
  });

  describe("with handling changes", () => {
    it("should call stateChanged when exists on VM by default", () => {
      const { initialState } = arrange();
      const oldState = {} as DemoState;

      @connectTo<DemoState>({
        selector: (store) => store.state,
      })
      class DemoStoreConsumer {
        state: DemoState = oldState;

        stateChanged(state: DemoState) { return state; }
      }

      const sut = new DemoStoreConsumer() as Spied<DemoStoreConsumer>;
      spyOn(sut, "stateChanged");
      (sut as any).bind();

      expect(sut.state).toEqual(initialState);
      expect(sut.stateChanged.calls.count()).toEqual(1);
      expect(sut.stateChanged.calls.argsFor(0)[0]).toBe(initialState);
      expect(sut.stateChanged.calls.argsFor(0)[1]).toBe(oldState);
    });

    it("should accept a string for onChanged and call the respective handler passing the new state", () => {
      const { initialState } = arrange();

      @connectTo<DemoState>({
        onChanged: "stateChanged",
        selector: (store) => store.state,
      })
      class DemoStoreConsumer {
        state: DemoState;

        stateChanged(state: DemoState) { return state; }
      }

      const sut = new DemoStoreConsumer() as Spied<DemoStoreConsumer>;
      spyOn(sut, "stateChanged");
      (sut as any).bind();

      expect(sut.state).toEqual(initialState);
      expect(sut.stateChanged.calls.count()).toEqual(1);
      expect(sut.stateChanged).toHaveBeenCalledWith(initialState, undefined);
    });

    it("should be called before assigning the new state, so there is still access to the previous state", () => {
      const { initialState } = arrange();

      @connectTo<DemoState>({
        onChanged: "stateChanged",
        selector: (store) => store.state,
      })
      class DemoStoreConsumer {
        state: DemoState;

        stateChanged(state: DemoState) {
          expect(sut.state).toEqual(undefined);
          expect(state).toEqual(initialState);
        }
      }

      const sut = new DemoStoreConsumer();
      (sut as any).bind();
    });

    it("should call the targetChanged handler on the VM, if existing, with the new and old state", () => {
      const { initialState } = arrange();
      let targetValOnChange = null;

      @connectTo<DemoState>({
        selector: {
          targetProp: (store) => store.state
        }
      })
      class DemoStoreConsumer {
        state: DemoState;
        targetProp = "foobar"

        targetPropChanged() {
          targetValOnChange = sut.targetProp;
        }
      }

      const sut = new DemoStoreConsumer() as Spied<DemoStoreConsumer>;
      spyOn(sut, "targetPropChanged").and.callThrough();
      (sut as any).bind();

      expect(targetValOnChange).toEqual("foobar");
      expect(sut.targetProp).toEqual(initialState);
      expect(sut.targetPropChanged.calls.count()).toEqual(1);
      expect(sut.targetPropChanged).toHaveBeenCalledWith(initialState, "foobar");
      expect(sut.targetPropChanged.calls.argsFor(0)[0]).toBe(initialState);
    });

    it("should call the propertyChanged handler on the VM, if existing, with the new and old state", () => {
      const { initialState } = arrange();
      let targetValOnChange = null;

      @connectTo<DemoState>({
        selector: {
          targetProp: (store) => store.state
        }
      })
      class DemoStoreConsumer {
        state: DemoState;
        targetProp = "foobar"

        propertyChanged() {
          targetValOnChange = sut.targetProp;
        }
      }

      const sut = new DemoStoreConsumer();
      spyOn(sut, "propertyChanged").and.callThrough();
      (sut as any).bind();

      expect(targetValOnChange).toEqual("foobar");
      expect(sut.targetProp).toEqual(initialState);
      expect(sut.propertyChanged).toHaveBeenCalledWith("targetProp", initialState, "foobar");
    });

    it("should call all change handlers on the VM, if existing, in order and with the correct args", () => {
      const { initialState } = arrange();
      const calledHandlersInOrder = [] as string[];

      @connectTo<DemoState>({
        onChanged: "customHandler",
        selector: {
          targetProp: (store) => store.state
        }
      })
      class DemoStoreConsumer {
        state: DemoState;
        targetProp = "foobar"

        customHandler() { }
        targetPropChanged() { }
        propertyChanged() { }
      }

      const sut = new DemoStoreConsumer() as Spied<DemoStoreConsumer>;
      spyOn(sut, "customHandler").and.callFake(() => calledHandlersInOrder.push("customHandler"));
      spyOn(sut, "targetPropChanged").and.callFake(() => calledHandlersInOrder.push("targetPropChanged"));
      spyOn(sut, "propertyChanged").and.callFake(() => calledHandlersInOrder.push("propertyChanged"));
      (sut as any).bind();

      expect(sut.targetProp).toEqual(initialState);
      expect(sut.propertyChanged.calls.count()).toEqual(1);
      expect(sut.propertyChanged).toHaveBeenCalledWith("targetProp", initialState, "foobar");
      expect(sut.targetPropChanged.calls.count()).toEqual(1);
      expect(sut.targetPropChanged).toHaveBeenCalledWith(initialState, "foobar");
      expect(sut.customHandler.calls.count()).toEqual(1);
      expect(sut.customHandler).toHaveBeenCalledWith(initialState, "foobar");
      expect(calledHandlersInOrder).toEqual(["customHandler", "targetPropChanged", "propertyChanged"])
    });

    it("should call the targetOnChanged handler and not each multiple selector, if existing, with the 3 args", () => {
      const { initialState } = arrange();
      let targetValOnChange = null;

      @connectTo<DemoState>({
        target: "foo",
        selector: {
          targetProp: (store) => store.state
        }
      })
      class DemoStoreConsumer {
        state: DemoState;
        foo = {
          targetProp: "foobar"
        };

        targetPropChanged() {
        }

        fooChanged() {
          targetValOnChange = sut.foo.targetProp;
        }
      }

      const sut = new DemoStoreConsumer() as Spied<DemoStoreConsumer>;
      spyOn(sut, "fooChanged").and.callThrough();
      spyOn(sut, "targetPropChanged");
      (sut as any).bind();

      expect(targetValOnChange).toEqual("foobar");
      expect(sut.foo.targetProp).toEqual(initialState);
      expect(sut.targetPropChanged.calls.count()).toEqual(0);
      expect(sut.fooChanged.calls.count()).toEqual(1);
      expect(sut.fooChanged).toHaveBeenCalledWith("targetProp", initialState, "foobar");
    });

    it("should call changed handler for multiple selectors only when their state slice is affected", async () => {
      const { store } = arrange();
      const changeOnlyBar = (state: DemoState) => Object.assign({}, state, { bar: "changed" });
      store.registerAction("changeOnlyBar", changeOnlyBar);

      @connectTo<DemoState>({
        selector: {
          foo: (store) => store.state.pipe(pluck("foo"), distinctUntilChanged()),
          bar: (store) => store.state.pipe(pluck("bar"), distinctUntilChanged())
        }
      })
      class DemoStoreConsumer {
        barChanged() { }

        fooChanged() { }
      }

      const sut = new DemoStoreConsumer() as Spied<DemoStoreConsumer>;
      const spyFoo = jest.spyOn(sut, "fooChanged");
      const spyBar = jest.spyOn(sut, "barChanged");
      (sut as any).bind();

      await store.dispatch(changeOnlyBar);

      expect(spyFoo).toHaveBeenCalledTimes(1);
      expect(spyBar).toHaveBeenCalledTimes(2);
    });

    it("should check whether the method exists before calling it and throw a meaningful error", () => {
      arrange();

      @connectTo<DemoState>({
        onChanged: "stateChanged",
        selector: (store) => store.state,
      })
      class DemoStoreConsumer {
        state: DemoState;
      }

      const sut = new DemoStoreConsumer();

      expect(() => (sut as any).bind()).toThrowError("Provided onChanged handler does not exist on target VM");
    });
  });
});
