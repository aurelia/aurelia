/* eslint-disable @typescript-eslint/promise-function-async */
import {
  DI,
  IContainer,
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

export type TaskSlot = (
  'beforeCreate' |
  'beforeCompile' |
  'beforeCompileChildren' |
  'beforeActivate' |
  'afterActivate' |
  'beforeDeactivate' |
  'afterDeactivate'
);

export const IAppTask = DI.createInterface<IAppTask>('IAppTask').noDefault();
export interface IAppTask extends Pick<
  $AppTask,
  'slot' |
  'run' |
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
  public callback: (instance: unknown) => void | Promise<void> = (void 0)!;
  public task: ILifecycleTask = (void 0)!;
  public container: IContainer = (void 0)!;

  private constructor(
    private readonly key: K,
  ) {}

  public static with<K1 extends Key>(key: K1): ICallbackSlotChooser<K1> {
    return new $AppTask(key);
  }

  public beforeCreate(): ICallbackChooser<K> {
    return this.at('beforeCreate');
  }

  public beforeCompile(): ICallbackChooser<K> {
    return this.at('beforeCompile');
  }

  public beforeCompileChildren(): ICallbackChooser<K> {
    return this.at('beforeCompileChildren');
  }

  public beforeActivate(): ICallbackChooser<K> {
    return this.at('beforeActivate');
  }

  public afterActivate(): ICallbackChooser<K> {
    return this.at('afterActivate');
  }

  public beforeDeactivate(): ICallbackChooser<K> {
    return this.at('beforeDeactivate');
  }

  public afterDeactivate(): ICallbackChooser<K> {
    return this.at('afterDeactivate');
  }

  public at(slot: TaskSlot): ICallbackChooser<K> {
    this.slot = slot;
    return this;
  }

  public call<K1 extends Key = K>(fn: (instance: Resolved<K1>) => void | Promise<void>): IAppTask {
    this.callback = fn as (instance: unknown) => void | Promise<void>;
    return this;
  }

  public register(container: IContainer): IContainer {
    return this.container = container.register(Registration.instance(IAppTask, this));
  }

  public run(): void | Promise<void> {
    const callback = this.callback;
    const instance = this.container.get(this.key);
    return callback(instance);
  }
}
export const AppTask = $AppTask as {
  with<K extends Key>(key: K): ICallbackSlotChooser<K>;
};
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
