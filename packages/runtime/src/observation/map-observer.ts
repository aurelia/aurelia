import { Tracer } from '@aurelia/kernel';
import { LifecycleFlags } from '../flags';
import { ILifecycle } from '../lifecycle';
import { CollectionKind, ICollectionObserver, IObservedMap } from '../observation';
import { collectionObserver } from './collection-observer';

const proto = Map.prototype;

const $set = proto.set;
const $clear = proto.clear;
const $delete = proto.delete;

const native = { set: $set, clear: $clear, delete: $delete };
const methods = ['set', 'clear', 'delete'];

// note: we can't really do much with Map due to the internal data structure not being accessible so we're just using the native calls
// fortunately, map/delete/clear are easy to reconstruct for the indexMap

const observe = {
  // https://tc39.github.io/ecma262/#sec-map.prototype.map
  set: function(this: IObservedMap, key: unknown, value: unknown): ReturnType<typeof $set> {
    let $this = this;
    if ($this.$raw !== undefined) {
      $this = $this.$raw;
    }
    const o = $this.$observer;
    if (o === undefined) {
      $set.call($this, key, value);
      return this;
    }
    const oldSize = $this.size;
    $set.call($this, key, value);
    const newSize = $this.size;
    if (newSize === oldSize) {
      let i = 0;
      for (const entry of $this.entries()) {
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
    o.callSubscribers('set', arguments, o.persistentFlags | LifecycleFlags.isCollectionMutation);
    return this;
  },
  // https://tc39.github.io/ecma262/#sec-map.prototype.clear
  clear: function(this: IObservedMap): ReturnType<typeof $clear>  {
    let $this = this;
    if ($this.$raw !== undefined) {
      $this = $this.$raw;
    }
    const o = $this.$observer;
    if (o === undefined) {
      return $clear.call($this);
    }
    const size = $this.size;
    if (size > 0) {
      const indexMap = o.indexMap;
      let i = 0;
      for (const entry of $this.keys()) {
        if (indexMap[i] > -1) {
          indexMap.deletedItems.push(indexMap[i]);
        }
        i++;
      }
      $clear.call($this);
      indexMap.length = 0;
      o.callSubscribers('clear', arguments, o.persistentFlags | LifecycleFlags.isCollectionMutation);
    }
    return undefined;
  },
  // https://tc39.github.io/ecma262/#sec-map.prototype.delete
  delete: function(this: IObservedMap, value: unknown): ReturnType<typeof $delete> {
    let $this = this;
    if ($this.$raw !== undefined) {
      $this = $this.$raw;
    }
    const o = $this.$observer;
    if (o === undefined) {
      return $delete.call($this, value);
    }
    const size = $this.size;
    if (size === 0) {
      return false;
    }
    let i = 0;
    const indexMap = o.indexMap;
    for (const entry of $this.keys()) {
      if (entry === value) {
        if (indexMap[i] > -1) {
          indexMap.deletedItems.push(indexMap[i]);
        }
        indexMap.splice(i, 1);
        return $delete.call($this, value);
      }
      i++;
    }
    o.callSubscribers('delete', arguments, o.persistentFlags | LifecycleFlags.isCollectionMutation);
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

export function enableMapObservation(): void {
  for (const method of methods) {
    if (proto[method].observing !== true) {
      def(proto, method, { ...descriptorProps, value: observe[method] });
    }
  }
}

enableMapObservation();

export function disableMapObservation(): void {
  for (const method of methods) {
    if (proto[method].observing === true) {
      def(proto, method, { ...descriptorProps, value: native[method] });
    }
  }
}

const slice = Array.prototype.slice;

export interface MapObserver extends ICollectionObserver<CollectionKind.map> {}

@collectionObserver(CollectionKind.map)
export class MapObserver implements MapObserver {
  public resetIndexMap: () => void;
  public lifecycle: ILifecycle;

  public collection: IObservedMap;
  public readonly flags: LifecycleFlags;

  constructor(flags: LifecycleFlags, lifecycle: ILifecycle, map: IObservedMap) {
    if (Tracer.enabled) { Tracer.enter('MapObserver.constructor', slice.call(arguments)); }
    this.lifecycle = lifecycle;
    map.$observer = this;
    this.collection = map;
    this.flags = flags & LifecycleFlags.persistentBindingFlags;
    this.resetIndexMap();
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

export function getMapObserver(flags: LifecycleFlags, lifecycle: ILifecycle, map: IObservedMap): MapObserver {
  return (map.$observer as MapObserver) || new MapObserver(flags, lifecycle, map);
}
