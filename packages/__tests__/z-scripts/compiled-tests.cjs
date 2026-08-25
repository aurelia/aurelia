'use strict';

const fs = require('fs');
const path = require('path');
const {
  matchesTestPattern,
  normalizeTestPattern,
  stripTestSuffix,
  wildcardToRegExp,
} = require('./test-patterns.cjs');
const { isCurrentTestBuildReady } = require('./test-build-contract.cjs');

/**
 * @param {string} rootDir
 * @param {readonly string[]} patterns
 * @param {{ fsApi?: typeof fs; isExcluded?: (filePath: string) => boolean }} [options]
 * @returns {string[]}
 */
function findMatchingSpecFiles(rootDir, patterns, options = {}) {
  const normalizedPatterns = patterns
    .map(normalizePattern)
    .filter(Boolean);
  const files = getAllSpecFiles(rootDir, options);

  if (patterns.length === 0 || normalizedPatterns.includes('*')) {
    return files;
  }
  if (normalizedPatterns.length === 0) {
    return [];
  }

  return files.filter(file => {
    const relative = toPosixPath(path.relative(rootDir, file));
    const searchable = stripSpecSuffix(relative);
    return normalizedPatterns.some(pattern => matchesPattern(searchable, pattern));
  });
}

/**
 * @param {string} rootDir
 * @param {{ fsApi?: typeof fs; isExcluded?: (filePath: string) => boolean }} [options]
 * @returns {string[]}
 */
function getAllSpecFiles(rootDir, options = {}) {
  const fsApi = options.fsApi ?? fs;
  const isExcluded = options.isExcluded ?? (() => false);

  if (!fsApi.existsSync(rootDir)) {
    return [];
  }

  return walkSpecFiles(rootDir, fsApi)
    .filter(file => !isExcluded(file))
    .sort();
}

/**
 * @param {string} dir
 * @param {typeof fs} fsApi
 * @param {string[]} [found]
 * @returns {string[]}
 */
function walkSpecFiles(dir, fsApi, found = []) {
  let entries;
  try {
    entries = fsApi.readdirSync(dir, { withFileTypes: true });
  } catch (error) {
    // TypeScript may replace a compiled directory between existsSync and readdirSync.
    // The next watch event will rescan it, so a transient disappearance is an empty subtree.
    if (error?.code === 'ENOENT') {
      return found;
    }
    throw error;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkSpecFiles(fullPath, fsApi, found);
    } else if (entry.isFile() && entry.name.endsWith('.spec.js')) {
      found.push(fullPath);
    }
  }
  return found;
}

/**
 * @param {string} pattern
 * @returns {string}
 */
function normalizePattern(pattern) {
  return normalizeTestPattern(pattern);
}

/**
 * @param {string} value
 * @returns {string}
 */
function stripSpecSuffix(value) {
  return stripTestSuffix(value);
}

/**
 * @param {string} relativePath
 * @param {string} pattern
 * @returns {boolean}
 */
function matchesPattern(relativePath, pattern) {
  return matchesTestPattern(relativePath, pattern);
}

/**
 * @param {{ testRoot: string; patterns: readonly string[]; buildToken?: string; setupFile?: string; fsApi?: typeof fs; isExcluded?: (filePath: string) => boolean }} options
 * @returns {{ buildReady: boolean; setupReady: boolean; specFiles: string[] }}
 */
function getCompiledTestState(options) {
  const fsApi = options.fsApi ?? fs;
  const setupFile = path.join(options.testRoot, 'dist', options.setupFile ?? 'setup-node.js');
  const distRoot = path.join(options.testRoot, 'dist');
  return {
    buildReady: isCurrentTestBuildReady(options.testRoot, options.buildToken, fsApi),
    setupReady: fsApi.existsSync(setupFile),
    specFiles: findMatchingSpecFiles(distRoot, options.patterns, {
      fsApi,
      isExcluded: options.isExcluded,
    }),
  };
}

/**
 * Wait for actual compiler output rather than guessing how long the first watch build takes.
 * The state reader is injected so startup behavior remains deterministic in focused tests.
 *
 * @template T extends { buildReady?: boolean; setupReady: boolean; specFiles: readonly string[] }
 * @param {() => T} readState
 * @param {{ delay?: (milliseconds: number) => Promise<void>; intervalMs?: number; timeoutMs?: number; now?: () => number; signal?: AbortSignal }} [options]
 * @returns {Promise<T>}
 */
async function waitForCompiledTests(readState, options = {}) {
  const delay = options.delay ?? (milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)));
  const intervalMs = options.intervalMs ?? 100;
  const timeoutMs = options.timeoutMs ?? 60_000;
  const now = options.now ?? Date.now;
  const startedAt = now();

  while (true) {
    if (options.signal?.aborted) throw createAbortError();
    const state = readState();
    if (state.buildReady !== false && state.setupReady && state.specFiles.length > 0) {
      return state;
    }
    if (now() - startedAt >= timeoutMs) {
      const missing = state.buildReady === false
        ? 'the current compiler build marker'
        : state.setupReady ? 'matching compiled specs' : 'compiled setup and matching compiled specs';
      throw new Error(`Timed out waiting for ${missing}.`);
    }
    if (options.delay === void 0 && options.signal !== void 0) {
      await abortableDelay(intervalMs, options.signal);
    } else {
      await delay(intervalMs);
    }
  }
}

function abortableDelay(milliseconds, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, milliseconds);
    const onAbort = () => {
      clearTimeout(timer);
      reject(createAbortError());
    };
    signal.addEventListener('abort', onAbort, { once: true });
    if (signal.aborted) onAbort();
  });
}

function createAbortError() {
  const error = new Error('Waiting for compiled tests was aborted.');
  error.name = 'AbortError';
  return error;
}

/**
 * @param {string} filePath
 * @returns {boolean}
 */
function isNodeExcludedSpec(filePath) {
  const normalized = toPosixPath(filePath);
  return normalized.includes('/dist/integration/')
    || normalized.includes('/dist/store-v1/');
}

/**
 * @param {string} filePath
 * @returns {string}
 */
function toPosixPath(filePath) {
  return filePath.replace(/\\/g, '/');
}

module.exports = {
  findMatchingSpecFiles,
  getAllSpecFiles,
  getCompiledTestState,
  isNodeExcludedSpec,
  matchesPattern,
  normalizePattern,
  stripSpecSuffix,
  toPosixPath,
  waitForCompiledTests,
  wildcardToRegExp,
};
