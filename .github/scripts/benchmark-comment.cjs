'use strict';

const path = require('node:path');
const { pathToFileURL } = require('node:url');

const marker = '<!-- aurelia-benchmark-report:v1 -->';
const statePrefix = '<!-- aurelia-benchmark-state:';
const terminalFailureStatuses = new Set(['failed', 'error', 'canceled', 'unauthorized', 'not_run']);
const reportArtifactPath = 'benchmark-report/benchmark-summary.json';
const reportJobNamePattern = /^benchmark_report(?:-\d+)?$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// This module runs from the trusted master checkout. Circle data is parsed as untrusted input and
// rendered only through the validated, repository-owned report formatter.

async function reportBenchmarkRun({
  github,
  context,
  core,
  circleToken,
  pipeline,
  comparison,
  profile,
  requestId = 1,
  resolveCurrentComparison,
  fetchImpl = fetch,
  sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)),
  now = Date.now,
  loadReportModule = defaultLoadReportModule,
}) {
  if (!Number.isSafeInteger(requestId) || requestId <= 0) {
    throw new Error('Benchmark report request id is invalid.');
  }
  const state = {
    requestId,
    pipelineId: pipeline.id,
    pipelineNumber: pipeline.number,
    pullRequest: Number(comparison.pullRequest),
    profile,
    base: comparison.base,
    head: comparison.head,
    candidate: comparison.candidate,
  };
  const pipelineUrl = circlePipelineUrl(context, pipeline.number);
  const claim = await claimComment(github, context, state, runningBody(state, pipelineUrl));
  if (!claim.claimed) return { status: 'superseded' };
  const commentId = claim.commentId;
  const circle = createCircleClient({ circleToken, fetchImpl, sleep });
  let workflowUrl = pipelineUrl;

  try {
    const workflowName = profile === 'smoke' ? 'pr_bench' : 'benchmarks';
    const workflow = await waitForWorkflow({
      circle,
      pipelineId: pipeline.id,
      workflowName,
      deadline: now() + 2 * 60_000,
      sleep,
      now,
    });
    const projectSlug = `gh/${context.repo.owner}/${context.repo.repo}`;
    if (!uuidPattern.test(workflow.id) || workflow.pipeline_id !== pipeline.id || workflow.project_slug !== projectSlug) {
      throw new BenchmarkReportError('invalid-workflow-identity');
    }
    workflowUrl = circleWorkflowUrl(context, pipeline.number, workflow.id);
    const completed = await waitForCompletion({
      circle,
      workflowId: workflow.id,
      deadline: now() + (profile === 'smoke' ? 50 : 75) * 60_000,
      sleep,
      now,
    });
    if (
      completed.id !== workflow.id
      || completed.pipeline_id !== pipeline.id
      || completed.project_slug !== projectSlug
    ) {
      throw new BenchmarkReportError('invalid-workflow-identity');
    }
    if (completed.status !== 'success') {
      const jobs = await circle.pages(`workflow/${workflow.id}/job`);
      const failures = jobs
        .filter(job => terminalFailureStatuses.has(job.status))
        .map(job => safeJobName(job.name));
      throw new BenchmarkReportError('workflow-failed', failures);
    }

    if (!await comparisonIsCurrent(resolveCurrentComparison, comparison)) {
      await updateOwnedComment(
        github,
        context,
        commentId,
        state,
        supersededBody(state, workflowUrl),
      );
      return { status: 'superseded', workflowId: workflow.id };
    }

    const jobs = await circle.pages(`workflow/${workflow.id}/job`);
    // CircleCI appends a numeric suffix when it normalizes an aliased workflow job.
    // Project, status, and single-result checks keep report discovery exact.
    const reportJobs = jobs.filter(job =>
      typeof job.name === 'string'
      && reportJobNamePattern.test(job.name)
      && job.status === 'success'
      && job.project_slug === projectSlug
    );
    if (
      reportJobs.length !== 1
      || !Number.isSafeInteger(reportJobs[0].job_number)
      || reportJobs[0].job_number <= 0
    ) {
      throw new BenchmarkReportError('missing-report-job');
    }
    const artifacts = await circle.pages(
      `project/gh/${context.repo.owner}/${context.repo.repo}/${reportJobs[0].job_number}/artifacts`,
    );
    const reports = artifacts.filter(artifact =>
      artifact.path === reportArtifactPath
      && artifact.node_index === 0
    );
    if (reports.length !== 1) throw new BenchmarkReportError('missing-report-artifact');
    const report = await downloadReport(reports[0].url, circleToken, fetchImpl);
    const reportModule = await loadReportModule();
    reportModule.validateBenchmarkReport(report, {
      profile,
      pullRequest: Number(comparison.pullRequest),
      base: comparison.base,
      head: comparison.head,
      candidate: comparison.candidate,
    });
    const markdown = reportModule.formatBenchmarkReportMarkdown(report, {
      circleWorkflow: workflowUrl,
      artifacts: circleJobUrl(context, reportJobs[0].job_number),
    });
    if (!await comparisonIsCurrent(resolveCurrentComparison, comparison)) {
      await updateOwnedComment(
        github,
        context,
        commentId,
        state,
        supersededBody(state, workflowUrl),
      );
      return { status: 'superseded', workflowId: workflow.id };
    }
    const updated = await updateOwnedComment(github, context, commentId, state, markdown);
    return { status: updated ? 'success' : 'superseded', workflowId: workflow.id };
  } catch (error) {
    core.warning(`Benchmark reporting failed: ${error instanceof Error ? error.message : String(error)}`);
    const failures = error instanceof BenchmarkReportError ? error.failures : [];
    const code = error instanceof BenchmarkReportError ? error.code : 'reporting-failed';
    await updateOwnedComment(
      github,
      context,
      commentId,
      state,
      failedBody(state, workflowUrl, failures, code),
    ).catch(updateError => core.warning(`Unable to update benchmark failure comment: ${updateError}`));
    throw error;
  }
}

