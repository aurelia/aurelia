"use strict";

var t = require("@aurelia/kernel");

var e = require("@aurelia/runtime-html");

var s = require("@aurelia/route-recognizer");

var n = require("@aurelia/metadata");

var i = require("@aurelia/runtime");

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
                t.I();
            }
            t = t.h;
        } while (t !== null);
    }
    I() {
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
        const n = t.shift();
        const i = n.context.vpa;
        if (s.every((t => t.context.vpa !== i))) {
            const t = e.findIndex((t => t.context.vpa === i));
            if (t >= 0) {
                s.push(...e.splice(0, t + 1));
            } else {
                s.push(n);
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

function mergeURLSearchParams(e, s, n) {
    const i = n ? new URLSearchParams(e) : e;
    if (s == null) return i;
    for (const [e, n] of Object.entries(s)) {
        if (n == null) continue;
        if (t.isArray(n)) {
            for (const t of n) {
                i.append(e, t);
            }
            continue;
        }
        i.append(e, n);
    }
    return i;
}

function mergeQueryParams(e, s) {
    if (s == null) return e;
    for (const [n, i] of Object.entries(s)) {
        if (i == null) continue;
        if (e[n] == null) {
            e[n] = i;
        } else {
            const s = e[n];
            e[n] = [ ...t.isArray(s) ? s : [ s ], ...t.isArray(i) ? i : [ i ] ];
        }
    }
    return e;
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
    for (const n of s) {
        const s = t[n];
        const i = [ e, n ].join(".");
        switch (n) {
          case "id":
          case "viewport":
          case "redirectTo":
            if (typeof s !== "string") {
                expectType("string", i, s);
            }
            break;

          case "caseSensitive":
          case "nav":
            if (typeof s !== "boolean") {
                expectType("boolean", i, s);
            }
            break;

          case "data":
            if (typeof s !== "object" || s === null) {
                expectType("object", i, s);
            }
            break;

          case "title":
            switch (typeof s) {
              case "string":
              case "function":
                break;

              default:
                expectType("string or function", i, s);
            }
            break;

          case "path":
            if (s instanceof Array) {
                for (let t = 0; t < s.length; ++t) {
                    if (typeof s[t] !== "string") {
                        expectType("string", `${i}[${t}]`, s[t]);
                    }
                }
            } else if (typeof s !== "string") {
                expectType("string or Array of strings", i, s);
            }
            break;

          case "component":
            validateComponent(s, i, "component");
            break;

          case "routes":
            {
                if (!(s instanceof Array)) {
                    expectType("Array", i, s);
                }
                for (const t of s) {
                    const e = `${i}[${s.indexOf(t)}]`;
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
                    expectType("string('none'|'replace'|'invoke-lifecycles') or function", i, s);
                }
                break;

              case "function":
                break;

              default:
                expectType("string('none'|'replace'|'invoke-lifecycles') or function", i, s);
            }
            break;

          case "fallback":
            validateComponent(s, i, "fallback");
            break;

          default:
            throw new Error(getMessage(3556, e, n));
        }
    }
}

function validateRedirectRouteConfig(t, e) {
    if (t == null) throw new Error(getMessage(3555, t));
    const s = Object.keys(t);
    for (const n of s) {
        const s = t[n];
        const i = [ e, n ].join(".");
        switch (n) {
          case "path":
            if (s instanceof Array) {
                for (let t = 0; t < s.length; ++t) {
                    if (typeof s[t] !== "string") {
                        expectType("string", `${i}[${t}]`, s[t]);
                    }
                }
            } else if (typeof s !== "string") {
                expectType("string or Array of strings", i, s);
            }
            break;

          case "redirectTo":
            if (typeof s !== "string") {
                expectType("string", i, s);
            }
            break;

          default:
            throw new Error(getMessage(3557, e, n));
        }
    }
}

function validateComponent(t, s, n) {
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
            expectType(`an object with at least a '${n}' property (see Routeable)`, s, t);
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
    const n = Object.keys(e);
    if (s.length !== n.length) {
        return false;
    }
    for (let i = 0, r = s.length; i < r; ++i) {
        const r = s[i];
        if (r !== n[i]) {
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
        this._ = t;
        this.P = e;
        this.A = s;
        this.V = false;
    }
    dispose() {
        if (!this.V) {
            this.V = true;
            this.A.dispose();
            const t = this._["O"];
            t.splice(t.indexOf(this), 1);
        }
    }
}

const u = /*@__PURE__*/ t.DI.createInterface("IRouterEvents", (t => t.singleton(RouterEvents)));

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
    constructor(t, e, s, n) {
        this.id = t;
        this.url = e;
        this.trigger = s;
        this.state = n;
    }
    toString() {
        return `LocationChangeEvent`;
    }
}

class NavigationStartEvent {
    get name() {
        return "au:router:navigation-start";
    }
    constructor(t, e, s, n) {
        this.id = t;
        this.instructions = e;
        this.trigger = s;
        this.managedState = n;
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

const c = /*@__PURE__*/ t.DI.createInterface("IBaseHref");

const h = /*@__PURE__*/ t.DI.createInterface("ILocationManager", (t => t.singleton(BrowserLocationManager)));

class BrowserLocationManager {
    constructor() {
        this.U = 0;
        this.L = t.resolve(t.ILogger).root.scopeTo("LocationManager");
        this._ = t.resolve(u);
        this.B = t.resolve(e.IHistory);
        this.l = t.resolve(e.ILocation);
        this.q = t.resolve(e.IWindow);
        this.H = t.resolve(c);
        this.G = t.resolve(R).useUrlFragmentHash ? "hashchange" : "popstate";
    }
    startListening() {
        this.q.addEventListener(this.G, this, false);
    }
    stopListening() {
        this.q.removeEventListener(this.G, this, false);
    }
    handleEvent(t) {
        this._.publish(new LocationChangeEvent(++this.U, this.getPath(), this.G, "state" in t ? t.state : null));
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
        let s = this.H.href;
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
        const e = this.H.pathname;
        if (t.startsWith(e)) {
            t = t.slice(e.length);
        }
        return normalizePath(t);
    }
}

function normalizePath(t) {
    let e;
    let s;
    let n;
    if ((n = t.indexOf("?")) >= 0 || (n = t.indexOf("#")) >= 0) {
        e = t.slice(0, n);
        s = t.slice(n);
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
        const t = this.F;
        if (t.length > 0) return t;
        const s = e.CustomElement.getDefinition(this.W);
        return this.F = [ s.name, ...s.aliases ];
    }
    get component() {
        return this.J();
    }
    constructor(t, e, s, n, i, r, o, a, u, c, h, l) {
        this.id = t;
        this.F = e;
        this.title = s;
        this.redirectTo = n;
        this.caseSensitive = i;
        this.transitionPlan = r;
        this.viewport = o;
        this.data = a;
        this.routes = u;
        this.fallback = c;
        this.nav = l;
        this.Y = false;
        this.K = null;
        this.W = h;
        this.X = h instanceof NavigationStrategy;
    }
    static Z(e, s) {
        if (typeof e === "string" || e instanceof Array) {
            const t = ensureArrayOfStrings(e);
            const n = s?.redirectTo ?? null;
            const i = s?.caseSensitive ?? false;
            const r = ensureString(s?.id ?? (t instanceof Array ? t[0] : t));
            const o = s?.title ?? null;
            const a = s?.transitionPlan ?? null;
            const u = s?.viewport ?? S;
            const c = s?.data ?? {};
            const h = s?.routes ?? l;
            return new RouteConfig(r, t, o, n, i, a, u, c, h, s?.fallback ?? null, s, s?.nav ?? true);
        } else if (typeof e === "object") {
            const n = e;
            validateRouteConfig(n, "");
            const i = ensureArrayOfStrings(n.path ?? s?.path ?? t.emptyArray);
            const r = n.title ?? s?.title ?? null;
            const o = n.redirectTo ?? s?.redirectTo ?? null;
            const a = n.caseSensitive ?? s?.caseSensitive ?? false;
            const u = n.id ?? s?.id ?? (i instanceof Array ? i[0] : i);
            const c = n.transitionPlan ?? s?.transitionPlan ?? null;
            const h = n.viewport ?? s?.viewport ?? S;
            const f = {
                ...s?.data,
                ...n.data
            };
            const p = [ ...n.routes ?? l, ...s?.routes ?? l ];
            return new RouteConfig(u, i, r, o, a, c, h, f, p, n.fallback ?? s?.fallback ?? null, n.component ?? s ?? null, n.nav ?? true);
        } else {
            expectType("string, function/class or object", "", e);
        }
    }
    tt(t, e) {
        validateRouteConfig(t, this.path[0] ?? "");
        const s = ensureArrayOfStrings(t.path ?? this.path);
        return new RouteConfig(ensureString(t.id ?? this.id ?? s), s, t.title ?? this.title, t.redirectTo ?? this.redirectTo, t.caseSensitive ?? this.caseSensitive, t.transitionPlan ?? this.transitionPlan ?? e?.transitionPlan ?? null, t.viewport ?? this.viewport, t.data ?? this.data, t.routes ?? this.routes, t.fallback ?? this.fallback ?? e?.fallback ?? null, this.W, t.nav ?? this.nav);
    }
    et(t, e, n) {
        if (hasSamePath(t, e) && shallowEquals(t.params, e.params)) return "none";
        if (n != null) return n;
        const i = this.transitionPlan ?? "replace";
        return typeof i === "function" ? i(t, e) : i;
        function cleanPath(t) {
            return t.replace(`/*${s.RESIDUE}`, "");
        }
        function hasSamePath(t, e) {
            const s = t.finalPath;
            const n = e.finalPath;
            return s.length === 0 || n.length === 0 || cleanPath(s) === cleanPath(n);
        }
    }
    st(e, s, n) {
        if (this.Y) throw new Error(getMessage(3550));
        if (typeof e.getRouteConfig !== "function") return;
        return t.onResolve(e.getRouteConfig(s, n), (t => {
            this.Y = true;
            if (t == null) return;
            let e = s?.path ?? "";
            if (typeof e !== "string") {
                e = e[0];
            }
            validateRouteConfig(t, e);
            this.id = t.id ?? this.id;
            this.F = ensureArrayOfStrings(t.path ?? this.path);
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
    nt() {
        return new RouteConfig(this.id, this.path, this.title, this.redirectTo, this.caseSensitive, this.transitionPlan, this.viewport, this.data, this.routes, this.fallback, this.W, this.nav);
    }
    it(t, s, n) {
        const i = this.fallback;
        return typeof i === "function" && !e.CustomElement.isType(i) ? i(t, s, n) : i;
    }
    rt() {
        try {
            return this.J().name;
        } catch {
            return "UNRESOLVED-NAVIGATION-STRATEGY";
        }
    }
    J(t, e, s, n) {
        if (t == null) {
            if (this.K != null) return this.K;
            if (this.X) throw new Error(getMessage(3558, this.id));
            return this.K = this.W;
        }
        return this.K ??= this.X ? this.W.getComponent(t, e, s, n) : this.W;
    }
    ot() {
        if (!this.X) return;
        this.K = null;
    }
    toString() {
        let t = `RConf(id: ${this.id}, isNavigationStrategy: ${this.X}`;
        return `{${t}})`;
    }
}

const f = {
    name: /*@__PURE__*/ t.getResourceKeyFor("route-configuration"),
    isConfigured(t) {
        return n.Metadata.has(f.name, t);
    },
    configure(t, e) {
        const s = RouteConfig.Z(t, e);
        n.Metadata.define(s, e, f.name);
        return e;
    },
    getConfig(t) {
        if (!f.isConfigured(t)) {
            f.configure({}, t);
        }
        return n.Metadata.get(f.name, t);
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

function resolveRouteConfiguration(e, s, n, i, r) {
    if (isPartialRedirectRouteConfig(e)) return RouteConfig.Z(e, null);
    const [o, a] = resolveCustomElementDefinition(e, r);
    if (o.type === 5) return RouteConfig.Z({
        ...e,
        nav: false
    }, null);
    return t.onResolve(a, (r => {
        const a = r.Type;
        const u = f.getConfig(a);
        if (isPartialChildRouteConfig(e)) return u.tt(e, n);
        if (s) return u.nt();
        if (!u.Y && o.type === 4 && typeof e.getRouteConfig === "function") {
            return t.onResolve(u.st(e, n, i), (() => u));
        }
        return u;
    }));
}

function resolveCustomElementDefinition(t, s) {
    const n = createNavigationInstruction(t);
    let i;
    switch (n.type) {
      case 5:
        return [ n, null ];

      case 0:
        {
            if (s == null) throw new Error(getMessage(3551));
            const t = s.component.dependencies;
            let r = t.find((t => isPartialCustomElementDefinition(t) && t.name === n.value)) ?? e.CustomElement.find(s.container, n.value);
            if (r === null) throw new Error(getMessage(3552, n.value, s));
            if (!(r instanceof e.CustomElementDefinition)) {
                r = e.CustomElementDefinition.create(r);
                e.CustomElement.define(r);
            }
            i = r;
            break;
        }

      case 2:
        i = n.value;
        break;

      case 4:
        i = e.CustomElement.getDefinition(n.value.constructor);
        break;

      case 3:
        if (s == null) throw new Error(getMessage(3553));
        i = s.ut(n.value);
        break;
    }
    return [ n, i ];
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
        this.ht = t;
        this.lt = [];
        this.ft = 0;
        this.gt = 0;
        this.ct = t;
    }
    dt(...t) {
        const e = this.ct;
        return t.some((function(t) {
            return e.startsWith(t);
        }));
    }
    wt(t) {
        if (this.dt(t)) {
            this.ct = this.ct.slice(t.length);
            this.gt += t.length;
            this.vt(t);
            return true;
        }
        return false;
    }
    Et(t) {
        if (!this.wt(t)) {
            this.xt(`'${t}'`);
        }
    }
    xt(t) {
        throw new Error(getMessage(3500, t, this.gt, this.ht, this.ct, this.ct));
    }
    yt() {
        if (!this.u) {
            throw new Error(getMessage(3501, this.ct, this.gt, this.ht));
        }
    }
    Rt() {
        const t = this.ct[0];
        this.ct = this.ct.slice(1);
        ++this.gt;
        this.vt(t);
    }
    St() {
        this.lt[this.ft++] = "";
    }
    Ct() {
        const t = --this.ft;
        const e = this.lt;
        const s = e[t];
        e[t] = "";
        return s;
    }
    bt() {
        this.lt[--this.ft] = "";
    }
    vt(t) {
        const e = this.ft;
        const s = this.lt;
        for (let n = 0; n < e; ++n) {
            s[n] += t;
        }
    }
}

const g = new Map;

class RouteExpression {
    get kind() {
        return "Route";
    }
    constructor(t, e, s, n) {
        this.isAbsolute = t;
        this.root = e;
        this.queryParams = s;
        this.fragment = n;
    }
    static parse(t) {
        const e = t.toString();
        let s = g.get(e);
        if (s === void 0) {
            g.set(e, s = RouteExpression.Nt(t));
        }
        return s;
    }
    static Nt(t) {
        const e = t.path;
        if (e === "") {
            return new RouteExpression(false, SegmentExpression.Empty, t.query, t.fragment);
        }
        const s = new ParserState(e);
        s.St();
        const n = s.wt("/");
        const i = CompositeSegmentExpression.kt(s);
        s.yt();
        s.bt();
        return new RouteExpression(n, i, t.query, t.fragment);
    }
    toInstructionTree(t) {
        return new ViewportInstructionTree(t, this.isAbsolute, this.root.$t(0, 0), mergeURLSearchParams(this.queryParams, t.queryParams, true), this.fragment ?? t.fragment);
    }
}

class CompositeSegmentExpression {
    get kind() {
        return "CompositeSegment";
    }
    constructor(t) {
        this.siblings = t;
    }
    static kt(t) {
        t.St();
        const e = t.wt("+");
        const s = [];
        do {
            s.push(ScopedSegmentExpression.kt(t));
        } while (t.wt("+"));
        if (!e && s.length === 1) {
            t.bt();
            return s[0];
        }
        t.bt();
        return new CompositeSegmentExpression(s);
    }
    $t(t, e) {
        switch (this.siblings.length) {
          case 0:
            return [];

          case 1:
            return this.siblings[0].$t(t, e);

          case 2:
            return [ ...this.siblings[0].$t(t, 0), ...this.siblings[1].$t(0, e) ];

          default:
            return [ ...this.siblings[0].$t(t, 0), ...this.siblings.slice(1, -1).flatMap((function(t) {
                return t.$t(0, 0);
            })), ...this.siblings[this.siblings.length - 1].$t(0, e) ];
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
    static kt(t) {
        t.St();
        const e = SegmentGroupExpression.kt(t);
        if (t.wt("/")) {
            const s = ScopedSegmentExpression.kt(t);
            t.bt();
            return new ScopedSegmentExpression(e, s);
        }
        t.bt();
        return e;
    }
    $t(t, e) {
        const s = this.left.$t(t, 0);
        const n = this.right.$t(0, e);
        let i = s[s.length - 1];
        while (i.children.length > 0) {
            i = i.children[i.children.length - 1];
        }
        i.children.push(...n);
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
    static kt(t) {
        t.St();
        if (t.wt("(")) {
            const e = CompositeSegmentExpression.kt(t);
            t.Et(")");
            t.bt();
            return new SegmentGroupExpression(e);
        }
        t.bt();
        return SegmentExpression.kt(t);
    }
    $t(t, e) {
        return this.expression.$t(t + 1, e + 1);
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
    static kt(t) {
        t.St();
        const e = ComponentExpression.kt(t);
        const s = ViewportExpression.kt(t);
        const n = !t.wt("!");
        t.bt();
        return new SegmentExpression(e, s, n);
    }
    $t(t, e) {
        return [ ViewportInstruction.create({
            component: this.component.name,
            params: this.component.parameterList.It(),
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
    static kt(t) {
        t.St();
        t.St();
        if (!t.u) {
            if (t.dt("./")) {
                t.Rt();
            } else if (t.dt("../")) {
                t.Rt();
                t.Rt();
            } else {
                while (!t.u && !t.dt(...p)) {
                    t.Rt();
                }
            }
        }
        const e = t.Ct();
        if (e.length === 0) {
            t.xt("component name");
        }
        const s = ParameterListExpression.kt(t);
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
    static kt(t) {
        t.St();
        let e = null;
        if (t.wt("@")) {
            t.St();
            while (!t.u && !t.dt(...p)) {
                t.Rt();
            }
            e = decodeURIComponent(t.Ct());
            if (e.length === 0) {
                t.xt("viewport name");
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
    static kt(t) {
        t.St();
        const e = [];
        if (t.wt("(")) {
            do {
                e.push(ParameterExpression.kt(t, e.length));
                if (!t.wt(",")) {
                    break;
                }
            } while (!t.u && !t.dt(")"));
            t.Et(")");
        }
        t.bt();
        return new ParameterListExpression(e);
    }
    It() {
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
    static kt(t, e) {
        t.St();
        t.St();
        while (!t.u && !t.dt(...p)) {
            t.Rt();
        }
        let s = t.Ct();
        if (s.length === 0) {
            t.xt("parameter key");
        }
        let n;
        if (t.wt("=")) {
            t.St();
            while (!t.u && !t.dt(...p)) {
                t.Rt();
            }
            n = decodeURIComponent(t.Ct());
            if (n.length === 0) {
                t.xt("parameter value");
            }
        } else {
            n = s;
            s = e.toString();
        }
        t.bt();
        return new ParameterExpression(s, n);
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
    get Tt() {
        return this._state & 16256;
    }
    set Tt(t) {
        this._state = this._state & 127 | t;
    }
    get _t() {
        return this._state & 127;
    }
    set _t(t) {
        this._state = this._state & 16256 | t;
    }
    constructor(e, s, n) {
        this.viewport = e;
        this.hostController = s;
        this.Pt = false;
        this.At = null;
        this.Vt = null;
        this._state = 8256;
        this.Ot = "replace";
        this.Mt = null;
        this.jt = null;
        this.Lt = null;
        this.Ut = null;
        this.L = n.container.get(t.ILogger).scopeTo(`ViewportAgent<${n.routeConfigContext.Bt}>`);
    }
    static for(t, s) {
        let n = w.get(t);
        if (n === void 0) {
            const i = e.Controller.getCachedOrThrow(t);
            w.set(t, n = new ViewportAgent(t, i, s));
        }
        return n;
    }
    zt(t, e) {
        const s = this.Lt;
        if (s !== null) {
            ensureTransitionHasNotErrored(s);
        }
        this.Pt = true;
        switch (this._t) {
          case 64:
            switch (this.Tt) {
              case 8192:
                return;

              case 4096:
                return this.At.Dt(t, e);

              default:
                this.qt("activateFromViewport 1");
            }

          case 2:
            {
                if (this.Lt === null) throw new Error(getMessage(3350, this));
                const e = Batch.C((e => {
                    this.Dt(t, this.Lt, e);
                }));
                const s = new Promise((t => {
                    e.T((() => {
                        t();
                    }));
                }));
                return e.C().u ? void 0 : s;
            }

          default:
            this.qt("activateFromViewport 2");
        }
    }
    Ht(t, e) {
        const s = this.Lt;
        if (s !== null) {
            ensureTransitionHasNotErrored(s);
        }
        this.Pt = false;
        switch (this.Tt) {
          case 8192:
            return;

          case 4096:
            return this.At.Gt(t, e);

          case 128:
            return;

          default:
            {
                if (this.Lt === null) throw new Error(getMessage(3351, this));
                const e = Batch.C((e => {
                    this.Gt(t, this.Lt, e);
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
        if (!this.Wt()) {
            return false;
        }
        const e = this.viewport;
        const s = t.viewportName;
        const n = e.name;
        if (s !== S && n !== s) {
            return false;
        }
        const i = e.usedBy;
        if (i.length > 0 && !i.split(",").includes(t.componentName)) {
            return false;
        }
        return true;
    }
    Wt() {
        if (!this.Pt) {
            return false;
        }
        if (this._t !== 64) {
            return false;
        }
        return true;
    }
    Qt(e, s) {
        if (this.Lt === null) {
            this.Lt = e;
        }
        ensureTransitionHasNotErrored(e);
        if (e.guardsResult !== true) {
            return;
        }
        s.N();
        void t.onResolve(this.Ut, (() => {
            Batch.C((t => {
                for (const s of this.Mt.children) {
                    s.context.vpa.Qt(e, t);
                }
            })).T((t => {
                switch (this.Tt) {
                  case 4096:
                    switch (this.Ot) {
                      case "none":
                        this.Tt = 1024;
                        return;

                      case "invoke-lifecycles":
                      case "replace":
                        this.Tt = 2048;
                        t.N();
                        Batch.C((t => {
                            this.At.Qt(e, this.jt, t);
                        })).T((() => {
                            this.Tt = 1024;
                            t.$();
                        })).C();
                        return;
                    }

                  case 8192:
                    return;

                  default:
                    e.Jt(new Error(`Unexpected state at canUnload of ${this}`));
                }
            })).T((() => {
                s.$();
            })).C();
        }));
    }
    Yt(e, s) {
        if (this.Lt === null) {
            this.Lt = e;
        }
        ensureTransitionHasNotErrored(e);
        if (e.guardsResult !== true) {
            return;
        }
        s.N();
        Batch.C((s => {
            switch (this._t) {
              case 32:
                this._t = 16;
                switch (this.Ot) {
                  case "none":
                    return;

                  case "invoke-lifecycles":
                    return this.At.Yt(e, this.jt, s);

                  case "replace":
                    s.N();
                    void t.onResolve(this.jt.context.Kt(this.hostController, this.jt), (t => {
                        (this.Vt = t).Yt(e, this.jt, s);
                        s.$();
                    }));
                }

              case 64:
                return;

              default:
                this.qt("canLoad");
            }
        })).T((s => {
            if (e.guardsResult !== true) {
                return;
            }
            const n = this.jt;
            switch (this.Ot) {
              case "none":
              case "invoke-lifecycles":
                {
                    s.N();
                    const e = n.context;
                    void t.onResolve(e.routeConfigContext.allResolved, (() => t.onResolve(t.onResolve(t.onResolveAll(...n.residue.splice(0).map((t => createAndAppendNodes(this.L, n, t)))), (() => t.onResolveAll(...e.getAvailableViewportAgents().reduce(((t, e) => {
                        const s = e.viewport;
                        const i = s.default;
                        if (i === null) return t;
                        t.push(createAndAppendNodes(this.L, n, ViewportInstruction.create({
                            component: i,
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
            switch (this._t) {
              case 16:
                this._t = 8;
                for (const s of this.jt.children) {
                    s.context.vpa.Yt(e, t);
                }
                return;

              case 64:
                return;

              default:
                this.qt("canLoad");
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
            for (const s of this.Mt.children) {
                s.context.vpa.Xt(t, e);
            }
        })).T((s => {
            switch (this.Tt) {
              case 1024:
                switch (this.Ot) {
                  case "none":
                    this.Tt = 256;
                    return;

                  case "invoke-lifecycles":
                  case "replace":
                    this.Tt = 512;
                    s.N();
                    Batch.C((e => {
                        this.At.Xt(t, this.jt, e);
                    })).T((() => {
                        this.Tt = 256;
                        s.$();
                    })).C();
                    return;
                }

              case 8192:
                for (const s of this.Mt.children) {
                    s.context.vpa.Xt(t, e);
                }
                return;

              default:
                this.qt("unloading");
            }
        })).T((() => {
            e.$();
        })).C();
    }
    Zt(t, e) {
        ensureTransitionHasNotErrored(t);
        ensureGuardsResultIsTrue(this, t);
        e.N();
        Batch.C((e => {
            switch (this._t) {
              case 8:
                {
                    this._t = 4;
                    switch (this.Ot) {
                      case "none":
                        return;

                      case "invoke-lifecycles":
                        return this.At.Zt(t, this.jt, e);

                      case "replace":
                        return this.Vt.Zt(t, this.jt, e);
                    }
                }

              case 64:
                return;

              default:
                this.qt("loading");
            }
        })).T((e => {
            switch (this._t) {
              case 4:
                this._t = 2;
                for (const s of this.jt.children) {
                    s.context.vpa.Zt(t, e);
                }
                return;

              case 64:
                return;

              default:
                this.qt("loading");
            }
        })).T((() => {
            e.$();
        })).C();
    }
    Gt(e, s, n) {
        ensureTransitionHasNotErrored(s);
        ensureGuardsResultIsTrue(this, s);
        n.N();
        switch (this.Tt) {
          case 256:
            this.Tt = 128;
            switch (this.Ot) {
              case "none":
              case "invoke-lifecycles":
                n.$();
                return;

              case "replace":
                {
                    const i = this.hostController;
                    const r = this.At;
                    s.te((() => t.onResolve(r.Gt(e, i), (() => {
                        if (e === null) {
                            r.ee();
                        }
                    }))), (() => {
                        n.$();
                    }));
                }
            }
            return;

          case 8192:
            n.$();
            return;

          case 128:
            n.$();
            return;

          default:
            this.qt("deactivate");
        }
    }
    Dt(t, e, s) {
        ensureTransitionHasNotErrored(e);
        ensureGuardsResultIsTrue(this, e);
        s.N();
        if (this._t === 32) {
            Batch.C((t => {
                this.Yt(e, t);
            })).T((t => {
                this.Zt(e, t);
            })).T((s => {
                this.Dt(t, e, s);
            })).T((() => {
                s.$();
            })).C();
            return;
        }
        switch (this._t) {
          case 2:
            this._t = 1;
            Batch.C((s => {
                switch (this.Ot) {
                  case "none":
                  case "invoke-lifecycles":
                    return;

                  case "replace":
                    {
                        const n = this.hostController;
                        e.te((() => {
                            s.N();
                            return this.Vt.Dt(t, n);
                        }), (() => {
                            s.$();
                        }));
                    }
                }
            })).T((t => {
                this.se(e, t);
            })).T((() => {
                s.$();
            })).C();
            return;

          case 64:
            s.$();
            return;

          default:
            this.qt("activate");
        }
    }
    ne(e, s) {
        if (this.Tt === 8192) {
            this.Dt(null, e, s);
            return;
        }
        if (this._t === 64) {
            this.Gt(null, e, s);
            return;
        }
        ensureTransitionHasNotErrored(e);
        ensureGuardsResultIsTrue(this, e);
        if (!(this.Tt === 256 && this._t === 2)) {
            this.qt("swap");
        }
        this.Tt = 128;
        this._t = 1;
        switch (this.Ot) {
          case "none":
          case "invoke-lifecycles":
            {
                const t = mergeDistinct(this.jt.children, this.Mt.children);
                for (const n of t) {
                    n.context.vpa.ne(e, s);
                }
                return;
            }

          case "replace":
            {
                const n = this.hostController;
                const i = this.At;
                const r = this.Vt;
                s.N();
                Batch.C((s => {
                    e.te((() => {
                        s.N();
                        return t.onResolve(i.Gt(null, n), (() => i.ee()));
                    }), (() => {
                        s.$();
                    }));
                })).T((t => {
                    e.te((() => {
                        t.N();
                        return r.Dt(null, n);
                    }), (() => {
                        t.$();
                    }));
                })).T((t => {
                    this.se(e, t);
                })).T((() => {
                    s.$();
                })).C();
                return;
            }
        }
    }
    se(e, s) {
        const n = this.jt;
        e.te((() => {
            s.N();
            const e = n.context;
            return t.onResolve(e.routeConfigContext.allResolved, (() => {
                const s = n.children.slice();
                return t.onResolve(t.onResolveAll(...n.residue.splice(0).map((t => createAndAppendNodes(this.L, n, t)))), (() => t.onResolve(t.onResolveAll(...e.getAvailableViewportAgents().reduce(((t, e) => {
                    const s = e.viewport;
                    const i = s.default;
                    if (i === null) return t;
                    t.push(createAndAppendNodes(this.L, n, ViewportInstruction.create({
                        component: i,
                        viewport: s.name
                    })));
                    return t;
                }), [])), (() => n.children.filter((t => !s.includes(t)))))));
            }));
        }), (t => {
            Batch.C((s => {
                for (const n of t) {
                    e.te((() => {
                        s.N();
                        return n.context.vpa.Yt(e, s);
                    }), (() => {
                        s.$();
                    }));
                }
            })).T((s => {
                if (e.guardsResult !== true) return;
                for (const n of t) {
                    e.te((() => {
                        s.N();
                        return n.context.vpa.Zt(e, s);
                    }), (() => {
                        s.$();
                    }));
                }
            })).T((s => {
                if (e.guardsResult !== true) return;
                for (const n of t) {
                    e.te((() => {
                        s.N();
                        return n.context.vpa.Dt(null, e, s);
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
        switch (this._t) {
          case 64:
            this.jt = e;
            this._t = 32;
            break;

          default:
            this.qt("scheduleUpdate 1");
        }
        switch (this.Tt) {
          case 8192:
          case 4096:
          case 1024:
            break;

          default:
            this.qt("scheduleUpdate 2");
        }
        const s = this.At?.re ?? null;
        if (s === null || s.component !== e.component) {
            this.Ot = "replace";
        } else {
            this.Ot = e.context.routeConfigContext.config.et(s, e, t.transitionPlan);
        }
    }
    oe() {
        if (this.Mt !== null) {
            this.Mt.children.forEach((function(t) {
                t.context.vpa.oe();
            }));
        }
        if (this.jt !== null) {
            this.jt.children.forEach((function(t) {
                t.context.vpa.oe();
            }));
        }
        let e = null;
        let s = null;
        switch (this.Tt) {
          case 8192:
          case 4096:
            this.Lt = null;
            break;

          case 2048:
          case 1024:
            this.Tt = 4096;
            this.Lt = null;
            break;

          case 512:
          case 256:
          case 128:
            e = t.onResolve(this.At?.Gt(null, this.hostController), (() => {
                this.At?.ee();
                this.Tt = 8192;
                this.At = null;
            }));
            break;
        }
        switch (this._t) {
          case 64:
          case 32:
          case 16:
          case 8:
            this.jt = null;
            this._t = 64;
            break;

          case 4:
          case 2:
          case 1:
            {
                s = t.onResolve(this.Vt?.Gt(null, this.hostController), (() => {
                    this.Vt?.ee();
                    this.Ot = "replace";
                    this._t = 64;
                    this.Vt = null;
                    this.jt = null;
                }));
                break;
            }
        }
        if (e !== null && s !== null) {
            this.Ut = t.onResolve(t.onResolveAll(e, s), (() => {
                this.Lt = null;
                this.Ut = null;
            }));
        }
    }
    ae() {
        if (this.Mt !== null) {
            this.Mt.children.forEach((function(t) {
                t.context.vpa.ae();
            }));
        }
        if (this.jt !== null) {
            this.jt.children.forEach((function(t) {
                t.context.vpa.ae();
            }));
        }
        if (this.Lt !== null) {
            ensureTransitionHasNotErrored(this.Lt);
            switch (this._t) {
              case 64:
                switch (this.Tt) {
                  case 8192:
                  case 128:
                    this.Tt = 8192;
                    this.At = null;
                    break;

                  default:
                    this.qt("endTransition 1");
                }
                break;

              case 1:
                switch (this.Tt) {
                  case 8192:
                  case 128:
                    switch (this.Ot) {
                      case "none":
                        this.Tt = 4096;
                        break;

                      case "invoke-lifecycles":
                        this.Tt = 4096;
                        this.At.re = this.jt;
                        break;

                      case "replace":
                        this.Tt = 4096;
                        this.At = this.Vt;
                        break;
                    }
                    this.Mt = this.jt;
                    break;

                  default:
                    this.qt("endTransition 2");
                }
                break;

              default:
                this.qt("endTransition 3");
            }
            this.Ot = "replace";
            this._t = 64;
            this.jt = null;
            this.Vt = null;
            this.Lt = null;
        }
    }
    toString() {
        return `VPA(state:${$state(this._state)},plan:'${this.Ot}',n:${this.jt},c:${this.Mt},viewport:${this.viewport})`;
    }
    ee() {
        this.At?.ee();
    }
    qt(t) {
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
        return this.ue.root;
    }
    get isInstructionsFinalized() {
        return this.ce;
    }
    constructor(t, e, s, n, i, r, o, a, u, c, h, l, f) {
        this.path = t;
        this.finalPath = e;
        this.context = s;
        this.he = n;
        this.instruction = i;
        this.params = r;
        this.queryParams = o;
        this.fragment = a;
        this.data = u;
        this.le = c;
        this.title = h;
        this.component = l;
        this.residue = f;
        this.fe = 1;
        this.ce = false;
        this.children = [];
        this.he ??= i;
    }
    static create(e) {
        const {[s.RESIDUE]: n, ...i} = e.params ?? {};
        return new RouteNode(e.path, e.finalPath, e.context, e.originalInstruction ?? e.instruction, e.instruction, Object.freeze(i), e.queryParams ?? v, e.fragment ?? null, Object.freeze(e.data ?? t.emptyObject), e.le ?? null, e.title ?? null, e.component, e.residue ?? []);
    }
    contains(t, e = false) {
        if (this.context.routeConfigContext === t.options.context.routeConfigContext) {
            const s = this.children;
            const n = t.children;
            for (let t = 0, i = s.length; t < i; ++t) {
                for (let r = 0, o = n.length; r < o; ++r) {
                    const a = n[r];
                    const u = e ? a.recognizedRoute?.route.endpoint : null;
                    const c = s[t + r] ?? null;
                    const h = c !== null ? c.isInstructionsFinalized ? c.instruction : c.he : null;
                    const l = h?.recognizedRoute?.route.endpoint;
                    if (t + r < i && ((u?.equalsOrResidual(l) ?? false) || (h?.contains(a) ?? false))) {
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
    pe(t) {
        this.children.push(t);
        t.ge(this.ue);
    }
    de() {
        for (const t of this.children) {
            t.de();
            t.context.vpa.oe();
        }
        this.children.length = 0;
    }
    getTitle(t) {
        const e = [ ...this.children.map((e => e.getTitle(t))), typeof this.title === "function" ? this.title.call(void 0, this) : this.title ].filter((t => t !== null));
        return e.length === 0 ? null : e.join(t);
    }
    computeAbsolutePath() {
        if (this.context.routeConfigContext.isRoot) {
            return "";
        }
        const t = this.context.parent.node.computeAbsolutePath();
        const e = this.instruction.toUrlComponent(false);
        return t.length > 0 ? e.length > 0 ? `${t}/${e}` : t : e;
    }
    ge(t) {
        this.ue = t;
        for (const e of this.children) {
            e.ge(t);
        }
    }
    we() {
        this.ce = true;
        const t = this.children.map((t => t.we()));
        const e = this.instruction.nt();
        e.children.splice(0, e.children.length, ...t);
        return this.instruction = e;
    }
    nt() {
        const t = new RouteNode(this.path, this.finalPath, this.context, this.he, this.instruction, this.params, this.queryParams, this.fragment, this.data, this.le, this.title, this.component, [ ...this.residue ]);
        const e = this.children;
        const s = e.length;
        for (let n = 0; n < s; ++n) {
            t.children.push(e[n].nt());
        }
        t.fe = this.fe + 1;
        if (t.context.node === this) {
            t.context.node = t;
        }
        return t;
    }
    toString() {
        const t = [];
        const e = this.context?.routeConfigContext.config.rt() ?? "";
        if (e.length > 0) {
            t.push(`c:'${e}'`);
        }
        const s = this.context?.routeConfigContext.config.path ?? "";
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
        return `RN(ctx:'${this.context?.routeConfigContext.Bt}',${t.join(",")})`;
    }
}

class RouteTree {
    constructor(t, e, s, n) {
        this.options = t;
        this.queryParams = e;
        this.fragment = s;
        this.root = n;
    }
    contains(t, e = false) {
        return this.root.contains(t, e);
    }
    nt() {
        const t = new RouteTree(this.options.nt(), this.queryParams, this.fragment, this.root.nt());
        t.root.ge(this);
        return t;
    }
    me() {
        return new ViewportInstructionTree(this.options, true, this.root.children.map((t => t.we())), this.queryParams, this.fragment);
    }
    ve(t) {
        this.queryParams = Object.freeze(mergeURLSearchParams(this.queryParams, t, true));
    }
    toString() {
        return this.root.toString();
    }
}

function createAndAppendNodes(e, s, n) {
    e.trace(`createAndAppendNodes(node:%s,vi:%s`, s, n);
    switch (n.component.type) {
      case 0:
        switch (n.component.value) {
          case "..":
            s = s.context.parent?.node ?? s;
            s.de();

          case ".":
            return t.onResolveAll(...n.children.map((t => createAndAppendNodes(e, s, t))));

          default:
            {
                e.trace(`createAndAppendNodes invoking createNode`);
                const i = s.context;
                const r = n.nt();
                let o = n.recognizedRoute;
                if (o !== null) return appendNode(e, s, createConfiguredNode(e, s, n, o, r));
                if (n.children.length === 0) {
                    const t = i.routeConfigContext.Ee(n);
                    if (t !== null) {
                        s.ue.ve(t.query);
                        const i = t.vi;
                        i.children.push(...n.children);
                        return appendNode(e, s, createConfiguredNode(e, s, i, i.recognizedRoute, n));
                    }
                }
                let a = 0;
                let u = n.component.value;
                let c = n;
                while (c.children.length === 1) {
                    c = c.children[0];
                    if (c.component.type === 0) {
                        ++a;
                        u = `${u}/${c.component.value}`;
                    } else {
                        break;
                    }
                }
                o = i.routeConfigContext.recognize(u);
                e.trace("createNode recognized route: %s", o);
                const h = o?.residue ?? null;
                e.trace("createNode residue:", h);
                const l = h === null;
                if (o === null || h === u) {
                    const r = i.routeConfigContext.Ee({
                        component: n.component.value,
                        params: n.params ?? t.emptyObject,
                        open: n.open,
                        close: n.close,
                        viewport: n.viewport,
                        children: n.children
                    });
                    if (r !== null) {
                        s.ue.ve(r.query);
                        return appendNode(e, s, createConfiguredNode(e, s, r.vi, r.vi.recognizedRoute, n));
                    }
                    const o = n.component.value;
                    if (o === "") return;
                    let a = n.viewport;
                    if (a === null || a.length === 0) a = S;
                    const u = i.getFallbackViewportAgent(a);
                    const c = u !== null ? u.viewport.it(n, s, i) : i.routeConfigContext.config.it(n, s, i);
                    if (c === null) throw new UnknownRouteError(getMessage(3401, o, i.routeConfigContext.Bt, a, o, i.routeConfigContext.component.name));
                    if (typeof c === "string") {
                        e.trace(`Fallback is set to '${c}'. Looking for a recognized route.`);
                        const t = i.routeConfigContext.childRoutes.find((t => t.id === c));
                        if (t !== void 0) return appendNode(e, s, createFallbackNode(e, t, s, n));
                        e.trace(`No route configuration for the fallback '${c}' is found; trying to recognize the route.`);
                        const r = i.routeConfigContext.recognize(c, true);
                        if (r !== null && r.residue !== c) return appendNode(e, s, createConfiguredNode(e, s, n, r, null));
                    }
                    e.trace(`The fallback '${c}' is not recognized as a route; treating as custom element name.`);
                    return t.onResolve(resolveRouteConfiguration(c, false, i.routeConfigContext.config, null, i.routeConfigContext), (t => appendNode(e, s, createFallbackNode(e, t, s, n))));
                }
                o.residue = null;
                n.component.value = l ? u : u.slice(0, -(h.length + 1));
                let f = !l;
                for (let t = 0; t < a; ++t) {
                    const t = n.children[0];
                    if (h?.startsWith(t.component.value) ?? false) {
                        f = false;
                        break;
                    }
                    n.viewport = t.viewport;
                    n.children = t.children;
                }
                if (f) {
                    n.children.unshift(ViewportInstruction.create(h));
                }
                n.recognizedRoute = o;
                e.trace("createNode after adjustment vi:%s", n);
                return appendNode(e, s, createConfiguredNode(e, s, n, o, r));
            }
        }

      case 3:
      case 4:
      case 2:
        {
            const i = s.context;
            return t.onResolve(resolveCustomElementDefinition(n.component.value, i.routeConfigContext)[1], (r => {
                const {vi: o, query: a} = i.routeConfigContext.Ee({
                    component: r,
                    params: n.params ?? t.emptyObject,
                    open: n.open,
                    close: n.close,
                    viewport: n.viewport,
                    children: n.children
                });
                s.ue.ve(a);
                return appendNode(e, s, createConfiguredNode(e, s, o, o.recognizedRoute, n));
            }));
        }
    }
}

function createConfiguredNode(e, s, n, i, r, o = i.route.endpoint.route) {
    const a = s.context;
    const u = s.ue;
    return t.onResolve(o.handler, (c => {
        o.handler = c;
        e.trace(`creatingConfiguredNode(rdc:%s, vi:%s)`, c, n);
        if (c.redirectTo === null) {
            const h = (n.viewport?.length ?? 0) > 0;
            const l = h ? n.viewport : c.viewport;
            return t.onResolve(resolveCustomElementDefinition(c.J(n, a, s, i.route), a.routeConfigContext)[1], (f => {
                const p = a.xe(new ViewportRequest(l, f.name));
                if (!h) {
                    n.viewport = p.viewport.name;
                }
                const g = a.container.get(E);
                return t.onResolve(g.getRouteContext(p, f, null, p.hostController.container, a.routeConfigContext.config, a, c), (t => {
                    e.trace("createConfiguredNode setting the context node");
                    const a = t.node = RouteNode.create({
                        path: i.route.endpoint.route.path,
                        finalPath: o.path,
                        context: t,
                        instruction: n,
                        originalInstruction: r,
                        params: i.route.params,
                        queryParams: u.queryParams,
                        fragment: u.fragment,
                        data: c.data,
                        le: l,
                        component: f,
                        title: c.title,
                        residue: n.children.slice()
                    });
                    a.ge(s.ue);
                    e.trace(`createConfiguredNode(vi:%s) -> %s`, n, a);
                    return a;
                }));
            }));
        }
        const h = RouteExpression.parse(x.parse(o.path));
        const l = RouteExpression.parse(x.parse(c.redirectTo));
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
                    g.push(i.route.params[w.component.parameterName]);
                } else {
                    g.push(w.component.name);
                }
            }
        }
        const y = g.filter(Boolean).join("/");
        const R = a.routeConfigContext.recognize(y);
        if (R === null) throw new UnknownRouteError(getMessage(3402, y, a.routeConfigContext.Bt, y, a.routeConfigContext.component.name));
        return createConfiguredNode(e, s, ViewportInstruction.create({
            recognizedRoute: R,
            component: y,
            children: n.children,
            viewport: n.viewport,
            open: n.open,
            close: n.close
        }), R, r);
    }));
}

function appendNode(e, s, n) {
    return t.onResolve(n, (t => {
        e.trace(`appendNode($childNode:%s)`, t);
        s.pe(t);
        return t.context.vpa.ie(s.ue.options, t);
    }));
}

function createFallbackNode(e, n, i, r) {
    const o = new $RecognizedRoute(new s.RecognizedRoute(new s.Endpoint(new s.ConfigurableRoute(n.path[0], n.caseSensitive, n), []), t.emptyObject), null);
    r.children.length = 0;
    return createConfiguredNode(e, i, r, o, null);
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
        return this.ye;
    }
    constructor(t, e, s, n, i, r, o, a, u, c, h, l, f, p, g) {
        this.id = t;
        this.prevInstructions = e;
        this.instructions = s;
        this.finalInstructions = n;
        this.instructionsChanged = i;
        this.trigger = r;
        this.options = o;
        this.managedState = a;
        this.previousRouteTree = u;
        this.routeTree = c;
        this.promise = h;
        this.resolve = l;
        this.reject = f;
        this.guardsResult = p;
        this.error = g;
        this.ye = false;
    }
    static Z(t) {
        return new Transition(t.id, t.prevInstructions, t.instructions, t.finalInstructions, t.instructionsChanged, t.trigger, t.options, t.managedState, t.previousRouteTree, t.routeTree, t.promise, t.resolve, t.reject, t.guardsResult, void 0);
    }
    te(t, e) {
        if (this.guardsResult !== true) {
            return;
        }
        try {
            const s = t();
            if (s instanceof Promise) {
                s.then(e).catch((t => {
                    this.Jt(t);
                }));
            } else {
                e(s);
            }
        } catch (t) {
            this.Jt(t);
        }
    }
    Jt(t) {
        this.ye = t instanceof UnknownRouteError;
        this.reject(this.error = t);
    }
    toString() {
        return `T(id:${this.id},trigger:'${this.trigger}',instructions:${this.instructions})`;
    }
}

const E = /*@__PURE__*/ t.DI.createInterface("IRouter", (t => t.singleton(Router)));

class Router {
    get Re() {
        const t = this.Se;
        if (t !== null) return t;
        if (!this.c.has(C, true)) throw new Error(getMessage(3271));
        return this.Se = this.c.get(C);
    }
    get routeTree() {
        let t = this.Ce;
        if (t === null) {
            const s = this.Re;
            t = this.Ce = new RouteTree(NavigationOptions.create(this.options, {}), v, null, RouteNode.create({
                path: "",
                finalPath: "",
                context: s,
                instruction: null,
                component: e.CustomElement.getDefinition(s.routeConfigContext.config.component),
                title: s.routeConfigContext.config.title
            }));
        }
        return t;
    }
    get currentTr() {
        return this.be ??= Transition.Z({
            id: 0,
            prevInstructions: this.Ne,
            instructions: this.Ne,
            finalInstructions: this.Ne,
            instructionsChanged: true,
            trigger: "api",
            options: NavigationOptions.create(this.options, {}),
            managedState: null,
            previousRouteTree: this.routeTree.nt(),
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
        return this.ke;
    }
    constructor() {
        this.Se = null;
        this.Ce = null;
        this.be = null;
        this.$e = false;
        this.Ie = 0;
        this.Te = null;
        this._e = null;
        this.Pe = false;
        this.ke = false;
        this.c = t.resolve(t.IContainer);
        this.Ae = t.resolve(e.IPlatform);
        this.L = t.resolve(t.ILogger).root.scopeTo("Router");
        this._ = t.resolve(u);
        this.Ve = t.resolve(h);
        this.options = t.resolve(R);
        this.Oe = new WeakMap;
        this.Me = new Map;
        this.Ne = ViewportInstructionTree.create("", this.options, null, null);
        this.c.registerResolver(Router, t.Registration.instance(Router, this));
    }
    je(t) {
        return RouteContext.resolve(this.Re, t);
    }
    start(t) {
        this.Pe = typeof this.options.buildTitle === "function";
        this.Ve.startListening();
        this._e = this._.subscribe("au:router:location-change", (t => {
            this.Ae.taskQueue.queueTask((() => {
                const e = isManagedState(t.state) ? t.state : null;
                const s = this.options;
                const n = NavigationOptions.create(s, {
                    historyStrategy: "replace"
                });
                const i = ViewportInstructionTree.create(t.url, s, n, this.Re);
                this.Le(i, t.trigger, e, null);
            }));
        }));
        if (!this.$e && t) {
            return this.load(this.Ve.getPath(), {
                historyStrategy: this.options.historyStrategy !== "none" ? "replace" : "none"
            });
        }
    }
    stop() {
        this.Ve.stopListening();
        this._e?.dispose();
    }
    load(e, s) {
        return t.onResolve(this.createViewportInstructions(e, s ?? null), (t => this.Le(t, "api", null, null)));
    }
    isActive(t, e) {
        const s = this.je(e);
        const n = t instanceof ViewportInstructionTree ? t : this.createViewportInstructions(t, {
            context: s,
            historyStrategy: this.options.historyStrategy
        });
        return this.routeTree.contains(n, false);
    }
    getRouteContext(e, s, n, i, r, o, a) {
        return t.onResolve(this.getRouteConfigContext(a, s, n, i, r, o?.routeConfigContext ?? null), (t => {
            let s = this.Me.get(e);
            if (s === void 0) {
                this.Me.set(e, s = new WeakMap);
            }
            let n = s.get(t);
            if (n !== void 0) {
                return n;
            }
            const r = i.has(C, true) ? i.get(C) : null;
            s.set(t, n = new RouteContext(e, r, i, this, t, this.Ve));
            return n;
        }));
    }
    getRouteConfigContext(e, s, n, i, r, o) {
        return t.onResolve(e instanceof RouteConfig && !e.X ? e : resolveRouteConfiguration(typeof n?.getRouteConfig === "function" ? n : s.Type, false, r, null, o), (t => {
            let e = this.Oe.get(t);
            if (e != null) return e;
            e = new RouteConfigContext(o, s, t, i, this);
            this.Oe.set(t, e);
            return e;
        }));
    }
    generatePath(e, s) {
        return t.onResolve(this.createViewportInstructions(createEagerInstructions(e), {
            context: s ?? this.Re
        }, true), (t => t.toUrl(true, this.options.Ue)));
    }
    createViewportInstructions(t, e, s) {
        if (t instanceof ViewportInstructionTree) return t;
        let n = e?.context ?? null;
        if (n !== null) n = e.context = this.je(n);
        return (n ?? this.Se).createViewportInstructions(t, e, s);
    }
    Le(t, e, s, n) {
        const i = this.currentTr;
        const r = this.L;
        if (e !== "api" && i.trigger === "api" && i.instructions.equals(t)) {
            return true;
        }
        let o = void 0;
        let a = void 0;
        let u;
        const c = this.options.restorePreviousRouteTreeOnError;
        if (n === null || n.erredWithUnknownRoute || n.error != null && c) {
            u = new Promise((function(t, e) {
                o = t;
                a = e;
            }));
        } else {
            u = n.promise;
            o = n.resolve;
            a = n.reject;
        }
        const h = this.Te = Transition.Z({
            id: ++this.Ie,
            trigger: e,
            managedState: s,
            prevInstructions: i.finalInstructions,
            finalInstructions: t,
            instructionsChanged: !i.finalInstructions.equals(t),
            instructions: t,
            options: t.options,
            promise: u,
            resolve: o,
            reject: a,
            previousRouteTree: this.routeTree,
            routeTree: this.Ce = this.routeTree.nt(),
            guardsResult: true,
            error: void 0
        });
        if (!this.ke) {
            try {
                this.te(h);
            } catch (t) {
                h.Jt(t);
            }
        }
        return h.promise.then((t => t)).catch((t => {
            error(r, 3270, h, t);
            if (h.erredWithUnknownRoute) {
                this.Be(h);
            } else {
                this.ke = false;
                this._.publish(new NavigationErrorEvent(h.id, h.instructions, t));
                if (c) {
                    this.Be(h);
                } else {
                    const t = this.Te;
                    if (t !== null) {
                        t.previousRouteTree = h.previousRouteTree;
                    } else {
                        this.Ce = h.previousRouteTree;
                    }
                }
            }
            throw t;
        }));
    }
    te(e) {
        this.currentTr = e;
        this.Te = null;
        this.ke = true;
        let s = this.je(e.options.context);
        this._.publish(new NavigationStartEvent(e.id, e.instructions, e.trigger, e.managedState));
        if (this.Te !== null) {
            return this.te(this.Te);
        }
        e.te((() => {
            const n = e.finalInstructions;
            const i = this.Re;
            const r = e.routeTree;
            r.options = n.options;
            r.queryParams = i.node.ue.queryParams = n.queryParams;
            r.fragment = i.node.ue.fragment = n.fragment;
            const o = /*@__PURE__*/ s.container.get(t.ILogger).scopeTo("RouteTree");
            if (n.isAbsolute) {
                s = i;
            }
            if (s === i) {
                r.root.ge(r);
                i.node = r.root;
            }
            const a = s.routeConfigContext.allResolved instanceof Promise ? " - awaiting promise" : "";
            o.trace(`updateRouteTree(rootCtx:%s,rt:%s,vit:%s)${a}`, i, r, n);
            return t.onResolve(s.routeConfigContext.allResolved, (() => updateNode(o, n, s, i.node)));
        }), (() => {
            const t = e.previousRouteTree.root.children;
            const s = e.routeTree.root.children;
            const n = mergeDistinct(t, s);
            Batch.C((s => {
                for (const n of t) {
                    n.context.vpa.Qt(e, s);
                }
            })).T((t => {
                if (e.guardsResult !== true) {
                    t.N();
                    this.Be(e);
                }
            })).T((t => {
                for (const n of s) {
                    n.context.vpa.Yt(e, t);
                }
            })).T((t => {
                if (e.guardsResult !== true) {
                    t.N();
                    this.Be(e);
                }
            })).T((s => {
                for (const n of t) {
                    n.context.vpa.Xt(e, s);
                }
            })).T((t => {
                for (const n of s) {
                    n.context.vpa.Zt(e, t);
                }
            })).T((t => {
                for (const s of n) {
                    s.context.vpa.ne(e, t);
                }
            })).T((t => {
                if (e.guardsResult !== true) {
                    t.N();
                    this.Be(e);
                }
            })).T((() => {
                n.forEach((function(t) {
                    t.context.vpa.ae();
                }));
                this.$e = true;
                this.Ne = e.finalInstructions = e.routeTree.me();
                this.ke = false;
                const t = e.finalInstructions.toUrl(true, this.options.Ue);
                switch (e.options.ze(this.Ne)) {
                  case "none":
                    break;

                  case "push":
                    this.Ve.pushState(toManagedState(e.options.state, e.id), this.updateTitle(e), t);
                    break;

                  case "replace":
                    this.Ve.replaceState(toManagedState(e.options.state, e.id), this.updateTitle(e), t);
                    break;
                }
                this._.publish(new NavigationEndEvent(e.id, e.instructions, this.Ne));
                e.resolve(true);
                this.De();
            })).C();
        }));
    }
    updateTitle(t = this.currentTr) {
        const e = this.qe(t);
        if (e.length > 0) {
            this.Ae.document.title = e;
        }
        return this.Ae.document.title;
    }
    qe(t = this.currentTr) {
        let e;
        if (this.Pe) {
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
    Be(e) {
        const s = e.previousRouteTree.root.children;
        const n = e.routeTree.root.children;
        const i = mergeDistinct(s, n);
        i.forEach((function(t) {
            t.context.vpa.oe();
        }));
        this.Ne = e.prevInstructions;
        this.Ce = e.previousRouteTree;
        this.ke = false;
        const r = e.guardsResult;
        this._.publish(new NavigationCancelEvent(e.id, e.instructions, `guardsResult is ${r}`));
        if (r === false) {
            e.resolve(false);
            this.De();
        } else {
            let s;
            if (this.$e && (e.erredWithUnknownRoute || e.error != null && this.options.restorePreviousRouteTreeOnError)) s = e.prevInstructions; else if (r === true) return; else s = r;
            void t.onResolve(this.Le(s, "api", e.managedState, e), (() => {}));
        }
    }
    De() {
        if (this.Te === null) return;
        this.Ae.taskQueue.queueTask((() => {
            const t = this.Te;
            if (t === null) return;
            try {
                this.te(t);
            } catch (e) {
                t.Jt(e);
            }
        }));
    }
}

function updateNode(e, s, n, i) {
    e.trace(`updateNode(ctx:%s,node:%s)`, n, i);
    i.queryParams = s.queryParams;
    i.fragment = s.fragment;
    if (!i.context.routeConfigContext.isRoot) {
        i.context.vpa.ie(i.ue.options, i);
    }
    if (i.context === n) {
        i.de();
        return t.onResolve(t.onResolveAll(...s.children.map((t => createAndAppendNodes(e, i, t)))), (() => t.onResolveAll(...n.getAvailableViewportAgents().reduce(((t, s) => {
            const n = s.viewport;
            const r = n.default;
            if (r === null) return t;
            t.push(createAndAppendNodes(e, i, ViewportInstruction.create({
                component: r,
                viewport: n.name
            })));
            return t;
        }), []))));
    }
    return t.onResolveAll(...i.children.map((t => updateNode(e, s, n, t))));
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
            const n = t.slice(s + 1);
            e = decodeURIComponent(n);
            t = t.slice(0, s);
        }
        let n = null;
        const i = t.indexOf("?");
        if (i >= 0) {
            const e = t.slice(i + 1);
            t = t.slice(0, i);
            n = Object.freeze(new URLSearchParams(e));
        }
        return new ParsedUrl(t, n ?? v, e);
    }
}

function stringify(t, e, s) {
    let n;
    if (typeof t === "string") {
        n = t;
    } else {
        n = t.path;
        e = t.query;
        s = t.fragment;
    }
    e ??= v;
    let i = e.toString();
    i = i === "" ? "" : `?${i}`;
    const r = s != null && s.length > 0 ? `#${encodeURIComponent(s)}` : "";
    return `${n}${i}${r}`;
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
    constructor(t, e, s, n, i, r, o) {
        this.useUrlFragmentHash = t;
        this.useHref = e;
        this.historyStrategy = s;
        this.buildTitle = n;
        this.useNavigationModel = i;
        this.activeClass = r;
        this.restorePreviousRouteTreeOnError = o;
        this.Ue = t ? y : x;
    }
    static create(t) {
        return new RouterOptions(t.useUrlFragmentHash ?? false, t.useHref ?? true, t.historyStrategy ?? "push", t.buildTitle ?? null, t.useNavigationModel ?? true, t.activeClass ?? null, t.restorePreviousRouteTreeOnError ?? true);
    }
    toString() {
        return "RO";
    }
}

class NavigationOptions {
    constructor(t, e, s, n, i, r, o, a) {
        this.historyStrategy = t;
        this.title = e;
        this.titleSeparator = s;
        this.context = n;
        this.queryParams = i;
        this.fragment = r;
        this.state = o;
        this.transitionPlan = a;
    }
    static create(t, e) {
        return new NavigationOptions(e.historyStrategy ?? t.historyStrategy, e.title ?? null, e.titleSeparator ?? " | ", e.context ?? null, e.queryParams ?? null, e.fragment ?? "", e.state ?? null, e.transitionPlan ?? null);
    }
    nt() {
        return new NavigationOptions(this.historyStrategy, this.title, this.titleSeparator, this.context, {
            ...this.queryParams
        }, this.fragment, this.state === null ? null : {
            ...this.state
        }, this.transitionPlan);
    }
    ze(t) {
        return valueOrFuncToValue(t, this.historyStrategy);
    }
}

const S = "default";

class ViewportInstruction {
    constructor(t, e, s, n, i, r, o) {
        this.open = t;
        this.close = e;
        this.recognizedRoute = s;
        this.component = n;
        this.viewport = i;
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
        const n = this.viewport ?? null;
        const i = t.viewport ?? null;
        if (n !== null && i !== null && n !== i) return false;
        for (let t = 0, n = s.length; t < n; ++t) {
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
        for (let t = 0, n = e.length; t < n; ++t) {
            if (!e[t].equals(s[t])) {
                return false;
            }
        }
        return true;
    }
    nt() {
        return new ViewportInstruction(this.open, this.close, this.recognizedRoute, this.component.nt(), this.viewport, this.params, [ ...this.children ]);
    }
    toUrlComponent(t = true) {
        const e = this.component.toUrlComponent();
        const s = this.viewport;
        const n = e.length === 0 || s === null || s.length === 0 || s === S ? "" : `@${s}`;
        const i = `${"(".repeat(this.open)}${e}${stringifyParams(this.params)}${n}${")".repeat(this.close)}`;
        const r = t ? this.children.map((t => t.toUrlComponent())).join("+") : "";
        return i.length > 0 ? r.length > 0 ? `${i}/${r}` : i : r;
    }
    toString() {
        const t = `c:${this.component}`;
        const e = this.viewport === null || this.viewport.length === 0 ? "" : `viewport:${this.viewport}`;
        const s = this.children.length === 0 ? "" : `children:[${this.children.map(String).join(",")}]`;
        const n = [ t, e, s ].filter(Boolean).join(",");
        return `VPI(${n})`;
    }
}

function stringifyParams(e) {
    if (e === null) return "";
    const s = Object.keys(e);
    const n = s.length;
    if (n === 0) return "";
    const i = Array(n);
    const r = [];
    const o = [];
    for (const e of s) {
        if (t.isArrayIndex(e)) {
            r.push(Number(e));
        } else {
            o.push(e);
        }
    }
    for (let t = 0; t < n; ++t) {
        const s = r.indexOf(t);
        if (s > -1) {
            i[t] = e[t];
            r.splice(s, 1);
        } else {
            const s = o.shift();
            i[t] = `${s}=${e[s]}`;
        }
    }
    return `(${i.join(",")})`;
}

class ViewportInstructionTree {
    constructor(t, e, s, n, i) {
        this.options = t;
        this.isAbsolute = e;
        this.children = s;
        this.queryParams = n;
        this.fragment = i;
        Object.freeze(n);
    }
    static create(e, s, n, i, r) {
        n = n instanceof NavigationOptions ? n : NavigationOptions.create(s, n ?? t.emptyObject);
        let o = n.context;
        if (!(o instanceof RouteContext) && i != null) {
            o = n.context = RouteContext.resolve(i, o);
        }
        const a = o != null;
        if (e instanceof Array) {
            const s = e.length;
            const i = new Array(s);
            const u = new URLSearchParams(n.queryParams ?? t.emptyObject);
            const c = new Array(s);
            for (let n = 0; n < s; n++) {
                const s = e[n];
                c[n] = t.onResolve(a ? o.routeConfigContext.Ee(s, r) : null, (t => {
                    if (t !== null) {
                        i[n] = t.vi;
                        mergeURLSearchParams(u, t.query, false);
                    } else {
                        i[n] = ViewportInstruction.create(s);
                    }
                }));
            }
            return t.onResolve(t.onResolveAll(...c), (() => new ViewportInstructionTree(n, false, i, u, n.fragment)));
        }
        if (typeof e === "string") {
            const t = RouteExpression.parse(s.Ue.parse(e));
            return t.toInstructionTree(n);
        }
        return t.onResolve(a ? o.routeConfigContext.Ee(isPartialViewportInstruction(e) ? {
            ...e,
            params: e.params ?? t.emptyObject
        } : {
            component: e,
            params: t.emptyObject
        }, r) : null, (s => {
            const i = new URLSearchParams(n.queryParams ?? t.emptyObject);
            return s !== null ? new ViewportInstructionTree(n, false, [ s.vi ], mergeURLSearchParams(i, s.query, false), n.fragment) : new ViewportInstructionTree(n, false, [ ViewportInstruction.create(e) ], i, n.fragment);
        }));
    }
    equals(t) {
        const e = this.children;
        const s = t.children;
        if (e.length !== s.length) {
            return false;
        }
        for (let t = 0, n = e.length; t < n; ++t) {
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
            while (e != null && !e.routeConfigContext.isRoot) {
                const s = e.vpa;
                const n = s.Tt === 4096 ? s.Mt : s.jt;
                if (n == null) throw new Error("Invalid operation; nodes of the viewport agent are not set.");
                t.splice(0, 0, n.instruction.toUrlComponent());
                e = e.parent;
            }
            if (t[0] === "") {
                t.splice(0, 1);
            }
            s = t.join("/");
        }
        const n = this.toPath();
        return e.stringify(s.length > 0 ? `${s}/${n}` : n, this.queryParams, this.fragment);
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
    nt() {
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
    constructor(e, s, n, i, r) {
        this.He = e;
        this.Ge = s;
        this.re = n;
        this.Re = i;
        this.Fe = r;
        this.L = s.container.get(t.ILogger).scopeTo(`ComponentAgent<${i.routeConfigContext.Bt}>`);
        const o = s.lifecycleHooks;
        this.We = (o.canLoad ?? []).map((t => t.instance));
        this.Qe = (o.loading ?? []).map((t => t.instance));
        this.Je = (o.canUnload ?? []).map((t => t.instance));
        this.Ye = (o.unloading ?? []).map((t => t.instance));
        this.Ke = "canLoad" in e;
        this.Xe = "loading" in e;
        this.Ze = "canUnload" in e;
        this.ts = "unloading" in e;
    }
    Dt(t, s) {
        const n = this.Ge;
        const i = this.Re.vpa.hostController;
        switch (n.mountTarget) {
          case e.MountTarget.host:
          case e.MountTarget.shadowRoot:
            i.host.appendChild(n.host);
            break;

          case e.MountTarget.location:
            i.host.append(n.location.$start, n.location);
            break;

          case e.MountTarget.none:
            throw new Error("Invalid mount target for routed component");
        }
        if (t === null) {
            return this.Ge.activate(this.Ge, s);
        }
        void this.Ge.activate(t, s);
    }
    Gt(t, e) {
        const s = this.Ge;
        s.host?.remove();
        s.location?.remove();
        s.location?.$start?.remove();
        if (t === null) {
            return s.deactivate(s, e);
        }
        void s.deactivate(t, e);
    }
    ee() {
        this.Ge.dispose();
    }
    Qt(t, e, s) {
        s.N();
        let n = Promise.resolve();
        for (const i of this.Je) {
            s.N();
            n = n.then((() => new Promise((n => {
                if (t.guardsResult !== true) {
                    s.$();
                    n();
                    return;
                }
                t.te((() => i.canUnload(this.He, e, this.re)), (e => {
                    if (t.guardsResult === true && e === false) {
                        t.guardsResult = false;
                    }
                    s.$();
                    n();
                }));
            }))));
        }
        if (this.Ze) {
            s.N();
            n = n.then((() => {
                if (t.guardsResult !== true) {
                    s.$();
                    return;
                }
                t.te((() => this.He.canUnload(e, this.re)), (e => {
                    if (t.guardsResult === true && e === false) {
                        t.guardsResult = false;
                    }
                    s.$();
                }));
            }));
        }
        s.$();
    }
    Yt(t, e, s) {
        const n = this.Re.root;
        s.N();
        let i = Promise.resolve();
        for (const r of this.We) {
            s.N();
            i = i.then((() => new Promise((i => {
                if (t.guardsResult !== true) {
                    s.$();
                    i();
                    return;
                }
                t.te((() => r.canLoad(this.He, e.params, e, this.re)), (e => {
                    if (t.guardsResult === true && e != null && e !== true) {
                        t.guardsResult = e === false ? false : ViewportInstructionTree.create(e, this.Fe, null, n);
                    }
                    s.$();
                    i();
                }));
            }))));
        }
        if (this.Ke) {
            s.N();
            i = i.then((() => {
                if (t.guardsResult !== true) {
                    s.$();
                    return;
                }
                t.te((() => this.He.canLoad(e.params, e, this.re)), (e => {
                    if (t.guardsResult === true && e != null && e !== true) {
                        t.guardsResult = e === false ? false : ViewportInstructionTree.create(e, this.Fe, null, n);
                    }
                    s.$();
                }));
            }));
        }
        s.$();
    }
    Xt(t, e, s) {
        s.N();
        for (const n of this.Ye) {
            t.te((() => {
                s.N();
                return n.unloading(this.He, e, this.re);
            }), (() => {
                s.$();
            }));
        }
        if (this.ts) {
            t.te((() => {
                s.N();
                return this.He.unloading(e, this.re);
            }), (() => {
                s.$();
            }));
        }
        s.$();
    }
    Zt(t, e, s) {
        s.N();
        for (const n of this.Qe) {
            t.te((() => {
                s.N();
                return n.loading(this.He, e.params, e, this.re);
            }), (() => {
                s.$();
            }));
        }
        if (this.Xe) {
            t.te((() => {
                s.N();
                return this.He.loading(e.params, e, this.re);
            }), (() => {
                s.$();
            }));
        }
        s.$();
    }
}

const C = /*@__PURE__*/ t.DI.createInterface("IRouteContext");

const b = Object.freeze([ "string", "object", "function" ]);

function isEagerInstruction(t) {
    if (t == null) return false;
    const e = t.params;
    const s = t.component;
    return typeof e === "object" && e !== null && s != null && b.includes(typeof s) && !(s instanceof Promise) && !(s instanceof NavigationStrategy);
}

function createEagerInstructions(e) {
    if (!t.isArray(e)) e = [ e ];
    const s = e.length;
    for (let t = 0; t < s; ++t) {
        const s = core(e[t]);
        if (s == null) throw new Error(getMessage(3404, e));
        e[t] = s;
    }
    return e;
    function core(e) {
        let s;
        if (typeof e === "string" || typeof e === "function") {
            s = e;
            e = null;
        } else {
            s = e.component;
        }
        if (s == null || !b.includes(typeof s) || s instanceof Promise || s instanceof NavigationStrategy) return null;
        return {
            ...e,
            component: s,
            params: e?.params ?? t.emptyObject
        };
    }
}

class RouteContext {
    get isRoot() {
        return this.parent === null;
    }
    get node() {
        const t = this.es;
        if (t === null) throw new Error(getMessage(3171, this));
        return t;
    }
    set node(t) {
        const e = this.ss = this.es;
        if (e !== t) {
            this.es = t;
        }
    }
    get vpa() {
        const t = this.ns;
        if (t === null) throw new Error(getMessage(3172, this));
        return t;
    }
    constructor(s, n, i, r, o, a) {
        this.parent = n;
        this.rs = r;
        this.routeConfigContext = o;
        this.Ve = a;
        this.os = [];
        this.ss = null;
        this.es = null;
        this.ns = s;
        if (n === null) {
            this.root = this;
        } else {
            this.root = n.root;
        }
        this.L = i.get(t.ILogger).scopeTo(`RouteContext<${this.routeConfigContext.Bt}>`);
        const c = this.container = i.createChild();
        this.p = c.get(e.IPlatform);
        c.registerResolver(e.IController, this.us = new t.InstanceProvider, true);
        const h = new t.InstanceProvider("IRouteContext", this);
        c.registerResolver(C, h);
        c.registerResolver(RouteContext, h);
        if (r.options.useNavigationModel) {
            c.get(u).subscribe("au:router:navigation-end", (() => {
                o.navigationModel.cs(r, this);
            }));
        }
    }
    static setRoot(s) {
        const n = s.get(t.ILogger).scopeTo("RouteContext");
        if (!s.has(e.IAppRoot, true)) {
            logAndThrow(new Error(getMessage(3167)), n);
        }
        if (s.has(C, true)) {
            logAndThrow(new Error(getMessage(3168)), n);
        }
        const {controller: i} = s.get(e.IAppRoot);
        if (i === void 0) {
            logAndThrow(new Error(getMessage(3169)), n);
        }
        const r = s.get(E);
        return t.onResolve(r.getRouteContext(null, i.definition, i.viewModel, i.container, null, null, null), (e => {
            s.register(t.Registration.instance(C, e));
            e.node = r.routeTree.root;
        }));
    }
    static resolve(s, n) {
        const i = s.container;
        const r = i.get(t.ILogger).scopeTo("RouteContext");
        if (n == null) {
            return s;
        }
        if (n instanceof RouteContext) {
            return n;
        }
        if (n instanceof i.get(e.IPlatform).Node) {
            try {
                const t = e.CustomElement.for(n, {
                    searchParents: true
                });
                return t.container.get(C);
            } catch (t) {
                error(r, 3155, n.nodeName, t);
                throw t;
            }
        }
        if (e.isCustomElementViewModel(n)) {
            const t = n.$controller;
            return t.container.get(C);
        }
        if (e.isCustomElementController(n)) {
            const t = n;
            return t.container.get(C);
        }
        logAndThrow(new Error(getMessage(3170, Object.prototype.toString.call(n))), r);
    }
    dispose() {
        this.container.dispose();
    }
    xe(t) {
        const e = this.os.find((e => e.Ft(t)));
        if (e === void 0) throw new Error(getMessage(3174, t, this.ls()));
        return e;
    }
    getAvailableViewportAgents() {
        return this.os.filter((t => t.Wt()));
    }
    getFallbackViewportAgent(t) {
        return this.os.find((e => e.Wt() && e.viewport.name === t && e.viewport.fallback !== "")) ?? null;
    }
    Kt(s, n) {
        this.us.prepare(s);
        const i = this.container.createChild({
            inheritParentResources: true
        });
        const r = this.p;
        const o = n.component;
        const a = r.document.createElement(o.name);
        e.registerHostNode(i, a, r);
        const u = i.invoke(o.Type);
        const c = this.routeConfigContext.ps ? void 0 : t.onResolve(resolveRouteConfiguration(u, false, this.routeConfigContext.config, n, null), (t => this.routeConfigContext.gs(t)));
        return t.onResolve(c, (() => {
            const t = e.Controller.$el(i, u, a, {
                projections: null
            }, o);
            const s = new ComponentAgent(u, t, n, this, this.rs.options);
            this.us.dispose();
            return s;
        }));
    }
    generateRootedPath(e) {
        return t.onResolve(this.createViewportInstructions(createEagerInstructions(e), null, true), (t => {
            const e = t.toUrl(true, this.rs.options.Ue);
            let s = "";
            const n = [];
            let i = t.options.context;
            while (!i.isRoot) {
                const t = i.vpa?.Mt?.instruction?.toUrlComponent(false);
                if ((t?.length ?? 0) !== 0) n.unshift(t);
                i = i.parent;
            }
            s = n.join("/");
            return s.length === 0 ? e : `${s}/${e}`;
        }));
    }
    generateRelativePath(e) {
        return t.onResolve(this.createViewportInstructions(createEagerInstructions(e), null, true), (t => t.toUrl(true, this.rs.options.Ue)));
    }
    createViewportInstructions(e, s, n) {
        if (e instanceof ViewportInstructionTree) return e;
        let i = s?.context ?? this;
        let r = false;
        if (!t.isArray(e)) {
            e = processStringInstruction.call(this, e);
        } else {
            const t = e.length;
            for (let s = 0; s < t; ++s) {
                e[s] = processStringInstruction.call(this, e[s]);
            }
        }
        const o = this.rs.options;
        return ViewportInstructionTree.create(e, o, NavigationOptions.create(o, {
            ...s,
            context: i
        }), this.root, n);
        function processStringInstruction(t) {
            if (typeof t === "string") t = this.Ve.removeBaseHref(t);
            const e = isPartialViewportInstruction(t);
            let s = e ? t.component : t;
            if (typeof s === "string" && s.startsWith("../") && i !== null) {
                while (s.startsWith("../") && ((i?.parent ?? null) !== null || r)) {
                    s = s.slice(3);
                    if (!r) i = i.parent;
                }
                r = true;
            }
            if (e) {
                t.component = s;
            } else {
                t = s;
            }
            return t;
        }
    }
    ds(t) {
        const e = ViewportAgent.for(t, this);
        if (this.os.includes(e)) {
            return e;
        }
        this.os.push(e);
        return e;
    }
    ws(t) {
        const e = ViewportAgent.for(t, this);
        if (!this.os.includes(e)) {
            return;
        }
        this.os.splice(this.os.indexOf(e), 1);
    }
    toString() {
        const t = this.os;
        const e = t.map(String).join(",");
        return `RC(path:'${this.routeConfigContext.Bt}',viewports:[${e}])`;
    }
    ls() {
        const t = [];
        const e = this.routeConfigContext.path;
        for (let s = 0; s < e.length; ++s) {
            t.push(`${" ".repeat(s)}${e[s]}`);
        }
        return t.join("\n");
    }
}

class RouteConfigContext {
    get isRoot() {
        return this.parent === null;
    }
    get depth() {
        return this.path.length - 1;
    }
    get navigationModel() {
        return this.Es;
    }
    get allResolved() {
        return this.xs;
    }
    constructor(e, n, r, o, a) {
        this.parent = e;
        this.component = n;
        this.config = r;
        this.rs = a;
        this.ps = false;
        this.childRoutes = [];
        this.xs = null;
        if (e === null) {
            this.root = this;
            this.path = [ this ];
            this.Bt = n.name;
        } else {
            this.root = e.root;
            this.path = [ ...e.path, this ];
            this.Bt = `${e.Bt}/${n.name}`;
        }
        this.L = o.get(t.ILogger).scopeTo(`RouteConfigContext<${this.Bt}>`);
        const u = o.get(i.IObserverLocator).getObserver(a, "isNavigating");
        const c = {
            handleChange: (t, e) => {
                if (t !== true) return;
                this.config.ot();
                for (const t of this.childRoutes) {
                    if (t instanceof Promise) continue;
                    t.ot();
                }
            }
        };
        u.subscribe(c);
        this.ys = () => u.unsubscribe(c);
        this.Rs = o.get(t.IModuleLoader);
        this.container = o.createChild();
        this.Ss = new s.RouteRecognizer;
        if (a.options.useNavigationModel) {
            this.Es = new NavigationModel([]);
        } else {
            this.Es = null;
        }
        this.gs(r);
    }
    gs(e) {
        const s = [];
        const n = e.routes ?? l;
        const i = n.length;
        if (i === 0) {
            const t = e.component.prototype?.getRouteConfig;
            this.ps = t == null ? true : typeof t !== "function";
            return;
        }
        const r = this.Es;
        const o = r !== null;
        let a = 0;
        for (;a < i; a++) {
            const i = n[a];
            if (i instanceof Promise) {
                s.push(this.Cs(i));
                continue;
            }
            const u = resolveRouteConfiguration(i, true, e, null, this);
            if (u instanceof Promise) {
                if (!isPartialChildRouteConfig(i) || i.path == null) throw new Error(getMessage(3173));
                for (const t of ensureArrayOfStrings(i.path)) {
                    this.bs(t, i.caseSensitive ?? false, u);
                }
                const e = this.childRoutes.length;
                const n = u.then((t => this.childRoutes[e] = t));
                this.childRoutes.push(n);
                if (o) {
                    r.Cs(n);
                }
                s.push(n.then(t.noop));
                continue;
            }
            for (const e of u.path ?? t.emptyArray) {
                this.bs(e, u.caseSensitive, u);
            }
            this.childRoutes.push(u);
            if (o) {
                r.Cs(u);
            }
        }
        this.ps = true;
        if (s.length > 0) {
            this.xs = Promise.all(s).then((() => {
                this.xs = null;
            }));
        }
    }
    Cs(e) {
        return t.onResolve(resolveRouteConfiguration(e, true, this.config, null, this), (e => {
            for (const s of e.path ?? t.emptyArray) {
                this.bs(s, e.caseSensitive, e);
            }
            this.Es?.Cs(e);
            this.childRoutes.push(e);
        }));
    }
    bs(t, e, s) {
        this.Ss.add({
            path: t,
            caseSensitive: e,
            handler: s
        }, true);
    }
    ut(t) {
        return this.Rs.load(t, (s => {
            const n = s.raw;
            if (typeof n === "function") {
                const t = e.CustomElement.isType(n) ? e.CustomElement.getDefinition(n) : null;
                if (t != null) return t;
            }
            let i = void 0;
            let r = void 0;
            for (const t of s.items) {
                const s = e.CustomElement.isType(t.value) ? t.definition : null;
                if (s != null) {
                    if (t.key === "default") {
                        i = s;
                    } else if (r === void 0) {
                        r = s;
                    }
                }
            }
            if (i === void 0 && r === void 0) {
                if (!isPartialCustomElementDefinition(n)) throw new Error(getMessage(3175, t));
                const s = e.CustomElementDefinition.create(n);
                e.CustomElement.define(s);
                return s;
            }
            return r ?? i;
        }));
    }
    Ee(n, i) {
        if (!isEagerInstruction(n)) return null;
        i ??= false;
        const r = n.component;
        let o;
        let a = false;
        if (r instanceof RouteConfig) {
            o = r.path;
            a = true;
        } else if (typeof r === "string") {
            const t = this.childRoutes.find((t => t.id === r));
            if (t === void 0) return null;
            o = t.path;
        } else if (r.type === 0) {
            const t = this.childRoutes.find((t => t.id === r.value));
            if (t === void 0) return null;
            o = t.path;
        } else {
            const t = resolveCustomElementDefinition(r, this)[1];
            o = this.childRoutes.reduce(((e, s) => {
                if (s.component === t.Type) {
                    e.push(...s.path);
                }
                return e;
            }), []);
            a = true;
        }
        if (o === void 0) return null;
        const u = n.params;
        const c = this.Ss;
        const h = o.length;
        const l = [];
        let f = null;
        if (h === 1) {
            const t = core(o[0]);
            if (t === null) {
                if (a) throw new Error(getMessage(3166, n, l));
                return null;
            }
            return createPathGenerationResult.call(this, t);
        }
        let p = 0;
        for (let t = 0; t < h; t++) {
            const e = core(o[t]);
            if (e === null) continue;
            if (f === null) {
                f = e;
                p = Object.keys(e.consumed).length;
            } else if (Object.keys(e.consumed).length > p) {
                f = e;
            }
        }
        if (f === null) {
            if (a) throw new Error(getMessage(3166, n, l));
            return null;
        }
        return createPathGenerationResult.call(this, f);
        function core(t) {
            const e = c.getEndpoint(t);
            if (e === null) {
                l.push(`No endpoint found for the path: '${t}'.`);
                return null;
            }
            const s = Object.create(null);
            for (const n of e.params) {
                const e = n.name;
                let i = u[e];
                if (i == null || String(i).length === 0) {
                    if (!n.isOptional) {
                        l.push(`No value for the required parameter '${e}' is provided for the path: '${t}'.`);
                        return null;
                    }
                    i = "";
                } else {
                    if (!n.satisfiesPattern(i)) {
                        l.push(`The value '${i}' for the parameter '${e}' does not satisfy the pattern '${n.pattern}'.`);
                        return null;
                    }
                    s[e] = i;
                }
                const r = n.isStar ? `*${e}` : n.isOptional ? `:${e}?` : `:${e}`;
                t = t.replace(r, encodeURIComponent(i));
            }
            const n = Object.keys(s);
            const i = Object.fromEntries(Object.entries(u).filter((([t]) => !n.includes(t))));
            return {
                path: t.replace(/\/\//g, "/"),
                endpoint: e,
                consumed: s,
                query: i
            };
        }
        async function generateChildrenInstructions(s) {
            const r = n.children;
            const o = r?.length ?? 0;
            if (o === 0) return {
                instructions: t.emptyArray,
                query: t.emptyObject
            };
            const a = s.component;
            const u = e.CustomElement.isType(a) ? e.CustomElement.getDefinition(a) : resolveCustomElementDefinition(a, this)[1];
            return t.onResolve(t.onResolve(this.rs.getRouteConfigContext(s, u, null, this.container, this.config, this), (e => t.onResolve(e.allResolved, (() => e)))), (e => {
                const s = new Array(o);
                const n = new Array(o);
                let a = Object.create(null);
                for (let u = 0; u < o; ++u) {
                    const o = r[u];
                    s[u] = t.onResolve(e.Ee(isPartialViewportInstruction(o) ? {
                        ...o,
                        params: o.params ?? t.emptyObject
                    } : {
                        component: o,
                        params: t.emptyObject
                    }, i), (t => {
                        if (t == null) throw new Error(getMessage(3166, o));
                        n[u] = t.vi;
                        a = mergeQueryParams(a, t.query);
                    }));
                }
                return t.onResolve(Promise.all(s), (() => ({
                    instructions: n,
                    query: a
                })));
            }));
        }
        function createPathGenerationResult(e) {
            return t.onResolve(i ? generateChildrenInstructions.call(this, e.endpoint.route.handler) : {
                instructions: n.children,
                query: t.emptyObject
            }, (({instructions: t, query: i}) => ({
                vi: ViewportInstruction.create({
                    recognizedRoute: new $RecognizedRoute(new s.RecognizedRoute(e.endpoint, e.consumed), null),
                    component: e.path,
                    children: t,
                    viewport: n.viewport,
                    open: n.open,
                    close: n.close
                }),
                query: mergeQueryParams(e.query, i)
            })));
        }
    }
    recognize(t, e = false) {
        let n = this;
        let i = true;
        let r = null;
        while (i) {
            r = n.Ss.recognize(t);
            if (r === null) {
                if (!e || n.isRoot) return null;
                n = n.parent;
            } else {
                i = false;
            }
        }
        return new $RecognizedRoute(r, Reflect.has(r.params, s.RESIDUE) ? r.params[s.RESIDUE] ?? null : null);
    }
    dispose() {
        this.container.dispose();
        this.ys();
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
        this.Ns = void 0;
    }
    resolve() {
        return t.onResolve(this.Ns, t.noop);
    }
    cs(e, s) {
        void t.onResolve(this.Ns, (() => {
            for (const t of this.routes) {
                t.cs(e, s);
            }
        }));
    }
    Cs(e) {
        const s = this.routes;
        if (!(e instanceof Promise)) {
            if ((e.nav ?? false) && e.redirectTo === null) {
                s.push(NavigationRoute.Z(e));
            }
            return;
        }
        const n = s.length;
        s.push(void 0);
        let i = void 0;
        i = this.Ns = t.onResolve(this.Ns, (() => t.onResolve(e, (t => {
            if (t.nav && t.redirectTo === null) {
                s[n] = NavigationRoute.Z(t);
            } else {
                s.splice(n, 1);
            }
            if (this.Ns === i) {
                this.Ns = void 0;
            }
        }))));
    }
}

class NavigationRoute {
    constructor(t, e, s, n) {
        this.id = t;
        this.path = e;
        this.title = s;
        this.data = n;
        this.ks = null;
    }
    static Z(e) {
        return new NavigationRoute(e.id, ensureArrayOfStrings(e.path ?? t.emptyArray), e.title, e.data);
    }
    get isActive() {
        return this.Pt;
    }
    cs(e, n) {
        let i = this.ks;
        if (i === null) {
            const r = e.options;
            i = this.ks = this.path.map((e => {
                const i = n.routeConfigContext.Ss.getEndpoint(e);
                if (i === null) throw new Error(getMessage(3450, e));
                return new ViewportInstructionTree(NavigationOptions.create(r, {
                    context: n
                }), false, [ ViewportInstruction.create({
                    recognizedRoute: new $RecognizedRoute(new s.RecognizedRoute(i, t.emptyObject), null),
                    component: e
                }) ], v, null);
            }));
        }
        this.Pt = i.some((t => e.routeTree.contains(t, true)));
    }
}

class ViewportCustomElement {
    constructor() {
        this.name = S;
        this.usedBy = "";
        this.default = "";
        this.fallback = "";
        this.$s = void 0;
        this.Ge = void 0;
        this.Re = t.resolve(C);
        this.L = t.resolve(t.ILogger).scopeTo(`au-viewport<${this.Re.routeConfigContext.Bt}>`);
    }
    it(t, s, n) {
        const i = this.fallback;
        return typeof i === "function" && !e.CustomElement.isType(i) ? i(t, s, n) : i;
    }
    hydrated(t) {
        this.Ge = t;
        this.$s = this.Re.ds(this);
    }
    attaching(t, e) {
        return this.$s.zt(t, this.Ge);
    }
    detaching(t, e) {
        return this.$s.Ht(t, this.Ge);
    }
    dispose() {
        this.Re.ws(this);
        this.$s.ee();
        this.$s = void 0;
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
        return `VP(ctx:'${this.Re.routeConfigContext.Bt}',${t.join(",")})`;
    }
}

e.CustomElement.define({
    name: "au-viewport",
    bindables: [ "name", "usedBy", "default", "fallback" ]
}, ViewportCustomElement);

const N = [ "name", "usedBy", "default", "fallback" ];

class LoadCustomAttribute {
    constructor() {
        this.Is = t.resolve(e.INode);
        this.rs = t.resolve(E);
        this.Re = t.resolve(C);
        this._ = t.resolve(u);
        this.Ve = t.resolve(h);
        this.attribute = "href";
        this.active = false;
        this.Ts = null;
        this.Ne = null;
        this._s = null;
        this.onClick = t => {
            if (this.Ne === null) {
                return;
            }
            if (t.altKey || t.ctrlKey || t.shiftKey || t.metaKey || t.button !== 0) {
                return;
            }
            t.preventDefault();
            void this.rs.load(this.Ne, {
                context: this.context
            });
        };
        const s = this.Is;
        this.Ps = !s.hasAttribute("external") && !s.hasAttribute("data-external");
        this.As = this.rs.options.activeClass;
    }
    binding() {
        if (this.Ps) {
            this.Is.addEventListener("click", this.onClick);
        }
        this.valueChanged();
        this._s = this._.subscribe("au:router:navigation-end", (t => {
            const e = this.active = this.Ne !== null && this.rs.isActive(this.Ne, this.context);
            const s = this.As;
            if (s === null) return;
            this.Is.classList.toggle(s, e);
        }));
    }
    attaching() {
        const t = this.context;
        const e = t.routeConfigContext.allResolved;
        if (e !== null) {
            return e.then((() => {
                this.valueChanged();
            }));
        }
    }
    unbinding() {
        if (this.Ps) {
            this.Is.removeEventListener("click", this.onClick);
        }
        this._s.dispose();
    }
    valueChanged() {
        const t = this.rs;
        const s = t.options;
        const n = this.route;
        let i = this.context;
        if (i === void 0) {
            i = this.context = this.Re;
        } else if (i === null) {
            i = this.context = this.Re.root;
        }
        if (n != null && i.routeConfigContext.allResolved === null) {
            const e = this.params;
            const r = this.Ne = t.createViewportInstructions(typeof e === "object" && e !== null ? {
                component: n,
                params: e
            } : n, {
                context: i
            });
            this.Ts = r.toUrl(false, s.Ue);
        } else {
            this.Ne = null;
            this.Ts = null;
        }
        const r = e.CustomElement.for(this.Is, {
            optional: true
        });
        if (r !== null) {
            r.viewModel[this.attribute] = this.Ne;
        } else {
            if (this.Ts === null) {
                this.Is.removeAttribute(this.attribute);
            } else {
                const t = s.useUrlFragmentHash ? this.Ts : this.Ve.addBaseHref(this.Ts);
                this.Is.setAttribute(this.attribute, t);
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
    get Vs() {
        return this.Is.hasAttribute("external") || this.Is.hasAttribute("data-external");
    }
    constructor() {
        this.Is = t.resolve(e.INode);
        this.rs = t.resolve(E);
        this.Re = t.resolve(C);
        this.Os = false;
        if (this.rs.options.useHref && this.Is.nodeName === "A") {
            const s = t.resolve(e.IWindow).name;
            switch (this.Is.getAttribute("target")) {
              case null:
              case s:
              case "_self":
                this.Ps = true;
                break;

              default:
                this.Ps = false;
                break;
            }
        } else {
            this.Ps = false;
        }
    }
    binding() {
        if (!this.Os) {
            this.Os = true;
            this.Ps = this.Ps && e.refs.get(this.Is, e.CustomAttribute.getDefinition(LoadCustomAttribute).key) === null;
        }
        this.valueChanged(this.value);
        this.Is.addEventListener("click", this);
    }
    unbinding() {
        this.Is.removeEventListener("click", this);
    }
    valueChanged(t) {
        if (t == null) {
            this.Is.removeAttribute("href");
        } else {
            if (this.rs.options.useUrlFragmentHash && this.Re.routeConfigContext.isRoot && !/^[.#]/.test(t) && !this.Vs) {
                t = `#${t}`;
            }
            this.Is.setAttribute("href", t);
        }
    }
    handleEvent(t) {
        this.Ms(t);
    }
    Ms(t) {
        if (t.altKey || t.ctrlKey || t.shiftKey || t.metaKey || t.button !== 0 || this.Vs || !this.Ps) {
            return;
        }
        const e = this.Is.getAttribute("href");
        if (e !== null) {
            t.preventDefault();
            void this.rs.load(e, {
                context: this.Re
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

const I = ViewportCustomElement;

const T = LoadCustomAttribute;

const _ = HrefCustomAttribute;

const P = [ ViewportCustomElement, LoadCustomAttribute, HrefCustomAttribute ];

function configure(s, n) {
    let i = null;
    if (t.isObjectOrFunction(n)) {
        i = n.basePath ?? null;
    } else {
        n = {};
    }
    const r = RouterOptions.create(n);
    return s.register(t.Registration.cachedCallback(c, ((t, s, n) => {
        const r = t.get(e.IWindow);
        const o = new URL(r.document.baseURI);
        o.pathname = normalizePath(i ?? o.pathname);
        return o;
    })), t.Registration.instance(R, r), t.Registration.instance(RouterOptions, r), e.AppTask.creating(E, (t => {})), e.AppTask.hydrated(t.IContainer, RouteContext.setRoot), e.AppTask.activated(E, (t => t.start(true))), e.AppTask.deactivated(E, (t => t.stop())), ...$, ...P);
}

const A = {
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
        this.Is = t;
        this.js = t.scrollTop;
        this.Ls = t.scrollLeft;
    }
    static Us(t) {
        return t.scrollTop > 0 || t.scrollLeft > 0;
    }
    Bs() {
        this.Is.scrollTo(this.Ls, this.js);
        this.Is = null;
    }
}

function restoreState(t) {
    t.Bs();
}

class HostElementState {
    constructor(t) {
        this.zs = [];
        this.Ds(t.children);
    }
    Ds(t) {
        let e;
        for (let s = 0, n = t.length; s < n; ++s) {
            e = t[s];
            if (ScrollState.Us(e)) {
                this.zs.push(new ScrollState(e));
            }
            this.Ds(e.children);
        }
    }
    Bs() {
        this.zs.forEach(restoreState);
        this.zs = null;
    }
}

const V = /*@__PURE__*/ t.DI.createInterface("IStateManager", (t => t.singleton(ScrollStateManager)));

class ScrollStateManager {
    constructor() {
        this.qs = new WeakMap;
    }
    saveState(t) {
        this.qs.set(t.host, new HostElementState(t.host));
    }
    restoreState(t) {
        const e = this.qs.get(t.host);
        if (e !== void 0) {
            e.Bs();
            this.qs.delete(t.host);
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
        t.resolve(u).subscribe("au:router:navigation-end", (t => {
            const n = t.finalInstructions;
            i.batch((() => {
                this.path = n.toPath();
                this.url = n.toUrl(true, s.Ue);
                this.title = e.qe();
                this.query = n.queryParams;
                this.parameterInformation = n.children.map((t => ParameterInformation.create(t)));
            }));
        }));
    }
}

class ParameterInformation {
    constructor(t, e, s, n) {
        this.config = t;
        this.viewport = e;
        this.params = s;
        this.children = n;
    }
    static create(t) {
        const e = t.recognizedRoute?.route;
        const n = Object.create(null);
        Object.assign(n, e?.params ?? t.params);
        Reflect.deleteProperty(n, s.RESIDUE);
        return new ParameterInformation(e?.endpoint.route.handler ?? null, t.viewport, n, t.children.map((t => this.create(t))));
    }
}

exports.AST = d;

exports.AuNavId = a;

exports.ComponentExpression = ComponentExpression;

exports.CompositeSegmentExpression = CompositeSegmentExpression;

exports.DefaultComponents = $;

exports.DefaultResources = P;

exports.HrefCustomAttribute = HrefCustomAttribute;

exports.HrefCustomAttributeRegistration = _;

exports.ICurrentRoute = O;

exports.ILocationManager = h;

exports.IRouteContext = C;

exports.IRouter = E;

exports.IRouterEvents = u;

exports.IRouterOptions = R;

exports.IStateManager = V;

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

exports.RouterConfiguration = A;

exports.RouterOptions = RouterOptions;

exports.RouterRegistration = k;

exports.ScopedSegmentExpression = ScopedSegmentExpression;

exports.SegmentExpression = SegmentExpression;

exports.SegmentGroupExpression = SegmentGroupExpression;

exports.Transition = Transition;

exports.ViewportAgent = ViewportAgent;

exports.ViewportCustomElement = ViewportCustomElement;

exports.ViewportCustomElementRegistration = I;

exports.ViewportExpression = ViewportExpression;

exports.fragmentUrlParser = y;

exports.isManagedState = isManagedState;

exports.pathUrlParser = x;

exports.route = route;

exports.toManagedState = toManagedState;
//# sourceMappingURL=index.cjs.map
