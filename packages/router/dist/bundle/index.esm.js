import { DI, IEventAggregator, ILogger, bound, onResolve, resolveAll, isObject, IContainer, isArrayIndex, Metadata, Protocol, emptyArray, IModuleLoader, InstanceProvider, noop, Registration } from '@aurelia/kernel';
import { isCustomElementViewModel, IHistory, ILocation, IWindow, Controller, CustomElement, IPlatform, CustomElementDefinition, IAppRoot, IController, isCustomElementController, bindable, customElement, BindingMode, customAttribute, IEventTarget, INode, IEventDelegator, getRef, CustomAttribute, AppTask } from '@aurelia/runtime-html';
import { RouteRecognizer } from '@aurelia/route-recognizer';

class Batch {
    constructor(stack, cb, head) {
        this.stack = stack;
        this.cb = cb;
        this.done = false;
        this.next = null;
        this.head = head !== null && head !== void 0 ? head : this;
    }
    static start(cb) {
        return new Batch(0, cb, null);
    }
    push() {
        let cur = this;
        do {
            ++cur.stack;
            cur = cur.next;
        } while (cur !== null);
    }
    pop() {
        let cur = this;
        do {
            if (--cur.stack === 0) {
                cur.invoke();
            }
            cur = cur.next;
        } while (cur !== null);
    }
    invoke() {
        const cb = this.cb;
        if (cb !== null) {
            this.cb = null;
            cb(this);
            this.done = true;
        }
    }
    continueWith(cb) {
        if (this.next === null) {
            return this.next = new Batch(this.stack, cb, this.head);
        }
        else {
            return this.next.continueWith(cb);
        }
    }
    start() {
        this.head.push();
        this.head.pop();
        return this;
    }
}
function mergeDistinct(prev, next) {
    prev = prev.slice();
    next = next.slice();
    const merged = [];
    while (prev.length > 0) {
        const p = prev.shift();
        if (merged.every(m => m.context.vpa !== p.context.vpa)) {
            const i = next.findIndex(n => n.context.vpa === p.context.vpa);
            if (i >= 0) {
                merged.push(...next.splice(0, i + 1));
            }
            else {
                merged.push(p);
            }
        }
    }
    merged.push(...next);
    return merged;
}
function tryStringify(value) {
    try {
        return JSON.stringify(value);
    }
    catch (_a) {
        return Object.prototype.toString.call(value);
    }
}
function ensureArrayOfStrings(value) {
    return typeof value === 'string' ? [value] : value;
}
function ensureString(value) {
    return typeof value === 'string' ? value : value[0];
}

function isNotNullishOrTypeOrViewModel(value) {
    return (typeof value === 'object' &&
        value !== null &&
        !isCustomElementViewModel(value));
}
function isPartialCustomElementDefinition(value) {
    // 'name' is the only mandatory property of a CustomElementDefinition.
    // It overlaps with RouteType and may overlap with CustomElementViewModel, so this ducktype check is only valid when those are ruled out *first*
    return (isNotNullishOrTypeOrViewModel(value) &&
        Object.prototype.hasOwnProperty.call(value, 'name') === true);
}
function isPartialChildRouteConfig(value) {
    // 'component' is the only mandatory property of a ChildRouteConfig
    // It may overlap with RouteType and CustomElementViewModel, so this ducktype check is only valid when those are ruled out *first*
    return (isNotNullishOrTypeOrViewModel(value) &&
        Object.prototype.hasOwnProperty.call(value, 'component') === true);
}
function isPartialRedirectRouteConfig(value) {
    // 'redirectTo' and 'path' are mandatory properties of a RedirectRouteConfig
    // It may overlap with RouteType and CustomElementViewModel, so this ducktype check is only valid when those are ruled out *first*
    return (isNotNullishOrTypeOrViewModel(value) &&
        Object.prototype.hasOwnProperty.call(value, 'redirectTo') === true);
}
// Yes, `isPartialChildRouteConfig` and `isPartialViewportInstruction` have identical logic but since that is coincidental,
// and the two are intended to be used in specific contexts, we keep these as two separate functions for now.
function isPartialViewportInstruction(value) {
    // 'component' is the only mandatory property of a INavigationInstruction
    // It may overlap with RouteType and CustomElementViewModel, so this ducktype check is only valid when those are ruled out *first*
    return (isNotNullishOrTypeOrViewModel(value) &&
        Object.prototype.hasOwnProperty.call(value, 'component') === true);
}
function expectType(expected, prop, value) {
    throw new Error(`Invalid route config property: "${prop}". Expected ${expected}, but got ${tryStringify(value)}.`);
}
/**
 * Validate a `IRouteConfig` or `IChildRouteConfig`.
 *
 * The validation of these types is the same, except that `component` is a mandatory property of `IChildRouteConfig`.
 * This property is checked for in `validateComponent`.
 */
function validateRouteConfig(config, parentPath) {
    if (config === null || config === void 0) {
        throw new Error(`Invalid route config: expected an object or string, but got: ${String(config)}.`);
    }
    const keys = Object.keys(config);
    for (const key of keys) {
        const value = config[key];
        const path = [parentPath, key].join('.');
        switch (key) {
            case 'id':
            case 'viewport':
            case 'redirectTo':
                if (typeof value !== 'string') {
                    expectType('string', path, value);
                }
                break;
            case 'caseSensitive':
                if (typeof value !== 'boolean') {
                    expectType('boolean', path, value);
                }
                break;
            case 'data':
                if (typeof value !== 'object' || value === null) {
                    expectType('object', path, value);
                }
                break;
            case 'title':
                switch (typeof value) {
                    case 'string':
                    case 'function':
                        break;
                    default:
                        expectType('string or function', path, value);
                }
                break;
            case 'path':
                if (value instanceof Array) {
                    for (let i = 0; i < value.length; ++i) {
                        if (typeof value[i] !== 'string') {
                            expectType('string', `${path}[${i}]`, value[i]);
                        }
                    }
                }
                else if (typeof value !== 'string') {
                    expectType('string or Array of strings', path, value);
                }
                break;
            case 'component':
                validateComponent(value, path);
                break;
            case 'routes': {
                if (!(value instanceof Array)) {
                    expectType('Array', path, value);
                }
                for (const route of value) {
                    const childPath = `${path}[${value.indexOf(route)}]`; // TODO(fkleuver): remove 'any' (this type got very messy for some reason)
                    validateComponent(route, childPath);
                }
                break;
            }
            case 'transitionPlan':
                switch (typeof value) {
                    case 'string':
                        switch (value) {
                            case 'none':
                            case 'replace':
                            case 'invoke-lifecycles':
                                break;
                            default:
                                expectType('string(\'none\'|\'replace\'|\'invoke-lifecycles\') or function', path, value);
                        }
                        break;
                    case 'function':
                        break;
                    default:
                        expectType('string(\'none\'|\'replace\'|\'invoke-lifecycles\') or function', path, value);
                }
                break;
            default:
                // We don't *have* to throw here, but let's be as strict as possible until someone gives a valid reason for not doing so.
                throw new Error(`Unknown route config property: "${parentPath}.${key}". Please specify known properties only.`);
        }
    }
}
function validateRedirectRouteConfig(config, parentPath) {
    if (config === null || config === void 0) {
        throw new Error(`Invalid route config: expected an object or string, but got: ${String(config)}.`);
    }
    const keys = Object.keys(config);
    for (const key of keys) {
        const value = config[key];
        const path = [parentPath, key].join('.');
        switch (key) {
            case 'path':
            case 'redirectTo':
                if (typeof value !== 'string') {
                    expectType('string', path, value);
                }
                break;
            default:
                // We don't *have* to throw here, but let's be as strict as possible until someone gives a valid reason for not doing so.
                throw new Error(`Unknown redirect config property: "${parentPath}.${key}". Only 'path' and 'redirectTo' should be specified for redirects.`);
        }
    }
}
function validateComponent(component, parentPath) {
    switch (typeof component) {
        case 'function':
            break;
        case 'object':
            if (component instanceof Promise) {
                break;
            }
            if (isPartialRedirectRouteConfig(component)) {
                validateRedirectRouteConfig(component, parentPath);
                break;
            }
            if (isPartialChildRouteConfig(component)) {
                validateRouteConfig(component, parentPath);
                break;
            }
            if (!isCustomElementViewModel(component) &&
                !isPartialCustomElementDefinition(component)) {
                expectType(`an object with at least a 'component' property (see Routeable)`, parentPath, component);
            }
            break;
        case 'string':
            break;
        default:
            expectType('function, object or string (see Routeable)', parentPath, component);
    }
}
function shallowEquals(a, b) {
    if (a === b) {
        return true;
    }
    if (typeof a !== typeof b) {
        return false;
    }
    if (a === null || b === null) {
        return false;
    }
    if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) {
        return false;
    }
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) {
        return false;
    }
    for (let i = 0, ii = aKeys.length; i < ii; ++i) {
        const key = aKeys[i];
        if (key !== bKeys[i]) {
            return false;
        }
        if (a[key] !== b[key]) {
            return false;
        }
    }
    return true;
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
}

class Subscription {
    constructor(events, 
    /**
     * A unique serial number that makes individual subscribers more easily distinguishable in chronological order.
     *
     * Mainly for debugging purposes.
     */
    serial, inner) {
        this.events = events;
        this.serial = serial;
        this.inner = inner;
        this.disposed = false;
    }
    dispose() {
        if (!this.disposed) {
            this.disposed = true;
            this.inner.dispose();
            const subscriptions = this.events['subscriptions'];
            subscriptions.splice(subscriptions.indexOf(this), 1);
        }
    }
}
const IRouterEvents = DI.createInterface('IRouterEvents', x => x.singleton(RouterEvents));
let RouterEvents = class RouterEvents {
    constructor(ea, logger) {
        this.ea = ea;
        this.logger = logger;
        this.subscriptionSerial = 0;
        this.subscriptions = [];
        this.logger = logger.scopeTo('RouterEvents');
    }
    publish(event) {
        this.logger.trace(`publishing %s`, event);
        this.ea.publish(event.name, event);
    }
    subscribe(event, callback) {
        const subscription = new Subscription(this, ++this.subscriptionSerial, this.ea.subscribe(event, (message) => {
            this.logger.trace(`handling %s for subscription #${subscription.serial}`, event);
            callback(message);
        }));
        this.subscriptions.push(subscription);
        return subscription;
    }
};
RouterEvents = __decorate([
    __param(0, IEventAggregator),
    __param(1, ILogger)
], RouterEvents);
class LocationChangeEvent {
    constructor(id, url, trigger, state) {
        this.id = id;
        this.url = url;
        this.trigger = trigger;
        this.state = state;
    }
    get name() { return 'au:router:location-change'; }
    toString() {
        return `LocationChangeEvent(id:${this.id},url:'${this.url}',trigger:'${this.trigger}')`;
    }
}
class NavigationStartEvent {
    constructor(id, instructions, trigger, managedState) {
        this.id = id;
        this.instructions = instructions;
        this.trigger = trigger;
        this.managedState = managedState;
    }
    get name() { return 'au:router:navigation-start'; }
    toString() {
        return `NavigationStartEvent(id:${this.id},instructions:'${this.instructions}',trigger:'${this.trigger}')`;
    }
}
class NavigationEndEvent {
    constructor(id, instructions, finalInstructions) {
        this.id = id;
        this.instructions = instructions;
        this.finalInstructions = finalInstructions;
    }
    get name() { return 'au:router:navigation-end'; }
    toString() {
        return `NavigationEndEvent(id:${this.id},instructions:'${this.instructions}',finalInstructions:'${this.finalInstructions}')`;
    }
}
class NavigationCancelEvent {
    constructor(id, instructions, reason) {
        this.id = id;
        this.instructions = instructions;
        this.reason = reason;
    }
    get name() { return 'au:router:navigation-cancel'; }
    toString() {
        return `NavigationCancelEvent(id:${this.id},instructions:'${this.instructions}',reason:${String(this.reason)})`;
    }
}
class NavigationErrorEvent {
    constructor(id, instructions, error) {
        this.id = id;
        this.instructions = instructions;
        this.error = error;
    }
    get name() { return 'au:router:navigation-error'; }
    toString() {
        return `NavigationErrorEvent(id:${this.id},instructions:'${this.instructions}',error:${String(this.error)})`;
    }
}

