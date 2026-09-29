import { IModuleLoader, isArray, isFunction, isPromise, isString, noop, onResolve, optional, resolve } from '@aurelia/kernel';
import { Scope, queueTask } from '@aurelia/runtime';
import { IInstruction, type DeferredDependencyLoader, type HydrateTemplateController } from '@aurelia/template-compiler';
import { IRenderLocation } from '../../dom';
import { IPlatform } from '../../platform';
import { IRendering } from '../../templating/rendering';
import { ISSRContext, adoptSSRView, isSSRTemplateController } from '../../templating/ssr';
import { IViewFactory } from '../../templating/view';
import { vmkCe } from '../../templating/controller';
import { createInterface } from '../../utilities-di';
import { ErrorNames, createMappedError } from '../../errors';
import { safeString } from '../../utilities';
import { attrTypeName, type CustomAttributeStaticAuDefinition } from '../custom-attribute';

import type { AnalyzedModule, IContainer, IModule, IRegistry, StaticResourceType } from '@aurelia/kernel';
import type {
  ControllerVisitor,
  ICustomAttributeController,
  ICustomAttributeViewModel,
  IHydratableController,
  IHydratedController,
  ISyntheticView,
} from '../../templating/controller';

_START_CONST_ENUM();
/**
 * The state of a [defer] block, also used to index its views and branches.
 * It only moves forward, except that a retry moves it from `error` back to `loading`.
 */
const enum State {
  placeholder = 0,
  loading = 1,
  complete = 2,
  error = 3,
}
_END_CONST_ENUM();

/**
 * The state of a [defer] block, available as `$defer.state` in its branches.
 */
export type DeferState = 'placeholder' | 'loading' | 'complete' | 'error';
const stateNames: readonly DeferState[] = ['placeholder', 'loading', 'complete', 'error'];

/**
 * Renders its content only after a trigger fires, and only after the dependencies of that content are loaded.
 * The content is compiled at that point too, so it can use elements that were not registered when the
 * surrounding template was compiled.
 *
 * ```html
 * <section defer="on: viewport; prefetch: idle; load.bind: loadChart">
 *   <heavy-chart series.bind="series"></heavy-chart>
 * </section>
 * <div defer-placeholder class="chart-skeleton"></div>
 * <div defer-loading="after: 150; minimum: 400">Loading…</div>
 * <div defer-error>Couldn't load the chart. <button click.trigger="$defer.retry()">Retry</button></div>
 * ```
 */
export class Defer implements ICustomAttributeViewModel {
  public static readonly $au: CustomAttributeStaticAuDefinition = {
    type: attrTypeName,
    name: 'defer',
    isTemplateController: true,
    compileContent: 'deferred',
    defaultProperty: 'on',
    bindables: {
      on: true,
      prefetch: true,
      when: true,
      target: true,
      margin: true,
      delay: { set: toNumber },
      load: true,
    },
  };

  /**
   * The triggers that render the content, as a comma or space separated list or an array:
   * `idle`, `viewport`, `interaction`, `hover`, `timer` or `immediate`. The first trigger to fire wins.
   *
   * Defaults to `idle`, unless `when` is bound.
   */
  public on: string | readonly string[] | null | undefined = void 0;
  /**
   * The triggers that only load the dependencies of the content, without rendering it.
   */
  public prefetch: string | readonly string[] | null | undefined = void 0;
  /**
   * Renders the content the first time it becomes truthy. Can be combined with `on`.
   */
  public when: unknown = void 0;
  /**
   * The element watched by the `viewport`, `interaction` and `hover` triggers.
   * Defaults to the first element of the `defer-placeholder` branch.
   */
  public target: Element | null | undefined = void 0;
  /**
   * The root margin of the `viewport` trigger, for example `200px`.
   */
  public margin: string | null | undefined = void 0;
  /**
   * The number of milliseconds the `timer` trigger waits after the block is attached.
   */
  public delay: number = 0;
  /**
   * One or more functions that load the dependencies of the content, for example `() => import('./heavy-chart')`.
   * A loader can resolve to a module, a resource class or a registry.
   */
  public load: DeferredDependencyLoader | readonly DeferredDependencyLoader[] | null | undefined = void 0;
  /**
   * The error of the last failed load. Available as `$defer.error` in the `defer-error` branch.
   */
  public error: unknown = void 0;

