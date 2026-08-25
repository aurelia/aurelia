'use strict';

const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { afterEach, describe, it } = require('node:test');
const {
  findMatchingSpecFiles,
  getAllSpecFiles,
  getCompiledTestState,
  matchesPattern,
  waitForCompiledTests,
} = require('./compiled-tests.cjs');
const {
  addDevelopmentCondition,
  createChildController,
  createDistWatchService,
  createRestartScheduler,
  isDistWatchEvent,
  isRuntimeOutputWatchEvent,
  parseRunnerArgs,
  resolveDistWatchRoots,
} = require('./run-node-tests.cjs');
const { readTestPatterns } = require('./test-patterns.cjs');
const { writeTestBuildMarker } = require('./test-build-contract.cjs');

const temporaryDirectories = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

describe('test pattern contract', () => {
  it('uses JSON environment patterns without passing them through a shell', () => {
    const patterns = ['router/**/*.spec.ts', 'name with spaces', 'value; echo untouched'];
    assert.deepEqual(
      readTestPatterns(['ignored-cli-pattern'], { AURELIA_TEST_PATTERNS: JSON.stringify(patterns) }),
      patterns,
    );
  });

  it('falls back to direct CLI arguments', () => {
    assert.deepEqual(readTestPatterns(['router', 'runtime-html'], {}), ['router', 'runtime-html']);
  });

  it('rejects malformed environment values', () => {
    assert.throws(
      () => readTestPatterns([], { AURELIA_TEST_PATTERNS: 'router' }),
      /JSON array/,
    );
    assert.throws(
      () => readTestPatterns([], { AURELIA_TEST_PATTERNS: '["router", 1]' }),
      /non-empty strings/,
    );
  });

  it('removes only the runner watch flag from CLI patterns', () => {
    assert.deepEqual(parseRunnerArgs(['--watch', 'router*', 'a pattern']), {
      watch: true,
      patternArgs: ['router*', 'a pattern'],
    });
  });
});

describe('compiled spec selection', () => {
  it('matches wildcards and treats regex punctuation literally', () => {
    assert.equal(matchesPattern('router/child-route1', 'router/*-route?'), true);
    assert.equal(matchesPattern('router/nested/child-route1', 'router/*-route?'), false);
    assert.equal(matchesPattern('router/route', 'router/**/route'), true);
    assert.equal(matchesPattern('router/nested/route', 'router/**/route'), true);
    assert.equal(matchesPattern('runtime/foo[1]-bar', 'foo[1]*'), true);
    assert.equal(matchesPattern('runtime/foo1-bar', 'foo[1]*'), false);
    assert.equal(matchesPattern('runtime/foo.bar', 'foo.bar'), true);
  });

  it('normalizes source-style patterns and excludes node-only suites', () => {
    const testRoot = createFixtureTree([
      'dist/setup-node.js',
      'dist/router/route.spec.js',
      'dist/router/nested/child.spec.js',
      'dist/integration/ignored.spec.js',
    ]);
    const distRoot = path.join(testRoot, 'dist');
    const selected = findMatchingSpecFiles(distRoot, ['src/router/**/*.spec.ts'], {
      isExcluded: file => file.includes(`${path.sep}integration${path.sep}`),
    });

    assert.deepEqual(selected, [
      path.join(distRoot, 'router', 'nested', 'child.spec.js'),
      path.join(distRoot, 'router', 'route.spec.js'),
    ]);
  });

  it('does not turn a nonempty pattern that normalizes away into the full suite', () => {
    const testRoot = createFixtureTree([
      'dist/runtime/value.spec.js',
      'dist/router/route.spec.js',
    ]);

    assert.deepEqual(findMatchingSpecFiles(path.join(testRoot, 'dist'), ['.spec.ts']), []);
  });

  it('reports setup and matching spec readiness separately', () => {
    const testRoot = createFixtureTree([
      'dist/setup-browser.js',
      'dist/runtime/value.spec.js',
    ]);

    assert.deepEqual(getCompiledTestState({
      testRoot,
      patterns: ['runtime'],
      setupFile: 'setup-browser.js',
    }), {
      buildReady: true,
      setupReady: true,
      specFiles: [path.join(testRoot, 'dist', 'runtime', 'value.spec.js')],
    });
  });

  it('does not accept compiled output from an earlier dev invocation', () => {
    const testRoot = createFixtureTree([
      'dist/setup-node.js',
      'dist/runtime/value.spec.js',
    ]);
    writeTestBuildMarker(testRoot, 'previous-build');

    assert.equal(getCompiledTestState({
      testRoot,
      patterns: ['runtime'],
      buildToken: 'current-build',
    }).buildReady, false);

    writeTestBuildMarker(testRoot, 'current-build');
    assert.equal(getCompiledTestState({
      testRoot,
      patterns: ['runtime'],
      buildToken: 'current-build',
    }).buildReady, true);
  });

  it('treats a compiled directory removed during scanning as a transient empty subtree', () => {
    const missingDirectory = Object.assign(new Error('removed during build'), { code: 'ENOENT' });
    const fsApi = {
      existsSync: () => true,
      readdirSync(directory) {
        if (directory === 'dist') {
          return [{
            name: 'runtime',
            isDirectory: () => true,
            isFile: () => false,
          }];
        }
        throw missingDirectory;
      },
    };

    assert.deepEqual(getAllSpecFiles('dist', { fsApi }), []);
  });

  it('waits until both setup and a matching spec exist', async () => {
    const states = [
      { buildReady: false, setupReady: false, specFiles: [] },
      { buildReady: true, setupReady: true, specFiles: [] },
      { buildReady: true, setupReady: true, specFiles: ['dist/runtime/value.spec.js'] },
    ];
    let index = 0;
    let now = 0;

    const state = await waitForCompiledTests(
      () => states[Math.min(index, states.length - 1)],
      {
        delay: async milliseconds => {
          now += milliseconds;
          index++;
        },
        intervalMs: 10,
        now: () => now,
        timeoutMs: 100,
      },
    );

    assert.equal(state, states[2]);
  });

  it('cancels compiler readiness polling during managed shutdown', async () => {
    const controller = new AbortController();
    const waiting = waitForCompiledTests(
      () => ({ buildReady: false, setupReady: false, specFiles: [] }),
      { intervalMs: 10_000, signal: controller.signal },
    );
    controller.abort();
    await assert.rejects(waiting, error => error?.name === 'AbortError');
  });
});

