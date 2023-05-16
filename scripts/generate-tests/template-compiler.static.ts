import { join } from 'path';
import { PropertyDeclaration, Statement } from 'typescript';
import project from '../project';
import {
  $$call,
  $$const,
  $$functionDecl,
  $$functionExpr,
  $$import,
  $$new,
  $$return,
  $access,
  $call,
  $class,
  $expression,
  $functionExpr,
  $param,
  $property,
  emit
} from './util';

const baseCase = (function () {
  const enum CharKind {
    none = 0,
    digit = 1,
    upper = 2,
    lower = 3,
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const isDigit = Object.assign(Object.create(null) as {}, {
    '0': true,
    '1': true,
    '2': true,
    '3': true,
    '4': true,
    '5': true,
    '6': true,
    '7': true,
    '8': true,
    '9': true,
  } as Record<string, true | undefined>);

  function charToKind(char: string): CharKind {
    if (char === '') {
      // We get this if we do charAt() with an index out of range
      return CharKind.none;
    }

    if (char !== char.toUpperCase()) {
      return CharKind.lower;
    }

    if (char !== char.toLowerCase()) {
      return CharKind.upper;
    }

    if (isDigit[char] === true) {
      return CharKind.digit;
    }

    return CharKind.none;
  }

  return function (input: string, cb: (char: string, sep: boolean) => string): string {
    const len = input.length;
    if (len === 0) {
      return input;
    }

    let sep = false;
    let output = '';

    let prevKind: CharKind;

    let curChar = '';
    let curKind = CharKind.none;

    let nextChar = input.charAt(0);
    let nextKind = charToKind(nextChar);

    for (let i = 0; i < len; ++i) {
      prevKind = curKind;

      curChar = nextChar;
      curKind = nextKind;

      nextChar = input.charAt(i + 1);
      nextKind = charToKind(nextChar);

      if (curKind === CharKind.none) {
        if (output.length > 0) {
          // Only set sep to true if it's not at the beginning of output.
          sep = true;
        }
      } else {
        if (!sep && output.length > 0 && curKind === CharKind.upper) {
          // Separate UAFoo into UA Foo.
          // Separate uaFOO into ua FOO.
          sep = prevKind === CharKind.lower || nextKind === CharKind.lower;
        }

        output += cb(curChar, sep);
        sep = false;
      }
    }

    return output;
  };
})();

const kebabCase = (function () {
  const cache = Object.create(null) as Record<string, string | undefined>;

  function callback(char: string, sep: boolean): string {
    return sep ? `-${char.toLowerCase()}` : char.toLowerCase();
  }

  return function (input: string): string {
    let output = cache[input];
    if (output === void 0) {
      output = cache[input] = baseCase(input, callback);
    }

    return output;
  };
})();

function outFile(suffix: string): string {
  return join(`${project.path}`, 'packages', '__tests__', '5-jit-html', 'generated', `template-compiler.${suffix}.spec.ts`);
}

interface Identifiable {
  id: string;
}
interface TextBinding extends Identifiable {
  markup: string;
  value: string;
  properties: PropertyDeclaration[];
  // tslint:disable-next-line:no-reserved-keywords
  static?: boolean;
  variable?: string;
  opposite?: TextBinding;
  isDuplicate?: boolean;
}
interface TplCtrl extends Identifiable {
  attr: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  properties: PropertyDeclaration[];
  prop?: string;
  opposite?: TplCtrl;
  isDuplicate?: boolean;
}
interface Tag extends Identifiable {
  name: string;
  elName?: string;
  isCustom?: boolean;
  containerless?: boolean;
  shadowMode?: 'open' | 'closed';
  isTemplate?: boolean;
}

const tags: Tag[] = [
  { id: 'tag$01', name: 'div' },
  // template is a duplicate so raw textBindings don't use it (double nested template with nothing on it doesn't work)
  { id: 'tag$02', name: 'template', isTemplate: true },
  { id: 'tag$03', name: 'template', elName: 'MyFoo', isCustom: true },
  { id: 'tag$04', name: 'template', elName: 'MyFoo', isCustom: true, containerless: true },
  { id: 'tag$05', name: 'template', elName: 'MyFoo', isCustom: true, shadowMode: 'open' },
  { id: 'tag$06', name: 'template', elName: 'MyFoo', isCustom: true, shadowMode: 'closed' },
];

const text$01_1: TextBinding = {
  id: 'text$01',
  markup: 'a',
  value: 'a',
  static: true,
  properties: []
};
const text$01_2: TextBinding = {
  id: 'text$01',
  markup: 'b',
  value: 'b',
  static: true,
  properties: []
};
text$01_1.opposite = text$01_2;
text$01_2.opposite = text$01_1;

const text$02_1: TextBinding = {
  id: 'text$02',
  markup: 'a',
  value: 'a',
  static: true,
  properties: [],
  isDuplicate: true
};
const text$02_2: TextBinding = {
  id: 'text$02',
  markup: `\${not}`,
  variable: 'not',
  value: 'b',
  properties: [$property('not', 'b')]
};
text$02_1.opposite = text$02_2;
text$02_2.opposite = text$02_1;

const text$03_1: TextBinding = {
  id: 'text$03',
  markup: `\${msg}`,
  variable: 'msg',
  value: 'a',
  properties: [$property('msg', 'a')]
};
const text$03_2: TextBinding = {
  id: 'text$03',
  markup: `\${not}`,
  variable: 'not',
  value: 'b',
  properties: [$property('not', 'b')]
};
text$03_1.opposite = text$03_2;
text$03_2.opposite = text$03_1;

const text$04_1: TextBinding = {
  id: 'text$04',
  markup: `\${msg}`,
  variable: 'msg',
  value: 'a',
  properties: [$property('msg', 'a')],
  isDuplicate: true
};
const text$04_2: TextBinding = {
  id: 'text$04',
  markup: `\${not}`,
  variable: 'not',
  value: 'b',
  properties: [$property('not', 'b')]
};
text$04_1.opposite = text$04_2;
text$04_2.opposite = text$04_1;

const texts = [text$01_1, text$02_1, text$03_1, text$04_1];

const if$01_1: TplCtrl = {
  id: 'if$01',
  value: true,
  attr: 'if.bind="true"',
  properties: []
};
const if$01_2: TplCtrl = {
  id: 'if$01',
  value: false,
  attr: 'else',
  properties: []
};
if$01_1.opposite = if$01_2;
if$01_2.opposite = if$01_1;

const if$02_1: TplCtrl = {
  id: 'if$02',
  value: false,
  attr: 'if.bind="false"',
  properties: []
};
const if$02_2: TplCtrl = {
  id: 'if$02',
  value: true,
  attr: 'else',
  properties: []
};
if$02_1.opposite = if$02_2;
if$02_2.opposite = if$02_1;

const ifElses = [if$01_1, if$02_1];

const repeat$11_1: TplCtrl = {
  id: 'repeat$11',
  value: 1,
  attr: 'repeat.for="i of 1"',
  properties: []
};
const repeat$11_2: TplCtrl = {
  id: 'repeat$11',
  value: 0,
  attr: 'repeat.for="i of 0"',
  properties: []
};
repeat$11_1.opposite = repeat$11_2;
repeat$11_2.opposite = repeat$11_1;

const repeat$12_1: TplCtrl = {
  id: 'repeat$12',
  value: 3,
  attr: 'repeat.for="i of 3"',
  properties: []
};
const repeat$12_2: TplCtrl = {
  id: 'repeat$12',
  value: 0,
  attr: 'repeat.for="i of 0"',
  properties: []
};
repeat$12_1.opposite = repeat$12_2;
repeat$12_2.opposite = repeat$12_1;

const repeat$13_1: TplCtrl = {
  id: 'repeat$13',
  value: ['a', 'b', 'c'],
  prop: 'item',
  attr: 'repeat.for="item of [\'a\', \'b\', \'c\']"',
  properties: []
};
const repeat$13_2: TplCtrl = {
  id: 'repeat$13',
  value: [],
  prop: 'item',
  attr: 'repeat.for="item of []"',
  properties: []
};
repeat$13_1.opposite = repeat$13_2;
repeat$13_2.opposite = repeat$13_1;

const repeats = [repeat$11_1, repeat$12_1, repeat$13_1];

function registerCustomElement(
  tag: Tag,
  ifText: TextBinding,
  elseText: TextBinding,
  markup: string,
  containerless: boolean | null,
  shadowMode: 'open' | 'closed' | null,
): Statement[] {
  return [
    $$const(tag.elName, $call('CustomElement.define', [
      $expression({
        name: kebabCase(tag.elName),
        template: `<template>${markup}</template>`
      }),
      $class([
        $property(
          'bindables',
          [ifText.variable, elseText.variable, 'item'],
          true
        ),
        ...containerless !== null ? [$property('containerless', true, true)] : [],
        ...shadowMode !== null ? [$property('shadowOptions', { mode: shadowMode }, true)] : [],
        $property(ifText.variable, ''),
        $property(elseText.variable, ''),
        $property('item', '')
      ])
    ])),
    $$call('au.register', [tag.elName])
  ];
}

function fixup(
  isArray: boolean,
  ifVarRegex: RegExp,
  elseVarRegex: RegExp,
  $repeat: TplCtrl,
  text: TextBinding,
): string {
  // if the repeater is an array (not a number), replace the interpolation expression from the textBinding
  // with the property specified by the repeat's variable
  // this is a bit lazy, probably need to refactor this eventually anyway
  return isArray ? text.markup.replace(ifVarRegex, $repeat.prop).replace(elseVarRegex, $repeat.prop) : text.markup;
}

// eslint-disable-next-line max-lines-per-function
function generateTests(testTags: Tag[], textBindings: TextBinding[], ifElsePairs: TplCtrl[], repeaters: TplCtrl[]): Record<string, Statement[]> {
  const tests: Record<string, Statement[]> = {};
  const staticTests: Statement[] = tests['static'] = [];
  const ifElseTests: Statement[] = tests['static.if-else'] = [];
  const ifElseDoubleTests: Statement[] = tests['static.if-else.double'] = [];
  const ifElseRepeatTests: Statement[] = tests['static.if-else.repeat'] = [];
  const ifElseRepeatDoubleTests: Statement[] = tests['static.if-else.repeat.double'] = [];

  for (const tag of testTags) {

    for (const textBinding of textBindings) {

      const ifText = { ...textBinding };
      const elseText = { ...textBinding.opposite };
      ifText.opposite = elseText;
      elseText.opposite = ifText;

      const resources = [];

      if (tag.isCustom) {
        if (ifText.static || elseText.static) {
          continue;
        }
      }

      if (!ifText.isDuplicate) {
        if (tag.isTemplate) {
          // non-wrapped interpolation
          staticTests.push($$test(
            ifText.markup,
            ifText.value,
            ifText.properties,
            [tag, ifText],
            [])
          );
        } else if (tag.isCustom) {
          // binding with custom element
          const $tag = kebabCase(tag.elName);
          staticTests.push($$test(
            `<${$tag} ${ifText.variable}.bind="${ifText.variable}"></${$tag}>`,
            ifText.value,
            ifText.properties,
            [tag, ifText],
            registerCustomElement(tag, ifText, elseText, ifText.markup, tag.containerless === undefined ? null : tag.containerless, tag.shadowMode === undefined ? null : tag.shadowMode))
          );
        } else {
          // interpolation wrapped in div
          staticTests.push($$test(
            $(tag, [], ifText.markup),
            ifText.value,
            ifText.properties,
            [tag, ifText],
            [])
          );
        }
      }
      if (tag.isCustom) {
        const $tag = kebabCase(tag.elName);
        resources.push(...registerCustomElement(tag, ifText, elseText, `${ifText.markup}${elseText.markup}\${item}`, tag.containerless === undefined ? null : tag.containerless, tag.shadowMode === undefined ? null : tag.shadowMode));
        ifText.markup = `<${$tag} ${ifText.variable}.bind="${ifText.variable}"></${$tag}>`;
        elseText.markup = `<${$tag} ${elseText.variable}.bind="${elseText.variable}"></${$tag}>`;
      }

      for (const ifElsePair of ifElsePairs) {

        const $if = ifElsePair;
        const $else = ifElsePair.opposite;

        const expected = $if.value ? ifText.value : elseText.value;
        const properties = [...ifText.properties, ...elseText.properties, ...$if.properties, ...$else.properties];

        const branchId = $if.value === true ? 'if' : 'else';
        const ifMarkupExpected = $if.value === true ? ifText.value : '';
        const elseMarkupExpected = $else.value === true ? elseText.value : '';

        // only if branch
        if (!tag.isCustom || $if.value === true) {
          ifElseTests.push($$test(
            $(tag, [$if], ifText.markup),
            ifMarkupExpected,
            properties,
            [tag, ifText, $if, {id: `${branchId}$01`}],
            resources)
          );
          // if (!tag.hasReplaceable) {
          ifElseDoubleTests.push($$test(
            $(tag, [$if], ifText.markup) +
              $(tag, [$if], ''),
            ifMarkupExpected,
            properties,
            [tag, ifText, $if, {id: `${branchId}$01`}, {id: 'double$01'}],
            resources)
          );
          ifElseDoubleTests.push($$test(
            $(tag, [$if], '') +
              $(tag, [$if], ifText.markup),
            ifMarkupExpected,
            properties,
            [tag, ifText, $if, {id: `${branchId}$01`}, {id: 'double$02'}],
            resources)
          );
          ifElseDoubleTests.push($$test(
            $(tag, [$if], ifText.markup) +
              $(tag, [$if], ifText.markup),
            ifMarkupExpected.repeat(2),
            properties,
            [tag, ifText, $if, {id: `${branchId}$01`}, {id: 'double$03'}],
            resources)
          );
          // }

          // only if branch (nested)
          ifElseTests.push($$test(
            $(tag, [$if], $(tag, [$if], ifText.markup)),
            ifMarkupExpected,
            properties,
            [tag, ifText, $if, {id: `${branchId}$01`}, {id: `nested$01`}],
            resources)
          );
          // if (!tag.hasReplaceable) {
          ifElseDoubleTests.push($$test(
            $(tag, [$if], $(tag, [$if], ifText.markup)) +
              $(tag, [$if], ''),
            ifMarkupExpected,
            properties,
            [tag, ifText, $if, {id: `${branchId}$01`}, {id: `nested$01`}, {id: 'double$01'}],
            resources)
          );
          ifElseDoubleTests.push($$test(
            $(tag, [$if], $(tag, [$if], ifText.markup)) +
              $(tag, [$if], $(tag, [$if], '')),
            ifMarkupExpected,
            properties,
            [tag, ifText, $if, {id: `${branchId}$01`}, {id: `nested$01`}, {id: 'double$02'}],
            resources)
          );
          ifElseDoubleTests.push($$test(
            $(tag, [$if], '') +
              $(tag, [$if], $(tag, [$if], ifText.markup)),
            ifMarkupExpected,
            properties,
            [tag, ifText, $if, {id: `${branchId}$01`}, {id: `nested$01`}, {id: 'double$03'}],
            resources)
          );
          ifElseDoubleTests.push($$test(
            $(tag, [$if], $(tag, [$if], '')) +
              $(tag, [$if], $(tag, [$if], ifText.markup)),
            ifMarkupExpected,
            properties,
            [tag, ifText, $if, {id: `${branchId}$01`}, {id: `nested$01`}, {id: 'double$04'}],
            resources)
          );
          ifElseDoubleTests.push($$test(
            $(tag, [$if], $(tag, [$if], ifText.markup)) +
              $(tag, [$if], $(tag, [$if], ifText.markup)),
            ifMarkupExpected.repeat(2),
            properties,
            [tag, ifText, $if, {id: `${branchId}$01`}, {id: `nested$01`}, {id: 'double$05'}],
            resources)
          );
          // }
        }

        if (!tag.isCustom || $else.value === true) {
          // only else branch
          ifElseTests.push($$test(
            $(tag, [$if], '') +
            $(tag, [$else], elseText.markup),
            elseMarkupExpected,
            properties,
            [tag, ifText, $if, {id: `${branchId}$02`}],
            resources)
          );
          // if (!tag.hasReplaceable) {
          ifElseDoubleTests.push($$test(
            $(tag, [$if], '') +
              $(tag, [$else], elseText.markup) +
              $(tag, [$if], '') +
              $(tag, [$else], ''),
            elseMarkupExpected,
            properties,
            [tag, ifText, $if, {id: `${branchId}$02`}, {id: 'double$01'}],
            resources)
          );
          ifElseDoubleTests.push($$test(
            $(tag, [$if], '') +
              $(tag, [$else], '') +
              $(tag, [$if], '') +
              $(tag, [$else], elseText.markup),
            elseMarkupExpected,
            properties,
            [tag, ifText, $if, {id: `${branchId}$02`}, {id: 'double$02'}],
            resources)
          );
          ifElseDoubleTests.push($$test(
            $(tag, [$if], '') +
              $(tag, [$else], elseText.markup) +
              $(tag, [$if], '') +
              $(tag, [$else], elseText.markup),
            elseMarkupExpected.repeat(2),
            properties,
            [tag, ifText, $if, {id: `${branchId}$02`}, {id: 'double$03'}],
            resources)
          );
          // }

          // only else branch (nested)
          ifElseTests.push($$test(
            $(tag, [$if], '') +
            $(tag, [$else], $(tag, [$if], '') +
              $(tag, [$else], elseText.markup)
            ),
            elseMarkupExpected,
            properties,
            [tag, ifText, $if, {id: `${branchId}$03`}, {id: `nested$01`}],
            resources)
          );
          // if (!tag.hasReplaceable) {
          ifElseDoubleTests.push($$test(
            $(tag, [$if], '') +
              $(tag, [$else], $(tag, [$if], '') +
                $(tag, [$else], elseText.markup)
              ) +
              $(tag, [$if], '') +
              $(tag, [$else], ''),
            elseMarkupExpected,
            properties,
            [tag, ifText, $if, {id: `${branchId}$03`}, {id: `nested$01`}, {id: 'double$01'}],
            resources)
          );
          ifElseDoubleTests.push($$test(
            $(tag, [$if], '') +
              $(tag, [$else], $(tag, [$if], '') +
                $(tag, [$else], elseText.markup)
              ) +
              $(tag, [$if], '') +
              $(tag, [$else], $(tag, [$if], '') +
                $(tag, [$else], '')
              ),
            elseMarkupExpected,
            properties,
            [tag, ifText, $if, {id: `${branchId}$03`}, {id: `nested$01`}, {id: 'double$02'}],
            resources)
          );
          ifElseDoubleTests.push($$test(
            $(tag, [$if], '') +
              $(tag, [$else], $(tag, [$if], '') +
                $(tag, [$else], '')
              ) +
              $(tag, [$if], '') +
              $(tag, [$else], $(tag, [$if], '') +
                $(tag, [$else], elseText.markup)
              ),
            elseMarkupExpected,
            properties,
            [tag, ifText, $if, {id: `${branchId}$03`}, {id: `nested$01`}, {id: 'double$03'}],
            resources)
          );
          ifElseDoubleTests.push($$test(
            $(tag, [$if], '') +
              $(tag, [$else], $(tag, [$if], '') +
                $(tag, [$else], elseText.markup)
              ) +
              $(tag, [$if], '') +
              $(tag, [$else], $(tag, [$if], '') +
                $(tag, [$else], elseText.markup)
              ),
            elseMarkupExpected.repeat(2),
            properties,
            [tag, ifText, $if, {id: `${branchId}$03`}, {id: `nested$01`}, {id: 'double$04'}],
            resources)
          );
          // }
        }

        // if + else branch
        ifElseTests.push($$test(
          $(tag, [$if], ifText.markup) +
          $(tag, [$else], elseText.markup),
          expected,
          properties,
          [tag, ifText, $if, {id: `${branchId}$04`}],
          resources)
        );
        // if (!tag.hasReplaceable) {
        ifElseDoubleTests.push($$test(
          $(tag, [$if], ifText.markup) +
            $(tag, [$else], elseText.markup) +
            $(tag, [$if], '') +
            $(tag, [$else], ''),
          expected,
          properties,
          [tag, ifText, $if, {id: `${branchId}$04`}, {id: 'double$01'}],
          resources)
        );
        ifElseDoubleTests.push($$test(
          $(tag, [$if], '') +
            $(tag, [$else], '') +
            $(tag, [$if], ifText.markup) +
            $(tag, [$else], elseText.markup),
          expected,
          properties,
          [tag, ifText, $if, {id: `${branchId}$04`}, {id: 'double$02'}],
          resources)
        );
        ifElseDoubleTests.push($$test(
          $(tag, [$if], ifText.markup) +
            $(tag, [$else], elseText.markup) +
            $(tag, [$if], ifText.markup) +
            $(tag, [$else], elseText.markup),
          expected.repeat(2),
          properties,
          [tag, ifText, $if, {id: `${branchId}$04`}, {id: 'double$03'}],
          resources)
        );
        // }

        // if + else branch (nested)
        ifElseTests.push($$test(
          $(tag, [$if], $(tag, [$if], ifText.markup) +
            $(tag, [$else], elseText.markup)
          ) +
          $(tag, [$else], $(tag, [$if], ifText.markup) +
            $(tag, [$else], elseText.markup)
          ),
          expected,
          properties,
          [tag, ifText, $if, {id: `${branchId}$05`}, {id: `nested$01`}],
          resources)
        );
        // if (!tag.hasReplaceable) {
        ifElseDoubleTests.push($$test(
          $(tag, [$if], $(tag, [$if], ifText.markup) +
              $(tag, [$else], elseText.markup)
          ) +
            $(tag, [$else], $(tag, [$if], ifText.markup) +
              $(tag, [$else], elseText.markup)
            ) +
            $(tag, [$if], '') +
            $(tag, [$else], ''),
          expected,
          properties,
          [tag, ifText, $if, {id: `${branchId}$05`}, {id: `nested$01`}, {id: 'double$01'}],
          resources)
        );
        ifElseDoubleTests.push($$test(
          $(tag, [$if], $(tag, [$if], ifText.markup) +
              $(tag, [$else], elseText.markup)
          ) +
            $(tag, [$else], $(tag, [$if], ifText.markup) +
              $(tag, [$else], elseText.markup)
            ) +
            $(tag, [$if], '') +
            $(tag, [$else], $(tag, [$if], '') +
              $(tag, [$else], '')
            ),
          expected,
          properties,
          [tag, ifText, $if, {id: `${branchId}$05`}, {id: `nested$01`}, {id: 'double$02'}],
          resources)
        );
        ifElseDoubleTests.push($$test(
          $(tag, [$if], '') +
            $(tag, [$else], $(tag, [$if], '') +
              $(tag, [$else], '')
            ) +
            $(tag, [$if], $(tag, [$if], ifText.markup) +
              $(tag, [$else], elseText.markup)
            ) +
            $(tag, [$else], $(tag, [$if], ifText.markup) +
              $(tag, [$else], elseText.markup)
            ),
          expected,
          properties,
          [tag, ifText, $if, {id: `${branchId}$05`}, {id: `nested$01`}, {id: 'double$03'}],
          resources)
        );
        ifElseDoubleTests.push($$test(
          $(tag, [$if], $(tag, [$if], ifText.markup) +
              $(tag, [$else], elseText.markup)
          ) +
            $(tag, [$else], $(tag, [$if], ifText.markup) +
              $(tag, [$else], elseText.markup)
            ) +
            $(tag, [$if], $(tag, [$if], ifText.markup) +
              $(tag, [$else], elseText.markup)
            ) +
            $(tag, [$else], $(tag, [$if], ifText.markup) +
              $(tag, [$else], elseText.markup)
            ),
          expected.repeat(2),
          properties,
          [tag, ifText, $if, {id: `${branchId}$05`}, {id: `nested$01`}, {id: 'double$04'}],
          resources)
        );

        // if + else branch (same element)
        ifElseDoubleTests.push($$test(
          $(tag, [$if], ifText.markup) +
            $(tag, [$else, $if], elseText.markup) + // never renders
            $(tag, [$if], '') +
            $(tag, [$else], elseText.markup),
          expected,
          properties,
          [tag, ifText, $if, {id: `${branchId}$06`}, {id: 'sibling$01'}],
          resources)
        );
        ifElseDoubleTests.push($$test(
          $(tag, [$if], '') +
            $(tag, [$else, $if], '') + // never renders
            $(tag, [$if], ifText.markup) +
            $(tag, [$else], elseText.markup),
          expected,
          properties,
          [tag, ifText, $if, {id: `${branchId}$06`}, {id: 'sibling$02'}],
          resources)
        );
        ifElseDoubleTests.push($$test(
          $(tag, [$if], '') +
            $(tag, [$else, $if], elseText.markup) + // never renders
            $(tag, [$if], ifText.markup) +
            $(tag, [$else], elseText.markup),
          expected,
          properties,
          [tag, ifText, $if, {id: `${branchId}$06`}, {id: 'sibling$03'}],
          resources)
        );
        // ifElseDoubleTests.push($$test(
        //   $(tag, [$if], ifText.markup) +
        //   $(tag, [$else, $if], elseText.markup) + // never renders
        //   $(tag, [$else, $if], ifText.markup) + // never renders
        //   $(tag, [$if], '') +
        //   $(tag, [$else], elseText.markup),
        //   expected, properties, [tag, ifText, $if, {id: `${branchId}$06`}, {id: 'sibling$04'}], resources)
        // );
        // }

        for (const $repeat of repeaters) {
          // only work with number or arrays as the repeaters value;
          // for a number we repeat the text content n times
          // otherwise we use the array values directly
          const isArray = Array.isArray($repeat.value);
          // skip generating variable repeater tests if the textBinding is a static value (prevent absolute test duplication)
          if (textBinding.static && isArray) {
            continue;
          }
          const $expected = isArray ? $repeat.value.join('') : expected.repeat($repeat.value);
          const ifVarRegex = new RegExp(ifText.variable === undefined ? '' : ifText.variable, 'g');
          const elseVarRegex = new RegExp(elseText.variable === undefined ? '' : elseText.variable, 'g');
          // identical to the if/else tests one level up, but wrapped in the repeater
          ifElseRepeatTests.push($$test(
            $(tag, [$repeat], $(tag, [$if], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, ifText)) +
              $(tag, [$else], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, elseText))
            ),
            $expected,
            properties,
            [tag, ifText, $if, $repeat, {id: 'variant$01'}],
            resources)
          );
          // if (!tag.hasReplaceable) {
          ifElseRepeatDoubleTests.push($$test(
            $(tag, [$repeat], $(tag, [$if], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, ifText)) +
              $(tag, [$else, $if], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, elseText)) +
              $(tag, [$if], '') +
              $(tag, [$else], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, elseText))
            ),
            $expected,
            properties,
            [tag, ifText, $if, $repeat, {id: 'variant$01$double'}],
            resources)
          );
          // }

          // the inverse of the fullIfElse wrapped by repeater (repeater wrapped by if/else)
          ifElseRepeatTests.push($$test(
            $(tag, [$if], $(tag, [$repeat], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, ifText))) +
            $(tag, [$else], $(tag, [$repeat], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, elseText))),
            $expected,
            properties,
            [tag, ifText, $if, $repeat, {id: 'variant$02'}],
            resources)
          );
          // if (!tag.hasReplaceable) {
          ifElseRepeatDoubleTests.push($$test(
            $(tag, [$if], $(tag, [$repeat], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, ifText))) +
            $(tag, [$else, $if], $(tag, [$repeat], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, elseText))) +
            $(tag, [$if], '') +
            $(tag, [$else], $(tag, [$repeat], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, elseText))),
            $expected,
            properties,
            [tag, ifText, $if, $repeat, {id: 'variant$02$double'}],
            resources)
          );
          // }
          // same as the test above but with the template controllers on the same element
          ifElseRepeatTests.push($$test(
            $(tag, [$if, $repeat], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, ifText)) +
            $(tag, [$else, $repeat], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, elseText)),
            $expected,
            properties,
            [tag, ifText, $if, $repeat, {id: 'variant$03'}],
            resources)
          );
          // if (!tag.hasReplaceable) {
          ifElseRepeatDoubleTests.push($$test(
            $(tag, [$if, $repeat], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, ifText)) +
            $(tag, [$else, $if, $repeat], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, elseText)) +
            $(tag, [$if, $repeat], '') +
            $(tag, [$else, $repeat], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, elseText)),
            $expected,
            properties,
            [tag, ifText, $if, $repeat, {id: 'variant$03$double$01'}],
            resources)
          );
          ifElseRepeatDoubleTests.push($$test(
            $(tag, [$if, $repeat], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, ifText)) +
            $(tag, [$else, $repeat, $if], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, elseText)) +
            $(tag, [$if, $repeat], '') +
            $(tag, [$else, $repeat], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, elseText)),
            $expected,
            properties,
            [tag, ifText, $if, $repeat, {id: 'variant$03$double$02'}],
            resources)
          );
          // }

          if (!$else.value) {
            ifElseRepeatTests.push($$test(
              $(tag, [$repeat], $(tag, [$if], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, ifText))),
              $expected,
              properties,
              [tag, ifText, $if, $repeat, {id: 'variant$04'}],
              resources)
            );
            // same as test above, but template controllers on same element
            ifElseRepeatTests.push($$test(
              $(tag, [$repeat, $if], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, ifText)),
              $expected,
              properties,
              [tag, ifText, $if, $repeat, {id: 'variant$05'}],
              resources)
            );
            ifElseRepeatTests.push($$test(
              $(tag, [$if], $(tag, [$repeat], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, ifText))),
              $expected,
              properties,
              [tag, ifText, $if, $repeat, {id: 'variant$06'}],
              resources)
            );
            // same as test above, but template controllers on same element
            ifElseRepeatTests.push($$test(
              $(tag, [$if, $repeat], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, ifText)),
              $expected,
              properties,
              [tag, ifText, $if, $repeat, {id: 'variant$07'}],
              resources)
            );

            ifElseRepeatTests.push($$test(
              $(tag, [$repeat], $(tag, [$if], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, ifText)) +
                $(tag, [$else], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, elseText))
              ),
              $expected,
              properties,
              [tag, ifText, $if, $repeat, {id: 'variant$08'}],
              resources)
            );
            ifElseRepeatTests.push($$test(
              $(tag, [$repeat], $(tag, [$if], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, ifText)) +
                $(tag, [$else], '')
              ),
              $expected,
              properties,
              [tag, ifText, $if, $repeat, {id: 'variant$08$empty'}],
              resources)
            );
            ifElseRepeatTests.push($$test(
              $(tag, [$if], $(tag, [$repeat], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, ifText))) +
              $(tag, [$else], $(tag, [$repeat], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, ifText))),
              $expected,
              properties,
              [tag, ifText, $if, $repeat, {id: 'variant$09'}],
              resources)
            );
            ifElseRepeatTests.push($$test(
              $(tag, [$if], $(tag, [$repeat], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, ifText))) +
              $(tag, [$else], ''),
              $expected,
              properties,
              [tag, ifText, $if, $repeat, {id: 'variant$09$empty'}],
              resources)
            );
            // if (!tag.hasReplaceable) {
            ifElseRepeatDoubleTests.push($$test(
              $(tag, [$if], $(tag, [$repeat], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, ifText))) +
                $(tag, [$else, $if], $(tag, [$repeat], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, ifText))) +
                $(tag, [$if], '') +
                $(tag, [$else], $(tag, [$repeat], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, elseText))),
              $expected,
              properties,
              [tag, ifText, $if, $repeat, {id: 'variant$09$double$01'}],
              resources)
            );
            ifElseRepeatDoubleTests.push($$test(
              $(tag, [$if], $(tag, [$repeat], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, ifText))) +
                $(tag, [$else, $if], $(tag, [$repeat], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, ifText))) +
                $(tag, [$if], $(tag, [$repeat], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, ifText))) +
                $(tag, [$else], $(tag, [$repeat], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, elseText))),
              $expected.repeat(2),
              properties,
              [tag, ifText, $if, $repeat, {id: 'variant$09$double$02'}],
              resources)
            );
            // }
          }

          if (!$if.value) {
            ifElseRepeatTests.push($$test(
              $(tag, [$repeat], $(tag, [$if], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, ifText)) +
                $(tag, [$else], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, elseText))
              ),
              $expected,
              properties,
              [tag, ifText, $if, $repeat, {id: 'variant$10'}],
              resources)
            );
            ifElseRepeatTests.push($$test(
              $(tag, [$repeat], $(tag, [$if], '') +
                $(tag, [$else], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, elseText))
              ),
              $expected,
              properties,
              [tag, ifText, $if, $repeat, {id: 'variant$10$empty'}],
              resources)
            );
            ifElseRepeatTests.push($$test(
              $(tag, [$if], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, ifText)) +
              $(tag, [$else], $(tag, [$repeat], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, elseText))),
              $expected,
              properties,
              [tag, ifText, $if, $repeat, {id: 'variant$11'}],
              resources)
            );
            ifElseRepeatTests.push($$test(
              $(tag, [$if], '') +
              $(tag, [$else], $(tag, [$repeat], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, elseText))),
              $expected,
              properties,
              [tag, ifText, $if, $repeat, {id: 'variant$11$empty'}],
              resources)
            );
            // if (!tag.hasReplaceable) {
            ifElseRepeatDoubleTests.push($$test(
              $(tag, [$if], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, ifText)) +
                $(tag, [$else], $(tag, [$repeat], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, elseText))) +
                $(tag, [$if, $else], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, elseText)) +
                $(tag, [$else], $(tag, [$repeat], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, elseText))),
              $expected.repeat(2),
              properties,
              [tag, ifText, $if, $repeat, {id: 'variant$11$double$01'}],
              resources)
            );
            ifElseRepeatDoubleTests.push($$test(
              $(tag, [$if], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, ifText)) +
                $(tag, [$else], $(tag, [$repeat], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, elseText))) +
                $(tag, [$if, $else], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, elseText)) +
                $(tag, [$else], ''),
              $expected,
              properties,
              [tag, ifText, $if, $repeat, {id: 'variant$11$double$02'}],
              resources)
            );
            ifElseRepeatDoubleTests.push($$test(
              $(tag, [$if], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, ifText)) +
                $(tag, [$else], '') +
                $(tag, [$if, $else], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, elseText)) +
                $(tag, [$else], $(tag, [$repeat], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, elseText))),
              $expected,
              properties,
              [tag, ifText, $if, $repeat, {id: 'variant$11$double$03'}],
              resources)
            );
            // }
            // same as test above, but template controllers on same element
            ifElseRepeatTests.push($$test(
              $(tag, [$if], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, ifText)) +
              $(tag, [$else, $repeat], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, elseText)),
              $expected,
              properties,
              [tag, ifText, $if, $repeat, {id: 'variant$12'}],
              resources)
            );
            // if (!tag.hasReplaceable) {
            ifElseRepeatDoubleTests.push($$test(
              $(tag, [$if], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, ifText)) +
                $(tag, [$else, $repeat, $if], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, elseText)) +
                $(tag, [$if], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, ifText)) +
                $(tag, [$else, $repeat], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, elseText)),
              $expected,
              properties,
              [tag, ifText, $if, $repeat, {id: 'variant$12$double$01'}],
              resources)
            );
            ifElseRepeatDoubleTests.push($$test(
              $(tag, [$if], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, ifText)) +
                $(tag, [$else, $if, $repeat], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, elseText)) +
                $(tag, [$if], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, ifText)) +
                $(tag, [$else, $repeat], fixup(isArray, ifVarRegex, elseVarRegex, $repeat, elseText)),
              $expected,
              properties,
              [tag, ifText, $if, $repeat, {id: 'variant$12$double$02'}],
              resources)
            );
            // }
          }
        }
      }
    }
  }
  return tests;
}

