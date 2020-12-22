"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = exports.IRouter = void 0;
/* eslint-disable no-template-curly-in-string */
/* eslint-disable prefer-template */
/* eslint-disable max-lines-per-function */
const kernel_1 = require("@aurelia/kernel");
const runtime_html_1 = require("@aurelia/runtime-html");
const instruction_resolver_js_1 = require("./instruction-resolver.js");
const link_handler_js_1 = require("./link-handler.js");
const nav_js_1 = require("./nav.js");
const navigator_js_1 = require("./navigator.js");
const type_resolvers_js_1 = require("./type-resolvers.js");
const utils_js_1 = require("./utils.js");
const viewport_js_1 = require("./viewport.js");
const viewport_instruction_js_1 = require("./viewport-instruction.js");
const found_route_js_1 = require("./found-route.js");
const hook_manager_js_1 = require("./hook-manager.js");
const scope_js_1 = require("./scope.js");
const viewport_scope_js_1 = require("./viewport-scope.js");
const browser_viewer_store_js_1 = require("./browser-viewer-store.js");
const navigation_js_1 = require("./navigation.js");
const navigation_coordinator_js_1 = require("./navigation-coordinator.js");
const router_options_js_1 = require("./router-options.js");
const open_promise_js_1 = require("./open-promise.js");
// export type SwapStrategy = 'add-first-sequential' | 'add-first-parallel' | 'remove-first-sequential' | 'remove-first-parallel';
// export type RoutingHookIntegration = 'integrated' | 'separate';
// /**
//  * Public API
//  */
// export interface IRouterActivateOptions extends Omit<Partial<IRouterOptions>, 'title'> {
//   title?: string | IRouterTitle;
// }
// /**
//  * Public API
//  */
// export interface IRouterOptions extends INavigatorOptions {
//   separators?: IRouteSeparators;
//   useUrlFragmentHash: boolean;
//   useHref: boolean;
//   statefulHistoryLength: number;
//   useDirectRoutes: boolean;
//   useConfiguredRoutes: boolean;
//   additiveInstructionDefault: boolean;
//   title: ITitleConfiguration;
//   hooks?: IHookDefinition[];
//   reportCallback?(instruction: Navigation): void;
//   navigationSyncStates: NavigationState[];
//   swapStrategy: SwapStrategy;
//   routingHookIntegration: RoutingHookIntegration;
// }
// /**
//  * Public API
//  */
// export interface IRouterTitle extends Partial<ITitleConfiguration> { }
// /**
//  * Public API
//  */
// export interface ITitleConfiguration {
//   appTitle: string;
//   appTitleSeparator: string;
//   componentTitleOrder: 'top-down' | 'bottom-up';
//   componentTitleSeparator: string;
//   useComponentNames: boolean;
//   componentPrefix: string;
//   transformTitle?: (title: string, instruction: string | ViewportInstruction | FoundRoute) => string;
// }
/**
 * Public API
 */
exports.IRouter = kernel_1.DI.createInterface('IRouter', x => x.singleton(Router));
class ClosestViewportCustomElement {
}
/**
 * @internal
 */
