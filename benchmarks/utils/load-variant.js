export function loadVariant(fixture) {
  const variant = new URLSearchParams(location.search).get('variant');
  if (variant !== 'base' && variant !== 'candidate') {
    throw new Error(`Expected benchmark variant "base" or "candidate", received "${variant}".`);
  }

  // Both expansions execute the same page; only this exact-source bundle URL differs.
  return import(`../results/variants/${variant}/${fixture}/app.js`);
}
