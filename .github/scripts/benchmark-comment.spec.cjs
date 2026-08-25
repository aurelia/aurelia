'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { describe, it } = require('node:test');
const {
  createCircleClient,
  downloadReport,
  readState,
  reportBenchmarkRun,
} = require('./benchmark-comment.cjs');
const triggerBenchmarkPipeline = require('./trigger-benchmark-pipeline.cjs');

const base = 'a'.repeat(40);
const head = 'b'.repeat(40);
const candidate = 'c'.repeat(40);
const pipeline = { id: '12345678-1234-4123-8123-123456789abc', number: 16145 };
const workflowId = '87654321-4321-4321-8321-cba987654321';
const comparison = { pullRequest: 2462, base, head, candidate };

void describe('benchmark pipeline trigger', () => {
  void it('allows both trusted workflows to publish their PR report', () => {
    for (const filename of ['trigger-circleci-pr-full.yml', 'trigger-circleci-bench.yml']) {
      const workflow = fs.readFileSync(path.resolve(__dirname, '..', 'workflows', filename), 'utf8');
      assert.match(
        workflow,
        /permissions:\r?\n  contents: read\r?\n  issues: write\r?\n  pull-requests: write/,
        `${filename} must allow its trusted reporter to update the PR comment`,
      );
    }
  });

  void it('passes the verified merge comparison to CircleCI and reporting', async () => {
    const github = comparisonGithub();
    let payload;
    let reported;
    const outputs = {};
    await triggerBenchmarkPipeline({
      github,
      context: context(),
      core: core(outputs),
      prNumber: '2462',
      profile: 'full',
      circleToken: 'secret',
      fetchImpl: async (_url, options) => {
        payload = JSON.parse(options.body);
        return response({ ...pipeline, state: 'pending' }, 201);
      },
      reporter: async input => { reported = input; },
    });

    assert.equal(payload.branch, 'pull/2462/merge');
    assert.equal(payload.parameters.benchmark_base_sha, base);
    assert.equal(payload.parameters.benchmark_head_sha, head);
    assert.equal(payload.parameters.benchmark_candidate_sha, candidate);
    assert.equal(reported.pipeline.id, pipeline.id);
    assert.deepEqual(reported.comparison, comparison);
    assert.equal(outputs.pipeline_id, pipeline.id);
  });
});

