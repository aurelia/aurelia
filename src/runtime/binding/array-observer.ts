import { IDisposable } from './../../kernel/interfaces';

export const enum MutationType {
  none       = 0,
  add        = 0b001 << 4,
  delete     = 0b010 << 4,
  update     = 0b100 << 4
};

export const enum MutationOrigin {
  mask       = 0b1111,
  push       = 0b0001 | MutationType.add,
  unshift    = 0b0010 | MutationType.add,
  fill       = 0b0011 | MutationType.update,
  pop        = 0b0100 | MutationType.delete,
  shift      = 0b0101 | MutationType.delete,
  splice     = 0b0110 | MutationType.add | MutationType.delete,
  copyWithin = 0b0111 | MutationType.update,
  reverse    = 0b1000 | MutationType.update,
  sort       = 0b1001 | MutationType.update
};

export interface IObservedArray<T = any> extends Array<T> {
  $observer: ArrayObserver<T>;
}

const proto = Array.prototype;
const push = proto.push;
const unshift = proto.unshift;
const pop = proto.pop;
const shift = proto.shift;
const splice = proto.splice;
const reverse = proto.reverse;
const sort = proto.sort;

const min = Math.min;
const max = Math.max;

// https://tc39.github.io/ecma262/#sec-array.prototype.push
function observePush(this: IObservedArray): ReturnType<typeof push> {
  const len = this.length;
  const argCount = arguments.length;
  if (argCount === 0) {
    return len;
  }
  const changes = this.$observer.newChangeSet(len + argCount);
  this.length = len + argCount
  let i = len;
  while (i < this.length) {
    this[i] = arguments[i - len];
    changes[i] = MutationType.add;
    i++;
  }
  this.$observer.notify(MutationOrigin.push, arguments);
  return this.length;
};

// https://tc39.github.io/ecma262/#sec-array.prototype.unshift
function observeUnshift(this: IObservedArray): ReturnType<typeof unshift>  {
  const len = this.length;
  const argCount = arguments.length;
  if (argCount === 0) {
    return len;
  }
  const changes = this.$observer.newChangeSet(len + argCount);
  this.length = len + argCount;
  let k = len;
  while (k > 0) {
    this[k + argCount - 1] = this[k - 1];
    k--;
  }
  let j = 0;
  while (j < argCount) {
    this[j] = arguments[j];
    changes[j] = MutationType.add;
    j++;
  }
  this.$observer.notify(MutationOrigin.unshift, arguments);
  return this.length;
};

// https://tc39.github.io/ecma262/#sec-array.prototype.pop
function observePop(this: IObservedArray): ReturnType<typeof pop> {
  const len = this.length;
  if (len === 0) {
    return undefined;
  }
  this.$observer.newChangeSet(len)[len - 1] = MutationType.delete;
  const element = this[len - 1];
  this.length = len - 1;
  this.$observer.notify(MutationOrigin.pop);
  return element;
};

// https://tc39.github.io/ecma262/#sec-array.prototype.shift
function observeShift(this: IObservedArray): ReturnType<typeof shift> {
  const len = this.length;
  if (len === 0) {
    return undefined;
  }
  this.$observer.newChangeSet(len)[0] = MutationType.delete;
  const first = this[0];
  let k = 1;
  while (k < len) {
    this[k - 1] = this[k];
    k++;
  }
  this.length = len - 1;
  this.$observer.notify(MutationOrigin.shift);
  return first;
};

// https://tc39.github.io/ecma262/#sec-array.prototype.splice
function observeSplice(this: IObservedArray, start: number, deleteCount?: number, ...items: any[]): ReturnType<typeof splice> {
  const len = this.length;
  const argCount = arguments.length;
  const relativeStart = start | 0;
  const actualStart = relativeStart < 0 ? max((len + relativeStart), 0) : min(relativeStart, len);
  const actualDeleteCount = argCount === 0 ? 0 : argCount === 1 ? len - actualStart : min(max(deleteCount | 0, 0), len - actualStart);
  const A = new Array(actualDeleteCount);
  let k = 0;
  while (k < actualDeleteCount) {
    A[k] = this[actualStart + k];
    k++;
  }
  const itemCount = items.length;
  const netSizeChange = itemCount - actualDeleteCount;
  const newLen = len + netSizeChange;
  const changes = this.$observer.newChangeSet(len < newLen ? newLen : len);
  if (netSizeChange < 0) {
    k = actualStart;
    while (k < (len - actualDeleteCount)) {
      this[k + itemCount] = this[k + actualDeleteCount];
      changes[k + itemCount] = MutationType.update;
      k++;
    }
    k = len;
    while (k > (len - actualDeleteCount + itemCount)) {
      changes[k] = MutationType.delete;
      k--;
    }
  } else if (netSizeChange > 0) {
    k = len - actualDeleteCount;
    while (k > actualStart) {
      this[k + itemCount - 1] = this[k + actualDeleteCount - 1];
      changes[k + itemCount - 1] = MutationType.update;
      k--;
    }
  }
  k = actualStart;
  while (k < (actualStart + itemCount)) {
    this[k] = items[k - actualStart];
    changes[k] = MutationType.update;
    k++;
  }
  this.length = len - actualDeleteCount + itemCount;
  this.$observer.notify(MutationOrigin.splice, arguments);
  return A;
};

