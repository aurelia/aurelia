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
  this.length = len + argCount
  const curChanges = this.$observer.changes;
  const newChanges = new Uint16Array(curChanges.length + argCount);
  newChanges.set(curChanges);
  let i = len;
  while (i < this.length) {
    if (i >= curChanges.length) {
      newChanges[i] = MutationType.add;
    }
    this[i] = arguments[i - len];
    i++;
  }
  while (i < newChanges.length) {
    newChanges[i] = MutationType.add;
  }
  this.$observer.changes = newChanges;
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
  this.length = len + argCount;
  const curChanges = this.$observer.changes;
  const newChanges = new Uint16Array(curChanges.length + argCount);
  newChanges.set(curChanges, argCount);
  let k = len;
  while (k > 0) {
    this[k + argCount - 1] = this[k - 1];
    k--;
  }
  let j = 0;
  while (j < argCount) {
    this[j] = arguments[j];
    newChanges[j] = MutationType.add;
    j++;
  }
  this.$observer.changes = newChanges;
  this.$observer.notify(MutationOrigin.unshift, arguments);
  return this.length;
};

// https://tc39.github.io/ecma262/#sec-array.prototype.pop
function observePop(this: IObservedArray): ReturnType<typeof pop> {
  const len = this.length;
  if (len === 0) {
    return undefined;
  }
  const curChanges = this.$observer.changes;
  let i = curChanges.length;
  loop: while (i--) {
    switch (curChanges[i]) {
      case MutationType.add:
        curChanges[i] = MutationType.none;
        break loop;
      case MutationType.delete:
        continue;
      default:
        curChanges[i] = MutationType.delete;
        break loop;
    }
  }
  const element = this[len - 1];
  this.length = len - 1;
  this.$observer.notify(MutationOrigin.pop, arguments);
  return element;
};

// https://tc39.github.io/ecma262/#sec-array.prototype.shift
function observeShift(this: IObservedArray): ReturnType<typeof shift> {
  const len = this.length;
  if (len === 0) {
    return undefined;
  }
  const curChanges = this.$observer.changes;
  let i = 0;
  loop: while (i < curChanges.length) {
    switch (curChanges[i]) {
      case MutationType.add:
        curChanges[i] = MutationType.none;
        break loop;
      case MutationType.delete:
        continue;
      default:
        curChanges[i] = MutationType.delete;
        break loop;
    }
  }
  const first = this[0];
  let k = 1;
  while (k < len) {
    this[k - 1] = this[k];
    k++;
  }
  this.length = len - 1;
  this.$observer.notify(MutationOrigin.shift, arguments);
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
  const curChanges = this.$observer.changes;
  const curChangeCount = curChanges.length;
  let newChanges: Uint16Array;
  let newChangeCount: number;
  if (itemCount < actualDeleteCount) {
    newChanges = curChanges;
    newChangeCount = curChangeCount;
    k = actualStart;
    let changesOffset = 0;
    let kk = 0;
    while (k < (len - actualDeleteCount)) {
      while (kk < (k + changesOffset)) {
        if (newChanges[kk] === MutationType.delete) {
          changesOffset++;
        }
        kk++;
      }
      this[k + itemCount] = this[k + actualDeleteCount];
      newChanges[kk] = MutationType.update;
      k++;
    }
    k = len;
    kk = newChangeCount;
    changesOffset = 0;
    while (k > (len - actualDeleteCount + itemCount)) {
      while (kk > (k - changesOffset)) {
        if (newChanges[kk] === MutationType.delete) {
          changesOffset++;
        }
        kk--;
      }
      newChanges[kk] = MutationType.delete;
    }
  } else if (itemCount > actualDeleteCount) {
    const changeCountOffset = itemCount - actualDeleteCount;
    newChangeCount = curChangeCount + changeCountOffset;
    newChanges = new Uint16Array(newChangeCount);
    k = len - actualDeleteCount;
    let kk = newChangeCount;
    let changesOffset = 0;
    while (k > actualStart) {
      while (kk > (k - changesOffset)) {
        newChanges[kk] = curChanges[kk - changeCountOffset];
        if (newChanges[kk] === MutationType.delete) {
          changesOffset++;
        }
        kk--;
      }
      this[k + itemCount - 1] = this[k + actualDeleteCount - 1];
      
      k--;
    }
  } else {
    newChanges = curChanges;
    newChangeCount = curChangeCount;
  }
  k = actualStart;
  let kk = 0;
  let changesOffset = 0;
  while (k < (actualStart + itemCount)) {
    while (kk < (k + changesOffset)) {
      if (newChanges[kk] === MutationType.delete) {
        changesOffset++;
      }
      kk++;
    }
    this[k] = items[k - actualStart];
    if (k - actualStart >= (itemCount - actualDeleteCount)) {
      newChanges[kk] = MutationType.update;
    } else {
      newChanges[kk] = MutationType.add;
    }
    kk++;
    k++;
  }
  this.$observer.changes = newChanges;
  this.length = len - actualDeleteCount + itemCount;
  this.$observer.notify(MutationOrigin.splice, arguments);
  return A;
};

// https://tc39.github.io/ecma262/#sec-array.prototype.reverse
function observeReverse(this: IObservedArray): ReturnType<typeof reverse> {
  const result = reverse.call(this);
  const curChanges = this.$observer.changes;
  const len = curChanges.length;
  let i = 0;
  while (i < len) {
    if (curChanges[i] !== MutationType.delete) {
      curChanges[i] = MutationType.update;
    }
  }
  this.$observer.notify(MutationOrigin.reverse, arguments);
  return result;
};

// https://tc39.github.io/ecma262/#sec-array.prototype.sort
function observeSort(this: IObservedArray, compareFn?: (a: any, b: any) => number) {
  const result = sort.call(this, compareFn);
  const curChanges = this.$observer.changes;
  const len = curChanges.length;
  let i = 0;
  while (i < len) {
    if (curChanges[i] !== MutationType.delete) {
      curChanges[i] = MutationType.update;
    }
  }
  this.$observer.notify(MutationOrigin.sort, arguments);
  return result;
};

export class ArrayObserver<T = any> implements IDisposable {
  public array: IObservedArray<any>;
  public changes: Uint16Array;

  constructor(array: Array<T>) {
    (<any>array).$observer = this;
    array.push = observePush;
    array.unshift = observeUnshift;
    array.pop = observePop;
    array.shift = observeShift;
    array.splice = observeSplice;
    array.reverse = observeReverse;
    array.sort = observeSort;
    this.array = <any>array;
    this.changes = new Uint16Array(array.length);
  }

  notify(origin: MutationOrigin, args: IArguments): void {

  }
  
  dispose(): void {
    const array = <Array<any>>this.array;
    array.push = push;
    array.unshift = unshift;
    array.pop = pop;
    array.shift = shift;
    array.splice = splice;
    array.reverse = reverse;
    array.sort = sort;
    (<any>array).$observer = undefined;
    this.array = null;
    this.changes = null;
  }
}
