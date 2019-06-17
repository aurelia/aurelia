import { ILifecycle, LifecycleFlags } from '@aurelia/runtime';
import {
  AttributeNSAccessor,
  ClassAttributeAccessor,
  DataAttributeAccessor,
  StyleAttributeAccessor
} from '@aurelia/runtime-html';
import { CSS_PROPERTIES, globalAttributeNames, HTMLTestContext, TestContext, assert, createSpy } from '@aurelia/testing';

function createSvgUseElement(ctx: HTMLTestContext, name: string, value: string) {
  return ctx.createElementFromMarkup(`<svg>
  <defs>
    <g id="shape1">
      <rect x="50" y="50" width="50" height="50" />
    </g>
    <g id="shape2">
      <circle cx="50" cy="50" r="50" />
    </g>
  </defs>
  <use xlink:${name}="${value}" x="50" y="50" foo:bar="baz" />
</svg>`).lastElementChild;
}

function setup() {
  const ctx = TestContext.createHTMLTestContext();
  const { container, lifecycle, observerLocator } = ctx;

  return { ctx, container, lifecycle, observerLocator };
}

describe('AttributeNSAccessor', function () {
  let sut: AttributeNSAccessor;
  let el: HTMLElement;
  let lifecycle: ILifecycle;

  const tests = [
    { name: 'href', value: '#shape1' },
    { name: 'href', value: '#shape2' },
    { name: 'title', value: 'shape1' },
    { name: 'title', value: 'shape2' },
    { name: 'show', value: 'true' },
    { name: 'show', value: 'false' }
  ];

  describe('getValue()', function () {
    for (const { name, value } of tests) {
      it(`returns ${value} for xlink:${name}`, function () {
        const { ctx, lifecycle: $lifecycle } = setup();
        lifecycle = $lifecycle;
        el = createSvgUseElement(ctx, name, value) as HTMLElement;
        sut = new AttributeNSAccessor(lifecycle, el, name, 'http://www.w3.org/1999/xlink');

        let actual = sut.getValue();
        assert.strictEqual(actual, null, `actual`);

        sut.bind(LifecycleFlags.none);
        actual = sut.getValue();
        assert.strictEqual(actual, value, `actual`);

        sut.unbind(LifecycleFlags.none);
      });
    }
  });

  describe('setValue() with flags.none', function () {
    for (const { name, value } of tests) {
      it(`sets xlink:${name} only after flushing RAF`, function () {
        const ctx = TestContext.createHTMLTestContext();
        el = createSvgUseElement(ctx, name, value) as HTMLElement;
        const { lifecycle: $lifecycle } = setup();
        lifecycle = $lifecycle;
        sut = new AttributeNSAccessor(lifecycle, el, name, 'http://www.w3.org/1999/xlink');

        sut.bind(LifecycleFlags.none);
        sut.setValue('foo', LifecycleFlags.none);
        assert.strictEqual(sut.getValue(), 'foo', `sut.getValue()`);
        assert.strictEqual(el.getAttributeNS(sut.namespace, sut.propertyKey), value, `el.getAttributeNS(sut.namespace, sut.propertyKey) before flush`);

        lifecycle.processRAFQueue(LifecycleFlags.none);
        assert.strictEqual(el.getAttributeNS(sut.namespace, sut.propertyKey), 'foo', `el.getAttributeNS(sut.namespace, sut.propertyKey) after flush`);

        sut.unbind(LifecycleFlags.none);
      });
    }
  });

  describe('setValue() with flags.fromBind', function () {
    for (const { name, value } of tests) {
      it(`sets xlink:${name} immediately`, function () {
        const ctx = TestContext.createHTMLTestContext();
        el = createSvgUseElement(ctx, name, value) as HTMLElement;
        const { lifecycle: $lifecycle } = setup();
        lifecycle = $lifecycle;
        sut = new AttributeNSAccessor(lifecycle, el, name, 'http://www.w3.org/1999/xlink');

        sut.bind(LifecycleFlags.none);
        sut.setValue('foo', LifecycleFlags.fromBind);
        assert.strictEqual(sut.getValue(), 'foo', `sut.getValue()`);
        assert.strictEqual(el.getAttributeNS(sut.namespace, sut.propertyKey), 'foo', `el.getAttributeNS(sut.namespace, sut.propertyKey) before flush`);

        sut.unbind(LifecycleFlags.none);
      });
    }
  });

});

