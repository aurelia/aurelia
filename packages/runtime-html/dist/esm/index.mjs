import { Protocol as t, isString as e, createLookup as i, getPrototypeChain as s, noop as n, DI as r, Registration as l, firstDefined as h, mergeArrays as a, isFunction as c, resourceBaseName as u, resource as f, getResourceKeyFor as d, resolve as m, IPlatform as g, emptyArray as p, ILogger as v, registrableMetadataKey as x, isArray as y, all as b, isObject as w, own as k, InstanceProvider as C, IContainer as B, areEqual as S, optionalResource as A, optional as R, onResolveAll as T, isPromise as E, onResolve as L, fromDefinitionOrDefault as M, pascalCase as D, fromAnnotationOrDefinitionOrTypeOrDefault as P, fromAnnotationOrTypeOrDefault as q, isSymbol as I, createImplementationRegister as _, kebabCase as V, IServiceLocator as F, emptyObject as H, isNumber as O, isSet as $, isMap as N, transient as W } from "@aurelia/kernel";

import { BindingMode as j, InstructionType as z, ITemplateCompiler as U, IInstruction as G, TemplateCompilerHooks as X, IAttrMapper as K, IResourceResolver as Q, TemplateCompiler as Y, AttributePattern as Z, AttrSyntax as J, RefAttributePattern as tt, DotSeparatedAttributePattern as et, EventAttributePattern as it, AtPrefixedTriggerAttributePattern as st, ColonPrefixedBindAttributePattern as nt, DefaultBindingCommand as rt, OneTimeBindingCommand as ot, FromViewBindingCommand as lt, ToViewBindingCommand as ht, TwoWayBindingCommand as at, ForBindingCommand as ct, RefBindingCommand as ut, TriggerBindingCommand as ft, CaptureBindingCommand as dt, ClassBindingCommand as mt, StyleBindingCommand as gt, AttrBindingCommand as pt, SpreadValueBindingCommand as vt } from "@aurelia/template-compiler";

export { BindingCommand, BindingMode } from "@aurelia/template-compiler";

import { Metadata as xt } from "@aurelia/metadata";

import { AccessorType as yt, astEvaluate as bt, queueAsyncTask as wt, queueTask as kt, astBind as Ct, astUnbind as Bt, connectable as St, astAssign as At, subscriberCollection as Rt, Scope as Tt, IObserverLocator as Et, ConnectableSwitcher as Lt, ProxyObservable as Mt, ICoercionConfiguration as Dt, tasksSettled as Pt, PropertyAccessor as qt, INodeObserverLocator as It, IDirtyChecker as _t, getObserverLookup as Vt, SetterObserver as Ft, createIndexMap as Ht, getCollectionObserver as Ot, BindingContext as $t, DirtyChecker as Nt } from "@aurelia/runtime";

import { BrowserPlatform as Wt } from "@aurelia/platform-browser";

import { AccessScopeExpression as jt, IExpressionParser as zt, ExpressionParser as Ut } from "@aurelia/expression-parser";

typeof SuppressedError === "function" ? SuppressedError : function(t, e, i) {
    var s = new Error(i);
    return s.name = "SuppressedError", s.error = t, s.suppressed = e, s;
};

const {default: Gt, oneTime: Xt, toView: Kt, fromView: Qt, twoWay: Yt} = j;

const Zt = xt.get;

const Jt = xt.has;

const te = xt.define;

const {annotation: ee} = t;

const ie = ee.keyFor;

const se = Object;

const ne = String;

const re = se.prototype;

const oe = re.hasOwnProperty;

const le = se.freeze;

const he = se.assign;

const ae = se.getOwnPropertyNames;

const ce = se.keys;

const ue = /*@__PURE__*/ i();

const isDataAttribute = (t, i, s) => {
    if (ue[i] === true) {
        return true;
    }
    if (!e(i)) {
        return false;
    }
    const n = i.slice(0, 5);
    return ue[i] = n === "aria-" || n === "data-" || s.isStandardSvgAttribute(t, i);
};

const rethrow = t => {
    throw t;
};

const fe = Reflect.defineProperty;

const defineHiddenProp = (t, e, i) => {
    fe(t, e, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: i
    });
    return i;
};

const addSignalListener = (t, e, i) => t.addSignalListener(e, i);

const removeSignalListener = (t, e, i) => t.removeSignalListener(e, i);

const de = "Interpolation";

const me = "IsIterator";

const ge = "IsFunction";

const pe = "IsProperty";

const ve = "pending";

const xe = "running";

const ye = yt.Observer;

const be = yt.Node;

const we = yt.Layout;

const createMappedError = (t, ...e) => {
    const i = ne(t).padStart(4, "0");
    return new Error(`AUR${i}:${e.map(ne)}`);
};

function bindable(t, s) {
    let n = void 0;
    function decorator(t, e) {
        let s;
        switch (e.kind) {
          case "getter":
          case "field":
            {
                const t = e.name;
                if (typeof t !== "string") throw createMappedError(227);
                s = t;
                break;
            }

          case "class":
            if (n == null) throw createMappedError(228);
            if (typeof n == "string") {
                s = n;
            } else {
                const t = n.name;
                if (!t) throw createMappedError(229);
                if (typeof t !== "string") throw createMappedError(227);
                s = t;
            }
            break;
        }
        const r = n == null || typeof n === "string" ? {
            name: s
        } : n;
        const l = e.metadata[ke] ??= i();
        l[s] = BindableDefinition.create(s, r);
    }
    if (arguments.length > 1) {
        n = {};
        decorator(t, s);
        return;
    } else if (e(t)) {
        n = t;
        return decorator;
    }
    n = t === void 0 ? {} : t;
    return decorator;
}

const ke = /*@__PURE__*/ ie("bindables");

const Ce = le({
    name: ke,
    keyFrom: t => `${ke}:${t}`,
    from(...t) {
        const i = {};
        const s = Array.isArray;
        function addName(t) {
            i[t] = BindableDefinition.create(t);
        }
        function addDescription(t, e) {
            i[t] = e instanceof BindableDefinition ? e : BindableDefinition.create(t, e === true ? {} : e);
        }
        function addList(t) {
            if (s(t)) {
                t.forEach(t => e(t) ? addName(t) : addDescription(t.name, t));
            } else if (t instanceof BindableDefinition) {
                i[t.name] = t;
            } else if (t !== void 0) {
                ce(t).forEach(e => addDescription(e, t[e]));
            }
        }
        t.forEach(addList);
        return i;
    },
    getAll(t) {
        const e = [];
        const i = s(t);
        let n = i.length;
        let r;
        while (--n >= 0) {
            r = i[n];
            const t = Zt(ke, r);
            if (t == null) continue;
            e.push(...Object.values(t));
        }
        return e;
    },
    i(t, e) {
        let s = Zt(ke, e);
        if (s == null) {
            te(s = i(), e, ke);
        }
        s[t.name] = t;
    }
});

class BindableDefinition {
    constructor(t, e, i, s, n, r) {
        this.attribute = t;
        this.callback = e;
        this.mode = i;
        this.primary = s;
        this.name = n;
        this.set = r;
    }
    static toAttr(t) {
        return this.h[t] ??= t.replace(/([A-Z])/g, (t, e) => `-${e.toLowerCase()}`);
    }
    static create(t, i = {}) {
        const s = i.mode ?? Kt;
        return new BindableDefinition(i.attribute ?? BindableDefinition.toAttr(t), i.callback ?? `${t}Changed`, e(s) ? j[s] ?? Gt : s, i.primary ?? false, i.name ?? t, i.set ?? getInterceptor(i));
    }
}

BindableDefinition.h = {};

function coercer(t, e) {
    e.addInitializer(function() {
        Be.define(this, e.name);
    });
}

const Be = {
    key: /*@__PURE__*/ ie("coercer"),
    define(t, e) {
        te(t[e].bind(t), t, Be.key);
    },
    for(t) {
        return Zt(Be.key, t);
    }
};

function getInterceptor(t = {}) {
    const e = t.type ?? null;
    if (e == null) {
        return n;
    }
    let i;
    switch (e) {
      case Number:
      case Boolean:
      case String:
      case BigInt:
        i = e;
        break;

      default:
        {
            const t = e.coerce;
            i = typeof t === "function" ? t.bind(e) : Be.for(e) ?? n;
            break;
        }
    }
    return i === n ? i : createCoercer(i, t.nullable);
}

function createCoercer(t, e) {
    return function(i, s) {
        if (!s?.enableCoercion) return i;
        return (e ?? (s?.coerceNullish ?? false ? false : true)) && i == null ? i : t(i, s);
    };
}

const Se = r.createInterface;

const Ae = l.singleton;

const Re = l.aliasTo;

const Te = l.instance;

l.callback;

l.transient;

const registerResolver = (t, e, i) => t.registerResolver(e, i);

function alias(...t) {
    return function(e, i) {
        i.addInitializer(function() {
            const e = ie("aliases");
            const i = Zt(e, this);
            if (i === void 0) {
                te(t, this, e);
            } else {
                i.push(...t);
            }
        });
    };
}

function registerAliases(t, e, i, s) {
    for (let n = 0, r = t.length; n < r; ++n) {
        Re(i, e.keyFrom(t[n])).register(s);
    }
}

const Ee = "custom-element";

const Le = "custom-attribute";

const getDefinitionFromStaticAu = (t, e, i, s = "__au_static_resource__") => {
    let n = Zt(s, t);
    if (n == null) {
        if (t.$au?.type === e) {
            n = i(t.$au, t);
            te(n, t, s);
        }
    }
    return n;
};

function bindingBehavior(t) {
    return function(e, i) {
        i.addInitializer(function() {
            Pe.define(t, this);
        });
        return e;
    };
}

class BindingBehaviorDefinition {
    constructor(t, e, i, s) {
        this.Type = t;
        this.name = e;
        this.aliases = i;
        this.key = s;
    }
    static create(t, i) {
        let s;
        let n;
        if (e(t)) {
            s = t;
            n = {
                name: s
            };
        } else {
            s = t.name;
            n = t;
        }
        return new BindingBehaviorDefinition(i, h(getBehaviorAnnotation(i, "name"), s), a(getBehaviorAnnotation(i, "aliases"), n.aliases, i.aliases), Pe.keyFrom(s));
    }
    register(t, e) {
        const i = this.Type;
        const s = typeof e === "string" ? getBindingBehaviorKeyFrom(e) : this.key;
        const n = this.aliases;
        if (!t.has(s, false)) {
            t.register(t.has(i, false) ? null : Ae(i, i), Re(i, s), ...n.map(t => Re(i, getBindingBehaviorKeyFrom(t))));
        }
    }
}

const Me = "binding-behavior";

const De = /*@__PURE__*/ d(Me);

const getBehaviorAnnotation = (t, e) => Zt(ie(e), t);

const getBindingBehaviorKeyFrom = t => `${De}:${t}`;

const Pe = /*@__PURE__*/ le({
    name: De,
    keyFrom: getBindingBehaviorKeyFrom,
    isType(t) {
        return c(t) && (Jt(De, t) || t.$au?.type === Me);
    },
    define(t, e) {
        const i = BindingBehaviorDefinition.create(t, e);
        const s = i.Type;
        te(i, s, De, u);
        return s;
    },
    getDefinition(t) {
        const e = Zt(De, t) ?? getDefinitionFromStaticAu(t, Me, BindingBehaviorDefinition.create);
        if (e === void 0) {
            throw createMappedError(151, t);
        }
        return e;
    },
    find(t, e) {
        const i = t.find(Me, e);
        return i == null ? null : Zt(De, i) ?? getDefinitionFromStaticAu(i, Me, BindingBehaviorDefinition.create) ?? null;
    },
    get(t, e) {
        return t.get(f(getBindingBehaviorKeyFrom(e)));
    }
});

const qe = new Map;

const createConfig = t => ({
    type: Me,
    name: t
});

class BindingModeBehavior {
    bind(t, e) {
        qe.set(e, e.mode);
        e.mode = this.mode;
    }
    unbind(t, e) {
        e.mode = qe.get(e);
        qe.delete(e);
    }
}

class OneTimeBindingBehavior extends BindingModeBehavior {
    get mode() {
        return Xt;
    }
}

OneTimeBindingBehavior.$au = createConfig("oneTime");

class ToViewBindingBehavior extends BindingModeBehavior {
    get mode() {
        return Kt;
    }
}

ToViewBindingBehavior.$au = createConfig("toView");

class FromViewBindingBehavior extends BindingModeBehavior {
    get mode() {
        return Qt;
    }
}

FromViewBindingBehavior.$au = createConfig("fromView");

class TwoWayBindingBehavior extends BindingModeBehavior {
    get mode() {
        return Yt;
    }
}

TwoWayBindingBehavior.$au = createConfig("twoWay");

const Ie = new WeakMap;

const _e = 200;

class DebounceBindingBehavior {
    constructor() {
        this.p = m(g);
    }
    bind(t, i, s, n) {
        const r = {
            type: "debounce",
            delay: s ?? _e,
            now: this.p.performanceNow,
            queue: this.p.taskQueue,
            signals: e(n) ? [ n ] : n ?? p
        };
        const l = i.limit?.(r);
        if (l == null) ; else {
            Ie.set(i, l);
        }
    }
    unbind(t, e) {
        Ie.get(e)?.dispose();
        Ie.delete(e);
    }
}

DebounceBindingBehavior.$au = {
    type: Me,
    name: "debounce"
};

const Ve = /*@__PURE__*/ Se("ISignaler", t => t.singleton(Signaler));

class Signaler {
    constructor() {
        this.signals = i();
    }
    dispatchSignal(t) {
        const e = this.signals[t];
        if (e === undefined) {
            return;
        }
        let i;
        for (i of e.keys()) {
            i.handleChange(undefined, undefined);
        }
    }
    addSignalListener(t, e) {
        (this.signals[t] ??= new Set).add(e);
    }
    removeSignalListener(t, e) {
        this.signals[t]?.delete(e);
    }
}

class SignalBindingBehavior {
    constructor() {
        this.u = new Map;
        this.C = m(Ve);
    }
    bind(t, e, ...i) {
        if (!("handleChange" in e)) {
            throw createMappedError(817);
        }
        if (i.length === 0) {
            throw createMappedError(818);
        }
        this.u.set(e, i);
        let s;
        for (s of i) {
            addSignalListener(this.C, s, e);
        }
    }
    unbind(t, e) {
        const i = this.u.get(e);
        this.u.delete(e);
        let s;
        for (s of i) {
            removeSignalListener(this.C, s, e);
        }
    }
}

SignalBindingBehavior.$au = {
    type: Me,
    name: "signal"
};

const Fe = new WeakMap;

const He = 200;

class ThrottleBindingBehavior {
    constructor() {
        ({performanceNow: this.B, taskQueue: this.A} = m(g));
    }
    bind(t, i, s, n) {
        const r = {
            type: "throttle",
            delay: s ?? He,
            now: this.B,
            queue: this.A,
            signals: e(n) ? [ n ] : n ?? p
        };
        const l = i.limit?.(r);
        if (l == null) ; else {
            Fe.set(i, l);
        }
    }
    unbind(t, e) {
        Fe.get(e)?.dispose();
        Fe.delete(e);
    }
}

ThrottleBindingBehavior.$au = {
    type: Me,
    name: "throttle"
};

const Oe = /*@__PURE__*/ Se("IAppTask");

class $AppTask {
    constructor(t, e, i) {
        this.c = void 0;
        this.slot = t;
        this.k = e;
        this.cb = i;
    }
    register(t) {
        return this.c = t.register(Te(Oe, this));
    }
    run() {
        const t = this.k;
        const e = this.cb;
        return t === null ? e() : e(this.c.get(t));
    }
}

const $e = le({
    creating: createAppTaskSlotHook("creating"),
    hydrating: createAppTaskSlotHook("hydrating"),
    hydrated: createAppTaskSlotHook("hydrated"),
    activating: createAppTaskSlotHook("activating"),
    activated: createAppTaskSlotHook("activated"),
    deactivating: createAppTaskSlotHook("deactivating"),
    deactivated: createAppTaskSlotHook("deactivated")
});

function createAppTaskSlotHook(t) {
    function appTaskFactory(e, i) {
        if (c(i)) {
            return new $AppTask(t, e, i);
        }
        return new $AppTask(t, null, e);
    }
    return appTaskFactory;
}

const Ne = g;

class Refs {}

const We = /*@__PURE__*/ (() => {
    const t = new WeakMap;
    let e = false;
    return new class {
        get hideProp() {
            return e;
        }
        set hideProp(t) {
            e = t;
        }
        get(e, i) {
            return t.get(e)?.[i] ?? null;
        }
        set(i, s, n) {
            const r = t.get(i) ?? (t.set(i, new Refs), t.get(i));
            if (s in r) {
                throw new Error(`Node already associated with a controller, remove the ref "${s}" first before associating with another controller`);
            }
            if (!e) {
                i.$au ??= r;
            }
            return r[s] = n;
        }
        clear(e) {
            const i = t.get(e);
            if (i == null) return;
            t.delete(e);
            if (e.$au != null) {
                delete e.$au;
            }
        }
    };
})();

const je = /*@__PURE__*/ Se("INode");

function watch(t, e, i) {
    if (t == null) {
        throw createMappedError(772);
    }
    return function decorator(s, n) {
        const r = n.kind === "class";
        let l;
        let h;
        if (r) {
            if (!c(e) && (e == null || !(e in s.prototype))) {
                throw createMappedError(773, `${ne(e)}@${s.name}}`);
            }
            h = e;
            l = i ?? {};
        } else {
            if (!c(s) || n.static) {
                throw createMappedError(774, n.name);
            }
            h = s;
            l = e ?? {};
        }
        const a = new WatchDefinition(t, h, l.flush);
        if (r) {
            addDefinition(s);
        } else {
            let t = false;
            n.addInitializer(function() {
                if (!t) {
                    t = true;
                    addDefinition(this.constructor);
                }
            });
        }
        function addDefinition(t) {
            ze.add(t, a);
            if (isAttributeType(t)) {
                getAttributeDefinition(t).watches.push(a);
            }
            if (isElementType(t)) {
                getElementDefinition(t).watches.push(a);
            }
        }
    };
}

class WatchDefinition {
    constructor(t, e, i = "async") {
        this.expression = t;
        this.callback = e;
        this.flush = i;
    }
}

const ze = /*@__PURE__*/ (() => {
    const t = new WeakMap;
    return le({
        add(e, i) {
            let s = t.get(e);
            if (s == null) {
                t.set(e, s = []);
            }
            s.push(i);
        },
        getDefinitions(e) {
            return t.get(e) ?? p;
        }
    });
})();

function customAttribute(t) {
    return function(e, i) {
        i.addInitializer(function() {
            defineAttribute(t, this);
        });
        return e;
    };
}

function templateController(t) {
    return function(i, s) {
        s.addInitializer(function() {
            defineAttribute(e(t) ? {
                isTemplateController: true,
                name: t
            } : {
                isTemplateController: true,
                ...t
            }, this);
        });
        return i;
    };
}

class CustomAttributeDefinition {
    get type() {
        return Le;
    }
    constructor(t, e, i, s, n, r, l, h, a, c, u) {
        this.Type = t;
        this.name = e;
        this.aliases = i;
        this.key = s;
        this.defaultBindingMode = n;
        this.isTemplateController = r;
        this.bindables = l;
        this.noMultiBindings = h;
        this.watches = a;
        this.dependencies = c;
        this.containerStrategy = u;
    }
    static create(t, i) {
        let s;
        let n;
        if (e(t)) {
            s = t;
            n = {
                name: s
            };
        } else {
            s = t.name;
            n = t;
        }
        const r = h(getAttributeAnnotation(i, "defaultBindingMode"), n.defaultBindingMode, i.defaultBindingMode, Kt);
        for (const t of Object.values(Ce.from(n.bindables))) {
            Ce.i(t, i);
        }
        return new CustomAttributeDefinition(i, h(getAttributeAnnotation(i, "name"), s), a(getAttributeAnnotation(i, "aliases"), n.aliases, i.aliases), getAttributeKeyFrom(s), e(r) ? j[r] ?? Gt : r, h(getAttributeAnnotation(i, "isTemplateController"), n.isTemplateController, i.isTemplateController, false), Ce.from(...Ce.getAll(i), getAttributeAnnotation(i, "bindables"), i.bindables, n.bindables), h(getAttributeAnnotation(i, "noMultiBindings"), n.noMultiBindings, i.noMultiBindings, false), a(ze.getDefinitions(i), i.watches), a(getAttributeAnnotation(i, "dependencies"), n.dependencies, i.dependencies), h(getAttributeAnnotation(i, "containerStrategy"), n.containerStrategy, i.containerStrategy, "reuse"));
    }
    register(t, e) {
        const i = this.Type;
        const s = typeof e === "string" ? getAttributeKeyFrom(e) : this.key;
        const n = this.aliases;
        if (!t.has(s, false)) {
            t.register(t.has(i, false) ? null : Ae(i, i), Re(i, s), ...n.map(t => Re(i, getAttributeKeyFrom(t))));
        } else {
            if (CustomAttributeDefinition.warnDuplicate) {
                t.get(v).warn(createMappedError(154, this.name));
            }
        }
    }
    toString() {
        return `au:ca:${this.name}`;
    }
}

CustomAttributeDefinition.warnDuplicate = true;

const Ue = "custom-attribute";

const Ge = /*@__PURE__*/ d(Ue);

const getAttributeKeyFrom = t => `${Ge}:${t}`;

const getAttributeAnnotation = (t, e) => Zt(ie(e), t);

const isAttributeType = t => c(t) && (Jt(Ge, t) || t.$au?.type === Ue);

const findAttributeControllerFor = (t, e) => We.get(t, getAttributeKeyFrom(e)) ?? void 0;

const defineAttribute = (t, e) => {
    const i = CustomAttributeDefinition.create(t, e);
    const s = i.Type;
    te(i, s, Ge, u);
    return s;
};

const getAttributeDefinition = t => {
    const e = Zt(Ge, t) ?? getDefinitionFromStaticAu(t, Ue, CustomAttributeDefinition.create);
    if (e === void 0) {
        throw createMappedError(759, t);
    }
    return e;
};

const findClosestControllerByName = (t, i) => {
    let s = "";
    let n = "";
    if (e(i)) {
        s = getAttributeKeyFrom(i);
        n = i;
    } else {
        const t = getAttributeDefinition(i);
        s = t.key;
        n = t.name;
    }
    let r = t;
    while (r !== null) {
        const t = We.get(r, s);
        if (t?.is(n)) {
            return t;
        }
        r = getEffectiveParentNode(r);
    }
    return null;
};

const Xe = /*@__PURE__*/ le({
    name: Ge,
    keyFrom: getAttributeKeyFrom,
    isType: isAttributeType,
    for: findAttributeControllerFor,
    closest: findClosestControllerByName,
    define: defineAttribute,
    getDefinition: getAttributeDefinition,
    annotate(t, e, i) {
        te(i, t, ie(e));
    },
    getAnnotation: getAttributeAnnotation,
    find(t, e) {
        const i = t.find(Ue, e);
        return i === null ? null : Zt(Ge, i) ?? getDefinitionFromStaticAu(i, Ue, CustomAttributeDefinition.create) ?? null;
    }
});

const Ke = /*@__PURE__*/ Se("ILifecycleHooks");

class LifecycleHooksEntry {
    constructor(t, e) {
        this.definition = t;
        this.instance = e;
    }
}

class LifecycleHooksDefinition {
    constructor(t, e) {
        this.Type = t;
        this.propertyNames = e;
    }
    static create(t, e) {
        const i = new Set;
        let s = e.prototype;
        while (s !== re) {
            for (const t of ae(s)) {
                if (t !== "constructor" && !t.startsWith("_")) {
                    i.add(t);
                }
            }
            s = Object.getPrototypeOf(s);
        }
        return new LifecycleHooksDefinition(e, i);
    }
}

const Qe = /*@__PURE__*/ (() => {
    const t = new WeakMap;
    const e = new WeakMap;
    return le({
        define(t, i) {
            const s = LifecycleHooksDefinition.create(t, i);
            const n = s.Type;
            e.set(n, s);
            return {
                register(t) {
                    Ae(Ke, n).register(t);
                }
            };
        },
        resolve(i) {
            let s = t.get(i);
            if (s === void 0) {
                t.set(i, s = new LifecycleHooksLookupImpl);
                const n = i.root;
                const r = n === i ? i.getAll(Ke) : i.has(Ke, false) ? n.getAll(Ke).concat(i.getAll(Ke)) : n.getAll(Ke);
                let l;
                let h;
                let a;
                let c;
                let u;
                for (l of r) {
                    h = e.get(l.constructor);
                    a = new LifecycleHooksEntry(h, l);
                    for (c of h.propertyNames) {
                        u = s[c];
                        if (u === void 0) {
                            s[c] = [ a ];
                        } else {
                            u.push(a);
                        }
                    }
                }
            }
            return s;
        }
    });
})();

class LifecycleHooksLookupImpl {}

function lifecycleHooks(t, e) {
    function decorator(t, e) {
        const i = e?.metadata ?? (t[Symbol.metadata] ??= Object.create(null));
        i[x] = Qe.define({}, t);
        return t;
    }
    return t == null ? decorator : decorator(t, e);
}

function valueConverter(t) {
    return function(e, i) {
        i.addInitializer(function() {
            Je.define(t, this);
        });
        return e;
    };
}

class ValueConverterDefinition {
    constructor(t, e, i, s) {
        this.Type = t;
        this.name = e;
        this.aliases = i;
        this.key = s;
    }
    static create(t, i) {
        let s;
        let n;
        if (e(t)) {
            s = t;
            n = {
                name: s
            };
        } else {
            s = t.name;
            n = t;
        }
        return new ValueConverterDefinition(i, h(getConverterAnnotation(i, "name"), s), a(getConverterAnnotation(i, "aliases"), n.aliases, i.aliases), Je.keyFrom(s));
    }
    register(t, e) {
        const i = this.Type;
        const s = typeof e === "string" ? getValueConverterKeyFrom(e) : this.key;
        const n = this.aliases;
        if (!t.has(s, false)) {
            t.register(t.has(i, false) ? null : Ae(i, i), Re(i, s), ...n.map(t => Re(i, getValueConverterKeyFrom(t))));
        }
    }
}

const Ye = "value-converter";

const Ze = /*@__PURE__*/ d(Ye);

const getConverterAnnotation = (t, e) => Zt(ie(e), t);

const getValueConverterKeyFrom = t => `${Ze}:${t}`;

const Je = le({
    name: Ze,
    keyFrom: getValueConverterKeyFrom,
    isType(t) {
        return c(t) && (Jt(Ze, t) || t.$au?.type === Ye);
    },
    define(t, e) {
        const i = ValueConverterDefinition.create(t, e);
        const s = i.Type;
        te(i, s, Ze, u);
        return s;
    },
    getDefinition(t) {
        const e = Zt(Ze, t) ?? getDefinitionFromStaticAu(t, Ye, ValueConverterDefinition.create);
        if (e === void 0) {
            throw createMappedError(152, t);
        }
        return e;
    },
    annotate(t, e, i) {
        te(i, t, ie(e));
    },
    getAnnotation: getConverterAnnotation,
    find(t, e) {
        const i = t.find(Ye, e);
        return i == null ? null : Zt(Ze, i) ?? getDefinitionFromStaticAu(i, Ye, ValueConverterDefinition.create) ?? null;
    },
    get(t, e) {
        return t.get(f(getValueConverterKeyFrom(e)));
    }
});

class BindingTargetSubscriber {
    constructor(t, e) {
        this.v = void 0;
        this.b = t;
        this.R = e;
    }
    flush() {
        if (this.b.isBound) {
            this.b.updateSource(this.v);
        }
    }
    handleChange(t, e) {
        const i = this.b;
        if (t !== bt(i.ast, i.s, i, null)) {
            this.v = t;
            this.R.add(this);
        }
    }
}

const ti = /*@__PURE__*/ (() => {
    function useScope(t) {
        this.s = t;
    }
    return t => {
        defineHiddenProp(t.prototype, "useScope", useScope);
    };
})();

