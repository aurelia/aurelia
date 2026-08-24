/* eslint-disable */
import sourceMapSupport from 'source-map-support';
sourceMapSupport.install();

import fs from 'fs';
import path from 'path';
import { parseFlags } from 'tachometer/lib/flags.js';
import { makeConfig } from 'tachometer/lib/config.js';
import { Server } from 'tachometer/lib/server.js';
import {
  installGitDependency,
  makeServerPlans,
  prepareVersionDirectory,
} from 'tachometer/lib/versions.js';
import { manualMode } from 'tachometer/lib/manual.js';
import { Runner } from 'tachometer/lib/runner.js';

const npmCache = path.resolve('.tmp/npm-cache');
process.env.npm_config_cache = npmCache;
process.env.NPM_CONFIG_CACHE = npmCache;
fs.mkdirSync(npmCache, { recursive: true });

async function main(argv) {
  const opts = parseFlags(argv);
  const config = await makeConfig(opts);

  if (config.legacyJsonFile) {
    console.log('Please use --json-file instead of --save. --save will be removed in the next major version.');
  }

  const { plans, gitInstalls } = await makeServerPlans(
    config.root,
    opts['npm-install-dir'],
    config.benchmarks,
  );

  await Promise.all(
    gitInstalls.map((gitInstall) => installGitDependency(gitInstall, config.forceCleanNpmInstall)),
  );

  const servers = new Map();
  const promises = [];

  for (const { npmInstalls, mountPoints, specs } of plans) {
    promises.push(
      ...npmInstalls.map((install) => prepareVersionDirectory(
        install,
        config.forceCleanNpmInstall,
        config.npmrc,
      )),
    );

    promises.push((async () => {
      const server = await Server.start({
        host: opts.host,
        ports: opts.port,
        root: config.root,
        npmInstalls,
        mountPoints,
        resolveBareModules: config.resolveBareModules,
        cache: config.mode !== 'manual',
      });

      for (const spec of specs) {
        servers.set(spec, server);
      }
    })());
  }

  await Promise.all(promises);

  if (config.mode === 'manual') {
    await manualMode(config, servers);
    return;
  }

  const runner = new Runner(config, servers);
  try {
    const results = await runner.run();
    printCompactSummary(results);
    return results;
  } finally {
    const allServers = new Set([...servers.values()]);
    await Promise.all([...allServers].map((server) => server.close()));
  }
}

main(process.argv.slice(2)).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

function printCompactSummary(results) {
  if (!Array.isArray(results) || results.length < 2) {
    return;
  }

  const groups = groupResultsByMeasurement(results);
  if (groups.length === 0) {
    return;
  }

  console.log('\nCompact summary');
  console.log();

  for (const [, group] of groups) {
    const measurement = group[0].result.measurement;
    const names = group.map((entry) => stripMeasurementSuffix(entry.result.name));
    const shortLabels = shortenLabels(names);
    const summaryLabel = formatSummaryLabel(names, measurement);

    for (let i = 1; i < group.length; i++) {
      const diff = group[i].differences?.[0];
      if (diff == null) {
        continue;
      }

      console.log(
        `${summaryLabel}: ${shortLabels[i]} ${formatInlineInterval(group[i].stats.meanCI, measurement)} vs ${shortLabels[0]} ${formatInlineInterval(group[0].stats.meanCI, measurement)}`
      );
      console.log(
        `${shortLabels[i]} delta: ${formatDeltaInterval(diff.absolute, measurement)} (${formatPercentDeltaInterval(diff.relative)}) -> ${classifyDifference(diff, measurement)}`
      );
      console.log();
    }
  }
}

function groupResultsByMeasurement(results) {
  const groups = new Map();

  for (const entry of results) {
    const measurement = entry.result?.measurement ?? {};
    const key = measurement.name ?? JSON.stringify(measurement);
    const group = groups.get(key);
    if (group === undefined) {
      groups.set(key, [entry]);
    } else {
      group.push(entry);
    }
  }

  return [...groups.entries()];
}

