'use strict';

/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const {
  getCompiledTestState,
  isNodeExcludedSpec,
  toPosixPath,
  waitForCompiledTests,
} = require('./compiled-tests.cjs');
const { readTestBuildToken, TEST_BUILD_MARKER } = require('./test-build-contract.cjs');
const { readTestPatterns } = require('./test-patterns.cjs');

const DEFAULT_RESTART_DELAY_MS = 200;
const DEFAULT_FORCE_KILL_DELAY_MS = 2_000;
const DEFAULT_CLOSE_TIMEOUT_MS = 2_000;
const TEST_WATCH_ROOTS_ENV = 'AURELIA_TEST_WATCH_ROOTS';

if (require.main === module) {
  runNodeTests().catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}

/**
 * @param {{ argv?: string[]; env?: NodeJS.ProcessEnv; processRef?: NodeJS.Process; fsApi?: typeof fs; spawnProcess?: typeof spawn }} [options]
 * @returns {Promise<void>}
 */
async function runNodeTests(options = {}) {
  const processRef = options.processRef ?? process;
  const fsApi = options.fsApi ?? fs;
  const spawnProcess = options.spawnProcess ?? spawn;
  const env = options.env ?? processRef.env;
  const { watch, patternArgs } = parseRunnerArgs(options.argv ?? processRef.argv.slice(2));
  const patterns = readTestPatterns(patternArgs, env);
  const buildToken = readTestBuildToken(env);
  const testRoot = path.resolve(__dirname, '..');
  const repoRoot = path.resolve(testRoot, '..', '..');
  const watchRoots = watch ? resolveDistWatchRoots(repoRoot, env) : [];
  const readState = () => getCompiledTestState({
    testRoot,
    patterns,
    buildToken,
    fsApi,
    isExcluded: isNodeExcludedSpec,
  });
  const spawnCurrentTests = () => {
    const state = readState();
    if (!state.buildReady || !state.setupReady || state.specFiles.length === 0) {
      console.log('Waiting for the current matching compiled node tests before restarting...');
      return null;
    }
    return spawnMocha({
      env,
      processRef,
      spawnProcess,
      specFiles: state.specFiles,
      testRoot,
    });
  };

  if (!watch) {
    const state = readState();
    assertTestsReady(state, patterns);
    const child = spawnMocha({
      env,
      processRef,
      spawnProcess,
      specFiles: state.specFiles,
      testRoot,
    });
    processRef.exitCode = await waitForChild(child);
    return;
  }

  console.log('Waiting for the initial compiled node tests...');
  await waitForCompiledTests(readState);

  let fatalErrorHandled = false;
  let controller;
  let restartScheduler;
  let watchService;
  const handleFatalError = error => {
    if (fatalErrorHandled) {
      return;
    }
    fatalErrorHandled = true;
    console.error(error);
    restartScheduler.cancel();
    watchService.close();
    void controller.stop().then(() => {
      processRef.exitCode = 1;
    });
  };

  controller = createChildController({
    spawnChild: spawnCurrentTests,
    onError: error => console.error(error),
    onFatalError: handleFatalError,
  });
  restartScheduler = createRestartScheduler(() => controller.requestRestart());
  watchService = createDistWatchService({
    fsApi,
    onChange: restartScheduler.schedule,
    roots: watchRoots,
    shouldRestart: (root, filename) => isDistWatchEvent(
      root,
      path.join(testRoot, 'dist'),
      buildToken !== void 0,
      filename,
    ),
  });
  watchService.start();
  installShutdownHandlers({
    controller,
    processRef,
    restartScheduler,
    watchService,
  });
  controller.start();
}

/**
 * @param {readonly string[]} argv
 * @returns {{ watch: boolean; patternArgs: string[] }}
 */
function parseRunnerArgs(argv) {
  return {
    watch: argv.includes('--watch'),
    patternArgs: argv.filter(argument => argument !== '--watch'),
  };
}

/**
 * @param {{ buildReady: boolean; setupReady: boolean; specFiles: readonly string[] }} state
 * @param {readonly string[]} patterns
 */
function assertTestsReady(state, patterns) {
  if (!state.buildReady) {
    throw new Error('Node tests are not ready: the current compiler build marker is missing.');
  }
  if (!state.setupReady) {
    throw new Error('Node tests are not built: dist/setup-node.js is missing.');
  }
  if (state.specFiles.length === 0) {
    const description = patterns.length === 0 ? '*' : patterns.join(', ');
    throw new Error(`No node test files matched pattern(s): ${description}`);
  }
}

/**
 * @param {{ env: NodeJS.ProcessEnv; processRef: NodeJS.Process; spawnProcess: typeof spawn; specFiles: readonly string[]; testRoot: string }} options
 * @returns {import('child_process').ChildProcess}
 */
