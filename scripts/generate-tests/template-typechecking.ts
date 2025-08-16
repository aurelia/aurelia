import fs from 'node:fs';
import path from 'node:path';

import { createTypeCheckedTemplate } from '../../packages-tooling/plugin-conventions/src/template-typechecking';
import type { ClassMetadata, ClassMember } from '../../packages-tooling/plugin-conventions/src/preprocess-resource';

type MT = ClassMember['memberType'];
type AM = ClassMember['accessModifier'];

const m = (
  memberType: MT,
  name: string,
  dataType: string,
  accessModifier: AM = 'public',
  methodArgs: string[] = []
): ClassMember => ({
  name,
  memberType,
  accessModifier,
  dataType,
  methodArguments:
    memberType === 'method'
      ? methodArgs.map(s => {
          const [n, t] = s.split(':').map(x => x.trim());
          return { name: n, type: t, isOptional: false, isSpread: false };
        })
      : null,
});
const cls = (name: string, members: ClassMember[]): ClassMetadata => ({ name, members });

const Common = cls('Common', [
  m('property', 'firstName', 'string'),
  m('property', 'lastName', 'string'),
  m('property', 'items', 'Array<{ id: number; name: string }>()'),
  m('property', 'map', 'Map<string, { x: number; y: number }>()'),
  m('property', 'obj', 'Record<string, { deep: { v: boolean } }>()'),
  m('property', 'data', 'Promise<{ users: Array<{ id: number; email: string }> }>()'),
  m('method', 'doThing', '(x: number, y: string) => void'),
  { ...m('method', 'secret', '() => number'), accessModifier: 'private' },
]);

const Other = cls('Other', [
  m('property', 'status', '"idle" | "busy"'),
  m('property', 'items', 'Set<{ id: number; tags: string[] }>()'), // name collision on purpose
]);

const scenarios = [
  // Baseline / simple
  { label: '01_plain_interpolation_and_this', html: `<template>\${firstName} \${this.lastName}</template>`, classes: [Common] },

  // <let> and path indexing
  { label: '02_let_and_indexing', html: `<template><let deep.bind="obj['key'].deep"></let>\${deep.v}</template>`, classes: [Common] },

  // with-overlay and a call with primitive + non-primitive args
  { label: '03_with_and_call', html: `<template><div with.bind="obj['key']">\${deep.v}<button click.trigger="doThing(1, 'ok')"></button></div></template>`, classes: [Common] },

  // repeat over array with contextuals
  { label: '04_repeat_array', html: `<template><li repeat.for="it of items">\${$index} - \${it.name}</li></template>`, classes: [Common] },

  // promise then
  { label: '05_promise_then', html: `<template><div promise.bind="data"><template then="r">\${r.users[0].email}</template></div></template>`, classes: [Common] },

  // Map destructuring in repeat
  { label: '06_repeat_map_destructure', html: `<template><div repeat.for="[k, v] of map">[\${k}] (\${v.x}, \${v.y})</div></template>`, classes: [Common] },

  // keyed access with a local key (let)
  { label: '07_keyed_access_with_local_key', html: `<template><let key.bind="'key'"></let>\${obj[key].deep.v}</template>`, classes: [Common] },

  // nested: with > repeat (uses $parent) > promise.then; shows optional chaining + $index
  // TODO: turn `promise.bind="data"` into `promise.bind="$parent.data"` when the typechecker is updated to build a path for $parent in this case
  { label: '08_nested_with_repeat_promise_complex', html: `<template>
  <section with.bind="obj['key']">
    <article repeat.for="u of $parent.items">
      <div promise.bind="data">
        <template then="r">\${u.name}-\${r.users[$index]?.email}</template>
      </div>
    </article>
  </section>
</template>`, classes: [Common] },

  // backticks in static HTML to exercise escaping of outer template literal
  { label: '09_backticks_in_static_html', html: `<template><code>some \`inline\` code</code> \${firstName}</template>`, classes: [Common] },

  // union of component classes + non-public re-exposed; intentionally references Set.size vs Array.length mismatch
  { label: '10_union_nonpublic_reexposed', html: `<template>\${status} \${items.size} \${firstName}</template>`, classes: [Common, Other] },

  // <let to-binding-context> shadowing VM (override a VM prop)
  { label: '11_let_to_binding_context_shadow', html: `<template><let to-binding-context firstName.bind="'Overridden'"></let>\${firstName}</template>`, classes: [Common] },

  // repeat over object keys and index back into ACC (object repeat pattern)
  { label: '12_repeat_object_key_access', html: `<template><div repeat.for="k of obj">\${obj[k].deep.v}</div></template>`, classes: [Common] },

  // promise catch branch with error local
  { label: '13_promise_then_and_catch', html: `<template><div promise.bind="data"><template then="r">\${r.users[0].email}</template><template catch="e">\${e.message}</template></div></template>`, classes: [Common] },

  // with overlay should not affect "this." (VM access)
  { label: '14_this_vs_with_overlay', html: `<template><div with.bind="obj['key']">\${deep.v} \${this.firstName}</div></template>`, classes: [Common] },
];

const ROOT = path.resolve(__dirname, '../..');
const TESTS_ROOT = path.join(ROOT, 'packages-tooling/__tests__');

// plugin-scoped golden path in source (not compiled)
const SRC_GOLDEN = path.join(TESTS_ROOT, 'src/plugin-conventions/golden/typechecking');
const SRC_TS = path.join(SRC_GOLDEN, 'ts');
const SRC_JS = path.join(SRC_GOLDEN, 'js');

const MANIFEST = path.join(SRC_GOLDEN, 'manifest.json');

const ensure = (d: string) => fs.mkdirSync(d, { recursive: true });
const eol = (s: string) => s.replace(/\r\n/g, '\n') + (s.endsWith('\n') ? '' : '\n');
const header = (label: string) =>
  `/* AUTO-GENERATED: ${label}\n * Do not edit by hand. Update with: npm run gen:ttc-goldens\n */\n\n`;

function write(rel: string, contents: string) {
  const target = path.join(SRC_GOLDEN, rel);
  ensure(path.dirname(target));
  fs.writeFileSync(target, eol(contents), 'utf8');
}

(function main() {
  [SRC_TS, SRC_JS].forEach(ensure);

  const manifest = {
    note: 'Inputs used to generate template-typechecking emit goldens.',
    scenarios: scenarios.map(s => ({ label: s.label, html: s.html, classes: s.classes })),
  };
  fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  for (const s of scenarios) {
    const tsOut = createTypeCheckedTemplate(s.html, s.classes, false);
    const jsOut = createTypeCheckedTemplate(s.html, s.classes, true);
    write(`ts/${s.label}.ts`, header(s.label) + tsOut);
    write(`js/${s.label}.ts`, header(s.label) + jsOut);
  }

  console.log(`[ttc-goldens] wrote ${scenarios.length} scenarios to:\n  - ${SRC_GOLDEN}`);
})();
