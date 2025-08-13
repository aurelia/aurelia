import { preprocessResource } from '@aurelia/plugin-conventions';
import { assertFailure, assertSuccess, createMarkupReader, prop } from './_shared';
import { nonConventionalOptions } from './without-convention.basic.spec';

describe('type-checking/without-convention.template-controller.with', function () {
  for (const [lang, extn] of [['TypeScript', 'ts'], ['JavaScript', 'js'], ['ESM', 'mjs']] as const) {
    const isTs = lang === 'TypeScript';

    describe(`language: ${lang}`, function () {
      for (const withSyntax of ['with.bind', 'with'] as const) {
        it(`template controller - with (${withSyntax}) - pass`, function () {
          const entry = `entry.${extn}`;
          const markupFile = 'entry.html';
          const markup = `<template ${withSyntax}="person">\${name.toUpperCase()}</template>`;
          const result = preprocessResource({
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
          }, nonConventionalOptions);
          assertSuccess(entry, result.code);
        });
      }

      it('template controller - with - leak guard - fail', function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template with.bind="person">\${name.toUpperCase()}</template>\n\${name}`;
        const result = preprocessResource({
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
        }, nonConventionalOptions);
        assertFailure(entry, result.code, [/Property 'name' does not exist/]);
      });

      it('template controller - with - precedence (with > vm) - pass', function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template with.bind="person">\${name.toUpperCase()}</template>`;
        const result = preprocessResource({
          path: entry,
          contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';
@customElement({ name: 'foo', template })
export class Foo {
${prop('name', 'number', isTs)}
${prop('person', '{ name: string }', isTs)}
}
`,
          readFile: createMarkupReader(markupFile, markup),
        }, nonConventionalOptions);
        assertSuccess(entry, result.code);
      });

      it('template controller - with + let - precedence (let > with) - pass', function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template with.bind="person"><let name.bind="'x'"></let>\${name.toUpperCase()}</template>`;
        const result = preprocessResource({
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
        }, nonConventionalOptions);
        assertSuccess(entry, result.code);
      });

      it('template controller - with - this.x uses vm - fail', function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template with.bind="{ name: 'x' }">\${this.name.toUpperCase()}</template>`;
        const result = preprocessResource({
          path: entry,
          contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';
@customElement({ name: 'foo', template })
export class Foo {
${prop('name', 'number', isTs)}
}
`,
          readFile: createMarkupReader(markupFile, markup),
        }, nonConventionalOptions);
        assertFailure(entry, result.code, [/Property 'toUpperCase' does not exist on type 'number'|does not exist on type 'number'/]);
      });

      it('template controller - with - primitive rhs - fail', function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template with.bind="42">\${name}</template>`;
        const result = preprocessResource({
          path: entry,
          contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';
@customElement({ name: 'foo', template })
export class Foo {}
`,
          readFile: createMarkupReader(markupFile, markup),
        }, nonConventionalOptions);
        assertFailure(entry, result.code, [/Property 'name' does not exist/]);
      });

      it('template controller - with - nested - pass', function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `
<template with.bind="a">
  <template with.bind="b">
    \${name.toUpperCase()}
  </template>
</template>`;
        const result = preprocessResource({
          path: entry,
          contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';
@customElement({ name: 'foo', template })
export class Foo {
${prop('a', '{ name: number }', isTs)}
${prop('b', '{ name: string }', isTs)}
}
`,
          readFile: createMarkupReader(markupFile, markup),
        }, nonConventionalOptions);
        assertSuccess(entry, result.code);
      });

      it('template controller - with + repeat - scope - fail (outside)', function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `
<template repeat.for="item of items">
  <template with.bind="item">\${id.toFixed(2)}</template>
</template>
\${id}`;
        const result = preprocessResource({
          path: entry,
          contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';
@customElement({ name: 'foo', template })
export class Foo {
${prop('items', '{ id: number }[]', isTs)}
}
`,
          readFile: createMarkupReader(markupFile, markup),
        }, nonConventionalOptions);
        assertFailure(entry, result.code, [/Property 'id' does not exist/]);
      });

    });
  }
});
