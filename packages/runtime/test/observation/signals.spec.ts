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

describe('SignalBindingBehavior', function() {
  const container: IContainer = DI.createContainer();
  let sut: SignalBindingBehavior;
  let binding: Binding;
  let signaler: ISignaler;
  let name: string;

  beforeEach(function() {
    name = 'foo';
    signaler = new MockSignaler() as any;
    sut = new SignalBindingBehavior(signaler);
    binding = new Binding(undefined, undefined, undefined, undefined, undefined, container as any);
    (sut as any).bind(undefined, undefined, binding as any, name);
  });

  // TODO: test properly (multiple names etc)
  it('bind()   should apply the correct behavior', function() {
    expect(signaler.addSignalListener).to.have.been.calledWith(name, binding);
  });

  it('unbind() should revert the original behavior', function() {
    sut.unbind(undefined, undefined, binding as any);
    expect(signaler.removeSignalListener).to.have.been.calledWith(name, binding);
  });
});

class MockSignaler {
  public addSignalListener = spy();
  public removeSignalListener = spy();
}
