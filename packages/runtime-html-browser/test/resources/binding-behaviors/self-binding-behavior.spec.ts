import { DI, IContainer } from '@aurelia/kernel';
import { Binding, BindingMode, IObserverLocator, IsBindingBehavior, IScope, LifecycleFlags } from '@aurelia/runtime';
import { expect } from 'chai';
import { SelfBindingBehavior } from '../../../../runtime-html/src/index';

describe('SelfBindingBehavior', () => {
  let sourceExpression: IsBindingBehavior;
  let target: any;
  let targetProperty: string;
  let mode: BindingMode;
  let observerLocator: IObserverLocator;
  const container: IContainer = DI.createContainer();
  let sut: SelfBindingBehavior;
  let binding: Binding;
  let flags: LifecycleFlags;
  let scope: IScope;
  let originalCallSource: Function;

  beforeEach(() => {
    sut = new SelfBindingBehavior();
    binding = new Binding(sourceExpression, target, targetProperty, mode, observerLocator, container as any);
    originalCallSource = binding['callSource'] = function() {};
    binding['targetEvent'] = 'foo';
    sut.bind(flags, scope, binding as any);
  });

  // TODO: test properly (different binding types)
  it('bind()   should apply the correct behavior', () => {
    expect(binding['selfEventCallSource'] === originalCallSource).to.equal(true);
    expect(binding['callSource'] === originalCallSource).to.equal(false);
    expect(typeof binding['callSource']).to.equal('function');
  });

  it('unbind() should revert the original behavior', () => {
    sut.unbind(flags, scope, binding as any);
    expect(binding['selfEventCallSource']).to.equal(null);
    expect(binding['callSource'] === originalCallSource).to.equal(true);
  });
});
