(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "@aurelia/runtime", "./browser-navigator", "./guardian", "./instruction-resolver", "./link-handler", "./nav", "./navigator", "./parser", "./route-table", "./type-resolvers", "./utils", "./viewport", "./viewport-instruction"], factory);
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
    const type_resolvers_1 = require("./type-resolvers");
    const utils_1 = require("./utils");
    const viewport_1 = require("./viewport");
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
            this.navs = {};
            this.activeComponents = [];
            this.addedViewports = [];
            this.options = {
                useHref: true,
                statefulHistoryLength: 0,
            };
            this.isActive = false;
            this.loadedFirst = false;
            this.processingNavigation = null;
            this.lastNavigation = null;
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
            this.navigatorCallback = (instruction) => {
                // Instructions extracted from queue, one at a time
                this.processNavigations(instruction).catch(error => { throw error; });
            };
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
                let instructions;
                let clearUsedViewports = fullStateInstruction;
                if (typeof instruction.instruction === 'string') {
                    let path = instruction.instruction;
                    let transformedInstruction = path;
                    if (this.options.transformFromUrl && !fullStateInstruction) {
                        transformedInstruction = this.options.transformFromUrl(path, this);
                    }
                    if (Array.isArray(transformedInstruction)) {
                        instructions = transformedInstruction;
                    }
                    else {
                        path = transformedInstruction;
                        // TODO: Review this
                        if (path === '/') {
                            path = '';
                        }
                        instructions = this.instructionResolver.parseViewportInstructions(path);
                        // TODO: Used to have an early exit if no instructions. Restore it?
                    }
                }
                else {
                    instructions = instruction.instruction;
                    // TODO: Used to have an early exit if no instructions. Restore it?
                }
                if (instructions.some(instr => this.instructionResolver.isClearAllViewportsInstruction(instr))) {
                    clearUsedViewports = true;
                    instructions = instructions.filter(instr => !this.instructionResolver.isClearAllViewportsInstruction(instr));
                }
                const parsedQuery = parser_1.parseQuery(instruction.query);
                instruction.parameters = parsedQuery.parameters;
                instruction.parameterList = parsedQuery.list;
                // TODO: Fetch title (probably when done)
                let clearViewports = (clearUsedViewports ? this.allViewports().filter((value) => value.content.componentInstance !== null) : []);
                const doneDefaultViewports = [];
                let defaultViewports = this.allViewports().filter(viewport => viewport.options.default
                    && viewport.content.componentInstance === null
                    && doneDefaultViewports.every(done => done !== viewport));
                const updatedViewports = [];
                for (const instr of instructions) {
                    if (instr.scope === null) {
                        instr.scope = this.rootScope;
                    }
                }
                const alreadyFoundInstructions = [];
                // TODO: Take care of cancellations down in subsets/iterations
                let { found: viewportInstructions, remaining: remainingInstructions } = this.findViewports(instructions, alreadyFoundInstructions);
                let guard = 100;
                while (viewportInstructions.length || remainingInstructions.length || defaultViewports.length || clearUsedViewports) {
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
                        if (viewport.setNextContent(viewportInstruction, instruction)) {
                            changedViewports.push(viewport);
                        }
                        utils_1.arrayRemove(clearViewports, value => value === viewport);
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
                        await this.goto(canEnter, { append: true });
                        await value.abortContentChange();
                        // TODO: Abort content change in the viewports
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
                    alreadyFoundInstructions.push(...viewportInstructions);
                    const remaining = this.findViewports(remainingInstructions, alreadyFoundInstructions);
                    viewportInstructions = [];
                    while (this.addedViewports.length > 0) {
                        const addedViewport = this.addedViewports.shift();
                        // TODO: Should this overwrite instead? I think so.
                        if (remaining.found.every(value => value.viewport !== addedViewport.viewport)) {
                            viewportInstructions.push(addedViewport);
                        }
                    }
                    viewportInstructions = [...viewportInstructions, ...remaining.found];
                    remainingInstructions = remaining.remaining;
                    defaultViewports = this.allViewports().filter(viewport => viewport.options.default
                        && viewport.content.componentInstance === null
                        && doneDefaultViewports.every(done => done !== viewport)
                        && updatedViewports.every(updated => updated !== viewport));
                    // clearViewports is empty if we're not clearing viewports
                    if (viewportInstructions.length === 0 &&
                        remainingInstructions.length === 0 &&
                        defaultViewports.length === 0) {
                        viewportInstructions = [
                            ...viewportInstructions,
                            ...clearViewports.map(viewport => new viewport_instruction_1.ViewportInstruction(this.instructionResolver.clearViewportInstruction, viewport))
                        ];
                        clearViewports = [];
                    }
                    // TODO: Do we still need this? What if no viewport at all?
                    // if (!this.allViewports().length) {
                    //   viewportsRemaining = false;
                    // }
                    clearUsedViewports = false;
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
                ...{
                    transformFromUrl: this.routeTransformer.transformFromUrl,
                    transformToUrl: this.routeTransformer.transformToUrl,
                }, ...options
            };
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
        findScope(element) {
            this.ensureRootScope();
            return this.closestScope(element);
        }
        // External API to get viewport by name
        getViewport(name) {
            return this.allViewports().find(viewport => viewport.name === name) || null;
        }
        // Called from the viewport custom element in attached()
        connectViewport(name, element, context, options) {
            kernel_1.Reporter.write(10000, 'Viewport added', name, element);
            const parentScope = this.findScope(element);
            const viewport = parentScope.addViewport(name, element, context, options);
            let parent = this.closestViewport(element);
            if (parent === viewport) {
                if (element.parentElement !== null) {
                    parent = this.closestViewport(element.parentElement);
                }
                else {
                    parent = null;
                }
            }
            if (parent !== null) {
                parent.addChild(viewport);
            }
            return viewport;
        }
        // Called from the viewport custom element
        disconnectViewport(viewport, element, context) {
            if (!viewport.owningScope.removeViewport(viewport, element, context)) {
                throw new Error(`Failed to remove viewport: ${viewport.name}`);
            }
        }
        allViewports(includeDisabled = false) {
            this.ensureRootScope();
            return this.rootScope.allViewports(includeDisabled);
        }
        goto(instructions, options) {
            options = options || {};
            // TODO: Review query extraction; different pos for path and fragment!
            if (typeof instructions === 'string' && !options.query) {
                const [path, search] = instructions.split('?');
                instructions = path;
                options.query = search;
            }
            if (typeof instructions !== 'string' || instructions !== this.instructionResolver.clearViewportInstruction) {
                let scope = null;
                if (options.origin) {
                    scope = this.closestScope(options.origin);
                    if (typeof instructions === 'string') {
                        // If it's not from scope root, figure out which scope
                        if (!instructions.startsWith('/')) {
                            // Scope modifications
                            if (instructions.startsWith('.')) {
                                // The same as no scope modification
                                if (instructions.startsWith('./')) {
                                    instructions = instructions.slice(2);
                                }
                                // Find out how many scopes upwards we should move
                                while (instructions.startsWith('../')) {
                                    scope = scope.parent || scope;
                                    instructions = instructions.slice(3);
                                }
                            }
                        }
                        else { // Specified root scope with /
                            scope = this.rootScope;
                        }
                    }
                    // TODO: Maybe deal with non-strings?
                }
                instructions = type_resolvers_1.NavigationInstructionResolver.toViewportInstructions(this, instructions);
                for (const instruction of instructions) {
                    if (instruction.scope === null) {
                        instruction.scope = scope;
                    }
                }
            }
            else {
                instructions = type_resolvers_1.NavigationInstructionResolver.toViewportInstructions(this, instructions);
            }
            if (options.append) {
                if (this.processingNavigation) {
                    this.addedViewports.push(...instructions);
                    // Can't return current navigation promise since it can lead to deadlock in enter
                    return Promise.resolve();
                }
                else {
                    // Can only append after first load has happened (defaults can fire too early)
                    if (!this.loadedFirst) {
                        return Promise.resolve();
                    }
                }
            }
            const entry = {
                instruction: instructions,
                fullStateInstruction: '',
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
        /**
         * Finds the closest ancestor viewport.
         *
         * @param element - The element to search upward from. The element is not searched.
         * @returns The Viewport that is the closest ancestor.
         */
        closestViewport(element) {
            let el = element;
            let $viewport = el.$viewport;
            while (!$viewport && el.parentElement) {
                el = el.parentElement;
                $viewport = el.$viewport;
            }
            // TODO: Always also check controllers and return the closest one
            if (el.$viewport) {
                return el.$viewport;
            }
            el = element;
            let controller = runtime_1.CustomElement.behaviorFor(el);
            while (!controller && el.parentElement) {
                el = el.parentElement;
                runtime_1.CustomElement.behaviorFor(el);
            }
            while (controller) {
                if (controller.host) {
                    const viewport = this.allViewports().find((item) => item.element === controller.host);
                    if (viewport) {
                        return viewport;
                    }
                }
                controller = controller.parent;
            }
            return null;
        }
        findViewports(instructions, alreadyFound, withoutViewports = false) {
            const found = [];
            const remaining = [];
            while (instructions.length) {
                const scope = instructions[0].scope;
                const { foundViewports, remainingInstructions } = scope.findViewports(instructions.filter(instruction => instruction.scope === scope), alreadyFound, withoutViewports);
                found.push(...foundViewports);
                remaining.push(...remainingInstructions);
                instructions = instructions.filter(instruction => instruction.scope !== scope);
            }
            return { found, remaining };
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
                this.rootScope = new viewport_1.Viewport(this, 'rootScope', root.host, root.controller.context, null, true);
            }
        }
        closestScope(element) {
            const viewport = this.closestViewport(element);
            if (viewport && (viewport.scope || viewport.owningScope)) {
                return viewport.scope || viewport.owningScope;
            }
            return this.rootScope;
        }
        replacePaths(instruction) {
            this.rootScope.reparentViewportInstructions();
            const viewports = this.rootScope.children.filter((viewport) => viewport.enabled && !viewport.content.content.isEmpty());
            let instructions = viewports.map(viewport => viewport.content.content);
            // TODO: Check if this is really necessary
            instructions = this.instructionResolver.cloneViewportInstructions(instructions, true);
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
            let state = this.instructionResolver.stringifyViewportInstructions(instructions, false, true);
            if (this.options.transformToUrl) {
                // TODO: Review this. Also, should it perhaps get full state?
                const routeOrInstructions = this.options.transformToUrl(this.instructionResolver.parseViewportInstructions(state), this);
                state = Array.isArray(routeOrInstructions) ? this.instructionResolver.stringifyViewportInstructions(routeOrInstructions) : routeOrInstructions;
            }
            const query = (instruction.query && instruction.query.length ? `?${instruction.query}` : '');
            instruction.path = state + query;
            const fullViewportStates = [new viewport_instruction_1.ViewportInstruction(this.instructionResolver.clearViewportInstruction)];
            fullViewportStates.push(...this.instructionResolver.cloneViewportInstructions(instructions, this.statefulHistory));
            instruction.fullStateInstruction = fullViewportStates;
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
    }
    exports.Router = Router;
    Router.inject = [kernel_1.IContainer, navigator_1.Navigator, browser_navigator_1.BrowserNavigator, exports.IRouteTransformer, link_handler_1.LinkHandler, instruction_resolver_1.InstructionResolver];
});
//# sourceMappingURL=router.js.map