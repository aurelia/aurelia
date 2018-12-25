import { valueConverter, ValueConverterResource } from '../../../src/index';
import { IContainer, DI } from '../../../../kernel/src/index';
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
    const instance = container.get(ValueConverterResource.keyFrom('foo'));
    expect(instance).to.be.instanceof(FooValueConverter);
  });

});
