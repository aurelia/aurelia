import {
  adaptTachometerJson,
  classifyDifference,
  formatMetricDelta,
  formatMetricInterval,
  formatPercentDelta,
  makeComparisons,
  measurementLabel,
} from './benchmark-summary.mjs';

const shaPattern = /^[0-9a-f]{40}$/;
const resultContracts = {
  'repeat-view-startup-10k.json': { scenario: 'startup', entryName: 'startup-10k', metrics: ['perf', 'used JS heap'] },
  'repeat-ce-startup-10k.json': { scenario: 'startup CE', entryName: 'startup-10k', metrics: ['perf', 'used JS heap'] },
  'repeat-view-rerender-10k.json': { scenario: 'rerender', entryName: 'rerender-10k', metrics: ['perf', 'used JS heap'] },
  'repeat-ce-rerender-10k.json': { scenario: 'rerender CE', entryName: 'rerender-10k', metrics: ['perf', 'used JS heap'] },
  'repeat-view-startup-100-big-template.json': { scenario: 'big-template startup 100', entryName: 'startup-100-big-template', metrics: ['perf'] },
  'repeat-view-update-1k.json': { scenario: 'update 1k', entryName: 'update-1k', metrics: ['perf', 'used JS heap'] },
  'app-repeat-view-keyed-expr.json': { scenario: 'keyed expr', entryName: 'keyed-expr', metrics: ['perf', 'used JS heap'] },
  'app-repeat-view-keyed-string.json': { scenario: 'keyed string', entryName: 'keyed-string', metrics: ['perf', 'used JS heap'] },
};
const smokeFiles = [
  'repeat-view-startup-10k.json',
  'repeat-view-rerender-10k.json',
  'repeat-view-startup-100-big-template.json',
];
const fullFiles = [
  'repeat-view-startup-10k.json',
  'repeat-ce-startup-10k.json',
  'repeat-view-rerender-10k.json',
  'repeat-ce-rerender-10k.json',
  'repeat-view-startup-100-big-template.json',
  'repeat-view-update-1k.json',
  'app-repeat-view-keyed-expr.json',
  'app-repeat-view-keyed-string.json',
];

export function expectedResultFiles(profile) {
  if (profile === 'smoke') return [...smokeFiles];
  if (profile === 'full' || profile === 'master') return [...fullFiles];
  throw new Error(`Unsupported benchmark report profile "${profile}".`);
}

