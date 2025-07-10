"use strict";

var t = require("@aurelia/kernel");

var e = require("@aurelia/template-compiler");

var s = require("@aurelia/metadata");

var i = require("@aurelia/runtime");

var n = require("@aurelia/platform-browser");

var r = require("@aurelia/expression-parser");

typeof SuppressedError === "function" ? SuppressedError : function(t, e, s) {
    var i = new Error(s);
    return i.name = "SuppressedError", i.error = t, i.suppressed = e, i;
};

const {default: l, oneTime: h, toView: a, fromView: c, twoWay: u} = e.BindingMode;

const f = s.Metadata.get;

const d = s.Metadata.has;

const p = s.Metadata.define;

const {annotation: m} = t.Protocol;

const g = m.keyFor;

const x = Object;

const v = String;

const y = x.prototype;

const w = y.hasOwnProperty;

const b = x.freeze;

const k = x.assign;

const C = x.getOwnPropertyNames;

const B = x.keys;

const S = /*@__PURE__*/ t.createLookup();

const isDataAttribute = (e, s, i) => {
    if (S[s] === true) {
        return true;
    }
    if (!t.isString(s)) {
        return false;
    }
    const n = s.slice(0, 5);
    return S[s] = n === "aria-" || n === "data-" || i.isStandardSvgAttribute(e, s);
};

const rethrow = t => {
    throw t;
};

const A = Reflect.defineProperty;

const defineHiddenProp = (t, e, s) => {
    A(t, e, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: s
    });
    return s;
};

const addSignalListener = (t, e, s) => t.addSignalListener(e, s);

const removeSignalListener = (t, e, s) => t.removeSignalListener(e, s);

const R = "Interpolation";

const T = "IsIterator";

const E = "IsFunction";

const L = "IsProperty";

const M = "pending";

const q = "running";

const D = i.AccessorType.Observer;

const P = i.AccessorType.Node;

const I = i.AccessorType.Layout;

const createMappedError = (t, ...e) => {
    const s = v(t).padStart(4, "0");
    return new Error(`AUR${s}:${e.map(v)}`);
};

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
        const l = s.metadata[_] ??= t.createLookup();
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

const _ = /*@__PURE__*/ g("bindables");

const V = b({
    name: _,
    keyFrom: t => `${_}:${t}`,
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
                e.forEach(e => t.isString(e) ? addName(e) : addDescription(e.name, e));
            } else if (e instanceof BindableDefinition) {
                s[e.name] = e;
            } else if (e !== void 0) {
                B(e).forEach(t => addDescription(t, e[t]));
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
            const t = f(_, r);
            if (t == null) continue;
            s.push(...Object.values(t));
        }
        return s;
    },
    i(e, s) {
        let i = f(_, s);
        if (i == null) {
            p(i = t.createLookup(), s, _);
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
        const n = i.mode ?? a;
        return new BindableDefinition(i.attribute ?? t.kebabCase(s), i.callback ?? `${s}Changed`, t.isString(n) ? e.BindingMode[n] ?? l : n, i.primary ?? false, i.name ?? s, i.set ?? getInterceptor(i));
    }
}

function coercer(t, e) {
    e.addInitializer(function() {
        F.define(this, e.name);
    });
}

