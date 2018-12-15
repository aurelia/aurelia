import { IIndexable, Primitive } from '../../kernel';
import { ILifecycle } from '../lifecycle';
import { CollectionKind, ICollectionObserver, IndexMap, IObservedArray, LifecycleFlags } from '../observation';
import { collectionObserver } from './collection-observer';
const proto = Array.prototype;
export const nativePush = proto.push; // TODO: probably want to make these internal again
export const nativeUnshift = proto.unshift;
export const nativePop = proto.pop;
export const nativeShift = proto.shift;
export const nativeSplice = proto.splice;
export const nativeReverse = proto.reverse;
export const nativeSort = proto.sort;

// https://tc39.github.io/ecma262/#sec-array.prototype.push
function observePush(this: IObservedArray): ReturnType<typeof nativePush> {
  const o = this.$observer;
  if (o === undefined) {
    return nativePush.apply(this, arguments);
  }
  const len = this.length;
  const argCount = arguments.length;
  if (argCount === 0) {
    return len;
  }
  this.length = o.indexMap.length = len + argCount;
  let i = len;
  while (i < this.length) {
    this[i] = arguments[i - len]; o.indexMap[i] = - 2;
    i++;
  }
  o.callSubscribers('push', arguments, LifecycleFlags.isCollectionMutation);
  return this.length;
}

// https://tc39.github.io/ecma262/#sec-array.prototype.unshift
function observeUnshift(this: IObservedArray): ReturnType<typeof nativeUnshift>  {
  const o = this.$observer;
  if (o === undefined) {
    return nativeUnshift.apply(this, arguments);
  }
  const argCount = arguments.length;
  const inserts = new Array(argCount);
  let i = 0;
  while (i < argCount) {
    inserts[i++] = - 2;
  }
  nativeUnshift.apply(o.indexMap, inserts);
  const len = nativeUnshift.apply(this, arguments);
  o.callSubscribers('unshift', arguments, LifecycleFlags.isCollectionMutation);
  return len;
}

// https://tc39.github.io/ecma262/#sec-array.prototype.pop
function observePop(this: IObservedArray): ReturnType<typeof nativePop> {
  const o = this.$observer;
  if (o === undefined) {
    return nativePop.call(this);
  }
  const indexMap = o.indexMap;
  const element = nativePop.call(this);
  // only mark indices as deleted if they actually existed in the original array
  const index = indexMap.length - 1;
  if (indexMap[index] > -1) {
    nativePush.call(indexMap.deletedItems, element);
  }
  nativePop.call(indexMap);
  o.callSubscribers('pop', arguments, LifecycleFlags.isCollectionMutation);
  return element;
}

// https://tc39.github.io/ecma262/#sec-array.prototype.shift
function observeShift(this: IObservedArray): ReturnType<typeof nativeShift> {
  const o = this.$observer;
  if (o === undefined) {
    return nativeShift.call(this);
  }
  const indexMap = o.indexMap;
  const element = nativeShift.call(this);
  // only mark indices as deleted if they actually existed in the original array
  if (indexMap[0] > -1) {
    nativePush.call(indexMap.deletedItems, element);
  }
  nativeShift.call(indexMap);
  o.callSubscribers('shift', arguments, LifecycleFlags.isCollectionMutation);
  return element;
}

