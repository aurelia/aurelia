import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { parse } from 'yaml';
import { expectedResultFiles } from './benchmark-report.mjs';

const read = file => readFileSync(new URL(file, import.meta.url), 'utf8');
const { scripts } = JSON.parse(read('package.json'));
const circle = parse(read('../.circleci/config.yml'), { merge: true });

void describe('benchmark CI contract', () => {
  for (const [workflowName, profile] of [['pr_bench', 'smoke'], ['benchmarks', 'full'], ['build_test', 'master']]) {
    void it(`keeps ${workflowName} jobs, scripts and the ${profile} report in agreement`, () => {
      const jobs = circle.workflows[workflowName].jobs;
      const runs = jobs.flatMap(job => job.tacho_benchmark ?? []);
      const report = jobs.find(job => job.benchmark_report).benchmark_report;
      const preparation = jobs.find(job => job.tacho_benchmark_prep).tacho_benchmark_prep;
      assert.equal(report.profile, profile);
      assert.deepEqual(runs.map(run => run.result).sort(), expectedResultFiles(profile).sort());
      assert.deepEqual([...report.requires].sort(), runs.map(run => run.name).sort());

      for (const run of runs) {
        assert.deepEqual(run.requires, [preparation.name ?? 'tacho_benchmark_prep']);
        const command = /^npm run (bench:[\w-]+)$/.exec(run.command);
        assert.ok(command, `Unexpected benchmark command: ${run.command}`);
        const script = /^node run-tachometer\.mjs --config (\S+) --json-file results\/(\S+)$/.exec(scripts[command[1]]);
        assert.ok(script, `Unexpected benchmark script: ${command[1]}`);
        assert.equal(script[2], run.result);

        const config = JSON.parse(read(script[1]));
        assert.equal(config.root, '..');
        for (const benchmark of config.benchmarks) {
          assert.equal(benchmark.browser.name, 'chrome');
          assert.equal(benchmark.browser.headless, true);
          assert.equal(benchmark.expand.length, 2);
          for (const [index, variant] of ['base', 'candidate'].entries()) {
            const expansion = benchmark.expand[index];
            assert.ok(expansion.name.endsWith(` ${variant}`));
            const page = new URL(expansion.url, new URL(script[1], import.meta.url));
            assert.equal(page.searchParams.get('variant'), variant);
            page.search = '';
            assert.match(readFileSync(page, 'utf8'), /loadVariant\(/);
          }
        }
      }
    });
  }
});
