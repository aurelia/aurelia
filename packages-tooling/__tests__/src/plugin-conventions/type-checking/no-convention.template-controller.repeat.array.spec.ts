import { preprocessResource } from '@aurelia/plugin-conventions';
import { createMarkupReader, assertSuccess, assertFailure, prop } from './_shared';
import { nonConventionalOptions } from './without-convention.basic.spec';

describe('type-checking/without-convention.template-controller.repeat.array', function () {
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
${prop('prop', 'string[]', isTs)}
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
${prop('prop', 'string[]', isTs)}
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
${prop('prop', 'string[]', isTs)}
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
${prop('prop', 'string[]', isTs)}
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
${prop('prop1', 'string[]', isTs)}
${prop('prop2', 'number[]', isTs)}
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
${prop('prop1', 'string[]', isTs)}
${prop('prop2', 'number[]', isTs)}
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
${prop('prop1', 'string[]', isTs)}
${prop('prop2', 'number[]', isTs)}
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
${prop('prop1', 'string[]', isTs)}
${prop('prop2', 'number[]', isTs)}
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
${prop('prop', 'Bar[]', isTs)}
}

class Bar {
${prop('x', 'string', isTs)}
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
${prop('prop', 'Bar[]', isTs)}
}

class Bar {
${prop('x1', 'string', isTs)}
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
${prop('prop1', 'Bar[]', isTs)}
${prop('prop2', 'Baz[]', isTs)}
}

class Bar {
${prop('x', 'string', isTs)}
}

class Baz {
${prop('y', 'number', isTs)}
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
${prop('prop1', 'Bar[]', isTs)}
${prop('prop2', 'Baz[]', isTs)}
}

class Bar {
${prop('x', 'string', isTs)}
}

class Baz {
${prop('y1', 'number', isTs)}
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
${prop('nodes', 'Node[]', isTs)}
}

class Node {
${prop('x', 'number', isTs)}
${prop('children', 'Node[]', isTs)}
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
${prop('nodes', 'Node[]', isTs)}
}

class Node {
${prop('x', 'number', isTs)}
${prop('children', 'Node[]', isTs)}
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
${prop('nodes', 'Node[]', isTs)}
}

class Node {
${prop('x', 'number', isTs)}
${prop('children', 'Node[]', isTs)}
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
${prop('prop', 'string[]', isTs)}
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertSuccess(entry, result.code);
      });

      it(`template controller - repeat - contextual properties - $this - pass`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="item of prop">\${$this.$index} - \${item.toLowerCase()} - \${$this.$first} - \${$this.$last} - \${$this.$even} - \${$this.$odd} - \${$this.$length}</template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${prop('prop', 'string[]', isTs)}
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
${prop('prop1', 'string[]', isTs)}
${prop('prop2', 'string[]', isTs)}
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertSuccess(entry, result.code);
      });
    });
  }
});
