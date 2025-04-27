import { Protocol as t, isString as e, createLookup as i, getPrototypeChain as s, kebabCase as n, noop as r, DI as l, Registration as h, firstDefined as a, mergeArrays as c, isFunction as u, resourceBaseName as f, resource as d, getResourceKeyFor as m, resolve as g, IPlatform as p, emptyArray as v, ILogger as x, registrableMetadataKey as y, isArray as w, all as b, isObject as k, own as C, InstanceProvider as B, IContainer as S, toArray as A, areEqual as R, optionalResource as T, optional as E, onResolveAll as L, isPromise as M, onResolve as D, fromDefinitionOrDefault as P, pascalCase as q, fromAnnotationOrDefinitionOrTypeOrDefault as I, fromAnnotationOrTypeOrDefault as _, isSymbol as V, createImplementationRegister as F, IServiceLocator as H, emptyObject as O, isNumber as $, isSet as N, isMap as W, transient as j } from "@aurelia/kernel";

import { BindingMode as z, InstructionType as U, ITemplateCompiler as G, IInstruction as K, TemplateCompilerHooks as X, IAttrMapper as Q, IResourceResolver as Y, TemplateCompiler as Z, AttributePattern as J, AttrSyntax as tt, RefAttributePattern as et, DotSeparatedAttributePattern as it, EventAttributePattern as st, AtPrefixedTriggerAttributePattern as nt, ColonPrefixedBindAttributePattern as ot, DefaultBindingCommand as rt, OneTimeBindingCommand as lt, FromViewBindingCommand as ht, ToViewBindingCommand as at, TwoWayBindingCommand as ct, ForBindingCommand as ut, RefBindingCommand as ft, TriggerBindingCommand as dt, CaptureBindingCommand as mt, ClassBindingCommand as gt, StyleBindingCommand as pt, AttrBindingCommand as vt, SpreadValueBindingCommand as xt } from "@aurelia/template-compiler";

export { BindingCommand, BindingMode } from "@aurelia/template-compiler";

import { Metadata as yt } from "@aurelia/metadata";

import { AccessorType as wt, astEvaluate as bt, astBind as kt, astUnbind as Ct, connectable as Bt, astAssign as St, subscriberCollection as At, Scope as Rt, IObserverLocator as Tt, ConnectableSwitcher as Et, ProxyObservable as Lt, ICoercionConfiguration as Mt, PropertyAccessor as Dt, INodeObserverLocator as Pt, IDirtyChecker as qt, getObserverLookup as It, SetterObserver as _t, createIndexMap as Vt, getCollectionObserver as Ft, BindingContext as Ht, DirtyChecker as Ot } from "@aurelia/runtime";

import { BrowserPlatform as $t } from "@aurelia/platform-browser";

import { AccessScopeExpression as Nt, IExpressionParser as Wt, ExpressionParser as jt } from "@aurelia/expression-parser";

import { TaskAbortError as zt } from "@aurelia/platform";

typeof SuppressedError === "function" ? SuppressedError : function(t, e, i) {
    var s = new Error(i);
    return s.name = "SuppressedError", s.error = t, s.suppressed = e, s;
};

const {default: Ut, oneTime: Gt, toView: Kt, fromView: Xt, twoWay: Qt} = z;

const Yt = yt.get;

const Zt = yt.has;

const Jt = yt.define;

const {annotation: te} = t;

const ee = te.keyFor;

const ie = Object;

const se = String;

const ne = ie.prototype;

const oe = ne.hasOwnProperty;

const re = ie.freeze;

const le = ie.assign;

const he = ie.getOwnPropertyNames;

const ae = ie.keys;

const ce = /*@__PURE__*/ i();

const isDataAttribute = (t, i, s) => {
    if (ce[i] === true) {
        return true;
    }
    if (!e(i)) {
        return false;
    }
    const n = i.slice(0, 5);
    return ce[i] = n === "aria-" || n === "data-" || s.isStandardSvgAttribute(t, i);
};

const rethrow = t => {
    throw t;
};

const ue = Reflect.defineProperty;

const defineHiddenProp = (t, e, i) => {
    ue(t, e, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: i
    });
    return i;
};

const addSignalListener = (t, e, i) => t.addSignalListener(e, i);

const removeSignalListener = (t, e, i) => t.removeSignalListener(e, i);

const fe = "Interpolation";

const de = "IsIterator";

const me = "IsFunction";

const ge = "IsProperty";

const pe = "pending";

const ve = "running";

const xe = wt.Observer;

const ye = wt.Node;

const we = wt.Layout;

const createMappedError = (t, ...e) => new Error(`AUR${se(t).padStart(4, "0")}:${e.map(se)}`);

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
        const l = e.metadata[be] ??= i();
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

const be = /*@__PURE__*/ ee("bindables");

const ke = re({
    name: be,
    keyFrom: t => `${be}:${t}`,
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
                t.forEach((t => e(t) ? addName(t) : addDescription(t.name, t)));
            } else if (t instanceof BindableDefinition) {
                i[t.name] = t;
            } else if (t !== void 0) {
                ae(t).forEach((e => addDescription(e, t[e])));
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
            const t = Yt(be, r);
            if (t == null) continue;
            e.push(...Object.values(t));
        }
        return e;
    },
    i(t, e) {
        let s = Yt(be, e);
        if (s == null) {
            Jt(s = i(), e, be);
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
    static create(t, i = {}) {
        const s = i.mode ?? Kt;
        return new BindableDefinition(i.attribute ?? n(t), i.callback ?? `${t}Changed`, e(s) ? z[s] ?? Ut : s, i.primary ?? false, i.name ?? t, i.set ?? getInterceptor(i));
    }
}

function coercer(t, e) {
    e.addInitializer((function() {
        Ce.define(this, e.name);
    }));
}

const Ce = {
    key: /*@__PURE__*/ ee("coercer"),
    define(t, e) {
        Jt(t[e].bind(t), t, Ce.key);
    },
    for(t) {
        return Yt(Ce.key, t);
    }
};

function getInterceptor(t = {}) {
    const e = t.type ?? null;
    if (e == null) {
        return r;
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
            i = typeof t === "function" ? t.bind(e) : Ce.for(e) ?? r;
            break;
        }
    }
    return i === r ? i : createCoercer(i, t.nullable);
}

function createCoercer(t, e) {
    return function(i, s) {
        if (!s?.enableCoercion) return i;
        return (e ?? (s?.coerceNullish ?? false ? false : true)) && i == null ? i : t(i, s);
    };
}

const Be = l.createInterface;

const Se = h.singleton;

const Ae = h.aliasTo;

const Re = h.instance;

h.callback;

h.transient;

const registerResolver = (t, e, i) => t.registerResolver(e, i);

function alias(...t) {
    return function(e, i) {
        i.addInitializer((function() {
            const e = ee("aliases");
            const i = Yt(e, this);
            if (i === void 0) {
                Jt(t, this, e);
            } else {
                i.push(...t);
            }
        }));
    };
}

function registerAliases(t, e, i, s) {
    for (let n = 0, r = t.length; n < r; ++n) {
        Ae(i, e.keyFrom(t[n])).register(s);
    }
}

const Te = "custom-element";

const Ee = "custom-attribute";

const getDefinitionFromStaticAu = (t, e, i, s = "__au_static_resource__") => {
    let n = Yt(s, t);
    if (n == null) {
        if (t.$au?.type === e) {
            n = i(t.$au, t);
            Jt(n, t, s);
        }
    }
    return n;
};

function bindingBehavior(t) {
    return function(e, i) {
        i.addInitializer((function() {
            De.define(t, this);
        }));
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
        return new BindingBehaviorDefinition(i, a(getBehaviorAnnotation(i, "name"), s), c(getBehaviorAnnotation(i, "aliases"), n.aliases, i.aliases), De.keyFrom(s));
    }
    register(t, e) {
        const i = this.Type;
        const s = typeof e === "string" ? getBindingBehaviorKeyFrom(e) : this.key;
        const n = this.aliases;
        if (!t.has(s, false)) {
            t.register(t.has(i, false) ? null : Se(i, i), Ae(i, s), ...n.map((t => Ae(i, getBindingBehaviorKeyFrom(t)))));
        }
    }
}

const Le = "binding-behavior";

const Me = /*@__PURE__*/ m(Le);

const getBehaviorAnnotation = (t, e) => Yt(ee(e), t);

const getBindingBehaviorKeyFrom = t => `${Me}:${t}`;

const De = /*@__PURE__*/ re({
    name: Me,
    keyFrom: getBindingBehaviorKeyFrom,
    isType(t) {
        return u(t) && (Zt(Me, t) || t.$au?.type === Le);
    },
    define(t, e) {
        const i = BindingBehaviorDefinition.create(t, e);
        const s = i.Type;
        Jt(i, s, Me, f);
        return s;
    },
    getDefinition(t) {
        const e = Yt(Me, t) ?? getDefinitionFromStaticAu(t, Le, BindingBehaviorDefinition.create);
        if (e === void 0) {
            throw createMappedError(151, t);
        }
        return e;
    },
    find(t, e) {
        const i = t.find(Le, e);
        return i == null ? null : Yt(Me, i) ?? getDefinitionFromStaticAu(i, Le, BindingBehaviorDefinition.create) ?? null;
    },
    get(t, e) {
        return t.get(d(getBindingBehaviorKeyFrom(e)));
    }
});

const Pe = new Map;

const createConfig = t => ({
    type: Le,
    name: t
});

class BindingModeBehavior {
    bind(t, e) {
        Pe.set(e, e.mode);
        e.mode = this.mode;
    }
    unbind(t, e) {
        e.mode = Pe.get(e);
        Pe.delete(e);
    }
}

class OneTimeBindingBehavior extends BindingModeBehavior {
    get mode() {
        return Gt;
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
        return Xt;
    }
}

FromViewBindingBehavior.$au = createConfig("fromView");

class TwoWayBindingBehavior extends BindingModeBehavior {
    get mode() {
        return Qt;
    }
}

TwoWayBindingBehavior.$au = createConfig("twoWay");

const qe = new WeakMap;

const Ie = 200;

class DebounceBindingBehavior {
    constructor() {
        this.p = g(p);
    }
    bind(t, i, s, n) {
        const r = {
            type: "debounce",
            delay: s ?? Ie,
            now: this.p.performanceNow,
            queue: this.p.taskQueue,
            signals: e(n) ? [ n ] : n ?? v
        };
        const l = i.limit?.(r);
        if (l == null) ; else {
            qe.set(i, l);
        }
    }
    unbind(t, e) {
        qe.get(e)?.dispose();
        qe.delete(e);
    }
}

DebounceBindingBehavior.$au = {
    type: Le,
    name: "debounce"
};

const _e = /*@__PURE__*/ Be("ISignaler", (t => t.singleton(Signaler)));

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
        this.h = new Map;
        this.u = g(_e);
    }
    bind(t, e, ...i) {
        if (!("handleChange" in e)) {
            throw createMappedError(817);
        }
        if (i.length === 0) {
            throw createMappedError(818);
        }
        this.h.set(e, i);
        let s;
        for (s of i) {
            addSignalListener(this.u, s, e);
        }
    }
    unbind(t, e) {
        const i = this.h.get(e);
        this.h.delete(e);
        let s;
        for (s of i) {
            removeSignalListener(this.u, s, e);
        }
    }
}

SignalBindingBehavior.$au = {
    type: Le,
    name: "signal"
};

const Ve = new WeakMap;

const Fe = 200;

class ThrottleBindingBehavior {
    constructor() {
        ({performanceNow: this.C, taskQueue: this.B} = g(p));
    }
    bind(t, i, s, n) {
        const r = {
            type: "throttle",
            delay: s ?? Fe,
            now: this.C,
            queue: this.B,
            signals: e(n) ? [ n ] : n ?? v
        };
        const l = i.limit?.(r);
        if (l == null) ; else {
            Ve.set(i, l);
        }
    }
    unbind(t, e) {
        Ve.get(e)?.dispose();
        Ve.delete(e);
    }
}

ThrottleBindingBehavior.$au = {
    type: Le,
    name: "throttle"
};

const He = /*@__PURE__*/ Be("IAppTask");

class $AppTask {
    constructor(t, e, i) {
        this.c = void 0;
        this.slot = t;
        this.k = e;
        this.cb = i;
    }
    register(t) {
        return this.c = t.register(Re(He, this));
    }
    run() {
        const t = this.k;
        const e = this.cb;
        return t === null ? e() : e(this.c.get(t));
    }
}

const Oe = re({
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
        if (u(i)) {
            return new $AppTask(t, e, i);
        }
        return new $AppTask(t, null, e);
    }
    return appTaskFactory;
}

const $e = p;

class Refs {}

const Ne = /*@__PURE__*/ (() => {
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
    };
})();

const We = /*@__PURE__*/ Be("INode");

function watch(t, e) {
    if (t == null) {
        throw createMappedError(772);
    }
    return function decorator(i, s) {
        const n = s.kind === "class";
        if (n) {
            if (!u(e) && (e == null || !(e in i.prototype))) {
                throw createMappedError(773, `${se(e)}@${i.name}}`);
            }
        } else if (!u(i) || s.static) {
            throw createMappedError(774, s.name);
        }
        const r = new WatchDefinition(t, n ? e : i);
        if (n) {
            addDefinition(i);
        } else {
            let t = false;
            s.addInitializer((function() {
                if (!t) {
                    t = true;
                    addDefinition(this.constructor);
                }
            }));
        }
        function addDefinition(t) {
            je.add(t, r);
            if (isAttributeType(t)) {
                getAttributeDefinition(t).watches.push(r);
            }
            if (isElementType(t)) {
                getElementDefinition(t).watches.push(r);
            }
        }
    };
}

class WatchDefinition {
    constructor(t, e) {
        this.expression = t;
        this.callback = e;
    }
}

const je = /*@__PURE__*/ (() => {
    const t = new WeakMap;
    return re({
        add(e, i) {
            let s = t.get(e);
            if (s == null) {
                t.set(e, s = []);
            }
            s.push(i);
        },
        getDefinitions(e) {
            return t.get(e) ?? v;
        }
    });
})();

function customAttribute(t) {
    return function(e, i) {
        i.addInitializer((function() {
            defineAttribute(t, this);
        }));
        return e;
    };
}

function templateController(t) {
    return function(i, s) {
        s.addInitializer((function() {
            defineAttribute(e(t) ? {
                isTemplateController: true,
                name: t
            } : {
                isTemplateController: true,
                ...t
            }, this);
        }));
        return i;
    };
}

class CustomAttributeDefinition {
    get type() {
        return Ee;
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
        const r = a(getAttributeAnnotation(i, "defaultBindingMode"), n.defaultBindingMode, i.defaultBindingMode, Kt);
        for (const t of Object.values(ke.from(n.bindables))) {
            ke.i(t, i);
        }
        return new CustomAttributeDefinition(i, a(getAttributeAnnotation(i, "name"), s), c(getAttributeAnnotation(i, "aliases"), n.aliases, i.aliases), getAttributeKeyFrom(s), e(r) ? z[r] ?? Ut : r, a(getAttributeAnnotation(i, "isTemplateController"), n.isTemplateController, i.isTemplateController, false), ke.from(...ke.getAll(i), getAttributeAnnotation(i, "bindables"), i.bindables, n.bindables), a(getAttributeAnnotation(i, "noMultiBindings"), n.noMultiBindings, i.noMultiBindings, false), c(je.getDefinitions(i), i.watches), c(getAttributeAnnotation(i, "dependencies"), n.dependencies, i.dependencies), a(getAttributeAnnotation(i, "containerStrategy"), n.containerStrategy, i.containerStrategy, "reuse"));
    }
    register(t, e) {
        const i = this.Type;
        const s = typeof e === "string" ? getAttributeKeyFrom(e) : this.key;
        const n = this.aliases;
        if (!t.has(s, false)) {
            t.register(t.has(i, false) ? null : Se(i, i), Ae(i, s), ...n.map((t => Ae(i, getAttributeKeyFrom(t)))));
        } else {
            if (CustomAttributeDefinition.warnDuplicate) {
                t.get(x).warn(createMappedError(154, this.name));
            }
        }
    }
    toString() {
        return `au:ca:${this.name}`;
    }
}

CustomAttributeDefinition.warnDuplicate = true;

const ze = "custom-attribute";

const Ue = /*@__PURE__*/ m(ze);

const getAttributeKeyFrom = t => `${Ue}:${t}`;

const getAttributeAnnotation = (t, e) => Yt(ee(e), t);

const isAttributeType = t => u(t) && (Zt(Ue, t) || t.$au?.type === ze);

const findAttributeControllerFor = (t, e) => Ne.get(t, getAttributeKeyFrom(e)) ?? void 0;

const defineAttribute = (t, e) => {
    const i = CustomAttributeDefinition.create(t, e);
    const s = i.Type;
    Jt(i, s, Ue, f);
    return s;
};

const getAttributeDefinition = t => {
    const e = Yt(Ue, t) ?? getDefinitionFromStaticAu(t, ze, CustomAttributeDefinition.create);
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
        const t = Ne.get(r, s);
        if (t?.is(n)) {
            return t;
        }
        r = getEffectiveParentNode(r);
    }
    return null;
};

const Ge = /*@__PURE__*/ re({
    name: Ue,
    keyFrom: getAttributeKeyFrom,
    isType: isAttributeType,
    for: findAttributeControllerFor,
    closest: findClosestControllerByName,
    define: defineAttribute,
    getDefinition: getAttributeDefinition,
    annotate(t, e, i) {
        Jt(i, t, ee(e));
    },
    getAnnotation: getAttributeAnnotation,
    find(t, e) {
        const i = t.find(ze, e);
        return i === null ? null : Yt(Ue, i) ?? getDefinitionFromStaticAu(i, ze, CustomAttributeDefinition.create) ?? null;
    }
});

const Ke = /*@__PURE__*/ Be("ILifecycleHooks");

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
        while (s !== ne) {
            for (const t of he(s)) {
                if (t !== "constructor" && !t.startsWith("_")) {
                    i.add(t);
                }
            }
            s = Object.getPrototypeOf(s);
        }
        return new LifecycleHooksDefinition(e, i);
    }
}

