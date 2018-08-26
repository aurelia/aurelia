import { DataAttributeAccessor,AttrBindingBehavior ,IExpression , IObserverLocator ,Binding ,BindingFlags,IScope ,BindingMode,DOM } from '../../../../src/index';
import { expect } from 'chai';
import { IContainer, DI } from '../../../../../kernel/src/index';

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
    expect(binding.targetObserver instanceof DataAttributeAccessor).to.be.true;
    expect(binding.targetObserver['obj'] === target).to.be.true;
    expect(binding.targetObserver['propertyKey'] === targetProperty).to.be.true;
  });

  // it('unbind() should clear the DataAttributeObserver from the binding', () => {
  //   // TODO: it doesn't actually do, and it should
  // });
});
