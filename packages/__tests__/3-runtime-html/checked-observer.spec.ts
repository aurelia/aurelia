import {
  enableArrayObservation,
  IBindingTargetObserver,
  LifecycleFlags as LF
} from '@aurelia/runtime';
import { CheckedObserver, IInputElement } from '@aurelia/runtime-html';
import { _, TestContext, assert, createSpy } from '@aurelia/testing';

type ObservedInputElement = HTMLInputElement & {
  $observers: Record<string, IBindingTargetObserver>;
  model: any;
  children: HTMLCollectionOf<ObservedInputElement>;
  matcher(a: any, b: any): boolean;
};

const eventDefaults = { bubbles: true };

describe.skip('CheckedObserver', function () {

  // eslint-disable-next-line mocha/no-hooks
  before(function () {
    enableArrayObservation();
  });

  describe('setValue() - primitive - type="checkbox"', function () {
    function setup(hasSubscriber: boolean) {
      const ctx = TestContext.createHTMLTestContext();
      const { container, lifecycle, observerLocator, scheduler } = ctx;
      const el = ctx.createElementFromMarkup(`<input type="checkbox"/>`) as IInputElement;
      ctx.doc.body.appendChild(el);

      const sut = ctx.observerLocator.getObserver(LF.none, el, 'checked') as CheckedObserver;
      ctx.observerLocator.getObserver(LF.none, el, 'value');

      const subscriber = { handleChange: createSpy() };
      if (hasSubscriber) {
        sut.subscribe(subscriber);
      }

      return { ctx, container, lifecycle, observerLocator, el, sut, subscriber, scheduler };
    }

    function tearDown({ ctx, sut, el }: Partial<ReturnType<typeof setup>>) {
      ctx.doc.body.removeChild(el);
      sut.unbind(LF.none);
    }

    for (const hasSubscriber of [true, false]) {
      for (const checkedBefore of [true, false]) {
        for (const checkedAfter of [true, false]) {
          for (const uncheckedValue of (!(checkedBefore && checkedAfter)) ? [false, '', undefined, null, 0, 1, 'true'] : [null]) {
            for (const checkedValue of ((checkedBefore || checkedAfter) ? [true] : [null])) {

              const propValue = checkedBefore ? checkedValue : uncheckedValue;
              const newValue = checkedAfter ? checkedValue : uncheckedValue;

              it(_`hasSubscriber=${hasSubscriber}, checkedBefore=${checkedBefore}, checkedAfter=${checkedAfter}, propValue=${propValue}, newValue=${newValue}`, function () {

                const expectedPropValue = propValue === undefined ? null : propValue;
                const expectedNewValue = newValue === undefined ? null : newValue;

                const changeCountBefore = expectedPropValue !== null ? 1 : 0;
                const changeCountAfter = expectedPropValue !== expectedNewValue ? 1 : 0;

                const { ctx, sut, lifecycle, el, subscriber, scheduler } = setup(hasSubscriber);

                sut.setValue(propValue, LF.none);
                // assert.strictEqual(lifecycle.flushCount, changeCountBefore, 'lifecycle.flushCount 1');
                scheduler.getRenderTaskQueue().flush();
                assert.strictEqual(el.checked, checkedBefore, 'el.checked 1');
                assert.strictEqual(sut.getValue(), expectedPropValue, 'sut.getValue() 1');

                sut.setValue(newValue, LF.none);
                assert.strictEqual(el.checked, checkedBefore, 'el.checked 2');
                assert.strictEqual(sut.getValue(), expectedNewValue, 'sut.getValue() 2');
                // assert.strictEqual(lifecycle.flushCount, changeCountAfter, 'lifecycle.flushCount 2');
                scheduler.getRenderTaskQueue().flush();

                assert.strictEqual(el.checked, checkedAfter, 'el.checked 3');
                assert.deepStrictEqual(
                  subscriber.handleChange,
                  [],
                  `subscriber.handleChange`,
                );

                tearDown({ ctx, sut, lifecycle, el });
              });
            }
          }
        }
      }
    }
  });

  describe('handleEvent() - primitive - type="checkbox"', function () {
    function setup() {
      const ctx = TestContext.createHTMLTestContext();
      const { container, lifecycle, observerLocator, scheduler } = ctx;
      const el = ctx.createElementFromMarkup(`<input type="checkbox"/>`) as IInputElement;
      ctx.doc.body.appendChild(el);

      const sut = ctx.observerLocator.getObserver(LF.none, el, 'checked') as CheckedObserver;

      const subscriber = { handleChange: createSpy() };
      sut.subscribe(subscriber);

      return { ctx, container, lifecycle, observerLocator, el, sut, subscriber, scheduler };
    }

    function tearDown({ ctx, sut, el }: Partial<ReturnType<typeof setup>>) {
      ctx.doc.body.removeChild(el);
      sut.unbind(LF.none);
    }

    for (const checkedBefore of [true, false]) {
      for (const checkedAfter of [true, false]) {
        for (const event of ['change', 'input']) {
          it(_`checkedBefore=${checkedBefore}, checkedAfter=${checkedAfter}, event=${event}`, function () {

            const { ctx, sut, el, subscriber, scheduler } = setup();

            el.checked = checkedBefore;
            el.dispatchEvent(new ctx.Event(event, eventDefaults));
            assert.strictEqual(sut.getValue(), checkedBefore, 'sut.getValue() 1');
            assert.deepStrictEqual(
              subscriber.handleChange,
              [
                [checkedBefore, null, LF.fromDOMEvent | LF.allowPublishRoundtrip],
              ],
              `subscriber.handleChange`,
            );

            el.checked = checkedAfter;
            el.dispatchEvent(new ctx.Event(event, eventDefaults));
            assert.strictEqual(sut.getValue(), checkedAfter, 'sut.getValue() 2');

            if (checkedBefore !== checkedAfter) {
              assert.deepStrictEqual(
                subscriber.handleChange,
                [
                  [checkedBefore, null, LF.fromDOMEvent | LF.allowPublishRoundtrip],
                  [checkedAfter, checkedBefore, LF.fromDOMEvent | LF.allowPublishRoundtrip],
                ],
                `subscriber.handleChange`,
              );
            } else {
              assert.deepStrictEqual(
                subscriber.handleChange,
                [
                  [checkedBefore, null, LF.fromDOMEvent | LF.allowPublishRoundtrip],
                ],
                `subscriber.handleChange`,
              );
            }

            tearDown({ ctx, sut, el });
          });
        }
      }
    }
  });

  describe('setValue() - primitive - type="radio"', function () {
    function setup(hasSubscriber: boolean) {
      const ctx = TestContext.createHTMLTestContext();
      const { container, lifecycle, observerLocator, scheduler } = ctx;

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

      const subscriberA = { handleChange: createSpy() };
      const subscriberB = { handleChange: createSpy() };
      const subscriberC = { handleChange: createSpy() };
      if (hasSubscriber) {
        sutA.subscribe(subscriberA);
        sutB.subscribe(subscriberB);
        sutC.subscribe(subscriberC);
      }

      return { ctx, container, lifecycle, observerLocator, scheduler, elA, elB, elC, sutA, sutB, sutC, subscriberA, subscriberB, subscriberC };
    }

    function tearDown({ ctx, sutA, sutB, sutC, elA, elB, elC }: Partial<ReturnType<typeof setup>>) {
      ctx.doc.body.removeChild(elA);
      ctx.doc.body.removeChild(elB);
      ctx.doc.body.removeChild(elC);
      sutA.unbind(LF.none);
      sutB.unbind(LF.none);
      sutC.unbind(LF.none);
    }

    for (const hasSubscriber of [true, false]) {
      for (const checkedBefore of ['A', 'B', 'C', null, undefined]) {
        for (const checkedAfter of ['A', 'B', 'C', null, undefined]) {

          it(_`hasSubscriber=${hasSubscriber}, checkedBefore=${checkedBefore}, checkedAfter=${checkedAfter}`, function () {

            const expectedPropValue = checkedBefore === undefined ? null : checkedBefore;
            const expectedNewValue = checkedAfter === undefined ? null : checkedAfter;

            const changeCountBefore = expectedPropValue != null ? 3 : 0;
            const changeCountAfter = expectedPropValue !== expectedNewValue ? 3 : 0;

            const { ctx, sutA, sutB, sutC, elA, elB, elC, lifecycle, scheduler, subscriberA, subscriberB, subscriberC } = setup(hasSubscriber);

            sutA.setValue(checkedBefore, LF.none);
            sutB.setValue(checkedBefore, LF.none);
            sutC.setValue(checkedBefore, LF.none);
            // assert.strictEqual(lifecycle.flushCount, changeCountBefore, 'lifecycle.flushCount 1');
            scheduler.getRenderTaskQueue().flush();
            assert.strictEqual(elA.checked, checkedBefore === 'A', 'elA.checked 1');
            assert.strictEqual(elB.checked, checkedBefore === 'B', 'elB.checked 1');
            assert.strictEqual(elC.checked, checkedBefore === 'C', 'elC.checked 1');
            assert.strictEqual(sutA.getValue(), expectedPropValue, 'sutA.getValue() 1');
            assert.strictEqual(sutB.getValue(), expectedPropValue, 'sutB.getValue() 1');
            assert.strictEqual(sutC.getValue(), expectedPropValue, 'sutC.getValue() 1');

            sutA.setValue(checkedAfter, LF.none);
            sutB.setValue(checkedAfter, LF.none);
            sutC.setValue(checkedAfter, LF.none);
            assert.strictEqual(elA.checked, checkedBefore === 'A', 'elA.checked 2');
            assert.strictEqual(elB.checked, checkedBefore === 'B', 'elB.checked 2');
            assert.strictEqual(elC.checked, checkedBefore === 'C', 'elC.checked 2');
            assert.strictEqual(sutA.getValue(), expectedNewValue, 'sutA.getValue() 2');
            assert.strictEqual(sutB.getValue(), expectedNewValue, 'sutB.getValue() 2');
            assert.strictEqual(sutC.getValue(), expectedNewValue, 'sutC.getValue() 2');
            // assert.strictEqual(lifecycle.flushCount, changeCountAfter, 'lifecycle.flushCount 2');
            scheduler.getRenderTaskQueue().flush();

            assert.strictEqual(elA.checked, checkedAfter === 'A', 'elA.checked 3');
            assert.strictEqual(elB.checked, checkedAfter === 'B', 'elB.checked 3');
            assert.strictEqual(elC.checked, checkedAfter === 'C', 'elC.checked 3');

            assert.deepStrictEqual(
              subscriberA.handleChange,
              [],
              `subscriberA.handleChange`,
            );
            assert.deepStrictEqual(
              subscriberB.handleChange,
              [],
              `subscriberB.handleChange`,
            );
            assert.deepStrictEqual(
              subscriberC.handleChange,
              [],
              `subscriberC.handleChange`,
            );

            tearDown({ ctx, sutA, sutB, sutC, elA, elB, elC, lifecycle });
          });
        }
      }
    }
  });

  describe('handleEvent() - primitive - type="radio"', function () {
    function setup() {
      const ctx = TestContext.createHTMLTestContext();
      const { container, lifecycle, observerLocator, scheduler } = ctx;

      const elA = ctx.createElementFromMarkup(`<input name="foo" type="radio" value="A"/>`) as ObservedInputElement;
      const elB = ctx.createElementFromMarkup(`<input name="foo" type="radio" value="B"/>`) as ObservedInputElement;
      const elC = ctx.createElementFromMarkup(`<input name="foo" type="radio" value="C"/>`) as ObservedInputElement;
      ctx.doc.body.appendChild(elA);
      ctx.doc.body.appendChild(elB);
      ctx.doc.body.appendChild(elC);
      const sutA = observerLocator.getObserver(LF.none, elA, 'checked') as CheckedObserver;
      const sutB = observerLocator.getObserver(LF.none, elB, 'checked') as CheckedObserver;
      const sutC = observerLocator.getObserver(LF.none, elC, 'checked') as CheckedObserver;
      const subscriberA = { handleChange: createSpy() };
      const subscriberB = { handleChange: createSpy() };
      const subscriberC = { handleChange: createSpy() };
      sutA.subscribe(subscriberA);
      sutB.subscribe(subscriberB);
      sutC.subscribe(subscriberC);

      return { ctx, container, lifecycle, observerLocator, scheduler, elA, elB, elC, sutA, sutB, sutC, subscriberA, subscriberB, subscriberC };
    }

    function tearDown({ ctx, sutA, sutB, sutC, elA, elB, elC }: Partial<ReturnType<typeof setup>>) {
      ctx.doc.body.removeChild(elA);
      ctx.doc.body.removeChild(elB);
      ctx.doc.body.removeChild(elC);
      sutA.unbind(LF.none);
      sutB.unbind(LF.none);
      sutC.unbind(LF.none);
    }

    for (const checkedBefore of ['A', 'B', 'C']) {
      for (const checkedAfter of ['A', 'B', 'C']) {
        for (const event of ['change', 'input']) {

          it(_`checkedBefore=${checkedBefore}, checkedAfter=${checkedAfter}, event=${event}`, function () {

            const { ctx, scheduler, sutA, sutB, sutC, elA, elB, elC } = setup();

            elA.checked = checkedBefore === 'A';
            elB.checked = checkedBefore === 'B';
            elC.checked = checkedBefore === 'C';
            elA.dispatchEvent(new ctx.Event(event, eventDefaults));
            elB.dispatchEvent(new ctx.Event(event, eventDefaults));
            elC.dispatchEvent(new ctx.Event(event, eventDefaults));
            assert.strictEqual(sutA.getValue(), checkedBefore === 'A' ? 'A' : null, 'sutA.getValue() 1');
            assert.strictEqual(sutB.getValue(), checkedBefore === 'B' ? 'B' : null, 'sutB.getValue() 1');
            assert.strictEqual(sutC.getValue(), checkedBefore === 'C' ? 'C' : null, 'sutC.getValue() 1');
            assert.strictEqual(elA.checked, checkedBefore === 'A', 'elA.checked 1');
            assert.strictEqual(elB.checked, checkedBefore === 'B', 'elB.checked 1');
            assert.strictEqual(elC.checked, checkedBefore === 'C', 'elC.checked 1');

            elA.checked = checkedAfter === 'A';
            elB.checked = checkedAfter === 'B';
            elC.checked = checkedAfter === 'C';
            elA.dispatchEvent(new ctx.Event(event, eventDefaults));
            elB.dispatchEvent(new ctx.Event(event, eventDefaults));
            elC.dispatchEvent(new ctx.Event(event, eventDefaults));
            assert.strictEqual(sutA.getValue(), checkedBefore === 'A' || checkedAfter === 'A' ? 'A' : null, 'sutA.getValue() 2');
            assert.strictEqual(sutB.getValue(), checkedBefore === 'B' || checkedAfter === 'B' ? 'B' : null, 'sutB.getValue() 2');
            assert.strictEqual(sutC.getValue(), checkedBefore === 'C' || checkedAfter === 'C' ? 'C' : null, 'sutC.getValue() 2');
            assert.strictEqual(elA.checked, checkedAfter === 'A', 'elA.checked 2');
            assert.strictEqual(elB.checked, checkedAfter === 'B', 'elB.checked 2');
            assert.strictEqual(elC.checked, checkedAfter === 'C', 'elC.checked 2');

            tearDown({ ctx, sutA, sutB, sutC, elA, elB, elC });
          });
        }
      }
    }
  });

  describe('setValue() - array - type="checkbox"', function () {
    function setup(hasSubscriber: boolean, value: any, prop: string) {
      const ctx = TestContext.createHTMLTestContext();
      const { container, lifecycle, observerLocator, scheduler } = ctx;

      const el = ctx.createElementFromMarkup(`<input type="checkbox"/>`) as ObservedInputElement;
      el[prop] = value;
      ctx.doc.body.appendChild(el);

      const sut = observerLocator.getObserver(LF.none, el, 'checked') as CheckedObserver;
      observerLocator.getObserver(LF.none, el, prop);

      const subscriber = { handleChange: createSpy() };
      if (hasSubscriber) {
        sut.subscribe(subscriber);
      }

      return { ctx, value, container, lifecycle, observerLocator, scheduler, el, sut, subscriber };
    }

    function tearDown({ ctx, sut, el }: Partial<ReturnType<typeof setup>>) {
      ctx.doc.body.removeChild(el);
      sut.unbind(LF.none);
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

                  it(_`hasSubscriber=${hasSubscriber}, ${prop}=${value}, checkedBefore=${checkedBefore}, checkedAfter=${checkedAfter}, propValue=${propValue}, newValue=${newValue}`, function () {

                    const changeCountBefore = 1;
                    const changeCountAfter = checkedBefore !== checkedAfter ? 1 : 0;

                    const { ctx, sut, lifecycle, el, subscriber, scheduler } = setup(hasSubscriber, value, prop);

                    sut.setValue(propValue, LF.none);
                    // assert.strictEqual(lifecycle.flushCount, changeCountBefore, 'lifecycle.flushCount 1');
                    scheduler.getRenderTaskQueue().flush();
                    assert.strictEqual(el.checked, valueCanBeChecked && checkedBefore, 'el.checked 1');
                    assert.strictEqual(sut.getValue(), propValue, 'sut.getValue() 1');

                    sut.setValue(newValue, LF.none);
                    assert.strictEqual(el.checked, valueCanBeChecked && checkedBefore, 'el.checked 2');
                    assert.strictEqual(sut.getValue(), newValue, 'sut.getValue() 2');
                    // assert.strictEqual(lifecycle.flushCount, changeCountAfter, 'lifecycle.flushCount 2');
                    scheduler.getRenderTaskQueue().flush();

                    assert.strictEqual(el.checked, valueCanBeChecked && checkedAfter, 'el.checked 3');
                    assert.deepStrictEqual(
                      subscriber.handleChange,
                      [],
                      `subscriber.handleChange`,
                    );

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

  describe('mutate collection - array - type="checkbox"', function () {
    function setup(hasSubscriber: boolean, value: any, prop: string) {
      const ctx = TestContext.createHTMLTestContext();
      const { container, lifecycle, observerLocator, scheduler } = ctx;

      const el = ctx.createElementFromMarkup(`<input type="checkbox"/>`) as ObservedInputElement;
      el[prop] = value;
      ctx.doc.body.appendChild(el);

      const sut = observerLocator.getObserver(LF.none, el, 'checked') as CheckedObserver;
      observerLocator.getObserver(LF.none, el, prop);

      const subscriber = { handleChange: createSpy() };
      if (hasSubscriber) {
        sut.subscribe(subscriber);
      }

      return { ctx, value, container, lifecycle, observerLocator, scheduler, el, sut, subscriber };
    }

    function tearDown({ ctx, sut, el }: Partial<ReturnType<typeof setup>>) {
      ctx.doc.body.removeChild(el);
      sut.unbind(LF.none);
    }

    for (const hasSubscriber of [true, false]) {
      for (const prop of ['value', 'model']) {
        for (const value of ['foo', 'bar', 42, null, undefined, '']) {

          const valueCanBeChecked = prop === 'model' || (typeof value !== 'number' && value != null);

          it(_`hasSubscriber=${hasSubscriber}, ${prop}=${value}`, function () {

            const array = [];

            const { ctx, sut, lifecycle, el, subscriber, scheduler } = setup(hasSubscriber, value, prop);

            sut.setValue(array, LF.none);
            // assert.strictEqual(lifecycle.flushCount, 1, 'lifecycle.flushCount 1');
            scheduler.getRenderTaskQueue().flush();
            assert.strictEqual(el.checked, false, 'el.checked 1');
            assert.strictEqual(sut.getValue(), array, 'sut.getValue() 1');

            array.push(value);
            assert.strictEqual(el.checked, false, 'el.checked 2');
            // assert.strictEqual(lifecycle.flushCount, 1, 'lifecycle.flushCount 2');
            scheduler.getRenderTaskQueue().flush();
            assert.strictEqual(el.checked, valueCanBeChecked, 'el.checked 3');

            array.pop();
            assert.strictEqual(el.checked, valueCanBeChecked, 'el.checked 4');
            // assert.strictEqual(lifecycle.flushCount, 1, 'lifecycle.flushCount 3');
            scheduler.getRenderTaskQueue().flush();
            assert.strictEqual(el.checked, false, 'el.checked 5');
            assert.deepStrictEqual(
              subscriber.handleChange,
              [],
              `subscriber.handleChange`,
            );

            tearDown({ ctx, sut, lifecycle, el });
          });
        }
      }
    }
  });

  describe('handleEvent() - array - type="checkbox"', function () {
    function setup(value: any, prop: string) {
      const ctx = TestContext.createHTMLTestContext();
      const { container, observerLocator, scheduler } = ctx;

      const el = ctx.createElementFromMarkup(`<input type="checkbox"/>`) as ObservedInputElement;
      el[prop] = value;
      ctx.doc.body.appendChild(el);

      const sut = observerLocator.getObserver(LF.none, el, 'checked') as CheckedObserver;

      const subscriber = { handleChange: createSpy() };
      sut.subscribe(subscriber);

      return { ctx, value, container, observerLocator, el, sut, subscriber, scheduler };
    }

    function tearDown({ ctx, sut, el }: Partial<ReturnType<typeof setup>>) {
      ctx.doc.body.removeChild(el);
      sut.unbind(LF.none);
    }

    for (const prop of ['value', 'model']) {
      for (const value of ['foo', 'bar', 42, null, undefined, '']) {

        for (const checkedBefore of [true, false]) {
          for (const checkedAfter of [true, false]) {
            for (const event of ['change', 'input']) {

              it(_`${prop}=${value}, checkedBefore=${checkedBefore}, checkedAfter=${checkedAfter}, event=${event}`, function () {

                const { ctx, sut, el, subscriber, scheduler } = setup(value, prop);

                const array = [];
                sut.setValue(array, LF.none);
                el.checked = checkedBefore;
                el.dispatchEvent(new ctx.Event(event, eventDefaults));
                let actual = sut.getValue() as IInputElement[];
                if (checkedBefore) {
                  assert.strictEqual(actual[0], prop === 'value' ? (value !== null ? `${value}` : '') : value, `actual[0]`); // TODO: maybe we should coerce value in the observer
                } else {
                  assert.strictEqual(actual, array, `actual`);
                }

                el.checked = checkedAfter;
                el.dispatchEvent(new ctx.Event(event, eventDefaults));
                actual = sut.getValue() as IInputElement[];
                if (checkedAfter) {
                  assert.strictEqual(actual[0], prop === 'value' ? (value !== null ? `${value}` : '') : value, `actual[0]`); // TODO: maybe we should coerce value in the observer
                } else {
                  assert.strictEqual(actual, array, `actual`);
                }
                assert.deepStrictEqual(
                  subscriber.handleChange,
                  [],
                  `subscriber.handleChange`,
                );

                tearDown({ ctx, sut, el });
              });
            }
          }
        }
      }
    }
  });

  describe('SelectValueObserver.setValue() - array - type="checkbox"', function () {
    function setup(hasSubscriber: boolean, value: any, prop: string) {
      const ctx = TestContext.createHTMLTestContext();
      const { container, lifecycle, observerLocator, scheduler } = ctx;

      const el = ctx.createElementFromMarkup(`<input type="checkbox"/>`) as ObservedInputElement;
      ctx.doc.body.appendChild(el);

      const sut = observerLocator.getObserver(LF.none, el, 'checked') as CheckedObserver;
      const valueOrModelObserver = observerLocator.getObserver(LF.none, el, prop) as IBindingTargetObserver;

      const subscriber = { handleChange: createSpy() };
      if (hasSubscriber) {
        sut.subscribe(subscriber);
      }

      return { ctx, value, container, observerLocator, scheduler, el, sut, subscriber, valueOrModelObserver, lifecycle };
    }

    function tearDown({ ctx, sut, el }: Partial<ReturnType<typeof setup>>) {
      ctx.doc.body.removeChild(el);
      sut.unbind(LF.none);
    }

    for (const hasSubscriber of [true, false]) {
      for (const prop of ['value', 'model']) {
        for (const value of ['foo', 'bar', 42, null, undefined, '']) {

          const valueCanBeChecked = prop === 'model' || (typeof value !== 'number' && value != null);

          for (const checkedBefore of [true, false]) {
            for (const checkedAfter of [true, false]) {
              for (const uncheckedValue of (!(checkedBefore && checkedAfter)) ? [[], [!value ? 'foo' : '']] : [[]]) {
                for (const checkedValue of ((checkedBefore || checkedAfter) ? [[value, '']] : [[]])) {

                  const propValue = checkedBefore ? checkedValue : uncheckedValue;
                  const newValue = checkedAfter ? checkedValue : uncheckedValue;

                  it(_`hasSubscriber=${hasSubscriber}, ${prop}=${value}, checkedBefore=${checkedBefore}, checkedAfter=${checkedAfter}, propValue=${propValue}, newValue=${newValue}`, function () {

                    const { ctx, sut, el, subscriber, valueOrModelObserver, lifecycle, scheduler } = setup(hasSubscriber, value, prop);

                    sut.setValue(propValue, LF.none);
                    scheduler.getRenderTaskQueue().flush();
                    assert.strictEqual(sut.getValue(), propValue, 'sut.getValue() 1');

                    assert.strictEqual(el.checked, prop === 'model' && value === undefined && propValue === checkedValue, 'el.checked 1');
                    valueOrModelObserver.setValue(value, LF.none | LF.fromFlush);
                    assert.strictEqual(el.checked, valueCanBeChecked && checkedBefore, 'el.checked 2');
                    scheduler.getRenderTaskQueue().flush();
                    assert.strictEqual(el.checked, valueCanBeChecked && checkedBefore, 'el.checked 3');

                    sut.setValue(newValue, LF.none);
                    scheduler.getRenderTaskQueue().flush();
                    assert.strictEqual(sut.getValue(), newValue, 'sut.getValue() 2');

                    valueOrModelObserver.setValue(value, LF.none | LF.fromFlush);
                    assert.strictEqual(el.checked, valueCanBeChecked && checkedAfter, 'el.checked 4');
                    scheduler.getRenderTaskQueue().flush();
                    assert.strictEqual(el.checked, valueCanBeChecked && checkedAfter, 'el.checked 5');
                    assert.deepStrictEqual(
                      subscriber.handleChange,
                      [],
                      `subscriber.handleChange`,
                    );

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
