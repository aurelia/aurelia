import { LifecycleFlags } from '../flags';
import { ILifecycle } from '../lifecycle';
import { CollectionKind, createIndexMap, ICollectionObserver, IObservedSet } from '../observation';
import { CollectionSizeObserver } from './collection-size-observer';
import { collectionSubscriberCollection } from './subscriber-collection';

const proto = Set.prototype as { [K in keyof Set<any>]: Set<any>[K] & { observing?: boolean } };

const $add = proto.add;
const $clear = proto.clear;
const $delete = proto.delete;

const native = { add: $add, clear: $clear, delete: $delete };
const methods: ['add', 'clear', 'delete'] = ['add', 'clear', 'delete'];

// note: we can't really do much with Set due to the internal data structure not being accessible so we're just using the native calls
// fortunately, add/delete/clear are easy to reconstruct for the indexMap

const observe = {
  // https://tc39.github.io/ecma262/#sec-set.prototype.add
  add: function(this: IObservedSet, value: unknown): ReturnType<typeof $add> {
    let $this = this;
    if ($this.$raw !== undefined) {
      $this = $this.$raw;
    }
    const o = $this.$observer;
    if (o === undefined) {
      $add.call($this, value);
      return this;
    }
    const oldSize = $this.size;
    $add.call($this, value);
    const newSize = $this.size;
    if (newSize === oldSize) {
      return this;
    }
    o.indexMap[oldSize] = -2;
    o.notify();
    return this;
  },
  // https://tc39.github.io/ecma262/#sec-set.prototype.clear
  clear: function(this: IObservedSet): ReturnType<typeof $clear>  {
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
  // https://tc39.github.io/ecma262/#sec-set.prototype.delete
  delete: function(this: IObservedSet, value: unknown): ReturnType<typeof $delete> {
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
      i++;
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

let enableSetObservationCalled = false;

export function enableSetObservation(): void {
  for (const method of methods) {
    if (proto[method].observing !== true) {
      def(proto, method, { ...descriptorProps, value: observe[method] });
    }
  }
}

export function disableSetObservation(): void {
  for (const method of methods) {
    if (proto[method].observing === true) {
      def(proto, method, { ...descriptorProps, value: native[method] });
    }
  }
}

const slice = Array.prototype.slice;

export interface SetObserver extends ICollectionObserver<CollectionKind.set> {}

@collectionSubscriberCollection()
export class SetObserver {
  public inBatch: boolean;

  public constructor(flags: LifecycleFlags, lifecycle: ILifecycle, observedSet: IObservedSet) {

    if (!enableSetObservationCalled) {
      enableSetObservationCalled = true;
      enableSetObservation();
    }

    this.inBatch = false;

    this.collection = observedSet;
    this.persistentFlags = flags & LifecycleFlags.persistentBindingFlags;
    this.indexMap = createIndexMap(observedSet.size);
    this.lifecycle = lifecycle;
    this.lengthObserver = (void 0)!;

    observedSet.$observer = this;

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

export function getSetObserver(flags: LifecycleFlags, lifecycle: ILifecycle, observedSet: IObservedSet): SetObserver {
  if (observedSet.$observer === void 0) {
    observedSet.$observer = new SetObserver(flags, lifecycle, observedSet);
  }
  return observedSet.$observer;
}
