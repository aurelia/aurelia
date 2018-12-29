import { expect } from 'chai';
import {
  cleanup,
  setupAndStart,
  tearDown
} from './util';

// TemplateCompiler - Binding Resources integration
describe('template-compiler.binding-resources', () => {
  beforeEach(cleanup);
  afterEach(cleanup);

  // debounceBindingBehavior - input.value
  it('01.', done => {
    const { au, lifecycle, host, component } = setupAndStart(`<template><input value.to-view="message & debounce:50"></template>`, null);
    expect(host.firstChild['value']).to.equal('');
    component.message = 'hello!';
    setTimeout(() => {
      expect(host.firstChild['value']).to.equal('');
      component.message = 'hello!!';
    },         25);
    setTimeout(() => {
      expect(host.firstChild['value']).to.equal('');
      component.message = 'hello!!!';
    },         50);
    setTimeout(() => {
      expect(host.firstChild['value']).to.equal('');
    },         75);
    setTimeout(() => {
      expect(host.firstChild['value']).to.equal('hello!!!');
      tearDown(au, lifecycle, host);
      done();
    },         175);
  });

  // TODO: fix throttle
  // it(`throttleBindingBehavior - input.value`, done => {
  //   const { au, lifecycle, host, component } = setup(`<template><input value.to-view="message & throttle:50"></template>`);
  //   au.app({ host, component }).start();
  //   expect(host.firstChild['value']).to.equal('');
  //   component.message = 'hello!';
  //   lifecycle.flush(LifecycleFlags.none);
  //   expect(host.firstChild['value']).to.equal('hello!');
  //   component.message = 'hello!!';
  //   lifecycle.flush(LifecycleFlags.none);
  //   expect(host.firstChild['value']).to.equal('hello!');
  //   component.message = 'hello!!!';
  //   lifecycle.flush(LifecycleFlags.none);
  //   expect(host.firstChild['value']).to.equal('hello!');
  //   setTimeout(() => {
  //     component.message = 'hello!!!!';
  //     lifecycle.flush(LifecycleFlags.none);
  //     expect(host.firstChild['value']).to.equal('hello!!!!');
  //     done();
  //   }, 75);
  // });
});
