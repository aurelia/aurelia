import { Metadata as t, applyMetadataPolyfill as e, isObject as n } from "../../../metadata/dist/native-modules/index.js";

export { Metadata, applyMetadataPolyfill, isNullOrUndefined, isObject, metadata } from "../../../metadata/dist/native-modules/index.js";

export { Platform, Task, TaskAbortError, TaskQueue, TaskQueuePriority, TaskStatus } from "../../../platform/dist/native-modules/index.js";

const r = {};

function i(t) {
    switch (typeof t) {
      case "number":
        return t >= 0 && (0 | t) === t;

      case "string":
        {
            const e = r[t];
            if (void 0 !== e) return e;
            const n = t.length;
            if (0 === n) return r[t] = false;
            let i = 0;
            let o = 0;
            for (;o < n; ++o) {
                i = t.charCodeAt(o);
                if (0 === o && 48 === i && n > 1 || i < 48 || i > 57) return r[t] = false;
            }
            return r[t] = true;
        }

      default:
        return false;
    }
}

function o(t) {
    switch (typeof t) {
      case "number":
      case "bigint":
        return true;

      default:
        return false;
    }
}

function s(t) {
    switch (typeof t) {
      case "string":
        return true;

      case "object":
        return t instanceof Date;

      default:
        return false;
    }
}

