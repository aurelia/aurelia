import {
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
});
