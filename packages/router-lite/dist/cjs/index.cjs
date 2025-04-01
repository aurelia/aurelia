"use strict";

var t = require("@aurelia/kernel");

var e = require("@aurelia/runtime-html");

var s = require("@aurelia/route-recognizer");

var i = require("@aurelia/metadata");

var n = require("@aurelia/runtime");

function error(t, e, ...s) {
    {
        t.error(`AUR${e}`, ...s.map((t => String(t))));
    }
}

function getMessage(t, ...e) {
    return `AUR${t}:${e.map((t => String(t))).join(":")}`;
}

function logAndThrow(t, e) {
    e.error(t);
    throw t;
}

class Batch {
    constructor(t, e, s) {
        this.t = t;
        this.i = e;
        this.u = false;
        this.h = null;
        this.R = s ?? this;
    }
    static C(t) {
        return new Batch(0, t, null);
    }
    N() {
        let t = this;
        do {
            ++t.t;
            t = t.h;
        } while (t !== null);
    }
    $() {
        let t = this;
        do {
            if (--t.t === 0) {
                t._();
            }
            t = t.h;
        } while (t !== null);
    }
    _() {
        const t = this.i;
        if (t !== null) {
            this.i = null;
            t(this);
            this.u = true;
        }
    }
    T(t) {
        if (this.h === null) {
            return this.h = new Batch(this.t, t, this.R);
        } else {
            return this.h.T(t);
        }
    }
    C() {
        this.R.N();
        this.R.$();
        return this;
    }
}

function mergeDistinct(t, e) {
    t = t.slice();
    e = e.slice();
    const s = [];
    while (t.length > 0) {
        const i = t.shift();
        const n = i.context.vpa;
        if (s.every((t => t.context.vpa !== n))) {
            const t = e.findIndex((t => t.context.vpa === n));
            if (t >= 0) {
                s.push(...e.splice(0, t + 1));
            } else {
                s.push(i);
            }
        }
    }
    s.push(...e);
    return s;
}

function tryStringify(t) {
    try {
        return JSON.stringify(t);
    } catch {
        return Object.prototype.toString.call(t);
    }
}

function ensureArrayOfStrings(t) {
    return typeof t === "string" ? [ t ] : t;
}

function ensureString(t) {
    return typeof t === "string" ? t : t[0];
}

function mergeURLSearchParams(t, e, s) {
    const i = s ? new URLSearchParams(t) : t;
    if (e == null) return i;
    for (const [t, s] of Object.entries(e)) {
        if (s == null) continue;
        i.append(t, s);
    }
    return i;
}

const r = e.BindingMode.toView;

const o = e.BindingMode.fromView;

function isNotNullishOrTypeOrViewModel(t) {
    return typeof t === "object" && t !== null && !e.isCustomElementViewModel(t);
}

function isPartialCustomElementDefinition(t) {
    return isNotNullishOrTypeOrViewModel(t) && Object.prototype.hasOwnProperty.call(t, "name") === true;
}

function isPartialChildRouteConfig(t) {
    return isNotNullishOrTypeOrViewModel(t) && Object.prototype.hasOwnProperty.call(t, "component") === true;
}

function isPartialRedirectRouteConfig(t) {
    return isNotNullishOrTypeOrViewModel(t) && Object.prototype.hasOwnProperty.call(t, "redirectTo") === true;
}

function isPartialViewportInstruction(t) {
    return isNotNullishOrTypeOrViewModel(t) && Object.prototype.hasOwnProperty.call(t, "component") === true;
}

function expectType(t, e, s) {
    throw new Error(getMessage(3554, e, t, tryStringify(s)));
}

function validateRouteConfig(t, e) {
    if (t == null) throw new Error(getMessage(3555, t));
    const s = Object.keys(t);
    for (const i of s) {
        const s = t[i];
        const n = [ e, i ].join(".");
        switch (i) {
          case "id":
          case "viewport":
          case "redirectTo":
            if (typeof s !== "string") {
                expectType("string", n, s);
            }
            break;

          case "caseSensitive":
          case "nav":
            if (typeof s !== "boolean") {
                expectType("boolean", n, s);
            }
            break;

          case "data":
            if (typeof s !== "object" || s === null) {
                expectType("object", n, s);
            }
            break;

          case "title":
            switch (typeof s) {
              case "string":
              case "function":
                break;

              default:
                expectType("string or function", n, s);
            }
            break;

          case "path":
            if (s instanceof Array) {
                for (let t = 0; t < s.length; ++t) {
                    if (typeof s[t] !== "string") {
                        expectType("string", `${n}[${t}]`, s[t]);
                    }
                }
            } else if (typeof s !== "string") {
                expectType("string or Array of strings", n, s);
            }
            break;

          case "component":
            validateComponent(s, n, "component");
            break;

          case "routes":
            {
                if (!(s instanceof Array)) {
                    expectType("Array", n, s);
                }
                for (const t of s) {
                    const e = `${n}[${s.indexOf(t)}]`;
                    validateComponent(t, e, "component");
                }
                break;
            }

          case "transitionPlan":
            switch (typeof s) {
              case "string":
                switch (s) {
                  case "none":
                  case "replace":
                  case "invoke-lifecycles":
                    break;

                  default:
                    expectType("string('none'|'replace'|'invoke-lifecycles') or function", n, s);
                }
                break;

              case "function":
                break;

              default:
                expectType("string('none'|'replace'|'invoke-lifecycles') or function", n, s);
            }
            break;

          case "fallback":
            validateComponent(s, n, "fallback");
            break;

          default:
            throw new Error(getMessage(3556, e, i));
        }
    }
}

function validateRedirectRouteConfig(t, e) {
    if (t == null) throw new Error(getMessage(3555, t));
    const s = Object.keys(t);
    for (const i of s) {
        const s = t[i];
        const n = [ e, i ].join(".");
        switch (i) {
          case "path":
            if (s instanceof Array) {
                for (let t = 0; t < s.length; ++t) {
                    if (typeof s[t] !== "string") {
                        expectType("string", `${n}[${t}]`, s[t]);
                    }
                }
            } else if (typeof s !== "string") {
                expectType("string or Array of strings", n, s);
            }
            break;

          case "redirectTo":
            if (typeof s !== "string") {
                expectType("string", n, s);
            }
            break;

          default:
            throw new Error(getMessage(3557, e, i));
        }
    }
}

function validateComponent(t, s, i) {
    switch (typeof t) {
      case "function":
        break;

      case "object":
        if (t instanceof Promise || t instanceof NavigationStrategy) {
            break;
        }
        if (isPartialRedirectRouteConfig(t)) {
            validateRedirectRouteConfig(t, s);
            break;
        }
        if (isPartialChildRouteConfig(t)) {
            validateRouteConfig(t, s);
            break;
        }
        if (!e.isCustomElementViewModel(t) && !isPartialCustomElementDefinition(t)) {
            expectType(`an object with at least a '${i}' property (see Routeable)`, s, t);
        }
        break;

      case "string":
        break;

      default:
        expectType("function, object or string (see Routeable)", s, t);
    }
}

function shallowEquals(t, e) {
    if (t === e) {
        return true;
    }
    if (typeof t !== typeof e) {
        return false;
    }
    if (t === null || e === null) {
        return false;
    }
    if (Object.getPrototypeOf(t) !== Object.getPrototypeOf(e)) {
        return false;
    }
    const s = Object.keys(t);
    const i = Object.keys(e);
    if (s.length !== i.length) {
        return false;
    }
    for (let n = 0, r = s.length; n < r; ++n) {
        const r = s[n];
        if (r !== i[n]) {
            return false;
        }
        if (t[r] !== e[r]) {
            return false;
        }
    }
    return true;
}

const a = "au-nav-id";

class Subscription {
    constructor(t, e, s) {
        this.I = t;
        this.P = e;
        this.V = s;
        this.A = false;
    }
    dispose() {
        if (!this.A) {
            this.A = true;
            this.V.dispose();
            const t = this.I["O"];
            t.splice(t.indexOf(this), 1);
        }
    }
}

const c = /*@__PURE__*/ t.DI.createInterface("IRouterEvents", (t => t.singleton(RouterEvents)));

class RouterEvents {
    constructor() {
        this.M = 0;
        this.O = [];
        this.j = t.resolve(t.IEventAggregator);
        this.L = t.resolve(t.ILogger).scopeTo("RouterEvents");
    }
    publish(t) {
        this.j.publish(t.name, t);
    }
    subscribe(t, e) {
        const s = new Subscription(this, ++this.M, this.j.subscribe(t, (t => {
            e(t);
        })));
        this.O.push(s);
        return s;
    }
}

class LocationChangeEvent {
    get name() {
        return "au:router:location-change";
    }
    constructor(t, e, s, i) {
        this.id = t;
        this.url = e;
        this.trigger = s;
        this.state = i;
    }
    toString() {
        return `LocationChangeEvent`;
    }
}

class NavigationStartEvent {
    get name() {
        return "au:router:navigation-start";
    }
    constructor(t, e, s, i) {
        this.id = t;
        this.instructions = e;
        this.trigger = s;
        this.managedState = i;
    }
    toString() {
        return `NavigationStartEvent`;
    }
}

class NavigationEndEvent {
    get name() {
        return "au:router:navigation-end";
    }
    constructor(t, e, s) {
        this.id = t;
        this.instructions = e;
        this.finalInstructions = s;
    }
    toString() {
        return `NavigationEndEvent`;
    }
}

class NavigationCancelEvent {
    get name() {
        return "au:router:navigation-cancel";
    }
    constructor(t, e, s) {
        this.id = t;
        this.instructions = e;
        this.reason = s;
    }
    toString() {
        return `NavigationCancelEvent`;
    }
}

class NavigationErrorEvent {
    get name() {
        return "au:router:navigation-error";
    }
    constructor(t, e, s) {
        this.id = t;
        this.instructions = e;
        this.error = s;
    }
    toString() {
        return `NavigationErrorEvent`;
    }
}

const u = /*@__PURE__*/ t.DI.createInterface("IBaseHref");

const h = /*@__PURE__*/ t.DI.createInterface("ILocationManager", (t => t.singleton(BrowserLocationManager)));

class BrowserLocationManager {
    constructor() {
        this.U = 0;
        this.L = t.resolve(t.ILogger).root.scopeTo("LocationManager");
        this.I = t.resolve(c);
        this.B = t.resolve(e.IHistory);
        this.l = t.resolve(e.ILocation);
        this.H = t.resolve(e.IWindow);
        this.q = t.resolve(u);
        this.F = t.resolve(R).useUrlFragmentHash ? "hashchange" : "popstate";
    }
    startListening() {
        this.H.addEventListener(this.F, this, false);
    }
    stopListening() {
        this.H.removeEventListener(this.F, this, false);
    }
    handleEvent(t) {
        this.I.publish(new LocationChangeEvent(++this.U, this.getPath(), this.F, "state" in t ? t.state : null));
    }
    pushState(t, e, s) {
        s = this.addBaseHref(s);
        this.B.pushState(t, e, s);
    }
    replaceState(t, e, s) {
        s = this.addBaseHref(s);
        this.B.replaceState(t, e, s);
    }
    getPath() {
        const {pathname: t, search: e, hash: s} = this.l;
        return this.removeBaseHref(`${t}${normalizeQuery(e)}${s}`);
    }
    addBaseHref(t) {
        let e;
        let s = this.q.href;
        if (s.endsWith("/")) {
            s = s.slice(0, -1);
        }
        if (s.length === 0) {
            e = t;
        } else {
            if (t.startsWith("/")) {
                t = t.slice(1);
            }
            e = `${s}/${t}`;
        }
        return e;
    }
    removeBaseHref(t) {
        const e = this.q.pathname;
        if (t.startsWith(e)) {
            t = t.slice(e.length);
        }
        return normalizePath(t);
    }
}

function normalizePath(t) {
    let e;
    let s;
    let i;
    if ((i = t.indexOf("?")) >= 0 || (i = t.indexOf("#")) >= 0) {
        e = t.slice(0, i);
        s = t.slice(i);
    } else {
        e = t;
        s = "";
    }
    if (e.endsWith("/")) {
        e = e.slice(0, -1);
    } else if (e.endsWith("/index.html")) {
        e = e.slice(0, -11);
    }
    return `${e}${s}`;
}

function normalizeQuery(t) {
    return t.length > 0 && !t.startsWith("?") ? `?${t}` : t;
}

const l = t.emptyArray;

