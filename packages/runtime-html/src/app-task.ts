import {
  DI,
  IContainer,
  Key,
  Registration,
  Resolved,
} from '@aurelia/kernel';

export type TaskSlot = (
  'beforeCreate' |
  'hydrating' |
  'hydrated' |
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
  'hydrating' |
  'hydrated' |
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

  public hydrating(): ICallbackChooser<K> {
    return this.at('hydrating');
  }

  public hydrated(): ICallbackChooser<K> {
    return this.at('hydrated');
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
