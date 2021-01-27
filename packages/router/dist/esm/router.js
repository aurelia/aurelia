var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { IContainer, ILogger, isObject, DI, onResolve } from '@aurelia/kernel';
import { IPlatform } from '@aurelia/runtime-html';
import { IRouteContext, RouteContext } from './route-context.js';
import { IRouterEvents, NavigationStartEvent, NavigationEndEvent, NavigationCancelEvent } from './router-events.js';
import { ILocationManager } from './location-manager.js';
import { RouteTree, RouteNode, updateRouteTree } from './route-tree.js';
import { ViewportInstructionTree } from './instructions.js';
import { Batch, mergeDistinct } from './util.js';
import { RouteDefinition } from './route-definition.js';
export const AuNavId = 'au-nav-id';
export function isManagedState(state) {
    return isObject(state) && Object.prototype.hasOwnProperty.call(state, AuNavId) === true;
}
export function toManagedState(state, navId) {
    return { ...state, [AuNavId]: navId };
}
function valueOrFuncToValue(instructions, valueOrFunc) {
    if (typeof valueOrFunc === 'function') {
        return valueOrFunc(instructions);
    }
    return valueOrFunc;
}
export class RouterOptions {
    constructor(useUrlFragmentHash, useHref, statefulHistoryLength, 
    /**
     * The operating mode of the router that determines how components are resolved based on a url.
     *
     * - `configured-only`: only match the url against configured routes.
     * - `configured-first`: first tries to resolve by configured routes, then by component name from available dependencies. (default)
     *
     * Default: `configured-first`
     */
    routingMode, swapStrategy, resolutionMode, 
    /**
     * The strategy to use for determining the query parameters when both the previous and the new url has a query string.
     *
     * - `overwrite`: uses the query params of the new url. (default)
     * - `preserve`: uses the query params of the previous url.
     * - `merge`: uses the query params of both the previous and the new url. When a param name exists in both, the value from the new url is used.
     * - A function that returns one of the 3 above values based on the navigation.
     *
     * Default: `overwrite`
     */
    queryParamsStrategy, 
    /**
     * The strategy to use for determining the fragment (value that comes after `#`) when both the previous and the new url have one.
     *
     * - `overwrite`: uses the fragment of the new url. (default)
     * - `preserve`: uses the fragment of the previous url.
     * - A function that returns one of the 2 above values based on the navigation.
     *
     * Default: `overwrite`
     */
    fragmentStrategy, 
    /**
     * The strategy to use for interacting with the browser's `history` object (if applicable).
     *
     * - `none`: do not interact with the `history` object at all.
     * - `replace`: replace the current state in history
     * - `push`: push a new state onto the history (default)
     * - A function that returns one of the 3 above values based on the navigation.
     *
     * Default: `push`
     */
    historyStrategy, 
    /**
     * The strategy to use for when navigating to the same URL.
     *
     * - `ignore`: do nothing (default).
     * - `reload`: reload the current URL, effectively performing a refresh.
     * - A function that returns one of the 2 above values based on the navigation.
     *
     * Default: `ignore`
     */
    sameUrlStrategy) {
        this.useUrlFragmentHash = useUrlFragmentHash;
        this.useHref = useHref;
        this.statefulHistoryLength = statefulHistoryLength;
        this.routingMode = routingMode;
        this.swapStrategy = swapStrategy;
        this.resolutionMode = resolutionMode;
        this.queryParamsStrategy = queryParamsStrategy;
        this.fragmentStrategy = fragmentStrategy;
        this.historyStrategy = historyStrategy;
        this.sameUrlStrategy = sameUrlStrategy;
    }
    static get DEFAULT() { return RouterOptions.create({}); }
    static create(input) {
        return new RouterOptions(input.useUrlFragmentHash ?? false, input.useHref ?? true, input.statefulHistoryLength ?? 0, input.routingMode ?? 'configured-first', input.swapStrategy ?? 'sequential-remove-first', input.resolutionMode ?? 'dynamic', input.queryParamsStrategy ?? 'overwrite', input.fragmentStrategy ?? 'overwrite', input.historyStrategy ?? 'push', input.sameUrlStrategy ?? 'ignore');
    }
    /** @internal */
    getQueryParamsStrategy(instructions) {
        return valueOrFuncToValue(instructions, this.queryParamsStrategy);
    }
    /** @internal */
    getFragmentStrategy(instructions) {
        return valueOrFuncToValue(instructions, this.fragmentStrategy);
    }
    /** @internal */
    getHistoryStrategy(instructions) {
        return valueOrFuncToValue(instructions, this.historyStrategy);
    }
    /** @internal */
    getSameUrlStrategy(instructions) {
        return valueOrFuncToValue(instructions, this.sameUrlStrategy);
    }
    stringifyProperties() {
        return [
            ['routingMode', 'mode'],
            ['swapStrategy', 'swap'],
            ['resolutionMode', 'resolution'],
            ['queryParamsStrategy', 'queryParams'],
            ['fragmentStrategy', 'fragment'],
            ['historyStrategy', 'history'],
            ['sameUrlStrategy', 'sameUrl'],
        ].map(([key, name]) => {
            const value = this[key];
            return `${name}:${typeof value === 'function' ? value : `'${value}'`}`;
        }).join(',');
    }
    clone() {
        return new RouterOptions(this.useUrlFragmentHash, this.useHref, this.statefulHistoryLength, this.routingMode, this.swapStrategy, this.resolutionMode, this.queryParamsStrategy, this.fragmentStrategy, this.historyStrategy, this.sameUrlStrategy);
    }
    toString() {
        return `RO(${this.stringifyProperties()})`;
    }
}
export class NavigationOptions extends RouterOptions {
    constructor(routerOptions, title, titleSeparator, append, 
    /**
     * Specify a context to use for relative navigation.
     *
     * - `null` (or empty): navigate relative to the root (absolute navigation)
     * - `IRouteContext`: navigate relative to specifically this RouteContext (advanced users).
     * - `HTMLElement`: navigate relative to the routeable component (page) that directly or indirectly contains this element.
     * - `ICustomElementViewModel` (the `this` object when working from inside a view model): navigate relative to this component (if it was loaded as a route), or the routeable component (page) directly or indirectly containing it.
     * - `ICustomElementController`: same as `ICustomElementViewModel`, but using the controller object instead of the view model object (advanced users).
     */
    context, 
    /**
     * Specify an object to be serialized to a query string, and then set to the query string of the new URL.
     */
    queryParams, 
    /**
     * Specify the hash fragment for the new URL.
     */
    fragment, 
    /**
     * Specify any kind of state to be stored together with the history entry for this navigation.
     */
    state) {
        super(routerOptions.useUrlFragmentHash, routerOptions.useHref, routerOptions.statefulHistoryLength, routerOptions.routingMode, routerOptions.swapStrategy, routerOptions.resolutionMode, routerOptions.queryParamsStrategy, routerOptions.fragmentStrategy, routerOptions.historyStrategy, routerOptions.sameUrlStrategy);
        this.title = title;
        this.titleSeparator = titleSeparator;
        this.append = append;
        this.context = context;
        this.queryParams = queryParams;
        this.fragment = fragment;
        this.state = state;
    }
    static get DEFAULT() { return NavigationOptions.create({}); }
    static create(input) {
        return new NavigationOptions(RouterOptions.create(input), input.title ?? null, input.titleSeparator ?? ' | ', input.append ?? false, input.context ?? null, input.queryParams ?? null, input.fragment ?? '', input.state ?? null);
    }
    clone() {
        return new NavigationOptions(super.clone(), this.title, this.titleSeparator, this.append, this.context, { ...this.queryParams }, this.fragment, this.state === null ? null : { ...this.state });
    }
    toString() {
        return `NO(${super.stringifyProperties()})`;
    }
}
export class Navigation {
    constructor(id, instructions, trigger, options, prevNavigation, 
    // Set on next navigation, this is the route after all redirects etc have been processed.
    finalInstructions) {
        this.id = id;
        this.instructions = instructions;
        this.trigger = trigger;
        this.options = options;
        this.prevNavigation = prevNavigation;
        this.finalInstructions = finalInstructions;
    }
    static create(input) {
        return new Navigation(input.id, input.instructions, input.trigger, input.options, input.prevNavigation, input.finalInstructions);
    }
    toString() {
        return `N(id:${this.id},instructions:${this.instructions},trigger:'${this.trigger}')`;
    }
}
export class Transition {
    constructor(id, prevInstructions, instructions, finalInstructions, instructionsChanged, trigger, options, managedState, previousRouteTree, routeTree, promise, resolve, reject, guardsResult, error) {
        this.id = id;
        this.prevInstructions = prevInstructions;
        this.instructions = instructions;
        this.finalInstructions = finalInstructions;
        this.instructionsChanged = instructionsChanged;
        this.trigger = trigger;
        this.options = options;
        this.managedState = managedState;
        this.previousRouteTree = previousRouteTree;
        this.routeTree = routeTree;
        this.promise = promise;
        this.resolve = resolve;
        this.reject = reject;
        this.guardsResult = guardsResult;
        this.error = error;
    }
    static create(input) {
        return new Transition(input.id, input.prevInstructions, input.instructions, input.finalInstructions, input.instructionsChanged, input.trigger, input.options, input.managedState, input.previousRouteTree, input.routeTree, input.promise, input.resolve, input.reject, input.guardsResult, void 0);
    }
    run(cb, next) {
        if (this.guardsResult !== true) {
            return;
        }
        try {
            const ret = cb();
            if (ret instanceof Promise) {
                ret.then(next).catch(err => {
                    this.handleError(err);
                });
            }
            else {
                next(ret);
            }
        }
        catch (err) {
            this.handleError(err);
        }
    }
    handleError(err) {
        this.reject(this.error = err);
    }
    toString() {
        return `T(id:${this.id},trigger:'${this.trigger}',instructions:${this.instructions},options:${this.options})`;
    }
}
export const IRouter = DI.createInterface('IRouter', x => x.singleton(Router));
let Router = class Router {
    constructor(container, p, logger, events, locationMgr) {
        this.container = container;
        this.p = p;
        this.logger = logger;
        this.events = events;
        this.locationMgr = locationMgr;
        this._ctx = null;
        this._routeTree = null;
        this._currentTr = null;
        this.options = RouterOptions.DEFAULT;
        this.navigated = false;
        this.navigationId = 0;
        this.lastSuccessfulNavigation = null;
        this.activeNavigation = null;
        this.instructions = ViewportInstructionTree.create('');
        this.nextTr = null;
        this.locationChangeSubscription = null;
        this.vpaLookup = new Map();
        this.logger = logger.root.scopeTo('Router');
    }
    get ctx() {
        let ctx = this._ctx;
        if (ctx === null) {
            if (!this.container.has(IRouteContext, true)) {
                throw new Error(`Root RouteContext is not set. Did you forget to register RouteConfiguration, or try to navigate before calling Aurelia.start()?`);
            }
            ctx = this._ctx = this.container.get(IRouteContext);
        }
        return ctx;
    }
    get routeTree() {
        let routeTree = this._routeTree;
        if (routeTree === null) {
            // Lazy instantiation for only the very first (synthetic) tree.
            // Doing it here instead of in the constructor to delay it until we have the context.
            const ctx = this.ctx;
            routeTree = this._routeTree = new RouteTree(NavigationOptions.create({ ...this.options }), {}, null, RouteNode.create({
                path: '',
                finalPath: '',
                context: ctx,
                instruction: null,
                component: ctx.definition.component,
                append: false,
            }));
        }
        return routeTree;
    }
    get currentTr() {
        let currentTr = this._currentTr;
        if (currentTr === null) {
            currentTr = this._currentTr = Transition.create({
                id: 0,
                prevInstructions: this.instructions,
                instructions: this.instructions,
                finalInstructions: this.instructions,
                instructionsChanged: true,
                trigger: 'api',
                options: NavigationOptions.DEFAULT,
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
    set currentTr(value) {
        this._currentTr = value;
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
    resolveContext(context) {
        return RouteContext.resolve(this.ctx, context);
    }
    start(routerOptions, performInitialNavigation) {
        this.options = RouterOptions.create(routerOptions);
        this.locationMgr.startListening();
        this.locationChangeSubscription = this.events.subscribe('au:router:location-change', e => {
            // TODO(fkleuver): add a throttle config.
            // At the time of writing, chromium throttles popstate events at a maximum of ~100 per second.
            // While macroTasks run up to 250 times per second, it is extremely unlikely that more than ~100 per second of these will run due to the double queueing.
            // However, this throttle limit could theoretically be hit by e.g. integration tests that don't mock Location/History.
            this.p.taskQueue.queueTask(() => {
                // Don't try to restore state that might not have anything to do with the Aurelia app
                const state = isManagedState(e.state) ? e.state : null;
                const options = NavigationOptions.create({
                    ...this.options,
                    historyStrategy: 'replace',
                });
                const instructions = ViewportInstructionTree.create(e.url, options);
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
    stop() {
        this.locationMgr.stopListening();
        this.locationChangeSubscription?.dispose();
    }
    load(instructionOrInstructions, options) {
        const instructions = this.createViewportInstructions(instructionOrInstructions, options);
        this.logger.trace('load(instructions:%s)', instructions);
        return this.enqueue(instructions, 'api', null, null);
    }
    isActive(instructionOrInstructions, context) {
        const ctx = this.resolveContext(context);
        const instructions = this.createViewportInstructions(instructionOrInstructions, { context: ctx });
        this.logger.trace('isActive(instructions:%s,ctx:%s)', instructions, ctx);
        // TODO: incorporate potential context offset by `../` etc in the instructions
        return this.routeTree.contains(instructions);
    }
    /**
     * Retrieve the RouteContext, which contains statically configured routes combined with the customElement metadata associated with a type.
     *
     * The customElement metadata is lazily associated with a type via the RouteContext the first time `getOrCreate` is called.
     *
     * This API is also used for direct routing even when there is no configuration at all.
     *
     * @param viewportAgent - The ViewportAgent hosting the component associated with this RouteContext. If the RouteContext for the component+viewport combination already exists, the ViewportAgent will be updated in case it changed.
     * @param component - The custom element definition.
     * @param renderContext - The `controller.context` of the component hosting the viewport that the route will be loaded into.
     *
     */
    getRouteContext(viewportAgent, component, renderContext) {
        const logger = renderContext.get(ILogger).scopeTo('RouteContext');
        const routeDefinition = RouteDefinition.resolve(component.Type);
        let routeDefinitionLookup = this.vpaLookup.get(viewportAgent);
        if (routeDefinitionLookup === void 0) {
            this.vpaLookup.set(viewportAgent, routeDefinitionLookup = new WeakMap());
        }
        let routeContext = routeDefinitionLookup.get(routeDefinition);
        if (routeContext === void 0) {
            logger.trace(`creating new RouteContext for %s`, routeDefinition);
            const parent = renderContext.has(IRouteContext, true) ? renderContext.get(IRouteContext) : null;
            routeDefinitionLookup.set(routeDefinition, routeContext = new RouteContext(viewportAgent, parent, component, routeDefinition, renderContext));
        }
        else {
            logger.trace(`returning existing RouteContext for %s`, routeDefinition);
            if (viewportAgent !== null) {
                routeContext.vpa = viewportAgent;
            }
        }
        return routeContext;
    }
    createViewportInstructions(instructionOrInstructions, options) {
        return ViewportInstructionTree.create(instructionOrInstructions, this.getNavigationOptions(options));
    }
    /**
     * Enqueue an instruction tree to be processed as soon as possible.
     *
     * Will wait for any existing in-flight transition to finish, otherwise starts immediately.
     *
     * @param instructions - The instruction tree that determines the transition
     * @param trigger - `'popstate'` or `'hashchange'` if initiated by a browser event, or `'api'` for manually initiated transitions via the `load` api.
     * @param state - The state to restore, if any.
     * @param failedTr - If this is a redirect / fallback from a failed transition, the previous transition is passed forward to ensure the orinal promise resolves with the latest result.
     */
    enqueue(instructions, trigger, state, failedTr) {
        const lastTr = this.currentTr;
        if (trigger !== 'api' && lastTr.trigger === 'api' && lastTr.instructions.equals(instructions)) {
            // User-triggered navigation that results in `replaceState` with the same URL. The API call already triggered the navigation; event is ignored.
            this.logger.debug(`Ignoring navigation triggered by '%s' because it is the same URL as the previous navigation which was triggered by 'api'.`, trigger);
            return true;
        }
        let resolve = (void 0); // Need this initializer because TS doesn't know the promise executor will run synchronously
        let reject = (void 0);
        let promise;
        if (failedTr === null) {
            promise = new Promise(function ($resolve, $reject) { resolve = $resolve; reject = $reject; });
        }
        else {
            // Ensure that `await router.load` only resolves when the transition truly finished, so chain forward on top of
            // any previously failed transition that caused a recovering backwards navigation.
            this.logger.debug(`Reusing promise/resolve/reject from the previously failed transition %s`, failedTr);
            promise = failedTr.promise;
            resolve = failedTr.resolve;
            reject = failedTr.reject;
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
        this.logger.debug(`Scheduling transition: %s`, nextTr);
        if (this.activeNavigation === null) {
            // Catch any errors that might be thrown by `run` and reject the original promise which is awaited down below
            try {
                this.run(nextTr);
            }
            catch (err) {
                nextTr.handleError(err);
            }
        }
        return nextTr.promise.then(ret => {
            this.logger.debug(`Transition succeeded: %s`, nextTr);
            return ret;
        }).catch(err => {
            this.logger.error(`Navigation failed: %s`, nextTr, err);
            throw err;
        });
    }
    run(tr) {
        this.currentTr = tr;
        this.nextTr = null;
        // Clone it because the prevNavigation could have observers and stuff on it, and it's meant to be a standalone snapshot from here on.
        const prevNavigation = this.lastSuccessfulNavigation === null ? null : Navigation.create({
            ...this.lastSuccessfulNavigation,
            // There could be arbitrary state stored on a navigation, so to prevent memory leaks we only keep one `prevNavigation` around
            prevNavigation: null,
        });
        this.activeNavigation = Navigation.create({
            id: tr.id,
            instructions: tr.instructions,
            trigger: tr.trigger,
            options: tr.options,
            prevNavigation,
            finalInstructions: tr.finalInstructions,
        });
        const navigationContext = this.resolveContext(tr.options.context);
        const routeChanged = (!this.navigated ||
            tr.instructions.children.length !== navigationContext.node.children.length ||
            tr.instructions.children.some((x, i) => !(navigationContext.node.children[i]?.originalInstruction.equals(x) ?? false)));
        const shouldProcessRoute = routeChanged || tr.options.getSameUrlStrategy(this.instructions) === 'reload';
        if (!shouldProcessRoute) {
            this.logger.trace(`run(tr:%s) - NOT processing route`, tr);
            this.navigated = true;
            this.activeNavigation = null;
            tr.resolve(false);
            this.runNextTransition(tr);
            return;
        }
        this.logger.trace(`run(tr:%s) - processing route`, tr);
        this.events.publish(new NavigationStartEvent(tr.id, tr.instructions, tr.trigger, tr.managedState));
        // If user triggered a new transition in response to the NavigationStartEvent
        // (in which case `this.nextTransition` will NOT be null), we short-circuit here and go straight to processing the next one.
        if (this.nextTr !== null) {
            this.logger.debug(`run(tr:%s) - aborting because a new transition was queued in response to the NavigationStartEvent`, tr);
            return this.run(this.nextTr);
        }
        this.activeNavigation = Navigation.create({
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            ...this.activeNavigation,
            // After redirects are applied, this could be a different route
            finalInstructions: tr.finalInstructions,
        });
        // TODO: run global guards
        //
        //
        // ---
        tr.run(() => {
            this.logger.trace(`run() - compiling route tree: %s`, tr.finalInstructions);
            return updateRouteTree(tr.routeTree, tr.finalInstructions, navigationContext);
        }, () => {
            const prev = tr.previousRouteTree.root.children;
            const next = tr.routeTree.root.children;
            const all = mergeDistinct(prev, next);
            Batch.start(b => {
                this.logger.trace(`run() - invoking canUnload on ${prev.length} nodes`);
                for (const node of prev) {
                    node.context.vpa.canUnload(tr, b);
                }
            }).continueWith(b => {
                if (tr.guardsResult !== true) {
                    b.push(); // prevent the next step in the batch from running
                    this.cancelNavigation(tr);
                }
            }).continueWith(b => {
                this.logger.trace(`run() - invoking canLoad on ${next.length} nodes`);
                for (const node of next) {
                    node.context.vpa.canLoad(tr, b);
                }
            }).continueWith(b => {
                if (tr.guardsResult !== true) {
                    b.push();
                    this.cancelNavigation(tr);
                }
            }).continueWith(b => {
                this.logger.trace(`run() - invoking unload on ${prev.length} nodes`);
                for (const node of prev) {
                    node.context.vpa.unload(tr, b);
                }
            }).continueWith(b => {
                this.logger.trace(`run() - invoking load on ${next.length} nodes`);
                for (const node of next) {
                    node.context.vpa.load(tr, b);
                }
            }).continueWith(b => {
                this.logger.trace(`run() - invoking swap on ${all.length} nodes`);
                for (const node of all) {
                    node.context.vpa.swap(tr, b);
                }
            }).continueWith(() => {
                this.logger.trace(`run() - finalizing transition`);
                // order doesn't matter for this operation
                all.forEach(function (node) {
                    node.context.vpa.endTransition();
                });
                this.navigated = true;
                this.instructions = tr.finalInstructions = tr.routeTree.finalizeInstructions();
                this.events.publish(new NavigationEndEvent(tr.id, tr.instructions, this.instructions));
                this.lastSuccessfulNavigation = this.activeNavigation;
                this.activeNavigation = null;
                this.applyHistoryState(tr);
                tr.resolve(true);
                this.runNextTransition(tr);
            }).start();
        });
    }
    applyHistoryState(tr) {
        switch (tr.options.getHistoryStrategy(this.instructions)) {
            case 'none':
                // do nothing
                break;
            case 'push':
                this.locationMgr.pushState(toManagedState(tr.options.state, tr.id), this.getTitle(tr), tr.finalInstructions.toUrl());
                break;
            case 'replace':
                this.locationMgr.replaceState(toManagedState(tr.options.state, tr.id), this.getTitle(tr), tr.finalInstructions.toUrl());
                break;
        }
    }
    getTitle(tr) {
        switch (typeof tr.options.title) {
            case 'function':
                return tr.options.title.call(void 0, tr.routeTree.root) ?? '';
            case 'string':
                return tr.options.title;
            default:
                return tr.routeTree.root.getTitle(tr.options.titleSeparator) ?? '';
        }
    }
    cancelNavigation(tr) {
        this.logger.trace(`cancelNavigation(tr:%s)`, tr);
        const prev = tr.previousRouteTree.root.children;
        const next = tr.routeTree.root.children;
        const all = mergeDistinct(prev, next);
        // order doesn't matter for this operation
        all.forEach(function (node) {
            node.context.vpa.cancelUpdate();
        });
        this.activeNavigation = null;
        this.instructions = tr.prevInstructions;
        this._routeTree = tr.previousRouteTree;
        this.events.publish(new NavigationCancelEvent(tr.id, tr.instructions, `guardsResult is ${tr.guardsResult}`));
        if (tr.guardsResult === false) {
            tr.resolve(false);
            // In case a new navigation was requested in the meantime, immediately start processing it
            this.runNextTransition(tr);
        }
        else {
            void onResolve(this.enqueue(tr.guardsResult, 'api', tr.managedState, tr), () => {
                this.logger.trace(`cancelNavigation(tr:%s) - finished redirect`, tr);
            });
        }
    }
    runNextTransition(tr) {
        if (this.nextTr !== null) {
            this.logger.trace(`runNextTransition(tr:%s) -> scheduling nextTransition: %s`, tr, this.nextTr);
            this.p.taskQueue.queueTask(() => {
                // nextTransition is allowed to change up until the point when it's actually time to process it,
                // so we need to check it for null again when the scheduled task runs.
                const nextTr = this.nextTr;
                if (nextTr !== null) {
                    try {
                        this.run(nextTr);
                    }
                    catch (err) {
                        nextTr.handleError(err);
                    }
                }
            });
        }
    }
    getNavigationOptions(options) {
        return NavigationOptions.create({ ...this.options, ...options });
    }
};
Router = __decorate([
    __param(0, IContainer),
    __param(1, IPlatform),
    __param(2, ILogger),
    __param(3, IRouterEvents),
    __param(4, ILocationManager)
], Router);
export { Router };
//# sourceMappingURL=router.js.map