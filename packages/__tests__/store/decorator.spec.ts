import { DI, Registration } from '@aurelia/kernel';
import { Subscription } from 'rxjs';
import { distinctUntilChanged, pluck } from 'rxjs/operators';
import { STORE, Store, connectTo } from '@aurelia/store';

import { expect } from 'chai';
import { stub } from 'sinon';
import { Spied } from './helpers';

interface DemoState {
  foo: string;
  bar: string;
}

function arrange() {
  const initialState = { foo: 'Lorem', bar: 'Ipsum' };
  const store: Store<DemoState> = new Store(initialState);
  const container = DI.createContainer();
  container.register(Registration.instance(Store, store));

  STORE.container = container;

  return { initialState, store };
}

describe('using decorators', () => {

  let originalEntries;

  before(() => {
    originalEntries = Object.entries;
  });

  afterEach(() => {
    Object.entries = originalEntries ;
  });

  it('should throw an descriptive error if Object.entries is not available', () => {
    (Object as any).entries = undefined;

    expect(() => { connectTo(); }).to.throw();
  });

  it('should be possible to decorate a class and assign the subscribed result to the state property', () => {
    const { initialState } = arrange();

    @connectTo()
    class DemoStoreConsumer {
      public state: DemoState;
    }

    const sut = new DemoStoreConsumer();
    expect(sut.state).to.equal(undefined);

    (sut as any).bind();

    expect(sut.state).to.equal(initialState);
    expect((sut as any)._stateSubscriptions).not.to.equal(undefined);
  });

  it('should be possible to provide a state selector', () => {
    const { initialState } = arrange();

    @connectTo<DemoState>((store) => store.state.pipe(pluck('bar')))
    class DemoStoreConsumer {
      public state: DemoState;
    }

    const sut = new DemoStoreConsumer();
    expect(sut.state).to.equal(undefined);

    (sut as any).bind();

    expect(sut.state).to.equal(initialState.bar);
  });

  describe('with a complex settings object', () => {
    it('should be possible to provide a selector', () => {
      const { initialState } = arrange();

      @connectTo<DemoState>({
        selector: (store) => store.state.pipe(pluck('bar'))
      })
      class DemoStoreConsumer {
        public state: DemoState;
      }

      const sut = new DemoStoreConsumer();
      expect(sut.state).to.equal(undefined);

      (sut as any).bind();

      expect(sut.state).to.equal(initialState.bar);
    });

    it('should be possible to provide an undefined selector and still get the state property', () => {
      const { initialState } = arrange();

      @connectTo<DemoState>({
        selector: undefined
      } as any)
      class DemoStoreConsumer {
        public state: DemoState;
      }

      const sut = new DemoStoreConsumer();
      expect(sut.state).to.equal(undefined);

      (sut as any).bind();

      expect(sut.state).to.equal(initialState);
    });

    it('should be possible to provide an object with multiple selectors', () => {
      const { initialState } = arrange();

      @connectTo<DemoState>({
        selector: {
          barTarget: (store) => store.state.pipe(pluck('bar')),
          fooTarget: (store) => store.state.pipe(pluck('foo'))
        }
      })
      class DemoStoreConsumer {
        public state: DemoState;
        public barTarget: string;
        public fooTarget: string;
      }

      const sut = new DemoStoreConsumer();

      (sut as any).bind();

      setTimeout(
        () => {
          expect(sut.state).not.to.equal(undefined);
          expect(sut.barTarget).to.equal(initialState.bar);
          expect(sut.fooTarget).to.equal(initialState.foo);
        },
        120
      );
    });

    it('should use the default state observable if selector does not return an observable', () => {
      const { initialState } = arrange();

      @connectTo<DemoState>({
        selector: () => 'foobar' as any
      })
      class DemoStoreConsumer {
        public state: DemoState;
      }

      const sut = new DemoStoreConsumer();
      expect(sut.state).to.equal(undefined);

      (sut as any).bind();

      expect(sut.state).to.equal(initialState);
    });

    it('should be possible to override the target property', () => {
      const { initialState } = arrange();

      @connectTo<DemoState>({
        selector: (store) => store.state.pipe(pluck('bar')),
        target: 'foo'
      })
      class DemoStoreConsumer {
        public foo: DemoState;
      }

      const sut = new DemoStoreConsumer();
      expect(sut.foo).to.equal(undefined);

      (sut as any).bind();

      setTimeout(
        () => {
          expect((sut as any).state).not.to.equal(undefined);
          expect(sut.foo).to.equal(initialState.bar);
        },
        120
      );
    });

    it('should be possible to use the target as the parent object for the multiple selector targets', () => {
      const { initialState } = arrange();

      @connectTo<DemoState>({
        selector: {
          barTarget: (store) => store.state.pipe(pluck('bar')),
          fooTarget: (store) => store.state.pipe(pluck('foo'))
        },
        target: 'foo'
      })
      class DemoStoreConsumer {
        public foo: DemoState;
      }

      const sut = new DemoStoreConsumer();
      expect(sut.foo).to.equal(undefined);

      (sut as any).bind();

      setTimeout(
        () => {
          expect((sut as any).state).not.to.equal(undefined);
          expect(sut.foo).not.to.equal(undefined);
          expect((sut.foo as any).barTarget).not.to.equal(undefined);
          expect((sut.foo as any).fooTarget).not.to.equal(undefined);
          expect((sut.foo as any).barTarget).to.equal(initialState.bar);
          expect((sut.foo as any).fooTarget).to.equal(initialState.foo);
        }
      );
    });
  });

  it('should apply original bind method after patch', () => {
    const { initialState } = arrange();

    @connectTo()
    class DemoStoreConsumer {
      public state: DemoState;
      public test = '';

      public bind() {
        this.test = 'foobar';
      }
    }

    const sut = new DemoStoreConsumer();

    (sut as any).bind();

    expect(sut.state).to.equal(initialState);
    expect(sut.test).to.equal('foobar');
  });

  describe('the unbind lifecycle-method', () => {
    it('should apply original unbind method after patch', () => {
      const { initialState } = arrange();

      @connectTo()
      class DemoStoreConsumer {
        public state: DemoState;
        public test = '';

        public unbind() {
          this.test = 'foobar';
        }
      }

      const sut = new DemoStoreConsumer();

      (sut as any).bind();

      expect(sut.state).to.equal(initialState);

      (sut as any).unbind();

      expect(sut.test).to.equal('foobar');
    });

    it('should automatically unsubscribe when unbind is called', () => {
      const { initialState } = arrange();

      @connectTo()
      class DemoStoreConsumer {
        public state: DemoState;
      }

      const sut = new DemoStoreConsumer();
      expect(sut.state).to.equal(undefined);

      (sut as any).bind();
      const subscriptions = ((sut as any)._stateSubscriptions as Subscription[]);
      expect(subscriptions.length).to.equal(1);
      const subscription = subscriptions[0];
      stub(subscription, 'unsubscribe').callThrough();

      expect(sut.state).to.equal(initialState);
      expect(subscription.closed).to.equal(false);

      (sut as any).unbind();

      expect(subscription).not.to.equal(undefined);
      expect(subscription.closed).to.equal(true);
      expect(subscription.unsubscribe).to.have.been.called;
    });

    it('should automatically unsubscribe from all sources when unbind is called', () => {
      arrange();

      @connectTo({
        selector: {
          barTarget: (store) => store.state.pipe(pluck('bar')),
          stateTarget: () => 'foo' as any
        }
      })
      class DemoStoreConsumer {
        public state: DemoState;
      }

      const sut = new DemoStoreConsumer();
      expect(sut.state).to.equal(undefined);

      (sut as any).bind();
      const subscriptions = ((sut as any)._stateSubscriptions as Subscription[]);
      expect(subscriptions.length).to.equal(2);
      stub(subscriptions[0], 'unsubscribe').callThrough();
      stub(subscriptions[1], 'unsubscribe').callThrough();

      expect(subscriptions[0].closed).to.equal(false);
      expect(subscriptions[1].closed).to.equal(false);

      (sut as any).unbind();

      expect(subscriptions[0]).not.to.equal(undefined);
      expect(subscriptions[1]).not.to.equal(undefined);
      expect(subscriptions[0].closed).to.equal(true);
      expect(subscriptions[1].closed).to.equal(true);
      expect(subscriptions[0].unsubscribe).to.have.been.called;
      expect(subscriptions[1].unsubscribe).to.have.been.called;
    });

    it('should not unsubscribe if subscription is already closed', () => {
      const { initialState } = arrange();

      @connectTo()
      class DemoStoreConsumer {
        public state: DemoState;
      }

      const sut = new DemoStoreConsumer();
      expect(sut.state).to.equal(undefined);

      (sut as any).bind();
      const subscriptions = ((sut as any)._stateSubscriptions as Subscription[]);
      expect(subscriptions.length).to.equal(1);
      const subscription = subscriptions[0];
      subscription.unsubscribe();

      expect(sut.state).to.equal(initialState);
      expect(subscription.closed).to.equal(true);

      stub(subscription, 'unsubscribe');

      (sut as any).unbind();

      expect(subscription).not.to.equal(undefined);
      expect(subscription.unsubscribe).not.to.have.been.called;
    });

    [null, {}].forEach((stateSubscription: any) => {
      it('should not unsubscribe if state subscription changes and is not an array', () => {
        arrange();

        @connectTo()
        class DemoStoreConsumer {
          public state: DemoState;
        }

        const sut = new DemoStoreConsumer();
        expect(sut.state).to.equal(undefined);

        (sut as any).bind();
        const subscriptions = ((sut as any)._stateSubscriptions as Subscription[]);
        (sut as any)._stateSubscriptions = stateSubscription;
        const subscription = subscriptions[0];
        stub(subscription, 'unsubscribe');

        (sut as any).unbind();

        expect(subscription).not.to.equal(undefined);
        expect(subscription.unsubscribe).not.to.have.been.called;
      });
    });
  });

  describe('with custom setup and teardown settings', () => {
    it('should return the value from the original setup / teardown functions', () => {
      arrange();

      const expectedBindResult = 'foo';
      const expectedUnbindResult = 'bar';

      @connectTo<DemoState>({
        selector: (store) => store.state
      })
      class DemoStoreConsumer {
        public state: DemoState;

        public bind() {
          return expectedBindResult;
        }

        public unbind() {
          return expectedUnbindResult;
        }
      }

      const sut = new DemoStoreConsumer();

      expect(sut.bind()).to.equal(expectedBindResult);
      expect(sut.unbind()).to.equal(expectedUnbindResult);
    });

    it('should allow to specify a lifecycle hook for the subscription', () => {
      const { initialState } = arrange();

      @connectTo<DemoState>({
        selector: (store) => store.state,
        setup: 'created'
      })
      class DemoStoreConsumer {
        public state: DemoState;
      }

      const sut = new DemoStoreConsumer();

      expect((sut as any).created).not.to.equal(undefined);
      (sut as any).created();

      expect(sut.state).to.equal(initialState);
      expect((sut as any)._stateSubscriptions).not.to.equal(undefined);
    });

    it('should allow to specify a lifecycle hook for the unsubscription', () => {
      const { initialState } = arrange();

      @connectTo<DemoState>({
        selector: (store) => store.state,
        teardown: 'detached'
      })
      class DemoStoreConsumer {
        public state: DemoState;
      }

      const sut = new DemoStoreConsumer();

      (sut as any).bind();

      const subscriptions = ((sut as any)._stateSubscriptions as Subscription[]);
      expect(subscriptions.length).to.equal(1);
      const subscription = subscriptions[0];
      stub(subscription, 'unsubscribe').callThrough();

      expect(sut.state).to.equal(initialState);
      expect(subscription.closed).to.equal(false);
      expect((sut as any).detached).not.to.equal(undefined);
      (sut as any).detached();

      expect(subscription).not.to.equal(undefined);
      expect(subscription.closed).to.equal(true);
      expect(subscription.unsubscribe).to.have.been.called;
    });
  });

  describe('with handling changes', () => {
    it('should call stateChanged when exists on VM by default', () => {
      const { initialState } = arrange();
      // tslint:disable-next-line
      const oldState = {} as DemoState;

      @connectTo<DemoState>({
        selector: (store) => store.state,
      })
      class DemoStoreConsumer {
        public state: DemoState = oldState;

        public stateChanged(state: DemoState) {
          return state;
        }
      }

      const sut = new DemoStoreConsumer() as Spied<DemoStoreConsumer>;
      stub(sut, 'stateChanged');
      (sut as any).bind();

      expect(sut.state).to.equal(initialState);
      expect(sut.stateChanged).to.have.callCount(1);
      expect(sut.stateChanged.getCall(0).args[0]).to.equal(initialState);
      expect(sut.stateChanged.getCall(0).args[1]).to.equal(oldState);
    });

    it('should accept a string for onChanged and call the respective handler passing the new state', () => {
      const { initialState } = arrange();

      @connectTo<DemoState>({
        onChanged: 'stateChanged',
        selector: (store) => store.state,
      })
      class DemoStoreConsumer {
        public state: DemoState;

        public stateChanged(state: DemoState) { return state; }
      }

      const sut = new DemoStoreConsumer() as Spied<DemoStoreConsumer>;
      stub(sut, 'stateChanged');
      (sut as any).bind();

      expect(sut.state).to.equal(initialState);
      expect(sut.stateChanged).to.have.callCount(1);
      expect(sut.stateChanged).to.have.been.calledWith(initialState, undefined);
    });

    it('should be called before assigning the new state, so there is still access to the previous state', () => {
      const { initialState } = arrange();

      @connectTo<DemoState>({
        onChanged: 'stateChanged',
        selector: (store) => store.state,
      })
      class DemoStoreConsumer {
        public state: DemoState;

        public stateChanged(state: DemoState) {
          expect(sut.state).to.equal(undefined);
          expect(state).to.equal(initialState);
        }
      }

      const sut = new DemoStoreConsumer();
      (sut as any).bind();
    });

    it('should call the targetChanged handler on the VM, if existing, with the new and old state', () => {
      const { initialState } = arrange();
      let targetValOnChange = null;

      @connectTo<DemoState>({
        selector: {
          targetProp: (store) => store.state
        }
      })
      class DemoStoreConsumer {
        public state: DemoState;
        public targetProp = 'foobar';

        public targetPropChanged() {
          targetValOnChange = sut.targetProp;
        }
      }

      const sut = new DemoStoreConsumer() as Spied<DemoStoreConsumer>;
      stub(sut, 'targetPropChanged').callThrough();
      (sut as any).bind();

      expect(targetValOnChange).to.equal('foobar');
      expect(sut.targetProp).to.equal(initialState);
      expect(sut.targetPropChanged).to.have.callCount(1);
      expect(sut.targetPropChanged).to.have.been.calledWith(initialState, 'foobar');
      expect(sut.targetPropChanged.getCall(0).args[0]).to.equal(initialState);
    });

    it('should call the propertyChanged handler on the VM, if existing, with the new and old state', () => {
      const { initialState } = arrange();
      let targetValOnChange = null;

      @connectTo<DemoState>({
        selector: {
          targetProp: (store) => store.state
        }
      })
      class DemoStoreConsumer {
        public state: DemoState;
        public targetProp = 'foobar';

        public propertyChanged() {
          targetValOnChange = sut.targetProp;
        }
      }

      const sut = new DemoStoreConsumer();
      stub(sut, 'propertyChanged').callThrough();
      (sut as any).bind();

      expect(targetValOnChange).to.equal('foobar');
      expect(sut.targetProp).to.equal(initialState);
      expect(sut.propertyChanged).to.have.been.calledWith('targetProp', initialState, 'foobar');
    });

    it('should call all change handlers on the VM, if existing, in order and with the correct args', () => {
      const { initialState } = arrange();
      const calledHandlersInOrder = [] as string[];

      @connectTo<DemoState>({
        onChanged: 'customHandler',
        selector: {
          targetProp: (store) => store.state
        }
      })
      class DemoStoreConsumer {
        public state: DemoState;
        public targetProp = 'foobar';

        // tslint:disable-next-line
        public customHandler() { }
        // tslint:disable-next-line
        public targetPropChanged() { }
        // tslint:disable-next-line
        public propertyChanged() { }
      }

      const sut = new DemoStoreConsumer() as Spied<DemoStoreConsumer>;
      stub(sut, 'customHandler').callsFake(() => calledHandlersInOrder.push('customHandler'));
      stub(sut, 'targetPropChanged').callsFake(() => calledHandlersInOrder.push('targetPropChanged'));
      stub(sut, 'propertyChanged').callsFake(() => calledHandlersInOrder.push('propertyChanged'));
      (sut as any).bind();

      expect(sut.targetProp).to.equal(initialState);
      expect(sut.propertyChanged).to.have.callCount(1);
      expect(sut.propertyChanged).to.have.been.calledWith('targetProp', initialState, 'foobar');
      expect(sut.targetPropChanged).to.have.callCount(1);
      expect(sut.targetPropChanged).to.have.been.calledWith(initialState, 'foobar');
      expect(sut.customHandler).to.have.callCount(1);
      expect(sut.customHandler).to.have.been.calledWith(initialState, 'foobar');
      expect(calledHandlersInOrder).to.include.members(['customHandler', 'targetPropChanged', 'propertyChanged']);
    });

    it('should call the targetOnChanged handler and not each multiple selector, if existing, with the 3 args', () => {
      const { initialState } = arrange();
      let targetValOnChange = null;

      @connectTo<DemoState>({
        target: 'foo',
        selector: {
          targetProp: (store) => store.state
        }
      })
      class DemoStoreConsumer {
        public state: DemoState;
        public foo = {
          targetProp: 'foobar'
        };

        // tslint:disable-next-line
        public targetPropChanged() {
        }

        public fooChanged() {
          targetValOnChange = sut.foo.targetProp;
        }
      }

      const sut = new DemoStoreConsumer() as Spied<DemoStoreConsumer>;
      stub(sut, 'fooChanged').callThrough();
      stub(sut, 'targetPropChanged');
      (sut as any).bind();

      expect(targetValOnChange).to.equal('foobar');
      expect(sut.foo.targetProp).to.equal(initialState);
      expect(sut.targetPropChanged).to.have.callCount(0);
      expect(sut.fooChanged).to.have.callCount(1);
      expect(sut.fooChanged).to.have.been.calledWith('targetProp', initialState, 'foobar');
    });

    it('should call changed handler for multiple selectors only when their state slice is affected', async () => {
      const { store } = arrange();
      const changeOnlyBar = (state: DemoState) => ({...state,  bar: 'changed'});
      store.registerAction('changeOnlyBar', changeOnlyBar);

      @connectTo<DemoState>({
        selector: {
          // tslint:disable-next-line
          foo: (store) => store.state.pipe(pluck('foo'), distinctUntilChanged()),
          // tslint:disable-next-line
          bar: (store) => store.state.pipe(pluck('bar'), distinctUntilChanged())
        }
      })
      class DemoStoreConsumer {
        // tslint:disable-next-line
        public barChanged() { }

        // tslint:disable-next-line
        public fooChanged() { }
      }

      const sut = new DemoStoreConsumer() as Spied<DemoStoreConsumer>;
      const spyFoo = stub(sut, 'fooChanged');
      const spyBar = stub(sut, 'barChanged');
      (sut as any).bind();

      await store.dispatch(changeOnlyBar);

      expect(spyFoo).to.have.callCount(1);
      expect(spyBar).to.have.callCount(2);
    });

    it('should check whether the method exists before calling it and throw a meaningful error', () => {
      arrange();

      @connectTo<DemoState>({
        onChanged: 'stateChanged',
        selector: (store) => store.state,
      })
      class DemoStoreConsumer {
        public state: DemoState;
      }

      const sut = new DemoStoreConsumer();

      expect(() => (sut as any).bind()).to.throw();
    });
  });
});