export function validateBenchmarkReport(report, expected) {
  if (report?.schemaVersion !== 1) throw new Error('Unsupported benchmark report schema.');
  if (
    report.comparison?.profile !== expected.profile
    || report.comparison?.pullRequest !== expected.pullRequest
    || report.comparison?.base !== expected.base
    || report.comparison?.head !== expected.head
    || report.comparison?.candidate !== expected.candidate
    || report.comparison?.mergeParentsVerified !== true
  ) {
    throw new Error('Benchmark report comparison does not match the requested PR revisions.');
  }
  if (report.harness?.dirty !== false || report.harness?.commit !== expected.candidate) {
    throw new Error('Benchmark report harness does not match the requested candidate.');
  }
  requireSha(report.harness?.tree, 'report harness tree');
  requireHash(report.harness?.sha256, 'report harness');
  if (
    report.statistics?.producer !== 'tachometer'
    || report.statistics?.producerVersion !== '0.7.1'
    || report.statistics?.confidenceLevel !== 0.95
    || report.statistics?.differenceDirection !== 'candidate-minus-base'
    || report.statistics?.samplingOrder !== 'round-robin'
  ) {
    throw new Error('Benchmark report statistics contract is invalid.');
  }
  const tools = report.environment?.bundleToolchain;
  if (
    report.environment?.platform !== 'linux'
    || report.environment?.architecture !== 'x64'
    || !/^v\d+\.\d+\.\d+$/.test(tools?.node)
    || !/^\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?$/.test(tools?.npm)
    || !/^\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?$/.test(tools?.rollup)
    || !/^\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?$/.test(tools?.terserPlugin)
  ) {
    throw new Error('Benchmark report toolchain metadata is invalid.');
  }

  const expectedMeasurements = expectedResultFiles(expected.profile).flatMap(file => {
    const contract = resultContracts[file];
    return contract.metrics.map(metric => ({
      id: `${slug(contract.scenario)}/${metric === 'perf' ? 'duration' : 'immediate-used-js-heap'}/chrome-headless`,
      source: file,
      scenario: contract.scenario,
      metric,
      entryName: contract.entryName,
    }));
  });
  if (!Array.isArray(report.measurements) || report.measurements.length !== expectedMeasurements.length) {
    throw new Error('Benchmark report has an unexpected measurement count.');
  }
  for (let index = 0; index < expectedMeasurements.length; index++) {
    validateReportMeasurement(report.measurements[index], expectedMeasurements[index]);
  }

  const fixtureOrder = [
    'app-repeat-view',
    'app-repeat-ce',
    'app-repeat-view-big-template',
    'app-repeat-view-keyed-string',
    'app-repeat-view-keyed-expr',
  ];
  if (!Array.isArray(report.bundles) || report.bundles.length !== fixtureOrder.length) {
    throw new Error('Benchmark report has an unexpected bundle count.');
  }
  for (let index = 0; index < fixtureOrder.length; index++) {
    validateReportBundle(report.bundles[index], fixtureOrder[index]);
  }
  if (
    !Array.isArray(report.environment?.browsers)
    || report.environment.browsers.length < 1
    || report.environment.browsers.length > 4
    || report.environment.browsers.some(browser =>
      browser?.name !== 'chrome'
      || browser?.headless !== true
      || typeof browser?.userAgent !== 'string'
      || browser.userAgent.length > 512
      || hasControlCharacters(browser.userAgent)
      || !/HeadlessChrome\/(\d+(?:\.\d+){1,3})(?:\s|$)/.test(browser.userAgent)
    )
  ) {
    throw new Error('Benchmark report browser metadata is invalid.');
  }
  if (
    report.inputs?.provenance?.file !== 'variants/provenance.json'
    || !/^[0-9a-f]{64}$/.test(report.inputs?.provenance?.sha256)
    || !Array.isArray(report.inputs?.tachometerResults)
    || report.inputs?.tachometerResults?.map(input => input.file).join(',')
      !== expectedResultFiles(expected.profile).join(',')
    || report.inputs.tachometerResults.some(input => !/^[0-9a-f]{64}$/.test(input.sha256))
  ) {
    throw new Error('Benchmark report input manifest is invalid.');
  }
  return report;
}