describe('node process environment', () => {
  it('preserves existing NODE_OPTIONS while adding the development condition', () => {
    assert.equal(addDevelopmentCondition(void 0), '--conditions=development');
    assert.equal(
      addDevelopmentCondition('--max-old-space-size=4096 --trace-warnings'),
      '--max-old-space-size=4096 --trace-warnings --conditions=development',
    );
  });

  it('does not duplicate an existing development condition', () => {
    assert.equal(
      addDevelopmentCondition('--conditions=development --trace-warnings'),
      '--conditions=development --trace-warnings',
    );
    assert.equal(
      addDevelopmentCondition('--conditions development'),
      '--conditions development',
    );
  });
});

describe('watch process lifecycle', () => {
  it('tracks the initial child and serializes repeated restart requests', () => {
    const children = [];
    let currentSpecs = ['first.spec.js'];
    const spawnedSpecs = [];
    const controller = createChildController({
      spawnChild() {
        spawnedSpecs.push([...currentSpecs]);
        const child = new FakeChild();
        children.push(child);
        return child;
      },
    });

    controller.start();
    currentSpecs = ['second.spec.js', 'new.spec.js'];
    controller.requestRestart();
    controller.requestRestart();

    assert.deepEqual(children[0].signals, ['SIGTERM']);
    assert.equal(children.length, 1);

    children[0].emit('close', 0, null);
    assert.equal(children.length, 2);
    assert.deepEqual(spawnedSpecs, [
      ['first.spec.js'],
      ['second.spec.js', 'new.spec.js'],
    ]);
  });

  it('waits for the active child during shutdown and does not restart it', async () => {
    const children = [];
    const controller = createChildController({
      spawnChild() {
        const child = new FakeChild();
        children.push(child);
        return child;
      },
    });

    controller.start();
    controller.requestRestart();
    const stopped = controller.stop();
    children[0].emit('close', 0, null);
    await stopped;

    assert.equal(children.length, 1);
    controller.requestRestart();
    assert.equal(children.length, 1);
  });

  it('force-kills a child that does not close after SIGTERM', async () => {
    let forceKill;
    const child = new FakeChild();
    const controller = createChildController({
      spawnChild: () => child,
      setTimer(callback) {
        forceKill = callback;
        return { unref() {} };
      },
      clearTimer() {},
    });

    controller.start();
    const stopped = controller.stop();
    forceKill();
    assert.deepEqual(child.signals, ['SIGTERM', 'SIGKILL']);
    child.emit('close', null, 'SIGKILL');
    await stopped;
  });

  it('settles with a fatal error when a force-killed child never closes', async () => {
    const timers = [];
    const child = new FakeChild();
    let fatalError;
    const controller = createChildController({
      spawnChild: () => child,
      onFatalError(error) {
        fatalError = error;
      },
      setTimer(callback) {
        timers.push(callback);
        return callback;
      },
      clearTimer() {},
    });

    controller.start();
    const stopped = controller.stop();
    timers[0]();
    timers[1]();
    await stopped;

    assert.deepEqual(child.signals, ['SIGTERM', 'SIGKILL']);
    assert.match(fatalError.message, /did not close after SIGKILL/);
  });

  it('handles a failed signal delivery without leaving shutdown pending', async () => {
    const timers = [];
    const child = new FakeChild();
    child.kill = signal => {
      child.signals.push(signal);
      return false;
    };
    let fatalError;
    const controller = createChildController({
      spawnChild: () => child,
      onFatalError(error) {
        fatalError = error;
      },
      setTimer(callback) {
        timers.push(callback);
        return callback;
      },
      clearTimer() {},
    });

    controller.start();
    const stopped = controller.stop();
    assert.deepEqual(child.signals, ['SIGTERM', 'SIGKILL']);
    timers[0]();
    await stopped;

    assert.match(fatalError.message, /did not close after SIGKILL/);
  });

  it('reports a synchronous child launch failure instead of waiting for another file event', () => {
    const expected = new Error('spawn failed');
    let reported;
    const controller = createChildController({
      spawnChild() {
        throw expected;
      },
      onFatalError(error) {
        reported = error;
      },
    });

    controller.start();
    assert.equal(reported, expected);
  });

  it('reports an asynchronous child process failure', () => {
    const expected = new Error('child process failed');
    const child = new FakeChild();
    let reported;
    const controller = createChildController({
      spawnChild: () => child,
      onFatalError(error) {
        reported = error;
      },
    });

    controller.start();
    child.emit('error', expected);
    assert.equal(reported, expected);
  });

  it('debounces file bursts into one restart', () => {
    const scheduled = [];
    const cancelled = [];
    let restarts = 0;
    const scheduler = createRestartScheduler(() => restarts++, {
      setTimer(callback) {
        scheduled.push(callback);
        return scheduled.length;
      },
      clearTimer(timer) {
        cancelled.push(timer);
      },
    });

    scheduler.schedule();
    scheduler.schedule();
    scheduled[1]();

    assert.deepEqual(cancelled, [1]);
    assert.equal(restarts, 1);
  });
});

