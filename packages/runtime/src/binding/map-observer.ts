// tslint:disable:no-reserved-keywords
import { nativePush, nativeSplice } from './array-observer';
import { BindingFlags } from './binding-flags';
import { IChangeSet } from './change-set';
import { collectionObserver } from './collection-observer';
import { CollectionKind, ICollectionObserver, IObservedMap } from './observation';

const proto = Map.prototype;
export const nativeSet = proto.set; // TODO: probably want to make these internal again
export const nativeClear = proto.clear;
export const nativeDelete = proto.delete;

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
  o.callSubscribers('set', arguments, BindingFlags.isCollectionMutation);
  return this;
}

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
    o.callSubscribers('clear', arguments, BindingFlags.isCollectionMutation);
  }
  return undefined;
}

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
  o.callSubscribers('delete', arguments, BindingFlags.isCollectionMutation);
  return false;
}

for (const observe of [observeSet, observeClear, observeDelete]) {
  Object.defineProperty(observe, 'observing', { value: true, writable: false, configurable: false, enumerable: false });
}

export function enableMapObservation(): void {
  if (proto.set['observing'] !== true) proto.set = observeSet;
  if (proto.clear['observing'] !== true) proto.clear = observeClear;
  if (proto.delete['observing'] !== true) proto.delete = observeDelete;
}

enableMapObservation();

export function disableMapObservation(): void {
  if (proto.set['observing'] === true) proto.set = nativeSet;
  if (proto.clear['observing'] === true) proto.clear = nativeClear;
  if (proto.delete['observing'] === true) proto.delete = nativeDelete;
}

// tslint:disable-next-line:interface-name
export interface MapObserver extends ICollectionObserver<CollectionKind.map> {}

@collectionObserver(CollectionKind.map)
export class MapObserver implements MapObserver {
  public resetIndexMap: () => void;
  public changeSet: IChangeSet;

  public collection: IObservedMap;

  constructor(changeSet: IChangeSet, map: Map<any, any> & { $observer?: MapObserver }) {
    this.changeSet = changeSet;
    map.$observer = this;
    this.collection = <IObservedMap>map;
    this.resetIndexMap();
  }
}

export function getMapObserver(changeSet: IChangeSet, map: any): MapObserver {
  return map.$observer || new MapObserver(changeSet, map);
}