void describe('benchmark PR comment', () => {
  void it('publishes a trusted rendering of a successful report', async () => {
    const github = commentGithub();
    const result = await reportBenchmarkRun({
      github,
      context: context(),
      core: core(),
      circleToken: 'secret',
      pipeline,
      comparison,
      profile: 'full',
      resolveCurrentComparison: async () => comparison,
      fetchImpl: successfulCircleFetch(),
      sleep: async () => {},
      loadReportModule: async () => ({
        validateBenchmarkReport(report, expected) {
          assert.equal(report.schemaVersion, 1);
          assert.equal(expected.candidate, candidate);
        },
        formatBenchmarkReportMarkdown: () => 'TRUSTED REPORT\n',
      }),
    });

    assert.equal(result.status, 'success');
    assert.equal(github.comments.length, 1);
    assert.match(github.comments[0].body, /TRUSTED REPORT/);
    assert.equal(readState(github.comments[0].body).pipelineId, pipeline.id);
  });

  void it('marks a completed comparison as superseded when the PR moved', async () => {
    const github = commentGithub();
    const result = await reportBenchmarkRun({
      github,
      context: context(),
      core: core(),
      circleToken: 'secret',
      pipeline,
      comparison,
      profile: 'full',
      resolveCurrentComparison: async () => ({ ...comparison, head: 'd'.repeat(40) }),
      fetchImpl: successfulCircleFetch(),
      sleep: async () => {},
      loadReportModule: async () => { throw new Error('stale run must not load its artifact'); },
    });

    assert.equal(result.status, 'superseded');
    assert.match(github.comments[0].body, /completed after the PR base, head, or test merge changed/);
  });

  void it('rechecks staleness immediately before publishing numbers', async () => {
    const github = commentGithub();
    let checks = 0;
    const result = await reportBenchmarkRun({
      github,
      context: context(),
      core: core(),
      circleToken: 'secret',
      pipeline,
      comparison,
      profile: 'full',
      resolveCurrentComparison: async () => ++checks === 1
        ? comparison
        : { ...comparison, candidate: 'd'.repeat(40) },
      fetchImpl: successfulCircleFetch(),
      sleep: async () => {},
      loadReportModule: async () => ({
        validateBenchmarkReport() {},
        formatBenchmarkReportMarkdown: () => 'STALE NUMBERS',
      }),
    });

    assert.equal(result.status, 'superseded');
    assert.doesNotMatch(github.comments[0].body, /STALE NUMBERS/);
  });

  void it('reports failed CircleCI jobs without copying job output', async () => {
    const github = commentGithub();
    const fetchImpl = circleFetch(new Map([
      ['/api/v2/pipeline/12345678-1234-4123-8123-123456789abc/workflow', {
        items: [{
          id: workflowId,
          name: 'benchmarks',
          pipeline_id: pipeline.id,
          project_slug: 'gh/aurelia/aurelia',
        }],
        next_page_token: null,
      }],
      [`/api/v2/workflow/${workflowId}`, {
        id: workflowId,
        pipeline_id: pipeline.id,
        project_slug: 'gh/aurelia/aurelia',
        status: 'failed',
      }],
      [`/api/v2/workflow/${workflowId}/job`, {
        items: [{ name: 'bench_prep', status: 'failed' }],
        next_page_token: null,
      }],
    ]));

    await assert.rejects(reportBenchmarkRun({
      github,
      context: context(),
      core: core(),
      circleToken: 'secret',
      pipeline,
      comparison,
      profile: 'full',
      resolveCurrentComparison: async () => comparison,
      fetchImpl,
      sleep: async () => {},
    }), /workflow-failed/);
    assert.match(github.comments[0].body, /Failed jobs: `bench_prep`/);
  });

  void it('does not let an older pipeline overwrite a newer owner', async () => {
    const github = commentGithub();
    const result = await reportBenchmarkRun({
      github,
      context: context(),
      core: core(),
      circleToken: 'secret',
      pipeline,
      comparison,
      profile: 'full',
      resolveCurrentComparison: async () => comparison,
      fetchImpl: successfulCircleFetch(),
      sleep: async () => {},
      loadReportModule: async () => ({
        validateBenchmarkReport() {},
        formatBenchmarkReportMarkdown() {
          const state = Buffer.from(JSON.stringify({ pipelineId: 'newer-pipeline' })).toString('base64url');
          github.comments[0].body = `<!-- aurelia-benchmark-report:v1 -->\n`
            + `<!-- aurelia-benchmark-state:${state} -->\n\nNewer run`;
          return 'OLDER REPORT';
        },
      }),
    });

    assert.equal(result.status, 'superseded');
    assert.doesNotMatch(github.comments[0].body, /OLDER REPORT/);
  });

  void it('does not claim the comment over a newer request id', async () => {
    const github = commentGithub();
    const state = Buffer.from(JSON.stringify({ requestId: 200, pipelineId: 'newer' })).toString('base64url');
    github.comments.push({
      id: 1,
      body: `<!-- aurelia-benchmark-report:v1 -->\n<!-- aurelia-benchmark-state:${state} -->`,
      user: { type: 'Bot', login: 'github-actions[bot]' },
    });
    const result = await reportBenchmarkRun({
      github,
      context: context(),
      core: core(),
      circleToken: 'secret',
      pipeline,
      comparison,
      profile: 'full',
      requestId: 100,
      resolveCurrentComparison: async () => comparison,
      fetchImpl: async () => { throw new Error('superseded request must not poll CircleCI'); },
    });

    assert.equal(result.status, 'superseded');
    assert.equal(readState(github.comments[0].body).requestId, 200);
  });

  void it('rejects report URLs outside CircleCI artifact hosting', async () => {
    await assert.rejects(
      downloadReport('https://example.com/report.json', 'secret', async () => response({})),
      /invalid-report-artifact/,
    );
  });

  void it('stops reading a chunked report once it exceeds the size limit', async () => {
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(300 * 1024));
        controller.enqueue(new Uint8Array(300 * 1024));
        controller.close();
      },
    });
    await assert.rejects(
      downloadReport(
        'https://output.circle-artifacts.com/report.json',
        'secret',
        async () => ({
          ok: true,
          status: 200,
          headers: { get: () => null },
          body,
        }),
      ),
      /invalid-report-artifact/,
    );
  });

  void it('retries a throttled idempotent CircleCI request', async () => {
    let calls = 0;
    const waits = [];
    const client = createCircleClient({
      circleToken: 'secret',
      sleep: async milliseconds => waits.push(milliseconds),
      fetchImpl: async () => {
        calls++;
        return calls === 1
          ? response({}, 429, { 'retry-after': '2' })
          : response({ status: 'success' });
      },
    });

    assert.equal((await client.get('workflow/id')).status, 'success');
    assert.deepEqual(waits, [2000]);
  });
});