class RouteConfig {
    get path() {
        const t = this.G;
        if (t.length > 0) return t;
        const s = e.CustomElement.getDefinition(this.W);
        return this.G = [ s.name, ...s.aliases ];
    }
    get component() {
        return this.J();
    }
    constructor(t, e, s, i, n, r, o, a, c, u, h, l) {
        this.id = t;
        this.G = e;
        this.title = s;
        this.redirectTo = i;
        this.caseSensitive = n;
        this.transitionPlan = r;
        this.viewport = o;
        this.data = a;
        this.routes = c;
        this.fallback = u;
        this.nav = l;
        this.K = false;
        this.X = null;
        this.W = h;
        this.Y = h instanceof NavigationStrategy;
    }
    static Z(e, s) {
        if (typeof e === "string" || e instanceof Array) {
            const t = ensureArrayOfStrings(e);
            const i = s?.redirectTo ?? null;
            const n = s?.caseSensitive ?? false;
            const r = ensureString(s?.id ?? (t instanceof Array ? t[0] : t));
            const o = s?.title ?? null;
            const a = s?.transitionPlan ?? null;
            const c = s?.viewport ?? S;
            const u = s?.data ?? {};
            const h = s?.routes ?? l;
            return new RouteConfig(r, t, o, i, n, a, c, u, h, s?.fallback ?? null, s, s?.nav ?? true);
        } else if (typeof e === "object") {
            const i = e;
            validateRouteConfig(i, "");
            const n = ensureArrayOfStrings(i.path ?? s?.path ?? t.emptyArray);
            const r = i.title ?? s?.title ?? null;
            const o = i.redirectTo ?? s?.redirectTo ?? null;
            const a = i.caseSensitive ?? s?.caseSensitive ?? false;
            const c = i.id ?? s?.id ?? (n instanceof Array ? n[0] : n);
            const u = i.transitionPlan ?? s?.transitionPlan ?? null;
            const h = i.viewport ?? s?.viewport ?? S;
            const f = {
                ...s?.data,
                ...i.data
            };
            const p = [ ...i.routes ?? l, ...s?.routes ?? l ];
            return new RouteConfig(c, n, r, o, a, u, h, f, p, i.fallback ?? s?.fallback ?? null, i.component ?? s ?? null, i.nav ?? true);
        } else {
            expectType("string, function/class or object", "", e);
        }
    }
    tt(t, e) {
        validateRouteConfig(t, this.path[0] ?? "");
        const s = ensureArrayOfStrings(t.path ?? this.path);
        return new RouteConfig(ensureString(t.id ?? this.id ?? s), s, t.title ?? this.title, t.redirectTo ?? this.redirectTo, t.caseSensitive ?? this.caseSensitive, t.transitionPlan ?? this.transitionPlan ?? e?.transitionPlan ?? null, t.viewport ?? this.viewport, t.data ?? this.data, t.routes ?? this.routes, t.fallback ?? this.fallback ?? e?.fallback ?? null, this.W, t.nav ?? this.nav);
    }
    et(t, e, i) {
        if (hasSamePath(t, e) && shallowEquals(t.params, e.params)) return "none";
        if (i != null) return i;
        const n = this.transitionPlan ?? "replace";
        return typeof n === "function" ? n(t, e) : n;
        function cleanPath(t) {
            return t.replace(`/*${s.RESIDUE}`, "");
        }
        function hasSamePath(t, e) {
            const s = t.finalPath;
            const i = e.finalPath;
            return s.length === 0 || i.length === 0 || cleanPath(s) === cleanPath(i);
        }
    }
    st(e, s, i) {
        if (this.K) throw new Error(getMessage(3550));
        if (typeof e.getRouteConfig !== "function") return;
        return t.onResolve(e.getRouteConfig(s, i), (t => {
            this.K = true;
            if (t == null) return;
            let e = s?.path ?? "";
            if (typeof e !== "string") {
                e = e[0];
            }
            validateRouteConfig(t, e);
            this.id = t.id ?? this.id;
            this.G = ensureArrayOfStrings(t.path ?? this.path);
            this.title = t.title ?? this.title;
            this.redirectTo = t.redirectTo ?? this.redirectTo;
            this.caseSensitive = t.caseSensitive ?? this.caseSensitive;
            this.transitionPlan = t.transitionPlan ?? this.transitionPlan;
            this.viewport = t.viewport ?? this.viewport;
            this.data = t.data ?? this.data;
            this.routes = t.routes ?? this.routes;
            this.fallback = t.fallback ?? this.fallback;
            this.nav = t.nav ?? this.nav;
        }));
    }
    it() {
        return new RouteConfig(this.id, this.path, this.title, this.redirectTo, this.caseSensitive, this.transitionPlan, this.viewport, this.data, this.routes, this.fallback, this.W, this.nav);
    }
    nt(t, s, i) {
        const n = this.fallback;
        return typeof n === "function" && !e.CustomElement.isType(n) ? n(t, s, i) : n;
    }
    J(t, e, s, i) {
        if (t == null) {
            if (this.X != null) return this.X;
            if (this.Y) throw new Error(getMessage(3558, this.id));
            return this.X = this.W;
        }
        return this.X ??= this.Y ? this.W.getComponent(t, e, s, i) : this.W;
    }
    rt() {
        if (!this.Y) return;
        this.X = null;
    }
}

const f = {
    name: /*@__PURE__*/ t.getResourceKeyFor("route-configuration"),
    isConfigured(t) {
        return i.Metadata.has(f.name, t);
    },
    configure(t, e) {
        const s = RouteConfig.Z(t, e);
        i.Metadata.define(s, e, f.name);
        return e;
    },
    getConfig(t) {
        if (!f.isConfigured(t)) {
            f.configure({}, t);
        }
        return i.Metadata.get(f.name, t);
    }
};

function route(t) {
    return function(e, s) {
        s.addInitializer((function() {
            f.configure(t, this);
        }));
        return e;
    };
}

function resolveRouteConfiguration(e, s, i, n, r) {
    if (isPartialRedirectRouteConfig(e)) return RouteConfig.Z(e, null);
    const [o, a] = resolveCustomElementDefinition(e, r);
    if (o.type === 5) return RouteConfig.Z(e, null);
    return t.onResolve(a, (r => {
        const a = r.Type;
        const c = f.getConfig(a);
        if (isPartialChildRouteConfig(e)) return c.tt(e, i);
        if (s) return c.it();
        if (!c.K && o.type === 4 && typeof e.getRouteConfig === "function") {
            return t.onResolve(c.st(e, i, n), (() => c));
        }
        return c;
    }));
}

function resolveCustomElementDefinition(t, s) {
    const i = createNavigationInstruction(t);
    let n;
    switch (i.type) {
      case 5:
        return [ i, null ];

      case 0:
        {
            if (s == null) throw new Error(getMessage(3551));
            const t = s.component.dependencies;
            let r = t.find((t => isPartialCustomElementDefinition(t) && t.name === i.value)) ?? e.CustomElement.find(s.container, i.value);
            if (r === null) throw new Error(getMessage(3552, i.value, s));
            if (!(r instanceof e.CustomElementDefinition)) {
                r = e.CustomElementDefinition.create(r);
                e.CustomElement.define(r);
            }
            n = r;
            break;
        }

      case 2:
        n = i.value;
        break;

      case 4:
        n = e.CustomElement.getDefinition(i.value.constructor);
        break;

      case 3:
        if (s == null) throw new Error(getMessage(3553));
        n = s.ot(i.value);
        break;
    }
    return [ i, n ];
}

function createNavigationInstruction(t) {
    return isPartialChildRouteConfig(t) ? createNavigationInstruction(t.component) : TypedNavigationInstruction.create(t);
}

const p = [ "?", "#", "/", "+", "(", ")", "@", "!", "=", ",", "&", "'", "~", ";" ];

class ParserState {
    get u() {
        return this.ct.length === 0;
    }
    constructor(t) {
        this.ut = t;
        this.ht = [];
        this.lt = 0;
        this.ft = 0;
        this.ct = t;
    }
    gt(...t) {
        const e = this.ct;
        return t.some((function(t) {
            return e.startsWith(t);
        }));
    }
    dt(t) {
        if (this.gt(t)) {
            this.ct = this.ct.slice(t.length);
            this.ft += t.length;
            this.wt(t);
            return true;
        }
        return false;
    }
    vt(t) {
        if (!this.dt(t)) {
            this.Et(`'${t}'`);
        }
    }
    Et(t) {
        throw new Error(getMessage(3500, t, this.ft, this.ut, this.ct, this.ct));
    }
    xt() {
        if (!this.u) {
            throw new Error(getMessage(3501, this.ct, this.ft, this.ut));
        }
    }
    yt() {
        const t = this.ct[0];
        this.ct = this.ct.slice(1);
        ++this.ft;
        this.wt(t);
    }
    Rt() {
        this.ht[this.lt++] = "";
    }
    St() {
        const t = --this.lt;
        const e = this.ht;
        const s = e[t];
        e[t] = "";
        return s;
    }
    bt() {
        this.ht[--this.lt] = "";
    }
    wt(t) {
        const e = this.lt;
        const s = this.ht;
        for (let i = 0; i < e; ++i) {
            s[i] += t;
        }
    }
}

const g = new Map;

class RouteExpression {
    get kind() {
        return "Route";
    }
    constructor(t, e, s, i) {
        this.isAbsolute = t;
        this.root = e;
        this.queryParams = s;
        this.fragment = i;
    }
    static parse(t) {
        const e = t.toString();
        let s = g.get(e);
        if (s === void 0) {
            g.set(e, s = RouteExpression.Ct(t));
        }
        return s;
    }
    static Ct(t) {
        const e = t.path;
        if (e === "") {
            return new RouteExpression(false, SegmentExpression.Empty, t.query, t.fragment);
        }
        const s = new ParserState(e);
        s.Rt();
        const i = s.dt("/");
        const n = CompositeSegmentExpression.Nt(s);
        s.xt();
        s.bt();
        return new RouteExpression(i, n, t.query, t.fragment);
    }
    toInstructionTree(t) {
        return new ViewportInstructionTree(t, this.isAbsolute, this.root.kt(0, 0), mergeURLSearchParams(this.queryParams, t.queryParams, true), this.fragment ?? t.fragment);
    }
}

class CompositeSegmentExpression {
    get kind() {
        return "CompositeSegment";
    }
    constructor(t) {
        this.siblings = t;
    }
    static Nt(t) {
        t.Rt();
        const e = t.dt("+");
        const s = [];
        do {
            s.push(ScopedSegmentExpression.Nt(t));
        } while (t.dt("+"));
        if (!e && s.length === 1) {
            t.bt();
            return s[0];
        }
        t.bt();
        return new CompositeSegmentExpression(s);
    }
    kt(t, e) {
        switch (this.siblings.length) {
          case 0:
            return [];

          case 1:
            return this.siblings[0].kt(t, e);

          case 2:
            return [ ...this.siblings[0].kt(t, 0), ...this.siblings[1].kt(0, e) ];

          default:
            return [ ...this.siblings[0].kt(t, 0), ...this.siblings.slice(1, -1).flatMap((function(t) {
                return t.kt(0, 0);
            })), ...this.siblings[this.siblings.length - 1].kt(0, e) ];
        }
    }
}

class ScopedSegmentExpression {
    get kind() {
        return "ScopedSegment";
    }
    constructor(t, e) {
        this.left = t;
        this.right = e;
    }
    static Nt(t) {
        t.Rt();
        const e = SegmentGroupExpression.Nt(t);
        if (t.dt("/")) {
            const s = ScopedSegmentExpression.Nt(t);
            t.bt();
            return new ScopedSegmentExpression(e, s);
        }
        t.bt();
        return e;
    }
    kt(t, e) {
        const s = this.left.kt(t, 0);
        const i = this.right.kt(0, e);
        let n = s[s.length - 1];
        while (n.children.length > 0) {
            n = n.children[n.children.length - 1];
        }
        n.children.push(...i);
        return s;
    }
}

class SegmentGroupExpression {
    get kind() {
        return "SegmentGroup";
    }
    constructor(t) {
        this.expression = t;
    }
    static Nt(t) {
        t.Rt();
        if (t.dt("(")) {
            const e = CompositeSegmentExpression.Nt(t);
            t.vt(")");
            t.bt();
            return new SegmentGroupExpression(e);
        }
        t.bt();
        return SegmentExpression.Nt(t);
    }
    kt(t, e) {
        return this.expression.kt(t + 1, e + 1);
    }
}

class SegmentExpression {
    get kind() {
        return "Segment";
    }
    static get Empty() {
        return new SegmentExpression(ComponentExpression.Empty, ViewportExpression.Empty, true);
    }
    constructor(t, e, s) {
        this.component = t;
        this.viewport = e;
        this.scoped = s;
    }
    static Nt(t) {
        t.Rt();
        const e = ComponentExpression.Nt(t);
        const s = ViewportExpression.Nt(t);
        const i = !t.dt("!");
        t.bt();
        return new SegmentExpression(e, s, i);
    }
    kt(t, e) {
        return [ ViewportInstruction.create({
            component: this.component.name,
            params: this.component.parameterList.$t(),
            viewport: this.viewport.name,
            open: t,
            close: e
        }) ];
    }
}

class ComponentExpression {
    get kind() {
        return "Component";
    }
    static get Empty() {
        return new ComponentExpression("", ParameterListExpression.Empty);
    }
    constructor(t, e) {
        this.name = t;
        this.parameterList = e;
        switch (t.charAt(0)) {
          case ":":
            this.isParameter = true;
            this.isStar = false;
            this.isDynamic = true;
            this.parameterName = t.slice(1);
            break;

          case "*":
            this.isParameter = false;
            this.isStar = true;
            this.isDynamic = true;
            this.parameterName = t.slice(1);
            break;

          default:
            this.isParameter = false;
            this.isStar = false;
            this.isDynamic = false;
            this.parameterName = t;
            break;
        }
    }
    static Nt(t) {
        t.Rt();
        t.Rt();
        if (!t.u) {
            if (t.gt("./")) {
                t.yt();
            } else if (t.gt("../")) {
                t.yt();
                t.yt();
            } else {
                while (!t.u && !t.gt(...p)) {
                    t.yt();
                }
            }
        }
        const e = t.St();
        if (e.length === 0) {
            t.Et("component name");
        }
        const s = ParameterListExpression.Nt(t);
        t.bt();
        return new ComponentExpression(e, s);
    }
}

class ViewportExpression {
    get kind() {
        return "Viewport";
    }
    static get Empty() {
        return new ViewportExpression("");
    }
    constructor(t) {
        this.name = t;
    }
    static Nt(t) {
        t.Rt();
        let e = null;
        if (t.dt("@")) {
            t.Rt();
            while (!t.u && !t.gt(...p)) {
                t.yt();
            }
            e = decodeURIComponent(t.St());
            if (e.length === 0) {
                t.Et("viewport name");
            }
        }
        t.bt();
        return new ViewportExpression(e);
    }
}

class ParameterListExpression {
    get kind() {
        return "ParameterList";
    }
    static get Empty() {
        return new ParameterListExpression([]);
    }
    constructor(t) {
        this.expressions = t;
    }
    static Nt(t) {
        t.Rt();
        const e = [];
        if (t.dt("(")) {
            do {
                e.push(ParameterExpression.Nt(t, e.length));
                if (!t.dt(",")) {
                    break;
                }
            } while (!t.u && !t.gt(")"));
            t.vt(")");
        }
        t.bt();
        return new ParameterListExpression(e);
    }
    $t() {
        const t = {};
        for (const e of this.expressions) {
            t[e.key] = e.value;
        }
        return t;
    }
}

class ParameterExpression {
    get kind() {
        return "Parameter";
    }
    static get Empty() {
        return new ParameterExpression("", "");
    }
    constructor(t, e) {
        this.key = t;
        this.value = e;
    }
    static Nt(t, e) {
        t.Rt();
        t.Rt();
        while (!t.u && !t.gt(...p)) {
            t.yt();
        }
        let s = t.St();
        if (s.length === 0) {
            t.Et("parameter key");
        }
        let i;
        if (t.dt("=")) {
            t.Rt();
            while (!t.u && !t.gt(...p)) {
                t.yt();
            }
            i = decodeURIComponent(t.St());
            if (i.length === 0) {
                t.Et("parameter value");
            }
        } else {
            i = s;
            s = e.toString();
        }
        t.bt();
        return new ParameterExpression(s, i);
    }
}

