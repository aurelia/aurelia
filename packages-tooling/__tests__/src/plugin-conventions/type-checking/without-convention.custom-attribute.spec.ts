import { preprocessResource } from '@aurelia/plugin-conventions';
import { createMarkupReader, assertSuccess, assertFailure, prop } from './_shared';
import { nonConventionalOptions } from './without-convention.basic';

describe('type-checking/without-convention.custom-attribute', function () {
  for (const [lang, extn] of [['TypeScript', 'ts'], ['JavaScript', 'js'], ['ESM', 'mjs']] as const) {
    const isTs = lang === 'TypeScript';
    it(`custom-attribute bindable - pass - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = '<div ca-one.bind="prop"></div>';
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customAttribute, customElement, bindable } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customAttribute('ca-one')
export class CaOne {
@bindable
${prop('value', 'string', isTs)}
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

    it(`custom-attribute bindable - fail - incorrect host property - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = '<div ca-one.bind="prop"></div>';
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customAttribute, customElement, bindable } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customAttribute('ca-one')
export class CaOne {
@bindable
${prop('value', 'string', isTs)}
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

    it(`custom-attribute bindable - nested property - pass - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = '<div ca-one.bind="prop.x"></div>';
      const depFile = `dep${isTs ? '' : `.${extn}`}`;
      const additionalModules = {
        [depFile]: `export class Dep {
      ${isTs ? 'public constructor(public x: string) {}' : '/** @type {string} */x'}
  }`};
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customAttribute, customElement, bindable } from '@aurelia/runtime-html';
import template from './${markupFile}';
import { Dep } from './${depFile}';

@customAttribute('ca-one')
export class CaOne {
@bindable
${prop('value', 'string', isTs)}
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

    it(`custom-attribute bindable - nested property - fail - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = '<div ca-one.bind="prop.y"></div>';
      const depFile = `dep${isTs ? '' : `.${extn}`}`;
      const additionalModules = {
        [depFile]: `export class Dep {
      ${isTs ? 'public constructor(public x: string) {}' : '/** @type {string} */x'}
  }`};
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customAttribute, customElement, bindable } from '@aurelia/runtime-html';
import template from './${markupFile}';
import { Dep } from './${depFile}';

@customAttribute('ca-one')
export class CaOne {
@bindable
${prop('value', 'string', isTs)}
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

    it(`custom-attribute bindable - value converter - pass - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = '<div ca-one.bind="prop | identity"></div>';
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customAttribute, customElement, bindable } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customAttribute('ca-one')
export class CaOne {
@bindable
${prop('value', 'string', isTs)}
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

    it(`custom-attribute bindable - binding behavior - pass - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = '<div ca-one.bind="prop & identity"></div>';
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customAttribute, customElement, bindable } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customAttribute('ca-one')
export class CaOne {
@bindable
${prop('value', 'string', isTs)}
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

    it(`custom-attribute $parent - pass - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = '<div ca-one.bind="$parent.x"></div>';
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customAttribute, customElement, bindable } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customAttribute('ca-one')
export class CaOne {
@bindable
${prop('value', 'string', isTs)}
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