  /**
   * What the block renders: `placeholder` until a trigger fires, `loading` while the dependencies load,
   * then `complete`, or `error` when loading fails.
   */
  public get state(): DeferState {
    return stateNames[this._state];
  }

  public readonly $controller!: ICustomAttributeController<this>; // This is set by the controller after this instance is constructed

  /** @internal */ public readonly _branches: (DeferBranch | undefined)[] = [];
  /** @internal */ private readonly _views: (ISyntheticView | undefined)[] = [];
  /** @internal */ private _view: ISyntheticView | undefined = void 0;
  /** @internal */ private _state: State = State.placeholder;
  /** @internal */ private _pending: void | Promise<void> = void 0;
  /**
   * Incremented on detaching, so async work started while attached can tell it's stale.
   * @internal
   */
  private _epoch: number = 0;
  /** @internal */ private _isAttached: boolean = false;
  /** @internal */ private _loadingShownAt: number = -1;
  /** @internal */ private _loaded: boolean = false;
  /** @internal */ private _loadPromise: Promise<void> | null = null;
  /** @internal */ private _contentFactory: IViewFactory | undefined = void 0;
  /** @internal */ private _branchScope: Scope | undefined = void 0;
  /**
   * Cleanups for the registered triggers and timers.
   * @internal
   */
  private readonly _disposers: (() => void)[] = [];
  /** @internal */ private readonly _factory = resolve(IViewFactory);
  /** @internal */ private readonly _location = resolve(IRenderLocation);
  /** @internal */ private readonly _platform = resolve(IPlatform);
  /** @internal */ private readonly _rendering = resolve(IRendering);
  /** @internal */ private readonly _moduleLoader = resolve(IModuleLoader);
  /** @internal */ private readonly _triggers = resolve(IDeferTriggers);
  /** @internal */ private readonly _instruction = resolve(IInstruction) as HydrateTemplateController;
  /** @internal */ private readonly _isServer = resolve(optional(ISSRContext)) != null;
  /**
   * Whether `when` is bound, in which case there is no default trigger.
   * @internal
   */
  private readonly _hasWhen = this._instruction.props.some(prop => (prop as { to?: string }).to === 'when');

  public attaching(_initiator: IHydratedController): void | Promise<void> {
    const ctrl = this.$controller;
    const ssrScope = ctrl.ssrScope;
    if (ssrScope != null) {
      // Adopt the placeholder the server rendered, later activations take the normal path
      ctrl.ssrScope = void 0;
      const factory = this._branches[State.placeholder]?._factory;
      const adopted = factory != null && isSSRTemplateController(ssrScope) && ssrScope.type === 'defer'
        ? adoptSSRView(ssrScope, factory, ctrl, this._location, this._platform)
        : null;
      if (adopted != null) {
        const view = this._view = this._views[State.placeholder] = adopted.view;
        return view.activate(view, ctrl, this._getBranchScope());
      }
    }
    const state = this._state;
    return this._show(state === State.loading && this._loadingShownAt < 0 ? State.placeholder : state, true);
  }

  public attached(_initiator: IHydratedController): void {
    this._isAttached = true;
    if (this._state === State.placeholder) {
      this._arm();
    } else if (this._state === State.loading) {
      // A load started before the block was detached keeps going, pick it up again
      this._render();
    }
  }

  public detaching(initiator: IHydratedController): void | Promise<void> {
    this._isAttached = false;
    ++this._epoch;
    this._disarm();
    return onResolve(this._pending, () => {
      this._pending = void 0;
      const view = this._view;
      if (view?.isActive) {
        // The ancestor initiator tracks descendant async teardown
        void view.deactivate(initiator, this.$controller);
      }
    });
  }

