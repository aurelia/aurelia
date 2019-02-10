import { IContainer } from '@aurelia/kernel';
import { Binding } from '@aurelia/runtime';
import { expect } from 'chai';
import { AttrBindingBehavior, DataAttributeAccessor } from '../../../src/index';
import { TestContext } from '../../util';

describe('AttrBindingBehavior', function () {
  let target: any;
  let targetProperty: string;
  let container: IContainer;
  let sut: AttrBindingBehavior;
  let binding: Binding;

  beforeEach(function () {
    const ctx = TestContext.createHTMLTestContext();
    target = ctx.createElement('div');
    targetProperty = 'foo';
    sut = new AttrBindingBehavior();
    container = ctx.container;
    binding = new Binding(undefined, target, targetProperty, undefined, undefined, container);
    sut.bind(undefined, undefined, binding);
  });

  it('bind()   should put a DataAttributeObserver on the binding', function () {
    expect(binding.targetObserver instanceof DataAttributeAccessor).to.equal(true);
    expect(binding.targetObserver['obj'] === target).to.equal(true);
    expect(binding.targetObserver['propertyKey'] === targetProperty).to.equal(true);
  });

  // it('unbind() should clear the DataAttributeObserver from the binding', function () {
  //   // TODO: it doesn't actually do, and it should
  // });
});
