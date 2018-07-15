import { ICallable } from '../kernel/interfaces';
import { DI } from '../kernel/di';
import { Reporter } from '../kernel/reporter';
import { PLATFORM } from '../kernel/platform';

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

export const ITaskQueue = DI.createInterface<ITaskQueue>()
  .withDefault(x => x.singleton(TaskQueue));

/*@internal*/
export class TaskQueue implements ITaskQueue {
  private microTaskQueue: ICallable[] = new Array(0xFF);
  private microTaskCursor = 0;
  private microTaskIndex = 0;
  private taskQueue: ICallable[] = new Array(0xFF);
  private taskCursor = 0;
  private taskIndex = 0;
  private requestFlushMicroTaskQueue = PLATFORM.createMicroTaskFlushRequestor(() => this.flushMicroTaskQueue());
  private requestFlushTaskQueue = PLATFORM.createTaskFlushRequester(() => this.flushTaskQueue());
  private stack: string;

  flushing = false;
  longStacks = false;

  queueMicroTask(task: ICallable & { stack?: string }): void {
    if (this.microTaskIndex === this.microTaskCursor) {
      this.requestFlushMicroTaskQueue();
    }
    if (this.longStacks) {
      task.stack = this.prepareMicroTaskStack();
    }
    this.microTaskQueue[this.microTaskCursor++] = task;
    if (this.microTaskCursor === this.microTaskQueue.length) {
      this.microTaskQueue.length += 0xFF;
    }
  }

  flushMicroTaskQueue(): void {
    let task;
    const longStacks = this.longStacks;
    const queue = this.microTaskQueue;

    this.flushing = true;
    while (this.microTaskIndex < this.microTaskCursor) {
      task = queue[this.microTaskIndex];
      queue[this.microTaskIndex] = undefined;
      if (longStacks) {
        this.stack = typeof task.stack === 'string' ? task.stack : undefined;
      }
      try {
        task.call();
      } catch (error) {
        this.onError(error, task);
        break;
      }
      this.microTaskIndex++;
    }
    this.microTaskIndex = this.microTaskCursor = 0;
    this.flushing = false;
  }

  queueTask(task: ICallable & { stack?: string }): void {
    if (this.taskIndex === this.taskCursor) {
      this.taskIndex = this.taskCursor = 0;
      this.requestFlushTaskQueue();
    }
    if (this.longStacks) {
      task.stack = this.prepareTaskStack();
    }
    this.taskQueue[this.taskCursor++] = task;
    if (this.taskCursor === this.taskQueue.length) {
      this.taskQueue.length += 0xFF;
    }
  }

  flushTaskQueue(): void {
    let task;
    const longStacks = this.longStacks;
    const queue = this.taskQueue;
    const cursor = this.taskCursor;

    this.flushing = true;
    while (this.taskIndex !== cursor) {
      task = queue[this.taskIndex];
      queue[this.taskIndex] = undefined;
      if (longStacks) {
        this.stack = typeof task.stack === 'string' ? task.stack : undefined;
      }
      try {
        task.call();
      } catch (error) {
        this.onError(error, task);
        break;
      }
      this.taskIndex++;
    }
    this.flushing = false;
  }

  // Overwritten in debug mode.
  private prepareTaskStack(): string {
    throw Reporter.error(13);
  }

  // Overwritten in debug mode.
  private prepareMicroTaskStack(): string {
    throw Reporter.error(13);
  }

  // Overwritten in debug mode.
  private onError(error: any, task: any){
    if ('onError' in task) {
      task.onError(error);
    } else {
      setTimeout(() => { throw error; }, 0);
    }
  }
}
