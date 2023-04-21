import { DI, IContainer } from '@aurelia/kernel';
import { bindingBehavior, BindingBehavior } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';

describe(`2-runtime/binding-behavior.spec.ts`, function () {
  let container: IContainer;

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
