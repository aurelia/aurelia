"use strict";

var t = require("@aurelia/metadata");

const e = Object.freeze;

const r = Object.assign;

const n = String;

const s = t.Metadata.get;

t.Metadata.has;

const o = t.Metadata.define;

const isPromise = t => t instanceof Promise;

const isArray = t => t instanceof Array;

const isSet = t => t instanceof Set;

const isMap = t => t instanceof Map;

const isObject = t => t instanceof Object;

function isObjectOrFunction(t) {
    return typeof t === "object" && t !== null || typeof t === "function";
}

const isFunction = t => typeof t === "function";

const isString = t => typeof t === "string";

const isSymbol = t => typeof t === "symbol";

const isNumber = t => typeof t === "number";

const createLookup = () => Object.create(null);

const i = Object.is;

const createMappedError = (t, ...e) => {
    const r = n(t).padStart(4, "0");
    return new Error(`AUR${r}:${e.map(n)}`);
};

const l = (() => {
    const t = {};
    let e = false;
    let r = 0;
    let n = 0;
    let s = 0;
    return o => {
        switch (typeof o) {
          case "number":
            return o >= 0 && (o | 0) === o;

          case "string":
            e = t[o];
            if (e !== void 0) {
                return e;
            }
            r = o.length;
            if (r === 0) {
                return t[o] = false;
            }
            n = 0;
            s = 0;
            for (;s < r; ++s) {
                n = o.charCodeAt(s);
                if (s === 0 && n === 48 && r > 1 || n < 48 || n > 57) {
                    return t[o] = false;
                }
            }
            return t[o] = true;

          default:
            return false;
        }
    };
})();

const c = /*@__PURE__*/ function() {
    const t = r(createLookup(), {
        0: true,
        1: true,
        2: true,
        3: true,
        4: true,
        5: true,
        6: true,
        7: true,
        8: true,
        9: true
    });
    const charToKind = e => {
        if (e === "") {
            return 0;
        }
        if (e !== e.toUpperCase()) {
            return 3;
        }
        if (e !== e.toLowerCase()) {
            return 2;
        }
        if (t[e] === true) {
            return 1;
        }
        return 0;
    };
    return (t, e) => {
        const r = t.length;
        if (r === 0) {
            return t;
        }
        let n = false;
        let s = "";
        let o;
        let i = "";
        let l = 0;
        let c = t.charAt(0);
        let a = charToKind(c);
        let u = 0;
        for (;u < r; ++u) {
            o = l;
            i = c;
            l = a;
            c = t.charAt(u + 1);
            a = charToKind(c);
            if (l === 0) {
                if (s.length > 0) {
                    n = true;
                }
            } else {
                if (!n && s.length > 0 && l === 2) {
                    n = o === 3 || a === 3;
                }
                s += e(i, n);
                n = false;
            }
        }
        return s;
    };
}();

const a = /*@__PURE__*/ function() {
    const t = createLookup();
    const callback = (t, e) => e ? t.toUpperCase() : t.toLowerCase();
    return e => {
        let r = t[e];
        if (r === void 0) {
            r = t[e] = c(e, callback);
        }
        return r;
    };
}();

const u = /*@__PURE__*/ function() {
    const t = createLookup();
    return e => {
        let r = t[e];
        if (r === void 0) {
            r = a(e);
            if (r.length > 0) {
                r = r[0].toUpperCase() + r.slice(1);
            }
            t[e] = r;
        }
        return r;
    };
}();

const f = /*@__PURE__*/ function() {
    const t = createLookup();
    const callback = (t, e) => e ? `-${t.toLowerCase()}` : t.toLowerCase();
    return e => {
        let r = t[e];
        if (r === void 0) {
            r = t[e] = c(e, callback);
        }
        return r;
    };
}();

const toArray = t => {
    const e = t.length;
    const r = Array(e);
    let n = 0;
    for (;n < e; ++n) {
        r[n] = t[n];
    }
    return r;
};

const bound = (t, e) => {
    const r = e.name;
    e.addInitializer((function() {
        Reflect.defineProperty(this, r, {
            value: t.bind(this),
            writable: true,
            configurable: true,
            enumerable: false
        });
    }));
};

const mergeArrays = (...t) => {
    const e = [];
    let r = 0;
    const n = t.length;
    let s = 0;
    let o;
    let i = 0;
    for (;i < n; ++i) {
        o = t[i];
        if (o !== void 0) {
            s = o.length;
            let t = 0;
            for (;t < s; ++t) {
                e[r++] = o[t];
            }
        }
    }
    return e;
};

const firstDefined = (...t) => {
    const e = t.length;
    let r;
    let n = 0;
    for (;e > n; ++n) {
        r = t[n];
        if (r !== void 0) {
            return r;
        }
    }
    throw createMappedError(20);
};

const h = /*@__PURE__*/ function() {
    const t = Function.prototype;
    const e = Object.getPrototypeOf;
    const r = new WeakMap;
    let n = t;
    let s = 0;
    let o = void 0;
    return function(i) {
        o = r.get(i);
        if (o === void 0) {
            r.set(i, o = [ n = i ]);
            s = 0;
            while ((n = e(n)) !== t) {
                o[++s] = n;
            }
        }
        return o;
    };
}();

function toLookup(...t) {
    return r(createLookup(), ...t);
}

const p = /*@__PURE__*/ (() => {
    const t = new WeakMap;
    let e = false;
    let r = "";
    let n = 0;
    return s => {
        e = t.get(s);
        if (e == null) {
            n = (r = s.toString()).length;
            e = n > 28 && r.indexOf("[native code] }") === n - 15;
            t.set(s, e);
        }
        return e;
    };
})();

const onResolve = (t, e) => {
    if (isPromise(t)) {
        return t.then(e);
    }
    return e(t);
};

const onResolveAll = (...t) => {
    let e = void 0;
    let r = void 0;
    let n = void 0;
    let s = 0;
    let o = t.length;
    for (;s < o; ++s) {
        e = t[s];
        if (isPromise(e = t[s])) {
            if (r === void 0) {
                r = e;
            } else if (n === void 0) {
                n = [ r, e ];
            } else {
                n.push(e);
            }
        }
    }
    if (n === void 0) {
        return r;
    }
    return Promise.all(n);
};

