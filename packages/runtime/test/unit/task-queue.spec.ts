import { TaskQueue } from '../../src/index';
import { expect } from 'chai';

describe('TaskQueue', () => {
  let sut: TaskQueue;

  beforeEach(() => {
    sut = new TaskQueue();
  });

  it('queueTask does not provide immediate execution', () => {
    let count = 0;
    let task = () => (count += 1);

    sut.queueTask(task);
    sut.queueTask(task);

    expect(count).to.equal(0);
  });

  it('flushTaskQueue provides immediate execution', () => {
    let count = 0;
    let task = () => (count += 1);

    sut.queueTask(task);
    sut.flushTaskQueue();

    expect(count).to.equal(1);
  });

  it('flushTaskQueue does not affect microTaskQueue', () => {
    let count = 0;
    let task = () => (count += 1);

    sut.queueMicroTask(task);
    sut.queueMicroTask(task);
    sut.flushTaskQueue();

    expect(count).to.equal(0);
  });

  it('queueMicroTask does not provide immediate execution', () => {
    let count = 0;
    let task = () => (count += 1);

    sut.queueMicroTask(task);
    sut.queueMicroTask(task);

    expect(count).to.equal(0);
  });

  it('flushMicroTaskQueue provides immediate execution', () => {
    let count = 0;
    let task = () => (count += 1);

    sut.queueMicroTask(task);
    sut.flushMicroTaskQueue();

    expect(count).to.equal(1);
  });

  it('flushMicroTaskQueue does not affect taskQueue', () => {
    let count = 0;
    let task = () => (count += 1);

    sut.queueTask(task);
    sut.queueTask(task);
    sut.flushMicroTaskQueue();

    expect(count).to.equal(0);
  });

  it('will execute tasks in the correct order', done => {
    let task1HasRun = false;
    let task1 = () => {
      expect(sut.flushing).to.be.true;
      task1HasRun = true;
    };
    let task2 = () => {
      expect(sut.flushing).to.be.true;
      expect(task1HasRun).to.be.true;
      setTimeout(() => {
        expect(sut.flushing).to.be.false;
        done();
      });
    };

    expect(sut.flushing).to.be.false;
    sut.queueTask(task1);
    sut.queueTask(task2);
  });

  it('will use an onError handler on a task', done => {
    let count = 0;
    let task = () => {
      expect(sut.flushing).to.be.true;
      throw new Error('oops');
    };

    (task as any).onError = ex => {
      expect(ex.message).to.equal('oops');
      setTimeout(() => {
        expect(sut.flushing).to.be.false;
        done();
      });
    };

    expect(sut.flushing).to.be.false;
    sut.queueTask(task);
  });
});
