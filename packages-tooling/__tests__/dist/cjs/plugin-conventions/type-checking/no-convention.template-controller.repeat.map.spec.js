"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_conventions_1 = require("@aurelia/plugin-conventions");
const _shared_1 = require("./_shared");
const without_convention_basic_spec_1 = require("./without-convention.basic.spec");
describe('type-checking/without-convention.template-controller.repeat.map', function () {
    for (const [lang, extn] of [['TypeScript', 'ts'], ['JavaScript', 'js'], ['ESM', 'mjs']]) {
        const isTs = lang === 'TypeScript';
        describe(`map - language: ${lang}`, function () {
            it(`template controller - repeat primitive map - pass`, function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = `<template repeat.for="[key, value] of prop">\${key.toLowerCase()} - \${value}</template>`;
                const result = (0, plugin_conventions_1.preprocessResource)({
                    path: entry,
                    contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'Map<string, number>', isTs)}
}
`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, without_convention_basic_spec_1.nonConventionalOptions);
                (0, _shared_1.assertSuccess)(entry, result.code);
            });
            it(`template controller - repeat primitive map - fail - incorrect key declaration`, function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = `<template repeat.for="[key, value] of prop">\${k.toLowerCase()} - \${value}</template>`;
                const result = (0, plugin_conventions_1.preprocessResource)({
                    path: entry,
                    contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'Map<string, number>', isTs)}
}
`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, without_convention_basic_spec_1.nonConventionalOptions);
                (0, _shared_1.assertFailure)(entry, result.code, [/Property 'k' does not exist on type '.*Foo.*'/]);
            });
            it(`template controller - repeat primitive map - fail - incorrect value declaration`, function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = `<template repeat.for="[key, value] of prop">\${key.toLowerCase()} - \${v}</template>`;
                const result = (0, plugin_conventions_1.preprocessResource)({
                    path: entry,
                    contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'Map<string, number>', isTs)}
}
`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, without_convention_basic_spec_1.nonConventionalOptions);
                (0, _shared_1.assertFailure)(entry, result.code, [/Property 'v' does not exist on type '.*Foo.*'/]);
            });
            it(`template controller - repeat primitive map - fail - incorrect key usage`, function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = `<template repeat.for="[key, value] of prop">\${key.tolowercase()} - \${value}</template>`;
                const result = (0, plugin_conventions_1.preprocessResource)({
                    path: entry,
                    contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'Map<string, number>', isTs)}
}
`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, without_convention_basic_spec_1.nonConventionalOptions);
                (0, _shared_1.assertFailure)(entry, result.code, [/Property 'tolowercase' does not exist on type 'string'/]);
            });
            it(`template controller - repeat primitive map - fail - incorrect value usage`, function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = `<template repeat.for="[key, value] of prop">\${key.toLowerCase()} - \${value.toexponential(2)}</template>`;
                const result = (0, plugin_conventions_1.preprocessResource)({
                    path: entry,
                    contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'Map<string, number>', isTs)}
}
`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, without_convention_basic_spec_1.nonConventionalOptions);
                (0, _shared_1.assertFailure)(entry, result.code, [/Property 'toexponential' does not exist on type 'number'/]);
            });
            it(`template controller - repeat primitive map - pass - with value-converter`, function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = `<template repeat.for="[key, value] of prop | identity">\${key.toLowerCase()} - \${value}</template>`;
                const result = (0, plugin_conventions_1.preprocessResource)({
                    path: entry,
                    contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'Map<string, number>', isTs)}
}
`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, without_convention_basic_spec_1.nonConventionalOptions);
                (0, _shared_1.assertSuccess)(entry, result.code);
            });
            it(`template controller - repeat object map - pass`, function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = `<template repeat.for="[key, value] of prop">(\${key.x},\${key.y}) - (\${value.a},\${value.b})</template>`;
                const result = (0, plugin_conventions_1.preprocessResource)({
                    path: entry,
                    contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'Map<Key, Value>', isTs)}
}

class Key {
${(0, _shared_1.prop)('x', 'number', isTs)}
${(0, _shared_1.prop)('y', 'number', isTs)}
}

