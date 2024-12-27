"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_conventions_1 = require("@aurelia/plugin-conventions");
const _shared_1 = require("./_shared");
const without_convention_basic_spec_1 = require("./without-convention.basic.spec");
describe('type-checking/without-convention.template-controller.basic', function () {
    for (const [lang, extn] of [['TypeScript', 'ts'], ['JavaScript', 'js'], ['ESM', 'mjs']]) {
        const isTs = lang === 'TypeScript';
        describe(`if - language: ${lang}`, function () {
            it(`template controller - if - pass`, function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = '<template if.bind="prop">awesome</template>';
                const result = (0, plugin_conventions_1.preprocessResource)({
                    path: entry,
                    contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'unknown', isTs)}
}
`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, without_convention_basic_spec_1.nonConventionalOptions);
                (0, _shared_1.assertSuccess)(entry, result.code);
            });
            it(`template controller - if - fail`, function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = '<template if.bind="prop">awesome</template>';
                const result = (0, plugin_conventions_1.preprocessResource)({
                    path: entry,
                    contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop1', 'unknown', isTs)}
}
`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, without_convention_basic_spec_1.nonConventionalOptions);
                (0, _shared_1.assertFailure)(entry, result.code, [/Property 'prop' does not exist on type '.*Foo.*'/]);
            });
            it(`template controller - if - value-converter - pass`, function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = '<template if.bind="prop | identity">awesome</template>';
                const result = (0, plugin_conventions_1.preprocessResource)({
                    path: entry,
                    contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'unknown', isTs)}
}
`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, without_convention_basic_spec_1.nonConventionalOptions);
                (0, _shared_1.assertSuccess)(entry, result.code);
            });
            it(`template controller - if - binding-behavior - pass`, function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = '<template if.bind="prop & identity">awesome</template>';
                const result = (0, plugin_conventions_1.preprocessResource)({
                    path: entry,
                    contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'unknown', isTs)}
}
`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, without_convention_basic_spec_1.nonConventionalOptions);
                (0, _shared_1.assertSuccess)(entry, result.code);
            });
        });
        describe(`switch/case - language: ${lang}`, function () {
            it(`template controller - switch - pass`, function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = `<template switch.bind="prop">
      <span case="foo">Foo</span>
      <span case="bar">Bar</span>
      </template>`;
                const result = (0, plugin_conventions_1.preprocessResource)({
                    path: entry,
                    contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'unknown', isTs)}
}
`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, without_convention_basic_spec_1.nonConventionalOptions);
                (0, _shared_1.assertSuccess)(entry, result.code);
            });
            it(`template controller - switch - fail`, function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = `<template switch.bind="prop">
      <span case="foo">Foo</span>
      <span case="bar">Bar</span>
      </template>`;
                const result = (0, plugin_conventions_1.preprocessResource)({
                    path: entry,
                    contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop1', 'unknown', isTs)}
}
`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, without_convention_basic_spec_1.nonConventionalOptions);
                (0, _shared_1.assertFailure)(entry, result.code, [/Property 'prop' does not exist on type '.*Foo.*'/]);
            });
            it(`template controller - switch - value-converter - pass`, function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = `<template switch.bind="prop | identity">
      <span case="foo">Foo</span>
      <span case="bar">Bar</span>
      </template>`;
                const result = (0, plugin_conventions_1.preprocessResource)({
                    path: entry,
                    contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'unknown', isTs)}
}
`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, without_convention_basic_spec_1.nonConventionalOptions);
                (0, _shared_1.assertSuccess)(entry, result.code);
            });
            it(`template controller - switch - binding behavior - pass`, function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = `<template switch.bind="prop & identity">
      <span case="foo">Foo</span>
      <span case="bar">Bar</span>
      </template>`;
                const result = (0, plugin_conventions_1.preprocessResource)({
                    path: entry,
                    contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'unknown', isTs)}
}
`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, without_convention_basic_spec_1.nonConventionalOptions);
                (0, _shared_1.assertSuccess)(entry, result.code);
            });
            it(`template controller - case - pass`, function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = `<template switch.bind="true">
      <span case.bind="prop">Foo</span>
      <span case="bar">Bar</span>
      </template>`;
                const result = (0, plugin_conventions_1.preprocessResource)({
                    path: entry,
                    contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'unknown', isTs)}
}
`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, without_convention_basic_spec_1.nonConventionalOptions);
                (0, _shared_1.assertSuccess)(entry, result.code);
            });
            it(`template controller - case - fail`, function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = `<template switch.bind="true">
      <span case.bind="prop">Foo</span>
      <span case="bar">Bar</span>
      </template>`;
                const result = (0, plugin_conventions_1.preprocessResource)({
                    path: entry,
                    contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop1', 'unknown', isTs)}
}
`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, without_convention_basic_spec_1.nonConventionalOptions);
                (0, _shared_1.assertFailure)(entry, result.code, [/Property 'prop' does not exist on type '.*Foo.*'/]);
            });
            it.skip(`template controller - switch and cases - fail - different data types for switch and cases`, function () {
                // placeholder
                // TODO: data-type of switch and and all cases should be the same or compatible
            });
            it(`template controller - case - value-converter - pass`, function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = `<template switch.bind="true">
      <span case.bind="prop | identity">Foo</span>
      <span case="bar">Bar</span>
      </template>`;
                const result = (0, plugin_conventions_1.preprocessResource)({
                    path: entry,
                    contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'unknown', isTs)}
}
`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, without_convention_basic_spec_1.nonConventionalOptions);
                (0, _shared_1.assertSuccess)(entry, result.code);
            });
            it(`template controller - case - binding behavior - pass`, function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = `<template switch.bind="true">
      <span case.bind="prop & identity">Foo</span>
      <span case="bar">Bar</span>
      </template>`;
                const result = (0, plugin_conventions_1.preprocessResource)({
                    path: entry,
                    contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'unknown', isTs)}
}
`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, without_convention_basic_spec_1.nonConventionalOptions);
                (0, _shared_1.assertSuccess)(entry, result.code);
            });
        });
    }
});
//# sourceMappingURL=without-convention.template-controller.basic.spec.js.map