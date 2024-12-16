import { preprocessResource } from '@aurelia/plugin-conventions';
import { createMarkupReader, assertSuccess, assertFailure } from './_shared';
import { nonConventionalOptions } from './without-convention.basic';

describe('type-checking/without-convention.template-controller.repeat', function () {
  for (const [lang, extn] of [['TypeScript', 'ts'], ['JavaScript', 'js'], ['ESM', 'mjs']] as const) {
    const isTs = lang === 'TypeScript';
    describe(`array - language: ${lang}`, function () {
      it(`template controller - repeat primitive array - pass`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="item of prop">\${item.toLowerCase()}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? '' : '/** @type {string[]} */'}
${isTs ? 'public ' : ''}prop${isTs ? ': string[]' : ''};
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertSuccess(entry, result.code);
      });

      it(`template controller - repeat primitive array - pass - with value-converter`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="item of prop | identity">\${item}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? '' : '/** @type {string[]} */'}
${isTs ? 'public ' : ''}prop${isTs ? ': string[]' : ''};
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertSuccess(entry, result.code);
      });

      // TODO(phase2): make this work; we need the type information of the value-converter. This is currently not possible with the loader approach as we don't have access to the complete TS project.
      it.skip(`template controller - repeat primitive array - pass - value-converter with different type`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="item of prop | toNumber">\${item.toExponential(2)}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? '' : '/** @type {string[]} */'}
${isTs ? 'public ' : ''}prop${isTs ? ': string[]' : ''};
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertSuccess(entry, result.code);
      });

      it(`template controller - repeat primitive array - fail`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="item of prop">\${item.tolowercase()}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? '' : '/** @type {string[]} */'}
${isTs ? 'public ' : ''}prop${isTs ? ': string[]' : ''};
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertFailure(entry, result.code, [/Property 'tolowercase' does not exist on type 'string'/]);
      });

      it(`template controller - repeat from method call - pass`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="item of getItems()">\${item.toLowerCase()}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? '' : '/** @returns {string[]} */'}
${isTs ? 'public ' : ''}getItems()${isTs ? ': string[]' : ''} { return []; };
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertSuccess(entry, result.code);
      });

      it(`template controller - multiple repeats - primitive arrays - same declaration - pass`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="item of prop1">\${item.toLowerCase()}</template><template repeat.for="item of prop2">\${item.toExponential(2)}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? '' : '/** @type {string[]} */'}
${isTs ? 'public ' : ''}prop1${isTs ? ': string[]' : ''};

${isTs ? '' : '/** @type {number[]} */'}
${isTs ? 'public ' : ''}prop2${isTs ? ': number[]' : ''};
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertSuccess(entry, result.code);
      });

      it(`template controller - multiple repeats - primitive arrays - different declarations - pass`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="item1 of prop1">\${item1.toLowerCase()}</template><template repeat.for="item2 of prop2">\${item2.toExponential(2)}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? '' : '/** @type {string[]} */'}
${isTs ? 'public ' : ''}prop1${isTs ? ': string[]' : ''};

${isTs ? '' : '/** @type {number[]} */'}
${isTs ? 'public ' : ''}prop2${isTs ? ': number[]' : ''};
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertSuccess(entry, result.code);
      });

      it(`template controller - multiple repeats - primitive arrays - fail - incorrect declaration`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="item1 of prop1">\${item1.toLowerCase()}</template><template repeat.for="item2 of prop2">\${item.toExponential(2)}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? '' : '/** @type {string[]} */'}
${isTs ? 'public ' : ''}prop1${isTs ? ': string[]' : ''};

${isTs ? '' : '/** @type {number[]} */'}
${isTs ? 'public ' : ''}prop2${isTs ? ': number[]' : ''};
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertFailure(entry, result.code, [/Property 'item' does not exist on type '.*Foo.*'/]);
      });

      it(`template controller - multiple repeats - primitive arrays - fail - incorrect usage`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="item1 of prop1">\${item1.toLowerCase()}</template><template repeat.for="item2 of prop2">\${item2.toexponential(2)}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? '' : '/** @type {string[]} */'}
${isTs ? 'public ' : ''}prop1${isTs ? ': string[]' : ''};

${isTs ? '' : '/** @type {number[]} */'}
${isTs ? 'public ' : ''}prop2${isTs ? ': number[]' : ''};
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertFailure(entry, result.code, [/Property 'toexponential' does not exist on type 'number'/]);
      });

      it(`template controller - repeat object[] - pass`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="item of prop">\${item.x.toLowerCase()}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? '' : '/** @type {Bar[]} */'}
