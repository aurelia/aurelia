import { IPropertySubscriber, LifecycleFlags as LF } from '@aurelia/runtime';
import { expect } from 'chai';
import { SinonSpy, spy } from 'sinon';
import { ValueAttributeObserver } from '../../src/index';
import { _, TestContext } from '../util';

describe('ValueAttributeObserver', function () {
  const eventDefaults = { bubbles: true };

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
    describe(`setValue() - type="${inputType}"`, function () {
      function setup(hasSubscriber: boolean) {
        const ctx = TestContext.createHTMLTestContext();
        const { container, lifecycle, observerLocator } = ctx;

        const el = ctx.createElementFromMarkup(`<input type="${inputType}"/>`) as HTMLInputElement;
        ctx.doc.body.appendChild(el);

        const sut = observerLocator.getObserver(LF.none, el, 'value') as ValueAttributeObserver;

        const subscriber: IPropertySubscriber = { handleChange: spy() };
        if (hasSubscriber) {
          sut.subscribe(subscriber);
        }

        return { ctx, container, lifecycle, observerLocator, el, sut, subscriber };
      }

      function tearDown({ ctx, sut, el }: Partial<ReturnType<typeof setup>>) {
        ctx.doc.body.removeChild(el);
        sut.dispose();
      }

      for (const hasSubscriber of [true, false]) {
        for (const valueBefore of [...nullValues, ...validValues]) {
          for (const valueAfter of [...nullValues, ...validValues]) {

            it(_`hasSubscriber=${hasSubscriber}, valueBefore=${valueBefore}, valueAfter=${valueAfter}`, function () {

              const { ctx, sut, lifecycle, el, subscriber } = setup(hasSubscriber);

              const expectedValueBefore = nullValues.includes(valueBefore) ? sut.defaultValue : valueBefore;
              const expectedValueAfter = nullValues.includes(valueAfter) ? sut.defaultValue : valueAfter;

              const changeCountBefore = expectedValueBefore !== sut.defaultValue ? 1 : 0;
              const changeCountAfter = expectedValueBefore !== expectedValueAfter ? 1 : 0;
              let callCount = 0;

              sut.setValue(valueBefore, LF.none);
              expect(lifecycle.flushCount).to.equal(changeCountBefore, 'lifecycle.flushCount 1');
              lifecycle.processFlushQueue(LF.none);
              expect(el.value).to.equal(expectedValueBefore, 'el.value 1');
              expect(sut.getValue()).to.equal(expectedValueBefore, 'sut.getValue() 1');
              if (hasSubscriber && changeCountBefore) {
                callCount++;
                expect(subscriber.handleChange).to.have.been.calledWith(expectedValueBefore, sut.defaultValue, LF.fromSyncFlush | LF.updateTargetInstance);
              }

              sut.setValue(valueAfter, LF.none);
              expect(lifecycle.flushCount).to.equal(changeCountAfter, 'lifecycle.flushCount 2');
              lifecycle.processFlushQueue(LF.none);
              expect(el.value).to.equal(expectedValueAfter, 'el.value 2');
              expect(sut.getValue()).to.equal(expectedValueAfter, 'sut.getValue() 2');
              if (hasSubscriber && changeCountAfter) {
                callCount++;
                expect(subscriber.handleChange).to.have.been.calledWith(expectedValueAfter, expectedValueBefore, LF.fromSyncFlush | LF.updateTargetInstance);
              }
              if (hasSubscriber) {
                expect((subscriber.handleChange as SinonSpy).getCalls().length).to.equal(callCount);
              }

              tearDown({ ctx, sut, lifecycle, el });
            });
          }
        }
      }
    });

    describe(`handleEvent() - type="${inputType}"`, function () {
      function setup() {
        const ctx = TestContext.createHTMLTestContext();
        const { container, observerLocator } = ctx;

        const el = ctx.createElementFromMarkup(`<input type="${inputType}"/>`) as HTMLInputElement;
        ctx.doc.body.appendChild(el);

        const sut = observerLocator.getObserver(LF.none, el, 'value') as ValueAttributeObserver;

        const subscriber: IPropertySubscriber = { handleChange: spy() };
        sut.subscribe(subscriber);

        return { ctx, container, observerLocator, el, sut, subscriber };
      }

      function tearDown({ ctx, sut, el }: Partial<ReturnType<typeof setup>>) {
        ctx.doc.body.removeChild(el);
        sut.dispose();
      }

      for (const valueBefore of [...nullValues, ...validValues]) {
        for (const valueAfter of [...nullValues, ...validValues]) {
          for (const event of ['change', 'input']) {

            it(_`valueBefore=${valueBefore}, valueAfter=${valueAfter}`, function () {

              const { ctx, sut, el, subscriber } = setup();

              const expectedValueBefore = valueBefore == null ? '' : `${valueBefore}`;
              const expectedValueAfter = valueAfter == null ? '' : `${valueAfter}`;
              let callCount = 0;

              el.value = valueBefore;
              el.dispatchEvent(new ctx.Event(event, eventDefaults));
              expect(el.value).to.equal(expectedValueBefore, 'el.value 1');
              expect(sut.getValue()).to.equal(expectedValueBefore, 'sut.getValue() 1');
              if (expectedValueBefore !== '') {
                callCount++;
                expect(subscriber.handleChange).to.have.been.calledWith(expectedValueBefore, sut.defaultValue, LF.fromDOMEvent | LF.allowPublishRoundtrip);
              }

              el.value = valueAfter;
              el.dispatchEvent(new ctx.Event(event, eventDefaults));
              expect(el.value).to.equal(expectedValueAfter, 'el.value 2');
              expect(sut.getValue()).to.equal(expectedValueAfter, 'sut.getValue() 2');
              if (expectedValueBefore !== expectedValueAfter) {
                callCount++;
                expect(subscriber.handleChange).to.have.been.calledWith(expectedValueAfter, expectedValueBefore, LF.fromDOMEvent | LF.allowPublishRoundtrip);
              }
              expect((subscriber.handleChange as SinonSpy).getCalls().length).to.equal(callCount);

              tearDown({ ctx, sut, el });
            });
          }
        }
      }
    });
  }
});
