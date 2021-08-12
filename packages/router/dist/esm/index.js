import { DI as t, IEventAggregator as e, ILogger as i, bound as s, onResolve as n, resolveAll as o, isObject as r, IContainer as a, isArrayIndex as h, Metadata as c, Protocol as u, emptyArray as l, IModuleLoader as d, InstanceProvider as f, noop as p, Registration as g } from "@aurelia/kernel";

import { isCustomElementViewModel as v, IHistory as w, ILocation as m, IWindow as $, Controller as x, CustomElement as y, IPlatform as E, CustomElementDefinition as S, IController as b, IAppRoot as R, isCustomElementController as C, bindable as k, customElement as I, BindingMode as N, customAttribute as T, IEventTarget as V, INode as A, IEventDelegator as P, getRef as L, CustomAttribute as U, AppTask as O } from "@aurelia/runtime-html";

import { RouteRecognizer as j } from "@aurelia/route-recognizer";

class Batch {
    constructor(t, e, i) {
        this.stack = t;
        this.cb = e;
        this.done = false;
        this.next = null;
        this.head = null !== i && void 0 !== i ? i : this;
    }
    static start(t) {
        return new Batch(0, t, null);
    }
    push() {
        let t = this;
        do {
            ++t.stack;
            t = t.next;
        } while (null !== t);
    }
    pop() {
        let t = this;
        do {
            if (0 === --t.stack) t.invoke();
            t = t.next;
        } while (null !== t);
    }
    invoke() {
        const t = this.cb;
        if (null !== t) {
            this.cb = null;
            t(this);
            this.done = true;
        }
    }
    continueWith(t) {
        if (null === this.next) return this.next = new Batch(this.stack, t, this.head); else return this.next.continueWith(t);
    }
    start() {
        this.head.push();
        this.head.pop();
        return this;
    }
}

function B(t, e) {
    t = t.slice();
    e = e.slice();
    const i = [];
    while (t.length > 0) {
        const s = t.shift();
        if (i.every((t => t.context.vpa !== s.context.vpa))) {
            const t = e.findIndex((t => t.context.vpa === s.context.vpa));
            if (t >= 0) i.push(...e.splice(0, t + 1)); else i.push(s);
        }
    }
    i.push(...e);
    return i;
}

function D(t) {
    try {
        return JSON.stringify(t);
    } catch (e) {
        return Object.prototype.toString.call(t);
    }
}

function M(t) {
    return "string" === typeof t ? [ t ] : t;
}

function q(t) {
    return "string" === typeof t ? t : t[0];
}

function H(t) {
    return "object" === typeof t && null !== t && !v(t);
}

function F(t) {
    return H(t) && true === Object.prototype.hasOwnProperty.call(t, "name");
}

function z(t) {
    return H(t) && true === Object.prototype.hasOwnProperty.call(t, "component");
}

function W(t) {
    return H(t) && true === Object.prototype.hasOwnProperty.call(t, "redirectTo");
}

function G(t) {
    return H(t) && true === Object.prototype.hasOwnProperty.call(t, "component");
}

function Y(t, e, i) {
    throw new Error(`Invalid route config property: "${e}". Expected ${t}, but got ${D(i)}.`);
}

function _(t, e) {
    if (null === t || void 0 === t) throw new Error(`Invalid route config: expected an object or string, but got: ${String(t)}.`);
    const i = Object.keys(t);
    for (const s of i) {
        const i = t[s];
        const n = [ e, s ].join(".");
        switch (s) {
          case "id":
          case "viewport":
          case "redirectTo":
            if ("string" !== typeof i) Y("string", n, i);
            break;

          case "caseSensitive":
            if ("boolean" !== typeof i) Y("boolean", n, i);
            break;

          case "data":
            if ("object" !== typeof i || null === i) Y("object", n, i);
            break;

          case "title":
            switch (typeof i) {
              case "string":
              case "function":
                break;

              default:
                Y("string or function", n, i);
            }
            break;

          case "path":
            if (i instanceof Array) {
                for (let t = 0; t < i.length; ++t) if ("string" !== typeof i[t]) Y("string", `${n}[${t}]`, i[t]);
            } else if ("string" !== typeof i) Y("string or Array of strings", n, i);
            break;

          case "component":
            Z(i, n);
            break;

          case "routes":
            if (!(i instanceof Array)) Y("Array", n, i);
            for (const t of i) {
                const e = `${n}[${i.indexOf(t)}]`;
                Z(t, e);
            }
            break;

          case "transitionPlan":
            switch (typeof i) {
              case "string":
                switch (i) {
                  case "none":
                  case "replace":
                  case "invoke-lifecycles":
                    break;

                  default:
                    Y("string('none'|'replace'|'invoke-lifecycles') or function", n, i);
                }
                break;

              case "function":
                break;

              default:
                Y("string('none'|'replace'|'invoke-lifecycles') or function", n, i);
            }
            break;

          default:
            throw new Error(`Unknown route config property: "${e}.${s}". Please specify known properties only.`);
        }
    }
}

function J(t, e) {
    if (null === t || void 0 === t) throw new Error(`Invalid route config: expected an object or string, but got: ${String(t)}.`);
    const i = Object.keys(t);
    for (const s of i) {
        const i = t[s];
        const n = [ e, s ].join(".");
        switch (s) {
          case "path":
          case "redirectTo":
            if ("string" !== typeof i) Y("string", n, i);
            break;

          default:
            throw new Error(`Unknown redirect config property: "${e}.${s}". Only 'path' and 'redirectTo' should be specified for redirects.`);
        }
    }
}

function Z(t, e) {
    switch (typeof t) {
      case "function":
        break;

      case "object":
        if (t instanceof Promise) break;
        if (W(t)) {
            J(t, e);
            break;
        }
        if (z(t)) {
            _(t, e);
            break;
        }
        if (!v(t) && !F(t)) Y(`an object with at least a 'component' property (see Routeable)`, e, t);
        break;

      case "string":
        break;

      default:
        Y("function, object or string (see Routeable)", e, t);
    }
}

