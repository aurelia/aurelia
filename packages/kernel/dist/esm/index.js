import { Metadata as t, applyMetadataPolyfill as e, isObject as n } from "@aurelia/metadata";

export { Metadata, applyMetadataPolyfill, isNullOrUndefined, isObject, metadata } from "@aurelia/metadata";

export { Platform, Task, TaskAbortError, TaskQueue, TaskQueuePriority, TaskStatus } from "@aurelia/platform";

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
            let s = 0;
            for (;s < n; ++s) {
                i = t.charCodeAt(s);
                if (0 === s && 48 === i && n > 1 || i < 48 || i > 57) return r[t] = false;
            }
            return r[t] = true;
        }

      default:
        return false;
    }
}

function s(t) {
    switch (typeof t) {
      case "number":
      case "bigint":
        return true;

      default:
        return false;
    }
}

function o(t) {
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
        let s = "";
        let o;
        let u = "";
        let l = 0;
        let c = t.charAt(0);
        let f = n(c);
        let a = 0;
        for (;a < r; ++a) {
            o = l;
            u = c;
            l = f;
            c = t.charAt(a + 1);
            f = n(c);
            if (0 === l) {
                if (s.length > 0) i = true;
            } else {
                if (!i && s.length > 0 && 2 === l) i = 3 === o || 3 === f;
                s += e(u, i);
                i = false;
            }
        }
        return s;
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

function w(t, e) {
    return t - e;
}

function g(t, e, n) {
    if (void 0 === t || null === t || t === Ot) if (void 0 === e || null === e || e === Ot) return Ot; else return n ? e.slice(0) : e; else if (void 0 === e || null === e || e === Ot) return n ? t.slice(0) : t;
    const r = {};
    const i = n ? t.slice(0) : t;
    let s = t.length;
    let o = e.length;
    while (s-- > 0) r[t[s]] = true;
    let u;
    while (o-- > 0) {
        u = e[o];
        if (void 0 === r[u]) {
            i.push(u);
            r[u] = true;
        }
    }
    return i;
}

function m(t, e, n) {
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

function p(...t) {
    const e = [];
    let n = 0;
    const r = t.length;
    let i = 0;
    let s;
    let o = 0;
    for (;o < r; ++o) {
        s = t[o];
        if (void 0 !== s) {
            i = s.length;
            let t = 0;
            for (;t < i; ++t) e[n++] = s[t];
        }
    }
    return e;
}

function y(...t) {
    const e = {};
    const n = t.length;
    let r;
    let i;
    let s = 0;
    for (;n > s; ++s) {
        r = t[s];
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
    let s;
    return function(o) {
        s = n.get(o);
        if (void 0 === s) {
            n.set(o, s = [ r = o ]);
            i = 0;
            while ((r = e(r)) !== t) s[++i] = r;
        }
        return s;
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
    let s = t.length;
    for (;i < s; ++i) {
        e = t[i];
        if ((e = t[i]) instanceof Promise) if (void 0 === n) n = e; else if (void 0 === r) r = [ n, e ]; else r.push(e);
    }
    if (void 0 === r) return n;
    return Promise.all(r);
}

const j = t.getOwn;

const O = t.hasOwn;

const k = t.define;

const I = t => "function" === typeof t;

const M = t => "string" === typeof t;

const T = "au:annotation";

const F = (t, e) => {
    if (void 0 === e) return `${T}:${t}`;
    return `${T}:${t}:${e}`;
};

const U = (t, e) => {
    const n = j(T, t);
    if (void 0 === n) k(T, [ e ], t); else n.push(e);
};

const L = Object.freeze({
    name: "au:annotation",
    appendTo: U,
    set(t, e, n) {
        k(F(e), n, t);
    },
    get: (t, e) => j(F(e), t),
    getKeys(t) {
        let e = j(T, t);
        if (void 0 === e) k(T, e = [], t);
        return e;
    },
    isKey: t => t.startsWith(T),
    keyFor: F
});

const P = "au:resource";

const D = Object.freeze({
    name: P,
    appendTo(t, e) {
        const n = j(P, t);
        if (void 0 === n) k(P, [ e ], t); else n.push(e);
    },
    has: t => O(P, t),
    getAll(t) {
        const e = j(P, t);
        if (void 0 === e) return Ot; else return e.map((e => j(e, t)));
    },
    getKeys(t) {
        let e = j(P, t);
        if (void 0 === e) k(P, e = [], t);
        return e;
    },
    isKey: t => t.startsWith(P),
    keyFor(t, e) {
        if (void 0 === e) return `${P}:${t}`;
        return `${P}:${t}:${e}`;
    }
});

const S = {
    annotation: L,
    resource: D
};

const N = Object.prototype.hasOwnProperty;

function W(t, e, n, r) {
    let i = j(F(t), n);
    if (void 0 === i) {
        i = e[t];
        if (void 0 === i) {
            i = n[t];
            if (void 0 === i || !N.call(n, t)) return r();
            return i;
        }
        return i;
    }
    return i;
}

function B(t, e, n) {
    let r = j(F(t), e);
    if (void 0 === r) {
        r = e[t];
        if (void 0 === r || !N.call(e, t)) return n();
        return r;
    }
    return r;
}

function Q(t, e, n) {
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
        return this.registerResolver(3, Ct(t));
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

function x(t) {
    const e = t.slice();
    const n = Object.keys(t);
    const r = n.length;
    let s;
    for (let o = 0; o < r; ++o) {
        s = n[o];
        if (!i(s)) e[s] = t[s];
    }
    return e;
}

const z = {
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
        return new ContainerConfiguration(null !== (e = t.inheritParentResources) && void 0 !== e ? e : false, null !== (n = t.defaultResolver) && void 0 !== n ? n : z.singleton);
    }
}

ContainerConfiguration.DEFAULT = ContainerConfiguration.from({});

const G = {
    createContainer(t) {
        return new Container(null, ContainerConfiguration.from(t));
    },
    getDesignParamtypes(t) {
        return j("design:paramtypes", t);
    },
    getAnnotationParamtypes(t) {
        const e = F("di:paramtypes");
        return j(e, t);
    },
    getOrCreateAnnotationParamTypes: _,
    getDependencies: K,
    createInterface(t, e) {
        const n = I(t) ? t : e;
        const r = M(t) ? t : void 0;
        const i = function(t, e, n) {
            if (null == t || void 0 !== new.target) throw new Error(`AUR0001:${i.friendlyName}`);
            const r = _(t);
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
                const n = _(e);
                const i = t[0];
                if (void 0 !== i) n[r] = i;
            } else if (n) {
                const r = _(e.constructor);
                const i = t[0];
                if (void 0 !== i) r[n] = i;
            } else if (r) {
                const e = r.value;
                const n = _(e);
                let i;
                for (let e = 0; e < t.length; ++e) {
                    i = t[e];
                    if (void 0 !== i) n[e] = i;
                }
            } else {
                const n = _(e);
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
            const r = $t.transient(t, t);
            return r.register(n, t);
        };
        t.registerInRequestor = false;
        return t;
    },
    singleton(t, e = Z) {
        t.register = function e(n) {
            const r = $t.singleton(t, t);
            return r.register(n, t);
        };
        t.registerInRequestor = e.scoped;
        return t;
    }
};

function K(t) {
    const e = F("di:dependencies");
    let n = j(e, t);
    if (void 0 === n) {
        const r = t.inject;
        if (void 0 === r) {
            const e = G.getDesignParamtypes(t);
            const r = G.getAnnotationParamtypes(t);
            if (void 0 === e) if (void 0 === r) {
                const e = Object.getPrototypeOf(t);
                if (I(e) && e !== Function.prototype) n = x(K(e)); else n = [];
            } else n = x(r); else if (void 0 === r) n = x(e); else {
                n = x(e);
                let t = r.length;
                let s;
                let o = 0;
                for (;o < t; ++o) {
                    s = r[o];
                    if (void 0 !== s) n[o] = s;
                }
                const u = Object.keys(r);
                let l;
                o = 0;
                t = u.length;
                for (o = 0; o < t; ++o) {
                    l = u[o];
                    if (!i(l)) n[l] = r[l];
                }
            }
        } else n = x(r);
        k(e, n, t);
        U(t, e);
    }
    return n;
}

function _(t) {
    const e = F("di:paramtypes");
    let n = j(e, t);
    if (void 0 === n) {
        k(e, n = [], t);
        U(t, e);
    }
    return n;
}

const H = G.createInterface("IContainer");

const V = H;

function q(t) {
    return function(e) {
        const n = function(t, e, r) {
            G.inject(n)(t, e, r);
        };
        n.$isResolver = true;
        n.resolve = function(n, r) {
            return t(e, n, r);
        };
        return n;
    };
}

const J = G.inject;

function X(t) {
    return G.transient(t);
}

function Y(t) {
    return null == t ? X : X(t);
}

const Z = {
    scoped: false
};

function tt(t) {
    if (I(t)) return G.singleton(t);
    return function(e) {
        return G.singleton(e, t);
    };
}

function et(t) {
    return function(e, n) {
        n = !!n;
        const r = function(t, e, n) {
            G.inject(r)(t, e, n);
        };
        r.$isResolver = true;
        r.resolve = function(r, i) {
            return t(e, r, i, n);
        };
        return r;
    };
}

const nt = et(((t, e, n, r) => n.getAll(t, r)));

const rt = q(((t, e, n) => () => n.get(t)));

const it = q(((t, e, n) => {
    if (n.has(t, true)) return n.get(t); else return;
}));

function st(t, e, n) {
    G.inject(st)(t, e, n);
}

st.$isResolver = true;

st.resolve = () => {};

const ot = q(((t, e, n) => (...r) => e.getFactory(t).construct(n, r)));

const ut = q(((t, e, n) => {
    const r = ct(t, e, n);
    const i = new InstanceProvider(String(t), r);
    n.registerResolver(t, i, true);
    return r;
}));

const lt = q(((t, e, n) => ct(t, e, n)));

function ct(t, e, n) {
    return e.getFactory(t).construct(n);
}

var ft;

(function(t) {
    t[t["instance"] = 0] = "instance";
    t[t["singleton"] = 1] = "singleton";
    t[t["transient"] = 2] = "transient";
    t[t["callback"] = 3] = "callback";
    t[t["array"] = 4] = "array";
    t[t["alias"] = 5] = "alias";
})(ft || (ft = {}));

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

function at(t) {
    return this.get(t);
}

function ht(t, e) {
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
        if (void 0 === e) n = new this.Type(...this.dependencies.map(at, t)); else n = new this.Type(...this.dependencies.map(at, t), ...e);
        if (null == this.transformers) return n;
        return this.transformers.reduce(ht, n);
    }
    registerTransformer(t) {
        var e;
        (null !== (e = this.transformers) && void 0 !== e ? e : this.transformers = []).push(t);
    }
}

const dt = {
    $isResolver: true,
    resolve(t, e) {
        return e;
    }
};

function vt(t) {
    return I(t.register);
}

function wt(t) {
    return vt(t) && "boolean" === typeof t.registerInRequestor;
}

function gt(t) {
    return wt(t) && t.registerInRequestor;
}

function mt(t) {
    return void 0 !== t.prototype;
}

function pt(t) {
    return M(t) && t.indexOf(":") > 0;
}

const yt = new Set([ "Array", "ArrayBuffer", "Boolean", "DataView", "Date", "Error", "EvalError", "Float32Array", "Float64Array", "Function", "Int8Array", "Int16Array", "Int32Array", "Map", "Number", "Object", "Promise", "RangeError", "ReferenceError", "RegExp", "Set", "SharedArrayBuffer", "String", "SyntaxError", "TypeError", "Uint8Array", "Uint8ClampedArray", "Uint16Array", "Uint32Array", "URIError", "WeakMap", "WeakSet" ]);

let Rt = 0;

class Container {
    constructor(t, e) {
        this.parent = t;
        this.config = e;
        this.id = ++Rt;
        this.t = 0;
        this.i = new Map;
        if (null === t) {
            this.root = this;
            this.u = new Map;
            this.h = new Map;
            this.res = Object.create(null);
        } else {
            this.root = t.root;
            this.u = new Map;
            this.h = t.h;
            if (e.inheritParentResources) this.res = Object.assign(Object.create(null), t.res, this.root.res); else this.res = Object.create(null);
        }
        this.u.set(H, dt);
    }
    get depth() {
        return null === this.parent ? 0 : this.parent.depth + 1;
    }
    register(...t) {
        if (100 === ++this.t) throw new Error(`AUR0006:${t.map(String)}`);
        let e;
        let r;
        let i;
        let s;
        let o;
        let u = 0;
        let l = t.length;
        for (;u < l; ++u) {
            e = t[u];
            if (!n(e)) continue;
            if (vt(e)) e.register(this); else if (S.resource.has(e)) {
                const t = S.resource.getAll(e);
                if (1 === t.length) t[0].register(this); else {
                    s = 0;
                    o = t.length;
                    while (o > s) {
                        t[s].register(this);
                        ++s;
                    }
                }
            } else if (mt(e)) $t.singleton(e, e).register(this); else {
                r = Object.keys(e);
                s = 0;
                o = r.length;
                for (;s < o; ++s) {
                    i = e[r[s]];
                    if (!n(i)) continue;
                    if (vt(i)) i.register(this); else this.register(i);
                }
            }
        }
        --this.t;
        return this;
    }
    registerResolver(t, e, n = false) {
        Et(t);
        const r = this.u;
        const i = r.get(t);
        if (null == i) {
            r.set(t, e);
            if (pt(t)) {
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
        Et(t);
        if (void 0 !== t.resolve) return t;
        let n = this;
        let r;
        while (null != n) {
            r = n.u.get(t);
            if (null == r) {
                if (null == n.parent) {
                    const r = gt(t) ? this : n;
                    return e ? this.R(t, r) : null;
                }
                n = n.parent;
            } else return r;
        }
        return null;
    }
    has(t, e = false) {
        return this.u.has(t) ? true : e && null != this.parent ? this.parent.has(t, true) : false;
    }
    get(t) {
        Et(t);
        if (t.$isResolver) return t.resolve(this, this);
        let e = this;
        let n;
        while (null != e) {
            n = e.u.get(t);
            if (null == n) {
                if (null == e.parent) {
                    const r = gt(t) ? this : e;
                    n = this.R(t, r);
                    return n.resolve(e, this);
                }
                e = e.parent;
            } else return n.resolve(e, this);
        }
        throw new Error(`AUR0008:${t}`);
    }
    getAll(t, e = false) {
        Et(t);
        const n = this;
        let r = n;
        let i;
        if (e) {
            let e = Ot;
            while (null != r) {
                i = r.u.get(t);
                if (null != i) e = e.concat(At(i, r, n));
                r = r.parent;
            }
            return e;
        } else while (null != r) {
            i = r.u.get(t);
            if (null == i) {
                r = r.parent;
                if (null == r) return Ot;
            } else return At(i, r, n);
        }
        return Ot;
    }
    invoke(t, e) {
        if ($(t)) throw jt(t);
        if (void 0 === e) return new t(...K(t).map(at, this)); else return new t(...K(t).map(at, this), ...e);
    }
    getFactory(t) {
        let e = this.h.get(t);
        if (void 0 === e) {
            if ($(t)) throw jt(t);
            this.h.set(t, e = new Factory(t, K(t)));
        }
        return e;
    }
    registerFactory(t, e) {
        this.h.set(t, e);
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
        const t = this.u;
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
        if (I(r.getFactory)) {
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
        let s = this.res[i];
        if (void 0 === s) {
            s = this.root.res[i];
            if (void 0 === s) return null;
            return null !== (n = s.resolve(this.root, this)) && void 0 !== n ? n : null;
        }
        return null !== (r = s.resolve(this, this)) && void 0 !== r ? r : null;
    }
    dispose() {
        if (this.i.size > 0) this.disposeResolvers();
        this.u.clear();
    }
    R(t, e) {
        if (!I(t)) throw new Error(`AUR0009:${t}`);
        if (yt.has(t.name)) throw new Error(`AUR0010:${t.name}`);
        if (vt(t)) {
            const n = t.register(e, t);
            if (!(n instanceof Object) || null == n.resolve) {
                const n = e.u.get(t);
                if (void 0 != n) return n;
                throw new Error(`AUR0011`);
            }
            return n;
        } else if (S.resource.has(t)) {
            const n = S.resource.getAll(t);
            if (1 === n.length) n[0].register(e); else {
                const t = n.length;
                for (let r = 0; r < t; ++r) n[r].register(e);
            }
            const r = e.u.get(t);
            if (void 0 != r) return r;
            throw new Error(`AUR0011`);
        } else if (t.$isInterface) throw new Error(`AUR0012:${t.friendlyName}`); else {
            const n = this.config.defaultResolver(t, e);
            e.u.set(t, n);
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

const bt = new WeakMap;

function Ct(t) {
    return function(e, n, r) {
        let i = bt.get(e);
        if (void 0 === i) bt.set(e, i = new WeakMap);
        if (i.has(r)) return i.get(r);
        const s = t(e, n, r);
        i.set(r, s);
        return s;
    };
}

const $t = {
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
        return new Resolver(t, 3, Ct(e));
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
        this.C = null;
        this.$ = t;
        if (void 0 !== e) this.C = e;
    }
    get friendlyName() {
        return this.$;
    }
    prepare(t) {
        this.C = t;
    }
    get $isResolver() {
        return true;
    }
    resolve() {
        if (null == this.C) throw new Error(`AUR0013:${this.$}`);
        return this.C;
    }
    dispose() {
        this.C = null;
    }
}

function Et(t) {
    if (null === t || void 0 === t) throw new Error(`AUR0014`);
}

function At(t, e, n) {
    if (t instanceof Resolver && 4 === t.strategy) {
        const r = t.state;
        let i = r.length;
        const s = new Array(i);
        while (i--) s[i] = r[i].resolve(e, n);
        return s;
    }
    return [ t.resolve(e, n) ];
}

function jt(t) {
    return new Error(`AUR0015:${t.name}`);
}

const Ot = Object.freeze([]);

const kt = Object.freeze({});

function It() {}

const Mt = G.createInterface("IPlatform");

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
***************************************************************************** */ function Tt(t, e, n, r) {
    var i = arguments.length, s = i < 3 ? e : null === r ? r = Object.getOwnPropertyDescriptor(e, n) : r, o;
    if ("object" === typeof Reflect && "function" === typeof Reflect.decorate) s = Reflect.decorate(t, e, n, r); else for (var u = t.length - 1; u >= 0; u--) if (o = t[u]) s = (i < 3 ? o(s) : i > 3 ? o(e, n, s) : o(e, n)) || s;
    return i > 3 && s && Object.defineProperty(e, n, s), s;
}

function Ft(t, e) {
    return function(n, r) {
        e(n, r, t);
    };
}

var Ut;

(function(t) {
    t[t["trace"] = 0] = "trace";
    t[t["debug"] = 1] = "debug";
    t[t["info"] = 2] = "info";
    t[t["warn"] = 3] = "warn";
    t[t["error"] = 4] = "error";
    t[t["fatal"] = 5] = "fatal";
    t[t["none"] = 6] = "none";
})(Ut || (Ut = {}));

var Lt;

(function(t) {
    t[t["noColors"] = 0] = "noColors";
    t[t["colors"] = 1] = "colors";
})(Lt || (Lt = {}));

const Pt = G.createInterface("ILogConfig", (t => t.instance(new LogConfig(0, 3))));

const Dt = G.createInterface("ISink");

const St = G.createInterface("ILogEventFactory", (t => t.singleton(_t)));

const Nt = G.createInterface("ILogger", (t => t.singleton(Vt)));

const Wt = G.createInterface("ILogScope");

const Bt = Object.freeze({
    key: F("logger-sink-handles"),
    define(t, e) {
        k(this.key, e.handles, t.prototype);
        return t;
    },
    getHandles(e) {
        return t.get(this.key, e);
    }
});

function Qt(t) {
    return function(e) {
        return Bt.define(e, t);
    };
}

const xt = C({
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

const zt = function() {
    const t = [ C({
        TRC: "TRC",
        DBG: "DBG",
        INF: "INF",
        WRN: "WRN",
        ERR: "ERR",
        FTL: "FTL",
        QQQ: "???"
    }), C({
        TRC: xt.grey("TRC"),
        DBG: xt.grey("DBG"),
        INF: xt.white("INF"),
        WRN: xt.yellow("WRN"),
        ERR: xt.red("ERR"),
        FTL: xt.red("FTL"),
        QQQ: xt.grey("???")
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

function Gt(t, e) {
    if (0 === e) return t.join(".");
    return t.map(xt.cyan).join(".");
}

function Kt(t, e) {
    if (0 === e) return new Date(t).toISOString();
    return xt.grey(new Date(t).toISOString());
}

class DefaultLogEvent {
    constructor(t, e, n, r, i, s) {
        this.severity = t;
        this.message = e;
        this.optionalParams = n;
        this.scope = r;
        this.colorOptions = i;
        this.timestamp = s;
    }
    toString() {
        const {severity: t, message: e, scope: n, colorOptions: r, timestamp: i} = this;
        if (0 === n.length) return `${Kt(i, r)} [${zt(t, r)}] ${e}`;
        return `${Kt(i, r)} [${zt(t, r)} ${Gt(n, r)}] ${e}`;
    }
}

let _t = class DefaultLogEventFactory {
    constructor(t) {
        this.config = t;
    }
    createLogEvent(t, e, n, r) {
        return new DefaultLogEvent(e, n, r, t.scope, this.config.colorOptions, Date.now());
    }
};

_t = Tt([ Ft(0, Pt) ], _t);

let Ht = class ConsoleSink {
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
        $t.singleton(Dt, ConsoleSink).register(t);
    }
};

Ht = Tt([ Ft(0, Mt) ], Ht);

let Vt = class DefaultLogger {
    constructor(t, e, n, r = [], i = null) {
        var s, o, u, l, c, f;
        this.config = t;
        this.factory = e;
        this.scope = r;
        this.scopedLoggers = Object.create(null);
        let a;
        let h;
        let d;
        let v;
        let w;
        let g;
        if (null === i) {
            this.root = this;
            this.parent = this;
            a = this.traceSinks = [];
            h = this.debugSinks = [];
            d = this.infoSinks = [];
            v = this.warnSinks = [];
            w = this.errorSinks = [];
            g = this.fatalSinks = [];
            for (const t of n) {
                const e = Bt.getHandles(t);
                if (null !== (s = null === e || void 0 === e ? void 0 : e.includes(0)) && void 0 !== s ? s : true) a.push(t);
                if (null !== (o = null === e || void 0 === e ? void 0 : e.includes(1)) && void 0 !== o ? o : true) h.push(t);
                if (null !== (u = null === e || void 0 === e ? void 0 : e.includes(2)) && void 0 !== u ? u : true) d.push(t);
                if (null !== (l = null === e || void 0 === e ? void 0 : e.includes(3)) && void 0 !== l ? l : true) v.push(t);
                if (null !== (c = null === e || void 0 === e ? void 0 : e.includes(4)) && void 0 !== c ? c : true) w.push(t);
                if (null !== (f = null === e || void 0 === e ? void 0 : e.includes(5)) && void 0 !== f ? f : true) g.push(t);
            }
        } else {
            this.root = i.root;
            this.parent = i;
            a = this.traceSinks = i.traceSinks;
            h = this.debugSinks = i.debugSinks;
            d = this.infoSinks = i.infoSinks;
            v = this.warnSinks = i.warnSinks;
            w = this.errorSinks = i.errorSinks;
            g = this.fatalSinks = i.fatalSinks;
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
        const i = I(n) ? n() : n;
        const s = this.factory.createLogEvent(this, e, i, r);
        for (let e = 0, n = t.length; e < n; ++e) t[e].handleEvent(s);
    }
};

Tt([ m ], Vt.prototype, "trace", null);

Tt([ m ], Vt.prototype, "debug", null);

Tt([ m ], Vt.prototype, "info", null);

Tt([ m ], Vt.prototype, "warn", null);

Tt([ m ], Vt.prototype, "error", null);

Tt([ m ], Vt.prototype, "fatal", null);

Vt = Tt([ Ft(0, Pt), Ft(1, St), Ft(2, nt(Dt)), Ft(3, it(Wt)), Ft(4, st) ], Vt);

const qt = C({
    create({level: t = 3, colorOptions: e = 0, sinks: n = []} = {}) {
        return C({
            register(r) {
                r.register($t.instance(Pt, new LogConfig(e, t)));
                for (const t of n) if (I(t)) r.register($t.singleton(Dt, t)); else r.register(t);
                return r;
            }
        });
    }
});

const Jt = G.createInterface((t => t.singleton(ModuleLoader)));

function Xt(t) {
    return t;
}

class ModuleTransformer {
    constructor(t) {
        this.$transform = t;
        this.A = new Map;
        this.j = new Map;
    }
    transform(t) {
        if (t instanceof Promise) return this.O(t); else if ("object" === typeof t && null !== t) return this.I(t); else throw new Error(`Invalid input: ${String(t)}. Expected Promise or Object.`);
    }
    O(t) {
        if (this.A.has(t)) return this.A.get(t);
        const e = t.then((t => this.I(t)));
        this.A.set(t, e);
        void e.then((e => {
            this.A.set(t, e);
        }));
        return e;
    }
    I(t) {
        if (this.j.has(t)) return this.j.get(t);
        const e = this.$transform(this.M(t));
        this.j.set(t, e);
        if (e instanceof Promise) void e.then((e => {
            this.j.set(t, e);
        }));
        return e;
    }
    M(t) {
        let e;
        let n;
        let r;
        let i;
        const s = [];
        for (const o in t) {
            switch (typeof (e = t[o])) {
              case "object":
                if (null === e) continue;
                n = I(e.register);
                r = false;
                i = Ot;
                break;

              case "function":
                n = I(e.register);
                r = void 0 !== e.prototype;
                i = S.resource.getAll(e);
                break;

              default:
                continue;
            }
            s.push(new ModuleItem(o, e, n, r, i));
        }
        return new AnalyzedModule(t, s);
    }
}

class ModuleLoader {
    constructor() {
        this.transformers = new Map;
    }
    load(t, e = Xt) {
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

const Yt = G.createInterface("IEventAggregator", (t => t.singleton(EventAggregator)));

class EventAggregator {
    constructor() {
        this.eventLookup = {};
        this.messageHandlers = [];
    }
    publish(t, e) {
        if (!t) throw new Error(`Invalid channel name or instance: ${t}.`);
        if (M(t)) {
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
        if (M(t)) {
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

export { AnalyzedModule, Lt as ColorOptions, Ht as ConsoleSink, ContainerConfiguration, G as DI, DefaultLogEvent, _t as DefaultLogEventFactory, Vt as DefaultLogger, z as DefaultResolver, EventAggregator, H as IContainer, Yt as IEventAggregator, Pt as ILogConfig, St as ILogEventFactory, Nt as ILogger, Jt as IModuleLoader, Mt as IPlatform, V as IServiceLocator, Dt as ISink, InstanceProvider, LogConfig, Ut as LogLevel, qt as LoggerConfiguration, ModuleItem, S as Protocol, $t as Registration, nt as all, m as bound, l as camelCase, w as compareNumber, Ot as emptyArray, kt as emptyObject, ot as factory, R as firstDefined, xt as format, W as fromAnnotationOrDefinitionOrTypeOrDefault, B as fromAnnotationOrTypeOrDefault, Q as fromDefinitionOrDefault, b as getPrototypeChain, st as ignore, J as inject, i as isArrayIndex, $ as isNativeFunction, s as isNumberOrBigInt, o as isStringOrDate, f as kebabCase, rt as lazy, p as mergeArrays, g as mergeDistinct, y as mergeObjects, ut as newInstanceForScope, lt as newInstanceOf, d as nextId, It as noop, E as onResolve, it as optional, c as pascalCase, v as resetId, A as resolveAll, tt as singleton, Qt as sink, a as toArray, Y as transient };
//# sourceMappingURL=index.js.map
