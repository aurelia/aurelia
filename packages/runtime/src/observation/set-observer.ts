import { ILifecycle } from '../lifecycle';
import { CollectionKind, ICollectionObserver, IObservedSet, LifecycleFlags } from '../observation';
import { collectionObserver } from './collection-observer';

const proto = Set.prototype;

const $add = proto.add;
const $clear = proto.clear;
const $delete = proto.delete;

const native = { add: $add, clear: $clear, delete: $delete };
const methods = ['add', 'clear', 'delete'];

// note: we can't really do much with Set due to the internal data structure not being accessible so we're just using the native calls
// fortunately, add/delete/clear are easy to reconstruct for the indexMap

const observe = {
  // https://tc39.github.io/ecma262/#sec-set.prototype.add
  add: function(this: IObservedSet, value: unknown): ReturnType<typeof $add> {
    const o = this.$observer;
    if (o === undefined) {
      return $add.call(this, value);
    }
    const oldSize = this.size;
    $add.call(this, value);
    const newSize = this.size;
    if (newSize === oldSize) {
      return this;
    }
    o.indexMap[oldSize] = -2;
    o.callSubscribers('add', arguments, LifecycleFlags.isCollectionMutation);
    return this;
  },
  // https://tc39.github.io/ecma262/#sec-set.prototype.clear
  clear: function(this: IObservedSet): ReturnType<typeof $clear>  {
    const o = this.$observer;
    if (o === undefined) {
      return $clear.call(this);
    }
    const size = this.size;
    if (size > 0) {
      const indexMap = o.indexMap;
      let i = 0;
      for (const entry of this.keys()) {
        if (indexMap[i] > -1) {
        indexMap.deletedItems.push(entry);
        }
        i++;
      }
      $clear.call(this);
      indexMap.length = 0;
      o.callSubscribers('clear', arguments, LifecycleFlags.isCollectionMutation);
    }
    return undefined;
  },
  // https://tc39.github.io/ecma262/#sec-set.prototype.delete
  delete: function(this: IObservedSet, value: unknown): ReturnType<typeof $delete> {
    const o = this.$observer;
    if (o === undefined) {
      return $delete.call(this, value);
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
          indexMap.deletedItems.push(entry);
        }
        indexMap.splice(i, 1);
        return $delete.call(this, value);
      }
      i++;
    }
    o.callSubscribers('delete', arguments, LifecycleFlags.isCollectionMutation);
    return false;
  }
};

const descriptorProps = {
  writable: true,
  enumerable: false,
  configurable: true
};

const def = Object.defineProperty;

for (const method of methods) {
  def(observe[method], 'observing', { value: true, writable: false, configurable: false, enumerable: false });
}

export function enableSetObservation(): void {
  for (const method of methods) {
    if (proto[method].observing !== true) {
      def(proto, method, { ...descriptorProps, value: observe[method] });
    }
  }
}

enableSetObservation();

export function disableSetObservation(): void {
  for (const method of methods) {
    if (proto[method].observing === true) {
      def(proto, method, { ...descriptorProps, value: native[method] });
    }
  }
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
