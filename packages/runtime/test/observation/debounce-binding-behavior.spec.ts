import {
  DI,
  IContainer
} from '@aurelia/kernel';
import { expect } from 'chai';
import {
  Binding,
  BindingMode,
  DebounceBindingBehavior,
  IObserverLocator,
  IsBindingBehavior,
  IScope,
  LifecycleFlags
} from '../../src/index';

describe('DebounceBindingBehavior', () => {
  let sourceExpression: IsBindingBehavior;
  let target: any;
  let targetProperty: string;
  let mode: BindingMode;
  let observerLocator: IObserverLocator;
  const container: IContainer = DI.createContainer();
  let sut: DebounceBindingBehavior;
  let binding: Binding;
  let flags: LifecycleFlags;
  let scope: IScope;
  let originalFn: Function;

  beforeEach(() => {
    sut = new DebounceBindingBehavior();
    binding = new Binding(sourceExpression, target, targetProperty, mode, observerLocator, container as any);
    originalFn = binding.handleChange;
    sut.bind(flags, scope, binding as any);
  });

  // TODO: test properly (whether debouncing works etc)
  it('bind()   should apply the correct behavior', () => {
    expect(binding['debouncedMethod'] === originalFn).to.equal(true);
    expect(binding['debouncedMethod'].originalName).to.equal('handleChange');
    expect(binding.handleChange === originalFn).to.equal(false);
    expect(typeof binding.handleChange).to.equal('function');
    expect(binding['debounceState']).not.to.equal(null);
    expect(typeof binding['debounceState']).to.equal('object');
  });

  it('unbind() should revert the original behavior', () => {
    sut.unbind(flags, scope, binding as any);
    expect(binding['debouncedMethod']).to.equal(null);
    expect(binding.handleChange === originalFn).to.equal(true);
    expect(typeof binding.handleChange).to.equal('function');
    expect(binding['debounceState']).to.equal(null);
  });
});
