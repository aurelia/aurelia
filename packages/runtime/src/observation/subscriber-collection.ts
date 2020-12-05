import {
  LifecycleFlags as LF,
  SubscriberFlags as SF,
} from '../observation.js';
import { ensureProto } from '../utilities-objects.js';

import type {
  ICollectionSubscriber,
  ICollectionSubscriberCollection,
  IndexMap,
  ISubscriber,
  ISubscriberCollection,
} from '../observation.js';

export function subscriberCollection(): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (target: Function): void { // ClassDecorator expects it to be derived from Function
    const proto = target.prototype as ISubscriberCollection;

    ensureProto(proto, '_sFlags', SF.None, true);
    ensureProto(proto, 'addSubscriber', addSubscriber, true);
    ensureProto(proto, 'removeSubscriber', removeSubscriber, true);
    ensureProto(proto, 'hasSubscriber', hasSubscriber, true);
    ensureProto(proto, 'hasSubscribers', hasSubscribers, true);
    ensureProto(proto, 'callSubscribers', callSubscribers, true);

    ensureProto(proto, 'subscribe', addSubscriber);
    ensureProto(proto, 'unsubscribe', removeSubscriber);
  };
}

export function collectionSubscriberCollection(): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (target: Function): void { // ClassDecorator expects it to be derived from Function
    const proto = target.prototype as ICollectionSubscriberCollection;

    ensureProto(proto, '_csFlags', SF.None, true);
    ensureProto(proto, 'addCollectionSubscriber', addCollectionSubscriber, true);
    ensureProto(proto, 'removeCollectionSubscriber', removeCollectionSubscriber, true);
    ensureProto(proto, 'hasCollectionSubscriber', hasCollectionSubscriber, true);
    ensureProto(proto, 'hasCollectionSubscribers', hasCollectionSubscribers, true);
    ensureProto(proto, 'callCollectionSubscribers', callCollectionSubscribers, true);

    ensureProto(proto, 'subscribeToCollection', addCollectionSubscriber);
    ensureProto(proto, 'unsubscribeFromCollection', removeCollectionSubscriber);
  };
}

function addSubscriber(this: ISubscriberCollection, subscriber: ISubscriber): boolean {
  if (this.hasSubscriber(subscriber)) {
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this._sRest!.push(subscriber); // Non-null is implied by else branch of (subscriberFlags & SF.SubscribersRest) === 0
  }
  return true;
}

function addCollectionSubscriber(this: ICollectionSubscriberCollection, subscriber: ICollectionSubscriber): boolean {
  if (this.hasCollectionSubscriber(subscriber)) {
    return false;
  }
  const subscriberFlags = this._csFlags;
  if ((subscriberFlags & SF.Subscriber0) === 0) {
    this._cs0 = subscriber;
    this._csFlags |= SF.Subscriber0;
  } else if ((subscriberFlags & SF.Subscriber1) === 0) {
    this._cs1 = subscriber;
    this._csFlags |= SF.Subscriber1;
  } else if ((subscriberFlags & SF.Subscriber2) === 0) {
    this._cs2 = subscriber;
    this._csFlags |= SF.Subscriber2;
  } else if ((subscriberFlags & SF.SubscribersRest) === 0) {
    this._csRest = [subscriber];
    this._csFlags |= SF.SubscribersRest;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this._csRest!.push(subscriber); // Non-null is implied by else branch of (subscriberFlags & SF.SubscribersRest) === 0
  }
  return true;
}

function removeSubscriber(this: ISubscriberCollection, subscriber: ISubscriber): boolean {
  const subscriberFlags = this._sFlags;
  if ((subscriberFlags & SF.Subscriber0) > 0 && this._s0 === subscriber) {
    this._s0 = void 0;
    this._sFlags = (this._sFlags | SF.Subscriber0) ^ SF.Subscriber0;
    return true;
  } else if ((subscriberFlags & SF.Subscriber1) > 0 && this._s1 === subscriber) {
    this._s1 = void 0;
    this._sFlags = (this._sFlags | SF.Subscriber1) ^ SF.Subscriber1;
    return true;
  } else if ((subscriberFlags & SF.Subscriber2) > 0 && this._s2 === subscriber) {
    this._s2 = void 0;
    this._sFlags = (this._sFlags | SF.Subscriber2) ^ SF.Subscriber2;
    return true;
  } else if ((subscriberFlags & SF.SubscribersRest) > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const subscribers = this._sRest!; // Non-null is implied by (subscriberFlags & SF.SubscribersRest) > 0
    for (let i = 0, ii = subscribers.length; i < ii; ++i) {
      if (subscribers[i] === subscriber) {
        subscribers.splice(i, 1);
        if (ii === 1) {
          this._sFlags = (this._sFlags | SF.SubscribersRest) ^ SF.SubscribersRest;
        }
        return true;
      }
    }
  }
  return false;
}

