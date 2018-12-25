import { IExpression, IObserverLocator, Binding, LifecycleFlags, IScope, BindingMode, ThrottleBindingBehavior, IsBindingBehavior } from '../../../src/index';
import { expect } from 'chai';
import { IContainer, DI } from '@aurelia/kernel';

describe('ThrottleBindingBehavior', () => {
  let sourceExpression: IsBindingBehavior;
  let target: any;
  let targetProperty: string;
  let mode: BindingMode;
  let observerLocator: IObserverLocator;
  let container: IContainer = DI.createContainer();
  let sut: ThrottleBindingBehavior;
  let binding: Binding;
  let flags: LifecycleFlags;
  let scope: IScope;
  let originalFn: Function;

  beforeEach(() => {
    sut = new ThrottleBindingBehavior();
    binding = new Binding(sourceExpression, target, targetProperty, mode, observerLocator, <any>container);
    originalFn = binding.updateTarget;
    sut.bind(flags, scope, <any>binding);
  });

  // TODO: test properly (whether throttling works etc)
  it('bind()   should apply the correct behavior', () => {
    expect(binding['throttledMethod'] === originalFn).to.be.true;
    expect(binding['throttledMethod'].originalName).to.equal('updateTarget');
    expect(binding.updateTarget === originalFn).to.be.false;
    expect(typeof binding.updateTarget).to.equal('function');
    expect(binding['throttleState']).not.to.be.null
    expect(typeof binding['throttleState']).to.equal('object');
  });

  it('unbind() should revert the original behavior', () => {
    sut.unbind(flags, scope, <any>binding);
    expect(binding['throttledMethod']).to.be.null;
    expect(binding.updateTarget === originalFn).to.be.true;
    expect(typeof binding.updateTarget).to.equal('function');
    expect(binding['throttleState']).to.be.null
  });
});
