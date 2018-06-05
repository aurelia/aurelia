import { getSetObserver } from '../../../src/runtime/binding/set-observation';
import { spy } from 'sinon';
import { expect } from 'chai';
import { DI } from '../../../src/runtime/di';
import { ITaskQueue } from '../../../src/runtime/task-queue';

describe('getSetObserver', () => {
  let taskQueue;
  let set;
  let observer;
  let callback;
  before(() => {
    taskQueue = DI.createContainer().get(ITaskQueue);
  });

  beforeEach(() => {
    set = new Set(['foo', 'bar']);
    observer = getSetObserver(taskQueue, set);
    callback = spy();
    observer.subscribe(callback);
  });

  it('getSetObserver should return same observer instance for the same Set instance', () => {
    const set = new Set();
    const observer1 = getSetObserver(taskQueue, set);
    const observer2 = getSetObserver(taskQueue, set);

    expect(observer1 === observer2).to.be.true;
  });

  it('getSetObserver should return different observer instances for different Set instances', () => {
    const set1 = new Set();
    const set2 = new Set();
    const observer1 = getSetObserver(taskQueue, set1);
    const observer2 = getSetObserver(taskQueue, set2);

    expect(observer1 !== observer2).to.be.true;
  });

  it('should add changeRecord on add', done => {
    set.add('baz');
    taskQueue.queueMicroTask({
      call: () => {
        expect(callback).to.have.been.calledWith([{ type: 'add', object: set, value: 'baz' }], undefined);
        observer.unsubscribe(callback);
        done();
      }
    });
  });

  it('should not add changeRecord on add when entry already exists', done => {
    set.add('bar');
    taskQueue.queueMicroTask({
      call: () => {
        expect(callback).not.to.have.been.called;
        observer.unsubscribe(callback);
        done();
      }
    });
  });

  it('should add changeRecord on delete', done => {
    set.delete('bar');
    taskQueue.queueMicroTask({
      call: () => {
        expect(callback).to.have.been.calledWith([{ type: 'delete', object: set, value: 'bar' }], undefined);
        observer.unsubscribe(callback);
        done();
      }
    });
  });

  it('should not add changeRecord on delete when entry does not exist', done => {
    set.delete('baz');
    taskQueue.queueMicroTask({
      call: () => {
        expect(callback).not.to.have.been.called;
        observer.unsubscribe(callback);
        done();
      }
    });
  });

  it('should add changeRecord on clear', done => {
    set.clear();
    taskQueue.queueMicroTask({
      call: () => {
        expect(callback).to.have.been.calledWith([{ type: 'clear', object: set }], undefined);
        observer.unsubscribe(callback);
        done();
      }
    });
  });
});

describe('ModifySetObserver', () => {
  let taskQueue;
  let set;
  let observer;
  let callback;
  before(() => {
    taskQueue = DI.createContainer().get(ITaskQueue);
  });

  beforeEach(() => {
    set = new Set(['foo', 'bar']);
    observer = getSetObserver(taskQueue, set);
    callback = spy();
    observer.subscribe(callback);
  });

  it('should add changeRecord on add', done => {
    set.add('baz');
    taskQueue.queueMicroTask({
      call: () => {
        expect(callback).to.have.been.calledWith([{ type: 'add', object: set, value: 'baz' }], undefined);
        observer.unsubscribe(callback);
        done();
      }
    });
  });

  it('should not add changeRecord on add when entry already exists', done => {
    set.add('bar');
    taskQueue.queueMicroTask({
      call: () => {
        expect(callback).not.to.have.been.called;
        observer.unsubscribe(callback);
        done();
      }
    });
  });

  it('should add changeRecord on delete', done => {
    set.delete('bar');
    taskQueue.queueMicroTask({
      call: () => {
        expect(callback).to.have.been.calledWith([{ type: 'delete', object: set, value: 'bar' }], undefined);
        observer.unsubscribe(callback);
        done();
      }
    });
  });

  it('should not add changeRecord on delete when entry does not exist', done => {
    set.delete('baz');
    taskQueue.queueMicroTask({
      call: () => {
        expect(callback).not.to.have.been.called;
        observer.unsubscribe(callback);
        done();
      }
    });
  });

  it('should add changeRecord on clear', done => {
    set.clear();
    taskQueue.queueMicroTask({
      call: () => {
        expect(callback).to.have.been.calledWith([{ type: 'clear', object: set }], undefined);
        observer.unsubscribe(callback);
        done();
      }
    });
  });
});

describe('ModifySetObserver of extended Set', () => {
  let taskQueue;
  let set;
  let observer;
  let callback;
  function createNumericSet(this: any): any {
    const s = new Set();
    s.add = function(this: any, v: any): any {
      if (typeof v !== 'number') {
        v = 0;
      }
      Set.prototype.add.call(this, v);
      return this;
    };
    return s;
  }
  before(() => {
    taskQueue = DI.createContainer().get(ITaskQueue);
  });

  beforeEach(() => {
    set = createNumericSet();
    set.add(100);
    observer = getSetObserver(taskQueue, set);
    callback = spy();
    observer.subscribe(callback);
  });

  it('should add changeRecord on add', done => {
    set.add(1);
    taskQueue.queueMicroTask({
      call: () => {
        expect(callback).to.have.been.calledWith([{ type: 'add', object: set, value: 1 }], undefined);
        observer.unsubscribe(callback);
        done();
      }
    });
  });

  it('should add changeRecord on add when the value has been altered', done => {
    set.add('baz');
    taskQueue.queueMicroTask({
      call: () => {
        expect(callback).to.have.been.calledWith([{ type: 'add', object: set, value: 0 }], undefined);
        observer.unsubscribe(callback);
        done();
      }
    });
  });

  it('should add changeRecord on delete', done => {
    set.delete(100);
    taskQueue.queueMicroTask({
      call: () => {
        expect(callback).to.have.been.calledWith([{ type: 'delete', object: set, value: 100 }], undefined);
        observer.unsubscribe(callback);
        done();
      }
    });
  });

  it('should add changeRecord on clear', done => {
    set.clear();
    taskQueue.queueMicroTask({
      call: () => {
        expect(callback).to.have.been.calledWith([{ type: 'clear', object: set }], undefined);
        observer.unsubscribe(callback);
        done();
      }
    });
  });
});
