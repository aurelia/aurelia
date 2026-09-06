'use strict';

const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { describe, it } = require('node:test');
const { parse } = require('yaml');
const trigger = require('./trigger-benchmark-pipeline.cjs');

const base = 'a'.repeat(40);
const head = 'b'.repeat(40);
const merge = 'c'.repeat(40);
const older = 'd'.repeat(40);
const newer = 'e'.repeat(40);
const pipeline = { id: '12345678-1234-4123-8123-123456789abc', number: 42, state: 'pending' };
const context = { repo: { owner: 'aurelia', repo: 'aurelia' }, runId: 100 };
const workflow = parse(readFileSync(path.join(__dirname, '../workflows/trigger-circleci-bench.yml'), 'utf8'));

void describe('benchmark revision dispatch', () => {
  for (const profile of ['smoke', 'full']) {
    void it(`preserves the ordinary ${profile} PR comparison`, async () => {
      const run = fixture();
      await run.trigger({ prNumber: '2475', profile });
      assert.deepEqual(run.reported.comparison, { pullRequest: 2475, base, head, candidate: merge });
      assert.equal(run.payload.branch, 'pull/2475/merge');
      assert.equal(run.payload.parameters.benchmark_comparison, undefined);
      assert.equal(run.payload.parameters.run_pr_full, profile === 'smoke');
      assert.equal(run.payload.parameters.run_bench, profile === 'full');
      assert.deepEqual(run.lookups, []);
      assert.deepEqual(await run.reported.resolveCurrentComparison(), run.reported.comparison);
    });
  }

  void it('uses a chosen baseline against the verified PR merge', async () => {
    const run = fixture();
    await run.trigger({ prNumber: '2475', baseSha: ' DDDDDDD ' });
    assert.deepEqual(run.reported.comparison, {
      kind: 'revisions', base: older, candidate: merge, harness: merge,
      pullRequest: 2475, head, prBase: base, mergeParentsVerified: true,
    });
    assert.deepEqual(run.lookups, ['ddddddd']);
    assert.equal(run.payload.parameters.benchmark_harness_sha, merge);
    assert.equal(run.payload.parameters.benchmark_pr_base_sha, base);
  });

  void it('freezes two historical sources and still rechecks the PR harness', async () => {
    const run = fixture();
    await run.trigger({ prNumber: '2475', baseSha: older, candidateSha: newer });
    assert.equal(run.payload.parameters.benchmark_base_sha, older);
    assert.equal(run.payload.parameters.benchmark_candidate_sha, newer);
    assert.equal(run.reported.comparison.harness, merge);

    run.pr.base.sha = 'f'.repeat(40);
    run.pr.merge_commit_sha = '1'.repeat(40);
    const current = await run.reported.resolveCurrentComparison();
    assert.equal(current.base, older);
    assert.equal(current.candidate, newer);
    assert.equal(current.prBase, run.pr.base.sha);
    assert.equal(current.harness, run.pr.merge_commit_sha);
    assert.deepEqual(run.lookups, [older, newer], 'staleness checks must not resolve the source pair again');
  });

  for (const candidateSha of ['', newer]) {
    void it(`runs a standalone comparison with ${candidateSha === '' ? 'current master' : 'a selected candidate'}`, async () => {
      const run = fixture();
      delete run.github.rest.pulls;
      delete run.github.rest.git;
      await run.trigger({ baseSha: older, candidateSha });
      assert.equal(run.payload.branch, 'master');
      assert.deepEqual(run.reported.comparison, {
        kind: 'revisions', base: older, candidate: candidateSha || base, harness: base,
        pullRequest: null, head: null, prBase: null, mergeParentsVerified: false,
      });
      assert.equal(run.payload.parameters.benchmark_pr, '');
      assert.equal(run.payload.parameters.benchmark_head_sha, '');
      assert.equal(run.payload.parameters.benchmark_pr_base_sha, '');
      assert.equal(run.outputs.harness_sha, base);
      const lookups = [...run.lookups];
      run.master = 'f'.repeat(40);
      assert.deepEqual(await run.reported.resolveCurrentComparison(), run.reported.comparison);
      assert.deepEqual(run.lookups, lookups, 'standalone results retain the frozen experiment when master moves');
    });
  }

  const invalid = [
    [{}, /Supply base_sha/],
    [{ candidateSha: newer }, /Supply base_sha/],
    [{ prNumber: '2475', candidateSha: newer }, /Supply base_sha/],
    [{ baseSha: 'master' }, /7–40 hexadecimal/],
    [{ baseSha: 'HEAD~1' }, /7–40 hexadecimal/],
    [{ baseSha: older, candidateSha: '--help' }, /7–40 hexadecimal/],
    [{ baseSha: older, prNumber: '0' }, /Invalid PR number/],
    [{ baseSha: older, profile: 'smoke' }, /full benchmark profile/],
    [{ baseSha: older, expectedBase: base }, /PR freshness guards/],
    [{ baseSha: older, expectedHead: head }, /PR freshness guards/],
    [{ prNumber: '2475', baseSha: older, expectedBase: newer }, /PR base moved/],
    [{ prNumber: '2475', baseSha: older, expectedHead: newer }, /PR head moved/],
  ];
  for (const [inputs, error] of invalid) {
    void it(`rejects invalid selection ${JSON.stringify(inputs)} before dispatch`, async () => {
      const run = fixture();
      await assert.rejects(run.trigger(inputs), error);
      assert.equal(run.payload, undefined);
    });
  }

  void it('rejects a hex-looking named ref resolved to a different commit', async () => {
    const run = fixture();
    run.github.rest.repos.getCommit = async () => ({ data: { sha: newer } });
    await assert.rejects(run.trigger({ prNumber: '2475', baseSha: 'ddddddd' }), /matching full SHA/);
    assert.equal(run.payload, undefined);
  });
});

