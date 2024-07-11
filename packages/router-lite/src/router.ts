import { isObject } from '@aurelia/metadata';
import { IContainer, ILogger, DI, IDisposable, onResolve, Writable, onResolveAll, Registration, resolve } from '@aurelia/kernel';
import { CustomElement, CustomElementDefinition, IPlatform } from '@aurelia/runtime-html';

import { IRouteContext, RouteContext } from './route-context';
import { IRouterEvents, NavigationStartEvent, NavigationEndEvent, NavigationCancelEvent, ManagedState, AuNavId, RoutingTrigger, NavigationErrorEvent } from './router-events';
import { ILocationManager } from './location-manager';
import { resolveRouteConfiguration, RouteConfig, RouteType } from './route';
import { IRouteViewModel } from './component-agent';
import { RouteTree, RouteNode, createAndAppendNodes } from './route-tree';
import { IViewportInstruction, NavigationInstruction, RouteContextLike, ViewportInstructionTree, ViewportInstruction } from './instructions';
import { Batch, mergeDistinct, UnwrapPromise } from './util';
import { type ViewportAgent } from './viewport-agent';
import { INavigationOptions, NavigationOptions, type RouterOptions, IRouterOptions } from './options';
import { isPartialViewportInstruction } from './validation';
import { Events, debug, error, getMessage, trace } from './events';

/** @internal */
export const emptyQuery = Object.freeze(new URLSearchParams());

export function isManagedState(state: {} | null): state is ManagedState {
  return isObject(state) && Object.prototype.hasOwnProperty.call(state, AuNavId) === true;
}
export function toManagedState(state: {} | null, navId: number): ManagedState {
  return { ...state, [AuNavId]: navId };
}

/** @internal */
export class UnknownRouteError extends Error { }

export class Transition {
  /** @internal */
  private _erredWithUnknownRoute: boolean = false;
  public get erredWithUnknownRoute(): boolean { return this._erredWithUnknownRoute; }

  private constructor(
    public readonly id: number,
    public readonly prevInstructions: ViewportInstructionTree,
    public readonly instructions: ViewportInstructionTree,
    public finalInstructions: ViewportInstructionTree,
    public readonly instructionsChanged: boolean,
    public readonly trigger: RoutingTrigger,
    public readonly options: NavigationOptions,
    public readonly managedState: ManagedState | null,
    public readonly previousRouteTree: RouteTree,
    public routeTree: RouteTree,
    public readonly promise: Promise<boolean> | null,
    public readonly resolve: ((success: boolean) => void) | null,
    public readonly reject: ((err: unknown) => void) | null,
    public guardsResult: boolean | ViewportInstructionTree,
    public error: unknown,
  ) { }

  /** @internal */
  public static _create(input: Omit<Transition, '_run' | '_handleError' | 'erredWithUnknownRoute'>): Transition {
    return new Transition(
      input.id,
      input.prevInstructions,
      input.instructions,
      input.finalInstructions,
      input.instructionsChanged,
      input.trigger,
      input.options,
      input.managedState,
      input.previousRouteTree,
      input.routeTree,
      input.promise,
      input.resolve,
      input.reject,
      input.guardsResult,
      void 0,
    );
  }

  /** @internal */
  public _run<T>(cb: () => T, next: (value: UnwrapPromise<T>) => void): void {
    if (this.guardsResult !== true) {
      return;
    }
    try {
      const ret = cb();
      if (ret instanceof Promise) {
        ret.then(next).catch(err => {
          this._handleError(err);
        });
      } else {
        next(ret as UnwrapPromise<T>);
      }
    } catch (err) {
      this._handleError(err);
    }
  }

  /** @internal */
  public _handleError(err: unknown): void {
    this._erredWithUnknownRoute = err instanceof UnknownRouteError;
    this.reject!(this.error = err);
  }

  // Should not be adjust for DEV as it is also used of logging in production build.
  public toString(): string {
    return `T(id:${this.id},trigger:'${this.trigger}',instructions:${this.instructions})`;
  }
}

