import { assert, createFixture } from '@aurelia/testing';

describe('2-runtime/ast.optional.spec.ts', function () {
  it('does not throw on optional call', function () {
    assert.doesNotThrow(() => createFixture('${text?.()}'));
  });
});
