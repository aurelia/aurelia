"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserLocationManager = exports.ILocationManager = exports.BrowserBaseHrefProvider = exports.BaseHref = exports.IBaseHrefProvider = void 0;
const kernel_1 = require("@aurelia/kernel");
const runtime_html_1 = require("@aurelia/runtime-html");
const router_events_js_1 = require("./router-events.js");
exports.IBaseHrefProvider = kernel_1.DI.createInterface('IBaseHrefProvider', x => x.singleton(BrowserBaseHrefProvider));
class BaseHref {
    constructor(path, rootedPath) {
        this.path = path;
        this.rootedPath = rootedPath;
    }
}
exports.BaseHref = BaseHref;
/**
 * Default browser base href provider.
 *
 * Retrieves the base href based on the `<base>` element from `window.document.head`
 *
 * This is internal API for the moment. The shape of this API (as well as in which package it resides) is also likely temporary.
 */
let BrowserBaseHrefProvider = class BrowserBaseHrefProvider {
    constructor(window) {
        this.window = window;
    }
    getBaseHref() {
        var _a;
        const base = this.window.document.head.querySelector('base');
        if (base === null) {
            return null;
        }
        const rootedPath = normalizePath(base.href);
        const path = normalizePath((_a = base.getAttribute('href')) !== null && _a !== void 0 ? _a : '');
        return new BaseHref(path, rootedPath);
    }
};
BrowserBaseHrefProvider = __decorate([
    __param(0, runtime_html_1.IWindow)
], BrowserBaseHrefProvider);
exports.BrowserBaseHrefProvider = BrowserBaseHrefProvider;
exports.ILocationManager = kernel_1.DI.createInterface('ILocationManager', x => x.singleton(BrowserLocationManager));
/**
 * Default browser location manager.
 *
 * Encapsulates all DOM interactions (`window`, `location` and `history` apis) and exposes them in an environment-agnostic manner.
 *
 * This is internal API for the moment. The shape of this API (as well as in which package it resides) is also likely temporary.
 */
let BrowserLocationManager = class BrowserLocationManager {
    constructor(logger, events, history, location, window, baseHrefProvider) {
        var _a;
        this.logger = logger;
        this.events = events;
        this.history = history;
        this.location = location;
        this.window = window;
        this.baseHrefProvider = baseHrefProvider;
        this.eventId = 0;
        this.logger = logger.root.scopeTo('LocationManager');
        const baseHref = baseHrefProvider.getBaseHref();
        if (baseHref === null) {
            const origin = (_a = location.origin) !== null && _a !== void 0 ? _a : '';
            const baseHref = this.baseHref = new BaseHref('', normalizePath(origin));
            this.logger.warn(`no baseHref provided, defaulting to origin '${baseHref.rootedPath}' (normalized from '${origin}')`);
        }
        else {
            this.baseHref = baseHref;
            this.logger.debug(`baseHref set to path: '${baseHref.path}', rootedPath: '${baseHref.rootedPath}'`);
        }
    }
    startListening() {
        this.logger.trace(`startListening()`);
        this.window.addEventListener('popstate', this.onPopState, false);
        this.window.addEventListener('hashchange', this.onHashChange, false);
    }
    stopListening() {
        this.logger.trace(`stopListening()`);
        this.window.removeEventListener('popstate', this.onPopState, false);
        this.window.removeEventListener('hashchange', this.onHashChange, false);
    }
    onPopState(event) {
        this.logger.trace(`onPopState()`);
        this.events.publish(new router_events_js_1.LocationChangeEvent(++this.eventId, this.getPath(), 'popstate', event.state));
    }
    onHashChange(_event) {
        this.logger.trace(`onHashChange()`);
        this.events.publish(new router_events_js_1.LocationChangeEvent(++this.eventId, this.getPath(), 'hashchange', null));
    }
    pushState(state, title, url) {
        url = this.addBaseHref(url);
        try {
            const stateString = JSON.stringify(state);
            this.logger.trace(`pushState(state:${stateString},title:'${title}',url:'${url}')`);
        }
        catch (err) {
            this.logger.warn(`pushState(state:NOT_SERIALIZABLE,title:'${title}',url:'${url}')`);
        }
        this.history.pushState(state, title, url);
    }
    replaceState(state, title, url) {
        url = this.addBaseHref(url);
        try {
            const stateString = JSON.stringify(state);
            this.logger.trace(`replaceState(state:${stateString},title:'${title}',url:'${url}')`);
        }
        catch (err) {
            this.logger.warn(`replaceState(state:NOT_SERIALIZABLE,title:'${title}',url:'${url}')`);
        }
        this.history.replaceState(state, title, url);
    }
    getPath() {
        const { pathname, search, hash } = this.location;
        const path = this.removeBaseHref(`${pathname}${normalizeQuery(search)}${hash}`);
        this.logger.trace(`getPath() -> '${path}'`);
        return path;
    }
    currentPathEquals(path) {
        const equals = this.getPath() === this.removeBaseHref(path);
        this.logger.trace(`currentPathEquals(path:'${path}') -> ${equals}`);
        return equals;
    }
    addBaseHref(path) {
        const initialPath = path;
        let fullPath;
        let base = this.baseHref.rootedPath;
        if (base.endsWith('/')) {
            base = base.slice(0, -1);
        }
        if (base.length === 0) {
            fullPath = path;
        }
        else {
            if (path.startsWith('/')) {
                path = path.slice(1);
            }
            fullPath = `${base}/${path}`;
        }
        this.logger.trace(`addBaseHref(path:'${initialPath}') -> '${fullPath}'`);
        return fullPath;
    }
    removeBaseHref(path) {
        const $path = path;
        if (path.startsWith(this.baseHref.path)) {
            path = path.slice(this.baseHref.path.length);
        }
        path = normalizePath(path);
        this.logger.trace(`removeBaseHref(path:'${$path}') -> '${path}'`);
        return path;
    }
};
__decorate([
    kernel_1.bound
], BrowserLocationManager.prototype, "onPopState", null);
__decorate([
    kernel_1.bound
], BrowserLocationManager.prototype, "onHashChange", null);
BrowserLocationManager = __decorate([
    __param(0, kernel_1.ILogger),
    __param(1, router_events_js_1.IRouterEvents),
    __param(2, runtime_html_1.IHistory),
    __param(3, runtime_html_1.ILocation),
    __param(4, runtime_html_1.IWindow),
    __param(5, exports.IBaseHrefProvider)
], BrowserLocationManager);
exports.BrowserLocationManager = BrowserLocationManager;
/**
 * Strip trailing `/index.html` and trailing `/` from the path, if present.
 */
function normalizePath(path) {
    let start;
    let end;
    let index;
    if ((index = path.indexOf('?')) >= 0 || (index = path.indexOf('#')) >= 0) {
        start = path.slice(0, index);
        end = path.slice(index);
    }
    else {
        start = path;
        end = '';
    }
    if (start.endsWith('/')) {
        start = start.slice(0, -1);
    }
    else if (start.endsWith('/index.html')) {
        start = start.slice(0, -11 /* '/index.html'.length */);
    }
    return `${start}${end}`;
}
function normalizeQuery(query) {
    return query.length > 0 && !query.startsWith('?') ? `?${query}` : query;
}
//# sourceMappingURL=location-manager.js.map