export function createBenchmarkReport({
  provenance,
  resultDocuments,
  generatedAt,
  tachometerVersion,
  provenanceInput,
  ci = null,
}) {
  validateProvenance(provenance);
  const profile = provenance.comparison.profile;
  const expectedFiles = expectedResultFiles(profile);
  const byFile = new Map();
  for (const input of resultDocuments) {
    if (byFile.has(input.file)) {
      throw new Error(`Benchmark result "${input.file}" was provided more than once.`);
    }
    requireHash(input.sha256, `${input.file} input`);
    byFile.set(input.file, input);
  }
  const actualFiles = [...byFile.keys()].sort((left, right) => left.localeCompare(right));
  const sortedExpected = [...expectedFiles].sort((left, right) => left.localeCompare(right));
  if (JSON.stringify(actualFiles) !== JSON.stringify(sortedExpected)) {
    throw new Error(
      `Benchmark result set for ${profile} is incomplete. Expected ${sortedExpected.join(', ')}; `
      + `received ${actualFiles.join(', ') || '<none>'}.`
    );
  }

  const measurements = [];
  const measurementIds = new Set();
  const browsers = new Map();
  for (const file of expectedFiles) {
    const input = byFile.get(file);
    // Tachometer difference indexes restart in every JSON document. Normalize each document before
    // combining report rows so a later file cannot accidentally address an earlier file's baseline.
    const comparisons = makeComparisons(adaptTachometerJson(input.document, file));
    validateResultContract(file, comparisons);
    for (const comparison of comparisons) {
      const metric = toMetric(comparison.measurement, comparison.kind);
      const browser = comparison.candidate.result.browser;
      if (browser?.name !== 'chrome' || browser.headless !== true) {
        throw new Error(`Benchmark "${comparison.scenario}" must use headless Chrome.`);
      }
      const browserId = `${browser?.name ?? 'unknown'}-${browser?.headless === true ? 'headless' : 'headed'}`;
      const id = `${slug(comparison.scenario)}/${metric.id}/${browserId}`;
      if (measurementIds.has(id)) {
        throw new Error(`Duplicate benchmark measurement id "${id}".`);
      }
      measurementIds.add(id);
      browsers.set(JSON.stringify(browser), browser);
      measurements.push({
        id,
        source: file,
        scenario: comparison.scenario,
        metric,
        browser: {
          name: browser?.name ?? 'unknown',
          headless: browser?.headless === true,
        },
        base: sideRecord(comparison.base),
        candidate: sideRecord(comparison.candidate),
        difference: {
          absoluteConfidenceInterval95: comparison.difference.absolute,
          percentConfidenceInterval95: multiplyInterval(comparison.difference.relative, 100),
          assessment: classifyDifference(comparison.difference, comparison.kind),
        },
      });
    }
  }

  const bundles = provenance.comparisons.map(comparison => {
    const baseBytes = requireFiniteNonNegative(comparison.base?.bytes, `${comparison.fixture} base bundle bytes`);
    const candidateBytes = requireFiniteNonNegative(
      comparison.candidate?.bytes,
      `${comparison.fixture} candidate bundle bytes`,
    );
    return {
      fixture: comparison.fixture,
      format: 'minified-esm',
      base: { bytes: baseBytes, sha256: requireHash(comparison.base?.sha256, 'base bundle') },
      candidate: {
        bytes: candidateBytes,
        sha256: requireHash(comparison.candidate?.sha256, 'candidate bundle'),
      },
      difference: {
        bytes: candidateBytes - baseBytes,
        percent: baseBytes === 0 ? null : (candidateBytes - baseBytes) / baseBytes * 100,
      },
      identical: comparison.identical === true,
    };
  });

  const normalizedComparison = {
    ...provenance.comparison,
    pullRequest: provenance.comparison.pullRequest === null ? null : Number(provenance.comparison.pullRequest),
  };
  requireHash(provenanceInput?.sha256, 'provenance input');
  return {
    schemaVersion: 1,
    generatedAt,
    comparison: normalizedComparison,
    harness: {
      commit: provenance.harness.commit,
      tree: provenance.harness.tree,
      sha256: provenance.harness.sha256,
      dirty: provenance.harness.dirty,
      fixtures: provenance.harness.fixtures,
    },
    statistics: {
      producer: 'tachometer',
      producerVersion: tachometerVersion,
      confidenceLevel: 0.95,
      differenceDirection: 'candidate-minus-base',
      samplingOrder: 'round-robin',
    },
    environment: {
      ...provenance.environment,
      browsers: [...browsers.values()],
    },
    ci,
    measurements,
    bundles,
    inputs: {
      provenance: provenanceInput,
      tachometerResults: expectedFiles.map(file => ({ file, sha256: byFile.get(file).sha256 })),
    },
    notices: measurements.some(measurement => measurement.metric.kind === 'immediate-js-heap')
      ? [{
          code: 'immediate-used-js-heap',
          text: 'Used JS heap is sampled immediately after the scenario. It is not a forced-GC retained-memory measurement.',
        }]
      : [],
  };
}

