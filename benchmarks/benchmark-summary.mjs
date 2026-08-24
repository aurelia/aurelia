export function formatCompactSummary(results) {
  return makeComparisons(results).map(formatComparison).join('\n\n');
}

export function adaptTachometerJson(document, source = 'Tachometer result') {
  if (document === null || typeof document !== 'object' || !Array.isArray(document.benchmarks)) {
    throw new Error(`${source} does not contain a Tachometer benchmarks array.`);
  }
  const resultCount = document.benchmarks.length;
  return document.benchmarks.map((benchmark, resultIndex) => {
    if (!Array.isArray(benchmark.samples) || benchmark.samples.some(sample => !Number.isFinite(sample))) {
      throw new Error(`${source} benchmark ${resultIndex} has invalid samples.`);
    }
    if (!Array.isArray(benchmark.differences) || benchmark.differences.length !== resultCount) {
      throw new Error(`${source} benchmark ${resultIndex} has an invalid difference matrix row.`);
    }
    return {
      result: {
        name: benchmark.name,
        measurement: benchmark.measurement,
        browser: benchmark.browser,
        millis: [...benchmark.samples],
      },
      stats: { meanCI: readInterval(benchmark.mean, `${source} benchmark ${resultIndex} mean`) },
      differences: benchmark.differences.map((difference, differenceIndex) => {
        if (difference === null) return null;
        return {
          absolute: readInterval(
            difference.absolute,
            `${source} benchmark ${resultIndex} difference ${differenceIndex} absolute`,
          ),
          relative: divideInterval(
            readInterval(
              difference.percentChange,
              `${source} benchmark ${resultIndex} difference ${differenceIndex} percent change`,
            ),
            100,
          ),
        };
      }),
    };
  });
}

export function makeComparisons(results) {
  if (!Array.isArray(results)) {
    throw new Error('Expected Tachometer to return an array of benchmark results.');
  }

  const groups = new Map();
  for (let globalIndex = 0; globalIndex < results.length; globalIndex++) {
    const entry = results[globalIndex];
    const { scenario, variant } = parseResultName(entry.result?.name);
    const measurement = entry.result?.measurement;
    const key = JSON.stringify([
      scenario,
      measurementIdentity(measurement),
      entry.result?.browser ?? null,
    ]);
    let group = groups.get(key);
    if (group === undefined) {
      group = { scenario, measurement, variants: new Map() };
      groups.set(key, group);
    }
    if (group.variants.has(variant)) {
      throw new Error(`Benchmark "${scenario}" contains more than one ${variant} result.`);
    }
    group.variants.set(variant, { entry, globalIndex });
  }

  return [...groups.values()].map(group => {
    const base = group.variants.get('base');
    const candidate = group.variants.get('candidate');
    const metric = measurementLabel(group.measurement);
    if (base === undefined || candidate === undefined) {
      throw new Error(`Benchmark "${group.scenario}" ${metric} requires one base and one candidate result.`);
    }
    const difference = candidate.entry.differences?.[base.globalIndex];
    if (difference == null) {
      throw new Error(
        `Benchmark "${group.scenario}" ${metric} has no candidate-to-base difference at index ${base.globalIndex}.`
      );
    }
    return {
      scenario: group.scenario,
      measurement: group.measurement,
      kind: metricKind(group.measurement),
      base: base.entry,
      candidate: candidate.entry,
      difference,
    };
  });
}

function formatComparison(comparison) {
  const { scenario, measurement, kind, base, candidate, difference } = comparison;
  const label = capitalize(`${scenario} ${measurementLabel(measurement)}`);
  return [
    `${label}: candidate ${formatMetricInterval(candidate.stats.meanCI, kind)} vs base ${formatMetricInterval(base.stats.meanCI, kind)}`,
    `candidate delta: ${formatMetricDelta(difference.absolute, kind)} (${formatPercentDelta(difference.relative)}) -> ${classifyDifference(difference, kind)}`,
  ].join('\n');
}

