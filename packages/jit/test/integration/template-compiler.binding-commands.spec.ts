import { expect } from "chai";
import { tearDown, setupAndStart } from "./prepare";
import { spy } from "sinon";

describe('TemplateCompiler - Binding Commands integration', () => {
  it(`textBinding - interpolation`, () => {
    const { au, host, cs, component } = setupAndStart(`<template>\${message}</template>`);
    component.message = 'hello!';
    cs.flushChanges();
    expect(host.innerText).to.equal('hello!');
    tearDown(au, cs, host);
  });

  it(`textBinding - interpolation with template`, () => {
    const { au, host, cs, component } = setupAndStart(`<template>\${\`\${message}\`}</template>`);
    component.message = 'hello!';
    cs.flushChanges();
    expect(host.innerText).to.equal('hello!');
    tearDown(au, cs, host);
  });

  it(`styleBinding - bind`, () => {
    const { au, host, cs, component } = setupAndStart(`<template><div style.bind="foo"></div></template>`);
    component.foo = 'color: green;';
    cs.flushChanges();
    expect((<HTMLElement>host.firstElementChild).style.cssText).to.equal('color: green;');
    tearDown(au, cs, host);
  });

  it(`styleBinding - interpolation`, () => {
    const { au, host, cs, component } = setupAndStart(`<template><div style="\${foo}"></div></template>`);
    component.foo = 'color: green;';
    cs.flushChanges();
    expect((<HTMLElement>host.firstElementChild).style.cssText).to.equal('color: green;');
    tearDown(au, cs, host);
  });

  it(`classBinding - bind`, () => {
    const { au, host, cs, component } = setupAndStart(`<template><div class.bind="foo"></div></template>`);
    component.foo = 'foo bar';
    cs.flushChanges();
    expect((<HTMLElement>host.firstElementChild).classList.toString()).to.equal('au foo bar');
    tearDown(au, cs, host);
  });

  it(`classBinding - interpolation`, () => {
    const { au, host, cs, component } = setupAndStart(`<template><div class="\${foo}"></div></template>`);
    component.foo = 'foo bar';
    cs.flushChanges();
    expect((<HTMLElement>host.firstElementChild).classList.toString()).to.equal('\${foo} au foo bar'); // TODO: fix this
    tearDown(au, cs, host);
  });

  it(`oneTimeBinding - input.value`, () => {
    const { au, host, cs, component } = setupAndStart(`<template><input value.one-time="message"></template>`);
    component.message = 'hello!';
    cs.flushChanges();
    expect(host.firstChild['value']).to.equal('');
    tearDown(au, cs, host);
  });

  it(`toViewBinding - input.value`, () => {
    const { au, host, cs, component } = setupAndStart(`<template><input value.to-view="message"></template>`);
    component.message = 'hello!';
    cs.flushChanges();
    expect(host.firstChild['value']).to.equal('hello!');
    tearDown(au, cs, host);
  });

  it(`fromViewBinding - input.value`, () => {
    const { au, host, cs, component } = setupAndStart(`<template><input value.from-view="message"></template>`);
    component.message = 'hello!';
    cs.flushChanges();
    expect(host.firstChild['value']).to.equal('');
    host.firstChild['value'] = 'hello!';
    host.firstChild.dispatchEvent(new CustomEvent('change'));
    expect(component.message).to.equal('hello!');
    tearDown(au, cs, host);
  });

  it(`twoWayBinding - input.value`, () => {
    const { au, host, cs, component } = setupAndStart(`<template><input value.two-way="message"></template>`);
    host.firstChild['value'] = 'hello!';
    expect(component.message).to.be.undefined;
    host.firstChild.dispatchEvent(new CustomEvent('change'));
    expect(component.message).to.equal('hello!');
    tearDown(au, cs, host);
  });

  it(`twoWayBinding - input.value - jsonValueConverter`, () => {
    const { au, host, cs, component } = setupAndStart(`<template><input value.two-way="message | json"></template>`);
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

  it(`oneTimeBindingBehavior - input.value`, () => {
    const { au, host, cs, component } = setupAndStart(`<template><input value.to-view="message & oneTime"></template>`);
    component.message = 'hello!';
    cs.flushChanges();
    expect(host.firstChild['value']).to.equal('');
    tearDown(au, cs, host);
  });

  it(`toViewBindingBehavior - input.value`, () => {
    const { au, host, cs, component } = setupAndStart(`<template><input value.one-time="message & toView"></template>`);
    component.message = 'hello!';
    cs.flushChanges();
    expect(host.firstChild['value']).to.equal('hello!');
    tearDown(au, cs, host);
  });


  it(`fromViewBindingBehavior - input.value`, () => {
    const { au, host, cs, component } = setupAndStart(`<template><input value.one-time="message & fromView"></template>`);
    component.message = 'hello!';
    cs.flushChanges();
    expect(host.firstChild['value']).to.equal('');
    host.firstChild['value'] = 'hello!';
    host.firstChild.dispatchEvent(new CustomEvent('change'));
    expect(component.message).to.equal('hello!');
    tearDown(au, cs, host);
  });

  it(`twoWayBindingBehavior - input.value`, () => {
    const { au, host, cs, component } = setupAndStart(`<template><input value.one-time="message & twoWay"></template>`);
    expect(component.message).to.be.undefined;
    host.firstChild['value'] = 'hello!';
    expect(component.message).to.be.undefined;
    host.firstChild.dispatchEvent(new CustomEvent('change'));
    expect(component.message).to.equal('hello!');
    tearDown(au, cs, host);
  });

  it(`toViewBinding - input checkbox`, () => {
    const { au, host, cs, component } = setupAndStart(`<template><input checked.to-view="checked" type="checkbox"></template>`);
    expect(host.firstChild['checked']).to.be.false;
    component.checked = true;
    expect(host.firstChild['checked']).to.be.false;
    cs.flushChanges();
    expect(host.firstChild['checked']).to.be.true;
    tearDown(au, cs, host);
  });

  it(`twoWayBinding - input checkbox`, () => {
    const { au, host, cs, component } = setupAndStart(`<template><input checked.two-way="checked" type="checkbox"></template>`);
    expect(component.checked).to.be.undefined;
    host.firstChild['checked'] = true;
    expect(component.checked).to.be.undefined;
    host.firstChild.dispatchEvent(new CustomEvent('change'));
    expect(component.checked).to.be.true;
    tearDown(au, cs, host);
  });

  it(`trigger - button`, () => {
    const { au, host, cs, component } = setupAndStart(`<template><button click.trigger="doStuff()"></button></template>`);
    component.doStuff = spy();
    host.firstChild.dispatchEvent(new CustomEvent('click'));
    expect(component.doStuff).to.have.been.called;
    tearDown(au, cs, host);
  });

  it(`delegate - button`, () => {
    const { au, host, cs, component } = setupAndStart(`<template><button click.delegate="doStuff()"></button></template>`);
    component.doStuff = spy();
    host.firstChild.dispatchEvent(new CustomEvent('click', { bubbles: true }));
    expect(component.doStuff).to.have.been.called;
    tearDown(au, cs, host);
  });

  it(`capture - button`, () => {
    const { au, host, cs, component } = setupAndStart(`<template><button click.capture="doStuff()"></button></template>`);
    component.doStuff = spy()
    host.firstChild.dispatchEvent(new CustomEvent('click', { bubbles: true }));
    expect(component.doStuff).to.have.been.called;
    tearDown(au, cs, host);
  });
});
