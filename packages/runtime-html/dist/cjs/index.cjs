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

class Refs {}

const nt = /*@__PURE__*/ (() => {
    const t = new WeakMap;
    let e = false;
    return new class {
        get hideProp() {
            return e;
        }
        set hideProp(t) {
            e = t;
        }
        get(e, s) {
            return t.get(e)?.[s] ?? null;
        }
        set(s, i, n) {
            const r = t.get(s) ?? (t.set(s, new Refs), t.get(s));
            if (i in r) {
                throw new Error(`Node already associated with a controller, remove the ref "${i}" first before associating with another controller`);
            }
            if (!e) {
                s.$au ??= r;
            }
            return r[i] = n;
        }
    };
})();

const ot = /*@__PURE__*/ O("INode");

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
            rt.add(t, l);
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

const rt = /*@__PURE__*/ (() => {
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
        return new CustomAttributeDefinition(i, t.firstDefined(getAttributeAnnotation(i, "name"), n), t.mergeArrays(getAttributeAnnotation(i, "aliases"), r.aliases, i.aliases), getAttributeKeyFrom(n), t.isString(l) ? e.BindingMode[l] ?? h : l, t.firstDefined(getAttributeAnnotation(i, "isTemplateController"), r.isTemplateController, i.isTemplateController, false), F.from(...F.getAll(i), getAttributeAnnotation(i, "bindables"), i.bindables, r.bindables), t.firstDefined(getAttributeAnnotation(i, "noMultiBindings"), r.noMultiBindings, i.noMultiBindings, false), t.mergeArrays(rt.getDefinitions(i), i.watches), t.mergeArrays(getAttributeAnnotation(i, "dependencies"), r.dependencies, i.dependencies), t.firstDefined(getAttributeAnnotation(i, "containerStrategy"), r.containerStrategy, i.containerStrategy, "reuse"));
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

const lt = "custom-attribute";

const ht = /*@__PURE__*/ t.getResourceKeyFor(lt);

const getAttributeKeyFrom = t => `${ht}:${t}`;

const getAttributeAnnotation = (t, e) => d(x(e), t);

const isAttributeType = e => t.isFunction(e) && (p(ht, e) || e.$au?.type === lt);

const findAttributeControllerFor = (t, e) => nt.get(t, getAttributeKeyFrom(e)) ?? void 0;

const defineAttribute = (e, s) => {
    const i = CustomAttributeDefinition.create(e, s);
    const n = i.Type;
    m(i, n, ht, t.resourceBaseName);
    return n;
};

const getAttributeDefinition = t => {
    const e = d(ht, t) ?? getDefinitionFromStaticAu(t, lt, CustomAttributeDefinition.create);
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
        const t = nt.get(r, i);
        if (t?.is(n)) {
            return t;
        }
        r = getEffectiveParentNode(r);
    }
    return null;
};

const at = /*@__PURE__*/ k({
    name: ht,
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
        const s = t.find(lt, e);
        return s === null ? null : d(ht, s) ?? getDefinitionFromStaticAu(s, lt, CustomAttributeDefinition.create) ?? null;
    }
});

const ct = /*@__PURE__*/ O("ILifecycleHooks");

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

