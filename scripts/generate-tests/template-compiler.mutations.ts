import { Statement, PropertyDeclaration, createConditional } from 'typescript';
import {
  emit,
  $property,
  $$import,
  $$functionDecl,
  $call,
  $$const,
  $param,
  $$call,
  $expression,
  $$new,
  $$return,
  $access,
  $class,
  $$functionExpr,
  $functionExpr,
  $method,
  $$assign,
  $id
} from './util';
import project from '../project';
import { join } from 'path';
import { PLATFORM } from '../../packages/kernel/src/index';

function outFile(suffix: string) {
  return join(`${project.path}`, 'packages', 'jit', 'test', 'generated', `template-compiler.${suffix}.spec.ts`);
}

function generateAndEmit() {
  const testsRecord = {
    'mutations.basic': [
      $$functionExpr('it', [
        $expression('works'),
        $functionExpr([
          $$const(['au', 'host', 'cs'], $call('setup')),
          $$const('App', $call('CustomElementResource.define', [
            $expression({ name: 'app', template: `<template><foo></foo></template>` }),
            $class([])
          ])),
          $$const('items', $expression([])),
          $$const('Foo', $call('CustomElementResource.define', [
            $expression({ name: 'foo', template: `<template><div repeat.for="item of items">\${item}</div></template>` }),
            $class([
              $property('items', $id('items')),
              $property('el'),
              $property('cycled', false),
              $property('inject', [class Element{}], true),
              $method('constructor', [$$assign('this.el', 'el')], [$param('el')]),
              $method('binding', [
                $$call('this.items.push', [$expression(1)])
              ]),
              $method('bound', [
                $$call('this.items.push', [$expression(2)]),
                $$call([$call('expect', ['this.el.textContent']), 'to.equal'], [$expression('')])
              ]),
              $method('attaching', [
                $$call('this.items.push', [$expression(3)]),
                $$call('cs.flushChanges'),
                $$call([$call('expect', ['this.el.textContent']), 'to.equal'], [$expression('')])
              ]),
              $method('attached', [
                $$call([$call('expect', ['this.el.textContent']), 'to.equal'], [createConditional($access('this.cycled'), $expression('1234567812'), $expression('123'))]),
                $$call('this.items.push', [$expression(4)]),
                $$call('cs.flushChanges'),
                $$call([$call('expect', ['this.el.textContent']), 'to.equal'], [createConditional($access('this.cycled'), $expression('1234567812'), $expression('1234'))])
              ]),
              $method('detaching', [
                $$call([$call('expect', ['this.el.textContent']), 'to.equal'], [createConditional($access('this.cycled'), $expression('1234567812'), $expression('1234'))]),
                $$call('this.items.push', [$expression(5)]),
                $$call('cs.flushChanges'),
                $$call([$call('expect', ['this.el.textContent']), 'to.equal'], [createConditional($access('this.cycled'), $expression('1234567812'), $expression('12345'))])
              ]),
              $method('detached', [
                $$call([$call('expect', ['this.el.textContent']), 'to.equal'], [$expression('')]),
                $$call('this.items.push', [$expression(6)]),
                $$call('cs.flushChanges')
              ]),
              $method('unbinding', [
                $$call('this.items.push', [$expression(7)])
              ]),
              $method('unbound', [
                $$call('this.items.push', [$expression(8)]),
                $$assign('this.cycled', 'true')
              ])
            ])
          ])),
          $$call('au.register', ['Foo']),
          $$new('component', 'App'),
          $$call('au.app', [$expression({ host: 'host', component: 'component' })]),
          $$call('au.start'),
          $$call([$call('expect', ['host.textContent']), 'to.equal'], [$expression('1234')]),
          $$call([$call('expect', ['items.length']), 'to.equal'], [$expression(4)]),
          $$call('au.stop'),
          $$call([$call('expect', ['host.textContent']), 'to.equal'], [$expression('')]),
          $$call([$call('expect', ['items.length']), 'to.equal'], [$expression(8)]),
          $$call('au.start'),
          $$call([$call('expect', ['host.textContent']), 'to.equal'], [$expression('1234567812')]),
          $$call([$call('expect', ['items.length']), 'to.equal'], [$expression(12)]),
          $$call('au.stop'),
          $$call([$call('expect', ['host.textContent']), 'to.equal'], [$expression('')]),
          $$call([$call('expect', ['items.length']), 'to.equal'], [$expression(16)]),
        ])
      ]),
      $$functionExpr('it', [
        $expression('works'),
        $functionExpr([
          $$const(['au', 'host', 'cs'], $call('setup')),
          $$const('App', $call('CustomElementResource.define', [
            $expression({ name: 'app', template: `<template><foo></foo></template>` }),
            $class([])
          ])),
          $$const('items', $expression([])),
          $$const('Foo', $call('CustomElementResource.define', [
            $expression({ name: 'foo', template: `<template><div repeat.for="item of items">\${item}</div></template>` }),
            $class([
              $property('items', $id('items')),
              $property('el'),
              $property('cycled', false),
              $property('inject', [class Element{}], true),
              $method('constructor', [$$assign('this.el', 'el')], [$param('el')]),
              $method('binding', [
                $$call('this.items.push', [$expression(1)])
              ]),
              $method('bound', [
                $$call('this.items.push', [$expression(2)]),
                $$call([$call('expect', ['this.el.textContent']), 'to.equal'], [$expression('')])
              ]),
              $method('attaching', [
                $$call('this.items.push', [$expression(3)]),
                $$call([$call('expect', ['this.el.textContent']), 'to.equal'], [$expression('')])
              ]),
              $method('attached', [
                $$call([$call('expect', ['this.el.textContent']), 'to.equal'], [createConditional($access('this.cycled'), $expression('1234567812'), $expression('312'))]),
                $$call('this.items.push', [$expression(4)]),
                $$call([$call('expect', ['this.el.textContent']), 'to.equal'], [createConditional($access('this.cycled'), $expression('1234567812'), $expression('312'))])
              ]),
              $method('detaching', [
                $$call([$call('expect', ['this.el.textContent']), 'to.equal'], [createConditional($access('this.cycled'), $expression('1234567812'), $expression('312'))]),
                $$call('this.items.push', [$expression(5)]),
                $$call([$call('expect', ['this.el.textContent']), 'to.equal'], [createConditional($access('this.cycled'), $expression('1234567812'), $expression('312'))])
              ]),
              $method('detached', [
                $$call([$call('expect', ['this.el.textContent']), 'to.equal'], [$expression('')]),
                $$call('this.items.push', [$expression(6)])
              ]),
              $method('unbinding', [
                $$call('this.items.push', [$expression(7)])
              ]),
              $method('unbound', [
                $$call('this.items.push', [$expression(8)]),
                $$assign('this.cycled', 'true')
              ])
            ])
          ])),
          $$call('au.register', ['Foo']),
          $$new('component', 'App'),
          $$call('au.app', [$expression({ host: 'host', component: 'component' })]),
          $$call('au.start'),
          $$call([$call('expect', ['host.textContent']), 'to.equal'], [$expression('312')]),
          $$call([$call('expect', ['items']), 'to.deep.equal'], [$expression([1, 2, 3, 4])]),
          $$call('au.stop'),
          $$call([$call('expect', ['host.textContent']), 'to.equal'], [$expression('')]),
          $$call([$call('expect', ['items']), 'to.deep.equal'], [$expression([1, 2, 3, 4, 5, 6, 7, 8])]),
          $$call('au.start'),
          $$call([$call('expect', ['host.textContent']), 'to.equal'], [$expression('1234567812')]),
          $$call([$call('expect', ['items']), 'to.deep.equal'], [$expression([1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4])]),
          $$call('au.stop'),
          $$call([$call('expect', ['host.textContent']), 'to.equal'], [$expression('')]),
          $$call([$call('expect', ['items']), 'to.deep.equal'], [$expression([1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8])]),
        ])
      ])
    ]
  }
  for (const suffix in testsRecord) {
    const tests = testsRecord[suffix];
    const nodes = [
      $$import('chai', 'expect'),
      $$import('../../../kernel/src/index', 'DI'),
      $$import('../../../runtime/src/index', 'CustomElementResource', 'DOM', 'Aurelia', 'BindingMode', 'IChangeSet'),
      $$import('../../src/index', 'BasicConfiguration'),
      null,
      $$functionExpr('describe.only', [
        $expression(`generated.template-compiler.${suffix}`),
        $functionExpr([
          $$functionDecl('setup', [
              $$const('container', $call('DI.createContainer')),
              $$call('container.register', ['BasicConfiguration']),
              $$const('cs', $call('container.get', ['IChangeSet'])),
              $$new('au', 'Aurelia', ['container']),
              $$const('host', $call('DOM.createElement', [$expression('div')])),
              $$return({ au: 'au', host: 'host', cs: 'cs' })
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

