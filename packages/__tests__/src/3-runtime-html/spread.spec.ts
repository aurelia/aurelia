import { Constructable, resolve } from '@aurelia/kernel';
import { BindingMode, CustomAttribute, CustomElement, ICustomElementViewModel, INode, ValueConverter } from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/spread.spec.ts', function () {
  // all the tests are using a common <my-input/> with a spreat on its internal <input/>
  describe('...$attrs', function () {
    const $it = <T>(title: string, args: ISpreadTestCase<T>) => runTest(title, args, false);
    $it.only = <T>(title: string, args: ISpreadTestCase<T>) => runTest(title, args, true);
    // eslint-disable-next-line mocha/no-skipped-tests
    $it.todo = <T>(title: string, _args: ISpreadTestCase<T>) => it.skip(title);

    it('throws when using spread at the root level (no scope)', function () {
      assert.throws(() => createFixture('<div ...$attrs>'));
    });

    $it('works single layer of ...attrs', {
      template: '<my-input value.bind="message">',
      component: { message: 'Aurelia' },
      assertFn: ({ appHost }) => {
        assert.strictEqual(appHost.querySelector('input').value, 'Aurelia');
      },
    });

    $it('preserves attr syntaxes', {
      template: '<my-input value.bind="message">',
      component: { message: 'Aurelia' },
      assertFn: ({ ctx, component, appHost }) => {
        ctx.type(appHost, 'input', 'hello');
        assert.strictEqual(component.message, 'hello');
        component.message = 'Aurelia';
        ctx.platform.domWriteQueue.flush();
        assert.strictEqual(appHost.querySelector('input').value, 'Aurelia');
      },
    });

    $it('does not throw when capture: false', {
      template: '<no-capture-input value.bind="message">',
      component: { message: 'Aurelia' },
      assertFn: ({ appHost }) => {
        assert.strictEqual(appHost.querySelector('input').value, '');
      },
    });

    $it('does not throw when there are nothing to capture', {
      template: '<my-input>',
      component: { message: 'Aurelia' },
      assertFn: ({ appHost }) => {
        assert.strictEqual(appHost.querySelector('input').value, '');
      },
    });

    $it('works with pass-through ...$attrs', {
      template: '<input-field value.bind="message">',
      component: { message: 'Aurelia' },
      registrations: [
        CustomElement.define({
          name: 'input-field',
          template: '<my-input ...$attrs>',
          capture: true,
        }),
      ],
      assertFn: ({ platform, component, appHost }) => {
        assert.strictEqual(appHost.querySelector('input').value, 'Aurelia');
        component.message = 'hello';
        platform.domWriteQueue.flush();
        assert.strictEqual(appHost.querySelector('input').value, 'hello');
      },
    });

    $it('does not capture template controller', {
      template: '<my-input value.bind="message" if.bind="hasInput">',
      component: { hasInput: false, message: 'Aurelia' },
      assertFn: ({ appHost }) => {
        assert.html.innerEqual(appHost, '');
      },
    });

    $it('does not apture slot', {
      template: '<my-input slot="a" value.bind="message">',
      component: { hasInput: false, message: 'Aurelia' },
      assertFn: ({ appHost }) => {
        assert.notEqual(appHost.querySelector('my-input[slot="a"]'), null);
      },
    });

    $it('only captures attr based on filter function', {
      template: '<filter-capture-input class="abc">',
      component: { message: 'hello' },
      assertFn: ({ appHost }) => {
        assert.includes(appHost.querySelector('filter-capture-input').className, 'abc');
      }
    });

    // away to support this is to change `.class` binding command to an attr pattern
    // PART.class pattern -> class.bind="expression ? PART : ''"
    // this would make it work maybe more consistently with the rest of the class binding
    // same for style binding command
    $it.todo('works with binding command that results in filtered out attr', {
      template: '<filter-capture-input abc.class="hasClass">',
      component: { hasClass: true },
      assertFn: ({ appHost }) => {
        assert.includes(appHost.querySelector('filter-capture-input').className, 'abc');
      }
    });

    $it('spreads event bindings', {
      template: '<my-input value.to-view="message" change.trigger="message = $event.target.value" focus.trigger="focused = true">',
      component: { message: 'Aurelia', focused: false },
      assertFn: ({ ctx, component, appHost }) => {
        assert.strictEqual(appHost.querySelector('input').value, 'Aurelia');
        ctx.type(appHost, 'input', 'hello');
        assert.strictEqual(component.message, 'hello');
        appHost.querySelector('input').dispatchEvent(new ctx.CustomEvent('focus'));
        assert.strictEqual(component.focused, true);
      },
    });

    $it('spreads interpolation', {
      template: `<my-input value="\${message}">`,
      component: { message: 'Aurelia', focused: false },
      assertFn: ({ ctx, component, appHost }) => {
        assert.strictEqual(appHost.querySelector('input').value, 'Aurelia');
        ctx.type(appHost, 'input', 'hello');
        assert.strictEqual(component.message, 'Aurelia');
      },
    });

    $it('spreads plain class attribute', {
      template: '<my-input class="abc">',
      component: { message: 'Aurelia', focused: false },
      assertFn: ({ appHost }) => {
        assert.strictEqual(appHost.querySelector('input').className, 'abc');
      },
    });

    $it('spreads plain style attribute', {
      template: '<my-input style="display: block;">',
      component: { message: 'Aurelia', focused: false },
      assertFn: ({ appHost }) => {
        assert.strictEqual(appHost.querySelector('input').style.display, 'block');
      },
    });

    $it('spreads plain attributes', {
      template: '<my-input size="20" aria-label="input">',
      component: { message: 'Aurelia', focused: false },
      assertFn: ({ appHost }) => {
        assert.strictEqual(appHost.querySelector('input').size, 20);
        assert.strictEqual(appHost.querySelector('input').getAttribute('aria-label'), 'input');
      },
    });

    describe('custom attribute', function () {
      const MyAttr = CustomAttribute.define({ name: 'my-attr', bindables: ['value'] }, class {
        public static inject = [INode];
        public value: any;
        public constructor(private readonly host: HTMLElement) { }
        public binding() {
          this.host.setAttribute('size', this.value);
        }
      });

      $it('spreads custom attribute (with literal value)', {
        template: '<my-input my-attr="20">',
        component: { },
        registrations: [MyAttr],
        assertFn: ({ appHost }) => {
          assert.strictEqual(appHost.querySelector('input').getAttribute('size'), '20');
          assert.strictEqual(appHost.querySelector('my-input').getAttribute('size'), null);
        }
      });

      $it('spreads custom attribute (with interpolation)', {
        template: `<my-input my-attr="\${size}">`,
        component: { size: 20 },
        registrations: [MyAttr],
        assertFn: ({ appHost }) => {
          assert.strictEqual(appHost.querySelector('input').getAttribute('size'), '20');
          assert.strictEqual(appHost.querySelector('my-input').getAttribute('size'), null);
        }
      });

      $it('spreads custom attribute (primary binding syntax)', {
        template: '<my-input my-attr.bind="size">',
        component: { size: 20 },
        registrations: [MyAttr],
        assertFn: ({ appHost }) => {
          assert.strictEqual(appHost.querySelector('input').getAttribute('size'), '20');
          assert.strictEqual(appHost.querySelector('my-input').getAttribute('size'), null);
        }
      });

      $it('spreads custom attribute (multi binding syntax)', {
        template: '<my-input my-attr="value.bind: size">',
        component: { size: 20 },
        registrations: [MyAttr],
        assertFn: ({ appHost }) => {
          assert.strictEqual(appHost.querySelector('input').getAttribute('size'), '20');
          assert.strictEqual(appHost.querySelector('my-input').getAttribute('size'), null);
        }
      });
    });

    describe('custom element', function () {
      const testElements = [
        CustomElement.define({
          name: 'form-field',
          template: '<form-input ...$attrs>',
          capture: true,
        }),
        CustomElement.define({
          name: 'form-input',
          template: '<input value.bind="value">',
          bindables: {
            value: { mode: BindingMode.twoWay }
          }
        }),
      ];

      $it('spreads plain binding to custom element bindable', {
        template: '<form-field value="Aurelia">',
        component: {},
        registrations: testElements,
        assertFn: ({ appHost }) => {
          assert.notStrictEqual((appHost.querySelector('form-input') as any).value, 'Aurelia');
          assert.strictEqual(appHost.querySelector('input').value, 'Aurelia');
        },
      });

      $it('spreads binding to custom element bindables', {
        template: '<form-field value.bind="message">',
        component: { message: 'Aurelia' },
        registrations: testElements,
        assertFn: ({ appHost }) => {
          assert.notStrictEqual((appHost.querySelector('form-input') as any).value, 'Aurelia');
          assert.strictEqual(appHost.querySelector('input').value, 'Aurelia');
        },
      });

      $it('spreads interpolation to custom element bindables', {
        template: `<form-field value="\${message}">`,
        component: { message: 'Aurelia' },
        registrations: testElements,
        assertFn: ({ appHost }) => {
          assert.notStrictEqual((appHost.querySelector('form-input') as any).value, 'Aurelia');
          assert.strictEqual(appHost.querySelector('input').value, 'Aurelia');
        },
      });

      $it('spreads shorthand element bindable props', {
        template: '<form-field prop1.bind prop2.one-time prop3.to-view prop4.from-view>',
        component: { prop1: 'prop 1', prop2: 'prop 2', prop3: 'prop 3', prop4: 'prop 4' },
        registrations: [
          CustomElement.define({
            name: 'form-field',
            template: '<form-input ...$attrs>',
            capture: true,
          }),
          CustomElement.define({
            name: 'form-input',
            template: '<input value.bind="prop1">',
            bindables: ['prop1', 'prop2', 'prop3', 'prop4']
          }),
        ],
        assertFn: ({ component, appHost }) => {
          const formInput = CustomElement.for(appHost.querySelector('form-input')).viewModel as typeof component;
          assert.strictEqual(formInput.prop1, 'prop 1');
          assert.strictEqual(formInput.prop2, 'prop 2');
          assert.strictEqual(formInput.prop3, 'prop 3');
          assert.strictEqual(formInput.prop4, undefined);
          formInput.prop4 = 'prop 5';
          assert.strictEqual(component.prop4, 'prop 5');
        },
      });

      it('spreads custom attribute into custom element bindable', function () {
        const Child = CustomElement.define({ name: 'child', template: '${id}--${size}', bindables: ['id', 'size'] }, class Child {});
        const El = CustomElement.define({ name: 'el', template: '<child ...$attrs>', dependencies: [Child], capture: true }, class El {});
        const Size = CustomAttribute.define('size', class {
          host = resolve(INode) as HTMLElement;
          binding() {
            this.host.setAttribute('size', '1');
          }
        });

        const { assertHtml } = createFixture('<el id="1" size="2">', {}, [El, Size]);

        assertHtml('<el><child>1--2</child></el>');
      });
    });

    function runTest<T>(title: string, { template, assertFn, component, registrations }: ISpreadTestCase<T>, only?: boolean) {
      return (only ? it.only : it)(title, async function () {
        const fixture = createFixture(
          template,
          (typeof component === 'object'
            ? class { public constructor() { Object.assign(this, component); } }
            : component
          ) as Constructable<T extends Constructable<infer O> ? Constructable<O> : Constructable<T>>,
          [
            ...(registrations ?? []),
            CustomElement.define({
              name: 'my-input',
              template: '<input ...$attrs>',
              capture: true,
            }, class MyInput { }),
            CustomElement.define({
              name: 'no-capture-input',
              template: '<input ...$attrs>',
              capture: false,
            }, class NoCaptureInput { }),
            CustomElement.define({
              name: 'filter-capture-input',
              template: '<input ...$attrs>',
              capture: (attr) => attr !== 'class'
            }, class FilterCaptureInput {}),
          ],
        );
        const { startPromise, tearDown } = fixture;

        await startPromise;

        await assertFn(fixture as any);

        await tearDown();
      });
    }
    interface ISpreadTestCase<T> {
      component: Constructable<T> | T;
      template: string;
      registrations?: any[];
      assertFn(arg: ReturnType<typeof createFixture> & { component: ICustomElementViewModel & T }): void | Promise<void>;
    }
  });

  describe('...[any]', function () {
    const El = CustomElement.define({
      name: 'el',
      template: '${id}--${class}',
      bindables: ['id', 'class'],
    });

    it('throws when trying to using invalid spread', function () {
      assert.throws(() => createFixture('<div ...$bindables="">'));
      assert.throws(() => createFixture('<div $bindables.spread="">'));
      assert.throws(() => createFixture('<div ...$element="">'));
      assert.throws(() => createFixture('<div $element.spread="">'));
      assert.throws(() => createFixture('<div ...$blabla="">'));
      assert.throws(() => createFixture('<div $bindables="">'));
      assert.throws(() => createFixture('<div ...whatever="">'));
      assert.throws(() => createFixture('<div ...="">'));
    });

    it('spreads with ... syntax', function () {
      const { assertHtml, component, flush } = createFixture('<el repeat.for="item of items" ...item>', {
        items: [
          { id: 1, class: 'a' },
          { id: 2, class: 'b' },
        ]
      }, [El]);

      assertHtml('<el>1--a</el><el>2--b</el>', { compact: true });

      component.items[0].id = 3;
      flush();
      assertHtml('<el>3--a</el><el>2--b</el>', { compact: true });
    });

    it('does not throw when expression returns null/undefined', function () {
      assert.doesNotThrow(() => createFixture('<el ...null $bindables.spread="null" ...$bindables="null">', {}, [El]));
    });

    it('does not throw when expression returns a primitive', function () {
      assert.doesNotThrow(() => createFixture('<el $bindables.spread="1" ...$bindables="1" ...1>', {}, [El]));
    });

    it('does not affect non bindable properties', function () {
      const { assertHtml, component, flush } = createFixture('<el repeat.for="item of items" ...item>', {
        items: [
          { id: 1, class: 'a', prop: 'alien' },
          { id: 2, class: 'b', prop: 'alien' },
        ]
      }, [CustomElement.define({ name: 'el', template: '${id}--${class}--${prop}', bindables: ['id', 'class'] }, class { prop = '1'; })]);

      assertHtml('<el>1--a--1</el><el>2--b--1</el>', { compact: true });

      component.items[0].id = 3;
      flush();
      assertHtml('<el>3--a--1</el><el>2--b--1</el>', { compact: true });
    });

    it('does not try to match attribute config of a bindable', function () {
      const { assertHtml } = createFixture('<el repeat.for="item of items" ...item>', {
        items: [
          { 'my-id': 1, class: 'a' },
          { 'my-id': 2, class: 'b' },
        ]
      }, [CustomElement.define({
        name: 'el',
        template: '${id}--${class}',
        bindables: [ { name: 'id', attribute: 'my-id' }, 'class'] })]);

      assertHtml('<el>--a</el><el>--b</el>', { compact: true });
    });

    it('does not create more binding than what is available in the object', function () {
      const { assertHtml, component, flush } = createFixture('<el ...$bindables="item">', {
        item: { id: 1 } as any,
      }, [El]);

      assertHtml('<el>1--</el>');

      component.item.class = 'a';
      flush();
      assertHtml('<el>1--</el>');

      component.item = { id: 1, class: 'a' };
      assertHtml('<el>1--</el>');
      flush();
      assertHtml('<el>1--a</el>');
    });

    it('stops observing when unbound', function () {
      const { assertHtml, component, stop, flush, getBy } = createFixture('<el ...$bindables="item">', {
        item: { id: 1 } as any,
      }, [El]);

      assertHtml('<el>1--</el>');
      const el = getBy('el');
      void stop();
      component.item.id = 2;
      flush();
      assert.html.innerEqual(el, '');
    });

    it('stops observing when given a new object with fewer properties', function () {
      const { assertHtml, component, flush } = createFixture('<el ...item>', {
        item: { id: 1, class: 'a' } as any,
      }, [El]);

      assertHtml('<el>1--a</el>');
      component.item = { id: 2 };
      flush();
      // --a is because content binding does not remove the old value
      // but the next assertion will make sure this is not observed
      assertHtml('<el>2--a</el>');
      component.item.class = 'b';
      flush();
      assertHtml('<el>2--a</el>');
    });

    it('ignores usage of $bindables without command', function () {
      const { assertHtml } = createFixture('<el $bindables="item">', {
        item: { id: 1, class: 'a' },
      }, [El]);

      assertHtml('<el>--</el>');
    });

    it('spreads with literal object expression', function () {
      const { assertHtml, component, flush } = createFixture('<el repeat.for="item of items" ...$bindables="{ id: item.id, class: item.class }">', {
        items: [
          { id: 1, class: 'a' },
          { id: 2, class: 'b' }
        ]
      }, [El]);

      assertHtml('<el>1--a</el><el>2--b</el>', { compact: true });

      component.items[0].id = 3;
      flush();
      assertHtml('<el>3--a</el><el>2--b</el>', { compact: true });
    });

    it('spreads with ...$bindables= syntax', function () {
      const { assertHtml, component, flush } = createFixture('<el repeat.for="item of items" ...$bindables="item">', {
        items: [
          { id: 1, class: 'a' },
          { id: 2, class: 'b' },
        ]
      }, [El]);

      assertHtml('<el>1--a</el><el>2--b</el>', { compact: true });

      component.items[0].id = 3;
      flush();
      assertHtml('<el>3--a</el><el>2--b</el>', { compact: true });
    });

    it('spreads with $bindables.spread= syntax', function () {
      const { assertHtml } = createFixture('<el repeat.for="item of items" $bindables.spread="item">', {
        items: [
          { id: 1, class: 'a' },
          { id: 2, class: 'b' },
        ]
      }, [El]);

      assertHtml('<el>1--a</el><el>2--b</el>', { compact: true });
    });

    it('creates binding in the order in the template (before)', function () {
      const { assertHtml } = createFixture('<el id.bind="3" ...item>', {
        item: { id: 1, class: 'a' },
      }, [El]);

      assertHtml('<el>1--a</el>');
    });

    it('creates binding in the order in the template (after)', function () {
      const { assertHtml } = createFixture('<el ...item id.bind="3">', {
        item: { id: 1, class: 'a' },
      }, [El]);

      assertHtml('<el>3--a</el>');
    });

    it('spreads with member access expression using shorthand syntax', function () {
      const { assertHtml } = createFixture('<el repeat.for="item of items" ...item.details>', {
        items: [
          { details: { id: 1, class: 'a' } },
          { details: { id: 2, class: 'b' } },
        ]
      }, [El]);

      assertHtml('<el>1--a</el><el>2--b</el>', { compact: true });
    });

    it('spreads with keyed access expression using shorthand syntax', function () {
      const { assertHtml } = createFixture('<el ...items[0].details>', {
        items: [
          { details: { id: 1, class: 'a' } },
          { details: { id: 2, class: 'b' } },
        ]
      }, [El]);

      assertHtml('<el>1--a</el>');
    });

    it('works with collection mutation', function () {
      const { assertHtml, component, flush } = createFixture('<el ...items[0].details>', {
        items: [
          { details: { id: 1, class: 'a' } },
          { details: { id: 2, class: 'b' } },
        ]
      }, [El]);

      assertHtml('<el>1--a</el>');
      component.items.push({ details: { id: 3, class: 'c' } });
      flush();
      assertHtml('<el>1--a</el>');
    });

    it('cannot be transferred by ...$attrs', function () {
      const ElWithAttrs = CustomElement.define({
        name: 'el-with-attrs',
        template: '<el ...$attrs>',
        bindables: ['id', 'class'],
        capture: true,
      });

      const { assertHtml } = createFixture('<el-with-attrs ...item>', { item: { id: 1, class: 'a' } }, [El, ElWithAttrs]);
      assertHtml('<el-with-attrs><el>--</el></el-with-attrs>');
    });

    it('does not cause child property bindings to be bound again when the new evaluation returns the same object', function () {
      let id = 0;
      let idCount = 0;
      let classValue = 'a';
      let classCount = 0;
      const El = CustomElement.define({ name: 'el', template: '${id}--${class}', bindables: ['id', 'class'] }, class {
        get id() {
          return id;
        }
        set id(v) {
          idCount++;
          id = v;
        }
        get class() {
          return classValue;
        }
        set class(v) {
          classCount++;
          classValue = v;
        }
      });
      const { assertHtml, component, flush } = createFixture('<el ...$bindables="item | move:i">', {
        i: 0,
        item: { id: 1, class: 'a' },
      }, [El, ValueConverter.define('move', class { })]);

      assert.strictEqual(idCount, 1);
      assert.strictEqual(classCount, 1);

      component.i = 1;
      flush();
      // when child bindings of a spread binding are not re-bound, the count should not increase
      assert.strictEqual(idCount, 1);
      assert.strictEqual(classCount, 1);
      assertHtml('<el>1--a</el>');
    });

    it('works with $attr when used before ...$attrs on the same element', function () {
      const ElWithAttrs = CustomElement.define({
        name: 'el-with-attrs',
        template: '<el ...item ...$attrs>',
        capture: true,
      }, class {
        item = { id: 4, class: 'b' };
      });

      const { assertHtml } = createFixture('<el-with-attrs id.bind="item.id">', { item: { id: 1, class: 'a' } }, [El, ElWithAttrs]);
      // note: it's 1-- not because ...item is used before ...$attrs
      // but it's actually a limitation, as ...item is processed before ...$attrs
      assertHtml('<el-with-attrs><el>1--b</el></el-with-attrs>');
    });

    it('works with $attr when used after $attrs on the same element', function () {
      const ElWithAttrs = CustomElement.define({
        name: 'el-with-attrs',
        template: '<el ...$attrs ...item>',
        capture: true,
      }, class {
        item = { id: 4, class: 'b' };
      });

      const { assertHtml } = createFixture('<el-with-attrs id.bind="item.id">', { item: { id: 1, class: 'a' } }, [El, ElWithAttrs]);
      // note: it's not the id from item, but from the transferred ...$attrs instead
      // this is a limitation as ...item is processed before ...$attrs
      assertHtml('<el-with-attrs><el>1--b</el></el-with-attrs>');
    });
  });
});
