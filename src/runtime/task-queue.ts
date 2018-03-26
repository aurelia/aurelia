import { DOM } from './dom';
import { ITaskQueue, ICallable } from './binding/binding-interfaces';

let hasSetImmediate = typeof setImmediate === 'function';

//DEBUG
const stackSeparator = '\nEnqueued in TaskQueue by:\n';
const microStackSeparator = '\nEnqueued in MicroTaskQueue by:\n';
//DEBUG-END

function makeRequestFlushFromMutationObserver(flush: any) {
  let toggle = 1;
  let observer = DOM.createMutationObserver(flush);
  let node = DOM.createTextNode('');
  observer.observe(node, { characterData: true });
  return function requestFlush() {
    toggle = -toggle;
    node.data = toggle.toString();
  };
}

function makeRequestFlushFromTimer(flush: any) {
  return function requestFlush() {
    // We dispatch a timeout with a specified delay of 0 for engines that
    // can reliably accommodate that request. This will usually be snapped
    // to a 4 milisecond delay, but once we're flushing, there's no delay
    // between events.
    let timeoutHandle = setTimeout(handleFlushTimer, 0);
    // However, since this timer gets frequently dropped in Firefox
    // workers, we enlist an interval handle that will try to fire
    // an event 20 times per second until it succeeds.
    let intervalHandle = setInterval(handleFlushTimer, 50);
    function handleFlushTimer() {
      // Whichever timer succeeds will cancel both timers and request the
      // flush.
      clearTimeout(timeoutHandle);
      clearInterval(intervalHandle);
      flush();
    }
  };
}

function onError(error: any, task: any, longStacks: any) {
  //DEBUG
  if (longStacks &&
    task.stack &&
    typeof error === 'object' &&
    error !== null) {
    // Note: IE sets error.stack when throwing but does not override a defined .stack.
    error.stack = filterFlushStack(error.stack) + task.stack;
  }
  //DEBUG-END

  if ('onError' in task) {
    task.onError(error);
  } else if (hasSetImmediate) {
    setImmediate(() => { throw error; });
  } else {
    setTimeout(() => { throw error; }, 0);
  }
}

/**
* Either a Function or a class with a call method that will do work when dequeued.
*/
export interface Task {
  /**
  * Call it.
  */
  call(): void;
}

/**
* Implements an asynchronous task queue.
*/
export class TaskQueue implements ITaskQueue {
  public static instance = new TaskQueue();

  /**
   * Whether the queue is in the process of flushing.
   */
  flushing = false;

  /**
   * Enables long stack traces for queued tasks.
   */
  longStacks = false;

  private microTaskQueue: ICallable[] = [];
  private taskQueue: ICallable[] = [];
  private microTaskQueueCapacity = 1024;
  private requestFlushMicroTaskQueue = makeRequestFlushFromMutationObserver(() => this.flushMicroTaskQueue());
  private requestFlushTaskQueue = makeRequestFlushFromTimer(() => this.flushTaskQueue());
  private stack: string;

  /**
  * Immediately flushes the queue.
  * @param queue The task queue or micro task queue
  * @param capacity For periodically shift 1024 MicroTasks off the queue
  */
  private flushQueue(queue: (ICallable & { stack?: string })[], capacity: number): void {
    let index = 0;
    let task;

    try {
      this.flushing = true;
      while (index < queue.length) {
        task = queue[index];
        if (this.longStacks) {
          this.stack = typeof task.stack === 'string' ? task.stack : undefined;
        }
        task.call();
        index++;

        // Prevent leaking memory for long chains of recursive calls to `queueMicroTask`.
        // If we call `queueMicroTask` within a MicroTask scheduled by `queueMicroTask`, the queue will
        // grow, but to avoid an O(n) walk for every MicroTask we execute, we don't
        // shift MicroTasks off the queue after they have been executed.
        // Instead, we periodically shift 1024 MicroTasks off the queue.
        if (index > capacity) {
          // Manually shift all values starting at the index back to the
          // beginning of the queue.
          for (let scan = 0, newLength = queue.length - index; scan < newLength; scan++) {
            queue[scan] = queue[scan + index];
          }

          queue.length -= index;
          index = 0;
        }
      }
    } catch (error) {
      onError(error, task, this.longStacks);
    } finally {
      this.flushing = false;
    }
  }

  /**
  * Queues a task on the micro task queue for ASAP execution.
  * @param task The task to queue up for ASAP execution.
  */
  queueMicroTask(task: (Task | Function) & { stack?: string }): void {
    if (this.microTaskQueue.length < 1) {
      this.requestFlushMicroTaskQueue();
    }

    //DEBUG
    if (this.longStacks) {
      task.stack = this.prepareQueueStack(microStackSeparator);
    }
    //DEBUG-END

    this.microTaskQueue.push(task);
  }

  /**
  * Queues a task on the macro task queue for turn-based execution.
  * @param task The task to queue up for turn-based execution.
  */
  queueTask(task: (Task | Function) & { stack?: string }): void {
    if (this.taskQueue.length < 1) {
      this.requestFlushTaskQueue();
    }

    //DEBUG
    if (this.longStacks) {
      task.stack = this.prepareQueueStack(stackSeparator);
    }
    //DEBUG-END

    this.taskQueue.push(task);
  }

  /**
  * Immediately flushes the task queue.
  */
  flushTaskQueue(): void {
    let queue = this.taskQueue;
    this.taskQueue = []; //recursive calls to queueTask should be scheduled after the next cycle
    this.flushQueue(queue, Number.MAX_VALUE);
  }

  /**
  * Immediately flushes the micro task queue.
  */
  flushMicroTaskQueue(): void {
    let queue = this.microTaskQueue;
    this.flushQueue(queue, this.microTaskQueueCapacity);
    queue.length = 0;
  }

  //DEBUG
  private prepareQueueStack(separator: string) {
    let stack = separator + filterQueueStack(captureStack());

    if (typeof this.stack === 'string') {
      stack = filterFlushStack(stack) + this.stack;
    }

    return stack;
  }
  //DEBUG-END
}

//DEBUG
function captureStack() {
  let error = new Error();

  // Firefox, Chrome, Edge all have .stack defined by now, IE has not.
  if (error.stack) {
    return error.stack;
  }

  try {
    throw error;
  } catch (e) {
    return e.stack;
  }
}

function filterQueueStack(stack: string) {
  // Remove everything (error message + top stack frames) up to the topmost queueTask or queueMicroTask call
  return stack.replace(/^[\s\S]*?\bqueue(Micro)?Task\b[^\n]*\n/, '');
}

function filterFlushStack(stack: string) {
  // Remove bottom frames starting with the last flushTaskQueue or flushMicroTaskQueue
  let index = stack.lastIndexOf('flushMicroTaskQueue');

  if (index < 0) {
    index = stack.lastIndexOf('flushTaskQueue');
    if (index < 0) {
      return stack;
    }
  }

  index = stack.lastIndexOf('\n', index);

  return index < 0 ? stack : stack.substr(0, index);
  // The following would work but without regex support to match from end of string,
  // it's hard to ensure we have the last occurrence of "flushTaskQueue".
  // return stack.replace(/\n[^\n]*?\bflush(Micro)?TaskQueue\b[\s\S]*$/, "");
}
//DEBUG-END
