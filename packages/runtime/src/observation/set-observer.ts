import { createIndexMap, AccessorType, type ICollectionSubscriberCollection } from '../observation';
import { CollectionSizeObserver } from './collection-length-observer';
import { subscriberCollection } from './subscriber-collection';
import { def, defineMetadata, getOwnMetadata } from '../utilities-objects';
import { batching, addCollectionBatch } from './subscriber-batch';

import type {
  ICollectionObserver,
  CollectionKind,
} from '../observation';

// multiple applications of Aurelia wouldn't have different observers for the same Set object
const lookupMetadataKey = '__au_set_obs__';
const observerLookup = (() => {
  let lookup: WeakMap<Set<unknown>, SetObserver> = getOwnMetadata(lookupMetadataKey, Set);
  if (lookup == null) {
    defineMetadata(lookupMetadataKey, lookup = new WeakMap<Set<unknown>, SetObserver>(), Set);
  }
  return lookup;
})();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  add: function (this: Set<unknown>, value: unknown): ReturnType<typeof $add> {
    const o = observerLookup.get(this);
    if (o === undefined) {
      $add.call(this, value);
      return this;
    }
    const oldSize = this.size;
    $add.call(this, value);
    const newSize = this.size;
    if (newSize === oldSize) {
      return this;
    }
    o.indexMap[oldSize] = -2;
    o.notify();
    return this;
  },
  // https://tc39.github.io/ecma262/#sec-set.prototype.clear
  clear: function (this: Set<unknown>): ReturnType<typeof $clear>  {
    const o = observerLookup.get(this);
    if (o === undefined) {
      return $clear.call(this);
    }
    const size = this.size;
    if (size > 0) {
      const indexMap = o.indexMap;
      let i = 0;
      // deepscan-disable-next-line
      for (const key of this.keys()) {
        if (indexMap[i] > -1) {
          indexMap.deletedIndices.push(indexMap[i]);
          indexMap.deletedItems.push(key);
        }
        i++;
      }
      $clear.call(this);
      indexMap.length = 0;
      o.notify();
    }
    return undefined;
  },
  // https://tc39.github.io/ecma262/#sec-set.prototype.delete
  delete: function (this: Set<unknown>, value: unknown): ReturnType<typeof $delete> {
    const o = observerLookup.get(this);
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
          indexMap.deletedIndices.push(indexMap[i]);
          indexMap.deletedItems.push(entry);
        }
        indexMap.splice(i, 1);
        const deleteResult = $delete.call(this, value);
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

for (const method of methods) {
  def(observe[method], 'observing', { value: true, writable: false, configurable: false, enumerable: false });
}

let enableSetObservationCalled = false;

const observationEnabledKey = '__au_set_on__';
export function enableSetObservation(): void {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!(getOwnMetadata(observationEnabledKey, Set) ?? false)) {
    defineMetadata(observationEnabledKey, true, Set);
    for (const method of methods) {
      if (proto[method].observing !== true) {
        def(proto, method, { ...descriptorProps, value: observe[method] });
      }
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

export interface SetObserver extends ICollectionObserver<CollectionKind.set>, ICollectionSubscriberCollection {}

export class SetObserver {
  public type: AccessorType = AccessorType.Set;
  private lenObs?: CollectionSizeObserver;

  public constructor(observedSet: Set<unknown>) {

    if (!enableSetObservationCalled) {
      enableSetObservationCalled = true;
      enableSetObservation();
    }

    this.collection = observedSet;
    this.indexMap = createIndexMap(observedSet.size);
    this.lenObs = void 0;

    observerLookup.set(observedSet, this);
  }

  public notify(): void {
    const subs = this.subs;
    const indexMap = this.indexMap;
    if (batching) {
      addCollectionBatch(subs, indexMap);
      return;
    }

    const size = this.collection.size;

    this.indexMap = createIndexMap(size);
    this.subs.notifyCollection(indexMap);
  }

  public getLengthObserver(): CollectionSizeObserver {
    return this.lenObs ??= new CollectionSizeObserver(this);
  }
}

subscriberCollection(SetObserver);

export function getSetObserver(observedSet: Set<unknown>): SetObserver {
  let observer = observerLookup.get(observedSet);
  if (observer === void 0) {
    observer = new SetObserver(observedSet);
  }
  return observer;
}
