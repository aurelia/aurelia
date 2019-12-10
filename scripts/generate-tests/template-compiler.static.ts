import { join } from 'path';
import { PropertyDeclaration, Statement } from 'typescript';
import { kebabCase } from '../../packages/kernel/src/index';
import project from '../project';
import {
  $$call,
  $$comment,
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
  hasReplaceable?: boolean;
}

const tags: Tag[] = [
  { id: 'tag$01', name: 'div' },
  // template is a duplicate so raw textBindings don't use it (double nested template with nothing on it doesn't work)
  { id: 'tag$02', name: 'template', isTemplate: true },
  { id: 'tag$03', name: 'template', elName: 'MyFoo', isCustom: true },
  { id: 'tag$04', name: 'template', elName: 'MyFoo', isCustom: true, hasReplaceable: true },
  { id: 'tag$05', name: 'template', elName: 'MyFoo', isCustom: true, containerless: true },
  { id: 'tag$06', name: 'template', elName: 'MyFoo', isCustom: true, hasReplaceable: true , containerless: true },
  { id: 'tag$07', name: 'template', elName: 'MyFoo', isCustom: true, shadowMode: 'open' },
  { id: 'tag$08', name: 'template', elName: 'MyFoo', isCustom: true, hasReplaceable: true , shadowMode: 'open' },
  { id: 'tag$09', name: 'template', elName: 'MyFoo', isCustom: true, shadowMode: 'closed' },
  { id: 'tag$10', name: 'template', elName: 'MyFoo', isCustom: true, hasReplaceable: true , shadowMode: 'closed' }
];

