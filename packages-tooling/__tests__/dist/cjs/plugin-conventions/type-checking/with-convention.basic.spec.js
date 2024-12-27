"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-template-curly-in-string */
const plugin_conventions_1 = require("@aurelia/plugin-conventions");
const _shared_1 = require("./_shared");
describe('type-checking/with-convention.basic', function () {
    const options = (0, plugin_conventions_1.preprocessOptions)({
        enableConventions: true,
        experimentalTemplateTypeCheck: true,
    });
    for (const [lang, extn] of [['TypeScript', 'ts'], ['JavaScript', 'js'], ['ESM', 'mjs']]) {
        const isTs = lang === 'TypeScript';
        it(`without decorator - pass - language: ${lang}`, function () {
            const entry = `entry.${extn}`;
            const markupFile = 'entry.html';
            const markup = '${prop}';
            const result = (0, plugin_conventions_1.preprocessResource)({
                path: entry,
                contents: `
import { customElement } from '@aurelia/runtime-html';

export class Entry {
${(0, _shared_1.prop)('prop', 'string', isTs)}
}
`,
                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                filePair: markupFile,
            }, options);
            (0, _shared_1.assertSuccess)(entry, result.code);
        });
        it(`without decorator - fail - language: ${lang}`, function () {
            const entry = `entry.${extn}`;
            const markupFile = 'entry.html';
            const markup = '${prop1}';
            const result = (0, plugin_conventions_1.preprocessResource)({
                path: entry,
                contents: `
import { customElement } from '@aurelia/runtime-html';

export class Entry {
${(0, _shared_1.prop)('prop', 'string', isTs)}
}
`,
                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                filePair: markupFile,
            }, options);
            (0, _shared_1.assertFailure)(entry, result.code, [/Property 'prop1' does not exist on type '.*Entry.*'\./]);
        });
        it(`with decorator - pass - language: ${lang}`, function () {
            const entry = `entry.${extn}`;
            const markupFile = 'entry.html';
            const markup = '${prop}';
            const result = (0, plugin_conventions_1.preprocessResource)({
                path: entry,
                contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement('ent-ry')
export class Entry {
${(0, _shared_1.prop)('prop', 'string', isTs)}
}
`,
                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                filePair: markupFile,
            }, options);
            (0, _shared_1.assertSuccess)(entry, result.code);
        });
        it(`with decorator - fail - language: ${lang}`, function () {
            const entry = `entry.${extn}`;
            const markupFile = 'entry.html';
            const markup = '${prop1}';
            const result = (0, plugin_conventions_1.preprocessResource)({
                path: entry,
                contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement('ent-ry')
export class Entry {
${(0, _shared_1.prop)('prop', 'string', isTs)}
}
`,
                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                filePair: markupFile,
            }, options);
            (0, _shared_1.assertFailure)(entry, result.code, [/Property 'prop1' does not exist on type '.*Entry.*'\./]);
        });
        it(`template controller - nested repeat object map - pass - language: ${lang}`, function () {
            const entry = `entry.${extn}`;
            const markupFile = 'entry.html';
            const markup = `<template repeat.for="[sl, v] of prop">(\${sl.x},\${sl.y}) <template repeat.for="[sh, lm] of v">(\${sh.m},\${sh.n}) - (\${lm.a},\${lm.b})</template></template>`;
            const result = (0, plugin_conventions_1.preprocessResource)({
                path: entry,
                contents: `
import { customElement } from '@aurelia/runtime-html';

export class Entry {
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
}
`,
                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                filePair: markupFile,
            }, options);
            (0, _shared_1.assertSuccess)(entry, result.code);
        });
        it(`template controller - nested repeat object map - fail - incorrect declaration - language: ${lang}`, function () {
            const entry = `entry.${extn}`;
            const markupFile = 'entry.html';
            const markup = `<template repeat.for="[sl, v] of prop">(\${sl.x},\${sl.y}) <template repeat.for="[sh, lm] of v1">(\${sh.m},\${sh.n}) - (\${lm.a},\${lm.b})</template></template>`;
            const result = (0, plugin_conventions_1.preprocessResource)({
                path: entry,
                contents: `
import { customElement } from '@aurelia/runtime-html';

export class Entry {
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
}
`,
                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                filePair: markupFile,
            }, options);
            (0, _shared_1.assertFailure)(entry, result.code, [/Property '.*v1\d+' does not exist on type '.*Entry.*'/], undefined, true);
        });
        it(`template controller - nested repeat object map - fail - incorrect usage - language: ${lang}`, function () {
            const entry = `entry.${extn}`;
            const markupFile = 'entry.html';
            const markup = `<template repeat.for="[sl, v] of prop">(\${sl.x},\${sl.y}) <template repeat.for="[sh, lm] of v">(\${sh.m},\${sh.n}) - (\${lm.aa},\${lm.b})</template></template>`;
            const result = (0, plugin_conventions_1.preprocessResource)({
                path: entry,
                contents: `
import { customElement } from '@aurelia/runtime-html';

export class Entry {
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
}
`,
                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                filePair: markupFile,
            }, options);
            (0, _shared_1.assertFailure)(entry, result.code, [/Property 'aa' does not exist on type 'Lime'/]);
        });
    }
});
//# sourceMappingURL=with-convention.basic.spec.js.map