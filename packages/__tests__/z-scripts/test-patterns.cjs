'use strict';

const TEST_PATTERNS_ENV = 'AURELIA_TEST_PATTERNS';
const ALL_TESTS_PATTERN = '*';

/**
 * Read test patterns from the shared JSON environment contract or direct CLI arguments.
 *
 * The environment value wins when present so every concurrently started test process sees
 * exactly the same patterns without reconstructing shell commands for arbitrary user input.
 *
 * @param {readonly string[]} argv
 * @param {NodeJS.ProcessEnv} env
 * @returns {string[]}
 */
function readTestPatterns(argv = [], env = process.env) {
  let patterns = argv;
  const serializedPatterns = env[TEST_PATTERNS_ENV];

  if (serializedPatterns !== void 0) {
    try {
      patterns = JSON.parse(serializedPatterns);
    } catch {
      throw new Error(`${TEST_PATTERNS_ENV} must contain a JSON array of test patterns.`);
    }

    if (!Array.isArray(patterns)) {
      throw new Error(`${TEST_PATTERNS_ENV} must contain a JSON array of test patterns.`);
    }
  }

  if (!Array.isArray(patterns) || patterns.some(pattern => typeof pattern !== 'string' || pattern.trim().length === 0)) {
    throw new Error('Test patterns must be non-empty strings.');
  }

  return [...patterns];
}

/**
 * Normalize the source- and output-oriented forms developers commonly copy from diagnostics.
 * Selection itself always operates on a source-relative path without its spec/source suffix.
 *
 * @param {string} pattern
 * @returns {string}
 */