const ei = /*@__PURE__*/ (() => {
    class ResourceLookup {}
    const t = new WeakMap;
    const e = new WeakMap;
    const i = new WeakMap;
    function evaluatorGet(t) {
        return this.l.get(t);
    }
    function evaluatorGetBehavior(t, i) {
        let s = e.get(t);
        if (s == null) {
            e.set(t, s = new ResourceLookup);
        }
        return s[i] ??= Pe.get(t.l, i);
    }
    function evaluatorBindBehavior(t, e, s) {
        const n = evaluatorGetBehavior(this, t);
        if (n == null) {
            throw createMappedError(101, t);
        }
        let r = i.get(this);
        if (r == null) {
            i.set(this, r = {});
        }
        if (r[t]) {
            throw createMappedError(102, t);
        }
        n.bind?.(e, this, ...s);
    }
    function evaluatorUnbindBehavior(t, e) {
        const s = evaluatorGetBehavior(this, t);
        const n = i.get(this);
        s?.unbind?.(e, this);
        if (n != null) {
            n[t] = false;
        }
    }
    function evaluatorGetConverter(e, i) {
        let s = t.get(e);
        if (s == null) {
            t.set(e, s = new ResourceLookup);
        }
        return s[i] ??= Je.get(e.l, i);
    }
    function evaluatorBindConverter(t) {
        const e = evaluatorGetConverter(this, t);
        if (e == null) {
            throw createMappedError(103, t);
        }
        const i = e.signals;
        if (i != null) {
            const t = this.l.get(Ve);
            const e = i.length;
            let s = 0;
            for (;s < e; ++s) {
                t.addSignalListener(i[s], this);
            }
        }
    }
    function evaluatorUnbindConverter(t) {
        const e = evaluatorGetConverter(this, t);
        if (e?.signals === void 0) {
            return;
        }
        const i = this.l.get(Ve);
        let s = 0;
        for (;s < e.signals.length; ++s) {
            i.removeSignalListener(e.signals[s], this);
        }
    }
    function evaluatorUseConverter(t, e, i, s) {
        const n = evaluatorGetConverter(this, t);
        if (n == null) {
            throw createMappedError(103, t);
        }
        const r = n.withContext === true;
        let l = null;
        if (r) {
            const t = this.l.get(ys);
            const e = t.controller;
            const i = e.viewModel;
            l = {
                source: i,
                binding: this
            };
        }
        switch (e) {
          case "toView":
            {
                if ("toView" in n) {
                    return r ? n.toView(i, l, ...s) : n.toView(i, ...s);
                }
                return i;
            }

          case "fromView":
            {
                if ("fromView" in n) {
                    return r ? n.fromView?.(i, l, ...s) : n.fromView?.(i, ...s);
                }
                return i;
            }
        }
    }
    return t => {
        const e = t.prototype;
        defineHiddenProp(e, "get", evaluatorGet);
        defineHiddenProp(e, "bindBehavior", evaluatorBindBehavior);
        defineHiddenProp(e, "unbindBehavior", evaluatorUnbindBehavior);
        defineHiddenProp(e, "bindConverter", evaluatorBindConverter);
        defineHiddenProp(e, "unbindConverter", evaluatorUnbindConverter);
        defineHiddenProp(e, "useConverter", evaluatorUseConverter);
    };
})();

const ii = /*@__PURE__*/ Se("IFlushQueue", t => t.singleton(FlushQueue));

class FlushQueue {
    constructor() {
        this.T = false;
        this.L = new Set;
    }
    get count() {
        return this.L.size;
    }
    add(t) {
        this.L.add(t);
        if (this.T) {
            return;
        }
        this.T = true;
        try {
            this.L.forEach(flushItem);
        } finally {
            this.T = false;
        }
    }
    clear() {
        this.L.clear();
        this.T = false;
    }
}

const flushItem = function(t, e, i) {
    i.delete(t);
    t.flush();
};

const si = /*@__PURE__*/ (() => {
    const t = new WeakSet;
    const debounced = (t, e, i) => {
        let s;
        let n;
        let r;
        let l = false;
        const callOriginalCallback = () => e(r);
        const fn = e => {
            r = e;
            if (i.isBound) {
                n = s;
                s = wt(callOriginalCallback, {
                    delay: t.delay
                });
                n?.cancel();
            } else {
                callOriginalCallback();
            }
        };
        const h = fn.dispose = () => {
            n?.cancel();
            s?.cancel();
            n = s = void 0;
        };
        fn.flush = () => {
            l = s?.status === ve;
            h();
            if (l) {
                callOriginalCallback();
            }
        };
        return fn;
    };
    const throttled = (t, e, i) => {
        let s;
        let n;
        let r = 0;
        let l = 0;
        let h;
        let a = false;
        const now = () => t.now();
        const callOriginalCallback = () => e(h);
        const fn = e => {
            h = e;
            if (i.isBound) {
                l = now() - r;
                n = s;
                if (l > t.delay) {
                    r = now();
                    callOriginalCallback();
                } else {
                    s = wt(() => {
                        r = now();
                        callOriginalCallback();
                    }, {
                        delay: t.delay - l
                    });
                }
                n?.cancel();
            } else {
                callOriginalCallback();
            }
        };
        const c = fn.dispose = () => {
            n?.cancel();
            s?.cancel();
            n = s = void 0;
        };
        fn.flush = () => {
            a = s?.status === ve;
            c();
            if (a) {
                callOriginalCallback();
            }
        };
        return fn;
    };
    return (e, i) => {
        defineHiddenProp(e.prototype, "limit", function(e) {
            if (t.has(this)) {
                throw createMappedError(9996);
            }
            t.add(this);
            const s = i(this, e);
            const n = e.signals;
            const r = n.length > 0 ? this.get(Ve) : null;
            const l = this[s];
            const callOriginal = (...t) => l.call(this, ...t);
            const h = e.type === "debounce" ? debounced(e, callOriginal, this) : throttled(e, callOriginal, this);
            const a = r ? {
                handleChange: h.flush
            } : null;
            this[s] = h;
            if (r) {
                n.forEach(t => addSignalListener(r, t, a));
            }
            return {
                dispose: () => {
                    if (r) {
                        n.forEach(t => removeSignalListener(r, t, a));
                    }
                    t.delete(this);
                    h.dispose();
                    delete this[s];
                }
            };
        });
    };
})();

const ni = ((t = new WeakSet) => e => function() {
    if (!t.has(this)) {
        t.add(this);
        e.call(this);
    }
})();

class AttributeBinding {
    constructor(t, e, i, s, n, r, l, h, a) {
        this.targetAttribute = r;
        this.targetProperty = l;
        this.mode = h;
        this.strict = a;
        this.isBound = false;
        this.s = void 0;
        this.M = false;
        this.v = void 0;
        this.boundFn = false;
        this.P = false;
        this.l = e;
        this.ast = s;
        this.q = t;
        this.target = n;
        this.oL = i;
        if ((this.P = l.indexOf(" ") > -1) && !AttributeBinding.I.has(l)) {
            AttributeBinding.I.set(l, l.split(" "));
        }
    }
    updateTarget(t) {
        const i = this.target;
        const s = this.targetAttribute;
        const n = this.targetProperty;
        switch (s) {
          case "class":
            if (this.P) {
                const e = !!t;
                for (const t of AttributeBinding.I.get(n)) {
                    i.classList.toggle(t, e);
                }
            } else {
                i.classList.toggle(n, !!t);
            }
            break;

          case "style":
            {
                let s = "";
                let r = ne(t);
                if (e(r) && r.includes("!important")) {
                    s = "important";
                    r = r.replace("!important", "");
                }
                i.style.setProperty(n, r, s);
                break;
            }

          default:
            {
                if (t == null) {
                    i.removeAttribute(s);
                } else {
                    i.setAttribute(s, ne(t));
                }
            }
        }
    }
    handleChange() {
        if (!this.isBound) return;
        if (this.M) return;
        this.M = true;
        kt(() => {
            this.M = false;
            if (!this.isBound) return;
            this.obs.version++;
            const t = bt(this.ast, this.s, this, (this.mode & Kt) > 0 ? this : null);
            this.obs.clear();
            if (t !== this.v) {
                this.v = t;
                this.updateTarget(t);
            }
        });
    }
    handleCollectionChange() {
        this.handleChange();
    }
    bind(t) {
        if (this.isBound) {
            if (this.s === t) return;
            this.unbind();
        }
        this.s = t;
        Ct(this.ast, t, this);
        if (this.mode & (Kt | Xt)) {
            this.updateTarget(this.v = bt(this.ast, t, this, (this.mode & Kt) > 0 ? this : null));
        }
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) return;
        this.isBound = false;
        Bt(this.ast, this.s, this);
        this.s = void 0;
        this.v = void 0;
        this.obs.clearAll();
    }
}

AttributeBinding.mix = ni(() => {
    ti(AttributeBinding);
    si(AttributeBinding, () => "updateTarget");
    St(AttributeBinding, null);
    ei(AttributeBinding);
});

AttributeBinding.I = new Map;

class InterpolationBinding {
    constructor(t, e, i, s, n, r, l, h) {
        this.ast = s;
        this.target = n;
        this.targetProperty = r;
        this.mode = l;
        this.strict = h;
        this.isBound = false;
        this.s = void 0;
        this.M = false;
        this.q = t;
        this.oL = i;
        this._ = i.getAccessor(n, r);
        const a = s.expressions;
        const c = this.partBindings = Array(a.length);
        const u = a.length;
        let f = 0;
        for (;u > f; ++f) {
            c[f] = new InterpolationPartBinding(a[f], n, r, e, i, h, this);
        }
    }
    V() {
        if (!this.isBound) return;
        const t = this.q.state !== us && (this._.type & we) > 0;
        if (t) {
            if (this.M) return;
            this.M = true;
            kt(() => {
                this.M = false;
                if (!this.isBound) return;
                this.updateTarget();
            });
        } else {
            this.updateTarget();
        }
    }
    updateTarget() {
        const t = this.partBindings;
        const e = this.ast;
        const i = this.target;
        const s = this.targetProperty;
        const n = e.parts;
        const r = t.length;
        let l = "";
        let h = 0;
        if (r === 1) {
            l = n[0] + t[0].F() + n[1];
        } else {
            l = n[0];
            for (;r > h; ++h) {
                l += t[h].F() + n[h + 1];
            }
        }
        this._.setValue(l, i, s);
    }
    bind(t) {
        if (this.isBound) {
            if (this.s === t) return;
            this.unbind();
        }
        this.s = t;
        const e = this.partBindings;
        const i = e.length;
        let s = 0;
        for (;i > s; ++s) {
            e[s].bind(t);
        }
        this.updateTarget();
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) return;
        this.isBound = false;
        this.s = void 0;
        const t = this.partBindings;
        const e = t.length;
        let i = 0;
        for (;e > i; ++i) {
            t[i].unbind();
        }
    }
    useAccessor(t) {
        this._ = t;
    }
}

class InterpolationPartBinding {
    constructor(t, e, i, s, n, r, l) {
        this.ast = t;
        this.target = e;
        this.targetProperty = i;
        this.strict = r;
        this.owner = l;
        this.mode = Kt;
        this.isBound = false;
        this.v = "";
        this.boundFn = false;
        this.D = false;
        this.l = s;
        this.oL = n;
    }
    updateTarget() {
        this.owner.V();
    }
    handleChange() {
        if (!this.isBound) return;
        this.D = true;
        this.updateTarget();
    }
    handleCollectionChange() {
        if (!this.isBound) return;
        this.D = true;
        this.updateTarget();
    }
    F() {
        if (!this.D) return this.v;
        this.obs.version++;
        const t = bt(this.ast, this.s, this, (this.mode & Kt) > 0 ? this : null);
        this.obs.clear();
        this.v = t;
        if (y(t)) {
            this.observeCollection(t);
        }
        this.D = false;
        return this.v;
    }
    bind(t) {
        if (this.isBound) {
            if (this.s === t) return;
            this.unbind();
        }
        this.s = t;
        Ct(this.ast, t, this);
        this.v = bt(this.ast, this.s, this, (this.mode & Kt) > 0 ? this : null);
        if (y(this.v)) {
            this.observeCollection(this.v);
        }
        this.D = false;
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) return;
        this.isBound = false;
        this.v = void 0;
        this.D = false;
        Bt(this.ast, this.s, this);
        this.s = void 0;
        this.obs.clearAll();
    }
}

InterpolationPartBinding.mix = ni(() => {
    ti(InterpolationPartBinding);
    si(InterpolationPartBinding, () => "updateTarget");
    St(InterpolationPartBinding, null);
    ei(InterpolationPartBinding);
});

class ContentBinding {
    constructor(t, e, i, s, n, r, l) {
        this.p = s;
        this.ast = n;
        this.target = r;
        this.strict = l;
        this.isBound = false;
        this.mode = Kt;
        this.M = false;
        this.v = "";
        this.H = false;
        this.boundFn = false;
        this.l = e;
        this.q = t;
        this.oL = i;
    }
    updateTarget(t) {
        const e = this.target;
        const i = this.v;
        this.v = t;
        if (this.H) {
            i.parentNode?.removeChild(i);
            this.H = false;
        }
        if (t instanceof this.p.Node) {
            e.parentNode?.insertBefore(t, e);
            t = "";
            this.H = true;
        }
        e.textContent = ne(t ?? "");
    }
    handleChange() {
        if (!this.isBound) return;
        if (this.M) return;
        this.M = true;
        kt(() => {
            this.M = false;
            if (!this.isBound) return;
            this.obs.version++;
            const t = bt(this.ast, this.s, this, (this.mode & Kt) > 0 ? this : null);
            this.obs.clear();
            if (t !== this.v) {
                this.updateTarget(t);
            }
        });
    }
    handleCollectionChange() {
        if (!this.isBound) return;
        if (this.M) return;
        this.M = true;
        kt(() => {
            this.M = false;
            if (!this.isBound) return;
            this.obs.version++;
            const t = this.v = bt(this.ast, this.s, this, (this.mode & Kt) > 0 ? this : null);
            this.obs.clear();
            if (y(t)) {
                this.observeCollection(t);
            }
            this.updateTarget(t);
        });
    }
    bind(t) {
        if (this.isBound) {
            if (this.s === t) return;
            this.unbind();
        }
        this.s = t;
        Ct(this.ast, t, this);
        const e = this.v = bt(this.ast, this.s, this, (this.mode & Kt) > 0 ? this : null);
        if (y(e)) {
            this.observeCollection(e);
        }
        this.updateTarget(e);
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) return;
        this.isBound = false;
        Bt(this.ast, this.s, this);
        if (this.H) {
            this.v.parentNode?.removeChild(this.v);
        }
        this.s = void 0;
        this.obs.clearAll();
    }
}

ContentBinding.mix = ni(() => {
    ti(ContentBinding);
    si(ContentBinding, () => "updateTarget");
    St(ContentBinding, null);
    ei(ContentBinding);
});

class LetBinding {
    constructor(t, e, i, s, n, r) {
        this.ast = i;
        this.targetProperty = s;
        this.isBound = false;
        this.s = void 0;
        this.target = null;
        this.boundFn = false;
        this.l = t;
        this.oL = e;
        this.strict = r;
        this.O = n;
    }
    updateTarget() {
        this.target[this.targetProperty] = this.v;
    }
    handleChange() {
        if (!this.isBound) return;
        this.obs.version++;
        this.v = bt(this.ast, this.s, this, this);
        this.obs.clear();
        this.updateTarget();
    }
    handleCollectionChange() {
        this.handleChange();
    }
    bind(t) {
        if (this.isBound) {
            if (this.s === t) return;
            this.unbind();
        }
        this.s = t;
        this.target = this.O ? t.bindingContext : t.overrideContext;
        Ct(this.ast, t, this);
        this.v = bt(this.ast, this.s, this, this);
        this.updateTarget();
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) return;
        this.isBound = false;
        Bt(this.ast, this.s, this);
        this.s = void 0;
        this.obs.clearAll();
    }
}

LetBinding.mix = ni(() => {
    ti(LetBinding);
    si(LetBinding, () => "updateTarget");
    St(LetBinding, null);
    ei(LetBinding);
});

class PropertyBinding {
    constructor(t, e, i, s, n, r, l, h) {
        this.ast = s;
        this.target = n;
        this.targetProperty = r;
        this.mode = l;
        this.strict = h;
        this.isBound = false;
        this.s = void 0;
        this._ = void 0;
        this.M = false;
        this.$ = null;
        this.boundFn = false;
        this.l = e;
        this.q = t;
        this.oL = i;
    }
    updateTarget(t) {
        this._.setValue(t, this.target, this.targetProperty);
    }
    updateSource(t) {
        At(this.ast, this.s, this, null, t);
    }
    handleChange() {
        if (!this.isBound) return;
        const t = this.q.state !== us && (this._.type & we) > 0;
        if (t) {
            if (this.M) return;
            this.M = true;
            kt(() => {
                this.M = false;
                if (!this.isBound) return;
                this.N();
            });
        } else {
            this.N();
        }
    }
    N() {
        this.obs.version++;
        const t = bt(this.ast, this.s, this, (this.mode & Kt) > 0 ? this : null);
        this.obs.clear();
        this.updateTarget(t);
    }
    handleCollectionChange() {
        this.handleChange();
    }
    bind(t) {
        if (this.isBound) {
            if (this.s === t) return;
            this.unbind();
        }
        this.s = t;
        Ct(this.ast, t, this);
        const e = this.oL;
        const i = this.mode;
        let s = this._;
        if (!s) {
            if (i & Qt) {
                s = e.getObserver(this.target, this.targetProperty);
            } else {
                s = e.getAccessor(this.target, this.targetProperty);
            }
            this._ = s;
        }
        const n = (i & Kt) > 0;
        if (i & (Kt | Xt)) {
            this.updateTarget(bt(this.ast, this.s, this, n ? this : null));
        }
        if (i & Qt) {
            s.subscribe(this.$ ??= new BindingTargetSubscriber(this, this.l.get(ii)));
            if (!n) {
                this.updateSource(s.getValue(this.target, this.targetProperty));
            }
        }
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) return;
        this.isBound = false;
        if (this.$) {
            this._.unsubscribe(this.$);
            this.$ = null;
        }
        Bt(this.ast, this.s, this);
        this.s = void 0;
        this.obs.clearAll();
    }
    useTargetObserver(t) {
        this._?.unsubscribe(this);
        (this._ = t).subscribe(this);
    }
    useTargetSubscriber(t) {
        if (this.$ != null) {
            throw createMappedError(9995);
        }
        this.$ = t;
    }
}

PropertyBinding.mix = ni(() => {
    ti(PropertyBinding);
    si(PropertyBinding, t => t.mode & Qt ? "updateSource" : "updateTarget");
    St(PropertyBinding, null);
    ei(PropertyBinding);
});

class RefBinding {
    constructor(t, e, i, s, n) {
        this.oL = e;
        this.ast = i;
        this.target = s;
        this.strict = n;
        this.isBound = false;
        this.s = void 0;
        this.l = t;
    }
    updateSource() {
        if (this.isBound) {
            this.obs.version++;
            At(this.ast, this.s, this, this, this.target);
            this.obs.clear();
        } else {
            At(this.ast, this.s, this, null, null);
        }
    }
    handleChange() {
        if (this.isBound) {
            this.updateSource();
        }
    }
    handleCollectionChange() {
        if (this.isBound) {
            this.updateSource();
        }
    }
    bind(t) {
        if (this.isBound) {
            if (this.s === t) return;
            this.unbind();
        }
        this.s = t;
        Ct(this.ast, t, this);
        this.isBound = true;
        this.updateSource();
    }
    unbind() {
        if (!this.isBound) return;
        this.isBound = false;
        this.obs.clearAll();
        if (bt(this.ast, this.s, this, null) === this.target) {
            this.updateSource();
        }
        Bt(this.ast, this.s, this);
        this.s = void 0;
    }
}

RefBinding.mix = ni(() => {
    St(RefBinding, null);
    si(RefBinding, () => "updateSource");
    ti(RefBinding);
    ei(RefBinding);
});

class ListenerBindingOptions {
    constructor(t, e = false, i) {
        this.prevent = t;
        this.capture = e;
        this.onError = i;
    }
}

class ListenerBinding {
    constructor(t, e, i, s, n, r, l) {
        this.ast = e;
        this.target = i;
        this.targetEvent = s;
        this.strict = l;
        this.isBound = false;
        this.self = false;
        this.boundFn = true;
        this.W = null;
        this.l = t;
        this.j = n;
        this.W = r;
    }
    callSource(t) {
        const e = this.s.overrideContext;
        e.$event = t;
        let i = bt(this.ast, this.s, this, null);
        delete e.$event;
        if (c(i)) {
            i = i(t);
        }
        if (i !== true && this.j.prevent) {
            t.preventDefault();
        }
    }
    handleEvent(t) {
        if (this.self) {
            if (this.target !== t.composedPath()[0]) {
                return;
            }
        }
        if (this.W?.(t) !== false) {
            try {
                this.callSource(t);
            } catch (e) {
                this.j.onError(t, e);
            }
        }
    }
    bind(t) {
        if (this.isBound) {
            if (this.s === t) return;
            this.unbind();
        }
        this.s = t;
        Ct(this.ast, t, this);
        this.target.addEventListener(this.targetEvent, this, this.j);
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) return;
        this.isBound = false;
        Bt(this.ast, this.s, this);
        this.s = void 0;
        this.target.removeEventListener(this.targetEvent, this, this.j);
    }
}

ListenerBinding.mix = ni(function() {
    ti(ListenerBinding);
    si(ListenerBinding, () => "callSource");
    ei(ListenerBinding);
});

const ri = /*@__PURE__*/ Se("IEventModifier");

const oi = /*@__PURE__*/ Se("IKeyMapping", t => t.instance({
    meta: le([ "ctrl", "alt", "shift", "meta" ]),
    keys: {
        escape: "Escape",
        enter: "Enter",
        space: "Space",
        tab: "tab",
        ...Array.from({
            length: 25
        }).reduce((t, e, i) => {
            let s = String.fromCharCode(i + 65);
            t[i + 65] = s;
            s = String.fromCharCode(i + 97);
            t[i + 97] = t[s] = s;
            return t;
        }, {})
    }
}));

class ModifiedMouseEventHandler {
    constructor() {
        this.type = [ "click", "mousedown", "mousemove", "mouseup", "dblclick", "contextmenu" ];
        this.U = m(oi);
        this.G = [ "left", "middle", "right" ];
    }
    static register(t) {
        t.register(Ae(ri, ModifiedMouseEventHandler));
    }
    getHandler(t) {
        const e = t.split(/[:+.]/);
        return t => {
            let i = false;
            let s = false;
            let n;
            for (n of e) {
                switch (n) {
                  case "prevent":
                    i = true;
                    continue;

                  case "stop":
                    s = true;
                    continue;

                  case "left":
                  case "middle":
                  case "right":
                    if (t.button !== this.G.indexOf(n)) return false;
                    continue;
                }
                if (this.U.meta.includes(n) && t[`${n}Key`] !== true) {
                    return false;
                }
            }
            if (i) t.preventDefault();
            if (s) t.stopPropagation();
            return true;
        };
    }
}

class ModifiedKeyboardEventHandler {
    constructor() {
        this.U = m(oi);
        this.type = [ "keydown", "keyup" ];
    }
    static register(t) {
        t.register(Ae(ri, ModifiedKeyboardEventHandler));
    }
    getHandler(t) {
        const e = t.split(/[:+.]/);
        return t => {
            let i = false;
            let s = false;
            let n;
            for (n of e) {
                switch (n) {
                  case "prevent":
                    i = true;
                    continue;

                  case "stop":
                    s = true;
                    continue;
                }
                if (this.U.meta.includes(n)) {
                    if (t[`${n}Key`] !== true) {
                        return false;
                    }
                    continue;
                }
                const e = this.U.keys[n];
                if (e !== t.key) {
                    return false;
                }
            }
            if (i) t.preventDefault();
            if (s) t.stopPropagation();
            return true;
        };
    }
}

class ModifiedEventHandler {
    constructor() {
        this.type = [ "$ALL" ];
    }
    static register(t) {
        t.register(Ae(ri, ModifiedEventHandler));
    }
    getHandler(t) {
        const e = t.split(/[:+.]/);
        return t => {
            let i = false;
            let s = false;
            let n;
            for (n of e) {
                switch (n) {
                  case "prevent":
                    i = true;
                    continue;

                  case "stop":
                    s = true;
                    continue;
                }
            }
            if (i) t.preventDefault();
            if (s) t.stopPropagation();
            return true;
        };
    }
}

const li = /*@__PURE__*/ Se("IEventModifierHandler", t => t.instance({
    getHandler: () => null
}));

class EventModifier {
    constructor() {
        this.X = m(b(ri)).reduce((t, e) => {
            const i = y(e.type) ? e.type : [ e.type ];
            i.forEach(i => t[i] = e);
            return t;
        }, {});
    }
    static register(t) {
        t.register(Ae(li, EventModifier));
    }
    getHandler(t, i) {
        return e(i) ? (this.X[t] ?? this.X.$ALL)?.getHandler(i) ?? null : null;
    }
}

const hi = {
    register(t) {
        t.register(EventModifier, ModifiedMouseEventHandler, ModifiedKeyboardEventHandler, ModifiedEventHandler);
    }
};

const ai = /*@__PURE__*/ Se("IViewFactory");

class ViewFactory {
    constructor(t, e) {
        this.isCaching = false;
        this.h = null;
        this.K = -1;
        this.name = e.name;
        this.container = t;
        this.def = e;
    }
    setCacheSize(t, i) {
        if (t) {
            if (t === "*") {
                t = ViewFactory.maxCacheSize;
            } else if (e(t)) {
                t = parseInt(t, 10);
            }
            if (this.K === -1 || !i) {
                this.K = t;
            }
        }
        if (this.K > 0) {
            this.h = [];
        } else {
            this.h = null;
        }
        this.isCaching = this.K > 0;
    }
    canReturnToCache(t) {
        return this.h != null && this.h.length < this.K;
    }
    tryReturnToCache(t) {
        if (this.canReturnToCache(t)) {
            this.h.push(t);
            return true;
        }
        return false;
    }
    create(t) {
        const e = this.h;
        let i;
        if (e != null && e.length > 0) {
            i = e.pop();
            return i;
        }
        i = Controller.$view(this, t);
        return i;
    }
}

ViewFactory.maxCacheSize = 65535;

const ci = /*@__PURE__*/ (() => {
    const createComment = (t, e) => t.document.createComment(e);
    return t => {
        const e = createComment(t, "au-end");
        e.$start = createComment(t, "au-start");
        return e;
    };
})();

const insertManyBefore = (t, e, i) => {
    if (t === null) {
        return;
    }
    const s = i.length;
    let n = 0;
    while (s > n) {
        t.insertBefore(i[n], e);
        ++n;
    }
};

const createMutationObserver = (t, e) => new t.ownerDocument.defaultView.MutationObserver(e);

const isElement = t => t.nodeType === 1;

const ui = "default";

const fi = "au-slot";

const di = /*@__PURE__*/ Se("IAuSlotsInfo");

class AuSlotsInfo {
    constructor(t) {
        this.projectedSlots = t;
    }
}

const mi = /*@__PURE__*/ Se("IAuSlotWatcher");

class AuSlotWatcherBinding {
    constructor(t, e, i, s) {
        this.Y = new Set;
        this.Z = p;
        this.isBound = false;
        this.cb = (this.o = t)[e];
        this.slotName = i;
        this.J = s;
    }
    bind() {
        this.isBound = true;
    }
    unbind() {
        this.isBound = false;
    }
    getValue() {
        return this.Z;
    }
    watch(t) {
        if (!this.Y.has(t)) {
            this.Y.add(t);
            t.subscribe(this);
        }
    }
    unwatch(t) {
        if (this.Y.delete(t)) {
            t.unsubscribe(this);
        }
    }
    handleSlotChange(t, e) {
        if (!this.isBound) {
            return;
        }
        const i = this.Z;
        const s = [];
        const n = this.J;
        let r;
        let l;
        for (r of this.Y) {
            for (l of r === t ? e : r.nodes) {
                if (n === "$all" || isElement(l) && (n === "*" || l.matches(n))) {
                    s[s.length] = l;
                }
            }
        }
        if (s.length !== i.length || s.some((t, e) => t !== i[e])) {
            this.Z = s;
            this.cb?.call(this.o, s);
            this.subs.notify(s, i);
        }
    }
    get() {
        throw createMappedError(99, "get");
    }
}

class SlottedLifecycleHooks {
    constructor(t) {
        this.tt = t;
    }
    register(t) {
        Te(Ke, this).register(t);
    }
    hydrating(t, e) {
        const i = this.tt;
        const s = new AuSlotWatcherBinding(t, i.callback ?? `${ne(i.name)}Changed`, i.slotName ?? "default", i.query ?? "*");
        fe(t, i.name, {
            enumerable: true,
            configurable: true,
            get: he(() => s.getValue(), {
                getObserver: () => s
            }),
            set: () => {}
        });
        Te(mi, s).register(e.container);
        e.addBinding(s);
    }
}

function slotted(t, e) {
    if (!gi) {
        gi = true;
        Rt(AuSlotWatcherBinding, null);
        lifecycleHooks()(SlottedLifecycleHooks, null);
    }
    const i = ie("dependencies");
    function decorator(s, n) {
        if (n.kind !== "field") throw createMappedError(9990);
        const r = typeof t === "object" ? t : {
            query: t,
            slotName: e,
            name: ""
        };
        r.name = n.name;
        const l = n.metadata[i] ??= [];
        l.push(new SlottedLifecycleHooks(r));
    }
    return decorator;
}

let gi = false;

