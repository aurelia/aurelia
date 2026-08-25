import { isPromise, DI, InstanceProvider, noop, onResolve } from '@aurelia/kernel';
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
  private _transitionFailure: { readonly error: unknown } | undefined = void 0;

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

  /**
   * Hydrate a pre-rendered DOM tree with an Aurelia component.
   *
   * Unlike `enhance()`, which compiles the host element as a template,
   * `hydrate()` adopts existing DOM that was pre-rendered (e.g., by SSR)
   * and connects it to a component that has an AOT-compiled definition.
   *
   * The component's definition (with instructions) should already be attached
   * to the component class - either via decorator or static `$au` property.
   * This is what AOT compilation produces.
   *
   * @param config - Hydration configuration including host, component, and ssrScope
   * @returns The app root, or a promise that resolves to it
   *
   * @example
   * ```typescript
   * // Server renders HTML with markers and manifest
   * // Client receives pre-rendered HTML in #app and manifest in window.__SSR_MANIFEST__
   *
   * await aurelia.hydrate({
   *   host: document.getElementById('app'),
   *   component: MyApp,  // Has AOT-compiled definition
   *   ssrScope: window.__SSR_MANIFEST__,
   * });
   * ```
   */
  public hydrate<T extends object>(config: IHydrateConfig<T>): IAppRoot<T> | Promise<IAppRoot<T>> {
    const container = config.container ?? this.container.createChild();
    const appRoot: IAppRoot<T> = new AppRoot(
      { host: config.host, component: config.component, ssrScope: config.ssrScope },
      container,
      this._rootProvider,
      false, // not enhance mode
    );
    return onResolve(appRoot.activate(), () => appRoot);
  }

  /** @internal */
  private _startPromise: Promise<void> | void = void 0;
  /** @internal */
  private _queuedStop: QueuedStop | undefined = void 0;
  public start(root: IAppRoot | undefined = this.next): void | Promise<void> {
    if (root == null) {
      throw createMappedError(ErrorNames.no_composition_root);
    }

    if (isPromise(this._startPromise)) {
      return this._startPromise;
    }
    if (this._transitionFailure !== void 0) {
      throw this._transitionFailure.error;
    }

    let result: void | Promise<void>;
    try {
      result = onResolve(this.stop(), () => this._activateRoot(root));
    } catch (error) {
      this._transitionFailure = { error };
      this._rejectQueuedStop(error);
      throw error;
    }

    if (isPromise(result)) {
      const startPromise = result.then(
        () => {
          if (this._startPromise === startPromise) {
            this._startPromise = void 0;
          }
          this._publishQueuedStop(root);
        },
        error => {
          // A failed root transition is terminal. Keep the operation published
          // so later callers observe the same rejection and no second lifecycle
          // operation starts against a partially transitioned application.
          this._transitionFailure = { error };
          this._rejectQueuedStop(error);
          throw error;
        },
      );
      return this._startPromise = startPromise;
    }
    this._publishQueuedStop(root);
  }

  /** @internal */
  private _stopPromise: Promise<void> | void = void 0;
  public stop(dispose: boolean = false): void | Promise<void> {
    if (this._transitionFailure !== void 0) {
      if (this._queuedStop !== void 0) {
        return this._queuedStop.promise;
      }
      if (isPromise(this._stopPromise)) {
        return this._stopPromise;
      }
      throw this._transitionFailure.error;
    }

    // Check the start operation before _stopPromise. A replacement start can
    // be waiting behind the previous root's stop; this request belongs to the
    // replacement and receives its own completion Promise.
    if (isPromise(this._startPromise)) {
      return this._queueStop(dispose);
    }

    if (this._queuedStop !== void 0) {
      return this._queueStop(dispose);
    }

    if (isPromise(this._stopPromise)) {
      return this._stopPromise;
    }

    if (this._isStarting) {
      // root.activate() can call stop before start() has received its result.
      // A deferred request gives that re-entrant caller the same stable stop
      // boundary as a caller observing an asynchronous start.
      return this._queueStop(dispose);
    }

    if (this._isRunning === true) {
      return this._beginStop(this._root!, dispose);
    }
  }

  /** @internal */
  private _beginStop(root: IAppRoot, dispose: boolean, queued?: QueuedStop): void | Promise<void> {
    this._isRunning = false;
    this._isStopping = true;

    let stopPromise: Promise<void>;
    try {
      // tasksSettled always returns a Promise, so both the synchronous and
      // asynchronous deactivation paths converge on one asynchronous stop.
      stopPromise = onResolve(root.deactivate(), () => {
        return onResolve(tasksSettled(), () => this._completeStop(root, dispose));
      }) as Promise<void>;
    } catch (error) {
      this._transitionFailure = { error };
      throw error;
    }
    const transition = stopPromise.catch(error => {
      this._transitionFailure = { error };
      throw error;
    });
    if (queued === void 0) {
      return this._stopPromise = transition;
    }
    void transition.then(queued.resolve, queued.reject);
    return queued.promise;
  }

  /** @internal */
  private _activateRoot(root: IAppRoot): void | Promise<void> {
    this._isStarting = true;

    if (!refs.hideProp) {
      Reflect.set(root.host, '$aurelia', this);
    }
    this._rootProvider.prepare(this._root = root);
    return onResolve(root.activate(), () => this._completeStart(root));
  }

  /** @internal */
  private _completeStart(root: IAppRoot): void {
    this._isRunning = true;
    this._isStarting = false;
    this._dispatchEvent(root, 'au-started', root.host);
  }

  /** @internal */
  private _queueStop(dispose: boolean): Promise<void> {
    const queued = this._queuedStop ??= createQueuedStop(dispose);
    queued.dispose ||= dispose;
    return queued.promise;
  }

  /** @internal */
  private _publishQueuedStop(root: IAppRoot): void {
    const queued = this._queuedStop;
    if (queued === void 0) {
      return;
    }
    this._queuedStop = void 0;
    this._stopPromise = queued.promise;

    // Publish the successful start before beginning its queued stop. The extra
    // Promise turn lets start() observers run at the au-started boundary while
    // the distinct stop Promise continues through teardown.
    void Promise.resolve().then(noop).then(() => {
      try {
        void this._beginStop(root, queued.dispose, queued);
      } catch (error) {
        queued.reject(error);
      }
    });
  }

  /** @internal */
  private _rejectQueuedStop(error: unknown): void {
    this._queuedStop?.reject(error);
  }

  /** @internal */
  private _completeStop(root: IAppRoot, dispose: boolean): void {
    Reflect.deleteProperty(root.host, '$aurelia');
    if (dispose) {
      root.dispose();
      if (this.next === root) {
        this.next = void 0;
      }
    }
    if (this._root === root) {
      this._root = void 0;
      this._rootProvider.dispose();
    }
    this._isStopping = false;
    this._stopPromise = void 0;
    this._dispatchEvent(root, 'au-stopped', root.host);
  }

  public dispose(): void {
    if (
      this._isRunning
      || this._isStarting
      || this._isStopping
      || isPromise(this._startPromise)
      || isPromise(this._stopPromise)
    ) {
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

interface QueuedStop {
  dispose: boolean;
  readonly promise: Promise<void>;
  readonly resolve: () => void;
  readonly reject: (reason: unknown) => void;
}

function createQueuedStop(dispose: boolean): QueuedStop {
  let resolve!: () => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { dispose, promise, resolve, reject };
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

// Import the type for use in IHydrateConfig
import type { ISSRScope } from './templating/ssr';

export interface IHydrateConfig<T extends object = object> {
  /**
   * The host element containing pre-rendered HTML with markers.
   * The server-rendered content should match what the template would produce.
   */
  host: HTMLElement;

  /**
   * The root component class. For SSR hydration, this should have an
   * AOT-compiled definition (needsCompile: false, instructions pre-generated).
   */
  component: Constructable<T>;

  /**
   * Tree-shaped SSR manifest scope for the root custom element.
   * Built by recordManifest() after SSR render, mirrors the controller tree.
   */
  ssrScope?: ISSRScope;

  /**
   * Optional container for the hydrated app.
   */
  container?: IContainer;
}
