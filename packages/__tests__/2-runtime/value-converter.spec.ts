import { DI, IContainer } from '@aurelia/kernel';
import { valueConverter, ValueConverter } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';

describe(`@valueConverter('foo')`, function () {
  let container: IContainer;

  // eslint-disable-next-line mocha/no-hooks
  beforeEach(function () {
    container = DI.createContainer();
  });

  @valueConverter('foo')
  class FooValueConverter { }

  it(`should define the value converter`, function () {
    const definition = ValueConverter.getDefinition(FooValueConverter);
    assert.strictEqual(definition.name, 'foo', `definition.name`);
    definition.register(container);
    const instance = container.get(ValueConverter.keyFrom('foo'));
    assert.instanceOf(instance, FooValueConverter, `instance`);
  });

});
