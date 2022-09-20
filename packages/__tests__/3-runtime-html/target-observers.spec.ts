import {
  AttributeNSAccessor,
  ClassAttributeAccessor,
  DataAttributeAccessor,
  StyleAttributeAccessor
} from '@aurelia/runtime-html';
import { assert, createSpy, CSS_PROPERTIES, globalAttributeNames, TestContext } from '@aurelia/testing';
import { isFirefox } from '../util.js';

function createSvgUseElement(ctx: TestContext, name: string, value: string) {
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

function createFixture() {
  const ctx = TestContext.create();
  const { container, observerLocator } = ctx;

  return { ctx, container, observerLocator };
}

describe('[UNIT] AttributeNSAccessor', function () {
  let sut: AttributeNSAccessor;
  let el: HTMLElement;

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
        const { ctx } = createFixture();
        el = createSvgUseElement(ctx, name, value) as HTMLElement;
        sut = new AttributeNSAccessor('http://www.w3.org/1999/xlink');

        assert.strictEqual(sut.getValue(el, name), value, `actual`);
      });
    }
  });

  for (const { name, value } of tests) {
    it(`setValue() xlink:${name}`, function () {
      const ctx = TestContext.create();
      const ns = 'http://www.w3.org/1999/xlink';
      el = createSvgUseElement(ctx, name, value) as HTMLElement;
      sut = new AttributeNSAccessor(ns);

      sut.setValue('foo', el, name);

      assert.strictEqual(el.getAttributeNS(ns, name), 'foo', `el.getAttributeNS(xlink, ${name})`);
    });
  }
});

