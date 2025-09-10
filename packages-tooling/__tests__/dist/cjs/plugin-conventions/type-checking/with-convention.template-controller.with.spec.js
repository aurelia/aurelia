"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_conventions_1 = require("@aurelia/plugin-conventions");
const _shared_1 = require("./_shared");
describe('type-checking/with-convention.template-controller.with', function () {
    const options = (0, plugin_conventions_1.preprocessOptions)({
        enableConventions: true,
        experimentalTemplateTypeCheck: true,
    });
    for (const [lang, extn] of [['TypeScript', 'ts'], ['JavaScript', 'js'], ['ESM', 'mjs']]) {
        const isTs = lang === 'TypeScript';
        describe(`language: ${lang}`, function () {
            for (const withSyntax of ['with.bind', 'with']) {
                it(`template controller - with (${withSyntax}) - pass`, function () {
                    const entry = `entry.${extn}`;
                    const markupFile = 'entry.html';
                    const markup = `<template ${withSyntax}="person">\${name.toUpperCase()}</template>`;
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
                it(`template controller - with (${withSyntax}) - leak guard - fail`, function () {
                    const entry = `entry.${extn}`;
                    const markupFile = 'entry.html';
                    const markup = `<template ${withSyntax}="person">\${name.toUpperCase()}</template>\n\${name}`;
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
                    (0, _shared_1.assertFailure)(entry, result.code, [/Property 'name' does not exist/]);
                });
            }
        });
    }
});
//# sourceMappingURL=with-convention.template-controller.with.spec.js.map