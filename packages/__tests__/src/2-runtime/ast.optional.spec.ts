import { assert, createFixture } from '@aurelia/testing';

describe('2-runtime/ast.optional.spec.ts', function () {

  describe.only('non-strict mode', function () {
    it('[text] does not throw on access member', function () {
      assert.doesNotThrow(() => createFixture('${a.b}'));
    });

    it('[text] does not throw on access keyed', function () {
      assert.doesNotThrow(() => createFixture('${a[b]}'));
    });

    it('[text] does not throw on access keyed with literal', function () {
      assert.doesNotThrow(() => createFixture('${a[5]}'));
    });

    it('[text] does not throw on call scope with function missing', function () {
      assert.doesNotThrow(() => createFixture('${a()}'));
    });

    it('[text] does not throw on call member with object missing', function () {
      assert.doesNotThrow(() => createFixture('${a.b()}'));
    });

    it('[text] does not throw on optional call scope with missing function', function () {
      assert.doesNotThrow(() => createFixture('${a?.()}'));
    });

    it('[text] does not throw on optional call member with missing object', function () {
      assert.doesNotThrow(() => createFixture('${a.b?.()}', { a: {} }));
    });

    it('[event] does not throw on handler missing - call scope', function () {
      const { trigger } = createFixture('<div click.trigger="a()"></div>');

      assert.doesNotThrow(() => trigger.click('div'));
    });

    it('[event] does not throw on event handler missing - call member', function () {
      const { trigger } = createFixture('<div click.trigger="a.b()"></div>');

      assert.doesNotThrow(() => trigger.click('div'));
    });

    it('[event] does not throw on handler missing - call keyed', function () {
      const { trigger } = createFixture('<div click.trigger="a[`b`]()"></div>');

      assert.doesNotThrow(() => trigger.click('div'));
    });

    it('[event] does not throw on handler missing - complex expression', function () {
      const { trigger } = createFixture('<div click.trigger="(a ? b : c)()"></div>');

      assert.doesNotThrow(() => trigger.click('div'));
    });

    it('[text] renders empty string on undefined', function () {
      const { assertText } = createFixture('${a}', { a: undefined });

      assertText('');
    });

    it('[text] renders empty string on null', function () {
      const { assertText } = createFixture('${a}', { a: null });

      assertText('');
    });

    it('[text] works with ?? on missing prop', function () {
      const { assertText } = createFixture('${a ?? "b"}', { a: undefined });

      assertText('b');
    });

    it('[text] works with ?? on missing prop from access member', function () {
      const { assertText } = createFixture('${a.c ?? "b"}');

      assertText('b');
    });

    it('[text] works with ?? on missing prop from access keyed', function () {
      const { assertText } = createFixture('${a[c] ?? "b"}');

      assertText('b');
    });

    it('[text] works with ?? on null prop', function () {
      const { assertText } = createFixture('${a ?? "b"}', { a: null });

      assertText('b');
    });
  });

  describe('strict mode', function () {
    it('throws on access member', function () {
      assert.throws(() => createFixture('${a.b}'));
    });

    it('does not throw on access keyed', function () {
      assert.throws(() => createFixture('${a[b]}'));
    });

    it('does not throw on access keyed with literal', function () {
      assert.throws(() => createFixture('${a[5]}'));
    });

    it('throws on call scope with function missing', function () {
      assert.throws(() => createFixture('${a()}'));
    });

    it('throws on call member with obj missing', function () {
      assert.throws(() => createFixture('${a.b()}'));
    });

    it('does not throw on optional call scope with missing function', function () {
      assert.doesNotThrow(() => createFixture('${a?.()}'));
    });

    it('does not throw on optional call member with missing object', function () {
      assert.doesNotThrow(() => createFixture('${a.b?.()}', { a: {} }));
    });

    it('[trigger] throws on missing call scope fn', function () {
      const { trigger } = createFixture('<div click.trigger="a()"></div>');

      assert.throws(() => trigger.click('div'));
    });

    it('[trigger] throws on missing call member fn', function () {
      const { trigger } = createFixture('<div click.trigger="a.b()"></div>', { a: {} });

      assert.throws(() => trigger.click('div'));
    });

  });
});
