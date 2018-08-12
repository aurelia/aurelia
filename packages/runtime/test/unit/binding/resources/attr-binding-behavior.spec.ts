import { DataAttributeObserver } from '@aurelia/runtime';
import { AttrBindingBehavior } from '@aurelia/runtime';
import { IExpression } from '@aurelia/runtime';
import { IObserverLocator } from '@aurelia/runtime';
import { IContainer, DI } from '@aurelia/kernel';
import { Binding } from '@aurelia/runtime';
import { BindingFlags } from '@aurelia/runtime';
import { IScope } from '@aurelia/runtime';
import { BindingMode } from '@aurelia/runtime';
import { expect } from 'chai';
import { DOM } from '@aurelia/runtime';

describe('AttrBindingBehavior', () => {
  let sourceExpression: IExpression;
  let target: any;
  let targetProperty: string;
  let mode: BindingMode;
  let observerLocator: IObserverLocator;
  let container: IContainer;
  let sut: AttrBindingBehavior;
  let binding: Binding;
  let flags: BindingFlags;
  let scope: IScope;

  beforeEach(() => {
    target = DOM.createElement('div');
    targetProperty = 'foo';
    sut = new AttrBindingBehavior();
    container = DI.createContainer();
    binding = new Binding(sourceExpression, target, targetProperty, mode, observerLocator, container);
    sut.bind(flags, scope, binding);
  });

  it('bind()   should put a DataAttributeObserver on the binding', () => {
    expect(binding.targetObserver instanceof DataAttributeObserver).to.be.true;
    expect(binding.targetObserver['node'] === target).to.be.true;
    expect(binding.targetObserver['propertyName'] === targetProperty).to.be.true;
  });

  // it('unbind() should clear the DataAttributeObserver from the binding', () => {
  //   // TODO: it doesn't actually do, and it should
  // });
});
