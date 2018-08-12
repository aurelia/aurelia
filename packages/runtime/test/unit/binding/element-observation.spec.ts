import { XLinkAttributeObserver, DataAttributeObserver, StyleObserver, ValueAttributeObserver, EventSubscriber, ChangeSet } from "@aurelia/runtime";
import { createElement, globalAttributeNames } from "../util";
import { expect } from "chai";
import { CSS_PROPERTIES } from "../css-properties";
import { spy } from "sinon";


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

describe('XLinkAttributeObserver', () => {
  let sut: XLinkAttributeObserver;
  let el: Element;
  let changeSet: ChangeSet;

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
        el = createSvgUseElement(name, value);
        changeSet = new ChangeSet();
        sut = new XLinkAttributeObserver(changeSet, el, `xlink:${name}`, name);
        const actual = sut.getValue();
        expect(actual).to.equal(value);
      });
    }
  });

  describe('setValue()', () => {
    for (const { name, value } of tests) {
      it(`sets xlink:${name} to foo`, () => {
        el = createSvgUseElement(name, value);
        changeSet = new ChangeSet();
        sut = new XLinkAttributeObserver(changeSet, el, `xlink:${name}`, name);
        sut.setValue('foo');
        expect(sut.getValue()).not.to.equal('foo');
        changeSet.flushChanges();
        expect(sut.getValue()).to.equal('foo');
      });
    }
  });

});

describe('DataAttributeObserver', () => {
  let sut: DataAttributeObserver;
  let el: Element;
  let changeSet: ChangeSet;

  const valueArr = [undefined, null, '', 'foo'];
  describe('getValue()', () => {
    for (const name of globalAttributeNames) {
      for (const value of valueArr.filter(v => v !== null && v !== undefined)) {
        it(`returns "${value}" for attribute "${name}"`, () => {
          el = createElement(`<div ${name}="${value}"></div>`);
          changeSet = new ChangeSet();
          sut = new DataAttributeObserver(changeSet, el, name);
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
          changeSet = new ChangeSet();
          const expected = value !== null && value !== undefined ? `<div ${name}="${value}"></div>` : '<div></div>';
          sut = new DataAttributeObserver(changeSet, el, name);
          sut.setValue(value);
          if (value !== null && value !== undefined) {
            expect(el.outerHTML).not.to.equal(expected);
          }
          changeSet.flushChanges();
          expect(el.outerHTML).to.equal(expected);
        });
      }
    }
  });
});

describe('StyleObserver', () => {
  const propNames = Object.getOwnPropertyNames(CSS_PROPERTIES);

  let sut: StyleObserver;
  let el: HTMLElement;
  let changeSet: ChangeSet;

  for (const attrName of ['css', 'style']) {
    describe(`"${attrName}" attribute`, () => {
      // TODO: this is just quick-n-dirty; remove redundant tests and add missing tests
      for (const propName of propNames) {
        const values = CSS_PROPERTIES[propName]['values'];
        const value = values[0];
        const rule = `${propName}:${value}`;
        it(`setValue - ${attrName}="${rule}"`, () => {
          el = <HTMLElement>createElement('<div></div>');
          changeSet = new ChangeSet();
          sut = new StyleObserver(changeSet, el, attrName);
          sut._setProperty = spy();

          sut.setValue(rule);
          expect(sut._setProperty).not.to.have.been.calledOnce;
          changeSet.flushChanges();
          expect(sut._setProperty).to.have.been.calledOnce;
          expect(sut._setProperty).to.have.been.calledWith(propName, value);
        });
      }
    });

    it(`getValue - ${attrName}="display: block;"`, () => {
      el = <HTMLElement>createElement(`<div style="display: block;"></div>`);
      changeSet = new ChangeSet();
      sut = new StyleObserver(changeSet, el, attrName);

      const actual = sut.getValue();
      expect(actual).to.equal('display: block;');
    });
  }
});

describe('ValueAttributeObserver', () => {
  let sut: ValueAttributeObserver;
  let el: Element;
  let changeSet: ChangeSet;

  const inputTypeArr = [
    'button',
    'checkbox',
    'color',
    'date',
    'datetime-local',
    'email',
    'file',
    'hidden',
    'image',
    'month',
    'number',
    'password',
    'radio',
    'range',
    'reset',
    'search',
    'submit',
    'tel',
    'text',
    'time',
    'url',
    'week'
  ];

  for (const inputType of inputTypeArr) {
    const markup = `<input type="${inputType}">`;
    it(`setValue('foo') calls subscribers - ${markup}`, () => {
      el = createElement(markup);
      changeSet = new ChangeSet();
      sut = new ValueAttributeObserver(changeSet, el, 'value', new EventSubscriber(['change', 'input']));
      sut['callSubscribers'] = spy();

      sut.setValue('foo');
      expect(sut['callSubscribers']).not.to.have.been.called;
      changeSet.flushChanges();
      if (inputType !== 'file') {
        expect(sut['callSubscribers']).to.have.been.called;
      } else {
        expect(sut['callSubscribers']).not.to.have.been.called;
      }
    });

    it(`setValue(null) does not call subscribers - ${markup}`, () => {
      el = createElement(markup);
      changeSet = new ChangeSet();
      sut = new ValueAttributeObserver(changeSet, el, 'value', new EventSubscriber(['change', 'input']));
      sut['callSubscribers'] = spy();

      sut.setValue(null);
      changeSet.flushChanges();
      expect(sut['callSubscribers']).not.to.have.been.called;
    });

    it(`setValue(undefined) does not call subscribers - ${markup}`, () => {
      el = createElement(markup);
      changeSet = new ChangeSet();
      sut = new ValueAttributeObserver(changeSet, el, 'value', new EventSubscriber(['change', 'input']));
      sut['callSubscribers'] = spy();

      sut.setValue(undefined);
      changeSet.flushChanges();
      expect(sut['callSubscribers']).not.to.have.been.called;
    });
  }
});
