import { expect } from 'chai';
import { CustomElementResource, LifecycleFlags } from '@aurelia/runtime';
import { AuDOMTest as AU } from '@aurelia/testing';

describe('AuDOM', function () {
  it('works', function () {
    const { au, host, lifecycle } = AU.setup();

    const definition = AU.createTemplateControllerDefinition(
      AU.createRepeatInstruction('i of items', AU.createTextDefinition('i'))
    );

    class App {
      public items = ['1', '2', '3'];
    }
    CustomElementResource.define(definition, App);
    const component = new App();

    au.app({ host, component });
    au.start();

    expect(host.textContent).to.equal('123');

    component.items.splice(1, 1, '5', '6', '7');

    lifecycle.processFlushQueue(LifecycleFlags.none);

    expect(host.textContent).to.equal('15673');

    component.items.pop();

    lifecycle.processFlushQueue(LifecycleFlags.none);

    expect(host.textContent).to.equal('1567');

  });
});
