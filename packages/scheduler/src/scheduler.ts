import { DI, IPlatform } from '@aurelia/kernel';

import {
  defaultQueueTaskOptions,
  QueueTaskOptions,
  QueueTaskTargetOptions,
  TaskQueuePriority,
} from './types';
import {
  IFlushRequestorFactory,
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
  getTaskQueue(priority: TaskQueuePriority): TaskQueue;
  yield(priority: TaskQueuePriority): Promise<void>;
  queueTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskTargetOptions): ITask<T>;

  getRenderTaskQueue(): TaskQueue;
  getMacroTaskQueue(): TaskQueue;
  getPostRenderTaskQueue(): TaskQueue;

  yieldRenderTask(): Promise<void>;
  yieldMacroTask(): Promise<void>;
  yieldPostRenderTask(): Promise<void>;
  yieldAll(repeat?: number): Promise<void>;

  queueRenderTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): ITask<T>;
  queueMacroTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): ITask<T>;
  queuePostRenderTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): ITask<T>;
}

export class Scheduler implements IScheduler {
  private readonly taskQueues: [
    TaskQueue,
    TaskQueue,
    TaskQueue,
  ];
  private readonly render: TaskQueue;
  private readonly macroTask: TaskQueue;
  private readonly postRender: TaskQueue;

  public constructor(
    platform: IPlatform,
    renderFactory: IFlushRequestorFactory,
    macroTaskFactory: IFlushRequestorFactory,
    postRenderFactory: IFlushRequestorFactory,
  ) {
    this.taskQueues = [
      this.render = (
        new TaskQueue(platform, TaskQueuePriority.render, renderFactory)
      ),
      this.macroTask = (
        new TaskQueue(platform, TaskQueuePriority.macroTask, macroTaskFactory)
      ),
      this.postRender = (
        new TaskQueue(platform, TaskQueuePriority.postRender, postRenderFactory)
      ),
    ];

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

  public getRenderTaskQueue(): TaskQueue {
    return this.render;
  }
  public getMacroTaskQueue(): TaskQueue {
    return this.macroTask;
  }
  public getPostRenderTaskQueue(): TaskQueue {
    return this.postRender;
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
      await this.yieldRenderTask();
      await this.yieldMacroTask();
      await this.yieldPostRenderTask();
    }
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

