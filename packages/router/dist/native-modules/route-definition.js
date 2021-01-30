import { Metadata, onResolve } from '../../../kernel/dist/native-modules/index.js';
import { CustomElement } from '../../../runtime-html/dist/native-modules/index.js';
import { TypedNavigationInstruction } from './instructions.js';
import { Route } from './route.js';
import { isPartialChildRouteConfig, isPartialRedirectRouteConfig } from './validation.js';
import { ensureArrayOfStrings, ensureString } from './util.js';
export class RouteDefinition {
    constructor(config, component) {
        var _a, _b, _c, _d, _e;
        this.config = config;
        this.component = component;
        this.hasExplicitPath = config.path !== null;
        this.caseSensitive = config.caseSensitive;
        this.path = ensureArrayOfStrings((_a = config.path) !== null && _a !== void 0 ? _a : component.name);
        this.redirectTo = (_b = config.redirectTo) !== null && _b !== void 0 ? _b : null;
        this.viewport = (_c = config.viewport) !== null && _c !== void 0 ? _c : 'default';
        this.id = ensureString((_d = config.id) !== null && _d !== void 0 ? _d : this.path);
        this.data = (_e = config.data) !== null && _e !== void 0 ? _e : {};
    }
    static resolve(routeable, context) {
        if (isPartialRedirectRouteConfig(routeable)) {
            return new RouteDefinition(routeable, null);
        }
        // Check if this component already has a `RouteDefinition` associated with it, where the `config` matches the `RouteConfig` that is currently associated with the type.
        // If a type is re-configured via `Route.configure`, that effectively invalidates any existing `RouteDefinition` and we re-create and associate it.
        // Note: RouteConfig is associated with Type, but RouteDefinition is associated with CustomElementDefinition.
        return onResolve(this.resolveCustomElementDefinition(routeable, context), def => {
            const config = isPartialChildRouteConfig(routeable)
                ? {
                    ...Route.getConfig(def.Type),
                    ...routeable
                }
                : Route.getConfig(def.Type);
            if (!Metadata.hasOwn(Route.name, def)) {
                const routeDefinition = new RouteDefinition(config, def);
                Metadata.define(Route.name, routeDefinition, def);
            }
            else {
                let routeDefinition = Metadata.getOwn(Route.name, def);
                if (routeDefinition.config !== config) {
                    routeDefinition = new RouteDefinition(config, def);
                    Metadata.define(Route.name, routeDefinition, def);
                }
            }
            return Metadata.getOwn(Route.name, def);
        });
    }
    static resolveCustomElementDefinition(routeable, context) {
        if (isPartialChildRouteConfig(routeable)) {
            return this.resolveCustomElementDefinition(routeable.component, context);
        }
        const typedInstruction = TypedNavigationInstruction.create(routeable);
        switch (typedInstruction.type) {
            case 0 /* string */: {
                if (context === void 0) {
                    throw new Error(`When retrieving the RouteDefinition for a component name, a RouteContext (that can resolve it) must be provided`);
                }
                const component = context.find(CustomElement, typedInstruction.value);
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
                return CustomElement.getDefinition(typedInstruction.value.constructor);
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
//# sourceMappingURL=route-definition.js.map