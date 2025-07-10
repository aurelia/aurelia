"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_conventions_1 = require("@aurelia/plugin-conventions");
const _shared_1 = require("./_shared");
const without_convention_basic_spec_1 = require("./without-convention.basic.spec");
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
    for (const [lang, extn] of [['TypeScript', 'ts'], ['JavaScript', 'js'], ['ESM', 'mjs']]) {
        const isTs = lang === 'TypeScript';
        it(`template controller - repeat FileList - pass`, function () {
            const entry = `entry.${extn}`;
            const markupFile = 'entry.html';
            const markup = `<template repeat.for="file of files">\${file.name}</template>`;
            const result = (0, plugin_conventions_1.preprocessResource)({
                path: entry,
                contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('files', 'FileList', isTs)}
}
`,
                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
            }, without_convention_basic_spec_1.nonConventionalOptions);
            (0, _shared_1.assertSuccess)(entry, result.code);
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
            const result = (0, plugin_conventions_1.preprocessResource)({
                path: entry,
                contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'Map<string, Set<number>>[]', isTs)}
}
`,
                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
            }, without_convention_basic_spec_1.nonConventionalOptions);
            (0, _shared_1.assertSuccess)(entry, result.code);
        });
    }
});
//# sourceMappingURL=without-convention.template-controller.repeat.spec.js.map