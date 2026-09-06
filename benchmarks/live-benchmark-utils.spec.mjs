import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it } from 'node:test';
import {
  createLiveBenchmarkConfig,
  fingerprintLiveBundle,
  makeLiveUrl,
  parseLiveDebounce,
} from './live-benchmark-utils.mjs';

void describe('live benchmark utilities', () => {
  void it('fingerprints executable bundle contents for duplicate-build suppression', () => {
    assert.equal(fingerprintLiveBundle('same bundle'), fingerprintLiveBundle(Buffer.from('same bundle')));
    assert.notEqual(fingerprintLiveBundle('first bundle'), fingerprintLiveBundle('second bundle'));
  });

  void it('waits for a complete development-build burst by default', () => {
    assert.equal(parseLiveDebounce(undefined), 8000);
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
});
