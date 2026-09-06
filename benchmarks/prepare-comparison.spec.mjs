import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { promisify } from 'node:util';
import { prepareComparison } from './prepare-comparison.mjs';

const execFileAsync = promisify(execFile);

void describe('exact comparison preparation', () => {
  let root, base, prBase, head, harness;
  const git = async (...args) => (await execFileAsync('git', args, { cwd: root })).stdout.trim();

  void before(async () => {
    root = await mkdtemp(path.join(os.tmpdir(), 'aurelia-comparison-'));
    await git('init', '--quiet');
    await git('config', 'user.name', 'Benchmark test');
    await git('config', 'user.email', 'benchmark@example.invalid');
    await git('config', 'commit.gpgsign', 'false');
    await git('commit', '--allow-empty', '--quiet', '-m', 'base');
    base = await git('rev-parse', 'HEAD');
    await git('commit', '--allow-empty', '--quiet', '-m', 'current master');
    prBase = await git('rev-parse', 'HEAD');
    await git('checkout', '--quiet', '--detach', base);
    await git('commit', '--allow-empty', '--quiet', '-m', 'PR head');
    head = await git('rev-parse', 'HEAD');
    const tree = await git('rev-parse', 'HEAD^{tree}');
    harness = await git('commit-tree', tree, '-p', prBase, '-p', head, '-m', 'GitHub test merge');
    await git('checkout', '--quiet', '--detach', harness);
  });

  void after(async () => {
    if (root !== undefined) await rm(root, { recursive: true, force: true });
  });

  void it('prepares a normal verified PR without changing its comparison schema', async () => {
    const result = await prepareComparison({ base: prBase, candidate: harness, head, pullRequest: '2475', profile: 'full' }, root);
    assert.deepEqual(result, {
      harnessCommit: harness,
      comparison: { profile: 'full', pullRequest: '2475', base: prBase, candidate: harness, head, mergeParentsVerified: true },
    });
  });

  void it('requires the checked-out harness to match an ordinary PR candidate', async () => {
    // A merge with the same parents is still a different experiment if its harness commit differs.
    const tree = await git('rev-parse', 'HEAD^{tree}');
    const otherMerge = await git('commit-tree', tree, '-p', prBase, '-p', head, '-m', 'Another test merge');
    await assert.rejects(prepareComparison({
      base: prBase, candidate: otherMerge, head, pullRequest: '2475', profile: 'full',
    }, root), /expected the verified candidate/);
  });

  void it('preserves ordinary master and unprofiled local preparation', async () => {
    const master = await prepareComparison({ base: prBase, candidate: harness, profile: 'master' }, root);
    assert.deepEqual(master.comparison, {
      profile: 'master', pullRequest: null, base: prBase, candidate: harness, head: null, mergeParentsVerified: false,
    });
    const diagnostic = await prepareComparison({ base, candidate: head }, root);
    assert.equal(diagnostic.comparison.profile, null);
    assert.equal(diagnostic.harnessCommit, harness);
  });

  void it('verifies the PR harness parents independently of either selected framework revision', async () => {
    const options = { base, candidate: head, comparison: 'revisions', harness, prBase, head, pullRequest: '2475', profile: 'full' };
    const result = await prepareComparison(options, root);
    assert.deepEqual(result.comparison, {
      kind: 'revisions', profile: 'full', pullRequest: '2475', base, candidate: head, harness, prBase, head, mergeParentsVerified: true,
    });
    for (const patch of [{ prBase: base }, { head: prBase }, { harness: prBase }]) {
      await assert.rejects(prepareComparison({ ...options, ...patch }, root), /harness/);
    }
  });

  void it('freezes local refs to full SHAs and defaults the standalone harness to clean HEAD', async () => {
    const result = await prepareComparison({ base: 'HEAD^1', candidate: 'HEAD^2', comparison: 'revisions', profile: 'full' }, root);
    assert.deepEqual(result.comparison, {
      kind: 'revisions', profile: 'full', pullRequest: null, base: prBase, candidate: head,
      harness, prBase: null, head: null, mergeParentsVerified: false,
    });
    const identical = await prepareComparison({ base, candidate: base, comparison: 'revisions', profile: 'smoke' }, root);
    assert.equal(identical.comparison.base, identical.comparison.candidate);
  });

  void it('rejects malformed or incomplete comparison claims before source preparation', async () => {
    const options = { base, candidate: head, comparison: 'revisions', profile: 'full' };
    await assert.rejects(prepareComparison({ ...options, base: '--help' }, root));
    await assert.rejects(prepareComparison({ ...options, head, pullRequest: '2475' }, root), /test merge/);
    await assert.rejects(prepareComparison({ ...options, prBase }, root), /Standalone/);
    await assert.rejects(prepareComparison({ ...options, pullRequest: '2475' }, root), /verified merge/);
    await assert.rejects(prepareComparison({ base: prBase, candidate: head, head, pullRequest: '2475', profile: 'full' }, root), /test merge/);
  });

  void it('allows diagnostic preparation while editing the local harness', async () => {
    const file = path.join(root, 'untracked-fixture.html');
    await writeFile(file, '<template>new workload</template>');
    try {
      const result = await prepareComparison({ base, candidate: head, comparison: 'revisions', profile: 'full' }, root);
      assert.equal(result.comparison.harness, harness);
      assert.match(await git('status', '--porcelain'), /untracked-fixture.html/);
    } finally {
      await rm(file);
    }
  });
});