const F = {
    key: /*@__PURE__*/ g("coercer"),
    define(t, e) {
        p(t[e].bind(t), t, F.key);
    },
    for(t) {
        return f(F.key, t);
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
            i = typeof e === "function" ? e.bind(s) : F.for(s) ?? t.noop;
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

const H = t.DI.createInterface;

const O = t.Registration.singleton;

const $ = t.Registration.aliasTo;

const N = t.Registration.instance;

t.Registration.callback;

t.Registration.transient;

const registerResolver = (t, e, s) => t.registerResolver(e, s);

function alias(...t) {
    return function(e, s) {
        s.addInitializer(function() {
            const e = g("aliases");
            const s = f(e, this);
            if (s === void 0) {
                p(t, this, e);
            } else {
                s.push(...t);
            }
        });
    };
}

function registerAliases(t, e, s, i) {
    for (let n = 0, r = t.length; n < r; ++n) {
        $(s, e.keyFrom(t[n])).register(i);
    }
}

const W = "custom-element";

const j = "custom-attribute";

const getDefinitionFromStaticAu = (t, e, s, i = "__au_static_resource__") => {
    let n = f(i, t);
    if (n == null) {
        if (t.$au?.type === e) {
            n = s(t.$au, t);
            p(n, t, i);
        }
    }
    return n;
};

function bindingBehavior(t) {
    return function(e, s) {
        s.addInitializer(function() {
            G.define(t, this);
        });
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
        return new BindingBehaviorDefinition(s, t.firstDefined(getBehaviorAnnotation(s, "name"), i), t.mergeArrays(getBehaviorAnnotation(s, "aliases"), n.aliases, s.aliases), G.keyFrom(i));
    }
    register(t, e) {
        const s = this.Type;
        const i = typeof e === "string" ? getBindingBehaviorKeyFrom(e) : this.key;
        const n = this.aliases;
        if (!t.has(i, false)) {
            t.register(t.has(s, false) ? null : O(s, s), $(s, i), ...n.map(t => $(s, getBindingBehaviorKeyFrom(t))));
        }
    }
}

const z = "binding-behavior";

const U = /*@__PURE__*/ t.getResourceKeyFor(z);

const getBehaviorAnnotation = (t, e) => f(g(e), t);

const getBindingBehaviorKeyFrom = t => `${U}:${t}`;

const G = /*@__PURE__*/ b({
    name: U,
    keyFrom: getBindingBehaviorKeyFrom,
    isType(e) {
        return t.isFunction(e) && (d(U, e) || e.$au?.type === z);
    },
    define(e, s) {
        const i = BindingBehaviorDefinition.create(e, s);
        const n = i.Type;
        p(i, n, U, t.resourceBaseName);
        return n;
    },
    getDefinition(t) {
        const e = f(U, t) ?? getDefinitionFromStaticAu(t, z, BindingBehaviorDefinition.create);
        if (e === void 0) {
            throw createMappedError(151, t);
        }
        return e;
    },
    find(t, e) {
        const s = t.find(z, e);
        return s == null ? null : f(U, s) ?? getDefinitionFromStaticAu(s, z, BindingBehaviorDefinition.create) ?? null;
    },
    get(e, s) {
        return e.get(t.resource(getBindingBehaviorKeyFrom(s)));
    }
});

const X = new Map;

const createConfig = t => ({
    type: z,
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
        return h;
    }
}

OneTimeBindingBehavior.$au = createConfig("oneTime");

class ToViewBindingBehavior extends BindingModeBehavior {
    get mode() {
        return a;
    }
}

ToViewBindingBehavior.$au = createConfig("toView");

class FromViewBindingBehavior extends BindingModeBehavior {
    get mode() {
        return c;
    }
}

FromViewBindingBehavior.$au = createConfig("fromView");

class TwoWayBindingBehavior extends BindingModeBehavior {
    get mode() {
        return u;
    }
}

TwoWayBindingBehavior.$au = createConfig("twoWay");

const K = new WeakMap;

const Q = 200;

class DebounceBindingBehavior {
    constructor() {
        this.p = t.resolve(t.IPlatform);
    }
    bind(e, s, i, n) {
        const r = {
            type: "debounce",
            delay: i ?? Q,
            now: this.p.performanceNow,
            queue: this.p.taskQueue,
            signals: t.isString(n) ? [ n ] : n ?? t.emptyArray
        };
        const l = s.limit?.(r);
        if (l == null) ; else {
            K.set(s, l);
        }
    }
    unbind(t, e) {
        K.get(e)?.dispose();
        K.delete(e);
    }
}

DebounceBindingBehavior.$au = {
    type: z,
    name: "debounce"
};

const Y = /*@__PURE__*/ H("ISignaler", t => t.singleton(Signaler));

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
        this.u = t.resolve(Y);
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
    type: z,
    name: "signal"
};

const Z = new WeakMap;

const J = 200;

class ThrottleBindingBehavior {
    constructor() {
        ({performanceNow: this.C, taskQueue: this.B} = t.resolve(t.IPlatform));
    }
    bind(e, s, i, n) {
        const r = {
            type: "throttle",
            delay: i ?? J,
            now: this.C,
            queue: this.B,
            signals: t.isString(n) ? [ n ] : n ?? t.emptyArray
        };
        const l = s.limit?.(r);
        if (l == null) ; else {
            Z.set(s, l);
        }
    }
    unbind(t, e) {
        Z.get(e)?.dispose();
        Z.delete(e);
    }
}

ThrottleBindingBehavior.$au = {
    type: z,
    name: "throttle"
};

const tt = /*@__PURE__*/ H("IAppTask");

class $AppTask {
    constructor(t, e, s) {
        this.c = void 0;
        this.slot = t;
        this.k = e;
        this.cb = s;
    }
    register(t) {
        return this.c = t.register(N(tt, this));
    }
    run() {
        const t = this.k;
        const e = this.cb;
        return t === null ? e() : e(this.c.get(t));
    }
}

const et = b({
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

const st = t.IPlatform;

class Refs {}

const it = /*@__PURE__*/ (() => {
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

const nt = /*@__PURE__*/ H("INode");

function watch(e, s, i) {
    if (e == null) {
        throw createMappedError(772);
    }
    return function decorator(n, r) {
        const l = r.kind === "class";
        let h;
        let a;
        if (l) {
            if (!t.isFunction(s) && (s == null || !(s in n.prototype))) {
                throw createMappedError(773, `${v(s)}@${n.name}}`);
            }
            a = s;
            h = i ?? {};
        } else {
            if (!t.isFunction(n) || r.static) {
                throw createMappedError(774, r.name);
            }
            a = n;
            h = s ?? {};
        }
        const c = new WatchDefinition(e, a, h.flush);
        if (l) {
            addDefinition(n);
        } else {
            let t = false;
            r.addInitializer(function() {
                if (!t) {
                    t = true;
                    addDefinition(this.constructor);
                }
            });
        }
        function addDefinition(t) {
            rt.add(t, c);
            if (isAttributeType(t)) {
                getAttributeDefinition(t).watches.push(c);
            }
            if (isElementType(t)) {
                getElementDefinition(t).watches.push(c);
            }
        }
    };
}

class WatchDefinition {
    constructor(t, e, s = "async") {
        this.expression = t;
        this.callback = e;
        this.flush = s;
    }
}

const rt = /*@__PURE__*/ (() => {
    const e = new WeakMap;
    return b({
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
        s.addInitializer(function() {
            defineAttribute(t, this);
        });
        return e;
    };
}

function templateController(e) {
    return function(s, i) {
        i.addInitializer(function() {
            defineAttribute(t.isString(e) ? {
                isTemplateController: true,
                name: e
            } : {
                isTemplateController: true,
                ...e
            }, this);
        });
        return s;
    };
}

class CustomAttributeDefinition {
    get type() {
        return j;
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
        const h = t.firstDefined(getAttributeAnnotation(i, "defaultBindingMode"), r.defaultBindingMode, i.defaultBindingMode, a);
        for (const t of Object.values(V.from(r.bindables))) {
            V.i(t, i);
        }
        return new CustomAttributeDefinition(i, t.firstDefined(getAttributeAnnotation(i, "name"), n), t.mergeArrays(getAttributeAnnotation(i, "aliases"), r.aliases, i.aliases), getAttributeKeyFrom(n), t.isString(h) ? e.BindingMode[h] ?? l : h, t.firstDefined(getAttributeAnnotation(i, "isTemplateController"), r.isTemplateController, i.isTemplateController, false), V.from(...V.getAll(i), getAttributeAnnotation(i, "bindables"), i.bindables, r.bindables), t.firstDefined(getAttributeAnnotation(i, "noMultiBindings"), r.noMultiBindings, i.noMultiBindings, false), t.mergeArrays(rt.getDefinitions(i), i.watches), t.mergeArrays(getAttributeAnnotation(i, "dependencies"), r.dependencies, i.dependencies), t.firstDefined(getAttributeAnnotation(i, "containerStrategy"), r.containerStrategy, i.containerStrategy, "reuse"));
    }
    register(e, s) {
        const i = this.Type;
        const n = typeof s === "string" ? getAttributeKeyFrom(s) : this.key;
        const r = this.aliases;
        if (!e.has(n, false)) {
            e.register(e.has(i, false) ? null : O(i, i), $(i, n), ...r.map(t => $(i, getAttributeKeyFrom(t))));
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

const lt = /*@__PURE__*/ t.getResourceKeyFor(ot);

const getAttributeKeyFrom = t => `${lt}:${t}`;

const getAttributeAnnotation = (t, e) => f(g(e), t);

const isAttributeType = e => t.isFunction(e) && (d(lt, e) || e.$au?.type === ot);

const findAttributeControllerFor = (t, e) => it.get(t, getAttributeKeyFrom(e)) ?? void 0;

const defineAttribute = (e, s) => {
    const i = CustomAttributeDefinition.create(e, s);
    const n = i.Type;
    p(i, n, lt, t.resourceBaseName);
    return n;
};

const getAttributeDefinition = t => {
    const e = f(lt, t) ?? getDefinitionFromStaticAu(t, ot, CustomAttributeDefinition.create);
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
        const t = it.get(r, i);
        if (t?.is(n)) {
            return t;
        }
        r = getEffectiveParentNode(r);
    }
    return null;
};

const ht = /*@__PURE__*/ b({
    name: lt,
    keyFrom: getAttributeKeyFrom,
    isType: isAttributeType,
    for: findAttributeControllerFor,
    closest: findClosestControllerByName,
    define: defineAttribute,
    getDefinition: getAttributeDefinition,
    annotate(t, e, s) {
        p(s, t, g(e));
    },
    getAnnotation: getAttributeAnnotation,
    find(t, e) {
        const s = t.find(ot, e);
        return s === null ? null : f(lt, s) ?? getDefinitionFromStaticAu(s, ot, CustomAttributeDefinition.create) ?? null;
    }
});

const at = /*@__PURE__*/ H("ILifecycleHooks");

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
        while (i !== y) {
            for (const t of C(i)) {
                if (t !== "constructor" && !t.startsWith("_")) {
                    s.add(t);
                }
            }
            i = Object.getPrototypeOf(i);
        }
        return new LifecycleHooksDefinition(e, s);
    }
}

const ct = /*@__PURE__*/ (() => {
    const t = new WeakMap;
    const e = new WeakMap;
    return b({
        define(t, s) {
            const i = LifecycleHooksDefinition.create(t, s);
            const n = i.Type;
            e.set(n, i);
            return {
                register(t) {
                    O(at, n).register(t);
                }
            };
        },
        resolve(s) {
            let i = t.get(s);
            if (i === void 0) {
                t.set(s, i = new LifecycleHooksLookupImpl);
                const n = s.root;
                const r = n === s ? s.getAll(at) : s.has(at, false) ? n.getAll(at).concat(s.getAll(at)) : n.getAll(at);
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
        i[t.registrableMetadataKey] = ct.define({}, e);
        return e;
    }
    return e == null ? decorator : decorator(e, s);
}

function valueConverter(t) {
    return function(e, s) {
        s.addInitializer(function() {
            dt.define(t, this);
        });
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
        return new ValueConverterDefinition(s, t.firstDefined(getConverterAnnotation(s, "name"), i), t.mergeArrays(getConverterAnnotation(s, "aliases"), n.aliases, s.aliases), dt.keyFrom(i));
    }
    register(t, e) {
        const s = this.Type;
        const i = typeof e === "string" ? getValueConverterKeyFrom(e) : this.key;
        const n = this.aliases;
        if (!t.has(i, false)) {
            t.register(t.has(s, false) ? null : O(s, s), $(s, i), ...n.map(t => $(s, getValueConverterKeyFrom(t))));
        }
    }
}

const ut = "value-converter";

const ft = /*@__PURE__*/ t.getResourceKeyFor(ut);

const getConverterAnnotation = (t, e) => f(g(e), t);

const getValueConverterKeyFrom = t => `${ft}:${t}`;

const dt = b({
    name: ft,
    keyFrom: getValueConverterKeyFrom,
    isType(e) {
        return t.isFunction(e) && (d(ft, e) || e.$au?.type === ut);
    },
    define(e, s) {
        const i = ValueConverterDefinition.create(e, s);
        const n = i.Type;
        p(i, n, ft, t.resourceBaseName);
        return n;
    },
    getDefinition(t) {
        const e = f(ft, t) ?? getDefinitionFromStaticAu(t, ut, ValueConverterDefinition.create);
        if (e === void 0) {
            throw createMappedError(152, t);
        }
        return e;
    },
    annotate(t, e, s) {
        p(s, t, g(e));
    },
    getAnnotation: getConverterAnnotation,
    find(t, e) {
        const s = t.find(ut, e);
        return s == null ? null : f(ft, s) ?? getDefinitionFromStaticAu(s, ut, ValueConverterDefinition.create) ?? null;
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
        if (this.b.isBound) {
            this.b.updateSource(this.v);
        }
    }
    handleChange(t, e) {
        const s = this.b;
        if (t !== i.astEvaluate(s.ast, s.s, s, null)) {
            this.v = t;
            this.A.add(this);
        }
    }
}

const pt = /*@__PURE__*/ (() => {
    function useScope(t) {
        this.s = t;
    }
    return t => {
        defineHiddenProp(t.prototype, "useScope", useScope);
    };
})();

const mt = /*@__PURE__*/ (() => {
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
        return i[s] ??= G.get(t.l, s);
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
        return i[s] ??= dt.get(e.l, s);
    }
    function evaluatorBindConverter(t) {
        const e = evaluatorGetConverter(this, t);
        if (e == null) {
            throw createMappedError(103, t);
        }
        const s = e.signals;
        if (s != null) {
            const t = this.l.get(Y);
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
        const s = this.l.get(Y);
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
        const r = n.withContext === true;
        let l = null;
        if (r) {
            const t = this.l.get(De);
            const e = t.controller;
            const s = e.viewModel;
            l = {
                source: s,
                binding: this
            };
        }
        switch (e) {
          case "toView":
            {
                if ("toView" in n) {
                    return r ? n.toView(s, l, ...i) : n.toView(s, ...i);
                }
                return s;
            }

          case "fromView":
            {
                if ("fromView" in n) {
                    return r ? n.fromView?.(s, l, ...i) : n.fromView?.(s, ...i);
                }
                return s;
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

const gt = /*@__PURE__*/ H("IFlushQueue", t => t.singleton(FlushQueue));

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

const xt = /*@__PURE__*/ (() => {
    const t = new WeakSet;
    const debounced = (t, e, s) => {
        let n;
        let r;
        let l;
        let h = false;
        const callOriginalCallback = () => e(l);
        const fn = e => {
            l = e;
            if (s.isBound) {
                r = n;
                n = i.queueAsyncTask(callOriginalCallback, {
                    delay: t.delay
                });
                r?.cancel();
            } else {
                callOriginalCallback();
            }
        };
        const a = fn.dispose = () => {
            r?.cancel();
            n?.cancel();
            r = n = void 0;
        };
        fn.flush = () => {
            h = n?.status === M;
            a();
            if (h) {
                callOriginalCallback();
            }
        };
        return fn;
    };
    const throttled = (t, e, s) => {
        let n;
        let r;
        let l = 0;
        let h = 0;
        let a;
        let c = false;
        const now = () => t.now();
        const callOriginalCallback = () => e(a);
        const fn = e => {
            a = e;
            if (s.isBound) {
                h = now() - l;
                r = n;
                if (h > t.delay) {
                    l = now();
                    callOriginalCallback();
                } else {
                    n = i.queueAsyncTask(() => {
                        l = now();
                        callOriginalCallback();
                    }, {
                        delay: t.delay - h
                    });
                }
                r?.cancel();
            } else {
                callOriginalCallback();
            }
        };
        const u = fn.dispose = () => {
            r?.cancel();
            n?.cancel();
            r = n = void 0;
        };
        fn.flush = () => {
            c = n?.status === M;
            u();
            if (c) {
                callOriginalCallback();
            }
        };
        return fn;
    };
    return (e, s) => {
        defineHiddenProp(e.prototype, "limit", function(e) {
            if (t.has(this)) {
                throw createMappedError(9996);
            }
            t.add(this);
            const i = s(this, e);
            const n = e.signals;
            const r = n.length > 0 ? this.get(Y) : null;
            const l = this[i];
            const callOriginal = (...t) => l.call(this, ...t);
            const h = e.type === "debounce" ? debounced(e, callOriginal, this) : throttled(e, callOriginal, this);
            const a = r ? {
                handleChange: h.flush
            } : null;
            this[i] = h;
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
                    delete this[i];
                }
            };
        });
    };
})();

const vt = ((t = new WeakSet) => e => function() {
    if (!t.has(this)) {
        t.add(this);
        e.call(this);
    }
})();

class AttributeBinding {
    constructor(t, e, s, i, n, r, l, h, a) {
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
        this.ast = i;
        this.q = t;
        this.target = n;
        this.oL = s;
        if ((this.M = l.indexOf(" ") > -1) && !AttributeBinding.P.has(l)) {
            AttributeBinding.P.set(l, l.split(" "));
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
                let r = v(e);
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
                    s.setAttribute(i, v(e));
                }
            }
        }
    }
    handleChange() {
        if (!this.isBound) return;
        if (this.L) return;
        this.L = true;
        i.queueTask(() => {
            this.L = false;
            if (!this.isBound) return;
            this.obs.version++;
            const t = i.astEvaluate(this.ast, this.s, this, (this.mode & a) > 0 ? this : null);
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
        i.astBind(this.ast, t, this);
        if (this.mode & (a | h)) {
            this.updateTarget(this.v = i.astEvaluate(this.ast, t, this, (this.mode & a) > 0 ? this : null));
        }
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) return;
        this.isBound = false;
        i.astUnbind(this.ast, this.s, this);
        this.s = void 0;
        this.v = void 0;
        this.obs.clearAll();
    }
}

AttributeBinding.mix = vt(() => {
    pt(AttributeBinding);
    xt(AttributeBinding, () => "updateTarget");
    i.connectable(AttributeBinding, null);
    mt(AttributeBinding);
});

AttributeBinding.P = new Map;

class InterpolationBinding {
    constructor(t, e, s, i, n, r, l, h) {
        this.ast = i;
        this.target = n;
        this.targetProperty = r;
        this.mode = l;
        this.strict = h;
        this.isBound = false;
        this.s = void 0;
        this.L = false;
        this.q = t;
        this.oL = s;
        this.I = s.getAccessor(n, r);
        const a = i.expressions;
        const c = this.partBindings = Array(a.length);
        const u = a.length;
        let f = 0;
        for (;u > f; ++f) {
            c[f] = new InterpolationPartBinding(a[f], n, r, e, s, h, this);
        }
    }
    _() {
        if (!this.isBound) return;
        const t = this.q.state !== Se && (this.I.type & I) > 0;
        if (t) {
            if (this.L) return;
            this.L = true;
            i.queueTask(() => {
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
        const s = this.target;
        const i = this.targetProperty;
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
        this.I.setValue(l, s, i);
    }
    bind(t) {
        if (this.isBound) {
            if (this.s === t) return;
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
        if (!this.isBound) return;
        this.isBound = false;
        this.s = void 0;
        const t = this.partBindings;
        const e = t.length;
        let s = 0;
        for (;e > s; ++s) {
            t[s].unbind();
        }
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
        this.mode = a;
        this.isBound = false;
        this.v = "";
        this.boundFn = false;
        this.D = false;
        this.l = i;
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
        const e = i.astEvaluate(this.ast, this.s, this, (this.mode & a) > 0 ? this : null);
        this.obs.clear();
        this.v = e;
        if (t.isArray(e)) {
            this.observeCollection(e);
        }
        this.D = false;
        return this.v;
    }
    bind(e) {
        if (this.isBound) {
            if (this.s === e) return;
            this.unbind();
        }
        this.s = e;
        i.astBind(this.ast, e, this);
        this.v = i.astEvaluate(this.ast, this.s, this, (this.mode & a) > 0 ? this : null);
        if (t.isArray(this.v)) {
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
        i.astUnbind(this.ast, this.s, this);
        this.s = void 0;
        this.obs.clearAll();
    }
}

InterpolationPartBinding.mix = vt(() => {
    pt(InterpolationPartBinding);
    xt(InterpolationPartBinding, () => "updateTarget");
    i.connectable(InterpolationPartBinding, null);
    mt(InterpolationPartBinding);
});

class ContentBinding {
    constructor(t, e, s, i, n, r, l) {
        this.p = i;
        this.ast = n;
        this.target = r;
        this.strict = l;
        this.isBound = false;
        this.mode = a;
        this.L = false;
        this.v = "";
        this.F = false;
        this.boundFn = false;
        this.l = e;
        this.q = t;
        this.oL = s;
    }
    updateTarget(t) {
        const e = this.target;
        const s = this.v;
        this.v = t;
        if (this.F) {
            s.parentNode?.removeChild(s);
            this.F = false;
        }
        if (t instanceof this.p.Node) {
            e.parentNode?.insertBefore(t, e);
            t = "";
            this.F = true;
        }
        e.textContent = v(t ?? "");
    }
    handleChange() {
        if (!this.isBound) return;
        if (this.L) return;
        this.L = true;
        i.queueTask(() => {
            this.L = false;
            if (!this.isBound) return;
            this.obs.version++;
            const t = i.astEvaluate(this.ast, this.s, this, (this.mode & a) > 0 ? this : null);
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
        i.queueTask(() => {
            this.L = false;
            if (!this.isBound) return;
            this.obs.version++;
            const e = this.v = i.astEvaluate(this.ast, this.s, this, (this.mode & a) > 0 ? this : null);
            this.obs.clear();
            if (t.isArray(e)) {
                this.observeCollection(e);
            }
            this.updateTarget(e);
        });
    }
    bind(e) {
        if (this.isBound) {
            if (this.s === e) return;
            this.unbind();
        }
        this.s = e;
        i.astBind(this.ast, e, this);
        const s = this.v = i.astEvaluate(this.ast, this.s, this, (this.mode & a) > 0 ? this : null);
        if (t.isArray(s)) {
            this.observeCollection(s);
        }
        this.updateTarget(s);
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) return;
        this.isBound = false;
        i.astUnbind(this.ast, this.s, this);
        if (this.F) {
            this.v.parentNode?.removeChild(this.v);
        }
        this.s = void 0;
        this.obs.clearAll();
    }
}

ContentBinding.mix = vt(() => {
    pt(ContentBinding);
    xt(ContentBinding, () => "updateTarget");
    i.connectable(ContentBinding, null);
    mt(ContentBinding);
});

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
        if (!this.isBound) return;
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
            if (this.s === t) return;
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
        if (!this.isBound) return;
        this.isBound = false;
        i.astUnbind(this.ast, this.s, this);
        this.s = void 0;
        this.obs.clearAll();
    }
}

LetBinding.mix = vt(() => {
    pt(LetBinding);
    xt(LetBinding, () => "updateTarget");
    i.connectable(LetBinding, null);
    mt(LetBinding);
});

class PropertyBinding {
    constructor(t, e, s, i, n, r, l, h) {
        this.ast = i;
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
        this.q = t;
        this.oL = s;
    }
    updateTarget(t) {
        this.I.setValue(t, this.target, this.targetProperty);
    }
    updateSource(t) {
        i.astAssign(this.ast, this.s, this, null, t);
    }
    handleChange() {
        if (!this.isBound) return;
        const t = this.q.state !== Se && (this.I.type & I) > 0;
        if (t) {
            if (this.L) return;
            this.L = true;
            i.queueTask(() => {
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
        const t = i.astEvaluate(this.ast, this.s, this, (this.mode & a) > 0 ? this : null);
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
        i.astBind(this.ast, t, this);
        const e = this.oL;
        const s = this.mode;
        let n = this.I;
        if (!n) {
            if (s & c) {
                n = e.getObserver(this.target, this.targetProperty);
            } else {
                n = e.getAccessor(this.target, this.targetProperty);
            }
            this.I = n;
        }
        const r = (s & a) > 0;
        if (s & (a | h)) {
            this.updateTarget(i.astEvaluate(this.ast, this.s, this, r ? this : null));
        }
        if (s & c) {
            n.subscribe(this.O ??= new BindingTargetSubscriber(this, this.l.get(gt)));
            if (!r) {
                this.updateSource(n.getValue(this.target, this.targetProperty));
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
        i.astUnbind(this.ast, this.s, this);
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

PropertyBinding.mix = vt(() => {
    pt(PropertyBinding);
    xt(PropertyBinding, t => t.mode & c ? "updateSource" : "updateTarget");
    i.connectable(PropertyBinding, null);
    mt(PropertyBinding);
});

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
            if (this.s === t) return;
            this.unbind();
        }
        this.s = t;
        i.astBind(this.ast, t, this);
        this.isBound = true;
        this.updateSource();
    }
    unbind() {
        if (!this.isBound) return;
        this.isBound = false;
        this.obs.clearAll();
        if (i.astEvaluate(this.ast, this.s, this, null) === this.target) {
            this.updateSource();
        }
        i.astUnbind(this.ast, this.s, this);
        this.s = void 0;
    }
}

RefBinding.mix = vt(() => {
    i.connectable(RefBinding, null);
    xt(RefBinding, () => "updateSource");
    pt(RefBinding);
    mt(RefBinding);
});

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
        this.N = null;
        this.l = t;
        this.W = n;
        this.N = r;
    }
    callSource(e) {
        const s = this.s.overrideContext;
        s.$event = e;
        let n = i.astEvaluate(this.ast, this.s, this, null);
        delete s.$event;
        if (t.isFunction(n)) {
            n = n(e);
        }
        if (n !== true && this.W.prevent) {
            e.preventDefault();
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
        i.astBind(this.ast, t, this);
        this.target.addEventListener(this.targetEvent, this, this.W);
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) return;
        this.isBound = false;
        i.astUnbind(this.ast, this.s, this);
        this.s = void 0;
        this.target.removeEventListener(this.targetEvent, this, this.W);
    }
}

ListenerBinding.mix = vt(function() {
    pt(ListenerBinding);
    xt(ListenerBinding, () => "callSource");
    mt(ListenerBinding);
});

const yt = /*@__PURE__*/ H("IEventModifier");

const wt = /*@__PURE__*/ H("IKeyMapping", t => t.instance({
    meta: b([ "ctrl", "alt", "shift", "meta" ]),
    keys: {
        escape: "Escape",
        enter: "Enter",
        space: "Space",
        tab: "tab",
        ...Array.from({
            length: 25
        }).reduce((t, e, s) => {
            let i = String.fromCharCode(s + 65);
            t[s + 65] = i;
            i = String.fromCharCode(s + 97);
            t[s + 97] = t[i] = i;
            return t;
        }, {})
    }
}));

class ModifiedMouseEventHandler {
    constructor() {
        this.type = [ "click", "mousedown", "mousemove", "mouseup", "dblclick", "contextmenu" ];
        this.j = t.resolve(wt);
        this.U = [ "left", "middle", "right" ];
    }
    static register(t) {
        t.register(O(yt, ModifiedMouseEventHandler));
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
                    if (t.button !== this.U.indexOf(n)) return false;
                    continue;
                }
                if (this.j.meta.includes(n) && t[`${n}Key`] !== true) {
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
        this.j = t.resolve(wt);
        this.type = [ "keydown", "keyup" ];
    }
    static register(t) {
        t.register(O(yt, ModifiedKeyboardEventHandler));
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
        t.register(O(yt, ModifiedEventHandler));
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

const bt = /*@__PURE__*/ H("IEventModifierHandler", t => t.instance({
    getHandler: () => null
}));

class EventModifier {
    constructor() {
        this.G = t.resolve(t.all(yt)).reduce((e, s) => {
            const i = t.isArray(s.type) ? s.type : [ s.type ];
            i.forEach(t => e[t] = s);
            return e;
        }, {});
    }
    static register(t) {
        t.register(O(bt, EventModifier));
    }
    getHandler(e, s) {
        return t.isString(s) ? (this.G[e] ?? this.G.$ALL)?.getHandler(s) ?? null : null;
    }
}

const kt = {
    register(t) {
        t.register(EventModifier, ModifiedMouseEventHandler, ModifiedKeyboardEventHandler, ModifiedEventHandler);
    }
};

const Ct = /*@__PURE__*/ H("IViewFactory");

class ViewFactory {
    constructor(t, e) {
        this.isCaching = false;
        this.X = null;
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

const Bt = /*@__PURE__*/ (() => {
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

const St = "default";

const At = "au-slot";

const Rt = /*@__PURE__*/ H("IAuSlotsInfo");

class AuSlotsInfo {
    constructor(t) {
        this.projectedSlots = t;
    }
}

const Tt = /*@__PURE__*/ H("IAuSlotWatcher");

class AuSlotWatcherBinding {
    constructor(e, s, i, n) {
        this.Y = new Set;
        this.Z = t.emptyArray;
        this.isBound = false;
        this.cb = (this.o = e)[s];
        this.slotName = i;
        this.J = n;
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
        const s = this.Z;
        const i = [];
        const n = this.J;
        let r;
        let l;
        for (r of this.Y) {
            for (l of r === t ? e : r.nodes) {
                if (n === "$all" || isElement(l) && (n === "*" || l.matches(n))) {
                    i[i.length] = l;
                }
            }
        }
        if (i.length !== s.length || i.some((t, e) => t !== s[e])) {
            this.Z = i;
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
        this.tt = t;
    }
    register(t) {
        N(at, this).register(t);
    }
    hydrating(t, e) {
        const s = this.tt;
        const i = new AuSlotWatcherBinding(t, s.callback ?? `${v(s.name)}Changed`, s.slotName ?? "default", s.query ?? "*");
        A(t, s.name, {
            enumerable: true,
            configurable: true,
            get: k(() => i.getValue(), {
                getObserver: () => i
            }),
            set: () => {}
        });
        N(Tt, i).register(e.container);
        e.addBinding(i);
    }
}

function slotted(t, e) {
    if (!Et) {
        Et = true;
        i.subscriberCollection(AuSlotWatcherBinding, null);
        lifecycleHooks()(SlottedLifecycleHooks, null);
    }
    const s = g("dependencies");
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

let Et = false;

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
        this.et = [];
        this.locator = (this.$controller = (this.st = t).controller).container;
    }
    get(t) {
        return this.locator.get(t);
    }
    bind(t) {
        if (this.isBound) return;
        this.isBound = true;
        const e = this.scope = this.st.controller.scope.parent ?? void 0;
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
        if (t.vmKind !== ke) {
            throw createMappedError(9998);
        }
        this.$controller.addChild(t);
    }
}

class SpreadValueBinding {
    constructor(t, e, s, i, n, r, l) {
        this.target = e;
        this.targetKeys = s;
        this.ast = i;
        this.strict = l;
        this.isBound = false;
        this.s = void 0;
        this.boundFn = false;
        this.it = {};
        this.nt = new WeakMap;
        this.q = t;
        this.oL = n;
        this.l = r;
    }
    updateTarget() {
        this.obs.version++;
        const t = i.astEvaluate(this.ast, this.s, this, this);
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
        i.astBind(this.ast, t, this);
        const e = i.astEvaluate(this.ast, t, this, this);
        this.rt(e, false);
    }
    unbind() {
        if (!this.isBound) return;
        this.isBound = false;
        i.astUnbind(this.ast, this.s, this);
        this.s = void 0;
        let t;
        for (t in this.it) {
            this.it[t].unbind();
        }
    }
    rt(s, n) {
        let l;
        if (!t.isObject(s)) {
            for (l in this.it) {
                this.it[l]?.unbind();
            }
            return;
        }
        let h;
        let a = this.nt.get(s);
        if (a == null) {
            this.nt.set(s, a = i.Scope.fromParent(this.s, s));
        }
        for (l of this.targetKeys) {
            h = this.it[l];
            if (l in s) {
                if (h == null) {
                    h = this.it[l] = new PropertyBinding(this.q, this.l, this.oL, SpreadValueBinding.ot[l] ??= new r.AccessScopeExpression(l, 0), this.target, l, e.BindingMode.toView, this.strict);
                }
                h.bind(a);
            } else if (n) {
                h?.unbind();
            }
        }
    }
}

SpreadValueBinding.mix = vt(() => {
    pt(SpreadValueBinding);
    xt(SpreadValueBinding, () => "updateTarget");
    i.connectable(SpreadValueBinding, null);
    mt(SpreadValueBinding);
});

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
    defineHiddenProp(s, "subscribe", function(t) {
        if (this.subs.add(t) && this.subs.count === 1) {
            for (e of this.cf.events) {
                addListener(this.lt, e, this);
            }
            this.ht = true;
            this.ct?.();
        }
    });
    defineHiddenProp(s, "unsubscribe", function(t) {
        if (this.subs.remove(t) && this.subs.count === 0) {
            for (e of this.cf.events) {
                removeListener(this.lt, e, this);
            }
            this.ht = false;
            this.ut?.();
        }
    });
    defineHiddenProp(s, "useConfig", function(t) {
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
        this.type = P | I;
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
                t[l] = this.dt;
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
        return i.get(De).controller.container.get(t.own(e));
    }
});

const Lt = /*@__PURE__*/ H("IRenderer");

function renderer(e, s) {
    const i = s?.metadata ?? (e[Symbol.metadata] ??= Object.create(null));
    i[t.registrableMetadataKey] = {
        register(t) {
            O(Lt, e).register(t);
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

const Mt = /*@__PURE__*/ renderer(class SetPropertyRenderer {
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

const qt = /*@__PURE__*/ renderer(class CustomElementRenderer {
    constructor() {
        this.r = t.resolve(ie);
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
            l = Ye.find(f, c);
            if (l == null) {
                throw createMappedError(752, s, t);
            }
            break;

          default:
            l = c;
        }
        const d = s.containerless || l.containerless;
        const p = d ? convertToRenderLocation(e) : null;
        const m = createElementContainer(i, t, e, s, p, u == null ? void 0 : new AuSlotsInfo(B(u)));
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

const Dt = /*@__PURE__*/ renderer(class CustomAttributeRenderer {
    constructor() {
        this.r = t.resolve(ie);
        this.target = e.InstructionType.hydrateAttribute;
    }
    render(t, e, s, i, n, r) {
        let l = t.container;
        let h;
        switch (typeof s.res) {
          case "string":
            h = ht.find(l, s.res);
            if (h == null) {
                throw createMappedError(753, s, t);
            }
            break;

          default:
            h = s.res;
        }
        const a = invokeAttribute(i, h, t, e, s, void 0, void 0);
        const c = Controller.$attr(a.ctn, a.vm, e, h);
        it.set(e, h.key, c);
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

const Pt = /*@__PURE__*/ renderer(class TemplateControllerRenderer {
    constructor() {
        this.r = t.resolve(ie);
        this.target = e.InstructionType.hydrateTemplateController;
    }
    render(t, e, s, i, n, r) {
        let l = t.container;
        let h;
        switch (typeof s.res) {
          case "string":
            h = ht.find(l, s.res);
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
        it.set(c, h.key, f);
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

const It = /*@__PURE__*/ renderer(class LetElementRenderer {
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
            f = ensureExpression(n, u.from, L);
            t.addBinding(new LetBinding(a, r, f, u.to, h, t.strict ?? false));
            ++d;
        }
    }
}, null);

const _t = /*@__PURE__*/ renderer(class RefBindingRenderer {
    constructor() {
        this.target = e.InstructionType.refBinding;
        RefBinding.mix();
    }
    render(t, e, s, i, n, r) {
        t.addBinding(new RefBinding(t.container, r, ensureExpression(n, s.from, L), getRefTarget(e, s.to), t.strict ?? false));
    }
}, null);

const Vt = /*@__PURE__*/ renderer(class InterpolationBindingRenderer {
    constructor() {
        this.target = e.InstructionType.interpolation;
        InterpolationPartBinding.mix();
    }
    render(t, e, s, i, n, r) {
        const l = t.container;
        const h = new InterpolationBinding(t, l, r, ensureExpression(n, s.from, R), getTarget(e), s.to, a, t.strict ?? false);
        if (s.to === "class" && h.target.nodeType > 0) {
            const t = l.get(fromHydrationContext(Oe));
            h.useAccessor(new ClassAttributeAccessor(h.target, t));
        }
        t.addBinding(h);
    }
}, null);

const Ft = /*@__PURE__*/ renderer(class PropertyBindingRenderer {
    constructor() {
        this.target = e.InstructionType.propertyBinding;
        PropertyBinding.mix();
    }
    render(t, e, s, i, n, r) {
        const l = t.container;
        const h = new PropertyBinding(t, l, r, ensureExpression(n, s.from, L), getTarget(e), s.to, s.mode, t.strict ?? false);
        if (s.to === "class" && h.target.nodeType > 0) {
            const t = l.get(fromHydrationContext(Oe));
            h.useTargetObserver(new ClassAttributeAccessor(h.target, t));
        }
        t.addBinding(h);
    }
}, null);

const Ht = /*@__PURE__*/ renderer(class IteratorBindingRenderer {
    constructor() {
        this.target = e.InstructionType.iteratorBinding;
        PropertyBinding.mix();
    }
    render(t, e, s, i, n, r) {
        t.addBinding(new PropertyBinding(t, t.container, r, ensureExpression(n, s.forOf, T), getTarget(e), s.to, a, t.strict ?? false));
    }
}, null);

const Ot = /*@__PURE__*/ renderer(class TextBindingRenderer {
    constructor() {
        this.target = e.InstructionType.textBinding;
        ContentBinding.mix();
    }
    render(t, e, s, i, n, r) {
        t.addBinding(new ContentBinding(t, t.container, r, i, ensureExpression(n, s.from, L), e, t.strict ?? false));
    }
}, null);

const $t = H("IListenerBindingOptions", e => e.singleton(class {
    constructor() {
        this.p = t.resolve(st);
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
}));

const Nt = /*@__PURE__*/ renderer(class ListenerBindingRenderer {
    constructor() {
        this.target = e.InstructionType.listenerBinding;
        this.xt = t.resolve(bt);
        this.vt = t.resolve($t);
        ListenerBinding.mix();
    }
    render(t, e, s, i, n) {
        t.addBinding(new ListenerBinding(t.container, ensureExpression(n, s.from, E), e, s.to, new ListenerBindingOptions(this.vt.prevent, s.capture, this.vt.onError), this.xt.getHandler(s.to, s.modifier), t.strict ?? false));
    }
}, null);

const Wt = /*@__PURE__*/ renderer(class SetAttributeRenderer {
    constructor() {
        this.target = e.InstructionType.setAttribute;
    }
    render(t, e, s) {
        e.setAttribute(s.to, s.value);
    }
}, null);

const jt = /*@__PURE__*/ renderer(class SetClassAttributeRenderer {
    constructor() {
        this.target = e.InstructionType.setClassAttribute;
    }
    render(t, e, s) {
        addClasses(e.classList, s.value);
    }
}, null);

const zt = /*@__PURE__*/ renderer(class SetStyleAttributeRenderer {
    constructor() {
        this.target = e.InstructionType.setStyleAttribute;
    }
    render(t, e, s) {
        e.style.cssText += s.value;
    }
}, null);

const Ut = /*@__PURE__*/ renderer(class StylePropertyBindingRenderer {
    constructor() {
        this.target = e.InstructionType.stylePropertyBinding;
        PropertyBinding.mix();
    }
    render(t, e, s, i, n, r) {
        t.addBinding(new PropertyBinding(t, t.container, r, ensureExpression(n, s.from, L), e.style, s.to, a, t.strict ?? false));
    }
}, null);

const Gt = /*@__PURE__*/ renderer(class AttributeBindingRenderer {
    constructor() {
        this.target = e.InstructionType.attributeBinding;
        AttributeBinding.mix();
    }
    render(t, e, s, i, n, r) {
        const l = t.container;
        const h = l.has(Oe, false) ? l.get(Oe) : null;
        t.addBinding(new AttributeBinding(t, l, r, ensureExpression(n, s.from, L), e, s.attr, h == null ? s.to : s.to.split(/\s/g).map(t => h[t] ?? t).join(" "), a, t.strict ?? false));
    }
}, null);

const Xt = /*@__PURE__*/ renderer(class SpreadRenderer {
    constructor() {
        this.yt = t.resolve(e.ITemplateCompiler);
        this.r = t.resolve(ie);
        this.target = e.InstructionType.spreadTransferedBinding;
    }
    render(t, e, s, i, n, r) {
        SpreadBinding.create(t.container.get(De), e, void 0, this.r, this.yt, i, n, r).forEach(e => t.addBinding(e));
    }
}, null);

const Kt = /*@__PURE__*/ renderer(class SpreadValueRenderer {
    constructor() {
        this.target = e.InstructionType.spreadValueBinding;
        SpreadValueBinding.mix();
    }
    render(t, e, s, i, n, r) {
        const l = s.target;
        if (l === "$bindables") {
            t.addBinding(new SpreadValueBinding(t, e.viewModel, B(e.definition.bindables), n.parse(s.from, L), r, t.container, t.strict ?? false));
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

const Qt = "IController";

const Yt = "IInstruction";

const Zt = "IRenderLocation";

const Jt = "ISlotsInfo";

function createElementContainer(s, i, n, r, l, h) {
    const a = i.container.createChild();
    registerHostNode(a, n, s);
    registerResolver(a, qe, new t.InstanceProvider(Qt, i));
    registerResolver(a, e.IInstruction, new t.InstanceProvider(Yt, r));
    registerResolver(a, He, l == null ? te : new RenderLocationProvider(l));
    registerResolver(a, Ct, ee);
    registerResolver(a, Rt, h == null ? se : new t.InstanceProvider(Jt, h));
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
    registerResolver(f, qe, new t.InstanceProvider(Qt, u));
    registerResolver(f, e.IInstruction, new t.InstanceProvider(Yt, l));
    registerResolver(f, He, a == null ? te : new t.InstanceProvider(Zt, a));
    registerResolver(f, Ct, h == null ? ee : new ViewFactoryProvider(h));
    registerResolver(f, Rt, se);
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

const te = new RenderLocationProvider(null);

const ee = new ViewFactoryProvider(null);

const se = new t.InstanceProvider(Jt, new AuSlotsInfo(t.emptyArray));

const ie = /*@__PURE__*/ H("IRendering", t => t.singleton(Rendering));

class Rendering {
    get renderers() {
        return this.wt ??= this.bt.getAll(Lt, false).reduce((t, e) => {
            t[e.target] ??= e;
            return t;
        }, t.createLookup());
    }
    constructor() {
        this.kt = new WeakMap;
        this.Ct = new WeakMap;
        const e = this.bt = t.resolve(t.IContainer).root;
        const s = this.p = e.get(st);
        this.ep = e.get(r.IExpressionParser);
        this.oL = e.get(i.IObserverLocator);
        this.Bt = s.document.createElement("au-m");
        this.St = new FragmentNodeSequence(s, s.document.createDocumentFragment());
    }
    compile(t, s) {
        const i = s.get(e.ITemplateCompiler);
        const n = this.kt;
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
            return new FragmentNodeSequence(this.p, this.At(e.template));
        }
        let s;
        let i = false;
        const n = this.Ct;
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
            this.At(s);
            n.set(e, s);
        }
        return s == null ? this.St : new FragmentNodeSequence(this.p, i ? l.importNode(s, true) : l.adoptNode(s.cloneNode(true)));
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
    At(t) {
        if (t == null) {
            return null;
        }
        const e = this.p.document.createTreeWalker(t, 128);
        let s;
        while ((s = e.nextNode()) != null) {
            if (s.nodeValue === "au*") {
                s.parentNode.replaceChild(e.currentNode = this.Bt.cloneNode(), s);
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
        let i = s.get(t.own(Oe));
        if (i == null) {
            s.register(N(Oe, i = t.createLookup()));
        }
        {
            k(i, ...this.modules);
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
                    const s = e.value.split(/\s+/g).map(t => i[t] || t).join(" ");
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

const ne = /*@__PURE__*/ H("IShadowDOMStyleFactory", t => t.cachedCallback(t => {
    if (AdoptedStyleSheetsStyles.supported(t.get(st))) {
        return t.get(AdoptedStyleSheetsStylesFactory);
    }
    return t.get(StyleElementStylesFactory);
}));

class ShadowDOMRegistry {
    constructor(t) {
        this.css = t;
    }
    register(t) {
        const e = t.get(oe);
        const s = t.get(ne);
        t.register(N(re, s.createStyles(this.css, e)));
    }
}

class AdoptedStyleSheetsStylesFactory {
    constructor() {
        this.p = t.resolve(st);
        this.cache = new Map;
    }
    createStyles(t, e) {
        return new AdoptedStyleSheetsStyles(this.p, t, this.cache, e);
    }
}

class StyleElementStylesFactory {
    constructor() {
        this.p = t.resolve(st);
    }
    createStyles(t, e) {
        return new StyleElementStyles(this.p, t, e);
    }
}

const re = /*@__PURE__*/ H("IShadowDOMStyles");

const oe = /*@__PURE__*/ H("IShadowDOMGlobalStyles", e => e.instance({
    applyTo: t.noop
}));

class AdoptedStyleSheetsStyles {
    constructor(t, e, s, i = null) {
        this.sharedStyles = i;
        this.styleSheets = e.map(e => {
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

const le = {
    shadowDOM(e) {
        return et.creating(t.IContainer, t => {
            if (e.sharedStyles != null) {
                const s = t.get(ne);
                t.register(N(oe, s.createStyles(e.sharedStyles, null)));
            }
        });
    }
};

const {enter: he, exit: ae} = i.ConnectableSwitcher;

const {wrap: ce, unwrap: ue} = i.ProxyObservable;

class ComputedWatcher {
    get value() {
        return this.v;
    }
    constructor(t, e, s, i, n = "async") {
        this.obj = t;
        this.$get = s;
        this.isBound = false;
        this.L = false;
        this.Rt = 0;
        this.v = void 0;
        this.cb = i;
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
        i.queueTask(() => {
            this.L = false;
            this.Et();
        });
    }
    Et() {
        if (!this.isBound) return;
        const e = this.obj;
        const s = this.v;
        if (++this.Rt > 100) {
            throw new Error(`AURXXXX: Possible infinitely recursive side-effect detected in a watcher.`);
        }
        const i = this.compute();
        if (!t.areEqual(i, s)) {
            this.cb.call(e, i, s, e);
        }
        if (!this.L) {
            this.Rt = 0;
        }
    }
    compute() {
        this.obs.version++;
        try {
            he(this);
            return this.v = ue(this.$get.call(void 0, ce(this.obj), this));
        } finally {
            this.obs.clear();
            ae(this);
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
    constructor(t, e, s, i, n, r = "async") {
        this.scope = t;
        this.l = e;
        this.oL = s;
        this.isBound = false;
        this.L = false;
        this.boundFn = false;
        this.obj = t.bindingContext;
        this.Lt = i;
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
        i.queueTask(() => {
            this.L = false;
            this.Et();
        });
    }
    Et() {
        if (!this.isBound) return;
        const e = this.Lt;
        const s = this.obj;
        const n = this.v;
        this.obs.version++;
        const r = i.astEvaluate(e, this.scope, this, this);
        this.obs.clear();
        if (!t.areEqual(r, n)) {
            this.v = r;
            this.cb.call(s, r, n, s);
        }
    }
    bind() {
        if (this.isBound) return;
        this.obs.version++;
        this.v = i.astEvaluate(this.Lt, this.scope, this, this);
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
    i.connectable(ExpressionWatcher, null);
    mt(ExpressionWatcher);
})();

class Controller {
    get lifecycleHooks() {
        return this.Mt;
    }
    get isActive() {
        return (this.state & (Se | Ae)) > 0 && (this.state & Re) === 0;
    }
    get name() {
        if (this.parent === null) {
            switch (this.vmKind) {
              case ke:
                return `[${this.definition.name}]`;

              case be:
                return this.definition.name;

              case Ce:
                return this.viewFactory.name;
            }
        }
        switch (this.vmKind) {
          case ke:
            return `${this.parent.name}>[${this.definition.name}]`;

          case be:
            return `${this.parent.name}>${this.definition.name}`;

          case Ce:
            return this.viewFactory.name === this.parent.definition?.name ? `${this.parent.name}[view]` : `${this.parent.name}[view:${this.viewFactory.name}]`;
        }
    }
    get viewModel() {
        return this.qt;
    }
    set viewModel(t) {
        this.qt = t;
        this.Dt = t == null || this.vmKind === Ce ? HooksDefinition.none : new HooksDefinition(t);
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
        this.Pt = false;
        this.mountTarget = de;
        this.shadowRoot = null;
        this.nodes = null;
        this.location = null;
        this.Mt = null;
        this.state = Be;
        this.It = false;
        this.$initiator = null;
        this.$resolve = void 0;
        this.$reject = void 0;
        this.$promise = void 0;
        this._t = 0;
        this.Vt = 0;
        this.Ft = 0;
        this.qt = n;
        this.Dt = e === Ce ? HooksDefinition.none : new HooksDefinition(n);
        this.location = l;
        this.r = t.root.get(ie);
    }
    static getCached(t) {
        return fe.get(t);
    }
    static getCachedOrThrow(t) {
        const e = Controller.getCached(t);
        if (e === void 0) {
            throw createMappedError(500, t);
        }
        return e;
    }
    static $el(e, s, i, n, r = void 0, l = null) {
        if (fe.has(s)) {
            return fe.get(s);
        }
        {
            r = r ?? getElementDefinition(s.constructor);
        }
        registerResolver(e, r.Type, new t.InstanceProvider(r.key, s, r.Type));
        const h = new Controller(e, be, r, null, s, i, l);
        const a = e.get(t.optional(De));
        if (r.dependencies.length > 0) {
            e.register(...r.dependencies);
        }
        registerResolver(e, De, new t.InstanceProvider("IHydrationContext", new HydrationContext(h, n, a)));
        fe.set(s, h);
        if (n == null || n.hydrate !== false) {
            h.hE(n);
        }
        return h;
    }
    static $attr(e, s, i, n) {
        if (fe.has(s)) {
            return fe.get(s);
        }
        n = n ?? getAttributeDefinition(s.constructor);
        registerResolver(e, n.Type, new t.InstanceProvider(n.key, s, n.Type));
        const r = new Controller(e, ke, n, null, s, i, null);
        if (n.dependencies.length > 0) {
            e.register(...n.dependencies);
        }
        fe.set(s, r);
        r.Ht();
        return r;
    }
    static $view(t, e = void 0) {
        const s = new Controller(t.container, Ce, null, t, null, null, null);
        s.parent = e ?? null;
        s.Ot();
        return s;
    }
    hE(e) {
        const s = this.container;
        const n = this.qt;
        const r = this.definition;
        this.scope = i.Scope.create(n, null, true);
        if (r.watches.length > 0) {
            createWatchers(this, s, r, n);
        }
        createObservers(this, r, n);
        this.Mt = ct.resolve(s);
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
        if (this.Mt.hydrating != null) {
            this.Mt.hydrating.forEach(callHydratingHook, this);
        }
        if (this.Dt.$t) {
            this.qt.hydrating(this);
        }
        const t = this.definition;
        const e = this.Nt = this.r.compile(t, this.container);
        const s = e.shadowOptions;
        const i = e.hasSlots;
        const n = e.containerless;
        const r = this.host;
        let l = this.location;
        if (n && l == null) {
            l = this.location = convertToRenderLocation(r);
        }
        Ve(r, Xe, this);
        Ve(r, t.key, this);
        if (s !== null || i) {
            if (l != null) {
                throw createMappedError(501);
            }
            Ve(this.shadowRoot = r.attachShadow(s ?? we), Xe, this);
            Ve(this.shadowRoot, t.key, this);
            this.mountTarget = me;
        } else if (l != null) {
            if (r !== l) {
                Ve(l, Xe, this);
                Ve(l, t.key, this);
            }
            this.mountTarget = ge;
        } else {
            this.mountTarget = pe;
        }
        this.qt.$controller = this;
        this.nodes = this.r.createNodes(e);
        if (this.Mt.hydrated !== void 0) {
            this.Mt.hydrated.forEach(callHydratedHook, this);
        }
        if (this.Dt.Wt) {
            this.qt.hydrated(this);
        }
    }
    hC() {
        this.r.render(this, this.nodes.findTargets(), this.Nt, this.host);
        if (this.Mt.created !== void 0) {
            this.Mt.created.forEach(callCreatedHook, this);
        }
        if (this.Dt.jt) {
            this.qt.created(this);
        }
    }
    Ht() {
        const t = this.definition;
        const e = this.qt;
        if (t.watches.length > 0) {
            createWatchers(this, this.container, t, e);
        }
        createObservers(this, t, e);
        e.$controller = this;
        this.Mt = ct.resolve(this.container);
        if (this.Mt.created !== void 0) {
            this.Mt.created.forEach(callCreatedHook, this);
        }
        if (this.Dt.jt) {
            this.qt.created(this);
        }
    }
    Ot() {
        this.Nt = this.r.compile(this.viewFactory.def, this.container);
        this.r.render(this, (this.nodes = this.r.createNodes(this.Nt)).findTargets(), this.Nt, void 0);
    }
    activate(e, s, i) {
        switch (this.state) {
          case Be:
          case Te:
            if (!(s === null || s.isActive)) {
                return;
            }
            this.state = Se;
            break;

          case Ae:
            return;

          case Le:
            throw createMappedError(502, this.name);

          default:
            throw createMappedError(503, this.name, stringifyState(this.state));
        }
        this.parent = s;
        switch (this.vmKind) {
          case be:
            this.scope.parent = i ?? null;
            break;

          case ke:
            this.scope = i ?? null;
            break;

          case Ce:
            if (i === void 0 || i === null) {
                throw createMappedError(504, this.name);
            }
            if (!this.hasLockedScope) {
                this.scope = i;
            }
            break;
        }
        this.$initiator = e;
        this.zt();
        let n = void 0;
        if (this.vmKind !== Ce && this.Mt.binding != null) {
            n = t.onResolveAll(...this.Mt.binding.map(callBindingHook, this));
        }
        if (this.Dt.Ut) {
            n = t.onResolveAll(n, this.qt.binding(this.$initiator, this.parent));
        }
        if (t.isPromise(n)) {
            this.Gt();
            n.then(() => {
                this.Pt = true;
                if (this.state !== Se) {
                    this.Xt();
                } else {
                    this.bind();
                }
            }).catch(t => {
                this.Kt(t);
            });
            return this.$promise;
        }
        this.Pt = true;
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
        if (this.vmKind !== Ce && this.Mt.bound != null) {
            i = t.onResolveAll(...this.Mt.bound.map(callBoundHook, this));
        }
        if (this.Dt.Qt) {
            i = t.onResolveAll(i, this.qt.bound(this.$initiator, this.parent));
        }
        if (t.isPromise(i)) {
            this.Gt();
            i.then(() => {
                this.isBound = true;
                if (this.state !== Se) {
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
          case pe:
            this.host.append(...t);
            break;

          case me:
            this.shadowRoot.append(...t);
            break;

          case ge:
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
          case pe:
            this.nodes.appendTo(this.host, this.definition != null && this.definition.enhance);
            break;

          case me:
            {
                const t = this.container;
                const e = t.has(re, false) ? t.get(re) : t.get(oe);
                e.applyTo(this.shadowRoot);
                this.nodes.appendTo(this.shadowRoot);
                break;
            }

          case ge:
            this.nodes.insertBefore(this.location);
            break;
        }
        let e = 0;
        let s = void 0;
        if (this.vmKind !== Ce && this.Mt.attaching != null) {
            s = t.onResolveAll(...this.Mt.attaching.map(callAttachingHook, this));
        }
        if (this.Dt.Jt) {
            s = t.onResolveAll(s, this.qt.attaching(this.$initiator, this.parent));
        }
        if (t.isPromise(s)) {
            this.Gt();
            this.zt();
            s.then(() => {
                this.Xt();
            }).catch(t => {
                this.Kt(t);
            });
        }
        if (this.children !== null) {
            for (;e < this.children.length; ++e) {
                void this.children[e].activate(this.$initiator, this, this.scope);
            }
        }
        this.Xt();
    }
    deactivate(e, s) {
        let i = void 0;
        switch (this.state & ~Ee) {
          case Ae:
            this.state = Re;
            break;

          case Se:
            this.state = Re;
            i = this.$promise?.catch(t.noop);
            break;

          case Be:
          case Te:
          case Le:
          case Te | Le:
            return;

          default:
            throw createMappedError(505, this.name, this.state);
        }
        this.$initiator = e;
        if (e === this) {
            this.te();
        }
        let n = 0;
        let r;
        if (this.children !== null) {
            for (n = 0; n < this.children.length; ++n) {
                void this.children[n].deactivate(e, this);
            }
        }
        return t.onResolve(i, () => {
            if (this.isBound) {
                if (this.vmKind !== Ce && this.Mt.detaching != null) {
                    r = t.onResolveAll(...this.Mt.detaching.map(callDetachingHook, this));
                }
                if (this.Dt.ee) {
                    r = t.onResolveAll(r, this.qt.detaching(this.$initiator, this.parent));
                }
            }
            if (t.isPromise(r)) {
                this.Gt();
                e.te();
                r.then(() => {
                    e.se();
                }).catch(t => {
                    e.Kt(t);
                });
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
            this.se();
            return this.$promise;
        });
    }
    removeNodes() {
        switch (this.vmKind) {
          case be:
          case Ce:
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
          case ke:
            this.scope = null;
            break;

          case Ce:
            if (!this.hasLockedScope) {
                this.scope = null;
            }
            if ((this.state & Ee) === Ee && !this.viewFactory.tryReturnToCache(this) && this.$initiator === this) {
                this.dispose();
            }
            break;

          case be:
            this.scope.parent = null;
            break;
        }
        this.state = Te;
        this.$initiator = null;
        this.ie();
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
    ie() {
        if (this.$promise !== void 0) {
            Pe = this.$resolve;
            this.$resolve = this.$reject = this.$promise = void 0;
            Pe();
            Pe = void 0;
        }
    }
    Kt(t) {
        if (this.$promise !== void 0) {
            Ie = this.$reject;
            this.$resolve = this.$reject = this.$promise = void 0;
            Ie(t);
            Ie = void 0;
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
        if (this.state !== Se) {
            --this._t;
            this.ie();
            if (this.$initiator !== this) {
                this.parent.Xt();
            }
            return;
        }
        if (--this._t === 0) {
            if (this.vmKind !== Ce && this.Mt.attached != null) {
                _e = t.onResolveAll(...this.Mt.attached.map(callAttachedHook, this));
            }
            if (this.Dt.ne) {
                _e = t.onResolveAll(_e, this.qt.attached(this.$initiator));
            }
            if (t.isPromise(_e)) {
                this.Gt();
                _e.then(() => {
                    this.state = Ae;
                    this.ie();
                    if (this.$initiator !== this) {
                        this.parent.Xt();
                    }
                }).catch(t => {
                    this.Kt(t);
                });
                _e = void 0;
                return;
            }
            _e = void 0;
            this.state = Ae;
            this.ie();
        }
        if (this.$initiator !== this) {
            this.parent.Xt();
        }
    }
    te() {
        ++this.Vt;
    }
    se() {
        if (--this.Vt === 0) {
            this.re();
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
                if (e.Pt) {
                    if (e.vmKind !== Ce && e.Mt.unbinding != null) {
                        s = t.onResolveAll(...e.Mt.unbinding.map(callUnbindingHook, e));
                    }
                    if (e.Dt.oe) {
                        if (e.debug) {
                            e.logger.trace("unbinding()");
                        }
                        s = t.onResolveAll(s, e.viewModel.unbinding(e.$initiator, e.parent));
                    }
                }
                if (t.isPromise(s)) {
                    this.Gt();
                    this.re();
                    s.then(() => {
                        this.le();
                    }).catch(t => {
                        this.Kt(t);
                    });
                }
                s = void 0;
                e = e.next;
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
          case ke:
          case be:
            {
                return this.definition.name === t;
            }

          case Ce:
            return this.viewFactory.name === t;
        }
    }
    lockScope(t) {
        this.scope = t;
        this.hasLockedScope = true;
    }
    setHost(t) {
        if (this.vmKind === be) {
            Ve(t, Xe, this);
            Ve(t, this.definition.key, this);
        }
        this.host = t;
        this.mountTarget = pe;
        return this;
    }
    setShadowRoot(t) {
        if (this.vmKind === be) {
            Ve(t, Xe, this);
            Ve(t, this.definition.key, this);
        }
        this.shadowRoot = t;
        this.mountTarget = me;
        return this;
    }
    setLocation(t) {
        if (this.vmKind === be) {
            Ve(t, Xe, this);
            Ve(t, this.definition.key, this);
        }
        this.location = t;
        this.mountTarget = ge;
        return this;
    }
    release() {
        this.state |= Ee;
    }
    dispose() {
        if ((this.state & Le) === Le) {
            return;
        }
        this.state |= Le;
        if (this.Dt.he) {
            this.qt.dispose();
        }
        if (this.children !== null) {
            this.children.forEach(callDispose);
            this.children = null;
        }
        this.scope = null;
        this.nodes = null;
        this.location = null;
        this.viewFactory = null;
        if (this.qt !== null) {
            fe.delete(this.qt);
            this.qt = null;
        }
        this.qt = null;
        this.host = null;
        this.shadowRoot = null;
        this.container.disposeResolvers();
    }
    accept(t) {
        if (t(this) === true) {
            return true;
        }
        if (this.Dt.ae && this.qt.accept(t) === true) {
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

const fe = new WeakMap;

const de = 0;

const pe = 1;

const me = 2;

const ge = 3;

const xe = b({
    none: de,
    host: pe,
    shadowRoot: me,
    location: ge
});

const ve = t.optionalResource(i.ICoercionConfiguration);

function createObservers(e, s, n) {
    const r = s.bindables;
    const l = C(r);
    const h = l.length;
    if (h === 0) return;
    const a = e.container.get(i.IObserverLocator);
    const c = "propertiesChanged" in n;
    const u = e.vmKind === Ce ? void 0 : e.container.get(ve);
    const f = c ? (() => {
        let t = {};
        let s = false;
        let r = 0;
        const callPropertiesChanged = () => {
            if (!s) {
                s = true;
                i.queueTask(() => {
                    s = false;
                    const i = t;
                    t = {};
                    r = 0;
                    if (e.isBound) {
                        n.propertiesChanged?.(i);
                        if (r > 0) {
                            callPropertiesChanged();
                        }
                    }
                });
            }
        };
        return (e, s, i) => {
            t[e] = {
                newValue: s,
                oldValue: i
            };
            r++;
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

const ye = new Map;

const getAccessScopeAst = t => {
    let e = ye.get(t);
    if (e == null) {
        e = new r.AccessScopeExpression(t, 0);
        ye.set(t, e);
    }
    return e;
};

function createWatchers(e, s, n, l) {
    const h = s.get(i.IObserverLocator);
    const a = s.get(r.IExpressionParser);
    const c = n.watches;
    const u = e.vmKind === be ? e.scope : i.Scope.create(l, null, true);
    const f = c.length;
    let d;
    let p;
    let m;
    let g;
    let x = 0;
    for (;f > x; ++x) {
        ({expression: d, callback: p, flush: g} = c[x]);
        p = t.isFunction(p) ? p : Reflect.get(l, p);
        if (!t.isFunction(p)) {
            throw createMappedError(506, p);
        }
        if (t.isFunction(d)) {
            e.addBinding(new ComputedWatcher(l, h, d, p, g));
        } else {
            m = t.isString(d) ? a.parse(d, L) : getAccessScopeAst(d);
            e.addBinding(new ExpressionWatcher(u, s, h, m, p, g));
        }
    }
}

function isCustomElementController(t) {
    return t instanceof Controller && t.vmKind === be;
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

const we = {
    mode: "open"
};

const be = "customElement";

const ke = "customAttribute";

const Ce = "synthetic";

const Be = 0;

const Se = 1;

const Ae = 2;

const Re = 4;

const Te = 8;

const Ee = 16;

const Le = 32;

const Me = /*@__PURE__*/ b({
    none: Be,
    activating: Se,
    activated: Ae,
    deactivating: Re,
    deactivated: Te,
    released: Ee,
    disposed: Le
});

function stringifyState(t) {
    const e = [];
    if ((t & Se) === Se) {
        e.push("activating");
    }
    if ((t & Ae) === Ae) {
        e.push("activated");
    }
    if ((t & Re) === Re) {
        e.push("deactivating");
    }
    if ((t & Te) === Te) {
        e.push("deactivated");
    }
    if ((t & Ee) === Ee) {
        e.push("released");
    }
    if ((t & Le) === Le) {
        e.push("disposed");
    }
    return e.length === 0 ? "none" : e.join("|");
}

const qe = /*@__PURE__*/ H("IController");

const De = /*@__PURE__*/ H("IHydrationContext");

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
    t.instance.created(this.qt, this);
}

function callHydratingHook(t) {
    t.instance.hydrating(this.qt, this);
}

function callHydratedHook(t) {
    t.instance.hydrated(this.qt, this);
}

function callBindingHook(t) {
    return t.instance.binding(this.qt, this["$initiator"], this.parent);
}

function callBoundHook(t) {
    return t.instance.bound(this.qt, this["$initiator"], this.parent);
}

function callAttachingHook(t) {
    return t.instance.attaching(this.qt, this["$initiator"], this.parent);
}

function callAttachedHook(t) {
    return t.instance.attached(this.qt, this["$initiator"]);
}

function callDetachingHook(t) {
    return t.instance.detaching(this.qt, this["$initiator"], this.parent);
}

function callUnbindingHook(t) {
    return t.instance.unbinding(this.qt, this["$initiator"], this.parent);
}

let Pe;

let Ie;

let _e;

const Ve = it.set;

const Fe = /*@__PURE__*/ H("IEventTarget", t => t.cachedCallback(t => {
    if (t.has(Je, true)) {
        return t.get(Je).host;
    }
    return t.get(st).document;
}));

const He = /*@__PURE__*/ H("IRenderLocation");

const Oe = /*@__PURE__*/ H("ICssClassMapping");

const $e = new WeakMap;

function getEffectiveParentNode(t) {
    if ($e.has(t)) {
        return $e.get(t);
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
        if (e.mountTarget === xe.shadowRoot) {
            return getEffectiveParentNode(e.host);
        }
    }
    return t.parentNode;
}

function setEffectiveParentNode(t, e) {
    if (t.platform !== void 0 && !(t instanceof t.platform.Node)) {
        const s = t.childNodes;
        for (let t = 0, i = s.length; t < i; ++t) {
            $e.set(s[t], e);
        }
    } else {
        $e.set(t, e);
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
        return this.ue;
    }
    get lastChild() {
        return this.fe;
    }
    constructor(t, e) {
        this.platform = t;
        this.next = void 0;
        this.de = false;
        this.pe = false;
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
        this.ue = e.firstChild;
        this.fe = e.lastChild;
    }
    findTargets() {
        return this.t;
    }
    insertBefore(t) {
        if (this.pe && !!this.ref) {
            this.addToLinked();
        } else {
            const e = t.parentNode;
            if (this.de) {
                let s = this.ue;
                let i;
                const n = this.fe;
                while (s != null) {
                    i = s.nextSibling;
                    e.insertBefore(s, t);
                    if (s === n) {
                        break;
                    }
                    s = i;
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
            let s;
            const i = this.fe;
            while (e != null) {
                s = e.nextSibling;
                t.appendChild(e);
                if (e === i) {
                    break;
                }
                e = s;
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
            let s;
            let i = this.ue;
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
        if (this.de) {
            let s = this.ue;
            let i;
            const n = this.fe;
            while (s != null) {
                i = s.nextSibling;
                e.insertBefore(s, t);
                if (s === n) {
                    break;
                }
                s = i;
            }
        } else {
            this.de = true;
            e.insertBefore(this.f, t);
        }
    }
    unlink() {
        this.pe = false;
        this.next = void 0;
        this.ref = void 0;
    }
    link(t) {
        this.pe = true;
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

const Ne = /*@__PURE__*/ H("IWindow", t => t.callback(t => t.get(st).window));

const We = /*@__PURE__*/ H("ILocation", t => t.callback(t => t.get(Ne).location));

const je = /*@__PURE__*/ H("IHistory", t => t.callback(t => t.get(Ne).history));

const registerHostNode = (e, s, i = e.get(st)) => {
    registerResolver(e, i.HTMLElement, registerResolver(e, i.Element, registerResolver(e, nt, new t.InstanceProvider("ElementResolver", s))));
    return e;
};

function customElement(t) {
    return function(e, s) {
        s.addInitializer(function() {
            defineElement(t, this);
        });
        return e;
    };
}

function useShadowDOM(e, s) {
    if (e === void 0) {
        return function(t, e) {
            e.addInitializer(function() {
                annotateElementMetadata(this, "shadowOptions", {
                    mode: "open"
                });
            });
        };
    }
    if (!t.isFunction(e)) {
        return function(t, s) {
            s.addInitializer(function() {
                annotateElementMetadata(this, "shadowOptions", e);
            });
        };
    }
    s.addInitializer(function() {
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
    const e = f(Xe, t);
    if (e === void 0) {
        annotateElementMetadata(t, "containerless", true);
        return;
    }
    e.containerless = true;
}

const ze = new WeakMap;

class CustomElementDefinition {
    get type() {
        return W;
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
            const n = t.fromDefinitionOrDefault("name", i, Ke);
            if (t.isFunction(i.Type)) {
                s = i.Type;
            } else {
                s = Qe(t.pascalCase(n));
            }
            for (const t of Object.values(V.from(i.bindables))) {
                V.i(t, s);
            }
            return new CustomElementDefinition(s, n, t.mergeArrays(i.aliases), t.fromDefinitionOrDefault("key", i, () => getElementKeyFrom(n)), t.fromAnnotationOrDefinitionOrTypeOrDefault("capture", i, s, returnFalse), t.fromAnnotationOrDefinitionOrTypeOrDefault("template", i, s, returnNull), t.mergeArrays(i.instructions), t.mergeArrays(getElementAnnotation(s, "dependencies"), i.dependencies), t.fromDefinitionOrDefault("injectable", i, returnNull), t.fromDefinitionOrDefault("needsCompile", i, returnTrue), t.mergeArrays(i.surrogates), V.from(getElementAnnotation(s, "bindables"), i.bindables), t.fromAnnotationOrDefinitionOrTypeOrDefault("containerless", i, s, returnFalse), t.fromDefinitionOrDefault("shadowOptions", i, returnNull), t.fromDefinitionOrDefault("hasSlots", i, returnFalse), t.fromDefinitionOrDefault("enhance", i, returnFalse), t.fromDefinitionOrDefault("watches", i, returnEmptyArray), t.fromDefinitionOrDefault("strict", i, returnUndefined), t.fromAnnotationOrTypeOrDefault("processContent", s, returnNull));
        }
        if (t.isString(e)) {
            return new CustomElementDefinition(s, e, t.mergeArrays(getElementAnnotation(s, "aliases"), s.aliases), getElementKeyFrom(e), t.fromAnnotationOrTypeOrDefault("capture", s, returnFalse), t.fromAnnotationOrTypeOrDefault("template", s, returnNull), t.mergeArrays(getElementAnnotation(s, "instructions"), s.instructions), t.mergeArrays(getElementAnnotation(s, "dependencies"), s.dependencies), t.fromAnnotationOrTypeOrDefault("injectable", s, returnNull), t.fromAnnotationOrTypeOrDefault("needsCompile", s, returnTrue), t.mergeArrays(getElementAnnotation(s, "surrogates"), s.surrogates), V.from(...V.getAll(s), getElementAnnotation(s, "bindables"), s.bindables), t.fromAnnotationOrTypeOrDefault("containerless", s, returnFalse), t.fromAnnotationOrTypeOrDefault("shadowOptions", s, returnNull), t.fromAnnotationOrTypeOrDefault("hasSlots", s, returnFalse), t.fromAnnotationOrTypeOrDefault("enhance", s, returnFalse), t.mergeArrays(rt.getDefinitions(s), s.watches), t.fromAnnotationOrTypeOrDefault("strict", s, returnUndefined), t.fromAnnotationOrTypeOrDefault("processContent", s, returnNull));
        }
        const i = t.fromDefinitionOrDefault("name", e, Ke);
        for (const t of Object.values(V.from(e.bindables))) {
            V.i(t, s);
        }
        return new CustomElementDefinition(s, i, t.mergeArrays(getElementAnnotation(s, "aliases"), e.aliases, s.aliases), getElementKeyFrom(i), t.fromAnnotationOrDefinitionOrTypeOrDefault("capture", e, s, returnFalse), t.fromAnnotationOrDefinitionOrTypeOrDefault("template", e, s, returnNull), t.mergeArrays(getElementAnnotation(s, "instructions"), e.instructions, s.instructions), t.mergeArrays(getElementAnnotation(s, "dependencies"), e.dependencies, s.dependencies), t.fromAnnotationOrDefinitionOrTypeOrDefault("injectable", e, s, returnNull), t.fromAnnotationOrDefinitionOrTypeOrDefault("needsCompile", e, s, returnTrue), t.mergeArrays(getElementAnnotation(s, "surrogates"), e.surrogates, s.surrogates), V.from(...V.getAll(s), getElementAnnotation(s, "bindables"), s.bindables, e.bindables), t.fromAnnotationOrDefinitionOrTypeOrDefault("containerless", e, s, returnFalse), t.fromAnnotationOrDefinitionOrTypeOrDefault("shadowOptions", e, s, returnNull), t.fromAnnotationOrDefinitionOrTypeOrDefault("hasSlots", e, s, returnFalse), t.fromAnnotationOrDefinitionOrTypeOrDefault("enhance", e, s, returnFalse), t.mergeArrays(e.watches, rt.getDefinitions(s), s.watches), t.fromAnnotationOrDefinitionOrTypeOrDefault("strict", e, s, returnUndefined), t.fromAnnotationOrDefinitionOrTypeOrDefault("processContent", e, s, returnNull));
    }
    static getOrCreate(t) {
        if (t instanceof CustomElementDefinition) {
            return t;
        }
        if (ze.has(t)) {
            return ze.get(t);
        }
        const e = CustomElementDefinition.create(t);
        ze.set(t, e);
        p(e, e.Type, Xe);
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
        t.register(t.has(s, false) ? null : O(s, s), $(s, i), ...n.map(t => $(s, getElementKeyFrom(t))));
    }
    toString() {
        return `au:ce:${this.name}`;
    }
}

const Ue = {
    name: undefined,
    searchParents: false,
    optional: false
};

const returnNull = () => null;

const returnUndefined = () => void 0;

const returnFalse = () => false;

const returnTrue = () => true;

const returnEmptyArray = () => t.emptyArray;

const Ge = "custom-element";

const Xe = /*@__PURE__*/ t.getResourceKeyFor(Ge);

const getElementKeyFrom = t => `${Xe}:${t}`;

const Ke = /*@__PURE__*/ (t => () => `unnamed-${++t}`)(0);

const annotateElementMetadata = (t, e, s) => {
    p(s, t, g(e));
};

const defineElement = (e, s) => {
    const i = CustomElementDefinition.create(e, s);
    const n = i.Type;
    p(i, n, Xe, t.resourceBaseName);
    return n;
};

const isElementType = e => t.isFunction(e) && (d(Xe, e) || e.$au?.type === Ge);

const findElementControllerFor = (t, e = Ue) => {
    if (e.name === void 0 && e.searchParents !== true) {
        const s = it.get(t, Xe);
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
            const s = it.get(t, Xe);
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
            const t = it.get(s, Xe);
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
        const t = it.get(s, Xe);
        if (t !== null) {
            return t;
        }
        s = getEffectiveParentNode(s);
    }
    throw createMappedError(765, t);
};

const getElementAnnotation = (t, e) => f(g(e), t);

const getElementDefinition = t => {
    const e = f(Xe, t) ?? getDefinitionFromStaticAu(t, Ge, CustomElementDefinition.create);
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

const Qe = /*@__PURE__*/ function() {
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
        A(n, "name", t);
        if (i !== e) {
            k(n.prototype, i);
        }
        return n;
    };
}();

const Ye = /*@__PURE__*/ b({
    name: Xe,
    keyFrom: getElementKeyFrom,
    isType: isElementType,
    for: findElementControllerFor,
    define: defineElement,
    getDefinition: getElementDefinition,
    annotate: annotateElementMetadata,
    getAnnotation: getElementAnnotation,
    generateName: Ke,
    createInjectable: createElementInjectable,
    generateType: Qe,
    find(t, e) {
        const s = t.find(Ge, e);
        return s == null ? null : f(Xe, s) ?? getDefinitionFromStaticAu(s, Ge, CustomElementDefinition.create) ?? null;
    }
});

const Ze = /*@__PURE__*/ g("processContent");

function processContent(e) {
    return e === void 0 ? function(t, e) {
        if (!e.static || e.kind !== "method") throw createMappedError(766, t);
        e.addInitializer(function() {
            p(t, this, Ze);
        });
    } : function(s, i) {
        i.addInitializer(function() {
            if (t.isString(e) || t.isSymbol(e)) {
                e = this[e];
            }
            if (!t.isFunction(e)) throw createMappedError(766, e);
            const s = f(Xe, this);
            if (s !== void 0) {
                s.processContent = e;
            } else {
                p(e, this, Ze);
            }
        });
        return s;
    };
}

function capture(e) {
    return function(s, i) {
        const n = t.isFunction(e) ? e : true;
        i.addInitializer(function() {
            annotateElementMetadata(this, "capture", n);
            if (isElementType(this)) {
                getElementDefinition(this).capture = n;
            }
        });
    };
}

const Je = /*@__PURE__*/ H("IAppRoot");

class AppRoot {
    get controller() {
        return this.q;
    }
    constructor(e, s, i, n = false) {
        this.config = e;
        this.container = s;
        this.ge = void 0;
        this.xe = n;
        const r = this.host = e.host;
        i.prepare(this);
        registerResolver(s, Fe, new t.InstanceProvider("IEventTarget", r));
        registerHostNode(s, r, this.platform = this.ve(s, r));
        this.ge = t.onResolve(this.ye("creating"), () => {
            if (!e.allowActionlessForm !== false) {
                r.addEventListener("submit", t => {
                    const e = t.target;
                    const s = !e.getAttribute("action");
                    if (e.tagName === "FORM" && s) {
                        t.preventDefault();
                    }
                }, false);
            }
            const i = n ? s : s.createChild();
            const l = e.component;
            let h;
            if (t.isFunction(l)) {
                h = i.invoke(l);
                N(l, h);
            } else {
                h = e.component;
            }
            const a = {
                hydrate: false,
                projections: null
            };
            const c = n ? CustomElementDefinition.create({
                name: Ke(),
                template: this.host,
                enhance: true,
                strict: e.strictBinding
            }) : void 0;
            const u = this.q = Controller.$el(i, h, r, a, c);
            u.hE(a);
            return t.onResolve(this.ye("hydrating"), () => {
                u.hS();
                return t.onResolve(this.ye("hydrated"), () => {
                    u.hC();
                    this.ge = void 0;
                });
            });
        });
    }
    activate() {
        return t.onResolve(this.ge, () => t.onResolve(this.ye("activating"), () => t.onResolve(this.q.activate(this.q, null, void 0), () => this.ye("activated"))));
    }
    deactivate() {
        return t.onResolve(this.ye("deactivating"), () => t.onResolve(this.q.deactivate(this.q, null), () => this.ye("deactivated")));
    }
    ye(e) {
        const s = this.container;
        const i = this.xe && !s.has(tt, false) ? [] : s.getAll(tt);
        return t.onResolveAll(...i.reduce((t, s) => {
            if (s.slot === e) {
                t.push(s.run());
            }
            return t;
        }, []));
    }
    ve(t, e) {
        let s;
        if (!t.has(st, false)) {
            if (e.ownerDocument.defaultView === null) {
                throw createMappedError(769);
            }
            s = new n.BrowserPlatform(e.ownerDocument.defaultView);
            t.register(N(st, s));
        } else {
            s = t.get(st);
        }
        return s;
    }
    dispose() {
        this.q?.dispose();
    }
}

const ts = /*@__PURE__*/ H("IAurelia");

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
    constructor(e = t.DI.createContainer()) {
        this.container = e;
        this.ir = false;
        this.we = false;
        this.be = false;
        this.ke = void 0;
        this.next = void 0;
        this.Ce = void 0;
        this.Be = void 0;
        if (e.has(ts, true) || e.has(Aurelia, true)) {
            throw createMappedError(768);
        }
        registerResolver(e, ts, new t.InstanceProvider("IAurelia", this));
        registerResolver(e, Aurelia, new t.InstanceProvider("Aurelia", this));
        registerResolver(e, Je, this.Se = new t.InstanceProvider("IAppRoot"));
    }
    register(...t) {
        this.container.register(...t);
        return this;
    }
    app(t) {
        this.next = new AppRoot(t, this.container, this.Se);
        return this;
    }
    enhance(e) {
        const s = e.container ?? this.container.createChild();
        const i = registerResolver(s, Je, new t.InstanceProvider("IAppRoot"));
        const n = new AppRoot({
            host: e.host,
            component: e.component
        }, s, i, true);
        return t.onResolve(n.activate(), () => n);
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
        if (t.isPromise(this.Ce)) {
            return this.Ce;
        }
        return this.Ce = t.onResolve(this.stop(), () => {
            if (!it.hideProp) {
                Reflect.set(e.host, "$aurelia", this);
            }
            this.Se.prepare(this.ke = e);
            this.we = true;
            return t.onResolve(e.activate(), () => {
                this.ir = true;
                this.we = false;
                this.Ce = void 0;
                this.Ae(e, "au-started", e.host);
            });
        });
    }
    stop(e = false) {
        if (t.isPromise(this.Be)) {
            return this.Be;
        }
        if (this.ir === true) {
            const s = this.ke;
            this.ir = false;
            this.be = true;
            return this.Be = t.onResolve(s.deactivate(), () => t.onResolve(i.tasksSettled(), () => {
                Reflect.deleteProperty(s.host, "$aurelia");
                if (e) {
                    s.dispose();
                }
                this.ke = void 0;
                this.Se.dispose();
                this.be = false;
                this.Be = void 0;
                this.Ae(s, "au-stopped", s.host);
            }));
        }
    }
    dispose() {
        if (this.ir || this.be) {
            throw createMappedError(771);
        }
        this.container.dispose();
    }
    Ae(t, e, s) {
        const i = new t.platform.window.CustomEvent(e, {
            detail: this,
            bubbles: true,
            cancelable: true
        });
        s.dispatchEvent(i);
    }
}

const es = /*@__PURE__*/ H("ISVGAnalyzer", t => t.singleton(NoopSVGAnalyzer));

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
        t.register(O(this, this), $(this, es));
    }
    constructor() {
        this.Re = k(t.createLookup(), {
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
        this.Te = o("a altGlyph animate animateColor circle clipPath defs ellipse feBlend feColorMatrix feComponentTransfer feComposite feConvolveMatrix feDiffuseLighting feDisplacementMap feFlood feGaussianBlur feImage feMerge feMorphology feOffset feSpecularLighting feTile feTurbulence filter font foreignObject g glyph glyphRef image line linearGradient marker mask missing-glyph path pattern polygon polyline radialGradient rect stop svg switch symbol text textPath tref tspan use");
        this.Ee = o("alignment-baseline baseline-shift clip-path clip-rule clip color-interpolation-filters color-interpolation color-profile color-rendering color cursor direction display dominant-baseline enable-background fill-opacity fill-rule fill filter flood-color flood-opacity font-family font-size-adjust font-size font-stretch font-style font-variant font-weight glyph-orientation-horizontal glyph-orientation-vertical image-rendering kerning letter-spacing lighting-color marker-end marker-mid marker-start mask opacity overflow pointer-events shape-rendering stop-color stop-opacity stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width stroke text-anchor text-decoration text-rendering unicode-bidi visibility word-spacing writing-mode");
        const e = t.resolve(st);
        this.SVGElement = e.globalThis.SVGElement;
        const s = e.document.createElement("div");
        s.innerHTML = "<svg><altGlyph /></svg>";
        if (s.firstElementChild.nodeName === "altglyph") {
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
        this.Le = t.createLookup();
        this.Me = t.createLookup();
        this.svg = t.resolve(es);
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
            i = this.Le[n] ??= t.createLookup();
            for (r in s) {
                if (i[r] !== void 0) {
                    throw createError(r, n);
                }
                i[r] = s[r];
            }
        }
    }
    useGlobalMapping(t) {
        const e = this.Me;
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
        return shouldDefaultToTwoWay(t, e) || this.fns.length > 0 && this.fns.some(s => s(t, e));
    }
    map(t, e) {
        return this.Le[t.nodeName]?.[e] ?? this.Me[e] ?? (isDataAttribute(t, e, this.svg) ? e : null);
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

const ss = {
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
        this.qe = new WeakMap;
        this.De = new WeakMap;
    }
    el(t, e) {
        let s = this.qe.get(t);
        if (s == null) {
            this.qe.set(t, s = new RecordCache);
        }
        return e in s.Pe ? s.Pe[e] : s.Pe[e] = Ye.find(t, e);
    }
    attr(t, e) {
        let s = this.qe.get(t);
        if (s == null) {
            this.qe.set(t, s = new RecordCache);
        }
        return e in s.Ie ? s.Ie[e] : s.Ie[e] = ht.find(t, e);
    }
    bindables(e) {
        let s = this.De.get(e);
        if (s == null) {
            const i = e.bindables;
            const n = t.createLookup();
            let r;
            let h;
            let a = false;
            let c;
            let u;
            for (h in i) {
                r = i[h];
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
                n[u] = BindableDefinition.create(h, r);
            }
            if (r == null && e.type === "custom-attribute") {
                c = n.value = BindableDefinition.create("value", {
                    mode: e.defaultBindingMode ?? l
                });
            }
            this.De.set(e, s = new BindablesInfo(n, i, c ?? null));
        }
        return s;
    }
}

ResourceResolver.register = t.createImplementationRegister(e.IResourceResolver);

class RecordCache {
    constructor() {
        this.Pe = t.createLookup();
        this.Ie = t.createLookup();
    }
}

const is = t.createLookup();

class AttributeNSAccessor {
    static forNs(t) {
        return is[t] ??= new AttributeNSAccessor(t);
    }
    constructor(t) {
        this.ns = t;
        this.type = P | I;
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
        this.type = P | I;
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

const ns = /*@__PURE__*/ new DataAttributeAccessor;

class SelectValueObserver {
    static _e(t) {
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
                e[e.length] = w.call(n, "model") ? n.model : n.value;
            }
            ++i;
        }
        return e;
    }
    static Ve(t, e) {
        return t === e;
    }
    constructor(t, e, s, i) {
        this.type = P | D | I;
        this.v = void 0;
        this.ov = void 0;
        this.Fe = false;
        this.He = void 0;
        this.Oe = void 0;
        this.iO = false;
        this.ht = false;
        this.lt = t;
        this.oL = i;
        this.cf = s;
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
        const e = this.v;
        const s = this.lt;
        const i = t.isArray(e);
        const n = s.matcher ?? SelectValueObserver.Ve;
        const r = s.options;
        let l = r.length;
        while (l-- > 0) {
            const t = r[l];
            const s = w.call(t, "model") ? t.model : t.value;
            if (i) {
                t.selected = e.findIndex(t => !!n(s, t)) !== -1;
                continue;
            }
            t.selected = !!n(s, e);
        }
    }
    syncValue() {
        const t = this.lt;
        const e = t.options;
        const s = e.length;
        const i = this.v;
        let n = 0;
        if (t.multiple) {
            if (!(i instanceof Array)) {
                return true;
            }
            let r;
            const l = t.matcher || SelectValueObserver.Ve;
            const h = [];
            while (n < s) {
                r = e[n];
                if (r.selected) {
                    h.push(w.call(r, "model") ? r.model : r.value);
                }
                ++n;
            }
            let a;
            n = 0;
            while (n < i.length) {
                a = i[n];
                if (h.findIndex(t => !!l(a, t)) === -1) {
                    i.splice(n, 1);
                } else {
                    ++n;
                }
            }
            n = 0;
            while (n < h.length) {
                a = h[n];
                if (i.findIndex(t => !!l(a, t)) === -1) {
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
                r = w.call(l, "model") ? l.model : l.value;
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
    i.subscriberCollection(SelectValueObserver, null);
})();

const rs = "--";

class StyleAttributeAccessor {
    constructor(t) {
        this.obj = t;
        this.type = P | I;
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
    je(e) {
        let s;
        let i;
        const n = [];
        for (i in e) {
            s = e[i];
            if (s == null) {
                continue;
            }
            if (t.isString(s)) {
                if (i.startsWith(rs)) {
                    n.push([ i, s ]);
                    continue;
                }
                n.push([ t.kebabCase(i), s ]);
                continue;
            }
            n.push(...this.ze(s));
        }
        return n;
    }
    Ue(e) {
        const s = e.length;
        if (s > 0) {
            const t = [];
            let i = 0;
            for (;s > i; ++i) {
                t.push(...this.ze(e[i]));
            }
            return t;
        }
        return t.emptyArray;
    }
    ze(e) {
        if (t.isString(e)) {
            return this.We(e);
        }
        if (e instanceof Array) {
            return this.Ue(e);
        }
        if (e instanceof Object) {
            return this.je(e);
        }
        return t.emptyArray;
    }
    gt() {
        if (this.Fe) {
            this.Fe = false;
            const t = this.v;
            const e = this.styles;
            const s = this.ze(t);
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
                if (!w.call(e, i) || e[i] !== n) {
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
        this.type = P | D | I;
        this.v = "";
        this.ov = "";
        this.Fe = false;
        this.ht = false;
        this.lt = t;
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
    i.subscriberCollection(ValueAttributeObserver, null);
})();

const os = (() => {
    const e = "http://www.w3.org/1999/xlink";
    const s = "http://www.w3.org/XML/1998/namespace";
    const i = "http://www.w3.org/2000/xmlns/";
    return k(t.createLookup(), {
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

const ls = new i.PropertyAccessor;

ls.type = P | I;

class NodeObserverLocator {
    constructor() {
        this.allowDirtyCheck = true;
        this.Ge = t.createLookup();
        this.Xe = t.createLookup();
        this.Ke = t.createLookup();
        this.Qe = t.createLookup();
        this.Ye = t.resolve(t.IServiceLocator);
        this.p = t.resolve(st);
        this.Ze = t.resolve(i.IDirtyChecker);
        this.svg = t.resolve(es);
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
        const n = this.Ge;
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
        const s = this.Xe;
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
        if (s in this.Qe || s in (this.Ke[e.tagName] ?? t.emptyObject)) {
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
            return ns;

          default:
            {
                const t = os[s];
                if (t !== undefined) {
                    return AttributeNSAccessor.forNs(t[1]);
                }
                if (isDataAttribute(e, s, this.svg)) {
                    return ns;
                }
                return ls;
            }
        }
    }
    overrideAccessor(e, s) {
        let i;
        if (t.isString(e)) {
            i = this.Ke[e] ??= t.createLookup();
            i[s] = true;
        } else {
            for (const s in e) {
                for (const n of e[s]) {
                    i = this.Ke[s] ??= t.createLookup();
                    i[n] = true;
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
    getNodeObserver(t, e, s) {
        const n = this.Ge[t.tagName]?.[e] ?? this.Xe[e];
        let r;
        if (n != null) {
            r = new (n.type ?? ValueAttributeObserver)(t, e, n, s, this.Ye);
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
        const r = os[e];
        if (r !== undefined) {
            return AttributeNSAccessor.forNs(r[1]);
        }
        if (isDataAttribute(t, e, this.svg)) {
            return ns;
        }
        if (e in t.constructor.prototype) {
            if (this.allowDirtyCheck) {
                return this.Ze.createProperty(t, e);
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
        this.type = P | D | I;
        this.v = void 0;
        this.ov = void 0;
        this.Je = void 0;
        this.ts = void 0;
        this.ht = false;
        this.lt = t;
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
        this.es();
        this.ss();
        this.Tt();
    }
    handleCollectionChange() {
        this.ss();
    }
    handleChange(t, e) {
        this.ss();
    }
    ss() {
        const e = this.v;
        const s = this.lt;
        const i = w.call(s, "model") ? s.model : s.value;
        const n = s.type === "radio";
        const r = s.matcher !== void 0 ? s.matcher : defaultMatcher;
        if (n) {
            s.checked = !!r(e, i);
        } else if (e === true) {
            s.checked = true;
        } else {
            let n = false;
            if (t.isArray(e)) {
                n = e.findIndex(t => !!r(t, i)) !== -1;
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
        const s = this.lt;
        const i = w.call(s, "model") ? s.model : s.value;
        const n = s.checked;
        const r = s.matcher !== void 0 ? s.matcher : defaultMatcher;
        if (s.type === "checkbox") {
            if (t.isArray(e)) {
                const t = e.findIndex(t => !!r(t, i));
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
        this.Tt();
    }
    ct() {
        this.es();
    }
    ut() {
        this.v = this.ov = void 0;
        this.Je?.unsubscribe(this);
        this.ts?.unsubscribe(this);
        this.Je = this.ts = void 0;
    }
    Tt() {
        hs = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, hs);
        hs = void 0;
    }
    es() {
        const t = this.lt;
        (this.ts ??= t.$observers?.model ?? t.$observers?.value)?.subscribe(this);
        this.Je?.unsubscribe(this);
        this.Je = void 0;
        if (t.type === "checkbox") {
            (this.Je = getCollectionObserver(this.v, this.oL))?.subscribe(this);
        }
    }
}

(() => {
    mixinNodeObserverUseConfig(CheckedObserver);
    i.subscriberCollection(CheckedObserver, null);
})();

let hs = void 0;

class AttrBindingBehavior {
    bind(t, e) {
        if (!(e instanceof PropertyBinding)) {
            throw createMappedError(9994, e);
        }
        e.useTargetObserver(ns);
    }
}

AttrBindingBehavior.$au = {
    type: z,
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
    type: z,
    name: "self"
};

class UpdateTriggerBindingBehavior {
    constructor() {
        this.oL = t.resolve(i.IObserverLocator);
        this.rs = t.resolve(i.INodeObserverLocator);
    }
    bind(t, e, ...s) {
        if (!(this.rs instanceof NodeObserverLocator)) {
            throw createMappedError(9993);
        }
        if (s.length === 0) {
            throw createMappedError(802);
        }
        if (!(e instanceof PropertyBinding) || !(e.mode & c)) {
            throw createMappedError(803);
        }
        const i = this.rs.getNodeObserverConfig(e.target, e.targetProperty);
        if (i == null) {
            throw createMappedError(9992, e);
        }
        const n = this.rs.getNodeObserver(e.target, e.targetProperty, this.oL);
        n.useConfig({
            readonly: i.readonly,
            default: i.default,
            events: s
        });
        e.useTargetObserver(n);
    }
}

UpdateTriggerBindingBehavior.$au = {
    type: z,
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
        this.ls = false;
        this.cs = 0;
        this.us = t.resolve(Ct);
        this.l = t.resolve(He);
    }
    attaching(t, e) {
        return this.ds(this.value);
    }
    detaching(e, s) {
        this.ls = true;
        return t.onResolve(this.pending, () => {
            this.ls = false;
            this.pending = void 0;
            void this.view?.deactivate(e, this.$controller);
        });
    }
    valueChanged(t, e) {
        if (!this.$controller.isActive) return;
        t = !!t;
        e = !!e;
        if (t !== e) return this.ds(t);
    }
    ds(e) {
        const s = this.view;
        const i = this.$controller;
        const n = this.cs++;
        const isCurrent = () => !this.ls && this.cs === n + 1;
        let r;
        return t.onResolve(this.pending, () => this.pending = t.onResolve(s?.deactivate(s, i), () => {
            if (!isCurrent()) {
                return;
            }
            if (e) {
                r = this.view = this.ifView = this.cache && this.ifView != null ? this.ifView : this.us.create();
            } else {
                r = this.view = this.elseView = this.cache && this.elseView != null ? this.elseView : this.elseFactory?.create();
            }
            if (r == null) {
                return;
            }
            r.setLocation(this.l);
            return t.onResolve(r.activate(r, i, i.scope), () => {
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
        this.f = t.resolve(Ct);
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

const as = [ "BindingBehavior", "ValueConverter" ];

class Repeat {
    constructor() {
        this.views = [];
        this.key = null;
        this.ps = [];
        this.gs = [];
        this.xs = [];
        this.ys = new Map;
        this.ws = void 0;
        this.bs = false;
        this.ks = false;
        this.Cs = null;
        this.Bs = void 0;
        this.Ss = false;
        this.l = t.resolve(He);
        this.As = t.resolve(qe);
        this.f = t.resolve(Ct);
        this.Rs = t.resolve(ds);
        const s = t.resolve(e.IInstruction);
        const i = s.props[0].props[0];
        if (i !== void 0) {
            const {to: e, value: s, command: n} = i;
            if (e === "key") {
                if (n === null) {
                    this.key = s;
                } else if (n === "bind") {
                    this.key = t.resolve(r.IExpressionParser).parse(s, L);
                } else {
                    throw createMappedError(775, n);
                }
            } else {
                throw createMappedError(776, e);
            }
        }
    }
    binding(t, e) {
        const s = this.As.bindings;
        const n = s.length;
        let r = void 0;
        let l;
        let h = 0;
        for (;n > h; ++h) {
            r = s[h];
            if (r.target === this && r.targetProperty === "items") {
                l = this.forOf = r.ast;
                this.Ts = r;
                let t = l.iterable;
                while (t != null && as.includes(t.$kind)) {
                    t = t.expression;
                    this.bs = true;
                }
                this.Cs = t;
                break;
            }
        }
        this.Es();
        const a = l.declaration;
        if (!(this.Ss = a.$kind === "ArrayDestructuring" || a.$kind === "ObjectDestructuring")) {
            this.local = i.astEvaluate(a, this.$controller.scope, r, null);
        }
    }
    attaching(e, s) {
        this.Ls();
        this.Ms(void 0);
        return this.qs(e, this.Bs ?? t.emptyArray);
    }
    detaching(t, e) {
        this.Es();
        return this.Ds(t);
    }
    unbinding(t, e) {
        this.ys.clear();
    }
    itemsChanged() {
        if (!this.$controller.isActive) {
            return;
        }
        this.Es();
        this.Ls();
        this.Ms(void 0);
        this.Ps(void 0);
    }
    handleCollectionChange(t, e) {
        const s = this.$controller;
        if (!s.isActive) {
            return;
        }
        if (this.bs) {
            if (this.ks) {
                return;
            }
            this.ks = true;
            this.items = i.astEvaluate(this.forOf.iterable, s.scope, this.Ts, null);
            this.ks = false;
            return;
        }
        this.Ls();
        this.Ms(this.key === null ? e : void 0);
        this.Ps(e);
    }
    Ps(e) {
        const s = this.views;
        this.ps = s.slice();
        const n = s.length;
        const r = this.key;
        const l = r !== null;
        const h = this.xs;
        const a = this.gs;
        if (l || e === void 0) {
            const t = this.local;
            const s = this.Bs;
            const c = s.length;
            const u = this.forOf;
            const f = u.declaration;
            const d = this.Ts;
            const p = this.Ss;
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
            const s = t.onResolve(this.Is(e), () => this._s(e));
            if (t.isPromise(s)) {
                s.catch(rethrow);
            }
        } else {
            this._s(e);
        }
    }
    Es() {
        const e = this.$controller.scope;
        let s = this.Vs;
        let n = this.bs;
        let r;
        if (n) {
            s = this.Vs = i.astEvaluate(this.Cs, e, this.Ts, null) ?? null;
            n = this.bs = !t.areEqual(this.items, s);
        }
        const l = this.ws;
        if (this.$controller.isActive) {
            const t = n ? s : this.items;
            r = this.ws = this.Rs.resolve(t).getObserver?.(t);
            if (l !== r) {
                l?.unsubscribe(this);
                r?.subscribe(this);
            }
        } else {
            l?.unsubscribe(this);
            this.ws = undefined;
        }
    }
    Ms(t) {
        const e = this.gs;
        this.xs = e.slice();
        const s = this.Bs;
        const n = s.length;
        const r = this.gs = Array(s.length);
        const l = this.ys;
        const h = new Map;
        const a = this.$controller.scope;
        const c = this.Ts;
        const u = this.forOf;
        const f = this.local;
        const d = this.Ss;
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
        this.ys = h;
    }
    Ls() {
        const e = this.items;
        if (t.isArray(e)) {
            this.Bs = e.slice(0);
            return;
        }
        const s = [];
        this.Rs.resolve(e).iterate(e, (t, e) => {
            s[e] = t;
        });
        this.Bs = s;
    }
    qs(e, s) {
        let i = void 0;
        let n;
        let r;
        let l;
        const {$controller: h, f: a, l: c, gs: u} = this;
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
    Ds(e) {
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
    Is(e) {
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
    _s(e) {
        let s = void 0;
        let i;
        let n;
        let r = 0;
        const {$controller: l, f: h, l: a, views: c, gs: u, ps: f} = this;
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
            if (e[r] === -2) {
                n.nodes.link(x?.nodes ?? a);
                n.setLocation(a);
                setContextualProperties(u[r].overrideContext, r, d);
                i = n.activate(n, l, u[r]);
                if (t.isPromise(i)) {
                    (s ?? (s = [])).push(i);
                }
            } else if (v < 0 || r !== m[v]) {
                n.nodes.link(x?.nodes ?? a);
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

let cs = 16;

let us = new Int32Array(cs);

let fs = new Int32Array(cs);

function longestIncreasingSubsequence(t) {
    const e = t.length;
    if (e > cs) {
        cs = e;
        us = new Int32Array(e);
        fs = new Int32Array(e);
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
            l = us[s];
            n = t[l];
            if (n !== -2 && n < i) {
                fs[r] = l;
                us[++s] = r;
                continue;
            }
            h = 0;
            a = s;
            while (h < a) {
                c = h + a >> 1;
                n = t[us[c]];
                if (n !== -2 && n < i) {
                    h = c + 1;
                } else {
                    a = c;
                }
            }
            n = t[us[h]];
            if (i < n || n === -2) {
                if (h > 0) {
                    fs[r] = us[h - 1];
                }
                us[h] = r;
            }
        }
    }
    r = ++s;
    const u = new Int32Array(r);
    i = us[s - 1];
    while (s-- > 0) {
        u[s] = i;
        i = fs[i];
    }
    while (r-- > 0) us[r] = 0;
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

const ds = /*@__PURE__*/ H("IRepeatableHandlerResolver", t => t.singleton(RepeatableHandlerResolver));

class RepeatableHandlerResolver {
    constructor() {
        this.Fs = t.resolve(t.all(ps));
    }
    resolve(t) {
        if (ms.handles(t)) {
            return ms;
        }
        if (gs.handles(t)) {
            return gs;
        }
        if (xs.handles(t)) {
            return xs;
        }
        if (vs.handles(t)) {
            return vs;
        }
        if (ys.handles(t)) {
            return ys;
        }
        const e = this.Fs.find(e => e.handles(t));
        if (e !== void 0) {
            return e;
        }
        return ws;
    }
}

class ArrayLikeHandler {
    static register(t) {
        t.register(O(ps, this));
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

const ps = /*@__PURE__*/ H("IRepeatableHandler");

const ms = {
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

const gs = {
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

const xs = {
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

const vs = {
    handles: t.isNumber,
    iterate(t, e) {
        let s = 0;
        for (;s < t; ++s) {
            e(s, s, t);
        }
    }
};

const ys = {
    handles: t => t == null,
    iterate() {}
};

const ws = {
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
        this.view = t.resolve(Ct).create().setLocation(t.resolve(He));
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
        this.f = t.resolve(Ct);
        this.l = t.resolve(He);
    }
    link(t, e, s, i) {
        this.view = this.f.create(this.$controller).setLocation(this.l);
    }
    attaching(t, e) {
        const s = this.view;
        const i = this.$controller;
        this.queue(() => s.activate(t, i, i.scope));
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
        this.queue(() => this.Hs(t));
    }
    Hs(e) {
        const s = e.isMatch(this.value);
        const i = this.activeCases;
        const n = i.length;
        if (!s) {
            if (n > 0 && i[0].id === e.id) {
                return this.Os(null);
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
        return t.onResolve(this.Os(null, r), () => {
            this.activeCases = r;
            return this.$s(null);
        });
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
        return t.onResolve(this.activeCases.length > 0 ? this.Os(e, i) : void 0, () => {
            this.activeCases = i;
            if (i.length === 0) {
                return;
            }
            return this.$s(e);
        });
    }
    $s(e) {
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
        return t.onResolveAll(...i.map(t => t.activate(e, r)));
    }
    Os(e, s = []) {
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
        return t.onResolve(t.onResolveAll(...i.reduce((t, i) => {
            if (!s.includes(i)) {
                t.push(i.deactivate(e));
            }
            return t;
        }, [])), () => {
            i.length = 0;
        });
    }
    queue(e) {
        const s = this.promise;
        let i = void 0;
        i = this.promise = t.onResolve(t.onResolve(s, e), () => {
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
    type: ot,
    name: "switch",
    isTemplateController: true,
    bindables: [ "value" ]
};

let bs = 0;

const ks = [ "value", {
    name: "fallThrough",
    mode: h,
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
        this.id = ++bs;
        this.fallThrough = false;
        this.view = void 0;
        this.f = t.resolve(Ct);
        this.Ye = t.resolve(i.IObserverLocator);
        this.l = t.resolve(He);
        this.Ns = t.resolve(t.ILogger).scopeTo(`Case-#${this.id}`);
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
        this.Ns.debug("isMatch()");
        const s = this.value;
        if (t.isArray(s)) {
            if (this.ws === void 0) {
                this.ws = this.Ws(s);
            }
            return s.includes(e);
        }
        return s === e;
    }
    valueChanged(e, s) {
        if (t.isArray(e)) {
            this.ws?.unsubscribe(this);
            this.ws = this.Ws(e);
        } else if (this.ws !== void 0) {
            this.ws.unsubscribe(this);
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
        this.ws?.unsubscribe(this);
        this.view?.dispose();
        this.view = void 0;
    }
    linkToSwitch(t) {
        t.cases.push(this);
    }
    Ws(t) {
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
        bindables: ks,
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
        bindables: ks,
        isTemplateController: true
    }, DefaultCase);
})();

var Cs, Bs, Ss;

class PromiseTemplateController {
    constructor() {
        this.preSettledTask = null;
        this.postSettledTask = null;
        this.f = t.resolve(Ct);
        this.l = t.resolve(He);
        this.p = t.resolve(st);
        this.logger = t.resolve(t.ILogger).scopeTo("promise.resolve");
    }
    link(t, e, s, i) {
        this.view = this.f.create(this.$controller).setLocation(this.l);
    }
    attaching(e, s) {
        const n = this.view;
        const r = this.$controller;
        return t.onResolve(n.activate(e, r, this.viewScope = i.Scope.fromParent(r.scope, {})), () => this.swap(e));
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
        const n = this.fulfilled;
        const r = this.rejected;
        const l = this.pending;
        const h = this.viewScope;
        let a;
        const $swap = () => {
            void t.onResolveAll(a = (this.preSettledTask = i.queueAsyncTask(() => t.onResolveAll(n?.deactivate(e), r?.deactivate(e), l?.activate(e, h)))).result.catch(t => {
                throw t;
            }), s.then(c => {
                if (this.value !== s) {
                    return;
                }
                const fulfill = () => {
                    this.postSettlePromise = (this.postSettledTask = i.queueAsyncTask(() => t.onResolveAll(l?.deactivate(e), r?.deactivate(e), n?.activate(e, h, c)))).result;
                };
                if (this.preSettledTask.status === q) {
                    void a.then(fulfill);
                } else {
                    this.preSettledTask.cancel();
                    fulfill();
                }
            }, c => {
                if (this.value !== s) {
                    return;
                }
                const reject = () => {
                    this.postSettlePromise = (this.postSettledTask = i.queueAsyncTask(() => t.onResolveAll(l?.deactivate(e), n?.deactivate(e), r?.activate(e, h, c)))).result;
                };
                if (this.preSettledTask.status === q) {
                    void a.then(reject);
                } else {
                    this.preSettledTask.cancel();
                    reject();
                }
            }));
        };
        if (this.postSettledTask?.status === q) {
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
        this.f = t.resolve(Ct);
        this.l = t.resolve(He);
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
            mode: a
        }
    }
};

class FulfilledTemplateController {
    constructor() {
        this.view = void 0;
        this.f = t.resolve(Ct);
        this.l = t.resolve(He);
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
            mode: c
        }
    }
};

class RejectedTemplateController {
    constructor() {
        this.view = void 0;
        this.f = t.resolve(Ct);
        this.l = t.resolve(He);
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
            mode: c
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

Cs = Symbol.metadata;

PromiseAttributePattern[Cs] = {
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

Bs = Symbol.metadata;

FulfilledAttributePattern[Bs] = {
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

Ss = Symbol.metadata;

RejectedAttributePattern[Ss] = {
    [t.registrableMetadataKey]: e.AttributePattern.create([ {
        pattern: "catch",
        symbols: ""
    } ], RejectedAttributePattern)
};

class Focus {
    constructor() {
        this.js = false;
        this.Pe = t.resolve(nt);
        this.p = t.resolve(st);
    }
    binding() {
        this.valueChanged();
    }
    valueChanged() {
        if (this.$controller.isActive) {
            this.zs();
        } else {
            this.js = true;
        }
    }
    attached() {
        if (this.js) {
            this.js = false;
            this.zs();
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
        } else if (!this.Us) {
            this.value = false;
        }
    }
    zs() {
        const t = this.Pe;
        const e = this.Us;
        const s = this.value;
        if (s && !e) {
            t.focus();
        } else if (!s && e) {
            t.blur();
        }
    }
    get Us() {
        return this.Pe === this.p.document.activeElement;
    }
}

Focus.$au = {
    type: ot,
    name: "focus",
    bindables: {
        value: {
            mode: u
        }
    }
};

class Portal {
    constructor() {
        this.position = "beforeend";
        this.strict = false;
        const e = t.resolve(Ct);
        const s = t.resolve(He);
        const i = t.resolve(st);
        this.p = i;
        this.Gs = i.document.createElement("div");
        (this.view = e.create()).setLocation(this.Xs = Bt(i));
        setEffectiveParentNode(this.view.nodes, s);
    }
    attaching(t) {
        if (this.callbackContext == null) {
            this.callbackContext = this.$controller.scope.bindingContext;
        }
        const e = this.Gs = this.Ks();
        this.Qs(e, this.position);
        return this.Ys(t, e);
    }
    detaching(t) {
        return this.Zs(t, this.Gs);
    }
    targetChanged() {
        const {$controller: e} = this;
        if (!e.isActive) {
            return;
        }
        const s = this.Ks();
        if (this.Gs === s) {
            return;
        }
        this.Gs = s;
        const i = t.onResolve(this.Zs(null, s), () => {
            this.Qs(s, this.position);
            return this.Ys(null, s);
        });
        if (t.isPromise(i)) {
            i.catch(rethrow);
        }
    }
    positionChanged() {
        const {$controller: e, Gs: s} = this;
        if (!e.isActive) {
            return;
        }
        const i = t.onResolve(this.Zs(null, s), () => {
            this.Qs(s, this.position);
            return this.Ys(null, s);
        });
        if (t.isPromise(i)) {
            i.catch(rethrow);
        }
    }
    Ys(e, s) {
        const {activating: i, callbackContext: n, view: r} = this;
        return t.onResolve(i?.call(n, s, r), () => this.Js(e, s));
    }
    Js(e, s) {
        const {$controller: i, view: n} = this;
        if (e === null) {
            n.nodes.insertBefore(this.Xs);
        } else {
            return t.onResolve(n.activate(e ?? n, i, i.scope), () => this.ti(s));
        }
        return this.ti(s);
    }
    ti(t) {
        const {activated: e, callbackContext: s, view: i} = this;
        return e?.call(s, t, i);
    }
    Zs(e, s) {
        const {deactivating: i, callbackContext: n, view: r} = this;
        return t.onResolve(i?.call(n, s, r), () => this.ei(e, s));
    }
    ei(e, s) {
        const {$controller: i, view: n} = this;
        if (e === null) {
            n.nodes.remove();
        } else {
            return t.onResolve(n.deactivate(e, i), () => this.si(s));
        }
        return this.si(s);
    }
    si(e) {
        const {deactivated: s, callbackContext: i, view: n} = this;
        return t.onResolve(s?.call(i, e, n), () => this.ii());
    }
    Ks() {
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
    ii() {
        this.Xs.remove();
        this.Xs.$start.remove();
    }
    Qs(t, e) {
        const s = this.Xs;
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

let As;

class AuSlot {
    constructor() {
        this.ni = null;
        this.ri = null;
        this.ne = false;
        this.expose = null;
        this.slotchange = null;
        this.oi = new Set;
        this.ws = null;
        const s = t.resolve(De);
        const i = t.resolve(He);
        const n = t.resolve(e.IInstruction);
        const r = t.resolve(ie);
        const l = this.name = n.data.name;
        const h = n.projections?.[St];
        const a = s.instruction?.projections?.[l];
        const c = s.controller.container;
        let u;
        let f;
        if (a == null) {
            f = c.createChild({
                inheritParentResources: true
            });
            u = r.getViewFactory(h ?? (As ??= CustomElementDefinition.create({
                name: "au-slot-empty-template",
                template: "",
                needsCompile: false
            })), f);
            this.li = false;
        } else {
            f = c.createChild();
            f.useResources(s.parent.controller.container);
            registerResolver(f, De, new t.InstanceProvider(void 0, s.parent));
            u = r.getViewFactory(a, f);
            this.li = true;
            this.hi = c.getAll(Tt, false)?.filter(t => t.slotName === "*" || t.slotName === l) ?? t.emptyArray;
        }
        this.ai = (this.hi ??= t.emptyArray).length > 0;
        this.ci = s;
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
        this.oi.add(t);
    }
    unsubscribe(t) {
        this.oi.delete(t);
    }
    binding(t, e) {
        this.ni = e.scope;
        while (e.vmKind === "synthetic" && e.parent?.viewModel instanceof AuSlot) {
            e = e.parent.parent;
        }
        const s = e.scope.bindingContext;
        let n;
        if (this.li) {
            n = this.ci.controller.scope.parent;
            (this.ri = i.Scope.fromParent(n, n.bindingContext)).overrideContext.$host = this.expose ?? s;
        }
    }
    attaching(e, s) {
        return t.onResolve(this.view.activate(e, this.$controller, this.li ? this.ri : this.ni), () => {
            if (this.ai || t.isFunction(this.slotchange)) {
                this.hi.forEach(t => t.watch(this));
                this.es();
                this.ui();
                this.ne = true;
            }
        });
    }
    detaching(t, e) {
        this.ne = false;
        this.fi();
        this.hi.forEach(t => t.unwatch(this));
        return this.view.deactivate(t, this.$controller);
    }
    exposeChanged(t) {
        if (this.li && this.ri != null) {
            this.ri.overrideContext.$host = t;
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
    es() {
        if (this.ws != null) {
            return;
        }
        const t = this.l;
        const e = t.parentElement;
        if (e == null) {
            return;
        }
        (this.ws = createMutationObserver(e, e => {
            if (isMutationWithinLocation(t, e)) {
                this.ui();
            }
        })).observe(e, {
            childList: true
        });
    }
    fi() {
        this.ws?.disconnect();
        this.ws = null;
    }
    ui() {
        const t = this.nodes;
        const e = new Set(this.oi);
        let s;
        if (this.ne) {
            this.slotchange?.call(void 0, this.name, t);
        }
        for (s of e) {
            s.handleSlotChange(this, t);
        }
    }
}

AuSlot.$au = {
    type: Ge,
    name: "au-slot",
    template: null,
    containerless: true,
    processContent(t, e, s) {
        s.name = t.getAttribute("name") ?? St;
        let i = t.firstChild;
        let n = null;
        while (i !== null) {
            n = i.nextSibling;
            if (isElement(i) && i.hasAttribute(At)) {
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
        this.di = void 0;
        this.tag = null;
        this.c = t.resolve(t.IContainer);
        this.parent = t.resolve(qe);
        this.pi = t.resolve(nt);
        this.l = t.resolve(He);
        this.p = t.resolve(st);
        this.r = t.resolve(ie);
        this.mi = t.resolve(e.IInstruction);
        this.gi = t.resolve(t.transient(CompositionContextFactory, null));
        this.yt = t.resolve(e.ITemplateCompiler);
        this.st = t.resolve(De);
        this.ep = t.resolve(r.IExpressionParser);
        this.oL = t.resolve(i.IObserverLocator);
        this.ne = false;
    }
    get composing() {
        return this.xi;
    }
    get composition() {
        return this.di;
    }
    attaching(e, s) {
        this.ne = true;
        return this.xi = t.onResolve(this.queue(new ChangeInfo(this.template, this.component, this.model, void 0), e), t => {
            if (this.gi.yi(t)) {
                this.xi = void 0;
            }
        });
    }
    detaching(e) {
        this.ne = false;
        const s = this.di;
        const i = this.xi;
        this.gi.invalidate();
        this.di = this.xi = void 0;
        return t.onResolve(i, () => s?.deactivate(e));
    }
    propertyChanged(e) {
        if (!this.ne) return;
        if (e === "composing" || e === "composition") return;
        if (e === "model" && this.di != null) {
            this.di.update(this.model);
            return;
        }
        if (e === "tag" && this.di?.controller.vmKind === be) {
            return;
        }
        this.xi = t.onResolve(this.xi, () => t.onResolve(this.queue(new ChangeInfo(this.template, this.component, this.model, e), void 0), t => {
            if (this.gi.yi(t)) {
                this.xi = void 0;
            }
        }));
    }
    queue(e, s) {
        const i = this.gi;
        const n = this.di;
        return t.onResolve(i.create(e), e => {
            if (i.yi(e)) {
                return t.onResolve(this.compose(e), r => {
                    if (i.yi(e)) {
                        return t.onResolve(r.activate(s), () => {
                            if (i.yi(e)) {
                                this.di = r;
                                return t.onResolve(n?.deactivate(s), () => e);
                            } else {
                                return t.onResolve(r.controller.deactivate(r.controller, this.$controller), () => {
                                    r.controller.dispose();
                                    return e;
                                });
                            }
                        });
                    }
                    r.controller.dispose();
                    return e;
                });
            }
            return e;
        });
    }
    compose(e) {
        const {wi: s, bi: n, ki: r} = e.change;
        const {c: l, $controller: h, l: a, mi: c} = this;
        const u = this.Ci(this.st.controller.container, n);
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
        const m = this.Bi(f, typeof n === "string" ? u.Type : n, d, p);
        const compose = () => {
            const n = c.captures ?? t.emptyArray;
            if (u !== null) {
                const s = u.capture;
                const [i, r] = n.reduce((e, i) => {
                    const n = !(i.target in u.bindables) && (s === true || t.isFunction(s) && !!s(i.target));
                    e[n ? 0 : 1].push(i);
                    return e;
                }, [ [], [] ]);
                const l = Controller.$el(f, m, d, {
                    projections: c.projections,
                    captures: i
                }, u, p);
                this.Si(d, u, r).forEach(t => l.addBinding(t));
                return new CompositionController(l, t => l.activate(t ?? l, h, h.scope.parent), e => t.onResolve(l.deactivate(e ?? l, h), removeCompositionHost), t => m.activate?.(t), e);
            } else {
                const r = CustomElementDefinition.create({
                    name: Ye.generateName(),
                    template: s
                });
                const l = this.r.getViewFactory(r, f);
                const a = Controller.$view(l, h);
                const c = this.scopeBehavior === "auto" ? i.Scope.fromParent(this.parent.scope, m) : i.Scope.create(m);
                a.setHost(d);
                if (p == null) {
                    this.Si(d, r, n).forEach(t => a.addBinding(t));
                } else {
                    a.setLocation(p);
                }
                return new CompositionController(a, t => a.activate(t ?? a, h, c), e => t.onResolve(a.deactivate(e ?? a, h), removeCompositionHost), t => m.activate?.(t), e);
            }
        };
        if ("activate" in m) {
            return t.onResolve(m.activate(r), () => compose());
        } else {
            return compose();
        }
    }
    Bi(e, s, i, n) {
        if (s == null) {
            return new EmptyComponent;
        }
        if (typeof s === "object") {
            return s;
        }
        const r = this.p;
        registerHostNode(e, i, r);
        registerResolver(e, He, new t.InstanceProvider("IRenderLocation", n));
        const l = e.invoke(s);
        registerResolver(e, s, new t.InstanceProvider("au-compose.component", l));
        return l;
    }
    Ci(e, s) {
        if (typeof s === "string") {
            const t = Ye.find(e, s);
            if (t == null) {
                throw createMappedError(806, s);
            }
            return t;
        }
        const i = t.isFunction(s) ? s : s?.constructor;
        return Ye.isType(i, void 0) ? Ye.getDefinition(i, null) : null;
    }
    Si(t, e, s) {
        const i = new HydrationContext(this.$controller, {
            projections: null,
            captures: s
        }, this.st.parent);
        return SpreadBinding.create(i, t, e, this.r, this.yt, this.p, this.ep, this.oL);
    }
}

AuCompose.$au = {
    type: Ge,
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
        mode: c
    }, {
        name: "composition",
        mode: c
    }, "tag" ]
};

class EmptyComponent {}

class CompositionContextFactory {
    constructor() {
        this.id = 0;
    }
    yi(t) {
        return t.id === this.id;
    }
    create(e) {
        return t.onResolve(e.load(), t => new CompositionContext(++this.id, t));
    }
    invalidate() {
        this.id++;
    }
}

class ChangeInfo {
    constructor(t, e, s, i) {
        this.wi = t;
        this.bi = e;
        this.ki = s;
        this.Ai = i;
    }
    load() {
        if (t.isPromise(this.wi) || t.isPromise(this.bi)) {
            return Promise.all([ this.wi, this.bi ]).then(([t, e]) => new LoadedChangeInfo(t, e, this.ki, this.Ai));
        } else {
            return new LoadedChangeInfo(this.wi, this.bi, this.ki, this.Ai);
        }
    }
}

class LoadedChangeInfo {
    constructor(t, e, s, i) {
        this.wi = t;
        this.bi = e;
        this.ki = s;
        this.Ai = i;
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

const Rs = /*@__PURE__*/ H("ISanitizer", t => t.singleton(class {
    sanitize() {
        throw createMappedError(99, "sanitize");
    }
}));

class SanitizeValueConverter {
    constructor() {
        this.Ri = t.resolve(Rs);
    }
    toView(t) {
        if (t == null) {
            return null;
        }
        return this.Ri.sanitize(t);
    }
}

SanitizeValueConverter.$au = {
    type: ut,
    name: "sanitize"
};

class Show {
    constructor() {
        this.el = t.resolve(nt);
        this.p = t.resolve(st);
        this.Ti = false;
        this.L = false;
        this.$val = "";
        this.$prio = "";
        this.update = () => {
            this.L = false;
            if (Boolean(this.value) !== this.Ei) {
                if (this.Ei === this.Li) {
                    this.Ei = !this.Li;
                    this.$val = this.el.style.getPropertyValue("display");
                    this.$prio = this.el.style.getPropertyPriority("display");
                    this.el.style.setProperty("display", "none", "important");
                } else {
                    this.Ei = this.Li;
                    this.el.style.setProperty("display", this.$val, this.$prio);
                    if (this.el.getAttribute("style") === "") {
                        this.el.removeAttribute("style");
                    }
                }
            }
        };
        const s = t.resolve(e.IInstruction);
        this.Ei = this.Li = s.alias !== "hide";
    }
    binding() {
        this.Ti = true;
        this.update();
    }
    detaching() {
        this.Ti = false;
        this.L = false;
    }
    valueChanged() {
        if (this.Ti && !this.L) {
            this.L = true;
            i.queueTask(this.update);
        }
    }
}

Show.$au = {
    type: ot,
    name: "show",
    bindables: [ "value" ],
    aliases: [ "hide" ]
};

const Ts = [ ss, i.DirtyChecker, NodeObserverLocator ];

const Es = [ e.RefAttributePattern, e.DotSeparatedAttributePattern, e.EventAttributePattern, kt ];

const Ls = [ e.AtPrefixedTriggerAttributePattern, e.ColonPrefixedBindAttributePattern ];

const Ms = [ e.DefaultBindingCommand, e.OneTimeBindingCommand, e.FromViewBindingCommand, e.ToViewBindingCommand, e.TwoWayBindingCommand, e.ForBindingCommand, e.RefBindingCommand, e.TriggerBindingCommand, e.CaptureBindingCommand, e.ClassBindingCommand, e.StyleBindingCommand, e.AttrBindingCommand, e.SpreadValueBindingCommand ];

const qs = [ DebounceBindingBehavior, OneTimeBindingBehavior, ToViewBindingBehavior, FromViewBindingBehavior, SignalBindingBehavior, ThrottleBindingBehavior, TwoWayBindingBehavior, SanitizeValueConverter, If, Else, Repeat, With, Switch, Case, DefaultCase, PromiseTemplateController, PendingTemplateController, FulfilledTemplateController, RejectedTemplateController, PromiseAttributePattern, FulfilledAttributePattern, RejectedAttributePattern, AttrBindingBehavior, SelfBindingBehavior, UpdateTriggerBindingBehavior, AuCompose, Portal, Focus, Show, AuSlot ];

const Ds = [ Ft, Ht, _t, Vt, Mt, qt, Dt, Pt, It, Nt, Gt, Wt, jt, zt, Ut, Ot, Xt, Kt ];

const Ps = /*@__PURE__*/ createConfiguration(t.noop);

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
            return e.register(N(i.ICoercionConfiguration, s.coercingOptions), r.ExpressionParser, ...Ts, ...qs, ...Es, ...Ms, ...Ds);
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
    const r = g("dependencies");
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
        this.Mi = void 0;
        this.isBound = false;
        this.obj = e;
        this.cb = s;
        this.J = i;
        this.qi = n;
        this.Di = r;
        this.ws = createMutationObserver(this.pi = t, () => {
            this.Pi();
        });
    }
    getValue() {
        return this.isBound ? this.Mi : this.Ii();
    }
    setValue(t) {}
    bind() {
        if (this.isBound) {
            return;
        }
        this.isBound = true;
        this.ws.observe(this.pi, {
            childList: true
        });
        this.Mi = this.Ii();
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        this.ws.takeRecords();
        this.ws.disconnect();
        this.Mi = t.emptyArray;
    }
    Pi() {
        this.Mi = this.Ii();
        this.cb?.call(this.obj);
        this.subs.notify(this.Mi, undefined);
    }
    get() {
        throw createMappedError(99, "get");
    }
    Ii() {
        const t = this.J;
        const e = this.qi;
        const s = this.Di;
        const i = t === "$all" ? this.pi.childNodes : this.pi.querySelectorAll(`:scope > ${t}`);
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
        this.tt = t;
    }
    register(t) {
        N(at, this).register(t);
    }
    hydrating(t, e) {
        const s = this.tt;
        const i = s.query ?? "*";
        const n = new ChildrenBinding(e.host, t, t[s.callback ?? `${v(s.name)}Changed`], i, s.filter, s.map);
        if (/[\s>]/.test(i)) {
            throw createMappedError(9989, i);
        }
        A(t, s.name, {
            enumerable: true,
            configurable: true,
            get: k(() => n.getValue(), {
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

exports.AppTask = et;

exports.ArrayLikeHandler = ArrayLikeHandler;

exports.AttrBindingBehavior = AttrBindingBehavior;

exports.AttrMapper = AttrMapper;

exports.AttributeBinding = AttributeBinding;

exports.AttributeBindingRenderer = Gt;

exports.AttributeNSAccessor = AttributeNSAccessor;

exports.AuCompose = AuCompose;

exports.AuSlot = AuSlot;

exports.AuSlotsInfo = AuSlotsInfo;

exports.Aurelia = Aurelia;

exports.Bindable = V;

exports.BindableDefinition = BindableDefinition;

exports.BindingBehavior = G;

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

exports.CustomAttribute = ht;

exports.CustomAttributeDefinition = CustomAttributeDefinition;

exports.CustomAttributeRenderer = Dt;

exports.CustomElement = Ye;

exports.CustomElementDefinition = CustomElementDefinition;

exports.CustomElementRenderer = qt;

exports.DataAttributeAccessor = DataAttributeAccessor;

exports.DebounceBindingBehavior = DebounceBindingBehavior;

exports.DefaultBindingLanguage = Ms;

exports.DefaultBindingSyntax = Es;

exports.DefaultCase = DefaultCase;

exports.DefaultComponents = Ts;

exports.DefaultRenderers = Ds;

exports.DefaultResources = qs;

exports.Else = Else;

exports.EventModifier = EventModifier;

exports.EventModifierRegistration = kt;

exports.ExpressionWatcher = ExpressionWatcher;

exports.FlushQueue = FlushQueue;

exports.Focus = Focus;

exports.FragmentNodeSequence = FragmentNodeSequence;

exports.FromViewBindingBehavior = FromViewBindingBehavior;

exports.FulfilledTemplateController = FulfilledTemplateController;

exports.IAppRoot = Je;

exports.IAppTask = tt;

exports.IAuSlotWatcher = Tt;

exports.IAuSlotsInfo = Rt;

exports.IAurelia = ts;

exports.IController = qe;

exports.IEventModifier = bt;

exports.IEventTarget = Fe;

exports.IFlushQueue = gt;

exports.IHistory = je;

exports.IHydrationContext = De;

exports.IKeyMapping = wt;

exports.ILifecycleHooks = at;

exports.IListenerBindingOptions = $t;

exports.ILocation = We;

exports.IModifiedEventHandlerCreator = yt;

exports.INode = nt;

exports.IPlatform = st;

exports.IRenderLocation = He;

exports.IRenderer = Lt;

exports.IRendering = ie;

exports.IRepeatableHandler = ps;

exports.IRepeatableHandlerResolver = ds;

exports.ISVGAnalyzer = es;

exports.ISanitizer = Rs;

exports.IShadowDOMGlobalStyles = oe;

exports.IShadowDOMStyleFactory = ne;

exports.IShadowDOMStyles = re;

exports.ISignaler = Y;

exports.IViewFactory = Ct;

exports.IWindow = Ne;

exports.If = If;

exports.InterpolationBinding = InterpolationBinding;

exports.InterpolationBindingRenderer = Vt;

exports.InterpolationPartBinding = InterpolationPartBinding;

exports.IteratorBindingRenderer = Ht;

exports.LetBinding = LetBinding;

exports.LetElementRenderer = It;

exports.LifecycleHooks = ct;

exports.LifecycleHooksDefinition = LifecycleHooksDefinition;

exports.LifecycleHooksEntry = LifecycleHooksEntry;

exports.ListenerBinding = ListenerBinding;

exports.ListenerBindingOptions = ListenerBindingOptions;

exports.ListenerBindingRenderer = Nt;

exports.MountTarget = xe;

exports.NodeObserverLocator = NodeObserverLocator;

exports.NoopSVGAnalyzer = NoopSVGAnalyzer;

exports.OneTimeBindingBehavior = OneTimeBindingBehavior;

exports.PendingTemplateController = PendingTemplateController;

exports.Portal = Portal;

exports.PromiseTemplateController = PromiseTemplateController;

exports.PropertyBinding = PropertyBinding;

exports.PropertyBindingRenderer = Ft;

exports.RefBinding = RefBinding;

exports.RefBindingRenderer = _t;

exports.RejectedTemplateController = RejectedTemplateController;

exports.Rendering = Rendering;

exports.Repeat = Repeat;

exports.RuntimeTemplateCompilerImplementation = ss;

exports.SVGAnalyzer = SVGAnalyzer;

exports.SanitizeValueConverter = SanitizeValueConverter;

exports.SelectValueObserver = SelectValueObserver;

exports.SelfBindingBehavior = SelfBindingBehavior;

exports.SetAttributeRenderer = Wt;

exports.SetClassAttributeRenderer = jt;

exports.SetPropertyRenderer = Mt;

exports.SetStyleAttributeRenderer = zt;

exports.ShadowDOMRegistry = ShadowDOMRegistry;

exports.ShortHandBindingSyntax = Ls;

exports.SignalBindingBehavior = SignalBindingBehavior;

exports.SpreadRenderer = Xt;

exports.StandardConfiguration = Ps;

exports.State = Me;

exports.StyleAttributeAccessor = StyleAttributeAccessor;

exports.StyleConfiguration = le;

exports.StyleElementStyles = StyleElementStyles;

exports.StylePropertyBindingRenderer = Ut;

exports.Switch = Switch;

exports.TemplateControllerRenderer = Pt;

exports.TextBindingRenderer = Ot;

exports.ThrottleBindingBehavior = ThrottleBindingBehavior;

exports.ToViewBindingBehavior = ToViewBindingBehavior;

exports.TwoWayBindingBehavior = TwoWayBindingBehavior;

exports.UpdateTriggerBindingBehavior = UpdateTriggerBindingBehavior;

exports.ValueAttributeObserver = ValueAttributeObserver;

exports.ValueConverter = dt;

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

exports.mixinAstEvaluator = mt;

exports.mixinUseScope = pt;

exports.mixingBindingLimited = xt;

exports.processContent = processContent;

exports.refs = it;

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
