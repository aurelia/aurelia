import { DI, Registration } from '@aurelia/kernel';
import { expect } from 'chai';
import { skip } from 'rxjs/operators';
import { STORE, dispatchify, Store } from '@aurelia/store';
import { createTestStore, testState } from './helpers';

describe('dispatchify', () => {
  it('should help create dispatchifyable functions', done => {
    const container = DI.createContainer();
    const { store } = createTestStore();

    const fakeAction = (currentState: testState, param1: number, param2: number) => {
      return {...currentState,  foo: param1 + param2};
    };

    STORE.container = container;

    store.registerAction('FakeAction', fakeAction as any);
    container.register(Registration.instance(Store, store));

    dispatchify((fakeAction as any))(1, 2);

    store.state.pipe(
      skip(1)
    ).subscribe((state: any) => {
      expect(state.foo).to.equal(3);
      done();
    });
  });

  it('should return the promise from dispatched calls', async () => {
    const container = DI.createContainer();
    const { store } = createTestStore();

    const fakeAction = (currentState: testState, param1: number, param2: number) => {
      return {...currentState,  foo: param1 + param2};
    };

    STORE.container = container;

    store.registerAction('FakeAction', fakeAction as any);
    container.register(Registration.instance(Store, store));

    const result = dispatchify((fakeAction as any))(1, 2);
    expect(result.then).not.to.equal(undefined);

    await result;
  });

  it('should accept the reducers registered name', done => {
    const container = DI.createContainer();
    const { store } = createTestStore();

    const fakeAction = (currentState: testState, param1: number, param2: number) => {
      return {...currentState,  foo: param1 + param2};
    };

    STORE.container = container;

    const fakeActionRegisteredName = 'FakeAction';

    store.registerAction(fakeActionRegisteredName, fakeAction as any);
    container.register(Registration.instance(Store, store));

    dispatchify(fakeActionRegisteredName)('A', 'B');

    store.state.pipe(
      skip(1)
    ).subscribe((state: any) => {
      expect(state.foo).to.equal('AB');
      done();
    });
  });

  // FIX: This test won't currently pass, needs to be fixed
  /*
  it('should throw if any string given that doesn\'t reflect a registered action name', async (done) => {
    const container = DI.createContainer();
    const { store } = createTestStore();

    STORE.container = container;

    const fakeAction = (currentState: testState, param1: number, param2: number) => {
      return {...currentState,  foo: param1 + param2};
    };
    const fakeActionRegisteredName = 'FakeAction';

    store.registerAction(fakeActionRegisteredName, fakeAction as any);
    container.register(Registration.instance(Store, store));

    // tslint:disable-next-line
    expect(dispatchify('ABC')('A', 'B')).throw;
  });
  */
});
