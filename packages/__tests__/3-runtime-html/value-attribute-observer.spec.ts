import { LifecycleFlags as LF, ValueAttributeObserver } from '@aurelia/runtime-html';
import { _, TestContext, assert, createSpy } from '@aurelia/testing';

describe.skip('ValueAttributeObserver', function () {
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
      function createFixture(hasSubscriber: boolean) {
        const ctx = TestContext.create();
        const { container, observerLocator, platform } = ctx;

        const el = ctx.createElementFromMarkup(`<input type="${inputType}"/>`) as HTMLInputElement;
        ctx.doc.body.appendChild(el);

        const sut = observerLocator.getObserver(el, 'value') as ValueAttributeObserver;

        const subscriber = { handleChange: createSpy() };
        if (hasSubscriber) {
          sut.subscribe(subscriber);
        }

        return { ctx, container, observerLocator, el, sut, subscriber, platform };
      }

      function tearDown({ ctx, sut, el }: Partial<ReturnType<typeof createFixture>>) {
        ctx.doc.body.removeChild(el);
        assert.areTaskQueuesEmpty();
      }

      for (const hasSubscriber of [true, false]) {
        for (const valueBefore of [...nullValues, ...validValues]) {
          for (const valueAfter of [...nullValues, ...validValues]) {

            it(_`hasSubscriber=${hasSubscriber}, valueBefore=${valueBefore}, valueAfter=${valueAfter}`, function () {

              const { ctx, sut, el, subscriber, platform } = createFixture(hasSubscriber);

              const expectedValueBefore = nullValues.includes(valueBefore) ? '' : valueBefore;
              const expectedValueAfter = nullValues.includes(valueAfter) ? '' : valueAfter;

              const changeCountBefore = expectedValueBefore !== '' ? 1 : 0;
              const changeCountAfter = expectedValueBefore !== expectedValueAfter ? 1 : 0;
              let callCount = 0;

              sut.setValue(valueBefore, LF.none);
              // assert.strictEqual(lifecycle.flushCount, changeCountBefore, 'lifecycle.flushCount 1');
              platform.domWriteQueue.flush();
              assert.strictEqual(el.value, expectedValueBefore, 'el.value 1');
              assert.strictEqual(sut.getValue(), expectedValueBefore, 'sut.getValue() 1');
              if (hasSubscriber && changeCountBefore) {
                callCount++;
                assert.deepStrictEqual(
                  subscriber.handleChange.calls,
                  [
                    [expectedValueBefore, '', LF.updateTarget],
                  ],
                  'subscriber.handleChange.calls',
                );
              }

              sut.setValue(valueAfter, LF.none);
              // assert.strictEqual(lifecycle.flushCount, changeCountAfter, 'lifecycle.flushCount 2');
              platform.domWriteQueue.flush();
              assert.strictEqual(el.value, expectedValueAfter, 'el.value 2');
              assert.strictEqual(sut.getValue(), expectedValueAfter, 'sut.getValue() 2',);
              if (hasSubscriber && changeCountAfter) {
                callCount++;
                assert.deepStrictEqual(
                  subscriber.handleChange.calls,
                  [
                    [expectedValueBefore, '', LF.updateTarget],
                    [expectedValueAfter, expectedValueBefore, LF.updateTarget],
                  ],
                  'subscriber.handleChange.calls',
                );
              }
              if (hasSubscriber) {
                assert.strictEqual(subscriber.handleChange.calls.length, callCount, `subscriber.handleChange.calls.length`);
              }

              tearDown({ ctx, sut, el });
            });
          }
        }
      }
    });

    describe(`handleEvent() - type="${inputType}"`, function () {
      function createFixture() {
        const ctx = TestContext.create();
        const { container, observerLocator } = ctx;

        const el = ctx.createElementFromMarkup(`<input type="${inputType}"/>`) as HTMLInputElement;
        ctx.doc.body.appendChild(el);

        const sut = observerLocator.getObserver(el, 'value') as ValueAttributeObserver;

        const subscriber = { handleChange: createSpy() };
        sut.subscribe(subscriber);

        return { ctx, container, observerLocator, el, sut, subscriber };
      }

      function tearDown({ ctx, sut, el }: Partial<ReturnType<typeof createFixture>>) {
        ctx.doc.body.removeChild(el);
      }

      for (const valueBefore of [...nullValues, ...validValues]) {
        for (const valueAfter of [...nullValues, ...validValues]) {
          for (const event of ['change', 'input']) {

            it(_`valueBefore=${valueBefore}, valueAfter=${valueAfter}`, function () {

              const { ctx, sut, el, subscriber } = createFixture();

              const expectedValueBefore = valueBefore == null ? '' : `${valueBefore}`;
              const expectedValueAfter = valueAfter == null ? '' : `${valueAfter}`;
              let callCount = 0;

              el.value = valueBefore;
              el.dispatchEvent(new ctx.Event(event, eventDefaults));
              assert.strictEqual(el.value, expectedValueBefore, 'el.value 1');
              assert.strictEqual(sut.getValue(), expectedValueBefore, 'sut.getValue() 1');
              if (expectedValueBefore !== '') {
                callCount++;
                assert.deepStrictEqual(
                  subscriber.handleChange.calls,
                  [
                    [expectedValueBefore, '', LF.none],
                  ],
                  'subscriber.handleChange.calls',
                );
              }

              el.value = valueAfter;
              el.dispatchEvent(new ctx.Event(event, eventDefaults));
              assert.strictEqual(el.value, expectedValueAfter, 'el.value 2');
              assert.strictEqual(sut.getValue(), expectedValueAfter, 'sut.getValue() 2');
              if (expectedValueBefore !== expectedValueAfter) {
                callCount++;
                assert.deepStrictEqual(
                  subscriber.handleChange.calls,
                  [
                    [expectedValueBefore, '', LF.none],
                    [expectedValueAfter, expectedValueBefore, LF.none],
                  ],
                  'subscriber.handleChange.calls',
                );
              }
              assert.strictEqual(subscriber.handleChange.calls.length, callCount, `subscriber.handleChange.calls.length`);

              tearDown({ ctx, sut, el });
            });
          }
        }
      }
    });
  }
});
