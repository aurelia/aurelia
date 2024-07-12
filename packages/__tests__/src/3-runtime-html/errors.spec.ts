import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/errors.spec.ts', function () {
  describe('AUR0113: ast_increment_infinite_loop', function () {
    it('prefix increment', async function () {
      assert.throws(() => createFixture('${++a}'), /AUR0113/);
    });

    it('postfix increment', async function () {
      assert.throws(() => createFixture('${a++}'), /AUR0113/);
    });

    it('assignment increment', async function () {
      assert.throws(() => createFixture('${a += 2}'), /AUR0113/);
    });

    it('assignment increment binary', async function () {
      // TODO: this should throw also
      assert.doesNotThrow(() => createFixture('${a = a + 2}'), /AUR0113/);
    });
  });
});
