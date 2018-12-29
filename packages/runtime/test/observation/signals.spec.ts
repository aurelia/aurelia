import {
  DI,
  IContainer
} from '@aurelia/kernel';
import { expect } from 'chai';
import { spy } from 'sinon';
import {
  Binding,
  BindingMode,
  IObserverLocator,
  IsBindingBehavior,
  IScope,
  ISignaler,
  LifecycleFlags,
  SignalBindingBehavior
} from '../../src/index';

describe('SignalBindingBehavior', () => {
  let sourceExpression: IsBindingBehavior;
  let target: any;
  let targetProperty: string;
  let mode: BindingMode;
  let observerLocator: IObserverLocator;
  const container: IContainer = DI.createContainer();
  let sut: SignalBindingBehavior;
  let binding: Binding;
  let flags: LifecycleFlags;
  let scope: IScope;
  let signaler: ISignaler;
  let name: string;

  beforeEach(() => {
    name = 'foo';
    signaler = new MockSignaler() as any;
    sut = new SignalBindingBehavior(signaler);
    binding = new Binding(sourceExpression, target, targetProperty, mode, observerLocator, container as any);
    (sut as any).bind(flags, scope, binding as any, name);
  });

  // TODO: test properly (multiple names etc)
  it('bind()   should apply the correct behavior', () => {
    expect(signaler.addSignalListener).to.have.been.calledWith(name, binding);
  });

  it('unbind() should revert the original behavior', () => {
    sut.unbind(flags, scope, binding as any);
    expect(signaler.removeSignalListener).to.have.been.calledWith(name, binding);
  });
});

class MockSignaler {
  public addSignalListener = spy();
  public removeSignalListener = spy();
}
