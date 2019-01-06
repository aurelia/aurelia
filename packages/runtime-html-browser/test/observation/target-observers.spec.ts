
import { Registration } from '@aurelia/kernel';
import {
  IDOM,
  ILifecycle,
  IObserverLocator,
  LifecycleFlags
} from '@aurelia/runtime';
import { expect } from 'chai';
import { spy } from 'sinon';
import {
  AttributeNSAccessor,
  ClassAttributeAccessor,
  DataAttributeAccessor,
  HTMLDOM,
  StyleAttributeAccessor
} from '../../../runtime-html/src';
import { BasicConfiguration } from '../../src/index';
import { CSS_PROPERTIES } from '../css-properties';
import {
  createElement,
  globalAttributeNames
} from '../util';

function createSvgUseElement(name: string, value: string) {
  return createElement(`<svg>
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
  const container = BasicConfiguration.createContainer();
  const dom = new HTMLDOM(document);
  Registration.instance(IDOM, dom).register(container, IDOM);
  const lifecycle = container.get(ILifecycle);
  const observerLocator = container.get(IObserverLocator);

  return { container, lifecycle, observerLocator };
}

describe('AttributeNSAccessor', () => {
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

  describe('getValue()', () => {
    for (const { name, value } of tests) {
      it(`returns ${value} for xlink:${name}`, () => {
        const { lifecycle: $lifecycle } = setup();
        lifecycle = $lifecycle;
        el = createSvgUseElement(name, value) as HTMLElement;
        sut = new AttributeNSAccessor(lifecycle, el, `xlink:${name}`, name, 'http://www.w3.org/1999/xlink');
        const actual = sut.getValue();
        expect(actual).to.equal(value);
      });
    }
  });

  describe('setValue()', () => {
    for (const { name, value } of tests) {
      it(`sets xlink:${name} to foo`, () => {
        el = createSvgUseElement(name, value) as HTMLElement;
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

describe('DataAttributeAccessor', () => {
  let sut: DataAttributeAccessor;
  let el: HTMLElement;
  let lifecycle: ILifecycle;

  const valueArr = [undefined, null, '', 'foo'];
  describe('getValue()', () => {
    for (const name of globalAttributeNames) {
      for (const value of valueArr.filter(v => v !== null && v !== undefined)) {
        it(`returns "${value}" for attribute "${name}"`, () => {
          el = createElement(`<div ${name}="${value}"></div>`);
          const { lifecycle: $lifecycle } = setup();
          lifecycle = $lifecycle;
          sut = new DataAttributeAccessor(lifecycle, el, name);
          const actual = sut.getValue();
          expect(actual).to.equal(value);
        });
      }
    }
  });

  describe('setValue()', () => {
    for (const name of globalAttributeNames) {
      for (const value of valueArr) {
        it(`sets attribute "${name}" to "${value}"`, () => {
          el = createElement(`<div></div>`);
          const { lifecycle: $lifecycle } = setup();
          lifecycle = $lifecycle;
          const expected = value !== null && value !== undefined ? `<div ${name}="${value}"></div>` : '<div></div>';
          sut = new DataAttributeAccessor(lifecycle, el, name);
          sut.setValue(value, LifecycleFlags.none);
          if (value !== null && value !== undefined) {
            expect(el.outerHTML).not.to.equal(expected);
          }
          lifecycle.processFlushQueue(LifecycleFlags.none);
          expect(el.outerHTML).to.equal(expected);
        });
      }
    }
  });
});

describe('StyleAccessor', () => {
  const propNames = Object.getOwnPropertyNames(CSS_PROPERTIES);

  let sut: StyleAttributeAccessor;
  let el: HTMLElement;
  let lifecycle: ILifecycle;

  // TODO: this is just quick-n-dirty; remove redundant tests and add missing tests
  for (const propName of propNames) {
    const values = CSS_PROPERTIES[propName]['values'];
    const value = values[0];
    const rule = `${propName}:${value}`;
    it(`setValue - style="${rule}"`, () => {
      el = createElement('<div></div>') as HTMLElement;
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

  it(`getValue - style="display: block;"`, () => {
    el = createElement(`<div style="display: block;"></div>`) as HTMLElement;
    const { lifecycle: $lifecycle } = setup();
    lifecycle = $lifecycle;
    sut = new StyleAttributeAccessor(lifecycle, el);

    const actual = sut.getValue();
    expect(actual).to.equal('display: block;');
  });
});

describe('ClassAccessor', () => {
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
      beforeEach(() => {
        el = createElement(markup);
        initialClassList = el.classList.toString();
        const { lifecycle: $lifecycle } = setup();
        lifecycle = $lifecycle;
        sut = new ClassAttributeAccessor(lifecycle, el);
      });

      it(`setValue("${classList}") updates ${markup}`, () => {
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
        it(`setValue("${secondClassList}") updates already-updated ${markup}`, () => {
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