const instanceRegistration = (t, e) => new Resolver(t, 0, e);

const singletonRegistration = (t, e) => new Resolver(t, 1, e);

const transientRegistation = (t, e) => new Resolver(t, 2, e);

const callbackRegistration = (t, e) => new Resolver(t, 3, e);

const cachedCallbackRegistration = (t, e) => new Resolver(t, 3, cacheCallbackResult(e));

const aliasToRegistration = (t, e) => new Resolver(e, 5, t);

const deferRegistration = (t, ...e) => new ParameterizedRegistry(t, e);

const d = new WeakMap;

const cacheCallbackResult = t => (e, r, n) => {
    let s = d.get(e);
    if (s === void 0) {
        d.set(e, s = new WeakMap);
    }
    if (s.has(n)) {
        return s.get(n);
    }
    const o = t(e, r, n);
    s.set(n, o);
    return o;
};

const v = {
    instance: instanceRegistration,
    singleton: singletonRegistration,
    transient: transientRegistation,
    callback: callbackRegistration,
    cachedCallback: cachedCallbackRegistration,
    aliasTo: aliasToRegistration,
    defer: deferRegistration
};

const createImplementationRegister = function(t) {
    return function register(e) {
        e.register(singletonRegistration(this, this), aliasToRegistration(this, t));
    };
};

const g = "au:annotation";

const getAnnotationKeyFor = (t, e) => {
    if (e === void 0) {
        return `${g}:${t}`;
    }
    return `${g}:${t}:${e}`;
};

const appendAnnotation = (t, e) => {
    const r = s(g, t);
    if (r === void 0) {
        o([ e ], t, g);
    } else {
        r.push(e);
    }
};

const y = /*@__PURE__*/ e({
    name: "au:annotation",
    appendTo: appendAnnotation,
    set(t, e, r) {
        o(r, t, getAnnotationKeyFor(e));
    },
    get: (t, e) => s(getAnnotationKeyFor(e), t),
    getKeys(t) {
        let e = s(g, t);
        if (e === void 0) {
            o(e = [], t, g);
        }
        return e;
    },
    isKey: t => t.startsWith(g),
    keyFor: getAnnotationKeyFor
});

const w = "au:resource";

const getResourceKeyFor = (t, e, r) => {
    if (e == null) {
        return `${w}:${t}`;
    }
    if (r == null) {
        return `${w}:${t}:${e}`;
    }
    return `${w}:${t}:${e}:${r}`;
};

const m = {
    annotation: y
};

const x = Object.prototype.hasOwnProperty;

function fromAnnotationOrDefinitionOrTypeOrDefault(t, e, r, n) {
    let o = s(getAnnotationKeyFor(t), r);
    if (o === void 0) {
        o = e[t];
        if (o === void 0) {
            o = r[t];
            if (o === void 0 || !x.call(r, t)) {
                return n();
            }
            return o;
        }
        return o;
    }
    return o;
}

function fromAnnotationOrTypeOrDefault(t, e, r) {
    let n = s(getAnnotationKeyFor(t), e);
    if (n === void 0) {
        n = e[t];
        if (n === void 0 || !x.call(e, t)) {
            return r();
        }
        return n;
    }
    return n;
}

function fromDefinitionOrDefault(t, e, r) {
    const n = e[t];
    if (n === void 0) {
        return r();
    }
    return n;
}

const R = Symbol.for("au:registrable");

const b = {
    none(t) {
        throw createMappedError(2, t);
    },
    singleton: t => new Resolver(t, 1, t),
    transient: t => new Resolver(t, 2, t)
};

class ContainerConfiguration {
    constructor(t, e) {
        this.inheritParentResources = t;
        this.defaultResolver = e;
    }
    static from(t) {
        if (t === void 0 || t === ContainerConfiguration.DEFAULT) {
            return ContainerConfiguration.DEFAULT;
        }
        return new ContainerConfiguration(t.inheritParentResources ?? false, t.defaultResolver ?? b.singleton);
    }
}

ContainerConfiguration.DEFAULT = ContainerConfiguration.from({});

const createContainer = t => new Container(null, ContainerConfiguration.from(t));

const $ = new Set("Array ArrayBuffer Boolean DataView Date Error EvalError Float32Array Float64Array Function Int8Array Int16Array Int32Array Map Number Object Promise RangeError ReferenceError RegExp Set SharedArrayBuffer String SyntaxError TypeError Uint8Array Uint8ClampedArray Uint16Array Uint32Array URIError WeakMap WeakSet".split(" "));

let C = 0;

let O = null;

