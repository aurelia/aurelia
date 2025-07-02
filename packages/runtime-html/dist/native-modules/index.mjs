import { Protocol as t, isString as e, createLookup as i, getPrototypeChain as s, kebabCase as n, noop as r, DI as l, Registration as h, firstDefined as a, mergeArrays as c, isFunction as u, resourceBaseName as f, resource as d, getResourceKeyFor as m, resolve as g, IPlatform as p, emptyArray as v, ILogger as x, registrableMetadataKey as y, isArray as w, all as b, isObject as k, own as C, InstanceProvider as B, IContainer as S, toArray as A, areEqual as R, optionalResource as T, optional as E, onResolveAll as L, isPromise as M, onResolve as D, fromDefinitionOrDefault as P, pascalCase as q, fromAnnotationOrDefinitionOrTypeOrDefault as I, fromAnnotationOrTypeOrDefault as _, isSymbol as V, createImplementationRegister as F, IServiceLocator as H, emptyObject as O, isNumber as $, isSet as N, isMap as W, transient as j } from "../../../kernel/dist/native-modules/index.mjs";

import { BindingMode as z, InstructionType as U, ITemplateCompiler as G, IInstruction as X, TemplateCompilerHooks as K, IAttrMapper as Q, IResourceResolver as Y, TemplateCompiler as Z, AttributePattern as J, AttrSyntax as tt, RefAttributePattern as et, DotSeparatedAttributePattern as it, EventAttributePattern as st, AtPrefixedTriggerAttributePattern as nt, ColonPrefixedBindAttributePattern as rt, DefaultBindingCommand as ot, OneTimeBindingCommand as lt, FromViewBindingCommand as ht, ToViewBindingCommand as at, TwoWayBindingCommand as ct, ForBindingCommand as ut, RefBindingCommand as ft, TriggerBindingCommand as dt, CaptureBindingCommand as mt, ClassBindingCommand as gt, StyleBindingCommand as pt, AttrBindingCommand as vt, SpreadValueBindingCommand as xt } from "../../../template-compiler/dist/native-modules/index.mjs";

export { BindingCommand, BindingMode } from "../../../template-compiler/dist/native-modules/index.mjs";

import { Metadata as yt } from "../../../metadata/dist/native-modules/index.mjs";

import { AccessorType as wt, astEvaluate as bt, queueAsyncTask as kt, queueTask as Ct, astBind as Bt, astUnbind as St, connectable as At, astAssign as Rt, subscriberCollection as Tt, Scope as Et, IObserverLocator as Lt, ConnectableSwitcher as Mt, ProxyObservable as Dt, ICoercionConfiguration as Pt, tasksSettled as qt, PropertyAccessor as It, INodeObserverLocator as _t, IDirtyChecker as Vt, getObserverLookup as Ft, SetterObserver as Ht, createIndexMap as Ot, getCollectionObserver as $t, BindingContext as Nt, TaskAbortError as Wt, DirtyChecker as jt } from "../../../runtime/dist/native-modules/index.mjs";

import { BrowserPlatform as zt } from "../../../platform-browser/dist/native-modules/index.mjs";

import { AccessScopeExpression as Ut, IExpressionParser as Gt, ExpressionParser as Xt } from "../../../expression-parser/dist/native-modules/index.mjs";

typeof SuppressedError === "function" ? SuppressedError : function(t, e, i) {
    var s = new Error(i);
    return s.name = "SuppressedError", s.error = t, s.suppressed = e, s;
};

const {default: Kt, oneTime: Qt, toView: Yt, fromView: Zt, twoWay: Jt} = z;

const te = yt.get;

const ee = yt.has;

const ie = yt.define;

const {annotation: se} = t;

const ne = se.keyFor;

const re = Object;

const oe = String;

const le = re.prototype;

const he = le.hasOwnProperty;

const ae = re.freeze;

const ce = re.assign;

const ue = re.getOwnPropertyNames;

const fe = re.keys;

const de = /*@__PURE__*/ i();

const isDataAttribute = (t, i, s) => {
    if (de[i] === true) {
        return true;
    }
    if (!e(i)) {
        return false;
    }
    const n = i.slice(0, 5);
    return de[i] = n === "aria-" || n === "data-" || s.isStandardSvgAttribute(t, i);
};

const rethrow = t => {
    throw t;
};

const me = Reflect.defineProperty;

const defineHiddenProp = (t, e, i) => {
    me(t, e, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: i
    });
    return i;
};

const addSignalListener = (t, e, i) => t.addSignalListener(e, i);

const removeSignalListener = (t, e, i) => t.removeSignalListener(e, i);

const ge = "Interpolation";

const pe = "IsIterator";

const ve = "IsFunction";

const xe = "IsProperty";

const ye = "pending";

const we = "running";

const be = wt.Observer;

const ke = wt.Node;

const Ce = wt.Layout;

