import { DI as t, resolve as e, IEventAggregator as s, ILogger as i, emptyArray as n, onResolve as r, getResourceKeyFor as o, onResolveAll as a, emptyObject as c, isObjectOrFunction as u, IContainer as h, Registration as l, isArrayIndex as f, IModuleLoader as p, InstanceProvider as g, noop as d } from "@aurelia/kernel";

import { BindingMode as w, isCustomElementViewModel as m, IHistory as v, ILocation as E, IWindow as R, CustomElement as y, Controller as b, IPlatform as S, CustomElementDefinition as C, IController as x, IAppRoot as N, isCustomElementController as k, registerHostNode as $, CustomAttribute as _, INode as T, getRef as I, AppTask as P } from "@aurelia/runtime-html";

import { RESIDUE as V, RecognizedRoute as A, Endpoint as O, ConfigurableRoute as M, RouteRecognizer as j } from "@aurelia/route-recognizer";

import { Metadata as L } from "@aurelia/metadata";

import { batch as U } from "@aurelia/runtime";

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

const z = w.toView;

const B = w.fromView;

function isNotNullishOrTypeOrViewModel(t) {
    return typeof t === "object" && t !== null && !m(t);
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
        if (t instanceof Promise) {
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
        if (!m(t) && !isPartialCustomElementDefinition(t)) {
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

const H = "au-nav-id";

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

const D = /*@__PURE__*/ t.createInterface("IRouterEvents", (t => t.singleton(RouterEvents)));

class RouterEvents {
    constructor() {
        this.M = 0;
        this.O = [];
        this.j = e(s);
        this.L = e(i).scopeTo("RouterEvents");
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

const q = /*@__PURE__*/ t.createInterface("IBaseHref");

const F = /*@__PURE__*/ t.createInterface("ILocationManager", (t => t.singleton(BrowserLocationManager)));

class BrowserLocationManager {
    constructor() {
        this.U = 0;
        this.L = e(i).root.scopeTo("LocationManager");
        this.I = e(D);
        this.B = e(v);
        this.l = e(E);
        this.H = e(R);
        this.q = e(q);
        this.F = e(it).useUrlFragmentHash ? "hashchange" : "popstate";
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

const G = n;

class RouteConfig {
    get path() {
        const t = this.G;
        if (t.length > 0) return t;
        const e = y.getDefinition(this.component);
        return this.G = [ e.name, ...e.aliases ];
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
        this.component = h;
        this.nav = l;
        this.W = false;
    }
    static J(t, e) {
        if (typeof t === "string" || t instanceof Array) {
            const s = ensureArrayOfStrings(t);
            const i = e?.redirectTo ?? null;
            const n = e?.caseSensitive ?? false;
            const r = ensureString(e?.id ?? (s instanceof Array ? s[0] : s));
            const o = e?.title ?? null;
            const a = e?.transitionPlan ?? null;
            const c = e?.viewport ?? nt;
            const u = e?.data ?? {};
            const h = e?.routes ?? G;
            return new RouteConfig(r, s, o, i, n, a, c, u, h, e?.fallback ?? null, e, e?.nav ?? true);
        } else if (typeof t === "object") {
            const s = t;
            validateRouteConfig(s, "");
            const i = ensureArrayOfStrings(s.path ?? e?.path ?? n);
            const r = s.title ?? e?.title ?? null;
            const o = s.redirectTo ?? e?.redirectTo ?? null;
            const a = s.caseSensitive ?? e?.caseSensitive ?? false;
            const c = s.id ?? e?.id ?? (i instanceof Array ? i[0] : i);
            const u = s.transitionPlan ?? e?.transitionPlan ?? null;
            const h = s.viewport ?? e?.viewport ?? nt;
            const l = {
                ...e?.data,
                ...s.data
            };
            const f = [ ...s.routes ?? G, ...e?.routes ?? G ];
            return new RouteConfig(c, i, r, o, a, u, h, l, f, s.fallback ?? e?.fallback ?? null, s.component ?? e ?? null, s.nav ?? true);
        } else {
            expectType("string, function/class or object", "", t);
        }
    }
    K(t, e) {
        validateRouteConfig(t, this.path[0] ?? "");
        const s = ensureArrayOfStrings(t.path ?? this.path);
        return new RouteConfig(ensureString(t.id ?? this.id ?? s), s, t.title ?? this.title, t.redirectTo ?? this.redirectTo, t.caseSensitive ?? this.caseSensitive, t.transitionPlan ?? this.transitionPlan ?? e?.transitionPlan ?? null, t.viewport ?? this.viewport, t.data ?? this.data, t.routes ?? this.routes, t.fallback ?? this.fallback ?? e?.fallback ?? null, this.component, t.nav ?? this.nav);
    }
    X(t, e, s) {
        if (hasSamePath(t, e) && shallowEquals(t.params, e.params)) return "none";
        if (s != null) return s;
        const i = this.transitionPlan ?? "replace";
        return typeof i === "function" ? i(t, e) : i;
        function cleanPath(t) {
            return t.replace(`/*${V}`, "");
        }
        function hasSamePath(t, e) {
            const s = t.finalPath;
            const i = e.finalPath;
            return s.length === 0 || i.length === 0 || cleanPath(s) === cleanPath(i);
        }
    }
    Y(t, e, s) {
        if (this.W) throw new Error(getMessage(3550));
        if (typeof t.getRouteConfig !== "function") return;
        return r(t.getRouteConfig(e, s), (t => {
            this.W = true;
            if (t == null) return;
            let s = e?.path ?? "";
            if (typeof s !== "string") {
                s = s[0];
            }
            validateRouteConfig(t, s);
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
    Z() {
        return new RouteConfig(this.id, this.path, this.title, this.redirectTo, this.caseSensitive, this.transitionPlan, this.viewport, this.data, this.routes, this.fallback, this.component, this.nav);
    }
    tt(t, e, s) {
        const i = this.fallback;
        return typeof i === "function" && !y.isType(i) ? i(t, e, s) : i;
    }
}

const W = {
    name: /*@__PURE__*/ o("route-configuration"),
    isConfigured(t) {
        return L.has(W.name, t);
    },
    configure(t, e) {
        const s = RouteConfig.J(t, e);
        L.define(s, e, W.name);
        return e;
    },
    getConfig(t) {
        if (!W.isConfigured(t)) {
            W.configure({}, t);
        }
        return L.get(W.name, t);
    }
};

function route(t) {
    return function(e, s) {
        s.addInitializer((function() {
            W.configure(t, this);
        }));
        return e;
    };
}

function resolveRouteConfiguration(t, e, s, i, n) {
    if (isPartialRedirectRouteConfig(t)) return RouteConfig.J(t, null);
    const [o, a] = resolveCustomElementDefinition(t, n);
    return r(a, (n => {
        const a = n.Type;
        const c = W.getConfig(a);
        if (isPartialChildRouteConfig(t)) return c.K(t, s);
        if (e) return c.Z();
        if (!c.W && o.type === 4 && typeof t.getRouteConfig === "function") {
            return r(c.Y(t, s, i), (() => c));
        }
        return c;
    }));
}

function resolveCustomElementDefinition(t, e) {
    const s = createNavigationInstruction(t);
    let i;
    switch (s.type) {
      case 0:
        {
            if (e == null) throw new Error(getMessage(3551));
            const t = y.find(e.container, s.value);
            if (t === null) throw new Error(getMessage(3552, s.value, e));
            i = t;
            break;
        }

      case 2:
        i = s.value;
        break;

      case 4:
        i = y.getDefinition(s.value.constructor);
        break;

      case 3:
        if (e == null) throw new Error(getMessage(3553));
        i = e.et(s.value);
        break;
    }
    return [ s, i ];
}

function createNavigationInstruction(t) {
    return isPartialChildRouteConfig(t) ? createNavigationInstruction(t.component) : TypedNavigationInstruction.create(t);
}

const Q = [ "?", "#", "/", "+", "(", ")", "@", "!", "=", ",", "&", "'", "~", ";" ];

class ParserState {
    get u() {
        return this.st.length === 0;
    }
    constructor(t) {
        this.it = t;
        this.nt = [];
        this.rt = 0;
        this.ot = 0;
        this.st = t;
    }
    ct(...t) {
        const e = this.st;
        return t.some((function(t) {
            return e.startsWith(t);
        }));
    }
    ut(t) {
        if (this.ct(t)) {
            this.st = this.st.slice(t.length);
            this.ot += t.length;
            this.ht(t);
            return true;
        }
        return false;
    }
    lt(t) {
        if (!this.ut(t)) {
            this.ft(`'${t}'`);
        }
    }
    ft(t) {
        throw new Error(getMessage(3500, t, this.ot, this.it, this.st, this.st));
    }
    gt() {
        if (!this.u) {
            throw new Error(getMessage(3501, this.st, this.ot, this.it));
        }
    }
    dt() {
        const t = this.st[0];
        this.st = this.st.slice(1);
        ++this.ot;
        this.ht(t);
    }
    wt() {
        this.nt[this.rt++] = "";
    }
    vt() {
        const t = --this.rt;
        const e = this.nt;
        const s = e[t];
        e[t] = "";
        return s;
    }
    Et() {
        this.nt[--this.rt] = "";
    }
    ht(t) {
        const e = this.rt;
        const s = this.nt;
        for (let i = 0; i < e; ++i) {
            s[i] += t;
        }
    }
}

const J = new Map;

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
        let s = J.get(e);
        if (s === void 0) {
            J.set(e, s = RouteExpression.Rt(t));
        }
        return s;
    }
    static Rt(t) {
        const e = t.path;
        if (e === "") {
            return new RouteExpression(false, SegmentExpression.Empty, t.query, t.fragment);
        }
        const s = new ParserState(e);
        s.wt();
        const i = s.ut("/");
        const n = CompositeSegmentExpression.yt(s);
        s.gt();
        s.Et();
        return new RouteExpression(i, n, t.query, t.fragment);
    }
    toInstructionTree(t) {
        return new ViewportInstructionTree(t, this.isAbsolute, this.root.bt(0, 0), mergeURLSearchParams(this.queryParams, t.queryParams, true), this.fragment ?? t.fragment);
    }
}

class CompositeSegmentExpression {
    get kind() {
        return "CompositeSegment";
    }
    constructor(t) {
        this.siblings = t;
    }
    static yt(t) {
        t.wt();
        const e = t.ut("+");
        const s = [];
        do {
            s.push(ScopedSegmentExpression.yt(t));
        } while (t.ut("+"));
        if (!e && s.length === 1) {
            t.Et();
            return s[0];
        }
        t.Et();
        return new CompositeSegmentExpression(s);
    }
    bt(t, e) {
        switch (this.siblings.length) {
          case 0:
            return [];

          case 1:
            return this.siblings[0].bt(t, e);

          case 2:
            return [ ...this.siblings[0].bt(t, 0), ...this.siblings[1].bt(0, e) ];

          default:
            return [ ...this.siblings[0].bt(t, 0), ...this.siblings.slice(1, -1).flatMap((function(t) {
                return t.bt(0, 0);
            })), ...this.siblings[this.siblings.length - 1].bt(0, e) ];
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
    static yt(t) {
        t.wt();
        const e = SegmentGroupExpression.yt(t);
        if (t.ut("/")) {
            const s = ScopedSegmentExpression.yt(t);
            t.Et();
            return new ScopedSegmentExpression(e, s);
        }
        t.Et();
        return e;
    }
    bt(t, e) {
        const s = this.left.bt(t, 0);
        const i = this.right.bt(0, e);
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
    static yt(t) {
        t.wt();
        if (t.ut("(")) {
            const e = CompositeSegmentExpression.yt(t);
            t.lt(")");
            t.Et();
            return new SegmentGroupExpression(e);
        }
        t.Et();
        return SegmentExpression.yt(t);
    }
    bt(t, e) {
        return this.expression.bt(t + 1, e + 1);
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
    static yt(t) {
        t.wt();
        const e = ComponentExpression.yt(t);
        const s = ViewportExpression.yt(t);
        const i = !t.ut("!");
        t.Et();
        return new SegmentExpression(e, s, i);
    }
    bt(t, e) {
        return [ ViewportInstruction.create({
            component: this.component.name,
            params: this.component.parameterList.St(),
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
    static yt(t) {
        t.wt();
        t.wt();
        if (!t.u) {
            if (t.ct("./")) {
                t.dt();
            } else if (t.ct("../")) {
                t.dt();
                t.dt();
            } else {
                while (!t.u && !t.ct(...Q)) {
                    t.dt();
                }
            }
        }
        const e = t.vt();
        if (e.length === 0) {
            t.ft("component name");
        }
        const s = ParameterListExpression.yt(t);
        t.Et();
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
    static yt(t) {
        t.wt();
        let e = null;
        if (t.ut("@")) {
            t.wt();
            while (!t.u && !t.ct(...Q)) {
                t.dt();
            }
            e = decodeURIComponent(t.vt());
            if (e.length === 0) {
                t.ft("viewport name");
            }
        }
        t.Et();
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
    static yt(t) {
        t.wt();
        const e = [];
        if (t.ut("(")) {
            do {
                e.push(ParameterExpression.yt(t, e.length));
                if (!t.ut(",")) {
                    break;
                }
            } while (!t.u && !t.ct(")"));
            t.lt(")");
        }
        t.Et();
        return new ParameterListExpression(e);
    }
    St() {
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
    static yt(t, e) {
        t.wt();
        t.wt();
        while (!t.u && !t.ct(...Q)) {
            t.dt();
        }
        let s = t.vt();
        if (s.length === 0) {
            t.ft("parameter key");
        }
        let i;
        if (t.ut("=")) {
            t.wt();
            while (!t.u && !t.ct(...Q)) {
                t.dt();
            }
            i = decodeURIComponent(t.vt());
            if (i.length === 0) {
                t.ft("parameter value");
            }
        } else {
            i = s;
            s = e.toString();
        }
        t.Et();
        return new ParameterExpression(s, i);
    }
}

const K = Object.freeze({
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

const X = new WeakMap;

class ViewportAgent {
    get Ct() {
        return this._state & 16256;
    }
    set Ct(t) {
        this._state = this._state & 127 | t;
    }
    get xt() {
        return this._state & 127;
    }
    set xt(t) {
        this._state = this._state & 16256 | t;
    }
    constructor(t, e, s) {
        this.viewport = t;
        this.hostController = e;
        this.Nt = false;
        this.kt = null;
        this.$t = null;
        this._state = 8256;
        this._t = "replace";
        this.Tt = null;
        this.It = null;
        this.Pt = null;
        this.Vt = null;
        this.L = s.container.get(i).scopeTo(`ViewportAgent<${s.At}>`);
    }
    static for(t, e) {
        let s = X.get(t);
        if (s === void 0) {
            const i = b.getCachedOrThrow(t);
            X.set(t, s = new ViewportAgent(t, i, e));
        }
        return s;
    }
    Ot(t, e) {
        const s = this.Pt;
        if (s !== null) {
            ensureTransitionHasNotErrored(s);
        }
        this.Nt = true;
        switch (this.xt) {
          case 64:
            switch (this.Ct) {
              case 8192:
                return;

              case 4096:
                return this.kt.Mt(t, e);

              default:
                this.jt("activateFromViewport 1");
            }

          case 2:
            {
                if (this.Pt === null) throw new Error(getMessage(3350, this));
                const e = Batch.C((e => {
                    this.Mt(t, this.Pt, e);
                }));
                const s = new Promise((t => {
                    e.T((() => {
                        t();
                    }));
                }));
                return e.C().u ? void 0 : s;
            }

          default:
            this.jt("activateFromViewport 2");
        }
    }
    Lt(t, e) {
        const s = this.Pt;
        if (s !== null) {
            ensureTransitionHasNotErrored(s);
        }
        this.Nt = false;
        switch (this.Ct) {
          case 8192:
            return;

          case 4096:
            return this.kt.Ut(t, e);

          case 128:
            return;

          default:
            {
                if (this.Pt === null) throw new Error(getMessage(3351, this));
                const e = Batch.C((e => {
                    this.Ut(t, this.Pt, e);
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
    zt(t) {
        if (!this.Bt()) {
            return false;
        }
        const e = this.viewport;
        const s = t.viewportName;
        const i = e.name;
        if (s !== nt && i !== s) {
            return false;
        }
        const n = e.usedBy;
        if (n.length > 0 && !n.split(",").includes(t.componentName)) {
            return false;
        }
        return true;
    }
    Bt() {
        if (!this.Nt) {
            return false;
        }
        if (this.xt !== 64) {
            return false;
        }
        return true;
    }
    Ht(t, e) {
        if (this.Pt === null) {
            this.Pt = t;
        }
        ensureTransitionHasNotErrored(t);
        if (t.guardsResult !== true) {
            return;
        }
        e.N();
        void r(this.Vt, (() => {
            Batch.C((e => {
                for (const s of this.Tt.children) {
                    s.context.vpa.Ht(t, e);
                }
            })).T((e => {
                switch (this.Ct) {
                  case 4096:
                    switch (this._t) {
                      case "none":
                        this.Ct = 1024;
                        return;

                      case "invoke-lifecycles":
                      case "replace":
                        this.Ct = 2048;
                        e.N();
                        Batch.C((e => {
                            this.kt.Ht(t, this.It, e);
                        })).T((() => {
                            this.Ct = 1024;
                            e.$();
                        })).C();
                        return;
                    }

                  case 8192:
                    return;

                  default:
                    t.Dt(new Error(`Unexpected state at canUnload of ${this}`));
                }
            })).T((() => {
                e.$();
            })).C();
        }));
    }
    qt(t, e) {
        if (this.Pt === null) {
            this.Pt = t;
        }
        ensureTransitionHasNotErrored(t);
        if (t.guardsResult !== true) {
            return;
        }
        e.N();
        Batch.C((e => {
            switch (this.xt) {
              case 32:
                this.xt = 16;
                switch (this._t) {
                  case "none":
                    return;

                  case "invoke-lifecycles":
                    return this.kt.qt(t, this.It, e);

                  case "replace":
                    e.N();
                    void r(this.It.context.Ft(this.hostController, this.It), (s => {
                        (this.$t = s).qt(t, this.It, e);
                        e.$();
                    }));
                }

              case 64:
                return;

              default:
                this.jt("canLoad");
            }
        })).T((t => {
            const e = this.It;
            switch (this._t) {
              case "none":
              case "invoke-lifecycles":
                {
                    t.N();
                    const s = e.context;
                    void r(s.allResolved, (() => r(r(a(...e.residue.splice(0).map((t => createAndAppendNodes(this.L, e, t)))), (() => a(...s.getAvailableViewportAgents().reduce(((t, s) => {
                        const i = s.viewport;
                        const n = i.default;
                        if (n === null) return t;
                        t.push(createAndAppendNodes(this.L, e, ViewportInstruction.create({
                            component: n,
                            viewport: i.name
                        })));
                        return t;
                    }), [])))), (() => {
                        t.$();
                    }))));
                    return;
                }

              case "replace":
                return;
            }
        })).T((e => {
            switch (this.xt) {
              case 16:
                this.xt = 8;
                for (const s of this.It.children) {
                    s.context.vpa.qt(t, e);
                }
                return;

              case 64:
                return;

              default:
                this.jt("canLoad");
            }
        })).T((() => {
            e.$();
        })).C();
    }
    Gt(t, e) {
        ensureTransitionHasNotErrored(t);
        ensureGuardsResultIsTrue(this, t);
        e.N();
        Batch.C((e => {
            for (const s of this.Tt.children) {
                s.context.vpa.Gt(t, e);
            }
        })).T((s => {
            switch (this.Ct) {
              case 1024:
                switch (this._t) {
                  case "none":
                    this.Ct = 256;
                    return;

                  case "invoke-lifecycles":
                  case "replace":
                    this.Ct = 512;
                    s.N();
                    Batch.C((e => {
                        this.kt.Gt(t, this.It, e);
                    })).T((() => {
                        this.Ct = 256;
                        s.$();
                    })).C();
                    return;
                }

              case 8192:
                for (const s of this.Tt.children) {
                    s.context.vpa.Gt(t, e);
                }
                return;

              default:
                this.jt("unloading");
            }
        })).T((() => {
            e.$();
        })).C();
    }
    Wt(t, e) {
        ensureTransitionHasNotErrored(t);
        ensureGuardsResultIsTrue(this, t);
        e.N();
        Batch.C((e => {
            switch (this.xt) {
              case 8:
                {
                    this.xt = 4;
                    switch (this._t) {
                      case "none":
                        return;

                      case "invoke-lifecycles":
                        return this.kt.Wt(t, this.It, e);

                      case "replace":
                        return this.$t.Wt(t, this.It, e);
                    }
                }

              case 64:
                return;

              default:
                this.jt("loading");
            }
        })).T((e => {
            switch (this.xt) {
              case 4:
                this.xt = 2;
                for (const s of this.It.children) {
                    s.context.vpa.Wt(t, e);
                }
                return;

              case 64:
                return;

              default:
                this.jt("loading");
            }
        })).T((() => {
            e.$();
        })).C();
    }
    Ut(t, e, s) {
        ensureTransitionHasNotErrored(e);
        ensureGuardsResultIsTrue(this, e);
        s.N();
        switch (this.Ct) {
          case 256:
            this.Ct = 128;
            switch (this._t) {
              case "none":
              case "invoke-lifecycles":
                s.$();
                return;

              case "replace":
                {
                    const i = this.hostController;
                    const n = this.kt;
                    e.Qt((() => r(n.Ut(t, i), (() => {
                        if (t === null) {
                            n.Jt();
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
            this.jt("deactivate");
        }
    }
    Mt(t, e, s) {
        ensureTransitionHasNotErrored(e);
        ensureGuardsResultIsTrue(this, e);
        s.N();
        if (this.xt === 32) {
            Batch.C((t => {
                this.qt(e, t);
            })).T((t => {
                this.Wt(e, t);
            })).T((s => {
                this.Mt(t, e, s);
            })).T((() => {
                s.$();
            })).C();
            return;
        }
        switch (this.xt) {
          case 2:
            this.xt = 1;
            Batch.C((s => {
                switch (this._t) {
                  case "none":
                  case "invoke-lifecycles":
                    return;

                  case "replace":
                    {
                        const i = this.hostController;
                        e.Qt((() => {
                            s.N();
                            return this.$t.Mt(t, i);
                        }), (() => {
                            s.$();
                        }));
                    }
                }
            })).T((t => {
                this.Kt(e, t);
            })).T((() => {
                s.$();
            })).C();
            return;

          case 64:
            s.$();
            return;

          default:
            this.jt("activate");
        }
    }
    Xt(t, e) {
        if (this.Ct === 8192) {
            this.Mt(null, t, e);
            return;
        }
        if (this.xt === 64) {
            this.Ut(null, t, e);
            return;
        }
        ensureTransitionHasNotErrored(t);
        ensureGuardsResultIsTrue(this, t);
        if (!(this.Ct === 256 && this.xt === 2)) {
            this.jt("swap");
        }
        this.Ct = 128;
        this.xt = 1;
        switch (this._t) {
          case "none":
          case "invoke-lifecycles":
            {
                const s = mergeDistinct(this.It.children, this.Tt.children);
                for (const i of s) {
                    i.context.vpa.Xt(t, e);
                }
                return;
            }

          case "replace":
            {
                const s = this.hostController;
                const i = this.kt;
                const n = this.$t;
                e.N();
                Batch.C((e => {
                    t.Qt((() => {
                        e.N();
                        return r(i.Ut(null, s), (() => i.Jt()));
                    }), (() => {
                        e.$();
                    }));
                })).T((e => {
                    t.Qt((() => {
                        e.N();
                        return n.Mt(null, s);
                    }), (() => {
                        e.$();
                    }));
                })).T((e => {
                    this.Kt(t, e);
                })).T((() => {
                    e.$();
                })).C();
                return;
            }
        }
    }
    Kt(t, e) {
        const s = this.It;
        t.Qt((() => {
            e.N();
            const t = s.context;
            return r(t.allResolved, (() => {
                const e = s.children.slice();
                return r(a(...s.residue.splice(0).map((t => createAndAppendNodes(this.L, s, t)))), (() => r(a(...t.getAvailableViewportAgents().reduce(((t, e) => {
                    const i = e.viewport;
                    const n = i.default;
                    if (n === null) return t;
                    t.push(createAndAppendNodes(this.L, s, ViewportInstruction.create({
                        component: n,
                        viewport: i.name
                    })));
                    return t;
                }), [])), (() => s.children.filter((t => !e.includes(t)))))));
            }));
        }), (s => {
            Batch.C((e => {
                for (const i of s) {
                    t.Qt((() => {
                        e.N();
                        return i.context.vpa.qt(t, e);
                    }), (() => {
                        e.$();
                    }));
                }
            })).T((e => {
                for (const i of s) {
                    t.Qt((() => {
                        e.N();
                        return i.context.vpa.Wt(t, e);
                    }), (() => {
                        e.$();
                    }));
                }
            })).T((e => {
                for (const i of s) {
                    t.Qt((() => {
                        e.N();
                        return i.context.vpa.Mt(null, t, e);
                    }), (() => {
                        e.$();
                    }));
                }
            })).T((() => {
                e.$();
            })).C();
        }));
    }
    Yt(t, e) {
        switch (this.xt) {
          case 64:
            this.It = e;
            this.xt = 32;
            break;

          default:
            this.jt("scheduleUpdate 1");
        }
        switch (this.Ct) {
          case 8192:
          case 4096:
          case 1024:
            break;

          default:
            this.jt("scheduleUpdate 2");
        }
        const s = this.kt?.Zt ?? null;
        if (s === null || s.component !== e.component) {
            this._t = "replace";
        } else {
            this._t = e.context.config.X(s, e, t.transitionPlan);
        }
    }
    te() {
        if (this.Tt !== null) {
            this.Tt.children.forEach((function(t) {
                t.context.vpa.te();
            }));
        }
        if (this.It !== null) {
            this.It.children.forEach((function(t) {
                t.context.vpa.te();
            }));
        }
        let t = null;
        let e = null;
        switch (this.Ct) {
          case 8192:
          case 4096:
            this.Pt = null;
            break;

          case 2048:
          case 1024:
            this.Ct = 4096;
            this.Pt = null;
            break;

          case 512:
          case 256:
          case 128:
            t = r(this.kt?.Ut(null, this.hostController), (() => {
                this.kt?.Jt();
                this.Ct = 8192;
                this.kt = null;
            }));
            break;
        }
        switch (this.xt) {
          case 64:
          case 32:
          case 16:
          case 8:
            this.It = null;
            this.xt = 64;
            break;

          case 4:
          case 2:
          case 1:
            {
                e = r(this.$t?.Ut(null, this.hostController), (() => {
                    this.$t?.Jt();
                    this._t = "replace";
                    this.xt = 64;
                    this.$t = null;
                    this.It = null;
                }));
                break;
            }
        }
        if (t !== null && e !== null) {
            this.Vt = r(a(t, e), (() => {
                this.Pt = null;
                this.Vt = null;
            }));
        }
    }
    ee() {
        if (this.Tt !== null) {
            this.Tt.children.forEach((function(t) {
                t.context.vpa.ee();
            }));
        }
        if (this.It !== null) {
            this.It.children.forEach((function(t) {
                t.context.vpa.ee();
            }));
        }
        if (this.Pt !== null) {
            ensureTransitionHasNotErrored(this.Pt);
            switch (this.xt) {
              case 64:
                switch (this.Ct) {
                  case 8192:
                  case 128:
                    this.Ct = 8192;
                    this.kt = null;
                    break;

                  default:
                    this.jt("endTransition 1");
                }
                break;

              case 1:
                switch (this.Ct) {
                  case 8192:
                  case 128:
                    switch (this._t) {
                      case "none":
                        this.Ct = 4096;
                        break;

                      case "invoke-lifecycles":
                        this.Ct = 4096;
                        this.kt.Zt = this.It;
                        break;

                      case "replace":
                        this.Ct = 4096;
                        this.kt = this.$t;
                        break;
                    }
                    this.Tt = this.It;
                    break;

                  default:
                    this.jt("endTransition 2");
                }
                break;

              default:
                this.jt("endTransition 3");
            }
            this._t = "replace";
            this.xt = 64;
            this.It = null;
            this.$t = null;
            this.Pt = null;
        }
    }
    toString() {
        return `VPA(state:${$state(this._state)},plan:'${this._t}',n:${this.It},c:${this.Tt},viewport:${this.viewport})`;
    }
    Jt() {
        this.kt?.Jt();
    }
    jt(t) {
        throw new Error(getMessage(3352, t, this));
    }
}

function ensureGuardsResultIsTrue(t, e) {
    if (e.guardsResult !== true) throw new Error(getMessage(3353, e.guardsResult, t));
}

function ensureTransitionHasNotErrored(t) {
    if (t.error !== void 0 && !t.erredWithUnknownRoute) throw t.error;
}

const Y = new Map;

function $state(t) {
    let e = Y.get(t);
    if (e === void 0) {
        Y.set(t, e = stringifyState(t));
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
        return this.se.root;
    }
    get isInstructionsFinalized() {
        return this.ie;
    }
    constructor(t, e, s, i, n, r, o, a, c, u, h, l, f) {
        this.path = t;
        this.finalPath = e;
        this.context = s;
        this.ne = i;
        this.instruction = n;
        this.params = r;
        this.queryParams = o;
        this.fragment = a;
        this.data = c;
        this.re = u;
        this.title = h;
        this.component = l;
        this.residue = f;
        this.oe = 1;
        this.ie = false;
        this.children = [];
        this.ne ??= n;
    }
    static create(t) {
        const {[V]: e, ...s} = t.params ?? {};
        return new RouteNode(t.path, t.finalPath, t.context, t.originalInstruction ?? t.instruction, t.instruction, Object.freeze(s), t.queryParams ?? Z, t.fragment ?? null, Object.freeze(t.data ?? c), t.re ?? null, t.title ?? null, t.component, t.residue ?? []);
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
                    const h = u !== null ? u.isInstructionsFinalized ? u.instruction : u.ne : null;
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
    ae(t) {
        this.children.push(t);
        t.ce(this.se);
    }
    ue() {
        for (const t of this.children) {
            t.ue();
            t.context.vpa.te();
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
    ce(t) {
        this.se = t;
        for (const e of this.children) {
            e.ce(t);
        }
    }
    he() {
        this.ie = true;
        const t = this.children.map((t => t.he()));
        const e = this.instruction.Z();
        e.children.splice(0, e.children.length, ...t);
        return this.instruction = e;
    }
    Z() {
        const t = new RouteNode(this.path, this.finalPath, this.context, this.ne, this.instruction, this.params, this.queryParams, this.fragment, this.data, this.re, this.title, this.component, [ ...this.residue ]);
        const e = this.children;
        const s = e.length;
        for (let i = 0; i < s; ++i) {
            t.children.push(e[i].Z());
        }
        t.oe = this.oe + 1;
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
        return `RN(ctx:'${this.context?.At}',${t.join(",")})`;
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
    Z() {
        const t = new RouteTree(this.options.Z(), this.queryParams, this.fragment, this.root.Z());
        t.root.ce(this);
        return t;
    }
    le() {
        return new ViewportInstructionTree(this.options, true, this.root.children.map((t => t.he())), this.queryParams, this.fragment);
    }
    fe(t) {
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
            e.ue();

          case ".":
            return a(...s.children.map((s => createAndAppendNodes(t, e, s))));

          default:
            {
                t.trace(`createAndAppendNodes invoking createNode`);
                const i = e.context;
                const n = s.Z();
                let o = s.recognizedRoute;
                if (o !== null) return appendNode(t, e, createConfiguredNode(t, e, s, o, n));
                if (s.children.length === 0) {
                    const n = i.pe(s);
                    if (n !== null) {
                        e.se.fe(n.query);
                        const i = n.vi;
                        i.children.push(...s.children);
                        return appendNode(t, e, createConfiguredNode(t, e, i, i.recognizedRoute, s));
                    }
                }
                let a = 0;
                let u = s.component.value;
                let h = s;
                while (h.children.length === 1) {
                    h = h.children[0];
                    if (h.component.type === 0) {
                        ++a;
                        u = `${u}/${h.component.value}`;
                    } else {
                        break;
                    }
                }
                o = i.recognize(u);
                t.trace("createNode recognized route: %s", o);
                const l = o?.residue ?? null;
                t.trace("createNode residue:", l);
                const f = l === null;
                if (o === null || l === u) {
                    const n = i.pe({
                        component: s.component.value,
                        params: s.params ?? c,
                        open: s.open,
                        close: s.close,
                        viewport: s.viewport,
                        children: s.children
                    });
                    if (n !== null) {
                        e.se.fe(n.query);
                        return appendNode(t, e, createConfiguredNode(t, e, n.vi, n.vi.recognizedRoute, s));
                    }
                    const o = s.component.value;
                    if (o === "") return;
                    let a = s.viewport;
                    if (a === null || a.length === 0) a = nt;
                    const u = i.getFallbackViewportAgent(a);
                    const h = u !== null ? u.viewport.tt(s, e, i) : i.config.tt(s, e, i);
                    if (h === null) throw new UnknownRouteError(getMessage(3401, o, i.At, a, o, i.component.name));
                    if (typeof h === "string") {
                        t.trace(`Fallback is set to '${h}'. Looking for a recognized route.`);
                        const n = i.childRoutes.find((t => t.id === h));
                        if (n !== void 0) return appendNode(t, e, createFallbackNode(t, n, e, s));
                        t.trace(`No route configuration for the fallback '${h}' is found; trying to recognize the route.`);
                        const r = i.recognize(h, true);
                        if (r !== null && r.residue !== h) return appendNode(t, e, createConfiguredNode(t, e, s, r, null));
                    }
                    t.trace(`The fallback '${h}' is not recognized as a route; treating as custom element name.`);
                    return r(resolveRouteConfiguration(h, false, i.config, null, i), (i => appendNode(t, e, createFallbackNode(t, i, e, s))));
                }
                o.residue = null;
                s.component.value = f ? u : u.slice(0, -(l.length + 1));
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
                s.recognizedRoute = o;
                t.trace("createNode after adjustment vi:%s", s);
                return appendNode(t, e, createConfiguredNode(t, e, s, o, n));
            }
        }

      case 3:
      case 4:
      case 2:
        {
            const i = e.context;
            return r(resolveCustomElementDefinition(s.component.value, i)[1], (n => {
                const {vi: r, query: o} = i.pe({
                    component: n,
                    params: s.params ?? c,
                    open: s.open,
                    close: s.close,
                    viewport: s.viewport,
                    children: s.children
                });
                e.se.fe(o);
                return appendNode(t, e, createConfiguredNode(t, e, r, r.recognizedRoute, s));
            }));
        }
    }
}

function createConfiguredNode(t, e, s, i, n, o = i.route.endpoint.route) {
    const a = e.context;
    const c = e.se;
    return r(o.handler, (u => {
        o.handler = u;
        t.trace(`creatingConfiguredNode(rdc:%s, vi:%s)`, u, s);
        if (u.redirectTo === null) {
            const h = (s.viewport?.length ?? 0) > 0;
            const l = h ? s.viewport : u.viewport;
            return r(resolveCustomElementDefinition(u.component, a)[1], (f => {
                const p = a.ge(new ViewportRequest(l, f.name));
                if (!h) {
                    s.viewport = p.viewport.name;
                }
                const g = a.container.get(tt);
                return r(g.getRouteContext(p, f, null, p.hostController.container, a.config, a, u), (r => {
                    t.trace("createConfiguredNode setting the context node");
                    const a = r.node = RouteNode.create({
                        path: i.route.endpoint.route.path,
                        finalPath: o.path,
                        context: r,
                        instruction: s,
                        originalInstruction: n,
                        params: i.route.params,
                        queryParams: c.queryParams,
                        fragment: c.fragment,
                        data: u.data,
                        re: l,
                        component: f,
                        title: u.title,
                        residue: s.children.slice()
                    });
                    a.ce(e.se);
                    t.trace(`createConfiguredNode(vi:%s) -> %s`, s, a);
                    return a;
                }));
            }));
        }
        const h = RouteExpression.parse(et.parse(o.path));
        const l = RouteExpression.parse(et.parse(u.redirectTo));
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
        const R = a.recognize(E);
        if (R === null) throw new UnknownRouteError(getMessage(3402, E, a.At, E, a.component.name));
        return createConfiguredNode(t, e, ViewportInstruction.create({
            recognizedRoute: R,
            component: E,
            children: s.children,
            viewport: s.viewport,
            open: s.open,
            close: s.close
        }), R, n);
    }));
}

function appendNode(t, e, s) {
    return r(s, (s => {
        t.trace(`appendNode($childNode:%s)`, s);
        e.ae(s);
        return s.context.vpa.Yt(e.se.options, s);
    }));
}

function createFallbackNode(t, e, s, i) {
    const n = new $RecognizedRoute(new A(new O(new M(e.path[0], e.caseSensitive, e), []), c), null);
    i.children.length = 0;
    return createConfiguredNode(t, s, i, n, null);
}

const Z = Object.freeze(new URLSearchParams);

function isManagedState(t) {
    return u(t) && Object.prototype.hasOwnProperty.call(t, H) === true;
}

function toManagedState(t, e) {
    return {
        ...t,
        [H]: e
    };
}

class UnknownRouteError extends Error {}

class Transition {
    get erredWithUnknownRoute() {
        return this.de;
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
        this.de = false;
    }
    static J(t) {
        return new Transition(t.id, t.prevInstructions, t.instructions, t.finalInstructions, t.instructionsChanged, t.trigger, t.options, t.managedState, t.previousRouteTree, t.routeTree, t.promise, t.resolve, t.reject, t.guardsResult, void 0);
    }
    Qt(t, e) {
        if (this.guardsResult !== true) {
            return;
        }
        try {
            const s = t();
            if (s instanceof Promise) {
                s.then(e).catch((t => {
                    this.Dt(t);
                }));
            } else {
                e(s);
            }
        } catch (t) {
            this.Dt(t);
        }
    }
    Dt(t) {
        this.de = t instanceof UnknownRouteError;
        this.reject(this.error = t);
    }
    toString() {
        return `T(id:${this.id},trigger:'${this.trigger}',instructions:${this.instructions})`;
    }
}

const tt = /*@__PURE__*/ t.createInterface("IRouter", (t => t.singleton(Router)));

class Router {
    get we() {
        const t = this.me;
        if (t !== null) return t;
        if (!this.c.has(rt, true)) throw new Error(getMessage(3271));
        return this.me = this.c.get(rt);
    }
    get routeTree() {
        let t = this.ve;
        if (t === null) {
            const e = this.we;
            t = this.ve = new RouteTree(NavigationOptions.create(this.options, {}), Z, null, RouteNode.create({
                path: "",
                finalPath: "",
                context: e,
                instruction: null,
                component: y.getDefinition(e.config.component),
                title: e.config.title
            }));
        }
        return t;
    }
    get currentTr() {
        return this.Ee ??= Transition.J({
            id: 0,
            prevInstructions: this.Re,
            instructions: this.Re,
            finalInstructions: this.Re,
            instructionsChanged: true,
            trigger: "api",
            options: NavigationOptions.create(this.options, {}),
            managedState: null,
            previousRouteTree: this.routeTree.Z(),
            routeTree: this.routeTree,
            resolve: null,
            reject: null,
            promise: null,
            guardsResult: true,
            error: void 0
        });
    }
    set currentTr(t) {
        this.Ee = t;
    }
    get isNavigating() {
        return this.ye;
    }
    constructor() {
        this.me = null;
        this.ve = null;
        this.Ee = null;
        this.be = false;
        this.Se = 0;
        this.Ce = null;
        this.xe = null;
        this.Ne = false;
        this.ye = false;
        this.c = e(h);
        this.ke = e(S);
        this.L = e(i).root.scopeTo("Router");
        this.I = e(D);
        this.$e = e(F);
        this.options = e(it);
        this._e = new Map;
        this.Re = ViewportInstructionTree.create("", this.options);
        this.c.registerResolver(Router, l.instance(Router, this));
    }
    Te(t) {
        return RouteContext.resolve(this.we, t);
    }
    start(t) {
        this.Ne = typeof this.options.buildTitle === "function";
        this.$e.startListening();
        this.xe = this.I.subscribe("au:router:location-change", (t => {
            this.ke.taskQueue.queueTask((() => {
                const e = isManagedState(t.state) ? t.state : null;
                const s = this.options;
                const i = NavigationOptions.create(s, {
                    historyStrategy: "replace"
                });
                const n = ViewportInstructionTree.create(t.url, s, i, this.we);
                this.Ie(n, t.trigger, e, null);
            }));
        }));
        if (!this.be && t) {
            return this.load(this.$e.getPath(), {
                historyStrategy: this.options.historyStrategy !== "none" ? "replace" : "none"
            });
        }
    }
    stop() {
        this.$e.stopListening();
        this.xe?.dispose();
    }
    load(t, e) {
        const s = this.createViewportInstructions(t, e);
        return this.Ie(s, "api", null, null);
    }
    isActive(t, e) {
        const s = this.Te(e);
        const i = t instanceof ViewportInstructionTree ? t : this.createViewportInstructions(t, {
            context: s,
            historyStrategy: this.options.historyStrategy
        });
        return this.routeTree.contains(i, false);
    }
    getRouteContext(t, e, s, i, n, o, a) {
        return r(a instanceof RouteConfig ? a : resolveRouteConfiguration(typeof s?.getRouteConfig === "function" ? s : e.Type, false, n, null, o), (s => {
            let n = this._e.get(t);
            if (n === void 0) {
                this._e.set(t, n = new WeakMap);
            }
            let r = n.get(s);
            if (r !== void 0) {
                return r;
            }
            const o = i.has(rt, true) ? i.get(rt) : null;
            n.set(s, r = new RouteContext(t, o, e, s, i, this));
            return r;
        }));
    }
    createViewportInstructions(t, e) {
        if (t instanceof ViewportInstructionTree) return t;
        let s = e?.context ?? null;
        if (typeof t === "string") {
            t = this.$e.removeBaseHref(t);
        }
        const i = isPartialViewportInstruction(t);
        let n = i ? t.component : t;
        if (typeof n === "string" && n.startsWith("../") && s !== null) {
            s = this.Te(s);
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
        }), this.we);
    }
    Ie(t, e, s, i) {
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
        const h = this.Ce = Transition.J({
            id: ++this.Se,
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
            routeTree: this.ve = this.routeTree.Z(),
            guardsResult: true,
            error: void 0
        });
        if (!this.ye) {
            try {
                this.Qt(h);
            } catch (t) {
                h.Dt(t);
            }
        }
        return h.promise.then((t => t)).catch((t => {
            error(r, 3270, h, t);
            if (h.erredWithUnknownRoute) {
                this.Pe(h);
            } else {
                this.ye = false;
                this.I.publish(new NavigationErrorEvent(h.id, h.instructions, t));
                if (u) {
                    this.Pe(h);
                } else {
                    const t = this.Ce;
                    if (t !== null) {
                        t.previousRouteTree = h.previousRouteTree;
                    } else {
                        this.ve = h.previousRouteTree;
                    }
                }
            }
            throw t;
        }));
    }
    Qt(t) {
        this.currentTr = t;
        this.Ce = null;
        this.ye = true;
        let e = this.Te(t.options.context);
        this.I.publish(new NavigationStartEvent(t.id, t.instructions, t.trigger, t.managedState));
        if (this.Ce !== null) {
            return this.Qt(this.Ce);
        }
        t.Qt((() => {
            const s = t.finalInstructions;
            const n = this.we;
            const o = t.routeTree;
            o.options = s.options;
            o.queryParams = n.node.se.queryParams = s.queryParams;
            o.fragment = n.node.se.fragment = s.fragment;
            const a = /*@__PURE__*/ e.container.get(i).scopeTo("RouteTree");
            if (s.isAbsolute) {
                e = n;
            }
            if (e === n) {
                o.root.ce(o);
                n.node = o.root;
            }
            const c = e.allResolved instanceof Promise ? " - awaiting promise" : "";
            a.trace(`updateRouteTree(rootCtx:%s,rt:%s,vit:%s)${c}`, n, o, s);
            return r(e.allResolved, (() => updateNode(a, s, e, n.node)));
        }), (() => {
            const e = t.previousRouteTree.root.children;
            const s = t.routeTree.root.children;
            const i = mergeDistinct(e, s);
            Batch.C((s => {
                for (const i of e) {
                    i.context.vpa.Ht(t, s);
                }
            })).T((e => {
                if (t.guardsResult !== true) {
                    e.N();
                    this.Pe(t);
                }
            })).T((e => {
                for (const i of s) {
                    i.context.vpa.qt(t, e);
                }
            })).T((e => {
                if (t.guardsResult !== true) {
                    e.N();
                    this.Pe(t);
                }
            })).T((s => {
                for (const i of e) {
                    i.context.vpa.Gt(t, s);
                }
            })).T((e => {
                for (const i of s) {
                    i.context.vpa.Wt(t, e);
                }
            })).T((e => {
                for (const s of i) {
                    s.context.vpa.Xt(t, e);
                }
            })).T((() => {
                i.forEach((function(t) {
                    t.context.vpa.ee();
                }));
                this.be = true;
                this.Re = t.finalInstructions = t.routeTree.le();
                this.ye = false;
                const e = t.finalInstructions.toUrl(true, this.options.Ve);
                switch (t.options.Ae(this.Re)) {
                  case "none":
                    break;

                  case "push":
                    this.$e.pushState(toManagedState(t.options.state, t.id), this.updateTitle(t), e);
                    break;

                  case "replace":
                    this.$e.replaceState(toManagedState(t.options.state, t.id), this.updateTitle(t), e);
                    break;
                }
                this.I.publish(new NavigationEndEvent(t.id, t.instructions, this.Re));
                t.resolve(true);
                this.Oe();
            })).C();
        }));
    }
    updateTitle(t = this.currentTr) {
        const e = this.Me(t);
        if (e.length > 0) {
            this.ke.document.title = e;
        }
        return this.ke.document.title;
    }
    Me(t = this.currentTr) {
        let e;
        if (this.Ne) {
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
    Pe(t) {
        const e = t.previousRouteTree.root.children;
        const s = t.routeTree.root.children;
        const i = mergeDistinct(e, s);
        i.forEach((function(t) {
            t.context.vpa.te();
        }));
        this.Re = t.prevInstructions;
        this.ve = t.previousRouteTree;
        this.ye = false;
        const n = t.guardsResult;
        this.I.publish(new NavigationCancelEvent(t.id, t.instructions, `guardsResult is ${n}`));
        if (n === false) {
            t.resolve(false);
            this.Oe();
        } else {
            let e;
            if (this.be && (t.erredWithUnknownRoute || t.error != null && this.options.restorePreviousRouteTreeOnError)) e = t.prevInstructions; else if (n === true) return; else e = n;
            void r(this.Ie(e, "api", t.managedState, t), (() => {}));
        }
    }
    Oe() {
        if (this.Ce === null) return;
        this.ke.taskQueue.queueTask((() => {
            const t = this.Ce;
            if (t === null) return;
            try {
                this.Qt(t);
            } catch (e) {
                t.Dt(e);
            }
        }));
    }
}

function updateNode(t, e, s, i) {
    t.trace(`updateNode(ctx:%s,node:%s)`, s, i);
    i.queryParams = e.queryParams;
    i.fragment = e.fragment;
    if (!i.context.isRoot) {
        i.context.vpa.Yt(i.se.options, i);
    }
    if (i.context === s) {
        i.ue();
        return r(a(...e.children.map((e => createAndAppendNodes(t, i, e)))), (() => a(...s.getAvailableViewportAgents().reduce(((e, s) => {
            const n = s.viewport;
            const r = n.default;
            if (r === null) return e;
            e.push(createAndAppendNodes(t, i, ViewportInstruction.create({
                component: r,
                viewport: n.name
            })));
            return e;
        }), []))));
    }
    return a(...i.children.map((i => updateNode(t, e, s, i))));
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
    static J(t) {
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
        return new ParsedUrl(t, i ?? Z, e);
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
    e ??= Z;
    let n = e.toString();
    n = n === "" ? "" : `?${n}`;
    const r = s != null && s.length > 0 ? `#${encodeURIComponent(s)}` : "";
    return `${i}${n}${r}`;
}

const et = Object.freeze({
    parse(t) {
        return ParsedUrl.J(t);
    },
    stringify(t, e, s) {
        return stringify(t, e, s);
    }
});

const st = Object.freeze({
    parse(t) {
        const e = t.indexOf("#");
        if (e >= 0) {
            const s = t.slice(e + 1);
            t = decodeURIComponent(s);
        }
        return ParsedUrl.J(t);
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

const it = /*@__PURE__*/ t.createInterface("RouterOptions");

class RouterOptions {
    constructor(t, e, s, i, n, r, o) {
        this.useUrlFragmentHash = t;
        this.useHref = e;
        this.historyStrategy = s;
        this.buildTitle = i;
        this.useNavigationModel = n;
        this.activeClass = r;
        this.restorePreviousRouteTreeOnError = o;
        this.Ve = t ? st : et;
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
    Z() {
        return new NavigationOptions(this.historyStrategy, this.title, this.titleSeparator, this.context, {
            ...this.queryParams
        }, this.fragment, this.state === null ? null : {
            ...this.state
        }, this.transitionPlan);
    }
    Ae(t) {
        return valueOrFuncToValue(t, this.historyStrategy);
    }
}

const nt = "default";

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
    Z() {
        return new ViewportInstruction(this.open, this.close, this.recognizedRoute, this.component.Z(), this.viewport, this.params, [ ...this.children ]);
    }
    toUrlComponent(t = true) {
        const e = this.component.toUrlComponent();
        const s = this.viewport;
        const i = e.length === 0 || s === null || s.length === 0 || s === nt ? "" : `@${s}`;
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

function stringifyParams(t) {
    if (t === null) return "";
    const e = Object.keys(t);
    const s = e.length;
    if (s === 0) return "";
    const i = Array(s);
    const n = [];
    const r = [];
    for (const t of e) {
        if (f(t)) {
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
    static create(t, e, s, i) {
        s = s instanceof NavigationOptions ? s : NavigationOptions.create(e, s ?? c);
        let n = s.context;
        if (!(n instanceof RouteContext) && i != null) {
            n = s.context = RouteContext.resolve(i, n);
        }
        const r = n != null;
        if (t instanceof Array) {
            const e = t.length;
            const i = new Array(e);
            const o = new URLSearchParams(s.queryParams ?? c);
            for (let s = 0; s < e; s++) {
                const e = t[s];
                const a = r ? n.pe(e) : null;
                if (a !== null) {
                    i[s] = a.vi;
                    mergeURLSearchParams(o, a.query, false);
                } else {
                    i[s] = ViewportInstruction.create(e);
                }
            }
            return new ViewportInstructionTree(s, false, i, o, s.fragment);
        }
        if (typeof t === "string") {
            const i = RouteExpression.parse(e.Ve.parse(t));
            return i.toInstructionTree(s);
        }
        const o = r ? n.pe(isPartialViewportInstruction(t) ? {
            ...t,
            params: t.params ?? c
        } : {
            component: t,
            params: c
        }) : null;
        const a = new URLSearchParams(s.queryParams ?? c);
        return o !== null ? new ViewportInstructionTree(s, false, [ o.vi ], mergeURLSearchParams(a, o.query, false), s.fragment) : new ViewportInstructionTree(s, false, [ ViewportInstruction.create(t) ], a, s.fragment);
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
                const i = s.Ct === 4096 ? s.Tt : s.It;
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
        if (!u(t)) expectType("function/class or object", "", t);
        if (typeof t === "function") {
            if (y.isType(t)) {
                const e = y.getDefinition(t);
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
        if (m(t)) return new TypedNavigationInstruction(4, t);
        if (t instanceof C) return new TypedNavigationInstruction(2, t);
        throw new Error(getMessage(3400, tryStringify(t)));
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
    Z() {
        return new TypedNavigationInstruction(this.type, this.value);
    }
    toUrlComponent() {
        switch (this.type) {
          case 2:
            return this.value.name;

          case 4:
          case 3:
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

class ComponentAgent {
    constructor(t, e, s, n, r) {
        this.je = t;
        this.Le = e;
        this.Zt = s;
        this.we = n;
        this.Ue = r;
        this.L = e.container.get(i).scopeTo(`ComponentAgent<${n.At}>`);
        const o = e.lifecycleHooks;
        this.ze = (o.canLoad ?? []).map((t => t.instance));
        this.Be = (o.loading ?? []).map((t => t.instance));
        this.He = (o.canUnload ?? []).map((t => t.instance));
        this.De = (o.unloading ?? []).map((t => t.instance));
        this.qe = "canLoad" in t;
        this.Fe = "loading" in t;
        this.Ge = "canUnload" in t;
        this.We = "unloading" in t;
    }
    Mt(t, e) {
        if (t === null) {
            return this.Le.activate(this.Le, e);
        }
        void this.Le.activate(t, e);
    }
    Ut(t, e) {
        if (t === null) {
            return this.Le.deactivate(this.Le, e);
        }
        void this.Le.deactivate(t, e);
    }
    Jt() {
        this.Le.dispose();
    }
    Ht(t, e, s) {
        s.N();
        let i = Promise.resolve();
        for (const n of this.He) {
            s.N();
            i = i.then((() => new Promise((i => {
                if (t.guardsResult !== true) {
                    s.$();
                    i();
                    return;
                }
                t.Qt((() => n.canUnload(this.je, e, this.Zt)), (e => {
                    if (t.guardsResult === true && e === false) {
                        t.guardsResult = false;
                    }
                    s.$();
                    i();
                }));
            }))));
        }
        if (this.Ge) {
            s.N();
            i = i.then((() => {
                if (t.guardsResult !== true) {
                    s.$();
                    return;
                }
                t.Qt((() => this.je.canUnload(e, this.Zt)), (e => {
                    if (t.guardsResult === true && e === false) {
                        t.guardsResult = false;
                    }
                    s.$();
                }));
            }));
        }
        s.$();
    }
    qt(t, e, s) {
        const i = this.we.root;
        s.N();
        let n = Promise.resolve();
        for (const r of this.ze) {
            s.N();
            n = n.then((() => new Promise((n => {
                if (t.guardsResult !== true) {
                    s.$();
                    n();
                    return;
                }
                t.Qt((() => r.canLoad(this.je, e.params, e, this.Zt)), (e => {
                    if (t.guardsResult === true && e != null && e !== true) {
                        t.guardsResult = e === false ? false : ViewportInstructionTree.create(e, this.Ue, void 0, i);
                    }
                    s.$();
                    n();
                }));
            }))));
        }
        if (this.qe) {
            s.N();
            n = n.then((() => {
                if (t.guardsResult !== true) {
                    s.$();
                    return;
                }
                t.Qt((() => this.je.canLoad(e.params, e, this.Zt)), (e => {
                    if (t.guardsResult === true && e != null && e !== true) {
                        t.guardsResult = e === false ? false : ViewportInstructionTree.create(e, this.Ue, void 0, i);
                    }
                    s.$();
                }));
            }));
        }
        s.$();
    }
    Gt(t, e, s) {
        s.N();
        for (const i of this.De) {
            t.Qt((() => {
                s.N();
                return i.unloading(this.je, e, this.Zt);
            }), (() => {
                s.$();
            }));
        }
        if (this.We) {
            t.Qt((() => {
                s.N();
                return this.je.unloading(e, this.Zt);
            }), (() => {
                s.$();
            }));
        }
        s.$();
    }
    Wt(t, e, s) {
        s.N();
        for (const i of this.Be) {
            t.Qt((() => {
                s.N();
                return i.loading(this.je, e.params, e, this.Zt);
            }), (() => {
                s.$();
            }));
        }
        if (this.Fe) {
            t.Qt((() => {
                s.N();
                return this.je.loading(e.params, e, this.Zt);
            }), (() => {
                s.$();
            }));
        }
        s.$();
    }
}

const rt = /*@__PURE__*/ t.createInterface("IRouteContext");

const ot = Object.freeze([ "string", "object", "function" ]);

function isEagerInstruction(t) {
    if (t == null) return false;
    const e = t.params;
    const s = t.component;
    return typeof e === "object" && e !== null && s != null && ot.includes(typeof s) && !(s instanceof Promise);
}

class RouteContext {
    get isRoot() {
        return this.parent === null;
    }
    get depth() {
        return this.path.length - 1;
    }
    get allResolved() {
        return this.Qe;
    }
    get node() {
        const t = this.Je;
        if (t === null) throw new Error(getMessage(3171, this));
        return t;
    }
    set node(t) {
        const e = this.Ke = this.Je;
        if (e !== t) {
            this.Je = t;
        }
    }
    get vpa() {
        const t = this.Xe;
        if (t === null) throw new Error(getMessage(3172, this));
        return t;
    }
    get navigationModel() {
        return this.Ye;
    }
    constructor(t, e, s, n, r, o) {
        this.parent = e;
        this.component = s;
        this.config = n;
        this.Ze = o;
        this.ts = [];
        this.childRoutes = [];
        this.Qe = null;
        this.Ke = null;
        this.Je = null;
        this.es = false;
        this.Xe = t;
        if (e === null) {
            this.root = this;
            this.path = [ this ];
            this.At = s.name;
        } else {
            this.root = e.root;
            this.path = [ ...e.path, this ];
            this.At = `${e.At}/${s.name}`;
        }
        this.L = r.get(i).scopeTo(`RouteContext<${this.At}>`);
        this.ss = r.get(p);
        const a = this.container = r.createChild();
        this.p = a.get(S);
        a.registerResolver(x, this.ns = new g, true);
        const c = new g("IRouteContext", this);
        a.registerResolver(rt, c);
        a.registerResolver(RouteContext, c);
        this.rs = new j;
        if (o.options.useNavigationModel) {
            const t = this.Ye = new NavigationModel([]);
            a.get(D).subscribe("au:router:navigation-end", (() => t.os(o, this)));
        } else {
            this.Ye = null;
        }
        this.cs(n);
    }
    cs(t) {
        const e = [];
        const s = t.routes ?? G;
        const i = s.length;
        if (i === 0) {
            const e = t.component.prototype?.getRouteConfig;
            this.es = e == null ? true : typeof e !== "function";
            return;
        }
        const r = this.Ye;
        const o = r !== null;
        let a = 0;
        for (;a < i; a++) {
            const i = s[a];
            if (i instanceof Promise) {
                e.push(this.us(i));
                continue;
            }
            const c = resolveRouteConfiguration(i, true, t, null, this);
            if (c instanceof Promise) {
                if (!isPartialChildRouteConfig(i) || i.path == null) throw new Error(getMessage(3173));
                for (const t of ensureArrayOfStrings(i.path)) {
                    this.ls(t, i.caseSensitive ?? false, c);
                }
                const t = this.childRoutes.length;
                const s = c.then((e => this.childRoutes[t] = e));
                this.childRoutes.push(s);
                if (o) {
                    r.us(s);
                }
                e.push(s.then(d));
                continue;
            }
            for (const t of c.path ?? n) {
                this.ls(t, c.caseSensitive, c);
            }
            this.childRoutes.push(c);
            if (o) {
                r.us(c);
            }
        }
        this.es = true;
        if (e.length > 0) {
            this.Qe = Promise.all(e).then((() => {
                this.Qe = null;
            }));
        }
    }
    static setRoot(t) {
        const e = t.get(i).scopeTo("RouteContext");
        if (!t.has(N, true)) {
            logAndThrow(new Error(getMessage(3167)), e);
        }
        if (t.has(rt, true)) {
            logAndThrow(new Error(getMessage(3168)), e);
        }
        const {controller: s} = t.get(N);
        if (s === void 0) {
            logAndThrow(new Error(getMessage(3169)), e);
        }
        const n = t.get(tt);
        return r(n.getRouteContext(null, s.definition, s.viewModel, s.container, null, null, null), (e => {
            t.register(l.instance(rt, e));
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
        if (e instanceof s.get(S).Node) {
            try {
                const t = y.for(e, {
                    searchParents: true
                });
                return t.container.get(rt);
            } catch (t) {
                error(n, 3155, e.nodeName, t);
                throw t;
            }
        }
        if (m(e)) {
            const t = e.$controller;
            return t.container.get(rt);
        }
        if (k(e)) {
            const t = e;
            return t.container.get(rt);
        }
        logAndThrow(new Error(getMessage(3170, Object.prototype.toString.call(e))), n);
    }
    dispose() {
        this.container.dispose();
    }
    ge(t) {
        const e = this.ts.find((e => e.zt(t)));
        if (e === void 0) throw new Error(getMessage(3174, t, this.ps()));
        return e;
    }
    getAvailableViewportAgents() {
        return this.ts.filter((t => t.Bt()));
    }
    getFallbackViewportAgent(t) {
        return this.ts.find((e => e.Bt() && e.viewport.name === t && e.viewport.fallback !== "")) ?? null;
    }
    Ft(t, e) {
        this.ns.prepare(t);
        const s = this.container.createChild({
            inheritParentResources: true
        });
        const i = this.p;
        const n = e.component;
        const o = i.document.createElement(n.name);
        $(s, o, i);
        const a = s.invoke(n.Type);
        const c = this.es ? void 0 : r(resolveRouteConfiguration(a, false, this.config, e, null), (t => this.cs(t)));
        return r(c, (() => {
            const i = b.$el(s, a, o, {
                hostController: t,
                projections: null
            }, n);
            const r = new ComponentAgent(a, i, e, this, this.Ze.options);
            this.ns.dispose();
            return r;
        }));
    }
    gs(t) {
        const e = ViewportAgent.for(t, this);
        if (this.ts.includes(e)) {
            return e;
        }
        this.ts.push(e);
        return e;
    }
    ds(t) {
        const e = ViewportAgent.for(t, this);
        if (!this.ts.includes(e)) {
            return;
        }
        this.ts.splice(this.ts.indexOf(e), 1);
    }
    recognize(t, e = false) {
        let s = this;
        let i = true;
        let n = null;
        while (i) {
            n = s.rs.recognize(t);
            if (n === null) {
                if (!e || s.isRoot) return null;
                s = s.parent;
            } else {
                i = false;
            }
        }
        return new $RecognizedRoute(n, Reflect.has(n.params, V) ? n.params[V] ?? null : null);
    }
    us(t) {
        return r(resolveRouteConfiguration(t, true, this.config, null, this), (t => {
            for (const e of t.path ?? n) {
                this.ls(e, t.caseSensitive, t);
            }
            this.Ye?.us(t);
            this.childRoutes.push(t);
        }));
    }
    ls(t, e, s) {
        this.rs.add({
            path: t,
            caseSensitive: e,
            handler: s
        }, true);
    }
    et(t) {
        return this.ss.load(t, (e => {
            const s = e.raw;
            if (typeof s === "function") {
                const t = y.isType(s) ? y.getDefinition(s) : null;
                if (t != null) return t;
            }
            let i = void 0;
            let n = void 0;
            for (const t of e.items) {
                const e = y.isType(t.value) ? t.definition : null;
                if (e != null) {
                    if (t.key === "default") {
                        i = e;
                    } else if (n === void 0) {
                        n = e;
                    }
                }
            }
            if (i === void 0 && n === void 0) throw new Error(getMessage(3175, t));
            return n ?? i;
        }));
    }
    pe(t) {
        if (!isEagerInstruction(t)) return null;
        const e = t.component;
        let s;
        let i = false;
        if (e instanceof RouteConfig) {
            s = e.path;
            i = true;
        } else if (typeof e === "string") {
            const t = this.childRoutes.find((t => t.id === e));
            if (t === void 0) return null;
            s = t.path;
        } else if (e.type === 0) {
            const t = this.childRoutes.find((t => t.id === e.value));
            if (t === void 0) return null;
            s = t.path;
        } else {
            const t = resolveCustomElementDefinition(e, this)[1];
            s = this.childRoutes.reduce(((e, s) => {
                if (s.component === t.Type) {
                    e.push(...s.path);
                }
                return e;
            }), []);
            i = true;
        }
        if (s === void 0) return null;
        const n = t.params;
        const r = this.rs;
        const o = s.length;
        const a = [];
        let c = null;
        if (o === 1) {
            const e = core(s[0]);
            if (e === null) {
                if (i) throw new Error(getMessage(3166, t, a));
                return null;
            }
            return {
                vi: ViewportInstruction.create({
                    recognizedRoute: new $RecognizedRoute(new A(e.endpoint, e.consumed), null),
                    component: e.path,
                    children: t.children,
                    viewport: t.viewport,
                    open: t.open,
                    close: t.close
                }),
                query: e.query
            };
        }
        let u = 0;
        for (let t = 0; t < o; t++) {
            const e = core(s[t]);
            if (e === null) continue;
            if (c === null) {
                c = e;
                u = Object.keys(e.consumed).length;
            } else if (Object.keys(e.consumed).length > u) {
                c = e;
            }
        }
        if (c === null) {
            if (i) throw new Error(getMessage(3166, t, a));
            return null;
        }
        return {
            vi: ViewportInstruction.create({
                recognizedRoute: new $RecognizedRoute(new A(c.endpoint, c.consumed), null),
                component: c.path,
                children: t.children,
                viewport: t.viewport,
                open: t.open,
                close: t.close
            }),
            query: c.query
        };
        function core(t) {
            const e = r.getEndpoint(t);
            if (e === null) {
                a.push(`No endpoint found for the path: '${t}'.`);
                return null;
            }
            const s = Object.create(null);
            for (const i of e.params) {
                const e = i.name;
                let r = n[e];
                if (r == null || String(r).length === 0) {
                    if (!i.isOptional) {
                        a.push(`No value for the required parameter '${e}' is provided for the path: '${t}'.`);
                        return null;
                    }
                    r = "";
                } else {
                    if (!i.satisfiesPattern(r)) {
                        a.push(`The value '${r}' for the parameter '${e}' does not satisfy the pattern '${i.pattern}'.`);
                        return null;
                    }
                    s[e] = r;
                }
                const o = i.isStar ? `*${e}` : i.isOptional ? `:${e}?` : `:${e}`;
                t = t.replace(o, encodeURIComponent(r));
            }
            const i = Object.keys(s);
            const o = Object.fromEntries(Object.entries(n).filter((([t]) => !i.includes(t))));
            return {
                path: t.replace(/\/\//g, "/"),
                endpoint: e,
                consumed: s,
                query: o
            };
        }
    }
    toString() {
        const t = this.ts;
        const e = t.map(String).join(",");
        return `RC(path:'${this.At}',viewports:[${e}])`;
    }
    ps() {
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
        this.ws = void 0;
    }
    resolve() {
        return r(this.ws, d);
    }
    os(t, e) {
        void r(this.ws, (() => {
            for (const s of this.routes) {
                s.os(t, e);
            }
        }));
    }
    us(t) {
        const e = this.routes;
        if (!(t instanceof Promise)) {
            if ((t.nav ?? false) && t.redirectTo === null) {
                e.push(NavigationRoute.J(t));
            }
            return;
        }
        const s = e.length;
        e.push(void 0);
        let i = void 0;
        i = this.ws = r(this.ws, (() => r(t, (t => {
            if (t.nav && t.redirectTo === null) {
                e[s] = NavigationRoute.J(t);
            } else {
                e.splice(s, 1);
            }
            if (this.ws === i) {
                this.ws = void 0;
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
        this.Es = null;
    }
    static J(t) {
        return new NavigationRoute(t.id, ensureArrayOfStrings(t.path ?? n), t.title, t.data);
    }
    get isActive() {
        return this.Nt;
    }
    os(t, e) {
        let s = this.Es;
        if (s === null) {
            const i = t.options;
            s = this.Es = this.path.map((t => {
                const s = e.rs.getEndpoint(t);
                if (s === null) throw new Error(getMessage(3450, t));
                return new ViewportInstructionTree(NavigationOptions.create(i, {
                    context: e
                }), false, [ ViewportInstruction.create({
                    recognizedRoute: new $RecognizedRoute(new A(s, c), null),
                    component: t
                }) ], Z, null);
            }));
        }
        this.Nt = s.some((e => t.routeTree.contains(e, true)));
    }
}

class ViewportCustomElement {
    constructor() {
        this.name = nt;
        this.usedBy = "";
        this.default = "";
        this.fallback = "";
        this.Rs = void 0;
        this.Le = void 0;
        this.we = e(rt);
        this.L = e(i).scopeTo(`au-viewport<${this.we.At}>`);
    }
    tt(t, e, s) {
        const i = this.fallback;
        return typeof i === "function" && !y.isType(i) ? i(t, e, s) : i;
    }
    hydrated(t) {
        this.Le = t;
        this.Rs = this.we.gs(this);
    }
    attaching(t, e) {
        return this.Rs.Ot(t, this.Le);
    }
    detaching(t, e) {
        return this.Rs.Lt(t, this.Le);
    }
    dispose() {
        this.we.ds(this);
        this.Rs.Jt();
        this.Rs = void 0;
    }
    toString() {
        const t = [];
        for (const e of at) {
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
        return `VP(ctx:'${this.we.At}',${t.join(",")})`;
    }
}

y.define({
    name: "au-viewport",
    bindables: [ "name", "usedBy", "default", "fallback" ]
}, ViewportCustomElement);

const at = [ "name", "usedBy", "default", "fallback" ];

class LoadCustomAttribute {
    constructor() {
        this.ys = e(T);
        this.Ze = e(tt);
        this.we = e(rt);
        this.I = e(D);
        this.$e = e(F);
        this.attribute = "href";
        this.active = false;
        this.bs = null;
        this.Re = null;
        this.Ss = null;
        this.onClick = t => {
            if (this.Re === null) {
                return;
            }
            if (t.altKey || t.ctrlKey || t.shiftKey || t.metaKey || t.button !== 0) {
                return;
            }
            t.preventDefault();
            void this.Ze.load(this.Re, {
                context: this.context
            });
        };
        const t = this.ys;
        this.Cs = !t.hasAttribute("external") && !t.hasAttribute("data-external");
        this.xs = this.Ze.options.activeClass;
    }
    binding() {
        if (this.Cs) {
            this.ys.addEventListener("click", this.onClick);
        }
        this.valueChanged();
        this.Ss = this.I.subscribe("au:router:navigation-end", (t => {
            const e = this.active = this.Re !== null && this.Ze.isActive(this.Re, this.context);
            const s = this.xs;
            if (s === null) return;
            this.ys.classList.toggle(s, e);
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
        if (this.Cs) {
            this.ys.removeEventListener("click", this.onClick);
        }
        this.Ss.dispose();
    }
    valueChanged() {
        const t = this.Ze;
        const e = t.options;
        const s = this.route;
        let i = this.context;
        if (i === void 0) {
            i = this.context = this.we;
        } else if (i === null) {
            i = this.context = this.we.root;
        }
        if (s != null && i.allResolved === null) {
            const n = this.params;
            const r = this.Re = t.createViewportInstructions(typeof n === "object" && n !== null ? {
                component: s,
                params: n
            } : s, {
                context: i
            });
            this.bs = r.toUrl(false, e.Ve);
        } else {
            this.Re = null;
            this.bs = null;
        }
        const n = y.for(this.ys, {
            optional: true
        });
        if (n !== null) {
            n.viewModel[this.attribute] = this.Re;
        } else {
            if (this.bs === null) {
                this.ys.removeAttribute(this.attribute);
            } else {
                const t = e.useUrlFragmentHash ? this.bs : this.$e.addBaseHref(this.bs);
                this.ys.setAttribute(this.attribute, t);
            }
        }
    }
}

_.define({
    name: "load",
    bindables: {
        route: {
            mode: z,
            primary: true,
            callback: "valueChanged"
        },
        params: {
            mode: z,
            callback: "valueChanged"
        },
        attribute: {
            mode: z
        },
        active: {
            mode: B
        },
        context: {
            mode: z,
            callback: "valueChanged"
        }
    }
}, LoadCustomAttribute);

class HrefCustomAttribute {
    get Ns() {
        return this.ys.hasAttribute("external") || this.ys.hasAttribute("data-external");
    }
    constructor() {
        this.ys = e(T);
        this.Ze = e(tt);
        this.we = e(rt);
        this.ks = false;
        if (this.Ze.options.useHref && this.ys.nodeName === "A") {
            const t = e(R).name;
            switch (this.ys.getAttribute("target")) {
              case null:
              case t:
              case "_self":
                this.Cs = true;
                break;

              default:
                this.Cs = false;
                break;
            }
        } else {
            this.Cs = false;
        }
    }
    binding() {
        if (!this.ks) {
            this.ks = true;
            this.Cs = this.Cs && I(this.ys, _.getDefinition(LoadCustomAttribute).key) === null;
        }
        this.valueChanged(this.value);
        this.ys.addEventListener("click", this);
    }
    unbinding() {
        this.ys.removeEventListener("click", this);
    }
    valueChanged(t) {
        if (t == null) {
            this.ys.removeAttribute("href");
        } else {
            if (this.Ze.options.useUrlFragmentHash && this.we.isRoot && !/^[.#]/.test(t) && !this.Ns) {
                t = `#${t}`;
            }
            this.ys.setAttribute("href", t);
        }
    }
    handleEvent(t) {
        this.$s(t);
    }
    $s(t) {
        if (t.altKey || t.ctrlKey || t.shiftKey || t.metaKey || t.button !== 0 || this.Ns || !this.Cs) {
            return;
        }
        const e = this.ys.getAttribute("href");
        if (e !== null) {
            t.preventDefault();
            void this.Ze.load(e, {
                context: this.we
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
            mode: z
        }
    }
};

const ct = tt;

const ut = [ ct ];

const ht = ViewportCustomElement;

const lt = LoadCustomAttribute;

const ft = HrefCustomAttribute;

const pt = [ ViewportCustomElement, LoadCustomAttribute, HrefCustomAttribute ];

function configure(t, e) {
    let s = null;
    if (u(e)) {
        s = e.basePath ?? null;
    } else {
        e = {};
    }
    const i = RouterOptions.create(e);
    return t.register(l.cachedCallback(q, ((t, e, i) => {
        const n = t.get(R);
        const r = new URL(n.document.baseURI);
        r.pathname = normalizePath(s ?? r.pathname);
        return r;
    })), l.instance(it, i), l.instance(RouterOptions, i), P.creating(tt, (t => {})), P.hydrated(h, RouteContext.setRoot), P.activated(tt, (t => t.start(true))), P.deactivated(tt, (t => t.stop())), ...ut, ...pt);
}

const gt = {
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
        this.ys = t;
        this._s = t.scrollTop;
        this.Ts = t.scrollLeft;
    }
    static Is(t) {
        return t.scrollTop > 0 || t.scrollLeft > 0;
    }
    Ps() {
        this.ys.scrollTo(this.Ts, this._s);
        this.ys = null;
    }
}

function restoreState(t) {
    t.Ps();
}

class HostElementState {
    constructor(t) {
        this.Vs = [];
        this.As(t.children);
    }
    As(t) {
        let e;
        for (let s = 0, i = t.length; s < i; ++s) {
            e = t[s];
            if (ScrollState.Is(e)) {
                this.Vs.push(new ScrollState(e));
            }
            this.As(e.children);
        }
    }
    Ps() {
        this.Vs.forEach(restoreState);
        this.Vs = null;
    }
}

const dt = /*@__PURE__*/ t.createInterface("IStateManager", (t => t.singleton(ScrollStateManager)));

class ScrollStateManager {
    constructor() {
        this.Os = new WeakMap;
    }
    saveState(t) {
        this.Os.set(t.host, new HostElementState(t.host));
    }
    restoreState(t) {
        const e = this.Os.get(t.host);
        if (e !== void 0) {
            e.Ps();
            this.Os.delete(t.host);
        }
    }
}

const wt = /*@__PURE__*/ t.createInterface("ICurrentRoute", (t => t.singleton(CurrentRoute)));

class CurrentRoute {
    constructor() {
        this.path = "";
        this.url = "";
        this.title = "";
        this.query = new URLSearchParams;
        this.parameterInformation = n;
        const t = e(tt);
        const s = t.options;
        e(D).subscribe("au:router:navigation-end", (e => {
            const i = e.finalInstructions;
            U((() => {
                this.path = i.toPath();
                this.url = i.toUrl(true, s.Ve);
                this.title = t.Me();
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
        const s = Object.create(null);
        Object.assign(s, e?.params ?? t.params);
        Reflect.deleteProperty(s, V);
        return new ParameterInformation(e?.endpoint.route.handler ?? null, t.viewport, s, t.children.map((t => this.create(t))));
    }
}

export { K as AST, H as AuNavId, ComponentExpression, CompositeSegmentExpression, ut as DefaultComponents, pt as DefaultResources, HrefCustomAttribute, ft as HrefCustomAttributeRegistration, wt as ICurrentRoute, F as ILocationManager, rt as IRouteContext, tt as IRouter, D as IRouterEvents, it as IRouterOptions, dt as IStateManager, LoadCustomAttribute, lt as LoadCustomAttributeRegistration, LocationChangeEvent, NavigationCancelEvent, NavigationEndEvent, NavigationErrorEvent, NavigationOptions, NavigationStartEvent, ParameterExpression, ParameterListExpression, W as Route, RouteConfig, RouteContext, RouteExpression, RouteNode, RouteTree, Router, gt as RouterConfiguration, RouterOptions, ct as RouterRegistration, ScopedSegmentExpression, SegmentExpression, SegmentGroupExpression, Transition, ViewportAgent, ViewportCustomElement, ht as ViewportCustomElementRegistration, ViewportExpression, st as fragmentUrlParser, isManagedState, et as pathUrlParser, route, toManagedState };
//# sourceMappingURL=index.mjs.map
