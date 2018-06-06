import { getMapObserver } from '../../../src/runtime/binding/map-observation';
import { expect } from 'chai';
import { spy } from 'sinon';
import { DI } from '../../../src/runtime/di';
import { ITaskQueue } from '../../../src/runtime/task-queue';

describe('getMapObserver', () => {
  let taskQueue;
  before(() => {
    taskQueue = DI.createContainer().get(ITaskQueue);
  });

  it('getMapObserver should return same observer instance for the same Map instance', () => {
    const map = new Map();
    const observer1 = getMapObserver(taskQueue, map);
    const observer2 = getMapObserver(taskQueue, map);

    expect(observer1 === observer2).to.be.true;
  });

  it('getMapObserver should return different observer instances for different Map instances', () => {
    const map1 = new Map();
    const map2 = new Map();
    const observer1 = getMapObserver(taskQueue, map1);
    const observer2 = getMapObserver(taskQueue, map2);

    expect(observer1 !== observer2).to.be.true;
  });

  it('identifies set with falsey oldValue as an "update"', done => {
    const map = new Map();
    map.set('foo', 0); // falsey old value.
    const observer: any = getMapObserver(taskQueue, map);
    const callback = spy();
    observer.subscribe(callback);
    map.set('foo', 'bar');
    taskQueue.queueMicroTask({
      call: () => {
        expect(callback).to.have.been.calledWith([{ type: 'update', object: map, key: 'foo', oldValue: 0 }], undefined);
        observer.unsubscribe(callback);
        done();
      }
    });
  });
});

describe('ModifyMapObserver', () => {
  let taskQueue;
  let map;
  let observer;
  let callback;
  before(() => {
    taskQueue = DI.createContainer().get(ITaskQueue);
  });

  beforeEach(() => {
    map = new Map([['foo', 'bar'], ['falsy', undefined]]);
    observer = getMapObserver(taskQueue, map);
    callback = spy();
    observer.subscribe(callback);
  });

  it('should add "add" changeRecord on set without oldValue', done => {
    map.set('bar', 'foo');
    taskQueue.queueMicroTask({
      call: () => {
        expect(callback).to.have.been.calledWith(
          [{ type: 'add', object: map, key: 'bar', oldValue: undefined }],
          undefined
        );
        observer.unsubscribe(callback);
        done();
      }
    });
  });

  it('should add "update" changeRecord on set with existing oldValue', done => {
    map.set('foo', 'baz');
    taskQueue.queueMicroTask({
      call: () => {
        expect(callback).to.have.been.calledWith(
          [{ type: 'update', object: map, key: 'foo', oldValue: 'bar' }],
          undefined
        );
        observer.unsubscribe(callback);
        done();
      }
    });
  });

  it('should add "update" changeRecord on set with falsy oldValue', done => {
    map.set('falsy', 'baz');
    taskQueue.queueMicroTask({
      call: () => {
        expect(callback).to.have.been.calledWith(
          [{ type: 'update', object: map, key: 'falsy', oldValue: undefined }],
          undefined
        );
        observer.unsubscribe(callback);
        done();
      }
    });
  });

  it('should add changeRecord on delete', done => {
    map.delete('foo');
    taskQueue.queueMicroTask({
      call: () => {
        expect(callback).to.have.been.calledWith(
          [{ type: 'delete', object: map, key: 'foo', oldValue: 'bar' }],
          undefined
        );
        observer.unsubscribe(callback);
        done();
      }
    });
  });

  it('should not add changeRecord on delete when key does not exist', done => {
    map.delete('baz');
    taskQueue.queueMicroTask({
      call: () => {
        expect(callback).not.to.have.been.called;
        observer.unsubscribe(callback);
        done();
      }
    });
  });

  it('should add changeRecord on clear', done => {
    map.clear();
    taskQueue.queueMicroTask({
      call: () => {
        expect(callback).to.have.been.calledWith([{ type: 'clear', object: map }], undefined);
        observer.unsubscribe(callback);
        done();
      }
    });
  });
});

describe('ModifyMapObserver of extended Map', () => {
  let taskQueue;
  let map;
  let observer;
  let callback;
  function createNumericMap(this: any): any {
    const m = new Map();
    m.set = function(this: any, k: any, v: any): any {
      if (typeof v !== 'number') {
        v = 0;
      }
      Map.prototype.set.call(this, k, v);
      return this;
    };
    return m;
  }
  before(() => {
    taskQueue = DI.createContainer().get(ITaskQueue);
  });

  beforeEach(() => {
    map = createNumericMap();
    map.set('one', 1);
    map.set('zero', 0);
    observer = getMapObserver(taskQueue, map);
    callback = spy();
    observer.subscribe(callback);
  });

  it('should add "update" changeRecord on set with a chanced altered value', done => {
    map.set('one', 'one');
    taskQueue.queueMicroTask({
      call: () => {
        expect(callback).to.have.been.calledWith([{ type: 'update', object: map, key: 'one', oldValue: 1 }], undefined);
        observer.unsubscribe(callback);
        done();
      }
    });
  });

  it('should add "add" changeRecord on set with a new altered value', done => {
    map.set('two', 'two');
    taskQueue.queueMicroTask({
      call: () => {
        expect(callback).to.have.been.calledWith(
          [{ type: 'add', object: map, key: 'two', oldValue: undefined }],
          undefined
        );
        observer.unsubscribe(callback);
        done();
      }
    });
  });

  it('should not add changeRecord on set with an unchanged altered value', done => {
    map.set('zero', 0);
    taskQueue.queueMicroTask({
      call: () => {
        expect(callback).not.to.have.been.called;
        observer.unsubscribe(callback);
        done();
      }
    });
  });
});
