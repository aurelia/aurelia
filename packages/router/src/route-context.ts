/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { Constructable, ResourceType, IContainer, IResourceKind, ResourceDefinition, Key, IResolver, Resolved, IFactory, Transformer, DI, InstanceProvider, Registration, ILogger, IModuleLoader, IModule } from '@aurelia/kernel';
import { CustomElementDefinition, CustomElement, ICustomElementController, IController, isCustomElementViewModel, isCustomElementController, IAppRoot, IPlatform } from '@aurelia/runtime-html';

import { RouteDefinition } from './route-definition.js';
import { ViewportAgent, ViewportRequest } from './viewport-agent.js';
import { ComponentAgent, IRouteViewModel } from './component-agent.js';
import { RouteNode } from './route-tree.js';
import { RouteRecognizer, RecognizedRoute } from './route-recognizer.js';
import { IRouter } from './router.js';
import { IViewport } from './resources/viewport.js';
import { Routeable } from './route.js';

function isNotPromise<T>(value: T): value is Exclude<T, Promise<unknown>> {
  return !(value instanceof Promise);
}

export interface IRouteContext extends RouteContext {}
export const IRouteContext = DI.createInterface<IRouteContext>('IRouteContext');

/**
 * Holds the information of a component in the context of a specific container. May or may not have statically configured routes.
 *
 * The `RouteContext` is cached using a 3-part composite key consisting of the CustomElementDefinition, the RouteDefinition and the RenderContext.
 *
 * This means there can be more than one `RouteContext` per component type if either:
 * - The `RouteDefinition` for a type is overridden manually via `Route.define`
 * - Different components (with different `RenderContext`s) reference the same component via a child route config
 */
export class RouteContext implements IContainer {
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
   * The (fully resolved) configured child routes of this context's `RouteDefinition`
   */
  public readonly childRoutes: readonly (RouteDefinition | Promise<RouteDefinition>)[];

  private prevNode: RouteNode | null = null;
  private _node: RouteNode | null = null;
  public get node(): RouteNode {
    const node = this._node;
    if (node === null) {
      throw new Error(`Invariant violation: RouteNode should be set immediately after the RouteContext is created. Context: ${this}`);
    }
    return node;
  }
  public set node(value: RouteNode) {
    const prev = this.prevNode = this._node;
    if (prev !== value) {
      this._node = value;
      this.logger.trace(`Node changed from %s to %s`, this.prevNode, value);
    }
  }

  private _vpa: ViewportAgent | null = null;
  /**
   * The viewport hosting the component associated with this RouteContext.
   * The root RouteContext has no ViewportAgent and will throw when attempting to access this property.
   */
  public get vpa(): ViewportAgent {
    const vpa = this._vpa;
    if (vpa === null) {
      throw new Error(`RouteContext has no ViewportAgent: ${this}`);
    }
    return vpa;
  }
  public set vpa(value: ViewportAgent) {
    if (value === null || value === void 0) {
      throw new Error(`Cannot set ViewportAgent to ${value} for RouteContext: ${this}`);
    }
    const prev = this._vpa;
    if (prev !== value) {
      this._vpa = value;
      this.logger.trace(`ViewportAgent changed from %s to %s`, prev, value);
    }
  }

  private readonly moduleLoader: IModuleLoader;
  private readonly logger: ILogger;
  private readonly container: IContainer;
  private readonly hostControllerProvider: InstanceProvider<ICustomElementController>;
  private readonly recognizer: RouteRecognizer;

  public constructor(
    viewportAgent: ViewportAgent | null,
    public readonly parent: IRouteContext | null,
    public readonly component: CustomElementDefinition,
    public readonly definition: RouteDefinition,
    public readonly parentContainer: IContainer,
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
    this.logger = parentContainer.get(ILogger).scopeTo(`RouteContext<${this.friendlyPath}>`);
    this.logger.trace('constructor()');

    this.moduleLoader = parentContainer.get(IModuleLoader);

    const container = this.container = parentContainer.createChild({ inheritParentResources: true });

    container.registerResolver(
      IController,
      this.hostControllerProvider = new InstanceProvider(),
      true,
    );

    // We don't need to store it here but we use an InstanceProvider so that it can be disposed indirectly via the container.
    const contextProvider = new InstanceProvider();
    container.registerResolver(
      IRouteContext,
      contextProvider,
      true,
    );
    contextProvider.prepare(this);

    container.register(definition);
    container.register(...component.dependencies);

    // The act of mutating the config will invalidate the RouteContext cache and automatically results in a fresh context
    // (and thus, a new recognizer based on its new state).
    // Lazy loaded modules which are added directly as children will be added to the recognizer once they're resolved.
    const childRoutes = this.childRoutes = definition.config.children.filter(isNotPromise).map(child => {
      return RouteDefinition.resolve(child, this);
    });

    this.recognizer = new RouteRecognizer(childRoutes);
  }

