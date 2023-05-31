import {
  Constructable,
  DI,
  type IContainer,
  ILogger,
  IModule,
  IModuleLoader,
  InstanceProvider,
  noop,
  onResolve,
  Protocol,
  Registration,
  ResourceDefinition,
  emptyObject,
  emptyArray,
} from '@aurelia/kernel';
import { type Endpoint, RecognizedRoute, RESIDUE, RouteRecognizer } from '@aurelia/route-recognizer';
import {
  Controller,
  CustomElement,
  type CustomElementDefinition,
  IAppRoot,
  IController,
  ICustomElementController,
  IPlatform,
  isCustomElementController,
  isCustomElementViewModel,
  PartialCustomElementDefinition,
} from '@aurelia/runtime-html';

import { ComponentAgent, IRouteViewModel } from './component-agent';
import {
  IExtendedViewportInstruction,
  ITypedNavigationInstruction_Component,
  ITypedNavigationInstruction_string,
  IViewportInstruction,
  NavigationInstruction,
  NavigationInstructionType,
  Params,
  ViewportInstruction,
  ViewportInstructionTree,
} from './instructions';
import {
  NavigationOptions,
  IChildRouteConfig,
  Routeable,
} from './options';
import { IViewport } from './resources/viewport';
import { noRoutes, resolveCustomElementDefinition, resolveRouteConfiguration, RouteConfig, RouteType } from './route';
import type { RouteNode } from './route-tree';
import {
  emptyQuery,
  IRouter,
} from './router';
import { IRouterEvents } from './router-events';
import { ensureArrayOfStrings } from './util';
import { isPartialChildRouteConfig } from './validation';
import { ViewportAgent, type ViewportRequest } from './viewport-agent';
import { Events, debug, error, getMessage, logAndThrow, trace } from './events';

export interface IRouteContext extends RouteContext { }
export const IRouteContext = /*@__PURE__*/DI.createInterface<IRouteContext>('IRouteContext');

type PathGenerationResult = { vi: ViewportInstruction; query: Params };

export type EagerInstruction = {
  component: string | RouteConfig | PartialCustomElementDefinition | IRouteViewModel | IChildRouteConfig | RouteType;
  params: Params;
};

const allowedEagerComponentTypes = Object.freeze(['string', 'object', 'function']);
export function isEagerInstruction(val: NavigationInstruction | EagerInstruction): val is EagerInstruction {
  // don't try to resolve an instruction with children eagerly, as the children are essentially resolved lazily, for now.
  if (val == null) return false;
  const params = (val as EagerInstruction).params;
  const component = (val as EagerInstruction).component;
  return typeof params === 'object'
    && params !== null
    && component != null
    && allowedEagerComponentTypes.includes(typeof component)
    && !(component instanceof Promise) // a promise component is inherently meant to be lazy-loaded
    ;
}

/**
 * Holds the information of a component in the context of a specific container.
 *
 * The `RouteContext` is cached using a 3-part composite key consisting of the CustomElementDefinition, the RouteConfig and the RenderContext.
 *
 * This means there can be more than one `RouteContext` per component type if either:
 * - The `RouteConfig` for a type is overridden manually via `Route.configure`
 * - Different components (with different `RenderContext`s) reference the same component via a child route config
 */
export class RouteContext {
  private readonly childViewportAgents: ViewportAgent[] = [];
  public readonly root: IRouteContext;
  public get isRoot(): boolean {
    return this.parent === null;
  }

  /**
   * The path from the root RouteContext up to this one.
   */
  public readonly path: readonly IRouteContext[];
  public get depth(): number {
    return this.path.length - 1;
  }
  /**
   * The stringified path from the root RouteContext up to this one, consisting of the component names they're associated with, separated by slashes.
   *
   * Mainly for debugging/introspection purposes.
   */
  public readonly friendlyPath: string;

  /**
   * The (fully resolved) configured child routes of this context's `RouteConfig`
   */
  public readonly childRoutes: (RouteConfig | Promise<RouteConfig>)[] = [];

