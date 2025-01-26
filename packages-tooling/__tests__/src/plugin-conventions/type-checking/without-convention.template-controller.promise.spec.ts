import { preprocessResource } from '@aurelia/plugin-conventions';
import { generateCartesianProduct } from '@aurelia/testing';
import { assertFailure, assertSuccess, createMarkupReader, prop } from './_shared';
import { nonConventionalOptions } from './without-convention.basic.spec';

describe('type-checking/without-convention.template-controller.promise', function () {
  for (const [lang, extn] of [['TypeScript', 'ts'], ['JavaScript', 'js'], ['ESM', 'mjs']] as const) {
    const isTs = lang === 'TypeScript';

    describe(`language: ${lang}`, function () {
      const promiseSyntaxes = ['promise.bind', 'promise'];
      const thenSyntaxes = ['then.from-view', 'then'];
      const catchSyntaxes = ['catch.from-view', 'catch'];

      for (const [p, t, c] of generateCartesianProduct([promiseSyntaxes, thenSyntaxes, catchSyntaxes])) {
        const syntaxes = `${p} - ${t} - ${c}`;

        it(`pass - ${syntaxes}`, function () {
          const entry = `entry.${extn}`;
          const markupFile = 'entry.html';
          const markup = `<template ${p}="prop">
      <span ${t}="data">\${data.toUpperCase()}</span>
      <span ${c}="error">\${error}</span>
      <span pending>loading...</span>
      </template>`;
          const result = preprocessResource(
            {
              path: entry,
              contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${prop('prop', 'Promise<string>', isTs)}
}
`,
              readFile: createMarkupReader(markupFile, markup),
            }, nonConventionalOptions);

          assertSuccess(entry, result.code);
        });

        it(`fail - ${syntaxes}`, function () {
          const entry = `entry.${extn}`;
          const markupFile = 'entry.html';
          const markup = `<template ${p}="prop">
      <span ${t}="data">\${data.touppercase()}</span>
      <span ${c}="error">\${error}</span>
      <span pending>loading...</span>
      </template>`;
          const result = preprocessResource(
            {
              path: entry,
              contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${prop('prop', 'Promise<string>', isTs)}
}
`,
              readFile: createMarkupReader(markupFile, markup),
            }, nonConventionalOptions);

          assertFailure(entry, result.code, [/Property 'touppercase' does not exist on type 'string'/]);
        });

        it(`non-promise - pass - ${syntaxes}`, function () {
          const entry = `entry.${extn}`;
          const markupFile = 'entry.html';
          const markup = `<template ${p}="prop">
      <span ${t}="data">\${data.toUpperCase()}</span>
      <span ${c}="error">\${error}</span>
      <span pending>loading...</span>
      </template>`;
          const result = preprocessResource(
            {
              path: entry,
              contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${prop('prop', 'string', isTs)}
}
`,
              readFile: createMarkupReader(markupFile, markup),
            }, nonConventionalOptions);

          assertSuccess(entry, result.code);
        });

        it(`non-promise - fail - ${syntaxes}`, function () {
          const entry = `entry.${extn}`;
          const markupFile = 'entry.html';
          const markup = `<template ${p}="prop">
      <span ${t}="data">\${data.touppercase()}</span>
      <span ${c}="error">\${error}</span>
      <span pending>loading...</span>
      </template>`;
          const result = preprocessResource(
            {
              path: entry,
              contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${prop('prop', 'string', isTs)}
}
`,
              readFile: createMarkupReader(markupFile, markup),
            }, nonConventionalOptions);

          assertFailure(entry, result.code, [/Property 'touppercase' does not exist on type 'string'/]);
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
          const result = preprocessResource(
            {
              path: entry,
              contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${prop('prop1', 'Promise<string>', isTs)}

${prop('prop2', 'Promise<number>', isTs)}
}
`,
              readFile: createMarkupReader(markupFile, markup),
            }, nonConventionalOptions);

          assertSuccess(entry, result.code);
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
          const result = preprocessResource(
            {
              path: entry,
              contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${prop('prop1', 'Promise<string>', isTs)}

${prop('prop2', 'Promise<number>', isTs)}
}
`,
              readFile: createMarkupReader(markupFile, markup),
            }, nonConventionalOptions);

          assertSuccess(entry, result.code);
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
          const result = preprocessResource(
            {
              path: entry,
              contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${prop('prop1', 'Promise<string>', isTs)}

${prop('prop2', 'Promise<number>', isTs)}
}
`,
              readFile: createMarkupReader(markupFile, markup),
            }, nonConventionalOptions);

          assertFailure(entry, result.code, [/Property 'toUpperCase' does not exist on type 'number'/]);
        });
      }
    });
  }
});