const IBaseHrefProvider = DI.createInterface('IBaseHrefProvider', x => x.singleton(BrowserBaseHrefProvider));
class BaseHref {
    constructor(path, rootedPath) {
        this.path = path;
        this.rootedPath = rootedPath;
    }
}
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
    __param(0, IWindow)
], BrowserBaseHrefProvider);
const ILocationManager = DI.createInterface('ILocationManager', x => x.singleton(BrowserLocationManager));
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
        this.events.publish(new LocationChangeEvent(++this.eventId, this.getPath(), 'popstate', event.state));
    }
    onHashChange(_event) {
        this.logger.trace(`onHashChange()`);
        this.events.publish(new LocationChangeEvent(++this.eventId, this.getPath(), 'hashchange', null));
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

// No-fallthrough disabled due to large numbers of false positives
class ViewportRequest {
    constructor(viewportName, componentName, resolution, append) {
        this.viewportName = viewportName;
        this.componentName = componentName;
        this.resolution = resolution;
        this.append = append;
    }
    static create(input) {
        return new ViewportRequest(input.viewportName, input.componentName, input.resolution, input.append);
    }
    toString() {
        return `VR(viewport:'${this.viewportName}',component:'${this.componentName}',resolution:'${this.resolution}',append:${this.append})`;
    }
}
const viewportAgentLookup = new WeakMap();
class ViewportAgent {
    constructor(viewport, hostController, ctx) {
        this.viewport = viewport;
        this.hostController = hostController;
        this.ctx = ctx;
        this.isActive = false;
        this.curCA = null;
        this.nextCA = null;
        this.state = 8256 /* bothAreEmpty */;
        this.$resolution = 'dynamic';
        this.$plan = 'replace';
        this.currNode = null;
        this.nextNode = null;
        this.currTransition = null;
        this.prevTransition = null;
        this.logger = ctx.container.get(ILogger).scopeTo(`ViewportAgent<${ctx.friendlyPath}>`);
        this.logger.trace(`constructor()`);
    }
    get $state() { return $state(this.state); }
    get currState() { return this.state & 16256 /* curr */; }
    set currState(state) { this.state = (this.state & 127 /* next */) | state; }
    get nextState() { return this.state & 127 /* next */; }
    set nextState(state) { this.state = (this.state & 16256 /* curr */) | state; }
    static for(viewport, ctx) {
        let viewportAgent = viewportAgentLookup.get(viewport);
        if (viewportAgent === void 0) {
            const controller = Controller.getCachedOrThrow(viewport);
            viewportAgentLookup.set(viewport, viewportAgent = new ViewportAgent(viewport, controller, ctx));
        }
        return viewportAgent;
    }
    activateFromViewport(initiator, parent, flags) {
        const tr = this.currTransition;
        if (tr !== null) {
            ensureTransitionHasNotErrored(tr);
        }
        this.isActive = true;
        switch (this.nextState) {
            case 64 /* nextIsEmpty */:
                switch (this.currState) {
                    case 8192 /* currIsEmpty */:
                        this.logger.trace(`activateFromViewport() - nothing to activate at %s`, this);
                        return;
                    case 4096 /* currIsActive */:
                        this.logger.trace(`activateFromViewport() - activating existing componentAgent at %s`, this);
                        return this.curCA.activate(initiator, parent, flags);
                    default:
                        this.unexpectedState('activateFromViewport 1');
                }
            case 2 /* nextLoadDone */: {
                if (this.currTransition === null) {
                    throw new Error(`Unexpected viewport activation outside of a transition context at ${this}`);
                }
                if (this.$resolution !== 'static') {
                    throw new Error(`Unexpected viewport activation at ${this}`);
                }
                this.logger.trace(`activateFromViewport() - running ordinary activate at %s`, this);
                const b = Batch.start(b1 => { this.activate(initiator, this.currTransition, b1); });
                const p = new Promise(resolve => { b.continueWith(() => { resolve(); }); });
                return b.start().done ? void 0 : p;
            }
            default:
                this.unexpectedState('activateFromViewport 2');
        }
    }
    deactivateFromViewport(initiator, parent, flags) {
        const tr = this.currTransition;
        if (tr !== null) {
            ensureTransitionHasNotErrored(tr);
        }
        this.isActive = false;
        switch (this.currState) {
            case 8192 /* currIsEmpty */:
                this.logger.trace(`deactivateFromViewport() - nothing to deactivate at %s`, this);
                return;
            case 4096 /* currIsActive */:
                this.logger.trace(`deactivateFromViewport() - deactivating existing componentAgent at %s`, this);
                return this.curCA.deactivate(initiator, parent, flags);
            case 128 /* currDeactivate */:
                // This will happen with bottom-up deactivation because the child is already deactivated, the parent
                // again tries to deactivate the child (that would be this viewport) but the router hasn't finalized the transition yet.
                // Since this is viewport was already deactivated, and we know the precise circumstance under which that happens, we can safely ignore the call.
                this.logger.trace(`deactivateFromViewport() - already deactivating at %s`, this);
                return;
            default: {
                if (this.currTransition === null) {
                    throw new Error(`Unexpected viewport deactivation outside of a transition context at ${this}`);
                }
                this.logger.trace(`deactivateFromViewport() - running ordinary deactivate at %s`, this);
                const b = Batch.start(b1 => { this.deactivate(initiator, this.currTransition, b1); });
                const p = new Promise(resolve => { b.continueWith(() => { resolve(); }); });
                return b.start().done ? void 0 : p;
            }
        }
    }
    handles(req) {
        if (!this.isAvailable(req.resolution)) {
            return false;
        }
        if (req.append && this.currState === 4096 /* currIsActive */) {
            this.logger.trace(`handles(req:%s) -> false (append mode, viewport already has content %s)`, req, this.curCA);
            return false;
        }
        if (req.viewportName.length > 0 && this.viewport.name !== req.viewportName) {
            this.logger.trace(`handles(req:%s) -> false (names don't match)`, req);
            return false;
        }
        if (this.viewport.usedBy.length > 0 && !this.viewport.usedBy.split(',').includes(req.componentName)) {
            this.logger.trace(`handles(req:%s) -> false (componentName not included in usedBy)`, req);
            return false;
        }
        this.logger.trace(`handles(req:%s) -> true`, req);
        return true;
    }
    isAvailable(resolution) {
        if (resolution === 'dynamic' && !this.isActive) {
            this.logger.trace(`isAvailable(resolution:%s) -> false (viewport is not active and we're in dynamic resolution resolution)`, resolution);
            return false;
        }
        if (this.nextState !== 64 /* nextIsEmpty */) {
            this.logger.trace(`isAvailable(resolution:%s) -> false (update already scheduled for %s)`, resolution, this.nextNode);
            return false;
        }
        return true;
    }
    canUnload(tr, b) {
        if (this.currTransition === null) {
            this.currTransition = tr;
        }
        ensureTransitionHasNotErrored(tr);
        if (tr.guardsResult !== true) {
            return;
        }
        b.push();
        // run canUnload bottom-up
        Batch.start(b1 => {
            this.logger.trace(`canUnload() - invoking on children at %s`, this);
            for (const node of this.currNode.children) {
                node.context.vpa.canUnload(tr, b1);
            }
        }).continueWith(b1 => {
            switch (this.currState) {
                case 4096 /* currIsActive */:
                    this.logger.trace(`canUnload() - invoking on existing component at %s`, this);
                    switch (this.$plan) {
                        case 'none':
                            this.currState = 1024 /* currCanUnloadDone */;
                            return;
                        case 'invoke-lifecycles':
                        case 'replace':
                            this.currState = 2048 /* currCanUnload */;
                            b1.push();
                            Batch.start(b2 => {
                                this.logger.trace(`canUnload() - finished invoking on children, now invoking on own component at %s`, this);
                                this.curCA.canUnload(tr, this.nextNode, b2);
                            }).continueWith(() => {
                                this.logger.trace(`canUnload() - finished at %s`, this);
                                this.currState = 1024 /* currCanUnloadDone */;
                                b1.pop();
                            }).start();
                            return;
                    }
                case 8192 /* currIsEmpty */:
                    this.logger.trace(`canUnload() - nothing to unload at %s`, this);
                    return;
                default:
                    tr.handleError(new Error(`Unexpected state at canUnload of ${this}`));
            }
        }).continueWith(() => {
            b.pop();
        }).start();
    }
    canLoad(tr, b) {
        if (this.currTransition === null) {
            this.currTransition = tr;
        }
        ensureTransitionHasNotErrored(tr);
        if (tr.guardsResult !== true) {
            return;
        }
        b.push();
        // run canLoad top-down
        Batch.start(b1 => {
            switch (this.nextState) {
                case 32 /* nextIsScheduled */:
                    this.logger.trace(`canLoad() - invoking on new component at %s`, this);
                    this.nextState = 16 /* nextCanLoad */;
                    switch (this.$plan) {
                        case 'none':
                            return;
                        case 'invoke-lifecycles':
                            return this.curCA.canLoad(tr, this.nextNode, b1);
                        case 'replace':
                            this.nextCA = this.nextNode.context.createComponentAgent(this.hostController, this.nextNode);
                            return this.nextCA.canLoad(tr, this.nextNode, b1);
                    }
                case 64 /* nextIsEmpty */:
                    this.logger.trace(`canLoad() - nothing to load at %s`, this);
                    return;
                default:
                    this.unexpectedState('canLoad');
            }
        }).continueWith(b1 => {
            const next = this.nextNode;
            switch (this.$plan) {
                case 'none':
                case 'invoke-lifecycles':
                    this.logger.trace(`canLoad(next:%s) - plan set to '%s', compiling residue`, next, this.$plan);
                    // These plans can only occur if there is already a current component active in this viewport,
                    // and it is the same component as `next`.
                    // This means the RouteContext of `next` was created during a previous transition and might contain
                    // already-active children. If that is the case, we want to eagerly call the router hooks on them during the
                    // first pass of activation, instead of lazily in a later pass after `processResidue`.
                    // By calling `compileResidue` here on the current context, we're ensuring that such nodes are created and
                    // their target viewports have the appropriate updates scheduled.
                    b1.push();
                    void onResolve(processResidue(next), () => {
                        b1.pop();
                    });
                    return;
                case 'replace':
                    // In the case of 'replace', always process this node and its subtree as if it's a new one
                    switch (this.$resolution) {
                        case 'dynamic':
                            // Residue compilation will happen at `ViewportAgent#processResidue`
                            this.logger.trace(`canLoad(next:%s) - (resolution: 'dynamic'), delaying residue compilation until activate`, next, this.$plan);
                            return;
                        case 'static':
                            this.logger.trace(`canLoad(next:%s) - (resolution: '${this.$resolution}'), creating nextCA and compiling residue`, next, this.$plan);
                            b1.push();
                            void onResolve(processResidue(next), () => {
                                b1.pop();
                            });
                            return;
                    }
            }
        }).continueWith(b1 => {
            switch (this.nextState) {
                case 16 /* nextCanLoad */:
                    this.logger.trace(`canLoad() - finished own component, now invoking on children at %s`, this);
                    this.nextState = 8 /* nextCanLoadDone */;
                    for (const node of this.nextNode.children) {
                        node.context.vpa.canLoad(tr, b1);
                    }
                    return;
                case 64 /* nextIsEmpty */:
                    return;
                default:
                    this.unexpectedState('canLoad');
            }
        }).continueWith(() => {
            this.logger.trace(`canLoad() - finished at %s`, this);
            b.pop();
        }).start();
    }
    unload(tr, b) {
        ensureTransitionHasNotErrored(tr);
        ensureGuardsResultIsTrue(this, tr);
        b.push();
        // run unload bottom-up
        Batch.start(b1 => {
            this.logger.trace(`unload() - invoking on children at %s`, this);
            for (const node of this.currNode.children) {
                node.context.vpa.unload(tr, b1);
            }
        }).continueWith(b1 => {
            switch (this.currState) {
                case 1024 /* currCanUnloadDone */:
                    this.logger.trace(`unload() - invoking on existing component at %s`, this);
                    switch (this.$plan) {
                        case 'none':
                            this.currState = 256 /* currUnloadDone */;
                            return;
                        case 'invoke-lifecycles':
                        case 'replace':
                            this.currState = 512 /* currUnload */;
                            b1.push();
                            Batch.start(b2 => {
                                this.logger.trace(`unload() - finished invoking on children, now invoking on own component at %s`, this);
                                this.curCA.unload(tr, this.nextNode, b2);
                            }).continueWith(() => {
                                this.logger.trace(`unload() - finished at %s`, this);
                                this.currState = 256 /* currUnloadDone */;
                                b1.pop();
                            }).start();
                            return;
                    }
                case 8192 /* currIsEmpty */:
                    this.logger.trace(`unload() - nothing to unload at %s`, this);
                    for (const node of this.currNode.children) {
                        node.context.vpa.unload(tr, b);
                    }
                    return;
                default:
                    this.unexpectedState('unload');
            }
        }).continueWith(() => {
            b.pop();
        }).start();
    }
    load(tr, b) {
        ensureTransitionHasNotErrored(tr);
        ensureGuardsResultIsTrue(this, tr);
        b.push();
        // run load top-down
        Batch.start(b1 => {
            switch (this.nextState) {
                case 8 /* nextCanLoadDone */: {
                    this.logger.trace(`load() - invoking on new component at %s`, this);
                    this.nextState = 4 /* nextLoad */;
                    switch (this.$plan) {
                        case 'none':
                            return;
                        case 'invoke-lifecycles':
                            return this.curCA.load(tr, this.nextNode, b1);
                        case 'replace':
                            return this.nextCA.load(tr, this.nextNode, b1);
                    }
                }
                case 64 /* nextIsEmpty */:
                    this.logger.trace(`load() - nothing to load at %s`, this);
                    return;
                default:
                    this.unexpectedState('load');
            }
        }).continueWith(b1 => {
            switch (this.nextState) {
                case 4 /* nextLoad */:
                    this.logger.trace(`load() - finished own component, now invoking on children at %s`, this);
                    this.nextState = 2 /* nextLoadDone */;
                    for (const node of this.nextNode.children) {
                        node.context.vpa.load(tr, b1);
                    }
                    return;
                case 64 /* nextIsEmpty */:
                    return;
                default:
                    this.unexpectedState('load');
            }
        }).continueWith(() => {
            this.logger.trace(`load() - finished at %s`, this);
            b.pop();
        }).start();
    }
    deactivate(initiator, tr, b) {
        ensureTransitionHasNotErrored(tr);
        ensureGuardsResultIsTrue(this, tr);
        b.push();
        switch (this.currState) {
            case 256 /* currUnloadDone */:
                this.logger.trace(`deactivate() - invoking on existing component at %s`, this);
                this.currState = 128 /* currDeactivate */;
                switch (this.$plan) {
                    case 'none':
                    case 'invoke-lifecycles':
                        b.pop();
                        return;
                    case 'replace': {
                        const controller = this.hostController;
                        const deactivateFlags = this.viewport.stateful ? 0 /* none */ : 32 /* dispose */;
                        tr.run(() => {
                            return this.curCA.deactivate(initiator, controller, deactivateFlags);
                        }, () => {
                            b.pop();
                        });
                    }
                }
                return;
            case 8192 /* currIsEmpty */:
                this.logger.trace(`deactivate() - nothing to deactivate at %s`, this);
                b.pop();
                return;
            case 128 /* currDeactivate */:
                this.logger.trace(`deactivate() - already deactivating at %s`, this);
                b.pop();
                return;
            default:
                this.unexpectedState('deactivate');
        }
    }
    activate(initiator, tr, b) {
        ensureTransitionHasNotErrored(tr);
        ensureGuardsResultIsTrue(this, tr);
        b.push();
        if (this.nextState === 32 /* nextIsScheduled */ &&
            this.$resolution === 'dynamic') {
            this.logger.trace(`activate() - invoking canLoad(), load() and activate() on new component due to resolution 'dynamic' at %s`, this);
            // This is the default v2 mode "lazy loading" situation
            Batch.start(b1 => {
                this.canLoad(tr, b1);
            }).continueWith(b1 => {
                this.load(tr, b1);
            }).continueWith(b1 => {
                this.activate(initiator, tr, b1);
            }).continueWith(() => {
                b.pop();
            }).start();
            return;
        }
        switch (this.nextState) {
            case 2 /* nextLoadDone */:
                this.logger.trace(`activate() - invoking on existing component at %s`, this);
                this.nextState = 1 /* nextActivate */;
                // run activate top-down
                Batch.start(b1 => {
                    switch (this.$plan) {
                        case 'none':
                        case 'invoke-lifecycles':
                            return;
                        case 'replace': {
                            const controller = this.hostController;
                            const activateFlags = 0 /* none */;
                            tr.run(() => {
                                b1.push();
                                return this.nextCA.activate(initiator, controller, activateFlags);
                            }, () => {
                                b1.pop();
                            });
                        }
                    }
                }).continueWith(b1 => {
                    this.processDynamicChildren(tr, b1);
                }).continueWith(() => {
                    b.pop();
                }).start();
                return;
            case 64 /* nextIsEmpty */:
                this.logger.trace(`activate() - nothing to activate at %s`, this);
                b.pop();
                return;
            default:
                this.unexpectedState('activate');
        }
    }
    swap(tr, b) {
        if (this.currState === 8192 /* currIsEmpty */) {
            this.logger.trace(`swap() - running activate on next instead, because there is nothing to deactivate at %s`, this);
            this.activate(null, tr, b);
            return;
        }
        if (this.nextState === 64 /* nextIsEmpty */) {
            this.logger.trace(`swap() - running deactivate on current instead, because there is nothing to activate at %s`, this);
            this.deactivate(null, tr, b);
            return;
        }
        ensureTransitionHasNotErrored(tr);
        ensureGuardsResultIsTrue(this, tr);
        if (!(this.currState === 256 /* currUnloadDone */ &&
            this.nextState === 2 /* nextLoadDone */)) {
            this.unexpectedState('swap');
        }
        this.currState = 128 /* currDeactivate */;
        this.nextState = 1 /* nextActivate */;
        switch (this.$plan) {
            case 'none':
            case 'invoke-lifecycles': {
                this.logger.trace(`swap() - skipping this level and swapping children instead at %s`, this);
                const nodes = mergeDistinct(this.nextNode.children, this.currNode.children);
                for (const node of nodes) {
                    node.context.vpa.swap(tr, b);
                }
                return;
            }
            case 'replace': {
                this.logger.trace(`swap() - running normally at %s`, this);
                const controller = this.hostController;
                const curCA = this.curCA;
                const nextCA = this.nextCA;
                const deactivateFlags = this.viewport.stateful ? 0 /* none */ : 32 /* dispose */;
                const activateFlags = 0 /* none */;
                b.push();
                switch (tr.options.swapStrategy) {
                    case 'sequential-add-first':
                        Batch.start(b1 => {
                            tr.run(() => {
                                b1.push();
                                return nextCA.activate(null, controller, activateFlags);
                            }, () => {
                                b1.pop();
                            });
                        }).continueWith(b1 => {
                            this.processDynamicChildren(tr, b1);
                        }).continueWith(() => {
                            tr.run(() => {
                                return curCA.deactivate(null, controller, deactivateFlags);
                            }, () => {
                                b.pop();
                            });
                        }).start();
                        return;
                    case 'sequential-remove-first':
                        Batch.start(b1 => {
                            tr.run(() => {
                                b1.push();
                                return curCA.deactivate(null, controller, deactivateFlags);
                            }, () => {
                                b1.pop();
                            });
                        }).continueWith(b1 => {
                            tr.run(() => {
                                b1.push();
                                return nextCA.activate(null, controller, activateFlags);
                            }, () => {
                                b1.pop();
                            });
                        }).continueWith(b1 => {
                            this.processDynamicChildren(tr, b1);
                        }).continueWith(() => {
                            b.pop();
                        }).start();
                        return;
                    case 'parallel-remove-first':
                        tr.run(() => {
                            b.push();
                            return curCA.deactivate(null, controller, deactivateFlags);
                        }, () => {
                            b.pop();
                        });
                        Batch.start(b1 => {
                            tr.run(() => {
                                b1.push();
                                return nextCA.activate(null, controller, activateFlags);
                            }, () => {
                                b1.pop();
                            });
                        }).continueWith(b1 => {
                            this.processDynamicChildren(tr, b1);
                        }).continueWith(() => {
                            b.pop();
                        }).start();
                        return;
                }
            }
        }
    }
    processDynamicChildren(tr, b) {
        this.logger.trace(`processDynamicChildren() - %s`, this);
        const next = this.nextNode;
        tr.run(() => {
            b.push();
            return getDynamicChildren(next);
        }, newChildren => {
            Batch.start(b1 => {
                for (const node of newChildren) {
                    tr.run(() => {
                        b1.push();
                        return node.context.vpa.canLoad(tr, b1);
                    }, () => {
                        b1.pop();
                    });
                }
            }).continueWith(b1 => {
                for (const node of newChildren) {
                    tr.run(() => {
                        b1.push();
                        return node.context.vpa.load(tr, b1);
                    }, () => {
                        b1.pop();
                    });
                }
            }).continueWith(b1 => {
                for (const node of newChildren) {
                    tr.run(() => {
                        b1.push();
                        return node.context.vpa.activate(null, tr, b1);
                    }, () => {
                        b1.pop();
                    });
                }
            }).continueWith(() => {
                b.pop();
            }).start();
        });
    }
    scheduleUpdate(options, next) {
        var _a, _b;
        switch (this.nextState) {
            case 64 /* nextIsEmpty */:
                this.nextNode = next;
                this.nextState = 32 /* nextIsScheduled */;
                this.$resolution = options.resolutionMode;
                break;
            default:
                this.unexpectedState('scheduleUpdate 1');
        }
        switch (this.currState) {
            case 8192 /* currIsEmpty */:
            case 4096 /* currIsActive */:
            case 1024 /* currCanUnloadDone */:
                break;
            default:
                this.unexpectedState('scheduleUpdate 2');
        }
        const cur = (_b = (_a = this.curCA) === null || _a === void 0 ? void 0 : _a.routeNode) !== null && _b !== void 0 ? _b : null;
        if (cur === null || cur.component !== next.component) {
            // Component changed (or is cleared), so set to 'replace'
            this.$plan = 'replace';
        }
        else {
            // Component is the same, so determine plan based on config and/or convention
            const plan = next.context.definition.config.transitionPlan;
            if (typeof plan === 'function') {
                this.$plan = plan(cur, next);
            }
            else {
                this.$plan = plan;
            }
        }
        this.logger.trace(`scheduleUpdate(next:%s) - plan set to '%s'`, next, this.$plan);
    }
    cancelUpdate() {
        if (this.currNode !== null) {
            this.currNode.children.forEach(function (node) {
                node.context.vpa.cancelUpdate();
            });
        }
        if (this.nextNode !== null) {
            this.nextNode.children.forEach(function (node) {
                node.context.vpa.cancelUpdate();
            });
        }
        this.logger.trace(`cancelUpdate(nextNode:%s)`, this.nextNode);
        switch (this.currState) {
            case 8192 /* currIsEmpty */:
            case 4096 /* currIsActive */:
                break;
            case 2048 /* currCanUnload */:
            case 1024 /* currCanUnloadDone */:
                this.currState = 4096 /* currIsActive */;
                break;
        }
        switch (this.nextState) {
            case 64 /* nextIsEmpty */:
            case 32 /* nextIsScheduled */:
            case 16 /* nextCanLoad */:
            case 8 /* nextCanLoadDone */:
                this.nextNode = null;
                this.nextState = 64 /* nextIsEmpty */;
                break;
        }
    }
    endTransition() {
        if (this.currNode !== null) {
            this.currNode.children.forEach(function (node) {
                node.context.vpa.endTransition();
            });
        }
        if (this.nextNode !== null) {
            this.nextNode.children.forEach(function (node) {
                node.context.vpa.endTransition();
            });
        }
        if (this.currTransition !== null) {
            ensureTransitionHasNotErrored(this.currTransition);
            switch (this.nextState) {
                case 64 /* nextIsEmpty */:
                    switch (this.currState) {
                        case 128 /* currDeactivate */:
                            this.logger.trace(`endTransition() - setting currState to State.nextIsEmpty at %s`, this);
                            this.currState = 8192 /* currIsEmpty */;
                            this.curCA = null;
                            break;
                        default:
                            this.unexpectedState('endTransition 1');
                    }
                    break;
                case 1 /* nextActivate */:
                    switch (this.currState) {
                        case 8192 /* currIsEmpty */:
                        case 128 /* currDeactivate */:
                            switch (this.$plan) {
                                case 'none':
                                case 'invoke-lifecycles':
                                    this.logger.trace(`endTransition() - setting currState to State.currIsActive at %s`, this);
                                    this.currState = 4096 /* currIsActive */;
                                    break;
                                case 'replace':
                                    this.logger.trace(`endTransition() - setting currState to State.currIsActive and reassigning curCA at %s`, this);
                                    this.currState = 4096 /* currIsActive */;
                                    this.curCA = this.nextCA;
                                    break;
                            }
                            this.currNode = this.nextNode;
                            break;
                        default:
                            this.unexpectedState('endTransition 2');
                    }
                    break;
                default:
                    this.unexpectedState('endTransition 3');
            }
            this.$plan = 'replace';
            this.nextState = 64 /* nextIsEmpty */;
            this.nextNode = null;
            this.nextCA = null;
            this.prevTransition = this.currTransition;
            this.currTransition = null;
        }
    }
    toString() {
        return `VPA(state:${this.$state},plan:'${this.$plan}',resolution:'${this.$resolution}',n:${this.nextNode},c:${this.currNode},viewport:${this.viewport})`;
    }
    dispose() {
        var _a;
        if (this.viewport.stateful /* TODO: incorporate statefulHistoryLength / router opts as well */) {
            this.logger.trace(`dispose() - not disposing stateful viewport at %s`, this);
        }
        else {
            this.logger.trace(`dispose() - disposing %s`, this);
            (_a = this.curCA) === null || _a === void 0 ? void 0 : _a.dispose();
        }
    }
    unexpectedState(label) {
        throw new Error(`Unexpected state at ${label} of ${this}`);
    }
}
function ensureGuardsResultIsTrue(vpa, tr) {
    if (tr.guardsResult !== true) {
        throw new Error(`Unexpected guardsResult ${tr.guardsResult} at ${vpa}`);
    }
}
function ensureTransitionHasNotErrored(tr) {
    if (tr.error !== void 0) {
        throw tr.error;
    }
}
var State;
(function (State) {
    State[State["curr"] = 16256] = "curr";
    State[State["currIsEmpty"] = 8192] = "currIsEmpty";
    State[State["currIsActive"] = 4096] = "currIsActive";
    State[State["currCanUnload"] = 2048] = "currCanUnload";
    State[State["currCanUnloadDone"] = 1024] = "currCanUnloadDone";
    State[State["currUnload"] = 512] = "currUnload";
    State[State["currUnloadDone"] = 256] = "currUnloadDone";
    State[State["currDeactivate"] = 128] = "currDeactivate";
    State[State["next"] = 127] = "next";
    State[State["nextIsEmpty"] = 64] = "nextIsEmpty";
    State[State["nextIsScheduled"] = 32] = "nextIsScheduled";
    State[State["nextCanLoad"] = 16] = "nextCanLoad";
    State[State["nextCanLoadDone"] = 8] = "nextCanLoadDone";
    State[State["nextLoad"] = 4] = "nextLoad";
    State[State["nextLoadDone"] = 2] = "nextLoadDone";
    State[State["nextActivate"] = 1] = "nextActivate";
    State[State["bothAreEmpty"] = 8256] = "bothAreEmpty";
})(State || (State = {}));
// Stringifying uses arrays and does not have a negligible cost, so cache the results to not let trace logging
// in and of its own slow things down too much.
const $stateCache = new Map();
function $state(state) {
    let str = $stateCache.get(state);
    if (str === void 0) {
        $stateCache.set(state, str = stringifyState(state));
    }
    return str;
}
function stringifyState(state) {
    const flags = [];
    if ((state & 8192 /* currIsEmpty */) === 8192 /* currIsEmpty */) {
        flags.push('currIsEmpty');
    }
    if ((state & 4096 /* currIsActive */) === 4096 /* currIsActive */) {
        flags.push('currIsActive');
    }
    if ((state & 2048 /* currCanUnload */) === 2048 /* currCanUnload */) {
        flags.push('currCanUnload');
    }
    if ((state & 1024 /* currCanUnloadDone */) === 1024 /* currCanUnloadDone */) {
        flags.push('currCanUnloadDone');
    }
    if ((state & 512 /* currUnload */) === 512 /* currUnload */) {
        flags.push('currUnload');
    }
    if ((state & 256 /* currUnloadDone */) === 256 /* currUnloadDone */) {
        flags.push('currUnloadDone');
    }
    if ((state & 128 /* currDeactivate */) === 128 /* currDeactivate */) {
        flags.push('currDeactivate');
    }
    if ((state & 64 /* nextIsEmpty */) === 64 /* nextIsEmpty */) {
        flags.push('nextIsEmpty');
    }
    if ((state & 32 /* nextIsScheduled */) === 32 /* nextIsScheduled */) {
        flags.push('nextIsScheduled');
    }
    if ((state & 16 /* nextCanLoad */) === 16 /* nextCanLoad */) {
        flags.push('nextCanLoad');
    }
    if ((state & 8 /* nextCanLoadDone */) === 8 /* nextCanLoadDone */) {
        flags.push('nextCanLoadDone');
    }
    if ((state & 4 /* nextLoad */) === 4 /* nextLoad */) {
        flags.push('nextLoad');
    }
    if ((state & 2 /* nextLoadDone */) === 2 /* nextLoadDone */) {
        flags.push('nextLoadDone');
    }
    if ((state & 1 /* nextActivate */) === 1 /* nextActivate */) {
        flags.push('nextActivate');
    }
    return flags.join('|');
}

// The commented-out terminal symbols below are for reference / potential future need (should there be use cases to loosen up the syntax)
// These are the currently used terminal symbols.
// We're deliberately having every "special" (including the not-in-use '&', ''', '~', ';') as a terminal symbol,
// so as to make the syntax maximally restrictive for consistency and to minimize the risk of us having to introduce breaking changes in the future.
const terminal = ['?', '#', '/', '+', '(', ')', '.', '@', '!', '=', ',', '&', '\'', '~', ';'];
class ParserState {
    constructor(input) {
        this.input = input;
        this.buffers = [];
        this.bufferIndex = 0;
        this.index = 0;
        this.rest = input;
    }
    get done() {
        return this.rest.length === 0;
    }
    startsWith(...values) {
        const rest = this.rest;
        return values.some(function (value) {
            return rest.startsWith(value);
        });
    }
    consumeOptional(str) {
        if (this.startsWith(str)) {
            this.rest = this.rest.slice(str.length);
            this.index += str.length;
            this.append(str);
            return true;
        }
        return false;
    }
    consume(str) {
        if (!this.consumeOptional(str)) {
            this.expect(`'${str}'`);
        }
    }
    expect(msg) {
        throw new Error(`Expected ${msg} at index ${this.index} of '${this.input}', but got: '${this.rest}' (rest='${this.rest}')`);
    }
    ensureDone() {
        if (!this.done) {
            throw new Error(`Unexpected '${this.rest}' at index ${this.index} of '${this.input}'`);
        }
    }
    advance() {
        const char = this.rest[0];
        this.rest = this.rest.slice(1);
        ++this.index;
        this.append(char);
    }
    record() {
        this.buffers[this.bufferIndex++] = '';
    }
    playback() {
        const bufferIndex = --this.bufferIndex;
        const buffers = this.buffers;
        const buffer = buffers[bufferIndex];
        buffers[bufferIndex] = '';
        return buffer;
    }
    discard() {
        this.buffers[--this.bufferIndex] = '';
    }
    append(str) {
        const bufferIndex = this.bufferIndex;
        const buffers = this.buffers;
        for (let i = 0; i < bufferIndex; ++i) {
            buffers[i] += str;
        }
    }
}
var ExpressionKind;
(function (ExpressionKind) {
    ExpressionKind[ExpressionKind["Route"] = 0] = "Route";
    ExpressionKind[ExpressionKind["CompositeSegment"] = 1] = "CompositeSegment";
    ExpressionKind[ExpressionKind["ScopedSegment"] = 2] = "ScopedSegment";
    ExpressionKind[ExpressionKind["SegmentGroup"] = 3] = "SegmentGroup";
    ExpressionKind[ExpressionKind["Segment"] = 4] = "Segment";
    ExpressionKind[ExpressionKind["Component"] = 5] = "Component";
    ExpressionKind[ExpressionKind["Action"] = 6] = "Action";
    ExpressionKind[ExpressionKind["Viewport"] = 7] = "Viewport";
    ExpressionKind[ExpressionKind["ParameterList"] = 8] = "ParameterList";
    ExpressionKind[ExpressionKind["Parameter"] = 9] = "Parameter";
})(ExpressionKind || (ExpressionKind = {}));
const fragmentRouteExpressionCache = new Map();
const routeExpressionCache = new Map();
class RouteExpression {
    constructor(raw, isAbsolute, root, queryParams, fragment, fragmentIsRoute) {
        this.raw = raw;
        this.isAbsolute = isAbsolute;
        this.root = root;
        this.queryParams = queryParams;
        this.fragment = fragment;
        this.fragmentIsRoute = fragmentIsRoute;
    }
    get kind() { return 0 /* Route */; }
    static parse(path, fragmentIsRoute) {
        const cache = fragmentIsRoute ? fragmentRouteExpressionCache : routeExpressionCache;
        let result = cache.get(path);
        if (result === void 0) {
            cache.set(path, result = RouteExpression.$parse(path, fragmentIsRoute));
        }
        return result;
    }
    static $parse(path, fragmentIsRoute) {
        // First strip off the fragment (and if fragment should be used as route, set it as the path)
        let fragment;
        const fragmentStart = path.indexOf('#');
        if (fragmentStart >= 0) {
            const rawFragment = path.slice(fragmentStart + 1);
            fragment = decodeURIComponent(rawFragment);
            if (fragmentIsRoute) {
                path = fragment;
            }
            else {
                path = path.slice(0, fragmentStart);
            }
        }
        else {
            if (fragmentIsRoute) {
                path = '';
            }
            fragment = null;
        }
        // Strip off and parse the query string using built-in URLSearchParams.
        let queryParams = null;
        const queryStart = path.indexOf('?');
        if (queryStart >= 0) {
            const queryString = path.slice(queryStart + 1);
            path = path.slice(0, queryStart);
            queryParams = new URLSearchParams(queryString);
        }
        if (path === '') {
            return new RouteExpression('', false, SegmentExpression.EMPTY, Object.freeze(queryParams !== null && queryParams !== void 0 ? queryParams : new URLSearchParams()), fragment, fragmentIsRoute);
        }
        /*
         * Now parse the actual route
         *
         * Notes:
         * A NT-Name as per DOM level 2: https://www.w3.org/TR/1998/REC-xml-19980210#NT-Name
         *  [4]  NameChar ::= Letter | Digit | '.' | '-' | '_' | ':' | CombiningChar | Extender
         *  [5]  Name     ::= (Letter | '_' | ':') (NameChar)*
         *
         * As per https://url.spec.whatwg.org/#url-code-points - URL code points (from the ASCII range) are:
         * a-zA-Z0-9!$&'()*+,-./:;=?@_~
         * The other valid option is a % followed by two ASCII hex digits
         * Anything else is invalid.
         */
        const state = new ParserState(path);
        state.record();
        const isAbsolute = state.consumeOptional('/');
        const root = CompositeSegmentExpression.parse(state);
        state.ensureDone();
        const raw = state.playback();
        return new RouteExpression(raw, isAbsolute, root, Object.freeze(queryParams !== null && queryParams !== void 0 ? queryParams : new URLSearchParams()), fragment, fragmentIsRoute);
    }
    toInstructionTree(options) {
        return new ViewportInstructionTree(options, this.isAbsolute, this.root.toInstructions(options.append, 0, 0), this.queryParams, this.fragment);
    }
    toString() {
        return this.raw;
    }
}
/**
 * A single 'traditional' (slash-separated) segment consisting of one or more sibling segments.
 *
 * ### Variations:
 *
 * 1: `a+b`
 * - siblings: [`a`, `b`]
 * - append: `false`
 *
 * 2: `+a`
 * - siblings: [`a`]
 * - append: `true`
 *
 * 3: `+a+a`
 * - siblings: [`a`, `b`]
 * - append: `true`
 *
 * Where
 * - a = `CompositeSegmentExpressionOrHigher` (`SegmentExpression | SegmentGroupExpression | ScopedSegmentExpression | CompositeSegmentExpression`)
 * - b = `CompositeSegmentExpressionOrHigher` (`SegmentExpression | SegmentGroupExpression | ScopedSegmentExpression | CompositeSegmentExpression`)
 */
class CompositeSegmentExpression {
    constructor(raw, siblings, append) {
        this.raw = raw;
        this.siblings = siblings;
        this.append = append;
    }
    get kind() { return 1 /* CompositeSegment */; }
    static parse(state) {
        state.record();
        // If a segment starts with '+', e.g. '/+a' / '/+a@vp' / '/a/+b' / '/+a+b' etc, then its siblings
        // are considered to be "append"
        const append = state.consumeOptional('+');
        const siblings = [];
        do {
            siblings.push(ScopedSegmentExpression.parse(state));
        } while (state.consumeOptional('+'));
        if (!append && siblings.length === 1) {
            state.discard();
            return siblings[0];
        }
        const raw = state.playback();
        return new CompositeSegmentExpression(raw, siblings, append);
    }
    toInstructions(append, open, close) {
        switch (this.siblings.length) {
            case 0:
                return [];
            case 1:
                return this.siblings[0].toInstructions(append, open, close);
            case 2:
                return [
                    ...this.siblings[0].toInstructions(append, open, 0),
                    ...this.siblings[1].toInstructions(append, 0, close),
                ];
            default:
                return [
                    ...this.siblings[0].toInstructions(append, open, 0),
                    ...this.siblings.slice(1, -1).flatMap(function (x) {
                        return x.toInstructions(append, 0, 0);
                    }),
                    ...this.siblings[this.siblings.length - 1].toInstructions(append, 0, close),
                ];
        }
    }
    toString() {
        return this.raw;
    }
}
/**
 * The (single) left-hand side and the (one or more) right-hand side of a slash-separated segment.
 *
 * Variations:
 *
 * 1: `a/b`
 * - left: `a`
 * - right: `b`
 *
 * Where
 * - a = `SegmentGroupExpressionOrHigher` (`SegmentExpression | SegmentGroupExpression`)
 * - b = `ScopedSegmentExpressionOrHigher` (`SegmentExpression | SegmentGroupExpression | ScopedSegmentExpression`)
 */
class ScopedSegmentExpression {
    constructor(raw, left, right) {
        this.raw = raw;
        this.left = left;
        this.right = right;
    }
    get kind() { return 2 /* ScopedSegment */; }
    static parse(state) {
        state.record();
        const left = SegmentGroupExpression.parse(state);
        if (state.consumeOptional('/')) {
            const right = ScopedSegmentExpression.parse(state);
            const raw = state.playback();
            return new ScopedSegmentExpression(raw, left, right);
        }
        state.discard();
        return left;
    }
    toInstructions(append, open, close) {
        const leftInstructions = this.left.toInstructions(append, open, 0);
        const rightInstructions = this.right.toInstructions(false, 0, close);
        let cur = leftInstructions[leftInstructions.length - 1];
        while (cur.children.length > 0) {
            cur = cur.children[cur.children.length - 1];
        }
        cur.children.push(...rightInstructions);
        return leftInstructions;
    }
    toString() {
        return this.raw;
    }
}
/**
 * Any kind of segment wrapped in parentheses, increasing its precedence.
 * Specifically, the parentheses are needed to deeply specify scoped siblings.
 * The precedence is intentionally similar to the familiar mathematical `/` and `+` operators.
 *
 * For example, consider this viewport structure:
 * - viewport-a
 * - - viewport-a1
 * - - viewport-a2
 * - viewport-b
 * - - viewport-b1
 *
 * This can only be deeply specified by using the grouping operator: `a/(a1+a2)+b/b1`
 *
 * Because `a/a1+a2+b/b1` would be interpreted differently:
 * - viewport-a
 * - - viewport-a1
 * - viewport-a2
 * - viewport-b
 * - - viewport-b1
 *
 * ### Variations:
 *
 * 1: `(a)`
 * - expression: `a`
 *
 * Where
 * - a = `CompositeSegmentExpressionOrHigher` (`SegmentExpression | SegmentGroupExpression | ScopedSegmentExpression | CompositeSegmentExpression`)
 */
class SegmentGroupExpression {
    constructor(raw, expression) {
        this.raw = raw;
        this.expression = expression;
    }
    get kind() { return 3 /* SegmentGroup */; }
    static parse(state) {
        state.record();
        if (state.consumeOptional('(')) {
            const expression = CompositeSegmentExpression.parse(state);
            state.consume(')');
            const raw = state.playback();
            return new SegmentGroupExpression(raw, expression);
        }
        state.discard();
        return SegmentExpression.parse(state);
    }
    toInstructions(append, open, close) {
        return this.expression.toInstructions(append, open + 1, close + 1);
    }
    toString() {
        return this.raw;
    }
}
/**
 * A (non-composite) segment specifying a single component and (optional) viewport / action.
 */
class SegmentExpression {
    constructor(raw, component, action, viewport, scoped) {
        this.raw = raw;
        this.component = component;
        this.action = action;
        this.viewport = viewport;
        this.scoped = scoped;
    }
    get kind() { return 4 /* Segment */; }
    static get EMPTY() { return new SegmentExpression('', ComponentExpression.EMPTY, ActionExpression.EMPTY, ViewportExpression.EMPTY, true); }
    static parse(state) {
        state.record();
        const component = ComponentExpression.parse(state);
        const action = ActionExpression.parse(state);
        const viewport = ViewportExpression.parse(state);
        const scoped = !state.consumeOptional('!');
        const raw = state.playback();
        return new SegmentExpression(raw, component, action, viewport, scoped);
    }
    toInstructions(append, open, close) {
        return [
            ViewportInstruction.create({
                component: this.component.name,
                params: this.component.parameterList.toObject(),
                viewport: this.viewport.name,
                append,
                open,
                close,
            }),
        ];
    }
    toString() {
        return this.raw;
    }
}
class ComponentExpression {
    constructor(raw, name, parameterList) {
        this.raw = raw;
        this.name = name;
        this.parameterList = parameterList;
        switch (name.charAt(0)) {
            case ':':
                this.isParameter = true;
                this.isStar = false;
                this.isDynamic = true;
                this.parameterName = name.slice(1);
                break;
            case '*':
                this.isParameter = false;
                this.isStar = true;
                this.isDynamic = true;
                this.parameterName = name.slice(1);
                break;
            default:
                this.isParameter = false;
                this.isStar = false;
                this.isDynamic = false;
                this.parameterName = name;
                break;
        }
    }
    get kind() { return 5 /* Component */; }
    static get EMPTY() { return new ComponentExpression('', '', ParameterListExpression.EMPTY); }
    static parse(state) {
        state.record();
        state.record();
        if (!state.done) {
            if (state.startsWith('./')) {
                state.advance();
            }
            else if (state.startsWith('../')) {
                state.advance();
                state.advance();
            }
            else {
                while (!state.done && !state.startsWith(...terminal)) {
                    state.advance();
                }
            }
        }
        const name = decodeURIComponent(state.playback());
        if (name.length === 0) {
            state.expect('component name');
        }
        const parameterList = ParameterListExpression.parse(state);
        const raw = state.playback();
        return new ComponentExpression(raw, name, parameterList);
    }
    toString() {
        return this.raw;
    }
}
class ActionExpression {
    constructor(raw, name, parameterList) {
        this.raw = raw;
        this.name = name;
        this.parameterList = parameterList;
    }
    get kind() { return 6 /* Action */; }
    static get EMPTY() { return new ActionExpression('', '', ParameterListExpression.EMPTY); }
    static parse(state) {
        state.record();
        let name = '';
        if (state.consumeOptional('.')) {
            state.record();
            while (!state.done && !state.startsWith(...terminal)) {
                state.advance();
            }
            name = decodeURIComponent(state.playback());
            if (name.length === 0) {
                state.expect('method name');
            }
        }
        const parameterList = ParameterListExpression.parse(state);
        const raw = state.playback();
        return new ActionExpression(raw, name, parameterList);
    }
    toString() {
        return this.raw;
    }
}
class ViewportExpression {
    constructor(raw, name) {
        this.raw = raw;
        this.name = name;
    }
    get kind() { return 7 /* Viewport */; }
    static get EMPTY() { return new ViewportExpression('', ''); }
    static parse(state) {
        state.record();
        let name = '';
        if (state.consumeOptional('@')) {
            state.record();
            while (!state.done && !state.startsWith(...terminal)) {
                state.advance();
            }
            name = decodeURIComponent(state.playback());
            if (name.length === 0) {
                state.expect('viewport name');
            }
        }
        const raw = state.playback();
        return new ViewportExpression(raw, name);
    }
    toString() {
        return this.raw;
    }
}
class ParameterListExpression {
    constructor(raw, expressions) {
        this.raw = raw;
        this.expressions = expressions;
    }
    get kind() { return 8 /* ParameterList */; }
    static get EMPTY() { return new ParameterListExpression('', []); }
    static parse(state) {
        state.record();
        const expressions = [];
        if (state.consumeOptional('(')) {
            do {
                expressions.push(ParameterExpression.parse(state, expressions.length));
                if (!state.consumeOptional(',')) {
                    break;
                }
            } while (!state.done && !state.startsWith(')'));
            state.consume(')');
        }
        const raw = state.playback();
        return new ParameterListExpression(raw, expressions);
    }
    toObject() {
        const params = {};
        for (const expr of this.expressions) {
            params[expr.key] = expr.value;
        }
        return params;
    }
    toString() {
        return this.raw;
    }
}
class ParameterExpression {
    constructor(raw, key, value) {
        this.raw = raw;
        this.key = key;
        this.value = value;
    }
    get kind() { return 9 /* Parameter */; }
    static get EMPTY() { return new ParameterExpression('', '', ''); }
    static parse(state, index) {
        state.record();
        state.record();
        while (!state.done && !state.startsWith(...terminal)) {
            state.advance();
        }
        let key = decodeURIComponent(state.playback());
        if (key.length === 0) {
            state.expect('parameter key');
        }
        let value;
        if (state.consumeOptional('=')) {
            state.record();
            while (!state.done && !state.startsWith(...terminal)) {
                state.advance();
            }
            value = decodeURIComponent(state.playback());
            if (value.length === 0) {
                state.expect('parameter value');
            }
        }
        else {
            value = key;
            key = index.toString();
        }
        const raw = state.playback();
        return new ParameterExpression(raw, key, value);
    }
    toString() {
        return this.raw;
    }
}
const AST = Object.freeze({
    RouteExpression,
    CompositeSegmentExpression,
    ScopedSegmentExpression,
    SegmentGroupExpression,
    SegmentExpression,
    ComponentExpression,
    ActionExpression,
    ViewportExpression,
    ParameterListExpression,
    ParameterExpression,
});

/* eslint-disable @typescript-eslint/restrict-template-expressions */
let nodeId = 0;
class RouteNode {
    constructor(
    /** @internal */
    id, 
    /**
     * The original configured path pattern that was matched, or the component name if it was resolved via direct routing.
     */
    path, 
    /**
     * If one or more redirects have occurred, then this is the final path match, in all other cases this is identical to `path`
     */
    finalPath, 
    /**
     * The `RouteContext` associated with this route.
     *
     * Child route components will be created by this context.
     *
     * Viewports that live underneath the component associated with this route, will be registered to this context.
     */
    context, 
    /** @internal */
    originalInstruction, 
    /** Can only be `null` for the composition root */
    instruction, params, queryParams, fragment, data, 
    /**
     * The viewport is always `null` for the root `RouteNode`.
     *
     * NOTE: It might make sense to have a `null` viewport mean other things as well (such as, don't load this component)
     * but that is currently not a deliberately implemented feature and we might want to explicitly validate against it
     * if we decide not to implement that.
     */
    viewport, title, component, append, children, 
    /**
     * Not-yet-resolved viewport instructions.
     *
     * Instructions need an `IRouteContext` to be resolved into complete `RouteNode`s.
     *
     * Resolved instructions are removed from this array, such that a `RouteNode` can be considered
     * "fully resolved" when it has `residue.length === 0` and `children.length >= 0`
     */
    residue) {
        this.id = id;
        this.path = path;
        this.finalPath = finalPath;
        this.context = context;
        this.originalInstruction = originalInstruction;
        this.instruction = instruction;
        this.params = params;
        this.queryParams = queryParams;
        this.fragment = fragment;
        this.data = data;
        this.viewport = viewport;
        this.title = title;
        this.component = component;
        this.append = append;
        this.children = children;
        this.residue = residue;
        /** @internal */
        this.version = 1;
        this.originalInstruction = instruction;
    }
    get root() {
        return this.tree.root;
    }
    static create(input) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return new RouteNode(
        /*          id */ ++nodeId, 
        /*        path */ input.path, 
        /*   finalPath */ input.finalPath, 
        /*     context */ input.context, 
        /* originalIns */ input.instruction, 
        /* instruction */ input.instruction, (_a = 
        /*      params */ input.params) !== null && _a !== void 0 ? _a : {}, (_b = 
        /* queryParams */ input.queryParams) !== null && _b !== void 0 ? _b : Object.freeze(new URLSearchParams()), (_c = 
        /*    fragment */ input.fragment) !== null && _c !== void 0 ? _c : null, (_d = 
        /*        data */ input.data) !== null && _d !== void 0 ? _d : {}, (_e = 
        /*    viewport */ input.viewport) !== null && _e !== void 0 ? _e : null, (_f = 
        /*       title */ input.title) !== null && _f !== void 0 ? _f : null, 
        /*   component */ input.component, 
        /*      append */ input.append, (_g = 
        /*    children */ input.children) !== null && _g !== void 0 ? _g : [], (_h = 
        /*     residue */ input.residue) !== null && _h !== void 0 ? _h : []);
    }
    contains(instructions) {
        var _a, _b;
        if (this.context === instructions.options.context) {
            const nodeChildren = this.children;
            const instructionChildren = instructions.children;
            for (let i = 0, ii = nodeChildren.length; i < ii; ++i) {
                for (let j = 0, jj = instructionChildren.length; j < jj; ++j) {
                    if (i + j < ii && ((_b = (_a = nodeChildren[i + j].instruction) === null || _a === void 0 ? void 0 : _a.contains(instructionChildren[j])) !== null && _b !== void 0 ? _b : false)) {
                        if (j + 1 === jj) {
                            return true;
                        }
                    }
                    else {
                        break;
                    }
                }
            }
        }
        return this.children.some(function (x) {
            return x.contains(instructions);
        });
    }
    appendChild(child) {
        this.children.push(child);
        child.setTree(this.tree);
    }
    appendChildren(...children) {
        for (const child of children) {
            this.appendChild(child);
        }
    }
    clearChildren() {
        for (const c of this.children) {
            c.clearChildren();
            c.context.vpa.cancelUpdate();
        }
        this.children.length = 0;
    }
    getTitle(separator) {
        const titleParts = [
            ...this.children.map(x => x.getTitle(separator)),
            this.getTitlePart(),
        ].filter(x => x !== null);
        if (titleParts.length === 0) {
            return null;
        }
        return titleParts.join(separator);
    }
    getTitlePart() {
        if (typeof this.title === 'function') {
            return this.title.call(void 0, this);
        }
        return this.title;
    }
    computeAbsolutePath() {
        if (this.context.isRoot) {
            return '';
        }
        const parentPath = this.context.parent.node.computeAbsolutePath();
        const thisPath = this.instruction.toUrlComponent(false);
        if (parentPath.length > 0) {
            if (thisPath.length > 0) {
                return [parentPath, thisPath].join('/');
            }
            return parentPath;
        }
        return thisPath;
    }
    /** @internal */
    setTree(tree) {
        this.tree = tree;
        for (const child of this.children) {
            child.setTree(tree);
        }
    }
    /** @internal */
    finalizeInstruction() {
        const children = this.children.map(x => x.finalizeInstruction());
        const instruction = this.instruction.clone();
        instruction.children.splice(0, instruction.children.length, ...children);
        return this.instruction = instruction;
    }
    /** @internal */
    clone() {
        const clone = new RouteNode(this.id, this.path, this.finalPath, this.context, this.originalInstruction, this.instruction, { ...this.params }, { ...this.queryParams }, this.fragment, { ...this.data }, this.viewport, this.title, this.component, this.append, this.children.map(x => x.clone()), [...this.residue]);
        clone.version = this.version + 1;
        if (clone.context.node === this) {
            clone.context.node = clone;
        }
        return clone;
    }
    toString() {
        var _a, _b, _c, _d, _e;
        const props = [];
        const component = (_c = (_b = (_a = this.context) === null || _a === void 0 ? void 0 : _a.definition.component) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : '';
        if (component.length > 0) {
            props.push(`c:'${component}'`);
        }
        const path = (_e = (_d = this.context) === null || _d === void 0 ? void 0 : _d.definition.config.path) !== null && _e !== void 0 ? _e : '';
        if (path.length > 0) {
            props.push(`path:'${path}'`);
        }
        if (this.children.length > 0) {
            props.push(`children:[${this.children.map(String).join(',')}]`);
        }
        if (this.residue.length > 0) {
            props.push(`residue:${this.residue.map(function (r) {
                if (typeof r === 'string') {
                    return `'${r}'`;
                }
                return String(r);
            }).join(',')}`);
        }
        return `RN(ctx:'${this.context.friendlyPath}',${props.join(',')})`;
    }
}
class RouteTree {
    constructor(options, queryParams, fragment, root) {
        this.options = options;
        this.queryParams = queryParams;
        this.fragment = fragment;
        this.root = root;
    }
    contains(instructions) {
        return this.root.contains(instructions);
    }
    clone() {
        const clone = new RouteTree(this.options.clone(), { ...this.queryParams }, this.fragment, this.root.clone());
        clone.root.setTree(this);
        return clone;
    }
    finalizeInstructions() {
        return new ViewportInstructionTree(this.options, true, this.root.children.map(x => x.finalizeInstruction()), this.queryParams, this.fragment);
    }
    toString() {
        return this.root.toString();
    }
}
/**
 * Returns a stateful `RouteTree` based on the provided context and transition.
 *
 * This expression will always start from the root context and build a new complete tree, up until (and including)
 * the context that was passed-in.
 *
 * If there are any additional child navigations to be resolved lazily, those will be added to the leaf
 * `RouteNode`s `residue` property which is then resolved by the router after the leaf node is loaded.
 *
 * This means that a `RouteTree` can (and often will) be built incrementally during the loading process.
 */
function updateRouteTree(rt, vit, ctx) {
    const log = ctx.container.get(ILogger).scopeTo('RouteTree');
    // The root of the routing tree is always the CompositionRoot of the Aurelia app.
    // From a routing perspective it's simply a "marker": it does not need to be loaded,
    // nor put in a viewport, have its hooks invoked, or any of that. The router does not touch it,
    // other than by reading (deps, optional route config, owned viewports) from it.
    const rootCtx = ctx.root;
    rt.options = vit.options;
    rt.queryParams = vit.queryParams;
    rt.fragment = vit.fragment;
    if (vit.isAbsolute) {
        ctx = rootCtx;
    }
    if (ctx === rootCtx) {
        rt.root.setTree(rt);
        rootCtx.node = rt.root;
    }
    const suffix = ctx.resolved instanceof Promise ? ' - awaiting promise' : '';
    log.trace(`updateRouteTree(rootCtx:%s,rt:%s,vit:%s)${suffix}`, rootCtx, rt, vit);
    return onResolve(ctx.resolved, () => {
        return updateNode(log, vit, ctx, rootCtx.node);
    });
}
function updateNode(log, vit, ctx, node) {
    log.trace(`updateNode(ctx:%s,node:%s)`, ctx, node);
    node.queryParams = vit.queryParams;
    node.fragment = vit.fragment;
    let maybePromise;
    if (!node.context.isRoot) {
        // TODO(fkleuver): store `options` on every individual instruction instead of just on the tree, or split it up etc? this needs a bit of cleaning up
        maybePromise = node.context.vpa.scheduleUpdate(node.tree.options, node);
    }
    else {
        maybePromise = void 0;
    }
    return onResolve(maybePromise, () => {
        if (node.context === ctx) {
            // Do an in-place update (remove children and re-add them by compiling the instructions into nodes)
            node.clearChildren();
            return onResolve(resolveAll(...vit.children.map(vi => {
                return createAndAppendNodes(log, node, vi, node.tree.options.append || vi.append);
            })), () => {
                return resolveAll(...ctx.getAvailableViewportAgents('dynamic').map(vpa => {
                    const defaultInstruction = ViewportInstruction.create({
                        component: vpa.viewport.default,
                        viewport: vpa.viewport.name,
                    });
                    return createAndAppendNodes(log, node, defaultInstruction, node.append);
                }));
            });
        }
        // Drill down until we're at the node whose context matches the provided navigation context
        return resolveAll(...node.children.map(child => {
            return updateNode(log, vit, ctx, child);
        }));
    });
}
function processResidue(node) {
    const ctx = node.context;
    const log = ctx.container.get(ILogger).scopeTo('RouteTree');
    const suffix = ctx.resolved instanceof Promise ? ' - awaiting promise' : '';
    log.trace(`processResidue(node:%s)${suffix}`, node);
    return onResolve(ctx.resolved, () => {
        return resolveAll(...node.residue.splice(0).map(vi => {
            return createAndAppendNodes(log, node, vi, node.append);
        }), ...ctx.getAvailableViewportAgents('static').map(vpa => {
            const defaultInstruction = ViewportInstruction.create({
                component: vpa.viewport.default,
                viewport: vpa.viewport.name,
            });
            return createAndAppendNodes(log, node, defaultInstruction, node.append);
        }));
    });
}
function getDynamicChildren(node) {
    const ctx = node.context;
    const log = ctx.container.get(ILogger).scopeTo('RouteTree');
    const suffix = ctx.resolved instanceof Promise ? ' - awaiting promise' : '';
    log.trace(`getDynamicChildren(node:%s)${suffix}`, node);
    return onResolve(ctx.resolved, () => {
        const existingChildren = node.children.slice();
        return onResolve(resolveAll(...node.residue.splice(0).map(vi => {
            return createAndAppendNodes(log, node, vi, node.append);
        }), ...ctx.getAvailableViewportAgents('dynamic').map(vpa => {
            const defaultInstruction = ViewportInstruction.create({
                component: vpa.viewport.default,
                viewport: vpa.viewport.name,
            });
            return createAndAppendNodes(log, node, defaultInstruction, node.append);
        })), () => {
            return node.children.filter(x => !existingChildren.includes(x));
        });
    });
}
function createAndAppendNodes(log, node, vi, append) {
    var _a, _b;
    log.trace(`createAndAppendNodes(node:%s,vi:%s,append:${append})`, node, vi);
    switch (vi.component.type) {
        case 0 /* string */: {
            switch (vi.component.value) {
                case '..':
                    // Allow going "too far up" just like directory command `cd..`, simply clamp it to the root
                    node.clearChildren();
                    node = (_b = (_a = node.context.parent) === null || _a === void 0 ? void 0 : _a.node) !== null && _b !== void 0 ? _b : node;
                // falls through
                case '.':
                    return resolveAll(...vi.children.map(childVI => {
                        return createAndAppendNodes(log, node, childVI, childVI.append);
                    }));
                default: {
                    const childNode = createNode(log, node, vi, append);
                    if (childNode === null) {
                        return;
                    }
                    return appendNode(log, node, childNode);
                }
            }
        }
        case 4 /* IRouteViewModel */:
        case 2 /* CustomElementDefinition */: {
            const routeDef = RouteDefinition.resolve(vi.component.value);
            const childNode = createDirectNode(log, node, vi, append, routeDef.component);
            return appendNode(log, node, childNode);
        }
    }
}
function createNode(log, node, vi, append) {
    const ctx = node.context;
    let collapse = 0;
    let path = vi.component.value;
    let cur = vi;
    while (cur.children.length === 1) {
        cur = cur.children[0];
        if (cur.component.type === 0 /* string */) {
            ++collapse;
            path = `${path}/${cur.component.value}`;
        }
        else {
            break;
        }
    }
    const rr = ctx.recognize(path);
    if (rr === null) {
        const name = vi.component.value;
        let ced = ctx.container.find(CustomElement, name);
        switch (node.tree.options.routingMode) {
            case 'configured-only':
                if (ced === null) {
                    if (name === '') {
                        // TODO: maybe throw here instead? Do we want to force the empty route to always be configured?
                        return null;
                    }
                    throw new Error(`'${name}' did not match any configured route or registered component name at '${ctx.friendlyPath}' - did you forget to add '${name}' to the routes list of the route decorator of '${ctx.component.name}'?`);
                }
                throw new Error(`'${name}' did not match any configured route, but it does match a registered component name at '${ctx.friendlyPath}' - did you forget to add a @route({ path: '${name}' }) decorator to '${name}' or unintentionally set routingMode to 'configured-only'?`);
            case 'configured-first':
                if (ced === null) {
                    if (name === '') {
                        return null;
                    }
                    const vpName = vi.viewport === null || vi.viewport.length === 0 ? 'default' : vi.viewport;
                    const fallbackVPA = ctx.getFallbackViewportAgent('dynamic', vpName);
                    if (fallbackVPA === null) {
                        throw new Error(`'${name}' did not match any configured route or registered component name at '${ctx.friendlyPath}' and no fallback was provided for viewport '${vpName}' - did you forget to add the component '${name}' to the dependencies of '${ctx.component.name}' or to register it as a global dependency?`);
                    }
                    const fallback = fallbackVPA.viewport.fallback;
                    ced = ctx.container.find(CustomElement, fallback);
                    if (ced === null) {
                        throw new Error(`the requested component '${name}' and the fallback '${fallback}' at viewport '${vpName}' did not match any configured route or registered component name at '${ctx.friendlyPath}' - did you forget to add the component '${name}' to the dependencies of '${ctx.component.name}' or to register it as a global dependency?`);
                    }
                }
                return createDirectNode(log, node, vi, append, ced);
        }
    }
    // If it's a multi-segment match, collapse the viewport instructions to correct the tree structure.
    const finalPath = rr.residue === null ? path : path.slice(0, -(rr.residue.length + 1));
    vi.component.value = finalPath;
    for (let i = 0; i < collapse; ++i) {
        vi.children = vi.children[0].children;
    }
    return createConfiguredNode(log, node, vi, append, rr);
}
function createConfiguredNode(log, node, vi, append, rr, route = rr.route.endpoint.route) {
    const ctx = node.context;
    const rt = node.tree;
    return onResolve(route.handler, $handler => {
        route.handler = $handler;
        if ($handler.redirectTo === null) {
            const vpName = $handler.viewport;
            const ced = $handler.component;
            const vpa = ctx.resolveViewportAgent(ViewportRequest.create({
                viewportName: vpName,
                componentName: ced.name,
                append,
                resolution: rt.options.resolutionMode,
            }));
            const router = ctx.container.get(IRouter);
            const childCtx = router.getRouteContext(vpa, ced, vpa.hostController.context);
            childCtx.node = RouteNode.create({
                path: rr.route.endpoint.route.path,
                finalPath: route.path,
                context: childCtx,
                instruction: vi,
                params: {
                    ...node.params,
                    ...rr.route.params
                },
                queryParams: rt.queryParams,
                fragment: rt.fragment,
                data: $handler.data,
                viewport: vpName,
                component: ced,
                append,
                title: $handler.config.title,
                residue: rr.residue === null ? [] : [ViewportInstruction.create(rr.residue)],
            });
            childCtx.node.setTree(node.tree);
            log.trace(`createConfiguredNode(vi:%s) -> %s`, vi, childCtx.node);
            return childCtx.node;
        }
        // Migrate parameters to the redirect
        const origPath = RouteExpression.parse(route.path, false);
        const redirPath = RouteExpression.parse($handler.redirectTo, false);
        let origCur;
        let redirCur;
        const newSegs = [];
        switch (origPath.root.kind) {
            case 2 /* ScopedSegment */:
            case 4 /* Segment */:
                origCur = origPath.root;
                break;
            default:
                throw new Error(`Unexpected expression kind ${origPath.root.kind}`);
        }
        switch (redirPath.root.kind) {
            case 2 /* ScopedSegment */:
            case 4 /* Segment */:
                redirCur = redirPath.root;
                break;
            default:
                throw new Error(`Unexpected expression kind ${redirPath.root.kind}`);
        }
        let origSeg;
        let redirSeg;
        let origDone = false;
        let redirDone = false;
        while (!(origDone && redirDone)) {
            if (origDone) {
                origSeg = null;
            }
            else if (origCur.kind === 4 /* Segment */) {
                origSeg = origCur;
                origDone = true;
            }
            else if (origCur.left.kind === 4 /* Segment */) {
                origSeg = origCur.left;
                switch (origCur.right.kind) {
                    case 2 /* ScopedSegment */:
                    case 4 /* Segment */:
                        origCur = origCur.right;
                        break;
                    default:
                        throw new Error(`Unexpected expression kind ${origCur.right.kind}`);
                }
            }
            else {
                throw new Error(`Unexpected expression kind ${origCur.left.kind}`);
            }
            if (redirDone) {
                redirSeg = null;
            }
            else if (redirCur.kind === 4 /* Segment */) {
                redirSeg = redirCur;
                redirDone = true;
            }
            else if (redirCur.left.kind === 4 /* Segment */) {
                redirSeg = redirCur.left;
                switch (redirCur.right.kind) {
                    case 2 /* ScopedSegment */:
                    case 4 /* Segment */:
                        redirCur = redirCur.right;
                        break;
                    default:
                        throw new Error(`Unexpected expression kind ${redirCur.right.kind}`);
                }
            }
            else {
                throw new Error(`Unexpected expression kind ${redirCur.left.kind}`);
            }
            if (redirSeg !== null) {
                if (redirSeg.component.isDynamic && (origSeg === null || origSeg === void 0 ? void 0 : origSeg.component.isDynamic)) {
                    newSegs.push(rr.route.params[origSeg.component.name]);
                }
                else {
                    newSegs.push(redirSeg.raw);
                }
            }
        }
        const newPath = newSegs.filter(Boolean).join('/');
        const redirRR = ctx.recognize(newPath);
        if (redirRR === null) {
            const name = newPath;
            const ced = ctx.container.find(CustomElement, newPath);
            switch (rt.options.routingMode) {
                case 'configured-only':
                    if (ced === null) {
                        throw new Error(`'${name}' did not match any configured route or registered component name at '${ctx.friendlyPath}' - did you forget to add '${name}' to the routes list of the route decorator of '${ctx.component.name}'?`);
                    }
                    throw new Error(`'${name}' did not match any configured route, but it does match a registered component name at '${ctx.friendlyPath}' - did you forget to add a @route({ path: '${name}' }) decorator to '${name}' or unintentionally set routingMode to 'configured-only'?`);
                case 'configured-first':
                    if (ced === null) {
                        throw new Error(`'${name}' did not match any configured route or registered component name at '${ctx.friendlyPath}' - did you forget to add the component '${name}' to the dependencies of '${ctx.component.name}' or to register it as a global dependency?`);
                    }
                    return createDirectNode(log, node, vi, append, ced);
            }
        }
        return createConfiguredNode(log, node, vi, append, rr, redirRR.route.endpoint.route);
    });
}
function createDirectNode(log, node, vi, append, ced) {
    var _a;
    const ctx = node.context;
    const rt = node.tree;
    const vpName = (_a = vi.viewport) !== null && _a !== void 0 ? _a : 'default';
    const vpa = ctx.resolveViewportAgent(ViewportRequest.create({
        viewportName: vpName,
        componentName: ced.name,
        append,
        resolution: rt.options.resolutionMode,
    }));
    const router = ctx.container.get(IRouter);
    const childCtx = router.getRouteContext(vpa, ced, vpa.hostController.context);
    // TODO(fkleuver): process redirects in direct routing (?)
    const rd = RouteDefinition.resolve(ced);
    // TODO: add ActionExpression state representation to RouteNode
    childCtx.node = RouteNode.create({
        path: ced.name,
        finalPath: ced.name,
        context: childCtx,
        instruction: vi,
        params: {
            ...ctx.node.params,
            ...vi.params,
        },
        queryParams: rt.queryParams,
        fragment: rt.fragment,
        data: rd.data,
        viewport: vpName,
        component: ced,
        append,
        title: rd.config.title,
        residue: [...vi.children],
    });
    childCtx.node.setTree(ctx.node.tree);
    log.trace(`createDirectNode(vi:%s) -> %s`, vi, childCtx.node);
    return childCtx.node;
}
function appendNode(log, node, childNode) {
    return onResolve(childNode, $childNode => {
        log.trace(`appendNode($childNode:%s)`, $childNode);
        node.appendChild($childNode);
        return $childNode.context.vpa.scheduleUpdate(node.tree.options, $childNode);
    });
}

const AuNavId = 'au-nav-id';
function isManagedState(state) {
    return isObject(state) && Object.prototype.hasOwnProperty.call(state, AuNavId) === true;
}
function toManagedState(state, navId) {
    return { ...state, [AuNavId]: navId };
}
function valueOrFuncToValue(instructions, valueOrFunc) {
    if (typeof valueOrFunc === 'function') {
        return valueOrFunc(instructions);
    }
    return valueOrFunc;
}
class RouterOptions {
    constructor(useUrlFragmentHash, useHref, statefulHistoryLength, 
    /**
     * The operating mode of the router that determines how components are resolved based on a url.
     *
     * - `configured-only`: only match the url against configured routes.
     * - `configured-first`: first tries to resolve by configured routes, then by component name from available dependencies. (default)
     *
     * Default: `configured-first`
     */
    routingMode, swapStrategy, resolutionMode, 
    /**
     * The strategy to use for determining the query parameters when both the previous and the new url has a query string.
     *
     * - `overwrite`: uses the query params of the new url. (default)
     * - `preserve`: uses the query params of the previous url.
     * - `merge`: uses the query params of both the previous and the new url. When a param name exists in both, the value from the new url is used.
     * - A function that returns one of the 3 above values based on the navigation.
     *
     * Default: `overwrite`
     */
    queryParamsStrategy, 
    /**
     * The strategy to use for determining the fragment (value that comes after `#`) when both the previous and the new url have one.
     *
     * - `overwrite`: uses the fragment of the new url. (default)
     * - `preserve`: uses the fragment of the previous url.
     * - A function that returns one of the 2 above values based on the navigation.
     *
     * Default: `overwrite`
     */
    fragmentStrategy, 
    /**
     * The strategy to use for interacting with the browser's `history` object (if applicable).
     *
     * - `none`: do not interact with the `history` object at all.
     * - `replace`: replace the current state in history
     * - `push`: push a new state onto the history (default)
     * - A function that returns one of the 3 above values based on the navigation.
     *
     * Default: `push`
     */
    historyStrategy, 
    /**
     * The strategy to use for when navigating to the same URL.
     *
     * - `ignore`: do nothing (default).
     * - `reload`: reload the current URL, effectively performing a refresh.
     * - A function that returns one of the 2 above values based on the navigation.
     *
     * Default: `ignore`
     */
    sameUrlStrategy) {
        this.useUrlFragmentHash = useUrlFragmentHash;
        this.useHref = useHref;
        this.statefulHistoryLength = statefulHistoryLength;
        this.routingMode = routingMode;
        this.swapStrategy = swapStrategy;
        this.resolutionMode = resolutionMode;
        this.queryParamsStrategy = queryParamsStrategy;
        this.fragmentStrategy = fragmentStrategy;
        this.historyStrategy = historyStrategy;
        this.sameUrlStrategy = sameUrlStrategy;
    }
    static get DEFAULT() { return RouterOptions.create({}); }
    static create(input) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        return new RouterOptions((_a = input.useUrlFragmentHash) !== null && _a !== void 0 ? _a : false, (_b = input.useHref) !== null && _b !== void 0 ? _b : true, (_c = input.statefulHistoryLength) !== null && _c !== void 0 ? _c : 0, (_d = input.routingMode) !== null && _d !== void 0 ? _d : 'configured-first', (_e = input.swapStrategy) !== null && _e !== void 0 ? _e : 'sequential-remove-first', (_f = input.resolutionMode) !== null && _f !== void 0 ? _f : 'dynamic', (_g = input.queryParamsStrategy) !== null && _g !== void 0 ? _g : 'overwrite', (_h = input.fragmentStrategy) !== null && _h !== void 0 ? _h : 'overwrite', (_j = input.historyStrategy) !== null && _j !== void 0 ? _j : 'push', (_k = input.sameUrlStrategy) !== null && _k !== void 0 ? _k : 'ignore');
    }
    /** @internal */
    getQueryParamsStrategy(instructions) {
        return valueOrFuncToValue(instructions, this.queryParamsStrategy);
    }
    /** @internal */
    getFragmentStrategy(instructions) {
        return valueOrFuncToValue(instructions, this.fragmentStrategy);
    }
    /** @internal */
    getHistoryStrategy(instructions) {
        return valueOrFuncToValue(instructions, this.historyStrategy);
    }
    /** @internal */
    getSameUrlStrategy(instructions) {
        return valueOrFuncToValue(instructions, this.sameUrlStrategy);
    }
    stringifyProperties() {
        return [
            ['routingMode', 'mode'],
            ['swapStrategy', 'swap'],
            ['resolutionMode', 'resolution'],
            ['queryParamsStrategy', 'queryParams'],
            ['fragmentStrategy', 'fragment'],
            ['historyStrategy', 'history'],
            ['sameUrlStrategy', 'sameUrl'],
        ].map(([key, name]) => {
            const value = this[key];
            return `${name}:${typeof value === 'function' ? value : `'${value}'`}`;
        }).join(',');
    }
    clone() {
        return new RouterOptions(this.useUrlFragmentHash, this.useHref, this.statefulHistoryLength, this.routingMode, this.swapStrategy, this.resolutionMode, this.queryParamsStrategy, this.fragmentStrategy, this.historyStrategy, this.sameUrlStrategy);
    }
    toString() {
        return `RO(${this.stringifyProperties()})`;
    }
}
class NavigationOptions extends RouterOptions {
    constructor(routerOptions, title, titleSeparator, append, 
    /**
     * Specify a context to use for relative navigation.
     *
     * - `null` (or empty): navigate relative to the root (absolute navigation)
     * - `IRouteContext`: navigate relative to specifically this RouteContext (advanced users).
     * - `HTMLElement`: navigate relative to the routeable component (page) that directly or indirectly contains this element.
     * - `ICustomElementViewModel` (the `this` object when working from inside a view model): navigate relative to this component (if it was loaded as a route), or the routeable component (page) directly or indirectly containing it.
     * - `ICustomElementController`: same as `ICustomElementViewModel`, but using the controller object instead of the view model object (advanced users).
     */
    context, 
    /**
     * Specify an object to be serialized to a query string, and then set to the query string of the new URL.
     */
    queryParams, 
    /**
     * Specify the hash fragment for the new URL.
     */
    fragment, 
    /**
     * Specify any kind of state to be stored together with the history entry for this navigation.
     */
    state) {
        super(routerOptions.useUrlFragmentHash, routerOptions.useHref, routerOptions.statefulHistoryLength, routerOptions.routingMode, routerOptions.swapStrategy, routerOptions.resolutionMode, routerOptions.queryParamsStrategy, routerOptions.fragmentStrategy, routerOptions.historyStrategy, routerOptions.sameUrlStrategy);
        this.title = title;
        this.titleSeparator = titleSeparator;
        this.append = append;
        this.context = context;
        this.queryParams = queryParams;
        this.fragment = fragment;
        this.state = state;
    }
    static get DEFAULT() { return NavigationOptions.create({}); }
    static create(input) {
        var _a, _b, _c, _d, _e, _f, _g;
        return new NavigationOptions(RouterOptions.create(input), (_a = input.title) !== null && _a !== void 0 ? _a : null, (_b = input.titleSeparator) !== null && _b !== void 0 ? _b : ' | ', (_c = input.append) !== null && _c !== void 0 ? _c : false, (_d = input.context) !== null && _d !== void 0 ? _d : null, (_e = input.queryParams) !== null && _e !== void 0 ? _e : null, (_f = input.fragment) !== null && _f !== void 0 ? _f : '', (_g = input.state) !== null && _g !== void 0 ? _g : null);
    }
    clone() {
        return new NavigationOptions(super.clone(), this.title, this.titleSeparator, this.append, this.context, { ...this.queryParams }, this.fragment, this.state === null ? null : { ...this.state });
    }
    toString() {
        return `NO(${super.stringifyProperties()})`;
    }
}
class Navigation {
    constructor(id, instructions, trigger, options, prevNavigation, 
    // Set on next navigation, this is the route after all redirects etc have been processed.
    finalInstructions) {
        this.id = id;
        this.instructions = instructions;
        this.trigger = trigger;
        this.options = options;
        this.prevNavigation = prevNavigation;
        this.finalInstructions = finalInstructions;
    }
    static create(input) {
        return new Navigation(input.id, input.instructions, input.trigger, input.options, input.prevNavigation, input.finalInstructions);
    }
    toString() {
        return `N(id:${this.id},instructions:${this.instructions},trigger:'${this.trigger}')`;
    }
}
class Transition {
    constructor(id, prevInstructions, instructions, finalInstructions, instructionsChanged, trigger, options, managedState, previousRouteTree, routeTree, promise, resolve, reject, guardsResult, error) {
        this.id = id;
        this.prevInstructions = prevInstructions;
        this.instructions = instructions;
        this.finalInstructions = finalInstructions;
        this.instructionsChanged = instructionsChanged;
        this.trigger = trigger;
        this.options = options;
        this.managedState = managedState;
        this.previousRouteTree = previousRouteTree;
        this.routeTree = routeTree;
        this.promise = promise;
        this.resolve = resolve;
        this.reject = reject;
        this.guardsResult = guardsResult;
        this.error = error;
    }
    static create(input) {
        return new Transition(input.id, input.prevInstructions, input.instructions, input.finalInstructions, input.instructionsChanged, input.trigger, input.options, input.managedState, input.previousRouteTree, input.routeTree, input.promise, input.resolve, input.reject, input.guardsResult, void 0);
    }
    run(cb, next) {
        if (this.guardsResult !== true) {
            return;
        }
        try {
            const ret = cb();
            if (ret instanceof Promise) {
                ret.then(next).catch(err => {
                    this.handleError(err);
                });
            }
            else {
                next(ret);
            }
        }
        catch (err) {
            this.handleError(err);
        }
    }
    handleError(err) {
        this.reject(this.error = err);
    }
    toString() {
        return `T(id:${this.id},trigger:'${this.trigger}',instructions:${this.instructions},options:${this.options})`;
    }
}
const IRouter = DI.createInterface('IRouter', x => x.singleton(Router));
let Router = class Router {
    constructor(container, p, logger, events, locationMgr) {
        this.container = container;
        this.p = p;
        this.logger = logger;
        this.events = events;
        this.locationMgr = locationMgr;
        this._ctx = null;
        this._routeTree = null;
        this._currentTr = null;
        this.options = RouterOptions.DEFAULT;
        this.navigated = false;
        this.navigationId = 0;
        this.lastSuccessfulNavigation = null;
        this.activeNavigation = null;
        this.instructions = ViewportInstructionTree.create('');
        this.nextTr = null;
        this.locationChangeSubscription = null;
        this.vpaLookup = new Map();
        this.logger = logger.root.scopeTo('Router');
    }
    get ctx() {
        let ctx = this._ctx;
        if (ctx === null) {
            if (!this.container.has(IRouteContext, true)) {
                throw new Error(`Root RouteContext is not set. Did you forget to register RouteConfiguration, or try to navigate before calling Aurelia.start()?`);
            }
            ctx = this._ctx = this.container.get(IRouteContext);
        }
        return ctx;
    }
    get routeTree() {
        let routeTree = this._routeTree;
        if (routeTree === null) {
            // Lazy instantiation for only the very first (synthetic) tree.
            // Doing it here instead of in the constructor to delay it until we have the context.
            const ctx = this.ctx;
            routeTree = this._routeTree = new RouteTree(NavigationOptions.create({ ...this.options }), Object.freeze(new URLSearchParams()), null, RouteNode.create({
                path: '',
                finalPath: '',
                context: ctx,
                instruction: null,
                component: ctx.definition.component,
                append: false,
            }));
        }
        return routeTree;
    }
    get currentTr() {
        let currentTr = this._currentTr;
        if (currentTr === null) {
            currentTr = this._currentTr = Transition.create({
                id: 0,
                prevInstructions: this.instructions,
                instructions: this.instructions,
                finalInstructions: this.instructions,
                instructionsChanged: true,
                trigger: 'api',
                options: NavigationOptions.DEFAULT,
                managedState: null,
                previousRouteTree: this.routeTree.clone(),
                routeTree: this.routeTree,
                resolve: null,
                reject: null,
                promise: null,
                guardsResult: true,
                error: void 0,
            });
        }
        return currentTr;
    }
    set currentTr(value) {
        this._currentTr = value;
    }
    /**
     * Get the closest RouteContext relative to the provided component, controller or node.
     *
     * @param context - The object from which to resolve the closest RouteContext.
     *
     * @returns when the value is:
     * - `null`: the root
     * - `IRouteContext`: the provided value (no-op)
     * - `HTMLElement`: the context of the routeable component (page) that directly or indirectly contains this element.
     * - `ICustomElementViewModel` (the `this` object when working from inside a view model): the context of this component (if it was loaded as a route), or the routeable component (page) directly or indirectly containing it.
     * - `ICustomElementController`: same as `ICustomElementViewModel`, but using the controller object instead of the view model object (advanced users).
     */
    resolveContext(context) {
        return RouteContext.resolve(this.ctx, context);
    }
    start(routerOptions, performInitialNavigation) {
        this.options = RouterOptions.create(routerOptions);
        this.locationMgr.startListening();
        this.locationChangeSubscription = this.events.subscribe('au:router:location-change', e => {
            // TODO(fkleuver): add a throttle config.
            // At the time of writing, chromium throttles popstate events at a maximum of ~100 per second.
            // While macroTasks run up to 250 times per second, it is extremely unlikely that more than ~100 per second of these will run due to the double queueing.
            // However, this throttle limit could theoretically be hit by e.g. integration tests that don't mock Location/History.
            this.p.taskQueue.queueTask(() => {
                // Don't try to restore state that might not have anything to do with the Aurelia app
                const state = isManagedState(e.state) ? e.state : null;
                const options = NavigationOptions.create({
                    ...this.options,
                    historyStrategy: 'replace',
                });
                const instructions = ViewportInstructionTree.create(e.url, options);
                // The promise will be stored in the transition. However, unlike `load()`, `start()` does not return this promise in any way.
                // The router merely guarantees that it will be awaited (or canceled) before the next transition, so a race condition is impossible either way.
                // However, it is possible to get floating promises lingering during non-awaited unit tests, which could have unpredictable side-effects.
                // So we do want to solve this at some point.
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                this.enqueue(instructions, e.trigger, state, null);
            });
        });
        if (!this.navigated && performInitialNavigation) {
            return this.load(this.locationMgr.getPath(), { historyStrategy: 'replace' });
        }
    }
    stop() {
        var _a;
        this.locationMgr.stopListening();
        (_a = this.locationChangeSubscription) === null || _a === void 0 ? void 0 : _a.dispose();
    }
    load(instructionOrInstructions, options) {
        const instructions = this.createViewportInstructions(instructionOrInstructions, options);
        this.logger.trace('load(instructions:%s)', instructions);
        return this.enqueue(instructions, 'api', null, null);
    }
    isActive(instructionOrInstructions, context) {
        const ctx = this.resolveContext(context);
        const instructions = this.createViewportInstructions(instructionOrInstructions, { context: ctx });
        this.logger.trace('isActive(instructions:%s,ctx:%s)', instructions, ctx);
        // TODO: incorporate potential context offset by `../` etc in the instructions
        return this.routeTree.contains(instructions);
    }
    /**
     * Retrieve the RouteContext, which contains statically configured routes combined with the customElement metadata associated with a type.
     *
     * The customElement metadata is lazily associated with a type via the RouteContext the first time `getOrCreate` is called.
     *
     * This API is also used for direct routing even when there is no configuration at all.
     *
     * @param viewportAgent - The ViewportAgent hosting the component associated with this RouteContext. If the RouteContext for the component+viewport combination already exists, the ViewportAgent will be updated in case it changed.
     * @param component - The custom element definition.
     * @param renderContext - The `controller.context` of the component hosting the viewport that the route will be loaded into.
     *
     */
    getRouteContext(viewportAgent, component, renderContext) {
        const container = renderContext.container;
        const logger = container.get(ILogger).scopeTo('RouteContext');
        const routeDefinition = RouteDefinition.resolve(component.Type);
        let routeDefinitionLookup = this.vpaLookup.get(viewportAgent);
        if (routeDefinitionLookup === void 0) {
            this.vpaLookup.set(viewportAgent, routeDefinitionLookup = new WeakMap());
        }
        let routeContext = routeDefinitionLookup.get(routeDefinition);
        if (routeContext === void 0) {
            logger.trace(`creating new RouteContext for %s`, routeDefinition);
            const parent = container.has(IRouteContext, true) ? container.get(IRouteContext) : null;
            routeDefinitionLookup.set(routeDefinition, routeContext = new RouteContext(viewportAgent, parent, component, routeDefinition, container));
        }
        else {
            logger.trace(`returning existing RouteContext for %s`, routeDefinition);
            if (viewportAgent !== null) {
                routeContext.vpa = viewportAgent;
            }
        }
        return routeContext;
    }
    createViewportInstructions(instructionOrInstructions, options) {
        if (typeof instructionOrInstructions === 'string') {
            instructionOrInstructions = this.locationMgr.removeBaseHref(instructionOrInstructions);
        }
        return ViewportInstructionTree.create(instructionOrInstructions, this.getNavigationOptions(options));
    }
    /**
     * Enqueue an instruction tree to be processed as soon as possible.
     *
     * Will wait for any existing in-flight transition to finish, otherwise starts immediately.
     *
     * @param instructions - The instruction tree that determines the transition
     * @param trigger - `'popstate'` or `'hashchange'` if initiated by a browser event, or `'api'` for manually initiated transitions via the `load` api.
     * @param state - The state to restore, if any.
     * @param failedTr - If this is a redirect / fallback from a failed transition, the previous transition is passed forward to ensure the orinal promise resolves with the latest result.
     */
    enqueue(instructions, trigger, state, failedTr) {
        const lastTr = this.currentTr;
        if (trigger !== 'api' && lastTr.trigger === 'api' && lastTr.instructions.equals(instructions)) {
            // User-triggered navigation that results in `replaceState` with the same URL. The API call already triggered the navigation; event is ignored.
            this.logger.debug(`Ignoring navigation triggered by '%s' because it is the same URL as the previous navigation which was triggered by 'api'.`, trigger);
            return true;
        }
        let resolve = (void 0); // Need this initializer because TS doesn't know the promise executor will run synchronously
        let reject = (void 0);
        let promise;
        if (failedTr === null) {
            promise = new Promise(function ($resolve, $reject) { resolve = $resolve; reject = $reject; });
        }
        else {
            // Ensure that `await router.load` only resolves when the transition truly finished, so chain forward on top of
            // any previously failed transition that caused a recovering backwards navigation.
            this.logger.debug(`Reusing promise/resolve/reject from the previously failed transition %s`, failedTr);
            promise = failedTr.promise;
            resolve = failedTr.resolve;
            reject = failedTr.reject;
        }
        // This is an intentional overwrite: if a new transition is scheduled while the currently scheduled transition hasn't even started yet,
        // then the currently scheduled transition is effectively canceled/ignored.
        // This is consistent with the runtime's controller behavior, where if you rapidly call async activate -> deactivate -> activate (for example), then the deactivate is canceled.
        const nextTr = this.nextTr = Transition.create({
            id: ++this.navigationId,
            trigger,
            managedState: state,
            prevInstructions: lastTr.finalInstructions,
            finalInstructions: instructions,
            instructionsChanged: !lastTr.finalInstructions.equals(instructions),
            instructions,
            options: instructions.options,
            promise,
            resolve,
            reject,
            previousRouteTree: this.routeTree,
            routeTree: this._routeTree = this.routeTree.clone(),
            guardsResult: true,
            error: void 0,
        });
        this.logger.debug(`Scheduling transition: %s`, nextTr);
        if (this.activeNavigation === null) {
            // Catch any errors that might be thrown by `run` and reject the original promise which is awaited down below
            try {
                this.run(nextTr);
            }
            catch (err) {
                nextTr.handleError(err);
            }
        }
        return nextTr.promise.then(ret => {
            this.logger.debug(`Transition succeeded: %s`, nextTr);
            return ret;
        }).catch(err => {
            this.logger.error(`Navigation failed: %s`, nextTr, err);
            throw err;
        });
    }
    run(tr) {
        this.currentTr = tr;
        this.nextTr = null;
        // Clone it because the prevNavigation could have observers and stuff on it, and it's meant to be a standalone snapshot from here on.
        const prevNavigation = this.lastSuccessfulNavigation === null ? null : Navigation.create({
            ...this.lastSuccessfulNavigation,
            // There could be arbitrary state stored on a navigation, so to prevent memory leaks we only keep one `prevNavigation` around
            prevNavigation: null,
        });
        this.activeNavigation = Navigation.create({
            id: tr.id,
            instructions: tr.instructions,
            trigger: tr.trigger,
            options: tr.options,
            prevNavigation,
            finalInstructions: tr.finalInstructions,
        });
        const navigationContext = this.resolveContext(tr.options.context);
        const routeChanged = (!this.navigated ||
            tr.instructions.children.length !== navigationContext.node.children.length ||
            tr.instructions.children.some((x, i) => { var _a, _b; return !((_b = (_a = navigationContext.node.children[i]) === null || _a === void 0 ? void 0 : _a.originalInstruction.equals(x)) !== null && _b !== void 0 ? _b : false); }));
        const shouldProcessRoute = routeChanged || tr.options.getSameUrlStrategy(this.instructions) === 'reload';
        if (!shouldProcessRoute) {
            this.logger.trace(`run(tr:%s) - NOT processing route`, tr);
            this.navigated = true;
            this.activeNavigation = null;
            tr.resolve(false);
            this.runNextTransition(tr);
            return;
        }
        this.logger.trace(`run(tr:%s) - processing route`, tr);
        this.events.publish(new NavigationStartEvent(tr.id, tr.instructions, tr.trigger, tr.managedState));
        // If user triggered a new transition in response to the NavigationStartEvent
        // (in which case `this.nextTransition` will NOT be null), we short-circuit here and go straight to processing the next one.
        if (this.nextTr !== null) {
            this.logger.debug(`run(tr:%s) - aborting because a new transition was queued in response to the NavigationStartEvent`, tr);
            return this.run(this.nextTr);
        }
        this.activeNavigation = Navigation.create({
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            ...this.activeNavigation,
            // After redirects are applied, this could be a different route
            finalInstructions: tr.finalInstructions,
        });
        // TODO: run global guards
        //
        //
        // ---
        tr.run(() => {
            this.logger.trace(`run() - compiling route tree: %s`, tr.finalInstructions);
            return updateRouteTree(tr.routeTree, tr.finalInstructions, navigationContext);
        }, () => {
            const prev = tr.previousRouteTree.root.children;
            const next = tr.routeTree.root.children;
            const all = mergeDistinct(prev, next);
            Batch.start(b => {
                this.logger.trace(`run() - invoking canUnload on ${prev.length} nodes`);
                for (const node of prev) {
                    node.context.vpa.canUnload(tr, b);
                }
            }).continueWith(b => {
                if (tr.guardsResult !== true) {
                    b.push(); // prevent the next step in the batch from running
                    this.cancelNavigation(tr);
                }
            }).continueWith(b => {
                this.logger.trace(`run() - invoking canLoad on ${next.length} nodes`);
                for (const node of next) {
                    node.context.vpa.canLoad(tr, b);
                }
            }).continueWith(b => {
                if (tr.guardsResult !== true) {
                    b.push();
                    this.cancelNavigation(tr);
                }
            }).continueWith(b => {
                this.logger.trace(`run() - invoking unload on ${prev.length} nodes`);
                for (const node of prev) {
                    node.context.vpa.unload(tr, b);
                }
            }).continueWith(b => {
                this.logger.trace(`run() - invoking load on ${next.length} nodes`);
                for (const node of next) {
                    node.context.vpa.load(tr, b);
                }
            }).continueWith(b => {
                this.logger.trace(`run() - invoking swap on ${all.length} nodes`);
                for (const node of all) {
                    node.context.vpa.swap(tr, b);
                }
            }).continueWith(() => {
                this.logger.trace(`run() - finalizing transition`);
                // order doesn't matter for this operation
                all.forEach(function (node) {
                    node.context.vpa.endTransition();
                });
                this.navigated = true;
                this.instructions = tr.finalInstructions = tr.routeTree.finalizeInstructions();
                this.events.publish(new NavigationEndEvent(tr.id, tr.instructions, this.instructions));
                this.lastSuccessfulNavigation = this.activeNavigation;
                this.activeNavigation = null;
                this.applyHistoryState(tr);
                tr.resolve(true);
                this.runNextTransition(tr);
            }).start();
        });
    }
    applyHistoryState(tr) {
        const newUrl = tr.finalInstructions.toUrl(this.options.useUrlFragmentHash);
        switch (tr.options.getHistoryStrategy(this.instructions)) {
            case 'none':
                // do nothing
                break;
            case 'push':
                this.locationMgr.pushState(toManagedState(tr.options.state, tr.id), this.updateTitle(tr), newUrl);
                break;
            case 'replace':
                this.locationMgr.replaceState(toManagedState(tr.options.state, tr.id), this.updateTitle(tr), newUrl);
                break;
        }
    }
    getTitle(tr) {
        var _a, _b;
        switch (typeof tr.options.title) {
            case 'function':
                return (_a = tr.options.title.call(void 0, tr.routeTree.root)) !== null && _a !== void 0 ? _a : '';
            case 'string':
                return tr.options.title;
            default:
                return (_b = tr.routeTree.root.getTitle(tr.options.titleSeparator)) !== null && _b !== void 0 ? _b : '';
        }
    }
    updateTitle(tr) {
        const title = this.getTitle(tr);
        if (title.length > 0) {
            this.p.document.title = title;
        }
        return this.p.document.title;
    }
    cancelNavigation(tr) {
        this.logger.trace(`cancelNavigation(tr:%s)`, tr);
        const prev = tr.previousRouteTree.root.children;
        const next = tr.routeTree.root.children;
        const all = mergeDistinct(prev, next);
        // order doesn't matter for this operation
        all.forEach(function (node) {
            node.context.vpa.cancelUpdate();
        });
        this.activeNavigation = null;
        this.instructions = tr.prevInstructions;
        this._routeTree = tr.previousRouteTree;
        this.events.publish(new NavigationCancelEvent(tr.id, tr.instructions, `guardsResult is ${tr.guardsResult}`));
        if (tr.guardsResult === false) {
            tr.resolve(false);
            // In case a new navigation was requested in the meantime, immediately start processing it
            this.runNextTransition(tr);
        }
        else {
            void onResolve(this.enqueue(tr.guardsResult, 'api', tr.managedState, tr), () => {
                this.logger.trace(`cancelNavigation(tr:%s) - finished redirect`, tr);
            });
        }
    }
    runNextTransition(tr) {
        if (this.nextTr !== null) {
            this.logger.trace(`runNextTransition(tr:%s) -> scheduling nextTransition: %s`, tr, this.nextTr);
            this.p.taskQueue.queueTask(() => {
                // nextTransition is allowed to change up until the point when it's actually time to process it,
                // so we need to check it for null again when the scheduled task runs.
                const nextTr = this.nextTr;
                if (nextTr !== null) {
                    try {
                        this.run(nextTr);
                    }
                    catch (err) {
                        nextTr.handleError(err);
                    }
                }
            });
        }
    }
    getNavigationOptions(options) {
        return NavigationOptions.create({ ...this.options, ...options });
    }
};
Router = __decorate([
    __param(0, IContainer),
    __param(1, IPlatform),
    __param(2, ILogger),
    __param(3, IRouterEvents),
    __param(4, ILocationManager)
], Router);

