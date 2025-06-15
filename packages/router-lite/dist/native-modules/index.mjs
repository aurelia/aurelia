import { isArray as t, DI as e, resolve as s, IEventAggregator as n, ILogger as i, emptyArray as r, onResolve as o, getResourceKeyFor as a, onResolveAll as c, emptyObject as u, isObjectOrFunction as h, IContainer as l, Registration as f, isArrayIndex as p, InstanceProvider as g, IModuleLoader as d, noop as w } from "../../../kernel/dist/native-modules/index.mjs";

import { BindingMode as m, isCustomElementViewModel as v, IHistory as E, ILocation as y, IWindow as R, CustomElement as S, CustomElementDefinition as C, Controller as b, IPlatform as N, MountTarget as x, IController as k, IAppRoot as $, isCustomElementController as I, registerHostNode as T, CustomAttribute as _, INode as P, refs as A, AppTask as V } from "../../../runtime-html/dist/native-modules/index.mjs";

import { RESIDUE as O, RecognizedRoute as M, Endpoint as j, ConfigurableRoute as L, RouteRecognizer as U } from "../../../route-recognizer/dist/native-modules/index.mjs";

import { Metadata as B } from "../../../metadata/dist/native-modules/index.mjs";

import { IObserverLocator as z, batch as D } from "../../../runtime/dist/native-modules/index.mjs";

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
        if (t(n)) {
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
            e[n] = [ ...t(s) ? s : [ s ], ...t(i) ? i : [ i ] ];
        }
    }
    return e;
}

const H = m.toView;

const q = m.fromView;

