import {
  DI,
  IContainer
} from '@aurelia/kernel';
import {
  PropertyBinding,
  DebounceBindingBehavior,
  LifecycleFlags
} from '@aurelia/runtime';
import { assert } from '@aurelia/testing';

describe('DebounceBindingBehavior', function () {
  const container: IContainer = DI.createContainer();
  let sut: DebounceBindingBehavior;
  let binding: PropertyBinding;
  let originalFn: (newValue: unknown, previousValue: unknown, flags: LifecycleFlags) => void;

  // eslint-disable-next-line mocha/no-hooks
  beforeEach(function () {
    sut = new DebounceBindingBehavior();
    binding = new PropertyBinding(undefined, undefined, undefined, undefined, undefined, container);
    originalFn = binding.handleChange;
    sut.bind(undefined, undefined, binding as any);
  });

  // TODO: test properly (whether debouncing works etc)
  it('bind()   should apply the correct behavior', function () {
    assert.strictEqual(binding['debouncedMethod'] === originalFn, true, `binding['debouncedMethod'] === originalFn`);
    assert.strictEqual(binding['debouncedMethod'].originalName, 'handleChange', `binding['debouncedMethod'].originalName`);
    assert.strictEqual(binding.handleChange === originalFn, false, `binding.handleChange === originalFn`);
    assert.strictEqual(typeof binding.handleChange, 'function', `typeof binding.handleChange`);
    assert.notStrictEqual(binding['debounceState'], null, `binding['debounceState']`);
    assert.strictEqual(typeof binding['debounceState'], 'object', `typeof binding['debounceState']`);
  });

  it('unbind() should revert the original behavior', function () {
    sut.unbind(undefined, undefined, binding as any);
    assert.strictEqual(binding['debouncedMethod'], null, `binding['debouncedMethod']`);
    assert.strictEqual(binding.handleChange === originalFn, true, `binding.handleChange === originalFn`);
    assert.strictEqual(typeof binding.handleChange, 'function', `typeof binding.handleChange`);
    assert.strictEqual(binding['debounceState'], null, `binding['debounceState']`);
  });
});
