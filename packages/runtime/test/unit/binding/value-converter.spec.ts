import { valueConverter, ValueConverterResource } from '@aurelia/runtime';
import { IContainer, DI } from '@aurelia/kernel';
import { expect } from 'chai';

describe(`@valueConverter('foo')`, () => {
  let container: IContainer;

  beforeEach(() => {
    container = DI.createContainer();
  });

  @valueConverter('foo')
  class FooValueConverter { }

  it(`should define the value converter`, () => {
    expect(FooValueConverter['kind']).to.equal(ValueConverterResource);
    expect(FooValueConverter['description'].name).to.equal('foo');
    FooValueConverter['register'](container);
    const instance = container.get(ValueConverterResource.key('foo'));
    expect(instance).to.be.instanceof(FooValueConverter);
  });

});
