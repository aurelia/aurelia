import { join } from 'path';
import { createConditional, MethodDeclaration, Statement } from 'typescript';
import project from '../project';
import {
  $$assign,
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
  $id,
  $method,
  $param,
  $property,
  emit
} from './util';

function outFile(suffix: string): string {
  return join(`${project.path}`, 'packages', 'jit-html', 'test', 'generated', `template-compiler.${suffix}.spec.ts`);
}

function $hook(name: string, mutation: Statement | Statement[], flush?: boolean, expectedBeforeFlush?: [any, any], expectedAfterFlush?: [any, any]): MethodDeclaration {
  return $method(name, [
    ...Array.isArray(mutation) ? mutation : [mutation],
    ...expectedBeforeFlush ? [$$call(
      [$call('expect', ['this.el.textContent']), 'to.equal'],
      [createConditional($access('this.cycled'), $expression(expectedBeforeFlush[1]), $expression(expectedBeforeFlush[0])), $expression(`this.el.textContent during ${name}() before mutation${flush ? ' before flushChanges()' : ''}`)])] : [],
    ...flush ? [$$call('this.$lifecycle.processFlushQueue')] : [],
    ...expectedAfterFlush ? [$$call(
      [$call('expect', ['this.el.textContent']), 'to.equal'],
      [createConditional($access('this.cycled'), $expression(expectedAfterFlush[1]), $expression(expectedAfterFlush[0])), $expression(`this.el.textContent during ${name}() after mutation${flush ? ' after flushChanges()' : ''}`)])] : []
  ]);
}

function $$verify(start1ExpectedValue: any, start1ExpectedText: string, stop1ExpectedValue: any, start2ExpectedValue: any, start2ExpectedText: string, stop2ExpectedValue: any): Statement[] {
  return [
    $$call('au.start'),
    $$call([$call('expect', ['host.textContent']), 'to.equal'], [$expression(start1ExpectedText), $expression('host.textContent after start #1')]),
    $$call([$call('expect', ['items']), 'to.deep.equal'], [$expression(start1ExpectedValue)]),
    $$call('au.stop'),
    $$call([$call('expect', ['host.textContent']), 'to.equal'], [$expression(''), $expression('host.textContent after stop #1')]),
    $$call([$call('expect', ['items']), 'to.deep.equal'], [$expression(stop1ExpectedValue)]),
    $$call('au.start'),
    $$call([$call('expect', ['host.textContent']), 'to.equal'], [$expression(start2ExpectedText), $expression('host.textContent after start #2')]),
    $$call([$call('expect', ['items']), 'to.deep.equal'], [$expression(start2ExpectedValue)]),
    $$call('au.stop'),
    $$call([$call('expect', ['host.textContent']), 'to.equal'], [$expression(''), $expression('host.textContent after stop #2')]),
    $$call([$call('expect', ['items']), 'to.deep.equal'], [$expression(stop2ExpectedValue)]),
  ];
}

