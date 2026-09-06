import { createHash } from 'node:crypto';
import path from 'node:path';

export function fingerprintLiveBundle(contents) {
  return createHash('sha256').update(contents).digest('hex');
}

export function parseLiveDebounce(value) {
  if (value === undefined) return 8000;
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
  const benchmarks = source.benchmarks.map(benchmark => ({
    ...benchmark,
    ...(benchmark.url === undefined
      ? {}
      : { url: makeLiveUrl(benchmark.url, sourceDirectory, liveDirectory) }),
    ...(benchmark.expand === undefined
      ? {}
      : {
        expand: benchmark.expand.map(expansion => ({
          ...expansion,
          ...(expansion.url === undefined
            ? {}
            : { url: makeLiveUrl(expansion.url, sourceDirectory, liveDirectory) }),
        })),
      }),
  }));

  return {
    ...source,
    root: toPortableRelativePath(liveDirectory, sourceRoot),
    sampleSize: sampleSize ?? source.sampleSize ?? 20,
    benchmarks,
  };
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
