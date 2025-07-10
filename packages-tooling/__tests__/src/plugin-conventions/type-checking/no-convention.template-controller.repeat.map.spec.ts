import { preprocessResource } from '@aurelia/plugin-conventions';
import { createMarkupReader, assertSuccess, assertFailure, prop } from './_shared';
import { nonConventionalOptions } from './without-convention.basic.spec';

describe('type-checking/without-convention.template-controller.repeat.map', function () {
  for (const [lang, extn] of [['TypeScript', 'ts'], ['JavaScript', 'js'], ['ESM', 'mjs']] as const) {
    const isTs = lang === 'TypeScript';

    describe(`map - language: ${lang}`, function () {
      it(`template controller - repeat primitive map - pass`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="[key, value] of prop">\${key.toLowerCase()} - \${value}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${prop('prop', 'Map<string, number>', isTs)}
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertSuccess(entry, result.code);
      });

      it(`template controller - repeat primitive map - fail - incorrect key declaration`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="[key, value] of prop">\${k.toLowerCase()} - \${value}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${prop('prop', 'Map<string, number>', isTs)}
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertFailure(entry, result.code, [/Property 'k' does not exist on type '.*Foo.*'/]);
      });

      it(`template controller - repeat primitive map - fail - incorrect value declaration`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="[key, value] of prop">\${key.toLowerCase()} - \${v}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${prop('prop', 'Map<string, number>', isTs)}
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertFailure(entry, result.code, [/Property 'v' does not exist on type '.*Foo.*'/]);
      });

      it(`template controller - repeat primitive map - fail - incorrect key usage`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="[key, value] of prop">\${key.tolowercase()} - \${value}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${prop('prop', 'Map<string, number>', isTs)}
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertFailure(entry, result.code, [/Property 'tolowercase' does not exist on type 'string'/]);
      });

      it(`template controller - repeat primitive map - fail - incorrect value usage`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="[key, value] of prop">\${key.toLowerCase()} - \${value.toexponential(2)}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${prop('prop', 'Map<string, number>', isTs)}
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertFailure(entry, result.code, [/Property 'toexponential' does not exist on type 'number'/]);
      });

      it(`template controller - repeat primitive map - pass - with value-converter`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="[key, value] of prop | identity">\${key.toLowerCase()} - \${value}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${prop('prop', 'Map<string, number>', isTs)}
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertSuccess(entry, result.code);
      });

      it(`template controller - repeat object map - pass`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="[key, value] of prop">(\${key.x},\${key.y}) - (\${value.a},\${value.b})</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${prop('prop', 'Map<Key, Value>', isTs)}
}

class Key {
${prop('x', 'number', isTs)}
${prop('y', 'number', isTs)}
}

class Value {
${prop('a', 'string', isTs)}
${prop('b', 'string', isTs)}
}`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertSuccess(entry, result.code);
      });

      it(`template controller - repeat object map - fail - incorrect key usage`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="[key, value] of prop">(\${key.x},\${key.z}) - (\${value.a},\${value.b})</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${prop('prop', 'Map<Key, Value>', isTs)}
}

class Key {
${prop('x', 'number', isTs)}
${prop('y', 'number', isTs)}
}

class Value {
${prop('a', 'string', isTs)}
${prop('b', 'string', isTs)}
}`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertFailure(entry, result.code, [/Property 'z' does not exist on type 'Key'/]);
      });

      it(`template controller - repeat object map - fail - incorrect value usage`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="[key, value] of prop">(\${key.x},\${key.y}) - (\${value.a},\${value.c})</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${prop('prop', 'Map<Key, Value>', isTs)}
}

class Key {
${prop('x', 'number', isTs)}
${prop('y', 'number', isTs)}
}

class Value {
${prop('a', 'string', isTs)}
${prop('b', 'string', isTs)}
}`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertFailure(entry, result.code, [/Property 'c' does not exist on type 'Value'/]);
      });

      it(`template controller - nested repeat object map - pass`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="[sl, v] of prop">(\${sl.x},\${sl.y}) <template repeat.for="[sh, lm] of v">(\${sh.m},\${sh.n}) - (\${lm.a},\${lm.b})</template></template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${prop('prop', 'Map<Salt, Map<Shot, Lime>>', isTs)}
}

class Salt {
${prop('x', 'number', isTs)}

${prop('y', 'number', isTs)}
}

class Lime {
${prop('a', 'string', isTs)}

${prop('b', 'string', isTs)}
}

class Shot {
${prop('m', 'string', isTs)}

${prop('n', 'string', isTs)}
}`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertSuccess(entry, result.code);
      });

      it(`template controller - nested repeat object map - fail - incorrect declaration`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="[sl, v] of prop">(\${sl.x},\${sl.y}) <template repeat.for="[sh, lm] of v1">(\${sh.m},\${sh.n}) - (\${lm.a},\${lm.b})</template></template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${prop('prop', 'Map<Salt, Map<Shot, Lime>>', isTs)}
}

class Salt {
${prop('x', 'number', isTs)}

${prop('y', 'number', isTs)}
}

class Lime {
${prop('a', 'string', isTs)}

${prop('b', 'string', isTs)}
}

class Shot {
${prop('m', 'string', isTs)}

${prop('n', 'string', isTs)}
}`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertFailure(entry, result.code, [/Property '.*v1\d+' does not exist on type '.*Foo.*'/], undefined, true);
      });

      it(`template controller - nested repeat object map - fail - incorrect usage`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="[sl, v] of prop">(\${sl.x},\${sl.y}) <template repeat.for="[sh, lm] of v">(\${sh.m},\${sh.n}) - (\${lm.aa},\${lm.b})</template></template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${prop('prop', 'Map<Salt, Map<Shot, Lime>>', isTs)}
}

class Salt {
${prop('x', 'number', isTs)}

${prop('y', 'number', isTs)}
}

class Lime {
${prop('a', 'string', isTs)}

${prop('b', 'string', isTs)}
}

class Shot {
${prop('m', 'string', isTs)}

${prop('n', 'string', isTs)}
}`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertFailure(entry, result.code, [/Property 'aa' does not exist on type 'Lime'/]);
      });
    });
  }
});
