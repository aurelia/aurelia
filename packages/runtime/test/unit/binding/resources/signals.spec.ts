import { spy } from 'sinon';
import { IExpression } from '../../../../src/runtime/binding/ast';
import { IObserverLocator } from '../../../../src/runtime/binding/observer-locator';
import { IContainer } from '../../../../src/kernel/di';
import { Binding } from '../../../../src/runtime/binding/binding';
import { BindingFlags } from '../../../../src/runtime/binding/binding-flags';
import { IScope } from '../../../../src/runtime/binding/binding-context';
import { BindingMode } from '../../../../src/runtime/binding/binding-mode';
import { expect } from 'chai';
import { SignalBindingBehavior } from '../../../../src/runtime/binding/resources/signals';
import { ISignaler } from '../../../../src/runtime/binding/signaler';

describe('SignalBindingBehavior', () => {
  let sourceExpression: IExpression;
  let target: any;
  let targetProperty: string;
  let mode: BindingMode;
  let observerLocator: IObserverLocator;
  let container: IContainer;
  let sut: SignalBindingBehavior;
  let binding: Binding;
  let flags: BindingFlags;
  let scope: IScope;
  let signaler: ISignaler;
  let name: string;

  beforeEach(() => {
    name = 'foo';
    signaler = <any>new MockSignaler();
    sut = new SignalBindingBehavior(signaler);
    binding = new Binding(sourceExpression, target, targetProperty, mode, observerLocator, container);
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
