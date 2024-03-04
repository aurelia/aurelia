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
    container.register(FooBindingBehavior);
    const instance = container.get(BindingBehavior.keyFrom('foo'));
    assert.instanceOf(instance, FooBindingBehavior, `instance`);
  });

  it('resolves to the same instance when impl was retrieved before registration', function () {
    const i1 = container.get(FooBindingBehavior);
    container.register(FooBindingBehavior);
    const i2 = container.get(BindingBehavior.keyFrom('foo'));
    const i3 = BindingBehavior.get(container, 'foo');
    assert.strictEqual(i1, i2);
    assert.strictEqual(i1, i3);
    const [_, i4] = container.getAll(FooBindingBehavior);
    assert.strictEqual(i4, undefined);
  });

  it('resolves to the same instance when impl was retrieved after registration', function () {
    container.register(FooBindingBehavior);
    const i1 = container.get(FooBindingBehavior);
    const i2 = container.get(BindingBehavior.keyFrom('foo'));
    const i3 = BindingBehavior.get(container, 'foo');
    assert.strictEqual(i1, i2);
    assert.strictEqual(i1, i3);
    const [_, i4] = container.getAll(FooBindingBehavior);
    assert.strictEqual(i4, undefined);
  });

  it('does not retrieve the intermediate container value converter registration', function () {
    const child1 = container.createChild();
    const child2 = child1.createChild();
    let id = 0;

    @bindingBehavior('foo1')
    class Foo1 {
      id = ++id;
    }

    child1.register(Foo1);
    container.register(Foo1);

    BindingBehavior.get(child2, 'foo1');
    assert.strictEqual(id, 1, `should create binding behavior only once`);

    BindingBehavior.get(child1, 'foo1');
    assert.strictEqual(id, 2, `should create another binding behavior in the middle layer container`);
  });
});
