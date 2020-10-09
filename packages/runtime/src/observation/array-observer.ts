import { LifecycleFlags } from '../flags';
import { ILifecycle } from '../lifecycle';
import {
  CollectionKind,
  createIndexMap,
  ICollectionObserver,
  IndexMap,
  IObservedArray,
  ICollectionIndexObserver,
  ISubscriber,
  AccessorType
} from '../observation';
import {
  CollectionLengthObserver
} from './collection-length-observer';
import {
  collectionSubscriberCollection,
  subscriberCollection
} from './subscriber-collection';
import { ITask } from '@aurelia/scheduler';

const observerLookup = new WeakMap<unknown[], ArrayObserver>();

// https://tc39.github.io/ecma262/#sec-sortcompare
function sortCompare(x: unknown, y: unknown): number {
  if (x === y) {
    return 0;
  }
  x = x === null ? 'null' : (x as {}).toString();
  y = y === null ? 'null' : (y as {}).toString();
  return (x as {}) < (y as {}) ? -1 : 1;
}

function preSortCompare(x: unknown, y: unknown): number {
  if (x === void 0) {
    if (y === void 0) {
      return 0;
    } else {
      return 1;
    }
  }
  if (y === void 0) {
    return -1;
  }
  return 0;
}

function insertionSort(arr: IObservedArray, indexMap: IndexMap, from: number, to: number, compareFn: (a: unknown, b: unknown) => number): void {
  let velement, ielement, vtmp, itmp, order;
  let i, j;
  for (i = from + 1; i < to; i++) {
    velement = arr[i];
    ielement = indexMap[i];
    for (j = i - 1; j >= from; j--) {
      vtmp = arr[j];
      itmp = indexMap[j];
      order = compareFn(vtmp, velement);
      if (order > 0) {
        arr[j + 1] = vtmp;
        indexMap[j + 1] = itmp;
      } else {
        break;
      }
    }
    arr[j + 1] = velement;
    indexMap[j + 1] = ielement;
  }
}

function quickSort(arr: IObservedArray, indexMap: IndexMap, from: number, to: number, compareFn: (a: unknown, b: unknown) => number): void {
  let thirdIndex = 0, i = 0;
  let v0, v1, v2;
  let i0, i1, i2;
  let c01, c02, c12;
  let vtmp, itmp;
  let vpivot, ipivot, lowEnd, highStart;
  let velement, ielement, order, vtopElement;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (to - from <= 10) {
      insertionSort(arr, indexMap, from, to, compareFn);
      return;
    }

    thirdIndex = from + ((to - from) >> 1);
    v0 = arr[from];                i0 = indexMap[from];
    v1 = arr[to - 1];              i1 = indexMap[to - 1];
    v2 = arr[thirdIndex];          i2 = indexMap[thirdIndex];
    c01 = compareFn(v0, v1);
    if (c01 > 0) {
      vtmp = v0;                   itmp = i0;
      v0 = v1;                     i0 = i1;
      v1 = vtmp;                   i1 = itmp;
    }
    c02 = compareFn(v0, v2);
    if (c02 >= 0) {
      vtmp = v0;                   itmp = i0;
      v0 = v2;                     i0 = i2;
      v2 = v1;                     i2 = i1;
      v1 = vtmp;                   i1 = itmp;
    } else {
      c12 = compareFn(v1, v2);
      if (c12 > 0) {
        vtmp = v1;                 itmp = i1;
        v1 = v2;                   i1 = i2;
        v2 = vtmp;                 i2 = itmp;
      }
    }
    arr[from] = v0;                indexMap[from] = i0;
    arr[to - 1] = v2;              indexMap[to - 1] = i2;
    vpivot = v1;                   ipivot = i1;
    lowEnd = from + 1;
    highStart = to - 1;
    arr[thirdIndex] = arr[lowEnd]; indexMap[thirdIndex] = indexMap[lowEnd];
    arr[lowEnd] = vpivot;          indexMap[lowEnd] = ipivot;

    partition: for (i = lowEnd + 1; i < highStart; i++) {
      velement = arr[i];           ielement = indexMap[i];
      order = compareFn(velement, vpivot);
      if (order < 0) {
        arr[i] = arr[lowEnd];      indexMap[i] = indexMap[lowEnd];
        arr[lowEnd] = velement;    indexMap[lowEnd] = ielement;
        lowEnd++;
      } else if (order > 0) {
        do {
          highStart--;
          // eslint-disable-next-line eqeqeq
          if (highStart == i) {
            break partition;
          }
          vtopElement = arr[highStart]; order = compareFn(vtopElement, vpivot);
        } while (order > 0);
        arr[i] = arr[highStart];   indexMap[i] = indexMap[highStart];
        arr[highStart] = velement; indexMap[highStart] = ielement;
        if (order < 0) {
          velement = arr[i];       ielement = indexMap[i];
          arr[i] = arr[lowEnd];    indexMap[i] = indexMap[lowEnd];
          arr[lowEnd] = velement;  indexMap[lowEnd] = ielement;
          lowEnd++;
        }
      }
    }

    if (to - highStart < lowEnd - from) {
      quickSort(arr, indexMap, highStart, to, compareFn);
      to = lowEnd;
    } else {
      quickSort(arr, indexMap, from, lowEnd, compareFn);
      from = highStart;
    }
  }
}

