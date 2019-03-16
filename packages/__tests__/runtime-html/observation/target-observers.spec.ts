
import { ILifecycle, LifecycleFlags } from '@aurelia/runtime';
import { expect } from 'chai';
import { spy } from 'sinon';
import {
  AttributeNSAccessor,
  ClassAttributeAccessor,
  DataAttributeAccessor,
  StyleAttributeAccessor
} from '@aurelia/runtime-html';
import { CSS_PROPERTIES } from '../css-properties';
import { globalAttributeNames, HTMLTestContext, TestContext } from '../util';

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
        sut = new AttributeNSAccessor(lifecycle, el, `xlink:${name}`, name, 'http://www.w3.org/1999/xlink');
        const actual = sut.getValue();
        expect(actual).to.equal(value);
      });
    }
  });

  describe('setValue()', function () {
    for (const { name, value } of tests) {
      it(`sets xlink:${name} to foo`, function () {
        const ctx = TestContext.createHTMLTestContext();
        el = createSvgUseElement(ctx, name, value) as HTMLElement;
        const { lifecycle: $lifecycle } = setup();
        lifecycle = $lifecycle;
        sut = new AttributeNSAccessor(lifecycle, el, `xlink:${name}`, name, 'http://www.w3.org/1999/xlink');
        sut.setValue('foo', LifecycleFlags.none);
        expect(sut.getValue()).not.to.equal('foo');
        lifecycle.processFlushQueue(LifecycleFlags.none);
        expect(sut.getValue()).to.equal('foo');
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
          const actual = sut.getValue();
          expect(actual).to.equal(value);
        });
      }
    }
  });

  describe('setValue()', function () {
    for (const name of globalAttributeNames) {
      for (const value of valueArr) {
        it(`sets attribute "${name}" to "${value}"`, function () {
          const ctx = TestContext.createHTMLTestContext();
          el = ctx.createElementFromMarkup(`<div></div>`);
          const { lifecycle: $lifecycle } = setup();
          lifecycle = $lifecycle;
          const expected = value != null ? `<div ${name}="${value}"></div>` : '<div></div>';
          sut = new DataAttributeAccessor(lifecycle, el, name);
          sut.setValue(value, LifecycleFlags.none);
          if (value != null) {
            expect(el.outerHTML).not.to.equal(expected);
          }
          lifecycle.processFlushQueue(LifecycleFlags.none);
          expect(el.outerHTML).to.equal(expected);
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
    it(`setValue - style="${rule}"`, function () {
      const ctx = TestContext.createHTMLTestContext();
      el = ctx.createElementFromMarkup('<div></div>');
      const { lifecycle: $lifecycle } = setup();
      lifecycle = $lifecycle;
      sut = new StyleAttributeAccessor(lifecycle, el);
      sut._setProperty = spy();

      sut.setValue(rule, LifecycleFlags.none);
      expect(sut._setProperty).not.to.have.been.calledOnce;
      lifecycle.processFlushQueue(LifecycleFlags.none);
      expect(sut._setProperty).to.have.been.calledOnce;
      expect(sut._setProperty).to.have.been.calledWith(propName, value);
    });
  }

  it(`getValue - style="display: block;"`, function () {
    const ctx = TestContext.createHTMLTestContext();
    el = ctx.createElementFromMarkup(`<div style="display: block;"></div>`);
    const { lifecycle: $lifecycle } = setup();
    lifecycle = $lifecycle;
    sut = new StyleAttributeAccessor(lifecycle, el);

    const actual = sut.getValue();
    expect(actual).to.equal('display: block;');
  });
});

describe('ClassAccessor', function () {
  let sut: ClassAttributeAccessor;
  let el: HTMLElement;
  let lifecycle: ILifecycle;
  let initialClassList: string;

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
      beforeEach(function () {
        const ctx = TestContext.createHTMLTestContext();
        el = ctx.createElementFromMarkup(markup);
        initialClassList = el.classList.toString();
        const { lifecycle: $lifecycle } = setup();
        lifecycle = $lifecycle;
        sut = new ClassAttributeAccessor(lifecycle, el);
      });

      it(`setValue("${classList}") updates ${markup}`, function () {
        sut.setValue(classList, LifecycleFlags.none);
        expect(el.classList.toString()).to.equal(initialClassList);
        lifecycle.processFlushQueue(LifecycleFlags.none);
        const updatedClassList = el.classList.toString();
        for (const cls of initialClassList.split(' ')) {
          expect(updatedClassList).to.contain(cls);
        }
        for (const cls of classList.split(' ')) {
          expect(updatedClassList).to.contain(cls);
        }
      });

      for (const secondClassList of secondClassListArr) {
        it(`setValue("${secondClassList}") updates already-updated ${markup}`, function () {
          sut.setValue(classList, LifecycleFlags.none);
          lifecycle.processFlushQueue(LifecycleFlags.none);
          const updatedClassList = el.classList.toString();
          sut.setValue(secondClassList, LifecycleFlags.none);
          expect(el.classList.toString()).to.equal(updatedClassList);
          lifecycle.processFlushQueue(LifecycleFlags.none);
          const secondUpdatedClassList = el.classList.toString();
          for (const cls of initialClassList.split(' ')) {
            if (!classList.includes(cls)) {
              expect(secondUpdatedClassList).to.contain(cls);
            }
          }
          for (const cls of secondClassList.split(' ')) {
            expect(secondUpdatedClassList).to.contain(cls);
          }
        });
      }
    }
  }
});