describe('DataAttributeAccessor', function () {
  let sut: DataAttributeAccessor;
  let el: HTMLElement;
  let lifecycle: ILifecycle;

  const valueArr = [undefined, null, '', 'foo'];
  describe('getValue()', function () {
    for (const name of globalAttributeNames) {
      for (const value of valueArr.filter(v => v != null)) {
        it(`returns "${value}" for attribute "${name}"`, function () {
          const ctx = TestContext.createHTMLTestContext();
          el = ctx.createElementFromMarkup(`<div ${name}="${value}"></div>`);
          const { lifecycle: $lifecycle } = setup();
          lifecycle = $lifecycle;
          sut = new DataAttributeAccessor(lifecycle, el, name);

          let actual = sut.getValue();
          assert.strictEqual(actual, null, `actual`);

          sut.bind(LifecycleFlags.none);
          actual = sut.getValue();
          assert.strictEqual(actual, value, `actual`);

          sut.unbind(LifecycleFlags.none);
        });
      }
    }
  });

  describe('setValue() with flags.none', function () {
    for (const name of globalAttributeNames) {
      for (const value of valueArr) {
        it(`sets attribute "${name}" to "${value}" only after flushing RAF`, function () {
          const ctx = TestContext.createHTMLTestContext();
          el = ctx.createElementFromMarkup(`<div></div>`);
          const { lifecycle: $lifecycle } = setup();
          lifecycle = $lifecycle;
          const expected = value != null ? `<div ${name}="${value}"></div>` : '<div></div>';
          sut = new DataAttributeAccessor(lifecycle, el, name);

          sut.bind(LifecycleFlags.none);
          sut.setValue(value, LifecycleFlags.none);
          assert.strictEqual(sut.getValue(), value, `sut.getValue()`);
          assert.strictEqual(el.outerHTML, '<div></div>', `el.outerHTML before flush`);

          lifecycle.processRAFQueue(LifecycleFlags.none);
          assert.strictEqual(el.outerHTML, expected, `el.outerHTML after flush`);

          sut.unbind(LifecycleFlags.none);
        });
      }
    }
  });

  describe('setValue() with flags.fromBind', function () {
    for (const name of globalAttributeNames) {
      for (const value of valueArr) {
        it(`sets attribute "${name}" to "${value}" immediately`, function () {
          const ctx = TestContext.createHTMLTestContext();
          el = ctx.createElementFromMarkup(`<div></div>`);
          const { lifecycle: $lifecycle } = setup();
          lifecycle = $lifecycle;
          const expected = value != null ? `<div ${name}="${value}"></div>` : '<div></div>';
          sut = new DataAttributeAccessor(lifecycle, el, name);

          sut.bind(LifecycleFlags.none);
          sut.setValue(value, LifecycleFlags.fromBind);
          assert.strictEqual(sut.getValue(), value, `sut.getValue()`);
          assert.strictEqual(el.outerHTML, expected, `el.outerHTML before flush`);

          sut.unbind(LifecycleFlags.none);
        });
      }
    }
  });
});

describe('StyleAccessor', function () {
  const propNames = Object.getOwnPropertyNames(CSS_PROPERTIES);

  let sut: StyleAttributeAccessor;
  let el: HTMLElement;
  let lifecycle: ILifecycle;

  // TODO: this is just quick-n-dirty; remove redundant tests and add missing tests
  for (const propName of propNames) {
    const values = CSS_PROPERTIES[propName]['values'];
    const value = values[0];
    const rule = `${propName}:${value}`;
    it(`setValue - style="${rule}" flags.none`, function () {
      const ctx = TestContext.createHTMLTestContext();
      el = ctx.createElementFromMarkup('<div></div>');
      const { lifecycle: $lifecycle } = setup();
      lifecycle = $lifecycle;
      sut = new StyleAttributeAccessor(lifecycle, el);
      const setPropertySpy = createSpy(sut, 'setProperty', true);

      sut.bind(LifecycleFlags.none);
      sut.setValue(rule, LifecycleFlags.none);
      assert.deepStrictEqual(
        setPropertySpy.calls,
        [],
        `setPropertySpy.calls`,
      );

      lifecycle.processRAFQueue(LifecycleFlags.none);
      assert.deepStrictEqual(
        setPropertySpy.calls,
        [
          [propName, value],
        ],
        `setPropertySpy.calls`,
      );

      sut.unbind(LifecycleFlags.none);
    });
  }

  for (const propName of propNames) {
    const values = CSS_PROPERTIES[propName]['values'];
    const value = values[0];
    const rule = `${propName}:${value}`;
    it(`setValue - style="${rule}" flags.fromBind`, function () {
      const ctx = TestContext.createHTMLTestContext();
      el = ctx.createElementFromMarkup('<div></div>');
      const { lifecycle: $lifecycle } = setup();
      lifecycle = $lifecycle;
      sut = new StyleAttributeAccessor(lifecycle, el);
      const setPropertySpy = createSpy(sut, 'setProperty', true);

      sut.bind(LifecycleFlags.none);
      sut.setValue(rule, LifecycleFlags.fromBind);
      assert.deepStrictEqual(
        setPropertySpy.calls,
        [
          [propName, value],
        ],
        `setPropertySpy.calls`,
      );

      sut.unbind(LifecycleFlags.none);
    });
  }

  it(`getValue - style="display: block;"`, function () {
    const ctx = TestContext.createHTMLTestContext();
    el = ctx.createElementFromMarkup(`<div style="display: block;"></div>`);
    const { lifecycle: $lifecycle } = setup();
    lifecycle = $lifecycle;
    sut = new StyleAttributeAccessor(lifecycle, el);

    const actual = sut.getValue();
    assert.strictEqual(actual, 'display: block;', `actual`);
  });
});

