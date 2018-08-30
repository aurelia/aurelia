import { CollectionKind, CollectionObserver, ICollectionObserver, IndexMap, MutationKind } from './observation';
import { batchedSubscriberCollection, subscriberCollection } from './subscriber-collection';

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

    proto.subscribe = proto.subscribe || proto.addSubscriber;
    proto.unsubscribe = proto.unsubscribe || proto.removeSubscriber;

    proto.subscribeBatched = proto.subscribeBatched || proto.addBatchedSubscriber;
    proto.unsubscribeBatched = proto.unsubscribeBatched || proto.removeBatchedSubscriber;
  };
}
