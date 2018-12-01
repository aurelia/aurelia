import { IIndexable, Primitive } from '../../kernel';
import {
  IBatchedCollectionSubscriber, IBatchedSubscriberCollection, IndexMap, IPropertySubscriber,
  ISubscriberCollection, LifecycleFlags, MutationKind, MutationKindToBatchedSubscriber,
  MutationKindToSubscriber, SubscriberFlags
} from '../observation';

export function subscriberCollection<T extends MutationKind>(mutationKind: T): ClassDecorator {
  return function(target: Function): void {
    const proto = <ISubscriberCollection<MutationKind.instance | MutationKind.collection>>target.prototype;

    proto._subscriberFlags = SubscriberFlags.None;
    proto._subscriber0 = null;
    proto._subscriber1 = null;
    proto._subscriber2 = null;
    proto._subscribersRest = null;

    proto.addSubscriber = addSubscriber;
    proto.removeSubscriber = removeSubscriber;
    proto.hasSubscriber = hasSubscriber;
    proto.hasSubscribers = hasSubscribers;
    proto.callSubscribers = (mutationKind === MutationKind.instance ? callPropertySubscribers : callCollectionSubscribers);
  };
}

function addSubscriber<T extends MutationKind>(this: ISubscriberCollection<T>, subscriber: MutationKindToSubscriber<T>): boolean {
  if (this.hasSubscriber(subscriber)) {
    return false;
  }
  const subscriberFlags = this._subscriberFlags;
  if (!(subscriberFlags & SubscriberFlags.Subscriber0)) {
    this._subscriber0 = subscriber;
    this._subscriberFlags |= SubscriberFlags.Subscriber0;
    return true;
  }
  if (!(subscriberFlags & SubscriberFlags.Subscriber1)) {
    this._subscriber1 = subscriber;
    this._subscriberFlags |= SubscriberFlags.Subscriber1;
    return true;
  }
  if (!(subscriberFlags & SubscriberFlags.Subscriber2)) {
    this._subscriber2 = subscriber;
    this._subscriberFlags |= SubscriberFlags.Subscriber2;
    return true;
  }
  if (!(subscriberFlags & SubscriberFlags.SubscribersRest)) {
    this._subscribersRest = [subscriber];
    this._subscriberFlags |= SubscriberFlags.SubscribersRest;
    return true;
  }
  this._subscribersRest.push(subscriber);
  return true;
}

function removeSubscriber<T extends MutationKind>(this: ISubscriberCollection<T>, subscriber: IPropertySubscriber): boolean {
  const subscriberFlags = this._subscriberFlags;
  if ((subscriberFlags & SubscriberFlags.Subscriber0) && this._subscriber0 === subscriber) {
    this._subscriber0 = null;
    this._subscriberFlags &= ~SubscriberFlags.Subscriber0;
    return true;
  }
  if ((subscriberFlags & SubscriberFlags.Subscriber1) && this._subscriber1 === subscriber) {
    this._subscriber1 = null;
    this._subscriberFlags &= ~SubscriberFlags.Subscriber1;
    return true;
  }
  if ((subscriberFlags & SubscriberFlags.Subscriber2) && this._subscriber2 === subscriber) {
    this._subscriber2 = null;
    this._subscriberFlags &= ~SubscriberFlags.Subscriber2;
    return true;
  }
  if (subscriberFlags & SubscriberFlags.SubscribersRest) {
    const subscribers = this._subscribersRest;
    for (let i = 0, ii = subscribers.length; i < ii; ++i) {
      if (subscribers[i] === subscriber) {
        subscribers.splice(i, 1);
        if (ii === 1) {
          this._subscriberFlags &= ~SubscriberFlags.SubscribersRest;
        }
        return true;
      }
    }
  }
  return false;
}

function callPropertySubscribers(
  this: ISubscriberCollection<MutationKind.instance>,
  newValue: IIndexable | Primitive,
  previousValue: IIndexable | Primitive,
  flags: LifecycleFlags): void {
  /**
   * Note: change handlers may have the side-effect of adding/removing subscribers to this collection during this
   * callSubscribers invocation, so we're caching them all before invoking any.
   * Subscribers added during this invocation are not invoked (and they shouldn't be).
   * Subscribers removed during this invocation will still be invoked (and they also shouldn't be,
   * however this is accounted for via $isBound and similar flags on the subscriber objects)
   */
  const subscriber0 = this._subscriber0;
  const subscriber1 = this._subscriber1;
  const subscriber2 = this._subscriber2;
  let subscribers = this._subscribersRest;
  if (subscribers !== null) {
    subscribers = subscribers.slice();
  }
  if (subscriber0 !== null) {
    subscriber0.handleChange(newValue, previousValue, flags);
  }
  if (subscriber1 !== null) {
    subscriber1.handleChange(newValue, previousValue, flags);
  }
  if (subscriber2 !== null) {
    subscriber2.handleChange(newValue, previousValue, flags);
  }
  const length = subscribers && subscribers.length;
  if (length !== undefined && length > 0) {
    for (let i = 0; i < length; ++i) {
      const subscriber = subscribers[i];
      if (subscriber !== null) {
        subscriber.handleChange(newValue, previousValue, flags);
      }
    }
  }
}