  /** @internal */
  private _resolved: Promise<void> | null = null;
  public get resolved(): Promise<void> | null {
    return this._resolved;
  }

  /** @internal */
  private _allResolved: Promise<void> | null = null;
  public get allResolved(): Promise<void> | null {
    return this._allResolved;
  }

  private prevNode: RouteNode | null = null;
  /** @internal */
  private _node: RouteNode | null = null;
  public get node(): RouteNode {
    const node = this._node;
    if (node === null) throw new Error(getMessage(Events.rcNoNode, this));
    return node;
  }
  public set node(value: RouteNode) {
    const prev = this.prevNode = this._node;
    if (prev !== value) {
      this._node = value;
      if (__DEV__) trace(this._logger, Events.rcNodeChanged, this.prevNode, value);
    }
  }

  /** @internal */
  private readonly _vpa: ViewportAgent | null;
  /**
   * The viewport hosting the component associated with this RouteContext.
   * The root RouteContext has no ViewportAgent and will throw when attempting to access this property.
   */
  public get vpa(): ViewportAgent {
    const vpa = this._vpa;
    if (vpa === null) throw new Error(getMessage(Events.rcNoVpa, this));
    return vpa;
  }
  public readonly container: IContainer;

  /** @internal */ private readonly _moduleLoader: IModuleLoader;
  /** @internal */ private readonly _logger: ILogger;
  /** @internal */ private readonly _hostControllerProvider: InstanceProvider<ICustomElementController>;
  /** @internal */ public readonly _recognizer: RouteRecognizer<RouteConfig | Promise<RouteConfig>>;
  /** @internal */ private _childRoutesConfigured: boolean = false;

  private readonly _navigationModel: NavigationModel | null;
  public get navigationModel(): INavigationModel | null {
    return this._navigationModel;
  }

  public constructor(
    viewportAgent: ViewportAgent | null,
    public readonly parent: IRouteContext | null,
    public readonly component: CustomElementDefinition,
    public readonly config: RouteConfig,
    parentContainer: IContainer,
    private readonly _router: IRouter,
  ) {
    this._vpa = viewportAgent;
    if (parent === null) {
      this.root = this;
      this.path = [this];
      this.friendlyPath = component.name;
    } else {
      this.root = parent.root;
      this.path = [...parent.path, this];
      this.friendlyPath = `${parent.friendlyPath}/${component.name}`;
    }
    this._logger = parentContainer.get(ILogger).scopeTo(`RouteContext<${this.friendlyPath}>`);
    if (__DEV__) trace(this._logger, Events.rcCreated);

    this._moduleLoader = parentContainer.get(IModuleLoader);

    const container = this.container = parentContainer.createChild();

    container.registerResolver(
      IController,
      this._hostControllerProvider = new InstanceProvider(),
      true,
    );

    const ctxProvider = new InstanceProvider<IRouteContext>('IRouteContext', this);
    container.registerResolver(IRouteContext, ctxProvider);
    container.registerResolver(RouteContext, ctxProvider);

    container.register(config);

    this._recognizer = new RouteRecognizer();

    if (_router.options.useNavigationModel) {
      const navModel = this._navigationModel = new NavigationModel([]);
      // Note that routing-contexts have the same lifetime as the app itself; therefore, an attempt to dispose the subscription is kind of useless.
      // Also considering that in a realistic app the number of configured routes are limited in number, this subscription and keeping the routes' active property in sync should not create much issue.
      // If need be we can optimize it later.
      container
        .get(IRouterEvents)
        .subscribe('au:router:navigation-end', () => navModel.setIsActive(_router, this));
    } else {
      this._navigationModel = null;
    }
    this._processConfig(config);
  }

