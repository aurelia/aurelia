import {
  DI,
  IContainer,
  IResolver,
  IServiceLocator,
  Key,
  Registration,
  Resolved,
} from '@aurelia/kernel';

export type PromiseOrTask = Promise<unknown> | ILifecycleTask;
export type MaybePromiseOrTask = void | PromiseOrTask;

export const LifecycleTask = {
  done: {
    done: true,
    canCancel(): boolean { return false; },
    cancel(): void { return; },
    wait(): Promise<unknown> { return Promise.resolve(); }
  }
};

export const enum TaskSlot {
  beforeCreate = 0,
  beforeRender = 1,
  beforeBind   = 2,
  beforeAttach = 3,
}

export const IStartTask = DI.createInterface<IStartTask>('IStartTask').noDefault();

export interface IStartTask {
  readonly slot: TaskSlot;
  resolveTask(): ILifecycleTask;
  register(container: IContainer): IContainer;
}

export interface ISlotChooser {
  beforeCreate(): IStartTask;
  beforeRender(): IStartTask;
  beforeBind(): IStartTask;
  beforeAttach(): IStartTask;
  at(slot: TaskSlot): IStartTask;
}

export interface ICallbackSlotChooser<K extends Key> {
  beforeCreate(): ICallbackChooser<K>;
  beforeRender(): ICallbackChooser<K>;
  beforeBind(): ICallbackChooser<K>;
  beforeAttach(): ICallbackChooser<K>;
  at(slot: TaskSlot): ICallbackChooser<K>;
}

export interface ICallbackChooser<K extends Key> {
  call<K1 extends Key = K>(fn: (instance: Resolved<K1>) => MaybePromiseOrTask): IStartTask;
}

