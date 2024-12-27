import { preprocessResource } from '@aurelia/plugin-conventions';
import { createMarkupReader, assertSuccess, assertFailure, prop } from './_shared';
import { nonConventionalOptions } from './without-convention.basic.spec';

describe('type-checking/without-convention.custom-element', function () {
  for (const [lang, extn] of [['TypeScript', 'ts'], ['JavaScript', 'js'], ['ESM', 'mjs']] as const) {
    const isTs = lang === 'TypeScript';
    it(`custom-element bindable - pass - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = '<ce-one prop.bind="prop"></ce-one>';
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customElement, bindable } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'ce-one', template: '\${prop}' })
export class CeOne {
@bindable
${prop('prop', 'string', isTs)}
}

@customElement({ name: 'foo', template })
export class Foo {
${prop('prop', 'string', isTs)}
}
`,
          readFile: createMarkupReader(markupFile, markup),
        }, nonConventionalOptions);

      assertSuccess(entry, result.code);
    });

    it(`custom-element bindable - fail - incorrect host property - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = '<ce-one prop.bind="prop"></ce-one>';
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customElement, bindable } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'ce-one', template: '\${prop}' })
export class CeOne {
@bindable
${prop('prop', 'string', isTs)}
}

@customElement({ name: 'foo', template })
export class Foo {
${prop('prop1', 'string', isTs)}
}
`,
          readFile: createMarkupReader(markupFile, markup),
        }, nonConventionalOptions);

      assertFailure(entry, result.code, [/Property 'prop' does not exist on type '.*Foo.*'/]);
    });

    // TODO(phase2): make this work; probably need to use something like webpack plugin to access to the complete TS project
    it.skip(`custom-element bindable - fail - incorrect CE bindable - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = '<ce-one prop.bind="prop"></ce-one>';
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customElement, bindable } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'ce-one', template: '\${prop1}' })
export class CeOne {
@bindable
${prop('prop1', 'string', isTs)}
}

@customElement({ name: 'foo', template })
export class Foo {
${prop('prop', 'string', isTs)}
}
`,
          readFile: createMarkupReader(markupFile, markup),
        }, nonConventionalOptions);

      assertFailure(entry, result.code, [/Property 'prop' does not exist on type 'CeOne'/]);
    });

    it(`custom-element bindable - short-hand - pass - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = '<ce-one prop.bind></ce-one>';
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customElement, bindable } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'ce-one', template: '\${prop}' })
export class CeOne {
@bindable
${prop('prop', 'string', isTs)}
}

@customElement({ name: 'foo', template })
export class Foo {
${prop('prop', 'string', isTs)}
}
`,
          readFile: createMarkupReader(markupFile, markup),
        }, nonConventionalOptions);

      assertSuccess(entry, result.code);
    });

    it(`custom-element bindable - short-hand - fail - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = '<ce-one prop.bind></ce-one>';
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customElement, bindable } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'ce-one', template: '\${prop}' })
export class CeOne {
@bindable
${prop('prop', 'string', isTs)}
}

@customElement({ name: 'foo', template })
export class Foo {
${prop('prop1', 'string', isTs)}
}
`,
          readFile: createMarkupReader(markupFile, markup),
        }, nonConventionalOptions);

      assertFailure(entry, result.code, [/Property 'prop' does not exist on type '.*Foo.*'/]);
    });

    it(`custom-element bindable - nested property - pass - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = '<ce-one prop.bind="prop.x"></ce-one>';
      const depFile = `dep${isTs ? '' : `.${extn}`}`;
      const additionalModules = {
        [depFile]: `export class Dep {
        ${isTs ? 'public constructor(public x: string) {}' : '/** @type {string} */x'}
    }`};
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customElement, bindable } from '@aurelia/runtime-html';
import template from './${markupFile}';
import { Dep } from './${depFile}';

@customElement({ name: 'ce-one', template: '\${prop}' })
export class CeOne {
@bindable
${prop('prop', 'string', isTs)}
}

@customElement({ name: 'foo', template })
export class Foo {
${prop('prop', 'Dep', isTs)}
}
`,
          readFile: createMarkupReader(markupFile, markup),
        }, nonConventionalOptions);

      assertSuccess(entry, result.code, additionalModules);
    });

    it(`custom-element bindable - nested property - fail - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = '<ce-one prop.bind="prop.y"></ce-one>';
      const depFile = `dep${isTs ? '' : `.${extn}`}`;
      const additionalModules = {
        [depFile]: `export class Dep {
        ${isTs ? 'public constructor(public x: string) {}' : '/** @type {string} */x'}
    }`};
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customElement, bindable } from '@aurelia/runtime-html';
import template from './${markupFile}';
import { Dep } from './${depFile}';

@customElement({ name: 'ce-one', template: '\${prop}' })
export class CeOne {
@bindable
${prop('prop', 'string', isTs)}
}

@customElement({ name: 'foo', template })
export class Foo {
${prop('prop', 'Dep', isTs)}
}
`,
          readFile: createMarkupReader(markupFile, markup),
        }, nonConventionalOptions);

      assertFailure(entry, result.code, [/Property 'y' does not exist on type 'Dep'/], additionalModules);
    });

    it(`custom-element bindable - value-converter - pass - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = '<ce-one prop.bind="prop | identity"></ce-one>';
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customElement, bindable } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'ce-one', template: '\${prop}' })
export class CeOne {
@bindable
${prop('prop', 'string', isTs)}
}

@customElement({ name: 'foo', template })
export class Foo {
${prop('prop', 'string', isTs)}
}
`,
          readFile: createMarkupReader(markupFile, markup),
        }, nonConventionalOptions);

      assertSuccess(entry, result.code);
    });

    it(`custom-element bindable - binding behavior - pass - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = '<ce-one prop.bind="prop & identity"></ce-one>';
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customElement, bindable } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'ce-one', template: '\${prop}' })
export class CeOne {
@bindable
${prop('prop', 'string', isTs)}
}

@customElement({ name: 'foo', template })
export class Foo {
${prop('prop', 'string', isTs)}
}
`,
          readFile: createMarkupReader(markupFile, markup),
        }, nonConventionalOptions);

      assertSuccess(entry, result.code);
    });

    it(`custom-element bindable $parent - pass - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = '<ce-one prop.bind="$parent.x"></ce-one>';
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customElement, bindable } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'ce-one', template: '\${prop}' })
export class CeOne {
@bindable
${prop('prop', 'string', isTs)}
}

@customElement({ name: 'foo', template })
export class Foo {}
`,
          readFile: createMarkupReader(markupFile, markup),
        }, nonConventionalOptions);

      assertSuccess(entry, result.code);
    });
  }
});