class Container {
    get depth() {
        return this.t === null ? 0 : this.t.depth + 1;
    }
    get parent() {
        return this.t;
    }
    constructor(t, e) {
        this.id = ++C;
        this.i = 0;
        this.u = new Map;
        this.t = t;
        this.config = e;
        this.h = new Map;
        this.res = {};
        if (t === null) {
            this.root = this;
            this.R = new Map;
        } else {
            this.root = t.root;
            this.R = t.R;
            if (e.inheritParentResources) {
                for (const e in t.res) {
                    this.registerResolver(e, t.res[e]);
                }
            }
        }
        this.h.set(j, D);
    }
    register(...t) {
        if (++this.i === 100) {
            throw createMappedError(6, ...t);
        }
        let e;
        let r;
        let n;
        let o;
        let i;
        let l = 0;
        let c = t.length;
        let a;
        for (;l < c; ++l) {
            e = t[l];
            if (!isObjectOrFunction(e)) {
                continue;
            }
            if (isRegistry(e)) {
                e.register(this);
            } else if ((a = s(w, e)) != null) {
                a.register(this);
            } else if (isClass(e)) {
                const t = e[Symbol.metadata]?.[R];
                if (isRegistry(t)) {
                    t.register(this);
                } else if (isString(e.$au?.type)) {
                    const t = e.$au;
                    const r = (e.aliases ?? L).concat(t.aliases ?? L);
                    let n = `${w}:${t.type}:${t.name}`;
                    if (this.has(n, false)) {
                        continue;
                    }
                    aliasToRegistration(e, n).register(this);
                    if (!this.has(e, false)) {
                        singletonRegistration(e, e).register(this);
                    }
                    o = 0;
                    i = r.length;
                    for (;o < i; ++o) {
                        n = `${w}:${t.type}:${r[o]}`;
                        if (this.has(n, false)) {
                            continue;
                        }
                        aliasToRegistration(e, n).register(this);
                    }
                } else {
                    singletonRegistration(e, e).register(this);
                }
            } else {
                r = Object.keys(e);
                o = 0;
                i = r.length;
                for (;o < i; ++o) {
                    n = e[r[o]];
                    if (!isObjectOrFunction(n)) {
                        continue;
                    }
                    if (isRegistry(n)) {
                        n.register(this);
                    } else {
                        this.register(n);
                    }
                }
            }
        }
        --this.i;
        return this;
    }
    registerResolver(t, e, r = false) {
        validateKey(t);
        const n = this.h;
        const s = n.get(t);
        if (s == null) {
            n.set(t, e);
            if (isResourceKey(t)) {
                if (this.res[t] !== void 0) {
                    throw createMappedError(7, t);
                }
                this.res[t] = e;
            }
        } else if (s instanceof Resolver && s.$ === 4) {
            s._state.push(e);
        } else {
            n.set(t, new Resolver(t, 4, [ s, e ]));
        }
        if (r) {
            this.u.set(t, e);
        }
        return e;
    }
    deregister(t) {
        validateKey(t);
        const e = this.h.get(t);
        if (e != null) {
            this.h.delete(t);
            if (isResourceKey(t)) {
                delete this.res[t];
            }
            if (this.u.has(t)) {
                e.dispose();
                this.u.delete(t);
            }
        }
    }
    registerTransformer(t, e) {
        const r = this.getResolver(t);
        if (r == null) {
            return false;
        }
        if (r.getFactory) {
            const t = r.getFactory(this);
            if (t == null) {
                return false;
            }
            t.registerTransformer(e);
            return true;
        }
        return false;
    }
    getResolver(t, e = true) {
        validateKey(t);
        if (t.resolve !== void 0) {
            return t;
        }
        const r = O;
        let n = O = this;
        let s;
        let o;
        try {
            while (n != null) {
                s = n.h.get(t);
                if (s == null) {
                    if (n.t == null) {
                        o = isRegisterInRequester(t) ? this : n;
                        if (e) {
                            return this.C(t, o);
                        }
                        return null;
                    }
                    n = n.t;
                } else {
                    return s;
                }
            }
        } finally {
            O = r;
        }
        return null;
    }
    has(t, e = false) {
        return this.h.has(t) || isResourceKey(t) && t in this.res || ((e && this.t?.has(t, true)) ?? false);
    }
    get(t) {
        validateKey(t);
        if (t.$isResolver) {
            return t.resolve(this, this);
        }
        const e = O;
        let r = O = this;
        let n;
        let s;
        try {
            while (r != null) {
                n = r.h.get(t);
                if (n == null) {
                    if (r.t == null) {
                        s = isRegisterInRequester(t) ? this : r;
                        n = this.C(t, s);
                        return n.resolve(r, this);
                    }
                    r = r.t;
                } else {
                    return n.resolve(r, this);
                }
            }
        } finally {
            O = e;
        }
        throw createMappedError(8, t);
    }
    getAll(t, e = false) {
        validateKey(t);
        const r = O;
        const n = O = this;
        let s = n;
        let o;
        let i = L;
        try {
            if (e) {
                while (s != null) {
                    o = s.h.get(t);
                    if (o != null) {
                        i = i.concat(buildAllResponse(o, s, n));
                    }
                    s = s.t;
                }
                return i;
            }
            while (s != null) {
                o = s.h.get(t);
                if (o == null) {
                    s = s.t;
                    if (s == null) {
                        return L;
                    }
                } else {
                    return buildAllResponse(o, s, n);
                }
            }
        } finally {
            O = r;
        }
        return L;
    }
    invoke(t, e) {
        if (p(t)) {
            throw createMappedError(15, t);
        }
        const r = O;
        O = this;
        try {
            return e === void 0 ? new t(...getDependencies(t).map(containerGetKey, this)) : new t(...getDependencies(t).map(containerGetKey, this), ...e);
        } finally {
            O = r;
        }
    }
    hasFactory(t) {
        return this.R.has(t);
    }
    getFactory(t) {
        let e = this.R.get(t);
        if (e === void 0) {
            if (p(t)) {
                throw createMappedError(15, t);
            }
            this.R.set(t, e = new Factory(t, getDependencies(t)));
        }
        return e;
    }
    registerFactory(t, e) {
        this.R.set(t, e);
    }
    createChild(t) {
        if (t === void 0 && this.config.inheritParentResources) {
            if (this.config === ContainerConfiguration.DEFAULT) {
                return new Container(this, this.config);
            }
            return new Container(this, ContainerConfiguration.from({
                ...this.config,
                inheritParentResources: false
            }));
        }
        return new Container(this, ContainerConfiguration.from(t ?? this.config));
    }
    disposeResolvers() {
        const t = this.h;
        const e = this.u;
        let r;
        let n;
        for ([n, r] of e.entries()) {
            r.dispose?.();
            t.delete(n);
        }
        e.clear();
    }
    useResources(t) {
        const e = t.res;
        for (const t in e) {
            this.registerResolver(t, e[t]);
        }
    }
    find(t, e) {
        const r = isString(e) ? `${w}:${t}:${e}` : t;
        let n = this;
        let s = n.res[r];
        if (s == null) {
            n = n.root;
            s = n.res[r];
        }
        if (s == null) {
            return null;
        }
        return s.getFactory?.(n)?.Type ?? null;
    }
    dispose() {
        if (this.u.size > 0) {
            this.disposeResolvers();
        }
        this.h.clear();
        if (this.root === this) {
            this.R.clear();
            this.res = {};
        }
    }
    C(t, e) {
        const r = isRegistry(t);
        if (!isFunction(t) && !r) {
            throw createMappedError(9, t);
        }
        if ($.has(t.name)) {
            throw createMappedError(10, t);
        }
        if (r) {
            const r = t.register(e, t);
            if (!(r instanceof Object) || r.resolve == null) {
                const r = e.h.get(t);
                if (r != null) {
                    return r;
                }
                throw createMappedError(11, t);
            }
            return r;
        }
        if (t.$isInterface) {
            throw createMappedError(12, t.friendlyName);
        }
        const n = this.config.defaultResolver(t, e);
        e.h.set(t, n);
        return n;
    }
}

