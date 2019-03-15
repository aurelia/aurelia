import { DI, IContainer } from '@aurelia/kernel';
import { expect } from 'chai';
import { bindingBehavior, BindingBehaviorResource } from '@aurelia/runtime';

describe(`@bindingBehavior('foo')`, function () {
  let container: IContainer;

  beforeEach(function () {
    container = DI.createContainer();
  });

  // @ts-ignore
  @bindingBehavior('foo')
  class FooBindingBehavior { }

  it(`should define the binding behavior`, function () {
    expect(FooBindingBehavior['kind']).to.equal(BindingBehaviorResource);
    expect(FooBindingBehavior['description'].name).to.equal('foo');
    FooBindingBehavior['register'](container);
    const instance = container.get(BindingBehaviorResource.keyFrom('foo'));
    expect(instance).to.be.instanceof(FooBindingBehavior);
  });

});
