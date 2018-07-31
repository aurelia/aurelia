import { ToViewBindingBehavior, FromViewBindingBehavior, TwoWayBindingBehavior } from '@aurelia/runtime';
import { expect } from 'chai';
import { IObserverLocator } from '@aurelia/runtime';
import { OneTimeBindingBehavior } from '@aurelia/runtime';
import { Binding } from '@aurelia/runtime';
import { BindingFlags } from '@aurelia/runtime';
import { IExpression } from '@aurelia/runtime';
import { BindingMode } from '@aurelia/runtime';
import { IContainer } from '@aurelia/kernel';
import { IScope } from '@aurelia/runtime';

const tests = [
  { Behavior: OneTimeBindingBehavior, mode: BindingMode.oneTime },
  { Behavior: ToViewBindingBehavior, mode: BindingMode.toView },
  { Behavior: FromViewBindingBehavior, mode: BindingMode.fromView },
  { Behavior: TwoWayBindingBehavior, mode: BindingMode.twoWay }
];

describe('BindingModeBehavior', () => {
  let sourceExpression: IExpression;
  let target: any;
  let targetProperty: string;
  let observerLocator: IObserverLocator;
  let container: IContainer;
  let sut: OneTimeBindingBehavior;
  let binding: Binding;
  let flags: BindingFlags;
  let scope: IScope;

  for (const { Behavior, mode } of tests) {
    const initModeArr = [BindingMode.oneTime, BindingMode.toView, BindingMode.fromView, BindingMode.twoWay, BindingMode.default];

    for (const initMode of initModeArr) {
      describe(Behavior.name, () => {
        beforeEach(() => {
          sut = new Behavior();
          binding = new Binding(sourceExpression, target, targetProperty, initMode, observerLocator, container);
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
