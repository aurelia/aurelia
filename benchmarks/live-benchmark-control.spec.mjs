import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it } from 'node:test';
import {
  createLiveBenchmarkControl,
  parseLiveBenchmarkControl,
} from './live-benchmark-control.mjs';

const benchmarkRoot = path.resolve('benchmark-root');

void describe('live benchmark control', () => {
  void it('round-trips a benchmark config below the benchmark root', () => {
    const configPath = path.join(benchmarkRoot, 'app-example', 'startup.json');
    const control = createLiveBenchmarkControl(benchmarkRoot, configPath);

    assert.deepEqual(control, { config: 'app-example/startup.json' });
    assert.equal(parseLiveBenchmarkControl(benchmarkRoot, JSON.stringify(control)), configPath);
  });

  void it('rejects malformed controls and configs outside the benchmark root', () => {
    assert.throws(() => parseLiveBenchmarkControl(benchmarkRoot, 'not JSON'), /valid JSON/);
    assert.throws(() => parseLiveBenchmarkControl(benchmarkRoot, '[]'), /JSON object/);
    assert.throws(() => parseLiveBenchmarkControl(benchmarkRoot, '{}'), /string "config"/);
    assert.throws(
      () => parseLiveBenchmarkControl(benchmarkRoot, '{"config":"../outside.json"}'),
      /below/,
    );
  });
});