function successfulCircleFetch() {
  return circleFetch(new Map([
    ['/api/v2/pipeline/12345678-1234-4123-8123-123456789abc/workflow', {
        items: [{
          id: workflowId,
          name: 'benchmarks',
          pipeline_id: pipeline.id,
          project_slug: 'gh/aurelia/aurelia',
        }],
      next_page_token: null,
    }],
    [`/api/v2/workflow/${workflowId}`, {
      id: workflowId,
      pipeline_id: pipeline.id,
      project_slug: 'gh/aurelia/aurelia',
      status: 'success',
    }],
    [`/api/v2/workflow/${workflowId}/job`, {
      items: [{
        name: 'benchmark_report-1',
        status: 'success',
        job_number: 123,
        project_slug: 'gh/aurelia/aurelia',
      }],
      next_page_token: null,
    }],
    ['/api/v2/project/gh/aurelia/aurelia/123/artifacts', {
      items: [{
        path: 'benchmark-report/benchmark-summary.json',
        node_index: 0,
        url: 'https://output.circle-artifacts.com/report.json',
      }],
      next_page_token: null,
    }],
    ['/report.json', { schemaVersion: 1 }],
  ]));
}

function circleFetch(responses) {
  return async value => {
    const url = new URL(value);
    const body = responses.get(url.pathname);
    if (body === undefined) throw new Error(`Unexpected request ${url}`);
    return response(body);
  };
}

function response(body, status = 200, headers = {}) {
  const normalized = new Map(Object.entries(headers).map(([name, value]) => [name.toLowerCase(), value]));
  const text = JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: name => normalized.get(name.toLowerCase()) ?? null },
    body: new Blob([text]).stream(),
    json: async () => structuredClone(body),
    text: async () => text,
  };
}

function context() {
  return { repo: { owner: 'aurelia', repo: 'aurelia' }, issue: { number: 2462 }, runId: 100 };
}

function core(outputs = {}) {
  return {
    info() {},
    setSecret() {},
    warning() {},
    setOutput(name, value) { outputs[name] = value; },
  };
}

function comparisonGithub() {
  return { rest: {
    pulls: { get: async () => ({ data: {
      state: 'open',
      mergeable: true,
      merge_commit_sha: candidate,
      base: { ref: 'master', sha: base, repo: { full_name: 'aurelia/aurelia' } },
      head: { sha: head, repo: { full_name: 'aurelia/aurelia' } },
    } }) },
    git: { getCommit: async () => ({ data: { parents: [{ sha: base }, { sha: head }] } }) },
  } };
}

function commentGithub() {
  const comments = [];
  const github = {
    comments,
    paginate: async () => comments,
    rest: { issues: {
      listComments() {},
      async createComment({ body }) {
        const comment = {
          id: comments.length + 1,
          body,
          user: { type: 'Bot', login: 'github-actions[bot]' },
        };
        comments.push(comment);
        return { data: comment };
      },
      async updateComment({ comment_id: id, body }) {
        comments.find(comment => comment.id === id).body = body;
        return { data: comments.find(comment => comment.id === id) };
      },
      async getComment({ comment_id: id }) {
        return { data: comments.find(comment => comment.id === id) };
      },
    } },
  };
  return github;
}
