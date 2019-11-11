import { IScheduler, LifecycleFlags } from '@aurelia/runtime';
import {
  AttributeNSAccessor,
  ClassAttributeAccessor,
  DataAttributeAccessor,
  StyleAttributeAccessor
} from '@aurelia/runtime-html';
import { assert, createSpy, CSS_PROPERTIES, globalAttributeNames, HTMLTestContext, TestContext } from '@aurelia/testing';

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
  const { container, scheduler, observerLocator } = ctx;

  return { ctx, container, scheduler, observerLocator };
}

describe('AttributeNSAccessor', function () {
  let sut: AttributeNSAccessor;
  let el: HTMLElement;
  let scheduler: IScheduler;

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
        const { ctx, scheduler: $scheduler } = setup();
        scheduler = $scheduler;
        el = createSvgUseElement(ctx, name, value) as HTMLElement;
        sut = new AttributeNSAccessor(scheduler, LifecycleFlags.none, el, name, 'http://www.w3.org/1999/xlink');

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
        const { scheduler: $scheduler } = setup();
        scheduler = $scheduler;
        sut = new AttributeNSAccessor(scheduler, LifecycleFlags.none, el, name, 'http://www.w3.org/1999/xlink');

        sut.bind(LifecycleFlags.none);
        sut.setValue('foo', LifecycleFlags.none);
        assert.strictEqual(sut.getValue(), 'foo', `sut.getValue()`);
        assert.strictEqual(el.getAttributeNS(sut.namespace, sut.propertyKey), value, `el.getAttributeNS(sut.namespace, sut.propertyKey) before flush`);

        scheduler.getRenderTaskQueue().flush();
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
        const { scheduler: $scheduler } = setup();
        scheduler = $scheduler;
        sut = new AttributeNSAccessor(scheduler, LifecycleFlags.none, el, name, 'http://www.w3.org/1999/xlink');

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
  let scheduler: IScheduler;

  const valueArr = [undefined, null, '', 'foo'];
  describe('getValue()', function () {
    for (const name of globalAttributeNames) {
      for (const value of valueArr.filter(v => v != null)) {
        it(`returns "${value}" for attribute "${name}"`, function () {
          const ctx = TestContext.createHTMLTestContext();
          el = ctx.createElementFromMarkup(`<div ${name}="${value}"></div>`);
          const { scheduler: $scheduler } = setup();
          scheduler = $scheduler;
          sut = new DataAttributeAccessor(scheduler, LifecycleFlags.none, el, name);

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
          const { scheduler: $scheduler } = setup();
          scheduler = $scheduler;
          const expected = value != null ? `<div ${name}="${value}"></div>` : '<div></div>';
          sut = new DataAttributeAccessor(scheduler, LifecycleFlags.none, el, name);

          sut.bind(LifecycleFlags.none);
          sut.setValue(value, LifecycleFlags.none);
          assert.strictEqual(sut.getValue(), value, `sut.getValue()`);
          assert.strictEqual(el.outerHTML, '<div></div>', `el.outerHTML before flush`);

          scheduler.getRenderTaskQueue().flush();
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
          const { scheduler: $scheduler } = setup();
          scheduler = $scheduler;
          const expected = value != null ? `<div ${name}="${value}"></div>` : '<div></div>';
          sut = new DataAttributeAccessor(scheduler, LifecycleFlags.none, el, name);

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

interface IStyleSpec {
  title: string;
  staticStyle: string;
  input: unknown;
  expected: string;
}

describe('StyleAccessor', function () {
  const propNames = Object.getOwnPropertyNames(CSS_PROPERTIES);

  let sut: StyleAttributeAccessor;
  let el: HTMLElement;
  let scheduler: IScheduler;

  // TODO: this is just quick-n-dirty; remove redundant tests and add missing tests
  for (const propName of propNames) {
    const values = CSS_PROPERTIES[propName]['values'];
    const value = values[0];
    const rule = `${propName}:${value}`;
    it(`setValue - style="${rule}" flags.none`, function () {
      const ctx = TestContext.createHTMLTestContext();
      el = ctx.createElementFromMarkup('<div></div>');
      const { scheduler: $scheduler } = setup();
      scheduler = $scheduler;
      sut = new StyleAttributeAccessor(scheduler, LifecycleFlags.none, el);
      const setPropertySpy = createSpy(sut, 'setProperty', true);

      sut.bind(LifecycleFlags.none);
      sut.setValue(rule, LifecycleFlags.none);
      assert.deepStrictEqual(
        setPropertySpy.calls,
        [],
        `setPropertySpy.calls`,
      );

      scheduler.getRenderTaskQueue().flush();
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
      const { scheduler: $scheduler } = setup();
      scheduler = $scheduler;
      sut = new StyleAttributeAccessor(scheduler, LifecycleFlags.none, el);
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

  const specs: Partial<IStyleSpec>[] = [
    {
      title: 'getValue - style="display: block;"',
      staticStyle: 'display:block',
      input: '',
      expected: 'display: block;'
    },
    {
      title: `style binding array string/object returns correct with static style`,
      staticStyle: `display: block;`,
      input: ['background-color:red', { borderColor: 'black' }],
      expected: 'display: block; background-color: red; border-color: black;',
    },
    {
      title: `style binding array string/object (kebab) returns correct with static style`,
      staticStyle: `display: block;`,
      input: ['background-color:red', { ['border-color']: 'black' }],
      expected: 'display: block; background-color: red; border-color: black;',
    },
    {
      title: `style binding array string/object (kebab) returns correct with no static style`,
      input: ['background-color:red', { ['border-color']: 'black' }],
      expected: 'background-color: red; border-color: black;',
    },
    {
      title: `style binding array string/object returns correct without static style`,
      input: ['background-color:red', { borderColor: 'black' }],
      expected: 'background-color: red; border-color: black;',
    },
    {
      title: `style binding array string/string returns correct with static style`,
      input: ['background-color:red', 'height:32px'],
      staticStyle: `display: block;`,
      expected: 'display: block; background-color: red; height: 32px;',
    },
    {
      title: `style binding array string/string returns correct with no static style`,
      input: ['background-color:red', 'height:32px'],
      expected: 'background-color: red; height: 32px;',
    },
    {
      title: `style string returns correct with static style`,
      input: 'background-color:red;height:32px;',
      staticStyle: `display: block;`,
      expected: 'display: block; background-color: red; height: 32px;',
    },
    {
      title: `style string returns correct with no static style`,
      input: 'background-color:red;height:32px;',
      expected: 'background-color: red; height: 32px;',
    },
    {
      title: `style object (non kebab) returns correct with static style`,
      input: { backgroundColor: 'red', height: '32px' },
      staticStyle: `display: block;`,
      expected: 'display: block; background-color: red; height: 32px;',
    },
    {
      title: `style object (non kebab) returns correct without static style`,
      input: { backgroundColor: 'red', height: '32px' },
      expected: 'background-color: red; height: 32px;',
    },
    {
      title: `style object (kebab) returns correct with static style`,
      input: { ['background-color']: 'red', height: '32px' },
      staticStyle: `display: block;`,
      expected: 'display: block; background-color: red; height: 32px;',
    },
    {
      title: `style object (kebab) returns correct without static style`,
      input: { ['background-color']: 'red', height: '32px' },
      expected: 'background-color: red; height: 32px;',
    },
    {
      title: `style object (non-kebab) string/object returns correct with static style`,
      input: { backgroundColor: 'red', test: { height: '32px' } },
      staticStyle: `display: block;`,
      expected: 'display: block; background-color: red; height: 32px;',
    },
    {
      title: `style object (non-kebab) string/object returns correct with no static style`,
      input: { backgroundColor: 'red', test: { height: '32px' } },
      expected: 'background-color: red; height: 32px;',
    },
    {
      title: `style object (kebab) string/object returns correct with static style`,
      input: { ['background-color']: 'red', test: { height: '32px' } },
      staticStyle: `display: block;`,
      expected: 'display: block; background-color: red; height: 32px;',
    },
    {
      title: `style object (kebab) string/object returns correct with no static style`,
      input: { ['background-color']: 'red', test: { height: '32px' } },
      expected: 'background-color: red; height: 32px;',
    },
    {
      title: `style object (kebab) string/object (kebab) returns correct with static style`,
      input: { ['background-color']: 'red', test: { ['border-color']: 'black' } },
      staticStyle: `display: block;`,
      expected: 'display: block; background-color: red; border-color: black;',
    },
    {
      title: `style object (kebab) string/object (kebab) returns correct no with static style`,
      input: { ['background-color']: 'red', test: { ['border-color']: 'black' } },
      expected: 'background-color: red; border-color: black;',
    },
    {
      title: `style binding array string/array (kebab) returns correct with static style`,
      input: ['background-color:red', ['height:32px', { ['border-color']: 'black' }]],
      staticStyle: `display: block;`,
      expected: 'display: block; background-color: red; height: 32px; border-color: black;',
    },
    {
      title: `style binding array string/array (kebab) returns correct with no static style`,
      input: ['background-color:red', ['height:32px', { ['border-color']: 'black' }]],
      expected: 'background-color: red; height: 32px; border-color: black;',
    },
  ];

  for (const { title, staticStyle, input, expected } of specs) {
    it(title, function () {
      const ctx = TestContext.createHTMLTestContext();
      const el = ctx.createElementFromMarkup(`<div style="${staticStyle}"></div>`);
      const sut = new StyleAttributeAccessor(ctx.scheduler, LifecycleFlags.none, el);
      sut.setValue(input, LifecycleFlags.fromBind);

      const actual = sut.getValue();
      assert.strictEqual(actual, expected);
    });
  }
});

describe('ClassAccessor', function () {

  const assertClassChanges = (initialClassList: string, classList: string, secondClassList: string | object, secondUpdatedClassList: string) => {
    const initialClasses = initialClassList.split(' ').filter(x => x);

    for (const cls of initialClasses) {
      if (!classList.includes(cls)) {
        assert.includes(secondUpdatedClassList, cls, `secondUpdatedClassList includes class from initialClassList "${initialClassList}" (except classes from classList "${classList}")`);
      }
    }

    if (typeof secondClassList === 'string') {
      for (const cls of secondClassList.split(' ').filter(x => x)) {
        assert.includes(secondUpdatedClassList, cls, `secondUpdatedClassList includes class from secondClassList "${secondClassList}"`);
      }
    }

    if (secondClassList instanceof Array) {
      for (const cls of secondClassList) {
        assertClassChanges(initialClassList, classList, cls, secondUpdatedClassList);
      }
      return;
    }

    if (secondClassList instanceof Object) {
      for (const cls in secondClassList) {
        if (!!secondClassList[cls]) {
          assert.includes(secondUpdatedClassList, cls, `secondUpdatedClassList includes class from secondClassList "${JSON.stringify(secondClassList)}"`);
          continue;
        }
        if (!initialClasses.includes(cls)) {
          assert.notIncludes(secondUpdatedClassList, cls, `secondUpdatedClassList ${JSON.stringify(secondUpdatedClassList)} does not exclude class ${cls} from initial class prop but does if not secondClassList "${JSON.stringify(secondClassList)}"`);
        }
      }
    }
  };

  const markupArr = [
    '<div></div>',
    '<div class=""></div>',
    '<div class="foo"></div>',
    '<div class="foo bar baz"></div>',
    '<div class="foo bar baz qux"></div>'
  ];
  const classListArr = ['', 'foo', 'foo bar   ', '    bar baz', 'qux', 'bar qux', 'qux quux'];
  const secondClassListArr = ['', 'fooo  ', { fooo: true }, { fooo: 'true' }, { fooo: true, baaar: false },
    { fooo: 'true', baaar: 'false' }, { foo: true, bar: false, fooo: true }, { foo: false, bar: false },
    { 'fooo baaar': true, 'baar': true, 'fono': false },
    ['fooo', ['bar', { baz: true }], 'bazz'],
    ['fooo', { baar: true }, 'bazz'], []]; // empty array test
  for (const markup of markupArr) {
    for (const classList of classListArr) {

      function setup() {
        const ctx = TestContext.createHTMLTestContext();
        const el = ctx.createElementFromMarkup(markup);
        const initialClassList = el.classList.toString();
        const { scheduler } = ctx;
        const sut = new ClassAttributeAccessor(scheduler, LifecycleFlags.none, el);
        sut.bind(LifecycleFlags.none);

        function tearDown() {
          scheduler.getRenderTaskQueue().flush();
          sut.unbind(LifecycleFlags.none);
        }

        return { sut, el, initialClassList, scheduler, tearDown };
      }

      describe('with flags.none', function () {

        it(`setValue("${classList}") updates ${markup} flags.none`, function () {
          const { sut, el, initialClassList, scheduler, tearDown } = setup();

          sut.setValue(classList, LifecycleFlags.none);

          assert.strictEqual(el.classList.toString(), initialClassList, `el.classList.toString() === initialClassList`);

          scheduler.getRenderTaskQueue().flush();

          const updatedClassList = el.classList.toString();
          for (const cls of initialClassList.split(' ').filter(x => x)) {
            assert.includes(updatedClassList, cls, `updatedClassList includes class from initialClassList "${initialClassList}"`);
          }
          for (const cls of classList.split(' ').filter(x => x)) {
            assert.includes(updatedClassList, cls, `updatedClassList includes class from classList "${classList}"`);
          }

          tearDown();
        });

        for (const secondClassList of secondClassListArr) {
          it(`setValue("${secondClassList}") updates already-updated ${markup} flags.none`, function () {
            const { sut, el, initialClassList, scheduler, tearDown } = setup();

            sut.setValue(classList, LifecycleFlags.none);

            scheduler.getRenderTaskQueue().flush();

            const updatedClassList = el.classList.toString();

            sut.setValue(secondClassList, LifecycleFlags.none);
            assert.strictEqual(el.classList.toString(), updatedClassList, `el.classList.toString()`);

            scheduler.getRenderTaskQueue().flush();

            const secondUpdatedClassList = el.classList.toString();
            assertClassChanges(initialClassList, classList, secondClassList, secondUpdatedClassList);
            tearDown();
          });
        }
      });

      describe('with flags.fromBind', function () {
        it(`setValue("${classList}") updates ${markup} flags.fromBind`, function () {
          const { sut, el, initialClassList, tearDown } = setup();

          sut.setValue(classList, LifecycleFlags.fromBind);

          const updatedClassList = el.classList.toString();
          for (const cls of initialClassList.split(' ').filter(x => x)) {
            assert.includes(updatedClassList, cls, `updatedClassList includes class from initialClassList "${initialClassList}"`);
          }
          for (const cls of classList.split(' ').filter(x => x)) {
            assert.includes(updatedClassList, cls, `updatedClassList includes class from classList "${classList}"`);
          }

          tearDown();
        });

        for (const secondClassList of secondClassListArr) {
          it(`setValue("${secondClassList}") updates already-updated ${markup} flags.fromBind`, function () {
            const { sut, el, initialClassList, tearDown } = setup();

            sut.setValue(classList, LifecycleFlags.fromBind);

            sut.setValue(secondClassList, LifecycleFlags.fromBind);

            const secondUpdatedClassList = el.classList.toString();

            assertClassChanges(initialClassList, classList, secondClassList, secondUpdatedClassList);
            tearDown();
          });
        }
      });
    }
  }
});
