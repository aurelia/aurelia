'use strict';

/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const karma = require('karma');
const { getCompiledTestState, waitForCompiledTests } = require('./compiled-tests.cjs');
const {
  getTestBuildMarkerPath,
  isCurrentTestBuildReady,
  readTestBuildToken,
} = require('./test-build-contract.cjs');
const { readTestPatterns } = require('./test-patterns.cjs');
const { createDistWatchService, resolveDistWatchRoots } = require('./run-node-tests.cjs');

const DEFAULT_REFRESH_DELAY_MS = 50;

if (require.main === module) {
  runBrowserTests().catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}

/**
 * Coordinated dev mode starts Karma without auto-run, then refreshes and schedules only while
 * the current compiler marker is stable. Direct Karma invocations retain their ordinary watcher.
 *
 * @param {{ argv?: string[]; env?: NodeJS.ProcessEnv; processRef?: NodeJS.Process; testRoot?: string; waitForReady?: typeof waitForCompiledTests; parseConfig?: typeof karma.config.parseConfig; createServer?: (config: unknown, done: (code?: number) => void) => { start(): Promise<void>; stop(): Promise<void>; refreshFiles(): Promise<unknown>; get(name: string): { schedule(): void }; once(name: string, listener: () => void): void; off(name: string, listener: () => void): void }; watchFile?: typeof fs.watchFile; unwatchFile?: typeof fs.unwatchFile; setTimer?: typeof setTimeout; clearTimer?: typeof clearTimeout; setIntervalFn?: typeof setInterval; clearIntervalFn?: typeof clearInterval; refreshDelayMs?: number; onError?: (message: string, error: unknown) => void }} [options]
 */
async function runBrowserTests(options = {}) {
  const processRef = options.processRef ?? process;
  const onError = options.onError ?? ((message, error) => console.error(message, error));
  const env = options.env ?? processRef.env;
  const testRoot = options.testRoot ?? path.resolve(__dirname, '..');
  const repoRoot = path.resolve(testRoot, '..', '..');
  const testDistRoot = path.join(testRoot, 'dist');
  const patterns = readTestPatterns(options.argv ?? processRef.argv.slice(2), env);
  const buildToken = readTestBuildToken(env);
  const coordinatedBuild = buildToken !== void 0;
  const readState = () => getCompiledTestState({
    testRoot,
    patterns,
    buildToken,
    setupFile: 'setup-browser.js',
  });

  console.log('Waiting for the initial compiled browser tests...');
  await (options.waitForReady ?? waitForCompiledTests)(readState);

  const parseConfig = options.parseConfig ?? karma.config.parseConfig;
  const config = await parseConfig(
    path.join(testRoot, 'karma.conf.cjs'),
    { browsers: ['ChromeDebugging'] },
    { promiseConfig: true, throwErrors: true },
  );
  if (coordinatedBuild) config.autoWatch = false;

  let complete;
  let serverCompleted = false;
  const completed = new Promise(resolve => {
    complete = code => {
      serverCompleted = true;
      resolve(code);
    };
  });
  const server = options.createServer === void 0
    ? new karma.Server(config, complete)
    : options.createServer(config, complete);
  const browserReady = waitForBrowserReady(server, completed);
  let closeMarkerWatch = () => {};
  let packageWatchService = null;
  let infrastructureFailed = false;
  let serverStarted = false;
  let shuttingDown = false;
  const refreshScheduler = createRefreshScheduler(
    async () => {
      if (shuttingDown || infrastructureFailed || buildToken === void 0) return;
      const markerVersion = readMarkerVersion(testRoot);
      if (!isCurrentTestBuildReady(testRoot, buildToken) || markerVersion === null) return;
      await server.refreshFiles();
      if (
        shuttingDown
        || !isCurrentTestBuildReady(testRoot, buildToken)
        || readMarkerVersion(testRoot) !== markerVersion
      ) return;
      server.get('executor').schedule();
    },
    async error => {
      if (infrastructureFailed) return;
      infrastructureFailed = true;
      onError('Failed to refresh compiled browser tests:', error);
      await server.stop();
    },
    options,
  );

  try {
    await server.start();
    serverStarted = true;

    if (coordinatedBuild) {
      const captured = await browserReady;
      if (!captured) {
        processRef.exitCode = await completed;
        return;
      }
      const readinessController = new AbortController();
      const readiness = (options.waitForReady ?? waitForCompiledTests)(readState, {
        signal: readinessController.signal,
      });
      const ready = await Promise.race([
        readiness.then(() => true),
        completed.then(() => false),
      ]);
      if (!ready || serverCompleted) {
        readinessController.abort();
        try {
          await readiness;
        } catch (error) {
          if (error?.name !== 'AbortError') throw error;
        }
        processRef.exitCode = await completed;
        return;
      }
      closeMarkerWatch = watchBuildMarker(testRoot, refreshScheduler.schedule, options);
      const packageRoots = resolveDistWatchRoots(repoRoot, env).filter(root => root !== testDistRoot);
      if (packageRoots.length > 0) {
        packageWatchService = createDistWatchService({
          fsApi: fs,
          onChange: refreshScheduler.schedule,
          roots: packageRoots,
          setIntervalFn: options.setIntervalFn,
          clearIntervalFn: options.clearIntervalFn,
          onError: error => onError('Failed to watch framework package output:', error),
        });
        packageWatchService.start();
      }
      await refreshScheduler.run();
    }

    const code = await completed;
    processRef.exitCode = infrastructureFailed ? 1 : code ?? 0;
  } catch (error) {
    if (serverStarted) {
      infrastructureFailed = true;
      try {
        await server.stop();
      } catch (stopError) {
        onError('Failed to stop Karma after browser runner setup failed:', stopError);
      }
    }
    throw error;
  } finally {
    shuttingDown = true;
    closeMarkerWatch();
    packageWatchService?.close();
    await refreshScheduler.close();
  }
}

