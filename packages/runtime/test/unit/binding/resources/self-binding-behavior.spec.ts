import { IExpression } from '@aurelia/runtime';
import { IObserverLocator } from '@aurelia/runtime';
import { IContainer } from '@aurelia/kernel';
import { Binding } from '@aurelia/runtime';
import { BindingFlags } from '@aurelia/runtime';
import { IScope } from '@aurelia/runtime';
import { BindingMode } from '@aurelia/runtime';
import { expect } from 'chai';
import { SelfBindingBehavior } from '@aurelia/runtime';

describe('SelfBindingBehavior', () => {
  let sourceExpression: IExpression;
  let target: any;
  let targetProperty: string;
  let mode: BindingMode;
  let observerLocator: IObserverLocator;
  let container: IContainer;
  let sut: SelfBindingBehavior;
  let binding: Binding;
  let flags: BindingFlags;
  let scope: IScope;
  let originalCallSource: Function;

  beforeEach(() => {
    sut = new SelfBindingBehavior();
    binding = new Binding(sourceExpression, target, targetProperty, mode, observerLocator, container);
    originalCallSource = binding['callSource'] = function(){};
    binding['targetEvent'] = 'foo';
    sut.bind(flags, scope, <any>binding);
  });

  // TODO: test properly (different binding types)
  it('bind()   should apply the correct behavior', () => {
    expect(binding['selfEventCallSource'] === originalCallSource).to.be.true;
    expect(binding['callSource'] === originalCallSource).to.be.false;
    expect(typeof binding['callSource']).to.equal('function');
  });

  it('unbind() should revert the original behavior', () => {
    sut.unbind(flags, scope, <any>binding);
    expect(binding['selfEventCallSource']).to.be.null;
    expect(binding['callSource'] === originalCallSource).to.be.true;
  });
});
