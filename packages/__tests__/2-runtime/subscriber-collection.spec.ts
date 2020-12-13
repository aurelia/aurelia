import {
  batch,
  LifecycleFlags as LifecycleFlags,
  subscriberCollection
} from '@aurelia/runtime';
import { createSpy, assert } from '@aurelia/testing';

import type { ISubscriberCollection } from '@aurelia/runtime';

@subscriberCollection()
class Test {}

describe('subscriberCollection', function () {
  it('calls subscribers', function () {
    const flags = LifecycleFlags.updateSource;
    const observer = new Test();
    const observer2 = new Test();

    const callable1 = { handleChange: createSpy() };
    observer['addSubscriber'](callable1);
    const callable2 = { handleChange: createSpy() };
    observer['addSubscriber'](callable2);
    const callable3 = { handleChange: createSpy() };
    observer['addSubscriber'](callable3);
    const callable4 = {
      handleChange: createSpy(() => observer2['callSubscribers']('new value2', 'old value2', flags))
    };
    observer['addSubscriber'](callable4);
    const callable5 = { handleChange: createSpy() };
    observer['addSubscriber'](callable5);

    const callable6 = { handleChange: createSpy() };
    observer2['addSubscriber'](callable6);
    const callable7 = { handleChange: createSpy() };
    observer2['addSubscriber'](callable7);
    const callable8 = { handleChange: createSpy() };
    observer2['addSubscriber'](callable8);
    const callable9 = { handleChange: createSpy() };
    observer2['addSubscriber'](callable9);
    const callable10 = { handleChange: createSpy() };
    observer2['addSubscriber'](callable10);

    observer['callSubscribers']('new value', 'old value', flags);

    assert.deepStrictEqual(
      callable1.handleChange.calls,
      [
        ['new value', 'old value', flags & ~LifecycleFlags.update],
      ],
      `callable1.handleChange`,
    );
    assert.deepStrictEqual(
      callable2.handleChange.calls,
      [
        ['new value', 'old value', flags  & ~LifecycleFlags.update],
      ],
      `callable2.handleChange`,
    );
    assert.deepStrictEqual(
      callable3.handleChange.calls,
      [
        ['new value', 'old value', flags  & ~LifecycleFlags.update],
      ],
      `callable3.handleChange`,
    );
    assert.deepStrictEqual(
      callable4.handleChange.calls,
      [
        ['new value', 'old value', flags  & ~LifecycleFlags.update],
      ],
      `callable4.handleChange`,
    );
    assert.deepStrictEqual(
      callable5.handleChange.calls,
      [
        ['new value', 'old value', flags  & ~LifecycleFlags.update],
      ],
      `callable5.handleChange`,
    );
    assert.deepStrictEqual(
      callable6.handleChange.calls,
      [
        ['new value2', 'old value2', flags  & ~LifecycleFlags.update],
      ],
      `callable6.handleChange`,
    );
    assert.deepStrictEqual(
      callable7.handleChange.calls,
      [
        ['new value2', 'old value2', flags  & ~LifecycleFlags.update],
      ],
      `callable7.handleChange`,
    );
    assert.deepStrictEqual(
      callable8.handleChange.calls,
      [
        ['new value2', 'old value2', flags  & ~LifecycleFlags.update],
      ],
      `callable8.handleChange`,
    );
    assert.deepStrictEqual(
      callable9.handleChange.calls,
      [
        ['new value2', 'old value2', flags  & ~LifecycleFlags.update],
      ],
      `callable9.handleChange`,
    );
    assert.deepStrictEqual(
      callable10.handleChange.calls,
      [
        ['new value2', 'old value2', flags  & ~LifecycleFlags.update],
      ],
      `callable10.handleChange`,
    );
  });

  it('removes subscribers', function () {
    const observer = new Test();

    const subscribers = [];
    for (let i = 0, ii = 100; ii > i; ++i) {
      observer['addSubscriber']((subscribers[i] = { i }) as any);
    }

    let removalCount = 0;
    for (let i = 4, ii = subscribers.length; ii > i; i += 5) {
      const result = observer['removeSubscriber'](subscribers[i]);
      if (result) {
        removalCount++;
      }
    }
    assert.strictEqual(observer['subs']['_sr'].length, subscribers.length - 3 - removalCount, `observer['subs']['_sr'].length`);

    assert.strictEqual(observer['removeSubscriber']({} as any), false, `observer['removeSubscriber']({} as any)`);
  });

  describe('+ batching', function () {
    interface SubCollection extends ISubscriberCollection {}
    @subscriberCollection
    class SubCollection {};

    it('batch notifies', function () {
      const observer = new SubCollection();  
      const sub1Values = [];

      observer.addSubscriber({
        handleChange(newValue, oldValue) {
          sub1Values.push([newValue, oldValue]);
        }
      });
  
      batch(() => {
        observer.callSubscribers(1, 0, LifecycleFlags.none);
        assert.deepStrictEqual(sub1Values, []);
      });
      assert.deepStrictEqual(sub1Values, [[1, 0]]);
    });

    it('handles nested batch()', function () {
      const observer = new SubCollection();
      const sub1Values = [];
      const sub2Values = [];
      const subscriber1 = {
        handleChange(val: number, oldVal: number) {
          sub1Values.push([`level ${sub1Values.length}`, val, oldVal]);
          batch(() => {
            observer.callSubscribers(val, oldVal, LifecycleFlags.none);
          });
          assert.deepStrictEqual(sub1Values, []);
        }
      };
      const subscribe2 = {
        handleChange(val: number, oldValue: number) {

        }
      }

      observer.addSubscriber(subscriber1);
  
      batch(() => {
        observer.callSubscribers(1, 0, LifecycleFlags.none);
        assert.deepStrictEqual(sub1Values, []);
      });
      assert.deepStrictEqual(sub1Values, [['level 0', 1, 0]]);
    });
  });
});
