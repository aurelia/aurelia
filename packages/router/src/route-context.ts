/* eslint-disable sonarjs/prefer-immediate-return */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import {
  Constructable,
  ResourceType,
  IContainer,
  IResourceKind,
  ResourceDefinition,
  Key,
  IResolver,
  Resolved,
  IFactory,
  Transformer,
  DI,
  InstanceProvider,
  Registration,
  ILogger,
} from '@aurelia/kernel';
import {
  ICompiledRenderContext,
  IRenderContext,
  CustomElementDefinition,
  CustomElement,
  ICustomElementController,
  IController,
  CompositionRoot,
  ICustomElementViewModel,
  isCustomElementViewModel,
  isCustomElementController,
} from '@aurelia/runtime';
import {
  DOM,
} from '@aurelia/runtime-html';

import {
  RouteDefinition,
} from './route-definition';
import {
  ViewportAgent,
} from './viewport-agent';
import {
  ComponentAgent,
  IRouteViewModel,
} from './component-agent';
import {
  CompositeSegmentExpressionOrHigher,
} from './route-expression';
import {
  NavigationInstruction,
  RouteNode,
} from './route-tree';
import {
  RouteRecognizer,
} from './route-recognizer';
import {
  Transition,
  IRouter,
} from './router';

type RenderContextLookup = WeakMap<IRenderContext, RouteDefinitionLookup>;
type RouteDefinitionLookup = WeakMap<RouteDefinition, IRouteContext>;

const renderContextLookup: RenderContextLookup = new WeakMap();

function getRouteDefinitionLookup(
  renderContext: ICompiledRenderContext<HTMLElement>,
): RouteDefinitionLookup {
  let routeDefinitionLookup = renderContextLookup.get(renderContext);
  if (routeDefinitionLookup === void 0) {
    renderContextLookup.set(
      renderContext,
      routeDefinitionLookup = new WeakMap(),
    );
  }

  return routeDefinitionLookup;
}

export interface IRouteContext extends RouteContext {}
export const IRouteContext = DI.createInterface<IRouteContext>('IRouteContext').noDefault();