describe('DataAttributeAccessor', function () {
  let sut: DataAttributeAccessor;
  let el: HTMLElement;

  const valueArr = [undefined, null, '', 'foo'];
  describe('getValue()', function () {
    for (const name of globalAttributeNames) {
      for (const value of valueArr.filter(v => v != null)) {
        it(`returns "${value}" for attribute "${name}"`, function () {
          const ctx = TestContext.create();
          el = ctx.createElementFromMarkup(`<div ${name}="${value}"></div>`);
          sut = new DataAttributeAccessor();

          const actual = sut.getValue(el, name);
          assert.strictEqual(actual, value, `actual`);
        });
      }
    }
  });

  for (const name of globalAttributeNames) {
    for (const value of valueArr) {
      it(`calls setValue() attribute "${name}" to "${value}"`, function () {
        const ctx = TestContext.create();
        el = ctx.createElementFromMarkup(`<div></div>`);
        const expected = value != null ? `<div ${name}="${value}"></div>` : '<div></div>';
        sut = new DataAttributeAccessor();

        sut.setValue(value, el, name);

        assert.strictEqual(el.outerHTML, expected, `el.outerHTML`);
      });
    }
  }
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

  // TODO: this is just quick-n-dirty; remove redundant tests and add missing tests
  for (const propName of propNames) {
    const values = CSS_PROPERTIES[propName]['values'];
    const value = values[0];
    const rule = `${propName}:${value}`;
    it(`setValue - style="${rule}" flags.none`, function () {
      const ctx = TestContext.create();
      el = ctx.createElementFromMarkup('<div></div>');
      sut = new StyleAttributeAccessor(el);
      const setPropertySpy = createSpy(sut, 'setProperty', true);

      sut.bind();
      assert.deepStrictEqual(
        setPropertySpy.calls,
        [],
        `setPropertySpy.calls`,
      );

      sut.setValue(rule);
      assert.deepStrictEqual(
        setPropertySpy.calls,
        [
          [propName, value],
        ],
        `setPropertySpy.calls`,
      );
    });
  }

  for (const propName of propNames) {
    const values = CSS_PROPERTIES[propName]['values'];
    const value = values[0];
    const rule = `${propName}:${value}`;
    it(`setValue - style="${rule}" flags.none`, function () {
      const ctx = TestContext.create();
      el = ctx.createElementFromMarkup('<div></div>');
      sut = new StyleAttributeAccessor(el);
      const setPropertySpy = createSpy(sut, 'setProperty', true);

      sut.setValue(rule);
      assert.deepStrictEqual(
        setPropertySpy.calls,
        [
          [propName, value],
        ],
        `setPropertySpy.calls`,
      );
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
      title: `style binding array string/object with custom property correct with static style`,
      staticStyle: `display: block;`,
      input: ['background-color:red', { '--border-color': 'black' }],
      expected: 'display: block; background-color: red; --border-color:black;',
    },
    {
      title: `style binding array string/object (kebab) returns correct with static style`,
      staticStyle: `display: block;`,
      input: ['background-color:red', { 'border-color': 'black' }],
      expected: 'display: block; background-color: red; border-color: black;',
    },
    {
      title: `style binding array string/object (kebab) returns correct with no static style`,
      input: ['background-color:red', { 'border-color': 'black' }],
      expected: 'background-color: red; border-color: black;',
    },
    {
      title: `style binding array string/object with custom property correct with no static style`,
      input: ['background-color:red', { '--border-color': 'black' }],
      expected: 'background-color: red; --border-color:black;',
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
      title: `style binding array string/string with custom property name returns correct with static style`,
      input: ['background-color:red', '--superHeight:32px'],
      staticStyle: `display: block;`,
      expected: 'display: block; background-color: red; --superHeight:32px;',
    },
    {
      title: `style binding array string/string returns correct with no static style`,
      input: ['background-color:red', 'height:32px'],
      expected: 'background-color: red; height: 32px;',
    },
    {
      title: `style binding array string/string with custom property name returns correct with no static style`,
      input: ['background-color:red', '--superHeight:32px'],
      expected: 'background-color: red; --superHeight:32px;',
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
    ...(
      isFirefox()
      ? []
      // TODO: figure out why these fail in firefox and fix them?
      : [
        {
          title: `style string returns correct with static style with base64 encoded url`,
          input: 'height:32px;background: linear-gradient(90deg, rgba(255,255,255,1) 40%, rgba(255,255,255,0) 70%, rgba(255,255,255,1) 95%), url(data:image/png;base64,TEST) 110px -60px no-repeat;',
          staticStyle: `display: block;`,
          expected: 'display: block; height: 32px; background: linear-gradient(90deg, rgb(255, 255, 255) 40%, rgba(255, 255, 255, 0) 70%, rgb(255, 255, 255) 95%), url("data:image/png;base64,TEST") 110px -60px no-repeat;',
        },
        {
          title: `style object (non kebab) with base64 url returns correct with static style`,
          input: { background: 'linear-gradient(90deg, rgba(255,255,255,1) 40%, rgba(255,255,255,0) 70%, rgba(255,255,255,1) 95%), url(data:image/png;base64,TEST) 110px -60px no-repeat', height: '32px' },
          staticStyle: `display: block;`,
          expected: 'display: block; background: linear-gradient(90deg, rgb(255, 255, 255) 40%, rgba(255, 255, 255, 0) 70%, rgb(255, 255, 255) 95%), url("data:image/png;base64,TEST") 110px -60px no-repeat; height: 32px;',
        },
        {
          title: `style object (non kebab) with base64 url returns correct without static style`,
          input: { background: 'linear-gradient(90deg, rgba(255,255,255,1) 40%, rgba(255,255,255,0) 70%, rgba(255,255,255,1) 95%), url(data:image/png;base64,TEST) 110px -60px no-repeat', height: '32px' },
          expected: 'background: linear-gradient(90deg, rgb(255, 255, 255) 40%, rgba(255, 255, 255, 0) 70%, rgb(255, 255, 255) 95%), url("data:image/png;base64,TEST") 110px -60px no-repeat; height: 32px;',
        },
        {
          title: `style object (kebab) with base64 url string returns correct with static style`,
          input: { background: 'linear-gradient(90deg, rgba(255,255,255,1) 40%, rgba(255,255,255,0) 70%, rgba(255,255,255,1) 95%), url(data:image/png;base64,TEST) 110px -60px no-repeat', height: '32px' },
          staticStyle: `display: block;`,
          expected: 'display: block; background: linear-gradient(90deg, rgb(255, 255, 255) 40%, rgba(255, 255, 255, 0) 70%, rgb(255, 255, 255) 95%), url("data:image/png;base64,TEST") 110px -60px no-repeat; height: 32px;',
        },
      ]
    ),
    {
      title: `style object (kebab) returns correct with static style`,
      input: { 'background-color': 'red', 'height': '32px' },
      staticStyle: `display: block;`,
      expected: 'display: block; background-color: red; height: 32px;',
    },
    {
      title: `style object (kebab) returns correct without static style`,
      input: { 'background-color': 'red', 'height': '32px' },
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
      input: { 'background-color': 'red', 'test': { height: '32px' } },
      staticStyle: `display: block;`,
      expected: 'display: block; background-color: red; height: 32px;',
    },
    {
      title: `style object (kebab) string/object returns correct with no static style`,
      input: { 'background-color': 'red', 'test': { height: '32px' } },
      expected: 'background-color: red; height: 32px;',
    },
    {
      title: `style object (kebab) string/object (kebab) returns correct with static style`,
      input: { 'background-color': 'red', 'test': { 'border-color': 'black' } },
      staticStyle: `display: block;`,
      expected: 'display: block; background-color: red; border-color: black;',
    },
    {
      title: `style object (kebab) string/object (kebab) returns correct no with static style`,
      input: { 'background-color': 'red', 'test': { 'border-color': 'black' } },
      expected: 'background-color: red; border-color: black;',
    },
    {
      title: `style binding array string/array (kebab) returns correct with static style`,
      input: ['background-color:red', ['height:32px', { 'border-color': 'black' }]],
      staticStyle: `display: block;`,
      expected: 'display: block; background-color: red; height: 32px; border-color: black;',
    },
    {
      title: `style binding array string/array (kebab) returns correct with no static style`,
      input: ['background-color:red', ['height:32px', { 'border-color': 'black' }]],
      expected: 'background-color: red; height: 32px; border-color: black;',
    },
  ];

  for (const { title, staticStyle, input, expected } of specs) {
    // skip url checks since node incorrectly fails as background url images are not supported
    if (title.includes('url') && typeof process !== 'undefined') { continue; }
    it(title, function () {
      const ctx = TestContext.create();
      const el = ctx.createElementFromMarkup(`<div style="${staticStyle}"></div>`);
      const sut = new StyleAttributeAccessor(el);
      sut.setValue(input);

      const actual = sut.getValue();
      // normalize by removing the space after colon since it differs faily randomly from env
      // but has no impact on whether a test should or should not pass
      assert.strictEqual(actual.replace(/:\s/g, ':'), expected.replace(/:\s/g, ':'));
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

      function createFixture() {
        const ctx = TestContext.create();
        const el = ctx.createElementFromMarkup(markup);
        const initialClassList = el.classList.toString();
        const { platform } = ctx;
        const sut = new ClassAttributeAccessor(el);

        function tearDown() {
          platform.domWriteQueue.flush();
        }

        return { sut, el, initialClassList, tearDown };
      }

      it(`setValue("${classList}") updates ${markup} flags.none`, function () {
        const {
          sut,
          el,
          initialClassList,
          tearDown,
        } = createFixture();

        sut.setValue(classList);

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
          const {
            sut,
            el,
            initialClassList,
            tearDown,
          } = createFixture();

          sut.setValue(classList);
          sut.setValue(secondClassList);

          const updatedClassList = el.classList.toString();
          assertClassChanges(initialClassList, classList, secondClassList, updatedClassList);
          tearDown();
        });
      }
    }
  }
});
