import { BindingFlags } from './binding-flags';
import { Collection, CollectionKind, CollectionObserver, IBindingTargetObserver, ICollectionObserver, IndexMap, IPropertySubscriber, MutationKind } from './observation';
import { batchedSubscriberCollection, subscriberCollection } from './subscriber-collection';
import { targetObserver } from './target-observer';

function flushChanges(this: CollectionObserver): void {
  this.callBatchedSubscribers(this.indexMap);
  this.resetIndexMap();
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
  return this.lengthObserver || <any>(this.lengthObserver = new CollectionLengthObserver(<any>this, this.lengthPropertyName));
}

export function collectionObserver(kind: CollectionKind.array | CollectionKind.set | CollectionKind.map): ClassDecorator {
  return function(target: Function): void {
    subscriberCollection(MutationKind.collection)(target);
    batchedSubscriberCollection()(target);
    const proto = <CollectionObserver>target.prototype;

    proto.collection = null;
    proto.indexMap = null;
    proto.hasChanges = false;
    proto.lengthPropertyName = kind & CollectionKind.indexed ? 'length' : 'size';
    proto.collectionKind = kind;
    proto.resetIndexMap = kind & CollectionKind.indexed ? resetIndexMapIndexed : resetIndexMapKeyed;
    proto.flushChanges = flushChanges;
    proto.dispose = dispose;
    proto.getLengthObserver = getLengthObserver;

    proto.subscribe = proto.subscribe || proto.addSubscriber;
    proto.unsubscribe = proto.unsubscribe || proto.removeSubscriber;

    proto.subscribeBatched = proto.subscribeBatched || proto.addBatchedSubscriber;
    proto.unsubscribeBatched = proto.unsubscribeBatched || proto.removeBatchedSubscriber;
  };
}

// tslint:disable-next-line:interface-name
export interface CollectionLengthObserver extends IBindingTargetObserver<any, string> {}

@targetObserver()
export class CollectionLengthObserver implements CollectionLengthObserver {
  public currentValue: number;
  public currentFlags: BindingFlags;

  constructor(public obj: Collection, public propertyKey: 'length' | 'size') {
    this.currentValue = obj[propertyKey];
  }

  public getValue(): number {
    return this.obj[this.propertyKey];
  }

  public setValueCore(newValue: number): void {
    this.obj[this.propertyKey] = newValue;
  }

  public subscribe(subscriber: IPropertySubscriber): void {
    this.addSubscriber(subscriber);
  }

  public unsubscribe(subscriber: IPropertySubscriber): void {
    this.removeSubscriber(subscriber);
  }
}
