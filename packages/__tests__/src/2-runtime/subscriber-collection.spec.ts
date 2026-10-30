import {
  createIndexMap,
  ICollectionSubscriber,
  ISubscriber,
  ISubscriberRecord,
  subscriberCollection
} from '@aurelia/runtime';
import { createSpy, assert } from '@aurelia/testing';

@subscriberCollection()
class Test {}
interface Test {
  subs: ISubscriberRecord<ISubscriber>;
}

@subscriberCollection()
class CollectionTest {}
interface CollectionTest {
  subs: ISubscriberRecord<ICollectionSubscriber>;
}

describe('2-runtime/subscriber-collection.spec.ts', function () {
  it('calls a sole value and dirty subscriber', function () {
    const observer = new Test();
    const subscriber = {
      handleChange: createSpy(),
      handleDirty: createSpy(),
    };
    observer.subs.add(subscriber);

    observer.subs.notify('new value', 'old value');
    observer.subs.notifyDirty();

    assert.deepStrictEqual(subscriber.handleChange.calls, [['new value', 'old value']]);
    assert.strictEqual(subscriber.handleDirty.calls.length, 1);
  });

  it('calls a sole collection subscriber', function () {
    const observer = new CollectionTest();
    const subscriber = { handleCollectionChange: createSpy() };
    const collection = ['value'];
    const indexMap = createIndexMap(1);
    observer.subs.add(subscriber);

    observer.subs.notifyCollection(collection, indexMap);

    assert.deepStrictEqual(subscriber.handleCollectionChange.calls, [[collection, indexMap]]);
  });

  it('snapshots value subscribers only when a handler mutates them', function () {
    const observer = new Test();
    const calls: string[] = [];
    const second = { handleChange: (value: unknown) => calls.push(`second:${value}`) };
    const added = { handleChange: (value: unknown) => calls.push(`added:${value}`) };
    const first = {
      handleChange(value: unknown) {
        calls.push(`first:${value}`);
        if (value === 'outer') {
          observer.subs.remove(second);
          observer.subs.add(added);
          observer.subs.notify('nested', void 0);
        }
      },
    };
    const third = { handleChange: (value: unknown) => calls.push(`third:${value}`) };
    observer.subs.add(first);
    observer.subs.add(second);
    observer.subs.add(third);

    observer.subs.notify('outer', void 0);
    observer.subs.notify('next', void 0);

    assert.deepStrictEqual(calls, [
      'first:outer',
      'first:nested', 'third:nested', 'added:nested',
      'second:outer', 'third:outer',
      'first:next', 'third:next', 'added:next',
    ]);
  });

  it('snapshots collection subscribers when a handler mutates them', function () {
    const observer = new CollectionTest();
    const calls: string[] = [];
    const second = { handleCollectionChange: () => calls.push('second') };
    const added = { handleCollectionChange: () => calls.push('added') };
    const first = {
      handleCollectionChange() {
        calls.push('first');
        observer.subs.remove(second);
        observer.subs.add(added);
      },
    };
    const third = { handleCollectionChange: () => calls.push('third') };
    observer.subs.add(first);
    observer.subs.add(second);
    observer.subs.add(third);

    observer.subs.notifyCollection([], createIndexMap(0));
    observer.subs.notifyCollection([], createIndexMap(0));

    assert.deepStrictEqual(calls, ['first', 'second', 'third', 'first', 'third', 'added']);
  });

  it('snapshots dirty subscribers when a handler mutates them', function () {
    const observer = new Test();
    const calls: string[] = [];
    const second = { handleChange() {}, handleDirty: () => calls.push('second') };
    const added = { handleChange() {}, handleDirty: () => calls.push('added') };
    const first = {
      handleChange() {},
      handleDirty() {
        calls.push('first');
        observer.subs.remove(second);
        observer.subs.add(added);
      },
    };
    const third = { handleChange() {}, handleDirty: () => calls.push('third') };
    observer.subs.add(first);
    observer.subs.add(second);
    observer.subs.add(third);

    observer.subs.notifyDirty();
    observer.subs.notifyDirty();

    assert.deepStrictEqual(calls, ['first', 'second', 'third', 'first', 'third', 'added']);
  });

  it('[UNIT] calls subscribers', function () {
    const observer = new Test();
    const observer2 = new Test();

    const callable1 = { handleChange: createSpy() };
    observer.subs.add(callable1);
    const callable2 = { handleChange: createSpy() };
    observer.subs.add(callable2);
    const callable3 = { handleChange: createSpy() };
    observer.subs.add(callable3);
    const callable4 = {
      handleChange: createSpy(() => observer2.subs.notify('new value2', 'old value2'))
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

    observer.subs.notify('new value', 'old value');

    assert.deepStrictEqual(
      callable1.handleChange.calls,
      [
        ['new value', 'old value'],
      ],
      `callable1.handleChange`,
    );
    assert.deepStrictEqual(
      callable2.handleChange.calls,
      [
        ['new value', 'old value'],
      ],
      `callable2.handleChange`,
    );
    assert.deepStrictEqual(
      callable3.handleChange.calls,
      [
        ['new value', 'old value'],
      ],
      `callable3.handleChange`,
    );
    assert.deepStrictEqual(
      callable4.handleChange.calls,
      [
        ['new value', 'old value'],
      ],
      `callable4.handleChange`,
    );
    assert.deepStrictEqual(
      callable5.handleChange.calls,
      [
        ['new value', 'old value'],
      ],
      `callable5.handleChange`,
    );
    assert.deepStrictEqual(
      callable6.handleChange.calls,
      [
        ['new value2', 'old value2'],
      ],
      `callable6.handleChange`,
    );
    assert.deepStrictEqual(
      callable7.handleChange.calls,
      [
        ['new value2', 'old value2'],
      ],
      `callable7.handleChange`,
    );
    assert.deepStrictEqual(
      callable8.handleChange.calls,
      [
        ['new value2', 'old value2'],
      ],
      `callable8.handleChange`,
    );
    assert.deepStrictEqual(
      callable9.handleChange.calls,
      [
        ['new value2', 'old value2'],
      ],
      `callable9.handleChange`,
    );
    assert.deepStrictEqual(
      callable10.handleChange.calls,
      [
        ['new value2', 'old value2'],
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
      observer.subs.remove(subscribers[i]);
      removalCount++;
    }
    assert.strictEqual(removalCount, 20);
    assert.strictEqual(observer.subs.count, subscribers.length - removalCount, `observer.subs.count`);

    assert.strictEqual(observer.subs.remove({} as any), false, `observer.subs.remove({} as any)`);
  });

  it('preserves subscriber order and uniqueness for large subscriber lists', function () {
    const observer = new Test();
    const calls: number[] = [];
    const subscribers = Array.from({ length: 100 }, (_, i) => ({
      handleChange() { calls.push(i); },
    }));

    for (const subscriber of subscribers) {
      assert.strictEqual(observer.subs.add(subscriber), true);
    }
    assert.strictEqual(observer.subs.add(subscribers[50]), false);

    for (let i = 1; i < subscribers.length; i += 2) {
      assert.strictEqual(observer.subs.remove(subscribers[i]), true);
    }
    observer.subs.notify(void 0, void 0);

    assert.deepStrictEqual(calls, subscribers.map((_, i) => i).filter(i => i % 2 === 0));
    assert.strictEqual(observer.subs.count, 50);

    for (let i = 0; i < subscribers.length; i += 2) {
      assert.strictEqual(observer.subs.remove(subscribers[i]), true);
    }
    assert.strictEqual(observer.subs.count, 0);

    calls.length = 0;
    assert.strictEqual(observer.subs.add(subscribers[0]), true);
    observer.subs.notify(void 0, void 0);
    assert.deepStrictEqual(calls, [0]);
  });

  it('snapshots a large subscriber list during notification', function () {
    const observer = new Test();
    const calls: string[] = [];
    const added = { handleChange: () => calls.push('added') };
    const subscribers = Array.from({ length: 20 }, (_, i) => ({
      handleChange() {
        calls.push(`${i}`);
        if (i === 0) {
          observer.subs.remove(subscribers[1]);
          observer.subs.add(added);
        }
      },
    }));
    for (const subscriber of subscribers) {
      observer.subs.add(subscriber);
    }

    observer.subs.notify(void 0, void 0);
    assert.deepStrictEqual(calls, subscribers.map((_, i) => `${i}`));

    calls.length = 0;
    observer.subs.notify(void 0, void 0);
    assert.deepStrictEqual(calls, [
      '0',
      ...Array.from({ length: 18 }, (_, i) => `${i + 2}`),
      'added',
    ]);
  });

  it('removes and re-adds a sole subscriber', function () {
    const observer = new Test();
    const subscriber = { handleChange: createSpy() };

    observer.subs.add(subscriber);
    assert.strictEqual(observer.subs.remove(subscriber), true);
    assert.strictEqual(observer.subs.count, 0);
    assert.strictEqual(observer.subs.remove(subscriber), false);

    observer.subs.add(subscriber);
    observer.subs.notify('new value', 'old value');

    assert.strictEqual(observer.subs.count, 1);
    assert.deepStrictEqual(subscriber.handleChange.calls, [['new value', 'old value']]);
  });

  it('clears dirty state when removing a sole dirty subscriber', function () {
    const observer = new Test();
    const subscriber = {
      handleChange() {},
      handleDirty: createSpy(),
    };

    observer.subs.add(subscriber);
    assert.strictEqual(observer.subs.remove(subscriber), true);
    observer.subs.notifyDirty();
    assert.strictEqual(subscriber.handleDirty.calls.length, 0);

    observer.subs.add(subscriber);
    observer.subs.notifyDirty();
    assert.strictEqual(subscriber.handleDirty.calls.length, 1);
  });
});