// https://tc39.github.io/ecma262/#sec-array.prototype.splice
function observeSplice(this: IObservedArray, start: number, deleteCount?: number): ReturnType<typeof nativeSplice> {
  const o = this.$observer;
  if (o === undefined) {
    return nativeSplice.apply(this, arguments);
  }
  const indexMap = o.indexMap;
  if (deleteCount > 0) {
    let i = isNaN(start) ? 0 : start;
    const to = i + deleteCount;
    while (i < to) {
      if (indexMap[i] > -1) {
        nativePush.call(indexMap.deletedItems, this[i]);
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
    nativeSplice.call(indexMap, start, deleteCount, ...inserts);
  } else if (argCount === 2) {
    nativeSplice.call(indexMap, start, deleteCount);
  }
  const deleted = nativeSplice.apply(this, arguments);
  o.callSubscribers('splice', arguments, LifecycleFlags.isCollectionMutation);
  return deleted;
}

// https://tc39.github.io/ecma262/#sec-array.prototype.reverse
function observeReverse(this: IObservedArray): ReturnType<typeof nativeReverse> {
  const o = this.$observer;
  if (o === undefined) {
    return nativeReverse.call(this);
  }
  const len = this.length;
  const middle = (len / 2) | 0;
  let lower = 0;
  while (lower !== middle) {
    const upper = len - lower - 1;
    const lowerValue = this[lower]; const lowerIndex = o.indexMap[lower];
    const upperValue = this[upper]; const upperIndex = o.indexMap[upper];
    this[lower] = upperValue; o.indexMap[lower] = upperIndex;
    this[upper] = lowerValue; o.indexMap[upper] = lowerIndex;
    lower++;
  }
  o.callSubscribers('reverse', arguments, LifecycleFlags.isCollectionMutation);
  return this;
}

// https://tc39.github.io/ecma262/#sec-array.prototype.sort
// https://github.com/v8/v8/blob/master/src/js/array.js
function observeSort(this: IObservedArray, compareFn?: (a: IIndexable | Primitive, b: IIndexable | Primitive) => number): IObservedArray {
  const o = this.$observer;
  if (o === undefined) {
    return nativeSort.call(this, compareFn);
  }
  const len = this.length;
  if (len < 2) {
    return this;
  }
  quickSort(this, o.indexMap, 0, len, preSortCompare);
  let i = 0;
  while (i < len) {
    if (this[i] === undefined) {
      break;
    }
    i++;
  }
  if (compareFn === undefined || typeof compareFn !== 'function'/*spec says throw a TypeError, should we do that too?*/) {
    compareFn = sortCompare;
  }
  quickSort(this, o.indexMap, 0, i, compareFn);
  o.callSubscribers('sort', arguments, LifecycleFlags.isCollectionMutation);
  return this;
}

// https://tc39.github.io/ecma262/#sec-sortcompare
function sortCompare(x: IIndexable | Primitive, y: IIndexable | Primitive): number {
  if (x === y) {
    return 0;
  }
  x = x === null ? 'null' : x.toString();
  y = y === null ? 'null' : y.toString();
  return x < y ? -1 : 1;
}

function preSortCompare(x: IIndexable | Primitive, y: IIndexable | Primitive): number {
  if (x === undefined) {
    if (y === undefined) {
      return 0;
    } else {
      return 1;
    }
  }
  if (y === undefined) {
    return -1;
  }
  return 0;
}

function insertionSort(arr: IObservedArray, indexMap: IndexMap, fromIndex: number, toIndex: number, compareFn: (a: IIndexable | Primitive, b: IIndexable | Primitive) => number): void {
  let velement, ielement, vtmp, itmp, order;
  let i, j;
  for (i = fromIndex + 1; i < toIndex; i++) {
    velement = arr[i]; ielement = indexMap[i];
    for (j = i - 1; j >= fromIndex; j--) {
      vtmp = arr[j]; itmp = indexMap[j];
      order = compareFn(vtmp, velement);
      if (order > 0) {
        arr[j + 1] = vtmp; indexMap[j + 1] = itmp;
      } else {
        break;
      }
    }
    arr[j + 1] = velement; indexMap[j + 1] = ielement;
  }
}

function quickSort(arr: IObservedArray, indexMap: IndexMap, fromIndex: number, toIndex: number, compareFn: (a: IIndexable | Primitive, b: IIndexable | Primitive) => number): void {
  let thirdIndex = 0, i = 0;
  let v0, v1, v2;
  let i0, i1, i2;
  let c01, c02, c12;
  let vtmp, itmp;
  let vpivot, ipivot, lowEnd, highStart;
  let velement, ielement, order, vtopElement;

  // tslint:disable-next-line:no-constant-condition
  while (true) {
    if (toIndex - fromIndex <= 10) {
      insertionSort(arr, indexMap, fromIndex, toIndex, compareFn);
      return;
    }

    thirdIndex = fromIndex + ((toIndex - fromIndex) >> 1);
    v0 = arr[fromIndex];       i0 = indexMap[fromIndex];
    v1 = arr[toIndex - 1];     i1 = indexMap[toIndex - 1];
    v2 = arr[thirdIndex]; i2 = indexMap[thirdIndex];
    c01 = compareFn(v0, v1);
    if (c01 > 0) {
      vtmp = v0; itmp = i0;
      v0 = v1;   i0 = i1;
      v1 = vtmp; i1 = itmp;
    }
    c02 = compareFn(v0, v2);
    if (c02 >= 0) {
      vtmp = v0; itmp = i0;
      v0 = v2;   i0 = i2;
      v2 = v1;   i2 = i1;
      v1 = vtmp; i1 = itmp;
    } else {
      c12 = compareFn(v1, v2);
      if (c12 > 0) {
        vtmp = v1; itmp = i1;
        v1 = v2;   i1 = i2;
        v2 = vtmp; i2 = itmp;
      }
    }
    arr[fromIndex] = v0;   indexMap[fromIndex] = i0;
    arr[toIndex - 1] = v2; indexMap[toIndex - 1] = i2;
    vpivot = v1;      ipivot = i1;
    lowEnd = fromIndex + 1;
    highStart = toIndex - 1;
    arr[thirdIndex] = arr[lowEnd]; indexMap[thirdIndex] = indexMap[lowEnd];
    arr[lowEnd] = vpivot;          indexMap[lowEnd] = ipivot;

    partition: for (i = lowEnd + 1; i < highStart; i++) {
      velement = arr[i]; ielement = indexMap[i];
      order = compareFn(velement, vpivot);
      if (order < 0) {
        arr[i] = arr[lowEnd];   indexMap[i] = indexMap[lowEnd];
        arr[lowEnd] = velement; indexMap[lowEnd] = ielement;
        lowEnd++;
      } else if (order > 0) {
        do {
          highStart--;
          // tslint:disable-next-line:triple-equals
          if (highStart == i) {
            break partition;
          }
          vtopElement = arr[highStart];          order = compareFn(vtopElement, vpivot);
        } while (order > 0);
        arr[i] = arr[highStart];   indexMap[i] = indexMap[highStart];
        arr[highStart] = velement; indexMap[highStart] = ielement;
        if (order < 0) {
          velement = arr[i];      ielement = indexMap[i];
          arr[i] = arr[lowEnd];   indexMap[i] = indexMap[lowEnd];
          arr[lowEnd] = velement; indexMap[lowEnd] = ielement;
          lowEnd++;
        }
      }
    }
    if (toIndex - highStart < lowEnd - fromIndex) {
      quickSort(arr, indexMap, highStart, toIndex, compareFn);
      toIndex = lowEnd;
    } else {
      quickSort(arr, indexMap, fromIndex, lowEnd, compareFn);
      fromIndex = highStart;
    }
  }
}

for (const observe of [observePush, observeUnshift, observePop, observeShift, observeSplice, observeReverse, observeSort]) {
  Object.defineProperty(observe, 'observing', { value: true, writable: false, configurable: false, enumerable: false });
}

export function enableArrayObservation(): void {
  if (proto.push['observing'] !== true) proto.push = observePush;
  if (proto.unshift['observing'] !== true) proto.unshift = observeUnshift;
  if (proto.pop['observing'] !== true) proto.pop = observePop;
  if (proto.shift['observing'] !== true) proto.shift = observeShift;
  if (proto.splice['observing'] !== true) proto.splice = observeSplice;
  if (proto.reverse['observing'] !== true) proto.reverse = observeReverse;
  if (proto.sort['observing'] !== true) proto.sort = observeSort;
}

enableArrayObservation();

export function disableArrayObservation(): void {
  if (proto.push['observing'] === true) proto.push = nativePush;
  if (proto.unshift['observing'] === true) proto.unshift = nativeUnshift;
  if (proto.pop['observing'] === true) proto.pop = nativePop;
  if (proto.shift['observing'] === true) proto.shift = nativeShift;
  if (proto.splice['observing'] === true) proto.splice = nativeSplice;
  if (proto.reverse['observing'] === true) proto.reverse = nativeReverse;
  if (proto.sort['observing'] === true) proto.sort = nativeSort;
}

export interface ArrayObserver extends ICollectionObserver<CollectionKind.array> {}

@collectionObserver(CollectionKind.array)
export class ArrayObserver implements ArrayObserver {
  public resetIndexMap: () => void;

  public collection: IObservedArray;

  constructor(lifecycle: ILifecycle, array: IObservedArray) {
    this.lifecycle = lifecycle;
    array.$observer = this;
    this.collection = array;
    this.resetIndexMap();
  }
}

export function getArrayObserver(lifecycle: ILifecycle, array: IObservedArray): ArrayObserver {
  return (array.$observer as ArrayObserver) || new ArrayObserver(lifecycle, array);
}
