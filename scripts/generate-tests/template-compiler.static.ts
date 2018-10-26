import { SyntaxKind, Statement, createReturn, createIdentifier, createLiteral, PropertyDeclaration, createExpressionStatement } from 'typescript';
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
  $app,
  $start,
  $it,
  $destructureObject,
  $call,
  $const,
  $customElement,
  $createComponent,
  $expectHostTextContent,
  $stop,
  $accessProperty
} from './util';
import project from '../project';
import { join } from 'path';

const outFile = join(`${project.path}`, 'packages', 'jit', 'test', 'generated', 'template-compiler.static.spec.ts');

interface Identifiable {
  id: string;
}
interface TextBinding extends Identifiable {
  markup: string;
  value: string;
  properties: PropertyDeclaration[];
  opposite?: TextBinding;
  isDuplicate?: boolean;
}
interface TplCtrl extends Identifiable {
  attr: string;
  value: any;
  properties: PropertyDeclaration[];
  opposite?: TplCtrl;
  isDuplicate?: boolean;
}
interface Tag extends Identifiable {
  name: string;
  isDuplicate?: boolean;
}

const tags = [
  { id: 'tag$01', name: 'div' },
  { id: 'tag$02', name: 'template', isDuplicate: true }
  // template is a duplicate so raw textBindings don't use it (double nested template with nothing on it doesn't work)
];

const text$01_1: TextBinding = {
  id: 'text$01',
  markup: 'a',
  value: 'a',
  properties: []
};
const text$01_2: TextBinding = {
  id: 'text$01',
  markup: 'b',
  value: 'b',
  properties: []
};
text$01_1.opposite = text$01_2;
text$01_2.opposite = text$01_1;

const text$02_1: TextBinding = {
  id: 'text$02',
  markup: 'a',
  value: 'a',
  properties: [],
  isDuplicate: true
};
const text$02_2: TextBinding = {
  id: 'text$02',
  markup: '${notMsg}',
  value: 'b',
  properties: [$classProperty('notMsg', SyntaxKind.StringKeyword, 'b')]
};
text$02_1.opposite = text$02_2;
text$02_2.opposite = text$02_1;

const text$03_1: TextBinding = {
  id: 'text$03',
  markup: '${msg}',
  value: 'a',
  properties: [$classProperty('msg', SyntaxKind.StringKeyword, 'a')]
};
const text$03_2: TextBinding = {
  id: 'text$03',
  markup: '${notMsg}',
  value: 'b',
  properties: [$classProperty('notMsg', SyntaxKind.StringKeyword, 'b')]
};
text$03_1.opposite = text$03_2;
text$03_2.opposite = text$03_1;

