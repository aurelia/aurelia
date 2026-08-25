'use strict';

const fs = require('fs');
const path = require('path');

const TEST_BUILD_TOKEN_ENV = 'AURELIA_TEST_BUILD_TOKEN';
const TEST_BUILD_MARKER = '.aurelia-test-build-ready.json';
/**
 * @param {{ format: (diagnostic: { code: number }) => string; invalidate: () => void; markReady: () => void; startCodes: readonly number[]; successCode: number; write: (message: string) => void }} options
 */
function createTestBuildStatusReporter(options) {
  return (diagnostic, _newLine, _compilerOptions, errorCount) => {
    options.write(options.format(diagnostic));
    if (options.startCodes.includes(diagnostic.code)) {
      options.invalidate();
    } else if (diagnostic.code === options.successCode && (errorCount ?? 0) === 0) {
      options.markReady();
    }
  };
}

/**
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {string | undefined}
 */
function readTestBuildToken(env = process.env) {
  const token = env[TEST_BUILD_TOKEN_ENV];
  if (token === void 0) {
    return void 0;
  }
  if (typeof token !== 'string' || token.length === 0 || token.length > 256 || /[\u0000-\u001f\u007f]/.test(token)) {
    throw new Error(`${TEST_BUILD_TOKEN_ENV} must be a non-empty printable token.`);
  }
  return token;
}

/**
 * @param {string} testRoot
 */
function getTestBuildMarkerPath(testRoot) {
  return path.join(testRoot, 'dist', TEST_BUILD_MARKER);
}

/**
 * @param {string} testRoot
 * @param {typeof fs} [fsApi]
 */
function removeTestBuildMarker(testRoot, fsApi = fs) {
  fsApi.rmSync(getTestBuildMarkerPath(testRoot), { force: true });
}

/**
 * Publish readiness with a rename so readers never observe a partial marker.
 *
 * @param {string} testRoot
 * @param {string} token
 * @param {typeof fs} [fsApi]
 */
function writeTestBuildMarker(testRoot, token, fsApi = fs) {
  const marker = getTestBuildMarkerPath(testRoot);
  const temporary = `${marker}.tmp`;
  fsApi.mkdirSync(path.dirname(marker), { recursive: true });
  fsApi.writeFileSync(temporary, `${JSON.stringify({ token })}\n`);
  fsApi.renameSync(temporary, marker);
}

/**
 * @param {string} testRoot
 * @param {string | undefined} expectedToken
 * @param {typeof fs} [fsApi]
 */
function isCurrentTestBuildReady(testRoot, expectedToken, fsApi = fs) {
  if (expectedToken === void 0) {
    return true;
  }
  try {
    const marker = JSON.parse(fsApi.readFileSync(getTestBuildMarkerPath(testRoot), 'utf8'));
    return marker?.token === expectedToken;
  } catch (error) {
    if (error instanceof SyntaxError || error?.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

/**
 * Remove compiled specs that no longer belong to the current TypeScript program before
 * publishing readiness. TypeScript watch does not delete outputs for removed or renamed roots.
 *
 * @param {string} testRoot
 * @param {readonly string[]} sourceFiles
 * @param {typeof fs} [fsApi]
 */
function removeOrphanedSpecOutputs(testRoot, sourceFiles, fsApi = fs) {
  const sourceRoot = path.resolve(testRoot, 'src');
  const distRoot = path.resolve(testRoot, 'dist');
  const expectedOutputs = new Set();
  for (const sourceFile of sourceFiles) {
    const absoluteSource = path.resolve(sourceFile);
    const relative = path.relative(sourceRoot, absoluteSource);
    if (
      (relative === '..' || relative.startsWith(`..${path.sep}`))
      || path.isAbsolute(relative)
      || !/\.spec\.tsx?$/i.test(relative)
    ) {
      continue;
    }
    expectedOutputs.add(path.resolve(distRoot, relative.replace(/\.tsx?$/i, '.js')));
  }

  for (const output of findCompiledSpecs(distRoot, fsApi)) {
    if (expectedOutputs.has(path.resolve(output))) {
      continue;
    }
    const relative = path.relative(distRoot, output);
    const declaration = path.resolve(distRoot, 'types', relative.replace(/\.js$/i, '.d.ts'));
    for (const staleFile of [output, `${output}.map`, declaration, `${declaration}.map`]) {
      fsApi.rmSync(staleFile, { force: true });
    }
  }
}

function findCompiledSpecs(root, fsApi, found = []) {
  let entries;
  try {
    entries = fsApi.readdirSync(root, { withFileTypes: true });
  } catch (error) {
    if (error?.code === 'ENOENT') return found;
    throw error;
  }
  for (const entry of entries) {
    const file = path.join(root, entry.name);
    if (entry.isDirectory()) {
      findCompiledSpecs(file, fsApi, found);
    } else if (entry.isFile() && entry.name.endsWith('.spec.js')) {
      found.push(file);
    }
  }
  return found;
}

module.exports = {
  TEST_BUILD_MARKER,
  TEST_BUILD_TOKEN_ENV,
  createTestBuildStatusReporter,
  getTestBuildMarkerPath,
  isCurrentTestBuildReady,
  readTestBuildToken,
  removeOrphanedSpecOutputs,
  removeTestBuildMarker,
  writeTestBuildMarker,
};
