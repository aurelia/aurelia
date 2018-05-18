import { ICallable } from './interfaces';
import { DI } from './di';
import { Reporter } from './reporter';
import { PLATFORM } from './platform';

export const ITaskQueue = DI.createInterface('ITaskQueue')
  .withDefault(x => x.singleton(TaskQueueImplementation));

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

class TaskQueueImplementation implements ITaskQueue {
  private microTaskQueue: ICallable[] = [];
  private taskQueue: ICallable[] = [];
  private microTaskQueueCapacity = 1024;
  private requestFlushMicroTaskQueue = PLATFORM.createMicroTaskFlushRequestor(() => this.flushMicroTaskQueue());
  private requestFlushTaskQueue = PLATFORM.createTaskFlushRequester(() => this.flushTaskQueue());
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

  // Overwritten in debug mode.
  private prepareTaskStack(): string {
    throw Reporter.error(13);
  }

  // Overwritten in debug mode.
  private prepareMicroTaskStack(): string {
    throw Reporter.error(13);
  }

  // Overwritten in debug mode via late binding.
  private onError(error: any, task: any){
    if ('onError' in task) {
      task.onError(error);
    } else {
      setTimeout(() => { throw error; }, 0);
    }
  }
}

export const TaskQueue: ITaskQueue = new TaskQueueImplementation();