function callCollectionSubscribers(this: ISubscriberCollection<MutationKind.collection> & Required<IBatchedSubscriberCollection<MutationKind.collection>>, origin: string, args: IArguments | null, flags: LifecycleFlags): void {
  const subscriber0 = this._subscriber0;
  const subscriber1 = this._subscriber1;
  const subscriber2 = this._subscriber2;
  let subscribers = this._subscribersRest;
  if (subscribers !== null) {
    subscribers = subscribers.slice();
  }
  if (subscriber0 !== null) {
    subscriber0.handleChange(origin, args, flags);
  }
  if (subscriber1 !== null) {
    subscriber1.handleChange(origin, args, flags);
  }
  if (subscriber2 !== null) {
    subscriber2.handleChange(origin, args, flags);
  }
  const length = subscribers && subscribers.length;
  if (length !== undefined && length > 0) {
    for (let i = 0; i < length; ++i) {
      const subscriber = subscribers[i];
      if (subscriber !== null) {
        subscriber.handleChange(origin, args, flags);
      }
    }
  }
  this.lifecycle.enqueueFlush(this);
}

function hasSubscribers<T extends MutationKind>(this: ISubscriberCollection<T>): boolean {
  return this._subscriberFlags !== SubscriberFlags.None;
}

function hasSubscriber<T extends MutationKind>(this: ISubscriberCollection<T>, subscriber: IPropertySubscriber): boolean {
  // Flags here is just a perf tweak
  // Compared to not using flags, it's a moderate speed-up when this collection does not have the subscriber;
  // and minor slow-down when it does, and the former is more common than the latter.
  const subscriberFlags = this._subscriberFlags;
  if ((subscriberFlags & SubscriberFlags.Subscriber0) && this._subscriber0 === subscriber) {
    return true;
  }
  if ((subscriberFlags & SubscriberFlags.Subscriber1) && this._subscriber1 === subscriber) {
    return true;
  }
  if ((subscriberFlags & SubscriberFlags.Subscriber2) && this._subscriber2 === subscriber) {
    return true;
  }
  if (subscriberFlags & SubscriberFlags.SubscribersRest) {
    // no need to check length; if the flag is set, there's always at least one
    const subscribers = this._subscribersRest;
    for (let i = 0, ii = subscribers.length; i < ii; ++i) {
      if (subscribers[i] === subscriber) {
        return true;
      }
    }
  }
  return false;
}

export function batchedSubscriberCollection(): ClassDecorator {
  return function(target: Function): void {
    const proto = <IBatchedSubscriberCollection<MutationKind.collection>>target.prototype;

    proto._batchedSubscriberFlags = SubscriberFlags.None;
    proto._batchedSubscriber0 = null;
    proto._batchedSubscriber1 = null;
    proto._batchedSubscriber2 = null;
    proto._batchedSubscribersRest = null;

    proto.addBatchedSubscriber = addBatchedSubscriber;
    proto.removeBatchedSubscriber = removeBatchedSubscriber;
    proto.hasBatchedSubscriber = hasBatchedSubscriber;
    proto.hasBatchedSubscribers = hasBatchedSubscribers;
    proto.callBatchedSubscribers = callBatchedCollectionSubscribers;
  };
}

function addBatchedSubscriber(this: IBatchedSubscriberCollection<MutationKind.collection>, subscriber: MutationKindToBatchedSubscriber<MutationKind.collection>): boolean {
  if (this.hasBatchedSubscriber(subscriber)) {
    return false;
  }
  const subscriberFlags = this._batchedSubscriberFlags;
  if (!(subscriberFlags & SubscriberFlags.Subscriber0)) {
    this._batchedSubscriber0 = subscriber;
    this._batchedSubscriberFlags |= SubscriberFlags.Subscriber0;
    return true;
  }
  if (!(subscriberFlags & SubscriberFlags.Subscriber1)) {
    this._batchedSubscriber1 = subscriber;
    this._batchedSubscriberFlags |= SubscriberFlags.Subscriber1;
    return true;
  }
  if (!(subscriberFlags & SubscriberFlags.Subscriber2)) {
    this._batchedSubscriber2 = subscriber;
    this._batchedSubscriberFlags |= SubscriberFlags.Subscriber2;
    return true;
  }
  if (!(subscriberFlags & SubscriberFlags.SubscribersRest)) {
    this._batchedSubscribersRest = [subscriber];
    this._batchedSubscriberFlags |= SubscriberFlags.SubscribersRest;
    return true;
  }
  this._batchedSubscribersRest.push(subscriber);
  return true;
}

