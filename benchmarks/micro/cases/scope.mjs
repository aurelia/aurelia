import { compareVariants } from '../measure.mjs';

const iterations = 1_000_000;

export function run(baseModule, candidateModule) {
  return [0, 1, 2].map(depth => ({
    name: `binding-context hit, depth ${depth}`,
    unit: 'ns/op',
    ...compareVariants(
      () => createPool(baseModule.Scope, depth),
      () => createPool(candidateModule.Scope, depth),
      runLookup,
      { scale: 1_000_000 / iterations },
    ),
  }));
}

function createPool(Scope, depth) {
  const entries = Array.from({ length: 64 }, (_, index) => {
    const name = `value${index & 7}`;
    let scope = Scope.create({ [name]: index + 1 }, {});
    for (let i = 0; i < depth; ++i) {
      scope = Scope.fromParent(scope, {}, {});
    }
    return { name, scope };
  });
  return { Scope, entries };
}

function runLookup({ Scope, entries }) {
  let result = 0;
  for (let i = 0; i < iterations; ++i) {
    const entry = entries[i & 63];
    result += Scope.getContext(entry.scope, entry.name, 0)[entry.name];
  }
  return result;
}
