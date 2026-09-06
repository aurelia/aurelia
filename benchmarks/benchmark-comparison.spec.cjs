const assert = require('node:assert/strict');
const { describe, it } = require('node:test');
const { comparisonHarness, comparisonsEqual, validateComparison } = require('./benchmark-comparison.cjs');

const sha = value => value.repeat(40);
const pr = {
  profile: 'full', pullRequest: 2475, base: sha('a'), head: sha('b'), candidate: sha('c'), mergeParentsVerified: true,
};
const explicit = { ...pr, kind: 'revisions', harness: sha('d'), prBase: sha('e') };
const standalone = { ...explicit, pullRequest: null, head: null, prBase: null, mergeParentsVerified: false };

void describe('benchmark comparison identity', () => {
  void it('retains the legacy PR/master shapes and provenance string PR numbers', () => {
    for (const profile of ['smoke', 'full']) {
      const comparison = { ...pr, profile, pullRequest: '2475' };
      assert.equal(validateComparison(comparison), comparison);
      assert.equal(comparisonHarness(comparison), pr.candidate);
      assert.equal(comparisonsEqual(comparison, { ...pr, profile }), true);
    }
    const master = { ...pr, profile: 'master', pullRequest: null, head: null, mergeParentsVerified: false };
    assert.equal(validateComparison(master), master);
    assert.equal(comparisonHarness(master), master.candidate);
  });

  void it('keeps framework source SHAs independent from the PR or standalone harness', () => {
    for (const input of [explicit, standalone]) {
      for (const profile of ['smoke', 'full', 'master']) {
        const comparison = { ...input, profile };
        assert.equal(validateComparison(comparison), comparison);
        assert.equal(comparisonHarness(comparison), explicit.harness);
      }
    }
  });

  void it('rejects invalid fields rather than reinterpreting an explicit pair as a normal PR run', () => {
    for (const patch of [
      { kind: 'anything' },
      { profile: null },
      { profile: 'unknown' },
      { base: 'master' },
      { candidate: sha('c').slice(0, 7) },
      { harness: undefined },
      { harness: 'HEAD' },
      { prBase: null },
      { head: null },
      { mergeParentsVerified: false },
      { pullRequest: 0 },
      { pullRequest: Number.MAX_SAFE_INTEGER + 1 },
      { pullRequest: '1x' },
      { pullRequest: [2475] },
    ]) assert.throws(() => validateComparison({ ...explicit, ...patch }));
    for (const patch of [{ head: sha('b') }, { prBase: sha('a') }, { mergeParentsVerified: true }]) {
      assert.throws(() => validateComparison({ ...standalone, ...patch }), /Standalone/);
    }
    for (const patch of [{ harness: sha('d') }, { prBase: sha('e') }, { mergeParentsVerified: undefined }]) {
      assert.throws(() => validateComparison({ ...pr, ...patch }));
    }
    for (const invalid of [null, undefined, false]) assert.throws(() => validateComparison(invalid));
  });

  void it('compares every source, harness, and PR identity field', () => {
    assert.equal(comparisonsEqual(explicit, { ...explicit }), true);
    for (const patch of [
      { kind: undefined }, { profile: 'smoke' }, { pullRequest: 1 }, { base: sha('f') },
      { head: sha('f') }, { candidate: sha('f') }, { harness: sha('f') }, { prBase: sha('f') },
      { mergeParentsVerified: false }, { mergeParentsVerified: undefined },
    ]) assert.equal(comparisonsEqual(explicit, { ...explicit, ...patch }), false);
    assert.equal(comparisonsEqual(pr, { ...pr, mergeParentsVerified: undefined }), true);
    assert.equal(comparisonsEqual(pr, { ...pr, mergeParentsVerified: false }), false);
    assert.equal(comparisonsEqual(pr, null), false);
    assert.equal(comparisonsEqual(undefined, pr), false);
  });
});