class SpreadBinding {
    static create(t, e, i, s, n, r, l, h) {
        const a = [];
        const c = s.renderers;
        const getHydrationContext = e => {
            let i = e;
            let s = t;
            while (s != null && i > 0) {
                s = s.parent;
                --i;
            }
            if (s == null) {
                throw createMappedError(9999);
            }
            return s;
        };
        const renderSpreadInstruction = t => {
            const s = getHydrationContext(t);
            const u = new SpreadBinding(s);
            const f = n.compileSpread(s.controller.definition, s.instruction?.captures ?? p, s.controller.container, e, i);
            let d;
            for (d of f) {
                switch (d.type) {
                  case z.spreadTransferedBinding:
                    renderSpreadInstruction(t + 1);
                    break;

                  case z.spreadElementProp:
                    c[d.instruction.type].render(u, findElementControllerFor(e), d.instruction, r, l, h);
                    break;

                  default:
                    c[d.type].render(u, e, d, r, l, h);
                }
            }
            a.push(u);
        };
        renderSpreadInstruction(0);
        return a;
    }
    get container() {
        return this.locator;
    }
    get definition() {
        return this.$controller.definition;
    }
    get state() {
        return this.$controller.state;
    }
    constructor(t) {
        this.isBound = false;
        this.et = [];
        this.locator = (this.$controller = (this.it = t).controller).container;
    }
    get(t) {
        return this.locator.get(t);
    }
    bind(t) {
        if (this.isBound) return;
        this.isBound = true;
        const e = this.scope = this.it.controller.scope.parent ?? void 0;
        if (e == null) {
            throw createMappedError(9999);
        }
        this.et.forEach(t => t.bind(e));
    }
    unbind() {
        this.et.forEach(t => t.unbind());
        this.isBound = false;
    }
    addBinding(t) {
        this.et.push(t);
    }
    addChild(t) {
        if (t.vmKind !== hs) {
            throw createMappedError(9998);
        }
        this.$controller.addChild(t);
    }
}

class SpreadValueBinding {
    constructor(t, e, i, s, n, r, l) {
        this.target = e;
        this.targetKeys = i;
        this.ast = s;
        this.strict = l;
        this.isBound = false;
        this.s = void 0;
        this.boundFn = false;
        this.st = {};
        this.nt = new WeakMap;
        this.q = t;
        this.oL = n;
        this.l = r;
    }
    updateTarget() {
        this.obs.version++;
        const t = bt(this.ast, this.s, this, this);
        this.obs.clear();
        this.rt(t, true);
    }
    handleChange() {
        if (!this.isBound) return;
        this.updateTarget();
    }
    handleCollectionChange() {
        if (!this.isBound) return;
        this.updateTarget();
    }
    bind(t) {
        if (this.isBound) {
            if (this.s === t) return;
            this.unbind();
        }
        this.isBound = true;
        this.s = t;
        Ct(this.ast, t, this);
        const e = bt(this.ast, t, this, this);
        this.rt(e, false);
    }
    unbind() {
        if (!this.isBound) return;
        this.isBound = false;
        Bt(this.ast, this.s, this);
        this.s = void 0;
        let t;
        for (t in this.st) {
            this.st[t].unbind();
        }
    }
    rt(t, e) {
        let i;
        if (!w(t)) {
            for (i in this.st) {
                this.st[i]?.unbind();
            }
            return;
        }
        let s;
        let n = this.nt.get(t);
        if (n == null) {
            this.nt.set(t, n = Tt.fromParent(this.s, t));
        }
        for (i of this.targetKeys) {
            s = this.st[i];
            if (i in t) {
                if (s == null) {
                    s = this.st[i] = new PropertyBinding(this.q, this.l, this.oL, SpreadValueBinding.ot[i] ??= new jt(i, 0), this.target, i, j.toView, this.strict);
                }
                s.bind(n);
            } else if (e) {
                s?.unbind();
            }
        }
    }
}

SpreadValueBinding.mix = ni(() => {
    ti(SpreadValueBinding);
    si(SpreadValueBinding, () => "updateTarget");
    St(SpreadValueBinding, null);
    ei(SpreadValueBinding);
});

SpreadValueBinding.ot = {};

const addListener = (t, e, i, s) => {
    t.addEventListener(e, i, s);
};

const removeListener = (t, e, i, s) => {
    t.removeEventListener(e, i, s);
};

const mixinNodeObserverUseConfig = t => {
    let e;
    const i = t.prototype;
    defineHiddenProp(i, "subscribe", function(t) {
        if (this.subs.add(t) && this.subs.count === 1) {
            for (e of this.cf.events) {
                addListener(this.lt, e, this);
            }
            this.ht = true;
            this.ct?.();
        }
    });
    defineHiddenProp(i, "unsubscribe", function(t) {
        if (this.subs.remove(t) && this.subs.count === 0) {
            for (e of this.cf.events) {
                removeListener(this.lt, e, this);
            }
            this.ht = false;
            this.ut?.();
        }
    });
    defineHiddenProp(i, "useConfig", function(t) {
        this.cf = t;
        if (this.ht) {
            for (e of this.cf.events) {
                removeListener(this.lt, e, this);
            }
            for (e of this.cf.events) {
                addListener(this.lt, e, this);
            }
        }
    });
};

const mixinNoopSubscribable = t => {
    defineHiddenProp(t.prototype, "subscribe", n);
    defineHiddenProp(t.prototype, "unsubscribe", n);
};

class ClassAttributeAccessor {
    get doNotCache() {
        return true;
    }
    constructor(t, e = {}) {
        this.obj = t;
        this.mapping = e;
        this.type = be | we;
        this.v = "";
        this.ft = {};
        this.dt = 0;
    }
    getValue() {
        return this.v;
    }
    setValue(t) {
        if (t !== this.v) {
            this.v = t;
            this.gt();
        }
    }
    gt() {
        const t = this.ft;
        const e = ++this.dt;
        const i = this.obj.classList;
        const s = getClassesToAdd(this.v);
        const n = s.length;
        let r = 0;
        let l;
        if (n > 0) {
            for (;r < n; r++) {
                l = s[r];
                l = this.mapping[l] || l;
                if (l.length === 0) {
                    continue;
                }
                t[l] = this.dt;
                i.add(l);
            }
        }
        if (e === 1) {
            return;
        }
        for (l in t) {
            l = this.mapping[l] || l;
            if (t[l] === e) {
                continue;
            }
            i.remove(l);
        }
    }
}

(() => {
    mixinNoopSubscribable(ClassAttributeAccessor);
})();

function getClassesToAdd(t) {
    if (e(t)) {
        return splitClassString(t);
    }
    if (typeof t !== "object") {
        return p;
    }
    if (y(t)) {
        const e = t.length;
        if (e > 0) {
            const i = [];
            let s = 0;
            for (;e > s; ++s) {
                i.push(...getClassesToAdd(t[s]));
            }
            return i;
        } else {
            return p;
        }
    }
    const i = [];
    let s;
    for (s in t) {
        if (Boolean(t[s])) {
            if (s.includes(" ")) {
                i.push(...splitClassString(s));
            } else {
                i.push(s);
            }
        }
    }
    return i;
}

function splitClassString(t) {
    const e = t.match(/\S+/g);
    if (e === null) {
        return p;
    }
    return e;
}

const fromHydrationContext = t => ({
    $isResolver: true,
    resolve(e, i) {
        return i.get(ys).controller.container.get(k(t));
    }
});

const pi = /*@__PURE__*/ Se("IRenderer");

function renderer(t, e) {
    const i = e?.metadata ?? (t[Symbol.metadata] ??= Object.create(null));
    i[x] = {
        register(e) {
            Ae(pi, t).register(e);
        }
    };
    return t;
}

function ensureExpression(t, i, s) {
    if (e(i)) {
        return t.parse(i, s);
    }
    return i;
}

function getTarget(t) {
    if (t.viewModel != null) {
        return t.viewModel;
    }
    return t;
}

function getRefTarget(t, e) {
    if (e === "element") {
        return t;
    }
    switch (e) {
      case "controller":
        return findElementControllerFor(t);

      case "view":
        throw createMappedError(750);

      case "component":
        return findElementControllerFor(t).viewModel;

      default:
        {
            const i = findAttributeControllerFor(t, e);
            if (i !== void 0) {
                return i.viewModel;
            }
            const s = findElementControllerFor(t, {
                name: e
            });
            if (s === void 0) {
                throw createMappedError(751, e);
            }
            return s.viewModel;
        }
    }
}

const vi = /*@__PURE__*/ renderer(class SetPropertyRenderer {
    constructor() {
        this.target = z.setProperty;
    }
    render(t, e, i) {
        const s = getTarget(e);
        if (s.$observers?.[i.to] !== void 0) {
            s.$observers[i.to].setValue(i.value);
        } else {
            s[i.to] = i.value;
        }
    }
}, null);

const xi = /*@__PURE__*/ renderer(class CustomElementRenderer {
    constructor() {
        this.r = m(Wi);
        this.target = z.hydrateElement;
    }
    render(t, e, i, s, n, r) {
        let l;
        let h;
        let a;
        const c = i.res;
        const u = i.projections;
        const f = t.container;
        switch (typeof c) {
          case "string":
            l = Vs.find(f, c);
            if (l == null) {
                throw createMappedError(752, i, t);
            }
            break;

          default:
            l = c;
        }
        const d = i.containerless || l.containerless;
        const m = d ? convertToRenderLocation(e) : null;
        const g = createElementContainer(s, t, e, i, m, u == null ? void 0 : new AuSlotsInfo(ce(u)));
        h = g.invoke(l.Type);
        a = Controller.$el(g, h, e, i, l, m);
        const p = this.r.renderers;
        const v = i.props;
        const x = v.length;
        let y = 0;
        let b;
        while (x > y) {
            b = v[y];
            p[b.type].render(t, a, b, s, n, r);
            ++y;
        }
        t.addChild(a);
    }
}, null);

const yi = /*@__PURE__*/ renderer(class CustomAttributeRenderer {
    constructor() {
        this.r = m(Wi);
        this.target = z.hydrateAttribute;
    }
    render(t, e, i, s, n, r) {
        let l = t.container;
        let h;
        switch (typeof i.res) {
          case "string":
            h = Xe.find(l, i.res);
            if (h == null) {
                throw createMappedError(753, i, t);
            }
            break;

          default:
            h = i.res;
        }
        const a = invokeAttribute(s, h, t, e, i, void 0, void 0);
        const c = Controller.$attr(a.ctn, a.vm, e, h);
        We.set(e, h.key, c);
        const u = this.r.renderers;
        const f = i.props;
        const d = f.length;
        let m = 0;
        let g;
        while (d > m) {
            g = f[m];
            u[g.type].render(t, c, g, s, n, r);
            ++m;
        }
        t.addChild(c);
    }
}, null);

const bi = /*@__PURE__*/ renderer(class TemplateControllerRenderer {
    constructor() {
        this.r = m(Wi);
        this.target = z.hydrateTemplateController;
    }
    render(t, e, i, s, n, r) {
        let l = t.container;
        let h;
        switch (typeof i.res) {
          case "string":
            h = Xe.find(l, i.res);
            if (h == null) {
                throw createMappedError(754, i, t);
            }
            break;

          default:
            h = i.res;
        }
        const a = this.r.getViewFactory(i.def, h.containerStrategy === "new" ? l.createChild({
            inheritParentResources: true
        }) : l);
        const c = convertToRenderLocation(e);
        const u = invokeAttribute(s, h, t, e, i, a, c);
        const f = Controller.$attr(u.ctn, u.vm, e, h);
        We.set(c, h.key, f);
        u.vm.link?.(t, f, e, i);
        const d = this.r.renderers;
        const m = i.props;
        const g = m.length;
        let p = 0;
        let v;
        while (g > p) {
            v = m[p];
            d[v.type].render(t, f, v, s, n, r);
            ++p;
        }
        t.addChild(f);
    }
}, null);

const wi = /*@__PURE__*/ renderer(class LetElementRenderer {
    constructor() {
        this.target = z.hydrateLetElement;
        LetBinding.mix();
    }
    render(t, e, i, s, n, r) {
        e.remove();
        const l = i.instructions;
        const h = i.toBindingContext;
        const a = t.container;
        const c = l.length;
        let u;
        let f;
        let d = 0;
        while (c > d) {
            u = l[d];
            f = ensureExpression(n, u.from, pe);
            t.addBinding(new LetBinding(a, r, f, u.to, h, t.strict ?? false));
            ++d;
        }
    }
}, null);

const ki = /*@__PURE__*/ renderer(class RefBindingRenderer {
    constructor() {
        this.target = z.refBinding;
        RefBinding.mix();
    }
    render(t, e, i, s, n, r) {
        t.addBinding(new RefBinding(t.container, r, ensureExpression(n, i.from, pe), getRefTarget(e, i.to), t.strict ?? false));
    }
}, null);

const Ci = /*@__PURE__*/ renderer(class InterpolationBindingRenderer {
    constructor() {
        this.target = z.interpolation;
        InterpolationPartBinding.mix();
    }
    render(t, e, i, s, n, r) {
        const l = t.container;
        const h = new InterpolationBinding(t, l, r, ensureExpression(n, i.from, de), getTarget(e), i.to, Kt, t.strict ?? false);
        if (i.to === "class" && h.target.nodeType > 0) {
            const t = l.get(fromHydrationContext(As));
            h.useAccessor(new ClassAttributeAccessor(h.target, t));
        }
        t.addBinding(h);
    }
}, null);

const Bi = /*@__PURE__*/ renderer(class PropertyBindingRenderer {
    constructor() {
        this.target = z.propertyBinding;
        PropertyBinding.mix();
    }
    render(t, e, i, s, n, r) {
        const l = t.container;
        const h = new PropertyBinding(t, l, r, ensureExpression(n, i.from, pe), getTarget(e), i.to, i.mode, t.strict ?? false);
        if (i.to === "class" && h.target.nodeType > 0) {
            const t = l.get(fromHydrationContext(As));
            h.useTargetObserver(new ClassAttributeAccessor(h.target, t));
        }
        t.addBinding(h);
    }
}, null);

const Si = /*@__PURE__*/ renderer(class IteratorBindingRenderer {
    constructor() {
        this.target = z.iteratorBinding;
        PropertyBinding.mix();
    }
    render(t, e, i, s, n, r) {
        t.addBinding(new PropertyBinding(t, t.container, r, ensureExpression(n, i.forOf, me), getTarget(e), i.to, Kt, t.strict ?? false));
    }
}, null);

const Ai = /*@__PURE__*/ renderer(class TextBindingRenderer {
    constructor() {
        this.target = z.textBinding;
        ContentBinding.mix();
    }
    render(t, e, i, s, n, r) {
        t.addBinding(new ContentBinding(t, t.container, r, s, ensureExpression(n, i.from, pe), e, t.strict ?? false));
    }
}, null);

const Ri = Se("IListenerBindingOptions", t => t.singleton(class {
    constructor() {
        this.p = m(Ne);
        this.prevent = false;
        this.onError = (t, e) => {
            const i = new this.p.CustomEvent("au-event-error", {
                cancelable: true,
                detail: {
                    event: t,
                    error: e
                }
            });
            this.p.window.dispatchEvent(i);
            if (i.defaultPrevented) {
                return;
            }
            throw e;
        };
    }
}));

const Ti = /*@__PURE__*/ renderer(class ListenerBindingRenderer {
    constructor() {
        this.target = z.listenerBinding;
        this.vt = m(li);
        this.xt = m(Ri);
        ListenerBinding.mix();
    }
    render(t, e, i, s, n) {
        t.addBinding(new ListenerBinding(t.container, ensureExpression(n, i.from, ge), e, i.to, new ListenerBindingOptions(this.xt.prevent, i.capture, this.xt.onError), this.vt.getHandler(i.to, i.modifier), t.strict ?? false));
    }
}, null);

const Ei = /*@__PURE__*/ renderer(class SetAttributeRenderer {
    constructor() {
        this.target = z.setAttribute;
    }
    render(t, e, i) {
        e.setAttribute(i.to, i.value);
    }
}, null);

const Li = /*@__PURE__*/ renderer(class SetClassAttributeRenderer {
    constructor() {
        this.target = z.setClassAttribute;
    }
    render(t, e, i) {
        addClasses(e.classList, i.value);
    }
}, null);

const Mi = /*@__PURE__*/ renderer(class SetStyleAttributeRenderer {
    constructor() {
        this.target = z.setStyleAttribute;
    }
    render(t, e, i) {
        e.style.cssText += i.value;
    }
}, null);

const Di = /*@__PURE__*/ renderer(class StylePropertyBindingRenderer {
    constructor() {
        this.target = z.stylePropertyBinding;
        PropertyBinding.mix();
    }
    render(t, e, i, s, n, r) {
        t.addBinding(new PropertyBinding(t, t.container, r, ensureExpression(n, i.from, pe), e.style, i.to, Kt, t.strict ?? false));
    }
}, null);

const Pi = /*@__PURE__*/ renderer(class AttributeBindingRenderer {
    constructor() {
        this.target = z.attributeBinding;
        AttributeBinding.mix();
    }
    render(t, e, i, s, n, r) {
        const l = t.container;
        const h = l.has(As, false) ? l.get(As) : null;
        t.addBinding(new AttributeBinding(t, l, r, ensureExpression(n, i.from, pe), e, i.attr, h == null ? i.to : i.to.split(/\s/g).map(t => h[t] ?? t).join(" "), Kt, t.strict ?? false));
    }
}, null);

const qi = /*@__PURE__*/ renderer(class SpreadRenderer {
    constructor() {
        this.yt = m(U);
        this.r = m(Wi);
        this.target = z.spreadTransferedBinding;
    }
    render(t, e, i, s, n, r) {
        SpreadBinding.create(t.container.get(ys), e, void 0, this.r, this.yt, s, n, r).forEach(e => t.addBinding(e));
    }
}, null);

const Ii = /*@__PURE__*/ renderer(class SpreadValueRenderer {
    constructor() {
        this.target = z.spreadValueBinding;
        SpreadValueBinding.mix();
    }
    render(t, e, i, s, n, r) {
        const l = i.target;
        if (l === "$bindables") {
            t.addBinding(new SpreadValueBinding(t, e.viewModel, ce(e.definition.bindables), n.parse(i.from, pe), r, t.container, t.strict ?? false));
        } else {
            throw createMappedError(820, l);
        }
    }
}, null);

function addClasses(t, e) {
    const i = e.length;
    let s = 0;
    for (let n = 0; n < i; ++n) {
        if (e.charCodeAt(n) === 32) {
            if (n !== s) {
                t.add(e.slice(s, n));
            }
            s = n + 1;
        } else if (n + 1 === i) {
            t.add(e.slice(s));
        }
    }
}

const _i = "IController";

const Vi = "IInstruction";

const Fi = "IRenderLocation";

const Hi = "ISlotsInfo";

function createElementContainer(t, e, i, s, n, r) {
    const l = e.container.createChild();
    registerHostNode(l, i, t);
    registerResolver(l, xs, new C(_i, e));
    registerResolver(l, G, new C(Vi, s));
    registerResolver(l, Ss, n == null ? Oi : new RenderLocationProvider(n));
    registerResolver(l, ai, $i);
    registerResolver(l, di, r == null ? Ni : new C(Hi, r));
    return l;
}

class ViewFactoryProvider {
    get $isResolver() {
        return true;
    }
    constructor(t) {
        this.f = t;
    }
    resolve() {
        const t = this.f;
        if (t === null) {
            throw createMappedError(755);
        }
        if (!e(t.name) || t.name.length === 0) {
            throw createMappedError(756);
        }
        return t;
    }
}

function invokeAttribute(t, e, i, s, n, r, l, h) {
    const a = i instanceof Controller ? i : i.$controller;
    const c = a.container.createChild();
    registerHostNode(c, s, t);
    registerResolver(c, xs, new C(_i, a));
    registerResolver(c, G, new C(Vi, n));
    registerResolver(c, Ss, l == null ? Oi : new C(Fi, l));
    registerResolver(c, ai, r == null ? $i : new ViewFactoryProvider(r));
    registerResolver(c, di, Ni);
    return {
        vm: c.invoke(e.Type),
        ctn: c
    };
}

class RenderLocationProvider {
    get name() {
        return "IRenderLocation";
    }
    get $isResolver() {
        return true;
    }
    constructor(t) {
        this.l = t;
    }
    resolve() {
        return this.l;
    }
}

const Oi = new RenderLocationProvider(null);

const $i = new ViewFactoryProvider(null);

const Ni = new C(Hi, new AuSlotsInfo(p));

const Wi = /*@__PURE__*/ Se("IRendering", t => t.singleton(Rendering));

class Rendering {
    get renderers() {
        return this.bt ??= this.wt.getAll(pi, false).reduce((t, e) => {
            t[e.target] ??= e;
            return t;
        }, i());
    }
    constructor() {
        this.kt = new WeakMap;
        this.Ct = new WeakMap;
        const t = this.wt = m(B).root;
        const e = this.p = t.get(Ne);
        this.ep = t.get(zt);
        this.oL = t.get(Et);
        this.Bt = e.document.createElement("au-m");
        this.St = new FragmentNodeSequence(e, e.document.createDocumentFragment());
    }
    compile(t, e) {
        const i = e.get(U);
        const s = this.kt;
        let n = s.get(t);
        if (n == null) {
            s.set(t, n = CustomElementDefinition.create(t.needsCompile ? i.compile(t, e) : t));
        }
        return n;
    }
    getViewFactory(t, e) {
        return new ViewFactory(e, CustomElementDefinition.getOrCreate(t));
    }
    createNodes(t) {
        if (t.enhance === true) {
            return new FragmentNodeSequence(this.p, this.At(t.template));
        }
        let i;
        let s = false;
        const n = this.Ct;
        const r = this.p;
        const l = r.document;
        if (n.has(t)) {
            i = n.get(t);
        } else {
            const h = t.template;
            let a;
            if (h == null) {
                i = null;
            } else if (h instanceof r.Node) {
                if (h.nodeName === "TEMPLATE") {
                    i = h.content;
                    s = true;
                } else {
                    (i = l.createDocumentFragment()).appendChild(h.cloneNode(true));
                }
            } else {
                a = l.createElement("template");
                if (e(h)) {
                    a.innerHTML = h;
                }
                i = a.content;
                s = true;
            }
            this.At(i);
            n.set(t, i);
        }
        return i == null ? this.St : new FragmentNodeSequence(this.p, s ? l.importNode(i, true) : l.adoptNode(i.cloneNode(true)));
    }
    render(t, e, i, s) {
        const n = i.instructions;
        const r = this.renderers;
        const l = e.length;
        let h = 0;
        let a = 0;
        let c = n.length;
        let u;
        let f;
        let d;
        if (l !== c) {
            throw createMappedError(757, l, c);
        }
        if (s != null) {
            u = i.surrogates;
            if ((c = u.length) > 0) {
                a = 0;
                while (c > a) {
                    f = u[a];
                    r[f.type].render(t, s, f, this.p, this.ep, this.oL);
                    ++a;
                }
            }
        }
        if (l > 0) {
            while (l > h) {
                u = n[h];
                d = e[h];
                a = 0;
                c = u.length;
                while (c > a) {
                    f = u[a];
                    r[f.type].render(t, d, f, this.p, this.ep, this.oL);
                    ++a;
                }
                ++h;
            }
        }
    }
    At(t) {
        if (t == null) {
            return null;
        }
        const e = this.p.document.createTreeWalker(t, 128);
        let i;
        while ((i = e.nextNode()) != null) {
            if (i.nodeValue === "au*") {
                i.parentNode.replaceChild(e.currentNode = this.Bt.cloneNode(), i);
            }
        }
        return t;
    }
}

function cssModules(...t) {
    return new CSSModulesProcessorRegistry(t);
}

class CSSModulesProcessorRegistry {
    constructor(t) {
        this.modules = t;
    }
    register(t) {
        let e = t.get(k(As));
        if (e == null) {
            t.register(Te(As, e = i()));
        }
        {
            he(e, ...this.modules);
        }
        class CompilingHook {
            compiling(t) {
                const processElement = t => {
                    const i = t.getAttributeNode("class");
                    if (!i?.value) return;
                    const s = i.value.split(/\s+/g).map(t => e[t] || t).join(" ");
                    i.value = s;
                };
                const processContainer = t => {
                    t.querySelectorAll("[class]").forEach(processElement);
                    t.querySelectorAll("template").forEach(t => processContainer(t.content));
                };
                processElement(t);
                processContainer(t.tagName === "TEMPLATE" ? t.content : t);
            }
        }
        t.register(X.define(CompilingHook));
    }
}

function shadowCSS(...t) {
    return new ShadowDOMRegistry(t);
}

const ji = /*@__PURE__*/ Se("IShadowDOMStyleFactory", t => t.cachedCallback(t => {
    if (AdoptedStyleSheetsStyles.supported(t.get(Ne))) {
        return t.get(AdoptedStyleSheetsStylesFactory);
    }
    return t.get(StyleElementStylesFactory);
}));

class ShadowDOMRegistry {
    constructor(t) {
        this.css = t;
    }
    register(t) {
        const e = t.get(Ui);
        const i = t.get(ji);
        t.register(Te(zi, i.createStyles(this.css, e)));
    }
}

class AdoptedStyleSheetsStylesFactory {
    constructor() {
        this.p = m(Ne);
        this.cache = new Map;
    }
    createStyles(t, e) {
        return new AdoptedStyleSheetsStyles(this.p, t, this.cache, e);
    }
}

class StyleElementStylesFactory {
    constructor() {
        this.p = m(Ne);
    }
    createStyles(t, e) {
        return new StyleElementStyles(this.p, t, e);
    }
}

const zi = /*@__PURE__*/ Se("IShadowDOMStyles");

const Ui = /*@__PURE__*/ Se("IShadowDOMGlobalStyles", t => t.instance({
    applyTo: n
}));

class AdoptedStyleSheetsStyles {
    constructor(t, e, i, s = null) {
        this.sharedStyles = s;
        this.styleSheets = e.map(e => {
            let s;
            if (e instanceof t.CSSStyleSheet) {
                s = e;
            } else {
                s = i.get(e);
                if (s === void 0) {
                    s = new t.CSSStyleSheet;
                    s.replaceSync(e);
                    i.set(e, s);
                }
            }
            return s;
        });
    }
    static supported(t) {
        return "adoptedStyleSheets" in t.ShadowRoot.prototype;
    }
    applyTo(t) {
        if (this.sharedStyles !== null) {
            this.sharedStyles.applyTo(t);
        }
        t.adoptedStyleSheets = [ ...t.adoptedStyleSheets, ...this.styleSheets ];
    }
}

class StyleElementStyles {
    constructor(t, e, i = null) {
        this.p = t;
        this.localStyles = e;
        this.sharedStyles = i;
    }
    applyTo(t) {
        const e = this.localStyles;
        const i = this.p;
        for (let s = e.length - 1; s > -1; --s) {
            const n = i.document.createElement("style");
            n.innerHTML = e[s];
            t.prepend(n);
        }
        if (this.sharedStyles !== null) {
            this.sharedStyles.applyTo(t);
        }
    }
}

const Gi = {
    shadowDOM(t) {
        return $e.creating(B, e => {
            if (t.sharedStyles != null) {
                const i = e.get(ji);
                e.register(Te(Ui, i.createStyles(t.sharedStyles, null)));
            }
        });
    }
};

const {enter: Xi, exit: Ki} = Lt;

const {wrap: Qi, unwrap: Yi} = Mt;

class ComputedWatcher {
    get value() {
        return this.v;
    }
    constructor(t, e, i, s, n = "async") {
        this.obj = t;
        this.$get = i;
        this.isBound = false;
        this.M = false;
        this.Rt = 0;
        this.v = void 0;
        this.cb = s;
        this.oL = e;
        this.Tt = n;
    }
    handleChange() {
        this.run();
    }
    handleCollectionChange() {
        this.run();
    }
    bind() {
        if (this.isBound) return;
        this.compute();
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) return;
        this.isBound = false;
        this.obs.clearAll();
    }
    run() {
        if (!this.isBound) return;
        if (this.Tt === "sync") {
            this.Et();
            return;
        }
        if (this.M) return;
        this.M = true;
        kt(() => {
            this.M = false;
            this.Et();
        });
    }
    Et() {
        if (!this.isBound) return;
        const t = this.obj;
        const e = this.v;
        if (++this.Rt > 100) {
            throw new Error(`AURXXXX: Possible infinitely recursive side-effect detected in a watcher.`);
        }
        const i = this.compute();
        if (!S(i, e)) {
            this.cb.call(t, i, e, t);
        }
        if (!this.M) {
            this.Rt = 0;
        }
    }
    compute() {
        this.obs.version++;
        try {
            Xi(this);
            return this.v = Yi(this.$get.call(void 0, Qi(this.obj), this));
        } finally {
            this.obs.clear();
            Ki(this);
        }
    }
}

(() => {
    St(ComputedWatcher, null);
})();

