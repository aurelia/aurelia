export const arrayToObserver = new WeakMap<any[], any>();
export const observerToArray = new WeakMap<any, any[]>();

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

const proto = Array.prototype;

const slice = proto.slice;

/** 
 * Appends new elements to an array, and returns the new length of the array.
 * @param items — New elements of the Array.
 */
// https://tc39.github.io/ecma262/#sec-array.prototype.push
export const push = proto.push;

proto.push = function() {
  const observer = arrayToObserver.get(this);
  if (observer === undefined) {
    return push.apply(this, arguments);
  }
  const result = push.apply(this, arguments);
  observer.notify(MutationOrigin.push, this, arguments.length);
  return result;
};

/** 
 * Inserts new elements at the start of an array.
 * @param items — Elements to insert at the start of the Array.
 */
// https://tc39.github.io/ecma262/#sec-array.prototype.unshift
export const unshift = proto.unshift;

proto.unshift = function() {
  const observer = arrayToObserver.get(this);
  if (observer === undefined) {
    return unshift.apply(this, arguments);
  }
  const result = unshift.apply(this, arguments);
  observer.notify(MutationOrigin.unshift, this, arguments.length);
  return result;
};

/**
 * Returns the this object after filling the section identified by start and end with value
 * @param value — value to fill array section with
 * @param start
 * index to start filling the array at. If start is negative, it is treated as length+start where length is the length of the array.
 * @param end
 * index to stop filling the array at. If end is negative, it is treated as length+end.
 */
// https://tc39.github.io/ecma262/#sec-array.prototype.fill
export const fill = proto.fill;

proto.fill = function(value: any, start?: number, end?: number) {
  const observer = arrayToObserver.get(this);
  if (observer === undefined) {
    return fill.call(this, value, start, end);
  }
  const result = fill.call(this, value, start, end);
  observer.notify(MutationOrigin.fill, this, value, start, end);
  return result;
};

/** 
 * Removes the last element from an array and returns it.
 */
// https://tc39.github.io/ecma262/#sec-array.prototype.pop
export const pop = proto.pop;

proto.pop = function() {
  const observer = arrayToObserver.get(this);
  if (observer === undefined) {
    return pop.call(this);
  }
  const result =  pop.call(this);
  observer.notify(MutationOrigin.pop, this);
  return result;
};

/** 
 * Removes the first element from an array and returns it.
 */
// https://tc39.github.io/ecma262/#sec-array.prototype.shift
export const shift = proto.shift;

proto.shift = function() {
  const observer = arrayToObserver.get(this);
  if (observer === undefined) {
    return shift.call(this);
  }
  const result = shift.call(this);
  observer.notify(MutationOrigin.shift, this);
  return result;
};

/** 
 * Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
 * @param start — The zero-based location in the array from which to start removing elements.
 * @param deleteCount — The number of elements to delete.
 * @param items — Overload. Elements to insert into the array in place of the deleted elements.
 */
// https://tc39.github.io/ecma262/#sec-array.prototype.splice
export const splice = proto.splice;

proto.splice = function(start: number, deleteCount?: number, ...items: any[]) {
  const observer = arrayToObserver.get(this);
  if (observer === undefined) {
    return splice.call(this, start, deleteCount, ...items);
  }
  const result = splice.call(this, start, deleteCount, ...items);
  observer.notify(MutationOrigin.splice, this, start, deleteCount, items.length);
  return result;
};

/** 
 * Returns the this object after copying a section of the array identified by start and end to the same array starting at position target
 * @param target
 * If target is negative, it is treated as length+target where length is the length of the array.
 * @param start
 * If start is negative, it is treated as length+start. If end is negative, it is treated as length+end.
 * @param end — If not specified, length of the this object is used as its default value.
 */
// https://tc39.github.io/ecma262/#sec-array.prototype.copywithin
export const copyWithin = proto.copyWithin;

proto.copyWithin = function(target: number, start: number, end?: number) {
  const observer = arrayToObserver.get(this);
  if (observer === undefined) {
    return copyWithin.call(this, target, start, end);
  }
  const result = copyWithin.call(this, target, start, end);
  observer.notify(MutationOrigin.copyWithin, this, target, start, end);
  return result;
};

/** 
 * Reverses the elements in an Array.
 */
// https://tc39.github.io/ecma262/#sec-array.prototype.reverse
export const reverse = proto.reverse;

proto.reverse = function() {
  const observer = arrayToObserver.get(this);
  if (observer === undefined) {
    return reverse.call(this);
  }
  const result = reverse.call(this);
  observer.notify(MutationOrigin.reverse, this);
  return result;
};

/** 
 * Sorts an array.
 * @param compareFn — The name of the function used to determine the order of the elements. If omitted, the elements are sorted in ascending, ASCII character order.
 */
// https://tc39.github.io/ecma262/#sec-array.prototype.sort
export const sort = proto.sort;

proto.sort = function(compareFn?: (a: any, b: any) => number) {
  const observer = arrayToObserver.get(this);
  if (observer === undefined) {
    return sort.call(this, compareFn);
  }
  const old = slice.call(this);
  const result = sort.call(this, compareFn);
  observer.notify(MutationOrigin.sort, this, old);
  return result;
};

export class ArrayObserver {
  private changes: Uint16Array;
  private changeState: MutationType;

  constructor(length: number) {
    this.changes = new Uint16Array(length);
    this.changeState = MutationType.none;
    this.hasDeletes = false;
  }