/* eslint-disable @typescript-eslint/restrict-template-expressions */
const IViewportInstruction = DI.createInterface('IViewportInstruction');
class ViewportInstruction {
    constructor(context, append, open, close, component, viewport, params, children) {
        this.context = context;
        this.append = append;
        this.open = open;
        this.close = close;
        this.component = component;
        this.viewport = viewport;
        this.params = params;
        this.children = children;
    }
    static create(instruction, context) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        if (instruction instanceof ViewportInstruction) {
            return instruction;
        }
        if (isPartialViewportInstruction(instruction)) {
            const component = TypedNavigationInstruction.create(instruction.component);
            const children = (_b = (_a = instruction.children) === null || _a === void 0 ? void 0 : _a.map(ViewportInstruction.create)) !== null && _b !== void 0 ? _b : [];
            return new ViewportInstruction((_d = (_c = instruction.context) !== null && _c !== void 0 ? _c : context) !== null && _d !== void 0 ? _d : null, (_e = instruction.append) !== null && _e !== void 0 ? _e : false, (_f = instruction.open) !== null && _f !== void 0 ? _f : 0, (_g = instruction.close) !== null && _g !== void 0 ? _g : 0, component, (_h = instruction.viewport) !== null && _h !== void 0 ? _h : null, (_j = instruction.params) !== null && _j !== void 0 ? _j : null, children);
        }
        const typedInstruction = TypedNavigationInstruction.create(instruction);
        return new ViewportInstruction(context !== null && context !== void 0 ? context : null, false, 0, 0, typedInstruction, null, null, []);
    }
    contains(other) {
        const thisChildren = this.children;
        const otherChildren = other.children;
        if (thisChildren.length < otherChildren.length) {
            return false;
        }
        // TODO(fkleuver): incorporate viewports when null / '' descrepancies are fixed,
        // as well as params when inheritance is fully fixed
        if (!this.component.equals(other.component)) {
            return false;
        }
        for (let i = 0, ii = otherChildren.length; i < ii; ++i) {
            if (!thisChildren[i].contains(otherChildren[i])) {
                return false;
            }
        }
        return true;
    }
    equals(other) {
        const thisChildren = this.children;
        const otherChildren = other.children;
        if (thisChildren.length !== otherChildren.length) {
            return false;
        }
        if (
        // TODO(fkleuver): decide if we really need to include `context` in this comparison
        !this.component.equals(other.component) ||
            this.viewport !== other.viewport ||
            !shallowEquals(this.params, other.params)) {
            return false;
        }
        for (let i = 0, ii = thisChildren.length; i < ii; ++i) {
            if (!thisChildren[i].equals(otherChildren[i])) {
                return false;
            }
        }
        return true;
    }
    clone() {
        return new ViewportInstruction(this.context, this.append, this.open, this.close, this.component.clone(), this.viewport, this.params === null ? null : { ...this.params }, [...this.children]);
    }
    toUrlComponent(recursive = true) {
        // TODO(fkleuver): use the context to determine create full tree
        const component = this.component.toUrlComponent();
        const params = this.params === null || Object.keys(this.params).length === 0 ? '' : `(${stringifyParams(this.params)})`;
        const viewport = component.length === 0 || this.viewport === null || this.viewport.length === 0 ? '' : `@${this.viewport}`;
        const thisPart = `${'('.repeat(this.open)}${component}${params}${viewport}${')'.repeat(this.close)}`;
        const childPart = recursive ? this.children.map(x => x.toUrlComponent()).join('+') : '';
        if (thisPart.length > 0) {
            if (childPart.length > 0) {
                return [thisPart, childPart].join('/');
            }
            return thisPart;
        }
        return childPart;
    }
    toString() {
        const component = `c:${this.component}`;
        const viewport = this.viewport === null || this.viewport.length === 0 ? '' : `viewport:${this.viewport}`;
        const children = this.children.length === 0 ? '' : `children:[${this.children.map(String).join(',')}]`;
        const props = [component, viewport, children].filter(Boolean).join(',');
        return `VPI(${props})`;
    }
}
function stringifyParams(params) {
    const keys = Object.keys(params);
    const values = Array(keys.length);
    const indexKeys = [];
    const namedKeys = [];
    for (const key of keys) {
        if (isArrayIndex(key)) {
            indexKeys.push(Number(key));
        }
        else {
            namedKeys.push(key);
        }
    }
    for (let i = 0; i < keys.length; ++i) {
        const indexKeyIdx = indexKeys.indexOf(i);
        if (indexKeyIdx > -1) {
            values[i] = params[i];
            indexKeys.splice(indexKeyIdx, 1);
        }
        else {
            const namedKey = namedKeys.shift();
            values[i] = `${namedKey}=${params[namedKey]}`;
        }
    }
    return values.join(',');
}
/**
 * Associate the object with an id so it can be stored in history as a serialized url segment.
 *
 * WARNING: As the implementation is right now, this is a memory leak disaster.
 * This is really a placeholder implementation at the moment and should NOT be used / advertised for production until a leak-free solution is made.
 */
