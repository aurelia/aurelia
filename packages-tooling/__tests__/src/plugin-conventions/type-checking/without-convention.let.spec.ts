import { preprocessResource } from '@aurelia/plugin-conventions';
import { assertFailure, assertSuccess, createMarkupReader, prop } from './_shared';
import { nonConventionalOptions } from './without-convention.basic.spec';

describe('type-checking/without-convention.let', function () {
  for (const [lang, extn] of [['TypeScript', 'ts'], ['JavaScript', 'js'], ['ESM', 'mjs']] as const) {
    const isTs = lang === 'TypeScript';

    it(`basic pass - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = `<let a.bind="person.name"></let>\n\${a.toUpperCase()}`;
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';
@customElement({ name: 'foo', template })
export class Foo {
${prop('person', '{ name: string }', isTs)}
}
`,
          readFile: createMarkupReader(markupFile, markup),
        },
        nonConventionalOptions,
      );
      assertSuccess(entry, result.code);
    });

    it(`basic fail - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = `<let a.bind="person.name"></let>\n\${a.nonExistent}`;
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';
@customElement({ name: 'foo', template })
export class Foo {
${prop('person', '{ name: string }', isTs)}
}
`,
          readFile: createMarkupReader(markupFile, markup),
        },
        nonConventionalOptions,
      );
      assertFailure(entry, result.code, [/Property 'nonExistent' does not exist on type 'string'/]);
    });

    it(`multiple lets & override - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = `<let v.bind="1"></let>\n<let v.bind="'hi'"></let>\n\${v.toUpperCase()}`;
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';
@customElement({ name: 'foo', template })
export class Foo {}
`,
          readFile: createMarkupReader(markupFile, markup),
        },
        nonConventionalOptions,
      );
      assertSuccess(entry, result.code);
    });

    it(`to-binding-context overlay + collision - pass - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      // VM has x: string, let x.bind=1 (to-binding-context) should override so .toFixed exists
      const markup = `<let x.bind="1" to-binding-context></let>\n\${x.toFixed(2)}`;
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';
@customElement({ name: 'foo', template })
export class Foo {
${prop('x', 'string', isTs)}
}
`,
          readFile: createMarkupReader(markupFile, markup),
        },
        nonConventionalOptions,
      );
      assertSuccess(entry, result.code);
    });

    it(`command variants (to-view/two-way) - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = `<let a.to-view="person.name"></let>\n<let b.two-way="'ok'"></let>\n\${a.toUpperCase()} \${b.toUpperCase()}`;
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';
@customElement({ name: 'foo', template })
export class Foo {
${prop('person', '{ name: string }', isTs)}
}
`,
          readFile: createMarkupReader(markupFile, markup),
        },
        nonConventionalOptions,
      );
      assertSuccess(entry, result.code);
    });

    it(`duplicate declarations in one <let> (last wins) - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      // a.bind first (number), then a.one-time string; last one should win -> toUpperCase ok
      const markup = `<let a.bind="1" a.one-time="'hi'"></let>\n\${a.toUpperCase()}`;
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';
@customElement({ name: 'foo', template })
export class Foo {}
`,
          readFile: createMarkupReader(markupFile, markup),
        },
        nonConventionalOptions,
      );
      assertSuccess(entry, result.code);
    });

    it(`visibility: inside repeat - pass - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = `<template repeat.for="p of people">
  <let upper.bind="p.name.toUpperCase()"></let>
  \${upper}
</template>`;
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';
@customElement({ name: 'foo', template })
export class Foo {
${prop('people', '{ name: string }[]', isTs)}
}
`,
          readFile: createMarkupReader(markupFile, markup),
        },
        nonConventionalOptions,
      );
      assertSuccess(entry, result.code);
    });

    it(`visibility: let inside repeat does not leak - fail - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = `<template repeat.for="i of 3"><let a.bind="i"></let></template>\n\${a}`;
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';
@customElement({ name: 'foo', template })
export class Foo {}
`,
          readFile: createMarkupReader(markupFile, markup),
        },
        nonConventionalOptions,
      );
      assertFailure(entry, result.code, [/Property 'a' does not exist on type '.*Foo.*'/]);
    });

    it(`visibility: before if.bind is visible inside branch - pass - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = `<let v.bind="person.name"></let>\n<template if.bind="true">\${v.toUpperCase()}</template>`;
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';
@customElement({ name: 'foo', template })
export class Foo {
${prop('person', '{ name: string }', isTs)}
}
`,
          readFile: createMarkupReader(markupFile, markup),
        },
        nonConventionalOptions,
      );
      assertSuccess(entry, result.code);
    });

    it(`visibility: let inside if-branch does not leak - fail - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = `<template if.bind="true"><let z.bind="1"></let></template>\n\${z}`;
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';
@customElement({ name: 'foo', template })
export class Foo {}
`,
          readFile: createMarkupReader(markupFile, markup),
        },
        nonConventionalOptions,
      );
      assertFailure(entry, result.code, [/Property 'z' does not exist on type '.*Foo.*'/]);
    });
  }
});