function spawnMocha(options) {
  const mochaArgs = createMochaArgs(options.testRoot, options.specFiles);
  return options.spawnProcess(options.processRef.execPath, mochaArgs, {
    stdio: 'inherit',
    cwd: options.testRoot,
    env: {
      ...options.env,
      NODE_OPTIONS: addDevelopmentCondition(options.env.NODE_OPTIONS),
    },
  });
}

/**
 * @param {string} testRoot
 * @param {readonly string[]} specFiles
 * @returns {string[]}
 */
function createMochaArgs(testRoot, specFiles) {
  return [
    require.resolve('mocha/bin/mocha.js'),
    '--ui', 'bdd',
    '--reporter', 'min',
    '--colors',
    '--recursive',
    '--timeout', '5000',
    '--exclude', 'dist/integration/**/*.spec.js',
    '--exclude', 'dist/store-v1/**/*.spec.js',
    'dist/setup-node.js',
    ...specFiles.map(file => toPosixPath(path.relative(testRoot, file))),
  ];
}

/**
 * Keep caller-provided Node flags while ensuring package export conditions resolve development builds.
 *
 * @param {string | undefined} nodeOptions
 * @returns {string}
 */
function addDevelopmentCondition(nodeOptions) {
  const current = nodeOptions?.trim() ?? '';
  if (/(?:^|\s)--conditions(?:=|\s+)development(?:\s|$)/.test(current)) {
    return current;
  }
  return current === '' ? '--conditions=development' : `${current} --conditions=development`;
}

/**
 * @param {import('child_process').ChildProcess} child
 * @returns {Promise<number>}
 */
function waitForChild(child) {
  return new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('close', (code, signal) => {
      resolve(signal === null ? code ?? 0 : getSignalExitCode(signal));
    });
  });
}

/**
 * Serialize restarts through a single child slot. A rebuild may emit many file events while
 * Mocha is stopping; retaining one restart request avoids overlap without losing the rebuild.
 *
 * @param {{ spawnChild: () => import('child_process').ChildProcess | null; onError?: (error: unknown) => void; onFatalError?: (error: unknown) => void; forceKillDelayMs?: number; closeTimeoutMs?: number; setTimer?: typeof setTimeout; clearTimer?: typeof clearTimeout }} options
 */
function createChildController(options) {
  const onError = options.onError ?? (() => {});
  const onFatalError = options.onFatalError ?? onError;
  const forceKillDelayMs = options.forceKillDelayMs ?? DEFAULT_FORCE_KILL_DELAY_MS;
  const closeTimeoutMs = options.closeTimeoutMs ?? DEFAULT_CLOSE_TIMEOUT_MS;
  const setTimer = options.setTimer ?? setTimeout;
  const clearTimer = options.clearTimer ?? clearTimeout;
  let child = null;
  let closeTimeoutTimer = null;
  let forceKillTimer = null;
  let restartRequested = false;
  let stopping = false;
  let terminationRequested = false;
  let stopPromise = null;
  let resolveStop = null;

  function start() {
    launch();
  }

  function launch() {
    if (stopping || child !== null) {
      return;
    }

    restartRequested = false;
    let nextChild;
    try {
      nextChild = options.spawnChild();
    } catch (error) {
      onFatalError(error);
      return;
    }

    if (nextChild === null) {
      restartRequested = true;
      return;
    }

    child = nextChild;
    terminationRequested = false;
    nextChild.once('error', onFatalError);
    nextChild.once('close', () => handleClose(nextChild));
  }

  function requestRestart() {
    if (stopping) {
      return;
    }

    restartRequested = true;
    if (child === null) {
      launch();
    } else {
      terminate(child);
    }
  }

  function terminate(target) {
    if (terminationRequested) {
      return;
    }
    terminationRequested = true;

    let terminationSent = false;
    try {
      terminationSent = target.kill('SIGTERM');
    } catch (error) {
      onError(error);
    }

    if (!terminationSent) {
      forceKill(target);
      return;
    }

    forceKillTimer = setTimer(() => {
      forceKillTimer = null;
      forceKill(target);
    }, forceKillDelayMs);
  }

  function forceKill(target) {
    if (child !== target) {
      return;
    }
    closeTimeoutTimer = setTimer(() => {
      closeTimeoutTimer = null;
      if (child !== target) {
        return;
      }

      child = null;
      stopping = true;
      restartRequested = false;
      terminationRequested = false;
      try {
        target.unref?.();
      } catch (error) {
        onError(error);
      }
      const error = new Error('Node test process did not close after SIGKILL.');
      onFatalError(error);
      if (stopping) {
        resolveStop?.();
      }
    }, closeTimeoutMs);
    try {
      target.kill('SIGKILL');
    } catch (error) {
      onError(error);
    }
  }

  function handleClose(closedChild) {
    if (child !== closedChild) {
      return;
    }

    if (forceKillTimer !== null) {
      clearTimer(forceKillTimer);
      forceKillTimer = null;
    }
    if (closeTimeoutTimer !== null) {
      clearTimer(closeTimeoutTimer);
      closeTimeoutTimer = null;
    }

    child = null;
    terminationRequested = false;
    if (stopping) {
      resolveStop?.();
    } else if (restartRequested) {
      launch();
    }
  }

  function stop() {
    if (stopPromise !== null) {
      return stopPromise;
    }

    stopping = true;
    restartRequested = false;
    stopPromise = new Promise(resolve => {
      resolveStop = resolve;
    });

    if (child === null) {
      resolveStop();
    } else {
      terminate(child);
    }
    return stopPromise;
  }

  // The synchronous exit hook is only a last line of defence for unexpected process exits.
  // Signal-driven shutdown uses stop() so the child gets time to close its inherited streams.
  function stopImmediately() {
    if (child !== null) {
      try {
        child.kill('SIGKILL');
      } catch (error) {
        onError(error);
      }
    }
  }

  return {
    requestRestart,
    start,
    stop,
    stopImmediately,
  };
}

