import { TestContext, assert } from '@aurelia/testing';
import { TaskQueuePriority, QueueTaskOptions } from '@aurelia/runtime';

describe.only('Scheduler', function () {
  // There is only ever one global scheduler, so we might as well store it here instead of initializing all extra boilerplate each test
  const sut = TestContext.createHTMLTestContext().scheduler;

  function queueRecursive(opts: QueueTaskOptions, count: number, cb: () => void) {
    function $queue() {
      cb();
      if (--count > 0) {
        sut.queueTask($queue, opts);
      }
    }

    sut.queueTask($queue, opts);
  }

  function queueSequential(opts: QueueTaskOptions, count: number, cb: () => void) {
    while (count-- > 0) {
      sut.queueTask(cb, opts);
    }
  }

  const specs = [
    {
      priority: TaskQueuePriority.microTask,
      name: 'microTask',
    },
    {
      priority: TaskQueuePriority.eventLoop,
      name: 'eventLoop',
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
  ];

  for (const { priority, name } of specs) {
    describe(`can queue ${name}`, function () {
      it('x1, {preempt: false, delay: 0}', function (done) {
        sut.queueTask(
          function () {
            done();
          },
          {
            priority,
            preempt: false,
            delay: 0,
          },
        );
      });

      it('x1, {preempt: true, delay: 0}', function (done) {
        sut.queueTask(
          function () {
            done();
          },
          {
            priority,
            preempt: true,
            delay: 0,
          },
        );
      });

      it('x1, {delay: 5}', function (done) {
        sut.queueTask(
          function () {
            done();
          },
          {
            priority,
            delay: 5,
          },
        );
      });

      it('x1, {delay: 50}', function (done) {
        sut.queueTask(
          function () {
            done();
          },
          {
            priority,
            delay: 50,
          },
        );
      });

      it('x1, queue {delay: 5} -> {delay: 0}, invoke {delay: 0} -> {delay: 5}', function (done) {
        const calls: number[] = [];

        sut.queueTask(
          function () {
            calls.push(1);

            assert.deepStrictEqual(calls, [2, 1], 'calls');
            done();
          },
          {
            priority,
            delay: 5,
          },
        );

        sut.queueTask(
          function () {
            calls.push(2);
          },
          {
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
            done();
          },
          {
            priority,
            preempt: false,
          },
        );

        sut.queueTask(
          function () {
            calls.push(2);
          },
          {
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
            done();
          },
          {
            priority,
            delay: 5,
          },
        );

        sut.queueTask(
          function () {
            calls.push(2);
          },
          {
            priority,
            preempt: false,
          },
        );

        sut.queueTask(
          function () {
            calls.push(3);
          },
          {
            priority,
            preempt: true,
          },
        );
      });

      for (const delay of [1, 10]) {
        for (const expected of [3, 10]) {
          it(`${name} x${expected} sequential, {delay: ${delay}}`, function (done) {
            let actual = 0;
            function increment() {
              if (++actual === expected) {
                done();
              }
            }
            queueSequential({ priority, delay }, expected, increment);
          });

          it(`${name} x${expected} recursive, {delay: ${delay}}`, function (done) {
            let actual = 0;
            function increment() {
              if (++actual === expected) {
                done();
              }
            }
            queueRecursive({ priority, delay }, expected, increment);
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
            priority,
            delay: 5,
          },
        );

        return task.result;
      });

      it('x1, {delay: 50}', function () {
        const task = sut.queueTask(
          function () {
            /* */
          },
          {
            priority,
            delay: 50,
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
          },
          {
            priority,
            delay: 5,
          },
        );

        sut.queueTask(
          function () {
            calls.push(2);
          },
          {
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
          },
          {
            priority,
            preempt: false,
          },
        );

        sut.queueTask(
          function () {
            calls.push(2);
          },
          {
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
          },
          {
            priority,
            delay: 5,
          },
        );

        sut.queueTask(
          function () {
            calls.push(2);
          },
          {
            priority,
            preempt: false,
          },
        );

        sut.queueTask(
          function () {
            calls.push(3);
          },
          {
            priority,
            preempt: true,
          },
        );

        return task.result;
      });

      for (const delay of [1, 10]) {
        for (const expected of [3, 10]) {
          it(`x${expected} sequential, {delay: ${delay}}`, async function () {
            let actual = 0;
            queueSequential({ priority, delay }, expected, function () {
              ++actual;
            });

            await sut.getTaskQueue(priority).yield();
            assert.strictEqual(actual, expected, 'callCount');
          });

          it(`x${expected} recursive, {delay: ${delay}}`, async function () {
            let actual = 0;
            queueRecursive({ priority, delay }, expected, function () {
              ++actual;
            });

            await sut.getTaskQueue(priority).yield();
            assert.strictEqual(actual, expected, 'callCount');
          });
        }
      }
    });
  }
});
