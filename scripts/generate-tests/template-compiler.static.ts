import { SyntaxKind, Statement, createReturn, createIdentifier, createLiteral, PropertyDeclaration, createExpressionStatement, createObjectLiteral, createPropertyAssignment, createProperty, createModifier } from 'typescript';
import {
  emit,
  $classProperty,
  $test,
  $tpl,
  $attr,
  $describe,
  $import,
  $describeOnly,
  $functionDeclaration,
  $createContainer,
  $register,
  $createChangeSet,
  $createRenderingEngine,
  $createHost,
  $object,
  $div,
  $createAurelia,
  $callAuApp,
  $callAuStart,
  $it,
  $destructureObject,
  $call,
  $const,
  $customElement,
  $createComponent,
  $expectHostTextContent,
  $callAuStop,
  $accessProperty,
  $expectEqual,
  $resource,
  $bindableProperty,
  $bindable
} from './util';
import project from '../project';
import { join } from 'path';

function outFile(suffix: string) {
  return join(`${project.path}`, 'packages', 'jit', 'test', 'generated', `template-compiler.${suffix}.spec.ts`);
}

interface Identifiable {
  id: string;
}
interface TextBinding extends Identifiable {
  markup: string;
  value: string;
  properties: PropertyDeclaration[];
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
}

const tags: Tag[] = [
  { id: 'tag$01', name: 'div' },
  // template is a duplicate so raw textBindings don't use it (double nested template with nothing on it doesn't work)
  { id: 'tag$02', name: 'template', isTemplate: true },
  { id: 'tag$03', name: 'template', elName: 'foo', isCustom: true },
  { id: 'tag$04', name: 'template', elName: 'foo', isCustom: true, containerless: true },
  { id: 'tag$05', name: 'template', elName: 'foo', isCustom: true, shadowMode: 'open' },
  { id: 'tag$06', name: 'template', elName: 'foo', isCustom: true, shadowMode: 'closed' }
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
  markup: '${not}',
  variable: 'not',
  value: 'b',
  properties: [$classProperty('not', 'b')]
};
text$02_1.opposite = text$02_2;
text$02_2.opposite = text$02_1;

const text$03_1: TextBinding = {
  id: 'text$03',
  markup: '${msg}',
  variable: 'msg',
  value: 'a',
  properties: [$classProperty('msg', 'a')]
};
const text$03_2: TextBinding = {
  id: 'text$03',
  markup: '${not}',
  variable: 'not',
  value: 'b',
  properties: [$classProperty('not', 'b')]
};
text$03_1.opposite = text$03_2;
text$03_2.opposite = text$03_1;

const text$04_1: TextBinding = {
  id: 'text$04',
  markup: '${msg}',
  variable: 'msg',
  value: 'a',
  properties: [$classProperty('msg', 'a')],
  isDuplicate: true
};
const text$04_2: TextBinding = {
  id: 'text$04',
  markup: '${not}',
  variable: 'not',
  value: 'b',
  properties: [$classProperty('not', 'b')]
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
}
const repeat$11_2: TplCtrl = {
  id: 'repeat$11',
  value: 0,
  attr: 'repeat.for="i of 0"',
  properties: []
}
repeat$11_1.opposite = repeat$11_2;
repeat$11_2.opposite = repeat$11_1;

const repeat$12_1: TplCtrl = {
  id: 'repeat$12',
  value: 3,
  attr: 'repeat.for="i of 3"',
  properties: []
}
const repeat$12_2: TplCtrl = {
  id: 'repeat$12',
  value: 0,
  attr: 'repeat.for="i of 0"',
  properties: []
}
repeat$12_1.opposite = repeat$12_2;
repeat$12_2.opposite = repeat$12_1;

const repeat$13_1: TplCtrl = {
  id: 'repeat$13',
  value: ['a', 'b', 'c'],
  prop: 'item',
  attr: 'repeat.for="item of [\'a\', \'b\', \'c\']"',
  properties: []
}
const repeat$13_2: TplCtrl = {
  id: 'repeat$13',
  value: [],
  prop: 'item',
  attr: 'repeat.for="item of []"',
  properties: []
}
repeat$13_1.opposite = repeat$13_2;
repeat$13_2.opposite = repeat$13_1;

