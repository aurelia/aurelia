import { spawn } from 'node:child_process';
import { watch as watchDirectory } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createLiveBenchmarkControl,
  parseLiveBenchmarkControl,
} from './live-benchmark-control.mjs';
import { resolveLiveBenchmarkConfig } from './live-benchmark-utils.mjs';

const benchmarkRoot = path.dirname(fileURLToPath(import.meta.url));
const runnerPath = path.join(benchmarkRoot, 'live-benchmark.mjs');
const controlPath = resolveControlPath(process.env.AURELIA_LIVE_BENCH_CONTROL);
const initialConfig = resolveLiveBenchmarkConfig(benchmarkRoot, process.env.AURELIA_LIVE_BENCH_CONFIG);
const switchDelay = 200;
const stopTimeout = 10000;

let active;
let activeConfig = initialConfig;
let requestedConfig = initialConfig;
let switching = false;
let stopping = false;
let switchTimer;
let controlWatcher;
let finish;
const finished = new Promise(resolve => { finish = resolve; });

if (controlPath !== undefined) {
  await mkdir(path.dirname(controlPath), { recursive: true });
  // The command-line selection always wins at startup. This prevents a stale
  // ignored file from silently establishing the wrong comparison baseline.
  await writeFile(controlPath, `${JSON.stringify(createLiveBenchmarkControl(benchmarkRoot, initialConfig), null, 2)}\n`);
  console.log(`Live benchmark control: ${controlPath}`);
  controlWatcher = watchDirectory(path.dirname(controlPath), (_event, filename) => {
    if (filename?.toString() !== path.basename(controlPath)) return;
    clearTimeout(switchTimer);
    switchTimer = setTimeout(() => void readRequest(), switchDelay);
  });
}

launch(initialConfig);
process.once('SIGINT', () => void stop());
process.once('SIGTERM', () => void stop());
process.on('message', message => {
  if (message?.type === 'aurelia-live-benchmark-stop') void stop();
});
await finished;

async function readRequest() {
  if (stopping) return;
  try {
    const nextConfig = parseLiveBenchmarkControl(benchmarkRoot, await readFile(controlPath, 'utf8'));
    if (nextConfig === requestedConfig) return;
    JSON.parse(await readFile(nextConfig, 'utf8'));
    if (process.env.AURELIA_LIVE_PROFILE !== undefined
      && !portableRelative(nextConfig).startsWith('app-repeat-realistic/')) {
      throw new Error('Live profiling currently requires an app-repeat-realistic benchmark config.');
    }
    requestedConfig = nextConfig;
    await drainSwitches();
  } catch (error) {
    console.error('Ignoring invalid live benchmark control:', error);
  }
}

async function drainSwitches() {
  if (switching || stopping) return;
  switching = true;
  try {
    while (!stopping && requestedConfig !== activeConfig) {
      const nextConfig = requestedConfig;
      console.log(`Switching live benchmark to ${portableRelative(nextConfig)}...`);
      await stopActive();
      if (stopping) return;
      activeConfig = nextConfig;
      launch(activeConfig);
    }
  } finally {
    switching = false;
  }
}

function launch(configPath) {
  const env = {
    ...process.env,
    AURELIA_LIVE_BENCH_CONFIG: portableRelative(configPath),
  };
  delete env.AURELIA_LIVE_BENCH_CONTROL;
  const child = spawn(process.execPath, [runnerPath], {
    env,
    stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
  });
  const exited = new Promise(resolve => child.once('exit', (code, signal) => resolve({ code, signal })));
  active = { child, exited, expectedExit: false };
  void exited.then(({ code, signal }) => {
    if (active?.child !== child || active.expectedExit || stopping) return;
    console.error(`Live benchmark runner exited unexpectedly (${signal ?? `code ${code}`}).`);
    process.exitCode = code === 0 ? 1 : (code ?? 1);
    void stop();
  });
}

async function stopActive() {
  const current = active;
  if (current === undefined) return;
  current.expectedExit = true;
  if (current.child.exitCode === null && current.child.signalCode === null) {
    if (current.child.connected) current.child.send({ type: 'aurelia-live-benchmark-stop' });
    else current.child.kill('SIGTERM');
  }
  let timeout;
  await Promise.race([
    current.exited,
    new Promise(resolve => {
      timeout = setTimeout(() => {
        console.error('Live benchmark cleanup timed out; terminating its runner.');
        current.child.kill('SIGTERM');
        resolve();
      }, stopTimeout);
    }),
  ]);
  clearTimeout(timeout);
  await current.exited;
  if (active === current) active = undefined;
}

async function stop() {
  if (stopping) return;
  stopping = true;
  clearTimeout(switchTimer);
  controlWatcher?.close();
  await stopActive();
  if (process.connected) process.disconnect();
  finish();
}

function resolveControlPath(value) {
  if (value === undefined || value.trim() === '') return undefined;
  return path.resolve(value);
}

function portableRelative(configPath) {
  return path.relative(benchmarkRoot, configPath).replace(/\\/gu, '/');
}
