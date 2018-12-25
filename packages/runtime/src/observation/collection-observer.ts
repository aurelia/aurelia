import { Tracer } from '@aurelia/kernel';
import {
  Collection,
  CollectionKind,
  CollectionObserver,
  IBindingTargetObserver,
  ICollectionObserver,
  IndexMap,
  IPatch,
  IPropertySubscriber,
  LifecycleFlags,
  MutationKind
} from '../observation';
import { batchedSubscriberCollection, subscriberCollection } from './subscriber-collection';
import { targetObserver } from './target-observer';

const slice = Array.prototype.slice;

function flush(this: CollectionObserver): void {
  if (Tracer.enabled) { Tracer.enter(`${this['constructor'].name}.flush`, slice.call(arguments)); }
  this.callBatchedSubscribers(this.indexMap);
  if (!!this.lengthObserver) {
    this.lengthObserver.patch(LifecycleFlags.fromFlush | LifecycleFlags.updateTargetInstance);
  }
  this.resetIndexMap();
  if (Tracer.enabled) { Tracer.leave(); }
}

function dispose(this: CollectionObserver): void {
  this.collection.$observer = undefined;
  this.collection = null;
  this.indexMap = null;
}

function resetIndexMapIndexed(this: ICollectionObserver<CollectionKind.indexed>): void {
  const len = this.collection.length;
  const indexMap: IndexMap = (this.indexMap = Array(len));
  let i = 0;
  while (i < len) {
    indexMap[i] = i++;
  }
  indexMap.deletedItems = [];
}

function resetIndexMapKeyed(this: ICollectionObserver<CollectionKind.keyed>): void {
  const len = this.collection.size;
  const indexMap: IndexMap = (this.indexMap = Array(len));
  let i = 0;
  while (i < len) {
    indexMap[i] = i++;
  }
  indexMap.deletedItems = [];
}

function getLengthObserver(this: CollectionObserver): CollectionLengthObserver {
  return this.lengthObserver === undefined ? (this.lengthObserver = new CollectionLengthObserver(this as Collection&ICollectionObserver<CollectionKind>, this.lengthPropertyName)) : this.lengthObserver as CollectionLengthObserver;
}

export function collectionObserver(kind: CollectionKind.array | CollectionKind.set | CollectionKind.map): ClassDecorator {
  return function(target: Function): void {
    subscriberCollection(MutationKind.collection)(target);
    batchedSubscriberCollection()(target);
    const proto = target.prototype as CollectionObserver;

    proto.$nextFlush = null;

    proto.collection = null;
    proto.indexMap = null;
    proto.hasChanges = false;
    proto.lengthPropertyName = kind & CollectionKind.indexed ? 'length' : 'size';
    proto.collectionKind = kind;
    proto.resetIndexMap = kind & CollectionKind.indexed ? resetIndexMapIndexed : resetIndexMapKeyed;
    proto.flush = flush;
    proto.dispose = dispose;
    proto.getLengthObserver = getLengthObserver;

    proto.subscribe = proto.subscribe || proto.addSubscriber;
    proto.unsubscribe = proto.unsubscribe || proto.removeSubscriber;

    proto.subscribeBatched = proto.subscribeBatched || proto.addBatchedSubscriber;
    proto.unsubscribeBatched = proto.unsubscribeBatched || proto.removeBatchedSubscriber;
  };
}

export interface CollectionLengthObserver extends IBindingTargetObserver<Collection, string> {}

@targetObserver()
export class CollectionLengthObserver implements CollectionLengthObserver, IPatch {
  public currentValue: number;
  public currentFlags: LifecycleFlags;

  public obj: Collection;
  public propertyKey: 'length' | 'size';

  constructor(obj: Collection, propertyKey: 'length' | 'size') {
    this.obj = obj;
    this.propertyKey = propertyKey;

    this.currentValue = obj[propertyKey];
  }

  public getValue(): number {
    return this.obj[this.propertyKey];
  }

  public setValueCore(newValue: number): void {
    this.obj[this.propertyKey] = newValue;
  }

  public patch(flags: LifecycleFlags): void {
    this.callSubscribers(this.obj[this.propertyKey], this.currentValue, flags);
    this.currentValue = this.obj[this.propertyKey];
  }

  public subscribe(subscriber: IPropertySubscriber): void {
    this.addSubscriber(subscriber);
  }

  public unsubscribe(subscriber: IPropertySubscriber): void {
    this.removeSubscriber(subscriber);
  }
}
