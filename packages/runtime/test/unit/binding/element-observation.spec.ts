import { ValueAttributeObserver, EventSubscriber, ChangeSet, CheckedObserver, IObserverLocator, IChangeSet, SelectValueObserver, BindingFlags, Binding, IBindingTargetObserver, IPropertySubscriber, enableArrayObservation } from '../../../src/index';
import { createElement, _ } from '../util';
import { expect } from 'chai';
import { spy, SinonSpy } from 'sinon';
import { DI } from '../../../../kernel/src/index';

describe('ValueAttributeObserver', () => {
  // TODO: these input types don't behave consistently due to their various constraints.
  // These need to be discussed and probably need specific logic for them to work predictably
  const inputTypeArr = ['color', 'date', 'datetime-local', 'file', 'month', 'number', 'range', 'time', 'week'];

  for (const { inputType, nullValues, validValues } of [
      { inputType: 'button',   nullValues: [null, undefined], validValues: ['', 'foo'] },
      { inputType: 'email',    nullValues: [null, undefined], validValues: ['', 'foo'] },
      { inputType: 'hidden',   nullValues: [null, undefined], validValues: ['', 'foo'] },
      { inputType: 'image',    nullValues: [null, undefined], validValues: ['', 'foo'] },
      { inputType: 'password', nullValues: [null, undefined], validValues: ['', 'foo'] },
      { inputType: 'reset',    nullValues: [null, undefined], validValues: ['', 'foo'] },
      { inputType: 'search',   nullValues: [null, undefined], validValues: ['', 'foo'] },
      { inputType: 'submit',   nullValues: [null, undefined], validValues: ['', 'foo'] },
      { inputType: 'tel',      nullValues: [null, undefined], validValues: ['', 'foo'] },
      { inputType: 'text',     nullValues: [null, undefined], validValues: ['', 'foo'] },
      { inputType: 'url',      nullValues: [null, undefined], validValues: ['', 'foo'] }
    ]) {
    describe(`setValue() - type="${inputType}"`, () => {
      function setup(hasSubscriber: boolean) {
        const container = DI.createContainer();
        const changeSet = <IChangeSet>container.get(IChangeSet);
        const observerLocator = <IObserverLocator>container.get(IObserverLocator);

        const el = <HTMLInputElement>createElement(`<input type="${inputType}"/>`);
        document.body.appendChild(el);

        const sut = <ValueAttributeObserver>observerLocator.getObserver(el, 'value');

        let subscriber: IPropertySubscriber = { handleChange: spy() };
        if (hasSubscriber) {
          sut.subscribe(subscriber);
        }

        return { container, changeSet, observerLocator, el, sut, subscriber };
      }

      function tearDown({ sut, changeSet, el }: Partial<ReturnType<typeof setup>>) {
        document.body.removeChild(el);
        sut.dispose();
      }

      for (const hasSubscriber of [true, false]) {
        for (const valueBefore of [...nullValues, ...validValues]) {
          for (const valueAfter of [...nullValues, ...validValues]) {

            it(_`hasSubscriber=${hasSubscriber}, valueBefore=${valueBefore}, valueAfter=${valueAfter}`, () => {

              const { sut, changeSet, el, subscriber } = setup(hasSubscriber);

              const expectedValueBefore = nullValues.includes(valueBefore) ? sut.defaultValue : valueBefore;
              const expectedValueAfter = nullValues.includes(valueAfter) ? sut.defaultValue : valueAfter;

              const changeCountBefore = expectedValueBefore !== sut.defaultValue ? 1 : 0;
              const changeCountAfter = expectedValueBefore !== expectedValueAfter ? 1 : 0;
              let callCount = 0;

              sut.setValue(valueBefore, BindingFlags.none);
              expect(changeSet.size).to.equal(changeCountBefore, 'changeSet.size 1');
              changeSet.flushChanges();
              expect(el.value).to.equal(expectedValueBefore, 'el.value 1');
              expect(sut.getValue()).to.equal(expectedValueBefore, 'sut.getValue() 1');
              if (hasSubscriber && changeCountBefore) {
                callCount++;
                expect(subscriber.handleChange).to.have.been.calledWith(expectedValueBefore, sut.defaultValue, BindingFlags.fromFlushChanges | BindingFlags.updateTargetInstance);
              }

              sut.setValue(valueAfter, BindingFlags.none);
              expect(changeSet.size).to.equal(changeCountAfter, 'changeSet.size 2');
              changeSet.flushChanges();
              expect(el.value).to.equal(expectedValueAfter, 'el.value 2');
              expect(sut.getValue()).to.equal(expectedValueAfter, 'sut.getValue() 2');
              if (hasSubscriber && changeCountAfter) {
                callCount++;
                expect(subscriber.handleChange).to.have.been.calledWith(expectedValueAfter, expectedValueBefore, BindingFlags.fromFlushChanges | BindingFlags.updateTargetInstance);
              }
              if (hasSubscriber) {
                expect((<SinonSpy>subscriber.handleChange).getCalls().length).to.equal(callCount);
              }

              tearDown({ sut, changeSet, el });
            });
          }
        }
      }
    });

    describe(`handleEvent() - type="${inputType}"`, () => {
      function setup() {
        const container = DI.createContainer();
        const observerLocator = <IObserverLocator>container.get(IObserverLocator);

        const el = <HTMLInputElement>createElement(`<input type="${inputType}"/>`);
        document.body.appendChild(el);

        const sut = <ValueAttributeObserver>observerLocator.getObserver(el, 'value');

        let subscriber: IPropertySubscriber = { handleChange: spy() };
        sut.subscribe(subscriber);

        return { container, observerLocator, el, sut, subscriber };
      }

      function tearDown({ sut, el }: Partial<ReturnType<typeof setup>>) {
        document.body.removeChild(el);
        sut.dispose();
      }

      for (const valueBefore of [...nullValues, ...validValues]) {
        for (const valueAfter of [...nullValues, ...validValues]) {
          for (const event of ['change', 'input']) {

            it(_`valueBefore=${valueBefore}, valueAfter=${valueAfter}`, () => {

              const { sut, el, subscriber } = setup();

              // TODO: only setting input.value to null sets it to empty string. Setting it to undefined actually coerces to 'undefined'. This should work consistently in both directions
              const expectedValueBefore = valueBefore === null ? '' : valueBefore+'';
              const expectedValueAfter = valueAfter === null ? '' : valueAfter+'';
              let callCount = 0;

              el.value = valueBefore;
              el.dispatchEvent(new Event(event, eventDefaults));
              expect(el.value).to.equal(expectedValueBefore, 'el.value 1');
              expect(sut.getValue()).to.equal(expectedValueBefore, 'sut.getValue() 1');
              if (expectedValueBefore !== '') {
                callCount++;
                expect(subscriber.handleChange).to.have.been.calledWith(expectedValueBefore, sut.defaultValue, BindingFlags.updateSourceExpression | BindingFlags.fromDOMEvent);
              }

              el.value = valueAfter;
              el.dispatchEvent(new Event(event, eventDefaults));
              expect(el.value).to.equal(expectedValueAfter, 'el.value 2');
              expect(sut.getValue()).to.equal(expectedValueAfter, 'sut.getValue() 2');
              if (expectedValueBefore !== expectedValueAfter) {
                callCount++;
                expect(subscriber.handleChange).to.have.been.calledWith(expectedValueAfter, expectedValueBefore, BindingFlags.updateSourceExpression | BindingFlags.fromDOMEvent);
              }
              expect((<SinonSpy>subscriber.handleChange).getCalls().length).to.equal(callCount);

              tearDown({ sut, el });
            });
          }
        }
      }
    });
  }
});



