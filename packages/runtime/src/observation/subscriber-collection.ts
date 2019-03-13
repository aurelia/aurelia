import { LifecycleFlags as LF } from '../flags';
import {
  IBatchedCollectionSubscriber,
  IBatchedSubscriberCollection,
  IndexMap,
  IPropertySubscriber,
  ISubscriberCollection,
  MutationKind,
  MutationKindToBatchedSubscriber,
  MutationKindToSubscriber,
  SubscriberFlags as SF
} from '../observation';

export function subscriberCollection<T extends MutationKind>(mutationKind: T): ClassDecorator {
  // tslint:disable-next-line:ban-types // ClassDecorator expects it to be derived from Function
  return function(target: Function): void {
    const proto = target.prototype as ISubscriberCollection<MutationKind.instance | MutationKind.collection | MutationKind.proxy>;

    proto._subscriberFlags = SF.None;
    proto._subscriber0 = void 0;
    proto._subscriber1 = void 0;
    proto._subscriber2 = void 0;
    proto._subscribersRest = void 0;

    proto.addSubscriber = addSubscriber;
    proto.removeSubscriber = removeSubscriber;
    proto.hasSubscriber = hasSubscriber;
    proto.hasSubscribers = hasSubscribers;
    switch (mutationKind) {
      case MutationKind.instance:
        proto.callSubscribers = callPropertySubscribers;
        break;
      case MutationKind.collection:
        proto.callSubscribers = callCollectionSubscribers as typeof proto['callSubscribers'];
        break;
      case MutationKind.proxy:
        proto.callSubscribers = callProxySubscribers;
    }
  };
}

function addSubscriber<T extends MutationKind>(this: ISubscriberCollection<T>, subscriber: MutationKindToSubscriber<T>): boolean {
  if (this.hasSubscriber(subscriber)) {
    return false;
  }
  const subscriberFlags = this._subscriberFlags!;
  if (!(subscriberFlags & SF.Subscriber0)) {
    this._subscriber0 = subscriber;
    this._subscriberFlags! |= SF.Subscriber0;
    return true;
  }
  if (!(subscriberFlags & SF.Subscriber1)) {
    this._subscriber1 = subscriber;
    this._subscriberFlags! |= SF.Subscriber1;
    return true;
  }
  if (!(subscriberFlags & SF.Subscriber2)) {
    this._subscriber2 = subscriber;
    this._subscriberFlags! |= SF.Subscriber2;
    return true;
  }
  if (!(subscriberFlags & SF.SubscribersRest)) {
    this._subscribersRest = [subscriber];
    this._subscriberFlags! |= SF.SubscribersRest;
    return true;
  }
  this._subscribersRest!.push(subscriber);
  return true;
}

function removeSubscriber<T extends MutationKind>(this: ISubscriberCollection<T>, subscriber: IPropertySubscriber): boolean {
  const subscriberFlags = this._subscriberFlags!;
  if ((subscriberFlags & SF.Subscriber0) && this._subscriber0 === subscriber) {
    this._subscriber0 = void 0;
    this._subscriberFlags! &= ~SF.Subscriber0;
    return true;
  }
  if ((subscriberFlags & SF.Subscriber1) && this._subscriber1 === subscriber) {
    this._subscriber1 = void 0;
    this._subscriberFlags! &= ~SF.Subscriber1;
    return true;
  }
  if ((subscriberFlags & SF.Subscriber2) && this._subscriber2 === subscriber) {
    this._subscriber2 = void 0;
    this._subscriberFlags! &= ~SF.Subscriber2;
    return true;
  }
  if (subscriberFlags & SF.SubscribersRest) {
    const subscribers = this._subscribersRest!;
    for (let i = 0, ii = subscribers.length; i < ii; ++i) {
      if (subscribers[i] === subscriber) {
        subscribers.splice(i, 1);
        if (ii === 1) {
          this._subscriberFlags! &= ~SF.SubscribersRest;
        }
        return true;
      }
    }
  }
  return false;
}