type RouteConfigLookup = WeakMap<RouteConfig, IRouteContext>;
type ViewportAgentLookup = Map<ViewportAgent | null, RouteConfigLookup>;

export interface IRouter extends Router { }
export const IRouter = /*@__PURE__*/DI.createInterface<IRouter>('IRouter', x => x.singleton(Router));
export class Router {
  /** @internal */ private _$ctx: RouteContext | null = null;
  /** @internal */
  private get _ctx(): RouteContext {
    const ctx = this._$ctx;
    if (ctx !== null) return ctx;
    if (!this._container.has(IRouteContext, true)) throw new Error(getMessage(Events.rtrNoCtx));
    return this._$ctx = this._container.get(IRouteContext);
  }

  /** @internal */
  private _routeTree: RouteTree | null = null;
  public get routeTree(): RouteTree {
    let routeTree = this._routeTree;
    if (routeTree === null) {
      // Lazy instantiation for only the very first (synthetic) tree.
      // Doing it here instead of in the constructor to delay it until we have the context.
      const ctx = this._ctx;
      routeTree = this._routeTree = new RouteTree(
        NavigationOptions.create(this.options, {}),
        emptyQuery,
        null,
        RouteNode.create({
          path: '',
          finalPath: '',
          context: ctx,
          instruction: null,
          component: CustomElement.getDefinition(ctx.config.component as RouteType),
          title: ctx.config.title,
        }),
      );
    }
    return routeTree;
  }

  /** @internal */
  private _currentTr: Transition | null = null;
  public get currentTr(): Transition {
    return this._currentTr ??= Transition._create({
      id: 0,
      prevInstructions: this._instructions,
      instructions: this._instructions,
      finalInstructions: this._instructions,
      instructionsChanged: true,
      trigger: 'api',
      options: NavigationOptions.create(this.options, {}),
      managedState: null,
      previousRouteTree: this.routeTree._clone(),
      routeTree: this.routeTree,
      resolve: null,
      reject: null,
      promise: null,
      guardsResult: true,
      error: void 0,
    });
  }
  /** @internal */
  private set currentTr(value: Transition) {
    this._currentTr = value;
  }

  /** @internal */ private _navigated: boolean = false;
  /** @internal */ private _navigationId: number = 0;

  /** @internal */ private _instructions: ViewportInstructionTree;

  /** @internal */ private _nextTr: Transition | null = null;
  /** @internal */ private _locationChangeSubscription: IDisposable | null = null;

  /** @internal */ public readonly _hasTitleBuilder: boolean = false;

  /** @internal */ private _isNavigating: boolean = false;
  public get isNavigating(): boolean {
    return this._isNavigating;
  }

  /** @internal */ private readonly _container: IContainer = resolve(IContainer);
  /** @internal */ private readonly _p: IPlatform = resolve(IPlatform);
  /** @internal */ private readonly _logger: ILogger =  /*@__PURE__*/ resolve(ILogger).root.scopeTo('Router');
  /** @internal */ private readonly _events: IRouterEvents = resolve(IRouterEvents);
  /** @internal */ private readonly _locationMgr: ILocationManager = resolve(ILocationManager);
  public readonly options: Readonly<RouterOptions> = resolve(IRouterOptions);

  public constructor() {
    this._instructions = ViewportInstructionTree.create('', this.options);
    this._container.registerResolver(Router, Registration.instance(Router, this));
  }

  /**
   * Get the closest RouteContext relative to the provided component, controller or node.
   *
   * @param context - The object from which to resolve the closest RouteContext.
   *
   * @returns when the value is:
   * - `null`: the root
   * - `IRouteContext`: the provided value (no-op)
   * - `HTMLElement`: the context of the routeable component (page) that directly or indirectly contains this element.
   * - `ICustomElementViewModel` (the `this` object when working from inside a view model): the context of this component (if it was loaded as a route), or the routeable component (page) directly or indirectly containing it.
   * - `ICustomElementController`: same as `ICustomElementViewModel`, but using the controller object instead of the view model object (advanced users).
   *
   * @internal
   */
  private _resolveContext(context: RouteContextLike | null): IRouteContext {
    return RouteContext.resolve(this._ctx, context);
  }