type ObservedInputElement = HTMLInputElement & {
  $observers: Record<string, IBindingTargetObserver>;
  model: any;
  matcher: (a: any, b: any) => boolean;
  children: HTMLCollectionOf<ObservedInputElement>
};
type TwoWayBinding = Binding & { targetObserver: IBindingTargetObserver };

const eventDefaults = { bubbles: true };

describe('CheckedObserver', () => {
  before(() => {
    enableArrayObservation();
  })

  describe('setValue() - primitive - type="checkbox"', () => {
    function setup(hasSubscriber: boolean) {
      const container = DI.createContainer();
      const changeSet = <IChangeSet>container.get(IChangeSet);
      const observerLocator = <IObserverLocator>container.get(IObserverLocator);

      const el = <ObservedInputElement>createElement(`<input type="checkbox"/>`);
      document.body.appendChild(el);

      const sut = <CheckedObserver>observerLocator.getObserver(el, 'checked');
      observerLocator.getObserver(el, 'value');

      let subscriber: IPropertySubscriber = { handleChange: spy() };
      if (hasSubscriber) {
        sut.subscribe(subscriber);
      }

      return { container, changeSet, observerLocator, el, sut, subscriber };
    }

    function tearDown({ sut, changeSet, el }: Partial<ReturnType<typeof setup>>) {
      document.body.removeChild(el);
      sut.unbind();
      sut.dispose();
    }

    for (const hasSubscriber of [true, false]) {
      for (const checkedBefore of [true, false]) {
        for (const checkedAfter of [true, false]) {
          for (const uncheckedValue of (!(checkedBefore && checkedAfter)) ? [false, '', undefined, null, 0, 1, 'true'] : [null]) {
            for (const checkedValue of ((checkedBefore || checkedAfter) ? [true] : [null])) {

              const propValue = checkedBefore ? checkedValue : uncheckedValue;
              const newValue = checkedAfter ? checkedValue : uncheckedValue;

              it(_`hasSubscriber=${hasSubscriber}, checkedBefore=${checkedBefore}, checkedAfter=${checkedAfter}, propValue=${propValue}, newValue=${newValue}`, () => {

                const expectedPropValue = propValue === undefined ? null : propValue;
                const expectedNewValue = newValue === undefined ? null : newValue;

                const changeCountBefore = expectedPropValue !== null ? 1 : 0;
                const changeCountAfter = expectedPropValue !== expectedNewValue ? 1 : 0;

                const { sut, changeSet, el, subscriber } = setup(hasSubscriber);

                sut.setValue(propValue, BindingFlags.none);
                expect(changeSet.size).to.equal(changeCountBefore, 'changeSet.size 1');
                changeSet.flushChanges();
                expect(el.checked).to.equal(checkedBefore, 'el.checked 1');
                expect(sut.getValue()).to.equal(expectedPropValue, 'sut.getValue() 1');

                sut.setValue(newValue, BindingFlags.none);
                expect(el.checked).to.equal(checkedBefore, 'el.checked 2');
                expect(sut.getValue()).to.equal(expectedNewValue, 'sut.getValue() 2');
                expect(changeSet.size).to.equal(changeCountAfter, 'changeSet.size 2');
                changeSet.flushChanges();

                expect(el.checked).to.equal(checkedAfter, 'el.checked 3');
                expect(subscriber.handleChange).not.to.have.been.called;

                tearDown({ sut, changeSet, el });
              });
            }
          }
        }
      }
    }
  });

  describe('handleEvent() - primitive - type="checkbox"', () => {
    function setup() {
      const container = DI.createContainer();
      const observerLocator = <IObserverLocator>container.get(IObserverLocator);

      const el = <ObservedInputElement>createElement(`<input type="checkbox"/>`);
      document.body.appendChild(el);

      const sut = <CheckedObserver>observerLocator.getObserver(el, 'checked');

      let subscriber: IPropertySubscriber = { handleChange: spy() };
      sut.subscribe(subscriber);

      return { container, observerLocator, el, sut, subscriber };
    }

    function tearDown({ sut, el }: Partial<ReturnType<typeof setup>>) {
      document.body.removeChild(el);
      sut.unbind();
      sut.dispose();
    }

    for (const checkedBefore of [true, false]) {
      for (const checkedAfter of [true, false]) {
        for (const event of ['change', 'input']) {
          it(_`checkedBefore=${checkedBefore}, checkedAfter=${checkedAfter}, event=${event}`, () => {

            const { sut, el, subscriber } = setup();

            el.checked = checkedBefore;
            el.dispatchEvent(new Event(event, eventDefaults));
            expect(sut.getValue()).to.equal(checkedBefore, 'sut.getValue() 1');
            expect(subscriber.handleChange).to.have.been.calledWith(checkedBefore, null, BindingFlags.updateSourceExpression | BindingFlags.fromDOMEvent);

            el.checked = checkedAfter;
            el.dispatchEvent(new Event(event, eventDefaults));
            expect(sut.getValue()).to.equal(checkedAfter, 'sut.getValue() 2');

            if (checkedBefore !== checkedAfter) {
              expect(subscriber.handleChange).to.have.been.calledWith(checkedAfter, checkedBefore, BindingFlags.updateSourceExpression | BindingFlags.fromDOMEvent);
              expect(subscriber.handleChange).to.have.been.calledTwice;
            } else {
              expect(subscriber.handleChange).to.have.been.calledOnce;
            }

            tearDown({ sut, el });
          });
        }
      }
    }
  });

  describe('setValue() - primitive - type="radio"', () => {
    function setup(hasSubscriber: boolean) {
      const container = DI.createContainer();
      const changeSet = <IChangeSet>container.get(IChangeSet);
      const observerLocator = <IObserverLocator>container.get(IObserverLocator);
      const elA = <ObservedInputElement>createElement(`<input name="foo" type="radio" value="A"/>`);
      const elB = <ObservedInputElement>createElement(`<input name="foo" type="radio" value="B"/>`);
      const elC = <ObservedInputElement>createElement(`<input name="foo" type="radio" value="C"/>`);
      document.body.appendChild(elA);
      document.body.appendChild(elB);
      document.body.appendChild(elC);
      const sutA = <CheckedObserver>observerLocator.getObserver(elA, 'checked');
      const sutB = <CheckedObserver>observerLocator.getObserver(elB, 'checked');
      const sutC = <CheckedObserver>observerLocator.getObserver(elC, 'checked');
      observerLocator.getObserver(elA, 'value');
      observerLocator.getObserver(elB, 'value');
      observerLocator.getObserver(elC, 'value');

      let subscriberA: IPropertySubscriber = { handleChange: spy() };
      let subscriberB: IPropertySubscriber = { handleChange: spy() };
      let subscriberC: IPropertySubscriber = { handleChange: spy() };
      if (hasSubscriber) {
        sutA.subscribe(subscriberA);
        sutB.subscribe(subscriberB);
        sutC.subscribe(subscriberC);
      }

      return { container, changeSet, observerLocator, elA, elB, elC, sutA, sutB, sutC, subscriberA, subscriberB, subscriberC };
    }

    function tearDown({ sutA, sutB, sutC, elA, elB, elC, changeSet }: Partial<ReturnType<typeof setup>>) {
      document.body.removeChild(elA);
      document.body.removeChild(elB);
      document.body.removeChild(elC);
      sutA.unbind();
      sutB.unbind();
      sutC.unbind();
      sutA.dispose();
      sutB.dispose();
      sutC.dispose();
    }

    for (const hasSubscriber of [true, false]) {
      for (const checkedBefore of ['A', 'B', 'C', null, undefined]) {
        for (const checkedAfter of ['A', 'B', 'C', null, undefined]) {

          it(_`hasSubscriber=${hasSubscriber}, checkedBefore=${checkedBefore}, checkedAfter=${checkedAfter}`, () => {

            const expectedPropValue = checkedBefore === undefined ? null : checkedBefore;
            const expectedNewValue = checkedAfter === undefined ? null : checkedAfter;

            const changeCountBefore = expectedPropValue !== null ? 3 : 0;
            const changeCountAfter = expectedPropValue !== expectedNewValue ? 3 : 0;

            const { sutA, sutB, sutC, elA, elB, elC, changeSet, subscriberA, subscriberB, subscriberC } = setup(hasSubscriber);

            sutA.setValue(checkedBefore, BindingFlags.none);
            sutB.setValue(checkedBefore, BindingFlags.none);
            sutC.setValue(checkedBefore, BindingFlags.none);
            expect(changeSet.size).to.equal(changeCountBefore, 'changeSet.size 1');
            changeSet.flushChanges();
            expect(elA.checked).to.equal(checkedBefore === 'A', 'elA.checked 1');
            expect(elB.checked).to.equal(checkedBefore === 'B', 'elB.checked 1');
            expect(elC.checked).to.equal(checkedBefore === 'C', 'elC.checked 1');
            expect(sutA.getValue()).to.equal(expectedPropValue, 'sutA.getValue() 1');
            expect(sutB.getValue()).to.equal(expectedPropValue, 'sutB.getValue() 1');
            expect(sutC.getValue()).to.equal(expectedPropValue, 'sutC.getValue() 1');

            sutA.setValue(checkedAfter, BindingFlags.none);
            sutB.setValue(checkedAfter, BindingFlags.none);
            sutC.setValue(checkedAfter, BindingFlags.none);
            expect(elA.checked).to.equal(checkedBefore === 'A', 'elA.checked 2');
            expect(elB.checked).to.equal(checkedBefore === 'B', 'elB.checked 2');
            expect(elC.checked).to.equal(checkedBefore === 'C', 'elC.checked 2');
            expect(sutA.getValue()).to.equal(expectedNewValue, 'sutA.getValue() 2');
            expect(sutB.getValue()).to.equal(expectedNewValue, 'sutB.getValue() 2');
            expect(sutC.getValue()).to.equal(expectedNewValue, 'sutC.getValue() 2');
            expect(changeSet.size).to.equal(changeCountAfter, 'changeSet.size 2');
            changeSet.flushChanges();

            expect(elA.checked).to.equal(checkedAfter === 'A', 'elA.checked 3');
            expect(elB.checked).to.equal(checkedAfter === 'B', 'elB.checked 3');
            expect(elC.checked).to.equal(checkedAfter === 'C', 'elC.checked 3');

            expect(subscriberA.handleChange).not.to.have.been.called;
            expect(subscriberB.handleChange).not.to.have.been.called;
            expect(subscriberC.handleChange).not.to.have.been.called;

            tearDown({ sutA, sutB, sutC, elA, elB, elC, changeSet });
          });
        }
      }
    }
  });

  describe('handleEvent() - primitive - type="radio"', () => {
    function setup() {
      const container = DI.createContainer();
      const changeSet = <IChangeSet>container.get(IChangeSet);
      const observerLocator = <IObserverLocator>container.get(IObserverLocator);
      const elA = <ObservedInputElement>createElement(`<input name="foo" type="radio" value="A"/>`);
      const elB = <ObservedInputElement>createElement(`<input name="foo" type="radio" value="B"/>`);
      const elC = <ObservedInputElement>createElement(`<input name="foo" type="radio" value="C"/>`);
      document.body.appendChild(elA);
      document.body.appendChild(elB);
      document.body.appendChild(elC);
      const sutA = <CheckedObserver>observerLocator.getObserver(elA, 'checked');
      const sutB = <CheckedObserver>observerLocator.getObserver(elB, 'checked');
      const sutC = <CheckedObserver>observerLocator.getObserver(elC, 'checked');
      let subscriberA: IPropertySubscriber = { handleChange: spy() };
      let subscriberB: IPropertySubscriber = { handleChange: spy() };
      let subscriberC: IPropertySubscriber = { handleChange: spy() };
      sutA.subscribe(subscriberA);
      sutB.subscribe(subscriberB);
      sutC.subscribe(subscriberC);

      return { container, changeSet, observerLocator, elA, elB, elC, sutA, sutB, sutC, subscriberA, subscriberB, subscriberC };
    }

    function tearDown({ sutA, sutB, sutC, elA, elB, elC, changeSet }: Partial<ReturnType<typeof setup>>) {
      document.body.removeChild(elA);
      document.body.removeChild(elB);
      document.body.removeChild(elC);
      sutA.unbind();
      sutB.unbind();
      sutC.unbind();
      sutA.dispose();
      sutB.dispose();
      sutC.dispose();
    }

    for (const checkedBefore of ['A', 'B', 'C']) {
      for (const checkedAfter of ['A', 'B', 'C']) {
        for (const event of ['change', 'input']) {

          it(_`checkedBefore=${checkedBefore}, checkedAfter=${checkedAfter}, event=${event}`, () => {

            const { sutA, sutB, sutC, elA, elB, elC, subscriberA, subscriberB, subscriberC } = setup();

            elA.checked = checkedBefore === 'A';
            elB.checked = checkedBefore === 'B';
            elC.checked = checkedBefore === 'C';
            elA.dispatchEvent(new Event(event, eventDefaults));
            elB.dispatchEvent(new Event(event, eventDefaults));
            elC.dispatchEvent(new Event(event, eventDefaults));
            expect(sutA.getValue()).to.equal(checkedBefore === 'A' ? 'A' : null, 'sutA.getValue() 1');
            expect(sutB.getValue()).to.equal(checkedBefore === 'B' ? 'B' : null, 'sutB.getValue() 1');
            expect(sutC.getValue()).to.equal(checkedBefore === 'C' ? 'C' : null, 'sutC.getValue() 1');
            expect(elA.checked).to.equal(checkedBefore === 'A', 'elA.checked 1');
            expect(elB.checked).to.equal(checkedBefore === 'B', 'elB.checked 1');
            expect(elC.checked).to.equal(checkedBefore === 'C', 'elC.checked 1');

            elA.checked = checkedAfter === 'A';
            elB.checked = checkedAfter === 'B';
            elC.checked = checkedAfter === 'C';
            elA.dispatchEvent(new Event(event, eventDefaults));
            elB.dispatchEvent(new Event(event, eventDefaults));
            elC.dispatchEvent(new Event(event, eventDefaults));
            expect(sutA.getValue()).to.equal(checkedBefore === 'A' || checkedAfter === 'A' ? 'A' : null, 'sutA.getValue() 2');
            expect(sutB.getValue()).to.equal(checkedBefore === 'B' || checkedAfter === 'B' ? 'B' : null, 'sutB.getValue() 2');
            expect(sutC.getValue()).to.equal(checkedBefore === 'C' || checkedAfter === 'C' ? 'C' : null, 'sutC.getValue() 2');
            expect(elA.checked).to.equal(checkedAfter === 'A', 'elA.checked 2');
            expect(elB.checked).to.equal(checkedAfter === 'B', 'elB.checked 2');
            expect(elC.checked).to.equal(checkedAfter === 'C', 'elC.checked 2');

            tearDown({ sutA, sutB, sutC, elA, elB, elC });
          });
        }
      }
    }
  });

  describe('setValue() - array - type="checkbox"', () => {
    function setup(hasSubscriber: boolean, value: any, prop: string) {
      const container = DI.createContainer();
      const changeSet = <IChangeSet>container.get(IChangeSet);
      const observerLocator = <IObserverLocator>container.get(IObserverLocator);

      const el = <ObservedInputElement>createElement(`<input type="checkbox"/>`);
      el[prop] = value;
      document.body.appendChild(el);

      const sut = <CheckedObserver>observerLocator.getObserver(el, 'checked');
      observerLocator.getObserver(el, prop);

      let subscriber: IPropertySubscriber = { handleChange: spy() };
      if (hasSubscriber) {
        sut.subscribe(subscriber);
      }

      return { value, container, changeSet, observerLocator, el, sut, subscriber };
    }

    function tearDown({ sut, changeSet, el }: Partial<ReturnType<typeof setup>>) {
      document.body.removeChild(el);
      sut.unbind();
      sut.dispose();
    }

    for (const hasSubscriber of [true, false]) {
      for (const prop of ['value', 'model']) {
        for (const value of ['foo', 'bar', 42, null, undefined, '']) {

          const valueCanBeChecked = prop === 'model' || (typeof value !== 'number' && value !== undefined);

          for (const checkedBefore of [true, false]) {
            for (const checkedAfter of [true, false]) {
              for (const uncheckedValue of (!(checkedBefore && checkedAfter)) ? [[], [!value ? 'foo' : '']] : [[]]) {
                for (const checkedValue of ((checkedBefore || checkedAfter) ? [[value, '']] : [[]])) {

                  const propValue = checkedBefore ? checkedValue : uncheckedValue;
                  const newValue = checkedAfter ? checkedValue : uncheckedValue;

                  it(_`hasSubscriber=${hasSubscriber}, ${prop}=${value}, checkedBefore=${checkedBefore}, checkedAfter=${checkedAfter}, propValue=${propValue}, newValue=${newValue}`, () => {

                    const changeCountBefore = 1;
                    const changeCountAfter = checkedBefore !== checkedAfter ? 1 : 0;

                    const { sut, changeSet, el, subscriber } = setup(hasSubscriber, value, prop);

                    sut.setValue(propValue, BindingFlags.none);
                    expect(changeSet.size).to.equal(changeCountBefore, 'changeSet.size 1');
                    changeSet.flushChanges();
                    expect(el.checked).to.equal(valueCanBeChecked && checkedBefore, 'el.checked 1');
                    expect(sut.getValue()).to.equal(propValue, 'sut.getValue() 1');

                    sut.setValue(newValue, BindingFlags.none);
                    expect(el.checked).to.equal(valueCanBeChecked && checkedBefore, 'el.checked 2');
                    expect(sut.getValue()).to.equal(newValue, 'sut.getValue() 2');
                    expect(changeSet.size).to.equal(changeCountAfter, 'changeSet.size 2');
                    changeSet.flushChanges();

                    expect(el.checked).to.equal(valueCanBeChecked && checkedAfter, 'el.checked 3');
                    expect(subscriber.handleChange).not.to.have.been.called;

                    tearDown({ sut, changeSet, el });
                  });
                }
              }
            }
          }
        }
      }
    }
  });

  describe('mutate collection - array - type="checkbox"', () => {
    function setup(hasSubscriber: boolean, value: any, prop: string) {
      const container = DI.createContainer();
      const changeSet = <IChangeSet>container.get(IChangeSet);
      const observerLocator = <IObserverLocator>container.get(IObserverLocator);

      const el = <ObservedInputElement>createElement(`<input type="checkbox"/>`);
      el[prop] = value;
      document.body.appendChild(el);

      const sut = <CheckedObserver>observerLocator.getObserver(el, 'checked');
      observerLocator.getObserver(el, prop);

      let subscriber: IPropertySubscriber = { handleChange: spy() };
      if (hasSubscriber) {
        sut.subscribe(subscriber);
      }

      return { value, container, changeSet, observerLocator, el, sut, subscriber };
    }

    function tearDown({ sut, changeSet, el }: Partial<ReturnType<typeof setup>>) {
      document.body.removeChild(el);
      sut.unbind();
      sut.dispose();
    }

    for (const hasSubscriber of [true, false]) {
      for (const prop of ['value', 'model']) {
        for (const value of ['foo', 'bar', 42, null, undefined, '']) {

          const valueCanBeChecked = prop === 'model' || (typeof value !== 'number' && value !== undefined && value !== null);

          it(_`hasSubscriber=${hasSubscriber}, ${prop}=${value}`, () => {

            const array = [];

            const { sut, changeSet, el, subscriber } = setup(hasSubscriber, value, prop);

            sut.setValue(array, BindingFlags.none);
            expect(changeSet.size).to.equal(1, 'changeSet.size 1');
            changeSet.flushChanges();
            expect(el.checked).to.equal(false, 'el.checked 1');
            expect(sut.getValue()).to.equal(array, 'sut.getValue() 1');

            array.push(value);
            expect(el.checked).to.equal(false, 'el.checked 2');
            expect(changeSet.size).to.equal(1, 'changeSet.size 2');
            changeSet.flushChanges();
            expect(el.checked).to.equal(valueCanBeChecked, 'el.checked 3');

            array.pop();
            expect(el.checked).to.equal(valueCanBeChecked, 'el.checked 4');
            expect(changeSet.size).to.equal(1, 'changeSet.size 3');
            changeSet.flushChanges();
            expect(el.checked).to.equal(false, 'el.checked 5');
            expect(subscriber.handleChange).not.to.have.been.called;

            tearDown({ sut, changeSet, el });
          });
        }
      }
    }
  });

  describe('handleEvent() - array - type="checkbox"', () => {
    function setup(value: any, prop: string) {
      const container = DI.createContainer();
      const observerLocator = <IObserverLocator>container.get(IObserverLocator);

      const el = <ObservedInputElement>createElement(`<input type="checkbox"/>`);
      el[prop] = value;
      document.body.appendChild(el);

      const sut = <CheckedObserver>observerLocator.getObserver(el, 'checked');

      let subscriber: IPropertySubscriber = { handleChange: spy() };
      sut.subscribe(subscriber);

      return { value, container, observerLocator, el, sut, subscriber };
    }

    function tearDown({ sut, el }: Partial<ReturnType<typeof setup>>) {
      document.body.removeChild(el);
      sut.unbind();
      sut.dispose();
    }

    for (const prop of ['value', 'model']) {
      for (const value of ['foo', 'bar', 42, null, undefined, '']) {

        for (const checkedBefore of [true, false]) {
          for (const checkedAfter of [true, false]) {
            for (const event of ['change', 'input']) {

              it(_`${prop}=${value}, checkedBefore=${checkedBefore}, checkedAfter=${checkedAfter}, event=${event}`, async () => {

                const { sut, el, subscriber } = setup(value, prop);

                const array = [];
                await sut.setValue(array, BindingFlags.none);
                el.checked = checkedBefore;
                el.dispatchEvent(new Event(event, eventDefaults));
                let actual = sut.getValue();
                if (checkedBefore) {
                  expect(actual[0]).to.equal(prop === 'value' ? (value !== null ? value+'' : '') : value); // TODO: maybe we should coerce value in the observer
                } else {
                  expect(actual).to.equal(array);
                }

                el.checked = checkedAfter;
                el.dispatchEvent(new Event(event, eventDefaults));
                actual = sut.getValue();
                if (checkedAfter) {
                  expect(actual[0]).to.equal(prop === 'value' ? (value !== null ? value+'' : '') : value); // TODO: maybe we should coerce value in the observer
                } else {
                  expect(actual).to.equal(array);
                }
                expect(subscriber.handleChange).not.to.have.been.called;

                tearDown({ sut, el });
              });
            }
          }
        }
      }
    }
  });

  describe('SelectValueObserver.setValue() - array - type="checkbox"', () => {
    function setup(hasSubscriber: boolean, value: any, prop: string) {
      const container = DI.createContainer();
      const changeSet = <IChangeSet>container.get(IChangeSet);
      const observerLocator = <IObserverLocator>container.get(IObserverLocator);

      const el = <ObservedInputElement>createElement(`<input type="checkbox"/>`);
      document.body.appendChild(el);

      const sut = <CheckedObserver>observerLocator.getObserver(el, 'checked');
      const valueOrModelObserver = <IBindingTargetObserver>observerLocator.getObserver(el, prop);

      let subscriber: IPropertySubscriber = { handleChange: spy() };
      if (hasSubscriber) {
        sut.subscribe(subscriber);
      }

      return { value, container, observerLocator, el, sut, subscriber, valueOrModelObserver, changeSet };
    }

    function tearDown({ sut, el }: Partial<ReturnType<typeof setup>>) {
      document.body.removeChild(el);
      sut.unbind();
      sut.dispose();
    }

    for (const hasSubscriber of [true, false]) {
      for (const prop of ['value', 'model']) {
        for (const value of ['foo', 'bar', 42, null, undefined, '']) {

          const valueCanBeChecked = prop === 'model' || (typeof value !== 'number' && value !== undefined && value !== null);

          for (const checkedBefore of [true, false]) {
            for (const checkedAfter of [true, false]) {
              for (const uncheckedValue of (!(checkedBefore && checkedAfter)) ? [[], [!value ? 'foo' : '']] : [[]]) {
                for (const checkedValue of ((checkedBefore || checkedAfter) ? [[value, '']] : [[]])) {

                  const propValue = checkedBefore ? checkedValue : uncheckedValue;
                  const newValue = checkedAfter ? checkedValue : uncheckedValue;

                  it(_`hasSubscriber=${hasSubscriber}, ${prop}=${value}, checkedBefore=${checkedBefore}, checkedAfter=${checkedAfter}, propValue=${propValue}, newValue=${newValue}`, () => {

                    const { sut, el, subscriber, valueOrModelObserver, changeSet } = setup(hasSubscriber, value, prop);

                    sut.setValue(propValue, BindingFlags.none);
                    changeSet.flushChanges();
                    expect(sut.getValue()).to.equal(propValue, 'sut.getValue() 1');

                    expect(el.checked).to.equal(prop === 'model' && value === undefined && propValue === checkedValue, 'el.checked 1');
                    valueOrModelObserver.setValue(value, BindingFlags.none | BindingFlags.fromFlushChanges);
                    expect(el.checked).to.equal(valueCanBeChecked && checkedBefore, 'el.checked 2');
                    changeSet.flushChanges();
                    expect(el.checked).to.equal(valueCanBeChecked && checkedBefore, 'el.checked 3');

                    sut.setValue(newValue, BindingFlags.none);
                    changeSet.flushChanges();
                    expect(sut.getValue()).to.equal(newValue, 'sut.getValue() 2');

                    valueOrModelObserver.setValue(value, BindingFlags.none | BindingFlags.fromFlushChanges);
                    expect(el.checked).to.equal(valueCanBeChecked && checkedAfter, 'el.checked 4');
                    changeSet.flushChanges();
                    expect(el.checked).to.equal(valueCanBeChecked && checkedAfter, 'el.checked 5');
                    expect(subscriber.handleChange).not.to.have.been.called;

                    tearDown({ sut, el });
                  });
                }
              }
            }
          }
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
    sut.setValue(initialValue, BindingFlags.none);
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
