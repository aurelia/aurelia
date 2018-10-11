import { setupAndStart, tearDown } from './prepare';
import { expect } from 'chai';

describe('TemplateCompiler - Binding Resources integration', () => {
  it(`debounceBindingBehavior - input.value`, done => {
    const { au, host, cs, component } = setupAndStart(`<template><input value.to-view="message & debounce:50"></template>`);
    expect(host.firstChild['value']).to.equal('');
    component.message = 'hello!';
    setTimeout(() => {
      expect(host.firstChild['value']).to.equal('');
      component.message = 'hello!!';
    }, 25);
    setTimeout(() => {
      expect(host.firstChild['value']).to.equal('');
      component.message = 'hello!!!';
    }, 50);
    setTimeout(() => {
      expect(host.firstChild['value']).to.equal('');
    }, 75);
    setTimeout(() => {
      expect(host.firstChild['value']).to.equal('hello!!!');
      tearDown(au, cs, host);
      done();
    }, 175);
  });

  // TODO: fix throttle
  // it(`throttleBindingBehavior - input.value`, done => {
  //   const { au, host, cs, component } = setup(`<template><input value.to-view="message & throttle:50"></template>`);
  //   au.app({ host, component }).start();
  //   expect(host.firstChild['value']).to.equal('');
  //   component.message = 'hello!';
  //   cs.flushChanges();
  //   expect(host.firstChild['value']).to.equal('hello!');
  //   component.message = 'hello!!';
  //   cs.flushChanges();
  //   expect(host.firstChild['value']).to.equal('hello!');
  //   component.message = 'hello!!!';
  //   cs.flushChanges();
  //   expect(host.firstChild['value']).to.equal('hello!');
  //   setTimeout(() => {
  //     component.message = 'hello!!!!';
  //     cs.flushChanges();
  //     expect(host.firstChild['value']).to.equal('hello!!!!');
  //     done();
  //   }, 75);
  // });
});