function generateAndEmit(): void {
  const testsRecord = {
    'mutations.basic': [
      $$functionExpr('it', [
        $expression('works 1'),
        $functionExpr([
          $$const(['au', 'host'], $call('setup')),
          $$const('App', $call('CustomElementResource.define', [
            $expression({ name: 'app', template: `<template><foo></foo></template>` }),
            $class([])
          ])),
          $$const('items', $expression([])),
          $$const('Foo', $call('CustomElementResource.define', [
            $expression({ name: 'foo', template: `<template><div repeat.for="item of items">\${item}</div></template>` }),
            $class([
              $property('inject', [class INode {}], true),
              $property('items', $id('items')),
              $property('el'),
              $property('$lifecycle'),
              $property('cycled', false),
              $method('constructor', [$$assign('this.el', 'el')], [$param('el')]),
              $hook('binding', $$call('this.items.push', [$expression(1)])),
              $hook('bound', $$call('this.items.push', [$expression(2)]), false, ['', '']),
              $hook('attaching', $$call('this.items.push', [$expression(3)]), true, ['', '']),
              $hook('attached', $$call('this.items.push', [$expression(4)]), true, ['123', '12345678123'], ['1234', '123456781234']),
              $hook('detaching', $$call('this.items.push', [$expression(5)]), true, ['1234', '123456781234'], ['12345', '1234567812345']),
              $hook('detached', $$call('this.items.push', [$expression(6)])),
              $hook('unbinding', $$call('this.items.push', [$expression(7)])),
              $hook('unbound', [$$call('this.items.push', [$expression(8)]), $$assign('this.cycled', 'true')], true, ['', ''], ['', ''])
            ])
          ])),
          $$call('au.register', ['Foo']),
          $$new('component', 'App'),
          $$call('au.app', [$expression({ host: 'host', component: 'component' })]),
          ...$$verify(
            [1, 2, 3, 4],
            '1234',
            [1, 2, 3, 4, 5, 6, 7, 8],
            [1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4],
            '123456781234',
            [1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8]
          )
        ])
      ]),
      $$functionExpr('it', [
        $expression('works 2'),
        $functionExpr([
          $$const(['au', 'host'], $call('setup')),
          $$const('App', $call('CustomElementResource.define', [
            $expression({ name: 'app', template: `<template><foo></foo></template>` }),
            $class([])
          ])),
          $$const('items', $expression([])),
          $$const('Foo', $call('CustomElementResource.define', [
            $expression({ name: 'foo', template: `<template><div repeat.for="item of items">\${item}</div></template>` }),
            $class([
              $property('inject', [class INode {}], true),
              $property('items', $id('items')),
              $property('el'),
              $property('$lifecycle'),
              $property('cycled', false),
              $method('constructor', [$$assign('this.el', 'el')], [$param('el')]),
              $hook('binding', $$call('this.items.push', [$expression(1)])),
              $hook('bound', $$call('this.items.push', [$expression(2)]), false, ['', '']),
              $hook('attaching', $$call('this.items.push', [$expression(3)]), false, ['', '']),
              $hook('attached', $$call('this.items.push', [$expression(4)]), false, ['123', '12345678123']),
              $hook('detaching', $$call('this.items.push', [$expression(5)]), false, ['123', '12345678123']),
              $hook('detached', $$call('this.items.push', [$expression(6)])),
              $hook('unbinding', $$call('this.items.push', [$expression(7)])),
              $hook('unbound', [$$call('this.items.push', [$expression(8)]), $$assign('this.cycled', 'true')], true, ['', ''], ['', ''])
            ])
          ])),
          $$call('au.register', ['Foo']),
          $$new('component', 'App'),
          $$call('au.app', [$expression({ host: 'host', component: 'component' })]),
          ...$$verify(
            [1, 2, 3, 4],
            '123',
            [1, 2, 3, 4, 5, 6, 7, 8],
            [1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4],
            '12345678123',
            [1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8]
          )
        ])
      ]),
      $$functionExpr('it', [
        $expression('works 3'),
        $functionExpr([
          $$const(['au', 'host'], $call('setup')),
          $$const('App', $call('CustomElementResource.define', [
            $expression({ name: 'app', template: `<template><foo></foo></template>` }),
            $class([])
          ])),
          $$const('items', $expression([])),
          $$const('Foo', $call('CustomElementResource.define', [
            $expression({ name: 'foo', template: `<template><div repeat.for="item of items" if.bind="item % mod === 0">\${item}</div></template>` }),
            $class([
              $property('inject', [class INode {}], true),
              $property('items', $id('items')),
              $property('mod', 2),
              $property('el'),
              $property('$lifecycle'),
              $property('cycled', false),
              $method('constructor', [$$assign('this.el', 'el')], [$param('el')]),
              $hook('binding', $$call('this.items.push', [$expression(1)])),
              $hook('bound', $$call('this.items.push', [$expression(2)]), false, ['', '']),
              $hook('attaching', $$call('this.items.push', [$expression(3)]), true, ['', '']),
              $hook('attached', $$call('this.items.push', [$expression(4)]), true, ['2', '363'], ['24', '363']),
              $hook('detaching', $$call('this.items.push', [$expression(5)]), true, ['24', '363'], ['24', '363']),
              $hook('detached', $$call('this.items.push', [$expression(6)])),
              $hook('unbinding', $$call('this.items.push', [$expression(7)])),
              $hook('unbound', [$$call('this.items.push', [$expression(8)]), $$assign('this.cycled', 'true'), $$assign('this.mod', [$expression(3)])], true, ['', ''], ['', ''])
            ])
          ])),
          $$call('au.register', ['Foo']),
          $$new('component', 'App'),
          $$call('au.app', [$expression({ host: 'host', component: 'component' })]),
          ...$$verify(
            [1, 2, 3, 4],
            '24',
            [1, 2, 3, 4, 5, 6, 7, 8],
            [1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4],
            '363',
            [1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8]
          )
        ])
      ]),
      $$functionExpr('it', [
        $expression('works 4'),
        $functionExpr([
          $$const(['au', 'host'], $call('setup')),
          $$const('App', $call('CustomElementResource.define', [
            $expression({ name: 'app', template: `<template><foo></foo></template>` }),
            $class([])
          ])),
          $$const('items', $expression([])),
          $$const('Foo', $call('CustomElementResource.define', [
            $expression({ name: 'foo', template: `<template><div repeat.for="item of items" if.bind="item % mod === 0">\${item}</div></template>` }),
            $class([
              $property('inject', [class INode {}], true),
              $property('items', $id('items')),
              $property('mod', 2),
              $property('el'),
              $property('$lifecycle'),
              $property('cycled', false),
              $method('constructor', [$$assign('this.el', 'el')], [$param('el')]),
              $hook('binding', $$call('this.items.push', [$expression(1)])),
              $hook('bound', $$call('this.items.push', [$expression(2)]), false, ['', '']),
              $hook('attaching', $$call('this.items.push', [$expression(3)]), false, ['', '']),
              $hook('attached', $$call('this.items.push', [$expression(4)]), false, ['2', '363']),
              $hook('detaching', $$call('this.items.push', [$expression(5)]), false, ['2', '363']),
              $hook('detached', $$call('this.items.push', [$expression(6)])),
              $hook('unbinding', $$call('this.items.push', [$expression(7)])),
              $hook('unbound', [$$call('this.items.push', [$expression(8)]), $$assign('this.cycled', 'true'), $$assign('this.mod', [$expression(3)])], true, ['', ''], ['', ''])
            ])
          ])),
          $$call('au.register', ['Foo']),
          $$new('component', 'App'),
          $$call('au.app', [$expression({ host: 'host', component: 'component' })]),
          ...$$verify(
            [1, 2, 3, 4],
            '2',
            [1, 2, 3, 4, 5, 6, 7, 8],
            [1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4],
            '363',
            [1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8]
          )
        ])
      ])
    ]
  };
  for (const suffix in testsRecord) {
    const tests = testsRecord[suffix];
    const nodes = [
      $$import('@aurelia/runtime', 'Aurelia', 'CustomElementResource', 'INode'),
      $$import('chai', 'expect'),
      $$import('../util', 'TestContext'),
      null,
      $$functionExpr('describe', [
        $expression(`generated.template-compiler.${suffix}`),
        $functionExpr([
          $$functionDecl(
            'setup',
            [
              $$const('ctx', $call('TestContext.createHTMLTestContext')),
              $$new('au', 'Aurelia', ['ctx.container']),
              $$const('host', $call('ctx.createElement', [$expression('div')])),
              $$return({ au: 'au', host: 'host', ctx: 'ctx' })
            ],
            []
          ),
          ...tests
        ])
      ])
    ];

    emit(outFile(suffix), ...nodes);
  }
}

generateAndEmit();