  public start(performInitialNavigation: boolean): void | Promise<boolean> {
    (this as Writable<Router>)._hasTitleBuilder = typeof this.options.buildTitle === 'function';

    this._locationMgr.startListening();
    this._locationChangeSubscription = this._events.subscribe('au:router:location-change', e => {
      // At the time of writing, chromium throttles popstate events at a maximum of ~100 per second.
      // While macroTasks run up to 250 times per second, it is extremely unlikely that more than ~100 per second of these will run due to the double queueing.
      // However, this throttle limit could theoretically be hit by e.g. integration tests that don't mock Location/History.
      // If the throttle limit is hit, then add a throttle config.
      this._p.taskQueue.queueTask(() => {
        // Don't try to restore state that might not have anything to do with the Aurelia app
        const state = isManagedState(e.state) ? e.state : null;

        const routerOptions = this.options;
        const options = NavigationOptions.create(routerOptions, { historyStrategy: 'replace' });
        const instructions = ViewportInstructionTree.create(e.url, routerOptions, options, this._ctx);
        // The promise will be stored in the transition. However, unlike `load()`, `start()` does not return this promise in any way.
        // The router merely guarantees that it will be awaited (or canceled) before the next transition, so a race condition is impossible either way.
        // However, it is possible to get floating promises lingering during non-awaited unit tests, which could have unpredictable side-effects.
        // So we do want to solve this at some point.
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this._enqueue(instructions, e.trigger, state, null);
      });
    });

    if (!this._navigated && performInitialNavigation) {
      return this.load(this._locationMgr.getPath(), { historyStrategy: this.options.historyStrategy !== 'none' ? 'replace' : 'none' });
    }
  }

  public stop(): void {
    this._locationMgr.stopListening();
    this._locationChangeSubscription?.dispose();
  }

  /**
   * Loads the provided path.
   *
   * Examples:
   *
   * ```ts
   * // Load the route 'product-detail', as a child of the current component, with child route '37'.
   * router.load('product-detail/37', { context: this });
   * ```
   */
  public load(path: string, options?: INavigationOptions): Promise<boolean>;
  /**
   * Loads the provided paths as siblings.
   *
   * Examples:
   *
   * ```ts
   * router.load(['category/50/product/20', 'widget/30']);
   * ```
   */
  public load(paths: readonly string[], options?: INavigationOptions): Promise<boolean>;
  /**
   * Loads the provided component type. Must be a custom element.
   *
   * Examples:
   *
   * ```ts
   * router.load(ProductList);
   * router.load(CustomElement.define({ name: 'greeter', template: 'Hello!' }));
   * ```
   */
  public load(componentType: RouteType, options?: INavigationOptions): Promise<boolean>;
  /**
   * Loads the provided component types. Must be custom elements.
   *
   * Examples:
   *
   * ```ts
   * router.load([MemberList, OrganizationList]);
   * ```
   */
  public load(componentTypes: readonly RouteType[], options?: INavigationOptions): Promise<boolean>;
  /**
   * Loads the provided component instance.
   *
   * Examples:
   *
   * ```ts
   * // Given an already defined custom element named Greeter
   * const greeter = new Greeter();
   * Controller.$el(container, greeter, host);
   * router.load(greeter);
   * ```
   */
  public load(componentInstance: IRouteViewModel, options?: INavigationOptions): Promise<boolean>;
  /**
   * Loads the provided ViewportInstruction, with component specified in any of the ways as described
   * in the other method overloads, and optional additional properties.
   *
   * Examples:
   *
   * ```ts
   * router.load({ component: 'product-detail', parameters: { id: 37 } })
   * router.load({ component: ProductDetail, parameters: { id: 37 } })
   * router.load({ component: 'category', children: ['product(id=20)'] })
   * router.load({ component: 'category', children: [{ component: 'product', parameters: { id: 20 } }] })
   * ```
   */
  public load(viewportInstruction: IViewportInstruction, options?: INavigationOptions): boolean | Promise<boolean>;
  public load(instructionOrInstructions: NavigationInstruction | readonly NavigationInstruction[], options?: INavigationOptions): boolean | Promise<boolean>;
  public load(instructionOrInstructions: NavigationInstruction | readonly NavigationInstruction[], options?: INavigationOptions): boolean | Promise<boolean> {
    const instructions = this.createViewportInstructions(instructionOrInstructions, options);

    if (__DEV__) trace(this._logger, Events.rtrLoading, instructions);

    return this._enqueue(instructions, 'api', null, null);
  }

