import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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

    const unnormalized = structuredClone(report);
    unnormalized.comparison.pullRequest = '2462';
    assert.throws(() => validateBenchmarkReport(unnormalized, expected), /requested revisions/);

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

});

void describe('explicit revision reports', () => {
  void it('reports historical revisions under the same separately identified PR harness', () => {
    const inputs = fullInputs();
    Object.assign(inputs.provenance.comparison, {
      kind: 'revisions', harness: 'd'.repeat(40), prBase: 'e'.repeat(40),
    });
    inputs.provenance.harness.commit = inputs.provenance.comparison.harness;
    const report = createBenchmarkReport(inputs);
    const expected = { ...report.comparison };
    assert.equal(validateBenchmarkReport(report, expected), report);
    assert.notEqual(report.comparison.candidate, report.harness.commit);
    const markdown = formatBenchmarkReportMarkdown(report);
    assert.match(markdown, /Harness: \[`ddddddd`\]\(https:\/\/github.com\/aurelia\/aurelia\/commit\/d{40}\)/);
    assert.match(markdown, /Explicit framework revisions, measured with the same frozen harness/);
    assert.match(markdown, /for \[#2462\]/);

    // Matching measured commits alone cannot authenticate which workload ran or which PR was frozen.
    for (const field of ['base', 'candidate', 'head', 'harness', 'prBase']) {
      const tampered = structuredClone(report);
      tampered.comparison[field] = 'f'.repeat(40);
      assert.throws(() => validateBenchmarkReport(tampered, expected), /requested revisions/);
    }
    const wrongCheckout = structuredClone(report);
    wrongCheckout.harness.commit = report.comparison.candidate;
    assert.throws(() => validateBenchmarkReport(wrongCheckout, expected), /requested harness/);
    inputs.provenance.harness.commit = inputs.provenance.comparison.candidate;
    assert.throws(() => createBenchmarkReport(inputs), /revisions do not agree/);
  });

  void it('validates standalone explicit results without a PR or a fabricated test merge', () => {
    const inputs = fullInputs();
    Object.assign(inputs.provenance.comparison, {
      kind: 'revisions', harness: 'd'.repeat(40), pullRequest: null, head: null, prBase: null, mergeParentsVerified: false,
    });
    inputs.provenance.harness.commit = inputs.provenance.comparison.harness;
    const report = createBenchmarkReport(inputs);
    assert.equal(validateBenchmarkReport(report, report.comparison), report);
    assert.equal(report.comparison.pullRequest, null);
    assert.doesNotMatch(formatBenchmarkReportMarkdown(report), /for \[#/);
    for (const patch of [{ head: 'b'.repeat(40) }, { prBase: 'e'.repeat(40) }, { mergeParentsVerified: true }]) {
      const tampered = structuredClone(report);
      Object.assign(tampered.comparison, patch);
      assert.throws(() => validateBenchmarkReport(tampered, report.comparison), /Standalone/);
    }
    inputs.provenance.harness.dirty = true;
    assert.throws(() => createBenchmarkReport(inputs), /harness must be clean/);
  });

});

void describe('benchmark report profiles', () => {
  void it('places the representative workload in every intended profile', () => {
    assert.equal(expectedResultFiles('smoke').filter(file => file.startsWith('repeat-realistic-')).length, 1);
    assert.equal(expectedResultFiles('full').filter(file => file.startsWith('repeat-realistic-')).length, 5);
    assert.equal(expectedResultFiles('smoke').includes('repeat-realistic-heap-lifecycle-500.json'), false);
    assert.equal(expectedResultFiles('smoke').includes('repeat-realistic-refresh-loop-20x1000.json'), false);
    assert.equal(expectedResultFiles('smoke').includes('binding-dependency-rotation.json'), false);
    assert.equal(expectedResultFiles('full').includes('binding-dependency-rotation.json'), true);
    assert.deepEqual(expectedResultFiles('master'), expectedResultFiles('full'));
  });

  void it('reports the full-profile lifecycle heap states without turning them into a leak verdict', () => {
    const inputs = fullInputs();
    const report = createBenchmarkReport(inputs);
    const afterGc = report.measurements.filter(measurement => measurement.metric.kind === 'used-js-heap-after-gc');

    assert.equal(report.measurements.length, 27);
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

void describe('focused benchmark reports', () => {
  void it('reports loop and fresh/cached connection timings with their own boundaries and millisecond units', () => {
    const report = createBenchmarkReport(fullInputs());
    const focused = report.measurements.filter(measurement =>
      measurement.source === 'repeat-realistic-refresh-loop-20x1000.json'
      || measurement.source === 'binding-dependency-rotation.json',
    );
    assert.deepEqual(focused.map(measurement => [measurement.scenario, measurement.metric.measurement.entryName]), [
      ['realistic keyed refresh loop 20x1000', 'realistic-refresh-loop-20x1000'],
      ['realistic keyed refresh loop 20x1000', 'realistic-refresh-median-1000'],
      ['fresh binding dependency rotation 250000', 'dependency-rotation-250000'],
      ['cached binding dependency rotation 1000000', 'dependency-rotation-cached-1000000'],
    ]);
    assert.ok(focused.every(measurement => measurement.metric.unit === 'millisecond'));
    assert.ok(focused.every(measurement => measurement.difference.assessment === 'faster'));

    const markdown = formatBenchmarkReportMarkdown(report);
    assert.match(markdown, /Realistic keyed refresh loop 20x1000 \| Median single refresh \| `90\.00ms`/);
    assert.match(markdown, /Fresh binding dependency rotation 250000 \| Duration/);
    assert.match(markdown, /Cached binding dependency rotation 1000000 \| Duration/);
    assert.match(markdown, /20 settled updates after 20 warm-ups/);

    for (const profile of ['full', 'master']) {
      const inputs = fullInputs();
      inputs.provenance.comparison.profile = profile;
      if (profile === 'master') {
        inputs.provenance.comparison.pullRequest = null;
        inputs.provenance.comparison.head = null;
        inputs.provenance.comparison.mergeParentsVerified = false;
      }
      const complete = createBenchmarkReport(inputs);
      if (profile === 'full') assert.equal(validateBenchmarkReport(complete, complete.comparison), complete);
      assert.equal(complete.measurements.length, 27);
    }
  });

  void it('rejects missing, reordered or mislabeled focused timing boundaries', () => {
    const wrongBoundary = fullInputs();
    const loop = wrongBoundary.resultDocuments.find(input => input.file === 'repeat-realistic-refresh-loop-20x1000.json');
    // Even mutually consistent base/candidate metadata must match the authored timing boundary.
    for (const benchmark of loop.document.benchmarks) {
      if (benchmark.measurement.name === 'median refresh') {
        benchmark.measurement.entryName = 'realistic-refresh-loop-20x1000';
      }
    }
    assert.throws(() => createBenchmarkReport(wrongBoundary), /invalid Median single refresh metadata/);

    const reversed = fullInputs();
    const rotation = reversed.resultDocuments.find(input => input.file === 'binding-dependency-rotation.json');
    for (const benchmark of rotation.document.benchmarks) {
      benchmark.name = benchmark.name.startsWith('fresh')
        ? benchmark.name.replace('fresh binding dependency rotation 250000', 'cached binding dependency rotation 1000000')
        : benchmark.name.replace('cached binding dependency rotation 1000000', 'fresh binding dependency rotation 250000');
    }
    assert.throws(() => createBenchmarkReport(reversed), /unexpected scenario/);

    const missingCached = fullInputs();
    const freshOnly = missingCached.resultDocuments.find(input => input.file === 'binding-dependency-rotation.json');
    freshOnly.document.benchmarks = freshOnly.document.benchmarks.slice(0, 2);
    for (const benchmark of freshOnly.document.benchmarks) benchmark.differences.length = 2;
    assert.throws(() => createBenchmarkReport(missingCached), /unexpected measurement count/);

    const missing = fullInputs();
    missing.resultDocuments = missing.resultDocuments.filter(input => input.file !== 'binding-dependency-rotation.json');
    assert.throws(() => createBenchmarkReport(missing), /result set for full is incomplete/);

    const tampered = createBenchmarkReport(fullInputs());
    tampered.measurements.find(measurement => measurement.metric.id === 'median-refresh-duration').metric.unit = 'byte';
    assert.throws(() => validateBenchmarkReport(tampered, tampered.comparison), /invalid metric metadata/);
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
    timingConfigInput('repeat-realistic-refresh-loop-20x1000.json', 'app-repeat-realistic/refresh-loop.json'),
    timingConfigInput('binding-dependency-rotation.json', 'app-repeat-realistic/dependency-rotation.json'),
    heapLifecycleInput(),
  ];
  return inputs;
}

function timingConfigInput(file, configFile) {
  const config = JSON.parse(readFileSync(new URL(configFile, import.meta.url), 'utf8'));
  const browser = { name: 'chrome', headless: true, userAgent: 'HeadlessChrome/140.0.0.0' };
  const measurements = config.benchmarks.flatMap(benchmark => benchmark.expand.flatMap(expansion =>
    [benchmark.measurement].flat().map(measurement => ({ name: expansion.name, measurement })),
  ));
  const benchmarks = measurements.map(({ name, measurement }, index) => {
    const candidate = name.endsWith('candidate');
    const differences = Array(measurements.length).fill(null);
    if (candidate) {
      const baseIndex = measurements.findIndex(entry =>
        entry.name === name.replace(/candidate$/, 'base')
        && entry.measurement.entryName === measurement.entryName,
      );
      assert.ok(baseIndex < index && baseIndex >= 0);
      differences[baseIndex] = rawDifference(-4, -1, -4, -1);
    }
    return row(
      `${name} [${measurement.name}]`,
      { ...measurement },
      candidate ? { low: 88, high: 89 } : { low: 90, high: 92 },
      differences,
      browser,
    );
  });
  return { file, document: { benchmarks }, sha256: hash('8') };
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
