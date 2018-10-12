import { expect } from "chai";
import { tearDown, setupAndStart, cleanup } from "./prepare";
import { spy } from "sinon";

// TemplateCompiler - Binding Commands integration
describe.only('template-compiler.binding-commands', () => {
  beforeEach(cleanup);
  afterEach(cleanup);

  // textBinding - interpolation
  it('01.', () => {
    const { au, host, cs, component } = setupAndStart(`<template>\${message}</template>`, null);
    component.message = 'hello!';
    cs.flushChanges();
    expect(host.innerText).to.equal('hello!');
    tearDown(au, cs, host);
  });

  // textBinding - interpolation with template
  it('02.', () => {
    const { au, host, cs, component } = setupAndStart(`<template>\${\`\${message}\`}</template>`, null);
    component.message = 'hello!';
    cs.flushChanges();
    expect(host.innerText).to.equal('hello!');
    tearDown(au, cs, host);
  });

  // styleBinding - bind
  it('03.', () => {
    const { au, host, cs, component } = setupAndStart(`<template><div style.bind="foo"></div></template>`, null);
    component.foo = 'color: green;';
    cs.flushChanges();
    expect((<HTMLElement>host.firstElementChild).style.cssText).to.equal('color: green;');
    tearDown(au, cs, host);
  });

  // styleBinding - interpolation
  it('04.', () => {
    const { au, host, cs, component } = setupAndStart(`<template><div style="\${foo}"></div></template>`, null);
    component.foo = 'color: green;';
    cs.flushChanges();
    expect((<HTMLElement>host.firstElementChild).style.cssText).to.equal('color: green;');
    tearDown(au, cs, host);
  });

  // classBinding - bind
  it('05.', () => {
    const { au, host, cs, component } = setupAndStart(`<template><div class.bind="foo"></div></template>`, null);
    component.foo = 'foo bar';
    cs.flushChanges();
    expect((<HTMLElement>host.firstElementChild).classList.toString()).to.equal('au foo bar');
    tearDown(au, cs, host);
  });

  // classBinding - interpolation
  it('06.', () => {
    const { au, host, cs, component } = setupAndStart(`<template><div class="\${foo}"></div></template>`, null);
    component.foo = 'foo bar';
    cs.flushChanges();
    expect((<HTMLElement>host.firstElementChild).classList.toString()).to.equal('\${foo} au foo bar'); // TODO: fix this
    tearDown(au, cs, host);
  });

  // oneTimeBinding - input.value
  it('07.', () => {
    const { au, host, cs, component } = setupAndStart(`<template><input value.one-time="message"></template>`, null);
    component.message = 'hello!';
    cs.flushChanges();
    expect(host.firstChild['value']).to.equal('');
    tearDown(au, cs, host);
  });

  // toViewBinding - input.value
  it('08.', () => {
    const { au, host, cs, component } = setupAndStart(`<template><input value.to-view="message"></template>`, null);
    component.message = 'hello!';
    cs.flushChanges();
    expect(host.firstChild['value']).to.equal('hello!');
    tearDown(au, cs, host);
  });

  // fromViewBinding - input.value
  it('09.', () => {
    const { au, host, cs, component } = setupAndStart(`<template><input value.from-view="message"></template>`, null);
    component.message = 'hello!';
    cs.flushChanges();
    expect(host.firstChild['value']).to.equal('');
    host.firstChild['value'] = 'hello!';
    host.firstChild.dispatchEvent(new CustomEvent('change'));
    expect(component.message).to.equal('hello!');
    tearDown(au, cs, host);
  });

  // twoWayBinding - input.value
  it('10.', () => {
    const { au, host, cs, component } = setupAndStart(`<template><input value.two-way="message"></template>`, null);
    host.firstChild['value'] = 'hello!';
    expect(component.message).to.be.undefined;
    host.firstChild.dispatchEvent(new CustomEvent('change'));
    expect(component.message).to.equal('hello!');
    tearDown(au, cs, host);
  });

  // twoWayBinding - input.value - jsonValueConverter
  it('11.', () => {
    const { au, host, cs, component } = setupAndStart(`<template><input value.two-way="message | json"></template>`, null);
    expect(component.message).to.be.undefined;
    host.firstChild['value'] = '{"foo":"bar"}';
    expect(component.message).to.be.undefined;
    host.firstChild.dispatchEvent(new CustomEvent('change'));
    expect(component.message).to.deep.equal({ foo: 'bar' });
    component.message = { bar: 'baz' };
    expect(host.firstChild['value']).to.equal('{"foo":"bar"}');
    cs.flushChanges();
    expect(host.firstChild['value']).to.equal('{"bar":"baz"}');
    tearDown(au, cs, host);
  });

  // oneTimeBindingBehavior - input.value
  it('12.', () => {
    const { au, host, cs, component } = setupAndStart(`<template><input value.to-view="message & oneTime"></template>`, null);
    component.message = 'hello!';
    cs.flushChanges();
    expect(host.firstChild['value']).to.equal('');
    tearDown(au, cs, host);
  });

  // toViewBindingBehavior - input.value
  it('13.', () => {
    const { au, host, cs, component } = setupAndStart(`<template><input value.one-time="message & toView"></template>`, null);
    component.message = 'hello!';
    cs.flushChanges();
    expect(host.firstChild['value']).to.equal('hello!');
    tearDown(au, cs, host);
  });


  // fromViewBindingBehavior - input.value
  it('14.', () => {
    const { au, host, cs, component } = setupAndStart(`<template><input value.one-time="message & fromView"></template>`, null);
    component.message = 'hello!';
    cs.flushChanges();
    expect(host.firstChild['value']).to.equal('');
    host.firstChild['value'] = 'hello!';
    host.firstChild.dispatchEvent(new CustomEvent('change'));
    expect(component.message).to.equal('hello!');
    tearDown(au, cs, host);
  });

  // twoWayBindingBehavior - input.value
  it('15.', () => {
    const { au, host, cs, component } = setupAndStart(`<template><input value.one-time="message & twoWay"></template>`, null);
    expect(component.message).to.be.undefined;
    host.firstChild['value'] = 'hello!';
    expect(component.message).to.be.undefined;
    host.firstChild.dispatchEvent(new CustomEvent('change'));
    expect(component.message).to.equal('hello!');
    tearDown(au, cs, host);
  });

  // toViewBinding - input checkbox
  it('16.', () => {
    const { au, host, cs, component } = setupAndStart(`<template><input checked.to-view="checked" type="checkbox"></template>`, null);
    expect(host.firstChild['checked']).to.be.false;
    component.checked = true;
    expect(host.firstChild['checked']).to.be.false;
    cs.flushChanges();
    expect(host.firstChild['checked']).to.be.true;
    tearDown(au, cs, host);
  });

  // twoWayBinding - input checkbox
  it('17.', () => {
    const { au, host, cs, component } = setupAndStart(`<template><input checked.two-way="checked" type="checkbox"></template>`, null);
    expect(component.checked).to.be.undefined;
    host.firstChild['checked'] = true;
    expect(component.checked).to.be.undefined;
    host.firstChild.dispatchEvent(new CustomEvent('change'));
    expect(component.checked).to.be.true;
    tearDown(au, cs, host);
  });

  // trigger - button
  it('18.', () => {
    const { au, host, cs, component } = setupAndStart(`<template><button click.trigger="doStuff()"></button></template>`, null);
    component.doStuff = spy();
    host.firstChild.dispatchEvent(new CustomEvent('click'));
    expect(component.doStuff).to.have.been.called;
    tearDown(au, cs, host);
  });

  // delegate - button
  it('19.', () => {
    const { au, host, cs, component } = setupAndStart(`<template><button click.delegate="doStuff()"></button></template>`, null);
    component.doStuff = spy();
    host.firstChild.dispatchEvent(new CustomEvent('click', { bubbles: true }));
    expect(component.doStuff).to.have.been.called;
    tearDown(au, cs, host);
  });

  // capture - button
  it('20.', () => {
    const { au, host, cs, component } = setupAndStart(`<template><button click.capture="doStuff()"></button></template>`, null);
    component.doStuff = spy()
    host.firstChild.dispatchEvent(new CustomEvent('click', { bubbles: true }));
    expect(component.doStuff).to.have.been.called;
    tearDown(au, cs, host);
  });
});
