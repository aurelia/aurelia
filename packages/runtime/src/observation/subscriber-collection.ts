import {
  ISubscriberRecord,
  LifecycleFlags as LF,
  SubscriberFlags as SF,
} from '../observation.js';
import { def, defineHiddenProp, ensureProto } from '../utilities-objects.js';

import type {
  ICollectionSubscriber,
  ICollectionSubscriberCollection,
  IndexMap,
  ISubscriber,
  ISubscriberCollection,
} from '../observation.js';

type IAnySubscriber = ISubscriber | ICollectionSubscriber;

export function subscriberCollection(): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (target: Function): void { // ClassDecorator expects it to be derived from Function
    const proto = target.prototype as ISubscriberCollection;

    ensureProto(proto, 'addSubscriber', addSubscriber, true);
    ensureProto(proto, 'removeSubscriber', removeSubscriber, true);
    ensureProto(proto, 'hasSubscriber', hasSubscriber, true);
    ensureProto(proto, 'hasSubscribers', hasSubscribers, true);
    ensureProto(proto, 'callSubscribers', callSubscribers, true);
    // not configurable, as in devtool, the getter could be invoked on the prototype,
    // and become permanently broken
    def(proto, 'subs', { get: getSubscriberRecord });

    ensureProto(proto, 'subscribe', addSubscriber);
    ensureProto(proto, 'unsubscribe', removeSubscriber);
  };
}

export function collectionSubscriberCollection(): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (target: Function): void { // ClassDecorator expects it to be derived from Function
    const proto = target.prototype as ICollectionSubscriberCollection;

    ensureProto(proto, 'addCollectionSubscriber', addSubscriber, true);
    ensureProto(proto, 'removeCollectionSubscriber', removeSubscriber, true);
    ensureProto(proto, 'hasCollectionSubscriber', hasSubscriber, true);
    ensureProto(proto, 'hasCollectionSubscribers', hasSubscribers, true);
    ensureProto(proto, 'callCollectionSubscribers', callCollectionSubscribers, true);
    // not configurable, as in devtool, the getter could be invoked on the prototype,
    // and become permanently broken
    def(proto, 'subs', { get: getSubscriberRecord });
    ensureProto(proto, 'subscribeToCollection', addSubscriber);
    ensureProto(proto, 'unsubscribeFromCollection', removeSubscriber);
  };
}

export class SubscriberRecord<T extends IAnySubscriber> implements ISubscriberRecord<T> {
  private _sFlags: SF = SF.None;
  private _s0?: T;
  private _s1?: T;
  private _s2?: T;
  private _sRest?: T[];

  public count: number = 0;
  public readonly owner: ISubscriberCollection | ICollectionSubscriberCollection;

  public constructor(owner: ISubscriberCollection | ICollectionSubscriberCollection) {
    this.owner = owner;
  }

  public add(subscriber: T): boolean {
    if (this.has(subscriber)) {
      return false;
    }
    const subscriberFlags = this._sFlags;
    if ((subscriberFlags & SF.Subscriber0) === 0) {
      this._s0 = subscriber;
      this._sFlags |= SF.Subscriber0;
    } else if ((subscriberFlags & SF.Subscriber1) === 0) {
      this._s1 = subscriber;
      this._sFlags |= SF.Subscriber1;
    } else if ((subscriberFlags & SF.Subscriber2) === 0) {
      this._s2 = subscriber;
      this._sFlags |= SF.Subscriber2;
    } else if ((subscriberFlags & SF.SubscribersRest) === 0) {
      this._sRest = [subscriber];
      this._sFlags |= SF.SubscribersRest;
    } else {
      this._sRest!.push(subscriber); // Non-null is implied by else branch of (subscriberFlags & SF.SubscribersRest) === 0
    }
    ++this.count;
    return true;
  }

  public has(subscriber: T): boolean {
    // Flags here is just a perf tweak
    // Compared to not using flags, it's a moderate speed-up when this collection does not have the subscriber;
    // and minor slow-down when it does, and the former is more common than the latter.
    const subscriberFlags = this._sFlags;
    if ((subscriberFlags & SF.Subscriber0) > 0 && this._s0 === subscriber) {
      return true;
    }
    if ((subscriberFlags & SF.Subscriber1) > 0 && this._s1 === subscriber) {
      return true;
    }
    if ((subscriberFlags & SF.Subscriber2) > 0 && this._s2 === subscriber) {
      return true;
    }
    if ((subscriberFlags & SF.SubscribersRest) > 0) {
      const subscribers = this._sRest!; // Non-null is implied by (subscriberFlags & SF.SubscribersRest) > 0
      for (let i = 0, ii = subscribers.length; i < ii; ++i) {
        if (subscribers[i] === subscriber) {
          return true;
        }
      }
    }
    return false;
  }

  public any(): boolean {
    return this._sFlags !== SF.None;
  }

