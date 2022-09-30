import { IDisposable } from '@aurelia/kernel';
import { BrowserPlatform } from '@aurelia/platform-browser';
import { ConnectableSwitcher } from '@aurelia/runtime';
import { setPlatform, assert, ensureTaskQueuesEmpty, onFixtureCreated, IFixture } from '@aurelia/testing';

interface ExtendedSuite extends Mocha.Suite {
  $duration?: number;
}

function getRootSuite(suite: ExtendedSuite): ExtendedSuite {
  while (!suite.parent.root) {
    suite = suite.parent;
  }
  return suite;
}

export function $setup(platform: BrowserPlatform): void {
  setPlatform(platform);
  BrowserPlatform.set(globalThis, platform);

  const globalStart = platform.performanceNow();
  let firstTestStart = 0;

  let currentRootSuite: ExtendedSuite = (void 0)!;
  let currentSuite: ExtendedSuite = (void 0)!;
  let start: number;
  let fixtures: IFixture<unknown>[] = [];
  let fixtureHookHandler: IDisposable | undefined = void 0;

  // eslint-disable-next-line
  beforeEach(function() {
    (globalThis as any)['__DEV__'] = typeof process !== 'undefined' ? !!process.env.__DEV__ : false;
    start = platform.performanceNow();
    if (firstTestStart === 0) {
      firstTestStart = start;
      console.log(`Test initialization took ${Math.round(firstTestStart - globalStart)}ms`);
    }
    const totalElapsed = start - firstTestStart;
    const ts = new Date(totalElapsed).toISOString().slice(14, -1);

    const title = this.currentTest!.fullTitle();
    if (title.length > 1000) {
      console.log(`[${ts}] Super long title! "${title.slice(0, 1000)}...(+${title.length - 1000})"`);
    }
    const nextSuite = this.currentTest!.parent as ExtendedSuite;
    if (currentSuite !== nextSuite) {
      if (currentSuite !== void 0) {
        const duration = currentSuite.$duration;
        const total = currentSuite.total();
        const perTest = duration / total;
        if (perTest > 20) {
          console.log(`[${ts}] slow: ${String(total).padStart(5, ' ')} tests after ${String(Math.round(duration)).padStart(5, ' ')}ms (${String(Math.round(perTest)).padStart(3, ' ')}ms/test): "${currentSuite.fullTitle()}"`);
        }
      }
      currentSuite = nextSuite;
    }
    const nextRootSuite = getRootSuite(nextSuite);
    if (currentRootSuite !== nextRootSuite) {
      console.log(`[${ts}] > ${String(nextRootSuite.total()).padStart(5, ' ')} tests in "${nextRootSuite.fullTitle()}"`);
      currentRootSuite = nextRootSuite;
    }

    fixtureHookHandler = onFixtureCreated(fixture => {
      fixtures.push(fixture);
    });
  });

  // eslint-disable-next-line
  afterEach(function() {
    fixtureHookHandler?.dispose();
    fixtureHookHandler = void 0;

    const promises: (void | Promise<void>)[] = [];
    for (const fixture of fixtures) {
      if (!fixture.torn) {
        promises.push(fixture.tearDown());
      }
    }

    const cleanup = () => {
      const elapsed = platform.performanceNow() - start;
      let suite = currentSuite;
      do {
        suite.$duration = (suite.$duration ?? 0) + elapsed;
        suite = suite.parent;
      } while (suite);
      try {
        const shouldThrow = this.test?.isFailed();
        if (shouldThrow) {
          assert.areTaskQueuesEmpty();
        } else {
          try {
            assert.areTaskQueuesEmpty();
          } catch {
            console.log(`Failed test ${this.test?.title} with task queue not empted. Cleaning up.`);
            ensureTaskQueuesEmpty();
          }
        }
      } catch (ex) {
        ensureTaskQueuesEmpty();
        assertNoWatcher(false);
      }

      assertNoWatcher(true);
    };

    fixtures = [];
    if (promises.some(p => p instanceof Promise)) {
      return Promise.all(promises).then(cleanup);
    }

    cleanup();
  });

  const assertNoWatcher = (shouldThrow: boolean) => {
    let hasWatcher = false;
    let currentWatcher = ConnectableSwitcher.current;
    while (currentWatcher != null) {
      hasWatcher = true;
      ConnectableSwitcher.exit(currentWatcher);
      currentWatcher = ConnectableSwitcher.current;
    }
    if (hasWatcher) {
      if (shouldThrow) {
        throw new Error('There is still some watcher not removed.');
      } else {
        console.error('There is still some watcher not removed.');
      }
    }
  };
}