${isTs ? 'public ' : ''}prop${isTs ? ': Bar[]' : ''};
}

class Bar {
${isTs ? '' : '/** @type {string} */'}
${isTs ? 'public ' : ''}x${isTs ? ': string' : ''};
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertSuccess(entry, result.code);
      });

      it(`template controller - repeat object[] - fail`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="item of prop">\${item.x.toLowerCase()}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? '' : '/** @type {Bar[]} */'}
${isTs ? 'public ' : ''}prop${isTs ? ': Bar[]' : ''};
}

class Bar {
${isTs ? '' : '/** @type {string} */'}
${isTs ? 'public ' : ''}x1${isTs ? ': string' : ''};
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertFailure(entry, result.code, [/Property 'x' does not exist on type '.*Bar.*'/]);
      });

      it(`template controller - multiple repeats - object arrays - pass`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="item of prop1">\${item.x.toLowerCase()}</template><template repeat.for="item of prop2">\${item.y.toExponential(2)}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? '' : '/** @type {Bar[]} */'}
${isTs ? 'public ' : ''}prop1${isTs ? ': Bar[]' : ''};

${isTs ? '' : '/** @type {Baz[]} */'}
${isTs ? 'public ' : ''}prop2${isTs ? ': Baz[]' : ''};
}

class Bar {
${isTs ? '' : '/** @type {string} */'}
${isTs ? 'public ' : ''}x${isTs ? ': string' : ''};
}

class Baz {
${isTs ? '' : '/** @type {number} */'}
${isTs ? 'public ' : ''}y${isTs ? ': number' : ''};
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertSuccess(entry, result.code);
      });

      it(`template controller - multiple repeats - object arrays - fail`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="item of prop1">\${item.x.toLowerCase()}</template><template repeat.for="item of prop2">\${item.y.toExponential(2)}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? '' : '/** @type {Bar[]} */'}
${isTs ? 'public ' : ''}prop1${isTs ? ': Bar[]' : ''};

${isTs ? '' : '/** @type {Baz[]} */'}
${isTs ? 'public ' : ''}prop2${isTs ? ': Baz[]' : ''};
}

class Bar {
${isTs ? '' : '/** @type {string} */'}
${isTs ? 'public ' : ''}x${isTs ? ': string' : ''};
}

class Baz {
${isTs ? '' : '/** @type {number} */'}
${isTs ? 'public ' : ''}y1${isTs ? ': number' : ''};
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertFailure(entry, result.code, [/Property 'y' does not exist on type 'Baz'/]);
      });

      it(`template controller - nested repeats - pass`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="node of nodes">\${node.x} <template repeat.for="child of node.children">\${child.x}</template></template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? '' : '/** @type {Node[]} */'}
${isTs ? 'public ' : ''}nodes${isTs ? ': Node[]' : ''};
}

class Node {
${isTs ? '' : '/** @type {number} */'}
${isTs ? 'public ' : ''}x${isTs ? ': number' : ''};

${isTs ? '' : '/** @type {Node[]} */'}
${isTs ? 'public ' : ''}children${isTs ? ': Node[]' : ''};
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertSuccess(entry, result.code);
      });

      it(`template controller - nested repeats - fail - incorrect declaration`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="node of nodes">\${node.x} <template repeat.for="child of node1.children">\${child.x}</template></template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? '' : '/** @type {Node[]} */'}
${isTs ? 'public ' : ''}nodes${isTs ? ': Node[]' : ''};
}

class Node {
${isTs ? '' : '/** @type {number} */'}
${isTs ? 'public ' : ''}x${isTs ? ': number' : ''};

${isTs ? '' : '/** @type {Node[]} */'}
${isTs ? 'public ' : ''}children${isTs ? ': Node[]' : ''};
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertFailure(entry, result.code, [/Property '.*node1\d+' does not exist on type '.*Foo.*'/], undefined, true);
      });

      it(`template controller - nested repeats - fail - incorrect usage`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="node of nodes">\${node.x} <template repeat.for="child of node.children">\${child.y}</template></template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? '' : '/** @type {Node[]} */'}
${isTs ? 'public ' : ''}nodes${isTs ? ': Node[]' : ''};
}

class Node {
${isTs ? '' : '/** @type {number} */'}
${isTs ? 'public ' : ''}x${isTs ? ': number' : ''};

${isTs ? '' : '/** @type {Node[]} */'}
${isTs ? 'public ' : ''}children${isTs ? ': Node[]' : ''};
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertFailure(entry, result.code, [/Property 'y' does not exist on type 'Node'/]);
      });

      it(`template controller - repeat - contextual properties - pass`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="item of prop">\${$index} - \${item.toLowerCase()} - \${$first} - \${$last} - \${$even} - \${$odd} - \${$length}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? '' : '/** @type {string[]} */'}
