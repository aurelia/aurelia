import { ICallable } from '@aurelia/kernel';
import { BindingFlags } from './binding-flags';
import { IPropertySubscriber } from './observation';

const arrayPool1: BindingFlags[][] = [];
const arrayPool2: IPropertySubscriber[][] = [];
const poolUtilization: boolean[] = [];

export abstract class SubscriberCollection {
  private _flags0: BindingFlags = null;
  private _subscriber0: IPropertySubscriber = null;
  private _flags1: BindingFlags = null;
  private _subscriber1: IPropertySubscriber = null;
  private _flags2: BindingFlags = null;
  private _subscriber2: IPropertySubscriber = null;
  private _flagsRest: BindingFlags[] = null;
  private _subscribersRest: IPropertySubscriber[] = null;

  protected addSubscriber(subscriber: IPropertySubscriber, flags?: BindingFlags): boolean {
    if (this.hasSubscriber(subscriber, flags)) {
      return false;
    }
    if (!this._subscriber0) {
      this._flags0 = flags;
      this._subscriber0 = subscriber;
      return true;
    }
    if (!this._subscriber1) {
      this._flags1 = flags;
      this._subscriber1 = subscriber;
      return true;
    }
    if (!this._subscriber2) {
      this._flags2 = flags;
      this._subscriber2 = subscriber;
      return true;
    }
    if (!this._subscribersRest) {
      this._flagsRest = [flags];
      this._subscribersRest = [subscriber];
      return true;
    }
    this._flagsRest.push(flags);
    this._subscribersRest.push(subscriber);
    return true;
  }

  protected removeSubscriber(subscriber: IPropertySubscriber, flags?: BindingFlags): boolean {
    if (this._flags0 === flags && this._subscriber0 === subscriber) {
      this._flags0 = null;
      this._subscriber0 = null;
      return true;
    }
    if (this._flags1 === flags && this._subscriber1 === subscriber) {
      this._flags1 = null;
      this._subscriber1 = null;
      return true;
    }
    if (this._flags2 === flags && this._subscriber2 === subscriber) {
      this._flags2 = null;
      this._subscriber2 = null;
      return true;
    }
    const subscribers = this._subscribersRest;
    if (subscribers === null || subscribers.length === 0) {
      return false;
    }
    const flagsRest = this._flagsRest;
    let i = 0;
    while (!(subscribers[i] === subscriber && flagsRest[i] === flags) && subscribers.length > i) {
      i++;
    }
    if (i >= subscribers.length) {
      return false;
    }
    flagsRest.splice(i, 1);
    subscribers.splice(i, 1);
    return true;
  }

  protected callSubscribers(newValue: any, previousValue?: any, flags?: BindingFlags): void {
    const flags0 = this._flags0;
    const subscriber0 = this._subscriber0;
    const flags1 = this._flags1;
    const subscriber1 = this._subscriber1;
    const flags2 = this._flags2;
    const subscriber2 = this._subscriber2;
    const length = this._flagsRest ? this._flagsRest.length : 0;
    let flagsRest: BindingFlags[];
    let subscribersRest: IPropertySubscriber[];
    let poolIndex;
    let i;
    if (length) {
      // grab temp arrays from the pool.
      poolIndex = poolUtilization.length;
      while (poolIndex-- && poolUtilization[poolIndex]) {
        // Do nothing
      }
      if (poolIndex < 0) {
        poolIndex = poolUtilization.length;
        flagsRest = [];
        subscribersRest = [];
        poolUtilization.push(true);
        arrayPool1.push(flagsRest);
        arrayPool2.push(subscribersRest);
      } else {
        poolUtilization[poolIndex] = true;
        flagsRest = arrayPool1[poolIndex];
        subscribersRest = arrayPool2[poolIndex];
      }
      // copy the contents of the "rest" arrays.
      i = length;
      while (i--) {
        flagsRest[i] = this._flagsRest[i];
        subscribersRest[i] = this._subscribersRest[i];
      }
    }

    if (subscriber0) {
      subscriber0.handleChange(newValue, previousValue, flags | flags0);
    }
    if (subscriber1) {
      subscriber1.handleChange(newValue, previousValue, flags | flags1);
    }
    if (subscriber2) {
      subscriber2.handleChange(newValue, previousValue, flags | flags2);
    }
    if (length) {
      for (i = 0; i < length; i++) {
        const subscriber = subscribersRest[i];
        const flagsI = flagsRest[i];
        if (subscriber) {
          subscriber.handleChange(newValue, previousValue, flags | flagsI);
        }
        flagsRest[i] = null;
        subscribersRest[i] = null;
      }
      poolUtilization[poolIndex] = false;
    }
  }

  protected hasSubscribers(): boolean {
    return !!(
      this._flags0
      || this._flags1
      || this._flags2
      || this._flagsRest && this._flagsRest.length);
  }

  protected hasSubscriber(subscriber: IPropertySubscriber, flags?: BindingFlags): boolean {
    const has = this._flags0 === flags && this._subscriber0 === subscriber
      || this._flags1 === flags && this._subscriber1 === subscriber
      || this._flags2 === flags && this._subscriber2 === subscriber;
    if (has) {
      return true;
    }
    let index;
    const flagsRest = this._flagsRest;
    if (!flagsRest || (index = flagsRest.length) === 0) { // eslint-disable-line no-cond-assign
      return false;
    }
    const subscribers = this._subscribersRest;
    while (index--) {
      if (flagsRest[index] === flags && subscribers[index] === subscriber) {
        return true;
      }
    }
    return false;
  }
}