class Factory {
    constructor(t, e) {
        this.Type = t;
        this.dependencies = e;
        this.transformers = null;
    }
    construct(t, e) {
        const r = O;
        O = t;
        let n;
        try {
            if (e === void 0) {
                n = new this.Type(...this.dependencies.map(containerGetKey, t));
            } else {
                n = new this.Type(...this.dependencies.map(containerGetKey, t), ...e);
            }
            if (this.transformers == null) {
                return n;
            }
            return this.transformers.reduce(transformInstance, n);
        } finally {
            O = r;
        }
    }
    registerTransformer(t) {
        (this.transformers ??= []).push(t);
    }
}

function transformInstance(t, e) {
    return e(t);
}

function validateKey(t) {
    if (t === null || t === void 0) {
        throw createMappedError(14);
    }
}

function containerGetKey(t) {
    return this.get(t);
}

function resolve(...t) {
    if (O == null) {
        throw createMappedError(16, ...t);
    }
    return t.length === 1 ? O.get(t[0]) : t.map(containerGetKey, O);
}

const buildAllResponse = (t, e, r) => {
    if (t instanceof Resolver && t.$ === 4) {
        const n = t._state;
        const s = n.length;
        const o = Array(s);
        let i = 0;
        for (;i < s; ++i) {
            o[i] = n[i].resolve(e, r);
        }
        return o;
    }
    return [ t.resolve(e, r) ];
};

const D = {
    $isResolver: true,
    resolve(t, e) {
        return e;
    }
};

const isRegistry = t => isFunction(t?.register);

const isSelfRegistry = t => isRegistry(t) && typeof t.registerInRequestor === "boolean";

const isRegisterInRequester = t => isSelfRegistry(t) && t.registerInRequestor;

const isClass = t => t.prototype !== void 0;

const isResourceKey = t => isString(t) && t.indexOf(":") > 0;

class ResolverBuilder {
    constructor(t, e) {
        this.c = t;
        this.k = e;
    }
    instance(t) {
        return this.O(0, t);
    }
    singleton(t) {
        return this.O(1, t);
    }
    transient(t) {
        return this.O(2, t);
    }
    callback(t) {
        return this.O(3, t);
    }
    cachedCallback(t) {
        return this.O(3, cacheCallbackResult(t));
    }
    aliasTo(t) {
        return this.O(5, t);
    }
    O(t, e) {
        const {c: r, k: n} = this;
        this.c = this.k = void 0;
        return r.registerResolver(n, new Resolver(n, t, e));
    }
}

const cloneArrayWithPossibleProps = t => {
    const e = t.slice();
    const r = Object.keys(t);
    const n = r.length;
    let s;
    for (let o = 0; o < n; ++o) {
        s = r[o];
        if (!l(s)) {
            e[s] = t[s];
        }
    }
    return e;
};

const k = getAnnotationKeyFor("di:paramtypes");

const getAnnotationParamtypes = t => s(k, t);

const getDesignParamtypes = t => s("design:paramtypes", t);

const getOrCreateAnnotationParamTypes = t => t.metadata[k] ??= [];

const getDependencies = t => {
    const e = getAnnotationKeyFor("di:dependencies");
    let r = s(e, t);
    if (r === void 0) {
        const n = t.inject;
        if (n === void 0) {
            const e = getDesignParamtypes(t);
            const n = getAnnotationParamtypes(t);
            if (e === void 0) {
                if (n === void 0) {
                    const e = Object.getPrototypeOf(t);
                    if (isFunction(e) && e !== Function.prototype) {
                        r = cloneArrayWithPossibleProps(getDependencies(e));
                    } else {
                        r = [];
                    }
                } else {
                    r = cloneArrayWithPossibleProps(n);
                }
            } else if (n === void 0) {
                r = cloneArrayWithPossibleProps(e);
            } else {
                r = cloneArrayWithPossibleProps(e);
                let t = n.length;
                let s;
                let o = 0;
                for (;o < t; ++o) {
                    s = n[o];
                    if (s !== void 0) {
                        r[o] = s;
                    }
                }
                const i = Object.keys(n);
                let c;
                o = 0;
                t = i.length;
                for (o = 0; o < t; ++o) {
                    c = i[o];
                    if (!l(c)) {
                        r[c] = n[c];
                    }
                }
            }
        } else {
            r = cloneArrayWithPossibleProps(n);
        }
        o(r, t, e);
    }
    return r;
};

const createInterface = (t, e) => {
    const r = isFunction(t) ? t : e;
    const n = (isString(t) ? t : undefined) ?? "(anonymous)";
    const s = {
        $isInterface: true,
        friendlyName: n,
        toString: () => `InterfaceSymbol<${n}>`,
        register: r != null ? (t, e) => r(new ResolverBuilder(t, e ?? s)) : void 0
    };
    return s;
};

const inject = (...t) => (e, r) => {
    switch (r.kind) {
      case "class":
        {
            const e = getOrCreateAnnotationParamTypes(r);
            let n;
            let s = 0;
            for (;s < t.length; ++s) {
                n = t[s];
                if (n !== void 0) {
                    e[s] = n;
                }
            }
            break;
        }

      case "field":
        {
            const e = getOrCreateAnnotationParamTypes(r);
            const n = t[0];
            if (n !== void 0) {
                e[r.name] = n;
            }
            break;
        }

      default:
        throw createMappedError(22, String(r.name), r.kind);
    }
};

const E = /*@__PURE__*/ (() => {
    t.initializeTC39Metadata();
    return {
        createContainer: createContainer,
        getDesignParamtypes: getDesignParamtypes,
        getDependencies: getDependencies,
        createInterface: createInterface,
        inject: inject,
        transient(t) {
            t.register = function(e) {
                const r = transientRegistation(t, t);
                return r.register(e, t);
            };
            t.registerInRequestor = false;
            return t;
        },
        singleton(t, e = I) {
            t.register = function(e) {
                const r = singletonRegistration(t, t);
                return r.register(e, t);
            };
            t.registerInRequestor = e.scoped;
            return t;
        }
    };
})();