/* eslint-disable @typescript-eslint/camelcase */
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
/* eslint-enable @typescript-eslint/camelcase */

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

      function registerCustomElement(markup: string, containerless: boolean | null, shadowMode: 'open' | 'closed' | null): Statement[] {
        if (tag.hasReplaceable) {
          markup = `<${tag.name} replaceable="part1"></${tag.name}><${tag.name} replaceable="part2"></${tag.name}>`;
        }
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
      // eslint-disable-next-line sonarjs/no-collapsible-if
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
          if (tag.hasReplaceable) {
            staticTests.push($$test(
              `<${$tag} ${ifText.variable}.bind="${ifText.variable}"><${tag.name} replace="part1">${ifText.markup}</${tag.name}></${$tag}>`,
              ifText.value,
              ifText.properties,
              [tag, ifText],
              registerCustomElement(ifText.markup, tag.containerless === undefined ? null : tag.containerless, tag.shadowMode === undefined ? null : tag.shadowMode))
            );
          } else {
            staticTests.push($$test(
              `<${$tag} ${ifText.variable}.bind="${ifText.variable}"></${$tag}>`,
              ifText.value,
              ifText.properties,
              [tag, ifText],
              registerCustomElement(ifText.markup, tag.containerless === undefined ? null : tag.containerless, tag.shadowMode === undefined ? null : tag.shadowMode))
            );
          }
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
        resources.push(...registerCustomElement(`${ifText.markup}${elseText.markup}\${item}`, tag.containerless === undefined ? null : tag.containerless, tag.shadowMode === undefined ? null : tag.shadowMode));
        if (tag.hasReplaceable) {
          ifText.markup = `<${$tag} ${ifText.variable}.bind="${ifText.variable}"><${tag.name} replace="part1">${ifText.markup}</${tag.name}></${$tag}>`;
          elseText.markup = `<${$tag} ${elseText.variable}.bind="${elseText.variable}"><${tag.name} replace="part2">${elseText.markup}</${tag.name}></${$tag}>`;
        } else {
          ifText.markup = `<${$tag} ${ifText.variable}.bind="${ifText.variable}"></${$tag}>`;
          elseText.markup = `<${$tag} ${elseText.variable}.bind="${elseText.variable}"></${$tag}>`;
        }
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
          // skip repeated templates with replaceable since the generated tests don't make sense
          // (need to refactor this test generator..)
          if ($repeat.value > 1 && tag.hasReplaceable) {
            continue;
          }
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
          function fixup(text: TextBinding): string {
            // if the repeater is an array (not a number), replace the interpolation expression from the textBinding
            // with the property specified by the repeat's variable
            // this is a bit lazy, probably need to refactor this eventually anyway
            return isArray ? text.markup.replace(ifVarRegex, $repeat.prop).replace(elseVarRegex, $repeat.prop) : text.markup;
          }
          // identical to the if/else tests one level up, but wrapped in the repeater
          ifElseRepeatTests.push($$test(
            $(tag, [$repeat], $(tag, [$if], fixup(ifText)) +
              $(tag, [$else], fixup(elseText))
            ),
            $expected,
            properties,
            [tag, ifText, $if, $repeat, {id: 'variant$01'}],
            resources)
          );
          // if (!tag.hasReplaceable) {
          ifElseRepeatDoubleTests.push($$test(
            $(tag, [$repeat], $(tag, [$if], fixup(ifText)) +
                $(tag, [$else, $if], fixup(elseText)) +
                $(tag, [$if], '') +
                $(tag, [$else], fixup(elseText))
            ),
            $expected,
            properties,
            [tag, ifText, $if, $repeat, {id: 'variant$01$double'}],
            resources)
          );
          // }

          // the inverse of the fullIfElse wrapped by repeater (repeater wrapped by if/else)
          ifElseRepeatTests.push($$test(
            $(tag, [$if], $(tag, [$repeat], fixup(ifText))) +
            $(tag, [$else], $(tag, [$repeat], fixup(elseText))),
            $expected,
            properties,
            [tag, ifText, $if, $repeat, {id: 'variant$02'}],
            resources)
          );
          // if (!tag.hasReplaceable) {
          ifElseRepeatDoubleTests.push($$test(
            $(tag, [$if], $(tag, [$repeat], fixup(ifText))) +
              $(tag, [$else, $if], $(tag, [$repeat], fixup(elseText))) +
              $(tag, [$if], '') +
              $(tag, [$else], $(tag, [$repeat], fixup(elseText))),
            $expected,
            properties,
            [tag, ifText, $if, $repeat, {id: 'variant$02$double'}],
            resources)
          );
          // }
          // same as the test above but with the template controllers on the same element
          ifElseRepeatTests.push($$test(
            $(tag, [$if, $repeat], fixup(ifText)) +
            $(tag, [$else, $repeat], fixup(elseText)),
            $expected,
            properties,
            [tag, ifText, $if, $repeat, {id: 'variant$03'}],
            resources)
          );
          // if (!tag.hasReplaceable) {
          ifElseRepeatDoubleTests.push($$test(
            $(tag, [$if, $repeat], fixup(ifText)) +
              $(tag, [$else, $if, $repeat], fixup(elseText)) +
              $(tag, [$if, $repeat], '') +
              $(tag, [$else, $repeat], fixup(elseText)),
            $expected,
            properties,
            [tag, ifText, $if, $repeat, {id: 'variant$03$double$01'}],
            resources)
          );
          ifElseRepeatDoubleTests.push($$test(
            $(tag, [$if, $repeat], fixup(ifText)) +
              $(tag, [$else, $repeat, $if], fixup(elseText)) +
              $(tag, [$if, $repeat], '') +
              $(tag, [$else, $repeat], fixup(elseText)),
            $expected,
            properties,
            [tag, ifText, $if, $repeat, {id: 'variant$03$double$02'}],
            resources)
          );
          // }

          if (!$else.value) {
            ifElseRepeatTests.push($$test(
              $(tag, [$repeat], $(tag, [$if], fixup(ifText))),
              $expected,
              properties,
              [tag, ifText, $if, $repeat, {id: 'variant$04'}],
              resources)
            );
            // same as test above, but template controllers on same element
            ifElseRepeatTests.push($$test(
              $(tag, [$repeat, $if], fixup(ifText)),
              $expected,
              properties,
              [tag, ifText, $if, $repeat, {id: 'variant$05'}],
              resources)
            );
            ifElseRepeatTests.push($$test(
              $(tag, [$if], $(tag, [$repeat], fixup(ifText))),
              $expected,
              properties,
              [tag, ifText, $if, $repeat, {id: 'variant$06'}],
              resources)
            );
            // same as test above, but template controllers on same element
            ifElseRepeatTests.push($$test(
              $(tag, [$if, $repeat], fixup(ifText)),
              $expected,
              properties,
              [tag, ifText, $if, $repeat, {id: 'variant$07'}],
              resources)
            );

            ifElseRepeatTests.push($$test(
              $(tag, [$repeat], $(tag, [$if], fixup(ifText)) +
                $(tag, [$else], fixup(elseText))
              ),
              $expected,
              properties,
              [tag, ifText, $if, $repeat, {id: 'variant$08'}],
              resources)
            );
            ifElseRepeatTests.push($$test(
              $(tag, [$repeat], $(tag, [$if], fixup(ifText)) +
                $(tag, [$else], '')
              ),
              $expected,
              properties,
              [tag, ifText, $if, $repeat, {id: 'variant$08$empty'}],
              resources)
            );
            ifElseRepeatTests.push($$test(
              $(tag, [$if], $(tag, [$repeat], fixup(ifText))) +
              $(tag, [$else], $(tag, [$repeat], fixup(ifText))),
              $expected,
              properties,
              [tag, ifText, $if, $repeat, {id: 'variant$09'}],
              resources)
            );
            ifElseRepeatTests.push($$test(
              $(tag, [$if], $(tag, [$repeat], fixup(ifText))) +
              $(tag, [$else], ''),
              $expected,
              properties,
              [tag, ifText, $if, $repeat, {id: 'variant$09$empty'}],
              resources)
            );
            // if (!tag.hasReplaceable) {
            ifElseRepeatDoubleTests.push($$test(
              $(tag, [$if], $(tag, [$repeat], fixup(ifText))) +
                $(tag, [$else, $if], $(tag, [$repeat], fixup(ifText))) +
                $(tag, [$if], '') +
                $(tag, [$else], $(tag, [$repeat], fixup(elseText))),
              $expected,
              properties,
              [tag, ifText, $if, $repeat, {id: 'variant$09$double$01'}],
              resources)
            );
            ifElseRepeatDoubleTests.push($$test(
              $(tag, [$if], $(tag, [$repeat], fixup(ifText))) +
                $(tag, [$else, $if], $(tag, [$repeat], fixup(ifText))) +
                $(tag, [$if], $(tag, [$repeat], fixup(ifText))) +
                $(tag, [$else], $(tag, [$repeat], fixup(elseText))),
              $expected.repeat(2),
              properties,
              [tag, ifText, $if, $repeat, {id: 'variant$09$double$02'}],
              resources)
            );
            // }
          }

          if (!$if.value) {
            ifElseRepeatTests.push($$test(
              $(tag, [$repeat], $(tag, [$if], fixup(ifText)) +
                $(tag, [$else], fixup(elseText))
              ),
              $expected,
              properties,
              [tag, ifText, $if, $repeat, {id: 'variant$10'}],
              resources)
            );
            ifElseRepeatTests.push($$test(
              $(tag, [$repeat], $(tag, [$if], '') +
                $(tag, [$else], fixup(elseText))
              ),
              $expected,
              properties,
              [tag, ifText, $if, $repeat, {id: 'variant$10$empty'}],
              resources)
            );
            ifElseRepeatTests.push($$test(
              $(tag, [$if], fixup(ifText)) +
              $(tag, [$else], $(tag, [$repeat], fixup(elseText))),
              $expected,
              properties,
              [tag, ifText, $if, $repeat, {id: 'variant$11'}],
              resources)
            );
            ifElseRepeatTests.push($$test(
              $(tag, [$if], '') +
              $(tag, [$else], $(tag, [$repeat], fixup(elseText))),
              $expected,
              properties,
              [tag, ifText, $if, $repeat, {id: 'variant$11$empty'}],
              resources)
            );
            // if (!tag.hasReplaceable) {
            ifElseRepeatDoubleTests.push($$test(
              $(tag, [$if], fixup(ifText)) +
                $(tag, [$else], $(tag, [$repeat], fixup(elseText))) +
                $(tag, [$if, $else], fixup(elseText)) +
                $(tag, [$else], $(tag, [$repeat], fixup(elseText))),
              $expected.repeat(2),
              properties,
              [tag, ifText, $if, $repeat, {id: 'variant$11$double$01'}],
              resources)
            );
            ifElseRepeatDoubleTests.push($$test(
              $(tag, [$if], fixup(ifText)) +
                $(tag, [$else], $(tag, [$repeat], fixup(elseText))) +
                $(tag, [$if, $else], fixup(elseText)) +
                $(tag, [$else], ''),
              $expected,
              properties,
              [tag, ifText, $if, $repeat, {id: 'variant$11$double$02'}],
              resources)
            );
            ifElseRepeatDoubleTests.push($$test(
              $(tag, [$if], fixup(ifText)) +
                $(tag, [$else], '') +
                $(tag, [$if, $else], fixup(elseText)) +
                $(tag, [$else], $(tag, [$repeat], fixup(elseText))),
              $expected,
              properties,
              [tag, ifText, $if, $repeat, {id: 'variant$11$double$03'}],
              resources)
            );
            // }
            // same as test above, but template controllers on same element
            ifElseRepeatTests.push($$test(
              $(tag, [$if], fixup(ifText)) +
              $(tag, [$else, $repeat], fixup(elseText)),
              $expected,
              properties,
              [tag, ifText, $if, $repeat, {id: 'variant$12'}],
              resources)
            );
            // if (!tag.hasReplaceable) {
            ifElseRepeatDoubleTests.push($$test(
              $(tag, [$if], fixup(ifText)) +
                $(tag, [$else, $repeat, $if], fixup(elseText)) +
                $(tag, [$if], fixup(ifText)) +
                $(tag, [$else, $repeat], fixup(elseText)),
              $expected,
              properties,
              [tag, ifText, $if, $repeat, {id: 'variant$12$double$01'}],
              resources)
            );
            ifElseRepeatDoubleTests.push($$test(
              $(tag, [$if], fixup(ifText)) +
                $(tag, [$else, $if, $repeat], fixup(elseText)) +
                $(tag, [$if], fixup(ifText)) +
                $(tag, [$else, $repeat], fixup(elseText)),
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
      $$const(['au', 'host'], $call('setup')),
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
          $$comment('eslint-disable-next-line mocha/no-hooks',
            $$functionExpr('before', [
              $functionExpr([
                $$call('Profiler.enable')
              ])
            ])
          ),
          $$comment('eslint-disable-next-line mocha/no-hooks',
            $$functionExpr('after', [
              $functionExpr([
                $$call('Profiler.disable'),
                $$call('writeProfilerReport', [$expression(suffix)])
              ])
            ])
          ),
          $$functionDecl(
            'setup',
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