describe('ClassAccessor', function () {
  const markupArr = [
    '<div></div>',
    '<div class=""></div>',
    '<div class="foo"></div>',
    '<div class="foo bar baz"></div>'
  ];
  const classListArr = ['', 'foo', 'foo bar', 'bar baz', 'qux', 'bar qux', 'qux quux'];
  const secondClassListArr = ['', 'fooo'];
  for (const markup of markupArr) {
    for (const classList of classListArr) {

      function setup() {
        const ctx = TestContext.createHTMLTestContext();
        const el = ctx.createElementFromMarkup(markup);
        const initialClassList = el.classList.toString();
        const { lifecycle } = ctx;
        const sut = new ClassAttributeAccessor(lifecycle, el);
        sut.bind(LifecycleFlags.none);

        function tearDown() {
          lifecycle.processRAFQueue(LifecycleFlags.none);
          sut.unbind(LifecycleFlags.none);
        }

        return { sut, el, initialClassList, lifecycle, tearDown };
      }

      describe('with flags.none', function () {

        it(`setValue("${classList}") updates ${markup} flags.none`, function () {
          const { sut, el, initialClassList, lifecycle, tearDown } = setup();

          sut.setValue(classList, LifecycleFlags.none);

          assert.strictEqual(el.classList.toString(), initialClassList, `el.classList.toString() === initialClassList`);

          lifecycle.processRAFQueue(LifecycleFlags.none);

          const updatedClassList = el.classList.toString();
          for (const cls of initialClassList.split(' ')) {
            assert.includes(updatedClassList, cls, `updatedClassList includes class from initialClassList "${initialClassList}"`);
          }
          for (const cls of classList.split(' ')) {
            assert.includes(updatedClassList, cls, `updatedClassList includes class from classList "${classList}"`);
          }

          tearDown();
        });

        for (const secondClassList of secondClassListArr) {
          it(`setValue("${secondClassList}") updates already-updated ${markup} flags.none`, function () {
            const { sut, el, initialClassList, lifecycle, tearDown } = setup();

            sut.setValue(classList, LifecycleFlags.none);

            lifecycle.processRAFQueue(LifecycleFlags.none);

            const updatedClassList = el.classList.toString();

            sut.setValue(secondClassList, LifecycleFlags.none);
            assert.strictEqual(el.classList.toString(), updatedClassList, `el.classList.toString()`);

            lifecycle.processRAFQueue(LifecycleFlags.none);

            const secondUpdatedClassList = el.classList.toString();
            for (const cls of initialClassList.split(' ')) {
              if (!classList.includes(cls)) {
                assert.includes(secondUpdatedClassList, cls, `secondUpdatedClassList includes class from initialClassList "${initialClassList}" (except classes from classList "${classList}")`);
              }
            }
            for (const cls of secondClassList.split(' ')) {
              assert.includes(secondUpdatedClassList, cls, `secondUpdatedClassList includes class from secondClassList "${secondClassList}"`);
            }

            tearDown();
          });
        }
      });

      describe('with flags.fromBind', function () {
        it(`setValue("${classList}") updates ${markup} flags.fromBind`, function () {
          const { sut, el, initialClassList, lifecycle, tearDown } = setup();

          sut.setValue(classList, LifecycleFlags.fromBind);

          const updatedClassList = el.classList.toString();
          for (const cls of initialClassList.split(' ')) {
            assert.includes(updatedClassList, cls, `updatedClassList includes class from initialClassList "${initialClassList}"`);
          }
          for (const cls of classList.split(' ')) {
            assert.includes(updatedClassList, cls, `updatedClassList includes class from classList "${classList}"`);
          }

          tearDown();
        });

        for (const secondClassList of secondClassListArr) {
          it(`setValue("${secondClassList}") updates already-updated ${markup} flags.fromBind`, function () {
            const { sut, el, initialClassList, lifecycle, tearDown } = setup();

            sut.setValue(classList, LifecycleFlags.fromBind);

            sut.setValue(secondClassList, LifecycleFlags.fromBind);

            const secondUpdatedClassList = el.classList.toString();
            for (const cls of initialClassList.split(' ')) {
              if (!classList.includes(cls)) {
                assert.includes(secondUpdatedClassList, cls, `secondUpdatedClassList includes class from initialClassList "${initialClassList}" (except classes from classList "${classList}")`);
              }
            }
            for (const cls of secondClassList.split(' ')) {
              assert.includes(secondUpdatedClassList, cls, `secondUpdatedClassList includes class from secondClassList "${secondClassList}"`);
            }

            tearDown();
          });
        }
      });
    }
  }
});
