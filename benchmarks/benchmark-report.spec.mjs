import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createBenchmarkReport,
  expectedResultFiles,
  formatBenchmarkReportMarkdown,
  validateBenchmarkReport,
} from './benchmark-report.mjs';

const MiB = 1024 * 1024;

void describe('benchmark report', () => {
  void it('normalizes smoke results and renders an advisory Markdown report', () => {
    const report = createReport();

    assert.equal(report.measurements.length, 7);
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
    assert.match(markdown, /Realistic keyed refresh 1000 \| Duration/);
    assert.match(markdown, /\+0\.20 MiB` to `\+1\.20 MiB` \(\+0\.25% to \+1\.48%\)/);
    assert.match(markdown, /app-repeat-view.*209\.51 KiB.*213\.25 KiB.*\+3\.73 KiB/);
    assert.match(markdown, /without forcing GC/);
    assert.match(markdown, /no merge threshold is applied/);
  });

  void it('keeps each result file difference matrix local', () => {
    const report = createReport();
    const heaps = report.measurements.filter(measurement => measurement.metric.kind === 'immediate-js-heap');
    assert.equal(heaps.length, 3);
    assert.deepEqual(heaps.map(measurement => measurement.difference.assessment), ['higher', 'higher', 'higher']);
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

    const missingRecord = smokeInputs();
    missingRecord.provenance.harness = null;
    assert.throws(() => createBenchmarkReport(missingRecord), /missing a comparison, harness, base, or candidate record/);
  });

  void it('validates the machine report before trusted rendering', () => {
    const report = createReport();
    const expected = {
      profile: 'smoke',
      pullRequest: 2462,
      base: 'a'.repeat(40),
      head: 'b'.repeat(40),
      candidate: 'c'.repeat(40),
    };
    assert.equal(validateBenchmarkReport(report, expected), report);

    const tampered = structuredClone(report);
    tampered.measurements[0].difference.assessment = 'faster';
    assert.throws(() => validateBenchmarkReport(tampered, expected), /invalid assessment/);

    const injected = structuredClone(report);
    injected.bundles[0].fixture = '`@team`';
    assert.throws(() => validateBenchmarkReport(injected, expected), /invalid identity metadata/);

    const toolchainInjection = structuredClone(report);
    toolchainInjection.environment.bundleToolchain.node = '`@team`';
    assert.throws(() => validateBenchmarkReport(toolchainInjection, expected), /toolchain metadata is invalid/);

    const browserInjection = structuredClone(report);
    browserInjection.environment.browsers[0].userAgent = 'HeadlessChrome/1.2.3.4`@team`';
    assert.throws(() => validateBenchmarkReport(browserInjection, expected), /browser metadata is invalid/);
  });

  void it('places the representative workload in every intended profile', () => {
    assert.equal(expectedResultFiles('smoke').filter(file => file.startsWith('repeat-realistic-')).length, 1);
    assert.equal(expectedResultFiles('full').filter(file => file.startsWith('repeat-realistic-')).length, 4);
    assert.equal(expectedResultFiles('smoke').includes('repeat-realistic-heap-lifecycle-500.json'), false);
    assert.deepEqual(expectedResultFiles('master'), expectedResultFiles('full'));
  });

  void it('reports the full-profile lifecycle heap states without turning them into a leak verdict', () => {
    const inputs = fullInputs();
    const report = createBenchmarkReport(inputs);
    const afterGc = report.measurements.filter(measurement => measurement.metric.kind === 'used-js-heap-after-gc');

    assert.equal(report.measurements.length, 23);
    assert.deepEqual(afterGc.map(measurement => measurement.metric.state), ['live-list', 'post-teardown']);
    assert.deepEqual(afterGc.map(measurement => measurement.metric.unit), ['byte', 'byte']);
    assert.deepEqual(afterGc.map(measurement => measurement.difference.assessment), ['lower', 'lower']);
    assert.deepEqual(report.notices.map(notice => notice.code), [
      'immediate-used-js-heap',
      'used-js-heap-after-gc',
    ]);
    assert.deepEqual(report.methodology.usedJsHeapAfterGc, {
      source: 'performance.memory.usedJSHeapSize',
      scope: 'whole-page-js-heap',
      explicitGc: true,
      gcExecution: 'async-major',
      collectionPasses: 2,
      warmupLifecycleCycles: 2,
      rows: 500,
      comparison: 'absolute-base-vs-candidate-per-state',
      teardown: 'aurelia.stop(true), aurelia.dispose(), remove host',
    });
    assert.ok(afterGc.every(measurement => measurement.base.samples === 20));
    assert.ok(afterGc.every(measurement => measurement.candidate.samples === 20));

    const markdown = formatBenchmarkReportMarkdown(report);
    assert.match(markdown, /Used JS heap after GC \(live list\).*`20\.00 MiB` - `20\.20 MiB`/);
    assert.match(markdown, /`-2\.00 MiB` to `-0\.50 MiB` \(-10\.00% to -2\.50%\).*lower/);
    assert.match(markdown, /comparative evidence rather than a leak measurement/);
    assert.match(markdown, /Native DOM and renderer memory are outside this metric/);

    const expected = {
      profile: 'full',
      pullRequest: 2462,
      base: 'a'.repeat(40),
      head: 'b'.repeat(40),
      candidate: 'c'.repeat(40),
    };
    assert.equal(validateBenchmarkReport(report, expected), report);

    const tampered = structuredClone(report);
    tampered.measurements.find(measurement => measurement.metric.state === 'post-teardown').metric.state = 'live-list';
    assert.throws(() => validateBenchmarkReport(tampered, expected), /invalid metric metadata/);

    const missingNotice = structuredClone(report);
    missingNotice.notices.pop();
    assert.throws(() => validateBenchmarkReport(missingNotice, expected), /notices do not match/);

    const wrongMethod = structuredClone(report);
    wrongMethod.methodology.usedJsHeapAfterGc.collectionPasses = 1;
    assert.throws(() => validateBenchmarkReport(wrongMethod, expected), /after-GC methodology is invalid/);

    const missingMethodology = structuredClone(report);
    missingMethodology.methodology = null;
    assert.throws(() => validateBenchmarkReport(missingMethodology, expected), /methodology does not match/);

    const wrongSampleCount = structuredClone(report);
    wrongSampleCount.measurements.find(measurement => measurement.metric.state === 'live-list').base.samples = 19;
    assert.throws(() => validateBenchmarkReport(wrongSampleCount, expected), /invalid sample counts/);

    const wrongExpression = fullInputs();
    const lifecycleInput = wrongExpression.resultDocuments.at(-1);
    lifecycleInput.document.benchmarks[0].measurement.expression = 'window.unrelatedHeapValue';
    assert.throws(() => createBenchmarkReport(wrongExpression), /invalid Used JS heap after GC.*metadata/);
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
        'repeat-realistic-refresh-1000.json',
        'realistic keyed refresh 1000',
        'realistic-refresh-1000',
      ),
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

function fullInputs() {
  const inputs = smokeInputs();
  inputs.provenance.comparison.profile = 'full';
  inputs.resultDocuments = [
    timingInput('repeat-view-startup-10k.json', 'startup', 'startup-10k'),
    timingInput('repeat-ce-startup-10k.json', 'startup CE', 'startup-10k'),
    timingInput('repeat-view-rerender-10k.json', 'rerender', 'rerender-10k'),
    timingInput('repeat-ce-rerender-10k.json', 'rerender CE', 'rerender-10k'),
    timingInput(
      'repeat-view-startup-100-big-template.json',
      'big-template startup 100',
      'startup-100-big-template',
      false,
    ),
    timingInput('repeat-view-update-1k.json', 'update 1k', 'update-1k'),
    timingInput('app-repeat-view-keyed-expr.json', 'keyed expr', 'keyed-expr'),
    timingInput('app-repeat-view-keyed-string.json', 'keyed string', 'keyed-string'),
    timingInput(
      'repeat-realistic-startup-1000.json',
      'realistic startup 1000',
      'realistic-startup-1000',
    ),
    timingInput(
      'repeat-realistic-refresh-1000.json',
      'realistic keyed refresh 1000',
      'realistic-refresh-1000',
    ),
    timingInput(
      'repeat-realistic-mixed-1000.json',
      'realistic mixed reconciliation 1000',
      'realistic-mixed-1000',
    ),
    heapLifecycleInput(),
  ];
  return inputs;
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
      fixtures: [
        'app-repeat-view',
        'app-repeat-ce',
        'app-repeat-view-big-template',
        'app-repeat-view-keyed-string',
        'app-repeat-view-keyed-expr',
        'app-repeat-realistic',
      ],
    },
    environment: {
      platform: 'linux',
      architecture: 'x64',
      bundleToolchain: { node: 'v22.12.0', npm: '10.9.0', rollup: '4.29.1', terserPlugin: '0.4.4' },
    },
    base: { commit: base },
    candidate: { commit: candidate },
    comparisons: [
      'app-repeat-view',
      'app-repeat-ce',
      'app-repeat-view-big-template',
      'app-repeat-view-keyed-string',
      'app-repeat-view-keyed-expr',
      'app-repeat-realistic',
    ].map(fixture => ({
      fixture,
      identical: false,
      base: { bytes: 214543, sha256: hash('1') },
      candidate: { bytes: 218365, sha256: hash('2') },
    })),
  };
}

function timingInput(file, scenario, entryName, includeHeap = true) {
  const perf = { name: 'perf', mode: 'performance', entryName };
  const heap = { name: 'used JS heap', mode: 'expression', expression: 'window.usedJSHeapSizeBytes' };
  const browser = { name: 'chrome', headless: true, userAgent: 'HeadlessChrome/140.0.0.0' };
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

function heapLifecycleInput() {
  const live = {
    name: 'used JS heap after GC (live list)',
    mode: 'expression',
    expression: 'window.heapLifecycle?.liveListUsedJSHeapAfterGcBytes',
  };
  const postTeardown = {
    name: 'used JS heap after GC (post-teardown)',
    mode: 'expression',
    expression: 'window.heapLifecycle?.postTeardownUsedJSHeapAfterGcBytes',
  };
  const browser = { name: 'chrome', headless: true, userAgent: 'HeadlessChrome/140.0.0.0' };
  return {
    file: 'repeat-realistic-heap-lifecycle-500.json',
    sha256: hash('9'),
    document: {
      benchmarks: [
        heapRow(
          'realistic heap lifecycle 500 base [used JS heap after GC (live list)]',
          live,
          { low: 20 * MiB, high: 20.2 * MiB },
          [null, null, null, null],
          browser,
        ),
        heapRow(
          'realistic heap lifecycle 500 base [used JS heap after GC (post-teardown)]',
          postTeardown,
          { low: 3 * MiB, high: 3.1 * MiB },
          [null, null, null, null],
          browser,
        ),
        heapRow(
          'realistic heap lifecycle 500 candidate [used JS heap after GC (live list)]',
          live,
          { low: 19 * MiB, high: 19.5 * MiB },
          [rawDifference(-2 * MiB, -0.5 * MiB, -10, -2.5), null, null, null],
          browser,
        ),
        heapRow(
          'realistic heap lifecycle 500 candidate [used JS heap after GC (post-teardown)]',
          postTeardown,
          { low: 2.5 * MiB, high: 2.8 * MiB },
          [null, rawDifference(-0.8 * MiB, -0.1 * MiB, -25, -3), null, null],
          browser,
        ),
      ],
    },
  };
}

function row(name, measurement, mean, differences, browser) {
  return { name, measurement, mean, differences, browser, samples: [10, 11, 10.5] };
}

function heapRow(...args) {
  return { ...row(...args), samples: Array(20).fill(10.5) };
}

const rawDifference = (absoluteLow, absoluteHigh, percentLow, percentHigh) => ({
  absolute: { low: absoluteLow, high: absoluteHigh },
  percentChange: { low: percentLow, high: percentHigh },
});
const hash = value => value.repeat(64).slice(0, 64).replace(/[^0-9a-f]/g, 'a');