function Q(t, e) {
    if (t === e) return true;
    if (typeof t !== typeof e) return false;
    if (null === t || null === e) return false;
    if (Object.getPrototypeOf(t) !== Object.getPrototypeOf(e)) return false;
    const i = Object.keys(t);
    const s = Object.keys(e);
    if (i.length !== s.length) return false;
    for (let n = 0, o = i.length; n < o; ++n) {
        const o = i[n];
        if (o !== s[n]) return false;
        if (t[o] !== e[o]) return false;
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
***************************************************************************** */ function K(t, e, i, s) {
    var n = arguments.length, o = n < 3 ? e : null === s ? s = Object.getOwnPropertyDescriptor(e, i) : s, r;
    if ("object" === typeof Reflect && "function" === typeof Reflect.decorate) o = Reflect.decorate(t, e, i, s); else for (var a = t.length - 1; a >= 0; a--) if (r = t[a]) o = (n < 3 ? r(o) : n > 3 ? r(e, i, o) : r(e, i)) || o;
    return n > 3 && o && Object.defineProperty(e, i, o), o;
}

function X(t, e) {
    return function(i, s) {
        e(i, s, t);
    };
}

class Subscription {
    constructor(t, e, i) {
        this.events = t;
        this.serial = e;
        this.inner = i;
        this.disposed = false;
    }
    dispose() {
        if (!this.disposed) {
            this.disposed = true;
            this.inner.dispose();
            const t = this.events["subscriptions"];
            t.splice(t.indexOf(this), 1);
        }
    }
}

const tt = t.createInterface("IRouterEvents", (t => t.singleton(et)));

let et = class RouterEvents {
    constructor(t, e) {
        this.ea = t;
        this.logger = e;
        this.subscriptionSerial = 0;
        this.subscriptions = [];
        this.logger = e.scopeTo("RouterEvents");
    }
    publish(t) {
        this.logger.trace(`publishing %s`, t);
        this.ea.publish(t.name, t);
    }
    subscribe(t, e) {
        const i = new Subscription(this, ++this.subscriptionSerial, this.ea.subscribe(t, (s => {
            this.logger.trace(`handling %s for subscription #${i.serial}`, t);
            e(s);
        })));
        this.subscriptions.push(i);
        return i;
    }
};

et = K([ X(0, e), X(1, i) ], et);

class LocationChangeEvent {
    constructor(t, e, i, s) {
        this.id = t;
        this.url = e;
        this.trigger = i;
        this.state = s;
    }
    get name() {
        return "au:router:location-change";
    }
    toString() {
        return `LocationChangeEvent(id:${this.id},url:'${this.url}',trigger:'${this.trigger}')`;
    }
}

class NavigationStartEvent {
    constructor(t, e, i, s) {
        this.id = t;
        this.instructions = e;
        this.trigger = i;
        this.managedState = s;
    }
    get name() {
        return "au:router:navigation-start";
    }
    toString() {
        return `NavigationStartEvent(id:${this.id},instructions:'${this.instructions}',trigger:'${this.trigger}')`;
    }
}

class NavigationEndEvent {
    constructor(t, e, i) {
        this.id = t;
        this.instructions = e;
        this.finalInstructions = i;
    }
    get name() {
        return "au:router:navigation-end";
    }
    toString() {
        return `NavigationEndEvent(id:${this.id},instructions:'${this.instructions}',finalInstructions:'${this.finalInstructions}')`;
    }
}

class NavigationCancelEvent {
    constructor(t, e, i) {
        this.id = t;
        this.instructions = e;
        this.reason = i;
    }
    get name() {
        return "au:router:navigation-cancel";
    }
    toString() {
        return `NavigationCancelEvent(id:${this.id},instructions:'${this.instructions}',reason:${String(this.reason)})`;
    }
}

class NavigationErrorEvent {
    constructor(t, e, i) {
        this.id = t;
        this.instructions = e;
        this.error = i;
    }
    get name() {
        return "au:router:navigation-error";
    }
    toString() {
        return `NavigationErrorEvent(id:${this.id},instructions:'${this.instructions}',error:${String(this.error)})`;
    }
}

const it = t.createInterface("IBaseHrefProvider", (t => t.singleton(st)));

class BaseHref {
    constructor(t, e) {
        this.path = t;
        this.rootedPath = e;
    }
}

let st = class BrowserBaseHrefProvider {
    constructor(t) {
        this.window = t;
    }
    getBaseHref() {
        var t;
        const e = this.window.document.head.querySelector("base");
        if (null === e) return null;
        const i = rt(e.href);
        const s = rt(null !== (t = e.getAttribute("href")) && void 0 !== t ? t : "");
        return new BaseHref(s, i);
    }
};

st = K([ X(0, $) ], st);

const nt = t.createInterface("ILocationManager", (t => t.singleton(ot)));

let ot = class BrowserLocationManager {
    constructor(t, e, i, s, n, o) {
        var r;
        this.logger = t;
        this.events = e;
        this.history = i;
        this.location = s;
        this.window = n;
        this.baseHrefProvider = o;
        this.eventId = 0;
        this.logger = t.root.scopeTo("LocationManager");
        const a = o.getBaseHref();
        if (null === a) {
            const t = null !== (r = s.origin) && void 0 !== r ? r : "";
            const e = this.baseHref = new BaseHref("", rt(t));
            this.logger.warn(`no baseHref provided, defaulting to origin '${e.rootedPath}' (normalized from '${t}')`);
        } else {
            this.baseHref = a;
            this.logger.debug(`baseHref set to path: '${a.path}', rootedPath: '${a.rootedPath}'`);
        }
    }
    startListening() {
        this.logger.trace(`startListening()`);
        this.window.addEventListener("popstate", this.onPopState, false);
        this.window.addEventListener("hashchange", this.onHashChange, false);
    }
    stopListening() {
        this.logger.trace(`stopListening()`);
        this.window.removeEventListener("popstate", this.onPopState, false);
        this.window.removeEventListener("hashchange", this.onHashChange, false);
    }
    onPopState(t) {
        this.logger.trace(`onPopState()`);
        this.events.publish(new LocationChangeEvent(++this.eventId, this.getPath(), "popstate", t.state));
    }
    onHashChange(t) {
        this.logger.trace(`onHashChange()`);
        this.events.publish(new LocationChangeEvent(++this.eventId, this.getPath(), "hashchange", null));
    }
    pushState(t, e, i) {
        i = this.addBaseHref(i);
        try {
            const s = JSON.stringify(t);
            this.logger.trace(`pushState(state:${s},title:'${e}',url:'${i}')`);
        } catch (t) {
            this.logger.warn(`pushState(state:NOT_SERIALIZABLE,title:'${e}',url:'${i}')`);
        }
        this.history.pushState(t, e, i);
    }
    replaceState(t, e, i) {
        i = this.addBaseHref(i);
        try {
            const s = JSON.stringify(t);
            this.logger.trace(`replaceState(state:${s},title:'${e}',url:'${i}')`);
        } catch (t) {
            this.logger.warn(`replaceState(state:NOT_SERIALIZABLE,title:'${e}',url:'${i}')`);
        }
        this.history.replaceState(t, e, i);
    }
    getPath() {
        const {pathname: t, search: e, hash: i} = this.location;
        const s = this.removeBaseHref(`${t}${at(e)}${i}`);
        this.logger.trace(`getPath() -> '${s}'`);
        return s;
    }
    currentPathEquals(t) {
        const e = this.getPath() === this.removeBaseHref(t);
        this.logger.trace(`currentPathEquals(path:'${t}') -> ${e}`);
        return e;
    }
    addBaseHref(t) {
        const e = t;
        let i;
        let s = this.baseHref.rootedPath;
        if (s.endsWith("/")) s = s.slice(0, -1);
        if (0 === s.length) i = t; else {
            if (t.startsWith("/")) t = t.slice(1);
            i = `${s}/${t}`;
        }
        this.logger.trace(`addBaseHref(path:'${e}') -> '${i}'`);
        return i;
    }
    removeBaseHref(t) {
        const e = t;
        if (t.startsWith(this.baseHref.path)) t = t.slice(this.baseHref.path.length);
        t = rt(t);
        this.logger.trace(`removeBaseHref(path:'${e}') -> '${t}'`);
        return t;
    }
};

K([ s ], ot.prototype, "onPopState", null);

K([ s ], ot.prototype, "onHashChange", null);

ot = K([ X(0, i), X(1, tt), X(2, w), X(3, m), X(4, $), X(5, it) ], ot);

function rt(t) {
    let e;
    let i;
    let s;
    if ((s = t.indexOf("?")) >= 0 || (s = t.indexOf("#")) >= 0) {
        e = t.slice(0, s);
        i = t.slice(s);
    } else {
        e = t;
        i = "";
    }
    if (e.endsWith("/")) e = e.slice(0, -1); else if (e.endsWith("/index.html")) e = e.slice(0, -11);
    return `${e}${i}`;
}

function at(t) {
    return t.length > 0 && !t.startsWith("?") ? `?${t}` : t;
}

class ViewportRequest {
    constructor(t, e, i, s) {
        this.viewportName = t;
        this.componentName = e;
        this.resolution = i;
        this.append = s;
    }
    static create(t) {
        return new ViewportRequest(t.viewportName, t.componentName, t.resolution, t.append);
    }
    toString() {
        return `VR(viewport:'${this.viewportName}',component:'${this.componentName}',resolution:'${this.resolution}',append:${this.append})`;
    }
}

const ht = new WeakMap;

class ViewportAgent {
    constructor(t, e, s) {
        this.viewport = t;
        this.hostController = e;
        this.ctx = s;
        this.isActive = false;
        this.curCA = null;
        this.nextCA = null;
        this.state = 8256;
        this.$resolution = "dynamic";
        this.$plan = "replace";
        this.currNode = null;
        this.nextNode = null;
        this.currTransition = null;
        this.prevTransition = null;
        this.logger = s.container.get(i).scopeTo(`ViewportAgent<${s.friendlyPath}>`);
        this.logger.trace(`constructor()`);
    }
    get $state() {
        return ft(this.state);
    }
    get currState() {
        return 16256 & this.state;
    }
    set currState(t) {
        this.state = 127 & this.state | t;
    }
    get nextState() {
        return 127 & this.state;
    }
    set nextState(t) {
        this.state = 16256 & this.state | t;
    }
    static for(t, e) {
        let i = ht.get(t);
        if (void 0 === i) {
            const s = x.getCachedOrThrow(t);
            ht.set(t, i = new ViewportAgent(t, s, e));
        }
        return i;
    }
    activateFromViewport(t, e, i) {
        const s = this.currTransition;
        if (null !== s) ut(s);
        this.isActive = true;
        switch (this.nextState) {
          case 64:
            switch (this.currState) {
              case 8192:
                this.logger.trace(`activateFromViewport() - nothing to activate at %s`, this);
                return;

              case 4096:
                this.logger.trace(`activateFromViewport() - activating existing componentAgent at %s`, this);
                return this.curCA.activate(t, e, i);

              default:
                this.unexpectedState("activateFromViewport 1");
            }

          case 2:
            {
                if (null === this.currTransition) throw new Error(`Unexpected viewport activation outside of a transition context at ${this}`);
                if ("static" !== this.$resolution) throw new Error(`Unexpected viewport activation at ${this}`);
                this.logger.trace(`activateFromViewport() - running ordinary activate at %s`, this);
                const e = Batch.start((e => {
                    this.activate(t, this.currTransition, e);
                }));
                const i = new Promise((t => {
                    e.continueWith((() => {
                        t();
                    }));
                }));
                return e.start().done ? void 0 : i;
            }

          default:
            this.unexpectedState("activateFromViewport 2");
        }
    }
    deactivateFromViewport(t, e, i) {
        const s = this.currTransition;
        if (null !== s) ut(s);
        this.isActive = false;
        switch (this.currState) {
          case 8192:
            this.logger.trace(`deactivateFromViewport() - nothing to deactivate at %s`, this);
            return;

          case 4096:
            this.logger.trace(`deactivateFromViewport() - deactivating existing componentAgent at %s`, this);
            return this.curCA.deactivate(t, e, i);

          case 128:
            this.logger.trace(`deactivateFromViewport() - already deactivating at %s`, this);
            return;

          default:
            {
                if (null === this.currTransition) throw new Error(`Unexpected viewport deactivation outside of a transition context at ${this}`);
                this.logger.trace(`deactivateFromViewport() - running ordinary deactivate at %s`, this);
                const e = Batch.start((e => {
                    this.deactivate(t, this.currTransition, e);
                }));
                const i = new Promise((t => {
                    e.continueWith((() => {
                        t();
                    }));
                }));
                return e.start().done ? void 0 : i;
            }
        }
    }
    handles(t) {
        if (!this.isAvailable(t.resolution)) return false;
        if (t.append && 4096 === this.currState) {
            this.logger.trace(`handles(req:%s) -> false (append mode, viewport already has content %s)`, t, this.curCA);
            return false;
        }
        if (t.viewportName.length > 0 && this.viewport.name !== t.viewportName) {
            this.logger.trace(`handles(req:%s) -> false (names don't match)`, t);
            return false;
        }
        if (this.viewport.usedBy.length > 0 && !this.viewport.usedBy.split(",").includes(t.componentName)) {
            this.logger.trace(`handles(req:%s) -> false (componentName not included in usedBy)`, t);
            return false;
        }
        this.logger.trace(`handles(req:%s) -> true`, t);
        return true;
    }
    isAvailable(t) {
        if ("dynamic" === t && !this.isActive) {
            this.logger.trace(`isAvailable(resolution:%s) -> false (viewport is not active and we're in dynamic resolution resolution)`, t);
            return false;
        }
        if (64 !== this.nextState) {
            this.logger.trace(`isAvailable(resolution:%s) -> false (update already scheduled for %s)`, t, this.nextNode);
            return false;
        }
        return true;
    }
    canUnload(t, e) {
        if (null === this.currTransition) this.currTransition = t;
        ut(t);
        if (true !== t.guardsResult) return;
        e.push();
        Batch.start((e => {
            this.logger.trace(`canUnload() - invoking on children at %s`, this);
            for (const i of this.currNode.children) i.context.vpa.canUnload(t, e);
        })).continueWith((e => {
            switch (this.currState) {
              case 4096:
                this.logger.trace(`canUnload() - invoking on existing component at %s`, this);
                switch (this.$plan) {
                  case "none":
                    this.currState = 1024;
                    return;

                  case "invoke-lifecycles":
                  case "replace":
                    this.currState = 2048;
                    e.push();
                    Batch.start((e => {
                        this.logger.trace(`canUnload() - finished invoking on children, now invoking on own component at %s`, this);
                        this.curCA.canUnload(t, this.nextNode, e);
                    })).continueWith((() => {
                        this.logger.trace(`canUnload() - finished at %s`, this);
                        this.currState = 1024;
                        e.pop();
                    })).start();
                    return;
                }

              case 8192:
                this.logger.trace(`canUnload() - nothing to unload at %s`, this);
                return;

              default:
                t.handleError(new Error(`Unexpected state at canUnload of ${this}`));
            }
        })).continueWith((() => {
            e.pop();
        })).start();
    }
    canLoad(t, e) {
        if (null === this.currTransition) this.currTransition = t;
        ut(t);
        if (true !== t.guardsResult) return;
        e.push();
        Batch.start((e => {
            switch (this.nextState) {
              case 32:
                this.logger.trace(`canLoad() - invoking on new component at %s`, this);
                this.nextState = 16;
                switch (this.$plan) {
                  case "none":
                    return;

                  case "invoke-lifecycles":
                    return this.curCA.canLoad(t, this.nextNode, e);

                  case "replace":
                    this.nextCA = this.nextNode.context.createComponentAgent(this.hostController, this.nextNode);
                    return this.nextCA.canLoad(t, this.nextNode, e);
                }

              case 64:
                this.logger.trace(`canLoad() - nothing to load at %s`, this);
                return;

              default:
                this.unexpectedState("canLoad");
            }
        })).continueWith((t => {
            const e = this.nextNode;
            switch (this.$plan) {
              case "none":
              case "invoke-lifecycles":
                this.logger.trace(`canLoad(next:%s) - plan set to '%s', compiling residue`, e, this.$plan);
                t.push();
                void n(St(e), (() => {
                    t.pop();
                }));
                return;

              case "replace":
                switch (this.$resolution) {
                  case "dynamic":
                    this.logger.trace(`canLoad(next:%s) - (resolution: 'dynamic'), delaying residue compilation until activate`, e, this.$plan);
                    return;

                  case "static":
                    this.logger.trace(`canLoad(next:%s) - (resolution: '${this.$resolution}'), creating nextCA and compiling residue`, e, this.$plan);
                    t.push();
                    void n(St(e), (() => {
                        t.pop();
                    }));
                    return;
                }
            }
        })).continueWith((e => {
            switch (this.nextState) {
              case 16:
                this.logger.trace(`canLoad() - finished own component, now invoking on children at %s`, this);
                this.nextState = 8;
                for (const i of this.nextNode.children) i.context.vpa.canLoad(t, e);
                return;

              case 64:
                return;

              default:
                this.unexpectedState("canLoad");
            }
        })).continueWith((() => {
            this.logger.trace(`canLoad() - finished at %s`, this);
            e.pop();
        })).start();
    }
    unload(t, e) {
        ut(t);
        ct(this, t);
        e.push();
        Batch.start((e => {
            this.logger.trace(`unload() - invoking on children at %s`, this);
            for (const i of this.currNode.children) i.context.vpa.unload(t, e);
        })).continueWith((i => {
            switch (this.currState) {
              case 1024:
                this.logger.trace(`unload() - invoking on existing component at %s`, this);
                switch (this.$plan) {
                  case "none":
                    this.currState = 256;
                    return;

                  case "invoke-lifecycles":
                  case "replace":
                    this.currState = 512;
                    i.push();
                    Batch.start((e => {
                        this.logger.trace(`unload() - finished invoking on children, now invoking on own component at %s`, this);
                        this.curCA.unload(t, this.nextNode, e);
                    })).continueWith((() => {
                        this.logger.trace(`unload() - finished at %s`, this);
                        this.currState = 256;
                        i.pop();
                    })).start();
                    return;
                }

              case 8192:
                this.logger.trace(`unload() - nothing to unload at %s`, this);
                for (const i of this.currNode.children) i.context.vpa.unload(t, e);
                return;

              default:
                this.unexpectedState("unload");
            }
        })).continueWith((() => {
            e.pop();
        })).start();
    }
    load(t, e) {
        ut(t);
        ct(this, t);
        e.push();
        Batch.start((e => {
            switch (this.nextState) {
              case 8:
                this.logger.trace(`load() - invoking on new component at %s`, this);
                this.nextState = 4;
                switch (this.$plan) {
                  case "none":
                    return;

                  case "invoke-lifecycles":
                    return this.curCA.load(t, this.nextNode, e);

                  case "replace":
                    return this.nextCA.load(t, this.nextNode, e);
                }

              case 64:
                this.logger.trace(`load() - nothing to load at %s`, this);
                return;

              default:
                this.unexpectedState("load");
            }
        })).continueWith((e => {
            switch (this.nextState) {
              case 4:
                this.logger.trace(`load() - finished own component, now invoking on children at %s`, this);
                this.nextState = 2;
                for (const i of this.nextNode.children) i.context.vpa.load(t, e);
                return;

              case 64:
                return;

              default:
                this.unexpectedState("load");
            }
        })).continueWith((() => {
            this.logger.trace(`load() - finished at %s`, this);
            e.pop();
        })).start();
    }
    deactivate(t, e, i) {
        ut(e);
        ct(this, e);
        i.push();
        switch (this.currState) {
          case 256:
            this.logger.trace(`deactivate() - invoking on existing component at %s`, this);
            this.currState = 128;
            switch (this.$plan) {
              case "none":
              case "invoke-lifecycles":
                i.pop();
                return;

              case "replace":
                {
                    const s = this.hostController;
                    const n = this.viewport.stateful ? 0 : 32;
                    e.run((() => this.curCA.deactivate(t, s, n)), (() => {
                        i.pop();
                    }));
                }
            }
            return;

          case 8192:
            this.logger.trace(`deactivate() - nothing to deactivate at %s`, this);
            i.pop();
            return;

          case 128:
            this.logger.trace(`deactivate() - already deactivating at %s`, this);
            i.pop();
            return;

          default:
            this.unexpectedState("deactivate");
        }
    }
    activate(t, e, i) {
        ut(e);
        ct(this, e);
        i.push();
        if (32 === this.nextState && "dynamic" === this.$resolution) {
            this.logger.trace(`activate() - invoking canLoad(), load() and activate() on new component due to resolution 'dynamic' at %s`, this);
            Batch.start((t => {
                this.canLoad(e, t);
            })).continueWith((t => {
                this.load(e, t);
            })).continueWith((i => {
                this.activate(t, e, i);
            })).continueWith((() => {
                i.pop();
            })).start();
            return;
        }
        switch (this.nextState) {
          case 2:
            this.logger.trace(`activate() - invoking on existing component at %s`, this);
            this.nextState = 1;
            Batch.start((i => {
                switch (this.$plan) {
                  case "none":
                  case "invoke-lifecycles":
                    return;

                  case "replace":
                    {
                        const s = this.hostController;
                        const n = 0;
                        e.run((() => {
                            i.push();
                            return this.nextCA.activate(t, s, n);
                        }), (() => {
                            i.pop();
                        }));
                    }
                }
            })).continueWith((t => {
                this.processDynamicChildren(e, t);
            })).continueWith((() => {
                i.pop();
            })).start();
            return;

          case 64:
            this.logger.trace(`activate() - nothing to activate at %s`, this);
            i.pop();
            return;

          default:
            this.unexpectedState("activate");
        }
    }
    swap(t, e) {
        if (8192 === this.currState) {
            this.logger.trace(`swap() - running activate on next instead, because there is nothing to deactivate at %s`, this);
            this.activate(null, t, e);
            return;
        }
        if (64 === this.nextState) {
            this.logger.trace(`swap() - running deactivate on current instead, because there is nothing to activate at %s`, this);
            this.deactivate(null, t, e);
            return;
        }
        ut(t);
        ct(this, t);
        if (!(256 === this.currState && 2 === this.nextState)) this.unexpectedState("swap");
        this.currState = 128;
        this.nextState = 1;
        switch (this.$plan) {
          case "none":
          case "invoke-lifecycles":
            {
                this.logger.trace(`swap() - skipping this level and swapping children instead at %s`, this);
                const i = B(this.nextNode.children, this.currNode.children);
                for (const s of i) s.context.vpa.swap(t, e);
                return;
            }

          case "replace":
            {
                this.logger.trace(`swap() - running normally at %s`, this);
                const i = this.hostController;
                const s = this.curCA;
                const n = this.nextCA;
                const o = this.viewport.stateful ? 0 : 32;
                const r = 0;
                e.push();
                switch (t.options.swapStrategy) {
                  case "sequential-add-first":
                    Batch.start((e => {
                        t.run((() => {
                            e.push();
                            return n.activate(null, i, r);
                        }), (() => {
                            e.pop();
                        }));
                    })).continueWith((e => {
                        this.processDynamicChildren(t, e);
                    })).continueWith((() => {
                        t.run((() => s.deactivate(null, i, o)), (() => {
                            e.pop();
                        }));
                    })).start();
                    return;

                  case "sequential-remove-first":
                    Batch.start((e => {
                        t.run((() => {
                            e.push();
                            return s.deactivate(null, i, o);
                        }), (() => {
                            e.pop();
                        }));
                    })).continueWith((e => {
                        t.run((() => {
                            e.push();
                            return n.activate(null, i, r);
                        }), (() => {
                            e.pop();
                        }));
                    })).continueWith((e => {
                        this.processDynamicChildren(t, e);
                    })).continueWith((() => {
                        e.pop();
                    })).start();
                    return;

                  case "parallel-remove-first":
                    t.run((() => {
                        e.push();
                        return s.deactivate(null, i, o);
                    }), (() => {
                        e.pop();
                    }));
                    Batch.start((e => {
                        t.run((() => {
                            e.push();
                            return n.activate(null, i, r);
                        }), (() => {
                            e.pop();
                        }));
                    })).continueWith((e => {
                        this.processDynamicChildren(t, e);
                    })).continueWith((() => {
                        e.pop();
                    })).start();
                    return;
                }
            }
        }
    }
    processDynamicChildren(t, e) {
        this.logger.trace(`processDynamicChildren() - %s`, this);
        const i = this.nextNode;
        t.run((() => {
            e.push();
            return bt(i);
        }), (i => {
            Batch.start((e => {
                for (const s of i) t.run((() => {
                    e.push();
                    return s.context.vpa.canLoad(t, e);
                }), (() => {
                    e.pop();
                }));
            })).continueWith((e => {
                for (const s of i) t.run((() => {
                    e.push();
                    return s.context.vpa.load(t, e);
                }), (() => {
                    e.pop();
                }));
            })).continueWith((e => {
                for (const s of i) t.run((() => {
                    e.push();
                    return s.context.vpa.activate(null, t, e);
                }), (() => {
                    e.pop();
                }));
            })).continueWith((() => {
                e.pop();
            })).start();
        }));
    }
    scheduleUpdate(t, e) {
        var i, s;
        switch (this.nextState) {
          case 64:
            this.nextNode = e;
            this.nextState = 32;
            this.$resolution = t.resolutionMode;
            break;

          default:
            this.unexpectedState("scheduleUpdate 1");
        }
        switch (this.currState) {
          case 8192:
          case 4096:
          case 1024:
            break;

          default:
            this.unexpectedState("scheduleUpdate 2");
        }
        const n = null !== (s = null === (i = this.curCA) || void 0 === i ? void 0 : i.routeNode) && void 0 !== s ? s : null;
        if (null === n || n.component !== e.component) this.$plan = "replace"; else {
            const t = e.context.definition.config.transitionPlan;
            if ("function" === typeof t) this.$plan = t(n, e); else this.$plan = t;
        }
        this.logger.trace(`scheduleUpdate(next:%s) - plan set to '%s'`, e, this.$plan);
    }
    cancelUpdate() {
        if (null !== this.currNode) this.currNode.children.forEach((function(t) {
            t.context.vpa.cancelUpdate();
        }));
        if (null !== this.nextNode) this.nextNode.children.forEach((function(t) {
            t.context.vpa.cancelUpdate();
        }));
        this.logger.trace(`cancelUpdate(nextNode:%s)`, this.nextNode);
        switch (this.currState) {
          case 8192:
          case 4096:
            break;

          case 2048:
          case 1024:
            this.currState = 4096;
            break;
        }
        switch (this.nextState) {
          case 64:
          case 32:
          case 16:
          case 8:
            this.nextNode = null;
            this.nextState = 64;
            break;
        }
    }
    endTransition() {
        if (null !== this.currNode) this.currNode.children.forEach((function(t) {
            t.context.vpa.endTransition();
        }));
        if (null !== this.nextNode) this.nextNode.children.forEach((function(t) {
            t.context.vpa.endTransition();
        }));
        if (null !== this.currTransition) {
            ut(this.currTransition);
            switch (this.nextState) {
              case 64:
                switch (this.currState) {
                  case 128:
                    this.logger.trace(`endTransition() - setting currState to State.nextIsEmpty at %s`, this);
                    this.currState = 8192;
                    this.curCA = null;
                    break;

                  default:
                    this.unexpectedState("endTransition 1");
                }
                break;

              case 1:
                switch (this.currState) {
                  case 8192:
                  case 128:
                    switch (this.$plan) {
                      case "none":
                      case "invoke-lifecycles":
                        this.logger.trace(`endTransition() - setting currState to State.currIsActive at %s`, this);
                        this.currState = 4096;
                        break;

                      case "replace":
                        this.logger.trace(`endTransition() - setting currState to State.currIsActive and reassigning curCA at %s`, this);
                        this.currState = 4096;
                        this.curCA = this.nextCA;
                        break;
                    }
                    this.currNode = this.nextNode;
                    break;

                  default:
                    this.unexpectedState("endTransition 2");
                }
                break;

              default:
                this.unexpectedState("endTransition 3");
            }
            this.$plan = "replace";
            this.nextState = 64;
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
        var t;
        if (this.viewport.stateful) this.logger.trace(`dispose() - not disposing stateful viewport at %s`, this); else {
            this.logger.trace(`dispose() - disposing %s`, this);
            null === (t = this.curCA) || void 0 === t ? void 0 : t.dispose();
        }
    }
    unexpectedState(t) {
        throw new Error(`Unexpected state at ${t} of ${this}`);
    }
}

function ct(t, e) {
    if (true !== e.guardsResult) throw new Error(`Unexpected guardsResult ${e.guardsResult} at ${t}`);
}

function ut(t) {
    if (void 0 !== t.error) throw t.error;
}

var lt;

(function(t) {
    t[t["curr"] = 16256] = "curr";
    t[t["currIsEmpty"] = 8192] = "currIsEmpty";
    t[t["currIsActive"] = 4096] = "currIsActive";
    t[t["currCanUnload"] = 2048] = "currCanUnload";
    t[t["currCanUnloadDone"] = 1024] = "currCanUnloadDone";
    t[t["currUnload"] = 512] = "currUnload";
    t[t["currUnloadDone"] = 256] = "currUnloadDone";
    t[t["currDeactivate"] = 128] = "currDeactivate";
    t[t["next"] = 127] = "next";
    t[t["nextIsEmpty"] = 64] = "nextIsEmpty";
    t[t["nextIsScheduled"] = 32] = "nextIsScheduled";
    t[t["nextCanLoad"] = 16] = "nextCanLoad";
    t[t["nextCanLoadDone"] = 8] = "nextCanLoadDone";
    t[t["nextLoad"] = 4] = "nextLoad";
    t[t["nextLoadDone"] = 2] = "nextLoadDone";
    t[t["nextActivate"] = 1] = "nextActivate";
    t[t["bothAreEmpty"] = 8256] = "bothAreEmpty";
})(lt || (lt = {}));

const dt = new Map;

function ft(t) {
    let e = dt.get(t);
    if (void 0 === e) dt.set(t, e = pt(t));
    return e;
}

function pt(t) {
    const e = [];
    if (8192 === (8192 & t)) e.push("currIsEmpty");
    if (4096 === (4096 & t)) e.push("currIsActive");
    if (2048 === (2048 & t)) e.push("currCanUnload");
    if (1024 === (1024 & t)) e.push("currCanUnloadDone");
    if (512 === (512 & t)) e.push("currUnload");
    if (256 === (256 & t)) e.push("currUnloadDone");
    if (128 === (128 & t)) e.push("currDeactivate");
    if (64 === (64 & t)) e.push("nextIsEmpty");
    if (32 === (32 & t)) e.push("nextIsScheduled");
    if (16 === (16 & t)) e.push("nextCanLoad");
    if (8 === (8 & t)) e.push("nextCanLoadDone");
    if (4 === (4 & t)) e.push("nextLoad");
    if (2 === (2 & t)) e.push("nextLoadDone");
    if (1 === (1 & t)) e.push("nextActivate");
    return e.join("|");
}

const gt = [ "?", "#", "/", "+", "(", ")", ".", "@", "!", "=", ",", "&", "'", "~", ";" ];

class ParserState {
    constructor(t) {
        this.input = t;
        this.buffers = [];
        this.bufferIndex = 0;
        this.index = 0;
        this.rest = t;
    }
    get done() {
        return 0 === this.rest.length;
    }
    startsWith(...t) {
        const e = this.rest;
        return t.some((function(t) {
            return e.startsWith(t);
        }));
    }
    consumeOptional(t) {
        if (this.startsWith(t)) {
            this.rest = this.rest.slice(t.length);
            this.index += t.length;
            this.append(t);
            return true;
        }
        return false;
    }
    consume(t) {
        if (!this.consumeOptional(t)) this.expect(`'${t}'`);
    }
    expect(t) {
        throw new Error(`Expected ${t} at index ${this.index} of '${this.input}', but got: '${this.rest}' (rest='${this.rest}')`);
    }
    ensureDone() {
        if (!this.done) throw new Error(`Unexpected '${this.rest}' at index ${this.index} of '${this.input}'`);
    }
    advance() {
        const t = this.rest[0];
        this.rest = this.rest.slice(1);
        ++this.index;
        this.append(t);
    }
    record() {
        this.buffers[this.bufferIndex++] = "";
    }
    playback() {
        const t = --this.bufferIndex;
        const e = this.buffers;
        const i = e[t];
        e[t] = "";
        return i;
    }
    discard() {
        this.buffers[--this.bufferIndex] = "";
    }
    append(t) {
        const e = this.bufferIndex;
        const i = this.buffers;
        for (let s = 0; s < e; ++s) i[s] += t;
    }
}

var vt;

(function(t) {
    t[t["Route"] = 0] = "Route";
    t[t["CompositeSegment"] = 1] = "CompositeSegment";
    t[t["ScopedSegment"] = 2] = "ScopedSegment";
    t[t["SegmentGroup"] = 3] = "SegmentGroup";
    t[t["Segment"] = 4] = "Segment";
    t[t["Component"] = 5] = "Component";
    t[t["Action"] = 6] = "Action";
    t[t["Viewport"] = 7] = "Viewport";
    t[t["ParameterList"] = 8] = "ParameterList";
    t[t["Parameter"] = 9] = "Parameter";
})(vt || (vt = {}));

const wt = new Map;

const mt = new Map;

class RouteExpression {
    constructor(t, e, i, s, n, o) {
        this.raw = t;
        this.isAbsolute = e;
        this.root = i;
        this.queryParams = s;
        this.fragment = n;
        this.fragmentIsRoute = o;
    }
    get kind() {
        return 0;
    }
    static parse(t, e) {
        const i = e ? wt : mt;
        let s = i.get(t);
        if (void 0 === s) i.set(t, s = RouteExpression.$parse(t, e));
        return s;
    }
    static $parse(t, e) {
        let i;
        const s = t.indexOf("#");
        if (s >= 0) {
            const n = t.slice(s + 1);
            i = decodeURIComponent(n);
            if (e) t = i; else t = t.slice(0, s);
        } else {
            if (e) t = "";
            i = null;
        }
        let n = null;
        const o = t.indexOf("?");
        if (o >= 0) {
            const e = t.slice(o + 1);
            t = t.slice(0, o);
            n = new URLSearchParams(e);
        }
        if ("" === t) return new RouteExpression("", false, SegmentExpression.EMPTY, Object.freeze(null !== n && void 0 !== n ? n : new URLSearchParams), i, e);
        const r = new ParserState(t);
        r.record();
        const a = r.consumeOptional("/");
        const h = CompositeSegmentExpression.parse(r);
        r.ensureDone();
        const c = r.playback();
        return new RouteExpression(c, a, h, Object.freeze(null !== n && void 0 !== n ? n : new URLSearchParams), i, e);
    }
    toInstructionTree(t) {
        return new ViewportInstructionTree(t, this.isAbsolute, this.root.toInstructions(t.append, 0, 0), this.queryParams, this.fragment);
    }
    toString() {
        return this.raw;
    }
}

class CompositeSegmentExpression {
    constructor(t, e, i) {
        this.raw = t;
        this.siblings = e;
        this.append = i;
    }
    get kind() {
        return 1;
    }
    static parse(t) {
        t.record();
        const e = t.consumeOptional("+");
        const i = [];
        do {
            i.push(ScopedSegmentExpression.parse(t));
        } while (t.consumeOptional("+"));
        if (!e && 1 === i.length) {
            t.discard();
            return i[0];
        }
        const s = t.playback();
        return new CompositeSegmentExpression(s, i, e);
    }
    toInstructions(t, e, i) {
        switch (this.siblings.length) {
          case 0:
            return [];

          case 1:
            return this.siblings[0].toInstructions(t, e, i);

          case 2:
            return [ ...this.siblings[0].toInstructions(t, e, 0), ...this.siblings[1].toInstructions(t, 0, i) ];

          default:
            return [ ...this.siblings[0].toInstructions(t, e, 0), ...this.siblings.slice(1, -1).flatMap((function(e) {
                return e.toInstructions(t, 0, 0);
            })), ...this.siblings[this.siblings.length - 1].toInstructions(t, 0, i) ];
        }
    }
    toString() {
        return this.raw;
    }
}

class ScopedSegmentExpression {
    constructor(t, e, i) {
        this.raw = t;
        this.left = e;
        this.right = i;
    }
    get kind() {
        return 2;
    }
    static parse(t) {
        t.record();
        const e = SegmentGroupExpression.parse(t);
        if (t.consumeOptional("/")) {
            const i = ScopedSegmentExpression.parse(t);
            const s = t.playback();
            return new ScopedSegmentExpression(s, e, i);
        }
        t.discard();
        return e;
    }
    toInstructions(t, e, i) {
        const s = this.left.toInstructions(t, e, 0);
        const n = this.right.toInstructions(false, 0, i);
        let o = s[s.length - 1];
        while (o.children.length > 0) o = o.children[o.children.length - 1];
        o.children.push(...n);
        return s;
    }
    toString() {
        return this.raw;
    }
}

class SegmentGroupExpression {
    constructor(t, e) {
        this.raw = t;
        this.expression = e;
    }
    get kind() {
        return 3;
    }
    static parse(t) {
        t.record();
        if (t.consumeOptional("(")) {
            const e = CompositeSegmentExpression.parse(t);
            t.consume(")");
            const i = t.playback();
            return new SegmentGroupExpression(i, e);
        }
        t.discard();
        return SegmentExpression.parse(t);
    }
    toInstructions(t, e, i) {
        return this.expression.toInstructions(t, e + 1, i + 1);
    }
    toString() {
        return this.raw;
    }
}

class SegmentExpression {
    constructor(t, e, i, s, n) {
        this.raw = t;
        this.component = e;
        this.action = i;
        this.viewport = s;
        this.scoped = n;
    }
    get kind() {
        return 4;
    }
    static get EMPTY() {
        return new SegmentExpression("", ComponentExpression.EMPTY, ActionExpression.EMPTY, ViewportExpression.EMPTY, true);
    }
    static parse(t) {
        t.record();
        const e = ComponentExpression.parse(t);
        const i = ActionExpression.parse(t);
        const s = ViewportExpression.parse(t);
        const n = !t.consumeOptional("!");
        const o = t.playback();
        return new SegmentExpression(o, e, i, s, n);
    }
    toInstructions(t, e, i) {
        return [ ViewportInstruction.create({
            component: this.component.name,
            params: this.component.parameterList.toObject(),
            viewport: this.viewport.name,
            append: t,
            open: e,
            close: i
        }) ];
    }
    toString() {
        return this.raw;
    }
}

class ComponentExpression {
    constructor(t, e, i) {
        this.raw = t;
        this.name = e;
        this.parameterList = i;
        switch (e.charAt(0)) {
          case ":":
            this.isParameter = true;
            this.isStar = false;
            this.isDynamic = true;
            this.parameterName = e.slice(1);
            break;

          case "*":
            this.isParameter = false;
            this.isStar = true;
            this.isDynamic = true;
            this.parameterName = e.slice(1);
            break;

          default:
            this.isParameter = false;
            this.isStar = false;
            this.isDynamic = false;
            this.parameterName = e;
            break;
        }
    }
    get kind() {
        return 5;
    }
    static get EMPTY() {
        return new ComponentExpression("", "", ParameterListExpression.EMPTY);
    }
    static parse(t) {
        t.record();
        t.record();
        if (!t.done) if (t.startsWith("./")) t.advance(); else if (t.startsWith("../")) {
            t.advance();
            t.advance();
        } else while (!t.done && !t.startsWith(...gt)) t.advance();
        const e = decodeURIComponent(t.playback());
        if (0 === e.length) t.expect("component name");
        const i = ParameterListExpression.parse(t);
        const s = t.playback();
        return new ComponentExpression(s, e, i);
    }
    toString() {
        return this.raw;
    }
}

class ActionExpression {
    constructor(t, e, i) {
        this.raw = t;
        this.name = e;
        this.parameterList = i;
    }
    get kind() {
        return 6;
    }
    static get EMPTY() {
        return new ActionExpression("", "", ParameterListExpression.EMPTY);
    }
    static parse(t) {
        t.record();
        let e = "";
        if (t.consumeOptional(".")) {
            t.record();
            while (!t.done && !t.startsWith(...gt)) t.advance();
            e = decodeURIComponent(t.playback());
            if (0 === e.length) t.expect("method name");
        }
        const i = ParameterListExpression.parse(t);
        const s = t.playback();
        return new ActionExpression(s, e, i);
    }
    toString() {
        return this.raw;
    }
}

class ViewportExpression {
    constructor(t, e) {
        this.raw = t;
        this.name = e;
    }
    get kind() {
        return 7;
    }
    static get EMPTY() {
        return new ViewportExpression("", "");
    }
    static parse(t) {
        t.record();
        let e = "";
        if (t.consumeOptional("@")) {
            t.record();
            while (!t.done && !t.startsWith(...gt)) t.advance();
            e = decodeURIComponent(t.playback());
            if (0 === e.length) t.expect("viewport name");
        }
        const i = t.playback();
        return new ViewportExpression(i, e);
    }
    toString() {
        return this.raw;
    }
}

class ParameterListExpression {
    constructor(t, e) {
        this.raw = t;
        this.expressions = e;
    }
    get kind() {
        return 8;
    }
    static get EMPTY() {
        return new ParameterListExpression("", []);
    }
    static parse(t) {
        t.record();
        const e = [];
        if (t.consumeOptional("(")) {
            do {
                e.push(ParameterExpression.parse(t, e.length));
                if (!t.consumeOptional(",")) break;
            } while (!t.done && !t.startsWith(")"));
            t.consume(")");
        }
        const i = t.playback();
        return new ParameterListExpression(i, e);
    }
    toObject() {
        const t = {};
        for (const e of this.expressions) t[e.key] = e.value;
        return t;
    }
    toString() {
        return this.raw;
    }
}

class ParameterExpression {
    constructor(t, e, i) {
        this.raw = t;
        this.key = e;
        this.value = i;
    }
    get kind() {
        return 9;
    }
    static get EMPTY() {
        return new ParameterExpression("", "", "");
    }
    static parse(t, e) {
        t.record();
        t.record();
        while (!t.done && !t.startsWith(...gt)) t.advance();
        let i = decodeURIComponent(t.playback());
        if (0 === i.length) t.expect("parameter key");
        let s;
        if (t.consumeOptional("=")) {
            t.record();
            while (!t.done && !t.startsWith(...gt)) t.advance();
            s = decodeURIComponent(t.playback());
            if (0 === s.length) t.expect("parameter value");
        } else {
            s = i;
            i = e.toString();
        }
        const n = t.playback();
        return new ParameterExpression(n, i, s);
    }
    toString() {
        return this.raw;
    }
}

const $t = Object.freeze({
    RouteExpression: RouteExpression,
    CompositeSegmentExpression: CompositeSegmentExpression,
    ScopedSegmentExpression: ScopedSegmentExpression,
    SegmentGroupExpression: SegmentGroupExpression,
    SegmentExpression: SegmentExpression,
    ComponentExpression: ComponentExpression,
    ActionExpression: ActionExpression,
    ViewportExpression: ViewportExpression,
    ParameterListExpression: ParameterListExpression,
    ParameterExpression: ParameterExpression
});

let xt = 0;

class RouteNode {
    constructor(t, e, i, s, n, o, r, a, h, c, u, l, d, f, p, g) {
        this.id = t;
        this.path = e;
        this.finalPath = i;
        this.context = s;
        this.originalInstruction = n;
        this.instruction = o;
        this.params = r;
        this.queryParams = a;
        this.fragment = h;
        this.data = c;
        this.viewport = u;
        this.title = l;
        this.component = d;
        this.append = f;
        this.children = p;
        this.residue = g;
        this.version = 1;
        this.originalInstruction = o;
    }
    get root() {
        return this.tree.root;
    }
    static create(t) {
        var e, i, s, n, o, r, a, h;
        return new RouteNode(++xt, t.path, t.finalPath, t.context, t.instruction, t.instruction, null !== (e = t.params) && void 0 !== e ? e : {}, null !== (i = t.queryParams) && void 0 !== i ? i : Object.freeze(new URLSearchParams), null !== (s = t.fragment) && void 0 !== s ? s : null, null !== (n = t.data) && void 0 !== n ? n : {}, null !== (o = t.viewport) && void 0 !== o ? o : null, null !== (r = t.title) && void 0 !== r ? r : null, t.component, t.append, null !== (a = t.children) && void 0 !== a ? a : [], null !== (h = t.residue) && void 0 !== h ? h : []);
    }
    contains(t) {
        var e, i;
        if (this.context === t.options.context) {
            const s = this.children;
            const n = t.children;
            for (let t = 0, o = s.length; t < o; ++t) for (let r = 0, a = n.length; r < a; ++r) if (t + r < o && (null !== (i = null === (e = s[t + r].instruction) || void 0 === e ? void 0 : e.contains(n[r])) && void 0 !== i ? i : false)) {
                if (r + 1 === a) return true;
            } else break;
        }
        return this.children.some((function(e) {
            return e.contains(t);
        }));
    }
    appendChild(t) {
        this.children.push(t);
        t.setTree(this.tree);
    }
    appendChildren(...t) {
        for (const e of t) this.appendChild(e);
    }
    clearChildren() {
        for (const t of this.children) {
            t.clearChildren();
            t.context.vpa.cancelUpdate();
        }
        this.children.length = 0;
    }
    getTitle(t) {
        const e = [ ...this.children.map((e => e.getTitle(t))), this.getTitlePart() ].filter((t => null !== t));
        if (0 === e.length) return null;
        return e.join(t);
    }
    getTitlePart() {
        if ("function" === typeof this.title) return this.title.call(void 0, this);
        return this.title;
    }
    computeAbsolutePath() {
        if (this.context.isRoot) return "";
        const t = this.context.parent.node.computeAbsolutePath();
        const e = this.instruction.toUrlComponent(false);
        if (t.length > 0) {
            if (e.length > 0) return [ t, e ].join("/");
            return t;
        }
        return e;
    }
    setTree(t) {
        this.tree = t;
        for (const e of this.children) e.setTree(t);
    }
    finalizeInstruction() {
        const t = this.children.map((t => t.finalizeInstruction()));
        const e = this.instruction.clone();
        e.children.splice(0, e.children.length, ...t);
        return this.instruction = e;
    }
    clone() {
        const t = new RouteNode(this.id, this.path, this.finalPath, this.context, this.originalInstruction, this.instruction, {
            ...this.params
        }, {
            ...this.queryParams
        }, this.fragment, {
            ...this.data
        }, this.viewport, this.title, this.component, this.append, this.children.map((t => t.clone())), [ ...this.residue ]);
        t.version = this.version + 1;
        if (t.context.node === this) t.context.node = t;
        return t;
    }
    toString() {
        var t, e, i, s, n;
        const o = [];
        const r = null !== (i = null === (e = null === (t = this.context) || void 0 === t ? void 0 : t.definition.component) || void 0 === e ? void 0 : e.name) && void 0 !== i ? i : "";
        if (r.length > 0) o.push(`c:'${r}'`);
        const a = null !== (n = null === (s = this.context) || void 0 === s ? void 0 : s.definition.config.path) && void 0 !== n ? n : "";
        if (a.length > 0) o.push(`path:'${a}'`);
        if (this.children.length > 0) o.push(`children:[${this.children.map(String).join(",")}]`);
        if (this.residue.length > 0) o.push(`residue:${this.residue.map((function(t) {
            if ("string" === typeof t) return `'${t}'`;
            return String(t);
        })).join(",")}`);
        return `RN(ctx:'${this.context.friendlyPath}',${o.join(",")})`;
    }
}

class RouteTree {
    constructor(t, e, i, s) {
        this.options = t;
        this.queryParams = e;
        this.fragment = i;
        this.root = s;
    }
    contains(t) {
        return this.root.contains(t);
    }
    clone() {
        const t = new RouteTree(this.options.clone(), {
            ...this.queryParams
        }, this.fragment, this.root.clone());
        t.root.setTree(this);
        return t;
    }
    finalizeInstructions() {
        return new ViewportInstructionTree(this.options, true, this.root.children.map((t => t.finalizeInstruction())), this.queryParams, this.fragment);
    }
    toString() {
        return this.root.toString();
    }
}

function yt(t, e, s) {
    const o = s.container.get(i).scopeTo("RouteTree");
    const r = s.root;
    t.options = e.options;
    t.queryParams = e.queryParams;
    t.fragment = e.fragment;
    if (e.isAbsolute) s = r;
    if (s === r) {
        t.root.setTree(t);
        r.node = t.root;
    }
    const a = s.resolved instanceof Promise ? " - awaiting promise" : "";
    o.trace(`updateRouteTree(rootCtx:%s,rt:%s,vit:%s)${a}`, r, t, e);
    return n(s.resolved, (() => Et(o, e, s, r.node)));
}

function Et(t, e, i, s) {
    t.trace(`updateNode(ctx:%s,node:%s)`, i, s);
    s.queryParams = e.queryParams;
    s.fragment = e.fragment;
    let r;
    if (!s.context.isRoot) r = s.context.vpa.scheduleUpdate(s.tree.options, s); else r = void 0;
    return n(r, (() => {
        if (s.context === i) {
            s.clearChildren();
            return n(o(...e.children.map((e => Rt(t, s, e, s.tree.options.append || e.append)))), (() => o(...i.getAvailableViewportAgents("dynamic").map((e => {
                const i = ViewportInstruction.create({
                    component: e.viewport.default,
                    viewport: e.viewport.name
                });
                return Rt(t, s, i, s.append);
            })))));
        }
        return o(...s.children.map((s => Et(t, e, i, s))));
    }));
}

function St(t) {
    const e = t.context;
    const s = e.container.get(i).scopeTo("RouteTree");
    const r = e.resolved instanceof Promise ? " - awaiting promise" : "";
    s.trace(`processResidue(node:%s)${r}`, t);
    return n(e.resolved, (() => o(...t.residue.splice(0).map((e => Rt(s, t, e, t.append))), ...e.getAvailableViewportAgents("static").map((e => {
        const i = ViewportInstruction.create({
            component: e.viewport.default,
            viewport: e.viewport.name
        });
        return Rt(s, t, i, t.append);
    })))));
}

function bt(t) {
    const e = t.context;
    const s = e.container.get(i).scopeTo("RouteTree");
    const r = e.resolved instanceof Promise ? " - awaiting promise" : "";
    s.trace(`getDynamicChildren(node:%s)${r}`, t);
    return n(e.resolved, (() => {
        const i = t.children.slice();
        return n(o(...t.residue.splice(0).map((e => Rt(s, t, e, t.append))), ...e.getAvailableViewportAgents("dynamic").map((e => {
            const i = ViewportInstruction.create({
                component: e.viewport.default,
                viewport: e.viewport.name
            });
            return Rt(s, t, i, t.append);
        }))), (() => t.children.filter((t => !i.includes(t)))));
    }));
}

function Rt(t, e, i, s) {
    var n, r;
    t.trace(`createAndAppendNodes(node:%s,vi:%s,append:${s})`, e, i);
    switch (i.component.type) {
      case 0:
        switch (i.component.value) {
          case "..":
            e.clearChildren();
            e = null !== (r = null === (n = e.context.parent) || void 0 === n ? void 0 : n.node) && void 0 !== r ? r : e;

          case ".":
            return o(...i.children.map((i => Rt(t, e, i, i.append))));

          default:
            {
                const n = Ct(t, e, i, s);
                if (null === n) return;
                return Nt(t, e, n);
            }
        }

      case 4:
      case 2:
        {
            const n = RouteDefinition.resolve(i.component.value);
            const o = It(t, e, i, s, n.component);
            return Nt(t, e, o);
        }
    }
}

function Ct(t, e, i, s) {
    const n = e.context;
    let o = 0;
    let r = i.component.value;
    let a = i;
    while (1 === a.children.length) {
        a = a.children[0];
        if (0 === a.component.type) {
            ++o;
            r = `${r}/${a.component.value}`;
        } else break;
    }
    const h = n.recognize(r);
    if (null === h) {
        const o = i.component.value;
        let r = n.container.find(y, o);
        switch (e.tree.options.routingMode) {
          case "configured-only":
            if (null === r) {
                if ("" === o) return null;
                throw new Error(`'${o}' did not match any configured route or registered component name at '${n.friendlyPath}' - did you forget to add '${o}' to the routes list of the route decorator of '${n.component.name}'?`);
            }
            throw new Error(`'${o}' did not match any configured route, but it does match a registered component name at '${n.friendlyPath}' - did you forget to add a @route({ path: '${o}' }) decorator to '${o}' or unintentionally set routingMode to 'configured-only'?`);

          case "configured-first":
            if (null === r) {
                if ("" === o) return null;
                const t = null === i.viewport || 0 === i.viewport.length ? "default" : i.viewport;
                const e = n.getFallbackViewportAgent("dynamic", t);
                if (null === e) throw new Error(`'${o}' did not match any configured route or registered component name at '${n.friendlyPath}' and no fallback was provided for viewport '${t}' - did you forget to add the component '${o}' to the dependencies of '${n.component.name}' or to register it as a global dependency?`);
                const s = e.viewport.fallback;
                r = n.container.find(y, s);
                if (null === r) throw new Error(`the requested component '${o}' and the fallback '${s}' at viewport '${t}' did not match any configured route or registered component name at '${n.friendlyPath}' - did you forget to add the component '${o}' to the dependencies of '${n.component.name}' or to register it as a global dependency?`);
            }
            return It(t, e, i, s, r);
        }
    }
    const c = null === h.residue ? r : r.slice(0, -(h.residue.length + 1));
    i.component.value = c;
    for (let t = 0; t < o; ++t) i.children = i.children[0].children;
    return kt(t, e, i, s, h);
}

function kt(t, e, i, s, o, r = o.route.endpoint.route) {
    const a = e.context;
    const h = e.tree;
    return n(r.handler, (n => {
        r.handler = n;
        if (null === n.redirectTo) {
            const c = n.viewport;
            const u = n.component;
            const l = a.resolveViewportAgent(ViewportRequest.create({
                viewportName: c,
                componentName: u.name,
                append: s,
                resolution: h.options.resolutionMode
            }));
            const d = a.container.get(Lt);
            const f = d.getRouteContext(l, u, l.hostController.container);
            f.node = RouteNode.create({
                path: o.route.endpoint.route.path,
                finalPath: r.path,
                context: f,
                instruction: i,
                params: {
                    ...e.params,
                    ...o.route.params
                },
                queryParams: h.queryParams,
                fragment: h.fragment,
                data: n.data,
                viewport: c,
                component: u,
                append: s,
                title: n.config.title,
                residue: null === o.residue ? [] : [ ViewportInstruction.create(o.residue) ]
            });
            f.node.setTree(e.tree);
            t.trace(`createConfiguredNode(vi:%s) -> %s`, i, f.node);
            return f.node;
        }
        const c = RouteExpression.parse(r.path, false);
        const u = RouteExpression.parse(n.redirectTo, false);
        let l;
        let d;
        const f = [];
        switch (c.root.kind) {
          case 2:
          case 4:
            l = c.root;
            break;

          default:
            throw new Error(`Unexpected expression kind ${c.root.kind}`);
        }
        switch (u.root.kind) {
          case 2:
          case 4:
            d = u.root;
            break;

          default:
            throw new Error(`Unexpected expression kind ${u.root.kind}`);
        }
        let p;
        let g;
        let v = false;
        let w = false;
        while (!(v && w)) {
            if (v) p = null; else if (4 === l.kind) {
                p = l;
                v = true;
            } else if (4 === l.left.kind) {
                p = l.left;
                switch (l.right.kind) {
                  case 2:
                  case 4:
                    l = l.right;
                    break;

                  default:
                    throw new Error(`Unexpected expression kind ${l.right.kind}`);
                }
            } else throw new Error(`Unexpected expression kind ${l.left.kind}`);
            if (w) g = null; else if (4 === d.kind) {
                g = d;
                w = true;
            } else if (4 === d.left.kind) {
                g = d.left;
                switch (d.right.kind) {
                  case 2:
                  case 4:
                    d = d.right;
                    break;

                  default:
                    throw new Error(`Unexpected expression kind ${d.right.kind}`);
                }
            } else throw new Error(`Unexpected expression kind ${d.left.kind}`);
            if (null !== g) if (g.component.isDynamic && (null === p || void 0 === p ? void 0 : p.component.isDynamic)) f.push(o.route.params[p.component.name]); else f.push(g.raw);
        }
        const m = f.filter(Boolean).join("/");
        const $ = a.recognize(m);
        if (null === $) {
            const n = m;
            const o = a.container.find(y, m);
            switch (h.options.routingMode) {
              case "configured-only":
                if (null === o) throw new Error(`'${n}' did not match any configured route or registered component name at '${a.friendlyPath}' - did you forget to add '${n}' to the routes list of the route decorator of '${a.component.name}'?`);
                throw new Error(`'${n}' did not match any configured route, but it does match a registered component name at '${a.friendlyPath}' - did you forget to add a @route({ path: '${n}' }) decorator to '${n}' or unintentionally set routingMode to 'configured-only'?`);

              case "configured-first":
                if (null === o) throw new Error(`'${n}' did not match any configured route or registered component name at '${a.friendlyPath}' - did you forget to add the component '${n}' to the dependencies of '${a.component.name}' or to register it as a global dependency?`);
                return It(t, e, i, s, o);
            }
        }
        return kt(t, e, i, s, o, $.route.endpoint.route);
    }));
}

function It(t, e, i, s, n) {
    var o;
    const r = e.context;
    const a = e.tree;
    const h = null !== (o = i.viewport) && void 0 !== o ? o : "default";
    const c = r.resolveViewportAgent(ViewportRequest.create({
        viewportName: h,
        componentName: n.name,
        append: s,
        resolution: a.options.resolutionMode
    }));
    const u = r.container.get(Lt);
    const l = u.getRouteContext(c, n, c.hostController.container);
    const d = RouteDefinition.resolve(n);
    l.node = RouteNode.create({
        path: n.name,
        finalPath: n.name,
        context: l,
        instruction: i,
        params: {
            ...r.node.params,
            ...i.params
        },
        queryParams: a.queryParams,
        fragment: a.fragment,
        data: d.data,
        viewport: h,
        component: n,
        append: s,
        title: d.config.title,
        residue: [ ...i.children ]
    });
    l.node.setTree(r.node.tree);
    t.trace(`createDirectNode(vi:%s) -> %s`, i, l.node);
    return l.node;
}

function Nt(t, e, i) {
    return n(i, (i => {
        t.trace(`appendNode($childNode:%s)`, i);
        e.appendChild(i);
        return i.context.vpa.scheduleUpdate(e.tree.options, i);
    }));
}

const Tt = "au-nav-id";

function Vt(t) {
    return r(t) && true === Object.prototype.hasOwnProperty.call(t, Tt);
}

function At(t, e) {
    return {
        ...t,
        [Tt]: e
    };
}

function Pt(t, e) {
    if ("function" === typeof e) return e(t);
    return e;
}

class RouterOptions {
    constructor(t, e, i, s, n, o, r, a, h, c) {
        this.useUrlFragmentHash = t;
        this.useHref = e;
        this.statefulHistoryLength = i;
        this.routingMode = s;
        this.swapStrategy = n;
        this.resolutionMode = o;
        this.queryParamsStrategy = r;
        this.fragmentStrategy = a;
        this.historyStrategy = h;
        this.sameUrlStrategy = c;
    }
    static get DEFAULT() {
        return RouterOptions.create({});
    }
    static create(t) {
        var e, i, s, n, o, r, a, h, c, u;
        return new RouterOptions(null !== (e = t.useUrlFragmentHash) && void 0 !== e ? e : false, null !== (i = t.useHref) && void 0 !== i ? i : true, null !== (s = t.statefulHistoryLength) && void 0 !== s ? s : 0, null !== (n = t.routingMode) && void 0 !== n ? n : "configured-first", null !== (o = t.swapStrategy) && void 0 !== o ? o : "sequential-remove-first", null !== (r = t.resolutionMode) && void 0 !== r ? r : "dynamic", null !== (a = t.queryParamsStrategy) && void 0 !== a ? a : "overwrite", null !== (h = t.fragmentStrategy) && void 0 !== h ? h : "overwrite", null !== (c = t.historyStrategy) && void 0 !== c ? c : "push", null !== (u = t.sameUrlStrategy) && void 0 !== u ? u : "ignore");
    }
    getQueryParamsStrategy(t) {
        return Pt(t, this.queryParamsStrategy);
    }
    getFragmentStrategy(t) {
        return Pt(t, this.fragmentStrategy);
    }
    getHistoryStrategy(t) {
        return Pt(t, this.historyStrategy);
    }
    getSameUrlStrategy(t) {
        return Pt(t, this.sameUrlStrategy);
    }
    stringifyProperties() {
        return [ [ "routingMode", "mode" ], [ "swapStrategy", "swap" ], [ "resolutionMode", "resolution" ], [ "queryParamsStrategy", "queryParams" ], [ "fragmentStrategy", "fragment" ], [ "historyStrategy", "history" ], [ "sameUrlStrategy", "sameUrl" ] ].map((([t, e]) => {
            const i = this[t];
            return `${e}:${"function" === typeof i ? i : `'${i}'`}`;
        })).join(",");
    }
    clone() {
        return new RouterOptions(this.useUrlFragmentHash, this.useHref, this.statefulHistoryLength, this.routingMode, this.swapStrategy, this.resolutionMode, this.queryParamsStrategy, this.fragmentStrategy, this.historyStrategy, this.sameUrlStrategy);
    }
    toString() {
        return `RO(${this.stringifyProperties()})`;
    }
}

class NavigationOptions extends RouterOptions {
    constructor(t, e, i, s, n, o, r, a) {
        super(t.useUrlFragmentHash, t.useHref, t.statefulHistoryLength, t.routingMode, t.swapStrategy, t.resolutionMode, t.queryParamsStrategy, t.fragmentStrategy, t.historyStrategy, t.sameUrlStrategy);
        this.title = e;
        this.titleSeparator = i;
        this.append = s;
        this.context = n;
        this.queryParams = o;
        this.fragment = r;
        this.state = a;
    }
    static get DEFAULT() {
        return NavigationOptions.create({});
    }
    static create(t) {
        var e, i, s, n, o, r, a;
        return new NavigationOptions(RouterOptions.create(t), null !== (e = t.title) && void 0 !== e ? e : null, null !== (i = t.titleSeparator) && void 0 !== i ? i : " | ", null !== (s = t.append) && void 0 !== s ? s : false, null !== (n = t.context) && void 0 !== n ? n : null, null !== (o = t.queryParams) && void 0 !== o ? o : null, null !== (r = t.fragment) && void 0 !== r ? r : "", null !== (a = t.state) && void 0 !== a ? a : null);
    }
    clone() {
        return new NavigationOptions(super.clone(), this.title, this.titleSeparator, this.append, this.context, {
            ...this.queryParams
        }, this.fragment, null === this.state ? null : {
            ...this.state
        });
    }
    toString() {
        return `NO(${super.stringifyProperties()})`;
    }
}

class Navigation {
    constructor(t, e, i, s, n, o) {
        this.id = t;
        this.instructions = e;
        this.trigger = i;
        this.options = s;
        this.prevNavigation = n;
        this.finalInstructions = o;
    }
    static create(t) {
        return new Navigation(t.id, t.instructions, t.trigger, t.options, t.prevNavigation, t.finalInstructions);
    }
    toString() {
        return `N(id:${this.id},instructions:${this.instructions},trigger:'${this.trigger}')`;
    }
}

class Transition {
    constructor(t, e, i, s, n, o, r, a, h, c, u, l, d, f, p) {
        this.id = t;
        this.prevInstructions = e;
        this.instructions = i;
        this.finalInstructions = s;
        this.instructionsChanged = n;
        this.trigger = o;
        this.options = r;
        this.managedState = a;
        this.previousRouteTree = h;
        this.routeTree = c;
        this.promise = u;
        this.resolve = l;
        this.reject = d;
        this.guardsResult = f;
        this.error = p;
    }
    static create(t) {
        return new Transition(t.id, t.prevInstructions, t.instructions, t.finalInstructions, t.instructionsChanged, t.trigger, t.options, t.managedState, t.previousRouteTree, t.routeTree, t.promise, t.resolve, t.reject, t.guardsResult, void 0);
    }
    run(t, e) {
        if (true !== this.guardsResult) return;
        try {
            const i = t();
            if (i instanceof Promise) i.then(e).catch((t => {
                this.handleError(t);
            })); else e(i);
        } catch (t) {
            this.handleError(t);
        }
    }
    handleError(t) {
        this.reject(this.error = t);
    }
    toString() {
        return `T(id:${this.id},trigger:'${this.trigger}',instructions:${this.instructions},options:${this.options})`;
    }
}

const Lt = t.createInterface("IRouter", (t => t.singleton(Ut)));

let Ut = class Router {
    constructor(t, e, i, s, n) {
        this.container = t;
        this.p = e;
        this.logger = i;
        this.events = s;
        this.locationMgr = n;
        this.t = null;
        this.i = null;
        this.o = null;
        this.options = RouterOptions.DEFAULT;
        this.navigated = false;
        this.navigationId = 0;
        this.lastSuccessfulNavigation = null;
        this.activeNavigation = null;
        this.instructions = ViewportInstructionTree.create("");
        this.nextTr = null;
        this.locationChangeSubscription = null;
        this.vpaLookup = new Map;
        this.logger = i.root.scopeTo("Router");
    }
    get ctx() {
        let t = this.t;
        if (null === t) {
            if (!this.container.has(Wt, true)) throw new Error(`Root RouteContext is not set. Did you forget to register RouteConfiguration, or try to navigate before calling Aurelia.start()?`);
            t = this.t = this.container.get(Wt);
        }
        return t;
    }
    get routeTree() {
        let t = this.i;
        if (null === t) {
            const e = this.ctx;
            t = this.i = new RouteTree(NavigationOptions.create({
                ...this.options
            }), Object.freeze(new URLSearchParams), null, RouteNode.create({
                path: "",
                finalPath: "",
                context: e,
                instruction: null,
                component: e.definition.component,
                append: false
            }));
        }
        return t;
    }
    get currentTr() {
        let t = this.o;
        if (null === t) t = this.o = Transition.create({
            id: 0,
            prevInstructions: this.instructions,
            instructions: this.instructions,
            finalInstructions: this.instructions,
            instructionsChanged: true,
            trigger: "api",
            options: NavigationOptions.DEFAULT,
            managedState: null,
            previousRouteTree: this.routeTree.clone(),
            routeTree: this.routeTree,
            resolve: null,
            reject: null,
            promise: null,
            guardsResult: true,
            error: void 0
        });
        return t;
    }
    set currentTr(t) {
        this.o = t;
    }
    resolveContext(t) {
        return RouteContext.resolve(this.ctx, t);
    }
    start(t, e) {
        this.options = RouterOptions.create(t);
        this.locationMgr.startListening();
        this.locationChangeSubscription = this.events.subscribe("au:router:location-change", (t => {
            this.p.taskQueue.queueTask((() => {
                const e = Vt(t.state) ? t.state : null;
                const i = NavigationOptions.create({
                    ...this.options,
                    historyStrategy: "replace"
                });
                const s = ViewportInstructionTree.create(t.url, i);
                this.enqueue(s, t.trigger, e, null);
            }));
        }));
        if (!this.navigated && e) return this.load(this.locationMgr.getPath(), {
            historyStrategy: "replace"
        });
    }
    stop() {
        var t;
        this.locationMgr.stopListening();
        null === (t = this.locationChangeSubscription) || void 0 === t ? void 0 : t.dispose();
    }
    load(t, e) {
        const i = this.createViewportInstructions(t, e);
        this.logger.trace("load(instructions:%s)", i);
        return this.enqueue(i, "api", null, null);
    }
    isActive(t, e) {
        const i = this.resolveContext(e);
        const s = this.createViewportInstructions(t, {
            context: i
        });
        this.logger.trace("isActive(instructions:%s,ctx:%s)", s, i);
        return this.routeTree.contains(s);
    }
    getRouteContext(t, e, s) {
        const n = s.get(i).scopeTo("RouteContext");
        const o = RouteDefinition.resolve(e.Type);
        let r = this.vpaLookup.get(t);
        if (void 0 === r) this.vpaLookup.set(t, r = new WeakMap);
        let a = r.get(o);
        if (void 0 === a) {
            n.trace(`creating new RouteContext for %s`, o);
            const i = s.has(Wt, true) ? s.get(Wt) : null;
            r.set(o, a = new RouteContext(t, i, e, o, s));
        } else {
            n.trace(`returning existing RouteContext for %s`, o);
            if (null !== t) a.vpa = t;
        }
        return a;
    }
    createViewportInstructions(t, e) {
        if ("string" === typeof t) t = this.locationMgr.removeBaseHref(t);
        return ViewportInstructionTree.create(t, this.getNavigationOptions(e));
    }
    enqueue(t, e, i, s) {
        const n = this.currentTr;
        if ("api" !== e && "api" === n.trigger && n.instructions.equals(t)) {
            this.logger.debug(`Ignoring navigation triggered by '%s' because it is the same URL as the previous navigation which was triggered by 'api'.`, e);
            return true;
        }
        let o;
        let r;
        let a;
        if (null === s) a = new Promise((function(t, e) {
            o = t;
            r = e;
        })); else {
            this.logger.debug(`Reusing promise/resolve/reject from the previously failed transition %s`, s);
            a = s.promise;
            o = s.resolve;
            r = s.reject;
        }
        const h = this.nextTr = Transition.create({
            id: ++this.navigationId,
            trigger: e,
            managedState: i,
            prevInstructions: n.finalInstructions,
            finalInstructions: t,
            instructionsChanged: !n.finalInstructions.equals(t),
            instructions: t,
            options: t.options,
            promise: a,
            resolve: o,
            reject: r,
            previousRouteTree: this.routeTree,
            routeTree: this.i = this.routeTree.clone(),
            guardsResult: true,
            error: void 0
        });
        this.logger.debug(`Scheduling transition: %s`, h);
        if (null === this.activeNavigation) try {
            this.run(h);
        } catch (t) {
            h.handleError(t);
        }
        return h.promise.then((t => {
            this.logger.debug(`Transition succeeded: %s`, h);
            return t;
        })).catch((t => {
            this.logger.error(`Navigation failed: %s`, h, t);
            throw t;
        }));
    }
    run(t) {
        this.currentTr = t;
        this.nextTr = null;
        const e = null === this.lastSuccessfulNavigation ? null : Navigation.create({
            ...this.lastSuccessfulNavigation,
            prevNavigation: null
        });
        this.activeNavigation = Navigation.create({
            id: t.id,
            instructions: t.instructions,
            trigger: t.trigger,
            options: t.options,
            prevNavigation: e,
            finalInstructions: t.finalInstructions
        });
        const i = this.resolveContext(t.options.context);
        const s = !this.navigated || t.instructions.children.length !== i.node.children.length || t.instructions.children.some(((t, e) => {
            var s, n;
            return !(null !== (n = null === (s = i.node.children[e]) || void 0 === s ? void 0 : s.originalInstruction.equals(t)) && void 0 !== n ? n : false);
        }));
        const n = s || "reload" === t.options.getSameUrlStrategy(this.instructions);
        if (!n) {
            this.logger.trace(`run(tr:%s) - NOT processing route`, t);
            this.navigated = true;
            this.activeNavigation = null;
            t.resolve(false);
            this.runNextTransition(t);
            return;
        }
        this.logger.trace(`run(tr:%s) - processing route`, t);
        this.events.publish(new NavigationStartEvent(t.id, t.instructions, t.trigger, t.managedState));
        if (null !== this.nextTr) {
            this.logger.debug(`run(tr:%s) - aborting because a new transition was queued in response to the NavigationStartEvent`, t);
            return this.run(this.nextTr);
        }
        this.activeNavigation = Navigation.create({
            ...this.activeNavigation,
            finalInstructions: t.finalInstructions
        });
        t.run((() => {
            this.logger.trace(`run() - compiling route tree: %s`, t.finalInstructions);
            return yt(t.routeTree, t.finalInstructions, i);
        }), (() => {
            const e = t.previousRouteTree.root.children;
            const i = t.routeTree.root.children;
            const s = B(e, i);
            Batch.start((i => {
                this.logger.trace(`run() - invoking canUnload on ${e.length} nodes`);
                for (const s of e) s.context.vpa.canUnload(t, i);
            })).continueWith((e => {
                if (true !== t.guardsResult) {
                    e.push();
                    this.cancelNavigation(t);
                }
            })).continueWith((e => {
                this.logger.trace(`run() - invoking canLoad on ${i.length} nodes`);
                for (const s of i) s.context.vpa.canLoad(t, e);
            })).continueWith((e => {
                if (true !== t.guardsResult) {
                    e.push();
                    this.cancelNavigation(t);
                }
            })).continueWith((i => {
                this.logger.trace(`run() - invoking unload on ${e.length} nodes`);
                for (const s of e) s.context.vpa.unload(t, i);
            })).continueWith((e => {
                this.logger.trace(`run() - invoking load on ${i.length} nodes`);
                for (const s of i) s.context.vpa.load(t, e);
            })).continueWith((e => {
                this.logger.trace(`run() - invoking swap on ${s.length} nodes`);
                for (const i of s) i.context.vpa.swap(t, e);
            })).continueWith((() => {
                this.logger.trace(`run() - finalizing transition`);
                s.forEach((function(t) {
                    t.context.vpa.endTransition();
                }));
                this.navigated = true;
                this.instructions = t.finalInstructions = t.routeTree.finalizeInstructions();
                this.events.publish(new NavigationEndEvent(t.id, t.instructions, this.instructions));
                this.lastSuccessfulNavigation = this.activeNavigation;
                this.activeNavigation = null;
                this.applyHistoryState(t);
                t.resolve(true);
                this.runNextTransition(t);
            })).start();
        }));
    }
    applyHistoryState(t) {
        const e = t.finalInstructions.toUrl(this.options.useUrlFragmentHash);
        switch (t.options.getHistoryStrategy(this.instructions)) {
          case "none":
            break;

          case "push":
            this.locationMgr.pushState(At(t.options.state, t.id), this.updateTitle(t), e);
            break;

          case "replace":
            this.locationMgr.replaceState(At(t.options.state, t.id), this.updateTitle(t), e);
            break;
        }
    }
    getTitle(t) {
        var e, i;
        switch (typeof t.options.title) {
          case "function":
            return null !== (e = t.options.title.call(void 0, t.routeTree.root)) && void 0 !== e ? e : "";

          case "string":
            return t.options.title;

          default:
            return null !== (i = t.routeTree.root.getTitle(t.options.titleSeparator)) && void 0 !== i ? i : "";
        }
    }
    updateTitle(t) {
        const e = this.getTitle(t);
        if (e.length > 0) this.p.document.title = e;
        return this.p.document.title;
    }
    cancelNavigation(t) {
        this.logger.trace(`cancelNavigation(tr:%s)`, t);
        const e = t.previousRouteTree.root.children;
        const i = t.routeTree.root.children;
        const s = B(e, i);
        s.forEach((function(t) {
            t.context.vpa.cancelUpdate();
        }));
        this.activeNavigation = null;
        this.instructions = t.prevInstructions;
        this.i = t.previousRouteTree;
        this.events.publish(new NavigationCancelEvent(t.id, t.instructions, `guardsResult is ${t.guardsResult}`));
        if (false === t.guardsResult) {
            t.resolve(false);
            this.runNextTransition(t);
        } else void n(this.enqueue(t.guardsResult, "api", t.managedState, t), (() => {
            this.logger.trace(`cancelNavigation(tr:%s) - finished redirect`, t);
        }));
    }
    runNextTransition(t) {
        if (null !== this.nextTr) {
            this.logger.trace(`runNextTransition(tr:%s) -> scheduling nextTransition: %s`, t, this.nextTr);
            this.p.taskQueue.queueTask((() => {
                const t = this.nextTr;
                if (null !== t) try {
                    this.run(t);
                } catch (e) {
                    t.handleError(e);
                }
            }));
        }
    }
    getNavigationOptions(t) {
        return NavigationOptions.create({
            ...this.options,
            ...t
        });
    }
};

Ut = K([ X(0, a), X(1, E), X(2, i), X(3, tt), X(4, nt) ], Ut);

const Ot = t.createInterface("IViewportInstruction");

class ViewportInstruction {
    constructor(t, e, i, s, n, o, r, a) {
        this.context = t;
        this.append = e;
        this.open = i;
        this.close = s;
        this.component = n;
        this.viewport = o;
        this.params = r;
        this.children = a;
    }
    static create(t, e) {
        var i, s, n, o, r, a, h, c, u;
        if (t instanceof ViewportInstruction) return t;
        if (G(t)) {
            const l = TypedNavigationInstruction.create(t.component);
            const d = null !== (s = null === (i = t.children) || void 0 === i ? void 0 : i.map(ViewportInstruction.create)) && void 0 !== s ? s : [];
            return new ViewportInstruction(null !== (o = null !== (n = t.context) && void 0 !== n ? n : e) && void 0 !== o ? o : null, null !== (r = t.append) && void 0 !== r ? r : false, null !== (a = t.open) && void 0 !== a ? a : 0, null !== (h = t.close) && void 0 !== h ? h : 0, l, null !== (c = t.viewport) && void 0 !== c ? c : null, null !== (u = t.params) && void 0 !== u ? u : null, d);
        }
        const l = TypedNavigationInstruction.create(t);
        return new ViewportInstruction(null !== e && void 0 !== e ? e : null, false, 0, 0, l, null, null, []);
    }
    contains(t) {
        const e = this.children;
        const i = t.children;
        if (e.length < i.length) return false;
        if (!this.component.equals(t.component)) return false;
        for (let t = 0, s = i.length; t < s; ++t) if (!e[t].contains(i[t])) return false;
        return true;
    }
    equals(t) {
        const e = this.children;
        const i = t.children;
        if (e.length !== i.length) return false;
        if (!this.component.equals(t.component) || this.viewport !== t.viewport || !Q(this.params, t.params)) return false;
        for (let t = 0, s = e.length; t < s; ++t) if (!e[t].equals(i[t])) return false;
        return true;
    }
    clone() {
        return new ViewportInstruction(this.context, this.append, this.open, this.close, this.component.clone(), this.viewport, null === this.params ? null : {
            ...this.params
        }, [ ...this.children ]);
    }
    toUrlComponent(t = true) {
        const e = this.component.toUrlComponent();
        const i = null === this.params || 0 === Object.keys(this.params).length ? "" : `(${jt(this.params)})`;
        const s = 0 === e.length || null === this.viewport || 0 === this.viewport.length ? "" : `@${this.viewport}`;
        const n = `${"(".repeat(this.open)}${e}${i}${s}${")".repeat(this.close)}`;
        const o = t ? this.children.map((t => t.toUrlComponent())).join("+") : "";
        if (n.length > 0) {
            if (o.length > 0) return [ n, o ].join("/");
            return n;
        }
        return o;
    }
    toString() {
        const t = `c:${this.component}`;
        const e = null === this.viewport || 0 === this.viewport.length ? "" : `viewport:${this.viewport}`;
        const i = 0 === this.children.length ? "" : `children:[${this.children.map(String).join(",")}]`;
        const s = [ t, e, i ].filter(Boolean).join(",");
        return `VPI(${s})`;
    }
}

function jt(t) {
    const e = Object.keys(t);
    const i = Array(e.length);
    const s = [];
    const n = [];
    for (const t of e) if (h(t)) s.push(Number(t)); else n.push(t);
    for (let o = 0; o < e.length; ++o) {
        const e = s.indexOf(o);
        if (e > -1) {
            i[o] = t[o];
            s.splice(e, 1);
        } else {
            const e = n.shift();
            i[o] = `${e}=${t[e]}`;
        }
    }
    return i.join(",");
}

const Bt = function() {
    let t = 0;
    const e = new Map;
    return function(i) {
        let s = e.get(i);
        if (void 0 === s) e.set(i, s = ++t);
        return s;
    };
}();

class ViewportInstructionTree {
    constructor(t, e, i, s, n) {
        this.options = t;
        this.isAbsolute = e;
        this.children = i;
        this.queryParams = s;
        this.fragment = n;
    }
    static create(t, e) {
        const i = NavigationOptions.create({
            ...e
        });
        if (t instanceof ViewportInstructionTree) return new ViewportInstructionTree(i, t.isAbsolute, t.children.map((t => ViewportInstruction.create(t, i.context))), t.queryParams, t.fragment);
        if (t instanceof Array) return new ViewportInstructionTree(i, false, t.map((t => ViewportInstruction.create(t, i.context))), Object.freeze(new URLSearchParams), null);
        if ("string" === typeof t) {
            const e = RouteExpression.parse(t, i.useUrlFragmentHash);
            return e.toInstructionTree(i);
        }
        return new ViewportInstructionTree(i, false, [ ViewportInstruction.create(t, i.context) ], Object.freeze(new URLSearchParams), null);
    }
    equals(t) {
        const e = this.children;
        const i = t.children;
        if (e.length !== i.length) return false;
        for (let t = 0, s = e.length; t < s; ++t) if (!e[t].equals(i[t])) return false;
        return true;
    }
    toUrl(t = false) {
        var e;
        let i;
        let s;
        if (t) {
            i = "";
            s = `#${this.toPath()}`;
        } else {
            i = this.toPath();
            s = null !== (e = this.fragment) && void 0 !== e ? e : "";
        }
        let n = this.queryParams.toString();
        n = "" === n ? "" : `?${n}`;
        const o = `${i}${s}${n}`;
        return o;
    }
    toPath() {
        const t = this.children.map((t => t.toUrlComponent())).join("+");
        return t;
    }
    toString() {
        return `[${this.children.map(String).join(",")}]`;
    }
}

var Dt;

(function(t) {
    t[t["string"] = 0] = "string";
    t[t["ViewportInstruction"] = 1] = "ViewportInstruction";
    t[t["CustomElementDefinition"] = 2] = "CustomElementDefinition";
    t[t["Promise"] = 3] = "Promise";
    t[t["IRouteViewModel"] = 4] = "IRouteViewModel";
})(Dt || (Dt = {}));

class TypedNavigationInstruction {
    constructor(t, e) {
        this.type = t;
        this.value = e;
    }
    static create(t) {
        if (t instanceof TypedNavigationInstruction) return t;
        if ("string" === typeof t) return new TypedNavigationInstruction(0, t); else if (!r(t)) Y("function/class or object", "", t); else if ("function" === typeof t) {
            const e = y.getDefinition(t);
            return new TypedNavigationInstruction(2, e);
        } else if (t instanceof Promise) return new TypedNavigationInstruction(3, t); else if (G(t)) {
            const e = ViewportInstruction.create(t);
            return new TypedNavigationInstruction(1, e);
        } else if (v(t)) return new TypedNavigationInstruction(4, t); else if (t instanceof S) return new TypedNavigationInstruction(2, t); else if (F(t)) {
            const e = y.define(t);
            const i = y.getDefinition(e);
            return new TypedNavigationInstruction(2, i);
        } else throw new Error(`Invalid component ${D(t)}: must be either a class, a custom element ViewModel, or a (partial) custom element definition`);
    }
    equals(t) {
        switch (this.type) {
          case 2:
          case 4:
          case 3:
          case 0:
            return this.type === t.type && this.value === t.value;

          case 1:
            return this.type === t.type && this.value.equals(t.value);
        }
    }
    clone() {
        return new TypedNavigationInstruction(this.type, this.value);
    }
    toUrlComponent() {
        switch (this.type) {
          case 2:
            return this.value.name;

          case 4:
          case 3:
            return `au$obj${Bt(this.value)}`;

          case 1:
            return this.value.toUrlComponent();

          case 0:
            return this.value;
        }
    }
    toString() {
        switch (this.type) {
          case 2:
            return `CEDef(name:'${this.value.name}')`;

          case 3:
            return `Promise`;

          case 4:
            return `VM(name:'${y.getDefinition(this.value.constructor).name}')`;

          case 1:
            return this.value.toString();

          case 0:
            return `'${this.value}'`;
        }
    }
}

const Mt = l;

function qt(t, e) {
    if (!Q(t.params, e.params)) return "invoke-lifecycles";
    return "none";
}

class RouteConfig {
    constructor(t, e, i, s, n, o, r, a, h) {
        this.id = t;
        this.path = e;
        this.title = i;
        this.redirectTo = s;
        this.caseSensitive = n;
        this.transitionPlan = o;
        this.viewport = r;
        this.data = a;
        this.routes = h;
    }
    static create(t, e) {
        var i, s, n, o, r, a, h, c, u, l, d, f, p, g, v, w, m, $, x, y, E, S, b, R;
        if ("string" === typeof t || t instanceof Array) {
            const u = t;
            const l = null !== (i = null === e || void 0 === e ? void 0 : e.redirectTo) && void 0 !== i ? i : null;
            const d = null !== (s = null === e || void 0 === e ? void 0 : e.caseSensitive) && void 0 !== s ? s : false;
            const f = null !== (n = null === e || void 0 === e ? void 0 : e.id) && void 0 !== n ? n : u instanceof Array ? u[0] : u;
            const p = null !== (o = null === e || void 0 === e ? void 0 : e.title) && void 0 !== o ? o : null;
            const g = null !== (r = null === e || void 0 === e ? void 0 : e.transitionPlan) && void 0 !== r ? r : qt;
            const v = null !== (a = null === e || void 0 === e ? void 0 : e.viewport) && void 0 !== a ? a : null;
            const w = null !== (h = null === e || void 0 === e ? void 0 : e.data) && void 0 !== h ? h : {};
            const m = null !== (c = null === e || void 0 === e ? void 0 : e.routes) && void 0 !== c ? c : Mt;
            return new RouteConfig(f, u, p, l, d, g, v, w, m);
        } else if ("object" === typeof t) {
            const i = t;
            _(i, "");
            const s = null !== (l = null !== (u = i.path) && void 0 !== u ? u : null === e || void 0 === e ? void 0 : e.path) && void 0 !== l ? l : null;
            const n = null !== (f = null !== (d = i.title) && void 0 !== d ? d : null === e || void 0 === e ? void 0 : e.title) && void 0 !== f ? f : null;
            const o = null !== (g = null !== (p = i.redirectTo) && void 0 !== p ? p : null === e || void 0 === e ? void 0 : e.redirectTo) && void 0 !== g ? g : null;
            const r = null !== (w = null !== (v = i.caseSensitive) && void 0 !== v ? v : null === e || void 0 === e ? void 0 : e.caseSensitive) && void 0 !== w ? w : false;
            const a = null !== ($ = null !== (m = i.id) && void 0 !== m ? m : null === e || void 0 === e ? void 0 : e.id) && void 0 !== $ ? $ : s instanceof Array ? s[0] : s;
            const h = null !== (y = null !== (x = i.transitionPlan) && void 0 !== x ? x : null === e || void 0 === e ? void 0 : e.transitionPlan) && void 0 !== y ? y : qt;
            const c = null !== (S = null !== (E = i.viewport) && void 0 !== E ? E : null === e || void 0 === e ? void 0 : e.viewport) && void 0 !== S ? S : null;
            const C = {
                ...null === e || void 0 === e ? void 0 : e.data,
                ...i.data
            };
            const k = [ ...null !== (b = i.routes) && void 0 !== b ? b : Mt, ...null !== (R = null === e || void 0 === e ? void 0 : e.routes) && void 0 !== R ? R : Mt ];
            return new RouteConfig(a, s, n, o, r, h, c, C, k);
        } else Y("string, function/class or object", "", t);
    }
    static configure(t, e) {
        const i = RouteConfig.create(t, e);
        c.define(Ht.name, i, e);
        return e;
    }
    static getConfig(t) {
        if (!c.hasOwn(Ht.name, t)) Ht.configure({}, t);
        return c.getOwn(Ht.name, t);
    }
    saveTo(t) {
        c.define(Ht.name, this, t);
    }
}

class ChildRouteConfig extends RouteConfig {
    constructor(t, e, i, s, n, o, r, a, h, c) {
        super(t, e, i, s, n, o, r, a, h);
        this.component = c;
    }
}

const Ht = {
    name: u.resource.keyFor("route"),
    isConfigured(t) {
        return c.hasOwn(Ht.name, t);
    },
    configure(t, e) {
        const i = RouteConfig.create(t, e);
        c.define(Ht.name, i, e);
        return e;
    },
    getConfig(t) {
        if (!Ht.isConfigured(t)) Ht.configure({}, t);
        return c.getOwn(Ht.name, t);
    }
};

function Ft(t) {
    return function(e) {
        return Ht.configure(t, e);
    };
}

class RouteDefinition {
    constructor(t, e) {
        var i, s, n, o, r;
        this.config = t;
        this.component = e;
        this.hasExplicitPath = null !== t.path;
        this.caseSensitive = t.caseSensitive;
        this.path = M(null !== (i = t.path) && void 0 !== i ? i : e.name);
        this.redirectTo = null !== (s = t.redirectTo) && void 0 !== s ? s : null;
        this.viewport = null !== (n = t.viewport) && void 0 !== n ? n : "default";
        this.id = q(null !== (o = t.id) && void 0 !== o ? o : this.path);
        this.data = null !== (r = t.data) && void 0 !== r ? r : {};
    }
    static resolve(t, e) {
        if (W(t)) return new RouteDefinition(t, null);
        return n(this.resolveCustomElementDefinition(t, e), (e => {
            const i = z(t) ? {
                ...Ht.getConfig(e.Type),
                ...t
            } : Ht.getConfig(e.Type);
            if (!c.hasOwn(Ht.name, e)) {
                const t = new RouteDefinition(i, e);
                c.define(Ht.name, t, e);
            } else {
                let t = c.getOwn(Ht.name, e);
                if (t.config !== i) {
                    t = new RouteDefinition(i, e);
                    c.define(Ht.name, t, e);
                }
            }
            return c.getOwn(Ht.name, e);
        }));
    }
    static resolveCustomElementDefinition(t, e) {
        if (z(t)) return this.resolveCustomElementDefinition(t.component, e);
        const i = TypedNavigationInstruction.create(t);
        switch (i.type) {
          case 0:
            {
                if (void 0 === e) throw new Error(`When retrieving the RouteDefinition for a component name, a RouteContext (that can resolve it) must be provided`);
                const t = e.container.find(y, i.value);
                if (null === t) throw new Error(`Could not find a CustomElement named '${i.value}' in the current container scope of ${e}. This means the component is neither registered at Aurelia startup nor via the 'dependencies' decorator or static property.`);
                return t;
            }

          case 2:
            return i.value;

          case 4:
            return y.getDefinition(i.value.constructor);

          case 3:
            if (void 0 === e) throw new Error(`RouteContext must be provided when resolving an imported module`);
            return e.resolveLazy(i.value);
        }
    }
    register(t) {
        var e;
        null === (e = this.component) || void 0 === e ? void 0 : e.register(t);
    }
    toUrlComponent() {
        return "not-implemented";
    }
    toString() {
        const t = null === this.config.path ? "null" : `'${this.config.path}'`;
        if (null !== this.component) return `RD(config.path:${t},c.name:'${this.component.name}')`; else return `RD(config.path:${t},redirectTo:'${this.redirectTo}')`;
    }
}

const zt = new WeakMap;

class ComponentAgent {
    constructor(t, e, s, n, o) {
        var r, a, h, c;
        this.instance = t;
        this.controller = e;
        this.definition = s;
        this.routeNode = n;
        this.ctx = o;
        this.h = o.container.get(i).scopeTo(`ComponentAgent<${o.friendlyPath}>`);
        this.h.trace(`constructor()`);
        const u = e.lifecycleHooks;
        this.canLoadHooks = (null !== (r = u.canLoad) && void 0 !== r ? r : []).map((t => t.instance));
        this.loadHooks = (null !== (a = u.load) && void 0 !== a ? a : []).map((t => t.instance));
        this.canUnloadHooks = (null !== (h = u.canUnload) && void 0 !== h ? h : []).map((t => t.instance));
        this.unloadHooks = (null !== (c = u.unload) && void 0 !== c ? c : []).map((t => t.instance));
        this.u = "canLoad" in t;
        this.l = "load" in t;
        this.g = "canUnload" in t;
        this.v = "unload" in t;
    }
    static for(t, e, i, s) {
        let n = zt.get(t);
        if (void 0 === n) {
            const o = s.container;
            const r = RouteDefinition.resolve(t.constructor);
            const a = x.$el(o, t, e.host, null);
            zt.set(t, n = new ComponentAgent(t, a, r, i, s));
        }
        return n;
    }
    activate(t, e, i) {
        if (null === t) {
            this.h.trace(`activate() - initial`);
            return this.controller.activate(this.controller, e, i);
        }
        this.h.trace(`activate()`);
        void this.controller.activate(t, e, i);
    }
    deactivate(t, e, i) {
        if (null === t) {
            this.h.trace(`deactivate() - initial`);
            return this.controller.deactivate(this.controller, e, i);
        }
        this.h.trace(`deactivate()`);
        void this.controller.deactivate(t, e, i);
    }
    dispose() {
        this.h.trace(`dispose()`);
        this.controller.dispose();
    }
    canUnload(t, e, i) {
        this.h.trace(`canUnload(next:%s) - invoking ${this.canUnloadHooks.length} hooks`, e);
        i.push();
        for (const s of this.canUnloadHooks) t.run((() => {
            i.push();
            return s.canUnload(this.instance, e, this.routeNode);
        }), (e => {
            if (true === t.guardsResult && true !== e) t.guardsResult = false;
            i.pop();
        }));
        if (this.g) t.run((() => {
            i.push();
            return this.instance.canUnload(e, this.routeNode);
        }), (e => {
            if (true === t.guardsResult && true !== e) t.guardsResult = false;
            i.pop();
        }));
        i.pop();
    }
    canLoad(t, e, i) {
        this.h.trace(`canLoad(next:%s) - invoking ${this.canLoadHooks.length} hooks`, e);
        i.push();
        for (const s of this.canLoadHooks) t.run((() => {
            i.push();
            return s.canLoad(this.instance, e.params, e, this.routeNode);
        }), (e => {
            if (true === t.guardsResult && true !== e) t.guardsResult = false === e ? false : ViewportInstructionTree.create(e);
            i.pop();
        }));
        if (this.u) t.run((() => {
            i.push();
            return this.instance.canLoad(e.params, e, this.routeNode);
        }), (e => {
            if (true === t.guardsResult && true !== e) t.guardsResult = false === e ? false : ViewportInstructionTree.create(e);
            i.pop();
        }));
        i.pop();
    }
    unload(t, e, i) {
        this.h.trace(`unload(next:%s) - invoking ${this.unloadHooks.length} hooks`, e);
        i.push();
        for (const s of this.unloadHooks) t.run((() => {
            i.push();
            return s.unload(this.instance, e, this.routeNode);
        }), (() => {
            i.pop();
        }));
        if (this.v) t.run((() => {
            i.push();
            return this.instance.unload(e, this.routeNode);
        }), (() => {
            i.pop();
        }));
        i.pop();
    }
    load(t, e, i) {
        this.h.trace(`load(next:%s) - invoking ${this.loadHooks.length} hooks`, e);
        i.push();
        for (const s of this.loadHooks) t.run((() => {
            i.push();
            return s.load(this.instance, e.params, e, this.routeNode);
        }), (() => {
            i.pop();
        }));
        if (this.l) t.run((() => {
            i.push();
            return this.instance.load(e.params, e, this.routeNode);
        }), (() => {
            i.pop();
        }));
        i.pop();
    }
    toString() {
        return `CA(ctx:'${this.ctx.friendlyPath}',c:'${this.definition.component.name}')`;
    }
}

const Wt = t.createInterface("IRouteContext");

const Gt = "au$residue";

class RouteContext {
    constructor(t, e, s, n, o) {
        var r;
        this.parent = e;
        this.component = s;
        this.definition = n;
        this.parentContainer = o;
        this.childViewportAgents = [];
        this.childRoutes = [];
        this.m = null;
        this.$ = null;
        this.prevNode = null;
        this.S = null;
        this.R = null;
        this.R = t;
        if (null === e) {
            this.root = this;
            this.path = [ this ];
            this.friendlyPath = s.name;
        } else {
            this.root = e.root;
            this.path = [ ...e.path, this ];
            this.friendlyPath = `${e.friendlyPath}/${s.name}`;
        }
        this.logger = o.get(i).scopeTo(`RouteContext<${this.friendlyPath}>`);
        this.logger.trace("constructor()");
        this.moduleLoader = o.get(d);
        const a = this.container = o.createChild();
        a.registerResolver(b, this.hostControllerProvider = new f, true);
        a.registerResolver(Wt, new f("IRouteContext", this));
        a.register(n);
        a.register(...s.dependencies);
        this.recognizer = new j;
        const h = [];
        const c = [];
        for (const t of n.config.routes) if (t instanceof Promise) {
            const e = this.addRoute(t);
            h.push(e);
            c.push(e);
        } else {
            const e = RouteDefinition.resolve(t, this);
            if (e instanceof Promise) if (z(t) && null != t.path) {
                for (const i of M(t.path)) this.$addRoute(i, null !== (r = t.caseSensitive) && void 0 !== r ? r : false, e);
                const i = this.childRoutes.length;
                const s = e.then((t => this.childRoutes[i] = t));
                this.childRoutes.push(s);
                c.push(s.then(p));
            } else throw new Error(`Invalid route config. When the component property is a lazy import, the path must be specified. To use lazy loading without specifying the path (e.g. in direct routing), pass the import promise as a direct value to the routes array instead of providing it as the component property on an object literal.`); else {
                for (const t of e.path) this.$addRoute(t, e.caseSensitive, e);
                this.childRoutes.push(e);
            }
        }
        if (h.length > 0) this.m = Promise.all(h).then((() => {
            this.m = null;
        }));
        if (c.length > 0) this.$ = Promise.all(c).then((() => {
            this.$ = null;
        }));
    }
    get id() {
        return this.container.id;
    }
    get isRoot() {
        return null === this.parent;
    }
    get depth() {
        return this.path.length - 1;
    }
    get resolved() {
        return this.m;
    }
    get allResolved() {
        return this.$;
    }
    get node() {
        const t = this.S;
        if (null === t) throw new Error(`Invariant violation: RouteNode should be set immediately after the RouteContext is created. Context: ${this}`);
        return t;
    }
    set node(t) {
        const e = this.prevNode = this.S;
        if (e !== t) {
            this.S = t;
            this.logger.trace(`Node changed from %s to %s`, this.prevNode, t);
        }
    }
    get vpa() {
        const t = this.R;
        if (null === t) throw new Error(`RouteContext has no ViewportAgent: ${this}`);
        return t;
    }
    set vpa(t) {
        if (null === t || void 0 === t) throw new Error(`Cannot set ViewportAgent to ${t} for RouteContext: ${this}`);
        const e = this.R;
        if (e !== t) {
            this.R = t;
            this.logger.trace(`ViewportAgent changed from %s to %s`, e, t);
        }
    }
    static setRoot(t) {
        const e = t.get(i).scopeTo("RouteContext");
        if (!t.has(R, true)) _t(new Error(`The provided container has no registered IAppRoot. RouteContext.setRoot can only be used after Aurelia.app was called, on a container that is within that app's component tree.`), e);
        if (t.has(Wt, true)) _t(new Error(`A root RouteContext is already registered. A possible cause is the RouterConfiguration being registered more than once in the same container tree. If you have a multi-rooted app, make sure you register RouterConfiguration only in the "forked" containers and not in the common root.`), e);
        const {controller: s} = t.get(R);
        if (void 0 === s) _t(new Error(`The provided IAppRoot does not (yet) have a controller. A possible cause is calling this API manually before Aurelia.start() is called`), e);
        const n = t.get(Lt);
        const o = n.getRouteContext(null, s.definition, s.container);
        t.register(g.instance(Wt, o));
        o.node = n.routeTree.root;
    }
    static resolve(t, e) {
        const s = t.container;
        const n = s.get(i).scopeTo("RouteContext");
        if (null === e || void 0 === e) {
            n.trace(`resolve(context:%s) - returning root RouteContext`, e);
            return t;
        }
        if (Yt(e)) {
            n.trace(`resolve(context:%s) - returning provided RouteContext`, e);
            return e;
        }
        if (e instanceof s.get(E).Node) try {
            const t = y.for(e, {
                searchParents: true
            });
            n.trace(`resolve(context:Node(nodeName:'${e.nodeName}'),controller:'${t.definition.name}') - resolving RouteContext from controller's RenderContext`);
            return t.container.get(Wt);
        } catch (t) {
            n.error(`Failed to resolve RouteContext from Node(nodeName:'${e.nodeName}')`, t);
            throw t;
        }
        if (v(e)) {
            const t = e.$controller;
            n.trace(`resolve(context:CustomElementViewModel(name:'${t.definition.name}')) - resolving RouteContext from controller's RenderContext`);
            return t.container.get(Wt);
        }
        if (C(e)) {
            const t = e;
            n.trace(`resolve(context:CustomElementController(name:'${t.definition.name}')) - resolving RouteContext from controller's RenderContext`);
            return t.container.get(Wt);
        }
        _t(new Error(`Invalid context type: ${Object.prototype.toString.call(e)}`), n);
    }
    dispose() {
        this.container.dispose();
    }
    resolveViewportAgent(t) {
        this.logger.trace(`resolveViewportAgent(req:%s)`, t);
        const e = this.childViewportAgents.find((e => e.handles(t)));
        if (void 0 === e) throw new Error(`Failed to resolve ${t} at:\n${this.printTree()}`);
        return e;
    }
    getAvailableViewportAgents(t) {
        return this.childViewportAgents.filter((e => e.isAvailable(t)));
    }
    getFallbackViewportAgent(t, e) {
        var i;
        return null !== (i = this.childViewportAgents.find((i => i.isAvailable(t) && i.viewport.name === e && i.viewport.fallback.length > 0))) && void 0 !== i ? i : null;
    }
    createComponentAgent(t, e) {
        this.logger.trace(`createComponentAgent(routeNode:%s)`, e);
        this.hostControllerProvider.prepare(t);
        const i = RouteDefinition.resolve(e.component);
        const s = this.container.get(i.component.key);
        const n = ComponentAgent.for(s, t, e, this);
        this.hostControllerProvider.dispose();
        return n;
    }
    registerViewport(t) {
        const e = ViewportAgent.for(t, this);
        if (this.childViewportAgents.includes(e)) this.logger.trace(`registerViewport(agent:%s) -> already registered, so skipping`, e); else {
            this.logger.trace(`registerViewport(agent:%s) -> adding`, e);
            this.childViewportAgents.push(e);
        }
        return e;
    }
    unregisterViewport(t) {
        const e = ViewportAgent.for(t, this);
        if (this.childViewportAgents.includes(e)) {
            this.logger.trace(`unregisterViewport(agent:%s) -> unregistering`, e);
            this.childViewportAgents.splice(this.childViewportAgents.indexOf(e), 1);
        } else this.logger.trace(`unregisterViewport(agent:%s) -> not registered, so skipping`, e);
    }
    recognize(t) {
        var e;
        this.logger.trace(`recognize(path:'${t}')`);
        const i = this.recognizer.recognize(t);
        if (null === i) return null;
        let s;
        if (Reflect.has(i.params, Gt)) {
            s = null !== (e = i.params[Gt]) && void 0 !== e ? e : null;
            Reflect.deleteProperty(i.params, Gt);
        } else s = null;
        return new $RecognizedRoute(i, s);
    }
    addRoute(t) {
        this.logger.trace(`addRoute(routeable:'${t}')`);
        return n(RouteDefinition.resolve(t, this), (t => {
            for (const e of t.path) this.$addRoute(e, t.caseSensitive, t);
            this.childRoutes.push(t);
        }));
    }
    $addRoute(t, e, i) {
        this.recognizer.add({
            path: t,
            caseSensitive: e,
            handler: i
        });
        this.recognizer.add({
            path: `${t}/*${Gt}`,
            caseSensitive: e,
            handler: i
        });
    }
    resolveLazy(t) {
        return this.moduleLoader.load(t, (e => {
            let i;
            let s;
            for (const t of e.items) if (t.isConstructable) {
                const e = t.definitions.find(Jt);
                if (void 0 !== e) if ("default" === t.key) i = e; else if (void 0 === s) s = e;
            }
            if (void 0 === i) {
                if (void 0 === s) throw new Error(`${t} does not appear to be a component or CustomElement recognizable by Aurelia`);
                return s;
            }
            return i;
        }));
    }
    toString() {
        const t = this.childViewportAgents;
        const e = t.map(String).join(",");
        return `RC(path:'${this.friendlyPath}',viewports:[${e}])`;
    }
    printTree() {
        const t = [];
        for (let e = 0; e < this.path.length; ++e) t.push(`${" ".repeat(e)}${this.path[e]}`);
        return t.join("\n");
    }
}

function Yt(t) {
    return t instanceof RouteContext;
}

function _t(t, e) {
    e.error(t);
    throw t;
}

function Jt(t) {
    return y.isType(t.Type);
}

class $RecognizedRoute {
    constructor(t, e) {
        this.route = t;
        this.residue = e;
    }
}

let Zt = class ViewportCustomElement {
    constructor(t, e) {
        this.logger = t;
        this.ctx = e;
        this.name = "default";
        this.usedBy = "";
        this.default = "";
        this.fallback = "";
        this.noScope = false;
        this.noLink = false;
        this.noHistory = false;
        this.stateful = false;
        this.agent = void 0;
        this.controller = void 0;
        this.logger = t.scopeTo(`au-viewport<${e.friendlyPath}>`);
        this.logger.trace("constructor()");
    }
    hydrated(t) {
        this.logger.trace("hydrated()");
        this.controller = t;
        this.agent = this.ctx.registerViewport(this);
    }
    attaching(t, e, i) {
        this.logger.trace("attaching()");
        return this.agent.activateFromViewport(t, this.controller, i);
    }
    detaching(t, e, i) {
        this.logger.trace("detaching()");
        return this.agent.deactivateFromViewport(t, this.controller, i);
    }
    dispose() {
        this.logger.trace("dispose()");
        this.ctx.unregisterViewport(this);
        this.agent.dispose();
        this.agent = void 0;
    }
    toString() {
        const t = [];
        for (const e of Qt) {
            const i = this[e];
            switch (typeof i) {
              case "string":
                if ("" !== i) t.push(`${e}:'${i}'`);
                break;

              case "boolean":
                if (i) t.push(`${e}:${i}`);
                break;

              default:
                t.push(`${e}:${String(i)}`);
            }
        }
        return `VP(ctx:'${this.ctx.friendlyPath}',${t.join(",")})`;
    }
};

K([ k ], Zt.prototype, "name", void 0);

K([ k ], Zt.prototype, "usedBy", void 0);

K([ k ], Zt.prototype, "default", void 0);

K([ k ], Zt.prototype, "fallback", void 0);

K([ k ], Zt.prototype, "noScope", void 0);

K([ k ], Zt.prototype, "noLink", void 0);

K([ k ], Zt.prototype, "noHistory", void 0);

K([ k ], Zt.prototype, "stateful", void 0);

Zt = K([ I({
    name: "au-viewport"
}), X(0, i), X(1, Wt) ], Zt);

const Qt = [ "name", "usedBy", "default", "fallback", "noScope", "noLink", "noHistory", "stateful" ];

let Kt = class LoadCustomAttribute {
    constructor(t, e, i, s, n, o, r) {
        this.target = t;
        this.el = e;
        this.router = i;
        this.events = s;
        this.delegator = n;
        this.ctx = o;
        this.locationMgr = r;
        this.attribute = "href";
        this.active = false;
        this.href = null;
        this.instructions = null;
        this.eventListener = null;
        this.navigationEndListener = null;
        this.onClick = t => {
            if (null === this.instructions) return;
            if (t.altKey || t.ctrlKey || t.shiftKey || t.metaKey || 0 !== t.button) return;
            t.preventDefault();
            void this.router.load(this.instructions, {
                context: this.ctx
            });
        };
        this.isEnabled = !e.hasAttribute("external") && !e.hasAttribute("data-external");
    }
    binding() {
        if (this.isEnabled) this.eventListener = this.delegator.addEventListener(this.target, this.el, "click", this.onClick);
        this.valueChanged();
        this.navigationEndListener = this.events.subscribe("au:router:navigation-end", (t => {
            this.valueChanged();
            this.active = null !== this.instructions && this.router.isActive(this.instructions, this.ctx);
        }));
    }
    attaching() {
        if (null !== this.ctx.allResolved) return this.ctx.allResolved.then((() => {
            this.valueChanged();
        }));
    }
    unbinding() {
        if (this.isEnabled) this.eventListener.dispose();
        this.navigationEndListener.dispose();
    }
    valueChanged() {
        const t = this.router.options.useUrlFragmentHash;
        if (null !== this.route && void 0 !== this.route && null === this.ctx.allResolved) {
            const e = this.ctx.childRoutes.find((t => t.id === this.route));
            if (void 0 !== e) {
                const i = this.ctx.node.computeAbsolutePath();
                let s = e.path[0];
                if ("object" === typeof this.params && null !== this.params) {
                    const t = Object.keys(this.params);
                    for (const e of t) {
                        const t = this.params[e];
                        if (null != t && String(t).length > 0) s = s.replace(new RegExp(`[*:]${e}[?]?`), t);
                    }
                }
                s = s.replace(/\/[*:][^/]+[?]/g, "").replace(/[*:][^/]+[?]\//g, "");
                if (i) if (s) this.href = `${t ? "#" : ""}${[ i, s ].join("/")}`; else this.href = `${t ? "#" : ""}${i}`; else this.href = `${t ? "#" : ""}${s}`;
                this.instructions = this.router.createViewportInstructions(`${t ? "#" : ""}${s}`, {
                    context: this.ctx
                });
            } else {
                if ("object" === typeof this.params && null !== this.params) this.instructions = this.router.createViewportInstructions({
                    component: this.route,
                    params: this.params
                }, {
                    context: this.ctx
                }); else this.instructions = this.router.createViewportInstructions(this.route, {
                    context: this.ctx
                });
                this.href = this.instructions.toUrl(this.router.options.useUrlFragmentHash);
            }
        } else {
            this.instructions = null;
            this.href = null;
        }
        const e = y.for(this.el, {
            optional: true
        });
        if (null !== e) e.viewModel[this.attribute] = this.instructions; else if (null === this.href) this.el.removeAttribute(this.attribute); else {
            const e = t ? this.href : this.locationMgr.addBaseHref(this.href);
            this.el.setAttribute(this.attribute, e);
        }
    }
};

K([ k({
    mode: N.toView,
    primary: true,
    callback: "valueChanged"
}) ], Kt.prototype, "route", void 0);

K([ k({
    mode: N.toView,
    callback: "valueChanged"
}) ], Kt.prototype, "params", void 0);

K([ k({
    mode: N.toView
}) ], Kt.prototype, "attribute", void 0);

K([ k({
    mode: N.fromView
}) ], Kt.prototype, "active", void 0);

Kt = K([ T("load"), X(0, V), X(1, A), X(2, Lt), X(3, tt), X(4, P), X(5, Wt), X(6, nt) ], Kt);

let Xt = class HrefCustomAttribute {
    constructor(t, e, i, s, n, o) {
        this.target = t;
        this.el = e;
        this.router = i;
        this.delegator = s;
        this.ctx = n;
        this.isInitialized = false;
        if (i.options.useHref && "A" === e.nodeName) switch (e.getAttribute("target")) {
          case null:
          case o.name:
          case "_self":
            this.isEnabled = true;
            break;

          default:
            this.isEnabled = false;
            break;
        } else this.isEnabled = false;
    }
    get isExternal() {
        return this.el.hasAttribute("external") || this.el.hasAttribute("data-external");
    }
    binding() {
        if (!this.isInitialized) {
            this.isInitialized = true;
            this.isEnabled = this.isEnabled && null === L(this.el, U.getDefinition(Kt).key);
        }
        if (null == this.value) this.el.removeAttribute("href"); else this.el.setAttribute("href", this.value);
        this.eventListener = this.delegator.addEventListener(this.target, this.el, "click", this);
    }
    unbinding() {
        this.eventListener.dispose();
    }
    valueChanged(t) {
        if (null == t) this.el.removeAttribute("href"); else this.el.setAttribute("href", t);
    }
    handleEvent(t) {
        this.C(t);
    }
    C(t) {
        if (t.altKey || t.ctrlKey || t.shiftKey || t.metaKey || 0 !== t.button || this.isExternal || !this.isEnabled) return;
        const e = this.el.getAttribute("href");
        if (null !== e) {
            t.preventDefault();
            void this.router.load(e, {
                context: this.ctx
            });
        }
    }
};

K([ k({
    mode: N.toView
}) ], Xt.prototype, "value", void 0);

Xt = K([ T({
    name: "href",
    noMultiBindings: true
}), X(0, V), X(1, A), X(2, Lt), X(3, P), X(4, Wt), X(5, $) ], Xt);

const te = Lt;

const ee = [ te ];

const ie = Zt;

const se = Kt;

const ne = Xt;

const oe = [ Zt, Kt, Xt ];

function re(t, e) {
    return t.register(O.hydrated(a, RouteContext.setRoot), O.afterActivate(Lt, (t => {
        if (r(e)) if ("function" === typeof e) return e(t); else return t.start(e, true);
        return t.start({}, true);
    })), O.afterDeactivate(Lt, (t => {
        t.stop();
    })), ...ee, ...oe);
}

const ae = {
    register(t) {
        return re(t);
    },
    customize(t) {
        return {
            register(e) {
                return re(e, t);
            }
        };
    }
};

class ScrollState {
    constructor(t) {
        this.el = t;
        this.top = t.scrollTop;
        this.left = t.scrollLeft;
    }
    static has(t) {
        return t.scrollTop > 0 || t.scrollLeft > 0;
    }
    restore() {
        this.el.scrollTo(this.left, this.top);
        this.el = null;
    }
}

function he(t) {
    t.restore();
}

class HostElementState {
    constructor(t) {
        this.scrollStates = [];
        this.save(t.children);
    }
    save(t) {
        let e;
        for (let i = 0, s = t.length; i < s; ++i) {
            e = t[i];
            if (ScrollState.has(e)) this.scrollStates.push(new ScrollState(e));
            this.save(e.children);
        }
    }
    restore() {
        this.scrollStates.forEach(he);
        this.scrollStates = null;
    }
}

const ce = t.createInterface("IStateManager", (t => t.singleton(ScrollStateManager)));

class ScrollStateManager {
    constructor() {
        this.cache = new WeakMap;
    }
    saveState(t) {
        this.cache.set(t.host, new HostElementState(t.host));
    }
    restoreState(t) {
        const e = this.cache.get(t.host);
        if (void 0 !== e) {
            e.restore();
            this.cache.delete(t.host);
        }
    }
}

export { $t as AST, ActionExpression, Tt as AuNavId, ChildRouteConfig, ComponentAgent, ComponentExpression, CompositeSegmentExpression, ee as DefaultComponents, oe as DefaultResources, vt as ExpressionKind, Xt as HrefCustomAttribute, ne as HrefCustomAttributeRegistration, it as IBaseHrefProvider, nt as ILocationManager, Wt as IRouteContext, Lt as IRouter, tt as IRouterEvents, ce as IStateManager, Ot as IViewportInstruction, Kt as LoadCustomAttribute, se as LoadCustomAttributeRegistration, LocationChangeEvent, Navigation, NavigationCancelEvent, NavigationEndEvent, NavigationErrorEvent, NavigationOptions, NavigationStartEvent, ParameterExpression, ParameterListExpression, Ht as Route, RouteConfig, RouteContext, RouteDefinition, RouteExpression, RouteNode, RouteTree, Ut as Router, ae as RouterConfiguration, RouterOptions, te as RouterRegistration, ScopedSegmentExpression, SegmentExpression, SegmentGroupExpression, Transition, ViewportAgent, Zt as ViewportCustomElement, ie as ViewportCustomElementRegistration, ViewportExpression, Vt as isManagedState, Ft as route, At as toManagedState };
//# sourceMappingURL=index.js.map