class ExpressionWatcher {
    get value() {
        return this.v;
    }
    constructor(t, e, i, s, n, r = "async") {
        this.scope = t;
        this.l = e;
        this.oL = i;
        this.isBound = false;
        this.M = false;
        this.boundFn = false;
        this.obj = t.bindingContext;
        this.Lt = s;
        this.cb = n;
        this.Tt = r;
    }
    handleChange() {
        this.run();
    }
    handleCollectionChange() {
        this.run();
    }
    run() {
        if (!this.isBound) return;
        if (this.Tt === "sync") {
            this.Et();
            return;
        }
        if (this.M) return;
        this.M = true;
        kt(() => {
            this.M = false;
            this.Et();
        });
    }
    Et() {
        if (!this.isBound) return;
        const t = this.Lt;
        const e = this.obj;
        const i = this.v;
        this.obs.version++;
        const s = bt(t, this.scope, this, this);
        this.obs.clear();
        if (!S(s, i)) {
            this.v = s;
            this.cb.call(e, s, i, e);
        }
    }
    bind() {
        if (this.isBound) return;
        this.obs.version++;
        this.v = bt(this.Lt, this.scope, this, this);
        this.obs.clear();
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) return;
        this.isBound = false;
        this.obs.clearAll();
        this.v = void 0;
    }
}

(() => {
    St(ExpressionWatcher, null);
    ei(ExpressionWatcher);
})();

class Controller {
    get lifecycleHooks() {
        return this.Mt;
    }
    get isActive() {
        return (this.state & (us | fs)) > 0 && (this.state & ds) === 0;
    }
    get name() {
        if (this.parent === null) {
            switch (this.vmKind) {
              case hs:
                return `[${this.definition.name}]`;

              case ls:
                return this.definition.name;

              case as:
                return this.viewFactory.name;
            }
        }
        switch (this.vmKind) {
          case hs:
            return `${this.parent.name}>[${this.definition.name}]`;

          case ls:
            return `${this.parent.name}>${this.definition.name}`;

          case as:
            return this.viewFactory.name === this.parent.definition?.name ? `${this.parent.name}[view]` : `${this.parent.name}[view:${this.viewFactory.name}]`;
        }
    }
    get viewModel() {
        return this.Dt;
    }
    set viewModel(t) {
        this.Dt = t;
        this.Pt = t == null || this.vmKind === as ? HooksDefinition.none : new HooksDefinition(t);
    }
    get strict() {
        return this.definition?.strict;
    }
    constructor(t, e, i, s, n, r, l) {
        this.container = t;
        this.vmKind = e;
        this.definition = i;
        this.viewFactory = s;
        this.host = r;
        this.head = null;
        this.tail = null;
        this.next = null;
        this.parent = null;
        this.bindings = null;
        this.children = null;
        this.hasLockedScope = false;
        this.scope = null;
        this.isBound = false;
        this.qt = false;
        this.mountTarget = Ji;
        this.shadowRoot = null;
        this.nodes = null;
        this.location = null;
        this.Mt = null;
        this.state = cs;
        this.It = false;
        this.$initiator = null;
        this.$resolve = void 0;
        this.$reject = void 0;
        this.$promise = void 0;
        this._t = 0;
        this.Vt = 0;
        this.Ft = 0;
        this.Dt = n;
        this.Pt = e === as ? HooksDefinition.none : new HooksDefinition(n);
        this.location = l;
        this.r = t.root.get(Wi);
    }
    static getCached(t) {
        return Zi.get(t);
    }
    static getCachedOrThrow(t) {
        const e = Controller.getCached(t);
        if (e === void 0) {
            throw createMappedError(500, t);
        }
        return e;
    }
    static $el(t, e, i, s, n = void 0, r = null) {
        if (Zi.has(e)) {
            return Zi.get(e);
        }
        {
            n = n ?? getElementDefinition(e.constructor);
        }
        registerResolver(t, n.Type, new C(n.key, e, n.Type));
        const l = new Controller(t, ls, n, null, e, i, r);
        const h = t.get(R(ys));
        if (n.dependencies.length > 0) {
            t.register(...n.dependencies);
        }
        registerResolver(t, ys, new C("IHydrationContext", new HydrationContext(l, s, h)));
        Zi.set(e, l);
        if (s == null || s.hydrate !== false) {
            l.hE(s);
        }
        return l;
    }
    static $attr(t, e, i, s) {
        if (Zi.has(e)) {
            return Zi.get(e);
        }
        s = s ?? getAttributeDefinition(e.constructor);
        registerResolver(t, s.Type, new C(s.key, e, s.Type));
        const n = new Controller(t, hs, s, null, e, i, null);
        if (s.dependencies.length > 0) {
            t.register(...s.dependencies);
        }
        Zi.set(e, n);
        n.Ht();
        return n;
    }
    static $view(t, e = void 0) {
        const i = new Controller(t.container, as, null, t, null, null, null);
        i.parent = e ?? null;
        i.Ot();
        return i;
    }
    hE(t) {
        const e = this.container;
        const i = this.Dt;
        const s = this.definition;
        this.scope = Tt.create(i, null, true);
        if (s.watches.length > 0) {
            createWatchers(this, e, s, i);
        }
        createObservers(this, s, i);
        this.Mt = Qe.resolve(e);
        e.register(s.Type);
        if (s.injectable !== null) {
            registerResolver(e, s.injectable, new C("definition.injectable", i));
        }
        if (t == null || t.hydrate !== false) {
            this.hS();
            this.hC();
        }
    }
    hS() {
        if (this.Mt.hydrating != null) {
            this.Mt.hydrating.forEach(callHydratingHook, this);
        }
        if (this.Pt.$t) {
            this.Dt.hydrating(this);
        }
        const t = this.definition;
        const e = this.Nt = this.r.compile(t, this.container);
        const i = e.shadowOptions;
        const s = e.hasSlots;
        const n = e.containerless;
        const r = this.host;
        let l = this.location;
        if (n && l == null) {
            l = this.location = convertToRenderLocation(r);
        }
        Cs(r, qs, this);
        Cs(r, t.key, this);
        if (i !== null || s) {
            if (l != null) {
                throw createMappedError(501);
            }
            Cs(this.shadowRoot = r.attachShadow(i ?? os), qs, this);
            Cs(this.shadowRoot, t.key, this);
            this.mountTarget = es;
        } else if (l != null) {
            if (r !== l) {
                Cs(l, qs, this);
                Cs(l, t.key, this);
            }
            this.mountTarget = is;
        } else {
            this.mountTarget = ts;
        }
        this.Dt.$controller = this;
        this.nodes = this.r.createNodes(e);
        if (this.Mt.hydrated !== void 0) {
            this.Mt.hydrated.forEach(callHydratedHook, this);
        }
        if (this.Pt.Wt) {
            this.Dt.hydrated(this);
        }
    }
    hC() {
        this.r.render(this, this.nodes.findTargets(), this.Nt, this.host);
        if (this.Mt.created !== void 0) {
            this.Mt.created.forEach(callCreatedHook, this);
        }
        if (this.Pt.jt) {
            this.Dt.created(this);
        }
    }
    Ht() {
        const t = this.definition;
        const e = this.Dt;
        if (t.watches.length > 0) {
            createWatchers(this, this.container, t, e);
        }
        createObservers(this, t, e);
        e.$controller = this;
        this.Mt = Qe.resolve(this.container);
        if (this.Mt.created !== void 0) {
            this.Mt.created.forEach(callCreatedHook, this);
        }
        if (this.Pt.jt) {
            this.Dt.created(this);
        }
    }
    Ot() {
        this.Nt = this.r.compile(this.viewFactory.def, this.container);
        this.r.render(this, (this.nodes = this.r.createNodes(this.Nt)).findTargets(), this.Nt, void 0);
    }
    activate(t, e, i) {
        switch (this.state) {
          case cs:
          case ms:
            if (!(e === null || e.isActive)) {
                return;
            }
            this.state = us;
            break;

          case fs:
            return;

          case ps:
            throw createMappedError(502, this.name);

          default:
            throw createMappedError(503, this.name, stringifyState(this.state));
        }
        this.parent = e;
        switch (this.vmKind) {
          case ls:
            this.scope.parent = i ?? null;
            break;

          case hs:
            this.scope = i ?? null;
            break;

          case as:
            if (i === void 0 || i === null) {
                throw createMappedError(504, this.name);
            }
            if (!this.hasLockedScope) {
                this.scope = i;
            }
            break;
        }
        this.$initiator = t;
        this.zt();
        let s = void 0;
        if (this.vmKind !== as && this.Mt.binding != null) {
            s = T(...this.Mt.binding.map(callBindingHook, this));
        }
        if (this.Pt.Ut) {
            s = T(s, this.Dt.binding(this.$initiator, this.parent));
        }
        if (E(s)) {
            this.Gt();
            s.then(() => {
                this.qt = true;
                if (this.state !== us) {
                    this.Xt();
                } else {
                    this.bind();
                }
            }).catch(t => {
                this.Kt(t);
            });
            return this.$promise;
        }
        this.qt = true;
        this.bind();
        return this.$promise;
    }
    bind() {
        let t = 0;
        let e = 0;
        let i = void 0;
        if (this.bindings !== null) {
            t = 0;
            e = this.bindings.length;
            while (e > t) {
                this.bindings[t].bind(this.scope);
                ++t;
            }
        }
        if (this.vmKind !== as && this.Mt.bound != null) {
            i = T(...this.Mt.bound.map(callBoundHook, this));
        }
        if (this.Pt.Qt) {
            i = T(i, this.Dt.bound(this.$initiator, this.parent));
        }
        if (E(i)) {
            this.Gt();
            i.then(() => {
                this.isBound = true;
                if (this.state !== us) {
                    this.Xt();
                } else {
                    this.Yt();
                }
            }).catch(t => {
                this.Kt(t);
            });
            return;
        }
        this.isBound = true;
        this.Yt();
    }
    Zt(...t) {
        switch (this.mountTarget) {
          case ts:
            this.host.append(...t);
            break;

          case es:
            this.shadowRoot.append(...t);
            break;

          case is:
            {
                let e = 0;
                for (;e < t.length; ++e) {
                    this.location.parentNode.insertBefore(t[e], this.location);
                }
                break;
            }
        }
    }
    Yt() {
        switch (this.mountTarget) {
          case ts:
            this.nodes.appendTo(this.host, this.definition != null && this.definition.enhance);
            break;

          case es:
            {
                const t = this.container;
                const e = t.has(zi, false) ? t.get(zi) : t.get(Ui);
                e.applyTo(this.shadowRoot);
                this.nodes.appendTo(this.shadowRoot);
                break;
            }

          case is:
            this.nodes.insertBefore(this.location);
            break;
        }
        let t = 0;
        let e = void 0;
        if (this.vmKind !== as && this.Mt.attaching != null) {
            e = T(...this.Mt.attaching.map(callAttachingHook, this));
        }
        if (this.Pt.Jt) {
            e = T(e, this.Dt.attaching(this.$initiator, this.parent));
        }
        if (E(e)) {
            this.Gt();
            this.zt();
            e.then(() => {
                this.Xt();
            }).catch(t => {
                this.Kt(t);
            });
        }
        if (this.children !== null) {
            for (;t < this.children.length; ++t) {
                void this.children[t].activate(this.$initiator, this, this.scope);
            }
        }
        this.Xt();
    }
    deactivate(t, e) {
        let i = void 0;
        switch (this.state & ~gs) {
          case fs:
            this.state = ds;
            break;

          case us:
            this.state = ds;
            i = this.$promise?.catch(n);
            break;

          case cs:
          case ms:
          case ps:
          case ms | ps:
            return;

          default:
            throw createMappedError(505, this.name, this.state);
        }
        this.$initiator = t;
        if (t === this) {
            this.te();
        }
        let s = 0;
        let r;
        if (this.children !== null) {
            for (s = 0; s < this.children.length; ++s) {
                void this.children[s].deactivate(t, this);
            }
        }
        return L(i, () => {
            if (this.isBound) {
                if (this.vmKind !== as && this.Mt.detaching != null) {
                    r = T(...this.Mt.detaching.map(callDetachingHook, this));
                }
                if (this.Pt.ee) {
                    r = T(r, this.Dt.detaching(this.$initiator, this.parent));
                }
            }
            if (E(r)) {
                this.Gt();
                t.te();
                r.then(() => {
                    t.ie();
                }).catch(e => {
                    t.Kt(e);
                });
            }
            if (t.head === null) {
                t.head = this;
            } else {
                t.tail.next = this;
            }
            t.tail = this;
            if (t !== this) {
                return;
            }
            this.ie();
            return this.$promise;
        });
    }
    removeNodes() {
        switch (this.vmKind) {
          case ls:
          case as:
            this.nodes.remove();
            this.nodes.unlink();
        }
    }
    unbind() {
        let t = 0;
        if (this.bindings !== null) {
            for (;t < this.bindings.length; ++t) {
                this.bindings[t].unbind();
            }
        }
        this.parent = null;
        switch (this.vmKind) {
          case hs:
            this.scope = null;
            break;

          case as:
            if (!this.hasLockedScope) {
                this.scope = null;
            }
            if ((this.state & gs) === gs && !this.viewFactory.tryReturnToCache(this) && this.$initiator === this) {
                this.dispose();
            }
            break;

          case ls:
            this.scope.parent = null;
            break;
        }
        this.state = ms;
        this.$initiator = null;
        this.se();
    }
    Gt() {
        if (this.$promise === void 0) {
            this.$promise = new Promise((t, e) => {
                this.$resolve = t;
                this.$reject = e;
            });
            if (this.$initiator !== this) {
                this.parent.Gt();
            }
        }
    }
    se() {
        if (this.$promise !== void 0) {
            bs = this.$resolve;
            this.$resolve = this.$reject = this.$promise = void 0;
            bs();
            bs = void 0;
        }
    }
    Kt(t) {
        if (this.$promise !== void 0) {
            ws = this.$reject;
            this.$resolve = this.$reject = this.$promise = void 0;
            ws(t);
            ws = void 0;
        }
        if (this.$initiator !== this) {
            this.parent.Kt(t);
        }
    }
    zt() {
        ++this._t;
        if (this.$initiator !== this) {
            this.parent.zt();
        }
    }
    Xt() {
        if (this.state !== us) {
            --this._t;
            this.se();
            if (this.$initiator !== this) {
                this.parent.Xt();
            }
            return;
        }
        if (--this._t === 0) {
            if (this.vmKind !== as && this.Mt.attached != null) {
                ks = T(...this.Mt.attached.map(callAttachedHook, this));
            }
            if (this.Pt.ne) {
                ks = T(ks, this.Dt.attached(this.$initiator));
            }
            if (E(ks)) {
                this.Gt();
                ks.then(() => {
                    this.state = fs;
                    this.se();
                    if (this.$initiator !== this) {
                        this.parent.Xt();
                    }
                }).catch(t => {
                    this.Kt(t);
                });
                ks = void 0;
                return;
            }
            ks = void 0;
            this.state = fs;
            this.se();
        }
        if (this.$initiator !== this) {
            this.parent.Xt();
        }
    }
    te() {
        ++this.Vt;
    }
    ie() {
        if (--this.Vt === 0) {
            this.re();
            this.removeNodes();
            let t = this.$initiator.head;
            let e = void 0;
            while (t !== null) {
                if (t !== this) {
                    if (t.debug) {
                        t.logger.trace(`detach()`);
                    }
                    t.removeNodes();
                }
                if (t.qt) {
                    if (t.vmKind !== as && t.Mt.unbinding != null) {
                        e = T(...t.Mt.unbinding.map(callUnbindingHook, t));
                    }
                    if (t.Pt.oe) {
                        if (t.debug) {
                            t.logger.trace("unbinding()");
                        }
                        e = T(e, t.viewModel.unbinding(t.$initiator, t.parent));
                    }
                }
                if (E(e)) {
                    this.Gt();
                    this.re();
                    e.then(() => {
                        this.le();
                    }).catch(t => {
                        this.Kt(t);
                    });
                }
                e = void 0;
                t = t.next;
            }
            this.le();
        }
    }
    re() {
        ++this.Ft;
    }
    le() {
        if (--this.Ft === 0) {
            let t = this.$initiator.head;
            let e = null;
            while (t !== null) {
                if (t !== this) {
                    t.qt = false;
                    t.isBound = false;
                    t.unbind();
                }
                e = t.next;
                t.next = null;
                t = e;
            }
            this.head = this.tail = null;
            this.qt = false;
            this.isBound = false;
            this.unbind();
        }
    }
    addBinding(t) {
        if (this.bindings === null) {
            this.bindings = [ t ];
        } else {
            this.bindings[this.bindings.length] = t;
        }
    }
    addChild(t) {
        if (this.children === null) {
            this.children = [ t ];
        } else {
            this.children[this.children.length] = t;
        }
    }
    is(t) {
        switch (this.vmKind) {
          case hs:
          case ls:
            {
                return this.definition.name === t;
            }

          case as:
            return this.viewFactory.name === t;
        }
    }
    lockScope(t) {
        this.scope = t;
        this.hasLockedScope = true;
    }
    setHost(t) {
        if (this.vmKind === ls) {
            Cs(t, qs, this);
            Cs(t, this.definition.key, this);
        }
        this.host = t;
        this.mountTarget = ts;
        return this;
    }
    setShadowRoot(t) {
        if (this.vmKind === ls) {
            Cs(t, qs, this);
            Cs(t, this.definition.key, this);
        }
        this.shadowRoot = t;
        this.mountTarget = es;
        return this;
    }
    setLocation(t) {
        if (this.vmKind === ls) {
            Cs(t, qs, this);
            Cs(t, this.definition.key, this);
        }
        this.location = t;
        this.mountTarget = is;
        return this;
    }
    release() {
        this.state |= gs;
    }
    dispose() {
        if ((this.state & ps) === ps) {
            return;
        }
        this.state |= ps;
        if (this.Pt.he) {
            this.Dt.dispose();
        }
        if (this.children !== null) {
            this.children.forEach(callDispose);
            this.children = null;
        }
        this.scope = null;
        this.nodes = null;
        this.location = null;
        this.viewFactory = null;
        if (this.Dt !== null) {
            Zi.delete(this.Dt);
            this.Dt = null;
        }
        this.Dt = null;
        this.host = null;
        this.shadowRoot = null;
        this.container.disposeResolvers();
    }
    accept(t) {
        if (t(this) === true) {
            return true;
        }
        if (this.Pt.ae && this.Dt.accept(t) === true) {
            return true;
        }
        if (this.children !== null) {
            const {children: e} = this;
            for (let i = 0, s = e.length; i < s; ++i) {
                if (e[i].accept(t) === true) {
                    return true;
                }
            }
        }
    }
}

const Zi = new WeakMap;

const Ji = 0;

const ts = 1;

const es = 2;

const is = 3;

const ss = le({
    none: Ji,
    host: ts,
    shadowRoot: es,
    location: is
});

const ns = A(Dt);

function createObservers(t, e, i) {
    const s = e.bindables;
    const r = ae(s);
    const l = r.length;
    if (l === 0) return;
    const h = t.container.get(Et);
    const a = "propertiesChanged" in i;
    const c = t.vmKind === as ? void 0 : t.container.get(ns);
    const u = a ? (() => {
        let e = {};
        let s = false;
        let n = 0;
        const callPropertiesChanged = () => {
            if (!s) {
                s = true;
                kt(() => {
                    s = false;
                    const r = e;
                    e = {};
                    n = 0;
                    if (t.isBound) {
                        i.propertiesChanged?.(r);
                        if (n > 0) {
                            callPropertiesChanged();
                        }
                    }
                });
            }
        };
        return (t, i, s) => {
            e[t] = {
                newValue: i,
                oldValue: s
            };
            n++;
            callPropertiesChanged();
        };
    })() : n;
    for (let e = 0; e < l; ++e) {
        const l = r[e];
        const f = s[l];
        const d = f.callback;
        const m = h.getObserver(i, l);
        if (f.set !== n) {
            if (m.useCoercer?.(f.set, c) !== true) {
                throw createMappedError(507, l);
            }
        }
        if (i[d] != null || i.propertyChanged != null || a) {
            const callback = (e, s) => {
                if (t.isBound) {
                    i[d]?.(e, s);
                    i.propertyChanged?.(l, e, s);
                    u(l, e, s);
                }
            };
            if (m.useCallback?.(callback) !== true) {
                throw createMappedError(508, l);
            }
        }
    }
}

const rs = new Map;

const getAccessScopeAst = t => {
    let e = rs.get(t);
    if (e == null) {
        e = new jt(t, 0);
        rs.set(t, e);
    }
    return e;
};

function createWatchers(t, i, s, n) {
    const r = i.get(Et);
    const l = i.get(zt);
    const h = s.watches;
    const a = t.vmKind === ls ? t.scope : Tt.create(n, null, true);
    const u = h.length;
    let f;
    let d;
    let m;
    let g;
    let p = 0;
    for (;u > p; ++p) {
        ({expression: f, callback: d, flush: g} = h[p]);
        d = c(d) ? d : Reflect.get(n, d);
        if (!c(d)) {
            throw createMappedError(506, d);
        }
        if (c(f)) {
            t.addBinding(new ComputedWatcher(n, r, f, d, g));
        } else {
            m = e(f) ? l.parse(f, pe) : getAccessScopeAst(f);
            t.addBinding(new ExpressionWatcher(a, i, r, m, d, g));
        }
    }
}

function isCustomElementController(t) {
    return t instanceof Controller && t.vmKind === ls;
}

function isCustomElementViewModel(t) {
    return isElementType(t?.constructor);
}

class HooksDefinition {
    constructor(t) {
        this.ce = "define" in t;
        this.$t = "hydrating" in t;
        this.Wt = "hydrated" in t;
        this.jt = "created" in t;
        this.Ut = "binding" in t;
        this.Qt = "bound" in t;
        this.Jt = "attaching" in t;
        this.ne = "attached" in t;
        this.ee = "detaching" in t;
        this.oe = "unbinding" in t;
        this.he = "dispose" in t;
        this.ae = "accept" in t;
    }
}

HooksDefinition.none = new HooksDefinition({});

const os = {
    mode: "open"
};

const ls = "customElement";

const hs = "customAttribute";

const as = "synthetic";

const cs = 0;

const us = 1;

const fs = 2;

const ds = 4;

const ms = 8;

const gs = 16;

const ps = 32;

const vs = /*@__PURE__*/ le({
    none: cs,
    activating: us,
    activated: fs,
    deactivating: ds,
    deactivated: ms,
    released: gs,
    disposed: ps
});

function stringifyState(t) {
    const e = [];
    if ((t & us) === us) {
        e.push("activating");
    }
    if ((t & fs) === fs) {
        e.push("activated");
    }
    if ((t & ds) === ds) {
        e.push("deactivating");
    }
    if ((t & ms) === ms) {
        e.push("deactivated");
    }
    if ((t & gs) === gs) {
        e.push("released");
    }
    if ((t & ps) === ps) {
        e.push("disposed");
    }
    return e.length === 0 ? "none" : e.join("|");
}

const xs = /*@__PURE__*/ Se("IController");

const ys = /*@__PURE__*/ Se("IHydrationContext");

class HydrationContext {
    constructor(t, e, i) {
        this.instruction = e;
        this.parent = i;
        this.controller = t;
    }
}

function callDispose(t) {
    t.dispose();
}

function callCreatedHook(t) {
    t.instance.created(this.Dt, this);
}

function callHydratingHook(t) {
    t.instance.hydrating(this.Dt, this);
}

function callHydratedHook(t) {
    t.instance.hydrated(this.Dt, this);
}

function callBindingHook(t) {
    return t.instance.binding(this.Dt, this["$initiator"], this.parent);
}

function callBoundHook(t) {
    return t.instance.bound(this.Dt, this["$initiator"], this.parent);
}

function callAttachingHook(t) {
    return t.instance.attaching(this.Dt, this["$initiator"], this.parent);
}

function callAttachedHook(t) {
    return t.instance.attached(this.Dt, this["$initiator"]);
}

function callDetachingHook(t) {
    return t.instance.detaching(this.Dt, this["$initiator"], this.parent);
}

function callUnbindingHook(t) {
    return t.instance.unbinding(this.Dt, this["$initiator"], this.parent);
}

let bs;

let ws;

let ks;

const Cs = We.set;

const Bs = /*@__PURE__*/ Se("IEventTarget", t => t.cachedCallback(t => {
    if (t.has(Hs, true)) {
        return t.get(Hs).host;
    }
    return t.get(Ne).document;
}));

const Ss = /*@__PURE__*/ Se("IRenderLocation");

const As = /*@__PURE__*/ Se("ICssClassMapping");

const Rs = new WeakMap;

function getEffectiveParentNode(t) {
    if (Rs.has(t)) {
        return Rs.get(t);
    }
    let e = 0;
    let i = t.nextSibling;
    while (i !== null) {
        if (i.nodeType === 8) {
            switch (i.textContent) {
              case "au-start":
                ++e;
                break;

              case "au-end":
                if (e-- === 0) {
                    return i;
                }
            }
        }
        i = i.nextSibling;
    }
    if (t.parentNode === null && t.nodeType === 11) {
        const e = findElementControllerFor(t, {
            optional: true
        });
        if (e == null) {
            return null;
        }
        if (e.mountTarget === ss.shadowRoot) {
            return getEffectiveParentNode(e.host);
        }
    }
    return t.parentNode;
}

function setEffectiveParentNode(t, e) {
    if (t.platform !== void 0 && !(t instanceof t.platform.Node)) {
        const i = t.childNodes;
        for (let t = 0, s = i.length; t < s; ++t) {
            Rs.set(i[t], e);
        }
    } else {
        Rs.set(t, e);
    }
}

function convertToRenderLocation(t) {
    if (isRenderLocation(t)) {
        return t;
    }
    const e = t.ownerDocument.createComment("au-end");
    const i = e.$start = t.ownerDocument.createComment("au-start");
    const s = t.parentNode;
    if (s !== null) {
        s.replaceChild(e, t);
        s.insertBefore(i, e);
    }
    return e;
}

function isRenderLocation(t) {
    return t.textContent === "au-end";
}

class FragmentNodeSequence {
    get firstChild() {
        return this.ue;
    }
    get lastChild() {
        return this.fe;
    }
    constructor(t, e) {
        this.platform = t;
        this.next = void 0;
        this.de = false;
        this.me = false;
        this.ref = null;
        const i = (this.f = e).querySelectorAll("au-m");
        let s = 0;
        let n = i.length;
        let r = this.t = Array(n);
        let l;
        let h;
        while (n > s) {
            h = i[s];
            l = h.nextSibling;
            h.remove();
            if (l.nodeType === 8) {
                h = l;
                (l = l.nextSibling).$start = h;
            }
            r[s] = l;
            ++s;
        }
        const a = e.childNodes;
        const c = this.childNodes = Array(n = a.length);
        s = 0;
        while (n > s) {
            c[s] = a[s];
            ++s;
        }
        this.ue = e.firstChild;
        this.fe = e.lastChild;
    }
    findTargets() {
        return this.t;
    }
    insertBefore(t) {
        if (this.me && !!this.ref) {
            this.addToLinked();
        } else {
            const e = t.parentNode;
            if (this.de) {
                let i = this.ue;
                let s;
                const n = this.fe;
                while (i != null) {
                    s = i.nextSibling;
                    e.insertBefore(i, t);
                    if (i === n) {
                        break;
                    }
                    i = s;
                }
            } else {
                this.de = true;
                t.parentNode.insertBefore(this.f, t);
            }
        }
    }
    appendTo(t, e = false) {
        if (this.de) {
            let e = this.ue;
            let i;
            const s = this.fe;
            while (e != null) {
                i = e.nextSibling;
                t.appendChild(e);
                if (e === s) {
                    break;
                }
                e = i;
            }
        } else {
            this.de = true;
            if (!e) {
                t.appendChild(this.f);
            }
        }
    }
    remove() {
        if (this.de) {
            this.de = false;
            const t = this.f;
            const e = this.fe;
            let i;
            let s = this.ue;
            while (s !== null) {
                i = s.nextSibling;
                t.appendChild(s);
                if (s === e) {
                    break;
                }
                s = i;
            }
        }
    }
    addToLinked() {
        const t = this.ref;
        const e = t.parentNode;
        if (this.de) {
            let i = this.ue;
            let s;
            const n = this.fe;
            while (i != null) {
                s = i.nextSibling;
                e.insertBefore(i, t);
                if (i === n) {
                    break;
                }
                i = s;
            }
        } else {
            this.de = true;
            e.insertBefore(this.f, t);
        }
    }
    unlink() {
        this.me = false;
        this.next = void 0;
        this.ref = void 0;
    }
    link(t) {
        this.me = true;
        if (isRenderLocation(t)) {
            this.ref = t;
        } else {
            this.next = t;
            this.ge();
        }
    }
    ge() {
        if (this.next !== void 0) {
            this.ref = this.next.firstChild;
        } else {
            this.ref = void 0;
        }
    }
}

const Ts = /*@__PURE__*/ Se("IWindow", t => t.callback(t => t.get(Ne).window));

const Es = /*@__PURE__*/ Se("ILocation", t => t.callback(t => t.get(Ts).location));

const Ls = /*@__PURE__*/ Se("IHistory", t => t.callback(t => t.get(Ts).history));

const registerHostNode = (t, e, i = t.get(Ne)) => {
    registerResolver(t, i.HTMLElement, registerResolver(t, i.Element, registerResolver(t, je, new C("ElementResolver", e))));
    return t;
};

