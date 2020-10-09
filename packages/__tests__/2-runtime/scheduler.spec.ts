/* eslint-disable @typescript-eslint/promise-function-async */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/require-await */
import { TestContext, assert } from '@aurelia/testing';
import { TaskQueuePriority, QueueTaskTargetOptions, ITask } from '@aurelia/runtime';

function createExposedPromise() {
  let resolve: () => void;
  let reject: (err: any) => void;

  const promise = new Promise(function ($resolve, $reject) {
    resolve = $resolve;
    reject = $reject;
  });

  return {
    resolve,
    reject,
    promise,
  };
}

function round(num: number) {
  return ((num * 10 + .5) | 0) / 10;
}

async function wait(ms: number): Promise<void> {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
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

  function queueRecursiveAsync(opts: QueueTaskTargetOptions, count: number, cb: () => Promise<void>) {
    async function $queue() {
      await cb();

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

  function queueSequentialAsync(opts: QueueTaskTargetOptions, count: number, cb: () => Promise<void>) {
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

                    task.result.then(callback).catch((error) => { throw error; });
                  }
                }

                task.result.then(callback).catch((error) => { throw error; });
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

                    nextTask.result.then(callback).catch((error) => { throw error; });
                  }
                }

                nextTask.result.then(callback).catch((error) => { throw error; });
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
                  }).catch((error) => { throw error; });
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
                }).catch((error) => { throw error; });
              });
            });
          }
        });
      }
    }
  }

  describe('async', function () {
    for (const reusable of [true, false]) {
      const $reusable = reusable ? 'reusable' : 'non-reusable';

      for (const { priority, name } of prioritySpecs) {
        describe(`can queue ${$reusable} ${name}`, function () {
          it('x1, {preempt: false, delay: 0}', async function () {
            const { promise, resolve } = createExposedPromise();

            sut.queueTask(
              async function () {
                assert.isSchedulerEmpty();

                resolve();
              },
              {
                reusable,
                priority,
                preempt: false,
                delay: 0,
                async: true,
              },
            );

            await promise;
          });

          it('x1, {preempt: true, delay: 0}', async function () {
            const { promise, resolve } = createExposedPromise();

            sut.queueTask(
              async function () {
                assert.isSchedulerEmpty();

                resolve();
              },
              {
                reusable,
                priority,
                preempt: true,
                delay: 0,
                async: true,
              },
            );

            await promise;
          });

          it('x1, {delay: 5}', async function () {
            const { promise, resolve } = createExposedPromise();

            sut.queueTask(
              async function () {
                assert.isSchedulerEmpty();

                resolve();
              },
              {
                reusable,
                priority,
                delay: 5,
                async: true,
              },
            );

            await promise;
          });

          it('x1, queue {delay: 5} -> {delay: 0}, invoke {delay: 0} -> {delay: 5}', async function () {
            const { promise, resolve } = createExposedPromise();

            const calls: number[] = [];

            sut.queueTask(
              async function () {
                calls.push(1);

                assert.deepStrictEqual(calls, [2, 1], 'calls');

                assert.isSchedulerEmpty();

                resolve();
              },
              {
                reusable,
                priority,
                delay: 5,
                async: true,
              },
            );

            sut.queueTask(
              async function () {
                calls.push(2);
              },
              {
                reusable,
                priority,
                delay: 0,
                async: true,
              },
            );

            await promise;
          });

          it('x1, queue {preempt: false} -> {preempt: true}, invoke {preempt: true} -> {preempt: false}', async function () {
            const { promise, resolve } = createExposedPromise();

            const calls: number[] = [];

            sut.queueTask(
              async function () {
                calls.push(1);

                assert.deepStrictEqual(calls, [2, 1], 'calls');

                assert.isSchedulerEmpty();

                resolve();
              },
              {
                reusable,
                priority,
                preempt: false,
                async: true,
              },
            );

            sut.queueTask(
              async function () {
                calls.push(2);
              },
              {
                reusable,
                priority,
                preempt: true,
                async: true,
              },
            );

            await promise;
          });

          it('x1, queue {delay: 5} -> {preempt: false} -> {preempt: true}, invoke {preempt: true} -> {preempt: false} -> {delay: 5}', async function () {
            const { promise, resolve } = createExposedPromise();

            const calls: number[] = [];

            sut.queueTask(
              async function () {
                calls.push(1);

                assert.deepStrictEqual(calls, [3, 2, 1], 'calls');

                assert.isSchedulerEmpty();

                resolve();
              },
              {
                reusable,
                priority,
                delay: 5,
                async: true,
              },
            );

            sut.queueTask(
              async function () {
                calls.push(2);
              },
              {
                reusable,
                priority,
                preempt: false,
                async: true,
              },
            );

            sut.queueTask(
              async function () {
                calls.push(3);
              },
              {
                reusable,
                priority,
                preempt: true,
                async: true,
              },
            );

            await promise;
          });

          for (const delay of [1, 5]) {
            for (const expected of [2, 4]) {
              it(`${name} x${expected} sequential, {delay: ${delay}}`, async function () {
                const { promise, resolve } = createExposedPromise();

                let actual = 0;
                async function increment() {
                  if (++actual === expected) {
                    assert.isSchedulerEmpty();

                    resolve();
                  }
                }
                queueSequentialAsync(
                  {
                    reusable,
                    priority,
                    delay,
                    async: true,
                  },
                  expected,
                  increment,
                );

                await promise;
              });

              it(`${name} x${expected} recursive, {delay: ${delay}}`, async function () {
                const { promise, resolve } = createExposedPromise();

                let actual = 0;
                async function increment() {
                  if (++actual === expected) {
                    assert.isSchedulerEmpty();

                    resolve();
                  }
                }
                queueRecursiveAsync(
                  {
                    reusable,
                    priority,
                    delay,
                    async: true,
                  },
                  expected,
                  increment,
                );

                await promise;
              });
            }
          }
        });

        describe(`can await ${$reusable} ${name}`, function () {
          it(`manual 2x recursive`, async function () {
            const opts = {
              reusable,
              priority,
              preempt: false,
              delay: 0,
              async: true,
            };

            let count = 0;

            sut.queueTask(
              async function () {
                await Promise.resolve();
                ++count;

                sut.queueTask(
                  async function () {
                    ++count;
                  },
                  opts,
                );
              },
              opts,
            );

            await sut.yield(priority);

            assert.strictEqual(count, 2);

            assert.isSchedulerEmpty();
          });

          it('x1, {preempt: false, delay: 0}', async function () {
            const task = sut.queueTask(
              async function () {
                /* */
              },
              {
                reusable,
                priority,
                preempt: false,
                delay: 0,
                async: true,
              },
            );

            await task.result;
          });

          it('x1, {preempt: true, delay: 0}', async function () {
            const task = sut.queueTask(
              async function () {
                /* */
              },
              {
                reusable,
                priority,
                preempt: true,
                delay: 0,
                async: true,
              },
            );

            await task.result;
          });

          it('x1, {delay: 5}', async function () {
            const task = sut.queueTask(
              async function () {
                /* */
              },
              {
                reusable,
                priority,
                delay: 5,
                async: true,
              },
            );

            await task.result;
          });

          it('x1, queue {delay: 5} -> {delay: 0}, invoke {delay: 0} -> {delay: 5}', async function () {
            const calls: number[] = [];

            const task = sut.queueTask(
              async function () {
                calls.push(1);

                assert.deepStrictEqual(calls, [2, 1], 'calls');

                assert.isSchedulerEmpty();
              },
              {
                reusable,
                priority,
                delay: 5,
                async: true,
              },
            );

            sut.queueTask(
              async function () {
                calls.push(2);
              },
              {
                reusable,
                priority,
                delay: 0,
                async: true,
              },
            );

            await task.result;
          });

          it('x1, queue {preempt: false} -> {preempt: true}, invoke {preempt: true} -> {preempt: false}', async function () {
            const calls: number[] = [];

            const task = sut.queueTask(
              async function () {
                calls.push(1);

                assert.deepStrictEqual(calls, [2, 1], 'calls');

                assert.isSchedulerEmpty();
              },
              {
                reusable,
                priority,
                preempt: false,
                async: true,
              },
            );

            sut.queueTask(
              async function () {
                calls.push(2);
              },
              {
                reusable,
                priority,
                preempt: true,
                async: true,
              },
            );

            await task.result;
          });

          it('x1, queue {delay: 5} -> {preempt: false} -> {preempt: true}, invoke {preempt: true} -> {preempt: false} -> {delay: 5}', async function () {
            const calls: number[] = [];

            const task = sut.queueTask(
              async function () {
                calls.push(1);

                assert.deepStrictEqual(calls, [3, 2, 1], 'calls');

                assert.isSchedulerEmpty();
              },
              {
                reusable,
                priority,
                delay: 5,
                async: true,
              },
            );

            sut.queueTask(
              async function () {
                calls.push(2);
              },
              {
                reusable,
                priority,
                preempt: false,
                async: true,
              },
            );

            sut.queueTask(
              async function () {
                calls.push(3);
              },
              {
                reusable,
                priority,
                preempt: true,
                async: true,
              },
            );

            await task.result;
          });

          for (const delay of [1, 5]) {
            for (const expected of [2, 4]) {
              it(`x${expected} sequential, {delay: ${delay}}`, async function () {
                let actual = 0;
                queueSequentialAsync(
                  {
                    reusable,
                    priority,
                    delay,
                    async: true,
                  },
                  expected,
                  async function () {
                    ++actual;
                  },
                );

                await sut.getTaskQueue(priority).yield();

                assert.strictEqual(actual, expected, 'callCount');

                assert.isSchedulerEmpty();
              });

              it(`x${expected} recursive, {delay: ${delay}}`, async function () {
                let actual = 0;
                queueRecursiveAsync(
                  {
                    reusable,
                    priority,
                    delay,
                    async: true,
                  },
                  expected,
                  async function () {
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
          describe(`can persist ${$reusable} ${name}`, function () {
            for (const iterations of [1, 2, 3]) {
              describe(`runs until canceled after ${iterations} iterations`, function () {
                it(`from within the running task`, async function () {
                  const { promise, resolve } = createExposedPromise();

                  let count = 0;

                  const task = sut.queueTask(
                    async function () {
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
                      async: true,
                    },
                  );

                  let thenCount = 0;
                  async function callback() {
                    if (++thenCount === iterations) {
                      assert.strictEqual(task.status, 'canceled', `task.status at thenCount=${thenCount} ${reportTask(task)}`);

                      assert.isSchedulerEmpty();

                      resolve();
                    } else {
                      assert.strictEqual(task.status, 'pending', `task.status at thenCount=${thenCount} ${reportTask(task)}`);

                      await task.result;
                      await callback();
                    }
                  }

                  await task.result;
                  await callback();
                  await promise;
                });

                it(`from within a followup task`, async function () {
                  const { promise, resolve } = createExposedPromise();

                  let count = 0;

                  const task = sut.queueTask(
                    async function () {
                      assert.strictEqual(nextTask.status, 'pending', `nextTask.status in task at count=${count} ${reportTask(nextTask)}`);
                      assert.strictEqual(task.status, 'running', `task.status in task at count=${count} ${reportTask(task)}`);

                      ++count;
                    },
                    {
                      persistent: true,
                      reusable,
                      priority,
                      async: true,
                    },
                  );

                  let nextTask: ITask;
                  function createNextTask() {
                    return sut.queueTask(
                      async function () {
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
                        async: true,
                      },
                    );
                  }

                  nextTask = createNextTask();

                  let thenCount = 0;
                  async function callback() {
                    if (++thenCount === iterations) {
                      assert.strictEqual(nextTask.status, 'completed', `nextTask.status at thenCount=${thenCount} ${reportTask(nextTask)}`);
                      assert.strictEqual(task.status, 'canceled', `task.status at thenCount=${thenCount} ${reportTask(task)}`);

                      assert.isSchedulerEmpty();

                      resolve();
                    } else {
                      assert.strictEqual(nextTask.status, 'pending', `nextTask.status at thenCount=${thenCount} ${reportTask(nextTask)}`);
                      assert.strictEqual(task.status, 'pending', `task.status at thenCount=${thenCount} ${reportTask(task)}`);

                      await nextTask.result;

                      // eslint-disable-next-line @typescript-eslint/no-floating-promises
                      callback();
                    }
                  }

                  await task.result;
                  assert.strictEqual(nextTask.status, 'pending', `nextTask.status after awaiting task.result at thenCount=${thenCount} ${reportTask(nextTask)}`);
                  assert.strictEqual(task.status, 'pending', `task.status after awaiting task.result at thenCount=${thenCount} ${reportTask(task)}`);

                  await nextTask.result;

                  await callback();

                  await promise;
                });

                it(`yields after the first iteration with no other tasks`, async function () {
                  const { promise, resolve } = createExposedPromise();

                  let count = 0;
                  let yieldCount = 0;

                  const task = sut.queueTask(
                    async function () {
                      assert.strictEqual(task.status, 'running', `task.status at count=${count} ${reportTask(task)}`);
                      assert.strictEqual(++count, yieldCount + 1, '++count === yieldCount + 1');
                    },
                    {
                      persistent: true,
                      reusable,
                      priority,
                      async: true,
                    },
                  );

                  async function yieldAndVerify() {
                    await sut.yield(priority);

                    if (priority !== TaskQueuePriority.microTask) {
                      assert.strictEqual(count, ++yieldCount, 'count === ++yieldCount');

                      if (yieldCount < iterations) {
                        // eslint-disable-next-line @typescript-eslint/no-floating-promises
                        yieldAndVerify();
                      } else {
                        task.cancel();

                        assert.isSchedulerEmpty();

                        resolve();
                      }
                    }
                  }

                  await yieldAndVerify();
                  await promise;
                });

                it(`yields after the first iteration with several other tasks`, async function () {
                  let count = 0;

                  const task = sut.queueTask(
                    async function () {
                      assert.strictEqual(task.status, 'running', `task.status at count=${count} ${reportTask(task)}`);

                      ++count;
                    },
                    {
                      persistent: true,
                      reusable,
                      priority,
                      async: true,
                    },
                  );

                  let otherCount = 0;
                  sut.queueTask(
                    async function () {
                      ++otherCount;
                    },
                    {
                      preempt: true,
                      reusable,
                      priority,
                      async: true,
                    },
                  );

                  sut.queueTask(
                    async function () {
                      ++otherCount;
                    },
                    {
                      preempt: false,
                      reusable,
                      priority,
                      async: true,
                    },
                  );

                  sut.queueTask(
                    async function () {
                      ++otherCount;
                    },
                    {
                      preempt: true,
                      reusable,
                      priority,
                      async: true,
                    },
                  );

                  sut.queueTask(
                    async function () {
                      ++otherCount;
                    },
                    {
                      preempt: false,
                      reusable,
                      priority,
                      async: true,
                    },
                  );

                  await sut.yield(priority);

                  assert.strictEqual(count, 1, 'count');
                  assert.strictEqual(otherCount, 4, 'otherCount');

                  task.cancel();

                  assert.isSchedulerEmpty();
                });
              });
            }

            it(`yields after the first iteration with no other tasks, after finishing a persistent task that was canceled from within a followup task`, async function () {
              const primerTask = sut.queueTask(
                async function () {
                  assert.strictEqual(primerTask.status, 'running', `primerTask.status in primerTask ${reportTask(primerTask)}`);
                  assert.strictEqual(primerCancelTask.status, 'pending', `primerCancelTask.status in primerTask ${reportTask(primerCancelTask)}`);
                },
                {
                  persistent: true,
                  reusable,
                  priority,
                  async: true,
                },
              );

              const primerCancelTask = sut.queueTask(
                async function () {
                  assert.strictEqual(primerTask.status, 'pending', `primerTask.status in primerCancelTask ${reportTask(primerTask)}`);
                  assert.strictEqual(primerCancelTask.status, 'running', `primerCancelTask.status in primerCancelTask ${reportTask(primerCancelTask)}`);

                  primerTask.cancel();

                  assert.isSchedulerEmpty();
                },
                {
                  reusable,
                  priority,
                  async: true,
                },
              );

              await primerTask.result;
              assert.strictEqual(primerTask.status, 'pending', `primerTask.status after awaiting primerTask.result ${reportTask(primerTask)}`);
              assert.strictEqual(primerCancelTask.status, 'pending', `primerCancelTask.status after awaiting primerTask.result ${reportTask(primerCancelTask)}`);

              await primerCancelTask.result;
              assert.strictEqual(primerTask.status, 'canceled', `primerTask.status after awaiting primerCancelTask.result ${reportTask(primerTask)}`);
              assert.strictEqual(primerCancelTask.status, 'completed', `primerCancelTask.status after awaiting primerCancelTask.result ${reportTask(primerCancelTask)}`);

              assert.isSchedulerEmpty();

              let count = 0;
              let yieldCount = 0;

              const persistentTask = sut.queueTask(
                async function () {
                  assert.strictEqual(persistentTask.status, 'running', `persistentTask.status in persistentTask ${reportTask(persistentTask)}`);
                  assert.strictEqual(++count, yieldCount + 1, `++count (${count}) === yieldCount + 1 (${yieldCount + 1}) in persistentTask`);
                },
                {
                  persistent: true,
                  reusable,
                  priority,
                  async: true,
                },
              );

              await sut.yield(priority);

              assert.strictEqual(count, ++yieldCount, `count (${count}) === ++yieldCount (${yieldCount}) after awaiting sut.yield()`);

              persistentTask.cancel();

              assert.isSchedulerEmpty();
            });
          });
        }
      }
    }

    const enum TaskState {
      NotStarted = 0,
      Started = 1,
      Finished = 2,
    }
    it(`awaits the first task before starting the second`, async function () {
      const states = [
        TaskState.NotStarted,
        TaskState.NotStarted,
        TaskState.NotStarted,
      ];

      async function callback0() {
        states[0] = TaskState.Started;
        assert.deepStrictEqual(states, [TaskState.Started, 0, 0], `state at the start of callback0`);
        await new Promise(resolve => setTimeout(resolve, 50));
        states[0] = TaskState.Finished;
        assert.deepStrictEqual(states, [TaskState.Finished, 0, 0], `state at the end of callback0`);
      }

      async function callback1() {
        states[1] = TaskState.Started;
        assert.deepStrictEqual(states, [TaskState.Finished, TaskState.Started, 0], `state at the start of callback1`);
        await new Promise(resolve => setTimeout(resolve, 50));
        states[1] = TaskState.Finished;
        assert.deepStrictEqual(states, [TaskState.Finished, TaskState.Finished, 0], `state at the end of callback1`);
      }

      async function callback2() {
        states[2] = TaskState.Started;
        assert.deepStrictEqual(states, [TaskState.Finished, TaskState.Finished, TaskState.Started], `state at the start of callback2`);
        await new Promise(resolve => setTimeout(resolve, 50));
        states[2] = TaskState.Finished;
        assert.deepStrictEqual(states, [TaskState.Finished, TaskState.Finished, TaskState.Finished], `state at the end of callback2`);
      }

      const opts: QueueTaskTargetOptions = {
        priority: TaskQueuePriority.macroTask,
        async: true,
      };

      const task0 = sut.queueTask(callback0, opts);
      const task1 = sut.queueTask(callback1, opts);
      const task2 = sut.queueTask(callback2, opts);

      assert.deepStrictEqual(states, [TaskState.NotStarted, TaskState.NotStarted, TaskState.NotStarted], `state after queueing 3 tasks`);

      await task0.result;

      // Note: the assertion pattern here is to verify that the next task is started on the next 'cycle' rather than immediately after the previous task finished.
      // If we were to verify the opposite, the expected state would be [Finished, Started, NotStarted] instead of [Finished, NotStarted, NotStarted].
      assert.deepStrictEqual(states, [TaskState.Finished, TaskState.NotStarted, TaskState.NotStarted], `state after awaiting task0`);

      await task1.result;

      assert.deepStrictEqual(states, [TaskState.Finished, TaskState.Finished, TaskState.NotStarted], `state after awaiting task1`);

      await task2.result;

      assert.deepStrictEqual(states, [TaskState.Finished, TaskState.Finished, TaskState.Finished], `state after awaiting task2`);

      assert.isSchedulerEmpty();
    });
  });
});
