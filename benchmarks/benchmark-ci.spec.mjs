import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { parse } from 'yaml';
import { expectedResultFiles } from './benchmark-report.mjs';

const read = file => readFileSync(new URL(file, import.meta.url), 'utf8');
const { scripts } = JSON.parse(read('package.json'));
const circle = parse(read('../.circleci/config.yml'), { merge: true });

void describe('benchmark CI contract', () => {
  void it('runs explicit comparisons on master without also scheduling its normal suite', () => {
    assert.deepEqual(circle.parameters.benchmark_comparison.enum, ['', 'revisions']);
    for (const name of ['benchmark_harness_sha', 'benchmark_pr_base_sha']) {
      assert.deepEqual(circle.parameters[name], { type: 'string', default: '' });
    }
    assert.equal(circle.workflows.benchmarks.when, '<< pipeline.parameters.run_bench >>');
    assert.deepEqual(circle.workflows.build_test.when, { not: '<< pipeline.parameters.run_bench >>' });
    for (const job of circle.workflows.benchmarks.jobs) {
      assert.equal(Object.values(job)[0].filters, undefined, 'The explicit workflow must allow master.');
    }
  });

  void it('checks the frozen harness before preparing, sampling or reporting', () => {
    for (const name of ['tacho_benchmark_prep', 'tacho_benchmark', 'benchmark_report']) {
      assert.deepEqual(circle.jobs[name].steps.slice(0, 2), ['checkout', 'verify_benchmark_harness']);
    }
  });

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

void describe('benchmark revision bootstrap', () => {
  // Execute the actual CI shell against a local origin. This catches quoting, merge-parent and
  // fetch mistakes that matching fragments of YAML cannot prove, without contacting a service.
  let root;
  let checkout;
  let origin;
  let base;
  let candidate;
  let prBase;
  let head;
  let harness;
  let fetchedCandidate;
  let runNumber = 0;
  const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  const bash = process.platform === 'win32'
    ? path.resolve(git(undefined, '--exec-path'), '../../../bin/bash.exe')
    : 'bash';
  const verify = circle.commands.verify_benchmark_harness.steps[0].run.command;
  const preparation = circle.jobs.tacho_benchmark_prep.steps.filter(step => step.run).map(step => step.run);
  const bootstrap = preparation.find(step => step.name === 'Verify benchmark revisions').command;
  const prepare = preparation.find(step => step.name === 'Prepare exact benchmark variants').command;

  void before(() => {
    root = mkdtempSync(path.join(os.tmpdir(), 'aurelia-benchmark-ci-'));
    origin = path.join(root, 'origin');
    checkout = path.join(root, 'checkout');
    git(root, 'init', '--initial-branch=master', origin);
    git(origin, 'config', 'user.name', 'Benchmark fixture');
    git(origin, 'config', 'user.email', 'benchmark@example.invalid');
    const tree = execFileSync('git', ['hash-object', '-w', '-t', 'tree', '--stdin'], { cwd: origin, input: '', encoding: 'utf8' }).trim();
    const commit = (name, parents = []) => git(origin, 'commit-tree', tree, '-m', name, ...parents.flatMap(parent => ['-p', parent]));
    base = commit('historical base');
    candidate = commit('historical candidate', [base]);
    prBase = commit('PR base', [candidate]);
    head = commit('PR head', [prBase]);
    harness = commit('PR test merge', [prBase, head]);
    git(origin, 'update-ref', 'refs/heads/master', harness);
    git(root, 'clone', '--no-local', origin, checkout);
    fetchedCandidate = commit('source available only at origin', [base]);
    git(origin, 'update-ref', 'refs/heads/historical', fetchedCandidate);
  });

  void after(() => {
    if (root) rmSync(root, { recursive: true, force: true });
  });

  function run(overrides = {}) {
    git(checkout, 'checkout', '--detach', harness);
    const env = {
      ...process.env,
      CIRCLE_BRANCH: 'pull/2475/merge',
      BENCHMARK_REQUEST_PROFILE: 'full',
      BENCHMARK_REQUEST_COMPARISON: 'revisions',
      BENCHMARK_REQUEST_HARNESS_SHA: harness,
      BENCHMARK_REQUEST_PR_BASE_SHA: prBase,
      BENCHMARK_REQUEST_PR: '2475',
      BENCHMARK_REQUEST_BASE_SHA: base,
      BENCHMARK_REQUEST_HEAD_SHA: head,
      BENCHMARK_REQUEST_CANDIDATE_SHA: candidate,
      BASH_ENV: path.join(root, `environment-${++runNumber}`).replaceAll('\\', '/'),
      ...overrides,
    };
    const result = spawnSync(bash, ['-c', `${verify}\n${bootstrap}`], { cwd: checkout, env, encoding: 'utf8' });
    assert.ifError(result.error);
    return { ...result, env };
  }

  function preparedArguments(result) {
    assert.equal(result.status, 0, result.stderr);
    // The shell constructs the production argv; only the expensive npm invocation is substituted.
    return execFileSync(bash, ['-c', `npm() { printf '%s\\n' "$@"; }\n${prepare}`], {
      cwd: checkout,
      env: result.env,
      encoding: 'utf8',
    }).trim().split(/\r?\n/);
  }

  void it('keeps the current PR merge harness independent of both framework revisions', () => {
    assert.deepEqual(preparedArguments(run()), [
      'run', 'bench:variants', '--', '--base', base, '--candidate', candidate,
      '--output', 'results/variants', '--profile', 'full',
      '--head', head, '--pull-request', '2475', '--comparison', 'revisions',
      '--harness', harness, '--pr-base', prBase,
    ]);
  });

  void it('fetches a missing source commit by exact SHA from the same origin', () => {
    assert.notEqual(spawnSync('git', ['cat-file', '-e', `${fetchedCandidate}^{commit}`], { cwd: checkout }).status, 0);
    const result = run({ BENCHMARK_REQUEST_CANDIDATE_SHA: fetchedCandidate });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(git(checkout, 'rev-parse', 'HEAD'), harness);
    assert.equal(git(checkout, 'show', '-s', '--format=%s', fetchedCandidate), 'source available only at origin');
  });

  void it('prepares a standalone pair with no PR metadata', () => {
    assert.deepEqual(preparedArguments(run({
      CIRCLE_BRANCH: 'master', BENCHMARK_REQUEST_PR: '', BENCHMARK_REQUEST_PR_BASE_SHA: '', BENCHMARK_REQUEST_HEAD_SHA: '',
    })), [
      'run', 'bench:variants', '--', '--base', base, '--candidate', candidate,
      '--output', 'results/variants', '--profile', 'full', '--comparison', 'revisions', '--harness', harness,
    ]);
  });

  void it('preserves the ordinary PR comparison arguments', () => {
    assert.deepEqual(preparedArguments(run({
      BENCHMARK_REQUEST_COMPARISON: '', BENCHMARK_REQUEST_HARNESS_SHA: '', BENCHMARK_REQUEST_PR_BASE_SHA: '',
      BENCHMARK_REQUEST_BASE_SHA: prBase, BENCHMARK_REQUEST_CANDIDATE_SHA: harness, BENCHMARK_REQUEST_PROFILE: 'smoke',
    })), [
      'run', 'bench:variants', '--', '--base', prBase, '--candidate', harness,
      '--output', 'results/variants', '--profile', 'smoke', '--head', head, '--pull-request', '2475',
    ]);
  });

  void it('preserves automatic master comparison against the first parent', () => {
    const emptyRequest = Object.fromEntries(Object.keys(circle.jobs.tacho_benchmark_prep.environment).map(name => [name, '']));
    assert.deepEqual(preparedArguments(run({ ...emptyRequest, CIRCLE_BRANCH: 'master' })), [
      'run', 'bench:variants', '--', '--base', prBase, '--candidate', harness,
      '--output', 'results/variants', '--profile', 'master',
    ]);
  });

  for (const [name, overrides, error] of [
    ['a moving harness', () => ({ BENCHMARK_REQUEST_HARNESS_SHA: head }), /does not match the requested benchmark harness/],
    ['an unfrozen harness', () => ({ BENCHMARK_REQUEST_HARNESS_SHA: '' }), /requires a frozen harness SHA/],
    ['a non-SHA source revision', () => ({ BENCHMARK_REQUEST_BASE_SHA: '--upload-pack=unexpected' }), /full lowercase commit SHAs/],
    ['a wrong PR base', () => ({ BENCHMARK_REQUEST_PR_BASE_SHA: base }), /Harness parents do not match/],
    ['a wrong PR head', () => ({ BENCHMARK_REQUEST_HEAD_SHA: candidate }), /Harness parents do not match/],
    ['the wrong PR ref', () => ({ CIRCLE_BRANCH: 'pull/2476/merge' }), /Expected CircleCI merge ref/],
    ['a standalone request on a topic branch', () => ({ BENCHMARK_REQUEST_PR: '', CIRCLE_BRANCH: 'topic' }), /provenance is missing/],
    ['PR parents on a standalone request', () => ({ BENCHMARK_REQUEST_PR: '', CIRCLE_BRANCH: 'master' }), /cannot carry PR parents/],
    ['an unknown comparison mode', () => ({ BENCHMARK_REQUEST_COMPARISON: 'live' }), /Unknown benchmark comparison/],
    ['an invalid profile', () => ({ BENCHMARK_REQUEST_PROFILE: 'full; false' }), /Unknown benchmark profile/],
  ]) {
    void it(`rejects ${name}`, () => {
      const result = run(overrides());
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, error);
    });
  }
});