describe('watch coverage', () => {
  it('restarts only for runtime outputs or an unspecified changed file', () => {
    assert.equal(isRuntimeOutputWatchEvent('runtime.js'), true);
    assert.equal(isRuntimeOutputWatchEvent(Buffer.from('package.json')), true);
    assert.equal(isRuntimeOutputWatchEvent('runtime.d.ts'), false);
    assert.equal(isRuntimeOutputWatchEvent('runtime.js.map'), false);
    assert.equal(isRuntimeOutputWatchEvent(null), true);
  });

  it('waits for the successful build marker before restarting coordinated test output', () => {
    const testDist = path.join('repo', 'packages', '__tests__', 'dist');
    const packageDist = path.join('repo', 'packages', 'runtime', 'dist');
    assert.equal(isDistWatchEvent(testDist, testDist, true, 'value.spec.js'), false);
    assert.equal(isDistWatchEvent(testDist, testDist, true, '.aurelia-test-build-ready.json'), true);
    assert.equal(isDistWatchEvent(testDist, testDist, true, null), true);
    assert.equal(isDistWatchEvent(packageDist, testDist, true, 'index.dev.mjs'), true);
    assert.equal(isDistWatchEvent(testDist, testDist, false, 'value.spec.js'), true);
  });

  it('resolves only configured package roots alongside the test dist', () => {
    const repoRoot = createFixtureTree([]);
    const roots = resolveDistWatchRoots(repoRoot, {
      AURELIA_TEST_WATCH_ROOTS: JSON.stringify([
        'packages/kernel/dist',
        'packages/kernel/dist',
        'packages-tooling/vite-plugin/dist',
      ]),
    });

    assert.deepEqual(new Set(roots), new Set([
      path.join(repoRoot, 'packages', '__tests__', 'dist'),
      path.join(repoRoot, 'packages', 'kernel', 'dist'),
      path.join(repoRoot, 'packages-tooling', 'vite-plugin', 'dist'),
    ]));
  });

  it('rejects broad, external, and malformed watch roots', () => {
    const repoRoot = createFixtureTree([]);
    for (const configuredRoot of ['.', '../outside', 'packages', 'packages/kernel/src', 'C:/outside/dist']) {
      assert.throws(() => resolveDistWatchRoots(repoRoot, {
        AURELIA_TEST_WATCH_ROOTS: JSON.stringify([configuredRoot]),
      }), /repo-relative package dist roots/);
    }
    assert.throws(() => resolveDistWatchRoots(repoRoot, {
      AURELIA_TEST_WATCH_ROOTS: '{',
    }), /JSON array/);
  });

  it('watches each dist recursively and closes every watcher', () => {
    const repoRoot = createFixtureTree([
      'packages/__tests__/dist/setup-node.js',
      'packages/kernel/dist/index.js',
      'packages/runtime/dist/index.js',
      'packages/dialog/src/index.ts',
    ]);
    const watched = [];
    const watchers = [];
    const watchCallbacks = [];
    let changes = 0;
    const fsApi = {
      statSync: fs.statSync,
      watch(root, options, callback) {
        const watcher = new FakeWatcher();
        watched.push({ root, options });
        watchers.push(watcher);
        watchCallbacks.push(callback);
        return watcher;
      },
    };
    const service = createDistWatchService({
      fsApi,
      onChange() {
        changes++;
      },
      roots: resolveDistWatchRoots(repoRoot, {
        AURELIA_TEST_WATCH_ROOTS: JSON.stringify([
          'packages/kernel/dist',
          'packages/dialog/dist',
        ]),
      }),
      setIntervalFn() {
        return { unref() {} };
      },
      clearIntervalFn() {},
    });

    service.start();
    assert.equal(watched.length, 2);
    assert.equal(watched.every(entry => entry.options.recursive === true), true);
    assert.equal(watched.some(entry => entry.root.includes(`${path.sep}runtime${path.sep}`)), false);

    watchCallbacks[0]('change', 'setup-node.js.map');
    watchCallbacks[0]('change', 'setup-node.js');
    assert.equal(changes, 1);

    fs.mkdirSync(path.join(repoRoot, 'packages', 'dialog', 'dist'));
    service.refresh();
    assert.equal(watched.length, 3);
    assert.equal(changes, 2);

    const kernelDist = path.join(repoRoot, 'packages', 'kernel', 'dist');
    const originalKernelWatcher = watchers[watched.findIndex(entry => entry.root === kernelDist)];
    fs.renameSync(kernelDist, `${kernelDist}-old`);
    fs.mkdirSync(kernelDist);
    service.refresh();
    assert.equal(watched.length, 4);
    assert.equal(originalKernelWatcher.closed, true);
    assert.equal(changes, 3);

    const dialogDist = path.join(repoRoot, 'packages', 'dialog', 'dist');
    fs.rmdirSync(dialogDist);
    service.refresh();
    assert.equal(changes, 4);
    fs.mkdirSync(dialogDist);
    service.refresh();
    assert.equal(changes, 5);

    service.close();
    assert.equal(watchers.every(watcher => watcher.closed), true);
  });
});

class FakeChild extends EventEmitter {
  constructor() {
    super();
    this.signals = [];
  }

  kill(signal) {
    this.signals.push(signal);
    return true;
  }
}

class FakeWatcher extends EventEmitter {
  constructor() {
    super();
    this.closed = false;
  }

  close() {
    this.closed = true;
  }
}

/**
 * @param {readonly string[]} files
 * @returns {string}
 */
function createFixtureTree(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'aurelia-node-watch-'));
  temporaryDirectories.push(root);
  for (const relativeFile of files) {
    const file = path.join(root, relativeFile);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, '');
  }
  return root;
}
