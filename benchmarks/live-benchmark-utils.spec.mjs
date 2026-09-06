import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { describe, it } from 'node:test';
import {
  createLiveBenchmarkConfig,
  fingerprintLiveBundle,
  fingerprintLiveFixture,
  makeLiveUrl,
  parseLiveDebounce,
} from './live-benchmark-utils.mjs';

void describe('live benchmark utilities', () => {
  void it('fingerprints executable bundle contents for duplicate-build suppression', () => {
    assert.equal(fingerprintLiveBundle('same bundle'), fingerprintLiveBundle(Buffer.from('same bundle')));
    assert.notEqual(fingerprintLiveBundle('first bundle'), fingerprintLiveBundle('second bundle'));
  });

  void it('waits for a complete development-build burst by default', () => {
    assert.equal(parseLiveDebounce(undefined), 15000);
    assert.equal(parseLiveDebounce('7500'), 7500);
    assert.throws(() => parseLiveDebounce('249'), /at least 250 milliseconds/);
    assert.throws(() => parseLiveDebounce('1.5'), /at least 250 milliseconds/);
  });

  void it('relocates local benchmark pages and selects live bundles', () => {
    const sourceConfig = path.resolve('benchmarks/app-example/bench.json');
    const liveConfig = path.resolve('benchmarks/live-results/tachometer.config.json');
    const config = createLiveBenchmarkConfig({
      root: '..',
      benchmarks: [{
        expand: [
          { name: 'example base', url: 'page.html?variant=base' },
          { name: 'example candidate', url: 'page.html?variant=candidate&mode=fast' },
        ],
      }],
    }, sourceConfig, liveConfig, 12);

    assert.equal(config.root, '..');
    assert.equal(config.sampleSize, 12);
    assert.deepEqual(config.benchmarks[0].expand, [
      { name: 'example base', url: '../app-example/page.html?variant=base&live=true' },
      { name: 'example candidate', url: '../app-example/page.html?variant=candidate&mode=fast&live=true' },
    ]);
  });

  void it('uses a bounded live default without changing an explicit source sample size', () => {
    const sourceConfig = path.resolve('benchmarks/app-example/bench.json');
    const liveConfig = path.resolve('benchmarks/live-results/tachometer.config.json');
    const defaulted = createLiveBenchmarkConfig({ benchmarks: [] }, sourceConfig, liveConfig);
    const explicit = createLiveBenchmarkConfig({ sampleSize: 35, benchmarks: [] }, sourceConfig, liveConfig);

    assert.equal(defaulted.sampleSize, 20);
    assert.equal(explicit.sampleSize, 35);
  });

  void it('rejects remote pages because live bundles are local', () => {
    assert.throws(
      () => makeLiveUrl('https://example.com/bench.html', 'source', 'live'),
      /require a local page/,
    );
  });

  void it('fingerprints page-only and shared-helper changes, including added or deleted files', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'aurelia-live-inputs-'));
    try {
      await mkdir(path.join(root, 'app-test'));
      await mkdir(path.join(root, 'utils'));
      const page = path.join(root, 'app-test', 'page.html');
      const helper = path.join(root, 'utils', 'data.js');
      await writeFile(page, '<p>first</p>');
      await writeFile(helper, 'export const rows = 10;');
      const first = await fingerprintLiveFixture(root, 'app-test');
      await writeFile(page, '<p>second</p>');
      const second = await fingerprintLiveFixture(root, 'app-test');
      assert.notEqual(second, first);
      await writeFile(helper, 'export const rows = 20;');
      const third = await fingerprintLiveFixture(root, 'app-test');
      assert.notEqual(third, second);
      const added = path.join(root, 'app-test', 'extra.mjs');
      await writeFile(added, 'export const count = 1;');
      assert.notEqual(await fingerprintLiveFixture(root, 'app-test'), third);
      await rm(added);
      assert.equal(await fingerprintLiveFixture(root, 'app-test'), third);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