const d = Object.freeze({
    RouteExpression: RouteExpression,
    CompositeSegmentExpression: CompositeSegmentExpression,
    ScopedSegmentExpression: ScopedSegmentExpression,
    SegmentGroupExpression: SegmentGroupExpression,
    SegmentExpression: SegmentExpression,
    ComponentExpression: ComponentExpression,
    ViewportExpression: ViewportExpression,
    ParameterListExpression: ParameterListExpression,
    ParameterExpression: ParameterExpression
});

class ViewportRequest {
    constructor(t, e) {
        this.viewportName = t;
        this.componentName = e;
    }
    toString() {
        return `VR(viewport:'${this.viewportName}',component:'${this.componentName}')`;
    }
}

const w = new WeakMap;

class ViewportAgent {
    get _t() {
        return this._state & 16256;
    }
    set _t(t) {
        this._state = this._state & 127 | t;
    }
    get Tt() {
        return this._state & 127;
    }
    set Tt(t) {
        this._state = this._state & 16256 | t;
    }
    constructor(e, s, i) {
        this.viewport = e;
        this.hostController = s;
        this.It = false;
        this.Pt = null;
        this.Vt = null;
        this._state = 8256;
        this.At = "replace";
        this.Ot = null;
        this.Mt = null;
        this.jt = null;
        this.Lt = null;
        this.L = i.container.get(t.ILogger).scopeTo(`ViewportAgent<${i.Ut}>`);
    }
    static for(t, s) {
        let i = w.get(t);
        if (i === void 0) {
            const n = e.Controller.getCachedOrThrow(t);
            w.set(t, i = new ViewportAgent(t, n, s));
        }
        return i;
    }
    zt(t, e) {
        const s = this.jt;
        if (s !== null) {
            ensureTransitionHasNotErrored(s);
        }
        this.It = true;
        switch (this.Tt) {
          case 64:
            switch (this._t) {
              case 8192:
                return;

              case 4096:
                return this.Pt.Bt(t, e);

              default:
                this.Ht("activateFromViewport 1");
            }

          case 2:
            {
                if (this.jt === null) throw new Error(getMessage(3350, this));
                const e = Batch.C((e => {
                    this.Bt(t, this.jt, e);
                }));
                const s = new Promise((t => {
                    e.T((() => {
                        t();
                    }));
                }));
                return e.C().u ? void 0 : s;
            }

          default:
            this.Ht("activateFromViewport 2");
        }
    }
    Dt(t, e) {
        const s = this.jt;
        if (s !== null) {
            ensureTransitionHasNotErrored(s);
        }
        this.It = false;
        switch (this._t) {
          case 8192:
            return;

          case 4096:
            return this.Pt.qt(t, e);

          case 128:
            return;

          default:
            {
                if (this.jt === null) throw new Error(getMessage(3351, this));
                const e = Batch.C((e => {
                    this.qt(t, this.jt, e);
                }));
                const s = new Promise((t => {
                    e.T((() => {
                        t();
                    }));
                }));
                return e.C().u ? void 0 : s;
            }
        }
    }
    Ft(t) {
        if (!this.Gt()) {
            return false;
        }
        const e = this.viewport;
        const s = t.viewportName;
        const i = e.name;
        if (s !== S && i !== s) {
            return false;
        }
        const n = e.usedBy;
        if (n.length > 0 && !n.split(",").includes(t.componentName)) {
            return false;
        }
        return true;
    }
    Gt() {
        if (!this.It) {
            return false;
        }
        if (this.Tt !== 64) {
            return false;
        }
        return true;
    }
    Wt(e, s) {
        if (this.jt === null) {
            this.jt = e;
        }
        ensureTransitionHasNotErrored(e);
        if (e.guardsResult !== true) {
            return;
        }
        s.N();
        void t.onResolve(this.Lt, (() => {
            Batch.C((t => {
                for (const s of this.Ot.children) {
                    s.context.vpa.Wt(e, t);
                }
            })).T((t => {
                switch (this._t) {
                  case 4096:
                    switch (this.At) {
                      case "none":
                        this._t = 1024;
                        return;

                      case "invoke-lifecycles":
                      case "replace":
                        this._t = 2048;
                        t.N();
                        Batch.C((t => {
                            this.Pt.Wt(e, this.Mt, t);
                        })).T((() => {
                            this._t = 1024;
                            t.$();
                        })).C();
                        return;
                    }

                  case 8192:
                    return;

                  default:
                    e.Qt(new Error(`Unexpected state at canUnload of ${this}`));
                }
            })).T((() => {
                s.$();
            })).C();
        }));
    }
    Jt(e, s) {
        if (this.jt === null) {
            this.jt = e;
        }
        ensureTransitionHasNotErrored(e);
        if (e.guardsResult !== true) {
            return;
        }
        s.N();
        Batch.C((s => {
            switch (this.Tt) {
              case 32:
                this.Tt = 16;
                switch (this.At) {
                  case "none":
                    return;

                  case "invoke-lifecycles":
                    return this.Pt.Jt(e, this.Mt, s);

                  case "replace":
                    s.N();
                    void t.onResolve(this.Mt.context.Kt(this.hostController, this.Mt), (t => {
                        (this.Vt = t).Jt(e, this.Mt, s);
                        s.$();
                    }));
                }

              case 64:
                return;

              default:
                this.Ht("canLoad");
            }
        })).T((s => {
            if (e.guardsResult !== true) {
                return;
            }
            const i = this.Mt;
            switch (this.At) {
              case "none":
              case "invoke-lifecycles":
                {
                    s.N();
                    const e = i.context;
                    void t.onResolve(e.allResolved, (() => t.onResolve(t.onResolve(t.onResolveAll(...i.residue.splice(0).map((t => createAndAppendNodes(this.L, i, t)))), (() => t.onResolveAll(...e.getAvailableViewportAgents().reduce(((t, e) => {
                        const s = e.viewport;
                        const n = s.default;
                        if (n === null) return t;
                        t.push(createAndAppendNodes(this.L, i, ViewportInstruction.create({
                            component: n,
                            viewport: s.name
                        })));
                        return t;
                    }), [])))), (() => {
                        s.$();
                    }))));
                    return;
                }

              case "replace":
                return;
            }
        })).T((t => {
            switch (this.Tt) {
              case 16:
                this.Tt = 8;
                for (const s of this.Mt.children) {
                    s.context.vpa.Jt(e, t);
                }
                return;

              case 64:
                return;

              default:
                this.Ht("canLoad");
            }
        })).T((() => {
            s.$();
        })).C();
    }
    Xt(t, e) {
        ensureTransitionHasNotErrored(t);
        ensureGuardsResultIsTrue(this, t);
        e.N();
        Batch.C((e => {
            for (const s of this.Ot.children) {
                s.context.vpa.Xt(t, e);
            }
        })).T((s => {
            switch (this._t) {
              case 1024:
                switch (this.At) {
                  case "none":
                    this._t = 256;
                    return;

                  case "invoke-lifecycles":
                  case "replace":
                    this._t = 512;
                    s.N();
                    Batch.C((e => {
                        this.Pt.Xt(t, this.Mt, e);
                    })).T((() => {
                        this._t = 256;
                        s.$();
                    })).C();
                    return;
                }

              case 8192:
                for (const s of this.Ot.children) {
                    s.context.vpa.Xt(t, e);
                }
                return;

              default:
                this.Ht("unloading");
            }
        })).T((() => {
            e.$();
        })).C();
    }
    Yt(t, e) {
        ensureTransitionHasNotErrored(t);
        ensureGuardsResultIsTrue(this, t);
        e.N();
        Batch.C((e => {
            switch (this.Tt) {
              case 8:
                {
                    this.Tt = 4;
                    switch (this.At) {
                      case "none":
                        return;

                      case "invoke-lifecycles":
                        return this.Pt.Yt(t, this.Mt, e);

                      case "replace":
                        return this.Vt.Yt(t, this.Mt, e);
                    }
                }

              case 64:
                return;

              default:
                this.Ht("loading");
            }
        })).T((e => {
            switch (this.Tt) {
              case 4:
                this.Tt = 2;
                for (const s of this.Mt.children) {
                    s.context.vpa.Yt(t, e);
                }
                return;

              case 64:
                return;

              default:
                this.Ht("loading");
            }
        })).T((() => {
            e.$();
        })).C();
    }
    qt(e, s, i) {
        ensureTransitionHasNotErrored(s);
        ensureGuardsResultIsTrue(this, s);
        i.N();
        switch (this._t) {
          case 256:
            this._t = 128;
            switch (this.At) {
              case "none":
              case "invoke-lifecycles":
                i.$();
                return;

              case "replace":
                {
                    const n = this.hostController;
                    const r = this.Pt;
                    s.Zt((() => t.onResolve(r.qt(e, n), (() => {
                        if (e === null) {
                            r.te();
                        }
                    }))), (() => {
                        i.$();
                    }));
                }
            }
            return;

          case 8192:
            i.$();
            return;

          case 128:
            i.$();
            return;

          default:
            this.Ht("deactivate");
        }
    }
    Bt(t, e, s) {
        ensureTransitionHasNotErrored(e);
        ensureGuardsResultIsTrue(this, e);
        s.N();
        if (this.Tt === 32) {
            Batch.C((t => {
                this.Jt(e, t);
            })).T((t => {
                this.Yt(e, t);
            })).T((s => {
                this.Bt(t, e, s);
            })).T((() => {
                s.$();
            })).C();
            return;
        }
        switch (this.Tt) {
          case 2:
            this.Tt = 1;
            Batch.C((s => {
                switch (this.At) {
                  case "none":
                  case "invoke-lifecycles":
                    return;

                  case "replace":
                    {
                        const i = this.hostController;
                        e.Zt((() => {
                            s.N();
                            return this.Vt.Bt(t, i);
                        }), (() => {
                            s.$();
                        }));
                    }
                }
            })).T((t => {
                this.ee(e, t);
            })).T((() => {
                s.$();
            })).C();
            return;

          case 64:
            s.$();
            return;

          default:
            this.Ht("activate");
        }
    }
    se(e, s) {
        if (this._t === 8192) {
            this.Bt(null, e, s);
            return;
        }
        if (this.Tt === 64) {
            this.qt(null, e, s);
            return;
        }
        ensureTransitionHasNotErrored(e);
        ensureGuardsResultIsTrue(this, e);
        if (!(this._t === 256 && this.Tt === 2)) {
            this.Ht("swap");
        }
        this._t = 128;
        this.Tt = 1;
        switch (this.At) {
          case "none":
          case "invoke-lifecycles":
            {
                const t = mergeDistinct(this.Mt.children, this.Ot.children);
                for (const i of t) {
                    i.context.vpa.se(e, s);
                }
                return;
            }

          case "replace":
            {
                const i = this.hostController;
                const n = this.Pt;
                const r = this.Vt;
                s.N();
                Batch.C((s => {
                    e.Zt((() => {
                        s.N();
                        return t.onResolve(n.qt(null, i), (() => n.te()));
                    }), (() => {
                        s.$();
                    }));
                })).T((t => {
                    e.Zt((() => {
                        t.N();
                        return r.Bt(null, i);
                    }), (() => {
                        t.$();
                    }));
                })).T((t => {
                    this.ee(e, t);
                })).T((() => {
                    s.$();
                })).C();
                return;
            }
        }
    }
    ee(e, s) {
        const i = this.Mt;
        e.Zt((() => {
            s.N();
            const e = i.context;
            return t.onResolve(e.allResolved, (() => {
                const s = i.children.slice();
                return t.onResolve(t.onResolveAll(...i.residue.splice(0).map((t => createAndAppendNodes(this.L, i, t)))), (() => t.onResolve(t.onResolveAll(...e.getAvailableViewportAgents().reduce(((t, e) => {
                    const s = e.viewport;
                    const n = s.default;
                    if (n === null) return t;
                    t.push(createAndAppendNodes(this.L, i, ViewportInstruction.create({
                        component: n,
                        viewport: s.name
                    })));
                    return t;
                }), [])), (() => i.children.filter((t => !s.includes(t)))))));
            }));
        }), (t => {
            Batch.C((s => {
                for (const i of t) {
                    e.Zt((() => {
                        s.N();
                        return i.context.vpa.Jt(e, s);
                    }), (() => {
                        s.$();
                    }));
                }
            })).T((s => {
                if (e.guardsResult !== true) return;
                for (const i of t) {
                    e.Zt((() => {
                        s.N();
                        return i.context.vpa.Yt(e, s);
                    }), (() => {
                        s.$();
                    }));
                }
            })).T((s => {
                if (e.guardsResult !== true) return;
                for (const i of t) {
                    e.Zt((() => {
                        s.N();
                        return i.context.vpa.Bt(null, e, s);
                    }), (() => {
                        s.$();
                    }));
                }
            })).T((() => {
                s.$();
            })).C();
        }));
    }
    ie(t, e) {
        switch (this.Tt) {
          case 64:
            this.Mt = e;
            this.Tt = 32;
            break;

          default:
            this.Ht("scheduleUpdate 1");
        }
        switch (this._t) {
          case 8192:
          case 4096:
          case 1024:
            break;

          default:
            this.Ht("scheduleUpdate 2");
        }
        const s = this.Pt?.ne ?? null;
        if (s === null || s.component !== e.component) {
            this.At = "replace";
        } else {
            this.At = e.context.config.et(s, e, t.transitionPlan);
        }
    }
    re() {
        if (this.Ot !== null) {
            this.Ot.children.forEach((function(t) {
                t.context.vpa.re();
            }));
        }
        if (this.Mt !== null) {
            this.Mt.children.forEach((function(t) {
                t.context.vpa.re();
            }));
        }
        let e = null;
        let s = null;
        switch (this._t) {
          case 8192:
          case 4096:
            this.jt = null;
            break;

          case 2048:
          case 1024:
            this._t = 4096;
            this.jt = null;
            break;

          case 512:
          case 256:
          case 128:
            e = t.onResolve(this.Pt?.qt(null, this.hostController), (() => {
                this.Pt?.te();
                this._t = 8192;
                this.Pt = null;
            }));
            break;
        }
        switch (this.Tt) {
          case 64:
          case 32:
          case 16:
          case 8:
            this.Mt = null;
            this.Tt = 64;
            break;

          case 4:
          case 2:
          case 1:
            {
                s = t.onResolve(this.Vt?.qt(null, this.hostController), (() => {
                    this.Vt?.te();
                    this.At = "replace";
                    this.Tt = 64;
                    this.Vt = null;
                    this.Mt = null;
                }));
                break;
            }
        }
        if (e !== null && s !== null) {
            this.Lt = t.onResolve(t.onResolveAll(e, s), (() => {
                this.jt = null;
                this.Lt = null;
            }));
        }
    }
    oe() {
        if (this.Ot !== null) {
            this.Ot.children.forEach((function(t) {
                t.context.vpa.oe();
            }));
        }
        if (this.Mt !== null) {
            this.Mt.children.forEach((function(t) {
                t.context.vpa.oe();
            }));
        }
        if (this.jt !== null) {
            ensureTransitionHasNotErrored(this.jt);
            switch (this.Tt) {
              case 64:
                switch (this._t) {
                  case 8192:
                  case 128:
                    this._t = 8192;
                    this.Pt = null;
                    break;

                  default:
                    this.Ht("endTransition 1");
                }
                break;

              case 1:
                switch (this._t) {
                  case 8192:
                  case 128:
                    switch (this.At) {
                      case "none":
                        this._t = 4096;
                        break;

                      case "invoke-lifecycles":
                        this._t = 4096;
                        this.Pt.ne = this.Mt;
                        break;

                      case "replace":
                        this._t = 4096;
                        this.Pt = this.Vt;
                        break;
                    }
                    this.Ot = this.Mt;
                    break;

                  default:
                    this.Ht("endTransition 2");
                }
                break;

              default:
                this.Ht("endTransition 3");
            }
            this.At = "replace";
            this.Tt = 64;
            this.Mt = null;
            this.Vt = null;
            this.jt = null;
        }
    }
    toString() {
        return `VPA(state:${$state(this._state)},plan:'${this.At}',n:${this.Mt},c:${this.Ot},viewport:${this.viewport})`;
    }
    te() {
        this.Pt?.te();
    }
    Ht(t) {
        throw new Error(getMessage(3352, t, this));
    }
}

