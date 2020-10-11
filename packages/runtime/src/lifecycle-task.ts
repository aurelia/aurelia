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
export interface IAppTask extends Pick<
  $AppTask,
  'slot' |
  'resolveTask' |
  'register'
> {}

export interface ICallbackSlotChooser<K extends Key> extends Pick<
  $AppTask<K>,
  'beforeCreate' |
  'beforeCompile' |
  'beforeCompileChildren' |
  'beforeActivate' |
  'afterActivate' |
  'beforeDeactivate' |
  'afterDeactivate'
> {}

export interface ICallbackChooser<K extends Key> extends Pick<
  $AppTask<K>,
  'call'
> {}

class $AppTask<K extends Key = Key> {
  public slot: TaskSlot = (void 0)!;
  public callback: (instance: unknown) => MaybePromiseOrTask = (void 0)!;
  public task: ILifecycleTask = (void 0)!;
  public container: IContainer = (void 0)!;

  private constructor(
    private readonly key: K,
  ) {}

  public static with<K1 extends Key>(key: K1): ICallbackSlotChooser<K1> {
    return new $AppTask(key);
  }

  public beforeCreate(): ICallbackChooser<K> {
    return this.at(TaskSlot.beforeCreate);
  }

  public beforeCompile(): ICallbackChooser<K> {
    return this.at(TaskSlot.beforeCompile);
  }

  public beforeCompileChildren(): ICallbackChooser<K> {
    return this.at(TaskSlot.beforeCompileChildren);
  }

  public beforeActivate(): ICallbackChooser<K> {
    return this.at(TaskSlot.beforeActivate);
  }

  public afterActivate(): ICallbackChooser<K> {
    return this.at(TaskSlot.afterActivate);
  }

  public beforeDeactivate(): ICallbackChooser<K> {
    return this.at(TaskSlot.beforeDeactivate);
  }

  public afterDeactivate(): ICallbackChooser<K> {
    return this.at(TaskSlot.afterDeactivate);
  }

  public at(slot: TaskSlot): ICallbackChooser<K> {
    this.slot = slot;
    return this;
  }

  public call<K1 extends Key = K>(fn: (instance: Resolved<K1>) => MaybePromiseOrTask): IAppTask {
    this.callback = fn as (instance: unknown) => MaybePromiseOrTask;
    return this;
  }

  public register(container: IContainer): IContainer {
    return this.container = container.register(Registration.instance(IAppTask, this));
  }

  public resolveTask(): ILifecycleTask {
    if (this.task === void 0) {
      this.task = new ProviderTask(this.container, this.key, this.callback);
    }
    return this.task;
  }
}
export const AppTask = $AppTask as {
  with<K extends Key>(key: K): ICallbackSlotChooser<K>;
};

export const IAppTaskManager = DI.createInterface<IAppTaskManager>('IAppTaskManager').noDefault();

export interface IAppTaskManager extends AppTaskManager {}

export class AppTaskManager {
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
    private callback: (instance: unknown) => MaybePromiseOrTask,
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
