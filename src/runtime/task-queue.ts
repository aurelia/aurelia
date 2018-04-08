import { DOM } from './dom';
import { ICallable } from './interfaces';
import { DI } from './di';

let hasSetImmediate = typeof setImmediate === 'function';

export const ITaskQueue = DI.createInterface('ITaskQueue');

export interface ITaskQueue {
  /**
   * Whether the queue is in the process of flushing.
   */
  flushing: boolean;

  /**
   * Enables long stack traces for queued tasks.
   */
  longStacks: boolean;

  /**
  * Queues a task on the micro task queue for ASAP execution.
  * @param task The task to queue up for ASAP execution.
  */
  queueMicroTask(task: ICallable & { stack?: string }): void

  /**
  * Immediately flushes the micro task queue.
  */
  flushMicroTaskQueue(): void

  /**
  * Queues a task on the macro task queue for turn-based execution.
  * @param task The task to queue up for turn-based execution.
  */
  queueTask(task: ICallable & { stack?: string }): void

  /**
  * Immediately flushes the task queue.
  */
  flushTaskQueue(): void
}

function makeRequestFlushFromMutationObserver(flush: MutationCallback) {
  let toggle = 1;
  let observer = DOM.createMutationObserver(flush);
  let node = DOM.createTextNode('');
  observer.observe(node, { characterData: true });
  return function requestFlush() {
    toggle = -toggle;
    node.data = toggle.toString();
  };
}

function makeRequestFlushFromTimer(flush: () => void) {
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

class TaskQueueImplementation implements ITaskQueue {
  private microTaskQueue: ICallable[] = [];
  private taskQueue: ICallable[] = [];
  private microTaskQueueCapacity = 1024;
  private requestFlushMicroTaskQueue = makeRequestFlushFromMutationObserver(() => this.flushMicroTaskQueue());
  private requestFlushTaskQueue = makeRequestFlushFromTimer(() => this.flushTaskQueue());
  private stack: string;

  flushing = false;
  longStacks = false;

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
      this.onError(error, task);
    } finally {
      this.flushing = false;
    }
  }

  queueMicroTask(task: ICallable & { stack?: string }): void {
    if (this.microTaskQueue.length < 1) {
      this.requestFlushMicroTaskQueue();
    }

    if (this.longStacks) {
      task.stack = this.prepareMicroTaskStack();
    }

    this.microTaskQueue.push(task);
  }

  flushMicroTaskQueue(): void {
    let queue = this.microTaskQueue;
    this.flushQueue(queue, this.microTaskQueueCapacity);
    queue.length = 0;
  }

  queueTask(task: ICallable & { stack?: string }): void {
    if (this.taskQueue.length < 1) {
      this.requestFlushTaskQueue();
    }

    if (this.longStacks) {
      task.stack = this.prepareTaskStack();
    }

    this.taskQueue.push(task);
  }

  flushTaskQueue(): void {
    let queue = this.taskQueue;
    this.taskQueue = []; //recursive calls to queueTask should be scheduled after the next cycle
    this.flushQueue(queue, Number.MAX_VALUE);
  }

  //Overwritten in debug mode.
  private prepareTaskStack(): string {
    throw new Error('TaskQueue long stack traces are only available in debug mode.');
  }

  //Overwritten in debug mode.
  private prepareMicroTaskStack(): string {
    throw new Error('TaskQueue long stack traces are only available in debug mode.');
  }

  //Overwritten in debug mode via late binding.
  private onError(error: any, task: any){
    if ('onError' in task) {
      task.onError(error);
    } else if (hasSetImmediate) {
      setImmediate(() => { throw error; });
    } else {
      setTimeout(() => { throw error; }, 0);
    }
  }
}

export const TaskQueue: ITaskQueue = new TaskQueueImplementation();
