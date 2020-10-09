import { DI } from '@aurelia/kernel';

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
  Now,
} from './now';
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
  getIdleTaskQueue(): ITaskQueue;

  yieldMicroTask(): Promise<void>;
  yieldRenderTask(): Promise<void>;
  yieldMacroTask(): Promise<void>;
  yieldPostRenderTask(): Promise<void>;
  yieldIdleTask(): Promise<void>;
  yieldAll(repeat?: number): Promise<void>;

  queueMicroTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): ITask<T>;
  queueRenderTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): ITask<T>;
  queueMacroTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): ITask<T>;
  queuePostRenderTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): ITask<T>;
  queueIdleTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): ITask<T>;
}

export class Scheduler implements IScheduler {
  private readonly taskQueues: [
    TaskQueue,
    TaskQueue,
    TaskQueue,
    TaskQueue,
    TaskQueue,
  ];
  private readonly microtask: TaskQueue;
  private readonly render: TaskQueue;
  private readonly macroTask: TaskQueue;
  private readonly postRender: TaskQueue;
  private readonly idle: TaskQueue;

  public constructor(
    now: Now,
    microtaskFactory: IFlushRequestorFactory,
    renderFactory: IFlushRequestorFactory,
    macroTaskFactory: IFlushRequestorFactory,
    postRenderFactory: IFlushRequestorFactory,
    idleFactory: IFlushRequestorFactory,
  ) {
    this.taskQueues = [
      this.microtask = (
        new TaskQueue(now, TaskQueuePriority.microTask, this, microtaskFactory)
      ),
      this.render = (
        new TaskQueue(now, TaskQueuePriority.render, this, renderFactory)
      ),
      this.macroTask = (
        new TaskQueue(now, TaskQueuePriority.macroTask, this, macroTaskFactory)
      ),
      this.postRender = (
        new TaskQueue(now, TaskQueuePriority.postRender, this, postRenderFactory)
      ),
      this.idle = (
        new TaskQueue(now, TaskQueuePriority.idle, this, idleFactory)
      ),
    ];

    this.yieldMicroTask = this.yieldMicroTask.bind(this);
    this.yieldRenderTask = this.yieldRenderTask.bind(this);
    this.yieldMacroTask = this.yieldMacroTask.bind(this);
    this.yieldPostRenderTask = this.yieldPostRenderTask.bind(this);
    this.yieldIdleTask = this.yieldIdleTask.bind(this);
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
    const { delay, preempt, priority, persistent, reusable, async } = { ...defaultQueueTaskOptions, ...opts };
    return this.taskQueues[priority].queueTask(callback, { delay, preempt, persistent, reusable, async });
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
  public getIdleTaskQueue(): ITaskQueue {
    return this.idle;
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
  public yieldIdleTask(): Promise<void> {
    return this.idle.yield();
  }
  public async yieldAll(repeat: number = 1): Promise<void> {
    while (repeat-- > 0) {
      await this.yieldMicroTask();
      await this.yieldRenderTask();
      await this.yieldMacroTask();
      await this.yieldPostRenderTask();
      await this.yieldIdleTask();
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
  public queueIdleTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): ITask<T> {
    return this.idle.queueTask(callback, opts);
  }
}

