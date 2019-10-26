import { TestContext, assert } from '@aurelia/testing';
import { TaskQueuePriority, QueueTaskTargetOptions, ITask } from '@aurelia/runtime';

function round(num: number) {
  return ((num * 10 + .5) | 0) / 10;
}

function reportTask(task: any) {
  const id = task.id;
  const created = round(task.createdTime);
  const queue = round(task.queueTime);
  const preempt = task.preempt;
  const reusable = task.reusable;
  const persistent = task.persistent;
  const status = task._status;

  return `id=${id} createdTime=${created} queueTime=${queue} preempt=${preempt} reusable=${reusable} persistent=${persistent} status=${status}`;
}

describe('Scheduler', function () {
  // There is only ever one global scheduler, so we might as well store it here instead of initializing all extra boilerplate each test
  const sut = TestContext.createHTMLTestContext().scheduler;

  function queueRecursive(opts: QueueTaskTargetOptions, count: number, cb: () => void) {
    function $queue() {
      cb();

      if (--count > 0) {
        sut.queueTask($queue, opts);
      }
    }

    sut.queueTask($queue, opts);
  }

  function queueSequential(opts: QueueTaskTargetOptions, count: number, cb: () => void) {
    while (count-- > 0) {
      sut.queueTask(cb, opts);
    }
  }

  const prioritySpecs = [
    {
      priority: TaskQueuePriority.microTask,
      name: 'microTask',
    },
    {
      priority: TaskQueuePriority.render,
      name: 'render',
    },
    {
      priority: TaskQueuePriority.macroTask,
      name: 'macroTask',
    },
    {
      priority: TaskQueuePriority.postRender,
      name: 'postRender',
    },
    {
      priority: TaskQueuePriority.idle,
      name: 'idle',
    },
    {
      priority: TaskQueuePriority.microTask,
      name: 'microTask',
    },
    {
      priority: TaskQueuePriority.render,
      name: 'render',
    },
    {
      priority: TaskQueuePriority.macroTask,
      name: 'macroTask',
    },
  ];

  for (const reusable of [true, false]) {
    for (const { priority, name } of prioritySpecs) {
      describe(`can queue ${name}`, function () {
        it('x1, {preempt: false, delay: 0}', function (done) {
          sut.queueTask(
            function () {
              assert.isSchedulerEmpty();

              done();
            },
            {
              reusable,
              priority,
              preempt: false,
              delay: 0,
            },
          );
        });

        it('x1, {preempt: true, delay: 0}', function (done) {
          sut.queueTask(
            function () {
              assert.isSchedulerEmpty();

              done();
            },
            {
              reusable,
              priority,
              preempt: true,
              delay: 0,
            },
          );
        });

        it('x1, {delay: 5}', function (done) {
          sut.queueTask(
            function () {
              assert.isSchedulerEmpty();

              done();
            },
            {
              reusable,
              priority,
              delay: 5,
            },
          );
        });

        it('x1, queue {delay: 5} -> {delay: 0}, invoke {delay: 0} -> {delay: 5}', function (done) {
          const calls: number[] = [];

          sut.queueTask(
            function () {
              calls.push(1);

              assert.deepStrictEqual(calls, [2, 1], 'calls');

              assert.isSchedulerEmpty();

              done();
            },
            {
              reusable,
              priority,
              delay: 5,
            },
          );

          sut.queueTask(
            function () {
              calls.push(2);
            },
            {
              reusable,
              priority,
              delay: 0,
            },
          );
        });

        it('x1, queue {preempt: false} -> {preempt: true}, invoke {preempt: true} -> {preempt: false}', function (done) {
          const calls: number[] = [];

          sut.queueTask(
            function () {
              calls.push(1);

              assert.deepStrictEqual(calls, [2, 1], 'calls');

              assert.isSchedulerEmpty();

              done();
            },
            {
              reusable,
              priority,
              preempt: false,
            },
          );

          sut.queueTask(
            function () {
              calls.push(2);
            },
            {
              reusable,
              priority,
              preempt: true,
            },
          );
        });

        it('x1, queue {delay: 5} -> {preempt: false} -> {preempt: true}, invoke {preempt: true} -> {preempt: false} -> {delay: 5}', function (done) {
          const calls: number[] = [];

          sut.queueTask(
            function () {
              calls.push(1);

              assert.deepStrictEqual(calls, [3, 2, 1], 'calls');

              assert.isSchedulerEmpty();

              done();
            },
            {
              reusable,
              priority,
              delay: 5,
            },
          );

          sut.queueTask(
            function () {
              calls.push(2);
            },
            {
              reusable,
              priority,
              preempt: false,
            },
          );

          sut.queueTask(
            function () {
              calls.push(3);
            },
            {
              reusable,
              priority,
              preempt: true,
            },
          );
        });

        for (const delay of [1, 5]) {
          for (const expected of [2, 4]) {
            it(`${name} x${expected} sequential, {delay: ${delay}}`, function (done) {
              let actual = 0;
              function increment() {
                if (++actual === expected) {
                  assert.isSchedulerEmpty();

                  done();
                }
              }
              queueSequential(
                {
                  reusable,
                  priority,
                  delay,
                },
                expected,
                increment,
              );
            });

            it(`${name} x${expected} recursive, {delay: ${delay}}`, function (done) {
              let actual = 0;
              function increment() {
                if (++actual === expected) {
                  assert.isSchedulerEmpty();

                  done();
                }
              }
              queueRecursive(
                {
                  reusable,
                  priority,
                  delay,
                },
                expected,
                increment,
              );
            });
          }
        }
      });

      describe(`can await ${name}`, function () {
        it('x1, {preempt: false, delay: 0}', function () {
          const task = sut.queueTask(
            function () {
              /* */
            },
            {
              reusable,
              priority,
              preempt: false,
              delay: 0,
            },
          );

          return task.result;
        });

        it('x1, {preempt: true, delay: 0}', function () {
          const task = sut.queueTask(
            function () {
              /* */
            },
            {
              reusable,
              priority,
              preempt: true,
              delay: 0,
            },
          );

          return task.result;
        });

        it('x1, {delay: 5}', function () {
          const task = sut.queueTask(
            function () {
              /* */
            },
            {
              reusable,
              priority,
              delay: 5,
            },
          );

          return task.result;
        });

        it('x1, queue {delay: 5} -> {delay: 0}, invoke {delay: 0} -> {delay: 5}', function () {
          const calls: number[] = [];

          const task = sut.queueTask(
            function () {
              calls.push(1);

              assert.deepStrictEqual(calls, [2, 1], 'calls');

              assert.isSchedulerEmpty();
            },
            {
              reusable,
              priority,
              delay: 5,
            },
          );

          sut.queueTask(
            function () {
              calls.push(2);
            },
            {
              reusable,
              priority,
              delay: 0,
            },
          );

          return task.result;
        });

        it('x1, queue {preempt: false} -> {preempt: true}, invoke {preempt: true} -> {preempt: false}', function () {
          const calls: number[] = [];

          const task = sut.queueTask(
            function () {
              calls.push(1);

              assert.deepStrictEqual(calls, [2, 1], 'calls');

              assert.isSchedulerEmpty();
            },
            {
              reusable,
              priority,
              preempt: false,
            },
          );

          sut.queueTask(
            function () {
              calls.push(2);
            },
            {
              reusable,
              priority,
              preempt: true,
            },
          );

          return task.result;
        });

        it('x1, queue {delay: 5} -> {preempt: false} -> {preempt: true}, invoke {preempt: true} -> {preempt: false} -> {delay: 5}', function () {
          const calls: number[] = [];

          const task = sut.queueTask(
            function () {
              calls.push(1);

              assert.deepStrictEqual(calls, [3, 2, 1], 'calls');

              assert.isSchedulerEmpty();
            },
            {
              reusable,
              priority,
              delay: 5,
            },
          );

          sut.queueTask(
            function () {
              calls.push(2);
            },
            {
              reusable,
              priority,
              preempt: false,
            },
          );

          sut.queueTask(
            function () {
              calls.push(3);
            },
            {
              reusable,
              priority,
              preempt: true,
            },
          );

          return task.result;
        });

        for (const delay of [1, 5]) {
          for (const expected of [2, 4]) {
            it(`x${expected} sequential, {delay: ${delay}}`, async function () {
              let actual = 0;
              queueSequential(
                {
                  reusable,
                  priority,
                  delay,
                },
                expected,
                function () {
                  ++actual;
                },
              );

              await sut.getTaskQueue(priority).yield();

              assert.strictEqual(actual, expected, 'callCount');

              assert.isSchedulerEmpty();
            });

            it(`x${expected} recursive, {delay: ${delay}}`, async function () {
              let actual = 0;
              queueRecursive(
                {
                  reusable,
                  priority,
                  delay,
                },
                expected,
                function () {
                  ++actual;
                },
              );

              await sut.getTaskQueue(priority).yield();

              assert.strictEqual(actual, expected, 'callCount');

              assert.isSchedulerEmpty();
            });
          }
        }
      });

      if (priority !== TaskQueuePriority.microTask) {
        describe(`can persist ${name}`, function () {
          for (const iterations of [1, 2, 3]) {
            describe(`runs until canceled after ${iterations} iterations`, function () {
              it(`from within the running task`, function (done) {
                let count = 0;

                const task = sut.queueTask(
                  function () {
                    if (++count === iterations) {
                      assert.strictEqual(task.status, 'running', `task.status at count=${count} ${reportTask(task)}`);

                      task.cancel();

                      assert.isSchedulerEmpty();
                    }
                  },
                  {
                    persistent: true,
                    reusable,
                    priority,
                  },
                );

                let thenCount = 0;
                function callback() {
                  if (++thenCount === iterations) {
                    assert.strictEqual(task.status, 'canceled', `task.status at thenCount=${thenCount} ${reportTask(task)}`);

                    assert.isSchedulerEmpty();

                    done();
                  } else {
                    assert.strictEqual(task.status, 'pending', `task.status at thenCount=${thenCount} ${reportTask(task)}`);

                    task.result.then(callback);
                  }
                }

                task.result.then(callback);
              });

              it(`from within a followup task`, function (done) {
                let count = 0;

                const task = sut.queueTask(
                  function () {
                    assert.strictEqual(nextTask.status, 'pending', `nextTask.status in task at count=${count} ${reportTask(nextTask)}`);
                    assert.strictEqual(task.status, 'running', `task.status in task at count=${count} ${reportTask(task)}`);

                    ++count;
                  },
                  {
                    persistent: true,
                    reusable,
                    priority,
                  },
                );

                let nextTask: ITask;
                function createNextTask() {
                  return sut.queueTask(
                    function () {
                      assert.strictEqual(nextTask.status, 'running', `nextTask.status in nextTask at count=${count} ${reportTask(nextTask)}`);
                      assert.strictEqual(task.status, 'pending', `task.status in nextTask at count=${count} ${reportTask(task)}`);

                      if (count === iterations) {
                        task.cancel();

                        assert.isSchedulerEmpty();
                      } else {
                        nextTask = createNextTask();
                      }
                    },
                    {
                      reusable,
                      priority,
                    },
                  );
                }

                nextTask = createNextTask();

                let thenCount = 0;
                function callback() {
                  if (++thenCount === iterations) {
                    assert.strictEqual(nextTask.status, 'completed', `nextTask.status at thenCount=${thenCount} ${reportTask(nextTask)}`);
                    assert.strictEqual(task.status, 'canceled', `task.status at thenCount=${thenCount} ${reportTask(task)}`);

                    assert.isSchedulerEmpty();

                    done();
                  } else {
                    assert.strictEqual(nextTask.status, 'pending', `nextTask.status at thenCount=${thenCount} ${reportTask(nextTask)}`);
                    assert.strictEqual(task.status, 'pending', `task.status at thenCount=${thenCount} ${reportTask(task)}`);

                    nextTask.result.then(callback);
                  }
                }

                nextTask.result.then(callback);
              });

              it(`yields after the first iteration with no other tasks`, function (done) {
                let count = 0;
                let yieldCount = 0;

                const task = sut.queueTask(
                  function () {
                    assert.strictEqual(task.status, 'running', `task.status at count=${count} ${reportTask(task)}`);

                    assert.strictEqual(++count, yieldCount + 1, '++count === yieldCount + 1');
                  },
                  {
                    persistent: true,
                    reusable,
                    priority,
                  },
                );

                function yieldAndVerify() {
                  sut.yield(priority).then(() => {
                    if (priority !== TaskQueuePriority.microTask) {
                      assert.strictEqual(count, ++yieldCount, 'count === ++yieldCount');

                      if (yieldCount < iterations) {
                        yieldAndVerify();
                      } else {
                        task.cancel();

                        assert.isSchedulerEmpty();

                        done();
                      }
                    }
                  });
                }

                yieldAndVerify();
              });

              it(`yields after the first iteration with several other tasks`, function (done) {
                let count = 0;

                const task = sut.queueTask(
                  function () {
                    assert.strictEqual(task.status, 'running', `task.status at count=${count} ${reportTask(task)}`);

                    ++count;
                  },
                  {
                    persistent: true,
                    reusable,
                    priority,
                  },
                );

                let otherCount = 0;
                sut.queueTask(
                  function () {
                    ++otherCount;
                  },
                  {
                    preempt: true,
                    reusable,
                    priority,
                  },
                );

                sut.queueTask(
                  function () {
                    ++otherCount;
                  },
                  {
                    preempt: false,
                    reusable,
                    priority,
                  },
                );

                sut.queueTask(
                  function () {
                    ++otherCount;
                  },
                  {
                    preempt: true,
                    reusable,
                    priority,
                  },
                );

                sut.queueTask(
                  function () {
                    ++otherCount;
                  },
                  {
                    preempt: false,
                    reusable,
                    priority,
                  },
                );

                sut.yield(priority).then(() => {
                  assert.strictEqual(count, 1, 'count');
                  assert.strictEqual(otherCount, 4, 'otherCount');

                  task.cancel();

                  assert.isSchedulerEmpty();

                  done();
                });
              });
            });
          }
        });
      }
    }
  }
});
