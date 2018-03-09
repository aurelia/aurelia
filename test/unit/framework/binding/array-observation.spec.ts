import { TaskQueue } from '../../../../src/framework/task-queue';
import { getArrayObserver } from '../../../../src/framework/binding/array-observation';

describe('array observation', () => {
  let taskQueue;

  beforeAll(() => {
    taskQueue = new TaskQueue();
  });

  it('getArrayObserver should return same observer instance for the same Array instance', () => {
    let array = ['foo', 'bar', 'hello', 'world'];
    let observer1 = getArrayObserver(taskQueue, array);
    let observer2 = getArrayObserver(taskQueue, array);

    expect(observer1 === observer2).toBe(true);
  });

  it('getArrayObserver should return different observer instances for different Array instances', () => {
    let array1 = ['foo', 'bar', 'hello', 'world'];
    let array2 = ['foo', 'bar', 'hello', 'world'];
    let observer1 = getArrayObserver(taskQueue, array1);
    let observer2 = getArrayObserver(taskQueue, array2);

    expect(observer1 !== observer2).toBe(true);
  });

  it('pops', () => {
    let array = ['foo', 'bar', 'hello', 'world'];
    array.pop();
    Array.prototype.pop.call(array);
    expect(array).toEqual(['foo', 'bar']);
    let observer = getArrayObserver(taskQueue, array);
    spyOn(observer, 'addChangeRecord');
    array.pop();
    expect(observer.addChangeRecord).toHaveBeenCalled();
    observer.addChangeRecord.calls.reset();
    Array.prototype.pop.call(array);
    expect(observer.addChangeRecord).toHaveBeenCalled();
    expect(array).toEqual([]);
    observer.addChangeRecord.calls.reset();
    array.pop();
    expect(observer.addChangeRecord).not.toHaveBeenCalled();
  });

  it('pushes', () => {
    let array = [];
    array.push('foo');
    Array.prototype.push.call(array, 'bar');
    expect(array).toEqual(['foo', 'bar']);
    let observer = getArrayObserver(taskQueue, array);
    spyOn(observer, 'addChangeRecord');
    array.push('hello');
    expect(observer.addChangeRecord).toHaveBeenCalled();
    observer.addChangeRecord.calls.reset();
    Array.prototype.push.call(array, 'world');
    expect(observer.addChangeRecord).toHaveBeenCalled();
    expect(array).toEqual(['foo', 'bar', 'hello', 'world']);
  });

  it('reverses', () => {
    let array = [1, 2, 3, 4];
    array.reverse();
    expect(array).toEqual([4, 3, 2, 1]);
    Array.prototype.reverse.call(array);
    expect(array).toEqual([1, 2, 3, 4]);
    let observer = getArrayObserver(taskQueue, array);
    spyOn(observer, 'flushChangeRecords');
    spyOn(observer, 'reset');
    array.reverse();
    expect(array).toEqual([4, 3, 2, 1]);
    expect(observer.flushChangeRecords).toHaveBeenCalled();
    expect(observer.reset).toHaveBeenCalled();
    observer.flushChangeRecords.calls.reset();
    observer.reset.calls.reset();
    Array.prototype.reverse.call(array);
    expect(array).toEqual([1, 2, 3, 4]);
    expect(observer.flushChangeRecords).toHaveBeenCalled();
    expect(observer.reset).toHaveBeenCalled();
  });

  it('shifts', () => {
    let array = ['foo', 'bar', 'hello', 'world'];
    array.shift();
    Array.prototype.shift.call(array);
    expect(array).toEqual(['hello', 'world']);
    let observer = getArrayObserver(taskQueue, array);
    spyOn(observer, 'addChangeRecord');
    array.shift();
    expect(observer.addChangeRecord).toHaveBeenCalled();
    observer.addChangeRecord.calls.reset();
    Array.prototype.shift.call(array);
    expect(observer.addChangeRecord).toHaveBeenCalled();
    expect(array).toEqual([]);
    observer.addChangeRecord.calls.reset();
    array.shift();
    expect(observer.addChangeRecord).not.toHaveBeenCalled();
  });

  it('sorts', () => {
    let array = [1, 2, 3, 4];
    array.sort((a, b) => b - a);
    expect(array).toEqual([4, 3, 2, 1]);
    Array.prototype.sort.call(array, (a, b) => a - b);
    expect(array).toEqual([1, 2, 3, 4]);
    let observer = getArrayObserver(taskQueue, array);
    spyOn(observer, 'flushChangeRecords');
    spyOn(observer, 'reset');
    array.sort((a, b) => b - a);
    expect(array).toEqual([4, 3, 2, 1]);
    expect(observer.flushChangeRecords).toHaveBeenCalled();
    expect(observer.reset).toHaveBeenCalled();
    observer.flushChangeRecords.calls.reset();
    observer.reset.calls.reset();
    Array.prototype.sort.call(array, (a, b) => a - b);
    expect(array).toEqual([1, 2, 3, 4]);
    expect(observer.flushChangeRecords).toHaveBeenCalled();
    expect(observer.reset).toHaveBeenCalled();
  });

  it('splices', () => {
    let array = [1, 2, 3, 4] as any[];
    array.splice(1, 1, 'hello');
    Array.prototype.splice.call(array, 2, 1, 'world');
    expect(array).toEqual([1, 'hello', 'world', 4]);
    let observer = getArrayObserver(taskQueue, array);
    spyOn(observer, 'addChangeRecord');
    array.splice(1, 1, 'foo');
    expect(observer.addChangeRecord).toHaveBeenCalled();
    expect(observer.addChangeRecord.calls.mostRecent().args).toEqual([
      {
        type: 'splice',
        object: array,
        index: 1,
        removed: ['hello'],
        addedCount: 1
      }
    ]);
    observer.addChangeRecord.calls.reset();
    Array.prototype.splice.call(array, 2, 1, 'bar');
    expect(observer.addChangeRecord).toHaveBeenCalled();
    expect(observer.addChangeRecord.calls.mostRecent().args).toEqual([
      {
        type: 'splice',
        object: array,
        index: 2,
        removed: ['world'],
        addedCount: 1
      }
    ]);
    expect(array).toEqual([1, 'foo', 'bar', 4]);
  });

  it('splices string indexes', () => {
    let array = [1, 2, 3, 4] as any[];
    array.splice('1' as any, '1' as any, 'hello');
    Array.prototype.splice.call(array, '2', '1', 'world');
    expect(array).toEqual([1, 'hello', 'world', 4]);
    let observer = getArrayObserver(taskQueue, array);
    spyOn(observer, 'addChangeRecord');
    array.splice('1' as any, '1' as any, 'foo');
    expect(observer.addChangeRecord).toHaveBeenCalled();
    expect(observer.addChangeRecord.calls.mostRecent().args).toEqual([
      {
        type: 'splice',
        object: array,
        index: 1,
        removed: ['hello'],
        addedCount: 1
      }
    ]);
    observer.addChangeRecord.calls.reset();
    Array.prototype.splice.call(array, '2', '1', 'bar');
    expect(observer.addChangeRecord).toHaveBeenCalled();
    expect(observer.addChangeRecord.calls.mostRecent().args).toEqual([
      {
        type: 'splice',
        object: array,
        index: 2,
        removed: ['world'],
        addedCount: 1
      }
    ]);
    expect(array).toEqual([1, 'foo', 'bar', 4]);
  });

  it('unshifts', () => {
    let array = [];
    array.unshift('foo');
    Array.prototype.unshift.call(array, 'bar');
    expect(array).toEqual(['bar', 'foo']);
    let observer = getArrayObserver(taskQueue, array);
    spyOn(observer, 'addChangeRecord');
    array.unshift('hello');
    expect(observer.addChangeRecord).toHaveBeenCalled();
    observer.addChangeRecord.calls.reset();
    Array.prototype.unshift.call(array, 'world');
    expect(observer.addChangeRecord).toHaveBeenCalled();
    expect(array).toEqual(['world', 'hello', 'bar', 'foo']);
  });
});
