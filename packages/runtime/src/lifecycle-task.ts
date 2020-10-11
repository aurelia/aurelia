/* eslint-disable @typescript-eslint/promise-function-async */
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
    wait(): Promise<unknown> { return Promise.resolve(); }
  }
};

export const enum TaskSlot {
  beforeCreate          = 0,
  beforeCompile         = 1,
  beforeCompileChildren = 2,
  beforeActivate        = 3,
  afterActivate         = 4,
  beforeDeactivate      = 5,
  afterDeactivate       = 6,
}

export const IAppTask = DI.createInterface<IAppTask>('IAppTask').noDefault();

export interface IAppTask {
  readonly slot: TaskSlot;
  resolveTask(): ILifecycleTask;
  register(container: IContainer): IContainer;
}

export interface ISlotChooser {
  beforeCreate(): IAppTask;
  beforeCompile(): IAppTask;
  beforeCompileChildren(): IAppTask;
  beforeActivate(): IAppTask;
  afterActivate(): IAppTask;
  beforeDeactivate(): IAppTask;
  afterDeactivate(): IAppTask;
  at(slot: TaskSlot): IAppTask;
}

export interface ICallbackSlotChooser<K extends Key> {
  beforeCreate(): ICallbackChooser<K>;
  beforeCompile(): ICallbackChooser<K>;
  beforeCompileChildren(): ICallbackChooser<K>;
  beforeActivate(): ICallbackChooser<K>;
  afterActivate(): ICallbackChooser<K>;
  beforeDeactivate(): ICallbackChooser<K>;
  afterDeactivate(): ICallbackChooser<K>;
  at(slot: TaskSlot): ICallbackChooser<K>;
}

export interface ICallbackChooser<K extends Key> {
  call<K1 extends Key = K>(fn: (instance: Resolved<K1>) => MaybePromiseOrTask): IAppTask;
}

const enum TaskType {
  with,
  from,
}