${isTs ? 'public ' : ''}prop${isTs ? ': string[]' : ''};
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertSuccess(entry, result.code);
      });

      it(`template controller - nested repeat - contextual properties - pass`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `
  <template repeat.for="item1 of prop1">
    <template repeat.for="item2 of prop2">
      \${$parent.$index} - \${item1.toLowerCase()} - \${$parent.$first} - \${$parent.$last} - \${$parent.$even} - \${$parent.$odd} - \${$parent.$length}
      \${$index} - \${item2.toLowerCase()} - \${$first} - \${$last} - \${$even} - \${$odd} - \${$length}
    </template>
  </template>
  `;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? '' : '/** @type {string[]} */'}
${isTs ? 'public ' : ''}prop1${isTs ? ': string[]' : ''};
${isTs ? '' : '/** @type {string[]} */'}
${isTs ? 'public ' : ''}prop2${isTs ? ': string[]' : ''};
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertSuccess(entry, result.code);
      });
    });

    describe(`set - language: ${lang}`, function () {
      it(`template controller - repeat primitive set - pass`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="item of prop">\${item.toLowerCase()}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? '' : '/** @type {Set<string>} */'}
${isTs ? 'public ' : ''}prop${isTs ? ': Set<string>' : ''};
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertSuccess(entry, result.code);
      });

      it(`template controller - repeat primitive set - fail`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="item of prop">\${item.tolowercase()}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? '' : '/** @type {Set<string>} */'}
${isTs ? 'public ' : ''}prop${isTs ? ': Set<string>' : ''};
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertFailure(entry, result.code, [/Property 'tolowercase' does not exist on type 'string'/]);
      });

      it(`template controller - repeat Set<object> - pass`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="item of prop">\${item.x.toLowerCase()}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? '' : '/** @type {Set<Bar>} */'}
${isTs ? 'public ' : ''}prop${isTs ? ': Set<Bar>' : ''};
}

class Bar {
${isTs ? '' : '/** @type {string} */'}
${isTs ? 'public ' : ''}x${isTs ? ': string' : ''};
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertSuccess(entry, result.code);
      });

      it(`template controller - repeat Set<object> - fail`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="item of prop">\${item.x.toLowerCase()}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? '' : '/** @type {Set<Bar>} */'}
${isTs ? 'public ' : ''}prop${isTs ? ': Set<Bar>' : ''};
}

class Bar {
${isTs ? '' : '/** @type {string} */'}
${isTs ? 'public ' : ''}x1${isTs ? ': string' : ''};
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertFailure(entry, result.code, [/Property 'x' does not exist on type '.*Bar.*'/]);
      });

      it(`template controller - repeat primitive set - pass - with value converter`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="item of prop | identity">\${item.toLowerCase()}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? '' : '/** @type {Set<string>} */'}
${isTs ? 'public ' : ''}prop${isTs ? ': Set<string>' : ''};
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertSuccess(entry, result.code);
      });
    });

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
${isTs ? '' : '/** @type {Map<string, number>} */'}
${isTs ? 'public ' : ''}prop${isTs ? ': Map<string, number>' : ''};
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
${isTs ? '' : '/** @type {Map<string, number>} */'}
${isTs ? 'public ' : ''}prop${isTs ? ': Map<string, number>' : ''};
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
${isTs ? '' : '/** @type {Map<string, number>} */'}
${isTs ? 'public ' : ''}prop${isTs ? ': Map<string, number>' : ''};
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
${isTs ? '' : '/** @type {Map<string, number>} */'}
${isTs ? 'public ' : ''}prop${isTs ? ': Map<string, number>' : ''};
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
${isTs ? '' : '/** @type {Map<string, number>} */'}
${isTs ? 'public ' : ''}prop${isTs ? ': Map<string, number>' : ''};
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
${isTs ? '' : '/** @type {Map<string, number>} */'}
${isTs ? 'public ' : ''}prop${isTs ? ': Map<string, number>' : ''};
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
${isTs ? '' : '/** @type {Map<Key, Value>} */'}
${isTs ? 'public ' : ''}prop${isTs ? ': Map<Key, Value>' : ''};
}

class Key {
${isTs ? '' : '/** @type {number} */'}
${isTs ? 'public ' : ''}x${isTs ? ': number' : ''};

${isTs ? '' : '/** @type {number} */'}
${isTs ? 'public ' : ''}y${isTs ? ': number' : ''};
}

