import { DI, IPlatform } from '@aurelia/kernel';

import {
  defaultQueueTaskOptions,
  QueueTaskOptions,
  QueueTaskTargetOptions,
  TaskQueuePriority,
} from './types';
import {
  IFlushRequestorFactory,
  ITaskQueue,
  TaskCallback,
  TaskQueue,
} from './task-queue';
import {
  Task,
  ITask,
} from './task';

const store = new WeakMap<object, IScheduler>();

export const IScheduler = DI.createInterface<IScheduler>('IScheduler').noDefault();
export interface IScheduler {
  getTaskQueue(priority: TaskQueuePriority): ITaskQueue;
  yield(priority: TaskQueuePriority): Promise<void>;
  queueTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskTargetOptions): ITask<T>;

  getMicroTaskQueue(): ITaskQueue;
  getRenderTaskQueue(): ITaskQueue;
  getMacroTaskQueue(): ITaskQueue;
  getPostRenderTaskQueue(): ITaskQueue;

  yieldMicroTask(): Promise<void>;
  yieldRenderTask(): Promise<void>;
  yieldMacroTask(): Promise<void>;
  yieldPostRenderTask(): Promise<void>;
  yieldAll(repeat?: number): Promise<void>;

  queueMicroTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): ITask<T>;
  queueRenderTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): ITask<T>;
  queueMacroTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): ITask<T>;
  queuePostRenderTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): ITask<T>;
}

export class Scheduler implements IScheduler {
  private readonly taskQueues: [
    TaskQueue,
    TaskQueue,
    TaskQueue,
    TaskQueue,
  ];
  private readonly microtask: TaskQueue;
  private readonly render: TaskQueue;
  private readonly macroTask: TaskQueue;
  private readonly postRender: TaskQueue;

  public constructor(
    platform: IPlatform,
    microtaskFactory: IFlushRequestorFactory,
    renderFactory: IFlushRequestorFactory,
    macroTaskFactory: IFlushRequestorFactory,
    postRenderFactory: IFlushRequestorFactory,
  ) {
    this.taskQueues = [
      this.microtask = (
        new TaskQueue(platform, TaskQueuePriority.microTask, this, microtaskFactory)
      ),
      this.render = (
        new TaskQueue(platform, TaskQueuePriority.render, this, renderFactory)
      ),
      this.macroTask = (
        new TaskQueue(platform, TaskQueuePriority.macroTask, this, macroTaskFactory)
      ),
      this.postRender = (
        new TaskQueue(platform, TaskQueuePriority.postRender, this, postRenderFactory)
      ),
    ];

    this.yieldMicroTask = this.yieldMicroTask.bind(this);
    this.yieldRenderTask = this.yieldRenderTask.bind(this);
    this.yieldMacroTask = this.yieldMacroTask.bind(this);
    this.yieldPostRenderTask = this.yieldPostRenderTask.bind(this);
    this.yieldAll = this.yieldAll.bind(this);
  }

  public static get(key: object): IScheduler | undefined {
    return store.get(key);
  }

  public static set(key: object, instance: IScheduler): void {
    store.set(key, instance);
  }

  public getTaskQueue(priority: TaskQueuePriority): TaskQueue {
    return this.taskQueues[priority];
  }

  public yield(priority: TaskQueuePriority): Promise<void> {
    return this.taskQueues[priority].yield();
  }

  public queueTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskTargetOptions): Task<T> {
    const { delay, preempt, priority, persistent, reusable, suspend } = { ...defaultQueueTaskOptions, ...opts };
    return this.taskQueues[priority].queueTask(callback, { delay, preempt, persistent, reusable, suspend });
  }

  public getMicroTaskQueue(): ITaskQueue {
    return this.microtask;
  }
  public getRenderTaskQueue(): ITaskQueue {
    return this.render;
  }
  public getMacroTaskQueue(): ITaskQueue {
    return this.macroTask;
  }
  public getPostRenderTaskQueue(): ITaskQueue {
    return this.postRender;
  }

  public yieldMicroTask(): Promise<void> {
    return this.microtask.yield();
  }
  public yieldRenderTask(): Promise<void> {
    return this.render.yield();
  }
  public yieldMacroTask(): Promise<void> {
    return this.macroTask.yield();
  }
  public yieldPostRenderTask(): Promise<void> {
    return this.postRender.yield();
  }
  public async yieldAll(repeat: number = 1): Promise<void> {
    while (repeat-- > 0) {
      await this.yieldMicroTask();
      await this.yieldRenderTask();
      await this.yieldMacroTask();
      await this.yieldPostRenderTask();
    }
  }

  public queueMicroTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): ITask<T> {
    return this.microtask.queueTask(callback, opts);
  }
  public queueRenderTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): ITask<T> {
    return this.render.queueTask(callback, opts);
  }
  public queueMacroTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): ITask<T> {
    return this.macroTask.queueTask(callback, opts);
  }
  public queuePostRenderTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): ITask<T> {
    return this.postRender.queueTask(callback, opts);
  }
}