function customElement(t) {
    return function(e, i) {
        i.addInitializer(function() {
            defineElement(t, this);
        });
        return e;
    };
}

function useShadowDOM(t, e) {
    if (t === void 0) {
        return function(t, e) {
            e.addInitializer(function() {
                annotateElementMetadata(this, "shadowOptions", {
                    mode: "open"
                });
            });
        };
    }
    if (!c(t)) {
        return function(e, i) {
            i.addInitializer(function() {
                annotateElementMetadata(this, "shadowOptions", t);
            });
        };
    }
    e.addInitializer(function() {
        annotateElementMetadata(this, "shadowOptions", {
            mode: "open"
        });
    });
}

function containerless(t, e) {
    if (t === void 0) {
        return function(t, e) {
            e.addInitializer(function() {
                markContainerless(t);
            });
        };
    }
    e.addInitializer(function() {
        markContainerless(t);
    });
}

function markContainerless(t) {
    const e = Zt(qs, t);
    if (e === void 0) {
        annotateElementMetadata(t, "containerless", true);
        return;
    }
    e.containerless = true;
}

const Ms = new WeakMap;

class CustomElementDefinition {
    get type() {
        return Ee;
    }
    constructor(t, e, i, s, n, r, l, h, a, c, u, f, d, m, g, p, v, x, y) {
        this.Type = t;
        this.name = e;
        this.aliases = i;
        this.key = s;
        this.capture = n;
        this.template = r;
        this.instructions = l;
        this.dependencies = h;
        this.injectable = a;
        this.needsCompile = c;
        this.surrogates = u;
        this.bindables = f;
        this.containerless = d;
        this.shadowOptions = m;
        this.hasSlots = g;
        this.enhance = p;
        this.watches = v;
        this.strict = x;
        this.processContent = y;
    }
    static create(t, i = null) {
        if (i === null) {
            const s = t;
            if (e(s)) {
                throw createMappedError(761, t);
            }
            const n = M("name", s, Is);
            if (c(s.Type)) {
                i = s.Type;
            } else {
                i = _s(D(n));
            }
            for (const t of Object.values(Ce.from(s.bindables))) {
                Ce.i(t, i);
            }
            return new CustomElementDefinition(i, n, a(s.aliases), M("key", s, () => getElementKeyFrom(n)), P("capture", s, i, returnFalse), P("template", s, i, returnNull), a(s.instructions), a(getElementAnnotation(i, "dependencies"), s.dependencies), M("injectable", s, returnNull), M("needsCompile", s, returnTrue), a(s.surrogates), Ce.from(getElementAnnotation(i, "bindables"), s.bindables), P("containerless", s, i, returnFalse), M("shadowOptions", s, returnNull), M("hasSlots", s, returnFalse), M("enhance", s, returnFalse), M("watches", s, returnEmptyArray), M("strict", s, returnUndefined), q("processContent", i, returnNull));
        }
        if (e(t)) {
            return new CustomElementDefinition(i, t, a(getElementAnnotation(i, "aliases"), i.aliases), getElementKeyFrom(t), q("capture", i, returnFalse), q("template", i, returnNull), a(getElementAnnotation(i, "instructions"), i.instructions), a(getElementAnnotation(i, "dependencies"), i.dependencies), q("injectable", i, returnNull), q("needsCompile", i, returnTrue), a(getElementAnnotation(i, "surrogates"), i.surrogates), Ce.from(...Ce.getAll(i), getElementAnnotation(i, "bindables"), i.bindables), q("containerless", i, returnFalse), q("shadowOptions", i, returnNull), q("hasSlots", i, returnFalse), q("enhance", i, returnFalse), a(ze.getDefinitions(i), i.watches), q("strict", i, returnUndefined), q("processContent", i, returnNull));
        }
        const s = M("name", t, Is);
        for (const e of Object.values(Ce.from(t.bindables))) {
            Ce.i(e, i);
        }
        return new CustomElementDefinition(i, s, a(getElementAnnotation(i, "aliases"), t.aliases, i.aliases), getElementKeyFrom(s), P("capture", t, i, returnFalse), P("template", t, i, returnNull), a(getElementAnnotation(i, "instructions"), t.instructions, i.instructions), a(getElementAnnotation(i, "dependencies"), t.dependencies, i.dependencies), P("injectable", t, i, returnNull), P("needsCompile", t, i, returnTrue), a(getElementAnnotation(i, "surrogates"), t.surrogates, i.surrogates), Ce.from(...Ce.getAll(i), getElementAnnotation(i, "bindables"), i.bindables, t.bindables), P("containerless", t, i, returnFalse), P("shadowOptions", t, i, returnNull), P("hasSlots", t, i, returnFalse), P("enhance", t, i, returnFalse), a(t.watches, ze.getDefinitions(i), i.watches), P("strict", t, i, returnUndefined), P("processContent", t, i, returnNull));
    }
    static getOrCreate(t) {
        if (t instanceof CustomElementDefinition) {
            return t;
        }
        if (Ms.has(t)) {
            return Ms.get(t);
        }
        const e = CustomElementDefinition.create(t);
        Ms.set(t, e);
        te(e, e.Type, qs);
        return e;
    }
    register(t, e) {
        const i = this.Type;
        const s = typeof e === "string" ? getElementKeyFrom(e) : this.key;
        const n = this.aliases;
        if (t.has(s, false)) {
            console.warn(createMappedError(153, this.name));
            return;
        }
        t.register(t.has(i, false) ? null : Ae(i, i), Re(i, s), ...n.map(t => Re(i, getElementKeyFrom(t))));
    }
    toString() {
        return `au:ce:${this.name}`;
    }
}

const Ds = {
    name: undefined,
    searchParents: false,
    optional: false
};

const returnNull = () => null;

const returnUndefined = () => void 0;

const returnFalse = () => false;

const returnTrue = () => true;

const returnEmptyArray = () => p;

const Ps = "custom-element";

const qs = /*@__PURE__*/ d(Ps);

const getElementKeyFrom = t => `${qs}:${t}`;

const Is = /*@__PURE__*/ (t => () => `unnamed-${++t}`)(0);

const annotateElementMetadata = (t, e, i) => {
    te(i, t, ie(e));
};

const defineElement = (t, e) => {
    const i = CustomElementDefinition.create(t, e);
    const s = i.Type;
    te(i, s, qs, u);
    return s;
};

const isElementType = t => c(t) && (Jt(qs, t) || t.$au?.type === Ps);

const findElementControllerFor = (t, e = Ds) => {
    if (e.name === void 0 && e.searchParents !== true) {
        const i = We.get(t, qs);
        if (i === null) {
            if (e.optional === true) {
                return null;
            }
            throw createMappedError(762, t);
        }
        return i;
    }
    if (e.name !== void 0) {
        if (e.searchParents !== true) {
            const i = We.get(t, qs);
            if (i === null) {
                throw createMappedError(763, t);
            }
            if (i.is(e.name)) {
                return i;
            }
            return void 0;
        }
        let i = t;
        let s = false;
        while (i !== null) {
            const t = We.get(i, qs);
            if (t !== null) {
                s = true;
                if (t.is(e.name)) {
                    return t;
                }
            }
            i = getEffectiveParentNode(i);
        }
        if (s) {
            return void 0;
        }
        throw createMappedError(764, t);
    }
    let i = t;
    while (i !== null) {
        const t = We.get(i, qs);
        if (t !== null) {
            return t;
        }
        i = getEffectiveParentNode(i);
    }
    throw createMappedError(765, t);
};

const getElementAnnotation = (t, e) => Zt(ie(e), t);

const getElementDefinition = t => {
    const e = Zt(qs, t) ?? getDefinitionFromStaticAu(t, Ps, CustomElementDefinition.create);
    if (e == null) {
        throw createMappedError(760, t);
    }
    return e;
};

const createElementInjectable = () => {
    const t = {
        $isInterface: false,
        register() {
            return {
                $isResolver: true,
                resolve(e, i) {
                    if (i.has(t, true)) {
                        return i.get(t);
                    } else {
                        return null;
                    }
                }
            };
        }
    };
    return t;
};

const _s = /*@__PURE__*/ function() {
    const t = {
        value: "",
        writable: false,
        enumerable: false,
        configurable: true
    };
    const e = {};
    return function(i, s = e) {
        const n = class Anonymous {};
        t.value = i;
        fe(n, "name", t);
        if (s !== e) {
            he(n.prototype, s);
        }
        return n;
    };
}();

const Vs = /*@__PURE__*/ le({
    name: qs,
    keyFrom: getElementKeyFrom,
    isType: isElementType,
    for: findElementControllerFor,
    define: defineElement,
    getDefinition: getElementDefinition,
    annotate: annotateElementMetadata,
    getAnnotation: getElementAnnotation,
    generateName: Is,
    createInjectable: createElementInjectable,
    generateType: _s,
    find(t, e) {
        const i = t.find(Ps, e);
        return i == null ? null : Zt(qs, i) ?? getDefinitionFromStaticAu(i, Ps, CustomElementDefinition.create) ?? null;
    }
});

const Fs = /*@__PURE__*/ ie("processContent");

function processContent(t) {
    return t === void 0 ? function(t, e) {
        if (!e.static || e.kind !== "method") throw createMappedError(766, t);
        e.addInitializer(function() {
            te(t, this, Fs);
        });
    } : function(i, s) {
        s.addInitializer(function() {
            if (e(t) || I(t)) {
                t = this[t];
            }
            if (!c(t)) throw createMappedError(766, t);
            const i = Zt(qs, this);
            if (i !== void 0) {
                i.processContent = t;
            } else {
                te(t, this, Fs);
            }
        });
        return i;
    };
}

function capture(t) {
    return function(e, i) {
        const s = c(t) ? t : true;
        i.addInitializer(function() {
            annotateElementMetadata(this, "capture", s);
            if (isElementType(this)) {
                getElementDefinition(this).capture = s;
            }
        });
    };
}

const Hs = /*@__PURE__*/ Se("IAppRoot");

class AppRoot {
    get controller() {
        return this.q;
    }
    constructor(t, e, i, s = false) {
        this.config = t;
        this.container = e;
        this.pe = void 0;
        this.ve = s;
        const n = this.host = t.host;
        i.prepare(this);
        registerResolver(e, Bs, new C("IEventTarget", n));
        registerHostNode(e, n, this.platform = this.xe(e, n));
        this.pe = L(this.ye("creating"), () => {
            if (!t.allowActionlessForm !== false) {
                n.addEventListener("submit", t => {
                    const e = t.target;
                    const i = !e.getAttribute("action");
                    if (e.tagName === "FORM" && i) {
                        t.preventDefault();
                    }
                }, false);
            }
            const i = s ? e : e.createChild();
            const r = t.component;
            let l;
            if (c(r)) {
                l = i.invoke(r);
                Te(r, l);
            } else {
                l = t.component;
            }
            const h = {
                hydrate: false,
                projections: null
            };
            const a = s ? CustomElementDefinition.create({
                name: Is(),
                template: this.host,
                enhance: true,
                strict: t.strictBinding
            }) : void 0;
            const u = this.q = Controller.$el(i, l, n, h, a);
            u.hE(h);
            return L(this.ye("hydrating"), () => {
                u.hS();
                return L(this.ye("hydrated"), () => {
                    u.hC();
                    this.pe = void 0;
                });
            });
        });
    }
    activate() {
        return L(this.pe, () => L(this.ye("activating"), () => L(this.q.activate(this.q, null, void 0), () => this.ye("activated"))));
    }
    deactivate() {
        return L(this.ye("deactivating"), () => L(this.q.deactivate(this.q, null), () => this.ye("deactivated")));
    }
    ye(t) {
        const e = this.container;
        const i = this.ve && !e.has(Oe, false) ? [] : e.getAll(Oe);
        return T(...i.reduce((e, i) => {
            if (i.slot === t) {
                e.push(i.run());
            }
            return e;
        }, []));
    }
    xe(t, e) {
        let i;
        if (!t.has(Ne, false)) {
            if (e.ownerDocument.defaultView === null) {
                throw createMappedError(769);
            }
            i = new Wt(e.ownerDocument.defaultView);
            t.register(Te(Ne, i));
        } else {
            i = t.get(Ne);
        }
        return i;
    }
    dispose() {
        this.q?.dispose();
    }
}

const Os = /*@__PURE__*/ Se("IAurelia");

class Aurelia {
    get isRunning() {
        return this.ir;
    }
    get isStarting() {
        return this.be;
    }
    get isStopping() {
        return this.we;
    }
    get root() {
        if (this.ke == null) {
            if (this.next == null) {
                throw createMappedError(767);
            }
            return this.next;
        }
        return this.ke;
    }
    constructor(t = r.createContainer()) {
        this.container = t;
        this.ir = false;
        this.be = false;
        this.we = false;
        this.ke = void 0;
        this.next = void 0;
        this.Ce = void 0;
        this.Be = void 0;
        if (t.has(Os, true) || t.has(Aurelia, true)) {
            throw createMappedError(768);
        }
        registerResolver(t, Os, new C("IAurelia", this));
        registerResolver(t, Aurelia, new C("Aurelia", this));
        registerResolver(t, Hs, this.Se = new C("IAppRoot"));
    }
    register(...t) {
        this.container.register(...t);
        return this;
    }
    app(t) {
        this.next = new AppRoot(t, this.container, this.Se);
        return this;
    }
    enhance(t) {
        const e = t.container ?? this.container.createChild();
        const i = registerResolver(e, Hs, new C("IAppRoot"));
        const s = new AppRoot({
            host: t.host,
            component: t.component
        }, e, i, true);
        return L(s.activate(), () => s);
    }
    async waitForIdle() {
        const t = this.root.platform;
        await t.domQueue.yield();
        await t.taskQueue.yield();
    }
    start(t = this.next) {
        if (t == null) {
            throw createMappedError(770);
        }
        if (E(this.Ce)) {
            return this.Ce;
        }
        return this.Ce = L(this.stop(), () => {
            if (!We.hideProp) {
                Reflect.set(t.host, "$aurelia", this);
            }
            this.Se.prepare(this.ke = t);
            this.be = true;
            return L(t.activate(), () => {
                this.ir = true;
                this.be = false;
                this.Ce = void 0;
                this.Ae(t, "au-started", t.host);
            });
        });
    }
    stop(t = false) {
        if (E(this.Be)) {
            return this.Be;
        }
        if (this.ir === true) {
            const e = this.ke;
            this.ir = false;
            this.we = true;
            return this.Be = L(e.deactivate(), () => L(Pt(), () => {
                Reflect.deleteProperty(e.host, "$aurelia");
                if (t) {
                    e.dispose();
                }
                this.ke = void 0;
                this.Se.dispose();
                this.we = false;
                this.Be = void 0;
                this.Ae(e, "au-stopped", e.host);
            }));
        }
    }
    dispose() {
        if (this.ir || this.we) {
            throw createMappedError(771);
        }
        this.container.dispose();
    }
    Ae(t, e, i) {
        const s = new t.platform.window.CustomEvent(e, {
            detail: this,
            bubbles: true,
            cancelable: true
        });
        i.dispatchEvent(s);
    }
}

const $s = /*@__PURE__*/ Se("ISVGAnalyzer", t => t.singleton(NoopSVGAnalyzer));

const o = t => {
    const s = i();
    t = e(t) ? t.split(" ") : t;
    let n;
    for (n of t) {
        s[n] = true;
    }
    return s;
};

class NoopSVGAnalyzer {
    isStandardSvgAttribute(t, e) {
        return false;
    }
}

class SVGAnalyzer {
    static register(t) {
        t.register(Ae(this, this), Re(this, $s));
    }
    constructor() {
        this.Re = he(i(), {
            a: o("class externalResourcesRequired id onactivate onclick onfocusin onfocusout onload onmousedown onmousemove onmouseout onmouseover onmouseup requiredExtensions requiredFeatures style systemLanguage target transform xlink:actuate xlink:arcrole xlink:href xlink:role xlink:show xlink:title xlink:type xml:base xml:lang xml:space"),
            altGlyph: o("class dx dy externalResourcesRequired format glyphRef id onactivate onclick onfocusin onfocusout onload onmousedown onmousemove onmouseout onmouseover onmouseup requiredExtensions requiredFeatures rotate style systemLanguage x xlink:actuate xlink:arcrole xlink:href xlink:role xlink:show xlink:title xlink:type xml:base xml:lang xml:space y"),
            altglyph: i(),
            altGlyphDef: o("id xml:base xml:lang xml:space"),
            altglyphdef: i(),
            altGlyphItem: o("id xml:base xml:lang xml:space"),
            altglyphitem: i(),
            animate: o("accumulate additive attributeName attributeType begin by calcMode dur end externalResourcesRequired fill from id keySplines keyTimes max min onbegin onend onload onrepeat repeatCount repeatDur requiredExtensions requiredFeatures restart systemLanguage to values xlink:actuate xlink:arcrole xlink:href xlink:role xlink:show xlink:title xlink:type xml:base xml:lang xml:space"),
            animateColor: o("accumulate additive attributeName attributeType begin by calcMode dur end externalResourcesRequired fill from id keySplines keyTimes max min onbegin onend onload onrepeat repeatCount repeatDur requiredExtensions requiredFeatures restart systemLanguage to values xlink:actuate xlink:arcrole xlink:href xlink:role xlink:show xlink:title xlink:type xml:base xml:lang xml:space"),
            animateMotion: o("accumulate additive begin by calcMode dur end externalResourcesRequired fill from id keyPoints keySplines keyTimes max min onbegin onend onload onrepeat origin path repeatCount repeatDur requiredExtensions requiredFeatures restart rotate systemLanguage to values xlink:actuate xlink:arcrole xlink:href xlink:role xlink:show xlink:title xlink:type xml:base xml:lang xml:space"),
            animateTransform: o("accumulate additive attributeName attributeType begin by calcMode dur end externalResourcesRequired fill from id keySplines keyTimes max min onbegin onend onload onrepeat repeatCount repeatDur requiredExtensions requiredFeatures restart systemLanguage to type values xlink:actuate xlink:arcrole xlink:href xlink:role xlink:show xlink:title xlink:type xml:base xml:lang xml:space"),
            circle: o("class cx cy externalResourcesRequired id onactivate onclick onfocusin onfocusout onload onmousedown onmousemove onmouseout onmouseover onmouseup r requiredExtensions requiredFeatures style systemLanguage transform xml:base xml:lang xml:space"),
            clipPath: o("class clipPathUnits externalResourcesRequired id requiredExtensions requiredFeatures style systemLanguage transform xml:base xml:lang xml:space"),
            "color-profile": o("id local name rendering-intent xlink:actuate xlink:arcrole xlink:href xlink:role xlink:show xlink:title xlink:type xml:base xml:lang xml:space"),
            cursor: o("externalResourcesRequired id requiredExtensions requiredFeatures systemLanguage x xlink:actuate xlink:arcrole xlink:href xlink:role xlink:show xlink:title xlink:type xml:base xml:lang xml:space y"),
            defs: o("class externalResourcesRequired id onactivate onclick onfocusin onfocusout onload onmousedown onmousemove onmouseout onmouseover onmouseup requiredExtensions requiredFeatures style systemLanguage transform xml:base xml:lang xml:space"),
            desc: o("class id style xml:base xml:lang xml:space"),
            ellipse: o("class cx cy externalResourcesRequired id onactivate onclick onfocusin onfocusout onload onmousedown onmousemove onmouseout onmouseover onmouseup requiredExtensions requiredFeatures rx ry style systemLanguage transform xml:base xml:lang xml:space"),
            feBlend: o("class height id in in2 mode result style width x xml:base xml:lang xml:space y"),
            feColorMatrix: o("class height id in result style type values width x xml:base xml:lang xml:space y"),
            feComponentTransfer: o("class height id in result style width x xml:base xml:lang xml:space y"),
            feComposite: o("class height id in in2 k1 k2 k3 k4 operator result style width x xml:base xml:lang xml:space y"),
            feConvolveMatrix: o("bias class divisor edgeMode height id in kernelMatrix kernelUnitLength order preserveAlpha result style targetX targetY width x xml:base xml:lang xml:space y"),
            feDiffuseLighting: o("class diffuseConstant height id in kernelUnitLength result style surfaceScale width x xml:base xml:lang xml:space y"),
            feDisplacementMap: o("class height id in in2 result scale style width x xChannelSelector xml:base xml:lang xml:space y yChannelSelector"),
            feDistantLight: o("azimuth elevation id xml:base xml:lang xml:space"),
            feFlood: o("class height id result style width x xml:base xml:lang xml:space y"),
            feFuncA: o("amplitude exponent id intercept offset slope tableValues type xml:base xml:lang xml:space"),
            feFuncB: o("amplitude exponent id intercept offset slope tableValues type xml:base xml:lang xml:space"),
            feFuncG: o("amplitude exponent id intercept offset slope tableValues type xml:base xml:lang xml:space"),
            feFuncR: o("amplitude exponent id intercept offset slope tableValues type xml:base xml:lang xml:space"),
            feGaussianBlur: o("class height id in result stdDeviation style width x xml:base xml:lang xml:space y"),
            feImage: o("class externalResourcesRequired height id preserveAspectRatio result style width x xlink:actuate xlink:arcrole xlink:href xlink:role xlink:show xlink:title xlink:type xml:base xml:lang xml:space y"),
            feMerge: o("class height id result style width x xml:base xml:lang xml:space y"),
            feMergeNode: o("id xml:base xml:lang xml:space"),
            feMorphology: o("class height id in operator radius result style width x xml:base xml:lang xml:space y"),
            feOffset: o("class dx dy height id in result style width x xml:base xml:lang xml:space y"),
            fePointLight: o("id x xml:base xml:lang xml:space y z"),
            feSpecularLighting: o("class height id in kernelUnitLength result specularConstant specularExponent style surfaceScale width x xml:base xml:lang xml:space y"),
            feSpotLight: o("id limitingConeAngle pointsAtX pointsAtY pointsAtZ specularExponent x xml:base xml:lang xml:space y z"),
            feTile: o("class height id in result style width x xml:base xml:lang xml:space y"),
            feTurbulence: o("baseFrequency class height id numOctaves result seed stitchTiles style type width x xml:base xml:lang xml:space y"),
            filter: o("class externalResourcesRequired filterRes filterUnits height id primitiveUnits style width x xlink:actuate xlink:arcrole xlink:href xlink:role xlink:show xlink:title xlink:type xml:base xml:lang xml:space y"),
            font: o("class externalResourcesRequired horiz-adv-x horiz-origin-x horiz-origin-y id style vert-adv-y vert-origin-x vert-origin-y xml:base xml:lang xml:space"),
            "font-face": o("accent-height alphabetic ascent bbox cap-height descent font-family font-size font-stretch font-style font-variant font-weight hanging id ideographic mathematical overline-position overline-thickness panose-1 slope stemh stemv strikethrough-position strikethrough-thickness underline-position underline-thickness unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical widths x-height xml:base xml:lang xml:space"),
            "font-face-format": o("id string xml:base xml:lang xml:space"),
            "font-face-name": o("id name xml:base xml:lang xml:space"),
            "font-face-src": o("id xml:base xml:lang xml:space"),
            "font-face-uri": o("id xlink:actuate xlink:arcrole xlink:href xlink:role xlink:show xlink:title xlink:type xml:base xml:lang xml:space"),
            foreignObject: o("class externalResourcesRequired height id onactivate onclick onfocusin onfocusout onload onmousedown onmousemove onmouseout onmouseover onmouseup requiredExtensions requiredFeatures style systemLanguage transform width x xml:base xml:lang xml:space y"),
            g: o("class externalResourcesRequired id onactivate onclick onfocusin onfocusout onload onmousedown onmousemove onmouseout onmouseover onmouseup requiredExtensions requiredFeatures style systemLanguage transform xml:base xml:lang xml:space"),
            glyph: o("arabic-form class d glyph-name horiz-adv-x id lang orientation style unicode vert-adv-y vert-origin-x vert-origin-y xml:base xml:lang xml:space"),
            glyphRef: o("class dx dy format glyphRef id style x xlink:actuate xlink:arcrole xlink:href xlink:role xlink:show xlink:title xlink:type xml:base xml:lang xml:space y"),
            glyphref: i(),
            hkern: o("g1 g2 id k u1 u2 xml:base xml:lang xml:space"),
            image: o("class externalResourcesRequired height id onactivate onclick onfocusin onfocusout onload onmousedown onmousemove onmouseout onmouseover onmouseup preserveAspectRatio requiredExtensions requiredFeatures style systemLanguage transform width x xlink:actuate xlink:arcrole xlink:href xlink:role xlink:show xlink:title xlink:type xml:base xml:lang xml:space y"),
            line: o("class externalResourcesRequired id onactivate onclick onfocusin onfocusout onload onmousedown onmousemove onmouseout onmouseover onmouseup requiredExtensions requiredFeatures style systemLanguage transform x1 x2 xml:base xml:lang xml:space y1 y2"),
            linearGradient: o("class externalResourcesRequired gradientTransform gradientUnits id spreadMethod style x1 x2 xlink:arcrole xlink:href xlink:role xlink:title xlink:type xml:base xml:lang xml:space y1 y2"),
            marker: o("class externalResourcesRequired id markerHeight markerUnits markerWidth orient preserveAspectRatio refX refY style viewBox xml:base xml:lang xml:space"),
            mask: o("class externalResourcesRequired height id maskContentUnits maskUnits requiredExtensions requiredFeatures style systemLanguage width x xml:base xml:lang xml:space y"),
            metadata: o("id xml:base xml:lang xml:space"),
            "missing-glyph": o("class d horiz-adv-x id style vert-adv-y vert-origin-x vert-origin-y xml:base xml:lang xml:space"),
            mpath: o("externalResourcesRequired id xlink:actuate xlink:arcrole xlink:href xlink:role xlink:show xlink:title xlink:type xml:base xml:lang xml:space"),
            path: o("class d externalResourcesRequired id onactivate onclick onfocusin onfocusout onload onmousedown onmousemove onmouseout onmouseover onmouseup pathLength requiredExtensions requiredFeatures style systemLanguage transform xml:base xml:lang xml:space"),
            pattern: o("class externalResourcesRequired height id patternContentUnits patternTransform patternUnits preserveAspectRatio requiredExtensions requiredFeatures style systemLanguage viewBox width x xlink:actuate xlink:arcrole xlink:href xlink:role xlink:show xlink:title xlink:type xml:base xml:lang xml:space y"),
            polygon: o("class externalResourcesRequired id onactivate onclick onfocusin onfocusout onload onmousedown onmousemove onmouseout onmouseover onmouseup points requiredExtensions requiredFeatures style systemLanguage transform xml:base xml:lang xml:space"),
            polyline: o("class externalResourcesRequired id onactivate onclick onfocusin onfocusout onload onmousedown onmousemove onmouseout onmouseover onmouseup points requiredExtensions requiredFeatures style systemLanguage transform xml:base xml:lang xml:space"),
            radialGradient: o("class cx cy externalResourcesRequired fx fy gradientTransform gradientUnits id r spreadMethod style xlink:arcrole xlink:href xlink:role xlink:title xlink:type xml:base xml:lang xml:space"),
            rect: o("class externalResourcesRequired height id onactivate onclick onfocusin onfocusout onload onmousedown onmousemove onmouseout onmouseover onmouseup requiredExtensions requiredFeatures rx ry style systemLanguage transform width x xml:base xml:lang xml:space y"),
            script: o("externalResourcesRequired id type xlink:actuate xlink:arcrole xlink:href xlink:role xlink:show xlink:title xlink:type xml:base xml:lang xml:space"),
            set: o("attributeName attributeType begin dur end externalResourcesRequired fill id max min onbegin onend onload onrepeat repeatCount repeatDur requiredExtensions requiredFeatures restart systemLanguage to xlink:actuate xlink:arcrole xlink:href xlink:role xlink:show xlink:title xlink:type xml:base xml:lang xml:space"),
            stop: o("class id offset style xml:base xml:lang xml:space"),
            style: o("id media title type xml:base xml:lang xml:space"),
            svg: o("baseProfile class contentScriptType contentStyleType externalResourcesRequired height id onabort onactivate onclick onerror onfocusin onfocusout onload onmousedown onmousemove onmouseout onmouseover onmouseup onresize onscroll onunload onzoom preserveAspectRatio requiredExtensions requiredFeatures style systemLanguage version viewBox width x xml:base xml:lang xml:space y zoomAndPan"),
            switch: o("class externalResourcesRequired id onactivate onclick onfocusin onfocusout onload onmousedown onmousemove onmouseout onmouseover onmouseup requiredExtensions requiredFeatures style systemLanguage transform xml:base xml:lang xml:space"),
            symbol: o("class externalResourcesRequired id onactivate onclick onfocusin onfocusout onload onmousedown onmousemove onmouseout onmouseover onmouseup preserveAspectRatio style viewBox xml:base xml:lang xml:space"),
            text: o("class dx dy externalResourcesRequired id lengthAdjust onactivate onclick onfocusin onfocusout onload onmousedown onmousemove onmouseout onmouseover onmouseup requiredExtensions requiredFeatures rotate style systemLanguage textLength transform x xml:base xml:lang xml:space y"),
            textPath: o("class externalResourcesRequired id lengthAdjust method onactivate onclick onfocusin onfocusout onload onmousedown onmousemove onmouseout onmouseover onmouseup requiredExtensions requiredFeatures spacing startOffset style systemLanguage textLength xlink:arcrole xlink:href xlink:role xlink:title xlink:type xml:base xml:lang xml:space"),
            title: o("class id style xml:base xml:lang xml:space"),
            tref: o("class dx dy externalResourcesRequired id lengthAdjust onactivate onclick onfocusin onfocusout onload onmousedown onmousemove onmouseout onmouseover onmouseup requiredExtensions requiredFeatures rotate style systemLanguage textLength x xlink:arcrole xlink:href xlink:role xlink:title xlink:type xml:base xml:lang xml:space y"),
            tspan: o("class dx dy externalResourcesRequired id lengthAdjust onactivate onclick onfocusin onfocusout onload onmousedown onmousemove onmouseout onmouseover onmouseup requiredExtensions requiredFeatures rotate style systemLanguage textLength x xml:base xml:lang xml:space y"),
            use: o("class externalResourcesRequired height id onactivate onclick onfocusin onfocusout onload onmousedown onmousemove onmouseout onmouseover onmouseup requiredExtensions requiredFeatures style systemLanguage transform width x xlink:actuate xlink:arcrole xlink:href xlink:role xlink:show xlink:title xlink:type xml:base xml:lang xml:space y"),
            view: o("externalResourcesRequired id preserveAspectRatio viewBox viewTarget xml:base xml:lang xml:space zoomAndPan"),
            vkern: o("g1 g2 id k u1 u2 xml:base xml:lang xml:space")
        });
        this.Te = o("a altGlyph animate animateColor circle clipPath defs ellipse feBlend feColorMatrix feComponentTransfer feComposite feConvolveMatrix feDiffuseLighting feDisplacementMap feFlood feGaussianBlur feImage feMerge feMorphology feOffset feSpecularLighting feTile feTurbulence filter font foreignObject g glyph glyphRef image line linearGradient marker mask missing-glyph path pattern polygon polyline radialGradient rect stop svg switch symbol text textPath tref tspan use");
        this.Ee = o("alignment-baseline baseline-shift clip-path clip-rule clip color-interpolation-filters color-interpolation color-profile color-rendering color cursor direction display dominant-baseline enable-background fill-opacity fill-rule fill filter flood-color flood-opacity font-family font-size-adjust font-size font-stretch font-style font-variant font-weight glyph-orientation-horizontal glyph-orientation-vertical image-rendering kerning letter-spacing lighting-color marker-end marker-mid marker-start mask opacity overflow pointer-events shape-rendering stop-color stop-opacity stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width stroke text-anchor text-decoration text-rendering unicode-bidi visibility word-spacing writing-mode");
        const t = m(Ne);
        this.SVGElement = t.globalThis.SVGElement;
        const e = t.document.createElement("div");
        e.innerHTML = "<svg><altGlyph /></svg>";
        if (e.firstElementChild.nodeName === "altglyph") {
            const t = this.Re;
            let e = t.altGlyph;
            t.altGlyph = t.altglyph;
            t.altglyph = e;
            e = t.altGlyphDef;
            t.altGlyphDef = t.altglyphdef;
            t.altglyphdef = e;
            e = t.altGlyphItem;
            t.altGlyphItem = t.altglyphitem;
            t.altglyphitem = e;
            e = t.glyphRef;
            t.glyphRef = t.glyphref;
            t.glyphref = e;
        }
    }
    isStandardSvgAttribute(t, e) {
        if (!(t instanceof this.SVGElement)) {
            return false;
        }
        return this.Te[t.nodeName] === true && this.Ee[e] === true || this.Re[t.nodeName]?.[e] === true;
    }
}

