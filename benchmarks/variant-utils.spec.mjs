import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { bundleBenchmarkVariant } from './rollup.variant.mjs';
import {
  discoverInternalClosure,
  discoverLockedExternalClosure,
  discoverWorkspacePackages,
  getAureliaPackageName,
  isPathInside,
  resolveAureliaEntry,
  validateInstalledGraph,
} from './variant-utils.mjs';
import { defaultFixtures, fixturesForProfile, packageRootsForFixtures } from './fixtures.mjs';

const benchmarksRoot = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(benchmarksRoot, '..');
const temporaryRoots = [];

void afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map(root => rm(root, { recursive: true, force: true })));
});

void describe('benchmark variant utilities', () => {
  void it('discovers the runtime-html internal production closure without external dependencies', async () => {
    const workspacePackages = await discoverWorkspacePackages(repositoryRoot);
    const closure = discoverInternalClosure(workspacePackages, '@aurelia/runtime-html');

    assert.deepEqual([...closure.packages.keys()].sort((left, right) => left.localeCompare(right)), [
      '@aurelia/expression-parser',
      '@aurelia/kernel',
      '@aurelia/metadata',
      '@aurelia/platform',
      '@aurelia/platform-browser',
      '@aurelia/runtime',
      '@aurelia/runtime-html',
      '@aurelia/template-compiler',
    ]);
  });

  void it('extracts Aurelia package names from root and subpath imports', () => {
    assert.equal(getAureliaPackageName('@aurelia/runtime-html'), '@aurelia/runtime-html');
    assert.equal(getAureliaPackageName('@aurelia/runtime-html/development'), '@aurelia/runtime-html');
    assert.equal(getAureliaPackageName('rollup'), null);
  });

  void it('keeps smoke fixtures and their dependency graph unchanged', async () => {
    assert.equal(fixturesForProfile('smoke').length, 6);
    assert.equal(defaultFixtures.length, 8);
    assert.deepEqual(packageRootsForFixtures(fixturesForProfile('smoke')), ['@aurelia/runtime-html']);
    assert.deepEqual(packageRootsForFixtures(defaultFixtures), ['@aurelia/runtime-html', '@aurelia/i18n']);
    for (const fixture of defaultFixtures) {
      assert.match(await readFile(path.join(benchmarksRoot, fixture, 'index.js'), 'utf8'), /@aurelia\//);
    }
    const closure = discoverInternalClosure(await discoverWorkspacePackages(repositoryRoot), packageRootsForFixtures(defaultFixtures));
    assert.equal(closure.packages.size, 9);
    assert.deepEqual([...closure.external], ['i18next']);
    const lock = JSON.parse(await readFile(path.join(repositoryRoot, 'package-lock.json'), 'utf8'));
    const external = discoverLockedExternalClosure(lock, closure.external);
    assert.deepEqual([...external.keys()], ['i18next', '@babel/runtime']);
    for (const [name, entry] of external) assert.deepEqual(entry, { ...lock.packages[`node_modules/${name}`], lockPath: `node_modules/${name}` });
  });

  void it('rejects unreviewed or unpinned external package inputs', () => {
    const lock = { packages: { 'node_modules/i18next': {
      version: '25.7.4', resolved: 'https://registry.npmjs.org/i18next/-/i18next-25.7.4.tgz', integrity: 'sha512-YQ==',
    } } };
    for (const patch of [
      { version: 'latest' }, { resolved: 'file:../workspace' }, { integrity: undefined }, { link: true },
      { dependencies: { unreviewed: '1.0.0' } }, { optionalDependencies: { unreviewed: '1.0.0' } },
      { peerDependencies: { typescript: '^5' } },
    ]) {
      const altered = structuredClone(lock);
      Object.assign(altered.packages['node_modules/i18next'], patch);
      assert.throws(() => discoverLockedExternalClosure(altered, ['i18next']), /benchmark dependency/);
    }
    const nested = structuredClone(lock);
    nested.packages['node_modules/i18next'].dependencies = { '@babel/runtime': '^7' };
    nested.packages['node_modules/i18next/node_modules/@babel/runtime'] = {};
    assert.throws(() => discoverLockedExternalClosure(nested, ['i18next']), /nested below/);
  });

  void it('rejects production closures that could be satisfied outside the source revision', () => {
    const packages = new Map([
      ['@aurelia/example', {
        dir: 'example',
        manifest: { dependencies: { '@aurelia/internal': 'workspace:*', 'external-package': '1.0.0' } },
      }],
      ['@aurelia/internal', { dir: 'internal', manifest: {} }],
    ]);

    assert.throws(
      () => discoverInternalClosure(packages, '@aurelia/example'),
      /external production dependencies: external-package/,
    );
  });

  void it('resolves the import condition from an isolated package graph', async () => {
    const root = await createTemporaryRoot();
    const packageDir = path.join(root, 'node_modules', '@aurelia', 'example');
    await mkdir(path.join(packageDir, 'dist'), { recursive: true });
    await writeJson(path.join(packageDir, 'package.json'), {
      name: '@aurelia/example',
      exports: {
        '.': { require: './dist/index.cjs', import: './dist/index.mjs' },
        './development': { import: './dist/index.dev.mjs' },
      },
    });
    await writeFile(path.join(packageDir, 'dist', 'index.mjs'), 'export const value = 1;\n');
    await writeFile(path.join(packageDir, 'dist', 'index.dev.mjs'), 'export const value = 2;\n');

    const rootEntry = await resolveAureliaEntry(root, '@aurelia/example');
    const developmentEntry = await resolveAureliaEntry(root, '@aurelia/example/development');
    assert.equal(rootEntry.entry, path.join(packageDir, 'dist', 'index.mjs'));
    assert.equal(developmentEntry.entry, path.join(packageDir, 'dist', 'index.dev.mjs'));
  });

  void it('rejects an export that escapes its owning package', async () => {
    const root = await createTemporaryRoot();
    const installRoot = path.join(root, 'install');
    const packageDir = path.join(installRoot, 'node_modules', '@aurelia', 'example');
    await mkdir(packageDir, { recursive: true });
    await writeJson(path.join(packageDir, 'package.json'), {
      name: '@aurelia/example',
      exports: { '.': { import: './../../../../outside.mjs' } },
    });
    await writeFile(path.join(root, 'outside.mjs'), 'export const value = 1;\n');

    await assert.rejects(
      resolveAureliaEntry(installRoot, '@aurelia/example'),
      /resolved outside its package/,
    );
  });

  void it('accepts one top-level package installed from its expected tarball', async () => {
    const root = await createTemporaryRoot();
    const installRoot = path.join(root, 'install');
    const packageName = '@aurelia/example';
    const packed = await writeInstalledGraph(installRoot);

    const installed = await validateInstalledGraph(installRoot, packed);
    assert.equal(installed.get(packageName).version, '1.0.0');
    assert.equal(installed.get(packageName).entrySha256.length, 64);
  });

  void it('rejects an installed package whose lock integrity differs from its tarball', async () => {
    const root = await createTemporaryRoot();
    const installRoot = path.join(root, 'install');
    const packed = await writeInstalledGraph(installRoot, { lockIntegrity: 'sha512-wrong' });

    await assert.rejects(
      validateInstalledGraph(installRoot, packed),
      /lock integrity does not match/,
    );
  });

  void it('rejects packages outside the discovered benchmark closure', async () => {
    const root = await createTemporaryRoot();
    const installRoot = path.join(root, 'install');
    const packed = await writeInstalledGraph(installRoot, { includeUnexpectedPackage: true });

    await assert.rejects(
      validateInstalledGraph(installRoot, packed),
      /unexpected: external-package/,
    );
  });

  void it('keeps two benchmark variants on their own package graphs', async () => {
    const root = await createTemporaryRoot();
    const fixtureRoot = path.join(root, 'fixtures');
    const fixture = 'variant-probe';
    await mkdir(path.join(fixtureRoot, fixture), { recursive: true });
    await writeFile(
      path.join(fixtureRoot, fixture, 'index.js'),
      "import { value } from '@aurelia/example';\nglobalThis.benchmarkVariantValue = value;\n",
    );

    const baseRoot = await writeBundleGraph(path.join(root, 'base'), 'base');
    const candidateRoot = await writeBundleGraph(path.join(root, 'candidate'), 'candidate');
    const [base] = await bundleBenchmarkVariant({
      fixtureRoot,
      fixtures: [fixture],
      installRoot: baseRoot,
      outputRoot: path.join(root, 'output', 'base'),
    });
    const [candidate] = await bundleBenchmarkVariant({
      fixtureRoot,
      fixtures: [fixture],
      installRoot: candidateRoot,
      outputRoot: path.join(root, 'output', 'candidate'),
    });

    assert.notEqual(base.sha256, candidate.sha256);
    assert.equal(isPathInside(baseRoot, base.resolvedAureliaModules['@aurelia/example']), true);
    assert.equal(isPathInside(candidateRoot, candidate.resolvedAureliaModules['@aurelia/example']), true);
  });

  void it('bundles i18next from each variant and proves byte-identical A/A outputs', async () => {
    const root = await createTemporaryRoot();
    const fixtureRoot = path.join(root, 'fixtures');
    const fixture = 'external-probe';
    await mkdir(path.join(fixtureRoot, fixture), { recursive: true });
    await writeFile(path.join(fixtureRoot, fixture, 'index.js'),
      "import { value } from '@aurelia/example'; import { locale } from 'i18next'; globalThis.result = [value, locale];\n");
    const records = [];
    for (const variant of ['base', 'candidate']) {
      const installRoot = await writeBundleGraph(path.join(root, variant), 'same');
      const external = path.join(installRoot, 'node_modules', 'i18next');
      await mkdir(external, { recursive: true });
      await writeJson(path.join(external, 'package.json'), { name: 'i18next', version: '25.7.4', module: 'index.js' });
      await writeFile(path.join(external, 'index.js'), "export const locale = 'de';\n");
      const [record] = await bundleBenchmarkVariant({ fixtureRoot, fixtures: [fixture], installRoot, outputRoot: path.join(root, 'output', variant) });
      assert.equal(isPathInside(installRoot, record.resolvedExternalModules.i18next), true);
      assert.doesNotMatch(await readFile(record.file, 'utf8'), /from["']i18next/);
      records.push(record);
    }
    assert.equal(records[0].sha256, records[1].sha256);
    await rm(path.join(root, 'candidate', 'node_modules', 'i18next'), { recursive: true });
    await assert.rejects(bundleBenchmarkVariant({
      fixtureRoot, fixtures: [fixture], installRoot: path.join(root, 'candidate'), outputRoot: path.join(root, 'missing'),
    }), /ENOENT/);
    await writeFile(path.join(fixtureRoot, fixture, 'index.js'), "import 'unreviewed';\n");
    await assert.rejects(bundleBenchmarkVariant({
      fixtureRoot, fixtures: [fixture], installRoot: path.join(root, 'base'), outputRoot: path.join(root, 'unknown'),
    }), /Unsupported bare benchmark import/);
  });

  void it('distinguishes descendants from sibling paths', () => {
    const parent = path.resolve('one', 'two');
    assert.equal(isPathInside(parent, path.join(parent, 'three')), true);
    assert.equal(isPathInside(parent, path.resolve('one', 'elsewhere')), false);
  });
});

async function createTemporaryRoot() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'aurelia-variant-utils-'));
  temporaryRoots.push(root);
  return root;
}