export function formatBenchmarkReportMarkdown(report, links = {}) {
  const baseLink = links.baseCommit ?? commitLink(report.comparison.base);
  const candidateLink = links.candidateCommit ?? commitLink(report.comparison.candidate);
  const comparison = `[\`${shortSha(report.comparison.base)}\`](${baseLink}) → `
    + `[\`${shortSha(report.comparison.candidate)}\`](${candidateLink})`;
  const pullRequest = report.comparison.pullRequest == null
    ? ''
    : ` for [#${report.comparison.pullRequest}](${links.pullRequest ?? pullRequestLink(report.comparison.pullRequest)})`;
  const lines = [
    '## Benchmark comparison',
    '',
    `${comparison}${pullRequest}`,
    '',
    `Profile: \`${report.comparison.profile}\` · Harness: \`${shortSha(report.harness.commit)}\``,
    `Environment: Node \`${report.environment.bundleToolchain?.node ?? 'unknown'}\` · `
      + `${formatBrowsers(report.environment.browsers)} · Tachometer \`${report.statistics.producerVersion}\``,
    '',
    '### Runtime measurements',
    '',
    '| Scenario | Metric | Base (95% CI) | Candidate (95% CI) | Candidate − base (95% CI) | Samples | Reading |',
    '| --- | --- | ---: | ---: | ---: | ---: | --- |',
  ];
  for (const measurement of report.measurements) {
    const relative = divideInterval(measurement.difference.percentConfidenceInterval95, 100);
    const summaryKind = measurement.metric.kind === 'duration'
      ? 'duration'
      : measurement.metric.kind === 'immediate-js-heap' ? 'heap-bytes' : 'number';
    lines.push(
      `| ${title(measurement.scenario)} | ${measurement.metric.label} | `
      + `${formatMetricInterval(measurement.base.meanConfidenceInterval95, summaryKind)} | `
      + `${formatMetricInterval(measurement.candidate.meanConfidenceInterval95, summaryKind)} | `
      + `${formatMetricDelta(measurement.difference.absoluteConfidenceInterval95, summaryKind)} `
      + `(${formatPercentDelta(relative)}) | ${measurement.base.samples} / ${measurement.candidate.samples} | `
      + `${measurement.difference.assessment} |`,
    );
  }

  lines.push(
    '',
    '### Minified ESM bundles',
    '',
    '| Fixture | Base | Candidate | Difference |',
    '| --- | ---: | ---: | ---: |',
  );
  for (const bundle of report.bundles) {
    lines.push(
      `| \`${escapeCode(bundle.fixture)}\` | ${formatKiB(bundle.base.bytes)} | ${formatKiB(bundle.candidate.bytes)} | `
      + `${formatSignedKiB(bundle.difference.bytes)} (${formatSignedPercentPoints(bundle.difference.percent)}) |`,
    );
  }

  lines.push(
    '',
    'Intervals are Tachometer 95% confidence intervals from interleaved base and candidate samples. '
      + '“No clear change” means the difference interval includes zero. These results are informational; '
      + 'no merge threshold is applied.',
  );
  if (report.notices.some(notice => notice.code === 'immediate-used-js-heap')) {
    lines.push(
      '',
      'Used JS heap is a point-in-time Chrome reading taken after each scenario. Retained-memory analysis '
        + 'requires a separate forced-GC measurement.',
    );
  }
  const footerLinks = [];
  if (links.circleWorkflow !== undefined) footerLinks.push(`[CircleCI workflow](${links.circleWorkflow})`);
  if (links.artifacts !== undefined) footerLinks.push(`[Artifacts](${links.artifacts})`);
  if (footerLinks.length > 0) lines.push('', footerLinks.join(' · '));
  return `${lines.join('\n')}\n`;
}

function validateProvenance(provenance) {
  if (provenance?.schemaVersion !== 1) throw new Error('Unsupported benchmark provenance schema.');
  const { comparison, harness, base, candidate } = provenance;
  for (const [label, sha] of [
    ['base', comparison?.base],
    ['candidate', comparison?.candidate],
    ['harness', harness?.commit],
  ]) requireSha(sha, label);
  requireSha(harness?.tree, 'harness tree');
  requireHash(harness?.sha256, 'harness');
  if (harness.dirty !== false) throw new Error('Benchmark harness must be clean in an authoritative report.');
  if (harness.commit !== comparison.candidate || base?.commit !== comparison.base || candidate?.commit !== comparison.candidate) {
    throw new Error('Benchmark provenance revisions do not agree.');
  }
  if (!Array.isArray(provenance.comparisons) || provenance.comparisons.length === 0) {
    throw new Error('Benchmark provenance does not contain bundle comparisons.');
  }
  if (comparison.profile === 'smoke' || comparison.profile === 'full') {
    requireSha(comparison.head, 'head');
    if (!/^[1-9]\d*$/.test(String(comparison.pullRequest)) || comparison.mergeParentsVerified !== true) {
      throw new Error('PR benchmark provenance does not contain a verified merge comparison.');
    }
  } else if (comparison.profile === 'master') {
    if (comparison.pullRequest !== null || comparison.head !== null || comparison.mergeParentsVerified !== false) {
      throw new Error('Master benchmark provenance has PR comparison fields.');
    }
  } else {
    throw new Error(`Unsupported benchmark provenance profile "${comparison.profile}".`);
  }
}