  public isActive(instructionOrInstructions: NavigationInstruction | readonly NavigationInstruction[], context: RouteContextLike): boolean {
    const ctx = this._resolveContext(context);
    const instructions = instructionOrInstructions instanceof ViewportInstructionTree
      ? instructionOrInstructions
      : this.createViewportInstructions(instructionOrInstructions, { context: ctx, historyStrategy: this.options.historyStrategy });

    if (__DEV__) trace(this._logger, Events.rtrIsActive, instructions, ctx);

    return this.routeTree.contains(instructions, false);
  }

  private readonly _vpaLookup: ViewportAgentLookup = new Map();
  /**
   * Retrieve the RouteContext, which contains statically configured routes combined with the customElement metadata associated with a type.
   *
   * The customElement metadata is lazily associated with a type via the RouteContext the first time `getOrCreate` is called.
   *
   * @param viewportAgent - The ViewportAgent hosting the component associated with this RouteContext. If the RouteContext for the component+viewport combination already exists, the ViewportAgent will be updated in case it changed.
   * @param componentDefinition - The custom element definition.
   * @param container - The `controller.container` of the component hosting the viewport that the route will be loaded into.
   *
   */
  public getRouteContext(
    viewportAgent: ViewportAgent | null,
    componentDefinition: CustomElementDefinition,
    componentInstance: IRouteViewModel | null,
    container: IContainer,
    parentRouteConfig: RouteConfig | null,
    parentContext: IRouteContext | null,
    $rdConfig: RouteConfig | null,
  ): IRouteContext | Promise<IRouteContext> {
    const logger =  /*@__PURE__*/ container.get(ILogger).scopeTo('RouteContext');

    // getRouteConfig is prioritized over the statically configured routes via @route decorator.
    return onResolve(
      $rdConfig instanceof RouteConfig
        ? $rdConfig
        : resolveRouteConfiguration(
          typeof componentInstance?.getRouteConfig === 'function' ? componentInstance : componentDefinition.Type,
          false,
          parentRouteConfig,
          null,
          parentContext
        ),
      rdConfig => {
        let routeConfigLookup = this._vpaLookup.get(viewportAgent);
        if (routeConfigLookup === void 0) {
          this._vpaLookup.set(viewportAgent, routeConfigLookup = new WeakMap());
        }

        let routeContext = routeConfigLookup.get(rdConfig);
        if (routeContext !== void 0) {
          if (__DEV__) trace(logger, Events.rtrResolvingRcExisting, rdConfig);
          return routeContext;
        }
        if (__DEV__) trace(logger, Events.rtrResolvingRcNew, rdConfig);

        const parent = container.has(IRouteContext, true) ? container.get(IRouteContext) : null;

        routeConfigLookup.set(
          rdConfig,
          routeContext = new RouteContext(
            viewportAgent,
            parent,
            componentDefinition,
            rdConfig,
            container,
            this,
          ),
        );
        return routeContext;
      }
    );
  }

