"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_conventions_1 = require("@aurelia/plugin-conventions");
const _shared_1 = require("./_shared");
const without_convention_basic_spec_1 = require("./without-convention.basic.spec");
describe('type-checking/without-convention.custom-attribute', function () {
    for (const [lang, extn] of [['TypeScript', 'ts'], ['JavaScript', 'js'], ['ESM', 'mjs']]) {
        const isTs = lang === 'TypeScript';
        it(`custom-attribute bindable - pass - language: ${lang}`, function () {
            const entry = `entry.${extn}`;
            const markupFile = 'entry.html';
            const markup = '<div ca-one.bind="prop"></div>';
            const result = (0, plugin_conventions_1.preprocessResource)({
                path: entry,
                contents: `
import { customAttribute, customElement, bindable } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customAttribute('ca-one')
export class CaOne {
@bindable
${(0, _shared_1.prop)('value', 'string', isTs)}
}

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'string', isTs)}
}
`,
                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
            }, without_convention_basic_spec_1.nonConventionalOptions);
            (0, _shared_1.assertSuccess)(entry, result.code);
        });
        it(`custom-attribute bindable - fail - incorrect host property - language: ${lang}`, function () {
            const entry = `entry.${extn}`;
            const markupFile = 'entry.html';
            const markup = '<div ca-one.bind="prop"></div>';
            const result = (0, plugin_conventions_1.preprocessResource)({
                path: entry,
                contents: `
import { customAttribute, customElement, bindable } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customAttribute('ca-one')
export class CaOne {
@bindable
${(0, _shared_1.prop)('value', 'string', isTs)}
}

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop1', 'string', isTs)}
}
`,
                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
            }, without_convention_basic_spec_1.nonConventionalOptions);
            (0, _shared_1.assertFailure)(entry, result.code, [/Property 'prop' does not exist on type '.*Foo.*'/]);
        });
        it(`custom-attribute bindable - nested property - pass - language: ${lang}`, function () {
            const entry = `entry.${extn}`;
            const markupFile = 'entry.html';
            const markup = '<div ca-one.bind="prop.x"></div>';
            const depFile = `dep${isTs ? '' : `.${extn}`}`;
            const additionalModules = {
                [depFile]: `export class Dep {
      ${isTs ? 'public constructor(public x: string) {}' : '/** @type {string} */x'}
  }`
            };
            const result = (0, plugin_conventions_1.preprocessResource)({
                path: entry,
                contents: `
import { customAttribute, customElement, bindable } from '@aurelia/runtime-html';
import template from './${markupFile}';
import { Dep } from './${depFile}';

@customAttribute('ca-one')
export class CaOne {
@bindable
${(0, _shared_1.prop)('value', 'string', isTs)}
}

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'Dep', isTs)}
}
`,
                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
            }, without_convention_basic_spec_1.nonConventionalOptions);
            (0, _shared_1.assertSuccess)(entry, result.code, additionalModules);
        });
        it(`custom-attribute bindable - nested property - fail - language: ${lang}`, function () {
            const entry = `entry.${extn}`;
            const markupFile = 'entry.html';
            const markup = '<div ca-one.bind="prop.y"></div>';
            const depFile = `dep${isTs ? '' : `.${extn}`}`;
            const additionalModules = {
                [depFile]: `export class Dep {
      ${isTs ? 'public constructor(public x: string) {}' : '/** @type {string} */x'}
  }`
            };
            const result = (0, plugin_conventions_1.preprocessResource)({
                path: entry,
                contents: `
import { customAttribute, customElement, bindable } from '@aurelia/runtime-html';
import template from './${markupFile}';
import { Dep } from './${depFile}';

@customAttribute('ca-one')
export class CaOne {
@bindable
${(0, _shared_1.prop)('value', 'string', isTs)}
}

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'Dep', isTs)}
}
`,
                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
            }, without_convention_basic_spec_1.nonConventionalOptions);
            (0, _shared_1.assertFailure)(entry, result.code, [/Property 'y' does not exist on type 'Dep'/], additionalModules);
        });
        it(`custom-attribute bindable - value converter - pass - language: ${lang}`, function () {
            const entry = `entry.${extn}`;
            const markupFile = 'entry.html';
            const markup = '<div ca-one.bind="prop | identity"></div>';
            const result = (0, plugin_conventions_1.preprocessResource)({
                path: entry,
                contents: `
import { customAttribute, customElement, bindable } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customAttribute('ca-one')
export class CaOne {
@bindable
${(0, _shared_1.prop)('value', 'string', isTs)}
}

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'string', isTs)}
}
`,
                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
            }, without_convention_basic_spec_1.nonConventionalOptions);
            (0, _shared_1.assertSuccess)(entry, result.code);
        });
        it(`custom-attribute bindable - binding behavior - pass - language: ${lang}`, function () {
            const entry = `entry.${extn}`;
            const markupFile = 'entry.html';
            const markup = '<div ca-one.bind="prop & identity"></div>';
            const result = (0, plugin_conventions_1.preprocessResource)({
                path: entry,
                contents: `
import { customAttribute, customElement, bindable } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customAttribute('ca-one')
export class CaOne {
@bindable
${(0, _shared_1.prop)('value', 'string', isTs)}
}

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'string', isTs)}
}
`,
                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
            }, without_convention_basic_spec_1.nonConventionalOptions);
            (0, _shared_1.assertSuccess)(entry, result.code);
        });
        it(`custom-attribute $parent - pass - language: ${lang}`, function () {
            const entry = `entry.${extn}`;
            const markupFile = 'entry.html';
            const markup = '<div ca-one.bind="$parent.x"></div>';
            const result = (0, plugin_conventions_1.preprocessResource)({
                path: entry,
                contents: `
import { customAttribute, customElement, bindable } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customAttribute('ca-one')
export class CaOne {
@bindable
${(0, _shared_1.prop)('value', 'string', isTs)}
}

@customElement({ name: 'foo', template })
export class Foo {}
`,
                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
            }, without_convention_basic_spec_1.nonConventionalOptions);
            (0, _shared_1.assertSuccess)(entry, result.code);
        });
    }
});
//# sourceMappingURL=without-convention.custom-attribute.spec.js.map