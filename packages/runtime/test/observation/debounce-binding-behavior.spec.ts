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

describe('DebounceBindingBehavior', function() {
  const container: IContainer = DI.createContainer();
  let sut: DebounceBindingBehavior;
  let binding: Binding;
  let originalFn: (newValue: unknown, previousValue: unknown, flags: LifecycleFlags) => void;

  beforeEach(function() {
    sut = new DebounceBindingBehavior();
    binding = new Binding(undefined, undefined, undefined, undefined, undefined, container);
    originalFn = binding.handleChange;
    sut.bind(undefined, undefined, binding as any);
  });

  // TODO: test properly (whether debouncing works etc)
  it('bind()   should apply the correct behavior', function() {
    expect(binding['debouncedMethod'] === originalFn).to.equal(true);
    expect(binding['debouncedMethod'].originalName).to.equal('handleChange');
    expect(binding.handleChange === originalFn).to.equal(false);
    expect(typeof binding.handleChange).to.equal('function');
    expect(binding['debounceState']).not.to.equal(null);
    expect(typeof binding['debounceState']).to.equal('object');
  });

  it('unbind() should revert the original behavior', function() {
    sut.unbind(undefined, undefined, binding as any);
    expect(binding['debouncedMethod']).to.equal(null);
    expect(binding.handleChange === originalFn).to.equal(true);
    expect(typeof binding.handleChange).to.equal('function');
    expect(binding['debounceState']).to.equal(null);
  });
});
