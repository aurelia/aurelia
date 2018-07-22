import { CollectionObserver, ICollectionObserver, ICollectionSubscriber, IBatchedCollectionSubscriber, CollectionKind } from "../observation";
import { PLATFORM } from "../../../kernel/platform";

const $null = PLATFORM.$null;

function notify(this: CollectionObserver, origin: string, args?: IArguments): void {
  this.hasChanges = true;
  const subscribers = this.subscribers;
  const len = subscribers.length;
  let i = 0;
  while (i < len) {
    subscribers[i].handleChange(origin, args);
    i++;
  }
}

function subscribe(this: CollectionObserver, subscriber: ICollectionSubscriber): void {
  this.subscribers.push(subscriber);
}

function unsubscribe(this: CollectionObserver, subscriber: ICollectionSubscriber): void {
  const subscribers = this.subscribers;
  const len = subscribers.length;
  let i = 0;
  while (i < len) {
    if (subscribers[i] === subscriber) {
      subscribers.splice(i, 1);
      break;
    }
    i++;
  }
}

function notifyBatched(this: CollectionObserver, indexMap: Array<number>): void {
  const subscribers = this.batchedSubscribers;
  const len = subscribers.length;
  let i = 0;
  while (i < len) {
    subscribers[i].handleBatchedChange(indexMap);
    i++;
  }
}

function subscribeBatched(this: CollectionObserver, subscriber: IBatchedCollectionSubscriber): void {
  this.batchedSubscribers.push(subscriber);
}

function unsubscribeBatched(this: CollectionObserver, subscriber: IBatchedCollectionSubscriber): void {
  const subscribers = this.batchedSubscribers;
  const len = subscribers.length;
  let i = 0;
  while (i < len) {
    if (subscribers[i] === subscriber) {
      subscribers.splice(i, 1);
      break;
    }
    i++;
  }
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
  this.collection = $null;
  this.indexMap = $null;
  this.batchedSubscribers = $null;
  this.subscribers = $null;
  this.batchedSubscribers = $null;
  this.subscribers = $null;
}

function resetIndexMapIndexed(this: ICollectionObserver<CollectionKind.indexed>): void {
  const len = this.collection.length;
  const indexMap = this.indexMap = new Array(len);
  let i = 0;
  while (i < len) {
    indexMap[i] = i++;
  }
}

function resetIndexMapKeyed(this: ICollectionObserver<CollectionKind.keyed>): void {
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

    proto.collection = $null;
    proto.indexMap = $null;
    proto.hasChanges = false;
    proto.lengthPropertyName = kind & CollectionKind.indexed ? 'length' : 'size';
    proto.collectionKind = kind;
    proto.resetIndexMap = kind & CollectionKind.indexed ? resetIndexMapIndexed : resetIndexMapKeyed;
    proto.flushChanges = flushChanges;
    proto.dispose = dispose;

    proto.subscribers = $null;
    proto.notify = notify;
    proto.subscribe = subscribe;
    proto.unsubscribe = unsubscribe;

    proto.batchedSubscribers = $null;
    proto.notifyBatched = notifyBatched;
    proto.subscribeBatched = subscribeBatched;
    proto.unsubscribeBatched = unsubscribeBatched;
  }
}