/**
 * @param {() => void} restart
 * @param {{ delayMs?: number; setTimer?: typeof setTimeout; clearTimer?: typeof clearTimeout }} [options]
 */
function createRestartScheduler(restart, options = {}) {
  const delayMs = options.delayMs ?? DEFAULT_RESTART_DELAY_MS;
  const setTimer = options.setTimer ?? setTimeout;
  const clearTimer = options.clearTimer ?? clearTimeout;
  let timer = null;

  function schedule() {
    if (timer !== null) {
      clearTimer(timer);
    }
    timer = setTimer(() => {
      timer = null;
      restart();
    }, delayMs);
  }

  function cancel() {
    if (timer !== null) {
      clearTimer(timer);
      timer = null;
    }
  }

  return { cancel, schedule };
}

/**
 * Watch the compiled test tree rather than its current spec list so newly emitted specs and
 * shared helpers restart the suite. Package dist roots are included because tests import
 * development-condition builds directly and must restart after those builds change.
 *
 * @param {{ fsApi?: typeof fs; onChange: () => void; roots: readonly string[]; shouldRestart?: (root: string, filename: string | Buffer | null | undefined) => boolean; refreshIntervalMs?: number; setIntervalFn?: typeof setInterval; clearIntervalFn?: typeof clearInterval; onError?: (error: unknown) => void }} options
 */
function createDistWatchService(options) {
  const fsApi = options.fsApi ?? fs;
  const refreshIntervalMs = options.refreshIntervalMs ?? 1_000;
  const setIntervalFn = options.setIntervalFn ?? setInterval;
  const clearIntervalFn = options.clearIntervalFn ?? clearInterval;
  const onError = options.onError ?? (error => console.error(error));
  const shouldRestart = options.shouldRestart ?? ((_root, filename) => isRuntimeOutputWatchEvent(filename));
  const watchers = new Map();
  let initialized = false;
  let refreshTimer = null;

  function refresh() {
    let rootsChanged = false;
    const roots = new Map();
    for (const root of options.roots) {
      try {
        const identity = readWatchRootIdentity(root, fsApi);
        if (identity !== null) {
          roots.set(root, identity);
        }
      } catch (error) {
        onError(error);
      }
    }

    for (const [root, registration] of watchers) {
      if (roots.get(root) !== registration.identity) {
        registration.watcher.close();
        watchers.delete(root);
        rootsChanged = true;
      }
    }

    for (const [root, identity] of roots) {
      if (watchers.has(root)) {
        continue;
      }
      try {
        const watcher = fsApi.watch(root, { recursive: true }, (eventType, filename) => {
          if (shouldRestart(root, filename)) {
            options.onChange(eventType, filename);
          }
        });
        watcher.on('error', error => {
          watcher.close();
          if (watchers.get(root)?.watcher === watcher) {
            watchers.delete(root);
          }
          onError(error);
        });
        watchers.set(root, { identity, watcher });
        rootsChanged = true;
      } catch (error) {
        onError(error);
      }
    }

    // A replacement may finish before the new watcher attaches, so the identity transition
    // itself must invalidate the currently running test process.
    if (initialized && rootsChanged) {
      options.onChange('rename', null);
    }
    initialized = true;
  }

  function start() {
    refresh();
    // This interval keeps the watcher alive while a clean build temporarily removes every dist root.
    refreshTimer = setIntervalFn(refresh, refreshIntervalMs);
  }

  function close() {
    if (refreshTimer !== null) {
      clearIntervalFn(refreshTimer);
      refreshTimer = null;
    }
    for (const registration of watchers.values()) {
      registration.watcher.close();
    }
    watchers.clear();
  }

  return { close, refresh, start };
}