const writeJson = (file, value) => writeFile(file, `${JSON.stringify(value, null, 2)}\n`);

async function writeInstalledGraph(
  installRoot,
  { lockIntegrity = 'sha512-packed', includeUnexpectedPackage = false } = {},
) {
  const packageName = '@aurelia/example';
  const packageDir = path.join(installRoot, 'node_modules', '@aurelia', 'example');
  const filename = 'aurelia-example-1.0.0.tgz';
  const integrity = 'sha512-packed';
  await mkdir(path.join(packageDir, 'dist'), { recursive: true });
  await writeJson(path.join(packageDir, 'package.json'), {
    name: packageName,
    version: '1.0.0',
    exports: { '.': { import: './dist/index.mjs' } },
  });
  await writeFile(path.join(packageDir, 'dist', 'index.mjs'), 'export const value = 1;\n');
  await writeJson(path.join(installRoot, 'package-lock.json'), {
    lockfileVersion: 3,
    packages: {
      '': { name: 'variant', version: '0.0.0' },
      'node_modules/@aurelia/example': {
        version: '1.0.0',
        resolved: `file:../packs/${filename}`,
        integrity: lockIntegrity,
      },
      ...(includeUnexpectedPackage ? {
        'node_modules/external-package': {
          version: '1.0.0',
          resolved: 'https://registry.npmjs.org/external-package/-/external-package-1.0.0.tgz',
        },
      } : {}),
    },
  });
  return new Map([[packageName, {
    name: packageName,
    version: '1.0.0',
    tarball: path.join(path.dirname(installRoot), 'packs', filename),
    integrity,
  }]]);
}

async function writeBundleGraph(root, value) {
  const packageDir = path.join(root, 'node_modules', '@aurelia', 'example');
  await mkdir(path.join(packageDir, 'dist'), { recursive: true });
  await writeJson(path.join(packageDir, 'package.json'), {
    name: '@aurelia/example',
    version: '1.0.0',
    exports: { '.': { import: './dist/index.mjs' } },
  });
  await writeFile(path.join(packageDir, 'dist', 'index.mjs'), `export const value = '${value}';\n`);
  return root;
}
