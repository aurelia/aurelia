import {
  DI,
  IContainer
} from '@aurelia/kernel';
import { expect } from 'chai';
import {
  Binding,
  BindingMode,
  IObserverLocator,
  IsBindingBehavior,
  IScope,
  LifecycleFlags,
  ThrottleBindingBehavior
} from '../../../src/index';

describe('ThrottleBindingBehavior', () => {
  let sourceExpression: IsBindingBehavior;
  let target: any;
  let targetProperty: string;
  let mode: BindingMode;
  let observerLocator: IObserverLocator;
  const container: IContainer = DI.createContainer();
  let sut: ThrottleBindingBehavior;
  let binding: Binding;
  let flags: LifecycleFlags;
  let scope: IScope;
  let originalFn: Function;

  beforeEach(() => {
    sut = new ThrottleBindingBehavior();
    binding = new Binding(sourceExpression, target, targetProperty, mode, observerLocator, container as any);
    originalFn = binding.updateTarget;
    sut.bind(flags, scope, binding as any);
  });

  // TODO: test properly (whether throttling works etc)
  it('bind()   should apply the correct behavior', () => {
    expect(binding['throttledMethod'] === originalFn).to.equal(true);
    expect(binding['throttledMethod'].originalName).to.equal('updateTarget');
    expect(binding.updateTarget === originalFn).to.equal(false);
    expect(typeof binding.updateTarget).to.equal('function');
    expect(binding['throttleState']).not.to.be.null;
    expect(typeof binding['throttleState']).to.equal('object');
  });

  it('unbind() should revert the original behavior', () => {
    sut.unbind(flags, scope, binding as any);
    expect(binding['throttledMethod']).to.equal(null);
    expect(binding.updateTarget === originalFn).to.equal(true);
    expect(typeof binding.updateTarget).to.equal('function');
    expect(binding['throttleState']).to.be.null;
  });
});
