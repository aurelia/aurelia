import { DI, Registration } from '@aurelia/kernel';
import type { IContainer, IRegistry, Key, Resolved } from '@aurelia/kernel';

export type TaskSlot = (
  'beforeCreate' |
  'hydrating' |
  'hydrated' |
  'beforeActivate' |
  'afterActivate' |
  'beforeDeactivate' |
  'afterDeactivate'
);

export const IAppTask = DI.createInterface<IAppTask>('IAppTask');
export interface IAppTask extends Pick<
  $AppTask,
  'slot' |
  'run' |
  'register'
> {}

class $AppTask<K extends Key = Key> {
  public readonly slot: TaskSlot;
  /** @internal */ private _container: IContainer = (void 0)!;
  /** @internal */ private readonly _key: K | null;
  /** @internal */ private readonly _callback: AppTaskCallback<K> | AppTaskCallbackNoArg;

  public constructor(
    slot: TaskSlot,
    key: K | null,
    cb: AppTaskCallback<K> | AppTaskCallbackNoArg,
  ) {
    this.slot = slot;
    this._key = key;
    this._callback = cb;
  }

  public register(container: IContainer): IContainer {
    return this._container = container.register(Registration.instance(IAppTask, this));
  }

  public run(): void | Promise<void> {
    return this._key === null
      ? (this._callback as AppTaskCallbackNoArg)()
      : this._callback(this._container.get(this._key));
  }
}

export const AppTask = Object.freeze({
  beforeCreate: createAppTaskSlotHook('beforeCreate'),
  hydrating: createAppTaskSlotHook('hydrating'),
  hydrated: createAppTaskSlotHook('hydrated'),
  beforeActivate: createAppTaskSlotHook('beforeActivate'),
  afterActivate: createAppTaskSlotHook('afterActivate'),
  beforeDeactivate: createAppTaskSlotHook('beforeDeactivate'),
  afterDeactivate: createAppTaskSlotHook('afterDeactivate'),
});

export type AppTaskCallbackNoArg = () => void | Promise<void>;
export type AppTaskCallback<T> = (arg: Resolved<T>) => void | Promise<void>;

function createAppTaskSlotHook(slotName: TaskSlot) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function appTaskFactory<T extends Key = Key>(callback: AppTaskCallbackNoArg): IRegistry;
  function appTaskFactory<T extends Key = Key>(key: T, callback: AppTaskCallback<T>): IRegistry;
  function appTaskFactory<T extends Key = Key>(keyOrCallback: T | AppTaskCallback<T> | AppTaskCallbackNoArg, callback?: AppTaskCallback<T>): IRegistry {
    if (typeof callback === 'function') {
      return new $AppTask(slotName, keyOrCallback as T, callback);
    }
    return new $AppTask(slotName, null, keyOrCallback as Exclude<typeof keyOrCallback, T>);
  }
  return appTaskFactory;
}
