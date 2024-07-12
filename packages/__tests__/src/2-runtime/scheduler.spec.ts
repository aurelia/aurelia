import { TestContext, assert } from '@aurelia/testing';
import { QueueTaskOptions, ITask, TaskQueue } from '@aurelia/platform';
import { noop } from '@aurelia/kernel';

function createExposedPromise() {
  let resolve: () => void;
  let reject: (err: any) => void;

  const promise = new Promise<void>(function ($resolve, $reject) {
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

function reportTask(task: any) {
  const id = task.id;
  const created = round(task.createdTime);
  const queue = round(task.queueTime);
  const preempt = task.preempt;
  const persistent = task.persistent;
  const status = task._status;

  return `id=${id} createdTime=${created} queueTime=${queue} preempt=${preempt} persistent=${persistent} status=${status}`;
}

describe('2-runtime/scheduler.spec.ts', function () {
  // There is only ever one global platform, so we might as well store it here instead of initializing all extra boilerplate each test
  const platform = TestContext.create().platform;

  function queueRecursive(sut: TaskQueue, opts: QueueTaskOptions, count: number, cb: () => void) {
    function $queue() {
      cb();

      if (--count > 0) {
        sut.queueTask($queue, opts);
      }
    }

    sut.queueTask($queue, opts);
  }

  function queueRecursiveAsync(sut: TaskQueue, opts: QueueTaskOptions, count: number, cb: () => Promise<void>) {
    async function $queue() {
      await cb();

      if (--count > 0) {
        sut.queueTask($queue, opts);
      }
    }

    sut.queueTask($queue, opts);
  }

  function queueSequential(sut: TaskQueue, opts: QueueTaskOptions, count: number, cb: () => void) {
    while (count-- > 0) {
      sut.queueTask(cb, opts);
    }
  }

  function queueSequentialAsync(sut: TaskQueue, opts: QueueTaskOptions, count: number, cb: () => Promise<void>) {
    while (count-- > 0) {
      sut.queueTask(cb, opts);
    }
  }

  const prioritySpecs = [
    {
      sut: platform.domQueue,
      name: 'domWriteQueue',
    },
    {
      sut: platform.taskQueue,
      name: 'taskQueue',
    },
    {
      sut: platform.domReadQueue,
      name: 'domReadQueue',
    },
    {
      sut: platform.domQueue,
      name: 'domWriteQueue',
    },
    {
      sut: platform.taskQueue,
      name: 'taskQueue',
    },
  ];

  for (const { sut, name } of prioritySpecs) {
    describe(`can queue ${name}`, function () {
      it('x1, {preempt: false, delay: 0}', function (done) {
        sut.queueTask(
          function () {
            assert.areTaskQueuesEmpty();

            done();
          },
          {
            preempt: false,
            delay: 0,
          },
        );
      });

      it('x1, {preempt: true, delay: 0}', function (done) {
        sut.queueTask(
          function () {
            assert.areTaskQueuesEmpty();

            done();
          },
          {
            preempt: true,
            delay: 0,
          },
        );
      });

      it('x1, {delay: 5}', function (done) {
        sut.queueTask(
          function () {
            assert.areTaskQueuesEmpty();

            done();
          },
          {
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

            assert.areTaskQueuesEmpty();

            done();
          },
          {
            delay: 5,
          },
        );

        sut.queueTask(
          function () {
            calls.push(2);
          },
          {
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

            assert.areTaskQueuesEmpty();

            done();
          },
          {
            preempt: false,
          },
        );

        sut.queueTask(
          function () {
            calls.push(2);
          },
          {
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

            assert.areTaskQueuesEmpty();

            done();
          },
          {
            delay: 5,
          },
        );

        sut.queueTask(
          function () {
            calls.push(2);
          },
          {
            preempt: false,
          },
        );

        sut.queueTask(
          function () {
            calls.push(3);
          },
          {
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
                assert.areTaskQueuesEmpty();

                done();
              }
            }
            queueSequential(
              sut,
              {
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
                assert.areTaskQueuesEmpty();

                done();
              }
            }
            queueRecursive(
              sut,
              {
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

            assert.areTaskQueuesEmpty();
          },
          {
            delay: 5,
          },
        );

        sut.queueTask(
          function () {
            calls.push(2);
          },
          {
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

            assert.areTaskQueuesEmpty();
          },
          {
            preempt: false,
          },
        );

        sut.queueTask(
          function () {
            calls.push(2);
          },
          {
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

            assert.areTaskQueuesEmpty();
          },
          {
            delay: 5,
          },
        );

        sut.queueTask(
          function () {
            calls.push(2);
          },
          {
            preempt: false,
          },
        );

        sut.queueTask(
          function () {
            calls.push(3);
          },
          {
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
              sut,
              {
                delay,
              },
              expected,
              function () {
                ++actual;
              },
            );

            await sut.yield();

            assert.strictEqual(actual, expected, 'callCount');

            assert.areTaskQueuesEmpty();
          });

          it(`x${expected} recursive, {delay: ${delay}}`, async function () {
            let actual = 0;
            queueRecursive(
              sut,
              {
                delay,
              },
              expected,
              function () {
                ++actual;
              },
            );

            await sut.yield();

            assert.strictEqual(actual, expected, 'callCount');

            assert.areTaskQueuesEmpty();
          });
        }
      }
    });

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

                  assert.areTaskQueuesEmpty();
                }
              },
              {
                persistent: true,
              },
            );

            let thenCount = 0;
            function callback() {
              if (++thenCount === iterations) {
                assert.strictEqual(task.status, 'canceled', `task.status at thenCount=${thenCount} ${reportTask(task)}`);

                assert.areTaskQueuesEmpty();

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

                    assert.areTaskQueuesEmpty();
                  } else {
                    nextTask = createNextTask();
                  }
                },
                {
                },
              );
            }

            nextTask = createNextTask();

            let thenCount = 0;
            function callback() {
              if (++thenCount === iterations) {
                assert.strictEqual(nextTask.status, 'completed', `nextTask.status at thenCount=${thenCount} ${reportTask(nextTask)}`);
                assert.strictEqual(task.status, 'canceled', `task.status at thenCount=${thenCount} ${reportTask(task)}`);

                assert.areTaskQueuesEmpty();

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
              },
            );

            function yieldAndVerify() {
              sut.yield().then(() => {
                assert.strictEqual(count, ++yieldCount, 'count === ++yieldCount');

                if (yieldCount < iterations) {
                  yieldAndVerify();
                } else {
                  task.cancel();

                  assert.areTaskQueuesEmpty();

                  done();
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
              },
            );

            let otherCount = 0;
            sut.queueTask(
              function () {
                ++otherCount;
              },
              {
                preempt: true,
              },
            );

            sut.queueTask(
              function () {
                ++otherCount;
              },
              {
                preempt: false,
              },
            );

            sut.queueTask(
              function () {
                ++otherCount;
              },
              {
                preempt: true,
              },
            );

            sut.queueTask(
              function () {
                ++otherCount;
              },
              {
                preempt: false,
              },
            );

            sut.yield().then(() => {
              assert.strictEqual(count, 1, 'count');
              assert.strictEqual(otherCount, 4, 'otherCount');

              task.cancel();

              assert.areTaskQueuesEmpty();

              done();
            }).catch((error) => { throw error; });
          });
        });
      }
    });
  }

  // TODO(fkleuver): we need async tests with suspend: false.
  // This is indirectly tested by various integration tests but we need at least a couple of thorough platform-specific tests as well.
  describe('async', function () {
    for (const { sut, name } of prioritySpecs) {
      describe(`can queue ${name}`, function () {
        it('x1, {preempt: false, delay: 0}', async function () {
          const { promise, resolve } = createExposedPromise();

          sut.queueTask(
            async function () {
              assert.areTaskQueuesEmpty();

              resolve();
            },
            {
              preempt: false,
              delay: 0,
              suspend: true,
            },
          );

          await promise;
        });

        it('x1, {preempt: true, delay: 0}', async function () {
          const { promise, resolve } = createExposedPromise();

          sut.queueTask(
            async function () {
              assert.areTaskQueuesEmpty();

              resolve();
            },
            {
              preempt: true,
              delay: 0,
              suspend: true,
            },
          );

          await promise;
        });

        it('x1, {delay: 5}', async function () {
          const { promise, resolve } = createExposedPromise();

          sut.queueTask(
            async function () {
              assert.areTaskQueuesEmpty();

              resolve();
            },
            {
              delay: 5,
              suspend: true,
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

              assert.areTaskQueuesEmpty();

              resolve();
            },
            {
              delay: 5,
              suspend: true,
            },
          );

          sut.queueTask(
            async function () {
              calls.push(2);
            },
            {
              delay: 0,
              suspend: true,
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

              assert.areTaskQueuesEmpty();

              resolve();
            },
            {
              preempt: false,
              suspend: true,
            },
          );

          sut.queueTask(
            async function () {
              calls.push(2);
            },
            {
              preempt: true,
              suspend: true,
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

              assert.areTaskQueuesEmpty();

              resolve();
            },
            {
              delay: 5,
              suspend: true,
            },
          );

          sut.queueTask(
            async function () {
              calls.push(2);
            },
            {
              preempt: false,
              suspend: true,
            },
          );

          sut.queueTask(
            async function () {
              calls.push(3);
            },
            {
              preempt: true,
              suspend: true,
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
                  assert.areTaskQueuesEmpty();

                  resolve();
                }
              }
              queueSequentialAsync(
                sut,
                {
                  delay,
                  suspend: true,
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
                  assert.areTaskQueuesEmpty();

                  resolve();
                }
              }
              queueRecursiveAsync(
                sut,
                {
                  delay,
                  suspend: true,
                },
                expected,
                increment,
              );

              await promise;
            });
          }
        }
      });

      describe(`can await ${name}`, function () {
        it(`manual 2x recursive`, async function () {
          const opts = {
            preempt: false,
            delay: 0,
            suspend: true,
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

          await sut.yield();

          assert.strictEqual(count, 2);

          assert.areTaskQueuesEmpty();
        });

        it('x1, {preempt: false, delay: 0}', async function () {
          const task = sut.queueTask(
            async function () {
              /* */
            },
            {
              preempt: false,
              delay: 0,
              suspend: true,
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
              preempt: true,
              delay: 0,
              suspend: true,
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
              delay: 5,
              suspend: true,
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

              assert.areTaskQueuesEmpty();
            },
            {
              delay: 5,
              suspend: true,
            },
          );

          sut.queueTask(
            async function () {
              calls.push(2);
            },
            {
              delay: 0,
              suspend: true,
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

              assert.areTaskQueuesEmpty();
            },
            {
              preempt: false,
              suspend: true,
            },
          );

          sut.queueTask(
            async function () {
              calls.push(2);
            },
            {
              preempt: true,
              suspend: true,
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

              assert.areTaskQueuesEmpty();
            },
            {
              delay: 5,
              suspend: true,
            },
          );

          sut.queueTask(
            async function () {
              calls.push(2);
            },
            {
              preempt: false,
              suspend: true,
            },
          );

          sut.queueTask(
            async function () {
              calls.push(3);
            },
            {
              preempt: true,
              suspend: true,
            },
          );

          await task.result;
        });

        for (const delay of [1, 5]) {
          for (const expected of [2, 4]) {
            it(`x${expected} sequential, {delay: ${delay}}`, async function () {
              let actual = 0;
              queueSequentialAsync(
                sut,
                {
                  delay,
                  suspend: true,
                },
                expected,
                async function () {
                  ++actual;
                },
              );

              await sut.yield();

              assert.strictEqual(actual, expected, 'callCount');

              assert.areTaskQueuesEmpty();
            });

            it(`x${expected} recursive, {delay: ${delay}}`, async function () {
              let actual = 0;
              queueRecursiveAsync(
                sut,
                {
                  delay,
                  suspend: true,
                },
                expected,
                async function () {
                  ++actual;
                },
              );

              await sut.yield();

              assert.strictEqual(actual, expected, 'callCount');

              assert.areTaskQueuesEmpty();
            });
          }
        }
      });

      describe(`can persist ${name}`, function () {
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

                    assert.areTaskQueuesEmpty();
                  }
                },
                {
                  persistent: true,
                  suspend: true,
                },
              );

              let thenCount = 0;
              async function callback() {
                if (++thenCount === iterations) {
                  assert.strictEqual(task.status, 'canceled', `task.status at thenCount=${thenCount} ${reportTask(task)}`);

                  assert.areTaskQueuesEmpty();

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
                  suspend: true,
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

                      assert.areTaskQueuesEmpty();
                    } else {
                      nextTask = createNextTask();
                    }
                  },
                  {
                    suspend: true,
                  },
                );
              }

              nextTask = createNextTask();

              let thenCount = 0;
              async function callback() {
                if (++thenCount === iterations) {
                  assert.strictEqual(nextTask.status, 'completed', `nextTask.status at thenCount=${thenCount} ${reportTask(nextTask)}`);
                  assert.strictEqual(task.status, 'canceled', `task.status at thenCount=${thenCount} ${reportTask(task)}`);

                  assert.areTaskQueuesEmpty();

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
                  suspend: true,
                },
              );

              async function yieldAndVerify() {
                await sut.yield();

                assert.strictEqual(count, ++yieldCount, 'count === ++yieldCount');

                if (yieldCount < iterations) {
                  // eslint-disable-next-line @typescript-eslint/no-floating-promises
                  yieldAndVerify();
                } else {
                  task.cancel();

                  assert.areTaskQueuesEmpty();

                  resolve();
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
                  suspend: true,
                },
              );

              let otherCount = 0;
              sut.queueTask(
                async function () {
                  ++otherCount;
                },
                {
                  preempt: true,
                  suspend: true,
                },
              );

              sut.queueTask(
                async function () {
                  ++otherCount;
                },
                {
                  preempt: false,
                  suspend: true,
                },
              );

              sut.queueTask(
                async function () {
                  ++otherCount;
                },
                {
                  preempt: true,
                  suspend: true,
                },
              );

              sut.queueTask(
                async function () {
                  ++otherCount;
                },
                {
                  preempt: false,
                  suspend: true,
                },
              );

              await sut.yield();

              assert.strictEqual(count, 1, 'count');
              assert.strictEqual(otherCount, 4, 'otherCount');

              task.cancel();

              assert.areTaskQueuesEmpty();
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
              suspend: true,
            },
          );

          const primerCancelTask = sut.queueTask(
            async function () {
              assert.strictEqual(primerTask.status, 'pending', `primerTask.status in primerCancelTask ${reportTask(primerTask)}`);
              assert.strictEqual(primerCancelTask.status, 'running', `primerCancelTask.status in primerCancelTask ${reportTask(primerCancelTask)}`);

              primerTask.cancel();

              assert.areTaskQueuesEmpty();
            },
            {
              suspend: true,
            },
          );

          await primerTask.result;
          assert.strictEqual(primerTask.status, 'pending', `primerTask.status after awaiting primerTask.result ${reportTask(primerTask)}`);
          assert.strictEqual(primerCancelTask.status, 'pending', `primerCancelTask.status after awaiting primerTask.result ${reportTask(primerCancelTask)}`);

          await primerCancelTask.result;
          assert.strictEqual(primerTask.status, 'canceled', `primerTask.status after awaiting primerCancelTask.result ${reportTask(primerTask)}`);
          assert.strictEqual(primerCancelTask.status, 'completed', `primerCancelTask.status after awaiting primerCancelTask.result ${reportTask(primerCancelTask)}`);

          assert.areTaskQueuesEmpty();

          let count = 0;
          let yieldCount = 0;

          const persistentTask = sut.queueTask(
            async function () {
              assert.strictEqual(persistentTask.status, 'running', `persistentTask.status in persistentTask ${reportTask(persistentTask)}`);
              assert.strictEqual(++count, yieldCount + 1, `++count (${count}) === yieldCount + 1 (${yieldCount + 1}) in persistentTask`);
            },
            {
              persistent: true,
              suspend: true,
            },
          );

          await sut.yield();

          assert.strictEqual(count, ++yieldCount, `count (${count}) === ++yieldCount (${yieldCount}) after awaiting sut.yield()`);

          persistentTask.cancel();

          assert.areTaskQueuesEmpty();
        });
      });
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

      const opts: QueueTaskOptions = {
        suspend: true,
      };

      const task0 = platform.taskQueue.queueTask(callback0, opts);
      const task1 = platform.taskQueue.queueTask(callback1, opts);
      const task2 = platform.taskQueue.queueTask(callback2, opts);

      assert.deepStrictEqual(states, [TaskState.NotStarted, TaskState.NotStarted, TaskState.NotStarted], `state after queueing 3 tasks`);

      await task0.result;

      // Note: the assertion pattern here is to verify that the next task is started on the next 'cycle' rather than immediately after the previous task finished.
      // If we were to verify the opposite, the expected state would be [Finished, Started, NotStarted] instead of [Finished, NotStarted, NotStarted].
      assert.deepStrictEqual(states, [TaskState.Finished, TaskState.NotStarted, TaskState.NotStarted], `state after awaiting task0`);

      await task1.result;

      assert.deepStrictEqual(states, [TaskState.Finished, TaskState.Finished, TaskState.NotStarted], `state after awaiting task1`);

      await task2.result;

      assert.deepStrictEqual(states, [TaskState.Finished, TaskState.Finished, TaskState.Finished], `state after awaiting task2`);

      assert.areTaskQueuesEmpty();
    });
  });

  it('2 persistent delayed tasks with different delays retain correct timing', async function () {
    let counter10 = 0;
    let counter20 = 0;

    const task10 = platform.taskQueue.queueTask(
      function () {
        ++counter10;
      },
      {
        persistent: true,
        delay: 10,
      }
    );

    const task20 =platform.taskQueue.queueTask(
      function () {
        ++counter20;
      },
      {
        persistent: true,
        delay: 20,
      }
    );

    const task = platform.taskQueue.queueTask(
      noop,
      {
        persistent: true,
        delay: 100,
      }
    );

    await task.result;

    task10.cancel();
    task20.cancel();
    task.cancel();

    if (Math.abs(counter10  - counter20 * 2) > 2) {
      assert.fail('too far apart');
    }

    assert.areTaskQueuesEmpty();
  });

  it('3 persistent delayed tasks with different delays retain correct timing', async function () {
    let counter10 = 0;
    let counter20 = 0;
    let counter40 = 0;

    const task10 = platform.taskQueue.queueTask(
      function () {
        ++counter10;
      },
      {
        persistent: true,
        delay: 10,
      }
    );

    const task20 = platform.taskQueue.queueTask(
      function () {
        ++counter20;
      },
      {
        persistent: true,
        delay: 20,
      }
    );

    const task40 =platform.taskQueue.queueTask(
      function () {
        ++counter40;
      },
      {
        persistent: true,
        delay: 40,
      }
    );

    const task = platform.taskQueue.queueTask(
      noop,
      {
        persistent: true,
        delay: 200,
      }
    );

    await task.result;

    task10.cancel();
    task20.cancel();
    task40.cancel();
    task.cancel();

    if (Math.abs(counter10  - counter20 * 2) > 4 || Math.abs(counter20  - counter40 * 2) > 4) {
      assert.fail('too far apart');
    }

    assert.areTaskQueuesEmpty();
  });
});
