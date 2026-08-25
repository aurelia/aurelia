'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { describe, it } = require('node:test');
const minimatch = require('minimatch');
const ts = require('typescript');
const {
  expandKarmaTestGlobs,
  expandTypeScriptTestIncludes,
  matchesTestPattern,
  normalizeTestPattern,
  stripTestSuffix,
} = require('./test-patterns.cjs');

const sourceSpecs = [
  '3-runtime-html/au-slot.slotted.spec.ts',
  '3-runtime-html/au-slot.spec.tsx',
  'name with spaces/value.spec.ts',
  'router/context-router.spec.ts',
  'router/nested/child-route1.spec.ts',
  'router/route.spec.ts',
  'router/routes.spec.ts',
  'runtime/foo1-bar.spec.ts',
  'runtime/foo[1]-bar.spec.ts',
];

describe('shared test selector contract', () => {
  it('normalizes source and output paths plus supported suffixes', () => {
    assert.equal(normalizeTestPattern('src/router/**/*.spec.ts'), 'router/**/*');
    assert.equal(normalizeTestPattern('./dist/router/route.spec.js'), 'router/route');
    assert.equal(normalizeTestPattern('src\\3-runtime-html\\au-slot.spec.tsx'), '3-runtime-html/au-slot');
    assert.equal(normalizeTestPattern('router/route.spec'), 'router/route');
  });

  it('expands the all-tests selector explicitly', () => {
    assert.deepEqual(expandTypeScriptTestIncludes(['*']), [
      'src/**/*.ts',
      'src/**/*.tsx',
    ]);
    assert.deepEqual(expandKarmaTestGlobs(['*'], 'packages/__tests__/dist'), [
      'packages/__tests__/dist/**/*.spec.js',
    ]);
  });

  it('gives TypeScript, Node selection, and Karma the same corpus', () => {
    const allSpecs = sourceSpecs.map(stripTestSuffix);
    const cases = [
      { patterns: ['*'], expected: allSpecs },
      {
        patterns: ['src/router/**/*.spec.ts'],
        expected: [
          'router/context-router',
          'router/nested/child-route1',
          'router/route',
          'router/routes',
        ],
      },
      {
        patterns: ['dist/router/**/*.spec.js'],
        expected: [
          'router/context-router',
          'router/nested/child-route1',
          'router/route',
          'router/routes',
        ],
      },
      { patterns: ['route*'], expected: ['router/route', 'router/routes'] },
      { patterns: ['r?ute'], expected: ['router/route'] },
      {
        patterns: ['router/**'],
        expected: [
          'router/context-router',
          'router/nested/child-route1',
          'router/route',
          'router/routes',
        ],
      },
      { patterns: ['**/child-*'], expected: ['router/nested/child-route1'] },
      { patterns: ['foo[1]*'], expected: ['runtime/foo[1]-bar'] },
      { patterns: ['foo[1]'], expected: ['runtime/foo[1]-bar'] },
      { patterns: ['name with spaces'], expected: ['name with spaces/value'] },
      {
        patterns: ['3-runtime-html/au-slot.spec.tsx'],
        expected: ['3-runtime-html/au-slot', '3-runtime-html/au-slot.slotted'],
      },
      {
        patterns: ['3-runtime-html/au-slot.spec.js'],
        expected: ['3-runtime-html/au-slot', '3-runtime-html/au-slot.slotted'],
      },
    ];

    for (const { patterns, expected } of cases) {
      const normalizedExpected = [...expected].sort();
      assert.deepEqual(selectWithMatcher(patterns), normalizedExpected, `Node selection for ${patterns}`);
      assert.deepEqual(selectWithTypeScript(patterns), normalizedExpected, `TypeScript includes for ${patterns}`);
      assert.deepEqual(selectWithKarma(patterns), normalizedExpected, `Karma globs for ${patterns}`);
    }
  });
});

/**
 * @param {readonly string[]} patterns
 * @returns {string[]}
 */
function selectWithMatcher(patterns) {
  return sourceSpecs
    .filter(file => patterns.some(pattern => matchesTestPattern(file, pattern)))
    .map(stripTestSuffix)
    .sort();
}

/**
 * Exercise TypeScript's own include matcher so the generated includes cannot silently drift
 * from the selector used by the test runners.
 *
 * @param {readonly string[]} patterns
 * @returns {string[]}
 */
function selectWithTypeScript(patterns) {
  const repoRoot = '/repo';
  const files = sourceSpecs.map(file => `src/${file}`);
  const entries = createVirtualEntries(repoRoot, files);
  return ts.matchFiles(
    repoRoot,
    ['.ts', '.tsx'],
    undefined,
    expandTypeScriptTestIncludes(patterns),
    true,
    repoRoot,
    undefined,
    directory => entries.get(directory) ?? { files: [], directories: [] },
    file => file,
  )
    .map(file => stripTestSuffix(path.posix.relative(`${repoRoot}/src`, file)))
    .sort();
}

/**
 * @param {readonly string[]} patterns
 * @returns {string[]}
 */
function selectWithKarma(patterns) {
  const baseUrl = 'packages/__tests__/dist';
  const globs = expandKarmaTestGlobs(patterns, baseUrl);
  return sourceSpecs
    .map(file => file.replace(/\.tsx?$/, '.js'))
    .filter(file => globs.some(glob => minimatch(`${baseUrl}/${file}`, glob)))
    .map(stripTestSuffix)
    .sort();
}

/**
 * @param {string} root
 * @param {readonly string[]} files
 * @returns {Map<string, { files: string[]; directories: string[] }>}
 */
function createVirtualEntries(root, files) {
  const entries = new Map();
  for (const file of files) {
    const segments = file.split('/');
    let directory = root;
    for (let index = 0; index < segments.length - 1; index++) {
      const name = segments[index];
      addEntry(entries, directory, 'directories', name);
      directory = `${directory}/${name}`;
    }
    addEntry(entries, directory, 'files', segments.at(-1));
  }
  return entries;
}

/**
 * @param {Map<string, { files: string[]; directories: string[] }>} entries
 * @param {string} directory
 * @param {'files' | 'directories'} kind
 * @param {string} name
 */
function addEntry(entries, directory, kind, name) {
  let entry = entries.get(directory);
  if (entry === undefined) {
    entry = { files: [], directories: [] };
    entries.set(directory, entry);
  }
  if (!entry[kind].includes(name)) {
    entry[kind].push(name);
  }
}
