import { expect } from 'chai';
import { tearDown, setupAndStart } from './prepare';

describe('TemplateCompiler - if/else integration', () => {
  it(`if - shows and hides`, () => {
    const { au, host, cs, component } = setupAndStart(`<template><div if.bind="foo">bar</div></template>`);
    component.foo = true;
    cs.flushChanges();
    expect(host.textContent).to.equal('bar');
    component.foo = false;
    cs.flushChanges();
    expect(host.textContent).to.equal('');
    tearDown(au, cs, host);
  });

  it(`if - shows and hides - toggles else`, () => {
    const { au, host, cs, component } = setupAndStart(`<template><div if.bind="foo">bar</div><div else>baz</div></template>`);
    component.foo = true;
    cs.flushChanges();
    expect(host.innerText).to.equal('bar');
    component.foo = false;
    cs.flushChanges();
    expect(host.innerText).to.equal('baz');
    component.foo = true;
    cs.flushChanges();
    expect(host.innerText).to.equal('bar');
    tearDown(au, cs, host);
  });
});