  private _processConfig(config: RouteConfig): void {
    const promises: Promise<void>[] = [];
    const allPromises: Promise<void>[] = [];
    const childrenRoutes = config.routes ?? noRoutes;
    const len = childrenRoutes.length;
    if (len === 0) {
      const getRouteConfig = ((config.component as RouteType).prototype as IRouteViewModel)?.getRouteConfig;
      this._childRoutesConfigured = getRouteConfig == null ? true : typeof getRouteConfig !== 'function';
      return;
    }
    const navModel = this._navigationModel;
    const hasNavModel = navModel !== null;
    let i = 0;
    for (; i < len; i++) {
      const childRoute = childrenRoutes[i];
      if (childRoute instanceof Promise) {
        const p = this.addRoute(childRoute);
        promises.push(p);
        allPromises.push(p);
      } else {
        const rdResolution = resolveRouteConfiguration(childRoute, true, config, null, this);
        if (rdResolution instanceof Promise) {
          if (!isPartialChildRouteConfig(childRoute) || childRoute.path == null) throw new Error(getMessage(Events.rcNoPathLazyImport));
          for (const path of ensureArrayOfStrings(childRoute.path)) {
            this.$addRoute(path, childRoute.caseSensitive ?? false, rdResolution);
          }
          const idx = this.childRoutes.length;
          const p = rdResolution.then((rdConfig) => {
            return this.childRoutes[idx] = rdConfig;
          });
          this.childRoutes.push(p);
          if (hasNavModel) {
            navModel.addRoute(p);
          }
          allPromises.push(p.then(noop));
        } else {
          for (const path of rdResolution.path ?? emptyArray) {
            this.$addRoute(path, rdResolution.caseSensitive, rdResolution);
          }
          this.childRoutes.push(rdResolution);
          if (hasNavModel) {
            navModel.addRoute(rdResolution);
          }
        }
      }
    }
    this._childRoutesConfigured = true;

    if (promises.length > 0) {
      this._resolved = Promise.all(promises).then(() => {
        this._resolved = null;
      });
    }
    if (allPromises.length > 0) {
      this._allResolved = Promise.all(allPromises).then(() => {
        this._allResolved = null;
      });
    }
  }

  /**
   * Create a new `RouteContext` and register it in the provided container.
   *
   * Uses the `RenderContext` of the registered `IAppRoot` as the root context.
   *
   * @param container - The container from which to resolve the `IAppRoot` and in which to register the `RouteContext`
   */
  public static setRoot(container: IContainer): void | Promise<void> {
    const logger = container.get(ILogger).scopeTo('RouteContext');

    if (!container.has(IAppRoot, true)) {
      logAndThrow(new Error(getMessage(Events.rcNoAppRoot)), logger);
    }

    if (container.has(IRouteContext, true)) {
      logAndThrow(new Error(getMessage(Events.rcHasRootContext)), logger);
    }

    const { controller } = container.get(IAppRoot);
    if (controller === void 0) {
      logAndThrow(new Error(getMessage(Events.rcNoRootCtrl)), logger);
    }

    const router = container.get(IRouter);
    return onResolve(
      router.getRouteContext(
        null,
        controller.definition,
        controller.viewModel,
        controller.container,
        null,
        null,
        null,
      ),
      routeContext => {
        container.register(Registration.instance(IRouteContext, routeContext));
        routeContext.node = router.routeTree.root;
      }
    );
  }

  public static resolve(root: IRouteContext, context: unknown): IRouteContext {
    const rootContainer = root.container;
    const logger = rootContainer.get(ILogger).scopeTo('RouteContext');

    if (context == null) {
      if (__DEV__) trace(logger, Events.rcResolveNullishContext, context);
      return root;
    }

    if (isRouteContext(context)) {
      if (__DEV__) trace(logger, Events.rcResolveInstance, context);
      return context;
    }

    if (context instanceof rootContainer.get(IPlatform).Node) {
      if (__DEV__) trace(logger, Events.rcResolveNode, context.nodeName);
      try {
        // CustomElement.for can theoretically throw in (as of yet) unknown situations.
        // If that happens, we want to know about the situation and *not* just fall back to the root context, as that might make
        // some already convoluted issues impossible to troubleshoot.
        // That's why we catch, log and re-throw instead of just letting the error bubble up.
        // This also gives us a set point in the future to potentially handle supported scenarios where this could occur.
        const controller = CustomElement.for(context, { searchParents: true });
        return controller.container.get(IRouteContext);
      } catch (err) {
        error(logger, Events.rcResolveNodeFailed, context.nodeName, err);
        throw err;
      }
    }

    if (isCustomElementViewModel(context)) {
      const controller = context.$controller!;
      if (__DEV__) trace(logger, Events.rcResolveCe, controller.definition.name);
      return controller.container.get(IRouteContext);
    }

    if (isCustomElementController(context)) {
      const controller = context;
      if (__DEV__) trace(logger, Events.rcResolveCtrl, controller.definition.name);
      return controller.container.get(IRouteContext);
    }

    logAndThrow(new Error(getMessage(Events.rcResolveInvalidCtxType, Object.prototype.toString.call(context))), logger);
  }

