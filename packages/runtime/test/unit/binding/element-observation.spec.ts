import { XLinkAttributeObserver, DataAttributeObserver, StyleObserver, ValueAttributeObserver, EventSubscriber, ChangeSet, ClassObserver, CheckedObserver, IObserverLocator, IChangeSet } from "@aurelia/runtime";
import { createElement, globalAttributeNames } from "../util";
import { expect } from "chai";
import { CSS_PROPERTIES } from "../css-properties";
import { spy } from "sinon";
import { IContainer, DI } from "@aurelia/kernel";


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


describe('ClassObserver', () => {
  let sut: ClassObserver;
  let el: Element;
  let changeSet: ChangeSet;
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
        changeSet = new ChangeSet();
        sut = new ClassObserver(changeSet, el);
      });

      it(`setValue("${classList}") updates ${markup}`, () => {
        sut.setValue(classList);
        expect(el.classList.toString()).to.equal(initialClassList);
        changeSet.flushChanges();
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
          sut.setValue(classList);
          changeSet.flushChanges();
          const updatedClassList = el.classList.toString();
          sut.setValue(secondClassList);
          expect(el.classList.toString()).to.equal(updatedClassList);
          changeSet.flushChanges();
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
      };
    }
  }
});

// TODO: need many more tests here, this is just preliminary
describe('CheckedObserver', () => {
  function createFixture(initialValue: boolean | any[] = false, value = '') {
    const container = DI.createContainer();
    const observerLocator = <IObserverLocator>container.get(IObserverLocator);
    const changeSet = <IChangeSet>container.get(IChangeSet);
    const markup = `<input type="checkbox">`;
    const el = <HTMLInputElement>createElement(markup);
    el.value = value;
    const sut = <CheckedObserver>observerLocator.getObserver(el, 'checked');
    sut.setValue(initialValue);
    changeSet.flushChanges();

    return { changeSet, el, sut };
  }

  describe('setValue()', () => {
    for (const initChecked of [true, false]) {
      for (const setChecked of [true, false]) {
        it(`sets 'checked' from ${initChecked} to ${setChecked}`, () => {
          const { changeSet, el, sut } = createFixture(initChecked);

          sut.setValue(setChecked);
          expect(el.checked).to.equal(initChecked);

          changeSet.flushChanges();
          expect(el.checked).to.equal(setChecked);
        });

        it(`only calls synchronizeElement() when the value changed (${initChecked} -> ${setChecked})`, () => {
          const { changeSet, el, sut } = createFixture(initChecked);
          const synchronizeElementSpy = spy(sut, 'synchronizeElement');

          sut.setValue(setChecked);
          expect(synchronizeElementSpy).not.to.have.been.called;

          changeSet.flushChanges();
          if (initChecked === setChecked) {
            expect(synchronizeElementSpy).not.to.have.been.called;
          } else {
            expect(synchronizeElementSpy).to.have.been.called;
          }
        });
      }
    }

    for (const value of ['', 'foo']) {
      for (const init of [[], [''], ['', 'foo']]) {
        for (const next of [[], [''], ['', 'foo']]) {
          it(`sets 'checked' state correctly on array assignment - value="${value}", init=["${init.join('","')}"], next=["${next.join('","')}"]`, () => {
            const { changeSet, el, sut } = createFixture(init, value);
            const initChecked = init.includes(value);
            const nextChecked = next.includes(value);

            sut.setValue(next);
            expect(el.checked).to.equal(initChecked);

            changeSet.flushChanges();
            expect(el.checked).to.equal(nextChecked);
          });
        }
      }
    }
  });
});
