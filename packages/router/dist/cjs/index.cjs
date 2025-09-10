"use strict";

var t = require("@aurelia/kernel");

var e = require("@aurelia/runtime-html");

var s = require("@aurelia/route-recognizer");

var i = require("@aurelia/metadata");

var n = require("@aurelia/runtime");

function error(t, e, ...s) {
    {
        t.error(`AUR${e}`, ...s.map(t => String(t)));
    }
}

function getMessage(t, ...e) {
    return `AUR${t}:${e.map(t => String(t)).join(":")}`;
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
    _(t) {
        if (this.h === null) {
            return this.h = new Batch(this.t, t, this.R);
        } else {
            return this.h._(t);
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
        if (s.every(t => t.context.vpa !== n)) {
            const t = e.findIndex(t => t.context.vpa === n);
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

function mergeURLSearchParams(e, s, i) {
    const n = i ? new URLSearchParams(e) : e;
    if (s == null) return n;
    for (const [e, i] of Object.entries(s)) {
        if (i == null) continue;
        if (t.isArray(i)) {
            for (const t of i) {
                n.append(e, t);
            }
            continue;
        }
        n.append(e, i);
    }
    return n;
}

function mergeQueryParams(e, s) {
    if (s == null) return e;
    for (const [i, n] of Object.entries(s)) {
        if (n == null) continue;
        if (e[i] == null) {
            e[i] = n;
        } else {
            const s = e[i];
            e[i] = [ ...t.isArray(s) ? s : [ s ], ...t.isArray(n) ? n : [ n ] ];
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
        this.T = t;
        this.P = e;
        this.A = s;
        this.V = false;
    }
    dispose() {
        if (!this.V) {
            this.V = true;
            this.A.dispose();
            const t = this.T["O"];
            t.splice(t.indexOf(this), 1);
        }
    }
}

const u = /*@__PURE__*/ t.DI.createInterface("IRouterEvents", t => t.singleton(RouterEvents));

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
        const s = new Subscription(this, ++this.M, this.j.subscribe(t, t => {
            e(t);
        }));
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

const c = /*@__PURE__*/ t.DI.createInterface("IBaseHref");

const h = /*@__PURE__*/ t.DI.createInterface("ILocationManager", t => t.singleton(BrowserLocationManager));

class BrowserLocationManager {
    constructor() {
        this.U = 0;
        this.L = t.resolve(t.ILogger).root.scopeTo("LocationManager");
        this.T = t.resolve(u);
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
        this.T.publish(new LocationChangeEvent(++this.U, this.getPath(), this.G, "state" in t ? t.state : null));
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
        const t = this.F;
        if (t.length > 0) return t;
        const s = e.CustomElement.getDefinition(this.W);
        return this.F = [ s.name, ...s.aliases ];
    }
    get component() {
        return this.J();
    }
    constructor(t, e, s, i, n, r, o, a, u, c, h, l) {
        this.id = t;
        this.F = e;
        this.title = s;
        this.redirectTo = i;
        this.caseSensitive = n;
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
            const i = s?.redirectTo ?? null;
            const n = s?.caseSensitive ?? false;
            const r = ensureString(s?.id ?? (t instanceof Array ? t[0] : t));
            const o = s?.title ?? null;
            const a = s?.transitionPlan ?? null;
            const u = s?.viewport ?? S;
            const c = s?.data ?? {};
            const h = s?.routes ?? l;
            return new RouteConfig(r, t, o, i, n, a, u, c, h, s?.fallback ?? null, s, s?.nav ?? true);
        } else if (typeof e === "object") {
            const i = e;
            validateRouteConfig(i, "");
            const n = ensureArrayOfStrings(i.path ?? s?.path ?? t.emptyArray);
            const r = i.title ?? s?.title ?? null;
            const o = i.redirectTo ?? s?.redirectTo ?? null;
            const a = i.caseSensitive ?? s?.caseSensitive ?? false;
            const u = i.id ?? s?.id ?? (n instanceof Array ? n[0] : n);
            const c = i.transitionPlan ?? s?.transitionPlan ?? null;
            const h = i.viewport ?? s?.viewport ?? S;
            const f = {
                ...s?.data,
                ...i.data
            };
            const p = [ ...i.routes ?? l, ...s?.routes ?? l ];
            return new RouteConfig(u, n, r, o, a, c, h, f, p, i.fallback ?? s?.fallback ?? null, i.component ?? s ?? null, i.nav ?? true);
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
        if (this.Y) throw new Error(getMessage(3550));
        if (typeof e.getRouteConfig !== "function") return;
        return t.onResolve(e.getRouteConfig(s, i), t => {
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
        });
    }
    it() {
        return new RouteConfig(this.id, this.path, this.title, this.redirectTo, this.caseSensitive, this.transitionPlan, this.viewport, this.data, this.routes, this.fallback, this.W, this.nav);
    }
    nt(t, s, i) {
        const n = this.fallback;
        return typeof n === "function" && !e.CustomElement.isType(n) ? n(t, s, i) : n;
    }
    rt() {
        try {
            return this.J().name;
        } catch {
            return "UNRESOLVED-NAVIGATION-STRATEGY";
        }
    }
    J(t, e, s, i) {
        if (t == null) {
            if (this.K != null) return this.K;
            if (this.X) throw new Error(getMessage(3558, this.id));
            return this.K = this.W;
        }
        return this.K ??= this.X ? this.W.getComponent(t, e, s, i) : this.W;
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
        s.addInitializer(function() {
            f.configure(t, this);
        });
        return e;
    };
}

function resolveRouteConfiguration(e, s, i, n, r) {
    if (isPartialRedirectRouteConfig(e)) return RouteConfig.Z(e, null);
    const [o, a] = resolveCustomElementDefinition(e, r);
    if (o.type === 5) return RouteConfig.Z({
        ...e,
        nav: false
    }, null);
    return t.onResolve(a, r => {
        const a = r.Type;
        const u = f.getConfig(a);
        if (isPartialChildRouteConfig(e)) return u.tt(e, i);
        if (s) return u.it();
        if (!u.Y && o.type === 4 && typeof e.getRouteConfig === "function") {
            return t.onResolve(u.st(e, i, n), () => u);
        }
        return u;
    });
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
            let r = t.find(t => isPartialCustomElementDefinition(t) && t.name === i.value) ?? e.CustomElement.find(s.container, i.value);
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
        n = s.ut(i.value);
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
        this.ht = t;
        this.lt = [];
        this.ft = 0;
        this.gt = 0;
        this.ct = t;
    }
    dt(...t) {
        const e = this.ct;
        return t.some(function(t) {
            return e.startsWith(t);
        });
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
        const i = s.wt("/");
        const n = CompositeSegmentExpression.$t(s);
        s.yt();
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
    static $t(t) {
        t.St();
        const e = t.wt("+");
        const s = [];
        do {
            s.push(ScopedSegmentExpression.$t(t));
        } while (t.wt("+"));
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
            return [ ...this.siblings[0].kt(t, 0), ...this.siblings.slice(1, -1).flatMap(function(t) {
                return t.kt(0, 0);
            }), ...this.siblings[this.siblings.length - 1].kt(0, e) ];
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
    static $t(t) {
        t.St();
        const e = SegmentGroupExpression.$t(t);
        if (t.wt("/")) {
            const s = ScopedSegmentExpression.$t(t);
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
    static $t(t) {
        t.St();
        if (t.wt("(")) {
            const e = CompositeSegmentExpression.$t(t);
            t.Et(")");
            t.bt();
            return new SegmentGroupExpression(e);
        }
        t.bt();
        return SegmentExpression.$t(t);
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
    static $t(t) {
        t.St();
        const e = ComponentExpression.$t(t);
        const s = ViewportExpression.$t(t);
        const i = !t.wt("!");
        t.bt();
        return new SegmentExpression(e, s, i);
    }
    kt(t, e) {
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
    static $t(t) {
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
        const s = ParameterListExpression.$t(t);
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
    static $t(t) {
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
    static $t(t) {
        t.St();
        const e = [];
        if (t.wt("(")) {
            do {
                e.push(ParameterExpression.$t(t, e.length));
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
    static $t(t, e) {
        t.St();
        t.St();
        while (!t.u && !t.dt(...p)) {
            t.Rt();
        }
        let s = t.Ct();
        if (s.length === 0) {
            t.xt("parameter key");
        }
        let i;
        if (t.wt("=")) {
            t.St();
            while (!t.u && !t.dt(...p)) {
                t.Rt();
            }
            i = decodeURIComponent(t.Ct());
            if (i.length === 0) {
                t.xt("parameter value");
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
        this.Pt = false;
        this.At = null;
        this.Vt = null;
        this._state = 8256;
        this.Ot = "replace";
        this.Mt = null;
        this.jt = null;
        this.Lt = null;
        this.Ut = null;
        this.L = i.container.get(t.ILogger).scopeTo(`ViewportAgent<${i.routeConfigContext.Bt}>`);
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
        const s = this.Lt;
        if (s !== null) {
            ensureTransitionHasNotErrored(s);
        }
        this.Pt = true;
        switch (this.Tt) {
          case 64:
            switch (this._t) {
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
                const e = Batch.C(e => {
                    this.Dt(t, this.Lt, e);
                });
                const s = new Promise(t => {
                    e._(() => {
                        t();
                    });
                });
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
        switch (this._t) {
          case 8192:
            return;

          case 4096:
            return this.At.Gt(t, e);

          case 128:
            return;

          default:
            {
                if (this.Lt === null) throw new Error(getMessage(3351, this));
                const e = Batch.C(e => {
                    this.Gt(t, this.Lt, e);
                });
                const s = new Promise(t => {
                    e._(() => {
                        t();
                    });
                });
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
    Wt() {
        if (!this.Pt) {
            return false;
        }
        if (this.Tt !== 64) {
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
        void t.onResolve(this.Ut, () => {
            Batch.C(t => {
                for (const s of this.Mt.children) {
                    s.context.vpa.Qt(e, t);
                }
            })._(t => {
                switch (this._t) {
                  case 4096:
                    switch (this.Ot) {
                      case "none":
                        this._t = 1024;
                        return;

                      case "invoke-lifecycles":
                      case "replace":
                        this._t = 2048;
                        t.N();
                        Batch.C(t => {
                            this.At.Qt(e, this.jt, t);
                        })._(() => {
                            this._t = 1024;
                            t.$();
                        }).C();
                        return;
                    }

                  case 8192:
                    return;

                  default:
                    e.Jt(new Error(`Unexpected state at canUnload of ${this}`));
                }
            })._(() => {
                s.$();
            }).C();
        });
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
        Batch.C(s => {
            switch (this.Tt) {
              case 32:
                this.Tt = 16;
                switch (this.Ot) {
                  case "none":
                    return;

                  case "invoke-lifecycles":
                    return this.At.Yt(e, this.jt, s);

                  case "replace":
                    s.N();
                    void t.onResolve(this.jt.context.Kt(this.hostController, this.jt), t => {
                        (this.Vt = t).Yt(e, this.jt, s);
                        s.$();
                    });
                }

              case 64:
                return;

              default:
                this.qt("canLoad");
            }
        })._(s => {
            if (e.guardsResult !== true) {
                return;
            }
            const i = this.jt;
            switch (this.Ot) {
              case "none":
              case "invoke-lifecycles":
                {
                    s.N();
                    const e = i.context;
                    void t.onResolve(e.routeConfigContext.allResolved, () => t.onResolve(t.onResolve(t.onResolveAll(...i.residue.splice(0).map(t => createAndAppendNodes(this.L, i, t))), () => t.onResolveAll(...e.getAvailableViewportAgents().reduce((t, e) => {
                        const s = e.viewport;
                        const n = s.default;
                        if (n === null) return t;
                        t.push(createAndAppendNodes(this.L, i, ViewportInstruction.create({
                            component: n,
                            viewport: s.name
                        })));
                        return t;
                    }, []))), () => {
                        s.$();
                    }));
                    return;
                }

              case "replace":
                return;
            }
        })._(t => {
            switch (this.Tt) {
              case 16:
                this.Tt = 8;
                for (const s of this.jt.children) {
                    s.context.vpa.Yt(e, t);
                }
                return;

              case 64:
                return;

              default:
                this.qt("canLoad");
            }
        })._(() => {
            s.$();
        }).C();
    }
    Xt(t, e) {
        ensureTransitionHasNotErrored(t);
        ensureGuardsResultIsTrue(this, t);
        e.N();
        Batch.C(e => {
            for (const s of this.Mt.children) {
                s.context.vpa.Xt(t, e);
            }
        })._(s => {
            switch (this._t) {
              case 1024:
                switch (this.Ot) {
                  case "none":
                    this._t = 256;
                    return;

                  case "invoke-lifecycles":
                  case "replace":
                    this._t = 512;
                    s.N();
                    Batch.C(e => {
                        this.At.Xt(t, this.jt, e);
                    })._(() => {
                        this._t = 256;
                        s.$();
                    }).C();
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
        })._(() => {
            e.$();
        }).C();
    }
    Zt(t, e) {
        ensureTransitionHasNotErrored(t);
        ensureGuardsResultIsTrue(this, t);
        e.N();
        Batch.C(e => {
            switch (this.Tt) {
              case 8:
                {
                    this.Tt = 4;
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
        })._(e => {
            switch (this.Tt) {
              case 4:
                this.Tt = 2;
                for (const s of this.jt.children) {
                    s.context.vpa.Zt(t, e);
                }
                return;

              case 64:
                return;

              default:
                this.qt("loading");
            }
        })._(() => {
            e.$();
        }).C();
    }
    Gt(e, s, i) {
        ensureTransitionHasNotErrored(s);
        ensureGuardsResultIsTrue(this, s);
        i.N();
        switch (this._t) {
          case 256:
            this._t = 128;
            switch (this.Ot) {
              case "none":
              case "invoke-lifecycles":
                i.$();
                return;

              case "replace":
                {
                    const n = this.hostController;
                    const r = this.At;
                    s.te(() => t.onResolve(r.Gt(e, n), () => {
                        if (e === null) {
                            r.ee();
                        }
                    }), () => {
                        i.$();
                    });
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
            this.qt("deactivate");
        }
    }
    Dt(t, e, s) {
        ensureTransitionHasNotErrored(e);
        ensureGuardsResultIsTrue(this, e);
        s.N();
        if (this.Tt === 32) {
            Batch.C(t => {
                this.Yt(e, t);
            })._(t => {
                this.Zt(e, t);
            })._(s => {
                this.Dt(t, e, s);
            })._(() => {
                s.$();
            }).C();
            return;
        }
        switch (this.Tt) {
          case 2:
            this.Tt = 1;
            Batch.C(s => {
                switch (this.Ot) {
                  case "none":
                  case "invoke-lifecycles":
                    return;

                  case "replace":
                    {
                        const i = this.hostController;
                        e.te(() => {
                            s.N();
                            return this.Vt.Dt(t, i);
                        }, () => {
                            s.$();
                        });
                    }
                }
            })._(t => {
                this.se(e, t);
            })._(() => {
                s.$();
            }).C();
            return;

          case 64:
            s.$();
            return;

          default:
            this.qt("activate");
        }
    }
    ie(e, s) {
        if (this._t === 8192) {
            this.Dt(null, e, s);
            return;
        }
        if (this.Tt === 64) {
            this.Gt(null, e, s);
            return;
        }
        ensureTransitionHasNotErrored(e);
        ensureGuardsResultIsTrue(this, e);
        if (!(this._t === 256 && this.Tt === 2)) {
            this.qt("swap");
        }
        this._t = 128;
        this.Tt = 1;
        switch (this.Ot) {
          case "none":
          case "invoke-lifecycles":
            {
                const t = mergeDistinct(this.jt.children, this.Mt.children);
                for (const i of t) {
                    i.context.vpa.ie(e, s);
                }
                return;
            }

          case "replace":
            {
                const i = this.hostController;
                const n = this.At;
                const r = this.Vt;
                s.N();
                Batch.C(s => {
                    e.te(() => {
                        s.N();
                        return t.onResolve(n.Gt(null, i), () => n.ee());
                    }, () => {
                        s.$();
                    });
                })._(t => {
                    e.te(() => {
                        t.N();
                        return r.Dt(null, i);
                    }, () => {
                        t.$();
                    });
                })._(t => {
                    this.se(e, t);
                })._(() => {
                    s.$();
                }).C();
                return;
            }
        }
    }
    se(e, s) {
        const i = this.jt;
        e.te(() => {
            s.N();
            const e = i.context;
            return t.onResolve(e.routeConfigContext.allResolved, () => {
                const s = i.children.slice();
                return t.onResolve(t.onResolveAll(...i.residue.splice(0).map(t => createAndAppendNodes(this.L, i, t))), () => t.onResolve(t.onResolveAll(...e.getAvailableViewportAgents().reduce((t, e) => {
                    const s = e.viewport;
                    const n = s.default;
                    if (n === null) return t;
                    t.push(createAndAppendNodes(this.L, i, ViewportInstruction.create({
                        component: n,
                        viewport: s.name
                    })));
                    return t;
                }, [])), () => i.children.filter(t => !s.includes(t))));
            });
        }, t => {
            Batch.C(s => {
                for (const i of t) {
                    e.te(() => {
                        s.N();
                        return i.context.vpa.Yt(e, s);
                    }, () => {
                        s.$();
                    });
                }
            })._(s => {
                if (e.guardsResult !== true) return;
                for (const i of t) {
                    e.te(() => {
                        s.N();
                        return i.context.vpa.Zt(e, s);
                    }, () => {
                        s.$();
                    });
                }
            })._(s => {
                if (e.guardsResult !== true) return;
                for (const i of t) {
                    e.te(() => {
                        s.N();
                        return i.context.vpa.Dt(null, e, s);
                    }, () => {
                        s.$();
                    });
                }
            })._(() => {
                s.$();
            }).C();
        });
    }
    ne(t, e) {
        switch (this.Tt) {
          case 64:
            this.jt = e;
            this.Tt = 32;
            break;

          default:
            this.qt("scheduleUpdate 1");
        }
        switch (this._t) {
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
            this.Mt.children.forEach(function(t) {
                t.context.vpa.oe();
            });
        }
        if (this.jt !== null) {
            this.jt.children.forEach(function(t) {
                t.context.vpa.oe();
            });
        }
        let e = null;
        let s = null;
        switch (this._t) {
          case 8192:
          case 4096:
            this.Lt = null;
            break;

          case 2048:
          case 1024:
            this._t = 4096;
            this.Lt = null;
            break;

          case 512:
          case 256:
          case 128:
            e = t.onResolve(this.At?.Gt(null, this.hostController), () => {
                this.At?.ee();
                this._t = 8192;
                this.At = null;
            });
            break;
        }
        switch (this.Tt) {
          case 64:
          case 32:
          case 16:
          case 8:
            this.jt = null;
            this.Tt = 64;
            break;

          case 4:
          case 2:
          case 1:
            {
                s = t.onResolve(this.Vt?.Gt(null, this.hostController), () => {
                    this.Vt?.ee();
                    this.Ot = "replace";
                    this.Tt = 64;
                    this.Vt = null;
                    this.jt = null;
                });
                break;
            }
        }
        if (e !== null && s !== null) {
            this.Ut = t.onResolve(t.onResolveAll(e, s), () => {
                this.Lt = null;
                this.Ut = null;
            });
        }
    }
    ae() {
        if (this.Mt !== null) {
            this.Mt.children.forEach(function(t) {
                t.context.vpa.ae();
            });
        }
        if (this.jt !== null) {
            this.jt.children.forEach(function(t) {
                t.context.vpa.ae();
            });
        }
        if (this.Lt !== null) {
            ensureTransitionHasNotErrored(this.Lt);
            switch (this.Tt) {
              case 64:
                switch (this._t) {
                  case 8192:
                  case 128:
                    this._t = 8192;
                    this.At = null;
                    break;

                  default:
                    this.qt("endTransition 1");
                }
                break;

              case 1:
                switch (this._t) {
                  case 8192:
                  case 128:
                    switch (this.Ot) {
                      case "none":
                        this._t = 4096;
                        break;

                      case "invoke-lifecycles":
                        this._t = 4096;
                        this.At.re = this.jt;
                        break;

                      case "replace":
                        this._t = 4096;
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
            this.Tt = 64;
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
    constructor(t, e, s, i, n, r, o, a, u, c, h, l, f) {
        this.path = t;
        this.finalPath = e;
        this.context = s;
        this.he = i;
        this.instruction = n;
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
        this.pe = null;
        this.he ??= n;
    }
    static create(e) {
        const {[s.RESIDUE]: i, ...n} = e.params ?? {};
        return new RouteNode(e.path, e.finalPath, e.context, e.originalInstruction ?? e.instruction, e.instruction, Object.freeze(n), e.queryParams ?? v, e.fragment ?? null, Object.freeze(e.data ?? t.emptyObject), e.le ?? null, e.title ?? null, e.component, e.residue ?? []);
    }
    contains(t, e = false) {
        if (this.context.routeConfigContext === t.options.context.routeConfigContext) {
            const s = this.children;
            const i = t.children;
            for (let t = 0, n = s.length; t < n; ++t) {
                for (let r = 0, o = i.length; r < o; ++r) {
                    const a = i[r];
                    const u = e ? a.recognizedRoute?.route.endpoint : null;
                    const c = s[t + r] ?? null;
                    const h = c !== null ? c.isInstructionsFinalized ? c.instruction : c.he : null;
                    const l = h?.recognizedRoute?.route.endpoint;
                    if (t + r < n && ((u?.equalsOrResidual(l) ?? false) || (h?.contains(a) ?? false))) {
                        if (r + 1 === o) {
                            return true;
                        }
                    } else {
                        break;
                    }
                }
            }
        }
        return this.children.some(function(s) {
            return s.contains(t, e);
        });
    }
    ge(t) {
        this.children.push(t);
        t.de(this.ue);
    }
    we() {
        for (const t of this.children) {
            t.we();
            t.context.vpa.oe();
        }
        this.children.length = 0;
    }
    getTitle(t) {
        const e = [ ...this.children.map(e => e.getTitle(t)), typeof this.title === "function" ? this.title.call(void 0, this) : this.title ].filter(t => t !== null);
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
    de(t) {
        this.ue = t;
        for (const e of this.children) {
            e.de(t);
        }
    }
    me() {
        this.ce = true;
        const t = this.children.map(t => t.me());
        const e = this.instruction.it();
        e.children.splice(0, e.children.length, ...t);
        return this.instruction = e;
    }
    it() {
        const t = new RouteNode(this.path, this.finalPath, this.context, this.he, this.instruction, this.params, this.queryParams, this.fragment, this.data, this.le, this.title, this.component, [ ...this.residue ]);
        const e = this.children;
        const s = e.length;
        for (let i = 0; i < s; ++i) {
            t.children.push(e[i].it());
        }
        t.fe = this.fe + 1;
        if (t.context.node === this) {
            t.context.node = t;
        }
        return t;
    }
    ve(e) {
        if (!e) return this.params;
        if (this.pe !== null) return this.pe;
        const s = Object.create(null);
        for (const [e, i] of this.queryParams.entries()) {
            if (i == null) continue;
            if (s[e] == null) {
                s[e] = i;
            } else {
                const n = s[e];
                s[e] = [ ...t.isArray(n) ? n : [ n ], ...t.isArray(i) ? i : [ i ] ];
            }
        }
        return this.pe = Object.freeze({
            ...s,
            ...this.params
        });
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
            t.push(`residue:${this.residue.map(function(t) {
                if (typeof t === "string") {
                    return `'${t}'`;
                }
                return String(t);
            }).join(",")}`);
        }
        return `RN(ctx:'${this.context?.routeConfigContext.Bt}',${t.join(",")})`;
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
        t.root.de(this);
        return t;
    }
    Ee() {
        return new ViewportInstructionTree(this.options, true, this.root.children.map(t => t.me()), this.queryParams, this.fragment);
    }
    xe(t) {
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
            s.we();

          case ".":
            return t.onResolveAll(...i.children.map(t => createAndAppendNodes(e, s, t)));

          default:
            {
                e.trace(`createAndAppendNodes invoking createNode`);
                const n = s.context;
                const r = i.it();
                let o = i.recognizedRoute;
                if (o !== null) return appendNode(e, s, createConfiguredNode(e, s, i, o, r));
                if (i.children.length === 0) {
                    const t = n.routeConfigContext.ye(i);
                    if (t !== null) {
                        s.ue.xe(t.query);
                        const n = t.vi;
                        n.children.push(...i.children);
                        return appendNode(e, s, createConfiguredNode(e, s, n, n.recognizedRoute, i));
                    }
                }
                let a = 0;
                let u = i.component.value;
                let c = i;
                while (c.children.length === 1) {
                    c = c.children[0];
                    if (c.component.type === 0) {
                        ++a;
                        u = `${u}/${c.component.value}`;
                    } else {
                        break;
                    }
                }
                o = n.routeConfigContext.recognize(u);
                e.trace("createNode recognized route: %s", o);
                const h = o?.residue ?? null;
                e.trace("createNode residue:", h);
                const l = h === null;
                if (o === null || h === u) {
                    const r = n.routeConfigContext.ye({
                        component: i.component.value,
                        params: i.params ?? t.emptyObject,
                        open: i.open,
                        close: i.close,
                        viewport: i.viewport,
                        children: i.children
                    });
                    if (r !== null) {
                        s.ue.xe(r.query);
                        return appendNode(e, s, createConfiguredNode(e, s, r.vi, r.vi.recognizedRoute, i));
                    }
                    const o = i.component.value;
                    if (o === "") return;
                    let a = i.viewport;
                    if (a === null || a.length === 0) a = S;
                    const u = n.getFallbackViewportAgent(a);
                    const c = u !== null ? u.viewport.nt(i, s, n) : n.routeConfigContext.config.nt(i, s, n);
                    if (c === null) throw new UnknownRouteError(getMessage(3401, o, n.routeConfigContext.Bt, a, o, n.routeConfigContext.component.name));
                    if (typeof c === "string") {
                        e.trace(`Fallback is set to '${c}'. Looking for a recognized route.`);
                        const t = n.routeConfigContext.childRoutes.find(t => t.id === c);
                        if (t !== void 0) return appendNode(e, s, createFallbackNode(e, t, s, i));
                        e.trace(`No route configuration for the fallback '${c}' is found; trying to recognize the route.`);
                        const r = n.routeConfigContext.recognize(c, true);
                        if (r !== null && r.residue !== c) return appendNode(e, s, createConfiguredNode(e, s, i, r, null));
                    }
                    e.trace(`The fallback '${c}' is not recognized as a route; treating as custom element name.`);
                    return t.onResolve(resolveRouteConfiguration(c, false, n.routeConfigContext.config, null, n.routeConfigContext), t => appendNode(e, s, createFallbackNode(e, t, s, i)));
                }
                o.residue = null;
                i.component.value = l ? u : u.slice(0, -(h.length + 1));
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
            return t.onResolve(resolveCustomElementDefinition(i.component.value, n.routeConfigContext)[1], r => {
                const {vi: o, query: a} = n.routeConfigContext.ye({
                    component: r,
                    params: i.params ?? t.emptyObject,
                    open: i.open,
                    close: i.close,
                    viewport: i.viewport,
                    children: i.children
                });
                s.ue.xe(a);
                return appendNode(e, s, createConfiguredNode(e, s, o, o.recognizedRoute, i));
            });
        }
    }
}

function createConfiguredNode(e, s, i, n, r, o = n.route.endpoint.route) {
    const a = s.context;
    const u = s.ue;
    return t.onResolve(o.handler, c => {
        o.handler = c;
        e.trace(`creatingConfiguredNode(rdc:%s, vi:%s)`, c, i);
        if (c.redirectTo === null) {
            const h = (i.viewport?.length ?? 0) > 0;
            const l = h ? i.viewport : c.viewport;
            return t.onResolve(resolveCustomElementDefinition(c.J(i, a, s, n.route), a.routeConfigContext)[1], f => {
                const p = a.Re(new ViewportRequest(l, f.name));
                if (!h) {
                    i.viewport = p.viewport.name;
                }
                const g = a.container.get(E);
                return t.onResolve(g.getRouteContext(p, f, null, p.hostController.container, a.routeConfigContext.config, a, c), t => {
                    e.trace("createConfiguredNode setting the context node");
                    const a = t.node = RouteNode.create({
                        path: n.route.endpoint.route.path,
                        finalPath: o.path,
                        context: t,
                        instruction: i,
                        originalInstruction: r,
                        params: n.route.params,
                        queryParams: u.queryParams,
                        fragment: u.fragment,
                        data: c.data,
                        le: l,
                        component: f,
                        title: c.title,
                        residue: i.children.slice()
                    });
                    a.de(s.ue);
                    e.trace(`createConfiguredNode(vi:%s) -> %s`, i, a);
                    return a;
                });
            });
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
                    g.push(n.route.params[w.component.parameterName]);
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
            children: i.children,
            viewport: i.viewport,
            open: i.open,
            close: i.close
        }), R, r);
    });
}

function appendNode(e, s, i) {
    return t.onResolve(i, t => {
        e.trace(`appendNode($childNode:%s)`, t);
        s.ge(t);
        return t.context.vpa.ne(s.ue.options, t);
    });
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
        return this.Se;
    }
    constructor(t, e, s, i, n, r, o, a, u, c, h, l, f, p, g) {
        this.id = t;
        this.prevInstructions = e;
        this.instructions = s;
        this.finalInstructions = i;
        this.instructionsChanged = n;
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
        this.Se = false;
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
                s.then(e).catch(t => {
                    this.Jt(t);
                });
            } else {
                e(s);
            }
        } catch (t) {
            this.Jt(t);
        }
    }
    Jt(t) {
        this.Se = t instanceof UnknownRouteError;
        this.reject(this.error = t);
    }
    toString() {
        return `T(id:${this.id},trigger:'${this.trigger}',instructions:${this.instructions})`;
    }
}

const E = /*@__PURE__*/ t.DI.createInterface("IRouter", t => t.singleton(Router));

class Router {
    get Ce() {
        const t = this.be;
        if (t !== null) return t;
        if (!this.c.has(C, true)) throw new Error(getMessage(3271));
        return this.be = this.c.get(C);
    }
    get routeTree() {
        let t = this.Ne;
        if (t === null) {
            const s = this.Ce;
            t = this.Ne = new RouteTree(NavigationOptions.create(this.options, {}), v, null, RouteNode.create({
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
        return this.$e ??= Transition.Z({
            id: 0,
            prevInstructions: this.ke,
            instructions: this.ke,
            finalInstructions: this.ke,
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
        this.$e = t;
    }
    get isNavigating() {
        return this.Ie;
    }
    constructor() {
        this.be = null;
        this.Ne = null;
        this.$e = null;
        this._e = false;
        this.Te = 0;
        this.Pe = null;
        this.Ae = null;
        this.Ve = false;
        this.Oe = [];
        this.Ie = false;
        this.c = t.resolve(t.IContainer);
        this.Me = t.resolve(e.IPlatform);
        this.L = t.resolve(t.ILogger).root.scopeTo("Router");
        this.T = t.resolve(u);
        this.je = t.resolve(h);
        this.options = t.resolve(R);
        this.Le = new WeakMap;
        this.Ue = new Map;
        this.ke = ViewportInstructionTree.create("", this.options, null, null);
        this.c.registerResolver(Router, t.Registration.instance(Router, this));
    }
    Be(t) {
        return RouteContext.resolve(this.Ce, t);
    }
    start(t) {
        this.Ve = typeof this.options.buildTitle === "function";
        this.je.startListening();
        this.Ae = this.T.subscribe("au:router:location-change", t => {
            this.Me.taskQueue.queueTask(() => {
                const e = isManagedState(t.state) ? t.state : null;
                const s = this.options;
                const i = NavigationOptions.create(s, {
                    historyStrategy: "replace"
                });
                const n = ViewportInstructionTree.create(t.url, s, i, this.Ce);
                this.ze(n, t.trigger, e, null);
            });
        });
        if (!this._e && t) {
            return this.load(this.je.getPath(), {
                historyStrategy: this.options.historyStrategy !== "none" ? "replace" : "none"
            });
        }
    }
    stop() {
        this.je.stopListening();
        this.Ae?.dispose();
    }
    load(e, s) {
        return t.onResolve(this.createViewportInstructions(e, s ?? null), t => this.ze(t, "api", null, null));
    }
    isActive(t, e) {
        const s = this.Be(e);
        const i = t instanceof ViewportInstructionTree ? t : this.createViewportInstructions(t, {
            context: s,
            historyStrategy: this.options.historyStrategy
        });
        return this.routeTree.contains(i, false);
    }
    getRouteContext(e, s, i, n, r, o, a) {
        return t.onResolve(this.getRouteConfigContext(a, s, i, n, r, o?.routeConfigContext ?? null), t => {
            let s = this.Ue.get(e);
            if (s === void 0) {
                this.Ue.set(e, s = new WeakMap);
            }
            let i = s.get(t);
            if (i !== void 0) {
                return i;
            }
            const r = n.has(C, true) ? n.get(C) : null;
            s.set(t, i = new RouteContext(e, r, n, this, t, this.je));
            return i;
        });
    }
    getRouteConfigContext(e, s, i, n, r, o) {
        return t.onResolve(e instanceof RouteConfig && !e.X ? e : resolveRouteConfiguration(typeof i?.getRouteConfig === "function" ? i : s.Type, false, r, null, o), t => {
            let e = this.Le.get(t);
            if (e != null) return e;
            e = new RouteConfigContext(o, s, t, n, this);
            this.Le.set(t, e);
            return e;
        });
    }
    generatePath(e, s) {
        return t.onResolve(this.createViewportInstructions(createEagerInstructions(e), {
            context: s ?? this.Ce
        }, true), t => t.toUrl(true, this.options.De, t.options.context.isRoot));
    }
    createViewportInstructions(t, e, s) {
        if (t instanceof ViewportInstructionTree) return t;
        let i = e?.context ?? null;
        if (i !== null) i = e.context = this.Be(i);
        return (i ?? this.be).createViewportInstructions(t, e, s);
    }
    ze(t, e, s, i) {
        const n = this.currentTr;
        const r = this.L;
        if (e !== "api" && n.trigger === "api" && n.instructions.equals(t)) {
            return true;
        }
        let o = void 0;
        let a = void 0;
        let u;
        const c = this.options.restorePreviousRouteTreeOnError;
        if (i === null || i.erredWithUnknownRoute || i.error != null && c) {
            u = new Promise(function(t, e) {
                o = t;
                a = e;
            });
        } else {
            u = i.promise;
            o = i.resolve;
            a = i.reject;
        }
        const h = this.Pe = Transition.Z({
            id: ++this.Te,
            trigger: e,
            managedState: s,
            prevInstructions: n.finalInstructions,
            finalInstructions: t,
            instructionsChanged: !n.finalInstructions.equals(t),
            instructions: t,
            options: t.options,
            promise: u,
            resolve: o,
            reject: a,
            previousRouteTree: this.routeTree,
            routeTree: this.Ne = this.routeTree.it(),
            guardsResult: true,
            error: void 0
        });
        if (!this.Ie) {
            try {
                this.te(h);
            } catch (t) {
                h.Jt(t);
            }
        }
        return h.promise.then(t => t).catch(t => {
            error(r, 3270, h, t);
            if (h.erredWithUnknownRoute) {
                this.qe(h);
            } else {
                this.Ie = false;
                this.T.publish(new NavigationErrorEvent(h.id, h.instructions, t));
                if (c) {
                    this.qe(h);
                } else {
                    const t = this.Pe;
                    if (t !== null) {
                        t.previousRouteTree = h.previousRouteTree;
                    } else {
                        this.Ne = h.previousRouteTree;
                    }
                }
            }
            throw t;
        });
    }
    te(e) {
        this.currentTr = e;
        this.Pe = null;
        this.Ie = true;
        for (const t of this.Oe) {
            t.routeConfigContext.ot();
        }
        let s = this.Be(e.options.context);
        this.T.publish(new NavigationStartEvent(e.id, e.instructions, e.trigger, e.managedState));
        if (this.Pe !== null) {
            return this.te(this.Pe);
        }
        e.te(() => {
            const i = e.finalInstructions;
            const n = this.Ce;
            const r = e.routeTree;
            r.options = i.options;
            r.queryParams = n.node.ue.queryParams = i.queryParams;
            r.fragment = n.node.ue.fragment = i.fragment;
            const o = /*@__PURE__*/ s.container.get(t.ILogger).scopeTo("RouteTree");
            if (i.isAbsolute) {
                s = n;
            }
            if (s === n) {
                r.root.de(r);
                n.node = r.root;
            }
            const a = s.routeConfigContext.allResolved instanceof Promise ? " - awaiting promise" : "";
            o.trace(`updateRouteTree(rootCtx:%s,rt:%s,vit:%s)${a}`, n, r, i);
            return t.onResolve(s.routeConfigContext.allResolved, () => updateNode(o, i, s, n.node));
        }, () => {
            const t = e.previousRouteTree.root.children;
            const s = e.routeTree.root.children;
            const i = mergeDistinct(t, s);
            Batch.C(s => {
                for (const i of t) {
                    i.context.vpa.Qt(e, s);
                }
            })._(t => {
                if (e.guardsResult !== true) {
                    t.N();
                    this.qe(e);
                }
            })._(t => {
                for (const i of s) {
                    i.context.vpa.Yt(e, t);
                }
            })._(t => {
                if (e.guardsResult !== true) {
                    t.N();
                    this.qe(e);
                }
            })._(s => {
                for (const i of t) {
                    i.context.vpa.Xt(e, s);
                }
            })._(t => {
                for (const i of s) {
                    i.context.vpa.Zt(e, t);
                }
            })._(t => {
                for (const s of i) {
                    s.context.vpa.ie(e, t);
                }
            })._(t => {
                if (e.guardsResult !== true) {
                    t.N();
                    this.qe(e);
                }
            })._(() => {
                i.forEach(function(t) {
                    t.context.vpa.ae();
                });
                this._e = true;
                this.ke = e.finalInstructions = e.routeTree.Ee();
                this.Ie = false;
                const t = e.finalInstructions.toUrl(true, this.options.De, true);
                switch (e.options.He(this.ke)) {
                  case "none":
                    break;

                  case "push":
                    this.je.pushState(toManagedState(e.options.state, e.id), this.updateTitle(e), t);
                    break;

                  case "replace":
                    this.je.replaceState(toManagedState(e.options.state, e.id), this.updateTitle(e), t);
                    break;
                }
                this.T.publish(new NavigationEndEvent(e.id, e.instructions, this.ke));
                e.resolve(true);
                this.Ge();
            }).C();
        });
    }
    updateTitle(t = this.currentTr) {
        const e = this.Fe(t);
        if (e.length > 0) {
            this.Me.document.title = e;
        }
        return this.Me.document.title;
    }
    Fe(t = this.currentTr) {
        let e;
        if (this.Ve) {
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
    We(t) {
        this.Oe.push(t);
    }
    Qe(t) {
        const e = this.Oe.indexOf(t);
        if (e > -1) {
            this.Oe.splice(e, 1);
        }
    }
    qe(e) {
        const s = e.previousRouteTree.root.children;
        const i = e.routeTree.root.children;
        const n = mergeDistinct(s, i);
        n.forEach(function(t) {
            t.context.vpa.oe();
        });
        this.ke = e.prevInstructions;
        this.Ne = e.previousRouteTree;
        this.Ie = false;
        const r = e.guardsResult;
        this.T.publish(new NavigationCancelEvent(e.id, e.instructions, `guardsResult is ${r}`));
        if (r === false) {
            e.resolve(false);
            this.Ge();
        } else {
            let s;
            if (this._e && (e.erredWithUnknownRoute || e.error != null && this.options.restorePreviousRouteTreeOnError)) s = e.prevInstructions; else if (r === true) return; else s = r;
            void t.onResolve(this.ze(s, "api", e.managedState, e), () => {});
        }
    }
    Ge() {
        if (this.Pe === null) return;
        this.Me.taskQueue.queueTask(() => {
            const t = this.Pe;
            if (t === null) return;
            try {
                this.te(t);
            } catch (e) {
                t.Jt(e);
            }
        });
    }
}

function updateNode(e, s, i, n) {
    e.trace(`updateNode(ctx:%s,node:%s)`, i, n);
    n.queryParams = s.queryParams;
    n.fragment = s.fragment;
    if (!n.context.routeConfigContext.isRoot) {
        n.context.vpa.ne(n.ue.options, n);
    }
    if (n.context === i) {
        n.we();
        return t.onResolve(t.onResolveAll(...s.children.map(t => createAndAppendNodes(e, n, t))), () => t.onResolveAll(...i.getAvailableViewportAgents().reduce((t, s) => {
            const i = s.viewport;
            const r = i.default;
            if (r === null) return t;
            t.push(createAndAppendNodes(e, n, ViewportInstruction.create({
                component: r,
                viewport: i.name
            })));
            return t;
        }, [])));
    }
    return t.onResolveAll(...n.children.map(t => updateNode(e, s, i, t)));
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
    stringify(t, e, s, i) {
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
    stringify(t, e, s, i) {
        return `${i ? "/#/" : ""}${stringify(t, e, s)}`;
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
    constructor(t, e, s, i, n, r, o, a) {
        this.useUrlFragmentHash = t;
        this.useHref = e;
        this.historyStrategy = s;
        this.buildTitle = i;
        this.useNavigationModel = n;
        this.activeClass = r;
        this.restorePreviousRouteTreeOnError = o;
        this.treatQueryAsParameters = a;
        this.De = t ? y : x;
    }
    static create(t) {
        return new RouterOptions(t.useUrlFragmentHash ?? false, t.useHref ?? true, t.historyStrategy ?? "push", t.buildTitle ?? null, t.useNavigationModel ?? true, t.activeClass ?? null, t.restorePreviousRouteTreeOnError ?? true, t.treatQueryAsParameters ?? false);
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
    He(t) {
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
        const r = t ? this.children.map(t => t.toUrlComponent()).join("+") : "";
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
    static create(e, s, i, n, r) {
        i = i instanceof NavigationOptions ? i : NavigationOptions.create(s, i ?? t.emptyObject);
        let o = i.context;
        if (!(o instanceof RouteContext) && n != null) {
            o = i.context = RouteContext.resolve(n, o);
        }
        const a = o != null;
        if (e instanceof Array) {
            const s = e.length;
            const n = new Array(s);
            const u = new URLSearchParams(i.queryParams ?? t.emptyObject);
            const c = new Array(s);
            for (let i = 0; i < s; i++) {
                const s = e[i];
                c[i] = t.onResolve(a ? o.routeConfigContext.ye(s, r) : null, t => {
                    if (t !== null) {
                        n[i] = t.vi;
                        mergeURLSearchParams(u, t.query, false);
                    } else {
                        n[i] = ViewportInstruction.create(s);
                    }
                });
            }
            return t.onResolve(t.onResolveAll(...c), () => new ViewportInstructionTree(i, false, n, u, i.fragment));
        }
        if (typeof e === "string") {
            const t = RouteExpression.parse(s.De.parse(e));
            return t.toInstructionTree(i);
        }
        return t.onResolve(a ? o.routeConfigContext.ye(isPartialViewportInstruction(e) ? {
            ...e,
            params: e.params ?? t.emptyObject
        } : {
            component: e,
            params: t.emptyObject
        }, r) : null, s => {
            const n = new URLSearchParams(i.queryParams ?? t.emptyObject);
            return s !== null ? new ViewportInstructionTree(i, false, [ s.vi ], mergeURLSearchParams(n, s.query, false), i.fragment) : new ViewportInstructionTree(i, false, [ ViewportInstruction.create(e) ], n, i.fragment);
        });
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
    toUrl(t, e, s) {
        let i = "";
        if (!t) {
            const t = [];
            let e = this.options.context;
            if (e != null && !(e instanceof RouteContext)) throw new Error("Invalid operation; incompatible navigation context.");
            while (e != null && !e.routeConfigContext.isRoot) {
                const s = e.vpa;
                const i = s._t === 4096 ? s.Mt : s.jt;
                if (i == null) throw new Error("Invalid operation; nodes of the viewport agent are not set.");
                t.splice(0, 0, i.instruction.toUrlComponent());
                e = e.parent;
            }
            if (t[0] === "") {
                t.splice(0, 1);
            }
            i = t.join("/");
        }
        const n = this.toPath();
        return e.stringify(i.length > 0 ? `${i}/${n}` : n, this.queryParams, this.fragment, s);
    }
    toPath() {
        return this.children.map(t => t.toUrlComponent()).join("+");
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
        this.Je = e;
        this.Ye = s;
        this.re = i;
        this.Ce = n;
        this.Ke = r;
        this.L = s.container.get(t.ILogger).scopeTo(`ComponentAgent<${n.routeConfigContext.Bt}>`);
        const o = s.lifecycleHooks;
        this.Xe = (o.canLoad ?? []).map(t => t.instance);
        this.Ze = (o.loading ?? []).map(t => t.instance);
        this.ts = (o.canUnload ?? []).map(t => t.instance);
        this.es = (o.unloading ?? []).map(t => t.instance);
        this.ss = "canLoad" in e;
        this.ns = "loading" in e;
        this.rs = "canUnload" in e;
        this.us = "unloading" in e;
    }
    Dt(t, s) {
        const i = this.Ye;
        const n = this.Ce.vpa.hostController;
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
            return this.Ye.activate(this.Ye, s);
        }
        void this.Ye.activate(t, s);
    }
    Gt(t, e) {
        const s = this.Ye;
        s.host?.remove();
        s.location?.remove();
        s.location?.$start?.remove();
        if (t === null) {
            return s.deactivate(s, e);
        }
        void s.deactivate(t, e);
    }
    ee() {
        this.Ye.dispose();
    }
    Qt(t, e, s) {
        s.N();
        let i = Promise.resolve();
        for (const n of this.ts) {
            s.N();
            i = i.then(() => new Promise(i => {
                if (t.guardsResult !== true) {
                    s.$();
                    i();
                    return;
                }
                t.te(() => n.canUnload(this.Je, e, this.re), e => {
                    if (t.guardsResult === true && e === false) {
                        t.guardsResult = false;
                    }
                    s.$();
                    i();
                });
            }));
        }
        if (this.rs) {
            s.N();
            i = i.then(() => {
                if (t.guardsResult !== true) {
                    s.$();
                    return;
                }
                t.te(() => this.Je.canUnload(e, this.re), e => {
                    if (t.guardsResult === true && e === false) {
                        t.guardsResult = false;
                    }
                    s.$();
                });
            });
        }
        s.$();
    }
    Yt(t, e, s) {
        const i = e.ve(this.Ke.treatQueryAsParameters);
        const n = this.Ce.root;
        s.N();
        let r = Promise.resolve();
        for (const o of this.Xe) {
            s.N();
            r = r.then(() => new Promise(r => {
                if (t.guardsResult !== true) {
                    s.$();
                    r();
                    return;
                }
                t.te(() => o.canLoad(this.Je, i, e, this.re), e => {
                    if (t.guardsResult === true && e != null && e !== true) {
                        t.guardsResult = e === false ? false : ViewportInstructionTree.create(e, this.Ke, null, n);
                    }
                    s.$();
                    r();
                });
            }));
        }
        if (this.ss) {
            s.N();
            r = r.then(() => {
                if (t.guardsResult !== true) {
                    s.$();
                    return;
                }
                t.te(() => this.Je.canLoad(i, e, this.re), e => {
                    if (t.guardsResult === true && e != null && e !== true) {
                        t.guardsResult = e === false ? false : ViewportInstructionTree.create(e, this.Ke, null, n);
                    }
                    s.$();
                });
            });
        }
        s.$();
    }
    Xt(t, e, s) {
        s.N();
        for (const i of this.es) {
            t.te(() => {
                s.N();
                return i.unloading(this.Je, e, this.re);
            }, () => {
                s.$();
            });
        }
        if (this.us) {
            t.te(() => {
                s.N();
                return this.Je.unloading(e, this.re);
            }, () => {
                s.$();
            });
        }
        s.$();
    }
    Zt(t, e, s) {
        const i = e.ve(this.Ke.treatQueryAsParameters);
        s.N();
        for (const n of this.Ze) {
            t.te(() => {
                s.N();
                return n.loading(this.Je, i, e, this.re);
            }, () => {
                s.$();
            });
        }
        if (this.ns) {
            t.te(() => {
                s.N();
                return this.Je.loading(i, e, this.re);
            }, () => {
                s.$();
            });
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
        const t = this.cs;
        if (t === null) throw new Error(getMessage(3171, this));
        return t;
    }
    set node(t) {
        const e = this.ls = this.cs;
        if (e !== t) {
            this.cs = t;
        }
    }
    get vpa() {
        const t = this.ps;
        if (t === null) throw new Error(getMessage(3172, this));
        return t;
    }
    constructor(s, i, n, r, o, a) {
        this.parent = i;
        this.gs = r;
        this.routeConfigContext = o;
        this.je = a;
        this.ds = [];
        this.ls = null;
        this.cs = null;
        this.ps = s;
        if (i === null) {
            this.root = this;
        } else {
            this.root = i.root;
        }
        this.L = n.get(t.ILogger).scopeTo(`RouteContext<${this.routeConfigContext.Bt}>`);
        this.gs.We(this);
        const c = this.container = n.createChild();
        this.p = c.get(e.IPlatform);
        c.registerResolver(e.IController, this.ws = new t.InstanceProvider, true);
        const h = new t.InstanceProvider("IRouteContext", this);
        c.registerResolver(C, h);
        c.registerResolver(RouteContext, h);
        if (r.options.useNavigationModel) {
            c.get(u).subscribe("au:router:navigation-end", () => {
                o.navigationModel.Es(r, this);
            });
        }
    }
    static setRoot(s) {
        const i = s.get(t.ILogger).scopeTo("RouteContext");
        if (!s.has(e.IAppRoot, true)) {
            logAndThrow(new Error(getMessage(3167)), i);
        }
        if (s.has(C, true)) {
            logAndThrow(new Error(getMessage(3168)), i);
        }
        const {controller: n} = s.get(e.IAppRoot);
        if (n === void 0) {
            logAndThrow(new Error(getMessage(3169)), i);
        }
        const r = s.get(E);
        return t.onResolve(r.getRouteContext(null, n.definition, n.viewModel, n.container, null, null, null), e => {
            s.register(t.Registration.instance(C, e));
            e.node = r.routeTree.root;
        });
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
                return t.container.get(C);
            } catch (t) {
                error(r, 3155, i.nodeName, t);
                throw t;
            }
        }
        if (e.isCustomElementViewModel(i)) {
            const t = i.$controller;
            return t.container.get(C);
        }
        if (e.isCustomElementController(i)) {
            const t = i;
            return t.container.get(C);
        }
        logAndThrow(new Error(getMessage(3170, Object.prototype.toString.call(i))), r);
    }
    dispose() {
        this.container.dispose();
        this.gs.Qe(this);
    }
    Re(t) {
        const e = this.ds.find(e => e.Ft(t));
        if (e === void 0) throw new Error(getMessage(3174, t, this.xs()));
        return e;
    }
    getAvailableViewportAgents() {
        return this.ds.filter(t => t.Wt());
    }
    getFallbackViewportAgent(t) {
        return this.ds.find(e => e.Wt() && e.viewport.name === t && e.viewport.fallback !== "") ?? null;
    }
    Kt(s, i) {
        this.ws.prepare(s);
        const n = this.container.createChild({
            inheritParentResources: true
        });
        const r = this.p;
        const o = i.component;
        const a = r.document.createElement(o.name);
        e.registerHostNode(n, a, r);
        const u = n.invoke(o.Type);
        const c = this.routeConfigContext.ys ? void 0 : t.onResolve(resolveRouteConfiguration(u, false, this.routeConfigContext.config, i, null), t => this.routeConfigContext.Rs(t));
        return t.onResolve(c, () => {
            const t = e.Controller.$el(n, u, a, {
                projections: null
            }, o);
            const s = new ComponentAgent(u, t, i, this, this.gs.options);
            this.ws.dispose();
            return s;
        });
    }
    generateRootedPath(e) {
        return t.onResolve(this.createViewportInstructions(createEagerInstructions(e), null, true), t => {
            const e = this.gs.options;
            const s = t.toUrl(true, e.De, false);
            let i = "";
            const n = [];
            let r = t.options.context;
            while (!r.isRoot) {
                const t = r.vpa?.Mt?.instruction?.toUrlComponent(false);
                if ((t?.length ?? 0) !== 0) n.unshift(t);
                r = r.parent;
            }
            i = n.join("/");
            return `${e.useUrlFragmentHash ? "/#/" : ""}${i.length === 0 ? s : `${i}/${s}`}`;
        });
    }
    generateRelativePath(e) {
        return t.onResolve(this.createViewportInstructions(createEagerInstructions(e), null, true), t => t.toUrl(true, this.gs.options.De, t.options.context.isRoot));
    }
    createViewportInstructions(e, s, i) {
        if (e instanceof ViewportInstructionTree) return e;
        let n = s?.context ?? this;
        let r = false;
        if (!t.isArray(e)) {
            e = processStringInstruction.call(this, e);
        } else {
            const t = e.length;
            for (let s = 0; s < t; ++s) {
                e[s] = processStringInstruction.call(this, e[s]);
            }
        }
        const o = this.gs.options;
        return ViewportInstructionTree.create(e, o, NavigationOptions.create(o, {
            ...s,
            context: n
        }), this.root, i);
        function processStringInstruction(t) {
            if (typeof t === "string") t = this.je.removeBaseHref(t);
            const e = isPartialViewportInstruction(t);
            let s = e ? t.component : t;
            if (typeof s === "string" && s.startsWith("../") && n !== null) {
                while (s.startsWith("../") && ((n?.parent ?? null) !== null || r)) {
                    s = s.slice(3);
                    if (!r) n = n.parent;
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
    Ss(t) {
        const e = ViewportAgent.for(t, this);
        if (this.ds.includes(e)) {
            return e;
        }
        this.ds.push(e);
        return e;
    }
    Cs(t) {
        const e = ViewportAgent.for(t, this);
        if (!this.ds.includes(e)) {
            return;
        }
        this.ds.splice(this.ds.indexOf(e), 1);
    }
    toString() {
        const t = this.ds;
        const e = t.map(String).join(",");
        return `RC(path:'${this.routeConfigContext.Bt}',viewports:[${e}])`;
    }
    xs() {
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
        return this.bs;
    }
    get allResolved() {
        return this.Ns;
    }
    constructor(e, i, n, r, o) {
        this.parent = e;
        this.component = i;
        this.config = n;
        this.gs = o;
        this.ys = false;
        this.childRoutes = [];
        this.Ns = null;
        if (e === null) {
            this.root = this;
            this.path = [ this ];
            this.Bt = i.name;
        } else {
            this.root = e.root;
            this.path = [ ...e.path, this ];
            this.Bt = `${e.Bt}/${i.name}`;
        }
        this.L = r.get(t.ILogger).scopeTo(`RouteConfigContext<${this.Bt}>`);
        this.$s = r.get(t.IModuleLoader);
        this.container = r.createChild();
        this.ks = new s.RouteRecognizer;
        if (o.options.useNavigationModel) {
            this.bs = new NavigationModel([]);
        } else {
            this.bs = null;
        }
        this.Rs(n);
    }
    ot() {
        this.config.ot();
        for (const t of this.childRoutes) {
            if (t instanceof Promise) continue;
            t.ot();
        }
    }
    Rs(e) {
        const s = [];
        const i = e.routes ?? l;
        const n = i.length;
        if (n === 0) {
            const t = e.component.prototype?.getRouteConfig;
            this.ys = t == null ? true : typeof t !== "function";
            return;
        }
        const r = this.bs;
        const o = r !== null;
        let a = 0;
        for (;a < n; a++) {
            const n = i[a];
            if (n instanceof Promise) {
                s.push(this.Is(n));
                continue;
            }
            const u = resolveRouteConfiguration(n, true, e, null, this);
            if (u instanceof Promise) {
                if (!isPartialChildRouteConfig(n) || n.path == null) throw new Error(getMessage(3173));
                for (const t of ensureArrayOfStrings(n.path)) {
                    this._s(t, n.caseSensitive ?? false, u);
                }
                const e = this.childRoutes.length;
                const i = u.then(t => this.childRoutes[e] = t);
                this.childRoutes.push(i);
                if (o) {
                    r.Is(i);
                }
                s.push(i.then(t.noop));
                continue;
            }
            for (const e of u.path ?? t.emptyArray) {
                this._s(e, u.caseSensitive, u);
            }
            this.childRoutes.push(u);
            if (o) {
                r.Is(u);
            }
        }
        this.ys = true;
        if (s.length > 0) {
            this.Ns = Promise.all(s).then(() => {
                this.Ns = null;
            });
        }
    }
    Is(e) {
        return t.onResolve(resolveRouteConfiguration(e, true, this.config, null, this), e => {
            for (const s of e.path ?? t.emptyArray) {
                this._s(s, e.caseSensitive, e);
            }
            this.bs?.Is(e);
            this.childRoutes.push(e);
        });
    }
    _s(t, e, s) {
        this.ks.add({
            path: t,
            caseSensitive: e,
            handler: s
        }, true);
    }
    ut(t) {
        return this.$s.load(t, s => {
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
        });
    }
    ye(i, n) {
        if (!isEagerInstruction(i)) return null;
        n ??= false;
        const r = i.component;
        let o;
        let a = false;
        if (r instanceof RouteConfig) {
            o = r.path;
            a = true;
        } else if (typeof r === "string") {
            const t = this.childRoutes.find(t => t.id === r);
            if (t === void 0) return null;
            o = t.path;
        } else if (r.type === 0) {
            const t = this.childRoutes.find(t => t.id === r.value);
            if (t === void 0) return null;
            o = t.path;
        } else {
            const t = resolveCustomElementDefinition(r, this)[1];
            o = this.childRoutes.reduce((e, s) => {
                if (s.component === t.Type) {
                    e.push(...s.path);
                }
                return e;
            }, []);
            a = true;
        }
        if (o === void 0) return null;
        const u = i.params;
        const c = this.ks;
        const h = o.length;
        const l = [];
        let f = null;
        if (h === 1) {
            const t = core(o[0]);
            if (t === null) {
                if (a) throw new Error(getMessage(3166, i, l));
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
            if (a) throw new Error(getMessage(3166, i, l));
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
            for (const i of e.params) {
                const e = i.name;
                let n = u[e];
                if (n == null || String(n).length === 0) {
                    if (!i.isOptional) {
                        l.push(`No value for the required parameter '${e}' is provided for the path: '${t}'.`);
                        return null;
                    }
                    n = "";
                } else {
                    if (!i.satisfiesPattern(n)) {
                        l.push(`The value '${n}' for the parameter '${e}' does not satisfy the pattern '${i.pattern}'.`);
                        return null;
                    }
                    s[e] = n;
                }
                const r = i.isStar ? `*${e}` : i.isOptional ? `:${e}?` : `:${e}`;
                t = t.replace(r, encodeURIComponent(n));
            }
            const i = Object.keys(s);
            const n = Object.fromEntries(Object.entries(u).filter(([t]) => !i.includes(t)));
            return {
                path: t.replace(/\/\//g, "/"),
                endpoint: e,
                consumed: s,
                query: n
            };
        }
        async function generateChildrenInstructions(s) {
            const r = i.children;
            const o = r?.length ?? 0;
            if (o === 0) return {
                instructions: t.emptyArray,
                query: t.emptyObject
            };
            const a = s.component;
            const u = e.CustomElement.isType(a) ? e.CustomElement.getDefinition(a) : resolveCustomElementDefinition(a, this)[1];
            return t.onResolve(t.onResolve(this.gs.getRouteConfigContext(s, u, null, this.container, this.config, this), e => t.onResolve(e.allResolved, () => e)), e => {
                const s = new Array(o);
                const i = new Array(o);
                let a = Object.create(null);
                for (let u = 0; u < o; ++u) {
                    const o = r[u];
                    s[u] = t.onResolve(e.ye(isPartialViewportInstruction(o) ? {
                        ...o,
                        params: o.params ?? t.emptyObject
                    } : {
                        component: o,
                        params: t.emptyObject
                    }, n), t => {
                        if (t == null) throw new Error(getMessage(3166, o));
                        i[u] = t.vi;
                        a = mergeQueryParams(a, t.query);
                    });
                }
                return t.onResolve(Promise.all(s), () => ({
                    instructions: i,
                    query: a
                }));
            });
        }
        function createPathGenerationResult(e) {
            return t.onResolve(n ? generateChildrenInstructions.call(this, e.endpoint.route.handler) : {
                instructions: i.children,
                query: t.emptyObject
            }, ({instructions: t, query: n}) => ({
                vi: ViewportInstruction.create({
                    recognizedRoute: new $RecognizedRoute(new s.RecognizedRoute(e.endpoint, e.consumed), null),
                    component: e.path,
                    children: t,
                    viewport: i.viewport,
                    open: i.open,
                    close: i.close
                }),
                query: mergeQueryParams(e.query, n)
            }));
        }
    }
    recognize(t, e = false) {
        let i = this;
        let n = true;
        let r = null;
        while (n) {
            r = i.ks.recognize(t);
            if (r === null) {
                if (!e || i.isRoot) return null;
                i = i.parent;
            } else {
                n = false;
            }
        }
        return new $RecognizedRoute(r, Reflect.has(r.params, s.RESIDUE) ? r.params[s.RESIDUE] ?? null : null);
    }
    dispose() {
        this.container.dispose();
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
        this.Ts = void 0;
    }
    resolve() {
        return t.onResolve(this.Ts, t.noop);
    }
    Es(e, s) {
        void t.onResolve(this.Ts, () => {
            for (const t of this.routes) {
                t.Es(e, s);
            }
        });
    }
    Is(e) {
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
        n = this.Ts = t.onResolve(this.Ts, () => t.onResolve(e, t => {
            if (t.nav && t.redirectTo === null) {
                s[i] = NavigationRoute.Z(t);
            } else {
                s.splice(i, 1);
            }
            if (this.Ts === n) {
                this.Ts = void 0;
            }
        }));
    }
}

class NavigationRoute {
    constructor(t, e, s, i) {
        this.id = t;
        this.path = e;
        this.title = s;
        this.data = i;
        this.Ps = null;
    }
    static Z(e) {
        return new NavigationRoute(e.id, ensureArrayOfStrings(e.path ?? t.emptyArray), e.title, e.data);
    }
    get isActive() {
        return this.Pt;
    }
    Es(e, i) {
        let n = this.Ps;
        if (n === null) {
            const r = e.options;
            n = this.Ps = this.path.map(e => {
                const n = i.routeConfigContext.ks.getEndpoint(e);
                if (n === null) throw new Error(getMessage(3450, e));
                return new ViewportInstructionTree(NavigationOptions.create(r, {
                    context: i
                }), false, [ ViewportInstruction.create({
                    recognizedRoute: new $RecognizedRoute(new s.RecognizedRoute(n, t.emptyObject), null),
                    component: e
                }) ], v, null);
            });
        }
        this.Pt = n.some(t => e.routeTree.contains(t, true));
    }
}

class ViewportCustomElement {
    constructor() {
        this.name = S;
        this.usedBy = "";
        this.default = "";
        this.fallback = "";
        this.As = void 0;
        this.Ye = void 0;
        this.Ce = t.resolve(C);
        this.L = t.resolve(t.ILogger).scopeTo(`au-viewport<${this.Ce.routeConfigContext.Bt}>`);
    }
    nt(t, s, i) {
        const n = this.fallback;
        return typeof n === "function" && !e.CustomElement.isType(n) ? n(t, s, i) : n;
    }
    hydrated(t) {
        this.Ye = t;
        this.As = this.Ce.Ss(this);
    }
    attaching(t, e) {
        return this.As.zt(t, this.Ye);
    }
    detaching(t, e) {
        return this.As.Ht(t, this.Ye);
    }
    dispose() {
        this.Ce.Cs(this);
        this.As.ee();
        this.As = void 0;
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
        return `VP(ctx:'${this.Ce.routeConfigContext.Bt}',${t.join(",")})`;
    }
}

e.CustomElement.define({
    name: "au-viewport",
    bindables: [ "name", "usedBy", "default", "fallback" ]
}, ViewportCustomElement);

const N = [ "name", "usedBy", "default", "fallback" ];

class LoadCustomAttribute {
    constructor() {
        this.Vs = t.resolve(e.INode);
        this.gs = t.resolve(E);
        this.Ce = t.resolve(C);
        this.T = t.resolve(u);
        this.je = t.resolve(h);
        this.attribute = "href";
        this.active = false;
        this.Os = null;
        this.ke = null;
        this.Ms = null;
        this.onClick = t => {
            if (this.ke === null) {
                return;
            }
            if (t.altKey || t.ctrlKey || t.shiftKey || t.metaKey || t.button !== 0) {
                return;
            }
            t.preventDefault();
            void this.gs.load(this.ke, {
                context: this.context
            });
        };
        const s = this.Vs;
        this.js = !s.hasAttribute("external") && !s.hasAttribute("data-external");
        this.Ls = this.gs.options.activeClass;
    }
    binding() {
        if (this.js) {
            this.Vs.addEventListener("click", this.onClick);
        }
        this.valueChanged();
        this.Ms = this.T.subscribe("au:router:navigation-end", t => {
            const e = this.active = this.ke !== null && this.gs.isActive(this.ke, this.context);
            const s = this.Ls;
            if (s === null) return;
            this.Vs.classList.toggle(s, e);
        });
    }
    attaching() {
        const t = this.context;
        const e = t.routeConfigContext.allResolved;
        if (e !== null) {
            return e.then(() => {
                this.valueChanged();
            });
        }
    }
    unbinding() {
        if (this.js) {
            this.Vs.removeEventListener("click", this.onClick);
        }
        this.Ms.dispose();
    }
    valueChanged() {
        const t = this.gs;
        const s = t.options;
        const i = this.route;
        let n = this.context;
        if (n === void 0) {
            n = this.context = this.Ce;
        } else if (n === null) {
            n = this.context = this.Ce.root;
        }
        if (i != null && n.routeConfigContext.allResolved === null) {
            const e = this.params;
            const r = this.ke = t.createViewportInstructions(typeof e === "object" && e !== null ? {
                component: i,
                params: e
            } : i, {
                context: n
            });
            this.Os = r.toUrl(false, s.De, true);
        } else {
            this.ke = null;
            this.Os = null;
        }
        const r = e.CustomElement.for(this.Vs, {
            optional: true
        });
        if (r !== null) {
            r.viewModel[this.attribute] = this.ke;
        } else {
            if (this.Os === null) {
                this.Vs.removeAttribute(this.attribute);
            } else {
                const t = s.useUrlFragmentHash ? this.Os : this.je.addBaseHref(this.Os);
                this.Vs.setAttribute(this.attribute, t);
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
    get Us() {
        return this.Vs.hasAttribute("external") || this.Vs.hasAttribute("data-external");
    }
    constructor() {
        this.Vs = t.resolve(e.INode);
        this.gs = t.resolve(E);
        this.Ce = t.resolve(C);
        this.Bs = false;
        if (this.gs.options.useHref && this.Vs.nodeName === "A") {
            const s = t.resolve(e.IWindow).name;
            switch (this.Vs.getAttribute("target")) {
              case null:
              case s:
              case "_self":
                this.js = true;
                break;

              default:
                this.js = false;
                break;
            }
        } else {
            this.js = false;
        }
    }
    binding() {
        if (!this.Bs) {
            this.Bs = true;
            this.js = this.js && e.refs.get(this.Vs, e.CustomAttribute.getDefinition(LoadCustomAttribute).key) === null;
        }
        this.valueChanged(this.value);
        this.Vs.addEventListener("click", this);
    }
    unbinding() {
        this.Vs.removeEventListener("click", this);
    }
    valueChanged(t) {
        if (t == null) {
            this.Vs.removeAttribute("href");
        } else {
            if (this.gs.options.useUrlFragmentHash && this.Ce.routeConfigContext.isRoot && !/^[.#]/.test(t) && !this.Us) {
                t = `#${t}`;
            }
            this.Vs.setAttribute("href", t);
        }
    }
    handleEvent(t) {
        this.zs(t);
    }
    zs(t) {
        if (t.altKey || t.ctrlKey || t.shiftKey || t.metaKey || t.button !== 0 || this.Us || !this.js) {
            return;
        }
        const e = this.Vs.getAttribute("href");
        if (e !== null) {
            t.preventDefault();
            void this.gs.load(e, {
                context: this.Ce
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

const $ = E;

const k = [ $ ];

const I = ViewportCustomElement;

const _ = LoadCustomAttribute;

const T = HrefCustomAttribute;

const P = [ ViewportCustomElement, LoadCustomAttribute, HrefCustomAttribute ];

function configure(s, i) {
    let n = null;
    if (t.isObjectOrFunction(i)) {
        n = i.basePath ?? null;
    } else {
        i = {};
    }
    const r = RouterOptions.create(i);
    return s.register(t.Registration.cachedCallback(c, (t, s, i) => {
        const r = t.get(e.IWindow);
        const o = new URL(r.document.baseURI);
        o.pathname = normalizePath(n ?? o.pathname);
        return o;
    }), t.Registration.instance(R, r), t.Registration.instance(RouterOptions, r), e.AppTask.creating(E, t => {}), e.AppTask.hydrated(t.IContainer, RouteContext.setRoot), e.AppTask.activated(E, t => t.start(true)), e.AppTask.deactivated(E, t => t.stop()), ...k, ...P);
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
        this.Vs = t;
        this.Ds = t.scrollTop;
        this.qs = t.scrollLeft;
    }
    static Hs(t) {
        return t.scrollTop > 0 || t.scrollLeft > 0;
    }
    Gs() {
        this.Vs.scrollTo(this.qs, this.Ds);
        this.Vs = null;
    }
}

function restoreState(t) {
    t.Gs();
}

class HostElementState {
    constructor(t) {
        this.Fs = [];
        this.Ws(t.children);
    }
    Ws(t) {
        let e;
        for (let s = 0, i = t.length; s < i; ++s) {
            e = t[s];
            if (ScrollState.Hs(e)) {
                this.Fs.push(new ScrollState(e));
            }
            this.Ws(e.children);
        }
    }
    Gs() {
        this.Fs.forEach(restoreState);
        this.Fs = null;
    }
}

const V = /*@__PURE__*/ t.DI.createInterface("IStateManager", t => t.singleton(ScrollStateManager));

class ScrollStateManager {
    constructor() {
        this.Qs = new WeakMap;
    }
    saveState(t) {
        this.Qs.set(t.host, new HostElementState(t.host));
    }
    restoreState(t) {
        const e = this.Qs.get(t.host);
        if (e !== void 0) {
            e.Gs();
            this.Qs.delete(t.host);
        }
    }
}

const O = /*@__PURE__*/ t.DI.createInterface("ICurrentRoute", t => t.singleton(CurrentRoute));

class CurrentRoute {
    constructor() {
        this.path = "";
        this.url = "";
        this.title = "";
        this.query = new URLSearchParams;
        this.parameterInformation = t.emptyArray;
        const e = t.resolve(E);
        const s = e.options;
        t.resolve(u).subscribe("au:router:navigation-end", t => {
            const i = t.finalInstructions;
            n.batch(() => {
                this.path = i.toPath();
                this.url = i.toUrl(true, s.De, true);
                this.title = e.Fe();
                this.query = i.queryParams;
                this.parameterInformation = i.children.map(t => ParameterInformation.create(t));
            });
        });
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
        return new ParameterInformation(e?.endpoint.route.handler ?? null, t.viewport, i, t.children.map(t => this.create(t)));
    }
}

exports.AST = d;

exports.AuNavId = a;

exports.ComponentExpression = ComponentExpression;

exports.CompositeSegmentExpression = CompositeSegmentExpression;

exports.DefaultComponents = k;

exports.DefaultResources = P;

exports.HrefCustomAttribute = HrefCustomAttribute;

exports.HrefCustomAttributeRegistration = T;

exports.ICurrentRoute = O;

exports.ILocationManager = h;

exports.IRouteContext = C;

exports.IRouter = E;

exports.IRouterEvents = u;

exports.IRouterOptions = R;

exports.IStateManager = V;

exports.LoadCustomAttribute = LoadCustomAttribute;

exports.LoadCustomAttributeRegistration = _;

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

exports.RouterRegistration = $;

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
