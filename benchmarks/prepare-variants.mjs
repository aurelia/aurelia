import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundleBenchmarkVariant } from './rollup.variant.mjs';
import {
  discoverInternalClosure,
  discoverWorkspacePackages,
  hashFile,
  hashFileSet,
  readJson,
  toPosixPath,
  validateInstalledGraph,
} from './variant-utils.mjs';

const benchmarksRoot = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(benchmarksRoot, '..');
const defaultFixtures = [
  'app-repeat-view',
  'app-repeat-ce',
  'app-repeat-view-big-template',
  'app-repeat-view-keyed-string',
  'app-repeat-view-keyed-expr',
  'app-repeat-realistic',
];
const npmCli = process.env.npm_execpath;
if (npmCli === undefined) {
  throw new Error('Run benchmark variant preparation through an npm script so the npm CLI is explicit.');
}

const options = parseArguments(process.argv.slice(2));
// Local runs may compare any exact revisions. CI also supplies the PR head so this script can prove
// that the candidate is the test merge of the requested base and head before doing expensive work.
const baseCommit = await resolveCommit(options.base);
const headCommit = options.head === undefined ? undefined : await resolveCommit(options.head);
const candidateCommit = await resolveCommit(options.candidate);
if (headCommit !== undefined) {
  await verifyMergeCandidate(baseCommit, headCommit, candidateCommit);
}
const harnessCommit = await runCapture('git', ['rev-parse', 'HEAD'], repositoryRoot);
const harnessTree = await runCapture('git', ['rev-parse', 'HEAD^{tree}'], repositoryRoot);
if (options.pullRequest !== undefined && harnessCommit !== candidateCommit) {
  throw new Error(
    `PR benchmark harness is ${harnessCommit}, expected the verified candidate ${candidateCommit}.`
  );
}
const outputRoot = path.resolve(
  options.output ?? path.join(benchmarksRoot, 'results', `comparison-${baseCommit.slice(0, 7)}-${candidateCommit.slice(0, 7)}`)
);
const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'aurelia-bench-'));
let operationError;