  public dispose(): void {
    this.container.dispose();
  }

  public resolveViewportAgent(req: ViewportRequest): ViewportAgent {
    if (__DEV__) trace(this._logger, Events.rcResolveVpa, req);

    const agent = this.childViewportAgents.find(x => { return x._handles(req); });

    if (agent === void 0) throw new Error(getMessage(Events.rcNoAvailableVpa, req, this.printTree()));

    return agent;
  }

  public getAvailableViewportAgents(): readonly ViewportAgent[] {
    return this.childViewportAgents.filter(x => x._isAvailable());
  }

  public getFallbackViewportAgent(name: string): ViewportAgent | null {
    return this.childViewportAgents.find(x => x._isAvailable() && x.viewport.name === name && x.viewport.fallback !== '') ?? null;
  }

  /**
   * Create a component based on the provided viewportInstruction.
   *
   * @param hostController - The `ICustomElementController` whose component (typically `au-viewport`) will host this component.
   * @param routeNode - The routeNode that describes the component + state.
   */
  public createComponentAgent(hostController: ICustomElementController, routeNode: RouteNode): ComponentAgent | Promise<ComponentAgent> {
    if (__DEV__) trace(this._logger, Events.rcCreateCa, routeNode);

    this._hostControllerProvider.prepare(hostController);
    const container = this.container;
    const componentInstance = container.get<IRouteViewModel>(routeNode.component.key);
    // this is the point where we can load the delayed (non-static) child route configuration by calling the getRouteConfig
    const task: Promise<void> | void = this._childRoutesConfigured
      ? void 0
      : onResolve(
        resolveRouteConfiguration(componentInstance, false, this.config, routeNode, null),
        config => this._processConfig(config)
      );
    return onResolve(task, () => {
      const controller = Controller.$el(container, componentInstance, hostController.host, null);
      const componentAgent = new ComponentAgent(componentInstance, controller, routeNode, this, this._router.options);

      this._hostControllerProvider.dispose();

      return componentAgent;
    });
  }

  public registerViewport(viewport: IViewport): ViewportAgent {
    const agent = ViewportAgent.for(viewport, this);
    if (this.childViewportAgents.includes(agent)) {
      if (__DEV__) trace(this._logger, Events.rcRegisterVpSkip, agent);
      return agent;
    }

    if (__DEV__) trace(this._logger, Events.rcRegisterVp, agent);
    this.childViewportAgents.push(agent);
    return agent;
  }

  public unregisterViewport(viewport: IViewport): void {
    const agent = ViewportAgent.for(viewport, this);
    if (!this.childViewportAgents.includes(agent)) {
      if (__DEV__) trace(this._logger, Events.rcUnregisterVpSkip, agent);
      return;
    }
    if (__DEV__) trace(this._logger, Events.rcUnregisterVp, agent);
    this.childViewportAgents.splice(this.childViewportAgents.indexOf(agent), 1);
  }

