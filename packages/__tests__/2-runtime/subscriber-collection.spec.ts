import {
  ISubscriber,
  ISubscriberRecord,
  LifecycleFlags as LifecycleFlags,
  subscriberCollection
} from '@aurelia/runtime';
import { createSpy, assert } from '@aurelia/testing';

@subscriberCollection()
class Test {}
interface Test {
  subs: ISubscriberRecord<ISubscriber>;
}

describe('2-runtime/subscriber-collection.spec.ts', function () {
  it('calls subscribers', function () {
    const flags = LifecycleFlags.none;
    const observer = new Test();
    const observer2 = new Test();

    const callable1 = { handleChange: createSpy() };
    observer.subs.add(callable1);
    const callable2 = { handleChange: createSpy() };
    observer.subs.add(callable2);
    const callable3 = { handleChange: createSpy() };
    observer.subs.add(callable3);
    const callable4 = {
      handleChange: createSpy(() => observer2.subs.notify('new value2', 'old value2', flags))
    };
    observer.subs.add(callable4);
    const callable5 = { handleChange: createSpy() };
    observer.subs.add(callable5);

    const callable6 = { handleChange: createSpy() };
    observer2.subs.add(callable6);
    const callable7 = { handleChange: createSpy() };
    observer2.subs.add(callable7);
    const callable8 = { handleChange: createSpy() };
    observer2.subs.add(callable8);
    const callable9 = { handleChange: createSpy() };
    observer2.subs.add(callable9);
    const callable10 = { handleChange: createSpy() };
    observer2.subs.add(callable10);

    observer.subs.notify('new value', 'old value', flags);

    assert.deepStrictEqual(
      callable1.handleChange.calls,
      [
        ['new value', 'old value', flags],
      ],
      `callable1.handleChange`,
    );
    assert.deepStrictEqual(
      callable2.handleChange.calls,
      [
        ['new value', 'old value', flags],
      ],
      `callable2.handleChange`,
    );
    assert.deepStrictEqual(
      callable3.handleChange.calls,
      [
        ['new value', 'old value', flags],
      ],
      `callable3.handleChange`,
    );
    assert.deepStrictEqual(
      callable4.handleChange.calls,
      [
        ['new value', 'old value', flags],
      ],
      `callable4.handleChange`,
    );
    assert.deepStrictEqual(
      callable5.handleChange.calls,
      [
        ['new value', 'old value', flags],
      ],
      `callable5.handleChange`,
    );
    assert.deepStrictEqual(
      callable6.handleChange.calls,
      [
        ['new value2', 'old value2', flags],
      ],
      `callable6.handleChange`,
    );
    assert.deepStrictEqual(
      callable7.handleChange.calls,
      [
        ['new value2', 'old value2', flags],
      ],
      `callable7.handleChange`,
    );
    assert.deepStrictEqual(
      callable8.handleChange.calls,
      [
        ['new value2', 'old value2', flags],
      ],
      `callable8.handleChange`,
    );
    assert.deepStrictEqual(
      callable9.handleChange.calls,
      [
        ['new value2', 'old value2', flags],
      ],
      `callable9.handleChange`,
    );
    assert.deepStrictEqual(
      callable10.handleChange.calls,
      [
        ['new value2', 'old value2', flags],
      ],
      `callable10.handleChange`,
    );
  });

  it('removes subscribers', function () {
    const observer = new Test();

    const subscribers = [];
    for (let i = 0, ii = 100; ii > i; ++i) {
      observer.subs.add((subscribers[i] = { i }) as any);
    }

    let removalCount = 0;
    for (let i = 4, ii = subscribers.length; ii > i; i += 5) {
      const result = observer.subs.remove(subscribers[i]);
      if (result) {
        removalCount++;
      }
    }
    assert.strictEqual(observer['subs']['_sr'].length, subscribers.length - 3 - removalCount, `observer['subs']['_sr'].length`);

    assert.strictEqual(observer.subs.remove({} as any), false, `observer.subs.remove({} as any)`);
  });
});
