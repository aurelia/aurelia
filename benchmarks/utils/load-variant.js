export function loadVariant(fixture) {
  const parameters = new URLSearchParams(location.search);
  const variant = parameters.get('variant');
  if (variant !== 'base' && variant !== 'candidate') {
    throw new Error(`Expected benchmark variant "base" or "candidate", received "${variant}".`);
  }

  if (parameters.get('live') === 'true') {
    return import(`../live-results/active/${variant}/${fixture}/app.js`);
  }

  // Both expansions execute the same page; only this exact-source bundle URL differs.
  return import(`../results/variants/${variant}/${fixture}/app.js`);
}
