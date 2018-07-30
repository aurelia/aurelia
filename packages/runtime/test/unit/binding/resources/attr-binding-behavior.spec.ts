import { DataAttributeObserver } from './../../../../src/runtime/binding/element-observation';
import { AttrBindingBehavior } from '../../../../src/runtime/binding/resources/attr-binding-behavior';
import { IExpression } from '../../../../src/runtime/binding/ast';
import { IObserverLocator } from '../../../../src/runtime/binding/observer-locator';
import { IContainer } from '../../../../src/kernel/di';
import { Binding } from '../../../../src/runtime/binding/binding';
import { BindingFlags } from '../../../../src/runtime/binding/binding-flags';
import { IScope } from '../../../../src/runtime/binding/binding-context';
import { BindingMode } from '../../../../src/runtime/binding/binding-mode';
import { expect } from 'chai';
import { DOM } from '../../../../src/runtime/dom';

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
