import { DataAttributeAccessor, AttrBindingBehavior, IExpression, IObserverLocator, Binding, LifecycleFlags, IScope, BindingMode, DOM, IsBindingBehavior } from '../../src/index';
import { expect } from 'chai';
import { IContainer, DI } from '../../../kernel/src/index';

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
    target = document.createElement('div');
    targetProperty = 'foo';
    sut = new AttrBindingBehavior();
    container = DI.createContainer();
    binding = new Binding(sourceExpression, target, targetProperty, mode, observerLocator, <any>container);
    sut.bind(flags, scope, binding);
  });

  it('bind()   should put a DataAttributeObserver on the binding', () => {
    expect(binding.targetObserver instanceof DataAttributeAccessor).to.be.true;
    expect(binding.targetObserver['obj'] === target).to.be.true;
    expect(binding.targetObserver['propertyKey'] === targetProperty).to.be.true;
  });

  // it('unbind() should clear the DataAttributeObserver from the binding', () => {
  //   // TODO: it doesn't actually do, and it should
  // });
});
