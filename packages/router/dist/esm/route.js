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
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z;
        if (typeof configOrPath === 'string' || configOrPath instanceof Array) {
            const path = configOrPath;
            const redirectTo = (_a = Type === null || Type === void 0 ? void 0 : Type.redirectTo) !== null && _a !== void 0 ? _a : null;
            const caseSensitive = (_b = Type === null || Type === void 0 ? void 0 : Type.caseSensitive) !== null && _b !== void 0 ? _b : false;
            const id = (_c = Type === null || Type === void 0 ? void 0 : Type.id) !== null && _c !== void 0 ? _c : (path instanceof Array ? path[0] : path);
            const title = (_d = Type === null || Type === void 0 ? void 0 : Type.title) !== null && _d !== void 0 ? _d : null;
            const reentryBehavior = (_e = Type === null || Type === void 0 ? void 0 : Type.transitionPlan) !== null && _e !== void 0 ? _e : defaultReentryBehavior;
            const viewport = (_f = Type === null || Type === void 0 ? void 0 : Type.viewport) !== null && _f !== void 0 ? _f : null;
            const data = (_g = Type === null || Type === void 0 ? void 0 : Type.data) !== null && _g !== void 0 ? _g : {};
            const children = (_h = Type === null || Type === void 0 ? void 0 : Type.routes) !== null && _h !== void 0 ? _h : noRoutes;
            return new RouteConfig(id, path, title, redirectTo, caseSensitive, reentryBehavior, viewport, data, children);
        }
        else if (typeof configOrPath === 'object') {
            const config = configOrPath;
            validateRouteConfig(config, '');
            const path = (_k = (_j = config.path) !== null && _j !== void 0 ? _j : Type === null || Type === void 0 ? void 0 : Type.path) !== null && _k !== void 0 ? _k : null;
            const title = (_m = (_l = config.title) !== null && _l !== void 0 ? _l : Type === null || Type === void 0 ? void 0 : Type.title) !== null && _m !== void 0 ? _m : null;
            const redirectTo = (_p = (_o = config.redirectTo) !== null && _o !== void 0 ? _o : Type === null || Type === void 0 ? void 0 : Type.redirectTo) !== null && _p !== void 0 ? _p : null;
            const caseSensitive = (_r = (_q = config.caseSensitive) !== null && _q !== void 0 ? _q : Type === null || Type === void 0 ? void 0 : Type.caseSensitive) !== null && _r !== void 0 ? _r : false;
            const id = (_t = (_s = config.id) !== null && _s !== void 0 ? _s : Type === null || Type === void 0 ? void 0 : Type.id) !== null && _t !== void 0 ? _t : (path instanceof Array ? path[0] : path);
            const reentryBehavior = (_v = (_u = config.transitionPlan) !== null && _u !== void 0 ? _u : Type === null || Type === void 0 ? void 0 : Type.transitionPlan) !== null && _v !== void 0 ? _v : defaultReentryBehavior;
            const viewport = (_x = (_w = config.viewport) !== null && _w !== void 0 ? _w : Type === null || Type === void 0 ? void 0 : Type.viewport) !== null && _x !== void 0 ? _x : null;
            const data = {
                ...Type === null || Type === void 0 ? void 0 : Type.data,
                ...config.data,
            };
            const children = [
                ...((_y = config.routes) !== null && _y !== void 0 ? _y : noRoutes),
                ...((_z = Type === null || Type === void 0 ? void 0 : Type.routes) !== null && _z !== void 0 ? _z : noRoutes),
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