function ensureGuardsResultIsTrue(t, e) {
    if (e.guardsResult !== true) throw new Error(getMessage(3353, e.guardsResult, t));
}

function ensureTransitionHasNotErrored(t) {
    if (t.error !== void 0 && !t.erredWithUnknownRoute) throw t.error;
}

const m = new Map;

function $state(t) {
    let e = m.get(t);
    if (e === void 0) {
        m.set(t, e = stringifyState(t));
    }
    return e;
}

function stringifyState(t) {
    const e = [];
    if ((t & 8192) === 8192) {
        e.push("currIsEmpty");
    }
    if ((t & 4096) === 4096) {
        e.push("currIsActive");
    }
    if ((t & 2048) === 2048) {
        e.push("currCanUnload");
    }
    if ((t & 1024) === 1024) {
        e.push("currCanUnloadDone");
    }
    if ((t & 512) === 512) {
        e.push("currUnload");
    }
    if ((t & 256) === 256) {
        e.push("currUnloadDone");
    }
    if ((t & 128) === 128) {
        e.push("currDeactivate");
    }
    if ((t & 64) === 64) {
        e.push("nextIsEmpty");
    }
    if ((t & 32) === 32) {
        e.push("nextIsScheduled");
    }
    if ((t & 16) === 16) {
        e.push("nextCanLoad");
    }
    if ((t & 8) === 8) {
        e.push("nextCanLoadDone");
    }
    if ((t & 4) === 4) {
        e.push("nextLoad");
    }
    if ((t & 2) === 2) {
        e.push("nextLoadDone");
    }
    if ((t & 1) === 1) {
        e.push("nextActivate");
    }
    return e.join("|");
}

class RouteNode {
    get root() {
        return this.ae.root;
    }
    get isInstructionsFinalized() {
        return this.ce;
    }
    constructor(t, e, s, i, n, r, o, a, c, u, h, l, f) {
        this.path = t;
        this.finalPath = e;
        this.context = s;
        this.ue = i;
        this.instruction = n;
        this.params = r;
        this.queryParams = o;
        this.fragment = a;
        this.data = c;
        this.he = u;
        this.title = h;
        this.component = l;
        this.residue = f;
        this.le = 1;
        this.ce = false;
        this.children = [];
        this.ue ??= n;
    }
    static create(e) {
        const {[s.RESIDUE]: i, ...n} = e.params ?? {};
        return new RouteNode(e.path, e.finalPath, e.context, e.originalInstruction ?? e.instruction, e.instruction, Object.freeze(n), e.queryParams ?? v, e.fragment ?? null, Object.freeze(e.data ?? t.emptyObject), e.he ?? null, e.title ?? null, e.component, e.residue ?? []);
    }
    contains(t, e = false) {
        if (this.context === t.options.context) {
            const s = this.children;
            const i = t.children;
            for (let t = 0, n = s.length; t < n; ++t) {
                for (let r = 0, o = i.length; r < o; ++r) {
                    const a = i[r];
                    const c = e ? a.recognizedRoute?.route.endpoint : null;
                    const u = s[t + r] ?? null;
                    const h = u !== null ? u.isInstructionsFinalized ? u.instruction : u.ue : null;
                    const l = h?.recognizedRoute?.route.endpoint;
                    if (t + r < n && ((c?.equalsOrResidual(l) ?? false) || (h?.contains(a) ?? false))) {
                        if (r + 1 === o) {
                            return true;
                        }
                    } else {
                        break;
                    }
                }
            }
        }
        return this.children.some((function(s) {
            return s.contains(t, e);
        }));
    }
    fe(t) {
        this.children.push(t);
        t.pe(this.ae);
    }
    ge() {
        for (const t of this.children) {
            t.ge();
            t.context.vpa.re();
        }
        this.children.length = 0;
    }
    getTitle(t) {
        const e = [ ...this.children.map((e => e.getTitle(t))), typeof this.title === "function" ? this.title.call(void 0, this) : this.title ].filter((t => t !== null));
        return e.length === 0 ? null : e.join(t);
    }
    computeAbsolutePath() {
        if (this.context.isRoot) {
            return "";
        }
        const t = this.context.parent.node.computeAbsolutePath();
        const e = this.instruction.toUrlComponent(false);
        return t.length > 0 ? e.length > 0 ? `${t}/${e}` : t : e;
    }
    pe(t) {
        this.ae = t;
        for (const e of this.children) {
            e.pe(t);
        }
    }
    de() {
        this.ce = true;
        const t = this.children.map((t => t.de()));
        const e = this.instruction.it();
        e.children.splice(0, e.children.length, ...t);
        return this.instruction = e;
    }
    it() {
        const t = new RouteNode(this.path, this.finalPath, this.context, this.ue, this.instruction, this.params, this.queryParams, this.fragment, this.data, this.he, this.title, this.component, [ ...this.residue ]);
        const e = this.children;
        const s = e.length;
        for (let i = 0; i < s; ++i) {
            t.children.push(e[i].it());
        }
        t.le = this.le + 1;
        if (t.context.node === this) {
            t.context.node = t;
        }
        return t;
    }
    toString() {
        const t = [];
        const e = this.context?.config.component?.name ?? "";
        if (e.length > 0) {
            t.push(`c:'${e}'`);
        }
        const s = this.context?.config.path ?? "";
        if (s.length > 0) {
            t.push(`path:'${s}'`);
        }
        if (this.children.length > 0) {
            t.push(`children:[${this.children.map(String).join(",")}]`);
        }
        if (this.residue.length > 0) {
            t.push(`residue:${this.residue.map((function(t) {
                if (typeof t === "string") {
                    return `'${t}'`;
                }
                return String(t);
            })).join(",")}`);
        }
        return `RN(ctx:'${this.context?.Ut}',${t.join(",")})`;
    }
}

class RouteTree {
    constructor(t, e, s, i) {
        this.options = t;
        this.queryParams = e;
        this.fragment = s;
        this.root = i;
    }
    contains(t, e = false) {
        return this.root.contains(t, e);
    }
    it() {
        const t = new RouteTree(this.options.it(), this.queryParams, this.fragment, this.root.it());
        t.root.pe(this);
        return t;
    }
    we() {
        return new ViewportInstructionTree(this.options, true, this.root.children.map((t => t.de())), this.queryParams, this.fragment);
    }
    me(t) {
        this.queryParams = Object.freeze(mergeURLSearchParams(this.queryParams, t, true));
    }
    toString() {
        return this.root.toString();
    }
}

function createAndAppendNodes(e, s, i) {
    e.trace(`createAndAppendNodes(node:%s,vi:%s`, s, i);
    switch (i.component.type) {
      case 0:
        switch (i.component.value) {
          case "..":
            s = s.context.parent?.node ?? s;
            s.ge();

          case ".":
            return t.onResolveAll(...i.children.map((t => createAndAppendNodes(e, s, t))));

          default:
            {
                e.trace(`createAndAppendNodes invoking createNode`);
                const n = s.context;
                const r = i.it();
                let o = i.recognizedRoute;
                if (o !== null) return appendNode(e, s, createConfiguredNode(e, s, i, o, r));
                if (i.children.length === 0) {
                    const t = n.ve(i);
                    if (t !== null) {
                        s.ae.me(t.query);
                        const n = t.vi;
                        n.children.push(...i.children);
                        return appendNode(e, s, createConfiguredNode(e, s, n, n.recognizedRoute, i));
                    }
                }
                let a = 0;
                let c = i.component.value;
                let u = i;
                while (u.children.length === 1) {
                    u = u.children[0];
                    if (u.component.type === 0) {
                        ++a;
                        c = `${c}/${u.component.value}`;
                    } else {
                        break;
                    }
                }
                o = n.recognize(c);
                e.trace("createNode recognized route: %s", o);
                const h = o?.residue ?? null;
                e.trace("createNode residue:", h);
                const l = h === null;
                if (o === null || h === c) {
                    const r = n.ve({
                        component: i.component.value,
                        params: i.params ?? t.emptyObject,
                        open: i.open,
                        close: i.close,
                        viewport: i.viewport,
                        children: i.children
                    });
                    if (r !== null) {
                        s.ae.me(r.query);
                        return appendNode(e, s, createConfiguredNode(e, s, r.vi, r.vi.recognizedRoute, i));
                    }
                    const o = i.component.value;
                    if (o === "") return;
                    let a = i.viewport;
                    if (a === null || a.length === 0) a = S;
                    const c = n.getFallbackViewportAgent(a);
                    const u = c !== null ? c.viewport.nt(i, s, n) : n.config.nt(i, s, n);
                    if (u === null) throw new UnknownRouteError(getMessage(3401, o, n.Ut, a, o, n.component.name));
                    if (typeof u === "string") {
                        e.trace(`Fallback is set to '${u}'. Looking for a recognized route.`);
                        const t = n.childRoutes.find((t => t.id === u));
                        if (t !== void 0) return appendNode(e, s, createFallbackNode(e, t, s, i));
                        e.trace(`No route configuration for the fallback '${u}' is found; trying to recognize the route.`);
                        const r = n.recognize(u, true);
                        if (r !== null && r.residue !== u) return appendNode(e, s, createConfiguredNode(e, s, i, r, null));
                    }
                    e.trace(`The fallback '${u}' is not recognized as a route; treating as custom element name.`);
                    return t.onResolve(resolveRouteConfiguration(u, false, n.config, null, n), (t => appendNode(e, s, createFallbackNode(e, t, s, i))));
                }
                o.residue = null;
                i.component.value = l ? c : c.slice(0, -(h.length + 1));
                let f = !l;
                for (let t = 0; t < a; ++t) {
                    const t = i.children[0];
                    if (h?.startsWith(t.component.value) ?? false) {
                        f = false;
                        break;
                    }
                    i.viewport = t.viewport;
                    i.children = t.children;
                }
                if (f) {
                    i.children.unshift(ViewportInstruction.create(h));
                }
                i.recognizedRoute = o;
                e.trace("createNode after adjustment vi:%s", i);
                return appendNode(e, s, createConfiguredNode(e, s, i, o, r));
            }
        }

      case 3:
      case 4:
      case 2:
        {
            const n = s.context;
            return t.onResolve(resolveCustomElementDefinition(i.component.value, n)[1], (r => {
                const {vi: o, query: a} = n.ve({
                    component: r,
                    params: i.params ?? t.emptyObject,
                    open: i.open,
                    close: i.close,
                    viewport: i.viewport,
                    children: i.children
                });
                s.ae.me(a);
                return appendNode(e, s, createConfiguredNode(e, s, o, o.recognizedRoute, i));
            }));
        }
    }
}

function createConfiguredNode(e, s, i, n, r, o = n.route.endpoint.route) {
    const a = s.context;
    const c = s.ae;
    return t.onResolve(o.handler, (u => {
        o.handler = u;
        e.trace(`creatingConfiguredNode(rdc:%s, vi:%s)`, u, i);
        if (u.redirectTo === null) {
            const h = (i.viewport?.length ?? 0) > 0;
            const l = h ? i.viewport : u.viewport;
            return t.onResolve(resolveCustomElementDefinition(u.J(i, a, s, n.route), a)[1], (f => {
                const p = a.Ee(new ViewportRequest(l, f.name));
                if (!h) {
                    i.viewport = p.viewport.name;
                }
                const g = a.container.get(E);
                return t.onResolve(g.getRouteContext(p, f, null, p.hostController.container, a.config, a, u), (t => {
                    e.trace("createConfiguredNode setting the context node");
                    const a = t.node = RouteNode.create({
                        path: n.route.endpoint.route.path,
                        finalPath: o.path,
                        context: t,
                        instruction: i,
                        originalInstruction: r,
                        params: n.route.params,
                        queryParams: c.queryParams,
                        fragment: c.fragment,
                        data: u.data,
                        he: l,
                        component: f,
                        title: u.title,
                        residue: i.children.slice()
                    });
                    a.pe(s.ae);
                    e.trace(`createConfiguredNode(vi:%s) -> %s`, i, a);
                    return a;
                }));
            }));
        }
        const h = RouteExpression.parse(x.parse(o.path));
        const l = RouteExpression.parse(x.parse(u.redirectTo));
        let f;
        let p;
        const g = [];
        switch (h.root.kind) {
          case "ScopedSegment":
          case "Segment":
            f = h.root;
            break;

          default:
            throw new Error(getMessage(3502, h.root.kind));
        }
        switch (l.root.kind) {
          case "ScopedSegment":
          case "Segment":
            p = l.root;
            break;

          default:
            throw new Error(getMessage(3502, l.root.kind));
        }
        let d;
        let w;
        let m = false;
        let v = false;
        while (!(m && v)) {
            if (m) {
                d = null;
            } else if (f.kind === "Segment") {
                d = f;
                m = true;
            } else if (f.left.kind === "Segment") {
                d = f.left;
                switch (f.right.kind) {
                  case "ScopedSegment":
                  case "Segment":
                    f = f.right;
                    break;

                  default:
                    throw new Error(getMessage(3502, f.right.kind));
                }
            } else {
                throw new Error(getMessage(3502, f.left.kind));
            }
            if (v) {
                w = null;
            } else if (p.kind === "Segment") {
                w = p;
                v = true;
            } else if (p.left.kind === "Segment") {
                w = p.left;
                switch (p.right.kind) {
                  case "ScopedSegment":
                  case "Segment":
                    p = p.right;
                    break;

                  default:
                    throw new Error(getMessage(3502, p.right.kind));
                }
            } else {
                throw new Error(getMessage(3502, p.left.kind));
            }
            if (w !== null) {
                if (w.component.isDynamic && (d?.component.isDynamic ?? false)) {
                    g.push(n.route.params[w.component.parameterName]);
                } else {
                    g.push(w.component.name);
                }
            }
        }
        const y = g.filter(Boolean).join("/");
        const R = a.recognize(y);
        if (R === null) throw new UnknownRouteError(getMessage(3402, y, a.Ut, y, a.component.name));
        return createConfiguredNode(e, s, ViewportInstruction.create({
            recognizedRoute: R,
            component: y,
            children: i.children,
            viewport: i.viewport,
            open: i.open,
            close: i.close
        }), R, r);
    }));
}