  public whenChanged(value: unknown): void {
    if (Boolean(value) && this._isAttached && this._state === State.placeholder && !this._isServer) {
      this._trigger();
    }
  }

  /**
   * Loads the dependencies again after a failed load, then renders the content.
   */
  public retry(): void {
    if (this._state !== State.error) {
      return;
    }
    // The error stays available until the retry settles, as the error branch stays up while it loads
    this._state = State.loading;
    if (this._isAttached) {
      this._render();
    }
  }

  public dispose(): void {
    this._disarm();
    for (const view of this._views) {
      view?.dispose();
    }
    this._views.length = 0;
    this._view = void 0;
  }

  public accept(visitor: ControllerVisitor): void | true {
    if (this._view?.accept(visitor) === true) {
      return true;
    }
  }

  /** @internal */
  private _arm(): void {
    // The server renders the placeholder, the triggers only run in the browser
    if (this._isServer) {
      return;
    }
    const hasWhen = this._hasWhen;
    if (hasWhen && Boolean(this.when)) {
      this._trigger();
      return;
    }
    const triggers = parseTriggers(this.on);
    if (triggers.length === 0 && !hasWhen) {
      triggers.push('idle');
    }
    const trigger = () => this._trigger();
    for (const name of triggers) {
      // `immediate` fires while arming, and nothing after it is needed
      if (this._state !== State.placeholder) {
        return;
      }
      this._listen(name, trigger);
    }
    if (this._state !== State.placeholder) {
      return;
    }
    const prefetch = () => {
      // The failure is reported by the load itself, and the block tries again when it triggers
      (this._loadDependencies() as Promise<void> | undefined)?.catch(noop);
    };
    for (const name of parseTriggers(this.prefetch)) {
      this._listen(name, prefetch);
    }
  }

  /** @internal */
  private _disarm(): void {
    const disposers = this._disposers;
    for (const dispose of disposers.splice(0)) {
      dispose();
    }
  }

  /** @internal */
  private _listen(name: string, callback: () => void): void {
    const disposers = this._disposers;
    const platform = this._platform;
    switch (name) {
      case 'idle':
        disposers.push(this._triggers.idle(callback));
        break;
      case 'viewport':
        disposers.push(this._triggers.observe(this._getTarget(name), this.margin ?? '0px', callback));
        break;
      case 'interaction':
        disposers.push(listen(this._getTarget(name), interactionEvents, callback));
        break;
      case 'hover':
        disposers.push(listen(this._getTarget(name), hoverEvents, callback));
        break;
      case 'timer': {
        const handle = platform.setTimeout(callback, this.delay);
        disposers.push(() => platform.clearTimeout(handle));
        break;
      }
      case 'immediate':
        callback();
        break;
      default:
        throw createMappedError(ErrorNames.defer_invalid_trigger, name, getOwnerName(this));
    }
  }

  /**
   * The render location is a comment, which can't be observed or listened to,
   * so the element triggers watch the placeholder instead.
   * @internal
   */
  private _getTarget(trigger: string): Element {
    const nodes = this._views[State.placeholder]?.nodes.childNodes;
    const target = this.target
      ?? (nodes == null ? void 0 : Array.prototype.find.call(nodes, (node: Node) => node.nodeType === 1 /* Element */) as Element | undefined);
    if (target == null) {
      throw createMappedError(ErrorNames.defer_trigger_target_missing, trigger, getOwnerName(this));
    }
    return target;
  }

  /** @internal */
  private _trigger(): void {
    if (this._state !== State.placeholder) {
      return;
    }
    this._disarm();
    this._state = State.loading;
    this._render();
  }

