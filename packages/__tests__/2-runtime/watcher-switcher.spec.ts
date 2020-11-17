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

  it('throws when entering the /exits', function () {
    const dummyWatcher: IWatcher = {
      id: 1,
      observe() {},
      observeCollection() {},
      observeLength() {}
    };

    WatcherSwitcher.enter(dummyWatcher);
    assert.strictEqual(dummyWatcher, WatcherSwitcher.current);
    assert.strictEqual(true, WatcherSwitcher.watching);
    WatcherSwitcher.exit(dummyWatcher);
    assert.strictEqual(null, WatcherSwitcher.current);
    assert.strictEqual(false, WatcherSwitcher.watching);
  });
});
