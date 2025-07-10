import { Protocol as t, isString as e, createLookup as i, getPrototypeChain as s, kebabCase as n, noop as r, DI as l, Registration as h, firstDefined as a, mergeArrays as c, isFunction as u, resourceBaseName as f, resource as d, getResourceKeyFor as m, resolve as g, IPlatform as p, emptyArray as v, ILogger as x, registrableMetadataKey as y, isArray as w, all as b, isObject as k, own as C, InstanceProvider as B, IContainer as S, toArray as A, areEqual as R, optionalResource as T, optional as E, onResolveAll as L, isPromise as M, onResolve as D, fromDefinitionOrDefault as P, pascalCase as q, fromAnnotationOrDefinitionOrTypeOrDefault as I, fromAnnotationOrTypeOrDefault as _, isSymbol as V, createImplementationRegister as F, IServiceLocator as H, emptyObject as O, isNumber as $, isSet as N, isMap as W, transient as j } from "@aurelia/kernel";

import { BindingMode as z, InstructionType as U, ITemplateCompiler as G, IInstruction as X, TemplateCompilerHooks as K, IAttrMapper as Q, IResourceResolver as Y, TemplateCompiler as Z, AttributePattern as J, AttrSyntax as tt, RefAttributePattern as et, DotSeparatedAttributePattern as it, EventAttributePattern as st, AtPrefixedTriggerAttributePattern as nt, ColonPrefixedBindAttributePattern as rt, DefaultBindingCommand as ot, OneTimeBindingCommand as lt, FromViewBindingCommand as ht, ToViewBindingCommand as at, TwoWayBindingCommand as ct, ForBindingCommand as ut, RefBindingCommand as ft, TriggerBindingCommand as dt, CaptureBindingCommand as mt, ClassBindingCommand as gt, StyleBindingCommand as pt, AttrBindingCommand as vt, SpreadValueBindingCommand as xt } from "@aurelia/template-compiler";

export { BindingCommand, BindingMode } from "@aurelia/template-compiler";

import { Metadata as yt } from "@aurelia/metadata";

import { AccessorType as wt, astEvaluate as bt, queueAsyncTask as kt, queueTask as Ct, astBind as Bt, astUnbind as St, connectable as At, astAssign as Rt, subscriberCollection as Tt, Scope as Et, IObserverLocator as Lt, ConnectableSwitcher as Mt, ProxyObservable as Dt, ICoercionConfiguration as Pt, tasksSettled as qt, PropertyAccessor as It, INodeObserverLocator as _t, IDirtyChecker as Vt, getObserverLookup as Ft, SetterObserver as Ht, createIndexMap as Ot, getCollectionObserver as $t, BindingContext as Nt, DirtyChecker as Wt } from "@aurelia/runtime";

import { BrowserPlatform as jt } from "@aurelia/platform-browser";

import { AccessScopeExpression as zt, IExpressionParser as Ut, ExpressionParser as Gt } from "@aurelia/expression-parser";

typeof SuppressedError === "function" ? SuppressedError : function(t, e, i) {
    var s = new Error(i);
    return s.name = "SuppressedError", s.error = t, s.suppressed = e, s;
};

const {default: Xt, oneTime: Kt, toView: Qt, fromView: Yt, twoWay: Zt} = z;

const Jt = yt.get;

const te = yt.has;

const ee = yt.define;

const {annotation: ie} = t;

const se = ie.keyFor;

const ne = Object;

const re = String;

const oe = ne.prototype;

const le = oe.hasOwnProperty;

const he = ne.freeze;

const ae = ne.assign;

const ce = ne.getOwnPropertyNames;

const ue = ne.keys;

const fe = /*@__PURE__*/ i();

const isDataAttribute = (t, i, s) => {
    if (fe[i] === true) {
        return true;
    }
    if (!e(i)) {
        return false;
    }
    const n = i.slice(0, 5);
    return fe[i] = n === "aria-" || n === "data-" || s.isStandardSvgAttribute(t, i);
};

const rethrow = t => {
    throw t;
};

const de = Reflect.defineProperty;

const defineHiddenProp = (t, e, i) => {
    de(t, e, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: i
    });
    return i;
};

const addSignalListener = (t, e, i) => t.addSignalListener(e, i);

const removeSignalListener = (t, e, i) => t.removeSignalListener(e, i);

const me = "Interpolation";

const ge = "IsIterator";

const pe = "IsFunction";

const ve = "IsProperty";

const xe = "pending";

const ye = "running";

const we = wt.Observer;

const be = wt.Node;

const ke = wt.Layout;

