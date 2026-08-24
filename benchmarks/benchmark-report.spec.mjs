import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createBenchmarkReport, formatBenchmarkReportMarkdown } from './benchmark-report.mjs';

const MiB = 1024 * 1024;

void describe('benchmark report', () => {
  void it('normalizes smoke results and renders an advisory Markdown report', () => {
    const report = createReport();

    assert.equal(report.measurements.length, 5);
    const heap = report.measurements.find(measurement => measurement.metric.kind === 'immediate-js-heap');
    assert.deepEqual(heap.base.meanConfidenceInterval95, { low: 81.4 * MiB, high: 81.8 * MiB });
    assert.deepEqual(heap.difference.percentConfidenceInterval95, { low: 0.25, high: 1.48 });
    assert.equal(heap.difference.assessment, 'higher');
    assert.equal(report.bundles[0].difference.bytes, 3822);
    assert.ok(Math.abs(report.bundles[0].difference.percent - 1.7814610590883877) < 1e-12);

    const markdown = formatBenchmarkReportMarkdown(report, {
      circleWorkflow: 'https://app.circleci.com/pipelines/workflows/workflow-id',
      artifacts: 'https://app.circleci.com/pipelines/workflows/workflow-id',
    });
    assert.match(markdown, /## Benchmark comparison/);
    assert.match(markdown, /Startup \| Immediate used JS heap \| `81\.40 MiB` - `81\.80 MiB`/);
    assert.match(markdown, /\+0\.20 MiB` to `\+1\.20 MiB` \(\+0\.25% to \+1\.48%\)/);
    assert.match(markdown, /app-repeat-view.*209\.51 KiB.*213\.25 KiB.*\+3\.73 KiB/);
    assert.match(markdown, /point-in-time Chrome reading/);
    assert.match(markdown, /no merge threshold is applied/);
  });

  void it('keeps each result file difference matrix local', () => {
    const report = createReport();
    const heaps = report.measurements.filter(measurement => measurement.metric.kind === 'immediate-js-heap');
    assert.equal(heaps.length, 2);
    assert.deepEqual(heaps.map(measurement => measurement.difference.assessment), ['higher', 'higher']);
    assert.ok(heaps.every(measurement => measurement.difference.percentConfidenceInterval95.low === 0.25));
  });

  void it('rejects incomplete inputs and dirty provenance', () => {
    const inputs = smokeInputs();
    assert.throws(
      () => createBenchmarkReport({
        ...inputs,
        resultDocuments: inputs.resultDocuments.slice(0, 2),
      }),
      /result set for smoke is incomplete/,
    );

    inputs.provenance.harness.dirty = true;
    assert.throws(() => createBenchmarkReport(inputs), /harness must be clean/);
  });
});

function createReport() {
  return createBenchmarkReport(smokeInputs());
}

function smokeInputs() {
  return {
    provenance: provenance(),
    resultDocuments: [
      timingInput('repeat-view-startup-10k.json', 'startup', 'startup-10k'),
      timingInput('repeat-view-rerender-10k.json', 'rerender', 'rerender-10k'),
      timingInput(
        'repeat-view-startup-100-big-template.json',
        'big-template startup 100',
        'startup-100-big-template',
        false,
      ),
    ],
    generatedAt: '2026-08-24T20:00:00.000Z',
    tachometerVersion: '0.7.1',
    provenanceInput: { file: 'variants/provenance.json', sha256: hash('f') },
  };
}

function provenance() {
  const base = 'a'.repeat(40);
  const head = 'b'.repeat(40);
  const candidate = 'c'.repeat(40);
  return {
    schemaVersion: 1,
    comparison: {
      profile: 'smoke',
      pullRequest: '2462',
      base,
      head,
      candidate,
      mergeParentsVerified: true,
    },
    harness: {
      commit: candidate,
      tree: 'd'.repeat(40),
      sha256: hash('e'),
      dirty: false,
      fixtures: ['app-repeat-view'],
    },
    environment: {
      platform: 'linux',
      architecture: 'x64',
      bundleToolchain: { node: 'v22.12.0', npm: '10.9.0', rollup: '4.29.1', terserPlugin: '0.4.4' },
    },
    base: { commit: base },
    candidate: { commit: candidate },
    comparisons: [{
      fixture: 'app-repeat-view',
      identical: false,
      base: { bytes: 214543, sha256: hash('1') },
      candidate: { bytes: 218365, sha256: hash('2') },
    }],
  };
}

function timingInput(file, scenario, entryName, includeHeap = true) {
  const perf = { name: 'perf', mode: 'performance', entryName };
  const heap = { name: 'used JS heap', mode: 'expression', expression: 'usedJSHeapSizeBytes' };
  const browser = { name: 'chrome', headless: true, userAgent: 'Chrome/140.0.0.0' };
  const benchmarks = includeHeap
    ? [
        row(`${scenario} base [perf]`, perf, { low: 10, high: 10.4 }, [null, null, null, null], browser),
        row(
          `${scenario} base [used JS heap]`,
          heap,
          { low: 81.4 * MiB, high: 81.8 * MiB },
          [null, null, null, null],
          browser,
        ),
        row(
          `${scenario} candidate [perf]`,
          perf,
          { low: 11.2, high: 11.8 },
          [rawDifference(0.8, 1.6, 0.4, 0.8), null, null, null],
          browser,
        ),
        row(
          `${scenario} candidate [used JS heap]`,
          heap,
          { low: 82 * MiB, high: 82.6 * MiB },
          [rawDifference(-72, -68, -83, -79), rawDifference(0.2 * MiB, 1.2 * MiB, 0.25, 1.48), null, null],
          browser,
        ),
      ]
    : [
        row(`${scenario} base`, perf, { low: 90, high: 92 }, [null, null], browser),
        row(
          `${scenario} candidate`,
          perf,
          { low: 88, high: 89 },
          [rawDifference(-4, -1, -4, -1), null],
          browser,
        ),
      ];
  return { file, document: { benchmarks }, sha256: hash(file[0]) };
}

function row(name, measurement, mean, differences, browser) {
  return { name, measurement, mean, differences, browser, samples: [10, 11, 10.5] };
}

const rawDifference = (absoluteLow, absoluteHigh, percentLow, percentHigh) => ({
  absolute: { low: absoluteLow, high: absoluteHigh },
  percentChange: { low: percentLow, high: percentHigh },
});
const hash = value => value.repeat(64).slice(0, 64).replace(/[^0-9a-f]/g, 'a');
