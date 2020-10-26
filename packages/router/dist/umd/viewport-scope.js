(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./scope", "./utils", "./runner"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ViewportScope = void 0;
    const scope_1 = require("./scope");
    const utils_1 = require("./utils");
    const runner_1 = require("./runner");
    class ViewportScope {
        constructor(name, router, connectedCE, owningScope, scope, rootComponentType = null, // temporary. Metadata will probably eliminate it
        options = {
            catches: [],
            source: null,
        }) {
            this.name = name;
            this.router = router;
            this.connectedCE = connectedCE;
            this.rootComponentType = rootComponentType;
            this.options = options;
            this.path = null;
            this.content = null;
            this.nextContent = null;
            this.available = true;
            this.sourceItem = null;
            this.sourceItemIndex = -1;
            this.remove = false;
            this.add = false;
            this.connectedScope = new scope_1.Scope(router, scope, owningScope, null, this);
            if (this.catches.length > 0) {
                this.content = router.createViewportInstruction(this.catches[0], this.name);
            }
        }
        get scope() {
            return this.connectedScope.scope;
        }
        get owningScope() {
            return this.connectedScope.owningScope;
        }
        get enabled() {
            return this.connectedScope.enabled;
        }
        set enabled(enabled) {
            this.connectedScope.enabled = enabled;
        }
        get isViewport() {
            return false;
        }
        get isViewportScope() {
            return true;
        }
        get isEmpty() {
            return this.content === null;
        }
        get passThroughScope() {
            return this.rootComponentType === null && this.catches.length === 0;
        }
        get siblings() {
            const parent = this.connectedScope.parent;
            if (parent === null) {
                return [this];
            }
            return parent.enabledChildren
                .filter(child => child.isViewportScope && child.viewportScope.name === this.name)
                .map(child => child.viewportScope);
        }
        get source() {
            return this.options.source || null;
        }
        get catches() {
            let catches = this.options.catches || [];
            if (typeof catches === 'string') {
                catches = catches.split(',');
            }
            return catches;
        }
        get default() {
            if (this.catches.length > 0) {
                return this.catches[0];
            }
        }
        get nextContentActivated() {
            var _a, _b, _c;
            return (_c = (_b = (_a = this.scope.parent) === null || _a === void 0 ? void 0 : _a.owner) === null || _b === void 0 ? void 0 : _b.nextContentActivated) !== null && _c !== void 0 ? _c : false;
        }
        get parentNextContentActivated() {
            var _a, _b, _c;
            return (_c = (_b = (_a = this.scope.parent) === null || _a === void 0 ? void 0 : _a.owner) === null || _b === void 0 ? void 0 : _b.nextContentActivated) !== null && _c !== void 0 ? _c : false;
        }
        get nextContentAction() {
            return '';
        }
        toString() {
            var _a, _b, _c, _d;
            const contentName = (_b = (_a = this.content) === null || _a === void 0 ? void 0 : _a.componentName) !== null && _b !== void 0 ? _b : '';
            const nextContentName = (_d = (_c = this.nextContent) === null || _c === void 0 ? void 0 : _c.componentName) !== null && _d !== void 0 ? _d : '';
            return `vs:${this.name}[${contentName}->${nextContentName}]`;
        }
        setNextContent(viewportInstruction, navigation) {
            viewportInstruction.viewportScope = this;
            this.remove = this.router.instructionResolver.isClearViewportInstruction(viewportInstruction)
                || this.router.instructionResolver.isClearAllViewportsInstruction(viewportInstruction);
            this.add = this.router.instructionResolver.isAddViewportInstruction(viewportInstruction)
                && Array.isArray(this.source);
            if (this.add) {
                viewportInstruction.componentName = null;
            }
            if (this.default !== void 0 && viewportInstruction.componentName === null) {
                viewportInstruction.componentName = this.default;
            }
            this.nextContent = viewportInstruction;
            return 'swap';
        }
        transition(coordinator) {
            // console.log('ViewportScope swap'/*, this, coordinator*/);
            runner_1.Runner.run(() => coordinator.addEntityState(this, 'guardedUnload'), () => coordinator.addEntityState(this, 'guardedLoad'), () => coordinator.addEntityState(this, 'guarded'), () => coordinator.addEntityState(this, 'loaded'), () => coordinator.addEntityState(this, 'unloaded'), () => coordinator.addEntityState(this, 'routed'), () => coordinator.addEntityState(this, 'swapped'), () => {
                this.content = !this.remove ? this.nextContent : null;
                this.nextContent = null;
                coordinator.addEntityState(this, 'completed');
            });
        }
        canUnload() {
            return true;
        }
        canLoad() {
            return true;
        }
        unload() {
            return;
        }
        load() {
            return;
        }
        // public loadContent(): Promise<boolean> {
        //   this.content = !this.remove ? this.nextContent : null;
        //   this.nextContent = null;
        //   return Promise.resolve(true);
        // }
        finalizeContentChange() {
            // console.log('ViewportScope finalizing', this.content);
            if (this.remove && Array.isArray(this.source)) {
                this.removeSourceItem();
            }
        }
        abortContentChange() {
            this.nextContent = null;
            if (this.add) {
                const index = this.source.indexOf(this.sourceItem);
                this.source.splice(index, 1);
                this.sourceItem = null;
            }
            return Promise.resolve();
        }
        acceptSegment(segment) {
            if (segment === null && segment === void 0 || segment.length === 0) {
                return true;
            }
            if (segment === this.router.instructionResolver.clearViewportInstruction
                || segment === this.router.instructionResolver.addViewportInstruction
                || segment === this.name) {
                return true;
            }
            if (this.catches.length === 0) {
                return true;
            }
            if (this.catches.includes(segment)) {
                return true;
            }
            if (this.catches.filter((value) => value.includes('*')).length) {
                return true;
            }
            return false;
        }
        beforeBind() {
            const source = this.source || [];
            if (source.length > 0 && this.sourceItem === null) {
                this.sourceItem = this.getAvailableSourceItem();
            }
        }
        beforeUnbind() {
            if (this.sourceItem !== null && this.source !== null) {
                utils_1.arrayRemove(this.source, (item) => item === this.sourceItem);
            }
            this.sourceItem = null;
        }
        getAvailableSourceItem() {
            if (this.source === null) {
                return null;
            }
            const siblings = this.siblings;
            for (const item of this.source) {
                if (siblings.every(sibling => sibling.sourceItem !== item)) {
                    return item;
                }
            }
            return null;
        }
        addSourceItem() {
            const item = {};
            this.source.push(item);
            return item;
        }
        removeSourceItem() {
            this.sourceItemIndex = this.source.indexOf(this.sourceItem);
            if (this.sourceItemIndex >= 0) {
                this.source.splice(this.sourceItemIndex, 1);
            }
        }
        getRoutes() {
            if (this.rootComponentType !== null) {
                return this.rootComponentType.routes;
            }
            return null;
        }
    }
    exports.ViewportScope = ViewportScope;
});
//# sourceMappingURL=viewport-scope.js.map