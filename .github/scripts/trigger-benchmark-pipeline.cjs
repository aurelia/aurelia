'use strict';

const { reportBenchmarkRun } = require('./benchmark-comment.cjs');
const { comparisonHarness, validateComparison } = require('../../benchmarks/benchmark-comparison.cjs');

const shaPattern = /^[0-9a-f]{40}$/;

module.exports = async function triggerBenchmarkPipeline({
  github,
  context,
  core,
  prNumber,
  profile,
  circleToken,
  expectedBase = '',
  expectedHead = '',
  baseSha = '',
  candidateSha = '',
  fetchImpl = fetch,
  reporter = reportBenchmarkRun,
}) {
  const pullRequest = prNumber === '' || prNumber === undefined ? null : Number(prNumber);
  if (pullRequest !== null && (!Number.isSafeInteger(pullRequest) || pullRequest <= 0)) {
    throw new Error(`Invalid PR number "${prNumber}".`);
  }
  if (profile !== 'smoke' && profile !== 'full') {
    throw new Error(`Unknown benchmark profile "${profile}".`);
  }
  if (!circleToken) {
    throw new Error('Missing repository secret CIRCLECI_TOKEN.');
  }
  const requestId = Number(process.env.GITHUB_RUN_ID ?? context.runId);
  if (!Number.isSafeInteger(requestId) || requestId <= 0) {
    throw new Error('GitHub Actions did not provide a valid run id.');
  }

  const expected = {
    base: validateOptionalSha('expected_base_sha', expectedBase),
    head: validateOptionalSha('expected_head_sha', expectedHead),
  };
  const baseSelector = validateSelector('base_sha', baseSha);
  const candidateSelector = validateSelector('candidate_sha', candidateSha);
  if (baseSelector === '' && (candidateSelector !== '' || pullRequest === null)) {
    throw new Error('Supply base_sha for an explicit comparison; candidate_sha is optional.');
  }
  if (baseSelector !== '' && profile !== 'full') {
    throw new Error('Explicit revision selection uses the full benchmark profile.');
  }
  if (pullRequest === null && (expected.base !== '' || expected.head !== '')) {
    throw new Error('expected_base_sha and expected_head_sha are PR freshness guards and require pr_number.');
  }

  const prComparison = pullRequest === null ? null : await resolveComparison({ github, context, pullRequest, expected });
  let comparison = prComparison;
  if (baseSelector !== '') {
    // Resolve source selectors once. A later PR check refreshes only its harness/parents, never the
    // historical revisions requested by the maintainer. Both variants use this one frozen harness.
    const [base, candidate, harness] = await Promise.all([
      resolveCommit(github, context, baseSelector),
      candidateSelector === '' ? null : resolveCommit(github, context, candidateSelector),
      prComparison === null ? resolveCommit(github, context, 'master') : prComparison.candidate,
    ]);
    comparison = {
      kind: 'revisions',
      base,
      candidate: candidate ?? harness,
      harness,
      pullRequest,
      head: prComparison?.head ?? null,
      prBase: prComparison?.base ?? null,
      mergeParentsVerified: pullRequest !== null,
    };
  }
  validateComparison({ ...comparison, profile, mergeParentsVerified: pullRequest !== null });
  const payload = {
    // CircleCI loads configuration from the harness branch. Its jobs verify the frozen checkout
    // before running; a moving branch must fail rather than change the requested experiment.
    branch: pullRequest === null ? 'master' : `pull/${pullRequest}/merge`,
    parameters: {
      run_pr_full: profile === 'smoke',
      run_bench: profile === 'full',
      run_pr_lite: false,
      benchmark_profile: profile,
      benchmark_pr: pullRequest === null ? '' : String(pullRequest),
      benchmark_base_sha: comparison.base,
      benchmark_head_sha: comparison.head ?? '',
      benchmark_candidate_sha: comparison.candidate,
      ...(comparison.kind === 'revisions' ? {
        benchmark_comparison: 'revisions',
        benchmark_harness_sha: comparison.harness,
        benchmark_pr_base_sha: comparison.prBase ?? '',
      } : {}),
    },
  };

  core.setSecret(circleToken);
  core.info(
    `Triggering ${profile} benchmarks${pullRequest === null ? '' : ` for PR #${pullRequest}`}: `
    + `${comparison.base} -> ${comparison.candidate}; harness ${comparisonHarness(comparison)}`
  );
  const response = await fetchImpl(
    `https://circleci.com/api/v2/project/gh/${context.repo.owner}/${context.repo.repo}/pipeline`,
    {
      method: 'POST',
      headers: {
        'Circle-Token': circleToken,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30_000),
    },
  );
  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`CircleCI trigger failed with status ${response.status}.`);
  }

  const pipeline = parsePipelineResponse(responseText);
  core.info(`CircleCI pipeline #${pipeline.number}: ${pipeline.id}`);
  core.setOutput('base_sha', comparison.base);
  core.setOutput('head_sha', comparison.head ?? '');
  core.setOutput('candidate_sha', comparison.candidate);
  core.setOutput('harness_sha', comparisonHarness(comparison));
  core.setOutput('pipeline_id', pipeline.id);
  await reporter({
    github,
    context,
    core,
    circleToken,
    pipeline,
    comparison,
    profile,
    requestId,
    fetchImpl,
    resolveCurrentComparison: async () => {
      if (pullRequest === null) return comparison;
      const current = await resolveComparison({ github, context, pullRequest, expected: { base: '', head: '' } });
      return comparison.kind === 'revisions'
        ? { ...comparison, harness: current.candidate, prBase: current.base, head: current.head }
        : current;
    },
  });
};

