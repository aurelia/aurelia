"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_conventions_1 = require("@aurelia/plugin-conventions");
const testing_1 = require("@aurelia/testing");
const _shared_1 = require("./_shared");
const without_convention_basic_spec_1 = require("./without-convention.basic.spec");
describe('type-checking/without-convention.template-controller.promise', function () {
    for (const [lang, extn] of [['TypeScript', 'ts'], ['JavaScript', 'js'], ['ESM', 'mjs']]) {
        const isTs = lang === 'TypeScript';
        describe(`language: ${lang}`, function () {
            const promiseSyntaxes = ['promise.bind', 'promise'];
            const thenSyntaxes = ['then.from-view', 'then'];
            const catchSyntaxes = ['catch.from-view', 'catch'];
            for (const [p, t, c] of (0, testing_1.generateCartesianProduct)([promiseSyntaxes, thenSyntaxes, catchSyntaxes])) {
                const syntaxes = `${p} - ${t} - ${c}`;
                it(`pass - ${syntaxes}`, function () {
                    const entry = `entry.${extn}`;
                    const markupFile = 'entry.html';
                    const markup = `<template ${p}="prop">
      <span ${t}="data">\${data.toUpperCase()}</span>
      <span ${c}="error">\${error}</span>
      <span pending>loading...</span>
      </template>`;
                    const result = (0, plugin_conventions_1.preprocessResource)({
                        path: entry,
                        contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'Promise<string>', isTs)}
}
`,
                        readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                    }, without_convention_basic_spec_1.nonConventionalOptions);
                    (0, _shared_1.assertSuccess)(entry, result.code);
                });
                it(`fail - ${syntaxes}`, function () {
                    const entry = `entry.${extn}`;
                    const markupFile = 'entry.html';
                    const markup = `<template ${p}="prop">
      <span ${t}="data">\${data.touppercase()}</span>
      <span ${c}="error">\${error}</span>
      <span pending>loading...</span>
      </template>`;
                    const result = (0, plugin_conventions_1.preprocessResource)({
                        path: entry,
                        contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'Promise<string>', isTs)}
}
`,
                        readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                    }, without_convention_basic_spec_1.nonConventionalOptions);
                    (0, _shared_1.assertFailure)(entry, result.code, [/Property 'touppercase' does not exist on type 'string'/]);
                });
                it(`non-promise - pass - ${syntaxes}`, function () {
                    const entry = `entry.${extn}`;
                    const markupFile = 'entry.html';
                    const markup = `<template ${p}="prop">
      <span ${t}="data">\${data.toUpperCase()}</span>
      <span ${c}="error">\${error}</span>
      <span pending>loading...</span>
      </template>`;
                    const result = (0, plugin_conventions_1.preprocessResource)({
                        path: entry,
                        contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'string', isTs)}
}
`,
                        readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                    }, without_convention_basic_spec_1.nonConventionalOptions);
                    (0, _shared_1.assertSuccess)(entry, result.code);
                });
                it(`non-promise - fail - ${syntaxes}`, function () {
                    const entry = `entry.${extn}`;
                    const markupFile = 'entry.html';
                    const markup = `<template ${p}="prop">
      <span ${t}="data">\${data.touppercase()}</span>
      <span ${c}="error">\${error}</span>
      <span pending>loading...</span>
      </template>`;
                    const result = (0, plugin_conventions_1.preprocessResource)({
                        path: entry,
                        contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'string', isTs)}
}
`,
                        readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                    }, without_convention_basic_spec_1.nonConventionalOptions);
                    (0, _shared_1.assertFailure)(entry, result.code, [/Property 'touppercase' does not exist on type 'string'/]);
                });
                it(`multiple promises - same then/catch declaration - pass - ${syntaxes}`, function () {
                    const entry = `entry.${extn}`;
                    const markupFile = 'entry.html';
                    const markup = `<template ${p}="prop1">
      <span ${t}="data">\${data.toUpperCase()}</span>
      <span ${c}="error">\${error}</span>
      <span pending>loading...</span>
      </template>

      <template ${p}="prop2">
      <span ${t}="data">\${data.toExponential(2)}</span>
      <span ${c}="error">\${error}</span>
      <span pending>loading...</span>
      </template>`;
                    const result = (0, plugin_conventions_1.preprocessResource)({
                        path: entry,
                        contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop1', 'Promise<string>', isTs)}

${(0, _shared_1.prop)('prop2', 'Promise<number>', isTs)}
}
`,
                        readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                    }, without_convention_basic_spec_1.nonConventionalOptions);
                    (0, _shared_1.assertSuccess)(entry, result.code);
                });
                it(`multiple promises - different then/catch declaration - pass - ${syntaxes}`, function () {
                    const entry = `entry.${extn}`;
                    const markupFile = 'entry.html';
                    const markup = `<template ${p}="prop1">
      <span ${t}="data">\${data.toUpperCase()}</span>
      <span ${c}="error">\${error}</span>
      <span pending>loading...</span>
      </template>

      <template ${p}="prop2">
      <span ${t}="data1">\${data1.toExponential(2)}</span>
      <span ${c}="error1">\${error1}</span>
      <span pending>loading...</span>
      </template>`;
                    const result = (0, plugin_conventions_1.preprocessResource)({
                        path: entry,
                        contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop1', 'Promise<string>', isTs)}

${(0, _shared_1.prop)('prop2', 'Promise<number>', isTs)}
}
`,
                        readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                    }, without_convention_basic_spec_1.nonConventionalOptions);
                    (0, _shared_1.assertSuccess)(entry, result.code);
                });
                it(`multiple promises - fail - ${syntaxes}`, function () {
                    const entry = `entry.${extn}`;
                    const markupFile = 'entry.html';
                    const markup = `<template ${p}="prop1">
      <span ${t}="data">\${data.toUpperCase()}</span>
      <span ${c}="error">\${error}</span>
      <span pending>loading...</span>
      </template>

      <template ${p}="prop2">
      <span ${t}="data">\${data.toUpperCase()}</span>
      <span ${c}="error">\${error}</span>
      <span pending>loading...</span>
      </template>`;
                    const result = (0, plugin_conventions_1.preprocessResource)({
                        path: entry,
                        contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop1', 'Promise<string>', isTs)}

${(0, _shared_1.prop)('prop2', 'Promise<number>', isTs)}
}
`,
                        readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                    }, without_convention_basic_spec_1.nonConventionalOptions);
                    (0, _shared_1.assertFailure)(entry, result.code, [/Property 'toUpperCase' does not exist on type 'number'/]);
                });
            }
        });
    }
});
//# sourceMappingURL=without-convention.template-controller.promise.spec.js.map