  /**
   * Loads the dependencies, showing the loading branch while that takes longer than its `after`,
   * then renders the content, or the error branch when loading fails.
   * @internal
   */
  private _render(): void {
    const loaded = this._loadDependencies();
    if (!isPromise(loaded)) {
      this._complete();
      return;
    }
    const epoch = this._epoch;
    const platform = this._platform;
    const disposers = this._disposers;
    const loading = this._branches[State.loading] as DeferLoading | undefined;
    if (loading != null && this._loadingShownAt < 0) {
      const showLoading = () => {
        this._loadingShownAt = platform.performanceNow();
        void this._show(State.loading, false);
      };
      if (loading.after > 0) {
        const handle = platform.setTimeout(showLoading, loading.after);
        disposers.push(() => platform.clearTimeout(handle));
      } else {
        showLoading();
      }
    }
    loaded.then(
      () => {
        if (epoch !== this._epoch) {
          return;
        }
        this._disarm();
        const remaining = loading == null || this._loadingShownAt < 0
          ? 0
          : loading.minimum - (platform.performanceNow() - this._loadingShownAt);
        if (remaining > 0) {
          const handle = platform.setTimeout(() => this._complete(), remaining);
          disposers.push(() => platform.clearTimeout(handle));
        } else {
          this._complete();
        }
      },
      (error: unknown) => {
        // A block detached in the meantime loads again once it's attached again
        if (epoch === this._epoch) {
          this._fail(error, false);
        }
      },
    );
  }

  /** @internal */
  private _complete(): void {
    try {
      // Creating the content view compiles it the first time, which throws for invalid content,
      // such as a deferred element the loaded module doesn't define
      this._views[State.complete] ??= (this._contentFactory ?? this._factory).create(this.$controller).setLocation(this._location);
    } catch (error) {
      // Invalid content is a mistake of the author, so it's reported even when the error branch shows it
      this._fail(error, true);
      return;
    }
    this._state = State.complete;
    this.error = void 0;
    this._loadingShownAt = -1;
    void onResolve(this._show(State.complete, false), () => {
      // The content stays, so the branches are never shown again
      for (const state of [State.placeholder, State.loading, State.error]) {
        const view = this._views[state];
        if (view !== void 0 && !view.isActive) {
          view.dispose();
          this._views[state] = void 0;
        }
      }
    });
  }

  /**
   * Shows the error branch, which renders nothing when there is none.
   * @internal
   */
  private _fail(error: unknown, report: boolean): void {
    this.error = error;
    this._state = State.error;
    this._loadingShownAt = -1;
    if (report) {
      reportError(error);
    }
    this._disarm();
    void this._show(State.error, false);
  }

  /**
   * Loads the dependencies of the content once, into a container of its own.
   * A failed load is forgotten, so the next attempt calls the loaders again.
   * @internal
   */
  private _loadDependencies(): void | Promise<void> {
    if (this._loaded) {
      return;
    }
    if (this._loadPromise !== null) {
      return this._loadPromise;
    }
    const load = this.load;
    const loaders: unknown[] = [
      ...this._instruction.deferredLoaders ?? [],
      ...load == null ? [] : isArray(load) ? load : [load],
    ];
    if (loaders.length === 0) {
      this._loaded = true;
      return;
    }
    let modules: Promise<unknown[]>;
    try {
      modules = Promise.all(loaders.map(loader => {
        // A common mistake is load.bind="import('./chart')", which loads eagerly and passes a promise
        if (!isFunction(loader)) {
          throw createMappedError(ErrorNames.defer_invalid_load, getOwnerName(this), describeValue(loader));
        }
        return (loader as DeferredDependencyLoader)();
      }));
    } catch (error) {
      modules = Promise.reject(error);
    }
    return this._loadPromise = modules
      .then(results => {
        // Only a block that loads code gets a container of its own, others compile against the surrounding one
        const factory = this._factory;
        const container = factory.container.createChild({ inheritParentResources: true });
        for (const result of results) {
          registerModule(container, this._moduleLoader, result, this);
        }
        this._contentFactory = this._rendering.getViewFactory(factory.def, container);
        this._loaded = true;
        this._loadPromise = null;
      })
      .catch((error: unknown) => {
        this._loadPromise = null;
        // Reported once per failed load, however many renders or prefetches wait for it.
        // The error branch gets the original error, the report says which block it came from.
        if (this._branches[State.error] == null) {
          const report = createMappedError(
            ErrorNames.defer_load_failed,
            getOwnerName(this),
            error instanceof Error ? error.message : safeString(error),
          );
          report.cause = error;
          reportError(report);
        }
        throw error;
      });
  }