  /**
   * Create a new `RouteContext` and register it in the provided container.
   *
   * Uses the `RenderContext` of the registered `IAppRoot` as the root context.
   *
   * @param container - The container from which to resolve the `IAppRoot` and in which to register the `RouteContext`
   */
  public static setRoot(container: IContainer): void {
    const logger = container.get(ILogger).scopeTo('RouteContext');

    if (!container.has(IAppRoot, true)) {
      logAndThrow(new Error(`The provided container has no registered IAppRoot. RouteContext.setRoot can only be used after Aurelia.app was called, on a container that is within that app's component tree.`), logger);
    }

    if (container.has(IRouteContext, true)) {
      logAndThrow(new Error(`A root RouteContext is already registered. A possible cause is the RouterConfiguration being registered more than once in the same container tree. If you have a multi-rooted app, make sure you register RouterConfiguration only in the "forked" containers and not in the common root.`), logger);
    }

    const { controller } = container.get(IAppRoot);
    if (controller === void 0) {
      logAndThrow(new Error(`The provided IAppRoot does not (yet) have a controller. A possible cause is calling this API manually before Aurelia.start() is called`), logger);
    }

    const router = container.get(IRouter);
    const routeContext = router.getRouteContext(null, controller.context.definition, controller.context);
    container.register(Registration.instance(IRouteContext, routeContext));
    routeContext.node = router.routeTree.root;
  }

  public static resolve(root: IRouteContext, context: unknown): IRouteContext {
    const logger = root.get(ILogger).scopeTo('RouteContext');

    if (context === null || context === void 0) {
      logger.trace(`resolve(context:%s) - returning root RouteContext`, context);
      return root;
    }

    if (isRouteContext(context)) {
      logger.trace(`resolve(context:%s) - returning provided RouteContext`, context);
      return context;
    }

    if (context instanceof root.get(IPlatform).Node) {
      try {
        // CustomElement.for can theoretically throw in (as of yet) unknown situations.
        // If that happens, we want to know about the situation and *not* just fall back to the root context, as that might make
        // some already convoluted issues impossible to troubleshoot.
        // That's why we catch, log and re-throw instead of just letting the error bubble up.
        // This also gives us a set point in the future to potentially handle supported scenarios where this could occur.
        const controller = CustomElement.for(context, { searchParents: true });
        logger.trace(`resolve(context:Node(nodeName:'${context.nodeName}'),controller:'${controller.context.definition.name}') - resolving RouteContext from controller's RenderContext`);
        return controller.context.get(IRouteContext);
      } catch (err) {
        logger.error(`Failed to resolve RouteContext from Node(nodeName:'${context.nodeName}')`, err);
        throw err;
      }
    }

    if (isCustomElementViewModel(context)) {
      const controller = context.$controller!;
      logger.trace(`resolve(context:CustomElementViewModel(name:'${controller.context.definition.name}')) - resolving RouteContext from controller's RenderContext`);
      return controller.context.get(IRouteContext);
    }

    if (isCustomElementController(context)) {
      const controller = context;
      logger.trace(`resolve(context:CustomElementController(name:'${controller.context.definition.name}')) - resolving RouteContext from controller's RenderContext`);
      return controller.context.get(IRouteContext);
    }

    logAndThrow(new Error(`Invalid context type: ${Object.prototype.toString.call(context)}`), logger);
  }

  // #region IServiceLocator api
  public has<K extends Key>(key: K | Key, searchAncestors: boolean): boolean {
    // this.logger.trace(`has(key:${String(key)},searchAncestors:${searchAncestors})`);
    return this.container.has(key, searchAncestors);
  }

  public get<K extends Key>(key: K | Key): Resolved<K> {
    // this.logger.trace(`get(key:${String(key)})`);
    return this.container.get(key);
  }

  public getAll<K extends Key>(key: K | Key): readonly Resolved<K>[] {
    // this.logger.trace(`getAll(key:${String(key)})`);
    return this.container.getAll(key);
  }
  // #endregion

  // #region IContainer api
  public register(...params: unknown[]): IContainer {
    // this.logger.trace(`register(params:[${params.map(String).join(',')}])`);
    return this.container.register(...params);
  }

  public registerResolver<K extends Key, T = K>(key: K, resolver: IResolver<T>): IResolver<T> {
    // this.logger.trace(`registerResolver(key:${String(key)})`);
    return this.container.registerResolver(key, resolver);
  }

  public registerTransformer<K extends Key, T = K>(key: K, transformer: Transformer<T>): boolean {
    // this.logger.trace(`registerTransformer(key:${String(key)})`);
    return this.container.registerTransformer(key, transformer);
  }

