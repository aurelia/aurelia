import { nativePush, nativeSplice } from './array-observer';
import { BindingFlags } from './binding-flags';
import { collectionObserver } from './collection-observer';
import { CollectionKind, IBatchedCollectionSubscriber, ICollectionObserver, ICollectionSubscriber, IndexMap, IObservedSet } from './observation';

const proto = Set.prototype;
export const nativeAdd = proto.add; // TODO: probably want to make these internal again
export const nativeClear = proto.clear;
export const nativeDelete = proto.delete;

export function enableSetObservation(): void {
  proto.add = observeAdd;
  proto.clear = observeClear;
  proto.delete = observeDelete;
}

export function disableSetObservation(): void {
  proto.add = nativeAdd;
  proto.clear = nativeClear;
  proto.delete = nativeDelete;
}

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
  o.notify('add', arguments);
  return this;
};

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
    o.notify('clear');
  }
  return undefined;
};

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
  o.notify('delete', arguments);
  return false;
};

@collectionObserver(CollectionKind.set)
export class SetObserver implements ICollectionObserver<CollectionKind.set> {
  public collection: IObservedSet;
  public indexMap: IndexMap;
  public hasChanges: boolean;
  public lengthPropertyName: 'size';
  public collectionKind: CollectionKind.set;

  public subscribers: Array<ICollectionSubscriber>;
  public batchedSubscribers: Array<IBatchedCollectionSubscriber>;

  public subscriberFlags: Array<BindingFlags>;
  public batchedSubscriberFlags: Array<BindingFlags>;

  constructor(set: Set<any> & { $observer?: ICollectionObserver<CollectionKind.set> }) {
    set.$observer = this;
    this.collection = <IObservedSet>set;
    this.resetIndexMap();
    this.subscribers = new Array();
    this.batchedSubscribers = new Array();
    this.subscriberFlags = new Array();
    this.batchedSubscriberFlags = new Array();
  }

  public resetIndexMap: () => void;
  public notify: (origin: string, args?: IArguments, flags?: BindingFlags) => void;
  public notifyBatched: (indexMap: IndexMap, flags?: BindingFlags) => void;
  public subscribeBatched: (subscriber: IBatchedCollectionSubscriber, flags?: BindingFlags) => void;
  public unsubscribeBatched: (subscriber: IBatchedCollectionSubscriber, flags?: BindingFlags) => void;
  public subscribe: (subscriber: ICollectionSubscriber, flags?: BindingFlags) => void;
  public unsubscribe: (subscriber: ICollectionSubscriber, flags?: BindingFlags) => void;
  public flushChanges: (flags?: BindingFlags) => void;
  public dispose: () => void;
}

export function getSetObserver(set: any): SetObserver {
  return set.$observer || new SetObserver(set);
}