const Xe = /*@__PURE__*/ (() => {
    const t = new WeakMap;
    const e = new WeakMap;
    return re({
        define(t, i) {
            const s = LifecycleHooksDefinition.create(t, i);
            const n = s.Type;
            e.set(n, s);
            return {
                register(t) {
                    Se(Ke, n).register(t);
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
        i[y] = Xe.define({}, t);
        return t;
    }
    return t == null ? decorator : decorator(t, e);
}

function valueConverter(t) {
    return function(e, i) {
        i.addInitializer((function() {
            Ze.define(t, this);
        }));
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
        return new ValueConverterDefinition(i, a(getConverterAnnotation(i, "name"), s), c(getConverterAnnotation(i, "aliases"), n.aliases, i.aliases), Ze.keyFrom(s));
    }
    register(t, e) {
        const i = this.Type;
        const s = typeof e === "string" ? getValueConverterKeyFrom(e) : this.key;
        const n = this.aliases;
        if (!t.has(s, false)) {
            t.register(t.has(i, false) ? null : Se(i, i), Ae(i, s), ...n.map((t => Ae(i, getValueConverterKeyFrom(t)))));
        }
    }
}

const Qe = "value-converter";

const Ye = /*@__PURE__*/ m(Qe);

const getConverterAnnotation = (t, e) => Yt(ee(e), t);

const getValueConverterKeyFrom = t => `${Ye}:${t}`;

const Ze = re({
    name: Ye,
    keyFrom: getValueConverterKeyFrom,
    isType(t) {
        return u(t) && (Zt(Ye, t) || t.$au?.type === Qe);
    },
    define(t, e) {
        const i = ValueConverterDefinition.create(t, e);
        const s = i.Type;
        Jt(i, s, Ye, f);
        return s;
    },
    getDefinition(t) {
        const e = Yt(Ye, t) ?? getDefinitionFromStaticAu(t, Qe, ValueConverterDefinition.create);
        if (e === void 0) {
            throw createMappedError(152, t);
        }
        return e;
    },
    annotate(t, e, i) {
        Jt(i, t, ee(e));
    },
    getAnnotation: getConverterAnnotation,
    find(t, e) {
        const i = t.find(Qe, e);
        return i == null ? null : Yt(Ye, i) ?? getDefinitionFromStaticAu(i, Qe, ValueConverterDefinition.create) ?? null;
    },
    get(t, e) {
        return t.get(d(getValueConverterKeyFrom(e)));
    }
});

class BindingTargetSubscriber {
    constructor(t, e) {
        this.v = void 0;
        this.b = t;
        this.A = e;
    }
    flush() {
        this.b.updateSource(this.v);
    }
    handleChange(t, e) {
        const i = this.b;
        if (t !== bt(i.ast, i.s, i, null)) {
            this.v = t;
            this.A.add(this);
        }
    }
}

const Je = /*@__PURE__*/ (() => {
    function useScope(t) {
        this.s = t;
    }
    return t => {
        defineHiddenProp(t.prototype, "useScope", useScope);
    };
})();

const ti = /*@__PURE__*/ (() => {
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
        return s[i] ??= De.get(t.l, i);
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
        return s[i] ??= Ze.get(e.l, i);
    }
    function evaluatorBindConverter(t) {
        const e = evaluatorGetConverter(this, t);
        if (e == null) {
            throw createMappedError(103, t);
        }
        const i = e.signals;
        if (i != null) {
            const t = this.l.get(_e);
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
        const i = this.l.get(_e);
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
        switch (e) {
          case "toView":
            return "toView" in n ? n.toView(i, ...s) : i;

          case "fromView":
            return "fromView" in n ? n.fromView?.(i, ...s) : i;
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

const ei = /*@__PURE__*/ Be("IFlushQueue", (t => t.singleton(FlushQueue)));

class FlushQueue {
    constructor() {
        this.R = false;
        this.T = new Set;
    }
    get count() {
        return this.T.size;
    }
    add(t) {
        this.T.add(t);
        if (this.R) {
            return;
        }
        this.R = true;
        try {
            this.T.forEach(flushItem);
        } finally {
            this.R = false;
        }
    }
    clear() {
        this.T.clear();
        this.R = false;
    }
}

const flushItem = function(t, e, i) {
    i.delete(t);
    t.flush();
};

const ii = /*@__PURE__*/ (() => {
    const t = new WeakSet;
    const debounced = (t, e, i) => {
        let s;
        let n;
        let r;
        let l = false;
        const h = t.queue;
        const callOriginalCallback = () => e(r);
        const fn = e => {
            r = e;
            if (i.isBound) {
                n = s;
                s = h.queueTask(callOriginalCallback, {
                    delay: t.delay
                });
                n?.cancel();
            } else {
                callOriginalCallback();
            }
        };
        const a = fn.dispose = () => {
            n?.cancel();
            s?.cancel();
            n = s = void 0;
        };
        fn.flush = () => {
            l = s?.status === pe;
            a();
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
        const c = t.queue;
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
                    s = c.queueTask((() => {
                        r = now();
                        callOriginalCallback();
                    }), {
                        delay: t.delay - l
                    });
                }
                n?.cancel();
            } else {
                callOriginalCallback();
            }
        };
        const u = fn.dispose = () => {
            n?.cancel();
            s?.cancel();
            n = s = void 0;
        };
        fn.flush = () => {
            a = s?.status === pe;
            u();
            if (a) {
                callOriginalCallback();
            }
        };
        return fn;
    };
    return (e, i) => {
        defineHiddenProp(e.prototype, "limit", (function(e) {
            if (t.has(this)) {
                throw createMappedError(9996);
            }
            t.add(this);
            const s = i(this, e);
            const n = e.signals;
            const r = n.length > 0 ? this.get(_e) : null;
            const l = this[s];
            const callOriginal = (...t) => l.call(this, ...t);
            const h = e.type === "debounce" ? debounced(e, callOriginal, this) : throttled(e, callOriginal, this);
            const a = r ? {
                handleChange: h.flush
            } : null;
            this[s] = h;
            if (r) {
                n.forEach((t => addSignalListener(r, t, a)));
            }
            return {
                dispose: () => {
                    if (r) {
                        n.forEach((t => removeSignalListener(r, t, a)));
                    }
                    t.delete(this);
                    h.dispose();
                    delete this[s];
                }
            };
        }));
    };
})();

const si = ((t = new WeakSet) => e => function() {
    if (!t.has(this)) {
        t.add(this);
        e.call(this);
    }
})();

const ni = {
    preempt: true
};

class AttributeBinding {
    constructor(t, e, i, s, n, r, l, h, a, c) {
        this.targetAttribute = l;
        this.targetProperty = h;
        this.mode = a;
        this.strict = c;
        this.isBound = false;
        this.s = void 0;
        this.L = null;
        this.v = void 0;
        this.boundFn = false;
        this.M = false;
        this.l = e;
        this.ast = n;
        this.P = t;
        this.target = r;
        this.oL = i;
        this.B = s;
        if ((this.M = h.indexOf(" ") > -1) && !AttributeBinding.q.has(h)) {
            AttributeBinding.q.set(h, h.split(" "));
        }
    }
    updateTarget(t) {
        const i = this.target;
        const s = this.targetAttribute;
        const n = this.targetProperty;
        switch (s) {
          case "class":
            if (this.M) {
                const e = !!t;
                for (const t of AttributeBinding.q.get(n)) {
                    i.classList.toggle(t, e);
                }
            } else {
                i.classList.toggle(n, !!t);
            }
            break;

          case "style":
            {
                let s = "";
                let r = se(t);
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
                    i.setAttribute(s, se(t));
                }
            }
        }
    }
    handleChange() {
        if (!this.isBound) {
            return;
        }
        let t;
        this.obs.version++;
        const e = bt(this.ast, this.s, this, (this.mode & Kt) > 0 ? this : null);
        this.obs.clear();
        if (e !== this.v) {
            this.v = e;
            const i = this.P.state !== gs;
            if (i) {
                t = this.L;
                this.L = this.B.queueTask((() => {
                    this.L = null;
                    this.updateTarget(e);
                }), ni);
                t?.cancel();
            } else {
                this.updateTarget(e);
            }
        }
    }
    handleCollectionChange() {
        this.handleChange();
    }
    bind(t) {
        if (this.isBound) {
            if (this.s === t) {
                return;
            }
            this.unbind();
        }
        this.s = t;
        kt(this.ast, t, this);
        if (this.mode & (Kt | Gt)) {
            this.updateTarget(this.v = bt(this.ast, t, this, (this.mode & Kt) > 0 ? this : null));
        }
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        Ct(this.ast, this.s, this);
        this.s = void 0;
        this.v = void 0;
        this.L?.cancel();
        this.L = null;
        this.obs.clearAll();
    }
}

AttributeBinding.mix = si((() => {
    Je(AttributeBinding);
    ii(AttributeBinding, (() => "updateTarget"));
    Bt(AttributeBinding, null);
    ti(AttributeBinding);
}));

AttributeBinding.q = new Map;

const oi = {
    preempt: true
};

class InterpolationBinding {
    constructor(t, e, i, s, n, r, l, h, a) {
        this.ast = n;
        this.target = r;
        this.targetProperty = l;
        this.mode = h;
        this.strict = a;
        this.isBound = false;
        this.s = void 0;
        this.L = null;
        this.P = t;
        this.oL = i;
        this.B = s;
        this.I = i.getAccessor(r, l);
        const c = n.expressions;
        const u = this.partBindings = Array(c.length);
        const f = c.length;
        let d = 0;
        for (;f > d; ++d) {
            u[d] = new InterpolationPartBinding(c[d], r, l, e, i, a, this);
        }
    }
    _() {
        this.updateTarget();
    }
    updateTarget() {
        const t = this.partBindings;
        const e = this.ast.parts;
        const i = t.length;
        let s = "";
        let n = 0;
        if (i === 1) {
            s = e[0] + t[0].v + e[1];
        } else {
            s = e[0];
            for (;i > n; ++n) {
                s += t[n].v + e[n + 1];
            }
        }
        const r = this.I;
        const l = this.P.state !== gs && (r.type & we) > 0;
        let h;
        if (l) {
            h = this.L;
            this.L = this.B.queueTask((() => {
                this.L = null;
                r.setValue(s, this.target, this.targetProperty);
            }), oi);
            h?.cancel();
            h = null;
        } else {
            r.setValue(s, this.target, this.targetProperty);
        }
    }
    bind(t) {
        if (this.isBound) {
            if (this.s === t) {
                return;
            }
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
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        this.s = void 0;
        const t = this.partBindings;
        const e = t.length;
        let i = 0;
        for (;e > i; ++i) {
            t[i].unbind();
        }
        this.L?.cancel();
        this.L = null;
    }
    useAccessor(t) {
        this.I = t;
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
        this.task = null;
        this.isBound = false;
        this.v = "";
        this.boundFn = false;
        this.l = s;
        this.oL = n;
    }
    updateTarget() {
        this.owner._();
    }
    handleChange() {
        if (!this.isBound) {
            return;
        }
        this.obs.version++;
        const t = bt(this.ast, this.s, this, (this.mode & Kt) > 0 ? this : null);
        this.obs.clear();
        if (t != this.v) {
            this.v = t;
            if (w(t)) {
                this.observeCollection(t);
            }
            this.updateTarget();
        }
    }
    handleCollectionChange() {
        this.updateTarget();
    }
    bind(t) {
        if (this.isBound) {
            if (this.s === t) {
                return;
            }
            this.unbind();
        }
        this.s = t;
        kt(this.ast, t, this);
        this.v = bt(this.ast, this.s, this, (this.mode & Kt) > 0 ? this : null);
        if (w(this.v)) {
            this.observeCollection(this.v);
        }
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        Ct(this.ast, this.s, this);
        this.s = void 0;
        this.obs.clearAll();
    }
}

InterpolationPartBinding.mix = si((() => {
    Je(InterpolationPartBinding);
    ii(InterpolationPartBinding, (() => "updateTarget"));
    Bt(InterpolationPartBinding, null);
    ti(InterpolationPartBinding);
}));

const ri = {
    preempt: true
};

class ContentBinding {
    constructor(t, e, i, s, n, r, l, h) {
        this.p = n;
        this.ast = r;
        this.target = l;
        this.strict = h;
        this.isBound = false;
        this.mode = Kt;
        this.L = null;
        this.v = "";
        this.V = false;
        this.boundFn = false;
        this.l = e;
        this.P = t;
        this.oL = i;
        this.B = s;
    }
    updateTarget(t) {
        const e = this.target;
        const i = this.v;
        this.v = t;
        if (this.V) {
            i.parentNode?.removeChild(i);
            this.V = false;
        }
        if (t instanceof this.p.Node) {
            e.parentNode?.insertBefore(t, e);
            t = "";
            this.V = true;
        }
        e.textContent = se(t ?? "");
    }
    handleChange() {
        if (!this.isBound) {
            return;
        }
        this.obs.version++;
        const t = bt(this.ast, this.s, this, (this.mode & Kt) > 0 ? this : null);
        this.obs.clear();
        if (t === this.v) {
            this.L?.cancel();
            this.L = null;
            return;
        }
        const e = this.P.state !== gs;
        if (e) {
            this.F(t);
        } else {
            this.updateTarget(t);
        }
    }
    handleCollectionChange() {
        if (!this.isBound) {
            return;
        }
        this.obs.version++;
        const t = this.v = bt(this.ast, this.s, this, (this.mode & Kt) > 0 ? this : null);
        this.obs.clear();
        if (w(t)) {
            this.observeCollection(t);
        }
        const e = this.P.state !== gs;
        if (e) {
            this.F(t);
        } else {
            this.updateTarget(t);
        }
    }
    bind(t) {
        if (this.isBound) {
            if (this.s === t) {
                return;
            }
            this.unbind();
        }
        this.s = t;
        kt(this.ast, t, this);
        const e = this.v = bt(this.ast, this.s, this, (this.mode & Kt) > 0 ? this : null);
        if (w(e)) {
            this.observeCollection(e);
        }
        this.updateTarget(e);
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        Ct(this.ast, this.s, this);
        if (this.V) {
            this.v.parentNode?.removeChild(this.v);
        }
        this.s = void 0;
        this.obs.clearAll();
        this.L?.cancel();
        this.L = null;
    }
    F(t) {
        const e = this.L;
        this.L = this.B.queueTask((() => {
            this.L = null;
            this.updateTarget(t);
        }), ri);
        e?.cancel();
    }
}

ContentBinding.mix = si((() => {
    Je(ContentBinding);
    ii(ContentBinding, (() => "updateTarget"));
    Bt(ContentBinding, null);
    ti(ContentBinding);
}));

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
        this.H = n;
    }
    updateTarget() {
        this.target[this.targetProperty] = this.v;
    }
    handleChange() {
        if (!this.isBound) {
            return;
        }
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
            if (this.s === t) {
                return;
            }
            this.unbind();
        }
        this.s = t;
        this.target = this.H ? t.bindingContext : t.overrideContext;
        kt(this.ast, t, this);
        this.v = bt(this.ast, this.s, this, this);
        this.updateTarget();
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        Ct(this.ast, this.s, this);
        this.s = void 0;
        this.obs.clearAll();
    }
}

LetBinding.mix = si((() => {
    Je(LetBinding);
    ii(LetBinding, (() => "updateTarget"));
    Bt(LetBinding, null);
    ti(LetBinding);
}));

class PropertyBinding {
    constructor(t, e, i, s, n, r, l, h, a) {
        this.ast = n;
        this.target = r;
        this.targetProperty = l;
        this.mode = h;
        this.strict = a;
        this.isBound = false;
        this.s = void 0;
        this.I = void 0;
        this.L = null;
        this.O = null;
        this.boundFn = false;
        this.l = e;
        this.P = t;
        this.B = s;
        this.oL = i;
    }
    updateTarget(t) {
        this.I.setValue(t, this.target, this.targetProperty);
    }
    updateSource(t) {
        St(this.ast, this.s, this, null, t);
    }
    handleChange() {
        if (!this.isBound) {
            return;
        }
        this.obs.version++;
        const t = bt(this.ast, this.s, this, (this.mode & Kt) > 0 ? this : null);
        this.obs.clear();
        const e = this.P.state !== gs && (this.I.type & we) > 0;
        if (e) {
            li = this.L;
            this.L = this.B.queueTask((() => {
                this.updateTarget(t);
                this.L = null;
            }), hi);
            li?.cancel();
            li = null;
        } else {
            this.updateTarget(t);
        }
    }
    handleCollectionChange() {
        this.handleChange();
    }
    bind(t) {
        if (this.isBound) {
            if (this.s === t) {
                return;
            }
            this.unbind();
        }
        this.s = t;
        kt(this.ast, t, this);
        const e = this.oL;
        const i = this.mode;
        let s = this.I;
        if (!s) {
            if (i & Xt) {
                s = e.getObserver(this.target, this.targetProperty);
            } else {
                s = e.getAccessor(this.target, this.targetProperty);
            }
            this.I = s;
        }
        const n = (i & Kt) > 0;
        if (i & (Kt | Gt)) {
            this.updateTarget(bt(this.ast, this.s, this, n ? this : null));
        }
        if (i & Xt) {
            s.subscribe(this.O ??= new BindingTargetSubscriber(this, this.l.get(ei)));
            if (!n) {
                this.updateSource(s.getValue(this.target, this.targetProperty));
            }
        }
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        Ct(this.ast, this.s, this);
        this.s = void 0;
        if (this.O) {
            this.I.unsubscribe(this.O);
            this.O = null;
        }
        this.L?.cancel();
        this.L = null;
        this.obs.clearAll();
    }
    useTargetObserver(t) {
        this.I?.unsubscribe(this);
        (this.I = t).subscribe(this);
    }
    useTargetSubscriber(t) {
        if (this.O != null) {
            throw createMappedError(9995);
        }
        this.O = t;
    }
}

PropertyBinding.mix = si((() => {
    Je(PropertyBinding);
    ii(PropertyBinding, (t => t.mode & Xt ? "updateSource" : "updateTarget"));
    Bt(PropertyBinding, null);
    ti(PropertyBinding);
}));

let li = null;

const hi = {
    preempt: true
};

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
            St(this.ast, this.s, this, this, this.target);
            this.obs.clear();
        } else {
            St(this.ast, this.s, this, null, null);
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
            if (this.s === t) {
                return;
            }
            this.unbind();
        }
        this.s = t;
        kt(this.ast, t, this);
        this.isBound = true;
        this.updateSource();
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        this.obs.clearAll();
        if (bt(this.ast, this.s, this, null) === this.target) {
            this.updateSource();
        }
        Ct(this.ast, this.s, this);
        this.s = void 0;
    }
}

RefBinding.mix = si((() => {
    Bt(RefBinding, null);
    ii(RefBinding, (() => "updateSource"));
    Je(RefBinding);
    ti(RefBinding);
}));

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
        this.$ = null;
        this.l = t;
        this.N = n;
        this.$ = r;
    }
    callSource(t) {
        const e = this.s.overrideContext;
        e.$event = t;
        let i = bt(this.ast, this.s, this, null);
        delete e.$event;
        if (u(i)) {
            i = i(t);
        }
        if (i !== true && this.N.prevent) {
            t.preventDefault();
        }
    }
    handleEvent(t) {
        if (this.self) {
            if (this.target !== t.composedPath()[0]) {
                return;
            }
        }
        if (this.$?.(t) !== false) {
            try {
                this.callSource(t);
            } catch (e) {
                this.N.onError(t, e);
            }
        }
    }
    bind(t) {
        if (this.isBound) {
            if (this.s === t) {
                return;
            }
            this.unbind();
        }
        this.s = t;
        kt(this.ast, t, this);
        this.target.addEventListener(this.targetEvent, this, this.N);
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        Ct(this.ast, this.s, this);
        this.s = void 0;
        this.target.removeEventListener(this.targetEvent, this, this.N);
    }
}

ListenerBinding.mix = si((function() {
    Je(ListenerBinding);
    ii(ListenerBinding, (() => "callSource"));
    ti(ListenerBinding);
}));

const ai = /*@__PURE__*/ Be("IEventModifier");

const ci = /*@__PURE__*/ Be("IKeyMapping", (t => t.instance({
    meta: re([ "ctrl", "alt", "shift", "meta" ]),
    keys: {
        escape: "Escape",
        enter: "Enter",
        space: "Space",
        tab: "tab",
        ...Array.from({
            length: 25
        }).reduce(((t, e, i) => {
            let s = String.fromCharCode(i + 65);
            t[i + 65] = s;
            s = String.fromCharCode(i + 97);
            t[i + 97] = t[s] = s;
            return t;
        }), {})
    }
})));