const enum TaskType {
  with,
  from,
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
export const StartTask = class $StartTask implements IStartTask {
  public get slot(): TaskSlot {
    if (this._slot === void 0) {
      throw new Error('StartTask.slot is not set');
    }
    return this._slot;
  }
  public get promiseOrTask(): PromiseOrTask {
    if (this._promiseOrTask === void 0) {
      throw new Error('StartTask.promiseOrTask is not set');
    }
    return this._promiseOrTask;
  }
  public get container(): IContainer {
    if (this._container === void 0) {
      throw new Error('StartTask.container is not set');
    }
    return this._container;
  }
  public get key(): Key {
    if (this._key === void 0) {
      throw new Error('StartTask.key is not set');
    }
    return this._key;
  }
  public get callback(): (instance: unknown) => PromiseOrTask {
    if (this._callback === void 0) {
      throw new Error('StartTask.callback is not set');
    }
    return this._callback;
  }
  public get task(): ILifecycleTask {
    if (this._task === void 0) {
      throw new Error('StartTask.task is not set');
    }
    return this._task;
  }

  private _slot?: TaskSlot = void 0;
  private _promiseOrTask?: PromiseOrTask = void 0;
  private _container?: IContainer = void 0;
  private _key?: Key = void 0;
  private _callback?: (instance: unknown) => PromiseOrTask = void 0;
  private _task?: ILifecycleTask = void 0;

  private constructor(
    private readonly type: TaskType,
  ) {}

  public static with<K extends Key>(key: K): ICallbackSlotChooser<K> {
    const task = new $StartTask(TaskType.with);
    task._key = key;
    return task as ICallbackSlotChooser<K>;
  }

  public static from(task: ILifecycleTask): ISlotChooser;
  public static from(promise: Promise<unknown>): ISlotChooser;
  public static from(promiseOrTask: PromiseOrTask): ISlotChooser;
  public static from(promiseOrTask: PromiseOrTask): ISlotChooser {
    const task = new $StartTask(TaskType.from);
    task._promiseOrTask = promiseOrTask;
    return task;
  }

  public beforeCreate(): $StartTask {
    return this.at(TaskSlot.beforeCreate);
  }

  public beforeRender(): $StartTask {
    return this.at(TaskSlot.beforeRender);
  }

  public beforeBind(): $StartTask {
    return this.at(TaskSlot.beforeBind);
  }

  public beforeAttach(): $StartTask {
    return this.at(TaskSlot.beforeAttach);
  }

  public at(slot: TaskSlot): $StartTask {
    this._slot = slot;
    return this;
  }

  public call(fn: (instance: unknown) => PromiseOrTask): $StartTask {
    this._callback = fn;
    return this;
  }

  public register(container: IContainer): IContainer {
    return this._container = container.register(Registration.instance(IStartTask, this));
  }

  public resolveTask(): ILifecycleTask {
    if (this._task === void 0) {
      switch (this.type) {
        case TaskType.with:
          this._task = new ProviderTask(this.container, this.key, this.callback);
          break;
        case TaskType.from:
          this._task = new TerminalTask(this.promiseOrTask);
          break;
      }
    }
    return this.task;
  }
} as {
  with<K extends Key>(key: K): ICallbackSlotChooser<K>;
  from(task: ILifecycleTask): ISlotChooser;
  from(promise: Promise<unknown>): ISlotChooser;
  from(promiseOrTask: PromiseOrTask): ISlotChooser;
};

export const IStartTaskManager = DI.createInterface<IStartTaskManager>('IStartTaskManager').noDefault();

export interface IStartTaskManager {
  runBeforeCreate(container?: IContainer): ILifecycleTask;
  runBeforeRender(container?: IContainer): ILifecycleTask;
  runBeforeBind(container?: IContainer): ILifecycleTask;
  runBeforeAttach(container?: IContainer): ILifecycleTask;
  run(slot: TaskSlot, container?: IContainer): ILifecycleTask;
}

export class StartTaskManager implements IStartTaskManager {
  public static readonly inject: readonly Key[] = [IServiceLocator];

  public constructor(
    private readonly locator: IServiceLocator,
  ) {}

  public static register(container: IContainer): IResolver<IStartTaskManager> {
    return Registration.singleton(IStartTaskManager, this).register(container);
  }

  public runBeforeCreate(locator: IServiceLocator = this.locator): ILifecycleTask {
    return this.run(TaskSlot.beforeCreate, locator);
  }

  public runBeforeRender(locator: IServiceLocator = this.locator): ILifecycleTask {
    return this.run(TaskSlot.beforeRender, locator);
  }

  public runBeforeBind(locator: IServiceLocator = this.locator): ILifecycleTask {
    return this.run(TaskSlot.beforeBind, locator);
  }

  public runBeforeAttach(locator: IServiceLocator = this.locator): ILifecycleTask {
    return this.run(TaskSlot.beforeAttach, locator);
  }

  public run(slot: TaskSlot, locator: IServiceLocator = this.locator): ILifecycleTask {
    const tasks = locator.getAll(IStartTask)
      .filter(startTask => startTask.slot === slot)
      .map(startTask => startTask.resolveTask())
      .filter(task => !task.done);

    if (tasks.length === 0) {
      return LifecycleTask.done;
    }

    return new AggregateTerminalTask(tasks);
  }
}

export interface ILifecycleTask<T = unknown> {
  readonly done: boolean;
  canCancel(): boolean;
  cancel(): void;
  wait(): Promise<T>;
}

export class PromiseTask<TArgs extends unknown[], T = void> implements ILifecycleTask {
  public done: boolean;

  private hasStarted: boolean;
  private isCancelled: boolean;
  private readonly promise: Promise<unknown>;

  public constructor(
    promise: Promise<T>,
    next: ((result?: T, ...args: TArgs) => MaybePromiseOrTask) | null,
    context: unknown,
    ...args: TArgs
  ) {
    this.done = false;
    this.isCancelled = false;
    this.hasStarted = false;
    this.promise = promise.then(value => {
      if (this.isCancelled === true) {
        return;
      }
      this.hasStarted = true;
      if (next !== null) {
        const nextResult = (next as (this: (result?: T, ...args: TArgs) => MaybePromiseOrTask, value: T, ...args: TArgs[]) => MaybePromiseOrTask).call(context as (result?: T, ...args: TArgs) => MaybePromiseOrTask, value, ...args as TArgs[]);
        if (nextResult === void 0) {
          this.done = true;
        } else {
          const nextPromise = (nextResult as Promise<unknown>).then instanceof Function
            ? nextResult as Promise<unknown>
            : (nextResult as ILifecycleTask).wait();
          return nextPromise.then(() => {
            this.done = true;
          });
        }
      }
    });
  }

  public canCancel(): boolean {
    return !this.hasStarted;
  }

  public cancel(): void {
    if (this.canCancel()) {
      this.isCancelled = true;
    }
  }

  public wait(): Promise<unknown> {
    return this.promise;
  }
}

export class ProviderTask implements ILifecycleTask {
  public done: boolean;

  private promise?: Promise<unknown>;

  public constructor(
    private container: IContainer,
    private key: Key,
    private callback: (instance: unknown) => PromiseOrTask,
  ) {
    this.done = false;
  }

  public canCancel(): boolean {
    return false;
  }

  public cancel(): void {
    return;
  }

  public wait(): Promise<unknown> {
    if (this.promise === void 0) {
      const instance = this.container.get(this.key);
      const maybePromiseOrTask = this.callback.call(void 0, instance);

      this.promise = maybePromiseOrTask === void 0
        ? Promise.resolve()
        : (maybePromiseOrTask as Promise<unknown>).then instanceof Function
          ? maybePromiseOrTask as Promise<unknown>
          : (maybePromiseOrTask as ILifecycleTask).wait();

      this.promise = this.promise.then(() => {
        this.done = true;
        this.container = (void 0)!;
        this.key = (void 0)!;
        this.callback = (void 0)!;
      }).catch(e => { throw e; });
    }
    return this.promise;
  }
}

export class ContinuationTask<TArgs extends unknown[]> implements ILifecycleTask {
  public done: boolean;

  private hasStarted: boolean;
  private isCancelled: boolean;
  private readonly promise: Promise<unknown>;

  public constructor(
    antecedent: Promise<unknown> | ILifecycleTask,
    next: (...args: TArgs) => MaybePromiseOrTask,
    context: unknown,
    ...args: TArgs
  ) {
    this.done = false;
    this.hasStarted = false;
    this.isCancelled = false;

    const promise = (antecedent as Promise<unknown>).then instanceof Function
      ? antecedent as Promise<unknown>
      : (antecedent as ILifecycleTask).wait();

    this.promise = promise.then(() => {
      if (this.isCancelled === true) {
        return;
      }
      this.hasStarted = true;
      const nextResult = next.call(context, ...args);
      if (nextResult === void 0) {
        this.done = true;
      } else {
        const nextPromise = (nextResult as Promise<unknown>).then instanceof Function
          ? nextResult as Promise<unknown>
          : (nextResult as ILifecycleTask).wait();
        return nextPromise.then(() => {
          this.done = true;
        });
      }
    });
  }

  public canCancel(): boolean {
    return !this.hasStarted;
  }

  public cancel(): void {
    if (this.canCancel()) {
      this.isCancelled = true;
    }
  }

  public wait(): Promise<unknown> {
    return this.promise;
  }
}

export class TerminalTask implements ILifecycleTask {
  public done: boolean;

  private readonly promise: Promise<unknown>;

  public constructor(antecedent: Promise<unknown> | ILifecycleTask) {
    this.done = false;

    this.promise = (antecedent as Promise<unknown>).then instanceof Function
      ? antecedent as Promise<unknown>
      : (antecedent as ILifecycleTask).wait();

    this.promise.then(() => {
      this.done = true;
    }).catch(e => { throw e; });
  }

  public canCancel(): boolean {
    return false;
  }

  public cancel(): void {
    return;
  }

  public wait(): Promise<unknown> {
    return this.promise;
  }
}

export class AggregateContinuationTask<TArgs extends unknown[]> implements ILifecycleTask {
  public done: boolean;

  private hasStarted: boolean;
  private isCancelled: boolean;
  private readonly promise: Promise<unknown>;

  public constructor(
    antecedents: ILifecycleTask[],
    next: (...args: TArgs) => void | ILifecycleTask,
    context: unknown,
    ...args: TArgs
  ) {
    this.done = false;
    this.hasStarted = false;
    this.isCancelled = false;
    this.promise = Promise.all(antecedents.map(t => t.wait())).then(() => {
      if (this.isCancelled === true) {
        return;
      }
      this.hasStarted = true;
      const nextResult = next.call(context, ...args) as undefined | ILifecycleTask;
      if (nextResult === void 0) {
        this.done = true;
      } else {
        return nextResult.wait().then(() => {
          this.done = true;
        });
      }
    });
  }

  public canCancel(): boolean {
    return !this.hasStarted;
  }

  public cancel(): void {
    if (this.canCancel()) {
      this.isCancelled = true;
    }
  }

  public wait(): Promise<unknown> {
    return this.promise;
  }
}

export class AggregateTerminalTask implements ILifecycleTask {
  public done: boolean;

  private readonly promise: Promise<unknown>;

  public constructor(antecedents: ILifecycleTask[]) {
    this.done = false;
    this.promise = Promise.all(antecedents.map(t => t.wait())).then(() => {
      this.done = true;
    });
  }

  public canCancel(): boolean {
    return false;
  }

  public cancel(): void {
    return;
  }

  public wait(): Promise<unknown> {
    return this.promise;
  }
}

export function hasAsyncWork(value: MaybePromiseOrTask): value is PromiseOrTask {
  return !(value === void 0 || (value as ILifecycleTask).done === true);
}
