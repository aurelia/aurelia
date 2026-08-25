import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createBenchmarkReport,
  expectedResultFiles,
  formatBenchmarkReportMarkdown,
} from './benchmark-report.mjs';
import { hashFile, readJson } from './variant-utils.mjs';

const benchmarksRoot = path.dirname(fileURLToPath(import.meta.url));
const options = parseArguments(process.argv.slice(2));
const resultsRoot = path.resolve(benchmarksRoot, options.results);
const outputRoot = path.resolve(benchmarksRoot, options.output);
const provenancePath = path.join(resultsRoot, 'variants', 'provenance.json');
const provenance = await readJson(provenancePath);
if (
  process.env.BENCHMARK_REPORT_PROFILE !== undefined
  && process.env.BENCHMARK_REPORT_PROFILE !== provenance.comparison?.profile
) {
  throw new Error(
    `Benchmark report expected profile ${process.env.BENCHMARK_REPORT_PROFILE}, `
    + `received ${provenance.comparison?.profile}.`
  );
}
const expectedFiles = expectedResultFiles(provenance.comparison?.profile);
const actualFiles = (await readdir(resultsRoot, { withFileTypes: true }))
  .filter(entry => entry.isFile() && entry.name.endsWith('.json'))
  .map(entry => entry.name)
  .sort((left, right) => left.localeCompare(right));
const sortedExpected = [...expectedFiles].sort((left, right) => left.localeCompare(right));
if (JSON.stringify(actualFiles) !== JSON.stringify(sortedExpected)) {
  throw new Error(
    `Unexpected timing artifacts. Expected ${sortedExpected.join(', ')}; `
    + `received ${actualFiles.join(', ') || '<none>'}.`
  );
}

const resultDocuments = await Promise.all(expectedFiles.map(async file => {
  const absolute = path.join(resultsRoot, file);
  return {
    file,
    document: JSON.parse(await readFile(absolute, 'utf8')),
    sha256: await hashFile(absolute),
  };
}));
const packageManifest = await readJson(path.join(benchmarksRoot, 'package.json'));
const report = createBenchmarkReport({
  provenance,
  resultDocuments,
  generatedAt: new Date().toISOString(),
  tachometerVersion: packageManifest.dependencies.tachometer,
  provenanceInput: {
    file: 'variants/provenance.json',
    sha256: await hashFile(provenancePath),
  },
  ci: process.env.CIRCLECI === 'true'
    ? {
        provider: 'circleci',
        workflowId: process.env.CIRCLE_WORKFLOW_ID,
        job: process.env.CIRCLE_JOB,
        buildUrl: process.env.CIRCLE_BUILD_URL,
      }
    : null,
});

await mkdir(outputRoot, { recursive: true });
await writeFile(path.join(outputRoot, 'benchmark-summary.json'), `${JSON.stringify(report, null, 2)}\n`);
await writeFile(path.join(outputRoot, 'benchmark-summary.md'), formatBenchmarkReportMarkdown(report));

console.log(`Benchmark report: ${path.join(outputRoot, 'benchmark-summary.json')}`);

function parseArguments(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index++) {
    const argument = argv[index];
    switch (argument) {
      case '--results': parsed.results = requireValue(argv, ++index, argument); break;
      case '--output': parsed.output = requireValue(argv, ++index, argument); break;
      default: throw new Error(`Unknown argument "${argument}".`);
    }
  }
  if (parsed.results === undefined || parsed.output === undefined) {
    throw new Error('Usage: node write-benchmark-report.mjs --results <directory> --output <directory>');
  }
  return parsed;
}

function requireValue(argv, index, flag) {
  const value = argv[index];
  if (value === undefined || value.startsWith('--')) throw new Error(`Missing value for ${flag}.`);
  return value;
}