const repeats = [repeat$11_1, repeat$12_1, repeat$13_1];

function $createTest(markup: string, expectedText: string, properties: PropertyDeclaration[], ids: Identifiable[], resources: Statement[]) {
  const test = $it(
    // test title
    ids.map(i => i.id).join(' ') + ' _',
    // "arrange" phase
    $destructureObject($call(createIdentifier('setup')), 'au', 'host'),
    $const('template', createLiteral(`<template>${markup}</template>`)),
    $const('name', createLiteral('app')),
    null, // empty line
    ...resources,
    $customElement('App', ...properties),
    $createComponent('App'),
    // multiple "act" + "assert" phases
    $callAuApp(),
    $callAuStart(),
    $const('outerHtmlAfterStart1', $accessProperty('host', 'outerHTML')),
    $expectHostTextContent(expectedText, 'after start #1'),
    $callAuStop(),
    $const('outerHtmlAfterStop1', $accessProperty('host', 'outerHTML')),
    $expectHostTextContent('', 'after stop #1'),

    $callAuStart(),
    $const('outerHtmlAfterStart2', $accessProperty('host', 'outerHTML')),
    $expectHostTextContent(expectedText, 'after start #2'),
    $callAuStop(),
    $const('outerHtmlAfterStop2', $accessProperty('host', 'outerHTML')),
    $expectHostTextContent('', 'after stop #2'),
    // Verify that starting/stopping multiple times results in the exact same html each time
    $expectEqual('outerHtmlAfterStart1', 'outerHtmlAfterStart2', 'outerHTML after start #1 / #2'),
    $expectEqual('outerHtmlAfterStop1', 'outerHtmlAfterStop2', 'outerHTML after stop #1 / #2')
  );
  return test;
}

function $(tag: Tag, attributes: Pick<TplCtrl, 'attr'>[], inner: string) {
  if (attributes.length > 0) {
    return `<${tag.name} ${attributes.map(c => c.attr).join(' ')}>${inner}</${tag.name}>`;
  } else {
    return `<${tag.name}>${inner}</${tag.name}>`;
  }
}

