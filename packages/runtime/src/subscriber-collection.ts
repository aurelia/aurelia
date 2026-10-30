import { rtDef, rtDefineHiddenProp, ensureProto } from './utilities';

import type {
  Collection,
  ICollectionSubscriber,
  IDirtySubscriber,
  IndexMap,
  ISubscriber,
  ISubscriberCollection,
  ISubscriberRecord,
} from './interfaces';
import { addValueBatch, batching } from './subscriber-batch';
import { Class, Constructable } from '@aurelia/kernel';

export type IAnySubscriber = ISubscriber | ICollectionSubscriber;

// Keep the common small record allocation-light while preventing quadratic fan-out setup and teardown.
const subscriberSetThreshold = 16;
const subscriberArrayThreshold = subscriberSetThreshold >> 1;

export const subscriberCollection = /*@__PURE__*/(() => {

  function subscriberCollection(): <T extends Constructable>(value: T, context: ClassDecoratorContext) => T;
  function subscriberCollection<T extends Constructable>(target: T, context: ClassDecoratorContext): T;
  function subscriberCollection<T extends Constructable>(target?: T, context?: ClassDecoratorContext<T>): ((value: T, context: ClassDecoratorContext) => T) | T {
    return target == null ? subscriberCollectionDeco : subscriberCollectionDeco(target, context!);
  }

  function getSubscriberRecord(this: ISubscriberCollection) {
    return rtDefineHiddenProp(this, 'subs', new SubscriberRecord());
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
      rtDef(proto, 'subs', { get: getSubscriberRecord });

      ensureProto(proto, 'subscribe', addSubscriber);
      ensureProto(proto, 'unsubscribe', removeSubscriber);
    }

    return target;
  }

  class SubscriberRecord<T extends IAnySubscriber> implements ISubscriberRecord<T> {
    public count: number = 0;
    /** @internal */
    private readonly _subs: T[] = [];
    /** @internal */
    private readonly _requestDirtySubs: IDirtySubscriber[] = [];
    /** @internal */
    private _hasDirtySubs = false;
    /** @internal */
    private declare _subscriberSet: Set<T> | undefined;
    /** @internal */
    private declare _subscriberArrayDirty: boolean;

    public add(subscriber: T): boolean {
      const subs = this._subs;
      if (this.count === 0) {
        subs[0] = subscriber;
        if ('handleDirty' in subscriber) {
          this._requestDirtySubs[0] = subscriber as IDirtySubscriber;
          this._hasDirtySubs = true;
        }
        this.count = 1;
        return true;
      }
      if (subs.includes(subscriber)) {
        return false;
      }
      subs[subs.length] = subscriber;
      if ('handleDirty' in subscriber) {
        this._requestDirtySubs[this._requestDirtySubs.length] = subscriber as IDirtySubscriber;
        this._hasDirtySubs = true;
      }
      if (++this.count === subscriberSetThreshold) {
        this._useSubscriberSet();
      }
      return true;
    }

    public remove(subscriber: T): boolean {
      const subs = this._subs;
      if (this.count === 1) {
        if (subs[0] !== subscriber) {
          return false;
        }
        subs.pop();
        if (this._hasDirtySubs) {
          this._requestDirtySubs.pop();
          this._hasDirtySubs = false;
        }
        this.count = 0;
        return true;
      }
      let idx = subs.indexOf(subscriber);
      if (idx !== -1) {
        subs.splice(idx, 1);
        idx = this._requestDirtySubs.indexOf(subscriber as IDirtySubscriber);
        if (idx !== -1) {
          this._requestDirtySubs.splice(idx, 1);
          this._hasDirtySubs = this._requestDirtySubs.length > 0;
        }
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

      const subs = this._subs;
      if (subs.length === 1) {
        (subs[0] as ISubscriber).handleChange(val, oldVal);
        return;
      }

      /**
       * Note: change handlers may have the side-effect of adding/removing subscribers to this collection during this
       * callSubscribers invocation, so we're caching them all before invoking any.
       * Subscribers added during this invocation are not invoked (and they shouldn't be).
       * Subscribers removed during this invocation will still be invoked (and they also shouldn't be,
       * however this is accounted for via $isBound and similar flags on the subscriber objects)
       */
      for (const sub of subs.slice(0) as ISubscriber[]) {
        sub.handleChange(val, oldVal);
      }
    }

    public notifyCollection(collection: Collection, indexMap: IndexMap): void {
      const subs = this._subs;
      if (subs.length === 1) {
        (subs[0] as ICollectionSubscriber).handleCollectionChange(collection, indexMap);
        return;
      }
      const _subs = subs.slice(0) as ICollectionSubscriber[];
      const len = _subs.length;
      let i = 0;
      for (; i < len; ++i) {
        _subs[i].handleCollectionChange(collection, indexMap);
      }
      return;
    }

    /** @internal */
    private _useSubscriberSet(): void {
      this._subscriberSet = new Set(this._subs);
      this._subscriberArrayDirty = false;
      rtDefineHiddenProp(this, 'add', this._addSet);
      rtDefineHiddenProp(this, 'remove', this._removeSet);
      rtDefineHiddenProp(this, 'notify', this._notifySet);
      rtDefineHiddenProp(this, 'notifyCollection', this._notifyCollectionSet);
    }

    /** @internal */
    private _addSet(subscriber: T): boolean {
      const subscriberSet = this._subscriberSet!;
      if (subscriberSet.has(subscriber)) {
        return false;
      }
      subscriberSet.add(subscriber);
      this._subs[this._subs.length] = subscriber;
      if ('handleDirty' in subscriber) {
        this._requestDirtySubs[this._requestDirtySubs.length] = subscriber as IDirtySubscriber;
        this._hasDirtySubs = true;
      }
      ++this.count;
      return true;
    }

    /** @internal */
    private _removeSet(subscriber: T): boolean {
      if (!this._subscriberSet!.delete(subscriber)) {
        return false;
      }
      this._subscriberArrayDirty = true;
      const dirtyIdx = this._requestDirtySubs.indexOf(subscriber as IDirtySubscriber);
      if (dirtyIdx !== -1) {
        this._requestDirtySubs.splice(dirtyIdx, 1);
        this._hasDirtySubs = this._requestDirtySubs.length > 0;
      }
      --this.count;
      if (this.count === subscriberArrayThreshold) {
        this._compactSubscribers();
        this._subscriberSet = void 0;
        Reflect.deleteProperty(this, 'add');
        Reflect.deleteProperty(this, 'remove');
        Reflect.deleteProperty(this, 'notify');
        Reflect.deleteProperty(this, 'notifyCollection');
      }
      return true;
    }

    /** @internal */
    private _notifySet(val: unknown, oldVal: unknown): void {
      if (batching) {
        addValueBatch(this, val, oldVal);
        return;
      }
      this._compactSubscribers();
      const subs = this._subs;
      if (subs.length === 1) {
        (subs[0] as ISubscriber).handleChange(val, oldVal);
        return;
      }
      for (const sub of subs.slice(0) as ISubscriber[]) {
        sub.handleChange(val, oldVal);
      }
    }

    /** @internal */
    private _notifyCollectionSet(collection: Collection, indexMap: IndexMap): void {
      this._compactSubscribers();
      const subs = this._subs;
      if (subs.length === 1) {
        (subs[0] as ICollectionSubscriber).handleCollectionChange(collection, indexMap);
        return;
      }
      for (const sub of subs.slice(0) as ICollectionSubscriber[]) {
        sub.handleCollectionChange(collection, indexMap);
      }
    }

    /** @internal */
    private _compactSubscribers(): void {
      if (!this._subscriberArrayDirty) {
        return;
      }
      const subscriberSet = this._subscriberSet!;
      const subs = this._subs;
      let writeIndex = 0;
      for (const subscriber of subs) {
        if (subscriberSet.has(subscriber)) {
          subs[writeIndex++] = subscriber;
        }
      }
      subs.length = writeIndex;
      this._subscriberArrayDirty = false;
    }

    public notifyDirty() {
      if (this._hasDirtySubs) {
        const dirtySubs = this._requestDirtySubs;
        if (dirtySubs.length === 1) {
          dirtySubs[0].handleDirty();
          return;
        }
        for (const dirtySub of dirtySubs.slice(0)) {
          dirtySub.handleDirty();
        }
      }
    }
  }

  return subscriberCollection;
})();