  /**
   * Swaps the current view for the view of the given state. Swaps run one after another.
   * @internal
   */
  private _show(state: State, isActivation: boolean): void | Promise<void> {
    const ctrl = this.$controller;
    const prev = this._view;
    const epoch = this._epoch;
    let view: ISyntheticView | undefined;
    let result: void | Promise<void>;
    try {
      const factory = state === State.complete
        ? this._contentFactory ?? this._factory
        : this._branches[state]?._factory;
      // Creating the content view compiles it the first time, which can throw
      view = this._view = factory == null
        ? void 0
        : this._views[state] ??= factory.create(ctrl).setLocation(this._location);
      result = onResolve(this._pending, () => onResolve(
        prev !== view && prev?.isActive ? prev.deactivate(prev, ctrl) : void 0,
        () => {
          // Skip the activation if the block was detached, or another swap took over
          if (view == null || view.isActive || epoch !== this._epoch || this._view !== view) {
            return;
          }
          return view.activate(view, ctrl, state === State.complete ? ctrl.scope : this._getBranchScope());
        },
      ));
    } catch (error) {
      if (isActivation) {
        throw error;
      }
      reportError(error);
      return;
    }
    if (!isPromise(result)) {
      return;
    }
    // Swaps after the initial activation happen outside of any lifecycle, so their errors are reported instead
    const pending: Promise<void> = this._pending = (isActivation ? result : result.catch(reportError)).then(() => {
      if (this._pending === pending) {
        this._pending = void 0;
      }
    });
    return pending;
  }

  /**
   * The branches see the surrounding scope, plus `$defer`.
   * @internal
   */
  private _getBranchScope(): Scope {
    const scope = this.$controller.scope;
    let branchScope = this._branchScope;
    if (branchScope?.parent !== scope) {
      branchScope = this._branchScope = Scope.fromParent(scope, scope.bindingContext);
      branchScope.overrideContext.$defer = this;
    }
    return branchScope;
  }
}

type DeferBranch = DeferPlaceholder | DeferLoading | DeferError;

/**
 * Links a branch to the preceding `defer`, or to the preceding branch of a `defer`, the same way `else` links to `if`.
 */
const linkBranch = (branch: DeferBranch, controller: IHydratableController, state: State): Defer => {
  const children = controller.children;
  const prev = children?.[children.length - 1]?.viewModel;
  const defer = prev instanceof Defer
    ? prev
    : prev instanceof DeferPlaceholder || prev instanceof DeferLoading || prev instanceof DeferError
      ? prev._defer
      : void 0;
  if (defer == null) {
    throw createMappedError(ErrorNames.defer_branch_without_defer, branch.$controller.definition.name);
  }
  defer._branches[state] = branch;
  return defer;
};

/**
 * Renders until a trigger of the preceding `defer` fires. Its first element is the default target of the
 * `viewport`, `interaction` and `hover` triggers.
 */
export class DeferPlaceholder implements ICustomAttributeViewModel {
  public static readonly $au: CustomAttributeStaticAuDefinition = {
    type: attrTypeName,
    name: 'defer-placeholder',
    isTemplateController: true,
  };

  public readonly $controller!: ICustomAttributeController<this>;
  /** @internal */ public readonly _factory = resolve(IViewFactory);
  /** @internal */ public _defer: Defer | undefined = void 0;

  public link(controller: IHydratableController): void {
    this._defer = linkBranch(this, controller, State.placeholder);
  }
}

/**
 * Replaces the placeholder while the dependencies of the preceding `defer` load.
 */
export class DeferLoading implements ICustomAttributeViewModel {
  public static readonly $au: CustomAttributeStaticAuDefinition = {
    type: attrTypeName,
    name: 'defer-loading',
    isTemplateController: true,
    defaultProperty: 'after',
    bindables: {
      after: { set: toNumber },
      minimum: { set: toNumber },
    },
  };

