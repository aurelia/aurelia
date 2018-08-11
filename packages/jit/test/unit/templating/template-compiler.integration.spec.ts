import { IContainer, DI, Registration } from '@aurelia/kernel';
import { TemplateCompiler, register } from '@aurelia/jit';
import { Aurelia, Repeat, If, Else, ITemplateCompiler, IChangeSet, CustomElementResource } from '@aurelia/runtime';
import { ExpressionParser } from '../../../../runtime/src/binding/expression-parser';
import { expect } from 'chai';


const globalResources: any[] = [
  If,
  Else,
  Repeat
];

const TestConfiguration = {
  register(container: IContainer) {
    container.register(
      <any>ExpressionParser,
      Registration.singleton(ITemplateCompiler, TemplateCompiler),
      ...globalResources
    );
  }
}

function createCustomElement(markup: string): { [key: string]: any } {
  return new (CustomElementResource.define({ templateOrNode: markup, build: { required: true, compiler: 'default' }, instructions: [] }, class App {}))();
}


describe('TemplateCompiler', () => {
  let au: Aurelia;
  let host: HTMLElement;
  let component: ReturnType<typeof createCustomElement>;
  let cs: IChangeSet

  beforeEach(() => {
    const container = DI.createContainer();
    cs = container.get(IChangeSet);
    register(container);
    host = document.createElement('app');
    au = new Aurelia(container).register(TestConfiguration);
  });

  afterEach(() => {
    au.stop();
  });

  // it(`compiles, renders and updates textBinding`, () => {
  //   component = createCustomElement(`<template>\${message}</template>`);
  //   au.app({ host, component }).start();
  //   expect(host.innerText).to.equal('undefined');
  //   component.message = 'hello!';
  //   expect(host.innerText).to.equal('undefined');
  //   cs.flushChanges();
  //   expect(host.innerText).to.equal('hello!');
  // });

  // it(`compiles, renders and updates toViewBinding`, () => {
  //   component = createCustomElement(`<template><input value.to-view="message"></template>`);
  //   au.app({ host, component }).start();
  //   expect(host.firstChild['value']).to.equal('');
  //   component.message = 'hello!';
  //   expect(host.firstChild['value']).to.equal('');
  //   cs.flushChanges();
  //   expect(host.firstChild['value']).to.equal('hello!');
  // });

  // it(`compiles, renders and updates twoWayBinding`, () => { // nope, not yet..
  //   component = createCustomElement(`<template><input value.two-way="message"></template>`);
  //   au.app({ host, component }).start();
  //   expect(component.message).to.equal('');
  //   host.firstChild['value'] = 'hello!';
  //   expect(component.message).to.equal('');
  //   host.firstChild.dispatchEvent(new CustomEvent('change'));
  //   expect(component.message).to.equal('hello!');
  // });

  // it(`compiles, renders and updates iterator`, () => { // nope, not yet either..
  //   component = createCustomElement(`<template><div repeat.for="item of items">\${item}</div></template>`);
  //   au.app({ host, component }).start();
  //   expect(host.innerText).to.equal('');
  //   component.items = ['1', '2', '3'];
  //   expect(host.innerText).to.equal('');
  //   tq.flushChanges();
  //   expect(host.innerText).to.equal('123');
  // });

});