function appendNode(e, s, i) {
    return t.onResolve(i, (t => {
        e.trace(`appendNode($childNode:%s)`, t);
        s.fe(t);
        return t.context.vpa.ie(s.ae.options, t);
    }));
}

function createFallbackNode(e, i, n, r) {
    const o = new $RecognizedRoute(new s.RecognizedRoute(new s.Endpoint(new s.ConfigurableRoute(i.path[0], i.caseSensitive, i), []), t.emptyObject), null);
    r.children.length = 0;
    return createConfiguredNode(e, n, r, o, null);
}

const v = Object.freeze(new URLSearchParams);

function isManagedState(e) {
    return t.isObjectOrFunction(e) && Object.prototype.hasOwnProperty.call(e, a) === true;
}

function toManagedState(t, e) {
    return {
        ...t,
        [a]: e
    };
}

class UnknownRouteError extends Error {}

class Transition {
    get erredWithUnknownRoute() {
        return this.xe;
    }
    constructor(t, e, s, i, n, r, o, a, c, u, h, l, f, p, g) {
        this.id = t;
        this.prevInstructions = e;
        this.instructions = s;
        this.finalInstructions = i;
        this.instructionsChanged = n;
        this.trigger = r;
        this.options = o;
        this.managedState = a;
        this.previousRouteTree = c;
        this.routeTree = u;
        this.promise = h;
        this.resolve = l;
        this.reject = f;
        this.guardsResult = p;
        this.error = g;
        this.xe = false;
    }
    static Z(t) {
        return new Transition(t.id, t.prevInstructions, t.instructions, t.finalInstructions, t.instructionsChanged, t.trigger, t.options, t.managedState, t.previousRouteTree, t.routeTree, t.promise, t.resolve, t.reject, t.guardsResult, void 0);
    }
    Zt(t, e) {
        if (this.guardsResult !== true) {
            return;
        }
        try {
            const s = t();
            if (s instanceof Promise) {
                s.then(e).catch((t => {
                    this.Qt(t);
                }));
            } else {
                e(s);
            }
        } catch (t) {
            this.Qt(t);
        }
    }
    Qt(t) {
        this.xe = t instanceof UnknownRouteError;
        this.reject(this.error = t);
    }
    toString() {
        return `T(id:${this.id},trigger:'${this.trigger}',instructions:${this.instructions})`;
    }
}

const E = /*@__PURE__*/ t.DI.createInterface("IRouter", (t => t.singleton(Router)));

class Router {
    get ye() {
        const t = this.Re;
        if (t !== null) return t;
        if (!this.c.has(b, true)) throw new Error(getMessage(3271));
        return this.Re = this.c.get(b);
    }
    get routeTree() {
        let t = this.Se;
        if (t === null) {
            const s = this.ye;
            t = this.Se = new RouteTree(NavigationOptions.create(this.options, {}), v, null, RouteNode.create({
                path: "",
                finalPath: "",
                context: s,
                instruction: null,
                component: e.CustomElement.getDefinition(s.config.component),
                title: s.config.title
            }));
        }
        return t;
    }
    get currentTr() {
        return this.be ??= Transition.Z({
            id: 0,
            prevInstructions: this.Ce,
            instructions: this.Ce,
            finalInstructions: this.Ce,
            instructionsChanged: true,
            trigger: "api",
            options: NavigationOptions.create(this.options, {}),
            managedState: null,
            previousRouteTree: this.routeTree.it(),
            routeTree: this.routeTree,
            resolve: null,
            reject: null,
            promise: null,
            guardsResult: true,
            error: void 0
        });
    }
    set currentTr(t) {
        this.be = t;
    }
    get isNavigating() {
        return this.Ne;
    }
    constructor() {
        this.Re = null;
        this.Se = null;
        this.be = null;
        this.ke = false;
        this.$e = 0;
        this._e = null;
        this.Te = null;
        this.Ie = false;
        this.Ne = false;
        this.c = t.resolve(t.IContainer);
        this.Pe = t.resolve(e.IPlatform);
        this.L = t.resolve(t.ILogger).root.scopeTo("Router");
        this.I = t.resolve(c);
        this.Ve = t.resolve(h);
        this.options = t.resolve(R);
        this.Ae = new Map;
        this.Ce = ViewportInstructionTree.create("", this.options);
        this.c.registerResolver(Router, t.Registration.instance(Router, this));
    }
    Oe(t) {
        return RouteContext.resolve(this.ye, t);
    }
    start(t) {
        this.Ie = typeof this.options.buildTitle === "function";
        this.Ve.startListening();
        this.Te = this.I.subscribe("au:router:location-change", (t => {
            this.Pe.taskQueue.queueTask((() => {
                const e = isManagedState(t.state) ? t.state : null;
                const s = this.options;
                const i = NavigationOptions.create(s, {
                    historyStrategy: "replace"
                });
                const n = ViewportInstructionTree.create(t.url, s, i, this.ye);
                this.Me(n, t.trigger, e, null);
            }));
        }));
        if (!this.ke && t) {
            return this.load(this.Ve.getPath(), {
                historyStrategy: this.options.historyStrategy !== "none" ? "replace" : "none"
            });
        }
    }
    stop() {
        this.Ve.stopListening();
        this.Te?.dispose();
    }
    load(t, e) {
        const s = this.createViewportInstructions(t, e);
        return this.Me(s, "api", null, null);
    }
    isActive(t, e) {
        const s = this.Oe(e);
        const i = t instanceof ViewportInstructionTree ? t : this.createViewportInstructions(t, {
            context: s,
            historyStrategy: this.options.historyStrategy
        });
        return this.routeTree.contains(i, false);
    }
    getRouteContext(e, s, i, n, r, o, a) {
        return t.onResolve(a instanceof RouteConfig ? a : resolveRouteConfiguration(typeof i?.getRouteConfig === "function" ? i : s.Type, false, r, null, o), (t => {
            let i = this.Ae.get(e);
            if (i === void 0) {
                this.Ae.set(e, i = new WeakMap);
            }
            let r = i.get(t);
            if (r !== void 0) {
                return r;
            }
            const o = n.has(b, true) ? n.get(b) : null;
            i.set(t, r = new RouteContext(e, o, s, t, n, this));
            return r;
        }));
    }
    createViewportInstructions(t, e) {
        if (t instanceof ViewportInstructionTree) return t;
        let s = e?.context ?? null;
        if (typeof t === "string") {
            t = this.Ve.removeBaseHref(t);
        }
        const i = isPartialViewportInstruction(t);
        let n = i ? t.component : t;
        if (typeof n === "string" && n.startsWith("../") && s !== null) {
            s = this.Oe(s);
            while (n.startsWith("../") && (s?.parent ?? null) !== null) {
                n = n.slice(3);
                s = s.parent;
            }
        }
        if (i) {
            t.component = n;
        } else {
            t = n;
        }
        const r = this.options;
        return ViewportInstructionTree.create(t, r, NavigationOptions.create(r, {
            ...e,
            context: s
        }), this.ye);
    }
    Me(t, e, s, i) {
        const n = this.currentTr;
        const r = this.L;
        if (e !== "api" && n.trigger === "api" && n.instructions.equals(t)) {
            return true;
        }
        let o = void 0;
        let a = void 0;
        let c;
        const u = this.options.restorePreviousRouteTreeOnError;
        if (i === null || i.erredWithUnknownRoute || i.error != null && u) {
            c = new Promise((function(t, e) {
                o = t;
                a = e;
            }));
        } else {
            c = i.promise;
            o = i.resolve;
            a = i.reject;
        }
        const h = this._e = Transition.Z({
            id: ++this.$e,
            trigger: e,
            managedState: s,
            prevInstructions: n.finalInstructions,
            finalInstructions: t,
            instructionsChanged: !n.finalInstructions.equals(t),
            instructions: t,
            options: t.options,
            promise: c,
            resolve: o,
            reject: a,
            previousRouteTree: this.routeTree,
            routeTree: this.Se = this.routeTree.it(),
            guardsResult: true,
            error: void 0
        });
        if (!this.Ne) {
            try {
                this.Zt(h);
            } catch (t) {
                h.Qt(t);
            }
        }
        return h.promise.then((t => t)).catch((t => {
            error(r, 3270, h, t);
            if (h.erredWithUnknownRoute) {
                this.je(h);
            } else {
                this.Ne = false;
                this.I.publish(new NavigationErrorEvent(h.id, h.instructions, t));
                if (u) {
                    this.je(h);
                } else {
                    const t = this._e;
                    if (t !== null) {
                        t.previousRouteTree = h.previousRouteTree;
                    } else {
                        this.Se = h.previousRouteTree;
                    }
                }
            }
            throw t;
        }));
    }
    Zt(e) {
        this.currentTr = e;
        this._e = null;
        this.Ne = true;
        let s = this.Oe(e.options.context);
        this.I.publish(new NavigationStartEvent(e.id, e.instructions, e.trigger, e.managedState));
        if (this._e !== null) {
            return this.Zt(this._e);
        }
        e.Zt((() => {
            const i = e.finalInstructions;
            const n = this.ye;
            const r = e.routeTree;
            r.options = i.options;
            r.queryParams = n.node.ae.queryParams = i.queryParams;
            r.fragment = n.node.ae.fragment = i.fragment;
            const o = /*@__PURE__*/ s.container.get(t.ILogger).scopeTo("RouteTree");
            if (i.isAbsolute) {
                s = n;
            }
            if (s === n) {
                r.root.pe(r);
                n.node = r.root;
            }
            const a = s.allResolved instanceof Promise ? " - awaiting promise" : "";
            o.trace(`updateRouteTree(rootCtx:%s,rt:%s,vit:%s)${a}`, n, r, i);
            return t.onResolve(s.allResolved, (() => updateNode(o, i, s, n.node)));
        }), (() => {
            const t = e.previousRouteTree.root.children;
            const s = e.routeTree.root.children;
            const i = mergeDistinct(t, s);
            Batch.C((s => {
                for (const i of t) {
                    i.context.vpa.Wt(e, s);
                }
            })).T((t => {
                if (e.guardsResult !== true) {
                    t.N();
                    this.je(e);
                }
            })).T((t => {
                for (const i of s) {
                    i.context.vpa.Jt(e, t);
                }
            })).T((t => {
                if (e.guardsResult !== true) {
                    t.N();
                    this.je(e);
                }
            })).T((s => {
                for (const i of t) {
                    i.context.vpa.Xt(e, s);
                }
            })).T((t => {
                for (const i of s) {
                    i.context.vpa.Yt(e, t);
                }
            })).T((t => {
                for (const s of i) {
                    s.context.vpa.se(e, t);
                }
            })).T((t => {
                if (e.guardsResult !== true) {
                    t.N();
                    this.je(e);
                }
            })).T((() => {
                i.forEach((function(t) {
                    t.context.vpa.oe();
                }));
                this.ke = true;
                this.Ce = e.finalInstructions = e.routeTree.we();
                this.Ne = false;
                const t = e.finalInstructions.toUrl(true, this.options.Le);
                switch (e.options.Ue(this.Ce)) {
                  case "none":
                    break;

                  case "push":
                    this.Ve.pushState(toManagedState(e.options.state, e.id), this.updateTitle(e), t);
                    break;

                  case "replace":
                    this.Ve.replaceState(toManagedState(e.options.state, e.id), this.updateTitle(e), t);
                    break;
                }
                this.I.publish(new NavigationEndEvent(e.id, e.instructions, this.Ce));
                e.resolve(true);
                this.ze();
            })).C();
        }));
    }
    updateTitle(t = this.currentTr) {
        const e = this.Be(t);
        if (e.length > 0) {
            this.Pe.document.title = e;
        }
        return this.Pe.document.title;
    }
    Be(t = this.currentTr) {
        let e;
        if (this.Ie) {
            e = this.options.buildTitle(t) ?? "";
        } else {
            switch (typeof t.options.title) {
              case "function":
                e = t.options.title.call(void 0, t.routeTree.root) ?? "";
                break;

              case "string":
                e = t.options.title;
                break;

              default:
                e = t.routeTree.root.getTitle(t.options.titleSeparator) ?? "";
                break;
            }
        }
        return e;
    }
    je(e) {
        const s = e.previousRouteTree.root.children;
        const i = e.routeTree.root.children;
        const n = mergeDistinct(s, i);
        n.forEach((function(t) {
            t.context.vpa.re();
        }));
        this.Ce = e.prevInstructions;
        this.Se = e.previousRouteTree;
        this.Ne = false;
        const r = e.guardsResult;
        this.I.publish(new NavigationCancelEvent(e.id, e.instructions, `guardsResult is ${r}`));
        if (r === false) {
            e.resolve(false);
            this.ze();
        } else {
            let s;
            if (this.ke && (e.erredWithUnknownRoute || e.error != null && this.options.restorePreviousRouteTreeOnError)) s = e.prevInstructions; else if (r === true) return; else s = r;
            void t.onResolve(this.Me(s, "api", e.managedState, e), (() => {}));
        }
    }
    ze() {
        if (this._e === null) return;
        this.Pe.taskQueue.queueTask((() => {
            const t = this._e;
            if (t === null) return;
            try {
                this.Zt(t);
            } catch (e) {
                t.Qt(e);
            }
        }));
    }
}

