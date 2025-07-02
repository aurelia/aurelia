"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_conventions_1 = require("@aurelia/plugin-conventions");
const _shared_1 = require("./_shared");
const without_convention_basic_spec_1 = require("./without-convention.basic.spec");
describe('type-checking/without-convention.template-controller.repeat.set', function () {
    for (const [lang, extn] of [['TypeScript', 'ts'], ['JavaScript', 'js'], ['ESM', 'mjs']]) {
        const isTs = lang === 'TypeScript';
        describe(`set - language: ${lang}`, function () {
            it(`template controller - repeat primitive set - pass`, function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = `<template repeat.for="item of prop">\${item.toLowerCase()}</template>`;
                const result = (0, plugin_conventions_1.preprocessResource)({
                    path: entry,
                    contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'Set<string>', isTs)}
}
`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, without_convention_basic_spec_1.nonConventionalOptions);
                (0, _shared_1.assertSuccess)(entry, result.code);
            });
            it(`template controller - repeat primitive set - fail`, function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = `<template repeat.for="item of prop">\${item.tolowercase()}</template>`;
                const result = (0, plugin_conventions_1.preprocessResource)({
                    path: entry,
                    contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'Set<string>', isTs)}
}
`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, without_convention_basic_spec_1.nonConventionalOptions);
                (0, _shared_1.assertFailure)(entry, result.code, [/Property 'tolowercase' does not exist on type 'string'/]);
            });
            it(`template controller - repeat Set<object> - pass`, function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = `<template repeat.for="item of prop">\${item.x.toLowerCase()}</template>`;
                const result = (0, plugin_conventions_1.preprocessResource)({
                    path: entry,
                    contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'Set<Bar>', isTs)}
}

class Bar {
${(0, _shared_1.prop)('x', 'string', isTs)}
}
`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, without_convention_basic_spec_1.nonConventionalOptions);
                (0, _shared_1.assertSuccess)(entry, result.code);
            });
            it(`template controller - repeat Set<object> - fail`, function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = `<template repeat.for="item of prop">\${item.x.toLowerCase()}</template>`;
                const result = (0, plugin_conventions_1.preprocessResource)({
                    path: entry,
                    contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'Set<Bar>', isTs)}
}

class Bar {
${(0, _shared_1.prop)('x1', 'string', isTs)}
}
`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, without_convention_basic_spec_1.nonConventionalOptions);
                (0, _shared_1.assertFailure)(entry, result.code, [/Property 'x' does not exist on type '.*Bar.*'/]);
            });
            it(`template controller - repeat primitive set - pass - with value converter`, function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = `<template repeat.for="item of prop | identity">\${item.toLowerCase()}</template>`;
                const result = (0, plugin_conventions_1.preprocessResource)({
                    path: entry,
                    contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'Set<string>', isTs)}
}
`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, without_convention_basic_spec_1.nonConventionalOptions);
                (0, _shared_1.assertSuccess)(entry, result.code);
            });
        });
    }
});
//# sourceMappingURL=no-convention.template-controller.repeat.set.spec.js.map