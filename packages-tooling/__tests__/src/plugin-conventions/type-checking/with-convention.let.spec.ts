import { preprocessOptions, preprocessResource } from '@aurelia/plugin-conventions';
import { assertFailure, assertSuccess, createMarkupReader, prop } from './_shared';

describe('type-checking/with-convention.let', function () {
  const options = preprocessOptions({
    enableConventions: true,
    experimentalTemplateTypeCheck: true,
  });

  for (const [lang, extn] of [['TypeScript', 'ts'], ['JavaScript', 'js'], ['ESM', 'mjs']] as const) {
    const isTs = lang === 'TypeScript';

    it(`basic pass - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = `<let a.bind="person.name"></let>\n\${a.toUpperCase()}`;
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customElement } from '@aurelia/runtime-html';

export class Entry {
${prop('person', '{ name: string }', isTs)}
}
`,
          readFile: createMarkupReader(markupFile, markup),
          filePair: markupFile,
        },
        options,
      );
      assertSuccess(entry, result.code);
    });

    it(`basic fail - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = `<let a.bind="person.name"></let>\n\${a.nonExistent}`;
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customElement } from '@aurelia/runtime-html';

export class Entry {
${prop('person', '{ name: string }', isTs)}
}
`,
          readFile: createMarkupReader(markupFile, markup),
          filePair: markupFile,
        },
        options,
      );
      assertFailure(entry, result.code, [/Property 'nonExistent' does not exist on type 'string'/]);
    });

    it(`override + to-binding-context - pass - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = `<let x.bind="1" to-binding-context></let>\n\${x.toFixed(2)}`;
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customElement } from '@aurelia/runtime-html';

export class Entry {
${prop('x', 'string', isTs)}
}
`,
          readFile: createMarkupReader(markupFile, markup),
          filePair: markupFile,
        },
        options,
      );
      assertSuccess(entry, result.code);
    });

    it(`scoping across controllers - pass/fail - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const pass = `<let v.bind="person.name"></let><template if.bind="true">\${v.toUpperCase()}</template>`;
      const fail = `<template if.bind="true"><let z.bind="1"></let></template>\${z}`;

      const passResult = preprocessResource(
        {
          path: entry,
          contents: `
import { customElement } from '@aurelia/runtime-html';

export class Entry {
${prop('person', '{ name: string }', isTs)}
}
`,
          readFile: createMarkupReader(markupFile, pass),
          filePair: markupFile,
        },
        options,
      );
      assertSuccess(entry, passResult.code);

      const failResult = preprocessResource(
        {
          path: entry,
          contents: `
import { customElement } from '@aurelia/runtime-html';

export class Entry {}
`,
          readFile: createMarkupReader(markupFile, fail),
          filePair: markupFile,
        },
        options,
      );
      assertFailure(entry, failResult.code, [/Property 'z' does not exist on type '.*Entry.*'/]);
    });
  }
});
