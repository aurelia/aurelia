import { emptyArray, Metadata, Protocol } from '@aurelia/kernel';
import { validateRouteConfig, expectType, shallowEquals } from './validation.js';
const noRoutes = emptyArray;
export function defaultReentryBehavior(current, next) {
    if (!shallowEquals(current.params, next.params)) {
        return 'invoke-lifecycles';
    }
    return 'none';
}
export class RouteConfig {
    constructor(
    /**
     * The id for this route, which can be used in the view for generating hrefs.
     *
     * (TODO: decide on, and provide more details about, whether this can be specified without specifying path, and what happens in different combinations of situations)
     */
    id, 
    /**
     * The path to match against the url.
     *
     * If left blank, the path will be derived from the component's static `path` property (if it exists), or otherwise the component name will be used (if direct routing is enabled).
     */
    path, 
    /**
     * The title to use for this route when matched.
     *
     * If left blank, this route will not contribute to the generated title.
     */
    title, 
    /**
     * The path to which to redirect when the url matches the path in this config.
     *
     * If the path begins with a slash (`/`), the redirect path is considered absolute, otherwise it is considered relative to the parent path.
     */
    redirectTo, 
    /**
     * Whether the `path` should be case sensitive.
     */
    caseSensitive, 
    /**
     * How to behave when this component scheduled to be loaded again in the same viewport:
     *
     * - `replace`: completely removes the current component and creates a new one, behaving as if the component changed.
     * - `invoke-lifecycles`: calls `canUnload`, `canLoad`, `unload` and `load` (default if only the parameters have changed)
     * - `none`: does nothing (default if nothing has changed for the viewport)
     *
     * By default, calls the router lifecycle hooks only if the parameters have changed, otherwise does nothing.
     */
    transitionPlan, 
    /**
     * The name of the viewport this component should be loaded into.
     *
     * (TODO: decide on, and provide more details about, whether this can be specified without specifying path, and what happens in different combinations of situations)
     */
    viewport, 
    /**
     * Any custom data that should be accessible to matched components or hooks.
     */
    data, 
    /**
     * The child routes that can be navigated to from this route. See `Routeable` for more information.
     */
    routes) {
        this.id = id;
        this.path = path;
        this.title = title;
        this.redirectTo = redirectTo;
        this.caseSensitive = caseSensitive;
        this.transitionPlan = transitionPlan;
        this.viewport = viewport;
        this.data = data;
        this.routes = routes;
    }
    static create(configOrPath, Type) {
        if (typeof configOrPath === 'string' || configOrPath instanceof Array) {
            const path = configOrPath;
            const redirectTo = Type?.redirectTo ?? null;
            const caseSensitive = Type?.caseSensitive ?? false;
            const id = Type?.id ?? (path instanceof Array ? path[0] : path);
            const title = Type?.title ?? null;
            const reentryBehavior = Type?.transitionPlan ?? defaultReentryBehavior;
            const viewport = Type?.viewport ?? null;
            const data = Type?.data ?? {};
            const children = Type?.routes ?? noRoutes;
            return new RouteConfig(id, path, title, redirectTo, caseSensitive, reentryBehavior, viewport, data, children);
        }
        else if (typeof configOrPath === 'object') {
            const config = configOrPath;
            validateRouteConfig(config, '');
            const path = config.path ?? Type?.path ?? null;
            const title = config.title ?? Type?.title ?? null;
            const redirectTo = config.redirectTo ?? Type?.redirectTo ?? null;
            const caseSensitive = config.caseSensitive ?? Type?.caseSensitive ?? false;
            const id = config.id ?? Type?.id ?? (path instanceof Array ? path[0] : path);
            const reentryBehavior = config.transitionPlan ?? Type?.transitionPlan ?? defaultReentryBehavior;
            const viewport = config.viewport ?? Type?.viewport ?? null;
            const data = {
                ...Type?.data,
                ...config.data,
            };
            const children = [
                ...(config.routes ?? noRoutes),
                ...(Type?.routes ?? noRoutes),
            ];
            return new RouteConfig(id, path, title, redirectTo, caseSensitive, reentryBehavior, viewport, data, children);
        }
        else {
            expectType('string, function/class or object', '', configOrPath);
        }
    }
    static configure(configOrPath, Type) {
        const config = RouteConfig.create(configOrPath, Type);
        Metadata.define(Route.name, config, Type);
        return Type;
    }
    static getConfig(Type) {
        if (!Metadata.hasOwn(Route.name, Type)) {
            // In the case of a type, this means there was no @route decorator on the class.
            // However there might still be static properties, and this API provides a unified way of accessing those.
            Route.configure({}, Type);
        }
        return Metadata.getOwn(Route.name, Type);
    }
    saveTo(Type) {
        Metadata.define(Route.name, this, Type);
    }
}
export class ChildRouteConfig extends RouteConfig {
    constructor(id, path, title, redirectTo, caseSensitive, reentryBehavior, viewport, data, routes, 
    /**
     * The component to load when this route is matched.
     */
    component) {
        super(id, path, title, redirectTo, caseSensitive, reentryBehavior, viewport, data, routes);
        this.component = component;
    }
}
export class RedirectRouteConfig {
    constructor(path, redirectTo, caseSensitive) {
        this.path = path;
        this.redirectTo = redirectTo;
        this.caseSensitive = caseSensitive;
    }
}
export const Route = {
    name: Protocol.resource.keyFor('route'),
    /**
     * Returns `true` if the specified type has any static route configuration (either via static properties or a &#64;route decorator)
     */
    isConfigured(Type) {
        return Metadata.hasOwn(Route.name, Type);
    },
    /**
     * Apply the specified configuration to the specified type, overwriting any existing configuration.
     */
    configure(configOrPath, Type) {
        const config = RouteConfig.create(configOrPath, Type);
        Metadata.define(Route.name, config, Type);
        return Type;
    },
    /**
     * Get the `RouteConfig` associated with the specified type, creating a new one if it does not yet exist.
     */
    getConfig(Type) {
        if (!Route.isConfigured(Type)) {
            // This means there was no @route decorator on the class.
            // However there might still be static properties, and this API provides a unified way of accessing those.
            Route.configure({}, Type);
        }
        return Metadata.getOwn(Route.name, Type);
    },
};
export function route(configOrPath) {
    return function (target) {
        return Route.configure(configOrPath, target);
    };
}
//# sourceMappingURL=route.js.map