import { IIndexable, Primitive } from '../../kernel';
import { ILifecycle } from '../lifecycle';
import { CollectionKind, ICollectionObserver, IObservedSet, LifecycleFlags } from '../observation';
// tslint:disable:no-reserved-keywords
import { nativePush, nativeSplice } from './array-observer';
import { collectionObserver } from './collection-observer';

const proto = Set.prototype;
export const nativeAdd = proto.add; // TODO: probably want to make these internal again
export const nativeClear = proto.clear;
export const nativeDelete = proto.delete;

// note: we can't really do much with Set due to the internal data structure not being accessible so we're just using the native calls
// fortunately, add/delete/clear are easy to reconstruct for the indexMap

// https://tc39.github.io/ecma262/#sec-set.prototype.add
function observeAdd(this: IObservedSet, value: IIndexable | Primitive): ReturnType<typeof nativeAdd> {
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
  o.callSubscribers('add', arguments, LifecycleFlags.isCollectionMutation);
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
    o.callSubscribers('clear', arguments, LifecycleFlags.isCollectionMutation);
  }
  return undefined;
}

// https://tc39.github.io/ecma262/#sec-set.prototype.delete
function observeDelete(this: IObservedSet, value: IIndexable | Primitive): ReturnType<typeof nativeDelete> {
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
  o.callSubscribers('delete', arguments, LifecycleFlags.isCollectionMutation);
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

export interface SetObserver extends ICollectionObserver<CollectionKind.set> {}

@collectionObserver(CollectionKind.set)
export class SetObserver implements SetObserver {
  public resetIndexMap: () => void;

  public collection: IObservedSet;

  constructor(lifecycle: ILifecycle, observedSet: IObservedSet) {
    this.lifecycle = lifecycle;
    observedSet.$observer = this;
    this.collection = observedSet;
    this.resetIndexMap();
  }
}

export function getSetObserver(lifecycle: ILifecycle, observedSet: IObservedSet): SetObserver {
  return (observedSet.$observer as SetObserver) || new SetObserver(lifecycle, observedSet);
}