function $(tag: Tag, attributes: Pick<TplCtrl, 'attr'>[], inner: string): string {
  if (attributes.length > 0) {
    return `<${tag.name} ${attributes.map(c => c.attr).join(' ')}>${inner}</${tag.name}>`;
  } else {
    return `<${tag.name}>${inner}</${tag.name}>`;
  }
}

function $$test(markup: string, expectedText: string, properties: PropertyDeclaration[], ids: Identifiable[], resources: Statement[]): Statement {
  return $$functionExpr('it', [
    $expression(`${ids.map(i => i.id).join(' ')} _`),
    $functionExpr([
      $$const(['au', 'host'], $call('createFixture')),
      undefined,
      ...resources,
      $$const('App', $call('CustomElement.define', [
        $expression({ name: 'app', template: `<template>${markup}</template>` }),
        $class(properties)
      ])),
      $$new('component', 'App'),
      $$call('au.app', [$expression({ host: 'host', component: 'component' })]),
      $$call('verify', ['au', 'host', $expression(expectedText)])
    ])
  ]);
}

function generateAndEmit(): void {
  const testsRecord = generateTests(tags, texts, ifElses, repeats);
  for (const suffix in testsRecord) {
    const tests = testsRecord[suffix];
    const nodes = [
      $$import('@aurelia/kernel', 'Profiler'),
      $$import('@aurelia/runtime', 'Aurelia', 'CustomElement'),
      $$import('@aurelia/testing', 'TestContext', 'writeProfilerReport', 'assert'),
      null,
      $$functionExpr('describe', [
        $expression(`generated.template-compiler.${suffix}`),
        $functionExpr([
          $$functionExpr('before', [
            $functionExpr([
              $$call('Profiler.enable')
            ])
          ]),
          $$functionExpr('after', [
            $functionExpr([
              $$call('Profiler.disable'),
              $$call('writeProfilerReport', [$expression(suffix)])
            ])
          ]),
          $$functionDecl(
            'createFixture',
            [
              $$const('ctx', $call('TestContext.createHTMLTestContext')),
              $$new('au', 'Aurelia', ['ctx.container']),
              $$const('host', $call('ctx.createElement', [$expression('div')])),
              $$return({ au: 'au', host: 'host' })
            ],
            []
          ),
          $$functionDecl(
            'verify',
            [
              $$const('root', $access('au.root')),

              $$call('au.start'),
              $$const('outerHtmlAfterStart1', $access('host.outerHTML')),
              $$call('assert.visibleTextEqual', ['root', 'expected', $expression('after start #1')]),
              $$call('au.stop'),
              $$const('outerHtmlAfterStop1', $access('host.outerHTML')),
              $$call('assert.visibleTextEqual', ['root', $expression(''), $expression('after stop #1')]),

              $$call('au.start'),
              $$const('outerHtmlAfterStart2', $access('host.outerHTML')),
              $$call('assert.visibleTextEqual', ['root', 'expected', $expression('after start #2')]),
              $$call('au.stop'),
              $$const('outerHtmlAfterStop2', $access('host.outerHTML')),
              $$call('assert.visibleTextEqual', ['root', $expression(''), $expression('after stop #2')]),
              // Verify that starting/stopping multiple times results in the exact same html each time
              $$call('assert.strictEqual', ['outerHtmlAfterStart1', 'outerHtmlAfterStart2', $expression('outerHTML after start #1 / #2')]),
              $$call('assert.strictEqual', ['outerHtmlAfterStop1', 'outerHtmlAfterStop2', $expression('outerHTML after stop #1 / #2')])
            ],
            [
              $param('au'),
              $param('host'),
              $param('expected')
            ]
          ),
          ...tests
        ])
      ])
    ];

    emit(outFile(suffix), ...nodes);
  }
}

generateAndEmit();