// https://tc39.github.io/ecma262/#sec-array.prototype.reverse
function observeReverse(this: IObservedArray): ReturnType<typeof reverse> {
  const len = this.length;
  const middle = (len / 2) | 0;
  const changes = this.$observer.newChangeSet(len);
  let lower = 0;
  while (lower !== middle) {
    let upper = len - lower - 1;
    const lowerValue = this[lower];
    const upperValue = this[upper];
    this[lower] = upperValue;
    this[upper] = lowerValue;
    changes[lower] = changes[upper] = MutationType.update;
    lower++;
  }
  this.$observer.notify(MutationOrigin.reverse);
  return this;
};

// https://tc39.github.io/ecma262/#sec-array.prototype.sort
// https://github.com/v8/v8/blob/master/src/js/array.js
function observeSort(this: IObservedArray, compareFn?: (a: any, b: any) => number) {
  const len = this.length;
  if (len < 2) {
    return this;
  }

  quickSort(this, 0, len, preSortCompare);
  let i = 0;
  while (i < len) {
    if (this[i] === undefined) {
      break;
    }
    i++;
  }
  if (i === 0) {
    return this;
  }

  if (compareFn === undefined || typeof compareFn !== 'function'/*spec says throw a TypeError, should we do that too?*/) {
    compareFn = sortCompare;
  }
  quickSort(this, 0, i, compareFn);
  // todo: proper change tracking
  const changes = this.$observer.newChangeSet(len);
  changes.fill(MutationType.update);
  return this;
}

// https://tc39.github.io/ecma262/#sec-sortcompare
function sortCompare(x: any, y: any): number {
  if (x === y) {
    return 0;
  }
  x = x === null ? 'null' : x.toString();
  y = y === null ? 'null' : y.toString();
  if (x === y) {
    return 0;
  }
  return x < y ? -1 : 1;
}

function preSortCompare(x: any, y: any): number {
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

function insertionSort(arr: Array<any>, from: number, to: number, compareFn: (a: any, b: any) => number): void {
  let element, tmp, order;
  let i, j;
  for (i = from + 1; i < to; i++) {
    element = arr[i];
    for (j = i - 1; j >= from; j--) {
      tmp = arr[j];
      order = compareFn(tmp, element);
      if (order > 0) {
        arr[j + 1] = tmp;
      } else {
        break;
      }
    }
    arr[j + 1] = element;
  }
}  

function quickSort(arr: Array<any>, from: number, to: number, compareFn: (a: any, b: any) => number): void {
  let thirdIndex = 0, i = 0;
  let v0, v1, v2;
  let c01, c02, c12;
  let tmp;
  let pivot, lowEnd, highStart;
  let element, order, topElement;

  while (true) {
    if (to - from <= 10) {
      insertionSort(arr, from, to, compareFn);
      return;
    }

    thirdIndex = from + ((to - from) >> 1);
    v0 = arr[from];
    v1 = arr[to - 1];
    v2 = arr[thirdIndex];
    c01 = compareFn(v0, v1);
    if (c01 > 0) {
      tmp = v0;
      v0 = v1;
      v1 = tmp;
    }
    c02 = compareFn(v0, v2);
    if (c02 >= 0) {
      tmp = v0;
      v0 = v2;
      v2 = v1;
      v1 = tmp;
    } else {
      c12 = compareFn(v1, v2);
      if (c12 > 0) {
        tmp = v1;
        v1 = v2;
        v2 = tmp;
      }
    }
    arr[from] = v0;
    arr[to - 1] = v2;
    pivot = v1;
    lowEnd = from + 1;
    highStart = to - 1;
    arr[thirdIndex] = arr[lowEnd];
    arr[lowEnd] = pivot;

    partition: for (i = lowEnd + 1; i < highStart; i++) {
      element = arr[i];
      order = compareFn(element, pivot);
      if (order < 0) {
        arr[i] = arr[lowEnd];
        arr[lowEnd] = element;
        lowEnd++;
      } else if (order > 0) {
        do {
          highStart--;
          if (highStart == i) {
            break partition;
          }
          topElement = arr[highStart];
          order = compareFn(topElement, pivot);
        } while (order > 0);
        arr[i] = arr[highStart];
        arr[highStart] = element;
        if (order < 0) {
          element = arr[i];
          arr[i] = arr[lowEnd];
          arr[lowEnd] = element;
          lowEnd++;
        }
      }
    }
    if (to - highStart < lowEnd - from) {
      quickSort(arr, highStart, to, compareFn);
      to = lowEnd;
    } else {
      quickSort(arr, from, lowEnd, compareFn);
      from = highStart;
    }
  }
}

export class ArrayObserver<T = any> implements IDisposable {
  public array: IObservedArray<any>;
  public changeSets: Array<Uint16Array>;
  public mutationCount: number;

  constructor(array: Array<T>) {
    if (!Array.isArray(array)) {
      throw new Error(Object.prototype.toString.call(array) + ' is not an array!');
    }
    this.changeSets = new Array(0xFF);
    this.mutationCount = 0;
    (<any>array).$observer = this;
    array.push = observePush;
    array.unshift = observeUnshift;
    array.pop = observePop;
    array.shift = observeShift;
    array.splice = observeSplice;
    array.reverse = observeReverse;
    array.sort = observeSort;
    this.array = <any>array;
  }

  newChangeSet(length: number): Uint16Array {
    return this.changeSets[this.mutationCount++] = new Uint16Array(length);
  }

  notify(origin: MutationOrigin, args?: IArguments): void {

  }
  
  dispose(): void {
    const array = <Array<any>>this.array;
    if (array) {
      array.push = push;
      array.unshift = unshift;
      array.pop = pop;
      array.shift = shift;
      array.splice = splice;
      array.reverse = reverse;
      array.sort = sort;
      (<any>array).$observer = undefined;
    }
    this.array = null;
    this.changeSets = null;
  }
}
