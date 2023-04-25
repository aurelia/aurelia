import { isObject } from '@aurelia/metadata';
import { IContainer, ILogger, DI, IDisposable, onResolve, Writable, onResolveAll, Registration, IResolver } from '@aurelia/kernel';
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

  public static create(input: Omit<Transition, 'run' | 'handleError' | 'erredWithUnknownRoute'>): Transition {
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

  public run<T>(cb: () => T, next: (value: UnwrapPromise<T>) => void): void {
    if (this.guardsResult !== true) {
      return;
    }
    try {
      const ret = cb();
      if (ret instanceof Promise) {
        ret.then(next).catch(err => {
          this.handleError(err);
        });
      } else {
        next(ret as UnwrapPromise<T>);
      }
    } catch (err) {
      this.handleError(err);
    }
  }

  public handleError(err: unknown): void {
    this._erredWithUnknownRoute = err instanceof UnknownRouteError;
    this.reject!(this.error = err);
  }

  public toString(): string {
    return `T(id:${this.id},trigger:'${this.trigger}',instructions:${this.instructions},options:${this.options})`;
  }
}

type RouteConfigLookup = WeakMap<RouteConfig, IRouteContext>;
type ViewportAgentLookup = Map<ViewportAgent | null, RouteConfigLookup>;

export interface IRouter extends Router { }
export const IRouter = /*@__PURE__*/DI.createInterface<IRouter>('IRouter', x => x.singleton(Router));
export class Router {
  private _ctx: RouteContext | null = null;
  private get ctx(): RouteContext {
    let ctx = this._ctx;
    if (ctx === null) {
      if (!this.container.has(IRouteContext, true)) {
        throw new Error(`Root RouteContext is not set. Did you forget to register RouteConfiguration, or try to navigate before calling Aurelia.start()?`);
      }
      ctx = this._ctx = this.container.get(IRouteContext);
    }
    return ctx;
  }