  notify(origin: MutationOrigin, array: any[], arg1: any, arg2: any, arg3: any): void {
    // note: reassignment of arg1/2/3 and some verbository is just temporary for readability while getting this to work
    const curChanges = this.changes;
    if (origin & MutationType.add) {
      // todo: defragment deletes and turn last delete bordering a non-delete (or edge) into an update
      if (origin === MutationOrigin.push) {
        // arg1 = items.length
        const oldLen = curChanges.length;
        const addCount = arg1;
        const newLen = oldLen + addCount;
        const newChanges = new Uint16Array(newLen);
        newChanges.set(curChanges);
        newChanges.fill(MutationType.add, oldLen);
        this.changes = newChanges;
      } else if (origin === MutationOrigin.unshift) {
        // arg1 = items.length
        const oldLen = curChanges.length;
        const addCount = arg1;
        const newLen = oldLen + addCount;
        const newChanges = new Uint16Array(newLen);
        newChanges.fill(MutationType.add, 0, addCount);
        newChanges.set(curChanges, addCount);
        this.changes = newChanges;
      } else if (origin === MutationOrigin.splice) {
        // arg1 = start
        // arg2 = deleteCount
        // arg3 = items.length
        const oldLen = curChanges.length;
        // start index of the modification range
        const start = arg1;
        let deleteCount = arg2 || 0;
        let addCount = arg3 || 0;
        // just an efficiency shortcut for "how many items to process" to reduce branching
        let changeCount = deleteCount < addCount ? addCount : deleteCount;
        // stop index of the modification range (can expand if there are previously deleted items in this range)
        let end = start + changeCount;
        // new length could be larger than what we need because we're not basing it on the delta of delete + add
        // that's fine, since preallocating a large array is more efficient than having an extra loop to count the deletes first
        const newLen = oldLen + addCount;
        let newChanges = new Uint16Array(newLen);
        let oldIndex = 0;
        let newIndex = 0;
        let oldCount = oldLen;
        while (newIndex < newLen) {
          if (newIndex < start || newIndex > end) {
            // we're not in the modification range
            if (oldCount) {
              // we still have previous states to process
              // -> copy old to new
              // -> advance old and new
              // -> consume old
              newChanges[newIndex] = curChanges[oldIndex];
              newIndex++;
              oldIndex++;
              oldCount--;
            } else {
              // no more previous states to process
              // -> done; turns out the new array size was bigger than we needed
              newChanges = newChanges.slice(0, newIndex);
              break;
            }
          } else {
            // we're in the modification range
            if (oldCount) {
              // we still need to check previous states
              if (curChanges[oldIndex] === MutationType.delete) {
                // we must pretend that previously deleted items don't exist
                // -> set new to delete
                // -> advance old and new
                // -> consume old
                // -> expand modification range
                newChanges[newIndex] = MutationType.delete;
                newIndex++;
                oldIndex++;
                oldCount--;
                end++;
              } else {
                // old states of add/update/none can be treated the same way, so no need for additional logic
                // now we figure out whether the new state is an add, delete or update
                if (deleteCount) {
                  // we're in the range of deletes
                  if (addCount) {
                    // we're also in the range of adds, so it's an update
                    // -> set new to update
                    // -> advance old and new
                    // -> consume old
                    // -> consume delete and add
                    newChanges[newIndex] = MutationType.update;
                    addCount--;
                  } else {
                    // we're not in the range of adds, so it's a delete
                    // -> set new to delete
                    // -> advance old and new
                    // -> consume old
                    // -> consume delete
                    newChanges[newIndex] = MutationType.delete;
                  }
                  newIndex++;
                  oldIndex++;
                  oldCount--;
                  deleteCount--;
                } else {
                  // we're in the range of adds
                  // -> set new to add
                  // -> advance new
                  newChanges[newIndex] = MutationType.add;
                  newIndex++;
                }
              }
            } else {
              // no need to check previous states anymore
              // we also don't care about deletes anymore since they have no effect here
              if (addCount) {
                // add to the end of the array
                // -> set new to add
                // -> advance new
                newChanges[newIndex] = MutationType.add;
                newIndex++;
              } else {
                // only deletes left and no more old items, so we can ignore the rest
                newChanges = newChanges.slice(0, newIndex);
              }
            }
          }
        }
        this.changes = newChanges;
      }
    } else if (origin & MutationType.delete) {
      if (origin === MutationOrigin.pop) {
        let i = curChanges.length;
        loop: while (i--) {
          switch (curChanges[i]) {
            case MutationType.add:
              // undo
              curChanges[i] = MutationType.none;
              break loop;
            case MutationType.delete:
              // skip
              continue;
            default:
              // delete
              curChanges[i] = MutationType.delete;
              break loop;
          }
        }
      } else if (origin === MutationOrigin.shift) {
        const len = curChanges.length;
        let i = 0;
        loop: while (i < len) {
          switch (curChanges[i]) {
            case MutationType.add:
              // undo
              curChanges[i] = MutationType.none;
              break loop;
            case MutationType.delete:
              // skip
              continue;
            default:
              // delete
              curChanges[i] = MutationType.delete;
              break loop;
          }
        }
      }
    } else if (origin & MutationType.update) {
      if (origin === MutationOrigin.sort) {
        // arg1 = old
        return;
      } else if (origin === MutationOrigin.reverse) {
        
        return;
      } else if (origin === MutationOrigin.fill) {
        // arg1 = value
        // arg2 = start
        // arg3 = end
        return;
      } else if (origin === MutationOrigin.copyWithin) {
        // arg1 = target
        // arg2 = start
        // arg3 = end
        return;
      }
    }
  }
}