const getObjectId = (function () {
    let lastId = 0;
    const objectIdMap = new Map();
    return function (obj) {
        let id = objectIdMap.get(obj);
        if (id === void 0) {
            objectIdMap.set(obj, id = ++lastId);
        }
        return id;
    };
})();
class ViewportInstructionTree {
    constructor(options, isAbsolute, children, queryParams, fragment) {
        this.options = options;
        this.isAbsolute = isAbsolute;
        this.children = children;
        this.queryParams = queryParams;
        this.fragment = fragment;
    }
    static create(instructionOrInstructions, options) {
        const $options = NavigationOptions.create({ ...options });
        if (instructionOrInstructions instanceof ViewportInstructionTree) {
            return new ViewportInstructionTree($options, instructionOrInstructions.isAbsolute, instructionOrInstructions.children.map(x => ViewportInstruction.create(x, $options.context)), instructionOrInstructions.queryParams, instructionOrInstructions.fragment);
        }
        if (instructionOrInstructions instanceof Array) {
            return new ViewportInstructionTree($options, false, instructionOrInstructions.map(x => ViewportInstruction.create(x, $options.context)), Object.freeze(new URLSearchParams()), null);
        }
        if (typeof instructionOrInstructions === 'string') {
            const expr = RouteExpression.parse(instructionOrInstructions, $options.useUrlFragmentHash);
            return expr.toInstructionTree($options);
        }
        return new ViewportInstructionTree($options, false, [ViewportInstruction.create(instructionOrInstructions, $options.context)], Object.freeze(new URLSearchParams()), null);
    }
    equals(other) {
        const thisChildren = this.children;
        const otherChildren = other.children;
        if (thisChildren.length !== otherChildren.length) {
            return false;
        }
        for (let i = 0, ii = thisChildren.length; i < ii; ++i) {
            if (!thisChildren[i].equals(otherChildren[i])) {
                return false;
            }
        }
        return true;
    }
    toUrl(useUrlFragmentHash = false) {
        var _a;
        let pathname;
        let hash;
        if (useUrlFragmentHash) {
            pathname = '';
            hash = `#${this.toPath()}`;
        }
        else {
            pathname = this.toPath();
            hash = (_a = this.fragment) !== null && _a !== void 0 ? _a : '';
        }
        let search = this.queryParams.toString();
        search = search === '' ? '' : `?${search}`;
        const url = `${pathname}${hash}${search}`;
        return url;
    }
    toPath() {
        const path = this.children.map(x => x.toUrlComponent()).join('+');
        return path;
    }
    toString() {
        return `[${this.children.map(String).join(',')}]`;
    }
}
var NavigationInstructionType;
(function (NavigationInstructionType) {
    NavigationInstructionType[NavigationInstructionType["string"] = 0] = "string";
    NavigationInstructionType[NavigationInstructionType["ViewportInstruction"] = 1] = "ViewportInstruction";
    NavigationInstructionType[NavigationInstructionType["CustomElementDefinition"] = 2] = "CustomElementDefinition";
    NavigationInstructionType[NavigationInstructionType["Promise"] = 3] = "Promise";
    NavigationInstructionType[NavigationInstructionType["IRouteViewModel"] = 4] = "IRouteViewModel";
})(NavigationInstructionType || (NavigationInstructionType = {}));
class TypedNavigationInstruction {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
    static create(instruction) {
        if (instruction instanceof TypedNavigationInstruction) {
            return instruction;
        }
        if (typeof instruction === 'string') {
            return new TypedNavigationInstruction(0 /* string */, instruction);
        }
        else if (!isObject(instruction)) {
            // Typings prevent this from happening, but guard it anyway due to `as any` and the sorts being a thing in userland code and tests.
            expectType('function/class or object', '', instruction);
        }
        else if (typeof instruction === 'function') {
            // This is the class itself
            // CustomElement.getDefinition will throw if the type is not a custom element
            const definition = CustomElement.getDefinition(instruction);
            return new TypedNavigationInstruction(2 /* CustomElementDefinition */, definition);
        }
        else if (instruction instanceof Promise) {
            return new TypedNavigationInstruction(3 /* Promise */, instruction);
        }
        else if (isPartialViewportInstruction(instruction)) {
            const viewportInstruction = ViewportInstruction.create(instruction);
            return new TypedNavigationInstruction(1 /* ViewportInstruction */, viewportInstruction);
        }
        else if (isCustomElementViewModel(instruction)) {
            return new TypedNavigationInstruction(4 /* IRouteViewModel */, instruction);
        }
        else if (instruction instanceof CustomElementDefinition) {
            // We might have gotten a complete definition. In that case use it as-is.
            return new TypedNavigationInstruction(2 /* CustomElementDefinition */, instruction);
        }
        else if (isPartialCustomElementDefinition(instruction)) {
            // If we just got a partial definition, define a new anonymous class
            const Type = CustomElement.define(instruction);
            const definition = CustomElement.getDefinition(Type);
            return new TypedNavigationInstruction(2 /* CustomElementDefinition */, definition);
        }
        else {
            throw new Error(`Invalid component ${tryStringify(instruction)}: must be either a class, a custom element ViewModel, or a (partial) custom element definition`);
        }
    }
    equals(other) {
        switch (this.type) {
            case 2 /* CustomElementDefinition */:
            case 4 /* IRouteViewModel */:
            case 3 /* Promise */:
            case 0 /* string */:
                return this.type === other.type && this.value === other.value;
            case 1 /* ViewportInstruction */:
                return this.type === other.type && this.value.equals(other.value);
        }
    }
    clone() {
        return new TypedNavigationInstruction(this.type, this.value);
    }
    toUrlComponent() {
        switch (this.type) {
            case 2 /* CustomElementDefinition */:
                return this.value.name;
            case 4 /* IRouteViewModel */:
            case 3 /* Promise */:
                return `au$obj${getObjectId(this.value)}`;
            case 1 /* ViewportInstruction */:
                return this.value.toUrlComponent();
            case 0 /* string */:
                return this.value;
        }
    }
    toString() {
        switch (this.type) {
            case 2 /* CustomElementDefinition */:
                return `CEDef(name:'${this.value.name}')`;
            case 3 /* Promise */:
                return `Promise`;
            case 4 /* IRouteViewModel */:
                return `VM(name:'${CustomElement.getDefinition(this.value.constructor).name}')`;
            case 1 /* ViewportInstruction */:
                return this.value.toString();
            case 0 /* string */:
                return `'${this.value}'`;
        }
    }
}