const text$04_1: TextBinding = {
  id: 'text$04',
  markup: '${msg}',
  value: 'a',
  properties: [$classProperty('msg', SyntaxKind.StringKeyword, 'a')],
  isDuplicate: true
};
const text$04_2: TextBinding = {
  id: 'text$04',
  markup: '${notMsg}',
  value: 'b',
  properties: [$classProperty('notMsg', SyntaxKind.StringKeyword, 'b')]
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

const repeats = [repeat$11_1, repeat$12_1];

function $createTest(markup: string, expected: string, properties: PropertyDeclaration[], ids: Identifiable[]) {
  const setup: Statement = $destructureObject($call(createIdentifier('setup')), 'au', 'host');
  const name: Statement = $const('name', createLiteral('app'));
  const createComponent: Statement = $createComponent('App');
  const app: Statement = $app();
  const customElement: Statement = $customElement('App', ...properties);
  const test = $it(
    ids.map(i => i.id).join(' ')+' _',
    setup,
    $const('template', createLiteral(`<template>${markup}</template>`)),
    name,
    null,
    customElement,
    createComponent,
    app,
    createExpressionStatement(
      $call($accessProperty('console', 'log'), createLiteral('template'), createIdentifier('template'))
    ),
    createExpressionStatement(
      $call($accessProperty('console', 'log'), createLiteral('expected'), createLiteral(expected))
    ),
    $start(),
    createExpressionStatement(
      $call($accessProperty('console', 'log'), createLiteral('after start $1'),$accessProperty('host', 'outerHTML'))
    ),
    $expectHostTextContent(expected, 'after start #1'),
    $stop(),
    createExpressionStatement(
      $call($accessProperty('console', 'log'), createLiteral('after stop $1'),$accessProperty('host', 'outerHTML'))
    ),
    $expectHostTextContent('', 'after stop #1'),

    $start(),
    createExpressionStatement(
      $call($accessProperty('console', 'log'), createLiteral('after start $2'),$accessProperty('host', 'outerHTML'))
    ),
    $expectHostTextContent(expected, 'after start #2'),
    $stop(),
    $stop(),
    createExpressionStatement(
      $call($accessProperty('console', 'log'), createLiteral('after stop $2'),$accessProperty('host', 'outerHTML'))
    ),
    $expectHostTextContent('', 'after stop #2')
  );
  return test;
}

function generateTests(tags: Tag[], textBindings: TextBinding[], ifElsePairs: TplCtrl[], repeaters: TplCtrl[]) {
  const tests: Statement[] = [];

  for (const tag of tags) {
    const $tag = tag.name;

    for (const textBinding of textBindings) {

      const ifText = textBinding;
      const elseText = textBinding.opposite;

      if (!ifText.isDuplicate) {
        if (!tag.isDuplicate) {
          // interpolation wrapped in div
          tests.push($createTest(
            `<${$tag}>${ifText.markup}</${$tag}>`,
            ifText.value, ifText.properties, [tag, ifText])
          );
        } else {
          // non-wrapped interpolation
          tests.push($createTest(
            ifText.markup,
            ifText.value, ifText.properties, [tag, ifText])
          );
        }
      }

      for (const ifElsePair of ifElsePairs) {

        const $if = ifElsePair;
        const $else = ifElsePair.opposite;

        const expected = $if.value ? ifText.value : elseText.value;
        const properties = [...ifText.properties, ...elseText.properties, ...$if.properties, ...$else.properties];

        // if (has content) + else (has content)
        const $fullIfElse =
          `<${$tag} ${$if.attr}>${ifText.markup}</${$tag}>` +
          `<${$tag} ${$else.attr}>${elseText.markup}</${$tag}>`;

        // if (has content)
        const $onlyIf =
          `<${$tag} ${$if.attr}>${ifText.markup}</${$tag}>`;

        // if (has content) + else (has NO content)
        const $ifEmptyElse =
          `<${$tag} ${$if.attr}>${ifText.markup}</${$tag}>` +
          `<${$tag} ${$else.attr}></${$tag}>`;

        // if (has NO content) + else (has content)
        const $onlyElse =
          `<${$tag} ${$if.attr}></${$tag}>` +
          `<${$tag} ${$else.attr}>${elseText.markup}</${$tag}>`;

        // use the full variant for every combination
        tests.push($createTest($fullIfElse, expected, properties, [tag, ifText, $if, {id:'variant$01'}]));

        // the only-if variants only make sense to have when the template has no else (prevent absolute test duplication)
        if (!$else.value) {
          tests.push($createTest($onlyIf, expected, properties, [tag, ifText, $if, {id:'variant$02'}]));

          tests.push($createTest($ifEmptyElse, expected, properties, [tag, ifText, $if, {id:'variant$03'}]));
        }

        // the only-else variant only makes sense to have when the template's if branch is false (prevent absolute test duplication)
        if (!$if.value) {
          tests.push($createTest($onlyElse, expected, properties, [tag, ifText, $if, {id:'variant$04'}]));
        }

        for (const $repeat of repeaters) {
          // only work with number or arrays as the repeaters value;
          // for a number we repeat the text content n times
          // otherwise we use the array values directly
          const $expected = typeof $repeat.value === 'number'
            ? expected.repeat($repeat.value)
            : $repeat.value.join('');

          // identical to the if/else tests one level up, but wrapped in the repeater
          tests.push($createTest(
            `<${$tag} ${$repeat.attr}>${$fullIfElse}</${$tag}>`,
            $expected, properties, [tag, ifText, $if, $repeat, {id:'variant$01'}])
          );

          const $repeatIfText = `<${$tag} ${$repeat.attr}>${ifText.markup}</${$tag}>`;
          const $repeatElseText = `<${$tag} ${$repeat.attr}>${elseText.markup}</${$tag}>`;

          // the inverse of the fullIfElse wrapped by repeater (repeater wrapped by if/else)
          tests.push($createTest(
            `<${$tag} ${$if.attr}>${$repeatIfText}</${$tag}>` +
            `<${$tag} ${$else.attr}>${$repeatElseText}</${$tag}>`,
            $expected, properties, [tag, ifText, $if, $repeat, {id:'variant$02'}])
          );
          // same as the test above but with the template controllers on the same element
          tests.push($createTest(
            `<${$tag} ${$if.attr} ${$repeat.attr}>${ifText.markup}</${$tag}>` +
            `<${$tag} ${$else.attr} ${$repeat.attr}>${elseText.markup}</${$tag}>`,
            $expected, properties, [tag, ifText, $if, $repeat, {id:'variant$03'}])
          );

          // same concept as the !$else.value branch one level up, once wrapped with a repeater,
          // and once where the repeater is wrapped by the if (2x the number of tests due to testing
          // both placements, and some additional tests for testing template controllers on same elements)
          if (!$else.value) {
            tests.push($createTest(
              `<${$tag} ${$repeat.attr}>${$onlyIf}<${$tag}>`,
              $expected, properties, [tag, ifText, $if, $repeat, {id:'variant$04'}])
            );
            // same as test above, but template controllers on same element
            tests.push($createTest(
              `<${$tag} ${$repeat.attr} ${$if.attr}>${ifText.markup}<${$tag}>`,
              $expected, properties, [tag, ifText, $if, $repeat, {id:'variant$05'}])
            );
            tests.push($createTest(
              `<${$tag} ${$if.attr}>${$repeatIfText}</${$tag}>`,
              $expected, properties, [tag, ifText, $if, $repeat, {id:'variant$06'}])
            );
            // same as test above, but template controllers on same element
            tests.push($createTest(
              `<${$tag} ${$if.attr} ${$repeat.attr}>${ifText.markup}</${$tag}>`,
              $expected, properties, [tag, ifText, $if, $repeat, {id:'variant$07'}])
            );

            tests.push($createTest(
              `<${$tag} ${$repeat.attr}>${$ifEmptyElse}<${$tag}>`,
              $expected, properties, [tag, ifText, $if, $repeat, {id:'variant$08'}])
            );
            tests.push($createTest(
              `<${$tag} ${$if.attr}>${$repeatIfText}</${$tag}>` +
              `<${$tag} ${$else.attr}></${$tag}>`,
              $expected, properties, [tag, ifText, $if, $repeat, {id:'variant$09'}])
            );
          }

          // same concept as the !$if.value branch one level up, once wrapped with a repeater,
          // and once where the repeater is wrapped by the else (2x the number of tests due to testing
          // both placements)
          if (!$if.value) {
            tests.push($createTest(
              `<${$tag} ${$repeat.attr}>${$onlyElse}<${$tag}>`,
              $expected, properties, [tag, ifText, $if, $repeat, {id:'variant$08'}])
            );
            tests.push($createTest(
              `<${$tag} ${$if.attr}></${$tag}>` +
              `<${$tag} ${$else.attr}>${$repeatElseText}</${$tag}>`,
              $expected, properties, [tag, ifText, $if, $repeat, {id:'variant$09'}])
            );
            // same as test above, but template controllers on same element
            tests.push($createTest(
              `<${$tag} ${$if.attr}></${$tag}>` +
              `<${$tag} ${$else.attr} ${$repeat.attr}>${elseText.markup}</${$tag}>`,
              $expected, properties, [tag, ifText, $if, $repeat, {id:'variant$10'}])
            );
          }
        }
      }
    }
  }
  return tests;
}

const nodes = [
  $import('chai', 'expect'),
  $import('../../../kernel/src/index', 'DI'),
  $import('../../../runtime/src/index', 'CustomElementResource', 'DOM', 'Aurelia'),
  $import('../../src/index', 'BasicConfiguration'),
  null,
  $describeOnly(
    'template-compiler.generated',
    $functionDeclaration(
      'setup',
      $createContainer(),
      $register('BasicConfiguration'),
      $createAurelia('au'),
      $createHost(),
      createReturn($object('au', 'host'))
    ),
    ...generateTests(tags, texts, ifElses, repeats)
  )
];

emit(outFile, ...nodes);