function validateResultContract(file, comparisons) {
  const contract = resultContracts[file];
  if (contract === undefined) throw new Error(`No benchmark result contract exists for "${file}".`);
  if (comparisons.some(comparison => comparison.scenario !== contract.scenario)) {
    throw new Error(`Benchmark result "${file}" contains an unexpected scenario.`);
  }
  const metrics = comparisons.map(comparison => measurementLabel(comparison.measurement));
  if (JSON.stringify(metrics) !== JSON.stringify(contract.metrics)) {
    throw new Error(`Benchmark result "${file}" contains metrics ${metrics.join(', ')}.`);
  }
}

function validateReportMeasurement(measurement, expected) {
  if (
    measurement?.id !== expected.id
    || measurement.source !== expected.source
    || measurement.scenario !== expected.scenario
    || measurement.browser?.name !== 'chrome'
    || measurement.browser?.headless !== true
  ) {
    throw new Error(`Benchmark report measurement ${expected.id} has invalid identity metadata.`);
  }
  const isDuration = expected.metric === 'perf';
  if (isDuration) {
    if (
      measurement.metric?.id !== 'duration'
      || measurement.metric.label !== 'Duration'
      || measurement.metric.kind !== 'duration'
      || measurement.metric.unit !== 'millisecond'
      || measurement.metric.measurement?.name !== 'perf'
      || measurement.metric.measurement?.mode !== 'performance'
      || measurement.metric.measurement?.entryName !== expected.entryName
    ) {
      throw new Error(`Benchmark report measurement ${expected.id} has invalid duration metadata.`);
    }
  } else if (
    measurement.metric?.id !== 'immediate-used-js-heap'
    || measurement.metric.label !== 'Immediate used JS heap'
    || measurement.metric.kind !== 'immediate-js-heap'
    || measurement.metric.unit !== 'byte'
    || measurement.metric.measurement?.name !== 'used JS heap'
    || measurement.metric.measurement?.mode !== 'expression'
    || measurement.metric.measurement?.expression !== 'window.usedJSHeapSizeBytes'
  ) {
    throw new Error(`Benchmark report measurement ${expected.id} has invalid heap metadata.`);
  }

  validateNumericInterval(measurement.base?.meanConfidenceInterval95, `${expected.id} base`, true);
  validateNumericInterval(measurement.candidate?.meanConfidenceInterval95, `${expected.id} candidate`, true);
  if (
    !Number.isSafeInteger(measurement.base?.samples)
    || measurement.base.samples < 2
    || measurement.base.samples > 10_000
    || !Number.isSafeInteger(measurement.candidate?.samples)
    || measurement.candidate.samples < 2
    || measurement.candidate.samples > 10_000
  ) {
    throw new Error(`Benchmark report measurement ${expected.id} has invalid sample counts.`);
  }
  const absolute = validateNumericInterval(
    measurement.difference?.absoluteConfidenceInterval95,
    `${expected.id} absolute difference`,
    false,
  );
  const percent = validateNumericInterval(
    measurement.difference?.percentConfidenceInterval95,
    `${expected.id} percent difference`,
    false,
  );
  const kind = isDuration ? 'duration' : 'heap-bytes';
  const assessment = classifyDifference({ absolute, relative: divideInterval(percent, 100) }, kind);
  if (measurement.difference?.assessment !== assessment) {
    throw new Error(`Benchmark report measurement ${expected.id} has an invalid assessment.`);
  }
}

