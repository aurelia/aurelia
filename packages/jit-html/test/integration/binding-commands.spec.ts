import { LifecycleFlags } from '@aurelia/runtime';
import { IEventManager } from '@aurelia/runtime-html';
import { expect } from 'chai';
import { spy } from 'sinon';
import { HTMLTestContext, TestContext } from '../util';
import { TestConfiguration } from './resources';
import { setupAndStart, setupWithDocumentAndStart, tearDown } from './util';

// TemplateCompiler - Binding Commands integration
describe('binding-commands', () => {
  let ctx: HTMLTestContext;

  beforeEach(() => {
    ctx = TestContext.createHTMLTestContext();
  });

  // textBinding - interpolation
  it('01.', () => {
    const { au, lifecycle, host, component } = setupAndStart(ctx, `<template>\${message}</template>`, null);
    component.message = 'hello!';
    lifecycle.processFlushQueue(LifecycleFlags.none);
    expect(host.textContent).to.equal('hello!');
    tearDown(au, lifecycle, host);
  });

  // textBinding - interpolation with template
  it('02.', () => {
    const { au, lifecycle, host, component } = setupAndStart(ctx, `<template>\${\`\${message}\`}</template>`, null);
    component.message = 'hello!';
    lifecycle.processFlushQueue(LifecycleFlags.none);
    expect(host.textContent).to.equal('hello!');
    tearDown(au, lifecycle, host);
  });

  // styleBinding - bind
  it('03.', () => {
    const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><div style.bind="foo"></div></template>`, null);
    component.foo = 'color: green;';
    lifecycle.processFlushQueue(LifecycleFlags.none);
    expect((host.firstElementChild as HTMLElement).style.cssText).to.equal('color: green;');
    tearDown(au, lifecycle, host);
  });

  // styleBinding - interpolation
  it('04.', () => {
    const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><div style="\${foo}"></div></template>`, null);
    component.foo = 'color: green;';
    lifecycle.processFlushQueue(LifecycleFlags.none);
    expect((host.firstElementChild as HTMLElement).style.cssText).to.equal('color: green;');
    tearDown(au, lifecycle, host);
  });

  // classBinding - bind
  it('05.', () => {
    const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><div class.bind="foo"></div></template>`, null);
    component.foo = 'foo bar';
    lifecycle.processFlushQueue(LifecycleFlags.none);
    expect((host.firstElementChild as HTMLElement).classList.toString()).to.equal('au foo bar');
    tearDown(au, lifecycle, host);
  });

  // classBinding - interpolation
  it('06.', () => {
    const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><div class="\${foo}"></div></template>`, null);
    component.foo = 'foo bar';
    lifecycle.processFlushQueue(LifecycleFlags.none);
    expect((host.firstElementChild as HTMLElement).classList.toString()).to.equal('\${foo} au foo bar'); // TODO: fix this
    tearDown(au, lifecycle, host);
  });

  // oneTimeBinding - input.value
  it('07.', () => {
    const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><input value.one-time="message"></template>`, null);
    component.message = 'hello!';
    lifecycle.processFlushQueue(LifecycleFlags.none);
    expect(host.firstChild['value']).to.equal('');
    tearDown(au, lifecycle, host);
  });

  // toViewBinding - input.value
  it('08.', () => {
    const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><input value.to-view="message"></template>`, null);
    component.message = 'hello!';
    lifecycle.processFlushQueue(LifecycleFlags.none);
    expect(host.firstChild['value']).to.equal('hello!');
    tearDown(au, lifecycle, host);
  });

  // fromViewBinding - input.value
  it('09.', () => {
    const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><input value.from-view="message"></template>`, null);
    component.message = 'hello!';
    lifecycle.processFlushQueue(LifecycleFlags.none);
    expect(host.firstChild['value']).to.equal('');
    host.firstChild['value'] = 'hello!';
    host.firstChild.dispatchEvent(new ctx.CustomEvent('change'));
    expect(component.message).to.equal('hello!');
    tearDown(au, lifecycle, host);
  });

  // twoWayBinding - input.value
  it('10.', () => {
    const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><input value.two-way="message"></template>`, null);
    host.firstChild['value'] = 'hello!';
    expect(component.message).to.equal(undefined);
    host.firstChild.dispatchEvent(new ctx.CustomEvent('change'));
    expect(component.message).to.equal('hello!');
    tearDown(au, lifecycle, host);
  });

  // twoWayBinding - input.value - jsonValueConverter
  it('11.', () => {
    ctx.container.register(TestConfiguration);
    const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><input value.two-way="message | json"></template>`, null);
    expect(component.message).to.equal(undefined);
    host.firstChild['value'] = '{"foo":"bar"}';
    expect(component.message).to.equal(undefined);
    host.firstChild.dispatchEvent(new ctx.CustomEvent('change'));
    expect(component.message).to.deep.equal({ foo: 'bar' });
    component.message = { bar: 'baz' };
    expect(host.firstChild['value']).to.equal('{"foo":"bar"}');
    lifecycle.processFlushQueue(LifecycleFlags.none);
    expect(host.firstChild['value']).to.equal('{"bar":"baz"}');
    tearDown(au, lifecycle, host);
  });

  // oneTimeBindingBehavior - input.value
  it('12.', () => {
    const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><input value.to-view="message & oneTime"></template>`, null);
    component.message = 'hello!';
    lifecycle.processFlushQueue(LifecycleFlags.none);
    expect(host.firstChild['value']).to.equal('');
    tearDown(au, lifecycle, host);
  });

  // toViewBindingBehavior - input.value
  it('13.', () => {
    const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><input value.one-time="message & toView"></template>`, null);
    component.message = 'hello!';
    lifecycle.processFlushQueue(LifecycleFlags.none);
    expect(host.firstChild['value']).to.equal('hello!');
    tearDown(au, lifecycle, host);
  });

  // fromViewBindingBehavior - input.value
  it('14.', () => {
    const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><input value.one-time="message & fromView"></template>`, null);
    component.message = 'hello!';
    lifecycle.processFlushQueue(LifecycleFlags.none);
    expect(host.firstChild['value']).to.equal('');
    host.firstChild['value'] = 'hello!';
    host.firstChild.dispatchEvent(new ctx.CustomEvent('change'));
    expect(component.message).to.equal('hello!');
    tearDown(au, lifecycle, host);
  });

  // twoWayBindingBehavior - input.value
  it('15.', () => {
    const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><input value.one-time="message & twoWay"></template>`, null);
    expect(component.message).to.equal(undefined);
    host.firstChild['value'] = 'hello!';
    expect(component.message).to.equal(undefined);
    host.firstChild.dispatchEvent(new ctx.CustomEvent('change'));
    expect(component.message).to.equal('hello!');
    tearDown(au, lifecycle, host);
  });

  // toViewBinding - input checkbox
  it('16.', () => {
    const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><input checked.to-view="checked" type="checkbox"></template>`, null);
    expect(host.firstChild['checked']).to.equal(false);
    component.checked = true;
    expect(host.firstChild['checked']).to.equal(false);
    lifecycle.processFlushQueue(LifecycleFlags.none);
    expect(host.firstChild['checked']).to.equal(true);
    tearDown(au, lifecycle, host);
  });

  // twoWayBinding - input checkbox
  it('17.', () => {
    const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><input checked.two-way="checked" type="checkbox"></template>`, null);
    expect(component.checked).to.equal(undefined);
    host.firstChild['checked'] = true;
    expect(component.checked).to.equal(undefined);
    host.firstChild.dispatchEvent(new ctx.CustomEvent('change'));
    expect(component.checked).to.equal(true);
    tearDown(au, lifecycle, host);
  });

  // trigger - button
  it('18.', () => {
    const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><button click.trigger="doStuff()"></button></template>`, null);
    component.doStuff = spy();
    host.firstChild.dispatchEvent(new ctx.CustomEvent('click'));
    expect(component.doStuff).to.have.been.called;
    tearDown(au, lifecycle, host);
  });

  // delegate - button
  it('19.', () => {
    const { au, lifecycle, host, component } = setupWithDocumentAndStart(ctx, `<template><button click.delegate="doStuff()"></button></template>`, null);
    try {
      component.doStuff = spy();
      host.firstChild.dispatchEvent(new ctx.CustomEvent('click', { bubbles: true }));
      expect(component.doStuff).to.have.been.called;
    } finally {
      const em = ctx.container.get(IEventManager);
      em.dispose();
      tearDown(au, lifecycle, host);
    }
  });

  // capture - button
  it('20.', () => {
    const { au, lifecycle, host, component } = setupWithDocumentAndStart(ctx, `<template><button click.capture="doStuff()"></button></template>`, null);
    try {
      component.doStuff = spy();
      host.firstChild.dispatchEvent(new ctx.CustomEvent('click', { bubbles: true }));
      expect(component.doStuff).to.have.been.called;
    } finally {
      const em = ctx.container.get(IEventManager);
      em.dispose();
      tearDown(au, lifecycle, host);
    }
  });
});
