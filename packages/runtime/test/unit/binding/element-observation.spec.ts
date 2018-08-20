import { ValueAttributeObserver, EventSubscriber, ChangeSet, CheckedObserver, IObserverLocator, IChangeSet, SelectValueObserver, BindingFlags } from "@aurelia/runtime";
import { createElement } from "../util";
import { expect } from "chai";
import { spy } from "sinon";
import { DI } from "@aurelia/kernel";

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

      sut.setValue('foo', BindingFlags.sourceOrigin);
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

      sut.setValue(null, BindingFlags.sourceOrigin);
      changeSet.flushChanges();
      expect(sut['callSubscribers']).not.to.have.been.called;
    });

    it(`setValue(undefined) does not call subscribers - ${markup}`, () => {
      el = createElement(markup);
      changeSet = new ChangeSet();
      sut = new ValueAttributeObserver(changeSet, el, 'value', new EventSubscriber(['change', 'input']));
      sut['callSubscribers'] = spy();

      sut.setValue(undefined, BindingFlags.sourceOrigin);
      changeSet.flushChanges();
      expect(sut['callSubscribers']).not.to.have.been.called;
    });
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
    sut.setValue(initialValue, BindingFlags.sourceOrigin);
    changeSet.flushChanges();

    return { changeSet, el, sut };
  }

  describe('setValue()', () => {
    for (const initChecked of [true, false]) {
      for (const setChecked of [true, false]) {
        it(`sets 'checked' from ${initChecked} to ${setChecked}`, () => {
          const { changeSet, el, sut } = createFixture(initChecked);

          sut.setValue(setChecked, BindingFlags.sourceOrigin);
          expect(el.checked).to.equal(initChecked);

          changeSet.flushChanges();
          expect(el.checked).to.equal(setChecked);
        });

        it(`only calls synchronizeElement() when the value changed (${initChecked} -> ${setChecked})`, () => {
          const { changeSet, el, sut } = createFixture(initChecked);
          const synchronizeElementSpy = spy(sut, 'synchronizeElement');

          sut.setValue(setChecked, BindingFlags.sourceOrigin);
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

            sut.setValue(next, BindingFlags.sourceOrigin);
            expect(el.checked).to.equal(initChecked);

            changeSet.flushChanges();
            expect(el.checked).to.equal(nextChecked);
          });
        }
      }
    }
  });
});

// TODO: need many more tests here, this is just preliminary
describe('SelectValueObserver', () => {
  function createFixture(initialValue = '', options = []) {
    const container = DI.createContainer();
    const observerLocator = <IObserverLocator>container.get(IObserverLocator);
    const changeSet = <IChangeSet>container.get(IChangeSet);
    const optionElements = options.map(o => `<option value="${o}">${o}</option>`).join('\n');
    const markup = `<select>\n${optionElements}\n</select>`;
    const el = <HTMLSelectElement>createElement(markup);
    const sut = <SelectValueObserver>observerLocator.getObserver(el, 'value');
    sut.setValue(initialValue, BindingFlags.sourceOrigin);
    changeSet.flushChanges();

    return { changeSet, el, sut };
  }

  describe('setValue()', () => {
    const valuesArr = [['', 'foo', 'bar']];
    const initialArr = ['', 'foo', 'bar'];
    const nextArr = ['', 'foo', 'bar'];
    for (const values of valuesArr) {
      for (const initial of initialArr) {
        for (const next of nextArr) {
          it(`sets 'value' from "${initial}" to "${next}"`, () => {
            const { changeSet, el, sut } = createFixture(initial, values);

            changeSet.flushChanges();
            expect(el.value).to.equal(initial);

            el.options.item(values.indexOf(next)).selected = true;

            changeSet.flushChanges();
            expect(el.value).to.equal(next);
          });
        }
      }
    }
  });
});
