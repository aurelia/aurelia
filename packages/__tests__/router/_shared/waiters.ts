/* eslint-disable sonarjs/prefer-immediate-return */
import { IContainer, ILogger } from '@aurelia/kernel';
import { IScheduler, TaskQueuePriority } from '@aurelia/scheduler';
import { HTMLDOM } from '@aurelia/runtime-html';

export function setTimeoutWaiter(
  container: IContainer,
  ms: number,
  traceLabel: string,
): Promise<void> {
  const dom = container.get(HTMLDOM);
  const logger = container.get(ILogger).scopeTo(traceLabel);

  logger.trace(`setTimeout(ms:${ms}) - queueing`);

  return new Promise(function (resolve) {
    dom.window.setTimeout(function () {
      logger.trace(`setTimeout(ms:${ms}) - resolving`);

      resolve();
    }, ms);
  });
}

function stringifyPriority(
  priority: (
    TaskQueuePriority.microTask |
    TaskQueuePriority.macroTask |
    TaskQueuePriority.render
  ),
): (
  'MicroTask' |
  'MacroTask' |
  'RenderTask'
) {
  switch (priority) {
    case TaskQueuePriority.microTask: return 'MicroTask';
    case TaskQueuePriority.macroTask: return 'MacroTask';
    case TaskQueuePriority.render: return 'RenderTask';
  }
}

export function delayedTaskWaiter(
  container: IContainer,
  ms: number,
  priority: (
    TaskQueuePriority.microTask |
    TaskQueuePriority.macroTask |
    TaskQueuePriority.render
  ),
  traceLabel: string,
): Promise<void> {
  const taskQueue = container.get(IScheduler).getTaskQueue(priority);
  const logger = container.get(ILogger).scopeTo(traceLabel);

  logger.trace(`yieldDelayed${stringifyPriority(priority)}(ms:${ms}) - queueing`);

  const task = taskQueue.queueTask(
    function noop() {
      logger.trace(`yieldDelayed${stringifyPriority(priority)}(ms:${ms}) - resolving`);
    },
    {
      delay: ms,
    },
  );
  const promise = task.result;
  return promise;
}

export function asyncTaskWaiter(
  container: IContainer,
  ms: number,
  priority: (
    TaskQueuePriority.microTask |
    TaskQueuePriority.macroTask |
    TaskQueuePriority.render
  ),
  traceLabel: string,
): Promise<void> {
  const dom = container.get(HTMLDOM);
  const taskQueue = container.get(IScheduler).getTaskQueue(priority);
  const logger = container.get(ILogger).scopeTo(traceLabel);

  logger.trace(`yieldAsync${stringifyPriority(priority)}(ms:${ms}) - queueing`);

  const task = taskQueue.queueTask(
    function () {
      return new Promise<void>(function (resolve) {
        dom.window.setTimeout(function () {
          logger.trace(`yieldAsync${stringifyPriority(priority)}(ms:${ms}) - resolving`);

          resolve();
        }, ms);
      });
    },
    {
      async: true,
    },
  );
  const promise = task.result;
  return promise;
}

export function taskLoopWaiter(
  container: IContainer,
  count: number,
  priority: (
    TaskQueuePriority.macroTask |
    TaskQueuePriority.render
  ),
  traceLabel: string,
): Promise<void> {
  let currentCount = 0;
  const taskQueue = container.get(IScheduler).getTaskQueue(priority);
  const logger = container.get(ILogger).scopeTo(traceLabel);

  logger.trace(`yield${stringifyPriority(priority)}Loop(count:${count}) - queueing`);

  return new Promise(function (resolve) {
    const task = taskQueue.queueTask(
      function () {
        if (++currentCount === count) {
          task.cancel();

          logger.trace(`yield${stringifyPriority(priority)}Loop(count:${count}) - resolving at count ${currentCount}`);

          resolve();
        } else {
          logger.trace(`yield${stringifyPriority(priority)}Loop(count:${count}) - still pending at count ${currentCount}`);
        }
      },
      {
        persistent: true,
      },
    );
  });
}
