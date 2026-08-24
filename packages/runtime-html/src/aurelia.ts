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
    return this._activateStandaloneRoot(appRoot, rootProvider);
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
    return this._activateStandaloneRoot(appRoot, this._rootProvider);
  }

  /** @internal */
  private _activateStandaloneRoot<T extends object>(
    root: IAppRoot<T>,
    provider: IDisposable,
  ): IAppRoot<T> | Promise<IAppRoot<T>> {
    let activation: void | Promise<void>;
    try {
      activation = root.activate();
    } catch (error) {
      return this._rollbackStandaloneRoot(root, provider, error);
    }
    if (isPromise(activation)) {
      return activation.then(
        () => root,
        error => this._rollbackStandaloneRoot(root, provider, error),
      );
    }
    return root;
  }

  /** @internal */
  private _rollbackStandaloneRoot<T extends object>(
    root: IAppRoot<T>,
    provider: IDisposable,
    activationError: unknown,
  ): never | Promise<never> {
    // enhance()/hydrate() do not publish through Aurelia._root, so their
    // rollback owns the AppRoot and its provider directly.
    const errors = [activationError];
    let rollback: void | Promise<void>;
    try {
      rollback = root instanceof AppRoot ? root._deactivateForRollback() : root.deactivate();
    } catch (error) {
      errors.push(error);
      return this._settleStandaloneRollback(root, provider, errors);
    }
    if (isPromise(rollback)) {
      return rollback.then(
        () => this._settleStandaloneRollback(root, provider, errors),
        error => {
          errors.push(error);
          return this._settleStandaloneRollback(root, provider, errors);
        },
      );
    }
    return this._settleStandaloneRollback(root, provider, errors);
  }

  /** @internal */
  private _settleStandaloneRollback<T extends object>(
    root: IAppRoot<T>,
    provider: IDisposable,
    errors: unknown[],
  ): never {
    try {
      root.dispose();
    } catch (error) {
      errors.push(error);
    }
    try {
      provider.dispose();
    } catch (error) {
      errors.push(error);
    }
    throwTransitionErrors(errors, 'Standalone Aurelia root activation failed during rollback');
  }

  /** @internal */
  private _startPromise: Promise<void> | void = void 0;
  /** @internal */
  private _stopRequestedWhileStarting: boolean = false;
  /** @internal */
  private _disposeAfterStart: boolean = false;
  public start(root: IAppRoot | undefined = this.next): void | Promise<void> {
    if (root == null) {
      throw createMappedError(ErrorNames.no_composition_root);
    }

    if (isPromise(this._startPromise)) {
      return this._startPromise;
    }

    const result = onResolve(this.stop(), () => this._activateRoot(root));

    if (isPromise(result)) {
      const startPromise = result.then(
        () => {
          if (this._startPromise === startPromise) {
            this._startPromise = void 0;
          }
        },
        error => {
          // Identity matters when start(B) is queued behind stop(A): only the
          // latest start may clear shared transition state or consume a stop
          // request intended for B.
          if (this._startPromise === startPromise) {
            this._startPromise = void 0;
            const dispose = this._disposeAfterStart;
            this._stopRequestedWhileStarting = false;
            this._disposeAfterStart = false;
            this._isStarting = false;
            if (dispose && this._root !== root) {
              // The preceding stop can fail before this queued root ever enters
              // _activateRoot. A stop(true) issued meanwhile still owns and must
              // dispose that never-started root.
              const errors = [error];
              try {
                root.dispose();
              } catch (disposeError) {
                errors.push(disposeError);
              }
              if (this.next === root) {
                this.next = void 0;
              }
              throwTransitionErrors(errors, 'Queued Aurelia start failed during disposal');
            }
          }
          throw error;
        },
      );
      return this._startPromise = startPromise;
    }
  }

  /** @internal */
  private _stopPromise: Promise<void> | void = void 0;
  public stop(dispose: boolean = false): void | Promise<void> {
    // Check the whole start transaction before _stopPromise. A replacement
    // start can be waiting behind the previous root's stop; callers invoking
    // stop now intend to stop the replacement too, not merely join stop(A).
    if (isPromise(this._startPromise)) {
      this._stopRequestedWhileStarting = true;
      this._disposeAfterStart ||= dispose;
      return this._startPromise;
    }

    if (isPromise(this._stopPromise)) {
      return this._stopPromise;
    }

    if (this._isStarting) {
      // A root can call stop re-entrantly before start() has assigned the Promise
      // returned by root.activate(). Record the request now; this synchronous
      // stack has no stable drain to return yet.
      this._stopRequestedWhileStarting = true;
      this._disposeAfterStart ||= dispose;
      return this._startPromise;
    }

    if (this._isRunning === true) {
      return this._beginStop(this._root!, dispose);
    }
  }

  /** @internal */
  private _beginStop(root: IAppRoot, dispose: boolean): Promise<void> {
    this._isRunning = false;
    this._isStopping = true;

    let result: void | Promise<void>;
    try {
      result = root.deactivate();
    } catch (error) {
      if (root instanceof AppRoot && root._consumeDeactivationVeto()) {
        return this._stopPromise = this._cancelStop(error);
      }
      return this._stopPromise = this._settleStop(root, dispose, true, error);
    }

    if (isPromise(result)) {
      return this._stopPromise = result.then(
        () => this._settleStop(root, dispose, false, void 0),
        error => root instanceof AppRoot && root._consumeDeactivationVeto()
          ? this._cancelStop(error)
          : this._settleStop(root, dispose, true, error),
      );
    }
    return this._stopPromise = this._settleStop(root, dispose, false, void 0);
  }

  /** @internal */
  private _activateRoot(root: IAppRoot): void | Promise<void> {
    this._isStarting = true;

    let result: void | Promise<void>;
    try {
      if (!refs.hideProp) {
        Reflect.set(root.host, '$aurelia', this);
      }
      this._rootProvider.prepare(this._root = root);
      result = root.activate();
    } catch (error) {
      return this._rollbackStart(root, error);
    }

    if (isPromise(result)) {
      return result.then(
        () => this._completeStart(root),
        error => this._rollbackStart(root, error),
      );
    }
    return this._completeStart(root);
  }

  /** @internal */
  private _completeStart(root: IAppRoot): void | Promise<void> {
    const stopRequested = this._stopRequestedWhileStarting;
    const dispose = this._disposeAfterStart;
    this._stopRequestedWhileStarting = false;
    this._disposeAfterStart = false;
    this._isRunning = true;
    this._isStarting = false;
    this._dispatchEvent(root, 'au-started', root.host);
    if (stopRequested) {
      // Activation still commits before its queued stop. This preserves normal
      // lifecycle/event order while keeping both calls on one stable Promise.
      return this._stopPromise ?? this._beginStop(root, dispose);
    }
  }

  /** @internal */
  private _rollbackStart(root: IAppRoot, activationError: unknown): never | Promise<never> {
    let rollback: void | Promise<void>;
    try {
      // Failed-start cleanup cannot be vetoed. AppTask errors are accumulated,
      // but Controller teardown must still make the unpublished root inert.
      rollback = root instanceof AppRoot ? root._deactivateForRollback() : root.deactivate();
    } catch (rollbackError) {
      return this._finalizeFailedStart(root, [activationError, rollbackError], true);
    }
    if (isPromise(rollback)) {
      return rollback.then(
        () => this._finalizeFailedStart(root, [activationError], false),
        rollbackError => this._finalizeFailedStart(root, [activationError, rollbackError], true),
      );
    }
    return this._finalizeFailedStart(root, [activationError], false);
  }

  /** @internal */
  private _finalizeFailedStart(root: IAppRoot, errors: unknown[], quarantine: boolean): never {
    quarantine ||= root instanceof AppRoot && !root._isRecoverable;
    const dispose = quarantine || this._disposeAfterStart;
    try {
      Reflect.deleteProperty(root.host, '$aurelia');
    } catch (error) {
      errors.push(error);
    }
    if (dispose) {
      try {
        root.dispose();
      } catch (error) {
        errors.push(error);
      }
      if (this.next === root) {
        this.next = void 0;
      }
    }
    if (this._root === root) {
      this._root = void 0;
      try {
        this._rootProvider.dispose();
      } catch (error) {
        errors.push(error);
      }
    }
    this._stopRequestedWhileStarting = false;
    this._disposeAfterStart = false;
    this._isStarting = false;
    throwTransitionErrors(errors, 'Aurelia start failed during rollback');
  }

  /** @internal */
  private _settleStop(
    root: IAppRoot,
    dispose: boolean,
    deactivationFailed: boolean,
    deactivationError: unknown,
  ): Promise<void> {
    // Keep a separate failure bit because Promise rejection and synchronous
    // throws may carry `undefined`, which is still a real deactivation failure.
    // Unlike partial startup, a formerly running app has fully connected queue
    // work. Preserve the established stop boundary before disposing resources.
    return tasksSettled().then(
      () => this._finalizeStop(root, dispose, deactivationFailed ? [deactivationError] : []),
      taskError => this._finalizeStop(
        root,
        dispose,
        deactivationFailed ? [deactivationError, taskError] : [taskError],
      ),
    );
  }

  /** @internal */
  private _cancelStop(vetoError: unknown): Promise<void> {
    // Tasks already accepted by the veto phase still quiesce before the app is
    // published as running again and the stop rejection becomes observable.
    return tasksSettled().then(
      () => this._finalizeCancelledStop([vetoError]),
      taskError => this._finalizeCancelledStop([vetoError, taskError]),
    );
  }

  /** @internal */
  private _finalizeCancelledStop(errors: unknown[]): never {
    this._isRunning = true;
    this._isStopping = false;
    this._stopPromise = void 0;
    throwTransitionErrors(errors, 'Aurelia stop was vetoed during application deactivation');
  }

  /** @internal */
  private _finalizeStop(root: IAppRoot, dispose: boolean, errors: unknown[]): void {
    try {
      Reflect.deleteProperty(root.host, '$aurelia');
    } catch (error) {
      errors.push(error);
    }
    if (dispose) {
      try {
        root.dispose();
      } catch (error) {
        errors.push(error);
      }
      if (this.next === root) {
        this.next = void 0;
      }
    }
    if (this._root === root) {
      this._root = void 0;
      try {
        this._rootProvider.dispose();
      } catch (error) {
        errors.push(error);
      }
    }
    this._isStopping = false;
    this._stopPromise = void 0;

    // au-stopped remains a successful-transition event. A rejected stop still
    // finalizes the Aurelia instance, while its promise reports the failure.
    if (errors.length === 0) {
      try {
        this._dispatchEvent(root, 'au-stopped', root.host);
      } catch (error) {
        errors.push(error);
      }
    }
    if (errors.length > 0) {
      throwTransitionErrors(errors, 'Aurelia stop failed during cleanup');
    }
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

function throwTransitionErrors(errors: unknown[], message: string): never {
  if (errors.length === 1) {
    throw errors[0];
  }
  throw new AggregateError(errors, message);
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
