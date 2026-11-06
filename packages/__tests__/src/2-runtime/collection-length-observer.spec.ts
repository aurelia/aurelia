import {
  batch,
  getCollectionObserver,
  type Collection,
  type CollectionObserver,
  type ICollectionSubscriberCollection,
  type ISubscriber,
} from '@aurelia/runtime';
import { assert, createSpy } from '@aurelia/testing';

const cases: readonly [name: string, createCollection: () => Collection][] = [
  ['array length', () => []],
  ['map size', () => new Map()],
  ['set size', () => new Set()],
];

describe('2-runtime/collection-length-observer.spec.ts', function () {
  for (const [name, createCollection] of cases) {
    it(`subscribes and unsubscribes the ${name} observer with its owner`, function () {
      const owner = getCollectionObserver(createCollection()) as CollectionObserver & ICollectionSubscriberCollection;
      const observer = owner.getLengthObserver();
      const subscribeSpy = createSpy(owner, 'subscribe', true);
      const unsubscribeSpy = createSpy(owner, 'unsubscribe', true);
      const subscriber1: ISubscriber = { handleChange() {} };
      const subscriber2: ISubscriber = { handleChange() {} };

      try {
        observer.subscribe(subscriber1);
        assert.strictEqual(subscribeSpy.calls.length, 1, 'subscribes to the owner for the first subscriber');
        assert.strictEqual(owner.subs.count, 1, 'owner has one subscriber');

        observer.subscribe(subscriber2);
        assert.strictEqual(subscribeSpy.calls.length, 1, 'does not subscribe to the owner again');
        assert.strictEqual(owner.subs.count, 1, 'owner still has one subscriber');

        observer.unsubscribe(subscriber1);
        assert.strictEqual(unsubscribeSpy.calls.length, 0, 'stays subscribed to the owner while one subscriber remains');
        assert.strictEqual(owner.subs.count, 1, 'owner still has one subscriber');

        observer.unsubscribe(subscriber2);
        assert.strictEqual(subscribeSpy.calls.length, 1, 'does not subscribe to the owner during final removal');
        assert.strictEqual(unsubscribeSpy.calls.length, 1, 'unsubscribes from the owner after the final subscriber');
        assert.strictEqual(owner.subs.count, 0, 'owner has no subscribers');

        observer.subscribe(subscriber1);
        assert.strictEqual(subscribeSpy.calls.length, 2, 'resubscribes to the owner for a new subscriber');
        assert.strictEqual(owner.subs.count, 1, 'owner has one subscriber after resubscription');

        observer.unsubscribe(subscriber1);
        assert.strictEqual(unsubscribeSpy.calls.length, 2, 'unsubscribes from the owner again');
        assert.strictEqual(owner.subs.count, 0, 'owner has no subscribers after the second cycle');
      } finally {
        subscribeSpy.restore();
        unsubscribeSpy.restore();
      }
    });
  }

  const mutationCases: readonly [name: string, createCollection: () => Collection, grow: (c: any, value?: number) => void, shrink: (c: any) => void][] = [
    ['array length', () => [1], (arr: number[], value = 2) => arr.push(value), (arr: number[]) => arr.pop()],
    ['map size', () => new Map([[1, 1]]), (map: Map<number, number>, value = 2) => map.set(value, value), (map: Map<number, number>) => map.delete(2)],
    ['set size', () => new Set([1]), (set: Set<number>, value = 2) => set.add(value), (set: Set<number>) => set.delete(2)],
  ];

  for (const [name, createCollection, grow, shrink] of mutationCases) {
    // https://github.com/aurelia/aurelia/issues/2583
    it(`notifies a ${name} change back to the count cached before the observer detached`, function () {
      const collection = createCollection();
      const observer = getCollectionObserver(collection).getLengthObserver();
      const changes: [newValue: number, oldValue: number][] = [];
      const subscriber: ISubscriber = { handleChange(newValue: number, oldValue: number) { changes.push([newValue, oldValue]); } };

      observer.subscribe(subscriber);
      observer.unsubscribe(subscriber);
      grow(collection);

      observer.subscribe(subscriber);
      shrink(collection);

      assert.deepStrictEqual(changes, [[1, 2]]);
      observer.unsubscribe(subscriber);
    });

    it(`preserves a pending ${name} change when duplicate or additional subscribers attach`, function () {
      const collection = createCollection();
      const observer = getCollectionObserver(collection).getLengthObserver();
      const firstChanges: number[][] = [];
      const secondChanges: number[][] = [];
      const first: ISubscriber<number> = { handleChange: (value, oldValue) => firstChanges.push([value, oldValue]) };
      const second: ISubscriber<number> = { handleChange: (value, oldValue) => secondChanges.push([value, oldValue]) };
      observer.subscribe(first);

      batch(() => {
        grow(collection);
        // Only a new observation cycle may replace the cached count. Another
        // subscriber must not erase the change the first one is waiting for.
        observer.subscribe(first);
        observer.subscribe(second);
        assert.deepStrictEqual(firstChanges, []);
      });

      assert.deepStrictEqual(firstChanges, [[2, 1]]);
      assert.deepStrictEqual(secondChanges, [[2, 1]]);
      observer.unsubscribe(first);
      shrink(collection);
      assert.deepStrictEqual(firstChanges, [[2, 1]]);
      assert.deepStrictEqual(secondChanges, [[2, 1], [1, 2]]);
      observer.unsubscribe(second);
    });

    it(`uses the resubscribed ${name} as the baseline across nested batch flushes`, function () {
      const collection = createCollection();
      const owner = getCollectionObserver(collection);
      const observer = owner.getLengthObserver();
      const changes: number[][] = [];
      let collectionChanges = 0;
      const collectionSubscriber = { handleCollectionChange: () => { ++collectionChanges; } };
      const subscriber: ISubscriber<number> = { handleChange: (value, oldValue) => changes.push([value, oldValue]) };
      // A repeat can keep observing the collection while a guarded count binding
      // disconnects. Its pending batch must not become that binding's old value.
      owner.subscribe(collectionSubscriber);
      observer.subscribe(subscriber);
      observer.unsubscribe(subscriber);

      batch(() => {
        grow(collection);
        observer.subscribe(subscriber);
        assert.strictEqual(observer.getValue(), 2);
        assert.deepStrictEqual(changes, [], 'subscribing reads the current count without notifying');

        batch(() => grow(collection, 3));
        assert.deepStrictEqual(changes, [[3, 2]]);
        assert.strictEqual(collectionChanges, 1, 'the inner flush includes earlier collection mutations');
        shrink(collection);
        assert.strictEqual(changes.length, 1, 'outer batching resumes after the inner flush');
      });

      assert.deepStrictEqual(changes, [[3, 2], [2, 3]]);
      assert.strictEqual(collectionChanges, 2, 'the outer flush does not replay the inner batch');
      observer.unsubscribe(subscriber);
      owner.unsubscribe(collectionSubscriber);
    });
  }
});
