import { preprocessResource } from '@aurelia/plugin-conventions';
import { createMarkupReader, assertSuccess, prop } from './_shared';
import { nonConventionalOptions } from './without-convention.basic.spec';

// this file used to contain tests for all the repeat types
// but it takes a lot of time in the pipeline to run
// so we split it up into multiple files, each with different type of collection
// example:
// array -> no-convention.template-controller.repeat.array.spec.ts
// set -> no-convention.template-controller.repeat.set.spec.ts
// map -> no-convention.template-controller.repeat.map.spec.ts
// range -> no-convention.template-controller.repeat.range.spec.ts
// and so on

describe('type-checking/without-convention.template-controller.repeat', function () {
  for (const [lang, extn] of [['TypeScript', 'ts'], ['JavaScript', 'js'], ['ESM', 'mjs']] as const) {
    const isTs = lang === 'TypeScript';

    it(`template controller - repeat FileList - pass`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = `<template repeat.for="file of files">\${file.name}</template>`;
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${prop('files', 'FileList', isTs)}
}
`,
          readFile: createMarkupReader(markupFile, markup),
        }, nonConventionalOptions);

      assertSuccess(entry, result.code);
    });

    it(`template controller - repeat - kitchen sink - pass`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = `<template repeat.for="map of prop">
  <template repeat.for="[key, value] of map">
    \${key.toUpperCase()}
    <template repeat.for="item of value">
      <template repeat.for="i of item">\${i.toExponential(2)}</template>
    </template>
  </template>
</template>`;
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${prop('prop', 'Map<string, Set<number>>[]' , isTs)}
}
`,
          readFile: createMarkupReader(markupFile, markup),
        }, nonConventionalOptions);

      assertSuccess(entry, result.code);
    });
  }
});
