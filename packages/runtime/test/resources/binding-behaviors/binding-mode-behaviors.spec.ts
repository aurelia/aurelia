import { ToViewBindingBehavior, FromViewBindingBehavior, TwoWayBindingBehavior, IObserverLocator, OneTimeBindingBehavior, Binding, LifecycleFlags, IExpression, BindingMode, IScope, IsBindingBehavior } from '../../../src/index';
import { expect } from 'chai';
import { IContainer, DI } from '@aurelia/kernel';

const tests = [
  { Behavior: OneTimeBindingBehavior, mode: BindingMode.oneTime },
  { Behavior: ToViewBindingBehavior, mode: BindingMode.toView },
  { Behavior: FromViewBindingBehavior, mode: BindingMode.fromView },
  { Behavior: TwoWayBindingBehavior, mode: BindingMode.twoWay }
];

describe('BindingModeBehavior', () => {
  let sourceExpression: IsBindingBehavior;
  let target: any;
  let targetProperty: string;
  let observerLocator: IObserverLocator;
  let container: IContainer = DI.createContainer();
  let sut: OneTimeBindingBehavior;
  let binding: Binding;
  let flags: LifecycleFlags;
  let scope: IScope;

  for (const { Behavior, mode } of tests) {
    const initModeArr = [BindingMode.oneTime, BindingMode.toView, BindingMode.fromView, BindingMode.twoWay, BindingMode.default];

    for (const initMode of initModeArr) {
      describe(Behavior.name, () => {
        beforeEach(() => {
          sut = new Behavior();
          binding = new Binding(sourceExpression, target, targetProperty, initMode, observerLocator, <any>container);
          sut.bind(flags, scope, binding);
        });

        it(`bind()   should apply  bindingMode ${mode}`, () => {
          expect(binding.mode).to.equal(mode);
        });

        it(`unbind() should revert bindingMode ${initMode}`, () => {
          sut.unbind(flags, scope, binding);
          expect(binding.mode).to.equal(initMode);
        });
      });
    }
  }
});