class Value {
${isTs ? '' : '/** @type {string} */'}
${isTs ? 'public ' : ''}a${isTs ? ': string' : ''};

${isTs ? '' : '/** @type {string} */'}
${isTs ? 'public ' : ''}b${isTs ? ': string' : ''};
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
${isTs ? '' : '/** @type {Map<Key, Value>} */'}
${isTs ? 'public ' : ''}prop${isTs ? ': Map<Key, Value>' : ''};
}

class Key {
${isTs ? '' : '/** @type {number} */'}
${isTs ? 'public ' : ''}x${isTs ? ': number' : ''};

${isTs ? '' : '/** @type {number} */'}
${isTs ? 'public ' : ''}y${isTs ? ': number' : ''};
}

class Value {
${isTs ? '' : '/** @type {string} */'}
${isTs ? 'public ' : ''}a${isTs ? ': string' : ''};

${isTs ? '' : '/** @type {string} */'}
${isTs ? 'public ' : ''}b${isTs ? ': string' : ''};
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
${isTs ? '' : '/** @type {Map<Key, Value>} */'}
${isTs ? 'public ' : ''}prop${isTs ? ': Map<Key, Value>' : ''};
}

class Key {
${isTs ? '' : '/** @type {number} */'}
${isTs ? 'public ' : ''}x${isTs ? ': number' : ''};

${isTs ? '' : '/** @type {number} */'}
${isTs ? 'public ' : ''}y${isTs ? ': number' : ''};
}

class Value {
${isTs ? '' : '/** @type {string} */'}
${isTs ? 'public ' : ''}a${isTs ? ': string' : ''};

${isTs ? '' : '/** @type {string} */'}
${isTs ? 'public ' : ''}b${isTs ? ': string' : ''};
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
${isTs ? '' : '/** @type {Map<Salt, Map<Shot, Lime>>} */'}
${isTs ? 'public ' : ''}prop${isTs ? ': Map<Salt, Map<Shot, Lime>>' : ''};
}

class Salt {
${isTs ? '' : '/** @type {number} */'}
${isTs ? 'public ' : ''}x${isTs ? ': number' : ''};

${isTs ? '' : '/** @type {number} */'}
${isTs ? 'public ' : ''}y${isTs ? ': number' : ''};
}

class Lime {
${isTs ? '' : '/** @type {string} */'}
${isTs ? 'public ' : ''}a${isTs ? ': string' : ''};

${isTs ? '' : '/** @type {string} */'}
${isTs ? 'public ' : ''}b${isTs ? ': string' : ''};
}

class Shot {
${isTs ? '' : '/** @type {string} */'}
${isTs ? 'public ' : ''}m${isTs ? ': string' : ''};

${isTs ? '' : '/** @type {string} */'}
${isTs ? 'public ' : ''}n${isTs ? ': string' : ''};
}
`,
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
${isTs ? '' : '/** @type {Map<Salt, Map<Shot, Lime>>} */'}
${isTs ? 'public ' : ''}prop${isTs ? ': Map<Salt, Map<Shot, Lime>>' : ''};
}

class Salt {
${isTs ? '' : '/** @type {number} */'}
${isTs ? 'public ' : ''}x${isTs ? ': number' : ''};

${isTs ? '' : '/** @type {number} */'}
${isTs ? 'public ' : ''}y${isTs ? ': number' : ''};
}

class Lime {
${isTs ? '' : '/** @type {string} */'}
${isTs ? 'public ' : ''}a${isTs ? ': string' : ''};

${isTs ? '' : '/** @type {string} */'}
${isTs ? 'public ' : ''}b${isTs ? ': string' : ''};
}

class Shot {
${isTs ? '' : '/** @type {string} */'}
${isTs ? 'public ' : ''}m${isTs ? ': string' : ''};

${isTs ? '' : '/** @type {string} */'}
${isTs ? 'public ' : ''}n${isTs ? ': string' : ''};
}
`,
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
${isTs ? '' : '/** @type {Map<Salt, Map<Shot, Lime>>} */'}
${isTs ? 'public ' : ''}prop${isTs ? ': Map<Salt, Map<Shot, Lime>>' : ''};
}

class Salt {
${isTs ? '' : '/** @type {number} */'}
${isTs ? 'public ' : ''}x${isTs ? ': number' : ''};

${isTs ? '' : '/** @type {number} */'}
${isTs ? 'public ' : ''}y${isTs ? ': number' : ''};
}

class Lime {
${isTs ? '' : '/** @type {string} */'}
${isTs ? 'public ' : ''}a${isTs ? ': string' : ''};

${isTs ? '' : '/** @type {string} */'}
${isTs ? 'public ' : ''}b${isTs ? ': string' : ''};
}

