import { IDisposable } from './../../kernel/interfaces';

export type MutationOrigin = 'add' | 'clear' | 'delete';

export interface IObservedSet<T = any> extends Set<T> {
  $observer: SetObserver<T>;
}

const proto = Set.prototype;
const add = proto.add;
const clear = proto.clear;
const del = proto.delete;

export function enableSetObservation(): void {
  proto.add = observeAdd;
  proto.clear = observeClear;
  proto.delete = observeDelete;
}

export function disableSetObservation(): void {
  proto.add = add;
  proto.clear = clear;
  proto.delete = del;
}

// note: we can't really do much with Set due to the internal data structure not being accessible so we're just using the native calls
// fortunately, add/delete/clear are easy to reconstruct for the indexMap

// https://tc39.github.io/ecma262/#sec-set.prototype.add
function observeAdd(this: IObservedSet, value: any): ReturnType<typeof add> {
  const o = this.$observer;
  if (o === undefined) {
    return add.call(this, value);
  }
  const oldSize = this.size;
  add.call(this, value);
  const newSize = this.size;
  if (newSize === oldSize) {
    return this;
  }
  o.indexMap[oldSize] = -oldSize - 2;
  o.notifyImmediate('add', arguments);
  return this;
};

// https://tc39.github.io/ecma262/#sec-set.prototype.clear
function observeClear(this: IObservedSet): ReturnType<typeof clear>  {
  const o = this.$observer;
  if (o === undefined) {
    return clear.call(this);
  }
  clear.call(this);
  o.indexMap.length = 0;
  o.notifyImmediate('clear');
  return undefined;
};

// https://tc39.github.io/ecma262/#sec-set.prototype.delete
function observeDelete(this: IObservedSet, value: any): ReturnType<typeof del> {
  const o = this.$observer;
  if (o === undefined) {
    return del.call(this, value);
  }
  const size = this.size;
  if (size === 0) {
    return false;
  }
  let i = 0;
  for (const entry of this.keys()) {
    if (entry === value) {
      o.indexMap.splice(i, 1);
      return del.call(this, value);
    }
    i++;
  }
  return false;
};

export interface IImmediateSubscriber {
  (origin: MutationOrigin, args?: IArguments): void;
}

export interface IBatchedSubscriber {
  (indexMap: Array<number>): void;
}

export class SetObserver<T = any> implements IDisposable {
  public set: IObservedSet<any>;
  public indexMap: Array<number>;
  public hasChanges: boolean;
  private immediateSubscriber0: IImmediateSubscriber;
  private immediateSubscriber1: IImmediateSubscriber;
  private immediateSubscribers: Array<IImmediateSubscriber>;
  private immediateSubscriberCount: number;
  private batchedSubscriber0: IBatchedSubscriber;
  private batchedSubscriber1: IBatchedSubscriber;
  private batchedSubscribers: Array<IBatchedSubscriber>;
  private batchedSubscriberCount: number;

  constructor(set: Set<T>) {
    if (!(set instanceof Set)) {
      throw new Error(Object.prototype.toString.call(set) + ' is not a set!');
    }
    this.set = <any>set;
    this.set.$observer = this;
    this.resetIndexMap();
    this.hasChanges = false;
    this.immediateSubscribers = new Array();
    this.batchedSubscribers = new Array();
    this.immediateSubscriberCount = 0;
    this.batchedSubscriberCount = 0;
  }

  resetIndexMap(): void {
    const len = this.set.size;
    this.indexMap = new Array(len);
    let i = 0;
    while (i < len) {
      this.indexMap[i] = i++;
    }
  }