async function comparisonIsCurrent(resolveCurrentComparison, expected) {
  try {
    const current = await resolveCurrentComparison();
    return current.base === expected.base
      && current.head === expected.head
      && current.candidate === expected.candidate;
  } catch {
    return false;
  }
}

function createCircleClient({ circleToken, fetchImpl, sleep }) {
  return {
    async get(apiPath) {
      const url = `https://circleci.com/api/v2/${apiPath}`;
      for (let attempt = 0; attempt < 5; attempt++) {
        let response;
        try {
          response = await fetchImpl(url, {
            headers: { 'Circle-Token': circleToken, Accept: 'application/json' },
            signal: AbortSignal.timeout(30_000),
          });
        } catch {
          if (attempt === 4) throw new BenchmarkReportError('circle-api-failed');
          await sleep(Math.min(1000 * 2 ** attempt, 10_000));
          continue;
        }
        if (response.ok) return response.json();
        if (response.status !== 429 && response.status < 500) {
          throw new BenchmarkReportError('circle-api-failed');
        }
        const retryAfter = Number(response.headers.get('retry-after'));
        await sleep(Number.isFinite(retryAfter)
          ? Math.min(retryAfter * 1000, 60_000)
          : Math.min(1000 * 2 ** attempt, 10_000));
      }
      throw new BenchmarkReportError('circle-api-failed');
    },
    async pages(apiPath) {
      const items = [];
      let pageToken;
      let pageCount = 0;
      do {
        if (++pageCount > 20) throw new BenchmarkReportError('circle-api-failed');
        const separator = apiPath.includes('?') ? '&' : '?';
        const page = await this.get(
          pageToken === undefined ? apiPath : `${apiPath}${separator}page-token=${encodeURIComponent(pageToken)}`,
        );
        if (!Array.isArray(page.items)) throw new BenchmarkReportError('circle-api-failed');
        items.push(...page.items);
        pageToken = page.next_page_token ?? undefined;
      } while (pageToken !== undefined);
      return items;
    },
  };
}