function validateReportBundle(bundle, fixture) {
  if (bundle?.fixture !== fixture || bundle.format !== 'minified-esm') {
    throw new Error(`Benchmark report bundle ${fixture} has invalid identity metadata.`);
  }
  const baseBytes = requireFiniteNonNegative(bundle.base?.bytes, `${fixture} report base bytes`);
  const candidateBytes = requireFiniteNonNegative(bundle.candidate?.bytes, `${fixture} report candidate bytes`);
  if (baseBytes > 50_000_000 || candidateBytes > 50_000_000) {
    throw new Error(`Benchmark report bundle ${fixture} is outside the expected size range.`);
  }
  const baseHash = requireHash(bundle.base?.sha256, `${fixture} report base`);
  const candidateHash = requireHash(bundle.candidate?.sha256, `${fixture} report candidate`);
  const expectedBytes = candidateBytes - baseBytes;
  const expectedPercent = baseBytes === 0 ? null : expectedBytes / baseBytes * 100;
  if (
    bundle.difference?.bytes !== expectedBytes
    || bundle.difference?.percent !== expectedPercent
    || bundle.identical !== (baseHash === candidateHash)
  ) {
    throw new Error(`Benchmark report bundle ${fixture} has an invalid difference.`);
  }
}

function validateNumericInterval(interval, label, nonNegative) {
  if (
    interval === null
    || typeof interval !== 'object'
    || !Number.isFinite(interval.low)
    || !Number.isFinite(interval.high)
    || interval.low > interval.high
    || Math.abs(interval.low) > 1e12
    || Math.abs(interval.high) > 1e12
    || (nonNegative && interval.low < 0)
  ) {
    throw new Error(`Benchmark report ${label} interval is invalid.`);
  }
  return { low: interval.low, high: interval.high };
}

function toMetric(measurement, kind) {
  if (kind === 'duration') {
    return { id: 'duration', label: 'Duration', kind: 'duration', unit: 'millisecond', measurement };
  }
  if (kind === 'heap-bytes') {
    return {
      id: 'immediate-used-js-heap',
      label: 'Immediate used JS heap',
      kind: 'immediate-js-heap',
      unit: 'byte',
      measurement,
    };
  }
  return { id: slug(measurementLabel(measurement)), label: title(measurementLabel(measurement)), kind, unit: null, measurement };
}

function sideRecord(entry) {
  const samples = entry.result.millis?.length;
  if (!Number.isSafeInteger(samples) || samples <= 0) throw new Error('Benchmark result has no samples.');
  return { meanConfidenceInterval95: entry.stats.meanCI, samples };
}

const multiplyInterval = (interval, multiplier) => ({ low: interval.low * multiplier, high: interval.high * multiplier });
const divideInterval = (interval, divisor) => ({ low: interval.low / divisor, high: interval.high / divisor });
const slug = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const title = value => value === '' ? value : `${value[0].toUpperCase()}${value.slice(1)}`;
const shortSha = sha => sha.slice(0, 7);
const commitLink = sha => `https://github.com/aurelia/aurelia/commit/${sha}`;
const pullRequestLink = number => `https://github.com/aurelia/aurelia/pull/${number}`;
const formatKiB = bytes => `${(bytes / 1024).toFixed(2)} KiB`;
const formatSignedKiB = bytes => `${bytes > 0 ? '+' : ''}${(bytes / 1024).toFixed(2)} KiB`;
const formatSignedPercentPoints = value => value === null
  ? 'n/a'
  : `${value > 0 ? '+' : ''}${normalizeZero(value).toFixed(2)}%`;
const normalizeZero = value => Math.abs(value) < 0.005 ? 0 : value;
const hasControlCharacters = value => [...value].some(character => {
  const code = character.charCodeAt(0);
  return code < 32 || code === 127;
});
const escapeCode = value => String(value).replace(/`/g, '\\`');
const formatBrowsers = browsers => [...new Set(browsers.map(browser => {
  const version = /HeadlessChrome\/(\d+(?:\.\d+){1,3})(?:\s|$)/.exec(browser.userAgent ?? '')?.[1];
  return `\`${browser.name}${version === undefined ? '' : ` ${version}`}\``;
}))].join(', ');

function requireSha(value, label) {
  if (!shaPattern.test(value)) throw new Error(`Benchmark ${label} revision is not a full SHA.`);
  return value;
}

function requireHash(value, label) {
  if (!/^[0-9a-f]{64}$/.test(value)) throw new Error(`Benchmark ${label} hash is invalid.`);
  return value;
}

function requireFiniteNonNegative(value, label) {
  if (!Number.isFinite(value) || value < 0) throw new Error(`Benchmark ${label} is invalid.`);
  return value;
}