function parseResultName(name) {
  if (typeof name !== 'string') {
    throw new Error('Tachometer returned a result without a name.');
  }
  const withoutMeasurement = name.replace(/\s+\[[^\]]+\]$/, '');
  const match = /^(.*)\s+(base|candidate)$/.exec(withoutMeasurement);
  if (match === null || match[1].trim() === '') {
    throw new Error(`Benchmark result "${name}" must end in "base" or "candidate".`);
  }
  return { scenario: match[1].trim(), variant: match[2] };
}

function measurementIdentity(measurement) {
  if (measurement?.mode === 'performance') {
    return `performance:${measurement.name ?? ''}:${measurement.entryName ?? ''}`;
  }
  if (measurement?.mode === 'expression') {
    return `expression:${measurement.name ?? ''}:${measurement.expression ?? ''}`;
  }
  if (measurement?.mode === 'callback') {
    return `callback:${measurement.name ?? ''}`;
  }
  throw new Error(`Unsupported benchmark measurement mode "${measurement?.mode}".`);
}

export function measurementLabel(measurement) {
  return measurement?.name ?? measurement?.mode ?? 'measurement';
}

export function metricKind(measurement) {
  if (measurement?.mode === 'performance') return 'duration';
  if (measurement?.mode === 'expression' && usedJsHeapExpressions.has(measurement.expression)) {
    return 'heap-bytes';
  }
  return 'number';
}

const usedJsHeapExpressions = new Set([
  'window.usedJSHeapSizeBytes',
  'window.heapLifecycle?.liveListUsedJSHeapAfterGcBytes',
  'window.heapLifecycle?.postTeardownUsedJSHeapAfterGcBytes',
]);

export function formatMetricInterval(interval, kind) {
  return `\`${formatValue(interval.low, kind)}\` - \`${formatValue(interval.high, kind)}\``;
}

export function formatMetricDelta(interval, kind) {
  return `\`${formatSignedValue(interval.low, kind)}\` to \`${formatSignedValue(interval.high, kind)}\``;
}

export function formatPercentDelta(interval) {
  return `${formatSignedNumber(interval.low * 100, '%')} to ${formatSignedNumber(interval.high * 100, '%')}`;
}

function formatValue(value, kind) {
  switch (kind) {
    case 'duration': return `${formatNumber(value)}ms`;
    case 'heap-bytes': return `${formatNumber(value / (1024 * 1024))} MiB`;
    default: return formatNumber(value);
  }
}

function formatSignedValue(value, kind) {
  const normalized = kind === 'heap-bytes' ? value / (1024 * 1024) : value;
  const suffix = kind === 'duration' ? 'ms' : kind === 'heap-bytes' ? ' MiB' : '';
  return formatSignedNumber(normalized, suffix);
}

function formatSignedNumber(value, suffix) {
  const normalized = normalizeRoundedZero(value);
  const sign = normalized > 0 ? '+' : normalized < 0 ? '-' : '';
  return `${sign}${formatNumber(Math.abs(normalized))}${suffix}`;
}

function formatNumber(value) {
  return normalizeRoundedZero(value).toFixed(2);
}

function normalizeRoundedZero(value) {
  return Math.abs(value) < 0.005 ? 0 : value;
}

export function classifyDifference(difference, kind) {
  if (difference.absolute.low > 0 && difference.relative.low > 0) {
    return kind === 'duration' ? 'slower' : 'higher';
  }
  if (difference.absolute.high < 0 && difference.relative.high < 0) {
    return kind === 'duration' ? 'faster' : 'lower';
  }
  return 'no clear change';
}

function capitalize(value) {
  return value === '' ? value : `${value[0].toUpperCase()}${value.slice(1)}`;
}

function readInterval(value, label) {
  if (value === null || typeof value !== 'object' || !Number.isFinite(value.low) || !Number.isFinite(value.high)) {
    throw new Error(`${label} is not a finite interval.`);
  }
  if (value.low > value.high) throw new Error(`${label} has reversed bounds.`);
  return { low: value.low, high: value.high };
}

const divideInterval = (interval, divisor) => ({
  low: interval.low / divisor,
  high: interval.high / divisor,
});