  public recognize(path: string, searchAncestor: boolean = false): $RecognizedRoute | null {
    if (__DEV__) trace(this._logger, Events.rcRecognizePath, path);
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let _current: IRouteContext = this;
    let _continue = true;
    let result: RecognizedRoute<RouteConfig | Promise<RouteConfig>> | null = null;
    while (_continue) {
      result = _current._recognizer.recognize(path);
      if (result === null) {
        if (!searchAncestor || _current.isRoot) return null;
        _current = _current.parent!;
      } else {
        _continue = false;
      }
    }

    return new $RecognizedRoute(
      result!,
      Reflect.has(result!.params, RESIDUE)
        ? (result!.params[RESIDUE] ?? null)
        : null
    );
  }

  private addRoute(routeable: Promise<IModule>): Promise<void>;
  private addRoute(routeable: Exclude<Routeable, Promise<IModule>>): void | Promise<void>;
  private addRoute(routeable: Routeable): void | Promise<void> {
    if(__DEV__) trace(this._logger, Events.rcAddRoute, routeable);
    return onResolve(
      resolveRouteConfiguration(routeable, true, this.config, null, this),
      rdConfig => {
        for (const path of rdConfig.path ?? emptyArray) {
          this.$addRoute(path, rdConfig.caseSensitive, rdConfig);
        }
        this._navigationModel?.addRoute(rdConfig);
        this.childRoutes.push(rdConfig);
      });
  }

  private $addRoute(path: string, caseSensitive: boolean, handler: RouteConfig | Promise<RouteConfig>): void {
    this._recognizer.add({
      path,
      caseSensitive,
      handler,
    }, true);
  }

  public resolveLazy(promise: Promise<IModule>): Promise<CustomElementDefinition> | CustomElementDefinition {
    return this._moduleLoader.load(promise, m => {
      // when we have import('./some-path').then(x => x.somethingSpecific)
      const raw = m.raw;
      if (typeof raw === 'function') {
        const def = Protocol.resource.getAll(raw as Constructable).find(isCustomElementDefinition);
        if (def !== void 0) return def;
      }

      let defaultExport: CustomElementDefinition | undefined = void 0;
      let firstNonDefaultExport: CustomElementDefinition | undefined = void 0;
      for (const item of m.items) {
        if (item.isConstructable) {
          const def = item.definitions.find(isCustomElementDefinition);
          if (def !== void 0) {
            if (item.key === 'default') {
              defaultExport = def;
            } else if (firstNonDefaultExport === void 0) {
              firstNonDefaultExport = def;
            }
          }
        }
      }

      if (defaultExport === void 0 && firstNonDefaultExport === void 0) throw new Error(getMessage(Events.rcInvalidLazyImport, promise));

      return firstNonDefaultExport ?? defaultExport!;
    });
  }

