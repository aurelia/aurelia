'use strict';

const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { describe, it } = require('node:test');
const {
  markerStatVersion,
  runBrowserTests,
} = require('./run-browser-tests.cjs');
const {
  removeTestBuildMarker,
  writeTestBuildMarker,
} = require('./test-build-contract.cjs');

describe('browser test runner', () => {
  it('holds Karma auto-run until the current compiler output is refreshed', async () => {
    const testRoot = createCompiledBrowserFixture('browser-build');
    const env = coordinatedEnvironment(['router']);
    const processRef = new FakeProcess(env);
    const config = { autoWatch: true };
    const server = new FakeKarmaServer({ completeAfterSchedules: 1 });
    let markerListener;

    try {
      await runBrowserTests({
        env,
        processRef,
        testRoot,
        parseConfig: async () => config,
        createServer(_config, done) {
          server.done = done;
          return server;
        },
        watchFile(_file, _options, listener) {
          markerListener = listener;
        },
        unwatchFile() {},
      });

      assert.equal(config.autoWatch, false);
      assert.equal(server.starts, 1);
      assert.equal(server.refreshes, 1);
      assert.equal(server.schedules, 1);
      assert.equal(processRef.exitCode, 0);
      assert.equal(typeof markerListener, 'function');
    } finally {
      fs.rmSync(testRoot, { recursive: true, force: true });
    }
  });

  it('refreshes again only when a successful marker returns', async () => {
    const testRoot = createCompiledBrowserFixture('browser-build');
    const env = coordinatedEnvironment(['router']);
    const processRef = new FakeProcess(env);
    const server = new FakeKarmaServer();
    let markerListener;
    let unwatchCount = 0;

    try {
      const running = runBrowserTests({
        env,
        processRef,
        testRoot,
        parseConfig: async () => ({ autoWatch: true }),
        createServer(_config, done) {
          server.done = done;
          return server;
        },
        watchFile(_file, _options, listener) {
          markerListener = listener;
        },
        unwatchFile() {
          unwatchCount++;
        },
        setTimer(callback) {
          queueMicrotask(callback);
          return 1;
        },
        clearTimer() {},
      });
      await waitUntil(() => server.schedules === 1 && markerListener !== void 0);

      removeTestBuildMarker(testRoot);
      markerListener(markerStats(2, 0, 0), markerStats(1, 1, 20));
      await new Promise(resolve => setImmediate(resolve));
      assert.equal(server.refreshes, 1);
      assert.equal(server.schedules, 1);

      writeTestBuildMarker(testRoot, 'browser-build');
      markerListener(markerStats(3, 2, 20), markerStats(2, 0, 0));
      await waitUntil(() => server.schedules === 2);

      server.done(0);
      await running;
      assert.equal(server.refreshes, 2);
      assert.equal(processRef.exitCode, 0);
      assert.equal(unwatchCount, 1);
    } finally {
      fs.rmSync(testRoot, { recursive: true, force: true });
    }
  });

  it('stops Karma and reports failure when a full refresh fails', async () => {
    const testRoot = createCompiledBrowserFixture('browser-build');
    const env = coordinatedEnvironment([]);
    const processRef = new FakeProcess(env);
    const expected = new Error('refresh failed');
    const server = new FakeKarmaServer({ refreshError: expected });
    const errors = [];

    try {
      await runBrowserTests({
        env,
        processRef,
        testRoot,
        parseConfig: async () => ({ autoWatch: true }),
        createServer(_config, done) {
          server.done = done;
          return server;
        },
        watchFile() {},
        unwatchFile() {},
        onError(message, error) {
          errors.push([message, error]);
        },
      });

      assert.equal(server.stops, 1);
      assert.equal(processRef.exitCode, 1);
      assert.deepEqual(errors, [['Failed to refresh compiled browser tests:', expected]]);
    } finally {
      fs.rmSync(testRoot, { recursive: true, force: true });
    }
  });

  it('stops a started Karma server when marker watcher setup fails', async () => {
    const testRoot = createCompiledBrowserFixture('browser-build');
    const env = coordinatedEnvironment([]);
    const server = new FakeKarmaServer();
    const expected = new Error('watch setup failed');

    try {
      await assert.rejects(runBrowserTests({
        env,
        processRef: new FakeProcess(env),
        testRoot,
        parseConfig: async () => ({ autoWatch: true }),
        createServer(_config, done) {
          server.done = done;
          return server;
        },
        watchFile() {
          throw expected;
        },
        unwatchFile() {},
      }), expected);
      assert.equal(server.stops, 1);
    } finally {
      fs.rmSync(testRoot, { recursive: true, force: true });
    }
  });

  it('preserves ordinary Karma auto-watch behavior without a compiler token', async () => {
    const testRoot = createCompiledBrowserFixture();
    const env = { AURELIA_TEST_PATTERNS: '[]' };
    const config = { autoWatch: true };
    const server = new FakeKarmaServer({ completeOnStart: true });

    try {
      await runBrowserTests({
        env,
        processRef: new FakeProcess(env),
        testRoot,
        parseConfig: async () => config,
        createServer(_config, done) {
          server.done = done;
          return server;
        },
      });
      assert.equal(config.autoWatch, true);
      assert.equal(server.refreshes, 0);
      assert.equal(server.schedules, 0);
    } finally {
      fs.rmSync(testRoot, { recursive: true, force: true });
    }
  });

  it('cancels post-capture readiness when Karma closes during compilation', async () => {
    const testRoot = createCompiledBrowserFixture('browser-build');
    const env = coordinatedEnvironment([]);
    const server = new FakeKarmaServer({ completeAfterReady: true });
    let readinessCalls = 0;
    let watchCount = 0;

    try {
      const processRef = new FakeProcess(env);
      await runBrowserTests({
        env,
        processRef,
        testRoot,
        parseConfig: async () => ({ autoWatch: true }),
        createServer(_config, done) {
          server.done = done;
          return server;
        },
        waitForReady(_readState, options = {}) {
          if (++readinessCalls === 1) return Promise.resolve();
          return new Promise((_resolve, reject) => {
            options.signal.addEventListener('abort', () => {
              const error = new Error('aborted');
              error.name = 'AbortError';
              reject(error);
            }, { once: true });
          });
        },
        watchFile() {
          watchCount++;
        },
        unwatchFile() {},
      });

      assert.equal(processRef.exitCode, 0);
      assert.equal(readinessCalls, 2);
      assert.equal(watchCount, 0);
      assert.equal(server.refreshes, 0);
      assert.equal(server.schedules, 0);
    } finally {
      fs.rmSync(testRoot, { recursive: true, force: true });
    }
  });

  it('detects same-size marker replacements by their full file identity', () => {
    assert.notEqual(
      markerStatVersion(markerStats(2, 10, 20)),
      markerStatVersion(markerStats(1, 10, 20)),
    );
  });
});

