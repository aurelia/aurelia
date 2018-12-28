import { IExpression, IObserverLocator, Binding, LifecycleFlags, IScope, BindingMode, SelfBindingBehavior, IsBindingBehavior } from '../../src/index';
import { IContainer, DI } from '../../../kernel/src/index';
import { expect } from 'chai';

describe('SelfBindingBehavior', () => {
  let sourceExpression: IsBindingBehavior;
  let target: any;
  let targetProperty: string;
  let mode: BindingMode;
  let observerLocator: IObserverLocator;
  let container: IContainer = DI.createContainer();
  let sut: SelfBindingBehavior;
  let binding: Binding;
  let flags: LifecycleFlags;
  let scope: IScope;
  let originalCallSource: Function;

  beforeEach(() => {
    sut = new SelfBindingBehavior();
    binding = new Binding(sourceExpression, target, targetProperty, mode, observerLocator, <any>container);
    originalCallSource = binding['callSource'] = function(){};
    binding['targetEvent'] = 'foo';
    sut.bind(flags, scope, <any>binding);
  });

  // TODO: test properly (different binding types)
  it('bind()   should apply the correct behavior', () => {
    expect(binding['selfEventCallSource'] === originalCallSource).to.equal(true);
    expect(binding['callSource'] === originalCallSource).to.equal(false);
    expect(typeof binding['callSource']).to.equal('function');
  });

  it('unbind() should revert the original behavior', () => {
    sut.unbind(flags, scope, <any>binding);
    expect(binding['selfEventCallSource']).to.equal(null);
    expect(binding['callSource'] === originalCallSource).to.equal(true);
  });
});
