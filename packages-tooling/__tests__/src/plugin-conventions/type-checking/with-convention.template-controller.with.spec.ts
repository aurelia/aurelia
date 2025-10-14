import { preprocessOptions, preprocessResource } from '@aurelia/plugin-conventions';
import { assertFailure, assertSuccess, createMarkupReader, prop } from './_shared';

describe('type-checking/with-convention.template-controller.with', function () {
  const options = preprocessOptions({
    enableConventions: true,
    experimentalTemplateTypeCheck: true,
  });

  for (const [lang, extn] of [['TypeScript', 'ts'], ['JavaScript', 'js'], ['ESM', 'mjs']] as const) {
    const isTs = lang === 'TypeScript';

    describe(`language: ${lang}`, function () {
      for (const withSyntax of ['with.bind', 'with'] as const) {
        it(`template controller - with (${withSyntax}) - pass`, function () {
          const entry = `entry.${extn}`;
          const markupFile = 'entry.html';
          const markup = `<template ${withSyntax}="person">\${name.toUpperCase()}</template>`;
          const result = preprocessResource({
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';

export class Entry {
${prop('person', '{ name: string }', isTs)}
}
`,
            readFile: createMarkupReader(markupFile, markup),
            filePair: markupFile,
          }, options);
          assertSuccess(entry, result.code);
        });

        it(`template controller - with (${withSyntax}) - leak guard - fail`, function () {
          const entry = `entry.${extn}`;
          const markupFile = 'entry.html';
          const markup = `<template ${withSyntax}="person">\${name.toUpperCase()}</template>\n\${name}`;
          const result = preprocessResource({
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';

export class Entry {
${prop('person', '{ name: string }', isTs)}
}
`,
            readFile: createMarkupReader(markupFile, markup),
            filePair: markupFile,
          }, options);
          assertFailure(entry, result.code, [/Property 'name' does not exist/]);
        });
      }
    });
  }
});