/**
 * A watcher stays attached to the old filesystem object when a build replaces a dist
 * directory at the same path. Comparing directory identities lets the refresh pass re-arm it.
 *
 * @param {string} root
 * @param {typeof fs} fsApi
 * @returns {string | null}
 */
function readWatchRootIdentity(root, fsApi) {
  try {
    const stats = fsApi.statSync(root);
    return `${stats.dev}:${stats.ino}:${stats.birthtimeMs}`;
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

/**
 * Source maps and declarations are emitted beside JavaScript and can multiply one rebuild
 * into several unnecessary test runs. A missing filename is still significant because some
 * platforms omit it when they cannot identify which entry changed.
 *
 * @param {string | Buffer | null | undefined} filename
 * @returns {boolean}
 */
function isRuntimeOutputWatchEvent(filename) {
  if (filename == null) {
    return true;
  }
  const extension = path.extname(filename.toString()).toLowerCase();
  return extension === '.js'
    || extension === '.cjs'
    || extension === '.mjs'
    || extension === '.json';
}

/**
 * A coordinated test build publishes one marker after a complete zero-error emit. Package
 * outputs remain ordinary runtime events because their independent watchers have no shared marker.
 *
 * @param {string} root
 * @param {string} testDistRoot
 * @param {boolean} coordinatedBuild
 * @param {string | Buffer | null | undefined} filename
 */
function isDistWatchEvent(root, testDistRoot, coordinatedBuild, filename) {
  if (coordinatedBuild && root === testDistRoot) {
    return filename == null || path.basename(filename.toString()) === TEST_BUILD_MARKER;
  }
  return isRuntimeOutputWatchEvent(filename);
}

/**
 * Resolve only the package outputs selected by the dev command. Restricting the accepted
 * shape keeps a malformed environment value from turning a watcher into a repository-wide
 * or external filesystem subscription.
 *
 * @param {string} repoRoot
 * @param {NodeJS.ProcessEnv} env
 * @returns {string[]}
 */
function resolveDistWatchRoots(repoRoot, env) {
  let configuredRoots = [];
  const serializedRoots = env[TEST_WATCH_ROOTS_ENV];
  if (serializedRoots !== void 0) {
    try {
      configuredRoots = JSON.parse(serializedRoots);
    } catch {
      throw new Error(`${TEST_WATCH_ROOTS_ENV} must contain a JSON array of package dist roots.`);
    }
    if (!Array.isArray(configuredRoots)) {
      throw new Error(`${TEST_WATCH_ROOTS_ENV} must contain a JSON array of package dist roots.`);
    }
  }

  const roots = [path.join(repoRoot, 'packages', '__tests__', 'dist')];
  for (const configuredRoot of configuredRoots) {
    if (typeof configuredRoot !== 'string') {
      throw new Error(`${TEST_WATCH_ROOTS_ENV} entries must be repo-relative package dist roots.`);
    }
    const normalized = configuredRoot.replace(/\\/g, '/');
    if (!/^(?:packages|packages-tooling)\/[a-z0-9][a-z0-9-]*\/dist$/.test(normalized)) {
      throw new Error(`${TEST_WATCH_ROOTS_ENV} entries must be repo-relative package dist roots.`);
    }
    roots.push(path.resolve(repoRoot, ...normalized.split('/')));
  }
  return [...new Set(roots)];
}

/**
 * @param {{ controller: ReturnType<typeof createChildController>; processRef: NodeJS.Process; restartScheduler: ReturnType<typeof createRestartScheduler>; watchService: ReturnType<typeof createDistWatchService> }} options
 */
function installShutdownHandlers(options) {
  let shuttingDown = false;

  const shutdown = signal => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    options.restartScheduler.cancel();
    options.watchService.close();
    void options.controller.stop().then(() => {
      options.processRef.exit(getSignalExitCode(signal));
    });
  };

  options.processRef.once('SIGINT', () => shutdown('SIGINT'));
  options.processRef.once('SIGTERM', () => shutdown('SIGTERM'));
  options.processRef.once('exit', () => {
    options.restartScheduler.cancel();
    options.watchService.close();
    options.controller.stopImmediately();
  });
}

/**
 * @param {NodeJS.Signals} signal
 * @returns {number}
 */
function getSignalExitCode(signal) {
  return signal === 'SIGINT' ? 130 : signal === 'SIGKILL' ? 137 : 143;
}

module.exports = {
  addDevelopmentCondition,
  assertTestsReady,
  createChildController,
  createDistWatchService,
  createMochaArgs,
  createRestartScheduler,
  installShutdownHandlers,
  isDistWatchEvent,
  isRuntimeOutputWatchEvent,
  parseRunnerArgs,
  readWatchRootIdentity,
  resolveDistWatchRoots,
  runNodeTests,
  spawnMocha,
  waitForChild,
};