function updateNode(e, s, i, n) {
    e.trace(`updateNode(ctx:%s,node:%s)`, i, n);
    n.queryParams = s.queryParams;
    n.fragment = s.fragment;
    if (!n.context.isRoot) {
        n.context.vpa.ie(n.ae.options, n);
    }
    if (n.context === i) {
        n.ge();
        return t.onResolve(t.onResolveAll(...s.children.map((t => createAndAppendNodes(e, n, t)))), (() => t.onResolveAll(...i.getAvailableViewportAgents().reduce(((t, s) => {
            const i = s.viewport;
            const r = i.default;
            if (r === null) return t;
            t.push(createAndAppendNodes(e, n, ViewportInstruction.create({
                component: r,
                viewport: i.name
            })));
            return t;
        }), []))));
    }
    return t.onResolveAll(...n.children.map((t => updateNode(e, s, i, t))));
}

class ParsedUrl {
    constructor(t, e, s) {
        this.path = t;
        this.query = e;
        this.fragment = s;
        this.id = `${t}?${e?.toString() ?? ""}#${s ?? ""}`;
    }
    toString() {
        return this.id;
    }
    static Z(t) {
        let e = null;
        const s = t.indexOf("#");
        if (s >= 0) {
            const i = t.slice(s + 1);
            e = decodeURIComponent(i);
            t = t.slice(0, s);
        }
        let i = null;
        const n = t.indexOf("?");
        if (n >= 0) {
            const e = t.slice(n + 1);
            t = t.slice(0, n);
            i = Object.freeze(new URLSearchParams(e));
        }
        return new ParsedUrl(t, i ?? v, e);
    }
}

function stringify(t, e, s) {
    let i;
    if (typeof t === "string") {
        i = t;
    } else {
        i = t.path;
        e = t.query;
        s = t.fragment;
    }
    e ??= v;
    let n = e.toString();
    n = n === "" ? "" : `?${n}`;
    const r = s != null && s.length > 0 ? `#${encodeURIComponent(s)}` : "";
    return `${i}${n}${r}`;
}

const x = Object.freeze({
    parse(t) {
        return ParsedUrl.Z(t);
    },
    stringify(t, e, s) {
        return stringify(t, e, s);
    }
});

const y = Object.freeze({
    parse(t) {
        const e = t.indexOf("#");
        if (e >= 0) {
            const s = t.slice(e + 1);
            t = decodeURIComponent(s);
        }
        return ParsedUrl.Z(t);
    },
    stringify(t, e, s) {
        return `/#/${stringify(t, e, s)}`;
    }
});

function valueOrFuncToValue(t, e) {
    if (typeof e === "function") {
        return e(t);
    }
    return e;
}

const R = /*@__PURE__*/ t.DI.createInterface("RouterOptions");

class RouterOptions {
    constructor(t, e, s, i, n, r, o) {
        this.useUrlFragmentHash = t;
        this.useHref = e;
        this.historyStrategy = s;
        this.buildTitle = i;
        this.useNavigationModel = n;
        this.activeClass = r;
        this.restorePreviousRouteTreeOnError = o;
        this.Le = t ? y : x;
    }
    static create(t) {
        return new RouterOptions(t.useUrlFragmentHash ?? false, t.useHref ?? true, t.historyStrategy ?? "push", t.buildTitle ?? null, t.useNavigationModel ?? true, t.activeClass ?? null, t.restorePreviousRouteTreeOnError ?? true);
    }
    toString() {
        return "RO";
    }
}

class NavigationOptions {
    constructor(t, e, s, i, n, r, o, a) {
        this.historyStrategy = t;
        this.title = e;
        this.titleSeparator = s;
        this.context = i;
        this.queryParams = n;
        this.fragment = r;
        this.state = o;
        this.transitionPlan = a;
    }
    static create(t, e) {
        return new NavigationOptions(e.historyStrategy ?? t.historyStrategy, e.title ?? null, e.titleSeparator ?? " | ", e.context ?? null, e.queryParams ?? null, e.fragment ?? "", e.state ?? null, e.transitionPlan ?? null);
    }
    it() {
        return new NavigationOptions(this.historyStrategy, this.title, this.titleSeparator, this.context, {
            ...this.queryParams
        }, this.fragment, this.state === null ? null : {
            ...this.state
        }, this.transitionPlan);
    }
    Ue(t) {
        return valueOrFuncToValue(t, this.historyStrategy);
    }
}

const S = "default";

class ViewportInstruction {
    constructor(t, e, s, i, n, r, o) {
        this.open = t;
        this.close = e;
        this.recognizedRoute = s;
        this.component = i;
        this.viewport = n;
        this.params = r;
        this.children = o;
    }
    static create(t) {
        if (t instanceof ViewportInstruction) return t;
        if (isPartialViewportInstruction(t)) {
            const e = TypedNavigationInstruction.create(t.component);
            const s = t.children?.map(ViewportInstruction.create) ?? [];
            return new ViewportInstruction(t.open ?? 0, t.close ?? 0, t.recognizedRoute ?? null, e, t.viewport ?? null, Object.freeze(t.params ?? null), s);
        }
        const e = TypedNavigationInstruction.create(t);
        return new ViewportInstruction(0, 0, null, e, null, null, []);
    }
    contains(t) {
        const e = this.children;
        const s = t.children;
        if (e.length < s.length) {
            return false;
        }
        if (!this.component.equals(t.component)) return false;
        const i = this.viewport ?? null;
        const n = t.viewport ?? null;
        if (i !== null && n !== null && i !== n) return false;
        for (let t = 0, i = s.length; t < i; ++t) {
            if (!e[t].contains(s[t])) {
                return false;
            }
        }
        return true;
    }
    equals(t) {
        const e = this.children;
        const s = t.children;
        if (e.length !== s.length) {
            return false;
        }
        if (!this.component.equals(t.component) || this.viewport !== t.viewport || !shallowEquals(this.params, t.params)) {
            return false;
        }
        for (let t = 0, i = e.length; t < i; ++t) {
            if (!e[t].equals(s[t])) {
                return false;
            }
        }
        return true;
    }
    it() {
        return new ViewportInstruction(this.open, this.close, this.recognizedRoute, this.component.it(), this.viewport, this.params, [ ...this.children ]);
    }
    toUrlComponent(t = true) {
        const e = this.component.toUrlComponent();
        const s = this.viewport;
        const i = e.length === 0 || s === null || s.length === 0 || s === S ? "" : `@${s}`;
        const n = `${"(".repeat(this.open)}${e}${stringifyParams(this.params)}${i}${")".repeat(this.close)}`;
        const r = t ? this.children.map((t => t.toUrlComponent())).join("+") : "";
        return n.length > 0 ? r.length > 0 ? `${n}/${r}` : n : r;
    }
    toString() {
        const t = `c:${this.component}`;
        const e = this.viewport === null || this.viewport.length === 0 ? "" : `viewport:${this.viewport}`;
        const s = this.children.length === 0 ? "" : `children:[${this.children.map(String).join(",")}]`;
        const i = [ t, e, s ].filter(Boolean).join(",");
        return `VPI(${i})`;
    }
}

function stringifyParams(e) {
    if (e === null) return "";
    const s = Object.keys(e);
    const i = s.length;
    if (i === 0) return "";
    const n = Array(i);
    const r = [];
    const o = [];
    for (const e of s) {
        if (t.isArrayIndex(e)) {
            r.push(Number(e));
        } else {
            o.push(e);
        }
    }
    for (let t = 0; t < i; ++t) {
        const s = r.indexOf(t);
        if (s > -1) {
            n[t] = e[t];
            r.splice(s, 1);
        } else {
            const s = o.shift();
            n[t] = `${s}=${e[s]}`;
        }
    }
    return `(${n.join(",")})`;
}

class ViewportInstructionTree {
    constructor(t, e, s, i, n) {
        this.options = t;
        this.isAbsolute = e;
        this.children = s;
        this.queryParams = i;
        this.fragment = n;
        Object.freeze(i);
    }
    static create(e, s, i, n) {
        i = i instanceof NavigationOptions ? i : NavigationOptions.create(s, i ?? t.emptyObject);
        let r = i.context;
        if (!(r instanceof RouteContext) && n != null) {
            r = i.context = RouteContext.resolve(n, r);
        }
        const o = r != null;
        if (e instanceof Array) {
            const s = e.length;
            const n = new Array(s);
            const a = new URLSearchParams(i.queryParams ?? t.emptyObject);
            for (let t = 0; t < s; t++) {
                const s = e[t];
                const i = o ? r.ve(s) : null;
                if (i !== null) {
                    n[t] = i.vi;
                    mergeURLSearchParams(a, i.query, false);
                } else {
                    n[t] = ViewportInstruction.create(s);
                }
            }
            return new ViewportInstructionTree(i, false, n, a, i.fragment);
        }
        if (typeof e === "string") {
            const t = RouteExpression.parse(s.Le.parse(e));
            return t.toInstructionTree(i);
        }
        const a = o ? r.ve(isPartialViewportInstruction(e) ? {
            ...e,
            params: e.params ?? t.emptyObject
        } : {
            component: e,
            params: t.emptyObject
        }) : null;
        const c = new URLSearchParams(i.queryParams ?? t.emptyObject);
        return a !== null ? new ViewportInstructionTree(i, false, [ a.vi ], mergeURLSearchParams(c, a.query, false), i.fragment) : new ViewportInstructionTree(i, false, [ ViewportInstruction.create(e) ], c, i.fragment);
    }
    equals(t) {
        const e = this.children;
        const s = t.children;
        if (e.length !== s.length) {
            return false;
        }
        for (let t = 0, i = e.length; t < i; ++t) {
            if (!e[t].equals(s[t])) {
                return false;
            }
        }
        return true;
    }
    toUrl(t, e) {
        let s = "";
        if (!t) {
            const t = [];
            let e = this.options.context;
            if (e != null && !(e instanceof RouteContext)) throw new Error("Invalid operation; incompatible navigation context.");
            while (e != null && !e.isRoot) {
                const s = e.vpa;
                const i = s._t === 4096 ? s.Ot : s.Mt;
                if (i == null) throw new Error("Invalid operation; nodes of the viewport agent are not set.");
                t.splice(0, 0, i.instruction.toUrlComponent());
                e = e.parent;
            }
            if (t[0] === "") {
                t.splice(0, 1);
            }
            s = t.join("/");
        }
        const i = this.toPath();
        return e.stringify(s.length > 0 ? `${s}/${i}` : i, this.queryParams, this.fragment);
    }
    toPath() {
        return this.children.map((t => t.toUrlComponent())).join("+");
    }
    toString() {
        return `[${this.children.map(String).join(",")}]`;
    }
}

class NavigationStrategy {
    constructor(t) {
        this.getComponent = t;
    }
}

class TypedNavigationInstruction {
    constructor(t, e) {
        this.type = t;
        this.value = e;
    }
    static create(s) {
        if (s instanceof TypedNavigationInstruction) {
            return s;
        }
        if (typeof s === "string") return new TypedNavigationInstruction(0, s);
        if (!t.isObjectOrFunction(s)) expectType("function/class or object", "", s);
        if (s instanceof NavigationStrategy) return new TypedNavigationInstruction(5, s);
        if (typeof s === "function") {
            if (e.CustomElement.isType(s)) {
                const t = e.CustomElement.getDefinition(s);
                return new TypedNavigationInstruction(2, t);
            } else {
                return TypedNavigationInstruction.create(s());
            }
        }
        if (s instanceof Promise) return new TypedNavigationInstruction(3, s);
        if (isPartialViewportInstruction(s)) {
            const t = ViewportInstruction.create(s);
            return new TypedNavigationInstruction(1, t);
        }
        if (e.isCustomElementViewModel(s)) return new TypedNavigationInstruction(4, s);
        if (s instanceof e.CustomElementDefinition) return new TypedNavigationInstruction(2, s);
        if (isPartialCustomElementDefinition(s)) {
            const t = e.CustomElementDefinition.create(s);
            e.CustomElement.define(t);
            return new TypedNavigationInstruction(2, t);
        }
        throw new Error(getMessage(3400, tryStringify(s)));
    }
    equals(t) {
        switch (this.type) {
          case 5:
          case 2:
          case 4:
          case 3:
          case 0:
            return this.type === t.type && this.value === t.value;

          case 1:
            return this.type === t.type && this.value.equals(t.value);
        }
    }
    it() {
        return new TypedNavigationInstruction(this.type, this.value);
    }
    toUrlComponent() {
        switch (this.type) {
          case 2:
            return this.value.name;

          case 4:
          case 3:
          case 5:
            throw new Error(getMessage(3403, this.type));

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

          case 5:
            return `NS`;

          case 3:
            return `Promise`;

          case 4:
            return `VM(name:'${e.CustomElement.getDefinition(this.value.constructor).name}')`;

          case 1:
            return this.value.toString();

          case 0:
            return `'${this.value}'`;
        }
    }
}

