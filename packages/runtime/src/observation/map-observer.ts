import { LifecycleFlags } from '../flags';
import { ILifecycle } from '../lifecycle';
import {
  CollectionKind,
  createIndexMap,
  ICollectionObserver,
  IObservedMap
} from '../observation';
import { CollectionSizeObserver } from './collection-size-observer';
import { collectionSubscriberCollection } from './subscriber-collection';

const proto = Map.prototype as { [K in keyof Map<any, any>]: Map<any, any>[K] & { observing?: boolean } };

const $set = proto.set;
const $clear = proto.clear;
const $delete = proto.delete;

const native = { set: $set, clear: $clear, delete: $delete };
const methods: ['set', 'clear', 'delete'] = ['set', 'clear', 'delete'];

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
    const oldValue = $this.get(key);
    const oldSize = $this.size;
    $set.call($this, key, value);
    const newSize = $this.size;
    if (newSize === oldSize) {
      let i = 0;
      for (const entry of $this.entries()) {
        if (entry[0] === key) {
          if (entry[1] !== oldValue) {
            o.indexMap.deletedItems.push(o.indexMap[i]);
            o.indexMap[i] = -2;
            o.notify();
          }
          return this;
        }
        i++;
      }
      return this;
    }
    o.indexMap[oldSize] = -2;
    o.notify();
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
      o.notify();
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
        const deleteResult = $delete.call($this, value);
        if (deleteResult === true) {
          o.notify();
        }
        return deleteResult;
      }
      ++i;
    }
    return false;
  }
};

const descriptorProps = {
  writable: true,
  enumerable: false,
  configurable: true
};

const def = Reflect.defineProperty;

for (const method of methods) {
  def(observe[method], 'observing', { value: true, writable: false, configurable: false, enumerable: false });
}

let enableMapObservationCalled = false;

export function enableMapObservation(): void {
  for (const method of methods) {
    if (proto[method].observing !== true) {
      def(proto, method, { ...descriptorProps, value: observe[method] });
    }
  }
}

export function disableMapObservation(): void {
  for (const method of methods) {
    if (proto[method].observing === true) {
      def(proto, method, { ...descriptorProps, value: native[method] });
    }
  }
}

const slice = Array.prototype.slice;

export interface MapObserver extends ICollectionObserver<CollectionKind.map> {}

@collectionSubscriberCollection()
export class MapObserver {
  public inBatch: boolean;

  public constructor(flags: LifecycleFlags, lifecycle: ILifecycle, map: IObservedMap) {

    if (!enableMapObservationCalled) {
      enableMapObservationCalled = true;
      enableMapObservation();
    }

    this.inBatch = false;

    this.collection = map;
    this.persistentFlags = flags & LifecycleFlags.persistentBindingFlags;
    this.indexMap = createIndexMap(map.size);
    this.lifecycle = lifecycle;
    this.lengthObserver = (void 0)!;

    map.$observer = this;

  }

  public notify(): void {
    if (this.lifecycle.batch.depth > 0) {
      if (!this.inBatch) {
        this.inBatch = true;
        this.lifecycle.batch.add(this);
      }
    } else {
      this.flushBatch(LifecycleFlags.none);
    }
  }

  public getLengthObserver(): CollectionSizeObserver {
    if (this.lengthObserver === void 0) {
      this.lengthObserver = new CollectionSizeObserver(this.collection);
    }
    return this.lengthObserver;
  }

  public flushBatch(flags: LifecycleFlags): void {
    this.inBatch = false;
    const { indexMap, collection } = this;
    const { size } = collection;
    this.indexMap = createIndexMap(size);
    this.callCollectionSubscribers(indexMap, LifecycleFlags.updateTargetInstance | this.persistentFlags);
    if (this.lengthObserver !== void 0) {
      this.lengthObserver.setValue(size, LifecycleFlags.updateTargetInstance);
    }
  }
}

export function getMapObserver(flags: LifecycleFlags, lifecycle: ILifecycle, map: IObservedMap): MapObserver {
  if (map.$observer === void 0) {
    map.$observer = new MapObserver(flags, lifecycle, map);
  }
  return map.$observer;
}
