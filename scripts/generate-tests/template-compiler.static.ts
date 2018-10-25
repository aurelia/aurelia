import { SyntaxKind, Statement, createReturn } from 'typescript';
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
  $start
} from './util';
import project from '../project';
import { join } from 'path';

const outFile = join(`${project.path}`, 'packages', 'jit', 'test', 'generated', 'template-compiler.static.spec.ts');

const describeCalls: Statement[] = [];

const leafValues = [
  // first 4 basic leafs
  {
    variant: '01',
    name: '"a"',
    notName: '"b"',
    template: 'a',
    notTemplate: 'b',
    members: [],
    expectedAfterStart: 'a',
    expectedAfterStop: '',
    isNotVariant: false
  },
  {
    variant: '02',
    name: '"a"',
    notName: '${notMsg}',
    template: 'a',
    notTemplate: '${notMsg}',
    members: [
      $classProperty('notMsg', SyntaxKind.StringKeyword, 'b')
    ],
    expectedAfterStart: 'a',
    expectedAfterStop: '',
    isNotVariant: true
  },
  {
    variant: '03',
    name: '${msg}',
    notName: '"b"',
    template: '${msg}',
    notTemplate: 'b',
    members: [
      $classProperty('msg', SyntaxKind.StringKeyword, 'a')
    ],
    expectedAfterStart: 'a',
    expectedAfterStop: '',
    isNotVariant: false
  },
  {
    variant: '04',
    name: '${msg}',
    notName: '${notMsg}',
    template: '${msg}',
    notTemplate: '${notMsg}',
    members: [
      $classProperty('msg', SyntaxKind.StringKeyword, 'a'),
      $classProperty('notMsg', SyntaxKind.StringKeyword, 'b')
    ],
    expectedAfterStart: 'a',
    expectedAfterStop: '',
    isNotVariant: true
  },
  // 4 same leafs wrapped in div.repeat
  {
    variant: '05',
    name: 'div.repeat x3 > "a"',
    notName: 'div.repeat x3 > "b"',
    template: $attr($div, `repeat.for="i of 3"`)('a'),
    notTemplate: $attr($div, `repeat.for="i of 3"`)('b'),
    members: [],
    expectedAfterStart: 'aaa',
    expectedAfterStop: '',
    isNotVariant: false
  },
  {
    variant: '06',
    name: 'div.repeat x3 > "a"',
    notName: 'div.repeat x3 > ${notMsg}',
    template: $attr($div, `repeat.for="i of 3"`)('a'),
    notTemplate: $attr($div, `repeat.for="i of 3"`)('${notMsg}'),
    members: [
      $classProperty('notMsg', SyntaxKind.StringKeyword, 'b')
    ],
    expectedAfterStart: 'aaa',
    expectedAfterStop: '',
    isNotVariant: true
  },
  {
    variant: '07',
    name: 'div.repeat x3 > ${msg}',
    notName: 'div.repeat x3 > "b"',
    template: $attr($div, `repeat.for="i of 3"`)('${msg}'),
    notTemplate: $attr($div, `repeat.for="i of 3"`)('b'),
    members: [
      $classProperty('msg', SyntaxKind.StringKeyword, 'a')
    ],
    expectedAfterStart: 'aaa',
    expectedAfterStop: '',
    isNotVariant: false
  },
  {
    variant: '08',
    name: 'div.repeat x3 > ${msg}',
    notName: 'div.repeat x3 > ${notMsg}',
    template: $attr($div, `repeat.for="i of 3"`)('${msg}'),
    notTemplate: $attr($div, `repeat.for="i of 3"`)('${notMsg}'),
    members: [
      $classProperty('msg', SyntaxKind.StringKeyword, 'a'),
      $classProperty('notMsg', SyntaxKind.StringKeyword, 'b')
    ],
    expectedAfterStart: 'aaa',
    expectedAfterStop: '',
    isNotVariant: true
  },
  // 4 same leafs wrapped in template.repeat
  {
    variant: '09',
    name: 'tpl.repeat x3 > "a"',
    notName: 'tpl.repeat x3 > "b"',
    template: $attr($tpl, `repeat.for="i of 3"`)('a'),
    notTemplate: $attr($tpl, `repeat.for="i of 3"`)('b'),
    members: [],
    expectedAfterStart: 'aaa',
    expectedAfterStop: '',
    isNotVariant: false
  },
  {
    variant: '10',
    name: 'tpl.repeat x3 > "a"',
    notName: 'tpl.repeat x3 > ${notMsg}',
    template: $attr($tpl, `repeat.for="i of 3"`)('a'),
    notTemplate: $attr($tpl, `repeat.for="i of 3"`)('${notMsg}'),
    members: [
      $classProperty('notMsg', SyntaxKind.StringKeyword, 'b')
    ],
    expectedAfterStart: 'aaa',
    expectedAfterStop: '',
    isNotVariant: true
  },
  {
    variant: '11',
    name: 'tpl.repeat x3 > ${msg}',
    notName: 'tpl.repeat x3 > "b"',
    template: $attr($tpl, `repeat.for="i of 3"`)('${msg}'),
    notTemplate: $attr($tpl, `repeat.for="i of 3"`)('b'),
    members: [
      $classProperty('msg', SyntaxKind.StringKeyword, 'a')
    ],
    expectedAfterStart: 'aaa',
    expectedAfterStop: '',
    isNotVariant: false
  },
  {
    variant: '12',
    name: 'tpl.repeat x3 > ${msg}',
    notName: 'tpl.repeat x3 > ${notMsg}',
    template: $attr($tpl, `repeat.for="i of 3"`)('${msg}'),
    notTemplate: $attr($tpl, `repeat.for="i of 3"`)('${notMsg}'),
    members: [
      $classProperty('msg', SyntaxKind.StringKeyword, 'a'),
      $classProperty('notMsg', SyntaxKind.StringKeyword, 'b')
    ],
    expectedAfterStart: 'aaa',
    expectedAfterStop: '',
    isNotVariant: true
  }
];

