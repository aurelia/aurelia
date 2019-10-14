import { DI, IContainer } from '@aurelia/kernel';
import { bindingBehavior, BindingBehavior } from '@aurelia/runtime';
import { assert } from '@aurelia/testing';

describe(`@bindingBehavior('foo')`, function () {
  let container: IContainer;

  // eslint-disable-next-line mocha/no-hooks
  beforeEach(function () {
    container = DI.createContainer();
  });

  @bindingBehavior('foo')
  class FooBindingBehavior { }

  it(`should define the binding behavior`, function () {
    assert.strictEqual(FooBindingBehavior['kind'], BindingBehavior, `FooBindingBehavior['kind']`);
    assert.strictEqual(FooBindingBehavior['description'].name, 'foo', `FooBindingBehavior['description'].name`);
    FooBindingBehavior['register'](container);
    const instance = container.get(BindingBehavior.keyFrom('foo'));
    assert.instanceOf(instance, FooBindingBehavior, `instance`);
  });

});
