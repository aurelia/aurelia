import { TaskQueuePriority } from './types';
import { TaskQueue, TaskCallback } from './task-queue';
export declare class TaskAbortError<T = any> extends Error {
    task: Task<T>;
    constructor(task: Task<T>);
}
export declare type TaskStatus = 'pending' | 'running' | 'completed' | 'canceled';
export declare type UnwrapPromise<T> = T extends Promise<infer R> ? R : T;
export interface ITask<T = any> {
    readonly result: Promise<UnwrapPromise<T>>;
    readonly status: TaskStatus;
    readonly priority: TaskQueuePriority;
    run(): void;
    cancel(): boolean;
}
export declare class Task<T = any> implements ITask {
    readonly taskQueue: TaskQueue;
    createdTime: number;
    queueTime: number;
    preempt: boolean;
    persistent: boolean;
    async: boolean | 'auto';
    readonly reusable: boolean;
    callback: TaskCallback<T>;
    readonly id: number;
    next: Task<T> | undefined;
    prev: Task<T> | undefined;
    private resolve;
    private reject;
    private _result;
    get result(): Promise<UnwrapPromise<T>>;
    private _status;
    get status(): TaskStatus;
    readonly priority: TaskQueuePriority;
    constructor(taskQueue: TaskQueue, createdTime: number, queueTime: number, preempt: boolean, persistent: boolean, async: boolean | 'auto', reusable: boolean, callback: TaskCallback<T>);
    run(): void;
    cancel(): boolean;
    reset(time: number): void;
    reuse(time: number, delay: number, preempt: boolean, persistent: boolean, async: boolean | 'auto', callback: TaskCallback<T>): void;
    dispose(): void;
}
//# sourceMappingURL=task.d.ts.map