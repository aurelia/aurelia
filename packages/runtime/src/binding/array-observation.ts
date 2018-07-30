/* eslint-disable no-extend-native */
import { ModifyCollectionObserver } from './collection-observation';
import { ITaskQueue } from '../task-queue';
import { IBindingCollectionObserver } from './observation';

const pop = Array.prototype.pop;
const push = Array.prototype.push;
const reverse = Array.prototype.reverse;
const shift = Array.prototype.shift;
const sort = Array.prototype.sort;
const splice = Array.prototype.splice;
const unshift = Array.prototype.unshift;

Array.prototype.pop = function() {
  const notEmpty = this.length > 0;
  const methodCallResult = pop.apply(this, arguments);

  if (notEmpty && this.__array_observer__ !== undefined) {
    this.__array_observer__.addChangeRecord({
      type: 'delete',
      object: this,
      name: this.length,
      oldValue: methodCallResult
    });
  }

  return methodCallResult;
};

Array.prototype.push = function() {
  const methodCallResult = push.apply(this, arguments);

  if (this.__array_observer__ !== undefined) {
    this.__array_observer__.addChangeRecord({
      type: 'splice',
      object: this,
      index: this.length - arguments.length,
      removed: [],
      addedCount: arguments.length
    });
  }

  return methodCallResult;
};

Array.prototype.reverse = function() {
  let oldArray;
  
  if (this.__array_observer__ !== undefined) {
    this.__array_observer__.flushChangeRecords();
    oldArray = this.slice();
  }
  
  const methodCallResult = reverse.apply(this, arguments);
  
  if (this.__array_observer__ !== undefined) {
    this.__array_observer__.reset(oldArray);
  }
  
  return methodCallResult;
};

Array.prototype.shift = function() {
  const notEmpty = this.length > 0;
  const methodCallResult = shift.apply(this, arguments);

  if (notEmpty && this.__array_observer__ !== undefined) {
    this.__array_observer__.addChangeRecord({
      type: 'delete',
      object: this,
      name: 0,
      oldValue: methodCallResult
    });
  }

  return methodCallResult;
};

Array.prototype.sort = function() {
  let oldArray;
  
  if (this.__array_observer__ !== undefined) {
    this.__array_observer__.flushChangeRecords();
    oldArray = this.slice();
  }

  const methodCallResult = sort.apply(this, arguments);
  
  if (this.__array_observer__ !== undefined) {
    this.__array_observer__.reset(oldArray);
  }
  
  return methodCallResult;
};

Array.prototype.splice = function() {
  const methodCallResult = splice.apply(this, arguments);
  
  if (this.__array_observer__ !== undefined) {
    this.__array_observer__.addChangeRecord({
      type: 'splice',
      object: this,
      index: +arguments[0],
      removed: methodCallResult,
      addedCount: arguments.length > 2 ? arguments.length - 2 : 0
    });
  }
  
  return methodCallResult;
};

Array.prototype.unshift = function() {
  const methodCallResult = unshift.apply(this, arguments);
  
  if (this.__array_observer__ !== undefined) {
    this.__array_observer__.addChangeRecord({
      type: 'splice',
      object: this,
      index: 0,
      removed: [],
      addedCount: arguments.length
    });
  }
  
  return methodCallResult;
};

/**
 * Searches for observer or creates a new one associated with given array instance
 * @param taskQueue
 * @param array instance for which observer is searched
 * @returns ModifyArrayObserver always the same instance for any given array instance
 */
export function getArrayObserver<T = any>(taskQueue: ITaskQueue, array: T[]): IBindingCollectionObserver {
  let observer: IBindingCollectionObserver = (<any>array).__array_observer__;

  if (!observer) {
    Reflect.defineProperty(array, '__array_observer__', {
      value: observer = new ModifyArrayObserver<T>(taskQueue, array),
      enumerable: false, configurable: false
    });
  }

  return observer;
}

class ModifyArrayObserver<T = any> extends ModifyCollectionObserver {
  constructor(taskQueue: ITaskQueue, array: T[]) {
    super(taskQueue, array);
  }
}
