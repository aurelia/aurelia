import {
  ValueAttributeObserver,
  IObserverLocator,
  ILifecycle,
  LifecycleFlags,
  Binding,
  IBindingTargetObserver,
  IPropertySubscriber,
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

describe('ValueAttributeObserver', () => {
  const eventDefaults = { bubbles: true };
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
        container.register(domRegistration);
        const lifecycle = container.get(ILifecycle) as Lifecycle;
        const observerLocator = container.get(IObserverLocator);

        const el = <HTMLInputElement>createElement(`<input type="${inputType}"/>`);
        document.body.appendChild(el);

        const sut = <ValueAttributeObserver>observerLocator.getObserver(el, 'value');

        let subscriber: IPropertySubscriber = { handleChange: spy() };
        if (hasSubscriber) {
          sut.subscribe(subscriber);
        }

        return { container, lifecycle, observerLocator, el, sut, subscriber };
      }

      function tearDown({ sut, lifecycle, el }: Partial<ReturnType<typeof setup>>) {
        document.body.removeChild(el);
        sut.dispose();
      }

      for (const hasSubscriber of [true, false]) {
        for (const valueBefore of [...nullValues, ...validValues]) {
          for (const valueAfter of [...nullValues, ...validValues]) {

            it(_`hasSubscriber=${hasSubscriber}, valueBefore=${valueBefore}, valueAfter=${valueAfter}`, () => {

              const { sut, lifecycle, el, subscriber } = setup(hasSubscriber);

              const expectedValueBefore = nullValues.includes(valueBefore) ? sut.defaultValue : valueBefore;
              const expectedValueAfter = nullValues.includes(valueAfter) ? sut.defaultValue : valueAfter;

              const changeCountBefore = expectedValueBefore !== sut.defaultValue ? 1 : 0;
              const changeCountAfter = expectedValueBefore !== expectedValueAfter ? 1 : 0;
              let callCount = 0;

              sut.setValue(valueBefore, LifecycleFlags.none);
              expect(lifecycle.flushCount).to.equal(changeCountBefore, 'lifecycle.flushCount 1');
              lifecycle.processFlushQueue(LifecycleFlags.none);
              expect(el.value).to.equal(expectedValueBefore, 'el.value 1');
              expect(sut.getValue()).to.equal(expectedValueBefore, 'sut.getValue() 1');
              if (hasSubscriber && changeCountBefore) {
                callCount++;
                expect(subscriber.handleChange).to.have.been.calledWith(expectedValueBefore, sut.defaultValue, LifecycleFlags.fromSyncFlush | LifecycleFlags.updateTargetInstance);
              }

              sut.setValue(valueAfter, LifecycleFlags.none);
              expect(lifecycle.flushCount).to.equal(changeCountAfter, 'lifecycle.flushCount 2');
              lifecycle.processFlushQueue(LifecycleFlags.none);
              expect(el.value).to.equal(expectedValueAfter, 'el.value 2');
              expect(sut.getValue()).to.equal(expectedValueAfter, 'sut.getValue() 2');
              if (hasSubscriber && changeCountAfter) {
                callCount++;
                expect(subscriber.handleChange).to.have.been.calledWith(expectedValueAfter, expectedValueBefore, LifecycleFlags.fromSyncFlush | LifecycleFlags.updateTargetInstance);
              }
              if (hasSubscriber) {
                expect((<SinonSpy>subscriber.handleChange).getCalls().length).to.equal(callCount);
              }

              tearDown({ sut, lifecycle, el });
            });
          }
        }
      }
    });

    describe(`handleEvent() - type="${inputType}"`, () => {
      function setup() {
        const container = DI.createContainer();
        container.register(domRegistration);
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
                expect(subscriber.handleChange).to.have.been.calledWith(expectedValueBefore, sut.defaultValue, LifecycleFlags.updateSourceExpression | LifecycleFlags.fromDOMEvent);
              }

              el.value = valueAfter;
              el.dispatchEvent(new Event(event, eventDefaults));
              expect(el.value).to.equal(expectedValueAfter, 'el.value 2');
              expect(sut.getValue()).to.equal(expectedValueAfter, 'sut.getValue() 2');
              if (expectedValueBefore !== expectedValueAfter) {
                callCount++;
                expect(subscriber.handleChange).to.have.been.calledWith(expectedValueAfter, expectedValueBefore, LifecycleFlags.updateSourceExpression | LifecycleFlags.fromDOMEvent);
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

type TwoWayBinding = Binding & { targetObserver: IBindingTargetObserver };
