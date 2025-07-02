import { isArray as t, DI as e, resolve as s, IEventAggregator as i, ILogger as n, emptyArray as r, onResolve as o, getResourceKeyFor as a, onResolveAll as c, emptyObject as u, isObjectOrFunction as h, IContainer as l, Registration as f, isArrayIndex as p, InstanceProvider as g, IModuleLoader as d, noop as w } from "../../../kernel/dist/native-modules/index.mjs";

import { BindingMode as m, isCustomElementViewModel as v, IHistory as E, ILocation as y, IWindow as R, CustomElement as S, CustomElementDefinition as C, Controller as b, IPlatform as N, MountTarget as x, IController as k, IAppRoot as $, isCustomElementController as I, registerHostNode as _, CustomAttribute as T, INode as P, refs as A, AppTask as V } from "../../../runtime-html/dist/native-modules/index.mjs";

import { RESIDUE as O, RecognizedRoute as M, Endpoint as j, ConfigurableRoute as L, RouteRecognizer as U } from "../../../route-recognizer/dist/native-modules/index.mjs";

import { Metadata as B } from "../../../metadata/dist/native-modules/index.mjs";

import { batch as z } from "../../../runtime/dist/native-modules/index.mjs";

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
        if (t(i)) {
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
            e[i] = [ ...t(s) ? s : [ s ], ...t(n) ? n : [ n ] ];
        }
    }
    return e;
}

const D = m.toView;

const H = m.fromView;

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

const q = "au-nav-id";

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

const G = /*@__PURE__*/ e.createInterface("IRouterEvents", t => t.singleton(RouterEvents));