  public getResolver<K extends Key, T = K>(key: K | Key, autoRegister?: boolean): IResolver<T> | null {
    // this.logger.trace(`getResolver(key:${String(key)})`);
    return this.container.getResolver(key, autoRegister);
  }

  public getFactory<T extends Constructable>(key: T): IFactory<T> {
    // this.logger.trace(`getFactory(key:${String(key)})`);
    return this.container.getFactory(key);
  }

  public registerFactory<K extends Constructable>(key: K, factory: IFactory<K>): void {
    // this.logger.trace(`registerFactory(key:${String(key)})`);
    this.container.registerFactory(key, factory);
  }

  public createChild(): IContainer {
    // this.logger.trace(`createChild()`);
    return this.container.createChild();
  }

  public disposeResolvers() {
    // this.logger.trace(`disposeResolvers()`);
    this.container.disposeResolvers();
  }

  public find<TType extends ResourceType, TDef extends ResourceDefinition>(kind: IResourceKind<TType, TDef>, name: string): TDef | null {
    // this.logger.trace(`findResource(kind:${kind.name},name:'${name}')`);
    return this.container.find(kind, name);
  }

  public create<TType extends ResourceType, TDef extends ResourceDefinition>(kind: IResourceKind<TType, TDef>, name: string): InstanceType<TType> | null {
    // this.logger.trace(`createResource(kind:${kind.name},name:'${name}')`);
    return this.container.create(kind, name);
  }

  public dispose(): void {
    this.container.dispose();
  }
  // #endregion

  public resolveViewportAgent(req: ViewportRequest): ViewportAgent {
    this.logger.trace(`resolveViewportAgent(req:%s)`, req);

    const agent = this.childViewportAgents.find(x => { return x.handles(req); });

    if (agent === void 0) {
      throw new Error(`Failed to resolve ${req} at:\n${this.printTree()}`);
    }

    return agent;
  }

  /**
   * Create a component based on the provided viewportInstruction.
   *
   * @param hostController - The `ICustomElementController` whose component (typically `au-viewport`) will host this component.
   * @param routeNode - The routeNode that describes the component + state.
   */
  public createComponentAgent(hostController: ICustomElementController, routeNode: RouteNode): ComponentAgent {
    this.logger.trace(`createComponentAgent(routeNode:%s)`, routeNode);

    this.hostControllerProvider.prepare(hostController);
    const routeDefinition = RouteDefinition.resolve(routeNode.component);
    const componentInstance = this.container.get<IRouteViewModel>(routeDefinition.component!.key);
    const componentAgent = ComponentAgent.for(componentInstance, hostController, routeNode, this);

    this.hostControllerProvider.dispose();

    return componentAgent;
  }

  public registerViewport(viewport: IViewport): ViewportAgent {
    const agent = ViewportAgent.for(viewport, this);
    if (this.childViewportAgents.includes(agent)) {
      this.logger.trace(`registerViewport(agent:%s) -> already registered, so skipping`, agent);
    } else {
      this.logger.trace(`registerViewport(agent:%s) -> adding`, agent);
      this.childViewportAgents.push(agent);
    }

    return agent;
  }

  public unregisterViewport(viewport: IViewport): void {
    const agent = ViewportAgent.for(viewport, this);
    if (this.childViewportAgents.includes(agent)) {
      this.logger.trace(`unregisterViewport(agent:%s) -> unregistering`, agent);
      this.childViewportAgents.splice(this.childViewportAgents.indexOf(agent), 1);
    } else {
      this.logger.trace(`unregisterViewport(agent:%s) -> not registered, so skipping`, agent);
    }
  }

  public recognize(path: string): RecognizedRoute | null {
    this.logger.trace(`recognize(path:'${path}')`);
    return this.recognizer.recognize(path);
  }

  public addRoute(routeable: Exclude<Routeable, Promise<IModule>>): void {
    this.logger.trace(`addRoute(routeable:'${routeable}')`);
    const routeDef = RouteDefinition.resolve(routeable, this);
    this.recognizer.add(routeDef, true);
  }

  public resolveLazy(promise: Promise<IModule>): Promise<CustomElementDefinition> | CustomElementDefinition {
    return this.moduleLoader.load(promise, m => {
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

      if (defaultExport === void 0) {
        if (firstNonDefaultExport === void 0) {
          // TODO: make error more accurate and add potential causes/solutions
          throw new Error(`${promise} does not appear to be a component or CustomElement recognizable by Aurelia`);
        }
        return firstNonDefaultExport;
      }
      return defaultExport;
    });
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

function logAndThrow(err: Error, logger: ILogger): never {
  logger.error(err);
  throw err;
}

function isCustomElementDefinition(value: ResourceDefinition): value is CustomElementDefinition {
  return CustomElement.isType(value.Type);
}