  /**
   * The number of milliseconds loading must take before this branch shows, so fast loads don't flash it.
   */
  public after: number = 0;
  /**
   * The minimum number of milliseconds this branch stays up once it shows.
   */
  public minimum: number = 0;

  public readonly $controller!: ICustomAttributeController<this>;
  /** @internal */ public readonly _factory = resolve(IViewFactory);
  /** @internal */ public _defer: Defer | undefined = void 0;

  public link(controller: IHydratableController): void {
    this._defer = linkBranch(this, controller, State.loading);
  }
}

/**
 * Renders when loading the dependencies of the preceding `defer` fails. Its scope has `$defer`,
 * with `$defer.error` and `$defer.retry()`.
 */
export class DeferError implements ICustomAttributeViewModel {
  public static readonly $au: CustomAttributeStaticAuDefinition = {
    type: attrTypeName,
    name: 'defer-error',
    isTemplateController: true,
  };

  public readonly $controller!: ICustomAttributeController<this>;
  /** @internal */ public readonly _factory = resolve(IViewFactory);
  /** @internal */ public _defer: Defer | undefined = void 0;

  public link(controller: IHydratableController): void {
    this._defer = linkBranch(this, controller, State.error);
  }
}

/**
 * Registers `defer` and its `defer-placeholder`, `defer-loading` and `defer-error` branches.
 */
export const DeferConfiguration: IRegistry = {
  register(container: IContainer): void {
    container.register(Defer, DeferPlaceholder, DeferLoading, DeferError);
  },
};

/**
 * Shares the observers and the idle queue between every `defer` block of an application.
 * Nothing is created until a block uses the trigger that needs it.
 */
interface IDeferTriggers {
  idle(callback: () => void): () => void;
  observe(target: Element, rootMargin: string, callback: () => void): () => void;
}
const IDeferTriggers = /*@__PURE__*/createInterface<IDeferTriggers>('IDeferTriggers', x => x.singleton(DeferTriggers));

class DeferTriggers implements IDeferTriggers {
  /** @internal */ private readonly _platform = resolve(IPlatform);
  /**
   * One observer per root margin, each with the callbacks of the elements it watches.
   * @internal
   */
  private readonly _observers = new Map<string, { observer: IntersectionObserver; targets: Map<Element, Set<() => void>> }>();
  /** @internal */ private readonly _idleQueue = new Set<() => void>();
  /** @internal */ private _cancelIdle: (() => void) | null = null;

  public idle(callback: () => void): () => void {
    const queue = this._idleQueue;
    queue.add(callback);
    this._scheduleIdle();
    return () => {
      if (queue.delete(callback) && queue.size === 0) {
        this._cancelIdle?.();
        this._cancelIdle = null;
      }
    };
  }

  public observe(target: Element, rootMargin: string, callback: () => void): () => void {
    const IntersectionObserver = (this._platform.window as { IntersectionObserver?: typeof globalThis.IntersectionObserver }).IntersectionObserver;
    // Without IntersectionObserver (such as in JSDOM) render when idle, rather than never
    if (IntersectionObserver == null) {
      return this.idle(callback);
    }
    let entry = this._observers.get(rootMargin);
    if (entry == null) {
      const targets = new Map<Element, Set<() => void>>();
      this._observers.set(rootMargin, entry = {
        targets,
        observer: new IntersectionObserver(entries => {
          for (const { isIntersecting, target } of entries) {
            if (isIntersecting) {
              targets.get(target)?.forEach(cb => cb());
            }
          }
        }, { rootMargin }),
      });
    }
    const { observer, targets } = entry;
    let callbacks = targets.get(target);
    if (callbacks == null) {
      targets.set(target, callbacks = new Set());
      observer.observe(target);
    }
    callbacks.add(callback);
    return () => {
      if (!callbacks.delete(callback) || callbacks.size > 0) {
        return;
      }
      targets.delete(target);
      observer.unobserve(target);
      if (targets.size === 0) {
        observer.disconnect();
        this._observers.delete(rootMargin);
      }
    };
  }