function stripMeasurementSuffix(name) {
  return name.replace(/\s+\[[^\]]+\]$/, '');
}

function shortenLabels(labels) {
  const parts = labels.map((label) => label.split(/\s+/).filter(Boolean));
  if (parts.length === 0) {
    return labels;
  }

  let prefixLength = 0;
  while (true) {
    const word = parts[0][prefixLength];
    if (word === undefined) {
      break;
    }
    if (parts.every((tokens) => tokens[prefixLength] === word)) {
      prefixLength++;
      continue;
    }
    break;
  }

  return labels.map((label, index) => {
    const shortened = parts[index].slice(prefixLength).join(' ').trim();
    return shortened === '' ? label : shortened;
  });
}

function formatMeasurementLabel(measurement) {
  return measurement?.name ?? 'measurement';
}

function formatSummaryLabel(names, measurement) {
  const prefix = getCommonWordPrefix(names);
  const measurementLabel = formatMeasurementLabel(measurement);
  if (prefix === '') {
    return capitalize(measurementLabel);
  }
  return `${capitalize(prefix)} ${measurementLabel}`;
}

function formatInterval(interval, measurement) {
  return `${formatValue(interval.low, measurement)} - ${formatValue(interval.high, measurement)}`;
}

function formatInlineInterval(interval, measurement) {
  return `\`${formatValue(interval.low, measurement)}\` - \`${formatValue(interval.high, measurement)}\``;
}

function formatSignedInterval(interval, measurement) {
  return `${formatSignedValue(interval.low, measurement)} - ${formatSignedValue(interval.high, measurement)}`;
}

function formatPercentInterval(interval) {
  return `${formatSignedPercent(interval.low)} - ${formatSignedPercent(interval.high)}`;
}

function formatDeltaInterval(interval, measurement) {
  return `${formatSignedInlineValue(interval.low, measurement)} to ${formatSignedInlineValue(interval.high, measurement)}`;
}

function formatPercentDeltaInterval(interval) {
  return `${formatSignedPercent(interval.low)} to ${formatSignedPercent(interval.high)}`;
}

function formatValue(value, measurement) {
  if (isMemoryMeasurement(measurement)) {
    return `${(value / (1024 * 1024)).toFixed(2)} MiB`;
  }
  if (measurement?.mode === 'performance') {
    return `${value.toFixed(2)}ms`;
  }
  return value.toFixed(2);
}

function formatSignedValue(value, measurement) {
  const formatted = formatValue(Math.abs(value), measurement);
  if (value > 0) {
    return `+${formatted}`;
  }
  if (value < 0) {
    return `-${formatted}`;
  }
  return formatted;
}

function formatSignedInlineValue(value, measurement) {
  return `\`${formatSignedValue(value, measurement)}\``;
}

function formatSignedPercent(value) {
  const formatted = `${Math.abs(value * 100).toFixed(0)}%`;
  if (value > 0) {
    return `+${formatted}`;
  }
  if (value < 0) {
    return `-${formatted}`;
  }
  return formatted;
}

function isMemoryMeasurement(measurement) {
  return measurement?.name === 'memory'
    || /memory|heap|size/i.test(measurement?.expression ?? '');
}

function classifyDifference(diff, measurement) {
  if (diff.absolute.low > 0 && diff.relative.low > 0) {
    return isMemoryMeasurement(measurement) ? 'higher' : 'slower';
  }
  if (diff.absolute.high < 0 && diff.relative.high < 0) {
    return isMemoryMeasurement(measurement) ? 'lower' : 'faster';
  }
  return 'flat';
}

function getCommonWordPrefix(labels) {
  const parts = labels.map((label) => label.split(/\s+/).filter(Boolean));
  if (parts.length === 0) {
    return '';
  }

  const shared = [];
  for (let i = 0; ; i++) {
    const word = parts[0][i];
    if (word === undefined || !parts.every((tokens) => tokens[i] === word)) {
      break;
    }
    shared.push(word);
  }

  return shared.join(' ');
}

function capitalize(value) {
  return value === '' ? value : `${value[0].toUpperCase()}${value.slice(1)}`;
}