const j = /*@__PURE__*/ createInterface("IContainer");

const F = j;

function transientDecorator(t, e) {
    return E.transient(t);
}

function transient(t, e) {
    return t == null ? transientDecorator : transientDecorator(t);
}

const I = {
    scoped: false
};

const A = E.singleton;

function singleton(t, e) {
    return isFunction(t) ? A(t) : function(e, r) {
        return A(e, t);
    };
}

class Resolver {
    get $isResolver() {
        return true;
    }
    constructor(t, e, r) {
        this.j = false;
        this.F = null;
        this.k = t;
        this.$ = e;
        this._state = r;
    }
    register(t, e) {
        return t.registerResolver(e || this.k, this);
    }
    resolve(t, e) {
        switch (this.$) {
          case 0:
            return this._state;

          case 1:
            {
                if (this.j) {
                    throw createMappedError(3, this._state.name);
                }
                this.j = true;
                this._state = (this.F = t.getFactory(this._state)).construct(e);
                this.$ = 0;
                this.j = false;
                return this._state;
            }

          case 2:
            {
                const r = t.getFactory(this._state);
                if (r === null) {
                    throw createMappedError(4, this.k);
                }
                return r.construct(e);
            }

          case 3:
            return this._state(t, e, this);

          case 4:
            return this._state[0].resolve(t, e);

          case 5:
            return e.get(this._state);

          default:
            throw createMappedError(5, this.$);
        }
    }
    getFactory(t) {
        switch (this.$) {
          case 1:
          case 2:
            return t.getFactory(this._state);

          case 5:
            return t.getResolver(this._state)?.getFactory?.(t) ?? null;

          case 0:
            return this.F;

          default:
            return null;
        }
    }
}

class InstanceProvider {
    get friendlyName() {
        return this.I;
    }
    constructor(t, e = null, r = null) {
        this.I = t;
        this.A = e;
        this.L = r;
    }
    prepare(t) {
        this.A = t;
    }
    get $isResolver() {
        return true;
    }
    resolve() {
        if (this.A == null) {
            throw createMappedError(13, this.I);
        }
        return this.A;
    }
    getFactory(t) {
        return this.L == null ? null : t.getFactory(this.L);
    }
    dispose() {
        this.A = null;
    }
}

class ParameterizedRegistry {
    constructor(t, e) {
        this.key = t;
        this.params = e;
    }
    register(t) {
        if (t.has(this.key, true)) {
            const e = t.get(this.key);
            e.register(t, ...this.params);
        } else {
            t.register(...this.params.filter((t => typeof t === "object")));
        }
    }
}

const L = e([]);

const S = e({});

function noop() {}

const _ = /*@__PURE__*/ createInterface("IPlatform");

function createResolver(t) {
    return function(e) {
        function Resolver(t, e) {
            inject(Resolver)(t, e);
        }
        Resolver.$isResolver = true;
        Resolver.resolve = function(r, n) {
            return t(e, r, n);
        };
        return Resolver;
    };
}

const all = (t, e = false) => {
    function resolver(t, e) {
        inject(resolver)(t, e);
    }
    resolver.$isResolver = true;
    resolver.resolve = (r, n) => n.getAll(t, e);
    return resolver;
};

const last = t => ({
    $isResolver: true,
    resolve: e => {
        const r = e.getAll(t);
        return r.length > 0 ? r[r.length - 1] : undefined;
    }
});

const M = /*@__PURE__*/ createResolver(((t, e, r) => () => r.get(t)));

const T = /*@__PURE__*/ createResolver(((t, e, r) => {
    if (r.has(t, true)) {
        return r.get(t);
    } else {
        return undefined;
    }
}));

const P = /*@__PURE__*/ r(((t, e) => {
    inject(P)(t, e);
}), {
    $isResolver: true,
    resolve: () => void 0
});

const K = /*@__PURE__*/ createResolver(((t, e, r) => (...n) => e.getFactory(t).construct(r, n)));

const N = /*@__PURE__*/ createResolver(((t, e, r) => r.has(t, false) ? r.get(t) : void 0));

const z = /*@__PURE__*/ createResolver(((t, e, r) => r.has(t, false) ? r.get(t) : r.root.get(t)));

const G = /*@__PURE__*/ createResolver(((t, e, r) => r.has(t, false) ? r.get(t) : r.root.has(t, false) ? r.root.get(t) : void 0));

const W = /*@__PURE__*/ createResolver(((t, e, r) => r === r.root ? r.getAll(t, false) : r.has(t, false) ? r.getAll(t, false).concat(r.root.getAll(t, false)) : r.root.getAll(t, false)));

const B = /*@__PURE__*/ createResolver(((t, e, r) => {
    const s = createNewInstance(t, e, r);
    const o = new InstanceProvider(n(t), s);
    r.registerResolver(t, o, true);
    return s;
}));

const Q = /*@__PURE__*/ createResolver(((t, e, r) => createNewInstance(t, e, r)));

const createNewInstance = (t, e, r) => {
    if (e.hasFactory(t)) {
        return e.getFactory(t).construct(r);
    }
    if (isInterface(t)) {
        const n = isFunction(t.register);
        const s = e.getResolver(t, false);
        let o;
        if (s == null) {
            if (n) {
                o = (U ??= createContainer()).getResolver(t, true)?.getFactory?.(e);
            }
            U.dispose();
        } else {
            o = s.getFactory?.(e);
        }
        if (o != null) {
            return o.construct(r);
        }
        throw createMappedError(17, t);
    }
    return e.getFactory(t).construct(r);
};

const isInterface = t => t?.$isInterface === true;

let U;

