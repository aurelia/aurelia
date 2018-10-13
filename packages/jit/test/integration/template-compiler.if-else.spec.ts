import { expect } from 'chai';
import { tearDown, setupAndStart, cleanup } from './prepare';

// TemplateCompiler - if/else integration
describe('template-compiler.if-else', () => {
  beforeEach(cleanup);
  afterEach(cleanup);

  //if - shows and hides
  it('01.', () => {
    const { au, host, cs, component } = setupAndStart(`<template><div if.bind="foo">bar</div></template>`, null);
    component.foo = true;
    cs.flushChanges();
    expect(host.textContent).to.equal('bar');
    component.foo = false;
    cs.flushChanges();
    expect(host.textContent).to.equal('');
    tearDown(au, cs, host);
  });

  //if - shows and hides - toggles else
  it('02.', () => {
    const { au, host, cs, component } = setupAndStart(`<template><div if.bind="foo">bar</div><div else>baz</div></template>`, null);
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
