(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "@aurelia/runtime", "./instruction-resolver", "./link-handler", "./nav", "./navigator", "./type-resolvers", "./utils", "./viewport", "./found-route", "./hook-manager", "./scope", "./viewport-scope", "./browser-viewer-store"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /* eslint-disable max-lines-per-function */
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    const instruction_resolver_1 = require("./instruction-resolver");
    const link_handler_1 = require("./link-handler");
    const nav_1 = require("./nav");
    const navigator_1 = require("./navigator");
    const type_resolvers_1 = require("./type-resolvers");
    const utils_1 = require("./utils");
    const viewport_1 = require("./viewport");
    const found_route_1 = require("./found-route");
    const hook_manager_1 = require("./hook-manager");
    const scope_1 = require("./scope");
    const viewport_scope_1 = require("./viewport-scope");
    const browser_viewer_store_1 = require("./browser-viewer-store");
    class ClosestViewportCustomElement {
    }
    class ClosestScope {
    }
    exports.IRouter = kernel_1.DI.createInterface('IRouter').withDefault(x => x.singleton(Router));
    class Router {
        constructor(container, navigator, navigation, linkHandler, instructionResolver) {
            this.container = container;
            this.navigator = navigator;
            this.navigation = navigation;
            this.linkHandler = linkHandler;
            this.instructionResolver = instructionResolver;
            this.rootScope = null;
            this.navs = {};
            this.activeComponents = [];
            this.appendedInstructions = [];
            this.options = {
                useHref: true,
                statefulHistoryLength: 0,
                useDirectRoutes: true,
                useConfiguredRoutes: true,
            };
            this.isActive = false;
            this.loadedFirst = false;
            this.processingNavigation = null;
            this.lastNavigation = null;
            this.staleChecks = {};
            // TODO: use @bound and improve name (eslint-disable is temp)
            // eslint-disable-next-line @typescript-eslint/typedef
            this.linkCallback = (info) => {
                let instruction = info.instruction || '';
                if (typeof instruction === 'string' && instruction.startsWith('#')) {
                    instruction = instruction.slice(1);
                    // '#' === '/' === '#/'
                    if (!instruction.startsWith('/')) {
                        instruction = `/${instruction}`;
                    }
                }
                // Adds to Navigator's Queue, which makes sure it's serial
                this.goto(instruction, { origin: info.anchor }).catch(error => { throw error; });
            };
            // TODO: use @bound and improve name (eslint-disable is temp)
            // eslint-disable-next-line @typescript-eslint/typedef
            this.navigatorCallback = (instruction) => {
                // Instructions extracted from queue, one at a time
                this.processNavigations(instruction).catch(error => { throw error; });
            };
            // TODO: use @bound and improve name (eslint-disable is temp)
            // eslint-disable-next-line @typescript-eslint/typedef
            this.navigatorSerializeCallback = async (entry, preservedEntries) => {
                let excludeComponents = [];
                for (const preservedEntry of preservedEntries) {
                    if (typeof preservedEntry.instruction !== 'string') {
                        excludeComponents.push(...this.instructionResolver.flattenViewportInstructions(preservedEntry.instruction)
                            .filter(instruction => instruction.viewport !== null)
                            .map(instruction => instruction.componentInstance));
                    }
                    if (typeof preservedEntry.fullStateInstruction !== 'string') {
                        excludeComponents.push(...this.instructionResolver.flattenViewportInstructions(preservedEntry.fullStateInstruction)
                            .filter(instruction => instruction.viewport !== null)
                            .map(instruction => instruction.componentInstance));
                    }
                }
                excludeComponents = excludeComponents.filter((component, i, arr) => component !== null && arr.indexOf(component) === i);
                const serialized = { ...entry };
                let instructions = [];
                if (serialized.fullStateInstruction && typeof serialized.fullStateInstruction !== 'string') {
                    instructions.push(...serialized.fullStateInstruction);
                    serialized.fullStateInstruction = this.instructionResolver.stringifyViewportInstructions(serialized.fullStateInstruction);
                }
                if (serialized.instruction && typeof serialized.instruction !== 'string') {
                    instructions.push(...serialized.instruction);
                    serialized.instruction = this.instructionResolver.stringifyViewportInstructions(serialized.instruction);
                }
                instructions = instructions.filter((instruction, i, arr) => instruction !== null
                    && instruction.componentInstance !== null
                    && arr.indexOf(instruction) === i);
                const alreadyDone = [];
                for (const instruction of instructions) {
                    await this.freeComponents(instruction, excludeComponents, alreadyDone);
                }
                return serialized;
            };
            // TODO: use @bound and improve name (eslint-disable is temp)
            // eslint-disable-next-line @typescript-eslint/typedef
            this.browserNavigatorCallback = (browserNavigationEvent) => {
                const entry = (browserNavigationEvent.state && browserNavigationEvent.state.currentEntry
                    ? browserNavigationEvent.state.currentEntry
                    : { instruction: '', fullStateInstruction: '' });
                entry.instruction = browserNavigationEvent.instruction;
                entry.fromBrowser = true;
                this.navigator.navigate(entry).catch(error => { throw error; });
            };
            // TODO: use @bound and improve name (eslint-disable is temp)
            // eslint-disable-next-line @typescript-eslint/typedef
            this.processNavigations = async (qInstruction) => {
                const instruction = this.processingNavigation = qInstruction;
                if (this.options.reportCallback) {
                    this.options.reportCallback(instruction);
                }
                let fullStateInstruction = false;
                const instructionNavigation = instruction.navigation;
                if ((instructionNavigation.back || instructionNavigation.forward) && instruction.fullStateInstruction) {
                    fullStateInstruction = true;
                    // if (!confirm('Perform history navigation?')) { this.navigator.cancel(instruction); this.processingNavigation = null; return Promise.resolve(); }
                }
                let configuredRoute = await this.findInstructions(this.rootScope.scope, instruction.instruction, instruction.scope || this.rootScope.scope, !fullStateInstruction);
                let instructions = configuredRoute.instructions;
                let configuredRoutePath = null;
                if (instruction.instruction.length > 0 && !configuredRoute.foundConfiguration && !configuredRoute.foundInstructions) {
                    // TODO: Do something here!
                    this.unknownRoute(configuredRoute.remaining);
                }
                if (configuredRoute.foundConfiguration) {
                    instruction.path = instruction.instruction.startsWith('/')
                        ? instruction.instruction.slice(1) : instruction.instruction;
                    configuredRoutePath = `${configuredRoutePath || ''}${configuredRoute.matching}`;
                    this.rootScope.path = configuredRoutePath;
                }
                // TODO: Used to have an early exit if no instructions. Restore it?
                const clearScopeOwners = [];
                let clearViewportScopes = [];
                for (const clearInstruction of instructions.filter(instr => this.instructionResolver.isClearAllViewportsInstruction(instr))) {
                    const scope = clearInstruction.scope || this.rootScope.scope;
                    clearScopeOwners.push(...scope.children.filter(scope => !scope.owner.isEmpty).map(scope => scope.owner));
                    if (scope.viewportScope !== null) {
                        clearViewportScopes.push(scope.viewportScope);
                    }
                }
                instructions = instructions.filter(instr => !this.instructionResolver.isClearAllViewportsInstruction(instr));
                for (const addInstruction of instructions.filter(instr => this.instructionResolver.isAddAllViewportsInstruction(instr))) {
                    addInstruction.setViewport((addInstruction.scope || this.rootScope.scope).viewportScope.name);
                    addInstruction.scope = addInstruction.scope.owningScope;
                }
                const updatedScopeOwners = [];
                const alreadyFoundInstructions = [];
                // TODO: Take care of cancellations down in subsets/iterations
                let { found: viewportInstructions, remaining: remainingInstructions } = this.findViewports(instructions, alreadyFoundInstructions);
                let guard = 100;
                do {
                    if (!guard--) { // Guard against endless loop
                        console.log('remainingInstructions', remainingInstructions);
                        throw kernel_1.Reporter.error(2002);
                    }
                    const changedScopeOwners = [];
                    const hooked = await this.hookManager.invokeBeforeNavigation(viewportInstructions, instruction);
                    if (hooked === false) {
                        return this.cancelNavigation([...changedScopeOwners, ...updatedScopeOwners], instruction);
                    }
                    else {
                        viewportInstructions = hooked;
                    }
                    for (const viewportInstruction of viewportInstructions) {
                        const scopeOwner = viewportInstruction.owner;
                        if (scopeOwner !== null) {
                            scopeOwner.path = configuredRoutePath;
                            if (scopeOwner.setNextContent(viewportInstruction, instruction)) {
                                changedScopeOwners.push(scopeOwner);
                            }
                            utils_1.arrayRemove(clearScopeOwners, value => value === scopeOwner);
                            if (!this.instructionResolver.isClearViewportInstruction(viewportInstruction)
                                && viewportInstruction.scope !== null
                                && viewportInstruction.scope.parent !== null
                                && viewportInstruction.scope.parent.isViewportScope) {
                                utils_1.arrayRemove(clearViewportScopes, value => value === viewportInstruction.scope.parent.viewportScope);
                            }
                        }
                    }
                    let results = await Promise.all(changedScopeOwners.map((value) => value.canLeave()));
                    if (results.some(result => result === false)) {
                        return this.cancelNavigation([...changedScopeOwners, ...updatedScopeOwners], instruction);
                    }
                    results = await Promise.all(changedScopeOwners.map(async (value) => {
                        const canEnter = await value.canEnter();
                        if (typeof canEnter === 'boolean') {
                            if (canEnter) {
                                return value.enter();
                            }
                            else {
                                return false;
                            }
                        }
                        await this.goto(canEnter, { append: true });
                        await value.abortContentChange();
                        // TODO: Abort content change in the viewports
                        return true;
                    }));
                    if (results.some(result => result === false)) {
                        return this.cancelNavigation([...changedScopeOwners, ...updatedScopeOwners], qInstruction);
                    }
                    for (const viewport of changedScopeOwners) {
                        if (updatedScopeOwners.every(value => value !== viewport)) {
                            updatedScopeOwners.push(viewport);
                        }
                    }
                    // TODO: Fix multi level recursiveness!
                    alreadyFoundInstructions.push(...viewportInstructions);
                    ({ found: viewportInstructions, remaining: remainingInstructions } = this.findViewports(remainingInstructions, alreadyFoundInstructions));
                    // Look for configured child routes (once we've loaded everything so far?)
                    if (configuredRoute.hasRemaining &&
                        viewportInstructions.length === 0 &&
                        remainingInstructions.length === 0) {
                        let configured = new found_route_1.FoundRoute();
                        const routeScopeOwners = alreadyFoundInstructions
                            .filter(instr => instr.owner !== null && instr.owner.path === configuredRoutePath)
                            .map(instr => instr.owner)
                            .filter((value, index, arr) => arr.indexOf(value) === index);
                        for (const owner of routeScopeOwners) {
                            configured = await this.findInstructions(owner.scope, configuredRoute.remaining, owner.scope);
                            if (configured.foundConfiguration) {
                                break;
                            }
                        }
                        if (configured.foundInstructions) {
                            configuredRoute = configured;
                            configuredRoutePath = `${configuredRoutePath || ''}/${configuredRoute.matching}`;
                        }
                        else {
                            // TODO: Do something here!
                            this.unknownRoute(configured.remaining);
                        }
                        this.appendInstructions(configured.instructions);
                    }
                    // Don't use defaults when it's a full state navigation
                    if (fullStateInstruction) {
                        this.appendedInstructions = this.appendedInstructions.filter(instruction => !instruction.default);
                    }
                    // Process non-defaults first
                    let appendedInstructions = this.appendedInstructions.filter(instruction => !instruction.default);
                    this.appendedInstructions = this.appendedInstructions.filter(instruction => instruction.default);
                    if (appendedInstructions.length === 0) {
                        const index = this.appendedInstructions.findIndex(instruction => instruction.default);
                        if (index >= 0) {
                            appendedInstructions = this.appendedInstructions.splice(index, 1);
                        }
                    }
                    while (appendedInstructions.length > 0) {
                        const appendedInstruction = appendedInstructions.shift();
                        const existingAlreadyFound = alreadyFoundInstructions.some(instruction => instruction.sameViewport(appendedInstruction));
                        const existingFound = viewportInstructions.find(value => value.sameViewport(appendedInstruction));
                        const existingRemaining = remainingInstructions.find(value => value.sameViewport(appendedInstruction));
                        if (appendedInstruction.default &&
                            (existingAlreadyFound ||
                                (existingFound !== void 0 && !existingFound.default) ||
                                (existingRemaining !== void 0 && !existingRemaining.default))) {
                            continue;
                        }
                        if (existingFound !== void 0) {
                            utils_1.arrayRemove(viewportInstructions, value => value === existingFound);
                        }
                        if (existingRemaining !== void 0) {
                            utils_1.arrayRemove(remainingInstructions, value => value === existingRemaining);
                        }
                        if (appendedInstruction.viewport !== null) {
                            viewportInstructions.push(appendedInstruction);
                        }
                        else {
                            remainingInstructions.push(appendedInstruction);
                        }
                    }
                    if (viewportInstructions.length === 0 && remainingInstructions.length === 0) {
                        viewportInstructions = clearScopeOwners.map(owner => {
                            const instruction = this.createViewportInstruction(this.instructionResolver.clearViewportInstruction, owner.isViewport ? owner : void 0);
                            if (owner.isViewportScope) {
                                instruction.viewportScope = owner;
                            }
                            return instruction;
                        });
                        viewportInstructions.push(...clearViewportScopes.map(viewportScope => {
                            const instr = this.createViewportInstruction(this.instructionResolver.clearViewportInstruction);
                            instr.viewportScope = viewportScope;
                            return instr;
                        }));
                        clearViewportScopes = [];
                    }
                } while (viewportInstructions.length > 0 || remainingInstructions.length > 0);
                await Promise.all(updatedScopeOwners.map((value) => value.loadContent()));
                await this.replacePaths(instruction);
                // this.updateNav();
                // Remove history entry if no history viewports updated
                if (instructionNavigation.new && !instructionNavigation.first && !instruction.repeating && updatedScopeOwners.every(viewport => viewport.options.noHistory)) {
                    instruction.untracked = true;
                }
                updatedScopeOwners.forEach((viewport) => {
                    viewport.finalizeContentChange();
                });
                this.lastNavigation = this.processingNavigation;
                if (this.lastNavigation.repeating) {
                    this.lastNavigation.repeating = false;
                }
                this.processingNavigation = null;
                await this.navigator.finalize(instruction);
            };
            this.hookManager = new hook_manager_1.HookManager();
        }
        get isNavigating() {
            return this.processingNavigation !== null;
        }
        get statefulHistory() {
            return this.options.statefulHistoryLength !== void 0 && this.options.statefulHistoryLength > 0;
        }
        activate(options) {
            if (this.isActive) {
                throw new Error('Router has already been activated');
            }
            this.isActive = true;
            this.options = {
                ...this.options,
                ...options
            };
            if (this.options.hooks !== void 0) {
                this.addHooks(this.options.hooks);
            }
            this.instructionResolver.activate({ separators: this.options.separators });
            this.navigator.activate(this, {
                callback: this.navigatorCallback,
                store: this.navigation,
                statefulHistoryLength: this.options.statefulHistoryLength,
                serializeCallback: this.statefulHistory ? this.navigatorSerializeCallback : void 0,
            });
            this.linkHandler.activate({ callback: this.linkCallback, useHref: this.options.useHref });
            this.navigation.activate({
                callback: this.browserNavigatorCallback,
                useUrlFragmentHash: this.options.useUrlFragmentHash
            });
            this.ensureRootScope();
        }
        async loadUrl() {
            const entry = {
                ...this.navigation.viewerState,
                ...{
                    fullStateInstruction: '',
                    replacing: true,
                    fromBrowser: false,
                }
            };
            const result = this.navigator.navigate(entry);
            this.loadedFirst = true;
            return result;
        }
        deactivate() {
            if (!this.isActive) {
                throw new Error('Router has not been activated');
            }
            this.linkHandler.deactivate();
            this.navigator.deactivate();
            this.navigation.deactivate();
        }
        findScope(origin) {
            // this.ensureRootScope();
            if (origin === void 0 || origin === null) {
                return this.rootScope.scope;
            }
            if (origin instanceof scope_1.Scope || origin instanceof viewport_1.Viewport) {
                return origin.scope;
            }
            return this.getClosestScope(origin) || this.rootScope.scope;
        }
        findParentScope(container) {
            if (container === null) {
                return this.rootScope.scope;
            }
            // Already (prematurely) set on this view model so get it from container's parent instead
            if (container.has(ClosestScope, false)) {
                container = container.parent;
                if (container === null) {
                    return this.rootScope.scope;
                }
            }
            if (container.has(ClosestScope, true)) {
                return container.get(ClosestScope);
            }
            return this.rootScope.scope;
        }
        // External API to get viewport by name
        getViewport(name) {
            return this.allViewports().find(viewport => viewport.name === name) || null;
        }
        // Called from the viewport scope custom element in created()
        setClosestScope(viewModelOrContainer, scope) {
            const container = this.getContainer(viewModelOrContainer);
            kernel_1.Registration.instance(ClosestScope, scope).register(container);
        }
        getClosestScope(viewModelOrElement) {
            const container = 'resourceResolvers' in viewModelOrElement
                ? viewModelOrElement
                : this.getClosestContainer(viewModelOrElement);
            if (container === null) {
                return null;
            }
            if (!container.has(ClosestScope, true)) {
                return null;
            }
            return container.get(ClosestScope) || null;
        }
        unsetClosestScope(viewModelOrContainer) {
            const container = this.getContainer(viewModelOrContainer);
            // TODO: Get an 'unregister' on container
            container.resolvers.delete(ClosestScope);
        }
        // Called from the viewport custom element in attached()
        connectViewport(viewport, container, name, element, options) {
            const parentScope = this.findParentScope(container);
            if (viewport === null) {
                viewport = parentScope.addViewport(name, element, container, options);
                this.setClosestScope(container, viewport.connectedScope);
            }
            return viewport;
        }
        // Called from the viewport custom element
        disconnectViewport(viewport, container, element) {
            if (!viewport.connectedScope.parent.removeViewport(viewport, element, container)) {
                throw new Error(`Failed to remove viewport: ${viewport.name}`);
            }
            this.unsetClosestScope(container);
        }
        // Called from the viewport scope custom element in attached()
        connectViewportScope(viewportScope, name, container, element, options) {
            const parentScope = this.findParentScope(container);
            if (viewportScope === null) {
                viewportScope = parentScope.addViewportScope(name, element, options);
                this.setClosestScope(container, viewportScope.connectedScope);
            }
            return viewportScope;
        }
        // Called from the viewport scope custom element
        disconnectViewportScope(viewportScope, container) {
            if (!viewportScope.connectedScope.parent.removeViewportScope(viewportScope)) {
                throw new Error(`Failed to remove viewport scope: ${viewportScope.path}`);
            }
            this.unsetClosestScope(container);
        }
        allViewports(includeDisabled = false, includeReplaced = false) {
            // this.ensureRootScope();
            return this.rootScope.scope.allViewports(includeDisabled, includeReplaced);
        }
        goto(instructions, options) {
            options = options || {};
            // TODO: Review query extraction; different pos for path and fragment!
            if (typeof instructions === 'string' && !options.query) {
                const [path, search] = instructions.split('?');
                instructions = path;
                options.query = search;
            }
            const toOptions = {};
            if (options.origin) {
                toOptions.context = options.origin;
            }
            let scope = null;
            ({ instructions, scope } = type_resolvers_1.NavigationInstructionResolver.createViewportInstructions(this, instructions, toOptions));
            if (options.append && this.processingNavigation) {
                instructions = type_resolvers_1.NavigationInstructionResolver.toViewportInstructions(this, instructions);
                this.appendInstructions(instructions, scope);
                // Can't return current navigation promise since it can lead to deadlock in enter
                return Promise.resolve();
            }
            const entry = {
                instruction: instructions,
                fullStateInstruction: '',
                scope: scope,
                title: options.title,
                data: options.data,
                query: options.query,
                replacing: options.replace,
                repeating: options.append,
                fromBrowser: false,
            };
            return this.navigator.navigate(entry);
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
        checkActive(instructions) {
            for (const instruction of instructions) {
                const scopeInstructions = this.instructionResolver.matchScope(this.activeComponents, instruction.scope);
                const matching = scopeInstructions.filter(instr => instr.sameComponent(instruction, true));
                if (matching.length === 0) {
                    return false;
                }
                if (Array.isArray(instruction.nextScopeInstructions)
                    && instruction.nextScopeInstructions.length > 0
                    && this.instructionResolver.matchChildren(instruction.nextScopeInstructions, matching.map(instr => Array.isArray(instr.nextScopeInstructions) ? instr.nextScopeInstructions : []).flat()) === false) {
                    return false;
                }
            }
            return true;
        }
        setNav(name, routes, classes) {
            const nav = this.findNav(name);
            if (nav !== void 0 && nav !== null) {
                nav.routes = [];
            }
            this.addNav(name, routes, classes);
        }
        addNav(name, routes, classes) {
            let nav = this.navs[name];
            if (nav === void 0 || nav === null) {
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
                if (this.navs[nav] !== void 0 && this.navs[nav] !== null) {
                    this.navs[nav].update();
                }
            }
        }
        findNav(name) {
            return this.navs[name];
        }
        addRoutes(routes, context) {
            // TODO: This should add to the context instead
            // TODO: Add routes without context to rootScope content (which needs to be created)?
            return [];
            // const viewport = (context !== void 0 ? this.closestViewport(context) : this.rootScope) || this.rootScope as Viewport;
            // return viewport.addRoutes(routes);
        }
        removeRoutes(routes, context) {
            // TODO: This should remove from the context instead
            // const viewport = (context !== void 0 ? this.closestViewport(context) : this.rootScope) || this.rootScope as Viewport;
            // return viewport.removeRoutes(routes);
        }
        addHooks(hooks) {
            return hooks.map(hook => this.addHook(hook.hook, hook.options));
        }
        addHook(hook, options) {
            return this.hookManager.addHook(hook, options);
        }
        removeHooks(hooks) {
            return;
        }
        createViewportInstruction(component, viewport, parameters, ownsScope = true, nextScopeInstructions = null) {
            return this.instructionResolver.createViewportInstruction(component, viewport, parameters, ownsScope, nextScopeInstructions);
        }
        async findInstructions(scope, instruction, instructionScope, transformUrl = false) {
            let route = new found_route_1.FoundRoute();
            if (typeof instruction === 'string') {
                instruction = transformUrl
                    ? await this.hookManager.invokeTransformFromUrl(instruction, this.processingNavigation)
                    : instruction;
                if (Array.isArray(instruction)) {
                    route.instructions = instruction;
                }
                else {
                    // TODO: Review this
                    if (instruction === '/') {
                        instruction = '';
                    }
                    const instructions = this.instructionResolver.parseViewportInstructions(instruction);
                    if (this.options.useConfiguredRoutes && !this.hasSiblingInstructions(instructions)) {
                        const foundRoute = scope.findMatchingRoute(instruction);
                        if (foundRoute !== null && foundRoute.foundConfiguration) {
                            route = foundRoute;
                        }
                        else {
                            if (this.options.useDirectRoutes) {
                                route.instructions = instructions;
                                if (route.instructions.length > 0) {
                                    const nextInstructions = route.instructions[0].nextScopeInstructions || [];
                                    route.remaining = this.instructionResolver.stringifyViewportInstructions(nextInstructions);
                                    route.instructions[0].nextScopeInstructions = null;
                                }
                            }
                        }
                    }
                    else if (this.options.useDirectRoutes) {
                        route.instructions = instructions;
                    }
                }
            }
            else {
                route.instructions = instruction;
            }
            for (const instr of route.instructions) {
                if (instr.scope === null) {
                    instr.scope = instructionScope;
                }
            }
            return route;
        }
        hasSiblingInstructions(instructions) {
            if (instructions === null) {
                return false;
            }
            if (instructions.length > 1) {
                return true;
            }
            return instructions.some(instruction => this.hasSiblingInstructions(instruction.nextScopeInstructions));
        }
        appendInstructions(instructions, scope = null) {
            if (scope === null) {
                scope = this.rootScope.scope;
            }
            for (const instruction of instructions) {
                if (instruction.scope === null) {
                    instruction.scope = scope;
                }
            }
            this.appendedInstructions.push(...instructions);
        }
        checkStale(name, instructions) {
            const staleCheck = this.staleChecks[name];
            if (staleCheck === void 0) {
                this.staleChecks[name] = instructions.slice();
                return false;
            }
            if (staleCheck.length !== instructions.length) {
                this.staleChecks[name] = instructions.slice();
                return false;
            }
            for (let i = 0, ii = instructions.length; i < ii; i++) {
                if (staleCheck[i] !== instructions[i]) {
                    this.staleChecks[name] = instructions.slice();
                    return false;
                }
            }
            return true;
        }
        unknownRoute(route) {
            if (typeof route !== 'string' || route.length === 0) {
                return;
            }
            if (this.options.useConfiguredRoutes && this.options.useDirectRoutes) {
                // TODO: Add missing/unknown route handling
                throw new Error(`No matching configured route or component found for '${route}'`);
            }
            else if (this.options.useConfiguredRoutes) {
                // TODO: Add missing/unknown route handling
                throw new Error(`No matching configured route found for '${route}'`);
            }
            else {
                // TODO: Add missing/unknown route handling
                throw new Error(`No matching route/component found for '${route}'`);
            }
        }
        findViewports(instructions, alreadyFound, withoutViewports = false) {
            const found = [];
            const remaining = [];
            while (instructions.length) {
                if (instructions[0].scope === null) {
                    instructions[0].scope = this.rootScope.scope;
                }
                const scope = instructions[0].scope;
                const { foundViewports, remainingInstructions } = scope.findViewports(instructions.filter(instruction => instruction.scope === scope), alreadyFound, withoutViewports);
                found.push(...foundViewports);
                remaining.push(...remainingInstructions);
                instructions = instructions.filter(instruction => instruction.scope !== scope);
            }
            return { found: found.slice(), remaining };
        }
        async cancelNavigation(updatedScopeOwners, qInstruction) {
            // TODO: Take care of disabling viewports when cancelling and stateful!
            updatedScopeOwners.forEach((viewport) => {
                viewport.abortContentChange().catch(error => { throw error; });
            });
            await this.navigator.cancel(qInstruction);
            this.processingNavigation = null;
            qInstruction.resolve();
        }
        ensureRootScope() {
            if (!this.rootScope) {
                const root = this.container.get(runtime_1.Aurelia).root;
                // root.config.component shouldn't be used in the end. Metadata will probably eliminate it
                this.rootScope = new viewport_scope_1.ViewportScope('rootScope', this, root.config.host, null, true, root.config.component);
            }
            return this.rootScope;
        }
        async replacePaths(instruction) {
            this.rootScope.scope.reparentViewportInstructions();
            let instructions = this.rootScope.scope.hoistedChildren
                .filter(scope => scope.viewportInstruction !== null && !scope.viewportInstruction.isEmpty())
                .map(scope => scope.viewportInstruction);
            instructions = this.instructionResolver.cloneViewportInstructions(instructions, true);
            // The following makes sure right viewport/viewport scopes are set and update
            // whether viewport name is necessary or not
            const alreadyFound = [];
            let { found, remaining } = this.findViewports(instructions, alreadyFound, true);
            let guard = 100;
            while (remaining.length) {
                // Guard against endless loop
                if (!guard--) {
                    throw new Error('Failed to find viewport when updating viewer paths.');
                }
                alreadyFound.push(...found);
                ({ found, remaining } = this.findViewports(remaining, alreadyFound, true));
            }
            this.activeComponents = instructions;
            this.activeRoute = instruction.route;
            // First invoke with viewport instructions (should it perhaps get full state?)
            let state = await this.hookManager.invokeTransformToUrl(instructions, instruction);
            if (typeof state !== 'string') {
                // Convert to string if necessary
                state = this.instructionResolver.stringifyViewportInstructions(state, false, true);
            }
            // Invoke again with string
            state = await this.hookManager.invokeTransformToUrl(state, instruction);
            const query = (instruction.query && instruction.query.length ? `?${instruction.query}` : '');
            // if (instruction.path === void 0 || instruction.path.length === 0 || instruction.path === '/') {
            instruction.path = state + query;
            // }
            const fullViewportStates = [this.createViewportInstruction(this.instructionResolver.clearViewportInstruction)];
            fullViewportStates.push(...this.instructionResolver.cloneViewportInstructions(instructions, this.statefulHistory));
            instruction.fullStateInstruction = fullViewportStates;
            // TODO: Fetch and update title
            return Promise.resolve();
        }
        async freeComponents(instruction, excludeComponents, alreadyDone) {
            const component = instruction.componentInstance;
            const viewport = instruction.viewport;
            if (component === null || viewport === null || alreadyDone.some(done => done === component)) {
                return;
            }
            if (!excludeComponents.some(exclude => exclude === component)) {
                await viewport.freeContent(component);
                alreadyDone.push(component);
                return;
            }
            if (instruction.nextScopeInstructions !== null) {
                for (const nextInstruction of instruction.nextScopeInstructions) {
                    await this.freeComponents(nextInstruction, excludeComponents, alreadyDone);
                }
            }
        }
        getClosestContainer(viewModelOrElement) {
            if ('context' in viewModelOrElement) {
                return viewModelOrElement.context;
            }
            if ('$controller' in viewModelOrElement) {
                return viewModelOrElement.$controller.context;
            }
            const controller = this.CustomElementFor(viewModelOrElement);
            if (controller === void 0) {
                return null;
            }
            return controller.context;
        }
        getContainer(viewModelOrContainer) {
            if ('resourceResolvers' in viewModelOrContainer) {
                return viewModelOrContainer;
            }
            if (runtime_1.isRenderContext(viewModelOrContainer)) {
                return viewModelOrContainer.get(kernel_1.IContainer);
            }
            if ('$controller' in viewModelOrContainer) {
                return viewModelOrContainer.$controller.context.get(kernel_1.IContainer);
            }
            return null;
        }
        // TODO: This is probably wrong since it caused test fails when in CustomElement.for
        // Fred probably knows and will need to look at it
        // This can most likely also be changed so that the node traversal isn't necessary
        CustomElementFor(node) {
            let cur = node;
            while (cur !== null) {
                const nodeResourceName = cur.nodeName.toLowerCase();
                const controller = kernel_1.Metadata.getOwn(`${runtime_1.CustomElement.name}:${nodeResourceName}`, cur)
                    || kernel_1.Metadata.getOwn(runtime_1.CustomElement.name, cur);
                if (controller !== void 0) {
                    return controller;
                }
                cur = runtime_1.DOM.getEffectiveParentNode(cur);
            }
            return (void 0);
        }
    }
    exports.Router = Router;
    Router.inject = [kernel_1.IContainer, navigator_1.Navigator, browser_viewer_store_1.BrowserViewerStore, link_handler_1.LinkHandler, instruction_resolver_1.InstructionResolver];
});
//# sourceMappingURL=router.js.map