  public createViewportInstructions(instructionOrInstructions: NavigationInstruction | readonly NavigationInstruction[], options?: INavigationOptions): ViewportInstructionTree {
    if (instructionOrInstructions instanceof ViewportInstructionTree) return instructionOrInstructions;

    let context: IRouteContext | null = (options?.context ?? null) as IRouteContext | null;
    if (typeof instructionOrInstructions === 'string') {
      instructionOrInstructions = this._locationMgr.removeBaseHref(instructionOrInstructions);
    }

    const isVpInstr = isPartialViewportInstruction(instructionOrInstructions);
    let $instruction = isVpInstr ? (instructionOrInstructions as IViewportInstruction).component : instructionOrInstructions;
    if (typeof $instruction === 'string' && $instruction.startsWith('../') && context !== null) {
      context = this._resolveContext(context);
      while (($instruction as string).startsWith('../') && (context?.parent ?? null) !== null) {
        $instruction = ($instruction as string).slice(3);
        context = context!.parent;
      }
    }
    if (isVpInstr) {
      (instructionOrInstructions as Writable<IViewportInstruction>).component = $instruction;
    } else {
      instructionOrInstructions = $instruction;
    }

    const routerOptions = this.options;
    return ViewportInstructionTree.create(
      instructionOrInstructions,
      routerOptions,
      NavigationOptions.create(routerOptions, { ...options, context }),
      this._ctx
    );
  }

  /**
   * Enqueue an instruction tree to be processed as soon as possible.
   *
   * Will wait for any existing in-flight transition to finish, otherwise starts immediately.
   *
   * @param instructions - The instruction tree that determines the transition
   * @param trigger - `'popstate'` or `'hashchange'` if initiated by a browser event, or `'api'` for manually initiated transitions via the `load` api.
   * @param state - The state to restore, if any.
   * @param failedTr - If this is a redirect / fallback from a failed transition, the previous transition is passed forward to ensure the original promise resolves with the latest result.
   *
   * @internal
   */
  private _enqueue(
    instructions: ViewportInstructionTree,
    trigger: RoutingTrigger,
    state: ManagedState | null,
    failedTr: Transition | null,
  ): boolean | Promise<boolean> {
    const lastTr = this.currentTr;
    const logger = this._logger;

    if (trigger !== 'api' && lastTr.trigger === 'api' && lastTr.instructions.equals(instructions)) {
      // User-triggered navigation that results in `replaceState` with the same URL. The API call already triggered the navigation; event is ignored.
      if (__DEV__) debug(logger, Events.rtrIgnoringIdenticalNav, trigger);
      return true;
    }

    let resolve: Exclude<Transition['resolve'], null> = (void 0)!; // Need this initializer because TS doesn't know the promise executor will run synchronously
    let reject: Exclude<Transition['reject'], null> = (void 0)!;
    let promise: Exclude<Transition['promise'], null>;

    const restorePrevRT = this.options.restorePreviousRouteTreeOnError;
    if (failedTr === null || failedTr.erredWithUnknownRoute || (failedTr.error != null && restorePrevRT)) {
      promise = new Promise(function ($resolve, $reject) { resolve = $resolve; reject = $reject; });
    } else {
      // Ensure that `await router.load` only resolves when the transition truly finished, so chain forward on top of
      // any previously failed transition that caused a recovering backwards navigation.
      if (__DEV__) debug(logger, Events.rtrReusingPromise, failedTr);
      promise = failedTr.promise!;
      resolve = failedTr.resolve!;
      reject = failedTr.reject!;
    }

    // This is an intentional overwrite: if a new transition is scheduled while the currently scheduled transition hasn't even started yet,
    // then the currently scheduled transition is effectively canceled/ignored.
    // This is consistent with the runtime's controller behavior, where if you rapidly call async activate -> deactivate -> activate (for example), then the deactivate is canceled.
    const nextTr = this._nextTr = Transition._create({
      id: ++this._navigationId,
      trigger,
      managedState: state,
      prevInstructions: lastTr.finalInstructions,
      finalInstructions: instructions,
      instructionsChanged: !lastTr.finalInstructions.equals(instructions),
      instructions,
      options: instructions.options,
      promise,
      resolve,
      reject,
      previousRouteTree: this.routeTree,
      routeTree: this._routeTree = this.routeTree._clone(),
      guardsResult: true,
      error: void 0,
    });

    if (__DEV__) debug(logger, Events.rtrSchedulingTr, nextTr);

    if (!this._isNavigating) {
      // Catch any errors that might be thrown by `run` and reject the original promise which is awaited down below
      try {
        this._run(nextTr);
      } catch (err) {
        nextTr._handleError(err);
      }
    }

    return nextTr.promise!.then(ret => {
      if (__DEV__) debug(logger, Events.rtrTrSucceeded, nextTr);
      return ret;
    }).catch(err => {
      error(logger, Events.rtrTrFailed, nextTr, err);
      if (nextTr.erredWithUnknownRoute) {
        this._cancelNavigation(nextTr);
      } else {
        this._isNavigating = false;
        this._events.publish(new NavigationErrorEvent(nextTr.id, nextTr.instructions, err));
        if (restorePrevRT) {
          this._cancelNavigation(nextTr);
        } else {
          const $nextTr = this._nextTr;
          // because the navigation failed it makes sense to restore the previous route-tree so that with next navigation, lifecycle hooks are correctly invoked.
          if ($nextTr !== null) {
            ($nextTr as Writable<Transition>).previousRouteTree = nextTr.previousRouteTree;
          } else {
            this._routeTree = nextTr.previousRouteTree;
          }
        }
      }
      throw err;
    });
  }