class FakeProcess extends EventEmitter {
  constructor(env) {
    super();
    this.argv = ['node', 'run-browser-tests.cjs'];
    this.env = env;
    this.exitCode = undefined;
  }
}

class FakeKarmaServer extends EventEmitter {
  constructor(options = {}) {
    super();
    this.completeAfterSchedules = options.completeAfterSchedules;
    this.completeAfterReady = options.completeAfterReady === true;
    this.completeOnStart = options.completeOnStart === true;
    this.refreshError = options.refreshError;
    this.refreshes = 0;
    this.schedules = 0;
    this.starts = 0;
    this.stops = 0;
    this.executor = {
      schedule: () => {
        this.schedules++;
        if (this.schedules === this.completeAfterSchedules) this.done(0);
      },
    };
  }

  async start() {
    this.starts++;
    queueMicrotask(() => {
      this.emit('browsers_ready');
      if (this.completeAfterReady) this.done(0);
    });
    if (this.completeOnStart) this.done(0);
  }

  async refreshFiles() {
    this.refreshes++;
    if (this.refreshError !== void 0) throw this.refreshError;
  }

  get(name) {
    assert.equal(name, 'executor');
    return this.executor;
  }

  async stop() {
    this.stops++;
    this.done(0);
  }
}

function coordinatedEnvironment(patterns) {
  return {
    AURELIA_TEST_BUILD_TOKEN: 'browser-build',
    AURELIA_TEST_PATTERNS: JSON.stringify(patterns),
  };
}

function markerStats(ino, mtimeMs, size) {
  return { dev: 1, ino, ctimeMs: mtimeMs, mtimeMs, size };
}

async function waitUntil(predicate) {
  for (let attempt = 0; attempt < 30; attempt++) {
    if (predicate()) return;
    await new Promise(resolve => setImmediate(resolve));
  }
  throw new Error('Timed out waiting for the browser runner test state.');
}

function createCompiledBrowserFixture(buildToken) {
  const testRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'aurelia-browser-watch-'));
  const files = [
    'dist/setup-browser.js',
    'dist/router/route.spec.js',
    'dist/runtime/value.spec.js',
  ];
  for (const relativeFile of files) {
    const file = path.join(testRoot, relativeFile);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, '');
  }
  if (buildToken !== void 0) writeTestBuildMarker(testRoot, buildToken);
  return testRoot;
}