function __esDecorate(t, e, r, n, s, o) {
    function accept(t) {
        if (t !== void 0 && typeof t !== "function") throw new TypeError("Function expected");
        return t;
    }
    var i = n.kind, l = i === "getter" ? "get" : i === "setter" ? "set" : "value";
    var c = t ? n["static"] ? t : t.prototype : null;
    var a = c ? Object.getOwnPropertyDescriptor(c, n.name) : {};
    var u, f = false;
    for (var h = r.length - 1; h >= 0; h--) {
        var p = {};
        for (var d in n) p[d] = d === "access" ? {} : n[d];
        for (var d in n.access) p.access[d] = n.access[d];
        p.addInitializer = function(t) {
            if (f) throw new TypeError("Cannot add initializers after decoration has completed");
            o.push(accept(t || null));
        };
        var v = (0, r[h])(i === "accessor" ? {
            get: a.get,
            set: a.set
        } : a[l], p);
        if (i === "accessor") {
            if (v === void 0) continue;
            if (v === null || typeof v !== "object") throw new TypeError("Object expected");
            if (u = accept(v.get)) a.get = u;
            if (u = accept(v.set)) a.set = u;
            if (u = accept(v.init)) s.unshift(u);
        } else if (u = accept(v)) {
            if (i === "field") s.unshift(u); else a[l] = u;
        }
    }
    if (c) Object.defineProperty(c, n.name, a);
    f = true;
}

function __runInitializers(t, e, r) {
    var n = arguments.length > 2;
    for (var s = 0; s < e.length; s++) {
        r = n ? e[s].call(t, r) : e[s].call(t);
    }
    return n ? r : void 0;
}

typeof SuppressedError === "function" ? SuppressedError : function(t, e, r) {
    var n = new Error(r);
    return n.name = "SuppressedError", n.error = t, n.suppressed = e, n;
};

const H = 0;

const q = 1;

const V = 2;

const J = 3;

const X = 4;

const Y = 5;

const Z = 6;

const tt = e({
    trace: H,
    debug: q,
    info: V,
    warn: J,
    error: X,
    fatal: Y,
    none: Z
});

const et = /*@__PURE__*/ createInterface("ILogConfig", (t => t.instance(new LogConfig("no-colors", J))));

const rt = /*@__PURE__*/ createInterface("ISink");

const nt = /*@__PURE__*/ createInterface("ILogEventFactory", (t => t.singleton(DefaultLogEventFactory)));

const st = /*@__PURE__*/ createInterface("ILogger", (t => t.singleton(at)));

const ot = /*@__PURE__*/ createInterface("ILogScope");

const it = /*@__PURE__*/ e({
    key: getAnnotationKeyFor("logger-sink-handles"),
    define(t, e) {
        o(e.handles, t, this.key);
    },
    getHandles(t) {
        return s(this.key, t.constructor);
    }
});

const sink = t => (e, r) => r.addInitializer((function() {
    it.define(this, t);
}));

const lt = toLookup({
    red(t) {
        return `[31m${t}[39m`;
    },
    green(t) {
        return `[32m${t}[39m`;
    },
    yellow(t) {
        return `[33m${t}[39m`;
    },
    blue(t) {
        return `[34m${t}[39m`;
    },
    magenta(t) {
        return `[35m${t}[39m`;
    },
    cyan(t) {
        return `[36m${t}[39m`;
    },
    white(t) {
        return `[37m${t}[39m`;
    },
    grey(t) {
        return `[90m${t}[39m`;
    }
});

class LogConfig {
    constructor(t, e) {
        this.colorOptions = t;
        this.level = e;
    }
}

const ct = function() {
    const t = {
        "no-colors": toLookup({
            TRC: "TRC",
            DBG: "DBG",
            INF: "INF",
            WRN: "WRN",
            ERR: "ERR",
            FTL: "FTL",
            QQQ: "???"
        }),
        colors: toLookup({
            TRC: lt.grey("TRC"),
            DBG: lt.grey("DBG"),
            INF: lt.white("INF"),
            WRN: lt.yellow("WRN"),
            ERR: lt.red("ERR"),
            FTL: lt.red("FTL"),
            QQQ: lt.grey("???")
        })
    };
    return (e, r) => {
        if (e <= H) {
            return t[r].TRC;
        }
        if (e <= q) {
            return t[r].DBG;
        }
        if (e <= V) {
            return t[r].INF;
        }
        if (e <= J) {
            return t[r].WRN;
        }
        if (e <= X) {
            return t[r].ERR;
        }
        if (e <= Y) {
            return t[r].FTL;
        }
        return t[r].QQQ;
    };
}();

const getScopeString = (t, e) => {
    if (e === "no-colors") {
        return t.join(".");
    }
    return t.map(lt.cyan).join(".");
};

const getIsoString = (t, e) => {
    if (e === "no-colors") {
        return new Date(t).toISOString();
    }
    return lt.grey(new Date(t).toISOString());
};

class DefaultLogEvent {
    constructor(t, e, r, n, s, o) {
        this.severity = t;
        this.message = e;
        this.optionalParams = r;
        this.scope = n;
        this.colorOptions = s;
        this.timestamp = o;
    }
    toString() {
        const {severity: t, message: e, scope: r, colorOptions: n, timestamp: s} = this;
        if (r.length === 0) {
            return `${getIsoString(s, n)} [${ct(t, n)}] ${e}`;
        }
        return `${getIsoString(s, n)} [${ct(t, n)} ${getScopeString(r, n)}] ${e}`;
    }
    getFormattedLogInfo(t = false) {
        const {severity: e, message: r, scope: n, colorOptions: s, timestamp: o, optionalParams: i} = this;
        let l = null;
        let c = "";
        if (t && r instanceof Error) {
            l = r;
        } else {
            c = r;
        }
        const a = n.length === 0 ? "" : ` ${getScopeString(n, s)}`;
        let u = `${getIsoString(o, s)} [${ct(e, s)}${a}] ${c}`;
        if (i === void 0 || i.length === 0) {
            return l === null ? [ u ] : [ u, l ];
        }
        let f = 0;
        while (u.includes("%s")) {
            u = u.replace("%s", String(i[f++]));
        }
        return l !== null ? [ u, l, ...i.slice(f) ] : [ u, ...i.slice(f) ];
    }
}

class DefaultLogEventFactory {
    constructor() {
        this.config = resolve(et);
    }
    createLogEvent(t, e, r, n) {
        return new DefaultLogEvent(e, r, n, t.scope, this.config.colorOptions, Date.now());
    }
}

class ConsoleSink {
    static register(t) {
        singletonRegistration(rt, ConsoleSink).register(t);
    }
    constructor(t = resolve(_)) {
        const e = t.console;
        this.handleEvent = function emit(t) {
            const r = t.getFormattedLogInfo(true);
            switch (t.severity) {
              case H:
              case q:
                return e.debug(...r);

              case V:
                return e.info(...r);

              case J:
                return e.warn(...r);

              case X:
              case Y:
                return e.error(...r);
            }
        };
    }
}