  /** @internal */
  private _scheduleIdle(): void {
    if (this._cancelIdle !== null) {
      return;
    }
    const platform = this._platform;
    const window = platform.window;
    const queue = this._idleQueue;
    const run = (deadline?: IdleDeadline) => {
      this._cancelIdle = null;
      for (const callback of queue) {
        queue.delete(callback);
        callback();
        // Leave the rest for the next idle period
        if (deadline != null && deadline.timeRemaining() <= 0 && !deadline.didTimeout) {
          break;
        }
      }
      if (queue.size > 0) {
        this._scheduleIdle();
      }
    };
    if (isFunction(window.requestIdleCallback)) {
      // A page that never goes idle still renders its blocks eventually
      const handle = window.requestIdleCallback(run, idleOptions);
      this._cancelIdle = () => window.cancelIdleCallback(handle);
    } else {
      // Safari has no requestIdleCallback, run after the current task instead
      const handle = platform.setTimeout(run, 1);
      this._cancelIdle = () => platform.clearTimeout(handle);
    }
  }
}

const idleOptions: IdleRequestOptions = { timeout: 10_000 };
const interactionEvents = ['click', 'keydown'] as const;
const hoverEvents = ['mouseenter', 'focusin'] as const;
const listenerOptions: AddEventListenerOptions = { capture: true, passive: true };

const listen = (target: Element, events: readonly string[], callback: () => void): (() => void) => {
  for (const event of events) {
    target.addEventListener(event, callback, listenerOptions);
  }
  return () => {
    for (const event of events) {
      target.removeEventListener(event, callback, listenerOptions);
    }
  };
};

const parseTriggers = (value: string | readonly string[] | null | undefined): string[] => value == null
  ? []
  : (isString(value) ? value.split(/[\s,]+/) : value.slice()).filter(Boolean);

function toNumber(value: unknown): number {
  return Number(value) || 0;
}

// Errors outside of a lifecycle go through the task queue, which logs them and rejects tasksSettled()
const reportError = (error: unknown): void => {
  queueTask(() => {
    throw error;
  });
};

/**
 * Registers what a loader resolved to. Classes, registries and HTML modules (which export `register`)
 * register themselves. From other modules, only the exported resources and registries are registered.
 */
const registerModule = (container: IContainer, moduleLoader: IModuleLoader, value: unknown, defer: Defer): void => {
  if (isFunction(value) || isFunction((value as Partial<IRegistry> | null)?.register)) {
    container.register(value);
  } else if (value != null && typeof value === 'object') {
    const resources = moduleLoader.load(value as IModule, getModuleResources) as unknown[];
    if (__DEV__ && resources.length === 0) {
      // eslint-disable-next-line no-console
      console.warn(
        `[DEV:aurelia] A module loaded by [defer] in <${getOwnerName(defer)}> exports no resources, so nothing was registered.`
        + ` Export the element class from the module, or resolve the loader to it, such as () => import('./chart').then(m => m.Chart).`,
      );
    }
    container.register(...resources);
  } else if (__DEV__) {
    // eslint-disable-next-line no-console
    console.warn(`[DEV:aurelia] A loader of [defer] in <${getOwnerName(defer)}> resolved to ${describeValue(value)}, so nothing was registered.`);
  }
};

/**
 * The name of the element whose template contains the block, so errors say where to look.
 */
const getOwnerName = (defer: Defer): string => {
  let controller: IHydratedController | null = defer.$controller.parent;
  while (controller != null && controller.vmKind !== vmkCe) {
    controller = controller.parent;
  }
  return controller?.definition.name ?? 'unknown';
};

const describeValue = (value: unknown): string => value === null
  ? 'null'
  : isPromise(value)
    ? 'a promise'
    : isArray(value)
      ? 'an array'
      : typeof value;

const getModuleResources = (m: AnalyzedModule): unknown[] => {
  const resources: unknown[] = [];
  for (const item of m.items) {
    if ((item.isRegistry || item.definition != null || isString((item.value as Partial<StaticResourceType>).$au?.type))
      && !resources.includes(item.value)
    ) {
      resources.push(item.value);
    }
  }
  return resources;
};