try {
  await mkdir(path.dirname(outputRoot), { recursive: true });
  try {
    await mkdir(outputRoot);
  } catch (error) {
    if (error?.code === 'EEXIST') {
      throw new Error(`Benchmark output already exists: ${outputRoot}`);
    }
    throw error;
  }

  console.log(`Preparing benchmark base ${baseCommit}`);
  console.log(`Preparing benchmark candidate ${candidateCommit}`);
  console.log(`Temporary work: ${temporaryRoot}`);
  console.log(`Durable results: ${outputRoot}`);

  // Source installs are intentionally sequential. Parallel npm/git processes make logs harder to
  // attribute and can keep Windows snapshot directories locked when the sibling preparation fails.
  const base = await prepareVariant('base', baseCommit);
  const candidate = await prepareVariant('candidate', candidateCommit);

  const baseBundles = await bundleBenchmarkVariant({
    fixtureRoot: benchmarksRoot,
    fixtures: options.fixtures,
    installRoot: base.installRoot,
    outputRoot: path.join(outputRoot, 'base'),
  });
  const candidateBundles = await bundleBenchmarkVariant({
    fixtureRoot: benchmarksRoot,
    fixtures: options.fixtures,
    installRoot: candidate.installRoot,
    outputRoot: path.join(outputRoot, 'candidate'),
  });

  const comparisons = options.fixtures.map(fixture => {
    const baseBundle = baseBundles.find(bundle => bundle.fixture === fixture);
    const candidateBundle = candidateBundles.find(bundle => bundle.fixture === fixture);
    return {
      fixture,
      identical: baseBundle.sha256 === candidateBundle.sha256,
      base: normalizeBundleRecord(baseBundle, base.installRoot, outputRoot),
      candidate: normalizeBundleRecord(candidateBundle, candidate.installRoot, outputRoot),
    };
  });

  const harnessFileSet = await getHarnessFileSet();
  const manifest = {
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    repository: await runCapture('git', ['remote', 'get-url', 'origin'], repositoryRoot),
    comparison: {
      profile: options.profile ?? null,
      pullRequest: options.pullRequest ?? null,
      base: baseCommit,
      head: headCommit ?? null,
      candidate: candidateCommit,
      mergeParentsVerified: headCommit !== undefined,
    },
    harness: {
      commit: harnessCommit,
      tree: harnessTree,
      dirty: (await runCapture('git', ['status', '--porcelain'], repositoryRoot)) !== '',
      fixtures: options.fixtures,
      sha256: harnessFileSet.sha256,
      files: harnessFileSet.files,
    },
    environment: {
      platform: process.platform,
      architecture: process.arch,
      bundleToolchain: {
        node: process.version,
        npm: await runNpmCapture(['--version'], repositoryRoot),
        rollup: await getInstalledToolVersion(repositoryRoot, 'rollup'),
        terserPlugin: await getInstalledToolVersion(repositoryRoot, '@rollup/plugin-terser'),
      },
    },
    base: toManifestVariant(base),
    candidate: toManifestVariant(candidate),
    comparisons,
  };

  await writeFile(path.join(outputRoot, 'provenance.json'), `${JSON.stringify(manifest, null, 2)}\n`);

  console.log('\nA/A bundle comparison');
  for (const comparison of comparisons) {
    console.log(
      `${comparison.identical ? 'IDENTICAL' : 'DIFFERENT'} ${comparison.fixture}: `
      + `${comparison.base.bytes} / ${comparison.candidate.bytes} bytes`
    );
  }
  console.log(`Provenance: ${path.join(outputRoot, 'provenance.json')}`);

  if (options.expectIdentical && comparisons.some(comparison => !comparison.identical)) {
    throw new Error('Expected byte-identical benchmark bundles, but at least one fixture differs.');
  }
} catch (error) {
  operationError = error;
  throw error;
} finally {
  if (options.keepWorkdir) {
    console.log(`Keeping temporary benchmark workdir: ${temporaryRoot}`);
  } else {
    // Only the directory returned by mkdtemp is eligible for cleanup. Snapshot failures must
    // never broaden deletion to a repository path supplied through CLI input.
    try {
      await rm(temporaryRoot, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    } catch (cleanupError) {
      console.error(`Unable to remove temporary benchmark workdir ${temporaryRoot}:`, cleanupError);
      if (operationError === undefined) process.exitCode = 1;
    }
  }
}

async function prepareVariant(label, commit) {
  const sourceRoot = path.join(temporaryRoot, `${label}-source`);
  const variantRoot = path.join(temporaryRoot, label);

  // CircleCI checks out a partial clone. Reading the exact tree through Git lets its promisor
  // remote hydrate missing blobs before a local shared clone depends on the object store.
  await run(
    'git',
    ['archive', '--format=tar', commit],
    repositoryRoot,
    {},
    ['ignore', 'ignore', 'inherit'],
  );
  await run('git', ['clone', '--shared', '--no-checkout', '--quiet', repositoryRoot, sourceRoot], repositoryRoot);
  await run('git', ['checkout', '--detach', '--quiet', commit], sourceRoot);

  const resolvedCommit = await runCapture('git', ['rev-parse', 'HEAD'], sourceRoot);
  const tree = await runCapture('git', ['rev-parse', 'HEAD^{tree}'], sourceRoot);
  if (resolvedCommit !== commit) {
    throw new Error(`Snapshot ${label} resolved ${resolvedCommit}, expected ${commit}.`);
  }

  const workspacePackages = await discoverWorkspacePackages(sourceRoot);
  const closure = discoverInternalClosure(workspacePackages, '@aurelia/runtime-html');

  // Each revision installs its own build tools. Sharing root node_modules would also share
  // workspace symlinks, allowing a base build to import candidate sources.
  await runNpm(['ci', '--ignore-scripts', '--no-audit', '--no-fund'], sourceRoot);
  const buildToolchain = {
    node: process.version,
    npm: await runNpmCapture(['--version'], sourceRoot),
    packageLockSha256: await hashFile(path.join(sourceRoot, 'package-lock.json')),
    rollup: await getInstalledToolVersion(sourceRoot, 'rollup'),
    turbo: await getInstalledToolVersion(sourceRoot, 'turbo'),
    typescript: await getInstalledToolVersion(sourceRoot, 'typescript'),
  };
  const turboCli = path.join(sourceRoot, 'node_modules', 'turbo', 'bin', 'turbo');
  await run(
    process.execPath,
    [turboCli, 'rollup', '--filter=@aurelia/runtime-html'],
    sourceRoot,
    { RELEASE_BUILD: 'true', TURBO_TELEMETRY_DISABLED: '1' },
  );

  const packedPackages = await packClosure(label, closure, variantRoot, sourceRoot);
  const installRoot = await installPackedGraph(label, packedPackages, variantRoot);
  const installed = await validateInstalledGraph(installRoot, packedPackages);

  return {
    label,
    requestedRevision: label === 'base' ? options.base : options.candidate,
    commit,
    tree,
    sourceRoot,
    installRoot,
    closure,
    packedPackages,
    installed,
    buildToolchain,
  };
}

async function packClosure(label, closure, variantRoot, sourceRoot) {
  const packRoot = path.join(variantRoot, 'packs');
  await mkdir(packRoot, { recursive: true });
  const packedPackages = new Map();

  // Packing in a stable order keeps filenames and diagnostics attributable if one package fails.
  for (const packageName of [...closure.packages.keys()].sort((left, right) => left.localeCompare(right))) {
    const workspacePackage = closure.packages.get(packageName);
    const modulePath = path.resolve(workspacePackage.dir, workspacePackage.manifest.module ?? 'dist/esm/index.mjs');
    try {
      await readFile(modulePath);
    } catch (error) {
      if (error?.code === 'ENOENT') {
        throw new Error(`Release build for ${label} did not produce ${modulePath}.`);
      }
      throw error;
    }

    const rawResult = await runNpmCapture(
      ['pack', '--json', '--ignore-scripts', '--pack-destination', packRoot],
      workspacePackage.dir,
    );
    const results = JSON.parse(rawResult);
    if (!Array.isArray(results) || results.length !== 1) {
      throw new Error(`npm pack returned an unexpected result for ${packageName}.`);
    }
    const [result] = results;
    if (result.name !== packageName || result.version !== workspacePackage.manifest.version) {
      throw new Error(
        `npm pack produced ${result.name}@${result.version}, `
        + `expected ${packageName}@${workspacePackage.manifest.version}.`
      );
    }
    const tarball = path.join(packRoot, result.filename);
    packedPackages.set(packageName, {
      name: packageName,
      version: workspacePackage.manifest.version,
      workspacePath: toPosixPath(path.relative(sourceRoot, workspacePackage.dir)),
      tarball,
      filename: result.filename,
      integrity: result.integrity,
      shasum: result.shasum,
      sha256: await hashFile(tarball),
      bytes: result.size,
    });
  }
  return packedPackages;
}

async function installPackedGraph(label, packedPackages, variantRoot) {
  const installRoot = path.join(variantRoot, 'install');
  const npmCache = path.join(variantRoot, 'npm-cache');
  await mkdir(installRoot, { recursive: true });
  await mkdir(npmCache, { recursive: true });
  const dependencies = {};

  for (const [packageName, packed] of packedPackages) {
    dependencies[packageName] = `file:${toPosixPath(path.relative(installRoot, packed.tarball))}`;
  }
  await writeFile(path.join(installRoot, 'package.json'), `${JSON.stringify({
    name: `@aurelia/benchmark-${label}`,
    private: true,
    version: '0.0.0',
    dependencies,
  }, null, 2)}\n`);
  await writeFile(path.join(installRoot, '.npmrc'), 'ignore-scripts=true\naudit=false\nfund=false\n');

  // A fresh cache plus offline mode makes the local tarballs the only possible package source.
  // A version mismatch therefore fails instead of silently changing the compared package graph.
  await runNpm(
    ['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', '--install-strategy=hoisted'],
    installRoot,
    { npm_config_cache: npmCache },
  );
  return realpath(installRoot);
}

function toManifestVariant(variant) {
  return {
    requestedRevision: variant.requestedRevision,
    commit: variant.commit,
    tree: variant.tree,
    buildToolchain: variant.buildToolchain,
    closure: Object.fromEntries(variant.closure.edges),
    packages: Object.fromEntries([...variant.packedPackages].map(([name, packed]) => {
      const installed = variant.installed.get(name);
      return [name, {
        version: packed.version,
        workspacePath: packed.workspacePath,
        tarball: packed.filename,
        integrity: packed.integrity,
        shasum: packed.shasum,
        sha256: packed.sha256,
        bytes: packed.bytes,
        installedPath: toPosixPath(path.relative(variant.installRoot, installed.dir)),
        resolved: installed.resolved,
        installedIntegrity: installed.integrity,
        entry: toPosixPath(path.relative(variant.installRoot, installed.entry)),
        entrySha256: installed.entrySha256,
      }];
    })),
  };
}

function normalizeBundleRecord(bundle, installRoot, outputRoot) {
  return {
    fixture: bundle.fixture,
    file: toPosixPath(path.relative(outputRoot, bundle.file)),
    bytes: bundle.bytes,
    sha256: bundle.sha256,
    sourceFiles: bundle.sourceFiles,
    resolvedAureliaModules: Object.fromEntries(Object.entries(bundle.resolvedAureliaModules).map(([specifier, file]) => [
      specifier,
      toPosixPath(path.relative(installRoot, file)),
    ])),
  };
}

async function getHarnessFileSet() {
  const tracked = (await runCapture('git', [
    'ls-files',
    '--',
    '.circleci/config.yml',
    '.github/scripts',
    '.github/workflows/main.yml',
    '.github/workflows/trigger-circleci-bench.yml',
    '.github/workflows/trigger-circleci-pr-full.yml',
    'benchmarks',
    'package.json',
    'package-lock.json',
  ], repositoryRoot)).split('\n').filter(Boolean);
  const liveFiles = [
    'benchmarks/prepare-variants.mjs',
    'benchmarks/rollup.variant.mjs',
    'benchmarks/variant-utils.mjs',
    'benchmarks/variant-utils.spec.mjs',
  ];
  return hashFileSet(repositoryRoot, [...tracked, ...liveFiles]);
}

async function getInstalledToolVersion(root, packageName) {
  const manifestPath = path.join(root, 'node_modules', ...packageName.split('/'), 'package.json');
  return (await readJson(manifestPath)).version;
}

async function resolveCommit(revision) {
  return runCapture('git', ['rev-parse', '--verify', `${revision}^{commit}`], repositoryRoot);
}

async function verifyMergeCandidate(base, head, candidate) {
  const [resolvedCandidate, ...parents] = (
    await runCapture('git', ['rev-list', '--parents', '-n', '1', candidate], repositoryRoot)
  ).split(' ');
  if (resolvedCandidate !== candidate || parents.length !== 2 || parents[0] !== base || parents[1] !== head) {
    throw new Error(
      `Benchmark candidate ${candidate} is not the test merge of base ${base} and head ${head}. `
      + `Found parents: ${parents.join(', ') || '<none>'}.`
    );
  }
}

function parseArguments(argv) {
  const parsed = { fixtures: [], expectIdentical: false, keepWorkdir: false };
  for (let index = 0; index < argv.length; index++) {
    const argument = argv[index];
    switch (argument) {
      case '--base': parsed.base = requireValue(argv, ++index, argument); break;
      case '--head': parsed.head = requireValue(argv, ++index, argument); break;
      case '--candidate': parsed.candidate = requireValue(argv, ++index, argument); break;
      case '--pull-request': parsed.pullRequest = requireValue(argv, ++index, argument); break;
      case '--profile': parsed.profile = requireValue(argv, ++index, argument); break;
      case '--fixture': parsed.fixtures.push(requireValue(argv, ++index, argument)); break;
      case '--output': parsed.output = requireValue(argv, ++index, argument); break;
      case '--expect-identical': parsed.expectIdentical = true; break;
      case '--keep-workdir': parsed.keepWorkdir = true; break;
      default: throw new Error(`Unknown argument "${argument}".`);
    }
  }
  if (parsed.base === undefined || parsed.candidate === undefined) {
    throw new Error(
      'Usage: node benchmarks/prepare-variants.mjs --base <revision> --candidate <revision> '
      + '[--head <revision> --pull-request <number>] [--expect-identical]'
    );
  }
  if (parsed.pullRequest !== undefined) {
    if (!/^[1-9]\d*$/.test(parsed.pullRequest)) {
      throw new Error(`Invalid pull request number "${parsed.pullRequest}".`);
    }
    if (parsed.head === undefined) {
      throw new Error('--head is required when --pull-request is provided.');
    }
  }
  if (parsed.profile !== undefined && !['smoke', 'full', 'master'].includes(parsed.profile)) {
    throw new Error(`Unknown benchmark profile "${parsed.profile}".`);
  }
  if (parsed.fixtures.length === 0) parsed.fixtures = [...defaultFixtures];
  for (const fixture of parsed.fixtures) {
    if (!defaultFixtures.includes(fixture)) {
      throw new Error(`Unknown benchmark fixture "${fixture}". Expected one of: ${defaultFixtures.join(', ')}`);
    }
  }
  return parsed;
}

function requireValue(argv, index, flag) {
  const value = argv[index];
  if (value === undefined || value.startsWith('--')) {
    throw new Error(`Missing value for ${flag}.`);
  }
  return value;
}

async function run(command, args, cwd, extraEnvironment = {}, stdio = 'inherit') {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, ...extraEnvironment },
      stdio,
      shell: false,
    });
    child.on('error', reject);
    child.on('close', (code, signal) => {
      if (signal !== null) {
        reject(new Error(`${command} ended with signal ${signal}.`));
      } else if (code !== 0) {
        reject(new Error(`${command} ${args.join(' ')} exited with code ${code}.`));
      } else {
        resolve();
      }
    });
  });
}

function runNpm(args, cwd, extraEnvironment = {}) {
  return run(process.execPath, [npmCli, ...args], cwd, extraEnvironment);
}

function runNpmCapture(args, cwd) {
  return runCapture(process.execPath, [npmCli, ...args], cwd);
}

async function runCapture(command, args, cwd) {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    const child = spawn(command, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'], shell: false });
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code, signal) => {
      if (signal !== null) {
        reject(new Error(`${command} ended with signal ${signal}.\n${stderr}`));
      } else if (code !== 0) {
        reject(new Error(`${command} ${args.join(' ')} exited with code ${code}.\n${stderr}`));
      } else {
        resolve(stdout.trim());
      }
    });
  });
}
