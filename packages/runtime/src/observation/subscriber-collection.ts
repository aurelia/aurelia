import { def, defineHiddenProp, ensureProto } from '../utilities';

import type {
  Collection,
  ICollectionSubscriber,
  IndexMap,
  ISubscriber,
  ISubscriberCollection,
  ISubscriberRecord,
} from '../observation';
import { addValueBatch, batching } from './subscriber-batch';
import { Class, Constructable } from '@aurelia/kernel';

export type IAnySubscriber = ISubscriber | ICollectionSubscriber;

export const subscriberCollection = /*@__PURE__*/(() => {

  function subscriberCollection(): <T extends Constructable>(value: T, context: ClassDecoratorContext) => T;
  function subscriberCollection<T extends Constructable>(target: T, context: ClassDecoratorContext): T;
  function subscriberCollection<T extends Constructable>(target?: T, context?: ClassDecoratorContext<T>): ((value: T, context: ClassDecoratorContext) => T) | T {
    return target == null ? subscriberCollectionDeco : subscriberCollectionDeco(target, context!);
  }

  function getSubscriberRecord(this: ISubscriberCollection) {
    return defineHiddenProp(this, 'subs', new SubscriberRecord());
  }

  function addSubscriber(this: ISubscriberCollection, subscriber: IAnySubscriber): boolean {
    return this.subs.add(subscriber as ISubscriber & ICollectionSubscriber);
  }

  function removeSubscriber(this: ISubscriberCollection, subscriber: IAnySubscriber): boolean {
    return this.subs.remove(subscriber as ISubscriber & ICollectionSubscriber);
  }

  const decoratedTarget = new WeakSet<Constructable>();
  function subscriberCollectionDeco<TObj extends object, T extends Class<TObj>>(target: T, context: ClassDecoratorContext): T { // ClassDecorator expects it to be derived from Function
    if (!decoratedTarget.has(target)) {
      decoratedTarget.add(target);
      const proto = target.prototype as ISubscriberCollection;
      // not configurable, as in devtool, the getter could be invoked on the prototype,
      // and become permanently broken
      def(proto, 'subs', { get: getSubscriberRecord });

      ensureProto(proto, 'subscribe', addSubscriber);
      ensureProto(proto, 'unsubscribe', removeSubscriber);
    }

    return target;
  }

  class SubscriberRecord<T extends IAnySubscriber> implements ISubscriberRecord<T> {
    public count: number = 0;
    /** @internal */
    private readonly _subs: T[] = [];

    public add(subscriber: T): boolean {
      if (this._subs.includes(subscriber)) {
        return false;
      }
      this._subs[this._subs.length] = subscriber;
      ++this.count;
      return true;
    }

    public remove(subscriber: T): boolean {
      const idx = this._subs.indexOf(subscriber);
      if (idx !== -1) {
        this._subs.splice(idx, 1);
        --this.count;
        return true;
      }
      return false;
    }

    public notify(val: unknown, oldVal: unknown): void {
      if (batching) {
        addValueBatch(this, val, oldVal);
        return;
      }
      /**
       * Note: change handlers may have the side-effect of adding/removing subscribers to this collection during this
       * callSubscribers invocation, so we're caching them all before invoking any.
       * Subscribers added during this invocation are not invoked (and they shouldn't be).
       * Subscribers removed during this invocation will still be invoked (and they also shouldn't be,
       * however this is accounted for via $isBound and similar flags on the subscriber objects)
       */
      const _subs = this._subs.slice(0) as ISubscriber[];
      const len = _subs.length;
      let i = 0;
      for (; i < len; ++i) {
        _subs[i].handleChange(val, oldVal);
      }
      return;
    }

    public notifyCollection(collection: Collection, indexMap: IndexMap): void {
      const _subs = this._subs.slice(0) as ICollectionSubscriber[];
      const len = _subs.length;
      let i = 0;
      for (; i < len; ++i) {
        _subs[i].handleCollectionChange(collection, indexMap);
      }
      return;
    }
  }

  return subscriberCollection;
})();
