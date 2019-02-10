import { DI, IContainer } from '@aurelia/kernel';
import { expect } from 'chai';
import { valueConverter, ValueConverterResource } from '../../src/index';

describe(`@valueConverter('foo')`, function() {
  let container: IContainer;

  beforeEach(function() {
    container = DI.createContainer();
  });

  // @ts-ignore
  @valueConverter('foo')
  class FooValueConverter { }

  it(`should define the value converter`, function() {
    expect(FooValueConverter['kind']).to.equal(ValueConverterResource);
    expect(FooValueConverter['description'].name).to.equal('foo');
    FooValueConverter['register'](container);
    const instance = container.get(ValueConverterResource.keyFrom('foo'));
    expect(instance).to.be.instanceof(FooValueConverter);
  });

});
