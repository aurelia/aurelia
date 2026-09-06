import { createHash } from 'node:crypto';
import path from 'node:path';
import { readdir } from 'node:fs/promises';
import { hashFiles } from './variant-utils.mjs';

export function fingerprintLiveBundle(contents) {
  return createHash('sha256').update(contents).digest('hex');
}

export function parseLiveDebounce(value) {
  if (value === undefined) return 15000;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 250) {
    throw new Error('AURELIA_LIVE_BENCH_DEBOUNCE must be an integer of at least 250 milliseconds.');
  }
  return parsed;
}

export function createLiveBenchmarkConfig(source, sourceConfigPath, liveConfigPath, sampleSize) {
  const sourceDirectory = path.dirname(sourceConfigPath);
  const liveDirectory = path.dirname(liveConfigPath);
  const sourceRoot = path.resolve(sourceDirectory, source.root ?? '.');
  const rewriteUrl = entry => entry.url === undefined ? entry : {
    ...entry,
    url: makeLiveUrl(entry.url, sourceDirectory, liveDirectory),
  };
  const benchmarks = source.benchmarks.map(benchmark => ({
    ...rewriteUrl(benchmark),
    ...(benchmark.expand === undefined
      ? {}
      : {
        expand: benchmark.expand.map(rewriteUrl),
      }),
  }));

  return {
    ...source,
    root: toPortableRelativePath(liveDirectory, sourceRoot),
    sampleSize: sampleSize ?? source.sampleSize ?? 20,
    benchmarks,
  };
}

export const isLiveFixtureInput = filename => /\.(?:html|[cm]?js|json|ts|css|svg)$/u.test(filename);

export async function fingerprintLiveFixture(benchmarkRoot, fixture) {
  const files = [];
  // Helpers imported directly by HTML never enter Rollup's module graph. Include
  // the shared helper directory in both invalidation and recorded workload identity.
  for (const directory of [fixture, 'utils']) {
    for (const entry of await readdir(path.join(benchmarkRoot, directory), { recursive: true, withFileTypes: true })) {
      if (entry.isFile() && isLiveFixtureInput(entry.name)) {
        files.push(path.relative(benchmarkRoot, path.join(entry.parentPath, entry.name)));
      }
    }
  }
  return hashFiles(benchmarkRoot, files);
}

export function makeLiveUrl(url, sourceDirectory, liveDirectory) {
  if (/^https?:\/\//u.test(url)) {
    throw new Error(`Live benchmarks require a local page, received "${url}".`);
  }
  const queryIndex = url.indexOf('?');
  const urlPath = queryIndex === -1 ? url : url.slice(0, queryIndex);
  const query = new URLSearchParams(queryIndex === -1 ? '' : url.slice(queryIndex + 1));
  query.set('live', 'true');
  const relativePath = toPortableRelativePath(liveDirectory, path.resolve(sourceDirectory, urlPath));
  return `${relativePath}?${query.toString()}`;
}

function toPortableRelativePath(from, to) {
  return path.relative(from, to).replace(/\\/gu, '/') || '.';
}
