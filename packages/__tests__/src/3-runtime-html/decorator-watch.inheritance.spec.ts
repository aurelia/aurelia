import { tasksSettled } from '@aurelia/runtime';
import {
  CustomAttribute,
  customAttribute,
  CustomElement,
  customElement,
  watch,
  Watch,
} from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

// https://github.com/aurelia/aurelia/issues/2576
describe('3-runtime-html/decorator-watch.inheritance.spec.ts', function () {
  describe('definitions', function () {
    it('inherits method @watch from a base custom element without instantiating either class', function () {
      @customElement({ name: 'ce-base', template: '' })
      class CeBase { @watch('x.y') h(_v: unknown) {/*  */} }

      @customElement({ name: 'ce-derived', template: '' })
      class CeDerived extends CeBase {}

      assert.strictEqual(CustomElement.getDefinition(CeBase).watches.length, 1);
      assert.strictEqual(CustomElement.getDefinition(CeDerived).watches.length, 1);
      assert.strictEqual(CustomElement.getDefinition(CeDerived).watches[0], CustomElement.getDefinition(CeBase).watches[0]);
    });

    it('registers a plain base class method @watch for every subclass, regardless of instantiation order', function () {
      class Base { @watch('a.b') h(_v: unknown) {/*  */} }

      @customElement({ name: 'sub-1', template: '' })
      class Sub1 extends Base {}
      @customElement({ name: 'sub-2', template: '' })
      class Sub2 extends Base {}

      new Sub2();
      new Sub1();
      new Sub2();

      assert.strictEqual(Watch.getDefinitions(Base).length, 1);
      assert.strictEqual(CustomElement.getDefinition(Sub1).watches.length, 1);
      assert.strictEqual(CustomElement.getDefinition(Sub2).watches.length, 1);
    });

    it('orders base class watches before subclass watches', function () {
      class Base { @watch('base') h(_v: unknown) {/*  */} }
      @watch('sub.cls', 'h')
      class Sub extends Base { @watch('sub.method') i(_v: unknown) {/*  */} }

      assert.deepStrictEqual(Watch.getDefinitions(Sub).map(w => w.expression), ['base', 'sub.method', 'sub.cls']);
      assert.deepStrictEqual(Watch.getDefinitions(Base).map(w => w.expression), ['base']);
    });

    it('includes watches added via Watch.add on a base class', function () {
      class Base {}
      class Sub extends Base {}
      Watch.add(Base, { expression: 'a', callback: () => {/*  */}, flush: 'async' });

      assert.strictEqual(Watch.getDefinitions(Sub).length, 1);
    });

    for (const order of ['@customElement first', '@watch first']) {
      it(`does not leak a class @watch on a subclass into the base definition (${order})`, function () {
        @customElement({ name: `leak-base-${order.length}`, template: '' })
        class Base { other(_v: unknown) {/*  */} }

        let Sub: typeof Base;
        if (order === '@customElement first') {
          @customElement({ name: `leak-sub-${order.length}`, template: '' })
          @watch('own.e', 'other')
          class $Sub extends Base {}
          Sub = $Sub;
        } else {
          @watch('own.e', 'other')
          @customElement({ name: `leak-sub-${order.length}`, template: '' })
          class $Sub extends Base {}
          Sub = $Sub;
        }

        assert.strictEqual(CustomElement.getDefinition(Base).watches.length, 0);
        assert.strictEqual(CustomElement.getDefinition(Sub).watches.length, 1);
      });
    }

    it('does not leak a method @watch on a subclass without its own definition into the base definition', function () {
      @customElement({ name: 'leak-base-m', template: '' })
      class Base {}
      class Sub extends Base { @watch('a') h(_v: unknown) {/*  */} }

      new Sub();

      assert.strictEqual(CustomElement.getDefinition(Base).watches.length, 0);
      assert.strictEqual(Watch.getDefinitions(Sub).length, 1);
    });

    it('inherits method @watch from a base custom attribute', function () {
      @customAttribute('ca-base')
      class CaBase { @watch('a') h(_v: unknown) {/*  */} }
      @customAttribute('ca-derived')
      class CaDerived extends CaBase {}

      assert.strictEqual(CustomAttribute.getDefinition(CaBase).watches.length, 1);
      assert.strictEqual(CustomAttribute.getDefinition(CaDerived).watches.length, 1);
    });

    it('keeps method @watch definitions after a definition is cleared and recreated', function () {
      @customElement({ name: 'clear-me', template: '' })
      class ClearMe { @watch('a') h(_v: unknown) {/*  */} }
      new ClearMe();

      CustomElement.clearDefinition(ClearMe);
      CustomElement.define({ name: 'clear-me', template: '' }, ClearMe);

      assert.strictEqual(CustomElement.getDefinition(ClearMe).watches.length, 1);
    });
  });

  describe('rendering', function () {
    for (const order of [['base', 'derived'], ['derived', 'base']]) {
      it(`fires a base class watch in both base and derived elements (rendered ${order.join(', ')})`, async function () {
        const calls: string[] = [];
        @customElement({ name: 'w-base', template: '' })
        class WBase {
          v = 1;
          @watch('v')
          h(n: number) { calls.push(`${this.constructor.name}:${n}`); }
        }
        @customElement({ name: 'w-derived', template: '' })
        class WDerived extends WBase {}

        const { component, stop } = await createFixture(
          order.map(o => `<w-${o} component.ref="${o}"></w-${o}>`).join(''),
          class { base: WBase; derived: WDerived; },
          [WBase, WDerived],
        ).started;

        component.base.v = 2;
        component.derived.v = 3;
        await tasksSettled();

        assert.deepStrictEqual(calls.sort(), ['WBase:2', 'WDerived:3']);
        await stop(true);
      });
    }

    it('hydrates a base element whose subclass declares a class @watch with a subclass-only callback', async function () {
      @customElement({ name: 'cb-base', template: 'base' })
      class CbBase {}
      @customElement({ name: 'cb-sub', template: 'sub' })
      @watch('own', 'onlyOnSub')
      class CbSub extends CbBase { own = 1; onlyOnSub() {/*  */} }

      const { assertText, stop } = await createFixture('<cb-base></cb-base>|<cb-sub></cb-sub>', class {}, [CbBase, CbSub]).started;
      assertText('base|sub');
      await stop(true);
    });

    it('fires a subclass method @watch when the subclass has no definition of its own', async function () {
      const calls: string[] = [];
      @customElement({ name: 'own-base', template: '' })
      class OwnBase {
        v = 1;
        @watch('v')
        base(n: number) { calls.push(`base:${this.constructor.name}:${n}`); }
      }
      let sub: OwnSub;
      class OwnSub extends OwnBase {
        constructor() {
          super();
          sub = this;
        }

        @watch('v')
        sub(n: number) { calls.push(`sub:${this.constructor.name}:${n}`); }
      }

      const { component, stop } = await createFixture(
        '<au-compose component.bind="Sub"></au-compose><own-base component.ref="base"></own-base>',
        class { Sub = OwnSub; base: OwnBase; },
        [OwnBase],
      ).started;

      sub!.v = 2;
      component.base.v = 3;
      await tasksSettled();

      assert.deepStrictEqual(calls.sort(), ['base:OwnBase:3', 'base:OwnSub:2', 'sub:OwnSub:2']);
      await stop(true);
    });
  });
});
