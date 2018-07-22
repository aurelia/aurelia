import { IDisposable } from "../../../kernel/interfaces";


export interface IObservedCollection {
  $observer: CollectionObserver;
}
export interface IObservedArray extends IObservedCollection, Array<any> { }
export interface IObservedSet extends IObservedCollection, Set<any> { }
export interface IObservedMap extends IObservedCollection, Map<any, any> { }
export type ObservedCollection = IObservedArray | IObservedSet | IObservedMap;

export const enum CollectionKind {
  indexed = 0b1000,
  keyed   = 0b0100,
  array   = 0b1001,
  map     = 0b0110,
  set     = 0b0111
}

export interface IImmediateCollectionSubscriber {
  (origin: string, args?: IArguments): void;
}

export interface IBatchedCollectionSubscriber {
  (indexMap: Array<number>): void;
}

export interface IImmediateCollectionSubscriberCollection {
  immediateSubscriber0: IImmediateCollectionSubscriber;
  immediateSubscriber1: IImmediateCollectionSubscriber;
  immediateSubscribers: Array<IImmediateCollectionSubscriber>;
  immediateSubscriberCount: number;
  notifyImmediate(origin: string, args?: IArguments): void;
  subscribeImmediate(subscriber: IImmediateCollectionSubscriber): void;
  unsubscribeImmediate(subscriber: IImmediateCollectionSubscriber): void;
}

export interface IBatchedCollectionSubscriberCollection {
  batchedSubscriber0: IBatchedCollectionSubscriber;
  batchedSubscriber1: IBatchedCollectionSubscriber;
  batchedSubscribers: Array<IBatchedCollectionSubscriber>;
  batchedSubscriberCount: number;
  notifyBatched(indexMap: Array<number>): void;
  subscribeBatched(subscriber: IBatchedCollectionSubscriber): void;
  unsubscribeBatched(subscriber: IBatchedCollectionSubscriber): void;
}

export interface ICollectionObserver<T extends ObservedCollection> extends IDisposable, IImmediateCollectionSubscriberCollection, IBatchedCollectionSubscriberCollection {
  collection: T;
  indexMap: Array<number>;
  hasChanges: boolean;
  resetIndexMap(): void;
  flushChanges(): void;
}

export interface IArrayObserver extends ICollectionObserver<IObservedArray> {
  lengthPropertyName: 'length';
  collectionKind: CollectionKind.array;
}

export interface IMapObserver extends ICollectionObserver<IObservedMap> {
  lengthPropertyName: 'size';
  collectionKind: CollectionKind.map;
}

export interface ISetObserver extends ICollectionObserver<IObservedSet> {
  lengthPropertyName: 'size';
  collectionKind: CollectionKind.set;
}

export type CollectionObserver = IArrayObserver | IMapObserver | ISetObserver;

function notifyImmediate(this: CollectionObserver, origin: string, args?: IArguments): void {
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
      const immediateSubscribers = this.immediateSubscribers;
      const len = count - 2;
      let i = 0;
      while (i < len) {
        immediateSubscribers[i](origin, args);
        i++;
      }
  }
}

function subscribeImmediate(this: CollectionObserver, subscriber: IImmediateCollectionSubscriber): void {
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

function unsubscribeImmediate(this: CollectionObserver, subscriber: IImmediateCollectionSubscriber): void {
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


function notifyBatched(this: CollectionObserver, indexMap: Array<number>): void {
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
      const len = count - 2;
      let i = 0;
      while (i < len) {
        this.batchedSubscribers[i](indexMap);
        i++;
      }
  }
}

function subscribeBatched(this: CollectionObserver, subscriber: IBatchedCollectionSubscriber): void {
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

function unsubscribeBatched(this: CollectionObserver, subscriber: IBatchedCollectionSubscriber): void {
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

function flushChanges(this: CollectionObserver): void {
  if (this.hasChanges) {
    this.hasChanges = false;
    this.notifyBatched(this.indexMap);
    this.resetIndexMap();
  }
}

function dispose(this: CollectionObserver): void {
  this.collection.$observer = undefined;
  this.collection = null;
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

function resetIndexMapIndexed(this: IArrayObserver): void {
  const len = this.collection.length;
  const indexMap = this.indexMap = new Array(len);
  let i = 0;
  while (i < len) {
    indexMap[i] = i++;
  }
}

function resetIndexMapKeyed(this: IMapObserver | ISetObserver): void {
  const len = this.collection.size;
  const indexMap = this.indexMap = new Array(len);
  let i = 0;
  while (i < len) {
    indexMap[i] = i++;
  }
}

export function collectionObserver(kind: CollectionKind.array | CollectionKind.set | CollectionKind.map): ClassDecorator {
  return function(target: Function): void {
    const proto = <CollectionObserver>target.prototype;

    proto.collection = null;
    proto.indexMap = null;
    proto.hasChanges = false;
    proto.lengthPropertyName = kind & CollectionKind.indexed ? 'length' : 'size';
    proto.collectionKind = kind;
    proto.resetIndexMap = kind & CollectionKind.indexed ? resetIndexMapIndexed : resetIndexMapKeyed;
    proto.flushChanges = flushChanges;
    proto.dispose = dispose;

    proto.immediateSubscriber0 = null;
    proto.immediateSubscriber1 = null;
    proto.immediateSubscribers = null;
    proto.immediateSubscriberCount = 0;
    proto.notifyImmediate = notifyImmediate;
    proto.subscribeImmediate = subscribeImmediate;
    proto.unsubscribeImmediate = unsubscribeImmediate;

    proto.batchedSubscriber0 = null;
    proto.batchedSubscriber1 = null;
    proto.batchedSubscribers = null;
    proto.batchedSubscriberCount = 0;
    proto.notifyBatched = notifyBatched;
    proto.subscribeBatched = subscribeBatched;
    proto.unsubscribeBatched = unsubscribeBatched;
  }
}
