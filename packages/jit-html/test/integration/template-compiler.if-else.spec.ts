import {
  Constructable,
  IContainer
} from '@aurelia/kernel';
import {
  Aurelia,
  ICustomElementType,
  ILifecycle,
  LifecycleFlags,
  CustomElementResource
} from '@aurelia/runtime';
import { expect } from 'chai';
import { HTMLTestContext, TestContext } from '../util';
import { baseSuite } from './template-compiler.base';
import {
  setupAndStart,
  tearDown
} from './util';

const spec = 'template-compiler.if-else';

// TemplateCompiler - if/else integration
describe(spec, () => {
  let ctx: HTMLTestContext;

  beforeEach(() => {
    ctx = TestContext.createHTMLTestContext();
  });

  //if - shows and hides
  it('01.', () => {
    const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><div if.bind="foo">bar</div></template>`, null);
    component.foo = true;
    lifecycle.processFlushQueue(LifecycleFlags.none);
    expect(host.textContent).to.equal('bar');
    component.foo = false;
    lifecycle.processFlushQueue(LifecycleFlags.none);
    expect(host.textContent).to.equal('');
    tearDown(au, lifecycle, host);
  });

  //if - shows and hides - toggles else
  it('02.', () => {
    const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><div if.bind="foo">bar</div><div else>baz</div></template>`, null);
    component.foo = true;
    lifecycle.processFlushQueue(LifecycleFlags.none);
    expect(host.textContent).to.equal('bar');
    component.foo = false;
    lifecycle.processFlushQueue(LifecycleFlags.none);
    expect(host.textContent).to.equal('baz');
    component.foo = true;
    lifecycle.processFlushQueue(LifecycleFlags.none);
    expect(host.textContent).to.equal('bar');
    tearDown(au, lifecycle, host);
  });

});

type TApp = Constructable<{ ifText: string; elseText: string; show: boolean }> & ICustomElementType;
const suite = baseSuite.clone<IContainer, Aurelia, ILifecycle, HTMLElement, TApp, InstanceType<TApp>>(spec);

suite.addDataSlot('e').addData('app').setFactory(ctx => {
  const { a: container } = ctx;
  const $ctx = container.get<HTMLTestContext>(HTMLTestContext);
  const template = $ctx.createElement('template') as HTMLTemplateElement;

  const ifTemplate = $ctx.createElement('template') as HTMLTemplateElement;
  const elseTemplate = $ctx.createElement('template') as HTMLTemplateElement;
  template.content.appendChild(ifTemplate);
  template.content.appendChild(elseTemplate);
  const ifText = $ctx.doc.createTextNode('${ifText}');
  const elseText = $ctx.doc.createTextNode('${elseText}');
  ifTemplate.content.appendChild(ifText);
  elseTemplate.content.appendChild(elseText);
  ifTemplate.setAttribute('if.bind', 'show');
  elseTemplate.setAttribute('else', '');

  const $App = CustomElementResource.define({ name: 'app', template }, class App {
    public ifText: string;
    public elseText: string;
    public show: boolean;
  });
  container.register($App);
  return $App;
});

suite.addActionSlot('setup').addAction(null, ctx => {
  const { a: container, b: au, c: lifecycle, d: host, e: app } = ctx;

  const component = ctx.f = new app();
  component.ifText = '1';
  component.elseText = '2';
  component.show = true;

  au.app({ component, host }).start();
});

suite.addActionSlot('act')
.addAction('1', ctx => {
  const { c: lifecycle, d: host, f: component } = ctx;

  expect(host.textContent).to.equal('1');

  component['show'] = false;

  expect(host.textContent).to.equal('1');

  lifecycle.processFlushQueue(LifecycleFlags.none);

  expect(host.textContent).to.equal('2');
});

suite.load();
suite.run();