let at = (() => {
    var t;
    let e = [];
    let r;
    let n;
    let s;
    let o;
    let i;
    let l;
    return t = class DefaultLogger {
        constructor(t = resolve(et), r = resolve(nt), n = resolve(all(rt)), s = resolve(T(ot)) ?? [], o = null) {
            this.scope = (__runInitializers(this, e), s);
            this._ = createLookup();
            let i;
            let l;
            let c;
            let a;
            let u;
            let f;
            this.config = t;
            this.f = r;
            this.sinks = n;
            if (o === null) {
                this.root = this;
                this.parent = this;
                i = this.M = [];
                l = this.T = [];
                c = this.P = [];
                a = this.K = [];
                u = this.N = [];
                f = this.G = [];
                for (const t of n) {
                    const e = it.getHandles(t);
                    if (e?.includes(H) ?? true) {
                        i.push(t);
                    }
                    if (e?.includes(q) ?? true) {
                        l.push(t);
                    }
                    if (e?.includes(V) ?? true) {
                        c.push(t);
                    }
                    if (e?.includes(J) ?? true) {
                        a.push(t);
                    }
                    if (e?.includes(X) ?? true) {
                        u.push(t);
                    }
                    if (e?.includes(Y) ?? true) {
                        f.push(t);
                    }
                }
            } else {
                this.root = o.root;
                this.parent = o;
                i = this.M = o.M;
                l = this.T = o.T;
                c = this.P = o.P;
                a = this.K = o.K;
                u = this.N = o.N;
                f = this.G = o.G;
            }
        }
        trace(t, ...e) {
            if (this.config.level <= H) {
                this.W(this.M, H, t, e);
            }
        }
        debug(t, ...e) {
            if (this.config.level <= q) {
                this.W(this.T, q, t, e);
            }
        }
        info(t, ...e) {
            if (this.config.level <= V) {
                this.W(this.P, V, t, e);
            }
        }
        warn(t, ...e) {
            if (this.config.level <= J) {
                this.W(this.K, J, t, e);
            }
        }
        error(t, ...e) {
            if (this.config.level <= X) {
                this.W(this.N, X, t, e);
            }
        }
        fatal(t, ...e) {
            if (this.config.level <= Y) {
                this.W(this.G, Y, t, e);
            }
        }
        scopeTo(e) {
            const r = this._;
            let n = r[e];
            if (n === void 0) {
                n = r[e] = new t(this.config, this.f, null, this.scope.concat(e), this);
            }
            return n;
        }
        W(t, e, r, n) {
            const s = isFunction(r) ? r() : r;
            const o = this.f.createLogEvent(this, e, s, n);
            for (let e = 0, r = t.length; e < r; ++e) {
                t[e].handleEvent(o);
            }
        }
    }, (() => {
        const c = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        r = [ bound ];
        n = [ bound ];
        s = [ bound ];
        o = [ bound ];
        i = [ bound ];
        l = [ bound ];
        __esDecorate(t, null, r, {
            kind: "method",
            name: "trace",
            static: false,
            private: false,
            access: {
                has: t => "trace" in t,
                get: t => t.trace
            },
            metadata: c
        }, null, e);
        __esDecorate(t, null, n, {
            kind: "method",
            name: "debug",
            static: false,
            private: false,
            access: {
                has: t => "debug" in t,
                get: t => t.debug
            },
            metadata: c
        }, null, e);
        __esDecorate(t, null, s, {
            kind: "method",
            name: "info",
            static: false,
            private: false,
            access: {
                has: t => "info" in t,
                get: t => t.info
            },
            metadata: c
        }, null, e);
        __esDecorate(t, null, o, {
            kind: "method",
            name: "warn",
            static: false,
            private: false,
            access: {
                has: t => "warn" in t,
                get: t => t.warn
            },
            metadata: c
        }, null, e);
        __esDecorate(t, null, i, {
            kind: "method",
            name: "error",
            static: false,
            private: false,
            access: {
                has: t => "error" in t,
                get: t => t.error
            },
            metadata: c
        }, null, e);
        __esDecorate(t, null, l, {
            kind: "method",
            name: "fatal",
            static: false,
            private: false,
            access: {
                has: t => "fatal" in t,
                get: t => t.fatal
            },
            metadata: c
        }, null, e);
        if (c) Object.defineProperty(t, Symbol.metadata, {
            enumerable: true,
            configurable: true,
            writable: true,
            value: c
        });
    })(), t;
})();

const ut = /*@__PURE__*/ toLookup({
    create({level: t = J, colorOptions: e = "no-colors", sinks: r = []} = {}) {
        return toLookup({
            register(n) {
                n.register(instanceRegistration(et, new LogConfig(e, t)));
                for (const t of r) {
                    if (isFunction(t)) {
                        n.register(singletonRegistration(rt, t));
                    } else {
                        n.register(t);
                    }
                }
                return n;
            }
        });
    }
});

const ft = /*@__PURE__*/ createInterface((t => t.singleton(ModuleLoader)));

const noTransform = t => t;

class ModuleTransformer {
    constructor(t) {
        this.B = new Map;
        this.U = new Map;
        this.H = t;
    }
    transform(t) {
        if (t instanceof Promise) {
            return this.q(t);
        } else if (typeof t === "object" && t !== null) {
            return this.V(t);
        } else {
            throw createMappedError(21, t);
        }
    }
    q(t) {
        if (this.B.has(t)) {
            return this.B.get(t);
        }
        const e = t.then((t => this.V(t)));
        this.B.set(t, e);
        void e.then((e => {
            this.B.set(t, e);
        }));
        return e;
    }
    V(t) {
        if (this.U.has(t)) {
            return this.U.get(t);
        }
        const e = this.H(this.J(t));
        this.U.set(t, e);
        if (e instanceof Promise) {
            void e.then((e => {
                this.U.set(t, e);
            }));
        }
        return e;
    }
    J(t) {
        if (t == null) throw createMappedError(21, t);
        if (typeof t !== "object") return new AnalyzedModule(t, []);
        let e;
        let r;
        let n;
        let o;
        const i = [];
        for (const l in t) {
            switch (typeof (e = t[l])) {
              case "object":
                if (e === null) {
                    continue;
                }
                r = isFunction(e.register);
                n = false;
                o = null;
                break;

              case "function":
                r = isFunction(e.register);
                n = e.prototype !== void 0;
                o = s(w, e) ?? null;
                break;

              default:
                continue;
            }
            i.push(new ModuleItem(l, e, r, n, o));
        }
        return new AnalyzedModule(t, i);
    }
}