class Shot {
${isTs ? '' : '/** @type {string} */'}
${isTs ? 'public ' : ''}m${isTs ? ': string' : ''};

${isTs ? '' : '/** @type {string} */'}
${isTs ? 'public ' : ''}n${isTs ? ': string' : ''};
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertFailure(entry, result.code, [/Property 'aa' does not exist on type 'Lime'/]);
      });
    });

    describe(`range - language: ${lang}`, function () {
      it(`template controller - repeat range - pass - numeric property`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="item of prop">\${item.toExponential(2)}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? '' : '/** @type {number} */'}
${isTs ? 'public ' : ''}prop${isTs ? ': number' : ''};
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertSuccess(entry, result.code);
      });

      it(`template controller - repeat range - pass - numeric literal`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="item of 10">\${item.toExponential(2)}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertSuccess(entry, result.code);
      });

      it(`template controller - repeat range - fail - numeric property`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="item of 10">\${item.toexponential(2)}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? '' : '/** @type {number} */'}
${isTs ? 'public ' : ''}prop${isTs ? ': number' : ''};
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertFailure(entry, result.code, [/Property 'toexponential' does not exist on type 'number'/]);
      });

      it(`template controller - repeat range - fail - numeric literal`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="item of 10">\${item.toexponential(2)}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertFailure(entry, result.code, [/Property 'toexponential' does not exist on type 'number'/]);
      });

      it(`template controller - nested repeat range - pass - numeric property`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="item of prop"><template repeat.for="i of item">\${i.toExponential(2)}</template></template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? '' : '/** @type {number} */'}
${isTs ? 'public ' : ''}prop${isTs ? ': number' : ''};
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertSuccess(entry, result.code);
      });

      it(`template controller - nested repeat range - pass - numeric literal`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="item of 10"><template repeat.for="i of item">\${i.toExponential(2)}</template></template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? '' : '/** @type {number} */'}
${isTs ? 'public ' : ''}prop${isTs ? ': number' : ''};
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertSuccess(entry, result.code);
      });
    });

    // Note that as the VCs are not type-checked, the following tests are more-or-less hypothetical at this point.
    describe(`object - language: ${lang}`, function () {
      it(`template controller - repeat object - pass - keys`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="key of prop | keys">\${prop[key]}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? '' : '/** @type {{foo: string, bar: number}} */'}
${isTs ? 'public ' : ''}prop${isTs ? ': {foo: string, bar: number}' : ''};
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertSuccess(entry, result.code);
      });

      it(`template controller - repeat object - pass - values`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="value of prop | values">\${value}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? '' : '/** @type {{foo: string, bar: number}} */'}
${isTs ? 'public ' : ''}prop${isTs ? ': {foo: string, bar: number}' : ''};
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertSuccess(entry, result.code);
      });

      it(`template controller - repeat object - fail - keys`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="key of prop | keys">\${prop[key1]}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? '' : '/** @type {{foo: string, bar: number}} */'}
${isTs ? 'public ' : ''}prop${isTs ? ': {foo: string, bar: number}' : ''};
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertFailure(entry, result.code, [/Property '.*key1\d*' does not exist on type '.*Foo.*'/]);
      });

      it(`template controller - repeat object - fail - values`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="value of prop | values">\${value1}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? '' : '/** @type {{foo: string, bar: number}} */'}
${isTs ? 'public ' : ''}prop${isTs ? ': {foo: string, bar: number}' : ''};
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertFailure(entry, result.code, [/Property '.*value1\d*' does not exist on type '.*Foo.*'/]);
      });
    });

    it(`template controller - repeat FileList - pass`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = `<template repeat.for="file of files">\${file.name}</template>`;
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? '' : '/** @type {FileList} */'}
${isTs ? 'public ' : ''}files${isTs ? ': FileList' : ''};
}
`,
          readFile: createMarkupReader(markupFile, markup),
        }, nonConventionalOptions);

      assertSuccess(entry, result.code);
    });

    it(`template controller - repeat - kitchen sink - pass`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = `<template repeat.for="map of prop">
  <template repeat.for="[key, value] of map">
    \${key.toUpperCase()}
    <template repeat.for="item of value">
      <template repeat.for="i of item">\${i.toExponential(2)}</template>
    </template>
  </template>
</template>`;
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? '' : '/** @type {Map<string, Set<number>>[]} */'}
${isTs ? 'public ' : ''}prop${isTs ? ': Map<string, Set<number>>[]' : ''};
}
`,
          readFile: createMarkupReader(markupFile, markup),
        }, nonConventionalOptions);

      assertSuccess(entry, result.code);
    });
  }
});
