import {
  DI,
  IContainer
} from '@aurelia/kernel';
import {
  PropertyBinding,
  BindingMode,
  FromViewBindingBehavior,
  OneTimeBindingBehavior,
  ToViewBindingBehavior,
  TwoWayBindingBehavior
} from '@aurelia/runtime';
import { assert } from '@aurelia/testing';

const tests = [
  { Behavior: OneTimeBindingBehavior, mode: BindingMode.oneTime },
  { Behavior: ToViewBindingBehavior, mode: BindingMode.toView },
  { Behavior: FromViewBindingBehavior, mode: BindingMode.fromView },
  { Behavior: TwoWayBindingBehavior, mode: BindingMode.twoWay }
];

describe('BindingModeBehavior', function () {
  const container: IContainer = DI.createContainer();
  let sut: OneTimeBindingBehavior;
  let binding: PropertyBinding;

  for (const { Behavior, mode } of tests) {
    const initModeArr = [BindingMode.oneTime, BindingMode.toView, BindingMode.fromView, BindingMode.twoWay, BindingMode.default];

    for (const initMode of initModeArr) {
      describe(Behavior.name, function () {
        // eslint-disable-next-line mocha/no-hooks
        beforeEach(function () {
          sut = new Behavior();
          binding = new PropertyBinding(undefined, undefined, undefined, initMode, undefined, container as any);
          sut.bind(undefined, undefined, binding);
        });

        it(`bind()   should apply  bindingMode ${mode}`, function () {
          assert.strictEqual(binding.mode, mode, `binding.mode`);
        });

        it(`unbind() should revert bindingMode ${initMode}`, function () {
          sut.unbind(undefined, undefined, binding);
          assert.strictEqual(binding.mode, initMode, `binding.mode`);
        });
      });
    }
  }
});
