import { DI, IContainer } from '@aurelia/kernel';
import { valueConverter, ValueConverter } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';

describe(`2-runtime/value-converter.spec.ts`, function () {
  let container: IContainer;

  beforeEach(function () {
    container = DI.createContainer();
  });

  @valueConverter('foo')
  class FooValueConverter { }

  it(`should define the value converter`, function () {
    const definition = ValueConverter.getDefinition(FooValueConverter);
    assert.strictEqual(definition.name, 'foo', `definition.name`);
    container.register(FooValueConverter);
    const instance = container.get(ValueConverter.keyFrom('foo'));
    assert.instanceOf(instance, FooValueConverter, `instance`);
  });

  it('resolves to the same instance when impl was retrieved before registration', function () {
    const i1 = container.get(FooValueConverter);
    container.register(FooValueConverter);
    const i2 = container.get(ValueConverter.keyFrom('foo'));
    const i3 = ValueConverter.get(container, 'foo');
    assert.strictEqual(i1, i2);
    assert.strictEqual(i1, i3);
    const [_, i4] = container.getAll(FooValueConverter);
    assert.strictEqual(i4, undefined);
  });

  it('resolves to the same instance when impl was retrieved after registration', function () {
    container.register(FooValueConverter);
    const i1 = container.get(FooValueConverter);
    const i2 = container.get(ValueConverter.keyFrom('foo'));
    const i3 = ValueConverter.get(container, 'foo');
    assert.strictEqual(i1, i2);
    assert.strictEqual(i1, i3);
    const [_, i4] = container.getAll(FooValueConverter);
    assert.strictEqual(i4, undefined);
  });

  it('does not retrieve the intermediate container value converter registration', function () {
    const child1 = container.createChild();
    const child2 = child1.createChild();
    let id = 0;

    @valueConverter('foo1')
    class Foo1 {
      id = ++id;
    }

    child1.register(Foo1);
    container.register(Foo1);

    ValueConverter.get(child2, 'foo1');
    assert.strictEqual(id, 1, `should create value converter only once`);

    ValueConverter.get(child1, 'foo1');
    assert.strictEqual(id, 2, `should create another value converter in the middle layer container`);
  });
});
