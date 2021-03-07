var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { ILogger, DI, bound } from '../../../kernel/dist/native-modules/index.js';
import { IHistory, ILocation, IWindow } from '../../../runtime-html/dist/native-modules/index.js';
import { IRouterEvents, LocationChangeEvent } from './router-events.js';
export const IBaseHrefProvider = DI.createInterface('IBaseHrefProvider', x => x.singleton(BrowserBaseHrefProvider));
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
        const base = this.window.document.head.querySelector('base');
        if (base === null) {
            return null;
        }
        return normalizePath(base.href);
    }
};
BrowserBaseHrefProvider = __decorate([
    __param(0, IWindow)
], BrowserBaseHrefProvider);
export { BrowserBaseHrefProvider };
export const ILocationManager = DI.createInterface('ILocationManager', x => x.singleton(BrowserLocationManager));
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
            const normalized = this.baseHref = normalizePath(origin);
            this.logger.warn(`no baseHref provided, defaulting to origin '${normalized}' (normalized from '${origin}')`);
        }
        else {
            const normalized = this.baseHref = normalizePath(baseHref);
            this.logger.debug(`baseHref set to '${normalized}' (normalized from '${baseHref}')`);
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
        this.events.publish(new LocationChangeEvent(++this.eventId, this.getPath(), 'popstate', event.state));
    }
    onHashChange(_event) {
        this.logger.trace(`onHashChange()`);
        this.events.publish(new LocationChangeEvent(++this.eventId, this.getPath(), 'hashchange', null));
    }
    pushState(state, title, url) {
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
        const path = this.normalize(`${pathname}${normalizeQuery(search)}${hash}`);
        this.logger.trace(`getPath() -> '${path}'`);
        return path;
    }
    currentPathEquals(path) {
        const equals = this.getPath() === this.normalize(path);
        this.logger.trace(`currentPathEquals(path:'${path}') -> ${equals}`);
        return equals;
    }
    getExternalURL(path) {
        const $path = path;
        let base = this.baseHref;
        if (base.endsWith('/')) {
            base = base.slice(0, -1);
        }
        if (path.startsWith('/')) {
            path = path.slice(1);
        }
        const url = `${base}/${path}`;
        this.logger.trace(`getExternalURL(path:'${$path}') -> '${url}'`);
        return url;
    }
    normalize(path) {
        const $path = path;
        if (path.startsWith(this.baseHref)) {
            path = path.slice(this.baseHref.length);
        }
        path = normalizePath(path);
        this.logger.trace(`normalize(path:'${$path}') -> '${path}'`);
        return path;
    }
};
__decorate([
    bound
], BrowserLocationManager.prototype, "onPopState", null);
__decorate([
    bound
], BrowserLocationManager.prototype, "onHashChange", null);
BrowserLocationManager = __decorate([
    __param(0, ILogger),
    __param(1, IRouterEvents),
    __param(2, IHistory),
    __param(3, ILocation),
    __param(4, IWindow),
    __param(5, IBaseHrefProvider)
], BrowserLocationManager);
export { BrowserLocationManager };
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