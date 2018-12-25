import { IExpression, IObserverLocator, Binding, LifecycleFlags, IScope, BindingMode, SignalBindingBehavior, ISignaler, IsBindingBehavior } from '../../src/index';
import { spy } from 'sinon';
import { expect } from 'chai';
import { IContainer, DI } from '../../../kernel/src/index';

describe('SignalBindingBehavior', () => {
  let sourceExpression: IsBindingBehavior;
  let target: any;
  let targetProperty: string;
  let mode: BindingMode;
  let observerLocator: IObserverLocator;
  let container: IContainer = DI.createContainer();
  let sut: SignalBindingBehavior;
  let binding: Binding;
  let flags: LifecycleFlags;
  let scope: IScope;
  let signaler: ISignaler;
  let name: string;

  beforeEach(() => {
    name = 'foo';
    signaler = <any>new MockSignaler();
    sut = new SignalBindingBehavior(signaler);
    binding = new Binding(sourceExpression, target, targetProperty, mode, observerLocator, <any>container);
    (<any>sut).bind(flags, scope, <any>binding, name);
  });

  // TODO: test properly (multiple names etc)
  it('bind()   should apply the correct behavior', () => {
    expect(signaler.addSignalListener).to.have.been.calledWith(name, binding);
  });

  it('unbind() should revert the original behavior', () => {
    sut.unbind(flags, scope, <any>binding);
    expect(signaler.removeSignalListener).to.have.been.calledWith(name, binding);
  });
});

class MockSignaler {
  addSignalListener = spy();
  removeSignalListener = spy();
}
