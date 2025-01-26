/* eslint-disable no-template-curly-in-string */
import {
  preprocessOptions,
  preprocessResource,
} from '@aurelia/plugin-conventions';
import {
  assertFailure,
  assertSuccess,
  createMarkupReader,
  prop
} from './_shared';

describe('type-checking/with-convention.basic', function () {
  const options = preprocessOptions({
    enableConventions: true,
    experimentalTemplateTypeCheck: true,
  });

  for (const [lang, extn] of [['TypeScript', 'ts'], ['JavaScript', 'js'], ['ESM', 'mjs']] as const) {
    const isTs = lang === 'TypeScript';
    it(`without decorator - pass - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = '${prop}';
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customElement } from '@aurelia/runtime-html';

export class Entry {
${prop('prop', 'string', isTs)}
}
`,
          readFile: createMarkupReader(markupFile, markup),
          filePair: markupFile,
        }, options);

      assertSuccess(entry, result.code);
    });

    it(`without decorator - fail - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = '${prop1}';
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customElement } from '@aurelia/runtime-html';

export class Entry {
${prop('prop', 'string', isTs)}
}
`,
          readFile: createMarkupReader(markupFile, markup),
          filePair: markupFile,
        }, options);

      assertFailure(entry, result.code, [/Property 'prop1' does not exist on type '.*Entry.*'\./]);
    });

    it(`with decorator - pass - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = '${prop}';
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement('ent-ry')
export class Entry {
${prop('prop', 'string', isTs)}
}
`,
          readFile: createMarkupReader(markupFile, markup),
          filePair: markupFile,
        }, options);

      assertSuccess(entry, result.code);
    });

    it(`with decorator - fail - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = '${prop1}';
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement('ent-ry')
export class Entry {
${prop('prop', 'string', isTs)}
}
`,
          readFile: createMarkupReader(markupFile, markup),
          filePair: markupFile,
        }, options);

      assertFailure(entry, result.code, [/Property 'prop1' does not exist on type '.*Entry.*'\./]);
    });

    it(`template controller - nested repeat object map - pass - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = `<template repeat.for="[sl, v] of prop">(\${sl.x},\${sl.y}) <template repeat.for="[sh, lm] of v">(\${sh.m},\${sh.n}) - (\${lm.a},\${lm.b})</template></template>`;
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customElement } from '@aurelia/runtime-html';

export class Entry {
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
}
`,
          readFile: createMarkupReader(markupFile, markup),
          filePair: markupFile,
        }, options);

      assertSuccess(entry, result.code);
    });

    it(`template controller - nested repeat object map - fail - incorrect declaration - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = `<template repeat.for="[sl, v] of prop">(\${sl.x},\${sl.y}) <template repeat.for="[sh, lm] of v1">(\${sh.m},\${sh.n}) - (\${lm.a},\${lm.b})</template></template>`;
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customElement } from '@aurelia/runtime-html';

export class Entry {
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
}
`,
          readFile: createMarkupReader(markupFile, markup),
          filePair: markupFile,
        }, options);

      assertFailure(entry, result.code, [/Property '.*v1\d+' does not exist on type '.*Entry.*'/], undefined, true);
    });

    it(`template controller - nested repeat object map - fail - incorrect usage - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = `<template repeat.for="[sl, v] of prop">(\${sl.x},\${sl.y}) <template repeat.for="[sh, lm] of v">(\${sh.m},\${sh.n}) - (\${lm.aa},\${lm.b})</template></template>`;
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customElement } from '@aurelia/runtime-html';

export class Entry {
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
}
`,
          readFile: createMarkupReader(markupFile, markup),
          filePair: markupFile,
        }, options);

      assertFailure(entry, result.code, [/Property 'aa' does not exist on type 'Lime'/]);
    });
  }
});
