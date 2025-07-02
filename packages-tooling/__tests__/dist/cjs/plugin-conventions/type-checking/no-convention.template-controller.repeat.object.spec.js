"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_conventions_1 = require("@aurelia/plugin-conventions");
const _shared_1 = require("./_shared");
const without_convention_basic_spec_1 = require("./without-convention.basic.spec");
describe('type-checking/without-convention.template-controller.repeat.object', function () {
    for (const [lang, extn] of [['TypeScript', 'ts'], ['JavaScript', 'js'], ['ESM', 'mjs']]) {
        const isTs = lang === 'TypeScript';
        // Note that as the VCs are not type-checked, the following tests are more-or-less hypothetical at this point.
        describe(`object - language: ${lang}`, function () {
            it(`template controller - repeat object - pass - keys`, function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = `<template repeat.for="key of prop | keys">\${prop[key]}</template>`;
                const result = (0, plugin_conventions_1.preprocessResource)({
                    path: entry,
                    contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', '{foo: string, bar: number}', isTs)}
}
`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, without_convention_basic_spec_1.nonConventionalOptions);
                (0, _shared_1.assertSuccess)(entry, result.code);
            });
            it(`template controller - repeat object - pass - values`, function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = `<template repeat.for="value of prop | values">\${value}</template>`;
                const result = (0, plugin_conventions_1.preprocessResource)({
                    path: entry,
                    contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', '{foo: string, bar: number}', isTs)}
}
`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, without_convention_basic_spec_1.nonConventionalOptions);
                (0, _shared_1.assertSuccess)(entry, result.code);
            });
            it(`template controller - repeat object - fail - keys`, function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = `<template repeat.for="key of prop | keys">\${prop[key1]}</template>`;
                const result = (0, plugin_conventions_1.preprocessResource)({
                    path: entry,
                    contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', '{foo: string, bar: number}', isTs)}
}
`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, without_convention_basic_spec_1.nonConventionalOptions);
                (0, _shared_1.assertFailure)(entry, result.code, [/Property '.*key1\d*' does not exist on type '.*Foo.*'/]);
            });
            it(`template controller - repeat object - fail - values`, function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = `<template repeat.for="value of prop | values">\${value1}</template>`;
                const result = (0, plugin_conventions_1.preprocessResource)({
                    path: entry,
                    contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', '{foo: string, bar: number}', isTs)}
}
`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, without_convention_basic_spec_1.nonConventionalOptions);
                (0, _shared_1.assertFailure)(entry, result.code, [/Property '.*value1\d*' does not exist on type '.*Foo.*'/]);
            });
        });
    }
});
//# sourceMappingURL=no-convention.template-controller.repeat.object.spec.js.map