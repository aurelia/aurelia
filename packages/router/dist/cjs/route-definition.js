"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteDefinition = void 0;
const kernel_1 = require("@aurelia/kernel");
const runtime_html_1 = require("@aurelia/runtime-html");
const instructions_js_1 = require("./instructions.js");
const route_js_1 = require("./route.js");
const validation_js_1 = require("./validation.js");
const util_js_1 = require("./util.js");
class RouteDefinition {
    constructor(config, component) {
        var _a, _b, _c, _d, _e;
        this.config = config;
        this.component = component;
        this.hasExplicitPath = config.path !== null;
        this.caseSensitive = config.caseSensitive;
        this.path = util_js_1.ensureArrayOfStrings((_a = config.path) !== null && _a !== void 0 ? _a : component.name);
        this.redirectTo = (_b = config.redirectTo) !== null && _b !== void 0 ? _b : null;
        this.viewport = (_c = config.viewport) !== null && _c !== void 0 ? _c : 'default';
        this.id = util_js_1.ensureString((_d = config.id) !== null && _d !== void 0 ? _d : this.path);
        this.data = (_e = config.data) !== null && _e !== void 0 ? _e : {};
    }
    static resolve(routeable, context) {
        if (validation_js_1.isPartialRedirectRouteConfig(routeable)) {
            return new RouteDefinition(routeable, null);
        }
        // Check if this component already has a `RouteDefinition` associated with it, where the `config` matches the `RouteConfig` that is currently associated with the type.
        // If a type is re-configured via `Route.configure`, that effectively invalidates any existing `RouteDefinition` and we re-create and associate it.
        // Note: RouteConfig is associated with Type, but RouteDefinition is associated with CustomElementDefinition.
        return kernel_1.onResolve(this.resolveCustomElementDefinition(routeable, context), def => {
            const config = validation_js_1.isPartialChildRouteConfig(routeable)
                ? {
                    ...route_js_1.Route.getConfig(def.Type),
                    ...routeable
                }
                : route_js_1.Route.getConfig(def.Type);
            if (!kernel_1.Metadata.hasOwn(route_js_1.Route.name, def)) {
                const routeDefinition = new RouteDefinition(config, def);
                kernel_1.Metadata.define(route_js_1.Route.name, routeDefinition, def);
            }
            else {
                let routeDefinition = kernel_1.Metadata.getOwn(route_js_1.Route.name, def);
                if (routeDefinition.config !== config) {
                    routeDefinition = new RouteDefinition(config, def);
                    kernel_1.Metadata.define(route_js_1.Route.name, routeDefinition, def);
                }
            }
            return kernel_1.Metadata.getOwn(route_js_1.Route.name, def);
        });
    }
    static resolveCustomElementDefinition(routeable, context) {
        if (validation_js_1.isPartialChildRouteConfig(routeable)) {
            return this.resolveCustomElementDefinition(routeable.component, context);
        }
        const typedInstruction = instructions_js_1.TypedNavigationInstruction.create(routeable);
        switch (typedInstruction.type) {
            case 0 /* string */: {
                if (context === void 0) {
                    throw new Error(`When retrieving the RouteDefinition for a component name, a RouteContext (that can resolve it) must be provided`);
                }
                const component = context.container.find(runtime_html_1.CustomElement, typedInstruction.value);
                if (component === null) {
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    throw new Error(`Could not find a CustomElement named '${typedInstruction.value}' in the current container scope of ${context}. This means the component is neither registered at Aurelia startup nor via the 'dependencies' decorator or static property.`);
                }
                return component;
            }
            case 2 /* CustomElementDefinition */:
                return typedInstruction.value;
            case 4 /* IRouteViewModel */:
                // Get the class from the constructor property. There might be static properties on it.
                return runtime_html_1.CustomElement.getDefinition(typedInstruction.value.constructor);
            case 3 /* Promise */:
                if (context === void 0) {
                    throw new Error(`RouteContext must be provided when resolving an imported module`);
                }
                return context.resolveLazy(typedInstruction.value);
        }
    }
    register(container) {
        var _a;
        (_a = this.component) === null || _a === void 0 ? void 0 : _a.register(container);
    }
    toUrlComponent() {
        return 'not-implemented'; // TODO
    }
    toString() {
        const path = this.config.path === null ? 'null' : `'${this.config.path}'`;
        if (this.component !== null) {
            return `RD(config.path:${path},c.name:'${this.component.name}')`;
        }
        else {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            return `RD(config.path:${path},redirectTo:'${this.redirectTo}')`;
        }
    }
}
exports.RouteDefinition = RouteDefinition;
//# sourceMappingURL=route-definition.js.map