function callPropertySubscribers(this: ISubscriberCollection<MutationKind.instance>, newValue: unknown, previousValue: unknown, flags: LF): void {
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
  if (subscribers !== void 0) {
    subscribers = subscribers.slice();
  }
  if (subscriber0 !== void 0) {
    callSubscriber(subscriber0, newValue, previousValue, flags, (this as unknown as { [key: string]: LF })[subscriber0.id!]);
  }
  if (subscriber1 !== void 0) {
    callSubscriber(subscriber1, newValue, previousValue, flags, (this as unknown as { [key: string]: LF })[subscriber1.id!]);
  }
  if (subscriber2 !== void 0) {
    callSubscriber(subscriber2, newValue, previousValue, flags, (this as unknown as { [key: string]: LF })[subscriber2.id!]);
  }
  const length = subscribers && subscribers.length;
  if (length !== undefined && length > 0) {
    let subscriber = (void 0)! as IPropertySubscriber;
    for (let i = 0; i < length; ++i) {
      subscriber = subscribers![i];
      if (subscriber !== void 0) {
        callSubscriber(subscriber, newValue, previousValue, flags, (this as unknown as { [key: string]: LF })[subscriber.id!]);
      }
    }
  }
}

function callSubscriber(
  subscriber: IPropertySubscriber,
  newValue: unknown,
  previousValue: unknown,
  flags: LF,
  ownFlags: LF,
): void {
  if (ownFlags === undefined) {
    // If ownFlags is undefined then the subscriber is not a connectable binding and we don't
    // have any business trying to restrict the data flow, so just call it with whatever we received.
    subscriber.handleChange(newValue, previousValue, flags);

  // Note: if the update flags for both directions are set, that means an observer's callSubscribers caused the update direction to switch
  // back to the origin of the change.
  // With this heuristic we stop this roundtrip a little earlier than vCurrent does (where the target or source is evaluated
  // and compared again) and effectively make this a "purer" one-way update flow that prevents observable side-effects from
  // flowing back the opposite direction.
  } else if (((flags | ownFlags) & LF.update) === LF.update) {

    // Observers should explicitly pass this flag if they want a roundtrip to happen anyway.
    // SelfObserver does this in order to propagate from-view changes from a child component back to the bindings
    // on its own component.
    // Some target observers (e.g. select) do this as well, but the other way around.
    if ((flags & LF.allowPublishRoundtrip) > 0) {
      // Unset the directional flag that came in from the origin and allowPublishRoundtrip since we don't
      // want these to flow into the next subscriberCollection
      subscriber.handleChange(newValue, previousValue, (flags & ~(LF.update | LF.allowPublishRoundtrip)) | ownFlags);
    }
  } else {
    // If this is not a roundtrip, simply proceed in the same direction.
    subscriber.handleChange(newValue, previousValue, flags | ownFlags);
  }
}

function callCollectionSubscribers(this: ISubscriberCollection<MutationKind.collection> & Required<IBatchedSubscriberCollection<MutationKind.collection>>, origin: string, args: IArguments | null, flags: LF): void {
  const subscriber0 = this._subscriber0;
  const subscriber1 = this._subscriber1;
  const subscriber2 = this._subscriber2;
  let subscribers = this._subscribersRest;
  if (subscribers !== void 0) {
    subscribers = subscribers.slice();
  }
  if (subscriber0 !== void 0) {
    subscriber0.handleChange(origin, args, flags);
  }
  if (subscriber1 !== void 0) {
    subscriber1.handleChange(origin, args, flags);
  }
  if (subscriber2 !== void 0) {
    subscriber2.handleChange(origin, args, flags);
  }
  const length = subscribers && subscribers.length;
  if (length !== undefined && length > 0) {
    for (let i = 0; i < length; ++i) {
      const subscriber = subscribers![i];
      if (subscriber !== void 0) {
        subscriber.handleChange(origin, args, flags);
      }
    }
  }
  this.lifecycle.enqueueFlush(this).catch(error => { throw error; });
}