class Value {
${(0, _shared_1.prop)('a', 'string', isTs)}
${(0, _shared_1.prop)('b', 'string', isTs)}
}`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, without_convention_basic_spec_1.nonConventionalOptions);
                (0, _shared_1.assertSuccess)(entry, result.code);
            });
            it(`template controller - repeat object map - fail - incorrect key usage`, function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = `<template repeat.for="[key, value] of prop">(\${key.x},\${key.z}) - (\${value.a},\${value.b})</template>`;
                const result = (0, plugin_conventions_1.preprocessResource)({
                    path: entry,
                    contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'Map<Key, Value>', isTs)}
}

class Key {
${(0, _shared_1.prop)('x', 'number', isTs)}
${(0, _shared_1.prop)('y', 'number', isTs)}
}

class Value {
${(0, _shared_1.prop)('a', 'string', isTs)}
${(0, _shared_1.prop)('b', 'string', isTs)}
}`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, without_convention_basic_spec_1.nonConventionalOptions);
                (0, _shared_1.assertFailure)(entry, result.code, [/Property 'z' does not exist on type 'Key'/]);
            });
            it(`template controller - repeat object map - fail - incorrect value usage`, function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = `<template repeat.for="[key, value] of prop">(\${key.x},\${key.y}) - (\${value.a},\${value.c})</template>`;
                const result = (0, plugin_conventions_1.preprocessResource)({
                    path: entry,
                    contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'Map<Key, Value>', isTs)}
}

class Key {
${(0, _shared_1.prop)('x', 'number', isTs)}
${(0, _shared_1.prop)('y', 'number', isTs)}
}

class Value {
${(0, _shared_1.prop)('a', 'string', isTs)}
${(0, _shared_1.prop)('b', 'string', isTs)}
}`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, without_convention_basic_spec_1.nonConventionalOptions);
                (0, _shared_1.assertFailure)(entry, result.code, [/Property 'c' does not exist on type 'Value'/]);
            });
            it(`template controller - nested repeat object map - pass`, function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = `<template repeat.for="[sl, v] of prop">(\${sl.x},\${sl.y}) <template repeat.for="[sh, lm] of v">(\${sh.m},\${sh.n}) - (\${lm.a},\${lm.b})</template></template>`;
                const result = (0, plugin_conventions_1.preprocessResource)({
                    path: entry,
                    contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'Map<Salt, Map<Shot, Lime>>', isTs)}
}

class Salt {
${(0, _shared_1.prop)('x', 'number', isTs)}

${(0, _shared_1.prop)('y', 'number', isTs)}
}

class Lime {
${(0, _shared_1.prop)('a', 'string', isTs)}

${(0, _shared_1.prop)('b', 'string', isTs)}
}

class Shot {
${(0, _shared_1.prop)('m', 'string', isTs)}

${(0, _shared_1.prop)('n', 'string', isTs)}
}`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, without_convention_basic_spec_1.nonConventionalOptions);
                (0, _shared_1.assertSuccess)(entry, result.code);
            });
            it(`template controller - nested repeat object map - fail - incorrect declaration`, function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = `<template repeat.for="[sl, v] of prop">(\${sl.x},\${sl.y}) <template repeat.for="[sh, lm] of v1">(\${sh.m},\${sh.n}) - (\${lm.a},\${lm.b})</template></template>`;
                const result = (0, plugin_conventions_1.preprocessResource)({
                    path: entry,
                    contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'Map<Salt, Map<Shot, Lime>>', isTs)}
}

class Salt {
${(0, _shared_1.prop)('x', 'number', isTs)}

${(0, _shared_1.prop)('y', 'number', isTs)}
}

class Lime {
${(0, _shared_1.prop)('a', 'string', isTs)}

${(0, _shared_1.prop)('b', 'string', isTs)}
}

class Shot {
${(0, _shared_1.prop)('m', 'string', isTs)}

${(0, _shared_1.prop)('n', 'string', isTs)}
}`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, without_convention_basic_spec_1.nonConventionalOptions);
                (0, _shared_1.assertFailure)(entry, result.code, [/Property '.*v1\d+' does not exist on type '.*Foo.*'/], undefined, true);
            });
            it(`template controller - nested repeat object map - fail - incorrect usage`, function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = `<template repeat.for="[sl, v] of prop">(\${sl.x},\${sl.y}) <template repeat.for="[sh, lm] of v">(\${sh.m},\${sh.n}) - (\${lm.aa},\${lm.b})</template></template>`;
                const result = (0, plugin_conventions_1.preprocessResource)({
                    path: entry,
                    contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'Map<Salt, Map<Shot, Lime>>', isTs)}
}

class Salt {
${(0, _shared_1.prop)('x', 'number', isTs)}

${(0, _shared_1.prop)('y', 'number', isTs)}
}

class Lime {
${(0, _shared_1.prop)('a', 'string', isTs)}

${(0, _shared_1.prop)('b', 'string', isTs)}
}

class Shot {
${(0, _shared_1.prop)('m', 'string', isTs)}

${(0, _shared_1.prop)('n', 'string', isTs)}
}`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, without_convention_basic_spec_1.nonConventionalOptions);
                (0, _shared_1.assertFailure)(entry, result.code, [/Property 'aa' does not exist on type 'Lime'/]);
            });
        });
    }
});
//# sourceMappingURL=no-convention.template-controller.repeat.map.spec.js.map