import { preprocessResource } from '@aurelia/plugin-conventions';
import { createMarkupReader, assertSuccess, assertFailure, prop } from './_shared';
import { nonConventionalOptions } from './without-convention.basic.spec';

describe('type-checking/without-convention.template-controller.repeat.range', function () {
  for (const [lang, extn] of [['TypeScript', 'ts'], ['JavaScript', 'js'], ['ESM', 'mjs']] as const) {
    const isTs = lang === 'TypeScript';

    describe(`range - language: ${lang}`, function () {
      it(`template controller - repeat range - pass - numeric property`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="item of prop">\${item.toExponential(2)}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${prop('prop', 'number', isTs)}
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertSuccess(entry, result.code);
      });

      it(`template controller - repeat range - pass - numeric literal`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="item of 10">\${item.toExponential(2)}</template>`;
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
          }, nonConventionalOptions);

        assertSuccess(entry, result.code);
      });

      it(`template controller - repeat range - fail - numeric property`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="item of 10">\${item.toexponential(2)}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${prop('prop', 'number', isTs)}
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertFailure(entry, result.code, [/Property 'toexponential' does not exist on type 'number'/]);
      });

      it(`template controller - repeat range - fail - numeric literal`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="item of 10">\${item.toexponential(2)}</template>`;
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
          }, nonConventionalOptions);

        assertFailure(entry, result.code, [/Property 'toexponential' does not exist on type 'number'/]);
      });

      it(`template controller - nested repeat range - pass - numeric property`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="item of prop"><template repeat.for="i of item">\${i.toExponential(2)}</template></template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${prop('prop', 'number', isTs)}
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertSuccess(entry, result.code);
      });

      it(`template controller - nested repeat range - pass - numeric literal`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="item of 10"><template repeat.for="i of item">\${i.toExponential(2)}</template></template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${prop('prop', 'number', isTs)}
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertSuccess(entry, result.code);
      });
    });
  }
});