const createMappedError = (t, ...e) => {
    const i = re(t).padStart(4, "0");
    return new Error(`AUR${i}:${e.map(re)}`);
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
        const l = e.metadata[Ce] ??= i();
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

const Ce = /*@__PURE__*/ se("bindables");

const Be = he({
    name: Ce,
    keyFrom: t => `${Ce}:${t}`,
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
                ue(t).forEach(e => addDescription(e, t[e]));
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
            const t = Jt(Ce, r);
            if (t == null) continue;
            e.push(...Object.values(t));
        }
        return e;
    },
    i(t, e) {
        let s = Jt(Ce, e);
        if (s == null) {
            ee(s = i(), e, Ce);
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
        const s = i.mode ?? Qt;
        return new BindableDefinition(i.attribute ?? n(t), i.callback ?? `${t}Changed`, e(s) ? z[s] ?? Xt : s, i.primary ?? false, i.name ?? t, i.set ?? getInterceptor(i));
    }
}

function coercer(t, e) {
    e.addInitializer(function() {
        Se.define(this, e.name);
    });
}

const Se = {
    key: /*@__PURE__*/ se("coercer"),
    define(t, e) {
        ee(t[e].bind(t), t, Se.key);
    },
    for(t) {
        return Jt(Se.key, t);
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
            i = typeof t === "function" ? t.bind(e) : Se.for(e) ?? r;
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

const Ae = l.createInterface;

const Re = h.singleton;

const Te = h.aliasTo;

const Ee = h.instance;

h.callback;

h.transient;

const registerResolver = (t, e, i) => t.registerResolver(e, i);

function alias(...t) {
    return function(e, i) {
        i.addInitializer(function() {
            const e = se("aliases");
            const i = Jt(e, this);
            if (i === void 0) {
                ee(t, this, e);
            } else {
                i.push(...t);
            }
        });
    };
}

function registerAliases(t, e, i, s) {
    for (let n = 0, r = t.length; n < r; ++n) {
        Te(i, e.keyFrom(t[n])).register(s);
    }
}

const Le = "custom-element";

const Me = "custom-attribute";

const getDefinitionFromStaticAu = (t, e, i, s = "__au_static_resource__") => {
    let n = Jt(s, t);
    if (n == null) {
        if (t.$au?.type === e) {
            n = i(t.$au, t);
            ee(n, t, s);
        }
    }
    return n;
};

function bindingBehavior(t) {
    return function(e, i) {
        i.addInitializer(function() {
            qe.define(t, this);
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
        return new BindingBehaviorDefinition(i, a(getBehaviorAnnotation(i, "name"), s), c(getBehaviorAnnotation(i, "aliases"), n.aliases, i.aliases), qe.keyFrom(s));
    }
    register(t, e) {
        const i = this.Type;
        const s = typeof e === "string" ? getBindingBehaviorKeyFrom(e) : this.key;
        const n = this.aliases;
        if (!t.has(s, false)) {
            t.register(t.has(i, false) ? null : Re(i, i), Te(i, s), ...n.map(t => Te(i, getBindingBehaviorKeyFrom(t))));
        }
    }
}

const De = "binding-behavior";

const Pe = /*@__PURE__*/ m(De);

const getBehaviorAnnotation = (t, e) => Jt(se(e), t);

const getBindingBehaviorKeyFrom = t => `${Pe}:${t}`;

const qe = /*@__PURE__*/ he({
    name: Pe,
    keyFrom: getBindingBehaviorKeyFrom,
    isType(t) {
        return u(t) && (te(Pe, t) || t.$au?.type === De);
    },
    define(t, e) {
        const i = BindingBehaviorDefinition.create(t, e);
        const s = i.Type;
        ee(i, s, Pe, f);
        return s;
    },
    getDefinition(t) {
        const e = Jt(Pe, t) ?? getDefinitionFromStaticAu(t, De, BindingBehaviorDefinition.create);
        if (e === void 0) {
            throw createMappedError(151, t);
        }
        return e;
    },
    find(t, e) {
        const i = t.find(De, e);
        return i == null ? null : Jt(Pe, i) ?? getDefinitionFromStaticAu(i, De, BindingBehaviorDefinition.create) ?? null;
    },
    get(t, e) {
        return t.get(d(getBindingBehaviorKeyFrom(e)));
    }
});

const Ie = new Map;

const createConfig = t => ({
    type: De,
    name: t
});

class BindingModeBehavior {
    bind(t, e) {
        Ie.set(e, e.mode);
        e.mode = this.mode;
    }
    unbind(t, e) {
        e.mode = Ie.get(e);
        Ie.delete(e);
    }
}

class OneTimeBindingBehavior extends BindingModeBehavior {
    get mode() {
        return Kt;
    }
}

OneTimeBindingBehavior.$au = createConfig("oneTime");

class ToViewBindingBehavior extends BindingModeBehavior {
    get mode() {
        return Qt;
    }
}

ToViewBindingBehavior.$au = createConfig("toView");

class FromViewBindingBehavior extends BindingModeBehavior {
    get mode() {
        return Yt;
    }
}

FromViewBindingBehavior.$au = createConfig("fromView");

class TwoWayBindingBehavior extends BindingModeBehavior {
    get mode() {
        return Zt;
    }
}

TwoWayBindingBehavior.$au = createConfig("twoWay");

const _e = new WeakMap;

const Ve = 200;

class DebounceBindingBehavior {
    constructor() {
        this.p = g(p);
    }
    bind(t, i, s, n) {
        const r = {
            type: "debounce",
            delay: s ?? Ve,
            now: this.p.performanceNow,
            queue: this.p.taskQueue,
            signals: e(n) ? [ n ] : n ?? v
        };
        const l = i.limit?.(r);
        if (l == null) ; else {
            _e.set(i, l);
        }
    }
    unbind(t, e) {
        _e.get(e)?.dispose();
        _e.delete(e);
    }
}

DebounceBindingBehavior.$au = {
    type: De,
    name: "debounce"
};

const Fe = /*@__PURE__*/ Ae("ISignaler", t => t.singleton(Signaler));

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
        this.u = g(Fe);
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
    type: De,
    name: "signal"
};

const He = new WeakMap;

const Oe = 200;

class ThrottleBindingBehavior {
    constructor() {
        ({performanceNow: this.C, taskQueue: this.B} = g(p));
    }
    bind(t, i, s, n) {
        const r = {
            type: "throttle",
            delay: s ?? Oe,
            now: this.C,
            queue: this.B,
            signals: e(n) ? [ n ] : n ?? v
        };
        const l = i.limit?.(r);
        if (l == null) ; else {
            He.set(i, l);
        }
    }
    unbind(t, e) {
        He.get(e)?.dispose();
        He.delete(e);
    }
}

ThrottleBindingBehavior.$au = {
    type: De,
    name: "throttle"
};

const $e = /*@__PURE__*/ Ae("IAppTask");

class $AppTask {
    constructor(t, e, i) {
        this.c = void 0;
        this.slot = t;
        this.k = e;
        this.cb = i;
    }
    register(t) {
        return this.c = t.register(Ee($e, this));
    }
    run() {
        const t = this.k;
        const e = this.cb;
        return t === null ? e() : e(this.c.get(t));
    }
}

const Ne = he({
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

const We = p;

class Refs {}

const je = /*@__PURE__*/ (() => {
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

const ze = /*@__PURE__*/ Ae("INode");

function watch(t, e, i) {
    if (t == null) {
        throw createMappedError(772);
    }
    return function decorator(s, n) {
        const r = n.kind === "class";
        let l;
        let h;
        if (r) {
            if (!u(e) && (e == null || !(e in s.prototype))) {
                throw createMappedError(773, `${re(e)}@${s.name}}`);
            }
            h = e;
            l = i ?? {};
        } else {
            if (!u(s) || n.static) {
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
            Ue.add(t, a);
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

const Ue = /*@__PURE__*/ (() => {
    const t = new WeakMap;
    return he({
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
        return Me;
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
        const r = a(getAttributeAnnotation(i, "defaultBindingMode"), n.defaultBindingMode, i.defaultBindingMode, Qt);
        for (const t of Object.values(Be.from(n.bindables))) {
            Be.i(t, i);
        }
        return new CustomAttributeDefinition(i, a(getAttributeAnnotation(i, "name"), s), c(getAttributeAnnotation(i, "aliases"), n.aliases, i.aliases), getAttributeKeyFrom(s), e(r) ? z[r] ?? Xt : r, a(getAttributeAnnotation(i, "isTemplateController"), n.isTemplateController, i.isTemplateController, false), Be.from(...Be.getAll(i), getAttributeAnnotation(i, "bindables"), i.bindables, n.bindables), a(getAttributeAnnotation(i, "noMultiBindings"), n.noMultiBindings, i.noMultiBindings, false), c(Ue.getDefinitions(i), i.watches), c(getAttributeAnnotation(i, "dependencies"), n.dependencies, i.dependencies), a(getAttributeAnnotation(i, "containerStrategy"), n.containerStrategy, i.containerStrategy, "reuse"));
    }
    register(t, e) {
        const i = this.Type;
        const s = typeof e === "string" ? getAttributeKeyFrom(e) : this.key;
        const n = this.aliases;
        if (!t.has(s, false)) {
            t.register(t.has(i, false) ? null : Re(i, i), Te(i, s), ...n.map(t => Te(i, getAttributeKeyFrom(t))));
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

const Ge = "custom-attribute";

const Xe = /*@__PURE__*/ m(Ge);

const getAttributeKeyFrom = t => `${Xe}:${t}`;

const getAttributeAnnotation = (t, e) => Jt(se(e), t);

const isAttributeType = t => u(t) && (te(Xe, t) || t.$au?.type === Ge);

const findAttributeControllerFor = (t, e) => je.get(t, getAttributeKeyFrom(e)) ?? void 0;

const defineAttribute = (t, e) => {
    const i = CustomAttributeDefinition.create(t, e);
    const s = i.Type;
    ee(i, s, Xe, f);
    return s;
};

const getAttributeDefinition = t => {
    const e = Jt(Xe, t) ?? getDefinitionFromStaticAu(t, Ge, CustomAttributeDefinition.create);
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
        const t = je.get(r, s);
        if (t?.is(n)) {
            return t;
        }
        r = getEffectiveParentNode(r);
    }
    return null;
};

const Ke = /*@__PURE__*/ he({
    name: Xe,
    keyFrom: getAttributeKeyFrom,
    isType: isAttributeType,
    for: findAttributeControllerFor,
    closest: findClosestControllerByName,
    define: defineAttribute,
    getDefinition: getAttributeDefinition,
    annotate(t, e, i) {
        ee(i, t, se(e));
    },
    getAnnotation: getAttributeAnnotation,
    find(t, e) {
        const i = t.find(Ge, e);
        return i === null ? null : Jt(Xe, i) ?? getDefinitionFromStaticAu(i, Ge, CustomAttributeDefinition.create) ?? null;
    }
});

const Qe = /*@__PURE__*/ Ae("ILifecycleHooks");

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
        while (s !== oe) {
            for (const t of ce(s)) {
                if (t !== "constructor" && !t.startsWith("_")) {
                    i.add(t);
                }
            }
            s = Object.getPrototypeOf(s);
        }
        return new LifecycleHooksDefinition(e, i);
    }
}

const Ye = /*@__PURE__*/ (() => {
    const t = new WeakMap;
    const e = new WeakMap;
    return he({
        define(t, i) {
            const s = LifecycleHooksDefinition.create(t, i);
            const n = s.Type;
            e.set(n, s);
            return {
                register(t) {
                    Re(Qe, n).register(t);
                }
            };
        },
        resolve(i) {
            let s = t.get(i);
            if (s === void 0) {
                t.set(i, s = new LifecycleHooksLookupImpl);
                const n = i.root;
                const r = n === i ? i.getAll(Qe) : i.has(Qe, false) ? n.getAll(Qe).concat(i.getAll(Qe)) : n.getAll(Qe);
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
        i[y] = Ye.define({}, t);
        return t;
    }
    return t == null ? decorator : decorator(t, e);
}

function valueConverter(t) {
    return function(e, i) {
        i.addInitializer(function() {
            ti.define(t, this);
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
        return new ValueConverterDefinition(i, a(getConverterAnnotation(i, "name"), s), c(getConverterAnnotation(i, "aliases"), n.aliases, i.aliases), ti.keyFrom(s));
    }
    register(t, e) {
        const i = this.Type;
        const s = typeof e === "string" ? getValueConverterKeyFrom(e) : this.key;
        const n = this.aliases;
        if (!t.has(s, false)) {
            t.register(t.has(i, false) ? null : Re(i, i), Te(i, s), ...n.map(t => Te(i, getValueConverterKeyFrom(t))));
        }
    }
}

const Ze = "value-converter";

const Je = /*@__PURE__*/ m(Ze);

const getConverterAnnotation = (t, e) => Jt(se(e), t);

const getValueConverterKeyFrom = t => `${Je}:${t}`;

const ti = he({
    name: Je,
    keyFrom: getValueConverterKeyFrom,
    isType(t) {
        return u(t) && (te(Je, t) || t.$au?.type === Ze);
    },
    define(t, e) {
        const i = ValueConverterDefinition.create(t, e);
        const s = i.Type;
        ee(i, s, Je, f);
        return s;
    },
    getDefinition(t) {
        const e = Jt(Je, t) ?? getDefinitionFromStaticAu(t, Ze, ValueConverterDefinition.create);
        if (e === void 0) {
            throw createMappedError(152, t);
        }
        return e;
    },
    annotate(t, e, i) {
        ee(i, t, se(e));
    },
    getAnnotation: getConverterAnnotation,
    find(t, e) {
        const i = t.find(Ze, e);
        return i == null ? null : Jt(Je, i) ?? getDefinitionFromStaticAu(i, Ze, ValueConverterDefinition.create) ?? null;
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
        if (this.b.isBound) {
            this.b.updateSource(this.v);
        }
    }
    handleChange(t, e) {
        const i = this.b;
        if (t !== bt(i.ast, i.s, i, null)) {
            this.v = t;
            this.A.add(this);
        }
    }
}

const ei = /*@__PURE__*/ (() => {
    function useScope(t) {
        this.s = t;
    }
    return t => {
        defineHiddenProp(t.prototype, "useScope", useScope);
    };
})();

const ii = /*@__PURE__*/ (() => {
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
        return s[i] ??= qe.get(t.l, i);
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
        return s[i] ??= ti.get(e.l, i);
    }
    function evaluatorBindConverter(t) {
        const e = evaluatorGetConverter(this, t);
        if (e == null) {
            throw createMappedError(103, t);
        }
        const i = e.signals;
        if (i != null) {
            const t = this.l.get(Fe);
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
        const i = this.l.get(Fe);
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
            const t = this.l.get(ws);
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

const si = /*@__PURE__*/ Ae("IFlushQueue", t => t.singleton(FlushQueue));

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

const ni = /*@__PURE__*/ (() => {
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
                s = kt(callOriginalCallback, {
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
            l = s?.status === xe;
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
                    s = kt(() => {
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
            a = s?.status === xe;
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
            const r = n.length > 0 ? this.get(Fe) : null;
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

const ri = ((t = new WeakSet) => e => function() {
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
        this.L = false;
        this.v = void 0;
        this.boundFn = false;
        this.M = false;
        this.l = e;
        this.ast = s;
        this.P = t;
        this.target = n;
        this.oL = i;
        if ((this.M = l.indexOf(" ") > -1) && !AttributeBinding.q.has(l)) {
            AttributeBinding.q.set(l, l.split(" "));
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
                let r = re(t);
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
                    i.setAttribute(s, re(t));
                }
            }
        }
    }
    handleChange() {
        if (!this.isBound) return;
        if (this.L) return;
        this.L = true;
        Ct(() => {
            this.L = false;
            if (!this.isBound) return;
            this.obs.version++;
            const t = bt(this.ast, this.s, this, (this.mode & Qt) > 0 ? this : null);
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
        Bt(this.ast, t, this);
        if (this.mode & (Qt | Kt)) {
            this.updateTarget(this.v = bt(this.ast, t, this, (this.mode & Qt) > 0 ? this : null));
        }
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) return;
        this.isBound = false;
        St(this.ast, this.s, this);
        this.s = void 0;
        this.v = void 0;
        this.obs.clearAll();
    }
}

AttributeBinding.mix = ri(() => {
    ei(AttributeBinding);
    ni(AttributeBinding, () => "updateTarget");
    At(AttributeBinding, null);
    ii(AttributeBinding);
});

AttributeBinding.q = new Map;

class InterpolationBinding {
    constructor(t, e, i, s, n, r, l, h) {
        this.ast = s;
        this.target = n;
        this.targetProperty = r;
        this.mode = l;
        this.strict = h;
        this.isBound = false;
        this.s = void 0;
        this.L = false;
        this.P = t;
        this.oL = i;
        this.I = i.getAccessor(n, r);
        const a = s.expressions;
        const c = this.partBindings = Array(a.length);
        const u = a.length;
        let f = 0;
        for (;u > f; ++f) {
            c[f] = new InterpolationPartBinding(a[f], n, r, e, i, h, this);
        }
    }
    _() {
        if (!this.isBound) return;
        const t = this.P.state !== fs && (this.I.type & ke) > 0;
        if (t) {
            if (this.L) return;
            this.L = true;
            Ct(() => {
                this.L = false;
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
            l = n[0] + t[0].V() + n[1];
        } else {
            l = n[0];
            for (;r > h; ++h) {
                l += t[h].V() + n[h + 1];
            }
        }
        this.I.setValue(l, i, s);
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
        this.mode = Qt;
        this.isBound = false;
        this.v = "";
        this.boundFn = false;
        this.D = false;
        this.l = s;
        this.oL = n;
    }
    updateTarget() {
        this.owner._();
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
    V() {
        if (!this.D) return this.v;
        this.obs.version++;
        const t = bt(this.ast, this.s, this, (this.mode & Qt) > 0 ? this : null);
        this.obs.clear();
        this.v = t;
        if (w(t)) {
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
        Bt(this.ast, t, this);
        this.v = bt(this.ast, this.s, this, (this.mode & Qt) > 0 ? this : null);
        if (w(this.v)) {
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
        St(this.ast, this.s, this);
        this.s = void 0;
        this.obs.clearAll();
    }
}

InterpolationPartBinding.mix = ri(() => {
    ei(InterpolationPartBinding);
    ni(InterpolationPartBinding, () => "updateTarget");
    At(InterpolationPartBinding, null);
    ii(InterpolationPartBinding);
});

class ContentBinding {
    constructor(t, e, i, s, n, r, l) {
        this.p = s;
        this.ast = n;
        this.target = r;
        this.strict = l;
        this.isBound = false;
        this.mode = Qt;
        this.L = false;
        this.v = "";
        this.F = false;
        this.boundFn = false;
        this.l = e;
        this.P = t;
        this.oL = i;
    }
    updateTarget(t) {
        const e = this.target;
        const i = this.v;
        this.v = t;
        if (this.F) {
            i.parentNode?.removeChild(i);
            this.F = false;
        }
        if (t instanceof this.p.Node) {
            e.parentNode?.insertBefore(t, e);
            t = "";
            this.F = true;
        }
        e.textContent = re(t ?? "");
    }
    handleChange() {
        if (!this.isBound) return;
        if (this.L) return;
        this.L = true;
        Ct(() => {
            this.L = false;
            if (!this.isBound) return;
            this.obs.version++;
            const t = bt(this.ast, this.s, this, (this.mode & Qt) > 0 ? this : null);
            this.obs.clear();
            if (t !== this.v) {
                this.updateTarget(t);
            }
        });
    }
    handleCollectionChange() {
        if (!this.isBound) return;
        if (this.L) return;
        this.L = true;
        Ct(() => {
            this.L = false;
            if (!this.isBound) return;
            this.obs.version++;
            const t = this.v = bt(this.ast, this.s, this, (this.mode & Qt) > 0 ? this : null);
            this.obs.clear();
            if (w(t)) {
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
        Bt(this.ast, t, this);
        const e = this.v = bt(this.ast, this.s, this, (this.mode & Qt) > 0 ? this : null);
        if (w(e)) {
            this.observeCollection(e);
        }
        this.updateTarget(e);
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) return;
        this.isBound = false;
        St(this.ast, this.s, this);
        if (this.F) {
            this.v.parentNode?.removeChild(this.v);
        }
        this.s = void 0;
        this.obs.clearAll();
    }
}

ContentBinding.mix = ri(() => {
    ei(ContentBinding);
    ni(ContentBinding, () => "updateTarget");
    At(ContentBinding, null);
    ii(ContentBinding);
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
        this.H = n;
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
        this.target = this.H ? t.bindingContext : t.overrideContext;
        Bt(this.ast, t, this);
        this.v = bt(this.ast, this.s, this, this);
        this.updateTarget();
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) return;
        this.isBound = false;
        St(this.ast, this.s, this);
        this.s = void 0;
        this.obs.clearAll();
    }
}

LetBinding.mix = ri(() => {
    ei(LetBinding);
    ni(LetBinding, () => "updateTarget");
    At(LetBinding, null);
    ii(LetBinding);
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
        this.I = void 0;
        this.L = false;
        this.O = null;
        this.boundFn = false;
        this.l = e;
        this.P = t;
        this.oL = i;
    }
    updateTarget(t) {
        this.I.setValue(t, this.target, this.targetProperty);
    }
    updateSource(t) {
        Rt(this.ast, this.s, this, null, t);
    }
    handleChange() {
        if (!this.isBound) return;
        const t = this.P.state !== fs && (this.I.type & ke) > 0;
        if (t) {
            if (this.L) return;
            this.L = true;
            Ct(() => {
                this.L = false;
                if (!this.isBound) return;
                this.$();
            });
        } else {
            this.$();
        }
    }
    $() {
        this.obs.version++;
        const t = bt(this.ast, this.s, this, (this.mode & Qt) > 0 ? this : null);
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
        Bt(this.ast, t, this);
        const e = this.oL;
        const i = this.mode;
        let s = this.I;
        if (!s) {
            if (i & Yt) {
                s = e.getObserver(this.target, this.targetProperty);
            } else {
                s = e.getAccessor(this.target, this.targetProperty);
            }
            this.I = s;
        }
        const n = (i & Qt) > 0;
        if (i & (Qt | Kt)) {
            this.updateTarget(bt(this.ast, this.s, this, n ? this : null));
        }
        if (i & Yt) {
            s.subscribe(this.O ??= new BindingTargetSubscriber(this, this.l.get(si)));
            if (!n) {
                this.updateSource(s.getValue(this.target, this.targetProperty));
            }
        }
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) return;
        this.isBound = false;
        if (this.O) {
            this.I.unsubscribe(this.O);
            this.O = null;
        }
        St(this.ast, this.s, this);
        this.s = void 0;
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

PropertyBinding.mix = ri(() => {
    ei(PropertyBinding);
    ni(PropertyBinding, t => t.mode & Yt ? "updateSource" : "updateTarget");
    At(PropertyBinding, null);
    ii(PropertyBinding);
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
            Rt(this.ast, this.s, this, this, this.target);
            this.obs.clear();
        } else {
            Rt(this.ast, this.s, this, null, null);
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
        Bt(this.ast, t, this);
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
        St(this.ast, this.s, this);
        this.s = void 0;
    }
}

RefBinding.mix = ri(() => {
    At(RefBinding, null);
    ni(RefBinding, () => "updateSource");
    ei(RefBinding);
    ii(RefBinding);
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
        this.N = null;
        this.l = t;
        this.W = n;
        this.N = r;
    }
    callSource(t) {
        const e = this.s.overrideContext;
        e.$event = t;
        let i = bt(this.ast, this.s, this, null);
        delete e.$event;
        if (u(i)) {
            i = i(t);
        }
        if (i !== true && this.W.prevent) {
            t.preventDefault();
        }
    }
    handleEvent(t) {
        if (this.self) {
            if (this.target !== t.composedPath()[0]) {
                return;
            }
        }
        if (this.N?.(t) !== false) {
            try {
                this.callSource(t);
            } catch (e) {
                this.W.onError(t, e);
            }
        }
    }
    bind(t) {
        if (this.isBound) {
            if (this.s === t) return;
            this.unbind();
        }
        this.s = t;
        Bt(this.ast, t, this);
        this.target.addEventListener(this.targetEvent, this, this.W);
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) return;
        this.isBound = false;
        St(this.ast, this.s, this);
        this.s = void 0;
        this.target.removeEventListener(this.targetEvent, this, this.W);
    }
}

ListenerBinding.mix = ri(function() {
    ei(ListenerBinding);
    ni(ListenerBinding, () => "callSource");
    ii(ListenerBinding);
});

const oi = /*@__PURE__*/ Ae("IEventModifier");

const li = /*@__PURE__*/ Ae("IKeyMapping", t => t.instance({
    meta: he([ "ctrl", "alt", "shift", "meta" ]),
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
        this.j = g(li);
        this.U = [ "left", "middle", "right" ];
    }
    static register(t) {
        t.register(Re(oi, ModifiedMouseEventHandler));
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
                    if (t.button !== this.U.indexOf(n)) return false;
                    continue;
                }
                if (this.j.meta.includes(n) && t[`${n}Key`] !== true) {
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
        this.j = g(li);
        this.type = [ "keydown", "keyup" ];
    }
    static register(t) {
        t.register(Re(oi, ModifiedKeyboardEventHandler));
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
                if (this.j.meta.includes(n)) {
                    if (t[`${n}Key`] !== true) {
                        return false;
                    }
                    continue;
                }
                const e = this.j.keys[n];
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
        t.register(Re(oi, ModifiedEventHandler));
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

const hi = /*@__PURE__*/ Ae("IEventModifierHandler", t => t.instance({
    getHandler: () => null
}));

class EventModifier {
    constructor() {
        this.G = g(b(oi)).reduce((t, e) => {
            const i = w(e.type) ? e.type : [ e.type ];
            i.forEach(i => t[i] = e);
            return t;
        }, {});
    }
    static register(t) {
        t.register(Re(hi, EventModifier));
    }
    getHandler(t, i) {
        return e(i) ? (this.G[t] ?? this.G.$ALL)?.getHandler(i) ?? null : null;
    }
}

const ai = {
    register(t) {
        t.register(EventModifier, ModifiedMouseEventHandler, ModifiedKeyboardEventHandler, ModifiedEventHandler);
    }
};

const ci = /*@__PURE__*/ Ae("IViewFactory");

class ViewFactory {
    constructor(t, e) {
        this.isCaching = false;
        this.X = null;
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
            this.X = [];
        } else {
            this.X = null;
        }
        this.isCaching = this.K > 0;
    }
    canReturnToCache(t) {
        return this.X != null && this.X.length < this.K;
    }
    tryReturnToCache(t) {
        if (this.canReturnToCache(t)) {
            this.X.push(t);
            return true;
        }
        return false;
    }
    create(t) {
        const e = this.X;
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

const ui = /*@__PURE__*/ (() => {
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

const fi = "default";

const di = "au-slot";

const mi = /*@__PURE__*/ Ae("IAuSlotsInfo");

class AuSlotsInfo {
    constructor(t) {
        this.projectedSlots = t;
    }
}

const gi = /*@__PURE__*/ Ae("IAuSlotWatcher");

class AuSlotWatcherBinding {
    constructor(t, e, i, s) {
        this.Y = new Set;
        this.Z = v;
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
        Ee(Qe, this).register(t);
    }
    hydrating(t, e) {
        const i = this.tt;
        const s = new AuSlotWatcherBinding(t, i.callback ?? `${re(i.name)}Changed`, i.slotName ?? "default", i.query ?? "*");
        de(t, i.name, {
            enumerable: true,
            configurable: true,
            get: ae(() => s.getValue(), {
                getObserver: () => s
            }),
            set: () => {}
        });
        Ee(gi, s).register(e.container);
        e.addBinding(s);
    }
}

function slotted(t, e) {
    if (!pi) {
        pi = true;
        Tt(AuSlotWatcherBinding, null);
        lifecycleHooks()(SlottedLifecycleHooks, null);
    }
    const i = se("dependencies");
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

let pi = false;

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
        if (t.vmKind !== as) {
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
        this.P = t;
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
        Bt(this.ast, t, this);
        const e = bt(this.ast, t, this, this);
        this.rt(e, false);
    }
    unbind() {
        if (!this.isBound) return;
        this.isBound = false;
        St(this.ast, this.s, this);
        this.s = void 0;
        let t;
        for (t in this.st) {
            this.st[t].unbind();
        }
    }
    rt(t, e) {
        let i;
        if (!k(t)) {
            for (i in this.st) {
                this.st[i]?.unbind();
            }
            return;
        }
        let s;
        let n = this.nt.get(t);
        if (n == null) {
            this.nt.set(t, n = Et.fromParent(this.s, t));
        }
        for (i of this.targetKeys) {
            s = this.st[i];
            if (i in t) {
                if (s == null) {
                    s = this.st[i] = new PropertyBinding(this.P, this.l, this.oL, SpreadValueBinding.ot[i] ??= new zt(i, 0), this.target, i, z.toView, this.strict);
                }
                s.bind(n);
            } else if (e) {
                s?.unbind();
            }
        }
    }
}

SpreadValueBinding.mix = ri(() => {
    ei(SpreadValueBinding);
    ni(SpreadValueBinding, () => "updateTarget");
    At(SpreadValueBinding, null);
    ii(SpreadValueBinding);
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
        this.type = be | ke;
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
        return i.get(ws).controller.container.get(C(t));
    }
});

const vi = /*@__PURE__*/ Ae("IRenderer");

function renderer(t, e) {
    const i = e?.metadata ?? (t[Symbol.metadata] ??= Object.create(null));
    i[y] = {
        register(e) {
            Re(vi, t).register(e);
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

const xi = /*@__PURE__*/ renderer(class SetPropertyRenderer {
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

const yi = /*@__PURE__*/ renderer(class CustomElementRenderer {
    constructor() {
        this.r = g(ji);
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
            l = Fs.find(f, c);
            if (l == null) {
                throw createMappedError(752, i, t);
            }
            break;

          default:
            l = c;
        }
        const d = i.containerless || l.containerless;
        const m = d ? convertToRenderLocation(e) : null;
        const g = createElementContainer(s, t, e, i, m, u == null ? void 0 : new AuSlotsInfo(ue(u)));
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

const wi = /*@__PURE__*/ renderer(class CustomAttributeRenderer {
    constructor() {
        this.r = g(ji);
        this.target = U.hydrateAttribute;
    }
    render(t, e, i, s, n, r) {
        let l = t.container;
        let h;
        switch (typeof i.res) {
          case "string":
            h = Ke.find(l, i.res);
            if (h == null) {
                throw createMappedError(753, i, t);
            }
            break;

          default:
            h = i.res;
        }
        const a = invokeAttribute(s, h, t, e, i, void 0, void 0);
        const c = Controller.$attr(a.ctn, a.vm, e, h);
        je.set(e, h.key, c);
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
        this.r = g(ji);
        this.target = U.hydrateTemplateController;
    }
    render(t, e, i, s, n, r) {
        let l = t.container;
        let h;
        switch (typeof i.res) {
          case "string":
            h = Ke.find(l, i.res);
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
        je.set(c, h.key, f);
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

const ki = /*@__PURE__*/ renderer(class LetElementRenderer {
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
            f = ensureExpression(n, u.from, ve);
            t.addBinding(new LetBinding(a, r, f, u.to, h, t.strict ?? false));
            ++d;
        }
    }
}, null);

const Ci = /*@__PURE__*/ renderer(class RefBindingRenderer {
    constructor() {
        this.target = U.refBinding;
        RefBinding.mix();
    }
    render(t, e, i, s, n, r) {
        t.addBinding(new RefBinding(t.container, r, ensureExpression(n, i.from, ve), getRefTarget(e, i.to), t.strict ?? false));
    }
}, null);

const Bi = /*@__PURE__*/ renderer(class InterpolationBindingRenderer {
    constructor() {
        this.target = U.interpolation;
        InterpolationPartBinding.mix();
    }
    render(t, e, i, s, n, r) {
        const l = t.container;
        const h = new InterpolationBinding(t, l, r, ensureExpression(n, i.from, me), getTarget(e), i.to, Qt, t.strict ?? false);
        if (i.to === "class" && h.target.nodeType > 0) {
            const t = l.get(fromHydrationContext(Rs));
            h.useAccessor(new ClassAttributeAccessor(h.target, t));
        }
        t.addBinding(h);
    }
}, null);

const Si = /*@__PURE__*/ renderer(class PropertyBindingRenderer {
    constructor() {
        this.target = U.propertyBinding;
        PropertyBinding.mix();
    }
    render(t, e, i, s, n, r) {
        const l = t.container;
        const h = new PropertyBinding(t, l, r, ensureExpression(n, i.from, ve), getTarget(e), i.to, i.mode, t.strict ?? false);
        if (i.to === "class" && h.target.nodeType > 0) {
            const t = l.get(fromHydrationContext(Rs));
            h.useTargetObserver(new ClassAttributeAccessor(h.target, t));
        }
        t.addBinding(h);
    }
}, null);

const Ai = /*@__PURE__*/ renderer(class IteratorBindingRenderer {
    constructor() {
        this.target = U.iteratorBinding;
        PropertyBinding.mix();
    }
    render(t, e, i, s, n, r) {
        t.addBinding(new PropertyBinding(t, t.container, r, ensureExpression(n, i.forOf, ge), getTarget(e), i.to, Qt, t.strict ?? false));
    }
}, null);

const Ri = /*@__PURE__*/ renderer(class TextBindingRenderer {
    constructor() {
        this.target = U.textBinding;
        ContentBinding.mix();
    }
    render(t, e, i, s, n, r) {
        t.addBinding(new ContentBinding(t, t.container, r, s, ensureExpression(n, i.from, ve), e, t.strict ?? false));
    }
}, null);

const Ti = Ae("IListenerBindingOptions", t => t.singleton(class {
    constructor() {
        this.p = g(We);
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

const Ei = /*@__PURE__*/ renderer(class ListenerBindingRenderer {
    constructor() {
        this.target = U.listenerBinding;
        this.vt = g(hi);
        this.xt = g(Ti);
        ListenerBinding.mix();
    }
    render(t, e, i, s, n) {
        t.addBinding(new ListenerBinding(t.container, ensureExpression(n, i.from, pe), e, i.to, new ListenerBindingOptions(this.xt.prevent, i.capture, this.xt.onError), this.vt.getHandler(i.to, i.modifier), t.strict ?? false));
    }
}, null);

const Li = /*@__PURE__*/ renderer(class SetAttributeRenderer {
    constructor() {
        this.target = U.setAttribute;
    }
    render(t, e, i) {
        e.setAttribute(i.to, i.value);
    }
}, null);

const Mi = /*@__PURE__*/ renderer(class SetClassAttributeRenderer {
    constructor() {
        this.target = U.setClassAttribute;
    }
    render(t, e, i) {
        addClasses(e.classList, i.value);
    }
}, null);

const Di = /*@__PURE__*/ renderer(class SetStyleAttributeRenderer {
    constructor() {
        this.target = U.setStyleAttribute;
    }
    render(t, e, i) {
        e.style.cssText += i.value;
    }
}, null);

const Pi = /*@__PURE__*/ renderer(class StylePropertyBindingRenderer {
    constructor() {
        this.target = U.stylePropertyBinding;
        PropertyBinding.mix();
    }
    render(t, e, i, s, n, r) {
        t.addBinding(new PropertyBinding(t, t.container, r, ensureExpression(n, i.from, ve), e.style, i.to, Qt, t.strict ?? false));
    }
}, null);

const qi = /*@__PURE__*/ renderer(class AttributeBindingRenderer {
    constructor() {
        this.target = U.attributeBinding;
        AttributeBinding.mix();
    }
    render(t, e, i, s, n, r) {
        const l = t.container;
        const h = l.has(Rs, false) ? l.get(Rs) : null;
        t.addBinding(new AttributeBinding(t, l, r, ensureExpression(n, i.from, ve), e, i.attr, h == null ? i.to : i.to.split(/\s/g).map(t => h[t] ?? t).join(" "), Qt, t.strict ?? false));
    }
}, null);

const Ii = /*@__PURE__*/ renderer(class SpreadRenderer {
    constructor() {
        this.yt = g(G);
        this.r = g(ji);
        this.target = U.spreadTransferedBinding;
    }
    render(t, e, i, s, n, r) {
        SpreadBinding.create(t.container.get(ws), e, void 0, this.r, this.yt, s, n, r).forEach(e => t.addBinding(e));
    }
}, null);

const _i = /*@__PURE__*/ renderer(class SpreadValueRenderer {
    constructor() {
        this.target = U.spreadValueBinding;
        SpreadValueBinding.mix();
    }
    render(t, e, i, s, n, r) {
        const l = i.target;
        if (l === "$bindables") {
            t.addBinding(new SpreadValueBinding(t, e.viewModel, ue(e.definition.bindables), n.parse(i.from, ve), r, t.container, t.strict ?? false));
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

const Vi = "IController";

const Fi = "IInstruction";

const Hi = "IRenderLocation";

const Oi = "ISlotsInfo";

function createElementContainer(t, e, i, s, n, r) {
    const l = e.container.createChild();
    registerHostNode(l, i, t);
    registerResolver(l, ys, new B(Vi, e));
    registerResolver(l, X, new B(Fi, s));
    registerResolver(l, As, n == null ? $i : new RenderLocationProvider(n));
    registerResolver(l, ci, Ni);
    registerResolver(l, mi, r == null ? Wi : new B(Oi, r));
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
    registerResolver(c, ys, new B(Vi, a));
    registerResolver(c, X, new B(Fi, n));
    registerResolver(c, As, l == null ? $i : new B(Hi, l));
    registerResolver(c, ci, r == null ? Ni : new ViewFactoryProvider(r));
    registerResolver(c, mi, Wi);
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

const $i = new RenderLocationProvider(null);

const Ni = new ViewFactoryProvider(null);

const Wi = new B(Oi, new AuSlotsInfo(v));

const ji = /*@__PURE__*/ Ae("IRendering", t => t.singleton(Rendering));

class Rendering {
    get renderers() {
        return this.wt ??= this.bt.getAll(vi, false).reduce((t, e) => {
            t[e.target] ??= e;
            return t;
        }, i());
    }
    constructor() {
        this.kt = new WeakMap;
        this.Ct = new WeakMap;
        const t = this.bt = g(S).root;
        const e = this.p = t.get(We);
        this.ep = t.get(Ut);
        this.oL = t.get(Lt);
        this.Bt = e.document.createElement("au-m");
        this.St = new FragmentNodeSequence(e, e.document.createDocumentFragment());
    }
    compile(t, e) {
        const i = e.get(G);
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
        let e = t.get(C(Rs));
        if (e == null) {
            t.register(Ee(Rs, e = i()));
        }
        {
            ae(e, ...this.modules);
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
                    const s = i.value.split(/\s+/g).map(t => e[t] || t).join(" ");
                    i.value = s;
                }
            }
        }
        t.register(K.define(CompilingHook));
    }
}

function shadowCSS(...t) {
    return new ShadowDOMRegistry(t);
}

const zi = /*@__PURE__*/ Ae("IShadowDOMStyleFactory", t => t.cachedCallback(t => {
    if (AdoptedStyleSheetsStyles.supported(t.get(We))) {
        return t.get(AdoptedStyleSheetsStylesFactory);
    }
    return t.get(StyleElementStylesFactory);
}));

class ShadowDOMRegistry {
    constructor(t) {
        this.css = t;
    }
    register(t) {
        const e = t.get(Gi);
        const i = t.get(zi);
        t.register(Ee(Ui, i.createStyles(this.css, e)));
    }
}

class AdoptedStyleSheetsStylesFactory {
    constructor() {
        this.p = g(We);
        this.cache = new Map;
    }
    createStyles(t, e) {
        return new AdoptedStyleSheetsStyles(this.p, t, this.cache, e);
    }
}

class StyleElementStylesFactory {
    constructor() {
        this.p = g(We);
    }
    createStyles(t, e) {
        return new StyleElementStyles(this.p, t, e);
    }
}

const Ui = /*@__PURE__*/ Ae("IShadowDOMStyles");

const Gi = /*@__PURE__*/ Ae("IShadowDOMGlobalStyles", t => t.instance({
    applyTo: r
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

const Xi = {
    shadowDOM(t) {
        return Ne.creating(S, e => {
            if (t.sharedStyles != null) {
                const i = e.get(zi);
                e.register(Ee(Gi, i.createStyles(t.sharedStyles, null)));
            }
        });
    }
};

const {enter: Ki, exit: Qi} = Mt;

const {wrap: Yi, unwrap: Zi} = Dt;

class ComputedWatcher {
    get value() {
        return this.v;
    }
    constructor(t, e, i, s, n = "async") {
        this.obj = t;
        this.$get = i;
        this.isBound = false;
        this.L = false;
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
        if (this.L) return;
        this.L = true;
        Ct(() => {
            this.L = false;
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
        if (!R(i, e)) {
            this.cb.call(t, i, e, t);
        }
        if (!this.L) {
            this.Rt = 0;
        }
    }
    compute() {
        this.obs.version++;
        try {
            Ki(this);
            return this.v = Zi(this.$get.call(void 0, Yi(this.obj), this));
        } finally {
            this.obs.clear();
            Qi(this);
        }
    }
}

(() => {
    At(ComputedWatcher, null);
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
        this.L = false;
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
        if (this.L) return;
        this.L = true;
        Ct(() => {
            this.L = false;
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
        if (!R(s, i)) {
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
    At(ExpressionWatcher, null);
    ii(ExpressionWatcher);
})();

class Controller {
    get lifecycleHooks() {
        return this.Mt;
    }
    get isActive() {
        return (this.state & (fs | ds)) > 0 && (this.state & ms) === 0;
    }
    get name() {
        if (this.parent === null) {
            switch (this.vmKind) {
              case as:
                return `[${this.definition.name}]`;

              case hs:
                return this.definition.name;

              case cs:
                return this.viewFactory.name;
            }
        }
        switch (this.vmKind) {
          case as:
            return `${this.parent.name}>[${this.definition.name}]`;

          case hs:
            return `${this.parent.name}>${this.definition.name}`;

          case cs:
            return this.viewFactory.name === this.parent.definition?.name ? `${this.parent.name}[view]` : `${this.parent.name}[view:${this.viewFactory.name}]`;
        }
    }
    get viewModel() {
        return this.Dt;
    }
    set viewModel(t) {
        this.Dt = t;
        this.Pt = t == null || this.vmKind === cs ? HooksDefinition.none : new HooksDefinition(t);
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
        this.mountTarget = ts;
        this.shadowRoot = null;
        this.nodes = null;
        this.location = null;
        this.Mt = null;
        this.state = us;
        this.It = false;
        this.$initiator = null;
        this.$resolve = void 0;
        this.$reject = void 0;
        this.$promise = void 0;
        this._t = 0;
        this.Vt = 0;
        this.Ft = 0;
        this.Dt = n;
        this.Pt = e === cs ? HooksDefinition.none : new HooksDefinition(n);
        this.location = l;
        this.r = t.root.get(ji);
    }
    static getCached(t) {
        return Ji.get(t);
    }
    static getCachedOrThrow(t) {
        const e = Controller.getCached(t);
        if (e === void 0) {
            throw createMappedError(500, t);
        }
        return e;
    }
    static $el(t, e, i, s, n = void 0, r = null) {
        if (Ji.has(e)) {
            return Ji.get(e);
        }
        {
            n = n ?? getElementDefinition(e.constructor);
        }
        registerResolver(t, n.Type, new B(n.key, e, n.Type));
        const l = new Controller(t, hs, n, null, e, i, r);
        const h = t.get(E(ws));
        if (n.dependencies.length > 0) {
            t.register(...n.dependencies);
        }
        registerResolver(t, ws, new B("IHydrationContext", new HydrationContext(l, s, h)));
        Ji.set(e, l);
        if (s == null || s.hydrate !== false) {
            l.hE(s);
        }
        return l;
    }
    static $attr(t, e, i, s) {
        if (Ji.has(e)) {
            return Ji.get(e);
        }
        s = s ?? getAttributeDefinition(e.constructor);
        registerResolver(t, s.Type, new B(s.key, e, s.Type));
        const n = new Controller(t, as, s, null, e, i, null);
        if (s.dependencies.length > 0) {
            t.register(...s.dependencies);
        }
        Ji.set(e, n);
        n.Ht();
        return n;
    }
    static $view(t, e = void 0) {
        const i = new Controller(t.container, cs, null, t, null, null, null);
        i.parent = e ?? null;
        i.Ot();
        return i;
    }
    hE(t) {
        const e = this.container;
        const i = this.Dt;
        const s = this.definition;
        this.scope = Et.create(i, null, true);
        if (s.watches.length > 0) {
            createWatchers(this, e, s, i);
        }
        createObservers(this, s, i);
        this.Mt = Ye.resolve(e);
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
        Bs(r, Is, this);
        Bs(r, t.key, this);
        if (i !== null || s) {
            if (l != null) {
                throw createMappedError(501);
            }
            Bs(this.shadowRoot = r.attachShadow(i ?? ls), Is, this);
            Bs(this.shadowRoot, t.key, this);
            this.mountTarget = is;
        } else if (l != null) {
            if (r !== l) {
                Bs(l, Is, this);
                Bs(l, t.key, this);
            }
            this.mountTarget = ss;
        } else {
            this.mountTarget = es;
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
        this.Mt = Ye.resolve(this.container);
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
          case us:
          case gs:
            if (!(e === null || e.isActive)) {
                return;
            }
            this.state = fs;
            break;

          case ds:
            return;

          case vs:
            throw createMappedError(502, this.name);

          default:
            throw createMappedError(503, this.name, stringifyState(this.state));
        }
        this.parent = e;
        switch (this.vmKind) {
          case hs:
            this.scope.parent = i ?? null;
            break;

          case as:
            this.scope = i ?? null;
            break;

          case cs:
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
        if (this.vmKind !== cs && this.Mt.binding != null) {
            s = L(...this.Mt.binding.map(callBindingHook, this));
        }
        if (this.Pt.Ut) {
            s = L(s, this.Dt.binding(this.$initiator, this.parent));
        }
        if (M(s)) {
            this.Gt();
            s.then(() => {
                this.qt = true;
                if (this.state !== fs) {
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
        if (this.vmKind !== cs && this.Mt.bound != null) {
            i = L(...this.Mt.bound.map(callBoundHook, this));
        }
        if (this.Pt.Qt) {
            i = L(i, this.Dt.bound(this.$initiator, this.parent));
        }
        if (M(i)) {
            this.Gt();
            i.then(() => {
                this.isBound = true;
                if (this.state !== fs) {
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
          case es:
            this.host.append(...t);
            break;

          case is:
            this.shadowRoot.append(...t);
            break;

          case ss:
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
          case es:
            this.nodes.appendTo(this.host, this.definition != null && this.definition.enhance);
            break;

          case is:
            {
                const t = this.container;
                const e = t.has(Ui, false) ? t.get(Ui) : t.get(Gi);
                e.applyTo(this.shadowRoot);
                this.nodes.appendTo(this.shadowRoot);
                break;
            }

          case ss:
            this.nodes.insertBefore(this.location);
            break;
        }
        let t = 0;
        let e = void 0;
        if (this.vmKind !== cs && this.Mt.attaching != null) {
            e = L(...this.Mt.attaching.map(callAttachingHook, this));
        }
        if (this.Pt.Jt) {
            e = L(e, this.Dt.attaching(this.$initiator, this.parent));
        }
        if (M(e)) {
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
        switch (this.state & ~ps) {
          case ds:
            this.state = ms;
            break;

          case fs:
            this.state = ms;
            i = this.$promise?.catch(r);
            break;

          case us:
          case gs:
          case vs:
          case gs | vs:
            return;

          default:
            throw createMappedError(505, this.name, this.state);
        }
        this.$initiator = t;
        if (t === this) {
            this.te();
        }
        let s = 0;
        let n;
        if (this.children !== null) {
            for (s = 0; s < this.children.length; ++s) {
                void this.children[s].deactivate(t, this);
            }
        }
        return D(i, () => {
            if (this.isBound) {
                if (this.vmKind !== cs && this.Mt.detaching != null) {
                    n = L(...this.Mt.detaching.map(callDetachingHook, this));
                }
                if (this.Pt.ee) {
                    n = L(n, this.Dt.detaching(this.$initiator, this.parent));
                }
            }
            if (M(n)) {
                this.Gt();
                t.te();
                n.then(() => {
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
          case hs:
          case cs:
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
          case as:
            this.scope = null;
            break;

          case cs:
            if (!this.hasLockedScope) {
                this.scope = null;
            }
            if ((this.state & ps) === ps && !this.viewFactory.tryReturnToCache(this) && this.$initiator === this) {
                this.dispose();
            }
            break;

          case hs:
            this.scope.parent = null;
            break;
        }
        this.state = gs;
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
            ks = this.$reject;
            this.$resolve = this.$reject = this.$promise = void 0;
            ks(t);
            ks = void 0;
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
        if (this.state !== fs) {
            --this._t;
            this.se();
            if (this.$initiator !== this) {
                this.parent.Xt();
            }
            return;
        }
        if (--this._t === 0) {
            if (this.vmKind !== cs && this.Mt.attached != null) {
                Cs = L(...this.Mt.attached.map(callAttachedHook, this));
            }
            if (this.Pt.ne) {
                Cs = L(Cs, this.Dt.attached(this.$initiator));
            }
            if (M(Cs)) {
                this.Gt();
                Cs.then(() => {
                    this.state = ds;
                    this.se();
                    if (this.$initiator !== this) {
                        this.parent.Xt();
                    }
                }).catch(t => {
                    this.Kt(t);
                });
                Cs = void 0;
                return;
            }
            Cs = void 0;
            this.state = ds;
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
                    if (t.vmKind !== cs && t.Mt.unbinding != null) {
                        e = L(...t.Mt.unbinding.map(callUnbindingHook, t));
                    }
                    if (t.Pt.oe) {
                        if (t.debug) {
                            t.logger.trace("unbinding()");
                        }
                        e = L(e, t.viewModel.unbinding(t.$initiator, t.parent));
                    }
                }
                if (M(e)) {
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
          case as:
          case hs:
            {
                return this.definition.name === t;
            }

          case cs:
            return this.viewFactory.name === t;
        }
    }
    lockScope(t) {
        this.scope = t;
        this.hasLockedScope = true;
    }
    setHost(t) {
        if (this.vmKind === hs) {
            Bs(t, Is, this);
            Bs(t, this.definition.key, this);
        }
        this.host = t;
        this.mountTarget = es;
        return this;
    }
    setShadowRoot(t) {
        if (this.vmKind === hs) {
            Bs(t, Is, this);
            Bs(t, this.definition.key, this);
        }
        this.shadowRoot = t;
        this.mountTarget = is;
        return this;
    }
    setLocation(t) {
        if (this.vmKind === hs) {
            Bs(t, Is, this);
            Bs(t, this.definition.key, this);
        }
        this.location = t;
        this.mountTarget = ss;
        return this;
    }
    release() {
        this.state |= ps;
    }
    dispose() {
        if ((this.state & vs) === vs) {
            return;
        }
        this.state |= vs;
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
            Ji.delete(this.Dt);
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

const Ji = new WeakMap;

const ts = 0;

const es = 1;

const is = 2;

const ss = 3;

const ns = he({
    none: ts,
    host: es,
    shadowRoot: is,
    location: ss
});

const rs = T(Pt);

function createObservers(t, e, i) {
    const s = e.bindables;
    const n = ce(s);
    const l = n.length;
    if (l === 0) return;
    const h = t.container.get(Lt);
    const a = "propertiesChanged" in i;
    const c = t.vmKind === cs ? void 0 : t.container.get(rs);
    const u = a ? (() => {
        let e = {};
        let s = false;
        let n = 0;
        const callPropertiesChanged = () => {
            if (!s) {
                s = true;
                Ct(() => {
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

const os = new Map;

const getAccessScopeAst = t => {
    let e = os.get(t);
    if (e == null) {
        e = new zt(t, 0);
        os.set(t, e);
    }
    return e;
};

function createWatchers(t, i, s, n) {
    const r = i.get(Lt);
    const l = i.get(Ut);
    const h = s.watches;
    const a = t.vmKind === hs ? t.scope : Et.create(n, null, true);
    const c = h.length;
    let f;
    let d;
    let m;
    let g;
    let p = 0;
    for (;c > p; ++p) {
        ({expression: f, callback: d, flush: g} = h[p]);
        d = u(d) ? d : Reflect.get(n, d);
        if (!u(d)) {
            throw createMappedError(506, d);
        }
        if (u(f)) {
            t.addBinding(new ComputedWatcher(n, r, f, d, g));
        } else {
            m = e(f) ? l.parse(f, ve) : getAccessScopeAst(f);
            t.addBinding(new ExpressionWatcher(a, i, r, m, d, g));
        }
    }
}

function isCustomElementController(t) {
    return t instanceof Controller && t.vmKind === hs;
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

const ls = {
    mode: "open"
};

const hs = "customElement";

const as = "customAttribute";

const cs = "synthetic";

const us = 0;

const fs = 1;

const ds = 2;

const ms = 4;

const gs = 8;

const ps = 16;

const vs = 32;

const xs = /*@__PURE__*/ he({
    none: us,
    activating: fs,
    activated: ds,
    deactivating: ms,
    deactivated: gs,
    released: ps,
    disposed: vs
});

function stringifyState(t) {
    const e = [];
    if ((t & fs) === fs) {
        e.push("activating");
    }
    if ((t & ds) === ds) {
        e.push("activated");
    }
    if ((t & ms) === ms) {
        e.push("deactivating");
    }
    if ((t & gs) === gs) {
        e.push("deactivated");
    }
    if ((t & ps) === ps) {
        e.push("released");
    }
    if ((t & vs) === vs) {
        e.push("disposed");
    }
    return e.length === 0 ? "none" : e.join("|");
}

const ys = /*@__PURE__*/ Ae("IController");

const ws = /*@__PURE__*/ Ae("IHydrationContext");

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

let ks;

let Cs;

const Bs = je.set;

const Ss = /*@__PURE__*/ Ae("IEventTarget", t => t.cachedCallback(t => {
    if (t.has(Os, true)) {
        return t.get(Os).host;
    }
    return t.get(We).document;
}));

const As = /*@__PURE__*/ Ae("IRenderLocation");

const Rs = /*@__PURE__*/ Ae("ICssClassMapping");

const Ts = new WeakMap;

function getEffectiveParentNode(t) {
    if (Ts.has(t)) {
        return Ts.get(t);
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
        if (e.mountTarget === ns.shadowRoot) {
            return getEffectiveParentNode(e.host);
        }
    }
    return t.parentNode;
}

function setEffectiveParentNode(t, e) {
    if (t.platform !== void 0 && !(t instanceof t.platform.Node)) {
        const i = t.childNodes;
        for (let t = 0, s = i.length; t < s; ++t) {
            Ts.set(i[t], e);
        }
    } else {
        Ts.set(t, e);
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

const Es = /*@__PURE__*/ Ae("IWindow", t => t.callback(t => t.get(We).window));

const Ls = /*@__PURE__*/ Ae("ILocation", t => t.callback(t => t.get(Es).location));

const Ms = /*@__PURE__*/ Ae("IHistory", t => t.callback(t => t.get(Es).history));

const registerHostNode = (t, e, i = t.get(We)) => {
    registerResolver(t, i.HTMLElement, registerResolver(t, i.Element, registerResolver(t, ze, new B("ElementResolver", e))));
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
    if (!u(t)) {
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
    const e = Jt(Is, t);
    if (e === void 0) {
        annotateElementMetadata(t, "containerless", true);
        return;
    }
    e.containerless = true;
}

const Ds = new WeakMap;

class CustomElementDefinition {
    get type() {
        return Le;
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
            const n = P("name", s, _s);
            if (u(s.Type)) {
                i = s.Type;
            } else {
                i = Vs(q(n));
            }
            for (const t of Object.values(Be.from(s.bindables))) {
                Be.i(t, i);
            }
            return new CustomElementDefinition(i, n, c(s.aliases), P("key", s, () => getElementKeyFrom(n)), I("capture", s, i, returnFalse), I("template", s, i, returnNull), c(s.instructions), c(getElementAnnotation(i, "dependencies"), s.dependencies), P("injectable", s, returnNull), P("needsCompile", s, returnTrue), c(s.surrogates), Be.from(getElementAnnotation(i, "bindables"), s.bindables), I("containerless", s, i, returnFalse), P("shadowOptions", s, returnNull), P("hasSlots", s, returnFalse), P("enhance", s, returnFalse), P("watches", s, returnEmptyArray), P("strict", s, returnUndefined), _("processContent", i, returnNull));
        }
        if (e(t)) {
            return new CustomElementDefinition(i, t, c(getElementAnnotation(i, "aliases"), i.aliases), getElementKeyFrom(t), _("capture", i, returnFalse), _("template", i, returnNull), c(getElementAnnotation(i, "instructions"), i.instructions), c(getElementAnnotation(i, "dependencies"), i.dependencies), _("injectable", i, returnNull), _("needsCompile", i, returnTrue), c(getElementAnnotation(i, "surrogates"), i.surrogates), Be.from(...Be.getAll(i), getElementAnnotation(i, "bindables"), i.bindables), _("containerless", i, returnFalse), _("shadowOptions", i, returnNull), _("hasSlots", i, returnFalse), _("enhance", i, returnFalse), c(Ue.getDefinitions(i), i.watches), _("strict", i, returnUndefined), _("processContent", i, returnNull));
        }
        const s = P("name", t, _s);
        for (const e of Object.values(Be.from(t.bindables))) {
            Be.i(e, i);
        }
        return new CustomElementDefinition(i, s, c(getElementAnnotation(i, "aliases"), t.aliases, i.aliases), getElementKeyFrom(s), I("capture", t, i, returnFalse), I("template", t, i, returnNull), c(getElementAnnotation(i, "instructions"), t.instructions, i.instructions), c(getElementAnnotation(i, "dependencies"), t.dependencies, i.dependencies), I("injectable", t, i, returnNull), I("needsCompile", t, i, returnTrue), c(getElementAnnotation(i, "surrogates"), t.surrogates, i.surrogates), Be.from(...Be.getAll(i), getElementAnnotation(i, "bindables"), i.bindables, t.bindables), I("containerless", t, i, returnFalse), I("shadowOptions", t, i, returnNull), I("hasSlots", t, i, returnFalse), I("enhance", t, i, returnFalse), c(t.watches, Ue.getDefinitions(i), i.watches), I("strict", t, i, returnUndefined), I("processContent", t, i, returnNull));
    }
    static getOrCreate(t) {
        if (t instanceof CustomElementDefinition) {
            return t;
        }
        if (Ds.has(t)) {
            return Ds.get(t);
        }
        const e = CustomElementDefinition.create(t);
        Ds.set(t, e);
        ee(e, e.Type, Is);
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
        t.register(t.has(i, false) ? null : Re(i, i), Te(i, s), ...n.map(t => Te(i, getElementKeyFrom(t))));
    }
    toString() {
        return `au:ce:${this.name}`;
    }
}

const Ps = {
    name: undefined,
    searchParents: false,
    optional: false
};

const returnNull = () => null;

const returnUndefined = () => void 0;

const returnFalse = () => false;

const returnTrue = () => true;

const returnEmptyArray = () => v;

const qs = "custom-element";

const Is = /*@__PURE__*/ m(qs);

const getElementKeyFrom = t => `${Is}:${t}`;

const _s = /*@__PURE__*/ (t => () => `unnamed-${++t}`)(0);

const annotateElementMetadata = (t, e, i) => {
    ee(i, t, se(e));
};

const defineElement = (t, e) => {
    const i = CustomElementDefinition.create(t, e);
    const s = i.Type;
    ee(i, s, Is, f);
    return s;
};

const isElementType = t => u(t) && (te(Is, t) || t.$au?.type === qs);

const findElementControllerFor = (t, e = Ps) => {
    if (e.name === void 0 && e.searchParents !== true) {
        const i = je.get(t, Is);
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
            const i = je.get(t, Is);
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
            const t = je.get(i, Is);
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
        const t = je.get(i, Is);
        if (t !== null) {
            return t;
        }
        i = getEffectiveParentNode(i);
    }
    throw createMappedError(765, t);
};

const getElementAnnotation = (t, e) => Jt(se(e), t);

const getElementDefinition = t => {
    const e = Jt(Is, t) ?? getDefinitionFromStaticAu(t, qs, CustomElementDefinition.create);
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

const Vs = /*@__PURE__*/ function() {
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
        de(n, "name", t);
        if (s !== e) {
            ae(n.prototype, s);
        }
        return n;
    };
}();

const Fs = /*@__PURE__*/ he({
    name: Is,
    keyFrom: getElementKeyFrom,
    isType: isElementType,
    for: findElementControllerFor,
    define: defineElement,
    getDefinition: getElementDefinition,
    annotate: annotateElementMetadata,
    getAnnotation: getElementAnnotation,
    generateName: _s,
    createInjectable: createElementInjectable,
    generateType: Vs,
    find(t, e) {
        const i = t.find(qs, e);
        return i == null ? null : Jt(Is, i) ?? getDefinitionFromStaticAu(i, qs, CustomElementDefinition.create) ?? null;
    }
});

const Hs = /*@__PURE__*/ se("processContent");

function processContent(t) {
    return t === void 0 ? function(t, e) {
        if (!e.static || e.kind !== "method") throw createMappedError(766, t);
        e.addInitializer(function() {
            ee(t, this, Hs);
        });
    } : function(i, s) {
        s.addInitializer(function() {
            if (e(t) || V(t)) {
                t = this[t];
            }
            if (!u(t)) throw createMappedError(766, t);
            const i = Jt(Is, this);
            if (i !== void 0) {
                i.processContent = t;
            } else {
                ee(t, this, Hs);
            }
        });
        return i;
    };
}

function capture(t) {
    return function(e, i) {
        const s = u(t) ? t : true;
        i.addInitializer(function() {
            annotateElementMetadata(this, "capture", s);
            if (isElementType(this)) {
                getElementDefinition(this).capture = s;
            }
        });
    };
}

const Os = /*@__PURE__*/ Ae("IAppRoot");

class AppRoot {
    get controller() {
        return this.P;
    }
    constructor(t, e, i, s = false) {
        this.config = t;
        this.container = e;
        this.pe = void 0;
        this.ve = s;
        const n = this.host = t.host;
        i.prepare(this);
        registerResolver(e, Ss, new B("IEventTarget", n));
        registerHostNode(e, n, this.platform = this.xe(e, n));
        this.pe = D(this.ye("creating"), () => {
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
            if (u(r)) {
                l = i.invoke(r);
                Ee(r, l);
            } else {
                l = t.component;
            }
            const h = {
                hydrate: false,
                projections: null
            };
            const a = s ? CustomElementDefinition.create({
                name: _s(),
                template: this.host,
                enhance: true,
                strict: t.strictBinding
            }) : void 0;
            const c = this.P = Controller.$el(i, l, n, h, a);
            c.hE(h);
            return D(this.ye("hydrating"), () => {
                c.hS();
                return D(this.ye("hydrated"), () => {
                    c.hC();
                    this.pe = void 0;
                });
            });
        });
    }
    activate() {
        return D(this.pe, () => D(this.ye("activating"), () => D(this.P.activate(this.P, null, void 0), () => this.ye("activated"))));
    }
    deactivate() {
        return D(this.ye("deactivating"), () => D(this.P.deactivate(this.P, null), () => this.ye("deactivated")));
    }
    ye(t) {
        const e = this.container;
        const i = this.ve && !e.has($e, false) ? [] : e.getAll($e);
        return L(...i.reduce((e, i) => {
            if (i.slot === t) {
                e.push(i.run());
            }
            return e;
        }, []));
    }
    xe(t, e) {
        let i;
        if (!t.has(We, false)) {
            if (e.ownerDocument.defaultView === null) {
                throw createMappedError(769);
            }
            i = new jt(e.ownerDocument.defaultView);
            t.register(Ee(We, i));
        } else {
            i = t.get(We);
        }
        return i;
    }
    dispose() {
        this.P?.dispose();
    }
}

const $s = /*@__PURE__*/ Ae("IAurelia");

class Aurelia {
    get isRunning() {
        return this.ir;
    }
    get isStarting() {
        return this.we;
    }
    get isStopping() {
        return this.be;
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
    constructor(t = l.createContainer()) {
        this.container = t;
        this.ir = false;
        this.we = false;
        this.be = false;
        this.ke = void 0;
        this.next = void 0;
        this.Ce = void 0;
        this.Be = void 0;
        if (t.has($s, true) || t.has(Aurelia, true)) {
            throw createMappedError(768);
        }
        registerResolver(t, $s, new B("IAurelia", this));
        registerResolver(t, Aurelia, new B("Aurelia", this));
        registerResolver(t, Os, this.Se = new B("IAppRoot"));
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
        const i = registerResolver(e, Os, new B("IAppRoot"));
        const s = new AppRoot({
            host: t.host,
            component: t.component
        }, e, i, true);
        return D(s.activate(), () => s);
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
        if (M(this.Ce)) {
            return this.Ce;
        }
        return this.Ce = D(this.stop(), () => {
            if (!je.hideProp) {
                Reflect.set(t.host, "$aurelia", this);
            }
            this.Se.prepare(this.ke = t);
            this.we = true;
            return D(t.activate(), () => {
                this.ir = true;
                this.we = false;
                this.Ce = void 0;
                this.Ae(t, "au-started", t.host);
            });
        });
    }
    stop(t = false) {
        if (M(this.Be)) {
            return this.Be;
        }
        if (this.ir === true) {
            const e = this.ke;
            this.ir = false;
            this.be = true;
            return this.Be = D(e.deactivate(), () => D(qt(), () => {
                Reflect.deleteProperty(e.host, "$aurelia");
                if (t) {
                    e.dispose();
                }
                this.ke = void 0;
                this.Se.dispose();
                this.be = false;
                this.Be = void 0;
                this.Ae(e, "au-stopped", e.host);
            }));
        }
    }
    dispose() {
        if (this.ir || this.be) {
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

const Ns = /*@__PURE__*/ Ae("ISVGAnalyzer", t => t.singleton(NoopSVGAnalyzer));

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
        t.register(Re(this, this), Te(this, Ns));
    }
    constructor() {
        this.Re = ae(i(), {
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
        const t = g(We);
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
        this.svg = g(Ns);
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

const Ws = {
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
        this.De = new WeakMap;
        this.Pe = new WeakMap;
    }
    el(t, e) {
        let i = this.De.get(t);
        if (i == null) {
            this.De.set(t, i = new RecordCache);
        }
        return e in i.qe ? i.qe[e] : i.qe[e] = Fs.find(t, e);
    }
    attr(t, e) {
        let i = this.De.get(t);
        if (i == null) {
            this.De.set(t, i = new RecordCache);
        }
        return e in i.Ie ? i.Ie[e] : i.Ie[e] = Ke.find(t, e);
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
                    mode: t.defaultBindingMode ?? Xt
                });
            }
            this.Pe.set(t, e = new BindablesInfo(n, s, a ?? null));
        }
        return e;
    }
}

ResourceResolver.register = F(Y);

class RecordCache {
    constructor() {
        this.qe = i();
        this.Ie = i();
    }
}

const js = i();

class AttributeNSAccessor {
    static forNs(t) {
        return js[t] ??= new AttributeNSAccessor(t);
    }
    constructor(t) {
        this.ns = t;
        this.type = be | ke;
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
        this.type = be | ke;
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

const zs = /*@__PURE__*/ new DataAttributeAccessor;

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
                e[e.length] = le.call(n, "model") ? n.model : n.value;
            }
            ++s;
        }
        return e;
    }
    static Ve(t, e) {
        return t === e;
    }
    constructor(t, e, i, s) {
        this.type = be | we | ke;
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
        const i = w(t);
        const s = e.matcher ?? SelectValueObserver.Ve;
        const n = e.options;
        let r = n.length;
        while (r-- > 0) {
            const e = n[r];
            const l = le.call(e, "model") ? e.model : e.value;
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
                    h.push(le.call(r, "model") ? r.model : r.value);
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
                r = le.call(l, "model") ? l.model : l.value;
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
    Tt(SelectValueObserver, null);
})();

const Us = "--";

class StyleAttributeAccessor {
    constructor(t) {
        this.obj = t;
        this.type = be | ke;
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
        const r = [];
        for (s in t) {
            i = t[s];
            if (i == null) {
                continue;
            }
            if (e(i)) {
                if (s.startsWith(Us)) {
                    r.push([ s, i ]);
                    continue;
                }
                r.push([ n(s), i ]);
                continue;
            }
            r.push(...this.ze(i));
        }
        return r;
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
        return v;
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
        return v;
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
                if (!le.call(e, s) || e[s] !== n) {
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
        this.type = be | we | ke;
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
        if (R(t, this.v)) {
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
    Tt(ValueAttributeObserver, null);
})();

const Gs = (() => {
    const t = "http://www.w3.org/1999/xlink";
    const e = "http://www.w3.org/XML/1998/namespace";
    const s = "http://www.w3.org/2000/xmlns/";
    return ae(i(), {
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

const Xs = new It;

Xs.type = be | ke;

class NodeObserverLocator {
    constructor() {
        this.allowDirtyCheck = true;
        this.Ge = i();
        this.Xe = i();
        this.Ke = i();
        this.Qe = i();
        this.Ye = g(H);
        this.p = g(We);
        this.Ze = g(Vt);
        this.svg = g(Ns);
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
        if (e in this.Qe || e in (this.Ke[t.tagName] ?? O)) {
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
            return zs;

          default:
            {
                const i = Gs[e];
                if (i !== undefined) {
                    return AttributeNSAccessor.forNs(i[1]);
                }
                if (isDataAttribute(t, e, this.svg)) {
                    return zs;
                }
                return Xs;
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
                Ft(t)[e] = n;
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
        const n = Gs[e];
        if (n !== undefined) {
            return AttributeNSAccessor.forNs(n[1]);
        }
        if (isDataAttribute(t, e, this.svg)) {
            return zs;
        }
        if (e in t.constructor.prototype) {
            if (this.allowDirtyCheck) {
                return this.Ze.createProperty(t, e);
            }
            throw createMappedError(652, e);
        } else {
            return new Ht(t, e);
        }
    }
}

NodeObserverLocator.register = F(_t);

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
        this.type = be | we | ke;
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
        const i = le.call(e, "model") ? e.model : e.value;
        const s = e.type === "radio";
        const n = e.matcher !== void 0 ? e.matcher : defaultMatcher;
        if (s) {
            e.checked = !!n(t, i);
        } else if (t === true) {
            e.checked = true;
        } else {
            let s = false;
            if (w(t)) {
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
        const i = le.call(e, "model") ? e.model : e.value;
        const s = e.checked;
        const n = e.matcher !== void 0 ? e.matcher : defaultMatcher;
        if (e.type === "checkbox") {
            if (w(t)) {
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
        Ks = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, Ks);
        Ks = void 0;
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
    Tt(CheckedObserver, null);
})();

let Ks = void 0;

class AttrBindingBehavior {
    bind(t, e) {
        if (!(e instanceof PropertyBinding)) {
            throw createMappedError(9994, e);
        }
        e.useTargetObserver(zs);
    }
}

AttrBindingBehavior.$au = {
    type: De,
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
    type: De,
    name: "self"
};

class UpdateTriggerBindingBehavior {
    constructor() {
        this.oL = g(Lt);
        this.si = g(_t);
    }
    bind(t, e, ...i) {
        if (!(this.si instanceof NodeObserverLocator)) {
            throw createMappedError(9993);
        }
        if (i.length === 0) {
            throw createMappedError(802);
        }
        if (!(e instanceof PropertyBinding) || !(e.mode & Yt)) {
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
    type: De,
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
        this.oi = g(ci);
        this.l = g(As);
    }
    attaching(t, e) {
        return this.li(this.value);
    }
    detaching(t, e) {
        this.ni = true;
        return D(this.pending, () => {
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
        return D(this.pending, () => this.pending = D(e?.deactivate(e, i), () => {
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
            return D(n.activate(n, i, i.scope), () => {
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
    type: Ge,
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
        this.f = g(ci);
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

const Qs = [ "BindingBehavior", "ValueConverter" ];

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
        this.l = g(As);
        this.yi = g(ys);
        this.f = g(ci);
        this.wi = g(tn);
        const t = g(X);
        const e = t.props[0].props[0];
        if (e !== void 0) {
            const {to: t, value: i, command: s} = e;
            if (t === "key") {
                if (s === null) {
                    this.key = i;
                } else if (s === "bind") {
                    this.key = g(Ut).parse(i, ve);
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
                this.bi = n;
                let t = r.iterable;
                while (t != null && Qs.includes(t.$kind)) {
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
        return this.Si(t, this.pi ?? v);
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
            this.items = bt(this.forOf.iterable, i.scope, this.bi, null);
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
            const f = this.bi;
            const d = this.xi;
            t = Ot(a);
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
            const e = D(this.Ti(t), () => this.Ei(t));
            if (M(e)) {
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
            e = this.Li = bt(this.gi, t, this.bi, null) ?? null;
            i = this.di = !R(this.items, e);
        }
        const n = this.fi;
        if (this.$controller.isActive) {
            const t = i ? e : this.items;
            s = this.fi = this.wi.resolve(t).getObserver?.(t);
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
        const a = this.bi;
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
        if (w(t)) {
            this.pi = t.slice(0);
            return;
        }
        const e = [];
        this.wi.resolve(t).iterate(t, (t, i) => {
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
            if (M(s)) {
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
            if (M(i)) {
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
                if (M(i)) {
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
    type: Ge,
    name: "repeat",
    isTemplateController: true,
    bindables: [ "items" ]
};

let Ys = 16;

let Zs = new Int32Array(Ys);

let Js = new Int32Array(Ys);

function longestIncreasingSubsequence(t) {
    const e = t.length;
    if (e > Ys) {
        Ys = e;
        Zs = new Int32Array(e);
        Js = new Int32Array(e);
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
            l = Zs[i];
            n = t[l];
            if (n !== -2 && n < s) {
                Js[r] = l;
                Zs[++i] = r;
                continue;
            }
            h = 0;
            a = i;
            while (h < a) {
                c = h + a >> 1;
                n = t[Zs[c]];
                if (n !== -2 && n < s) {
                    h = c + 1;
                } else {
                    a = c;
                }
            }
            n = t[Zs[h]];
            if (s < n || n === -2) {
                if (h > 0) {
                    Js[r] = Zs[h - 1];
                }
                Zs[h] = r;
            }
        }
    }
    r = ++i;
    const u = new Int32Array(r);
    s = Zs[i - 1];
    while (i-- > 0) {
        u[i] = s;
        s = Js[s];
    }
    while (r-- > 0) Zs[r] = 0;
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

const tn = /*@__PURE__*/ Ae("IRepeatableHandlerResolver", t => t.singleton(RepeatableHandlerResolver));

class RepeatableHandlerResolver {
    constructor() {
        this.Mi = g(b(en));
    }
    resolve(t) {
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
        if (ln.handles(t)) {
            return ln;
        }
        const e = this.Mi.find(e => e.handles(t));
        if (e !== void 0) {
            return e;
        }
        return hn;
    }
}

class ArrayLikeHandler {
    static register(t) {
        t.register(Re(en, this));
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

const en = /*@__PURE__*/ Ae("IRepeatableHandler");

const sn = {
    handles: w,
    getObserver: $t,
    iterate(t, e) {
        const i = t.length;
        let s = 0;
        for (;s < i; ++s) {
            e(t[s], s, t);
        }
    }
};

const nn = {
    handles: N,
    getObserver: $t,
    iterate(t, e) {
        let i = 0;
        let s;
        for (s of t.keys()) {
            e(s, i++, t);
        }
    }
};

const rn = {
    handles: W,
    getObserver: $t,
    iterate(t, e) {
        let i = 0;
        let s;
        for (s of t.entries()) {
            e(s, i++, t);
        }
    }
};

const on = {
    handles: $,
    iterate(t, e) {
        let i = 0;
        for (;i < t; ++i) {
            e(i, i, t);
        }
    }
};

const ln = {
    handles: t => t == null,
    iterate() {}
};

const hn = {
    handles(t) {
        return false;
    },
    iterate(t, e) {
        throw createMappedError(777, t);
    }
};

const setItem = (t, e, i, s, n, r) => {
    if (t) {
        Rt(e, i, s, null, r);
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
    } else if (c instanceof Et) {
        t.delete(i);
    } else if (c.length === 1) {
        c = c[0];
        t.delete(i);
    } else {
        c = c.shift();
    }
    if (e.has(i)) {
        const t = e.get(i);
        if (t instanceof Et) {
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
        const n = Et.fromParent(i, new Nt, new RepeatOverrideContext);
        Rt(e.declaration, n, s, null, t);
    }
    return Et.fromParent(i, new Nt(n, t), new RepeatOverrideContext);
};

const compareNumber = (t, e) => t - e;

class With {
    constructor() {
        this.view = g(ci).create().setLocation(g(As));
    }
    valueChanged(t, e) {
        const i = this.$controller;
        const s = this.view.bindings;
        let n;
        let r = 0, l = 0;
        if (i.isActive && s != null) {
            n = Et.fromParent(i.scope, t === void 0 ? {} : t);
            for (l = s.length; l > r; ++r) {
                s[r].bind(n);
            }
        }
    }
    attaching(t, e) {
        const {$controller: i, value: s} = this;
        const n = Et.fromParent(i.scope, s === void 0 ? {} : s);
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
    type: Ge,
    name: "with",
    isTemplateController: true,
    bindables: [ "value" ]
};

class Switch {
    constructor() {
        this.cases = [];
        this.activeCases = [];
        this.promise = void 0;
        this.f = g(ci);
        this.l = g(As);
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
        return D(this.Pi(null, n), () => {
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
        return D(this.activeCases.length > 0 ? this.Pi(t, i) : void 0, () => {
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
        return L(...i.map(e => e.activate(t, n)));
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
        return D(L(...i.reduce((i, s) => {
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
        i = this.promise = D(D(e, t), () => {
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
    type: Ge,
    name: "switch",
    isTemplateController: true,
    bindables: [ "value" ]
};

let an = 0;

const cn = [ "value", {
    name: "fallThrough",
    mode: Kt,
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
        this.id = ++an;
        this.fallThrough = false;
        this.view = void 0;
        this.f = g(ci);
        this.Ye = g(Lt);
        this.l = g(As);
        this.Ii = g(x).scopeTo(`Case-#${this.id}`);
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
        if (w(e)) {
            if (this.fi === void 0) {
                this.fi = this._i(e);
            }
            return e.includes(t);
        }
        return e === t;
    }
    valueChanged(t, e) {
        if (w(t)) {
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
        bindables: cn,
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
        bindables: cn,
        isTemplateController: true
    }, DefaultCase);
})();

var un, dn, mn;

class PromiseTemplateController {
    constructor() {
        this.preSettledTask = null;
        this.postSettledTask = null;
        this.f = g(ci);
        this.l = g(As);
        this.p = g(We);
        this.logger = g(x).scopeTo("promise.resolve");
    }
    link(t, e, i, s) {
        this.view = this.f.create(this.$controller).setLocation(this.l);
    }
    attaching(t, e) {
        const i = this.view;
        const s = this.$controller;
        return D(i.activate(t, s, this.viewScope = Et.fromParent(s.scope, {})), () => this.swap(t));
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
        const i = this.fulfilled;
        const s = this.rejected;
        const n = this.pending;
        const r = this.viewScope;
        let l;
        const $swap = () => {
            void L(l = (this.preSettledTask = kt(() => L(i?.deactivate(t), s?.deactivate(t), n?.activate(t, r)))).result.catch(t => {
                throw t;
            }), e.then(h => {
                if (this.value !== e) {
                    return;
                }
                const fulfill = () => {
                    this.postSettlePromise = (this.postSettledTask = kt(() => L(n?.deactivate(t), s?.deactivate(t), i?.activate(t, r, h)))).result;
                };
                if (this.preSettledTask.status === ye) {
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
                    this.postSettlePromise = (this.postSettledTask = kt(() => L(n?.deactivate(t), i?.deactivate(t), s?.activate(t, r, h)))).result;
                };
                if (this.preSettledTask.status === ye) {
                    void l.then(reject);
                } else {
                    this.preSettledTask.cancel();
                    reject();
                }
            }));
        };
        if (this.postSettledTask?.status === ye) {
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
    type: Ge,
    name: "promise",
    isTemplateController: true,
    bindables: [ "value" ]
};

class PendingTemplateController {
    constructor() {
        this.view = void 0;
        this.f = g(ci);
        this.l = g(As);
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
    type: Ge,
    name: "pending",
    isTemplateController: true,
    bindables: {
        value: {
            mode: Qt
        }
    }
};

class FulfilledTemplateController {
    constructor() {
        this.view = void 0;
        this.f = g(ci);
        this.l = g(As);
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
    type: Ge,
    name: "then",
    isTemplateController: true,
    bindables: {
        value: {
            mode: Yt
        }
    }
};

class RejectedTemplateController {
    constructor() {
        this.view = void 0;
        this.f = g(ci);
        this.l = g(As);
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
    type: Ge,
    name: "catch",
    isTemplateController: true,
    bindables: {
        value: {
            mode: Yt
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

un = Symbol.metadata;

PromiseAttributePattern[un] = {
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

dn = Symbol.metadata;

FulfilledAttributePattern[dn] = {
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

mn = Symbol.metadata;

RejectedAttributePattern[mn] = {
    [y]: J.create([ {
        pattern: "catch",
        symbols: ""
    } ], RejectedAttributePattern)
};

class Focus {
    constructor() {
        this.Vi = false;
        this.qe = g(ze);
        this.p = g(We);
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
    type: Ge,
    name: "focus",
    bindables: {
        value: {
            mode: Zt
        }
    }
};

class Portal {
    constructor() {
        this.position = "beforeend";
        this.strict = false;
        const t = g(ci);
        const e = g(As);
        const i = g(We);
        this.p = i;
        this.Oi = i.document.createElement("div");
        (this.view = t.create()).setLocation(this.$i = ui(i));
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
        const i = D(this.zi(null, e), () => {
            this.Wi(e, this.position);
            return this.ji(null, e);
        });
        if (M(i)) {
            i.catch(rethrow);
        }
    }
    positionChanged() {
        const {$controller: t, Oi: e} = this;
        if (!t.isActive) {
            return;
        }
        const i = D(this.zi(null, e), () => {
            this.Wi(e, this.position);
            return this.ji(null, e);
        });
        if (M(i)) {
            i.catch(rethrow);
        }
    }
    ji(t, e) {
        const {activating: i, callbackContext: s, view: n} = this;
        return D(i?.call(s, e, n), () => this.Ui(t, e));
    }
    Ui(t, e) {
        const {$controller: i, view: s} = this;
        if (t === null) {
            s.nodes.insertBefore(this.$i);
        } else {
            return D(s.activate(t ?? s, i, i.scope), () => this.Gi(e));
        }
        return this.Gi(e);
    }
    Gi(t) {
        const {activated: e, callbackContext: i, view: s} = this;
        return e?.call(i, t, s);
    }
    zi(t, e) {
        const {deactivating: i, callbackContext: s, view: n} = this;
        return D(i?.call(s, e, n), () => this.Xi(t, e));
    }
    Xi(t, e) {
        const {$controller: i, view: s} = this;
        if (t === null) {
            s.nodes.remove();
        } else {
            return D(s.deactivate(t, i), () => this.Ki(e));
        }
        return this.Ki(e);
    }
    Ki(t) {
        const {deactivated: e, callbackContext: i, view: s} = this;
        return D(e?.call(i, t, s), () => this.Qi());
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
    type: Ge,
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

let gn;

class AuSlot {
    constructor() {
        this.Yi = null;
        this.Zi = null;
        this.ne = false;
        this.expose = null;
        this.slotchange = null;
        this.Ji = new Set;
        this.fi = null;
        const t = g(ws);
        const e = g(As);
        const i = g(X);
        const s = g(ji);
        const n = this.name = i.data.name;
        const r = i.projections?.[fi];
        const l = t.instruction?.projections?.[n];
        const h = t.controller.container;
        let a;
        let c;
        if (l == null) {
            c = h.createChild({
                inheritParentResources: true
            });
            a = s.getViewFactory(r ?? (gn ??= CustomElementDefinition.create({
                name: "au-slot-empty-template",
                template: "",
                needsCompile: false
            })), c);
            this.ts = false;
        } else {
            c = h.createChild();
            c.useResources(t.parent.controller.container);
            registerResolver(c, ws, new B(void 0, t.parent));
            a = s.getViewFactory(l, c);
            this.ts = true;
            this.es = h.getAll(gi, false)?.filter(t => t.slotName === "*" || t.slotName === n) ?? v;
        }
        this.ss = (this.es ??= v).length > 0;
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
            (this.Zi = Et.fromParent(s, s.bindingContext)).overrideContext.$host = this.expose ?? i;
        }
    }
    attaching(t, e) {
        return D(this.view.activate(t, this.$controller, this.ts ? this.Zi : this.Yi), () => {
            if (this.ss || u(this.slotchange)) {
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
    type: qs,
    name: "au-slot",
    template: null,
    containerless: true,
    processContent(t, e, i) {
        i.name = t.getAttribute("name") ?? fi;
        let s = t.firstChild;
        let n = null;
        while (s !== null) {
            n = s.nextSibling;
            if (isElement(s) && s.hasAttribute(di)) {
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
        this.c = g(S);
        this.parent = g(ys);
        this.ds = g(ze);
        this.l = g(As);
        this.p = g(We);
        this.r = g(ji);
        this.gs = g(X);
        this.ps = g(j(CompositionContextFactory, null));
        this.yt = g(G);
        this.it = g(ws);
        this.ep = g(Ut);
        this.oL = g(Lt);
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
        return this.xs = D(this.queue(new ChangeInfo(this.template, this.component, this.model, void 0), t), t => {
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
        return D(i, () => e?.deactivate(t));
    }
    propertyChanged(t) {
        if (!this.ne) return;
        if (t === "composing" || t === "composition") return;
        if (t === "model" && this.us != null) {
            this.us.update(this.model);
            return;
        }
        if (t === "tag" && this.us?.controller.vmKind === hs) {
            return;
        }
        this.xs = D(this.xs, () => D(this.queue(new ChangeInfo(this.template, this.component, this.model, t), void 0), t => {
            if (this.ps.ys(t)) {
                this.xs = void 0;
            }
        }));
    }
    queue(t, e) {
        const i = this.ps;
        const s = this.us;
        return D(i.create(t), t => {
            if (i.ys(t)) {
                return D(this.compose(t), n => {
                    if (i.ys(t)) {
                        return D(n.activate(e), () => {
                            if (i.ys(t)) {
                                this.us = n;
                                return D(s?.deactivate(e), () => t);
                            } else {
                                return D(n.controller.deactivate(n.controller, this.$controller), () => {
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
        const {ws: e, bs: i, ks: s} = t.change;
        const {c: n, $controller: r, l: l, gs: h} = this;
        const a = this.Cs(this.it.controller.container, i);
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
        const m = this.Bs(c, typeof i === "string" ? a.Type : i, f, d);
        const compose = () => {
            const i = h.captures ?? v;
            if (a !== null) {
                const e = a.capture;
                const [s, n] = i.reduce((t, i) => {
                    const s = !(i.target in a.bindables) && (e === true || u(e) && !!e(i.target));
                    t[s ? 0 : 1].push(i);
                    return t;
                }, [ [], [] ]);
                const l = Controller.$el(c, m, f, {
                    projections: h.projections,
                    captures: s
                }, a, d);
                this.Ss(f, a, n).forEach(t => l.addBinding(t));
                return new CompositionController(l, t => l.activate(t ?? l, r, r.scope.parent), t => D(l.deactivate(t ?? l, r), removeCompositionHost), t => m.activate?.(t), t);
            } else {
                const s = CustomElementDefinition.create({
                    name: Fs.generateName(),
                    template: e
                });
                const n = this.r.getViewFactory(s, c);
                const l = Controller.$view(n, r);
                const h = this.scopeBehavior === "auto" ? Et.fromParent(this.parent.scope, m) : Et.create(m);
                l.setHost(f);
                if (d == null) {
                    this.Ss(f, s, i).forEach(t => l.addBinding(t));
                } else {
                    l.setLocation(d);
                }
                return new CompositionController(l, t => l.activate(t ?? l, r, h), t => D(l.deactivate(t ?? l, r), removeCompositionHost), t => m.activate?.(t), t);
            }
        };
        if ("activate" in m) {
            return D(m.activate(s), () => compose());
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
        registerResolver(t, As, new B("IRenderLocation", s));
        const r = t.invoke(e);
        registerResolver(t, e, new B("au-compose.component", r));
        return r;
    }
    Cs(t, e) {
        if (typeof e === "string") {
            const i = Fs.find(t, e);
            if (i == null) {
                throw createMappedError(806, e);
            }
            return i;
        }
        const i = u(e) ? e : e?.constructor;
        return Fs.isType(i, void 0) ? Fs.getDefinition(i, null) : null;
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
    type: qs,
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
        mode: Yt
    }, {
        name: "composition",
        mode: Yt
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
        return D(t.load(), t => new CompositionContext(++this.id, t));
    }
    invalidate() {
        this.id++;
    }
}

class ChangeInfo {
    constructor(t, e, i, s) {
        this.ws = t;
        this.bs = e;
        this.ks = i;
        this.As = s;
    }
    load() {
        if (M(this.ws) || M(this.bs)) {
            return Promise.all([ this.ws, this.bs ]).then(([t, e]) => new LoadedChangeInfo(t, e, this.ks, this.As));
        } else {
            return new LoadedChangeInfo(this.ws, this.bs, this.ks, this.As);
        }
    }
}

class LoadedChangeInfo {
    constructor(t, e, i, s) {
        this.ws = t;
        this.bs = e;
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

const pn = /*@__PURE__*/ Ae("ISanitizer", t => t.singleton(class {
    sanitize() {
        throw createMappedError(99, "sanitize");
    }
}));

class SanitizeValueConverter {
    constructor() {
        this.Rs = g(pn);
    }
    toView(t) {
        if (t == null) {
            return null;
        }
        return this.Rs.sanitize(t);
    }
}

SanitizeValueConverter.$au = {
    type: Ze,
    name: "sanitize"
};

class Show {
    constructor() {
        this.el = g(ze);
        this.p = g(We);
        this.Ts = false;
        this.L = false;
        this.$val = "";
        this.$prio = "";
        this.update = () => {
            this.L = false;
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
        const t = g(X);
        this.Es = this.Ls = t.alias !== "hide";
    }
    binding() {
        this.Ts = true;
        this.update();
    }
    detaching() {
        this.Ts = false;
        this.L = false;
    }
    valueChanged() {
        if (this.Ts && !this.L) {
            this.L = true;
            Ct(this.update);
        }
    }
}

Show.$au = {
    type: Ge,
    name: "show",
    bindables: [ "value" ],
    aliases: [ "hide" ]
};

const vn = [ Ws, Wt, NodeObserverLocator ];

const xn = [ et, it, st, ai ];

const yn = [ nt, rt ];

const wn = [ ot, lt, ht, at, ct, ut, ft, dt, mt, gt, pt, vt, xt ];

const bn = [ DebounceBindingBehavior, OneTimeBindingBehavior, ToViewBindingBehavior, FromViewBindingBehavior, SignalBindingBehavior, ThrottleBindingBehavior, TwoWayBindingBehavior, SanitizeValueConverter, If, Else, Repeat, With, Switch, Case, DefaultCase, PromiseTemplateController, PendingTemplateController, FulfilledTemplateController, RejectedTemplateController, PromiseAttributePattern, FulfilledAttributePattern, RejectedAttributePattern, AttrBindingBehavior, SelfBindingBehavior, UpdateTriggerBindingBehavior, AuCompose, Portal, Focus, Show, AuSlot ];

const kn = [ Si, Ai, Ci, Bi, xi, yi, wi, bi, ki, Ei, qi, Li, Mi, Di, Pi, Ri, Ii, _i ];

const Cn = /*@__PURE__*/ createConfiguration(r);

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
            return e.register(Ee(Pt, i.coercingOptions), Gt, ...vn, ...bn, ...xn, ...wn, ...kn);
        },
        customize(e) {
            return createConfiguration(e ?? t);
        }
    };
}

function children(t, i) {
    if (!children.mixed) {
        children.mixed = true;
        Tt(ChildrenBinding, null);
        lifecycleHooks()(ChildrenLifecycleHooks, null);
    }
    let s;
    const n = se("dependencies");
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
        this.Ms = v;
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
        Ee(Qe, this).register(t);
    }
    hydrating(t, e) {
        const i = this.tt;
        const s = i.query ?? "*";
        const n = new ChildrenBinding(e.host, t, t[i.callback ?? `${re(i.name)}Changed`], s, i.filter, i.map);
        if (/[\s>]/.test(s)) {
            throw createMappedError(9989, s);
        }
        de(t, i.name, {
            enumerable: true,
            configurable: true,
            get: ae(() => n.getValue(), {
                getObserver: () => n
            }),
            set: () => {}
        });
        e.addBinding(n);
    }
}

export { AdoptedStyleSheetsStyles, AppRoot, Ne as AppTask, ArrayLikeHandler, AttrBindingBehavior, AttrMapper, AttributeBinding, qi as AttributeBindingRenderer, AttributeNSAccessor, AuCompose, AuSlot, AuSlotsInfo, Aurelia, Be as Bindable, BindableDefinition, qe as BindingBehavior, BindingBehaviorDefinition, BindingModeBehavior, BindingTargetSubscriber, CSSModulesProcessorRegistry, Case, CheckedObserver, ChildrenBinding, ClassAttributeAccessor, ComputedWatcher, ContentBinding, Controller, Ke as CustomAttribute, CustomAttributeDefinition, wi as CustomAttributeRenderer, Fs as CustomElement, CustomElementDefinition, yi as CustomElementRenderer, DataAttributeAccessor, DebounceBindingBehavior, wn as DefaultBindingLanguage, xn as DefaultBindingSyntax, DefaultCase, vn as DefaultComponents, kn as DefaultRenderers, bn as DefaultResources, Else, EventModifier, ai as EventModifierRegistration, ExpressionWatcher, FlushQueue, Focus, FragmentNodeSequence, FromViewBindingBehavior, FulfilledTemplateController, Os as IAppRoot, $e as IAppTask, gi as IAuSlotWatcher, mi as IAuSlotsInfo, $s as IAurelia, ys as IController, hi as IEventModifier, Ss as IEventTarget, si as IFlushQueue, Ms as IHistory, ws as IHydrationContext, li as IKeyMapping, Qe as ILifecycleHooks, Ti as IListenerBindingOptions, Ls as ILocation, oi as IModifiedEventHandlerCreator, ze as INode, We as IPlatform, As as IRenderLocation, vi as IRenderer, ji as IRendering, en as IRepeatableHandler, tn as IRepeatableHandlerResolver, Ns as ISVGAnalyzer, pn as ISanitizer, Gi as IShadowDOMGlobalStyles, zi as IShadowDOMStyleFactory, Ui as IShadowDOMStyles, Fe as ISignaler, ci as IViewFactory, Es as IWindow, If, InterpolationBinding, Bi as InterpolationBindingRenderer, InterpolationPartBinding, Ai as IteratorBindingRenderer, LetBinding, ki as LetElementRenderer, Ye as LifecycleHooks, LifecycleHooksDefinition, LifecycleHooksEntry, ListenerBinding, ListenerBindingOptions, Ei as ListenerBindingRenderer, ns as MountTarget, NodeObserverLocator, NoopSVGAnalyzer, OneTimeBindingBehavior, PendingTemplateController, Portal, PromiseTemplateController, PropertyBinding, Si as PropertyBindingRenderer, RefBinding, Ci as RefBindingRenderer, RejectedTemplateController, Rendering, Repeat, Ws as RuntimeTemplateCompilerImplementation, SVGAnalyzer, SanitizeValueConverter, SelectValueObserver, SelfBindingBehavior, Li as SetAttributeRenderer, Mi as SetClassAttributeRenderer, xi as SetPropertyRenderer, Di as SetStyleAttributeRenderer, ShadowDOMRegistry, yn as ShortHandBindingSyntax, SignalBindingBehavior, Ii as SpreadRenderer, Cn as StandardConfiguration, xs as State, StyleAttributeAccessor, Xi as StyleConfiguration, StyleElementStyles, Pi as StylePropertyBindingRenderer, Switch, bi as TemplateControllerRenderer, Ri as TextBindingRenderer, ThrottleBindingBehavior, ToViewBindingBehavior, TwoWayBindingBehavior, UpdateTriggerBindingBehavior, ValueAttributeObserver, ti as ValueConverter, ValueConverterDefinition, ViewFactory, Ue as Watch, With, alias, bindable, bindingBehavior, capture, children, coercer, containerless, convertToRenderLocation, cssModules, customAttribute, customElement, getEffectiveParentNode, isCustomElementController, isCustomElementViewModel, isRenderLocation, lifecycleHooks, ii as mixinAstEvaluator, ei as mixinUseScope, ni as mixingBindingLimited, processContent, je as refs, registerAliases, registerHostNode, renderer, setEffectiveParentNode, shadowCSS, slotted, templateController, useShadowDOM, valueConverter, watch };
//# sourceMappingURL=index.mjs.map
