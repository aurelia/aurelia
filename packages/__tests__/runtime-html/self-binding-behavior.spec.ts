import { DI, IContainer } from '@aurelia/kernel';
import { PropertyBinding } from '@aurelia/runtime';
import { SelfBindingBehavior } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';

describe('SelfBindingBehavior', function () {
  const container: IContainer = DI.createContainer();
  let sut: SelfBindingBehavior;
  let binding: PropertyBinding;
  let originalCallSource: () => void;

  // eslint-disable-next-line mocha/no-hooks
  beforeEach(function () {
    sut = new SelfBindingBehavior();
    binding = new PropertyBinding(undefined, undefined, undefined, undefined, undefined, container as any);
    originalCallSource = binding['callSource'] = function () { return; };
    binding['targetEvent'] = 'foo';
    sut.bind(undefined, undefined, binding as any);
  });

  // TODO: test properly (different binding types)
  it('bind()   should apply the correct behavior', function () {
    assert.strictEqual(binding['selfEventCallSource'] === originalCallSource, true, `binding['selfEventCallSource'] === originalCallSource`);
    assert.strictEqual(binding['callSource'] === originalCallSource, false, `binding['callSource'] === originalCallSource`);
    assert.strictEqual(typeof binding['callSource'], 'function', `typeof binding['callSource']`);
  });

  it('unbind() should revert the original behavior', function () {
    sut.unbind(undefined, undefined, binding as any);
    assert.strictEqual(binding['selfEventCallSource'], null, `binding['selfEventCallSource']`);
    assert.strictEqual(binding['callSource'] === originalCallSource, true, `binding['callSource'] === originalCallSource`);
  });
});
