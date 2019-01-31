import {
  LifecycleFlags
} from '@aurelia/runtime';
import { expect } from 'chai';
import { HTMLTestContext, TestContext } from '../util';
import {
  setupAndStart,
  tearDown
} from './util';

const spec = 'if-else';

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
