import { BindingFlags } from './binding-flags';
import { IPropertySubscriber } from './observation';
import { nativePush, nativeSplice } from './array-observer';

const enum SubscriberFlags {
  None            = 0,
  Subscriber0     = 0b0001,
  Subscriber1     = 0b0010,
  Subscriber2     = 0b0100,
  SubscribersRest = 0b1000,
  Any             = 0b1111,
}

export abstract class SubscriberCollection {
  private _subscriberFlags: SubscriberFlags = SubscriberFlags.None;
  private _subscriber0: IPropertySubscriber = null;
  private _subscriber1: IPropertySubscriber = null;
  private _subscriber2: IPropertySubscriber = null;
  private _subscribersRest: IPropertySubscriber[] = null;

  protected addSubscriber(subscriber: IPropertySubscriber): boolean {
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
    nativePush.call(this._subscribersRest, subscriber);
    return true;
  }

  protected removeSubscriber(subscriber: IPropertySubscriber): boolean {
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
          nativeSplice.call(subscribers, i, 1);
          if (ii === 1) {
            this._subscriberFlags &= ~SubscriberFlags.SubscribersRest;
          }
          return true;
        }
      }
    }
    return false;
  }

  protected callSubscribers(newValue: any, previousValue: any, flags: BindingFlags): void {
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
    const length = subscribers && subscribers.length || 0;
    if (length > 0) {
      for (let i = 0; i < length; ++i) {
        const subscriber = subscribers[i];
        if (subscriber !== null) {
          subscriber.handleChange(newValue, previousValue, flags);
        }
      }
    }
  }

  protected hasSubscribers(): boolean {
    return this._subscriberFlags !== SubscriberFlags.None;
  }

  protected hasSubscriber(subscriber: IPropertySubscriber): boolean {
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
}