async function resolveComparison({ github, context, pullRequest, expected }) {
  const repository = `${context.repo.owner}/${context.repo.repo}`.toLowerCase();
  let lastReason = 'GitHub did not produce a current test merge commit';

  // GitHub recalculates test-merge refs asynchronously. A bounded retry handles that normal delay,
  // while parent validation prevents a stale ref from being treated as the requested comparison.
  for (let attempt = 1; attempt <= 10; attempt++) {
    const { data: pr } = await github.rest.pulls.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: pullRequest,
    });

    validatePullRequest(pr, pullRequest, repository, expected);
    const base = pr.base.sha.toLowerCase();
    const head = pr.head.sha.toLowerCase();
    if (pr.mergeable === false) {
      throw new Error(
        `PR #${pullRequest} conflicts with ${pr.base.ref}; GitHub cannot create a test merge commit.`
      );
    }

    const candidate = pr.merge_commit_sha?.toLowerCase();
    if (pr.mergeable === true && candidate !== undefined) {
      try {
        const { data: commit } = await github.rest.git.getCommit({
          owner: context.repo.owner,
          repo: context.repo.repo,
          commit_sha: candidate,
        });
        const parents = commit.parents.map(parent => parent.sha.toLowerCase());
        if (parents.length === 2 && parents[0] === base && parents[1] === head) {
          return { pullRequest, base, head, candidate };
        }
        lastReason = `test merge ${candidate} has parents ${parents.join(', ')}`;
      } catch (error) {
        if (error.status !== 404 && error.status !== 409) throw error;
        lastReason = `test merge ${candidate} is not readable yet`;
      }
    } else {
      lastReason = 'mergeability is still being calculated';
    }

    if (attempt < 10) await new Promise(resolve => setTimeout(resolve, 2_000));
  }

  throw new Error(
    `Unable to resolve an immutable comparison for PR #${pullRequest}: ${lastReason}. `
    + 'Wait for GitHub to refresh the merge ref, then retry.'
  );
}

function validatePullRequest(pr, pullRequest, repository, expected) {
  if (pr.state !== 'open') {
    throw new Error(`PR #${pullRequest} is not open.`);
  }
  if (pr.base.ref !== 'master') {
    throw new Error(
      `PR #${pullRequest} targets "${pr.base.ref}", but benchmark comparisons currently require master.`
    );
  }

  const baseRepository = pr.base.repo?.full_name?.toLowerCase();
  const headRepository = pr.head.repo?.full_name?.toLowerCase();
  if (baseRepository !== repository) {
    throw new Error(`PR #${pullRequest} has an unexpected base repository.`);
  }
  if (headRepository === undefined) {
    throw new Error(`PR #${pullRequest}'s head repository is unavailable.`);
  }
  if (headRepository !== repository) {
    throw new Error(
      `PR #${pullRequest} comes from ${pr.head.repo.full_name}. Fork benchmark execution is not supported yet.`
    );
  }

  const base = pr.base.sha.toLowerCase();
  const head = pr.head.sha.toLowerCase();
  if (expected.base !== '' && expected.base !== base) {
    throw new Error(`PR base moved: expected ${expected.base}, current base is ${base}.`);
  }
  if (expected.head !== '' && expected.head !== head) {
    throw new Error(`PR head moved: expected ${expected.head}, current head is ${head}.`);
  }
}

function validateOptionalSha(name, value) {
  const normalized = value.trim().toLowerCase();
  if (normalized !== '' && !shaPattern.test(normalized)) {
    throw new Error(`${name} must be a full 40-character SHA.`);
  }
  return normalized;
}

function validateSelector(name, value) {
  const normalized = value.trim().toLowerCase();
  if (normalized !== '' && !/^[0-9a-f]{7,40}$/.test(normalized)) {
    throw new Error(`${name} must be a commit SHA (7–40 hexadecimal characters).`);
  }
  return normalized;
}

async function resolveCommit(github, context, ref) {
  const { data: commit } = await github.rest.repos.getCommit({ ...context.repo, ref });
  const sha = commit.sha?.toLowerCase();
  // GitHub's endpoint also accepts names. A hex-looking branch must not override a SHA selector.
  if (!shaPattern.test(sha ?? '') || (ref !== 'master' && !sha.startsWith(ref))) {
    throw new Error(`GitHub did not resolve commit SHA "${ref}" to a matching full SHA.`);
  }
  return sha;
}

function parsePipelineResponse(value) {
  let pipeline;
  try {
    pipeline = JSON.parse(value);
  } catch {
    throw new Error('CircleCI returned an invalid pipeline response.');
  }
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(pipeline?.id)
    || !Number.isSafeInteger(pipeline?.number)
    || pipeline.number <= 0
    || !['created', 'pending'].includes(pipeline?.state)
  ) {
    throw new Error('CircleCI returned an invalid pipeline identity.');
  }
  return { id: pipeline.id, number: pipeline.number };
}

module.exports.parsePipelineResponse = parsePipelineResponse;
module.exports.resolveComparison = resolveComparison;
