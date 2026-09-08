import { randomUUID } from 'node:crypto';
import { watch as watchDirectory } from 'node:fs';
import {
  appendFile,
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
import {
  createLiveBenchmarkConfig,
  fingerprintLiveBundle,
  fingerprintLiveFixture,
  isLiveFixtureInput,
  parseLiveDebounce,
  resolveLiveBenchmarkConfig,
} from './live-benchmark-utils.mjs';
import { createLiveBenchmarkSession } from './live-benchmark-session.mjs';
import { runTachometer } from './run-tachometer.mjs';
import { parseProfileIterations, parseProfileMode } from './live-profile-utils.mjs';

const benchmarkRoot = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(benchmarkRoot, '..');
const liveRoot = path.join(benchmarkRoot, 'live-results');
const sourceConfigPath = resolveLiveBenchmarkConfig(benchmarkRoot, process.env.AURELIA_LIVE_BENCH_CONFIG);
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
const activeBaseBundle = path.join(liveRoot, 'active', 'base', fixture, 'app.js');
const activeCandidateBundle = path.join(liveRoot, 'active', 'candidate', fixture, 'app.js');
const activeProfileBundle = path.join(liveRoot, 'profile', fixture, 'app.js');
const profileOutputRoot = resolveProfileOutputRoot(process.env.AURELIA_LIVE_PROFILE_OUTPUT);
const latestResult = path.join(outputRoot, 'latest.json');
const nextResult = path.join(outputRoot, 'latest.next.json');
const historyResult = path.join(outputRoot, 'history.jsonl');
const statusResult = path.join(outputRoot, 'status.json');

const sessionId = randomUUID();
let fixtureVersion = 0;
let buildReady = false;
let output;
let latestBuild;
let settleTimer;
let stopping = false;
let statusWrite = Promise.resolve();
const session = createLiveBenchmarkSession(runSnapshot, error => console.error('Live benchmark run failed:', error));

await Promise.all([
  mkdir(path.dirname(workingBundle), { recursive: true }),
  ...(profileMode === undefined ? [] : [mkdir(path.dirname(workingProfileBundle), { recursive: true })]),
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

const fixtureWatchers = [fixtureRoot, path.join(benchmarkRoot, 'utils')].map(directory =>
  watchDirectory(directory, { recursive: true }, (_event, filename) => {
    if (filename !== null && !isLiveFixtureInput(filename.toString())) return;
    console.log(`Benchmark fixture changed: ${filename ?? directory}`);
    ++fixtureVersion;
    session.invalidate();
    scheduleSettledBundle();
  }),
);

const bundleWatcher = watchRollup({
  input: fixtureEntry,
  watch: {
    // Coalesce the package watchers' development/production/declaration output
    // burst before spending time rebuilding and minifying the profiling app.
    buildDelay: debounce,
  },
  plugins: [
    nodeResolve({ exportConditions: ['production'] }),
    ...(profileMode === undefined ? [terser()] : []),
    {
      name: 'capture-live-output',
      writeBundle(options, bundle) {
        // Capture both outputs of this Rollup build in memory. A subsequent
        // rebuild may replace working files while timing/profile capture runs.
        const code = Object.values(bundle).find(chunk => chunk.type === 'chunk' && chunk.isEntry).code;
        output[options.file === workingBundle ? 'code' : 'profile'] = code;
      },
    },
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

bundleWatcher.on('change', () => {
  buildReady = false;
  clearTimeout(settleTimer);
});

bundleWatcher.on('event', event => {
  switch (event.code) {
    case 'BUNDLE_START':
      buildReady = false;
      output = {};
      clearTimeout(settleTimer);
      break;
    case 'BUNDLE_END':
      latestBuild = output;
      buildReady = true;
      console.log(`Profiling bundle rebuilt in ${event.duration}ms.`);
      scheduleSettledBundle(postBundleDelay);
      break;
    case 'ERROR':
      buildReady = false;
      console.error('Profiling bundle failed:', event.error);
      void writeStatus({ state: 'failed', error: String(event.error) });
      break;
  }
});

process.once('SIGINT', () => void stop());
process.once('SIGTERM', () => void stop());
process.on('message', message => {
  if (message?.type === 'aurelia-live-benchmark-stop') void stop();
});

await new Promise(resolve => process.once('aurelia-live-benchmark-stopped', resolve));

function scheduleSettledBundle(delay = debounce) {
  clearTimeout(settleTimer);
  settleTimer = setTimeout(() => void handleSettledBundle(), delay);
}

async function handleSettledBundle() {
  if (stopping || !buildReady) return;
  try {
    const build = latestBuild;
    const version = fixtureVersion;
    const source = JSON.parse(await readFile(sourceConfigPath, 'utf8'));
    const config = createLiveBenchmarkConfig(source, sourceConfigPath, liveConfigPath, sampleSize);
    const fixtureSha256 = await fingerprintLiveFixture(benchmarkRoot, fixture);
    if (stopping || !buildReady || build !== latestBuild || version !== fixtureVersion) return;
    const metadata = {
      sessionId,
      fixtureSha256,
      configSha256: fingerprintLiveBundle(JSON.stringify(config)),
      bundleSha256: fingerprintLiveBundle(build.code),
      profileSha256: build.profile === undefined ? null : fingerprintLiveBundle(build.profile),
      node: process.version,
      config: path.relative(benchmarkRoot, sourceConfigPath).replace(/\\/gu, '/'),
      sampleSize: config.sampleSize,
      profileMode,
      profileIterations,
    };
    await session.submit({ ...build, config, metadata, key: fingerprintLiveBundle(JSON.stringify(metadata)) });
  } catch (error) {
    console.error('Failed to settle the live benchmark bundle:', error);
    await writeStatus({ state: 'failed', error: String(error) });
  }
}

async function runSnapshot({ base, candidate }, signal) {
  const started = new Date().toISOString();
  const metadata = { ...candidate.metadata, baseSha256: base.metadata.bundleSha256 };
  try {
    await Promise.all([
      writeFile(activeBaseBundle, base.code),
      writeFile(activeCandidateBundle, candidate.code),
      ...(profileMode === undefined ? [] : [writeFile(activeProfileBundle, candidate.profile)]),
      writeFile(liveConfigPath, JSON.stringify(candidate.config, null, 2)),
    ]);
    signal.throwIfAborted();
    await writeStatus({ state: 'running', started, metadata });
    let document;
    if (benchmarkEnabled) {
      await rm(nextResult, { force: true });
      // The existing runner owns browser/server cleanup and prints the summary.
      await runTachometer(['--config', liveConfigPath, '--json-file', nextResult], { signal });
      document = JSON.parse(await readFile(nextResult, 'utf8'));
    }
    signal.throwIfAborted();
    if (profileMode !== undefined) await runProfile(metadata, signal);
    if (await fingerprintLiveFixture(benchmarkRoot, fixture) !== candidate.metadata.fixtureSha256) {
      session.invalidate();
    }
    signal.throwIfAborted();
    if (document !== undefined) {
      document.live = metadata;
      await writeFile(nextResult, `${JSON.stringify(document, null, 2)}\n`);
      signal.throwIfAborted();
      await rename(nextResult, latestResult);
      await appendFile(historyResult, `${JSON.stringify({ started, completed: new Date().toISOString(), document })}\n`);
      console.log(`Live benchmark result written to ${latestResult}`);
    }
    await writeStatus({ state: 'complete', started, completed: new Date().toISOString(), latestResult: benchmarkEnabled ? latestResult : undefined, metadata });
  } catch (error) {
    await writeStatus({ state: signal.aborted ? 'cancelled' : 'failed', started, metadata, error: String(error) });
    throw error;
  }
}

async function runProfile(metadata, signal) {
  const { captureLiveProfile } = await import('./live-profile.mjs');
  const result = await captureLiveProfile({
    benchmarkRoot,
    fixture,
    mode: profileMode,
    iterations: profileIterations,
    outputRoot: profileOutputRoot,
    metadata,
    signal,
  });
  console.log(`Live CPU profile written to ${result.profilePath}`);
  console.log(`Ranked CPU summary written to ${result.summaryPath}`);
  const top = result.summary.topBundleFunctions.slice(0, 10);
  if (top.length > 0) {
    console.log('\nTop bundle functions by self time:');
    for (const frame of top) {
      console.log(`  ${frame.selfPercent.toFixed(2)}%  ${frame.selfMilliseconds.toFixed(2)}ms  ${frame.functionName} (${frame.line}:${frame.column})`);
    }
    console.log('');
  }
}

function writeStatus(status) {
  // Build errors and sampling completion can arrive together. Serialize atomic
  // publication so readers always see one complete status document.
  statusWrite = statusWrite.then(async () => {
    await writeFile(`${statusResult}.next`, `${JSON.stringify(status, null, 2)}\n`);
    await rename(`${statusResult}.next`, statusResult);
  });
  return statusWrite;
}

async function stop() {
  if (stopping) return;
  stopping = true;
  clearTimeout(settleTimer);
  fixtureWatchers.forEach(watcher => watcher.close());
  await Promise.all([session.stop(), bundleWatcher.close()]);
  await statusWrite;
  if (process.connected) process.disconnect();
  process.emit('aurelia-live-benchmark-stopped');
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
