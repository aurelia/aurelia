import { IConnectable, ConnectableSwitcher, ProxyObservable } from '@aurelia/runtime';
import { assert } from '@aurelia/testing';

describe('2-runtime/watcher-switcher.spec.ts', function () {
  it('enters/exits', function () {
    // eslint-disable-next-line
    const dummyWatcher: IConnectable = {} as IConnectable;

    ConnectableSwitcher.enter(dummyWatcher);
    assert.strictEqual(dummyWatcher, ConnectableSwitcher.current);
    assert.strictEqual(true, ConnectableSwitcher.connecting);
    ConnectableSwitcher.exit(dummyWatcher);
    assert.strictEqual(null, ConnectableSwitcher.current);
    assert.strictEqual(false, ConnectableSwitcher.connecting);
  });

  it('throws when entering with the same watcher/null', function () {
    // eslint-disable-next-line
    const dummyWatcher: IConnectable = {} as IConnectable;

    ConnectableSwitcher.enter(dummyWatcher);
    assert.strictEqual(dummyWatcher, ConnectableSwitcher.current);
    assert.strictEqual(true, ConnectableSwitcher.connecting);
    assert.throws(() => ConnectableSwitcher.enter(dummyWatcher));
    assert.throws(() => ConnectableSwitcher.enter(null));
    ConnectableSwitcher.exit(dummyWatcher);
  });

  it('throws when exiting with non-peek watcher/null', function () {
    // eslint-disable-next-line
    const dummyWatcher: IConnectable = {} as IConnectable;

    ConnectableSwitcher.enter(dummyWatcher);
    assert.strictEqual(dummyWatcher, ConnectableSwitcher.current);
    assert.strictEqual(true, ConnectableSwitcher.connecting);
    // eslint-disable-next-line
    assert.throws(() => ConnectableSwitcher.exit({} as IConnectable));
    assert.throws(() => ConnectableSwitcher.exit(null));
    ConnectableSwitcher.exit(dummyWatcher);
  });

  it('watches', function () {
    const logs = [];
    const loggingWatcher: IConnectable = {
      id: 0,
      observeProperty(obj, key) {
        logs.push([obj, key]);
      },
      observeCollection(collection) {/* empty */},
    };

    ConnectableSwitcher.enter(loggingWatcher);
    assert.strictEqual(loggingWatcher, ConnectableSwitcher.current);
    assert.strictEqual(true, ConnectableSwitcher.connecting);

    const obj = ProxyObservable.getProxy({
      profile: { first: 'first', last: 'last' },
    });
    // eslint-disable-next-line
    obj.profile.first;

    assert.strictEqual(logs.length, 2);
    assert.deepStrictEqual(logs, [
      [ProxyObservable.getRaw(obj), 'profile'],
      [{ first: 'first', last: 'last' }, 'first'],
    ]);
    assert.strictEqual(logs.length, 2);

    ConnectableSwitcher.exit(loggingWatcher);
  });

  it('watches + pause/resume', function () {
    const logs = [];
    const loggingWatcher: IConnectable = {
      id: 0,
      observeProperty(obj, key) {
        logs.push([obj, key]);
      },
      observeCollection(collection) {/* empty */},
    };

    ConnectableSwitcher.enter(loggingWatcher);
    assert.strictEqual(loggingWatcher, ConnectableSwitcher.current);
    assert.strictEqual(true, ConnectableSwitcher.connecting);

    const obj = ProxyObservable.getProxy({
      profile: { first: 'first', last: 'last' },
    });
    // eslint-disable-next-line
    obj.profile.first;

    assert.strictEqual(logs.length, 2);
    assert.deepStrictEqual(logs, [
      [ProxyObservable.getRaw(obj), 'profile'],
      [{ first: 'first', last: 'last' }, 'first'],
    ]);
    assert.strictEqual(logs.length, 2);

    ConnectableSwitcher.pause();
    // eslint-disable-next-line
    obj.profile.first;
    assert.strictEqual(logs.length, 2);
    assert.deepStrictEqual(logs, [
      [ProxyObservable.getRaw(obj), 'profile'],
      [{ first: 'first', last: 'last' }, 'first'],
    ]);
    assert.strictEqual(logs.length, 2);
    ConnectableSwitcher.resume();

    // eslint-disable-next-line
    obj.profile.first;
    assert.strictEqual(logs.length, 4);
    assert.deepStrictEqual(logs, [
      [ProxyObservable.getRaw(obj), 'profile'],
      [{ first: 'first', last: 'last' }, 'first'],
      [ProxyObservable.getRaw(obj), 'profile'],
      [{ first: 'first', last: 'last' }, 'first'],
    ]);
    assert.strictEqual(logs.length, 4);

    ConnectableSwitcher.exit(loggingWatcher);
  });
});