const u = function() {
    let t;
    (function(t) {
        t[t["none"] = 0] = "none";
        t[t["digit"] = 1] = "digit";
        t[t["upper"] = 2] = "upper";
        t[t["lower"] = 3] = "lower";
    })(t || (t = {}));
    const e = Object.assign(Object.create(null), {
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
    function n(t) {
        if ("" === t) return 0;
        if (t !== t.toUpperCase()) return 3;
        if (t !== t.toLowerCase()) return 2;
        if (true === e[t]) return 1;
        return 0;
    }
    return function(t, e) {
        const r = t.length;
        if (0 === r) return t;
        let i = false;
        let o = "";
        let s;
        let u = "";
        let l = 0;
        let c = t.charAt(0);
        let f = n(c);
        let a = 0;
        for (;a < r; ++a) {
            s = l;
            u = c;
            l = f;
            c = t.charAt(a + 1);
            f = n(c);
            if (0 === l) {
                if (o.length > 0) i = true;
            } else {
                if (!i && o.length > 0 && 2 === l) i = 3 === s || 3 === f;
                o += e(u, i);
                i = false;
            }
        }
        return o;
    };
}();

const l = function() {
    const t = Object.create(null);
    function e(t, e) {
        return e ? t.toUpperCase() : t.toLowerCase();
    }
    return function(n) {
        let r = t[n];
        if (void 0 === r) r = t[n] = u(n, e);
        return r;
    };
}();

const c = function() {
    const t = Object.create(null);
    return function(e) {
        let n = t[e];
        if (void 0 === n) {
            n = l(e);
            if (n.length > 0) n = n[0].toUpperCase() + n.slice(1);
            t[e] = n;
        }
        return n;
    };
}();

const f = function() {
    const t = Object.create(null);
    function e(t, e) {
        return e ? `-${t.toLowerCase()}` : t.toLowerCase();
    }
    return function(n) {
        let r = t[n];
        if (void 0 === r) r = t[n] = u(n, e);
        return r;
    };
}();

function a(t) {
    const {length: e} = t;
    const n = Array(e);
    let r = 0;
    for (;r < e; ++r) n[r] = t[r];
    return n;
}

const h = {};

function d(t) {
    if (void 0 === h[t]) h[t] = 0;
    return ++h[t];
}

function v(t) {
    h[t] = 0;
}

function g(t, e) {
    return t - e;
}

function w(t, e, n) {
    if (void 0 === t || null === t || t === At) if (void 0 === e || null === e || e === At) return At; else return n ? e.slice(0) : e; else if (void 0 === e || null === e || e === At) return n ? t.slice(0) : t;
    const r = {};
    const i = n ? t.slice(0) : t;
    let o = t.length;
    let s = e.length;
    while (o-- > 0) r[t[o]] = true;
    let u;
    while (s-- > 0) {
        u = e[s];
        if (void 0 === r[u]) {
            i.push(u);
            r[u] = true;
        }
    }
    return i;
}

function p(t, e, n) {
    return {
        configurable: true,
        enumerable: n.enumerable,
        get() {
            const t = n.value.bind(this);
            Reflect.defineProperty(this, e, {
                value: t,
                writable: true,
                configurable: true,
                enumerable: n.enumerable
            });
            return t;
        }
    };
}

function y(...t) {
    const e = [];
    let n = 0;
    const r = t.length;
    let i = 0;
    let o;
    let s = 0;
    for (;s < r; ++s) {
        o = t[s];
        if (void 0 !== o) {
            i = o.length;
            let t = 0;
            for (;t < i; ++t) e[n++] = o[t];
        }
    }
    return e;
}

function m(...t) {
    const e = {};
    const n = t.length;
    let r;
    let i;
    let o = 0;
    for (;n > o; ++o) {
        r = t[o];
        if (void 0 !== r) for (i in r) e[i] = r[i];
    }
    return e;
}

function R(...t) {
    const e = t.length;
    let n;
    let r = 0;
    for (;e > r; ++r) {
        n = t[r];
        if (void 0 !== n) return n;
    }
    throw new Error(`No default value found`);
}

const b = function() {
    const t = Function.prototype;
    const e = Object.getPrototypeOf;
    const n = new WeakMap;
    let r = t;
    let i = 0;
    let o;
    return function(s) {
        o = n.get(s);
        if (void 0 === o) {
            n.set(s, o = [ r = s ]);
            i = 0;
            while ((r = e(r)) !== t) o[++i] = r;
        }
        return o;
    };
}();

function C(...t) {
    return Object.assign(Object.create(null), ...t);
}

const $ = function() {
    const t = new WeakMap;
    let e = false;
    let n = "";
    let r = 0;
    return function(i) {
        e = t.get(i);
        if (void 0 === e) {
            n = i.toString();
            r = n.length;
            e = r >= 29 && r <= 100 && 125 === n.charCodeAt(r - 1) && n.charCodeAt(r - 2) <= 32 && 93 === n.charCodeAt(r - 3) && 101 === n.charCodeAt(r - 4) && 100 === n.charCodeAt(r - 5) && 111 === n.charCodeAt(r - 6) && 99 === n.charCodeAt(r - 7) && 32 === n.charCodeAt(r - 8) && 101 === n.charCodeAt(r - 9) && 118 === n.charCodeAt(r - 10) && 105 === n.charCodeAt(r - 11) && 116 === n.charCodeAt(r - 12) && 97 === n.charCodeAt(r - 13) && 110 === n.charCodeAt(r - 14) && 88 === n.charCodeAt(r - 15);
            t.set(i, e);
        }
        return e;
    };
}();

function E(t, e) {
    if (t instanceof Promise) return t.then(e);
    return e(t);
}

function A(...t) {
    let e;
    let n;
    let r;
    let i = 0;
    let o = t.length;
    for (;i < o; ++i) {
        e = t[i];
        if ((e = t[i]) instanceof Promise) if (void 0 === n) n = e; else if (void 0 === r) r = [ n, e ]; else r.push(e);
    }
    if (void 0 === r) return n;
    return Promise.all(r);
}

const j = t.getOwn;

const O = t.hasOwn;

const k = t.define;

const I = "au:annotation";

const M = (t, e) => {
    if (void 0 === e) return `${I}:${t}`;
    return `${I}:${t}:${e}`;
};

const T = (t, e) => {
    const n = j(I, t);
    if (void 0 === n) k(I, [ e ], t); else n.push(e);
};

const F = Object.freeze({
    name: "au:annotation",
    appendTo: T,
    set(t, e, n) {
        k(M(e), n, t);
    },
    get: (t, e) => j(M(e), t),
    getKeys(t) {
        let e = j(I, t);
        if (void 0 === e) k(I, e = [], t);
        return e;
    },
    isKey: t => t.startsWith(I),
    keyFor: M
});

const U = "au:resource";

const L = Object.freeze({
    name: U,
    appendTo(t, e) {
        const n = j(U, t);
        if (void 0 === n) k(U, [ e ], t); else n.push(e);
    },
    has: t => O(U, t),
    getAll(t) {
        const e = j(U, t);
        if (void 0 === e) return At; else return e.map((e => j(e, t)));
    },
    getKeys(t) {
        let e = j(U, t);
        if (void 0 === e) k(U, e = [], t);
        return e;
    },
    isKey: t => t.startsWith(U),
    keyFor(t, e) {
        if (void 0 === e) return `${U}:${t}`;
        return `${U}:${t}:${e}`;
    }
});

const P = {
    annotation: F,
    resource: L
};

const D = Object.prototype.hasOwnProperty;

function S(t, e, n, r) {
    let i = j(M(t), n);
    if (void 0 === i) {
        i = e[t];
        if (void 0 === i) {
            i = n[t];
            if (void 0 === i || !D.call(n, t)) return r();
            return i;
        }
        return i;
    }
    return i;
}

function N(t, e, n) {
    let r = j(M(t), e);
    if (void 0 === r) {
        r = e[t];
        if (void 0 === r || !D.call(e, t)) return n();
        return r;
    }
    return r;
}

function W(t, e, n) {
    const r = e[t];
    if (void 0 === r) return n();
    return r;
}

e(Reflect, false, false);

class ResolverBuilder {
    constructor(t, e) {
        this.container = t;
        this.key = e;
    }
    instance(t) {
        return this.registerResolver(0, t);
    }
    singleton(t) {
        return this.registerResolver(1, t);
    }
    transient(t) {
        return this.registerResolver(2, t);
    }
    callback(t) {
        return this.registerResolver(3, t);
    }
    cachedCallback(t) {
        return this.registerResolver(3, Rt(t));
    }
    aliasTo(t) {
        return this.registerResolver(5, t);
    }
    registerResolver(t, e) {
        const {container: n, key: r} = this;
        this.container = this.key = void 0;
        return n.registerResolver(r, new Resolver(r, t, e));
    }
}

function B(t) {
    const e = t.slice();
    const n = Object.keys(t);
    const r = n.length;
    let o;
    for (let s = 0; s < r; ++s) {
        o = n[s];
        if (!i(o)) e[o] = t[o];
    }
    return e;
}

const Q = {
    none(t) {
        throw Error(`AUR0002:${t.toString()}`);
    },
    singleton(t) {
        return new Resolver(t, 1, t);
    },
    transient(t) {
        return new Resolver(t, 2, t);
    }
};

class ContainerConfiguration {
    constructor(t, e) {
        this.inheritParentResources = t;
        this.defaultResolver = e;
    }
    static from(t) {
        var e, n;
        if (void 0 === t || t === ContainerConfiguration.DEFAULT) return ContainerConfiguration.DEFAULT;
        return new ContainerConfiguration(null !== (e = t.inheritParentResources) && void 0 !== e ? e : false, null !== (n = t.defaultResolver) && void 0 !== n ? n : Q.singleton);
    }
}

ContainerConfiguration.DEFAULT = ContainerConfiguration.from({});

const x = {
    createContainer(t) {
        return new Container(null, ContainerConfiguration.from(t));
    },
    getDesignParamtypes(t) {
        return j("design:paramtypes", t);
    },
    getAnnotationParamtypes(t) {
        const e = M("di:paramtypes");
        return j(e, t);
    },
    getOrCreateAnnotationParamTypes: G,
    getDependencies: z,
    createInterface(t, e) {
        const n = "function" === typeof t ? t : e;
        const r = "string" === typeof t ? t : void 0;
        const i = function(t, e, n) {
            if (null == t || void 0 !== new.target) throw new Error(`AUR0001:${i.friendlyName}`);
            const r = G(t);
            r[n] = i;
        };
        i.$isInterface = true;
        i.friendlyName = null == r ? "(anonymous)" : r;
        if (null != n) i.register = function(t, e) {
            return n(new ResolverBuilder(t, null !== e && void 0 !== e ? e : i));
        };
        i.toString = function t() {
            return `InterfaceSymbol<${i.friendlyName}>`;
        };
        return i;
    },
    inject(...t) {
        return function(e, n, r) {
            if ("number" === typeof r) {
                const n = G(e);
                const i = t[0];
                if (void 0 !== i) n[r] = i;
            } else if (n) {
                const r = G(e.constructor);
                const i = t[0];
                if (void 0 !== i) r[n] = i;
            } else if (r) {
                const e = r.value;
                const n = G(e);
                let i;
                for (let e = 0; e < t.length; ++e) {
                    i = t[e];
                    if (void 0 !== i) n[e] = i;
                }
            } else {
                const n = G(e);
                let r;
                for (let e = 0; e < t.length; ++e) {
                    r = t[e];
                    if (void 0 !== r) n[e] = r;
                }
            }
        };
    },
    transient(t) {
        t.register = function e(n) {
            const r = bt.transient(t, t);
            return r.register(n, t);
        };
        t.registerInRequestor = false;
        return t;
    },
    singleton(t, e = X) {
        t.register = function e(n) {
            const r = bt.singleton(t, t);
            return r.register(n, t);
        };
        t.registerInRequestor = e.scoped;
        return t;
    }
};

function z(t) {
    const e = M("di:dependencies");
    let n = j(e, t);
    if (void 0 === n) {
        const r = t.inject;
        if (void 0 === r) {
            const e = x.getDesignParamtypes(t);
            const r = x.getAnnotationParamtypes(t);
            if (void 0 === e) if (void 0 === r) {
                const e = Object.getPrototypeOf(t);
                if ("function" === typeof e && e !== Function.prototype) n = B(z(e)); else n = [];
            } else n = B(r); else if (void 0 === r) n = B(e); else {
                n = B(e);
                let t = r.length;
                let o;
                let s = 0;
                for (;s < t; ++s) {
                    o = r[s];
                    if (void 0 !== o) n[s] = o;
                }
                const u = Object.keys(r);
                let l;
                s = 0;
                t = u.length;
                for (s = 0; s < t; ++s) {
                    l = u[s];
                    if (!i(l)) n[l] = r[l];
                }
            }
        } else n = B(r);
        k(e, n, t);
        T(t, e);
    }
    return n;
}

function G(t) {
    const e = M("di:paramtypes");
    let n = j(e, t);
    if (void 0 === n) {
        k(e, n = [], t);
        T(t, e);
    }
    return n;
}

const K = x.createInterface("IContainer");

const _ = K;

function H(t) {
    return function(e) {
        const n = function(t, e, r) {
            x.inject(n)(t, e, r);
        };
        n.$isResolver = true;
        n.resolve = function(n, r) {
            return t(e, n, r);
        };
        return n;
    };
}

const V = x.inject;

function q(t) {
    return x.transient(t);
}

function J(t) {
    return null == t ? q : q(t);
}

const X = {
    scoped: false
};

function Y(t) {
    if ("function" === typeof t) return x.singleton(t);
    return function(e) {
        return x.singleton(e, t);
    };
}

function Z(t) {
    return function(e, n) {
        n = !!n;
        const r = function(t, e, n) {
            x.inject(r)(t, e, n);
        };
        r.$isResolver = true;
        r.resolve = function(r, i) {
            return t(e, r, i, n);
        };
        return r;
    };
}

const tt = Z(((t, e, n, r) => n.getAll(t, r)));

const et = H(((t, e, n) => () => n.get(t)));

const nt = H(((t, e, n) => {
    if (n.has(t, true)) return n.get(t); else return;
}));

function rt(t, e, n) {
    x.inject(rt)(t, e, n);
}

rt.$isResolver = true;

rt.resolve = () => {};

const it = H(((t, e, n) => (...r) => e.getFactory(t).construct(n, r)));

const ot = H(((t, e, n) => {
    const r = ut(t, e, n);
    const i = new InstanceProvider(String(t), r);
    n.registerResolver(t, i, true);
    return r;
}));

const st = H(((t, e, n) => ut(t, e, n)));

function ut(t, e, n) {
    return e.getFactory(t).construct(n);
}

var lt;

(function(t) {
    t[t["instance"] = 0] = "instance";
    t[t["singleton"] = 1] = "singleton";
    t[t["transient"] = 2] = "transient";
    t[t["callback"] = 3] = "callback";
    t[t["array"] = 4] = "array";
    t[t["alias"] = 5] = "alias";
})(lt || (lt = {}));

class Resolver {
    constructor(t, e, n) {
        this.key = t;
        this.strategy = e;
        this.state = n;
        this.resolving = false;
    }
    get $isResolver() {
        return true;
    }
    register(t, e) {
        return t.registerResolver(e || this.key, this);
    }
    resolve(t, e) {
        switch (this.strategy) {
          case 0:
            return this.state;

          case 1:
            if (this.resolving) throw new Error(`AUR0003:${this.state.name}`);
            this.resolving = true;
            this.state = t.getFactory(this.state).construct(e);
            this.strategy = 0;
            this.resolving = false;
            return this.state;

          case 2:
            {
                const n = t.getFactory(this.state);
                if (null === n) throw new Error(`AUR0004:${String(this.key)}`);
                return n.construct(e);
            }

          case 3:
            return this.state(t, e, this);

          case 4:
            return this.state[0].resolve(t, e);

          case 5:
            return e.get(this.state);

          default:
            throw new Error(`AUR0005:${this.strategy}`);
        }
    }
    getFactory(t) {
        var e, n, r;
        switch (this.strategy) {
          case 1:
          case 2:
            return t.getFactory(this.state);

          case 5:
            return null !== (r = null === (n = null === (e = t.getResolver(this.state)) || void 0 === e ? void 0 : e.getFactory) || void 0 === n ? void 0 : n.call(e, t)) && void 0 !== r ? r : null;

          default:
            return null;
        }
    }
}

function ct(t) {
    return this.get(t);
}

function ft(t, e) {
    return e(t);
}

class Factory {
    constructor(t, e) {
        this.Type = t;
        this.dependencies = e;
        this.transformers = null;
    }
    construct(t, e) {
        let n;
        if (void 0 === e) n = new this.Type(...this.dependencies.map(ct, t)); else n = new this.Type(...this.dependencies.map(ct, t), ...e);
        if (null == this.transformers) return n;
        return this.transformers.reduce(ft, n);
    }
    registerTransformer(t) {
        var e;
        (null !== (e = this.transformers) && void 0 !== e ? e : this.transformers = []).push(t);
    }
}

const at = {
    $isResolver: true,
    resolve(t, e) {
        return e;
    }
};

function ht(t) {
    return "function" === typeof t.register;
}

function dt(t) {
    return ht(t) && "boolean" === typeof t.registerInRequestor;
}

function vt(t) {
    return dt(t) && t.registerInRequestor;
}

function gt(t) {
    return void 0 !== t.prototype;
}

function wt(t) {
    return "string" === typeof t && t.indexOf(":") > 0;
}

const pt = new Set([ "Array", "ArrayBuffer", "Boolean", "DataView", "Date", "Error", "EvalError", "Float32Array", "Float64Array", "Function", "Int8Array", "Int16Array", "Int32Array", "Map", "Number", "Object", "Promise", "RangeError", "ReferenceError", "RegExp", "Set", "SharedArrayBuffer", "String", "SyntaxError", "TypeError", "Uint8Array", "Uint8ClampedArray", "Uint16Array", "Uint32Array", "URIError", "WeakMap", "WeakSet" ]);

let yt = 0;

class Container {
    constructor(t, e) {
        this.parent = t;
        this.config = e;
        this.id = ++yt;
        this.t = 0;
        this.i = new Map;
        if (null === t) {
            this.root = this;
            this.o = new Map;
            this.u = new Map;
            this.res = Object.create(null);
        } else {
            this.root = t.root;
            this.o = new Map;
            this.u = t.u;
            if (e.inheritParentResources) this.res = Object.assign(Object.create(null), t.res, this.root.res); else this.res = Object.create(null);
        }
        this.o.set(K, at);
    }
    get depth() {
        return null === this.parent ? 0 : this.parent.depth + 1;
    }
    register(...t) {
        if (100 === ++this.t) throw new Error(`AUR0006:${t.map(String)}`);
        let e;
        let r;
        let i;
        let o;
        let s;
        let u = 0;
        let l = t.length;
        for (;u < l; ++u) {
            e = t[u];
            if (!n(e)) continue;
            if (ht(e)) e.register(this); else if (P.resource.has(e)) {
                const t = P.resource.getAll(e);
                if (1 === t.length) t[0].register(this); else {
                    o = 0;
                    s = t.length;
                    while (s > o) {
                        t[o].register(this);
                        ++o;
                    }
                }
            } else if (gt(e)) bt.singleton(e, e).register(this); else {
                r = Object.keys(e);
                o = 0;
                s = r.length;
                for (;o < s; ++o) {
                    i = e[r[o]];
                    if (!n(i)) continue;
                    if (ht(i)) i.register(this); else this.register(i);
                }
            }
        }
        --this.t;
        return this;
    }
    registerResolver(t, e, n = false) {
        Ct(t);
        const r = this.o;
        const i = r.get(t);
        if (null == i) {
            r.set(t, e);
            if (wt(t)) {
                if (void 0 !== this.res[t]) throw new Error(`AUR0007:${t}`);
                this.res[t] = e;
            }
        } else if (i instanceof Resolver && 4 === i.strategy) i.state.push(e); else r.set(t, new Resolver(t, 4, [ i, e ]));
        if (n) this.i.set(t, e);
        return e;
    }
    registerTransformer(t, e) {
        const n = this.getResolver(t);
        if (null == n) return false;
        if (n.getFactory) {
            const t = n.getFactory(this);
            if (null == t) return false;
            t.registerTransformer(e);
            return true;
        }
        return false;
    }
    getResolver(t, e = true) {
        Ct(t);
        if (void 0 !== t.resolve) return t;
        let n = this;
        let r;
        while (null != n) {
            r = n.o.get(t);
            if (null == r) {
                if (null == n.parent) {
                    const r = vt(t) ? this : n;
                    return e ? this.l(t, r) : null;
                }
                n = n.parent;
            } else return r;
        }
        return null;
    }
    has(t, e = false) {
        return this.o.has(t) ? true : e && null != this.parent ? this.parent.has(t, true) : false;
    }
    get(t) {
        Ct(t);
        if (t.$isResolver) return t.resolve(this, this);
        let e = this;
        let n;
        while (null != e) {
            n = e.o.get(t);
            if (null == n) {
                if (null == e.parent) {
                    const r = vt(t) ? this : e;
                    n = this.l(t, r);
                    return n.resolve(e, this);
                }
                e = e.parent;
            } else return n.resolve(e, this);
        }
        throw new Error(`AUR0008:${t}`);
    }
    getAll(t, e = false) {
        Ct(t);
        const n = this;
        let r = n;
        let i;
        if (e) {
            let e = At;
            while (null != r) {
                i = r.o.get(t);
                if (null != i) e = e.concat($t(i, r, n));
                r = r.parent;
            }
            return e;
        } else while (null != r) {
            i = r.o.get(t);
            if (null == i) {
                r = r.parent;
                if (null == r) return At;
            } else return $t(i, r, n);
        }
        return At;
    }
    invoke(t, e) {
        if ($(t)) throw Et(t);
        if (void 0 === e) return new t(...z(t).map(ct, this)); else return new t(...z(t).map(ct, this), ...e);
    }
    getFactory(t) {
        let e = this.u.get(t);
        if (void 0 === e) {
            if ($(t)) throw Et(t);
            this.u.set(t, e = new Factory(t, z(t)));
        }
        return e;
    }
    registerFactory(t, e) {
        this.u.set(t, e);
    }
    createChild(t) {
        if (void 0 === t && this.config.inheritParentResources) {
            if (this.config === ContainerConfiguration.DEFAULT) return new Container(this, this.config);
            return new Container(this, ContainerConfiguration.from({
                ...this.config,
                inheritParentResources: false
            }));
        }
        return new Container(this, ContainerConfiguration.from(null !== t && void 0 !== t ? t : this.config));
    }
    disposeResolvers() {
        const t = this.o;
        const e = this.i;
        let n;
        let r;
        for ([r, n] of e.entries()) {
            n.dispose();
            t.delete(r);
        }
        e.clear();
    }
    find(t, e) {
        const n = t.keyFrom(e);
        let r = this.res[n];
        if (void 0 === r) {
            r = this.root.res[n];
            if (void 0 === r) return null;
        }
        if (null === r) return null;
        if ("function" === typeof r.getFactory) {
            const e = r.getFactory(this);
            if (null === e || void 0 === e) return null;
            const n = j(t.name, e.Type);
            if (void 0 === n) return null;
            return n;
        }
        return null;
    }
    create(t, e) {
        var n, r;
        const i = t.keyFrom(e);
        let o = this.res[i];
        if (void 0 === o) {
            o = this.root.res[i];
            if (void 0 === o) return null;
            return null !== (n = o.resolve(this.root, this)) && void 0 !== n ? n : null;
        }
        return null !== (r = o.resolve(this, this)) && void 0 !== r ? r : null;
    }
    dispose() {
        if (this.i.size > 0) this.disposeResolvers();
        this.o.clear();
    }
    l(t, e) {
        if ("function" !== typeof t) throw new Error(`AUR0009:${t}`);
        if (pt.has(t.name)) throw new Error(`AUR0010:${t.name}`);
        if (ht(t)) {
            const n = t.register(e, t);
            if (!(n instanceof Object) || null == n.resolve) {
                const n = e.o.get(t);
                if (void 0 != n) return n;
                throw new Error(`AUR0011`);
            }
            return n;
        } else if (P.resource.has(t)) {
            const n = P.resource.getAll(t);
            if (1 === n.length) n[0].register(e); else {
                const t = n.length;
                for (let r = 0; r < t; ++r) n[r].register(e);
            }
            const r = e.o.get(t);
            if (void 0 != r) return r;
            throw new Error(`AUR0011`);
        } else if (t.$isInterface) throw new Error(`AUR0012:${t.friendlyName}`); else {
            const n = this.config.defaultResolver(t, e);
            e.o.set(t, n);
            return n;
        }
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
        } else t.register(...this.params.filter((t => "object" === typeof t)));
    }
}

const mt = new WeakMap;

function Rt(t) {
    return function(e, n, r) {
        let i = mt.get(e);
        if (void 0 === i) mt.set(e, i = new WeakMap);
        if (i.has(r)) return i.get(r);
        const o = t(e, n, r);
        i.set(r, o);
        return o;
    };
}

const bt = {
    instance(t, e) {
        return new Resolver(t, 0, e);
    },
    singleton(t, e) {
        return new Resolver(t, 1, e);
    },
    transient(t, e) {
        return new Resolver(t, 2, e);
    },
    callback(t, e) {
        return new Resolver(t, 3, e);
    },
    cachedCallback(t, e) {
        return new Resolver(t, 3, Rt(e));
    },
    aliasTo(t, e) {
        return new Resolver(e, 5, t);
    },
    defer(t, ...e) {
        return new ParameterizedRegistry(t, e);
    }
};

class InstanceProvider {
    constructor(t, e) {
        this.h = null;
        this.g = t;
        if (void 0 !== e) this.h = e;
    }
    get friendlyName() {
        return this.g;
    }
    prepare(t) {
        this.h = t;
    }
    get $isResolver() {
        return true;
    }
    resolve() {
        if (null == this.h) throw new Error(`AUR0013:${this.g}`);
        return this.h;
    }
    dispose() {
        this.h = null;
    }
}

function Ct(t) {
    if (null === t || void 0 === t) throw new Error(`AUR0014`);
}

function $t(t, e, n) {
    if (t instanceof Resolver && 4 === t.strategy) {
        const r = t.state;
        let i = r.length;
        const o = new Array(i);
        while (i--) o[i] = r[i].resolve(e, n);
        return o;
    }
    return [ t.resolve(e, n) ];
}

function Et(t) {
    return new Error(`AUR0015:${t.name}`);
}

const At = Object.freeze([]);

const jt = Object.freeze({});

function Ot() {}

const kt = x.createInterface("IPlatform");

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */ function It(t, e, n, r) {
    var i = arguments.length, o = i < 3 ? e : null === r ? r = Object.getOwnPropertyDescriptor(e, n) : r, s;
    if ("object" === typeof Reflect && "function" === typeof Reflect.decorate) o = Reflect.decorate(t, e, n, r); else for (var u = t.length - 1; u >= 0; u--) if (s = t[u]) o = (i < 3 ? s(o) : i > 3 ? s(e, n, o) : s(e, n)) || o;
    return i > 3 && o && Object.defineProperty(e, n, o), o;
}

function Mt(t, e) {
    return function(n, r) {
        e(n, r, t);
    };
}

var Tt;

(function(t) {
    t[t["trace"] = 0] = "trace";
    t[t["debug"] = 1] = "debug";
    t[t["info"] = 2] = "info";
    t[t["warn"] = 3] = "warn";
    t[t["error"] = 4] = "error";
    t[t["fatal"] = 5] = "fatal";
    t[t["none"] = 6] = "none";
})(Tt || (Tt = {}));

var Ft;

(function(t) {
    t[t["noColors"] = 0] = "noColors";
    t[t["colors"] = 1] = "colors";
})(Ft || (Ft = {}));

const Ut = x.createInterface("ILogConfig", (t => t.instance(new LogConfig(0, 3))));

const Lt = x.createInterface("ISink");

const Pt = x.createInterface("ILogEventFactory", (t => t.singleton(Gt)));

const Dt = x.createInterface("ILogger", (t => t.singleton(_t)));

const St = x.createInterface("ILogScope");

const Nt = Object.freeze({
    key: M("logger-sink-handles"),
    define(t, e) {
        k(this.key, e.handles, t.prototype);
        return t;
    },
    getHandles(e) {
        return t.get(this.key, e);
    }
});

function Wt(t) {
    return function(e) {
        return Nt.define(e, t);
    };
}

const Bt = C({
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

const Qt = function() {
    const t = [ C({
        TRC: "TRC",
        DBG: "DBG",
        INF: "INF",
        WRN: "WRN",
        ERR: "ERR",
        FTL: "FTL",
        QQQ: "???"
    }), C({
        TRC: Bt.grey("TRC"),
        DBG: Bt.grey("DBG"),
        INF: Bt.white("INF"),
        WRN: Bt.yellow("WRN"),
        ERR: Bt.red("ERR"),
        FTL: Bt.red("FTL"),
        QQQ: Bt.grey("???")
    }) ];
    return function(e, n) {
        if (e <= 0) return t[n].TRC;
        if (e <= 1) return t[n].DBG;
        if (e <= 2) return t[n].INF;
        if (e <= 3) return t[n].WRN;
        if (e <= 4) return t[n].ERR;
        if (e <= 5) return t[n].FTL;
        return t[n].QQQ;
    };
}();

function xt(t, e) {
    if (0 === e) return t.join(".");
    return t.map(Bt.cyan).join(".");
}

function zt(t, e) {
    if (0 === e) return new Date(t).toISOString();
    return Bt.grey(new Date(t).toISOString());
}

class DefaultLogEvent {
    constructor(t, e, n, r, i, o) {
        this.severity = t;
        this.message = e;
        this.optionalParams = n;
        this.scope = r;
        this.colorOptions = i;
        this.timestamp = o;
    }
    toString() {
        const {severity: t, message: e, scope: n, colorOptions: r, timestamp: i} = this;
        if (0 === n.length) return `${zt(i, r)} [${Qt(t, r)}] ${e}`;
        return `${zt(i, r)} [${Qt(t, r)} ${xt(n, r)}] ${e}`;
    }
}

let Gt = class DefaultLogEventFactory {
    constructor(t) {
        this.config = t;
    }
    createLogEvent(t, e, n, r) {
        return new DefaultLogEvent(e, n, r, t.scope, this.config.colorOptions, Date.now());
    }
};

Gt = It([ Mt(0, Ut) ], Gt);

let Kt = class ConsoleSink {
    constructor(t) {
        const e = t.console;
        this.handleEvent = function t(n) {
            const r = n.optionalParams;
            if (void 0 === r || 0 === r.length) {
                const t = n.toString();
                switch (n.severity) {
                  case 0:
                  case 1:
                    return e.debug(t);

                  case 2:
                    return e.info(t);

                  case 3:
                    return e.warn(t);

                  case 4:
                  case 5:
                    return e.error(t);
                }
            } else {
                let t = n.toString();
                let i = 0;
                while (t.includes("%s")) t = t.replace("%s", String(r[i++]));
                switch (n.severity) {
                  case 0:
                  case 1:
                    return e.debug(t, ...r.slice(i));

                  case 2:
                    return e.info(t, ...r.slice(i));

                  case 3:
                    return e.warn(t, ...r.slice(i));

                  case 4:
                  case 5:
                    return e.error(t, ...r.slice(i));
                }
            }
        };
    }
    static register(t) {
        bt.singleton(Lt, ConsoleSink).register(t);
    }
};

Kt = It([ Mt(0, kt) ], Kt);

let _t = class DefaultLogger {
    constructor(t, e, n, r = [], i = null) {
        var o, s, u, l, c, f;
        this.config = t;
        this.factory = e;
        this.scope = r;
        this.scopedLoggers = Object.create(null);
        let a;
        let h;
        let d;
        let v;
        let g;
        let w;
        if (null === i) {
            this.root = this;
            this.parent = this;
            a = this.traceSinks = [];
            h = this.debugSinks = [];
            d = this.infoSinks = [];
            v = this.warnSinks = [];
            g = this.errorSinks = [];
            w = this.fatalSinks = [];
            for (const t of n) {
                const e = Nt.getHandles(t);
                if (null !== (o = null === e || void 0 === e ? void 0 : e.includes(0)) && void 0 !== o ? o : true) a.push(t);
                if (null !== (s = null === e || void 0 === e ? void 0 : e.includes(1)) && void 0 !== s ? s : true) h.push(t);
                if (null !== (u = null === e || void 0 === e ? void 0 : e.includes(2)) && void 0 !== u ? u : true) d.push(t);
                if (null !== (l = null === e || void 0 === e ? void 0 : e.includes(3)) && void 0 !== l ? l : true) v.push(t);
                if (null !== (c = null === e || void 0 === e ? void 0 : e.includes(4)) && void 0 !== c ? c : true) g.push(t);
                if (null !== (f = null === e || void 0 === e ? void 0 : e.includes(5)) && void 0 !== f ? f : true) w.push(t);
            }
        } else {
            this.root = i.root;
            this.parent = i;
            a = this.traceSinks = i.traceSinks;
            h = this.debugSinks = i.debugSinks;
            d = this.infoSinks = i.infoSinks;
            v = this.warnSinks = i.warnSinks;
            g = this.errorSinks = i.errorSinks;
            w = this.fatalSinks = i.fatalSinks;
        }
    }
    trace(t, ...e) {
        if (this.config.level <= 0) this.emit(this.traceSinks, 0, t, e);
    }
    debug(t, ...e) {
        if (this.config.level <= 1) this.emit(this.debugSinks, 1, t, e);
    }
    info(t, ...e) {
        if (this.config.level <= 2) this.emit(this.infoSinks, 2, t, e);
    }
    warn(t, ...e) {
        if (this.config.level <= 3) this.emit(this.warnSinks, 3, t, e);
    }
    error(t, ...e) {
        if (this.config.level <= 4) this.emit(this.errorSinks, 4, t, e);
    }
    fatal(t, ...e) {
        if (this.config.level <= 5) this.emit(this.fatalSinks, 5, t, e);
    }
    scopeTo(t) {
        const e = this.scopedLoggers;
        let n = e[t];
        if (void 0 === n) n = e[t] = new DefaultLogger(this.config, this.factory, void 0, this.scope.concat(t), this);
        return n;
    }
    emit(t, e, n, r) {
        const i = "function" === typeof n ? n() : n;
        const o = this.factory.createLogEvent(this, e, i, r);
        for (let e = 0, n = t.length; e < n; ++e) t[e].handleEvent(o);
    }
};

It([ p ], _t.prototype, "trace", null);

It([ p ], _t.prototype, "debug", null);

It([ p ], _t.prototype, "info", null);

It([ p ], _t.prototype, "warn", null);

It([ p ], _t.prototype, "error", null);

It([ p ], _t.prototype, "fatal", null);

_t = It([ Mt(0, Ut), Mt(1, Pt), Mt(2, tt(Lt)), Mt(3, nt(St)), Mt(4, rt) ], _t);

const Ht = C({
    create({level: t = 3, colorOptions: e = 0, sinks: n = []} = {}) {
        return C({
            register(r) {
                r.register(bt.instance(Ut, new LogConfig(e, t)));
                for (const t of n) if ("function" === typeof t) r.register(bt.singleton(Lt, t)); else r.register(t);
                return r;
            }
        });
    }
});

const Vt = x.createInterface((t => t.singleton(ModuleLoader)));

function qt(t) {
    return t;
}

class ModuleTransformer {
    constructor(t) {
        this.$transform = t;
        this.R = new Map;
        this.C = new Map;
    }
    transform(t) {
        if (t instanceof Promise) return this.$(t); else if ("object" === typeof t && null !== t) return this.A(t); else throw new Error(`Invalid input: ${String(t)}. Expected Promise or Object.`);
    }
    $(t) {
        if (this.R.has(t)) return this.R.get(t);
        const e = t.then((t => this.A(t)));
        this.R.set(t, e);
        void e.then((e => {
            this.R.set(t, e);
        }));
        return e;
    }
    A(t) {
        if (this.C.has(t)) return this.C.get(t);
        const e = this.$transform(this.j(t));
        this.C.set(t, e);
        if (e instanceof Promise) void e.then((e => {
            this.C.set(t, e);
        }));
        return e;
    }
    j(t) {
        let e;
        let n;
        let r;
        let i;
        const o = [];
        for (const s in t) {
            switch (typeof (e = t[s])) {
              case "object":
                if (null === e) continue;
                n = "function" === typeof e.register;
                r = false;
                i = At;
                break;

              case "function":
                n = "function" === typeof e.register;
                r = void 0 !== e.prototype;
                i = P.resource.getAll(e);
                break;

              default:
                continue;
            }
            o.push(new ModuleItem(s, e, n, r, i));
        }
        return new AnalyzedModule(t, o);
    }
}

class ModuleLoader {
    constructor() {
        this.transformers = new Map;
    }
    load(t, e = qt) {
        const n = this.transformers;
        let r = n.get(e);
        if (void 0 === r) n.set(e, r = new ModuleTransformer(e));
        return r.transform(t);
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
    constructor(t, e, n, r, i) {
        this.key = t;
        this.value = e;
        this.isRegistry = n;
        this.isConstructable = r;
        this.definitions = i;
    }
}

class Handler {
    constructor(t, e) {
        this.messageType = t;
        this.callback = e;
    }
    handle(t) {
        if (t instanceof this.messageType) this.callback.call(null, t);
    }
}

const Jt = x.createInterface("IEventAggregator", (t => t.singleton(EventAggregator)));

class EventAggregator {
    constructor() {
        this.eventLookup = {};
        this.messageHandlers = [];
    }
    publish(t, e) {
        if (!t) throw new Error(`Invalid channel name or instance: ${t}.`);
        if ("string" === typeof t) {
            let n = this.eventLookup[t];
            if (void 0 !== n) {
                n = n.slice();
                let r = n.length;
                while (r-- > 0) n[r](e, t);
            }
        } else {
            const e = this.messageHandlers.slice();
            let n = e.length;
            while (n-- > 0) e[n].handle(t);
        }
    }
    subscribe(t, e) {
        if (!t) throw new Error(`Invalid channel name or type: ${t}.`);
        let n;
        let r;
        if ("string" === typeof t) {
            if (void 0 === this.eventLookup[t]) this.eventLookup[t] = [];
            n = e;
            r = this.eventLookup[t];
        } else {
            n = new Handler(t, e);
            r = this.messageHandlers;
        }
        r.push(n);
        return {
            dispose() {
                const t = r.indexOf(n);
                if (-1 !== t) r.splice(t, 1);
            }
        };
    }
    subscribeOnce(t, e) {
        const n = this.subscribe(t, (function(t, r) {
            n.dispose();
            e(t, r);
        }));
        return n;
    }
}

export { AnalyzedModule, Ft as ColorOptions, Kt as ConsoleSink, ContainerConfiguration, x as DI, DefaultLogEvent, Gt as DefaultLogEventFactory, _t as DefaultLogger, Q as DefaultResolver, EventAggregator, K as IContainer, Jt as IEventAggregator, Ut as ILogConfig, Pt as ILogEventFactory, Dt as ILogger, Vt as IModuleLoader, kt as IPlatform, _ as IServiceLocator, Lt as ISink, InstanceProvider, LogConfig, Tt as LogLevel, Ht as LoggerConfiguration, ModuleItem, P as Protocol, bt as Registration, tt as all, p as bound, l as camelCase, g as compareNumber, At as emptyArray, jt as emptyObject, it as factory, R as firstDefined, Bt as format, S as fromAnnotationOrDefinitionOrTypeOrDefault, N as fromAnnotationOrTypeOrDefault, W as fromDefinitionOrDefault, b as getPrototypeChain, rt as ignore, V as inject, i as isArrayIndex, $ as isNativeFunction, o as isNumberOrBigInt, s as isStringOrDate, f as kebabCase, et as lazy, y as mergeArrays, w as mergeDistinct, m as mergeObjects, ot as newInstanceForScope, st as newInstanceOf, d as nextId, Ot as noop, E as onResolve, nt as optional, c as pascalCase, v as resetId, A as resolveAll, Y as singleton, Wt as sink, a as toArray, J as transient };
//# sourceMappingURL=index.js.map
