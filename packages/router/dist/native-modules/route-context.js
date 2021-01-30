/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { DI, InstanceProvider, Registration, ILogger, IModuleLoader, onResolve, noop } from '../../../kernel/dist/native-modules/index.js';
import { CustomElement, IController, isCustomElementViewModel, isCustomElementController, IAppRoot, IPlatform } from '../../../runtime-html/dist/native-modules/index.js';
import { RouteRecognizer } from '../../../route-recognizer/dist/native-modules/index.js';
import { RouteDefinition } from './route-definition.js';
import { ViewportAgent } from './viewport-agent.js';
import { ComponentAgent } from './component-agent.js';
import { IRouter } from './router.js';
import { isPartialChildRouteConfig } from './validation.js';
import { ensureArrayOfStrings } from './util.js';
export const IRouteContext = DI.createInterface('IRouteContext');
const RESIDUE = 'au$residue';
/**
 * Holds the information of a component in the context of a specific container. May or may not have statically configured routes.
 *
 * The `RouteContext` is cached using a 3-part composite key consisting of the CustomElementDefinition, the RouteDefinition and the RenderContext.
 *
 * This means there can be more than one `RouteContext` per component type if either:
 * - The `RouteDefinition` for a type is overridden manually via `Route.define`
 * - Different components (with different `RenderContext`s) reference the same component via a child route config
 */
