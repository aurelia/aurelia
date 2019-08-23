import {
  DI,
  IContainer
} from '@aurelia/kernel';
import {
  PropertyBinding,
  LifecycleFlags,
  ThrottleBindingBehavior
} from '@aurelia/runtime';
import { assert } from '@aurelia/testing';

describe('ThrottleBindingBehavior', function () {
  const container: IContainer = DI.createContainer();
  let sut: ThrottleBindingBehavior;
  let binding: PropertyBinding;
  let originalFn: (value: unknown, flags: LifecycleFlags) => void;

  beforeEach(function () {
    sut = new ThrottleBindingBehavior();
    binding = new PropertyBinding(undefined, undefined, undefined, undefined, undefined, container);
    originalFn = binding.updateTarget;
    sut.bind(undefined, undefined, binding as any);
  });

  // TODO: test properly (whether throttling works etc)
  it('bind()   should apply the correct behavior', function () {
    assert.strictEqual(binding['throttledMethod'] === originalFn, true, `binding['throttledMethod'] === originalFn`);
    assert.strictEqual(binding['throttledMethod'].originalName, 'updateTarget', `binding['throttledMethod'].originalName`);
    assert.strictEqual(binding.updateTarget === originalFn, false, `binding.updateTarget === originalFn`);
    assert.strictEqual(typeof binding.updateTarget, 'function', `typeof binding.updateTarget`);
    assert.notStrictEqual(binding['throttleState'], null, `binding['throttleState']`);
    assert.strictEqual(typeof binding['throttleState'], 'object', `typeof binding['throttleState']`);
  });

  it('unbind() should revert the original behavior', function () {
    sut.unbind(undefined, undefined, binding as any);
    assert.strictEqual(binding['throttledMethod'], null, `binding['throttledMethod']`);
    assert.strictEqual(binding.updateTarget === originalFn, true, `binding.updateTarget === originalFn`);
    assert.strictEqual(typeof binding.updateTarget, 'function', `typeof binding.updateTarget`);
    assert.strictEqual(binding['throttleState'], null, `binding['throttleState']`);
  });
});