  /** @internal */
  private _run(tr: Transition): void {
    this.currentTr = tr;
    this._nextTr = null;

    /**
     * Future optimization scope:
     * Can we devise a plan to ignore a transition?
     * The idea is to deterministically identify that the given transition is already active.
     * In that case, we only choose to execute the transition if the transitionPlan is set to replace. (this check is currently done in the viewport agent).
     *
     * Solution idea:
     * The root RouteNode needs to be consistently updated, even when children nodes are lazily added.
     * When done, the instruction can be compared starting with the root node.
     */

    this._isNavigating = true;
    let navigationContext = this._resolveContext(tr.options.context);
    const logger = /*@__PURE__*/ this._logger.scopeTo('run()');

    if (__DEV__) trace(logger, Events.rtrRunBegin, tr);

    this._events.publish(new NavigationStartEvent(tr.id, tr.instructions, tr.trigger, tr.managedState));

    // If user triggered a new transition in response to the NavigationStartEvent
    // (in which case `this.nextTransition` will NOT be null), we short-circuit here and go straight to processing the next one.
    if (this._nextTr !== null) {
      if (__DEV__) debug(logger, Events.rtrRunCancelled, tr);
      return this._run(this._nextTr);
    }

    tr._run(() => {
      const vit = tr.finalInstructions;
      if (__DEV__) trace(logger, Events.rtrRunVitCompile, vit);

      /**
       * Updating route tree:
       * Returns a stateful `RouteTree` based on the provided context and transition.
       *
       * This process will always start from the root context and build a new complete tree, up until (and including)
       * the context that was passed-in.
       *
       * If there are any additional child navigations to be resolved lazily, those will be added to the leaf
       * `RouteNode`s `residue` property which is then resolved by the router after the leaf node is loaded.
       *
       * This means that a `RouteTree` can (and often will) be built incrementally during the loading process.
       */
      // The root of the routing tree is always the CompositionRoot of the Aurelia app.
      // From a routing perspective it's simply a "marker": it does not need to be loaded,
      // nor put in a viewport, have its hooks invoked, or any of that. The router does not touch it,
      // other than by reading (deps, optional route config, owned viewports) from it.
      const rootCtx = this._ctx;
      const rt = tr.routeTree;

      (rt as Writable<RouteTree>).options = vit.options;
      (rt as Writable<RouteTree>).queryParams = (rootCtx.node._tree as Writable<RouteTree>).queryParams = vit.queryParams;
      (rt as Writable<RouteTree>).fragment = (rootCtx.node._tree as Writable<RouteTree>).fragment = vit.fragment;

      const log = /*@__PURE__*/ navigationContext.container.get(ILogger).scopeTo('RouteTree');
      if (vit.isAbsolute) {
        navigationContext = rootCtx;
      }
      if (navigationContext === rootCtx) {
        rt.root._setTree(rt);
        rootCtx.node = rt.root;
      }

      const suffix = navigationContext.allResolved instanceof Promise ? ' - awaiting promise' : '';
      log.trace(`updateRouteTree(rootCtx:%s,rt:%s,vit:%s)${suffix}`, rootCtx, rt, vit);
      // Wait till the promises to resolve the child routes are resolved.
      // Note that a route configuration can be a promise.
      return onResolve(navigationContext.allResolved, () => updateNode(log, vit, navigationContext, rootCtx.node));
    }, () => {
      const prev = tr.previousRouteTree.root.children;
      const next = tr.routeTree.root.children;
      const all = mergeDistinct(prev, next);

      Batch._start(b => {
        if (__DEV__) trace(logger, Events.rtrRunCanUnload, prev.length);
        for (const node of prev) {
          node.context.vpa._canUnload(tr, b);
        }
      })._continueWith(b => {
        if (tr.guardsResult !== true) {
          b._push(); // prevent the next step in the batch from running
          this._cancelNavigation(tr);
        }
      })._continueWith(b => {
        if (__DEV__) trace(logger, Events.rtrRunCanLoad, next.length);
        for (const node of next) {
          node.context.vpa._canLoad(tr, b);
        }
      })._continueWith(b => {
        if (tr.guardsResult !== true) {
          b._push();
          this._cancelNavigation(tr);
        }
      })._continueWith(b => {
        if (__DEV__) trace(logger, Events.rtrRunUnloading, prev.length);
        for (const node of prev) {
          node.context.vpa._unloading(tr, b);
        }
      })._continueWith(b => {
        if (__DEV__) trace(logger, Events.rtrRunLoading, next.length);
        for (const node of next) {
          node.context.vpa._loading(tr, b);
        }
      })._continueWith(b => {
        if (__DEV__) trace(logger, Events.rtrRunSwapping, all.length);
        for (const node of all) {
          node.context.vpa._swap(tr, b);
        }
      })._continueWith(() => {
        if (__DEV__) trace(logger, Events.rtrRunFinalizing);
        // order doesn't matter for this operation
        all.forEach(function (node) {
          node.context.vpa._endTransition();
        });
        this._navigated = true;

        this._instructions = tr.finalInstructions = tr.routeTree._finalizeInstructions();
        this._isNavigating = false;

        // apply history state
        const newUrl = tr.finalInstructions.toUrl(true, this.options._urlParser);
        switch (tr.options._getHistoryStrategy(this._instructions)) {
          case 'none':
            // do nothing
            break;
          case 'push':
            this._locationMgr.pushState(toManagedState(tr.options.state, tr.id), this.updateTitle(tr), newUrl);
            break;
          case 'replace':
            this._locationMgr.replaceState(toManagedState(tr.options.state, tr.id), this.updateTitle(tr), newUrl);
            break;
        }

        this._events.publish(new NavigationEndEvent(tr.id, tr.instructions, this._instructions));

        tr.resolve!(true);

        this._runNextTransition();
      })._start();
    });
  }