class ModuleLoader {
    constructor() {
        this.transformers = new Map;
    }
    load(t, e = noTransform) {
        const r = this.transformers;
        let n = r.get(e);
        if (n === void 0) {
            r.set(e, n = new ModuleTransformer(e));
        }
        return n.transform(t);
    }
    dispose() {
        this.transformers.clear();
    }
}

class AnalyzedModule {
    constructor(t, e) {
        this.raw = t;
        this.items = e;
    }
}

class ModuleItem {
    constructor(t, e, r, n, s) {
        this.key = t;
        this.value = e;
        this.isRegistry = r;
        this.isConstructable = n;
        this.definition = s;
    }
}

const aliasedResourcesRegistry = (t, e, r = {}) => ({
    register(n) {
        const s = n.get(ft).load(t);
        let o = false;
        s.items.forEach((t => {
            const s = t.definition;
            if (s == null) {
                n.register(t.value);
                return;
            }
            if (!o && e != null) {
                o = true;
                s.register(n, e);
                return;
            }
            const i = r[s.name];
            s.register(n, i);
        }));
    }
});

class Handler {
    constructor(t, e) {
        this.type = t;
        this.cb = e;
    }
    handle(t) {
        if (t instanceof this.type) {
            this.cb.call(null, t);
        }
    }
}

const ht = /*@__PURE__*/ createInterface("IEventAggregator", (t => t.singleton(EventAggregator)));

class EventAggregator {
    constructor() {
        this.eventLookup = {};
        this.messageHandlers = [];
    }
    publish(t, e) {
        if (!t) {
            throw createMappedError(18, t);
        }
        if (isString(t)) {
            let r = this.eventLookup[t];
            if (r !== void 0) {
                r = r.slice();
                const n = r.length;
                for (let s = 0; s < n; s++) {
                    r[s](e, t);
                }
            }
        } else {
            const e = this.messageHandlers.slice();
            const r = e.length;
            for (let n = 0; n < r; n++) {
                e[n].handle(t);
            }
        }
    }
    subscribe(t, e) {
        if (!t) {
            throw createMappedError(19, t);
        }
        let r;
        let n;
        if (isString(t)) {
            if (this.eventLookup[t] === void 0) {
                this.eventLookup[t] = [];
            }
            r = e;
            n = this.eventLookup[t];
        } else {
            r = new Handler(t, e);
            n = this.messageHandlers;
        }
        n.push(r);
        return {
            dispose() {
                const t = n.indexOf(r);
                if (t !== -1) {
                    n.splice(t, 1);
                }
            }
        };
    }
    subscribeOnce(t, e) {
        const r = this.subscribe(t, ((t, n) => {
            r.dispose();
            e(t, n);
        }));
        return r;
    }
}

exports.AnalyzedModule = AnalyzedModule;

exports.ConsoleSink = ConsoleSink;

exports.ContainerConfiguration = ContainerConfiguration;

exports.DI = E;

exports.DefaultLogEvent = DefaultLogEvent;

exports.DefaultLogEventFactory = DefaultLogEventFactory;

exports.DefaultLogger = at;

exports.DefaultResolver = b;

exports.EventAggregator = EventAggregator;

exports.IContainer = j;

exports.IEventAggregator = ht;

exports.ILogConfig = et;

exports.ILogEventFactory = nt;

exports.ILogger = st;

exports.IModuleLoader = ft;

exports.IPlatform = _;

exports.IServiceLocator = F;

exports.ISink = rt;

exports.InstanceProvider = InstanceProvider;

exports.LogConfig = LogConfig;

exports.LogLevel = tt;

exports.LoggerConfiguration = ut;

exports.ModuleItem = ModuleItem;

exports.Protocol = m;

exports.Registration = v;

exports.aliasedResourcesRegistry = aliasedResourcesRegistry;

exports.all = all;

exports.allResources = W;

exports.areEqual = i;

exports.bound = bound;

exports.camelCase = a;

exports.createImplementationRegister = createImplementationRegister;

exports.createLookup = createLookup;

exports.createResolver = createResolver;

exports.emptyArray = L;

exports.emptyObject = S;

exports.factory = K;

exports.firstDefined = firstDefined;

exports.format = lt;

exports.fromAnnotationOrDefinitionOrTypeOrDefault = fromAnnotationOrDefinitionOrTypeOrDefault;

exports.fromAnnotationOrTypeOrDefault = fromAnnotationOrTypeOrDefault;

exports.fromDefinitionOrDefault = fromDefinitionOrDefault;

exports.getPrototypeChain = h;

exports.getResourceKeyFor = getResourceKeyFor;

exports.ignore = P;

exports.inject = inject;

exports.isArray = isArray;

exports.isArrayIndex = l;

exports.isFunction = isFunction;

exports.isMap = isMap;

exports.isNativeFunction = p;

exports.isNumber = isNumber;

exports.isObject = isObject;

exports.isObjectOrFunction = isObjectOrFunction;

exports.isPromise = isPromise;

exports.isSet = isSet;

exports.isString = isString;

exports.isSymbol = isSymbol;

exports.kebabCase = f;

exports.last = last;

exports.lazy = M;

exports.mergeArrays = mergeArrays;

exports.newInstanceForScope = B;

exports.newInstanceOf = Q;

exports.noop = noop;

exports.onResolve = onResolve;

exports.onResolveAll = onResolveAll;

exports.optional = T;

exports.optionalResource = G;

exports.own = N;

exports.pascalCase = u;

exports.registrableMetadataKey = R;

exports.resolve = resolve;

exports.resource = z;

exports.resourceBaseName = w;

exports.singleton = singleton;

exports.sink = sink;

exports.toArray = toArray;

exports.transient = transient;
//# sourceMappingURL=index.cjs.map
