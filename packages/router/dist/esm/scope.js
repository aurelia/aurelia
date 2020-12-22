import { ViewportScope } from './viewport-scope.js';
import { FoundRoute } from './found-route.js';
import { NavigationInstructionResolver } from './type-resolvers.js';
import { Viewport } from './viewport.js';
import { arrayRemove } from './utils.js';
import { Collection } from './collection.js';
import { RouteRecognizer } from './route-recognizer.js';
import { Runner } from './runner.js';
/**
 * @internal - Shouldn't be used directly
 */
export class Scope {
    constructor(router, hasScope, owningScope, viewport = null, viewportScope = null, rootComponentType = null) {
        this.router = router;
        this.hasScope = hasScope;
        this.owningScope = owningScope;
        this.viewport = viewport;
        this.viewportScope = viewportScope;
        this.rootComponentType = rootComponentType;
        this.id = '.';
        this.parent = null;
        this.children = [];
        this.replacedChildren = [];
        this.path = null;
        this.enabled = true;
        // Support collection feature in viewport scopes
        this.childCollections = {};
        this.owningScope = owningScope ?? this;
        this.scope = this.hasScope ? this : this.owningScope.scope;
        // console.log('Created scope', this.toString());
    }
    toString(recurse = false) {
        return `${this.owningScope !== this ? this.owningScope.toString() : ''}/${this.owner.toString()}` +
            // eslint-disable-next-line prefer-template
            `${recurse ? `\n` + this.children.map(child => child.toString(true)).join('') : ''}`;
    }
    get isViewport() {
        return this.viewport !== null;
    }
    get isViewportScope() {
        return this.viewportScope !== null;
    }
    get passThroughScope() {
        return this.isViewportScope && this.viewportScope.passThroughScope;
    }
    get owner() {
        if (this.isViewport) {
            return this.viewport;
        }
        if (this.isViewportScope) {
            return this.viewportScope;
        }
        return null;
    }
    get enabledChildren() {
        return this.children.filter(scope => scope.enabled);
    }
    get hoistedChildren() {
        const scopes = this.enabledChildren;
        while (scopes.some(scope => scope.passThroughScope)) {
            for (const scope of scopes.slice()) {
                if (scope.passThroughScope) {
                    const index = scopes.indexOf(scope);
                    scopes.splice(index, 1, ...scope.enabledChildren);
                }
            }
        }
        return scopes;
    }
    get enabledViewports() {
        return this.children
            .filter(scope => scope.isViewport && scope.enabled)
            .map(scope => scope.viewport);
    }
    get viewportInstruction() {
        if (this.isViewportScope) {
            return this.viewportScope.content;
        }
        if (this.isViewport) {
            return this.viewport.content.content;
        }
        return null;
    }
    get parentNextContentAction() {
        if (this.parent === null) {
            return '';
        }
        const parentAction = this.parent.owner.nextContentAction;
        if (parentAction === 'swap' || parentAction === 'skip') {
            return parentAction;
        }
        return this.parent.parentNextContentAction;
    }
    getEnabledViewports(viewportScopes) {
        return viewportScopes
            .filter(scope => !scope.isViewportScope)
            .map(scope => scope.viewport)
            .reduce((viewports, viewport) => {
            viewports[viewport.name] = viewport;
            return viewports;
        }, {});
    }
    getOwnedViewports(includeDisabled = false) {
        return this.allViewports(includeDisabled).filter(viewport => viewport.owningScope === this);
    }
    getOwnedScopes(includeDisabled = false) {
        const scopes = this.allScopes(includeDisabled).filter(scope => scope.owningScope === this);
        // Hoist children to pass through scopes
        for (const scope of scopes.slice()) {
            if (scope.passThroughScope) {
                const index = scopes.indexOf(scope);
                scopes.splice(index, 1, ...scope.getOwnedScopes());
            }
        }
        return scopes;
    }
    findInstructions(instruction) {
        let route = new FoundRoute();
        if (typeof instruction === 'string') {
            const instructions = this.router.instructionResolver.parseViewportInstructions(instruction);
            if (this.router.options.useConfiguredRoutes && !this.router.hasSiblingInstructions(instructions)) {
                const foundRoute = this.findMatchingRoute(instruction);
                if (foundRoute?.foundConfiguration ?? false) {
                    route = foundRoute;
                }
                else {
                    if (this.router.options.useDirectRoutes) {
                        route.instructions = instructions;
                        if (route.instructions.length > 0) {
                            const nextInstructions = route.instructions[0].nextScopeInstructions ?? [];
                            route.remaining = this.router.instructionResolver.stringifyViewportInstructions(nextInstructions);
                            // TODO: Verify that it's okay to leave this in
                            route.instructions[0].nextScopeInstructions = null;
                        }
                    }
                }
            }
            else if (this.router.options.useDirectRoutes) {
                route.instructions = instructions;
            }
        }
        else {
            route.instructions = instruction;
        }
        for (const instr of route.instructions) {
            if (instr.scope === null) {
                instr.scope = this;
            }
        }
        return route;
    }
    // Note: This can't change state other than the instructions!
    findViewports(instructions, alreadyFound, disregardViewports = false) {
        const foundViewports = [];
        let remainingInstructions = [];
        const ownedScopes = this.getOwnedScopes();
        // Get a shallow copy of all available manual viewport scopes
        const viewportScopes = ownedScopes.filter(scope => scope.isViewportScope).map(scope => scope.viewportScope);
        const availableViewportScopes = viewportScopes.filter(viewportScope => alreadyFound.every(found => found.viewportScope !== viewportScope));
        // Get a shallow copy of all available viewports
        const availableViewports = { ...this.getEnabledViewports(ownedScopes) };
        for (const instruction of alreadyFound.filter(found => found.scope === this)) {
            availableViewports[instruction.viewportName] = null;
        }
        const viewportInstructions = new Collection(...instructions.slice());
        let instruction = null;
        // The viewport scope is already known
        while ((instruction = viewportInstructions.next()) !== null) {
            if (instruction.viewportScope !== null && !this.router.instructionResolver.isAddViewportInstruction(instruction)) {
                remainingInstructions.push(...this.foundViewportScope(instruction, instruction.viewportScope));
                foundViewports.push(instruction);
                arrayRemove(availableViewportScopes, available => available === instruction.viewportScope);
                viewportInstructions.removeCurrent();
            }
        }
        // The viewport is already known
        if (!disregardViewports) {
            while ((instruction = viewportInstructions.next()) !== null) {
                if (instruction.viewport !== null) {
                    remainingInstructions.push(...this.foundViewport(instruction, instruction.viewport, disregardViewports));
                    foundViewports.push(instruction);
                    availableViewports[instruction.viewport.name] = null;
                    viewportInstructions.removeCurrent();
                }
            }
        }
        // Viewport scopes have priority
        while ((instruction = viewportInstructions.next()) !== null) {
            for (let viewportScope of viewportScopes) {
                if (viewportScope.acceptSegment(instruction.componentName)) {
                    if (Array.isArray(viewportScope.source)) {
                        // console.log('available', viewportScope.available, source);
                        let available = availableViewportScopes.find(available => available.name === viewportScope.name);
                        if (available === void 0 || this.router.instructionResolver.isAddViewportInstruction(instruction)) {
                            const item = viewportScope.addSourceItem();
                            available = this.getOwnedScopes()
                                .filter(scope => scope.isViewportScope)
                                .map(scope => scope.viewportScope)
                                .find(viewportScope => viewportScope.sourceItem === item);
                        }
                        viewportScope = available;
                    }
                    remainingInstructions.push(...this.foundViewportScope(instruction, viewportScope));
                    foundViewports.push(instruction);
                    arrayRemove(availableViewportScopes, available => available === instruction.viewportScope);
                    viewportInstructions.removeCurrent();
                    break;
                }
            }
        }
        // Configured viewport is ruling
        while ((instruction = viewportInstructions.next()) !== null) {
            instruction.needsViewportDescribed = true;
            for (const name in availableViewports) {
                const viewport = availableViewports[name];
                // TODO: Also check if (resolved) component wants a specific viewport
                if (viewport?.wantComponent(instruction.componentName)) {
                    const remaining = this.foundViewport(instruction, viewport, disregardViewports, true);
                    foundViewports.push(instruction);
                    remainingInstructions.push(...remaining);
                    availableViewports[name] = null;
                    viewportInstructions.removeCurrent();
                    break;
                }
            }
        }
        // Next in line is specified viewport (but not if we're disregarding viewports)
        if (!disregardViewports) {
            while ((instruction = viewportInstructions.next()) !== null) {
                const name = instruction.viewportName;
                if (!name || !name.length) {
                    continue;
                }
                const newScope = instruction.ownsScope;
                if (!this.getEnabledViewports(ownedScopes)[name]) {
                    continue;
                    // TODO: No longer pre-creating viewports. Evaluate!
                    this.addViewport(name, null, { scope: newScope, forceDescription: true });
                    availableViewports[name] = this.getEnabledViewports(ownedScopes)[name];
                }
                const viewport = availableViewports[name];
                if (viewport?.acceptComponent(instruction.componentName)) {
                    const remaining = this.foundViewport(instruction, viewport, disregardViewports, true);
                    foundViewports.push(instruction);
                    remainingInstructions.push(...remaining);
                    availableViewports[name] = null;
                    viewportInstructions.removeCurrent();
                }
            }
        }
        // Finally, only one accepting viewport left?
        while ((instruction = viewportInstructions.next()) !== null) {
            const remainingViewports = [];
            for (const name in availableViewports) {
                const viewport = availableViewports[name];
                if (viewport?.acceptComponent(instruction.componentName)) {
                    remainingViewports.push(viewport);
                }
            }
            if (remainingViewports.length === 1) {
                const viewport = remainingViewports.shift();
                const remaining = this.foundViewport(instruction, viewport, disregardViewports, true);
                foundViewports.push(instruction);
                remainingInstructions.push(...remaining);
                availableViewports[viewport.name] = null;
                viewportInstructions.removeCurrent();
            }
        }
        // If we're ignoring viewports, we now match them anyway
        if (disregardViewports) {
            while ((instruction = viewportInstructions.next()) !== null) {
                let viewport = instruction.viewport;
                if (!viewport) {
                    const name = instruction.viewportName;
                    if ((name?.length ?? 0) === 0) {
                        continue;
                    }
                    const newScope = instruction.ownsScope;
                    if (!this.getEnabledViewports(ownedScopes)[name]) {
                        continue;
                        // TODO: No longer pre-creating viewports. Evaluate!
                        this.addViewport(name, null, { scope: newScope, forceDescription: true });
                        availableViewports[name] = this.getEnabledViewports(ownedScopes)[name];
                    }
                    viewport = availableViewports[name];
                }
                if (viewport?.acceptComponent(instruction.componentName)) {
                    const remaining = this.foundViewport(instruction, viewport, disregardViewports);
                    foundViewports.push(instruction);
                    remainingInstructions.push(...remaining);
                    availableViewports[viewport.name] = null;
                    viewportInstructions.removeCurrent();
                }
            }
        }
        remainingInstructions = [...viewportInstructions, ...remainingInstructions];
        return {
            foundViewports,
            remainingInstructions,
        };
    }
    foundViewportScope(instruction, viewportScope) {
        instruction.viewportScope = viewportScope;
        instruction.needsViewportDescribed = false;
        const remaining = instruction.nextScopeInstructions?.slice() ?? [];
        for (const rem of remaining) {
            if (rem.scope === null) {
                rem.scope = viewportScope.scope.scope;
            }
        }
        return remaining;
    }
    foundViewport(instruction, viewport, withoutViewports, doesntNeedViewportDescribed = false) {
        instruction.setViewport(viewport);
        if (doesntNeedViewportDescribed) {
            instruction.needsViewportDescribed = false;
        }
        const remaining = instruction.nextScopeInstructions?.slice() ?? [];
        for (const rem of remaining) {
            if (rem.scope === null) {
                rem.scope = viewport.scope;
            }
        }
        return remaining;
    }
    addViewport(name, connectedCE, options = {}) {
        let viewport = this.getEnabledViewports(this.getOwnedScopes())[name];
        // Each au-viewport element has its own Viewport
        if (((connectedCE ?? null) !== null) &&
            ((viewport?.connectedCE ?? null) !== null) &&
            viewport.connectedCE !== connectedCE) {
            viewport.enabled = false;
            viewport = this.getOwnedViewports(true).find(child => child.name === name && child.connectedCE === connectedCE) ?? null;
            if ((viewport ?? null) !== null) {
                viewport.enabled = true;
            }
        }
        if ((viewport ?? null) === null) {
            viewport = new Viewport(this.router, name, connectedCE, this.scope, !!options.scope, options);
            this.addChild(viewport.connectedScope);
        }
        if ((connectedCE ?? null) !== null) {
            viewport.setConnectedCE(connectedCE, options);
        }
        return viewport;
    }
    removeViewport(viewport, connectedCE) {
        if (((connectedCE ?? null) !== null) || viewport.remove(connectedCE)) {
            this.removeChild(viewport.connectedScope);
            return true;
        }
        return false;
    }
    addViewportScope(name, connectedCE, options = {}) {
        const viewportScope = new ViewportScope(name, this.router, connectedCE, this.scope, true, null, options);
        this.addChild(viewportScope.connectedScope);
        return viewportScope;
    }
    removeViewportScope(viewportScope) {
        // viewportScope.remove();
        this.removeChild(viewportScope.connectedScope);
        return true;
    }
    addChild(scope) {
        if (!this.children.some(vp => vp === scope)) {
            if (scope.parent !== null) {
                scope.parent.removeChild(scope);
            }
            this.children.push(scope);
            scope.parent = this;
        }
    }
    removeChild(scope) {
        const index = this.children.indexOf(scope);
        if (index >= 0) {
            this.children.splice(index, 1);
            scope.parent = null;
        }
    }
    clearReplacedChildren() {
        this.replacedChildren = [];
    }
    disableReplacedChildren() {
        this.replacedChildren = this.enabledChildren;
        for (const scope of this.replacedChildren) {
            scope.enabled = false;
        }
    }
    reenableReplacedChildren() {
        for (const scope of this.replacedChildren) {
            scope.enabled = true;
        }
    }
    allViewports(includeDisabled = false, includeReplaced = false) {
        return this.allScopes(includeDisabled, includeReplaced).filter(scope => scope.isViewport).map(scope => scope.viewport);
    }
    allScopes(includeDisabled = false, includeReplaced = false) {
        const scopes = includeDisabled ? this.children.slice() : this.enabledChildren;
        for (const scope of scopes.slice()) {
            scopes.push(...scope.allScopes(includeDisabled, includeReplaced));
        }
        return scopes;
    }
    reparentViewportInstructions() {
        const scopes = this.hoistedChildren
            .filter(scope => scope.viewportInstruction !== null && scope.viewportInstruction.componentName);
        if (!scopes.length) {
            return null;
        }
        for (const scope of scopes) {
            const childInstructions = scope.reparentViewportInstructions();
            scope.viewportInstruction.nextScopeInstructions =
                childInstructions !== null && childInstructions.length > 0 ? childInstructions : null;
        }
        return scopes.map(scope => scope.viewportInstruction);
    }
    findMatchingRoute(path) {
        if (this.isViewportScope && !this.passThroughScope) {
            return this.findMatchingRouteInRoutes(path, this.viewportScope.getRoutes());
        }
        if (this.isViewport) {
            return this.findMatchingRouteInRoutes(path, this.viewport.getRoutes());
        }
        // TODO: Match specified names here
        for (const child of this.enabledChildren) {
            const found = child.findMatchingRoute(path);
            if (found !== null) {
                return found;
            }
        }
        return null;
    }
    canLoad(recurse) {
        const results = Runner.runAll(this.children.map(child => child.viewport !== null
            ? child.viewport.canLoad(recurse)
            : child.canLoad(recurse)));
        if (results instanceof Promise) {
            return results.then(resolvedResults => resolvedResults.every(result => result));
        }
        return results.every(result => result);
    }
    canUnload() {
        const results = Runner.runAll(this.children.map(child => child.viewport !== null
            ? child.viewport.canUnload()
            : child.canUnload()));
        if (results instanceof Promise) {
            return results.then(resolvedResults => {
                return resolvedResults.every(result => result);
            });
        }
        return results.every(result => result);
    }
    load(recurse) {
        const results = Runner.runAll(this.children.map(child => child.viewport !== null
            ? child.viewport.load(recurse)
            : child.load(recurse)));
        if (results instanceof Promise) {
            return results;
        }
    }
    unload(recurse) {
        const results = Runner.runAll(this.children.map(child => child.viewport !== null
            ? child.viewport.unload(recurse)
            : child.unload(recurse)));
        if (results instanceof Promise) {
            return results;
        }
    }
    removeContent() {
        const results = Runner.runAll(this.children.map(child => child.viewport !== null
            ? child.viewport.removeContent()
            : child.removeContent()));
        if (results instanceof Promise) {
            return results;
        }
    }
    findMatchingRouteInRoutes(path, routes) {
        if (!Array.isArray(routes)) {
            return null;
        }
        routes = routes.map(route => this.ensureProperRoute(route));
        const cRoutes = routes.map(route => ({
            path: route.path,
            handler: route,
        }));
        for (let i = 0, ii = cRoutes.length; i < ii; ++i) {
            const cRoute = cRoutes[i];
            cRoutes.push({
                ...cRoute,
                path: `${cRoute.path}/*remainingPath`,
            });
        }
        const found = new FoundRoute();
        if (path.startsWith('/') || path.startsWith('+')) {
            path = path.slice(1);
        }
        const recognizer = new RouteRecognizer();
        recognizer.add(cRoutes);
        const result = recognizer.recognize(path);
        if (result !== null) {
            found.match = result.endpoint.route.handler;
            found.matching = path;
            const $params = { ...result.params };
            if ($params.remainingPath !== void 0) {
                found.remaining = $params.remainingPath;
                Reflect.deleteProperty($params, 'remainingPath');
                found.matching = found.matching.slice(0, found.matching.indexOf(found.remaining));
            }
            found.params = $params;
        }
        if (found.foundConfiguration) {
            // clone it so config doesn't get modified
            found.instructions = this.router.instructionResolver.cloneViewportInstructions(found.match.instructions, false, true);
            const instructions = found.instructions.slice();
            while (instructions.length > 0) {
                const instruction = instructions.shift();
                instruction.addParameters(found.params);
                instruction.route = '';
                if (instruction.nextScopeInstructions !== null) {
                    instructions.unshift(...instruction.nextScopeInstructions);
                }
            }
            if (found.instructions.length > 0) {
                found.instructions[0].route = found;
            }
        }
        return found;
    }
    ensureProperRoute(route) {
        if (route.id === void 0) {
            route.id = route.path;
        }
        if (route.instructions === void 0) {
            route.instructions = [{
                    component: route.component,
                    viewport: route.viewport,
                    parameters: route.parameters,
                    children: route.children,
                }];
        }
        route.instructions = NavigationInstructionResolver.toViewportInstructions(this.router, route.instructions);
        return route;
    }
}
//# sourceMappingURL=scope.js.map