const proto = Array.prototype as { [K in keyof any[]]: any[][K] & { observing?: boolean } };

const $push = proto.push;
const $unshift = proto.unshift;
const $pop = proto.pop;
const $shift = proto.shift;
const $splice = proto.splice;
const $reverse = proto.reverse;
const $sort = proto.sort;

const native = { push: $push, unshift: $unshift, pop: $pop, shift: $shift, splice: $splice, reverse: $reverse, sort: $sort };
const methods: ['push', 'unshift', 'pop', 'shift', 'splice', 'reverse', 'sort'] = ['push', 'unshift', 'pop', 'shift', 'splice', 'reverse', 'sort'];

const observe = {
  // https://tc39.github.io/ecma262/#sec-array.prototype.push
  push: function (this: IObservedArray, ...args: unknown[]): ReturnType<typeof Array.prototype.push> {
    let $this = this;
    if ($this.$raw !== void 0) {
      $this = $this.$raw;
    }
    const o = observerLookup.get($this);
    if (o === void 0) {
      return $push.apply($this, args);
    }
    const len = $this.length;
    const argCount = args.length;
    if (argCount === 0) {
      return len;
    }
    $this.length = o.indexMap.length = len + argCount;
    let i = len;
    while (i < $this.length) {
      $this[i] = args[i - len];
      o.indexMap[i] = - 2;
      i++;
    }
    o.notify();
    return $this.length;
  },
  // https://tc39.github.io/ecma262/#sec-array.prototype.unshift
  unshift: function (this: IObservedArray, ...args: unknown[]): ReturnType<typeof Array.prototype.unshift>  {
    let $this = this;
    if ($this.$raw !== void 0) {
      $this = $this.$raw;
    }
    const o = observerLookup.get($this);
    if (o === void 0) {
      return $unshift.apply($this, args);
    }
    const argCount = args.length;
    const inserts = new Array(argCount);
    let i = 0;
    while (i < argCount) {
      inserts[i++] = - 2;
    }
    $unshift.apply(o.indexMap, inserts);
    const len = $unshift.apply($this, args);
    o.notify();
    return len;
  },
  // https://tc39.github.io/ecma262/#sec-array.prototype.pop
  pop: function (this: IObservedArray): ReturnType<typeof Array.prototype.pop> {
    let $this = this;
    if ($this.$raw !== void 0) {
      $this = $this.$raw;
    }
    const o = observerLookup.get($this);
    if (o === void 0) {
      return $pop.call($this);
    }
    const indexMap = o.indexMap;
    const element = $pop.call($this);
    // only mark indices as deleted if they actually existed in the original array
    const index = indexMap.length - 1;
    if (indexMap[index] > -1) {
      indexMap.deletedItems.push(indexMap[index]);
    }
    $pop.call(indexMap);
    o.notify();
    return element;
  },
  // https://tc39.github.io/ecma262/#sec-array.prototype.shift
  shift: function (this: IObservedArray): ReturnType<typeof Array.prototype.shift> {
    let $this = this;
    if ($this.$raw !== void 0) {
      $this = $this.$raw;
    }
    const o = observerLookup.get($this);
    if (o === void 0) {
      return $shift.call($this);
    }
    const indexMap = o.indexMap;
    const element = $shift.call($this);
    // only mark indices as deleted if they actually existed in the original array
    if (indexMap[0] > -1) {
      indexMap.deletedItems.push(indexMap[0]);
    }
    $shift.call(indexMap);
    o.notify();
    return element;
  },
  // https://tc39.github.io/ecma262/#sec-array.prototype.splice
  splice: function (this: IObservedArray, ...args: [number, number, ...unknown[]]): ReturnType<typeof Array.prototype.splice> {
    const start: number = args[0];
    const deleteCount: number|undefined = args[1];
    let $this = this;
    if ($this.$raw !== void 0) {
      $this = $this.$raw;
    }
    const o = observerLookup.get($this);
    if (o === void 0) {
      return $splice.apply($this, args);
    }
    const len = this.length;
    const relativeStart = start | 0;
    const actualStart = relativeStart < 0 ? Math.max((len + relativeStart), 0) : Math.min(relativeStart, len);
    const indexMap = o.indexMap;
    const argCount = args.length;
    const actualDeleteCount = argCount === 0 ? 0 : argCount === 1 ? len - actualStart : deleteCount;
    if (actualDeleteCount > 0) {
      let i = actualStart;
      const to = i + actualDeleteCount;
      while (i < to) {
        if (indexMap[i] > -1) {
          indexMap.deletedItems.push(indexMap[i]);
        }
        i++;
      }
    }
    if (argCount > 2) {
      const itemCount = argCount - 2;
      const inserts = new Array(itemCount);
      let i = 0;
      while (i < itemCount) {
        inserts[i++] = - 2;
      }
      $splice.call(indexMap, start, deleteCount, ...inserts);
    } else {
      $splice.apply(indexMap, args);
    }
    const deleted = $splice.apply($this, args);
    o.notify();
    return deleted;
  },
  // https://tc39.github.io/ecma262/#sec-array.prototype.reverse
  reverse: function (this: IObservedArray): ReturnType<typeof Array.prototype.reverse> {
    let $this = this;
    if ($this.$raw !== void 0) {
      $this = $this.$raw;
    }
    const o = observerLookup.get($this);
    if (o === void 0) {
      $reverse.call($this);
      return this;
    }
    const len = $this.length;
    const middle = (len / 2) | 0;
    let lower = 0;
    while (lower !== middle) {
      const upper = len - lower - 1;
      const lowerValue = $this[lower];  const lowerIndex = o.indexMap[lower];
      const upperValue = $this[upper];  const upperIndex = o.indexMap[upper];
      $this[lower] = upperValue;        o.indexMap[lower] = upperIndex;
      $this[upper] = lowerValue;        o.indexMap[upper] = lowerIndex;
      lower++;
    }
    o.notify();
    return this;
  },
  // https://tc39.github.io/ecma262/#sec-array.prototype.sort
  // https://github.com/v8/v8/blob/master/src/js/array.js
  sort: function (this: IObservedArray, compareFn?: (a: unknown, b: unknown) => number): IObservedArray {
    let $this = this;
    if ($this.$raw !== void 0) {
      $this = $this.$raw;
    }
    const o = observerLookup.get($this);
    if (o === void 0) {
      $sort.call($this, compareFn);
      return this;
    }
    const len = $this.length;
    if (len < 2) {
      return this;
    }
    quickSort($this, o.indexMap, 0, len, preSortCompare);
    let i = 0;
    while (i < len) {
      if ($this[i] === void 0) {
        break;
      }
      i++;
    }
    if (compareFn === void 0 || typeof compareFn !== 'function'/* spec says throw a TypeError, should we do that too? */) {
      compareFn = sortCompare;
    }
    quickSort($this, o.indexMap, 0, i, compareFn);
    o.notify();
    return this;
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

let enableArrayObservationCalled = false;

export function enableArrayObservation(): void {
  for (const method of methods) {
    if (proto[method].observing !== true) {
      def(proto, method, { ...descriptorProps, value: observe[method] });
    }
  }
}

export function disableArrayObservation(): void {
  for (const method of methods) {
    if (proto[method].observing === true) {
      def(proto, method, { ...descriptorProps, value: native[method] });
    }
  }
}

export interface ArrayObserver extends ICollectionObserver<CollectionKind.array> {}

@collectionSubscriberCollection()
export class ArrayObserver {
  public inBatch: boolean;
  public type: AccessorType = AccessorType.Array;
  public task: ITask | null = null;

  private readonly indexObservers: Record<string | number, ArrayIndexObserver | undefined>;

  public constructor(flags: LifecycleFlags, lifecycle: ILifecycle, array: IObservedArray) {

    if (!enableArrayObservationCalled) {
      enableArrayObservationCalled = true;
      enableArrayObservation();
    }

    this.inBatch = false;
    this.indexObservers = {};

    this.collection = array;
    this.persistentFlags = flags & LifecycleFlags.persistentBindingFlags;
    this.indexMap = createIndexMap(array.length);
    this.lifecycle = lifecycle;
    this.lengthObserver = (void 0)!;

    observerLookup.set(array, this);
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

  public getLengthObserver(): CollectionLengthObserver {
    if (this.lengthObserver === void 0) {
      this.lengthObserver = new CollectionLengthObserver(this.collection);
    }
    return this.lengthObserver as CollectionLengthObserver;
  }

  public getIndexObserver(index: number): ICollectionIndexObserver {
    return this.getOrCreateIndexObserver(index);
  }

  public flushBatch(flags: LifecycleFlags): void {
    const indexMap = this.indexMap;
    const length = this.collection.length;

    this.inBatch = false;
    this.indexMap = createIndexMap(length);
    this.callCollectionSubscribers(indexMap, LifecycleFlags.updateTargetInstance | this.persistentFlags);
    if (this.lengthObserver !== void 0) {
      this.lengthObserver.setValue(length, LifecycleFlags.updateTargetInstance);
    }
  }

  /**
   * @internal used by friend class ArrayIndexObserver only
   */
  public addIndexObserver(indexObserver: ArrayIndexObserver): void {
    this.addCollectionSubscriber(indexObserver);
  }

  /**
   * @internal used by friend class ArrayIndexObserver only
   */
  public removeIndexObserver(indexObserver: ArrayIndexObserver): void {
    this.removeCollectionSubscriber(indexObserver);
  }

  /**
   * @internal
   */
  private getOrCreateIndexObserver(index: number): ICollectionIndexObserver {
    const indexObservers = this.indexObservers;
    let observer = indexObservers[index];
    if (observer === void 0) {
      observer = indexObservers[index] = new ArrayIndexObserver(this, index);
    }
    return observer;
  }
}

export interface ArrayIndexObserver extends ICollectionIndexObserver {}

@subscriberCollection()
export class ArrayIndexObserver implements ICollectionIndexObserver {

  private subscriberCount: number = 0;
  public currentValue: unknown;

  public constructor(
    public readonly owner: ArrayObserver,
    public readonly index: number
  ) {
    this.currentValue = this.getValue();
  }

  public getValue(): unknown {
    return this.owner.collection[this.index];
  }

  public setValue(newValue: unknown, flags: LifecycleFlags): void {
    if (newValue === this.getValue()) {
      return;
    }
    const arrayObserver = this.owner;
    const index = this.index;
    const indexMap = arrayObserver.indexMap;

    if (indexMap[index] > -1) {
      indexMap.deletedItems.push(indexMap[index]);
    }
    indexMap[index] = -2;
    // do not need to update current value here
    // as it will be updated inside handle collection change
    arrayObserver.collection[index] = newValue;
    arrayObserver.notify();
  }

  /**
   * From interface `ICollectionSubscriber`
   */
  public handleCollectionChange(indexMap: IndexMap, flags: LifecycleFlags): void {
    const index = this.index;
    const noChange = indexMap[index] === index;
    if (noChange) {
      return;
    }
    const prevValue = this.currentValue;
    const currValue = this.currentValue = this.getValue();
    // hmm
    if (prevValue !== currValue) {
      this.callSubscribers(currValue, prevValue, flags);
    }
  }

  public subscribe(subscriber: ISubscriber): void {
    if (this.addSubscriber(subscriber) && ++this.subscriberCount === 1) {
      this.owner.addIndexObserver(this);
    }
  }

  public unsubscribe(subscriber: ISubscriber): void {
    if (this.removeSubscriber(subscriber) && --this.subscriberCount === 0) {
      this.owner.removeIndexObserver(this);
    }
  }
}

export function getArrayObserver(flags: LifecycleFlags, lifecycle: ILifecycle, array: IObservedArray): ArrayObserver {
  const observer = observerLookup.get(array);
  if (observer === void 0) {
    return new ArrayObserver(flags, lifecycle, array);
  }
  return observer;
}

/**
 * Applies offsets to the non-negative indices in the IndexMap
 * based on added and deleted items relative to those indices.
 *
 * e.g. turn `[-2, 0, 1]` into `[-2, 1, 2]`, allowing the values at the indices to be
 * used for sorting/reordering items if needed
 */
export function applyMutationsToIndices(indexMap: IndexMap): void {
  let offset = 0;
  let j = 0;
  const len = indexMap.length;
  for (let i = 0; i < len; ++i) {
    while (indexMap.deletedItems[j] <= i - offset) {
      ++j;
      --offset;
    }
    if (indexMap[i] === -2) {
      ++offset;
    } else {
      indexMap[i] += offset;
    }
  }
}

/**
 * After `applyMutationsToIndices`, this function can be used to reorder items in a derived
 * array (e.g.  the items in the `views` in the repeater are derived from the `items` property)
 */
export function synchronizeIndices<T>(items: T[], indexMap: IndexMap): void {
  const copy = items.slice();

  const len = indexMap.length;
  let to = 0;
  let from = 0;
  while (to < len) {
    from = indexMap[to];
    if (from !== -2) {
      items[to] = copy[from];
    }
    ++to;
  }
}
