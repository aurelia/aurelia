import fs from 'node:fs';
import path from 'node:path';

import { createScopeSnapshot, createHtmlTypeCheckedTemplate } from '../../packages-tooling/plugin-conventions/src/template-typechecking';
type AccessModifier = 'public' | 'protected' | 'private';
type MemberType = 'property' | 'method' | 'accessor';

export interface MethodArgument {
  name: string;
  type: string;
  isOptional: boolean;
  isSpread: boolean;
}

export interface ClassMember {
  accessModifier: AccessModifier;
  memberType: MemberType;
  name: string;
  dataType: string;
  methodArguments: MethodArgument[] | null;
}

export interface ClassMetadata {
  name: string;
  members: ClassMember[];
}

const m = (
  memberType: ClassMember['memberType'],
  name: string,
  dataType: string,
  accessModifier: ClassMember['accessModifier'] = 'public',
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

// --- Classes / VM shapes ---------------------------------------------------------------
// Slightly expanded to support wider scenarios while staying compact and readable.

const Common = cls('Common', [
  m('property', 'firstName', 'string'),
  m('property', 'lastName', 'string'),
  m('property', 'items', 'Array<{ id: number; name: string }>'),
  m('property', 'map', 'Map<string, { x: number; y: number }>'),
  m('property', 'obj', 'Record<string, { deep: { v: boolean } }>'),
  m('property', 'deep', '{ v: boolean }'),                  // used for $this overlay checks
  m('property', 'data', 'Promise<{ users: Array<{ id: number; email: string }> }>'),
  m('property', 'kind', '"a" | "b" | "c"'),                 // enables switch scenarios without spurious errors
  m('property', 'elementId', 'string'),                     // for label/for mapping tests
  m('property', 'greeting', 'string'),                      // for contenteditable/textContent tests
  m('property', 'composeVm', 'unknown'),                    // for au-compose boundary smoke test
  m('method', 'doThing', '(x: number, y: string) => void'),
  { ...m('method', 'secret', '() => number'), accessModifier: 'private' },
]);

const Other = cls('Other', [
  m('property', 'status', '"idle" | "busy"'),
  // Intentional name collision with Common.items
  m('property', 'items', 'Set<{ id: number; tags: string[] }>'), // (fixed type spelling)
]);

const Form = cls('Form', [
  m('property', 'flag', 'boolean'),                // checkbox/radio two-way default refinement
  m('property', 'selected', 'string[]'),           // <select multiple> value binding
]);

const Refs = cls('Refs', [
  m('property', 'el', 'HTMLElement | null'),
  m('property', 'vmRef', 'unknown'),
]);

const Accessors = cls('Accessors', [
  m('accessor', 'fullName', 'string'),             // accessor member type coverage
]);

// --- Scenarios -------------------------------------------------------------------------
// Each has label, html, classes, and a brief comment on purpose/coverage.

const scenarios = [
  // Baseline / simple
  {
    label: '01_plain_interpolation_and_this',
    html: `<template>\${firstName} \${this.lastName}</template>`,
    classes: [Common],
  }, // simple scope access + explicit `this.` rendering path

  // <let> and path indexing
  {
    label: '02_let_and_indexing',
    html: `<template><let deep.bind="obj['key'].deep"></let>\${deep.v}</template>`,
    classes: [Common],
  }, // <let> creates locals from an indexed path; overlay uses the let local

  // with-overlay and a call with primitive + non-primitive args
  {
    label: '03_with_and_call',
    html: `<template><div with.bind="obj['key']">\${deep.v}<button click.trigger="doThing(1, 'ok')"></button></div></template>`,
    classes: [Common],
  }, // with overlay sets $this; event handler lambda + callsite args exercise expression printer

  // repeat over array with contextuals
  {
    label: '04_repeat_array',
    html: `<template><li repeat.for="it of items">\${$index} - \${it.name}</li></template>`,
    classes: [Common],
  }, // repeat locals + contextual vars ($index) and collection element typing

  // promise then
  {
    label: '05_promise_then',
    html: `<template><div promise.bind="data"><template then="r">\${r.users[0].email}</template></div></template>`,
    classes: [Common],
  }, // promise overlay + then alias typed via Awaited<T>

  // Map destructuring in repeat
  {
    label: '06_repeat_map_destructure',
    html: `<template><div repeat.for="[k, v] of map">[\${k}] (\${v.x}, \${v.y})</div></template>`,
    classes: [Common],
  }, // shallow array destructuring of Map entry pairs

  // keyed access with a local key (let)
  {
    label: '07_keyed_access_with_local_key',
    html: `<template><let key.bind="'key'"></let>\${obj[key].deep.v}</template>`,
    classes: [Common],
  }, // dynamic key from let local; bracket notation in printer

  // nested: with > repeat ($parent) > promise.then; optional chaining + $index
  {
    label: '08_nested_with_repeat_promise_complex',
    html: `<template>
      <section with.bind="obj['key']">
        <article repeat.for="u of $parent.items">
          <div promise.bind="data">
            <template then="r">\${u.name}-\${r.users[$index]?.email}</template>
          </div>
        </article>
      </section>
    </template>`,
    classes: [Common],
  }, // multi-frame binding: with (overlay), repeat (reuse), promise (overlay) + ?. optional chaining

  // backticks in static HTML to exercise escaping of outer template literal
  {
    label: '09_backticks_in_static_html',
    html: `<template><code>some \`inline\` code</code> \${firstName}</template>`,
    classes: [Common],
  }, // HTML contains backticks; ensures overlay string escaping remains correct

  // union of component classes + non-public re-exposed; Set.size vs Array.length mismatch
  {
    label: '10_union_nonpublic_reexposed',
    html: `<template>\${status} \${items.size} \${firstName}</template>`,
    classes: [Common, Other],
  }, // VM union (Common | Other); name collision; Set vs Array exercises type distinctions

  // <let to-binding-context> shadowing VM (override a VM prop)
  {
    label: '11_let_to_binding_context_shadow',
    html: `<template><let to-binding-context firstName.bind="'Overridden'"></let>\${firstName}
    </template>`,
    classes: [Common],
  }, // to-binding-context should not affect *read* lane; typing stays on read overlay

  // repeat over object keys and index back into ACC (object repeat pattern)
  {
    label: '12_repeat_object_key_access',
    html: `<template><div repeat.for="k of obj">\${obj[k].deep.v}</div></template>`,
    classes: [Common],
  }, // object-key repeat pattern; bracket re-index back into record

  // promise catch branch with error local
  {
    label: '13_promise_then_and_catch',
    html: `<template>
      <div promise.bind="data"><template then="r">\${r.users[0].email}</template><template catch="e">\${e.message}</template></div>
    </template>`,
    classes: [Common],
  }, // both then/catch branches; catch alias is intentionally unknown-typed in MVP

  // with overlay should not affect "this." (VM access)
  {
    label: '14_this_vs_with_overlay',
    html: `<template><div with.bind="obj['key']">\${deep.v} \${this.firstName}</div></template>`,
    classes: [Common],
  }, // ensures `this.` keeps pointing to VM when under overlay

  {
    label: '15_with_overlay_$this_and_$parent',
    html: `<template>
      <div with.bind="deep">
        \${$this.v} \${$parent.firstName} \${this.firstName}
      </div>
    </template>`,
    classes: [Common],
  }, // explicit $this and $parent usage together with this.

  {
    label: '16_value_converter_and_behavior_chaining',
    html: `<template>\${(firstName + ' ' + lastName) | vc1:(1 + 2) | vc2 & bb1:deep.v & bb2}</template>`,
    classes: [Common],
  }, // converter + behavior chains are transparent to TTC; printer strips wrappers

  {
    label: '17_repeat_number_contextuals',
    html: `<template>
      <div repeat.for="i of 3">
        i=\${i}
        idx=\${$index}
        len=\${$length}
        first=\${$first}
        last=\${$last}
        even=\${$even}
        odd=\${$odd}
        mid=\${$middle}
      </div>
    </template>`,
    classes: [Common],
  }, // numeric repeat; all contextuals present and correctly typed

  {
    label: '18_switch_no_scope_no_narrowing',
    html: `<template>
      <div switch.bind="kind">
        <template case.bind="'a'">\${firstName}</template>
        <template case.bind="'b'">\${lastName}</template>
        <template default-case>\${firstName}</template>
      </div>
    </template>`,
    classes: [Common],
  }, // switch reuses scope; no overlay; no narrowing expected at TTC stage

  {
    label: '19_portal_uses_parent_scope',
    html: `<template>
      <template portal>
        \${firstName} \${this.lastName} \${$parent && $parent.firstName}
      </template>
    </template>`,
    classes: [Common],
  }, // portal reuses parent frame; $parent hop remains valid at site

  {
    label: '20_let_shadow_vs_binding_context',
    html: `<template>
      <let firstName.bind="'X'"></let>
      <div>\${firstName} \${this.firstName}</div>
      <let to-binding-context firstName.bind="'Y'"></let>
      <div>\${firstName} \${this.firstName}</div>
    </template>`,
    classes: [Common],
  }, // contrasts shadowing (local) vs binding-context override; read lane remains lexical

  // -------------------------------------------------------------------------------------
  // Added breadth & depth
  // -------------------------------------------------------------------------------------

  {
    label: '21_attr_preserve_aria_data',
    html: `<template><div aria-label="\${firstName}" data-test="\${lastName}"></div></template>`,
    classes: [Common],
  }, // attribute interpolation to preserved prefixes should *not* map to props (attr-only target)

  {
    label: '22_label_for_normalization',
    html: `<template><label for.bind="elementId">\${firstName}</label></template>`,
    classes: [Common],
  }, // attr→prop normalization: `for` → `htmlFor` (per-tag/prioritized over global)

  {
    label: '23_style_prop_vs_style_attr',
    html: `<template>
      <div style.background-color.bind="'red'"></div>
      <div style="\${firstName}"></div>
    </template>`,
    classes: [Common],
  }, // `.style` command hits style object typing; `style="…"` interpolation stays string attribute

  {
    label: '24_class_command_vs_attr_interp',
    html: `<template>
      <div class.bind="'a b'"></div>
      <div class="x-\${firstName} y"></div>
    </template>`,
    classes: [Common],
  }, // `.class` command vs attribute interpolation on `class`

  {
    label: '25_colon_bind_shorthand',
    html: `<template><input :value="firstName" :disabled="false" /></template>`,
    classes: [Common],
  }, // `:prop` shorthand maps to toView property bindings (parser shorthand coverage)

  {
    label: '26_events_trigger_capture_modifier',
    html: `<template>
      <input @keydown.once="doThing(1, 'k')" />
      <button click.capture="doThing(2, 'cap')"></button>
    </template>`,
    classes: [Common],
  }, // `@event[:modifier]` and `.capture/.trigger` event syntax + event type hints

  {
    label: '27_ref_binding_element_and_vm',
    html: `<template>
      <div ref="el"></div>
      <au-compose ref="vmRef"></au-compose>
    </template>`,
    classes: [Refs],
  }, // `ref` expression sites map to frame; element vs component ref shapes are analysis-time

  {
    label: '28_input_checkbox_two_way_refinement',
    html: `<template><input type="checkbox" checked.bind="flag" /></template>`,
    classes: [Form],
  }, // two-way default refined by static type=checkbox (linker hint parity)

  {
    label: '29_contenteditable_conditional_two_way',
    html: `<template><div contenteditable="true" textcontent.bind="greeting"></div></template>`,
    classes: [Common],
  }, // conditional two-way case for textContent when [contenteditable] (linker hint for analysis)

  {
    label: '30_select_multiple_value_array',
    html: `<template>
      <select multiple value.bind="selected">
        <option repeat.for="it of items" value.bind="it.name">\${it.name}</option>
      </select>
    </template>`,
    classes: [Common, Form],
  }, // <select multiple> → value as string[]; repeat inside select to exercise nested scopes

  {
    label: '31_switch_inside_repeat_case_expr',
    html: `<template>
      <div repeat.for="u of items">
        <div switch.bind="u.id % 2">
          <template case.bind="0">\${u.name}-even</template>
          <template case.bind="1">\${u.name}-odd</template>
        </div>
      </div>
    </template>`,
    classes: [Common],
  }, // switch reuse inside repeat loop; case expressions evaluated in outer frame

  {
    label: '32_deep_$parent_chain_two_hops',
    html: `<template>
      <section with.bind="obj['key']">
        <ul repeat.for="it of items">
          <li>\${$parent.$parent.firstName} - \${it.name}</li>
        </ul>
      </section>
    </template>`,
    classes: [Common],
  }, // verifies printer path for `$parent.$parent` chains; maps to correct frames

  {
    label: '33_let_value_template_interpolation',
    html: `<template>
      <let greet.bind="\`Hi \${firstName}\`"></let>
      <span>\${greet}</span>
    </template>`,
    classes: [Common],
  }, // <let> value is a template expression; we record first embedded expr id for typing

  {
    label: '34_repeat_duplicate_local_diagnostic',
    html: `<template><div repeat.for="[a, a] of items">\${a}</div></template>`,
    classes: [Common],
  }, // duplicate local name in same frame should surface AU1202 from ScopeGraph

  {
    label: '35_promise_then_default_alias',
    html: `<template>
      <div promise.bind="data">
        <template then>\${then.users.length}</template>
      </div>
    </template>`,
    classes: [Common],
  }, // branch alias omitted value → default alias name 'then' is materialized

  {
    label: '36_switch_default_only',
    html: `<template>
      <div switch.bind="items.length">
        <template default-case>\${firstName}-fallback</template>
      </div>
    </template>`,
    classes: [Common],
  }, // switch with only default-case; reuse scope; no case prop

  {
    label: '37_portal_inside_with_reuse_scope',
    html: `<template>
      <div with.bind="deep">
        <template portal>\${$parent.firstName}:\${$this.v}</template>
      </div>
    </template>`,
    classes: [Common],
  }, // portal content evaluates in parent scope even when authored under with overlay

  {
    label: '38_au_compose_boundary_smoke',
    html: `<template>
      <au-compose view-model.bind="composeVm" model.bind="obj"></au-compose>
    </template>`,
    classes: [Common],
  }, // custom element boundary present; bindings still type-check on VM side (composeVm/obj)

  {
    label: '39_attr_command_explicit',
    html: `<template><div attr.data-foo.bind="firstName"></div></template>`,
    classes: [Common],
  }, // `.attr` command forces attribute binding for arbitrary attribute names

  {
    label: '40_accessor_member_usage',
    html: `<template>\${fullName}</template>`,
    classes: [Accessors],
  }, // accessor-only member (no callable args) is treated like a readable property
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

function renderSourceHeader(html: string, classes: ClassMetadata[]) {
  const lines: string[] = [];
  lines.push('// === SOURCE ===');
  lines.push('// HTML:');
  for (const l of html.replace(/\r\n/g, '\n').split('\n')) {
    lines.push(`// ${l}`);
  }
  lines.push('//');
  lines.push('// CLASSES:');
  lines.push('export {}'); // ensure the file is treated as a module
  for (const c of classes) {
    lines.push(`class ${c.name} {`);
    for (const mem of c.members) {
      lines.push(` ${mem.accessModifier} ${mem.name}: ${mem.dataType}`);
    }
    lines.push('}');
    lines.push('');
  }
  lines.push('// === EMIT ===');
  lines.push('');
  return lines.join('\n');
}

function write(rel: string, contents: string) {
  const target = path.join(SRC_GOLDEN, rel);
  ensure(path.dirname(target));
  fs.writeFileSync(target, eol(contents), 'utf8');
}

const prependJs = `// @ts-check
/**
 * @template TCollection
 * @typedef {TCollection extends Array<infer TElement> ? TElement : TCollection extends Set<infer TElement> ? TElement : TCollection extends Map<infer TKey, infer TValue> ? [TKey, TValue] : TCollection extends number ? number : TCollection extends object ? any : never} CollectionElement
 */
/**
 * @template T
 * @param {(o: T) => unknown} _fn
 * @returns {void}
 */
function __au$access(_fn) { /* no-op */ }`;

const prependTs = `// @ts-check
type CollectionElement<TCollection> = TCollection extends Array<infer TElement> ? TElement : TCollection extends Set<infer TElement> ? TElement : TCollection extends Map<infer TKey, infer TValue> ? [TKey, TValue] : TCollection extends number ? number : TCollection extends object ? any : never;
/* @internal */
const __au$access = <T>(_fn: (o: T) => unknown): void => { /* no-op */ };
`;

(function main() {
  [SRC_TS, SRC_JS].forEach(ensure);

  const manifest = {
    note: 'Inputs used to generate template-typechecking emit goldens.',
    scenarios: scenarios.map(s => ({ label: s.label, html: s.html, classes: s.classes })),
  };
  fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  for (const s of scenarios) {
    const tsOut = createHtmlTypeCheckedTemplate(s.html, s.classes, false);
    const jsOut = createHtmlTypeCheckedTemplate(s.html, s.classes, true);
    const jsonOut = createScopeSnapshot(s.html);

    const srcHeader = renderSourceHeader(s.html, s.classes);

    write(`ts/${s.label}.ts`, header(s.label) + srcHeader + prependTs + tsOut);
    write(`js/${s.label}.ts`, header(s.label) + srcHeader + prependJs + jsOut);
    write(`json/${s.label}.json`, jsonOut);
  }

  console.log(`[ttc-goldens] wrote ${scenarios.length} scenarios to:\n  - ${SRC_GOLDEN}`);
})();
