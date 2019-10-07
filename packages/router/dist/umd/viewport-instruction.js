(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "@aurelia/runtime", "./type-resolvers"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    const type_resolvers_1 = require("./type-resolvers");
    class ViewportInstruction {
        constructor(component, viewport, parameters, ownsScope = true, nextScopeInstructions = null) {
            this.ownsScope = ownsScope;
            this.nextScopeInstructions = nextScopeInstructions;
            this.componentName = null;
            this.componentType = null;
            this.componentInstance = null;
            this.viewportName = null;
            this.viewport = null;
            this.parametersString = null;
            this.parameters = null;
            this.parametersList = null;
            this.scope = null;
            this.needsViewportDescribed = false;
            this.setComponent(component);
            this.setViewport(viewport);
            this.setParameters(parameters);
        }
        setComponent(component) {
            if (type_resolvers_1.ComponentAppellationResolver.isName(component)) {
                this.componentName = type_resolvers_1.ComponentAppellationResolver.getName(component);
                this.componentType = null;
                this.componentInstance = null;
            }
            else if (type_resolvers_1.ComponentAppellationResolver.isType(component)) {
                this.componentName = type_resolvers_1.ComponentAppellationResolver.getName(component);
                this.componentType = type_resolvers_1.ComponentAppellationResolver.getType(component);
                this.componentInstance = null;
            }
            else if (type_resolvers_1.ComponentAppellationResolver.isInstance(component)) {
                this.componentName = type_resolvers_1.ComponentAppellationResolver.getName(component);
                this.componentType = type_resolvers_1.ComponentAppellationResolver.getType(component);
                this.componentInstance = type_resolvers_1.ComponentAppellationResolver.getInstance(component);
            }
        }
        setViewport(viewport) {
            if (viewport === undefined || viewport === '') {
                viewport = null;
            }
            if (typeof viewport === 'string') {
                this.viewportName = viewport;
                this.viewport = null;
            }
            else {
                this.viewport = viewport;
                if (viewport !== null) {
                    this.viewportName = viewport.name;
                    this.scope = viewport.owningScope;
                }
            }
        }
        setParameters(parameters) {
            if (parameters === undefined || parameters === '') {
                parameters = null;
            }
            if (typeof parameters === 'string') {
                this.parametersString = parameters;
                // TODO: Initialize parameters better and more of them and just fix this
                this.parameters = { id: parameters };
            }
            else {
                this.parameters = parameters;
                // TODO: Create parametersString
            }
            // TODO: Deal with parametersList
        }
        isEmpty() {
            return !this.isComponentName() && !this.isComponentType() && !this.isComponentInstance();
        }
        isComponentName() {
            return !!this.componentName && !this.isComponentType() && !this.isComponentInstance();
        }
        isComponentType() {
            return this.componentType !== null && !this.isComponentInstance();
        }
        isComponentInstance() {
            return this.componentInstance !== null;
        }
        toComponentType(context) {
            if (this.componentType !== null) {
                return this.componentType;
            }
            if (this.componentName !== null && typeof this.componentName === 'string') {
                const container = context.get(kernel_1.IContainer);
                if (container !== null && container.has(runtime_1.CustomElement.keyFrom(this.componentName), true)) {
                    const resolver = container.getResolver(runtime_1.CustomElement.keyFrom(this.componentName));
                    if (resolver !== null && resolver.getFactory !== void 0) {
                        const factory = resolver.getFactory(container);
                        if (factory) {
                            return factory.Type;
                        }
                    }
                }
            }
            return null;
        }
        toComponentInstance(context) {
            if (this.componentInstance !== null) {
                return this.componentInstance;
            }
            // TODO: Remove once "local registration is fixed"
            // const component = this.toComponentName();
            const container = context.get(kernel_1.IContainer);
            if (container !== void 0 && container !== null) {
                if (this.isComponentType()) {
                    return container.get(this.componentType);
                }
                else {
                    return container.get(runtime_1.CustomElement.keyFrom(this.componentName));
                }
            }
            return null;
        }
        toViewportInstance(router) {
            if (this.viewport !== null) {
                return this.viewport;
            }
            return router.getViewport(this.viewportName);
        }
        sameComponent(other, compareParameters = false, compareType = false) {
            if (compareParameters && this.parametersString !== other.parametersString) {
                return false;
            }
            return compareType ? this.componentType === other.componentType : this.componentName === other.componentName;
        }
        // TODO: Somewhere we need to check for format such as spaces etc
        sameParameters(other) {
            return this.parametersString === other.parametersString;
        }
        sameViewport(other) {
            return (this.viewport ? this.viewport.name : this.viewportName) === (other.viewport ? other.viewport.name : other.viewportName);
        }
    }
    exports.ViewportInstruction = ViewportInstruction;
});
//# sourceMappingURL=viewport-instruction.js.map