  public remove(subscriber: T): boolean {
    const subscriberFlags = this._sFlags;
    if ((subscriberFlags & SF.Subscriber0) > 0 && this._s0 === subscriber) {
      this._s0 = void 0;
      this._sFlags = (this._sFlags | SF.Subscriber0) ^ SF.Subscriber0;
      --this.count;
      return true;
    } else if ((subscriberFlags & SF.Subscriber1) > 0 && this._s1 === subscriber) {
      this._s1 = void 0;
      this._sFlags = (this._sFlags | SF.Subscriber1) ^ SF.Subscriber1;
      --this.count;
      return true;
    } else if ((subscriberFlags & SF.Subscriber2) > 0 && this._s2 === subscriber) {
      this._s2 = void 0;
      this._sFlags = (this._sFlags | SF.Subscriber2) ^ SF.Subscriber2;
      --this.count;
      return true;
    } else if ((subscriberFlags & SF.SubscribersRest) > 0) {
      const subscribers = this._sRest!; // Non-null is implied by (subscriberFlags & SF.SubscribersRest) > 0
      let i = 0;
      let ii = subscribers.length;
      for (; i < ii; ++i) {
        if (subscribers[i] === subscriber) {
          subscribers.splice(i, 1);
          if (ii === 1) {
            this._sFlags = (this._sFlags | SF.SubscribersRest) ^ SF.SubscribersRest;
          }
          // deepscan-disable-next-line
          --i; --ii;
          --this.count;
          return true;
        }
      }
    }
    return false;
  }

  public notify(val: unknown, oldVal: unknown, flags: LF): void {
    /**
     * Note: change handlers may have the side-effect of adding/removing subscribers to this collection during this
     * callSubscribers invocation, so we're caching them all before invoking any.
     * Subscribers added during this invocation are not invoked (and they shouldn't be).
     * Subscribers removed during this invocation will still be invoked (and they also shouldn't be,
     * however this is accounted for via $isBound and similar flags on the subscriber objects)
     */
    const owner = this.owner;
    const sub0 = this._s0 as ISubscriber;
    const sub1 = this._s1 as ISubscriber;
    const sub2 = this._s2 as ISubscriber;
    let subRest = this._sRest as ISubscriber[];
    flags = (flags | LF.update) ^ LF.update;

    if (subRest !== void 0) {
      subRest = subRest.slice();
    }
    if (sub0 !== void 0) {
      sub0.handleChange(val, oldVal, flags | /* sub own flags */(sub0.id === void 0 ? 0 : owner[sub0.id]));
    }
    if (sub1 !== void 0) {
      sub1.handleChange(val, oldVal, flags | /* sub own flags */(sub1.id === void 0 ? 0 : owner[sub1.id]));
    }
    if (sub2 !== void 0) {
      sub2.handleChange(val, oldVal, flags | /* sub own flags */(sub2.id === void 0 ? 0 : owner[sub2.id]));
    }
    if (subRest !== void 0) {
      const length = subRest.length;
      let sub: ISubscriber | undefined;
      let i = 0;
      for (; i < length; ++i) {
        sub = subRest[i];
        if (sub !== void 0) {
          sub.handleChange(val, oldVal, flags | /* sub own flags */(sub.id === void 0 ? 0 : owner[sub.id]));
        }
      }
    }
  }

  public notifyCollection(indexMap: IndexMap, flags: LF): void {
    const subscriber0 = this._s0 as ICollectionSubscriber;
    const subscriber1 = this._s1 as ICollectionSubscriber;
    const subscriber2 = this._s2 as ICollectionSubscriber;
    let subscribers = this._sRest as ICollectionSubscriber[];
    if (subscribers !== void 0) {
      subscribers = subscribers.slice();
    }
    if (subscriber0 !== void 0) {
      subscriber0.handleCollectionChange(indexMap, flags);
    }
    if (subscriber1 !== void 0) {
      subscriber1.handleCollectionChange(indexMap, flags);
    }
    if (subscriber2 !== void 0) {
      subscriber2.handleCollectionChange(indexMap, flags);
    }
    if (subscribers !== void 0) {
      const length = subscribers.length;
      let subscriber: ICollectionSubscriber | undefined;
      let i = 0;
      for (; i < length; ++i) {
        subscriber = subscribers[i];
        if (subscriber !== void 0) {
          subscriber.handleCollectionChange(indexMap, flags);
        }
      }
    }
  }
}

function getSubscriberRecord(this: ISubscriberCollection) {
  const record = new SubscriberRecord(this);
  defineHiddenProp(this, 'subs', record);
  return record;
}

function addSubscriber(this: ISubscriberCollection, subscriber: IAnySubscriber): boolean {
  return this.subs.add(subscriber);
}

function removeSubscriber(this: ISubscriberCollection, subscriber: IAnySubscriber): boolean {
  return this.subs.remove(subscriber);
}

function hasSubscriber(this: ISubscriberCollection, subscriber: IAnySubscriber): boolean {
  return this.subs.has(subscriber);
}

function hasSubscribers(this: ISubscriberCollection): boolean {
  return this.subs.any();
}

function callSubscribers(this: ISubscriberCollection, newValue: unknown, previousValue: unknown, flags: LF): void {
  this.subs.notify(newValue, previousValue, flags);
}

function callCollectionSubscribers(this: ICollectionSubscriberCollection, indexMap: IndexMap, flags: LF): void {
  this.subs.notifyCollection(indexMap, flags);
}
