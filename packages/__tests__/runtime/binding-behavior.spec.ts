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
    const definition = BindingBehavior.getDefinition(FooBindingBehavior);
    assert.strictEqual(definition.name, 'foo', `definition.name`);
    definition.register(container);
    const instance = container.get(BindingBehavior.keyFrom('foo'));
    assert.instanceOf(instance, FooBindingBehavior, `instance`);
  });

});