class ComponentAgent {
    constructor(e, s, i, n, r) {
        this.He = e;
        this.De = s;
        this.ne = i;
        this.ye = n;
        this.qe = r;
        this.L = s.container.get(t.ILogger).scopeTo(`ComponentAgent<${n.Ut}>`);
        const o = s.lifecycleHooks;
        this.Fe = (o.canLoad ?? []).map((t => t.instance));
        this.Ge = (o.loading ?? []).map((t => t.instance));
        this.We = (o.canUnload ?? []).map((t => t.instance));
        this.Qe = (o.unloading ?? []).map((t => t.instance));
        this.Je = "canLoad" in e;
        this.Ke = "loading" in e;
        this.Xe = "canUnload" in e;
        this.Ye = "unloading" in e;
    }
    Bt(t, s) {
        const i = this.De;
        const n = this.ye.vpa.hostController;
        switch (i.mountTarget) {
          case e.MountTarget.host:
          case e.MountTarget.shadowRoot:
            n.host.appendChild(i.host);
            break;

          case e.MountTarget.location:
            n.host.append(i.location.$start, i.location);
            break;

          case e.MountTarget.none:
            throw new Error("Invalid mount target for routed component");
        }
        if (t === null) {
            return this.De.activate(this.De, s);
        }
        void this.De.activate(t, s);
    }
    qt(t, e) {
        const s = this.De;
        s.host?.remove();
        s.location?.remove();
        s.location?.$start?.remove();
        if (t === null) {
            return s.deactivate(s, e);
        }
        void s.deactivate(t, e);
    }
    te() {
        this.De.dispose();
    }
    Wt(t, e, s) {
        s.N();
        let i = Promise.resolve();
        for (const n of this.We) {
            s.N();
            i = i.then((() => new Promise((i => {
                if (t.guardsResult !== true) {
                    s.$();
                    i();
                    return;
                }
                t.Zt((() => n.canUnload(this.He, e, this.ne)), (e => {
                    if (t.guardsResult === true && e === false) {
                        t.guardsResult = false;
                    }
                    s.$();
                    i();
                }));
            }))));
        }
        if (this.Xe) {
            s.N();
            i = i.then((() => {
                if (t.guardsResult !== true) {
                    s.$();
                    return;
                }
                t.Zt((() => this.He.canUnload(e, this.ne)), (e => {
                    if (t.guardsResult === true && e === false) {
                        t.guardsResult = false;
                    }
                    s.$();
                }));
            }));
        }
        s.$();
    }
    Jt(t, e, s) {
        const i = this.ye.root;
        s.N();
        let n = Promise.resolve();
        for (const r of this.Fe) {
            s.N();
            n = n.then((() => new Promise((n => {
                if (t.guardsResult !== true) {
                    s.$();
                    n();
                    return;
                }
                t.Zt((() => r.canLoad(this.He, e.params, e, this.ne)), (e => {
                    if (t.guardsResult === true && e != null && e !== true) {
                        t.guardsResult = e === false ? false : ViewportInstructionTree.create(e, this.qe, void 0, i);
                    }
                    s.$();
                    n();
                }));
            }))));
        }
        if (this.Je) {
            s.N();
            n = n.then((() => {
                if (t.guardsResult !== true) {
                    s.$();
                    return;
                }
                t.Zt((() => this.He.canLoad(e.params, e, this.ne)), (e => {
                    if (t.guardsResult === true && e != null && e !== true) {
                        t.guardsResult = e === false ? false : ViewportInstructionTree.create(e, this.qe, void 0, i);
                    }
                    s.$();
                }));
            }));
        }
        s.$();
    }
    Xt(t, e, s) {
        s.N();
        for (const i of this.Qe) {
            t.Zt((() => {
                s.N();
                return i.unloading(this.He, e, this.ne);
            }), (() => {
                s.$();
            }));
        }
        if (this.Ye) {
            t.Zt((() => {
                s.N();
                return this.He.unloading(e, this.ne);
            }), (() => {
                s.$();
            }));
        }
        s.$();
    }
    Yt(t, e, s) {
        s.N();
        for (const i of this.Ge) {
            t.Zt((() => {
                s.N();
                return i.loading(this.He, e.params, e, this.ne);
            }), (() => {
                s.$();
            }));
        }
        if (this.Ke) {
            t.Zt((() => {
                s.N();
                return this.He.loading(e.params, e, this.ne);
            }), (() => {
                s.$();
            }));
        }
        s.$();
    }
}

const b = /*@__PURE__*/ t.DI.createInterface("IRouteContext");

const C = Object.freeze([ "string", "object", "function" ]);

function isEagerInstruction(t) {
    if (t == null) return false;
    const e = t.params;
    const s = t.component;
    return typeof e === "object" && e !== null && s != null && C.includes(typeof s) && !(s instanceof Promise);
}

