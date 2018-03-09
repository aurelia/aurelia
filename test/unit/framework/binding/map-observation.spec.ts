import { TaskQueue } from '../../../../src/framework/task-queue';
import { getMapObserver } from '../../../../src/framework/binding/map-observation';

describe('getMapObserver', () => {
  let taskQueue;
  beforeAll(() => {
    taskQueue = new TaskQueue();
  });

  it('getMapObserver should return same observer instance for the same Map instance', () => {
    let map = new Map();
    let observer1 = getMapObserver(taskQueue, map);
    let observer2 = getMapObserver(taskQueue, map);

    expect(observer1 === observer2).toBe(true);
  });

  it('getMapObserver should return different observer instances for different Map instances', () => {
    let map1 = new Map();
    let map2 = new Map();
    let observer1 = getMapObserver(taskQueue, map1);
    let observer2 = getMapObserver(taskQueue, map2);

    expect(observer1 !== observer2).toBe(true);
  });

  it('identifies set with falsey oldValue as an "update"', done => {
    let map = new Map();
    map.set('foo', 0); // falsey old value.
    let observer = getMapObserver(taskQueue, map);
    let callback = jasmine.createSpy('callback');
    observer.subscribe(callback);
    map.set('foo', 'bar');
    taskQueue.queueMicroTask({
      call: () => {
        expect(callback).toHaveBeenCalledWith([{ type: 'update', object: map, key: 'foo', oldValue: 0 }], undefined);
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
  beforeAll(() => {
    taskQueue = new TaskQueue();
  });

  beforeEach(() => {
    map = new Map([['foo', 'bar'], ['falsy', undefined]]);
    observer = getMapObserver(taskQueue, map);
    callback = jasmine.createSpy('callback');
    observer.subscribe(callback);
  });

  it('should add "add" changeRecord on set without oldValue', done => {
    map.set('bar', 'foo');
    taskQueue.queueMicroTask({
      call: () => {
        expect(callback).toHaveBeenCalledWith(
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
        expect(callback).toHaveBeenCalledWith(
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
        expect(callback).toHaveBeenCalledWith(
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
        expect(callback).toHaveBeenCalledWith(
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
        expect(callback).not.toHaveBeenCalled();
        observer.unsubscribe(callback);
        done();
      }
    });
  });

  it('should add changeRecord on clear', done => {
    map.clear();
    taskQueue.queueMicroTask({
      call: () => {
        expect(callback).toHaveBeenCalledWith([{ type: 'clear', object: map }], undefined);
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
  function createNumericMap() {
    let m = new Map();
    m.set = function(k, v) {
      if (typeof v !== 'number') {
        v = 0;
      }
      Map.prototype.set.call(this, k, v);
      return this;
    };
    return m;
  }
  beforeAll(() => {
    taskQueue = new TaskQueue();
  });

  beforeEach(() => {
    map = createNumericMap();
    map.set('one', 1);
    map.set('zero', 0);
    observer = getMapObserver(taskQueue, map);
    callback = jasmine.createSpy('callback');
    observer.subscribe(callback);
  });

  it('should add "update" changeRecord on set with a chanced altered value', done => {
    map.set('one', 'one');
    taskQueue.queueMicroTask({
      call: () => {
        expect(callback).toHaveBeenCalledWith([{ type: 'update', object: map, key: 'one', oldValue: 1 }], undefined);
        observer.unsubscribe(callback);
        done();
      }
    });
  });

  it('should add "add" changeRecord on set with a new altered value', done => {
    map.set('two', 'two');
    taskQueue.queueMicroTask({
      call: () => {
        expect(callback).toHaveBeenCalledWith(
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
        expect(callback).not.toHaveBeenCalled();
        observer.unsubscribe(callback);
        done();
      }
    });
  });
});