void describe('/ci bench command', () => {
  const decide = new Function('context', 'core', workflow.jobs.decide.steps[0].with.script);
  function command(body, association = 'MEMBER', isPR = true) {
    const outputs = {};
    decide({
      eventName: 'issue_comment', issue: { number: 2475 },
      payload: { issue: { pull_request: isPR ? {} : undefined }, comment: { body, author_association: association } },
    }, { setOutput: (key, value) => { outputs[key] = value; } });
    return outputs;
  }

  void it('accepts zero, one or two SHA arguments from maintainers', () => {
    assert.deepEqual(command('/ci bench'), { should: 'true', pr: '2475', base: '', candidate: '' });
    assert.equal(command('/ci bench DDDDDDD', 'OWNER').base, 'DDDDDDD');
    assert.equal(command(`/ci bench ${older} ${newer}`, 'COLLABORATOR').candidate, newer);
  });

  void it('ignores other comments and callers without execution authority', () => {
    for (const body of ['/ci full', 'Please /ci bench', '/ci benchmark']) assert.equal(command(body).should, 'false');
    assert.equal(command('/ci bench ddddddd', 'CONTRIBUTOR').should, 'false');
    assert.equal(command('/ci bench ddddddd', 'MEMBER', false).should, 'false');
  });

  void it('gives guidance for malformed maintainer commands', () => {
    for (const body of ['/ci bench master', '/ci bench abc', '/ci bench ddddddd eeeeeee fffffff']) {
      assert.throws(() => command(body), /Use \/ci bench/);
    }
  });

  void it('passes optional manual inputs through the same trigger', () => {
    const outputs = {};
    decide({ eventName: 'workflow_dispatch', payload: { inputs: { base_sha: older, candidate_sha: newer } } },
      { setOutput: (key, value) => { outputs[key] = value; } });
    assert.deepEqual(outputs, { should: 'true', pr: '', base: older, candidate: newer });
    assert.equal(workflow.on.workflow_dispatch.inputs.pr_number.required, false);
    const step = workflow.jobs.trigger.steps[1];
    assert.equal(step.env.BASE_SHA, '${{ needs.decide.outputs.base }}');
    assert.equal(step.env.CANDIDATE_SHA, '${{ needs.decide.outputs.candidate }}');
    assert.match(step.with.script, /baseSha: process.env.BASE_SHA/);
    assert.match(step.with.script, /candidateSha: process.env.CANDIDATE_SHA/);
  });
});

function fixture() {
  const run = { lookups: [], outputs: {}, master: base };
  run.pr = {
    state: 'open', mergeable: true, merge_commit_sha: merge,
    base: { ref: 'master', sha: base, repo: { full_name: 'aurelia/aurelia' } },
    head: { sha: head, repo: { full_name: 'aurelia/aurelia' } },
  };
  run.github = { rest: {
    pulls: { get: async () => ({ data: run.pr }) },
    git: { getCommit: async () => ({ data: { parents: [{ sha: run.pr.base.sha }, { sha: run.pr.head.sha }] } }) },
    repos: { getCommit: async ({ ref }) => {
      run.lookups.push(ref);
      const sha = ref === 'master' ? run.master : [older, newer].find(value => value.startsWith(ref));
      assert.ok(sha, `Unexpected revision ${ref}`);
      return { data: { sha } };
    } },
  } };
  run.trigger = inputs => trigger({
    github: run.github, context, profile: 'full', circleToken: 'secret',
    core: { setSecret() {}, info() {}, setOutput(key, value) { run.outputs[key] = value; } },
    fetchImpl: async (_url, options) => {
      run.payload = JSON.parse(options.body);
      return { ok: true, text: async () => JSON.stringify(pipeline) };
    },
    reporter: async value => { run.reported = value; },
    ...inputs,
  });
  return run;
}
