import { spawn } from 'node:child_process';
import { watch as watchDirectory } from 'node:fs';
import {
  appendFile,
  copyFile,
  mkdir,
  readFile,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import { watch as watchRollup } from 'rollup';
import { adaptTachometerJson, formatCompactSummary } from './benchmark-summary.mjs';
import {
  createLiveBenchmarkConfig,
  fingerprintLiveBundle,
  parseLiveDebounce,
} from './live-benchmark-utils.mjs';
import { parseProfileIterations, parseProfileMode } from './live-profile-utils.mjs';
import { isPathInside } from './variant-utils.mjs';

const benchmarkRoot = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(benchmarkRoot, '..');
const liveRoot = path.join(benchmarkRoot, 'live-results');
const sourceConfigPath = resolveSourceConfig(process.env.AURELIA_LIVE_BENCH_CONFIG);
const fixtureRoot = path.dirname(sourceConfigPath);
const fixture = path.basename(fixtureRoot);
const fixtureEntry = path.join(fixtureRoot, 'index.js');
const outputRoot = resolveOutputRoot(process.env.AURELIA_LIVE_BENCH_OUTPUT);
const sampleSize = parseSampleSize(process.env.AURELIA_LIVE_BENCH_SAMPLES);
const debounce = parseLiveDebounce(process.env.AURELIA_LIVE_BENCH_DEBOUNCE);
const benchmarkEnabled = process.env.AURELIA_LIVE_BENCH_ENABLED !== 'false';
const profileMode = parseProfileMode(process.env.AURELIA_LIVE_PROFILE);
const profileIterations = parseProfileIterations(process.env.AURELIA_LIVE_PROFILE_ITERATIONS, profileMode);
const postBundleDelay = 250;
const liveConfigPath = path.join(liveRoot, 'tachometer.config.json');
const workingBundle = path.join(liveRoot, 'working', fixture, 'app.js');
const workingProfileBundle = path.join(liveRoot, 'working-profile', fixture, 'app.js');
const baselineBundle = path.join(liveRoot, 'baseline', fixture, 'app.js');
const activeBaseBundle = path.join(liveRoot, 'active', 'base', fixture, 'app.js');
const activeCandidateBundle = path.join(liveRoot, 'active', 'candidate', fixture, 'app.js');
const activeProfileBundle = path.join(liveRoot, 'profile', fixture, 'app.js');
const profileOutputRoot = resolveProfileOutputRoot(process.env.AURELIA_LIVE_PROFILE_OUTPUT);
const latestResult = path.join(outputRoot, 'latest.json');
const nextResult = path.join(outputRoot, 'latest.next.json');
const historyResult = path.join(outputRoot, 'history.jsonl');
const statusResult = path.join(outputRoot, 'status.json');

let baselineReady = false;
let fixtureChanged = false;
let runActive = false;
let rerunRequested = false;
let lastRequestedBundleFingerprint;
let settleTimer;
let tachometerProcess;
let stopping = false;

await Promise.all([
  mkdir(path.dirname(workingBundle), { recursive: true }),
  ...(profileMode === undefined ? [] : [mkdir(path.dirname(workingProfileBundle), { recursive: true })]),
  mkdir(path.dirname(baselineBundle), { recursive: true }),
  mkdir(path.dirname(activeBaseBundle), { recursive: true }),
  mkdir(path.dirname(activeCandidateBundle), { recursive: true }),
  ...(profileMode === undefined ? [] : [mkdir(path.dirname(activeProfileBundle), { recursive: true })]),
  mkdir(outputRoot, { recursive: true }),
]);
await rm(nextResult, { force: true });

console.log(`Live benchmark config: ${path.relative(repositoryRoot, sourceConfigPath)}`);
console.log(`Latest complete result: ${latestResult}`);
console.log(`Result history: ${historyResult}`);
console.log(`Runner status: ${statusResult}`);
console.log(`Build quiet period: ${debounce}ms`);
if (!benchmarkEnabled) console.log('Tachometer disabled; this session captures profiles only.');
if (profileMode !== undefined) {
  console.log(`Live CPU profile: ${profileMode} (${profileIterations} measured operation${profileIterations === 1 ? '' : 's'})`);
  console.log(`Live CPU profile output: ${profileOutputRoot}`);
}

const fixtureWatcher = watchDirectory(fixtureRoot, { recursive: true }, (_event, filename) => {
  if (filename === null || !/\.(?:html|js|json|mjs|ts)$/u.test(filename.toString())) return;
  console.log(`Profiling fixture changed: ${filename}`);
  fixtureChanged = true;
  scheduleSettledBundle();
});

const bundleWatcher = watchRollup({
  input: fixtureEntry,
  watch: {
    // Coalesce the package watchers' development/production/declaration output
    // burst before spending time rebuilding and minifying the profiling app.
    buildDelay: debounce,
  },
  plugins: [
    nodeResolve({ exportConditions: ['import', 'default'] }),
    ...(profileMode === undefined ? [terser()] : []),
  ],
  output: profileMode === undefined
    ? {
      file: workingBundle,
      format: 'esm',
      sourcemap: false,
    }
    : [
      {
        file: workingBundle,
        format: 'esm',
        sourcemap: false,
        plugins: [terser()],
      },
      {
        file: workingProfileBundle,
        format: 'esm',
        sourcemap: 'inline',
      },
    ],
});

bundleWatcher.on('event', event => {
  switch (event.code) {
    case 'BUNDLE_START':
      clearTimeout(settleTimer);
      break;
    case 'BUNDLE_END':
      console.log(`Profiling bundle rebuilt in ${event.duration}ms.`);
      scheduleSettledBundle(postBundleDelay);
      break;
    case 'ERROR':
      console.error('Profiling bundle failed:', event.error);
      break;
  }
});

process.once('SIGINT', () => void stop());
process.once('SIGTERM', () => void stop());

await new Promise(resolve => process.once('aurelia-live-benchmark-stopped', resolve));

function scheduleSettledBundle(delay = debounce) {
  clearTimeout(settleTimer);
  settleTimer = setTimeout(() => void handleSettledBundle(), delay);
}

async function handleSettledBundle() {
  if (stopping) return;
  try {
    const resetBaseline = !baselineReady || fixtureChanged;
    if (resetBaseline) {
      await copyFile(workingBundle, baselineBundle);
      baselineReady = true;
      if (fixtureChanged) {
        console.log('Profiling fixture changed; reset the live baseline.');
      } else {
        console.log('Captured the initial live baseline.');
      }
      fixtureChanged = false;
    }
    const fingerprint = fingerprintLiveBundle(await readFile(workingBundle));
    if (!resetBaseline && fingerprint === lastRequestedBundleFingerprint) {
      console.log('Profiling bundle is unchanged; skipped duplicate benchmark run.');
      return;
    }
    lastRequestedBundleFingerprint = fingerprint;
    requestRun();
  } catch (error) {
    console.error('Failed to settle the live benchmark bundle:', error);
  }
}

function requestRun() {
  if (runActive) {
    rerunRequested = true;
    return;
  }
  void runBenchmarkLoop();
}

async function runBenchmarkLoop() {
  runActive = true;
  try {
    do {
      rerunRequested = false;
      if (benchmarkEnabled) await runBenchmark();
      if (profileMode !== undefined) await runProfile();
    } while (rerunRequested && !stopping);
  } catch (error) {
    console.error('Live benchmark run failed:', error);
    await writeStatus({ state: 'failed', error: String(error) });
  } finally {
    runActive = false;
  }
}

async function runProfile() {
  await copyFile(workingProfileBundle, activeProfileBundle);
  const { captureLiveProfile } = await import('./live-profile.mjs');
  const result = await captureLiveProfile({
    benchmarkRoot,
    fixture,
    mode: profileMode,
    iterations: profileIterations,
    outputRoot: profileOutputRoot,
  });
  console.log(`Live CPU profile written to ${result.profilePath}`);
  console.log(`Ranked CPU summary written to ${result.summaryPath}`);
  const top = result.summary.topFrameworkFunctions.slice(0, 10);
  if (top.length > 0) {
    console.log('\nTop framework functions by self time:');
    for (const frame of top) {
      console.log(`  ${frame.selfPercent.toFixed(2)}%  ${frame.selfMilliseconds.toFixed(2)}ms  ${frame.functionName} (${frame.line}:${frame.column})`);
    }
    console.log('');
  }
}

async function runBenchmark() {
  await Promise.all([
    copyFile(baselineBundle, activeBaseBundle),
    copyFile(workingBundle, activeCandidateBundle),
  ]);
  await writeLiveConfig();
  await rm(nextResult, { force: true });

  const started = new Date().toISOString();
  await writeStatus({ state: 'running', started });
  const args = [
    path.join(benchmarkRoot, 'run-tachometer.mjs'),
    '--config',
    liveConfigPath,
    '--json-file',
    nextResult,
  ];
  const exitCode = await spawnTachometer(args);
  if (exitCode !== 0) {
    throw new Error(`Tachometer exited with code ${exitCode}.`);
  }

  const document = JSON.parse(await readFile(nextResult, 'utf8'));
  const summary = formatCompactSummaryFromJson(document);
  await rename(nextResult, latestResult);
  await appendFile(historyResult, `${JSON.stringify({ started, completed: new Date().toISOString(), document })}\n`);
  await writeStatus({ state: 'complete', started, completed: new Date().toISOString(), latestResult });
  console.log(`Live benchmark result written to ${latestResult}`);
  if (summary !== '') console.log(`\n${summary}\n`);
}

async function writeStatus(status) {
  await writeFile(statusResult, `${JSON.stringify(status, null, 2)}\n`);
}

async function writeLiveConfig() {
  const source = JSON.parse(await readFile(sourceConfigPath, 'utf8'));
  const config = createLiveBenchmarkConfig(source, sourceConfigPath, liveConfigPath, sampleSize);
  await writeFile(liveConfigPath, `${JSON.stringify(config, null, 2)}\n`);
}

function spawnTachometer(args) {
  return new Promise((resolve, reject) => {
    tachometerProcess = spawn(process.execPath, args, {
      cwd: benchmarkRoot,
      env: process.env,
      stdio: 'inherit',
    });
    tachometerProcess.once('error', reject);
    tachometerProcess.once('exit', code => {
      tachometerProcess = undefined;
      resolve(code ?? 1);
    });
  });
}

function formatCompactSummaryFromJson(document) {
  return formatCompactSummary(adaptTachometerJson(document, 'Live Tachometer result'));
}

async function stop() {
  if (stopping) return;
  stopping = true;
  clearTimeout(settleTimer);
  fixtureWatcher.close();
  tachometerProcess?.kill();
  await bundleWatcher.close();
  process.emit('aurelia-live-benchmark-stopped');
}

function resolveSourceConfig(value) {
  if (value === undefined || value.trim() === '') {
    throw new Error('AURELIA_LIVE_BENCH_CONFIG must identify a benchmark config.');
  }
  const resolved = path.resolve(benchmarkRoot, value);
  if (!isPathInside(benchmarkRoot, resolved) || path.extname(resolved) !== '.json') {
    throw new Error(`Live benchmark config must be a JSON file below ${benchmarkRoot}: ${value}`);
  }
  return resolved;
}

function resolveOutputRoot(value) {
  if (value === undefined || value.trim() === '') return path.join(liveRoot, 'results');
  return path.resolve(value);
}

function resolveProfileOutputRoot(value) {
  if (value === undefined || value.trim() === '') return path.join(liveRoot, 'profiles');
  return path.resolve(value);
}

function parseSampleSize(value) {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 2) {
    throw new Error('AURELIA_LIVE_BENCH_SAMPLES must be an integer greater than 1.');
  }
  return parsed;
}