  /** @internal */
  public generateViewportInstruction(instruction: { component: RouteConfig; params: Params }): PathGenerationResult;
  public generateViewportInstruction(instruction: { component: string; params: Params }): PathGenerationResult | null;
  public generateViewportInstruction(instruction: NavigationInstruction | EagerInstruction | IExtendedViewportInstruction): PathGenerationResult | null;
  public generateViewportInstruction(instruction: NavigationInstruction | EagerInstruction | IExtendedViewportInstruction): PathGenerationResult | null {
    if (!isEagerInstruction(instruction)) return null;
    const component = instruction.component;
    let paths: string[] | undefined;
    let throwError: boolean = false;
    if (component instanceof RouteConfig) {
      paths = component.path;
      throwError = true;
    } else if (typeof component === 'string') {
      const $rdConfig = (this.childRoutes as RouteConfig[]).find(x => x.id === component);
      if ($rdConfig === void 0) return null;
      paths = $rdConfig.path;
    } else if ((component as ITypedNavigationInstruction_string).type === NavigationInstructionType.string) {
      const $rdConfig = (this.childRoutes as RouteConfig[]).find(x => x.id === (component as ITypedNavigationInstruction_string).value);
      if ($rdConfig === void 0) return null;
      paths = $rdConfig.path;
    } else {
      // as the component is ensured not to be a promise in here, the resolution should also be synchronous
      const ced = (resolveCustomElementDefinition(component, this) as [ITypedNavigationInstruction_Component, CustomElementDefinition])[1];
      paths = this.childRoutes.reduce((acc, x) => {
        if ((x as RouteConfig).component === ced.Type) {
          acc.push(...(x as RouteConfig).path);
        }
        return acc;
      }, [] as string[]);
      throwError = true;
    }
    if (paths === void 0) return null;

    const params = instruction.params;
    const recognizer = this._recognizer;
    const numPaths = paths.length;
    const errors: string[] = [];
    let result: ReturnType<typeof core> = null;
    if (numPaths === 1) {
      const result = core(paths[0]);
      if (result === null) {
        if (throwError) throw new Error(getMessage(Events.rcEagerPathGenerationFailed, instruction, errors));
        if(__DEV__) debug(this._logger, Events.rcEagerPathGenerationFailed, instruction, errors);
        return null;
      }
      return {
        vi: ViewportInstruction.create({
          recognizedRoute: new $RecognizedRoute(new RecognizedRoute(result.endpoint, result.consumed), null),
          component: result.path,
          children: (instruction as IViewportInstruction).children,
          viewport: (instruction as IViewportInstruction).viewport,
          open: (instruction as IExtendedViewportInstruction).open,
          close: (instruction as IExtendedViewportInstruction).close,
        }),
        query: result.query,
      };
    }

    let maxScore = 0;
    for (let i = 0; i < numPaths; i++) {
      const res = core(paths[i]);
      if (res === null) continue;
      if (result === null) {
        result = res;
        maxScore = Object.keys(res.consumed).length;
      } else if (Object.keys(res.consumed).length > maxScore) { // ignore anything other than monotonically increasing consumption
        result = res;
      }
    }

    if (result === null) {
      if (throwError) throw new Error(getMessage(Events.rcEagerPathGenerationFailed, instruction, errors));
      if(__DEV__) debug(this._logger, Events.rcEagerPathGenerationFailed, instruction, errors);
      return null;
    }
    return {
      vi: ViewportInstruction.create({
        recognizedRoute: new $RecognizedRoute(new RecognizedRoute(result.endpoint, result.consumed), null),
        component: result.path,
        children: (instruction as IViewportInstruction).children,
        viewport: (instruction as IViewportInstruction).viewport,
        open: (instruction as IExtendedViewportInstruction).open,
        close: (instruction as IExtendedViewportInstruction).close,
      }),
      query: result.query,
    };

    type EagerResolutionResult = {
      path: string;
      endpoint: Endpoint<RouteConfig | Promise<RouteConfig>>;
      consumed: Params;
      query: Params;
    };

    function core(path: string): EagerResolutionResult | null {
      const endpoint = recognizer.getEndpoint(path);
      if (endpoint === null) {
        errors.push(`No endpoint found for the path: '${path}'.`);
        return null;
      }
      const consumed: Params = Object.create(null);
      for (const param of endpoint.params) {
        const key = param.name;
        let value = params[key];
        if (value == null || String(value).length === 0) {
          if (!param.isOptional) {
            errors.push(`No value for the required parameter '${key}' is provided for the path: '${path}'.`);
            return null;
          }
          value = '';
        } else {
          consumed[key] = value;
        }

        const pattern = param.isStar
          ? `*${key}`
          : param.isOptional
            ? `:${key}?`
            : `:${key}`;

        path = path.replace(pattern, value);
      }
      const consumedKeys = Object.keys(consumed);
      const query = Object.fromEntries(Object.entries(params).filter(([key]) => !consumedKeys.includes(key)));
      return { path: path.replace(/\/\//g, '/'), endpoint, consumed, query };
    }
  }

  public toString(): string {
    const vpAgents = this.childViewportAgents;
    const viewports = vpAgents.map(String).join(',');
    return `RC(path:'${this.friendlyPath}',viewports:[${viewports}])`;
  }

  private printTree(): string {
    const tree: string[] = [];
    for (let i = 0; i < this.path.length; ++i) {
      tree.push(`${' '.repeat(i)}${this.path[i]}`);
    }
    return tree.join('\n');
  }
}

function isRouteContext(value: unknown): value is IRouteContext {
  return value instanceof RouteContext;
}

function isCustomElementDefinition(value: ResourceDefinition): value is CustomElementDefinition {
  return CustomElement.isType(value.Type);
}

export class $RecognizedRoute {
  public constructor(
    public readonly route: RecognizedRoute<RouteConfig | Promise<RouteConfig>>,
    public readonly residue: string | null,
  ) { }

  public toString(): string {
    const route = this.route;
    const cr = route.endpoint.route;
    return `RR(route:(endpoint:(route:(path:${cr.path},handler:${cr.handler})),params:${JSON.stringify(route.params)}),residue:${this.residue})`;
  }
}

export interface INavigationModel {
  /**
   * Collection of routes.
   */
  readonly routes: readonly INavigationRoute[];
  /**
   * Wait for async route configurations.
   */
  resolve(): Promise<void> | void;
}
// Usage of classical interface pattern is intentional.
class NavigationModel implements INavigationModel {
  private _promise: Promise<void> | void = void 0;
  public constructor(
    public readonly routes: NavigationRoute[],
  ) { }

  public resolve(): Promise<void> | void {
    return onResolve(this._promise, noop);
  }

  /** @internal */
  public setIsActive(router: IRouter, context: IRouteContext): void {
    void onResolve(this._promise, () => {
      for (const route of this.routes) {
        route.setIsActive(router, context);
      }
    });
  }

  /** @internal */
  public addRoute(route: RouteConfig | Promise<RouteConfig>): void {
    const routes = this.routes;
    if (!(route instanceof Promise)) {
      if (route.nav ?? false) {
        routes.push(NavigationRoute.create(route));
      }
      return;
    }
    const index = routes.length;
    routes.push((void 0)!); // reserve the slot
    let promise: void | Promise<void> = void 0;
    promise = this._promise = onResolve(this._promise, () =>
      onResolve(route, rdConfig => {
        if (rdConfig.nav) {
          routes[index] = NavigationRoute.create(rdConfig);
        } else {
          routes.splice(index, 1);
        }
        if (this._promise === promise) {
          this._promise = void 0;
        }
      })
    );
  }
}

export interface INavigationRoute {
  readonly id: string | null;
  readonly path: string[];
  readonly title: string | ((node: RouteNode) => string | null) | null;
  readonly data: Record<string, unknown>;
  readonly isActive: boolean;
}
// Usage of classical interface pattern is intentional.
class NavigationRoute implements INavigationRoute {
  private _isActive!: boolean;
  private _trees: ViewportInstructionTree[] | null = null;
  private constructor(
    public readonly id: string | null,
    public readonly path: string[],
    public readonly redirectTo: string | null,
    public readonly title: string | ((node: RouteNode) => string | null) | null,
    public readonly data: Record<string, unknown>,
  ) { }

  /** @internal */
  public static create(rdConfig: RouteConfig) {
    return new NavigationRoute(
      rdConfig.id,
      ensureArrayOfStrings(rdConfig.path ?? emptyArray),
      rdConfig.redirectTo,
      rdConfig.title,
      rdConfig.data,
    );
  }

  public get isActive(): boolean {
    return this._isActive;
  }

  /** @internal */
  public setIsActive(router: IRouter, context: IRouteContext): void {
    let trees = this._trees;
    if (trees === null) {
      const routerOptions = router.options;
      trees = this._trees = this.path.map(p => {
        const ep = context._recognizer.getEndpoint(p);
        if (ep === null) throw new Error(getMessage(Events.nmNoEndpoint, p));
        return new ViewportInstructionTree(
          NavigationOptions.create(routerOptions, { context }),
          false,
          [
            ViewportInstruction.create({
              recognizedRoute: new $RecognizedRoute(new RecognizedRoute(ep, emptyObject), null),
              component: p,
            })
          ],
          emptyQuery,
          null
        );
      });
    }
    this._isActive = trees.some(vit => router.routeTree.contains(vit, { matchEndpoint: true, matchOriginalInstruction: this.redirectTo !== null }));
  }
}
