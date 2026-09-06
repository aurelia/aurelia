import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { captureLiveProfile } from './live-profile.mjs';

void describe('live CPU profile capture', () => {
  void it('serves the selected snapshot, validates the workload, and preserves raw samples and provenance', async t => {
    const capture = await setup(t);
    const result = await capture.run();
    assert.deepEqual(await capture.read('refresh-latest.cpuprofile'), capture.profile);
    assert.equal(result.summary.topBundleFunctions[0].functionName, 'refresh');
    assert.equal(result.summary.topBundleFunctions[0].line, 10);
    assert.deepEqual(result.summary.metadata, capture.options.metadata);
    assert.deepEqual((await capture.read('status.json')).metadata, capture.options.metadata);
    assert.equal((await capture.read('status.json')).state, 'complete');
    assert.deepEqual(capture.commands, ['Profiler.enable', 'Profiler.setSamplingInterval', 'Profiler.start', 'Profiler.stop']);
    assert.equal(capture.validated, true);
    await capture.assertClosed();
  });

  for (const failure of ['acquisition', 'navigation', 'workload', 'validation']) {
    void it(`closes acquired resources after ${failure} failure and retains the previous profile`, async t => {
      const capture = await setup(t);
      if (failure === 'acquisition') capture.createDriver = () => { throw new Error('acquisition failed'); };
      if (failure === 'navigation') capture.driver.get = async url => {
        capture.pageUrl = url;
        throw new Error('navigation failed');
      };
      if (failure === 'workload') capture.driver.executeAsyncScript = async () => ({ ok: false, error: 'workload failed' });
      if (failure === 'validation') capture.driver.executeScript = async () => { throw new Error('validation failed'); };

      await assert.rejects(capture.run(), new RegExp(`${failure} failed`, 'u'));
      assert.equal((await capture.read('status.json')).state, 'failed');
      assert.deepEqual(await capture.read('refresh-latest.cpuprofile'), { previous: true });
      await capture.assertClosed(failure === 'acquisition' ? 0 : 1);
    });
  }

  void it('disposes a driver acquired after cancellation before opening a server', async t => {
    const capture = await setup(t);
    const controller = new AbortController();
    capture.options.signal = controller.signal;
    capture.createDriver = async () => {
      controller.abort();
      return capture.driver;
    };
    await assert.rejects(capture.run(), { name: 'AbortError' });
    assert.equal(capture.pageUrl, undefined);
    assert.equal((await capture.read('status.json')).state, 'cancelled');
    await capture.assertClosed();
  });

  void it('closes a running session on cancellation and does not publish its samples', async t => {
    const capture = await setup(t);
    const controller = new AbortController();
    capture.options.signal = controller.signal;
    capture.driver.executeAsyncScript = async () => {
      controller.abort();
      assert.equal(capture.quitCount, 1);
      return { ok: true, result: { rowCount: 1000 } };
    };
    await assert.rejects(capture.run(), { name: 'AbortError' });
    assert.equal((await capture.read('status.json')).state, 'cancelled');
    assert.deepEqual(await capture.read('refresh-latest.cpuprofile'), { previous: true });
    await capture.assertClosed();
  });
});

async function setup(t) {
  const benchmarkRoot = await mkdtemp(path.join(os.tmpdir(), 'aurelia-live-profile-'));
  t.after(() => rm(benchmarkRoot, { recursive: true, force: true }));
  const fixture = 'app-repeat-realistic';
  const outputRoot = path.join(benchmarkRoot, 'output');
  await mkdir(path.join(benchmarkRoot, fixture));
  await mkdir(outputRoot);
  await writeFile(path.join(benchmarkRoot, fixture, 'profile.html'), '<p>selected fixture</p>');
  await writeFile(path.join(outputRoot, 'refresh-latest.cpuprofile'), '{"previous":true}');
  const capture = {
    options: {
      benchmarkRoot, fixture, mode: 'refresh', iterations: 2, outputRoot,
      metadata: { generation: 7, candidateFingerprint: 'selected-minified', profileFingerprint: 'selected-unminified' },
    },
    profile: {
      nodes: [{
        id: 1,
        callFrame: {
          functionName: 'refresh',
          url: `http://localhost/live-results/profile/${fixture}/app.js`,
          lineNumber: 9,
          columnNumber: 4,
        },
      }],
      samples: [1],
      timeDeltas: [500],
    },
    commands: [],
    quitCount: 0,
    validated: false,
    pageUrl: undefined,
    async read(file) { return JSON.parse(await readFile(path.join(outputRoot, file), 'utf8')); },
    async assertClosed(quitCount = 1) {
      assert.equal(this.quitCount, quitCount);
      if (this.pageUrl !== undefined) await assert.rejects(fetch(this.pageUrl));
    },
    run() { return captureLiveProfile(this.options, this.createDriver); },
  };
  capture.driver = {
    manage: () => ({ setTimeouts: async () => void 0 }),
    async get(url) {
      capture.pageUrl = url;
      const response = await fetch(url);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.equal(await response.text(), '<p>selected fixture</p>');
    },
    wait: async () => void 0,
    async executeScript() { capture.validated = true; return true; },
    async sendDevToolsCommand(command) { capture.commands.push(command); },
    executeAsyncScript: async () => ({ ok: true, result: { rowCount: 1000 } }),
    async sendAndGetDevToolsCommand(command) {
      capture.commands.push(command);
      return JSON.stringify({ profile: capture.profile });
    },
    async quit() { ++capture.quitCount; },
  };
  capture.createDriver = async () => capture.driver;
  return capture;
}