class AttrMapper {
    constructor() {
        this.fns = [];
        this.Le = i();
        this.Me = i();
        this.svg = m($s);
        this.useMapping({
            LABEL: {
                for: "htmlFor"
            },
            IMG: {
                usemap: "useMap"
            },
            INPUT: {
                maxlength: "maxLength",
                minlength: "minLength",
                formaction: "formAction",
                formenctype: "formEncType",
                formmethod: "formMethod",
                formnovalidate: "formNoValidate",
                formtarget: "formTarget",
                inputmode: "inputMode"
            },
            TEXTAREA: {
                maxlength: "maxLength"
            },
            TD: {
                rowspan: "rowSpan",
                colspan: "colSpan"
            },
            TH: {
                rowspan: "rowSpan",
                colspan: "colSpan"
            }
        });
        this.useGlobalMapping({
            accesskey: "accessKey",
            contenteditable: "contentEditable",
            tabindex: "tabIndex",
            textcontent: "textContent",
            innerhtml: "innerHTML",
            scrolltop: "scrollTop",
            scrollleft: "scrollLeft",
            readonly: "readOnly"
        });
    }
    useMapping(t) {
        let e;
        let s;
        let n;
        let r;
        for (n in t) {
            e = t[n];
            s = this.Le[n] ??= i();
            for (r in e) {
                if (s[r] !== void 0) {
                    throw createError(r, n);
                }
                s[r] = e[r];
            }
        }
    }
    useGlobalMapping(t) {
        const e = this.Me;
        for (const i in t) {
            if (e[i] !== void 0) {
                throw createError(i, "*");
            }
            e[i] = t[i];
        }
    }
    useTwoWay(t) {
        this.fns.push(t);
    }
    isTwoWay(t, e) {
        return shouldDefaultToTwoWay(t, e) || this.fns.length > 0 && this.fns.some(i => i(t, e));
    }
    map(t, e) {
        return this.Le[t.nodeName]?.[e] ?? this.Me[e] ?? (isDataAttribute(t, e, this.svg) ? e : null);
    }
}

AttrMapper.register = _(K);

function shouldDefaultToTwoWay(t, e) {
    switch (t.nodeName) {
      case "INPUT":
        switch (t.type) {
          case "checkbox":
          case "radio":
            return e === "checked";

          default:
            return e === "value" || e === "files" || e === "value-as-number" || e === "value-as-date";
        }

      case "TEXTAREA":
      case "SELECT":
        return e === "value";

      default:
        switch (e) {
          case "textcontent":
          case "innerhtml":
            return t.hasAttribute("contenteditable");

          case "scrolltop":
          case "scrollleft":
            return true;

          default:
            return false;
        }
    }
}

function createError(t, e) {
    return createMappedError(719, t, e);
}

const Ns = {
    register(t) {
        t.register(Y, AttrMapper, ResourceResolver);
    }
};

class BindablesInfo {
    constructor(t, e, i) {
        this.attrs = t;
        this.bindables = e;
        this.primary = i;
    }
}

class ResourceResolver {
    constructor() {
        this.De = new WeakMap;
        this.Pe = new WeakMap;
    }
    el(t, e) {
        let i = this.De.get(t);
        if (i == null) {
            this.De.set(t, i = new RecordCache);
        }
        return e in i.qe ? i.qe[e] : i.qe[e] = Vs.find(t, e);
    }
    attr(t, e) {
        let i = this.De.get(t);
        if (i == null) {
            this.De.set(t, i = new RecordCache);
        }
        return e in i.Ie ? i.Ie[e] : i.Ie[e] = Xe.find(t, e);
    }
    bindables(t) {
        let e = this.Pe.get(t);
        if (e == null) {
            const s = t.bindables;
            const n = i();
            let r;
            let l;
            let h = false;
            let a;
            let c;
            for (l in s) {
                r = s[l];
                c = r.attribute;
                if (r.primary === true) {
                    if (h) {
                        throw createMappedError(714, t);
                    }
                    h = true;
                    a = r;
                } else if (!h && a == null) {
                    a = r;
                }
                n[c] = BindableDefinition.create(l, r);
            }
            if (r == null && t.type === "custom-attribute") {
                a = n.value = BindableDefinition.create("value", {
                    mode: t.defaultBindingMode ?? Gt
                });
            }
            this.Pe.set(t, e = new BindablesInfo(n, s, a ?? null));
        }
        return e;
    }
}

ResourceResolver.register = _(Q);

class RecordCache {
    constructor() {
        this.qe = i();
        this.Ie = i();
    }
}

const Ws = i();

class AttributeNSAccessor {
    static forNs(t) {
        return Ws[t] ??= new AttributeNSAccessor(t);
    }
    constructor(t) {
        this.ns = t;
        this.type = be | we;
    }
    getValue(t, e) {
        return t.getAttributeNS(this.ns, e);
    }
    setValue(t, e, i) {
        if (t == null) {
            e.removeAttributeNS(this.ns, i);
        } else {
            e.setAttributeNS(this.ns, i, t);
        }
    }
}

(() => {
    mixinNoopSubscribable(AttributeNSAccessor);
})();

class DataAttributeAccessor {
    constructor() {
        this.type = be | we;
    }
    getValue(t, e) {
        return t.getAttribute(e);
    }
    setValue(t, e, i) {
        if (t == null) {
            e.removeAttribute(i);
        } else {
            e.setAttribute(i, t);
        }
    }
}

(() => {
    mixinNoopSubscribable(DataAttributeAccessor);
})();

const js = /*@__PURE__*/ new DataAttributeAccessor;

class SelectValueObserver {
    static _e(t) {
        const e = [];
        if (t.length === 0) {
            return e;
        }
        const i = t.length;
        let s = 0;
        let n;
        while (i > s) {
            n = t[s];
            if (n.selected) {
                e[e.length] = oe.call(n, "model") ? n.model : n.value;
            }
            ++s;
        }
        return e;
    }
    static Ve(t, e) {
        return t === e;
    }
    constructor(t, e, i, s) {
        this.type = be | ye | we;
        this.v = void 0;
        this.ov = void 0;
        this.Fe = false;
        this.He = void 0;
        this.Oe = void 0;
        this.iO = false;
        this.ht = false;
        this.lt = t;
        this.oL = s;
        this.cf = i;
    }
    getValue() {
        return this.iO ? this.v : this.lt.multiple ? SelectValueObserver._e(this.lt.options) : this.lt.value;
    }
    setValue(t) {
        this.ov = this.v;
        this.v = t;
        this.Fe = t !== this.ov;
        this.$e(t instanceof Array ? t : null);
        this.gt();
    }
    gt() {
        if (this.Fe) {
            this.Fe = false;
            this.syncOptions();
        }
    }
    handleCollectionChange() {
        this.syncOptions();
    }
    syncOptions() {
        const t = this.v;
        const e = this.lt;
        const i = y(t);
        const s = e.matcher ?? SelectValueObserver.Ve;
        const n = e.options;
        let r = n.length;
        while (r-- > 0) {
            const e = n[r];
            const l = oe.call(e, "model") ? e.model : e.value;
            if (i) {
                e.selected = t.findIndex(t => !!s(l, t)) !== -1;
                continue;
            }
            e.selected = !!s(l, t);
        }
    }
    syncValue() {
        const t = this.lt;
        const e = t.options;
        const i = e.length;
        const s = this.v;
        let n = 0;
        if (t.multiple) {
            if (!(s instanceof Array)) {
                return true;
            }
            let r;
            const l = t.matcher || SelectValueObserver.Ve;
            const h = [];
            while (n < i) {
                r = e[n];
                if (r.selected) {
                    h.push(oe.call(r, "model") ? r.model : r.value);
                }
                ++n;
            }
            let a;
            n = 0;
            while (n < s.length) {
                a = s[n];
                if (h.findIndex(t => !!l(a, t)) === -1) {
                    s.splice(n, 1);
                } else {
                    ++n;
                }
            }
            n = 0;
            while (n < h.length) {
                a = h[n];
                if (s.findIndex(t => !!l(a, t)) === -1) {
                    s.push(a);
                }
                ++n;
            }
            return false;
        }
        let r = null;
        let l;
        while (n < i) {
            l = e[n];
            if (l.selected) {
                r = oe.call(l, "model") ? l.model : l.value;
                break;
            }
            ++n;
        }
        this.ov = this.v;
        this.v = r;
        return true;
    }
    ct() {
        (this.Oe = createMutationObserver(this.lt, this.Ne.bind(this))).observe(this.lt, {
            childList: true,
            subtree: true,
            characterData: true
        });
        this.$e(this.v instanceof Array ? this.v : null);
        this.iO = true;
    }
    ut() {
        this.Oe.disconnect();
        this.He?.unsubscribe(this);
        this.Oe = this.He = void 0;
        this.iO = false;
    }
    $e(t) {
        this.He?.unsubscribe(this);
        this.He = void 0;
        if (t != null) {
            if (!this.lt.multiple) {
                throw createMappedError(654);
            }
            (this.He = this.oL.getArrayObserver(t)).subscribe(this);
        }
    }
    handleEvent() {
        const t = this.syncValue();
        if (t) {
            this.Tt();
        }
    }
    Ne(t) {
        this.syncOptions();
        const e = this.syncValue();
        if (e) {
            this.Tt();
        }
    }
    Tt() {
        const t = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, t);
    }
}

(() => {
    mixinNodeObserverUseConfig(SelectValueObserver);
    Rt(SelectValueObserver, null);
})();

const zs = "--";

class StyleAttributeAccessor {
    constructor(t) {
        this.obj = t;
        this.type = be | we;
        this.v = "";
        this.ov = "";
        this.styles = {};
        this.version = 0;
        this.Fe = false;
    }
    getValue() {
        return this.obj.style.cssText;
    }
    setValue(t) {
        this.v = t;
        this.Fe = t !== this.ov;
        this.gt();
    }
    We(t) {
        const e = [];
        const i = /url\([^)]+$/;
        let s = 0;
        let n = "";
        let r;
        let l;
        let h;
        let a;
        while (s < t.length) {
            r = t.indexOf(";", s);
            if (r === -1) {
                r = t.length;
            }
            n += t.substring(s, r);
            s = r + 1;
            if (i.test(n)) {
                n += ";";
                continue;
            }
            l = n.indexOf(":");
            h = n.substring(0, l).trim();
            a = n.substring(l + 1).trim();
            e.push([ h, a ]);
            n = "";
        }
        return e;
    }
    je(t) {
        let i;
        let s;
        const n = [];
        for (s in t) {
            i = t[s];
            if (i == null) {
                continue;
            }
            if (e(i)) {
                if (s.startsWith(zs)) {
                    n.push([ s, i ]);
                    continue;
                }
                n.push([ V(s), i ]);
                continue;
            }
            n.push(...this.ze(i));
        }
        return n;
    }
    Ue(t) {
        const e = t.length;
        if (e > 0) {
            const i = [];
            let s = 0;
            for (;e > s; ++s) {
                i.push(...this.ze(t[s]));
            }
            return i;
        }
        return p;
    }
    ze(t) {
        if (e(t)) {
            return this.We(t);
        }
        if (t instanceof Array) {
            return this.Ue(t);
        }
        if (t instanceof Object) {
            return this.je(t);
        }
        return p;
    }
    gt() {
        if (this.Fe) {
            this.Fe = false;
            const t = this.v;
            const e = this.styles;
            const i = this.ze(t);
            let s;
            let n = this.version;
            this.ov = t;
            let r;
            let l;
            let h;
            let a = 0;
            const c = i.length;
            for (;a < c; ++a) {
                r = i[a];
                l = r[0];
                h = r[1];
                this.setProperty(l, h);
                e[l] = n;
            }
            this.styles = e;
            this.version += 1;
            if (n === 0) {
                return;
            }
            n -= 1;
            for (s in e) {
                if (!oe.call(e, s) || e[s] !== n) {
                    continue;
                }
                this.obj.style.removeProperty(s);
            }
        }
    }
    setProperty(t, e) {
        let i = "";
        if (e != null && c(e.indexOf) && e.includes("!important")) {
            i = "important";
            e = e.replace("!important", "");
        }
        this.obj.style.setProperty(t, e, i);
    }
    bind() {
        this.v = this.ov = this.obj.style.cssText;
    }
}

(() => {
    mixinNoopSubscribable(StyleAttributeAccessor);
})();

class ValueAttributeObserver {
    constructor(t, e, i) {
        this.type = be | ye | we;
        this.v = "";
        this.ov = "";
        this.Fe = false;
        this.ht = false;
        this.lt = t;
        this.k = e;
        this.cf = i;
    }
    getValue() {
        return this.v;
    }
    setValue(t) {
        if (S(t, this.v)) {
            return;
        }
        this.ov = this.v;
        this.v = t;
        this.Fe = true;
        if (!this.cf.readonly) {
            this.gt();
        }
    }
    gt() {
        if (this.Fe) {
            this.Fe = false;
            this.lt[this.k] = this.v ?? this.cf.default;
            this.Tt();
        }
    }
    handleEvent() {
        this.ov = this.v;
        this.v = this.lt[this.k];
        if (this.ov !== this.v) {
            this.Fe = false;
            this.Tt();
        }
    }
    ct() {
        this.v = this.ov = this.lt[this.k];
    }
    Tt() {
        const t = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, t);
    }
}

(() => {
    mixinNodeObserverUseConfig(ValueAttributeObserver);
    Rt(ValueAttributeObserver, null);
})();

const Us = (() => {
    const t = "http://www.w3.org/1999/xlink";
    const e = "http://www.w3.org/XML/1998/namespace";
    const s = "http://www.w3.org/2000/xmlns/";
    return he(i(), {
        "xlink:actuate": [ "actuate", t ],
        "xlink:arcrole": [ "arcrole", t ],
        "xlink:href": [ "href", t ],
        "xlink:role": [ "role", t ],
        "xlink:show": [ "show", t ],
        "xlink:title": [ "title", t ],
        "xlink:type": [ "type", t ],
        "xml:lang": [ "lang", e ],
        "xml:space": [ "space", e ],
        xmlns: [ "xmlns", s ],
        "xmlns:xlink": [ "xlink", s ]
    });
})();

const Gs = new qt;

Gs.type = be | we;

class NodeObserverLocator {
    constructor() {
        this.allowDirtyCheck = true;
        this.Ge = i();
        this.Xe = i();
        this.Ke = i();
        this.Qe = i();
        this.Ye = m(F);
        this.p = m(Ne);
        this.Ze = m(_t);
        this.svg = m($s);
        const t = [ "change", "input" ];
        const e = {
            events: t,
            default: ""
        };
        this.useConfig({
            INPUT: {
                value: e,
                valueAsNumber: {
                    events: t,
                    default: 0
                },
                checked: {
                    type: CheckedObserver,
                    events: t
                },
                files: {
                    events: t,
                    readonly: true
                }
            },
            SELECT: {
                value: {
                    type: SelectValueObserver,
                    events: [ "change" ],
                    default: ""
                }
            },
            TEXTAREA: {
                value: e
            }
        });
        const s = {
            events: [ "change", "input", "blur", "keyup", "paste" ],
            default: ""
        };
        const n = {
            events: [ "scroll" ],
            default: 0
        };
        this.useConfigGlobal({
            scrollTop: n,
            scrollLeft: n,
            textContent: s,
            innerHTML: s
        });
        this.overrideAccessorGlobal("css", "style", "class");
        this.overrideAccessor({
            INPUT: [ "value", "checked", "model" ],
            SELECT: [ "value" ],
            TEXTAREA: [ "value" ]
        });
    }
    handles(t, e) {
        return t instanceof this.p.Node;
    }
    useConfig(t, s, n) {
        const r = this.Ge;
        let l;
        if (e(t)) {
            l = r[t] ??= i();
            if (l[s] == null) {
                l[s] = n;
            } else {
                throwMappingExisted(t, s);
            }
        } else {
            for (const e in t) {
                l = r[e] ??= i();
                const n = t[e];
                for (s in n) {
                    if (l[s] == null) {
                        l[s] = n[s];
                    } else {
                        throwMappingExisted(e, s);
                    }
                }
            }
        }
    }
    useConfigGlobal(t, e) {
        const i = this.Xe;
        if (typeof t === "object") {
            for (const e in t) {
                if (i[e] == null) {
                    i[e] = t[e];
                } else {
                    throwMappingExisted("*", e);
                }
            }
        } else {
            if (i[t] == null) {
                i[t] = e;
            } else {
                throwMappingExisted("*", t);
            }
        }
    }
    getAccessor(t, e, i) {
        if (e in this.Qe || e in (this.Ke[t.tagName] ?? H)) {
            return this.getObserver(t, e, i);
        }
        switch (e) {
          case "src":
          case "href":
          case "role":
          case "minLength":
          case "maxLength":
          case "placeholder":
          case "size":
          case "pattern":
          case "title":
          case "popovertarget":
          case "popovertargetaction":
            return js;

          default:
            {
                const i = Us[e];
                if (i !== undefined) {
                    return AttributeNSAccessor.forNs(i[1]);
                }
                if (isDataAttribute(t, e, this.svg)) {
                    return js;
                }
                return Gs;
            }
        }
    }
    overrideAccessor(t, s) {
        let n;
        if (e(t)) {
            n = this.Ke[t] ??= i();
            n[s] = true;
        } else {
            for (const e in t) {
                for (const s of t[e]) {
                    n = this.Ke[e] ??= i();
                    n[s] = true;
                }
            }
        }
    }
    overrideAccessorGlobal(...t) {
        for (const e of t) {
            this.Qe[e] = true;
        }
    }
    getNodeObserverConfig(t, e) {
        return this.Ge[t.tagName]?.[e] ?? this.Xe[e];
    }
    getNodeObserver(t, e, i) {
        const s = this.Ge[t.tagName]?.[e] ?? this.Xe[e];
        let n;
        if (s != null) {
            n = new (s.type ?? ValueAttributeObserver)(t, e, s, i, this.Ye);
            if (!n.doNotCache) {
                Vt(t)[e] = n;
            }
            return n;
        }
        return null;
    }
    getObserver(t, e, i) {
        switch (e) {
          case "class":
            return new ClassAttributeAccessor(t);

          case "css":
          case "style":
            return new StyleAttributeAccessor(t);
        }
        const s = this.getNodeObserver(t, e, i);
        if (s != null) {
            return s;
        }
        const n = Us[e];
        if (n !== undefined) {
            return AttributeNSAccessor.forNs(n[1]);
        }
        if (isDataAttribute(t, e, this.svg)) {
            return js;
        }
        if (e in t.constructor.prototype) {
            if (this.allowDirtyCheck) {
                return this.Ze.createProperty(t, e);
            }
            throw createMappedError(652, e);
        } else {
            return new Ft(t, e);
        }
    }
}

NodeObserverLocator.register = _(It);

function getCollectionObserver(t, e) {
    if (t instanceof Array) {
        return e.getArrayObserver(t);
    }
    if (t instanceof Map) {
        return e.getMapObserver(t);
    }
    if (t instanceof Set) {
        return e.getSetObserver(t);
    }
}

function throwMappingExisted(t, e) {
    throw createMappedError(653, t, e);
}

function defaultMatcher(t, e) {
    return t === e;
}

class CheckedObserver {
    constructor(t, e, i, s) {
        this.type = be | ye | we;
        this.v = void 0;
        this.ov = void 0;
        this.Je = void 0;
        this.ti = void 0;
        this.ht = false;
        this.lt = t;
        this.oL = s;
        this.cf = i;
    }
    getValue() {
        return this.v;
    }
    setValue(t) {
        const e = this.v;
        if (t === e) {
            return;
        }
        this.v = t;
        this.ov = e;
        this.ei();
        this.ii();
        this.Tt();
    }
    handleCollectionChange() {
        this.ii();
    }
    handleChange(t, e) {
        this.ii();
    }
    ii() {
        const t = this.v;
        const e = this.lt;
        const i = oe.call(e, "model") ? e.model : e.value;
        const s = e.type === "radio";
        const n = e.matcher !== void 0 ? e.matcher : defaultMatcher;
        if (s) {
            e.checked = !!n(t, i);
        } else if (t === true) {
            e.checked = true;
        } else {
            let s = false;
            if (y(t)) {
                s = t.findIndex(t => !!n(t, i)) !== -1;
            } else if (t instanceof Set) {
                for (const e of t) {
                    if (n(e, i)) {
                        s = true;
                        break;
                    }
                }
            } else if (t instanceof Map) {
                for (const e of t) {
                    const t = e[0];
                    const r = e[1];
                    if (n(t, i) && r === true) {
                        s = true;
                        break;
                    }
                }
            }
            e.checked = s;
        }
    }
    handleEvent() {
        let t = this.ov = this.v;
        const e = this.lt;
        const i = oe.call(e, "model") ? e.model : e.value;
        const s = e.checked;
        const n = e.matcher !== void 0 ? e.matcher : defaultMatcher;
        if (e.type === "checkbox") {
            if (y(t)) {
                const e = t.findIndex(t => !!n(t, i));
                if (s && e === -1) {
                    t.push(i);
                } else if (!s && e !== -1) {
                    t.splice(e, 1);
                }
                return;
            } else if (t instanceof Set) {
                const e = {};
                let r = e;
                for (const e of t) {
                    if (n(e, i) === true) {
                        r = e;
                        break;
                    }
                }
                if (s && r === e) {
                    t.add(i);
                } else if (!s && r !== e) {
                    t.delete(r);
                }
                return;
            } else if (t instanceof Map) {
                let e;
                for (const s of t) {
                    const t = s[0];
                    if (n(t, i) === true) {
                        e = t;
                        break;
                    }
                }
                t.set(e, s);
                return;
            }
            t = s;
        } else if (s) {
            t = i;
        } else {
            return;
        }
        this.v = t;
        this.Tt();
    }
    ct() {
        this.ei();
    }
    ut() {
        this.v = this.ov = void 0;
        this.Je?.unsubscribe(this);
        this.ti?.unsubscribe(this);
        this.Je = this.ti = void 0;
    }
    Tt() {
        Xs = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, Xs);
        Xs = void 0;
    }
    ei() {
        const t = this.lt;
        (this.ti ??= t.$observers?.model ?? t.$observers?.value)?.subscribe(this);
        this.Je?.unsubscribe(this);
        this.Je = void 0;
        if (t.type === "checkbox") {
            (this.Je = getCollectionObserver(this.v, this.oL))?.subscribe(this);
        }
    }
}

(() => {
    mixinNodeObserverUseConfig(CheckedObserver);
    Rt(CheckedObserver, null);
})();

let Xs = void 0;

class AttrBindingBehavior {
    bind(t, e) {
        if (!(e instanceof PropertyBinding)) {
            throw createMappedError(9994, e);
        }
        e.useTargetObserver(js);
    }
}

AttrBindingBehavior.$au = {
    type: Me,
    name: "attr"
};

class SelfBindingBehavior {
    bind(t, e) {
        if (!("handleEvent" in e)) {
            throw createMappedError(801);
        }
        e.self = true;
    }
    unbind(t, e) {
        e.self = false;
    }
}

SelfBindingBehavior.$au = {
    type: Me,
    name: "self"
};

class UpdateTriggerBindingBehavior {
    constructor() {
        this.oL = m(Et);
        this.si = m(It);
    }
    bind(t, e, ...i) {
        if (!(this.si instanceof NodeObserverLocator)) {
            throw createMappedError(9993);
        }
        if (i.length === 0) {
            throw createMappedError(802);
        }
        if (!(e instanceof PropertyBinding) || !(e.mode & Qt)) {
            throw createMappedError(803);
        }
        const s = this.si.getNodeObserverConfig(e.target, e.targetProperty);
        if (s == null) {
            throw createMappedError(9992, e);
        }
        const n = this.si.getNodeObserver(e.target, e.targetProperty, this.oL);
        n.useConfig({
            readonly: s.readonly,
            default: s.default,
            events: i
        });
        e.useTargetObserver(n);
    }
}

UpdateTriggerBindingBehavior.$au = {
    type: Me,
    name: "updateTrigger"
};

class If {
    constructor() {
        this.elseFactory = void 0;
        this.elseView = void 0;
        this.ifView = void 0;
        this.view = void 0;
        this.value = false;
        this.cache = true;
        this.pending = void 0;
        this.ni = false;
        this.ri = 0;
        this.oi = m(ai);
        this.l = m(Ss);
    }
    attaching(t, e) {
        return this.li(this.value);
    }
    detaching(t, e) {
        this.ni = true;
        return L(this.pending, () => {
            this.ni = false;
            this.pending = void 0;
            void this.view?.deactivate(t, this.$controller);
        });
    }
    valueChanged(t, e) {
        if (!this.$controller.isActive) return;
        t = !!t;
        e = !!e;
        if (t !== e) return this.li(t);
    }
    li(t) {
        const e = this.view;
        const i = this.$controller;
        const s = this.ri++;
        const isCurrent = () => !this.ni && this.ri === s + 1;
        let n;
        return L(this.pending, () => this.pending = L(e?.deactivate(e, i), () => {
            if (!isCurrent()) {
                return;
            }
            if (t) {
                n = this.view = this.ifView = this.cache && this.ifView != null ? this.ifView : this.oi.create();
            } else {
                n = this.view = this.elseView = this.cache && this.elseView != null ? this.elseView : this.elseFactory?.create();
            }
            if (n == null) {
                return;
            }
            n.setLocation(this.l);
            return L(n.activate(n, i, i.scope), () => {
                if (isCurrent()) {
                    this.pending = void 0;
                }
            });
        }));
    }
    dispose() {
        this.ifView?.dispose();
        this.elseView?.dispose();
        this.ifView = this.elseView = this.view = void 0;
    }
    accept(t) {
        if (this.view?.accept(t) === true) {
            return true;
        }
    }
}