class RouteContext {
    get isRoot() {
        return this.parent === null;
    }
    get depth() {
        return this.path.length - 1;
    }
    get allResolved() {
        return this.Ze;
    }
    get node() {
        const t = this.ts;
        if (t === null) throw new Error(getMessage(3171, this));
        return t;
    }
    set node(t) {
        const e = this.es = this.ts;
        if (e !== t) {
            this.ts = t;
        }
    }
    get vpa() {
        const t = this.ss;
        if (t === null) throw new Error(getMessage(3172, this));
        return t;
    }
    get navigationModel() {
        return this.ns;
    }
    constructor(i, r, o, a, u, h) {
        this.parent = r;
        this.component = o;
        this.config = a;
        this.rs = h;
        this.os = [];
        this.childRoutes = [];
        this.Ze = null;
        this.es = null;
        this.ts = null;
        this.cs = false;
        this.ss = i;
        if (r === null) {
            this.root = this;
            this.path = [ this ];
            this.Ut = o.name;
        } else {
            this.root = r.root;
            this.path = [ ...r.path, this ];
            this.Ut = `${r.Ut}/${o.name}`;
        }
        this.L = u.get(t.ILogger).scopeTo(`RouteContext<${this.Ut}>`);
        const l = u.get(n.IObserverLocator).getObserver(this.rs, "isNavigating");
        const f = {
            handleChange: (t, e) => {
                if (t !== true) return;
                this.config.rt();
                for (const t of this.childRoutes) {
                    if (t instanceof Promise) continue;
                    t.rt();
                }
            }
        };
        l.subscribe(f);
        this.us = () => l.unsubscribe(f);
        this.ls = u.get(t.IModuleLoader);
        const p = this.container = u.createChild();
        this.p = p.get(e.IPlatform);
        p.registerResolver(e.IController, this.ps = new t.InstanceProvider, true);
        const g = new t.InstanceProvider("IRouteContext", this);
        p.registerResolver(b, g);
        p.registerResolver(RouteContext, g);
        this.gs = new s.RouteRecognizer;
        if (h.options.useNavigationModel) {
            const t = this.ns = new NavigationModel([]);
            p.get(c).subscribe("au:router:navigation-end", (() => t.ds(h, this)));
        } else {
            this.ns = null;
        }
        this.ws(a);
    }
    ws(e) {
        const s = [];
        const i = e.routes ?? l;
        const n = i.length;
        if (n === 0) {
            const t = e.component.prototype?.getRouteConfig;
            this.cs = t == null ? true : typeof t !== "function";
            return;
        }
        const r = this.ns;
        const o = r !== null;
        let a = 0;
        for (;a < n; a++) {
            const n = i[a];
            if (n instanceof Promise) {
                s.push(this.Es(n));
                continue;
            }
            const c = resolveRouteConfiguration(n, true, e, null, this);
            if (c instanceof Promise) {
                if (!isPartialChildRouteConfig(n) || n.path == null) throw new Error(getMessage(3173));
                for (const t of ensureArrayOfStrings(n.path)) {
                    this.xs(t, n.caseSensitive ?? false, c);
                }
                const e = this.childRoutes.length;
                const i = c.then((t => this.childRoutes[e] = t));
                this.childRoutes.push(i);
                if (o) {
                    r.Es(i);
                }
                s.push(i.then(t.noop));
                continue;
            }
            for (const e of c.path ?? t.emptyArray) {
                this.xs(e, c.caseSensitive, c);
            }
            this.childRoutes.push(c);
            if (o) {
                r.Es(c);
            }
        }
        this.cs = true;
        if (s.length > 0) {
            this.Ze = Promise.all(s).then((() => {
                this.Ze = null;
            }));
        }
    }
    static setRoot(s) {
        const i = s.get(t.ILogger).scopeTo("RouteContext");
        if (!s.has(e.IAppRoot, true)) {
            logAndThrow(new Error(getMessage(3167)), i);
        }
        if (s.has(b, true)) {
            logAndThrow(new Error(getMessage(3168)), i);
        }
        const {controller: n} = s.get(e.IAppRoot);
        if (n === void 0) {
            logAndThrow(new Error(getMessage(3169)), i);
        }
        const r = s.get(E);
        return t.onResolve(r.getRouteContext(null, n.definition, n.viewModel, n.container, null, null, null), (e => {
            s.register(t.Registration.instance(b, e));
            e.node = r.routeTree.root;
        }));
    }
    static resolve(s, i) {
        const n = s.container;
        const r = n.get(t.ILogger).scopeTo("RouteContext");
        if (i == null) {
            return s;
        }
        if (i instanceof RouteContext) {
            return i;
        }
        if (i instanceof n.get(e.IPlatform).Node) {
            try {
                const t = e.CustomElement.for(i, {
                    searchParents: true
                });
                return t.container.get(b);
            } catch (t) {
                error(r, 3155, i.nodeName, t);
                throw t;
            }
        }
        if (e.isCustomElementViewModel(i)) {
            const t = i.$controller;
            return t.container.get(b);
        }
        if (e.isCustomElementController(i)) {
            const t = i;
            return t.container.get(b);
        }
        logAndThrow(new Error(getMessage(3170, Object.prototype.toString.call(i))), r);
    }
    dispose() {
        this.container.dispose();
        this.us();
    }
    Ee(t) {
        const e = this.os.find((e => e.Ft(t)));
        if (e === void 0) throw new Error(getMessage(3174, t, this.ys()));
        return e;
    }
    getAvailableViewportAgents() {
        return this.os.filter((t => t.Gt()));
    }
    getFallbackViewportAgent(t) {
        return this.os.find((e => e.Gt() && e.viewport.name === t && e.viewport.fallback !== "")) ?? null;
    }
    Kt(s, i) {
        this.ps.prepare(s);
        const n = this.container.createChild({
            inheritParentResources: true
        });
        const r = this.p;
        const o = i.component;
        const a = r.document.createElement(o.name);
        e.registerHostNode(n, a, r);
        const c = n.invoke(o.Type);
        const u = this.cs ? void 0 : t.onResolve(resolveRouteConfiguration(c, false, this.config, i, null), (t => this.ws(t)));
        return t.onResolve(u, (() => {
            const t = e.Controller.$el(n, c, a, {
                projections: null
            }, o);
            const s = new ComponentAgent(c, t, i, this, this.rs.options);
            this.ps.dispose();
            return s;
        }));
    }
    Rs(t) {
        const e = ViewportAgent.for(t, this);
        if (this.os.includes(e)) {
            return e;
        }
        this.os.push(e);
        return e;
    }
    Ss(t) {
        const e = ViewportAgent.for(t, this);
        if (!this.os.includes(e)) {
            return;
        }
        this.os.splice(this.os.indexOf(e), 1);
    }
    recognize(t, e = false) {
        let i = this;
        let n = true;
        let r = null;
        while (n) {
            r = i.gs.recognize(t);
            if (r === null) {
                if (!e || i.isRoot) return null;
                i = i.parent;
            } else {
                n = false;
            }
        }
        return new $RecognizedRoute(r, Reflect.has(r.params, s.RESIDUE) ? r.params[s.RESIDUE] ?? null : null);
    }
    Es(e) {
        return t.onResolve(resolveRouteConfiguration(e, true, this.config, null, this), (e => {
            for (const s of e.path ?? t.emptyArray) {
                this.xs(s, e.caseSensitive, e);
            }
            this.ns?.Es(e);
            this.childRoutes.push(e);
        }));
    }
    xs(t, e, s) {
        this.gs.add({
            path: t,
            caseSensitive: e,
            handler: s
        }, true);
    }
    ot(t) {
        return this.ls.load(t, (s => {
            const i = s.raw;
            if (typeof i === "function") {
                const t = e.CustomElement.isType(i) ? e.CustomElement.getDefinition(i) : null;
                if (t != null) return t;
            }
            let n = void 0;
            let r = void 0;
            for (const t of s.items) {
                const s = e.CustomElement.isType(t.value) ? t.definition : null;
                if (s != null) {
                    if (t.key === "default") {
                        n = s;
                    } else if (r === void 0) {
                        r = s;
                    }
                }
            }
            if (n === void 0 && r === void 0) {
                if (!isPartialCustomElementDefinition(i)) throw new Error(getMessage(3175, t));
                const s = e.CustomElementDefinition.create(i);
                e.CustomElement.define(s);
                return s;
            }
            return r ?? n;
        }));
    }
    ve(t) {
        if (!isEagerInstruction(t)) return null;
        const e = t.component;
        let i;
        let n = false;
        if (e instanceof RouteConfig) {
            i = e.path;
            n = true;
        } else if (typeof e === "string") {
            const t = this.childRoutes.find((t => t.id === e));
            if (t === void 0) return null;
            i = t.path;
        } else if (e.type === 0) {
            const t = this.childRoutes.find((t => t.id === e.value));
            if (t === void 0) return null;
            i = t.path;
        } else {
            const t = resolveCustomElementDefinition(e, this)[1];
            i = this.childRoutes.reduce(((e, s) => {
                if (s.component === t.Type) {
                    e.push(...s.path);
                }
                return e;
            }), []);
            n = true;
        }
        if (i === void 0) return null;
        const r = t.params;
        const o = this.gs;
        const a = i.length;
        const c = [];
        let u = null;
        if (a === 1) {
            const e = core(i[0]);
            if (e === null) {
                if (n) throw new Error(getMessage(3166, t, c));
                return null;
            }
            return {
                vi: ViewportInstruction.create({
                    recognizedRoute: new $RecognizedRoute(new s.RecognizedRoute(e.endpoint, e.consumed), null),
                    component: e.path,
                    children: t.children,
                    viewport: t.viewport,
                    open: t.open,
                    close: t.close
                }),
                query: e.query
            };
        }
        let h = 0;
        for (let t = 0; t < a; t++) {
            const e = core(i[t]);
            if (e === null) continue;
            if (u === null) {
                u = e;
                h = Object.keys(e.consumed).length;
            } else if (Object.keys(e.consumed).length > h) {
                u = e;
            }
        }
        if (u === null) {
            if (n) throw new Error(getMessage(3166, t, c));
            return null;
        }
        return {
            vi: ViewportInstruction.create({
                recognizedRoute: new $RecognizedRoute(new s.RecognizedRoute(u.endpoint, u.consumed), null),
                component: u.path,
                children: t.children,
                viewport: t.viewport,
                open: t.open,
                close: t.close
            }),
            query: u.query
        };
        function core(t) {
            const e = o.getEndpoint(t);
            if (e === null) {
                c.push(`No endpoint found for the path: '${t}'.`);
                return null;
            }
            const s = Object.create(null);
            for (const i of e.params) {
                const e = i.name;
                let n = r[e];
                if (n == null || String(n).length === 0) {
                    if (!i.isOptional) {
                        c.push(`No value for the required parameter '${e}' is provided for the path: '${t}'.`);
                        return null;
                    }
                    n = "";
                } else {
                    if (!i.satisfiesPattern(n)) {
                        c.push(`The value '${n}' for the parameter '${e}' does not satisfy the pattern '${i.pattern}'.`);
                        return null;
                    }
                    s[e] = n;
                }
                const o = i.isStar ? `*${e}` : i.isOptional ? `:${e}?` : `:${e}`;
                t = t.replace(o, encodeURIComponent(n));
            }
            const i = Object.keys(s);
            const n = Object.fromEntries(Object.entries(r).filter((([t]) => !i.includes(t))));
            return {
                path: t.replace(/\/\//g, "/"),
                endpoint: e,
                consumed: s,
                query: n
            };
        }
    }
    toString() {
        const t = this.os;
        const e = t.map(String).join(",");
        return `RC(path:'${this.Ut}',viewports:[${e}])`;
    }
    ys() {
        const t = [];
        for (let e = 0; e < this.path.length; ++e) {
            t.push(`${" ".repeat(e)}${this.path[e]}`);
        }
        return t.join("\n");
    }
}

class $RecognizedRoute {
    constructor(t, e) {
        this.route = t;
        this.residue = e;
    }
    toString() {
        return "RR";
    }
}

class NavigationModel {
    constructor(t) {
        this.routes = t;
        this.bs = void 0;
    }
    resolve() {
        return t.onResolve(this.bs, t.noop);
    }
    ds(e, s) {
        void t.onResolve(this.bs, (() => {
            for (const t of this.routes) {
                t.ds(e, s);
            }
        }));
    }
    Es(e) {
        const s = this.routes;
        if (!(e instanceof Promise)) {
            if ((e.nav ?? false) && e.redirectTo === null) {
                s.push(NavigationRoute.Z(e));
            }
            return;
        }
        const i = s.length;
        s.push(void 0);
        let n = void 0;
        n = this.bs = t.onResolve(this.bs, (() => t.onResolve(e, (t => {
            if (t.nav && t.redirectTo === null) {
                s[i] = NavigationRoute.Z(t);
            } else {
                s.splice(i, 1);
            }
            if (this.bs === n) {
                this.bs = void 0;
            }
        }))));
    }
}

class NavigationRoute {
    constructor(t, e, s, i) {
        this.id = t;
        this.path = e;
        this.title = s;
        this.data = i;
        this.Cs = null;
    }
    static Z(e) {
        return new NavigationRoute(e.id, ensureArrayOfStrings(e.path ?? t.emptyArray), e.title, e.data);
    }
    get isActive() {
        return this.It;
    }
    ds(e, i) {
        let n = this.Cs;
        if (n === null) {
            const r = e.options;
            n = this.Cs = this.path.map((e => {
                const n = i.gs.getEndpoint(e);
                if (n === null) throw new Error(getMessage(3450, e));
                return new ViewportInstructionTree(NavigationOptions.create(r, {
                    context: i
                }), false, [ ViewportInstruction.create({
                    recognizedRoute: new $RecognizedRoute(new s.RecognizedRoute(n, t.emptyObject), null),
                    component: e
                }) ], v, null);
            }));
        }
        this.It = n.some((t => e.routeTree.contains(t, true)));
    }
}

class ViewportCustomElement {
    constructor() {
        this.name = S;
        this.usedBy = "";
        this.default = "";
        this.fallback = "";
        this.Ns = void 0;
        this.De = void 0;
        this.ye = t.resolve(b);
        this.L = t.resolve(t.ILogger).scopeTo(`au-viewport<${this.ye.Ut}>`);
    }
    nt(t, s, i) {
        const n = this.fallback;
        return typeof n === "function" && !e.CustomElement.isType(n) ? n(t, s, i) : n;
    }
    hydrated(t) {
        this.De = t;
        this.Ns = this.ye.Rs(this);
    }
    attaching(t, e) {
        return this.Ns.zt(t, this.De);
    }
    detaching(t, e) {
        return this.Ns.Dt(t, this.De);
    }
    dispose() {
        this.ye.Ss(this);
        this.Ns.te();
        this.Ns = void 0;
    }
    toString() {
        const t = [];
        for (const e of N) {
            const s = this[e];
            switch (typeof s) {
              case "string":
                if (s !== "") {
                    t.push(`${e}:'${s}'`);
                }
                break;

              default:
                {
                    t.push(`${e}:${String(s)}`);
                }
            }
        }
        return `VP(ctx:'${this.ye.Ut}',${t.join(",")})`;
    }
}

e.CustomElement.define({
    name: "au-viewport",
    bindables: [ "name", "usedBy", "default", "fallback" ]
}, ViewportCustomElement);

const N = [ "name", "usedBy", "default", "fallback" ];

class LoadCustomAttribute {
    constructor() {
        this.ks = t.resolve(e.INode);
        this.rs = t.resolve(E);
        this.ye = t.resolve(b);
        this.I = t.resolve(c);
        this.Ve = t.resolve(h);
        this.attribute = "href";
        this.active = false;
        this.$s = null;
        this.Ce = null;
        this._s = null;
        this.onClick = t => {
            if (this.Ce === null) {
                return;
            }
            if (t.altKey || t.ctrlKey || t.shiftKey || t.metaKey || t.button !== 0) {
                return;
            }
            t.preventDefault();
            void this.rs.load(this.Ce, {
                context: this.context
            });
        };
        const s = this.ks;
        this.Ts = !s.hasAttribute("external") && !s.hasAttribute("data-external");
        this.Is = this.rs.options.activeClass;
    }
    binding() {
        if (this.Ts) {
            this.ks.addEventListener("click", this.onClick);
        }
        this.valueChanged();
        this._s = this.I.subscribe("au:router:navigation-end", (t => {
            const e = this.active = this.Ce !== null && this.rs.isActive(this.Ce, this.context);
            const s = this.Is;
            if (s === null) return;
            this.ks.classList.toggle(s, e);
        }));
    }
    attaching() {
        const t = this.context;
        const e = t.allResolved;
        if (e !== null) {
            return e.then((() => {
                this.valueChanged();
            }));
        }
    }
    unbinding() {
        if (this.Ts) {
            this.ks.removeEventListener("click", this.onClick);
        }
        this._s.dispose();
    }
    valueChanged() {
        const t = this.rs;
        const s = t.options;
        const i = this.route;
        let n = this.context;
        if (n === void 0) {
            n = this.context = this.ye;
        } else if (n === null) {
            n = this.context = this.ye.root;
        }
        if (i != null && n.allResolved === null) {
            const e = this.params;
            const r = this.Ce = t.createViewportInstructions(typeof e === "object" && e !== null ? {
                component: i,
                params: e
            } : i, {
                context: n
            });
            this.$s = r.toUrl(false, s.Le);
        } else {
            this.Ce = null;
            this.$s = null;
        }
        const r = e.CustomElement.for(this.ks, {
            optional: true
        });
        if (r !== null) {
            r.viewModel[this.attribute] = this.Ce;
        } else {
            if (this.$s === null) {
                this.ks.removeAttribute(this.attribute);
            } else {
                const t = s.useUrlFragmentHash ? this.$s : this.Ve.addBaseHref(this.$s);
                this.ks.setAttribute(this.attribute, t);
            }
        }
    }
}

e.CustomAttribute.define({
    name: "load",
    bindables: {
        route: {
            mode: r,
            primary: true,
            callback: "valueChanged"
        },
        params: {
            mode: r,
            callback: "valueChanged"
        },
        attribute: {
            mode: r
        },
        active: {
            mode: o
        },
        context: {
            mode: r,
            callback: "valueChanged"
        }
    }
}, LoadCustomAttribute);

class HrefCustomAttribute {
    get Ps() {
        return this.ks.hasAttribute("external") || this.ks.hasAttribute("data-external");
    }
    constructor() {
        this.ks = t.resolve(e.INode);
        this.rs = t.resolve(E);
        this.ye = t.resolve(b);
        this.Vs = false;
        if (this.rs.options.useHref && this.ks.nodeName === "A") {
            const s = t.resolve(e.IWindow).name;
            switch (this.ks.getAttribute("target")) {
              case null:
              case s:
              case "_self":
                this.Ts = true;
                break;

              default:
                this.Ts = false;
                break;
            }
        } else {
            this.Ts = false;
        }
    }
    binding() {
        if (!this.Vs) {
            this.Vs = true;
            this.Ts = this.Ts && e.refs.get(this.ks, e.CustomAttribute.getDefinition(LoadCustomAttribute).key) === null;
        }
        this.valueChanged(this.value);
        this.ks.addEventListener("click", this);
    }
    unbinding() {
        this.ks.removeEventListener("click", this);
    }
    valueChanged(t) {
        if (t == null) {
            this.ks.removeAttribute("href");
        } else {
            if (this.rs.options.useUrlFragmentHash && this.ye.isRoot && !/^[.#]/.test(t) && !this.Ps) {
                t = `#${t}`;
            }
            this.ks.setAttribute("href", t);
        }
    }
    handleEvent(t) {
        this.As(t);
    }
    As(t) {
        if (t.altKey || t.ctrlKey || t.shiftKey || t.metaKey || t.button !== 0 || this.Ps || !this.Ts) {
            return;
        }
        const e = this.ks.getAttribute("href");
        if (e !== null) {
            t.preventDefault();
            void this.rs.load(e, {
                context: this.ye
            });
        }
    }
}

HrefCustomAttribute.$au = {
    type: "custom-attribute",
    name: "href",
    noMultiBindings: true,
    bindables: {
        value: {
            mode: r
        }
    }
};

const k = E;

const $ = [ k ];

const _ = ViewportCustomElement;

const T = LoadCustomAttribute;

const I = HrefCustomAttribute;

const P = [ ViewportCustomElement, LoadCustomAttribute, HrefCustomAttribute ];

function configure(s, i) {
    let n = null;
    if (t.isObjectOrFunction(i)) {
        n = i.basePath ?? null;
    } else {
        i = {};
    }
    const r = RouterOptions.create(i);
    return s.register(t.Registration.cachedCallback(u, ((t, s, i) => {
        const r = t.get(e.IWindow);
        const o = new URL(r.document.baseURI);
        o.pathname = normalizePath(n ?? o.pathname);
        return o;
    })), t.Registration.instance(R, r), t.Registration.instance(RouterOptions, r), e.AppTask.creating(E, (t => {})), e.AppTask.hydrated(t.IContainer, RouteContext.setRoot), e.AppTask.activated(E, (t => t.start(true))), e.AppTask.deactivated(E, (t => t.stop())), ...$, ...P);
}

const V = {
    register(t) {
        return configure(t);
    },
    customize(t) {
        return {
            register(e) {
                return configure(e, t);
            }
        };
    }
};

class ScrollState {
    constructor(t) {
        this.ks = t;
        this.Os = t.scrollTop;
        this.Ms = t.scrollLeft;
    }
    static js(t) {
        return t.scrollTop > 0 || t.scrollLeft > 0;
    }
    Ls() {
        this.ks.scrollTo(this.Ms, this.Os);
        this.ks = null;
    }
}

function restoreState(t) {
    t.Ls();
}

class HostElementState {
    constructor(t) {
        this.Us = [];
        this.zs(t.children);
    }
    zs(t) {
        let e;
        for (let s = 0, i = t.length; s < i; ++s) {
            e = t[s];
            if (ScrollState.js(e)) {
                this.Us.push(new ScrollState(e));
            }
            this.zs(e.children);
        }
    }
    Ls() {
        this.Us.forEach(restoreState);
        this.Us = null;
    }
}

const A = /*@__PURE__*/ t.DI.createInterface("IStateManager", (t => t.singleton(ScrollStateManager)));

class ScrollStateManager {
    constructor() {
        this.Bs = new WeakMap;
    }
    saveState(t) {
        this.Bs.set(t.host, new HostElementState(t.host));
    }
    restoreState(t) {
        const e = this.Bs.get(t.host);
        if (e !== void 0) {
            e.Ls();
            this.Bs.delete(t.host);
        }
    }
}

const O = /*@__PURE__*/ t.DI.createInterface("ICurrentRoute", (t => t.singleton(CurrentRoute)));

class CurrentRoute {
    constructor() {
        this.path = "";
        this.url = "";
        this.title = "";
        this.query = new URLSearchParams;
        this.parameterInformation = t.emptyArray;
        const e = t.resolve(E);
        const s = e.options;
        t.resolve(c).subscribe("au:router:navigation-end", (t => {
            const i = t.finalInstructions;
            n.batch((() => {
                this.path = i.toPath();
                this.url = i.toUrl(true, s.Le);
                this.title = e.Be();
                this.query = i.queryParams;
                this.parameterInformation = i.children.map((t => ParameterInformation.create(t)));
            }));
        }));
    }
}

class ParameterInformation {
    constructor(t, e, s, i) {
        this.config = t;
        this.viewport = e;
        this.params = s;
        this.children = i;
    }
    static create(t) {
        const e = t.recognizedRoute?.route;
        const i = Object.create(null);
        Object.assign(i, e?.params ?? t.params);
        Reflect.deleteProperty(i, s.RESIDUE);
        return new ParameterInformation(e?.endpoint.route.handler ?? null, t.viewport, i, t.children.map((t => this.create(t))));
    }
}

exports.AST = d;

exports.AuNavId = a;

exports.ComponentExpression = ComponentExpression;

exports.CompositeSegmentExpression = CompositeSegmentExpression;

exports.DefaultComponents = $;

exports.DefaultResources = P;

exports.HrefCustomAttribute = HrefCustomAttribute;

exports.HrefCustomAttributeRegistration = I;

exports.ICurrentRoute = O;

exports.ILocationManager = h;

exports.IRouteContext = b;

exports.IRouter = E;

exports.IRouterEvents = c;

exports.IRouterOptions = R;

exports.IStateManager = A;

exports.LoadCustomAttribute = LoadCustomAttribute;

exports.LoadCustomAttributeRegistration = T;

exports.LocationChangeEvent = LocationChangeEvent;

exports.NavigationCancelEvent = NavigationCancelEvent;

exports.NavigationEndEvent = NavigationEndEvent;

exports.NavigationErrorEvent = NavigationErrorEvent;

exports.NavigationOptions = NavigationOptions;

exports.NavigationStartEvent = NavigationStartEvent;

exports.NavigationStrategy = NavigationStrategy;

exports.ParameterExpression = ParameterExpression;

exports.ParameterListExpression = ParameterListExpression;

exports.Route = f;

exports.RouteConfig = RouteConfig;

exports.RouteContext = RouteContext;

exports.RouteExpression = RouteExpression;

exports.RouteNode = RouteNode;

exports.RouteTree = RouteTree;

exports.Router = Router;

exports.RouterConfiguration = V;

exports.RouterOptions = RouterOptions;

exports.RouterRegistration = k;

exports.ScopedSegmentExpression = ScopedSegmentExpression;

exports.SegmentExpression = SegmentExpression;

exports.SegmentGroupExpression = SegmentGroupExpression;

exports.Transition = Transition;

exports.ViewportAgent = ViewportAgent;

exports.ViewportCustomElement = ViewportCustomElement;

exports.ViewportCustomElementRegistration = _;

exports.ViewportExpression = ViewportExpression;

exports.fragmentUrlParser = y;

exports.isManagedState = isManagedState;

exports.pathUrlParser = x;

exports.route = route;

exports.toManagedState = toManagedState;
//# sourceMappingURL=index.cjs.map