async function waitForWorkflow({ circle, pipelineId, workflowName, deadline, sleep, now }) {
  while (now() < deadline) {
    const workflows = (await circle.pages(`pipeline/${pipelineId}/workflow`))
      .filter(workflow => workflow.name === workflowName);
    if (workflows.length > 1) throw new BenchmarkReportError('ambiguous-workflow');
    if (workflows.length === 1) return workflows[0];
    await sleep(10_000);
  }
  throw new BenchmarkReportError('workflow-timeout');
}

async function waitForCompletion({ circle, workflowId, deadline, sleep, now }) {
  while (now() < deadline) {
    const workflow = await circle.get(`workflow/${workflowId}`);
    if (workflow.status === 'success' || terminalFailureStatuses.has(workflow.status)) return workflow;
    await sleep(20_000);
  }
  throw new BenchmarkReportError('workflow-timeout');
}

async function downloadReport(value, circleToken, fetchImpl) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new BenchmarkReportError('invalid-report-artifact');
  }
  if (
    url.protocol !== 'https:'
    || !(url.hostname === 'circleci.com' || url.hostname.endsWith('.circle-artifacts.com'))
  ) {
    throw new BenchmarkReportError('invalid-report-artifact');
  }
  const response = await fetchArtifact(url, circleToken, fetchImpl);
  if (!response.ok) throw new BenchmarkReportError('invalid-report-artifact');
  const length = Number(response.headers.get('content-length'));
  if (Number.isFinite(length) && length > 512 * 1024) throw new BenchmarkReportError('invalid-report-artifact');
  const text = await readLimitedBody(response, 512 * 1024);
  try {
    return JSON.parse(text);
  } catch {
    throw new BenchmarkReportError('invalid-report-artifact');
  }
}

async function fetchArtifact(url, circleToken, fetchImpl) {
  let current = url;
  // CircleCI artifact endpoints redirect to signed storage URLs. Follow a bounded HTTPS
  // chain without forwarding the Circle token beyond the validated CircleCI origin.
  for (let redirectCount = 0; redirectCount <= 3; redirectCount++) {
    let response;
    try {
      response = await fetchImpl(current, {
        headers: redirectCount === 0
          ? { 'Circle-Token': circleToken, Accept: 'application/json' }
          : { Accept: 'application/json' },
        redirect: 'manual',
        signal: AbortSignal.timeout(30_000),
      });
    } catch {
      throw new BenchmarkReportError('invalid-report-artifact');
    }
    if (![301, 302, 303, 307, 308].includes(response.status)) return response;
    if (redirectCount === 3) throw new BenchmarkReportError('invalid-report-artifact');

    const location = response.headers.get('location');
    if (typeof location !== 'string' || location === '') {
      throw new BenchmarkReportError('invalid-report-artifact');
    }
    try {
      current = new URL(location, current);
    } catch {
      throw new BenchmarkReportError('invalid-report-artifact');
    }
    if (current.protocol !== 'https:' || current.username !== '' || current.password !== '') {
      throw new BenchmarkReportError('invalid-report-artifact');
    }
  }
  throw new BenchmarkReportError('invalid-report-artifact');
}

async function readLimitedBody(response, limit) {
  if (response.body === null || typeof response.body?.getReader !== 'function') {
    throw new BenchmarkReportError('invalid-report-artifact');
  }
  const reader = response.body.getReader();
  const chunks = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > limit) {
        await reader.cancel();
        throw new BenchmarkReportError('invalid-report-artifact');
      }
      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks, length).toString('utf8');
}

