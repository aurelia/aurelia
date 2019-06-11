import { Tracer } from '@aurelia/kernel';
import { LifecycleFlags } from '../flags';
import { ILifecycle } from '../lifecycle';
import {
  CollectionKind,
  createIndexMap,
  ICollectionObserver,
  IndexMap,
  IObservedArray
} from '../observation';
import { CollectionLengthObserver } from './collection-length-observer';
import { collectionSubscriberCollection } from './subscriber-collection';

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

// tslint:disable-next-line:cognitive-complexity
function quickSort(arr: IObservedArray, indexMap: IndexMap, from: number, to: number, compareFn: (a: unknown, b: unknown) => number): void {
  let thirdIndex = 0, i = 0;
  let v0, v1, v2;
  let i0, i1, i2;
  let c01, c02, c12;
  let vtmp, itmp;
  let vpivot, ipivot, lowEnd, highStart;
  let velement, ielement, order, vtopElement;

  // tslint:disable-next-line:no-constant-condition
  while (true) {
    if (to - from <= 10) {
      insertionSort(arr, indexMap, from, to, compareFn);
      return;
    }

    // tslint:disable:no-statements-same-line
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
          // tslint:disable-next-line:triple-equals
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
    // tslint:enable:no-statements-same-line

    if (to - highStart < lowEnd - from) {
      quickSort(arr, indexMap, highStart, to, compareFn);
      to = lowEnd;
    } else {
      quickSort(arr, indexMap, from, lowEnd, compareFn);
      from = highStart;
    }
  }
}

