import { IExpression, IObserverLocator, Binding, LifecycleFlags, IScope, BindingMode, DebounceBindingBehavior, IsBindingBehavior } from '../../src/index';
import { expect } from 'chai';
import { IContainer, DI } from '@aurelia/kernel';

describe('DebounceBindingBehavior', () => {
  let sourceExpression: IsBindingBehavior;
  let target: any;
  let targetProperty: string;
  let mode: BindingMode;
  let observerLocator: IObserverLocator;
  let container: IContainer = DI.createContainer();
  let sut: DebounceBindingBehavior;
  let binding: Binding;
  let flags: LifecycleFlags;
  let scope: IScope;
  let originalFn: Function;

  beforeEach(() => {
    sut = new DebounceBindingBehavior();
    binding = new Binding(sourceExpression, target, targetProperty, mode, observerLocator, <any>container);
    originalFn = binding.handleChange;
    sut.bind(flags, scope, <any>binding);
  });

  // TODO: test properly (whether debouncing works etc)
  it('bind()   should apply the correct behavior', () => {
    expect(binding['debouncedMethod'] === originalFn).to.be.true;
    expect(binding['debouncedMethod'].originalName).to.equal('handleChange');
    expect(binding.handleChange === originalFn).to.be.false;
    expect(typeof binding.handleChange).to.equal('function');
    expect(binding['debounceState']).not.to.be.null
    expect(typeof binding['debounceState']).to.equal('object');
  });

  it('unbind() should revert the original behavior', () => {
    sut.unbind(flags, scope, <any>binding);
    expect(binding['debouncedMethod']).to.be.null;
    expect(binding.handleChange === originalFn).to.be.true;
    expect(typeof binding.handleChange).to.equal('function');
    expect(binding['debounceState']).to.be.null
  });
});
