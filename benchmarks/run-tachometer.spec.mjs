import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
// Tachometer's private ESM entry points require explicit file extensions.
// eslint-disable-next-line import/extensions
import { Runner } from 'tachometer/lib/runner.js';
// eslint-disable-next-line import/extensions
import { Server } from 'tachometer/lib/server.js';
import { runTachometer } from './run-tachometer.mjs';

void describe('managed Tachometer execution', () => {
  void it('keeps the inherited run pipeline and closes its browser session and server once', async t => {
    const run = await setup(t);
    assert.deepEqual(await run.start(), []);
    assert.equal(run.samples, 1);
    assert.equal(run.quits, 1);
    assert.equal(run.serverCloses, 1);
    assert.equal(run.outputCalls, 1);
  });

  for (const failure of ['driver acquisition', 'initial tab lookup', 'sampling']) {
    void it(`closes acquired resources after ${failure} fails`, async t => {
      const run = await setup(t);
      const error = new Error(`${failure} failed`);
      if (failure === 'driver acquisition') run.createDriver = async () => { throw error; };
      if (failure === 'initial tab lookup') run.driver.getAllWindowHandles = async () => { throw error; };
      if (failure === 'sampling') run.sample = async () => { throw error; };
      await assert.rejects(run.start(), error);
      assert.equal(run.quits, failure === 'driver acquisition' ? 0 : 1);
      assert.equal(run.serverCloses, 1);
      assert.equal(run.outputCalls, 0);
    });
  }

  void it('disposes a session acquired after cancellation without beginning a sample', async t => {
    const run = await setup(t);
    run.createDriver = async () => {
      run.controller.abort();
      return run.driver;
    };
    await assert.rejects(run.start(), { name: 'AbortError' });
    assert.equal(run.samples, 0);
    assert.equal(run.quits, 1);
    assert.equal(run.serverCloses, 1);
  });

  void it('quits a running session on cancellation and awaits the interrupted sample before returning', async t => {
    const run = await setup(t);
    run.sample = () => new Promise((resolve, reject) => {
      run.driver.quit = async () => {
        ++run.quits;
        reject(run.controller.signal.reason);
      };
      run.controller.abort();
    });
    await assert.rejects(run.start(), { name: 'AbortError' });
    assert.equal(run.samples, 1);
    assert.equal(run.quits, 1);
    assert.equal(run.serverCloses, 1);
    assert.equal(run.outputCalls, 0);
  });

  void it('closes a server whose startup finishes after cancellation', async t => {
    const run = await setup(t);
    run.startServer = async () => {
      run.controller.abort();
      return run.server;
    };
    await assert.rejects(run.start(), { name: 'AbortError' });
    assert.equal(run.samples, 0);
    assert.equal(run.quits, 0);
    assert.equal(run.serverCloses, 1);
  });
});

async function setup(t) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'aurelia-tachometer-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const configPath = path.join(directory, 'tachometer.json');
  await writeFile(path.join(directory, 'index.html'), '<p>runner fixture</p>');
  await writeFile(configPath, JSON.stringify({
    $schema: 'https://raw.githubusercontent.com/Polymer/tachometer/master/config.schema.json',
    sampleSize: 2,
    timeout: 0,
    benchmarks: [{ name: 'runner base', url: 'index.html', browser: { name: 'chrome', headless: true } }],
  }));
  const run = {
    samples: 0,
    quits: 0,
    serverCloses: 0,
    outputCalls: 0,
    controller: new AbortController(),
    async sample() { return []; },
    start() {
      return runTachometer(['--config', configPath], { signal: this.controller.signal }, this.createDriver);
    },
  };
  run.driver = {
    getAllWindowHandles: async () => ['initial-blank-tab'],
    async quit() { ++run.quits; },
  };
  run.server = { async close() { ++run.serverCloses; } };
  run.createDriver = async () => run.driver;
  run.startServer = async () => run.server;
  t.mock.method(Server, 'start', () => run.startServer());
  // Stub only the external browser work and statistical output. Runner.run's
  // real launch -> warmup -> sample -> close -> output ordering remains in use.
  t.mock.method(Runner.prototype, 'warmup', async function () {
    await this.takeSamples(this.specs[0], 'warmup');
  });
  t.mock.method(Runner.prototype, 'takeSamples', async () => {
    ++run.samples;
    return run.sample();
  });
  t.mock.method(Runner.prototype, 'takeMinimumSamples', async () => void 0);
  t.mock.method(Runner.prototype, 'takeAdditionalSamples', async () => void 0);
  t.mock.method(Runner.prototype, 'makeResults', () => []);
  t.mock.method(Runner.prototype, 'outputResults', async () => { ++run.outputCalls; });
  return run;
}
