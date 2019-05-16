import { DI, IContainer } from '@aurelia/kernel';
import { valueConverter, ValueConverterResource } from '@aurelia/runtime';
import { assert } from '@aurelia/testing';

describe(`@valueConverter('foo')`, function () {
  let container: IContainer;

  beforeEach(function () {
    container = DI.createContainer();
  });

  // @ts-ignore
  @valueConverter('foo')
  class FooValueConverter { }

  it(`should define the value converter`, function () {
    assert.strictEqual(FooValueConverter['kind'], ValueConverterResource, `FooValueConverter['kind']`);
    assert.strictEqual(FooValueConverter['description'].name, 'foo', `FooValueConverter['description'].name`);
    FooValueConverter['register'](container);
    const instance = container.get(ValueConverterResource.keyFrom('foo'));
    assert.instanceOf(instance, FooValueConverter, `instance`);
  });

});