If.$au = {
    type: Ue,
    name: "if",
    isTemplateController: true,
    bindables: {
        value: true,
        cache: {
            set: t => t === "" || !!t && t !== "false"
        }
    }
};

class Else {
    constructor() {
        this.f = m(ai);
    }
    link(t, e, i, s) {
        const n = t.children;
        const r = n[n.length - 1];
        if (r instanceof If) {
            r.elseFactory = this.f;
        } else if (r.viewModel instanceof If) {
            r.viewModel.elseFactory = this.f;
        } else {
            throw createMappedError(810);
        }
    }
}

Else.$au = {
    type: "custom-attribute",
    name: "else",
    isTemplateController: true
};

function dispose(t) {
    t.dispose();
}

const Ks = [ "BindingBehavior", "ValueConverter" ];

class Repeat {
    constructor() {
        this.views = [];
        this.key = null;
        this.hi = [];
        this.ai = [];
        this.ci = [];
        this.ui = new Map;
        this.fi = void 0;
        this.di = false;
        this.mi = false;
        this.gi = null;
        this.pi = void 0;
        this.xi = false;
        this.l = m(Ss);
        this.yi = m(xs);
        this.f = m(ai);
        this.bi = m(Js);
        const t = m(G);
        const e = t.props[0].props[0];
        if (e !== void 0) {
            const {to: t, value: i, command: s} = e;
            if (t === "key") {
                if (s === null) {
                    this.key = i;
                } else if (s === "bind") {
                    this.key = m(zt).parse(i, pe);
                } else {
                    throw createMappedError(775, s);
                }
            } else {
                throw createMappedError(776, t);
            }
        }
    }
    binding(t, e) {
        const i = this.yi.bindings;
        const s = i.length;
        let n = void 0;
        let r;
        let l = 0;
        for (;s > l; ++l) {
            n = i[l];
            if (n.target === this && n.targetProperty === "items") {
                r = this.forOf = n.ast;
                this.wi = n;
                let t = r.iterable;
                while (t != null && Ks.includes(t.$kind)) {
                    t = t.expression;
                    this.di = true;
                }
                this.gi = t;
                break;
            }
        }
        this.ki();
        const h = r.declaration;
        if (!(this.xi = h.$kind === "ArrayDestructuring" || h.$kind === "ObjectDestructuring")) {
            this.local = bt(h, this.$controller.scope, n, null);
        }
    }
    attaching(t, e) {
        this.Ci();
        this.Bi(void 0);
        return this.Si(t, this.pi ?? p);
    }
    detaching(t, e) {
        this.ki();
        return this.Ai(t);
    }
    unbinding(t, e) {
        this.ui.clear();
    }
    itemsChanged() {
        if (!this.$controller.isActive) {
            return;
        }
        this.ki();
        this.Ci();
        this.Bi(void 0);
        this.Ri(void 0);
    }
    handleCollectionChange(t, e) {
        const i = this.$controller;
        if (!i.isActive) {
            return;
        }
        if (this.di) {
            if (this.mi) {
                return;
            }
            this.mi = true;
            this.items = bt(this.forOf.iterable, i.scope, this.wi, null);
            this.mi = false;
            return;
        }
        this.Ci();
        this.Bi(this.key === null ? e : void 0);
        this.Ri(e);
    }
    Ri(t) {
        const e = this.views;
        this.hi = e.slice();
        const i = e.length;
        const s = this.key;
        const n = s !== null;
        const r = this.ci;
        const l = this.ai;
        if (n || t === void 0) {
            const e = this.local;
            const h = this.pi;
            const a = h.length;
            const c = this.forOf;
            const u = c.declaration;
            const f = this.wi;
            const d = this.xi;
            t = Ht(a);
            let m = 0;
            if (i === 0) {
                for (;m < a; ++m) {
                    t[m] = -2;
                }
            } else if (a === 0) {
                for (m = 0; m < i; ++m) {
                    t.deletedIndices.push(m);
                    t.deletedItems.push(getItem(d, u, r[m], f, e));
                }
            } else if (n) {
                const n = Array(i);
                for (m = 0; m < i; ++m) {
                    n[m] = getKeyValue(d, s, u, r[m], f, e);
                }
                const h = Array(i);
                for (m = 0; m < a; ++m) {
                    h[m] = getKeyValue(d, s, u, l[m], f, e);
                }
                for (m = 0; m < a; ++m) {
                    if (n.includes(h[m])) {
                        t[m] = n.indexOf(h[m]);
                    } else {
                        t[m] = -2;
                    }
                }
                for (m = 0; m < i; ++m) {
                    if (!h.includes(n[m])) {
                        t.deletedIndices.push(m);
                        t.deletedItems.push(getItem(d, u, r[m], f, e));
                    }
                }
            } else {
                for (m = 0; m < a; ++m) {
                    if (r.includes(l[m])) {
                        t[m] = r.indexOf(l[m]);
                    } else {
                        t[m] = -2;
                    }
                }
                for (m = 0; m < i; ++m) {
                    if (!l.includes(r[m])) {
                        t.deletedIndices.push(m);
                        t.deletedItems.push(getItem(d, u, r[m], f, e));
                    }
                }
            }
        }
        if (t.deletedIndices.length > 0) {
            const e = L(this.Ti(t), () => this.Ei(t));
            if (E(e)) {
                e.catch(rethrow);
            }
        } else {
            this.Ei(t);
        }
    }
    ki() {
        const t = this.$controller.scope;
        let e = this.Li;
        let i = this.di;
        let s;
        if (i) {
            e = this.Li = bt(this.gi, t, this.wi, null) ?? null;
            i = this.di = !S(this.items, e);
        }
        const n = this.fi;
        if (this.$controller.isActive) {
            const t = i ? e : this.items;
            s = this.fi = this.bi.resolve(t).getObserver?.(t);
            if (n !== s) {
                n?.unsubscribe(this);
                s?.subscribe(this);
            }
        } else {
            n?.unsubscribe(this);
            this.fi = undefined;
        }
    }
    Bi(t) {
        const e = this.ai;
        this.ci = e.slice();
        const i = this.pi;
        const s = i.length;
        const n = this.ai = Array(i.length);
        const r = this.ui;
        const l = new Map;
        const h = this.$controller.scope;
        const a = this.wi;
        const c = this.forOf;
        const u = this.local;
        const f = this.xi;
        if (t === void 0) {
            const t = this.key;
            const e = t !== null;
            if (e) {
                const e = Array(s);
                if (typeof t === "string") {
                    for (let n = 0; n < s; ++n) {
                        e[n] = i[n][t];
                    }
                } else {
                    for (let n = 0; n < s; ++n) {
                        const s = createScope(i[n], c, h, a, u, f);
                        setItem(f, c.declaration, s, a, u, i[n]);
                        e[n] = bt(t, s, a, null);
                    }
                }
                for (let t = 0; t < s; ++t) {
                    n[t] = getScope(r, l, e[t], i[t], c, h, a, u, f);
                }
            } else {
                for (let t = 0; t < s; ++t) {
                    n[t] = getScope(r, l, i[t], i[t], c, h, a, u, f);
                }
            }
        } else {
            const r = e.length;
            for (let l = 0; l < s; ++l) {
                const s = t[l];
                if (s >= 0 && s < r) {
                    n[l] = e[s];
                } else {
                    n[l] = createScope(i[l], c, h, a, u, f);
                }
                setItem(f, c.declaration, n[l], a, u, i[l]);
            }
        }
        r.clear();
        this.ui = l;
    }
    Ci() {
        const t = this.items;
        if (y(t)) {
            this.pi = t.slice(0);
            return;
        }
        const e = [];
        this.bi.resolve(t).iterate(t, (t, i) => {
            e[i] = t;
        });
        this.pi = e;
    }
    Si(t, e) {
        let i = void 0;
        let s;
        let n;
        let r;
        const {$controller: l, f: h, l: a, ai: c} = this;
        const u = e.length;
        const f = this.views = Array(u);
        for (let e = 0; e < u; ++e) {
            n = f[e] = h.create().setLocation(a);
            n.nodes.unlink();
            r = c[e];
            setContextualProperties(r.overrideContext, e, u);
            s = n.activate(t ?? n, l, r);
            if (E(s)) {
                (i ??= []).push(s);
            }
        }
        if (i !== void 0) {
            return i.length === 1 ? i[0] : Promise.all(i);
        }
    }
    Ai(t) {
        let e = void 0;
        let i;
        let s;
        let n = 0;
        const {views: r, $controller: l} = this;
        const h = r.length;
        for (;h > n; ++n) {
            s = r[n];
            s.release();
            i = s.deactivate(t ?? s, l);
            if (E(i)) {
                (e ?? (e = [])).push(i);
            }
        }
        if (e !== void 0) {
            return e.length === 1 ? e[0] : Promise.all(e);
        }
    }
    Ti(t) {
        let e = void 0;
        let i;
        let s;
        const {$controller: n, views: r} = this;
        const l = t.deletedIndices.slice().sort(compareNumber);
        const h = l.length;
        let a = 0;
        for (;h > a; ++a) {
            s = r[l[a]];
            s.release();
            i = s.deactivate(s, n);
            if (E(i)) {
                (e ?? (e = [])).push(i);
            }
        }
        a = 0;
        for (;h > a; ++a) {
            r.splice(l[a] - a, 1);
        }
        if (e !== void 0) {
            return e.length === 1 ? e[0] : Promise.all(e);
        }
    }
    Ei(t) {
        let e = void 0;
        let i;
        let s;
        let n = 0;
        const {$controller: r, f: l, l: h, views: a, ai: c, hi: u} = this;
        const f = t.length;
        for (;f > n; ++n) {
            if (t[n] === -2) {
                s = l.create();
                a.splice(n, 0, s);
            }
        }
        if (a.length !== f) {
            throw createMappedError(814, [ a.length, f ]);
        }
        let d = 0;
        n = 0;
        for (;n < t.length; ++n) {
            if ((d = t[n]) !== -2) {
                a[n] = u[d];
            }
        }
        const m = longestIncreasingSubsequence(t);
        const g = m.length;
        let p;
        let v = g - 1;
        n = f - 1;
        for (;n >= 0; --n) {
            s = a[n];
            p = a[n + 1];
            if (t[n] === -2) {
                s.nodes.link(p?.nodes ?? h);
                s.setLocation(h);
                setContextualProperties(c[n].overrideContext, n, f);
                i = s.activate(s, r, c[n]);
                if (E(i)) {
                    (e ?? (e = [])).push(i);
                }
            } else if (v < 0 || n !== m[v]) {
                s.nodes.link(p?.nodes ?? h);
                setContextualProperties(s.scope.overrideContext, n, f);
                s.nodes.insertBefore(s.location);
            } else {
                setContextualProperties(s.scope.overrideContext, n, f);
                --v;
            }
        }
        if (e !== void 0) {
            return e.length === 1 ? e[0] : Promise.all(e);
        }
    }
    dispose() {
        this.views.forEach(dispose);
        this.views = void 0;
    }
    accept(t) {
        const {views: e} = this;
        if (e !== void 0) {
            for (let i = 0, s = e.length; i < s; ++i) {
                if (e[i].accept(t) === true) {
                    return true;
                }
            }
        }
    }
}

Repeat.$au = {
    type: Ue,
    name: "repeat",
    isTemplateController: true,
    bindables: [ "items" ]
};

let Qs = 16;

let Ys = new Int32Array(Qs);

let Zs = new Int32Array(Qs);

function longestIncreasingSubsequence(t) {
    const e = t.length;
    if (e > Qs) {
        Qs = e;
        Ys = new Int32Array(e);
        Zs = new Int32Array(e);
    }
    let i = 0;
    let s = 0;
    let n = 0;
    let r = 0;
    let l = 0;
    let h = 0;
    let a = 0;
    let c = 0;
    for (;r < e; r++) {
        s = t[r];
        if (s !== -2) {
            l = Ys[i];
            n = t[l];
            if (n !== -2 && n < s) {
                Zs[r] = l;
                Ys[++i] = r;
                continue;
            }
            h = 0;
            a = i;
            while (h < a) {
                c = h + a >> 1;
                n = t[Ys[c]];
                if (n !== -2 && n < s) {
                    h = c + 1;
                } else {
                    a = c;
                }
            }
            n = t[Ys[h]];
            if (s < n || n === -2) {
                if (h > 0) {
                    Zs[r] = Ys[h - 1];
                }
                Ys[h] = r;
            }
        }
    }
    r = ++i;
    const u = new Int32Array(r);
    s = Ys[i - 1];
    while (i-- > 0) {
        u[i] = s;
        s = Zs[s];
    }
    while (r-- > 0) Ys[r] = 0;
    return u;
}

class RepeatOverrideContext {
    get $odd() {
        return !this.$even;
    }
    get $even() {
        return this.$index % 2 === 0;
    }
    get $first() {
        return this.$index === 0;
    }
    get $middle() {
        return !this.$first && !this.$last;
    }
    get $last() {
        return this.$index === this.$length - 1;
    }
    constructor(t = 0, e = 1) {
        this.$index = t;
        this.$length = e;
    }
}

const setContextualProperties = (t, e, i) => {
    t.$index = e;
    t.$length = i;
};

const Js = /*@__PURE__*/ Se("IRepeatableHandlerResolver", t => t.singleton(RepeatableHandlerResolver));

class RepeatableHandlerResolver {
    constructor() {
        this.Mi = m(b(tn));
    }
    resolve(t) {
        if (en.handles(t)) {
            return en;
        }
        if (sn.handles(t)) {
            return sn;
        }
        if (nn.handles(t)) {
            return nn;
        }
        if (rn.handles(t)) {
            return rn;
        }
        if (on.handles(t)) {
            return on;
        }
        const e = this.Mi.find(e => e.handles(t));
        if (e !== void 0) {
            return e;
        }
        return ln;
    }
}

class ArrayLikeHandler {
    static register(t) {
        t.register(Ae(tn, this));
    }
    handles(t) {
        return "length" in t && O(t.length);
    }
    iterate(t, e) {
        for (let i = 0, s = t.length; i < s; ++i) {
            e(t[i], i, t);
        }
    }
}

const tn = /*@__PURE__*/ Se("IRepeatableHandler");

const en = {
    handles: y,
    getObserver: Ot,
    iterate(t, e) {
        const i = t.length;
        let s = 0;
        for (;s < i; ++s) {
            e(t[s], s, t);
        }
    }
};

const sn = {
    handles: $,
    getObserver: Ot,
    iterate(t, e) {
        let i = 0;
        let s;
        for (s of t.keys()) {
            e(s, i++, t);
        }
    }
};

const nn = {
    handles: N,
    getObserver: Ot,
    iterate(t, e) {
        let i = 0;
        let s;
        for (s of t.entries()) {
            e(s, i++, t);
        }
    }
};

const rn = {
    handles: O,
    iterate(t, e) {
        let i = 0;
        for (;i < t; ++i) {
            e(i, i, t);
        }
    }
};

const on = {
    handles: t => t == null,
    iterate() {}
};

const ln = {
    handles(t) {
        return false;
    },
    iterate(t, e) {
        throw createMappedError(777, t);
    }
};

const setItem = (t, e, i, s, n, r) => {
    if (t) {
        At(e, i, s, null, r);
    } else {
        i.bindingContext[n] = r;
    }
};

const getItem = (t, e, i, s, n) => t ? bt(e, i, s, null) : i.bindingContext[n];

const getKeyValue = (t, e, i, s, n, r) => {
    if (typeof e === "string") {
        const l = getItem(t, i, s, n, r);
        return l[e];
    }
    return bt(e, s, n, null);
};

const getScope = (t, e, i, s, n, r, l, h, a) => {
    let c = t.get(i);
    if (c === void 0) {
        c = createScope(s, n, r, l, h, a);
    } else if (c instanceof Tt) {
        t.delete(i);
    } else if (c.length === 1) {
        c = c[0];
        t.delete(i);
    } else {
        c = c.shift();
    }
    if (e.has(i)) {
        const t = e.get(i);
        if (t instanceof Tt) {
            e.set(i, [ t, c ]);
        } else {
            t.push(c);
        }
    } else {
        e.set(i, c);
    }
    setItem(a, n.declaration, c, l, h, s);
    return c;
};

const createScope = (t, e, i, s, n, r) => {
    if (r) {
        const n = Tt.fromParent(i, new $t, new RepeatOverrideContext);
        At(e.declaration, n, s, null, t);
    }
    return Tt.fromParent(i, new $t(n, t), new RepeatOverrideContext);
};

const compareNumber = (t, e) => t - e;

class With {
    constructor() {
        this.view = m(ai).create().setLocation(m(Ss));
    }
    valueChanged(t, e) {
        const i = this.$controller;
        const s = this.view.bindings;
        let n;
        let r = 0, l = 0;
        if (i.isActive && s != null) {
            n = Tt.fromParent(i.scope, t === void 0 ? {} : t);
            for (l = s.length; l > r; ++r) {
                s[r].bind(n);
            }
        }
    }
    attaching(t, e) {
        const {$controller: i, value: s} = this;
        const n = Tt.fromParent(i.scope, s === void 0 ? {} : s);
        return this.view.activate(t, i, n);
    }
    detaching(t, e) {
        return this.view.deactivate(t, this.$controller);
    }
    dispose() {
        this.view.dispose();
        this.view = void 0;
    }
    accept(t) {
        if (this.view?.accept(t) === true) {
            return true;
        }
    }
}

With.$au = {
    type: Ue,
    name: "with",
    isTemplateController: true,
    bindables: [ "value" ]
};

class Switch {
    constructor() {
        this.cases = [];
        this.activeCases = [];
        this.promise = void 0;
        this.f = m(ai);
        this.l = m(Ss);
    }
    link(t, e, i, s) {
        this.view = this.f.create(this.$controller).setLocation(this.l);
    }
    attaching(t, e) {
        const i = this.view;
        const s = this.$controller;
        this.queue(() => i.activate(t, s, s.scope));
        this.queue(() => this.swap(t, this.value));
        return this.promise;
    }
    detaching(t, e) {
        this.queue(() => {
            const e = this.view;
            return e.deactivate(t, this.$controller);
        });
        return this.promise;
    }
    dispose() {
        this.view?.dispose();
        this.view = void 0;
    }
    valueChanged(t, e) {
        if (!this.$controller.isActive) {
            return;
        }
        this.queue(() => this.swap(null, this.value));
    }
    caseChanged(t) {
        this.queue(() => this.Di(t));
    }
    Di(t) {
        const e = t.isMatch(this.value);
        const i = this.activeCases;
        const s = i.length;
        if (!e) {
            if (s > 0 && i[0].id === t.id) {
                return this.Pi(null);
            }
            return;
        }
        if (s > 0 && i[0].id < t.id) {
            return;
        }
        const n = [];
        let r = t.fallThrough;
        if (!r) {
            n.push(t);
        } else {
            const e = this.cases;
            const i = e.indexOf(t);
            for (let t = i, s = e.length; t < s && r; t++) {
                const i = e[t];
                n.push(i);
                r = i.fallThrough;
            }
        }
        return L(this.Pi(null, n), () => {
            this.activeCases = n;
            return this.qi(null);
        });
    }
    swap(t, e) {
        const i = [];
        let s = false;
        for (const t of this.cases) {
            if (s || t.isMatch(e)) {
                i.push(t);
                s = t.fallThrough;
            }
            if (i.length > 0 && !s) {
                break;
            }
        }
        const n = this.defaultCase;
        if (i.length === 0 && n !== void 0) {
            i.push(n);
        }
        return L(this.activeCases.length > 0 ? this.Pi(t, i) : void 0, () => {
            this.activeCases = i;
            if (i.length === 0) {
                return;
            }
            return this.qi(t);
        });
    }
    qi(t) {
        const e = this.$controller;
        if (!e.isActive) {
            return;
        }
        const i = this.activeCases;
        const s = i.length;
        if (s === 0) {
            return;
        }
        const n = e.scope;
        if (s === 1) {
            return i[0].activate(t, n);
        }
        return T(...i.map(e => e.activate(t, n)));
    }
    Pi(t, e = []) {
        const i = this.activeCases;
        const s = i.length;
        if (s === 0) {
            return;
        }
        if (s === 1) {
            const s = i[0];
            if (!e.includes(s)) {
                i.length = 0;
                return s.deactivate(t);
            }
            return;
        }
        return L(T(...i.reduce((i, s) => {
            if (!e.includes(s)) {
                i.push(s.deactivate(t));
            }
            return i;
        }, [])), () => {
            i.length = 0;
        });
    }
    queue(t) {
        const e = this.promise;
        let i = void 0;
        i = this.promise = L(L(e, t), () => {
            if (this.promise === i) {
                this.promise = void 0;
            }
        });
    }
    accept(t) {
        if (this.$controller.accept(t) === true) {
            return true;
        }
        if (this.activeCases.some(e => e.accept(t))) {
            return true;
        }
    }
}

Switch.$au = {
    type: Ue,
    name: "switch",
    isTemplateController: true,
    bindables: [ "value" ]
};

let hn = 0;

const an = [ "value", {
    name: "fallThrough",
    mode: Xt,
    set(t) {
        switch (t) {
          case "true":
            return true;

          case "false":
            return false;

          default:
            return !!t;
        }
    }
} ];

class Case {
    constructor() {
        this.id = ++hn;
        this.fallThrough = false;
        this.view = void 0;
        this.f = m(ai);
        this.Ye = m(Et);
        this.l = m(Ss);
        this.Ii = m(v).scopeTo(`Case-#${this.id}`);
    }
    link(t, e, i, s) {
        const n = t.parent;
        const r = n?.viewModel;
        if (r instanceof Switch) {
            this.$switch = r;
            this.linkToSwitch(r);
        } else {
            throw createMappedError(815);
        }
    }
    detaching(t, e) {
        return this.deactivate(t);
    }
    isMatch(t) {
        this.Ii.debug("isMatch()");
        const e = this.value;
        if (y(e)) {
            if (this.fi === void 0) {
                this.fi = this._i(e);
            }
            return e.includes(t);
        }
        return e === t;
    }
    valueChanged(t, e) {
        if (y(t)) {
            this.fi?.unsubscribe(this);
            this.fi = this._i(t);
        } else if (this.fi !== void 0) {
            this.fi.unsubscribe(this);
        }
        this.$switch.caseChanged(this);
    }
    handleCollectionChange() {
        this.$switch.caseChanged(this);
    }
    activate(t, e) {
        let i = this.view;
        if (i === void 0) {
            i = this.view = this.f.create().setLocation(this.l);
        }
        if (i.isActive) {
            return;
        }
        return i.activate(t ?? i, this.$controller, e);
    }
    deactivate(t) {
        const e = this.view;
        if (e === void 0 || !e.isActive) {
            return;
        }
        return e.deactivate(t ?? e, this.$controller);
    }
    dispose() {
        this.fi?.unsubscribe(this);
        this.view?.dispose();
        this.view = void 0;
    }
    linkToSwitch(t) {
        t.cases.push(this);
    }
    _i(t) {
        const e = this.Ye.getArrayObserver(t);
        e.subscribe(this);
        return e;
    }
    accept(t) {
        if (this.$controller.accept(t) === true) {
            return true;
        }
        return this.view?.accept(t);
    }
}

(() => {
    defineAttribute({
        name: "case",
        bindables: an,
        isTemplateController: true
    }, Case);
})();

class DefaultCase extends Case {
    linkToSwitch(t) {
        if (t.defaultCase !== void 0) {
            throw createMappedError(816);
        }
        t.defaultCase = this;
    }
}

(() => {
    defineAttribute({
        name: "default-case",
        bindables: an,
        isTemplateController: true
    }, DefaultCase);
})();

var cn, un, dn;

class PromiseTemplateController {
    constructor() {
        this.preSettledTask = null;
        this.postSettledTask = null;
        this.f = m(ai);
        this.l = m(Ss);
        this.p = m(Ne);
        this.logger = m(v).scopeTo("promise.resolve");
    }
    link(t, e, i, s) {
        this.view = this.f.create(this.$controller).setLocation(this.l);
    }
    attaching(t, e) {
        const i = this.view;
        const s = this.$controller;
        return L(i.activate(t, s, this.viewScope = Tt.fromParent(s.scope, {})), () => this.swap(t));
    }
    valueChanged(t, e) {
        if (!this.$controller.isActive) {
            return;
        }
        this.swap(null);
    }
    swap(t) {
        const e = this.value;
        if (!E(e)) {
            return;
        }
        const i = this.fulfilled;
        const s = this.rejected;
        const n = this.pending;
        const r = this.viewScope;
        let l;
        const $swap = () => {
            void T(l = (this.preSettledTask = wt(() => T(i?.deactivate(t), s?.deactivate(t), n?.activate(t, r)))).result.catch(t => {
                throw t;
            }), e.then(h => {
                if (this.value !== e) {
                    return;
                }
                const fulfill = () => {
                    this.postSettlePromise = (this.postSettledTask = wt(() => T(n?.deactivate(t), s?.deactivate(t), i?.activate(t, r, h)))).result;
                };
                if (this.preSettledTask.status === xe) {
                    void l.then(fulfill);
                } else {
                    this.preSettledTask.cancel();
                    fulfill();
                }
            }, h => {
                if (this.value !== e) {
                    return;
                }
                const reject = () => {
                    this.postSettlePromise = (this.postSettledTask = wt(() => T(n?.deactivate(t), i?.deactivate(t), s?.activate(t, r, h)))).result;
                };
                if (this.preSettledTask.status === xe) {
                    void l.then(reject);
                } else {
                    this.preSettledTask.cancel();
                    reject();
                }
            }));
        };
        if (this.postSettledTask?.status === xe) {
            void this.postSettlePromise.then($swap);
        } else {
            this.postSettledTask?.cancel();
            $swap();
        }
    }
    detaching(t, e) {
        this.preSettledTask?.cancel();
        this.postSettledTask?.cancel();
        this.preSettledTask = this.postSettledTask = null;
        return this.view.deactivate(t, this.$controller);
    }
    dispose() {
        this.view?.dispose();
        this.view = void 0;
    }
}

PromiseTemplateController.$au = {
    type: Ue,
    name: "promise",
    isTemplateController: true,
    bindables: [ "value" ]
};

class PendingTemplateController {
    constructor() {
        this.view = void 0;
        this.f = m(ai);
        this.l = m(Ss);
    }
    link(t, e, i, s) {
        getPromiseController(t).pending = this;
    }
    activate(t, e) {
        let i = this.view;
        if (i === void 0) {
            i = this.view = this.f.create().setLocation(this.l);
        }
        if (i.isActive) {
            return;
        }
        return i.activate(i, this.$controller, e);
    }
    deactivate(t) {
        const e = this.view;
        if (e === void 0 || !e.isActive) {
            return;
        }
        return e.deactivate(e, this.$controller);
    }
    detaching(t) {
        return this.deactivate(t);
    }
    dispose() {
        this.view?.dispose();
        this.view = void 0;
    }
}

PendingTemplateController.$au = {
    type: Ue,
    name: "pending",
    isTemplateController: true,
    bindables: {
        value: {
            mode: Kt
        }
    }
};

class FulfilledTemplateController {
    constructor() {
        this.view = void 0;
        this.f = m(ai);
        this.l = m(Ss);
    }
    link(t, e, i, s) {
        getPromiseController(t).fulfilled = this;
    }
    activate(t, e, i) {
        this.value = i;
        let s = this.view;
        if (s === void 0) {
            s = this.view = this.f.create().setLocation(this.l);
        }
        if (s.isActive) {
            return;
        }
        return s.activate(s, this.$controller, e);
    }
    deactivate(t) {
        const e = this.view;
        if (e === void 0 || !e.isActive) {
            return;
        }
        return e.deactivate(e, this.$controller);
    }
    detaching(t, e) {
        return this.deactivate(t);
    }
    dispose() {
        this.view?.dispose();
        this.view = void 0;
    }
}

FulfilledTemplateController.$au = {
    type: Ue,
    name: "then",
    isTemplateController: true,
    bindables: {
        value: {
            mode: Qt
        }
    }
};

class RejectedTemplateController {
    constructor() {
        this.view = void 0;
        this.f = m(ai);
        this.l = m(Ss);
    }
    link(t, e, i, s) {
        getPromiseController(t).rejected = this;
    }
    activate(t, e, i) {
        this.value = i;
        let s = this.view;
        if (s === void 0) {
            s = this.view = this.f.create().setLocation(this.l);
        }
        if (s.isActive) {
            return;
        }
        return s.activate(s, this.$controller, e);
    }
    deactivate(t) {
        const e = this.view;
        if (e === void 0 || !e.isActive) {
            return;
        }
        return e.deactivate(e, this.$controller);
    }
    detaching(t, e) {
        return this.deactivate(t);
    }
    dispose() {
        this.view?.dispose();
        this.view = void 0;
    }
}

