(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "@aurelia/runtime"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    class ViewportInstruction {
        constructor(component, viewport, parameters, ownsScope = true, nextScopeInstructions = null) {
            this.ownsScope = ownsScope;
            this.nextScopeInstructions = nextScopeInstructions;
            this.componentType = null;
            this.componentName = null;
            this.viewport = null;
            this.viewportName = null;
            this.parametersString = null;
            this.parameters = null;
            this.parametersList = null;
            this.setComponent(component);
            this.setViewport(viewport);
            this.setParameters(parameters);
        }
        setComponent(component) {
            if (typeof component === 'string') {
                this.componentName = component;
                this.componentType = null;
            }
            else {
                this.componentType = component;
                this.componentName = component.description.name;
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
        toComponentType(context) {
            if (this.componentType !== null) {
                return this.componentType;
            }
            if (this.componentName !== null && typeof this.componentName === 'string') {
                const container = context.get(kernel_1.IContainer);
                if (container) {
                    const resolver = container.getResolver(runtime_1.CustomElement.keyFrom(this.componentName));
                    if (resolver && resolver.getFactory) {
                        const factory = resolver.getFactory(container);
                        if (factory) {
                            return factory.Type;
                        }
                    }
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
        sameViewport(other) {
            return (this.viewport ? this.viewport.name : this.viewportName) === (other.viewport ? other.viewport.name : other.viewportName);
        }
    }
    exports.ViewportInstruction = ViewportInstruction;
});
//# sourceMappingURL=viewport-instruction.js.map