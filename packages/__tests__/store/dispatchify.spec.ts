import { skip } from 'rxjs/operators';
import { DI, Registration } from '@aurelia/kernel';
import { assert } from '@aurelia/testing';
import { STORE, dispatchify, Store, UnregisteredActionError } from '@aurelia/store';

import { createTestStore, testState } from './helpers';

function arrange() {
  const container = DI.createContainer();
  const { store } = createTestStore();

  const fakeAction = (currentState: testState, param1: number, param2: number) => {
    return { ...currentState, foo: param1 + param2 };
  };

  STORE.container = container;

  return { store, container, fakeAction };
}

describe('dispatchify', function () {
  it('should help create dispatchifyable functions', function (done) {
    const { store, container, fakeAction } = arrange();

    store.registerAction('FakeAction', fakeAction as any);
    container.register(Registration.instance(Store, store));

    dispatchify((fakeAction as any))(1, 2).catch(() => { /**/ });

    store.state.pipe(
      skip(1)
    ).subscribe((state: any) => {
      assert.equal(state.foo, 3);
      done();
    });
  });

  it('should return the promise from dispatched calls', async function () {
    const { store, container, fakeAction } = arrange();

    store.registerAction('FakeAction', fakeAction as any);
    container.register(Registration.instance(Store, store));

    const result = dispatchify((fakeAction as any))(1, 2);
    assert.notEqual(result.then, undefined);

    await result;
  });

  it('should accept the reducers registered name', function (done) {
    const { store, container, fakeAction } = arrange();

    const fakeActionRegisteredName = 'FakeAction';

    store.registerAction(fakeActionRegisteredName, fakeAction as any);
    container.register(Registration.instance(Store, store));

    dispatchify(fakeActionRegisteredName)('A', 'B').catch(() => { /**/ });

    store.state.pipe(
      skip(1)
    ).subscribe((state: any) => {
      assert.equal(state.foo, 'AB');
      done();
    });
  });

  it('should throw if any string given that doesn\'t reflect a registered action name', async function () {
    const container = DI.createContainer();
    const { store } = createTestStore();

    STORE.container = container;

    const fakeAction = (currentState: testState, param1: number, param2: number) => {
      return { ...currentState, foo: param1 + param2 };
    };
    const fakeActionRegisteredName = 'FakeAction';

    store.registerAction(fakeActionRegisteredName, fakeAction as any);
    container.register(Registration.instance(Store, store));

    try {
      await dispatchify('ABC')('A', 'B');
    } catch(e) {
      assert.equal(e instanceof UnregisteredActionError, true);
    }
  });
});
