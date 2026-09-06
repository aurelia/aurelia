const shaPattern = /^[0-9a-f]{40}$/;

// Framework revisions and the code measuring them are independent in an explicit comparison.
// Ordinary PR/master runs retain their existing candidate-owned harness contract.
function comparisonHarness(comparison) {
  return comparison.kind === 'revisions' ? comparison.harness : comparison.candidate;
}

function validateComparison(comparison) {
  if (comparison === null || typeof comparison !== 'object') {
    throw new Error('Benchmark comparison is missing.');
  }
  for (const field of ['base', 'candidate']) requireSha(comparison[field], field);
  const explicit = comparison.kind === 'revisions';
  if (comparison.kind !== undefined && !explicit) throw new Error('Unknown benchmark comparison kind.');
  if (explicit) {
    if (!['smoke', 'full', 'master'].includes(comparison.profile)) throw new Error('Unknown benchmark profile.');
    requireSha(comparison.harness, 'harness');
  } else if (comparison.harness !== undefined || comparison.prBase !== undefined) {
    throw new Error('Only explicit revision comparisons declare a separate harness or PR base.');
  }

  if (comparison.pullRequest === null && (explicit || comparison.profile === 'master')) {
    if (comparison.head !== null || comparison.mergeParentsVerified !== false || (explicit && comparison.prBase !== null)) {
      throw new Error('Standalone benchmark comparison has PR comparison fields.');
    }
  } else {
    if ((!explicit && !['smoke', 'full'].includes(comparison.profile))
      || !['number', 'string'].includes(typeof comparison.pullRequest)
      || !/^[1-9]\d*$/.test(String(comparison.pullRequest))
      || !Number.isSafeInteger(Number(comparison.pullRequest))
      || comparison.mergeParentsVerified !== true) {
      throw new Error('PR benchmark comparison does not contain a verified merge comparison.');
    }
    requireSha(comparison.head, 'head');
    if (explicit) requireSha(comparison.prBase, 'PR base');
  }
  return comparison;
}

function comparisonsEqual(left, right) {
  if (left === null || right === null || typeof left !== 'object' || typeof right !== 'object') return false;
  return ['kind', 'profile', 'base', 'head', 'candidate', 'prBase'].every(field => left[field] === right[field])
    && Number(left.pullRequest) === Number(right.pullRequest)
    && comparisonHarness(left) === comparisonHarness(right)
    // Older trusted dispatch records omit this derived bit. Untrusted reports are validated first.
    && (left.mergeParentsVerified ?? (left.kind === undefined ? left.pullRequest !== null : undefined))
      === (right.mergeParentsVerified ?? (right.kind === undefined ? right.pullRequest !== null : undefined));
}

function requireSha(value, label) {
  if (typeof value !== 'string' || !shaPattern.test(value)) {
    throw new Error(`Benchmark ${label} must be a full commit SHA.`);
  }
}

module.exports = { comparisonHarness, comparisonsEqual, validateComparison };
