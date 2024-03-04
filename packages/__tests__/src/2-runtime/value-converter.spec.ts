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

});