function callProxySubscribers(this: ISubscriberCollection<MutationKind.proxy>, key: PropertyKey, newValue: unknown, previousValue: unknown, flags: LF): void {
  const subscriber0 = this._subscriber0;
  const subscriber1 = this._subscriber1;
  const subscriber2 = this._subscriber2;
  let subscribers = this._subscribersRest;
  if (subscribers !== void 0) {
    subscribers = subscribers.slice();
  }
  if (subscriber0 !== void 0) {
    subscriber0.handleChange(key, newValue, previousValue, flags);
  }
  if (subscriber1 !== void 0) {
    subscriber1.handleChange(key, newValue, previousValue, flags);
  }
  if (subscriber2 !== void 0) {
    subscriber2.handleChange(key, newValue, previousValue, flags);
  }
  const length = subscribers && subscribers.length;
  if (length !== undefined && length > 0) {
    for (let i = 0; i < length; ++i) {
      const subscriber = subscribers![i];
      if (subscriber !== void 0) {
        subscriber.handleChange(key, newValue, previousValue, flags);
      }
    }
  }
}
function hasSubscribers<T extends MutationKind>(this: ISubscriberCollection<T>): boolean {
  return this._subscriberFlags !== SF.None;
}

function hasSubscriber<T extends MutationKind>(this: ISubscriberCollection<T>, subscriber: IPropertySubscriber): boolean {
  // Flags here is just a perf tweak
  // Compared to not using flags, it's a moderate speed-up when this collection does not have the subscriber;
  // and minor slow-down when it does, and the former is more common than the latter.
  const subscriberFlags = this._subscriberFlags!;
  if ((subscriberFlags & SF.Subscriber0) && this._subscriber0 === subscriber) {
    return true;
  }
  if ((subscriberFlags & SF.Subscriber1) && this._subscriber1 === subscriber) {
    return true;
  }
  if ((subscriberFlags & SF.Subscriber2) && this._subscriber2 === subscriber) {
    return true;
  }
  if (subscriberFlags & SF.SubscribersRest) {
    // no need to check length; if the flag is set, there's always at least one
    const subscribers = this._subscribersRest!;
    for (let i = 0, ii = subscribers.length; i < ii; ++i) {
      if (subscribers[i] === subscriber) {
        return true;
      }
    }
  }
  return false;
}

