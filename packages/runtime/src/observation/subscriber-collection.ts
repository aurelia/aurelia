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

export type IAnySubscriber = ISubscriber | ICollectionSubscriber;

/* eslint-disable @typescript-eslint/ban-types */
export function subscriberCollection(): ClassDecorator;
export function subscriberCollection(target: Function): void;
export function subscriberCollection(target?: Function): ClassDecorator | void {
  return target == null ? subscriberCollectionDeco : subscriberCollectionDeco(target);
}

const decoratedTarget = new WeakSet<Function>();
function subscriberCollectionDeco(target: Function): void { // ClassDecorator expects it to be derived from Function
  if (decoratedTarget.has(target)) {
    return;
  }
  decoratedTarget.add(target);
  const proto = target.prototype as ISubscriberCollection;
  // not configurable, as in devtool, the getter could be invoked on the prototype,
  // and become permanently broken
  def(proto, 'subs', { get: getSubscriberRecord });

  ensureProto(proto, 'subscribe', addSubscriber);
  ensureProto(proto, 'unsubscribe', removeSubscriber);
}
/* eslint-enable @typescript-eslint/ban-types */

export class SubscriberRecord<T extends IAnySubscriber> implements ISubscriberRecord<T> {
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

function getSubscriberRecord(this: ISubscriberCollection) {
  return defineHiddenProp(this, 'subs', new SubscriberRecord());
}

function addSubscriber(this: ISubscriberCollection, subscriber: IAnySubscriber): boolean {
  return this.subs.add(subscriber as ISubscriber & ICollectionSubscriber);
}

function removeSubscriber(this: ISubscriberCollection, subscriber: IAnySubscriber): boolean {
  return this.subs.remove(subscriber as ISubscriber & ICollectionSubscriber);
}