class ClosestScope {
}
class Router {
    constructor(
    /**
     * @internal - Shouldn't be used directly.
     */
    container, 
    /**
     * @internal - Shouldn't be used directly.
     */
    navigator, navigation, 
    /**
     * @internal - Shouldn't be used directly.
     */
    linkHandler, 
    /**
     * @internal - Shouldn't be used directly. Probably.
     */
    instructionResolver, 
    /**
     * @internal - Shouldn't be used directly. Probably.
     */
    hookManager, options) {
        this.container = container;
        this.navigator = navigator;
        this.navigation = navigation;
        this.linkHandler = linkHandler;
        this.instructionResolver = instructionResolver;
        this.hookManager = hookManager;
        this.options = options;
        this.rootScope = null;
        /**
         * @internal
         */
        // public hookManager: HookManager;
        /**
         * @internal
         */
        this.navs = {};
        /**
         * Public API
         */
        this.activeComponents = [];
        /**
         * @internal
         */
        this.appendedInstructions = [];
        // /**
        //  * @internal
        //  */
        // public options: IRouterOptions = {
        //   useUrlFragmentHash: true,
        //   useHref: true,
        //   statefulHistoryLength: 0,
        //   useDirectRoutes: true,
        //   useConfiguredRoutes: true,
        //   additiveInstructionDefault: true,
        //   title: {
        //     appTitle: "${componentTitles}\${appTitleSeparator}Aurelia",
        //     appTitleSeparator: ' | ',
        //     componentTitleOrder: 'top-down',
        //     componentTitleSeparator: ' > ',
        //     useComponentNames: true,
        //     componentPrefix: 'app-',
        //   },
        //   swapStrategy: 'add-first-sequential',
        //   routingHookIntegration: 'integrated',
        //   navigationSyncStates: ['guardedUnload', 'swapped', 'completed'],
        // };
        this.processingNavigation = null;
        this.isActive = false;
        this.pendingConnects = new Map();
        this.loadedFirst = false;
        this.lastNavigation = null;
        this.staleChecks = {};
        // TODO: Switch this to use (probably) an event instead
        this.starters = [];
        /**
         * @internal
         */
        // TODO: use @bound and improve name (eslint-disable is temp)
        this.linkCallback = (info) => {
            let instruction = info.instruction || '';
            if (typeof instruction === 'string' && instruction.startsWith('#')) {
                instruction = instruction.slice(1);
                // '#' === '/' === '#/'
                if (!instruction.startsWith('/')) {
                    instruction = "/" + instruction;
                }
            }
            // Adds to Navigator's Queue, which makes sure it's serial
            this.load(instruction, { origin: info.anchor }).catch(error => { throw error; });
        };
        /**
         * @internal
         */
        // TODO: use @bound and improve name (eslint-disable is temp)
        this.navigatorCallback = (instruction) => {
            // Instructions extracted from queue, one at a time
            this.processNavigations(instruction).catch(error => { throw error; });
        };
        /**
         * @internal
         */
        // TODO: use @bound and improve name (eslint-disable is temp)
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
        /**
         * @internal
         */
        // TODO: use @bound and improve name (eslint-disable is temp)
        this.browserNavigatorCallback = (browserNavigationEvent) => {
            const entry = new navigation_js_1.Navigation(browserNavigationEvent.state?.currentEntry);
            entry.instruction = browserNavigationEvent.instruction;
            entry.fromBrowser = true;
            this.navigator.navigate(entry).catch(error => { throw error; });
        };
        /**
         * @internal
         */
        // TODO: use @bound and improve name (eslint-disable is temp)
        this.processNavigations = async (qInstruction) => {
            const instruction = this.processingNavigation = qInstruction;
            // console.log('pendingConnects', [...this.pendingConnects]);
            this.pendingConnects.clear();
            if (this.options.reportCallback) {
                this.options.reportCallback(instruction);
            }
            // let {
            //   fullStateInstruction,
            //   instructionNavigation,
            //   configuredRoute,
            //   configuredRoutePath,
            //   instructions,
            //   clearScopeOwners,
            //   clearViewportScopes,
            // }
            const coordinator = navigation_coordinator_js_1.NavigationCoordinator.create(this, instruction, { syncStates: this.options.navigationSyncStates });
            // const steps = [
            //   () => coordinator.syncState('loaded'),
            //   () => { console.log('SyncState loaded resolved!', steps); },
            //   () => coordinator.syncState('swapped'),
            //   () => { console.log('SyncState swapped resolved!', steps); },
            //   () => coordinator.syncState('left'),
            //   () => { console.log('SyncState left resolved!', steps); },
            // ];
            // run(...steps);
            // const loadedPromise = ;
            // if (loadedPromise !== void 0) {
            //   loadedPromise.then((value: any) => {
            //     console.log('SyncState loaded resolved!', value);
            //   });
            // }
            // console.log(instruction.instruction);
            // console.log(this.rootScope?.scope.toString(true));
            let transformedInstruction = typeof instruction.instruction === 'string' && !instruction.useFullStateInstruction
                ? await this.hookManager.invokeTransformFromUrl(instruction.instruction, this.processingNavigation)
                : instruction.instruction;
            // TODO: Review this
            if (transformedInstruction === '/') {
                transformedInstruction = '';
            }
            instruction.scope = instruction.scope ?? this.rootScope.scope;
            let configuredRoute = instruction.scope.findInstructions(transformedInstruction);
            let configuredRoutePath = null;
            // let configuredRoute = await this.findInstructions(
            //   this.rootScope!.scope,
            //   instruction.instruction,
            //   instruction.scope ?? this.rootScope!.scope,
            //   !instruction.useFullStateInstruction);
            if (instruction.instruction.length > 0 && !configuredRoute.foundConfiguration && !configuredRoute.foundInstructions) {
                // TODO: Do something here!
                this.unknownRoute(configuredRoute.remaining);
            }
            let instructions = configuredRoute.instructions;
            if (configuredRoute.foundConfiguration) {
                instruction.path = instruction.instruction.startsWith('/')
                    ? instruction.instruction.slice(1)
                    : instruction.instruction;
                configuredRoutePath = (configuredRoutePath ?? '') + configuredRoute.matching;
                this.rootScope.path = configuredRoutePath;
            }
            // TODO: Used to have an early exit if no instructions. Restore it?
            if (!this.options.additiveInstructionDefault &&
                instructions.length > 0 &&
                !this.instructionResolver.isAddAllViewportsInstruction(instructions[0]) &&
                !this.instructionResolver.isClearAllViewportsInstruction(instructions[0])) {
                const instr = this.createViewportInstruction(this.instructionResolver.clearViewportInstruction);
                instr.scope = instructions[0].scope;
                instructions.unshift(instr);
            }
            const clearScopeOwners = [];
            let clearViewportScopes = [];
            for (const clearInstruction of instructions.filter(instr => this.instructionResolver.isClearAllViewportsInstruction(instr))) {
                const scope = clearInstruction.scope || this.rootScope.scope;
                const scopes = scope.allScopes().filter(scope => !scope.owner.isEmpty).map(scope => scope.owner);
                // TODO: Tell Fred about the need for reverse
                // scopes.reverse();
                clearScopeOwners.push(...scopes);
                if (scope.viewportScope !== null && scope.viewportScope !== this.rootScope) {
                    clearViewportScopes.push(scope.viewportScope);
                }
            }
            instructions = instructions.filter(instr => !this.instructionResolver.isClearAllViewportsInstruction(instr));
            for (const addInstruction of instructions.filter(instr => this.instructionResolver.isAddAllViewportsInstruction(instr))) {
                addInstruction.setViewport((addInstruction.scope || this.rootScope.scope).viewportScope.name);
                addInstruction.scope = addInstruction.scope.owningScope;
            }
            for (const instr of instructions) {
                instr.topInstruction = true;
            }
            const updatedScopeOwners = [];
            const alreadyFoundInstructions = [];
            // TODO: Take care of cancellations down in subsets/iterations
            let { found: viewportInstructions, remaining: remainingInstructions } = this.findViewports(instructions, alreadyFoundInstructions);
            let guard = 100;
            do {
                if (!guard--) { // Guard against endless loop
                    const err = new Error(remainingInstructions.length + ' remaining instructions after 100 iterations; there is likely an infinite loop.');
                    err['remainingInstructions'] = remainingInstructions;
                    console.log('remainingInstructions', remainingInstructions);
                    throw err;
                }
                const changedScopeOwners = [];
                // TODO: Review whether this await poses a problem (it's currently necessary for new viewports to load)
                const hooked = await this.hookManager.invokeBeforeNavigation(viewportInstructions, instruction);
                if (hooked === false) {
                    coordinator.cancel();
                    return;
                    // return this.cancelNavigation([...changedScopeOwners, ...updatedScopeOwners], instruction);
                }
                else {
                    viewportInstructions = hooked;
                }
                for (const viewportInstruction of viewportInstructions) {
                    const scopeOwner = viewportInstruction.owner;
                    if (scopeOwner !== null) {
                        scopeOwner.path = configuredRoutePath;
                        const action = scopeOwner.setNextContent(viewportInstruction, instruction);
                        if (action !== 'skip') {
                            changedScopeOwners.push(scopeOwner);
                            coordinator.addEntity(scopeOwner);
                        }
                        const dontClear = [scopeOwner];
                        if (action === 'swap') {
                            dontClear.push(...scopeOwner.scope.allScopes(true, true).map(scope => scope.owner));
                        }
                        utils_js_1.arrayRemove(clearScopeOwners, value => dontClear.includes(value));
                        // arrayRemove(clearScopeOwners, value => value === scopeOwner);
                        if (!this.instructionResolver.isClearViewportInstruction(viewportInstruction)
                            && viewportInstruction.scope !== null
                            && viewportInstruction.scope.parent !== null
                            && viewportInstruction.scope.parent.isViewportScope) {
                            utils_js_1.arrayRemove(clearViewportScopes, value => value === viewportInstruction.scope.parent.viewportScope);
                        }
                    }
                }
                if (!this.isRestrictedNavigation) {
                    coordinator.finalEntity();
                }
                coordinator.run();
                // await coordinator.syncState('routed');
                // // eslint-disable-next-line no-await-in-loop
                // let results = await Promise.all(changedScopeOwners.map((scopeOwner) => scopeOwner.canUnload()));
                // if (results.some(result => result === false)) {
                //   return this.cancelNavigation([...changedScopeOwners, ...updatedScopeOwners], instruction);
                // }
                // // eslint-disable-next-line no-await-in-loop
                // results = await Promise.all(changedScopeOwners.map(async (scopeOwner) => {
                //   const canLoad = await scopeOwner.canLoad();
                //   if (typeof canLoad === 'boolean') {
                //     if (canLoad) {
                //       coordinator.addEntityState(scopeOwner, 'loaded');
                //       return scopeOwner.load();
                //     } else {
                //       return false;
                //     }
                //   }
                //   await this.load(canLoad, { append: true });
                //   await scopeOwner.abortContentChange();
                //   // TODO: Abort content change in the viewports
                //   return true;
                // }));
                // if (results.some(result => result === false)) {
                //   return this.cancelNavigation([...changedScopeOwners, ...updatedScopeOwners], qInstruction);
                // }
                for (const viewport of changedScopeOwners) {
                    if (updatedScopeOwners.every(scopeOwner => scopeOwner !== viewport)) {
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
                    let configured = new found_route_js_1.FoundRoute();
                    const routeScopeOwners = alreadyFoundInstructions
                        .filter(instr => instr.owner !== null && instr.owner.path === configuredRoutePath)
                        .map(instr => instr.owner)
                        .filter((value, index, arr) => arr.indexOf(value) === index);
                    // Need to await new viewports being bound
                    if (!this.isRestrictedNavigation) {
                        // await Promise.resolve();
                        // console.log('Awaiting swapped');
                        await coordinator.syncState('swapped');
                        // console.log('Awaited swapped');
                        // console.log('pendingConnects before find new', [...this.pendingConnects]);
                        // const pending = [...this.pendingConnects.values()].filter(connect => connect.isPending);
                        // if (pending.length > 0) {
                        //   console.log('Beginning await for ', pending.length);
                        //   await Promise.all(pending.map(connect => connect.promise));
                        //   console.log('Await done');
                        // }
                    }
                    for (const owner of routeScopeOwners) {
                        configured = owner.scope.findInstructions(configuredRoute.remaining);
                        // configured = await this.findInstructions(owner.scope, configuredRoute.remaining, owner.scope);
                        if (configured.foundConfiguration) {
                            break;
                        }
                    }
                    if (configured.foundInstructions) {
                        configuredRoute = configured;
                        configuredRoutePath = (configuredRoutePath ?? '') + "/" + configuredRoute.matching;
                    }
                    else {
                        // TODO: Do something here!
                        this.unknownRoute(configured.remaining);
                    }
                    this.appendInstructions(configured.instructions);
                }
                // Don't use defaults when it's a full state navigation
                if (instruction.useFullStateInstruction) {
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
                        utils_js_1.arrayRemove(viewportInstructions, value => value === existingFound);
                    }
                    if (existingRemaining !== void 0) {
                        utils_js_1.arrayRemove(remainingInstructions, value => value === existingRemaining);
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
                // await new Promise(res => setTimeout(res, 100));
            } while (viewportInstructions.length > 0 || remainingInstructions.length > 0);
            coordinator.finalEntity();
            // await Promise.all(updatedScopeOwners.map((value) => value.loadContent()));
            await coordinator.syncState('completed');
            coordinator.finalize();
            // updatedScopeOwners.forEach((viewport) => {
            //   viewport.finalizeContentChange();
            // });
            await this.replacePaths(instruction);
            // this.updateNav();
            // Remove history entry if no history viewports updated
            if (instruction.navigation.new && !instruction.navigation.first && !instruction.repeating && updatedScopeOwners.every(viewport => viewport.options.noHistory)) {
                instruction.untracked = true;
            }
            // updatedScopeOwners.forEach((viewport) => {
            //   viewport.finalizeContentChange();
            // });
            this.lastNavigation = this.processingNavigation;
            if (this.lastNavigation?.repeating ?? false) {
                this.lastNavigation.repeating = false;
            }
            this.processingNavigation = null;
            await this.navigator.finalize(instruction);
        };
        // this.hookManager = new HookManager();
    }
    /**
     * Public API
     */
    get isNavigating() {
        return this.processingNavigation !== null;
    }
    get isRestrictedNavigation() {
        const syncStates = this.options.navigationSyncStates;
        return syncStates.includes('guardedLoad') ||
            syncStates.includes('unloaded') ||
            syncStates.includes('loaded') ||
            syncStates.includes('guarded') ||
            syncStates.includes('routed');
    }
    /**
     * @internal
     */
    get statefulHistory() {
        return this.options.statefulHistoryLength !== void 0 && this.options.statefulHistoryLength > 0;
    }
    /**
     * Public API
     */
    start(options) {
        if (this.isActive) {
            throw new Error('Router has already been started');
        }
        this.isActive = true;
        options = options ?? {};
        const titleOptions = {
            ...this.options.title,
            ...(typeof options.title === 'string' ? { appTitle: options.title } : options.title),
        };
        options.title = titleOptions;
        const separatorOptions = {
            ...this.options.separators,
            ...options.separators ?? {},
        };
        options.separators = separatorOptions;
        Object.assign(this.options, options);
        if (this.options.hooks !== void 0) {
            this.addHooks(this.options.hooks);
        }
        this.instructionResolver.start({ separators: this.options.separators });
        this.navigator.start(this, {
            callback: this.navigatorCallback,
            store: this.navigation,
            statefulHistoryLength: this.options.statefulHistoryLength,
            serializeCallback: this.statefulHistory ? this.navigatorSerializeCallback : void 0,
        });
        this.linkHandler.start({ callback: this.linkCallback, useHref: this.options.useHref });
        this.navigation.start({
            callback: this.browserNavigatorCallback,
            useUrlFragmentHash: this.options.useUrlFragmentHash
        });
        this.ensureRootScope();
        // TODO: Switch this to use (probably) an event instead
        for (const starter of this.starters) {
            starter();
        }
    }
    /**
     * Public API
     */
    async loadUrl() {
        const entry = new navigation_js_1.Navigation({
            ...this.navigation.viewerState,
            ...{
                fullStateInstruction: '',
                replacing: true,
                fromBrowser: false,
            }
        });
        const result = this.navigator.navigate(entry);
        this.loadedFirst = true;
        return result;
    }
    /**
     * Public API
     */
    stop() {
        if (!this.isActive) {
            throw new Error('Router has not been started');
        }
        this.linkHandler.stop();
        this.navigator.stop();
        this.navigation.stop();
    }
    /**
     * @internal
     */
    findScope(origin) {
        // this.ensureRootScope();
        if (origin === void 0 || origin === null) {
            return this.rootScope.scope;
        }
        if (origin instanceof scope_js_1.Scope || origin instanceof viewport_js_1.Viewport) {
            return origin.scope;
        }
        return this.getClosestScope(origin) || this.rootScope.scope;
    }
    /**
     * @internal
     */
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
    /**
     * Public API - Get viewport by name
     */
    getViewport(name) {
        return this.allViewports().find(viewport => viewport.name === name) || null;
    }
    /**
     * Public API (not yet implemented)
     */
    addViewport(...args) {
        throw new Error('Not implemented');
    }
    /**
     * Public API (not yet implemented)
     */
    findViewportScope(...args) {
        throw new Error('Not implemented');
    }
    /**
     * Public API (not yet implemented)
     */
    addViewportScope(...args) {
        throw new Error('Not implemented');
    }
    /**
     * @internal - Called from the viewport scope custom element in created()
     */
    setClosestScope(viewModelOrContainer, scope) {
        const container = this.getContainer(viewModelOrContainer);
        kernel_1.Registration.instance(ClosestScope, scope).register(container);
    }
    /**
     * @internal
     */
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
    /**
     * @internal
     */
    unsetClosestScope(viewModelOrContainer) {
        const container = this.getContainer(viewModelOrContainer);
        // TODO: Get an 'unregister' on container
        container.resolvers.delete(ClosestScope);
    }
    /**
     * @internal - Called from the viewport custom element
     */
    connectViewport(viewport, connectedCE, name, options) {
        const parentScope = this.findParentScope(connectedCE.container);
        // console.log('Viewport parentScope', parentScope.toString(), (connectedCE as any).getClosestCustomElement());
        const parentViewportScope = (connectedCE.parentViewport?.viewport ?? this.rootScope).scope;
        if (parentScope !== parentViewportScope) {
            console.error('Viewport parentScope !== parentViewportScope', parentScope.toString(true), parentViewportScope.toString(true), connectedCE.getClosestCustomElement());
        }
        if (viewport === null) {
            viewport = parentScope.addViewport(name, connectedCE, options);
            this.setClosestScope(connectedCE.container, viewport.connectedScope);
            if (!this.isRestrictedNavigation) {
                this.pendingConnects.set(connectedCE, new open_promise_js_1.OpenPromise());
            }
        }
        else {
            this.pendingConnects.get(connectedCE)?.resolve();
        }
        return viewport;
    }
    /**
     * @internal - Called from the viewport custom element
     */
    disconnectViewport(viewport, connectedCE) {
        if (!viewport.connectedScope.parent.removeViewport(viewport, connectedCE)) {
            throw new Error("Failed to remove viewport: " + viewport.name);
        }
        this.unsetClosestScope(connectedCE.container);
    }
    /**
     * @internal - Called from the viewport scope custom element
     */
    connectViewportScope(viewportScope, connectedCE, name, options) {
        const parentScope = this.findParentScope(connectedCE.container);
        // console.log('ViewportScope parentScope', parentScope.toString(), (connectedCE as any).getClosestCustomElement());
        if (viewportScope === null) {
            viewportScope = parentScope.addViewportScope(name, connectedCE, options);
            this.setClosestScope(connectedCE.container, viewportScope.connectedScope);
        }
        return viewportScope;
    }
    /**
     * @internal - Called from the viewport scope custom element
     */
    disconnectViewportScope(viewportScope, connectedCE) {
        if (!viewportScope.connectedScope.parent.removeViewportScope(viewportScope)) {
            throw new Error("Failed to remove viewport scope: " + viewportScope.path);
        }
        this.unsetClosestScope(connectedCE.container);
    }
    allViewports(includeDisabled = false, includeReplaced = false) {
        // this.ensureRootScope();
        return this.rootScope.scope.allViewports(includeDisabled, includeReplaced);
    }
    /**
     * Public API - THE navigation API
     */
    async goto(instructions, options) {
        utils_js_1.deprecationWarning('"goto" method', '"load" method');
        return this.load(instructions, options);
    }
    async load(instructions, options) {
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
        ({ instructions, scope } = type_resolvers_js_1.NavigationInstructionResolver.createViewportInstructions(this, instructions, toOptions));
        if (options.append && this.processingNavigation) {
            instructions = type_resolvers_js_1.NavigationInstructionResolver.toViewportInstructions(this, instructions);
            this.appendInstructions(instructions, scope);
            // Can't return current navigation promise since it can lead to deadlock in load
            return Promise.resolve();
        }
        const entry = new navigation_js_1.Navigation({
            instruction: instructions,
            fullStateInstruction: '',
            scope: scope,
            title: options.title,
            data: options.data,
            query: options.query,
            replacing: options.replace,
            repeating: options.append,
            fromBrowser: false,
            origin: options.origin,
        });
        return this.navigator.navigate(entry);
    }
    /**
     * Public API
     */
    refresh() {
        return this.navigator.refresh();
    }
    /**
     * Public API
     */
    back() {
        return this.navigator.go(-1);
    }
    /**
     * Public API
     */
    forward() {
        return this.navigator.go(1);
    }
    /**
     * Public API
     */
    go(delta) {
        return this.navigator.go(delta);
    }
    /**
     * Public API
     */
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
    /**
     * Public API
     */
    setNav(name, routes, classes) {
        const nav = this.findNav(name);
        if (nav !== void 0 && nav !== null) {
            nav.routes = [];
        }
        this.addNav(name, routes, classes);
    }
    /**
     * Public API
     */
    addNav(name, routes, classes) {
        let nav = this.navs[name];
        if (nav === void 0 || nav === null) {
            nav = this.navs[name] = new nav_js_1.Nav(this, name, [], classes);
        }
        nav.addRoutes(routes);
        nav.update();
    }
    /**
     * Public API
     */
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
    /**
     * Public API
     */
    findNav(name) {
        return this.navs[name];
    }
    /**
     * Public API
     */
    addRoutes(routes, context) {
        // TODO: This should add to the context instead
        // TODO: Add routes without context to rootScope content (which needs to be created)?
        return [];
        // const viewport = (context !== void 0 ? this.closestViewport(context) : this.rootScope) || this.rootScope as Viewport;
        // return viewport.addRoutes(routes);
    }
    /**
     * Public API
     */
    removeRoutes(routes, context) {
        // TODO: This should remove from the context instead
        // const viewport = (context !== void 0 ? this.closestViewport(context) : this.rootScope) || this.rootScope as Viewport;
        // return viewport.removeRoutes(routes);
    }
    /**
     * Public API
     */
    addHooks(hooks) {
        return hooks.map(hook => this.addHook(hook.hook, hook.options));
    }
    addHook(hook, options) {
        return this.hookManager.addHook(hook, options);
    }
    /**
     * Public API
     */
    removeHooks(hooks) {
        return;
    }
    /**
     * Public API - The right way to create ViewportInstructions
     */
    createViewportInstruction(component, viewport, parameters, ownsScope = true, nextScopeInstructions = null) {
        return this.instructionResolver.createViewportInstruction(component, viewport, parameters, ownsScope, nextScopeInstructions);
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
            throw new Error("No matching configured route or component found for '" + route + "'");
        }
        else if (this.options.useConfiguredRoutes) {
            // TODO: Add missing/unknown route handling
            throw new Error("No matching configured route found for '" + route + "'");
        }
        else {
            // TODO: Add missing/unknown route handling
            throw new Error("No matching route/component found for '" + route + "'");
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
            const abort = viewport.abortContentChange();
            if (abort instanceof Promise) {
                abort.catch(error => { throw error; });
            }
        });
        await this.navigator.cancel(qInstruction);
        this.processingNavigation = null;
        qInstruction.resolve();
    }
    ensureRootScope() {
        if (!this.rootScope) {
            const root = this.container.get(runtime_html_1.IAppRoot);
            // root.config.component shouldn't be used in the end. Metadata will probably eliminate it
            this.rootScope = new viewport_scope_js_1.ViewportScope('rootScope', this, root.controller.viewModel, null, true, root.config.component);
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
        while (remaining.length > 0) {
            // Guard against endless loop
            if (guard-- === 0) {
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
        const query = (instruction.query && instruction.query.length ? "?" + instruction.query : '');
        // if (instruction.path === void 0 || instruction.path.length === 0 || instruction.path === '/') {
        instruction.path = state + query;
        // }
        const fullViewportStates = [this.createViewportInstruction(this.instructionResolver.clearViewportInstruction)];
        fullViewportStates.push(...this.instructionResolver.cloneViewportInstructions(instructions, this.statefulHistory));
        instruction.fullStateInstruction = fullViewportStates;
        if ((instruction.title ?? null) === null) {
            const title = await this.getTitle(instructions, instruction);
            if (title !== null) {
                instruction.title = title;
            }
        }
        return Promise.resolve();
    }
    async getTitle(instructions, instruction) {
        // First invoke with viewport instructions
        let title = await this.hookManager.invokeSetTitle(instructions, instruction);
        if (typeof title !== 'string') {
            // Hook didn't return a title, so run title logic
            const componentTitles = this.stringifyTitles(title, instruction);
            title = this.options.title.appTitle;
            title = title.replace("${componentTitles}", componentTitles);
            title = title.replace("${appTitleSeparator}", componentTitles !== ''
                ? this.options.title.appTitleSeparator
                : '');
        }
        // Invoke again with complete string
        title = await this.hookManager.invokeSetTitle(title, instruction);
        return title;
    }
    stringifyTitles(instructions, navigationInstruction) {
        const titles = instructions
            .map(instruction => this.stringifyTitle(instruction, navigationInstruction))
            .filter(instruction => (instruction?.length ?? 0) > 0);
        return titles.join(' + ');
    }
    stringifyTitle(instruction, navigationInstruction) {
        if (typeof instruction === 'string') {
            return this.resolveTitle(instruction, navigationInstruction);
        }
        const route = instruction.route ?? null;
        const nextInstructions = instruction.nextScopeInstructions;
        let stringified = '';
        // It's a configured route
        if (route !== null) {
            // Already added as part of a configuration, skip to next scope
            if (route === '') {
                return Array.isArray(nextInstructions)
                    ? this.stringifyTitles(nextInstructions, navigationInstruction)
                    : '';
            }
            else {
                stringified += this.resolveTitle(route, navigationInstruction);
            }
        }
        else {
            stringified += this.resolveTitle(instruction, navigationInstruction);
        }
        if (Array.isArray(nextInstructions) && nextInstructions.length > 0) {
            let nextStringified = this.stringifyTitles(nextInstructions, navigationInstruction);
            if (nextStringified.length > 0) {
                if (nextInstructions.length !== 1) { // TODO: This should really also check that the instructions have value
                    nextStringified = "[ " + nextStringified + " ]";
                }
                if (stringified.length > 0) {
                    stringified = this.options.title.componentTitleOrder === 'top-down'
                        ? stringified + this.options.title.componentTitleSeparator + nextStringified
                        : nextStringified + this.options.title.componentTitleSeparator + stringified;
                }
                else {
                    stringified = nextStringified;
                }
            }
        }
        return stringified;
    }
    resolveTitle(instruction, navigationInstruction) {
        let title = '';
        if (typeof instruction === 'string') {
            title = instruction;
        }
        else if (instruction instanceof viewport_instruction_js_1.ViewportInstruction) {
            return instruction.viewport.getTitle(navigationInstruction);
        }
        else if (instruction instanceof found_route_js_1.FoundRoute) {
            const routeTitle = instruction.match?.title;
            if (routeTitle !== void 0) {
                if (typeof routeTitle === 'string') {
                    title = routeTitle;
                }
                else {
                    title = routeTitle.call(instruction, instruction, navigationInstruction);
                }
            }
        }
        if (this.options.title.transformTitle !== void 0) {
            title = this.options.title.transformTitle.call(this, title, instruction);
        }
        return title;
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
        if (runtime_html_1.isRenderContext(viewModelOrContainer)) {
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
            const controller = kernel_1.Metadata.getOwn(runtime_html_1.CustomElement.name + ":" + nodeResourceName, cur)
                || kernel_1.Metadata.getOwn(runtime_html_1.CustomElement.name, cur);
            if (controller !== void 0) {
                return controller;
            }
            cur = runtime_html_1.getEffectiveParentNode(cur);
        }
        return (void 0);
    }
}
exports.Router = Router;
Router.inject = [kernel_1.IContainer, navigator_js_1.Navigator, browser_viewer_store_js_1.BrowserViewerStore, link_handler_js_1.LinkHandler, instruction_resolver_js_1.InstructionResolver, hook_manager_js_1.HookManager, router_options_js_1.RouterOptions];
//# sourceMappingURL=router.js.map