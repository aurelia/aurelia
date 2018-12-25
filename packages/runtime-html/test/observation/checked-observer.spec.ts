import {
  CheckedObserver,
  IObserverLocator,
  ILifecycle,
  LifecycleFlags,
  Binding,
  IBindingTargetObserver,
  IPropertySubscriber,
  enableArrayObservation,
  Lifecycle,
  DOM,
  IDOM
} from '../../src/index';
import { createElement, _ } from '../unit/util';
import { expect } from 'chai';
import { spy, SinonSpy } from 'sinon';
import { DI, Registration } from '../../../kernel/src/index';

const dom = new DOM(<any>document);
const domRegistration = Registration.instance(IDOM, dom);

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
      container.register(domRegistration);
      const lifecycle = container.get(ILifecycle) as Lifecycle;
      const observerLocator = <IObserverLocator>container.get(IObserverLocator);

      const el = <ObservedInputElement>createElement(`<input type="checkbox"/>`);
      document.body.appendChild(el);

      const sut = <CheckedObserver>observerLocator.getObserver(el, 'checked');
      observerLocator.getObserver(el, 'value');

      let subscriber: IPropertySubscriber = { handleChange: spy() };
      if (hasSubscriber) {
        sut.subscribe(subscriber);
      }

      return { container, lifecycle, observerLocator, el, sut, subscriber };
    }

    function tearDown({ sut, lifecycle, el }: Partial<ReturnType<typeof setup>>) {
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

                const { sut, lifecycle, el, subscriber } = setup(hasSubscriber);

                sut.setValue(propValue, LifecycleFlags.none);
                expect(lifecycle.flushCount).to.equal(changeCountBefore, 'lifecycle.flushCount 1');
                lifecycle.processFlushQueue(LifecycleFlags.none);
                expect(el.checked).to.equal(checkedBefore, 'el.checked 1');
                expect(sut.getValue()).to.equal(expectedPropValue, 'sut.getValue() 1');

                sut.setValue(newValue, LifecycleFlags.none);
                expect(el.checked).to.equal(checkedBefore, 'el.checked 2');
                expect(sut.getValue()).to.equal(expectedNewValue, 'sut.getValue() 2');
                expect(lifecycle.flushCount).to.equal(changeCountAfter, 'lifecycle.flushCount 2');
                lifecycle.processFlushQueue(LifecycleFlags.none);

                expect(el.checked).to.equal(checkedAfter, 'el.checked 3');
                expect(subscriber.handleChange).not.to.have.been.called;

                tearDown({ sut, lifecycle, el });
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
      container.register(domRegistration);
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
            expect(subscriber.handleChange).to.have.been.calledWith(checkedBefore, null, LifecycleFlags.updateSourceExpression | LifecycleFlags.fromDOMEvent);

            el.checked = checkedAfter;
            el.dispatchEvent(new Event(event, eventDefaults));
            expect(sut.getValue()).to.equal(checkedAfter, 'sut.getValue() 2');

            if (checkedBefore !== checkedAfter) {
              expect(subscriber.handleChange).to.have.been.calledWith(checkedAfter, checkedBefore, LifecycleFlags.updateSourceExpression | LifecycleFlags.fromDOMEvent);
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
      container.register(domRegistration);
      const lifecycle = container.get(ILifecycle) as Lifecycle;
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

      return { container, lifecycle, observerLocator, elA, elB, elC, sutA, sutB, sutC, subscriberA, subscriberB, subscriberC };
    }

    function tearDown({ sutA, sutB, sutC, elA, elB, elC, lifecycle }: Partial<ReturnType<typeof setup>>) {
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

            const { sutA, sutB, sutC, elA, elB, elC, lifecycle, subscriberA, subscriberB, subscriberC } = setup(hasSubscriber);

            sutA.setValue(checkedBefore, LifecycleFlags.none);
            sutB.setValue(checkedBefore, LifecycleFlags.none);
            sutC.setValue(checkedBefore, LifecycleFlags.none);
            expect(lifecycle.flushCount).to.equal(changeCountBefore, 'lifecycle.flushCount 1');
            lifecycle.processFlushQueue(LifecycleFlags.none);
            expect(elA.checked).to.equal(checkedBefore === 'A', 'elA.checked 1');
            expect(elB.checked).to.equal(checkedBefore === 'B', 'elB.checked 1');
            expect(elC.checked).to.equal(checkedBefore === 'C', 'elC.checked 1');
            expect(sutA.getValue()).to.equal(expectedPropValue, 'sutA.getValue() 1');
            expect(sutB.getValue()).to.equal(expectedPropValue, 'sutB.getValue() 1');
            expect(sutC.getValue()).to.equal(expectedPropValue, 'sutC.getValue() 1');

            sutA.setValue(checkedAfter, LifecycleFlags.none);
            sutB.setValue(checkedAfter, LifecycleFlags.none);
            sutC.setValue(checkedAfter, LifecycleFlags.none);
            expect(elA.checked).to.equal(checkedBefore === 'A', 'elA.checked 2');
            expect(elB.checked).to.equal(checkedBefore === 'B', 'elB.checked 2');
            expect(elC.checked).to.equal(checkedBefore === 'C', 'elC.checked 2');
            expect(sutA.getValue()).to.equal(expectedNewValue, 'sutA.getValue() 2');
            expect(sutB.getValue()).to.equal(expectedNewValue, 'sutB.getValue() 2');
            expect(sutC.getValue()).to.equal(expectedNewValue, 'sutC.getValue() 2');
            expect(lifecycle.flushCount).to.equal(changeCountAfter, 'lifecycle.flushCount 2');
            lifecycle.processFlushQueue(LifecycleFlags.none);

            expect(elA.checked).to.equal(checkedAfter === 'A', 'elA.checked 3');
            expect(elB.checked).to.equal(checkedAfter === 'B', 'elB.checked 3');
            expect(elC.checked).to.equal(checkedAfter === 'C', 'elC.checked 3');

            expect(subscriberA.handleChange).not.to.have.been.called;
            expect(subscriberB.handleChange).not.to.have.been.called;
            expect(subscriberC.handleChange).not.to.have.been.called;

            tearDown({ sutA, sutB, sutC, elA, elB, elC, lifecycle });
          });
        }
      }
    }
  });

  describe('handleEvent() - primitive - type="radio"', () => {
    function setup() {
      const container = DI.createContainer();
      container.register(domRegistration);
      const lifecycle = container.get(ILifecycle) as Lifecycle;
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

      return { container, lifecycle, observerLocator, elA, elB, elC, sutA, sutB, sutC, subscriberA, subscriberB, subscriberC };
    }

    function tearDown({ sutA, sutB, sutC, elA, elB, elC, lifecycle }: Partial<ReturnType<typeof setup>>) {
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
      container.register(domRegistration);
      const lifecycle = container.get(ILifecycle) as Lifecycle;
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

      return { value, container, lifecycle, observerLocator, el, sut, subscriber };
    }

    function tearDown({ sut, lifecycle, el }: Partial<ReturnType<typeof setup>>) {
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

                    const { sut, lifecycle, el, subscriber } = setup(hasSubscriber, value, prop);

                    sut.setValue(propValue, LifecycleFlags.none);
                    expect(lifecycle.flushCount).to.equal(changeCountBefore, 'lifecycle.flushCount 1');
                    lifecycle.processFlushQueue(LifecycleFlags.none);
                    expect(el.checked).to.equal(valueCanBeChecked && checkedBefore, 'el.checked 1');
                    expect(sut.getValue()).to.equal(propValue, 'sut.getValue() 1');

                    sut.setValue(newValue, LifecycleFlags.none);
                    expect(el.checked).to.equal(valueCanBeChecked && checkedBefore, 'el.checked 2');
                    expect(sut.getValue()).to.equal(newValue, 'sut.getValue() 2');
                    expect(lifecycle.flushCount).to.equal(changeCountAfter, 'lifecycle.flushCount 2');
                    lifecycle.processFlushQueue(LifecycleFlags.none);

                    expect(el.checked).to.equal(valueCanBeChecked && checkedAfter, 'el.checked 3');
                    expect(subscriber.handleChange).not.to.have.been.called;

                    tearDown({ sut, lifecycle, el });
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
      container.register(domRegistration);
      const lifecycle = container.get(ILifecycle) as Lifecycle;
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

      return { value, container, lifecycle, observerLocator, el, sut, subscriber };
    }

    function tearDown({ sut, lifecycle, el }: Partial<ReturnType<typeof setup>>) {
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

            const { sut, lifecycle, el, subscriber } = setup(hasSubscriber, value, prop);

            sut.setValue(array, LifecycleFlags.none);
            expect(lifecycle.flushCount).to.equal(1, 'lifecycle.flushCount 1');
            lifecycle.processFlushQueue(LifecycleFlags.none);
            expect(el.checked).to.equal(false, 'el.checked 1');
            expect(sut.getValue()).to.equal(array, 'sut.getValue() 1');

            array.push(value);
            expect(el.checked).to.equal(false, 'el.checked 2');
            expect(lifecycle.flushCount).to.equal(1, 'lifecycle.flushCount 2');
            lifecycle.processFlushQueue(LifecycleFlags.none);
            expect(el.checked).to.equal(valueCanBeChecked, 'el.checked 3');

            array.pop();
            expect(el.checked).to.equal(valueCanBeChecked, 'el.checked 4');
            expect(lifecycle.flushCount).to.equal(1, 'lifecycle.flushCount 3');
            lifecycle.processFlushQueue(LifecycleFlags.none);
            expect(el.checked).to.equal(false, 'el.checked 5');
            expect(subscriber.handleChange).not.to.have.been.called;

            tearDown({ sut, lifecycle, el });
          });
        }
      }
    }
  });

  describe('handleEvent() - array - type="checkbox"', () => {
    function setup(value: any, prop: string) {
      const container = DI.createContainer();
      container.register(domRegistration);
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
                await sut.setValue(array, LifecycleFlags.none);
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
      container.register(domRegistration);
      const lifecycle = container.get(ILifecycle) as Lifecycle;
      const observerLocator = <IObserverLocator>container.get(IObserverLocator);

      const el = <ObservedInputElement>createElement(`<input type="checkbox"/>`);
      document.body.appendChild(el);

      const sut = <CheckedObserver>observerLocator.getObserver(el, 'checked');
      const valueOrModelObserver = <IBindingTargetObserver>observerLocator.getObserver(el, prop);

      let subscriber: IPropertySubscriber = { handleChange: spy() };
      if (hasSubscriber) {
        sut.subscribe(subscriber);
      }

      return { value, container, observerLocator, el, sut, subscriber, valueOrModelObserver, lifecycle };
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

                    const { sut, el, subscriber, valueOrModelObserver, lifecycle } = setup(hasSubscriber, value, prop);

                    sut.setValue(propValue, LifecycleFlags.none);
                    lifecycle.processFlushQueue(LifecycleFlags.none);
                    expect(sut.getValue()).to.equal(propValue, 'sut.getValue() 1');

                    expect(el.checked).to.equal(prop === 'model' && value === undefined && propValue === checkedValue, 'el.checked 1');
                    valueOrModelObserver.setValue(value, LifecycleFlags.none | LifecycleFlags.fromFlush);
                    expect(el.checked).to.equal(valueCanBeChecked && checkedBefore, 'el.checked 2');
                    lifecycle.processFlushQueue(LifecycleFlags.none);
                    expect(el.checked).to.equal(valueCanBeChecked && checkedBefore, 'el.checked 3');

                    sut.setValue(newValue, LifecycleFlags.none);
                    lifecycle.processFlushQueue(LifecycleFlags.none);
                    expect(sut.getValue()).to.equal(newValue, 'sut.getValue() 2');

                    valueOrModelObserver.setValue(value, LifecycleFlags.none | LifecycleFlags.fromFlush);
                    expect(el.checked).to.equal(valueCanBeChecked && checkedAfter, 'el.checked 4');
                    lifecycle.processFlushQueue(LifecycleFlags.none);
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
