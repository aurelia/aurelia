import {
  DI,
  IContainer,
  Registration,
} from '@aurelia/kernel';
import {
  BindingMode,
  PropertyBinding,
  FromViewBindingBehavior,
  OneTimeBindingBehavior,
  ToViewBindingBehavior,
  TwoWayBindingBehavior,
  IPlatform,
} from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';

const tests = [
  { Behavior: OneTimeBindingBehavior, mode: BindingMode.oneTime },
  { Behavior: ToViewBindingBehavior, mode: BindingMode.toView },
  { Behavior: FromViewBindingBehavior, mode: BindingMode.fromView },
  { Behavior: TwoWayBindingBehavior, mode: BindingMode.twoWay }
];

describe('2-runtime/binding-mode-behaviors.spec.ts', function () {
  const container: IContainer = DI.createContainer();
  let sut: OneTimeBindingBehavior;
  let binding: PropertyBinding;

  Registration.instance(IPlatform, {}).register(container);

  for (const { Behavior, mode } of tests) {
    const initModeArr = [BindingMode.oneTime, BindingMode.toView, BindingMode.fromView, BindingMode.twoWay, BindingMode.default];

    for (const initMode of initModeArr) {
      describe(Behavior.name, function () {
        beforeEach(function () {
          sut = new Behavior();
          binding = new PropertyBinding(
            { state: 0 },
            container as any,
            {} as any,
            undefined,
            undefined,
            undefined,
            undefined,
            initMode,
          );
          sut.bind(undefined, binding);
        });

        it(`bind()   should apply  bindingMode ${mode}`, function () {
          assert.strictEqual(binding.mode, mode, `binding.mode`);
        });

        it(`unbind() should revert bindingMode ${initMode}`, function () {
          sut.unbind(undefined, binding);
          assert.strictEqual(binding.mode, initMode, `binding.mode`);
        });
      });
    }
  }
});
