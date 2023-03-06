import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/binding-behavior.update-trigger.spec.ts', function () {
  it('changes input listen event', function () {
    const { component, type, trigger } = createFixture('<input value.bind="message & updateTrigger : `value`">', { message: '' });

    type('input', 'hello');
    assert.strictEqual(component.message, '');

    trigger('input', 'value');
    assert.strictEqual(component.message, 'hello');
  });

  it('changes textarea listen event', function () {
    const { component, type, trigger } = createFixture('<textarea value.bind="message & updateTrigger : `value`">', { message: '' });

    type('textarea', 'hello');
    assert.strictEqual(component.message, '');

    trigger('textarea', 'value');
    assert.strictEqual(component.message, 'hello');
  });
});
