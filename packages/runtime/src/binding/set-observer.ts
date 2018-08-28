import { nativePush, nativeSplice } from './array-observer';
import { BindingFlags } from './binding-flags';
import { IChangeSet } from './change-set';
import { collectionObserver } from './collection-observer';
import { CollectionKind, IBatchedCollectionSubscriber, ICollectionObserver, ICollectionSubscriber, IndexMap, IObservedSet, ICollectionChangeNotifier, IBatchedCollectionChangeNotifier } from './observation';

const proto = Set.prototype;
export const nativeAdd = proto.add; // TODO: probably want to make these internal again
export const nativeClear = proto.clear;
export const nativeDelete = proto.delete;

// note: we can't really do much with Set due to the internal data structure not being accessible so we're just using the native calls
// fortunately, add/delete/clear are easy to reconstruct for the indexMap

// https://tc39.github.io/ecma262/#sec-set.prototype.add
function observeAdd(this: IObservedSet, value: any): ReturnType<typeof nativeAdd> {
  const o = this.$observer;
  if (o === undefined) {
    return nativeAdd.call(this, value);
  }
  const oldSize = this.size;
  nativeAdd.call(this, value);
  const newSize = this.size;
  if (newSize === oldSize) {
    return this;
  }
  o.indexMap[oldSize] = -2;
  o.callSubscribers('add', arguments, BindingFlags.isCollectionMutation);
  return this;
}

// https://tc39.github.io/ecma262/#sec-set.prototype.clear
function observeClear(this: IObservedSet): ReturnType<typeof nativeClear>  {
  const o = this.$observer;
  if (o === undefined) {
    return nativeClear.call(this);
  }
  const size = this.size;
  if (size > 0) {
    const indexMap = o.indexMap;
    let i = 0;
    for (const entry of this.keys()) {
      if (indexMap[i] > -1) {
        nativePush.call(indexMap.deletedItems, entry);
      }
      i++;
    }
    nativeClear.call(this);
    indexMap.length = 0;
    o.callSubscribers('clear', arguments, BindingFlags.isCollectionMutation);
  }
  return undefined;
}

// https://tc39.github.io/ecma262/#sec-set.prototype.delete
function observeDelete(this: IObservedSet, value: any): ReturnType<typeof nativeDelete> {
  const o = this.$observer;
  if (o === undefined) {
    return nativeDelete.call(this, value);
  }
  const size = this.size;
  if (size === 0) {
    return false;
  }
  let i = 0;
  const indexMap = o.indexMap;
  for (const entry of this.keys()) {
    if (entry === value) {
      if (indexMap[i] > -1) {
        nativePush.call(indexMap.deletedItems, entry);
      }
      nativeSplice.call(indexMap, i, 1);
      return nativeDelete.call(this, value);
    }
    i++;
  }
  o.callSubscribers('delete', arguments, BindingFlags.isCollectionMutation);
  return false;
}

for (const observe of [observeAdd, observeClear, observeDelete]) {
  Object.defineProperty(observe, 'observing', { value: true, writable: false, configurable: false, enumerable: false });
}

export function enableSetObservation(): void {
  if (proto.add['observing'] !== true) proto.add = observeAdd;
  if (proto.clear['observing'] !== true) proto.clear = observeClear;
  if (proto.delete['observing'] !== true) proto.delete = observeDelete;
}

enableSetObservation();

export function disableSetObservation(): void {
  if (proto.add['observing'] === true) proto.add = nativeAdd;
  if (proto.clear['observing'] === true) proto.clear = nativeClear;
  if (proto.delete['observing'] === true) proto.delete = nativeDelete;
}

@collectionObserver(CollectionKind.set)
export class SetObserver implements ICollectionObserver<CollectionKind.set> {
  public lengthPropertyName: 'size';
  public collectionKind: CollectionKind.set;
  public dispose: () => void;
  public indexMap: IndexMap;
  public hasChanges?: boolean;
  public flushChanges: () => void;
  public callSubscribers: ICollectionChangeNotifier;
  public hasSubscribers: () => boolean;
  public hasSubscriber: (subscriber: ICollectionSubscriber) => boolean;
  public removeSubscriber: (subscriber: ICollectionSubscriber) => boolean;
  public addSubscriber: (subscriber: ICollectionSubscriber) => boolean;
  public subscribe: (subscriber: ICollectionSubscriber) => void;
  public unsubscribe: (subscriber: ICollectionSubscriber) => void;
  public callBatchedSubscribers: IBatchedCollectionChangeNotifier;
  public hasBatchedSubscribers: () => boolean;
  public hasBatchedSubscriber: (subscriber: IBatchedCollectionSubscriber) => boolean;
  public removeBatchedSubscriber: (subscriber: IBatchedCollectionSubscriber) => boolean;
  public addBatchedSubscriber: (subscriber: IBatchedCollectionSubscriber) => boolean;
  public subscribeBatched: (subscriber: IBatchedCollectionSubscriber) => void;
  public unsubscribeBatched: (subscriber: IBatchedCollectionSubscriber) => void;

  public resetIndexMap: () => void;
  public changeSet: IChangeSet;

  public collection: IObservedSet;

  constructor(changeSet: IChangeSet, set: Set<any> & { $observer?: Partial<ICollectionObserver<CollectionKind.set>> }) {
    this.changeSet = changeSet;
    set.$observer = this;
    this.collection = <IObservedSet>set;
    this.resetIndexMap();
  }
}

export function getSetObserver(changeSet: IChangeSet, set: any): SetObserver {
  return set.$observer || new SetObserver(changeSet, set);
}