  notifyImmediate(origin: MutationOrigin, args?: IArguments): void {
    // todo: optimize / generalize
    this.hasChanges = true;
    const count = this.immediateSubscriberCount;
    switch(count) {
      case 0:
        return;
      case 1:
        this.immediateSubscriber0(origin, args);
        return;
      case 2:
        this.immediateSubscriber0(origin, args);
        this.immediateSubscriber1(origin, args);
        return;
      default:
        this.immediateSubscriber0(origin, args);
        this.immediateSubscriber1(origin, args);
        let i = 2;
        while (i < count) {
          this.immediateSubscribers[i](origin, args);
          i++;
        }
    }
  }

  notifyBatched(indexMap: Array<number>): void {
    // todo: optimize / generalize
    const count = this.batchedSubscriberCount;
    switch(count) {
      case 0:
        return;
      case 1:
        this.batchedSubscriber0(indexMap);
        return;
      case 2:
        this.batchedSubscriber0(indexMap);
        this.batchedSubscriber1(indexMap);
        return;
      default:
        this.batchedSubscriber0(indexMap);
        this.batchedSubscriber1(indexMap);
        let i = 2;
        while (i < count) {
          this.batchedSubscribers[i](indexMap);
          i++;
        }
    }
  }

  flushChanges(): void {
    if (this.hasChanges) {
      this.notifyBatched(this.indexMap);
      this.resetIndexMap();
      this.hasChanges = false;
    }
  }

  subscribeBatched(subscriber: IBatchedSubscriber): void {
    switch (this.batchedSubscriberCount) {
      case 0:
        this.batchedSubscriber0 = subscriber;
        break;
      case 1:
        this.batchedSubscriber1 = subscriber;
        break;
      default:
        this.batchedSubscribers.push(subscriber);
        break;
    }
    this.batchedSubscriberCount++;
  }

  unsubscribeBatched(subscriber: IBatchedSubscriber): void {
    if (subscriber === this.batchedSubscriber0) {
      this.batchedSubscriber0 = this.batchedSubscriber1;
      this.batchedSubscriber1 = this.batchedSubscribers.shift();
    } else if (subscriber === this.batchedSubscriber1) {
      this.batchedSubscriber1 = this.batchedSubscribers.shift();
    } else {
      const i = this.batchedSubscribers.indexOf(subscriber);
      if (i > -1) {
        this.batchedSubscribers.splice(i, 1);
      }
    }
    this.batchedSubscriberCount--;
  }

  subscribeImmediate(subscriber: IImmediateSubscriber): void {
    switch (this.immediateSubscriberCount) {
      case 0:
        this.immediateSubscriber0 = subscriber;
        break;
      case 1:
        this.immediateSubscriber1 = subscriber;
        break;
      default:
        this.immediateSubscribers.push(subscriber);
        break;
    }
    this.immediateSubscriberCount++;
  }

  unsubscribeImmediate(subscriber: IImmediateSubscriber): void {
    if (subscriber === this.immediateSubscriber0) {
      this.immediateSubscriber0 = this.immediateSubscriber1;
      this.immediateSubscriber1 = this.immediateSubscribers.shift();
    } else if (subscriber === this.immediateSubscriber1) {
      this.immediateSubscriber1 = this.immediateSubscribers.shift();
    } else {
      const i = this.immediateSubscribers.indexOf(subscriber);
      if (i > -1) {
        this.immediateSubscribers.splice(i, 1);
      }
    }
    this.immediateSubscriberCount--;
  }

  subscribe(subscriber: IImmediateSubscriber): void { }

  unsubscribe(subscriber: IImmediateSubscriber): void { }
  
  dispose(): void {
    this.set.$observer = undefined;
    this.set = null;
    this.indexMap = null;
    this.batchedSubscriber0 = null;
    this.batchedSubscriber1 = null;
    this.batchedSubscribers = null;
    this.immediateSubscriber0 = null;
    this.immediateSubscriber1 = null;
    this.immediateSubscribers = null;
    this.batchedSubscribers = null;
    this.immediateSubscribers = null;
  }
}

export function getSetObserver(array: any): SetObserver {
  return array.$observer || new SetObserver(array);
}
