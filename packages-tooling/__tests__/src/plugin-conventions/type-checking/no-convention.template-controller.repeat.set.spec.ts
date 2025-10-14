import { preprocessResource } from '@aurelia/plugin-conventions';
import { createMarkupReader, assertSuccess, assertFailure, prop } from './_shared';
import { nonConventionalOptions } from './without-convention.basic.spec';

describe('type-checking/without-convention.template-controller.repeat.set', function () {
  for (const [lang, extn] of [['TypeScript', 'ts'], ['JavaScript', 'js'], ['ESM', 'mjs']] as const) {
    const isTs = lang === 'TypeScript';

    describe(`set - language: ${lang}`, function () {
      it(`template controller - repeat primitive set - pass`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="item of prop">\${item.toLowerCase()}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${prop('prop', 'Set<string>', isTs)}
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertSuccess(entry, result.code);
      });

      it(`template controller - repeat primitive set - fail`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="item of prop">\${item.tolowercase()}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${prop('prop', 'Set<string>', isTs)}
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertFailure(entry, result.code, [/Property 'tolowercase' does not exist on type 'string'/]);
      });

      it(`template controller - repeat Set<object> - pass`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="item of prop">\${item.x.toLowerCase()}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${prop('prop', 'Set<Bar>', isTs)}
}

class Bar {
${prop('x', 'string', isTs)}
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertSuccess(entry, result.code);
      });

      it(`template controller - repeat Set<object> - fail`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="item of prop">\${item.x.toLowerCase()}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${prop('prop', 'Set<Bar>', isTs)}
}

class Bar {
${prop('x1', 'string', isTs)}
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertFailure(entry, result.code, [/Property 'x' does not exist on type '.*Bar.*'/]);
      });

      it(`template controller - repeat primitive set - pass - with value converter`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="item of prop | identity">\${item.toLowerCase()}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${prop('prop', 'Set<string>', isTs)}
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertSuccess(entry, result.code);
      });
    });
  }
});