const proto = Array.prototype as { [K in keyof Array<any>]: Array<any>[K] & { observing?: boolean } };

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
  push: function(this: IObservedArray): ReturnType<typeof Array.prototype.push> {
    let $this = this;
    if ($this.$raw !== void 0) {
      $this = $this.$raw;
    }
    const o = $this.$observer;
    if (o === void 0) {
      return $push.apply($this, arguments as IArguments & unknown[]);
    }
    const len = $this.length;
    const argCount = arguments.length;
    if (argCount === 0) {
      return len;
    }
    $this.length = o.indexMap.length = len + argCount;
    let i = len;
    while (i < $this.length) {
      $this[i] = arguments[i - len];
      o.indexMap[i] = - 2;
      i++;
    }
    o.notify();
    return $this.length;
  },
  // https://tc39.github.io/ecma262/#sec-array.prototype.unshift
  unshift: function(this: IObservedArray): ReturnType<typeof Array.prototype.unshift>  {
    let $this = this;
    if ($this.$raw !== void 0) {
      $this = $this.$raw;
    }
    const o = $this.$observer;
    if (o === void 0) {
      return $unshift.apply($this, arguments as IArguments & unknown[]);
    }
    const argCount = arguments.length;
    const inserts = new Array(argCount);
    let i = 0;
    while (i < argCount) {
      inserts[i++] = - 2;
    }
    $unshift.apply(o.indexMap, inserts);
    const len = $unshift.apply($this, arguments as IArguments & unknown[]);
    o.notify();
    return len;
  },
  // https://tc39.github.io/ecma262/#sec-array.prototype.pop
  pop: function(this: IObservedArray): ReturnType<typeof Array.prototype.pop> {
    let $this = this;
    if ($this.$raw !== void 0) {
      $this = $this.$raw;
    }
    const o = $this.$observer;
    if (o === void 0) {
      return $pop.call($this);
    }
    const indexMap = o.indexMap;
    const element = $pop.call($this);
    // only mark indices as deleted if they actually existed in the original array
    const index = indexMap.length - 1;
    if (indexMap[index] > -1) {
      indexMap.deletedItems!.push(indexMap[index]);
    }
    $pop.call(indexMap);
    o.notify();
    return element;
  },
  // https://tc39.github.io/ecma262/#sec-array.prototype.shift
  shift: function(this: IObservedArray): ReturnType<typeof Array.prototype.shift> {
    let $this = this;
    if ($this.$raw !== void 0) {
      $this = $this.$raw;
    }
    const o = $this.$observer;
    if (o === void 0) {
      return $shift.call($this);
    }
    const indexMap = o.indexMap;
    const element = $shift.call($this);
    // only mark indices as deleted if they actually existed in the original array
    if (indexMap[0] > -1) {
      indexMap.deletedItems!.push(indexMap[0]);
    }
    $shift.call(indexMap);
    o.notify();
    return element;
  },
  // https://tc39.github.io/ecma262/#sec-array.prototype.splice
  splice: function(this: IObservedArray, start: number, deleteCount?: number): ReturnType<typeof Array.prototype.splice> {
    let $this = this;
    if ($this.$raw !== void 0) {
      $this = $this.$raw;
    }
    const o = $this.$observer;
    if (o === void 0) {
      return $splice.apply($this, arguments as IArguments & [number, number, ...any[]]);
    }
    const indexMap = o.indexMap;
    if (deleteCount! > 0) {
      let i = isNaN(start) ? 0 : start;
      const to = i + deleteCount!;
      while (i < to) {
        if (indexMap[i] > -1) {
          indexMap.deletedItems!.push(indexMap[i]);
        }
        i++;
      }
    }
    const argCount = arguments.length;
    if (argCount > 2) {
      const itemCount = argCount - 2;
      const inserts = new Array(itemCount);
      let i = 0;
      while (i < itemCount) {
        inserts[i++] = - 2;
      }
      $splice.call(indexMap, start, deleteCount!, ...inserts);
    } else if (argCount === 2) {
      $splice.call(indexMap, start, deleteCount!);
    }
    const deleted = $splice.apply($this, arguments as IArguments & [number, number, ...any[]]);
    o.notify();
    return deleted;
  },
  // https://tc39.github.io/ecma262/#sec-array.prototype.reverse
  reverse: function(this: IObservedArray): ReturnType<typeof Array.prototype.reverse> {
    let $this = this;
    if ($this.$raw !== void 0) {
      $this = $this.$raw;
    }
    const o = $this.$observer;
    if (o === void 0) {
      $reverse.call($this);
      return this;
    }
    const len = $this.length;
    const middle = (len / 2) | 0;
    let lower = 0;
    // tslint:disable:no-statements-same-line
    while (lower !== middle) {
      const upper = len - lower - 1;
      const lowerValue = $this[lower];  const lowerIndex = o.indexMap[lower];
      const upperValue = $this[upper];  const upperIndex = o.indexMap[upper];
      $this[lower] = upperValue;        o.indexMap[lower] = upperIndex;
      $this[upper] = lowerValue;        o.indexMap[upper] = lowerIndex;
      lower++;
    }
    // tslint:enable:no-statements-same-line
    o.notify();
    return this;
  },
  // https://tc39.github.io/ecma262/#sec-array.prototype.sort
  // https://github.com/v8/v8/blob/master/src/js/array.js
  sort: function(this: IObservedArray, compareFn?: (a: unknown, b: unknown) => number): IObservedArray {
    let $this = this;
    if ($this.$raw !== void 0) {
      $this = $this.$raw;
    }
    const o = $this.$observer;
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
    if (compareFn === void 0 || typeof compareFn !== 'function'/*spec says throw a TypeError, should we do that too?*/) {
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

const slice = Array.prototype.slice;

export interface ArrayObserver extends ICollectionObserver<CollectionKind.array> {}

@collectionSubscriberCollection()
export class ArrayObserver {
  public inBatch: boolean;

  constructor(flags: LifecycleFlags, lifecycle: ILifecycle, array: IObservedArray) {
    if (Tracer.enabled) { Tracer.enter('ArrayObserver', 'constructor', slice.call(arguments)); }

    if (!enableArrayObservationCalled) {
      enableArrayObservationCalled = true;
      enableArrayObservation();
    }

    this.inBatch = false;

    this.collection = array;
    this.persistentFlags = flags & LifecycleFlags.persistentBindingFlags;
    this.indexMap = createIndexMap(array.length);
    this.lifecycle = lifecycle;
    this.lengthObserver = (void 0)!;

    Reflect.defineProperty(
      array,
      '$observer',
      {
        value: this,
        enumerable: false,
        writable: true,
        configurable: true,
      },
    );

    if (Tracer.enabled) { Tracer.leave(); }
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
    return this.lengthObserver;
  }

  public flushBatch(flags: LifecycleFlags): void {
    this.inBatch = false;
    const { indexMap, collection } = this;
    const { length } = collection;
    this.indexMap = createIndexMap(length);
    this.callCollectionSubscribers(indexMap, LifecycleFlags.updateTargetInstance | this.persistentFlags);
    if (this.lengthObserver !== void 0) {
      this.lengthObserver.setValue(length, LifecycleFlags.updateTargetInstance);
    }
  }
}

export function getArrayObserver(flags: LifecycleFlags, lifecycle: ILifecycle, array: IObservedArray): ArrayObserver {
  if (array.$observer === void 0) {
    array.$observer = new ArrayObserver(flags, lifecycle, array);
  }
  return array.$observer;
}
