import {
  enableArrayObservation,
  IBindingTargetObserver,
  IPropertySubscriber,
  LifecycleFlags as LF
} from '@aurelia/runtime';
import { expect } from 'chai';
import { spy } from 'sinon';
import { CheckedObserver, IInputElement } from '../../src/index';
import { _, TestContext } from '../util';

type ObservedInputElement = HTMLInputElement & {
  $observers: Record<string, IBindingTargetObserver>;
  model: any;
  children: HTMLCollectionOf<ObservedInputElement>;
  matcher(a: any, b: any): boolean;
};

const eventDefaults = { bubbles: true };

describe('CheckedObserver', function() {

  before(function() {
    enableArrayObservation();
  });

  describe('setValue() - primitive - type="checkbox"', function() {
    function setup(hasSubscriber: boolean) {
      const ctx = TestContext.createHTMLTestContext();
      const { container, lifecycle, observerLocator } = ctx;
      const el = ctx.createElementFromMarkup(`<input type="checkbox"/>`) as IInputElement;
      ctx.doc.body.appendChild(el);

      const sut = ctx.observerLocator.getObserver(LF.none, el, 'checked') as CheckedObserver;
      ctx.observerLocator.getObserver(LF.none, el, 'value');

      const subscriber: IPropertySubscriber = { handleChange: spy() };
      if (hasSubscriber) {
        sut.subscribe(subscriber);
      }

      return { ctx, container, lifecycle, observerLocator, el, sut, subscriber };
    }

    function tearDown({ ctx, sut, el }: Partial<ReturnType<typeof setup>>) {
      ctx.doc.body.removeChild(el);
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

              it(_`hasSubscriber=${hasSubscriber}, checkedBefore=${checkedBefore}, checkedAfter=${checkedAfter}, propValue=${propValue}, newValue=${newValue}`, function() {

                const expectedPropValue = propValue === undefined ? null : propValue;
                const expectedNewValue = newValue === undefined ? null : newValue;

                const changeCountBefore = expectedPropValue !== null ? 1 : 0;
                const changeCountAfter = expectedPropValue !== expectedNewValue ? 1 : 0;

                const { ctx, sut, lifecycle, el, subscriber } = setup(hasSubscriber);

                sut.setValue(propValue, LF.none);
                expect(lifecycle.flushCount).to.equal(changeCountBefore, 'lifecycle.flushCount 1');
                lifecycle.processFlushQueue(LF.none);
                expect(el.checked).to.equal(checkedBefore, 'el.checked 1');
                expect(sut.getValue()).to.equal(expectedPropValue, 'sut.getValue() 1');

                sut.setValue(newValue, LF.none);
                expect(el.checked).to.equal(checkedBefore, 'el.checked 2');
                expect(sut.getValue()).to.equal(expectedNewValue, 'sut.getValue() 2');
                expect(lifecycle.flushCount).to.equal(changeCountAfter, 'lifecycle.flushCount 2');
                lifecycle.processFlushQueue(LF.none);

                expect(el.checked).to.equal(checkedAfter, 'el.checked 3');
                expect(subscriber.handleChange).not.to.have.been.called;

                tearDown({ ctx, sut, lifecycle, el });
              });
            }
          }
        }
      }
    }
  });

  describe('handleEvent() - primitive - type="checkbox"', function() {
    function setup() {
      const ctx = TestContext.createHTMLTestContext();
      const { container, lifecycle, observerLocator } = ctx;
      const el = ctx.createElementFromMarkup(`<input type="checkbox"/>`) as IInputElement;
      ctx.doc.body.appendChild(el);

      const sut = ctx.observerLocator.getObserver(LF.none, el, 'checked') as CheckedObserver;

      const subscriber: IPropertySubscriber = { handleChange: spy() };
      sut.subscribe(subscriber);

      return { ctx, container, lifecycle, observerLocator, el, sut, subscriber };
    }

    function tearDown({ ctx, sut, el }: Partial<ReturnType<typeof setup>>) {
      ctx.doc.body.removeChild(el);
      sut.unbind();
      sut.dispose();
    }

    for (const checkedBefore of [true, false]) {
      for (const checkedAfter of [true, false]) {
        for (const event of ['change', 'input']) {
          it(_`checkedBefore=${checkedBefore}, checkedAfter=${checkedAfter}, event=${event}`, function() {

            const { ctx, sut, el, subscriber } = setup();

            el.checked = checkedBefore;
            el.dispatchEvent(new ctx.Event(event, eventDefaults));
            expect(sut.getValue()).to.equal(checkedBefore, 'sut.getValue() 1');
            expect(subscriber.handleChange).to.have.been.calledWith(checkedBefore, null, LF.fromDOMEvent | LF.allowPublishRoundtrip);

            el.checked = checkedAfter;
            el.dispatchEvent(new ctx.Event(event, eventDefaults));
            expect(sut.getValue()).to.equal(checkedAfter, 'sut.getValue() 2');

            if (checkedBefore !== checkedAfter) {
              expect(subscriber.handleChange).to.have.been.calledWith(checkedAfter, checkedBefore, LF.fromDOMEvent | LF.allowPublishRoundtrip);
              expect(subscriber.handleChange).to.have.been.calledTwice;
            } else {
              expect(subscriber.handleChange).to.have.been.calledOnce;
            }

            tearDown({ ctx, sut, el });
          });
        }
      }
    }
  });

  describe('setValue() - primitive - type="radio"', function() {
    function setup(hasSubscriber: boolean) {
      const ctx = TestContext.createHTMLTestContext();
      const { container, lifecycle, observerLocator } = ctx;

      const elA = ctx.createElementFromMarkup(`<input name="foo" type="radio" value="A"/>`) as ObservedInputElement;
      const elB = ctx.createElementFromMarkup(`<input name="foo" type="radio" value="B"/>`) as ObservedInputElement;
      const elC = ctx.createElementFromMarkup(`<input name="foo" type="radio" value="C"/>`) as ObservedInputElement;
      ctx.doc.body.appendChild(elA);
      ctx.doc.body.appendChild(elB);
      ctx.doc.body.appendChild(elC);
      const sutA = observerLocator.getObserver(LF.none, elA, 'checked') as CheckedObserver;
      const sutB = observerLocator.getObserver(LF.none, elB, 'checked') as CheckedObserver;
      const sutC = observerLocator.getObserver(LF.none, elC, 'checked') as CheckedObserver;
      observerLocator.getObserver(LF.none, elA, 'value');
      observerLocator.getObserver(LF.none, elB, 'value');
      observerLocator.getObserver(LF.none, elC, 'value');

      const subscriberA: IPropertySubscriber = { handleChange: spy() };
      const subscriberB: IPropertySubscriber = { handleChange: spy() };
      const subscriberC: IPropertySubscriber = { handleChange: spy() };
      if (hasSubscriber) {
        sutA.subscribe(subscriberA);
        sutB.subscribe(subscriberB);
        sutC.subscribe(subscriberC);
      }

      return { ctx, container, lifecycle, observerLocator, elA, elB, elC, sutA, sutB, sutC, subscriberA, subscriberB, subscriberC };
    }

    function tearDown({ ctx, sutA, sutB, sutC, elA, elB, elC }: Partial<ReturnType<typeof setup>>) {
      ctx.doc.body.removeChild(elA);
      ctx.doc.body.removeChild(elB);
      ctx.doc.body.removeChild(elC);
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

          it(_`hasSubscriber=${hasSubscriber}, checkedBefore=${checkedBefore}, checkedAfter=${checkedAfter}`, function() {

            const expectedPropValue = checkedBefore === undefined ? null : checkedBefore;
            const expectedNewValue = checkedAfter === undefined ? null : checkedAfter;

            const changeCountBefore = expectedPropValue !== null ? 3 : 0;
            const changeCountAfter = expectedPropValue !== expectedNewValue ? 3 : 0;

            const { ctx, sutA, sutB, sutC, elA, elB, elC, lifecycle, subscriberA, subscriberB, subscriberC } = setup(hasSubscriber);

            sutA.setValue(checkedBefore, LF.none);
            sutB.setValue(checkedBefore, LF.none);
            sutC.setValue(checkedBefore, LF.none);
            expect(lifecycle.flushCount).to.equal(changeCountBefore, 'lifecycle.flushCount 1');
            lifecycle.processFlushQueue(LF.none);
            expect(elA.checked).to.equal(checkedBefore === 'A', 'elA.checked 1');
            expect(elB.checked).to.equal(checkedBefore === 'B', 'elB.checked 1');
            expect(elC.checked).to.equal(checkedBefore === 'C', 'elC.checked 1');
            expect(sutA.getValue()).to.equal(expectedPropValue, 'sutA.getValue() 1');
            expect(sutB.getValue()).to.equal(expectedPropValue, 'sutB.getValue() 1');
            expect(sutC.getValue()).to.equal(expectedPropValue, 'sutC.getValue() 1');

            sutA.setValue(checkedAfter, LF.none);
            sutB.setValue(checkedAfter, LF.none);
            sutC.setValue(checkedAfter, LF.none);
            expect(elA.checked).to.equal(checkedBefore === 'A', 'elA.checked 2');
            expect(elB.checked).to.equal(checkedBefore === 'B', 'elB.checked 2');
            expect(elC.checked).to.equal(checkedBefore === 'C', 'elC.checked 2');
            expect(sutA.getValue()).to.equal(expectedNewValue, 'sutA.getValue() 2');
            expect(sutB.getValue()).to.equal(expectedNewValue, 'sutB.getValue() 2');
            expect(sutC.getValue()).to.equal(expectedNewValue, 'sutC.getValue() 2');
            expect(lifecycle.flushCount).to.equal(changeCountAfter, 'lifecycle.flushCount 2');
            lifecycle.processFlushQueue(LF.none);

            expect(elA.checked).to.equal(checkedAfter === 'A', 'elA.checked 3');
            expect(elB.checked).to.equal(checkedAfter === 'B', 'elB.checked 3');
            expect(elC.checked).to.equal(checkedAfter === 'C', 'elC.checked 3');

            expect(subscriberA.handleChange).not.to.have.been.called;
            expect(subscriberB.handleChange).not.to.have.been.called;
            expect(subscriberC.handleChange).not.to.have.been.called;

            tearDown({ ctx, sutA, sutB, sutC, elA, elB, elC, lifecycle });
          });
        }
      }
    }
  });

  describe('handleEvent() - primitive - type="radio"', function() {
    function setup() {
      const ctx = TestContext.createHTMLTestContext();
      const { container, lifecycle, observerLocator } = ctx;

      const elA = ctx.createElementFromMarkup(`<input name="foo" type="radio" value="A"/>`) as ObservedInputElement;
      const elB = ctx.createElementFromMarkup(`<input name="foo" type="radio" value="B"/>`) as ObservedInputElement;
      const elC = ctx.createElementFromMarkup(`<input name="foo" type="radio" value="C"/>`) as ObservedInputElement;
      ctx.doc.body.appendChild(elA);
      ctx.doc.body.appendChild(elB);
      ctx.doc.body.appendChild(elC);
      const sutA = observerLocator.getObserver(LF.none, elA, 'checked') as CheckedObserver;
      const sutB = observerLocator.getObserver(LF.none, elB, 'checked') as CheckedObserver;
      const sutC = observerLocator.getObserver(LF.none, elC, 'checked') as CheckedObserver;
      const subscriberA: IPropertySubscriber = { handleChange: spy() };
      const subscriberB: IPropertySubscriber = { handleChange: spy() };
      const subscriberC: IPropertySubscriber = { handleChange: spy() };
      sutA.subscribe(subscriberA);
      sutB.subscribe(subscriberB);
      sutC.subscribe(subscriberC);

      return { ctx, container, lifecycle, observerLocator, elA, elB, elC, sutA, sutB, sutC, subscriberA, subscriberB, subscriberC };
    }

    function tearDown({ ctx, sutA, sutB, sutC, elA, elB, elC }: Partial<ReturnType<typeof setup>>) {
      ctx.doc.body.removeChild(elA);
      ctx.doc.body.removeChild(elB);
      ctx.doc.body.removeChild(elC);
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

          it(_`checkedBefore=${checkedBefore}, checkedAfter=${checkedAfter}, event=${event}`, function() {

            const { ctx, sutA, sutB, sutC, elA, elB, elC } = setup();

            elA.checked = checkedBefore === 'A';
            elB.checked = checkedBefore === 'B';
            elC.checked = checkedBefore === 'C';
            elA.dispatchEvent(new ctx.Event(event, eventDefaults));
            elB.dispatchEvent(new ctx.Event(event, eventDefaults));
            elC.dispatchEvent(new ctx.Event(event, eventDefaults));
            expect(sutA.getValue()).to.equal(checkedBefore === 'A' ? 'A' : null, 'sutA.getValue() 1');
            expect(sutB.getValue()).to.equal(checkedBefore === 'B' ? 'B' : null, 'sutB.getValue() 1');
            expect(sutC.getValue()).to.equal(checkedBefore === 'C' ? 'C' : null, 'sutC.getValue() 1');
            expect(elA.checked).to.equal(checkedBefore === 'A', 'elA.checked 1');
            expect(elB.checked).to.equal(checkedBefore === 'B', 'elB.checked 1');
            expect(elC.checked).to.equal(checkedBefore === 'C', 'elC.checked 1');

            elA.checked = checkedAfter === 'A';
            elB.checked = checkedAfter === 'B';
            elC.checked = checkedAfter === 'C';
            elA.dispatchEvent(new ctx.Event(event, eventDefaults));
            elB.dispatchEvent(new ctx.Event(event, eventDefaults));
            elC.dispatchEvent(new ctx.Event(event, eventDefaults));
            expect(sutA.getValue()).to.equal(checkedBefore === 'A' || checkedAfter === 'A' ? 'A' : null, 'sutA.getValue() 2');
            expect(sutB.getValue()).to.equal(checkedBefore === 'B' || checkedAfter === 'B' ? 'B' : null, 'sutB.getValue() 2');
            expect(sutC.getValue()).to.equal(checkedBefore === 'C' || checkedAfter === 'C' ? 'C' : null, 'sutC.getValue() 2');
            expect(elA.checked).to.equal(checkedAfter === 'A', 'elA.checked 2');
            expect(elB.checked).to.equal(checkedAfter === 'B', 'elB.checked 2');
            expect(elC.checked).to.equal(checkedAfter === 'C', 'elC.checked 2');

            tearDown({ ctx, sutA, sutB, sutC, elA, elB, elC });
          });
        }
      }
    }
  });

  describe('setValue() - array - type="checkbox"', function() {
    function setup(hasSubscriber: boolean, value: any, prop: string) {
      const ctx = TestContext.createHTMLTestContext();
      const { container, lifecycle, observerLocator } = ctx;

      const el = ctx.createElementFromMarkup(`<input type="checkbox"/>`) as ObservedInputElement;
      el[prop] = value;
      ctx.doc.body.appendChild(el);

      const sut = observerLocator.getObserver(LF.none, el, 'checked') as CheckedObserver;
      observerLocator.getObserver(LF.none, el, prop);

      const subscriber: IPropertySubscriber = { handleChange: spy() };
      if (hasSubscriber) {
        sut.subscribe(subscriber);
      }

      return { ctx, value, container, lifecycle, observerLocator, el, sut, subscriber };
    }

    function tearDown({ ctx, sut, el }: Partial<ReturnType<typeof setup>>) {
      ctx.doc.body.removeChild(el);
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

                  it(_`hasSubscriber=${hasSubscriber}, ${prop}=${value}, checkedBefore=${checkedBefore}, checkedAfter=${checkedAfter}, propValue=${propValue}, newValue=${newValue}`, function() {

                    const changeCountBefore = 1;
                    const changeCountAfter = checkedBefore !== checkedAfter ? 1 : 0;

                    const { ctx, sut, lifecycle, el, subscriber } = setup(hasSubscriber, value, prop);

                    sut.setValue(propValue, LF.none);
                    expect(lifecycle.flushCount).to.equal(changeCountBefore, 'lifecycle.flushCount 1');
                    lifecycle.processFlushQueue(LF.none);
                    expect(el.checked).to.equal(valueCanBeChecked && checkedBefore, 'el.checked 1');
                    expect(sut.getValue()).to.equal(propValue, 'sut.getValue() 1');

                    sut.setValue(newValue, LF.none);
                    expect(el.checked).to.equal(valueCanBeChecked && checkedBefore, 'el.checked 2');
                    expect(sut.getValue()).to.equal(newValue, 'sut.getValue() 2');
                    expect(lifecycle.flushCount).to.equal(changeCountAfter, 'lifecycle.flushCount 2');
                    lifecycle.processFlushQueue(LF.none);

                    expect(el.checked).to.equal(valueCanBeChecked && checkedAfter, 'el.checked 3');
                    expect(subscriber.handleChange).not.to.have.been.called;

                    tearDown({ ctx, sut, lifecycle, el });
                  });
                }
              }
            }
          }
        }
      }
    }
  });

  describe('mutate collection - array - type="checkbox"', function() {
    function setup(hasSubscriber: boolean, value: any, prop: string) {
      const ctx = TestContext.createHTMLTestContext();
      const { container, lifecycle, observerLocator } = ctx;

      const el = ctx.createElementFromMarkup(`<input type="checkbox"/>`) as ObservedInputElement;
      el[prop] = value;
      ctx.doc.body.appendChild(el);

      const sut = observerLocator.getObserver(LF.none, el, 'checked') as CheckedObserver;
      observerLocator.getObserver(LF.none, el, prop);

      const subscriber: IPropertySubscriber = { handleChange: spy() };
      if (hasSubscriber) {
        sut.subscribe(subscriber);
      }

      return { ctx, value, container, lifecycle, observerLocator, el, sut, subscriber };
    }

    function tearDown({ ctx, sut, el }: Partial<ReturnType<typeof setup>>) {
      ctx.doc.body.removeChild(el);
      sut.unbind();
      sut.dispose();
    }

    for (const hasSubscriber of [true, false]) {
      for (const prop of ['value', 'model']) {
        for (const value of ['foo', 'bar', 42, null, undefined, '']) {

          const valueCanBeChecked = prop === 'model' || (typeof value !== 'number' && value !== undefined && value !== null);

          it(_`hasSubscriber=${hasSubscriber}, ${prop}=${value}`, function() {

            const array = [];

            const { ctx, sut, lifecycle, el, subscriber } = setup(hasSubscriber, value, prop);

            sut.setValue(array, LF.none);
            expect(lifecycle.flushCount).to.equal(1, 'lifecycle.flushCount 1');
            lifecycle.processFlushQueue(LF.none);
            expect(el.checked).to.equal(false, 'el.checked 1');
            expect(sut.getValue()).to.equal(array, 'sut.getValue() 1');

            array.push(value);
            expect(el.checked).to.equal(false, 'el.checked 2');
            expect(lifecycle.flushCount).to.equal(1, 'lifecycle.flushCount 2');
            lifecycle.processFlushQueue(LF.none);
            expect(el.checked).to.equal(valueCanBeChecked, 'el.checked 3');

            array.pop();
            expect(el.checked).to.equal(valueCanBeChecked, 'el.checked 4');
            expect(lifecycle.flushCount).to.equal(1, 'lifecycle.flushCount 3');
            lifecycle.processFlushQueue(LF.none);
            expect(el.checked).to.equal(false, 'el.checked 5');
            expect(subscriber.handleChange).not.to.have.been.called;

            tearDown({ ctx, sut, lifecycle, el });
          });
        }
      }
    }
  });

  describe('handleEvent() - array - type="checkbox"', function() {
    function setup(value: any, prop: string) {
      const ctx = TestContext.createHTMLTestContext();
      const { container, observerLocator } = ctx;

      const el = ctx.createElementFromMarkup(`<input type="checkbox"/>`) as ObservedInputElement;
      el[prop] = value;
      ctx.doc.body.appendChild(el);

      const sut = observerLocator.getObserver(LF.none, el, 'checked') as CheckedObserver;

      const subscriber: IPropertySubscriber = { handleChange: spy() };
      sut.subscribe(subscriber);

      return { ctx, value, container, observerLocator, el, sut, subscriber };
    }

    function tearDown({ ctx, sut, el }: Partial<ReturnType<typeof setup>>) {
      ctx.doc.body.removeChild(el);
      sut.unbind();
      sut.dispose();
    }

    for (const prop of ['value', 'model']) {
      for (const value of ['foo', 'bar', 42, null, undefined, '']) {

        for (const checkedBefore of [true, false]) {
          for (const checkedAfter of [true, false]) {
            for (const event of ['change', 'input']) {

              it(_`${prop}=${value}, checkedBefore=${checkedBefore}, checkedAfter=${checkedAfter}, event=${event}`, async function() {

                const { ctx, sut, el, subscriber } = setup(value, prop);

                const array = [];
                sut.setValue(array, LF.none);
                el.checked = checkedBefore;
                el.dispatchEvent(new ctx.Event(event, eventDefaults));
                let actual = sut.getValue() as IInputElement[];
                if (checkedBefore) {
                  expect(actual[0]).to.equal(prop === 'value' ? (value !== null ? `${value}` : '') : value); // TODO: maybe we should coerce value in the observer
                } else {
                  expect(actual).to.equal(array);
                }

                el.checked = checkedAfter;
                el.dispatchEvent(new ctx.Event(event, eventDefaults));
                actual = sut.getValue() as IInputElement[];
                if (checkedAfter) {
                  expect(actual[0]).to.equal(prop === 'value' ? (value !== null ? `${value}` : '') : value); // TODO: maybe we should coerce value in the observer
                } else {
                  expect(actual).to.equal(array);
                }
                expect(subscriber.handleChange).not.to.have.been.called;

                tearDown({ ctx, sut, el });
              });
            }
          }
        }
      }
    }
  });

  describe('SelectValueObserver.setValue() - array - type="checkbox"', function() {
    function setup(hasSubscriber: boolean, value: any, prop: string) {
      const ctx = TestContext.createHTMLTestContext();
      const { container, lifecycle, observerLocator } = ctx;

      const el = ctx.createElementFromMarkup(`<input type="checkbox"/>`) as ObservedInputElement;
      ctx.doc.body.appendChild(el);

      const sut = observerLocator.getObserver(LF.none, el, 'checked') as CheckedObserver;
      const valueOrModelObserver = observerLocator.getObserver(LF.none, el, prop) as IBindingTargetObserver;

      const subscriber: IPropertySubscriber = { handleChange: spy() };
      if (hasSubscriber) {
        sut.subscribe(subscriber);
      }

      return { ctx, value, container, observerLocator, el, sut, subscriber, valueOrModelObserver, lifecycle };
    }

    function tearDown({ ctx, sut, el }: Partial<ReturnType<typeof setup>>) {
      ctx.doc.body.removeChild(el);
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

                  it(_`hasSubscriber=${hasSubscriber}, ${prop}=${value}, checkedBefore=${checkedBefore}, checkedAfter=${checkedAfter}, propValue=${propValue}, newValue=${newValue}`, function() {

                    const { ctx, sut, el, subscriber, valueOrModelObserver, lifecycle } = setup(hasSubscriber, value, prop);

                    sut.setValue(propValue, LF.none);
                    lifecycle.processFlushQueue(LF.none);
                    expect(sut.getValue()).to.equal(propValue, 'sut.getValue() 1');

                    expect(el.checked).to.equal(prop === 'model' && value === undefined && propValue === checkedValue, 'el.checked 1');
                    valueOrModelObserver.setValue(value, LF.none | LF.fromFlush);
                    expect(el.checked).to.equal(valueCanBeChecked && checkedBefore, 'el.checked 2');
                    lifecycle.processFlushQueue(LF.none);
                    expect(el.checked).to.equal(valueCanBeChecked && checkedBefore, 'el.checked 3');

                    sut.setValue(newValue, LF.none);
                    lifecycle.processFlushQueue(LF.none);
                    expect(sut.getValue()).to.equal(newValue, 'sut.getValue() 2');

                    valueOrModelObserver.setValue(value, LF.none | LF.fromFlush);
                    expect(el.checked).to.equal(valueCanBeChecked && checkedAfter, 'el.checked 4');
                    lifecycle.processFlushQueue(LF.none);
                    expect(el.checked).to.equal(valueCanBeChecked && checkedAfter, 'el.checked 5');
                    expect(subscriber.handleChange).not.to.have.been.called;

                    tearDown({ ctx, sut, el });
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
