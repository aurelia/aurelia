import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { validateComparison } from './benchmark-comparison.cjs';

const execFileAsync = promisify(execFile);

export async function prepareComparison(options, repositoryRoot) {
  const git = async (...args) => (await execFileAsync('git', args, { cwd: repositoryRoot })).stdout.trim();
  const resolve = revision => git('rev-parse', '--verify', '--end-of-options', `${revision}^{commit}`);
  const base = await resolve(options.base);
  const candidate = await resolve(options.candidate);
  const harness = await resolve('HEAD');
  const head = options.head === undefined ? null : await resolve(options.head);
  const explicit = options.comparison === 'revisions';
  const comparison = {
    profile: options.profile ?? null,
    pullRequest: options.pullRequest ?? null,
    base,
    head,
    candidate,
    mergeParentsVerified: head !== null,
    ...(explicit ? {
      kind: 'revisions',
      harness,
      prBase: options.prBase === undefined ? null : await resolve(options.prBase),
    } : {}),
  };

  if (explicit && options.harness !== undefined && await resolve(options.harness) !== harness) {
    throw new Error(`Benchmark harness checkout ${harness} does not match --harness ${options.harness}.`);
  }
  if (head !== null) {
    // The harness is the PR test merge even when neither measured framework revision is that merge.
    const merge = explicit ? harness : candidate;
    const mergeBase = explicit ? comparison.prBase : base;
    const [resolvedMerge, ...parents] = (await git('rev-list', '--parents', '-n', '1', merge)).split(' ');
    if (resolvedMerge !== merge || parents.length !== 2 || parents[0] !== mergeBase || parents[1] !== head) {
      throw new Error(`Benchmark harness ${merge} is not the test merge of base ${mergeBase} and head ${head}.`);
    }
  }
  if (options.pullRequest !== undefined && !explicit && harness !== candidate) {
    throw new Error(`PR benchmark harness is ${harness}, expected the verified candidate ${candidate}.`);
  }
  // Unprofiled local preparation remains useful for diagnostics. A declared profile needs its complete
  // comparison contract before either source build. The report separately enforces a clean harness.
  if (options.profile !== undefined || explicit) validateComparison(comparison);
  return { comparison, harnessCommit: harness };
}