class RouterEvents {
    constructor() {
        this.M = 0;
        this.O = [];
        this.j = s(i);
        this.L = s(n).scopeTo("RouterEvents");
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

const F = /*@__PURE__*/ e.createInterface("IBaseHref");

const W = /*@__PURE__*/ e.createInterface("ILocationManager", t => t.singleton(BrowserLocationManager));

class BrowserLocationManager {
    constructor() {
        this.U = 0;
        this.L = s(n).root.scopeTo("LocationManager");
        this.T = s(G);
        this.B = s(E);
        this.l = s(y);
        this.H = s(R);
        this.q = s(F);
        this.G = s(rt).useUrlFragmentHash ? "hashchange" : "popstate";
    }
    startListening() {
        this.H.addEventListener(this.G, this, false);
    }
    stopListening() {
        this.H.removeEventListener(this.G, this, false);
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

const Q = r;

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
    constructor(t, e, s, i, n, r, o, a, c, u, h, l) {
        this.id = t;
        this.F = e;
        this.title = s;
        this.redirectTo = i;
        this.caseSensitive = n;
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
            const i = e?.redirectTo ?? null;
            const n = e?.caseSensitive ?? false;
            const r = ensureString(e?.id ?? (s instanceof Array ? s[0] : s));
            const o = e?.title ?? null;
            const a = e?.transitionPlan ?? null;
            const c = e?.viewport ?? ot;
            const u = e?.data ?? {};
            const h = e?.routes ?? Q;
            return new RouteConfig(r, s, o, i, n, a, c, u, h, e?.fallback ?? null, e, e?.nav ?? true);
        } else if (typeof t === "object") {
            const s = t;
            validateRouteConfig(s, "");
            const i = ensureArrayOfStrings(s.path ?? e?.path ?? r);
            const n = s.title ?? e?.title ?? null;
            const o = s.redirectTo ?? e?.redirectTo ?? null;
            const a = s.caseSensitive ?? e?.caseSensitive ?? false;
            const c = s.id ?? e?.id ?? (i instanceof Array ? i[0] : i);
            const u = s.transitionPlan ?? e?.transitionPlan ?? null;
            const h = s.viewport ?? e?.viewport ?? ot;
            const l = {
                ...e?.data,
                ...s.data
            };
            const f = [ ...s.routes ?? Q, ...e?.routes ?? Q ];
            return new RouteConfig(c, i, n, o, a, u, h, l, f, s.fallback ?? e?.fallback ?? null, s.component ?? e ?? null, s.nav ?? true);
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
        const i = this.transitionPlan ?? "replace";
        return typeof i === "function" ? i(t, e) : i;
        function cleanPath(t) {
            return t.replace(`/*${O}`, "");
        }
        function hasSamePath(t, e) {
            const s = t.finalPath;
            const i = e.finalPath;
            return s.length === 0 || i.length === 0 || cleanPath(s) === cleanPath(i);
        }
    }
    st(t, e, s) {
        if (this.Y) throw new Error(getMessage(3550));
        if (typeof t.getRouteConfig !== "function") return;
        return o(t.getRouteConfig(e, s), t => {
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
        });
    }
    it() {
        return new RouteConfig(this.id, this.path, this.title, this.redirectTo, this.caseSensitive, this.transitionPlan, this.viewport, this.data, this.routes, this.fallback, this.W, this.nav);
    }
    nt(t, e, s) {
        const i = this.fallback;
        return typeof i === "function" && !S.isType(i) ? i(t, e, s) : i;
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

const J = {
    name: /*@__PURE__*/ a("route-configuration"),
    isConfigured(t) {
        return B.has(J.name, t);
    },
    configure(t, e) {
        const s = RouteConfig.Z(t, e);
        B.define(s, e, J.name);
        return e;
    },
    getConfig(t) {
        if (!J.isConfigured(t)) {
            J.configure({}, t);
        }
        return B.get(J.name, t);
    }
};

function route(t) {
    return function(e, s) {
        s.addInitializer(function() {
            J.configure(t, this);
        });
        return e;
    };
}

function resolveRouteConfiguration(t, e, s, i, n) {
    if (isPartialRedirectRouteConfig(t)) return RouteConfig.Z(t, null);
    const [r, a] = resolveCustomElementDefinition(t, n);
    if (r.type === 5) return RouteConfig.Z({
        ...t,
        nav: false
    }, null);
    return o(a, n => {
        const a = n.Type;
        const c = J.getConfig(a);
        if (isPartialChildRouteConfig(t)) return c.tt(t, s);
        if (e) return c.it();
        if (!c.Y && r.type === 4 && typeof t.getRouteConfig === "function") {
            return o(c.st(t, s, i), () => c);
        }
        return c;
    });
}

function resolveCustomElementDefinition(t, e) {
    const s = createNavigationInstruction(t);
    let i;
    switch (s.type) {
      case 5:
        return [ s, null ];

      case 0:
        {
            if (e == null) throw new Error(getMessage(3551));
            const t = e.component.dependencies;
            let n = t.find(t => isPartialCustomElementDefinition(t) && t.name === s.value) ?? S.find(e.container, s.value);
            if (n === null) throw new Error(getMessage(3552, s.value, e));
            if (!(n instanceof C)) {
                n = C.create(n);
                S.define(n);
            }
            i = n;
            break;
        }

      case 2:
        i = s.value;
        break;

      case 4:
        i = S.getDefinition(s.value.constructor);
        break;

      case 3:
        if (e == null) throw new Error(getMessage(3553));
        i = e.ct(s.value);
        break;
    }
    return [ s, i ];
}

function createNavigationInstruction(t) {
    return isPartialChildRouteConfig(t) ? createNavigationInstruction(t.component) : TypedNavigationInstruction.create(t);
}

const Y = [ "?", "#", "/", "+", "(", ")", "@", "!", "=", ",", "&", "'", "~", ";" ];

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
        return t.some(function(t) {
            return e.startsWith(t);
        });
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
        for (let i = 0; i < e; ++i) {
            s[i] += t;
        }
    }
}

const K = new Map;

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
        let s = K.get(e);
        if (s === void 0) {
            K.set(e, s = RouteExpression.xt(t));
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
        const i = s.wt("/");
        const n = CompositeSegmentExpression.kt(s);
        s.Rt();
        s.Nt();
        return new RouteExpression(i, n, t.query, t.fragment);
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
            return [ ...this.siblings[0].$t(t, 0), ...this.siblings.slice(1, -1).flatMap(function(t) {
                return t.$t(0, 0);
            }), ...this.siblings[this.siblings.length - 1].$t(0, e) ];
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
        const i = this.right.$t(0, e);
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
        const i = !t.wt("!");
        t.Nt();
        return new SegmentExpression(e, s, i);
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
                while (!t.u && !t.dt(...Y)) {
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
            while (!t.u && !t.dt(...Y)) {
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
        while (!t.u && !t.dt(...Y)) {
            t.St();
        }
        let s = t.bt();
        if (s.length === 0) {
            t.yt("parameter key");
        }
        let i;
        if (t.wt("=")) {
            t.Ct();
            while (!t.u && !t.dt(...Y)) {
                t.St();
            }
            i = decodeURIComponent(t.bt());
            if (i.length === 0) {
                t.yt("parameter value");
            }
        } else {
            i = s;
            s = e.toString();
        }
        t.Nt();
        return new ParameterExpression(s, i);
    }
}

const X = Object.freeze({
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

const Z = new WeakMap;

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
        this.L = s.container.get(n).scopeTo(`ViewportAgent<${s.routeConfigContext.Bt}>`);
    }
    static for(t, e) {
        let s = Z.get(t);
        if (s === void 0) {
            const i = b.getCachedOrThrow(t);
            Z.set(t, s = new ViewportAgent(t, i, e));
        }
        return s;
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
                this.Ht("activateFromViewport 1");
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
            this.Ht("activateFromViewport 2");
        }
    }
    qt(t, e) {
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
        if (s !== ot && i !== s) {
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
    Qt(t, e) {
        if (this.Lt === null) {
            this.Lt = t;
        }
        ensureTransitionHasNotErrored(t);
        if (t.guardsResult !== true) {
            return;
        }
        e.N();
        void o(this.Ut, () => {
            Batch.C(e => {
                for (const s of this.Mt.children) {
                    s.context.vpa.Qt(t, e);
                }
            })._(e => {
                switch (this._t) {
                  case 4096:
                    switch (this.Ot) {
                      case "none":
                        this._t = 1024;
                        return;

                      case "invoke-lifecycles":
                      case "replace":
                        this._t = 2048;
                        e.N();
                        Batch.C(e => {
                            this.At.Qt(t, this.jt, e);
                        })._(() => {
                            this._t = 1024;
                            e.$();
                        }).C();
                        return;
                    }

                  case 8192:
                    return;

                  default:
                    t.Jt(new Error(`Unexpected state at canUnload of ${this}`));
                }
            })._(() => {
                e.$();
            }).C();
        });
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
        Batch.C(e => {
            switch (this.Tt) {
              case 32:
                this.Tt = 16;
                switch (this.Ot) {
                  case "none":
                    return;

                  case "invoke-lifecycles":
                    return this.At.Yt(t, this.jt, e);

                  case "replace":
                    e.N();
                    void o(this.jt.context.Kt(this.hostController, this.jt), s => {
                        (this.Vt = s).Yt(t, this.jt, e);
                        e.$();
                    });
                }

              case 64:
                return;

              default:
                this.Ht("canLoad");
            }
        })._(e => {
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
                    void o(t.routeConfigContext.allResolved, () => o(o(c(...s.residue.splice(0).map(t => createAndAppendNodes(this.L, s, t))), () => c(...t.getAvailableViewportAgents().reduce((t, e) => {
                        const i = e.viewport;
                        const n = i.default;
                        if (n === null) return t;
                        t.push(createAndAppendNodes(this.L, s, ViewportInstruction.create({
                            component: n,
                            viewport: i.name
                        })));
                        return t;
                    }, []))), () => {
                        e.$();
                    }));
                    return;
                }

              case "replace":
                return;
            }
        })._(e => {
            switch (this.Tt) {
              case 16:
                this.Tt = 8;
                for (const s of this.jt.children) {
                    s.context.vpa.Yt(t, e);
                }
                return;

              case 64:
                return;

              default:
                this.Ht("canLoad");
            }
        })._(() => {
            e.$();
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
                this.Ht("unloading");
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
                this.Ht("loading");
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
                this.Ht("loading");
            }
        })._(() => {
            e.$();
        }).C();
    }
    Gt(t, e, s) {
        ensureTransitionHasNotErrored(e);
        ensureGuardsResultIsTrue(this, e);
        s.N();
        switch (this._t) {
          case 256:
            this._t = 128;
            switch (this.Ot) {
              case "none":
              case "invoke-lifecycles":
                s.$();
                return;

              case "replace":
                {
                    const i = this.hostController;
                    const n = this.At;
                    e.te(() => o(n.Gt(t, i), () => {
                        if (t === null) {
                            n.ee();
                        }
                    }), () => {
                        s.$();
                    });
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
            this.Ht("activate");
        }
    }
    ie(t, e) {
        if (this._t === 8192) {
            this.Dt(null, t, e);
            return;
        }
        if (this.Tt === 64) {
            this.Gt(null, t, e);
            return;
        }
        ensureTransitionHasNotErrored(t);
        ensureGuardsResultIsTrue(this, t);
        if (!(this._t === 256 && this.Tt === 2)) {
            this.Ht("swap");
        }
        this._t = 128;
        this.Tt = 1;
        switch (this.Ot) {
          case "none":
          case "invoke-lifecycles":
            {
                const s = mergeDistinct(this.jt.children, this.Mt.children);
                for (const i of s) {
                    i.context.vpa.ie(t, e);
                }
                return;
            }

          case "replace":
            {
                const s = this.hostController;
                const i = this.At;
                const n = this.Vt;
                e.N();
                Batch.C(e => {
                    t.te(() => {
                        e.N();
                        return o(i.Gt(null, s), () => i.ee());
                    }, () => {
                        e.$();
                    });
                })._(e => {
                    t.te(() => {
                        e.N();
                        return n.Dt(null, s);
                    }, () => {
                        e.$();
                    });
                })._(e => {
                    this.se(t, e);
                })._(() => {
                    e.$();
                }).C();
                return;
            }
        }
    }
    se(t, e) {
        const s = this.jt;
        t.te(() => {
            e.N();
            const t = s.context;
            return o(t.routeConfigContext.allResolved, () => {
                const e = s.children.slice();
                return o(c(...s.residue.splice(0).map(t => createAndAppendNodes(this.L, s, t))), () => o(c(...t.getAvailableViewportAgents().reduce((t, e) => {
                    const i = e.viewport;
                    const n = i.default;
                    if (n === null) return t;
                    t.push(createAndAppendNodes(this.L, s, ViewportInstruction.create({
                        component: n,
                        viewport: i.name
                    })));
                    return t;
                }, [])), () => s.children.filter(t => !e.includes(t))));
            });
        }, s => {
            Batch.C(e => {
                for (const i of s) {
                    t.te(() => {
                        e.N();
                        return i.context.vpa.Yt(t, e);
                    }, () => {
                        e.$();
                    });
                }
            })._(e => {
                if (t.guardsResult !== true) return;
                for (const i of s) {
                    t.te(() => {
                        e.N();
                        return i.context.vpa.Zt(t, e);
                    }, () => {
                        e.$();
                    });
                }
            })._(e => {
                if (t.guardsResult !== true) return;
                for (const i of s) {
                    t.te(() => {
                        e.N();
                        return i.context.vpa.Dt(null, t, e);
                    }, () => {
                        e.$();
                    });
                }
            })._(() => {
                e.$();
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
        let t = null;
        let e = null;
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
            t = o(this.At?.Gt(null, this.hostController), () => {
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
                e = o(this.Vt?.Gt(null, this.hostController), () => {
                    this.Vt?.ee();
                    this.Ot = "replace";
                    this.Tt = 64;
                    this.Vt = null;
                    this.jt = null;
                });
                break;
            }
        }
        if (t !== null && e !== null) {
            this.Ut = o(c(t, e), () => {
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
                    this.Ht("endTransition 1");
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
                    this.Ht("endTransition 2");
                }
                break;

              default:
                this.Ht("endTransition 3");
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

const tt = new Map;

function $state(t) {
    let e = tt.get(t);
    if (e === void 0) {
        tt.set(t, e = stringifyState(t));
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
    constructor(t, e, s, i, n, r, o, a, c, u, h, l, f) {
        this.path = t;
        this.finalPath = e;
        this.context = s;
        this.he = i;
        this.instruction = n;
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
        this.he ??= n;
    }
    static create(t) {
        const {[O]: e, ...s} = t.params ?? {};
        return new RouteNode(t.path, t.finalPath, t.context, t.originalInstruction ?? t.instruction, t.instruction, Object.freeze(s), t.queryParams ?? et, t.fragment ?? null, Object.freeze(t.data ?? u), t.le ?? null, t.title ?? null, t.component, t.residue ?? []);
    }
    contains(t, e = false) {
        if (this.context.routeConfigContext === t.options.context.routeConfigContext) {
            const s = this.children;
            const i = t.children;
            for (let t = 0, n = s.length; t < n; ++t) {
                for (let r = 0, o = i.length; r < o; ++r) {
                    const a = i[r];
                    const c = e ? a.recognizedRoute?.route.endpoint : null;
                    const u = s[t + r] ?? null;
                    const h = u !== null ? u.isInstructionsFinalized ? u.instruction : u.he : null;
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
        return this.children.some(function(s) {
            return s.contains(t, e);
        });
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
    ge(t) {
        this.ce = t;
        for (const e of this.children) {
            e.ge(t);
        }
    }
    we() {
        this.ue = true;
        const t = this.children.map(t => t.we());
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
        t.root.ge(this);
        return t;
    }
    me() {
        return new ViewportInstructionTree(this.options, true, this.root.children.map(t => t.we()), this.queryParams, this.fragment);
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
            return c(...s.children.map(s => createAndAppendNodes(t, e, s)));

          default:
            {
                t.trace(`createAndAppendNodes invoking createNode`);
                const i = e.context;
                const n = s.it();
                let r = s.recognizedRoute;
                if (r !== null) return appendNode(t, e, createConfiguredNode(t, e, s, r, n));
                if (s.children.length === 0) {
                    const n = i.routeConfigContext.Ee(s);
                    if (n !== null) {
                        e.ce.ve(n.query);
                        const i = n.vi;
                        i.children.push(...s.children);
                        return appendNode(t, e, createConfiguredNode(t, e, i, i.recognizedRoute, s));
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
                r = i.routeConfigContext.recognize(c);
                t.trace("createNode recognized route: %s", r);
                const l = r?.residue ?? null;
                t.trace("createNode residue:", l);
                const f = l === null;
                if (r === null || l === c) {
                    const n = i.routeConfigContext.Ee({
                        component: s.component.value,
                        params: s.params ?? u,
                        open: s.open,
                        close: s.close,
                        viewport: s.viewport,
                        children: s.children
                    });
                    if (n !== null) {
                        e.ce.ve(n.query);
                        return appendNode(t, e, createConfiguredNode(t, e, n.vi, n.vi.recognizedRoute, s));
                    }
                    const r = s.component.value;
                    if (r === "") return;
                    let a = s.viewport;
                    if (a === null || a.length === 0) a = ot;
                    const c = i.getFallbackViewportAgent(a);
                    const h = c !== null ? c.viewport.nt(s, e, i) : i.routeConfigContext.config.nt(s, e, i);
                    if (h === null) throw new UnknownRouteError(getMessage(3401, r, i.routeConfigContext.Bt, a, r, i.routeConfigContext.component.name));
                    if (typeof h === "string") {
                        t.trace(`Fallback is set to '${h}'. Looking for a recognized route.`);
                        const n = i.routeConfigContext.childRoutes.find(t => t.id === h);
                        if (n !== void 0) return appendNode(t, e, createFallbackNode(t, n, e, s));
                        t.trace(`No route configuration for the fallback '${h}' is found; trying to recognize the route.`);
                        const r = i.routeConfigContext.recognize(h, true);
                        if (r !== null && r.residue !== h) return appendNode(t, e, createConfiguredNode(t, e, s, r, null));
                    }
                    t.trace(`The fallback '${h}' is not recognized as a route; treating as custom element name.`);
                    return o(resolveRouteConfiguration(h, false, i.routeConfigContext.config, null, i.routeConfigContext), i => appendNode(t, e, createFallbackNode(t, i, e, s)));
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
                return appendNode(t, e, createConfiguredNode(t, e, s, r, n));
            }
        }

      case 3:
      case 4:
      case 2:
        {
            const i = e.context;
            return o(resolveCustomElementDefinition(s.component.value, i.routeConfigContext)[1], n => {
                const {vi: r, query: o} = i.routeConfigContext.Ee({
                    component: n,
                    params: s.params ?? u,
                    open: s.open,
                    close: s.close,
                    viewport: s.viewport,
                    children: s.children
                });
                e.ce.ve(o);
                return appendNode(t, e, createConfiguredNode(t, e, r, r.recognizedRoute, s));
            });
        }
    }
}

function createConfiguredNode(t, e, s, i, n, r = i.route.endpoint.route) {
    const a = e.context;
    const c = e.ce;
    return o(r.handler, u => {
        r.handler = u;
        t.trace(`creatingConfiguredNode(rdc:%s, vi:%s)`, u, s);
        if (u.redirectTo === null) {
            const h = (s.viewport?.length ?? 0) > 0;
            const l = h ? s.viewport : u.viewport;
            return o(resolveCustomElementDefinition(u.J(s, a, e, i.route), a.routeConfigContext)[1], f => {
                const p = a.ye(new ViewportRequest(l, f.name));
                if (!h) {
                    s.viewport = p.viewport.name;
                }
                const g = a.container.get(st);
                return o(g.getRouteContext(p, f, null, p.hostController.container, a.routeConfigContext.config, a, u), o => {
                    t.trace("createConfiguredNode setting the context node");
                    const a = o.node = RouteNode.create({
                        path: i.route.endpoint.route.path,
                        finalPath: r.path,
                        context: o,
                        instruction: s,
                        originalInstruction: n,
                        params: i.route.params,
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
                });
            });
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
                    g.push(i.route.params[w.component.parameterName]);
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
        }), y, n);
    });
}

function appendNode(t, e, s) {
    return o(s, s => {
        t.trace(`appendNode($childNode:%s)`, s);
        e.pe(s);
        return s.context.vpa.ne(e.ce.options, s);
    });
}

function createFallbackNode(t, e, s, i) {
    const n = new $RecognizedRoute(new M(new j(new L(e.path[0], e.caseSensitive, e), []), u), null);
    i.children.length = 0;
    return createConfiguredNode(t, s, i, n, null);
}

const et = Object.freeze(new URLSearchParams);

function isManagedState(t) {
    return h(t) && Object.prototype.hasOwnProperty.call(t, q) === true;
}

function toManagedState(t, e) {
    return {
        ...t,
        [q]: e
    };
}

class UnknownRouteError extends Error {}

class Transition {
    get erredWithUnknownRoute() {
        return this.Re;
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
        this.Re = t instanceof UnknownRouteError;
        this.reject(this.error = t);
    }
    toString() {
        return `T(id:${this.id},trigger:'${this.trigger}',instructions:${this.instructions})`;
    }
}

const st = /*@__PURE__*/ e.createInterface("IRouter", t => t.singleton(Router));

class Router {
    get Se() {
        const t = this.Ce;
        if (t !== null) return t;
        if (!this.c.has(at, true)) throw new Error(getMessage(3271));
        return this.Ce = this.c.get(at);
    }
    get routeTree() {
        let t = this.be;
        if (t === null) {
            const e = this.Se;
            t = this.be = new RouteTree(NavigationOptions.create(this.options, {}), et, null, RouteNode.create({
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
        this._e = null;
        this.Te = null;
        this.Pe = false;
        this.Ae = [];
        this.ke = false;
        this.c = s(l);
        this.Ve = s(N);
        this.L = s(n).root.scopeTo("Router");
        this.T = s(G);
        this.Oe = s(W);
        this.options = s(rt);
        this.Me = new WeakMap;
        this.je = new Map;
        this.xe = ViewportInstructionTree.create("", this.options, null, null);
        this.c.registerResolver(Router, f.instance(Router, this));
    }
    Le(t) {
        return RouteContext.resolve(this.Se, t);
    }
    start(t) {
        this.Pe = typeof this.options.buildTitle === "function";
        this.Oe.startListening();
        this.Te = this.T.subscribe("au:router:location-change", t => {
            this.Ve.taskQueue.queueTask(() => {
                const e = isManagedState(t.state) ? t.state : null;
                const s = this.options;
                const i = NavigationOptions.create(s, {
                    historyStrategy: "replace"
                });
                const n = ViewportInstructionTree.create(t.url, s, i, this.Se);
                this.Ue(n, t.trigger, e, null);
            });
        });
        if (!this.$e && t) {
            return this.load(this.Oe.getPath(), {
                historyStrategy: this.options.historyStrategy !== "none" ? "replace" : "none"
            });
        }
    }
    stop() {
        this.Oe.stopListening();
        this.Te?.dispose();
    }
    load(t, e) {
        return o(this.createViewportInstructions(t, e ?? null), t => this.Ue(t, "api", null, null));
    }
    isActive(t, e) {
        const s = this.Le(e);
        const i = t instanceof ViewportInstructionTree ? t : this.createViewportInstructions(t, {
            context: s,
            historyStrategy: this.options.historyStrategy
        });
        return this.routeTree.contains(i, false);
    }
    getRouteContext(t, e, s, i, n, r, a) {
        return o(this.getRouteConfigContext(a, e, s, i, n, r?.routeConfigContext ?? null), e => {
            let s = this.je.get(t);
            if (s === void 0) {
                this.je.set(t, s = new WeakMap);
            }
            let n = s.get(e);
            if (n !== void 0) {
                return n;
            }
            const r = i.has(at, true) ? i.get(at) : null;
            s.set(e, n = new RouteContext(t, r, i, this, e, this.Oe));
            return n;
        });
    }
    getRouteConfigContext(t, e, s, i, n, r) {
        return o(t instanceof RouteConfig && !t.X ? t : resolveRouteConfiguration(typeof s?.getRouteConfig === "function" ? s : e.Type, false, n, null, r), t => {
            let s = this.Me.get(t);
            if (s != null) return s;
            s = new RouteConfigContext(r, e, t, i, this);
            this.Me.set(t, s);
            return s;
        });
    }
    generatePath(t, e) {
        return o(this.createViewportInstructions(createEagerInstructions(t), {
            context: e ?? this.Se
        }, true), t => t.toUrl(true, this.options.Be));
    }
    createViewportInstructions(t, e, s) {
        if (t instanceof ViewportInstructionTree) return t;
        let i = e?.context ?? null;
        if (i !== null) i = e.context = this.Le(i);
        return (i ?? this.Ce).createViewportInstructions(t, e, s);
    }
    Ue(t, e, s, i) {
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
            c = new Promise(function(t, e) {
                o = t;
                a = e;
            });
        } else {
            c = i.promise;
            o = i.resolve;
            a = i.reject;
        }
        const h = this._e = Transition.Z({
            id: ++this.Ie,
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
            routeTree: this.be = this.routeTree.it(),
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
        return h.promise.then(t => t).catch(t => {
            error(r, 3270, h, t);
            if (h.erredWithUnknownRoute) {
                this.ze(h);
            } else {
                this.ke = false;
                this.T.publish(new NavigationErrorEvent(h.id, h.instructions, t));
                if (u) {
                    this.ze(h);
                } else {
                    const t = this._e;
                    if (t !== null) {
                        t.previousRouteTree = h.previousRouteTree;
                    } else {
                        this.be = h.previousRouteTree;
                    }
                }
            }
            throw t;
        });
    }
    te(t) {
        this.currentTr = t;
        this._e = null;
        this.ke = true;
        for (const t of this.Ae) {
            t.routeConfigContext.ot();
        }
        let e = this.Le(t.options.context);
        this.T.publish(new NavigationStartEvent(t.id, t.instructions, t.trigger, t.managedState));
        if (this._e !== null) {
            return this.te(this._e);
        }
        t.te(() => {
            const s = t.finalInstructions;
            const i = this.Se;
            const r = t.routeTree;
            r.options = s.options;
            r.queryParams = i.node.ce.queryParams = s.queryParams;
            r.fragment = i.node.ce.fragment = s.fragment;
            const a = /*@__PURE__*/ e.container.get(n).scopeTo("RouteTree");
            if (s.isAbsolute) {
                e = i;
            }
            if (e === i) {
                r.root.ge(r);
                i.node = r.root;
            }
            const c = e.routeConfigContext.allResolved instanceof Promise ? " - awaiting promise" : "";
            a.trace(`updateRouteTree(rootCtx:%s,rt:%s,vit:%s)${c}`, i, r, s);
            return o(e.routeConfigContext.allResolved, () => updateNode(a, s, e, i.node));
        }, () => {
            const e = t.previousRouteTree.root.children;
            const s = t.routeTree.root.children;
            const i = mergeDistinct(e, s);
            Batch.C(s => {
                for (const i of e) {
                    i.context.vpa.Qt(t, s);
                }
            })._(e => {
                if (t.guardsResult !== true) {
                    e.N();
                    this.ze(t);
                }
            })._(e => {
                for (const i of s) {
                    i.context.vpa.Yt(t, e);
                }
            })._(e => {
                if (t.guardsResult !== true) {
                    e.N();
                    this.ze(t);
                }
            })._(s => {
                for (const i of e) {
                    i.context.vpa.Xt(t, s);
                }
            })._(e => {
                for (const i of s) {
                    i.context.vpa.Zt(t, e);
                }
            })._(e => {
                for (const s of i) {
                    s.context.vpa.ie(t, e);
                }
            })._(e => {
                if (t.guardsResult !== true) {
                    e.N();
                    this.ze(t);
                }
            })._(() => {
                i.forEach(function(t) {
                    t.context.vpa.ae();
                });
                this.$e = true;
                this.xe = t.finalInstructions = t.routeTree.me();
                this.ke = false;
                const e = t.finalInstructions.toUrl(true, this.options.Be);
                switch (t.options.De(this.xe)) {
                  case "none":
                    break;

                  case "push":
                    this.Oe.pushState(toManagedState(t.options.state, t.id), this.updateTitle(t), e);
                    break;

                  case "replace":
                    this.Oe.replaceState(toManagedState(t.options.state, t.id), this.updateTitle(t), e);
                    break;
                }
                this.T.publish(new NavigationEndEvent(t.id, t.instructions, this.xe));
                t.resolve(true);
                this.He();
            }).C();
        });
    }
    updateTitle(t = this.currentTr) {
        const e = this.qe(t);
        if (e.length > 0) {
            this.Ve.document.title = e;
        }
        return this.Ve.document.title;
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
    Ge(t) {
        this.Ae.push(t);
    }
    Fe(t) {
        const e = this.Ae.indexOf(t);
        if (e > -1) {
            this.Ae.splice(e, 1);
        }
    }
    ze(t) {
        const e = t.previousRouteTree.root.children;
        const s = t.routeTree.root.children;
        const i = mergeDistinct(e, s);
        i.forEach(function(t) {
            t.context.vpa.oe();
        });
        this.xe = t.prevInstructions;
        this.be = t.previousRouteTree;
        this.ke = false;
        const n = t.guardsResult;
        this.T.publish(new NavigationCancelEvent(t.id, t.instructions, `guardsResult is ${n}`));
        if (n === false) {
            t.resolve(false);
            this.He();
        } else {
            let e;
            if (this.$e && (t.erredWithUnknownRoute || t.error != null && this.options.restorePreviousRouteTreeOnError)) e = t.prevInstructions; else if (n === true) return; else e = n;
            void o(this.Ue(e, "api", t.managedState, t), () => {});
        }
    }
    He() {
        if (this._e === null) return;
        this.Ve.taskQueue.queueTask(() => {
            const t = this._e;
            if (t === null) return;
            try {
                this.te(t);
            } catch (e) {
                t.Jt(e);
            }
        });
    }
}

function updateNode(t, e, s, i) {
    t.trace(`updateNode(ctx:%s,node:%s)`, s, i);
    i.queryParams = e.queryParams;
    i.fragment = e.fragment;
    if (!i.context.routeConfigContext.isRoot) {
        i.context.vpa.ne(i.ce.options, i);
    }
    if (i.context === s) {
        i.de();
        return o(c(...e.children.map(e => createAndAppendNodes(t, i, e))), () => c(...s.getAvailableViewportAgents().reduce((e, s) => {
            const n = s.viewport;
            const r = n.default;
            if (r === null) return e;
            e.push(createAndAppendNodes(t, i, ViewportInstruction.create({
                component: r,
                viewport: n.name
            })));
            return e;
        }, [])));
    }
    return c(...i.children.map(i => updateNode(t, e, s, i)));
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
        return new ParsedUrl(t, i ?? et, e);
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
    e ??= et;
    let n = e.toString();
    n = n === "" ? "" : `?${n}`;
    const r = s != null && s.length > 0 ? `#${encodeURIComponent(s)}` : "";
    return `${i}${n}${r}`;
}

const it = Object.freeze({
    parse(t) {
        return ParsedUrl.Z(t);
    },
    stringify(t, e, s) {
        return stringify(t, e, s);
    }
});

const nt = Object.freeze({
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

const rt = /*@__PURE__*/ e.createInterface("RouterOptions");

class RouterOptions {
    constructor(t, e, s, i, n, r, o) {
        this.useUrlFragmentHash = t;
        this.useHref = e;
        this.historyStrategy = s;
        this.buildTitle = i;
        this.useNavigationModel = n;
        this.activeClass = r;
        this.restorePreviousRouteTreeOnError = o;
        this.Be = t ? nt : it;
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
    De(t) {
        return valueOrFuncToValue(t, this.historyStrategy);
    }
}

const ot = "default";

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
        const i = e.length === 0 || s === null || s.length === 0 || s === ot ? "" : `@${s}`;
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

function stringifyParams(t) {
    if (t === null) return "";
    const e = Object.keys(t);
    const s = e.length;
    if (s === 0) return "";
    const i = Array(s);
    const n = [];
    const r = [];
    for (const t of e) {
        if (p(t)) {
            n.push(Number(t));
        } else {
            r.push(t);
        }
    }
    for (let e = 0; e < s; ++e) {
        const s = n.indexOf(e);
        if (s > -1) {
            i[e] = t[e];
            n.splice(s, 1);
        } else {
            const s = r.shift();
            i[e] = `${s}=${t[s]}`;
        }
    }
    return `(${i.join(",")})`;
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
    static create(t, e, s, i, n) {
        s = s instanceof NavigationOptions ? s : NavigationOptions.create(e, s ?? u);
        let r = s.context;
        if (!(r instanceof RouteContext) && i != null) {
            r = s.context = RouteContext.resolve(i, r);
        }
        const a = r != null;
        if (t instanceof Array) {
            const e = t.length;
            const i = new Array(e);
            const h = new URLSearchParams(s.queryParams ?? u);
            const l = new Array(e);
            for (let s = 0; s < e; s++) {
                const e = t[s];
                l[s] = o(a ? r.routeConfigContext.Ee(e, n) : null, t => {
                    if (t !== null) {
                        i[s] = t.vi;
                        mergeURLSearchParams(h, t.query, false);
                    } else {
                        i[s] = ViewportInstruction.create(e);
                    }
                });
            }
            return o(c(...l), () => new ViewportInstructionTree(s, false, i, h, s.fragment));
        }
        if (typeof t === "string") {
            const i = RouteExpression.parse(e.Be.parse(t));
            return i.toInstructionTree(s);
        }
        return o(a ? r.routeConfigContext.Ee(isPartialViewportInstruction(t) ? {
            ...t,
            params: t.params ?? u
        } : {
            component: t,
            params: u
        }, n) : null, e => {
            const i = new URLSearchParams(s.queryParams ?? u);
            return e !== null ? new ViewportInstructionTree(s, false, [ e.vi ], mergeURLSearchParams(i, e.query, false), s.fragment) : new ViewportInstructionTree(s, false, [ ViewportInstruction.create(t) ], i, s.fragment);
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
    toUrl(t, e) {
        let s = "";
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
            s = t.join("/");
        }
        const i = this.toPath();
        return e.stringify(s.length > 0 ? `${s}/${i}` : i, this.queryParams, this.fragment);
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
            return `VM(name:'${S.getDefinition(this.value.constructor).name}')`;

          case 1:
            return this.value.toString();

          case 0:
            return `'${this.value}'`;
        }
    }
}

class ComponentAgent {
    constructor(t, e, s, i, r) {
        this.We = t;
        this.Qe = e;
        this.re = s;
        this.Se = i;
        this.Je = r;
        this.L = e.container.get(n).scopeTo(`ComponentAgent<${i.routeConfigContext.Bt}>`);
        const o = e.lifecycleHooks;
        this.Ye = (o.canLoad ?? []).map(t => t.instance);
        this.Ke = (o.loading ?? []).map(t => t.instance);
        this.Xe = (o.canUnload ?? []).map(t => t.instance);
        this.Ze = (o.unloading ?? []).map(t => t.instance);
        this.ts = "canLoad" in t;
        this.es = "loading" in t;
        this.ss = "canUnload" in t;
        this.ns = "unloading" in t;
    }
    Dt(t, e) {
        const s = this.Qe;
        const i = this.Se.vpa.hostController;
        switch (s.mountTarget) {
          case x.host:
          case x.shadowRoot:
            i.host.appendChild(s.host);
            break;

          case x.location:
            i.host.append(s.location.$start, s.location);
            break;

          case x.none:
            throw new Error("Invalid mount target for routed component");
        }
        if (t === null) {
            return this.Qe.activate(this.Qe, e);
        }
        void this.Qe.activate(t, e);
    }
    Gt(t, e) {
        const s = this.Qe;
        s.host?.remove();
        s.location?.remove();
        s.location?.$start?.remove();
        if (t === null) {
            return s.deactivate(s, e);
        }
        void s.deactivate(t, e);
    }
    ee() {
        this.Qe.dispose();
    }
    Qt(t, e, s) {
        s.N();
        let i = Promise.resolve();
        for (const n of this.Xe) {
            s.N();
            i = i.then(() => new Promise(i => {
                if (t.guardsResult !== true) {
                    s.$();
                    i();
                    return;
                }
                t.te(() => n.canUnload(this.We, e, this.re), e => {
                    if (t.guardsResult === true && e === false) {
                        t.guardsResult = false;
                    }
                    s.$();
                    i();
                });
            }));
        }
        if (this.ss) {
            s.N();
            i = i.then(() => {
                if (t.guardsResult !== true) {
                    s.$();
                    return;
                }
                t.te(() => this.We.canUnload(e, this.re), e => {
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
        const i = this.Se.root;
        s.N();
        let n = Promise.resolve();
        for (const r of this.Ye) {
            s.N();
            n = n.then(() => new Promise(n => {
                if (t.guardsResult !== true) {
                    s.$();
                    n();
                    return;
                }
                t.te(() => r.canLoad(this.We, e.params, e, this.re), e => {
                    if (t.guardsResult === true && e != null && e !== true) {
                        t.guardsResult = e === false ? false : ViewportInstructionTree.create(e, this.Je, null, i);
                    }
                    s.$();
                    n();
                });
            }));
        }
        if (this.ts) {
            s.N();
            n = n.then(() => {
                if (t.guardsResult !== true) {
                    s.$();
                    return;
                }
                t.te(() => this.We.canLoad(e.params, e, this.re), e => {
                    if (t.guardsResult === true && e != null && e !== true) {
                        t.guardsResult = e === false ? false : ViewportInstructionTree.create(e, this.Je, null, i);
                    }
                    s.$();
                });
            });
        }
        s.$();
    }
    Xt(t, e, s) {
        s.N();
        for (const i of this.Ze) {
            t.te(() => {
                s.N();
                return i.unloading(this.We, e, this.re);
            }, () => {
                s.$();
            });
        }
        if (this.ns) {
            t.te(() => {
                s.N();
                return this.We.unloading(e, this.re);
            }, () => {
                s.$();
            });
        }
        s.$();
    }
    Zt(t, e, s) {
        s.N();
        for (const i of this.Ke) {
            t.te(() => {
                s.N();
                return i.loading(this.We, e.params, e, this.re);
            }, () => {
                s.$();
            });
        }
        if (this.es) {
            t.te(() => {
                s.N();
                return this.We.loading(e.params, e, this.re);
            }, () => {
                s.$();
            });
        }
        s.$();
    }
}

const at = /*@__PURE__*/ e.createInterface("IRouteContext");

const ct = Object.freeze([ "string", "object", "function" ]);

function isEagerInstruction(t) {
    if (t == null) return false;
    const e = t.params;
    const s = t.component;
    return typeof e === "object" && e !== null && s != null && ct.includes(typeof s) && !(s instanceof Promise) && !(s instanceof NavigationStrategy);
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
        if (e == null || !ct.includes(typeof e) || e instanceof Promise || e instanceof NavigationStrategy) return null;
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
        const t = this.rs;
        if (t === null) throw new Error(getMessage(3171, this));
        return t;
    }
    set node(t) {
        const e = this.cs = this.rs;
        if (e !== t) {
            this.rs = t;
        }
    }
    get vpa() {
        const t = this.us;
        if (t === null) throw new Error(getMessage(3172, this));
        return t;
    }
    constructor(t, e, s, i, r, o) {
        this.parent = e;
        this.ls = i;
        this.routeConfigContext = r;
        this.Oe = o;
        this.ps = [];
        this.cs = null;
        this.rs = null;
        this.us = t;
        if (e === null) {
            this.root = this;
        } else {
            this.root = e.root;
        }
        this.L = s.get(n).scopeTo(`RouteContext<${this.routeConfigContext.Bt}>`);
        this.ls.Ge(this);
        const a = this.container = s.createChild();
        this.p = a.get(N);
        a.registerResolver(k, this.gs = new g, true);
        const c = new g("IRouteContext", this);
        a.registerResolver(at, c);
        a.registerResolver(RouteContext, c);
        if (i.options.useNavigationModel) {
            a.get(G).subscribe("au:router:navigation-end", () => {
                r.navigationModel.ds(i, this);
            });
        }
    }
    static setRoot(t) {
        const e = t.get(n).scopeTo("RouteContext");
        if (!t.has($, true)) {
            logAndThrow(new Error(getMessage(3167)), e);
        }
        if (t.has(at, true)) {
            logAndThrow(new Error(getMessage(3168)), e);
        }
        const {controller: s} = t.get($);
        if (s === void 0) {
            logAndThrow(new Error(getMessage(3169)), e);
        }
        const i = t.get(st);
        return o(i.getRouteContext(null, s.definition, s.viewModel, s.container, null, null, null), e => {
            t.register(f.instance(at, e));
            e.node = i.routeTree.root;
        });
    }
    static resolve(t, e) {
        const s = t.container;
        const i = s.get(n).scopeTo("RouteContext");
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
                return t.container.get(at);
            } catch (t) {
                error(i, 3155, e.nodeName, t);
                throw t;
            }
        }
        if (v(e)) {
            const t = e.$controller;
            return t.container.get(at);
        }
        if (I(e)) {
            const t = e;
            return t.container.get(at);
        }
        logAndThrow(new Error(getMessage(3170, Object.prototype.toString.call(e))), i);
    }
    dispose() {
        this.container.dispose();
        this.ls.Fe(this);
    }
    ye(t) {
        const e = this.ps.find(e => e.Ft(t));
        if (e === void 0) throw new Error(getMessage(3174, t, this.ws()));
        return e;
    }
    getAvailableViewportAgents() {
        return this.ps.filter(t => t.Wt());
    }
    getFallbackViewportAgent(t) {
        return this.ps.find(e => e.Wt() && e.viewport.name === t && e.viewport.fallback !== "") ?? null;
    }
    Kt(t, e) {
        this.gs.prepare(t);
        const s = this.container.createChild({
            inheritParentResources: true
        });
        const i = this.p;
        const n = e.component;
        const r = i.document.createElement(n.name);
        _(s, r, i);
        const a = s.invoke(n.Type);
        const c = this.routeConfigContext.Es ? void 0 : o(resolveRouteConfiguration(a, false, this.routeConfigContext.config, e, null), t => this.routeConfigContext.ys(t));
        return o(c, () => {
            const t = b.$el(s, a, r, {
                projections: null
            }, n);
            const i = new ComponentAgent(a, t, e, this, this.ls.options);
            this.gs.dispose();
            return i;
        });
    }
    generateRootedPath(t) {
        return o(this.createViewportInstructions(createEagerInstructions(t), null, true), t => {
            const e = t.toUrl(true, this.ls.options.Be);
            let s = "";
            const i = [];
            let n = t.options.context;
            while (!n.isRoot) {
                const t = n.vpa?.Mt?.instruction?.toUrlComponent(false);
                if ((t?.length ?? 0) !== 0) i.unshift(t);
                n = n.parent;
            }
            s = i.join("/");
            return s.length === 0 ? e : `${s}/${e}`;
        });
    }
    generateRelativePath(t) {
        return o(this.createViewportInstructions(createEagerInstructions(t), null, true), t => t.toUrl(true, this.ls.options.Be));
    }
    createViewportInstructions(e, s, i) {
        if (e instanceof ViewportInstructionTree) return e;
        let n = s?.context ?? this;
        let r = false;
        if (!t(e)) {
            e = processStringInstruction.call(this, e);
        } else {
            const t = e.length;
            for (let s = 0; s < t; ++s) {
                e[s] = processStringInstruction.call(this, e[s]);
            }
        }
        const o = this.ls.options;
        return ViewportInstructionTree.create(e, o, NavigationOptions.create(o, {
            ...s,
            context: n
        }), this.root, i);
        function processStringInstruction(t) {
            if (typeof t === "string") t = this.Oe.removeBaseHref(t);
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
    Rs(t) {
        const e = ViewportAgent.for(t, this);
        if (this.ps.includes(e)) {
            return e;
        }
        this.ps.push(e);
        return e;
    }
    Ss(t) {
        const e = ViewportAgent.for(t, this);
        if (!this.ps.includes(e)) {
            return;
        }
        this.ps.splice(this.ps.indexOf(e), 1);
    }
    toString() {
        const t = this.ps;
        const e = t.map(String).join(",");
        return `RC(path:'${this.routeConfigContext.Bt}',viewports:[${e}])`;
    }
    ws() {
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
        return this.Cs;
    }
    get allResolved() {
        return this.bs;
    }
    constructor(t, e, s, i, r) {
        this.parent = t;
        this.component = e;
        this.config = s;
        this.ls = r;
        this.Es = false;
        this.childRoutes = [];
        this.bs = null;
        if (t === null) {
            this.root = this;
            this.path = [ this ];
            this.Bt = e.name;
        } else {
            this.root = t.root;
            this.path = [ ...t.path, this ];
            this.Bt = `${t.Bt}/${e.name}`;
        }
        this.L = i.get(n).scopeTo(`RouteConfigContext<${this.Bt}>`);
        this.Ns = i.get(d);
        this.container = i.createChild();
        this.xs = new U;
        if (r.options.useNavigationModel) {
            this.Cs = new NavigationModel([]);
        } else {
            this.Cs = null;
        }
        this.ys(s);
    }
    ot() {
        this.config.ot();
        for (const t of this.childRoutes) {
            if (t instanceof Promise) continue;
            t.ot();
        }
    }
    ys(t) {
        const e = [];
        const s = t.routes ?? Q;
        const i = s.length;
        if (i === 0) {
            const e = t.component.prototype?.getRouteConfig;
            this.Es = e == null ? true : typeof e !== "function";
            return;
        }
        const n = this.Cs;
        const o = n !== null;
        let a = 0;
        for (;a < i; a++) {
            const i = s[a];
            if (i instanceof Promise) {
                e.push(this.ks(i));
                continue;
            }
            const c = resolveRouteConfiguration(i, true, t, null, this);
            if (c instanceof Promise) {
                if (!isPartialChildRouteConfig(i) || i.path == null) throw new Error(getMessage(3173));
                for (const t of ensureArrayOfStrings(i.path)) {
                    this.$s(t, i.caseSensitive ?? false, c);
                }
                const t = this.childRoutes.length;
                const s = c.then(e => this.childRoutes[t] = e);
                this.childRoutes.push(s);
                if (o) {
                    n.ks(s);
                }
                e.push(s.then(w));
                continue;
            }
            for (const t of c.path ?? r) {
                this.$s(t, c.caseSensitive, c);
            }
            this.childRoutes.push(c);
            if (o) {
                n.ks(c);
            }
        }
        this.Es = true;
        if (e.length > 0) {
            this.bs = Promise.all(e).then(() => {
                this.bs = null;
            });
        }
    }
    ks(t) {
        return o(resolveRouteConfiguration(t, true, this.config, null, this), t => {
            for (const e of t.path ?? r) {
                this.$s(e, t.caseSensitive, t);
            }
            this.Cs?.ks(t);
            this.childRoutes.push(t);
        });
    }
    $s(t, e, s) {
        this.xs.add({
            path: t,
            caseSensitive: e,
            handler: s
        }, true);
    }
    ct(t) {
        return this.Ns.load(t, e => {
            const s = e.raw;
            if (typeof s === "function") {
                const t = S.isType(s) ? S.getDefinition(s) : null;
                if (t != null) return t;
            }
            let i = void 0;
            let n = void 0;
            for (const t of e.items) {
                const e = S.isType(t.value) ? t.definition : null;
                if (e != null) {
                    if (t.key === "default") {
                        i = e;
                    } else if (n === void 0) {
                        n = e;
                    }
                }
            }
            if (i === void 0 && n === void 0) {
                if (!isPartialCustomElementDefinition(s)) throw new Error(getMessage(3175, t));
                const e = C.create(s);
                S.define(e);
                return e;
            }
            return n ?? i;
        });
    }
    Ee(t, e) {
        if (!isEagerInstruction(t)) return null;
        e ??= false;
        const s = t.component;
        let i;
        let n = false;
        if (s instanceof RouteConfig) {
            i = s.path;
            n = true;
        } else if (typeof s === "string") {
            const t = this.childRoutes.find(t => t.id === s);
            if (t === void 0) return null;
            i = t.path;
        } else if (s.type === 0) {
            const t = this.childRoutes.find(t => t.id === s.value);
            if (t === void 0) return null;
            i = t.path;
        } else {
            const t = resolveCustomElementDefinition(s, this)[1];
            i = this.childRoutes.reduce((e, s) => {
                if (s.component === t.Type) {
                    e.push(...s.path);
                }
                return e;
            }, []);
            n = true;
        }
        if (i === void 0) return null;
        const a = t.params;
        const c = this.xs;
        const h = i.length;
        const l = [];
        let f = null;
        if (h === 1) {
            const e = core(i[0]);
            if (e === null) {
                if (n) throw new Error(getMessage(3166, t, l));
                return null;
            }
            return createPathGenerationResult.call(this, e);
        }
        let p = 0;
        for (let t = 0; t < h; t++) {
            const e = core(i[t]);
            if (e === null) continue;
            if (f === null) {
                f = e;
                p = Object.keys(e.consumed).length;
            } else if (Object.keys(e.consumed).length > p) {
                f = e;
            }
        }
        if (f === null) {
            if (n) throw new Error(getMessage(3166, t, l));
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
                let n = a[e];
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
            const n = Object.fromEntries(Object.entries(a).filter(([t]) => !i.includes(t)));
            return {
                path: t.replace(/\/\//g, "/"),
                endpoint: e,
                consumed: s,
                query: n
            };
        }
        async function generateChildrenInstructions(s) {
            const i = t.children;
            const n = i?.length ?? 0;
            if (n === 0) return {
                instructions: r,
                query: u
            };
            const a = s.component;
            const c = S.isType(a) ? S.getDefinition(a) : resolveCustomElementDefinition(a, this)[1];
            return o(o(this.ls.getRouteConfigContext(s, c, null, this.container, this.config, this), t => o(t.allResolved, () => t)), t => {
                const s = new Array(n);
                const r = new Array(n);
                let a = Object.create(null);
                for (let c = 0; c < n; ++c) {
                    const n = i[c];
                    s[c] = o(t.Ee(isPartialViewportInstruction(n) ? {
                        ...n,
                        params: n.params ?? u
                    } : {
                        component: n,
                        params: u
                    }, e), t => {
                        if (t == null) throw new Error(getMessage(3166, n));
                        r[c] = t.vi;
                        a = mergeQueryParams(a, t.query);
                    });
                }
                return o(Promise.all(s), () => ({
                    instructions: r,
                    query: a
                }));
            });
        }
        function createPathGenerationResult(s) {
            return o(e ? generateChildrenInstructions.call(this, s.endpoint.route.handler) : {
                instructions: t.children,
                query: u
            }, ({instructions: e, query: i}) => ({
                vi: ViewportInstruction.create({
                    recognizedRoute: new $RecognizedRoute(new M(s.endpoint, s.consumed), null),
                    component: s.path,
                    children: e,
                    viewport: t.viewport,
                    open: t.open,
                    close: t.close
                }),
                query: mergeQueryParams(s.query, i)
            }));
        }
    }
    recognize(t, e = false) {
        let s = this;
        let i = true;
        let n = null;
        while (i) {
            n = s.xs.recognize(t);
            if (n === null) {
                if (!e || s.isRoot) return null;
                s = s.parent;
            } else {
                i = false;
            }
        }
        return new $RecognizedRoute(n, Reflect.has(n.params, O) ? n.params[O] ?? null : null);
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
        this.Is = void 0;
    }
    resolve() {
        return o(this.Is, w);
    }
    ds(t, e) {
        void o(this.Is, () => {
            for (const s of this.routes) {
                s.ds(t, e);
            }
        });
    }
    ks(t) {
        const e = this.routes;
        if (!(t instanceof Promise)) {
            if ((t.nav ?? false) && t.redirectTo === null) {
                e.push(NavigationRoute.Z(t));
            }
            return;
        }
        const s = e.length;
        e.push(void 0);
        let i = void 0;
        i = this.Is = o(this.Is, () => o(t, t => {
            if (t.nav && t.redirectTo === null) {
                e[s] = NavigationRoute.Z(t);
            } else {
                e.splice(s, 1);
            }
            if (this.Is === i) {
                this.Is = void 0;
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
        this._s = null;
    }
    static Z(t) {
        return new NavigationRoute(t.id, ensureArrayOfStrings(t.path ?? r), t.title, t.data);
    }
    get isActive() {
        return this.Pt;
    }
    ds(t, e) {
        let s = this._s;
        if (s === null) {
            const i = t.options;
            s = this._s = this.path.map(t => {
                const s = e.routeConfigContext.xs.getEndpoint(t);
                if (s === null) throw new Error(getMessage(3450, t));
                return new ViewportInstructionTree(NavigationOptions.create(i, {
                    context: e
                }), false, [ ViewportInstruction.create({
                    recognizedRoute: new $RecognizedRoute(new M(s, u), null),
                    component: t
                }) ], et, null);
            });
        }
        this.Pt = s.some(e => t.routeTree.contains(e, true));
    }
}

class ViewportCustomElement {
    constructor() {
        this.name = ot;
        this.usedBy = "";
        this.default = "";
        this.fallback = "";
        this.Ts = void 0;
        this.Qe = void 0;
        this.Se = s(at);
        this.L = s(n).scopeTo(`au-viewport<${this.Se.routeConfigContext.Bt}>`);
    }
    nt(t, e, s) {
        const i = this.fallback;
        return typeof i === "function" && !S.isType(i) ? i(t, e, s) : i;
    }
    hydrated(t) {
        this.Qe = t;
        this.Ts = this.Se.Rs(this);
    }
    attaching(t, e) {
        return this.Ts.zt(t, this.Qe);
    }
    detaching(t, e) {
        return this.Ts.qt(t, this.Qe);
    }
    dispose() {
        this.Se.Ss(this);
        this.Ts.ee();
        this.Ts = void 0;
    }
    toString() {
        const t = [];
        for (const e of ut) {
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

const ut = [ "name", "usedBy", "default", "fallback" ];

class LoadCustomAttribute {
    constructor() {
        this.Ps = s(P);
        this.ls = s(st);
        this.Se = s(at);
        this.T = s(G);
        this.Oe = s(W);
        this.attribute = "href";
        this.active = false;
        this.As = null;
        this.xe = null;
        this.Vs = null;
        this.onClick = t => {
            if (this.xe === null) {
                return;
            }
            if (t.altKey || t.ctrlKey || t.shiftKey || t.metaKey || t.button !== 0) {
                return;
            }
            t.preventDefault();
            void this.ls.load(this.xe, {
                context: this.context
            });
        };
        const t = this.Ps;
        this.Os = !t.hasAttribute("external") && !t.hasAttribute("data-external");
        this.Ms = this.ls.options.activeClass;
    }
    binding() {
        if (this.Os) {
            this.Ps.addEventListener("click", this.onClick);
        }
        this.valueChanged();
        this.Vs = this.T.subscribe("au:router:navigation-end", t => {
            const e = this.active = this.xe !== null && this.ls.isActive(this.xe, this.context);
            const s = this.Ms;
            if (s === null) return;
            this.Ps.classList.toggle(s, e);
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
        if (this.Os) {
            this.Ps.removeEventListener("click", this.onClick);
        }
        this.Vs.dispose();
    }
    valueChanged() {
        const t = this.ls;
        const e = t.options;
        const s = this.route;
        let i = this.context;
        if (i === void 0) {
            i = this.context = this.Se;
        } else if (i === null) {
            i = this.context = this.Se.root;
        }
        if (s != null && i.routeConfigContext.allResolved === null) {
            const n = this.params;
            const r = this.xe = t.createViewportInstructions(typeof n === "object" && n !== null ? {
                component: s,
                params: n
            } : s, {
                context: i
            });
            this.As = r.toUrl(false, e.Be);
        } else {
            this.xe = null;
            this.As = null;
        }
        const n = S.for(this.Ps, {
            optional: true
        });
        if (n !== null) {
            n.viewModel[this.attribute] = this.xe;
        } else {
            if (this.As === null) {
                this.Ps.removeAttribute(this.attribute);
            } else {
                const t = e.useUrlFragmentHash ? this.As : this.Oe.addBaseHref(this.As);
                this.Ps.setAttribute(this.attribute, t);
            }
        }
    }
}

T.define({
    name: "load",
    bindables: {
        route: {
            mode: D,
            primary: true,
            callback: "valueChanged"
        },
        params: {
            mode: D,
            callback: "valueChanged"
        },
        attribute: {
            mode: D
        },
        active: {
            mode: H
        },
        context: {
            mode: D,
            callback: "valueChanged"
        }
    }
}, LoadCustomAttribute);

class HrefCustomAttribute {
    get js() {
        return this.Ps.hasAttribute("external") || this.Ps.hasAttribute("data-external");
    }
    constructor() {
        this.Ps = s(P);
        this.ls = s(st);
        this.Se = s(at);
        this.Ls = false;
        if (this.ls.options.useHref && this.Ps.nodeName === "A") {
            const t = s(R).name;
            switch (this.Ps.getAttribute("target")) {
              case null:
              case t:
              case "_self":
                this.Os = true;
                break;

              default:
                this.Os = false;
                break;
            }
        } else {
            this.Os = false;
        }
    }
    binding() {
        if (!this.Ls) {
            this.Ls = true;
            this.Os = this.Os && A.get(this.Ps, T.getDefinition(LoadCustomAttribute).key) === null;
        }
        this.valueChanged(this.value);
        this.Ps.addEventListener("click", this);
    }
    unbinding() {
        this.Ps.removeEventListener("click", this);
    }
    valueChanged(t) {
        if (t == null) {
            this.Ps.removeAttribute("href");
        } else {
            if (this.ls.options.useUrlFragmentHash && this.Se.routeConfigContext.isRoot && !/^[.#]/.test(t) && !this.js) {
                t = `#${t}`;
            }
            this.Ps.setAttribute("href", t);
        }
    }
    handleEvent(t) {
        this.Us(t);
    }
    Us(t) {
        if (t.altKey || t.ctrlKey || t.shiftKey || t.metaKey || t.button !== 0 || this.js || !this.Os) {
            return;
        }
        const e = this.Ps.getAttribute("href");
        if (e !== null) {
            t.preventDefault();
            void this.ls.load(e, {
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
            mode: D
        }
    }
};

const ht = st;

const lt = [ ht ];

const ft = ViewportCustomElement;

const pt = LoadCustomAttribute;

const gt = HrefCustomAttribute;

const dt = [ ViewportCustomElement, LoadCustomAttribute, HrefCustomAttribute ];

function configure(t, e) {
    let s = null;
    if (h(e)) {
        s = e.basePath ?? null;
    } else {
        e = {};
    }
    const i = RouterOptions.create(e);
    return t.register(f.cachedCallback(F, (t, e, i) => {
        const n = t.get(R);
        const r = new URL(n.document.baseURI);
        r.pathname = normalizePath(s ?? r.pathname);
        return r;
    }), f.instance(rt, i), f.instance(RouterOptions, i), V.creating(st, t => {}), V.hydrated(l, RouteContext.setRoot), V.activated(st, t => t.start(true)), V.deactivated(st, t => t.stop()), ...lt, ...dt);
}

const wt = {
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
        this.Ps = t;
        this.Bs = t.scrollTop;
        this.zs = t.scrollLeft;
    }
    static Ds(t) {
        return t.scrollTop > 0 || t.scrollLeft > 0;
    }
    Hs() {
        this.Ps.scrollTo(this.zs, this.Bs);
        this.Ps = null;
    }
}

function restoreState(t) {
    t.Hs();
}

class HostElementState {
    constructor(t) {
        this.qs = [];
        this.Gs(t.children);
    }
    Gs(t) {
        let e;
        for (let s = 0, i = t.length; s < i; ++s) {
            e = t[s];
            if (ScrollState.Ds(e)) {
                this.qs.push(new ScrollState(e));
            }
            this.Gs(e.children);
        }
    }
    Hs() {
        this.qs.forEach(restoreState);
        this.qs = null;
    }
}

const mt = /*@__PURE__*/ e.createInterface("IStateManager", t => t.singleton(ScrollStateManager));

class ScrollStateManager {
    constructor() {
        this.Fs = new WeakMap;
    }
    saveState(t) {
        this.Fs.set(t.host, new HostElementState(t.host));
    }
    restoreState(t) {
        const e = this.Fs.get(t.host);
        if (e !== void 0) {
            e.Hs();
            this.Fs.delete(t.host);
        }
    }
}

const vt = /*@__PURE__*/ e.createInterface("ICurrentRoute", t => t.singleton(CurrentRoute));

class CurrentRoute {
    constructor() {
        this.path = "";
        this.url = "";
        this.title = "";
        this.query = new URLSearchParams;
        this.parameterInformation = r;
        const t = s(st);
        const e = t.options;
        s(G).subscribe("au:router:navigation-end", s => {
            const i = s.finalInstructions;
            z(() => {
                this.path = i.toPath();
                this.url = i.toUrl(true, e.Be);
                this.title = t.qe();
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
        const s = Object.create(null);
        Object.assign(s, e?.params ?? t.params);
        Reflect.deleteProperty(s, O);
        return new ParameterInformation(e?.endpoint.route.handler ?? null, t.viewport, s, t.children.map(t => this.create(t)));
    }
}

export { X as AST, q as AuNavId, ComponentExpression, CompositeSegmentExpression, lt as DefaultComponents, dt as DefaultResources, HrefCustomAttribute, gt as HrefCustomAttributeRegistration, vt as ICurrentRoute, W as ILocationManager, at as IRouteContext, st as IRouter, G as IRouterEvents, rt as IRouterOptions, mt as IStateManager, LoadCustomAttribute, pt as LoadCustomAttributeRegistration, LocationChangeEvent, NavigationCancelEvent, NavigationEndEvent, NavigationErrorEvent, NavigationOptions, NavigationStartEvent, NavigationStrategy, ParameterExpression, ParameterListExpression, J as Route, RouteConfig, RouteContext, RouteExpression, RouteNode, RouteTree, Router, wt as RouterConfiguration, RouterOptions, ht as RouterRegistration, ScopedSegmentExpression, SegmentExpression, SegmentGroupExpression, Transition, ViewportAgent, ViewportCustomElement, ft as ViewportCustomElementRegistration, ViewportExpression, nt as fragmentUrlParser, isManagedState, it as pathUrlParser, route, toManagedState };

