"use strict";

var t = require("@aurelia/kernel");

var e = require("@aurelia/template-compiler");

var s = require("@aurelia/metadata");

var i = require("@aurelia/runtime");

var n = require("@aurelia/platform-browser");

var r = require("@aurelia/expression-parser");

var l = require("@aurelia/platform");

typeof SuppressedError === "function" ? SuppressedError : function(t, e, s) {
    var i = new Error(s);
    return i.name = "SuppressedError", i.error = t, i.suppressed = e, i;
};

const {default: h, oneTime: a, toView: c, fromView: u, twoWay: f} = e.BindingMode;

const d = s.Metadata.get;

const p = s.Metadata.has;

const m = s.Metadata.define;

const {annotation: g} = t.Protocol;

const x = g.keyFor;

const v = Object;

const y = String;

const w = v.prototype;

const b = w.hasOwnProperty;

const k = v.freeze;

const C = v.assign;

const B = v.getOwnPropertyNames;

const S = v.keys;

const A = /*@__PURE__*/ t.createLookup();

const isDataAttribute = (e, s, i) => {
    if (A[s] === true) {
        return true;
    }
    if (!t.isString(s)) {
        return false;
    }
    const n = s.slice(0, 5);
    return A[s] = n === "aria-" || n === "data-" || i.isStandardSvgAttribute(e, s);
};

const rethrow = t => {
    throw t;
};

const R = Reflect.defineProperty;

const defineHiddenProp = (t, e, s) => {
    R(t, e, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: s
    });
    return s;
};

const addSignalListener = (t, e, s) => t.addSignalListener(e, s);

const removeSignalListener = (t, e, s) => t.removeSignalListener(e, s);

const T = "Interpolation";

const E = "IsIterator";

const L = "IsFunction";

const M = "IsProperty";

const q = "pending";

const D = "running";

const P = i.AccessorType.Observer;

const I = i.AccessorType.Node;

const _ = i.AccessorType.Layout;

const createMappedError = (t, ...e) => new Error(`AUR${y(t).padStart(4, "0")}:${e.map(y)}`);

function bindable(e, s) {
    let i = void 0;
    function decorator(e, s) {
        let n;
        switch (s.kind) {
          case "getter":
          case "field":
            {
                const t = s.name;
                if (typeof t !== "string") throw createMappedError(227);
                n = t;
                break;
            }

          case "class":
            if (i == null) throw createMappedError(228);
            if (typeof i == "string") {
                n = i;
            } else {
                const t = i.name;
                if (!t) throw createMappedError(229);
                if (typeof t !== "string") throw createMappedError(227);
                n = t;
            }
            break;
        }
        const r = i == null || typeof i === "string" ? {
            name: n
        } : i;
        const l = s.metadata[V] ??= t.createLookup();
        l[n] = BindableDefinition.create(n, r);
    }
    if (arguments.length > 1) {
        i = {};
        decorator(e, s);
        return;
    } else if (t.isString(e)) {
        i = e;
        return decorator;
    }
    i = e === void 0 ? {} : e;
    return decorator;
}

const V = /*@__PURE__*/ x("bindables");

const F = k({
    name: V,
    keyFrom: t => `${V}:${t}`,
    from(...e) {
        const s = {};
        const i = Array.isArray;
        function addName(t) {
            s[t] = BindableDefinition.create(t);
        }
        function addDescription(t, e) {
            s[t] = e instanceof BindableDefinition ? e : BindableDefinition.create(t, e === true ? {} : e);
        }
        function addList(e) {
            if (i(e)) {
                e.forEach((e => t.isString(e) ? addName(e) : addDescription(e.name, e)));
            } else if (e instanceof BindableDefinition) {
                s[e.name] = e;
            } else if (e !== void 0) {
                S(e).forEach((t => addDescription(t, e[t])));
            }
        }
        e.forEach(addList);
        return s;
    },
    getAll(e) {
        const s = [];
        const i = t.getPrototypeChain(e);
        let n = i.length;
        let r;
        while (--n >= 0) {
            r = i[n];
            const t = d(V, r);
            if (t == null) continue;
            s.push(...Object.values(t));
        }
        return s;
    },
    i(e, s) {
        let i = d(V, s);
        if (i == null) {
            m(i = t.createLookup(), s, V);
        }
        i[e.name] = e;
    }
});

class BindableDefinition {
    constructor(t, e, s, i, n, r) {
        this.attribute = t;
        this.callback = e;
        this.mode = s;
        this.primary = i;
        this.name = n;
        this.set = r;
    }
    static create(s, i = {}) {
        const n = i.mode ?? c;
        return new BindableDefinition(i.attribute ?? t.kebabCase(s), i.callback ?? `${s}Changed`, t.isString(n) ? e.BindingMode[n] ?? h : n, i.primary ?? false, i.name ?? s, i.set ?? getInterceptor(i));
    }
}

function coercer(t, e) {
    e.addInitializer((function() {
        H.define(this, e.name);
    }));
}

const H = {
    key: /*@__PURE__*/ x("coercer"),
    define(t, e) {
        m(t[e].bind(t), t, H.key);
    },
    for(t) {
        return d(H.key, t);
    }
};

function getInterceptor(e = {}) {
    const s = e.type ?? null;
    if (s == null) {
        return t.noop;
    }
    let i;
    switch (s) {
      case Number:
      case Boolean:
      case String:
      case BigInt:
        i = s;
        break;

      default:
        {
            const e = s.coerce;
            i = typeof e === "function" ? e.bind(s) : H.for(s) ?? t.noop;
            break;
        }
    }
    return i === t.noop ? i : createCoercer(i, e.nullable);
}

function createCoercer(t, e) {
    return function(s, i) {
        if (!i?.enableCoercion) return s;
        return (e ?? (i?.coerceNullish ?? false ? false : true)) && s == null ? s : t(s, i);
    };
}

const O = t.DI.createInterface;

const $ = t.Registration.singleton;

const N = t.Registration.aliasTo;

const W = t.Registration.instance;

t.Registration.callback;

t.Registration.transient;

const registerResolver = (t, e, s) => t.registerResolver(e, s);

function alias(...t) {
    return function(e, s) {
        s.addInitializer((function() {
            const e = x("aliases");
            const s = d(e, this);
            if (s === void 0) {
                m(t, this, e);
            } else {
                s.push(...t);
            }
        }));
    };
}

function registerAliases(t, e, s, i) {
    for (let n = 0, r = t.length; n < r; ++n) {
        N(s, e.keyFrom(t[n])).register(i);
    }
}

const j = "custom-element";

const z = "custom-attribute";

const getDefinitionFromStaticAu = (t, e, s, i = "__au_static_resource__") => {
    let n = d(i, t);
    if (n == null) {
        if (t.$au?.type === e) {
            n = s(t.$au, t);
            m(n, t, i);
        }
    }
    return n;
};

function bindingBehavior(t) {
    return function(e, s) {
        s.addInitializer((function() {
            K.define(t, this);
        }));
        return e;
    };
}

class BindingBehaviorDefinition {
    constructor(t, e, s, i) {
        this.Type = t;
        this.name = e;
        this.aliases = s;
        this.key = i;
    }
    static create(e, s) {
        let i;
        let n;
        if (t.isString(e)) {
            i = e;
            n = {
                name: i
            };
        } else {
            i = e.name;
            n = e;
        }
        return new BindingBehaviorDefinition(s, t.firstDefined(getBehaviorAnnotation(s, "name"), i), t.mergeArrays(getBehaviorAnnotation(s, "aliases"), n.aliases, s.aliases), K.keyFrom(i));
    }
    register(t, e) {
        const s = this.Type;
        const i = typeof e === "string" ? getBindingBehaviorKeyFrom(e) : this.key;
        const n = this.aliases;
        if (!t.has(i, false)) {
            t.register(t.has(s, false) ? null : $(s, s), N(s, i), ...n.map((t => N(s, getBindingBehaviorKeyFrom(t)))));
        }
    }
}

const U = "binding-behavior";

const G = /*@__PURE__*/ t.getResourceKeyFor(U);

const getBehaviorAnnotation = (t, e) => d(x(e), t);

const getBindingBehaviorKeyFrom = t => `${G}:${t}`;

const K = /*@__PURE__*/ k({
    name: G,
    keyFrom: getBindingBehaviorKeyFrom,
    isType(e) {
        return t.isFunction(e) && (p(G, e) || e.$au?.type === U);
    },
    define(e, s) {
        const i = BindingBehaviorDefinition.create(e, s);
        const n = i.Type;
        m(i, n, G, t.resourceBaseName);
        return n;
    },
    getDefinition(t) {
        const e = d(G, t) ?? getDefinitionFromStaticAu(t, U, BindingBehaviorDefinition.create);
        if (e === void 0) {
            throw createMappedError(151, t);
        }
        return e;
    },
    find(t, e) {
        const s = t.find(U, e);
        return s == null ? null : d(G, s) ?? getDefinitionFromStaticAu(s, U, BindingBehaviorDefinition.create) ?? null;
    },
    get(e, s) {
        return e.get(t.resource(getBindingBehaviorKeyFrom(s)));
    }
});

const X = new Map;

const createConfig = t => ({
    type: U,
    name: t
});

class BindingModeBehavior {
    bind(t, e) {
        X.set(e, e.mode);
        e.mode = this.mode;
    }
    unbind(t, e) {
        e.mode = X.get(e);
        X.delete(e);
    }
}

class OneTimeBindingBehavior extends BindingModeBehavior {
    get mode() {
        return a;
    }
}

OneTimeBindingBehavior.$au = createConfig("oneTime");

class ToViewBindingBehavior extends BindingModeBehavior {
    get mode() {
        return c;
    }
}

ToViewBindingBehavior.$au = createConfig("toView");

class FromViewBindingBehavior extends BindingModeBehavior {
    get mode() {
        return u;
    }
}

FromViewBindingBehavior.$au = createConfig("fromView");

class TwoWayBindingBehavior extends BindingModeBehavior {
    get mode() {
        return f;
    }
}

TwoWayBindingBehavior.$au = createConfig("twoWay");

const Q = new WeakMap;

const Y = 200;

class DebounceBindingBehavior {
    constructor() {
        this.p = t.resolve(t.IPlatform);
    }
    bind(e, s, i, n) {
        const r = {
            type: "debounce",
            delay: i ?? Y,
            now: this.p.performanceNow,
            queue: this.p.taskQueue,
            signals: t.isString(n) ? [ n ] : n ?? t.emptyArray
        };
        const l = s.limit?.(r);
        if (l == null) ; else {
            Q.set(s, l);
        }
    }
    unbind(t, e) {
        Q.get(e)?.dispose();
        Q.delete(e);
    }
}

DebounceBindingBehavior.$au = {
    type: U,
    name: "debounce"
};

const Z = /*@__PURE__*/ O("ISignaler", (t => t.singleton(Signaler)));

