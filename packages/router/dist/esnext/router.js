import { DI, IContainer, Reporter } from '@aurelia/kernel';
import { Aurelia } from '@aurelia/runtime';
import { BrowserNavigation } from './browser-navigation';
import { InstructionResolver } from './instruction-resolver';
import { LinkHandler } from './link-handler';
import { Nav } from './nav';
import { Navigator } from './navigator';
import { parseQuery } from './parser';
import { RouteTable } from './route-table';
import { Scope } from './scope';
import { arrayRemove } from './utils';
import { ViewportInstruction } from './viewport-instruction';
export const IRouteTransformer = DI.createInterface('IRouteTransformer').withDefault(x => x.singleton(RouteTable));
export const IRouter = DI.createInterface('IRouter').withDefault(x => x.singleton(Router));
export class Router {
    constructor(container, navigator, navigation, routeTransformer, linkHandler, instructionResolver) {
        this.scopes = [];
        this.navs = {};
        this.activeComponents = [];
        this.addedViewports = [];
        this.isActive = false;
        this.processingNavigation = null;
        this.lastNavigation = null;
        this.linkCallback = (info) => {
            let href = info.href;
            if (href.startsWith('#')) {
                href = href.substring(1);
            }
            if (!href.startsWith('/')) {
                const scope = this.closestScope(info.anchor);
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
        this.navigationCallback = (navigation) => {
            const entry = (navigation.state && navigation.state.NavigationEntry ? navigation.state.NavigationEntry : { instruction: null, fullStateInstruction: null });
            entry.instruction = navigation.instruction;
            entry.fromBrowser = true;
            this.navigator.navigate(entry).catch(error => { throw error; });
        };
        this.processNavigations = async (qInstruction) => {
            const instruction = this.processingNavigation = qInstruction;
            if (this.options.reportCallback) {
                this.options.reportCallback(instruction);
            }
            let fullStateInstruction = false;
            if ((instruction.navigation.back || instruction.navigation.forward) && instruction.fullStateInstruction) {
                fullStateInstruction = true;
                // tslint:disable-next-line:no-commented-code
                // if (!confirm('Perform history navigation?')) {
                //   this.navigator.cancel(instruction);
                //   this.processingNavigation = null;
                //   return Promise.resolve();
                // }
            }
            let views;
            let clearViewports;
            if (typeof instruction.instruction === 'string') {
                let path = instruction.instruction;
                if (this.options.transformFromUrl && !fullStateInstruction) {
                    const routeOrInstructions = this.options.transformFromUrl(path, this);
                    // TODO: Don't go via string here, use instructions as they are
                    path = Array.isArray(routeOrInstructions) ? this.instructionResolver.stringifyViewportInstructions(routeOrInstructions) : routeOrInstructions;
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
            const parsedQuery = parseQuery(instruction.query);
            instruction.parameters = parsedQuery.parameters;
            instruction.parameterList = parsedQuery.list;
            // TODO: Fetch title (probably when done)
            const usedViewports = (clearViewports ? this.allViewports().filter((value) => value.content.component !== null) : []);
            const doneDefaultViewports = [];
            let defaultViewports = this.allViewports().filter(viewport => viewport.options.default
                && viewport.content.component === null
                && doneDefaultViewports.every(done => done !== viewport));
            const updatedViewports = [];
            // TODO: Take care of cancellations down in subsets/iterations
            let { viewportInstructions, viewportsRemaining } = this.rootScope.findViewports(views);
            let guard = 100;
            while (viewportInstructions.length || viewportsRemaining || defaultViewports.length || clearViewports) {
                // Guard against endless loop
                if (!guard--) {
                    throw Reporter.error(2002);
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
                for (const viewportInstruction of viewportInstructions) {
                    const viewport = viewportInstruction.viewport;
                    const componentWithParameters = this.instructionResolver.stringifyViewportInstruction(viewportInstruction, true);
                    if (viewport.setNextContent(componentWithParameters, instruction)) {
                        changedViewports.push(viewport);
                    }
                    arrayRemove(usedViewports, value => value === viewport);
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
                    && viewport.content.component === null
                    && doneDefaultViewports.every(done => done !== viewport));
                if (!this.allViewports().length) {
                    viewportsRemaining = false;
                }
                clearViewports = false;
            }
            await Promise.all(updatedViewports.map((value) => value.loadContent()));
            await this.replacePaths(instruction);
            // Remove history entry if no history viewports updated
            if (instruction.navigation.new && !instruction.navigation.first && !instruction.repeating && updatedViewports.every(viewport => viewport.options.noHistory)) {
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
        this.container = container;
        this.navigator = navigator;
        this.navigation = navigation;
        this.routeTransformer = routeTransformer;
        this.linkHandler = linkHandler;
        this.instructionResolver = instructionResolver;
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
        return this.navigation.activate(this.navigationCallback);
    }
    deactivate() {
        if (!this.isActive) {
            throw new Error('Router has not been activated');
        }
        this.linkHandler.deactivate();
        this.navigator.deactivate();
        this.navigation.deactivate();
    }
    addProcessingViewport(componentOrInstruction, viewport) {
        if (this.processingNavigation) {
            if (componentOrInstruction instanceof ViewportInstruction) {
                if (!componentOrInstruction.viewport) {
                    // TODO: Deal with not yet existing viewports
                    componentOrInstruction.viewport = this.allViewports().find(vp => vp.name === componentOrInstruction.viewportName);
                }
                this.addedViewports.push(componentOrInstruction);
            }
            else {
                if (typeof viewport === 'string') {
                    // TODO: Deal with not yet existing viewports
                    viewport = this.allViewports().find(vp => vp.name === viewport);
                }
                this.addedViewports.push(new ViewportInstruction(componentOrInstruction, viewport));
            }
        }
        else if (this.lastNavigation) {
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
        return this.allViewports().find(viewport => viewport.name === name);
    }
    // Called from the viewport custom element in attached()
    addViewport(name, element, context, options) {
        Reporter.write(10000, 'Viewport added', name, element);
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
            fullStateInstruction: null,
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
    setNav(name, routes) {
        const nav = this.findNav(name);
        if (nav) {
            nav.routes = [];
        }
        this.addNav(name, routes);
    }
    addNav(name, routes) {
        let nav = this.navs[name];
        if (!nav) {
            nav = this.navs[name] = new Nav(this, name);
        }
        nav.addRoutes(routes);
        this.navs[name] = new Nav(nav.router, nav.name, nav.routes);
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
            const root = this.container.get(Aurelia).root;
            this.rootScope = new Scope(this, root.host, root.controller.context, null);
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
Router.inject = [IContainer, Navigator, BrowserNavigation, IRouteTransformer, LinkHandler, InstructionResolver];
//# sourceMappingURL=router.js.map