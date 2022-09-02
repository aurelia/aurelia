import { DI } from '@aurelia/kernel';
import { isFunction } from './utilities';
import { instanceRegistration } from './utilities-di';
import type { IContainer, IRegistry, Key, Resolved } from '@aurelia/kernel';

export type TaskSlot =
  | 'creating'
  | 'hydrating'
  | 'hydrated'
  | 'activating'
  | 'activated'
  | 'deactivating'
  | 'deactivated';

export const IAppTask = DI.createInterface<IAppTask>('IAppTask');
export interface IAppTask extends Pick<
  $AppTask,
  'slot' |
  'run' |
  'register'
> {}

class $AppTask<K extends Key = Key> {
  public readonly slot: TaskSlot;
  /** @internal */
  private c: IContainer = (void 0)!;
  /** @internal */
  private readonly k: K | null;
  /** @internal */
  private readonly cb: AppTaskCallback<K> | AppTaskCallbackNoArg;

  public constructor(
    slot: TaskSlot,
    key: K | null,
    cb: AppTaskCallback<K> | AppTaskCallbackNoArg,
  ) {
    this.slot = slot;
    this.k = key;
    this.cb = cb;
  }

  public register(container: IContainer): IContainer {
    return this.c = container.register(instanceRegistration(IAppTask, this));
  }

  public run(): void | Promise<void> {
    const key = this.k;
    const cb = this.cb;
    return key === null
      ? (cb as AppTaskCallbackNoArg)()
      : cb(this.c.get(key));
  }
}

export const AppTask = Object.freeze({
  /**
   * Returns a task that will run just before the root component is created by DI
   */
  creating: createAppTaskSlotHook('creating'),
  /**
   * Returns a task that will run after instantiating the root controller,
   * but before compiling its view (thus means before instantiating the child elements inside it)
   *
   * good chance for a router to do some initial work, or initial routing related in general
   */
  hydrating: createAppTaskSlotHook('hydrating'),
  /**
   * Return a task that will run after the hydration of the root controller,
   * but before hydrating the child element inside
   *
   * good chance for a router to do some initial work, or initial routing related in general
   */
  hydrated: createAppTaskSlotHook('hydrated'),
  /**
   * Return a task that will run right before the root component is activated.
   * In this phase, scope hierarchy is formed, and bindings are getting bound
   */
  activating: createAppTaskSlotHook('activating'),
  /**
   * Return a task that will run right after the root component is activated - the app is now running
   */
  activated: createAppTaskSlotHook('activated'),
  /**
   * Return a task that will runs right before the root component is deactivated.
   * In this phase, scope hierarchy is unlinked, and bindings are getting unbound
   */
  deactivating: createAppTaskSlotHook('deactivating'),
  /**
   * Return a task that will run right after the root component is deactivated
   */
  deactivated: createAppTaskSlotHook('deactivated'),
});

export type AppTaskCallbackNoArg = () => void | Promise<void>;
export type AppTaskCallback<T> = (arg: Resolved<T>) => void | Promise<void>;

function createAppTaskSlotHook(slotName: TaskSlot) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function appTaskFactory<T extends Key = Key>(callback: AppTaskCallbackNoArg): IRegistry;
  function appTaskFactory<T extends Key = Key>(key: T, callback: AppTaskCallback<T>): IRegistry;
  function appTaskFactory<T extends Key = Key>(keyOrCallback: T | AppTaskCallback<T> | AppTaskCallbackNoArg, callback?: AppTaskCallback<T>): IRegistry {
    if (isFunction(callback)) {
      return new $AppTask(slotName, keyOrCallback as T, callback);
    }
    return new $AppTask(slotName, null, keyOrCallback as Exclude<typeof keyOrCallback, T>);
  }
  return appTaskFactory;
}
