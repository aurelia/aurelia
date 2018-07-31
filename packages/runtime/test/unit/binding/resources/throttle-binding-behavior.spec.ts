import { IExpression } from '@aurelia/runtime';
import { IObserverLocator } from '@aurelia/runtime';
import { IContainer } from '@aurelia/kernel';
import { Binding } from '@aurelia/runtime';
import { BindingFlags } from '@aurelia/runtime';
import { IScope } from '@aurelia/runtime';
import { BindingMode } from '@aurelia/runtime';
import { expect } from 'chai';
import { ThrottleBindingBehavior } from '@aurelia/runtime';

describe('ThrottleBindingBehavior', () => {
  let sourceExpression: IExpression;
  let target: any;
  let targetProperty: string;
  let mode: BindingMode;
  let observerLocator: IObserverLocator;
  let container: IContainer;
  let sut: ThrottleBindingBehavior;
  let binding: Binding;
  let flags: BindingFlags;
  let scope: IScope;
  let originalFn: Function;

  beforeEach(() => {
    sut = new ThrottleBindingBehavior();
    binding = new Binding(sourceExpression, target, targetProperty, mode, observerLocator, container);
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
