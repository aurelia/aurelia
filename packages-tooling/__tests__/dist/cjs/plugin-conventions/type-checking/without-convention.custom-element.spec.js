"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_conventions_1 = require("@aurelia/plugin-conventions");
const _shared_1 = require("./_shared");
const without_convention_basic_1 = require("./without-convention.basic");
describe('type-checking/without-convention.custom-element', function () {
    for (const [lang, extn] of [['TypeScript', 'ts'], ['JavaScript', 'js'], ['ESM', 'mjs']]) {
        const isTs = lang === 'TypeScript';
        it(`custom-element bindable - pass - language: ${lang}`, function () {
            const entry = `entry.${extn}`;
            const markupFile = 'entry.html';
            const markup = '<ce-one prop.bind="prop"></ce-one>';
            const result = (0, plugin_conventions_1.preprocessResource)({
                path: entry,
                contents: `
import { customElement, bindable } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'ce-one', template: '\${prop}' })
export class CeOne {
@bindable
${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
}

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
}
`,
                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
            }, without_convention_basic_1.nonConventionalOptions);
            (0, _shared_1.assertSuccess)(entry, result.code);
        });
        it(`custom-element bindable - fail - incorrect host property - language: ${lang}`, function () {
            const entry = `entry.${extn}`;
            const markupFile = 'entry.html';
            const markup = '<ce-one prop.bind="prop"></ce-one>';
            const result = (0, plugin_conventions_1.preprocessResource)({
                path: entry,
                contents: `
import { customElement, bindable } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'ce-one', template: '\${prop}' })
export class CeOne {
@bindable
${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
}

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? 'public ' : ''}prop1${isTs ? ': string' : ''};
}
`,
                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
            }, without_convention_basic_1.nonConventionalOptions);
            (0, _shared_1.assertFailure)(entry, result.code, [/Property 'prop' does not exist on type '.*Foo.*'/]);
        });
        // TODO(phase2): make this work; probably need to use something like webpack plugin to access to the complete TS project
        it.skip(`custom-element bindable - fail - incorrect CE bindable - language: ${lang}`, function () {
            const entry = `entry.${extn}`;
            const markupFile = 'entry.html';
            const markup = '<ce-one prop.bind="prop"></ce-one>';
            const result = (0, plugin_conventions_1.preprocessResource)({
                path: entry,
                contents: `
import { customElement, bindable } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'ce-one', template: '\${prop1}' })
export class CeOne {
@bindable
${isTs ? 'public ' : ''}prop1${isTs ? ': string' : ''};
}

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
}
`,
                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
            }, without_convention_basic_1.nonConventionalOptions);
            (0, _shared_1.assertFailure)(entry, result.code, [/Property 'prop' does not exist on type 'CeOne'/]);
        });
        it(`custom-element bindable - short-hand - pass - language: ${lang}`, function () {
            const entry = `entry.${extn}`;
            const markupFile = 'entry.html';
            const markup = '<ce-one prop.bind></ce-one>';
            const result = (0, plugin_conventions_1.preprocessResource)({
                path: entry,
                contents: `
import { customElement, bindable } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'ce-one', template: '\${prop}' })
export class CeOne {
@bindable
${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
}

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
}
`,
                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
            }, without_convention_basic_1.nonConventionalOptions);
            (0, _shared_1.assertSuccess)(entry, result.code);
        });
        it(`custom-element bindable - short-hand - fail - language: ${lang}`, function () {
            const entry = `entry.${extn}`;
            const markupFile = 'entry.html';
            const markup = '<ce-one prop.bind></ce-one>';
            const result = (0, plugin_conventions_1.preprocessResource)({
                path: entry,
                contents: `
import { customElement, bindable } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'ce-one', template: '\${prop}' })
export class CeOne {
@bindable
${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
}

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? 'public ' : ''}prop1${isTs ? ': string' : ''};
}
`,
                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
            }, without_convention_basic_1.nonConventionalOptions);
            (0, _shared_1.assertFailure)(entry, result.code, [/Property 'prop' does not exist on type '.*Foo.*'/]);
        });
        it(`custom-element bindable - nested property - pass - language: ${lang}`, function () {
            const entry = `entry.${extn}`;
            const markupFile = 'entry.html';
            const markup = '<ce-one prop.bind="prop.x"></ce-one>';
            const depFile = `dep${isTs ? '' : `.${extn}`}`;
            const additionalModules = {
                [depFile]: `export class Dep {
        ${isTs ? 'public constructor(public x: string) {}' : '/** @type {string} */x'}
    }`
            };
            const result = (0, plugin_conventions_1.preprocessResource)({
                path: entry,
                contents: `
import { customElement, bindable } from '@aurelia/runtime-html';
import template from './${markupFile}';
import { Dep } from './${depFile}';

@customElement({ name: 'ce-one', template: '\${prop}' })
export class CeOne {
@bindable
${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
}

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? '' : '/** @type {Dep} */'}
${isTs ? 'public ' : ''}prop${isTs ? ': Dep' : ''};
}
`,
                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
            }, without_convention_basic_1.nonConventionalOptions);
            (0, _shared_1.assertSuccess)(entry, result.code, additionalModules);
        });
        it(`custom-element bindable - nested property - fail - language: ${lang}`, function () {
            const entry = `entry.${extn}`;
            const markupFile = 'entry.html';
            const markup = '<ce-one prop.bind="prop.y"></ce-one>';
            const depFile = `dep${isTs ? '' : `.${extn}`}`;
            const additionalModules = {
                [depFile]: `export class Dep {
        ${isTs ? 'public constructor(public x: string) {}' : '/** @type {string} */x'}
    }`
            };
            const result = (0, plugin_conventions_1.preprocessResource)({
                path: entry,
                contents: `
import { customElement, bindable } from '@aurelia/runtime-html';
import template from './${markupFile}';
import { Dep } from './${depFile}';

@customElement({ name: 'ce-one', template: '\${prop}' })
export class CeOne {
@bindable
${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
}

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? '' : '/** @type {Dep} */'}
${isTs ? 'public ' : ''}prop${isTs ? ': Dep' : ''};
}
`,
                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
            }, without_convention_basic_1.nonConventionalOptions);
            (0, _shared_1.assertFailure)(entry, result.code, [/Property 'y' does not exist on type 'Dep'/], additionalModules);
        });
        it(`custom-element bindable - value-converter - pass - language: ${lang}`, function () {
            const entry = `entry.${extn}`;
            const markupFile = 'entry.html';
            const markup = '<ce-one prop.bind="prop | identity"></ce-one>';
            const result = (0, plugin_conventions_1.preprocessResource)({
                path: entry,
                contents: `
import { customElement, bindable } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'ce-one', template: '\${prop}' })
export class CeOne {
@bindable
${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
}

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
}
`,
                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
            }, without_convention_basic_1.nonConventionalOptions);
            (0, _shared_1.assertSuccess)(entry, result.code);
        });
        it(`custom-element bindable - binding behavior - pass - language: ${lang}`, function () {
            const entry = `entry.${extn}`;
            const markupFile = 'entry.html';
            const markup = '<ce-one prop.bind="prop & identity"></ce-one>';
            const result = (0, plugin_conventions_1.preprocessResource)({
                path: entry,
                contents: `
import { customElement, bindable } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'ce-one', template: '\${prop}' })
export class CeOne {
@bindable
${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
}

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
}
`,
                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
            }, without_convention_basic_1.nonConventionalOptions);
            (0, _shared_1.assertSuccess)(entry, result.code);
        });
        it(`custom-element bindable $parent - pass - language: ${lang}`, function () {
            const entry = `entry.${extn}`;
            const markupFile = 'entry.html';
            const markup = '<ce-one prop.bind="$parent.x"></ce-one>';
            const result = (0, plugin_conventions_1.preprocessResource)({
                path: entry,
                contents: `
import { customElement, bindable } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'ce-one', template: '\${prop}' })
export class CeOne {
@bindable
${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
}

@customElement({ name: 'foo', template })
export class Foo {}
`,
                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
            }, without_convention_basic_1.nonConventionalOptions);
            (0, _shared_1.assertSuccess)(entry, result.code);
        });
    }
});
//# sourceMappingURL=without-convention.custom-element.spec.js.map