export function batchedSubscriberCollection(): ClassDecorator {
  // tslint:disable-next-line:ban-types // ClassDecorator expects it to be derived from Function
  return function(target: Function): void {
    const proto = target.prototype as IBatchedSubscriberCollection<MutationKind.collection>;

    proto._batchedSubscriberFlags = SF.None;
    proto._batchedSubscriber0 = void 0;
    proto._batchedSubscriber1 = void 0;
    proto._batchedSubscriber2 = void 0;
    proto._batchedSubscribersRest = void 0;

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
  const subscriberFlags = this._batchedSubscriberFlags!;
  if (!(subscriberFlags & SF.Subscriber0)) {
    this._batchedSubscriber0 = subscriber;
    this._batchedSubscriberFlags! |= SF.Subscriber0;
    return true;
  }
  if (!(subscriberFlags & SF.Subscriber1)) {
    this._batchedSubscriber1 = subscriber;
    this._batchedSubscriberFlags! |= SF.Subscriber1;
    return true;
  }
  if (!(subscriberFlags & SF.Subscriber2)) {
    this._batchedSubscriber2 = subscriber;
    this._batchedSubscriberFlags! |= SF.Subscriber2;
    return true;
  }
  if (!(subscriberFlags & SF.SubscribersRest)) {
    this._batchedSubscribersRest = [subscriber];
    this._batchedSubscriberFlags! |= SF.SubscribersRest;
    return true;
  }
  this._batchedSubscribersRest!.push(subscriber);
  return true;
}

function removeBatchedSubscriber(this: IBatchedSubscriberCollection<MutationKind.collection>, subscriber: IBatchedCollectionSubscriber): boolean {
  const subscriberFlags = this._batchedSubscriberFlags!;
  if ((subscriberFlags & SF.Subscriber0) && this._batchedSubscriber0 === subscriber) {
    this._batchedSubscriber0 = void 0;
    this._batchedSubscriberFlags! &= ~SF.Subscriber0;
    return true;
  }
  if ((subscriberFlags & SF.Subscriber1) && this._batchedSubscriber1 === subscriber) {
    this._batchedSubscriber1 = void 0;
    this._batchedSubscriberFlags! &= ~SF.Subscriber1;
    return true;
  }
  if ((subscriberFlags & SF.Subscriber2) && this._batchedSubscriber2 === subscriber) {
    this._batchedSubscriber2 = void 0;
    this._batchedSubscriberFlags! &= ~SF.Subscriber2;
    return true;
  }
  if (subscriberFlags & SF.SubscribersRest) {
    const subscribers = this._batchedSubscribersRest!;
    for (let i = 0, ii = subscribers.length; i < ii; ++i) {
      if (subscribers[i] === subscriber) {
        subscribers.splice(i, 1);
        if (ii === 1) {
          this._batchedSubscriberFlags! &= ~SF.SubscribersRest;
        }
        return true;
      }
    }
  }
  return false;
}

function callBatchedCollectionSubscribers(this: IBatchedSubscriberCollection<MutationKind.collection>, indexMap: IndexMap, flags: LF): void {
  const subscriber0 = this._batchedSubscriber0;
  const subscriber1 = this._batchedSubscriber1;
  const subscriber2 = this._batchedSubscriber2;
  let subscribers = this._batchedSubscribersRest;
  if (subscribers !== void 0) {
    subscribers = subscribers.slice();
  }
  if (subscriber0 !== void 0) {
    subscriber0.handleBatchedChange(indexMap, flags);
  }
  if (subscriber1 !== void 0) {
    subscriber1.handleBatchedChange(indexMap, flags);
  }
  if (subscriber2 !== void 0) {
    subscriber2.handleBatchedChange(indexMap, flags);
  }
  const length = subscribers && subscribers.length;
  if (length !== undefined && length > 0) {
    for (let i = 0; i < length; ++i) {
      const subscriber = subscribers![i];
      if (subscriber !== void 0) {
        subscriber.handleBatchedChange(indexMap, flags);
      }
    }
  }
}

function hasBatchedSubscribers(this: IBatchedSubscriberCollection<MutationKind.collection>): boolean {
  return this._batchedSubscriberFlags !== SF.None;
}

function hasBatchedSubscriber(this: IBatchedSubscriberCollection<MutationKind.collection>, subscriber: IBatchedCollectionSubscriber): boolean {
  // Flags here is just a perf tweak
  // Compared to not using flags, it's a moderate speed-up when this collection does not have the subscriber;
  // and minor slow-down when it does, and the former is more common than the latter.
  const subscriberFlags = this._batchedSubscriberFlags!;
  if ((subscriberFlags & SF.Subscriber0) && this._batchedSubscriber0 === subscriber) {
    return true;
  }
  if ((subscriberFlags & SF.Subscriber1) && this._batchedSubscriber1 === subscriber) {
    return true;
  }
  if ((subscriberFlags & SF.Subscriber2) && this._batchedSubscriber2 === subscriber) {
    return true;
  }
  if (subscriberFlags & SF.SubscribersRest) {
    // no need to check length; if the flag is set, there's always at least one
    const subscribers = this._batchedSubscribersRest!;
    for (let i = 0, ii = subscribers.length; i < ii; ++i) {
      if (subscribers[i] === subscriber) {
        return true;
      }
    }
  }
  return false;
}