class Signaler {
    constructor() {
        this.signals = t.createLookup();
    }
    dispatchSignal(t) {
        const e = this.signals[t];
        if (e === undefined) {
            return;
        }
        let s;
        for (s of e.keys()) {
            s.handleChange(undefined, undefined);
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
        this.u = t.resolve(Z);
    }
    bind(t, e, ...s) {
        if (!("handleChange" in e)) {
            throw createMappedError(817);
        }
        if (s.length === 0) {
            throw createMappedError(818);
        }
        this.h.set(e, s);
        let i;
        for (i of s) {
            addSignalListener(this.u, i, e);
        }
    }
    unbind(t, e) {
        const s = this.h.get(e);
        this.h.delete(e);
        let i;
        for (i of s) {
            removeSignalListener(this.u, i, e);
        }
    }
}

SignalBindingBehavior.$au = {
    type: U,
    name: "signal"
};

const J = new WeakMap;

const tt = 200;

class ThrottleBindingBehavior {
    constructor() {
        ({performanceNow: this.C, taskQueue: this.B} = t.resolve(t.IPlatform));
    }
    bind(e, s, i, n) {
        const r = {
            type: "throttle",
            delay: i ?? tt,
            now: this.C,
            queue: this.B,
            signals: t.isString(n) ? [ n ] : n ?? t.emptyArray
        };
        const l = s.limit?.(r);
        if (l == null) ; else {
            J.set(s, l);
        }
    }
    unbind(t, e) {
        J.get(e)?.dispose();
        J.delete(e);
    }
}

ThrottleBindingBehavior.$au = {
    type: U,
    name: "throttle"
};

const et = /*@__PURE__*/ O("IAppTask");

class $AppTask {
    constructor(t, e, s) {
        this.c = void 0;
        this.slot = t;
        this.k = e;
        this.cb = s;
    }
    register(t) {
        return this.c = t.register(W(et, this));
    }
    run() {
        const t = this.k;
        const e = this.cb;
        return t === null ? e() : e(this.c.get(t));
    }
}

const st = k({
    creating: createAppTaskSlotHook("creating"),
    hydrating: createAppTaskSlotHook("hydrating"),
    hydrated: createAppTaskSlotHook("hydrated"),
    activating: createAppTaskSlotHook("activating"),
    activated: createAppTaskSlotHook("activated"),
    deactivating: createAppTaskSlotHook("deactivating"),
    deactivated: createAppTaskSlotHook("deactivated")
});

function createAppTaskSlotHook(e) {
    function appTaskFactory(s, i) {
        if (t.isFunction(i)) {
            return new $AppTask(e, s, i);
        }
        return new $AppTask(e, null, s);
    }
    return appTaskFactory;
}

const it = t.IPlatform;

function watch(e, s) {
    if (e == null) {
        throw createMappedError(772);
    }
    return function decorator(i, n) {
        const r = n.kind === "class";
        if (r) {
            if (!t.isFunction(s) && (s == null || !(s in i.prototype))) {
                throw createMappedError(773, `${y(s)}@${i.name}}`);
            }
        } else if (!t.isFunction(i) || n.static) {
            throw createMappedError(774, n.name);
        }
        const l = new WatchDefinition(e, r ? s : i);
        if (r) {
            addDefinition(i);
        } else {
            let t = false;
            n.addInitializer((function() {
                if (!t) {
                    t = true;
                    addDefinition(this.constructor);
                }
            }));
        }
        function addDefinition(t) {
            nt.add(t, l);
            if (isAttributeType(t)) {
                getAttributeDefinition(t).watches.push(l);
            }
            if (isElementType(t)) {
                getElementDefinition(t).watches.push(l);
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

const nt = /*@__PURE__*/ (() => {
    const e = new WeakMap;
    return k({
        add(t, s) {
            let i = e.get(t);
            if (i == null) {
                e.set(t, i = []);
            }
            i.push(s);
        },
        getDefinitions(s) {
            return e.get(s) ?? t.emptyArray;
        }
    });
})();

function customAttribute(t) {
    return function(e, s) {
        s.addInitializer((function() {
            defineAttribute(t, this);
        }));
        return e;
    };
}

function templateController(e) {
    return function(s, i) {
        i.addInitializer((function() {
            defineAttribute(t.isString(e) ? {
                isTemplateController: true,
                name: e
            } : {
                isTemplateController: true,
                ...e
            }, this);
        }));
        return s;
    };
}

class CustomAttributeDefinition {
    get type() {
        return z;
    }
    constructor(t, e, s, i, n, r, l, h, a, c, u) {
        this.Type = t;
        this.name = e;
        this.aliases = s;
        this.key = i;
        this.defaultBindingMode = n;
        this.isTemplateController = r;
        this.bindables = l;
        this.noMultiBindings = h;
        this.watches = a;
        this.dependencies = c;
        this.containerStrategy = u;
    }
    static create(s, i) {
        let n;
        let r;
        if (t.isString(s)) {
            n = s;
            r = {
                name: n
            };
        } else {
            n = s.name;
            r = s;
        }
        const l = t.firstDefined(getAttributeAnnotation(i, "defaultBindingMode"), r.defaultBindingMode, i.defaultBindingMode, c);
        for (const t of Object.values(F.from(r.bindables))) {
            F.i(t, i);
        }
        return new CustomAttributeDefinition(i, t.firstDefined(getAttributeAnnotation(i, "name"), n), t.mergeArrays(getAttributeAnnotation(i, "aliases"), r.aliases, i.aliases), getAttributeKeyFrom(n), t.isString(l) ? e.BindingMode[l] ?? h : l, t.firstDefined(getAttributeAnnotation(i, "isTemplateController"), r.isTemplateController, i.isTemplateController, false), F.from(...F.getAll(i), getAttributeAnnotation(i, "bindables"), i.bindables, r.bindables), t.firstDefined(getAttributeAnnotation(i, "noMultiBindings"), r.noMultiBindings, i.noMultiBindings, false), t.mergeArrays(nt.getDefinitions(i), i.watches), t.mergeArrays(getAttributeAnnotation(i, "dependencies"), r.dependencies, i.dependencies), t.firstDefined(getAttributeAnnotation(i, "containerStrategy"), r.containerStrategy, i.containerStrategy, "reuse"));
    }
    register(e, s) {
        const i = this.Type;
        const n = typeof s === "string" ? getAttributeKeyFrom(s) : this.key;
        const r = this.aliases;
        if (!e.has(n, false)) {
            e.register(e.has(i, false) ? null : $(i, i), N(i, n), ...r.map((t => N(i, getAttributeKeyFrom(t)))));
        } else {
            if (CustomAttributeDefinition.warnDuplicate) {
                e.get(t.ILogger).warn(createMappedError(154, this.name));
            }
        }
    }
    toString() {
        return `au:ca:${this.name}`;
    }
}

CustomAttributeDefinition.warnDuplicate = true;

const ot = "custom-attribute";

const rt = /*@__PURE__*/ t.getResourceKeyFor(ot);

const getAttributeKeyFrom = t => `${rt}:${t}`;

const getAttributeAnnotation = (t, e) => d(x(e), t);

const isAttributeType = e => t.isFunction(e) && (p(rt, e) || e.$au?.type === ot);

const findAttributeControllerFor = (t, e) => getRef(t, getAttributeKeyFrom(e)) ?? void 0;

const defineAttribute = (e, s) => {
    const i = CustomAttributeDefinition.create(e, s);
    const n = i.Type;
    m(i, n, rt, t.resourceBaseName);
    return n;
};

const getAttributeDefinition = t => {
    const e = d(rt, t) ?? getDefinitionFromStaticAu(t, ot, CustomAttributeDefinition.create);
    if (e === void 0) {
        throw createMappedError(759, t);
    }
    return e;
};

const findClosestControllerByName = (e, s) => {
    let i = "";
    let n = "";
    if (t.isString(s)) {
        i = getAttributeKeyFrom(s);
        n = s;
    } else {
        const t = getAttributeDefinition(s);
        i = t.key;
        n = t.name;
    }
    let r = e;
    while (r !== null) {
        const t = getRef(r, i);
        if (t?.is(n)) {
            return t;
        }
        r = getEffectiveParentNode(r);
    }
    return null;
};

const lt = /*@__PURE__*/ k({
    name: rt,
    keyFrom: getAttributeKeyFrom,
    isType: isAttributeType,
    for: findAttributeControllerFor,
    closest: findClosestControllerByName,
    define: defineAttribute,
    getDefinition: getAttributeDefinition,
    annotate(t, e, s) {
        m(s, t, x(e));
    },
    getAnnotation: getAttributeAnnotation,
    find(t, e) {
        const s = t.find(ot, e);
        return s === null ? null : d(rt, s) ?? getDefinitionFromStaticAu(s, ot, CustomAttributeDefinition.create) ?? null;
    }
});

const ht = /*@__PURE__*/ O("ILifecycleHooks");

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
        const s = new Set;
        let i = e.prototype;
        while (i !== w) {
            for (const t of B(i)) {
                if (t !== "constructor" && !t.startsWith("_")) {
                    s.add(t);
                }
            }
            i = Object.getPrototypeOf(i);
        }
        return new LifecycleHooksDefinition(e, s);
    }
}

const at = /*@__PURE__*/ (() => {
    const t = new WeakMap;
    const e = new WeakMap;
    return k({
        define(t, s) {
            const i = LifecycleHooksDefinition.create(t, s);
            const n = i.Type;
            e.set(n, i);
            return {
                register(t) {
                    $(ht, n).register(t);
                }
            };
        },
        resolve(s) {
            let i = t.get(s);
            if (i === void 0) {
                t.set(s, i = new LifecycleHooksLookupImpl);
                const n = s.root;
                const r = n === s ? s.getAll(ht) : s.has(ht, false) ? n.getAll(ht).concat(s.getAll(ht)) : n.getAll(ht);
                let l;
                let h;
                let a;
                let c;
                let u;
                for (l of r) {
                    h = e.get(l.constructor);
                    a = new LifecycleHooksEntry(h, l);
                    for (c of h.propertyNames) {
                        u = i[c];
                        if (u === void 0) {
                            i[c] = [ a ];
                        } else {
                            u.push(a);
                        }
                    }
                }
            }
            return i;
        }
    });
})();

class LifecycleHooksLookupImpl {}

function lifecycleHooks(e, s) {
    function decorator(e, s) {
        const i = s?.metadata ?? (e[Symbol.metadata] ??= Object.create(null));
        i[t.registrableMetadataKey] = at.define({}, e);
        return e;
    }
    return e == null ? decorator : decorator(e, s);
}

function valueConverter(t) {
    return function(e, s) {
        s.addInitializer((function() {
            ft.define(t, this);
        }));
        return e;
    };
}

class ValueConverterDefinition {
    constructor(t, e, s, i) {
        this.Type = t;
        this.name = e;
        this.aliases = s;
        this.key = i;
    }
    static create(e, s) {
        let i;
        let n;
        if (t.isString(e)) {
            i = e;
            n = {
                name: i
            };
        } else {
            i = e.name;
            n = e;
        }
        return new ValueConverterDefinition(s, t.firstDefined(getConverterAnnotation(s, "name"), i), t.mergeArrays(getConverterAnnotation(s, "aliases"), n.aliases, s.aliases), ft.keyFrom(i));
    }
    register(t, e) {
        const s = this.Type;
        const i = typeof e === "string" ? getValueConverterKeyFrom(e) : this.key;
        const n = this.aliases;
        if (!t.has(i, false)) {
            t.register(t.has(s, false) ? null : $(s, s), N(s, i), ...n.map((t => N(s, getValueConverterKeyFrom(t)))));
        }
    }
}

const ct = "value-converter";

const ut = /*@__PURE__*/ t.getResourceKeyFor(ct);

const getConverterAnnotation = (t, e) => d(x(e), t);

const getValueConverterKeyFrom = t => `${ut}:${t}`;

const ft = k({
    name: ut,
    keyFrom: getValueConverterKeyFrom,
    isType(e) {
        return t.isFunction(e) && (p(ut, e) || e.$au?.type === ct);
    },
    define(e, s) {
        const i = ValueConverterDefinition.create(e, s);
        const n = i.Type;
        m(i, n, ut, t.resourceBaseName);
        return n;
    },
    getDefinition(t) {
        const e = d(ut, t) ?? getDefinitionFromStaticAu(t, ct, ValueConverterDefinition.create);
        if (e === void 0) {
            throw createMappedError(152, t);
        }
        return e;
    },
    annotate(t, e, s) {
        m(s, t, x(e));
    },
    getAnnotation: getConverterAnnotation,
    find(t, e) {
        const s = t.find(ct, e);
        return s == null ? null : d(ut, s) ?? getDefinitionFromStaticAu(s, ct, ValueConverterDefinition.create) ?? null;
    },
    get(e, s) {
        return e.get(t.resource(getValueConverterKeyFrom(s)));
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
        const s = this.b;
        if (t !== i.astEvaluate(s.ast, s.s, s, null)) {
            this.v = t;
            this.A.add(this);
        }
    }
}

const dt = /*@__PURE__*/ (() => {
    function useScope(t) {
        this.s = t;
    }
    return t => {
        defineHiddenProp(t.prototype, "useScope", useScope);
    };
})();

const pt = /*@__PURE__*/ (() => {
    class ResourceLookup {}
    const t = new WeakMap;
    const e = new WeakMap;
    const s = new WeakMap;
    function evaluatorGet(t) {
        return this.l.get(t);
    }
    function evaluatorGetBehavior(t, s) {
        let i = e.get(t);
        if (i == null) {
            e.set(t, i = new ResourceLookup);
        }
        return i[s] ??= K.get(t.l, s);
    }
    function evaluatorBindBehavior(t, e, i) {
        const n = evaluatorGetBehavior(this, t);
        if (n == null) {
            throw createMappedError(101, t);
        }
        let r = s.get(this);
        if (r == null) {
            s.set(this, r = {});
        }
        if (r[t]) {
            throw createMappedError(102, t);
        }
        n.bind?.(e, this, ...i);
    }
    function evaluatorUnbindBehavior(t, e) {
        const i = evaluatorGetBehavior(this, t);
        const n = s.get(this);
        i?.unbind?.(e, this);
        if (n != null) {
            n[t] = false;
        }
    }
    function evaluatorGetConverter(e, s) {
        let i = t.get(e);
        if (i == null) {
            t.set(e, i = new ResourceLookup);
        }
        return i[s] ??= ft.get(e.l, s);
    }
    function evaluatorBindConverter(t) {
        const e = evaluatorGetConverter(this, t);
        if (e == null) {
            throw createMappedError(103, t);
        }
        const s = e.signals;
        if (s != null) {
            const t = this.l.get(Z);
            const e = s.length;
            let i = 0;
            for (;i < e; ++i) {
                t.addSignalListener(s[i], this);
            }
        }
    }
    function evaluatorUnbindConverter(t) {
        const e = evaluatorGetConverter(this, t);
        if (e?.signals === void 0) {
            return;
        }
        const s = this.l.get(Z);
        let i = 0;
        for (;i < e.signals.length; ++i) {
            s.removeSignalListener(e.signals[i], this);
        }
    }
    function evaluatorUseConverter(t, e, s, i) {
        const n = evaluatorGetConverter(this, t);
        if (n == null) {
            throw createMappedError(103, t);
        }
        switch (e) {
          case "toView":
            return "toView" in n ? n.toView(s, ...i) : s;

          case "fromView":
            return "fromView" in n ? n.fromView?.(s, ...i) : s;
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

const mt = /*@__PURE__*/ O("IFlushQueue", (t => t.singleton(FlushQueue)));

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

const flushItem = function(t, e, s) {
    s.delete(t);
    t.flush();
};

const gt = /*@__PURE__*/ (() => {
    const t = new WeakSet;
    const debounced = (t, e, s) => {
        let i;
        let n;
        let r;
        let l = false;
        const h = t.queue;
        const callOriginalCallback = () => e(r);
        const fn = e => {
            r = e;
            if (s.isBound) {
                n = i;
                i = h.queueTask(callOriginalCallback, {
                    delay: t.delay
                });
                n?.cancel();
            } else {
                callOriginalCallback();
            }
        };
        const a = fn.dispose = () => {
            n?.cancel();
            i?.cancel();
            n = i = void 0;
        };
        fn.flush = () => {
            l = i?.status === q;
            a();
            if (l) {
                callOriginalCallback();
            }
        };
        return fn;
    };
    const throttled = (t, e, s) => {
        let i;
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
            if (s.isBound) {
                l = now() - r;
                n = i;
                if (l > t.delay) {
                    r = now();
                    callOriginalCallback();
                } else {
                    i = c.queueTask((() => {
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
            i?.cancel();
            n = i = void 0;
        };
        fn.flush = () => {
            a = i?.status === q;
            u();
            if (a) {
                callOriginalCallback();
            }
        };
        return fn;
    };
    return (e, s) => {
        defineHiddenProp(e.prototype, "limit", (function(e) {
            if (t.has(this)) {
                throw createMappedError(9996);
            }
            t.add(this);
            const i = s(this, e);
            const n = e.signals;
            const r = n.length > 0 ? this.get(Z) : null;
            const l = this[i];
            const callOriginal = (...t) => l.call(this, ...t);
            const h = e.type === "debounce" ? debounced(e, callOriginal, this) : throttled(e, callOriginal, this);
            const a = r ? {
                handleChange: h.flush
            } : null;
            this[i] = h;
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
                    delete this[i];
                }
            };
        }));
    };
})();

const xt = ((t = new WeakSet) => e => function() {
    if (!t.has(this)) {
        t.add(this);
        e.call(this);
    }
})();

const vt = {
    preempt: true
};

class AttributeBinding {
    constructor(t, e, s, i, n, r, l, h, a, c) {
        this.targetAttribute = l;
        this.targetProperty = h;
        this.mode = a;
        this.strict = c;
        this.isBound = false;
        this.s = void 0;
        this.L = null;
        this.v = void 0;
        this.boundFn = false;
        this.l = e;
        this.ast = n;
        this.M = t;
        this.target = r;
        this.oL = s;
        this.B = i;
    }
    updateTarget(e) {
        const s = this.target;
        const i = this.targetAttribute;
        const n = this.targetProperty;
        switch (i) {
          case "class":
            s.classList.toggle(n, !!e);
            break;

          case "style":
            {
                let i = "";
                let r = y(e);
                if (t.isString(r) && r.includes("!important")) {
                    i = "important";
                    r = r.replace("!important", "");
                }
                s.style.setProperty(n, r, i);
                break;
            }

          default:
            {
                if (e == null) {
                    s.removeAttribute(i);
                } else {
                    s.setAttribute(i, y(e));
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
        const e = i.astEvaluate(this.ast, this.s, this, (this.mode & c) > 0 ? this : null);
        this.obs.clear();
        if (e !== this.v) {
            this.v = e;
            const s = this.M.state !== Ee;
            if (s) {
                t = this.L;
                this.L = this.B.queueTask((() => {
                    this.L = null;
                    this.updateTarget(e);
                }), vt);
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
        i.astBind(this.ast, t, this);
        if (this.mode & (c | a)) {
            this.updateTarget(this.v = i.astEvaluate(this.ast, t, this, (this.mode & c) > 0 ? this : null));
        }
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        i.astUnbind(this.ast, this.s, this);
        this.s = void 0;
        this.v = void 0;
        this.L?.cancel();
        this.L = null;
        this.obs.clearAll();
    }
}

AttributeBinding.mix = xt((() => {
    dt(AttributeBinding);
    gt(AttributeBinding, (() => "updateTarget"));
    i.connectable(AttributeBinding, null);
    pt(AttributeBinding);
}));

const yt = {
    preempt: true
};

class InterpolationBinding {
    constructor(t, e, s, i, n, r, l, h, a) {
        this.ast = n;
        this.target = r;
        this.targetProperty = l;
        this.mode = h;
        this.strict = a;
        this.isBound = false;
        this.s = void 0;
        this.L = null;
        this.M = t;
        this.oL = s;
        this.B = i;
        this.q = s.getAccessor(r, l);
        const c = n.expressions;
        const u = this.partBindings = Array(c.length);
        const f = c.length;
        let d = 0;
        for (;f > d; ++d) {
            u[d] = new InterpolationPartBinding(c[d], r, l, e, s, a, this);
        }
    }
    P() {
        this.updateTarget();
    }
    updateTarget() {
        const t = this.partBindings;
        const e = this.ast.parts;
        const s = t.length;
        let i = "";
        let n = 0;
        if (s === 1) {
            i = e[0] + t[0].v + e[1];
        } else {
            i = e[0];
            for (;s > n; ++n) {
                i += t[n].v + e[n + 1];
            }
        }
        const r = this.q;
        const l = this.M.state !== Ee && (r.type & _) > 0;
        let h;
        if (l) {
            h = this.L;
            this.L = this.B.queueTask((() => {
                this.L = null;
                r.setValue(i, this.target, this.targetProperty);
            }), yt);
            h?.cancel();
            h = null;
        } else {
            r.setValue(i, this.target, this.targetProperty);
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
        const s = e.length;
        let i = 0;
        for (;s > i; ++i) {
            e[i].bind(t);
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
        let s = 0;
        for (;e > s; ++s) {
            t[s].unbind();
        }
        this.L?.cancel();
        this.L = null;
    }
    useAccessor(t) {
        this.q = t;
    }
}

class InterpolationPartBinding {
    constructor(t, e, s, i, n, r, l) {
        this.ast = t;
        this.target = e;
        this.targetProperty = s;
        this.strict = r;
        this.owner = l;
        this.mode = c;
        this.task = null;
        this.isBound = false;
        this.v = "";
        this.boundFn = false;
        this.l = i;
        this.oL = n;
    }
    updateTarget() {
        this.owner.P();
    }
    handleChange() {
        if (!this.isBound) {
            return;
        }
        this.obs.version++;
        const e = i.astEvaluate(this.ast, this.s, this, (this.mode & c) > 0 ? this : null);
        this.obs.clear();
        if (e != this.v) {
            this.v = e;
            if (t.isArray(e)) {
                this.observeCollection(e);
            }
            this.updateTarget();
        }
    }
    handleCollectionChange() {
        this.updateTarget();
    }
    bind(e) {
        if (this.isBound) {
            if (this.s === e) {
                return;
            }
            this.unbind();
        }
        this.s = e;
        i.astBind(this.ast, e, this);
        this.v = i.astEvaluate(this.ast, this.s, this, (this.mode & c) > 0 ? this : null);
        if (t.isArray(this.v)) {
            this.observeCollection(this.v);
        }
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        i.astUnbind(this.ast, this.s, this);
        this.s = void 0;
        this.obs.clearAll();
    }
}

InterpolationPartBinding.mix = xt((() => {
    dt(InterpolationPartBinding);
    gt(InterpolationPartBinding, (() => "updateTarget"));
    i.connectable(InterpolationPartBinding, null);
    pt(InterpolationPartBinding);
}));

const wt = {
    preempt: true
};

class ContentBinding {
    constructor(t, e, s, i, n, r, l, h) {
        this.p = n;
        this.ast = r;
        this.target = l;
        this.strict = h;
        this.isBound = false;
        this.mode = c;
        this.L = null;
        this.v = "";
        this.I = false;
        this.boundFn = false;
        this.l = e;
        this.M = t;
        this.oL = s;
        this.B = i;
    }
    updateTarget(t) {
        const e = this.target;
        const s = this.v;
        this.v = t;
        if (this.I) {
            s.parentNode?.removeChild(s);
            this.I = false;
        }
        if (t instanceof this.p.Node) {
            e.parentNode?.insertBefore(t, e);
            t = "";
            this.I = true;
        }
        e.textContent = y(t ?? "");
    }
    handleChange() {
        if (!this.isBound) {
            return;
        }
        this.obs.version++;
        const t = i.astEvaluate(this.ast, this.s, this, (this.mode & c) > 0 ? this : null);
        this.obs.clear();
        if (t === this.v) {
            this.L?.cancel();
            this.L = null;
            return;
        }
        const e = this.M.state !== Ee;
        if (e) {
            this._(t);
        } else {
            this.updateTarget(t);
        }
    }
    handleCollectionChange() {
        if (!this.isBound) {
            return;
        }
        this.obs.version++;
        const e = this.v = i.astEvaluate(this.ast, this.s, this, (this.mode & c) > 0 ? this : null);
        this.obs.clear();
        if (t.isArray(e)) {
            this.observeCollection(e);
        }
        const s = this.M.state !== Ee;
        if (s) {
            this._(e);
        } else {
            this.updateTarget(e);
        }
    }
    bind(e) {
        if (this.isBound) {
            if (this.s === e) {
                return;
            }
            this.unbind();
        }
        this.s = e;
        i.astBind(this.ast, e, this);
        const s = this.v = i.astEvaluate(this.ast, this.s, this, (this.mode & c) > 0 ? this : null);
        if (t.isArray(s)) {
            this.observeCollection(s);
        }
        this.updateTarget(s);
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        i.astUnbind(this.ast, this.s, this);
        if (this.I) {
            this.v.parentNode?.removeChild(this.v);
        }
        this.s = void 0;
        this.obs.clearAll();
        this.L?.cancel();
        this.L = null;
    }
    _(t) {
        const e = this.L;
        this.L = this.B.queueTask((() => {
            this.L = null;
            this.updateTarget(t);
        }), wt);
        e?.cancel();
    }
}

ContentBinding.mix = xt((() => {
    dt(ContentBinding);
    gt(ContentBinding, (() => "updateTarget"));
    i.connectable(ContentBinding, null);
    pt(ContentBinding);
}));

class LetBinding {
    constructor(t, e, s, i, n, r) {
        this.ast = s;
        this.targetProperty = i;
        this.isBound = false;
        this.s = void 0;
        this.target = null;
        this.boundFn = false;
        this.l = t;
        this.oL = e;
        this.strict = r;
        this.V = n;
    }
    updateTarget() {
        this.target[this.targetProperty] = this.v;
    }
    handleChange() {
        if (!this.isBound) {
            return;
        }
        this.obs.version++;
        this.v = i.astEvaluate(this.ast, this.s, this, this);
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
        this.target = this.V ? t.bindingContext : t.overrideContext;
        i.astBind(this.ast, t, this);
        this.v = i.astEvaluate(this.ast, this.s, this, this);
        this.updateTarget();
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        i.astUnbind(this.ast, this.s, this);
        this.s = void 0;
        this.obs.clearAll();
    }
}

LetBinding.mix = xt((() => {
    dt(LetBinding);
    gt(LetBinding, (() => "updateTarget"));
    i.connectable(LetBinding, null);
    pt(LetBinding);
}));

class PropertyBinding {
    constructor(t, e, s, i, n, r, l, h, a) {
        this.ast = n;
        this.target = r;
        this.targetProperty = l;
        this.mode = h;
        this.strict = a;
        this.isBound = false;
        this.s = void 0;
        this.q = void 0;
        this.L = null;
        this.F = null;
        this.boundFn = false;
        this.l = e;
        this.M = t;
        this.B = i;
        this.oL = s;
    }
    updateTarget(t) {
        this.q.setValue(t, this.target, this.targetProperty);
    }
    updateSource(t) {
        i.astAssign(this.ast, this.s, this, null, t);
    }
    handleChange() {
        if (!this.isBound) {
            return;
        }
        this.obs.version++;
        const t = i.astEvaluate(this.ast, this.s, this, (this.mode & c) > 0 ? this : null);
        this.obs.clear();
        const e = this.M.state !== Ee && (this.q.type & _) > 0;
        if (e) {
            bt = this.L;
            this.L = this.B.queueTask((() => {
                this.updateTarget(t);
                this.L = null;
            }), kt);
            bt?.cancel();
            bt = null;
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
        i.astBind(this.ast, t, this);
        const e = this.oL;
        const s = this.mode;
        let n = this.q;
        if (!n) {
            if (s & u) {
                n = e.getObserver(this.target, this.targetProperty);
            } else {
                n = e.getAccessor(this.target, this.targetProperty);
            }
            this.q = n;
        }
        const r = (s & c) > 0;
        if (s & (c | a)) {
            this.updateTarget(i.astEvaluate(this.ast, this.s, this, r ? this : null));
        }
        if (s & u) {
            n.subscribe(this.F ??= new BindingTargetSubscriber(this, this.l.get(mt)));
            if (!r) {
                this.updateSource(n.getValue(this.target, this.targetProperty));
            }
        }
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        i.astUnbind(this.ast, this.s, this);
        this.s = void 0;
        if (this.F) {
            this.q.unsubscribe(this.F);
            this.F = null;
        }
        this.L?.cancel();
        this.L = null;
        this.obs.clearAll();
    }
    useTargetObserver(t) {
        this.q?.unsubscribe(this);
        (this.q = t).subscribe(this);
    }
    useTargetSubscriber(t) {
        if (this.F != null) {
            throw createMappedError(9995);
        }
        this.F = t;
    }
}

PropertyBinding.mix = xt((() => {
    dt(PropertyBinding);
    gt(PropertyBinding, (t => t.mode & u ? "updateSource" : "updateTarget"));
    i.connectable(PropertyBinding, null);
    pt(PropertyBinding);
}));

let bt = null;

const kt = {
    preempt: true
};

class RefBinding {
    constructor(t, e, s, i, n) {
        this.oL = e;
        this.ast = s;
        this.target = i;
        this.strict = n;
        this.isBound = false;
        this.s = void 0;
        this.l = t;
    }
    updateSource() {
        if (this.isBound) {
            this.obs.version++;
            i.astAssign(this.ast, this.s, this, this, this.target);
            this.obs.clear();
        } else {
            i.astAssign(this.ast, this.s, this, null, null);
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
        i.astBind(this.ast, t, this);
        this.isBound = true;
        this.updateSource();
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        this.obs.clearAll();
        if (i.astEvaluate(this.ast, this.s, this, null) === this.target) {
            this.updateSource();
        }
        i.astUnbind(this.ast, this.s, this);
        this.s = void 0;
    }
}

RefBinding.mix = xt((() => {
    i.connectable(RefBinding, null);
    gt(RefBinding, (() => "updateSource"));
    dt(RefBinding);
    pt(RefBinding);
}));

class ListenerBindingOptions {
    constructor(t, e = false, s) {
        this.prevent = t;
        this.capture = e;
        this.onError = s;
    }
}

class ListenerBinding {
    constructor(t, e, s, i, n, r, l) {
        this.ast = e;
        this.target = s;
        this.targetEvent = i;
        this.strict = l;
        this.isBound = false;
        this.self = false;
        this.boundFn = true;
        this.H = null;
        this.l = t;
        this.O = n;
        this.H = r;
    }
    callSource(e) {
        const s = this.s.overrideContext;
        s.$event = e;
        let n = i.astEvaluate(this.ast, this.s, this, null);
        delete s.$event;
        if (t.isFunction(n)) {
            n = n(e);
        }
        if (n !== true && this.O.prevent) {
            e.preventDefault();
        }
    }
    handleEvent(t) {
        if (this.self) {
            if (this.target !== t.composedPath()[0]) {
                return;
            }
        }
        if (this.H?.(t) !== false) {
            try {
                this.callSource(t);
            } catch (e) {
                this.O.onError(t, e);
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
        i.astBind(this.ast, t, this);
        this.target.addEventListener(this.targetEvent, this, this.O);
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        i.astUnbind(this.ast, this.s, this);
        this.s = void 0;
        this.target.removeEventListener(this.targetEvent, this, this.O);
    }
}

ListenerBinding.mix = xt((function() {
    dt(ListenerBinding);
    gt(ListenerBinding, (() => "callSource"));
    pt(ListenerBinding);
}));

const Ct = /*@__PURE__*/ O("IEventModifier");

const Bt = /*@__PURE__*/ O("IKeyMapping", (t => t.instance({
    meta: k([ "ctrl", "alt", "shift", "meta" ]),
    keys: {
        escape: "Escape",
        enter: "Enter",
        space: "Space",
        tab: "tab",
        ...Array.from({
            length: 25
        }).reduce(((t, e, s) => {
            let i = String.fromCharCode(s + 65);
            t[s + 65] = i;
            i = String.fromCharCode(s + 97);
            t[s + 97] = t[i] = i;
            return t;
        }), {})
    }
})));

class ModifiedMouseEventHandler {
    constructor() {
        this.type = [ "click", "mousedown", "mousemove", "mouseup", "dblclick", "contextmenu" ];
        this.$ = t.resolve(Bt);
        this.N = [ "left", "middle", "right" ];
    }
    static register(t) {
        t.register($(Ct, ModifiedMouseEventHandler));
    }
    getHandler(t) {
        const e = t.split(/[:+.]/);
        return t => {
            let s = false;
            let i = false;
            let n;
            for (n of e) {
                switch (n) {
                  case "prevent":
                    s = true;
                    continue;

                  case "stop":
                    i = true;
                    continue;

                  case "left":
                  case "middle":
                  case "right":
                    if (t.button !== this.N.indexOf(n)) return false;
                    continue;
                }
                if (this.$.meta.includes(n) && t[`${n}Key`] !== true) {
                    return false;
                }
            }
            if (s) t.preventDefault();
            if (i) t.stopPropagation();
            return true;
        };
    }
}

class ModifiedKeyboardEventHandler {
    constructor() {
        this.$ = t.resolve(Bt);
        this.type = [ "keydown", "keyup" ];
    }
    static register(t) {
        t.register($(Ct, ModifiedKeyboardEventHandler));
    }
    getHandler(t) {
        const e = t.split(/[:+.]/);
        return t => {
            let s = false;
            let i = false;
            let n;
            for (n of e) {
                switch (n) {
                  case "prevent":
                    s = true;
                    continue;

                  case "stop":
                    i = true;
                    continue;
                }
                if (this.$.meta.includes(n)) {
                    if (t[`${n}Key`] !== true) {
                        return false;
                    }
                    continue;
                }
                const e = this.$.keys[n];
                if (e !== t.key) {
                    return false;
                }
            }
            if (s) t.preventDefault();
            if (i) t.stopPropagation();
            return true;
        };
    }
}

class ModifiedEventHandler {
    constructor() {
        this.type = [ "$ALL" ];
    }
    static register(t) {
        t.register($(Ct, ModifiedEventHandler));
    }
    getHandler(t) {
        const e = t.split(/[:+.]/);
        return t => {
            let s = false;
            let i = false;
            let n;
            for (n of e) {
                switch (n) {
                  case "prevent":
                    s = true;
                    continue;

                  case "stop":
                    i = true;
                    continue;
                }
            }
            if (s) t.preventDefault();
            if (i) t.stopPropagation();
            return true;
        };
    }
}

const St = /*@__PURE__*/ O("IEventModifierHandler", (t => t.instance({
    getHandler: () => null
})));

class EventModifier {
    constructor() {
        this.W = t.resolve(t.all(Ct)).reduce(((e, s) => {
            const i = t.isArray(s.type) ? s.type : [ s.type ];
            i.forEach((t => e[t] = s));
            return e;
        }), {});
    }
    static register(t) {
        t.register($(St, EventModifier));
    }
    getHandler(e, s) {
        return t.isString(s) ? (this.W[e] ?? this.W.$ALL)?.getHandler(s) ?? null : null;
    }
}

const At = {
    register(t) {
        t.register(EventModifier, ModifiedMouseEventHandler, ModifiedKeyboardEventHandler, ModifiedEventHandler);
    }
};

const Rt = /*@__PURE__*/ O("IViewFactory");

class ViewFactory {
    constructor(t, e) {
        this.isCaching = false;
        this.j = null;
        this.U = -1;
        this.name = e.name;
        this.container = t;
        this.def = e;
    }
    setCacheSize(e, s) {
        if (e) {
            if (e === "*") {
                e = ViewFactory.maxCacheSize;
            } else if (t.isString(e)) {
                e = parseInt(e, 10);
            }
            if (this.U === -1 || !s) {
                this.U = e;
            }
        }
        if (this.U > 0) {
            this.j = [];
        } else {
            this.j = null;
        }
        this.isCaching = this.U > 0;
    }
    canReturnToCache(t) {
        return this.j != null && this.j.length < this.U;
    }
    tryReturnToCache(t) {
        if (this.canReturnToCache(t)) {
            this.j.push(t);
            return true;
        }
        return false;
    }
    create(t) {
        const e = this.j;
        let s;
        if (e != null && e.length > 0) {
            s = e.pop();
            return s;
        }
        s = Controller.$view(this, t);
        return s;
    }
}

ViewFactory.maxCacheSize = 65535;

const Tt = /*@__PURE__*/ (() => {
    const createComment = (t, e) => t.document.createComment(e);
    return t => {
        const e = createComment(t, "au-end");
        e.$start = createComment(t, "au-start");
        return e;
    };
})();

const insertManyBefore = (t, e, s) => {
    if (t === null) {
        return;
    }
    const i = s.length;
    let n = 0;
    while (i > n) {
        t.insertBefore(s[n], e);
        ++n;
    }
};

const createMutationObserver = (t, e) => new t.ownerDocument.defaultView.MutationObserver(e);

const isElement = t => t.nodeType === 1;

const Et = "default";

const Lt = "au-slot";

const Mt = /*@__PURE__*/ O("IAuSlotsInfo");

class AuSlotsInfo {
    constructor(t) {
        this.projectedSlots = t;
    }
}

const qt = /*@__PURE__*/ O("IAuSlotWatcher");

class AuSlotWatcherBinding {
    constructor(e, s, i, n) {
        this.G = new Set;
        this.K = t.emptyArray;
        this.isBound = false;
        this.cb = (this.o = e)[s];
        this.slotName = i;
        this.X = n;
    }
    bind() {
        this.isBound = true;
    }
    unbind() {
        this.isBound = false;
    }
    getValue() {
        return this.K;
    }
    watch(t) {
        if (!this.G.has(t)) {
            this.G.add(t);
            t.subscribe(this);
        }
    }
    unwatch(t) {
        if (this.G.delete(t)) {
            t.unsubscribe(this);
        }
    }
    handleSlotChange(t, e) {
        if (!this.isBound) {
            return;
        }
        const s = this.K;
        const i = [];
        const n = this.X;
        let r;
        let l;
        for (r of this.G) {
            for (l of r === t ? e : r.nodes) {
                if (n === "$all" || isElement(l) && (n === "*" || l.matches(n))) {
                    i[i.length] = l;
                }
            }
        }
        if (i.length !== s.length || i.some(((t, e) => t !== s[e]))) {
            this.K = i;
            this.cb?.call(this.o, i);
            this.subs.notify(i, s);
        }
    }
    get() {
        throw createMappedError(99, "get");
    }
}

class SlottedLifecycleHooks {
    constructor(t) {
        this.Y = t;
    }
    register(t) {
        W(ht, this).register(t);
    }
    hydrating(t, e) {
        const s = this.Y;
        const i = new AuSlotWatcherBinding(t, s.callback ?? `${y(s.name)}Changed`, s.slotName ?? "default", s.query ?? "*");
        R(t, s.name, {
            enumerable: true,
            configurable: true,
            get: C((() => i.getValue()), {
                getObserver: () => i
            }),
            set: () => {}
        });
        W(qt, i).register(e.container);
        e.addBinding(i);
    }
}

function slotted(t, e) {
    if (!Dt) {
        Dt = true;
        i.subscriberCollection(AuSlotWatcherBinding, null);
        lifecycleHooks()(SlottedLifecycleHooks, null);
    }
    const s = x("dependencies");
    function decorator(i, n) {
        if (n.kind !== "field") throw createMappedError(9990);
        const r = typeof t === "object" ? t : {
            query: t,
            slotName: e,
            name: ""
        };
        r.name = n.name;
        const l = n.metadata[s] ??= [];
        l.push(new SlottedLifecycleHooks(r));
    }
    return decorator;
}

let Dt = false;

class SpreadBinding {
    static create(s, i, n, r, l, h, a, c) {
        const u = [];
        const f = r.renderers;
        const getHydrationContext = t => {
            let e = t;
            let i = s;
            while (i != null && e > 0) {
                i = i.parent;
                --e;
            }
            if (i == null) {
                throw createMappedError(9999);
            }
            return i;
        };
        const renderSpreadInstruction = s => {
            const r = getHydrationContext(s);
            const d = new SpreadBinding(r);
            const p = l.compileSpread(r.controller.definition, r.instruction?.captures ?? t.emptyArray, r.controller.container, i, n);
            let m;
            for (m of p) {
                switch (m.type) {
                  case e.InstructionType.spreadTransferedBinding:
                    renderSpreadInstruction(s + 1);
                    break;

                  case e.InstructionType.spreadElementProp:
                    f[m.instruction.type].render(d, findElementControllerFor(i), m.instruction, h, a, c);
                    break;

                  default:
                    f[m.type].render(d, i, m, h, a, c);
                }
            }
            u.push(d);
        };
        renderSpreadInstruction(0);
        return u;
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
        this.Z = [];
        this.locator = (this.$controller = (this.J = t).controller).container;
    }
    get(t) {
        return this.locator.get(t);
    }
    bind(t) {
        if (this.isBound) {
            return;
        }
        this.isBound = true;
        const e = this.scope = this.J.controller.scope.parent ?? void 0;
        if (e == null) {
            throw createMappedError(9999);
        }
        this.Z.forEach((t => t.bind(e)));
    }
    unbind() {
        this.Z.forEach((t => t.unbind()));
        this.isBound = false;
    }
    addBinding(t) {
        this.Z.push(t);
    }
    addChild(t) {
        if (t.vmKind !== Ae) {
            throw createMappedError(9998);
        }
        this.$controller.addChild(t);
    }
}

class SpreadValueBinding {
    constructor(t, e, s, i, n, r, l, h) {
        this.target = e;
        this.targetKeys = s;
        this.ast = i;
        this.strict = h;
        this.isBound = false;
        this.s = void 0;
        this.boundFn = false;
        this.tt = {};
        this.et = new WeakMap;
        this.M = t;
        this.oL = n;
        this.l = r;
        this.B = l;
    }
    updateTarget() {
        this.obs.version++;
        const t = i.astEvaluate(this.ast, this.s, this, this);
        this.obs.clear();
        this.st(t, true);
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
        i.astBind(this.ast, t, this);
        const e = i.astEvaluate(this.ast, t, this, this);
        this.st(e, false);
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        i.astUnbind(this.ast, this.s, this);
        this.s = void 0;
        let t;
        for (t in this.tt) {
            this.tt[t].unbind();
        }
    }
    st(s, n) {
        let l;
        if (!t.isObject(s)) {
            for (l in this.tt) {
                this.tt[l]?.unbind();
            }
            return;
        }
        let h;
        let a = this.et.get(s);
        if (a == null) {
            this.et.set(s, a = i.Scope.fromParent(this.s, s));
        }
        for (l of this.targetKeys) {
            h = this.tt[l];
            if (l in s) {
                if (h == null) {
                    h = this.tt[l] = new PropertyBinding(this.M, this.l, this.oL, this.B, SpreadValueBinding.it[l] ??= new r.AccessScopeExpression(l, 0), this.target, l, e.BindingMode.toView, this.strict);
                }
                h.bind(a);
            } else if (n) {
                h?.unbind();
            }
        }
    }
}

SpreadValueBinding.mix = xt((() => {
    dt(SpreadValueBinding);
    gt(SpreadValueBinding, (() => "updateTarget"));
    i.connectable(SpreadValueBinding, null);
    pt(SpreadValueBinding);
}));

SpreadValueBinding.it = {};

const addListener = (t, e, s, i) => {
    t.addEventListener(e, s, i);
};

const removeListener = (t, e, s, i) => {
    t.removeEventListener(e, s, i);
};

const mixinNodeObserverUseConfig = t => {
    let e;
    const s = t.prototype;
    defineHiddenProp(s, "subscribe", (function(t) {
        if (this.subs.add(t) && this.subs.count === 1) {
            for (e of this.cf.events) {
                addListener(this.nt, e, this);
            }
            this.ot = true;
            this.rt?.();
        }
    }));
    defineHiddenProp(s, "unsubscribe", (function(t) {
        if (this.subs.remove(t) && this.subs.count === 0) {
            for (e of this.cf.events) {
                removeListener(this.nt, e, this);
            }
            this.ot = false;
            this.lt?.();
        }
    }));
    defineHiddenProp(s, "useConfig", (function(t) {
        this.cf = t;
        if (this.ot) {
            for (e of this.cf.events) {
                removeListener(this.nt, e, this);
            }
            for (e of this.cf.events) {
                addListener(this.nt, e, this);
            }
        }
    }));
};

const mixinNoopSubscribable = e => {
    defineHiddenProp(e.prototype, "subscribe", t.noop);
    defineHiddenProp(e.prototype, "unsubscribe", t.noop);
};

class ClassAttributeAccessor {
    get doNotCache() {
        return true;
    }
    constructor(t, e = {}) {
        this.obj = t;
        this.mapping = e;
        this.type = I | _;
        this.v = "";
        this.ht = {};
        this.ct = 0;
    }
    getValue() {
        return this.v;
    }
    setValue(t) {
        if (t !== this.v) {
            this.v = t;
            this.ut();
        }
    }
    ut() {
        const t = this.ht;
        const e = ++this.ct;
        const s = this.obj.classList;
        const i = getClassesToAdd(this.v);
        const n = i.length;
        let r = 0;
        let l;
        if (n > 0) {
            for (;r < n; r++) {
                l = i[r];
                l = this.mapping[l] || l;
                if (l.length === 0) {
                    continue;
                }
                t[l] = this.ct;
                s.add(l);
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
            s.remove(l);
        }
    }
}

(() => {
    mixinNoopSubscribable(ClassAttributeAccessor);
})();

function getClassesToAdd(e) {
    if (t.isString(e)) {
        return splitClassString(e);
    }
    if (typeof e !== "object") {
        return t.emptyArray;
    }
    if (t.isArray(e)) {
        const s = e.length;
        if (s > 0) {
            const t = [];
            let i = 0;
            for (;s > i; ++i) {
                t.push(...getClassesToAdd(e[i]));
            }
            return t;
        } else {
            return t.emptyArray;
        }
    }
    const s = [];
    let i;
    for (i in e) {
        if (Boolean(e[i])) {
            if (i.includes(" ")) {
                s.push(...splitClassString(i));
            } else {
                s.push(i);
            }
        }
    }
    return s;
}

function splitClassString(e) {
    const s = e.match(/\S+/g);
    if (s === null) {
        return t.emptyArray;
    }
    return s;
}

const fromHydrationContext = e => ({
    $isResolver: true,
    resolve(s, i) {
        return i.get(Ve).controller.container.get(t.own(e));
    }
});

const Pt = /*@__PURE__*/ O("IRenderer");

function renderer(e, s) {
    const i = s?.metadata ?? (e[Symbol.metadata] ??= Object.create(null));
    i[t.registrableMetadataKey] = {
        register(t) {
            $(Pt, e).register(t);
        }
    };
    return e;
}

function ensureExpression(e, s, i) {
    if (t.isString(s)) {
        return e.parse(s, i);
    }
    return s;
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
            const s = findAttributeControllerFor(t, e);
            if (s !== void 0) {
                return s.viewModel;
            }
            const i = findElementControllerFor(t, {
                name: e
            });
            if (i === void 0) {
                throw createMappedError(751, e);
            }
            return i.viewModel;
        }
    }
}

const It = /*@__PURE__*/ renderer(class SetPropertyRenderer {
    constructor() {
        this.target = e.InstructionType.setProperty;
    }
    render(t, e, s) {
        const i = getTarget(e);
        if (i.$observers?.[s.to] !== void 0) {
            i.$observers[s.to].setValue(s.value);
        } else {
            i[s.to] = s.value;
        }
    }
}, null);

const _t = /*@__PURE__*/ renderer(class CustomElementRenderer {
    constructor() {
        this.r = t.resolve(le);
        this.target = e.InstructionType.hydrateElement;
    }
    render(t, e, s, i, n, r) {
        let l;
        let h;
        let a;
        const c = s.res;
        const u = s.projections;
        const f = t.container;
        switch (typeof c) {
          case "string":
            l = es.find(f, c);
            if (l == null) {
                throw createMappedError(752, s, t);
            }
            break;

          default:
            l = c;
        }
        const d = s.containerless || l.containerless;
        const p = d ? convertToRenderLocation(e) : null;
        const m = createElementContainer(i, t, e, s, p, u == null ? void 0 : new AuSlotsInfo(S(u)));
        h = m.invoke(l.Type);
        a = Controller.$el(m, h, e, s, l, p);
        const g = this.r.renderers;
        const x = s.props;
        const v = x.length;
        let y = 0;
        let w;
        while (v > y) {
            w = x[y];
            g[w.type].render(t, a, w, i, n, r);
            ++y;
        }
        t.addChild(a);
    }
}, null);

const Vt = /*@__PURE__*/ renderer(class CustomAttributeRenderer {
    constructor() {
        this.r = t.resolve(le);
        this.target = e.InstructionType.hydrateAttribute;
    }
    render(t, e, s, i, n, r) {
        let l = t.container;
        let h;
        switch (typeof s.res) {
          case "string":
            h = lt.find(l, s.res);
            if (h == null) {
                throw createMappedError(753, s, t);
            }
            break;

          default:
            h = s.res;
        }
        const a = invokeAttribute(i, h, t, e, s, void 0, void 0);
        const c = Controller.$attr(a.ctn, a.vm, e, h);
        setRef(e, h.key, c);
        const u = this.r.renderers;
        const f = s.props;
        const d = f.length;
        let p = 0;
        let m;
        while (d > p) {
            m = f[p];
            u[m.type].render(t, c, m, i, n, r);
            ++p;
        }
        t.addChild(c);
    }
}, null);

const Ft = /*@__PURE__*/ renderer(class TemplateControllerRenderer {
    constructor() {
        this.r = t.resolve(le);
        this.target = e.InstructionType.hydrateTemplateController;
    }
    render(t, e, s, i, n, r) {
        let l = t.container;
        let h;
        switch (typeof s.res) {
          case "string":
            h = lt.find(l, s.res);
            if (h == null) {
                throw createMappedError(754, s, t);
            }
            break;

          default:
            h = s.res;
        }
        const a = this.r.getViewFactory(s.def, h.containerStrategy === "new" ? l.createChild({
            inheritParentResources: true
        }) : l);
        const c = convertToRenderLocation(e);
        const u = invokeAttribute(i, h, t, e, s, a, c);
        const f = Controller.$attr(u.ctn, u.vm, e, h);
        setRef(c, h.key, f);
        u.vm.link?.(t, f, e, s);
        const d = this.r.renderers;
        const p = s.props;
        const m = p.length;
        let g = 0;
        let x;
        while (m > g) {
            x = p[g];
            d[x.type].render(t, f, x, i, n, r);
            ++g;
        }
        t.addChild(f);
    }
}, null);

const Ht = /*@__PURE__*/ renderer(class LetElementRenderer {
    constructor() {
        this.target = e.InstructionType.hydrateLetElement;
        LetBinding.mix();
    }
    render(t, e, s, i, n, r) {
        e.remove();
        const l = s.instructions;
        const h = s.toBindingContext;
        const a = t.container;
        const c = l.length;
        let u;
        let f;
        let d = 0;
        while (c > d) {
            u = l[d];
            f = ensureExpression(n, u.from, M);
            t.addBinding(new LetBinding(a, r, f, u.to, h, t.strict ?? false));
            ++d;
        }
    }
}, null);

const Ot = /*@__PURE__*/ renderer(class RefBindingRenderer {
    constructor() {
        this.target = e.InstructionType.refBinding;
        RefBinding.mix();
    }
    render(t, e, s, i, n, r) {
        t.addBinding(new RefBinding(t.container, r, ensureExpression(n, s.from, M), getRefTarget(e, s.to), t.strict ?? false));
    }
}, null);

const $t = /*@__PURE__*/ renderer(class InterpolationBindingRenderer {
    constructor() {
        this.target = e.InstructionType.interpolation;
        InterpolationPartBinding.mix();
    }
    render(t, e, s, i, n, r) {
        const l = t.container;
        const h = new InterpolationBinding(t, l, r, i.domQueue, ensureExpression(n, s.from, T), getTarget(e), s.to, c, t.strict ?? false);
        if (s.to === "class" && h.target.nodeType > 0) {
            const t = l.get(fromHydrationContext(je));
            h.useAccessor(new ClassAttributeAccessor(h.target, t));
        }
        t.addBinding(h);
    }
}, null);

const Nt = /*@__PURE__*/ renderer(class PropertyBindingRenderer {
    constructor() {
        this.target = e.InstructionType.propertyBinding;
        PropertyBinding.mix();
    }
    render(t, e, s, i, n, r) {
        const l = t.container;
        const h = new PropertyBinding(t, l, r, i.domQueue, ensureExpression(n, s.from, M), getTarget(e), s.to, s.mode, t.strict ?? false);
        if (s.to === "class" && h.target.nodeType > 0) {
            const t = l.get(fromHydrationContext(je));
            h.useTargetObserver(new ClassAttributeAccessor(h.target, t));
        }
        t.addBinding(h);
    }
}, null);

const Wt = /*@__PURE__*/ renderer(class IteratorBindingRenderer {
    constructor() {
        this.target = e.InstructionType.iteratorBinding;
        PropertyBinding.mix();
    }
    render(t, e, s, i, n, r) {
        t.addBinding(new PropertyBinding(t, t.container, r, i.domQueue, ensureExpression(n, s.forOf, E), getTarget(e), s.to, c, t.strict ?? false));
    }
}, null);

const jt = /*@__PURE__*/ renderer(class TextBindingRenderer {
    constructor() {
        this.target = e.InstructionType.textBinding;
        ContentBinding.mix();
    }
    render(t, e, s, i, n, r) {
        t.addBinding(new ContentBinding(t, t.container, r, i.domQueue, i, ensureExpression(n, s.from, M), e, t.strict ?? false));
    }
}, null);

const zt = O("IListenerBindingOptions", (e => e.singleton(class {
    constructor() {
        this.p = t.resolve(it);
        this.prevent = false;
        this.onError = (t, e) => {
            const s = new this.p.CustomEvent("au-event-error", {
                cancelable: true,
                detail: {
                    event: t,
                    error: e
                }
            });
            this.p.window.dispatchEvent(s);
            if (s.defaultPrevented) {
                return;
            }
            throw e;
        };
    }
})));

const Ut = /*@__PURE__*/ renderer(class ListenerBindingRenderer {
    constructor() {
        this.target = e.InstructionType.listenerBinding;
        this.ft = t.resolve(St);
        this.dt = t.resolve(zt);
        ListenerBinding.mix();
    }
    render(t, e, s, i, n) {
        t.addBinding(new ListenerBinding(t.container, ensureExpression(n, s.from, L), e, s.to, new ListenerBindingOptions(this.dt.prevent, s.capture, this.dt.onError), this.ft.getHandler(s.to, s.modifier), t.strict ?? false));
    }
}, null);

const Gt = /*@__PURE__*/ renderer(class SetAttributeRenderer {
    constructor() {
        this.target = e.InstructionType.setAttribute;
    }
    render(t, e, s) {
        e.setAttribute(s.to, s.value);
    }
}, null);

const Kt = /*@__PURE__*/ renderer(class SetClassAttributeRenderer {
    constructor() {
        this.target = e.InstructionType.setClassAttribute;
    }
    render(t, e, s) {
        addClasses(e.classList, s.value);
    }
}, null);

const Xt = /*@__PURE__*/ renderer(class SetStyleAttributeRenderer {
    constructor() {
        this.target = e.InstructionType.setStyleAttribute;
    }
    render(t, e, s) {
        e.style.cssText += s.value;
    }
}, null);

const Qt = /*@__PURE__*/ renderer(class StylePropertyBindingRenderer {
    constructor() {
        this.target = e.InstructionType.stylePropertyBinding;
        PropertyBinding.mix();
    }
    render(t, e, s, i, n, r) {
        t.addBinding(new PropertyBinding(t, t.container, r, i.domQueue, ensureExpression(n, s.from, M), e.style, s.to, c, t.strict ?? false));
    }
}, null);

const Yt = /*@__PURE__*/ renderer(class AttributeBindingRenderer {
    constructor() {
        this.target = e.InstructionType.attributeBinding;
        AttributeBinding.mix();
    }
    render(t, e, s, i, n, r) {
        const l = t.container;
        const h = l.has(je, false) ? l.get(je) : null;
        t.addBinding(new AttributeBinding(t, l, r, i.domQueue, ensureExpression(n, s.from, M), e, s.attr, h == null ? s.to : s.to.split(/\s/g).map((t => h[t] ?? t)).join(" "), c, t.strict ?? false));
    }
}, null);

const Zt = /*@__PURE__*/ renderer(class SpreadRenderer {
    constructor() {
        this.gt = t.resolve(e.ITemplateCompiler);
        this.r = t.resolve(le);
        this.target = e.InstructionType.spreadTransferedBinding;
    }
    render(t, e, s, i, n, r) {
        SpreadBinding.create(t.container.get(Ve), e, void 0, this.r, this.gt, i, n, r).forEach((e => t.addBinding(e)));
    }
}, null);

const Jt = /*@__PURE__*/ renderer(class SpreadValueRenderer {
    constructor() {
        this.target = e.InstructionType.spreadValueBinding;
        SpreadValueBinding.mix();
    }
    render(t, e, s, i, n, r) {
        const l = s.target;
        if (l === "$bindables") {
            t.addBinding(new SpreadValueBinding(t, e.viewModel, S(e.definition.bindables), n.parse(s.from, M), r, t.container, i.domQueue, t.strict ?? false));
        } else {
            throw createMappedError(820, l);
        }
    }
}, null);

function addClasses(t, e) {
    const s = e.length;
    let i = 0;
    for (let n = 0; n < s; ++n) {
        if (e.charCodeAt(n) === 32) {
            if (n !== i) {
                t.add(e.slice(i, n));
            }
            i = n + 1;
        } else if (n + 1 === s) {
            t.add(e.slice(i));
        }
    }
}

const te = "IController";

const ee = "IInstruction";

const se = "IRenderLocation";

const ie = "ISlotsInfo";

function createElementContainer(s, i, n, r, l, h) {
    const a = i.container.createChild();
    registerHostNode(a, n, s);
    registerResolver(a, _e, new t.InstanceProvider(te, i));
    registerResolver(a, e.IInstruction, new t.InstanceProvider(ee, r));
    registerResolver(a, We, l == null ? ne : new RenderLocationProvider(l));
    registerResolver(a, Rt, oe);
    registerResolver(a, Mt, h == null ? re : new t.InstanceProvider(ie, h));
    return a;
}

class ViewFactoryProvider {
    get $isResolver() {
        return true;
    }
    constructor(t) {
        this.f = t;
    }
    resolve() {
        const e = this.f;
        if (e === null) {
            throw createMappedError(755);
        }
        if (!t.isString(e.name) || e.name.length === 0) {
            throw createMappedError(756);
        }
        return e;
    }
}

function invokeAttribute(s, i, n, r, l, h, a, c) {
    const u = n instanceof Controller ? n : n.$controller;
    const f = u.container.createChild();
    registerHostNode(f, r, s);
    registerResolver(f, _e, new t.InstanceProvider(te, u));
    registerResolver(f, e.IInstruction, new t.InstanceProvider(ee, l));
    registerResolver(f, We, a == null ? ne : new t.InstanceProvider(se, a));
    registerResolver(f, Rt, h == null ? oe : new ViewFactoryProvider(h));
    registerResolver(f, Mt, re);
    return {
        vm: f.invoke(i.Type),
        ctn: f
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

const ne = new RenderLocationProvider(null);

const oe = new ViewFactoryProvider(null);

const re = new t.InstanceProvider(ie, new AuSlotsInfo(t.emptyArray));

const le = /*@__PURE__*/ O("IRendering", (t => t.singleton(Rendering)));

class Rendering {
    get renderers() {
        return this.xt ??= this.vt.getAll(Pt, false).reduce(((t, e) => {
            t[e.target] ??= e;
            return t;
        }), t.createLookup());
    }
    constructor() {
        this.yt = new WeakMap;
        this.wt = new WeakMap;
        const e = this.vt = t.resolve(t.IContainer).root;
        const s = this.p = e.get(it);
        this.ep = e.get(r.IExpressionParser);
        this.oL = e.get(i.IObserverLocator);
        this.bt = s.document.createElement("au-m");
        this.kt = new FragmentNodeSequence(s, s.document.createDocumentFragment());
    }
    compile(t, s) {
        const i = s.get(e.ITemplateCompiler);
        const n = this.yt;
        let r = n.get(t);
        if (r == null) {
            n.set(t, r = CustomElementDefinition.create(t.needsCompile ? i.compile(t, s) : t));
        }
        return r;
    }
    getViewFactory(t, e) {
        return new ViewFactory(e, CustomElementDefinition.getOrCreate(t));
    }
    createNodes(e) {
        if (e.enhance === true) {
            return new FragmentNodeSequence(this.p, this.Ct(e.template));
        }
        let s;
        let i = false;
        const n = this.wt;
        const r = this.p;
        const l = r.document;
        if (n.has(e)) {
            s = n.get(e);
        } else {
            const h = e.template;
            let a;
            if (h == null) {
                s = null;
            } else if (h instanceof r.Node) {
                if (h.nodeName === "TEMPLATE") {
                    s = h.content;
                    i = true;
                } else {
                    (s = l.createDocumentFragment()).appendChild(h.cloneNode(true));
                }
            } else {
                a = l.createElement("template");
                if (t.isString(h)) {
                    a.innerHTML = h;
                }
                s = a.content;
                i = true;
            }
            this.Ct(s);
            n.set(e, s);
        }
        return s == null ? this.kt : new FragmentNodeSequence(this.p, i ? l.importNode(s, true) : l.adoptNode(s.cloneNode(true)));
    }
    render(t, e, s, i) {
        const n = s.instructions;
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
        if (i != null) {
            u = s.surrogates;
            if ((c = u.length) > 0) {
                a = 0;
                while (c > a) {
                    f = u[a];
                    r[f.type].render(t, i, f, this.p, this.ep, this.oL);
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
    Ct(t) {
        if (t == null) {
            return null;
        }
        const e = this.p.document.createTreeWalker(t, 128);
        let s;
        while ((s = e.nextNode()) != null) {
            if (s.nodeValue === "au*") {
                s.parentNode.replaceChild(e.currentNode = this.bt.cloneNode(), s);
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
    register(s) {
        let i = s.get(t.own(je));
        if (i == null) {
            s.register(W(je, i = t.createLookup()));
        }
        {
            C(i, ...this.modules);
        }
        class CompilingHook {
            compiling(e) {
                const s = e.tagName === "TEMPLATE";
                const n = s ? e.content : e;
                const r = [ e, ...t.toArray(n.querySelectorAll("[class]")) ];
                for (const t of r) {
                    const e = t.getAttributeNode("class");
                    if (e == null) {
                        continue;
                    }
                    const s = e.value.split(/\s+/g).map((t => i[t] || t)).join(" ");
                    e.value = s;
                }
            }
        }
        s.register(e.TemplateCompilerHooks.define(CompilingHook));
    }
}

function shadowCSS(...t) {
    return new ShadowDOMRegistry(t);
}

const he = /*@__PURE__*/ O("IShadowDOMStyleFactory", (t => t.cachedCallback((t => {
    if (AdoptedStyleSheetsStyles.supported(t.get(it))) {
        return t.get(AdoptedStyleSheetsStylesFactory);
    }
    return t.get(StyleElementStylesFactory);
}))));

class ShadowDOMRegistry {
    constructor(t) {
        this.css = t;
    }
    register(t) {
        const e = t.get(ce);
        const s = t.get(he);
        t.register(W(ae, s.createStyles(this.css, e)));
    }
}

class AdoptedStyleSheetsStylesFactory {
    constructor() {
        this.p = t.resolve(it);
        this.cache = new Map;
    }
    createStyles(t, e) {
        return new AdoptedStyleSheetsStyles(this.p, t, this.cache, e);
    }
}

class StyleElementStylesFactory {
    constructor() {
        this.p = t.resolve(it);
    }
    createStyles(t, e) {
        return new StyleElementStyles(this.p, t, e);
    }
}

const ae = /*@__PURE__*/ O("IShadowDOMStyles");

const ce = /*@__PURE__*/ O("IShadowDOMGlobalStyles", (e => e.instance({
    applyTo: t.noop
})));

class AdoptedStyleSheetsStyles {
    constructor(t, e, s, i = null) {
        this.sharedStyles = i;
        this.styleSheets = e.map((e => {
            let i;
            if (e instanceof t.CSSStyleSheet) {
                i = e;
            } else {
                i = s.get(e);
                if (i === void 0) {
                    i = new t.CSSStyleSheet;
                    i.replaceSync(e);
                    s.set(e, i);
                }
            }
            return i;
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
    constructor(t, e, s = null) {
        this.p = t;
        this.localStyles = e;
        this.sharedStyles = s;
    }
    applyTo(t) {
        const e = this.localStyles;
        const s = this.p;
        for (let i = e.length - 1; i > -1; --i) {
            const n = s.document.createElement("style");
            n.innerHTML = e[i];
            t.prepend(n);
        }
        if (this.sharedStyles !== null) {
            this.sharedStyles.applyTo(t);
        }
    }
}

const ue = {
    shadowDOM(e) {
        return st.creating(t.IContainer, (t => {
            if (e.sharedStyles != null) {
                const s = t.get(he);
                t.register(W(ce, s.createStyles(e.sharedStyles, null)));
            }
        }));
    }
};

const {enter: fe, exit: de} = i.ConnectableSwitcher;

const {wrap: pe, unwrap: me} = i.ProxyObservable;

class ComputedWatcher {
    get value() {
        return this.v;
    }
    constructor(t, e, s, i, n) {
        this.obj = t;
        this.$get = s;
        this.useProxy = n;
        this.isBound = false;
        this.running = false;
        this.v = void 0;
        this.cb = i;
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
        const e = this.obj;
        const s = this.v;
        const i = this.compute();
        if (!t.areEqual(i, s)) {
            this.cb.call(e, i, s, e);
        }
    }
    compute() {
        this.running = true;
        this.obs.version++;
        try {
            fe(this);
            return this.v = me(this.$get.call(void 0, this.useProxy ? pe(this.obj) : this.obj, this));
        } finally {
            this.obs.clear();
            this.running = false;
            de(this);
        }
    }
}

(() => {
    i.connectable(ComputedWatcher, null);
})();

class ExpressionWatcher {
    get value() {
        return this.v;
    }
    constructor(t, e, s, i, n) {
        this.scope = t;
        this.l = e;
        this.oL = s;
        this.isBound = false;
        this.boundFn = false;
        this.obj = t.bindingContext;
        this.Bt = i;
        this.cb = n;
    }
    handleChange(e) {
        const s = this.Bt;
        const n = this.obj;
        const r = this.v;
        const l = s.$kind === "AccessScope" && this.obs.count === 1;
        if (!l) {
            this.obs.version++;
            e = i.astEvaluate(s, this.scope, this, this);
            this.obs.clear();
        }
        if (!t.areEqual(e, r)) {
            this.v = e;
            this.cb.call(n, e, r, n);
        }
    }
    bind() {
        if (this.isBound) {
            return;
        }
        this.obs.version++;
        this.v = i.astEvaluate(this.Bt, this.scope, this, this);
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
    i.connectable(ExpressionWatcher, null);
    pt(ExpressionWatcher);
})();

class Controller {
    get lifecycleHooks() {
        return this.St;
    }
    get isActive() {
        return (this.state & (Ee | Le)) > 0 && (this.state & Me) === 0;
    }
    get name() {
        if (this.parent === null) {
            switch (this.vmKind) {
              case Ae:
                return `[${this.definition.name}]`;

              case Se:
                return this.definition.name;

              case Re:
                return this.viewFactory.name;
            }
        }
        switch (this.vmKind) {
          case Ae:
            return `${this.parent.name}>[${this.definition.name}]`;

          case Se:
            return `${this.parent.name}>${this.definition.name}`;

          case Re:
            return this.viewFactory.name === this.parent.definition?.name ? `${this.parent.name}[view]` : `${this.parent.name}[view:${this.viewFactory.name}]`;
        }
    }
    get viewModel() {
        return this.At;
    }
    set viewModel(t) {
        this.At = t;
        this.Rt = t == null || this.vmKind === Re ? HooksDefinition.none : new HooksDefinition(t);
    }
    get strict() {
        return this.definition?.strict;
    }
    constructor(t, e, s, i, n, r, l) {
        this.container = t;
        this.vmKind = e;
        this.definition = s;
        this.viewFactory = i;
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
        this.Tt = false;
        this.mountTarget = xe;
        this.shadowRoot = null;
        this.nodes = null;
        this.location = null;
        this.St = null;
        this.state = Te;
        this.Et = false;
        this.$initiator = null;
        this.$resolve = void 0;
        this.$reject = void 0;
        this.$promise = void 0;
        this.Lt = 0;
        this.Mt = 0;
        this.qt = 0;
        this.At = n;
        this.Rt = e === Re ? HooksDefinition.none : new HooksDefinition(n);
        this.location = l;
        this.r = t.root.get(le);
        this.coercion = e === Re ? void 0 : t.get(ke);
    }
    static getCached(t) {
        return ge.get(t);
    }
    static getCachedOrThrow(t) {
        const e = Controller.getCached(t);
        if (e === void 0) {
            throw createMappedError(500, t);
        }
        return e;
    }
    static $el(e, s, i, n, r = void 0, l = null) {
        if (ge.has(s)) {
            return ge.get(s);
        }
        {
            r = r ?? getElementDefinition(s.constructor);
        }
        registerResolver(e, r.Type, new t.InstanceProvider(r.key, s, r.Type));
        const h = new Controller(e, Se, r, null, s, i, l);
        const a = e.get(t.optional(Ve));
        if (r.dependencies.length > 0) {
            e.register(...r.dependencies);
        }
        registerResolver(e, Ve, new t.InstanceProvider("IHydrationContext", new HydrationContext(h, n, a)));
        ge.set(s, h);
        if (n == null || n.hydrate !== false) {
            h.hE(n);
        }
        return h;
    }
    static $attr(e, s, i, n) {
        if (ge.has(s)) {
            return ge.get(s);
        }
        n = n ?? getAttributeDefinition(s.constructor);
        registerResolver(e, n.Type, new t.InstanceProvider(n.key, s, n.Type));
        const r = new Controller(e, Ae, n, null, s, i, null);
        if (n.dependencies.length > 0) {
            e.register(...n.dependencies);
        }
        ge.set(s, r);
        r.Dt();
        return r;
    }
    static $view(t, e = void 0) {
        const s = new Controller(t.container, Re, null, t, null, null, null);
        s.parent = e ?? null;
        s.Pt();
        return s;
    }
    hE(e) {
        const s = this.container;
        const n = this.At;
        const r = this.definition;
        this.scope = i.Scope.create(n, null, true);
        if (r.watches.length > 0) {
            createWatchers(this, s, r, n);
        }
        createObservers(this, r, n);
        this.St = at.resolve(s);
        s.register(r.Type);
        if (r.injectable !== null) {
            registerResolver(s, r.injectable, new t.InstanceProvider("definition.injectable", n));
        }
        if (e == null || e.hydrate !== false) {
            this.hS();
            this.hC();
        }
    }
    hS() {
        if (this.St.hydrating != null) {
            this.St.hydrating.forEach(callHydratingHook, this);
        }
        if (this.Rt.It) {
            this.At.hydrating(this);
        }
        const t = this.definition;
        const e = this._t = this.r.compile(t, this.container);
        const s = e.shadowOptions;
        const i = e.hasSlots;
        const n = e.containerless;
        const r = this.host;
        let l = this.location;
        if (n && l == null) {
            l = this.location = convertToRenderLocation(r);
        }
        setRef(r, Ze, this);
        setRef(r, t.key, this);
        if (s !== null || i) {
            if (l != null) {
                throw createMappedError(501);
            }
            setRef(this.shadowRoot = r.attachShadow(s ?? Be), Ze, this);
            setRef(this.shadowRoot, t.key, this);
            this.mountTarget = ye;
        } else if (l != null) {
            if (r !== l) {
                setRef(l, Ze, this);
                setRef(l, t.key, this);
            }
            this.mountTarget = we;
        } else {
            this.mountTarget = ve;
        }
        this.At.$controller = this;
        this.nodes = this.r.createNodes(e);
        if (this.St.hydrated !== void 0) {
            this.St.hydrated.forEach(callHydratedHook, this);
        }
        if (this.Rt.Vt) {
            this.At.hydrated(this);
        }
    }
    hC() {
        this.r.render(this, this.nodes.findTargets(), this._t, this.host);
        if (this.St.created !== void 0) {
            this.St.created.forEach(callCreatedHook, this);
        }
        if (this.Rt.Ft) {
            this.At.created(this);
        }
    }
    Dt() {
        const t = this.definition;
        const e = this.At;
        if (t.watches.length > 0) {
            createWatchers(this, this.container, t, e);
        }
        createObservers(this, t, e);
        e.$controller = this;
        this.St = at.resolve(this.container);
        if (this.St.created !== void 0) {
            this.St.created.forEach(callCreatedHook, this);
        }
        if (this.Rt.Ft) {
            this.At.created(this);
        }
    }
    Pt() {
        this._t = this.r.compile(this.viewFactory.def, this.container);
        this.r.render(this, (this.nodes = this.r.createNodes(this._t)).findTargets(), this._t, void 0);
    }
    activate(e, s, i) {
        switch (this.state) {
          case Te:
          case qe:
            if (!(s === null || s.isActive)) {
                return;
            }
            this.state = Ee;
            break;

          case Le:
            return;

          case Pe:
            throw createMappedError(502, this.name);

          default:
            throw createMappedError(503, this.name, stringifyState(this.state));
        }
        this.parent = s;
        switch (this.vmKind) {
          case Se:
            this.scope.parent = i ?? null;
            break;

          case Ae:
            this.scope = i ?? null;
            break;

          case Re:
            if (i === void 0 || i === null) {
                throw createMappedError(504, this.name);
            }
            if (!this.hasLockedScope) {
                this.scope = i;
            }
            break;
        }
        this.$initiator = e;
        this.Ht();
        let n = void 0;
        if (this.vmKind !== Re && this.St.binding != null) {
            n = t.onResolveAll(...this.St.binding.map(callBindingHook, this));
        }
        if (this.Rt.Ot) {
            n = t.onResolveAll(n, this.At.binding(this.$initiator, this.parent));
        }
        if (t.isPromise(n)) {
            this.$t();
            n.then((() => {
                this.Tt = true;
                if (this.state !== Ee) {
                    this.Nt();
                } else {
                    this.bind();
                }
            })).catch((t => {
                this.Wt(t);
            }));
            return this.$promise;
        }
        this.Tt = true;
        this.bind();
        return this.$promise;
    }
    bind() {
        let e = 0;
        let s = 0;
        let i = void 0;
        if (this.bindings !== null) {
            e = 0;
            s = this.bindings.length;
            while (s > e) {
                this.bindings[e].bind(this.scope);
                ++e;
            }
        }
        if (this.vmKind !== Re && this.St.bound != null) {
            i = t.onResolveAll(...this.St.bound.map(callBoundHook, this));
        }
        if (this.Rt.jt) {
            i = t.onResolveAll(i, this.At.bound(this.$initiator, this.parent));
        }
        if (t.isPromise(i)) {
            this.$t();
            i.then((() => {
                this.isBound = true;
                if (this.state !== Ee) {
                    this.Nt();
                } else {
                    this.zt();
                }
            })).catch((t => {
                this.Wt(t);
            }));
            return;
        }
        this.isBound = true;
        this.zt();
    }
    Ut(...t) {
        switch (this.mountTarget) {
          case ve:
            this.host.append(...t);
            break;

          case ye:
            this.shadowRoot.append(...t);
            break;

          case we:
            {
                let e = 0;
                for (;e < t.length; ++e) {
                    this.location.parentNode.insertBefore(t[e], this.location);
                }
                break;
            }
        }
    }
    zt() {
        switch (this.mountTarget) {
          case ve:
            this.nodes.appendTo(this.host, this.definition != null && this.definition.enhance);
            break;

          case ye:
            {
                const t = this.container;
                const e = t.has(ae, false) ? t.get(ae) : t.get(ce);
                e.applyTo(this.shadowRoot);
                this.nodes.appendTo(this.shadowRoot);
                break;
            }

          case we:
            this.nodes.insertBefore(this.location);
            break;
        }
        let e = 0;
        let s = void 0;
        if (this.vmKind !== Re && this.St.attaching != null) {
            s = t.onResolveAll(...this.St.attaching.map(callAttachingHook, this));
        }
        if (this.Rt.Gt) {
            s = t.onResolveAll(s, this.At.attaching(this.$initiator, this.parent));
        }
        if (t.isPromise(s)) {
            this.$t();
            this.Ht();
            s.then((() => {
                this.Nt();
            })).catch((t => {
                this.Wt(t);
            }));
        }
        if (this.children !== null) {
            for (;e < this.children.length; ++e) {
                void this.children[e].activate(this.$initiator, this, this.scope);
            }
        }
        this.Nt();
    }
    deactivate(e, s) {
        let i = void 0;
        switch (this.state & ~De) {
          case Le:
            this.state = Me;
            break;

          case Ee:
            this.state = Me;
            i = this.$promise?.catch(t.noop);
            break;

          case Te:
          case qe:
          case Pe:
          case qe | Pe:
            return;

          default:
            throw createMappedError(505, this.name, this.state);
        }
        this.$initiator = e;
        if (e === this) {
            this.Kt();
        }
        let n = 0;
        let r;
        if (this.children !== null) {
            for (n = 0; n < this.children.length; ++n) {
                void this.children[n].deactivate(e, this);
            }
        }
        return t.onResolve(i, (() => {
            if (this.isBound) {
                if (this.vmKind !== Re && this.St.detaching != null) {
                    r = t.onResolveAll(...this.St.detaching.map(callDetachingHook, this));
                }
                if (this.Rt.Xt) {
                    r = t.onResolveAll(r, this.At.detaching(this.$initiator, this.parent));
                }
            }
            if (t.isPromise(r)) {
                this.$t();
                e.Kt();
                r.then((() => {
                    e.Qt();
                })).catch((t => {
                    e.Wt(t);
                }));
            }
            if (e.head === null) {
                e.head = this;
            } else {
                e.tail.next = this;
            }
            e.tail = this;
            if (e !== this) {
                return;
            }
            this.Qt();
            return this.$promise;
        }));
    }
    removeNodes() {
        switch (this.vmKind) {
          case Se:
          case Re:
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
          case Ae:
            this.scope = null;
            break;

          case Re:
            if (!this.hasLockedScope) {
                this.scope = null;
            }
            if ((this.state & De) === De && !this.viewFactory.tryReturnToCache(this) && this.$initiator === this) {
                this.dispose();
            }
            break;

          case Se:
            this.scope.parent = null;
            break;
        }
        this.state = qe;
        this.$initiator = null;
        this.Yt();
    }
    $t() {
        if (this.$promise === void 0) {
            this.$promise = new Promise(((t, e) => {
                this.$resolve = t;
                this.$reject = e;
            }));
            if (this.$initiator !== this) {
                this.parent.$t();
            }
        }
    }
    Yt() {
        if (this.$promise !== void 0) {
            Fe = this.$resolve;
            this.$resolve = this.$reject = this.$promise = void 0;
            Fe();
            Fe = void 0;
        }
    }
    Wt(t) {
        if (this.$promise !== void 0) {
            He = this.$reject;
            this.$resolve = this.$reject = this.$promise = void 0;
            He(t);
            He = void 0;
        }
        if (this.$initiator !== this) {
            this.parent.Wt(t);
        }
    }
    Ht() {
        ++this.Lt;
        if (this.$initiator !== this) {
            this.parent.Ht();
        }
    }
    Nt() {
        if (this.state !== Ee) {
            --this.Lt;
            this.Yt();
            if (this.$initiator !== this) {
                this.parent.Nt();
            }
            return;
        }
        if (--this.Lt === 0) {
            if (this.vmKind !== Re && this.St.attached != null) {
                Oe = t.onResolveAll(...this.St.attached.map(callAttachedHook, this));
            }
            if (this.Rt.Zt) {
                Oe = t.onResolveAll(Oe, this.At.attached(this.$initiator));
            }
            if (t.isPromise(Oe)) {
                this.$t();
                Oe.then((() => {
                    this.state = Le;
                    this.Yt();
                    if (this.$initiator !== this) {
                        this.parent.Nt();
                    }
                })).catch((t => {
                    this.Wt(t);
                }));
                Oe = void 0;
                return;
            }
            Oe = void 0;
            this.state = Le;
            this.Yt();
        }
        if (this.$initiator !== this) {
            this.parent.Nt();
        }
    }
    Kt() {
        ++this.Mt;
    }
    Qt() {
        if (--this.Mt === 0) {
            this.Jt();
            this.removeNodes();
            let e = this.$initiator.head;
            let s = void 0;
            while (e !== null) {
                if (e !== this) {
                    if (e.debug) {
                        e.logger.trace(`detach()`);
                    }
                    e.removeNodes();
                }
                if (e.Tt) {
                    if (e.vmKind !== Re && e.St.unbinding != null) {
                        s = t.onResolveAll(...e.St.unbinding.map(callUnbindingHook, e));
                    }
                    if (e.Rt.te) {
                        if (e.debug) {
                            e.logger.trace("unbinding()");
                        }
                        s = t.onResolveAll(s, e.viewModel.unbinding(e.$initiator, e.parent));
                    }
                }
                if (t.isPromise(s)) {
                    this.$t();
                    this.Jt();
                    s.then((() => {
                        this.ee();
                    })).catch((t => {
                        this.Wt(t);
                    }));
                }
                s = void 0;
                e = e.next;
            }
            this.ee();
        }
    }
    Jt() {
        ++this.qt;
    }
    ee() {
        if (--this.qt === 0) {
            let t = this.$initiator.head;
            let e = null;
            while (t !== null) {
                if (t !== this) {
                    t.Tt = false;
                    t.isBound = false;
                    t.unbind();
                }
                e = t.next;
                t.next = null;
                t = e;
            }
            this.head = this.tail = null;
            this.Tt = false;
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
          case Ae:
          case Se:
            {
                return this.definition.name === t;
            }

          case Re:
            return this.viewFactory.name === t;
        }
    }
    lockScope(t) {
        this.scope = t;
        this.hasLockedScope = true;
    }
    setHost(t) {
        if (this.vmKind === Se) {
            setRef(t, Ze, this);
            setRef(t, this.definition.key, this);
        }
        this.host = t;
        this.mountTarget = ve;
        return this;
    }
    setShadowRoot(t) {
        if (this.vmKind === Se) {
            setRef(t, Ze, this);
            setRef(t, this.definition.key, this);
        }
        this.shadowRoot = t;
        this.mountTarget = ye;
        return this;
    }
    setLocation(t) {
        if (this.vmKind === Se) {
            setRef(t, Ze, this);
            setRef(t, this.definition.key, this);
        }
        this.location = t;
        this.mountTarget = we;
        return this;
    }
    release() {
        this.state |= De;
    }
    dispose() {
        if ((this.state & Pe) === Pe) {
            return;
        }
        this.state |= Pe;
        if (this.Rt.se) {
            this.At.dispose();
        }
        if (this.children !== null) {
            this.children.forEach(callDispose);
            this.children = null;
        }
        this.scope = null;
        this.nodes = null;
        this.location = null;
        this.viewFactory = null;
        if (this.At !== null) {
            ge.delete(this.At);
            this.At = null;
        }
        this.At = null;
        this.host = null;
        this.shadowRoot = null;
        this.container.disposeResolvers();
    }
    accept(t) {
        if (t(this) === true) {
            return true;
        }
        if (this.Rt.ie && this.At.accept(t) === true) {
            return true;
        }
        if (this.children !== null) {
            const {children: e} = this;
            for (let s = 0, i = e.length; s < i; ++s) {
                if (e[s].accept(t) === true) {
                    return true;
                }
            }
        }
    }
}

const ge = new WeakMap;

const xe = 0;

const ve = 1;

const ye = 2;

const we = 3;

const be = k({
    none: xe,
    host: ve,
    shadowRoot: ye,
    location: we
});

const ke = t.optionalResource(i.ICoercionConfiguration);

function createObservers(e, s, n) {
    const r = s.bindables;
    const l = B(r);
    const h = l.length;
    const a = e.container.get(i.IObserverLocator);
    const c = "propertiesChanged" in n;
    if (h === 0) return;
    const u = c ? (() => {
        let t = {};
        let s = void 0;
        let i = 0;
        const r = Promise.resolve();
        const callPropertiesChanged = () => {
            if (s == null) {
                s = r.then((() => {
                    const r = t;
                    t = {};
                    i = 0;
                    s = void 0;
                    if (e.isBound) {
                        n.propertiesChanged?.(r);
                        if (i > 0) {
                            callPropertiesChanged();
                        }
                    }
                }));
            }
        };
        return (e, s, n) => {
            t[e] = {
                newValue: s,
                oldValue: n
            };
            i++;
            callPropertiesChanged();
        };
    })() : t.noop;
    for (let s = 0; s < h; ++s) {
        const i = l[s];
        const h = r[i];
        const f = h.callback;
        const d = a.getObserver(n, i);
        if (h.set !== t.noop) {
            if (d.useCoercer?.(h.set, e.coercion) !== true) {
                throw createMappedError(507, i);
            }
        }
        if (n[f] != null || n.propertyChanged != null || c) {
            const callback = (t, s) => {
                if (e.isBound) {
                    n[f]?.(t, s);
                    n.propertyChanged?.(i, t, s);
                    u(i, t, s);
                }
            };
            if (d.useCallback?.(callback) !== true) {
                throw createMappedError(508, i);
            }
        }
    }
}

const Ce = new Map;

const getAccessScopeAst = t => {
    let e = Ce.get(t);
    if (e == null) {
        e = new r.AccessScopeExpression(t, 0);
        Ce.set(t, e);
    }
    return e;
};

function createWatchers(e, s, n, l) {
    const h = s.get(i.IObserverLocator);
    const a = s.get(r.IExpressionParser);
    const c = n.watches;
    const u = e.vmKind === Se ? e.scope : i.Scope.create(l, null, true);
    const f = c.length;
    let d;
    let p;
    let m;
    let g = 0;
    for (;f > g; ++g) {
        ({expression: d, callback: p} = c[g]);
        p = t.isFunction(p) ? p : Reflect.get(l, p);
        if (!t.isFunction(p)) {
            throw createMappedError(506, p);
        }
        if (t.isFunction(d)) {
            e.addBinding(new ComputedWatcher(l, h, d, p, true));
        } else {
            m = t.isString(d) ? a.parse(d, M) : getAccessScopeAst(d);
            e.addBinding(new ExpressionWatcher(u, s, h, m, p));
        }
    }
}

function isCustomElementController(t) {
    return t instanceof Controller && t.vmKind === Se;
}

function isCustomElementViewModel(t) {
    return isElementType(t?.constructor);
}

class HooksDefinition {
    constructor(t) {
        this.ne = "define" in t;
        this.It = "hydrating" in t;
        this.Vt = "hydrated" in t;
        this.Ft = "created" in t;
        this.Ot = "binding" in t;
        this.jt = "bound" in t;
        this.Gt = "attaching" in t;
        this.Zt = "attached" in t;
        this.Xt = "detaching" in t;
        this.te = "unbinding" in t;
        this.se = "dispose" in t;
        this.ie = "accept" in t;
    }
}

HooksDefinition.none = new HooksDefinition({});

const Be = {
    mode: "open"
};

const Se = "customElement";

const Ae = "customAttribute";

const Re = "synthetic";

const Te = 0;

const Ee = 1;

const Le = 2;

const Me = 4;

const qe = 8;

const De = 16;

const Pe = 32;

const Ie = /*@__PURE__*/ k({
    none: Te,
    activating: Ee,
    activated: Le,
    deactivating: Me,
    deactivated: qe,
    released: De,
    disposed: Pe
});

function stringifyState(t) {
    const e = [];
    if ((t & Ee) === Ee) {
        e.push("activating");
    }
    if ((t & Le) === Le) {
        e.push("activated");
    }
    if ((t & Me) === Me) {
        e.push("deactivating");
    }
    if ((t & qe) === qe) {
        e.push("deactivated");
    }
    if ((t & De) === De) {
        e.push("released");
    }
    if ((t & Pe) === Pe) {
        e.push("disposed");
    }
    return e.length === 0 ? "none" : e.join("|");
}

const _e = /*@__PURE__*/ O("IController");

const Ve = /*@__PURE__*/ O("IHydrationContext");

class HydrationContext {
    constructor(t, e, s) {
        this.instruction = e;
        this.parent = s;
        this.controller = t;
    }
}

function callDispose(t) {
    t.dispose();
}

function callCreatedHook(t) {
    t.instance.created(this.At, this);
}

function callHydratingHook(t) {
    t.instance.hydrating(this.At, this);
}

function callHydratedHook(t) {
    t.instance.hydrated(this.At, this);
}

function callBindingHook(t) {
    return t.instance.binding(this.At, this["$initiator"], this.parent);
}

function callBoundHook(t) {
    return t.instance.bound(this.At, this["$initiator"], this.parent);
}

function callAttachingHook(t) {
    return t.instance.attaching(this.At, this["$initiator"], this.parent);
}

function callAttachedHook(t) {
    return t.instance.attached(this.At, this["$initiator"]);
}

function callDetachingHook(t) {
    return t.instance.detaching(this.At, this["$initiator"], this.parent);
}

function callUnbindingHook(t) {
    return t.instance.unbinding(this.At, this["$initiator"], this.parent);
}

let Fe;

let He;

let Oe;

class Refs {}

function getRef(t, e) {
    return t.$au?.[e] ?? null;
}

function setRef(t, e, s) {
    const i = t.$au ??= new Refs;
    if (e in i) {
        throw new Error(`Node already associated with a controller, remove the ref "${e}" first before associating with another controller`);
    }
    return i[e] = s;
}

const $e = /*@__PURE__*/ O("INode");

const Ne = /*@__PURE__*/ O("IEventTarget", (t => t.cachedCallback((t => {
    if (t.has(is, true)) {
        return t.get(is).host;
    }
    return t.get(it).document;
}))));

const We = /*@__PURE__*/ O("IRenderLocation");

const je = /*@__PURE__*/ O("ICssClassMapping");

const ze = new WeakMap;

function getEffectiveParentNode(t) {
    if (ze.has(t)) {
        return ze.get(t);
    }
    let e = 0;
    let s = t.nextSibling;
    while (s !== null) {
        if (s.nodeType === 8) {
            switch (s.textContent) {
              case "au-start":
                ++e;
                break;

              case "au-end":
                if (e-- === 0) {
                    return s;
                }
            }
        }
        s = s.nextSibling;
    }
    if (t.parentNode === null && t.nodeType === 11) {
        const e = findElementControllerFor(t, {
            optional: true
        });
        if (e == null) {
            return null;
        }
        if (e.mountTarget === be.shadowRoot) {
            return getEffectiveParentNode(e.host);
        }
    }
    return t.parentNode;
}

function setEffectiveParentNode(t, e) {
    if (t.platform !== void 0 && !(t instanceof t.platform.Node)) {
        const s = t.childNodes;
        for (let t = 0, i = s.length; t < i; ++t) {
            ze.set(s[t], e);
        }
    } else {
        ze.set(t, e);
    }
}

function convertToRenderLocation(t) {
    if (isRenderLocation(t)) {
        return t;
    }
    const e = t.ownerDocument.createComment("au-end");
    const s = e.$start = t.ownerDocument.createComment("au-start");
    const i = t.parentNode;
    if (i !== null) {
        i.replaceChild(e, t);
        i.insertBefore(s, e);
    }
    return e;
}

function isRenderLocation(t) {
    return t.textContent === "au-end";
}

class FragmentNodeSequence {
    get firstChild() {
        return this.oe;
    }
    get lastChild() {
        return this.re;
    }
    constructor(t, e) {
        this.platform = t;
        this.next = void 0;
        this.le = false;
        this.he = false;
        this.ref = null;
        const s = (this.f = e).querySelectorAll("au-m");
        let i = 0;
        let n = s.length;
        let r = this.t = Array(n);
        let l;
        let h;
        while (n > i) {
            h = s[i];
            l = h.nextSibling;
            h.remove();
            if (l.nodeType === 8) {
                h = l;
                (l = l.nextSibling).$start = h;
            }
            r[i] = l;
            ++i;
        }
        const a = e.childNodes;
        const c = this.childNodes = Array(n = a.length);
        i = 0;
        while (n > i) {
            c[i] = a[i];
            ++i;
        }
        this.oe = e.firstChild;
        this.re = e.lastChild;
    }
    findTargets() {
        return this.t;
    }
    insertBefore(t) {
        if (this.he && !!this.ref) {
            this.addToLinked();
        } else {
            const e = t.parentNode;
            if (this.le) {
                let s = this.oe;
                let i;
                const n = this.re;
                while (s != null) {
                    i = s.nextSibling;
                    e.insertBefore(s, t);
                    if (s === n) {
                        break;
                    }
                    s = i;
                }
            } else {
                this.le = true;
                t.parentNode.insertBefore(this.f, t);
            }
        }
    }
    appendTo(t, e = false) {
        if (this.le) {
            let e = this.oe;
            let s;
            const i = this.re;
            while (e != null) {
                s = e.nextSibling;
                t.appendChild(e);
                if (e === i) {
                    break;
                }
                e = s;
            }
        } else {
            this.le = true;
            if (!e) {
                t.appendChild(this.f);
            }
        }
    }
    remove() {
        if (this.le) {
            this.le = false;
            const t = this.f;
            const e = this.re;
            let s;
            let i = this.oe;
            while (i !== null) {
                s = i.nextSibling;
                t.appendChild(i);
                if (i === e) {
                    break;
                }
                i = s;
            }
        }
    }
    addToLinked() {
        const t = this.ref;
        const e = t.parentNode;
        if (this.le) {
            let s = this.oe;
            let i;
            const n = this.re;
            while (s != null) {
                i = s.nextSibling;
                e.insertBefore(s, t);
                if (s === n) {
                    break;
                }
                s = i;
            }
        } else {
            this.le = true;
            e.insertBefore(this.f, t);
        }
    }
    unlink() {
        this.he = false;
        this.next = void 0;
        this.ref = void 0;
    }
    link(t) {
        this.he = true;
        if (isRenderLocation(t)) {
            this.ref = t;
        } else {
            this.next = t;
            this.ae();
        }
    }
    ae() {
        if (this.next !== void 0) {
            this.ref = this.next.firstChild;
        } else {
            this.ref = void 0;
        }
    }
}

const Ue = /*@__PURE__*/ O("IWindow", (t => t.callback((t => t.get(it).window))));

const Ge = /*@__PURE__*/ O("ILocation", (t => t.callback((t => t.get(Ue).location))));

const Ke = /*@__PURE__*/ O("IHistory", (t => t.callback((t => t.get(Ue).history))));

const registerHostNode = (e, s, i = e.get(it)) => {
    registerResolver(e, i.HTMLElement, registerResolver(e, i.Element, registerResolver(e, $e, new t.InstanceProvider("ElementResolver", s))));
    return e;
};

function customElement(t) {
    return function(e, s) {
        s.addInitializer((function() {
            defineElement(t, this);
        }));
        return e;
    };
}

function useShadowDOM(e, s) {
    if (e === void 0) {
        return function(t, e) {
            e.addInitializer((function() {
                annotateElementMetadata(this, "shadowOptions", {
                    mode: "open"
                });
            }));
        };
    }
    if (!t.isFunction(e)) {
        return function(t, s) {
            s.addInitializer((function() {
                annotateElementMetadata(this, "shadowOptions", e);
            }));
        };
    }
    s.addInitializer((function() {
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
    const e = d(Ze, t);
    if (e === void 0) {
        annotateElementMetadata(t, "containerless", true);
        return;
    }
    e.containerless = true;
}

const Xe = new WeakMap;

class CustomElementDefinition {
    get type() {
        return j;
    }
    constructor(t, e, s, i, n, r, l, h, a, c, u, f, d, p, m, g, x, v, y) {
        this.Type = t;
        this.name = e;
        this.aliases = s;
        this.key = i;
        this.capture = n;
        this.template = r;
        this.instructions = l;
        this.dependencies = h;
        this.injectable = a;
        this.needsCompile = c;
        this.surrogates = u;
        this.bindables = f;
        this.containerless = d;
        this.shadowOptions = p;
        this.hasSlots = m;
        this.enhance = g;
        this.watches = x;
        this.strict = v;
        this.processContent = y;
    }
    static create(e, s = null) {
        if (s === null) {
            const i = e;
            if (t.isString(i)) {
                throw createMappedError(761, e);
            }
            const n = t.fromDefinitionOrDefault("name", i, Je);
            if (t.isFunction(i.Type)) {
                s = i.Type;
            } else {
                s = ts(t.pascalCase(n));
            }
            for (const t of Object.values(F.from(i.bindables))) {
                F.i(t, s);
            }
            return new CustomElementDefinition(s, n, t.mergeArrays(i.aliases), t.fromDefinitionOrDefault("key", i, (() => getElementKeyFrom(n))), t.fromAnnotationOrDefinitionOrTypeOrDefault("capture", i, s, returnFalse), t.fromAnnotationOrDefinitionOrTypeOrDefault("template", i, s, returnNull), t.mergeArrays(i.instructions), t.mergeArrays(getElementAnnotation(s, "dependencies"), i.dependencies), t.fromDefinitionOrDefault("injectable", i, returnNull), t.fromDefinitionOrDefault("needsCompile", i, returnTrue), t.mergeArrays(i.surrogates), F.from(getElementAnnotation(s, "bindables"), i.bindables), t.fromAnnotationOrDefinitionOrTypeOrDefault("containerless", i, s, returnFalse), t.fromDefinitionOrDefault("shadowOptions", i, returnNull), t.fromDefinitionOrDefault("hasSlots", i, returnFalse), t.fromDefinitionOrDefault("enhance", i, returnFalse), t.fromDefinitionOrDefault("watches", i, returnEmptyArray), t.fromDefinitionOrDefault("strict", i, returnUndefined), t.fromAnnotationOrTypeOrDefault("processContent", s, returnNull));
        }
        if (t.isString(e)) {
            return new CustomElementDefinition(s, e, t.mergeArrays(getElementAnnotation(s, "aliases"), s.aliases), getElementKeyFrom(e), t.fromAnnotationOrTypeOrDefault("capture", s, returnFalse), t.fromAnnotationOrTypeOrDefault("template", s, returnNull), t.mergeArrays(getElementAnnotation(s, "instructions"), s.instructions), t.mergeArrays(getElementAnnotation(s, "dependencies"), s.dependencies), t.fromAnnotationOrTypeOrDefault("injectable", s, returnNull), t.fromAnnotationOrTypeOrDefault("needsCompile", s, returnTrue), t.mergeArrays(getElementAnnotation(s, "surrogates"), s.surrogates), F.from(...F.getAll(s), getElementAnnotation(s, "bindables"), s.bindables), t.fromAnnotationOrTypeOrDefault("containerless", s, returnFalse), t.fromAnnotationOrTypeOrDefault("shadowOptions", s, returnNull), t.fromAnnotationOrTypeOrDefault("hasSlots", s, returnFalse), t.fromAnnotationOrTypeOrDefault("enhance", s, returnFalse), t.mergeArrays(nt.getDefinitions(s), s.watches), t.fromAnnotationOrTypeOrDefault("strict", s, returnUndefined), t.fromAnnotationOrTypeOrDefault("processContent", s, returnNull));
        }
        const i = t.fromDefinitionOrDefault("name", e, Je);
        for (const t of Object.values(F.from(e.bindables))) {
            F.i(t, s);
        }
        return new CustomElementDefinition(s, i, t.mergeArrays(getElementAnnotation(s, "aliases"), e.aliases, s.aliases), getElementKeyFrom(i), t.fromAnnotationOrDefinitionOrTypeOrDefault("capture", e, s, returnFalse), t.fromAnnotationOrDefinitionOrTypeOrDefault("template", e, s, returnNull), t.mergeArrays(getElementAnnotation(s, "instructions"), e.instructions, s.instructions), t.mergeArrays(getElementAnnotation(s, "dependencies"), e.dependencies, s.dependencies), t.fromAnnotationOrDefinitionOrTypeOrDefault("injectable", e, s, returnNull), t.fromAnnotationOrDefinitionOrTypeOrDefault("needsCompile", e, s, returnTrue), t.mergeArrays(getElementAnnotation(s, "surrogates"), e.surrogates, s.surrogates), F.from(...F.getAll(s), getElementAnnotation(s, "bindables"), s.bindables, e.bindables), t.fromAnnotationOrDefinitionOrTypeOrDefault("containerless", e, s, returnFalse), t.fromAnnotationOrDefinitionOrTypeOrDefault("shadowOptions", e, s, returnNull), t.fromAnnotationOrDefinitionOrTypeOrDefault("hasSlots", e, s, returnFalse), t.fromAnnotationOrDefinitionOrTypeOrDefault("enhance", e, s, returnFalse), t.mergeArrays(e.watches, nt.getDefinitions(s), s.watches), t.fromAnnotationOrDefinitionOrTypeOrDefault("strict", e, s, returnUndefined), t.fromAnnotationOrDefinitionOrTypeOrDefault("processContent", e, s, returnNull));
    }
    static getOrCreate(t) {
        if (t instanceof CustomElementDefinition) {
            return t;
        }
        if (Xe.has(t)) {
            return Xe.get(t);
        }
        const e = CustomElementDefinition.create(t);
        Xe.set(t, e);
        m(e, e.Type, Ze);
        return e;
    }
    register(t, e) {
        const s = this.Type;
        const i = typeof e === "string" ? getElementKeyFrom(e) : this.key;
        const n = this.aliases;
        if (t.has(i, false)) {
            console.warn(createMappedError(153, this.name));
            return;
        }
        t.register(t.has(s, false) ? null : $(s, s), N(s, i), ...n.map((t => N(s, getElementKeyFrom(t)))));
    }
    toString() {
        return `au:ce:${this.name}`;
    }
}

const Qe = {
    name: undefined,
    searchParents: false,
    optional: false
};

const returnNull = () => null;

const returnUndefined = () => void 0;

const returnFalse = () => false;

const returnTrue = () => true;

const returnEmptyArray = () => t.emptyArray;

const Ye = "custom-element";

const Ze = /*@__PURE__*/ t.getResourceKeyFor(Ye);

const getElementKeyFrom = t => `${Ze}:${t}`;

const Je = /*@__PURE__*/ (t => () => `unnamed-${++t}`)(0);

const annotateElementMetadata = (t, e, s) => {
    m(s, t, x(e));
};

const defineElement = (e, s) => {
    const i = CustomElementDefinition.create(e, s);
    const n = i.Type;
    m(i, n, Ze, t.resourceBaseName);
    return n;
};

const isElementType = e => t.isFunction(e) && (p(Ze, e) || e.$au?.type === Ye);

const findElementControllerFor = (t, e = Qe) => {
    if (e.name === void 0 && e.searchParents !== true) {
        const s = getRef(t, Ze);
        if (s === null) {
            if (e.optional === true) {
                return null;
            }
            throw createMappedError(762, t);
        }
        return s;
    }
    if (e.name !== void 0) {
        if (e.searchParents !== true) {
            const s = getRef(t, Ze);
            if (s === null) {
                throw createMappedError(763, t);
            }
            if (s.is(e.name)) {
                return s;
            }
            return void 0;
        }
        let s = t;
        let i = false;
        while (s !== null) {
            const t = getRef(s, Ze);
            if (t !== null) {
                i = true;
                if (t.is(e.name)) {
                    return t;
                }
            }
            s = getEffectiveParentNode(s);
        }
        if (i) {
            return void 0;
        }
        throw createMappedError(764, t);
    }
    let s = t;
    while (s !== null) {
        const t = getRef(s, Ze);
        if (t !== null) {
            return t;
        }
        s = getEffectiveParentNode(s);
    }
    throw createMappedError(765, t);
};

const getElementAnnotation = (t, e) => d(x(e), t);

const getElementDefinition = t => {
    const e = d(Ze, t) ?? getDefinitionFromStaticAu(t, Ye, CustomElementDefinition.create);
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
                resolve(e, s) {
                    if (s.has(t, true)) {
                        return s.get(t);
                    } else {
                        return null;
                    }
                }
            };
        }
    };
    return t;
};

const ts = /*@__PURE__*/ function() {
    const t = {
        value: "",
        writable: false,
        enumerable: false,
        configurable: true
    };
    const e = {};
    return function(s, i = e) {
        const n = class Anonymous {};
        t.value = s;
        R(n, "name", t);
        if (i !== e) {
            C(n.prototype, i);
        }
        return n;
    };
}();

const es = /*@__PURE__*/ k({
    name: Ze,
    keyFrom: getElementKeyFrom,
    isType: isElementType,
    for: findElementControllerFor,
    define: defineElement,
    getDefinition: getElementDefinition,
    annotate: annotateElementMetadata,
    getAnnotation: getElementAnnotation,
    generateName: Je,
    createInjectable: createElementInjectable,
    generateType: ts,
    find(t, e) {
        const s = t.find(Ye, e);
        return s == null ? null : d(Ze, s) ?? getDefinitionFromStaticAu(s, Ye, CustomElementDefinition.create) ?? null;
    }
});

const ss = /*@__PURE__*/ x("processContent");

function processContent(e) {
    return e === void 0 ? function(t, e) {
        if (!e.static || e.kind !== "method") throw createMappedError(766, t);
        e.addInitializer((function() {
            m(t, this, ss);
        }));
    } : function(s, i) {
        i.addInitializer((function() {
            if (t.isString(e) || t.isSymbol(e)) {
                e = this[e];
            }
            if (!t.isFunction(e)) throw createMappedError(766, e);
            const s = d(Ze, this);
            if (s !== void 0) {
                s.processContent = e;
            } else {
                m(e, this, ss);
            }
        }));
        return s;
    };
}

function capture(e) {
    return function(s, i) {
        const n = t.isFunction(e) ? e : true;
        i.addInitializer((function() {
            annotateElementMetadata(this, "capture", n);
            if (isElementType(this)) {
                getElementDefinition(this).capture = n;
            }
        }));
    };
}

const is = /*@__PURE__*/ O("IAppRoot");

class AppRoot {
    get controller() {
        return this.M;
    }
    constructor(e, s, i, n = false) {
        this.config = e;
        this.container = s;
        this.ce = void 0;
        this.ue = n;
        const r = this.host = e.host;
        i.prepare(this);
        registerResolver(s, Ne, new t.InstanceProvider("IEventTarget", r));
        registerHostNode(s, r, this.platform = this.fe(s, r));
        this.ce = t.onResolve(this.de("creating"), (() => {
            if (!e.allowActionlessForm !== false) {
                r.addEventListener("submit", (t => {
                    const e = t.target;
                    const s = !e.getAttribute("action");
                    if (e.tagName === "FORM" && s) {
                        t.preventDefault();
                    }
                }), false);
            }
            const i = n ? s : s.createChild();
            const l = e.component;
            let h;
            if (t.isFunction(l)) {
                h = i.invoke(l);
                W(l, h);
            } else {
                h = e.component;
            }
            const a = {
                hydrate: false,
                projections: null
            };
            const c = n ? CustomElementDefinition.create({
                name: Je(),
                template: this.host,
                enhance: true,
                strict: e.strictBinding
            }) : void 0;
            const u = this.M = Controller.$el(i, h, r, a, c);
            u.hE(a);
            return t.onResolve(this.de("hydrating"), (() => {
                u.hS();
                return t.onResolve(this.de("hydrated"), (() => {
                    u.hC();
                    this.ce = void 0;
                }));
            }));
        }));
    }
    activate() {
        return t.onResolve(this.ce, (() => t.onResolve(this.de("activating"), (() => t.onResolve(this.M.activate(this.M, null, void 0), (() => this.de("activated")))))));
    }
    deactivate() {
        return t.onResolve(this.de("deactivating"), (() => t.onResolve(this.M.deactivate(this.M, null), (() => this.de("deactivated")))));
    }
    de(e) {
        const s = this.container;
        const i = this.ue && !s.has(et, false) ? [] : s.getAll(et);
        return t.onResolveAll(...i.reduce(((t, s) => {
            if (s.slot === e) {
                t.push(s.run());
            }
            return t;
        }), []));
    }
    fe(t, e) {
        let s;
        if (!t.has(it, false)) {
            if (e.ownerDocument.defaultView === null) {
                throw createMappedError(769);
            }
            s = new n.BrowserPlatform(e.ownerDocument.defaultView);
            t.register(W(it, s));
        } else {
            s = t.get(it);
        }
        return s;
    }
    dispose() {
        this.M?.dispose();
    }
}

const ns = /*@__PURE__*/ O("IAurelia");

class Aurelia {
    get isRunning() {
        return this.ir;
    }
    get isStarting() {
        return this.pe;
    }
    get isStopping() {
        return this.me;
    }
    get root() {
        if (this.ge == null) {
            if (this.next == null) {
                throw createMappedError(767);
            }
            return this.next;
        }
        return this.ge;
    }
    constructor(e = t.DI.createContainer()) {
        this.container = e;
        this.ir = false;
        this.pe = false;
        this.me = false;
        this.ge = void 0;
        this.next = void 0;
        this.xe = void 0;
        this.ve = void 0;
        if (e.has(ns, true) || e.has(Aurelia, true)) {
            throw createMappedError(768);
        }
        registerResolver(e, ns, new t.InstanceProvider("IAurelia", this));
        registerResolver(e, Aurelia, new t.InstanceProvider("Aurelia", this));
        registerResolver(e, is, this.ye = new t.InstanceProvider("IAppRoot"));
    }
    register(...t) {
        this.container.register(...t);
        return this;
    }
    app(t) {
        this.next = new AppRoot(t, this.container, this.ye);
        return this;
    }
    enhance(e) {
        const s = e.container ?? this.container.createChild();
        const i = registerResolver(s, is, new t.InstanceProvider("IAppRoot"));
        const n = new AppRoot({
            host: e.host,
            component: e.component
        }, s, i, true);
        return t.onResolve(n.activate(), (() => n));
    }
    async waitForIdle() {
        const t = this.root.platform;
        await t.domQueue.yield();
        await t.taskQueue.yield();
    }
    start(e = this.next) {
        if (e == null) {
            throw createMappedError(770);
        }
        if (t.isPromise(this.xe)) {
            return this.xe;
        }
        return this.xe = t.onResolve(this.stop(), (() => {
            Reflect.set(e.host, "$aurelia", this);
            this.ye.prepare(this.ge = e);
            this.pe = true;
            return t.onResolve(e.activate(), (() => {
                this.ir = true;
                this.pe = false;
                this.xe = void 0;
                this.we(e, "au-started", e.host);
            }));
        }));
    }
    stop(e = false) {
        if (t.isPromise(this.ve)) {
            return this.ve;
        }
        if (this.ir === true) {
            const s = this.ge;
            this.ir = false;
            this.me = true;
            return this.ve = t.onResolve(s.deactivate(), (() => {
                Reflect.deleteProperty(s.host, "$aurelia");
                if (e) {
                    s.dispose();
                }
                this.ge = void 0;
                this.ye.dispose();
                this.me = false;
                this.we(s, "au-stopped", s.host);
            }));
        }
    }
    dispose() {
        if (this.ir || this.me) {
            throw createMappedError(771);
        }
        this.container.dispose();
    }
    we(t, e, s) {
        const i = new t.platform.window.CustomEvent(e, {
            detail: this,
            bubbles: true,
            cancelable: true
        });
        s.dispatchEvent(i);
    }
}

const os = /*@__PURE__*/ O("ISVGAnalyzer", (t => t.singleton(NoopSVGAnalyzer)));

const o = e => {
    const s = t.createLookup();
    e = t.isString(e) ? e.split(" ") : e;
    let i;
    for (i of e) {
        s[i] = true;
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
        t.register($(this, this), N(this, os));
    }
    constructor() {
        this.be = C(t.createLookup(), {
            a: o("class externalResourcesRequired id onactivate onclick onfocusin onfocusout onload onmousedown onmousemove onmouseout onmouseover onmouseup requiredExtensions requiredFeatures style systemLanguage target transform xlink:actuate xlink:arcrole xlink:href xlink:role xlink:show xlink:title xlink:type xml:base xml:lang xml:space"),
            altGlyph: o("class dx dy externalResourcesRequired format glyphRef id onactivate onclick onfocusin onfocusout onload onmousedown onmousemove onmouseout onmouseover onmouseup requiredExtensions requiredFeatures rotate style systemLanguage x xlink:actuate xlink:arcrole xlink:href xlink:role xlink:show xlink:title xlink:type xml:base xml:lang xml:space y"),
            altglyph: t.createLookup(),
            altGlyphDef: o("id xml:base xml:lang xml:space"),
            altglyphdef: t.createLookup(),
            altGlyphItem: o("id xml:base xml:lang xml:space"),
            altglyphitem: t.createLookup(),
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
            glyphref: t.createLookup(),
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
        this.ke = o("a altGlyph animate animateColor circle clipPath defs ellipse feBlend feColorMatrix feComponentTransfer feComposite feConvolveMatrix feDiffuseLighting feDisplacementMap feFlood feGaussianBlur feImage feMerge feMorphology feOffset feSpecularLighting feTile feTurbulence filter font foreignObject g glyph glyphRef image line linearGradient marker mask missing-glyph path pattern polygon polyline radialGradient rect stop svg switch symbol text textPath tref tspan use");
        this.Ce = o("alignment-baseline baseline-shift clip-path clip-rule clip color-interpolation-filters color-interpolation color-profile color-rendering color cursor direction display dominant-baseline enable-background fill-opacity fill-rule fill filter flood-color flood-opacity font-family font-size-adjust font-size font-stretch font-style font-variant font-weight glyph-orientation-horizontal glyph-orientation-vertical image-rendering kerning letter-spacing lighting-color marker-end marker-mid marker-start mask opacity overflow pointer-events shape-rendering stop-color stop-opacity stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width stroke text-anchor text-decoration text-rendering unicode-bidi visibility word-spacing writing-mode");
        const e = t.resolve(it);
        this.SVGElement = e.globalThis.SVGElement;
        const s = e.document.createElement("div");
        s.innerHTML = "<svg><altGlyph /></svg>";
        if (s.firstElementChild.nodeName === "altglyph") {
            const t = this.be;
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
        return this.ke[t.nodeName] === true && this.Ce[e] === true || this.be[t.nodeName]?.[e] === true;
    }
}

class AttrMapper {
    constructor() {
        this.fns = [];
        this.Be = t.createLookup();
        this.Se = t.createLookup();
        this.svg = t.resolve(os);
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
    useMapping(e) {
        let s;
        let i;
        let n;
        let r;
        for (n in e) {
            s = e[n];
            i = this.Be[n] ??= t.createLookup();
            for (r in s) {
                if (i[r] !== void 0) {
                    throw createError(r, n);
                }
                i[r] = s[r];
            }
        }
    }
    useGlobalMapping(t) {
        const e = this.Se;
        for (const s in t) {
            if (e[s] !== void 0) {
                throw createError(s, "*");
            }
            e[s] = t[s];
        }
    }
    useTwoWay(t) {
        this.fns.push(t);
    }
    isTwoWay(t, e) {
        return shouldDefaultToTwoWay(t, e) || this.fns.length > 0 && this.fns.some((s => s(t, e)));
    }
    map(t, e) {
        return this.Be[t.nodeName]?.[e] ?? this.Se[e] ?? (isDataAttribute(t, e, this.svg) ? e : null);
    }
}

AttrMapper.register = t.createImplementationRegister(e.IAttrMapper);

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

const rs = {
    register(t) {
        t.register(e.TemplateCompiler, AttrMapper, ResourceResolver);
    }
};

class BindablesInfo {
    constructor(t, e, s) {
        this.attrs = t;
        this.bindables = e;
        this.primary = s;
    }
}

class ResourceResolver {
    constructor() {
        this.Ae = new WeakMap;
        this.Re = new WeakMap;
    }
    el(t, e) {
        let s = this.Ae.get(t);
        if (s == null) {
            this.Ae.set(t, s = new RecordCache);
        }
        return e in s.Te ? s.Te[e] : s.Te[e] = es.find(t, e);
    }
    attr(t, e) {
        let s = this.Ae.get(t);
        if (s == null) {
            this.Ae.set(t, s = new RecordCache);
        }
        return e in s.Ee ? s.Ee[e] : s.Ee[e] = lt.find(t, e);
    }
    bindables(e) {
        let s = this.Re.get(e);
        if (s == null) {
            const i = e.bindables;
            const n = t.createLookup();
            let r;
            let l;
            let a = false;
            let c;
            let u;
            for (l in i) {
                r = i[l];
                u = r.attribute;
                if (r.primary === true) {
                    if (a) {
                        throw createMappedError(714, e);
                    }
                    a = true;
                    c = r;
                } else if (!a && c == null) {
                    c = r;
                }
                n[u] = BindableDefinition.create(l, r);
            }
            if (r == null && e.type === "custom-attribute") {
                c = n.value = BindableDefinition.create("value", {
                    mode: e.defaultBindingMode ?? h
                });
            }
            this.Re.set(e, s = new BindablesInfo(n, i, c ?? null));
        }
        return s;
    }
}

ResourceResolver.register = t.createImplementationRegister(e.IResourceResolver);

class RecordCache {
    constructor() {
        this.Te = t.createLookup();
        this.Ee = t.createLookup();
    }
}

const ls = t.createLookup();

class AttributeNSAccessor {
    static forNs(t) {
        return ls[t] ??= new AttributeNSAccessor(t);
    }
    constructor(t) {
        this.ns = t;
        this.type = I | _;
    }
    getValue(t, e) {
        return t.getAttributeNS(this.ns, e);
    }
    setValue(t, e, s) {
        if (t == null) {
            e.removeAttributeNS(this.ns, s);
        } else {
            e.setAttributeNS(this.ns, s, t);
        }
    }
}

(() => {
    mixinNoopSubscribable(AttributeNSAccessor);
})();

class DataAttributeAccessor {
    constructor() {
        this.type = I | _;
    }
    getValue(t, e) {
        return t.getAttribute(e);
    }
    setValue(t, e, s) {
        if (t == null) {
            e.removeAttribute(s);
        } else {
            e.setAttribute(s, t);
        }
    }
}

(() => {
    mixinNoopSubscribable(DataAttributeAccessor);
})();

const hs = /*@__PURE__*/ new DataAttributeAccessor;

class SelectValueObserver {
    static Le(t) {
        const e = [];
        if (t.length === 0) {
            return e;
        }
        const s = t.length;
        let i = 0;
        let n;
        while (s > i) {
            n = t[i];
            if (n.selected) {
                e[e.length] = b.call(n, "model") ? n.model : n.value;
            }
            ++i;
        }
        return e;
    }
    static Me(t, e) {
        return t === e;
    }
    constructor(t, e, s, i) {
        this.type = I | P | _;
        this.v = void 0;
        this.ov = void 0;
        this.qe = false;
        this.De = void 0;
        this.Pe = void 0;
        this.iO = false;
        this.ot = false;
        this.nt = t;
        this.oL = i;
        this.cf = s;
    }
    getValue() {
        return this.iO ? this.v : this.nt.multiple ? SelectValueObserver.Le(this.nt.options) : this.nt.value;
    }
    setValue(t) {
        this.ov = this.v;
        this.v = t;
        this.qe = t !== this.ov;
        this.Ie(t instanceof Array ? t : null);
        this.ut();
    }
    ut() {
        if (this.qe) {
            this.qe = false;
            this.syncOptions();
        }
    }
    handleCollectionChange() {
        this.syncOptions();
    }
    syncOptions() {
        const e = this.v;
        const s = this.nt;
        const i = t.isArray(e);
        const n = s.matcher ?? SelectValueObserver.Me;
        const r = s.options;
        let l = r.length;
        while (l-- > 0) {
            const t = r[l];
            const s = b.call(t, "model") ? t.model : t.value;
            if (i) {
                t.selected = e.findIndex((t => !!n(s, t))) !== -1;
                continue;
            }
            t.selected = !!n(s, e);
        }
    }
    syncValue() {
        const t = this.nt;
        const e = t.options;
        const s = e.length;
        const i = this.v;
        let n = 0;
        if (t.multiple) {
            if (!(i instanceof Array)) {
                return true;
            }
            let r;
            const l = t.matcher || SelectValueObserver.Me;
            const h = [];
            while (n < s) {
                r = e[n];
                if (r.selected) {
                    h.push(b.call(r, "model") ? r.model : r.value);
                }
                ++n;
            }
            let a;
            n = 0;
            while (n < i.length) {
                a = i[n];
                if (h.findIndex((t => !!l(a, t))) === -1) {
                    i.splice(n, 1);
                } else {
                    ++n;
                }
            }
            n = 0;
            while (n < h.length) {
                a = h[n];
                if (i.findIndex((t => !!l(a, t))) === -1) {
                    i.push(a);
                }
                ++n;
            }
            return false;
        }
        let r = null;
        let l;
        while (n < s) {
            l = e[n];
            if (l.selected) {
                r = b.call(l, "model") ? l.model : l.value;
                break;
            }
            ++n;
        }
        this.ov = this.v;
        this.v = r;
        return true;
    }
    rt() {
        (this.Pe = createMutationObserver(this.nt, this._e.bind(this))).observe(this.nt, {
            childList: true,
            subtree: true,
            characterData: true
        });
        this.Ie(this.v instanceof Array ? this.v : null);
        this.iO = true;
    }
    lt() {
        this.Pe.disconnect();
        this.De?.unsubscribe(this);
        this.Pe = this.De = void 0;
        this.iO = false;
    }
    Ie(t) {
        this.De?.unsubscribe(this);
        this.De = void 0;
        if (t != null) {
            if (!this.nt.multiple) {
                throw createMappedError(654);
            }
            (this.De = this.oL.getArrayObserver(t)).subscribe(this);
        }
    }
    handleEvent() {
        const t = this.syncValue();
        if (t) {
            this.Ve();
        }
    }
    _e(t) {
        this.syncOptions();
        const e = this.syncValue();
        if (e) {
            this.Ve();
        }
    }
    Ve() {
        const t = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, t);
    }
}

(() => {
    mixinNodeObserverUseConfig(SelectValueObserver);
    i.subscriberCollection(SelectValueObserver, null);
})();

const as = "--";

class StyleAttributeAccessor {
    constructor(t) {
        this.obj = t;
        this.type = I | _;
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
        this.ut();
    }
    Fe(t) {
        const e = [];
        const s = /url\([^)]+$/;
        let i = 0;
        let n = "";
        let r;
        let l;
        let h;
        let a;
        while (i < t.length) {
            r = t.indexOf(";", i);
            if (r === -1) {
                r = t.length;
            }
            n += t.substring(i, r);
            i = r + 1;
            if (s.test(n)) {
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
    He(e) {
        let s;
        let i;
        const n = [];
        for (i in e) {
            s = e[i];
            if (s == null) {
                continue;
            }
            if (t.isString(s)) {
                if (i.startsWith(as)) {
                    n.push([ i, s ]);
                    continue;
                }
                n.push([ t.kebabCase(i), s ]);
                continue;
            }
            n.push(...this.Oe(s));
        }
        return n;
    }
    $e(e) {
        const s = e.length;
        if (s > 0) {
            const t = [];
            let i = 0;
            for (;s > i; ++i) {
                t.push(...this.Oe(e[i]));
            }
            return t;
        }
        return t.emptyArray;
    }
    Oe(e) {
        if (t.isString(e)) {
            return this.Fe(e);
        }
        if (e instanceof Array) {
            return this.$e(e);
        }
        if (e instanceof Object) {
            return this.He(e);
        }
        return t.emptyArray;
    }
    ut() {
        if (this.qe) {
            this.qe = false;
            const t = this.v;
            const e = this.styles;
            const s = this.Oe(t);
            let i;
            let n = this.version;
            this.ov = t;
            let r;
            let l;
            let h;
            let a = 0;
            const c = s.length;
            for (;a < c; ++a) {
                r = s[a];
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
            for (i in e) {
                if (!b.call(e, i) || e[i] !== n) {
                    continue;
                }
                this.obj.style.removeProperty(i);
            }
        }
    }
    setProperty(e, s) {
        let i = "";
        if (s != null && t.isFunction(s.indexOf) && s.includes("!important")) {
            i = "important";
            s = s.replace("!important", "");
        }
        this.obj.style.setProperty(e, s, i);
    }
    bind() {
        this.v = this.ov = this.obj.style.cssText;
    }
}

(() => {
    mixinNoopSubscribable(StyleAttributeAccessor);
})();

class ValueAttributeObserver {
    constructor(t, e, s) {
        this.type = I | P | _;
        this.v = "";
        this.ov = "";
        this.qe = false;
        this.ot = false;
        this.nt = t;
        this.k = e;
        this.cf = s;
    }
    getValue() {
        return this.v;
    }
    setValue(e) {
        if (t.areEqual(e, this.v)) {
            return;
        }
        this.ov = this.v;
        this.v = e;
        this.qe = true;
        if (!this.cf.readonly) {
            this.ut();
        }
    }
    ut() {
        if (this.qe) {
            this.qe = false;
            this.nt[this.k] = this.v ?? this.cf.default;
            this.Ve();
        }
    }
    handleEvent() {
        this.ov = this.v;
        this.v = this.nt[this.k];
        if (this.ov !== this.v) {
            this.qe = false;
            this.Ve();
        }
    }
    rt() {
        this.v = this.ov = this.nt[this.k];
    }
    Ve() {
        const t = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, t);
    }
}

(() => {
    mixinNodeObserverUseConfig(ValueAttributeObserver);
    i.subscriberCollection(ValueAttributeObserver, null);
})();

const cs = (() => {
    const e = "http://www.w3.org/1999/xlink";
    const s = "http://www.w3.org/XML/1998/namespace";
    const i = "http://www.w3.org/2000/xmlns/";
    return C(t.createLookup(), {
        "xlink:actuate": [ "actuate", e ],
        "xlink:arcrole": [ "arcrole", e ],
        "xlink:href": [ "href", e ],
        "xlink:role": [ "role", e ],
        "xlink:show": [ "show", e ],
        "xlink:title": [ "title", e ],
        "xlink:type": [ "type", e ],
        "xml:lang": [ "lang", s ],
        "xml:space": [ "space", s ],
        xmlns: [ "xmlns", i ],
        "xmlns:xlink": [ "xlink", i ]
    });
})();

const us = new i.PropertyAccessor;

us.type = I | _;

class NodeObserverLocator {
    constructor() {
        this.allowDirtyCheck = true;
        this.Ne = t.createLookup();
        this.We = t.createLookup();
        this.je = t.createLookup();
        this.ze = t.createLookup();
        this.Ue = t.resolve(t.IServiceLocator);
        this.p = t.resolve(it);
        this.Ge = t.resolve(i.IDirtyChecker);
        this.svg = t.resolve(os);
        const e = [ "change", "input" ];
        const s = {
            events: e,
            default: ""
        };
        this.useConfig({
            INPUT: {
                value: s,
                valueAsNumber: {
                    events: e,
                    default: 0
                },
                checked: {
                    type: CheckedObserver,
                    events: e
                },
                files: {
                    events: e,
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
                value: s
            }
        });
        const n = {
            events: [ "change", "input", "blur", "keyup", "paste" ],
            default: ""
        };
        const r = {
            events: [ "scroll" ],
            default: 0
        };
        this.useConfigGlobal({
            scrollTop: r,
            scrollLeft: r,
            textContent: n,
            innerHTML: n
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
    useConfig(e, s, i) {
        const n = this.Ne;
        let r;
        if (t.isString(e)) {
            r = n[e] ??= t.createLookup();
            if (r[s] == null) {
                r[s] = i;
            } else {
                throwMappingExisted(e, s);
            }
        } else {
            for (const i in e) {
                r = n[i] ??= t.createLookup();
                const l = e[i];
                for (s in l) {
                    if (r[s] == null) {
                        r[s] = l[s];
                    } else {
                        throwMappingExisted(i, s);
                    }
                }
            }
        }
    }
    useConfigGlobal(t, e) {
        const s = this.We;
        if (typeof t === "object") {
            for (const e in t) {
                if (s[e] == null) {
                    s[e] = t[e];
                } else {
                    throwMappingExisted("*", e);
                }
            }
        } else {
            if (s[t] == null) {
                s[t] = e;
            } else {
                throwMappingExisted("*", t);
            }
        }
    }
    getAccessor(e, s, i) {
        if (s in this.ze || s in (this.je[e.tagName] ?? t.emptyObject)) {
            return this.getObserver(e, s, i);
        }
        switch (s) {
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
            return hs;

          default:
            {
                const t = cs[s];
                if (t !== undefined) {
                    return AttributeNSAccessor.forNs(t[1]);
                }
                if (isDataAttribute(e, s, this.svg)) {
                    return hs;
                }
                return us;
            }
        }
    }
    overrideAccessor(e, s) {
        let i;
        if (t.isString(e)) {
            i = this.je[e] ??= t.createLookup();
            i[s] = true;
        } else {
            for (const s in e) {
                for (const n of e[s]) {
                    i = this.je[s] ??= t.createLookup();
                    i[n] = true;
                }
            }
        }
    }
    overrideAccessorGlobal(...t) {
        for (const e of t) {
            this.ze[e] = true;
        }
    }
    getNodeObserverConfig(t, e) {
        return this.Ne[t.tagName]?.[e] ?? this.We[e];
    }
    getNodeObserver(t, e, s) {
        const n = this.Ne[t.tagName]?.[e] ?? this.We[e];
        let r;
        if (n != null) {
            r = new (n.type ?? ValueAttributeObserver)(t, e, n, s, this.Ue);
            if (!r.doNotCache) {
                i.getObserverLookup(t)[e] = r;
            }
            return r;
        }
        return null;
    }
    getObserver(t, e, s) {
        switch (e) {
          case "class":
            return new ClassAttributeAccessor(t);

          case "css":
          case "style":
            return new StyleAttributeAccessor(t);
        }
        const n = this.getNodeObserver(t, e, s);
        if (n != null) {
            return n;
        }
        const r = cs[e];
        if (r !== undefined) {
            return AttributeNSAccessor.forNs(r[1]);
        }
        if (isDataAttribute(t, e, this.svg)) {
            return hs;
        }
        if (e in t.constructor.prototype) {
            if (this.allowDirtyCheck) {
                return this.Ge.createProperty(t, e);
            }
            throw createMappedError(652, e);
        } else {
            return new i.SetterObserver(t, e);
        }
    }
}

NodeObserverLocator.register = t.createImplementationRegister(i.INodeObserverLocator);

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
    constructor(t, e, s, i) {
        this.type = I | P | _;
        this.v = void 0;
        this.ov = void 0;
        this.Ke = void 0;
        this.Xe = void 0;
        this.ot = false;
        this.nt = t;
        this.oL = i;
        this.cf = s;
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
        this.Qe();
        this.Ye();
        this.Ve();
    }
    handleCollectionChange() {
        this.Ye();
    }
    handleChange(t, e) {
        this.Ye();
    }
    Ye() {
        const e = this.v;
        const s = this.nt;
        const i = b.call(s, "model") ? s.model : s.value;
        const n = s.type === "radio";
        const r = s.matcher !== void 0 ? s.matcher : defaultMatcher;
        if (n) {
            s.checked = !!r(e, i);
        } else if (e === true) {
            s.checked = true;
        } else {
            let n = false;
            if (t.isArray(e)) {
                n = e.findIndex((t => !!r(t, i))) !== -1;
            } else if (e instanceof Set) {
                for (const t of e) {
                    if (r(t, i)) {
                        n = true;
                        break;
                    }
                }
            } else if (e instanceof Map) {
                for (const t of e) {
                    const e = t[0];
                    const s = t[1];
                    if (r(e, i) && s === true) {
                        n = true;
                        break;
                    }
                }
            }
            s.checked = n;
        }
    }
    handleEvent() {
        let e = this.ov = this.v;
        const s = this.nt;
        const i = b.call(s, "model") ? s.model : s.value;
        const n = s.checked;
        const r = s.matcher !== void 0 ? s.matcher : defaultMatcher;
        if (s.type === "checkbox") {
            if (t.isArray(e)) {
                const t = e.findIndex((t => !!r(t, i)));
                if (n && t === -1) {
                    e.push(i);
                } else if (!n && t !== -1) {
                    e.splice(t, 1);
                }
                return;
            } else if (e instanceof Set) {
                const t = {};
                let s = t;
                for (const t of e) {
                    if (r(t, i) === true) {
                        s = t;
                        break;
                    }
                }
                if (n && s === t) {
                    e.add(i);
                } else if (!n && s !== t) {
                    e.delete(s);
                }
                return;
            } else if (e instanceof Map) {
                let t;
                for (const s of e) {
                    const e = s[0];
                    if (r(e, i) === true) {
                        t = e;
                        break;
                    }
                }
                e.set(t, n);
                return;
            }
            e = n;
        } else if (n) {
            e = i;
        } else {
            return;
        }
        this.v = e;
        this.Ve();
    }
    rt() {
        this.Qe();
    }
    lt() {
        this.v = this.ov = void 0;
        this.Ke?.unsubscribe(this);
        this.Xe?.unsubscribe(this);
        this.Ke = this.Xe = void 0;
    }
    Ve() {
        fs = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, fs);
        fs = void 0;
    }
    Qe() {
        const t = this.nt;
        (this.Xe ??= t.$observers?.model ?? t.$observers?.value)?.subscribe(this);
        this.Ke?.unsubscribe(this);
        this.Ke = void 0;
        if (t.type === "checkbox") {
            (this.Ke = getCollectionObserver(this.v, this.oL))?.subscribe(this);
        }
    }
}

(() => {
    mixinNodeObserverUseConfig(CheckedObserver);
    i.subscriberCollection(CheckedObserver, null);
})();

let fs = void 0;

class AttrBindingBehavior {
    bind(t, e) {
        if (!(e instanceof PropertyBinding)) {
            throw createMappedError(9994, e);
        }
        e.useTargetObserver(hs);
    }
}

AttrBindingBehavior.$au = {
    type: U,
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
    type: U,
    name: "self"
};

class UpdateTriggerBindingBehavior {
    constructor() {
        this.oL = t.resolve(i.IObserverLocator);
        this.Ze = t.resolve(i.INodeObserverLocator);
    }
    bind(t, e, ...s) {
        if (!(this.Ze instanceof NodeObserverLocator)) {
            throw createMappedError(9993);
        }
        if (s.length === 0) {
            throw createMappedError(802);
        }
        if (!(e instanceof PropertyBinding) || !(e.mode & u)) {
            throw createMappedError(803);
        }
        const i = this.Ze.getNodeObserverConfig(e.target, e.targetProperty);
        if (i == null) {
            throw createMappedError(9992, e);
        }
        const n = this.Ze.getNodeObserver(e.target, e.targetProperty, this.oL);
        n.useConfig({
            readonly: i.readonly,
            default: i.default,
            events: s
        });
        e.useTargetObserver(n);
    }
}

UpdateTriggerBindingBehavior.$au = {
    type: U,
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
        this.Je = false;
        this.ts = 0;
        this.es = t.resolve(Rt);
        this.l = t.resolve(We);
    }
    attaching(t, e) {
        return this.ss(this.value);
    }
    detaching(e, s) {
        this.Je = true;
        return t.onResolve(this.pending, (() => {
            this.Je = false;
            this.pending = void 0;
            void this.view?.deactivate(e, this.$controller);
        }));
    }
    valueChanged(t, e) {
        if (!this.$controller.isActive) return;
        t = !!t;
        e = !!e;
        if (t !== e) return this.ss(t);
    }
    ss(e) {
        const s = this.view;
        const i = this.$controller;
        const n = this.ts++;
        const isCurrent = () => !this.Je && this.ts === n + 1;
        let r;
        return t.onResolve(this.pending, (() => this.pending = t.onResolve(s?.deactivate(s, i), (() => {
            if (!isCurrent()) {
                return;
            }
            if (e) {
                r = this.view = this.ifView = this.cache && this.ifView != null ? this.ifView : this.es.create();
            } else {
                r = this.view = this.elseView = this.cache && this.elseView != null ? this.elseView : this.elseFactory?.create();
            }
            if (r == null) {
                return;
            }
            r.setLocation(this.l);
            return t.onResolve(r.activate(r, i, i.scope), (() => {
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
    type: ot,
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
        this.f = t.resolve(Rt);
    }
    link(t, e, s, i) {
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

const ds = [ "BindingBehavior", "ValueConverter" ];

class Repeat {
    constructor() {
        this.views = [];
        this.key = null;
        this.os = [];
        this.rs = [];
        this.ls = [];
        this.cs = new Map;
        this.us = void 0;
        this.ds = false;
        this.ps = false;
        this.gs = null;
        this.xs = void 0;
        this.ys = false;
        this.l = t.resolve(We);
        this.ws = t.resolve(_e);
        this.f = t.resolve(Rt);
        this.bs = t.resolve(xs);
        const s = t.resolve(e.IInstruction);
        const i = s.props[0].props[0];
        if (i !== void 0) {
            const {to: e, value: s, command: n} = i;
            if (e === "key") {
                if (n === null) {
                    this.key = s;
                } else if (n === "bind") {
                    this.key = t.resolve(r.IExpressionParser).parse(s, M);
                } else {
                    throw createMappedError(775, n);
                }
            } else {
                throw createMappedError(776, e);
            }
        }
    }
    binding(t, e) {
        const s = this.ws.bindings;
        const n = s.length;
        let r = void 0;
        let l;
        let h = 0;
        for (;n > h; ++h) {
            r = s[h];
            if (r.target === this && r.targetProperty === "items") {
                l = this.forOf = r.ast;
                this.ks = r;
                let t = l.iterable;
                while (t != null && ds.includes(t.$kind)) {
                    t = t.expression;
                    this.ds = true;
                }
                this.gs = t;
                break;
            }
        }
        this.Cs();
        const a = l.declaration;
        if (!(this.ys = a.$kind === "ArrayDestructuring" || a.$kind === "ObjectDestructuring")) {
            this.local = i.astEvaluate(a, this.$controller.scope, r, null);
        }
    }
    attaching(e, s) {
        this.Bs();
        this.Ss(void 0);
        return this.As(e, this.xs ?? t.emptyArray);
    }
    detaching(t, e) {
        this.Cs();
        return this.Rs(t);
    }
    unbinding(t, e) {
        this.cs.clear();
    }
    itemsChanged() {
        if (!this.$controller.isActive) {
            return;
        }
        this.Cs();
        this.Bs();
        this.Ss(void 0);
        this.Ts(void 0);
    }
    handleCollectionChange(t, e) {
        const s = this.$controller;
        if (!s.isActive) {
            return;
        }
        if (this.ds) {
            if (this.ps) {
                return;
            }
            this.ps = true;
            this.items = i.astEvaluate(this.forOf.iterable, s.scope, this.ks, null);
            this.ps = false;
            return;
        }
        this.Bs();
        this.Ss(this.key === null ? e : void 0);
        this.Ts(e);
    }
    Ts(e) {
        const s = this.views;
        this.os = s.slice();
        const n = s.length;
        const r = this.key;
        const l = r !== null;
        const h = this.ls;
        const a = this.rs;
        if (l || e === void 0) {
            const t = this.local;
            const s = this.xs;
            const c = s.length;
            const u = this.forOf;
            const f = u.declaration;
            const d = this.ks;
            const p = this.ys;
            e = i.createIndexMap(c);
            let m = 0;
            if (n === 0) {
                for (;m < c; ++m) {
                    e[m] = -2;
                }
            } else if (c === 0) {
                for (m = 0; m < n; ++m) {
                    e.deletedIndices.push(m);
                    e.deletedItems.push(getItem(p, f, h[m], d, t));
                }
            } else if (l) {
                const s = Array(n);
                for (m = 0; m < n; ++m) {
                    s[m] = getKeyValue(p, r, f, h[m], d, t);
                }
                const i = Array(n);
                for (m = 0; m < c; ++m) {
                    i[m] = getKeyValue(p, r, f, a[m], d, t);
                }
                for (m = 0; m < c; ++m) {
                    if (s.includes(i[m])) {
                        e[m] = s.indexOf(i[m]);
                    } else {
                        e[m] = -2;
                    }
                }
                for (m = 0; m < n; ++m) {
                    if (!i.includes(s[m])) {
                        e.deletedIndices.push(m);
                        e.deletedItems.push(getItem(p, f, h[m], d, t));
                    }
                }
            } else {
                for (m = 0; m < c; ++m) {
                    if (h.includes(a[m])) {
                        e[m] = h.indexOf(a[m]);
                    } else {
                        e[m] = -2;
                    }
                }
                for (m = 0; m < n; ++m) {
                    if (!a.includes(h[m])) {
                        e.deletedIndices.push(m);
                        e.deletedItems.push(getItem(p, f, h[m], d, t));
                    }
                }
            }
        }
        if (e.deletedIndices.length > 0) {
            const s = t.onResolve(this.Es(e), (() => this.Ls(e)));
            if (t.isPromise(s)) {
                s.catch(rethrow);
            }
        } else {
            this.Ls(e);
        }
    }
    Cs() {
        const e = this.$controller.scope;
        let s = this.Ms;
        let n = this.ds;
        let r;
        if (n) {
            s = this.Ms = i.astEvaluate(this.gs, e, this.ks, null) ?? null;
            n = this.ds = !t.areEqual(this.items, s);
        }
        const l = this.us;
        if (this.$controller.isActive) {
            const t = n ? s : this.items;
            r = this.us = this.bs.resolve(t).getObserver?.(t);
            if (l !== r) {
                l?.unsubscribe(this);
                r?.subscribe(this);
            }
        } else {
            l?.unsubscribe(this);
            this.us = undefined;
        }
    }
    Ss(t) {
        const e = this.rs;
        this.ls = e.slice();
        const s = this.xs;
        const n = s.length;
        const r = this.rs = Array(s.length);
        const l = this.cs;
        const h = new Map;
        const a = this.$controller.scope;
        const c = this.ks;
        const u = this.forOf;
        const f = this.local;
        const d = this.ys;
        if (t === void 0) {
            const t = this.key;
            const e = t !== null;
            if (e) {
                const e = Array(n);
                if (typeof t === "string") {
                    for (let i = 0; i < n; ++i) {
                        e[i] = s[i][t];
                    }
                } else {
                    for (let r = 0; r < n; ++r) {
                        const n = createScope(s[r], u, a, c, f, d);
                        setItem(d, u.declaration, n, c, f, s[r]);
                        e[r] = i.astEvaluate(t, n, c, null);
                    }
                }
                for (let t = 0; t < n; ++t) {
                    r[t] = getScope(l, h, e[t], s[t], u, a, c, f, d);
                }
            } else {
                for (let t = 0; t < n; ++t) {
                    r[t] = getScope(l, h, s[t], s[t], u, a, c, f, d);
                }
            }
        } else {
            const i = e.length;
            for (let l = 0; l < n; ++l) {
                const n = t[l];
                if (n >= 0 && n < i) {
                    r[l] = e[n];
                } else {
                    r[l] = createScope(s[l], u, a, c, f, d);
                }
                setItem(d, u.declaration, r[l], c, f, s[l]);
            }
        }
        l.clear();
        this.cs = h;
    }
    Bs() {
        const e = this.items;
        if (t.isArray(e)) {
            this.xs = e.slice(0);
            return;
        }
        const s = [];
        this.bs.resolve(e).iterate(e, ((t, e) => {
            s[e] = t;
        }));
        this.xs = s;
    }
    As(e, s) {
        let i = void 0;
        let n;
        let r;
        let l;
        const {$controller: h, f: a, l: c, rs: u} = this;
        const f = s.length;
        const d = this.views = Array(f);
        for (let s = 0; s < f; ++s) {
            r = d[s] = a.create().setLocation(c);
            r.nodes.unlink();
            l = u[s];
            setContextualProperties(l.overrideContext, s, f);
            n = r.activate(e ?? r, h, l);
            if (t.isPromise(n)) {
                (i ??= []).push(n);
            }
        }
        if (i !== void 0) {
            return i.length === 1 ? i[0] : Promise.all(i);
        }
    }
    Rs(e) {
        let s = void 0;
        let i;
        let n;
        let r = 0;
        const {views: l, $controller: h} = this;
        const a = l.length;
        for (;a > r; ++r) {
            n = l[r];
            n.release();
            i = n.deactivate(e ?? n, h);
            if (t.isPromise(i)) {
                (s ?? (s = [])).push(i);
            }
        }
        if (s !== void 0) {
            return s.length === 1 ? s[0] : Promise.all(s);
        }
    }
    Es(e) {
        let s = void 0;
        let i;
        let n;
        const {$controller: r, views: l} = this;
        const h = e.deletedIndices.slice().sort(compareNumber);
        const a = h.length;
        let c = 0;
        for (;a > c; ++c) {
            n = l[h[c]];
            n.release();
            i = n.deactivate(n, r);
            if (t.isPromise(i)) {
                (s ?? (s = [])).push(i);
            }
        }
        c = 0;
        for (;a > c; ++c) {
            l.splice(h[c] - c, 1);
        }
        if (s !== void 0) {
            return s.length === 1 ? s[0] : Promise.all(s);
        }
    }
    Ls(e) {
        let s = void 0;
        let i;
        let n;
        let r = 0;
        const {$controller: l, f: h, l: a, views: c, rs: u, os: f} = this;
        const d = e.length;
        for (;d > r; ++r) {
            if (e[r] === -2) {
                n = h.create();
                c.splice(r, 0, n);
            }
        }
        if (c.length !== d) {
            throw createMappedError(814, [ c.length, d ]);
        }
        let p = 0;
        r = 0;
        for (;r < e.length; ++r) {
            if ((p = e[r]) !== -2) {
                c[r] = f[p];
            }
        }
        const m = longestIncreasingSubsequence(e);
        const g = m.length;
        let x;
        let v = g - 1;
        r = d - 1;
        for (;r >= 0; --r) {
            n = c[r];
            x = c[r + 1];
            n.nodes.link(x?.nodes ?? a);
            if (e[r] === -2) {
                n.setLocation(a);
                setContextualProperties(u[r].overrideContext, r, d);
                i = n.activate(n, l, u[r]);
                if (t.isPromise(i)) {
                    (s ?? (s = [])).push(i);
                }
            } else if (v < 0 || g === 1 || r !== m[v]) {
                setContextualProperties(n.scope.overrideContext, r, d);
                n.nodes.insertBefore(n.location);
            } else {
                setContextualProperties(n.scope.overrideContext, r, d);
                --v;
            }
        }
        if (s !== void 0) {
            return s.length === 1 ? s[0] : Promise.all(s);
        }
    }
    dispose() {
        this.views.forEach(dispose);
        this.views = void 0;
    }
    accept(t) {
        const {views: e} = this;
        if (e !== void 0) {
            for (let s = 0, i = e.length; s < i; ++s) {
                if (e[s].accept(t) === true) {
                    return true;
                }
            }
        }
    }
}

Repeat.$au = {
    type: ot,
    name: "repeat",
    isTemplateController: true,
    bindables: [ "items" ]
};

let ps = 16;

let ms = new Int32Array(ps);

let gs = new Int32Array(ps);

function longestIncreasingSubsequence(t) {
    const e = t.length;
    if (e > ps) {
        ps = e;
        ms = new Int32Array(e);
        gs = new Int32Array(e);
    }
    let s = 0;
    let i = 0;
    let n = 0;
    let r = 0;
    let l = 0;
    let h = 0;
    let a = 0;
    let c = 0;
    for (;r < e; r++) {
        i = t[r];
        if (i !== -2) {
            l = ms[s];
            n = t[l];
            if (n !== -2 && n < i) {
                gs[r] = l;
                ms[++s] = r;
                continue;
            }
            h = 0;
            a = s;
            while (h < a) {
                c = h + a >> 1;
                n = t[ms[c]];
                if (n !== -2 && n < i) {
                    h = c + 1;
                } else {
                    a = c;
                }
            }
            n = t[ms[h]];
            if (i < n || n === -2) {
                if (h > 0) {
                    gs[r] = ms[h - 1];
                }
                ms[h] = r;
            }
        }
    }
    r = ++s;
    const u = new Int32Array(r);
    i = ms[s - 1];
    while (s-- > 0) {
        u[s] = i;
        i = gs[i];
    }
    while (r-- > 0) ms[r] = 0;
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

const setContextualProperties = (t, e, s) => {
    t.$index = e;
    t.$length = s;
};

const xs = /*@__PURE__*/ O("IRepeatableHandlerResolver", (t => t.singleton(RepeatableHandlerResolver)));

class RepeatableHandlerResolver {
    constructor() {
        this.qs = t.resolve(t.all(vs));
    }
    resolve(t) {
        if (ys.handles(t)) {
            return ys;
        }
        if (ws.handles(t)) {
            return ws;
        }
        if (bs.handles(t)) {
            return bs;
        }
        if (ks.handles(t)) {
            return ks;
        }
        if (Cs.handles(t)) {
            return Cs;
        }
        const e = this.qs.find((e => e.handles(t)));
        if (e !== void 0) {
            return e;
        }
        return Bs;
    }
}

class ArrayLikeHandler {
    static register(t) {
        t.register($(vs, this));
    }
    handles(e) {
        return "length" in e && t.isNumber(e.length);
    }
    iterate(t, e) {
        for (let s = 0, i = t.length; s < i; ++s) {
            e(t[s], s, t);
        }
    }
}

const vs = /*@__PURE__*/ O("IRepeatableHandler");

const ys = {
    handles: t.isArray,
    getObserver: i.getCollectionObserver,
    iterate(t, e) {
        const s = t.length;
        let i = 0;
        for (;i < s; ++i) {
            e(t[i], i, t);
        }
    }
};

const ws = {
    handles: t.isSet,
    getObserver: i.getCollectionObserver,
    iterate(t, e) {
        let s = 0;
        let i;
        for (i of t.keys()) {
            e(i, s++, t);
        }
    }
};

const bs = {
    handles: t.isMap,
    getObserver: i.getCollectionObserver,
    iterate(t, e) {
        let s = 0;
        let i;
        for (i of t.entries()) {
            e(i, s++, t);
        }
    }
};

const ks = {
    handles: t.isNumber,
    iterate(t, e) {
        let s = 0;
        for (;s < t; ++s) {
            e(s, s, t);
        }
    }
};

const Cs = {
    handles: t => t == null,
    iterate() {}
};

const Bs = {
    handles(t) {
        return false;
    },
    iterate(t, e) {
        throw createMappedError(777, t);
    }
};

const setItem = (t, e, s, n, r, l) => {
    if (t) {
        i.astAssign(e, s, n, null, l);
    } else {
        s.bindingContext[r] = l;
    }
};

const getItem = (t, e, s, n, r) => t ? i.astEvaluate(e, s, n, null) : s.bindingContext[r];

const getKeyValue = (t, e, s, n, r, l) => {
    if (typeof e === "string") {
        const i = getItem(t, s, n, r, l);
        return i[e];
    }
    return i.astEvaluate(e, n, r, null);
};

const getScope = (t, e, s, n, r, l, h, a, c) => {
    let u = t.get(s);
    if (u === void 0) {
        u = createScope(n, r, l, h, a, c);
    } else if (u instanceof i.Scope) {
        t.delete(s);
    } else if (u.length === 1) {
        u = u[0];
        t.delete(s);
    } else {
        u = u.shift();
    }
    if (e.has(s)) {
        const t = e.get(s);
        if (t instanceof i.Scope) {
            e.set(s, [ t, u ]);
        } else {
            t.push(u);
        }
    } else {
        e.set(s, u);
    }
    setItem(c, r.declaration, u, h, a, n);
    return u;
};

const createScope = (t, e, s, n, r, l) => {
    if (l) {
        const r = i.Scope.fromParent(s, new i.BindingContext, new RepeatOverrideContext);
        i.astAssign(e.declaration, r, n, null, t);
    }
    return i.Scope.fromParent(s, new i.BindingContext(r, t), new RepeatOverrideContext);
};

const compareNumber = (t, e) => t - e;

class With {
    constructor() {
        this.view = t.resolve(Rt).create().setLocation(t.resolve(We));
    }
    valueChanged(t, e) {
        const s = this.$controller;
        const n = this.view.bindings;
        let r;
        let l = 0, h = 0;
        if (s.isActive && n != null) {
            r = i.Scope.fromParent(s.scope, t === void 0 ? {} : t);
            for (h = n.length; h > l; ++l) {
                n[l].bind(r);
            }
        }
    }
    attaching(t, e) {
        const {$controller: s, value: n} = this;
        const r = i.Scope.fromParent(s.scope, n === void 0 ? {} : n);
        return this.view.activate(t, s, r);
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
    type: ot,
    name: "with",
    isTemplateController: true,
    bindables: [ "value" ]
};

class Switch {
    constructor() {
        this.cases = [];
        this.activeCases = [];
        this.promise = void 0;
        this.f = t.resolve(Rt);
        this.l = t.resolve(We);
    }
    link(t, e, s, i) {
        this.view = this.f.create(this.$controller).setLocation(this.l);
    }
    attaching(t, e) {
        const s = this.view;
        const i = this.$controller;
        this.queue((() => s.activate(t, i, i.scope)));
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
        this.queue((() => this.Ds(t)));
    }
    Ds(e) {
        const s = e.isMatch(this.value);
        const i = this.activeCases;
        const n = i.length;
        if (!s) {
            if (n > 0 && i[0].id === e.id) {
                return this.Ps(null);
            }
            return;
        }
        if (n > 0 && i[0].id < e.id) {
            return;
        }
        const r = [];
        let l = e.fallThrough;
        if (!l) {
            r.push(e);
        } else {
            const t = this.cases;
            const s = t.indexOf(e);
            for (let e = s, i = t.length; e < i && l; e++) {
                const s = t[e];
                r.push(s);
                l = s.fallThrough;
            }
        }
        return t.onResolve(this.Ps(null, r), (() => {
            this.activeCases = r;
            return this.Is(null);
        }));
    }
    swap(e, s) {
        const i = [];
        let n = false;
        for (const t of this.cases) {
            if (n || t.isMatch(s)) {
                i.push(t);
                n = t.fallThrough;
            }
            if (i.length > 0 && !n) {
                break;
            }
        }
        const r = this.defaultCase;
        if (i.length === 0 && r !== void 0) {
            i.push(r);
        }
        return t.onResolve(this.activeCases.length > 0 ? this.Ps(e, i) : void 0, (() => {
            this.activeCases = i;
            if (i.length === 0) {
                return;
            }
            return this.Is(e);
        }));
    }
    Is(e) {
        const s = this.$controller;
        if (!s.isActive) {
            return;
        }
        const i = this.activeCases;
        const n = i.length;
        if (n === 0) {
            return;
        }
        const r = s.scope;
        if (n === 1) {
            return i[0].activate(e, r);
        }
        return t.onResolveAll(...i.map((t => t.activate(e, r))));
    }
    Ps(e, s = []) {
        const i = this.activeCases;
        const n = i.length;
        if (n === 0) {
            return;
        }
        if (n === 1) {
            const t = i[0];
            if (!s.includes(t)) {
                i.length = 0;
                return t.deactivate(e);
            }
            return;
        }
        return t.onResolve(t.onResolveAll(...i.reduce(((t, i) => {
            if (!s.includes(i)) {
                t.push(i.deactivate(e));
            }
            return t;
        }), [])), (() => {
            i.length = 0;
        }));
    }
    queue(e) {
        const s = this.promise;
        let i = void 0;
        i = this.promise = t.onResolve(t.onResolve(s, e), (() => {
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
    type: ot,
    name: "switch",
    isTemplateController: true,
    bindables: [ "value" ]
};

let Ss = 0;

const As = [ "value", {
    name: "fallThrough",
    mode: a,
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
        this.id = ++Ss;
        this.fallThrough = false;
        this.view = void 0;
        this.f = t.resolve(Rt);
        this.Ue = t.resolve(i.IObserverLocator);
        this.l = t.resolve(We);
        this._s = t.resolve(t.ILogger).scopeTo(`${this.constructor.name}-#${this.id}`);
    }
    link(t, e, s, i) {
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
    isMatch(e) {
        this._s.debug("isMatch()");
        const s = this.value;
        if (t.isArray(s)) {
            if (this.us === void 0) {
                this.us = this.Vs(s);
            }
            return s.includes(e);
        }
        return s === e;
    }
    valueChanged(e, s) {
        if (t.isArray(e)) {
            this.us?.unsubscribe(this);
            this.us = this.Vs(e);
        } else if (this.us !== void 0) {
            this.us.unsubscribe(this);
        }
        this.$switch.caseChanged(this);
    }
    handleCollectionChange() {
        this.$switch.caseChanged(this);
    }
    activate(t, e) {
        let s = this.view;
        if (s === void 0) {
            s = this.view = this.f.create().setLocation(this.l);
        }
        if (s.isActive) {
            return;
        }
        return s.activate(t ?? s, this.$controller, e);
    }
    deactivate(t) {
        const e = this.view;
        if (e === void 0 || !e.isActive) {
            return;
        }
        return e.deactivate(t ?? e, this.$controller);
    }
    dispose() {
        this.us?.unsubscribe(this);
        this.view?.dispose();
        this.view = void 0;
    }
    linkToSwitch(t) {
        t.cases.push(this);
    }
    Vs(t) {
        const e = this.Ue.getArrayObserver(t);
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
        bindables: As,
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
        bindables: As,
        isTemplateController: true
    }, DefaultCase);
})();

var Rs, Ts, Es;

class PromiseTemplateController {
    constructor() {
        this.preSettledTask = null;
        this.postSettledTask = null;
        this.f = t.resolve(Rt);
        this.l = t.resolve(We);
        this.p = t.resolve(it);
        this.logger = t.resolve(t.ILogger).scopeTo("promise.resolve");
    }
    link(t, e, s, i) {
        this.view = this.f.create(this.$controller).setLocation(this.l);
    }
    attaching(e, s) {
        const n = this.view;
        const r = this.$controller;
        return t.onResolve(n.activate(e, r, this.viewScope = i.Scope.fromParent(r.scope, {})), (() => this.swap(e)));
    }
    valueChanged(t, e) {
        if (!this.$controller.isActive) {
            return;
        }
        this.swap(null);
    }
    swap(e) {
        const s = this.value;
        if (!t.isPromise(s)) {
            return;
        }
        const i = this.p.domQueue;
        const n = this.fulfilled;
        const r = this.rejected;
        const h = this.pending;
        const a = this.viewScope;
        let c;
        const $swap = () => {
            void t.onResolveAll(c = (this.preSettledTask = i.queueTask((() => t.onResolveAll(n?.deactivate(e), r?.deactivate(e), h?.activate(e, a))))).result.catch((t => {
                if (!(t instanceof l.TaskAbortError)) throw t;
            })), s.then((l => {
                if (this.value !== s) {
                    return;
                }
                const fulfill = () => {
                    this.postSettlePromise = (this.postSettledTask = i.queueTask((() => t.onResolveAll(h?.deactivate(e), r?.deactivate(e), n?.activate(e, a, l))))).result;
                };
                if (this.preSettledTask.status === D) {
                    void c.then(fulfill);
                } else {
                    this.preSettledTask.cancel();
                    fulfill();
                }
            }), (l => {
                if (this.value !== s) {
                    return;
                }
                const reject = () => {
                    this.postSettlePromise = (this.postSettledTask = i.queueTask((() => t.onResolveAll(h?.deactivate(e), n?.deactivate(e), r?.activate(e, a, l))))).result;
                };
                if (this.preSettledTask.status === D) {
                    void c.then(reject);
                } else {
                    this.preSettledTask.cancel();
                    reject();
                }
            })));
        };
        if (this.postSettledTask?.status === D) {
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
    type: ot,
    name: "promise",
    isTemplateController: true,
    bindables: [ "value" ]
};

class PendingTemplateController {
    constructor() {
        this.view = void 0;
        this.f = t.resolve(Rt);
        this.l = t.resolve(We);
    }
    link(t, e, s, i) {
        getPromiseController(t).pending = this;
    }
    activate(t, e) {
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
    detaching(t) {
        return this.deactivate(t);
    }
    dispose() {
        this.view?.dispose();
        this.view = void 0;
    }
}

PendingTemplateController.$au = {
    type: ot,
    name: "pending",
    isTemplateController: true,
    bindables: {
        value: {
            mode: c
        }
    }
};

class FulfilledTemplateController {
    constructor() {
        this.view = void 0;
        this.f = t.resolve(Rt);
        this.l = t.resolve(We);
    }
    link(t, e, s, i) {
        getPromiseController(t).fulfilled = this;
    }
    activate(t, e, s) {
        this.value = s;
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
    detaching(t, e) {
        return this.deactivate(t);
    }
    dispose() {
        this.view?.dispose();
        this.view = void 0;
    }
}

FulfilledTemplateController.$au = {
    type: ot,
    name: "then",
    isTemplateController: true,
    bindables: {
        value: {
            mode: u
        }
    }
};

class RejectedTemplateController {
    constructor() {
        this.view = void 0;
        this.f = t.resolve(Rt);
        this.l = t.resolve(We);
    }
    link(t, e, s, i) {
        getPromiseController(t).rejected = this;
    }
    activate(t, e, s) {
        this.value = s;
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
    detaching(t, e) {
        return this.deactivate(t);
    }
    dispose() {
        this.view?.dispose();
        this.view = void 0;
    }
}

RejectedTemplateController.$au = {
    type: ot,
    name: "catch",
    isTemplateController: true,
    bindables: {
        value: {
            mode: u
        }
    }
};

function getPromiseController(t) {
    const e = t.parent;
    const s = e?.viewModel;
    if (s instanceof PromiseTemplateController) {
        return s;
    }
    throw createMappedError(813);
}

class PromiseAttributePattern {
    "promise.resolve"(t, s) {
        return new e.AttrSyntax(t, s, "promise", "bind");
    }
}

Rs = Symbol.metadata;

PromiseAttributePattern[Rs] = {
    [t.registrableMetadataKey]: e.AttributePattern.create([ {
        pattern: "promise.resolve",
        symbols: ""
    } ], PromiseAttributePattern)
};

class FulfilledAttributePattern {
    then(t, s) {
        return new e.AttrSyntax(t, s, "then", "from-view");
    }
}

Ts = Symbol.metadata;

FulfilledAttributePattern[Ts] = {
    [t.registrableMetadataKey]: e.AttributePattern.create([ {
        pattern: "then",
        symbols: ""
    } ], FulfilledAttributePattern)
};

class RejectedAttributePattern {
    catch(t, s) {
        return new e.AttrSyntax(t, s, "catch", "from-view");
    }
}

Es = Symbol.metadata;

RejectedAttributePattern[Es] = {
    [t.registrableMetadataKey]: e.AttributePattern.create([ {
        pattern: "catch",
        symbols: ""
    } ], RejectedAttributePattern)
};

class Focus {
    constructor() {
        this.Fs = false;
        this.Te = t.resolve($e);
        this.p = t.resolve(it);
    }
    binding() {
        this.valueChanged();
    }
    valueChanged() {
        if (this.$controller.isActive) {
            this.Hs();
        } else {
            this.Fs = true;
        }
    }
    attached() {
        if (this.Fs) {
            this.Fs = false;
            this.Hs();
        }
        this.Te.addEventListener("focus", this);
        this.Te.addEventListener("blur", this);
    }
    detaching() {
        const t = this.Te;
        t.removeEventListener("focus", this);
        t.removeEventListener("blur", this);
    }
    handleEvent(t) {
        if (t.type === "focus") {
            this.value = true;
        } else if (!this.Os) {
            this.value = false;
        }
    }
    Hs() {
        const t = this.Te;
        const e = this.Os;
        const s = this.value;
        if (s && !e) {
            t.focus();
        } else if (!s && e) {
            t.blur();
        }
    }
    get Os() {
        return this.Te === this.p.document.activeElement;
    }
}

Focus.$au = {
    type: ot,
    name: "focus",
    bindables: {
        value: {
            mode: f
        }
    }
};

class Portal {
    constructor() {
        this.position = "beforeend";
        this.strict = false;
        const e = t.resolve(Rt);
        const s = t.resolve(We);
        const i = t.resolve(it);
        this.p = i;
        this.$s = i.document.createElement("div");
        (this.view = e.create()).setLocation(this.Ns = Tt(i));
        setEffectiveParentNode(this.view.nodes, s);
    }
    attaching(t) {
        if (this.callbackContext == null) {
            this.callbackContext = this.$controller.scope.bindingContext;
        }
        const e = this.$s = this.Ws();
        this.js(e, this.position);
        return this.zs(t, e);
    }
    detaching(t) {
        return this.Us(t, this.$s);
    }
    targetChanged() {
        const {$controller: e} = this;
        if (!e.isActive) {
            return;
        }
        const s = this.Ws();
        if (this.$s === s) {
            return;
        }
        this.$s = s;
        const i = t.onResolve(this.Us(null, s), (() => {
            this.js(s, this.position);
            return this.zs(null, s);
        }));
        if (t.isPromise(i)) {
            i.catch(rethrow);
        }
    }
    positionChanged() {
        const {$controller: e, $s: s} = this;
        if (!e.isActive) {
            return;
        }
        const i = t.onResolve(this.Us(null, s), (() => {
            this.js(s, this.position);
            return this.zs(null, s);
        }));
        if (t.isPromise(i)) {
            i.catch(rethrow);
        }
    }
    zs(e, s) {
        const {activating: i, callbackContext: n, view: r} = this;
        return t.onResolve(i?.call(n, s, r), (() => this.Gs(e, s)));
    }
    Gs(e, s) {
        const {$controller: i, view: n} = this;
        if (e === null) {
            n.nodes.insertBefore(this.Ns);
        } else {
            return t.onResolve(n.activate(e ?? n, i, i.scope), (() => this.Ks(s)));
        }
        return this.Ks(s);
    }
    Ks(t) {
        const {activated: e, callbackContext: s, view: i} = this;
        return e?.call(s, t, i);
    }
    Us(e, s) {
        const {deactivating: i, callbackContext: n, view: r} = this;
        return t.onResolve(i?.call(n, s, r), (() => this.Xs(e, s)));
    }
    Xs(e, s) {
        const {$controller: i, view: n} = this;
        if (e === null) {
            n.nodes.remove();
        } else {
            return t.onResolve(n.deactivate(e, i), (() => this.Qs(s)));
        }
        return this.Qs(s);
    }
    Qs(e) {
        const {deactivated: s, callbackContext: i, view: n} = this;
        return t.onResolve(s?.call(i, e, n), (() => this.Ys()));
    }
    Ws() {
        const e = this.p;
        const s = e.document;
        let i = this.target;
        let n = this.renderContext;
        if (i === "") {
            if (this.strict) {
                throw createMappedError(811);
            }
            return s.body;
        }
        if (t.isString(i)) {
            let r = s;
            if (t.isString(n)) {
                n = s.querySelector(n);
            }
            if (n instanceof e.Node) {
                r = n;
            }
            i = r.querySelector(i);
        }
        if (i instanceof e.Node) {
            return i;
        }
        if (i == null) {
            if (this.strict) {
                throw createMappedError(812);
            }
            return s.body;
        }
        return i;
    }
    Ys() {
        this.Ns.remove();
        this.Ns.$start.remove();
    }
    js(t, e) {
        const s = this.Ns;
        const i = s.$start;
        const n = t.parentNode;
        const r = [ i, s ];
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
    type: ot,
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

let Ls;

class AuSlot {
    constructor() {
        this.Zs = null;
        this.Js = null;
        this.Zt = false;
        this.expose = null;
        this.slotchange = null;
        this.ti = new Set;
        this.us = null;
        const s = t.resolve(Ve);
        const i = t.resolve(We);
        const n = t.resolve(e.IInstruction);
        const r = t.resolve(le);
        const l = this.name = n.data.name;
        const h = n.projections?.[Et];
        const a = s.instruction?.projections?.[l];
        const c = s.controller.container;
        let u;
        let f;
        if (a == null) {
            f = c.createChild({
                inheritParentResources: true
            });
            u = r.getViewFactory(h ?? (Ls ??= CustomElementDefinition.create({
                name: "au-slot-empty-template",
                template: "",
                needsCompile: false
            })), f);
            this.ei = false;
        } else {
            f = c.createChild();
            f.useResources(s.parent.controller.container);
            registerResolver(f, Ve, new t.InstanceProvider(void 0, s.parent));
            u = r.getViewFactory(a, f);
            this.ei = true;
            this.si = c.getAll(qt, false)?.filter((t => t.slotName === "*" || t.slotName === l)) ?? t.emptyArray;
        }
        this.ii = (this.si ??= t.emptyArray).length > 0;
        this.ni = s;
        this.view = u.create().setLocation(this.l = i);
    }
    get nodes() {
        const t = [];
        const e = this.l;
        let s = e.$start.nextSibling;
        while (s != null && s !== e) {
            if (s.nodeType !== 8) {
                t.push(s);
            }
            s = s.nextSibling;
        }
        return t;
    }
    subscribe(t) {
        this.ti.add(t);
    }
    unsubscribe(t) {
        this.ti.delete(t);
    }
    binding(t, e) {
        this.Zs = e.scope;
        while (e.vmKind === "synthetic" && e.parent?.viewModel instanceof AuSlot) {
            e = e.parent.parent;
        }
        const s = e.scope.bindingContext;
        let n;
        if (this.ei) {
            n = this.ni.controller.scope.parent;
            (this.Js = i.Scope.fromParent(n, n.bindingContext)).overrideContext.$host = this.expose ?? s;
        }
    }
    attaching(e, s) {
        return t.onResolve(this.view.activate(e, this.$controller, this.ei ? this.Js : this.Zs), (() => {
            if (this.ii || t.isFunction(this.slotchange)) {
                this.si.forEach((t => t.watch(this)));
                this.Qe();
                this.oi();
                this.Zt = true;
            }
        }));
    }
    detaching(t, e) {
        this.Zt = false;
        this.ri();
        this.si.forEach((t => t.unwatch(this)));
        return this.view.deactivate(t, this.$controller);
    }
    exposeChanged(t) {
        if (this.ei && this.Js != null) {
            this.Js.overrideContext.$host = t;
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
    Qe() {
        if (this.us != null) {
            return;
        }
        const t = this.l;
        const e = t.parentElement;
        if (e == null) {
            return;
        }
        (this.us = createMutationObserver(e, (e => {
            if (isMutationWithinLocation(t, e)) {
                this.oi();
            }
        }))).observe(e, {
            childList: true
        });
    }
    ri() {
        this.us?.disconnect();
        this.us = null;
    }
    oi() {
        const t = this.nodes;
        const e = new Set(this.ti);
        let s;
        if (this.Zt) {
            this.slotchange?.call(void 0, this.name, t);
        }
        for (s of e) {
            s.handleSlotChange(this, t);
        }
    }
}

AuSlot.$au = {
    type: Ye,
    name: "au-slot",
    template: null,
    containerless: true,
    processContent(t, e, s) {
        s.name = t.getAttribute("name") ?? Et;
        let i = t.firstChild;
        let n = null;
        while (i !== null) {
            n = i.nextSibling;
            if (isElement(i) && i.hasAttribute(Lt)) {
                t.removeChild(i);
            }
            i = n;
        }
    },
    bindables: [ "expose", "slotchange" ]
};

const comparePosition = (t, e) => t.compareDocumentPosition(e);

const isMutationWithinLocation = (t, e) => {
    for (const {addedNodes: s, removedNodes: i, nextSibling: n} of e) {
        let e = 0;
        let r = s.length;
        let l;
        for (;e < r; ++e) {
            l = s[e];
            if (comparePosition(t.$start, l) === 4 && comparePosition(t, l) === 2) {
                return true;
            }
        }
        if (i.length > 0) {
            if (n != null && comparePosition(t.$start, n) === 4 && comparePosition(t, n) === 2) {
                return true;
            }
        }
    }
};

class AuCompose {
    constructor() {
        this.scopeBehavior = "auto";
        this.li = void 0;
        this.tag = null;
        this.c = t.resolve(t.IContainer);
        this.parent = t.resolve(_e);
        this.hi = t.resolve($e);
        this.l = t.resolve(We);
        this.p = t.resolve(it);
        this.r = t.resolve(le);
        this.ai = t.resolve(e.IInstruction);
        this.ci = t.resolve(t.transient(CompositionContextFactory, null));
        this.gt = t.resolve(e.ITemplateCompiler);
        this.J = t.resolve(Ve);
        this.ep = t.resolve(r.IExpressionParser);
        this.oL = t.resolve(i.IObserverLocator);
    }
    get composing() {
        return this.ui;
    }
    get composition() {
        return this.li;
    }
    attaching(e, s) {
        return this.ui = t.onResolve(this.queue(new ChangeInfo(this.template, this.component, this.model, void 0), e), (t => {
            if (this.ci.fi(t)) {
                this.ui = void 0;
            }
        }));
    }
    detaching(e) {
        const s = this.li;
        const i = this.ui;
        this.ci.invalidate();
        this.li = this.ui = void 0;
        return t.onResolve(i, (() => s?.deactivate(e)));
    }
    propertyChanged(e) {
        if (e === "composing" || e === "composition") return;
        if (e === "model" && this.li != null) {
            this.li.update(this.model);
            return;
        }
        if (e === "tag" && this.li?.controller.vmKind === Se) {
            return;
        }
        this.ui = t.onResolve(this.ui, (() => t.onResolve(this.queue(new ChangeInfo(this.template, this.component, this.model, e), void 0), (t => {
            if (this.ci.fi(t)) {
                this.ui = void 0;
            }
        }))));
    }
    queue(e, s) {
        const i = this.ci;
        const n = this.li;
        return t.onResolve(i.create(e), (e => {
            if (i.fi(e)) {
                return t.onResolve(this.compose(e), (r => {
                    if (i.fi(e)) {
                        return t.onResolve(r.activate(s), (() => {
                            if (i.fi(e)) {
                                this.li = r;
                                return t.onResolve(n?.deactivate(s), (() => e));
                            } else {
                                return t.onResolve(r.controller.deactivate(r.controller, this.$controller), (() => {
                                    r.controller.dispose();
                                    return e;
                                }));
                            }
                        }));
                    }
                    r.controller.dispose();
                    return e;
                }));
            }
            return e;
        }));
    }
    compose(e) {
        const {di: s, pi: n, mi: r} = e.change;
        const {c: l, $controller: h, l: a, ai: c} = this;
        const u = this.gi(this.J.controller.container, n);
        const f = l.createChild();
        const d = this.p.document.createElement(u == null ? this.tag ?? "div" : u.name);
        a.parentNode.insertBefore(d, a);
        let p;
        if (u == null) {
            p = this.tag == null ? convertToRenderLocation(d) : null;
        } else {
            p = u.containerless ? convertToRenderLocation(d) : null;
        }
        const removeCompositionHost = () => {
            d.remove();
            if (p != null) {
                let t = p.$start.nextSibling;
                let e = null;
                while (t !== null && t !== p) {
                    e = t.nextSibling;
                    t.remove();
                    t = e;
                }
                p.$start?.remove();
                p.remove();
            }
        };
        const m = this.xi(f, typeof n === "string" ? u.Type : n, d, p);
        const compose = () => {
            const n = c.captures ?? t.emptyArray;
            if (u !== null) {
                const s = u.capture;
                const [i, r] = n.reduce(((e, i) => {
                    const n = !(i.target in u.bindables) && (s === true || t.isFunction(s) && !!s(i.target));
                    e[n ? 0 : 1].push(i);
                    return e;
                }), [ [], [] ]);
                const l = Controller.$el(f, m, d, {
                    projections: c.projections,
                    captures: i
                }, u, p);
                this.yi(d, u, r).forEach((t => l.addBinding(t)));
                return new CompositionController(l, (t => l.activate(t ?? l, h, h.scope.parent)), (e => t.onResolve(l.deactivate(e ?? l, h), removeCompositionHost)), (t => m.activate?.(t)), e);
            } else {
                const r = CustomElementDefinition.create({
                    name: es.generateName(),
                    template: s
                });
                const l = this.r.getViewFactory(r, f);
                const a = Controller.$view(l, h);
                const c = this.scopeBehavior === "auto" ? i.Scope.fromParent(this.parent.scope, m) : i.Scope.create(m);
                a.setHost(d);
                if (p == null) {
                    this.yi(d, r, n).forEach((t => a.addBinding(t)));
                } else {
                    a.setLocation(p);
                }
                return new CompositionController(a, (t => a.activate(t ?? a, h, c)), (e => t.onResolve(a.deactivate(e ?? a, h), removeCompositionHost)), (t => m.activate?.(t)), e);
            }
        };
        if ("activate" in m) {
            return t.onResolve(m.activate(r), (() => compose()));
        } else {
            return compose();
        }
    }
    xi(e, s, i, n) {
        if (s == null) {
            return new EmptyComponent;
        }
        if (typeof s === "object") {
            return s;
        }
        const r = this.p;
        registerHostNode(e, i, r);
        registerResolver(e, We, new t.InstanceProvider("IRenderLocation", n));
        const l = e.invoke(s);
        registerResolver(e, s, new t.InstanceProvider("au-compose.component", l));
        return l;
    }
    gi(e, s) {
        if (typeof s === "string") {
            const t = es.find(e, s);
            if (t == null) {
                throw createMappedError(806, s);
            }
            return t;
        }
        const i = t.isFunction(s) ? s : s?.constructor;
        return es.isType(i, void 0) ? es.getDefinition(i, null) : null;
    }
    yi(t, e, s) {
        const i = new HydrationContext(this.$controller, {
            projections: null,
            captures: s
        }, this.J.parent);
        return SpreadBinding.create(i, t, e, this.r, this.gt, this.p, this.ep, this.oL);
    }
}

AuCompose.$au = {
    type: Ye,
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
        mode: u
    }, {
        name: "composition",
        mode: u
    }, "tag" ]
};

class EmptyComponent {}

class CompositionContextFactory {
    constructor() {
        this.id = 0;
    }
    fi(t) {
        return t.id === this.id;
    }
    create(e) {
        return t.onResolve(e.load(), (t => new CompositionContext(++this.id, t)));
    }
    invalidate() {
        this.id++;
    }
}

class ChangeInfo {
    constructor(t, e, s, i) {
        this.di = t;
        this.pi = e;
        this.mi = s;
        this.wi = i;
    }
    load() {
        if (t.isPromise(this.di) || t.isPromise(this.pi)) {
            return Promise.all([ this.di, this.pi ]).then((([t, e]) => new LoadedChangeInfo(t, e, this.mi, this.wi)));
        } else {
            return new LoadedChangeInfo(this.di, this.pi, this.mi, this.wi);
        }
    }
}

class LoadedChangeInfo {
    constructor(t, e, s, i) {
        this.di = t;
        this.pi = e;
        this.mi = s;
        this.wi = i;
    }
}

class CompositionContext {
    constructor(t, e) {
        this.id = t;
        this.change = e;
    }
}

class CompositionController {
    constructor(t, e, s, i, n) {
        this.controller = t;
        this.start = e;
        this.stop = s;
        this.update = i;
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

const Ms = /*@__PURE__*/ O("ISanitizer", (t => t.singleton(class {
    sanitize() {
        throw createMappedError(99, "sanitize");
    }
})));

class SanitizeValueConverter {
    constructor() {
        this.bi = t.resolve(Ms);
    }
    toView(t) {
        if (t == null) {
            return null;
        }
        return this.bi.sanitize(t);
    }
}

SanitizeValueConverter.$au = {
    type: ct,
    name: "sanitize"
};

class Show {
    constructor() {
        this.el = t.resolve($e);
        this.p = t.resolve(it);
        this.ki = false;
        this.L = null;
        this.$val = "";
        this.$prio = "";
        this.update = () => {
            this.L = null;
            if (Boolean(this.value) !== this.Ci) {
                if (this.Ci === this.Bi) {
                    this.Ci = !this.Bi;
                    this.$val = this.el.style.getPropertyValue("display");
                    this.$prio = this.el.style.getPropertyPriority("display");
                    this.el.style.setProperty("display", "none", "important");
                } else {
                    this.Ci = this.Bi;
                    this.el.style.setProperty("display", this.$val, this.$prio);
                    if (this.el.getAttribute("style") === "") {
                        this.el.removeAttribute("style");
                    }
                }
            }
        };
        const s = t.resolve(e.IInstruction);
        this.Ci = this.Bi = s.alias !== "hide";
    }
    binding() {
        this.ki = true;
        this.update();
    }
    detaching() {
        this.ki = false;
        this.L?.cancel();
        this.L = null;
    }
    valueChanged() {
        if (this.ki && this.L === null) {
            this.L = this.p.domQueue.queueTask(this.update);
        }
    }
}

Show.$au = {
    type: ot,
    name: "show",
    bindables: [ "value" ],
    aliases: [ "hide" ]
};

const qs = [ rs, i.DirtyChecker, NodeObserverLocator ];

const Ds = [ e.RefAttributePattern, e.DotSeparatedAttributePattern, e.EventAttributePattern, At ];

const Ps = [ e.AtPrefixedTriggerAttributePattern, e.ColonPrefixedBindAttributePattern ];

const Is = [ e.DefaultBindingCommand, e.OneTimeBindingCommand, e.FromViewBindingCommand, e.ToViewBindingCommand, e.TwoWayBindingCommand, e.ForBindingCommand, e.RefBindingCommand, e.TriggerBindingCommand, e.CaptureBindingCommand, e.ClassBindingCommand, e.StyleBindingCommand, e.AttrBindingCommand, e.SpreadValueBindingCommand ];

const _s = [ DebounceBindingBehavior, OneTimeBindingBehavior, ToViewBindingBehavior, FromViewBindingBehavior, SignalBindingBehavior, ThrottleBindingBehavior, TwoWayBindingBehavior, SanitizeValueConverter, If, Else, Repeat, With, Switch, Case, DefaultCase, PromiseTemplateController, PendingTemplateController, FulfilledTemplateController, RejectedTemplateController, PromiseAttributePattern, FulfilledAttributePattern, RejectedAttributePattern, AttrBindingBehavior, SelfBindingBehavior, UpdateTriggerBindingBehavior, AuCompose, Portal, Focus, Show, AuSlot ];

const Vs = [ Nt, Wt, Ot, $t, It, _t, Vt, Ft, Ht, Ut, Yt, Gt, Kt, Xt, Qt, jt, Zt, Jt ];

const Fs = /*@__PURE__*/ createConfiguration(t.noop);

function createConfiguration(t) {
    return {
        optionsProvider: t,
        register(e) {
            const s = {
                coercingOptions: {
                    enableCoercion: false,
                    coerceNullish: false
                }
            };
            t(s);
            return e.register(W(i.ICoercionConfiguration, s.coercingOptions), r.ExpressionParser, ...qs, ..._s, ...Ds, ...Is, ...Vs);
        },
        customize(e) {
            return createConfiguration(e ?? t);
        }
    };
}

function children(e, s) {
    if (!children.mixed) {
        children.mixed = true;
        i.subscriberCollection(ChildrenBinding, null);
        lifecycleHooks()(ChildrenLifecycleHooks, null);
    }
    let n;
    const r = x("dependencies");
    function decorator(t, e) {
        switch (e.kind) {
          case "field":
            n.name = e.name;
            break;
        }
        const s = e.metadata[r] ??= [];
        s.push(new ChildrenLifecycleHooks(n ?? {}));
    }
    if (arguments.length > 1) {
        n = {};
        decorator(e, s);
        return;
    } else if (t.isString(e)) {
        n = {
            query: e
        };
        return decorator;
    }
    n = e === void 0 ? {} : e;
    return decorator;
}

children.mixed = false;

class ChildrenBinding {
    constructor(t, e, s, i, n, r) {
        this.Si = void 0;
        this.isBound = false;
        this.obj = e;
        this.cb = s;
        this.X = i;
        this.Ai = n;
        this.Ri = r;
        this.us = createMutationObserver(this.hi = t, (() => {
            this.Ti();
        }));
    }
    getValue() {
        return this.isBound ? this.Si : this.Ei();
    }
    setValue(t) {}
    bind() {
        if (this.isBound) {
            return;
        }
        this.isBound = true;
        this.us.observe(this.hi, {
            childList: true
        });
        this.Si = this.Ei();
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        this.us.takeRecords();
        this.us.disconnect();
        this.Si = t.emptyArray;
    }
    Ti() {
        this.Si = this.Ei();
        this.cb?.call(this.obj);
        this.subs.notify(this.Si, undefined);
    }
    get() {
        throw createMappedError(99, "get");
    }
    Ei() {
        const t = this.X;
        const e = this.Ai;
        const s = this.Ri;
        const i = t === "$all" ? this.hi.childNodes : this.hi.querySelectorAll(`:scope > ${t}`);
        const n = i.length;
        const r = [];
        const l = {
            optional: true
        };
        let h;
        let a;
        let c = 0;
        let u;
        while (n > c) {
            u = i[c];
            h = findElementControllerFor(u, l);
            a = h?.viewModel ?? null;
            if (e == null ? true : e(u, a)) {
                r.push(s == null ? a ?? u : s(u, a));
            }
            ++c;
        }
        return r;
    }
}

class ChildrenLifecycleHooks {
    constructor(t) {
        this.Y = t;
    }
    register(t) {
        W(ht, this).register(t);
    }
    hydrating(t, e) {
        const s = this.Y;
        const i = s.query ?? "*";
        const n = new ChildrenBinding(e.host, t, t[s.callback ?? `${y(s.name)}Changed`], i, s.filter, s.map);
        if (/[\s>]/.test(i)) {
            throw createMappedError(9989, i);
        }
        R(t, s.name, {
            enumerable: true,
            configurable: true,
            get: C((() => n.getValue()), {
                getObserver: () => n
            }),
            set: () => {}
        });
        e.addBinding(n);
    }
}

exports.BindingCommand = e.BindingCommand;

exports.BindingMode = e.BindingMode;

exports.AdoptedStyleSheetsStyles = AdoptedStyleSheetsStyles;

exports.AppRoot = AppRoot;

exports.AppTask = st;

exports.ArrayLikeHandler = ArrayLikeHandler;

exports.AttrBindingBehavior = AttrBindingBehavior;

exports.AttrMapper = AttrMapper;

exports.AttributeBinding = AttributeBinding;

exports.AttributeBindingRenderer = Yt;

exports.AttributeNSAccessor = AttributeNSAccessor;

exports.AuCompose = AuCompose;

exports.AuSlot = AuSlot;

exports.AuSlotsInfo = AuSlotsInfo;

exports.Aurelia = Aurelia;

exports.Bindable = F;

exports.BindableDefinition = BindableDefinition;

exports.BindingBehavior = K;

exports.BindingBehaviorDefinition = BindingBehaviorDefinition;

exports.BindingModeBehavior = BindingModeBehavior;

exports.BindingTargetSubscriber = BindingTargetSubscriber;

exports.CSSModulesProcessorRegistry = CSSModulesProcessorRegistry;

exports.Case = Case;

exports.CheckedObserver = CheckedObserver;

exports.ChildrenBinding = ChildrenBinding;

exports.ClassAttributeAccessor = ClassAttributeAccessor;

exports.ComputedWatcher = ComputedWatcher;

exports.ContentBinding = ContentBinding;

exports.Controller = Controller;

exports.CustomAttribute = lt;

exports.CustomAttributeDefinition = CustomAttributeDefinition;

exports.CustomAttributeRenderer = Vt;

exports.CustomElement = es;

exports.CustomElementDefinition = CustomElementDefinition;

exports.CustomElementRenderer = _t;

exports.DataAttributeAccessor = DataAttributeAccessor;

exports.DebounceBindingBehavior = DebounceBindingBehavior;

exports.DefaultBindingLanguage = Is;

exports.DefaultBindingSyntax = Ds;

exports.DefaultCase = DefaultCase;

exports.DefaultComponents = qs;

exports.DefaultRenderers = Vs;

exports.DefaultResources = _s;

exports.Else = Else;

exports.EventModifier = EventModifier;

exports.EventModifierRegistration = At;

exports.ExpressionWatcher = ExpressionWatcher;

exports.FlushQueue = FlushQueue;

exports.Focus = Focus;

exports.FragmentNodeSequence = FragmentNodeSequence;

exports.FromViewBindingBehavior = FromViewBindingBehavior;

exports.FulfilledTemplateController = FulfilledTemplateController;

exports.IAppRoot = is;

exports.IAppTask = et;

exports.IAuSlotWatcher = qt;

exports.IAuSlotsInfo = Mt;

exports.IAurelia = ns;

exports.IController = _e;

exports.IEventModifier = St;

exports.IEventTarget = Ne;

exports.IFlushQueue = mt;

exports.IHistory = Ke;

exports.IHydrationContext = Ve;

exports.IKeyMapping = Bt;

exports.ILifecycleHooks = ht;

exports.IListenerBindingOptions = zt;

exports.ILocation = Ge;

exports.IModifiedEventHandlerCreator = Ct;

exports.INode = $e;

exports.IPlatform = it;

exports.IRenderLocation = We;

exports.IRenderer = Pt;

exports.IRendering = le;

exports.IRepeatableHandler = vs;

exports.IRepeatableHandlerResolver = xs;

exports.ISVGAnalyzer = os;

exports.ISanitizer = Ms;

exports.IShadowDOMGlobalStyles = ce;

exports.IShadowDOMStyleFactory = he;

exports.IShadowDOMStyles = ae;

exports.ISignaler = Z;

exports.IViewFactory = Rt;

exports.IWindow = Ue;

exports.If = If;

exports.InterpolationBinding = InterpolationBinding;

exports.InterpolationBindingRenderer = $t;

exports.InterpolationPartBinding = InterpolationPartBinding;

exports.IteratorBindingRenderer = Wt;

exports.LetBinding = LetBinding;

exports.LetElementRenderer = Ht;

exports.LifecycleHooks = at;

exports.LifecycleHooksDefinition = LifecycleHooksDefinition;

exports.LifecycleHooksEntry = LifecycleHooksEntry;

exports.ListenerBinding = ListenerBinding;

exports.ListenerBindingOptions = ListenerBindingOptions;

exports.ListenerBindingRenderer = Ut;

exports.MountTarget = be;

exports.NodeObserverLocator = NodeObserverLocator;

exports.NoopSVGAnalyzer = NoopSVGAnalyzer;

exports.OneTimeBindingBehavior = OneTimeBindingBehavior;

exports.PendingTemplateController = PendingTemplateController;

exports.Portal = Portal;

exports.PromiseTemplateController = PromiseTemplateController;

exports.PropertyBinding = PropertyBinding;

exports.PropertyBindingRenderer = Nt;

exports.RefBinding = RefBinding;

exports.RefBindingRenderer = Ot;

exports.RejectedTemplateController = RejectedTemplateController;

exports.Rendering = Rendering;

exports.Repeat = Repeat;

exports.RuntimeTemplateCompilerImplementation = rs;

exports.SVGAnalyzer = SVGAnalyzer;

exports.SanitizeValueConverter = SanitizeValueConverter;

exports.SelectValueObserver = SelectValueObserver;

exports.SelfBindingBehavior = SelfBindingBehavior;

exports.SetAttributeRenderer = Gt;

exports.SetClassAttributeRenderer = Kt;

exports.SetPropertyRenderer = It;

exports.SetStyleAttributeRenderer = Xt;

exports.ShadowDOMRegistry = ShadowDOMRegistry;

exports.ShortHandBindingSyntax = Ps;

exports.SignalBindingBehavior = SignalBindingBehavior;

exports.SpreadRenderer = Zt;

exports.StandardConfiguration = Fs;

exports.State = Ie;

exports.StyleAttributeAccessor = StyleAttributeAccessor;

exports.StyleConfiguration = ue;

exports.StyleElementStyles = StyleElementStyles;

exports.StylePropertyBindingRenderer = Qt;

exports.Switch = Switch;

exports.TemplateControllerRenderer = Ft;

exports.TextBindingRenderer = jt;

exports.ThrottleBindingBehavior = ThrottleBindingBehavior;

exports.ToViewBindingBehavior = ToViewBindingBehavior;

exports.TwoWayBindingBehavior = TwoWayBindingBehavior;

exports.UpdateTriggerBindingBehavior = UpdateTriggerBindingBehavior;

exports.ValueAttributeObserver = ValueAttributeObserver;

exports.ValueConverter = ft;

exports.ValueConverterDefinition = ValueConverterDefinition;

exports.ViewFactory = ViewFactory;

exports.Watch = nt;

exports.With = With;

exports.alias = alias;

exports.bindable = bindable;

exports.bindingBehavior = bindingBehavior;

exports.capture = capture;

exports.children = children;

exports.coercer = coercer;

exports.containerless = containerless;

exports.convertToRenderLocation = convertToRenderLocation;

exports.cssModules = cssModules;

exports.customAttribute = customAttribute;

exports.customElement = customElement;

exports.getEffectiveParentNode = getEffectiveParentNode;

exports.getRef = getRef;

exports.isCustomElementController = isCustomElementController;

exports.isCustomElementViewModel = isCustomElementViewModel;

exports.isRenderLocation = isRenderLocation;

exports.lifecycleHooks = lifecycleHooks;

exports.mixinAstEvaluator = pt;

exports.mixinUseScope = dt;

exports.mixingBindingLimited = gt;

exports.processContent = processContent;

exports.registerAliases = registerAliases;

exports.registerHostNode = registerHostNode;

exports.renderer = renderer;

exports.setEffectiveParentNode = setEffectiveParentNode;

exports.setRef = setRef;

exports.shadowCSS = shadowCSS;

exports.slotted = slotted;

exports.templateController = templateController;

exports.useShadowDOM = useShadowDOM;

exports.valueConverter = valueConverter;

exports.watch = watch;
//# sourceMappingURL=index.cjs.map
