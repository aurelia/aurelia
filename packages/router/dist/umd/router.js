(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "@aurelia/runtime", "./browser-navigator", "./guardian", "./instruction-resolver", "./link-handler", "./nav", "./navigator", "./parser", "./route-table", "./scope", "./utils", "./viewport-instruction"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    const browser_navigator_1 = require("./browser-navigator");
    const guardian_1 = require("./guardian");
    const instruction_resolver_1 = require("./instruction-resolver");
    const link_handler_1 = require("./link-handler");
    const nav_1 = require("./nav");
    const navigator_1 = require("./navigator");
    const parser_1 = require("./parser");
    const route_table_1 = require("./route-table");
    const scope_1 = require("./scope");
    const utils_1 = require("./utils");
    const viewport_instruction_1 = require("./viewport-instruction");
    exports.IRouteTransformer = kernel_1.DI.createInterface('IRouteTransformer').withDefault(x => x.singleton(route_table_1.RouteTable));
    exports.IRouter = kernel_1.DI.createInterface('IRouter').withDefault(x => x.singleton(Router));
    class Router {
        constructor(container, navigator, navigation, routeTransformer, linkHandler, instructionResolver) {
            this.container = container;
            this.navigator = navigator;
            this.navigation = navigation;
            this.routeTransformer = routeTransformer;
            this.linkHandler = linkHandler;
            this.instructionResolver = instructionResolver;
            this.rootScope = null;
            this.scopes = [];
            this.navs = {};
            this.activeComponents = [];
            this.addedViewports = [];
            this.options = {};
            this.isActive = false;
            this.processingNavigation = null;
            this.lastNavigation = null;
            this.linkCallback = (info) => {
                let href = info.href || '';
                if (href.startsWith('#')) {
                    href = href.slice(1);
                    // '#' === '/' === '#/'
                    if (!href.startsWith('/')) {
                        href = `/${href}`;
                    }
                }
                // If it's not from scope root, figure out which scope
                if (!href.startsWith('/')) {
                    let scope = this.closestScope(info.anchor);
                    // Scope modifications
                    if (href.startsWith('.')) {
                        // The same as no scope modification
                        if (href.startsWith('./')) {
                            href = href.slice(2);
                        }
                        // Find out how many scopes upwards we should move
                        while (href.startsWith('../')) {
                            scope = scope.parent || scope;
                            href = href.slice(3);
                        }
                    }
                    const context = scope.scopeContext();
                    href = this.instructionResolver.buildScopedLink(context, href);
                }
                // Adds to Navigator's Queue, which makes sure it's serial
                this.goto(href).catch(error => { throw error; });
            };
            this.navigatorCallback = (instruction) => {
                // Instructions extracted from queue, one at a time
                this.processNavigations(instruction).catch(error => { throw error; });
            };
            this.browserNavigatorCallback = (browserNavigationEvent) => {
                const entry = (browserNavigationEvent.state && browserNavigationEvent.state.currentEntry
                    ? browserNavigationEvent.state.currentEntry
                    : { instruction: '', fullStateInstruction: '' });
                entry.instruction = browserNavigationEvent.instruction;
                entry.fromBrowser = true;
                this.navigator.navigate(entry).catch(error => { throw error; });
            };
            this.processNavigations = async (qInstruction) => {
                const instruction = this.processingNavigation = qInstruction;
                if (this.options.reportCallback) {
                    this.options.reportCallback(instruction);
                }
                let fullStateInstruction = false;
                const instructionNavigation = instruction.navigation;
                if ((instructionNavigation.back || instructionNavigation.forward) && instruction.fullStateInstruction) {
                    fullStateInstruction = true;
                    // if (!confirm('Perform history navigation?')) {
                    //   this.navigator.cancel(instruction);
                    //   this.processingNavigation = null;
                    //   return Promise.resolve();
                    // }
                }
                let views;
                let clearViewports = false;
                if (typeof instruction.instruction === 'string') {
                    let path = instruction.instruction;
                    if (this.options.transformFromUrl && !fullStateInstruction) {
                        const routeOrInstructions = this.options.transformFromUrl(path, this);
                        // TODO: Don't go via string here, use instructions as they are
                        path = Array.isArray(routeOrInstructions) ? this.instructionResolver.stringifyViewportInstructions(routeOrInstructions) : routeOrInstructions;
                    }
                    // TODO: Review this
                    if (path === '/') {
                        path = '';
                    }
                    // TODO: Clean up clear viewports
                    const { clear, newPath } = this.instructionResolver.shouldClearViewports(path);
                    clearViewports = clear;
                    if (clearViewports) {
                        path = newPath;
                    }
                    views = this.instructionResolver.parseViewportInstructions(path);
                    // TODO: Used to have an early exit if no views. Restore it?
                }
                else {
                    views = instruction.instruction;
                    // TODO: Used to have an early exit if no views. Restore it?
                }
                const parsedQuery = parser_1.parseQuery(instruction.query);
                instruction.parameters = parsedQuery.parameters;
                instruction.parameterList = parsedQuery.list;
                // TODO: Fetch title (probably when done)
                const usedViewports = (clearViewports ? this.allViewports().filter((value) => value.content.componentInstance !== null) : []);
                const doneDefaultViewports = [];
                let defaultViewports = this.allViewports().filter(viewport => viewport.options.default
                    && viewport.content.componentInstance === null
                    && doneDefaultViewports.every(done => done !== viewport));
                const updatedViewports = [];
                // TODO: Take care of cancellations down in subsets/iterations
                let { viewportInstructions, viewportsRemaining } = this.rootScope.findViewports(views);
                let guard = 100;
                while (viewportInstructions.length || viewportsRemaining || defaultViewports.length || clearViewports) {
                    // Guard against endless loop
                    if (!guard--) {
                        throw kernel_1.Reporter.error(2002);
                    }
                    for (const defaultViewport of defaultViewports) {
                        doneDefaultViewports.push(defaultViewport);
                        if (viewportInstructions.every(value => value.viewport !== defaultViewport)) {
                            const defaultInstruction = this.instructionResolver.parseViewportInstruction(defaultViewport.options.default);
                            defaultInstruction.viewport = defaultViewport;
                            viewportInstructions.push(defaultInstruction);
                        }
                    }
                    const changedViewports = [];
                    const outcome = this.guardian.passes("before" /* Before */, viewportInstructions, instruction);
                    if (!outcome) {
                        return this.cancelNavigation([...changedViewports, ...updatedViewports], instruction);
                    }
                    if (typeof outcome !== 'boolean') {
                        viewportInstructions = outcome;
                    }
                    for (const viewportInstruction of viewportInstructions) {
                        const viewport = viewportInstruction.viewport;
                        const componentWithParameters = this.instructionResolver.stringifyViewportInstruction(viewportInstruction, true);
                        if (viewport.setNextContent(componentWithParameters, instruction)) {
                            changedViewports.push(viewport);
                        }
                        utils_1.arrayRemove(usedViewports, value => value === viewport);
                    }
                    // usedViewports is empty if we're not clearing viewports
                    for (const viewport of usedViewports) {
                        if (viewport.setNextContent(this.instructionResolver.clearViewportInstruction, instruction)) {
                            changedViewports.push(viewport);
                        }
                    }
                    let results = await Promise.all(changedViewports.map((value) => value.canLeave()));
                    if (results.some(result => result === false)) {
                        return this.cancelNavigation([...changedViewports, ...updatedViewports], instruction);
                    }
                    results = await Promise.all(changedViewports.map(async (value) => {
                        const canEnter = await value.canEnter();
                        if (typeof canEnter === 'boolean') {
                            if (canEnter) {
                                return value.enter();
                            }
                            else {
                                return false;
                            }
                        }
                        for (const viewportInstruction of canEnter) {
                            // TODO: Abort content change in the viewports
                            this.addProcessingViewport(viewportInstruction);
                        }
                        value.abortContentChange().catch(error => { throw error; });
                        return true;
                    }));
                    if (results.some(result => result === false)) {
                        return this.cancelNavigation([...changedViewports, ...updatedViewports], qInstruction);
                    }
                    for (const viewport of changedViewports) {
                        if (updatedViewports.every(value => value !== viewport)) {
                            updatedViewports.push(viewport);
                        }
                    }
                    // TODO: Fix multi level recursiveness!
                    const remaining = this.rootScope.findViewports();
                    viewportInstructions = [];
                    let addedViewport;
                    while (addedViewport = this.addedViewports.shift()) {
                        // TODO: Should this overwrite instead? I think so.
                        if (remaining.viewportInstructions.every(value => value.viewport !== addedViewport.viewport)) {
                            viewportInstructions.push(addedViewport);
                        }
                    }
                    viewportInstructions = [...viewportInstructions, ...remaining.viewportInstructions];
                    viewportsRemaining = remaining.viewportsRemaining;
                    defaultViewports = this.allViewports().filter(viewport => viewport.options.default
                        && viewport.content.componentInstance === null
                        && doneDefaultViewports.every(done => done !== viewport)
                        && updatedViewports.every(updated => updated !== viewport));
                    if (!this.allViewports().length) {
                        viewportsRemaining = false;
                    }
                    clearViewports = false;
                }
                await Promise.all(updatedViewports.map((value) => value.loadContent()));
                await this.replacePaths(instruction);
                this.updateNav();
                // Remove history entry if no history viewports updated
                if (instructionNavigation.new && !instructionNavigation.first && !instruction.repeating && updatedViewports.every(viewport => viewport.options.noHistory)) {
                    instruction.untracked = true;
                }
                updatedViewports.forEach((viewport) => {
                    viewport.finalizeContentChange();
                });
                this.lastNavigation = this.processingNavigation;
                if (this.lastNavigation.repeating) {
                    this.lastNavigation.repeating = false;
                }
                this.processingNavigation = null;
                await this.navigator.finalize(instruction);
            };
            this.guardian = new guardian_1.Guardian();
        }
        get isNavigating() {
            return this.processingNavigation !== null;
        }
        activate(options) {
            if (this.isActive) {
                throw new Error('Router has already been activated');
            }
            this.isActive = true;
            this.options = {
                ...{
                    transformFromUrl: this.routeTransformer.transformFromUrl,
                    transformToUrl: this.routeTransformer.transformToUrl,
                }, ...options
            };
            this.instructionResolver.activate({ separators: this.options.separators });
            this.navigator.activate({
                callback: this.navigatorCallback,
                store: this.navigation,
            });
            this.linkHandler.activate({ callback: this.linkCallback });
            this.navigation.activate({
                callback: this.browserNavigatorCallback,
                useUrlFragmentHash: this.options.useUrlFragmentHash
            });
        }
        loadUrl() {
            const entry = {
                ...this.navigation.viewerState,
                ...{
                    fullStateInstruction: '',
                    replacing: true,
                    fromBrowser: false,
                }
            };
            return this.navigator.navigate(entry);
        }
        deactivate() {
            if (!this.isActive) {
                throw new Error('Router has not been activated');
            }
            this.linkHandler.deactivate();
            this.navigator.deactivate();
            this.navigation.deactivate();
        }
        addProcessingViewport(componentOrInstruction, viewport, onlyIfProcessingStatus) {
            if (this.processingNavigation && (onlyIfProcessingStatus === undefined || onlyIfProcessingStatus)) {
                if (componentOrInstruction instanceof viewport_instruction_1.ViewportInstruction) {
                    if (!componentOrInstruction.viewport) {
                        // TODO: Deal with not yet existing viewports
                        componentOrInstruction.viewport = this.allViewports().find(vp => vp.name === componentOrInstruction.viewportName) || null;
                    }
                    this.addedViewports.push(componentOrInstruction);
                }
                else {
                    if (typeof viewport === 'string') {
                        // TODO: Deal with not yet existing viewports
                        viewport = this.allViewports().find(vp => vp.name === viewport);
                    }
                    this.addedViewports.push(new viewport_instruction_1.ViewportInstruction(componentOrInstruction, viewport));
                }
            }
            else if (this.lastNavigation && (onlyIfProcessingStatus === undefined || !onlyIfProcessingStatus)) {
                this.navigator.navigate({ instruction: '', fullStateInstruction: '', repeating: true }).catch(error => { throw error; });
                // Don't wait for the (possibly slow) navigation
            }
        }
        findScope(element) {
            this.ensureRootScope();
            return this.closestScope(element);
        }
        // External API to get viewport by name
        getViewport(name) {
            return this.allViewports().find(viewport => viewport.name === name) || null;
        }
        // Called from the viewport custom element in attached()
        addViewport(name, element, context, options) {
            kernel_1.Reporter.write(10000, 'Viewport added', name, element);
            const parentScope = this.findScope(element);
            return parentScope.addViewport(name, element, context, options);
        }
        // Called from the viewport custom element
        removeViewport(viewport, element, context) {
            // TODO: There's something hinky with remove!
            const scope = viewport.owningScope;
            if (!scope.removeViewport(viewport, element, context)) {
                this.removeScope(scope);
            }
        }
        allViewports() {
            this.ensureRootScope();
            return this.rootScope.allViewports();
        }
        removeScope(scope) {
            if (scope !== this.rootScope) {
                scope.removeScope();
                const index = this.scopes.indexOf(scope);
                if (index >= 0) {
                    this.scopes.splice(index, 1);
                }
            }
        }
        goto(pathOrViewports, title, data, replace = false) {
            const entry = {
                instruction: pathOrViewports,
                fullStateInstruction: '',
                title: title,
                data: data,
                fromBrowser: false,
            };
            if (typeof pathOrViewports === 'string') {
                const [path, search] = pathOrViewports.split('?');
                entry.instruction = path;
                entry.query = search;
            }
            entry.replacing = replace;
            return this.navigator.navigate(entry);
        }
        replace(pathOrViewports, title, data) {
            return this.goto(pathOrViewports, title, data, true);
        }
        refresh() {
            return this.navigator.refresh();
        }
        back() {
            return this.navigator.go(-1);
        }
        forward() {
            return this.navigator.go(1);
        }
        setNav(name, routes, classes) {
            const nav = this.findNav(name);
            if (nav) {
                nav.routes = [];
            }
            this.addNav(name, routes, classes);
        }
        addNav(name, routes, classes) {
            let nav = this.navs[name];
            if (!nav) {
                nav = this.navs[name] = new nav_1.Nav(this, name, [], classes);
            }
            nav.addRoutes(routes);
            nav.update();
        }
        updateNav(name) {
            const navs = name
                ? [name]
                : Object.keys(this.navs);
            for (const nav of navs) {
                if (this.navs[nav]) {
                    this.navs[nav].update();
                }
            }
        }
        findNav(name) {
            return this.navs[name];
        }
        async cancelNavigation(updatedViewports, qInstruction) {
            // TODO: Take care of disabling viewports when cancelling and stateful!
            updatedViewports.forEach((viewport) => {
                viewport.abortContentChange().catch(error => { throw error; });
            });
            await this.navigator.cancel(qInstruction);
            this.processingNavigation = null;
            qInstruction.resolve();
        }
        ensureRootScope() {
            if (!this.rootScope) {
                const root = this.container.get(runtime_1.Aurelia).root;
                this.rootScope = new scope_1.Scope(this, root.host, root.controller.context, null);
                this.scopes.push(this.rootScope);
            }
        }
        closestScope(element) {
            let el = element;
            while (!el.$controller && el.parentElement) {
                el = el.parentElement;
            }
            let controller = el.$controller;
            while (controller) {
                if (controller.host) {
                    const viewport = this.allViewports().find((item) => item.element === controller.host);
                    if (viewport && (viewport.scope || viewport.owningScope)) {
                        return viewport.scope || viewport.owningScope;
                    }
                }
                controller = controller.parent;
            }
            return this.rootScope;
            // let el = element;
            // while (el.parentElement) {
            //   const viewport = this.allViewports().find((item) => item.element === el);
            //   if (viewport && viewport.owningScope) {
            //     return viewport.owningScope;
            //   }
            //   el = el.parentElement;
            // }
            // return this.rootScope;
            // TODO: It would be better if it was something like this
            // const el = closestCustomElement(element);
            // let container: ChildContainer = el.$customElement.$context.get(IContainer);
            // while (container) {
            //   const scope = this.scopes.find((item) => item.context.get(IContainer) === container);
            //   if (scope) {
            //     return scope;
            //   }
            //   const viewport = this.allViewports().find((item) => item.context && item.context.get(IContainer) === container);
            //   if (viewport && viewport.owningScope) {
            //     return viewport.owningScope;
            //   }
            //   container = container.parent;
            // }
        }
        replacePaths(instruction) {
            this.activeComponents = this.rootScope.viewportStates(true, true);
            this.activeComponents = this.instructionResolver.removeStateDuplicates(this.activeComponents);
            let viewportStates = this.rootScope.viewportStates();
            viewportStates = this.instructionResolver.removeStateDuplicates(viewportStates);
            let state = this.instructionResolver.stateStringsToString(viewportStates);
            if (this.options.transformToUrl) {
                const routeOrInstructions = this.options.transformToUrl(this.instructionResolver.parseViewportInstructions(state), this);
                state = Array.isArray(routeOrInstructions) ? this.instructionResolver.stringifyViewportInstructions(routeOrInstructions) : routeOrInstructions;
            }
            let fullViewportStates = this.rootScope.viewportStates(true);
            fullViewportStates = this.instructionResolver.removeStateDuplicates(fullViewportStates);
            const query = (instruction.query && instruction.query.length ? `?${instruction.query}` : '');
            instruction.path = state + query;
            instruction.fullStateInstruction = this.instructionResolver.stateStringsToString(fullViewportStates, true) + query;
            return Promise.resolve();
        }
    }
    Router.inject = [kernel_1.IContainer, navigator_1.Navigator, browser_navigator_1.BrowserNavigator, exports.IRouteTransformer, link_handler_1.LinkHandler, instruction_resolver_1.InstructionResolver];
    exports.Router = Router;
});
//# sourceMappingURL=router.js.map