export class RouteContext {
    constructor(viewportAgent, parent, component, definition, parentContainer) {
        var _a;
        this.parent = parent;
        this.component = component;
        this.definition = definition;
        this.parentContainer = parentContainer;
        this.childViewportAgents = [];
        /**
         * The (fully resolved) configured child routes of this context's `RouteDefinition`
         */
        this.childRoutes = [];
        this._resolved = null;
        this._allResolved = null;
        this.prevNode = null;
        this._node = null;
        this._vpa = null;
        this._vpa = viewportAgent;
        if (parent === null) {
            this.root = this;
            this.path = [this];
            this.friendlyPath = component.name;
        }
        else {
            this.root = parent.root;
            this.path = [...parent.path, this];
            this.friendlyPath = `${parent.friendlyPath}/${component.name}`;
        }
        this.logger = parentContainer.get(ILogger).scopeTo(`RouteContext<${this.friendlyPath}>`);
        this.logger.trace('constructor()');
        this.moduleLoader = parentContainer.get(IModuleLoader);
        const container = this.container = parentContainer.createChild({ inheritParentResources: true });
        container.registerResolver(IController, this.hostControllerProvider = new InstanceProvider(), true);
        // We don't need to store it here but we use an InstanceProvider so that it can be disposed indirectly via the container.
        const contextProvider = new InstanceProvider();
        container.registerResolver(IRouteContext, contextProvider, true);
        contextProvider.prepare(this);
        container.register(definition);
        container.register(...component.dependencies);
        this.recognizer = new RouteRecognizer();
        const promises = [];
        const allPromises = [];
        for (const child of definition.config.routes) {
            if (child instanceof Promise) {
                const p = this.addRoute(child);
                promises.push(p);
                allPromises.push(p);
            }
            else {
                const routeDef = RouteDefinition.resolve(child, this);
                if (routeDef instanceof Promise) {
                    if (isPartialChildRouteConfig(child) && child.path != null) {
                        for (const path of ensureArrayOfStrings(child.path)) {
                            this.$addRoute(path, (_a = child.caseSensitive) !== null && _a !== void 0 ? _a : false, routeDef);
                        }
                        const idx = this.childRoutes.length;
                        const p = routeDef.then(resolvedRouteDef => {
                            return this.childRoutes[idx] = resolvedRouteDef;
                        });
                        this.childRoutes.push(p);
                        allPromises.push(p.then(noop));
                    }
                    else {
                        throw new Error(`Invalid route config. When the component property is a lazy import, the path must be specified. To use lazy loading without specifying the path (e.g. in direct routing), pass the import promise as a direct value to the routes array instead of providing it as the component property on an object literal.`);
                    }
                }
                else {
                    for (const path of routeDef.path) {
                        this.$addRoute(path, routeDef.caseSensitive, routeDef);
                    }
                    this.childRoutes.push(routeDef);
                }
            }
        }
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
    get isRoot() {
        return this.parent === null;
    }
    get depth() {
        return this.path.length - 1;
    }
    /** @internal */
    get resolved() {
        return this._resolved;
    }
    /** @internal */
    get allResolved() {
        return this._allResolved;
    }
    get node() {
        const node = this._node;
        if (node === null) {
            throw new Error(`Invariant violation: RouteNode should be set immediately after the RouteContext is created. Context: ${this}`);
        }
        return node;
    }
    set node(value) {
        const prev = this.prevNode = this._node;
        if (prev !== value) {
            this._node = value;
            this.logger.trace(`Node changed from %s to %s`, this.prevNode, value);
        }
    }
    /**
     * The viewport hosting the component associated with this RouteContext.
     * The root RouteContext has no ViewportAgent and will throw when attempting to access this property.
     */
    get vpa() {
        const vpa = this._vpa;
        if (vpa === null) {
            throw new Error(`RouteContext has no ViewportAgent: ${this}`);
        }
        return vpa;
    }
    set vpa(value) {
        if (value === null || value === void 0) {
            throw new Error(`Cannot set ViewportAgent to ${value} for RouteContext: ${this}`);
        }
        const prev = this._vpa;
        if (prev !== value) {
            this._vpa = value;
            this.logger.trace(`ViewportAgent changed from %s to %s`, prev, value);
        }
    }
    /**
     * Create a new `RouteContext` and register it in the provided container.
     *
     * Uses the `RenderContext` of the registered `IAppRoot` as the root context.
     *
     * @param container - The container from which to resolve the `IAppRoot` and in which to register the `RouteContext`
     */
    static setRoot(container) {
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
    static resolve(root, context) {
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
            }
            catch (err) {
                logger.error(`Failed to resolve RouteContext from Node(nodeName:'${context.nodeName}')`, err);
                throw err;
            }
        }
        if (isCustomElementViewModel(context)) {
            const controller = context.$controller;
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
    has(key, searchAncestors) {
        // this.logger.trace(`has(key:${String(key)},searchAncestors:${searchAncestors})`);
        return this.container.has(key, searchAncestors);
    }
    get(key) {
        // this.logger.trace(`get(key:${String(key)})`);
        return this.container.get(key);
    }
    getAll(key) {
        // this.logger.trace(`getAll(key:${String(key)})`);
        return this.container.getAll(key);
    }
    // #endregion
    // #region IContainer api
    register(...params) {
        // this.logger.trace(`register(params:[${params.map(String).join(',')}])`);
        return this.container.register(...params);
    }
    registerResolver(key, resolver) {
        // this.logger.trace(`registerResolver(key:${String(key)})`);
        return this.container.registerResolver(key, resolver);
    }
    registerTransformer(key, transformer) {
        // this.logger.trace(`registerTransformer(key:${String(key)})`);
        return this.container.registerTransformer(key, transformer);
    }
    getResolver(key, autoRegister) {
        // this.logger.trace(`getResolver(key:${String(key)})`);
        return this.container.getResolver(key, autoRegister);
    }
    getFactory(key) {
        // this.logger.trace(`getFactory(key:${String(key)})`);
        return this.container.getFactory(key);
    }
    registerFactory(key, factory) {
        // this.logger.trace(`registerFactory(key:${String(key)})`);
        this.container.registerFactory(key, factory);
    }
    createChild() {
        // this.logger.trace(`createChild()`);
        return this.container.createChild();
    }
    disposeResolvers() {
        // this.logger.trace(`disposeResolvers()`);
        this.container.disposeResolvers();
    }
    find(kind, name) {
        // this.logger.trace(`findResource(kind:${kind.name},name:'${name}')`);
        return this.container.find(kind, name);
    }
    create(kind, name) {
        // this.logger.trace(`createResource(kind:${kind.name},name:'${name}')`);
        return this.container.create(kind, name);
    }
    dispose() {
        this.container.dispose();
    }
    // #endregion
    resolveViewportAgent(req) {
        this.logger.trace(`resolveViewportAgent(req:%s)`, req);
        const agent = this.childViewportAgents.find(x => { return x.handles(req); });
        if (agent === void 0) {
            throw new Error(`Failed to resolve ${req} at:\n${this.printTree()}`);
        }
        return agent;
    }
    getAvailableViewportAgents(resolution) {
        return this.childViewportAgents.filter(x => x.isAvailable(resolution));
    }
    /**
     * Create a component based on the provided viewportInstruction.
     *
     * @param hostController - The `ICustomElementController` whose component (typically `au-viewport`) will host this component.
     * @param routeNode - The routeNode that describes the component + state.
     */
    createComponentAgent(hostController, routeNode) {
        this.logger.trace(`createComponentAgent(routeNode:%s)`, routeNode);
        this.hostControllerProvider.prepare(hostController);
        const routeDefinition = RouteDefinition.resolve(routeNode.component);
        const componentInstance = this.container.get(routeDefinition.component.key);
        const componentAgent = ComponentAgent.for(componentInstance, hostController, routeNode, this);
        this.hostControllerProvider.dispose();
        return componentAgent;
    }
    registerViewport(viewport) {
        const agent = ViewportAgent.for(viewport, this);
        if (this.childViewportAgents.includes(agent)) {
            this.logger.trace(`registerViewport(agent:%s) -> already registered, so skipping`, agent);
        }
        else {
            this.logger.trace(`registerViewport(agent:%s) -> adding`, agent);
            this.childViewportAgents.push(agent);
        }
        return agent;
    }
    unregisterViewport(viewport) {
        const agent = ViewportAgent.for(viewport, this);
        if (this.childViewportAgents.includes(agent)) {
            this.logger.trace(`unregisterViewport(agent:%s) -> unregistering`, agent);
            this.childViewportAgents.splice(this.childViewportAgents.indexOf(agent), 1);
        }
        else {
            this.logger.trace(`unregisterViewport(agent:%s) -> not registered, so skipping`, agent);
        }
    }
    recognize(path) {
        var _a;
        this.logger.trace(`recognize(path:'${path}')`);
        const result = this.recognizer.recognize(path);
        if (result === null) {
            return null;
        }
        let residue;
        if (Reflect.has(result.params, RESIDUE)) {
            residue = (_a = result.params[RESIDUE]) !== null && _a !== void 0 ? _a : null;
            Reflect.deleteProperty(result.params, RESIDUE);
        }
        else {
            residue = null;
        }
        return new $RecognizedRoute(result, residue);
    }
    addRoute(routeable) {
        this.logger.trace(`addRoute(routeable:'${routeable}')`);
        return onResolve(RouteDefinition.resolve(routeable, this), routeDef => {
            for (const path of routeDef.path) {
                this.$addRoute(path, routeDef.caseSensitive, routeDef);
            }
            this.childRoutes.push(routeDef);
        });
    }
    $addRoute(path, caseSensitive, handler) {
        this.recognizer.add({
            path,
            caseSensitive,
            handler,
        });
        this.recognizer.add({
            path: `${path}/*${RESIDUE}`,
            caseSensitive,
            handler,
        });
    }
    resolveLazy(promise) {
        return this.moduleLoader.load(promise, m => {
            let defaultExport = void 0;
            let firstNonDefaultExport = void 0;
            for (const item of m.items) {
                if (item.isConstructable) {
                    const def = item.definitions.find(isCustomElementDefinition);
                    if (def !== void 0) {
                        if (item.key === 'default') {
                            defaultExport = def;
                        }
                        else if (firstNonDefaultExport === void 0) {
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
    toString() {
        const vpAgents = this.childViewportAgents;
        const viewports = vpAgents.map(String).join(',');
        return `RC(path:'${this.friendlyPath}',viewports:[${viewports}])`;
    }
    printTree() {
        const tree = [];
        for (let i = 0; i < this.path.length; ++i) {
            tree.push(`${' '.repeat(i)}${this.path[i]}`);
        }
        return tree.join('\n');
    }
}
function isRouteContext(value) {
    return value instanceof RouteContext;
}
function logAndThrow(err, logger) {
    logger.error(err);
    throw err;
}
function isCustomElementDefinition(value) {
    return CustomElement.isType(value.Type);
}
export class $RecognizedRoute {
    constructor(route, residue) {
        this.route = route;
        this.residue = residue;
    }
}
//# sourceMappingURL=route-context.js.map