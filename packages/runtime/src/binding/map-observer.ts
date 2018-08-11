import { nativePush, nativeSplice } from './array-observer';
import { BindingFlags } from './binding-flags';
import { collectionObserver } from './collection-observer';
import { CollectionKind, IBatchedCollectionSubscriber, ICollectionObserver, ICollectionSubscriber, IndexMap, IObservedMap } from './observation';
import { IChangeSet } from './change-set';

const proto = Map.prototype;
export const nativeSet = proto.set; // TODO: probably want to make these internal again
export const nativeClear = proto.clear;
export const nativeDelete = proto.delete;

export function enableMapObservation(): void {
  proto.set = observeSet;
  proto.clear = observeClear;
  proto.delete = observeDelete;
}

export function disableMapObservation(): void {
  proto.set = nativeSet;
  proto.clear = nativeClear;
  proto.delete = nativeDelete;
}

// note: we can't really do much with Map due to the internal data structure not being accessible so we're just using the native calls
// fortunately, map/delete/clear are easy to reconstruct for the indexMap

// https://tc39.github.io/ecma262/#sec-map.prototype.map
function observeSet(this: IObservedMap, key: any, value: any): ReturnType<typeof nativeSet> {
  const o = this.$observer;
  if (o === undefined) {
    return nativeSet.call(this, key, value);
  }
  const oldSize = this.size;
  nativeSet.call(this, key, value);
  const newSize = this.size;
  if (newSize === oldSize) {
    let i = 0
    for (const entry of this.entries()) {
      if (entry[0] === key) {
        if (entry[1] !== value) {
          o.indexMap[i] = -2;
        }
        return this;
      }
      i++;
    }
    return this;
  }
  o.indexMap[oldSize] = -2;
  o.notify('set', arguments);
  return this;
};

// https://tc39.github.io/ecma262/#sec-map.prototype.clear
function observeClear(this: IObservedMap): ReturnType<typeof nativeClear>  {
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

// https://tc39.github.io/ecma262/#sec-map.prototype.delete
function observeDelete(this: IObservedMap, value: any): ReturnType<typeof nativeDelete> {
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

@collectionObserver(CollectionKind.map)
export class MapObserver implements ICollectionObserver<CollectionKind.map> {
  public resetIndexMap: () => void;
  public notify: (origin: string, args?: IArguments, flags?: BindingFlags) => void;
  public notifyBatched: (indexMap: IndexMap, flags?: BindingFlags) => void;
  public subscribeBatched: (subscriber: IBatchedCollectionSubscriber, flags?: BindingFlags) => void;
  public unsubscribeBatched: (subscriber: IBatchedCollectionSubscriber, flags?: BindingFlags) => void;
  public subscribe: (subscriber: ICollectionSubscriber, flags?: BindingFlags) => void;
  public unsubscribe: (subscriber: ICollectionSubscriber, flags?: BindingFlags) => void;
  public flushChanges: (flags?: BindingFlags) => void;
  public dispose: () => void;

  /*@internal*/
  public changeSet: IChangeSet;
  public collection: IObservedMap;
  public indexMap: IndexMap;
  public hasChanges: boolean;
  public lengthPropertyName: 'size';
  public collectionKind: CollectionKind.map;

  public subscribers: Array<ICollectionSubscriber>;
  public batchedSubscribers: Array<IBatchedCollectionSubscriber>;

  public subscriberFlags: Array<BindingFlags>;
  public batchedSubscriberFlags: Array<BindingFlags>;

  constructor(changeSet: IChangeSet, map: Map<any, any> & { $observer?: ICollectionObserver<CollectionKind.map> }) {
    this.changeSet = changeSet;
    map.$observer = this;
    this.collection = <IObservedMap>map;
    this.resetIndexMap();
    this.subscribers = new Array();
    this.batchedSubscribers = new Array();
    this.subscriberFlags = new Array();
    this.batchedSubscriberFlags = new Array();
  }
}

export function getMapObserver(changeSet: IChangeSet, map: any): MapObserver {
  return map.$observer || new MapObserver(changeSet, map);
}
