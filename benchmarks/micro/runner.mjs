import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';
import { build } from 'esbuild';

const benchmarkRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const repositoryRoot = path.dirname(benchmarkRoot);
const requestedCase = readCaseArgument(process.argv.slice(2));
const cases = requestedCase === undefined ? ['scope', 'subscribers'] : [requestedCase];
const sourceByCase = {
  scope: 'packages/runtime/src/scope.ts',
  subscribers: 'packages/runtime/src/subscriber-collection.ts',
};

const outputRoot = await mkdtemp(path.join(tmpdir(), 'aurelia-micro-'));
try {
  console.log('Baseline: HEAD');
  console.log('Candidate: working tree');
  for (const caseName of cases) {
    const sourcePath = sourceByCase[caseName];
    if (sourcePath === undefined) {
      throw new Error(`Unknown microbenchmark case: ${caseName}`);
    }
    const absoluteSourcePath = path.join(repositoryRoot, sourcePath);
    const [baseSource, candidateSource] = await Promise.all([
      Promise.resolve(execFileSync('git', ['show', `HEAD:${sourcePath}`], {
        cwd: repositoryRoot,
        encoding: 'utf8',
      })),
      readFile(absoluteSourcePath, 'utf8'),
    ]);
    const basePath = path.join(outputRoot, `${caseName}-base.mjs`);
    const candidatePath = path.join(outputRoot, `${caseName}-candidate.mjs`);
    await Promise.all([
      bundleSource(baseSource, absoluteSourcePath, basePath),
      bundleSource(candidateSource, absoluteSourcePath, candidatePath),
    ]);

    const results = await runWorker({ basePath, candidatePath, caseName });
    printResults(caseName, results);
  }
} finally {
  await rm(outputRoot, { recursive: true, force: true });
}

async function bundleSource(contents, sourcePath, outfile) {
  await build({
    stdin: {
      contents,
      loader: 'ts',
      resolveDir: path.dirname(sourcePath),
      sourcefile: sourcePath,
    },
    bundle: true,
    banner: { js: 'const _START_CONST_ENUM = () => {}; const _END_CONST_ENUM = () => {};' },
    define: { __DEV__: 'false' },
    format: 'esm',
    logLevel: 'silent',
    outfile,
    platform: 'node',
    target: 'node22',
  });
}

function runWorker(data) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./worker.mjs', import.meta.url), { workerData: data });
    worker.once('message', resolve);
    worker.once('error', reject);
    worker.once('exit', code => {
      if (code !== 0) reject(new Error(`Microbenchmark worker exited with code ${code}`));
    });
  });
}

function printResults(caseName, results) {
  console.log(`\n${caseName}`);
  console.log('metric | base | candidate | change');
  for (const result of results) {
    const base = format(result.base, result.unit);
    const candidate = format(result.candidate, result.unit);
    console.log(`${result.name} | ${base} | ${candidate} | ${result.change.toFixed(1)}%`);
  }
}

function format(value, unit) {
  return `${value.toFixed(2)} ${unit}`;
}

function readCaseArgument(args) {
  const index = args.indexOf('--case');
  if (index === -1) return undefined;
  if (args[index + 1] === undefined) throw new Error('--case requires a value');
  return args[index + 1];
}