function generateTests(tags: Tag[], textBindings: TextBinding[], ifElsePairs: TplCtrl[], repeaters: TplCtrl[]) {
  const tests: Record<string, Statement[]> = {};
  const staticTests: Statement[] = tests['static'] = [];
  const ifElseTests: Statement[] = tests['static.if-else'] = [];
  const ifElseDoubleTests: Statement[] = tests['static.if-else.double'] = [];
  const ifElseRepeatTests: Statement[] = tests['static.if-else.repeat'] = [];
  const ifElseRepeatDoubleTests: Statement[] = tests['static.if-else.repeat.double'] = [];

  for (const tag of tags) {

    for (const textBinding of textBindings) {

      const ifText = { ...textBinding };
      const elseText = { ...textBinding.opposite };
      ifText.opposite = elseText;
      elseText.opposite = ifText;

      const resources = [];

      function registerCustomElement(markup: string, containerless: boolean | null, shadowMode: 'open' | 'closed' | null) {
        const className = tag.elName.slice(0, 1).toUpperCase() + tag.elName.slice(1);
        const bindables = [ifText, elseText].map(t => $bindable(t.variable));
        bindables.push($bindable('item'));
        const statics = [
          createProperty(
            [],
            [createModifier(SyntaxKind.StaticKeyword)],
            createIdentifier('bindables'),
            undefined,
            undefined,
            createObjectLiteral(bindables)
          )
        ];
        if (containerless !== null) {
          statics.push(
            createProperty(
              [],
              [createModifier(SyntaxKind.StaticKeyword)],
              createIdentifier('containerless'),
              undefined,
              undefined,
              createLiteral(true)
            )
          );
        }
        if (shadowMode !== null) {
          statics.push(
            createProperty(
              [],
              [createModifier(SyntaxKind.StaticKeyword)],
              createIdentifier('shadowOptions'),
              undefined,
              undefined,
              createObjectLiteral([
                createPropertyAssignment(createIdentifier('mode'), createLiteral(shadowMode))
              ])
            )
          );
        }
        return [
          $resource(
            'CustomElementResource', [
              createObjectLiteral([
                createPropertyAssignment(createIdentifier('name'), createLiteral(tag.elName)),
                createPropertyAssignment(createIdentifier('template'), createLiteral(`<template>${markup}</template>`))
              ])
            ], [
              ...statics,
              ...[ifText, elseText].map(t => $classProperty(t.variable, '')),
              $classProperty('item', '')
            ],
            className
          ),
          createExpressionStatement($call($accessProperty('au', 'register'), createIdentifier(className)))
        ];
      }
      if (tag.isCustom) {
        if (ifText.static || elseText.static) {
          continue;
        }
      }

      if (!ifText.isDuplicate) {
        if (tag.isTemplate) {
          // non-wrapped interpolation
          staticTests.push($createTest(
            ifText.markup,
            ifText.value, ifText.properties, [tag, ifText], [])
          );
        } else if (tag.isCustom) {
          // binding with custom element
          staticTests.push($createTest(
            `<${tag.elName} ${ifText.variable}.bind="${ifText.variable}"></${tag.elName}>`,
            ifText.value, ifText.properties, [tag, ifText], registerCustomElement(ifText.markup, tag.containerless || null, tag.shadowMode || null))
          );
        } else {
          // interpolation wrapped in div
          staticTests.push($createTest(
            $(tag, [], ifText.markup),
            ifText.value, ifText.properties, [tag, ifText], [])
          );
        }
      }
      if (tag.isCustom) {
        resources.push(...registerCustomElement(ifText.markup + elseText.markup + '${item}', tag.containerless || null, tag.shadowMode || null));
        ifText.markup = `<${tag.elName} ${ifText.variable}.bind="${ifText.variable}"></${tag.elName}>`;
        elseText.markup = `<${tag.elName} ${elseText.variable}.bind="${elseText.variable}"></${tag.elName}>`;
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
          ifElseTests.push($createTest(
            $(tag, [$if], ifText.markup),
            ifMarkupExpected, properties, [tag, ifText, $if, {id:`${branchId}$01`}], resources)
          );
          ifElseDoubleTests.push($createTest(
            $(tag, [$if], ifText.markup) +
            $(tag, [$if], ''),
            ifMarkupExpected, properties, [tag, ifText, $if, {id:`${branchId}$01`}, {id:'double$01'}], resources)
          );
          ifElseDoubleTests.push($createTest(
            $(tag, [$if], '') +
            $(tag, [$if], ifText.markup),
            ifMarkupExpected, properties, [tag, ifText, $if, {id:`${branchId}$01`}, {id:'double$02'}], resources)
          );
          ifElseDoubleTests.push($createTest(
            $(tag, [$if], ifText.markup) +
            $(tag, [$if], ifText.markup),
            ifMarkupExpected.repeat(2), properties, [tag, ifText, $if, {id:`${branchId}$01`}, {id:'double$03'}], resources)
          );

          // only if branch (nested)
          ifElseTests.push($createTest(
            $(tag, [$if], $(tag, [$if], ifText.markup)),
            ifMarkupExpected, properties, [tag, ifText, $if, {id:`${branchId}$01`}, {id:`nested$01`}], resources)
          );
          ifElseDoubleTests.push($createTest(
            $(tag, [$if], $(tag, [$if], ifText.markup)) +
            $(tag, [$if], ''),
            ifMarkupExpected, properties, [tag, ifText, $if, {id:`${branchId}$01`}, {id:`nested$01`}, {id:'double$01'}], resources)
          );
          ifElseDoubleTests.push($createTest(
            $(tag, [$if], $(tag, [$if], ifText.markup)) +
            $(tag, [$if], $(tag, [$if], '')),
            ifMarkupExpected, properties, [tag, ifText, $if, {id:`${branchId}$01`}, {id:`nested$01`}, {id:'double$02'}], resources)
          );
          ifElseDoubleTests.push($createTest(
            $(tag, [$if], '') +
            $(tag, [$if], $(tag, [$if], ifText.markup)),
            ifMarkupExpected, properties, [tag, ifText, $if, {id:`${branchId}$01`}, {id:`nested$01`}, {id:'double$03'}], resources)
          );
          ifElseDoubleTests.push($createTest(
            $(tag, [$if], $(tag, [$if], '')) +
            $(tag, [$if], $(tag, [$if], ifText.markup)),
            ifMarkupExpected, properties, [tag, ifText, $if, {id:`${branchId}$01`}, {id:`nested$01`}, {id:'double$04'}], resources)
          );
          ifElseDoubleTests.push($createTest(
            $(tag, [$if], $(tag, [$if], ifText.markup)) +
            $(tag, [$if], $(tag, [$if], ifText.markup)),
            ifMarkupExpected.repeat(2), properties, [tag, ifText, $if, {id:`${branchId}$01`}, {id:`nested$01`}, {id:'double$05'}], resources)
          );
        }

        if (!tag.isCustom || $else.value === true) {
          // only else branch
          ifElseTests.push($createTest(
            $(tag, [$if], '') +
            $(tag, [$else], elseText.markup),
            elseMarkupExpected, properties, [tag, ifText, $if, {id:`${branchId}$02`}], resources)
          );
          ifElseDoubleTests.push($createTest(
            $(tag, [$if], '') +
            $(tag, [$else], elseText.markup) +
            $(tag, [$if], '') +
            $(tag, [$else], ''),
            elseMarkupExpected, properties, [tag, ifText, $if, {id:`${branchId}$02`}, {id:'double$01'}], resources)
          );
          ifElseDoubleTests.push($createTest(
            $(tag, [$if], '') +
            $(tag, [$else], '') +
            $(tag, [$if], '') +
            $(tag, [$else], elseText.markup),
            elseMarkupExpected, properties, [tag, ifText, $if, {id:`${branchId}$02`}, {id:'double$02'}], resources)
          );
          ifElseDoubleTests.push($createTest(
            $(tag, [$if], '') +
            $(tag, [$else], elseText.markup) +
            $(tag, [$if], '') +
            $(tag, [$else], elseText.markup),
            elseMarkupExpected.repeat(2), properties, [tag, ifText, $if, {id:`${branchId}$02`}, {id:'double$03'}], resources)
          );

          // only else branch (nested)
          ifElseTests.push($createTest(
            $(tag, [$if], '') +
            $(tag, [$else],
              $(tag, [$if], '') +
              $(tag, [$else], elseText.markup)
            ),
            elseMarkupExpected, properties, [tag, ifText, $if, {id:`${branchId}$03`}, {id:`nested$01`}], resources)
          );
          ifElseDoubleTests.push($createTest(
            $(tag, [$if], '') +
            $(tag, [$else],
              $(tag, [$if], '') +
              $(tag, [$else], elseText.markup)
            ) +
            $(tag, [$if], '') +
            $(tag, [$else], ''),
            elseMarkupExpected, properties, [tag, ifText, $if, {id:`${branchId}$03`}, {id:`nested$01`}, {id:'double$01'}], resources)
          );
          ifElseDoubleTests.push($createTest(
            $(tag, [$if], '') +
            $(tag, [$else],
              $(tag, [$if], '') +
              $(tag, [$else], elseText.markup)
            ) +
            $(tag, [$if], '') +
            $(tag, [$else],
              $(tag, [$if], '') +
              $(tag, [$else], '')
            ),
            elseMarkupExpected, properties, [tag, ifText, $if, {id:`${branchId}$03`}, {id:`nested$01`}, {id:'double$01'}], resources)
          );
          ifElseDoubleTests.push($createTest(
            $(tag, [$if], '') +
            $(tag, [$else],
              $(tag, [$if], '') +
              $(tag, [$else], '')
            ) +
            $(tag, [$if], '') +
            $(tag, [$else],
              $(tag, [$if], '') +
              $(tag, [$else], elseText.markup)
            ),
            elseMarkupExpected, properties, [tag, ifText, $if, {id:`${branchId}$03`}, {id:`nested$01`}, {id:'double$02'}], resources)
          );
          ifElseDoubleTests.push($createTest(
            $(tag, [$if], '') +
            $(tag, [$else],
              $(tag, [$if], '') +
              $(tag, [$else], elseText.markup)
            ) +
            $(tag, [$if], '') +
            $(tag, [$else],
              $(tag, [$if], '') +
              $(tag, [$else], elseText.markup)
            ),
            elseMarkupExpected.repeat(2), properties, [tag, ifText, $if, {id:`${branchId}$03`}, {id:`nested$01`}, {id:'double$03'}], resources)
          );
        }

        // if + else branch
        ifElseTests.push($createTest(
          $(tag, [$if], ifText.markup) +
          $(tag, [$else], elseText.markup),
          expected, properties, [tag, ifText, $if, {id:`${branchId}$04`}], resources)
        );
        ifElseDoubleTests.push($createTest(
          $(tag, [$if], ifText.markup) +
          $(tag, [$else], elseText.markup) +
          $(tag, [$if], '') +
          $(tag, [$else], ''),
          expected, properties, [tag, ifText, $if, {id:`${branchId}$04`}, {id:'double$01'}], resources)
        );
        ifElseDoubleTests.push($createTest(
          $(tag, [$if], '') +
          $(tag, [$else], '') +
          $(tag, [$if], ifText.markup) +
          $(tag, [$else], elseText.markup),
          expected, properties, [tag, ifText, $if, {id:`${branchId}$04`}, {id:'double$02'}], resources)
        );
        ifElseDoubleTests.push($createTest(
          $(tag, [$if], ifText.markup) +
          $(tag, [$else], elseText.markup) +
          $(tag, [$if], ifText.markup) +
          $(tag, [$else], elseText.markup),
          expected.repeat(2), properties, [tag, ifText, $if, {id:`${branchId}$04`}, {id:'double$03'}], resources)
        );

        // if + else branch (nested)
        ifElseTests.push($createTest(
          $(tag, [$if],
            $(tag, [$if], ifText.markup) +
            $(tag, [$else], elseText.markup)
          ) +
          $(tag, [$else],
            $(tag, [$if], ifText.markup) +
            $(tag, [$else], elseText.markup)
          ),
          expected, properties, [tag, ifText, $if, {id:`${branchId}$05`}, {id:`nested$01`}], resources)
        );
        ifElseDoubleTests.push($createTest(
          $(tag, [$if],
            $(tag, [$if], ifText.markup) +
            $(tag, [$else], elseText.markup)
          ) +
          $(tag, [$else],
            $(tag, [$if], ifText.markup) +
            $(tag, [$else], elseText.markup)
          ) +
          $(tag, [$if], '') +
          $(tag, [$else], ''),
          expected, properties, [tag, ifText, $if, {id:`${branchId}$05`}, {id:`nested$01`}, {id:'double$01'}], resources)
        );
        ifElseDoubleTests.push($createTest(
          $(tag, [$if],
            $(tag, [$if], ifText.markup) +
            $(tag, [$else], elseText.markup)
          ) +
          $(tag, [$else],
            $(tag, [$if], ifText.markup) +
            $(tag, [$else], elseText.markup)
          ) +
          $(tag, [$if], '') +
          $(tag, [$else],
            $(tag, [$if], '') +
            $(tag, [$else], '')
          ),
          expected, properties, [tag, ifText, $if, {id:`${branchId}$05`}, {id:`nested$01`}, {id:'double$01'}], resources)
        );
        ifElseDoubleTests.push($createTest(
          $(tag, [$if], '') +
          $(tag, [$else],
            $(tag, [$if], '') +
            $(tag, [$else], '')
          ) +
          $(tag, [$if],
            $(tag, [$if], ifText.markup) +
            $(tag, [$else], elseText.markup)
          ) +
          $(tag, [$else],
            $(tag, [$if], ifText.markup) +
            $(tag, [$else], elseText.markup)
          ),
          expected, properties, [tag, ifText, $if, {id:`${branchId}$05`}, {id:`nested$01`}, {id:'double$02'}], resources)
        );
        ifElseDoubleTests.push($createTest(
          $(tag, [$if],
            $(tag, [$if], ifText.markup) +
            $(tag, [$else], elseText.markup)
          ) +
          $(tag, [$else],
            $(tag, [$if], ifText.markup) +
            $(tag, [$else], elseText.markup)
          ) +
          $(tag, [$if],
            $(tag, [$if], ifText.markup) +
            $(tag, [$else], elseText.markup)
          ) +
          $(tag, [$else],
            $(tag, [$if], ifText.markup) +
            $(tag, [$else], elseText.markup)
          ),
          expected.repeat(2), properties, [tag, ifText, $if, {id:`${branchId}$05`}, {id:`nested$01`}, {id:'double$03'}], resources)
        );

        // if + else branch (same element)
        ifElseDoubleTests.push($createTest(
          $(tag, [$if], ifText.markup) +
          $(tag, [$else, $if], elseText.markup) + // never renders
          $(tag, [$if], '') +
          $(tag, [$else], elseText.markup),
          expected, properties, [tag, ifText, $if, {id:`${branchId}$06`}, {id:'sibling$01'}], resources)
        );
        ifElseDoubleTests.push($createTest(
          $(tag, [$if], '') +
          $(tag, [$else, $if], '') + // never renders
          $(tag, [$if], ifText.markup) +
          $(tag, [$else], elseText.markup),
          expected, properties, [tag, ifText, $if, {id:`${branchId}$06`}, {id:'sibling$02'}], resources)
        );
        ifElseDoubleTests.push($createTest(
          $(tag, [$if], '') +
          $(tag, [$else, $if], elseText.markup) + // never renders
          $(tag, [$if], ifText.markup) +
          $(tag, [$else], elseText.markup),
          expected, properties, [tag, ifText, $if, {id:`${branchId}$06`}, {id:'sibling$03'}], resources)
        );
        ifElseDoubleTests.push($createTest(
          $(tag, [$if], ifText.markup) +
          $(tag, [$else, $if], elseText.markup) + // never renders
          $(tag, [$else, $if], ifText.markup) + // never renders
          $(tag, [$if], '') +
          $(tag, [$else], elseText.markup),
          expected, properties, [tag, ifText, $if, {id:`${branchId}$06`}, {id:'sibling$04'}], resources)
        );



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
          const ifVarRegex = new RegExp(ifText.variable || '', 'g');
          const elseVarRegex = new RegExp(elseText.variable || '', 'g');
          function fixup(text: TextBinding) {
            // if the repeater is an array (not a number), replace the interpolation expression from the textBinding
            // with the property specified by the repeat's variable
            // this is a bit lazy, probably need to refactor this eventually anyway
            return isArray ? text.markup.replace(ifVarRegex, $repeat.prop).replace(elseVarRegex, $repeat.prop) : text.markup;
          }
          // identical to the if/else tests one level up, but wrapped in the repeater
          ifElseRepeatTests.push($createTest(
            $(tag, [$repeat],
              $(tag, [$if], fixup(ifText)) +
              $(tag, [$else], fixup(elseText))
            ),
            $expected, properties, [tag, ifText, $if, $repeat, {id:'variant$01'}], resources)
          );
          ifElseRepeatDoubleTests.push($createTest(
            $(tag, [$repeat],
              $(tag, [$if], fixup(ifText)) +
              $(tag, [$else, $if], fixup(elseText)) +
              $(tag, [$if], '') +
              $(tag, [$else], fixup(elseText))
            ),
            $expected, properties, [tag, ifText, $if, $repeat, {id:'variant$01$double'}], resources)
          );

          // the inverse of the fullIfElse wrapped by repeater (repeater wrapped by if/else)
          ifElseRepeatTests.push($createTest(
            $(tag, [$if], $(tag, [$repeat], fixup(ifText))) +
            $(tag, [$else], $(tag, [$repeat], fixup(elseText))),
            $expected, properties, [tag, ifText, $if, $repeat, {id:'variant$02'}], resources)
          );
          ifElseRepeatDoubleTests.push($createTest(
            $(tag, [$if], $(tag, [$repeat], fixup(ifText))) +
            $(tag, [$else, $if], $(tag, [$repeat], fixup(elseText))) +
            $(tag, [$if], '') +
            $(tag, [$else], $(tag, [$repeat], fixup(elseText))),
            $expected, properties, [tag, ifText, $if, $repeat, {id:'variant$02$double'}], resources)
          );
          // same as the test above but with the template controllers on the same element
          ifElseRepeatTests.push($createTest(
            $(tag, [$if, $repeat], fixup(ifText)) +
            $(tag, [$else, $repeat], fixup(elseText)),
            $expected, properties, [tag, ifText, $if, $repeat, {id:'variant$03'}], resources)
          );
          ifElseRepeatDoubleTests.push($createTest(
            $(tag, [$if, $repeat], fixup(ifText)) +
            $(tag, [$else, $if, $repeat], fixup(elseText)) +
            $(tag, [$if, $repeat], '') +
            $(tag, [$else, $repeat], fixup(elseText)),
            $expected, properties, [tag, ifText, $if, $repeat, {id:'variant$03$double$01'}], resources)
          );
          ifElseRepeatDoubleTests.push($createTest(
            $(tag, [$if, $repeat], fixup(ifText)) +
            $(tag, [$else, $repeat, $if], fixup(elseText)) +
            $(tag, [$if, $repeat], '') +
            $(tag, [$else, $repeat], fixup(elseText)),
            $expected, properties, [tag, ifText, $if, $repeat, {id:'variant$03$double$02'}], resources)
          );

          if (!$else.value) {
            ifElseRepeatTests.push($createTest(
              $(tag, [$repeat], $(tag, [$if], fixup(ifText))),
              $expected, properties, [tag, ifText, $if, $repeat, {id:'variant$04'}], resources)
            );
            // same as test above, but template controllers on same element
            ifElseRepeatTests.push($createTest(
              $(tag, [$repeat, $if], fixup(ifText)),
              $expected, properties, [tag, ifText, $if, $repeat, {id:'variant$05'}], resources)
            );
            ifElseRepeatTests.push($createTest(
              $(tag, [$if], $(tag, [$repeat], fixup(ifText))),
              $expected, properties, [tag, ifText, $if, $repeat, {id:'variant$06'}], resources)
            );
            // same as test above, but template controllers on same element
            ifElseRepeatTests.push($createTest(
              $(tag, [$if, $repeat], fixup(ifText)),
              $expected, properties, [tag, ifText, $if, $repeat, {id:'variant$07'}], resources)
            );

            ifElseRepeatTests.push($createTest(
              $(tag, [$repeat],
                $(tag, [$if], fixup(ifText)) +
                $(tag, [$else], fixup(elseText))
              ),
              $expected, properties, [tag, ifText, $if, $repeat, {id:'variant$08'}], resources)
            );
            ifElseRepeatTests.push($createTest(
              $(tag, [$repeat],
                $(tag, [$if], fixup(ifText)) +
                $(tag, [$else], '')
              ),
              $expected, properties, [tag, ifText, $if, $repeat, {id:'variant$08$empty'}], resources)
            );
            ifElseRepeatTests.push($createTest(
              $(tag, [$if], $(tag, [$repeat], fixup(ifText))) +
              $(tag, [$else], $(tag, [$repeat], fixup(ifText))),
              $expected, properties, [tag, ifText, $if, $repeat, {id:'variant$09'}], resources)
            );
            ifElseRepeatTests.push($createTest(
              $(tag, [$if], $(tag, [$repeat], fixup(ifText))) +
              $(tag, [$else], ''),
              $expected, properties, [tag, ifText, $if, $repeat, {id:'variant$09$empty'}], resources)
            );
            ifElseRepeatDoubleTests.push($createTest(
              $(tag, [$if], $(tag, [$repeat], fixup(ifText))) +
              $(tag, [$else, $if], $(tag, [$repeat], fixup(ifText))) +
              $(tag, [$if], '') +
              $(tag, [$else], $(tag, [$repeat], fixup(elseText))),
              $expected, properties, [tag, ifText, $if, $repeat, {id:'variant$09$double$01'}], resources)
            );
            ifElseRepeatDoubleTests.push($createTest(
              $(tag, [$if], $(tag, [$repeat], fixup(ifText))) +
              $(tag, [$else, $if], $(tag, [$repeat], fixup(ifText))) +
              $(tag, [$if], $(tag, [$repeat], fixup(ifText))) +
              $(tag, [$else], $(tag, [$repeat], fixup(elseText))),
              $expected.repeat(2), properties, [tag, ifText, $if, $repeat, {id:'variant$09$double$02'}], resources)
            );
          }

          if (!$if.value) {
            ifElseRepeatTests.push($createTest(
              $(tag, [$repeat],
                $(tag, [$if], fixup(ifText)) +
                $(tag, [$else], fixup(elseText))
              ),
              $expected, properties, [tag, ifText, $if, $repeat, {id:'variant$10'}], resources)
            );
            ifElseRepeatTests.push($createTest(
              $(tag, [$repeat],
                $(tag, [$if], '') +
                $(tag, [$else], fixup(elseText))
              ),
              $expected, properties, [tag, ifText, $if, $repeat, {id:'variant$10$empty'}], resources)
            );
            ifElseRepeatTests.push($createTest(
              $(tag, [$if], fixup(ifText)) +
              $(tag, [$else], $(tag, [$repeat], fixup(elseText))),
              $expected, properties, [tag, ifText, $if, $repeat, {id:'variant$11'}], resources)
            );
            ifElseRepeatTests.push($createTest(
              $(tag, [$if], '') +
              $(tag, [$else], $(tag, [$repeat], fixup(elseText))),
              $expected, properties, [tag, ifText, $if, $repeat, {id:'variant$11$empty'}], resources)
            );
            ifElseRepeatDoubleTests.push($createTest(
              $(tag, [$if], fixup(ifText)) +
              $(tag, [$else], $(tag, [$repeat], fixup(elseText))) +
              $(tag, [$if, $else], fixup(elseText)) +
              $(tag, [$else], $(tag, [$repeat], fixup(elseText))),
              $expected.repeat(2), properties, [tag, ifText, $if, $repeat, {id:'variant$11$double$01'}], resources)
            );
            ifElseRepeatDoubleTests.push($createTest(
              $(tag, [$if], fixup(ifText)) +
              $(tag, [$else], $(tag, [$repeat], fixup(elseText))) +
              $(tag, [$if, $else], fixup(elseText)) +
              $(tag, [$else], ''),
              $expected, properties, [tag, ifText, $if, $repeat, {id:'variant$11$double$02'}], resources)
            );
            ifElseRepeatDoubleTests.push($createTest(
              $(tag, [$if], fixup(ifText)) +
              $(tag, [$else], '') +
              $(tag, [$if, $else], fixup(elseText)) +
              $(tag, [$else], $(tag, [$repeat], fixup(elseText))),
              $expected, properties, [tag, ifText, $if, $repeat, {id:'variant$11$double$03'}], resources)
            );
            // same as test above, but template controllers on same element
            ifElseRepeatTests.push($createTest(
              $(tag, [$if], fixup(ifText)) +
              $(tag, [$else, $repeat], fixup(elseText)),
              $expected, properties, [tag, ifText, $if, $repeat, {id:'variant$12'}], resources)
            );
            ifElseRepeatDoubleTests.push($createTest(
              $(tag, [$if], fixup(ifText)) +
              $(tag, [$else, $repeat, $if], fixup(elseText)) +
              $(tag, [$if], fixup(ifText)) +
              $(tag, [$else, $repeat], fixup(elseText)),
              $expected, properties, [tag, ifText, $if, $repeat, {id:'variant$12$double$01'}], resources)
            );
            ifElseRepeatDoubleTests.push($createTest(
              $(tag, [$if], fixup(ifText)) +
              $(tag, [$else, $if, $repeat], fixup(elseText)) +
              $(tag, [$if], fixup(ifText)) +
              $(tag, [$else, $repeat], fixup(elseText)),
              $expected, properties, [tag, ifText, $if, $repeat, {id:'variant$12$double$02'}], resources)
            );
          }
        }
      }
    }
  }
  return tests;
}

function generateAndEmit() {
  const testsRecord = generateTests(tags, texts, ifElses, repeats);
  for (const suffix in testsRecord) {
    const tests = testsRecord[suffix];
    const nodes = [
      $import('chai', 'expect'),
      $import('../../../kernel/src/index', 'DI'),
      $import('../../../runtime/src/index', 'CustomElementResource', 'DOM', 'Aurelia', 'BindingMode'),
      $import('../../src/index', 'BasicConfiguration'),
      null,
      $describe(
        `generated.template-compiler.${suffix}`,
        $functionDeclaration(
          'setup',
          $createContainer(),
          $register('BasicConfiguration'),
          $createAurelia('au'),
          $createHost(),
          createReturn($object('au', 'host'))
        ),
        ...tests
      )
    ];

    emit(outFile(suffix), ...nodes);
  }
}

generateAndEmit();
