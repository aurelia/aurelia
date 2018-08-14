import { bindingBehavior, BindingBehaviorResource } from "@aurelia/runtime";
import { IContainer, DI } from "@aurelia/kernel";
import { expect } from 'chai';

describe(`@bindingBehavior('foo')`, () => {
  let container: IContainer;

  beforeEach(() => {
    container = DI.createContainer();
  });

  @bindingBehavior('foo')
  class FooBindingBehavior { }

  it(`should define the binding behavior`, () => {
    expect(FooBindingBehavior['kind']).to.equal(BindingBehaviorResource);
    expect(FooBindingBehavior['description'].name).to.equal('foo');
    FooBindingBehavior['register'](container);
    const instance = container.get(BindingBehaviorResource.key('foo'));
    expect(instance).to.be.instanceof(FooBindingBehavior);
  });

});