function isNotNullishOrTypeOrViewModel(t) {
    return typeof t === "object" && t !== null && !v(t);
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

function validateComponent(t, e, s) {
    switch (typeof t) {
      case "function":
        break;

      case "object":
        if (t instanceof Promise || t instanceof NavigationStrategy) {
            break;
        }
        if (isPartialRedirectRouteConfig(t)) {
            validateRedirectRouteConfig(t, e);
            break;
        }
        if (isPartialChildRouteConfig(t)) {
            validateRouteConfig(t, e);
            break;
        }
        if (!v(t) && !isPartialCustomElementDefinition(t)) {
            expectType(`an object with at least a '${s}' property (see Routeable)`, e, t);
        }
        break;

      case "string":
        break;

      default:
        expectType("function, object or string (see Routeable)", e, t);
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

const G = "au-nav-id";

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

const F = /*@__PURE__*/ e.createInterface("IRouterEvents", (t => t.singleton(RouterEvents)));

class RouterEvents {
    constructor() {
        this.M = 0;
        this.O = [];
        this.j = s(n);
        this.L = s(i).scopeTo("RouterEvents");
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

const W = /*@__PURE__*/ e.createInterface("IBaseHref");

const Q = /*@__PURE__*/ e.createInterface("ILocationManager", (t => t.singleton(BrowserLocationManager)));

class BrowserLocationManager {
    constructor() {
        this.U = 0;
        this.L = s(i).root.scopeTo("LocationManager");
        this._ = s(F);
        this.B = s(E);
        this.l = s(y);
        this.H = s(R);
        this.q = s(W);
        this.G = s(ot).useUrlFragmentHash ? "hashchange" : "popstate";
    }
    startListening() {
        this.H.addEventListener(this.G, this, false);
    }
    stopListening() {
        this.H.removeEventListener(this.G, this, false);
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

const J = r;

class RouteConfig {
    get path() {
        const t = this.F;
        if (t.length > 0) return t;
        const e = S.getDefinition(this.W);
        return this.F = [ e.name, ...e.aliases ];
    }
    get component() {
        return this.J();
    }
    constructor(t, e, s, n, i, r, o, a, c, u, h, l) {
        this.id = t;
        this.F = e;
        this.title = s;
        this.redirectTo = n;
        this.caseSensitive = i;
        this.transitionPlan = r;
        this.viewport = o;
        this.data = a;
        this.routes = c;
        this.fallback = u;
        this.nav = l;
        this.Y = false;
        this.K = null;
        this.W = h;
        this.X = h instanceof NavigationStrategy;
    }
    static Z(t, e) {
        if (typeof t === "string" || t instanceof Array) {
            const s = ensureArrayOfStrings(t);
            const n = e?.redirectTo ?? null;
            const i = e?.caseSensitive ?? false;
            const r = ensureString(e?.id ?? (s instanceof Array ? s[0] : s));
            const o = e?.title ?? null;
            const a = e?.transitionPlan ?? null;
            const c = e?.viewport ?? at;
            const u = e?.data ?? {};
            const h = e?.routes ?? J;
            return new RouteConfig(r, s, o, n, i, a, c, u, h, e?.fallback ?? null, e, e?.nav ?? true);
        } else if (typeof t === "object") {
            const s = t;
            validateRouteConfig(s, "");
            const n = ensureArrayOfStrings(s.path ?? e?.path ?? r);
            const i = s.title ?? e?.title ?? null;
            const o = s.redirectTo ?? e?.redirectTo ?? null;
            const a = s.caseSensitive ?? e?.caseSensitive ?? false;
            const c = s.id ?? e?.id ?? (n instanceof Array ? n[0] : n);
            const u = s.transitionPlan ?? e?.transitionPlan ?? null;
            const h = s.viewport ?? e?.viewport ?? at;
            const l = {
                ...e?.data,
                ...s.data
            };
            const f = [ ...s.routes ?? J, ...e?.routes ?? J ];
            return new RouteConfig(c, n, i, o, a, u, h, l, f, s.fallback ?? e?.fallback ?? null, s.component ?? e ?? null, s.nav ?? true);
        } else {
            expectType("string, function/class or object", "", t);
        }
    }
    tt(t, e) {
        validateRouteConfig(t, this.path[0] ?? "");
        const s = ensureArrayOfStrings(t.path ?? this.path);
        return new RouteConfig(ensureString(t.id ?? this.id ?? s), s, t.title ?? this.title, t.redirectTo ?? this.redirectTo, t.caseSensitive ?? this.caseSensitive, t.transitionPlan ?? this.transitionPlan ?? e?.transitionPlan ?? null, t.viewport ?? this.viewport, t.data ?? this.data, t.routes ?? this.routes, t.fallback ?? this.fallback ?? e?.fallback ?? null, this.W, t.nav ?? this.nav);
    }
    et(t, e, s) {
        if (hasSamePath(t, e) && shallowEquals(t.params, e.params)) return "none";
        if (s != null) return s;
        const n = this.transitionPlan ?? "replace";
        return typeof n === "function" ? n(t, e) : n;
        function cleanPath(t) {
            return t.replace(`/*${O}`, "");
        }
        function hasSamePath(t, e) {
            const s = t.finalPath;
            const n = e.finalPath;
            return s.length === 0 || n.length === 0 || cleanPath(s) === cleanPath(n);
        }
    }
    st(t, e, s) {
        if (this.Y) throw new Error(getMessage(3550));
        if (typeof t.getRouteConfig !== "function") return;
        return o(t.getRouteConfig(e, s), (t => {
            this.Y = true;
            if (t == null) return;
            let s = e?.path ?? "";
            if (typeof s !== "string") {
                s = s[0];
            }
            validateRouteConfig(t, s);
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
    it(t, e, s) {
        const n = this.fallback;
        return typeof n === "function" && !S.isType(n) ? n(t, e, s) : n;
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

const Y = {
    name: /*@__PURE__*/ a("route-configuration"),
    isConfigured(t) {
        return B.has(Y.name, t);
    },
    configure(t, e) {
        const s = RouteConfig.Z(t, e);
        B.define(s, e, Y.name);
        return e;
    },
    getConfig(t) {
        if (!Y.isConfigured(t)) {
            Y.configure({}, t);
        }
        return B.get(Y.name, t);
    }
};

function route(t) {
    return function(e, s) {
        s.addInitializer((function() {
            Y.configure(t, this);
        }));
        return e;
    };
}

function resolveRouteConfiguration(t, e, s, n, i) {
    if (isPartialRedirectRouteConfig(t)) return RouteConfig.Z(t, null);
    const [r, a] = resolveCustomElementDefinition(t, i);
    if (r.type === 5) return RouteConfig.Z({
        ...t,
        nav: false
    }, null);
    return o(a, (i => {
        const a = i.Type;
        const c = Y.getConfig(a);
        if (isPartialChildRouteConfig(t)) return c.tt(t, s);
        if (e) return c.nt();
        if (!c.Y && r.type === 4 && typeof t.getRouteConfig === "function") {
            return o(c.st(t, s, n), (() => c));
        }
        return c;
    }));
}

function resolveCustomElementDefinition(t, e) {
    const s = createNavigationInstruction(t);
    let n;
    switch (s.type) {
      case 5:
        return [ s, null ];

      case 0:
        {
            if (e == null) throw new Error(getMessage(3551));
            const t = e.component.dependencies;
            let i = t.find((t => isPartialCustomElementDefinition(t) && t.name === s.value)) ?? S.find(e.container, s.value);
            if (i === null) throw new Error(getMessage(3552, s.value, e));
            if (!(i instanceof C)) {
                i = C.create(i);
                S.define(i);
            }
            n = i;
            break;
        }

      case 2:
        n = s.value;
        break;

      case 4:
        n = S.getDefinition(s.value.constructor);
        break;

      case 3:
        if (e == null) throw new Error(getMessage(3553));
        n = e.ct(s.value);
        break;
    }
    return [ s, n ];
}

function createNavigationInstruction(t) {
    return isPartialChildRouteConfig(t) ? createNavigationInstruction(t.component) : TypedNavigationInstruction.create(t);
}

const K = [ "?", "#", "/", "+", "(", ")", "@", "!", "=", ",", "&", "'", "~", ";" ];

class ParserState {
    get u() {
        return this.ut.length === 0;
    }
    constructor(t) {
        this.ht = t;
        this.lt = [];
        this.ft = 0;
        this.gt = 0;
        this.ut = t;
    }
    dt(...t) {
        const e = this.ut;
        return t.some((function(t) {
            return e.startsWith(t);
        }));
    }
    wt(t) {
        if (this.dt(t)) {
            this.ut = this.ut.slice(t.length);
            this.gt += t.length;
            this.vt(t);
            return true;
        }
        return false;
    }
    Et(t) {
        if (!this.wt(t)) {
            this.yt(`'${t}'`);
        }
    }
    yt(t) {
        throw new Error(getMessage(3500, t, this.gt, this.ht, this.ut, this.ut));
    }
    Rt() {
        if (!this.u) {
            throw new Error(getMessage(3501, this.ut, this.gt, this.ht));
        }
    }
    St() {
        const t = this.ut[0];
        this.ut = this.ut.slice(1);
        ++this.gt;
        this.vt(t);
    }
    Ct() {
        this.lt[this.ft++] = "";
    }
    bt() {
        const t = --this.ft;
        const e = this.lt;
        const s = e[t];
        e[t] = "";
        return s;
    }
    Nt() {
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

const X = new Map;

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
        let s = X.get(e);
        if (s === void 0) {
            X.set(e, s = RouteExpression.xt(t));
        }
        return s;
    }
    static xt(t) {
        const e = t.path;
        if (e === "") {
            return new RouteExpression(false, SegmentExpression.Empty, t.query, t.fragment);
        }
        const s = new ParserState(e);
        s.Ct();
        const n = s.wt("/");
        const i = CompositeSegmentExpression.kt(s);
        s.Rt();
        s.Nt();
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
        t.Ct();
        const e = t.wt("+");
        const s = [];
        do {
            s.push(ScopedSegmentExpression.kt(t));
        } while (t.wt("+"));
        if (!e && s.length === 1) {
            t.Nt();
            return s[0];
        }
        t.Nt();
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
        t.Ct();
        const e = SegmentGroupExpression.kt(t);
        if (t.wt("/")) {
            const s = ScopedSegmentExpression.kt(t);
            t.Nt();
            return new ScopedSegmentExpression(e, s);
        }
        t.Nt();
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
        t.Ct();
        if (t.wt("(")) {
            const e = CompositeSegmentExpression.kt(t);
            t.Et(")");
            t.Nt();
            return new SegmentGroupExpression(e);
        }
        t.Nt();
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
        t.Ct();
        const e = ComponentExpression.kt(t);
        const s = ViewportExpression.kt(t);
        const n = !t.wt("!");
        t.Nt();
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
        t.Ct();
        t.Ct();
        if (!t.u) {
            if (t.dt("./")) {
                t.St();
            } else if (t.dt("../")) {
                t.St();
                t.St();
            } else {
                while (!t.u && !t.dt(...K)) {
                    t.St();
                }
            }
        }
        const e = t.bt();
        if (e.length === 0) {
            t.yt("component name");
        }
        const s = ParameterListExpression.kt(t);
        t.Nt();
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
        t.Ct();
        let e = null;
        if (t.wt("@")) {
            t.Ct();
            while (!t.u && !t.dt(...K)) {
                t.St();
            }
            e = decodeURIComponent(t.bt());
            if (e.length === 0) {
                t.yt("viewport name");
            }
        }
        t.Nt();
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
        t.Ct();
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
        t.Nt();
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
        t.Ct();
        t.Ct();
        while (!t.u && !t.dt(...K)) {
            t.St();
        }
        let s = t.bt();
        if (s.length === 0) {
            t.yt("parameter key");
        }
        let n;
        if (t.wt("=")) {
            t.Ct();
            while (!t.u && !t.dt(...K)) {
                t.St();
            }
            n = decodeURIComponent(t.bt());
            if (n.length === 0) {
                t.yt("parameter value");
            }
        } else {
            n = s;
            s = e.toString();
        }
        t.Nt();
        return new ParameterExpression(s, n);
    }
}

const Z = Object.freeze({
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

const tt = new WeakMap;

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
    constructor(t, e, s) {
        this.viewport = t;
        this.hostController = e;
        this.Pt = false;
        this.At = null;
        this.Vt = null;
        this._state = 8256;
        this.Ot = "replace";
        this.Mt = null;
        this.jt = null;
        this.Lt = null;
        this.Ut = null;
        this.L = s.container.get(i).scopeTo(`ViewportAgent<${s.routeConfigContext.Bt}>`);
    }
    static for(t, e) {
        let s = tt.get(t);
        if (s === void 0) {
            const n = b.getCachedOrThrow(t);
            tt.set(t, s = new ViewportAgent(t, n, e));
        }
        return s;
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
                this.Ht("activateFromViewport 1");
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
            this.Ht("activateFromViewport 2");
        }
    }
    qt(t, e) {
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
        if (s !== at && n !== s) {
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
    Qt(t, e) {
        if (this.Lt === null) {
            this.Lt = t;
        }
        ensureTransitionHasNotErrored(t);
        if (t.guardsResult !== true) {
            return;
        }
        e.N();
        void o(this.Ut, (() => {
            Batch.C((e => {
                for (const s of this.Mt.children) {
                    s.context.vpa.Qt(t, e);
                }
            })).T((e => {
                switch (this.Tt) {
                  case 4096:
                    switch (this.Ot) {
                      case "none":
                        this.Tt = 1024;
                        return;

                      case "invoke-lifecycles":
                      case "replace":
                        this.Tt = 2048;
                        e.N();
                        Batch.C((e => {
                            this.At.Qt(t, this.jt, e);
                        })).T((() => {
                            this.Tt = 1024;
                            e.$();
                        })).C();
                        return;
                    }

                  case 8192:
                    return;

                  default:
                    t.Jt(new Error(`Unexpected state at canUnload of ${this}`));
                }
            })).T((() => {
                e.$();
            })).C();
        }));
    }
    Yt(t, e) {
        if (this.Lt === null) {
            this.Lt = t;
        }
        ensureTransitionHasNotErrored(t);
        if (t.guardsResult !== true) {
            return;
        }
        e.N();
        Batch.C((e => {
            switch (this._t) {
              case 32:
                this._t = 16;
                switch (this.Ot) {
                  case "none":
                    return;

                  case "invoke-lifecycles":
                    return this.At.Yt(t, this.jt, e);

                  case "replace":
                    e.N();
                    void o(this.jt.context.Kt(this.hostController, this.jt), (s => {
                        (this.Vt = s).Yt(t, this.jt, e);
                        e.$();
                    }));
                }

              case 64:
                return;

              default:
                this.Ht("canLoad");
            }
        })).T((e => {
            if (t.guardsResult !== true) {
                return;
            }
            const s = this.jt;
            switch (this.Ot) {
              case "none":
              case "invoke-lifecycles":
                {
                    e.N();
                    const t = s.context;
                    void o(t.routeConfigContext.allResolved, (() => o(o(c(...s.residue.splice(0).map((t => createAndAppendNodes(this.L, s, t)))), (() => c(...t.getAvailableViewportAgents().reduce(((t, e) => {
                        const n = e.viewport;
                        const i = n.default;
                        if (i === null) return t;
                        t.push(createAndAppendNodes(this.L, s, ViewportInstruction.create({
                            component: i,
                            viewport: n.name
                        })));
                        return t;
                    }), [])))), (() => {
                        e.$();
                    }))));
                    return;
                }

              case "replace":
                return;
            }
        })).T((e => {
            switch (this._t) {
              case 16:
                this._t = 8;
                for (const s of this.jt.children) {
                    s.context.vpa.Yt(t, e);
                }
                return;

              case 64:
                return;

              default:
                this.Ht("canLoad");
            }
        })).T((() => {
            e.$();
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
                this.Ht("unloading");
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
                this.Ht("loading");
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
                this.Ht("loading");
            }
        })).T((() => {
            e.$();
        })).C();
    }
    Gt(t, e, s) {
        ensureTransitionHasNotErrored(e);
        ensureGuardsResultIsTrue(this, e);
        s.N();
        switch (this.Tt) {
          case 256:
            this.Tt = 128;
            switch (this.Ot) {
              case "none":
              case "invoke-lifecycles":
                s.$();
                return;

              case "replace":
                {
                    const n = this.hostController;
                    const i = this.At;
                    e.te((() => o(i.Gt(t, n), (() => {
                        if (t === null) {
                            i.ee();
                        }
                    }))), (() => {
                        s.$();
                    }));
                }
            }
            return;

          case 8192:
            s.$();
            return;

          case 128:
            s.$();
            return;

          default:
            this.Ht("deactivate");
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
            this.Ht("activate");
        }
    }
    ne(t, e) {
        if (this.Tt === 8192) {
            this.Dt(null, t, e);
            return;
        }
        if (this._t === 64) {
            this.Gt(null, t, e);
            return;
        }
        ensureTransitionHasNotErrored(t);
        ensureGuardsResultIsTrue(this, t);
        if (!(this.Tt === 256 && this._t === 2)) {
            this.Ht("swap");
        }
        this.Tt = 128;
        this._t = 1;
        switch (this.Ot) {
          case "none":
          case "invoke-lifecycles":
            {
                const s = mergeDistinct(this.jt.children, this.Mt.children);
                for (const n of s) {
                    n.context.vpa.ne(t, e);
                }
                return;
            }

          case "replace":
            {
                const s = this.hostController;
                const n = this.At;
                const i = this.Vt;
                e.N();
                Batch.C((e => {
                    t.te((() => {
                        e.N();
                        return o(n.Gt(null, s), (() => n.ee()));
                    }), (() => {
                        e.$();
                    }));
                })).T((e => {
                    t.te((() => {
                        e.N();
                        return i.Dt(null, s);
                    }), (() => {
                        e.$();
                    }));
                })).T((e => {
                    this.se(t, e);
                })).T((() => {
                    e.$();
                })).C();
                return;
            }
        }
    }
    se(t, e) {
        const s = this.jt;
        t.te((() => {
            e.N();
            const t = s.context;
            return o(t.routeConfigContext.allResolved, (() => {
                const e = s.children.slice();
                return o(c(...s.residue.splice(0).map((t => createAndAppendNodes(this.L, s, t)))), (() => o(c(...t.getAvailableViewportAgents().reduce(((t, e) => {
                    const n = e.viewport;
                    const i = n.default;
                    if (i === null) return t;
                    t.push(createAndAppendNodes(this.L, s, ViewportInstruction.create({
                        component: i,
                        viewport: n.name
                    })));
                    return t;
                }), [])), (() => s.children.filter((t => !e.includes(t)))))));
            }));
        }), (s => {
            Batch.C((e => {
                for (const n of s) {
                    t.te((() => {
                        e.N();
                        return n.context.vpa.Yt(t, e);
                    }), (() => {
                        e.$();
                    }));
                }
            })).T((e => {
                if (t.guardsResult !== true) return;
                for (const n of s) {
                    t.te((() => {
                        e.N();
                        return n.context.vpa.Zt(t, e);
                    }), (() => {
                        e.$();
                    }));
                }
            })).T((e => {
                if (t.guardsResult !== true) return;
                for (const n of s) {
                    t.te((() => {
                        e.N();
                        return n.context.vpa.Dt(null, t, e);
                    }), (() => {
                        e.$();
                    }));
                }
            })).T((() => {
                e.$();
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
            this.Ht("scheduleUpdate 1");
        }
        switch (this.Tt) {
          case 8192:
          case 4096:
          case 1024:
            break;

          default:
            this.Ht("scheduleUpdate 2");
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
        let t = null;
        let e = null;
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
            t = o(this.At?.Gt(null, this.hostController), (() => {
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
                e = o(this.Vt?.Gt(null, this.hostController), (() => {
                    this.Vt?.ee();
                    this.Ot = "replace";
                    this._t = 64;
                    this.Vt = null;
                    this.jt = null;
                }));
                break;
            }
        }
        if (t !== null && e !== null) {
            this.Ut = o(c(t, e), (() => {
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
                    this.Ht("endTransition 1");
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
                    this.Ht("endTransition 2");
                }
                break;

              default:
                this.Ht("endTransition 3");
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

const et = new Map;

function $state(t) {
    let e = et.get(t);
    if (e === void 0) {
        et.set(t, e = stringifyState(t));
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
        return this.ce.root;
    }
    get isInstructionsFinalized() {
        return this.ue;
    }
    constructor(t, e, s, n, i, r, o, a, c, u, h, l, f) {
        this.path = t;
        this.finalPath = e;
        this.context = s;
        this.he = n;
        this.instruction = i;
        this.params = r;
        this.queryParams = o;
        this.fragment = a;
        this.data = c;
        this.le = u;
        this.title = h;
        this.component = l;
        this.residue = f;
        this.fe = 1;
        this.ue = false;
        this.children = [];
        this.he ??= i;
    }
    static create(t) {
        const {[O]: e, ...s} = t.params ?? {};
        return new RouteNode(t.path, t.finalPath, t.context, t.originalInstruction ?? t.instruction, t.instruction, Object.freeze(s), t.queryParams ?? st, t.fragment ?? null, Object.freeze(t.data ?? u), t.le ?? null, t.title ?? null, t.component, t.residue ?? []);
    }
    contains(t, e = false) {
        if (this.context.routeConfigContext === t.options.context.routeConfigContext) {
            const s = this.children;
            const n = t.children;
            for (let t = 0, i = s.length; t < i; ++t) {
                for (let r = 0, o = n.length; r < o; ++r) {
                    const a = n[r];
                    const c = e ? a.recognizedRoute?.route.endpoint : null;
                    const u = s[t + r] ?? null;
                    const h = u !== null ? u.isInstructionsFinalized ? u.instruction : u.he : null;
                    const l = h?.recognizedRoute?.route.endpoint;
                    if (t + r < i && ((c?.equalsOrResidual(l) ?? false) || (h?.contains(a) ?? false))) {
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
        t.ge(this.ce);
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
        this.ce = t;
        for (const e of this.children) {
            e.ge(t);
        }
    }
    we() {
        this.ue = true;
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

function createAndAppendNodes(t, e, s) {
    t.trace(`createAndAppendNodes(node:%s,vi:%s`, e, s);
    switch (s.component.type) {
      case 0:
        switch (s.component.value) {
          case "..":
            e = e.context.parent?.node ?? e;
            e.de();

          case ".":
            return c(...s.children.map((s => createAndAppendNodes(t, e, s))));

          default:
            {
                t.trace(`createAndAppendNodes invoking createNode`);
                const n = e.context;
                const i = s.nt();
                let r = s.recognizedRoute;
                if (r !== null) return appendNode(t, e, createConfiguredNode(t, e, s, r, i));
                if (s.children.length === 0) {
                    const i = n.routeConfigContext.Ee(s);
                    if (i !== null) {
                        e.ce.ve(i.query);
                        const n = i.vi;
                        n.children.push(...s.children);
                        return appendNode(t, e, createConfiguredNode(t, e, n, n.recognizedRoute, s));
                    }
                }
                let a = 0;
                let c = s.component.value;
                let h = s;
                while (h.children.length === 1) {
                    h = h.children[0];
                    if (h.component.type === 0) {
                        ++a;
                        c = `${c}/${h.component.value}`;
                    } else {
                        break;
                    }
                }
                r = n.routeConfigContext.recognize(c);
                t.trace("createNode recognized route: %s", r);
                const l = r?.residue ?? null;
                t.trace("createNode residue:", l);
                const f = l === null;
                if (r === null || l === c) {
                    const i = n.routeConfigContext.Ee({
                        component: s.component.value,
                        params: s.params ?? u,
                        open: s.open,
                        close: s.close,
                        viewport: s.viewport,
                        children: s.children
                    });
                    if (i !== null) {
                        e.ce.ve(i.query);
                        return appendNode(t, e, createConfiguredNode(t, e, i.vi, i.vi.recognizedRoute, s));
                    }
                    const r = s.component.value;
                    if (r === "") return;
                    let a = s.viewport;
                    if (a === null || a.length === 0) a = at;
                    const c = n.getFallbackViewportAgent(a);
                    const h = c !== null ? c.viewport.it(s, e, n) : n.routeConfigContext.config.it(s, e, n);
                    if (h === null) throw new UnknownRouteError(getMessage(3401, r, n.routeConfigContext.Bt, a, r, n.routeConfigContext.component.name));
                    if (typeof h === "string") {
                        t.trace(`Fallback is set to '${h}'. Looking for a recognized route.`);
                        const i = n.routeConfigContext.childRoutes.find((t => t.id === h));
                        if (i !== void 0) return appendNode(t, e, createFallbackNode(t, i, e, s));
                        t.trace(`No route configuration for the fallback '${h}' is found; trying to recognize the route.`);
                        const r = n.routeConfigContext.recognize(h, true);
                        if (r !== null && r.residue !== h) return appendNode(t, e, createConfiguredNode(t, e, s, r, null));
                    }
                    t.trace(`The fallback '${h}' is not recognized as a route; treating as custom element name.`);
                    return o(resolveRouteConfiguration(h, false, n.routeConfigContext.config, null, n.routeConfigContext), (n => appendNode(t, e, createFallbackNode(t, n, e, s))));
                }
                r.residue = null;
                s.component.value = f ? c : c.slice(0, -(l.length + 1));
                let p = !f;
                for (let t = 0; t < a; ++t) {
                    const t = s.children[0];
                    if (l?.startsWith(t.component.value) ?? false) {
                        p = false;
                        break;
                    }
                    s.viewport = t.viewport;
                    s.children = t.children;
                }
                if (p) {
                    s.children.unshift(ViewportInstruction.create(l));
                }
                s.recognizedRoute = r;
                t.trace("createNode after adjustment vi:%s", s);
                return appendNode(t, e, createConfiguredNode(t, e, s, r, i));
            }
        }

      case 3:
      case 4:
      case 2:
        {
            const n = e.context;
            return o(resolveCustomElementDefinition(s.component.value, n.routeConfigContext)[1], (i => {
                const {vi: r, query: o} = n.routeConfigContext.Ee({
                    component: i,
                    params: s.params ?? u,
                    open: s.open,
                    close: s.close,
                    viewport: s.viewport,
                    children: s.children
                });
                e.ce.ve(o);
                return appendNode(t, e, createConfiguredNode(t, e, r, r.recognizedRoute, s));
            }));
        }
    }
}

function createConfiguredNode(t, e, s, n, i, r = n.route.endpoint.route) {
    const a = e.context;
    const c = e.ce;
    return o(r.handler, (u => {
        r.handler = u;
        t.trace(`creatingConfiguredNode(rdc:%s, vi:%s)`, u, s);
        if (u.redirectTo === null) {
            const h = (s.viewport?.length ?? 0) > 0;
            const l = h ? s.viewport : u.viewport;
            return o(resolveCustomElementDefinition(u.J(s, a, e, n.route), a.routeConfigContext)[1], (f => {
                const p = a.ye(new ViewportRequest(l, f.name));
                if (!h) {
                    s.viewport = p.viewport.name;
                }
                const g = a.container.get(nt);
                return o(g.getRouteContext(p, f, null, p.hostController.container, a.routeConfigContext.config, a, u), (o => {
                    t.trace("createConfiguredNode setting the context node");
                    const a = o.node = RouteNode.create({
                        path: n.route.endpoint.route.path,
                        finalPath: r.path,
                        context: o,
                        instruction: s,
                        originalInstruction: i,
                        params: n.route.params,
                        queryParams: c.queryParams,
                        fragment: c.fragment,
                        data: u.data,
                        le: l,
                        component: f,
                        title: u.title,
                        residue: s.children.slice()
                    });
                    a.ge(e.ce);
                    t.trace(`createConfiguredNode(vi:%s) -> %s`, s, a);
                    return a;
                }));
            }));
        }
        const h = RouteExpression.parse(it.parse(r.path));
        const l = RouteExpression.parse(it.parse(u.redirectTo));
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
        const E = g.filter(Boolean).join("/");
        const y = a.routeConfigContext.recognize(E);
        if (y === null) throw new UnknownRouteError(getMessage(3402, E, a.routeConfigContext.Bt, E, a.routeConfigContext.component.name));
        return createConfiguredNode(t, e, ViewportInstruction.create({
            recognizedRoute: y,
            component: E,
            children: s.children,
            viewport: s.viewport,
            open: s.open,
            close: s.close
        }), y, i);
    }));
}

function appendNode(t, e, s) {
    return o(s, (s => {
        t.trace(`appendNode($childNode:%s)`, s);
        e.pe(s);
        return s.context.vpa.ie(e.ce.options, s);
    }));
}

function createFallbackNode(t, e, s, n) {
    const i = new $RecognizedRoute(new M(new j(new L(e.path[0], e.caseSensitive, e), []), u), null);
    n.children.length = 0;
    return createConfiguredNode(t, s, n, i, null);
}

const st = Object.freeze(new URLSearchParams);

function isManagedState(t) {
    return h(t) && Object.prototype.hasOwnProperty.call(t, G) === true;
}

function toManagedState(t, e) {
    return {
        ...t,
        [G]: e
    };
}

class UnknownRouteError extends Error {}

class Transition {
    get erredWithUnknownRoute() {
        return this.Re;
    }
    constructor(t, e, s, n, i, r, o, a, c, u, h, l, f, p, g) {
        this.id = t;
        this.prevInstructions = e;
        this.instructions = s;
        this.finalInstructions = n;
        this.instructionsChanged = i;
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
        this.Re = false;
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
        this.Re = t instanceof UnknownRouteError;
        this.reject(this.error = t);
    }
    toString() {
        return `T(id:${this.id},trigger:'${this.trigger}',instructions:${this.instructions})`;
    }
}

const nt = /*@__PURE__*/ e.createInterface("IRouter", (t => t.singleton(Router)));

class Router {
    get Se() {
        const t = this.Ce;
        if (t !== null) return t;
        if (!this.c.has(ct, true)) throw new Error(getMessage(3271));
        return this.Ce = this.c.get(ct);
    }
    get routeTree() {
        let t = this.be;
        if (t === null) {
            const e = this.Se;
            t = this.be = new RouteTree(NavigationOptions.create(this.options, {}), st, null, RouteNode.create({
                path: "",
                finalPath: "",
                context: e,
                instruction: null,
                component: S.getDefinition(e.routeConfigContext.config.component),
                title: e.routeConfigContext.config.title
            }));
        }
        return t;
    }
    get currentTr() {
        return this.Ne ??= Transition.Z({
            id: 0,
            prevInstructions: this.xe,
            instructions: this.xe,
            finalInstructions: this.xe,
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
        this.Ne = t;
    }
    get isNavigating() {
        return this.ke;
    }
    constructor() {
        this.Ce = null;
        this.be = null;
        this.Ne = null;
        this.$e = false;
        this.Ie = 0;
        this.Te = null;
        this._e = null;
        this.Pe = false;
        this.ke = false;
        this.c = s(l);
        this.Ae = s(N);
        this.L = s(i).root.scopeTo("Router");
        this._ = s(F);
        this.Ve = s(Q);
        this.options = s(ot);
        this.Oe = new WeakMap;
        this.Me = new Map;
        this.xe = ViewportInstructionTree.create("", this.options, null, null);
        this.c.registerResolver(Router, f.instance(Router, this));
    }
    je(t) {
        return RouteContext.resolve(this.Se, t);
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
                const i = ViewportInstructionTree.create(t.url, s, n, this.Se);
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
    load(t, e) {
        return o(this.createViewportInstructions(t, e ?? null), (t => this.Le(t, "api", null, null)));
    }
    isActive(t, e) {
        const s = this.je(e);
        const n = t instanceof ViewportInstructionTree ? t : this.createViewportInstructions(t, {
            context: s,
            historyStrategy: this.options.historyStrategy
        });
        return this.routeTree.contains(n, false);
    }
    getRouteContext(t, e, s, n, i, r, a) {
        return o(this.getRouteConfigContext(a, e, s, n, i, r?.routeConfigContext ?? null), (e => {
            let s = this.Me.get(t);
            if (s === void 0) {
                this.Me.set(t, s = new WeakMap);
            }
            let i = s.get(e);
            if (i !== void 0) {
                return i;
            }
            const r = n.has(ct, true) ? n.get(ct) : null;
            s.set(e, i = new RouteContext(t, r, n, this, e, this.Ve));
            return i;
        }));
    }
    getRouteConfigContext(t, e, s, n, i, r) {
        return o(t instanceof RouteConfig && !t.X ? t : resolveRouteConfiguration(typeof s?.getRouteConfig === "function" ? s : e.Type, false, i, null, r), (t => {
            let s = this.Oe.get(t);
            if (s != null) return s;
            s = new RouteConfigContext(r, e, t, n, this);
            this.Oe.set(t, s);
            return s;
        }));
    }
    generatePath(t, e) {
        return o(this.createViewportInstructions(createEagerInstructions(t), {
            context: e ?? this.Se
        }, true), (t => t.toUrl(true, this.options.Ue)));
    }
    createViewportInstructions(t, e, s) {
        if (t instanceof ViewportInstructionTree) return t;
        let n = e?.context ?? null;
        if (n !== null) n = e.context = this.je(n);
        return (n ?? this.Ce).createViewportInstructions(t, e, s);
    }
    Le(t, e, s, n) {
        const i = this.currentTr;
        const r = this.L;
        if (e !== "api" && i.trigger === "api" && i.instructions.equals(t)) {
            return true;
        }
        let o = void 0;
        let a = void 0;
        let c;
        const u = this.options.restorePreviousRouteTreeOnError;
        if (n === null || n.erredWithUnknownRoute || n.error != null && u) {
            c = new Promise((function(t, e) {
                o = t;
                a = e;
            }));
        } else {
            c = n.promise;
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
            promise: c,
            resolve: o,
            reject: a,
            previousRouteTree: this.routeTree,
            routeTree: this.be = this.routeTree.nt(),
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
                if (u) {
                    this.Be(h);
                } else {
                    const t = this.Te;
                    if (t !== null) {
                        t.previousRouteTree = h.previousRouteTree;
                    } else {
                        this.be = h.previousRouteTree;
                    }
                }
            }
            throw t;
        }));
    }
    te(t) {
        this.currentTr = t;
        this.Te = null;
        this.ke = true;
        let e = this.je(t.options.context);
        this._.publish(new NavigationStartEvent(t.id, t.instructions, t.trigger, t.managedState));
        if (this.Te !== null) {
            return this.te(this.Te);
        }
        t.te((() => {
            const s = t.finalInstructions;
            const n = this.Se;
            const r = t.routeTree;
            r.options = s.options;
            r.queryParams = n.node.ce.queryParams = s.queryParams;
            r.fragment = n.node.ce.fragment = s.fragment;
            const a = /*@__PURE__*/ e.container.get(i).scopeTo("RouteTree");
            if (s.isAbsolute) {
                e = n;
            }
            if (e === n) {
                r.root.ge(r);
                n.node = r.root;
            }
            const c = e.routeConfigContext.allResolved instanceof Promise ? " - awaiting promise" : "";
            a.trace(`updateRouteTree(rootCtx:%s,rt:%s,vit:%s)${c}`, n, r, s);
            return o(e.routeConfigContext.allResolved, (() => updateNode(a, s, e, n.node)));
        }), (() => {
            const e = t.previousRouteTree.root.children;
            const s = t.routeTree.root.children;
            const n = mergeDistinct(e, s);
            Batch.C((s => {
                for (const n of e) {
                    n.context.vpa.Qt(t, s);
                }
            })).T((e => {
                if (t.guardsResult !== true) {
                    e.N();
                    this.Be(t);
                }
            })).T((e => {
                for (const n of s) {
                    n.context.vpa.Yt(t, e);
                }
            })).T((e => {
                if (t.guardsResult !== true) {
                    e.N();
                    this.Be(t);
                }
            })).T((s => {
                for (const n of e) {
                    n.context.vpa.Xt(t, s);
                }
            })).T((e => {
                for (const n of s) {
                    n.context.vpa.Zt(t, e);
                }
            })).T((e => {
                for (const s of n) {
                    s.context.vpa.ne(t, e);
                }
            })).T((e => {
                if (t.guardsResult !== true) {
                    e.N();
                    this.Be(t);
                }
            })).T((() => {
                n.forEach((function(t) {
                    t.context.vpa.ae();
                }));
                this.$e = true;
                this.xe = t.finalInstructions = t.routeTree.me();
                this.ke = false;
                const e = t.finalInstructions.toUrl(true, this.options.Ue);
                switch (t.options.ze(this.xe)) {
                  case "none":
                    break;

                  case "push":
                    this.Ve.pushState(toManagedState(t.options.state, t.id), this.updateTitle(t), e);
                    break;

                  case "replace":
                    this.Ve.replaceState(toManagedState(t.options.state, t.id), this.updateTitle(t), e);
                    break;
                }
                this._.publish(new NavigationEndEvent(t.id, t.instructions, this.xe));
                t.resolve(true);
                this.De();
            })).C();
        }));
    }
    updateTitle(t = this.currentTr) {
        const e = this.He(t);
        if (e.length > 0) {
            this.Ae.document.title = e;
        }
        return this.Ae.document.title;
    }
    He(t = this.currentTr) {
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
    Be(t) {
        const e = t.previousRouteTree.root.children;
        const s = t.routeTree.root.children;
        const n = mergeDistinct(e, s);
        n.forEach((function(t) {
            t.context.vpa.oe();
        }));
        this.xe = t.prevInstructions;
        this.be = t.previousRouteTree;
        this.ke = false;
        const i = t.guardsResult;
        this._.publish(new NavigationCancelEvent(t.id, t.instructions, `guardsResult is ${i}`));
        if (i === false) {
            t.resolve(false);
            this.De();
        } else {
            let e;
            if (this.$e && (t.erredWithUnknownRoute || t.error != null && this.options.restorePreviousRouteTreeOnError)) e = t.prevInstructions; else if (i === true) return; else e = i;
            void o(this.Le(e, "api", t.managedState, t), (() => {}));
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

function updateNode(t, e, s, n) {
    t.trace(`updateNode(ctx:%s,node:%s)`, s, n);
    n.queryParams = e.queryParams;
    n.fragment = e.fragment;
    if (!n.context.routeConfigContext.isRoot) {
        n.context.vpa.ie(n.ce.options, n);
    }
    if (n.context === s) {
        n.de();
        return o(c(...e.children.map((e => createAndAppendNodes(t, n, e)))), (() => c(...s.getAvailableViewportAgents().reduce(((e, s) => {
            const i = s.viewport;
            const r = i.default;
            if (r === null) return e;
            e.push(createAndAppendNodes(t, n, ViewportInstruction.create({
                component: r,
                viewport: i.name
            })));
            return e;
        }), []))));
    }
    return c(...n.children.map((n => updateNode(t, e, s, n))));
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
        return new ParsedUrl(t, n ?? st, e);
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
    e ??= st;
    let i = e.toString();
    i = i === "" ? "" : `?${i}`;
    const r = s != null && s.length > 0 ? `#${encodeURIComponent(s)}` : "";
    return `${n}${i}${r}`;
}

const it = Object.freeze({
    parse(t) {
        return ParsedUrl.Z(t);
    },
    stringify(t, e, s) {
        return stringify(t, e, s);
    }
});

const rt = Object.freeze({
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

const ot = /*@__PURE__*/ e.createInterface("RouterOptions");

class RouterOptions {
    constructor(t, e, s, n, i, r, o) {
        this.useUrlFragmentHash = t;
        this.useHref = e;
        this.historyStrategy = s;
        this.buildTitle = n;
        this.useNavigationModel = i;
        this.activeClass = r;
        this.restorePreviousRouteTreeOnError = o;
        this.Ue = t ? rt : it;
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

const at = "default";

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
        const n = e.length === 0 || s === null || s.length === 0 || s === at ? "" : `@${s}`;
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

function stringifyParams(t) {
    if (t === null) return "";
    const e = Object.keys(t);
    const s = e.length;
    if (s === 0) return "";
    const n = Array(s);
    const i = [];
    const r = [];
    for (const t of e) {
        if (p(t)) {
            i.push(Number(t));
        } else {
            r.push(t);
        }
    }
    for (let e = 0; e < s; ++e) {
        const s = i.indexOf(e);
        if (s > -1) {
            n[e] = t[e];
            i.splice(s, 1);
        } else {
            const s = r.shift();
            n[e] = `${s}=${t[s]}`;
        }
    }
    return `(${n.join(",")})`;
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
    static create(t, e, s, n, i) {
        s = s instanceof NavigationOptions ? s : NavigationOptions.create(e, s ?? u);
        let r = s.context;
        if (!(r instanceof RouteContext) && n != null) {
            r = s.context = RouteContext.resolve(n, r);
        }
        const a = r != null;
        if (t instanceof Array) {
            const e = t.length;
            const n = new Array(e);
            const h = new URLSearchParams(s.queryParams ?? u);
            const l = new Array(e);
            for (let s = 0; s < e; s++) {
                const e = t[s];
                l[s] = o(a ? r.routeConfigContext.Ee(e, i) : null, (t => {
                    if (t !== null) {
                        n[s] = t.vi;
                        mergeURLSearchParams(h, t.query, false);
                    } else {
                        n[s] = ViewportInstruction.create(e);
                    }
                }));
            }
            return o(c(...l), (() => new ViewportInstructionTree(s, false, n, h, s.fragment)));
        }
        if (typeof t === "string") {
            const n = RouteExpression.parse(e.Ue.parse(t));
            return n.toInstructionTree(s);
        }
        return o(a ? r.routeConfigContext.Ee(isPartialViewportInstruction(t) ? {
            ...t,
            params: t.params ?? u
        } : {
            component: t,
            params: u
        }, i) : null, (e => {
            const n = new URLSearchParams(s.queryParams ?? u);
            return e !== null ? new ViewportInstructionTree(s, false, [ e.vi ], mergeURLSearchParams(n, e.query, false), s.fragment) : new ViewportInstructionTree(s, false, [ ViewportInstruction.create(t) ], n, s.fragment);
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
    static create(t) {
        if (t instanceof TypedNavigationInstruction) {
            return t;
        }
        if (typeof t === "string") return new TypedNavigationInstruction(0, t);
        if (!h(t)) expectType("function/class or object", "", t);
        if (t instanceof NavigationStrategy) return new TypedNavigationInstruction(5, t);
        if (typeof t === "function") {
            if (S.isType(t)) {
                const e = S.getDefinition(t);
                return new TypedNavigationInstruction(2, e);
            } else {
                return TypedNavigationInstruction.create(t());
            }
        }
        if (t instanceof Promise) return new TypedNavigationInstruction(3, t);
        if (isPartialViewportInstruction(t)) {
            const e = ViewportInstruction.create(t);
            return new TypedNavigationInstruction(1, e);
        }
        if (v(t)) return new TypedNavigationInstruction(4, t);
        if (t instanceof C) return new TypedNavigationInstruction(2, t);
        if (isPartialCustomElementDefinition(t)) {
            const e = C.create(t);
            S.define(e);
            return new TypedNavigationInstruction(2, e);
        }
        throw new Error(getMessage(3400, tryStringify(t)));
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
            return `VM(name:'${S.getDefinition(this.value.constructor).name}')`;

          case 1:
            return this.value.toString();

          case 0:
            return `'${this.value}'`;
        }
    }
}

class ComponentAgent {
    constructor(t, e, s, n, r) {
        this.qe = t;
        this.Ge = e;
        this.re = s;
        this.Se = n;
        this.Fe = r;
        this.L = e.container.get(i).scopeTo(`ComponentAgent<${n.routeConfigContext.Bt}>`);
        const o = e.lifecycleHooks;
        this.We = (o.canLoad ?? []).map((t => t.instance));
        this.Qe = (o.loading ?? []).map((t => t.instance));
        this.Je = (o.canUnload ?? []).map((t => t.instance));
        this.Ye = (o.unloading ?? []).map((t => t.instance));
        this.Ke = "canLoad" in t;
        this.Xe = "loading" in t;
        this.Ze = "canUnload" in t;
        this.ts = "unloading" in t;
    }
    Dt(t, e) {
        const s = this.Ge;
        const n = this.Se.vpa.hostController;
        switch (s.mountTarget) {
          case x.host:
          case x.shadowRoot:
            n.host.appendChild(s.host);
            break;

          case x.location:
            n.host.append(s.location.$start, s.location);
            break;

          case x.none:
            throw new Error("Invalid mount target for routed component");
        }
        if (t === null) {
            return this.Ge.activate(this.Ge, e);
        }
        void this.Ge.activate(t, e);
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
                t.te((() => i.canUnload(this.qe, e, this.re)), (e => {
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
                t.te((() => this.qe.canUnload(e, this.re)), (e => {
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
        const n = this.Se.root;
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
                t.te((() => r.canLoad(this.qe, e.params, e, this.re)), (e => {
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
                t.te((() => this.qe.canLoad(e.params, e, this.re)), (e => {
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
                return n.unloading(this.qe, e, this.re);
            }), (() => {
                s.$();
            }));
        }
        if (this.ts) {
            t.te((() => {
                s.N();
                return this.qe.unloading(e, this.re);
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
                return n.loading(this.qe, e.params, e, this.re);
            }), (() => {
                s.$();
            }));
        }
        if (this.Xe) {
            t.te((() => {
                s.N();
                return this.qe.loading(e.params, e, this.re);
            }), (() => {
                s.$();
            }));
        }
        s.$();
    }
}

const ct = /*@__PURE__*/ e.createInterface("IRouteContext");

const ut = Object.freeze([ "string", "object", "function" ]);

function isEagerInstruction(t) {
    if (t == null) return false;
    const e = t.params;
    const s = t.component;
    return typeof e === "object" && e !== null && s != null && ut.includes(typeof s) && !(s instanceof Promise) && !(s instanceof NavigationStrategy);
}

function createEagerInstructions(e) {
    if (!t(e)) e = [ e ];
    const s = e.length;
    for (let t = 0; t < s; ++t) {
        const s = core(e[t]);
        if (s == null) throw new Error(getMessage(3404, e));
        e[t] = s;
    }
    return e;
    function core(t) {
        let e;
        if (typeof t === "string" || typeof t === "function") {
            e = t;
            t = null;
        } else {
            e = t.component;
        }
        if (e == null || !ut.includes(typeof e) || e instanceof Promise || e instanceof NavigationStrategy) return null;
        return {
            ...t,
            component: e,
            params: t?.params ?? u
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
    constructor(t, e, s, n, r, o) {
        this.parent = e;
        this.rs = n;
        this.routeConfigContext = r;
        this.Ve = o;
        this.os = [];
        this.ss = null;
        this.es = null;
        this.ns = t;
        if (e === null) {
            this.root = this;
        } else {
            this.root = e.root;
        }
        this.L = s.get(i).scopeTo(`RouteContext<${this.routeConfigContext.Bt}>`);
        const a = this.container = s.createChild();
        this.p = a.get(N);
        a.registerResolver(k, this.cs = new g, true);
        const c = new g("IRouteContext", this);
        a.registerResolver(ct, c);
        a.registerResolver(RouteContext, c);
        if (n.options.useNavigationModel) {
            a.get(F).subscribe("au:router:navigation-end", (() => {
                r.navigationModel.us(n, this);
            }));
        }
    }
    static setRoot(t) {
        const e = t.get(i).scopeTo("RouteContext");
        if (!t.has($, true)) {
            logAndThrow(new Error(getMessage(3167)), e);
        }
        if (t.has(ct, true)) {
            logAndThrow(new Error(getMessage(3168)), e);
        }
        const {controller: s} = t.get($);
        if (s === void 0) {
            logAndThrow(new Error(getMessage(3169)), e);
        }
        const n = t.get(nt);
        return o(n.getRouteContext(null, s.definition, s.viewModel, s.container, null, null, null), (e => {
            t.register(f.instance(ct, e));
            e.node = n.routeTree.root;
        }));
    }
    static resolve(t, e) {
        const s = t.container;
        const n = s.get(i).scopeTo("RouteContext");
        if (e == null) {
            return t;
        }
        if (e instanceof RouteContext) {
            return e;
        }
        if (e instanceof s.get(N).Node) {
            try {
                const t = S.for(e, {
                    searchParents: true
                });
                return t.container.get(ct);
            } catch (t) {
                error(n, 3155, e.nodeName, t);
                throw t;
            }
        }
        if (v(e)) {
            const t = e.$controller;
            return t.container.get(ct);
        }
        if (I(e)) {
            const t = e;
            return t.container.get(ct);
        }
        logAndThrow(new Error(getMessage(3170, Object.prototype.toString.call(e))), n);
    }
    dispose() {
        this.container.dispose();
    }
    ye(t) {
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
    Kt(t, e) {
        this.cs.prepare(t);
        const s = this.container.createChild({
            inheritParentResources: true
        });
        const n = this.p;
        const i = e.component;
        const r = n.document.createElement(i.name);
        T(s, r, n);
        const a = s.invoke(i.Type);
        const c = this.routeConfigContext.ps ? void 0 : o(resolveRouteConfiguration(a, false, this.routeConfigContext.config, e, null), (t => this.routeConfigContext.gs(t)));
        return o(c, (() => {
            const t = b.$el(s, a, r, {
                projections: null
            }, i);
            const n = new ComponentAgent(a, t, e, this, this.rs.options);
            this.cs.dispose();
            return n;
        }));
    }
    generateRootedPath(t) {
        return o(this.createViewportInstructions(createEagerInstructions(t), null, true), (t => {
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
    generateRelativePath(t) {
        return o(this.createViewportInstructions(createEagerInstructions(t), null, true), (t => t.toUrl(true, this.rs.options.Ue)));
    }
    createViewportInstructions(e, s, n) {
        if (e instanceof ViewportInstructionTree) return e;
        let i = s?.context ?? this;
        let r = false;
        if (!t(e)) {
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
        return this.ys;
    }
    constructor(t, e, s, n, r) {
        this.parent = t;
        this.component = e;
        this.config = s;
        this.rs = r;
        this.ps = false;
        this.childRoutes = [];
        this.ys = null;
        if (t === null) {
            this.root = this;
            this.path = [ this ];
            this.Bt = e.name;
        } else {
            this.root = t.root;
            this.path = [ ...t.path, this ];
            this.Bt = `${t.Bt}/${e.name}`;
        }
        this.L = n.get(i).scopeTo(`RouteConfigContext<${this.Bt}>`);
        const o = n.get(z).getObserver(r, "isNavigating");
        const a = {
            handleChange: (t, e) => {
                if (t !== true) return;
                this.config.ot();
                for (const t of this.childRoutes) {
                    if (t instanceof Promise) continue;
                    t.ot();
                }
            }
        };
        o.subscribe(a);
        this.Rs = () => o.unsubscribe(a);
        this.Ss = n.get(d);
        this.container = n.createChild();
        this.Cs = new U;
        if (r.options.useNavigationModel) {
            this.Es = new NavigationModel([]);
        } else {
            this.Es = null;
        }
        this.gs(s);
    }
    gs(t) {
        const e = [];
        const s = t.routes ?? J;
        const n = s.length;
        if (n === 0) {
            const e = t.component.prototype?.getRouteConfig;
            this.ps = e == null ? true : typeof e !== "function";
            return;
        }
        const i = this.Es;
        const o = i !== null;
        let a = 0;
        for (;a < n; a++) {
            const n = s[a];
            if (n instanceof Promise) {
                e.push(this.bs(n));
                continue;
            }
            const c = resolveRouteConfiguration(n, true, t, null, this);
            if (c instanceof Promise) {
                if (!isPartialChildRouteConfig(n) || n.path == null) throw new Error(getMessage(3173));
                for (const t of ensureArrayOfStrings(n.path)) {
                    this.Ns(t, n.caseSensitive ?? false, c);
                }
                const t = this.childRoutes.length;
                const s = c.then((e => this.childRoutes[t] = e));
                this.childRoutes.push(s);
                if (o) {
                    i.bs(s);
                }
                e.push(s.then(w));
                continue;
            }
            for (const t of c.path ?? r) {
                this.Ns(t, c.caseSensitive, c);
            }
            this.childRoutes.push(c);
            if (o) {
                i.bs(c);
            }
        }
        this.ps = true;
        if (e.length > 0) {
            this.ys = Promise.all(e).then((() => {
                this.ys = null;
            }));
        }
    }
    bs(t) {
        return o(resolveRouteConfiguration(t, true, this.config, null, this), (t => {
            for (const e of t.path ?? r) {
                this.Ns(e, t.caseSensitive, t);
            }
            this.Es?.bs(t);
            this.childRoutes.push(t);
        }));
    }
    Ns(t, e, s) {
        this.Cs.add({
            path: t,
            caseSensitive: e,
            handler: s
        }, true);
    }
    ct(t) {
        return this.Ss.load(t, (e => {
            const s = e.raw;
            if (typeof s === "function") {
                const t = S.isType(s) ? S.getDefinition(s) : null;
                if (t != null) return t;
            }
            let n = void 0;
            let i = void 0;
            for (const t of e.items) {
                const e = S.isType(t.value) ? t.definition : null;
                if (e != null) {
                    if (t.key === "default") {
                        n = e;
                    } else if (i === void 0) {
                        i = e;
                    }
                }
            }
            if (n === void 0 && i === void 0) {
                if (!isPartialCustomElementDefinition(s)) throw new Error(getMessage(3175, t));
                const e = C.create(s);
                S.define(e);
                return e;
            }
            return i ?? n;
        }));
    }
    Ee(t, e) {
        if (!isEagerInstruction(t)) return null;
        e ??= false;
        const s = t.component;
        let n;
        let i = false;
        if (s instanceof RouteConfig) {
            n = s.path;
            i = true;
        } else if (typeof s === "string") {
            const t = this.childRoutes.find((t => t.id === s));
            if (t === void 0) return null;
            n = t.path;
        } else if (s.type === 0) {
            const t = this.childRoutes.find((t => t.id === s.value));
            if (t === void 0) return null;
            n = t.path;
        } else {
            const t = resolveCustomElementDefinition(s, this)[1];
            n = this.childRoutes.reduce(((e, s) => {
                if (s.component === t.Type) {
                    e.push(...s.path);
                }
                return e;
            }), []);
            i = true;
        }
        if (n === void 0) return null;
        const a = t.params;
        const c = this.Cs;
        const h = n.length;
        const l = [];
        let f = null;
        if (h === 1) {
            const e = core(n[0]);
            if (e === null) {
                if (i) throw new Error(getMessage(3166, t, l));
                return null;
            }
            return createPathGenerationResult.call(this, e);
        }
        let p = 0;
        for (let t = 0; t < h; t++) {
            const e = core(n[t]);
            if (e === null) continue;
            if (f === null) {
                f = e;
                p = Object.keys(e.consumed).length;
            } else if (Object.keys(e.consumed).length > p) {
                f = e;
            }
        }
        if (f === null) {
            if (i) throw new Error(getMessage(3166, t, l));
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
                let i = a[e];
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
            const i = Object.fromEntries(Object.entries(a).filter((([t]) => !n.includes(t))));
            return {
                path: t.replace(/\/\//g, "/"),
                endpoint: e,
                consumed: s,
                query: i
            };
        }
        async function generateChildrenInstructions(s) {
            const n = t.children;
            const i = n?.length ?? 0;
            if (i === 0) return {
                instructions: r,
                query: u
            };
            const a = s.component;
            const c = S.isType(a) ? S.getDefinition(a) : resolveCustomElementDefinition(a, this)[1];
            return o(o(this.rs.getRouteConfigContext(s, c, null, this.container, this.config, this), (t => o(t.allResolved, (() => t)))), (t => {
                const s = new Array(i);
                const r = new Array(i);
                let a = Object.create(null);
                for (let c = 0; c < i; ++c) {
                    const i = n[c];
                    s[c] = o(t.Ee(isPartialViewportInstruction(i) ? {
                        ...i,
                        params: i.params ?? u
                    } : {
                        component: i,
                        params: u
                    }, e), (t => {
                        if (t == null) throw new Error(getMessage(3166, i));
                        r[c] = t.vi;
                        a = mergeQueryParams(a, t.query);
                    }));
                }
                return o(Promise.all(s), (() => ({
                    instructions: r,
                    query: a
                })));
            }));
        }
        function createPathGenerationResult(s) {
            return o(e ? generateChildrenInstructions.call(this, s.endpoint.route.handler) : {
                instructions: t.children,
                query: u
            }, (({instructions: e, query: n}) => ({
                vi: ViewportInstruction.create({
                    recognizedRoute: new $RecognizedRoute(new M(s.endpoint, s.consumed), null),
                    component: s.path,
                    children: e,
                    viewport: t.viewport,
                    open: t.open,
                    close: t.close
                }),
                query: mergeQueryParams(s.query, n)
            })));
        }
    }
    recognize(t, e = false) {
        let s = this;
        let n = true;
        let i = null;
        while (n) {
            i = s.Cs.recognize(t);
            if (i === null) {
                if (!e || s.isRoot) return null;
                s = s.parent;
            } else {
                n = false;
            }
        }
        return new $RecognizedRoute(i, Reflect.has(i.params, O) ? i.params[O] ?? null : null);
    }
    dispose() {
        this.container.dispose();
        this.Rs();
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
        this.xs = void 0;
    }
    resolve() {
        return o(this.xs, w);
    }
    us(t, e) {
        void o(this.xs, (() => {
            for (const s of this.routes) {
                s.us(t, e);
            }
        }));
    }
    bs(t) {
        const e = this.routes;
        if (!(t instanceof Promise)) {
            if ((t.nav ?? false) && t.redirectTo === null) {
                e.push(NavigationRoute.Z(t));
            }
            return;
        }
        const s = e.length;
        e.push(void 0);
        let n = void 0;
        n = this.xs = o(this.xs, (() => o(t, (t => {
            if (t.nav && t.redirectTo === null) {
                e[s] = NavigationRoute.Z(t);
            } else {
                e.splice(s, 1);
            }
            if (this.xs === n) {
                this.xs = void 0;
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
    static Z(t) {
        return new NavigationRoute(t.id, ensureArrayOfStrings(t.path ?? r), t.title, t.data);
    }
    get isActive() {
        return this.Pt;
    }
    us(t, e) {
        let s = this.ks;
        if (s === null) {
            const n = t.options;
            s = this.ks = this.path.map((t => {
                const s = e.routeConfigContext.Cs.getEndpoint(t);
                if (s === null) throw new Error(getMessage(3450, t));
                return new ViewportInstructionTree(NavigationOptions.create(n, {
                    context: e
                }), false, [ ViewportInstruction.create({
                    recognizedRoute: new $RecognizedRoute(new M(s, u), null),
                    component: t
                }) ], st, null);
            }));
        }
        this.Pt = s.some((e => t.routeTree.contains(e, true)));
    }
}

class ViewportCustomElement {
    constructor() {
        this.name = at;
        this.usedBy = "";
        this.default = "";
        this.fallback = "";
        this.$s = void 0;
        this.Ge = void 0;
        this.Se = s(ct);
        this.L = s(i).scopeTo(`au-viewport<${this.Se.routeConfigContext.Bt}>`);
    }
    it(t, e, s) {
        const n = this.fallback;
        return typeof n === "function" && !S.isType(n) ? n(t, e, s) : n;
    }
    hydrated(t) {
        this.Ge = t;
        this.$s = this.Se.ds(this);
    }
    attaching(t, e) {
        return this.$s.zt(t, this.Ge);
    }
    detaching(t, e) {
        return this.$s.qt(t, this.Ge);
    }
    dispose() {
        this.Se.ws(this);
        this.$s.ee();
        this.$s = void 0;
    }
    toString() {
        const t = [];
        for (const e of ht) {
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
        return `VP(ctx:'${this.Se.routeConfigContext.Bt}',${t.join(",")})`;
    }
}

S.define({
    name: "au-viewport",
    bindables: [ "name", "usedBy", "default", "fallback" ]
}, ViewportCustomElement);

const ht = [ "name", "usedBy", "default", "fallback" ];

class LoadCustomAttribute {
    constructor() {
        this.Is = s(P);
        this.rs = s(nt);
        this.Se = s(ct);
        this._ = s(F);
        this.Ve = s(Q);
        this.attribute = "href";
        this.active = false;
        this.Ts = null;
        this.xe = null;
        this._s = null;
        this.onClick = t => {
            if (this.xe === null) {
                return;
            }
            if (t.altKey || t.ctrlKey || t.shiftKey || t.metaKey || t.button !== 0) {
                return;
            }
            t.preventDefault();
            void this.rs.load(this.xe, {
                context: this.context
            });
        };
        const t = this.Is;
        this.Ps = !t.hasAttribute("external") && !t.hasAttribute("data-external");
        this.As = this.rs.options.activeClass;
    }
    binding() {
        if (this.Ps) {
            this.Is.addEventListener("click", this.onClick);
        }
        this.valueChanged();
        this._s = this._.subscribe("au:router:navigation-end", (t => {
            const e = this.active = this.xe !== null && this.rs.isActive(this.xe, this.context);
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
        const e = t.options;
        const s = this.route;
        let n = this.context;
        if (n === void 0) {
            n = this.context = this.Se;
        } else if (n === null) {
            n = this.context = this.Se.root;
        }
        if (s != null && n.routeConfigContext.allResolved === null) {
            const i = this.params;
            const r = this.xe = t.createViewportInstructions(typeof i === "object" && i !== null ? {
                component: s,
                params: i
            } : s, {
                context: n
            });
            this.Ts = r.toUrl(false, e.Ue);
        } else {
            this.xe = null;
            this.Ts = null;
        }
        const i = S.for(this.Is, {
            optional: true
        });
        if (i !== null) {
            i.viewModel[this.attribute] = this.xe;
        } else {
            if (this.Ts === null) {
                this.Is.removeAttribute(this.attribute);
            } else {
                const t = e.useUrlFragmentHash ? this.Ts : this.Ve.addBaseHref(this.Ts);
                this.Is.setAttribute(this.attribute, t);
            }
        }
    }
}

_.define({
    name: "load",
    bindables: {
        route: {
            mode: H,
            primary: true,
            callback: "valueChanged"
        },
        params: {
            mode: H,
            callback: "valueChanged"
        },
        attribute: {
            mode: H
        },
        active: {
            mode: q
        },
        context: {
            mode: H,
            callback: "valueChanged"
        }
    }
}, LoadCustomAttribute);

class HrefCustomAttribute {
    get Vs() {
        return this.Is.hasAttribute("external") || this.Is.hasAttribute("data-external");
    }
    constructor() {
        this.Is = s(P);
        this.rs = s(nt);
        this.Se = s(ct);
        this.Os = false;
        if (this.rs.options.useHref && this.Is.nodeName === "A") {
            const t = s(R).name;
            switch (this.Is.getAttribute("target")) {
              case null:
              case t:
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
            this.Ps = this.Ps && A.get(this.Is, _.getDefinition(LoadCustomAttribute).key) === null;
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
            if (this.rs.options.useUrlFragmentHash && this.Se.routeConfigContext.isRoot && !/^[.#]/.test(t) && !this.Vs) {
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
                context: this.Se
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
            mode: H
        }
    }
};

const lt = nt;

const ft = [ lt ];

const pt = ViewportCustomElement;

const gt = LoadCustomAttribute;

const dt = HrefCustomAttribute;

const wt = [ ViewportCustomElement, LoadCustomAttribute, HrefCustomAttribute ];

function configure(t, e) {
    let s = null;
    if (h(e)) {
        s = e.basePath ?? null;
    } else {
        e = {};
    }
    const n = RouterOptions.create(e);
    return t.register(f.cachedCallback(W, ((t, e, n) => {
        const i = t.get(R);
        const r = new URL(i.document.baseURI);
        r.pathname = normalizePath(s ?? r.pathname);
        return r;
    })), f.instance(ot, n), f.instance(RouterOptions, n), V.creating(nt, (t => {})), V.hydrated(l, RouteContext.setRoot), V.activated(nt, (t => t.start(true))), V.deactivated(nt, (t => t.stop())), ...ft, ...wt);
}

const mt = {
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

const vt = /*@__PURE__*/ e.createInterface("IStateManager", (t => t.singleton(ScrollStateManager)));

class ScrollStateManager {
    constructor() {
        this.Hs = new WeakMap;
    }
    saveState(t) {
        this.Hs.set(t.host, new HostElementState(t.host));
    }
    restoreState(t) {
        const e = this.Hs.get(t.host);
        if (e !== void 0) {
            e.Bs();
            this.Hs.delete(t.host);
        }
    }
}

const Et = /*@__PURE__*/ e.createInterface("ICurrentRoute", (t => t.singleton(CurrentRoute)));

class CurrentRoute {
    constructor() {
        this.path = "";
        this.url = "";
        this.title = "";
        this.query = new URLSearchParams;
        this.parameterInformation = r;
        const t = s(nt);
        const e = t.options;
        s(F).subscribe("au:router:navigation-end", (s => {
            const n = s.finalInstructions;
            D((() => {
                this.path = n.toPath();
                this.url = n.toUrl(true, e.Ue);
                this.title = t.He();
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
        const s = Object.create(null);
        Object.assign(s, e?.params ?? t.params);
        Reflect.deleteProperty(s, O);
        return new ParameterInformation(e?.endpoint.route.handler ?? null, t.viewport, s, t.children.map((t => this.create(t))));
    }
}

export { Z as AST, G as AuNavId, ComponentExpression, CompositeSegmentExpression, ft as DefaultComponents, wt as DefaultResources, HrefCustomAttribute, dt as HrefCustomAttributeRegistration, Et as ICurrentRoute, Q as ILocationManager, ct as IRouteContext, nt as IRouter, F as IRouterEvents, ot as IRouterOptions, vt as IStateManager, LoadCustomAttribute, gt as LoadCustomAttributeRegistration, LocationChangeEvent, NavigationCancelEvent, NavigationEndEvent, NavigationErrorEvent, NavigationOptions, NavigationStartEvent, NavigationStrategy, ParameterExpression, ParameterListExpression, Y as Route, RouteConfig, RouteContext, RouteExpression, RouteNode, RouteTree, Router, mt as RouterConfiguration, RouterOptions, lt as RouterRegistration, ScopedSegmentExpression, SegmentExpression, SegmentGroupExpression, Transition, ViewportAgent, ViewportCustomElement, pt as ViewportCustomElementRegistration, ViewportExpression, rt as fragmentUrlParser, isManagedState, it as pathUrlParser, route, toManagedState };

