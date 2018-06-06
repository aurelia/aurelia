import { getArrayObserver } from '../../../src/runtime/binding/array-observation';
import { expect } from 'chai';
import { spy } from 'sinon';
import { DI } from '../../../src/runtime/di';
import { ITaskQueue } from '../../../src/runtime/task-queue';

describe('array observation', () => {
  let taskQueue;

  before(() => {
    taskQueue = DI.createContainer().get(ITaskQueue);
  });

  it('getArrayObserver should return same observer instance for the same Array instance', () => {
    const array = ['foo', 'bar', 'hello', 'world'];
    const observer1 = getArrayObserver(taskQueue, array);
    const observer2 = getArrayObserver(taskQueue, array);

    expect(observer1 === observer2).to.be.true;
  });

  it('getArrayObserver should return different observer instances for different Array instances', () => {
    const array1 = ['foo', 'bar', 'hello', 'world'];
    const array2 = ['foo', 'bar', 'hello', 'world'];
    const observer1 = getArrayObserver(taskQueue, array1);
    const observer2 = getArrayObserver(taskQueue, array2);

    expect(observer1 !== observer2).to.be.true;
  });

  it('pops', () => {
    const array = ['foo', 'bar', 'hello', 'world'];
    array.pop();
    Array.prototype.pop.call(array);
    expect(array).to.deep.equal(['foo', 'bar']);
    const observer = getArrayObserver(taskQueue, array);
    spy(observer, 'addChangeRecord');
    array.pop();
    expect(observer.addChangeRecord).to.have.been.called;
    (<any>observer.addChangeRecord).resetHistory();
    Array.prototype.pop.call(array);
    expect(observer.addChangeRecord).to.have.been.called;
    expect(array).to.deep.equal([]);
    (<any>observer.addChangeRecord).resetHistory();
    array.pop();
    expect(observer.addChangeRecord).not.to.have.been.called;
  });

  it('pushes', () => {
    const array = [];
    array.push('foo');
    Array.prototype.push.call(array, 'bar');
    expect(array).to.deep.equal(['foo', 'bar']);
    const observer = getArrayObserver(taskQueue, array);
    spy(observer, 'addChangeRecord');
    array.push('hello');
    expect(observer.addChangeRecord).to.have.been.called;
    (<any>observer.addChangeRecord).resetHistory();
    Array.prototype.push.call(array, 'world');
    expect(observer.addChangeRecord).to.have.been.called;
    expect(array).to.deep.equal(['foo', 'bar', 'hello', 'world']);
  });

  it('reverses', () => {
    const array = [1, 2, 3, 4];
    array.reverse();
    expect(array).to.deep.equal([4, 3, 2, 1]);
    Array.prototype.reverse.call(array);
    expect(array).to.deep.equal([1, 2, 3, 4]);
    const observer = getArrayObserver(taskQueue, array);
    spy(observer, 'flushChangeRecords');
    spy(observer, 'reset');
    array.reverse();
    expect(array).to.deep.equal([4, 3, 2, 1]);
    expect(observer.flushChangeRecords).to.have.been.called;
    expect(observer.reset).to.have.been.called;
    (<any>observer.flushChangeRecords).resetHistory();
    (<any>observer.reset).resetHistory();
    Array.prototype.reverse.call(array);
    expect(array).to.deep.equal([1, 2, 3, 4]);
    expect(observer.flushChangeRecords).to.have.been.called;
    expect(observer.reset).to.have.been.called;
  });

  it('shifts', () => {
    const array = ['foo', 'bar', 'hello', 'world'];
    array.shift();
    Array.prototype.shift.call(array);
    expect(array).to.deep.equal(['hello', 'world']);
    const observer = getArrayObserver(taskQueue, array);
    spy(observer, 'addChangeRecord');
    array.shift();
    expect(observer.addChangeRecord).to.have.been.called;
    (<any>observer.addChangeRecord).resetHistory();
    Array.prototype.shift.call(array);
    expect(observer.addChangeRecord).to.have.been.called;
    expect(array).to.deep.equal([]);
    (<any>observer.addChangeRecord).resetHistory();
    array.shift();
    expect(observer.addChangeRecord).not.to.have.been.called;
  });

  it('sorts', () => {
    const array = [1, 2, 3, 4];
    array.sort((a, b) => b - a);
    expect(array).to.deep.equal([4, 3, 2, 1]);
    Array.prototype.sort.call(array, (a, b) => a - b);
    expect(array).to.deep.equal([1, 2, 3, 4]);
    const observer = getArrayObserver(taskQueue, array);
    spy(observer, 'flushChangeRecords');
    spy(observer, 'reset');
    array.sort((a, b) => b - a);
    expect(array).to.deep.equal([4, 3, 2, 1]);
    expect(observer.flushChangeRecords).to.have.been.called;
    expect(observer.reset).to.have.been.called;
    (<any>observer.flushChangeRecords).resetHistory();
    (<any>observer.reset).resetHistory();
    Array.prototype.sort.call(array, (a, b) => a - b);
    expect(array).to.deep.equal([1, 2, 3, 4]);
    expect(observer.flushChangeRecords).to.have.been.called;
    expect(observer.reset).to.have.been.called;
  });

  it('splices', () => {
    const array = [1, 2, 3, 4];
    array.splice(1, 1, <any>'hello');
    Array.prototype.splice.call(array, 2, 1, 'world');
    expect(array).to.deep.equal([1, 'hello', 'world', 4]);
    const observer = getArrayObserver(taskQueue, array);
    spy(observer, 'addChangeRecord');
    array.splice(1, 1, <any>'foo');
    expect(observer.addChangeRecord).to.have.been.calledWith({
      type: 'splice',
      object: array,
      index: 1,
      removed: ['hello'],
      addedCount: 1
    });
    (<any>observer.addChangeRecord).resetHistory();
    Array.prototype.splice.call(array, 2, 1, 'bar');
    expect(observer.addChangeRecord).to.have.been.calledWith({
      type: 'splice',
      object: array,
      index: 2,
      removed: ['world'],
      addedCount: 1
    });
    expect(array).to.deep.equal([1, 'foo', 'bar', 4]);
  });

  it('splices string indexes', () => {
    const array = [1, 2, 3, 4];
    array.splice(<any>'1', <any>'1', <any>'hello');
    Array.prototype.splice.call(array, '2', '1', 'world');
    expect(array).to.deep.equal([1, 'hello', 'world', 4]);
    const observer = getArrayObserver(taskQueue, array);
    spy(observer, 'addChangeRecord');
    array.splice(<any>'1', <any>'1', <any>'foo');
    expect(observer.addChangeRecord).to.have.been.calledWith({
      type: 'splice',
      object: array,
      index: 1,
      removed: ['hello'],
      addedCount: 1
    });
    (<any>observer.addChangeRecord).resetHistory();
    Array.prototype.splice.call(array, '2', '1', 'bar');
    expect(observer.addChangeRecord).to.have.been.calledWith({
      type: 'splice',
      object: array,
      index: 2,
      removed: ['world'],
      addedCount: 1
    });
    expect(array).to.deep.equal([1, 'foo', 'bar', 4]);
  });

  it('unshifts', () => {
    const array = [];
    array.unshift('foo');
    Array.prototype.unshift.call(array, 'bar');
    expect(array).to.deep.equal(['bar', 'foo']);
    const observer = getArrayObserver(taskQueue, array);
    spy(observer, 'addChangeRecord');
    array.unshift('hello');
    expect(observer.addChangeRecord).to.have.been.called;
    (<any>observer.addChangeRecord).resetHistory();
    Array.prototype.unshift.call(array, 'world');
    expect(observer.addChangeRecord).to.have.been.called;
    expect(array).to.deep.equal(['world', 'hello', 'bar', 'foo']);
  });
});
