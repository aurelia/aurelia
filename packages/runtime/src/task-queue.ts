import { DI, ICallable, PLATFORM, Reporter } from '@aurelia/kernel';

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
  private microTaskQueue: ICallable[] = new Array(0xFF); // a "fixed-size" preallocated task queue (it will be expanded in steps of 255 if it runs full)
  private microTaskCursor = 0; // the index of that last microTask that was queued
  private microTaskIndex = 0; // the index of the current microTask being executed
  private taskQueue: ICallable[] = new Array(0xFF);
  private taskCursor = 0;
  private taskIndex = 0;
  private requestFlushMicroTaskQueue = PLATFORM.createMicroTaskFlushRequestor(() => this.flushMicroTaskQueue());
  private requestFlushTaskQueue = PLATFORM.createTaskFlushRequester(() => this.flushTaskQueue());
  private stack: string;

  public flushing = false;
  public longStacks = false;

  public queueMicroTask(task: ICallable & { stack?: string }): void {
    // the cursor and the index being the same number, is the equivalent of an empty queue
    // note: when a queue is done flushing, both of these are set to 0 again to keep queue expansion to a minimum
    if (this.microTaskIndex === this.microTaskCursor) {
      this.requestFlushMicroTaskQueue();
    }
    if (this.longStacks) {
      task.stack = this.prepareMicroTaskStack();
    }
    this.microTaskQueue[this.microTaskCursor++] = task;
    // if the queue is full, simply increase its size
    if (this.microTaskCursor === this.microTaskQueue.length) {
      this.microTaskQueue.length += 0xFF;
    }
  }

  public flushMicroTaskQueue(): void {
    let task;
    const longStacks = this.longStacks;
    const queue = this.microTaskQueue;

    this.flushing = true;
    // when the index catches up to the cursor, that means the queue is empty
    // note: the cursor can change during flushing (if new microTasks are queued from within microTasks)
    while (this.microTaskIndex < this.microTaskCursor) {
      task = queue[this.microTaskIndex];
      // immediately clear the array item to minimize memory usage
      queue[this.microTaskIndex] = undefined;
      if (longStacks) {
        this.stack = typeof task.stack === 'string' ? task.stack : undefined;
      }
      // doing the try/catch only on the bit that really needs it, so the loop itself can more
      // easily be optimized by the browser runtime
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

  public queueTask(task: ICallable & { stack?: string }): void {
    // works similar to queueMicroTask, with the difference being that the taskQueue will
    // only run tasks up to the cursor of when the flush was invoked
    if (this.taskIndex === this.taskCursor) {
      // because flushTaskQueue isn't allowed to run up to the current value of the cursor, it also
      // can't reset the indices to 0 without potentially causing tasks to get lost, so we do it here
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

  public flushTaskQueue(): void {
    let task;
    const longStacks = this.longStacks;
    const queue = this.taskQueue;
    const cursor = this.taskCursor;

    this.flushing = true;
    // only run up to the cursor that it was at the time of flushing
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