  private _routeTree: RouteTree | null = null;
  public get routeTree(): RouteTree {
    let routeTree = this._routeTree;
    if (routeTree === null) {
      // Lazy instantiation for only the very first (synthetic) tree.
      // Doing it here instead of in the constructor to delay it until we have the context.
      const ctx = this.ctx;
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

  private _currentTr: Transition | null = null;
  public get currentTr(): Transition {
    let currentTr = this._currentTr;
    if (currentTr === null) {
      currentTr = this._currentTr = Transition.create({
        id: 0,
        prevInstructions: this.instructions,
        instructions: this.instructions,
        finalInstructions: this.instructions,
        instructionsChanged: true,
        trigger: 'api',
        options: NavigationOptions.create(this.options, {}),
        managedState: null,
        previousRouteTree: this.routeTree.clone(),
        routeTree: this.routeTree,
        resolve: null,
        reject: null,
        promise: null,
        guardsResult: true,
        error: void 0,
      });
    }
    return currentTr;
  }
  private set currentTr(value: Transition) {
    this._currentTr = value;
  }

  private navigated: boolean = false;
  private navigationId: number = 0;

  private instructions: ViewportInstructionTree;

  private nextTr: Transition | null = null;
  private locationChangeSubscription: IDisposable | null = null;

  /** @internal */
  public readonly _hasTitleBuilder: boolean = false;

  private _isNavigating: boolean = false;
  public get isNavigating(): boolean {
    return this._isNavigating;
  }

  public constructor(
    @IContainer private readonly container: IContainer,
    @IPlatform private readonly p: IPlatform,
    @ILogger private readonly logger: ILogger,
    @IRouterEvents private readonly events: IRouterEvents,
    @ILocationManager private readonly locationMgr: ILocationManager,
    @IRouterOptions public readonly options: Readonly<RouterOptions>,
  ) {
    this.logger = logger.root.scopeTo('Router');
    this.instructions = ViewportInstructionTree.create('', options);
    container.registerResolver(Router, Registration.instance(Router, this) as unknown as IResolver<Router>);
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
   */
  public resolveContext(context: RouteContextLike | null): IRouteContext {
    return RouteContext.resolve(this.ctx, context);
  }

  public start(performInitialNavigation: boolean): void | Promise<boolean> {
    (this as Writable<Router>)._hasTitleBuilder = typeof this.options.buildTitle === 'function';

    this.locationMgr.startListening();
    this.locationChangeSubscription = this.events.subscribe('au:router:location-change', e => {
      // At the time of writing, chromium throttles popstate events at a maximum of ~100 per second.
      // While macroTasks run up to 250 times per second, it is extremely unlikely that more than ~100 per second of these will run due to the double queueing.
      // However, this throttle limit could theoretically be hit by e.g. integration tests that don't mock Location/History.
      // If the throttle limit is hit, then add a throttle config.
      this.p.taskQueue.queueTask(() => {
        // Don't try to restore state that might not have anything to do with the Aurelia app
        const state = isManagedState(e.state) ? e.state : null;
        const routerOptions = this.options;
        const options = NavigationOptions.create(routerOptions, { historyStrategy: 'replace' });
        const instructions = ViewportInstructionTree.create(e.url, routerOptions, options, this.ctx);
        // The promise will be stored in the transition. However, unlike `load()`, `start()` does not return this promise in any way.
        // The router merely guarantees that it will be awaited (or canceled) before the next transition, so a race condition is impossible either way.
        // However, it is possible to get floating promises lingering during non-awaited unit tests, which could have unpredictable side-effects.
        // So we do want to solve this at some point.
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.enqueue(instructions, e.trigger, state, null);
      });
    });

    if (!this.navigated && performInitialNavigation) {
      return this.load(this.locationMgr.getPath(), { historyStrategy: 'replace' });
    }
  }

  public stop(): void {
    this.locationMgr.stopListening();
    this.locationChangeSubscription?.dispose();
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

    this.logger.trace('load(instructions:%s)', instructions);

    return this.enqueue(instructions, 'api', null, null);
  }

  public isActive(instructionOrInstructions: NavigationInstruction | readonly NavigationInstruction[], context: RouteContextLike): boolean {
    const ctx = this.resolveContext(context);
    const instructions = instructionOrInstructions instanceof ViewportInstructionTree
      ? instructionOrInstructions
      : this.createViewportInstructions(instructionOrInstructions, { context: ctx, historyStrategy: this.options.historyStrategy });

    this.logger.trace('isActive(instructions:%s,ctx:%s)', instructions, ctx);

    return this.routeTree.contains(instructions, { matchEndpoint: false });
  }

  private readonly vpaLookup: ViewportAgentLookup = new Map();
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
    const logger = container.get(ILogger).scopeTo('RouteContext');

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
        let routeConfigLookup = this.vpaLookup.get(viewportAgent);
        if (routeConfigLookup === void 0) {
          this.vpaLookup.set(viewportAgent, routeConfigLookup = new WeakMap());
        }

        let routeContext = routeConfigLookup.get(rdConfig);
        if (routeContext !== void 0) {
          logger.trace(`returning existing RouteContext for %s`, rdConfig);
          return routeContext;
        }
        logger.trace(`creating new RouteContext for %s`, rdConfig);

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
      instructionOrInstructions = this.locationMgr.removeBaseHref(instructionOrInstructions);
    }

    const isVpInstr = isPartialViewportInstruction(instructionOrInstructions);
    let $instruction = isVpInstr ? (instructionOrInstructions as IViewportInstruction).component : instructionOrInstructions;
    if (typeof $instruction === 'string' && $instruction.startsWith('../') && context !== null) {
      context = this.resolveContext(context);
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
      this.ctx
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
   */
  private enqueue(
    instructions: ViewportInstructionTree,
    trigger: RoutingTrigger,
    state: ManagedState | null,
    failedTr: Transition | null,
  ): boolean | Promise<boolean> {
    const lastTr = this.currentTr;
    const logger = this.logger;

    if (trigger !== 'api' && lastTr.trigger === 'api' && lastTr.instructions.equals(instructions)) {
      // User-triggered navigation that results in `replaceState` with the same URL. The API call already triggered the navigation; event is ignored.
      logger.debug(`Ignoring navigation triggered by '%s' because it is the same URL as the previous navigation which was triggered by 'api'.`, trigger);
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
      logger.debug(`Reusing promise/resolve/reject from the previously failed transition %s`, failedTr);
      promise = failedTr.promise!;
      resolve = failedTr.resolve!;
      reject = failedTr.reject!;
    }

    // This is an intentional overwrite: if a new transition is scheduled while the currently scheduled transition hasn't even started yet,
    // then the currently scheduled transition is effectively canceled/ignored.
    // This is consistent with the runtime's controller behavior, where if you rapidly call async activate -> deactivate -> activate (for example), then the deactivate is canceled.
    const nextTr = this.nextTr = Transition.create({
      id: ++this.navigationId,
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
      routeTree: this._routeTree = this.routeTree.clone(),
      guardsResult: true,
      error: void 0,
    });

    logger.debug(`Scheduling transition: %s`, nextTr);

    if (!this._isNavigating) {
      // Catch any errors that might be thrown by `run` and reject the original promise which is awaited down below
      try {
        this.run(nextTr);
      } catch (err) {
        nextTr.handleError(err);
      }
    }

    return nextTr.promise!.then(ret => {
      logger.debug(`Transition succeeded: %s`, nextTr);
      return ret;
    }).catch(err => {
      logger.error(`Transition %s failed: %s`, nextTr, err);
      if (nextTr.erredWithUnknownRoute) {
        this.cancelNavigation(nextTr);
      } else {
        this._isNavigating = false;
        this.events.publish(new NavigationErrorEvent(nextTr.id, nextTr.instructions, err));
        if (restorePrevRT) {
          this.cancelNavigation(nextTr);
        } else {
          const $nextTr = this.nextTr;
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

  private run(tr: Transition): void {
    this.currentTr = tr;
    this.nextTr = null;

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
    let navigationContext = this.resolveContext(tr.options.context);

    this.logger.trace(`run(tr:%s) - processing route`, tr);

    this.events.publish(new NavigationStartEvent(tr.id, tr.instructions, tr.trigger, tr.managedState));

    // If user triggered a new transition in response to the NavigationStartEvent
    // (in which case `this.nextTransition` will NOT be null), we short-circuit here and go straight to processing the next one.
    if (this.nextTr !== null) {
      this.logger.debug(`run(tr:%s) - aborting because a new transition was queued in response to the NavigationStartEvent`, tr);
      return this.run(this.nextTr);
    }

    tr.run(() => {
      const vit = tr.finalInstructions;
      this.logger.trace(`run() - compiling route tree: %s`, vit);

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
      const rootCtx = this.ctx;
      const rt = tr.routeTree;

      (rt as Writable<RouteTree>).options = vit.options;
      (rt as Writable<RouteTree>).queryParams = (rootCtx.node.tree as Writable<RouteTree>).queryParams = vit.queryParams;
      (rt as Writable<RouteTree>).fragment = (rootCtx.node.tree as Writable<RouteTree>).fragment = vit.fragment;

      const log = navigationContext.container.get(ILogger).scopeTo('RouteTree');
      if (vit.isAbsolute) {
        navigationContext = rootCtx;
      }
      if (navigationContext === rootCtx) {
        rt.root.setTree(rt);
        rootCtx.node = rt.root;
      }

      const suffix = navigationContext.resolved instanceof Promise ? ' - awaiting promise' : '';
      log.trace(`updateRouteTree(rootCtx:%s,rt:%s,vit:%s)${suffix}`, rootCtx, rt, vit);
      // Wait till the promises to resolve the child routes are resolved.
      // Note that a route configuration can be a promise.
      return onResolve(navigationContext.resolved, () => updateNode(log, vit, navigationContext, rootCtx.node));
    }, () => {
      const prev = tr.previousRouteTree.root.children;
      const next = tr.routeTree.root.children;
      const all = mergeDistinct(prev, next);

      Batch.start(b => {
        this.logger.trace(`run() - invoking canUnload on ${prev.length} nodes`);
        for (const node of prev) {
          node.context.vpa._canUnload(tr, b);
        }
      }).continueWith(b => {
        if (tr.guardsResult !== true) {
          b.push(); // prevent the next step in the batch from running
          this.cancelNavigation(tr);
        }
      }).continueWith(b => {
        this.logger.trace(`run() - invoking canLoad on ${next.length} nodes`);
        for (const node of next) {
          node.context.vpa._canLoad(tr, b);
        }
      }).continueWith(b => {
        if (tr.guardsResult !== true) {
          b.push();
          this.cancelNavigation(tr);
        }
      }).continueWith(b => {
        this.logger.trace(`run() - invoking unloading on ${prev.length} nodes`);
        for (const node of prev) {
          node.context.vpa._unloading(tr, b);
        }
      }).continueWith(b => {
        this.logger.trace(`run() - invoking loading on ${next.length} nodes`);
        for (const node of next) {
          node.context.vpa._loading(tr, b);
        }
      }).continueWith(b => {
        this.logger.trace(`run() - invoking swap on ${all.length} nodes`);
        for (const node of all) {
          node.context.vpa._swap(tr, b);
        }
      }).continueWith(() => {
        this.logger.trace(`run() - finalizing transition`);
        // order doesn't matter for this operation
        all.forEach(function (node) {
          node.context.vpa._endTransition();
        });
        this.navigated = true;

        this.instructions = tr.finalInstructions = tr.routeTree.finalizeInstructions();
        this._isNavigating = false;

        // apply history state
        const newUrl = tr.finalInstructions.toUrl(this.options.useUrlFragmentHash);
        switch (tr.options._getHistoryStrategy(this.instructions)) {
          case 'none':
            // do nothing
            break;
          case 'push':
            this.locationMgr.pushState(toManagedState(tr.options.state, tr.id), this.updateTitle(tr), newUrl);
            break;
          case 'replace':
            this.locationMgr.replaceState(toManagedState(tr.options.state, tr.id), this.updateTitle(tr), newUrl);
            break;
        }

        this.events.publish(new NavigationEndEvent(tr.id, tr.instructions, this.instructions));

        tr.resolve!(true);

        this.runNextTransition();
      }).start();
    });
  }

  public updateTitle(tr: Transition = this.currentTr): string {
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
    if (title.length > 0) {
      this.p.document.title = title;
    }
    return this.p.document.title;
  }

  private cancelNavigation(tr: Transition): void {
    this.logger.trace(`cancelNavigation(tr:%s)`, tr);

    const prev = tr.previousRouteTree.root.children;
    const next = tr.routeTree.root.children;
    const all = mergeDistinct(prev, next);
    // order doesn't matter for this operation
    all.forEach(function (node) {
      node.context.vpa._cancelUpdate();
    });

    this.instructions = tr.prevInstructions;
    this._routeTree = tr.previousRouteTree;
    this._isNavigating = false;
    const guardsResult = tr.guardsResult;
    this.events.publish(new NavigationCancelEvent(tr.id, tr.instructions, `guardsResult is ${guardsResult}`));

    if (guardsResult === false) {
      tr.resolve!(false);

      // In case a new navigation was requested in the meantime, immediately start processing it
      this.runNextTransition();
    } else {

      let instructions: ViewportInstructionTree;
      if (this.navigated && (tr.erredWithUnknownRoute || (tr.error != null && this.options.restorePreviousRouteTreeOnError))) instructions = tr.prevInstructions;
      else if (guardsResult === true) return;
      else instructions = guardsResult;

      void onResolve(this.enqueue(instructions, 'api', tr.managedState, tr), () => {
        this.logger.trace(`cancelNavigation(tr:%s) - finished redirect`, tr);
      });
    }
  }

  private runNextTransition(): void {
    if (this.nextTr === null) return;
    this.logger.trace(`scheduling nextTransition: %s`, this.nextTr);
    this.p.taskQueue.queueTask(
      () => {
        // nextTransition is allowed to change up until the point when it's actually time to process it,
        // so we need to check it for null again when the scheduled task runs.
        const nextTr = this.nextTr;
        if (nextTr === null) return;
        try {
          this.run(nextTr);
        } catch (err) {
          nextTr.handleError(err);
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

  node.queryParams = vit.queryParams;
  node.fragment = vit.fragment;

  if (!node.context.isRoot) {
    node.context.vpa._scheduleUpdate(node.tree.options, node);
  }
  if (node.context === ctx) {
    // Do an in-place update (remove children and re-add them by compiling the instructions into nodes)
    node.clearChildren();
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