async function claimComment(github, context, state, content) {
  const comments = await github.paginate(github.rest.issues.listComments, {
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: Number(state.pullRequest ?? context.issue.number),
    per_page: 100,
  });
  const existing = comments
    .filter(comment =>
      comment.user?.type === 'Bot'
      && comment.user?.login === 'github-actions[bot]'
      && comment.body?.includes(marker)
    )
    .sort((left, right) => right.id - left.id)[0];
  const body = commentBody(state, content);
  if (existing === undefined) {
    const { data } = await github.rest.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: Number(state.pullRequest ?? context.issue.number),
      body,
    });
    return { commentId: data.id, claimed: true };
  }
  const existingState = readState(existing.body);
  if (
    Number.isSafeInteger(existingState?.requestId)
    && existingState.requestId > state.requestId
  ) {
    return { commentId: existing.id, claimed: false };
  }
  await github.rest.issues.updateComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    comment_id: existing.id,
    body,
  });
  return { commentId: existing.id, claimed: true };
}

async function updateOwnedComment(github, context, commentId, state, content) {
  const { data: comment } = await github.rest.issues.getComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    comment_id: commentId,
  });
  if (readState(comment.body)?.pipelineId !== state.pipelineId) return false;
  await github.rest.issues.updateComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    comment_id: commentId,
    body: commentBody(state, content),
  });
  return true;
}

function commentBody(state, content) {
  const encoded = Buffer.from(JSON.stringify(state), 'utf8').toString('base64url');
  return `${marker}\n${statePrefix}${encoded} -->\n\n${content}`;
}

function readState(body) {
  const match = new RegExp(`${statePrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([A-Za-z0-9_-]+) -->`).exec(body ?? '');
  if (match === null) return null;
  try {
    return JSON.parse(Buffer.from(match[1], 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

function runningBody(state, pipelineUrl) {
  return [
    '## Benchmark comparison',
    '',
    `Running the \`${state.profile}\` profile for \`${state.base.slice(0, 7)}\` → \`${state.candidate.slice(0, 7)}\`.`,
    '',
    `[CircleCI pipeline](${pipelineUrl})`,
  ].join('\n');
}

function supersededBody(state, workflowUrl) {
  return [
    '## Benchmark comparison',
    '',
    'This comparison completed after the PR base, head, or test merge changed. Run the benchmark command again for current results.',
    '',
    `[Completed CircleCI workflow](${workflowUrl})`,
  ].join('\n');
}

function failedBody(state, workflowUrl, failures, code) {
  const jobs = failures.length === 0 ? '' : `\n\nFailed jobs: ${failures.map(job => `\`${job}\``).join(', ')}`;
  const message = code === 'workflow-timeout'
    ? 'The benchmark reporter timed out while CircleCI may still be running.'
    : `The \`${state.profile}\` benchmark workflow did not complete successfully.`;
  return [
    '## Benchmark comparison',
    '',
    `${message}${jobs}`,
    '',
    `[CircleCI workflow](${workflowUrl})`,
  ].join('\n');
}

function safeJobName(value) {
  return typeof value === 'string' && /^[A-Za-z0-9_.-]{1,100}$/.test(value) ? value : 'unknown-job';
}

function circlePipelineUrl(context, pipelineNumber) {
  return `https://app.circleci.com/pipelines/github/${context.repo.owner}/${context.repo.repo}/${pipelineNumber}`;
}

function circleWorkflowUrl(context, pipelineNumber, workflowId) {
  return `${circlePipelineUrl(context, pipelineNumber)}/workflows/${workflowId}`;
}

function circleJobUrl(context, jobNumber) {
  return `https://circleci.com/gh/${context.repo.owner}/${context.repo.repo}/${jobNumber}`;
}

async function defaultLoadReportModule() {
  const modulePath = path.resolve(process.cwd(), 'benchmarks', 'benchmark-report.mjs');
  return import(pathToFileURL(modulePath).href);
}

class BenchmarkReportError extends Error {
  constructor(code, failures = []) {
    super(`Benchmark report failed (${code}).`);
    this.code = code;
    this.failures = failures;
  }
}

module.exports = {
  BenchmarkReportError,
  createCircleClient,
  downloadReport,
  readState,
  reportBenchmarkRun,
};
