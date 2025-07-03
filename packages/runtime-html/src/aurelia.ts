import { isPromise, DI, InstanceProvider, onResolve } from '@aurelia/kernel';
import { AppRoot, IAppRoot, IAppRootConfig } from './app-root';
import { createInterface, registerResolver } from './utilities-di';

import type {
  Constructable,
  IContainer,
  IDisposable,
} from '@aurelia/kernel';
import { ErrorNames, createMappedError } from './errors';
import { refs } from './dom.node';
import { tasksSettled } from '@aurelia/runtime';

export interface IAurelia extends Aurelia {}
export const IAurelia = /*@__PURE__*/createInterface<IAurelia>('IAurelia');

export class Aurelia implements IDisposable {
  /** @internal */
  private _isRunning: boolean = false;
  public get isRunning(): boolean { return this._isRunning; }
  /** @internal */
  private _isStarting: boolean = false;
  public get isStarting(): boolean { return this._isStarting; }
  /** @internal */
  private _isStopping: boolean = false;
  public get isStopping(): boolean { return this._isStopping; }

  /** @internal */
  private _root: IAppRoot | undefined = void 0;
  public get root(): IAppRoot {
    if (this._root == null) {
      if (this.next == null) {
        throw createMappedError(ErrorNames.root_not_found);
      }
      return this.next;
    }
    return this._root;
  }

  private next: IAppRoot | undefined = void 0;

  /** @internal */
  private readonly _rootProvider: InstanceProvider<IAppRoot>;

  public constructor(
    public readonly container: IContainer = DI.createContainer(),
  ) {
    if (container.has(IAurelia, true) || container.has(Aurelia, true)) {
      throw createMappedError(ErrorNames.aurelia_instance_existed_in_container);
    }

    registerResolver(container, IAurelia, new InstanceProvider<IAurelia>('IAurelia', this));
    registerResolver(container, Aurelia, new InstanceProvider<IAurelia>('Aurelia', this));
    registerResolver(container, IAppRoot, this._rootProvider = new InstanceProvider('IAppRoot'));
  }

  public register(...params: unknown[]): this {
    this.container.register(...params);
    return this;
  }

  public app(config: ISinglePageAppConfig): Omit<this, 'register' | 'app' | 'enhance'> {
    this.next = new AppRoot(config, this.container, this._rootProvider);
    return this;
  }

  /**
   * @param parentController - The owning controller of the view created by this enhance call
   */
  public enhance<T extends object>(config: IEnhancementConfig<T>): IAppRoot<T> | Promise<IAppRoot<T>> {
    const container = (config.container ?? this.container.createChild());
    const rootProvider = registerResolver(container, IAppRoot, new InstanceProvider<IAppRoot<T>>('IAppRoot'));
    const appRoot: IAppRoot<T> = new AppRoot(
      { host: config.host as HTMLElement, component: config.component },
      container,
      rootProvider,
      true
    );
    return onResolve(appRoot.activate(), () => appRoot);
  }

  public async waitForIdle(): Promise<void> {
    const platform = this.root.platform;
    await platform.domQueue.yield();
    await platform.taskQueue.yield();
  }

  /** @internal */
  private _startPromise: Promise<void> | void = void 0;
  public start(root: IAppRoot | undefined = this.next): void | Promise<void> {
    if (root == null) {
      throw createMappedError(ErrorNames.no_composition_root);
    }

    if (isPromise(this._startPromise)) {
      return this._startPromise;
    }

    return this._startPromise = onResolve(this.stop(), () => {
      if (!refs.hideProp) {
        Reflect.set(root.host, '$aurelia', this);
      }
      this._rootProvider.prepare(this._root = root);
      this._isStarting = true;

      return onResolve(root.activate(), () => {
        this._isRunning = true;
        this._isStarting = false;
        this._startPromise = void 0;
        this._dispatchEvent(root, 'au-started', root.host);
      });
    });
  }

  /** @internal */
  private _stopPromise: Promise<void> | void = void 0;
  public stop(dispose: boolean = false): void | Promise<void> {
    if (isPromise(this._stopPromise)) {
      return this._stopPromise;
    }

    if (this._isRunning === true) {
      const root = this._root!;
      this._isRunning = false;
      this._isStopping = true;

      return this._stopPromise = onResolve(root.deactivate(), () => {
        return onResolve(tasksSettled(), () => {
          Reflect.deleteProperty(root.host, '$aurelia');
          if (dispose) {
            root.dispose();
          }
          this._root = void 0;
          this._rootProvider.dispose();
          this._isStopping = false;
          this._stopPromise = void 0;
          this._dispatchEvent(root, 'au-stopped', root.host);
        });
      });
    }
  }

  public dispose(): void {
    if (this._isRunning || this._isStopping) {
      throw createMappedError(ErrorNames.invalid_dispose_call);
    }
    this.container.dispose();
  }

  /** @internal */
  private _dispatchEvent(root: IAppRoot, name: string, target: HTMLElement): void {
    const ev = new root.platform.window.CustomEvent(name, { detail: this, bubbles: true, cancelable: true });
    target.dispatchEvent(ev);
  }
}

export type ISinglePageAppConfig<T extends object = object> = Omit<IAppRootConfig<T>, 'strictBinding'> & {
  host: Element;
};

export type IEnhancementConfig<T extends object = object> = IAppRootConfig<T> & {
  host: Element;
  /**
   * The binding context of the enhancement. Will be instantiate by DI if a constructor is given
   */
  component: T | Constructable<T>;
  /**
   * A predefined container for the enhanced view.
   */
  container?: IContainer;
};