RejectedTemplateController.$au = {
    type: Ue,
    name: "catch",
    isTemplateController: true,
    bindables: {
        value: {
            mode: Qt
        }
    }
};

function getPromiseController(t) {
    const e = t.parent;
    const i = e?.viewModel;
    if (i instanceof PromiseTemplateController) {
        return i;
    }
    throw createMappedError(813);
}

class PromiseAttributePattern {
    "promise.resolve"(t, e) {
        return new J(t, e, "promise", "bind");
    }
}

cn = Symbol.metadata;

PromiseAttributePattern[cn] = {
    [x]: Z.create([ {
        pattern: "promise.resolve",
        symbols: ""
    } ], PromiseAttributePattern)
};

class FulfilledAttributePattern {
    then(t, e) {
        return new J(t, e, "then", "from-view");
    }
}

un = Symbol.metadata;

FulfilledAttributePattern[un] = {
    [x]: Z.create([ {
        pattern: "then",
        symbols: ""
    } ], FulfilledAttributePattern)
};

class RejectedAttributePattern {
    catch(t, e) {
        return new J(t, e, "catch", "from-view");
    }
}

dn = Symbol.metadata;

RejectedAttributePattern[dn] = {
    [x]: Z.create([ {
        pattern: "catch",
        symbols: ""
    } ], RejectedAttributePattern)
};

class Focus {
    constructor() {
        this.Vi = false;
        this.qe = m(je);
        this.p = m(Ne);
    }
    binding() {
        this.valueChanged();
    }
    valueChanged() {
        if (this.$controller.isActive) {
            this.Fi();
        } else {
            this.Vi = true;
        }
    }
    attached() {
        if (this.Vi) {
            this.Vi = false;
            this.Fi();
        }
        this.qe.addEventListener("focus", this);
        this.qe.addEventListener("blur", this);
    }
    detaching() {
        const t = this.qe;
        t.removeEventListener("focus", this);
        t.removeEventListener("blur", this);
    }
    handleEvent(t) {
        if (t.type === "focus") {
            this.value = true;
        } else if (!this.Hi) {
            this.value = false;
        }
    }
    Fi() {
        const t = this.qe;
        const e = this.Hi;
        const i = this.value;
        if (i && !e) {
            t.focus();
        } else if (!i && e) {
            t.blur();
        }
    }
    get Hi() {
        return this.qe === this.p.document.activeElement;
    }
}

Focus.$au = {
    type: Ue,
    name: "focus",
    bindables: {
        value: {
            mode: Yt
        }
    }
};

class Portal {
    constructor() {
        this.position = "beforeend";
        this.strict = false;
        const t = m(ai);
        const e = m(Ss);
        const i = m(Ne);
        this.p = i;
        this.Oi = i.document.createElement("div");
        (this.view = t.create()).setLocation(this.$i = ci(i));
        setEffectiveParentNode(this.view.nodes, e);
    }
    attaching(t) {
        if (this.callbackContext == null) {
            this.callbackContext = this.$controller.scope.bindingContext;
        }
        const e = this.Oi = this.Ni();
        this.Wi(e, this.position);
        return this.ji(t, e);
    }
    detaching(t) {
        return this.zi(t, this.Oi);
    }
    targetChanged() {
        const {$controller: t} = this;
        if (!t.isActive) {
            return;
        }
        const e = this.Ni();
        if (this.Oi === e) {
            return;
        }
        this.Oi = e;
        const i = L(this.zi(null, e), () => {
            this.Wi(e, this.position);
            return this.ji(null, e);
        });
        if (E(i)) {
            i.catch(rethrow);
        }
    }
    positionChanged() {
        const {$controller: t, Oi: e} = this;
        if (!t.isActive) {
            return;
        }
        const i = L(this.zi(null, e), () => {
            this.Wi(e, this.position);
            return this.ji(null, e);
        });
        if (E(i)) {
            i.catch(rethrow);
        }
    }
    ji(t, e) {
        const {activating: i, callbackContext: s, view: n} = this;
        return L(i?.call(s, e, n), () => this.Ui(t, e));
    }
    Ui(t, e) {
        const {$controller: i, view: s} = this;
        if (t === null) {
            s.nodes.insertBefore(this.$i);
        } else {
            return L(s.activate(t ?? s, i, i.scope), () => this.Gi(e));
        }
        return this.Gi(e);
    }
    Gi(t) {
        const {activated: e, callbackContext: i, view: s} = this;
        return e?.call(i, t, s);
    }
    zi(t, e) {
        const {deactivating: i, callbackContext: s, view: n} = this;
        return L(i?.call(s, e, n), () => this.Xi(t, e));
    }
    Xi(t, e) {
        const {$controller: i, view: s} = this;
        if (t === null) {
            s.nodes.remove();
        } else {
            return L(s.deactivate(t, i), () => this.Ki(e));
        }
        return this.Ki(e);
    }
    Ki(t) {
        const {deactivated: e, callbackContext: i, view: s} = this;
        return L(e?.call(i, t, s), () => this.Qi());
    }
    Ni() {
        const t = this.p;
        const i = t.document;
        let s = this.target;
        let n = this.renderContext;
        if (s === "") {
            if (this.strict) {
                throw createMappedError(811);
            }
            return i.body;
        }
        if (e(s)) {
            let r = i;
            if (e(n)) {
                n = i.querySelector(n);
            }
            if (n instanceof t.Node) {
                r = n;
            }
            s = r.querySelector(s);
        }
        if (s instanceof t.Node) {
            return s;
        }
        if (s == null) {
            if (this.strict) {
                throw createMappedError(812);
            }
            return i.body;
        }
        return s;
    }
    Qi() {
        this.$i.remove();
        this.$i.$start.remove();
    }
    Wi(t, e) {
        const i = this.$i;
        const s = i.$start;
        const n = t.parentNode;
        const r = [ s, i ];
        switch (e) {
          case "beforeend":
            insertManyBefore(t, null, r);
            break;

          case "afterbegin":
            insertManyBefore(t, t.firstChild, r);
            break;

          case "beforebegin":
            insertManyBefore(n, t, r);
            break;

          case "afterend":
            insertManyBefore(n, t.nextSibling, r);
            break;

          default:
            throw createMappedError(779, e);
        }
    }
    dispose() {
        this.view.dispose();
        this.view = void 0;
        this.callbackContext = null;
    }
    accept(t) {
        if (this.view?.accept(t) === true) {
            return true;
        }
    }
}

Portal.$au = {
    type: Ue,
    name: "portal",
    isTemplateController: true,
    bindables: [ {
        name: "target",
        primary: true
    }, "position", "activated", "activating", "callbackContext", {
        name: "renderContext",
        callback: "targetChanged"
    }, "strict", "deactivated", "deactivating" ]
};

let mn;

class AuSlot {
    constructor() {
        this.Yi = null;
        this.Zi = null;
        this.ne = false;
        this.expose = null;
        this.slotchange = null;
        this.Ji = new Set;
        this.fi = null;
        const t = m(ys);
        const e = m(Ss);
        const i = m(G);
        const s = m(Wi);
        const n = this.name = i.data.name;
        const r = i.projections?.[ui];
        const l = t.instruction?.projections?.[n];
        const h = t.controller.container;
        let a;
        let c;
        if (l == null) {
            c = h.createChild({
                inheritParentResources: true
            });
            a = s.getViewFactory(r ?? (mn ??= CustomElementDefinition.create({
                name: "au-slot-empty-template",
                template: "",
                needsCompile: false
            })), c);
            this.ts = false;
        } else {
            c = h.createChild();
            c.useResources(t.parent.controller.container);
            registerResolver(c, ys, new C(void 0, t.parent));
            a = s.getViewFactory(l, c);
            this.ts = true;
            this.es = h.getAll(mi, false)?.filter(t => t.slotName === "*" || t.slotName === n) ?? p;
        }
        this.ss = (this.es ??= p).length > 0;
        this.rs = t;
        this.view = a.create().setLocation(this.l = e);
    }
    get nodes() {
        const t = [];
        const e = this.l;
        let i = e.$start.nextSibling;
        while (i != null && i !== e) {
            if (i.nodeType !== 8) {
                t.push(i);
            }
            i = i.nextSibling;
        }
        return t;
    }
    subscribe(t) {
        this.Ji.add(t);
    }
    unsubscribe(t) {
        this.Ji.delete(t);
    }
    binding(t, e) {
        this.Yi = e.scope;
        while (e.vmKind === "synthetic" && e.parent?.viewModel instanceof AuSlot) {
            e = e.parent.parent;
        }
        const i = e.scope.bindingContext;
        let s;
        if (this.ts) {
            s = this.rs.controller.scope.parent;
            (this.Zi = Tt.fromParent(s, s.bindingContext)).overrideContext.$host = this.expose ?? i;
        }
    }
    attaching(t, e) {
        return L(this.view.activate(t, this.$controller, this.ts ? this.Zi : this.Yi), () => {
            if (this.ss || c(this.slotchange)) {
                this.es.forEach(t => t.watch(this));
                this.ei();
                this.ls();
                this.ne = true;
            }
        });
    }
    detaching(t, e) {
        this.ne = false;
        this.cs();
        this.es.forEach(t => t.unwatch(this));
        return this.view.deactivate(t, this.$controller);
    }
    exposeChanged(t) {
        if (this.ts && this.Zi != null) {
            this.Zi.overrideContext.$host = t;
        }
    }
    dispose() {
        this.view.dispose();
        this.view = void 0;
    }
    accept(t) {
        if (this.view?.accept(t) === true) {
            return true;
        }
    }
    ei() {
        if (this.fi != null) {
            return;
        }
        const t = this.l;
        const e = t.parentElement;
        if (e == null) {
            return;
        }
        (this.fi = createMutationObserver(e, e => {
            if (isMutationWithinLocation(t, e)) {
                this.ls();
            }
        })).observe(e, {
            childList: true
        });
    }
    cs() {
        this.fi?.disconnect();
        this.fi = null;
    }
    ls() {
        const t = this.nodes;
        const e = new Set(this.Ji);
        let i;
        if (this.ne) {
            this.slotchange?.call(void 0, this.name, t);
        }
        for (i of e) {
            i.handleSlotChange(this, t);
        }
    }
}

AuSlot.$au = {
    type: Ps,
    name: "au-slot",
    template: null,
    containerless: true,
    processContent(t, e, i) {
        i.name = t.getAttribute("name") ?? ui;
        let s = t.firstChild;
        let n = null;
        while (s !== null) {
            n = s.nextSibling;
            if (isElement(s) && s.hasAttribute(fi)) {
                t.removeChild(s);
            }
            s = n;
        }
    },
    bindables: [ "expose", "slotchange" ]
};

const comparePosition = (t, e) => t.compareDocumentPosition(e);

const isMutationWithinLocation = (t, e) => {
    for (const {addedNodes: i, removedNodes: s, nextSibling: n} of e) {
        let e = 0;
        let r = i.length;
        let l;
        for (;e < r; ++e) {
            l = i[e];
            if (comparePosition(t.$start, l) === 4 && comparePosition(t, l) === 2) {
                return true;
            }
        }
        if (s.length > 0) {
            if (n != null && comparePosition(t.$start, n) === 4 && comparePosition(t, n) === 2) {
                return true;
            }
        }
    }
};

class AuCompose {
    constructor() {
        this.scopeBehavior = "auto";
        this.us = void 0;
        this.tag = null;
        this.c = m(B);
        this.parent = m(xs);
        this.ds = m(je);
        this.l = m(Ss);
        this.p = m(Ne);
        this.r = m(Wi);
        this.gs = m(G);
        this.ps = m(W(CompositionContextFactory, null));
        this.yt = m(U);
        this.it = m(ys);
        this.ep = m(zt);
        this.oL = m(Et);
        this.ne = false;
    }
    get composing() {
        return this.xs;
    }
    get composition() {
        return this.us;
    }
    attaching(t, e) {
        this.ne = true;
        return this.xs = L(this.queue(new ChangeInfo(this.template, this.component, this.model, void 0), t), t => {
            if (this.ps.ys(t)) {
                this.xs = void 0;
            }
        });
    }
    detaching(t) {
        this.ne = false;
        const e = this.us;
        const i = this.xs;
        this.ps.invalidate();
        this.us = this.xs = void 0;
        return L(i, () => e?.deactivate(t));
    }
    propertyChanged(t) {
        if (!this.ne) return;
        if (t === "composing" || t === "composition") return;
        if (t === "model" && this.us != null) {
            this.us.update(this.model);
            return;
        }
        if (t === "tag" && this.us?.controller.vmKind === ls) {
            return;
        }
        this.xs = L(this.xs, () => L(this.queue(new ChangeInfo(this.template, this.component, this.model, t), void 0), t => {
            if (this.ps.ys(t)) {
                this.xs = void 0;
            }
        }));
    }
    queue(t, e) {
        const i = this.ps;
        const s = this.us;
        return L(i.create(t), t => {
            if (i.ys(t)) {
                return L(this.compose(t), n => {
                    if (i.ys(t)) {
                        return L(n.activate(e), () => {
                            if (i.ys(t)) {
                                this.us = n;
                                return L(s?.deactivate(e), () => t);
                            } else {
                                return L(n.controller.deactivate(n.controller, this.$controller), () => {
                                    n.controller.dispose();
                                    return t;
                                });
                            }
                        });
                    }
                    n.controller.dispose();
                    return t;
                });
            }
            return t;
        });
    }
    compose(t) {
        const {bs: e, ws: i, ks: s} = t.change;
        const {c: n, $controller: r, l: l, gs: h} = this;
        const a = this.Cs(this.it.controller.container, i);
        const u = n.createChild();
        const f = this.p.document.createElement(a == null ? this.tag ?? "div" : a.name);
        l.parentNode.insertBefore(f, l);
        let d;
        if (a == null) {
            d = this.tag == null ? convertToRenderLocation(f) : null;
        } else {
            d = a.containerless ? convertToRenderLocation(f) : null;
        }
        const removeCompositionHost = () => {
            f.remove();
            if (d != null) {
                let t = d.$start.nextSibling;
                let e = null;
                while (t !== null && t !== d) {
                    e = t.nextSibling;
                    t.remove();
                    t = e;
                }
                d.$start?.remove();
                d.remove();
            }
        };
        const m = this.Bs(u, typeof i === "string" ? a.Type : i, f, d);
        const compose = () => {
            const i = h.captures ?? p;
            if (a !== null) {
                const e = a.capture;
                const [s, n] = i.reduce((t, i) => {
                    const s = !(i.target in a.bindables) && (e === true || c(e) && !!e(i.target));
                    t[s ? 0 : 1].push(i);
                    return t;
                }, [ [], [] ]);
                const l = Controller.$el(u, m, f, {
                    projections: h.projections,
                    captures: s
                }, a, d);
                this.Ss(f, a, n).forEach(t => l.addBinding(t));
                return new CompositionController(l, t => l.activate(t ?? l, r, r.scope.parent), t => L(l.deactivate(t ?? l, r), removeCompositionHost), t => m.activate?.(t), t);
            } else {
                const s = CustomElementDefinition.create({
                    name: Vs.generateName(),
                    template: e
                });
                const n = this.r.getViewFactory(s, u);
                const l = Controller.$view(n, r);
                const h = this.scopeBehavior === "auto" ? Tt.fromParent(this.parent.scope, m) : Tt.create(m);
                l.setHost(f);
                if (d == null) {
                    this.Ss(f, s, i).forEach(t => l.addBinding(t));
                } else {
                    l.setLocation(d);
                }
                return new CompositionController(l, t => l.activate(t ?? l, r, h), t => L(l.deactivate(t ?? l, r), removeCompositionHost), t => m.activate?.(t), t);
            }
        };
        if ("activate" in m) {
            return L(m.activate(s), () => compose());
        } else {
            return compose();
        }
    }
    Bs(t, e, i, s) {
        if (e == null) {
            return new EmptyComponent;
        }
        if (typeof e === "object") {
            return e;
        }
        const n = this.p;
        registerHostNode(t, i, n);
        registerResolver(t, Ss, new C("IRenderLocation", s));
        const r = t.invoke(e);
        registerResolver(t, e, new C("au-compose.component", r));
        return r;
    }
    Cs(t, e) {
        if (typeof e === "string") {
            const i = Vs.find(t, e);
            if (i == null) {
                throw createMappedError(806, e);
            }
            return i;
        }
        const i = c(e) ? e : e?.constructor;
        return Vs.isType(i, void 0) ? Vs.getDefinition(i, null) : null;
    }
    Ss(t, e, i) {
        const s = new HydrationContext(this.$controller, {
            projections: null,
            captures: i
        }, this.it.parent);
        return SpreadBinding.create(s, t, e, this.r, this.yt, this.p, this.ep, this.oL);
    }
}

AuCompose.$au = {
    type: Ps,
    name: "au-compose",
    capture: true,
    containerless: true,
    bindables: [ "template", "component", "model", {
        name: "scopeBehavior",
        set: t => {
            if (t === "scoped" || t === "auto") {
                return t;
            }
            throw createMappedError(805, t);
        }
    }, {
        name: "composing",
        mode: Qt
    }, {
        name: "composition",
        mode: Qt
    }, "tag" ]
};

class EmptyComponent {}

class CompositionContextFactory {
    constructor() {
        this.id = 0;
    }
    ys(t) {
        return t.id === this.id;
    }
    create(t) {
        return L(t.load(), t => new CompositionContext(++this.id, t));
    }
    invalidate() {
        this.id++;
    }
}

class ChangeInfo {
    constructor(t, e, i, s) {
        this.bs = t;
        this.ws = e;
        this.ks = i;
        this.As = s;
    }
    load() {
        if (E(this.bs) || E(this.ws)) {
            return Promise.all([ this.bs, this.ws ]).then(([t, e]) => new LoadedChangeInfo(t, e, this.ks, this.As));
        } else {
            return new LoadedChangeInfo(this.bs, this.ws, this.ks, this.As);
        }
    }
}

class LoadedChangeInfo {
    constructor(t, e, i, s) {
        this.bs = t;
        this.ws = e;
        this.ks = i;
        this.As = s;
    }
}

class CompositionContext {
    constructor(t, e) {
        this.id = t;
        this.change = e;
    }
}

class CompositionController {
    constructor(t, e, i, s, n) {
        this.controller = t;
        this.start = e;
        this.stop = i;
        this.update = s;
        this.context = n;
        this.state = 0;
    }
    activate(t) {
        if (this.state !== 0) {
            throw createMappedError(807, this);
        }
        this.state = 1;
        return this.start(t);
    }
    deactivate(t) {
        switch (this.state) {
          case 1:
            this.state = -1;
            return this.stop(t);

          case -1:
            throw createMappedError(808);

          default:
            this.state = -1;
        }
    }
}

const gn = /*@__PURE__*/ Se("ISanitizer", t => t.singleton(class {
    sanitize() {
        throw createMappedError(99, "sanitize");
    }
}));

class SanitizeValueConverter {
    constructor() {
        this.Rs = m(gn);
    }
    toView(t) {
        if (t == null) {
            return null;
        }
        return this.Rs.sanitize(t);
    }
}

SanitizeValueConverter.$au = {
    type: Ye,
    name: "sanitize"
};

class Show {
    constructor() {
        this.el = m(je);
        this.p = m(Ne);
        this.Ts = false;
        this.M = false;
        this.$val = "";
        this.$prio = "";
        this.update = () => {
            this.M = false;
            if (Boolean(this.value) !== this.Es) {
                if (this.Es === this.Ls) {
                    this.Es = !this.Ls;
                    this.$val = this.el.style.getPropertyValue("display");
                    this.$prio = this.el.style.getPropertyPriority("display");
                    this.el.style.setProperty("display", "none", "important");
                } else {
                    this.Es = this.Ls;
                    this.el.style.setProperty("display", this.$val, this.$prio);
                    if (this.el.getAttribute("style") === "") {
                        this.el.removeAttribute("style");
                    }
                }
            }
        };
        const t = m(G);
        this.Es = this.Ls = t.alias !== "hide";
    }
    binding() {
        this.Ts = true;
        this.update();
    }
    detaching() {
        this.Ts = false;
        this.M = false;
    }
    valueChanged() {
        if (this.Ts && !this.M) {
            this.M = true;
            kt(this.update);
        }
    }
}

Show.$au = {
    type: Ue,
    name: "show",
    bindables: [ "value" ],
    aliases: [ "hide" ]
};

const pn = [ Ns, Nt, NodeObserverLocator ];

const vn = [ tt, et, it, hi ];

const xn = [ st, nt ];

const yn = [ rt, ot, lt, ht, at, ct, ut, ft, dt, mt, gt, pt, vt ];

const bn = [ DebounceBindingBehavior, OneTimeBindingBehavior, ToViewBindingBehavior, FromViewBindingBehavior, SignalBindingBehavior, ThrottleBindingBehavior, TwoWayBindingBehavior, SanitizeValueConverter, If, Else, Repeat, With, Switch, Case, DefaultCase, PromiseTemplateController, PendingTemplateController, FulfilledTemplateController, RejectedTemplateController, PromiseAttributePattern, FulfilledAttributePattern, RejectedAttributePattern, AttrBindingBehavior, SelfBindingBehavior, UpdateTriggerBindingBehavior, AuCompose, Portal, Focus, Show, AuSlot ];

const wn = [ Bi, Si, ki, Ci, vi, xi, yi, bi, wi, Ti, Pi, Ei, Li, Mi, Di, Ai, qi, Ii ];

const kn = /*@__PURE__*/ createConfiguration(n);

function createConfiguration(t) {
    return {
        optionsProvider: t,
        register(e) {
            const i = {
                coercingOptions: {
                    enableCoercion: false,
                    coerceNullish: false
                }
            };
            t(i);
            return e.register(Te(Dt, i.coercingOptions), Ut, ...pn, ...bn, ...vn, ...yn, ...wn);
        },
        customize(e) {
            return createConfiguration(e ?? t);
        }
    };
}

function children(t, i) {
    if (!children.mixed) {
        children.mixed = true;
        Rt(ChildrenBinding, null);
        lifecycleHooks()(ChildrenLifecycleHooks, null);
    }
    let s;
    const n = ie("dependencies");
    function decorator(t, e) {
        switch (e.kind) {
          case "field":
            s.name = e.name;
            break;
        }
        const i = e.metadata[n] ??= [];
        i.push(new ChildrenLifecycleHooks(s ?? {}));
    }
    if (arguments.length > 1) {
        s = {};
        decorator(t, i);
        return;
    } else if (e(t)) {
        s = {
            query: t
        };
        return decorator;
    }
    s = t === void 0 ? {} : t;
    return decorator;
}

children.mixed = false;

class ChildrenBinding {
    constructor(t, e, i, s, n, r) {
        this.Ms = void 0;
        this.isBound = false;
        this.obj = e;
        this.cb = i;
        this.J = s;
        this.Ds = n;
        this.Ps = r;
        this.fi = createMutationObserver(this.ds = t, () => {
            this.qs();
        });
    }
    getValue() {
        return this.isBound ? this.Ms : this.Is();
    }
    setValue(t) {}
    bind() {
        if (this.isBound) {
            return;
        }
        this.isBound = true;
        this.fi.observe(this.ds, {
            childList: true
        });
        this.Ms = this.Is();
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        this.fi.takeRecords();
        this.fi.disconnect();
        this.Ms = p;
    }
    qs() {
        this.Ms = this.Is();
        this.cb?.call(this.obj);
        this.subs.notify(this.Ms, undefined);
    }
    get() {
        throw createMappedError(99, "get");
    }
    Is() {
        const t = this.J;
        const e = this.Ds;
        const i = this.Ps;
        const s = t === "$all" ? this.ds.childNodes : this.ds.querySelectorAll(`:scope > ${t}`);
        const n = s.length;
        const r = [];
        const l = {
            optional: true
        };
        let h;
        let a;
        let c = 0;
        let u;
        while (n > c) {
            u = s[c];
            h = findElementControllerFor(u, l);
            a = h?.viewModel ?? null;
            if (e == null ? true : e(u, a)) {
                r.push(i == null ? a ?? u : i(u, a));
            }
            ++c;
        }
        return r;
    }
}

class ChildrenLifecycleHooks {
    constructor(t) {
        this.tt = t;
    }
    register(t) {
        Te(Ke, this).register(t);
    }
    hydrating(t, e) {
        const i = this.tt;
        const s = i.query ?? "*";
        const n = new ChildrenBinding(e.host, t, t[i.callback ?? `${ne(i.name)}Changed`], s, i.filter, i.map);
        if (/[\s>]/.test(s)) {
            throw createMappedError(9989, s);
        }
        fe(t, i.name, {
            enumerable: true,
            configurable: true,
            get: he(() => n.getValue(), {
                getObserver: () => n
            }),
            set: () => {}
        });
        e.addBinding(n);
    }
}

export { AdoptedStyleSheetsStyles, AppRoot, $e as AppTask, ArrayLikeHandler, AttrBindingBehavior, AttrMapper, AttributeBinding, Pi as AttributeBindingRenderer, AttributeNSAccessor, AuCompose, AuSlot, AuSlotsInfo, Aurelia, Ce as Bindable, BindableDefinition, Pe as BindingBehavior, BindingBehaviorDefinition, BindingModeBehavior, BindingTargetSubscriber, CSSModulesProcessorRegistry, Case, CheckedObserver, ChildrenBinding, ClassAttributeAccessor, ComputedWatcher, ContentBinding, Controller, Xe as CustomAttribute, CustomAttributeDefinition, yi as CustomAttributeRenderer, Vs as CustomElement, CustomElementDefinition, xi as CustomElementRenderer, DataAttributeAccessor, DebounceBindingBehavior, yn as DefaultBindingLanguage, vn as DefaultBindingSyntax, DefaultCase, pn as DefaultComponents, wn as DefaultRenderers, bn as DefaultResources, Else, EventModifier, hi as EventModifierRegistration, ExpressionWatcher, FlushQueue, Focus, FragmentNodeSequence, FromViewBindingBehavior, FulfilledTemplateController, Hs as IAppRoot, Oe as IAppTask, mi as IAuSlotWatcher, di as IAuSlotsInfo, Os as IAurelia, xs as IController, li as IEventModifier, Bs as IEventTarget, ii as IFlushQueue, Ls as IHistory, ys as IHydrationContext, oi as IKeyMapping, Ke as ILifecycleHooks, Ri as IListenerBindingOptions, Es as ILocation, ri as IModifiedEventHandlerCreator, je as INode, Ne as IPlatform, Ss as IRenderLocation, pi as IRenderer, Wi as IRendering, tn as IRepeatableHandler, Js as IRepeatableHandlerResolver, $s as ISVGAnalyzer, gn as ISanitizer, Ui as IShadowDOMGlobalStyles, ji as IShadowDOMStyleFactory, zi as IShadowDOMStyles, Ve as ISignaler, ai as IViewFactory, Ts as IWindow, If, InterpolationBinding, Ci as InterpolationBindingRenderer, InterpolationPartBinding, Si as IteratorBindingRenderer, LetBinding, wi as LetElementRenderer, Qe as LifecycleHooks, LifecycleHooksDefinition, LifecycleHooksEntry, ListenerBinding, ListenerBindingOptions, Ti as ListenerBindingRenderer, ss as MountTarget, NodeObserverLocator, NoopSVGAnalyzer, OneTimeBindingBehavior, PendingTemplateController, Portal, PromiseTemplateController, PropertyBinding, Bi as PropertyBindingRenderer, RefBinding, ki as RefBindingRenderer, RejectedTemplateController, Rendering, Repeat, Ns as RuntimeTemplateCompilerImplementation, SVGAnalyzer, SanitizeValueConverter, SelectValueObserver, SelfBindingBehavior, Ei as SetAttributeRenderer, Li as SetClassAttributeRenderer, vi as SetPropertyRenderer, Mi as SetStyleAttributeRenderer, ShadowDOMRegistry, xn as ShortHandBindingSyntax, SignalBindingBehavior, qi as SpreadRenderer, kn as StandardConfiguration, vs as State, StyleAttributeAccessor, Gi as StyleConfiguration, StyleElementStyles, Di as StylePropertyBindingRenderer, Switch, bi as TemplateControllerRenderer, Ai as TextBindingRenderer, ThrottleBindingBehavior, ToViewBindingBehavior, TwoWayBindingBehavior, UpdateTriggerBindingBehavior, ValueAttributeObserver, Je as ValueConverter, ValueConverterDefinition, ViewFactory, ze as Watch, With, alias, bindable, bindingBehavior, capture, children, coercer, containerless, convertToRenderLocation, cssModules, customAttribute, customElement, getEffectiveParentNode, isCustomElementController, isCustomElementViewModel, isRenderLocation, lifecycleHooks, ei as mixinAstEvaluator, ti as mixinUseScope, si as mixingBindingLimited, processContent, We as refs, registerAliases, registerHostNode, renderer, setEffectiveParentNode, shadowCSS, slotted, templateController, useShadowDOM, valueConverter, watch };
//# sourceMappingURL=index.mjs.map
