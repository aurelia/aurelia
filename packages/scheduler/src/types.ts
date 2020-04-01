export const enum TaskQueuePriority {
  microTask  = 0,
  render     = 1,
  macroTask  = 2,
  postRender = 3,
  idle       = 4,
}

export type QueueTaskOptions = {
  /**
   * The number of milliseconds to wait before queueing the task.
   *
   * NOTE: just like `setTimeout`, there is no guarantee that the task will actually run
   * after the specified delay. It is merely a *minimum* delay.
   *
   * Defaults to `0`
   */
  delay?: number;
  /**
   * If `true`, the task will be run synchronously if it is the same priority as the
   * `TaskQueue` that is currently flushing. Otherwise, it will be run on the next tick.
   *
   * Defaults to `false`
   */
  preempt?: boolean;
  /**
   * If `true`, the task will be added back onto the queue after it finished running, indefinitely, until manually canceled.
   *
   * Defaults to `false`
   */
  persistent?: boolean;
  /**
   * If `true`, the task will be kept in-memory after finishing, so that it can be reused for future tasks for efficiency.
   *
   * Defaults to `true`
   */
  reusable?: boolean;
};

export type QueueTaskTargetOptions = QueueTaskOptions & {
  priority?: TaskQueuePriority;
};

export const defaultQueueTaskOptions: Required<QueueTaskTargetOptions> = {
  delay: 0,
  preempt: false,
  priority: TaskQueuePriority.render,
  persistent: false,
  reusable: true,
};

export interface IFlushRequestor {
  request(): void;
  cancel(): void;

  subscribe(callback: () => void): void;
  unsubscribe(): void;
}

export type PResolve<T> = (value?: T | PromiseLike<T>) => void;
export type PReject<T = any> = (reason?: T) => void;
let $resolve: PResolve<any>;
let $reject: PReject;
function executor<T>(resolve: PResolve<T>, reject: PReject): void {
  $resolve = resolve;
  $reject = reject;
}

export class ExposedPromise<T = void> extends Promise<T> {
  public readonly resolve: PResolve<T>;
  public readonly reject: PReject;

  public constructor() {
    super(executor);
    this.resolve = $resolve;
    this.reject = $reject;
  }
}
