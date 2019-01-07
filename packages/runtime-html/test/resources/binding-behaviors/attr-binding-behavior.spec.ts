import { IContainer } from '@aurelia/kernel';
import { Binding, BindingMode, IObserverLocator, IsBindingBehavior, IScope, LifecycleFlags } from '@aurelia/runtime';
import { expect } from 'chai';
import { AttrBindingBehavior, DataAttributeAccessor } from '../../../src/index';
import { TestContext } from '../../util';

describe('AttrBindingBehavior', () => {
  let sourceExpression: IsBindingBehavior;
  let target: any;
  let targetProperty: string;
  let mode: BindingMode;
  let observerLocator: IObserverLocator;
  let container: IContainer;
  let sut: AttrBindingBehavior;
  let binding: Binding;
  let flags: LifecycleFlags;
  let scope: IScope;

  beforeEach(() => {
    const ctx = TestContext.createHTMLTestContext();
    target = ctx.createElement('div');
    targetProperty = 'foo';
    sut = new AttrBindingBehavior();
    container = ctx.container;
    binding = new Binding(sourceExpression, target, targetProperty, mode, observerLocator, container);
    sut.bind(flags, scope, binding);
  });

  it('bind()   should put a DataAttributeObserver on the binding', () => {
    expect(binding.targetObserver instanceof DataAttributeAccessor).to.equal(true);
    expect(binding.targetObserver['obj'] === target).to.equal(true);
    expect(binding.targetObserver['propertyKey'] === targetProperty).to.equal(true);
  });

  // it('unbind() should clear the DataAttributeObserver from the binding', () => {
  //   // TODO: it doesn't actually do, and it should
  // });
});
