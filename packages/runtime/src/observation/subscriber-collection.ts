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

export type IAnySubscriber = ISubscriber | ICollectionSubscriber;

/* eslint-disable @typescript-eslint/ban-types */
export function subscriberCollection(): ClassDecorator;
export function subscriberCollection(target: Function): void;
export function subscriberCollection(target?: Function): ClassDecorator | void {
  return target == null ? subscriberCollectionDeco : subscriberCollectionDeco(target);
}

function subscriberCollectionDeco(target: Function): void { // ClassDecorator expects it to be derived from Function
  const proto = target.prototype as ISubscriberCollection;
  // not configurable, as in devtool, the getter could be invoked on the prototype,
  // and become permanently broken
  def(proto, 'subs', { get: getSubscriberRecord });

  ensureProto(proto, 'subscribe', addSubscriber);
  ensureProto(proto, 'unsubscribe', removeSubscriber);
}
/* eslint-enable @typescript-eslint/ban-types */

export class SubscriberRecord<T extends IAnySubscriber> implements ISubscriberRecord<T> {
  /**
   * subscriber flags: bits indicating the existence status of the subscribers of this record
   */
  private _sf: SF = SF.None;
  private _s0?: T;
  private _s1?: T;
  private _s2?: T;
  /**
   * subscriber rest: When there's more than 3 subscribers, use an array to store the subscriber references
   */
  private _sr?: T[];

  public count: number = 0;
  public readonly owner: ISubscriberCollection | ICollectionSubscriberCollection;

  public constructor(
    owner: ISubscriberCollection | ICollectionSubscriberCollection,
  ) {
    this.owner = owner;
  }

  public add(subscriber: T): boolean {
    if (this.has(subscriber)) {
      return false;
    }
    const subscriberFlags = this._sf;
    if ((subscriberFlags & SF.Subscriber0) === 0) {
      this._s0 = subscriber;
      this._sf |= SF.Subscriber0;
    } else if ((subscriberFlags & SF.Subscriber1) === 0) {
      this._s1 = subscriber;
      this._sf |= SF.Subscriber1;
    } else if ((subscriberFlags & SF.Subscriber2) === 0) {
      this._s2 = subscriber;
      this._sf |= SF.Subscriber2;
    } else if ((subscriberFlags & SF.SubscribersRest) === 0) {
      this._sr = [subscriber];
      this._sf |= SF.SubscribersRest;
    } else {
      this._sr!.push(subscriber); // Non-null is implied by else branch of (subscriberFlags & SF.SubscribersRest) === 0
    }
    ++this.count;
    return true;
  }

  public has(subscriber: T): boolean {
    // Flags here is just a perf tweak
    // Compared to not using flags, it's a moderate speed-up when this collection does not have the subscriber;
    // and minor slow-down when it does, and the former is more common than the latter.
    const subscriberFlags = this._sf;
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
      const subscribers = this._sr!; // Non-null is implied by (subscriberFlags & SF.SubscribersRest) > 0
      const ii = subscribers.length;
      let i = 0;
      for (; i < ii; ++i) {
        if (subscribers[i] === subscriber) {
          return true;
        }
      }
    }
    return false;
  }

  public any(): boolean {
    return this._sf !== SF.None;
  }

  public remove(subscriber: T): boolean {
    const subscriberFlags = this._sf;
    if ((subscriberFlags & SF.Subscriber0) > 0 && this._s0 === subscriber) {
      this._s0 = void 0;
      this._sf = (this._sf | SF.Subscriber0) ^ SF.Subscriber0;
      --this.count;
      return true;
    } else if ((subscriberFlags & SF.Subscriber1) > 0 && this._s1 === subscriber) {
      this._s1 = void 0;
      this._sf = (this._sf | SF.Subscriber1) ^ SF.Subscriber1;
      --this.count;
      return true;
    } else if ((subscriberFlags & SF.Subscriber2) > 0 && this._s2 === subscriber) {
      this._s2 = void 0;
      this._sf = (this._sf | SF.Subscriber2) ^ SF.Subscriber2;
      --this.count;
      return true;
    } else if ((subscriberFlags & SF.SubscribersRest) > 0) {
      const subscribers = this._sr!; // Non-null is implied by (subscriberFlags & SF.SubscribersRest) > 0
      const ii = subscribers.length;
      let i = 0;
      for (; i < ii; ++i) {
        if (subscribers[i] === subscriber) {
          subscribers.splice(i, 1);
          if (ii === 1) {
            this._sf = (this._sf | SF.SubscribersRest) ^ SF.SubscribersRest;
          }
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
    let subs = this._sr as ISubscriber[];
    if (subs !== void 0) {
      subs = subs.slice();
    }

    flags = (flags | LF.update) ^ LF.update;

    if (sub0 !== void 0) {
      sub0.handleChange(val, oldVal, flags | /* sub own flags */(sub0.id === void 0 ? 0 : owner[sub0.id]));
    }
    if (sub1 !== void 0) {
      sub1.handleChange(val, oldVal, flags | /* sub own flags */(sub1.id === void 0 ? 0 : owner[sub1.id]));
    }
    if (sub2 !== void 0) {
      sub2.handleChange(val, oldVal, flags | /* sub own flags */(sub2.id === void 0 ? 0 : owner[sub2.id]));
    }
    if (subs !== void 0) {
      const ii = subs.length;
      let sub: ISubscriber | undefined;
      let i = 0;
      for (; i < ii; ++i) {
        sub = subs[i];
        if (sub !== void 0) {
          sub.handleChange(val, oldVal, flags | /* sub own flags */(sub.id === void 0 ? 0 : owner[sub.id]));
        }
      }
    }
  }

  public notifyCollection(indexMap: IndexMap, flags: LF): void {
    const sub0 = this._s0 as ICollectionSubscriber;
    const sub1 = this._s1 as ICollectionSubscriber;
    const sub2 = this._s2 as ICollectionSubscriber;
    let subs = this._sr as ICollectionSubscriber[];
    if (subs !== void 0) {
      subs = subs.slice();
    }

    if (sub0 !== void 0) {
      sub0.handleCollectionChange(indexMap, flags);
    }
    if (sub1 !== void 0) {
      sub1.handleCollectionChange(indexMap, flags);
    }
    if (sub2 !== void 0) {
      sub2.handleCollectionChange(indexMap, flags);
    }
    if (subs !== void 0) {
      const ii = subs.length;
      let sub: ICollectionSubscriber | undefined;
      let i = 0;
      for (; i < ii; ++i) {
        sub = subs[i];
        if (sub !== void 0) {
          sub.handleCollectionChange(indexMap, flags);
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
  return this.subs.add(subscriber as ISubscriber & ICollectionSubscriber);
}

function removeSubscriber(this: ISubscriberCollection, subscriber: IAnySubscriber): boolean {
  return this.subs.remove(subscriber as ISubscriber & ICollectionSubscriber);
}