function waitForBrowserReady(server, completed) {
  return new Promise(resolve => {
    const onReady = () => {
      cleanup();
      resolve(true);
    };
    const cleanup = () => server.off('browsers_ready', onReady);
    server.once('browsers_ready', onReady);
    void completed.then(() => {
      cleanup();
      resolve(false);
    });
  });
}

function watchBuildMarker(testRoot, onChange, options) {
  const marker = getTestBuildMarkerPath(testRoot);
  const watchFile = options.watchFile ?? fs.watchFile;
  const unwatchFile = options.unwatchFile ?? fs.unwatchFile;
  const listener = (current, previous) => {
    if (markerStatVersion(current) !== markerStatVersion(previous)) onChange();
  };
  watchFile(marker, { interval: 100 }, listener);
  return () => unwatchFile(marker, listener);
}

function readMarkerVersion(testRoot) {
  try {
    return markerStatVersion(fs.statSync(getTestBuildMarkerPath(testRoot)));
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

function markerStatVersion(stats) {
  return `${stats.dev}:${stats.ino}:${stats.ctimeMs}:${stats.mtimeMs}:${stats.size}`;
}

function createRefreshScheduler(refresh, onError, options = {}) {
  const delayMs = options.refreshDelayMs ?? DEFAULT_REFRESH_DELAY_MS;
  const setTimer = options.setTimer ?? setTimeout;
  const clearTimer = options.clearTimer ?? clearTimeout;
  let closed = false;
  let pending = Promise.resolve();
  let timer = null;

  function run() {
    if (closed) return pending;
    pending = pending.then(refresh).catch(onError);
    return pending;
  }

  function schedule() {
    if (closed) return;
    if (timer !== null) clearTimer(timer);
    timer = setTimer(() => {
      timer = null;
      void run();
    }, delayMs);
  }

  async function close() {
    closed = true;
    if (timer !== null) {
      clearTimer(timer);
      timer = null;
    }
    await pending;
  }

  return { close, run, schedule };
}

module.exports = {
  createRefreshScheduler,
  markerStatVersion,
  readMarkerVersion,
  runBrowserTests,
  waitForBrowserReady,
  watchBuildMarker,
};
