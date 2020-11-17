import { IWatcher, WatcherSwitcher, ProxyObservable } from '@aurelia/runtime';
import { assert } from '@aurelia/testing';

describe('2-runtime/watcher-switcher.spec.ts', function () {
  it('enters/exits', function () {
    const dummyWatcher = {} as IWatcher;

    WatcherSwitcher.enter(dummyWatcher);
    assert.strictEqual(dummyWatcher, WatcherSwitcher.current);
    assert.strictEqual(true, WatcherSwitcher.watching);
    WatcherSwitcher.exit(dummyWatcher);
    assert.strictEqual(null, WatcherSwitcher.current);
    assert.strictEqual(false, WatcherSwitcher.watching);
  });

  it('throws when entering with the same watcher/null', function () {
    const dummyWatcher = {} as IWatcher;

    WatcherSwitcher.enter(dummyWatcher);
    assert.strictEqual(dummyWatcher, WatcherSwitcher.current);
    assert.strictEqual(true, WatcherSwitcher.watching);
    assert.throws(() => WatcherSwitcher.enter(dummyWatcher));
    assert.throws(() => WatcherSwitcher.enter(null));
    WatcherSwitcher.exit(dummyWatcher);
  });

  it('throws when exiting with non-peek watcher/null', function () {
    const dummyWatcher = {} as IWatcher;

    WatcherSwitcher.enter(dummyWatcher);
    assert.strictEqual(dummyWatcher, WatcherSwitcher.current);
    assert.strictEqual(true, WatcherSwitcher.watching);
    assert.throws(() => WatcherSwitcher.exit({} as IWatcher));
    assert.throws(() => WatcherSwitcher.exit(null));
    WatcherSwitcher.exit(dummyWatcher);
  });

  it('watches', () => {
    const logs = [];
    const loggingWatcher: IWatcher = {
      id: 0,
      observe(obj, key) {
        logs.push([obj, key]);
      },
      observeCollection(collection) {},
      observeLength(collection) {},
    };

    WatcherSwitcher.enter(loggingWatcher);
    assert.strictEqual(loggingWatcher, WatcherSwitcher.current);
    assert.strictEqual(true, WatcherSwitcher.watching);

    const obj = ProxyObservable.getProxy({
      profile: { first: 'first', last: 'last' },
    });
    obj.profile.first;

    assert.strictEqual(logs.length, 2);
    assert.deepStrictEqual(logs, [
      [ProxyObservable.getRaw(obj), 'profile'],
      [{ first: 'first', last: 'last' }, 'first'],
    ]);
    assert.strictEqual(logs.length, 2);

    WatcherSwitcher.exit(loggingWatcher);
  });

  it('watches + pause/resume', () => {
    const logs = [];
    const loggingWatcher: IWatcher = {
      id: 0,
      observe(obj, key) {
        logs.push([obj, key]);
      },
      observeCollection(collection) {},
      observeLength(collection) {},
    };

    WatcherSwitcher.enter(loggingWatcher);
    assert.strictEqual(loggingWatcher, WatcherSwitcher.current);
    assert.strictEqual(true, WatcherSwitcher.watching);

    const obj = ProxyObservable.getProxy({
      profile: { first: 'first', last: 'last' },
    });
    obj.profile.first;

    assert.strictEqual(logs.length, 2);
    assert.deepStrictEqual(logs, [
      [ProxyObservable.getRaw(obj), 'profile'],
      [{ first: 'first', last: 'last' }, 'first'],
    ]);
    assert.strictEqual(logs.length, 2);

    WatcherSwitcher.pause();
    obj.profile.first;
    assert.strictEqual(logs.length, 2);
    assert.deepStrictEqual(logs, [
      [ProxyObservable.getRaw(obj), 'profile'],
      [{ first: 'first', last: 'last' }, 'first'],
    ]);
    assert.strictEqual(logs.length, 2);
    WatcherSwitcher.resume();

    obj.profile.first;
    assert.strictEqual(logs.length, 4);
    assert.deepStrictEqual(logs, [
      [ProxyObservable.getRaw(obj), 'profile'],
      [{ first: 'first', last: 'last' }, 'first'],
      [ProxyObservable.getRaw(obj), 'profile'],
      [{ first: 'first', last: 'last' }, 'first'],
    ]);
    assert.strictEqual(logs.length, 4);

    WatcherSwitcher.exit(loggingWatcher);
  });
});