  public updateTitle(tr: Transition = this.currentTr): string {
    const title = this._getTitle(tr);
    if (title.length > 0) {
      this._p.document.title = title;
    }
    return this._p.document.title;
  }

  /** @internal */
  public _getTitle(tr: Transition = this.currentTr) {
    let title: string;
    if (this._hasTitleBuilder) {
      title = this.options.buildTitle!(tr) ?? '';
    } else {
      switch (typeof tr.options.title) {
        case 'function':
          title = tr.options.title.call(void 0, tr.routeTree.root) ?? '';
          break;
        case 'string':
          title = tr.options.title;
          break;
        default:
          title = tr.routeTree.root.getTitle(tr.options.titleSeparator) ?? '';
          break;
      }
    }
    return title;
  }

  /** @internal */
  private _cancelNavigation(tr: Transition): void {
    const logger = /*@__PURE__*/ this._logger.scopeTo('cancelNavigation()');
    if(__DEV__) trace(logger, Events.rtrCancelNavigationStart, tr);

    const prev = tr.previousRouteTree.root.children;
    const next = tr.routeTree.root.children;
    const all = mergeDistinct(prev, next);
    // order doesn't matter for this operation
    all.forEach(function (node) {
      node.context.vpa._cancelUpdate();
    });

    this._instructions = tr.prevInstructions;
    this._routeTree = tr.previousRouteTree;
    this._isNavigating = false;
    const guardsResult = tr.guardsResult;
    this._events.publish(new NavigationCancelEvent(tr.id, tr.instructions, `guardsResult is ${guardsResult}`));

    if (guardsResult === false) {
      tr.resolve!(false);

      // In case a new navigation was requested in the meantime, immediately start processing it
      this._runNextTransition();
    } else {

      let instructions: ViewportInstructionTree;
      if (this._navigated && (tr.erredWithUnknownRoute || (tr.error != null && this.options.restorePreviousRouteTreeOnError))) instructions = tr.prevInstructions;
      else if (guardsResult === true) return;
      else instructions = guardsResult;

      void onResolve(this._enqueue(instructions, 'api', tr.managedState, tr), () => {
        if(__DEV__) trace(this._logger, Events.rtrCancelNavigationCompleted, tr);
      });
    }
  }

