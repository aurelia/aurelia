import { sourceContext } from '@aurelia/runtime';
import { IExpression } from '@aurelia/runtime';
import { IObserverLocator } from '@aurelia/runtime';
import { IContainer } from '@aurelia/kernel';
import { Binding } from '@aurelia/runtime';
import { BindingFlags } from '@aurelia/runtime';
import { IScope } from '@aurelia/runtime';
import { BindingMode } from '@aurelia/runtime';
import { expect } from 'chai';
import { DebounceBindingBehavior } from '@aurelia/runtime';

describe('DebounceBindingBehavior', () => {
  let sourceExpression: IExpression;
  let target: any;
  let targetProperty: string;
  let mode: BindingMode;
  let observerLocator: IObserverLocator;
  let container: IContainer;
  let sut: DebounceBindingBehavior;
  let binding: Binding;
  let flags: BindingFlags;
  let scope: IScope;
  let originalFn: Function;

  beforeEach(() => {
    sut = new DebounceBindingBehavior();
    binding = new Binding(sourceExpression, target, targetProperty, mode, observerLocator, container);
    originalFn = binding.call;
    sut.bind(flags, scope, <any>binding);
  });

  // TODO: test properly (whether debouncing works etc)
  it('bind()   should apply the correct behavior', () => {
    expect(binding['debouncedMethod'] === originalFn).to.be.true;
    expect(binding['debouncedMethod'].originalName).to.equal('call');
    expect(binding.call === originalFn).to.be.false;
    expect(typeof binding.call).to.equal('function');
    expect(binding['debounceState']).not.to.be.null
    expect(typeof binding['debounceState']).to.equal('object');
  });

  it('unbind() should revert the original behavior', () => {
    sut.unbind(flags, scope, <any>binding);
    expect(binding['debouncedMethod']).to.be.null;
    expect(binding.call === originalFn).to.be.true;
    expect(typeof binding.call).to.equal('function');
    expect(binding['debounceState']).to.be.null
  });
});
