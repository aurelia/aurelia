import { sourceContext } from './../../../../src/runtime/binding/binding-context';
import { IExpression } from '../../../../src/runtime/binding/ast';
import { IObserverLocator } from '../../../../src/runtime/binding/observer-locator';
import { IContainer } from '../../../../src/kernel';
import { Binding } from '../../../../src/runtime/binding/binding';
import { BindingFlags } from '../../../../src/runtime/binding/binding-flags';
import { IScope } from '../../../../src/runtime/binding/binding-context';
import { BindingMode } from '../../../../src/runtime/binding/binding-mode';
import { expect } from 'chai';
import { DebounceBindingBehavior } from '../../../../src/runtime/binding/resources/debounce-binding-behavior';

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