function removeCollectionSubscriber(this: ICollectionSubscriberCollection, subscriber: ICollectionSubscriber): boolean {
  const subscriberFlags = this._csFlags;
  if ((subscriberFlags & SF.Subscriber0) > 0 && this._cs0 === subscriber) {
    this._cs0 = void 0;
    this._csFlags = (this._csFlags | SF.Subscriber0) ^ SF.Subscriber0;
    return true;
  } else if ((subscriberFlags & SF.Subscriber1) > 0 && this._cs1 === subscriber) {
    this._cs1 = void 0;
    this._csFlags = (this._csFlags | SF.Subscriber1) ^ SF.Subscriber1;
    return true;
  } else if ((subscriberFlags & SF.Subscriber2) > 0 && this._cs2 === subscriber) {
    this._cs2 = void 0;
    this._csFlags = (this._csFlags | SF.Subscriber2) ^ SF.Subscriber2;
    return true;
  } else if ((subscriberFlags & SF.SubscribersRest) > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const subscribers = this._csRest!; // Non-null is implied by (subscriberFlags & SF.SubscribersRest) > 0
    for (let i = 0, ii = subscribers.length; i < ii; ++i) {
      if (subscribers[i] === subscriber) {
        subscribers.splice(i, 1);
        if (ii === 1) {
          this._csFlags = (this._csFlags | SF.SubscribersRest) ^ SF.SubscribersRest;
        }
        return true;
      }
    }
  }
  return false;
}

function hasSubscribers(this: ISubscriberCollection): boolean {
  return this._sFlags !== SF.None;
}

function hasCollectionSubscribers(this: ICollectionSubscriberCollection): boolean {
  return this._csFlags !== SF.None;
}

function hasSubscriber(this: ISubscriberCollection, subscriber: ISubscriber): boolean {
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const subscribers = this._sRest!; // Non-null is implied by (subscriberFlags & SF.SubscribersRest) > 0
    for (let i = 0, ii = subscribers.length; i < ii; ++i) {
      if (subscribers[i] === subscriber) {
        return true;
      }
    }
  }
  return false;
}

function hasCollectionSubscriber(this: ICollectionSubscriberCollection, subscriber: ICollectionSubscriber): boolean {
  const subscriberFlags = this._csFlags;
  if ((subscriberFlags & SF.Subscriber0) > 0 && this._cs0 === subscriber) {
    return true;
  }
  if ((subscriberFlags & SF.Subscriber1) > 0 && this._cs1 === subscriber) {
    return true;
  }
  if ((subscriberFlags & SF.Subscriber2) > 0 && this._cs2 === subscriber) {
    return true;
  }
  if ((subscriberFlags & SF.SubscribersRest) > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const subscribers = this._csRest!; // Non-null is implied by (subscriberFlags & SF.SubscribersRest) > 0
    for (let i = 0, ii = subscribers.length; i < ii; ++i) {
      if (subscribers[i] === subscriber) {
        return true;
      }
    }
  }
  return false;
}

function callSubscribers(this: ISubscriberCollection, newValue: unknown, previousValue: unknown, flags: LF): void {
  /**
   * Note: change handlers may have the side-effect of adding/removing subscribers to this collection during this
   * callSubscribers invocation, so we're caching them all before invoking any.
   * Subscribers added during this invocation are not invoked (and they shouldn't be).
   * Subscribers removed during this invocation will still be invoked (and they also shouldn't be,
   * however this is accounted for via $isBound and similar flags on the subscriber objects)
   */
  const subscriber0 = this._s0;
  const subscriber1 = this._s1;
  const subscriber2 = this._s2;
  let subscribers = this._sRest;
  if (subscribers !== void 0) {
    subscribers = subscribers.slice();
  }
  if (subscriber0 !== void 0) {
    callSubscriber(subscriber0, newValue, previousValue, flags, subscriber0.id === void 0 ? 0 : this[subscriber0.id]);
  }
  if (subscriber1 !== void 0) {
    callSubscriber(subscriber1, newValue, previousValue, flags, subscriber1.id === void 0 ? 0 : this[subscriber1.id]);
  }
  if (subscriber2 !== void 0) {
    callSubscriber(subscriber2, newValue, previousValue, flags, subscriber2.id === void 0 ? 0 : this[subscriber2.id]);
  }
  if (subscribers !== void 0) {
    const length = subscribers.length;
    let subscriber: ISubscriber | undefined;
    for (let i = 0; i < length; ++i) {
      subscriber = subscribers[i];
      if (subscriber !== void 0) {
        callSubscriber(subscriber, newValue, previousValue, flags, subscriber.id === void 0 ? 0 : this[subscriber.id]);
      }
    }
  }
}

function callSubscriber(
  subscriber: ISubscriber,
  newValue: unknown,
  previousValue: unknown,
  flags: LF,
  ownFlags: LF,
): void {
  subscriber.handleChange(newValue, previousValue, ((flags | LF.update) ^ LF.update) | ownFlags);
}

function callCollectionSubscribers(this: ICollectionSubscriberCollection, indexMap: IndexMap, flags: LF): void {
  const subscriber0 = this._cs0;
  const subscriber1 = this._cs1;
  const subscriber2 = this._cs2;
  let subscribers = this._csRest;
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
    for (let i = 0; i < length; ++i) {
      subscriber = subscribers[i];
      if (subscriber !== void 0) {
        subscriber.handleCollectionChange(indexMap, flags);
      }
    }
  }
}
