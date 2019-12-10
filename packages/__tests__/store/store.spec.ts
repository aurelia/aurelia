import { expect } from 'chai';
import { skip } from 'rxjs/operators';

import { stub } from 'sinon';
import {
  createTestStore,
  testState
} from './helpers';

describe('store', () => {
  it('should accept an initial state', done => {
    const { initialState, store } = createTestStore();

    store.state.subscribe((state) => {
      expect(state).to.equal(initialState);
      done();
    });
  });

  it('should fail when dispatching unknown actions', async () => {
    const { store } = createTestStore();
    const unregisteredAction = (currentState: testState, param1: number, param2: number) => {
      return {...currentState,  foo: param1 + param2};
    };

    expect((store.dispatch as any)(unregisteredAction)).to.throw;
  });

  it('should fail when dispatching non actions', async () => {
    const { store } = createTestStore();

    expect(store.dispatch(undefined as any)).to.throw;
  });

  it('should only accept reducers taking at least one parameter', () => {
    const { store } = createTestStore();
    // tslint:disable-next-line
    const fakeAction = () => { };

    expect(() => {
      store.registerAction('FakeAction', fakeAction as any);
    }).to.throw;
  });

  it('should force reducers to return a new state', async () => {
    const { store } = createTestStore();
    // tslint:disable-next-line
    const fakeAction = (_: testState) => { };

    store.registerAction('FakeAction', fakeAction as any);
    expect(store.dispatch(fakeAction as any)).to.throw;
  });

  it('should also accept false and stop queue', async () => {
    const { store } = createTestStore();
    const nextSpy = stub((store as any)._state, 'next').callThrough();
    const fakeAction = (_: testState): false => false;

    store.registerAction('FakeAction', fakeAction);
    store.dispatch(fakeAction);

    expect(nextSpy).to.have.callCount(0);
  });

  it('should also accept async false and stop queue', async () => {
    const { store } = createTestStore();
    const nextSpy = stub((store as any)._state, 'next').callThrough();
    const fakeAction = (_: testState): Promise<false> => Promise.resolve<false>(false);

    store.registerAction('FakeAction', fakeAction);
    store.dispatch(fakeAction);

    expect(nextSpy).to.have.callCount(0);
  });

  it('should unregister previously registered actions', async () => {
    const { store } = createTestStore();
    const fakeAction = (currentState: testState) => currentState;

    store.registerAction('FakeAction', fakeAction);
    expect(store.dispatch(fakeAction)).should.not.throw;

    store.unregisterAction(fakeAction);
    expect(store.dispatch(fakeAction)).should.throw;
  });

  it('should not try to unregister previously unregistered actions', async () => {
    const { store } = createTestStore();
    const fakeAction = (currentState: testState) => currentState;

    expect(() => store.unregisterAction(fakeAction)).not.throw;
  });

  it('should allow checking for already registered functions via Reducer', () => {
    const { store } = createTestStore();
    const fakeAction = (currentState: testState) => currentState;

    store.registerAction('FakeAction', fakeAction);
    expect(store.isActionRegistered(fakeAction)).to.equal(true);
  });

  it('should allow checking for already registered functions via previously registered name', () => {
    const { store } = createTestStore();
    const fakeAction = (currentState: testState) => currentState;

    store.registerAction('FakeAction', fakeAction);
    expect(store.isActionRegistered('FakeAction')).to.equal(true);
  });

  it('should accept reducers taking multiple parameters', done => {
    const { store } = createTestStore();
    const fakeAction = (currentState: testState, param1: string, param2: string) => {
      return {...currentState,  foo: param1 + param2};
    };

    store.registerAction('FakeAction', fakeAction as any);
    store.dispatch(fakeAction, 'A', 'B');

    store.state.pipe(
      skip(1)
    ).subscribe((state: any) => {
      expect(state.foo).to.equal('AB');
      done();
    });
  });

  it('should queue the next state after dispatching an action', done => {
    const { store } = createTestStore();
    const modifiedState = { foo: 'bert' };
    const fakeAction = (currentState: testState) => {
      return {...currentState, ...modifiedState};
    };

    store.registerAction('FakeAction', fakeAction);
    store.dispatch(fakeAction);

    store.state.pipe(
      skip(1)
    ).subscribe((state) => {
      expect(state).to.eql(modifiedState);
      done();
    });
  });

  it('should the previously registered action name as dispatch argument', done => {
    const { store } = createTestStore();
    const modifiedState = { foo: 'bert' };
    const fakeAction = (_: testState) => Promise.resolve(modifiedState);
    const fakeActionRegisteredName = 'FakeAction';

    store.registerAction(fakeActionRegisteredName, fakeAction);
    store.dispatch(fakeActionRegisteredName);

    // since the async action is coming at a later time we need to skip the initial state
    store.state.pipe(
      skip(1)
    ).subscribe((state) => {
      expect(state).to.equal(modifiedState);
      done();
    });
  });

  it('should support promised actions', done => {
    const { store } = createTestStore();
    const modifiedState = { foo: 'bert' };
    const fakeAction = (_: testState) => Promise.resolve(modifiedState);

    store.registerAction('FakeAction', fakeAction);
    store.dispatch(fakeAction);

    // since the async action is coming at a later time we need to skip the initial state
    store.state.pipe(
      skip(1)
    ).subscribe((state) => {
      expect(state).to.equal(modifiedState);
      done();
    });
  });

  it('should dispatch actions one after another', (done) => {
    const { store } = createTestStore();

    const actionA = (currentState: testState) => Promise.resolve({ foo: `${currentState.foo}A` });
    const actionB = (currentState: testState) => Promise.resolve({ foo: `${currentState.foo}B` });

    store.registerAction('Action A', actionA);
    store.registerAction('Action B', actionB);
    store.dispatch(actionA);
    store.dispatch(actionB);

    store.state.pipe(
      skip(2)
    ).subscribe((state: any) => {
      expect(state.foo).to.equal('barAB');
      done();
    });
  });

  it('should maintain queue of execution in concurrency constraints', () => {
    const { store } = createTestStore();
    stub((store as any).dispatchQueue, 'push');
    const handleQueueSpy = stub((store as any), 'handleQueue');

    const actionA = (_: testState) => Promise.resolve({ foo: 'A' });

    store.registerAction('Action A', actionA);
    store.dispatch(actionA);

    expect(handleQueueSpy).not.to.have.callCount(1);
  });

  it('should reset the state without going through the internal dispatch queue', async (done) => {
    const { initialState, store } = createTestStore();
    const internalDispatchSpy = stub((store as any), 'internalDispatch');
    const demoAction = (currentState: testState) => {
      return {...currentState,  foo: 'demo'};
    };

    store.registerAction('demoAction', demoAction);

    await store.dispatch(demoAction);
    internalDispatchSpy.reset();
    store.resetToState(initialState);

    store.state.subscribe((state) => {
      expect(internalDispatchSpy).not.to.have.callCount(1);
      expect(state.foo).to.equal(initialState.foo);
    });
  });
});
