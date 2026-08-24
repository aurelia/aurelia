import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatCompactSummary, makeComparisons } from './benchmark-summary.mjs';

const MiB = 1024 * 1024;
const performanceMeasurement = {
  name: 'perf',
  mode: 'performance',
  entryName: 'startup-10k',
};
const heapMeasurement = {
  name: 'used JS heap',
  mode: 'expression',
  expression: 'usedJSHeapSizeBytes',
};

void describe('compact benchmark summary', () => {
  void it('uses the global base index for each measurement and preserves small percentages', () => {
    const slower = difference(0.8, 1.6, 0.004, 0.008);
    const higherHeap = difference(0.2 * MiB, 1.2 * MiB, 0.0025, 0.0148);
    const wrongCrossMetric = difference(-72, -68, -0.83, -0.79);
    const results = [
      result('startup base [perf]', performanceMeasurement, interval(10, 10.4), [null]),
      result('startup base [used JS heap]', heapMeasurement, interval(81.4 * MiB, 81.8 * MiB), [null, null]),
      result('startup candidate [perf]', performanceMeasurement, interval(11.2, 11.8), [slower, null, null]),
      result(
        'startup candidate [used JS heap]',
        heapMeasurement,
        interval(82 * MiB, 82.6 * MiB),
        [wrongCrossMetric, higherHeap, null, null],
      ),
    ];

    const summary = formatCompactSummary(results);
    assert.match(summary, /candidate delta: `\+0\.80ms` to `\+1\.60ms` \(\+0\.40% to \+0\.80%\) -> slower/);
    assert.match(summary, /Startup used JS heap: candidate `82\.00 MiB` - `82\.60 MiB` vs base `81\.40 MiB` - `81\.80 MiB`/);
    assert.match(summary, /candidate delta: `\+0\.20 MiB` to `\+1\.20 MiB` \(\+0\.25% to \+1\.48%\) -> higher/);
    assert.doesNotMatch(summary, /-83\.00%/);
  });

  void it('keeps scenarios with the same measurement name separate', () => {
    const results = [
      result('startup base [perf]', performanceMeasurement, interval(10, 11), [null]),
      result('startup candidate [perf]', performanceMeasurement, interval(11, 12), [difference(0.5, 2, 0.05, 0.2), null]),
      result('rerender base [perf]', performanceMeasurement, interval(20, 21), [null, null, null]),
      result(
        'rerender candidate [perf]',
        performanceMeasurement,
        interval(18, 19),
        [null, null, difference(-3, -1, -0.15, -0.05), null],
      ),
    ];

    const comparisons = makeComparisons(results);
    assert.deepEqual(comparisons.map(comparison => comparison.scenario), ['startup', 'rerender']);
    assert.match(formatCompactSummary(results), /Rerender perf:[\s\S]*-> faster/);
  });

  void it('reports an interval crossing zero as no clear change', () => {
    const results = pairResults(
      'startup',
      performanceMeasurement,
      interval(10, 11),
      interval(9.8, 11.2),
      difference(-0.5, 0.8, -0.05, 0.08),
    );

    assert.match(formatCompactSummary(results), /-> no clear change/);
  });

  void it('classifies a lower used-heap interval', () => {
    const results = pairResults(
      'startup',
      heapMeasurement,
      interval(82 * MiB, 83 * MiB),
      interval(80 * MiB, 81 * MiB),
      difference(-3 * MiB, -1 * MiB, -0.04, -0.01),
    );

    assert.match(formatCompactSummary(results), /-> lower/);
  });

  void it('does not invent units for a generic expression', () => {
    const measurement = { name: 'nodes', mode: 'expression', expression: 'nodeCount' };
    const results = pairResults(
      'startup',
      measurement,
      interval(100, 101),
      interval(102, 103),
      difference(1, 3, 0.01, 0.03),
    );

    const summary = formatCompactSummary(results);
    assert.match(summary, /Startup nodes: candidate `102\.00` - `103\.00` vs base `100\.00` - `101\.00`/);
    assert.doesNotMatch(summary, /MiB|ms/);
  });

  void it('accepts single-measurement result names without a suffix', () => {
    const results = [
      result('big-template startup 100 base', performanceMeasurement, interval(90, 92), [null]),
      result(
        'big-template startup 100 candidate',
        performanceMeasurement,
        interval(88, 89),
        [difference(-4, -1, -0.04, -0.01), null],
      ),
    ];

    assert.match(formatCompactSummary(results), /Big-template startup 100 perf:[\s\S]*-> faster/);
  });

  void it('rejects incomplete or ambiguously named comparisons', () => {
    assert.throws(
      () => makeComparisons([result('startup base [perf]', performanceMeasurement, interval(10, 11), [null])]),
      /requires one base and one candidate/,
    );
    assert.throws(
      () => makeComparisons([result('startup local [perf]', performanceMeasurement, interval(10, 11), [null])]),
      /must end in "base" or "candidate"/,
    );
    assert.throws(
      () => makeComparisons(pairResults(
        'startup',
        performanceMeasurement,
        interval(10, 11),
        interval(11, 12),
        null,
      )),
      /has no candidate-to-base difference/,
    );
  });
});

function pairResults(scenario, measurement, baseInterval, candidateInterval, candidateDifference) {
  return [
    result(`${scenario} base [${measurement.name}]`, measurement, baseInterval, [null]),
    result(`${scenario} candidate [${measurement.name}]`, measurement, candidateInterval, [candidateDifference, null]),
  ];
}

function result(name, measurement, meanCI, differences) {
  return {
    result: {
      name,
      measurement,
      browser: { name: 'chrome', headless: true },
    },
    stats: { meanCI },
    differences,
  };
}

const interval = (low, high) => ({ low, high });
const difference = (absoluteLow, absoluteHigh, relativeLow, relativeHigh) => ({
  absolute: interval(absoluteLow, absoluteHigh),
  relative: interval(relativeLow, relativeHigh),
});