  /** @internal */
  private _runNextTransition(): void {
    if (this._nextTr === null) return;
    if(__DEV__) trace(this._logger, Events.rtrNextTr, this._nextTr);
    this._p.taskQueue.queueTask(
      () => {
        // nextTransition is allowed to change up until the point when it's actually time to process it,
        // so we need to check it for null again when the scheduled task runs.
        const nextTr = this._nextTr;
        if (nextTr === null) return;
        try {
          this._run(nextTr);
        } catch (err) {
          nextTr._handleError(err);
        }
      },
    );
  }
}

function updateNode(
  log: ILogger,
  vit: ViewportInstructionTree,
  ctx: IRouteContext,
  node: RouteNode,
): Promise<void> | void {
  log.trace(`updateNode(ctx:%s,node:%s)`, ctx, node);

  (node as Writable<RouteNode>).queryParams = vit.queryParams;
  (node as Writable<RouteNode>).fragment = vit.fragment;

  if (!node.context.isRoot) {
    node.context.vpa._scheduleUpdate(node._tree.options, node);
  }
  if (node.context === ctx) {
    // Do an in-place update (remove children and re-add them by compiling the instructions into nodes)
    node._clearChildren();
    // - first append the nodes as children, compiling the viewport instructions.
    // - if afterward, any viewports are still available
    //   - look at the default value of those viewports
    //   - create instructions, and
    //   - add the compiled nodes from those to children of the node.
    return onResolve(
      onResolveAll(...vit.children.map(vi => createAndAppendNodes(log, node, vi))),
      () => onResolveAll(...ctx.getAvailableViewportAgents().reduce((acc, vpa) => {
        const vp = vpa.viewport;
        const component = vp.default;
        if (component === null) return acc;
        acc.push(createAndAppendNodes(log, node, ViewportInstruction.create({ component, viewport: vp.name, })));
        return acc;
      }, [] as (void | Promise<void>)[]))
    );
  }

  // Drill down until we're at the node whose context matches the provided navigation context
  return onResolveAll(...node.children.map(child => {
    return updateNode(log, vit, ctx, child);
  }));
}