const ut = /*@__PURE__*/ (() => {
    const t = new WeakMap;
    const e = new WeakMap;
    return k({
        define(t, s) {
            const i = LifecycleHooksDefinition.create(t, s);
            const n = i.Type;
            e.set(n, i);
            return {
                register(t) {
                    $(ct, n).register(t);
                }
            };
        },
        resolve(s) {
            let i = t.get(s);
            if (i === void 0) {
                t.set(s, i = new LifecycleHooksLookupImpl);
                const n = s.root;
                const r = n === s ? s.getAll(ct) : s.has(ct, false) ? n.getAll(ct).concat(s.getAll(ct)) : n.getAll(ct);
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
        i[t.registrableMetadataKey] = ut.define({}, e);
        return e;
    }
    return e == null ? decorator : decorator(e, s);
}

function valueConverter(t) {
    return function(e, s) {
        s.addInitializer((function() {
            pt.define(t, this);
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
        return new ValueConverterDefinition(s, t.firstDefined(getConverterAnnotation(s, "name"), i), t.mergeArrays(getConverterAnnotation(s, "aliases"), n.aliases, s.aliases), pt.keyFrom(i));
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

const ft = "value-converter";

const dt = /*@__PURE__*/ t.getResourceKeyFor(ft);

const getConverterAnnotation = (t, e) => d(x(e), t);

const getValueConverterKeyFrom = t => `${dt}:${t}`;

const pt = k({
    name: dt,
    keyFrom: getValueConverterKeyFrom,
    isType(e) {
        return t.isFunction(e) && (p(dt, e) || e.$au?.type === ft);
    },
    define(e, s) {
        const i = ValueConverterDefinition.create(e, s);
        const n = i.Type;
        m(i, n, dt, t.resourceBaseName);
        return n;
    },
    getDefinition(t) {
        const e = d(dt, t) ?? getDefinitionFromStaticAu(t, ft, ValueConverterDefinition.create);
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
        const s = t.find(ft, e);
        return s == null ? null : d(dt, s) ?? getDefinitionFromStaticAu(s, ft, ValueConverterDefinition.create) ?? null;
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

const mt = /*@__PURE__*/ (() => {
    function useScope(t) {
        this.s = t;
    }
    return t => {
        defineHiddenProp(t.prototype, "useScope", useScope);
    };
})();

const gt = /*@__PURE__*/ (() => {
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
        return i[s] ??= pt.get(e.l, s);
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

const xt = /*@__PURE__*/ O("IFlushQueue", (t => t.singleton(FlushQueue)));

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

const vt = /*@__PURE__*/ (() => {
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

const yt = ((t = new WeakSet) => e => function() {
    if (!t.has(this)) {
        t.add(this);
        e.call(this);
    }
})();

const wt = {
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
        this.M = false;
        this.l = e;
        this.ast = n;
        this.q = t;
        this.target = r;
        this.oL = s;
        this.B = i;
        if ((this.M = h.indexOf(" ") > -1) && !AttributeBinding.P.has(h)) {
            AttributeBinding.P.set(h, h.split(" "));
        }
    }
    updateTarget(e) {
        const s = this.target;
        const i = this.targetAttribute;
        const n = this.targetProperty;
        switch (i) {
          case "class":
            if (this.M) {
                const t = !!e;
                for (const e of AttributeBinding.P.get(n)) {
                    s.classList.toggle(e, t);
                }
            } else {
                s.classList.toggle(n, !!e);
            }
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
            const s = this.q.state !== Me;
            if (s) {
                t = this.L;
                this.L = this.B.queueTask((() => {
                    this.L = null;
                    this.updateTarget(e);
                }), wt);
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

AttributeBinding.mix = yt((() => {
    mt(AttributeBinding);
    vt(AttributeBinding, (() => "updateTarget"));
    i.connectable(AttributeBinding, null);
    gt(AttributeBinding);
}));

AttributeBinding.P = new Map;

const bt = {
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
        this.q = t;
        this.oL = s;
        this.B = i;
        this.I = s.getAccessor(r, l);
        const c = n.expressions;
        const u = this.partBindings = Array(c.length);
        const f = c.length;
        let d = 0;
        for (;f > d; ++d) {
            u[d] = new InterpolationPartBinding(c[d], r, l, e, s, a, this);
        }
    }
    _() {
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
        const r = this.I;
        const l = this.q.state !== Me && (r.type & _) > 0;
        let h;
        if (l) {
            h = this.L;
            this.L = this.B.queueTask((() => {
                this.L = null;
                r.setValue(i, this.target, this.targetProperty);
            }), bt);
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
        this.I = t;
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
        this.owner._();
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

InterpolationPartBinding.mix = yt((() => {
    mt(InterpolationPartBinding);
    vt(InterpolationPartBinding, (() => "updateTarget"));
    i.connectable(InterpolationPartBinding, null);
    gt(InterpolationPartBinding);
}));

const kt = {
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
        this.V = false;
        this.boundFn = false;
        this.l = e;
        this.q = t;
        this.oL = s;
        this.B = i;
    }
    updateTarget(t) {
        const e = this.target;
        const s = this.v;
        this.v = t;
        if (this.V) {
            s.parentNode?.removeChild(s);
            this.V = false;
        }
        if (t instanceof this.p.Node) {
            e.parentNode?.insertBefore(t, e);
            t = "";
            this.V = true;
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
        const e = this.q.state !== Me;
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
        const e = this.v = i.astEvaluate(this.ast, this.s, this, (this.mode & c) > 0 ? this : null);
        this.obs.clear();
        if (t.isArray(e)) {
            this.observeCollection(e);
        }
        const s = this.q.state !== Me;
        if (s) {
            this.F(e);
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
        }), kt);
        e?.cancel();
    }
}

ContentBinding.mix = yt((() => {
    mt(ContentBinding);
    vt(ContentBinding, (() => "updateTarget"));
    i.connectable(ContentBinding, null);
    gt(ContentBinding);
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
        this.target = this.H ? t.bindingContext : t.overrideContext;
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

LetBinding.mix = yt((() => {
    mt(LetBinding);
    vt(LetBinding, (() => "updateTarget"));
    i.connectable(LetBinding, null);
    gt(LetBinding);
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
        this.I = void 0;
        this.L = null;
        this.O = null;
        this.boundFn = false;
        this.l = e;
        this.q = t;
        this.B = i;
        this.oL = s;
    }
    updateTarget(t) {
        this.I.setValue(t, this.target, this.targetProperty);
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
        const e = this.q.state !== Me && (this.I.type & _) > 0;
        if (e) {
            Ct = this.L;
            this.L = this.B.queueTask((() => {
                this.updateTarget(t);
                this.L = null;
            }), Bt);
            Ct?.cancel();
            Ct = null;
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
        let n = this.I;
        if (!n) {
            if (s & u) {
                n = e.getObserver(this.target, this.targetProperty);
            } else {
                n = e.getAccessor(this.target, this.targetProperty);
            }
            this.I = n;
        }
        const r = (s & c) > 0;
        if (s & (c | a)) {
            this.updateTarget(i.astEvaluate(this.ast, this.s, this, r ? this : null));
        }
        if (s & u) {
            n.subscribe(this.O ??= new BindingTargetSubscriber(this, this.l.get(xt)));
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

PropertyBinding.mix = yt((() => {
    mt(PropertyBinding);
    vt(PropertyBinding, (t => t.mode & u ? "updateSource" : "updateTarget"));
    i.connectable(PropertyBinding, null);
    gt(PropertyBinding);
}));

let Ct = null;

const Bt = {
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

RefBinding.mix = yt((() => {
    i.connectable(RefBinding, null);
    vt(RefBinding, (() => "updateSource"));
    mt(RefBinding);
    gt(RefBinding);
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
        this.$ = null;
        this.l = t;
        this.N = n;
        this.$ = r;
    }
    callSource(e) {
        const s = this.s.overrideContext;
        s.$event = e;
        let n = i.astEvaluate(this.ast, this.s, this, null);
        delete s.$event;
        if (t.isFunction(n)) {
            n = n(e);
        }
        if (n !== true && this.N.prevent) {
            e.preventDefault();
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
        i.astBind(this.ast, t, this);
        this.target.addEventListener(this.targetEvent, this, this.N);
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        i.astUnbind(this.ast, this.s, this);
        this.s = void 0;
        this.target.removeEventListener(this.targetEvent, this, this.N);
    }
}

ListenerBinding.mix = yt((function() {
    mt(ListenerBinding);
    vt(ListenerBinding, (() => "callSource"));
    gt(ListenerBinding);
}));

const St = /*@__PURE__*/ O("IEventModifier");

const At = /*@__PURE__*/ O("IKeyMapping", (t => t.instance({
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
        this.W = t.resolve(At);
        this.j = [ "left", "middle", "right" ];
    }
    static register(t) {
        t.register($(St, ModifiedMouseEventHandler));
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
                    if (t.button !== this.j.indexOf(n)) return false;
                    continue;
                }
                if (this.W.meta.includes(n) && t[`${n}Key`] !== true) {
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
        this.W = t.resolve(At);
        this.type = [ "keydown", "keyup" ];
    }
    static register(t) {
        t.register($(St, ModifiedKeyboardEventHandler));
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
        t.register($(St, ModifiedEventHandler));
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

const Rt = /*@__PURE__*/ O("IEventModifierHandler", (t => t.instance({
    getHandler: () => null
})));

class EventModifier {
    constructor() {
        this.U = t.resolve(t.all(St)).reduce(((e, s) => {
            const i = t.isArray(s.type) ? s.type : [ s.type ];
            i.forEach((t => e[t] = s));
            return e;
        }), {});
    }
    static register(t) {
        t.register($(Rt, EventModifier));
    }
    getHandler(e, s) {
        return t.isString(s) ? (this.U[e] ?? this.U.$ALL)?.getHandler(s) ?? null : null;
    }
}

const Tt = {
    register(t) {
        t.register(EventModifier, ModifiedMouseEventHandler, ModifiedKeyboardEventHandler, ModifiedEventHandler);
    }
};

const Et = /*@__PURE__*/ O("IViewFactory");

class ViewFactory {
    constructor(t, e) {
        this.isCaching = false;
        this.G = null;
        this.K = -1;
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
            if (this.K === -1 || !s) {
                this.K = e;
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

const Lt = /*@__PURE__*/ (() => {
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

const Mt = "default";

const qt = "au-slot";

const Dt = /*@__PURE__*/ O("IAuSlotsInfo");

class AuSlotsInfo {
    constructor(t) {
        this.projectedSlots = t;
    }
}

const Pt = /*@__PURE__*/ O("IAuSlotWatcher");

class AuSlotWatcherBinding {
    constructor(e, s, i, n) {
        this.X = new Set;
        this.Y = t.emptyArray;
        this.isBound = false;
        this.cb = (this.o = e)[s];
        this.slotName = i;
        this.Z = n;
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
        const s = this.Y;
        const i = [];
        const n = this.Z;
        let r;
        let l;
        for (r of this.X) {
            for (l of r === t ? e : r.nodes) {
                if (n === "$all" || isElement(l) && (n === "*" || l.matches(n))) {
                    i[i.length] = l;
                }
            }
        }
        if (i.length !== s.length || i.some(((t, e) => t !== s[e]))) {
            this.Y = i;
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
        this.J = t;
    }
    register(t) {
        W(ct, this).register(t);
    }
    hydrating(t, e) {
        const s = this.J;
        const i = new AuSlotWatcherBinding(t, s.callback ?? `${y(s.name)}Changed`, s.slotName ?? "default", s.query ?? "*");
        R(t, s.name, {
            enumerable: true,
            configurable: true,
            get: C((() => i.getValue()), {
                getObserver: () => i
            }),
            set: () => {}
        });
        W(Pt, i).register(e.container);
        e.addBinding(i);
    }
}

function slotted(t, e) {
    if (!It) {
        It = true;
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

let It = false;

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
        if (t.vmKind !== Te) {
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
        this.st = {};
        this.it = new WeakMap;
        this.q = t;
        this.oL = n;
        this.l = r;
        this.B = l;
    }
    updateTarget() {
        this.obs.version++;
        const t = i.astEvaluate(this.ast, this.s, this, this);
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
        i.astBind(this.ast, t, this);
        const e = i.astEvaluate(this.ast, t, this, this);
        this.nt(e, false);
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        i.astUnbind(this.ast, this.s, this);
        this.s = void 0;
        let t;
        for (t in this.st) {
            this.st[t].unbind();
        }
    }
    nt(s, n) {
        let l;
        if (!t.isObject(s)) {
            for (l in this.st) {
                this.st[l]?.unbind();
            }
            return;
        }
        let h;
        let a = this.it.get(s);
        if (a == null) {
            this.it.set(s, a = i.Scope.fromParent(this.s, s));
        }
        for (l of this.targetKeys) {
            h = this.st[l];
            if (l in s) {
                if (h == null) {
                    h = this.st[l] = new PropertyBinding(this.q, this.l, this.oL, this.B, SpreadValueBinding.ot[l] ??= new r.AccessScopeExpression(l, 0), this.target, l, e.BindingMode.toView, this.strict);
                }
                h.bind(a);
            } else if (n) {
                h?.unbind();
            }
        }
    }
}

SpreadValueBinding.mix = yt((() => {
    mt(SpreadValueBinding);
    vt(SpreadValueBinding, (() => "updateTarget"));
    i.connectable(SpreadValueBinding, null);
    gt(SpreadValueBinding);
}));

SpreadValueBinding.ot = {};

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
                addListener(this.rt, e, this);
            }
            this.lt = true;
            this.ht?.();
        }
    }));
    defineHiddenProp(s, "unsubscribe", (function(t) {
        if (this.subs.remove(t) && this.subs.count === 0) {
            for (e of this.cf.events) {
                removeListener(this.rt, e, this);
            }
            this.lt = false;
            this.ct?.();
        }
    }));
    defineHiddenProp(s, "useConfig", (function(t) {
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
                t[l] = this.ft;
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
        return i.get(He).controller.container.get(t.own(e));
    }
});

const _t = /*@__PURE__*/ O("IRenderer");

function renderer(e, s) {
    const i = s?.metadata ?? (e[Symbol.metadata] ??= Object.create(null));
    i[t.registrableMetadataKey] = {
        register(t) {
            $(_t, e).register(t);
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

const Vt = /*@__PURE__*/ renderer(class SetPropertyRenderer {
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

const Ft = /*@__PURE__*/ renderer(class CustomElementRenderer {
    constructor() {
        this.r = t.resolve(ae);
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
            l = is.find(f, c);
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

const Ht = /*@__PURE__*/ renderer(class CustomAttributeRenderer {
    constructor() {
        this.r = t.resolve(ae);
        this.target = e.InstructionType.hydrateAttribute;
    }
    render(t, e, s, i, n, r) {
        let l = t.container;
        let h;
        switch (typeof s.res) {
          case "string":
            h = at.find(l, s.res);
            if (h == null) {
                throw createMappedError(753, s, t);
            }
            break;

          default:
            h = s.res;
        }
        const a = invokeAttribute(i, h, t, e, s, void 0, void 0);
        const c = Controller.$attr(a.ctn, a.vm, e, h);
        nt.set(e, h.key, c);
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

const Ot = /*@__PURE__*/ renderer(class TemplateControllerRenderer {
    constructor() {
        this.r = t.resolve(ae);
        this.target = e.InstructionType.hydrateTemplateController;
    }
    render(t, e, s, i, n, r) {
        let l = t.container;
        let h;
        switch (typeof s.res) {
          case "string":
            h = at.find(l, s.res);
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
        nt.set(c, h.key, f);
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

const $t = /*@__PURE__*/ renderer(class LetElementRenderer {
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

const Nt = /*@__PURE__*/ renderer(class RefBindingRenderer {
    constructor() {
        this.target = e.InstructionType.refBinding;
        RefBinding.mix();
    }
    render(t, e, s, i, n, r) {
        t.addBinding(new RefBinding(t.container, r, ensureExpression(n, s.from, M), getRefTarget(e, s.to), t.strict ?? false));
    }
}, null);

const Wt = /*@__PURE__*/ renderer(class InterpolationBindingRenderer {
    constructor() {
        this.target = e.InstructionType.interpolation;
        InterpolationPartBinding.mix();
    }
    render(t, e, s, i, n, r) {
        const l = t.container;
        const h = new InterpolationBinding(t, l, r, i.domQueue, ensureExpression(n, s.from, T), getTarget(e), s.to, c, t.strict ?? false);
        if (s.to === "class" && h.target.nodeType > 0) {
            const t = l.get(fromHydrationContext(Ue));
            h.useAccessor(new ClassAttributeAccessor(h.target, t));
        }
        t.addBinding(h);
    }
}, null);

const jt = /*@__PURE__*/ renderer(class PropertyBindingRenderer {
    constructor() {
        this.target = e.InstructionType.propertyBinding;
        PropertyBinding.mix();
    }
    render(t, e, s, i, n, r) {
        const l = t.container;
        const h = new PropertyBinding(t, l, r, i.domQueue, ensureExpression(n, s.from, M), getTarget(e), s.to, s.mode, t.strict ?? false);
        if (s.to === "class" && h.target.nodeType > 0) {
            const t = l.get(fromHydrationContext(Ue));
            h.useTargetObserver(new ClassAttributeAccessor(h.target, t));
        }
        t.addBinding(h);
    }
}, null);

const zt = /*@__PURE__*/ renderer(class IteratorBindingRenderer {
    constructor() {
        this.target = e.InstructionType.iteratorBinding;
        PropertyBinding.mix();
    }
    render(t, e, s, i, n, r) {
        t.addBinding(new PropertyBinding(t, t.container, r, i.domQueue, ensureExpression(n, s.forOf, E), getTarget(e), s.to, c, t.strict ?? false));
    }
}, null);

const Ut = /*@__PURE__*/ renderer(class TextBindingRenderer {
    constructor() {
        this.target = e.InstructionType.textBinding;
        ContentBinding.mix();
    }
    render(t, e, s, i, n, r) {
        t.addBinding(new ContentBinding(t, t.container, r, i.domQueue, i, ensureExpression(n, s.from, M), e, t.strict ?? false));
    }
}, null);

const Gt = O("IListenerBindingOptions", (e => e.singleton(class {
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

const Kt = /*@__PURE__*/ renderer(class ListenerBindingRenderer {
    constructor() {
        this.target = e.InstructionType.listenerBinding;
        this.gt = t.resolve(Rt);
        this.xt = t.resolve(Gt);
        ListenerBinding.mix();
    }
    render(t, e, s, i, n) {
        t.addBinding(new ListenerBinding(t.container, ensureExpression(n, s.from, L), e, s.to, new ListenerBindingOptions(this.xt.prevent, s.capture, this.xt.onError), this.gt.getHandler(s.to, s.modifier), t.strict ?? false));
    }
}, null);

const Xt = /*@__PURE__*/ renderer(class SetAttributeRenderer {
    constructor() {
        this.target = e.InstructionType.setAttribute;
    }
    render(t, e, s) {
        e.setAttribute(s.to, s.value);
    }
}, null);

const Qt = /*@__PURE__*/ renderer(class SetClassAttributeRenderer {
    constructor() {
        this.target = e.InstructionType.setClassAttribute;
    }
    render(t, e, s) {
        addClasses(e.classList, s.value);
    }
}, null);

const Yt = /*@__PURE__*/ renderer(class SetStyleAttributeRenderer {
    constructor() {
        this.target = e.InstructionType.setStyleAttribute;
    }
    render(t, e, s) {
        e.style.cssText += s.value;
    }
}, null);

const Zt = /*@__PURE__*/ renderer(class StylePropertyBindingRenderer {
    constructor() {
        this.target = e.InstructionType.stylePropertyBinding;
        PropertyBinding.mix();
    }
    render(t, e, s, i, n, r) {
        t.addBinding(new PropertyBinding(t, t.container, r, i.domQueue, ensureExpression(n, s.from, M), e.style, s.to, c, t.strict ?? false));
    }
}, null);

const Jt = /*@__PURE__*/ renderer(class AttributeBindingRenderer {
    constructor() {
        this.target = e.InstructionType.attributeBinding;
        AttributeBinding.mix();
    }
    render(t, e, s, i, n, r) {
        const l = t.container;
        const h = l.has(Ue, false) ? l.get(Ue) : null;
        t.addBinding(new AttributeBinding(t, l, r, i.domQueue, ensureExpression(n, s.from, M), e, s.attr, h == null ? s.to : s.to.split(/\s/g).map((t => h[t] ?? t)).join(" "), c, t.strict ?? false));
    }
}, null);

const te = /*@__PURE__*/ renderer(class SpreadRenderer {
    constructor() {
        this.vt = t.resolve(e.ITemplateCompiler);
        this.r = t.resolve(ae);
        this.target = e.InstructionType.spreadTransferedBinding;
    }
    render(t, e, s, i, n, r) {
        SpreadBinding.create(t.container.get(He), e, void 0, this.r, this.vt, i, n, r).forEach((e => t.addBinding(e)));
    }
}, null);

const ee = /*@__PURE__*/ renderer(class SpreadValueRenderer {
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

const se = "IController";

const ie = "IInstruction";

const ne = "IRenderLocation";

const oe = "ISlotsInfo";

function createElementContainer(s, i, n, r, l, h) {
    const a = i.container.createChild();
    registerHostNode(a, n, s);
    registerResolver(a, Fe, new t.InstanceProvider(se, i));
    registerResolver(a, e.IInstruction, new t.InstanceProvider(ie, r));
    registerResolver(a, ze, l == null ? re : new RenderLocationProvider(l));
    registerResolver(a, Et, le);
    registerResolver(a, Dt, h == null ? he : new t.InstanceProvider(oe, h));
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
    registerResolver(f, Fe, new t.InstanceProvider(se, u));
    registerResolver(f, e.IInstruction, new t.InstanceProvider(ie, l));
    registerResolver(f, ze, a == null ? re : new t.InstanceProvider(ne, a));
    registerResolver(f, Et, h == null ? le : new ViewFactoryProvider(h));
    registerResolver(f, Dt, he);
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

const re = new RenderLocationProvider(null);

const le = new ViewFactoryProvider(null);

const he = new t.InstanceProvider(oe, new AuSlotsInfo(t.emptyArray));

const ae = /*@__PURE__*/ O("IRendering", (t => t.singleton(Rendering)));

class Rendering {
    get renderers() {
        return this.yt ??= this.wt.getAll(_t, false).reduce(((t, e) => {
            t[e.target] ??= e;
            return t;
        }), t.createLookup());
    }
    constructor() {
        this.bt = new WeakMap;
        this.kt = new WeakMap;
        const e = this.wt = t.resolve(t.IContainer).root;
        const s = this.p = e.get(it);
        this.ep = e.get(r.IExpressionParser);
        this.oL = e.get(i.IObserverLocator);
        this.Ct = s.document.createElement("au-m");
        this.Bt = new FragmentNodeSequence(s, s.document.createDocumentFragment());
    }
    compile(t, s) {
        const i = s.get(e.ITemplateCompiler);
        const n = this.bt;
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
            return new FragmentNodeSequence(this.p, this.St(e.template));
        }
        let s;
        let i = false;
        const n = this.kt;
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
            this.St(s);
            n.set(e, s);
        }
        return s == null ? this.Bt : new FragmentNodeSequence(this.p, i ? l.importNode(s, true) : l.adoptNode(s.cloneNode(true)));
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
    St(t) {
        if (t == null) {
            return null;
        }
        const e = this.p.document.createTreeWalker(t, 128);
        let s;
        while ((s = e.nextNode()) != null) {
            if (s.nodeValue === "au*") {
                s.parentNode.replaceChild(e.currentNode = this.Ct.cloneNode(), s);
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
        let i = s.get(t.own(Ue));
        if (i == null) {
            s.register(W(Ue, i = t.createLookup()));
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

const ce = /*@__PURE__*/ O("IShadowDOMStyleFactory", (t => t.cachedCallback((t => {
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
        const e = t.get(fe);
        const s = t.get(ce);
        t.register(W(ue, s.createStyles(this.css, e)));
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

const ue = /*@__PURE__*/ O("IShadowDOMStyles");

const fe = /*@__PURE__*/ O("IShadowDOMGlobalStyles", (e => e.instance({
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

const de = {
    shadowDOM(e) {
        return st.creating(t.IContainer, (t => {
            if (e.sharedStyles != null) {
                const s = t.get(ce);
                t.register(W(fe, s.createStyles(e.sharedStyles, null)));
            }
        }));
    }
};

const {enter: pe, exit: me} = i.ConnectableSwitcher;

const {wrap: ge, unwrap: xe} = i.ProxyObservable;

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
            pe(this);
            return this.v = xe(this.$get.call(void 0, this.useProxy ? ge(this.obj) : this.obj, this));
        } finally {
            this.obs.clear();
            this.running = false;
            me(this);
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
        this.At = i;
        this.cb = n;
    }
    handleChange(e) {
        const s = this.At;
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
        this.v = i.astEvaluate(this.At, this.scope, this, this);
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
    gt(ExpressionWatcher);
})();

class Controller {
    get lifecycleHooks() {
        return this.Rt;
    }
    get isActive() {
        return (this.state & (Me | qe)) > 0 && (this.state & De) === 0;
    }
    get name() {
        if (this.parent === null) {
            switch (this.vmKind) {
              case Te:
                return `[${this.definition.name}]`;

              case Re:
                return this.definition.name;

              case Ee:
                return this.viewFactory.name;
            }
        }
        switch (this.vmKind) {
          case Te:
            return `${this.parent.name}>[${this.definition.name}]`;

          case Re:
            return `${this.parent.name}>${this.definition.name}`;

          case Ee:
            return this.viewFactory.name === this.parent.definition?.name ? `${this.parent.name}[view]` : `${this.parent.name}[view:${this.viewFactory.name}]`;
        }
    }
    get viewModel() {
        return this.Tt;
    }
    set viewModel(t) {
        this.Tt = t;
        this.Et = t == null || this.vmKind === Ee ? HooksDefinition.none : new HooksDefinition(t);
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
        this.Lt = false;
        this.mountTarget = ye;
        this.shadowRoot = null;
        this.nodes = null;
        this.location = null;
        this.Rt = null;
        this.state = Le;
        this.Mt = false;
        this.$initiator = null;
        this.$resolve = void 0;
        this.$reject = void 0;
        this.$promise = void 0;
        this.qt = 0;
        this.Dt = 0;
        this.Pt = 0;
        this.Tt = n;
        this.Et = e === Ee ? HooksDefinition.none : new HooksDefinition(n);
        this.location = l;
        this.r = t.root.get(ae);
    }
    static getCached(t) {
        return ve.get(t);
    }
    static getCachedOrThrow(t) {
        const e = Controller.getCached(t);
        if (e === void 0) {
            throw createMappedError(500, t);
        }
        return e;
    }
    static $el(e, s, i, n, r = void 0, l = null) {
        if (ve.has(s)) {
            return ve.get(s);
        }
        {
            r = r ?? getElementDefinition(s.constructor);
        }
        registerResolver(e, r.Type, new t.InstanceProvider(r.key, s, r.Type));
        const h = new Controller(e, Re, r, null, s, i, l);
        const a = e.get(t.optional(He));
        if (r.dependencies.length > 0) {
            e.register(...r.dependencies);
        }
        registerResolver(e, He, new t.InstanceProvider("IHydrationContext", new HydrationContext(h, n, a)));
        ve.set(s, h);
        if (n == null || n.hydrate !== false) {
            h.hE(n);
        }
        return h;
    }
    static $attr(e, s, i, n) {
        if (ve.has(s)) {
            return ve.get(s);
        }
        n = n ?? getAttributeDefinition(s.constructor);
        registerResolver(e, n.Type, new t.InstanceProvider(n.key, s, n.Type));
        const r = new Controller(e, Te, n, null, s, i, null);
        if (n.dependencies.length > 0) {
            e.register(...n.dependencies);
        }
        ve.set(s, r);
        r.It();
        return r;
    }
    static $view(t, e = void 0) {
        const s = new Controller(t.container, Ee, null, t, null, null, null);
        s.parent = e ?? null;
        s._t();
        return s;
    }
    hE(e) {
        const s = this.container;
        const n = this.Tt;
        const r = this.definition;
        this.scope = i.Scope.create(n, null, true);
        if (r.watches.length > 0) {
            createWatchers(this, s, r, n);
        }
        createObservers(this, r, n);
        this.Rt = ut.resolve(s);
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
        if (this.Rt.hydrating != null) {
            this.Rt.hydrating.forEach(callHydratingHook, this);
        }
        if (this.Et.Vt) {
            this.Tt.hydrating(this);
        }
        const t = this.definition;
        const e = this.Ft = this.r.compile(t, this.container);
        const s = e.shadowOptions;
        const i = e.hasSlots;
        const n = e.containerless;
        const r = this.host;
        let l = this.location;
        if (n && l == null) {
            l = this.location = convertToRenderLocation(r);
        }
        We(r, ts, this);
        We(r, t.key, this);
        if (s !== null || i) {
            if (l != null) {
                throw createMappedError(501);
            }
            We(this.shadowRoot = r.attachShadow(s ?? Ae), ts, this);
            We(this.shadowRoot, t.key, this);
            this.mountTarget = be;
        } else if (l != null) {
            if (r !== l) {
                We(l, ts, this);
                We(l, t.key, this);
            }
            this.mountTarget = ke;
        } else {
            this.mountTarget = we;
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
        this.Rt = ut.resolve(this.container);
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
    activate(e, s, i) {
        switch (this.state) {
          case Le:
          case Pe:
            if (!(s === null || s.isActive)) {
                return;
            }
            this.state = Me;
            break;

          case qe:
            return;

          case _e:
            throw createMappedError(502, this.name);

          default:
            throw createMappedError(503, this.name, stringifyState(this.state));
        }
        this.parent = s;
        switch (this.vmKind) {
          case Re:
            this.scope.parent = i ?? null;
            break;

          case Te:
            this.scope = i ?? null;
            break;

          case Ee:
            if (i === void 0 || i === null) {
                throw createMappedError(504, this.name);
            }
            if (!this.hasLockedScope) {
                this.scope = i;
            }
            break;
        }
        this.$initiator = e;
        this.$t();
        let n = void 0;
        if (this.vmKind !== Ee && this.Rt.binding != null) {
            n = t.onResolveAll(...this.Rt.binding.map(callBindingHook, this));
        }
        if (this.Et.Nt) {
            n = t.onResolveAll(n, this.Tt.binding(this.$initiator, this.parent));
        }
        if (t.isPromise(n)) {
            this.Wt();
            n.then((() => {
                this.Lt = true;
                if (this.state !== Me) {
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
        if (this.vmKind !== Ee && this.Rt.bound != null) {
            i = t.onResolveAll(...this.Rt.bound.map(callBoundHook, this));
        }
        if (this.Et.Ut) {
            i = t.onResolveAll(i, this.Tt.bound(this.$initiator, this.parent));
        }
        if (t.isPromise(i)) {
            this.Wt();
            i.then((() => {
                this.isBound = true;
                if (this.state !== Me) {
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
          case we:
            this.host.append(...t);
            break;

          case be:
            this.shadowRoot.append(...t);
            break;

          case ke:
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
          case we:
            this.nodes.appendTo(this.host, this.definition != null && this.definition.enhance);
            break;

          case be:
            {
                const t = this.container;
                const e = t.has(ue, false) ? t.get(ue) : t.get(fe);
                e.applyTo(this.shadowRoot);
                this.nodes.appendTo(this.shadowRoot);
                break;
            }

          case ke:
            this.nodes.insertBefore(this.location);
            break;
        }
        let e = 0;
        let s = void 0;
        if (this.vmKind !== Ee && this.Rt.attaching != null) {
            s = t.onResolveAll(...this.Rt.attaching.map(callAttachingHook, this));
        }
        if (this.Et.Xt) {
            s = t.onResolveAll(s, this.Tt.attaching(this.$initiator, this.parent));
        }
        if (t.isPromise(s)) {
            this.Wt();
            this.$t();
            s.then((() => {
                this.jt();
            })).catch((t => {
                this.zt(t);
            }));
        }
        if (this.children !== null) {
            for (;e < this.children.length; ++e) {
                void this.children[e].activate(this.$initiator, this, this.scope);
            }
        }
        this.jt();
    }
    deactivate(e, s) {
        let i = void 0;
        switch (this.state & ~Ie) {
          case qe:
            this.state = De;
            break;

          case Me:
            this.state = De;
            i = this.$promise?.catch(t.noop);
            break;

          case Le:
          case Pe:
          case _e:
          case Pe | _e:
            return;

          default:
            throw createMappedError(505, this.name, this.state);
        }
        this.$initiator = e;
        if (e === this) {
            this.Qt();
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
                if (this.vmKind !== Ee && this.Rt.detaching != null) {
                    r = t.onResolveAll(...this.Rt.detaching.map(callDetachingHook, this));
                }
                if (this.Et.Yt) {
                    r = t.onResolveAll(r, this.Tt.detaching(this.$initiator, this.parent));
                }
            }
            if (t.isPromise(r)) {
                this.Wt();
                e.Qt();
                r.then((() => {
                    e.Zt();
                })).catch((t => {
                    e.zt(t);
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
            this.Zt();
            return this.$promise;
        }));
    }
    removeNodes() {
        switch (this.vmKind) {
          case Re:
          case Ee:
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
          case Te:
            this.scope = null;
            break;

          case Ee:
            if (!this.hasLockedScope) {
                this.scope = null;
            }
            if ((this.state & Ie) === Ie && !this.viewFactory.tryReturnToCache(this) && this.$initiator === this) {
                this.dispose();
            }
            break;

          case Re:
            this.scope.parent = null;
            break;
        }
        this.state = Pe;
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
            Oe = this.$resolve;
            this.$resolve = this.$reject = this.$promise = void 0;
            Oe();
            Oe = void 0;
        }
    }
    zt(t) {
        if (this.$promise !== void 0) {
            $e = this.$reject;
            this.$resolve = this.$reject = this.$promise = void 0;
            $e(t);
            $e = void 0;
        }
        if (this.$initiator !== this) {
            this.parent.zt(t);
        }
    }
    $t() {
        ++this.qt;
        if (this.$initiator !== this) {
            this.parent.$t();
        }
    }
    jt() {
        if (this.state !== Me) {
            --this.qt;
            this.Jt();
            if (this.$initiator !== this) {
                this.parent.jt();
            }
            return;
        }
        if (--this.qt === 0) {
            if (this.vmKind !== Ee && this.Rt.attached != null) {
                Ne = t.onResolveAll(...this.Rt.attached.map(callAttachedHook, this));
            }
            if (this.Et.te) {
                Ne = t.onResolveAll(Ne, this.Tt.attached(this.$initiator));
            }
            if (t.isPromise(Ne)) {
                this.Wt();
                Ne.then((() => {
                    this.state = qe;
                    this.Jt();
                    if (this.$initiator !== this) {
                        this.parent.jt();
                    }
                })).catch((t => {
                    this.zt(t);
                }));
                Ne = void 0;
                return;
            }
            Ne = void 0;
            this.state = qe;
            this.Jt();
        }
        if (this.$initiator !== this) {
            this.parent.jt();
        }
    }
    Qt() {
        ++this.Dt;
    }
    Zt() {
        if (--this.Dt === 0) {
            this.ee();
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
                if (e.Lt) {
                    if (e.vmKind !== Ee && e.Rt.unbinding != null) {
                        s = t.onResolveAll(...e.Rt.unbinding.map(callUnbindingHook, e));
                    }
                    if (e.Et.se) {
                        if (e.debug) {
                            e.logger.trace("unbinding()");
                        }
                        s = t.onResolveAll(s, e.viewModel.unbinding(e.$initiator, e.parent));
                    }
                }
                if (t.isPromise(s)) {
                    this.Wt();
                    this.ee();
                    s.then((() => {
                        this.ie();
                    })).catch((t => {
                        this.zt(t);
                    }));
                }
                s = void 0;
                e = e.next;
            }
            this.ie();
        }
    }
    ee() {
        ++this.Pt;
    }
    ie() {
        if (--this.Pt === 0) {
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
          case Te:
          case Re:
            {
                return this.definition.name === t;
            }

          case Ee:
            return this.viewFactory.name === t;
        }
    }
    lockScope(t) {
        this.scope = t;
        this.hasLockedScope = true;
    }
    setHost(t) {
        if (this.vmKind === Re) {
            We(t, ts, this);
            We(t, this.definition.key, this);
        }
        this.host = t;
        this.mountTarget = we;
        return this;
    }
    setShadowRoot(t) {
        if (this.vmKind === Re) {
            We(t, ts, this);
            We(t, this.definition.key, this);
        }
        this.shadowRoot = t;
        this.mountTarget = be;
        return this;
    }
    setLocation(t) {
        if (this.vmKind === Re) {
            We(t, ts, this);
            We(t, this.definition.key, this);
        }
        this.location = t;
        this.mountTarget = ke;
        return this;
    }
    release() {
        this.state |= Ie;
    }
    dispose() {
        if ((this.state & _e) === _e) {
            return;
        }
        this.state |= _e;
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
            ve.delete(this.Tt);
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
            for (let s = 0, i = e.length; s < i; ++s) {
                if (e[s].accept(t) === true) {
                    return true;
                }
            }
        }
    }
}

const ve = new WeakMap;

const ye = 0;

const we = 1;

const be = 2;

const ke = 3;

const Ce = k({
    none: ye,
    host: we,
    shadowRoot: be,
    location: ke
});

const Be = t.optionalResource(i.ICoercionConfiguration);

function createObservers(e, s, n) {
    const r = s.bindables;
    const l = B(r);
    const h = l.length;
    if (h === 0) return;
    const a = e.container.get(i.IObserverLocator);
    const c = "propertiesChanged" in n;
    const u = e.vmKind === Ee ? void 0 : e.container.get(Be);
    const f = c ? (() => {
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
        const d = h.callback;
        const p = a.getObserver(n, i);
        if (h.set !== t.noop) {
            if (p.useCoercer?.(h.set, u) !== true) {
                throw createMappedError(507, i);
            }
        }
        if (n[d] != null || n.propertyChanged != null || c) {
            const callback = (t, s) => {
                if (e.isBound) {
                    n[d]?.(t, s);
                    n.propertyChanged?.(i, t, s);
                    f(i, t, s);
                }
            };
            if (p.useCallback?.(callback) !== true) {
                throw createMappedError(508, i);
            }
        }
    }
}

const Se = new Map;

const getAccessScopeAst = t => {
    let e = Se.get(t);
    if (e == null) {
        e = new r.AccessScopeExpression(t, 0);
        Se.set(t, e);
    }
    return e;
};

function createWatchers(e, s, n, l) {
    const h = s.get(i.IObserverLocator);
    const a = s.get(r.IExpressionParser);
    const c = n.watches;
    const u = e.vmKind === Re ? e.scope : i.Scope.create(l, null, true);
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
    return t instanceof Controller && t.vmKind === Re;
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
        this.se = "unbinding" in t;
        this.ne = "dispose" in t;
        this.oe = "accept" in t;
    }
}

HooksDefinition.none = new HooksDefinition({});

const Ae = {
    mode: "open"
};

const Re = "customElement";

const Te = "customAttribute";

const Ee = "synthetic";

const Le = 0;

const Me = 1;

const qe = 2;

const De = 4;

const Pe = 8;

const Ie = 16;

const _e = 32;

const Ve = /*@__PURE__*/ k({
    none: Le,
    activating: Me,
    activated: qe,
    deactivating: De,
    deactivated: Pe,
    released: Ie,
    disposed: _e
});

function stringifyState(t) {
    const e = [];
    if ((t & Me) === Me) {
        e.push("activating");
    }
    if ((t & qe) === qe) {
        e.push("activated");
    }
    if ((t & De) === De) {
        e.push("deactivating");
    }
    if ((t & Pe) === Pe) {
        e.push("deactivated");
    }
    if ((t & Ie) === Ie) {
        e.push("released");
    }
    if ((t & _e) === _e) {
        e.push("disposed");
    }
    return e.length === 0 ? "none" : e.join("|");
}

const Fe = /*@__PURE__*/ O("IController");

const He = /*@__PURE__*/ O("IHydrationContext");

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

let Oe;

let $e;

let Ne;

const We = nt.set;

const je = /*@__PURE__*/ O("IEventTarget", (t => t.cachedCallback((t => {
    if (t.has(os, true)) {
        return t.get(os).host;
    }
    return t.get(it).document;
}))));

const ze = /*@__PURE__*/ O("IRenderLocation");

const Ue = /*@__PURE__*/ O("ICssClassMapping");

const Ge = new WeakMap;

function getEffectiveParentNode(t) {
    if (Ge.has(t)) {
        return Ge.get(t);
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
        if (e.mountTarget === Ce.shadowRoot) {
            return getEffectiveParentNode(e.host);
        }
    }
    return t.parentNode;
}

function setEffectiveParentNode(t, e) {
    if (t.platform !== void 0 && !(t instanceof t.platform.Node)) {
        const s = t.childNodes;
        for (let t = 0, i = s.length; t < i; ++t) {
            Ge.set(s[t], e);
        }
    } else {
        Ge.set(t, e);
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
                let s = this.le;
                let i;
                const n = this.he;
                while (s != null) {
                    i = s.nextSibling;
                    e.insertBefore(s, t);
                    if (s === n) {
                        break;
                    }
                    s = i;
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
            let s;
            const i = this.he;
            while (e != null) {
                s = e.nextSibling;
                t.appendChild(e);
                if (e === i) {
                    break;
                }
                e = s;
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
            let s;
            let i = this.le;
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
        if (this.ae) {
            let s = this.le;
            let i;
            const n = this.he;
            while (s != null) {
                i = s.nextSibling;
                e.insertBefore(s, t);
                if (s === n) {
                    break;
                }
                s = i;
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

const Ke = /*@__PURE__*/ O("IWindow", (t => t.callback((t => t.get(it).window))));

const Xe = /*@__PURE__*/ O("ILocation", (t => t.callback((t => t.get(Ke).location))));

const Qe = /*@__PURE__*/ O("IHistory", (t => t.callback((t => t.get(Ke).history))));

const registerHostNode = (e, s, i = e.get(it)) => {
    registerResolver(e, i.HTMLElement, registerResolver(e, i.Element, registerResolver(e, ot, new t.InstanceProvider("ElementResolver", s))));
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
    const e = d(ts, t);
    if (e === void 0) {
        annotateElementMetadata(t, "containerless", true);
        return;
    }
    e.containerless = true;
}

const Ye = new WeakMap;

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
            const n = t.fromDefinitionOrDefault("name", i, es);
            if (t.isFunction(i.Type)) {
                s = i.Type;
            } else {
                s = ss(t.pascalCase(n));
            }
            for (const t of Object.values(F.from(i.bindables))) {
                F.i(t, s);
            }
            return new CustomElementDefinition(s, n, t.mergeArrays(i.aliases), t.fromDefinitionOrDefault("key", i, (() => getElementKeyFrom(n))), t.fromAnnotationOrDefinitionOrTypeOrDefault("capture", i, s, returnFalse), t.fromAnnotationOrDefinitionOrTypeOrDefault("template", i, s, returnNull), t.mergeArrays(i.instructions), t.mergeArrays(getElementAnnotation(s, "dependencies"), i.dependencies), t.fromDefinitionOrDefault("injectable", i, returnNull), t.fromDefinitionOrDefault("needsCompile", i, returnTrue), t.mergeArrays(i.surrogates), F.from(getElementAnnotation(s, "bindables"), i.bindables), t.fromAnnotationOrDefinitionOrTypeOrDefault("containerless", i, s, returnFalse), t.fromDefinitionOrDefault("shadowOptions", i, returnNull), t.fromDefinitionOrDefault("hasSlots", i, returnFalse), t.fromDefinitionOrDefault("enhance", i, returnFalse), t.fromDefinitionOrDefault("watches", i, returnEmptyArray), t.fromDefinitionOrDefault("strict", i, returnUndefined), t.fromAnnotationOrTypeOrDefault("processContent", s, returnNull));
        }
        if (t.isString(e)) {
            return new CustomElementDefinition(s, e, t.mergeArrays(getElementAnnotation(s, "aliases"), s.aliases), getElementKeyFrom(e), t.fromAnnotationOrTypeOrDefault("capture", s, returnFalse), t.fromAnnotationOrTypeOrDefault("template", s, returnNull), t.mergeArrays(getElementAnnotation(s, "instructions"), s.instructions), t.mergeArrays(getElementAnnotation(s, "dependencies"), s.dependencies), t.fromAnnotationOrTypeOrDefault("injectable", s, returnNull), t.fromAnnotationOrTypeOrDefault("needsCompile", s, returnTrue), t.mergeArrays(getElementAnnotation(s, "surrogates"), s.surrogates), F.from(...F.getAll(s), getElementAnnotation(s, "bindables"), s.bindables), t.fromAnnotationOrTypeOrDefault("containerless", s, returnFalse), t.fromAnnotationOrTypeOrDefault("shadowOptions", s, returnNull), t.fromAnnotationOrTypeOrDefault("hasSlots", s, returnFalse), t.fromAnnotationOrTypeOrDefault("enhance", s, returnFalse), t.mergeArrays(rt.getDefinitions(s), s.watches), t.fromAnnotationOrTypeOrDefault("strict", s, returnUndefined), t.fromAnnotationOrTypeOrDefault("processContent", s, returnNull));
        }
        const i = t.fromDefinitionOrDefault("name", e, es);
        for (const t of Object.values(F.from(e.bindables))) {
            F.i(t, s);
        }
        return new CustomElementDefinition(s, i, t.mergeArrays(getElementAnnotation(s, "aliases"), e.aliases, s.aliases), getElementKeyFrom(i), t.fromAnnotationOrDefinitionOrTypeOrDefault("capture", e, s, returnFalse), t.fromAnnotationOrDefinitionOrTypeOrDefault("template", e, s, returnNull), t.mergeArrays(getElementAnnotation(s, "instructions"), e.instructions, s.instructions), t.mergeArrays(getElementAnnotation(s, "dependencies"), e.dependencies, s.dependencies), t.fromAnnotationOrDefinitionOrTypeOrDefault("injectable", e, s, returnNull), t.fromAnnotationOrDefinitionOrTypeOrDefault("needsCompile", e, s, returnTrue), t.mergeArrays(getElementAnnotation(s, "surrogates"), e.surrogates, s.surrogates), F.from(...F.getAll(s), getElementAnnotation(s, "bindables"), s.bindables, e.bindables), t.fromAnnotationOrDefinitionOrTypeOrDefault("containerless", e, s, returnFalse), t.fromAnnotationOrDefinitionOrTypeOrDefault("shadowOptions", e, s, returnNull), t.fromAnnotationOrDefinitionOrTypeOrDefault("hasSlots", e, s, returnFalse), t.fromAnnotationOrDefinitionOrTypeOrDefault("enhance", e, s, returnFalse), t.mergeArrays(e.watches, rt.getDefinitions(s), s.watches), t.fromAnnotationOrDefinitionOrTypeOrDefault("strict", e, s, returnUndefined), t.fromAnnotationOrDefinitionOrTypeOrDefault("processContent", e, s, returnNull));
    }
    static getOrCreate(t) {
        if (t instanceof CustomElementDefinition) {
            return t;
        }
        if (Ye.has(t)) {
            return Ye.get(t);
        }
        const e = CustomElementDefinition.create(t);
        Ye.set(t, e);
        m(e, e.Type, ts);
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

const Ze = {
    name: undefined,
    searchParents: false,
    optional: false
};

const returnNull = () => null;

const returnUndefined = () => void 0;

const returnFalse = () => false;

const returnTrue = () => true;

const returnEmptyArray = () => t.emptyArray;

const Je = "custom-element";

const ts = /*@__PURE__*/ t.getResourceKeyFor(Je);

const getElementKeyFrom = t => `${ts}:${t}`;

const es = /*@__PURE__*/ (t => () => `unnamed-${++t}`)(0);

const annotateElementMetadata = (t, e, s) => {
    m(s, t, x(e));
};

const defineElement = (e, s) => {
    const i = CustomElementDefinition.create(e, s);
    const n = i.Type;
    m(i, n, ts, t.resourceBaseName);
    return n;
};

const isElementType = e => t.isFunction(e) && (p(ts, e) || e.$au?.type === Je);

const findElementControllerFor = (t, e = Ze) => {
    if (e.name === void 0 && e.searchParents !== true) {
        const s = nt.get(t, ts);
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
            const s = nt.get(t, ts);
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
            const t = nt.get(s, ts);
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
        const t = nt.get(s, ts);
        if (t !== null) {
            return t;
        }
        s = getEffectiveParentNode(s);
    }
    throw createMappedError(765, t);
};

const getElementAnnotation = (t, e) => d(x(e), t);

const getElementDefinition = t => {
    const e = d(ts, t) ?? getDefinitionFromStaticAu(t, Je, CustomElementDefinition.create);
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

const ss = /*@__PURE__*/ function() {
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

const is = /*@__PURE__*/ k({
    name: ts,
    keyFrom: getElementKeyFrom,
    isType: isElementType,
    for: findElementControllerFor,
    define: defineElement,
    getDefinition: getElementDefinition,
    annotate: annotateElementMetadata,
    getAnnotation: getElementAnnotation,
    generateName: es,
    createInjectable: createElementInjectable,
    generateType: ss,
    find(t, e) {
        const s = t.find(Je, e);
        return s == null ? null : d(ts, s) ?? getDefinitionFromStaticAu(s, Je, CustomElementDefinition.create) ?? null;
    }
});

const ns = /*@__PURE__*/ x("processContent");

function processContent(e) {
    return e === void 0 ? function(t, e) {
        if (!e.static || e.kind !== "method") throw createMappedError(766, t);
        e.addInitializer((function() {
            m(t, this, ns);
        }));
    } : function(s, i) {
        i.addInitializer((function() {
            if (t.isString(e) || t.isSymbol(e)) {
                e = this[e];
            }
            if (!t.isFunction(e)) throw createMappedError(766, e);
            const s = d(ts, this);
            if (s !== void 0) {
                s.processContent = e;
            } else {
                m(e, this, ns);
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

const os = /*@__PURE__*/ O("IAppRoot");

class AppRoot {
    get controller() {
        return this.q;
    }
    constructor(e, s, i, n = false) {
        this.config = e;
        this.container = s;
        this.fe = void 0;
        this.de = n;
        const r = this.host = e.host;
        i.prepare(this);
        registerResolver(s, je, new t.InstanceProvider("IEventTarget", r));
        registerHostNode(s, r, this.platform = this.pe(s, r));
        this.fe = t.onResolve(this.me("creating"), (() => {
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
                name: es(),
                template: this.host,
                enhance: true,
                strict: e.strictBinding
            }) : void 0;
            const u = this.q = Controller.$el(i, h, r, a, c);
            u.hE(a);
            return t.onResolve(this.me("hydrating"), (() => {
                u.hS();
                return t.onResolve(this.me("hydrated"), (() => {
                    u.hC();
                    this.fe = void 0;
                }));
            }));
        }));
    }
    activate() {
        return t.onResolve(this.fe, (() => t.onResolve(this.me("activating"), (() => t.onResolve(this.q.activate(this.q, null, void 0), (() => this.me("activated")))))));
    }
    deactivate() {
        return t.onResolve(this.me("deactivating"), (() => t.onResolve(this.q.deactivate(this.q, null), (() => this.me("deactivated")))));
    }
    me(e) {
        const s = this.container;
        const i = this.de && !s.has(et, false) ? [] : s.getAll(et);
        return t.onResolveAll(...i.reduce(((t, s) => {
            if (s.slot === e) {
                t.push(s.run());
            }
            return t;
        }), []));
    }
    pe(t, e) {
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
        this.q?.dispose();
    }
}

const rs = /*@__PURE__*/ O("IAurelia");

class Aurelia {
    get isRunning() {
        return this.ir;
    }
    get isStarting() {
        return this.ge;
    }
    get isStopping() {
        return this.xe;
    }
    get root() {
        if (this.ve == null) {
            if (this.next == null) {
                throw createMappedError(767);
            }
            return this.next;
        }
        return this.ve;
    }
    constructor(e = t.DI.createContainer()) {
        this.container = e;
        this.ir = false;
        this.ge = false;
        this.xe = false;
        this.ve = void 0;
        this.next = void 0;
        this.ye = void 0;
        this.we = void 0;
        if (e.has(rs, true) || e.has(Aurelia, true)) {
            throw createMappedError(768);
        }
        registerResolver(e, rs, new t.InstanceProvider("IAurelia", this));
        registerResolver(e, Aurelia, new t.InstanceProvider("Aurelia", this));
        registerResolver(e, os, this.be = new t.InstanceProvider("IAppRoot"));
    }
    register(...t) {
        this.container.register(...t);
        return this;
    }
    app(t) {
        this.next = new AppRoot(t, this.container, this.be);
        return this;
    }
    enhance(e) {
        const s = e.container ?? this.container.createChild();
        const i = registerResolver(s, os, new t.InstanceProvider("IAppRoot"));
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
        if (t.isPromise(this.ye)) {
            return this.ye;
        }
        return this.ye = t.onResolve(this.stop(), (() => {
            if (!nt.hideProp) {
                Reflect.set(e.host, "$aurelia", this);
            }
            this.be.prepare(this.ve = e);
            this.ge = true;
            return t.onResolve(e.activate(), (() => {
                this.ir = true;
                this.ge = false;
                this.ye = void 0;
                this.ke(e, "au-started", e.host);
            }));
        }));
    }
    stop(e = false) {
        if (t.isPromise(this.we)) {
            return this.we;
        }
        if (this.ir === true) {
            const s = this.ve;
            this.ir = false;
            this.xe = true;
            return this.we = t.onResolve(s.deactivate(), (() => {
                Reflect.deleteProperty(s.host, "$aurelia");
                if (e) {
                    s.dispose();
                }
                this.ve = void 0;
                this.be.dispose();
                this.xe = false;
                this.ke(s, "au-stopped", s.host);
            }));
        }
    }
    dispose() {
        if (this.ir || this.xe) {
            throw createMappedError(771);
        }
        this.container.dispose();
    }
    ke(t, e, s) {
        const i = new t.platform.window.CustomEvent(e, {
            detail: this,
            bubbles: true,
            cancelable: true
        });
        s.dispatchEvent(i);
    }
}

const ls = /*@__PURE__*/ O("ISVGAnalyzer", (t => t.singleton(NoopSVGAnalyzer)));

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
        t.register($(this, this), N(this, ls));
    }
    constructor() {
        this.Ce = C(t.createLookup(), {
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
        this.Be = o("a altGlyph animate animateColor circle clipPath defs ellipse feBlend feColorMatrix feComponentTransfer feComposite feConvolveMatrix feDiffuseLighting feDisplacementMap feFlood feGaussianBlur feImage feMerge feMorphology feOffset feSpecularLighting feTile feTurbulence filter font foreignObject g glyph glyphRef image line linearGradient marker mask missing-glyph path pattern polygon polyline radialGradient rect stop svg switch symbol text textPath tref tspan use");
        this.Se = o("alignment-baseline baseline-shift clip-path clip-rule clip color-interpolation-filters color-interpolation color-profile color-rendering color cursor direction display dominant-baseline enable-background fill-opacity fill-rule fill filter flood-color flood-opacity font-family font-size-adjust font-size font-stretch font-style font-variant font-weight glyph-orientation-horizontal glyph-orientation-vertical image-rendering kerning letter-spacing lighting-color marker-end marker-mid marker-start mask opacity overflow pointer-events shape-rendering stop-color stop-opacity stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width stroke text-anchor text-decoration text-rendering unicode-bidi visibility word-spacing writing-mode");
        const e = t.resolve(it);
        this.SVGElement = e.globalThis.SVGElement;
        const s = e.document.createElement("div");
        s.innerHTML = "<svg><altGlyph /></svg>";
        if (s.firstElementChild.nodeName === "altglyph") {
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
        this.Ae = t.createLookup();
        this.Re = t.createLookup();
        this.svg = t.resolve(ls);
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
            i = this.Ae[n] ??= t.createLookup();
            for (r in s) {
                if (i[r] !== void 0) {
                    throw createError(r, n);
                }
                i[r] = s[r];
            }
        }
    }
    useGlobalMapping(t) {
        const e = this.Re;
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
        return this.Ae[t.nodeName]?.[e] ?? this.Re[e] ?? (isDataAttribute(t, e, this.svg) ? e : null);
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

const hs = {
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
        this.Te = new WeakMap;
        this.Ee = new WeakMap;
    }
    el(t, e) {
        let s = this.Te.get(t);
        if (s == null) {
            this.Te.set(t, s = new RecordCache);
        }
        return e in s.Le ? s.Le[e] : s.Le[e] = is.find(t, e);
    }
    attr(t, e) {
        let s = this.Te.get(t);
        if (s == null) {
            this.Te.set(t, s = new RecordCache);
        }
        return e in s.Me ? s.Me[e] : s.Me[e] = at.find(t, e);
    }
    bindables(e) {
        let s = this.Ee.get(e);
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
            this.Ee.set(e, s = new BindablesInfo(n, i, c ?? null));
        }
        return s;
    }
}

ResourceResolver.register = t.createImplementationRegister(e.IResourceResolver);

class RecordCache {
    constructor() {
        this.Le = t.createLookup();
        this.Me = t.createLookup();
    }
}

const as = t.createLookup();

class AttributeNSAccessor {
    static forNs(t) {
        return as[t] ??= new AttributeNSAccessor(t);
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

const cs = /*@__PURE__*/ new DataAttributeAccessor;

class SelectValueObserver {
    static qe(t) {
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
    static De(t, e) {
        return t === e;
    }
    constructor(t, e, s, i) {
        this.type = I | P | _;
        this.v = void 0;
        this.ov = void 0;
        this.Pe = false;
        this.Ie = void 0;
        this._e = void 0;
        this.iO = false;
        this.lt = false;
        this.rt = t;
        this.oL = i;
        this.cf = s;
    }
    getValue() {
        return this.iO ? this.v : this.rt.multiple ? SelectValueObserver.qe(this.rt.options) : this.rt.value;
    }
    setValue(t) {
        this.ov = this.v;
        this.v = t;
        this.Pe = t !== this.ov;
        this.Ve(t instanceof Array ? t : null);
        this.dt();
    }
    dt() {
        if (this.Pe) {
            this.Pe = false;
            this.syncOptions();
        }
    }
    handleCollectionChange() {
        this.syncOptions();
    }
    syncOptions() {
        const e = this.v;
        const s = this.rt;
        const i = t.isArray(e);
        const n = s.matcher ?? SelectValueObserver.De;
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
        const t = this.rt;
        const e = t.options;
        const s = e.length;
        const i = this.v;
        let n = 0;
        if (t.multiple) {
            if (!(i instanceof Array)) {
                return true;
            }
            let r;
            const l = t.matcher || SelectValueObserver.De;
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
    i.subscriberCollection(SelectValueObserver, null);
})();

const us = "--";

class StyleAttributeAccessor {
    constructor(t) {
        this.obj = t;
        this.type = I | _;
        this.v = "";
        this.ov = "";
        this.styles = {};
        this.version = 0;
        this.Pe = false;
    }
    getValue() {
        return this.obj.style.cssText;
    }
    setValue(t) {
        this.v = t;
        this.Pe = t !== this.ov;
        this.dt();
    }
    Oe(t) {
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
    $e(e) {
        let s;
        let i;
        const n = [];
        for (i in e) {
            s = e[i];
            if (s == null) {
                continue;
            }
            if (t.isString(s)) {
                if (i.startsWith(us)) {
                    n.push([ i, s ]);
                    continue;
                }
                n.push([ t.kebabCase(i), s ]);
                continue;
            }
            n.push(...this.Ne(s));
        }
        return n;
    }
    We(e) {
        const s = e.length;
        if (s > 0) {
            const t = [];
            let i = 0;
            for (;s > i; ++i) {
                t.push(...this.Ne(e[i]));
            }
            return t;
        }
        return t.emptyArray;
    }
    Ne(e) {
        if (t.isString(e)) {
            return this.Oe(e);
        }
        if (e instanceof Array) {
            return this.We(e);
        }
        if (e instanceof Object) {
            return this.$e(e);
        }
        return t.emptyArray;
    }
    dt() {
        if (this.Pe) {
            this.Pe = false;
            const t = this.v;
            const e = this.styles;
            const s = this.Ne(t);
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
        this.Pe = false;
        this.lt = false;
        this.rt = t;
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
        this.Pe = true;
        if (!this.cf.readonly) {
            this.dt();
        }
    }
    dt() {
        if (this.Pe) {
            this.Pe = false;
            this.rt[this.k] = this.v ?? this.cf.default;
            this.He();
        }
    }
    handleEvent() {
        this.ov = this.v;
        this.v = this.rt[this.k];
        if (this.ov !== this.v) {
            this.Pe = false;
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
    i.subscriberCollection(ValueAttributeObserver, null);
})();

const fs = (() => {
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

const ds = new i.PropertyAccessor;

ds.type = I | _;

class NodeObserverLocator {
    constructor() {
        this.allowDirtyCheck = true;
        this.je = t.createLookup();
        this.ze = t.createLookup();
        this.Ue = t.createLookup();
        this.Ge = t.createLookup();
        this.Ke = t.resolve(t.IServiceLocator);
        this.p = t.resolve(it);
        this.Xe = t.resolve(i.IDirtyChecker);
        this.svg = t.resolve(ls);
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
        const n = this.je;
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
        const s = this.ze;
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
        if (s in this.Ge || s in (this.Ue[e.tagName] ?? t.emptyObject)) {
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
            return cs;

          default:
            {
                const t = fs[s];
                if (t !== undefined) {
                    return AttributeNSAccessor.forNs(t[1]);
                }
                if (isDataAttribute(e, s, this.svg)) {
                    return cs;
                }
                return ds;
            }
        }
    }
    overrideAccessor(e, s) {
        let i;
        if (t.isString(e)) {
            i = this.Ue[e] ??= t.createLookup();
            i[s] = true;
        } else {
            for (const s in e) {
                for (const n of e[s]) {
                    i = this.Ue[s] ??= t.createLookup();
                    i[n] = true;
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
    getNodeObserver(t, e, s) {
        const n = this.je[t.tagName]?.[e] ?? this.ze[e];
        let r;
        if (n != null) {
            r = new (n.type ?? ValueAttributeObserver)(t, e, n, s, this.Ke);
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
        const r = fs[e];
        if (r !== undefined) {
            return AttributeNSAccessor.forNs(r[1]);
        }
        if (isDataAttribute(t, e, this.svg)) {
            return cs;
        }
        if (e in t.constructor.prototype) {
            if (this.allowDirtyCheck) {
                return this.Xe.createProperty(t, e);
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
        this.Qe = void 0;
        this.Ye = void 0;
        this.lt = false;
        this.rt = t;
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
        const e = this.v;
        const s = this.rt;
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
        const s = this.rt;
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
        ps = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, ps);
        ps = void 0;
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
    i.subscriberCollection(CheckedObserver, null);
})();

let ps = void 0;

class AttrBindingBehavior {
    bind(t, e) {
        if (!(e instanceof PropertyBinding)) {
            throw createMappedError(9994, e);
        }
        e.useTargetObserver(cs);
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
        this.ts = t.resolve(i.INodeObserverLocator);
    }
    bind(t, e, ...s) {
        if (!(this.ts instanceof NodeObserverLocator)) {
            throw createMappedError(9993);
        }
        if (s.length === 0) {
            throw createMappedError(802);
        }
        if (!(e instanceof PropertyBinding) || !(e.mode & u)) {
            throw createMappedError(803);
        }
        const i = this.ts.getNodeObserverConfig(e.target, e.targetProperty);
        if (i == null) {
            throw createMappedError(9992, e);
        }
        const n = this.ts.getNodeObserver(e.target, e.targetProperty, this.oL);
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
        this.es = false;
        this.ss = 0;
        this.os = t.resolve(Et);
        this.l = t.resolve(ze);
    }
    attaching(t, e) {
        return this.rs(this.value);
    }
    detaching(e, s) {
        this.es = true;
        return t.onResolve(this.pending, (() => {
            this.es = false;
            this.pending = void 0;
            void this.view?.deactivate(e, this.$controller);
        }));
    }
    valueChanged(t, e) {
        if (!this.$controller.isActive) return;
        t = !!t;
        e = !!e;
        if (t !== e) return this.rs(t);
    }
    rs(e) {
        const s = this.view;
        const i = this.$controller;
        const n = this.ss++;
        const isCurrent = () => !this.es && this.ss === n + 1;
        let r;
        return t.onResolve(this.pending, (() => this.pending = t.onResolve(s?.deactivate(s, i), (() => {
            if (!isCurrent()) {
                return;
            }
            if (e) {
                r = this.view = this.ifView = this.cache && this.ifView != null ? this.ifView : this.os.create();
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
    type: lt,
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
        this.f = t.resolve(Et);
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

const ms = [ "BindingBehavior", "ValueConverter" ];

class Repeat {
    constructor() {
        this.views = [];
        this.key = null;
        this.ls = [];
        this.cs = [];
        this.us = [];
        this.ds = new Map;
        this.ps = void 0;
        this.gs = false;
        this.xs = false;
        this.ys = null;
        this.ws = void 0;
        this.bs = false;
        this.l = t.resolve(ze);
        this.ks = t.resolve(Fe);
        this.f = t.resolve(Et);
        this.Cs = t.resolve(ys);
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
        const s = this.ks.bindings;
        const n = s.length;
        let r = void 0;
        let l;
        let h = 0;
        for (;n > h; ++h) {
            r = s[h];
            if (r.target === this && r.targetProperty === "items") {
                l = this.forOf = r.ast;
                this.Bs = r;
                let t = l.iterable;
                while (t != null && ms.includes(t.$kind)) {
                    t = t.expression;
                    this.gs = true;
                }
                this.ys = t;
                break;
            }
        }
        this.Ss();
        const a = l.declaration;
        if (!(this.bs = a.$kind === "ArrayDestructuring" || a.$kind === "ObjectDestructuring")) {
            this.local = i.astEvaluate(a, this.$controller.scope, r, null);
        }
    }
    attaching(e, s) {
        this.As();
        this.Rs(void 0);
        return this.Ts(e, this.ws ?? t.emptyArray);
    }
    detaching(t, e) {
        this.Ss();
        return this.Es(t);
    }
    unbinding(t, e) {
        this.ds.clear();
    }
    itemsChanged() {
        if (!this.$controller.isActive) {
            return;
        }
        this.Ss();
        this.As();
        this.Rs(void 0);
        this.Ls(void 0);
    }
    handleCollectionChange(t, e) {
        const s = this.$controller;
        if (!s.isActive) {
            return;
        }
        if (this.gs) {
            if (this.xs) {
                return;
            }
            this.xs = true;
            this.items = i.astEvaluate(this.forOf.iterable, s.scope, this.Bs, null);
            this.xs = false;
            return;
        }
        this.As();
        this.Rs(this.key === null ? e : void 0);
        this.Ls(e);
    }
    Ls(e) {
        const s = this.views;
        this.ls = s.slice();
        const n = s.length;
        const r = this.key;
        const l = r !== null;
        const h = this.us;
        const a = this.cs;
        if (l || e === void 0) {
            const t = this.local;
            const s = this.ws;
            const c = s.length;
            const u = this.forOf;
            const f = u.declaration;
            const d = this.Bs;
            const p = this.bs;
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
            const s = t.onResolve(this.Ms(e), (() => this.qs(e)));
            if (t.isPromise(s)) {
                s.catch(rethrow);
            }
        } else {
            this.qs(e);
        }
    }
    Ss() {
        const e = this.$controller.scope;
        let s = this.Ds;
        let n = this.gs;
        let r;
        if (n) {
            s = this.Ds = i.astEvaluate(this.ys, e, this.Bs, null) ?? null;
            n = this.gs = !t.areEqual(this.items, s);
        }
        const l = this.ps;
        if (this.$controller.isActive) {
            const t = n ? s : this.items;
            r = this.ps = this.Cs.resolve(t).getObserver?.(t);
            if (l !== r) {
                l?.unsubscribe(this);
                r?.subscribe(this);
            }
        } else {
            l?.unsubscribe(this);
            this.ps = undefined;
        }
    }
    Rs(t) {
        const e = this.cs;
        this.us = e.slice();
        const s = this.ws;
        const n = s.length;
        const r = this.cs = Array(s.length);
        const l = this.ds;
        const h = new Map;
        const a = this.$controller.scope;
        const c = this.Bs;
        const u = this.forOf;
        const f = this.local;
        const d = this.bs;
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
        this.ds = h;
    }
    As() {
        const e = this.items;
        if (t.isArray(e)) {
            this.ws = e.slice(0);
            return;
        }
        const s = [];
        this.Cs.resolve(e).iterate(e, ((t, e) => {
            s[e] = t;
        }));
        this.ws = s;
    }
    Ts(e, s) {
        let i = void 0;
        let n;
        let r;
        let l;
        const {$controller: h, f: a, l: c, cs: u} = this;
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
    Es(e) {
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
    Ms(e) {
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
    qs(e) {
        let s = void 0;
        let i;
        let n;
        let r = 0;
        const {$controller: l, f: h, l: a, views: c, cs: u, ls: f} = this;
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
    type: lt,
    name: "repeat",
    isTemplateController: true,
    bindables: [ "items" ]
};

let gs = 16;

let xs = new Int32Array(gs);

let vs = new Int32Array(gs);

function longestIncreasingSubsequence(t) {
    const e = t.length;
    if (e > gs) {
        gs = e;
        xs = new Int32Array(e);
        vs = new Int32Array(e);
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
            l = xs[s];
            n = t[l];
            if (n !== -2 && n < i) {
                vs[r] = l;
                xs[++s] = r;
                continue;
            }
            h = 0;
            a = s;
            while (h < a) {
                c = h + a >> 1;
                n = t[xs[c]];
                if (n !== -2 && n < i) {
                    h = c + 1;
                } else {
                    a = c;
                }
            }
            n = t[xs[h]];
            if (i < n || n === -2) {
                if (h > 0) {
                    vs[r] = xs[h - 1];
                }
                xs[h] = r;
            }
        }
    }
    r = ++s;
    const u = new Int32Array(r);
    i = xs[s - 1];
    while (s-- > 0) {
        u[s] = i;
        i = vs[i];
    }
    while (r-- > 0) xs[r] = 0;
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

const ys = /*@__PURE__*/ O("IRepeatableHandlerResolver", (t => t.singleton(RepeatableHandlerResolver)));

class RepeatableHandlerResolver {
    constructor() {
        this.Ps = t.resolve(t.all(ws));
    }
    resolve(t) {
        if (bs.handles(t)) {
            return bs;
        }
        if (ks.handles(t)) {
            return ks;
        }
        if (Cs.handles(t)) {
            return Cs;
        }
        if (Bs.handles(t)) {
            return Bs;
        }
        if (Ss.handles(t)) {
            return Ss;
        }
        const e = this.Ps.find((e => e.handles(t)));
        if (e !== void 0) {
            return e;
        }
        return As;
    }
}

class ArrayLikeHandler {
    static register(t) {
        t.register($(ws, this));
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

const ws = /*@__PURE__*/ O("IRepeatableHandler");

const bs = {
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

const ks = {
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

const Cs = {
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

const Bs = {
    handles: t.isNumber,
    iterate(t, e) {
        let s = 0;
        for (;s < t; ++s) {
            e(s, s, t);
        }
    }
};

const Ss = {
    handles: t => t == null,
    iterate() {}
};

const As = {
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
        this.view = t.resolve(Et).create().setLocation(t.resolve(ze));
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
    type: lt,
    name: "with",
    isTemplateController: true,
    bindables: [ "value" ]
};

class Switch {
    constructor() {
        this.cases = [];
        this.activeCases = [];
        this.promise = void 0;
        this.f = t.resolve(Et);
        this.l = t.resolve(ze);
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
        this.queue((() => this.Is(t)));
    }
    Is(e) {
        const s = e.isMatch(this.value);
        const i = this.activeCases;
        const n = i.length;
        if (!s) {
            if (n > 0 && i[0].id === e.id) {
                return this._s(null);
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
        return t.onResolve(this._s(null, r), (() => {
            this.activeCases = r;
            return this.Vs(null);
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
        return t.onResolve(this.activeCases.length > 0 ? this._s(e, i) : void 0, (() => {
            this.activeCases = i;
            if (i.length === 0) {
                return;
            }
            return this.Vs(e);
        }));
    }
    Vs(e) {
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
    _s(e, s = []) {
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
    type: lt,
    name: "switch",
    isTemplateController: true,
    bindables: [ "value" ]
};

let Rs = 0;

const Ts = [ "value", {
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
        this.id = ++Rs;
        this.fallThrough = false;
        this.view = void 0;
        this.f = t.resolve(Et);
        this.Ke = t.resolve(i.IObserverLocator);
        this.l = t.resolve(ze);
        this.Fs = t.resolve(t.ILogger).scopeTo(`${this.constructor.name}-#${this.id}`);
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
        this.Fs.debug("isMatch()");
        const s = this.value;
        if (t.isArray(s)) {
            if (this.ps === void 0) {
                this.ps = this.Hs(s);
            }
            return s.includes(e);
        }
        return s === e;
    }
    valueChanged(e, s) {
        if (t.isArray(e)) {
            this.ps?.unsubscribe(this);
            this.ps = this.Hs(e);
        } else if (this.ps !== void 0) {
            this.ps.unsubscribe(this);
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
        this.ps?.unsubscribe(this);
        this.view?.dispose();
        this.view = void 0;
    }
    linkToSwitch(t) {
        t.cases.push(this);
    }
    Hs(t) {
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
        bindables: Ts,
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
        bindables: Ts,
        isTemplateController: true
    }, DefaultCase);
})();

var Es, Ls, Ms;

class PromiseTemplateController {
    constructor() {
        this.preSettledTask = null;
        this.postSettledTask = null;
        this.f = t.resolve(Et);
        this.l = t.resolve(ze);
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
    type: lt,
    name: "promise",
    isTemplateController: true,
    bindables: [ "value" ]
};

class PendingTemplateController {
    constructor() {
        this.view = void 0;
        this.f = t.resolve(Et);
        this.l = t.resolve(ze);
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
    type: lt,
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
        this.f = t.resolve(Et);
        this.l = t.resolve(ze);
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
    type: lt,
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
        this.f = t.resolve(Et);
        this.l = t.resolve(ze);
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
    type: lt,
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

Es = Symbol.metadata;

PromiseAttributePattern[Es] = {
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

Ls = Symbol.metadata;

FulfilledAttributePattern[Ls] = {
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

Ms = Symbol.metadata;

RejectedAttributePattern[Ms] = {
    [t.registrableMetadataKey]: e.AttributePattern.create([ {
        pattern: "catch",
        symbols: ""
    } ], RejectedAttributePattern)
};

class Focus {
    constructor() {
        this.Os = false;
        this.Le = t.resolve(ot);
        this.p = t.resolve(it);
    }
    binding() {
        this.valueChanged();
    }
    valueChanged() {
        if (this.$controller.isActive) {
            this.$s();
        } else {
            this.Os = true;
        }
    }
    attached() {
        if (this.Os) {
            this.Os = false;
            this.$s();
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
        } else if (!this.Ns) {
            this.value = false;
        }
    }
    $s() {
        const t = this.Le;
        const e = this.Ns;
        const s = this.value;
        if (s && !e) {
            t.focus();
        } else if (!s && e) {
            t.blur();
        }
    }
    get Ns() {
        return this.Le === this.p.document.activeElement;
    }
}

Focus.$au = {
    type: lt,
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
        const e = t.resolve(Et);
        const s = t.resolve(ze);
        const i = t.resolve(it);
        this.p = i;
        this.Ws = i.document.createElement("div");
        (this.view = e.create()).setLocation(this.js = Lt(i));
        setEffectiveParentNode(this.view.nodes, s);
    }
    attaching(t) {
        if (this.callbackContext == null) {
            this.callbackContext = this.$controller.scope.bindingContext;
        }
        const e = this.Ws = this.zs();
        this.Us(e, this.position);
        return this.Gs(t, e);
    }
    detaching(t) {
        return this.Ks(t, this.Ws);
    }
    targetChanged() {
        const {$controller: e} = this;
        if (!e.isActive) {
            return;
        }
        const s = this.zs();
        if (this.Ws === s) {
            return;
        }
        this.Ws = s;
        const i = t.onResolve(this.Ks(null, s), (() => {
            this.Us(s, this.position);
            return this.Gs(null, s);
        }));
        if (t.isPromise(i)) {
            i.catch(rethrow);
        }
    }
    positionChanged() {
        const {$controller: e, Ws: s} = this;
        if (!e.isActive) {
            return;
        }
        const i = t.onResolve(this.Ks(null, s), (() => {
            this.Us(s, this.position);
            return this.Gs(null, s);
        }));
        if (t.isPromise(i)) {
            i.catch(rethrow);
        }
    }
    Gs(e, s) {
        const {activating: i, callbackContext: n, view: r} = this;
        return t.onResolve(i?.call(n, s, r), (() => this.Xs(e, s)));
    }
    Xs(e, s) {
        const {$controller: i, view: n} = this;
        if (e === null) {
            n.nodes.insertBefore(this.js);
        } else {
            return t.onResolve(n.activate(e ?? n, i, i.scope), (() => this.Qs(s)));
        }
        return this.Qs(s);
    }
    Qs(t) {
        const {activated: e, callbackContext: s, view: i} = this;
        return e?.call(s, t, i);
    }
    Ks(e, s) {
        const {deactivating: i, callbackContext: n, view: r} = this;
        return t.onResolve(i?.call(n, s, r), (() => this.Ys(e, s)));
    }
    Ys(e, s) {
        const {$controller: i, view: n} = this;
        if (e === null) {
            n.nodes.remove();
        } else {
            return t.onResolve(n.deactivate(e, i), (() => this.Zs(s)));
        }
        return this.Zs(s);
    }
    Zs(e) {
        const {deactivated: s, callbackContext: i, view: n} = this;
        return t.onResolve(s?.call(i, e, n), (() => this.Js()));
    }
    zs() {
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
    Js() {
        this.js.remove();
        this.js.$start.remove();
    }
    Us(t, e) {
        const s = this.js;
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
    type: lt,
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

let qs;

class AuSlot {
    constructor() {
        this.ti = null;
        this.ei = null;
        this.te = false;
        this.expose = null;
        this.slotchange = null;
        this.si = new Set;
        this.ps = null;
        const s = t.resolve(He);
        const i = t.resolve(ze);
        const n = t.resolve(e.IInstruction);
        const r = t.resolve(ae);
        const l = this.name = n.data.name;
        const h = n.projections?.[Mt];
        const a = s.instruction?.projections?.[l];
        const c = s.controller.container;
        let u;
        let f;
        if (a == null) {
            f = c.createChild({
                inheritParentResources: true
            });
            u = r.getViewFactory(h ?? (qs ??= CustomElementDefinition.create({
                name: "au-slot-empty-template",
                template: "",
                needsCompile: false
            })), f);
            this.ii = false;
        } else {
            f = c.createChild();
            f.useResources(s.parent.controller.container);
            registerResolver(f, He, new t.InstanceProvider(void 0, s.parent));
            u = r.getViewFactory(a, f);
            this.ii = true;
            this.ni = c.getAll(Pt, false)?.filter((t => t.slotName === "*" || t.slotName === l)) ?? t.emptyArray;
        }
        this.oi = (this.ni ??= t.emptyArray).length > 0;
        this.ri = s;
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
        this.si.add(t);
    }
    unsubscribe(t) {
        this.si.delete(t);
    }
    binding(t, e) {
        this.ti = e.scope;
        while (e.vmKind === "synthetic" && e.parent?.viewModel instanceof AuSlot) {
            e = e.parent.parent;
        }
        const s = e.scope.bindingContext;
        let n;
        if (this.ii) {
            n = this.ri.controller.scope.parent;
            (this.ei = i.Scope.fromParent(n, n.bindingContext)).overrideContext.$host = this.expose ?? s;
        }
    }
    attaching(e, s) {
        return t.onResolve(this.view.activate(e, this.$controller, this.ii ? this.ei : this.ti), (() => {
            if (this.oi || t.isFunction(this.slotchange)) {
                this.ni.forEach((t => t.watch(this)));
                this.Ze();
                this.li();
                this.te = true;
            }
        }));
    }
    detaching(t, e) {
        this.te = false;
        this.hi();
        this.ni.forEach((t => t.unwatch(this)));
        return this.view.deactivate(t, this.$controller);
    }
    exposeChanged(t) {
        if (this.ii && this.ei != null) {
            this.ei.overrideContext.$host = t;
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
        if (this.ps != null) {
            return;
        }
        const t = this.l;
        const e = t.parentElement;
        if (e == null) {
            return;
        }
        (this.ps = createMutationObserver(e, (e => {
            if (isMutationWithinLocation(t, e)) {
                this.li();
            }
        }))).observe(e, {
            childList: true
        });
    }
    hi() {
        this.ps?.disconnect();
        this.ps = null;
    }
    li() {
        const t = this.nodes;
        const e = new Set(this.si);
        let s;
        if (this.te) {
            this.slotchange?.call(void 0, this.name, t);
        }
        for (s of e) {
            s.handleSlotChange(this, t);
        }
    }
}

AuSlot.$au = {
    type: Je,
    name: "au-slot",
    template: null,
    containerless: true,
    processContent(t, e, s) {
        s.name = t.getAttribute("name") ?? Mt;
        let i = t.firstChild;
        let n = null;
        while (i !== null) {
            n = i.nextSibling;
            if (isElement(i) && i.hasAttribute(qt)) {
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
        this.ai = void 0;
        this.tag = null;
        this.c = t.resolve(t.IContainer);
        this.parent = t.resolve(Fe);
        this.ci = t.resolve(ot);
        this.l = t.resolve(ze);
        this.p = t.resolve(it);
        this.r = t.resolve(ae);
        this.ui = t.resolve(e.IInstruction);
        this.fi = t.resolve(t.transient(CompositionContextFactory, null));
        this.vt = t.resolve(e.ITemplateCompiler);
        this.et = t.resolve(He);
        this.ep = t.resolve(r.IExpressionParser);
        this.oL = t.resolve(i.IObserverLocator);
    }
    get composing() {
        return this.di;
    }
    get composition() {
        return this.ai;
    }
    attaching(e, s) {
        return this.di = t.onResolve(this.queue(new ChangeInfo(this.template, this.component, this.model, void 0), e), (t => {
            if (this.fi.pi(t)) {
                this.di = void 0;
            }
        }));
    }
    detaching(e) {
        const s = this.ai;
        const i = this.di;
        this.fi.invalidate();
        this.ai = this.di = void 0;
        return t.onResolve(i, (() => s?.deactivate(e)));
    }
    propertyChanged(e) {
        if (e === "composing" || e === "composition") return;
        if (e === "model" && this.ai != null) {
            this.ai.update(this.model);
            return;
        }
        if (e === "tag" && this.ai?.controller.vmKind === Re) {
            return;
        }
        this.di = t.onResolve(this.di, (() => t.onResolve(this.queue(new ChangeInfo(this.template, this.component, this.model, e), void 0), (t => {
            if (this.fi.pi(t)) {
                this.di = void 0;
            }
        }))));
    }
    queue(e, s) {
        const i = this.fi;
        const n = this.ai;
        return t.onResolve(i.create(e), (e => {
            if (i.pi(e)) {
                return t.onResolve(this.compose(e), (r => {
                    if (i.pi(e)) {
                        return t.onResolve(r.activate(s), (() => {
                            if (i.pi(e)) {
                                this.ai = r;
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
        const {mi: s, gi: n, xi: r} = e.change;
        const {c: l, $controller: h, l: a, ui: c} = this;
        const u = this.yi(this.et.controller.container, n);
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
        const m = this.wi(f, typeof n === "string" ? u.Type : n, d, p);
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
                this.bi(d, u, r).forEach((t => l.addBinding(t)));
                return new CompositionController(l, (t => l.activate(t ?? l, h, h.scope.parent)), (e => t.onResolve(l.deactivate(e ?? l, h), removeCompositionHost)), (t => m.activate?.(t)), e);
            } else {
                const r = CustomElementDefinition.create({
                    name: is.generateName(),
                    template: s
                });
                const l = this.r.getViewFactory(r, f);
                const a = Controller.$view(l, h);
                const c = this.scopeBehavior === "auto" ? i.Scope.fromParent(this.parent.scope, m) : i.Scope.create(m);
                a.setHost(d);
                if (p == null) {
                    this.bi(d, r, n).forEach((t => a.addBinding(t)));
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
    wi(e, s, i, n) {
        if (s == null) {
            return new EmptyComponent;
        }
        if (typeof s === "object") {
            return s;
        }
        const r = this.p;
        registerHostNode(e, i, r);
        registerResolver(e, ze, new t.InstanceProvider("IRenderLocation", n));
        const l = e.invoke(s);
        registerResolver(e, s, new t.InstanceProvider("au-compose.component", l));
        return l;
    }
    yi(e, s) {
        if (typeof s === "string") {
            const t = is.find(e, s);
            if (t == null) {
                throw createMappedError(806, s);
            }
            return t;
        }
        const i = t.isFunction(s) ? s : s?.constructor;
        return is.isType(i, void 0) ? is.getDefinition(i, null) : null;
    }
    bi(t, e, s) {
        const i = new HydrationContext(this.$controller, {
            projections: null,
            captures: s
        }, this.et.parent);
        return SpreadBinding.create(i, t, e, this.r, this.vt, this.p, this.ep, this.oL);
    }
}

AuCompose.$au = {
    type: Je,
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
    pi(t) {
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
        this.mi = t;
        this.gi = e;
        this.xi = s;
        this.ki = i;
    }
    load() {
        if (t.isPromise(this.mi) || t.isPromise(this.gi)) {
            return Promise.all([ this.mi, this.gi ]).then((([t, e]) => new LoadedChangeInfo(t, e, this.xi, this.ki)));
        } else {
            return new LoadedChangeInfo(this.mi, this.gi, this.xi, this.ki);
        }
    }
}

class LoadedChangeInfo {
    constructor(t, e, s, i) {
        this.mi = t;
        this.gi = e;
        this.xi = s;
        this.ki = i;
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

const Ds = /*@__PURE__*/ O("ISanitizer", (t => t.singleton(class {
    sanitize() {
        throw createMappedError(99, "sanitize");
    }
})));

class SanitizeValueConverter {
    constructor() {
        this.Ci = t.resolve(Ds);
    }
    toView(t) {
        if (t == null) {
            return null;
        }
        return this.Ci.sanitize(t);
    }
}

SanitizeValueConverter.$au = {
    type: ft,
    name: "sanitize"
};

class Show {
    constructor() {
        this.el = t.resolve(ot);
        this.p = t.resolve(it);
        this.Bi = false;
        this.L = null;
        this.$val = "";
        this.$prio = "";
        this.update = () => {
            this.L = null;
            if (Boolean(this.value) !== this.Si) {
                if (this.Si === this.Ai) {
                    this.Si = !this.Ai;
                    this.$val = this.el.style.getPropertyValue("display");
                    this.$prio = this.el.style.getPropertyPriority("display");
                    this.el.style.setProperty("display", "none", "important");
                } else {
                    this.Si = this.Ai;
                    this.el.style.setProperty("display", this.$val, this.$prio);
                    if (this.el.getAttribute("style") === "") {
                        this.el.removeAttribute("style");
                    }
                }
            }
        };
        const s = t.resolve(e.IInstruction);
        this.Si = this.Ai = s.alias !== "hide";
    }
    binding() {
        this.Bi = true;
        this.update();
    }
    detaching() {
        this.Bi = false;
        this.L?.cancel();
        this.L = null;
    }
    valueChanged() {
        if (this.Bi && this.L === null) {
            this.L = this.p.domQueue.queueTask(this.update);
        }
    }
}

Show.$au = {
    type: lt,
    name: "show",
    bindables: [ "value" ],
    aliases: [ "hide" ]
};

const Ps = [ hs, i.DirtyChecker, NodeObserverLocator ];

const Is = [ e.RefAttributePattern, e.DotSeparatedAttributePattern, e.EventAttributePattern, Tt ];

const _s = [ e.AtPrefixedTriggerAttributePattern, e.ColonPrefixedBindAttributePattern ];

const Vs = [ e.DefaultBindingCommand, e.OneTimeBindingCommand, e.FromViewBindingCommand, e.ToViewBindingCommand, e.TwoWayBindingCommand, e.ForBindingCommand, e.RefBindingCommand, e.TriggerBindingCommand, e.CaptureBindingCommand, e.ClassBindingCommand, e.StyleBindingCommand, e.AttrBindingCommand, e.SpreadValueBindingCommand ];

const Fs = [ DebounceBindingBehavior, OneTimeBindingBehavior, ToViewBindingBehavior, FromViewBindingBehavior, SignalBindingBehavior, ThrottleBindingBehavior, TwoWayBindingBehavior, SanitizeValueConverter, If, Else, Repeat, With, Switch, Case, DefaultCase, PromiseTemplateController, PendingTemplateController, FulfilledTemplateController, RejectedTemplateController, PromiseAttributePattern, FulfilledAttributePattern, RejectedAttributePattern, AttrBindingBehavior, SelfBindingBehavior, UpdateTriggerBindingBehavior, AuCompose, Portal, Focus, Show, AuSlot ];

const Hs = [ jt, zt, Nt, Wt, Vt, Ft, Ht, Ot, $t, Kt, Jt, Xt, Qt, Yt, Zt, Ut, te, ee ];

const Os = /*@__PURE__*/ createConfiguration(t.noop);

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
            return e.register(W(i.ICoercionConfiguration, s.coercingOptions), r.ExpressionParser, ...Ps, ...Fs, ...Is, ...Vs, ...Hs);
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
        this.Ri = void 0;
        this.isBound = false;
        this.obj = e;
        this.cb = s;
        this.Z = i;
        this.Ti = n;
        this.Ei = r;
        this.ps = createMutationObserver(this.ci = t, (() => {
            this.Li();
        }));
    }
    getValue() {
        return this.isBound ? this.Ri : this.Mi();
    }
    setValue(t) {}
    bind() {
        if (this.isBound) {
            return;
        }
        this.isBound = true;
        this.ps.observe(this.ci, {
            childList: true
        });
        this.Ri = this.Mi();
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        this.ps.takeRecords();
        this.ps.disconnect();
        this.Ri = t.emptyArray;
    }
    Li() {
        this.Ri = this.Mi();
        this.cb?.call(this.obj);
        this.subs.notify(this.Ri, undefined);
    }
    get() {
        throw createMappedError(99, "get");
    }
    Mi() {
        const t = this.Z;
        const e = this.Ti;
        const s = this.Ei;
        const i = t === "$all" ? this.ci.childNodes : this.ci.querySelectorAll(`:scope > ${t}`);
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
        this.J = t;
    }
    register(t) {
        W(ct, this).register(t);
    }
    hydrating(t, e) {
        const s = this.J;
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

exports.AttributeBindingRenderer = Jt;

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

exports.CustomAttribute = at;

exports.CustomAttributeDefinition = CustomAttributeDefinition;

exports.CustomAttributeRenderer = Ht;

exports.CustomElement = is;

exports.CustomElementDefinition = CustomElementDefinition;

exports.CustomElementRenderer = Ft;

exports.DataAttributeAccessor = DataAttributeAccessor;

exports.DebounceBindingBehavior = DebounceBindingBehavior;

exports.DefaultBindingLanguage = Vs;

exports.DefaultBindingSyntax = Is;

exports.DefaultCase = DefaultCase;

exports.DefaultComponents = Ps;

exports.DefaultRenderers = Hs;

exports.DefaultResources = Fs;

exports.Else = Else;

exports.EventModifier = EventModifier;

exports.EventModifierRegistration = Tt;

exports.ExpressionWatcher = ExpressionWatcher;

exports.FlushQueue = FlushQueue;

exports.Focus = Focus;

exports.FragmentNodeSequence = FragmentNodeSequence;

exports.FromViewBindingBehavior = FromViewBindingBehavior;

exports.FulfilledTemplateController = FulfilledTemplateController;

exports.IAppRoot = os;

exports.IAppTask = et;

exports.IAuSlotWatcher = Pt;

exports.IAuSlotsInfo = Dt;

exports.IAurelia = rs;

exports.IController = Fe;

exports.IEventModifier = Rt;

exports.IEventTarget = je;

exports.IFlushQueue = xt;

exports.IHistory = Qe;

exports.IHydrationContext = He;

exports.IKeyMapping = At;

exports.ILifecycleHooks = ct;

exports.IListenerBindingOptions = Gt;

exports.ILocation = Xe;

exports.IModifiedEventHandlerCreator = St;

exports.INode = ot;

exports.IPlatform = it;

exports.IRenderLocation = ze;

exports.IRenderer = _t;

exports.IRendering = ae;

exports.IRepeatableHandler = ws;

exports.IRepeatableHandlerResolver = ys;

exports.ISVGAnalyzer = ls;

exports.ISanitizer = Ds;

exports.IShadowDOMGlobalStyles = fe;

exports.IShadowDOMStyleFactory = ce;

exports.IShadowDOMStyles = ue;

exports.ISignaler = Z;

exports.IViewFactory = Et;

exports.IWindow = Ke;

exports.If = If;

exports.InterpolationBinding = InterpolationBinding;

exports.InterpolationBindingRenderer = Wt;

exports.InterpolationPartBinding = InterpolationPartBinding;

exports.IteratorBindingRenderer = zt;

exports.LetBinding = LetBinding;

exports.LetElementRenderer = $t;

exports.LifecycleHooks = ut;

exports.LifecycleHooksDefinition = LifecycleHooksDefinition;

exports.LifecycleHooksEntry = LifecycleHooksEntry;

exports.ListenerBinding = ListenerBinding;

exports.ListenerBindingOptions = ListenerBindingOptions;

exports.ListenerBindingRenderer = Kt;

exports.MountTarget = Ce;

exports.NodeObserverLocator = NodeObserverLocator;

exports.NoopSVGAnalyzer = NoopSVGAnalyzer;

exports.OneTimeBindingBehavior = OneTimeBindingBehavior;

exports.PendingTemplateController = PendingTemplateController;

exports.Portal = Portal;

exports.PromiseTemplateController = PromiseTemplateController;

exports.PropertyBinding = PropertyBinding;

exports.PropertyBindingRenderer = jt;

exports.RefBinding = RefBinding;

exports.RefBindingRenderer = Nt;

exports.RejectedTemplateController = RejectedTemplateController;

exports.Rendering = Rendering;

exports.Repeat = Repeat;

exports.RuntimeTemplateCompilerImplementation = hs;

exports.SVGAnalyzer = SVGAnalyzer;

exports.SanitizeValueConverter = SanitizeValueConverter;

exports.SelectValueObserver = SelectValueObserver;

exports.SelfBindingBehavior = SelfBindingBehavior;

exports.SetAttributeRenderer = Xt;

exports.SetClassAttributeRenderer = Qt;

exports.SetPropertyRenderer = Vt;

exports.SetStyleAttributeRenderer = Yt;

exports.ShadowDOMRegistry = ShadowDOMRegistry;

exports.ShortHandBindingSyntax = _s;

exports.SignalBindingBehavior = SignalBindingBehavior;

exports.SpreadRenderer = te;

exports.StandardConfiguration = Os;

exports.State = Ve;

exports.StyleAttributeAccessor = StyleAttributeAccessor;

exports.StyleConfiguration = de;

exports.StyleElementStyles = StyleElementStyles;

exports.StylePropertyBindingRenderer = Zt;

exports.Switch = Switch;

exports.TemplateControllerRenderer = Ot;

exports.TextBindingRenderer = Ut;

exports.ThrottleBindingBehavior = ThrottleBindingBehavior;

exports.ToViewBindingBehavior = ToViewBindingBehavior;

exports.TwoWayBindingBehavior = TwoWayBindingBehavior;

exports.UpdateTriggerBindingBehavior = UpdateTriggerBindingBehavior;

exports.ValueAttributeObserver = ValueAttributeObserver;

exports.ValueConverter = pt;

exports.ValueConverterDefinition = ValueConverterDefinition;

exports.ViewFactory = ViewFactory;

exports.Watch = rt;

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

exports.isCustomElementController = isCustomElementController;

exports.isCustomElementViewModel = isCustomElementViewModel;

exports.isRenderLocation = isRenderLocation;

exports.lifecycleHooks = lifecycleHooks;

exports.mixinAstEvaluator = gt;

exports.mixinUseScope = mt;

exports.mixingBindingLimited = vt;

exports.processContent = processContent;

exports.refs = nt;

exports.registerAliases = registerAliases;

exports.registerHostNode = registerHostNode;

exports.renderer = renderer;

exports.setEffectiveParentNode = setEffectiveParentNode;

exports.shadowCSS = shadowCSS;

exports.slotted = slotted;

exports.templateController = templateController;

exports.useShadowDOM = useShadowDOM;

exports.valueConverter = valueConverter;

exports.watch = watch;
//# sourceMappingURL=index.cjs.map