const noRoutes = emptyArray;
function defaultReentryBehavior(current, next) {
    if (!shallowEquals(current.params, next.params)) {
        return 'invoke-lifecycles';
    }
    return 'none';
}
class RouteConfig {
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
class ChildRouteConfig extends RouteConfig {
    constructor(id, path, title, redirectTo, caseSensitive, reentryBehavior, viewport, data, routes, 
    /**
     * The component to load when this route is matched.
     */
    component) {
        super(id, path, title, redirectTo, caseSensitive, reentryBehavior, viewport, data, routes);
        this.component = component;
    }
}
const Route = {
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
function route(configOrPath) {
    return function (target) {
        return Route.configure(configOrPath, target);
    };
}

class RouteDefinition {
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
                const component = context.container.find(CustomElement, typedInstruction.value);
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

const componentAgentLookup = new WeakMap();
class ComponentAgent {
    constructor(instance, controller, definition, routeNode, ctx) {
        var _a, _b, _c, _d;
        this.instance = instance;
        this.controller = controller;
        this.definition = definition;
        this.routeNode = routeNode;
        this.ctx = ctx;
        this.logger = ctx.container.get(ILogger).scopeTo(`ComponentAgent<${ctx.friendlyPath}>`);
        this.logger.trace(`constructor()`);
        const lifecycleHooks = controller.lifecycleHooks;
        this.canLoadHooks = ((_a = lifecycleHooks.canLoad) !== null && _a !== void 0 ? _a : []).map(x => x.instance);
        this.loadHooks = ((_b = lifecycleHooks.load) !== null && _b !== void 0 ? _b : []).map(x => x.instance);
        this.canUnloadHooks = ((_c = lifecycleHooks.canUnload) !== null && _c !== void 0 ? _c : []).map(x => x.instance);
        this.unloadHooks = ((_d = lifecycleHooks.unload) !== null && _d !== void 0 ? _d : []).map(x => x.instance);
        this.hasCanLoad = 'canLoad' in instance;
        this.hasLoad = 'load' in instance;
        this.hasCanUnload = 'canUnload' in instance;
        this.hasUnload = 'unload' in instance;
    }
    static for(componentInstance, hostController, routeNode, ctx) {
        let componentAgent = componentAgentLookup.get(componentInstance);
        if (componentAgent === void 0) {
            const container = ctx.container;
            const definition = RouteDefinition.resolve(componentInstance.constructor);
            const controller = Controller.forCustomElement(container.get(IAppRoot), container, container, componentInstance, hostController.host, null);
            componentAgentLookup.set(componentInstance, componentAgent = new ComponentAgent(componentInstance, controller, definition, routeNode, ctx));
        }
        return componentAgent;
    }
    activate(initiator, parent, flags) {
        if (initiator === null) {
            this.logger.trace(`activate() - initial`);
            return this.controller.activate(this.controller, parent, flags);
        }
        this.logger.trace(`activate()`);
        // Promise return values from user VM hooks are awaited by the initiator
        void this.controller.activate(initiator, parent, flags);
    }
    deactivate(initiator, parent, flags) {
        if (initiator === null) {
            this.logger.trace(`deactivate() - initial`);
            return this.controller.deactivate(this.controller, parent, flags);
        }
        this.logger.trace(`deactivate()`);
        // Promise return values from user VM hooks are awaited by the initiator
        void this.controller.deactivate(initiator, parent, flags);
    }
    dispose() {
        this.logger.trace(`dispose()`);
        this.controller.dispose();
    }
    canUnload(tr, next, b) {
        this.logger.trace(`canUnload(next:%s) - invoking ${this.canUnloadHooks.length} hooks`, next);
        b.push();
        for (const hook of this.canUnloadHooks) {
            tr.run(() => {
                b.push();
                return hook.canUnload(this.instance, next, this.routeNode);
            }, ret => {
                if (tr.guardsResult === true && ret !== true) {
                    tr.guardsResult = false;
                }
                b.pop();
            });
        }
        if (this.hasCanUnload) {
            tr.run(() => {
                b.push();
                return this.instance.canUnload(next, this.routeNode);
            }, ret => {
                if (tr.guardsResult === true && ret !== true) {
                    tr.guardsResult = false;
                }
                b.pop();
            });
        }
        b.pop();
    }
    canLoad(tr, next, b) {
        this.logger.trace(`canLoad(next:%s) - invoking ${this.canLoadHooks.length} hooks`, next);
        b.push();
        for (const hook of this.canLoadHooks) {
            tr.run(() => {
                b.push();
                return hook.canLoad(this.instance, next.params, next, this.routeNode);
            }, ret => {
                if (tr.guardsResult === true && ret !== true) {
                    tr.guardsResult = ret === false ? false : ViewportInstructionTree.create(ret);
                }
                b.pop();
            });
        }
        if (this.hasCanLoad) {
            tr.run(() => {
                b.push();
                return this.instance.canLoad(next.params, next, this.routeNode);
            }, ret => {
                if (tr.guardsResult === true && ret !== true) {
                    tr.guardsResult = ret === false ? false : ViewportInstructionTree.create(ret);
                }
                b.pop();
            });
        }
        b.pop();
    }
    unload(tr, next, b) {
        this.logger.trace(`unload(next:%s) - invoking ${this.unloadHooks.length} hooks`, next);
        b.push();
        for (const hook of this.unloadHooks) {
            tr.run(() => {
                b.push();
                return hook.unload(this.instance, next, this.routeNode);
            }, () => {
                b.pop();
            });
        }
        if (this.hasUnload) {
            tr.run(() => {
                b.push();
                return this.instance.unload(next, this.routeNode);
            }, () => {
                b.pop();
            });
        }
        b.pop();
    }
    load(tr, next, b) {
        this.logger.trace(`load(next:%s) - invoking ${this.loadHooks.length} hooks`, next);
        b.push();
        for (const hook of this.loadHooks) {
            tr.run(() => {
                b.push();
                return hook.load(this.instance, next.params, next, this.routeNode);
            }, () => {
                b.pop();
            });
        }
        if (this.hasLoad) {
            tr.run(() => {
                b.push();
                return this.instance.load(next.params, next, this.routeNode);
            }, () => {
                b.pop();
            });
        }
        b.pop();
    }
    toString() {
        return `CA(ctx:'${this.ctx.friendlyPath}',c:'${this.definition.component.name}')`;
    }
}

/* eslint-disable @typescript-eslint/restrict-template-expressions */
const IRouteContext = DI.createInterface('IRouteContext');
const RESIDUE = 'au$residue';
/**
 * Holds the information of a component in the context of a specific container. May or may not have statically configured routes.
 *
 * The `RouteContext` is cached using a 3-part composite key consisting of the CustomElementDefinition, the RouteDefinition and the RenderContext.
 *
 * This means there can be more than one `RouteContext` per component type if either:
 * - The `RouteDefinition` for a type is overridden manually via `Route.define`
 * - Different components (with different `RenderContext`s) reference the same component via a child route config
 */
class RouteContext {
    constructor(viewportAgent, parent, component, definition, parentContainer) {
        var _a;
        this.parent = parent;
        this.component = component;
        this.definition = definition;
        this.parentContainer = parentContainer;
        this.childViewportAgents = [];
        /**
         * The (fully resolved) configured child routes of this context's `RouteDefinition`
         */
        this.childRoutes = [];
        this._resolved = null;
        this._allResolved = null;
        this.prevNode = null;
        this._node = null;
        this._vpa = null;
        this._vpa = viewportAgent;
        if (parent === null) {
            this.root = this;
            this.path = [this];
            this.friendlyPath = component.name;
        }
        else {
            this.root = parent.root;
            this.path = [...parent.path, this];
            this.friendlyPath = `${parent.friendlyPath}/${component.name}`;
        }
        this.logger = parentContainer.get(ILogger).scopeTo(`RouteContext<${this.friendlyPath}>`);
        this.logger.trace('constructor()');
        this.moduleLoader = parentContainer.get(IModuleLoader);
        const container = this.container = parentContainer.createChild();
        container.registerResolver(IController, this.hostControllerProvider = new InstanceProvider(), true);
        // We don't need to store it here but we use an InstanceProvider so that it can be disposed indirectly via the container.
        const contextProvider = new InstanceProvider();
        container.registerResolver(IRouteContext, contextProvider, true);
        contextProvider.prepare(this);
        container.register(definition);
        container.register(...component.dependencies);
        this.recognizer = new RouteRecognizer();
        const promises = [];
        const allPromises = [];
        for (const child of definition.config.routes) {
            if (child instanceof Promise) {
                const p = this.addRoute(child);
                promises.push(p);
                allPromises.push(p);
            }
            else {
                const routeDef = RouteDefinition.resolve(child, this);
                if (routeDef instanceof Promise) {
                    if (isPartialChildRouteConfig(child) && child.path != null) {
                        for (const path of ensureArrayOfStrings(child.path)) {
                            this.$addRoute(path, (_a = child.caseSensitive) !== null && _a !== void 0 ? _a : false, routeDef);
                        }
                        const idx = this.childRoutes.length;
                        const p = routeDef.then(resolvedRouteDef => {
                            return this.childRoutes[idx] = resolvedRouteDef;
                        });
                        this.childRoutes.push(p);
                        allPromises.push(p.then(noop));
                    }
                    else {
                        throw new Error(`Invalid route config. When the component property is a lazy import, the path must be specified. To use lazy loading without specifying the path (e.g. in direct routing), pass the import promise as a direct value to the routes array instead of providing it as the component property on an object literal.`);
                    }
                }
                else {
                    for (const path of routeDef.path) {
                        this.$addRoute(path, routeDef.caseSensitive, routeDef);
                    }
                    this.childRoutes.push(routeDef);
                }
            }
        }
        if (promises.length > 0) {
            this._resolved = Promise.all(promises).then(() => {
                this._resolved = null;
            });
        }
        if (allPromises.length > 0) {
            this._allResolved = Promise.all(allPromises).then(() => {
                this._allResolved = null;
            });
        }
    }
    get id() {
        return this.container.id;
    }
    get isRoot() {
        return this.parent === null;
    }
    get depth() {
        return this.path.length - 1;
    }
    /** @internal */
    get resolved() {
        return this._resolved;
    }
    /** @internal */
    get allResolved() {
        return this._allResolved;
    }
    get node() {
        const node = this._node;
        if (node === null) {
            throw new Error(`Invariant violation: RouteNode should be set immediately after the RouteContext is created. Context: ${this}`);
        }
        return node;
    }
    set node(value) {
        const prev = this.prevNode = this._node;
        if (prev !== value) {
            this._node = value;
            this.logger.trace(`Node changed from %s to %s`, this.prevNode, value);
        }
    }
    /**
     * The viewport hosting the component associated with this RouteContext.
     * The root RouteContext has no ViewportAgent and will throw when attempting to access this property.
     */
    get vpa() {
        const vpa = this._vpa;
        if (vpa === null) {
            throw new Error(`RouteContext has no ViewportAgent: ${this}`);
        }
        return vpa;
    }
    set vpa(value) {
        if (value === null || value === void 0) {
            throw new Error(`Cannot set ViewportAgent to ${value} for RouteContext: ${this}`);
        }
        const prev = this._vpa;
        if (prev !== value) {
            this._vpa = value;
            this.logger.trace(`ViewportAgent changed from %s to %s`, prev, value);
        }
    }
    /**
     * Create a new `RouteContext` and register it in the provided container.
     *
     * Uses the `RenderContext` of the registered `IAppRoot` as the root context.
     *
     * @param container - The container from which to resolve the `IAppRoot` and in which to register the `RouteContext`
     */
    static setRoot(container) {
        const logger = container.get(ILogger).scopeTo('RouteContext');
        if (!container.has(IAppRoot, true)) {
            logAndThrow(new Error(`The provided container has no registered IAppRoot. RouteContext.setRoot can only be used after Aurelia.app was called, on a container that is within that app's component tree.`), logger);
        }
        if (container.has(IRouteContext, true)) {
            logAndThrow(new Error(`A root RouteContext is already registered. A possible cause is the RouterConfiguration being registered more than once in the same container tree. If you have a multi-rooted app, make sure you register RouterConfiguration only in the "forked" containers and not in the common root.`), logger);
        }
        const { controller } = container.get(IAppRoot);
        if (controller === void 0) {
            logAndThrow(new Error(`The provided IAppRoot does not (yet) have a controller. A possible cause is calling this API manually before Aurelia.start() is called`), logger);
        }
        const router = container.get(IRouter);
        const routeContext = router.getRouteContext(null, controller.context.definition, controller.context);
        container.register(Registration.instance(IRouteContext, routeContext));
        routeContext.node = router.routeTree.root;
    }
    static resolve(root, context) {
        const rootContainer = root.container;
        const logger = rootContainer.get(ILogger).scopeTo('RouteContext');
        if (context === null || context === void 0) {
            logger.trace(`resolve(context:%s) - returning root RouteContext`, context);
            return root;
        }
        if (isRouteContext(context)) {
            logger.trace(`resolve(context:%s) - returning provided RouteContext`, context);
            return context;
        }
        if (context instanceof rootContainer.get(IPlatform).Node) {
            try {
                // CustomElement.for can theoretically throw in (as of yet) unknown situations.
                // If that happens, we want to know about the situation and *not* just fall back to the root context, as that might make
                // some already convoluted issues impossible to troubleshoot.
                // That's why we catch, log and re-throw instead of just letting the error bubble up.
                // This also gives us a set point in the future to potentially handle supported scenarios where this could occur.
                const controller = CustomElement.for(context, { searchParents: true });
                logger.trace(`resolve(context:Node(nodeName:'${context.nodeName}'),controller:'${controller.context.definition.name}') - resolving RouteContext from controller's RenderContext`);
                return controller.container.get(IRouteContext);
            }
            catch (err) {
                logger.error(`Failed to resolve RouteContext from Node(nodeName:'${context.nodeName}')`, err);
                throw err;
            }
        }
        if (isCustomElementViewModel(context)) {
            const controller = context.$controller;
            logger.trace(`resolve(context:CustomElementViewModel(name:'${controller.context.definition.name}')) - resolving RouteContext from controller's RenderContext`);
            return controller.container.get(IRouteContext);
        }
        if (isCustomElementController(context)) {
            const controller = context;
            logger.trace(`resolve(context:CustomElementController(name:'${controller.context.definition.name}')) - resolving RouteContext from controller's RenderContext`);
            return controller.container.get(IRouteContext);
        }
        logAndThrow(new Error(`Invalid context type: ${Object.prototype.toString.call(context)}`), logger);
    }
    dispose() {
        this.container.dispose();
    }
    // #endregion
    resolveViewportAgent(req) {
        this.logger.trace(`resolveViewportAgent(req:%s)`, req);
        const agent = this.childViewportAgents.find(x => { return x.handles(req); });
        if (agent === void 0) {
            throw new Error(`Failed to resolve ${req} at:\n${this.printTree()}`);
        }
        return agent;
    }
    getAvailableViewportAgents(resolution) {
        return this.childViewportAgents.filter(x => x.isAvailable(resolution));
    }
    getFallbackViewportAgent(resolution, name) {
        var _a;
        return (_a = this.childViewportAgents.find(x => x.isAvailable(resolution) && x.viewport.name === name && x.viewport.fallback.length > 0)) !== null && _a !== void 0 ? _a : null;
    }
    /**
     * Create a component based on the provided viewportInstruction.
     *
     * @param hostController - The `ICustomElementController` whose component (typically `au-viewport`) will host this component.
     * @param routeNode - The routeNode that describes the component + state.
     */
    createComponentAgent(hostController, routeNode) {
        this.logger.trace(`createComponentAgent(routeNode:%s)`, routeNode);
        this.hostControllerProvider.prepare(hostController);
        const routeDefinition = RouteDefinition.resolve(routeNode.component);
        const componentInstance = this.container.get(routeDefinition.component.key);
        const componentAgent = ComponentAgent.for(componentInstance, hostController, routeNode, this);
        this.hostControllerProvider.dispose();
        return componentAgent;
    }
    registerViewport(viewport) {
        const agent = ViewportAgent.for(viewport, this);
        if (this.childViewportAgents.includes(agent)) {
            this.logger.trace(`registerViewport(agent:%s) -> already registered, so skipping`, agent);
        }
        else {
            this.logger.trace(`registerViewport(agent:%s) -> adding`, agent);
            this.childViewportAgents.push(agent);
        }
        return agent;
    }
    unregisterViewport(viewport) {
        const agent = ViewportAgent.for(viewport, this);
        if (this.childViewportAgents.includes(agent)) {
            this.logger.trace(`unregisterViewport(agent:%s) -> unregistering`, agent);
            this.childViewportAgents.splice(this.childViewportAgents.indexOf(agent), 1);
        }
        else {
            this.logger.trace(`unregisterViewport(agent:%s) -> not registered, so skipping`, agent);
        }
    }
    recognize(path) {
        var _a;
        this.logger.trace(`recognize(path:'${path}')`);
        const result = this.recognizer.recognize(path);
        if (result === null) {
            return null;
        }
        let residue;
        if (Reflect.has(result.params, RESIDUE)) {
            residue = (_a = result.params[RESIDUE]) !== null && _a !== void 0 ? _a : null;
            Reflect.deleteProperty(result.params, RESIDUE);
        }
        else {
            residue = null;
        }
        return new $RecognizedRoute(result, residue);
    }
    addRoute(routeable) {
        this.logger.trace(`addRoute(routeable:'${routeable}')`);
        return onResolve(RouteDefinition.resolve(routeable, this), routeDef => {
            for (const path of routeDef.path) {
                this.$addRoute(path, routeDef.caseSensitive, routeDef);
            }
            this.childRoutes.push(routeDef);
        });
    }
    $addRoute(path, caseSensitive, handler) {
        this.recognizer.add({
            path,
            caseSensitive,
            handler,
        });
        this.recognizer.add({
            path: `${path}/*${RESIDUE}`,
            caseSensitive,
            handler,
        });
    }
    resolveLazy(promise) {
        return this.moduleLoader.load(promise, m => {
            let defaultExport = void 0;
            let firstNonDefaultExport = void 0;
            for (const item of m.items) {
                if (item.isConstructable) {
                    const def = item.definitions.find(isCustomElementDefinition);
                    if (def !== void 0) {
                        if (item.key === 'default') {
                            defaultExport = def;
                        }
                        else if (firstNonDefaultExport === void 0) {
                            firstNonDefaultExport = def;
                        }
                    }
                }
            }
            if (defaultExport === void 0) {
                if (firstNonDefaultExport === void 0) {
                    // TODO: make error more accurate and add potential causes/solutions
                    throw new Error(`${promise} does not appear to be a component or CustomElement recognizable by Aurelia`);
                }
                return firstNonDefaultExport;
            }
            return defaultExport;
        });
    }
    toString() {
        const vpAgents = this.childViewportAgents;
        const viewports = vpAgents.map(String).join(',');
        return `RC(path:'${this.friendlyPath}',viewports:[${viewports}])`;
    }
    printTree() {
        const tree = [];
        for (let i = 0; i < this.path.length; ++i) {
            tree.push(`${' '.repeat(i)}${this.path[i]}`);
        }
        return tree.join('\n');
    }
}
function isRouteContext(value) {
    return value instanceof RouteContext;
}
function logAndThrow(err, logger) {
    logger.error(err);
    throw err;
}
function isCustomElementDefinition(value) {
    return CustomElement.isType(value.Type);
}
class $RecognizedRoute {
    constructor(route, residue) {
        this.route = route;
        this.residue = residue;
    }
}

let ViewportCustomElement = class ViewportCustomElement {
    constructor(logger, ctx) {
        this.logger = logger;
        this.ctx = ctx;
        this.name = 'default';
        this.usedBy = '';
        this.default = '';
        this.fallback = '';
        this.noScope = false;
        this.noLink = false;
        this.noHistory = false;
        this.stateful = false;
        this.agent = (void 0);
        this.controller = (void 0);
        this.logger = logger.scopeTo(`au-viewport<${ctx.friendlyPath}>`);
        this.logger.trace('constructor()');
    }
    hydrated(controller) {
        this.logger.trace('hydrated()');
        this.controller = controller;
        this.agent = this.ctx.registerViewport(this);
    }
    attaching(initiator, parent, flags) {
        this.logger.trace('attaching()');
        return this.agent.activateFromViewport(initiator, this.controller, flags);
    }
    detaching(initiator, parent, flags) {
        this.logger.trace('detaching()');
        return this.agent.deactivateFromViewport(initiator, this.controller, flags);
    }
    dispose() {
        this.logger.trace('dispose()');
        this.ctx.unregisterViewport(this);
        this.agent.dispose();
        this.agent = (void 0);
    }
    toString() {
        const propStrings = [];
        for (const prop of props) {
            const value = this[prop];
            // Only report props that don't have default values (but always report name)
            // This is a bit naive and dirty right now, but it's mostly for debugging purposes anyway. Can clean up later. Maybe put it in a serializer
            switch (typeof value) {
                case 'string':
                    if (value !== '') {
                        propStrings.push(`${prop}:'${value}'`);
                    }
                    break;
                case 'boolean':
                    if (value) {
                        propStrings.push(`${prop}:${value}`);
                    }
                    break;
                default: {
                    propStrings.push(`${prop}:${String(value)}`);
                }
            }
        }
        return `VP(ctx:'${this.ctx.friendlyPath}',${propStrings.join(',')})`;
    }
};
__decorate([
    bindable
], ViewportCustomElement.prototype, "name", void 0);
__decorate([
    bindable
], ViewportCustomElement.prototype, "usedBy", void 0);
__decorate([
    bindable
], ViewportCustomElement.prototype, "default", void 0);
__decorate([
    bindable
], ViewportCustomElement.prototype, "fallback", void 0);
__decorate([
    bindable
], ViewportCustomElement.prototype, "noScope", void 0);
__decorate([
    bindable
], ViewportCustomElement.prototype, "noLink", void 0);
__decorate([
    bindable
], ViewportCustomElement.prototype, "noHistory", void 0);
__decorate([
    bindable
], ViewportCustomElement.prototype, "stateful", void 0);
ViewportCustomElement = __decorate([
    customElement({ name: 'au-viewport' }),
    __param(0, ILogger),
    __param(1, IRouteContext)
], ViewportCustomElement);
const props = [
    'name',
    'usedBy',
    'default',
    'fallback',
    'noScope',
    'noLink',
    'noHistory',
    'stateful',
];

let LoadCustomAttribute = class LoadCustomAttribute {
    constructor(target, el, router, events, delegator, ctx, locationMgr) {
        this.target = target;
        this.el = el;
        this.router = router;
        this.events = events;
        this.delegator = delegator;
        this.ctx = ctx;
        this.locationMgr = locationMgr;
        this.attribute = 'href';
        this.active = false;
        this.href = null;
        this.instructions = null;
        this.eventListener = null;
        this.navigationEndListener = null;
        this.onClick = (e) => {
            if (this.instructions === null) {
                return;
            }
            // Ensure this is an ordinary left-button click.
            if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey || e.button !== 0) {
                return;
            }
            e.preventDefault();
            // Floating promises from `Router#load` are ok because the router keeps track of state and handles the errors, etc.
            void this.router.load(this.instructions, { context: this.ctx });
        };
        // Ensure the element is not explicitly marked as external.
        this.isEnabled = !el.hasAttribute('external') && !el.hasAttribute('data-external');
    }
    binding() {
        if (this.isEnabled) {
            this.eventListener = this.delegator.addEventListener(this.target, this.el, 'click', this.onClick);
        }
        this.valueChanged();
        this.navigationEndListener = this.events.subscribe('au:router:navigation-end', _e => {
            this.valueChanged();
            this.active = this.instructions !== null && this.router.isActive(this.instructions, this.ctx);
        });
    }
    attaching() {
        if (this.ctx.allResolved !== null) {
            return this.ctx.allResolved.then(() => {
                this.valueChanged();
            });
        }
    }
    unbinding() {
        if (this.isEnabled) {
            this.eventListener.dispose();
        }
        this.navigationEndListener.dispose();
    }
    valueChanged() {
        const useHash = this.router.options.useUrlFragmentHash;
        if (this.route !== null && this.route !== void 0 && this.ctx.allResolved === null) {
            const def = this.ctx.childRoutes.find(x => x.id === this.route);
            if (def !== void 0) {
                // TODO(fkleuver): massive temporary hack. Will not work for siblings etc. Need to fix.
                const parentPath = this.ctx.node.computeAbsolutePath();
                // Note: This is very much preliminary just to fill the feature gap of v1's `generate`. It probably misses a few edge cases.
                // TODO(fkleuver): move this logic to RouteExpression and expose via public api, add tests etc
                let path = def.path[0];
                if (typeof this.params === 'object' && this.params !== null) {
                    const keys = Object.keys(this.params);
                    for (const key of keys) {
                        const value = this.params[key];
                        if (value != null && String(value).length > 0) {
                            path = path.replace(new RegExp(`[*:]${key}[?]?`), value);
                        }
                    }
                }
                // Remove leading and trailing optional param parts
                path = path.replace(/\/[*:][^/]+[?]/g, '').replace(/[*:][^/]+[?]\//g, '');
                if (parentPath) {
                    if (path) {
                        this.href = `${useHash ? '#' : ''}${[parentPath, path].join('/')}`;
                    }
                    else {
                        this.href = `${useHash ? '#' : ''}${parentPath}`;
                    }
                }
                else {
                    this.href = `${useHash ? '#' : ''}${path}`;
                }
                this.instructions = this.router.createViewportInstructions(`${useHash ? '#' : ''}${path}`, { context: this.ctx });
            }
            else {
                if (typeof this.params === 'object' && this.params !== null) {
                    this.instructions = this.router.createViewportInstructions({ component: this.route, params: this.params }, { context: this.ctx });
                }
                else {
                    this.instructions = this.router.createViewportInstructions(this.route, { context: this.ctx });
                }
                this.href = this.instructions.toUrl(this.router.options.useUrlFragmentHash);
            }
        }
        else {
            this.instructions = null;
            this.href = null;
        }
        const controller = CustomElement.for(this.el, { optional: true });
        if (controller !== null) {
            controller.viewModel[this.attribute] = this.instructions;
        }
        else {
            if (this.href === null) {
                this.el.removeAttribute(this.attribute);
            }
            else {
                const value = useHash ? this.href : this.locationMgr.addBaseHref(this.href);
                this.el.setAttribute(this.attribute, value);
            }
        }
    }
};
__decorate([
    bindable({ mode: BindingMode.toView, primary: true, callback: 'valueChanged' })
], LoadCustomAttribute.prototype, "route", void 0);
__decorate([
    bindable({ mode: BindingMode.toView, callback: 'valueChanged' })
], LoadCustomAttribute.prototype, "params", void 0);
__decorate([
    bindable({ mode: BindingMode.toView })
], LoadCustomAttribute.prototype, "attribute", void 0);
__decorate([
    bindable({ mode: BindingMode.fromView })
], LoadCustomAttribute.prototype, "active", void 0);
LoadCustomAttribute = __decorate([
    customAttribute('load'),
    __param(0, IEventTarget),
    __param(1, INode),
    __param(2, IRouter),
    __param(3, IRouterEvents),
    __param(4, IEventDelegator),
    __param(5, IRouteContext),
    __param(6, ILocationManager)
], LoadCustomAttribute);

let HrefCustomAttribute = class HrefCustomAttribute {
    constructor(target, el, router, delegator, ctx, w) {
        this.target = target;
        this.el = el;
        this.router = router;
        this.delegator = delegator;
        this.ctx = ctx;
        this.isInitialized = false;
        this.onClick = (e) => {
            // Ensure this is an ordinary left-button click
            if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey || e.button !== 0
                // on an internally managed link
                || this.isExternal
                || !this.isEnabled) {
                return;
            }
            // Use the normalized attribute instead of this.value to ensure consistency.
            const href = this.el.getAttribute('href');
            if (href !== null) {
                e.preventDefault();
                // Floating promises from `Router#load` are ok because the router keeps track of state and handles the errors, etc.
                void this.router.load(href, { context: this.ctx });
            }
        };
        if (router.options.useHref &&
            // Ensure the element is an anchor
            el.nodeName === 'A') {
            // Ensure the anchor targets the current window.
            switch (el.getAttribute('target')) {
                case null:
                case w.name:
                case '_self':
                    this.isEnabled = true;
                    break;
                default:
                    this.isEnabled = false;
                    break;
            }
        }
        else {
            this.isEnabled = false;
        }
    }
    get isExternal() {
        return this.el.hasAttribute('external') || this.el.hasAttribute('data-external');
    }
    binding() {
        if (!this.isInitialized) {
            this.isInitialized = true;
            this.isEnabled = this.isEnabled && getRef(this.el, CustomAttribute.getDefinition(LoadCustomAttribute).key) === null;
        }
        if (this.isEnabled) {
            this.el.setAttribute('href', this.value);
        }
        this.eventListener = this.delegator.addEventListener(this.target, this.el, 'click', this.onClick);
    }
    unbinding() {
        this.eventListener.dispose();
    }
    valueChanged(newValue) {
        this.el.setAttribute('href', newValue);
    }
};
__decorate([
    bindable({ mode: BindingMode.toView })
], HrefCustomAttribute.prototype, "value", void 0);
HrefCustomAttribute = __decorate([
    customAttribute({ name: 'href', noMultiBindings: true }),
    __param(0, IEventTarget),
    __param(1, INode),
    __param(2, IRouter),
    __param(3, IEventDelegator),
    __param(4, IRouteContext),
    __param(5, IWindow)
], HrefCustomAttribute);

const RouterRegistration = IRouter;
/**
 * Default runtime/environment-agnostic implementations for the following interfaces:
 * - `IRouter`
 */
const DefaultComponents = [
    RouterRegistration,
];
const ViewportCustomElementRegistration = ViewportCustomElement;
const LoadCustomAttributeRegistration = LoadCustomAttribute;
const HrefCustomAttributeRegistration = HrefCustomAttribute;
/**
 * Default router resources:
 * - Custom Elements: `au-viewport`
 * - Custom Attributes: `load`, `href`
 */
const DefaultResources = [
    ViewportCustomElement,
    LoadCustomAttribute,
    HrefCustomAttribute,
];
function configure(container, config) {
    return container.register(AppTask.hydrated(IContainer, RouteContext.setRoot), AppTask.afterActivate(IRouter, router => {
        if (isObject(config)) {
            if (typeof config === 'function') {
                return config(router);
            }
            else {
                return router.start(config, true);
            }
        }
        return router.start({}, true);
    }), AppTask.afterDeactivate(IRouter, router => {
        router.stop();
    }), ...DefaultComponents, ...DefaultResources);
}
const RouterConfiguration = {
    register(container) {
        return configure(container);
    },
    /**
     * Make it possible to specify options to Router activation.
     * Parameter is either a config object that's passed to Router's activate
     * or a config function that's called instead of Router's activate.
     */
    customize(config) {
        return {
            register(container) {
                return configure(container, config);
            },
        };
    },
};

class ScrollState {
    constructor(el) {
        this.el = el;
        this.top = el.scrollTop;
        this.left = el.scrollLeft;
    }
    static has(el) {
        return el.scrollTop > 0 || el.scrollLeft > 0;
    }
    restore() {
        this.el.scrollTo(this.left, this.top);
        this.el = null;
    }
}
function restoreState(state) {
    state.restore();
}
class HostElementState {
    constructor(host) {
        this.scrollStates = [];
        this.save(host.children);
    }
    save(elements) {
        let el;
        for (let i = 0, ii = elements.length; i < ii; ++i) {
            el = elements[i];
            if (ScrollState.has(el)) {
                this.scrollStates.push(new ScrollState(el));
            }
            this.save(el.children);
        }
    }
    restore() {
        this.scrollStates.forEach(restoreState);
        this.scrollStates = null;
    }
}
const IStateManager = DI.createInterface('IStateManager', x => x.singleton(ScrollStateManager));
class ScrollStateManager {
    constructor() {
        this.cache = new WeakMap();
    }
    saveState(controller) {
        this.cache.set(controller.host, new HostElementState(controller.host));
    }
    restoreState(controller) {
        const state = this.cache.get(controller.host);
        if (state !== void 0) {
            state.restore();
            this.cache.delete(controller.host);
        }
    }
}

export { AST, ActionExpression, AuNavId, ChildRouteConfig, ComponentAgent, ComponentExpression, CompositeSegmentExpression, DefaultComponents, DefaultResources, ExpressionKind, HrefCustomAttribute, HrefCustomAttributeRegistration, IBaseHrefProvider, ILocationManager, IRouteContext, IRouter, IRouterEvents, IStateManager, IViewportInstruction, LoadCustomAttribute, LoadCustomAttributeRegistration, LocationChangeEvent, Navigation, NavigationCancelEvent, NavigationEndEvent, NavigationErrorEvent, NavigationOptions, NavigationStartEvent, ParameterExpression, ParameterListExpression, Route, RouteConfig, RouteContext, RouteDefinition, RouteExpression, RouteNode, RouteTree, Router, RouterConfiguration, RouterOptions, RouterRegistration, ScopedSegmentExpression, SegmentExpression, SegmentGroupExpression, Transition, ViewportAgent, ViewportCustomElement, ViewportCustomElementRegistration, ViewportExpression, isManagedState, route, toManagedState };
//# sourceMappingURL=index.esm.js.map