export const AppTask = class $AppTask implements IAppTask {
  public get slot(): TaskSlot {
    if (this._slot === void 0) {
      throw new Error('AppTask.slot is not set');
    }
    return this._slot;
  }
  public get promiseOrTask(): PromiseOrTask {
    if (this._promiseOrTask === void 0) {
      throw new Error('AppTask.promiseOrTask is not set');
    }
    return this._promiseOrTask;
  }
  public get container(): IContainer {
    if (this._container === void 0) {
      throw new Error('AppTask.container is not set');
    }
    return this._container;
  }
  public get key(): Key {
    if (this._key === void 0) {
      throw new Error('AppTask.key is not set');
    }
    return this._key;
  }
  public get callback(): (instance: unknown) => PromiseOrTask {
    if (this._callback === void 0) {
      throw new Error('AppTask.callback is not set');
    }
    return this._callback;
  }
  public get task(): ILifecycleTask {
    if (this._task === void 0) {
      throw new Error('AppTask.task is not set');
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
    const task = new $AppTask(TaskType.with);
    task._key = key;
    return task as ICallbackSlotChooser<K>;
  }

  public static from(task: ILifecycleTask): ISlotChooser;
  public static from(promise: Promise<unknown>): ISlotChooser;
  public static from(promiseOrTask: PromiseOrTask): ISlotChooser;
  public static from(promiseOrTask: PromiseOrTask): ISlotChooser {
    const task = new $AppTask(TaskType.from);
    task._promiseOrTask = promiseOrTask;
    return task;
  }

  public beforeCreate(): $AppTask {
    return this.at(TaskSlot.beforeCreate);
  }

  public beforeCompile(): $AppTask {
    return this.at(TaskSlot.beforeCompile);
  }

  public beforeCompileChildren(): $AppTask {
    return this.at(TaskSlot.beforeCompileChildren);
  }

  public beforeActivate(): $AppTask {
    return this.at(TaskSlot.beforeActivate);
  }

  public afterActivate(): $AppTask {
    return this.at(TaskSlot.afterActivate);
  }

  public beforeDeactivate(): $AppTask {
    return this.at(TaskSlot.beforeDeactivate);
  }

  public afterDeactivate(): $AppTask {
    return this.at(TaskSlot.afterDeactivate);
  }

  public at(slot: TaskSlot): $AppTask {
    this._slot = slot;
    return this;
  }

  public call(fn: (instance: unknown) => PromiseOrTask): $AppTask {
    this._callback = fn;
    return this;
  }

  public register(container: IContainer): IContainer {
    return this._container = container.register(Registration.instance(IAppTask, this));
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

export const IAppTaskManager = DI.createInterface<IAppTaskManager>('IAppTaskManager').noDefault();

export interface IAppTaskManager {
  /**
   * This is internal API and will be moved to an inaccessible place in the near future.
   */
  enqueueBeforeCompileChildren(): void;
  /**
   * This is internal API and will be moved to an inaccessible place in the near future.
   */
  enqueueBeforeCompile(): void;
  runBeforeCreate(container?: IContainer): ILifecycleTask;
  runBeforeCompile(container?: IContainer): ILifecycleTask;
  runBeforeCompileChildren(container?: IContainer): ILifecycleTask;
  runBeforeActivate(container?: IContainer): ILifecycleTask;
  runAfterActivate(container?: IContainer): ILifecycleTask;
  runBeforeDeactivate(container?: IContainer): ILifecycleTask;
  runAfterDeactivate(container?: IContainer): ILifecycleTask;
  run(slot: TaskSlot, container?: IContainer): ILifecycleTask;
}

export class AppTaskManager implements IAppTaskManager {
  private beforeCompileChildrenQueued: boolean = false;
  private beforeCompileQueued: boolean = false;

  public constructor(
    @IServiceLocator private readonly locator: IServiceLocator,
  ) {}

  public static register(container: IContainer): IResolver<IAppTaskManager> {
    return Registration.singleton(IAppTaskManager, this).register(container);
  }

  public enqueueBeforeCompileChildren(): void {
    if (this.beforeCompileChildrenQueued) {
      throw new Error(`BeforeCompileChildren already queued`);
    }
    this.beforeCompileChildrenQueued = true;
  }

  public enqueueBeforeCompile(): void {
    if (this.beforeCompileQueued) {
      throw new Error(`BeforeCompile already queued`);
    }
    this.beforeCompileQueued = true;
  }

  public runBeforeCreate(locator: IServiceLocator = this.locator): ILifecycleTask {
    return this.run(TaskSlot.beforeCreate, locator);
  }

  public runBeforeCompile(locator: IServiceLocator = this.locator): ILifecycleTask {
    if (this.beforeCompileQueued) {
      this.beforeCompileQueued = false;
      return this.run(TaskSlot.beforeCompile, locator);
    }
    return LifecycleTask.done;
  }

  public runBeforeCompileChildren(locator: IServiceLocator = this.locator): ILifecycleTask {
    if (this.beforeCompileChildrenQueued) {
      this.beforeCompileChildrenQueued = false;
      return this.run(TaskSlot.beforeCompileChildren, locator);
    }
    return LifecycleTask.done;
  }

  public runBeforeActivate(locator: IServiceLocator = this.locator): ILifecycleTask {
    return this.run(TaskSlot.beforeActivate, locator);
  }

  public runAfterActivate(locator: IServiceLocator = this.locator): ILifecycleTask {
    return this.run(TaskSlot.afterActivate, locator);
  }

  public runBeforeDeactivate(locator: IServiceLocator = this.locator): ILifecycleTask {
    return this.run(TaskSlot.beforeDeactivate, locator);
  }

  public runAfterDeactivate(locator: IServiceLocator = this.locator): ILifecycleTask {
    return this.run(TaskSlot.afterDeactivate, locator);
  }

  public run(slot: TaskSlot, locator: IServiceLocator = this.locator): ILifecycleTask {
    const tasks = locator.getAll(IAppTask)
      .filter(appTask => appTask.slot === slot)
      .map(appTask => appTask.resolveTask())
      .filter(task => !task.done);

    if (tasks.length === 0) {
      return LifecycleTask.done;
    }

    return new AggregateTerminalTask(tasks);
  }
}

export interface ILifecycleTask<T = unknown> {
  readonly done: boolean;
  wait(): Promise<T>;
}

export class PromiseTask<TArgs extends unknown[], T = void> implements ILifecycleTask {
  public done: boolean = false;

  private readonly promise: Promise<unknown>;

  public constructor(
    promise: Promise<T>,
    next: ((result?: T, ...args: TArgs) => MaybePromiseOrTask) | null,
    context: unknown,
    ...args: TArgs
  ) {
    this.promise = promise.then(value => {
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

  public wait(): Promise<unknown> {
    return this.promise;
  }
}

export class ProviderTask implements ILifecycleTask {
  public done: boolean = false;

  private promise?: Promise<unknown>;

  public constructor(
    private container: IContainer,
    private key: Key,
    private callback: (instance: unknown) => PromiseOrTask,
  ) {}

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
  public done: boolean = false;

  private readonly promise: Promise<unknown>;

  public constructor(
    antecedent: Promise<unknown> | ILifecycleTask,
    next: (...args: TArgs) => MaybePromiseOrTask,
    context: unknown,
    ...args: TArgs
  ) {
    const promise = (antecedent as Promise<unknown>).then instanceof Function
      ? antecedent as Promise<unknown>
      : (antecedent as ILifecycleTask).wait();

    this.promise = promise.then(() => {
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

  public wait(): Promise<unknown> {
    return this.promise;
  }
}

export class TerminalTask implements ILifecycleTask {
  public done: boolean = false;

  private readonly promise: Promise<unknown>;

  public constructor(
    antecedent: Promise<unknown> | ILifecycleTask,
  ) {
    this.promise = (antecedent as Promise<unknown>).then instanceof Function
      ? antecedent as Promise<unknown>
      : (antecedent as ILifecycleTask).wait();

    this.promise.then(() => {
      this.done = true;
    }).catch(e => { throw e; });
  }

  public wait(): Promise<unknown> {
    return this.promise;
  }
}

export class AggregateContinuationTask<TArgs extends unknown[]> implements ILifecycleTask {
  public done: boolean = false;

  private readonly promise: Promise<unknown>;

  public constructor(
    antecedents: ILifecycleTask[],
    next: (...args: TArgs) => void | ILifecycleTask,
    context: unknown,
    ...args: TArgs
  ) {
    this.promise = Promise.all(antecedents.map(t => t.wait())).then(() => {
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

  public wait(): Promise<unknown> {
    return this.promise;
  }
}

export class AggregateTerminalTask implements ILifecycleTask {
  public done: boolean = false;

  private readonly promise: Promise<unknown>;

  public constructor(
    antecedents: ILifecycleTask[],
  ) {
    this.promise = Promise.all(antecedents.map(t => t.wait())).then(() => {
      this.done = true;
    });
  }

  public wait(): Promise<unknown> {
    return this.promise;
  }
}

export function hasAsyncWork(value: MaybePromiseOrTask): value is PromiseOrTask {
  return !(value === void 0 || (value as ILifecycleTask).done === true);
}
