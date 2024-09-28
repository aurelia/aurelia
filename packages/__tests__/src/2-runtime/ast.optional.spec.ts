import { Constructable } from '@aurelia/kernel';
import { customElement, IPlatform } from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

describe('2-runtime/ast.optional.spec.ts', function () {

  describe('non-strict mode', function () {
    it('[text] does not throw on access member', function () {
      assert.doesNotThrow(() => createFixture('${a.b}'));
    });

    it('[text] does not throw on access member - missing object + optional access', function () {
      assert.doesNotThrow(() => createFixture('${a?.b}'));
    });

    it('[text] does not throw on access keyed - misssing object', function () {
      assert.doesNotThrow(() => createFixture('${a[b]}'));
    });

    it('[text] does not throw on access keyed - missing object + optional access', function () {
      assert.doesNotThrow(() => createFixture('${a?.[b]}'));
    });

    it('[text] does not throw on access keyed - literal key', function () {
      assert.doesNotThrow(() => createFixture('${a[5]}'));
    });

    it('[text] does not throw on call scope - prop missing', function () {
      assert.doesNotThrow(() => createFixture('${a()}'));
    });

    it('[text] throws on call scope - prop not a fn', function () {
      assert.throws(() => createFixture('${a()}', { a: 5 }));
    });

    it('[text] does not throw on call member - object missing', function () {
      assert.doesNotThrow(() => createFixture('${a.b()}'));
    });

    it('[text] does not throw on call scope - optional call + missing function', function () {
      assert.doesNotThrow(() => createFixture('${a?.()}'));
    });

    it('[text] does not throw on call member - optional call + missing prop', function () {
      assert.doesNotThrow(() => createFixture('${a.b?.()}', { a: {} }));
    });

    it('[text] throws on optional call member - optional call + member is not a fn', function () {
      assert.throws(() => createFixture('${a.b?.()}', { a: { b: 5 } }));
    });

    it('[text] does not throw on call function - object missing', function () {
      assert.doesNotThrow(() => createFixture('${a[5]?.()}'));
    });

    it('[text] does not throw on call function - value is nullish', function () {
      assert.doesNotThrow(() => createFixture('${a[5]?.()}', { a: {} }));
    });

    it('[text] throws on call function - value is not a function', function () {
      assert.throws(() => createFixture('${a[5]?.()}', { a: { 5: 5 } }));
    });

    it('[event] does not throw on handler missing - call scope', function () {
      const { trigger } = createFixture('<div click.trigger="a()"></div>');

      trigger.click('div');
    });

    it('[event] does not throw on event handler missing - call member', function () {
      const { trigger } = createFixture('<div click.trigger="a.b()"></div>');

      trigger.click('div');
    });

    it('[event] throws on event handler not a fn - call member', function () {
      const { platform, trigger } = createFixture('<div click.trigger="a.b()"></div>', { a: { b: 5 } });

      let error: unknown;
      platform.window.addEventListener('au-event-error', function handler(e: CustomEvent<{ error: Error }>) {
        e.preventDefault();
        error = e.detail.error;
        platform.window.removeEventListener('au-event-error', handler);
      });

      trigger.click('div');
      assert.includes(String(error), 'AUR0111:');
    });

    it('[event] does not throw on handler missing - call keyed', function () {
      const { trigger } = createFixture('<div click.trigger="a[`b`]()"></div>');

      trigger.click('div');
    });

    it('[event] does not throw on handler missing - complex expression', function () {
      const { trigger } = createFixture('<div click.trigger="(a ? b : c)()"></div>');

      trigger.click('div');
    });

    it('[text] renders empty string on undefined', function () {
      const { assertText } = createFixture('${a}', { a: undefined });

      assertText('');
    });

    it('[text] renders empty string on null', function () {
      const { assertText } = createFixture('${a}', { a: null });

      assertText('');
    });

    it('[text] works with ?? on undefined prop - access scope', function () {
      const { assertText } = createFixture('${a ?? "b"}', { a: undefined });

      assertText('b');
    });

    it('[text] works with ?? on missing instance - access member', function () {
      const { assertText } = createFixture('${a.c ?? "b"}');

      assertText('b');
    });

    it('[text] works with ?? on missing instance - access keyed', function () {
      const { assertText } = createFixture('${a[c] ?? "b"}');

      assertText('b');
    });

    it('[text] works with ?? on null prop', function () {
      const { assertText } = createFixture('${a ?? "b"}', { a: null });

      assertText('b');
    });

    describe('assignment', function () {
      @customElement({ name: 'my-el', template: '', bindables: [{ name: 'value', mode: 'fromView' }] })
      class MyEl {
        public value: unknown;
      }

      it('assigns on access member assignment - missing scope', function () {
        const { component } = createFixture(
          '<my-el value.from-view="a.b" component.ref="el">',
          class App {
            // starts with an empty object to avoid error
            a = {};
            el: MyEl;
          },
          [MyEl]
        );

        component.a = null;
        component.el.value = 5;
        assert.deepStrictEqual(component.a, { b: 5 });
      });

      it('assigns on access member assignment - missing scope + optional', function () {
        const { component } = createFixture(
          '<my-el value.from-view="a?.b" component.ref="el">',
          class App {
            // starts with an empty object to avoid error
            a = {};
            el: MyEl;
          },
          [MyEl]
        );

        component.a = null;
        component.el.value = 5;
        assert.deepStrictEqual(component.a, { b: 5 });
      });

      it('throws on access keyed assignment - missing scope', function () {
        const { trigger, component } = createFixture('<button click.trigger="a[5] = 1">', class { a: unknown; });

        trigger.click('button');
        assert.deepStrictEqual(component.a, { 5: 1 });
      });
    });
  });

  describe('strict mode', function () {
    const createStrictFixture = <T>(template: string, component?: T | Constructable<T>, registrations: unknown[] = []) =>
      createFixture
        .html(template)
        .deps(...registrations)
        .component(component)
        .config({ strictBinding: true })
        .build();

    it('[text] throws on access member - object missing', function () {
      assert.throws(() => createStrictFixture('${a.b}'));
    });

    it('[text] does not throw on access member - object missing + optional', function () {
      assert.doesNotThrow(() => createStrictFixture('${a?.b}'));
    });

    it('[text] throws on access keyed - object missing', function () {
      assert.throws(() => createStrictFixture('${a[b]}'));
    });

    it('[text] does not throw on access keyed - object missing + optional', function () {
      assert.doesNotThrow(() => createStrictFixture('${a?.[b]}'));
    });

    it('[text] throws on access keyed - literal key - object missing', function () {
      assert.throws(() => createStrictFixture('${a[5]}'));
    });

    it('[text] throws on call scope - prop missing', function () {
      assert.throws(() => createStrictFixture('${a()}'));
    });

    it('[text] throws on call scope - prop nullish', function () {
      assert.throws(() => createStrictFixture('${a()}', { a: null }));
    });

    it('[text] throws on call scope - prop not a fn', function () {
      assert.throws(() => createStrictFixture('${a()}', { a: 5 }));
    });

    it('[text] does not throw on call scope - optional call + prop missing', function () {
      assert.doesNotThrow(() => createStrictFixture('${a?.()}'));
    });

    it('[text] throws on call scope - optional call + prop is not a fn', function () {
      assert.throws(() => createStrictFixture('${a?.()}', { a: 5 }));
    });

    it('[text] throws on call member - obj missing', function () {
      assert.throws(() => createStrictFixture('${a.b()}'));
    });

    it('[text] throws on call member - missing member', function () {
      assert.throws(() => createStrictFixture('${a.b()}', { a: {} }));
    });

    it('[text] throws on call member - member not a function', function () {
      assert.throws(() => createStrictFixture('${a.b()}', { a: { b: 5 } }));
    });

    it('[text] does not throw on call member - optional call + object missing', function () {
      assert.doesNotThrow(() => createStrictFixture('${a.b?.()}', { a: {} }));
    });

    it('[text] throws on optional call member - member not a fn', function () {
      assert.throws(() => createStrictFixture('${a.b?.()}', { a: { b: 5 } }));
    });

    it('[text] throws on call function - nullish fn', function () {
      assert.throws(() => createStrictFixture('${a[5]()}', { a: {  } }));
    });

    it('[text] does not throw on call function - optional call + nullish fn', function () {
      assert.doesNotThrow(() => createStrictFixture('${a[5]?.()}', { a: { 5: null } }));
    });

    it('[text] throws on call function - optional call + fn not a function', function () {
      assert.throws(() => createStrictFixture('${a[5]?.()}', { a: { 5: 5 } }));
    });

    it('[trigger] throws on missing call scope fn', function () {
      const { platform, trigger } = createStrictFixture('<div click.trigger="a()"></div>');

      let handled = false;
      platform.window.addEventListener('au-event-error', function handler(e) {
        e.preventDefault();
        handled = true;
        platform.window.removeEventListener('au-event-error', handler);
      });
      trigger.click('div');
      assert.strictEqual(handled, true);
    });

    it('[trigger] throws on missing call member fn', function () {
      const { platform, trigger } = createStrictFixture('<div click.trigger="a.b()"></div>', { a: {} });

      let handled = false;
      platform.window.addEventListener('au-event-error', function handler(e) {
        e.preventDefault();
        handled = true;
        platform.window.removeEventListener('au-event-error', handler);
      });

      trigger.click('div');
      assert.strictEqual(handled, true);
    });

    it('[trigger] throws on call member fn not a fn', function () {
      const { platform, trigger } = createStrictFixture('<div click.trigger="a.b()"></div>', { a: { b: 5 } });

      let error: unknown;
      platform.window.addEventListener('au-event-error', function handler(e: CustomEvent<{ error: Error }>) {
        e.preventDefault();
        error = e.detail.error;
        platform.window.removeEventListener('au-event-error', handler);
      });

      trigger.click('div');
      assert.includes(String(error), 'AUR0111:');
    });

    it('[trigger] throws on call member optional call - not a fn', function () {
      const { platform, trigger } = createStrictFixture('<div click.trigger="a.b?.()"></div>', { a: { b: 5 } });

      let error: unknown;
      handleAuEventError(platform, function (e) {
        error = e.detail.error;
      });

      trigger.click('div');
      assert.includes(String(error), 'AUR0111:');
    });

    describe('assignment', function () {
      @customElement({ name: 'my-el', template: '', bindables: [{ name: 'value', mode: 'fromView' }] })
      class MyEl {
        public value: unknown;
      }

      it('throws on access member assignment - missing scope', function () {
        const { component } = createStrictFixture(
          '<my-el value.from-view="a.b" component.ref="el">',
          class App {
            // starts with an empty object to avoid error
            a = {};
            el: MyEl;
          },
          [MyEl]
        );

        let i = 0;
        component.a = null;
        try {
          component.el.value = 5;
        } catch (error) {
          i = 1;
          assert.includes(String(error), 'AUR0114');
        }
        assert.strictEqual(i, 1);
      });

      it('throws on access member assignment - missing scope + optional', function () {
        // in the future when official JS supports optional chaining arrives, this won't throw
        const { component } = createStrictFixture(
          '<my-el value.from-view="a?.b" component.ref="el">',
          class App {
            // starts with an empty object to avoid error
            a = {};
            el: MyEl;
          },
          [MyEl]
        );

        let i = 0;
        component.a = null;
        try {
          component.el.value = 5;
        } catch (error) {
          i = 1;
          assert.includes(String(error), 'AUR0116');
        }
        assert.strictEqual(i, 1);
      });

      it('throws on access keyed assignment - missing scope', function () {
        const { platform, trigger } = createStrictFixture('<button click.trigger="a[5] = 1">');

        let error: unknown;
        handleAuEventError(platform, e => error = e.detail.error);

        trigger.click('button');
        assert.includes(String(error), 'AUR0116');
      });
    });
  });

  function handleAuEventError(platform: IPlatform, handler: (e: CustomEvent<{ error: Error }>) => void) {
    platform.window.addEventListener('au-event-error', function auEventErrorHandler(e: CustomEvent<{ error: Error }>) {
      e.preventDefault();
      handler(e);
      platform.window.removeEventListener('au-event-error', auEventErrorHandler);
    });
  }
});