export type RouteContextLike = (
  IRouteContext |
  ICustomElementViewModel<HTMLElement> |
  ICustomElementController<HTMLElement> |
  HTMLElement
);

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
  private readonly viewportAgentsMap: Map<string, ViewportAgent[]> = new Map();
  public readonly root: IRouteContext;
  /**
   * The path from the root RouteContext up to this one.
   */
  public readonly path: readonly IRouteContext[];
  /**
   * The stringified path from the root RouteContext up to this one, consisting of the component names they're associated with, separated by slashes.
   *
   * Mainly for debugging/introspection purposes.
   */
  public readonly friendlyPath: string;

  /**
   * The (fully resolved) configured child routes of this context's `RouteDefinition`
   */
  public readonly childRoutes: readonly RouteDefinition[];

  private readonly logger: ILogger;
  private readonly container: IContainer;
  private readonly hostControllerProvider: InstanceProvider<ICustomElementController<HTMLElement>>;
  private readonly recognizer: RouteRecognizer;

  private constructor(
    public node: RouteNode,
    public viewportAgent: ViewportAgent | null,
    public readonly parent: IRouteContext | null,
    public readonly component: CustomElementDefinition,
    public readonly definition: RouteDefinition,
    public readonly parentContainer: IContainer,
  ) {
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

    container.register(...component.dependencies);

    // We're resolving/completing the child routes and the route recognizer here
    // eagerly but it doesn't *have* to be. It could be done lazily if for example we need
    // to account for potentially late-registered dependencies.
    // We could also create a new recognizer on each `recognize` request, but this would need solid
    // justification because the perf impact of doing this can be significant in larger apps with big route tables.

    // However, when it comes to route configuration, the act of mutating the config will
    // invalidate the RouteContext cache and automatically results in a fresh context
    // (and thus, a new recognizer based on its new state).
    const childRoutes = this.childRoutes = definition.config.children.map(child => {
      return RouteDefinition.resolve(child, this);
    });

    this.recognizer = new RouteRecognizer(childRoutes);
  }

  /**
   * This is the primary API for retrieving statically configured routes combined with the customElement metadata associated with a type.
   *
   * The customElement metadata is lazily associated with a type via the RouteContext the first time `getOrCreate` is called.
   *
   * This API is also used for direct routing even when there is no configuration at all.
   *
   * @param component - The custom element definition.
   * @param renderContext - The `controller.context` of the component hosting the viewport that the route will be loaded into.
   *
   */
  public static getOrCreate(
    node: RouteNode,
    viewportAgent: ViewportAgent | null,
    component: CustomElementDefinition,
    renderContext: ICompiledRenderContext<HTMLElement>,
  ): IRouteContext {
    const logger = renderContext.get(ILogger).scopeTo('RouteContext');

    const routeDefinition = RouteDefinition.resolve(component.Type);
    const routeDefinitionLookup = getRouteDefinitionLookup(renderContext);

    let routeContext = routeDefinitionLookup.get(routeDefinition);
    if (routeContext === void 0) {
      logger.trace(`creating new RouteContext for ${routeDefinition}`);

      const parent = renderContext.has(IRouteContext, true)
        ? renderContext.get(IRouteContext)
        : null;

      routeDefinitionLookup.set(
        routeDefinition,
        routeContext = new RouteContext(
          node,
          viewportAgent,
          parent,
          component,
          routeDefinition,
          renderContext,
        ),
      );
    } else {
      logger.trace(`returning existing RouteContext for ${routeDefinition}`);
    }

    return routeContext;
  }

  /**
   * Create a new `RouteContext` and register it in the provided container.
   *
   * Uses the `RenderContext` of the registered `CompositionRoot` as the root context.
   *
   * @param container - The container from which to resolve the `CompositionRoot` and in which to register the `RouteContext`
   */
  public static setRoot(container: IContainer): void {
    const logger = container.get(ILogger).scopeTo('RouteContext');

    if (!container.has(CompositionRoot, true)) {
      logAndThrow(new Error(`The provided container has no registered CompositionRoot. RouteContext.setRoot can only be used after Aurelia.app was called, on a container that is within that app's component tree.`), logger);
    }

    if (container.has(IRouteContext, true)) {
      logAndThrow(new Error(`A root RouteContext is already registered. A possible cause is the RouterConfiguration being registered more than once in the same container tree. If you have a multi-rooted app, make sure you register RouterConfiguration only in the "forked" containers and not in the common root.`), logger);
    }

    const { controller } = container.get<CompositionRoot<HTMLElement>>(CompositionRoot);
    if (controller === void 0) {
      logAndThrow(new Error(`The provided CompositionRoot does not (yet) have a controller. A possible cause is calling this API manually before Aurelia.start() is called`), logger);
    }

    const tree = container.get(IRouter).routeTree;
    const routeContext = RouteContext.getOrCreate(
      tree.root,
      null,
      controller.context.definition,
      controller.context,
    );
    container.register(Registration.instance(IRouteContext, routeContext));
  }

  public static resolve(
    root: IRouteContext,
    context: unknown,
  ): IRouteContext {
    const logger = root.get(ILogger).scopeTo('RouteContext');

    if (context === null || context === void 0) {
      logger.trace(`resolve(context:${String(context)}) - returning root RouteContext`);
      return root;
    }

    if (isRouteContext(context)) {
      logger.trace(`resolve(context:${context.toString()}) - returning provided RouteContext`);
      return context;
    }

    if (isHTMLElement(context)) {
      try {
        // CustomElement.for can theoretically throw in (as of yet) unknown situations.
        // If that happens, we want to know about the situation and *not* just fall back to the root context, as that might make
        // some already convoluted issues impossible to troubleshoot.
        // That's why we catch, log and re-throw instead of just letting the error bubble up.
        // This also gives us a set point in the future to potentially handle supported scenarios where this could occur.
        const controller = CustomElement.for(context, true);
        logger.trace(`resolve(context:Node(nodeName:'${context.nodeName}'),controller:'${controller.context.definition.name}') - resolving RouteContext from controller's RenderContext`);
        return controller.context.get(IRouteContext);
      } catch (err) {
        logger.error(`Failed to resolve RouteContext from Node(nodeName:'${context.nodeName}')`, err);
        throw err;
      }
    }

    if (isCustomElementViewModel(context)) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
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
    this.logger.trace(`has(key:${String(key)},searchAncestors:${searchAncestors})`);
    return this.container.has(key, searchAncestors);
  }

  public get<K extends Key>(key: K | Key): Resolved<K> {
    this.logger.trace(`get(key:${String(key)})`);
    return this.container.get(key);
  }

  public getAll<K extends Key>(key: K | Key): readonly Resolved<K>[] {
    this.logger.trace(`getAll(key:${String(key)})`);
    return this.container.getAll(key);
  }
  // #endregion

  // #region IContainer api
  public register(...params: unknown[]): IContainer {
    this.logger.trace(`register(params:[${params.map(String).join(',')}])`);
    return this.container.register(...params);
  }

  public registerResolver<K extends Key, T = K>(key: K, resolver: IResolver<T>): IResolver<T> {
    this.logger.trace(`registerResolver(key:${String(key)})`);
    return this.container.registerResolver(key, resolver);
  }

  public registerTransformer<K extends Key, T = K>(key: K, transformer: Transformer<T>): boolean {
    this.logger.trace(`registerTransformer(key:${String(key)})`);
    return this.container.registerTransformer(key, transformer);
  }

  public getResolver<K extends Key, T = K>(key: K | Key, autoRegister?: boolean): IResolver<T> | null {
    this.logger.trace(`getResolver(key:${String(key)})`);
    return this.container.getResolver(key, autoRegister);
  }

  public getFactory<T extends Constructable>(key: T): IFactory<T> | null {
    this.logger.trace(`getFactory(key:${String(key)})`);
    return this.container.getFactory(key);
  }

  public registerFactory<K extends Constructable>(key: K, factory: IFactory<K>): void {
    this.logger.trace(`registerFactory(key:${String(key)})`);
    this.container.registerFactory(key, factory);
  }

  public createChild(): IContainer {
    this.logger.trace(`createChild()`);
    return this.container.createChild();
  }

  public disposeResolvers() {
    this.logger.trace(`disposeResolvers()`);
    this.container.disposeResolvers();
  }

  public findResource<
    TType extends ResourceType,
    TDef extends ResourceDefinition,
  >(kind: IResourceKind<TType, TDef>, name: string): TDef | null {
    this.logger.trace(`findResource(kind:${kind.name},name:'${name}')`);
    return this.container.findResource(kind, name);
  }

  public createResource<
    TType extends ResourceType,
    TDef extends ResourceDefinition,
  >(kind: IResourceKind<TType, TDef>, name: string): InstanceType<TType> | null {
    this.logger.trace(`createResource(kind:${kind.name},name:'${name}')`);
    return this.container.createResource(kind, name);
  }
  // #endregion

  public resolveViewportAgent(node: RouteNode): ViewportAgent {
    this.logger.trace(`resolveViewportAgent(node.viewport:'${node.viewport}')`);

    // TODO: port various bits of viewport resolution
    const viewports = this.getViewportAgents(node.viewport === '' ? '*' : node.viewport);
    if (viewports === void 0) {
      // Or create on-the-fly?
      throw new Error(`No viewport(s) named '${node.viewport}' could be found`);
    }

    // TODO: some heuristics for dealing with viewport naming conflicts.
    // Ofc we could also just *not* support that, but it could be beneficial to support some basic scenarios.
    return viewports[0];
  }

  /**
   * Create a component based on the provided viewportInstruction.
   *
   * @param hostController - The `ICustomElementController` whose component (typically `au-viewport`) will host this component.
   * @param routeNode - The routeNode that describes the component + state.
   */
  public createComponentAgent(
    hostController: ICustomElementController<HTMLElement>,
    routeNode: RouteNode,
  ): ComponentAgent {
    this.logger.trace(`createComponentAgent(hostController:${hostController},routeNode:${routeNode})`);

    this.hostControllerProvider.prepare(hostController);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const routeDefinition = RouteDefinition.resolve(routeNode.component!, this);
    const componentInstance = this.container.get<IRouteViewModel>(routeDefinition.component.key);
    const componentAgent = ComponentAgent.for(componentInstance, hostController, routeNode, this);

    this.hostControllerProvider.dispose();

    return componentAgent;
  }

  public addViewportAgent(name: string, viewportAgent: ViewportAgent): void {
    this.logger.trace(`addViewportAgent(name:'${name}',viewportAgent:${viewportAgent})`);

    const viewportAgents = this.getViewportAgents(name);
    const index = viewportAgents.indexOf(viewportAgent);
    if (index >= 0) {
      throw new Error(`Unexpected invariant violation: ViewportAgent "${name}" already present`);
    }
    viewportAgents.push(viewportAgent);
  }

  public removeViewportAgent(name: string, viewportAgent: ViewportAgent): void {
    this.logger.trace(`removeViewportAgent(name:'${name}',viewportAgent:${viewportAgent})`);

    const viewportAgents = this.getViewportAgents(name);
    const index = viewportAgents.indexOf(viewportAgent);
    if (index === -1) {
      throw new Error(`Unexpected invariant violation: ViewportAgent "${name}" not found`);
    }
    viewportAgents.splice(index, 1);
  }

  public renameViewportAgent(newName: string, oldName: string, viewportAgent: ViewportAgent): void {
    this.logger.trace(`renameViewportAgent(newName:'${newName}',oldName:'${oldName}',viewportAgent:${viewportAgent})`);

    this.removeViewportAgent(oldName, viewportAgent);
    this.addViewportAgent(newName, viewportAgent);
  }

  /**
   * Get all available viewports from this context.
   */
  public getViewportAgents(name: '*'): ViewportAgent[];
  /**
   * Get the available viewports from this context with the specified name.
   */
  public getViewportAgents(name: string): ViewportAgent[];
  public getViewportAgents(name: '*' | string): ViewportAgent[] {
    if (name === '*') {
      const viewportAgents: ViewportAgent[] = [];
      for (const values of this.viewportAgentsMap.values()) {
        viewportAgents.push(...values);
      }

      this.logger.trace(`getViewportAgents(name:'${name}') -> ${viewportAgents.length} viewport(s)`);

      return viewportAgents;
    } else {
      let viewportAgents = this.viewportAgentsMap.get(name);
      if (viewportAgents === void 0) {
        this.viewportAgentsMap.set(
          name,
          viewportAgents = [],
        );
      }

      this.logger.trace(`getViewportAgents(name:'${name}') -> ${viewportAgents.length} viewport(s)`);

      return viewportAgents;
    }
  }

  /** @internal */
  public resolveNode(
    expr: CompositeSegmentExpressionOrHigher,
    ctx: IRouteContext,
    transition: Transition,
    parent: RouteNode,
    index: number,
    append: boolean,
  ): RouteNode {
    const mode = transition.options.getRoutingMode(expr.raw);

    this.logger.trace(`resolveRouteNode(expr:'${expr}',mode:'${mode}')`);

    switch (mode) {
      case 'configured-first': {
        const configuredNode = this.resolveConfigured(expr, transition);
        if (configuredNode.component !== null) {
          parent.appendChild(configuredNode);
          return configuredNode;
        }

        const directNode = this.resolveDirect(expr, ctx, transition, parent, index, append);
        if (directNode.component !== null) {
          return directNode;
        }

        parent.appendChild(configuredNode);
        return configuredNode;
      }
      case 'configured-only':
        return this.resolveConfigured(expr, transition);
      case 'direct-first': {
        const directNode = this.resolveDirect(expr, ctx, transition, parent, index, append);
        if (directNode.component !== null) {
          return directNode;
        }

        const configuredNode = this.resolveConfigured(expr, transition);
        if (configuredNode.component !== null) {
          parent.appendChild(configuredNode);
          return configuredNode;
        }

        return directNode;
      }
      case 'direct-only':
        return this.resolveDirect(expr, ctx, transition, parent, index, append);
    }
  }

  private resolveConfigured(
    expr: CompositeSegmentExpressionOrHigher,
    transition: Transition,
  ): RouteNode {
    const result = this.recognizer.recognize(expr.raw);
    if (result === null) {
      this.logger.trace(`resolveConfigured(expr:'${expr}') -> null`);

      // Return a node where `component` is null, so that consumers know there was no match
      const node = new RouteNode(
        null,
        expr.segments,
        {},
        expr.route.queryParams, // TODO: queryParamsStrategy
        expr.route.fragment, // TODO: fragmentStrategy
        {},
        '',
        null,
        transition.options.append,
        [],
        [],
      );
      return node;
    }

    const children: RouteNode[] = [];
    const instructions: NavigationInstruction[] = [];
    if (result.residue !== null) {
      // The router needs to deal with this later via `processResidue()`
      instructions.push(result.residue);
    }

    this.logger.trace(`resolveConfigured(expr:'${expr}') -> '${result.endpoint.route.component}'`);

    const { data, viewport, component } = result.endpoint.route;
    const node = new RouteNode(
      null, // temp
      expr.segments,
      result.params, // TODO: params inheritance
      expr.route.queryParams, // TODO: queryParamsStrategy
      expr.route.fragment, // TODO: fragmentStrategy
      data,
      viewport,
      component,
      transition.options.append,
      children,
      instructions,
    );

    const viewportAgent = this.resolveViewportAgent(node);
    const newContext = RouteContext.getOrCreate(
      node,
      viewportAgent,
      component,
      viewportAgent.hostController.context,
    );
    node.context = newContext;

    return node;
  }

  private resolveDirect(
    expr: CompositeSegmentExpressionOrHigher,
    ctx: IRouteContext,
    transition: Transition,
    parent: RouteNode,
    index: number,
    append: boolean,
  ): RouteNode {
    const node = expr.getNode(ctx, transition, parent, index, append, false);

    this.logger.trace(`resolveDirect(expr:'${expr}') -> ${node}`);

    return node;
  }

  public toString(): string {
    return `RouteContext(friendlyPath:'${this.friendlyPath}')`;
  }
}

function isRouteContext(value: unknown): value is IRouteContext {
  return value instanceof RouteContext;
}

function isHTMLElement(value: unknown): value is HTMLElement {
  return DOM.isNodeInstance(value);
}

function logAndThrow(err: Error, logger: ILogger): never {
  logger.error(err);
  throw err;
}
