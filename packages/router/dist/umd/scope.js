(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./viewport-scope", "./found-route", "./type-resolvers", "./viewport", "./utils", "./collection", "./route-recognizer", "./runner"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Scope = void 0;
    const viewport_scope_1 = require("./viewport-scope");
    const found_route_1 = require("./found-route");
    const type_resolvers_1 = require("./type-resolvers");
    const viewport_1 = require("./viewport");
    const utils_1 = require("./utils");
    const collection_1 = require("./collection");
    const route_recognizer_1 = require("./route-recognizer");
    const runner_1 = require("./runner");
    /**
     * @internal - Shouldn't be used directly
     */
    class Scope {
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
            this.owningScope = owningScope !== null && owningScope !== void 0 ? owningScope : this;
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
            var _a, _b;
            let route = new found_route_1.FoundRoute();
            if (typeof instruction === 'string') {
                const instructions = this.router.instructionResolver.parseViewportInstructions(instruction);
                if (this.router.options.useConfiguredRoutes && !this.router.hasSiblingInstructions(instructions)) {
                    const foundRoute = this.findMatchingRoute(instruction);
                    if ((_a = foundRoute === null || foundRoute === void 0 ? void 0 : foundRoute.foundConfiguration) !== null && _a !== void 0 ? _a : false) {
                        route = foundRoute;
                    }
                    else {
                        if (this.router.options.useDirectRoutes) {
                            route.instructions = instructions;
                            if (route.instructions.length > 0) {
                                const nextInstructions = (_b = route.instructions[0].nextScopeInstructions) !== null && _b !== void 0 ? _b : [];
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
            var _a;
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
            const viewportInstructions = new collection_1.Collection(...instructions.slice());
            let instruction = null;
            // The viewport scope is already known
            while ((instruction = viewportInstructions.next()) !== null) {
                if (instruction.viewportScope !== null && !this.router.instructionResolver.isAddViewportInstruction(instruction)) {
                    remainingInstructions.push(...this.foundViewportScope(instruction, instruction.viewportScope));
                    foundViewports.push(instruction);
                    utils_1.arrayRemove(availableViewportScopes, available => available === instruction.viewportScope);
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
                        utils_1.arrayRemove(availableViewportScopes, available => available === instruction.viewportScope);
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
                    if (viewport === null || viewport === void 0 ? void 0 : viewport.wantComponent(instruction.componentName)) {
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
                    if (viewport === null || viewport === void 0 ? void 0 : viewport.acceptComponent(instruction.componentName)) {
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
                    if (viewport === null || viewport === void 0 ? void 0 : viewport.acceptComponent(instruction.componentName)) {
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
                        if (((_a = name === null || name === void 0 ? void 0 : name.length) !== null && _a !== void 0 ? _a : 0) === 0) {
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
                    if (viewport === null || viewport === void 0 ? void 0 : viewport.acceptComponent(instruction.componentName)) {
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
            var _a, _b;
            instruction.viewportScope = viewportScope;
            instruction.needsViewportDescribed = false;
            const remaining = (_b = (_a = instruction.nextScopeInstructions) === null || _a === void 0 ? void 0 : _a.slice()) !== null && _b !== void 0 ? _b : [];
            for (const rem of remaining) {
                if (rem.scope === null) {
                    rem.scope = viewportScope.scope.scope;
                }
            }
            return remaining;
        }
        foundViewport(instruction, viewport, withoutViewports, doesntNeedViewportDescribed = false) {
            var _a, _b;
            instruction.setViewport(viewport);
            if (doesntNeedViewportDescribed) {
                instruction.needsViewportDescribed = false;
            }
            const remaining = (_b = (_a = instruction.nextScopeInstructions) === null || _a === void 0 ? void 0 : _a.slice()) !== null && _b !== void 0 ? _b : [];
            for (const rem of remaining) {
                if (rem.scope === null) {
                    rem.scope = viewport.scope;
                }
            }
            return remaining;
        }
        addViewport(name, connectedCE, options = {}) {
            var _a, _b;
            let viewport = this.getEnabledViewports(this.getOwnedScopes())[name];
            // Each au-viewport element has its own Viewport
            if (((connectedCE !== null && connectedCE !== void 0 ? connectedCE : null) !== null) &&
                (((_a = viewport === null || viewport === void 0 ? void 0 : viewport.connectedCE) !== null && _a !== void 0 ? _a : null) !== null) &&
                viewport.connectedCE !== connectedCE) {
                viewport.enabled = false;
                viewport = (_b = this.getOwnedViewports(true).find(child => child.name === name && child.connectedCE === connectedCE)) !== null && _b !== void 0 ? _b : null;
                if ((viewport !== null && viewport !== void 0 ? viewport : null) !== null) {
                    viewport.enabled = true;
                }
            }
            if ((viewport !== null && viewport !== void 0 ? viewport : null) === null) {
                viewport = new viewport_1.Viewport(this.router, name, connectedCE, this.scope, !!options.scope, options);
                this.addChild(viewport.connectedScope);
            }
            if ((connectedCE !== null && connectedCE !== void 0 ? connectedCE : null) !== null) {
                viewport.setConnectedCE(connectedCE, options);
            }
            return viewport;
        }
        removeViewport(viewport, connectedCE) {
            if (((connectedCE !== null && connectedCE !== void 0 ? connectedCE : null) !== null) || viewport.remove(connectedCE)) {
                this.removeChild(viewport.connectedScope);
                return true;
            }
            return false;
        }
        addViewportScope(name, connectedCE, options = {}) {
            const viewportScope = new viewport_scope_1.ViewportScope(name, this.router, connectedCE, this.scope, true, null, options);
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
            const results = runner_1.Runner.runAll(this.children.map(child => child.viewport !== null
                ? child.viewport.canLoad(recurse)
                : child.canLoad(recurse)));
            if (results instanceof Promise) {
                return results.then(resolvedResults => resolvedResults.every(result => result));
            }
            return results.every(result => result);
        }
        canUnload() {
            const results = runner_1.Runner.runAll(this.children.map(child => child.viewport !== null
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
            const results = runner_1.Runner.runAll(this.children.map(child => child.viewport !== null
                ? child.viewport.load(recurse)
                : child.load(recurse)));
            if (results instanceof Promise) {
                return results;
            }
        }
        unload(recurse) {
            const results = runner_1.Runner.runAll(this.children.map(child => child.viewport !== null
                ? child.viewport.unload(recurse)
                : child.unload(recurse)));
            if (results instanceof Promise) {
                return results;
            }
        }
        removeContent() {
            const results = runner_1.Runner.runAll(this.children.map(child => child.viewport !== null
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
            const found = new found_route_1.FoundRoute();
            if (path.startsWith('/') || path.startsWith('+')) {
                path = path.slice(1);
            }
            const recognizer = new route_recognizer_1.RouteRecognizer();
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
            route.instructions = type_resolvers_1.NavigationInstructionResolver.toViewportInstructions(this.router, route.instructions);
            return route;
        }
    }
    exports.Scope = Scope;
});
//# sourceMappingURL=scope.js.map