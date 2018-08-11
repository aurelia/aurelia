import { BindingFlags } from './binding-flags';
import { CollectionKind, CollectionObserver, IBatchedCollectionSubscriber, ICollectionObserver, ICollectionSubscriber, IndexMap } from './observation';

function notify(this: CollectionObserver, origin: string, args?: IArguments, flags?: BindingFlags): void {
  this.hasChanges = true;
  const subscribers = this.subscribers;
  const len = subscribers.length;
  let i = 0;
  while (i < len) {
    subscribers[i].handleChange(origin, args, flags);
    i++;
  }
  this.changeSet.add(this);
}

function subscribe(this: CollectionObserver, subscriber: ICollectionSubscriber, flags?: BindingFlags): void {
  this.subscribers.push(subscriber);
  this.subscriberFlags.push(flags);
}

function unsubscribe(this: CollectionObserver, subscriber: ICollectionSubscriber, flags?: BindingFlags): void {
  const subscribers = this.subscribers;
  const len = subscribers.length;
  let i = 0;
  while (i < len) {
    if (subscribers[i] === subscriber) {
      subscribers.splice(i, 1);
      this.subscriberFlags.splice(i, 1);
      break;
    }
    i++;
  }
}

function notifyBatched(this: CollectionObserver, indexMap: IndexMap, flags?: BindingFlags): void {
  const subscribers = this.batchedSubscribers;
  const len = subscribers.length;
  let i = 0;
  while (i < len) {
    subscribers[i].handleBatchedChange(indexMap, flags);
    i++;
  }
}

function subscribeBatched(this: CollectionObserver, subscriber: IBatchedCollectionSubscriber, flags?: BindingFlags): void {
  this.batchedSubscribers.push(subscriber);
  this.batchedSubscriberFlags.push(flags);
}

function unsubscribeBatched(this: CollectionObserver, subscriber: IBatchedCollectionSubscriber, flags?: BindingFlags): void {
  const subscribers = this.batchedSubscribers;
  const len = subscribers.length;
  let i = 0;
  while (i < len) {
    if (subscribers[i] === subscriber) {
      subscribers.splice(i, 1);
      this.batchedSubscriberFlags.splice(i, 1);
      break;
    }
    i++;
  }
}

function flushChanges(this: CollectionObserver, flags?: BindingFlags): void {
  if (this.hasChanges) {
    this.hasChanges = false;
    this.notifyBatched(this.indexMap, flags);
    this.resetIndexMap();
  }
}

function dispose(this: CollectionObserver): void {
  this.collection.$observer = undefined;
  this.collection = null;
  this.indexMap = null;
  this.batchedSubscribers = null;
  this.subscribers = null;
  this.batchedSubscribers = null;
  this.subscribers = null;
}

function resetIndexMapIndexed(this: ICollectionObserver<CollectionKind.indexed>): void {
  const len = this.collection.length;
  const indexMap: IndexMap = (this.indexMap = new Array(len));
  let i = 0;
  while (i < len) {
    indexMap[i] = i++;
  }
  indexMap.deletedItems = new Array(0);
}

function resetIndexMapKeyed(this: ICollectionObserver<CollectionKind.keyed>): void {
  const len = this.collection.size;
  const indexMap: IndexMap = (this.indexMap = new Array(len));
  let i = 0;
  while (i < len) {
    indexMap[i] = i++;
  }
  indexMap.deletedItems = new Array(0);
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

    proto.subscribers = null;
    proto.subscriberFlags = null;
    proto.notify = notify;
    proto.subscribe = subscribe;
    proto.unsubscribe = unsubscribe;

    proto.batchedSubscribers = null;
    proto.batchedSubscriberFlags = null;
    proto.notifyBatched = notifyBatched;
    proto.subscribeBatched = subscribeBatched;
    proto.unsubscribeBatched = unsubscribeBatched;
  };
}