for (const $create of [$div, $tpl]) {
  for (const leafValue of leafValues) {
    const {
      variant,
      name,
      notName,
      template,
      notTemplate,
      members,
      expectedAfterStart,
      expectedAfterStop,
      isNotVariant
    } = leafValue;

    const itCalls: Statement[] = [];
    if (!isNotVariant) {
      // prevent test duplication by not generating tests that don't use the "not" variant
      itCalls.push(
        // the variants here are just an aid in organizing/finding tests and grouping them
        // the "10x" here are variants that have "not" variant parallels, which have the same
        // last 2 digits but start with 2xx, e.g. 101 has a "not" variant parallel that's 201
        // also note that the second digit is another psuedo-group in itself (mostly to do with nesting depth / type)
        $test(
          `$${variant}$001 ${name}`,
          $create(template),
          expectedAfterStart,
          expectedAfterStop,
          ...members
        ),
        // 101-102: single-nested if or else
        $test(
          `$${variant}$101 ${$create.$name}.if.true > ${name}`,
          $create(
            $attr($create, `if.bind="true"`)(template)
          ),
          expectedAfterStart,
          expectedAfterStop,
          ...members
        ),
        $test(
          `$${variant}$102 (${$create.$name}.if.false > "") + (${$create.$name}.else > ${name})`,
          $create(
            $attr($create, `if.bind="false"`)(``) +
            $attr($create, `else`)(template)
          ),
          expectedAfterStart,
          expectedAfterStop,
          ...members
        ),
        // 103-104: single-nested if or else + sibling repeat
        $test(
          `$${variant}$103 ${$create.$name}.if.true +> ${$create.$name}.repeat x3 > ${name}`,
          $create(
            $attr($create, `if.bind="true"`, `repeat.for="i of 3"`)(template)
          ),
          expectedAfterStart.repeat(3),
          expectedAfterStop,
          ...members
        ),
        $test(
          `$${variant}$104 (${$create.$name}.if.false > "") + (${$create.$name}.else +> ${$create.$name}.repeat x3 > ${name})`,
          $create(
            $attr($create, `if.bind="false"`)(``) +
            $attr($create, `else`, `repeat.for="i of 3"`)(template)
          ),
          expectedAfterStart.repeat(3),
          expectedAfterStop,
          ...members
        ),
        // 105: sibling repeat + single-nested if
        $test(
          `$${variant}$105 ${$create.$name}.repeat x3 +> ${$create.$name}.if.true > ${name}`,
          $create(
            $attr($create, `repeat.for="i of 3"`, `if.bind="true"`)(template)
          ),
          expectedAfterStart.repeat(3),
          expectedAfterStop,
          ...members
        ),
        // 106-107: parent repeat + single-nested if or else
        $test(
          `$${variant}$106 ${$create.$name}.repeat x3 > ${$create.$name}.if.true > ${name}`,
          $create(
            $attr($create, `repeat.for="i of 3"`)(
              $attr($create, `if.bind="true"`)(template)
            )
          ),
          expectedAfterStart.repeat(3),
          expectedAfterStop,
          ...members
        ),
        $test(
          `$${variant}$107 (${$create.$name}.if.false > "") + (${$create.$name}.else)`,
          $create(
            $attr($create, `repeat.for="i of 3"`)(
              $attr($create, `if.bind="false"`)(``) +
              $attr($create, `else`)(template)
            )
          ),
          expectedAfterStart.repeat(3),
          expectedAfterStop,
          ...members
        ),
        // 12x: double-nested if or else (skip a number each because the "not" variants are twice as many)
        $test(
          `$${variant}$121 ${$create.$name}.if.true > ${$create.$name}.if.true > ${name}`,
          $create(
            $attr($create, `if.bind="true"`)(
              $attr($create, `if.bind="true"`)(template)
            )
          ),
          expectedAfterStart,
          expectedAfterStop,
          ...members
        ),
        $test(
          `$${variant}$123 ${$create.$name}.if.true > (${$create.$name}.if.false > "") : (${$create.$name}.else > ${name})`,
          $create(
            $attr($create, `if.bind="true"`)(
              $attr($create, `if.bind="false"`)(``) +
              $attr($create, `else`)(template)
            )
          ),
          expectedAfterStart,
          expectedAfterStop,
          ...members
        ),
        $test(
          `$${variant}$125 ${$create.$name}.else > ${$create.$name}.else > ${name}`,
          $create(
            $attr($create, `if.bind="false"`)(``) +
            $attr($create, `else`)(
              $attr($create, `if.bind="false"`)(``) +
              $attr($create, `else`)(template)
            )
          ),
          expectedAfterStart,
          expectedAfterStop,
          ...members
        ),
        $test(
          `$${variant}$127 (${$create.$name}.if.false > "") + (${$create.$name}.else > ${$create.$name}.if.true > ${name})`,
          $create(
            $attr($create, `if.bind="false"`)(``) +
            $attr($create, `else`)(
              $attr($create, `if.bind="true"`)(template)
            )
          ),
          expectedAfterStart,
          expectedAfterStop,
          ...members
        ),
        $test(                        // this super-fancy "+>" syntax means it's sibling template controllers :) (just to give these tests a distinguishing name, since outcome is / should be identical)
          `$${variant}$128 (${$create.$name}.if.false > "") + (${$create.$name}.else +> ${$create.$name}.if.true > ${name})`,
          $create(
            $attr($create, `if.bind="false"`)(``) +
            $attr($create, `else`, `if.bind="true"`)(template)
          ),
          expectedAfterStart,
          expectedAfterStop,
          ...members
        ),
        // 14x: parent repeat + double-nested if or else
        $test(
          `$${variant}$141 ${$create.$name}.repeat x3 > (${$create.$name}.if.true > ${$create.$name}.if.true > ${name})`,
          $create(
            $attr($create, `repeat.for="i of 3"`)(
              $attr($create, `if.bind="true"`)(
                $attr($create, `if.bind="true"`)(template)
              )
            )
          ),
          expectedAfterStart.repeat(3),
          expectedAfterStop,
          ...members
        ),
        $test(
          `$${variant}$143 ${$create.$name}.repeat x3 > (${$create.$name}.if.true > (${$create.$name}.if.false > "") : (${$create.$name}.else > ${name}))`,
          $create(
            $attr($create, `repeat.for="i of 3"`)(
              $attr($create, `if.bind="true"`)(
                $attr($create, `if.bind="false"`)(``) +
                $attr($create, `else`)(template)
              )
            )
          ),
          expectedAfterStart.repeat(3),
          expectedAfterStop,
          ...members
        ),
        $test(
          `$${variant}$145 ${$create.$name}.repeat x3 > (${$create.$name}.else > ${$create.$name}.else > ${name})`,
          $create(
            $attr($create, `repeat.for="i of 3"`)(
              $attr($create, `if.bind="false"`)(``) +
              $attr($create, `else`)(
                $attr($create, `if.bind="false"`)(``) +
                $attr($create, `else`)(template)
              )
            )
          ),
          expectedAfterStart.repeat(3),
          expectedAfterStop,
          ...members
        ),
        $test(
          `$${variant}$147 ${$create.$name}.repeat x3 > ((${$create.$name}.if.false > "") + (${$create.$name}.else > ${$create.$name}.if.true > ${name}))`,
          $create(
            $attr($create, `repeat.for="i of 3"`)(
              $attr($create, `if.bind="false"`)(``) +
              $attr($create, `else`)(
                $attr($create, `if.bind="true"`)(template)
              )
            )
          ),
          expectedAfterStart.repeat(3),
          expectedAfterStop,
          ...members
        ),
        $test(
          `$${variant}$148 ${$create.$name}.repeat x3 > ((${$create.$name}.if.false > "") + (${$create.$name}.else +> ${$create.$name}.if.true > ${name}))`,
          $create(
            $attr($create, `repeat.for="i of 3"`)(
              $attr($create, `if.bind="false"`)(``) +
              $attr($create, `else`, `if.bind="true"`)(template)
            )
          ),
          expectedAfterStart.repeat(3),
          expectedAfterStop,
          ...members
        ),
        // 16x: sibling repeat + double-nested if
        $test(
          `$${variant}$161 ${$create.$name}.repeat x3 +> (${$create.$name}.if.true > ${$create.$name}.if.true > ${name})`,
          $create(
            $attr($create, `repeat.for="i of 3"`, `if.bind="true"`)(
              $attr($create, `if.bind="true"`)(template)
            )
          ),
          expectedAfterStart.repeat(3),
          expectedAfterStop,
          ...members
        ),
        $test(
          `$${variant}$162 ${$create.$name}.if.true +> (${$create.$name}.repeat x3 > ${$create.$name}.if.true > ${name})`,
          $create(
            $attr($create, `if.bind="true"`, `repeat.for="i of 3"`)(
              $attr($create, `if.bind="true"`)(template)
            )
          ),
          expectedAfterStart.repeat(3),
          expectedAfterStop,
          ...members
        ),
        $test(
          `$${variant}$163 ${$create.$name}.if.true > (${$create.$name}.repeat x3 +> (${$create.$name}.if.true > ${name}))`,
          $create(
            $attr($create, `if.bind="true"`)(
              $attr($create, `repeat.for="i of 3"`, `if.bind="true"`)(template)
            )
          ),
          expectedAfterStart.repeat(3),
          expectedAfterStop,
          ...members
        ),
        $test(
          `$${variant}$164 ${$create.$name}.if.true +> (${$create.$name}.if.true +> ${$create.$name}.repeat x3 > ${name})`,
          $create(
            $attr($create, `if.bind="true"`)(
              $attr($create, `if.bind="true"`, `repeat.for="i of 3"`)(template)
            )
          ),
          expectedAfterStart.repeat(3),
          expectedAfterStop,
          ...members
        ),
        $test(
          `$${variant}$165 ${$create.$name}.repeat x3 +> (${$create.$name}.if.true > (${$create.$name}.repeat x3 +> (${$create.$name}.if.true > ${name})))`,
          $create(
            $attr($create, `repeat.for="i of 3"`, `if.bind="true"`)(
              $attr($create, `repeat.for="i of 3"`, `if.bind="true"`)(template)
            )
          ),
          expectedAfterStart.repeat(9),
          expectedAfterStop,
          ...members
        ),
        $test(
          `$${variant}$166 ${$create.$name}.if.true +> (${$create.$name}.repeat x3 > (${$create.$name}.repeat x3 +> (${$create.$name}.if.true > ${name})))`,
          $create(
            $attr($create, `if.bind="true"`, `repeat.for="i of 3"`)(
              $attr($create, `repeat.for="i of 3"`, `if.bind="true"`)(template)
            )
          ),
          expectedAfterStart.repeat(9),
          expectedAfterStop,
          ...members
        ),
        $test(
          `$${variant}$167 ${$create.$name}.repeat x3 +> (${$create.$name}.if.true > (${$create.$name}.if.true +> ${$create.$name}.repeat x3 > ${name}))`,
          $create(
            $attr($create, `repeat.for="i of 3"`, `if.bind="true"`)(
              $attr($create, `if.bind="true"`, `repeat.for="i of 3"`)(template)
            )
          ),
          expectedAfterStart.repeat(9),
          expectedAfterStop,
          ...members
        ),
        $test(
          `$${variant}$168 ${$create.$name}.if.true +> (${$create.$name}.repeat x3 > (${$create.$name}.if.true +> ${$create.$name}.repeat x3 > ${name}))`,
          $create(
            $attr($create, `if.bind="true"`, `repeat.for="i of 3"`)(
              $attr($create, `if.bind="true"`, `repeat.for="i of 3"`)(template)
            )
          ),
          expectedAfterStart.repeat(9),
          expectedAfterStop,
          ...members
        )
      );
    }
    itCalls.push(
      // 20x: single-nested if or else
      $test(
        `$${variant}$201 (${$create.$name}.if.true > ${name}) + (else > ${notName})`,
        $create(
          $attr($create, `if.bind="true"`)(template) +
          $attr($create, `else`)(notTemplate)
        ),
        expectedAfterStart,
        expectedAfterStop,
        ...members
      ),
      $test(
        `$${variant}$202 (${$create.$name}.if.false > ${notName}) + (${$create.$name}.else > ${name})`,
        $create(
          $attr($create, `if.bind="false"`)(notTemplate) +
          $attr($create, `else`)(template)
        ),
        expectedAfterStart,
        expectedAfterStop,
        ...members
      ),
      // 22x: double-nested if or else
      $test(
        `$${variant}$221 ${$create.$name}.if.true > ((${$create.$name}.if.true > ${name}) + (else > ${notName}))`,
        $create(
          $attr($create, `if.bind="true"`)(
            $attr($create, `if.bind="true"`)(template) +
            $attr($create, `else`)(notTemplate)
          )
        ),
        expectedAfterStart,
        expectedAfterStop,
        ...members
      ),
      $test(
        `$${variant}$222 (${$create.$name}.if.true > ((${$create.$name}.if.true > ${name}) + (else > ${notName}))) + (else > ${notName})`,
        $create(
          $attr($create, `if.bind="true"`)(
            $attr($create, `if.bind="true"`)(template) +
            $attr($create, `else`)(notTemplate)
          ) +
          $attr($create, `else`)(notTemplate)
        ),
        expectedAfterStart,
        expectedAfterStop,
        ...members
      ),
      $test(
        `$${variant}$223 ${$create.$name}.if.true > ((${$create.$name}.if.false > ${notName}) + (else > ${name}))`,
        $create(
          $attr($create, `if.bind="true"`)(
            $attr($create, `if.bind="false"`)(notTemplate) +
            $attr($create, `else`)(template)
          )
        ),
        expectedAfterStart,
        expectedAfterStop,
        ...members
      ),
      $test(
        `$${variant}$224 (${$create.$name}.if.true > ((${$create.$name}.if.false > ${notName}) + (else > ${name}))) + (else > ${notName})`,
        $create(
          $attr($create, `if.bind="true"`)(
            $attr($create, `if.bind="false"`)(notTemplate) +
            $attr($create, `else`)(template)
          ) +
          $attr($create, `else`)(notTemplate)
        ),
        expectedAfterStart,
        expectedAfterStop,
        ...members
      ),
      $test(
        `$${variant}$225 (${$create.$name}.if.false > "") + (${$create.$name}.else > (if.bind="false" > ${notName}) + (${$create.$name}.else > ${name}))`,
        $create(
          $attr($create, `if.bind="false"`)(``) +
          $attr($create, `else`)(
            $attr($create, `if.bind="false"`)(notTemplate) +
            $attr($create, `else`)(template)
          )
        ),
        expectedAfterStart,
        expectedAfterStop,
        ...members
      ),
      $test(
        `$${variant}$226 (${$create.$name}.if.false > ${notName}) + (${$create.$name}.else > (if.bind="false" > ${notName}) + (${$create.$name}.else > ${name}))`,
        $create(
          $attr($create, `if.bind="false"`)(notTemplate) +
          $attr($create, `else`)(
            $attr($create, `if.bind="false"`)(notTemplate) +
            $attr($create, `else`)(template)
          )
        ),
        expectedAfterStart,
        expectedAfterStop,
        ...members
      ),
      $test(
        `$${variant}$227 (${$create.$name}.if.false > ${notName}) + (${$create.$name}.else > (if.bind="true" > ${name}))`,
        $create(
          $attr($create, `if.bind="false"`)(notTemplate) +
          $attr($create, `else`)(
            $attr($create, `if.bind="true"`)(template)
          )
        ),
        expectedAfterStart,
        expectedAfterStop,
        ...members
      ),
      $test(
        `$${variant}$228 (${$create.$name}.if.false > ${notName}) + (${$create.$name}.else +> ${$create.$name}.if.true > ${name})`,
        $create(
          $attr($create, `if.bind="false"`)(notTemplate) +
          $attr($create, `else`, `if.bind="true"`)(template)
        ),
        expectedAfterStart,
        expectedAfterStop,
        ...members
      )
    );

    describeCalls.push(
      $describe(`$${variant}$xxx template=${name}, notTemplate=${notTemplate} (${$create.$name})`,
      ...itCalls)
    );
  }
}


const nodes = [
  $import('chai', 'expect'),
  $import('../../../kernel/src/index', 'DI'),
  $import('../../../runtime/src/index', 'CustomElementResource', 'DOM', 'Aurelia'),
  $import('../../src/index', 'BasicConfiguration'),
  null,
  $describe(
    'template-compiler.generated',
    $functionDeclaration(
      'setup',
      $createContainer(),
      $register('BasicConfiguration'),
      $createAurelia('au'),
      $createHost(),
      createReturn($object('au', 'host'))
    ),
    ...describeCalls
  )
];

emit(outFile, ...nodes);