class ModifiedMouseEventHandler {
    constructor() {
        this.type = [ "click", "mousedown", "mousemove", "mouseup", "dblclick", "contextmenu" ];
        this.W = g(ci);
        this.j = [ "left", "middle", "right" ];
    }
    static register(t) {
        t.register(Se(ai, ModifiedMouseEventHandler));
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
                    if (t.button !== this.j.indexOf(n)) return false;
                    continue;
                }
                if (this.W.meta.includes(n) && t[`${n}Key`] !== true) {
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
        this.W = g(ci);
        this.type = [ "keydown", "keyup" ];
    }
    static register(t) {
        t.register(Se(ai, ModifiedKeyboardEventHandler));
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
                if (this.W.meta.includes(n)) {
                    if (t[`${n}Key`] !== true) {
                        return false;
                    }
                    continue;
                }
                const e = this.W.keys[n];
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
        t.register(Se(ai, ModifiedEventHandler));
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

const ui = /*@__PURE__*/ Be("IEventModifierHandler", (t => t.instance({
    getHandler: () => null
})));

class EventModifier {
    constructor() {
        this.U = g(b(ai)).reduce(((t, e) => {
            const i = w(e.type) ? e.type : [ e.type ];
            i.forEach((i => t[i] = e));
            return t;
        }), {});
    }
    static register(t) {
        t.register(Se(ui, EventModifier));
    }
    getHandler(t, i) {
        return e(i) ? (this.U[t] ?? this.U.$ALL)?.getHandler(i) ?? null : null;
    }
}

const fi = {
    register(t) {
        t.register(EventModifier, ModifiedMouseEventHandler, ModifiedKeyboardEventHandler, ModifiedEventHandler);
    }
};

const di = /*@__PURE__*/ Be("IViewFactory");

class ViewFactory {
    constructor(t, e) {
        this.isCaching = false;
        this.G = null;
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
            this.G = [];
        } else {
            this.G = null;
        }
        this.isCaching = this.K > 0;
    }
    canReturnToCache(t) {
        return this.G != null && this.G.length < this.K;
    }
    tryReturnToCache(t) {
        if (this.canReturnToCache(t)) {
            this.G.push(t);
            return true;
        }
        return false;
    }
    create(t) {
        const e = this.G;
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

const mi = /*@__PURE__*/ (() => {
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

const gi = "default";

const pi = "au-slot";

const vi = /*@__PURE__*/ Be("IAuSlotsInfo");

class AuSlotsInfo {
    constructor(t) {
        this.projectedSlots = t;
    }
}

const xi = /*@__PURE__*/ Be("IAuSlotWatcher");

class AuSlotWatcherBinding {
    constructor(t, e, i, s) {
        this.X = new Set;
        this.Y = v;
        this.isBound = false;
        this.cb = (this.o = t)[e];
        this.slotName = i;
        this.Z = s;
    }
    bind() {
        this.isBound = true;
    }
    unbind() {
        this.isBound = false;
    }
    getValue() {
        return this.Y;
    }
    watch(t) {
        if (!this.X.has(t)) {
            this.X.add(t);
            t.subscribe(this);
        }
    }
    unwatch(t) {
        if (this.X.delete(t)) {
            t.unsubscribe(this);
        }
    }
    handleSlotChange(t, e) {
        if (!this.isBound) {
            return;
        }
        const i = this.Y;
        const s = [];
        const n = this.Z;
        let r;
        let l;
        for (r of this.X) {
            for (l of r === t ? e : r.nodes) {
                if (n === "$all" || isElement(l) && (n === "*" || l.matches(n))) {
                    s[s.length] = l;
                }
            }
        }
        if (s.length !== i.length || s.some(((t, e) => t !== i[e]))) {
            this.Y = s;
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
        this.J = t;
    }
    register(t) {
        Re(Ke, this).register(t);
    }
    hydrating(t, e) {
        const i = this.J;
        const s = new AuSlotWatcherBinding(t, i.callback ?? `${se(i.name)}Changed`, i.slotName ?? "default", i.query ?? "*");
        ue(t, i.name, {
            enumerable: true,
            configurable: true,
            get: le((() => s.getValue()), {
                getObserver: () => s
            }),
            set: () => {}
        });
        Re(xi, s).register(e.container);
        e.addBinding(s);
    }
}

function slotted(t, e) {
    if (!yi) {
        yi = true;
        At(AuSlotWatcherBinding, null);
        lifecycleHooks()(SlottedLifecycleHooks, null);
    }
    const i = ee("dependencies");
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

let yi = false;

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
            const f = n.compileSpread(s.controller.definition, s.instruction?.captures ?? v, s.controller.container, e, i);
            let d;
            for (d of f) {
                switch (d.type) {
                  case U.spreadTransferedBinding:
                    renderSpreadInstruction(t + 1);
                    break;

                  case U.spreadElementProp:
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
        this.tt = [];
        this.locator = (this.$controller = (this.et = t).controller).container;
    }
    get(t) {
        return this.locator.get(t);
    }
    bind(t) {
        if (this.isBound) {
            return;
        }
        this.isBound = true;
        const e = this.scope = this.et.controller.scope.parent ?? void 0;
        if (e == null) {
            throw createMappedError(9999);
        }
        this.tt.forEach((t => t.bind(e)));
    }
    unbind() {
        this.tt.forEach((t => t.unbind()));
        this.isBound = false;
    }
    addBinding(t) {
        this.tt.push(t);
    }
    addChild(t) {
        if (t.vmKind !== fs) {
            throw createMappedError(9998);
        }
        this.$controller.addChild(t);
    }
}

class SpreadValueBinding {
    constructor(t, e, i, s, n, r, l, h) {
        this.target = e;
        this.targetKeys = i;
        this.ast = s;
        this.strict = h;
        this.isBound = false;
        this.s = void 0;
        this.boundFn = false;
        this.it = {};
        this.st = new WeakMap;
        this.P = t;
        this.oL = n;
        this.l = r;
        this.B = l;
    }
    updateTarget() {
        this.obs.version++;
        const t = bt(this.ast, this.s, this, this);
        this.obs.clear();
        this.nt(t, true);
    }
    handleChange() {
        if (!this.isBound) {
            return;
        }
        this.updateTarget();
    }
    handleCollectionChange() {
        if (!this.isBound) {
            return;
        }
        this.updateTarget();
    }
    bind(t) {
        if (this.isBound) {
            if (t === this.s) {
                return;
            }
            this.unbind();
        }
        this.isBound = true;
        this.s = t;
        kt(this.ast, t, this);
        const e = bt(this.ast, t, this, this);
        this.nt(e, false);
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        Ct(this.ast, this.s, this);
        this.s = void 0;
        let t;
        for (t in this.it) {
            this.it[t].unbind();
        }
    }
    nt(t, e) {
        let i;
        if (!k(t)) {
            for (i in this.it) {
                this.it[i]?.unbind();
            }
            return;
        }
        let s;
        let n = this.st.get(t);
        if (n == null) {
            this.st.set(t, n = Rt.fromParent(this.s, t));
        }
        for (i of this.targetKeys) {
            s = this.it[i];
            if (i in t) {
                if (s == null) {
                    s = this.it[i] = new PropertyBinding(this.P, this.l, this.oL, this.B, SpreadValueBinding.ot[i] ??= new Nt(i, 0), this.target, i, z.toView, this.strict);
                }
                s.bind(n);
            } else if (e) {
                s?.unbind();
            }
        }
    }
}

SpreadValueBinding.mix = si((() => {
    Je(SpreadValueBinding);
    ii(SpreadValueBinding, (() => "updateTarget"));
    Bt(SpreadValueBinding, null);
    ti(SpreadValueBinding);
}));

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
    defineHiddenProp(i, "subscribe", (function(t) {
        if (this.subs.add(t) && this.subs.count === 1) {
            for (e of this.cf.events) {
                addListener(this.rt, e, this);
            }
            this.lt = true;
            this.ht?.();
        }
    }));
    defineHiddenProp(i, "unsubscribe", (function(t) {
        if (this.subs.remove(t) && this.subs.count === 0) {
            for (e of this.cf.events) {
                removeListener(this.rt, e, this);
            }
            this.lt = false;
            this.ct?.();
        }
    }));
    defineHiddenProp(i, "useConfig", (function(t) {
        this.cf = t;
        if (this.lt) {
            for (e of this.cf.events) {
                removeListener(this.rt, e, this);
            }
            for (e of this.cf.events) {
                addListener(this.rt, e, this);
            }
        }
    }));
};

const mixinNoopSubscribable = t => {
    defineHiddenProp(t.prototype, "subscribe", r);
    defineHiddenProp(t.prototype, "unsubscribe", r);
};

class ClassAttributeAccessor {
    get doNotCache() {
        return true;
    }
    constructor(t, e = {}) {
        this.obj = t;
        this.mapping = e;
        this.type = ye | we;
        this.v = "";
        this.ut = {};
        this.ft = 0;
    }
    getValue() {
        return this.v;
    }
    setValue(t) {
        if (t !== this.v) {
            this.v = t;
            this.dt();
        }
    }
    dt() {
        const t = this.ut;
        const e = ++this.ft;
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
                t[l] = this.ft;
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
        return v;
    }
    if (w(t)) {
        const e = t.length;
        if (e > 0) {
            const i = [];
            let s = 0;
            for (;e > s; ++s) {
                i.push(...getClassesToAdd(t[s]));
            }
            return i;
        } else {
            return v;
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
        return v;
    }
    return e;
}

const fromHydrationContext = t => ({
    $isResolver: true,
    resolve(e, i) {
        return i.get(Cs).controller.container.get(C(t));
    }
});

const wi = /*@__PURE__*/ Be("IRenderer");

function renderer(t, e) {
    const i = e?.metadata ?? (t[Symbol.metadata] ??= Object.create(null));
    i[y] = {
        register(e) {
            Se(wi, t).register(e);
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

const bi = /*@__PURE__*/ renderer(class SetPropertyRenderer {
    constructor() {
        this.target = U.setProperty;
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

const ki = /*@__PURE__*/ renderer(class CustomElementRenderer {
    constructor() {
        this.r = g(Gi);
        this.target = U.hydrateElement;
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
            l = $s.find(f, c);
            if (l == null) {
                throw createMappedError(752, i, t);
            }
            break;

          default:
            l = c;
        }
        const d = i.containerless || l.containerless;
        const m = d ? convertToRenderLocation(e) : null;
        const g = createElementContainer(s, t, e, i, m, u == null ? void 0 : new AuSlotsInfo(ae(u)));
        h = g.invoke(l.Type);
        a = Controller.$el(g, h, e, i, l, m);
        const p = this.r.renderers;
        const v = i.props;
        const x = v.length;
        let y = 0;
        let w;
        while (x > y) {
            w = v[y];
            p[w.type].render(t, a, w, s, n, r);
            ++y;
        }
        t.addChild(a);
    }
}, null);

const Ci = /*@__PURE__*/ renderer(class CustomAttributeRenderer {
    constructor() {
        this.r = g(Gi);
        this.target = U.hydrateAttribute;
    }
    render(t, e, i, s, n, r) {
        let l = t.container;
        let h;
        switch (typeof i.res) {
          case "string":
            h = Ge.find(l, i.res);
            if (h == null) {
                throw createMappedError(753, i, t);
            }
            break;

          default:
            h = i.res;
        }
        const a = invokeAttribute(s, h, t, e, i, void 0, void 0);
        const c = Controller.$attr(a.ctn, a.vm, e, h);
        Ne.set(e, h.key, c);
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

const Bi = /*@__PURE__*/ renderer(class TemplateControllerRenderer {
    constructor() {
        this.r = g(Gi);
        this.target = U.hydrateTemplateController;
    }
    render(t, e, i, s, n, r) {
        let l = t.container;
        let h;
        switch (typeof i.res) {
          case "string":
            h = Ge.find(l, i.res);
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
        Ne.set(c, h.key, f);
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

const Si = /*@__PURE__*/ renderer(class LetElementRenderer {
    constructor() {
        this.target = U.hydrateLetElement;
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
            f = ensureExpression(n, u.from, ge);
            t.addBinding(new LetBinding(a, r, f, u.to, h, t.strict ?? false));
            ++d;
        }
    }
}, null);

const Ai = /*@__PURE__*/ renderer(class RefBindingRenderer {
    constructor() {
        this.target = U.refBinding;
        RefBinding.mix();
    }
    render(t, e, i, s, n, r) {
        t.addBinding(new RefBinding(t.container, r, ensureExpression(n, i.from, ge), getRefTarget(e, i.to), t.strict ?? false));
    }
}, null);

const Ri = /*@__PURE__*/ renderer(class InterpolationBindingRenderer {
    constructor() {
        this.target = U.interpolation;
        InterpolationPartBinding.mix();
    }
    render(t, e, i, s, n, r) {
        const l = t.container;
        const h = new InterpolationBinding(t, l, r, s.domQueue, ensureExpression(n, i.from, fe), getTarget(e), i.to, Kt, t.strict ?? false);
        if (i.to === "class" && h.target.nodeType > 0) {
            const t = l.get(fromHydrationContext(Ls));
            h.useAccessor(new ClassAttributeAccessor(h.target, t));
        }
        t.addBinding(h);
    }
}, null);

const Ti = /*@__PURE__*/ renderer(class PropertyBindingRenderer {
    constructor() {
        this.target = U.propertyBinding;
        PropertyBinding.mix();
    }
    render(t, e, i, s, n, r) {
        const l = t.container;
        const h = new PropertyBinding(t, l, r, s.domQueue, ensureExpression(n, i.from, ge), getTarget(e), i.to, i.mode, t.strict ?? false);
        if (i.to === "class" && h.target.nodeType > 0) {
            const t = l.get(fromHydrationContext(Ls));
            h.useTargetObserver(new ClassAttributeAccessor(h.target, t));
        }
        t.addBinding(h);
    }
}, null);

const Ei = /*@__PURE__*/ renderer(class IteratorBindingRenderer {
    constructor() {
        this.target = U.iteratorBinding;
        PropertyBinding.mix();
    }
    render(t, e, i, s, n, r) {
        t.addBinding(new PropertyBinding(t, t.container, r, s.domQueue, ensureExpression(n, i.forOf, de), getTarget(e), i.to, Kt, t.strict ?? false));
    }
}, null);

const Li = /*@__PURE__*/ renderer(class TextBindingRenderer {
    constructor() {
        this.target = U.textBinding;
        ContentBinding.mix();
    }
    render(t, e, i, s, n, r) {
        t.addBinding(new ContentBinding(t, t.container, r, s.domQueue, s, ensureExpression(n, i.from, ge), e, t.strict ?? false));
    }
}, null);

const Mi = Be("IListenerBindingOptions", (t => t.singleton(class {
    constructor() {
        this.p = g($e);
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
})));

const Di = /*@__PURE__*/ renderer(class ListenerBindingRenderer {
    constructor() {
        this.target = U.listenerBinding;
        this.gt = g(ui);
        this.vt = g(Mi);
        ListenerBinding.mix();
    }
    render(t, e, i, s, n) {
        t.addBinding(new ListenerBinding(t.container, ensureExpression(n, i.from, me), e, i.to, new ListenerBindingOptions(this.vt.prevent, i.capture, this.vt.onError), this.gt.getHandler(i.to, i.modifier), t.strict ?? false));
    }
}, null);

const Pi = /*@__PURE__*/ renderer(class SetAttributeRenderer {
    constructor() {
        this.target = U.setAttribute;
    }
    render(t, e, i) {
        e.setAttribute(i.to, i.value);
    }
}, null);

const qi = /*@__PURE__*/ renderer(class SetClassAttributeRenderer {
    constructor() {
        this.target = U.setClassAttribute;
    }
    render(t, e, i) {
        addClasses(e.classList, i.value);
    }
}, null);

const Ii = /*@__PURE__*/ renderer(class SetStyleAttributeRenderer {
    constructor() {
        this.target = U.setStyleAttribute;
    }
    render(t, e, i) {
        e.style.cssText += i.value;
    }
}, null);

const _i = /*@__PURE__*/ renderer(class StylePropertyBindingRenderer {
    constructor() {
        this.target = U.stylePropertyBinding;
        PropertyBinding.mix();
    }
    render(t, e, i, s, n, r) {
        t.addBinding(new PropertyBinding(t, t.container, r, s.domQueue, ensureExpression(n, i.from, ge), e.style, i.to, Kt, t.strict ?? false));
    }
}, null);

const Vi = /*@__PURE__*/ renderer(class AttributeBindingRenderer {
    constructor() {
        this.target = U.attributeBinding;
        AttributeBinding.mix();
    }
    render(t, e, i, s, n, r) {
        const l = t.container;
        const h = l.has(Ls, false) ? l.get(Ls) : null;
        t.addBinding(new AttributeBinding(t, l, r, s.domQueue, ensureExpression(n, i.from, ge), e, i.attr, h == null ? i.to : i.to.split(/\s/g).map((t => h[t] ?? t)).join(" "), Kt, t.strict ?? false));
    }
}, null);

const Fi = /*@__PURE__*/ renderer(class SpreadRenderer {
    constructor() {
        this.xt = g(G);
        this.r = g(Gi);
        this.target = U.spreadTransferedBinding;
    }
    render(t, e, i, s, n, r) {
        SpreadBinding.create(t.container.get(Cs), e, void 0, this.r, this.xt, s, n, r).forEach((e => t.addBinding(e)));
    }
}, null);

const Hi = /*@__PURE__*/ renderer(class SpreadValueRenderer {
    constructor() {
        this.target = U.spreadValueBinding;
        SpreadValueBinding.mix();
    }
    render(t, e, i, s, n, r) {
        const l = i.target;
        if (l === "$bindables") {
            t.addBinding(new SpreadValueBinding(t, e.viewModel, ae(e.definition.bindables), n.parse(i.from, ge), r, t.container, s.domQueue, t.strict ?? false));
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

const Oi = "IController";

const $i = "IInstruction";

const Ni = "IRenderLocation";

const Wi = "ISlotsInfo";

function createElementContainer(t, e, i, s, n, r) {
    const l = e.container.createChild();
    registerHostNode(l, i, t);
    registerResolver(l, ks, new B(Oi, e));
    registerResolver(l, K, new B($i, s));
    registerResolver(l, Es, n == null ? ji : new RenderLocationProvider(n));
    registerResolver(l, di, zi);
    registerResolver(l, vi, r == null ? Ui : new B(Wi, r));
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
    registerResolver(c, ks, new B(Oi, a));
    registerResolver(c, K, new B($i, n));
    registerResolver(c, Es, l == null ? ji : new B(Ni, l));
    registerResolver(c, di, r == null ? zi : new ViewFactoryProvider(r));
    registerResolver(c, vi, Ui);
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

const ji = new RenderLocationProvider(null);

const zi = new ViewFactoryProvider(null);

const Ui = new B(Wi, new AuSlotsInfo(v));

const Gi = /*@__PURE__*/ Be("IRendering", (t => t.singleton(Rendering)));

class Rendering {
    get renderers() {
        return this.yt ??= this.wt.getAll(wi, false).reduce(((t, e) => {
            t[e.target] ??= e;
            return t;
        }), i());
    }
    constructor() {
        this.bt = new WeakMap;
        this.kt = new WeakMap;
        const t = this.wt = g(S).root;
        const e = this.p = t.get($e);
        this.ep = t.get(Wt);
        this.oL = t.get(Tt);
        this.Ct = e.document.createElement("au-m");
        this.Bt = new FragmentNodeSequence(e, e.document.createDocumentFragment());
    }
    compile(t, e) {
        const i = e.get(G);
        const s = this.bt;
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
            return new FragmentNodeSequence(this.p, this.St(t.template));
        }
        let i;
        let s = false;
        const n = this.kt;
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
            this.St(i);
            n.set(t, i);
        }
        return i == null ? this.Bt : new FragmentNodeSequence(this.p, s ? l.importNode(i, true) : l.adoptNode(i.cloneNode(true)));
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
    St(t) {
        if (t == null) {
            return null;
        }
        const e = this.p.document.createTreeWalker(t, 128);
        let i;
        while ((i = e.nextNode()) != null) {
            if (i.nodeValue === "au*") {
                i.parentNode.replaceChild(e.currentNode = this.Ct.cloneNode(), i);
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
        let e = t.get(C(Ls));
        if (e == null) {
            t.register(Re(Ls, e = i()));
        }
        {
            le(e, ...this.modules);
        }
        class CompilingHook {
            compiling(t) {
                const i = t.tagName === "TEMPLATE";
                const s = i ? t.content : t;
                const n = [ t, ...A(s.querySelectorAll("[class]")) ];
                for (const t of n) {
                    const i = t.getAttributeNode("class");
                    if (i == null) {
                        continue;
                    }
                    const s = i.value.split(/\s+/g).map((t => e[t] || t)).join(" ");
                    i.value = s;
                }
            }
        }
        t.register(X.define(CompilingHook));
    }
}

function shadowCSS(...t) {
    return new ShadowDOMRegistry(t);
}

const Ki = /*@__PURE__*/ Be("IShadowDOMStyleFactory", (t => t.cachedCallback((t => {
    if (AdoptedStyleSheetsStyles.supported(t.get($e))) {
        return t.get(AdoptedStyleSheetsStylesFactory);
    }
    return t.get(StyleElementStylesFactory);
}))));

class ShadowDOMRegistry {
    constructor(t) {
        this.css = t;
    }
    register(t) {
        const e = t.get(Qi);
        const i = t.get(Ki);
        t.register(Re(Xi, i.createStyles(this.css, e)));
    }
}

class AdoptedStyleSheetsStylesFactory {
    constructor() {
        this.p = g($e);
        this.cache = new Map;
    }
    createStyles(t, e) {
        return new AdoptedStyleSheetsStyles(this.p, t, this.cache, e);
    }
}

class StyleElementStylesFactory {
    constructor() {
        this.p = g($e);
    }
    createStyles(t, e) {
        return new StyleElementStyles(this.p, t, e);
    }
}

const Xi = /*@__PURE__*/ Be("IShadowDOMStyles");

const Qi = /*@__PURE__*/ Be("IShadowDOMGlobalStyles", (t => t.instance({
    applyTo: r
})));

class AdoptedStyleSheetsStyles {
    constructor(t, e, i, s = null) {
        this.sharedStyles = s;
        this.styleSheets = e.map((e => {
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
        }));
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

const Yi = {
    shadowDOM(t) {
        return Oe.creating(S, (e => {
            if (t.sharedStyles != null) {
                const i = e.get(Ki);
                e.register(Re(Qi, i.createStyles(t.sharedStyles, null)));
            }
        }));
    }
};

const {enter: Zi, exit: Ji} = Et;

const {wrap: ts, unwrap: es} = Lt;

class ComputedWatcher {
    get value() {
        return this.v;
    }
    constructor(t, e, i, s, n) {
        this.obj = t;
        this.$get = i;
        this.useProxy = n;
        this.isBound = false;
        this.running = false;
        this.v = void 0;
        this.cb = s;
        this.oL = e;
    }
    handleChange() {
        this.run();
    }
    handleCollectionChange() {
        this.run();
    }
    bind() {
        if (this.isBound) {
            return;
        }
        this.compute();
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        this.obs.clearAll();
    }
    run() {
        if (!this.isBound || this.running) {
            return;
        }
        const t = this.obj;
        const e = this.v;
        const i = this.compute();
        if (!R(i, e)) {
            this.cb.call(t, i, e, t);
        }
    }
    compute() {
        this.running = true;
        this.obs.version++;
        try {
            Zi(this);
            return this.v = es(this.$get.call(void 0, this.useProxy ? ts(this.obj) : this.obj, this));
        } finally {
            this.obs.clear();
            this.running = false;
            Ji(this);
        }
    }
}

(() => {
    Bt(ComputedWatcher, null);
})();

class ExpressionWatcher {
    get value() {
        return this.v;
    }
    constructor(t, e, i, s, n) {
        this.scope = t;
        this.l = e;
        this.oL = i;
        this.isBound = false;
        this.boundFn = false;
        this.obj = t.bindingContext;
        this.At = s;
        this.cb = n;
    }
    handleChange(t) {
        const e = this.At;
        const i = this.obj;
        const s = this.v;
        const n = e.$kind === "AccessScope" && this.obs.count === 1;
        if (!n) {
            this.obs.version++;
            t = bt(e, this.scope, this, this);
            this.obs.clear();
        }
        if (!R(t, s)) {
            this.v = t;
            this.cb.call(i, t, s, i);
        }
    }
    bind() {
        if (this.isBound) {
            return;
        }
        this.obs.version++;
        this.v = bt(this.At, this.scope, this, this);
        this.obs.clear();
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        this.obs.clearAll();
        this.v = void 0;
    }
}

(() => {
    Bt(ExpressionWatcher, null);
    ti(ExpressionWatcher);
})();

class Controller {
    get lifecycleHooks() {
        return this.Rt;
    }
    get isActive() {
        return (this.state & (gs | ps)) > 0 && (this.state & vs) === 0;
    }
    get name() {
        if (this.parent === null) {
            switch (this.vmKind) {
              case fs:
                return `[${this.definition.name}]`;

              case us:
                return this.definition.name;

              case ds:
                return this.viewFactory.name;
            }
        }
        switch (this.vmKind) {
          case fs:
            return `${this.parent.name}>[${this.definition.name}]`;

          case us:
            return `${this.parent.name}>${this.definition.name}`;

          case ds:
            return this.viewFactory.name === this.parent.definition?.name ? `${this.parent.name}[view]` : `${this.parent.name}[view:${this.viewFactory.name}]`;
        }
    }
    get viewModel() {
        return this.Tt;
    }
    set viewModel(t) {
        this.Tt = t;
        this.Et = t == null || this.vmKind === ds ? HooksDefinition.none : new HooksDefinition(t);
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
        this.Lt = false;
        this.mountTarget = ss;
        this.shadowRoot = null;
        this.nodes = null;
        this.location = null;
        this.Rt = null;
        this.state = ms;
        this.Mt = false;
        this.$initiator = null;
        this.$resolve = void 0;
        this.$reject = void 0;
        this.$promise = void 0;
        this.Dt = 0;
        this.Pt = 0;
        this.qt = 0;
        this.Tt = n;
        this.Et = e === ds ? HooksDefinition.none : new HooksDefinition(n);
        this.location = l;
        this.r = t.root.get(Gi);
    }
    static getCached(t) {
        return is.get(t);
    }
    static getCachedOrThrow(t) {
        const e = Controller.getCached(t);
        if (e === void 0) {
            throw createMappedError(500, t);
        }
        return e;
    }
    static $el(t, e, i, s, n = void 0, r = null) {
        if (is.has(e)) {
            return is.get(e);
        }
        {
            n = n ?? getElementDefinition(e.constructor);
        }
        registerResolver(t, n.Type, new B(n.key, e, n.Type));
        const l = new Controller(t, us, n, null, e, i, r);
        const h = t.get(E(Cs));
        if (n.dependencies.length > 0) {
            t.register(...n.dependencies);
        }
        registerResolver(t, Cs, new B("IHydrationContext", new HydrationContext(l, s, h)));
        is.set(e, l);
        if (s == null || s.hydrate !== false) {
            l.hE(s);
        }
        return l;
    }
    static $attr(t, e, i, s) {
        if (is.has(e)) {
            return is.get(e);
        }
        s = s ?? getAttributeDefinition(e.constructor);
        registerResolver(t, s.Type, new B(s.key, e, s.Type));
        const n = new Controller(t, fs, s, null, e, i, null);
        if (s.dependencies.length > 0) {
            t.register(...s.dependencies);
        }
        is.set(e, n);
        n.It();
        return n;
    }
    static $view(t, e = void 0) {
        const i = new Controller(t.container, ds, null, t, null, null, null);
        i.parent = e ?? null;
        i._t();
        return i;
    }
    hE(t) {
        const e = this.container;
        const i = this.Tt;
        const s = this.definition;
        this.scope = Rt.create(i, null, true);
        if (s.watches.length > 0) {
            createWatchers(this, e, s, i);
        }
        createObservers(this, s, i);
        this.Rt = Xe.resolve(e);
        e.register(s.Type);
        if (s.injectable !== null) {
            registerResolver(e, s.injectable, new B("definition.injectable", i));
        }
        if (t == null || t.hydrate !== false) {
            this.hS();
            this.hC();
        }
    }
    hS() {
        if (this.Rt.hydrating != null) {
            this.Rt.hydrating.forEach(callHydratingHook, this);
        }
        if (this.Et.Vt) {
            this.Tt.hydrating(this);
        }
        const t = this.definition;
        const e = this.Ft = this.r.compile(t, this.container);
        const i = e.shadowOptions;
        const s = e.hasSlots;
        const n = e.containerless;
        const r = this.host;
        let l = this.location;
        if (n && l == null) {
            l = this.location = convertToRenderLocation(r);
        }
        Rs(r, Fs, this);
        Rs(r, t.key, this);
        if (i !== null || s) {
            if (l != null) {
                throw createMappedError(501);
            }
            Rs(this.shadowRoot = r.attachShadow(i ?? cs), Fs, this);
            Rs(this.shadowRoot, t.key, this);
            this.mountTarget = os;
        } else if (l != null) {
            if (r !== l) {
                Rs(l, Fs, this);
                Rs(l, t.key, this);
            }
            this.mountTarget = rs;
        } else {
            this.mountTarget = ns;
        }
        this.Tt.$controller = this;
        this.nodes = this.r.createNodes(e);
        if (this.Rt.hydrated !== void 0) {
            this.Rt.hydrated.forEach(callHydratedHook, this);
        }
        if (this.Et.Ht) {
            this.Tt.hydrated(this);
        }
    }
    hC() {
        this.r.render(this, this.nodes.findTargets(), this.Ft, this.host);
        if (this.Rt.created !== void 0) {
            this.Rt.created.forEach(callCreatedHook, this);
        }
        if (this.Et.Ot) {
            this.Tt.created(this);
        }
    }
    It() {
        const t = this.definition;
        const e = this.Tt;
        if (t.watches.length > 0) {
            createWatchers(this, this.container, t, e);
        }
        createObservers(this, t, e);
        e.$controller = this;
        this.Rt = Xe.resolve(this.container);
        if (this.Rt.created !== void 0) {
            this.Rt.created.forEach(callCreatedHook, this);
        }
        if (this.Et.Ot) {
            this.Tt.created(this);
        }
    }
    _t() {
        this.Ft = this.r.compile(this.viewFactory.def, this.container);
        this.r.render(this, (this.nodes = this.r.createNodes(this.Ft)).findTargets(), this.Ft, void 0);
    }
    activate(t, e, i) {
        switch (this.state) {
          case ms:
          case xs:
            if (!(e === null || e.isActive)) {
                return;
            }
            this.state = gs;
            break;

          case ps:
            return;

          case ws:
            throw createMappedError(502, this.name);

          default:
            throw createMappedError(503, this.name, stringifyState(this.state));
        }
        this.parent = e;
        switch (this.vmKind) {
          case us:
            this.scope.parent = i ?? null;
            break;

          case fs:
            this.scope = i ?? null;
            break;

          case ds:
            if (i === void 0 || i === null) {
                throw createMappedError(504, this.name);
            }
            if (!this.hasLockedScope) {
                this.scope = i;
            }
            break;
        }
        this.$initiator = t;
        this.$t();
        let s = void 0;
        if (this.vmKind !== ds && this.Rt.binding != null) {
            s = L(...this.Rt.binding.map(callBindingHook, this));
        }
        if (this.Et.Nt) {
            s = L(s, this.Tt.binding(this.$initiator, this.parent));
        }
        if (M(s)) {
            this.Wt();
            s.then((() => {
                this.Lt = true;
                if (this.state !== gs) {
                    this.jt();
                } else {
                    this.bind();
                }
            })).catch((t => {
                this.zt(t);
            }));
            return this.$promise;
        }
        this.Lt = true;
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
        if (this.vmKind !== ds && this.Rt.bound != null) {
            i = L(...this.Rt.bound.map(callBoundHook, this));
        }
        if (this.Et.Ut) {
            i = L(i, this.Tt.bound(this.$initiator, this.parent));
        }
        if (M(i)) {
            this.Wt();
            i.then((() => {
                this.isBound = true;
                if (this.state !== gs) {
                    this.jt();
                } else {
                    this.Gt();
                }
            })).catch((t => {
                this.zt(t);
            }));
            return;
        }
        this.isBound = true;
        this.Gt();
    }
    Kt(...t) {
        switch (this.mountTarget) {
          case ns:
            this.host.append(...t);
            break;

          case os:
            this.shadowRoot.append(...t);
            break;

          case rs:
            {
                let e = 0;
                for (;e < t.length; ++e) {
                    this.location.parentNode.insertBefore(t[e], this.location);
                }
                break;
            }
        }
    }
    Gt() {
        switch (this.mountTarget) {
          case ns:
            this.nodes.appendTo(this.host, this.definition != null && this.definition.enhance);
            break;

          case os:
            {
                const t = this.container;
                const e = t.has(Xi, false) ? t.get(Xi) : t.get(Qi);
                e.applyTo(this.shadowRoot);
                this.nodes.appendTo(this.shadowRoot);
                break;
            }

          case rs:
            this.nodes.insertBefore(this.location);
            break;
        }
        let t = 0;
        let e = void 0;
        if (this.vmKind !== ds && this.Rt.attaching != null) {
            e = L(...this.Rt.attaching.map(callAttachingHook, this));
        }
        if (this.Et.Xt) {
            e = L(e, this.Tt.attaching(this.$initiator, this.parent));
        }
        if (M(e)) {
            this.Wt();
            this.$t();
            e.then((() => {
                this.jt();
            })).catch((t => {
                this.zt(t);
            }));
        }
        if (this.children !== null) {
            for (;t < this.children.length; ++t) {
                void this.children[t].activate(this.$initiator, this, this.scope);
            }
        }
        this.jt();
    }
    deactivate(t, e) {
        let i = void 0;
        switch (this.state & ~ys) {
          case ps:
            this.state = vs;
            break;

          case gs:
            this.state = vs;
            i = this.$promise?.catch(r);
            break;

          case ms:
          case xs:
          case ws:
          case xs | ws:
            return;

          default:
            throw createMappedError(505, this.name, this.state);
        }
        this.$initiator = t;
        if (t === this) {
            this.Qt();
        }
        let s = 0;
        let n;
        if (this.children !== null) {
            for (s = 0; s < this.children.length; ++s) {
                void this.children[s].deactivate(t, this);
            }
        }
        return D(i, (() => {
            if (this.isBound) {
                if (this.vmKind !== ds && this.Rt.detaching != null) {
                    n = L(...this.Rt.detaching.map(callDetachingHook, this));
                }
                if (this.Et.Yt) {
                    n = L(n, this.Tt.detaching(this.$initiator, this.parent));
                }
            }
            if (M(n)) {
                this.Wt();
                t.Qt();
                n.then((() => {
                    t.Zt();
                })).catch((e => {
                    t.zt(e);
                }));
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
            this.Zt();
            return this.$promise;
        }));
    }
    removeNodes() {
        switch (this.vmKind) {
          case us:
          case ds:
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
          case fs:
            this.scope = null;
            break;

          case ds:
            if (!this.hasLockedScope) {
                this.scope = null;
            }
            if ((this.state & ys) === ys && !this.viewFactory.tryReturnToCache(this) && this.$initiator === this) {
                this.dispose();
            }
            break;

          case us:
            this.scope.parent = null;
            break;
        }
        this.state = xs;
        this.$initiator = null;
        this.Jt();
    }
    Wt() {
        if (this.$promise === void 0) {
            this.$promise = new Promise(((t, e) => {
                this.$resolve = t;
                this.$reject = e;
            }));
            if (this.$initiator !== this) {
                this.parent.Wt();
            }
        }
    }
    Jt() {
        if (this.$promise !== void 0) {
            Bs = this.$resolve;
            this.$resolve = this.$reject = this.$promise = void 0;
            Bs();
            Bs = void 0;
        }
    }
    zt(t) {
        if (this.$promise !== void 0) {
            Ss = this.$reject;
            this.$resolve = this.$reject = this.$promise = void 0;
            Ss(t);
            Ss = void 0;
        }
        if (this.$initiator !== this) {
            this.parent.zt(t);
        }
    }
    $t() {
        ++this.Dt;
        if (this.$initiator !== this) {
            this.parent.$t();
        }
    }
    jt() {
        if (this.state !== gs) {
            --this.Dt;
            this.Jt();
            if (this.$initiator !== this) {
                this.parent.jt();
            }
            return;
        }
        if (--this.Dt === 0) {
            if (this.vmKind !== ds && this.Rt.attached != null) {
                As = L(...this.Rt.attached.map(callAttachedHook, this));
            }
            if (this.Et.te) {
                As = L(As, this.Tt.attached(this.$initiator));
            }
            if (M(As)) {
                this.Wt();
                As.then((() => {
                    this.state = ps;
                    this.Jt();
                    if (this.$initiator !== this) {
                        this.parent.jt();
                    }
                })).catch((t => {
                    this.zt(t);
                }));
                As = void 0;
                return;
            }
            As = void 0;
            this.state = ps;
            this.Jt();
        }
        if (this.$initiator !== this) {
            this.parent.jt();
        }
    }
    Qt() {
        ++this.Pt;
    }
    Zt() {
        if (--this.Pt === 0) {
            this.ee();
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
                if (t.Lt) {
                    if (t.vmKind !== ds && t.Rt.unbinding != null) {
                        e = L(...t.Rt.unbinding.map(callUnbindingHook, t));
                    }
                    if (t.Et.ie) {
                        if (t.debug) {
                            t.logger.trace("unbinding()");
                        }
                        e = L(e, t.viewModel.unbinding(t.$initiator, t.parent));
                    }
                }
                if (M(e)) {
                    this.Wt();
                    this.ee();
                    e.then((() => {
                        this.se();
                    })).catch((t => {
                        this.zt(t);
                    }));
                }
                e = void 0;
                t = t.next;
            }
            this.se();
        }
    }
    ee() {
        ++this.qt;
    }
    se() {
        if (--this.qt === 0) {
            let t = this.$initiator.head;
            let e = null;
            while (t !== null) {
                if (t !== this) {
                    t.Lt = false;
                    t.isBound = false;
                    t.unbind();
                }
                e = t.next;
                t.next = null;
                t = e;
            }
            this.head = this.tail = null;
            this.Lt = false;
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
          case fs:
          case us:
            {
                return this.definition.name === t;
            }

          case ds:
            return this.viewFactory.name === t;
        }
    }
    lockScope(t) {
        this.scope = t;
        this.hasLockedScope = true;
    }
    setHost(t) {
        if (this.vmKind === us) {
            Rs(t, Fs, this);
            Rs(t, this.definition.key, this);
        }
        this.host = t;
        this.mountTarget = ns;
        return this;
    }
    setShadowRoot(t) {
        if (this.vmKind === us) {
            Rs(t, Fs, this);
            Rs(t, this.definition.key, this);
        }
        this.shadowRoot = t;
        this.mountTarget = os;
        return this;
    }
    setLocation(t) {
        if (this.vmKind === us) {
            Rs(t, Fs, this);
            Rs(t, this.definition.key, this);
        }
        this.location = t;
        this.mountTarget = rs;
        return this;
    }
    release() {
        this.state |= ys;
    }
    dispose() {
        if ((this.state & ws) === ws) {
            return;
        }
        this.state |= ws;
        if (this.Et.ne) {
            this.Tt.dispose();
        }
        if (this.children !== null) {
            this.children.forEach(callDispose);
            this.children = null;
        }
        this.scope = null;
        this.nodes = null;
        this.location = null;
        this.viewFactory = null;
        if (this.Tt !== null) {
            is.delete(this.Tt);
            this.Tt = null;
        }
        this.Tt = null;
        this.host = null;
        this.shadowRoot = null;
        this.container.disposeResolvers();
    }
    accept(t) {
        if (t(this) === true) {
            return true;
        }
        if (this.Et.oe && this.Tt.accept(t) === true) {
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

const is = new WeakMap;

const ss = 0;

const ns = 1;

const os = 2;

const rs = 3;

const ls = re({
    none: ss,
    host: ns,
    shadowRoot: os,
    location: rs
});

const hs = T(Mt);

function createObservers(t, e, i) {
    const s = e.bindables;
    const n = he(s);
    const l = n.length;
    if (l === 0) return;
    const h = t.container.get(Tt);
    const a = "propertiesChanged" in i;
    const c = t.vmKind === ds ? void 0 : t.container.get(hs);
    const u = a ? (() => {
        let e = {};
        let s = void 0;
        let n = 0;
        const r = Promise.resolve();
        const callPropertiesChanged = () => {
            if (s == null) {
                s = r.then((() => {
                    const r = e;
                    e = {};
                    n = 0;
                    s = void 0;
                    if (t.isBound) {
                        i.propertiesChanged?.(r);
                        if (n > 0) {
                            callPropertiesChanged();
                        }
                    }
                }));
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
    })() : r;
    for (let e = 0; e < l; ++e) {
        const l = n[e];
        const f = s[l];
        const d = f.callback;
        const m = h.getObserver(i, l);
        if (f.set !== r) {
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

const as = new Map;

const getAccessScopeAst = t => {
    let e = as.get(t);
    if (e == null) {
        e = new Nt(t, 0);
        as.set(t, e);
    }
    return e;
};

function createWatchers(t, i, s, n) {
    const r = i.get(Tt);
    const l = i.get(Wt);
    const h = s.watches;
    const a = t.vmKind === us ? t.scope : Rt.create(n, null, true);
    const c = h.length;
    let f;
    let d;
    let m;
    let g = 0;
    for (;c > g; ++g) {
        ({expression: f, callback: d} = h[g]);
        d = u(d) ? d : Reflect.get(n, d);
        if (!u(d)) {
            throw createMappedError(506, d);
        }
        if (u(f)) {
            t.addBinding(new ComputedWatcher(n, r, f, d, true));
        } else {
            m = e(f) ? l.parse(f, ge) : getAccessScopeAst(f);
            t.addBinding(new ExpressionWatcher(a, i, r, m, d));
        }
    }
}

function isCustomElementController(t) {
    return t instanceof Controller && t.vmKind === us;
}

function isCustomElementViewModel(t) {
    return isElementType(t?.constructor);
}

class HooksDefinition {
    constructor(t) {
        this.re = "define" in t;
        this.Vt = "hydrating" in t;
        this.Ht = "hydrated" in t;
        this.Ot = "created" in t;
        this.Nt = "binding" in t;
        this.Ut = "bound" in t;
        this.Xt = "attaching" in t;
        this.te = "attached" in t;
        this.Yt = "detaching" in t;
        this.ie = "unbinding" in t;
        this.ne = "dispose" in t;
        this.oe = "accept" in t;
    }
}

HooksDefinition.none = new HooksDefinition({});

const cs = {
    mode: "open"
};

const us = "customElement";

const fs = "customAttribute";

const ds = "synthetic";

const ms = 0;

const gs = 1;

const ps = 2;

const vs = 4;

const xs = 8;

const ys = 16;

const ws = 32;

const bs = /*@__PURE__*/ re({
    none: ms,
    activating: gs,
    activated: ps,
    deactivating: vs,
    deactivated: xs,
    released: ys,
    disposed: ws
});

function stringifyState(t) {
    const e = [];
    if ((t & gs) === gs) {
        e.push("activating");
    }
    if ((t & ps) === ps) {
        e.push("activated");
    }
    if ((t & vs) === vs) {
        e.push("deactivating");
    }
    if ((t & xs) === xs) {
        e.push("deactivated");
    }
    if ((t & ys) === ys) {
        e.push("released");
    }
    if ((t & ws) === ws) {
        e.push("disposed");
    }
    return e.length === 0 ? "none" : e.join("|");
}

const ks = /*@__PURE__*/ Be("IController");

const Cs = /*@__PURE__*/ Be("IHydrationContext");

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
    t.instance.created(this.Tt, this);
}

function callHydratingHook(t) {
    t.instance.hydrating(this.Tt, this);
}

function callHydratedHook(t) {
    t.instance.hydrated(this.Tt, this);
}

function callBindingHook(t) {
    return t.instance.binding(this.Tt, this["$initiator"], this.parent);
}

function callBoundHook(t) {
    return t.instance.bound(this.Tt, this["$initiator"], this.parent);
}

function callAttachingHook(t) {
    return t.instance.attaching(this.Tt, this["$initiator"], this.parent);
}

function callAttachedHook(t) {
    return t.instance.attached(this.Tt, this["$initiator"]);
}

function callDetachingHook(t) {
    return t.instance.detaching(this.Tt, this["$initiator"], this.parent);
}

function callUnbindingHook(t) {
    return t.instance.unbinding(this.Tt, this["$initiator"], this.parent);
}

let Bs;

let Ss;

let As;

const Rs = Ne.set;

const Ts = /*@__PURE__*/ Be("IEventTarget", (t => t.cachedCallback((t => {
    if (t.has(Ws, true)) {
        return t.get(Ws).host;
    }
    return t.get($e).document;
}))));

const Es = /*@__PURE__*/ Be("IRenderLocation");

const Ls = /*@__PURE__*/ Be("ICssClassMapping");

const Ms = new WeakMap;

function getEffectiveParentNode(t) {
    if (Ms.has(t)) {
        return Ms.get(t);
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
        if (e.mountTarget === ls.shadowRoot) {
            return getEffectiveParentNode(e.host);
        }
    }
    return t.parentNode;
}

function setEffectiveParentNode(t, e) {
    if (t.platform !== void 0 && !(t instanceof t.platform.Node)) {
        const i = t.childNodes;
        for (let t = 0, s = i.length; t < s; ++t) {
            Ms.set(i[t], e);
        }
    } else {
        Ms.set(t, e);
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
        return this.le;
    }
    get lastChild() {
        return this.he;
    }
    constructor(t, e) {
        this.platform = t;
        this.next = void 0;
        this.ae = false;
        this.ce = false;
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
        this.le = e.firstChild;
        this.he = e.lastChild;
    }
    findTargets() {
        return this.t;
    }
    insertBefore(t) {
        if (this.ce && !!this.ref) {
            this.addToLinked();
        } else {
            const e = t.parentNode;
            if (this.ae) {
                let i = this.le;
                let s;
                const n = this.he;
                while (i != null) {
                    s = i.nextSibling;
                    e.insertBefore(i, t);
                    if (i === n) {
                        break;
                    }
                    i = s;
                }
            } else {
                this.ae = true;
                t.parentNode.insertBefore(this.f, t);
            }
        }
    }
    appendTo(t, e = false) {
        if (this.ae) {
            let e = this.le;
            let i;
            const s = this.he;
            while (e != null) {
                i = e.nextSibling;
                t.appendChild(e);
                if (e === s) {
                    break;
                }
                e = i;
            }
        } else {
            this.ae = true;
            if (!e) {
                t.appendChild(this.f);
            }
        }
    }
    remove() {
        if (this.ae) {
            this.ae = false;
            const t = this.f;
            const e = this.he;
            let i;
            let s = this.le;
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
        if (this.ae) {
            let i = this.le;
            let s;
            const n = this.he;
            while (i != null) {
                s = i.nextSibling;
                e.insertBefore(i, t);
                if (i === n) {
                    break;
                }
                i = s;
            }
        } else {
            this.ae = true;
            e.insertBefore(this.f, t);
        }
    }
    unlink() {
        this.ce = false;
        this.next = void 0;
        this.ref = void 0;
    }
    link(t) {
        this.ce = true;
        if (isRenderLocation(t)) {
            this.ref = t;
        } else {
            this.next = t;
            this.ue();
        }
    }
    ue() {
        if (this.next !== void 0) {
            this.ref = this.next.firstChild;
        } else {
            this.ref = void 0;
        }
    }
}

const Ds = /*@__PURE__*/ Be("IWindow", (t => t.callback((t => t.get($e).window))));

const Ps = /*@__PURE__*/ Be("ILocation", (t => t.callback((t => t.get(Ds).location))));

const qs = /*@__PURE__*/ Be("IHistory", (t => t.callback((t => t.get(Ds).history))));

const registerHostNode = (t, e, i = t.get($e)) => {
    registerResolver(t, i.HTMLElement, registerResolver(t, i.Element, registerResolver(t, We, new B("ElementResolver", e))));
    return t;
};

function customElement(t) {
    return function(e, i) {
        i.addInitializer((function() {
            defineElement(t, this);
        }));
        return e;
    };
}

function useShadowDOM(t, e) {
    if (t === void 0) {
        return function(t, e) {
            e.addInitializer((function() {
                annotateElementMetadata(this, "shadowOptions", {
                    mode: "open"
                });
            }));
        };
    }
    if (!u(t)) {
        return function(e, i) {
            i.addInitializer((function() {
                annotateElementMetadata(this, "shadowOptions", t);
            }));
        };
    }
    e.addInitializer((function() {
        annotateElementMetadata(this, "shadowOptions", {
            mode: "open"
        });
    }));
}

function containerless(t, e) {
    if (t === void 0) {
        return function(t, e) {
            e.addInitializer((function() {
                markContainerless(t);
            }));
        };
    }
    e.addInitializer((function() {
        markContainerless(t);
    }));
}

function markContainerless(t) {
    const e = Yt(Fs, t);
    if (e === void 0) {
        annotateElementMetadata(t, "containerless", true);
        return;
    }
    e.containerless = true;
}

const Is = new WeakMap;

class CustomElementDefinition {
    get type() {
        return Te;
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
            const n = P("name", s, Hs);
            if (u(s.Type)) {
                i = s.Type;
            } else {
                i = Os(q(n));
            }
            for (const t of Object.values(ke.from(s.bindables))) {
                ke.i(t, i);
            }
            return new CustomElementDefinition(i, n, c(s.aliases), P("key", s, (() => getElementKeyFrom(n))), I("capture", s, i, returnFalse), I("template", s, i, returnNull), c(s.instructions), c(getElementAnnotation(i, "dependencies"), s.dependencies), P("injectable", s, returnNull), P("needsCompile", s, returnTrue), c(s.surrogates), ke.from(getElementAnnotation(i, "bindables"), s.bindables), I("containerless", s, i, returnFalse), P("shadowOptions", s, returnNull), P("hasSlots", s, returnFalse), P("enhance", s, returnFalse), P("watches", s, returnEmptyArray), P("strict", s, returnUndefined), _("processContent", i, returnNull));
        }
        if (e(t)) {
            return new CustomElementDefinition(i, t, c(getElementAnnotation(i, "aliases"), i.aliases), getElementKeyFrom(t), _("capture", i, returnFalse), _("template", i, returnNull), c(getElementAnnotation(i, "instructions"), i.instructions), c(getElementAnnotation(i, "dependencies"), i.dependencies), _("injectable", i, returnNull), _("needsCompile", i, returnTrue), c(getElementAnnotation(i, "surrogates"), i.surrogates), ke.from(...ke.getAll(i), getElementAnnotation(i, "bindables"), i.bindables), _("containerless", i, returnFalse), _("shadowOptions", i, returnNull), _("hasSlots", i, returnFalse), _("enhance", i, returnFalse), c(je.getDefinitions(i), i.watches), _("strict", i, returnUndefined), _("processContent", i, returnNull));
        }
        const s = P("name", t, Hs);
        for (const e of Object.values(ke.from(t.bindables))) {
            ke.i(e, i);
        }
        return new CustomElementDefinition(i, s, c(getElementAnnotation(i, "aliases"), t.aliases, i.aliases), getElementKeyFrom(s), I("capture", t, i, returnFalse), I("template", t, i, returnNull), c(getElementAnnotation(i, "instructions"), t.instructions, i.instructions), c(getElementAnnotation(i, "dependencies"), t.dependencies, i.dependencies), I("injectable", t, i, returnNull), I("needsCompile", t, i, returnTrue), c(getElementAnnotation(i, "surrogates"), t.surrogates, i.surrogates), ke.from(...ke.getAll(i), getElementAnnotation(i, "bindables"), i.bindables, t.bindables), I("containerless", t, i, returnFalse), I("shadowOptions", t, i, returnNull), I("hasSlots", t, i, returnFalse), I("enhance", t, i, returnFalse), c(t.watches, je.getDefinitions(i), i.watches), I("strict", t, i, returnUndefined), I("processContent", t, i, returnNull));
    }
    static getOrCreate(t) {
        if (t instanceof CustomElementDefinition) {
            return t;
        }
        if (Is.has(t)) {
            return Is.get(t);
        }
        const e = CustomElementDefinition.create(t);
        Is.set(t, e);
        Jt(e, e.Type, Fs);
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
        t.register(t.has(i, false) ? null : Se(i, i), Ae(i, s), ...n.map((t => Ae(i, getElementKeyFrom(t)))));
    }
    toString() {
        return `au:ce:${this.name}`;
    }
}

const _s = {
    name: undefined,
    searchParents: false,
    optional: false
};

const returnNull = () => null;

const returnUndefined = () => void 0;

const returnFalse = () => false;

const returnTrue = () => true;

const returnEmptyArray = () => v;

const Vs = "custom-element";

const Fs = /*@__PURE__*/ m(Vs);

const getElementKeyFrom = t => `${Fs}:${t}`;

const Hs = /*@__PURE__*/ (t => () => `unnamed-${++t}`)(0);

const annotateElementMetadata = (t, e, i) => {
    Jt(i, t, ee(e));
};

const defineElement = (t, e) => {
    const i = CustomElementDefinition.create(t, e);
    const s = i.Type;
    Jt(i, s, Fs, f);
    return s;
};

const isElementType = t => u(t) && (Zt(Fs, t) || t.$au?.type === Vs);

const findElementControllerFor = (t, e = _s) => {
    if (e.name === void 0 && e.searchParents !== true) {
        const i = Ne.get(t, Fs);
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
            const i = Ne.get(t, Fs);
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
            const t = Ne.get(i, Fs);
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
        const t = Ne.get(i, Fs);
        if (t !== null) {
            return t;
        }
        i = getEffectiveParentNode(i);
    }
    throw createMappedError(765, t);
};

const getElementAnnotation = (t, e) => Yt(ee(e), t);

const getElementDefinition = t => {
    const e = Yt(Fs, t) ?? getDefinitionFromStaticAu(t, Vs, CustomElementDefinition.create);
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

const Os = /*@__PURE__*/ function() {
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
        ue(n, "name", t);
        if (s !== e) {
            le(n.prototype, s);
        }
        return n;
    };
}();

const $s = /*@__PURE__*/ re({
    name: Fs,
    keyFrom: getElementKeyFrom,
    isType: isElementType,
    for: findElementControllerFor,
    define: defineElement,
    getDefinition: getElementDefinition,
    annotate: annotateElementMetadata,
    getAnnotation: getElementAnnotation,
    generateName: Hs,
    createInjectable: createElementInjectable,
    generateType: Os,
    find(t, e) {
        const i = t.find(Vs, e);
        return i == null ? null : Yt(Fs, i) ?? getDefinitionFromStaticAu(i, Vs, CustomElementDefinition.create) ?? null;
    }
});

const Ns = /*@__PURE__*/ ee("processContent");

function processContent(t) {
    return t === void 0 ? function(t, e) {
        if (!e.static || e.kind !== "method") throw createMappedError(766, t);
        e.addInitializer((function() {
            Jt(t, this, Ns);
        }));
    } : function(i, s) {
        s.addInitializer((function() {
            if (e(t) || V(t)) {
                t = this[t];
            }
            if (!u(t)) throw createMappedError(766, t);
            const i = Yt(Fs, this);
            if (i !== void 0) {
                i.processContent = t;
            } else {
                Jt(t, this, Ns);
            }
        }));
        return i;
    };
}

function capture(t) {
    return function(e, i) {
        const s = u(t) ? t : true;
        i.addInitializer((function() {
            annotateElementMetadata(this, "capture", s);
            if (isElementType(this)) {
                getElementDefinition(this).capture = s;
            }
        }));
    };
}

const Ws = /*@__PURE__*/ Be("IAppRoot");

class AppRoot {
    get controller() {
        return this.P;
    }
    constructor(t, e, i, s = false) {
        this.config = t;
        this.container = e;
        this.fe = void 0;
        this.de = s;
        const n = this.host = t.host;
        i.prepare(this);
        registerResolver(e, Ts, new B("IEventTarget", n));
        registerHostNode(e, n, this.platform = this.me(e, n));
        this.fe = D(this.ge("creating"), (() => {
            if (!t.allowActionlessForm !== false) {
                n.addEventListener("submit", (t => {
                    const e = t.target;
                    const i = !e.getAttribute("action");
                    if (e.tagName === "FORM" && i) {
                        t.preventDefault();
                    }
                }), false);
            }
            const i = s ? e : e.createChild();
            const r = t.component;
            let l;
            if (u(r)) {
                l = i.invoke(r);
                Re(r, l);
            } else {
                l = t.component;
            }
            const h = {
                hydrate: false,
                projections: null
            };
            const a = s ? CustomElementDefinition.create({
                name: Hs(),
                template: this.host,
                enhance: true,
                strict: t.strictBinding
            }) : void 0;
            const c = this.P = Controller.$el(i, l, n, h, a);
            c.hE(h);
            return D(this.ge("hydrating"), (() => {
                c.hS();
                return D(this.ge("hydrated"), (() => {
                    c.hC();
                    this.fe = void 0;
                }));
            }));
        }));
    }
    activate() {
        return D(this.fe, (() => D(this.ge("activating"), (() => D(this.P.activate(this.P, null, void 0), (() => this.ge("activated")))))));
    }
    deactivate() {
        return D(this.ge("deactivating"), (() => D(this.P.deactivate(this.P, null), (() => this.ge("deactivated")))));
    }
    ge(t) {
        const e = this.container;
        const i = this.de && !e.has(He, false) ? [] : e.getAll(He);
        return L(...i.reduce(((e, i) => {
            if (i.slot === t) {
                e.push(i.run());
            }
            return e;
        }), []));
    }
    me(t, e) {
        let i;
        if (!t.has($e, false)) {
            if (e.ownerDocument.defaultView === null) {
                throw createMappedError(769);
            }
            i = new $t(e.ownerDocument.defaultView);
            t.register(Re($e, i));
        } else {
            i = t.get($e);
        }
        return i;
    }
    dispose() {
        this.P?.dispose();
    }
}

const js = /*@__PURE__*/ Be("IAurelia");

class Aurelia {
    get isRunning() {
        return this.ir;
    }
    get isStarting() {
        return this.pe;
    }
    get isStopping() {
        return this.ve;
    }
    get root() {
        if (this.xe == null) {
            if (this.next == null) {
                throw createMappedError(767);
            }
            return this.next;
        }
        return this.xe;
    }
    constructor(t = l.createContainer()) {
        this.container = t;
        this.ir = false;
        this.pe = false;
        this.ve = false;
        this.xe = void 0;
        this.next = void 0;
        this.ye = void 0;
        this.we = void 0;
        if (t.has(js, true) || t.has(Aurelia, true)) {
            throw createMappedError(768);
        }
        registerResolver(t, js, new B("IAurelia", this));
        registerResolver(t, Aurelia, new B("Aurelia", this));
        registerResolver(t, Ws, this.be = new B("IAppRoot"));
    }
    register(...t) {
        this.container.register(...t);
        return this;
    }
    app(t) {
        this.next = new AppRoot(t, this.container, this.be);
        return this;
    }
    enhance(t) {
        const e = t.container ?? this.container.createChild();
        const i = registerResolver(e, Ws, new B("IAppRoot"));
        const s = new AppRoot({
            host: t.host,
            component: t.component
        }, e, i, true);
        return D(s.activate(), (() => s));
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
        if (M(this.ye)) {
            return this.ye;
        }
        return this.ye = D(this.stop(), (() => {
            if (!Ne.hideProp) {
                Reflect.set(t.host, "$aurelia", this);
            }
            this.be.prepare(this.xe = t);
            this.pe = true;
            return D(t.activate(), (() => {
                this.ir = true;
                this.pe = false;
                this.ye = void 0;
                this.ke(t, "au-started", t.host);
            }));
        }));
    }
    stop(t = false) {
        if (M(this.we)) {
            return this.we;
        }
        if (this.ir === true) {
            const e = this.xe;
            this.ir = false;
            this.ve = true;
            return this.we = D(e.deactivate(), (() => {
                Reflect.deleteProperty(e.host, "$aurelia");
                if (t) {
                    e.dispose();
                }
                this.xe = void 0;
                this.be.dispose();
                this.ve = false;
                this.ke(e, "au-stopped", e.host);
            }));
        }
    }
    dispose() {
        if (this.ir || this.ve) {
            throw createMappedError(771);
        }
        this.container.dispose();
    }
    ke(t, e, i) {
        const s = new t.platform.window.CustomEvent(e, {
            detail: this,
            bubbles: true,
            cancelable: true
        });
        i.dispatchEvent(s);
    }
}

const zs = /*@__PURE__*/ Be("ISVGAnalyzer", (t => t.singleton(NoopSVGAnalyzer)));

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
        t.register(Se(this, this), Ae(this, zs));
    }
    constructor() {
        this.Ce = le(i(), {
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
        this.Be = o("a altGlyph animate animateColor circle clipPath defs ellipse feBlend feColorMatrix feComponentTransfer feComposite feConvolveMatrix feDiffuseLighting feDisplacementMap feFlood feGaussianBlur feImage feMerge feMorphology feOffset feSpecularLighting feTile feTurbulence filter font foreignObject g glyph glyphRef image line linearGradient marker mask missing-glyph path pattern polygon polyline radialGradient rect stop svg switch symbol text textPath tref tspan use");
        this.Se = o("alignment-baseline baseline-shift clip-path clip-rule clip color-interpolation-filters color-interpolation color-profile color-rendering color cursor direction display dominant-baseline enable-background fill-opacity fill-rule fill filter flood-color flood-opacity font-family font-size-adjust font-size font-stretch font-style font-variant font-weight glyph-orientation-horizontal glyph-orientation-vertical image-rendering kerning letter-spacing lighting-color marker-end marker-mid marker-start mask opacity overflow pointer-events shape-rendering stop-color stop-opacity stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width stroke text-anchor text-decoration text-rendering unicode-bidi visibility word-spacing writing-mode");
        const t = g($e);
        this.SVGElement = t.globalThis.SVGElement;
        const e = t.document.createElement("div");
        e.innerHTML = "<svg><altGlyph /></svg>";
        if (e.firstElementChild.nodeName === "altglyph") {
            const t = this.Ce;
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
        return this.Be[t.nodeName] === true && this.Se[e] === true || this.Ce[t.nodeName]?.[e] === true;
    }
}

class AttrMapper {
    constructor() {
        this.fns = [];
        this.Ae = i();
        this.Re = i();
        this.svg = g(zs);
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
            s = this.Ae[n] ??= i();
            for (r in e) {
                if (s[r] !== void 0) {
                    throw createError(r, n);
                }
                s[r] = e[r];
            }
        }
    }
    useGlobalMapping(t) {
        const e = this.Re;
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
        return shouldDefaultToTwoWay(t, e) || this.fns.length > 0 && this.fns.some((i => i(t, e)));
    }
    map(t, e) {
        return this.Ae[t.nodeName]?.[e] ?? this.Re[e] ?? (isDataAttribute(t, e, this.svg) ? e : null);
    }
}

AttrMapper.register = F(Q);

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

const Us = {
    register(t) {
        t.register(Z, AttrMapper, ResourceResolver);
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
        this.Te = new WeakMap;
        this.Ee = new WeakMap;
    }
    el(t, e) {
        let i = this.Te.get(t);
        if (i == null) {
            this.Te.set(t, i = new RecordCache);
        }
        return e in i.Le ? i.Le[e] : i.Le[e] = $s.find(t, e);
    }
    attr(t, e) {
        let i = this.Te.get(t);
        if (i == null) {
            this.Te.set(t, i = new RecordCache);
        }
        return e in i.Me ? i.Me[e] : i.Me[e] = Ge.find(t, e);
    }
    bindables(t) {
        let e = this.Ee.get(t);
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
                    mode: t.defaultBindingMode ?? Ut
                });
            }
            this.Ee.set(t, e = new BindablesInfo(n, s, a ?? null));
        }
        return e;
    }
}

ResourceResolver.register = F(Y);

class RecordCache {
    constructor() {
        this.Le = i();
        this.Me = i();
    }
}

const Gs = i();

class AttributeNSAccessor {
    static forNs(t) {
        return Gs[t] ??= new AttributeNSAccessor(t);
    }
    constructor(t) {
        this.ns = t;
        this.type = ye | we;
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
        this.type = ye | we;
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

const Ks = /*@__PURE__*/ new DataAttributeAccessor;

class SelectValueObserver {
    static De(t) {
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
    static Pe(t, e) {
        return t === e;
    }
    constructor(t, e, i, s) {
        this.type = ye | xe | we;
        this.v = void 0;
        this.ov = void 0;
        this.qe = false;
        this.Ie = void 0;
        this._e = void 0;
        this.iO = false;
        this.lt = false;
        this.rt = t;
        this.oL = s;
        this.cf = i;
    }
    getValue() {
        return this.iO ? this.v : this.rt.multiple ? SelectValueObserver.De(this.rt.options) : this.rt.value;
    }
    setValue(t) {
        this.ov = this.v;
        this.v = t;
        this.qe = t !== this.ov;
        this.Ve(t instanceof Array ? t : null);
        this.dt();
    }
    dt() {
        if (this.qe) {
            this.qe = false;
            this.syncOptions();
        }
    }
    handleCollectionChange() {
        this.syncOptions();
    }
    syncOptions() {
        const t = this.v;
        const e = this.rt;
        const i = w(t);
        const s = e.matcher ?? SelectValueObserver.Pe;
        const n = e.options;
        let r = n.length;
        while (r-- > 0) {
            const e = n[r];
            const l = oe.call(e, "model") ? e.model : e.value;
            if (i) {
                e.selected = t.findIndex((t => !!s(l, t))) !== -1;
                continue;
            }
            e.selected = !!s(l, t);
        }
    }
    syncValue() {
        const t = this.rt;
        const e = t.options;
        const i = e.length;
        const s = this.v;
        let n = 0;
        if (t.multiple) {
            if (!(s instanceof Array)) {
                return true;
            }
            let r;
            const l = t.matcher || SelectValueObserver.Pe;
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
                if (h.findIndex((t => !!l(a, t))) === -1) {
                    s.splice(n, 1);
                } else {
                    ++n;
                }
            }
            n = 0;
            while (n < h.length) {
                a = h[n];
                if (s.findIndex((t => !!l(a, t))) === -1) {
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
    ht() {
        (this._e = createMutationObserver(this.rt, this.Fe.bind(this))).observe(this.rt, {
            childList: true,
            subtree: true,
            characterData: true
        });
        this.Ve(this.v instanceof Array ? this.v : null);
        this.iO = true;
    }
    ct() {
        this._e.disconnect();
        this.Ie?.unsubscribe(this);
        this._e = this.Ie = void 0;
        this.iO = false;
    }
    Ve(t) {
        this.Ie?.unsubscribe(this);
        this.Ie = void 0;
        if (t != null) {
            if (!this.rt.multiple) {
                throw createMappedError(654);
            }
            (this.Ie = this.oL.getArrayObserver(t)).subscribe(this);
        }
    }
    handleEvent() {
        const t = this.syncValue();
        if (t) {
            this.He();
        }
    }
    Fe(t) {
        this.syncOptions();
        const e = this.syncValue();
        if (e) {
            this.He();
        }
    }
    He() {
        const t = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, t);
    }
}

(() => {
    mixinNodeObserverUseConfig(SelectValueObserver);
    At(SelectValueObserver, null);
})();

const Xs = "--";

class StyleAttributeAccessor {
    constructor(t) {
        this.obj = t;
        this.type = ye | we;
        this.v = "";
        this.ov = "";
        this.styles = {};
        this.version = 0;
        this.qe = false;
    }
    getValue() {
        return this.obj.style.cssText;
    }
    setValue(t) {
        this.v = t;
        this.qe = t !== this.ov;
        this.dt();
    }
    Oe(t) {
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
    $e(t) {
        let i;
        let s;
        const r = [];
        for (s in t) {
            i = t[s];
            if (i == null) {
                continue;
            }
            if (e(i)) {
                if (s.startsWith(Xs)) {
                    r.push([ s, i ]);
                    continue;
                }
                r.push([ n(s), i ]);
                continue;
            }
            r.push(...this.Ne(i));
        }
        return r;
    }
    We(t) {
        const e = t.length;
        if (e > 0) {
            const i = [];
            let s = 0;
            for (;e > s; ++s) {
                i.push(...this.Ne(t[s]));
            }
            return i;
        }
        return v;
    }
    Ne(t) {
        if (e(t)) {
            return this.Oe(t);
        }
        if (t instanceof Array) {
            return this.We(t);
        }
        if (t instanceof Object) {
            return this.$e(t);
        }
        return v;
    }
    dt() {
        if (this.qe) {
            this.qe = false;
            const t = this.v;
            const e = this.styles;
            const i = this.Ne(t);
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
        if (e != null && u(e.indexOf) && e.includes("!important")) {
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
        this.type = ye | xe | we;
        this.v = "";
        this.ov = "";
        this.qe = false;
        this.lt = false;
        this.rt = t;
        this.k = e;
        this.cf = i;
    }
    getValue() {
        return this.v;
    }
    setValue(t) {
        if (R(t, this.v)) {
            return;
        }
        this.ov = this.v;
        this.v = t;
        this.qe = true;
        if (!this.cf.readonly) {
            this.dt();
        }
    }
    dt() {
        if (this.qe) {
            this.qe = false;
            this.rt[this.k] = this.v ?? this.cf.default;
            this.He();
        }
    }
    handleEvent() {
        this.ov = this.v;
        this.v = this.rt[this.k];
        if (this.ov !== this.v) {
            this.qe = false;
            this.He();
        }
    }
    ht() {
        this.v = this.ov = this.rt[this.k];
    }
    He() {
        const t = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, t);
    }
}

(() => {
    mixinNodeObserverUseConfig(ValueAttributeObserver);
    At(ValueAttributeObserver, null);
})();

const Qs = (() => {
    const t = "http://www.w3.org/1999/xlink";
    const e = "http://www.w3.org/XML/1998/namespace";
    const s = "http://www.w3.org/2000/xmlns/";
    return le(i(), {
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

const Ys = new Dt;

Ys.type = ye | we;

class NodeObserverLocator {
    constructor() {
        this.allowDirtyCheck = true;
        this.je = i();
        this.ze = i();
        this.Ue = i();
        this.Ge = i();
        this.Ke = g(H);
        this.p = g($e);
        this.Xe = g(qt);
        this.svg = g(zs);
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
        const r = this.je;
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
        const i = this.ze;
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
        if (e in this.Ge || e in (this.Ue[t.tagName] ?? O)) {
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
            return Ks;

          default:
            {
                const i = Qs[e];
                if (i !== undefined) {
                    return AttributeNSAccessor.forNs(i[1]);
                }
                if (isDataAttribute(t, e, this.svg)) {
                    return Ks;
                }
                return Ys;
            }
        }
    }
    overrideAccessor(t, s) {
        let n;
        if (e(t)) {
            n = this.Ue[t] ??= i();
            n[s] = true;
        } else {
            for (const e in t) {
                for (const s of t[e]) {
                    n = this.Ue[e] ??= i();
                    n[s] = true;
                }
            }
        }
    }
    overrideAccessorGlobal(...t) {
        for (const e of t) {
            this.Ge[e] = true;
        }
    }
    getNodeObserverConfig(t, e) {
        return this.je[t.tagName]?.[e] ?? this.ze[e];
    }
    getNodeObserver(t, e, i) {
        const s = this.je[t.tagName]?.[e] ?? this.ze[e];
        let n;
        if (s != null) {
            n = new (s.type ?? ValueAttributeObserver)(t, e, s, i, this.Ke);
            if (!n.doNotCache) {
                It(t)[e] = n;
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
        const n = Qs[e];
        if (n !== undefined) {
            return AttributeNSAccessor.forNs(n[1]);
        }
        if (isDataAttribute(t, e, this.svg)) {
            return Ks;
        }
        if (e in t.constructor.prototype) {
            if (this.allowDirtyCheck) {
                return this.Xe.createProperty(t, e);
            }
            throw createMappedError(652, e);
        } else {
            return new _t(t, e);
        }
    }
}

NodeObserverLocator.register = F(Pt);

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
        this.type = ye | xe | we;
        this.v = void 0;
        this.ov = void 0;
        this.Qe = void 0;
        this.Ye = void 0;
        this.lt = false;
        this.rt = t;
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
        this.Ze();
        this.Je();
        this.He();
    }
    handleCollectionChange() {
        this.Je();
    }
    handleChange(t, e) {
        this.Je();
    }
    Je() {
        const t = this.v;
        const e = this.rt;
        const i = oe.call(e, "model") ? e.model : e.value;
        const s = e.type === "radio";
        const n = e.matcher !== void 0 ? e.matcher : defaultMatcher;
        if (s) {
            e.checked = !!n(t, i);
        } else if (t === true) {
            e.checked = true;
        } else {
            let s = false;
            if (w(t)) {
                s = t.findIndex((t => !!n(t, i))) !== -1;
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
        const e = this.rt;
        const i = oe.call(e, "model") ? e.model : e.value;
        const s = e.checked;
        const n = e.matcher !== void 0 ? e.matcher : defaultMatcher;
        if (e.type === "checkbox") {
            if (w(t)) {
                const e = t.findIndex((t => !!n(t, i)));
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
        this.He();
    }
    ht() {
        this.Ze();
    }
    ct() {
        this.v = this.ov = void 0;
        this.Qe?.unsubscribe(this);
        this.Ye?.unsubscribe(this);
        this.Qe = this.Ye = void 0;
    }
    He() {
        Zs = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, Zs);
        Zs = void 0;
    }
    Ze() {
        const t = this.rt;
        (this.Ye ??= t.$observers?.model ?? t.$observers?.value)?.subscribe(this);
        this.Qe?.unsubscribe(this);
        this.Qe = void 0;
        if (t.type === "checkbox") {
            (this.Qe = getCollectionObserver(this.v, this.oL))?.subscribe(this);
        }
    }
}

(() => {
    mixinNodeObserverUseConfig(CheckedObserver);
    At(CheckedObserver, null);
})();

let Zs = void 0;

class AttrBindingBehavior {
    bind(t, e) {
        if (!(e instanceof PropertyBinding)) {
            throw createMappedError(9994, e);
        }
        e.useTargetObserver(Ks);
    }
}

AttrBindingBehavior.$au = {
    type: Le,
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
    type: Le,
    name: "self"
};

class UpdateTriggerBindingBehavior {
    constructor() {
        this.oL = g(Tt);
        this.ti = g(Pt);
    }
    bind(t, e, ...i) {
        if (!(this.ti instanceof NodeObserverLocator)) {
            throw createMappedError(9993);
        }
        if (i.length === 0) {
            throw createMappedError(802);
        }
        if (!(e instanceof PropertyBinding) || !(e.mode & Xt)) {
            throw createMappedError(803);
        }
        const s = this.ti.getNodeObserverConfig(e.target, e.targetProperty);
        if (s == null) {
            throw createMappedError(9992, e);
        }
        const n = this.ti.getNodeObserver(e.target, e.targetProperty, this.oL);
        n.useConfig({
            readonly: s.readonly,
            default: s.default,
            events: i
        });
        e.useTargetObserver(n);
    }
}

UpdateTriggerBindingBehavior.$au = {
    type: Le,
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
        this.ei = false;
        this.ii = 0;
        this.si = g(di);
        this.l = g(Es);
    }
    attaching(t, e) {
        return this.ni(this.value);
    }
    detaching(t, e) {
        this.ei = true;
        return D(this.pending, (() => {
            this.ei = false;
            this.pending = void 0;
            void this.view?.deactivate(t, this.$controller);
        }));
    }
    valueChanged(t, e) {
        if (!this.$controller.isActive) return;
        t = !!t;
        e = !!e;
        if (t !== e) return this.ni(t);
    }
    ni(t) {
        const e = this.view;
        const i = this.$controller;
        const s = this.ii++;
        const isCurrent = () => !this.ei && this.ii === s + 1;
        let n;
        return D(this.pending, (() => this.pending = D(e?.deactivate(e, i), (() => {
            if (!isCurrent()) {
                return;
            }
            if (t) {
                n = this.view = this.ifView = this.cache && this.ifView != null ? this.ifView : this.si.create();
            } else {
                n = this.view = this.elseView = this.cache && this.elseView != null ? this.elseView : this.elseFactory?.create();
            }
            if (n == null) {
                return;
            }
            n.setLocation(this.l);
            return D(n.activate(n, i, i.scope), (() => {
                if (isCurrent()) {
                    this.pending = void 0;
                }
            }));
        }))));
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
    type: ze,
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
        this.f = g(di);
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

const Js = [ "BindingBehavior", "ValueConverter" ];

class Repeat {
    constructor() {
        this.views = [];
        this.key = null;
        this.oi = [];
        this.ri = [];
        this.li = [];
        this.hi = new Map;
        this.ai = void 0;
        this.ci = false;
        this.ui = false;
        this.fi = null;
        this.di = void 0;
        this.mi = false;
        this.l = g(Es);
        this.gi = g(ks);
        this.f = g(di);
        this.pi = g(nn);
        const t = g(K);
        const e = t.props[0].props[0];
        if (e !== void 0) {
            const {to: t, value: i, command: s} = e;
            if (t === "key") {
                if (s === null) {
                    this.key = i;
                } else if (s === "bind") {
                    this.key = g(Wt).parse(i, ge);
                } else {
                    throw createMappedError(775, s);
                }
            } else {
                throw createMappedError(776, t);
            }
        }
    }
    binding(t, e) {
        const i = this.gi.bindings;
        const s = i.length;
        let n = void 0;
        let r;
        let l = 0;
        for (;s > l; ++l) {
            n = i[l];
            if (n.target === this && n.targetProperty === "items") {
                r = this.forOf = n.ast;
                this.xi = n;
                let t = r.iterable;
                while (t != null && Js.includes(t.$kind)) {
                    t = t.expression;
                    this.ci = true;
                }
                this.fi = t;
                break;
            }
        }
        this.yi();
        const h = r.declaration;
        if (!(this.mi = h.$kind === "ArrayDestructuring" || h.$kind === "ObjectDestructuring")) {
            this.local = bt(h, this.$controller.scope, n, null);
        }
    }
    attaching(t, e) {
        this.wi();
        this.bi(void 0);
        return this.ki(t, this.di ?? v);
    }
    detaching(t, e) {
        this.yi();
        return this.Ci(t);
    }
    unbinding(t, e) {
        this.hi.clear();
    }
    itemsChanged() {
        if (!this.$controller.isActive) {
            return;
        }
        this.yi();
        this.wi();
        this.bi(void 0);
        this.Bi(void 0);
    }
    handleCollectionChange(t, e) {
        const i = this.$controller;
        if (!i.isActive) {
            return;
        }
        if (this.ci) {
            if (this.ui) {
                return;
            }
            this.ui = true;
            this.items = bt(this.forOf.iterable, i.scope, this.xi, null);
            this.ui = false;
            return;
        }
        this.wi();
        this.bi(this.key === null ? e : void 0);
        this.Bi(e);
    }
    Bi(t) {
        const e = this.views;
        this.oi = e.slice();
        const i = e.length;
        const s = this.key;
        const n = s !== null;
        const r = this.li;
        const l = this.ri;
        if (n || t === void 0) {
            const e = this.local;
            const h = this.di;
            const a = h.length;
            const c = this.forOf;
            const u = c.declaration;
            const f = this.xi;
            const d = this.mi;
            t = Vt(a);
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
            const e = D(this.Si(t), (() => this.Ai(t)));
            if (M(e)) {
                e.catch(rethrow);
            }
        } else {
            this.Ai(t);
        }
    }
    yi() {
        const t = this.$controller.scope;
        let e = this.Ri;
        let i = this.ci;
        let s;
        if (i) {
            e = this.Ri = bt(this.fi, t, this.xi, null) ?? null;
            i = this.ci = !R(this.items, e);
        }
        const n = this.ai;
        if (this.$controller.isActive) {
            const t = i ? e : this.items;
            s = this.ai = this.pi.resolve(t).getObserver?.(t);
            if (n !== s) {
                n?.unsubscribe(this);
                s?.subscribe(this);
            }
        } else {
            n?.unsubscribe(this);
            this.ai = undefined;
        }
    }
    bi(t) {
        const e = this.ri;
        this.li = e.slice();
        const i = this.di;
        const s = i.length;
        const n = this.ri = Array(i.length);
        const r = this.hi;
        const l = new Map;
        const h = this.$controller.scope;
        const a = this.xi;
        const c = this.forOf;
        const u = this.local;
        const f = this.mi;
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
        this.hi = l;
    }
    wi() {
        const t = this.items;
        if (w(t)) {
            this.di = t.slice(0);
            return;
        }
        const e = [];
        this.pi.resolve(t).iterate(t, ((t, i) => {
            e[i] = t;
        }));
        this.di = e;
    }
    ki(t, e) {
        let i = void 0;
        let s;
        let n;
        let r;
        const {$controller: l, f: h, l: a, ri: c} = this;
        const u = e.length;
        const f = this.views = Array(u);
        for (let e = 0; e < u; ++e) {
            n = f[e] = h.create().setLocation(a);
            n.nodes.unlink();
            r = c[e];
            setContextualProperties(r.overrideContext, e, u);
            s = n.activate(t ?? n, l, r);
            if (M(s)) {
                (i ??= []).push(s);
            }
        }
        if (i !== void 0) {
            return i.length === 1 ? i[0] : Promise.all(i);
        }
    }
    Ci(t) {
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
            if (M(i)) {
                (e ?? (e = [])).push(i);
            }
        }
        if (e !== void 0) {
            return e.length === 1 ? e[0] : Promise.all(e);
        }
    }
    Si(t) {
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
            if (M(i)) {
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
    Ai(t) {
        let e = void 0;
        let i;
        let s;
        let n = 0;
        const {$controller: r, f: l, l: h, views: a, ri: c, oi: u} = this;
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
            s.nodes.link(p?.nodes ?? h);
            if (t[n] === -2) {
                s.setLocation(h);
                setContextualProperties(c[n].overrideContext, n, f);
                i = s.activate(s, r, c[n]);
                if (M(i)) {
                    (e ?? (e = [])).push(i);
                }
            } else if (v < 0 || g === 1 || n !== m[v]) {
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
    type: ze,
    name: "repeat",
    isTemplateController: true,
    bindables: [ "items" ]
};

let tn = 16;

let en = new Int32Array(tn);

let sn = new Int32Array(tn);

function longestIncreasingSubsequence(t) {
    const e = t.length;
    if (e > tn) {
        tn = e;
        en = new Int32Array(e);
        sn = new Int32Array(e);
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
            l = en[i];
            n = t[l];
            if (n !== -2 && n < s) {
                sn[r] = l;
                en[++i] = r;
                continue;
            }
            h = 0;
            a = i;
            while (h < a) {
                c = h + a >> 1;
                n = t[en[c]];
                if (n !== -2 && n < s) {
                    h = c + 1;
                } else {
                    a = c;
                }
            }
            n = t[en[h]];
            if (s < n || n === -2) {
                if (h > 0) {
                    sn[r] = en[h - 1];
                }
                en[h] = r;
            }
        }
    }
    r = ++i;
    const u = new Int32Array(r);
    s = en[i - 1];
    while (i-- > 0) {
        u[i] = s;
        s = sn[s];
    }
    while (r-- > 0) en[r] = 0;
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

const nn = /*@__PURE__*/ Be("IRepeatableHandlerResolver", (t => t.singleton(RepeatableHandlerResolver)));

class RepeatableHandlerResolver {
    constructor() {
        this.Ti = g(b(on));
    }
    resolve(t) {
        if (rn.handles(t)) {
            return rn;
        }
        if (ln.handles(t)) {
            return ln;
        }
        if (hn.handles(t)) {
            return hn;
        }
        if (an.handles(t)) {
            return an;
        }
        if (cn.handles(t)) {
            return cn;
        }
        const e = this.Ti.find((e => e.handles(t)));
        if (e !== void 0) {
            return e;
        }
        return un;
    }
}

class ArrayLikeHandler {
    static register(t) {
        t.register(Se(on, this));
    }
    handles(t) {
        return "length" in t && $(t.length);
    }
    iterate(t, e) {
        for (let i = 0, s = t.length; i < s; ++i) {
            e(t[i], i, t);
        }
    }
}

const on = /*@__PURE__*/ Be("IRepeatableHandler");

const rn = {
    handles: w,
    getObserver: Ft,
    iterate(t, e) {
        const i = t.length;
        let s = 0;
        for (;s < i; ++s) {
            e(t[s], s, t);
        }
    }
};

const ln = {
    handles: N,
    getObserver: Ft,
    iterate(t, e) {
        let i = 0;
        let s;
        for (s of t.keys()) {
            e(s, i++, t);
        }
    }
};

const hn = {
    handles: W,
    getObserver: Ft,
    iterate(t, e) {
        let i = 0;
        let s;
        for (s of t.entries()) {
            e(s, i++, t);
        }
    }
};

const an = {
    handles: $,
    iterate(t, e) {
        let i = 0;
        for (;i < t; ++i) {
            e(i, i, t);
        }
    }
};

const cn = {
    handles: t => t == null,
    iterate() {}
};

const un = {
    handles(t) {
        return false;
    },
    iterate(t, e) {
        throw createMappedError(777, t);
    }
};

const setItem = (t, e, i, s, n, r) => {
    if (t) {
        St(e, i, s, null, r);
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
    } else if (c instanceof Rt) {
        t.delete(i);
    } else if (c.length === 1) {
        c = c[0];
        t.delete(i);
    } else {
        c = c.shift();
    }
    if (e.has(i)) {
        const t = e.get(i);
        if (t instanceof Rt) {
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
        const n = Rt.fromParent(i, new Ht, new RepeatOverrideContext);
        St(e.declaration, n, s, null, t);
    }
    return Rt.fromParent(i, new Ht(n, t), new RepeatOverrideContext);
};

const compareNumber = (t, e) => t - e;

class With {
    constructor() {
        this.view = g(di).create().setLocation(g(Es));
    }
    valueChanged(t, e) {
        const i = this.$controller;
        const s = this.view.bindings;
        let n;
        let r = 0, l = 0;
        if (i.isActive && s != null) {
            n = Rt.fromParent(i.scope, t === void 0 ? {} : t);
            for (l = s.length; l > r; ++r) {
                s[r].bind(n);
            }
        }
    }
    attaching(t, e) {
        const {$controller: i, value: s} = this;
        const n = Rt.fromParent(i.scope, s === void 0 ? {} : s);
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
    type: ze,
    name: "with",
    isTemplateController: true,
    bindables: [ "value" ]
};

class Switch {
    constructor() {
        this.cases = [];
        this.activeCases = [];
        this.promise = void 0;
        this.f = g(di);
        this.l = g(Es);
    }
    link(t, e, i, s) {
        this.view = this.f.create(this.$controller).setLocation(this.l);
    }
    attaching(t, e) {
        const i = this.view;
        const s = this.$controller;
        this.queue((() => i.activate(t, s, s.scope)));
        this.queue((() => this.swap(t, this.value)));
        return this.promise;
    }
    detaching(t, e) {
        this.queue((() => {
            const e = this.view;
            return e.deactivate(t, this.$controller);
        }));
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
        this.queue((() => this.swap(null, this.value)));
    }
    caseChanged(t) {
        this.queue((() => this.Ei(t)));
    }
    Ei(t) {
        const e = t.isMatch(this.value);
        const i = this.activeCases;
        const s = i.length;
        if (!e) {
            if (s > 0 && i[0].id === t.id) {
                return this.Li(null);
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
        return D(this.Li(null, n), (() => {
            this.activeCases = n;
            return this.Mi(null);
        }));
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
        return D(this.activeCases.length > 0 ? this.Li(t, i) : void 0, (() => {
            this.activeCases = i;
            if (i.length === 0) {
                return;
            }
            return this.Mi(t);
        }));
    }
    Mi(t) {
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
        return L(...i.map((e => e.activate(t, n))));
    }
    Li(t, e = []) {
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
        return D(L(...i.reduce(((i, s) => {
            if (!e.includes(s)) {
                i.push(s.deactivate(t));
            }
            return i;
        }), [])), (() => {
            i.length = 0;
        }));
    }
    queue(t) {
        const e = this.promise;
        let i = void 0;
        i = this.promise = D(D(e, t), (() => {
            if (this.promise === i) {
                this.promise = void 0;
            }
        }));
    }
    accept(t) {
        if (this.$controller.accept(t) === true) {
            return true;
        }
        if (this.activeCases.some((e => e.accept(t)))) {
            return true;
        }
    }
}

Switch.$au = {
    type: ze,
    name: "switch",
    isTemplateController: true,
    bindables: [ "value" ]
};

let dn = 0;

const mn = [ "value", {
    name: "fallThrough",
    mode: Gt,
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
        this.id = ++dn;
        this.fallThrough = false;
        this.view = void 0;
        this.f = g(di);
        this.Ke = g(Tt);
        this.l = g(Es);
        this.Di = g(x).scopeTo(`${this.constructor.name}-#${this.id}`);
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
        this.Di.debug("isMatch()");
        const e = this.value;
        if (w(e)) {
            if (this.ai === void 0) {
                this.ai = this.Pi(e);
            }
            return e.includes(t);
        }
        return e === t;
    }
    valueChanged(t, e) {
        if (w(t)) {
            this.ai?.unsubscribe(this);
            this.ai = this.Pi(t);
        } else if (this.ai !== void 0) {
            this.ai.unsubscribe(this);
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
        this.ai?.unsubscribe(this);
        this.view?.dispose();
        this.view = void 0;
    }
    linkToSwitch(t) {
        t.cases.push(this);
    }
    Pi(t) {
        const e = this.Ke.getArrayObserver(t);
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
        bindables: mn,
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
        bindables: mn,
        isTemplateController: true
    }, DefaultCase);
})();

var gn, pn, vn;

class PromiseTemplateController {
    constructor() {
        this.preSettledTask = null;
        this.postSettledTask = null;
        this.f = g(di);
        this.l = g(Es);
        this.p = g($e);
        this.logger = g(x).scopeTo("promise.resolve");
    }
    link(t, e, i, s) {
        this.view = this.f.create(this.$controller).setLocation(this.l);
    }
    attaching(t, e) {
        const i = this.view;
        const s = this.$controller;
        return D(i.activate(t, s, this.viewScope = Rt.fromParent(s.scope, {})), (() => this.swap(t)));
    }
    valueChanged(t, e) {
        if (!this.$controller.isActive) {
            return;
        }
        this.swap(null);
    }
    swap(t) {
        const e = this.value;
        if (!M(e)) {
            return;
        }
        const i = this.p.domQueue;
        const s = this.fulfilled;
        const n = this.rejected;
        const r = this.pending;
        const l = this.viewScope;
        let h;
        const $swap = () => {
            void L(h = (this.preSettledTask = i.queueTask((() => L(s?.deactivate(t), n?.deactivate(t), r?.activate(t, l))))).result.catch((t => {
                if (!(t instanceof zt)) throw t;
            })), e.then((a => {
                if (this.value !== e) {
                    return;
                }
                const fulfill = () => {
                    this.postSettlePromise = (this.postSettledTask = i.queueTask((() => L(r?.deactivate(t), n?.deactivate(t), s?.activate(t, l, a))))).result;
                };
                if (this.preSettledTask.status === ve) {
                    void h.then(fulfill);
                } else {
                    this.preSettledTask.cancel();
                    fulfill();
                }
            }), (a => {
                if (this.value !== e) {
                    return;
                }
                const reject = () => {
                    this.postSettlePromise = (this.postSettledTask = i.queueTask((() => L(r?.deactivate(t), s?.deactivate(t), n?.activate(t, l, a))))).result;
                };
                if (this.preSettledTask.status === ve) {
                    void h.then(reject);
                } else {
                    this.preSettledTask.cancel();
                    reject();
                }
            })));
        };
        if (this.postSettledTask?.status === ve) {
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
    type: ze,
    name: "promise",
    isTemplateController: true,
    bindables: [ "value" ]
};

class PendingTemplateController {
    constructor() {
        this.view = void 0;
        this.f = g(di);
        this.l = g(Es);
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
    type: ze,
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
        this.f = g(di);
        this.l = g(Es);
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
    type: ze,
    name: "then",
    isTemplateController: true,
    bindables: {
        value: {
            mode: Xt
        }
    }
};

class RejectedTemplateController {
    constructor() {
        this.view = void 0;
        this.f = g(di);
        this.l = g(Es);
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
    type: ze,
    name: "catch",
    isTemplateController: true,
    bindables: {
        value: {
            mode: Xt
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
        return new tt(t, e, "promise", "bind");
    }
}

gn = Symbol.metadata;

PromiseAttributePattern[gn] = {
    [y]: J.create([ {
        pattern: "promise.resolve",
        symbols: ""
    } ], PromiseAttributePattern)
};

class FulfilledAttributePattern {
    then(t, e) {
        return new tt(t, e, "then", "from-view");
    }
}

pn = Symbol.metadata;

FulfilledAttributePattern[pn] = {
    [y]: J.create([ {
        pattern: "then",
        symbols: ""
    } ], FulfilledAttributePattern)
};

class RejectedAttributePattern {
    catch(t, e) {
        return new tt(t, e, "catch", "from-view");
    }
}

vn = Symbol.metadata;

RejectedAttributePattern[vn] = {
    [y]: J.create([ {
        pattern: "catch",
        symbols: ""
    } ], RejectedAttributePattern)
};

class Focus {
    constructor() {
        this.qi = false;
        this.Le = g(We);
        this.p = g($e);
    }
    binding() {
        this.valueChanged();
    }
    valueChanged() {
        if (this.$controller.isActive) {
            this.Ii();
        } else {
            this.qi = true;
        }
    }
    attached() {
        if (this.qi) {
            this.qi = false;
            this.Ii();
        }
        this.Le.addEventListener("focus", this);
        this.Le.addEventListener("blur", this);
    }
    detaching() {
        const t = this.Le;
        t.removeEventListener("focus", this);
        t.removeEventListener("blur", this);
    }
    handleEvent(t) {
        if (t.type === "focus") {
            this.value = true;
        } else if (!this._i) {
            this.value = false;
        }
    }
    Ii() {
        const t = this.Le;
        const e = this._i;
        const i = this.value;
        if (i && !e) {
            t.focus();
        } else if (!i && e) {
            t.blur();
        }
    }
    get _i() {
        return this.Le === this.p.document.activeElement;
    }
}

Focus.$au = {
    type: ze,
    name: "focus",
    bindables: {
        value: {
            mode: Qt
        }
    }
};

class Portal {
    constructor() {
        this.position = "beforeend";
        this.strict = false;
        const t = g(di);
        const e = g(Es);
        const i = g($e);
        this.p = i;
        this.Vi = i.document.createElement("div");
        (this.view = t.create()).setLocation(this.Fi = mi(i));
        setEffectiveParentNode(this.view.nodes, e);
    }
    attaching(t) {
        if (this.callbackContext == null) {
            this.callbackContext = this.$controller.scope.bindingContext;
        }
        const e = this.Vi = this.Hi();
        this.Oi(e, this.position);
        return this.$i(t, e);
    }
    detaching(t) {
        return this.Ni(t, this.Vi);
    }
    targetChanged() {
        const {$controller: t} = this;
        if (!t.isActive) {
            return;
        }
        const e = this.Hi();
        if (this.Vi === e) {
            return;
        }
        this.Vi = e;
        const i = D(this.Ni(null, e), (() => {
            this.Oi(e, this.position);
            return this.$i(null, e);
        }));
        if (M(i)) {
            i.catch(rethrow);
        }
    }
    positionChanged() {
        const {$controller: t, Vi: e} = this;
        if (!t.isActive) {
            return;
        }
        const i = D(this.Ni(null, e), (() => {
            this.Oi(e, this.position);
            return this.$i(null, e);
        }));
        if (M(i)) {
            i.catch(rethrow);
        }
    }
    $i(t, e) {
        const {activating: i, callbackContext: s, view: n} = this;
        return D(i?.call(s, e, n), (() => this.Wi(t, e)));
    }
    Wi(t, e) {
        const {$controller: i, view: s} = this;
        if (t === null) {
            s.nodes.insertBefore(this.Fi);
        } else {
            return D(s.activate(t ?? s, i, i.scope), (() => this.ji(e)));
        }
        return this.ji(e);
    }
    ji(t) {
        const {activated: e, callbackContext: i, view: s} = this;
        return e?.call(i, t, s);
    }
    Ni(t, e) {
        const {deactivating: i, callbackContext: s, view: n} = this;
        return D(i?.call(s, e, n), (() => this.zi(t, e)));
    }
    zi(t, e) {
        const {$controller: i, view: s} = this;
        if (t === null) {
            s.nodes.remove();
        } else {
            return D(s.deactivate(t, i), (() => this.Ui(e)));
        }
        return this.Ui(e);
    }
    Ui(t) {
        const {deactivated: e, callbackContext: i, view: s} = this;
        return D(e?.call(i, t, s), (() => this.Gi()));
    }
    Hi() {
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
    Gi() {
        this.Fi.remove();
        this.Fi.$start.remove();
    }
    Oi(t, e) {
        const i = this.Fi;
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
    type: ze,
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

let xn;

class AuSlot {
    constructor() {
        this.Ki = null;
        this.Xi = null;
        this.te = false;
        this.expose = null;
        this.slotchange = null;
        this.Qi = new Set;
        this.ai = null;
        const t = g(Cs);
        const e = g(Es);
        const i = g(K);
        const s = g(Gi);
        const n = this.name = i.data.name;
        const r = i.projections?.[gi];
        const l = t.instruction?.projections?.[n];
        const h = t.controller.container;
        let a;
        let c;
        if (l == null) {
            c = h.createChild({
                inheritParentResources: true
            });
            a = s.getViewFactory(r ?? (xn ??= CustomElementDefinition.create({
                name: "au-slot-empty-template",
                template: "",
                needsCompile: false
            })), c);
            this.Yi = false;
        } else {
            c = h.createChild();
            c.useResources(t.parent.controller.container);
            registerResolver(c, Cs, new B(void 0, t.parent));
            a = s.getViewFactory(l, c);
            this.Yi = true;
            this.Zi = h.getAll(xi, false)?.filter((t => t.slotName === "*" || t.slotName === n)) ?? v;
        }
        this.Ji = (this.Zi ??= v).length > 0;
        this.ts = t;
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
        this.Qi.add(t);
    }
    unsubscribe(t) {
        this.Qi.delete(t);
    }
    binding(t, e) {
        this.Ki = e.scope;
        while (e.vmKind === "synthetic" && e.parent?.viewModel instanceof AuSlot) {
            e = e.parent.parent;
        }
        const i = e.scope.bindingContext;
        let s;
        if (this.Yi) {
            s = this.ts.controller.scope.parent;
            (this.Xi = Rt.fromParent(s, s.bindingContext)).overrideContext.$host = this.expose ?? i;
        }
    }
    attaching(t, e) {
        return D(this.view.activate(t, this.$controller, this.Yi ? this.Xi : this.Ki), (() => {
            if (this.Ji || u(this.slotchange)) {
                this.Zi.forEach((t => t.watch(this)));
                this.Ze();
                this.es();
                this.te = true;
            }
        }));
    }
    detaching(t, e) {
        this.te = false;
        this.ss();
        this.Zi.forEach((t => t.unwatch(this)));
        return this.view.deactivate(t, this.$controller);
    }
    exposeChanged(t) {
        if (this.Yi && this.Xi != null) {
            this.Xi.overrideContext.$host = t;
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
    Ze() {
        if (this.ai != null) {
            return;
        }
        const t = this.l;
        const e = t.parentElement;
        if (e == null) {
            return;
        }
        (this.ai = createMutationObserver(e, (e => {
            if (isMutationWithinLocation(t, e)) {
                this.es();
            }
        }))).observe(e, {
            childList: true
        });
    }
    ss() {
        this.ai?.disconnect();
        this.ai = null;
    }
    es() {
        const t = this.nodes;
        const e = new Set(this.Qi);
        let i;
        if (this.te) {
            this.slotchange?.call(void 0, this.name, t);
        }
        for (i of e) {
            i.handleSlotChange(this, t);
        }
    }
}

AuSlot.$au = {
    type: Vs,
    name: "au-slot",
    template: null,
    containerless: true,
    processContent(t, e, i) {
        i.name = t.getAttribute("name") ?? gi;
        let s = t.firstChild;
        let n = null;
        while (s !== null) {
            n = s.nextSibling;
            if (isElement(s) && s.hasAttribute(pi)) {
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
        this.os = void 0;
        this.tag = null;
        this.c = g(S);
        this.parent = g(ks);
        this.rs = g(We);
        this.l = g(Es);
        this.p = g($e);
        this.r = g(Gi);
        this.ls = g(K);
        this.cs = g(j(CompositionContextFactory, null));
        this.xt = g(G);
        this.et = g(Cs);
        this.ep = g(Wt);
        this.oL = g(Tt);
    }
    get composing() {
        return this.us;
    }
    get composition() {
        return this.os;
    }
    attaching(t, e) {
        return this.us = D(this.queue(new ChangeInfo(this.template, this.component, this.model, void 0), t), (t => {
            if (this.cs.ds(t)) {
                this.us = void 0;
            }
        }));
    }
    detaching(t) {
        const e = this.os;
        const i = this.us;
        this.cs.invalidate();
        this.os = this.us = void 0;
        return D(i, (() => e?.deactivate(t)));
    }
    propertyChanged(t) {
        if (t === "composing" || t === "composition") return;
        if (t === "model" && this.os != null) {
            this.os.update(this.model);
            return;
        }
        if (t === "tag" && this.os?.controller.vmKind === us) {
            return;
        }
        this.us = D(this.us, (() => D(this.queue(new ChangeInfo(this.template, this.component, this.model, t), void 0), (t => {
            if (this.cs.ds(t)) {
                this.us = void 0;
            }
        }))));
    }
    queue(t, e) {
        const i = this.cs;
        const s = this.os;
        return D(i.create(t), (t => {
            if (i.ds(t)) {
                return D(this.compose(t), (n => {
                    if (i.ds(t)) {
                        return D(n.activate(e), (() => {
                            if (i.ds(t)) {
                                this.os = n;
                                return D(s?.deactivate(e), (() => t));
                            } else {
                                return D(n.controller.deactivate(n.controller, this.$controller), (() => {
                                    n.controller.dispose();
                                    return t;
                                }));
                            }
                        }));
                    }
                    n.controller.dispose();
                    return t;
                }));
            }
            return t;
        }));
    }
    compose(t) {
        const {gs: e, ps: i, xs: s} = t.change;
        const {c: n, $controller: r, l: l, ls: h} = this;
        const a = this.ys(this.et.controller.container, i);
        const c = n.createChild();
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
        const m = this.ws(c, typeof i === "string" ? a.Type : i, f, d);
        const compose = () => {
            const i = h.captures ?? v;
            if (a !== null) {
                const e = a.capture;
                const [s, n] = i.reduce(((t, i) => {
                    const s = !(i.target in a.bindables) && (e === true || u(e) && !!e(i.target));
                    t[s ? 0 : 1].push(i);
                    return t;
                }), [ [], [] ]);
                const l = Controller.$el(c, m, f, {
                    projections: h.projections,
                    captures: s
                }, a, d);
                this.bs(f, a, n).forEach((t => l.addBinding(t)));
                return new CompositionController(l, (t => l.activate(t ?? l, r, r.scope.parent)), (t => D(l.deactivate(t ?? l, r), removeCompositionHost)), (t => m.activate?.(t)), t);
            } else {
                const s = CustomElementDefinition.create({
                    name: $s.generateName(),
                    template: e
                });
                const n = this.r.getViewFactory(s, c);
                const l = Controller.$view(n, r);
                const h = this.scopeBehavior === "auto" ? Rt.fromParent(this.parent.scope, m) : Rt.create(m);
                l.setHost(f);
                if (d == null) {
                    this.bs(f, s, i).forEach((t => l.addBinding(t)));
                } else {
                    l.setLocation(d);
                }
                return new CompositionController(l, (t => l.activate(t ?? l, r, h)), (t => D(l.deactivate(t ?? l, r), removeCompositionHost)), (t => m.activate?.(t)), t);
            }
        };
        if ("activate" in m) {
            return D(m.activate(s), (() => compose()));
        } else {
            return compose();
        }
    }
    ws(t, e, i, s) {
        if (e == null) {
            return new EmptyComponent;
        }
        if (typeof e === "object") {
            return e;
        }
        const n = this.p;
        registerHostNode(t, i, n);
        registerResolver(t, Es, new B("IRenderLocation", s));
        const r = t.invoke(e);
        registerResolver(t, e, new B("au-compose.component", r));
        return r;
    }
    ys(t, e) {
        if (typeof e === "string") {
            const i = $s.find(t, e);
            if (i == null) {
                throw createMappedError(806, e);
            }
            return i;
        }
        const i = u(e) ? e : e?.constructor;
        return $s.isType(i, void 0) ? $s.getDefinition(i, null) : null;
    }
    bs(t, e, i) {
        const s = new HydrationContext(this.$controller, {
            projections: null,
            captures: i
        }, this.et.parent);
        return SpreadBinding.create(s, t, e, this.r, this.xt, this.p, this.ep, this.oL);
    }
}

AuCompose.$au = {
    type: Vs,
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
        mode: Xt
    }, {
        name: "composition",
        mode: Xt
    }, "tag" ]
};

class EmptyComponent {}

class CompositionContextFactory {
    constructor() {
        this.id = 0;
    }
    ds(t) {
        return t.id === this.id;
    }
    create(t) {
        return D(t.load(), (t => new CompositionContext(++this.id, t)));
    }
    invalidate() {
        this.id++;
    }
}

class ChangeInfo {
    constructor(t, e, i, s) {
        this.gs = t;
        this.ps = e;
        this.xs = i;
        this.ks = s;
    }
    load() {
        if (M(this.gs) || M(this.ps)) {
            return Promise.all([ this.gs, this.ps ]).then((([t, e]) => new LoadedChangeInfo(t, e, this.xs, this.ks)));
        } else {
            return new LoadedChangeInfo(this.gs, this.ps, this.xs, this.ks);
        }
    }
}

class LoadedChangeInfo {
    constructor(t, e, i, s) {
        this.gs = t;
        this.ps = e;
        this.xs = i;
        this.ks = s;
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

const yn = /*@__PURE__*/ Be("ISanitizer", (t => t.singleton(class {
    sanitize() {
        throw createMappedError(99, "sanitize");
    }
})));

class SanitizeValueConverter {
    constructor() {
        this.Cs = g(yn);
    }
    toView(t) {
        if (t == null) {
            return null;
        }
        return this.Cs.sanitize(t);
    }
}

SanitizeValueConverter.$au = {
    type: Qe,
    name: "sanitize"
};

class Show {
    constructor() {
        this.el = g(We);
        this.p = g($e);
        this.Bs = false;
        this.L = null;
        this.$val = "";
        this.$prio = "";
        this.update = () => {
            this.L = null;
            if (Boolean(this.value) !== this.Ss) {
                if (this.Ss === this.As) {
                    this.Ss = !this.As;
                    this.$val = this.el.style.getPropertyValue("display");
                    this.$prio = this.el.style.getPropertyPriority("display");
                    this.el.style.setProperty("display", "none", "important");
                } else {
                    this.Ss = this.As;
                    this.el.style.setProperty("display", this.$val, this.$prio);
                    if (this.el.getAttribute("style") === "") {
                        this.el.removeAttribute("style");
                    }
                }
            }
        };
        const t = g(K);
        this.Ss = this.As = t.alias !== "hide";
    }
    binding() {
        this.Bs = true;
        this.update();
    }
    detaching() {
        this.Bs = false;
        this.L?.cancel();
        this.L = null;
    }
    valueChanged() {
        if (this.Bs && this.L === null) {
            this.L = this.p.domQueue.queueTask(this.update);
        }
    }
}

Show.$au = {
    type: ze,
    name: "show",
    bindables: [ "value" ],
    aliases: [ "hide" ]
};

const wn = [ Us, Ot, NodeObserverLocator ];

const bn = [ et, it, st, fi ];

const kn = [ nt, ot ];

const Cn = [ rt, lt, ht, at, ct, ut, ft, dt, mt, gt, pt, vt, xt ];

const Bn = [ DebounceBindingBehavior, OneTimeBindingBehavior, ToViewBindingBehavior, FromViewBindingBehavior, SignalBindingBehavior, ThrottleBindingBehavior, TwoWayBindingBehavior, SanitizeValueConverter, If, Else, Repeat, With, Switch, Case, DefaultCase, PromiseTemplateController, PendingTemplateController, FulfilledTemplateController, RejectedTemplateController, PromiseAttributePattern, FulfilledAttributePattern, RejectedAttributePattern, AttrBindingBehavior, SelfBindingBehavior, UpdateTriggerBindingBehavior, AuCompose, Portal, Focus, Show, AuSlot ];

const Sn = [ Ti, Ei, Ai, Ri, bi, ki, Ci, Bi, Si, Di, Vi, Pi, qi, Ii, _i, Li, Fi, Hi ];

const An = /*@__PURE__*/ createConfiguration(r);

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
            return e.register(Re(Mt, i.coercingOptions), jt, ...wn, ...Bn, ...bn, ...Cn, ...Sn);
        },
        customize(e) {
            return createConfiguration(e ?? t);
        }
    };
}

function children(t, i) {
    if (!children.mixed) {
        children.mixed = true;
        At(ChildrenBinding, null);
        lifecycleHooks()(ChildrenLifecycleHooks, null);
    }
    let s;
    const n = ee("dependencies");
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
        this.Rs = void 0;
        this.isBound = false;
        this.obj = e;
        this.cb = i;
        this.Z = s;
        this.Ts = n;
        this.Es = r;
        this.ai = createMutationObserver(this.rs = t, (() => {
            this.Ls();
        }));
    }
    getValue() {
        return this.isBound ? this.Rs : this.Ms();
    }
    setValue(t) {}
    bind() {
        if (this.isBound) {
            return;
        }
        this.isBound = true;
        this.ai.observe(this.rs, {
            childList: true
        });
        this.Rs = this.Ms();
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        this.ai.takeRecords();
        this.ai.disconnect();
        this.Rs = v;
    }
    Ls() {
        this.Rs = this.Ms();
        this.cb?.call(this.obj);
        this.subs.notify(this.Rs, undefined);
    }
    get() {
        throw createMappedError(99, "get");
    }
    Ms() {
        const t = this.Z;
        const e = this.Ts;
        const i = this.Es;
        const s = t === "$all" ? this.rs.childNodes : this.rs.querySelectorAll(`:scope > ${t}`);
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
        this.J = t;
    }
    register(t) {
        Re(Ke, this).register(t);
    }
    hydrating(t, e) {
        const i = this.J;
        const s = i.query ?? "*";
        const n = new ChildrenBinding(e.host, t, t[i.callback ?? `${se(i.name)}Changed`], s, i.filter, i.map);
        if (/[\s>]/.test(s)) {
            throw createMappedError(9989, s);
        }
        ue(t, i.name, {
            enumerable: true,
            configurable: true,
            get: le((() => n.getValue()), {
                getObserver: () => n
            }),
            set: () => {}
        });
        e.addBinding(n);
    }
}

export { AdoptedStyleSheetsStyles, AppRoot, Oe as AppTask, ArrayLikeHandler, AttrBindingBehavior, AttrMapper, AttributeBinding, Vi as AttributeBindingRenderer, AttributeNSAccessor, AuCompose, AuSlot, AuSlotsInfo, Aurelia, ke as Bindable, BindableDefinition, De as BindingBehavior, BindingBehaviorDefinition, BindingModeBehavior, BindingTargetSubscriber, CSSModulesProcessorRegistry, Case, CheckedObserver, ChildrenBinding, ClassAttributeAccessor, ComputedWatcher, ContentBinding, Controller, Ge as CustomAttribute, CustomAttributeDefinition, Ci as CustomAttributeRenderer, $s as CustomElement, CustomElementDefinition, ki as CustomElementRenderer, DataAttributeAccessor, DebounceBindingBehavior, Cn as DefaultBindingLanguage, bn as DefaultBindingSyntax, DefaultCase, wn as DefaultComponents, Sn as DefaultRenderers, Bn as DefaultResources, Else, EventModifier, fi as EventModifierRegistration, ExpressionWatcher, FlushQueue, Focus, FragmentNodeSequence, FromViewBindingBehavior, FulfilledTemplateController, Ws as IAppRoot, He as IAppTask, xi as IAuSlotWatcher, vi as IAuSlotsInfo, js as IAurelia, ks as IController, ui as IEventModifier, Ts as IEventTarget, ei as IFlushQueue, qs as IHistory, Cs as IHydrationContext, ci as IKeyMapping, Ke as ILifecycleHooks, Mi as IListenerBindingOptions, Ps as ILocation, ai as IModifiedEventHandlerCreator, We as INode, $e as IPlatform, Es as IRenderLocation, wi as IRenderer, Gi as IRendering, on as IRepeatableHandler, nn as IRepeatableHandlerResolver, zs as ISVGAnalyzer, yn as ISanitizer, Qi as IShadowDOMGlobalStyles, Ki as IShadowDOMStyleFactory, Xi as IShadowDOMStyles, _e as ISignaler, di as IViewFactory, Ds as IWindow, If, InterpolationBinding, Ri as InterpolationBindingRenderer, InterpolationPartBinding, Ei as IteratorBindingRenderer, LetBinding, Si as LetElementRenderer, Xe as LifecycleHooks, LifecycleHooksDefinition, LifecycleHooksEntry, ListenerBinding, ListenerBindingOptions, Di as ListenerBindingRenderer, ls as MountTarget, NodeObserverLocator, NoopSVGAnalyzer, OneTimeBindingBehavior, PendingTemplateController, Portal, PromiseTemplateController, PropertyBinding, Ti as PropertyBindingRenderer, RefBinding, Ai as RefBindingRenderer, RejectedTemplateController, Rendering, Repeat, Us as RuntimeTemplateCompilerImplementation, SVGAnalyzer, SanitizeValueConverter, SelectValueObserver, SelfBindingBehavior, Pi as SetAttributeRenderer, qi as SetClassAttributeRenderer, bi as SetPropertyRenderer, Ii as SetStyleAttributeRenderer, ShadowDOMRegistry, kn as ShortHandBindingSyntax, SignalBindingBehavior, Fi as SpreadRenderer, An as StandardConfiguration, bs as State, StyleAttributeAccessor, Yi as StyleConfiguration, StyleElementStyles, _i as StylePropertyBindingRenderer, Switch, Bi as TemplateControllerRenderer, Li as TextBindingRenderer, ThrottleBindingBehavior, ToViewBindingBehavior, TwoWayBindingBehavior, UpdateTriggerBindingBehavior, ValueAttributeObserver, Ze as ValueConverter, ValueConverterDefinition, ViewFactory, je as Watch, With, alias, bindable, bindingBehavior, capture, children, coercer, containerless, convertToRenderLocation, cssModules, customAttribute, customElement, getEffectiveParentNode, isCustomElementController, isCustomElementViewModel, isRenderLocation, lifecycleHooks, ti as mixinAstEvaluator, Je as mixinUseScope, ii as mixingBindingLimited, processContent, Ne as refs, registerAliases, registerHostNode, renderer, setEffectiveParentNode, shadowCSS, slotted, templateController, useShadowDOM, valueConverter, watch };
//# sourceMappingURL=index.mjs.map
