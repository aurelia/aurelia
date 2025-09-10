"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_conventions_1 = require("@aurelia/plugin-conventions");
const _shared_1 = require("./_shared");
describe('type-checking/with-convention.let', function () {
    const options = (0, plugin_conventions_1.preprocessOptions)({
        enableConventions: true,
        experimentalTemplateTypeCheck: true,
    });
    for (const [lang, extn] of [['TypeScript', 'ts'], ['JavaScript', 'js'], ['ESM', 'mjs']]) {
        const isTs = lang === 'TypeScript';
        it(`basic pass - language: ${lang}`, function () {
            const entry = `entry.${extn}`;
            const markupFile = 'entry.html';
            const markup = `<let a.bind="person.name"></let>\n\${a.toUpperCase()}`;
            const result = (0, plugin_conventions_1.preprocessResource)({
                path: entry,
                contents: `
import { customElement } from '@aurelia/runtime-html';

export class Entry {
${(0, _shared_1.prop)('person', '{ name: string }', isTs)}
}
`,
                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                filePair: markupFile,
            }, options);
            (0, _shared_1.assertSuccess)(entry, result.code);
        });
        it(`basic fail - language: ${lang}`, function () {
            const entry = `entry.${extn}`;
            const markupFile = 'entry.html';
            const markup = `<let a.bind="person.name"></let>\n\${a.nonExistent}`;
            const result = (0, plugin_conventions_1.preprocessResource)({
                path: entry,
                contents: `
import { customElement } from '@aurelia/runtime-html';

export class Entry {
${(0, _shared_1.prop)('person', '{ name: string }', isTs)}
}
`,
                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                filePair: markupFile,
            }, options);
            (0, _shared_1.assertFailure)(entry, result.code, [/Property 'nonExistent' does not exist on type 'string'/]);
        });
        it(`override + to-binding-context - pass - language: ${lang}`, function () {
            const entry = `entry.${extn}`;
            const markupFile = 'entry.html';
            const markup = `<let x.bind="1" to-binding-context></let>\n\${x.toFixed(2)}`;
            const result = (0, plugin_conventions_1.preprocessResource)({
                path: entry,
                contents: `
import { customElement } from '@aurelia/runtime-html';

export class Entry {
${(0, _shared_1.prop)('x', 'string', isTs)}
}
`,
                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                filePair: markupFile,
            }, options);
            (0, _shared_1.assertSuccess)(entry, result.code);
        });
        it(`scoping across controllers - pass/fail - language: ${lang}`, function () {
            const entry = `entry.${extn}`;
            const markupFile = 'entry.html';
            const pass = `<let v.bind="person.name"></let><template if.bind="true">\${v.toUpperCase()}</template>`;
            const fail = `<template if.bind="true"><let z.bind="1"></let></template>\${z}`;
            const passResult = (0, plugin_conventions_1.preprocessResource)({
                path: entry,
                contents: `
import { customElement } from '@aurelia/runtime-html';

export class Entry {
${(0, _shared_1.prop)('person', '{ name: string }', isTs)}
}
`,
                readFile: (0, _shared_1.createMarkupReader)(markupFile, pass),
                filePair: markupFile,
            }, options);
            (0, _shared_1.assertSuccess)(entry, passResult.code);
            const failResult = (0, plugin_conventions_1.preprocessResource)({
                path: entry,
                contents: `
import { customElement } from '@aurelia/runtime-html';

export class Entry {}
`,
                readFile: (0, _shared_1.createMarkupReader)(markupFile, fail),
                filePair: markupFile,
            }, options);
            (0, _shared_1.assertFailure)(entry, failResult.code, [/Property 'z' does not exist on type '.*Entry.*'/]);
        });
    }
});
//# sourceMappingURL=with-convention.let.spec.js.map