const createMappedError = (t, ...e) => {
    const i = oe(t).padStart(4, "0");
    return new Error(`AUR${i}:${e.map(oe)}`);
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
        const l = e.metadata[Be] ??= i();
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

const Be = /*@__PURE__*/ ne("bindables");

const Se = ae({
    name: Be,
    keyFrom: t => `${Be}:${t}`,
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
                fe(t).forEach(e => addDescription(e, t[e]));
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
            const t = te(Be, r);
            if (t == null) continue;
            e.push(...Object.values(t));
        }
        return e;
    },
    i(t, e) {
        let s = te(Be, e);
        if (s == null) {
            ie(s = i(), e, Be);
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
        const s = i.mode ?? Yt;
        return new BindableDefinition(i.attribute ?? n(t), i.callback ?? `${t}Changed`, e(s) ? z[s] ?? Kt : s, i.primary ?? false, i.name ?? t, i.set ?? getInterceptor(i));
    }
}

function coercer(t, e) {
    e.addInitializer(function() {
        Ae.define(this, e.name);
    });
}

const Ae = {
    key: /*@__PURE__*/ ne("coercer"),
    define(t, e) {
        ie(t[e].bind(t), t, Ae.key);
    },
    for(t) {
        return te(Ae.key, t);
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
            i = typeof t === "function" ? t.bind(e) : Ae.for(e) ?? r;
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

const Re = l.createInterface;

const Te = h.singleton;

const Ee = h.aliasTo;

const Le = h.instance;

h.callback;

h.transient;

const registerResolver = (t, e, i) => t.registerResolver(e, i);

function alias(...t) {
    return function(e, i) {
        i.addInitializer(function() {
            const e = ne("aliases");
            const i = te(e, this);
            if (i === void 0) {
                ie(t, this, e);
            } else {
                i.push(...t);
            }
        });
    };
}

function registerAliases(t, e, i, s) {
    for (let n = 0, r = t.length; n < r; ++n) {
        Ee(i, e.keyFrom(t[n])).register(s);
    }
}

const Me = "custom-element";

const De = "custom-attribute";

const getDefinitionFromStaticAu = (t, e, i, s = "__au_static_resource__") => {
    let n = te(s, t);
    if (n == null) {
        if (t.$au?.type === e) {
            n = i(t.$au, t);
            ie(n, t, s);
        }
    }
    return n;
};

function bindingBehavior(t) {
    return function(e, i) {
        i.addInitializer(function() {
            Ie.define(t, this);
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
        return new BindingBehaviorDefinition(i, a(getBehaviorAnnotation(i, "name"), s), c(getBehaviorAnnotation(i, "aliases"), n.aliases, i.aliases), Ie.keyFrom(s));
    }
    register(t, e) {
        const i = this.Type;
        const s = typeof e === "string" ? getBindingBehaviorKeyFrom(e) : this.key;
        const n = this.aliases;
        if (!t.has(s, false)) {
            t.register(t.has(i, false) ? null : Te(i, i), Ee(i, s), ...n.map(t => Ee(i, getBindingBehaviorKeyFrom(t))));
        }
    }
}

const Pe = "binding-behavior";

const qe = /*@__PURE__*/ m(Pe);

const getBehaviorAnnotation = (t, e) => te(ne(e), t);

const getBindingBehaviorKeyFrom = t => `${qe}:${t}`;

const Ie = /*@__PURE__*/ ae({
    name: qe,
    keyFrom: getBindingBehaviorKeyFrom,
    isType(t) {
        return u(t) && (ee(qe, t) || t.$au?.type === Pe);
    },
    define(t, e) {
        const i = BindingBehaviorDefinition.create(t, e);
        const s = i.Type;
        ie(i, s, qe, f);
        return s;
    },
    getDefinition(t) {
        const e = te(qe, t) ?? getDefinitionFromStaticAu(t, Pe, BindingBehaviorDefinition.create);
        if (e === void 0) {
            throw createMappedError(151, t);
        }
        return e;
    },
    find(t, e) {
        const i = t.find(Pe, e);
        return i == null ? null : te(qe, i) ?? getDefinitionFromStaticAu(i, Pe, BindingBehaviorDefinition.create) ?? null;
    },
    get(t, e) {
        return t.get(d(getBindingBehaviorKeyFrom(e)));
    }
});

const _e = new Map;

const createConfig = t => ({
    type: Pe,
    name: t
});

class BindingModeBehavior {
    bind(t, e) {
        _e.set(e, e.mode);
        e.mode = this.mode;
    }
    unbind(t, e) {
        e.mode = _e.get(e);
        _e.delete(e);
    }
}

class OneTimeBindingBehavior extends BindingModeBehavior {
    get mode() {
        return Qt;
    }
}

OneTimeBindingBehavior.$au = createConfig("oneTime");

class ToViewBindingBehavior extends BindingModeBehavior {
    get mode() {
        return Yt;
    }
}

ToViewBindingBehavior.$au = createConfig("toView");

class FromViewBindingBehavior extends BindingModeBehavior {
    get mode() {
        return Zt;
    }
}

FromViewBindingBehavior.$au = createConfig("fromView");

class TwoWayBindingBehavior extends BindingModeBehavior {
    get mode() {
        return Jt;
    }
}

TwoWayBindingBehavior.$au = createConfig("twoWay");

const Ve = new WeakMap;

const Fe = 200;

class DebounceBindingBehavior {
    constructor() {
        this.p = g(p);
    }
    bind(t, i, s, n) {
        const r = {
            type: "debounce",
            delay: s ?? Fe,
            now: this.p.performanceNow,
            queue: this.p.taskQueue,
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

DebounceBindingBehavior.$au = {
    type: Pe,
    name: "debounce"
};

const He = /*@__PURE__*/ Re("ISignaler", t => t.singleton(Signaler));

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
        this.u = g(He);
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
    type: Pe,
    name: "signal"
};

const Oe = new WeakMap;

const $e = 200;

class ThrottleBindingBehavior {
    constructor() {
        ({performanceNow: this.C, taskQueue: this.B} = g(p));
    }
    bind(t, i, s, n) {
        const r = {
            type: "throttle",
            delay: s ?? $e,
            now: this.C,
            queue: this.B,
            signals: e(n) ? [ n ] : n ?? v
        };
        const l = i.limit?.(r);
        if (l == null) ; else {
            Oe.set(i, l);
        }
    }
    unbind(t, e) {
        Oe.get(e)?.dispose();
        Oe.delete(e);
    }
}

ThrottleBindingBehavior.$au = {
    type: Pe,
    name: "throttle"
};

const Ne = /*@__PURE__*/ Re("IAppTask");

class $AppTask {
    constructor(t, e, i) {
        this.c = void 0;
        this.slot = t;
        this.k = e;
        this.cb = i;
    }
    register(t) {
        return this.c = t.register(Le(Ne, this));
    }
    run() {
        const t = this.k;
        const e = this.cb;
        return t === null ? e() : e(this.c.get(t));
    }
}

const We = ae({
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

const je = p;

class Refs {}

const ze = /*@__PURE__*/ (() => {
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

const Ue = /*@__PURE__*/ Re("INode");

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
                throw createMappedError(773, `${oe(e)}@${s.name}}`);
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
            Ge.add(t, a);
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

const Ge = /*@__PURE__*/ (() => {
    const t = new WeakMap;
    return ae({
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
        return De;
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
        const r = a(getAttributeAnnotation(i, "defaultBindingMode"), n.defaultBindingMode, i.defaultBindingMode, Yt);
        for (const t of Object.values(Se.from(n.bindables))) {
            Se.i(t, i);
        }
        return new CustomAttributeDefinition(i, a(getAttributeAnnotation(i, "name"), s), c(getAttributeAnnotation(i, "aliases"), n.aliases, i.aliases), getAttributeKeyFrom(s), e(r) ? z[r] ?? Kt : r, a(getAttributeAnnotation(i, "isTemplateController"), n.isTemplateController, i.isTemplateController, false), Se.from(...Se.getAll(i), getAttributeAnnotation(i, "bindables"), i.bindables, n.bindables), a(getAttributeAnnotation(i, "noMultiBindings"), n.noMultiBindings, i.noMultiBindings, false), c(Ge.getDefinitions(i), i.watches), c(getAttributeAnnotation(i, "dependencies"), n.dependencies, i.dependencies), a(getAttributeAnnotation(i, "containerStrategy"), n.containerStrategy, i.containerStrategy, "reuse"));
    }
    register(t, e) {
        const i = this.Type;
        const s = typeof e === "string" ? getAttributeKeyFrom(e) : this.key;
        const n = this.aliases;
        if (!t.has(s, false)) {
            t.register(t.has(i, false) ? null : Te(i, i), Ee(i, s), ...n.map(t => Ee(i, getAttributeKeyFrom(t))));
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

const Xe = "custom-attribute";

const Ke = /*@__PURE__*/ m(Xe);

const getAttributeKeyFrom = t => `${Ke}:${t}`;

const getAttributeAnnotation = (t, e) => te(ne(e), t);

const isAttributeType = t => u(t) && (ee(Ke, t) || t.$au?.type === Xe);

const findAttributeControllerFor = (t, e) => ze.get(t, getAttributeKeyFrom(e)) ?? void 0;

const defineAttribute = (t, e) => {
    const i = CustomAttributeDefinition.create(t, e);
    const s = i.Type;
    ie(i, s, Ke, f);
    return s;
};

const getAttributeDefinition = t => {
    const e = te(Ke, t) ?? getDefinitionFromStaticAu(t, Xe, CustomAttributeDefinition.create);
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
        const t = ze.get(r, s);
        if (t?.is(n)) {
            return t;
        }
        r = getEffectiveParentNode(r);
    }
    return null;
};

const Qe = /*@__PURE__*/ ae({
    name: Ke,
    keyFrom: getAttributeKeyFrom,
    isType: isAttributeType,
    for: findAttributeControllerFor,
    closest: findClosestControllerByName,
    define: defineAttribute,
    getDefinition: getAttributeDefinition,
    annotate(t, e, i) {
        ie(i, t, ne(e));
    },
    getAnnotation: getAttributeAnnotation,
    find(t, e) {
        const i = t.find(Xe, e);
        return i === null ? null : te(Ke, i) ?? getDefinitionFromStaticAu(i, Xe, CustomAttributeDefinition.create) ?? null;
    }
});

const Ye = /*@__PURE__*/ Re("ILifecycleHooks");

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
        while (s !== le) {
            for (const t of ue(s)) {
                if (t !== "constructor" && !t.startsWith("_")) {
                    i.add(t);
                }
            }
            s = Object.getPrototypeOf(s);
        }
        return new LifecycleHooksDefinition(e, i);
    }
}

const Ze = /*@__PURE__*/ (() => {
    const t = new WeakMap;
    const e = new WeakMap;
    return ae({
        define(t, i) {
            const s = LifecycleHooksDefinition.create(t, i);
            const n = s.Type;
            e.set(n, s);
            return {
                register(t) {
                    Te(Ye, n).register(t);
                }
            };
        },
        resolve(i) {
            let s = t.get(i);
            if (s === void 0) {
                t.set(i, s = new LifecycleHooksLookupImpl);
                const n = i.root;
                const r = n === i ? i.getAll(Ye) : i.has(Ye, false) ? n.getAll(Ye).concat(i.getAll(Ye)) : n.getAll(Ye);
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
        i[y] = Ze.define({}, t);
        return t;
    }
    return t == null ? decorator : decorator(t, e);
}

function valueConverter(t) {
    return function(e, i) {
        i.addInitializer(function() {
            ei.define(t, this);
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
        return new ValueConverterDefinition(i, a(getConverterAnnotation(i, "name"), s), c(getConverterAnnotation(i, "aliases"), n.aliases, i.aliases), ei.keyFrom(s));
    }
    register(t, e) {
        const i = this.Type;
        const s = typeof e === "string" ? getValueConverterKeyFrom(e) : this.key;
        const n = this.aliases;
        if (!t.has(s, false)) {
            t.register(t.has(i, false) ? null : Te(i, i), Ee(i, s), ...n.map(t => Ee(i, getValueConverterKeyFrom(t))));
        }
    }
}

const Je = "value-converter";

const ti = /*@__PURE__*/ m(Je);

const getConverterAnnotation = (t, e) => te(ne(e), t);

const getValueConverterKeyFrom = t => `${ti}:${t}`;

const ei = ae({
    name: ti,
    keyFrom: getValueConverterKeyFrom,
    isType(t) {
        return u(t) && (ee(ti, t) || t.$au?.type === Je);
    },
    define(t, e) {
        const i = ValueConverterDefinition.create(t, e);
        const s = i.Type;
        ie(i, s, ti, f);
        return s;
    },
    getDefinition(t) {
        const e = te(ti, t) ?? getDefinitionFromStaticAu(t, Je, ValueConverterDefinition.create);
        if (e === void 0) {
            throw createMappedError(152, t);
        }
        return e;
    },
    annotate(t, e, i) {
        ie(i, t, ne(e));
    },
    getAnnotation: getConverterAnnotation,
    find(t, e) {
        const i = t.find(Je, e);
        return i == null ? null : te(ti, i) ?? getDefinitionFromStaticAu(i, Je, ValueConverterDefinition.create) ?? null;
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

const ii = /*@__PURE__*/ (() => {
    function useScope(t) {
        this.s = t;
    }
    return t => {
        defineHiddenProp(t.prototype, "useScope", useScope);
    };
})();

const si = /*@__PURE__*/ (() => {
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
        return s[i] ??= Ie.get(t.l, i);
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
        return s[i] ??= ei.get(e.l, i);
    }
    function evaluatorBindConverter(t) {
        const e = evaluatorGetConverter(this, t);
        if (e == null) {
            throw createMappedError(103, t);
        }
        const i = e.signals;
        if (i != null) {
            const t = this.l.get(He);
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
        const i = this.l.get(He);
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
            const t = this.l.get(bs);
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

const ni = /*@__PURE__*/ Re("IFlushQueue", t => t.singleton(FlushQueue));

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

const ri = /*@__PURE__*/ (() => {
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
            l = s?.status === ye;
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
            a = s?.status === ye;
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
            const r = n.length > 0 ? this.get(He) : null;
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

const oi = ((t = new WeakSet) => e => function() {
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
                let r = oe(t);
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
                    i.setAttribute(s, oe(t));
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
            const t = bt(this.ast, this.s, this, (this.mode & Yt) > 0 ? this : null);
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
        if (this.mode & (Yt | Qt)) {
            this.updateTarget(this.v = bt(this.ast, t, this, (this.mode & Yt) > 0 ? this : null));
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

AttributeBinding.mix = oi(() => {
    ii(AttributeBinding);
    ri(AttributeBinding, () => "updateTarget");
    At(AttributeBinding, null);
    si(AttributeBinding);
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
        const t = this.P.state !== ds && (this.I.type & Ce) > 0;
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
            l = n[0] + t[0].v + n[1];
        } else {
            l = n[0];
            for (;r > h; ++h) {
                l += t[h].v + n[h + 1];
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
        this.mode = Yt;
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
        if (!this.isBound) return;
        this.obs.version++;
        const t = bt(this.ast, this.s, this, (this.mode & Yt) > 0 ? this : null);
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
            if (this.s === t) return;
            this.unbind();
        }
        this.s = t;
        Bt(this.ast, t, this);
        this.v = bt(this.ast, this.s, this, (this.mode & Yt) > 0 ? this : null);
        if (w(this.v)) {
            this.observeCollection(this.v);
        }
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

InterpolationPartBinding.mix = oi(() => {
    ii(InterpolationPartBinding);
    ri(InterpolationPartBinding, () => "updateTarget");
    At(InterpolationPartBinding, null);
    si(InterpolationPartBinding);
});

class ContentBinding {
    constructor(t, e, i, s, n, r, l) {
        this.p = s;
        this.ast = n;
        this.target = r;
        this.strict = l;
        this.isBound = false;
        this.mode = Yt;
        this.L = false;
        this.v = "";
        this.V = false;
        this.boundFn = false;
        this.l = e;
        this.P = t;
        this.oL = i;
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
        e.textContent = oe(t ?? "");
    }
    handleChange() {
        if (!this.isBound) return;
        if (this.L) return;
        this.L = true;
        Ct(() => {
            this.L = false;
            if (!this.isBound) return;
            this.obs.version++;
            const t = bt(this.ast, this.s, this, (this.mode & Yt) > 0 ? this : null);
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
            const t = this.v = bt(this.ast, this.s, this, (this.mode & Yt) > 0 ? this : null);
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
        const e = this.v = bt(this.ast, this.s, this, (this.mode & Yt) > 0 ? this : null);
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
        if (this.V) {
            this.v.parentNode?.removeChild(this.v);
        }
        this.s = void 0;
        this.obs.clearAll();
    }
}

ContentBinding.mix = oi(() => {
    ii(ContentBinding);
    ri(ContentBinding, () => "updateTarget");
    At(ContentBinding, null);
    si(ContentBinding);
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
        this.F = n;
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
        this.target = this.F ? t.bindingContext : t.overrideContext;
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

LetBinding.mix = oi(() => {
    ii(LetBinding);
    ri(LetBinding, () => "updateTarget");
    At(LetBinding, null);
    si(LetBinding);
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
        this.H = null;
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
        const t = this.P.state !== ds && (this.I.type & Ce) > 0;
        if (t) {
            if (this.L) return;
            this.L = true;
            Ct(() => {
                this.L = false;
                if (!this.isBound) return;
                this.O();
            });
        } else {
            this.O();
        }
    }
    O() {
        this.obs.version++;
        const t = bt(this.ast, this.s, this, (this.mode & Yt) > 0 ? this : null);
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
            if (i & Zt) {
                s = e.getObserver(this.target, this.targetProperty);
            } else {
                s = e.getAccessor(this.target, this.targetProperty);
            }
            this.I = s;
        }
        const n = (i & Yt) > 0;
        if (i & (Yt | Qt)) {
            this.updateTarget(bt(this.ast, this.s, this, n ? this : null));
        }
        if (i & Zt) {
            s.subscribe(this.H ??= new BindingTargetSubscriber(this, this.l.get(ni)));
            if (!n) {
                this.updateSource(s.getValue(this.target, this.targetProperty));
            }
        }
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) return;
        this.isBound = false;
        St(this.ast, this.s, this);
        this.s = void 0;
        if (this.H) {
            this.I.unsubscribe(this.H);
            this.H = null;
        }
        this.obs.clearAll();
    }
    useTargetObserver(t) {
        this.I?.unsubscribe(this);
        (this.I = t).subscribe(this);
    }
    useTargetSubscriber(t) {
        if (this.H != null) {
            throw createMappedError(9995);
        }
        this.H = t;
    }
}

PropertyBinding.mix = oi(() => {
    ii(PropertyBinding);
    ri(PropertyBinding, t => t.mode & Zt ? "updateSource" : "updateTarget");
    At(PropertyBinding, null);
    si(PropertyBinding);
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

RefBinding.mix = oi(() => {
    At(RefBinding, null);
    ri(RefBinding, () => "updateSource");
    ii(RefBinding);
    si(RefBinding);
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
            if (this.s === t) return;
            this.unbind();
        }
        this.s = t;
        Bt(this.ast, t, this);
        this.target.addEventListener(this.targetEvent, this, this.N);
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) return;
        this.isBound = false;
        St(this.ast, this.s, this);
        this.s = void 0;
        this.target.removeEventListener(this.targetEvent, this, this.N);
    }
}

ListenerBinding.mix = oi(function() {
    ii(ListenerBinding);
    ri(ListenerBinding, () => "callSource");
    si(ListenerBinding);
});

const li = /*@__PURE__*/ Re("IEventModifier");

const hi = /*@__PURE__*/ Re("IKeyMapping", t => t.instance({
    meta: ae([ "ctrl", "alt", "shift", "meta" ]),
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
        this.W = g(hi);
        this.j = [ "left", "middle", "right" ];
    }
    static register(t) {
        t.register(Te(li, ModifiedMouseEventHandler));
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
        this.W = g(hi);
        this.type = [ "keydown", "keyup" ];
    }
    static register(t) {
        t.register(Te(li, ModifiedKeyboardEventHandler));
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
        t.register(Te(li, ModifiedEventHandler));
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

const ai = /*@__PURE__*/ Re("IEventModifierHandler", t => t.instance({
    getHandler: () => null
}));

class EventModifier {
    constructor() {
        this.U = g(b(li)).reduce((t, e) => {
            const i = w(e.type) ? e.type : [ e.type ];
            i.forEach(i => t[i] = e);
            return t;
        }, {});
    }
    static register(t) {
        t.register(Te(ai, EventModifier));
    }
    getHandler(t, i) {
        return e(i) ? (this.U[t] ?? this.U.$ALL)?.getHandler(i) ?? null : null;
    }
}

const ci = {
    register(t) {
        t.register(EventModifier, ModifiedMouseEventHandler, ModifiedKeyboardEventHandler, ModifiedEventHandler);
    }
};

const ui = /*@__PURE__*/ Re("IViewFactory");

class ViewFactory {
    constructor(t, e) {
        this.isCaching = false;
        this.G = null;
        this.X = -1;
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
            if (this.X === -1 || !i) {
                this.X = t;
            }
        }
        if (this.X > 0) {
            this.G = [];
        } else {
            this.G = null;
        }
        this.isCaching = this.X > 0;
    }
    canReturnToCache(t) {
        return this.G != null && this.G.length < this.X;
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

const fi = /*@__PURE__*/ (() => {
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

const di = "default";

const mi = "au-slot";

const gi = /*@__PURE__*/ Re("IAuSlotsInfo");

class AuSlotsInfo {
    constructor(t) {
        this.projectedSlots = t;
    }
}

const pi = /*@__PURE__*/ Re("IAuSlotWatcher");

class AuSlotWatcherBinding {
    constructor(t, e, i, s) {
        this.K = new Set;
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
        if (!this.K.has(t)) {
            this.K.add(t);
            t.subscribe(this);
        }
    }
    unwatch(t) {
        if (this.K.delete(t)) {
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
        for (r of this.K) {
            for (l of r === t ? e : r.nodes) {
                if (n === "$all" || isElement(l) && (n === "*" || l.matches(n))) {
                    s[s.length] = l;
                }
            }
        }
        if (s.length !== i.length || s.some((t, e) => t !== i[e])) {
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
        Le(Ye, this).register(t);
    }
    hydrating(t, e) {
        const i = this.J;
        const s = new AuSlotWatcherBinding(t, i.callback ?? `${oe(i.name)}Changed`, i.slotName ?? "default", i.query ?? "*");
        me(t, i.name, {
            enumerable: true,
            configurable: true,
            get: ce(() => s.getValue(), {
                getObserver: () => s
            }),
            set: () => {}
        });
        Le(pi, s).register(e.container);
        e.addBinding(s);
    }
}

function slotted(t, e) {
    if (!vi) {
        vi = true;
        Tt(AuSlotWatcherBinding, null);
        lifecycleHooks()(SlottedLifecycleHooks, null);
    }
    const i = ne("dependencies");
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

let vi = false;

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
        if (this.isBound) return;
        this.isBound = true;
        const e = this.scope = this.et.controller.scope.parent ?? void 0;
        if (e == null) {
            throw createMappedError(9999);
        }
        this.tt.forEach(t => t.bind(e));
    }
    unbind() {
        this.tt.forEach(t => t.unbind());
        this.isBound = false;
    }
    addBinding(t) {
        this.tt.push(t);
    }
    addChild(t) {
        if (t.vmKind !== cs) {
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
        this.it = {};
        this.st = new WeakMap;
        this.P = t;
        this.oL = n;
        this.l = r;
    }
    updateTarget() {
        this.obs.version++;
        const t = bt(this.ast, this.s, this, this);
        this.obs.clear();
        this.nt(t, true);
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
        this.nt(e, false);
    }
    unbind() {
        if (!this.isBound) return;
        this.isBound = false;
        St(this.ast, this.s, this);
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
            this.st.set(t, n = Et.fromParent(this.s, t));
        }
        for (i of this.targetKeys) {
            s = this.it[i];
            if (i in t) {
                if (s == null) {
                    s = this.it[i] = new PropertyBinding(this.P, this.l, this.oL, SpreadValueBinding.rt[i] ??= new Ut(i, 0), this.target, i, z.toView, this.strict);
                }
                s.bind(n);
            } else if (e) {
                s?.unbind();
            }
        }
    }
}

SpreadValueBinding.mix = oi(() => {
    ii(SpreadValueBinding);
    ri(SpreadValueBinding, () => "updateTarget");
    At(SpreadValueBinding, null);
    si(SpreadValueBinding);
});

SpreadValueBinding.rt = {};

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
                addListener(this.ot, e, this);
            }
            this.lt = true;
            this.ht?.();
        }
    });
    defineHiddenProp(i, "unsubscribe", function(t) {
        if (this.subs.remove(t) && this.subs.count === 0) {
            for (e of this.cf.events) {
                removeListener(this.ot, e, this);
            }
            this.lt = false;
            this.ct?.();
        }
    });
    defineHiddenProp(i, "useConfig", function(t) {
        this.cf = t;
        if (this.lt) {
            for (e of this.cf.events) {
                removeListener(this.ot, e, this);
            }
            for (e of this.cf.events) {
                addListener(this.ot, e, this);
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
        this.type = ke | Ce;
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
        return i.get(bs).controller.container.get(C(t));
    }
});

const xi = /*@__PURE__*/ Re("IRenderer");

function renderer(t, e) {
    const i = e?.metadata ?? (t[Symbol.metadata] ??= Object.create(null));
    i[y] = {
        register(e) {
            Te(xi, t).register(e);
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

const yi = /*@__PURE__*/ renderer(class SetPropertyRenderer {
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

const wi = /*@__PURE__*/ renderer(class CustomElementRenderer {
    constructor() {
        this.r = g(zi);
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
            l = Hs.find(f, c);
            if (l == null) {
                throw createMappedError(752, i, t);
            }
            break;

          default:
            l = c;
        }
        const d = i.containerless || l.containerless;
        const m = d ? convertToRenderLocation(e) : null;
        const g = createElementContainer(s, t, e, i, m, u == null ? void 0 : new AuSlotsInfo(fe(u)));
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

const bi = /*@__PURE__*/ renderer(class CustomAttributeRenderer {
    constructor() {
        this.r = g(zi);
        this.target = U.hydrateAttribute;
    }
    render(t, e, i, s, n, r) {
        let l = t.container;
        let h;
        switch (typeof i.res) {
          case "string":
            h = Qe.find(l, i.res);
            if (h == null) {
                throw createMappedError(753, i, t);
            }
            break;

          default:
            h = i.res;
        }
        const a = invokeAttribute(s, h, t, e, i, void 0, void 0);
        const c = Controller.$attr(a.ctn, a.vm, e, h);
        ze.set(e, h.key, c);
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

const ki = /*@__PURE__*/ renderer(class TemplateControllerRenderer {
    constructor() {
        this.r = g(zi);
        this.target = U.hydrateTemplateController;
    }
    render(t, e, i, s, n, r) {
        let l = t.container;
        let h;
        switch (typeof i.res) {
          case "string":
            h = Qe.find(l, i.res);
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
        ze.set(c, h.key, f);
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

const Ci = /*@__PURE__*/ renderer(class LetElementRenderer {
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
            f = ensureExpression(n, u.from, xe);
            t.addBinding(new LetBinding(a, r, f, u.to, h, t.strict ?? false));
            ++d;
        }
    }
}, null);

const Bi = /*@__PURE__*/ renderer(class RefBindingRenderer {
    constructor() {
        this.target = U.refBinding;
        RefBinding.mix();
    }
    render(t, e, i, s, n, r) {
        t.addBinding(new RefBinding(t.container, r, ensureExpression(n, i.from, xe), getRefTarget(e, i.to), t.strict ?? false));
    }
}, null);

const Si = /*@__PURE__*/ renderer(class InterpolationBindingRenderer {
    constructor() {
        this.target = U.interpolation;
        InterpolationPartBinding.mix();
    }
    render(t, e, i, s, n, r) {
        const l = t.container;
        const h = new InterpolationBinding(t, l, r, ensureExpression(n, i.from, ge), getTarget(e), i.to, Yt, t.strict ?? false);
        if (i.to === "class" && h.target.nodeType > 0) {
            const t = l.get(fromHydrationContext(Ts));
            h.useAccessor(new ClassAttributeAccessor(h.target, t));
        }
        t.addBinding(h);
    }
}, null);

const Ai = /*@__PURE__*/ renderer(class PropertyBindingRenderer {
    constructor() {
        this.target = U.propertyBinding;
        PropertyBinding.mix();
    }
    render(t, e, i, s, n, r) {
        const l = t.container;
        const h = new PropertyBinding(t, l, r, ensureExpression(n, i.from, xe), getTarget(e), i.to, i.mode, t.strict ?? false);
        if (i.to === "class" && h.target.nodeType > 0) {
            const t = l.get(fromHydrationContext(Ts));
            h.useTargetObserver(new ClassAttributeAccessor(h.target, t));
        }
        t.addBinding(h);
    }
}, null);

const Ri = /*@__PURE__*/ renderer(class IteratorBindingRenderer {
    constructor() {
        this.target = U.iteratorBinding;
        PropertyBinding.mix();
    }
    render(t, e, i, s, n, r) {
        t.addBinding(new PropertyBinding(t, t.container, r, ensureExpression(n, i.forOf, pe), getTarget(e), i.to, Yt, t.strict ?? false));
    }
}, null);

const Ti = /*@__PURE__*/ renderer(class TextBindingRenderer {
    constructor() {
        this.target = U.textBinding;
        ContentBinding.mix();
    }
    render(t, e, i, s, n, r) {
        t.addBinding(new ContentBinding(t, t.container, r, s, ensureExpression(n, i.from, xe), e, t.strict ?? false));
    }
}, null);

const Ei = Re("IListenerBindingOptions", t => t.singleton(class {
    constructor() {
        this.p = g(je);
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

const Li = /*@__PURE__*/ renderer(class ListenerBindingRenderer {
    constructor() {
        this.target = U.listenerBinding;
        this.gt = g(ai);
        this.vt = g(Ei);
        ListenerBinding.mix();
    }
    render(t, e, i, s, n) {
        t.addBinding(new ListenerBinding(t.container, ensureExpression(n, i.from, ve), e, i.to, new ListenerBindingOptions(this.vt.prevent, i.capture, this.vt.onError), this.gt.getHandler(i.to, i.modifier), t.strict ?? false));
    }
}, null);

const Mi = /*@__PURE__*/ renderer(class SetAttributeRenderer {
    constructor() {
        this.target = U.setAttribute;
    }
    render(t, e, i) {
        e.setAttribute(i.to, i.value);
    }
}, null);

const Di = /*@__PURE__*/ renderer(class SetClassAttributeRenderer {
    constructor() {
        this.target = U.setClassAttribute;
    }
    render(t, e, i) {
        addClasses(e.classList, i.value);
    }
}, null);

const Pi = /*@__PURE__*/ renderer(class SetStyleAttributeRenderer {
    constructor() {
        this.target = U.setStyleAttribute;
    }
    render(t, e, i) {
        e.style.cssText += i.value;
    }
}, null);

const qi = /*@__PURE__*/ renderer(class StylePropertyBindingRenderer {
    constructor() {
        this.target = U.stylePropertyBinding;
        PropertyBinding.mix();
    }
    render(t, e, i, s, n, r) {
        t.addBinding(new PropertyBinding(t, t.container, r, ensureExpression(n, i.from, xe), e.style, i.to, Yt, t.strict ?? false));
    }
}, null);

const Ii = /*@__PURE__*/ renderer(class AttributeBindingRenderer {
    constructor() {
        this.target = U.attributeBinding;
        AttributeBinding.mix();
    }
    render(t, e, i, s, n, r) {
        const l = t.container;
        const h = l.has(Ts, false) ? l.get(Ts) : null;
        t.addBinding(new AttributeBinding(t, l, r, ensureExpression(n, i.from, xe), e, i.attr, h == null ? i.to : i.to.split(/\s/g).map(t => h[t] ?? t).join(" "), Yt, t.strict ?? false));
    }
}, null);

const _i = /*@__PURE__*/ renderer(class SpreadRenderer {
    constructor() {
        this.xt = g(G);
        this.r = g(zi);
        this.target = U.spreadTransferedBinding;
    }
    render(t, e, i, s, n, r) {
        SpreadBinding.create(t.container.get(bs), e, void 0, this.r, this.xt, s, n, r).forEach(e => t.addBinding(e));
    }
}, null);

const Vi = /*@__PURE__*/ renderer(class SpreadValueRenderer {
    constructor() {
        this.target = U.spreadValueBinding;
        SpreadValueBinding.mix();
    }
    render(t, e, i, s, n, r) {
        const l = i.target;
        if (l === "$bindables") {
            t.addBinding(new SpreadValueBinding(t, e.viewModel, fe(e.definition.bindables), n.parse(i.from, xe), r, t.container, t.strict ?? false));
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

const Fi = "IController";

const Hi = "IInstruction";

const Oi = "IRenderLocation";

const $i = "ISlotsInfo";

function createElementContainer(t, e, i, s, n, r) {
    const l = e.container.createChild();
    registerHostNode(l, i, t);
    registerResolver(l, ws, new B(Fi, e));
    registerResolver(l, X, new B(Hi, s));
    registerResolver(l, Rs, n == null ? Ni : new RenderLocationProvider(n));
    registerResolver(l, ui, Wi);
    registerResolver(l, gi, r == null ? ji : new B($i, r));
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
    registerResolver(c, ws, new B(Fi, a));
    registerResolver(c, X, new B(Hi, n));
    registerResolver(c, Rs, l == null ? Ni : new B(Oi, l));
    registerResolver(c, ui, r == null ? Wi : new ViewFactoryProvider(r));
    registerResolver(c, gi, ji);
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

const Ni = new RenderLocationProvider(null);

const Wi = new ViewFactoryProvider(null);

const ji = new B($i, new AuSlotsInfo(v));

const zi = /*@__PURE__*/ Re("IRendering", t => t.singleton(Rendering));

class Rendering {
    get renderers() {
        return this.yt ??= this.wt.getAll(xi, false).reduce((t, e) => {
            t[e.target] ??= e;
            return t;
        }, i());
    }
    constructor() {
        this.bt = new WeakMap;
        this.kt = new WeakMap;
        const t = this.wt = g(S).root;
        const e = this.p = t.get(je);
        this.ep = t.get(Gt);
        this.oL = t.get(Lt);
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
        let e = t.get(C(Ts));
        if (e == null) {
            t.register(Le(Ts, e = i()));
        }
        {
            ce(e, ...this.modules);
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

const Ui = /*@__PURE__*/ Re("IShadowDOMStyleFactory", t => t.cachedCallback(t => {
    if (AdoptedStyleSheetsStyles.supported(t.get(je))) {
        return t.get(AdoptedStyleSheetsStylesFactory);
    }
    return t.get(StyleElementStylesFactory);
}));

class ShadowDOMRegistry {
    constructor(t) {
        this.css = t;
    }
    register(t) {
        const e = t.get(Xi);
        const i = t.get(Ui);
        t.register(Le(Gi, i.createStyles(this.css, e)));
    }
}

class AdoptedStyleSheetsStylesFactory {
    constructor() {
        this.p = g(je);
        this.cache = new Map;
    }
    createStyles(t, e) {
        return new AdoptedStyleSheetsStyles(this.p, t, this.cache, e);
    }
}

class StyleElementStylesFactory {
    constructor() {
        this.p = g(je);
    }
    createStyles(t, e) {
        return new StyleElementStyles(this.p, t, e);
    }
}

const Gi = /*@__PURE__*/ Re("IShadowDOMStyles");

const Xi = /*@__PURE__*/ Re("IShadowDOMGlobalStyles", t => t.instance({
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

const Ki = {
    shadowDOM(t) {
        return We.creating(S, e => {
            if (t.sharedStyles != null) {
                const i = e.get(Ui);
                e.register(Le(Xi, i.createStyles(t.sharedStyles, null)));
            }
        });
    }
};

const {enter: Qi, exit: Yi} = Mt;

const {wrap: Zi, unwrap: Ji} = Dt;

class ComputedWatcher {
    get value() {
        return this.v;
    }
    constructor(t, e, i, s, n = "async") {
        this.obj = t;
        this.$get = i;
        this.isBound = false;
        this.L = false;
        this.At = 0;
        this.v = void 0;
        this.cb = s;
        this.oL = e;
        this.Rt = n;
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
        if (this.Rt === "sync") {
            this.Tt();
            return;
        }
        if (this.L) return;
        this.L = true;
        Ct(() => {
            this.L = false;
            this.Tt();
        });
    }
    Tt() {
        if (!this.isBound) return;
        const t = this.obj;
        const e = this.v;
        if (++this.At > 100) {
            throw new Error(`AURXXXX: Possible infinitely recursive side-effect detected in a watcher.`);
        }
        const i = this.compute();
        if (!R(i, e)) {
            this.cb.call(t, i, e, t);
        }
        if (!this.L) {
            this.At = 0;
        }
    }
    compute() {
        this.obs.version++;
        try {
            Qi(this);
            return this.v = Ji(this.$get.call(void 0, Zi(this.obj), this));
        } finally {
            this.obs.clear();
            Yi(this);
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
        this.Et = s;
        this.cb = n;
        this.Rt = r;
    }
    handleChange() {
        this.run();
    }
    handleCollectionChange() {
        this.run();
    }
    run() {
        if (!this.isBound) return;
        if (this.Rt === "sync") {
            this.Tt();
            return;
        }
        if (this.L) return;
        this.L = true;
        Ct(() => {
            this.L = false;
            this.Tt();
        });
    }
    Tt() {
        if (!this.isBound) return;
        const t = this.Et;
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
        this.v = bt(this.Et, this.scope, this, this);
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
    si(ExpressionWatcher);
})();

class Controller {
    get lifecycleHooks() {
        return this.Lt;
    }
    get isActive() {
        return (this.state & (ds | ms)) > 0 && (this.state & gs) === 0;
    }
    get name() {
        if (this.parent === null) {
            switch (this.vmKind) {
              case cs:
                return `[${this.definition.name}]`;

              case as:
                return this.definition.name;

              case us:
                return this.viewFactory.name;
            }
        }
        switch (this.vmKind) {
          case cs:
            return `${this.parent.name}>[${this.definition.name}]`;

          case as:
            return `${this.parent.name}>${this.definition.name}`;

          case us:
            return this.viewFactory.name === this.parent.definition?.name ? `${this.parent.name}[view]` : `${this.parent.name}[view:${this.viewFactory.name}]`;
        }
    }
    get viewModel() {
        return this.Mt;
    }
    set viewModel(t) {
        this.Mt = t;
        this.Dt = t == null || this.vmKind === us ? HooksDefinition.none : new HooksDefinition(t);
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
        this.Pt = false;
        this.mountTarget = es;
        this.shadowRoot = null;
        this.nodes = null;
        this.location = null;
        this.Lt = null;
        this.state = fs;
        this.qt = false;
        this.$initiator = null;
        this.$resolve = void 0;
        this.$reject = void 0;
        this.$promise = void 0;
        this.It = 0;
        this._t = 0;
        this.Vt = 0;
        this.Mt = n;
        this.Dt = e === us ? HooksDefinition.none : new HooksDefinition(n);
        this.location = l;
        this.r = t.root.get(zi);
    }
    static getCached(t) {
        return ts.get(t);
    }
    static getCachedOrThrow(t) {
        const e = Controller.getCached(t);
        if (e === void 0) {
            throw createMappedError(500, t);
        }
        return e;
    }
    static $el(t, e, i, s, n = void 0, r = null) {
        if (ts.has(e)) {
            return ts.get(e);
        }
        {
            n = n ?? getElementDefinition(e.constructor);
        }
        registerResolver(t, n.Type, new B(n.key, e, n.Type));
        const l = new Controller(t, as, n, null, e, i, r);
        const h = t.get(E(bs));
        if (n.dependencies.length > 0) {
            t.register(...n.dependencies);
        }
        registerResolver(t, bs, new B("IHydrationContext", new HydrationContext(l, s, h)));
        ts.set(e, l);
        if (s == null || s.hydrate !== false) {
            l.hE(s);
        }
        return l;
    }
    static $attr(t, e, i, s) {
        if (ts.has(e)) {
            return ts.get(e);
        }
        s = s ?? getAttributeDefinition(e.constructor);
        registerResolver(t, s.Type, new B(s.key, e, s.Type));
        const n = new Controller(t, cs, s, null, e, i, null);
        if (s.dependencies.length > 0) {
            t.register(...s.dependencies);
        }
        ts.set(e, n);
        n.Ft();
        return n;
    }
    static $view(t, e = void 0) {
        const i = new Controller(t.container, us, null, t, null, null, null);
        i.parent = e ?? null;
        i.Ht();
        return i;
    }
    hE(t) {
        const e = this.container;
        const i = this.Mt;
        const s = this.definition;
        this.scope = Et.create(i, null, true);
        if (s.watches.length > 0) {
            createWatchers(this, e, s, i);
        }
        createObservers(this, s, i);
        this.Lt = Ze.resolve(e);
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
        if (this.Lt.hydrating != null) {
            this.Lt.hydrating.forEach(callHydratingHook, this);
        }
        if (this.Dt.Ot) {
            this.Mt.hydrating(this);
        }
        const t = this.definition;
        const e = this.$t = this.r.compile(t, this.container);
        const i = e.shadowOptions;
        const s = e.hasSlots;
        const n = e.containerless;
        const r = this.host;
        let l = this.location;
        if (n && l == null) {
            l = this.location = convertToRenderLocation(r);
        }
        Ss(r, _s, this);
        Ss(r, t.key, this);
        if (i !== null || s) {
            if (l != null) {
                throw createMappedError(501);
            }
            Ss(this.shadowRoot = r.attachShadow(i ?? hs), _s, this);
            Ss(this.shadowRoot, t.key, this);
            this.mountTarget = ss;
        } else if (l != null) {
            if (r !== l) {
                Ss(l, _s, this);
                Ss(l, t.key, this);
            }
            this.mountTarget = ns;
        } else {
            this.mountTarget = is;
        }
        this.Mt.$controller = this;
        this.nodes = this.r.createNodes(e);
        if (this.Lt.hydrated !== void 0) {
            this.Lt.hydrated.forEach(callHydratedHook, this);
        }
        if (this.Dt.Nt) {
            this.Mt.hydrated(this);
        }
    }
    hC() {
        this.r.render(this, this.nodes.findTargets(), this.$t, this.host);
        if (this.Lt.created !== void 0) {
            this.Lt.created.forEach(callCreatedHook, this);
        }
        if (this.Dt.Wt) {
            this.Mt.created(this);
        }
    }
    Ft() {
        const t = this.definition;
        const e = this.Mt;
        if (t.watches.length > 0) {
            createWatchers(this, this.container, t, e);
        }
        createObservers(this, t, e);
        e.$controller = this;
        this.Lt = Ze.resolve(this.container);
        if (this.Lt.created !== void 0) {
            this.Lt.created.forEach(callCreatedHook, this);
        }
        if (this.Dt.Wt) {
            this.Mt.created(this);
        }
    }
    Ht() {
        this.$t = this.r.compile(this.viewFactory.def, this.container);
        this.r.render(this, (this.nodes = this.r.createNodes(this.$t)).findTargets(), this.$t, void 0);
    }
    activate(t, e, i) {
        switch (this.state) {
          case fs:
          case ps:
            if (!(e === null || e.isActive)) {
                return;
            }
            this.state = ds;
            break;

          case ms:
            return;

          case xs:
            throw createMappedError(502, this.name);

          default:
            throw createMappedError(503, this.name, stringifyState(this.state));
        }
        this.parent = e;
        switch (this.vmKind) {
          case as:
            this.scope.parent = i ?? null;
            break;

          case cs:
            this.scope = i ?? null;
            break;

          case us:
            if (i === void 0 || i === null) {
                throw createMappedError(504, this.name);
            }
            if (!this.hasLockedScope) {
                this.scope = i;
            }
            break;
        }
        this.$initiator = t;
        this.jt();
        let s = void 0;
        if (this.vmKind !== us && this.Lt.binding != null) {
            s = L(...this.Lt.binding.map(callBindingHook, this));
        }
        if (this.Dt.zt) {
            s = L(s, this.Mt.binding(this.$initiator, this.parent));
        }
        if (M(s)) {
            this.Ut();
            s.then(() => {
                this.Pt = true;
                if (this.state !== ds) {
                    this.Gt();
                } else {
                    this.bind();
                }
            }).catch(t => {
                this.Xt(t);
            });
            return this.$promise;
        }
        this.Pt = true;
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
        if (this.vmKind !== us && this.Lt.bound != null) {
            i = L(...this.Lt.bound.map(callBoundHook, this));
        }
        if (this.Dt.Kt) {
            i = L(i, this.Mt.bound(this.$initiator, this.parent));
        }
        if (M(i)) {
            this.Ut();
            i.then(() => {
                this.isBound = true;
                if (this.state !== ds) {
                    this.Gt();
                } else {
                    this.Qt();
                }
            }).catch(t => {
                this.Xt(t);
            });
            return;
        }
        this.isBound = true;
        this.Qt();
    }
    Yt(...t) {
        switch (this.mountTarget) {
          case is:
            this.host.append(...t);
            break;

          case ss:
            this.shadowRoot.append(...t);
            break;

          case ns:
            {
                let e = 0;
                for (;e < t.length; ++e) {
                    this.location.parentNode.insertBefore(t[e], this.location);
                }
                break;
            }
        }
    }
    Qt() {
        switch (this.mountTarget) {
          case is:
            this.nodes.appendTo(this.host, this.definition != null && this.definition.enhance);
            break;

          case ss:
            {
                const t = this.container;
                const e = t.has(Gi, false) ? t.get(Gi) : t.get(Xi);
                e.applyTo(this.shadowRoot);
                this.nodes.appendTo(this.shadowRoot);
                break;
            }

          case ns:
            this.nodes.insertBefore(this.location);
            break;
        }
        let t = 0;
        let e = void 0;
        if (this.vmKind !== us && this.Lt.attaching != null) {
            e = L(...this.Lt.attaching.map(callAttachingHook, this));
        }
        if (this.Dt.Zt) {
            e = L(e, this.Mt.attaching(this.$initiator, this.parent));
        }
        if (M(e)) {
            this.Ut();
            this.jt();
            e.then(() => {
                this.Gt();
            }).catch(t => {
                this.Xt(t);
            });
        }
        if (this.children !== null) {
            for (;t < this.children.length; ++t) {
                void this.children[t].activate(this.$initiator, this, this.scope);
            }
        }
        this.Gt();
    }
    deactivate(t, e) {
        let i = void 0;
        switch (this.state & ~vs) {
          case ms:
            this.state = gs;
            break;

          case ds:
            this.state = gs;
            i = this.$promise?.catch(r);
            break;

          case fs:
          case ps:
          case xs:
          case ps | xs:
            return;

          default:
            throw createMappedError(505, this.name, this.state);
        }
        this.$initiator = t;
        if (t === this) {
            this.Jt();
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
                if (this.vmKind !== us && this.Lt.detaching != null) {
                    n = L(...this.Lt.detaching.map(callDetachingHook, this));
                }
                if (this.Dt.te) {
                    n = L(n, this.Mt.detaching(this.$initiator, this.parent));
                }
            }
            if (M(n)) {
                this.Ut();
                t.Jt();
                n.then(() => {
                    t.ee();
                }).catch(e => {
                    t.Xt(e);
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
            this.ee();
            return this.$promise;
        });
    }
    removeNodes() {
        switch (this.vmKind) {
          case as:
          case us:
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
          case cs:
            this.scope = null;
            break;

          case us:
            if (!this.hasLockedScope) {
                this.scope = null;
            }
            if ((this.state & vs) === vs && !this.viewFactory.tryReturnToCache(this) && this.$initiator === this) {
                this.dispose();
            }
            break;

          case as:
            this.scope.parent = null;
            break;
        }
        this.state = ps;
        this.$initiator = null;
        this.ie();
    }
    Ut() {
        if (this.$promise === void 0) {
            this.$promise = new Promise((t, e) => {
                this.$resolve = t;
                this.$reject = e;
            });
            if (this.$initiator !== this) {
                this.parent.Ut();
            }
        }
    }
    ie() {
        if (this.$promise !== void 0) {
            ks = this.$resolve;
            this.$resolve = this.$reject = this.$promise = void 0;
            ks();
            ks = void 0;
        }
    }
    Xt(t) {
        if (this.$promise !== void 0) {
            Cs = this.$reject;
            this.$resolve = this.$reject = this.$promise = void 0;
            Cs(t);
            Cs = void 0;
        }
        if (this.$initiator !== this) {
            this.parent.Xt(t);
        }
    }
    jt() {
        ++this.It;
        if (this.$initiator !== this) {
            this.parent.jt();
        }
    }
    Gt() {
        if (this.state !== ds) {
            --this.It;
            this.ie();
            if (this.$initiator !== this) {
                this.parent.Gt();
            }
            return;
        }
        if (--this.It === 0) {
            if (this.vmKind !== us && this.Lt.attached != null) {
                Bs = L(...this.Lt.attached.map(callAttachedHook, this));
            }
            if (this.Dt.se) {
                Bs = L(Bs, this.Mt.attached(this.$initiator));
            }
            if (M(Bs)) {
                this.Ut();
                Bs.then(() => {
                    this.state = ms;
                    this.ie();
                    if (this.$initiator !== this) {
                        this.parent.Gt();
                    }
                }).catch(t => {
                    this.Xt(t);
                });
                Bs = void 0;
                return;
            }
            Bs = void 0;
            this.state = ms;
            this.ie();
        }
        if (this.$initiator !== this) {
            this.parent.Gt();
        }
    }
    Jt() {
        ++this._t;
    }
    ee() {
        if (--this._t === 0) {
            this.ne();
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
                if (t.Pt) {
                    if (t.vmKind !== us && t.Lt.unbinding != null) {
                        e = L(...t.Lt.unbinding.map(callUnbindingHook, t));
                    }
                    if (t.Dt.re) {
                        if (t.debug) {
                            t.logger.trace("unbinding()");
                        }
                        e = L(e, t.viewModel.unbinding(t.$initiator, t.parent));
                    }
                }
                if (M(e)) {
                    this.Ut();
                    this.ne();
                    e.then(() => {
                        this.oe();
                    }).catch(t => {
                        this.Xt(t);
                    });
                }
                e = void 0;
                t = t.next;
            }
            this.oe();
        }
    }
    ne() {
        ++this.Vt;
    }
    oe() {
        if (--this.Vt === 0) {
            let t = this.$initiator.head;
            let e = null;
            while (t !== null) {
                if (t !== this) {
                    t.Pt = false;
                    t.isBound = false;
                    t.unbind();
                }
                e = t.next;
                t.next = null;
                t = e;
            }
            this.head = this.tail = null;
            this.Pt = false;
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
          case cs:
          case as:
            {
                return this.definition.name === t;
            }

          case us:
            return this.viewFactory.name === t;
        }
    }
    lockScope(t) {
        this.scope = t;
        this.hasLockedScope = true;
    }
    setHost(t) {
        if (this.vmKind === as) {
            Ss(t, _s, this);
            Ss(t, this.definition.key, this);
        }
        this.host = t;
        this.mountTarget = is;
        return this;
    }
    setShadowRoot(t) {
        if (this.vmKind === as) {
            Ss(t, _s, this);
            Ss(t, this.definition.key, this);
        }
        this.shadowRoot = t;
        this.mountTarget = ss;
        return this;
    }
    setLocation(t) {
        if (this.vmKind === as) {
            Ss(t, _s, this);
            Ss(t, this.definition.key, this);
        }
        this.location = t;
        this.mountTarget = ns;
        return this;
    }
    release() {
        this.state |= vs;
    }
    dispose() {
        if ((this.state & xs) === xs) {
            return;
        }
        this.state |= xs;
        if (this.Dt.le) {
            this.Mt.dispose();
        }
        if (this.children !== null) {
            this.children.forEach(callDispose);
            this.children = null;
        }
        this.scope = null;
        this.nodes = null;
        this.location = null;
        this.viewFactory = null;
        if (this.Mt !== null) {
            ts.delete(this.Mt);
            this.Mt = null;
        }
        this.Mt = null;
        this.host = null;
        this.shadowRoot = null;
        this.container.disposeResolvers();
    }
    accept(t) {
        if (t(this) === true) {
            return true;
        }
        if (this.Dt.he && this.Mt.accept(t) === true) {
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

const ts = new WeakMap;

const es = 0;

const is = 1;

const ss = 2;

const ns = 3;

const rs = ae({
    none: es,
    host: is,
    shadowRoot: ss,
    location: ns
});

const os = T(Pt);

function createObservers(t, e, i) {
    const s = e.bindables;
    const n = ue(s);
    const l = n.length;
    if (l === 0) return;
    const h = t.container.get(Lt);
    const a = "propertiesChanged" in i;
    const c = t.vmKind === us ? void 0 : t.container.get(os);
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

const ls = new Map;

const getAccessScopeAst = t => {
    let e = ls.get(t);
    if (e == null) {
        e = new Ut(t, 0);
        ls.set(t, e);
    }
    return e;
};

function createWatchers(t, i, s, n) {
    const r = i.get(Lt);
    const l = i.get(Gt);
    const h = s.watches;
    const a = t.vmKind === as ? t.scope : Et.create(n, null, true);
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
            m = e(f) ? l.parse(f, xe) : getAccessScopeAst(f);
            t.addBinding(new ExpressionWatcher(a, i, r, m, d, g));
        }
    }
}

function isCustomElementController(t) {
    return t instanceof Controller && t.vmKind === as;
}

function isCustomElementViewModel(t) {
    return isElementType(t?.constructor);
}

class HooksDefinition {
    constructor(t) {
        this.ae = "define" in t;
        this.Ot = "hydrating" in t;
        this.Nt = "hydrated" in t;
        this.Wt = "created" in t;
        this.zt = "binding" in t;
        this.Kt = "bound" in t;
        this.Zt = "attaching" in t;
        this.se = "attached" in t;
        this.te = "detaching" in t;
        this.re = "unbinding" in t;
        this.le = "dispose" in t;
        this.he = "accept" in t;
    }
}

HooksDefinition.none = new HooksDefinition({});

const hs = {
    mode: "open"
};

const as = "customElement";

const cs = "customAttribute";

const us = "synthetic";

const fs = 0;

const ds = 1;

const ms = 2;

const gs = 4;

const ps = 8;

const vs = 16;

const xs = 32;

const ys = /*@__PURE__*/ ae({
    none: fs,
    activating: ds,
    activated: ms,
    deactivating: gs,
    deactivated: ps,
    released: vs,
    disposed: xs
});

function stringifyState(t) {
    const e = [];
    if ((t & ds) === ds) {
        e.push("activating");
    }
    if ((t & ms) === ms) {
        e.push("activated");
    }
    if ((t & gs) === gs) {
        e.push("deactivating");
    }
    if ((t & ps) === ps) {
        e.push("deactivated");
    }
    if ((t & vs) === vs) {
        e.push("released");
    }
    if ((t & xs) === xs) {
        e.push("disposed");
    }
    return e.length === 0 ? "none" : e.join("|");
}

const ws = /*@__PURE__*/ Re("IController");

const bs = /*@__PURE__*/ Re("IHydrationContext");

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
    t.instance.created(this.Mt, this);
}

function callHydratingHook(t) {
    t.instance.hydrating(this.Mt, this);
}

function callHydratedHook(t) {
    t.instance.hydrated(this.Mt, this);
}

function callBindingHook(t) {
    return t.instance.binding(this.Mt, this["$initiator"], this.parent);
}

function callBoundHook(t) {
    return t.instance.bound(this.Mt, this["$initiator"], this.parent);
}

function callAttachingHook(t) {
    return t.instance.attaching(this.Mt, this["$initiator"], this.parent);
}

function callAttachedHook(t) {
    return t.instance.attached(this.Mt, this["$initiator"]);
}

function callDetachingHook(t) {
    return t.instance.detaching(this.Mt, this["$initiator"], this.parent);
}

function callUnbindingHook(t) {
    return t.instance.unbinding(this.Mt, this["$initiator"], this.parent);
}

let ks;

let Cs;

let Bs;

const Ss = ze.set;

const As = /*@__PURE__*/ Re("IEventTarget", t => t.cachedCallback(t => {
    if (t.has($s, true)) {
        return t.get($s).host;
    }
    return t.get(je).document;
}));

const Rs = /*@__PURE__*/ Re("IRenderLocation");

const Ts = /*@__PURE__*/ Re("ICssClassMapping");

const Es = new WeakMap;

function getEffectiveParentNode(t) {
    if (Es.has(t)) {
        return Es.get(t);
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
        if (e.mountTarget === rs.shadowRoot) {
            return getEffectiveParentNode(e.host);
        }
    }
    return t.parentNode;
}

function setEffectiveParentNode(t, e) {
    if (t.platform !== void 0 && !(t instanceof t.platform.Node)) {
        const i = t.childNodes;
        for (let t = 0, s = i.length; t < s; ++t) {
            Es.set(i[t], e);
        }
    } else {
        Es.set(t, e);
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
        return this.ce;
    }
    get lastChild() {
        return this.ue;
    }
    constructor(t, e) {
        this.platform = t;
        this.next = void 0;
        this.fe = false;
        this.de = false;
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
        this.ce = e.firstChild;
        this.ue = e.lastChild;
    }
    findTargets() {
        return this.t;
    }
    insertBefore(t) {
        if (this.de && !!this.ref) {
            this.addToLinked();
        } else {
            const e = t.parentNode;
            if (this.fe) {
                let i = this.ce;
                let s;
                const n = this.ue;
                while (i != null) {
                    s = i.nextSibling;
                    e.insertBefore(i, t);
                    if (i === n) {
                        break;
                    }
                    i = s;
                }
            } else {
                this.fe = true;
                t.parentNode.insertBefore(this.f, t);
            }
        }
    }
    appendTo(t, e = false) {
        if (this.fe) {
            let e = this.ce;
            let i;
            const s = this.ue;
            while (e != null) {
                i = e.nextSibling;
                t.appendChild(e);
                if (e === s) {
                    break;
                }
                e = i;
            }
        } else {
            this.fe = true;
            if (!e) {
                t.appendChild(this.f);
            }
        }
    }
    remove() {
        if (this.fe) {
            this.fe = false;
            const t = this.f;
            const e = this.ue;
            let i;
            let s = this.ce;
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
        if (this.fe) {
            let i = this.ce;
            let s;
            const n = this.ue;
            while (i != null) {
                s = i.nextSibling;
                e.insertBefore(i, t);
                if (i === n) {
                    break;
                }
                i = s;
            }
        } else {
            this.fe = true;
            e.insertBefore(this.f, t);
        }
    }
    unlink() {
        this.de = false;
        this.next = void 0;
        this.ref = void 0;
    }
    link(t) {
        this.de = true;
        if (isRenderLocation(t)) {
            this.ref = t;
        } else {
            this.next = t;
            this.me();
        }
    }
    me() {
        if (this.next !== void 0) {
            this.ref = this.next.firstChild;
        } else {
            this.ref = void 0;
        }
    }
}

const Ls = /*@__PURE__*/ Re("IWindow", t => t.callback(t => t.get(je).window));

const Ms = /*@__PURE__*/ Re("ILocation", t => t.callback(t => t.get(Ls).location));

const Ds = /*@__PURE__*/ Re("IHistory", t => t.callback(t => t.get(Ls).history));

const registerHostNode = (t, e, i = t.get(je)) => {
    registerResolver(t, i.HTMLElement, registerResolver(t, i.Element, registerResolver(t, Ue, new B("ElementResolver", e))));
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
    const e = te(_s, t);
    if (e === void 0) {
        annotateElementMetadata(t, "containerless", true);
        return;
    }
    e.containerless = true;
}

const Ps = new WeakMap;

class CustomElementDefinition {
    get type() {
        return Me;
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
            const n = P("name", s, Vs);
            if (u(s.Type)) {
                i = s.Type;
            } else {
                i = Fs(q(n));
            }
            for (const t of Object.values(Se.from(s.bindables))) {
                Se.i(t, i);
            }
            return new CustomElementDefinition(i, n, c(s.aliases), P("key", s, () => getElementKeyFrom(n)), I("capture", s, i, returnFalse), I("template", s, i, returnNull), c(s.instructions), c(getElementAnnotation(i, "dependencies"), s.dependencies), P("injectable", s, returnNull), P("needsCompile", s, returnTrue), c(s.surrogates), Se.from(getElementAnnotation(i, "bindables"), s.bindables), I("containerless", s, i, returnFalse), P("shadowOptions", s, returnNull), P("hasSlots", s, returnFalse), P("enhance", s, returnFalse), P("watches", s, returnEmptyArray), P("strict", s, returnUndefined), _("processContent", i, returnNull));
        }
        if (e(t)) {
            return new CustomElementDefinition(i, t, c(getElementAnnotation(i, "aliases"), i.aliases), getElementKeyFrom(t), _("capture", i, returnFalse), _("template", i, returnNull), c(getElementAnnotation(i, "instructions"), i.instructions), c(getElementAnnotation(i, "dependencies"), i.dependencies), _("injectable", i, returnNull), _("needsCompile", i, returnTrue), c(getElementAnnotation(i, "surrogates"), i.surrogates), Se.from(...Se.getAll(i), getElementAnnotation(i, "bindables"), i.bindables), _("containerless", i, returnFalse), _("shadowOptions", i, returnNull), _("hasSlots", i, returnFalse), _("enhance", i, returnFalse), c(Ge.getDefinitions(i), i.watches), _("strict", i, returnUndefined), _("processContent", i, returnNull));
        }
        const s = P("name", t, Vs);
        for (const e of Object.values(Se.from(t.bindables))) {
            Se.i(e, i);
        }
        return new CustomElementDefinition(i, s, c(getElementAnnotation(i, "aliases"), t.aliases, i.aliases), getElementKeyFrom(s), I("capture", t, i, returnFalse), I("template", t, i, returnNull), c(getElementAnnotation(i, "instructions"), t.instructions, i.instructions), c(getElementAnnotation(i, "dependencies"), t.dependencies, i.dependencies), I("injectable", t, i, returnNull), I("needsCompile", t, i, returnTrue), c(getElementAnnotation(i, "surrogates"), t.surrogates, i.surrogates), Se.from(...Se.getAll(i), getElementAnnotation(i, "bindables"), i.bindables, t.bindables), I("containerless", t, i, returnFalse), I("shadowOptions", t, i, returnNull), I("hasSlots", t, i, returnFalse), I("enhance", t, i, returnFalse), c(t.watches, Ge.getDefinitions(i), i.watches), I("strict", t, i, returnUndefined), I("processContent", t, i, returnNull));
    }
    static getOrCreate(t) {
        if (t instanceof CustomElementDefinition) {
            return t;
        }
        if (Ps.has(t)) {
            return Ps.get(t);
        }
        const e = CustomElementDefinition.create(t);
        Ps.set(t, e);
        ie(e, e.Type, _s);
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
        t.register(t.has(i, false) ? null : Te(i, i), Ee(i, s), ...n.map(t => Ee(i, getElementKeyFrom(t))));
    }
    toString() {
        return `au:ce:${this.name}`;
    }
}

const qs = {
    name: undefined,
    searchParents: false,
    optional: false
};

const returnNull = () => null;

const returnUndefined = () => void 0;

const returnFalse = () => false;

const returnTrue = () => true;

const returnEmptyArray = () => v;

const Is = "custom-element";

const _s = /*@__PURE__*/ m(Is);

const getElementKeyFrom = t => `${_s}:${t}`;

const Vs = /*@__PURE__*/ (t => () => `unnamed-${++t}`)(0);

const annotateElementMetadata = (t, e, i) => {
    ie(i, t, ne(e));
};

const defineElement = (t, e) => {
    const i = CustomElementDefinition.create(t, e);
    const s = i.Type;
    ie(i, s, _s, f);
    return s;
};

const isElementType = t => u(t) && (ee(_s, t) || t.$au?.type === Is);

const findElementControllerFor = (t, e = qs) => {
    if (e.name === void 0 && e.searchParents !== true) {
        const i = ze.get(t, _s);
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
            const i = ze.get(t, _s);
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
            const t = ze.get(i, _s);
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
        const t = ze.get(i, _s);
        if (t !== null) {
            return t;
        }
        i = getEffectiveParentNode(i);
    }
    throw createMappedError(765, t);
};

const getElementAnnotation = (t, e) => te(ne(e), t);

const getElementDefinition = t => {
    const e = te(_s, t) ?? getDefinitionFromStaticAu(t, Is, CustomElementDefinition.create);
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

const Fs = /*@__PURE__*/ function() {
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
        me(n, "name", t);
        if (s !== e) {
            ce(n.prototype, s);
        }
        return n;
    };
}();

const Hs = /*@__PURE__*/ ae({
    name: _s,
    keyFrom: getElementKeyFrom,
    isType: isElementType,
    for: findElementControllerFor,
    define: defineElement,
    getDefinition: getElementDefinition,
    annotate: annotateElementMetadata,
    getAnnotation: getElementAnnotation,
    generateName: Vs,
    createInjectable: createElementInjectable,
    generateType: Fs,
    find(t, e) {
        const i = t.find(Is, e);
        return i == null ? null : te(_s, i) ?? getDefinitionFromStaticAu(i, Is, CustomElementDefinition.create) ?? null;
    }
});

const Os = /*@__PURE__*/ ne("processContent");

function processContent(t) {
    return t === void 0 ? function(t, e) {
        if (!e.static || e.kind !== "method") throw createMappedError(766, t);
        e.addInitializer(function() {
            ie(t, this, Os);
        });
    } : function(i, s) {
        s.addInitializer(function() {
            if (e(t) || V(t)) {
                t = this[t];
            }
            if (!u(t)) throw createMappedError(766, t);
            const i = te(_s, this);
            if (i !== void 0) {
                i.processContent = t;
            } else {
                ie(t, this, Os);
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

const $s = /*@__PURE__*/ Re("IAppRoot");

class AppRoot {
    get controller() {
        return this.P;
    }
    constructor(t, e, i, s = false) {
        this.config = t;
        this.container = e;
        this.ge = void 0;
        this.pe = s;
        const n = this.host = t.host;
        i.prepare(this);
        registerResolver(e, As, new B("IEventTarget", n));
        registerHostNode(e, n, this.platform = this.ve(e, n));
        this.ge = D(this.xe("creating"), () => {
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
                Le(r, l);
            } else {
                l = t.component;
            }
            const h = {
                hydrate: false,
                projections: null
            };
            const a = s ? CustomElementDefinition.create({
                name: Vs(),
                template: this.host,
                enhance: true,
                strict: t.strictBinding
            }) : void 0;
            const c = this.P = Controller.$el(i, l, n, h, a);
            c.hE(h);
            return D(this.xe("hydrating"), () => {
                c.hS();
                return D(this.xe("hydrated"), () => {
                    c.hC();
                    this.ge = void 0;
                });
            });
        });
    }
    activate() {
        return D(this.ge, () => D(this.xe("activating"), () => D(this.P.activate(this.P, null, void 0), () => this.xe("activated"))));
    }
    deactivate() {
        return D(this.xe("deactivating"), () => D(this.P.deactivate(this.P, null), () => this.xe("deactivated")));
    }
    xe(t) {
        const e = this.container;
        const i = this.pe && !e.has(Ne, false) ? [] : e.getAll(Ne);
        return L(...i.reduce((e, i) => {
            if (i.slot === t) {
                e.push(i.run());
            }
            return e;
        }, []));
    }
    ve(t, e) {
        let i;
        if (!t.has(je, false)) {
            if (e.ownerDocument.defaultView === null) {
                throw createMappedError(769);
            }
            i = new zt(e.ownerDocument.defaultView);
            t.register(Le(je, i));
        } else {
            i = t.get(je);
        }
        return i;
    }
    dispose() {
        this.P?.dispose();
    }
}

const Ns = /*@__PURE__*/ Re("IAurelia");

class Aurelia {
    get isRunning() {
        return this.ir;
    }
    get isStarting() {
        return this.ye;
    }
    get isStopping() {
        return this.we;
    }
    get root() {
        if (this.be == null) {
            if (this.next == null) {
                throw createMappedError(767);
            }
            return this.next;
        }
        return this.be;
    }
    constructor(t = l.createContainer()) {
        this.container = t;
        this.ir = false;
        this.ye = false;
        this.we = false;
        this.be = void 0;
        this.next = void 0;
        this.ke = void 0;
        this.Ce = void 0;
        if (t.has(Ns, true) || t.has(Aurelia, true)) {
            throw createMappedError(768);
        }
        registerResolver(t, Ns, new B("IAurelia", this));
        registerResolver(t, Aurelia, new B("Aurelia", this));
        registerResolver(t, $s, this.Be = new B("IAppRoot"));
    }
    register(...t) {
        this.container.register(...t);
        return this;
    }
    app(t) {
        this.next = new AppRoot(t, this.container, this.Be);
        return this;
    }
    enhance(t) {
        const e = t.container ?? this.container.createChild();
        const i = registerResolver(e, $s, new B("IAppRoot"));
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
        if (M(this.ke)) {
            return this.ke;
        }
        return this.ke = D(this.stop(), () => {
            if (!ze.hideProp) {
                Reflect.set(t.host, "$aurelia", this);
            }
            this.Be.prepare(this.be = t);
            this.ye = true;
            return D(t.activate(), () => {
                this.ir = true;
                this.ye = false;
                this.ke = void 0;
                this.Se(t, "au-started", t.host);
            });
        });
    }
    stop(t = false) {
        if (M(this.Ce)) {
            return this.Ce;
        }
        if (this.ir === true) {
            const e = this.be;
            this.ir = false;
            this.we = true;
            return this.Ce = D(e.deactivate(), () => D(qt(), () => {
                Reflect.deleteProperty(e.host, "$aurelia");
                if (t) {
                    e.dispose();
                }
                this.be = void 0;
                this.Be.dispose();
                this.we = false;
                this.Ce = void 0;
                this.Se(e, "au-stopped", e.host);
            }));
        }
    }
    dispose() {
        if (this.ir || this.we) {
            throw createMappedError(771);
        }
        this.container.dispose();
    }
    Se(t, e, i) {
        const s = new t.platform.window.CustomEvent(e, {
            detail: this,
            bubbles: true,
            cancelable: true
        });
        i.dispatchEvent(s);
    }
}

const Ws = /*@__PURE__*/ Re("ISVGAnalyzer", t => t.singleton(NoopSVGAnalyzer));

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
        t.register(Te(this, this), Ee(this, Ws));
    }
    constructor() {
        this.Ae = ce(i(), {
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
        this.Re = o("a altGlyph animate animateColor circle clipPath defs ellipse feBlend feColorMatrix feComponentTransfer feComposite feConvolveMatrix feDiffuseLighting feDisplacementMap feFlood feGaussianBlur feImage feMerge feMorphology feOffset feSpecularLighting feTile feTurbulence filter font foreignObject g glyph glyphRef image line linearGradient marker mask missing-glyph path pattern polygon polyline radialGradient rect stop svg switch symbol text textPath tref tspan use");
        this.Te = o("alignment-baseline baseline-shift clip-path clip-rule clip color-interpolation-filters color-interpolation color-profile color-rendering color cursor direction display dominant-baseline enable-background fill-opacity fill-rule fill filter flood-color flood-opacity font-family font-size-adjust font-size font-stretch font-style font-variant font-weight glyph-orientation-horizontal glyph-orientation-vertical image-rendering kerning letter-spacing lighting-color marker-end marker-mid marker-start mask opacity overflow pointer-events shape-rendering stop-color stop-opacity stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width stroke text-anchor text-decoration text-rendering unicode-bidi visibility word-spacing writing-mode");
        const t = g(je);
        this.SVGElement = t.globalThis.SVGElement;
        const e = t.document.createElement("div");
        e.innerHTML = "<svg><altGlyph /></svg>";
        if (e.firstElementChild.nodeName === "altglyph") {
            const t = this.Ae;
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
        return this.Re[t.nodeName] === true && this.Te[e] === true || this.Ae[t.nodeName]?.[e] === true;
    }
}

class AttrMapper {
    constructor() {
        this.fns = [];
        this.Ee = i();
        this.Le = i();
        this.svg = g(Ws);
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
            s = this.Ee[n] ??= i();
            for (r in e) {
                if (s[r] !== void 0) {
                    throw createError(r, n);
                }
                s[r] = e[r];
            }
        }
    }
    useGlobalMapping(t) {
        const e = this.Le;
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
        return this.Ee[t.nodeName]?.[e] ?? this.Le[e] ?? (isDataAttribute(t, e, this.svg) ? e : null);
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

const js = {
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
        this.Me = new WeakMap;
        this.De = new WeakMap;
    }
    el(t, e) {
        let i = this.Me.get(t);
        if (i == null) {
            this.Me.set(t, i = new RecordCache);
        }
        return e in i.Pe ? i.Pe[e] : i.Pe[e] = Hs.find(t, e);
    }
    attr(t, e) {
        let i = this.Me.get(t);
        if (i == null) {
            this.Me.set(t, i = new RecordCache);
        }
        return e in i.qe ? i.qe[e] : i.qe[e] = Qe.find(t, e);
    }
    bindables(t) {
        let e = this.De.get(t);
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
                    mode: t.defaultBindingMode ?? Kt
                });
            }
            this.De.set(t, e = new BindablesInfo(n, s, a ?? null));
        }
        return e;
    }
}

ResourceResolver.register = F(Y);

class RecordCache {
    constructor() {
        this.Pe = i();
        this.qe = i();
    }
}

const zs = i();

class AttributeNSAccessor {
    static forNs(t) {
        return zs[t] ??= new AttributeNSAccessor(t);
    }
    constructor(t) {
        this.ns = t;
        this.type = ke | Ce;
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
        this.type = ke | Ce;
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

const Us = /*@__PURE__*/ new DataAttributeAccessor;

class SelectValueObserver {
    static Ie(t) {
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
                e[e.length] = he.call(n, "model") ? n.model : n.value;
            }
            ++s;
        }
        return e;
    }
    static _e(t, e) {
        return t === e;
    }
    constructor(t, e, i, s) {
        this.type = ke | be | Ce;
        this.v = void 0;
        this.ov = void 0;
        this.Ve = false;
        this.Fe = void 0;
        this.He = void 0;
        this.iO = false;
        this.lt = false;
        this.ot = t;
        this.oL = s;
        this.cf = i;
    }
    getValue() {
        return this.iO ? this.v : this.ot.multiple ? SelectValueObserver.Ie(this.ot.options) : this.ot.value;
    }
    setValue(t) {
        this.ov = this.v;
        this.v = t;
        this.Ve = t !== this.ov;
        this.Oe(t instanceof Array ? t : null);
        this.dt();
    }
    dt() {
        if (this.Ve) {
            this.Ve = false;
            this.syncOptions();
        }
    }
    handleCollectionChange() {
        this.syncOptions();
    }
    syncOptions() {
        const t = this.v;
        const e = this.ot;
        const i = w(t);
        const s = e.matcher ?? SelectValueObserver._e;
        const n = e.options;
        let r = n.length;
        while (r-- > 0) {
            const e = n[r];
            const l = he.call(e, "model") ? e.model : e.value;
            if (i) {
                e.selected = t.findIndex(t => !!s(l, t)) !== -1;
                continue;
            }
            e.selected = !!s(l, t);
        }
    }
    syncValue() {
        const t = this.ot;
        const e = t.options;
        const i = e.length;
        const s = this.v;
        let n = 0;
        if (t.multiple) {
            if (!(s instanceof Array)) {
                return true;
            }
            let r;
            const l = t.matcher || SelectValueObserver._e;
            const h = [];
            while (n < i) {
                r = e[n];
                if (r.selected) {
                    h.push(he.call(r, "model") ? r.model : r.value);
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
                r = he.call(l, "model") ? l.model : l.value;
                break;
            }
            ++n;
        }
        this.ov = this.v;
        this.v = r;
        return true;
    }
    ht() {
        (this.He = createMutationObserver(this.ot, this.$e.bind(this))).observe(this.ot, {
            childList: true,
            subtree: true,
            characterData: true
        });
        this.Oe(this.v instanceof Array ? this.v : null);
        this.iO = true;
    }
    ct() {
        this.He.disconnect();
        this.Fe?.unsubscribe(this);
        this.He = this.Fe = void 0;
        this.iO = false;
    }
    Oe(t) {
        this.Fe?.unsubscribe(this);
        this.Fe = void 0;
        if (t != null) {
            if (!this.ot.multiple) {
                throw createMappedError(654);
            }
            (this.Fe = this.oL.getArrayObserver(t)).subscribe(this);
        }
    }
    handleEvent() {
        const t = this.syncValue();
        if (t) {
            this.Rt();
        }
    }
    $e(t) {
        this.syncOptions();
        const e = this.syncValue();
        if (e) {
            this.Rt();
        }
    }
    Rt() {
        const t = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, t);
    }
}

(() => {
    mixinNodeObserverUseConfig(SelectValueObserver);
    Tt(SelectValueObserver, null);
})();

const Gs = "--";

class StyleAttributeAccessor {
    constructor(t) {
        this.obj = t;
        this.type = ke | Ce;
        this.v = "";
        this.ov = "";
        this.styles = {};
        this.version = 0;
        this.Ve = false;
    }
    getValue() {
        return this.obj.style.cssText;
    }
    setValue(t) {
        this.v = t;
        this.Ve = t !== this.ov;
        this.dt();
    }
    Ne(t) {
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
    We(t) {
        let i;
        let s;
        const r = [];
        for (s in t) {
            i = t[s];
            if (i == null) {
                continue;
            }
            if (e(i)) {
                if (s.startsWith(Gs)) {
                    r.push([ s, i ]);
                    continue;
                }
                r.push([ n(s), i ]);
                continue;
            }
            r.push(...this.je(i));
        }
        return r;
    }
    ze(t) {
        const e = t.length;
        if (e > 0) {
            const i = [];
            let s = 0;
            for (;e > s; ++s) {
                i.push(...this.je(t[s]));
            }
            return i;
        }
        return v;
    }
    je(t) {
        if (e(t)) {
            return this.Ne(t);
        }
        if (t instanceof Array) {
            return this.ze(t);
        }
        if (t instanceof Object) {
            return this.We(t);
        }
        return v;
    }
    dt() {
        if (this.Ve) {
            this.Ve = false;
            const t = this.v;
            const e = this.styles;
            const i = this.je(t);
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
                if (!he.call(e, s) || e[s] !== n) {
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
        this.type = ke | be | Ce;
        this.v = "";
        this.ov = "";
        this.Ve = false;
        this.lt = false;
        this.ot = t;
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
        this.Ve = true;
        if (!this.cf.readonly) {
            this.dt();
        }
    }
    dt() {
        if (this.Ve) {
            this.Ve = false;
            this.ot[this.k] = this.v ?? this.cf.default;
            this.Rt();
        }
    }
    handleEvent() {
        this.ov = this.v;
        this.v = this.ot[this.k];
        if (this.ov !== this.v) {
            this.Ve = false;
            this.Rt();
        }
    }
    ht() {
        this.v = this.ov = this.ot[this.k];
    }
    Rt() {
        const t = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, t);
    }
}

(() => {
    mixinNodeObserverUseConfig(ValueAttributeObserver);
    Tt(ValueAttributeObserver, null);
})();

const Xs = (() => {
    const t = "http://www.w3.org/1999/xlink";
    const e = "http://www.w3.org/XML/1998/namespace";
    const s = "http://www.w3.org/2000/xmlns/";
    return ce(i(), {
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

const Ks = new It;

Ks.type = ke | Ce;

class NodeObserverLocator {
    constructor() {
        this.allowDirtyCheck = true;
        this.Ue = i();
        this.Ge = i();
        this.Xe = i();
        this.Ke = i();
        this.Qe = g(H);
        this.p = g(je);
        this.Ye = g(Vt);
        this.svg = g(Ws);
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
        const r = this.Ue;
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
        const i = this.Ge;
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
        if (e in this.Ke || e in (this.Xe[t.tagName] ?? O)) {
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
            return Us;

          default:
            {
                const i = Xs[e];
                if (i !== undefined) {
                    return AttributeNSAccessor.forNs(i[1]);
                }
                if (isDataAttribute(t, e, this.svg)) {
                    return Us;
                }
                return Ks;
            }
        }
    }
    overrideAccessor(t, s) {
        let n;
        if (e(t)) {
            n = this.Xe[t] ??= i();
            n[s] = true;
        } else {
            for (const e in t) {
                for (const s of t[e]) {
                    n = this.Xe[e] ??= i();
                    n[s] = true;
                }
            }
        }
    }
    overrideAccessorGlobal(...t) {
        for (const e of t) {
            this.Ke[e] = true;
        }
    }
    getNodeObserverConfig(t, e) {
        return this.Ue[t.tagName]?.[e] ?? this.Ge[e];
    }
    getNodeObserver(t, e, i) {
        const s = this.Ue[t.tagName]?.[e] ?? this.Ge[e];
        let n;
        if (s != null) {
            n = new (s.type ?? ValueAttributeObserver)(t, e, s, i, this.Qe);
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
        const n = Xs[e];
        if (n !== undefined) {
            return AttributeNSAccessor.forNs(n[1]);
        }
        if (isDataAttribute(t, e, this.svg)) {
            return Us;
        }
        if (e in t.constructor.prototype) {
            if (this.allowDirtyCheck) {
                return this.Ye.createProperty(t, e);
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
        this.type = ke | be | Ce;
        this.v = void 0;
        this.ov = void 0;
        this.Ze = void 0;
        this.Je = void 0;
        this.lt = false;
        this.ot = t;
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
        this.ti();
        this.ei();
        this.Rt();
    }
    handleCollectionChange() {
        this.ei();
    }
    handleChange(t, e) {
        this.ei();
    }
    ei() {
        const t = this.v;
        const e = this.ot;
        const i = he.call(e, "model") ? e.model : e.value;
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
        const e = this.ot;
        const i = he.call(e, "model") ? e.model : e.value;
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
        this.Rt();
    }
    ht() {
        this.ti();
    }
    ct() {
        this.v = this.ov = void 0;
        this.Ze?.unsubscribe(this);
        this.Je?.unsubscribe(this);
        this.Ze = this.Je = void 0;
    }
    Rt() {
        Qs = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, Qs);
        Qs = void 0;
    }
    ti() {
        const t = this.ot;
        (this.Je ??= t.$observers?.model ?? t.$observers?.value)?.subscribe(this);
        this.Ze?.unsubscribe(this);
        this.Ze = void 0;
        if (t.type === "checkbox") {
            (this.Ze = getCollectionObserver(this.v, this.oL))?.subscribe(this);
        }
    }
}

(() => {
    mixinNodeObserverUseConfig(CheckedObserver);
    Tt(CheckedObserver, null);
})();

let Qs = void 0;

class AttrBindingBehavior {
    bind(t, e) {
        if (!(e instanceof PropertyBinding)) {
            throw createMappedError(9994, e);
        }
        e.useTargetObserver(Us);
    }
}

AttrBindingBehavior.$au = {
    type: Pe,
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
    type: Pe,
    name: "self"
};

class UpdateTriggerBindingBehavior {
    constructor() {
        this.oL = g(Lt);
        this.ii = g(_t);
    }
    bind(t, e, ...i) {
        if (!(this.ii instanceof NodeObserverLocator)) {
            throw createMappedError(9993);
        }
        if (i.length === 0) {
            throw createMappedError(802);
        }
        if (!(e instanceof PropertyBinding) || !(e.mode & Zt)) {
            throw createMappedError(803);
        }
        const s = this.ii.getNodeObserverConfig(e.target, e.targetProperty);
        if (s == null) {
            throw createMappedError(9992, e);
        }
        const n = this.ii.getNodeObserver(e.target, e.targetProperty, this.oL);
        n.useConfig({
            readonly: s.readonly,
            default: s.default,
            events: i
        });
        e.useTargetObserver(n);
    }
}

UpdateTriggerBindingBehavior.$au = {
    type: Pe,
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
        this.si = false;
        this.ni = 0;
        this.ri = g(ui);
        this.l = g(Rs);
    }
    attaching(t, e) {
        return this.oi(this.value);
    }
    detaching(t, e) {
        this.si = true;
        return D(this.pending, () => {
            this.si = false;
            this.pending = void 0;
            void this.view?.deactivate(t, this.$controller);
        });
    }
    valueChanged(t, e) {
        if (!this.$controller.isActive) return;
        t = !!t;
        e = !!e;
        if (t !== e) return this.oi(t);
    }
    oi(t) {
        const e = this.view;
        const i = this.$controller;
        const s = this.ni++;
        const isCurrent = () => !this.si && this.ni === s + 1;
        let n;
        return D(this.pending, () => this.pending = D(e?.deactivate(e, i), () => {
            if (!isCurrent()) {
                return;
            }
            if (t) {
                n = this.view = this.ifView = this.cache && this.ifView != null ? this.ifView : this.ri.create();
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
    type: Xe,
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
        this.f = g(ui);
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

const Ys = [ "BindingBehavior", "ValueConverter" ];

class Repeat {
    constructor() {
        this.views = [];
        this.key = null;
        this.li = [];
        this.hi = [];
        this.ai = [];
        this.ci = new Map;
        this.ui = void 0;
        this.fi = false;
        this.di = false;
        this.mi = null;
        this.gi = void 0;
        this.pi = false;
        this.l = g(Rs);
        this.xi = g(ws);
        this.f = g(ui);
        this.yi = g(en);
        const t = g(X);
        const e = t.props[0].props[0];
        if (e !== void 0) {
            const {to: t, value: i, command: s} = e;
            if (t === "key") {
                if (s === null) {
                    this.key = i;
                } else if (s === "bind") {
                    this.key = g(Gt).parse(i, xe);
                } else {
                    throw createMappedError(775, s);
                }
            } else {
                throw createMappedError(776, t);
            }
        }
    }
    binding(t, e) {
        const i = this.xi.bindings;
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
                while (t != null && Ys.includes(t.$kind)) {
                    t = t.expression;
                    this.fi = true;
                }
                this.mi = t;
                break;
            }
        }
        this.bi();
        const h = r.declaration;
        if (!(this.pi = h.$kind === "ArrayDestructuring" || h.$kind === "ObjectDestructuring")) {
            this.local = bt(h, this.$controller.scope, n, null);
        }
    }
    attaching(t, e) {
        this.ki();
        this.Ci(void 0);
        return this.Bi(t, this.gi ?? v);
    }
    detaching(t, e) {
        this.bi();
        return this.Si(t);
    }
    unbinding(t, e) {
        this.ci.clear();
    }
    itemsChanged() {
        if (!this.$controller.isActive) {
            return;
        }
        this.bi();
        this.ki();
        this.Ci(void 0);
        this.Ai(void 0);
    }
    handleCollectionChange(t, e) {
        const i = this.$controller;
        if (!i.isActive) {
            return;
        }
        if (this.fi) {
            if (this.di) {
                return;
            }
            this.di = true;
            this.items = bt(this.forOf.iterable, i.scope, this.wi, null);
            this.di = false;
            return;
        }
        this.ki();
        this.Ci(this.key === null ? e : void 0);
        this.Ai(e);
    }
    Ai(t) {
        const e = this.views;
        this.li = e.slice();
        const i = e.length;
        const s = this.key;
        const n = s !== null;
        const r = this.ai;
        const l = this.hi;
        if (n || t === void 0) {
            const e = this.local;
            const h = this.gi;
            const a = h.length;
            const c = this.forOf;
            const u = c.declaration;
            const f = this.wi;
            const d = this.pi;
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
            const e = D(this.Ri(t), () => this.Ti(t));
            if (M(e)) {
                e.catch(rethrow);
            }
        } else {
            this.Ti(t);
        }
    }
    bi() {
        const t = this.$controller.scope;
        let e = this.Ei;
        let i = this.fi;
        let s;
        if (i) {
            e = this.Ei = bt(this.mi, t, this.wi, null) ?? null;
            i = this.fi = !R(this.items, e);
        }
        const n = this.ui;
        if (this.$controller.isActive) {
            const t = i ? e : this.items;
            s = this.ui = this.yi.resolve(t).getObserver?.(t);
            if (n !== s) {
                n?.unsubscribe(this);
                s?.subscribe(this);
            }
        } else {
            n?.unsubscribe(this);
            this.ui = undefined;
        }
    }
    Ci(t) {
        const e = this.hi;
        this.ai = e.slice();
        const i = this.gi;
        const s = i.length;
        const n = this.hi = Array(i.length);
        const r = this.ci;
        const l = new Map;
        const h = this.$controller.scope;
        const a = this.wi;
        const c = this.forOf;
        const u = this.local;
        const f = this.pi;
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
        this.ci = l;
    }
    ki() {
        const t = this.items;
        if (w(t)) {
            this.gi = t.slice(0);
            return;
        }
        const e = [];
        this.yi.resolve(t).iterate(t, (t, i) => {
            e[i] = t;
        });
        this.gi = e;
    }
    Bi(t, e) {
        let i = void 0;
        let s;
        let n;
        let r;
        const {$controller: l, f: h, l: a, hi: c} = this;
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
    Si(t) {
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
    Ri(t) {
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
    Ti(t) {
        let e = void 0;
        let i;
        let s;
        let n = 0;
        const {$controller: r, f: l, l: h, views: a, hi: c, li: u} = this;
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
    type: Xe,
    name: "repeat",
    isTemplateController: true,
    bindables: [ "items" ]
};

let Zs = 16;

let Js = new Int32Array(Zs);

let tn = new Int32Array(Zs);

function longestIncreasingSubsequence(t) {
    const e = t.length;
    if (e > Zs) {
        Zs = e;
        Js = new Int32Array(e);
        tn = new Int32Array(e);
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
            l = Js[i];
            n = t[l];
            if (n !== -2 && n < s) {
                tn[r] = l;
                Js[++i] = r;
                continue;
            }
            h = 0;
            a = i;
            while (h < a) {
                c = h + a >> 1;
                n = t[Js[c]];
                if (n !== -2 && n < s) {
                    h = c + 1;
                } else {
                    a = c;
                }
            }
            n = t[Js[h]];
            if (s < n || n === -2) {
                if (h > 0) {
                    tn[r] = Js[h - 1];
                }
                Js[h] = r;
            }
        }
    }
    r = ++i;
    const u = new Int32Array(r);
    s = Js[i - 1];
    while (i-- > 0) {
        u[i] = s;
        s = tn[s];
    }
    while (r-- > 0) Js[r] = 0;
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

const en = /*@__PURE__*/ Re("IRepeatableHandlerResolver", t => t.singleton(RepeatableHandlerResolver));

class RepeatableHandlerResolver {
    constructor() {
        this.Li = g(b(sn));
    }
    resolve(t) {
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
        if (hn.handles(t)) {
            return hn;
        }
        const e = this.Li.find(e => e.handles(t));
        if (e !== void 0) {
            return e;
        }
        return an;
    }
}

class ArrayLikeHandler {
    static register(t) {
        t.register(Te(sn, this));
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

const sn = /*@__PURE__*/ Re("IRepeatableHandler");

const nn = {
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

const rn = {
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

const on = {
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

const ln = {
    handles: $,
    iterate(t, e) {
        let i = 0;
        for (;i < t; ++i) {
            e(i, i, t);
        }
    }
};

const hn = {
    handles: t => t == null,
    iterate() {}
};

const an = {
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
        this.view = g(ui).create().setLocation(g(Rs));
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
    type: Xe,
    name: "with",
    isTemplateController: true,
    bindables: [ "value" ]
};

class Switch {
    constructor() {
        this.cases = [];
        this.activeCases = [];
        this.promise = void 0;
        this.f = g(ui);
        this.l = g(Rs);
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
        this.queue(() => this.Mi(t));
    }
    Mi(t) {
        const e = t.isMatch(this.value);
        const i = this.activeCases;
        const s = i.length;
        if (!e) {
            if (s > 0 && i[0].id === t.id) {
                return this.Di(null);
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
        return D(this.Di(null, n), () => {
            this.activeCases = n;
            return this.Pi(null);
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
        return D(this.activeCases.length > 0 ? this.Di(t, i) : void 0, () => {
            this.activeCases = i;
            if (i.length === 0) {
                return;
            }
            return this.Pi(t);
        });
    }
    Pi(t) {
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
    Di(t, e = []) {
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
    type: Xe,
    name: "switch",
    isTemplateController: true,
    bindables: [ "value" ]
};

let cn = 0;

const un = [ "value", {
    name: "fallThrough",
    mode: Qt,
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
        this.id = ++cn;
        this.fallThrough = false;
        this.view = void 0;
        this.f = g(ui);
        this.Qe = g(Lt);
        this.l = g(Rs);
        this.qi = g(x).scopeTo(`Case-#${this.id}`);
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
        this.qi.debug("isMatch()");
        const e = this.value;
        if (w(e)) {
            if (this.ui === void 0) {
                this.ui = this.Ii(e);
            }
            return e.includes(t);
        }
        return e === t;
    }
    valueChanged(t, e) {
        if (w(t)) {
            this.ui?.unsubscribe(this);
            this.ui = this.Ii(t);
        } else if (this.ui !== void 0) {
            this.ui.unsubscribe(this);
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
        this.ui?.unsubscribe(this);
        this.view?.dispose();
        this.view = void 0;
    }
    linkToSwitch(t) {
        t.cases.push(this);
    }
    Ii(t) {
        const e = this.Qe.getArrayObserver(t);
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
        bindables: un,
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
        bindables: un,
        isTemplateController: true
    }, DefaultCase);
})();

var dn, mn, gn;

class PromiseTemplateController {
    constructor() {
        this.preSettledTask = null;
        this.postSettledTask = null;
        this.f = g(ui);
        this.l = g(Rs);
        this.p = g(je);
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
                if (!(t instanceof Wt)) throw t;
            }), e.then(h => {
                if (this.value !== e) {
                    return;
                }
                const fulfill = () => {
                    this.postSettlePromise = (this.postSettledTask = kt(() => L(n?.deactivate(t), s?.deactivate(t), i?.activate(t, r, h)))).result;
                };
                if (this.preSettledTask.status === we) {
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
                if (this.preSettledTask.status === we) {
                    void l.then(reject);
                } else {
                    this.preSettledTask.cancel();
                    reject();
                }
            }));
        };
        if (this.postSettledTask?.status === we) {
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
    type: Xe,
    name: "promise",
    isTemplateController: true,
    bindables: [ "value" ]
};

class PendingTemplateController {
    constructor() {
        this.view = void 0;
        this.f = g(ui);
        this.l = g(Rs);
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
    type: Xe,
    name: "pending",
    isTemplateController: true,
    bindables: {
        value: {
            mode: Yt
        }
    }
};

class FulfilledTemplateController {
    constructor() {
        this.view = void 0;
        this.f = g(ui);
        this.l = g(Rs);
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
    type: Xe,
    name: "then",
    isTemplateController: true,
    bindables: {
        value: {
            mode: Zt
        }
    }
};

class RejectedTemplateController {
    constructor() {
        this.view = void 0;
        this.f = g(ui);
        this.l = g(Rs);
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
    type: Xe,
    name: "catch",
    isTemplateController: true,
    bindables: {
        value: {
            mode: Zt
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

dn = Symbol.metadata;

PromiseAttributePattern[dn] = {
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

mn = Symbol.metadata;

FulfilledAttributePattern[mn] = {
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

gn = Symbol.metadata;

RejectedAttributePattern[gn] = {
    [y]: J.create([ {
        pattern: "catch",
        symbols: ""
    } ], RejectedAttributePattern)
};

class Focus {
    constructor() {
        this._i = false;
        this.Pe = g(Ue);
        this.p = g(je);
    }
    binding() {
        this.valueChanged();
    }
    valueChanged() {
        if (this.$controller.isActive) {
            this.Vi();
        } else {
            this._i = true;
        }
    }
    attached() {
        if (this._i) {
            this._i = false;
            this.Vi();
        }
        this.Pe.addEventListener("focus", this);
        this.Pe.addEventListener("blur", this);
    }
    detaching() {
        const t = this.Pe;
        t.removeEventListener("focus", this);
        t.removeEventListener("blur", this);
    }
    handleEvent(t) {
        if (t.type === "focus") {
            this.value = true;
        } else if (!this.Fi) {
            this.value = false;
        }
    }
    Vi() {
        const t = this.Pe;
        const e = this.Fi;
        const i = this.value;
        if (i && !e) {
            t.focus();
        } else if (!i && e) {
            t.blur();
        }
    }
    get Fi() {
        return this.Pe === this.p.document.activeElement;
    }
}

Focus.$au = {
    type: Xe,
    name: "focus",
    bindables: {
        value: {
            mode: Jt
        }
    }
};

class Portal {
    constructor() {
        this.position = "beforeend";
        this.strict = false;
        const t = g(ui);
        const e = g(Rs);
        const i = g(je);
        this.p = i;
        this.Hi = i.document.createElement("div");
        (this.view = t.create()).setLocation(this.Oi = fi(i));
        setEffectiveParentNode(this.view.nodes, e);
    }
    attaching(t) {
        if (this.callbackContext == null) {
            this.callbackContext = this.$controller.scope.bindingContext;
        }
        const e = this.Hi = this.$i();
        this.Ni(e, this.position);
        return this.Wi(t, e);
    }
    detaching(t) {
        return this.ji(t, this.Hi);
    }
    targetChanged() {
        const {$controller: t} = this;
        if (!t.isActive) {
            return;
        }
        const e = this.$i();
        if (this.Hi === e) {
            return;
        }
        this.Hi = e;
        const i = D(this.ji(null, e), () => {
            this.Ni(e, this.position);
            return this.Wi(null, e);
        });
        if (M(i)) {
            i.catch(rethrow);
        }
    }
    positionChanged() {
        const {$controller: t, Hi: e} = this;
        if (!t.isActive) {
            return;
        }
        const i = D(this.ji(null, e), () => {
            this.Ni(e, this.position);
            return this.Wi(null, e);
        });
        if (M(i)) {
            i.catch(rethrow);
        }
    }
    Wi(t, e) {
        const {activating: i, callbackContext: s, view: n} = this;
        return D(i?.call(s, e, n), () => this.zi(t, e));
    }
    zi(t, e) {
        const {$controller: i, view: s} = this;
        if (t === null) {
            s.nodes.insertBefore(this.Oi);
        } else {
            return D(s.activate(t ?? s, i, i.scope), () => this.Ui(e));
        }
        return this.Ui(e);
    }
    Ui(t) {
        const {activated: e, callbackContext: i, view: s} = this;
        return e?.call(i, t, s);
    }
    ji(t, e) {
        const {deactivating: i, callbackContext: s, view: n} = this;
        return D(i?.call(s, e, n), () => this.Gi(t, e));
    }
    Gi(t, e) {
        const {$controller: i, view: s} = this;
        if (t === null) {
            s.nodes.remove();
        } else {
            return D(s.deactivate(t, i), () => this.Xi(e));
        }
        return this.Xi(e);
    }
    Xi(t) {
        const {deactivated: e, callbackContext: i, view: s} = this;
        return D(e?.call(i, t, s), () => this.Ki());
    }
    $i() {
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
    Ki() {
        this.Oi.remove();
        this.Oi.$start.remove();
    }
    Ni(t, e) {
        const i = this.Oi;
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
    type: Xe,
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

let pn;

class AuSlot {
    constructor() {
        this.Qi = null;
        this.Yi = null;
        this.se = false;
        this.expose = null;
        this.slotchange = null;
        this.Zi = new Set;
        this.ui = null;
        const t = g(bs);
        const e = g(Rs);
        const i = g(X);
        const s = g(zi);
        const n = this.name = i.data.name;
        const r = i.projections?.[di];
        const l = t.instruction?.projections?.[n];
        const h = t.controller.container;
        let a;
        let c;
        if (l == null) {
            c = h.createChild({
                inheritParentResources: true
            });
            a = s.getViewFactory(r ?? (pn ??= CustomElementDefinition.create({
                name: "au-slot-empty-template",
                template: "",
                needsCompile: false
            })), c);
            this.Ji = false;
        } else {
            c = h.createChild();
            c.useResources(t.parent.controller.container);
            registerResolver(c, bs, new B(void 0, t.parent));
            a = s.getViewFactory(l, c);
            this.Ji = true;
            this.ts = h.getAll(pi, false)?.filter(t => t.slotName === "*" || t.slotName === n) ?? v;
        }
        this.es = (this.ts ??= v).length > 0;
        this.ss = t;
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
        this.Zi.add(t);
    }
    unsubscribe(t) {
        this.Zi.delete(t);
    }
    binding(t, e) {
        this.Qi = e.scope;
        while (e.vmKind === "synthetic" && e.parent?.viewModel instanceof AuSlot) {
            e = e.parent.parent;
        }
        const i = e.scope.bindingContext;
        let s;
        if (this.Ji) {
            s = this.ss.controller.scope.parent;
            (this.Yi = Et.fromParent(s, s.bindingContext)).overrideContext.$host = this.expose ?? i;
        }
    }
    attaching(t, e) {
        return D(this.view.activate(t, this.$controller, this.Ji ? this.Yi : this.Qi), () => {
            if (this.es || u(this.slotchange)) {
                this.ts.forEach(t => t.watch(this));
                this.ti();
                this.rs();
                this.se = true;
            }
        });
    }
    detaching(t, e) {
        this.se = false;
        this.ls();
        this.ts.forEach(t => t.unwatch(this));
        return this.view.deactivate(t, this.$controller);
    }
    exposeChanged(t) {
        if (this.Ji && this.Yi != null) {
            this.Yi.overrideContext.$host = t;
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
    ti() {
        if (this.ui != null) {
            return;
        }
        const t = this.l;
        const e = t.parentElement;
        if (e == null) {
            return;
        }
        (this.ui = createMutationObserver(e, e => {
            if (isMutationWithinLocation(t, e)) {
                this.rs();
            }
        })).observe(e, {
            childList: true
        });
    }
    ls() {
        this.ui?.disconnect();
        this.ui = null;
    }
    rs() {
        const t = this.nodes;
        const e = new Set(this.Zi);
        let i;
        if (this.se) {
            this.slotchange?.call(void 0, this.name, t);
        }
        for (i of e) {
            i.handleSlotChange(this, t);
        }
    }
}

AuSlot.$au = {
    type: Is,
    name: "au-slot",
    template: null,
    containerless: true,
    processContent(t, e, i) {
        i.name = t.getAttribute("name") ?? di;
        let s = t.firstChild;
        let n = null;
        while (s !== null) {
            n = s.nextSibling;
            if (isElement(s) && s.hasAttribute(mi)) {
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
        this.cs = void 0;
        this.tag = null;
        this.c = g(S);
        this.parent = g(ws);
        this.us = g(Ue);
        this.l = g(Rs);
        this.p = g(je);
        this.r = g(zi);
        this.ds = g(X);
        this.gs = g(j(CompositionContextFactory, null));
        this.xt = g(G);
        this.et = g(bs);
        this.ep = g(Gt);
        this.oL = g(Lt);
    }
    get composing() {
        return this.ps;
    }
    get composition() {
        return this.cs;
    }
    attaching(t, e) {
        return this.ps = D(this.queue(new ChangeInfo(this.template, this.component, this.model, void 0), t), t => {
            if (this.gs.xs(t)) {
                this.ps = void 0;
            }
        });
    }
    detaching(t) {
        const e = this.cs;
        const i = this.ps;
        this.gs.invalidate();
        this.cs = this.ps = void 0;
        return D(i, () => e?.deactivate(t));
    }
    propertyChanged(t) {
        if (t === "composing" || t === "composition") return;
        if (t === "model" && this.cs != null) {
            this.cs.update(this.model);
            return;
        }
        if (t === "tag" && this.cs?.controller.vmKind === as) {
            return;
        }
        this.ps = D(this.ps, () => D(this.queue(new ChangeInfo(this.template, this.component, this.model, t), void 0), t => {
            if (this.gs.xs(t)) {
                this.ps = void 0;
            }
        }));
    }
    queue(t, e) {
        const i = this.gs;
        const s = this.cs;
        return D(i.create(t), t => {
            if (i.xs(t)) {
                return D(this.compose(t), n => {
                    if (i.xs(t)) {
                        return D(n.activate(e), () => {
                            if (i.xs(t)) {
                                this.cs = n;
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
        const {ys: e, ws: i, bs: s} = t.change;
        const {c: n, $controller: r, l: l, ds: h} = this;
        const a = this.ks(this.et.controller.container, i);
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
        const m = this.Cs(c, typeof i === "string" ? a.Type : i, f, d);
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
                this.Bs(f, a, n).forEach(t => l.addBinding(t));
                return new CompositionController(l, t => l.activate(t ?? l, r, r.scope.parent), t => D(l.deactivate(t ?? l, r), removeCompositionHost), t => m.activate?.(t), t);
            } else {
                const s = CustomElementDefinition.create({
                    name: Hs.generateName(),
                    template: e
                });
                const n = this.r.getViewFactory(s, c);
                const l = Controller.$view(n, r);
                const h = this.scopeBehavior === "auto" ? Et.fromParent(this.parent.scope, m) : Et.create(m);
                l.setHost(f);
                if (d == null) {
                    this.Bs(f, s, i).forEach(t => l.addBinding(t));
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
    Cs(t, e, i, s) {
        if (e == null) {
            return new EmptyComponent;
        }
        if (typeof e === "object") {
            return e;
        }
        const n = this.p;
        registerHostNode(t, i, n);
        registerResolver(t, Rs, new B("IRenderLocation", s));
        const r = t.invoke(e);
        registerResolver(t, e, new B("au-compose.component", r));
        return r;
    }
    ks(t, e) {
        if (typeof e === "string") {
            const i = Hs.find(t, e);
            if (i == null) {
                throw createMappedError(806, e);
            }
            return i;
        }
        const i = u(e) ? e : e?.constructor;
        return Hs.isType(i, void 0) ? Hs.getDefinition(i, null) : null;
    }
    Bs(t, e, i) {
        const s = new HydrationContext(this.$controller, {
            projections: null,
            captures: i
        }, this.et.parent);
        return SpreadBinding.create(s, t, e, this.r, this.xt, this.p, this.ep, this.oL);
    }
}

AuCompose.$au = {
    type: Is,
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
        mode: Zt
    }, {
        name: "composition",
        mode: Zt
    }, "tag" ]
};

class EmptyComponent {}

class CompositionContextFactory {
    constructor() {
        this.id = 0;
    }
    xs(t) {
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
        this.ys = t;
        this.ws = e;
        this.bs = i;
        this.Ss = s;
    }
    load() {
        if (M(this.ys) || M(this.ws)) {
            return Promise.all([ this.ys, this.ws ]).then(([t, e]) => new LoadedChangeInfo(t, e, this.bs, this.Ss));
        } else {
            return new LoadedChangeInfo(this.ys, this.ws, this.bs, this.Ss);
        }
    }
}

class LoadedChangeInfo {
    constructor(t, e, i, s) {
        this.ys = t;
        this.ws = e;
        this.bs = i;
        this.Ss = s;
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

const vn = /*@__PURE__*/ Re("ISanitizer", t => t.singleton(class {
    sanitize() {
        throw createMappedError(99, "sanitize");
    }
}));

class SanitizeValueConverter {
    constructor() {
        this.As = g(vn);
    }
    toView(t) {
        if (t == null) {
            return null;
        }
        return this.As.sanitize(t);
    }
}

SanitizeValueConverter.$au = {
    type: Je,
    name: "sanitize"
};

class Show {
    constructor() {
        this.el = g(Ue);
        this.p = g(je);
        this.Rs = false;
        this.L = false;
        this.$val = "";
        this.$prio = "";
        this.update = () => {
            this.L = false;
            if (Boolean(this.value) !== this.Ts) {
                if (this.Ts === this.Es) {
                    this.Ts = !this.Es;
                    this.$val = this.el.style.getPropertyValue("display");
                    this.$prio = this.el.style.getPropertyPriority("display");
                    this.el.style.setProperty("display", "none", "important");
                } else {
                    this.Ts = this.Es;
                    this.el.style.setProperty("display", this.$val, this.$prio);
                    if (this.el.getAttribute("style") === "") {
                        this.el.removeAttribute("style");
                    }
                }
            }
        };
        const t = g(X);
        this.Ts = this.Es = t.alias !== "hide";
    }
    binding() {
        this.Rs = true;
        this.update();
    }
    detaching() {
        this.Rs = false;
        this.L = false;
    }
    valueChanged() {
        if (this.Rs && !this.L) {
            this.L = true;
            Ct(this.update);
        }
    }
}

Show.$au = {
    type: Xe,
    name: "show",
    bindables: [ "value" ],
    aliases: [ "hide" ]
};

const xn = [ js, jt, NodeObserverLocator ];

const yn = [ et, it, st, ci ];

const wn = [ nt, rt ];

const bn = [ ot, lt, ht, at, ct, ut, ft, dt, mt, gt, pt, vt, xt ];

const kn = [ DebounceBindingBehavior, OneTimeBindingBehavior, ToViewBindingBehavior, FromViewBindingBehavior, SignalBindingBehavior, ThrottleBindingBehavior, TwoWayBindingBehavior, SanitizeValueConverter, If, Else, Repeat, With, Switch, Case, DefaultCase, PromiseTemplateController, PendingTemplateController, FulfilledTemplateController, RejectedTemplateController, PromiseAttributePattern, FulfilledAttributePattern, RejectedAttributePattern, AttrBindingBehavior, SelfBindingBehavior, UpdateTriggerBindingBehavior, AuCompose, Portal, Focus, Show, AuSlot ];

const Cn = [ Ai, Ri, Bi, Si, yi, wi, bi, ki, Ci, Li, Ii, Mi, Di, Pi, qi, Ti, _i, Vi ];

const Bn = /*@__PURE__*/ createConfiguration(r);

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
            return e.register(Le(Pt, i.coercingOptions), Xt, ...xn, ...kn, ...yn, ...bn, ...Cn);
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
    const n = ne("dependencies");
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
        this.Ls = void 0;
        this.isBound = false;
        this.obj = e;
        this.cb = i;
        this.Z = s;
        this.Ms = n;
        this.Ds = r;
        this.ui = createMutationObserver(this.us = t, () => {
            this.Ps();
        });
    }
    getValue() {
        return this.isBound ? this.Ls : this.qs();
    }
    setValue(t) {}
    bind() {
        if (this.isBound) {
            return;
        }
        this.isBound = true;
        this.ui.observe(this.us, {
            childList: true
        });
        this.Ls = this.qs();
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        this.ui.takeRecords();
        this.ui.disconnect();
        this.Ls = v;
    }
    Ps() {
        this.Ls = this.qs();
        this.cb?.call(this.obj);
        this.subs.notify(this.Ls, undefined);
    }
    get() {
        throw createMappedError(99, "get");
    }
    qs() {
        const t = this.Z;
        const e = this.Ms;
        const i = this.Ds;
        const s = t === "$all" ? this.us.childNodes : this.us.querySelectorAll(`:scope > ${t}`);
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
        Le(Ye, this).register(t);
    }
    hydrating(t, e) {
        const i = this.J;
        const s = i.query ?? "*";
        const n = new ChildrenBinding(e.host, t, t[i.callback ?? `${oe(i.name)}Changed`], s, i.filter, i.map);
        if (/[\s>]/.test(s)) {
            throw createMappedError(9989, s);
        }
        me(t, i.name, {
            enumerable: true,
            configurable: true,
            get: ce(() => n.getValue(), {
                getObserver: () => n
            }),
            set: () => {}
        });
        e.addBinding(n);
    }
}

export { AdoptedStyleSheetsStyles, AppRoot, We as AppTask, ArrayLikeHandler, AttrBindingBehavior, AttrMapper, AttributeBinding, Ii as AttributeBindingRenderer, AttributeNSAccessor, AuCompose, AuSlot, AuSlotsInfo, Aurelia, Se as Bindable, BindableDefinition, Ie as BindingBehavior, BindingBehaviorDefinition, BindingModeBehavior, BindingTargetSubscriber, CSSModulesProcessorRegistry, Case, CheckedObserver, ChildrenBinding, ClassAttributeAccessor, ComputedWatcher, ContentBinding, Controller, Qe as CustomAttribute, CustomAttributeDefinition, bi as CustomAttributeRenderer, Hs as CustomElement, CustomElementDefinition, wi as CustomElementRenderer, DataAttributeAccessor, DebounceBindingBehavior, bn as DefaultBindingLanguage, yn as DefaultBindingSyntax, DefaultCase, xn as DefaultComponents, Cn as DefaultRenderers, kn as DefaultResources, Else, EventModifier, ci as EventModifierRegistration, ExpressionWatcher, FlushQueue, Focus, FragmentNodeSequence, FromViewBindingBehavior, FulfilledTemplateController, $s as IAppRoot, Ne as IAppTask, pi as IAuSlotWatcher, gi as IAuSlotsInfo, Ns as IAurelia, ws as IController, ai as IEventModifier, As as IEventTarget, ni as IFlushQueue, Ds as IHistory, bs as IHydrationContext, hi as IKeyMapping, Ye as ILifecycleHooks, Ei as IListenerBindingOptions, Ms as ILocation, li as IModifiedEventHandlerCreator, Ue as INode, je as IPlatform, Rs as IRenderLocation, xi as IRenderer, zi as IRendering, sn as IRepeatableHandler, en as IRepeatableHandlerResolver, Ws as ISVGAnalyzer, vn as ISanitizer, Xi as IShadowDOMGlobalStyles, Ui as IShadowDOMStyleFactory, Gi as IShadowDOMStyles, He as ISignaler, ui as IViewFactory, Ls as IWindow, If, InterpolationBinding, Si as InterpolationBindingRenderer, InterpolationPartBinding, Ri as IteratorBindingRenderer, LetBinding, Ci as LetElementRenderer, Ze as LifecycleHooks, LifecycleHooksDefinition, LifecycleHooksEntry, ListenerBinding, ListenerBindingOptions, Li as ListenerBindingRenderer, rs as MountTarget, NodeObserverLocator, NoopSVGAnalyzer, OneTimeBindingBehavior, PendingTemplateController, Portal, PromiseTemplateController, PropertyBinding, Ai as PropertyBindingRenderer, RefBinding, Bi as RefBindingRenderer, RejectedTemplateController, Rendering, Repeat, js as RuntimeTemplateCompilerImplementation, SVGAnalyzer, SanitizeValueConverter, SelectValueObserver, SelfBindingBehavior, Mi as SetAttributeRenderer, Di as SetClassAttributeRenderer, yi as SetPropertyRenderer, Pi as SetStyleAttributeRenderer, ShadowDOMRegistry, wn as ShortHandBindingSyntax, SignalBindingBehavior, _i as SpreadRenderer, Bn as StandardConfiguration, ys as State, StyleAttributeAccessor, Ki as StyleConfiguration, StyleElementStyles, qi as StylePropertyBindingRenderer, Switch, ki as TemplateControllerRenderer, Ti as TextBindingRenderer, ThrottleBindingBehavior, ToViewBindingBehavior, TwoWayBindingBehavior, UpdateTriggerBindingBehavior, ValueAttributeObserver, ei as ValueConverter, ValueConverterDefinition, ViewFactory, Ge as Watch, With, alias, bindable, bindingBehavior, capture, children, coercer, containerless, convertToRenderLocation, cssModules, customAttribute, customElement, getEffectiveParentNode, isCustomElementController, isCustomElementViewModel, isRenderLocation, lifecycleHooks, si as mixinAstEvaluator, ii as mixinUseScope, ri as mixingBindingLimited, processContent, ze as refs, registerAliases, registerHostNode, renderer, setEffectiveParentNode, shadowCSS, slotted, templateController, useShadowDOM, valueConverter, watch };