function normalizeTestPattern(pattern) {
  return stripTestSuffix(
    pattern
      .replace(/\\/g, '/')
      .replace(/^\.\//, '')
      .replace(/^(?:src|dist)\//, ''),
  );
}

/**
 * @param {string} value
 * @returns {string}
 */
function stripTestSuffix(value) {
  return value.replace(/(?:\.spec)?(?:\.(?:tsx?|js))?$/, '');
}

/**
 * Bare selectors retain the long-standing substring behavior. Adding a wildcard opts into
 * an anchored, path-aware glob: `*` and `?` stay within one segment while a globstar spans folders.
 *
 * @param {string} relativePath
 * @param {string} pattern
 * @returns {boolean}
 */
function matchesTestPattern(relativePath, pattern) {
  const searchable = normalizeTestPattern(relativePath);
  const normalizedPattern = normalizeTestPattern(pattern);

  if (normalizedPattern === ALL_TESTS_PATTERN) {
    return true;
  }
  if (hasWildcard(normalizedPattern)) {
    return wildcardToRegExp(normalizedPattern).test(searchable);
  }
  return normalizedPattern !== '' && searchable.includes(normalizedPattern);
}

/**
 * Produce TypeScript includes that select the same spec stems as matchesTestPattern. Imported
 * helpers are still followed by TypeScript, so targeted builds need only name their root specs.
 *
 * @param {readonly string[]} patterns
 * @param {string} [sourceRoot]
 * @returns {string[]}
 */
function expandTypeScriptTestIncludes(patterns, sourceRoot = 'src') {
  const normalizedPatterns = normalizePatterns(patterns);
  if (patterns.length === 0 || normalizedPatterns.includes(ALL_TESTS_PATTERN)) {
    return [`${sourceRoot}/**/*.ts`, `${sourceRoot}/**/*.tsx`];
  }

  return unique(normalizedPatterns.flatMap(pattern => hasWildcard(pattern)
    ? [
      createAnchoredSpecGlob(sourceRoot, pattern, 'ts'),
      createAnchoredSpecGlob(sourceRoot, pattern, 'tsx'),
    ]
    : [
      `${sourceRoot}/**/*${pattern}*.spec.ts`,
      `${sourceRoot}/**/*${pattern}*.spec.tsx`,
      `${sourceRoot}/**/*${pattern}*/**/*.spec.ts`,
      `${sourceRoot}/**/*${pattern}*/**/*.spec.tsx`,
    ]));
}

/**
 * Produce Karma globs from normalized selectors rather than interpolating raw command input.
 * Karma's glob grammar has more metacharacters than the dev selector contract, so the extras
 * are escaped while `*` and `?` retain their shared meaning.
 *
 * @param {readonly string[]} patterns
 * @param {string} baseUrl
 * @returns {string[]}
 */
function expandKarmaTestGlobs(patterns, baseUrl) {
  const root = baseUrl.replace(/\\/g, '/').replace(/\/$/, '');
  const normalizedPatterns = normalizePatterns(patterns);
  if (patterns.length === 0 || normalizedPatterns.includes(ALL_TESTS_PATTERN)) {
    return [`${root}/**/*.spec.js`];
  }

  return unique(normalizedPatterns.flatMap(pattern => {
    const escapedPattern = escapeKarmaGlobPattern(pattern);
    return hasWildcard(pattern)
      ? [createAnchoredSpecGlob(root, escapedPattern, 'js')]
      : [
        `${root}/**/*${escapedPattern}*.spec.js`,
        `${root}/**/*${escapedPattern}*/**/*.spec.js`,
      ];
  }));
}

/**
 * @param {readonly string[]} patterns
 * @returns {string[]}
 */
function normalizePatterns(patterns) {
  return patterns.map(normalizeTestPattern).filter(Boolean);
}

/**
 * @param {string} value
 * @returns {boolean}
 */
function hasWildcard(value) {
  return value.includes('*') || value.includes('?');
}

/**
 * Add the emitted spec suffix without changing the anchoring of the selector. A trailing
 * globstar represents descendants, so it needs one final filename segment before the suffix.
 *
 * @param {string} root
 * @param {string} pattern
 * @param {string} extension
 * @returns {string}
 */
function createAnchoredSpecGlob(root, pattern, extension) {
  if (pattern === '**') {
    return `${root}/**/*.spec.${extension}`;
  }

  const rootedPattern = pattern.includes('/') ? pattern : `**/${pattern}`;
  return pattern.endsWith('/**')
    ? `${root}/${rootedPattern}/*.spec.${extension}`
    : `${root}/${rootedPattern}.spec.${extension}`;
}

/**
 * @param {string} pattern
 * @returns {string}
 */
function escapeKarmaGlobPattern(pattern) {
  return pattern.replace(/[\[\]{}()+@!]/g, character => `[${character}]`);
}

/**
 * @param {string} pattern
 * @returns {RegExp}
 */
function wildcardToRegExp(pattern) {
  let source = '';
  for (let index = 0; index < pattern.length; index++) {
    const character = pattern[index];
    if (character === '*') {
      if (pattern[index + 1] === '*') {
        while (pattern[index + 1] === '*') {
          index++;
        }
        if (pattern[index + 1] === '/') {
          source += '(?:.*/)?';
          index++;
        } else {
          source += '.*';
        }
      } else {
        source += '[^/]*';
      }
    } else if (character === '?') {
      source += '[^/]';
    } else {
      source += escapeRegExp(character);
    }
  }
  const prefix = pattern.includes('/') ? '^' : '(?:^|.*/)';
  return new RegExp(`${prefix}${source}$`);
}

/**
 * @param {string} value
 * @returns {string}
 */
function escapeRegExp(value) {
  return value.replace(/[|\\{}()[\]^$+*?.-]/g, '\\$&');
}

/**
 * @param {readonly string[]} values
 * @returns {string[]}
 */
function unique(values) {
  return [...new Set(values)];
}

module.exports = {
  ALL_TESTS_PATTERN,
  TEST_PATTERNS_ENV,
  expandKarmaTestGlobs,
  expandTypeScriptTestIncludes,
  matchesTestPattern,
  normalizeTestPattern,
  readTestPatterns,
  stripTestSuffix,
  wildcardToRegExp,
};