function removeBatchedSubscriber(this: IBatchedSubscriberCollection<MutationKind.collection>, subscriber: IBatchedCollectionSubscriber): boolean {
  const subscriberFlags = this._batchedSubscriberFlags;
  if ((subscriberFlags & SubscriberFlags.Subscriber0) && this._batchedSubscriber0 === subscriber) {
    this._batchedSubscriber0 = null;
    this._batchedSubscriberFlags &= ~SubscriberFlags.Subscriber0;
    return true;
  }
  if ((subscriberFlags & SubscriberFlags.Subscriber1) && this._batchedSubscriber1 === subscriber) {
    this._batchedSubscriber1 = null;
    this._batchedSubscriberFlags &= ~SubscriberFlags.Subscriber1;
    return true;
  }
  if ((subscriberFlags & SubscriberFlags.Subscriber2) && this._batchedSubscriber2 === subscriber) {
    this._batchedSubscriber2 = null;
    this._batchedSubscriberFlags &= ~SubscriberFlags.Subscriber2;
    return true;
  }
  if (subscriberFlags & SubscriberFlags.SubscribersRest) {
    const subscribers = this._batchedSubscribersRest;
    for (let i = 0, ii = subscribers.length; i < ii; ++i) {
      if (subscribers[i] === subscriber) {
        subscribers.splice(i, 1);
        if (ii === 1) {
          this._batchedSubscriberFlags &= ~SubscriberFlags.SubscribersRest;
        }
        return true;
      }
    }
  }
  return false;
}

function callBatchedCollectionSubscribers(this: IBatchedSubscriberCollection<MutationKind.collection>, indexMap: IndexMap): void {
  const subscriber0 = this._batchedSubscriber0;
  const subscriber1 = this._batchedSubscriber1;
  const subscriber2 = this._batchedSubscriber2;
  let subscribers = this._batchedSubscribersRest;
  if (subscribers !== null) {
    subscribers = subscribers.slice();
  }
  if (subscriber0 !== null) {
    subscriber0.handleBatchedChange(indexMap);
  }
  if (subscriber1 !== null) {
    subscriber1.handleBatchedChange(indexMap);
  }
  if (subscriber2 !== null) {
    subscriber2.handleBatchedChange(indexMap);
  }
  const length = subscribers && subscribers.length;
  if (length !== undefined && length > 0) {
    for (let i = 0; i < length; ++i) {
      const subscriber = subscribers[i];
      if (subscriber !== null) {
        subscriber.handleBatchedChange(indexMap);
      }
    }
  }
}

function hasBatchedSubscribers(this: IBatchedSubscriberCollection<MutationKind.collection>): boolean {
  return this._batchedSubscriberFlags !== SubscriberFlags.None;
}

function hasBatchedSubscriber(this: IBatchedSubscriberCollection<MutationKind.collection>, subscriber: IBatchedCollectionSubscriber): boolean {
  // Flags here is just a perf tweak
  // Compared to not using flags, it's a moderate speed-up when this collection does not have the subscriber;
  // and minor slow-down when it does, and the former is more common than the latter.
  const subscriberFlags = this._batchedSubscriberFlags;
  if ((subscriberFlags & SubscriberFlags.Subscriber0) && this._batchedSubscriber0 === subscriber) {
    return true;
  }
  if ((subscriberFlags & SubscriberFlags.Subscriber1) && this._batchedSubscriber1 === subscriber) {
    return true;
  }
  if ((subscriberFlags & SubscriberFlags.Subscriber2) && this._batchedSubscriber2 === subscriber) {
    return true;
  }
  if (subscriberFlags & SubscriberFlags.SubscribersRest) {
    // no need to check length; if the flag is set, there's always at least one
    const subscribers = this._batchedSubscribersRest;
    for (let i = 0, ii = subscribers.length; i < ii; ++i) {
      if (subscribers[i] === subscriber) {
        return true;
      }
    }
  }
  return false;
}
