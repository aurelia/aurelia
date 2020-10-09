import {
  DI,
  IContainer,
  ILogger,
  LoggerConfiguration,
  Registration,
} from '@aurelia/kernel';
import {
  PropertyBinding,
  BindingMode,
  FromViewBindingBehavior,
  OneTimeBindingBehavior,
  ToViewBindingBehavior,
  TwoWayBindingBehavior,
  IScheduler,
} from '@aurelia/runtime';
import { assert } from '@aurelia/testing';

const tests = [
  { Behavior: OneTimeBindingBehavior, mode: BindingMode.oneTime },
  { Behavior: ToViewBindingBehavior, mode: BindingMode.toView },
  { Behavior: FromViewBindingBehavior, mode: BindingMode.fromView },
  { Behavior: TwoWayBindingBehavior, mode: BindingMode.twoWay }
];

describe('2-runtime/binding-mode-behavior.spec.ts', function () {
  const container: IContainer = DI.createContainer();
  let sut: OneTimeBindingBehavior;
  let binding: PropertyBinding;

  Registration.instance(IScheduler, {}).register(container);

  for (const { Behavior, mode } of tests) {
    const initModeArr = [BindingMode.oneTime, BindingMode.toView, BindingMode.fromView, BindingMode.twoWay, BindingMode.default];

    for (const initMode of initModeArr) {
      describe(Behavior.name, function () {
        // eslint-disable-next-line mocha/no-hooks
        beforeEach(function () {
          sut = new Behavior();
          binding = new PropertyBinding(undefined, undefined, undefined, initMode, undefined, container as any);
          sut.bind(undefined, undefined, undefined, binding);
        });

        it(`bind()   should apply  bindingMode ${mode}`, function () {
          assert.strictEqual(binding.mode, mode, `binding.mode`);
        });

        it(`unbind() should revert bindingMode ${initMode}`, function () {
          sut.unbind(undefined, undefined, undefined, binding);
          assert.strictEqual(binding.mode, initMode, `binding.mode`);
        });
      });
    }
  }
});
