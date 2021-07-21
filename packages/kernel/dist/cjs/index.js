"use strict";

Object.defineProperty(exports, "t", {
    value: true
});

var t = require("@aurelia/metadata");

var e = require("@aurelia/platform");

const r = {};

function n(t) {
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

function i(t) {
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

const s = function() {
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
    function r(t) {
        if ("" === t) return 0;
        if (t !== t.toUpperCase()) return 3;
        if (t !== t.toLowerCase()) return 2;
        if (true === e[t]) return 1;
        return 0;
    }
    return function(t, e) {
        const n = t.length;
        if (0 === n) return t;
        let i = false;
        let o = "";
        let s;
        let u = "";
        let l = 0;
        let c = t.charAt(0);
        let f = r(c);
        let a = 0;
        for (;a < n; ++a) {
            s = l;
            u = c;
            l = f;
            c = t.charAt(a + 1);
            f = r(c);
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

const u = function() {
    const t = Object.create(null);
    function e(t, e) {
        return e ? t.toUpperCase() : t.toLowerCase();
    }
    return function(r) {
        let n = t[r];
        if (void 0 === n) n = t[r] = s(r, e);
        return n;
    };
}();

const l = function() {
    const t = Object.create(null);
    return function(e) {
        let r = t[e];
        if (void 0 === r) {
            r = u(e);
            if (r.length > 0) r = r[0].toUpperCase() + r.slice(1);
            t[e] = r;
        }
        return r;
    };
}();

const c = function() {
    const t = Object.create(null);
    function e(t, e) {
        return e ? `-${t.toLowerCase()}` : t.toLowerCase();
    }
    return function(r) {
        let n = t[r];
        if (void 0 === n) n = t[r] = s(r, e);
        return n;
    };
}();

function f(t) {
    const {length: e} = t;
    const r = Array(e);
    let n = 0;
    for (;n < e; ++n) r[n] = t[n];
    return r;
}

const a = {};

function h(t) {
    if (void 0 === a[t]) a[t] = 0;
    return ++a[t];
}

function d(t) {
    a[t] = 0;
}

function p(t, e) {
    return t - e;
}

function v(t, e, r) {
    if (void 0 === t || null === t || t === Rt) if (void 0 === e || null === e || e === Rt) return Rt; else return r ? e.slice(0) : e; else if (void 0 === e || null === e || e === Rt) return r ? t.slice(0) : t;
    const n = {};
    const i = r ? t.slice(0) : t;
    let o = t.length;
    let s = e.length;
    while (o-- > 0) n[t[o]] = true;
    let u;
    while (s-- > 0) {
        u = e[s];
        if (void 0 === n[u]) {
            i.push(u);
            n[u] = true;
        }
    }
    return i;
}

function g(t, e, r) {
    return {
        configurable: true,
        enumerable: r.enumerable,
        get() {
            const t = r.value.bind(this);
            Reflect.defineProperty(this, e, {
                value: t,
                writable: true,
                configurable: true,
                enumerable: r.enumerable
            });
            return t;
        }
    };
}

function w(...t) {
    const e = [];
    let r = 0;
    const n = t.length;
    let i = 0;
    let o;
    let s = 0;
    for (;s < n; ++s) {
        o = t[s];
        if (void 0 !== o) {
            i = o.length;
            let t = 0;
            for (;t < i; ++t) e[r++] = o[t];
        }
    }
    return e;
}

function x(...t) {
    const e = {};
    const r = t.length;
    let n;
    let i;
    let o = 0;
    for (;r > o; ++o) {
        n = t[o];
        if (void 0 !== n) for (i in n) e[i] = n[i];
    }
    return e;
}

function y(...t) {
    const e = t.length;
    let r;
    let n = 0;
    for (;e > n; ++n) {
        r = t[n];
        if (void 0 !== r) return r;
    }
    throw new Error(`No default value found`);
}

const R = function() {
    const t = Function.prototype;
    const e = Object.getPrototypeOf;
    const r = new WeakMap;
    let n = t;
    let i = 0;
    let o;
    return function(s) {
        o = r.get(s);
        if (void 0 === o) {
            r.set(s, o = [ n = s ]);
            i = 0;
            while ((n = e(n)) !== t) o[++i] = n;
        }
        return o;
    };
}();

function m(...t) {
    return Object.assign(Object.create(null), ...t);
}

const b = function() {
    const t = new WeakMap;
    let e = false;
    let r = "";
    let n = 0;
    return function(i) {
        e = t.get(i);
        if (void 0 === e) {
            r = i.toString();
            n = r.length;
            e = n >= 29 && n <= 100 && 125 === r.charCodeAt(n - 1) && r.charCodeAt(n - 2) <= 32 && 93 === r.charCodeAt(n - 3) && 101 === r.charCodeAt(n - 4) && 100 === r.charCodeAt(n - 5) && 111 === r.charCodeAt(n - 6) && 99 === r.charCodeAt(n - 7) && 32 === r.charCodeAt(n - 8) && 101 === r.charCodeAt(n - 9) && 118 === r.charCodeAt(n - 10) && 105 === r.charCodeAt(n - 11) && 116 === r.charCodeAt(n - 12) && 97 === r.charCodeAt(n - 13) && 110 === r.charCodeAt(n - 14) && 88 === r.charCodeAt(n - 15);
            t.set(i, e);
        }
        return e;
    };
}();

function C(t, e) {
    if (t instanceof Promise) return t.then(e);
    return e(t);
}

function $(...t) {
    let e;
    let r;
    let n;
    let i = 0;
    let o = t.length;
    for (;i < o; ++i) {
        e = t[i];
        if ((e = t[i]) instanceof Promise) if (void 0 === r) r = e; else if (void 0 === n) n = [ r, e ]; else n.push(e);
    }
    if (void 0 === n) return r;
    return Promise.all(n);
}

const E = "au:annotation";

const A = {
    name: "au:annotation",
    appendTo(e, r) {
        const n = t.Metadata.getOwn(E, e);
        if (void 0 === n) t.Metadata.define(E, [ r ], e); else n.push(r);
    },
    set(e, r, n) {
        t.Metadata.define(A.keyFor(r), n, e);
    },
    get(e, r) {
        return t.Metadata.getOwn(A.keyFor(r), e);
    },
    getKeys(e) {
        let r = t.Metadata.getOwn(E, e);
        if (void 0 === r) t.Metadata.define(E, r = [], e);
        return r;
    },
    isKey(t) {
        return t.startsWith(E);
    },
    keyFor(t, e) {
        if (void 0 === e) return `${E}:${t}`;
        return `${E}:${t}:${e}`;
    }
};

const j = "au:resource";

const O = Object.freeze({
    name: j,
    appendTo(e, r) {
        const n = t.Metadata.getOwn(j, e);
        if (void 0 === n) t.Metadata.define(j, [ r ], e); else n.push(r);
    },
    has(e) {
        return t.Metadata.hasOwn(j, e);
    },
    getAll(e) {
        const r = t.Metadata.getOwn(j, e);
        if (void 0 === r) return Rt; else return r.map((r => t.Metadata.getOwn(r, e)));
    },
    getKeys(e) {
        let r = t.Metadata.getOwn(j, e);
        if (void 0 === r) t.Metadata.define(j, r = [], e);
        return r;
    },
    isKey(t) {
        return t.startsWith(j);
    },
    keyFor(t, e) {
        if (void 0 === e) return `${j}:${t}`;
        return `${j}:${t}:${e}`;
    }
});

const I = {
    annotation: A,
    resource: O
};

const k = Object.prototype.hasOwnProperty;

function M(e, r, n, i) {
    let o = t.Metadata.getOwn(I.annotation.keyFor(e), n);
    if (void 0 === o) {
        o = r[e];
        if (void 0 === o) {
            o = n[e];
            if (void 0 === o || !k.call(n, e)) return i();
            return o;
        }
        return o;
    }
    return o;
}

function F(e, r, n) {
    let i = t.Metadata.getOwn(I.annotation.keyFor(e), r);
    if (void 0 === i) {
        i = r[e];
        if (void 0 === i || !k.call(r, e)) return n();
        return i;
    }
    return i;
}

function L(t, e, r) {
    const n = e[t];
    if (void 0 === n) return r();
    return n;
}

t.applyMetadataPolyfill(Reflect, false, false);

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
        return this.registerResolver(3, vt(t));
    }
    aliasTo(t) {
        return this.registerResolver(5, t);
    }
    registerResolver(t, e) {
        const {container: r, key: n} = this;
        this.container = this.key = void 0;
        return r.registerResolver(n, new Resolver(n, t, e));
    }
}

function U(t) {
    const e = t.slice();
    const r = Object.keys(t);
    const i = r.length;
    let o;
    for (let s = 0; s < i; ++s) {
        o = r[s];
        if (!n(o)) e[o] = t[o];
    }
    return e;
}

const T = {
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
        var e, r;
        if (void 0 === t || t === ContainerConfiguration.DEFAULT) return ContainerConfiguration.DEFAULT;
        return new ContainerConfiguration(null !== (e = t.inheritParentResources) && void 0 !== e ? e : false, null !== (r = t.defaultResolver) && void 0 !== r ? r : T.singleton);
    }
}

ContainerConfiguration.DEFAULT = ContainerConfiguration.from({});

const D = {
    createContainer(t) {
        return new Container(null, ContainerConfiguration.from(t));
    },
    getDesignParamtypes(e) {
        return t.Metadata.getOwn("design:paramtypes", e);
    },
    getAnnotationParamtypes(e) {
        const r = I.annotation.keyFor("di:paramtypes");
        return t.Metadata.getOwn(r, e);
    },
    getOrCreateAnnotationParamTypes: S,
    getDependencies: P,
    createInterface(t, e) {
        const r = "function" === typeof t ? t : e;
        const n = "string" === typeof t ? t : void 0;
        const i = function(t, e, r) {
            if (null == t || void 0 !== new.target) throw new Error(`AUR0001:${i.friendlyName}`);
            const n = S(t);
            n[r] = i;
        };
        i.$isInterface = true;
        i.friendlyName = null == n ? "(anonymous)" : n;
        if (null != r) i.register = function(t, e) {
            return r(new ResolverBuilder(t, null !== e && void 0 !== e ? e : i));
        };
        i.toString = function t() {
            return `InterfaceSymbol<${i.friendlyName}>`;
        };
        return i;
    },
    inject(...t) {
        return function(e, r, n) {
            if ("number" === typeof n) {
                const r = S(e);
                const i = t[0];
                if (void 0 !== i) r[n] = i;
            } else if (r) {
                const n = S(e.constructor);
                const i = t[0];
                if (void 0 !== i) n[r] = i;
            } else if (n) {
                const e = n.value;
                const r = S(e);
                let i;
                for (let e = 0; e < t.length; ++e) {
                    i = t[e];
                    if (void 0 !== i) r[e] = i;
                }
            } else {
                const r = S(e);
                let n;
                for (let e = 0; e < t.length; ++e) {
                    n = t[e];
                    if (void 0 !== n) r[e] = n;
                }
            }
        };
    },
    transient(t) {
        t.register = function e(r) {
            const n = gt.transient(t, t);
            return n.register(r, t);
        };
        t.registerInRequestor = false;
        return t;
    },
    singleton(t, e = G) {
        t.register = function e(r) {
            const n = gt.singleton(t, t);
            return n.register(r, t);
        };
        t.registerInRequestor = e.scoped;
        return t;
    }
};

function P(e) {
    const r = I.annotation.keyFor("di:dependencies");
    let i = t.Metadata.getOwn(r, e);
    if (void 0 === i) {
        const o = e.inject;
        if (void 0 === o) {
            const t = D.getDesignParamtypes(e);
            const r = D.getAnnotationParamtypes(e);
            if (void 0 === t) if (void 0 === r) {
                const t = Object.getPrototypeOf(e);
                if ("function" === typeof t && t !== Function.prototype) i = U(P(t)); else i = [];
            } else i = U(r); else if (void 0 === r) i = U(t); else {
                i = U(t);
                let e = r.length;
                let o;
                let s = 0;
                for (;s < e; ++s) {
                    o = r[s];
                    if (void 0 !== o) i[s] = o;
                }
                const u = Object.keys(r);
                let l;
                s = 0;
                e = u.length;
                for (s = 0; s < e; ++s) {
                    l = u[s];
                    if (!n(l)) i[l] = r[l];
                }
            }
        } else i = U(o);
        t.Metadata.define(r, i, e);
        I.annotation.appendTo(e, r);
    }
    return i;
}

function S(e) {
    const r = I.annotation.keyFor("di:paramtypes");
    let n = t.Metadata.getOwn(r, e);
    if (void 0 === n) {
        t.Metadata.define(r, n = [], e);
        I.annotation.appendTo(e, r);
    }
    return n;
}

const N = D.createInterface("IContainer");

const W = N;

function B(t) {
    return function(e) {
        const r = function(t, e, n) {
            D.inject(r)(t, e, n);
        };
        r.$isResolver = true;
        r.resolve = function(r, n) {
            return t(e, r, n);
        };
        return r;
    };
}

const z = D.inject;

function Q(t) {
    return D.transient(t);
}

function _(t) {
    return null == t ? Q : Q(t);
}

const G = {
    scoped: false
};

function K(t) {
    if ("function" === typeof t) return D.singleton(t);
    return function(e) {
        return D.singleton(e, t);
    };
}

function H(t) {
    return function(e, r) {
        r = !!r;
        const n = function(t, e, r) {
            D.inject(n)(t, e, r);
        };
        n.$isResolver = true;
        n.resolve = function(n, i) {
            return t(e, n, i, r);
        };
        return n;
    };
}

const q = H(((t, e, r, n) => r.getAll(t, n)));

const V = B(((t, e, r) => () => r.get(t)));

const J = B(((t, e, r) => {
    if (r.has(t, true)) return r.get(t); else return;
}));

function X(t, e, r) {
    D.inject(X)(t, e, r);
}

X.$isResolver = true;

X.resolve = () => {};

const Y = B(((t, e, r) => (...n) => e.getFactory(t).construct(r, n)));

const Z = B(((t, e, r) => {
    const n = et(t, e, r);
    const i = new InstanceProvider(String(t), n);
    r.registerResolver(t, i);
    return n;
}));

const tt = B(((t, e, r) => et(t, e, r)));

function et(t, e, r) {
    return e.getFactory(t).construct(r);
}

var rt;

(function(t) {
    t[t["instance"] = 0] = "instance";
    t[t["singleton"] = 1] = "singleton";
    t[t["transient"] = 2] = "transient";
    t[t["callback"] = 3] = "callback";
    t[t["array"] = 4] = "array";
    t[t["alias"] = 5] = "alias";
})(rt || (rt = {}));

class Resolver {
    constructor(t, e, r) {
        this.key = t;
        this.strategy = e;
        this.state = r;
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
                const r = t.getFactory(this.state);
                if (null === r) throw new Error(`AUR0004:${String(this.key)}`);
                return r.construct(e);
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
        var e, r, n;
        switch (this.strategy) {
          case 1:
          case 2:
            return t.getFactory(this.state);

          case 5:
            return null !== (n = null === (r = null === (e = t.getResolver(this.state)) || void 0 === e ? void 0 : e.getFactory) || void 0 === r ? void 0 : r.call(e, t)) && void 0 !== n ? n : null;

          default:
            return null;
        }
    }
}

function nt(t) {
    return this.get(t);
}

function it(t, e) {
    return e(t);
}

class Factory {
    constructor(t, e) {
        this.Type = t;
        this.dependencies = e;
        this.transformers = null;
    }
    construct(t, e) {
        let r;
        if (void 0 === e) r = new this.Type(...this.dependencies.map(nt, t)); else r = new this.Type(...this.dependencies.map(nt, t), ...e);
        if (null == this.transformers) return r;
        return this.transformers.reduce(it, r);
    }
    registerTransformer(t) {
        var e;
        (null !== (e = this.transformers) && void 0 !== e ? e : this.transformers = []).push(t);
    }
}

const ot = {
    $isResolver: true,
    resolve(t, e) {
        return e;
    }
};

function st(t) {
    return "function" === typeof t.register;
}

function ut(t) {
    return st(t) && "boolean" === typeof t.registerInRequestor;
}

function lt(t) {
    return ut(t) && t.registerInRequestor;
}

function ct(t) {
    return void 0 !== t.prototype;
}

function ft(t) {
    return "string" === typeof t && t.indexOf(":") > 0;
}

const at = new Set([ "Array", "ArrayBuffer", "Boolean", "DataView", "Date", "Error", "EvalError", "Float32Array", "Float64Array", "Function", "Int8Array", "Int16Array", "Int32Array", "Map", "Number", "Object", "Promise", "RangeError", "ReferenceError", "RegExp", "Set", "SharedArrayBuffer", "String", "SyntaxError", "TypeError", "Uint8Array", "Uint8ClampedArray", "Uint16Array", "Uint32Array", "URIError", "WeakMap", "WeakSet" ]);

const ht = "di:factory";

I.annotation.keyFor(ht);

let dt = 0;

class Container {
    constructor(t, e) {
        this.parent = t;
        this.config = e;
        this.id = ++dt;
        this.i = 0;
        this.o = new Set;
        if (null === t) {
            this.root = this;
            this.u = new Map;
            this.l = new Map;
            this.res = Object.create(null);
        } else {
            this.root = t.root;
            this.u = new Map;
            this.l = t.l;
            if (e.inheritParentResources) this.res = Object.assign(Object.create(null), t.res, this.root.res); else this.res = Object.create(null);
        }
        this.u.set(N, ot);
    }
    get depth() {
        return null === this.parent ? 0 : this.parent.depth + 1;
    }
    register(...e) {
        if (100 === ++this.i) throw new Error(`AUR0006:${e.map(String)}`);
        let r;
        let n;
        let i;
        let o;
        let s;
        let u = 0;
        let l = e.length;
        for (;u < l; ++u) {
            r = e[u];
            if (!t.isObject(r)) continue;
            if (st(r)) r.register(this); else if (I.resource.has(r)) {
                const t = I.resource.getAll(r);
                if (1 === t.length) t[0].register(this); else {
                    o = 0;
                    s = t.length;
                    while (s > o) {
                        t[o].register(this);
                        ++o;
                    }
                }
            } else if (ct(r)) gt.singleton(r, r).register(this); else {
                n = Object.keys(r);
                o = 0;
                s = n.length;
                for (;o < s; ++o) {
                    i = r[n[o]];
                    if (!t.isObject(i)) continue;
                    if (st(i)) i.register(this); else this.register(i);
                }
            }
        }
        --this.i;
        return this;
    }
    registerResolver(t, e, r = false) {
        wt(t);
        const n = this.u;
        const i = n.get(t);
        if (null == i) {
            n.set(t, e);
            if (ft(t)) {
                if (void 0 !== this.res[t]) throw new Error(`AUR0007:${t}`);
                this.res[t] = e;
            }
        } else if (i instanceof Resolver && 4 === i.strategy) i.state.push(e); else n.set(t, new Resolver(t, 4, [ i, e ]));
        if (r) this.o.add(e);
        return e;
    }
    registerTransformer(t, e) {
        const r = this.getResolver(t);
        if (null == r) return false;
        if (r.getFactory) {
            const t = r.getFactory(this);
            if (null == t) return false;
            t.registerTransformer(e);
            return true;
        }
        return false;
    }
    getResolver(t, e = true) {
        wt(t);
        if (void 0 !== t.resolve) return t;
        let r = this;
        let n;
        while (null != r) {
            n = r.u.get(t);
            if (null == n) {
                if (null == r.parent) {
                    const n = lt(t) ? this : r;
                    return e ? this.h(t, n) : null;
                }
                r = r.parent;
            } else return n;
        }
        return null;
    }
    has(t, e = false) {
        return this.u.has(t) ? true : e && null != this.parent ? this.parent.has(t, true) : false;
    }
    get(t) {
        wt(t);
        if (t.$isResolver) return t.resolve(this, this);
        let e = this;
        let r;
        while (null != e) {
            r = e.u.get(t);
            if (null == r) {
                if (null == e.parent) {
                    const n = lt(t) ? this : e;
                    r = this.h(t, n);
                    return r.resolve(e, this);
                }
                e = e.parent;
            } else return r.resolve(e, this);
        }
        throw new Error(`AUR0008:${t}`);
    }
    getAll(t, e = false) {
        wt(t);
        const r = this;
        let n = r;
        let i;
        if (e) {
            let e = Rt;
            while (null != n) {
                i = n.u.get(t);
                if (null != i) e = e.concat(xt(i, n, r));
                n = n.parent;
            }
            return e;
        } else while (null != n) {
            i = n.u.get(t);
            if (null == i) {
                n = n.parent;
                if (null == n) return Rt;
            } else return xt(i, n, r);
        }
        return Rt;
    }
    invoke(t, e) {
        if (b(t)) throw yt(t);
        if (void 0 === e) return new t(...P(t).map(nt, this)); else return new t(...P(t).map(nt, this), ...e);
    }
    getFactory(t) {
        let e = this.l.get(t);
        if (void 0 === e) {
            if (b(t)) throw yt(t);
            this.l.set(t, e = new Factory(t, P(t)));
        }
        return e;
    }
    registerFactory(t, e) {
        this.l.set(t, e);
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
        let t;
        for (t of this.o) t.dispose();
    }
    find(e, r) {
        const n = e.keyFrom(r);
        let i = this.res[n];
        if (void 0 === i) {
            i = this.root.res[n];
            if (void 0 === i) return null;
        }
        if (null === i) return null;
        if ("function" === typeof i.getFactory) {
            const r = i.getFactory(this);
            if (null === r || void 0 === r) return null;
            const n = t.Metadata.getOwn(e.name, r.Type);
            if (void 0 === n) return null;
            return n;
        }
        return null;
    }
    create(t, e) {
        var r, n;
        const i = t.keyFrom(e);
        let o = this.res[i];
        if (void 0 === o) {
            o = this.root.res[i];
            if (void 0 === o) return null;
            return null !== (r = o.resolve(this.root, this)) && void 0 !== r ? r : null;
        }
        return null !== (n = o.resolve(this, this)) && void 0 !== n ? n : null;
    }
    dispose() {
        if (this.o.size > 0) this.disposeResolvers();
        this.u.clear();
    }
    h(t, e) {
        if ("function" !== typeof t) throw new Error(`AUR0009:${t}`);
        if (at.has(t.name)) throw new Error(`AUR0010:${t.name}`);
        if (st(t)) {
            const r = t.register(e, t);
            if (!(r instanceof Object) || null == r.resolve) {
                const r = e.u.get(t);
                if (void 0 != r) return r;
                throw new Error(`AUR0011`);
            }
            return r;
        } else if (I.resource.has(t)) {
            const r = I.resource.getAll(t);
            if (1 === r.length) r[0].register(e); else {
                const t = r.length;
                for (let n = 0; n < t; ++n) r[n].register(e);
            }
            const n = e.u.get(t);
            if (void 0 != n) return n;
            throw new Error(`AUR0011`);
        } else if (t.$isInterface) throw new Error(`AUR0012:${t.friendlyName}`); else {
            const r = this.config.defaultResolver(t, e);
            e.u.set(t, r);
            return r;
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

const pt = new WeakMap;

function vt(t) {
    return function(e, r, n) {
        let i = pt.get(e);
        if (void 0 === i) pt.set(e, i = new WeakMap);
        if (i.has(n)) return i.get(n);
        const o = t(e, r, n);
        i.set(n, o);
        return o;
    };
}

const gt = {
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
        return new Resolver(t, 3, vt(e));
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
        this.p = null;
        this.v = t;
        if (void 0 !== e) this.p = e;
    }
    get friendlyName() {
        return this.v;
    }
    prepare(t) {
        this.p = t;
    }
    get $isResolver() {
        return true;
    }
    resolve() {
        if (null == this.p) throw new Error(`AUR0013:${this.v}`);
        return this.p;
    }
    dispose() {
        this.p = null;
    }
}

function wt(t) {
    if (null === t || void 0 === t) throw new Error(`AUR0014`);
}

function xt(t, e, r) {
    if (t instanceof Resolver && 4 === t.strategy) {
        const n = t.state;
        let i = n.length;
        const o = new Array(i);
        while (i--) o[i] = n[i].resolve(e, r);
        return o;
    }
    return [ t.resolve(e, r) ];
}

function yt(t) {
    return new Error(`AUR0015:${t.name}`);
}

const Rt = Object.freeze([]);

const mt = Object.freeze({});

function bt() {}

const Ct = D.createInterface("IPlatform");

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
***************************************************************************** */ function $t(t, e, r, n) {
    var i = arguments.length, o = i < 3 ? e : null === n ? n = Object.getOwnPropertyDescriptor(e, r) : n, s;
    if ("object" === typeof Reflect && "function" === typeof Reflect.decorate) o = Reflect.decorate(t, e, r, n); else for (var u = t.length - 1; u >= 0; u--) if (s = t[u]) o = (i < 3 ? s(o) : i > 3 ? s(e, r, o) : s(e, r)) || o;
    return i > 3 && o && Object.defineProperty(e, r, o), o;
}

function Et(t, e) {
    return function(r, n) {
        e(r, n, t);
    };
}

exports.LogLevel = void 0;

(function(t) {
    t[t["trace"] = 0] = "trace";
    t[t["debug"] = 1] = "debug";
    t[t["info"] = 2] = "info";
    t[t["warn"] = 3] = "warn";
    t[t["error"] = 4] = "error";
    t[t["fatal"] = 5] = "fatal";
    t[t["none"] = 6] = "none";
})(exports.LogLevel || (exports.LogLevel = {}));

exports.ColorOptions = void 0;

(function(t) {
    t[t["noColors"] = 0] = "noColors";
    t[t["colors"] = 1] = "colors";
})(exports.ColorOptions || (exports.ColorOptions = {}));

const At = D.createInterface("ILogConfig", (t => t.instance(new LogConfig(0, 3))));

const jt = D.createInterface("ISink");

const Ot = D.createInterface("ILogEventFactory", (t => t.singleton(exports.DefaultLogEventFactory)));

const It = D.createInterface("ILogger", (t => t.singleton(exports.DefaultLogger)));

const kt = D.createInterface("ILogScope");

const Mt = Object.freeze({
    key: I.annotation.keyFor("logger-sink-handles"),
    define(e, r) {
        t.Metadata.define(this.key, r.handles, e.prototype);
        return e;
    },
    getHandles(e) {
        return t.Metadata.get(this.key, e);
    }
});

function Ft(t) {
    return function(e) {
        return Mt.define(e, t);
    };
}

const Lt = m({
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

const Ut = function() {
    const t = [ m({
        TRC: "TRC",
        DBG: "DBG",
        INF: "INF",
        WRN: "WRN",
        ERR: "ERR",
        FTL: "FTL",
        QQQ: "???"
    }), m({
        TRC: Lt.grey("TRC"),
        DBG: Lt.grey("DBG"),
        INF: Lt.white("INF"),
        WRN: Lt.yellow("WRN"),
        ERR: Lt.red("ERR"),
        FTL: Lt.red("FTL"),
        QQQ: Lt.grey("???")
    }) ];
    return function(e, r) {
        if (e <= 0) return t[r].TRC;
        if (e <= 1) return t[r].DBG;
        if (e <= 2) return t[r].INF;
        if (e <= 3) return t[r].WRN;
        if (e <= 4) return t[r].ERR;
        if (e <= 5) return t[r].FTL;
        return t[r].QQQ;
    };
}();

function Tt(t, e) {
    if (0 === e) return t.join(".");
    return t.map(Lt.cyan).join(".");
}

function Dt(t, e) {
    if (0 === e) return new Date(t).toISOString();
    return Lt.grey(new Date(t).toISOString());
}

class DefaultLogEvent {
    constructor(t, e, r, n, i, o) {
        this.severity = t;
        this.message = e;
        this.optionalParams = r;
        this.scope = n;
        this.colorOptions = i;
        this.timestamp = o;
    }
    toString() {
        const {severity: t, message: e, scope: r, colorOptions: n, timestamp: i} = this;
        if (0 === r.length) return `${Dt(i, n)} [${Ut(t, n)}] ${e}`;
        return `${Dt(i, n)} [${Ut(t, n)} ${Tt(r, n)}] ${e}`;
    }
}

exports.DefaultLogEventFactory = class DefaultLogEventFactory {
    constructor(t) {
        this.config = t;
    }
    createLogEvent(t, e, r, n) {
        return new DefaultLogEvent(e, r, n, t.scope, this.config.colorOptions, Date.now());
    }
};

exports.DefaultLogEventFactory = $t([ Et(0, At) ], exports.DefaultLogEventFactory);

exports.ConsoleSink = class ConsoleSink {
    constructor(t) {
        const e = t.console;
        this.handleEvent = function t(r) {
            const n = r.optionalParams;
            if (void 0 === n || 0 === n.length) {
                const t = r.toString();
                switch (r.severity) {
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
                let t = r.toString();
                let i = 0;
                while (t.includes("%s")) t = t.replace("%s", String(n[i++]));
                switch (r.severity) {
                  case 0:
                  case 1:
                    return e.debug(t, ...n.slice(i));

                  case 2:
                    return e.info(t, ...n.slice(i));

                  case 3:
                    return e.warn(t, ...n.slice(i));

                  case 4:
                  case 5:
                    return e.error(t, ...n.slice(i));
                }
            }
        };
    }
    static register(t) {
        gt.singleton(jt, ConsoleSink).register(t);
    }
};

exports.ConsoleSink = $t([ Et(0, Ct) ], exports.ConsoleSink);

exports.DefaultLogger = class DefaultLogger {
    constructor(t, e, r, n = [], i = null) {
        var o, s, u, l, c, f;
        this.config = t;
        this.factory = e;
        this.scope = n;
        this.scopedLoggers = Object.create(null);
        let a;
        let h;
        let d;
        let p;
        let v;
        let g;
        if (null === i) {
            this.root = this;
            this.parent = this;
            a = this.traceSinks = [];
            h = this.debugSinks = [];
            d = this.infoSinks = [];
            p = this.warnSinks = [];
            v = this.errorSinks = [];
            g = this.fatalSinks = [];
            for (const t of r) {
                const e = Mt.getHandles(t);
                if (null !== (o = null === e || void 0 === e ? void 0 : e.includes(0)) && void 0 !== o ? o : true) a.push(t);
                if (null !== (s = null === e || void 0 === e ? void 0 : e.includes(1)) && void 0 !== s ? s : true) h.push(t);
                if (null !== (u = null === e || void 0 === e ? void 0 : e.includes(2)) && void 0 !== u ? u : true) d.push(t);
                if (null !== (l = null === e || void 0 === e ? void 0 : e.includes(3)) && void 0 !== l ? l : true) p.push(t);
                if (null !== (c = null === e || void 0 === e ? void 0 : e.includes(4)) && void 0 !== c ? c : true) v.push(t);
                if (null !== (f = null === e || void 0 === e ? void 0 : e.includes(5)) && void 0 !== f ? f : true) g.push(t);
            }
        } else {
            this.root = i.root;
            this.parent = i;
            a = this.traceSinks = i.traceSinks;
            h = this.debugSinks = i.debugSinks;
            d = this.infoSinks = i.infoSinks;
            p = this.warnSinks = i.warnSinks;
            v = this.errorSinks = i.errorSinks;
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
        let r = e[t];
        if (void 0 === r) r = e[t] = new DefaultLogger(this.config, this.factory, void 0, this.scope.concat(t), this);
        return r;
    }
    emit(t, e, r, n) {
        const i = "function" === typeof r ? r() : r;
        const o = this.factory.createLogEvent(this, e, i, n);
        for (let e = 0, r = t.length; e < r; ++e) t[e].handleEvent(o);
    }
};

$t([ g ], exports.DefaultLogger.prototype, "trace", null);

$t([ g ], exports.DefaultLogger.prototype, "debug", null);

$t([ g ], exports.DefaultLogger.prototype, "info", null);

$t([ g ], exports.DefaultLogger.prototype, "warn", null);

$t([ g ], exports.DefaultLogger.prototype, "error", null);

$t([ g ], exports.DefaultLogger.prototype, "fatal", null);

exports.DefaultLogger = $t([ Et(0, At), Et(1, Ot), Et(2, q(jt)), Et(3, J(kt)), Et(4, X) ], exports.DefaultLogger);

const Pt = m({
    create({level: t = 3, colorOptions: e = 0, sinks: r = []} = {}) {
        return m({
            register(n) {
                n.register(gt.instance(At, new LogConfig(e, t)));
                for (const t of r) if ("function" === typeof t) n.register(gt.singleton(jt, t)); else n.register(t);
                return n;
            }
        });
    }
});

const St = D.createInterface((t => t.singleton(ModuleLoader)));

function Nt(t) {
    return t;
}

class ModuleTransformer {
    constructor(t) {
        this.$transform = t;
        this.g = new Map;
        this.R = new Map;
    }
    transform(t) {
        if (t instanceof Promise) return this.m(t); else if ("object" === typeof t && null !== t) return this.C(t); else throw new Error(`Invalid input: ${String(t)}. Expected Promise or Object.`);
    }
    m(t) {
        if (this.g.has(t)) return this.g.get(t);
        const e = t.then((t => this.C(t)));
        this.g.set(t, e);
        void e.then((e => {
            this.g.set(t, e);
        }));
        return e;
    }
    C(t) {
        if (this.R.has(t)) return this.R.get(t);
        const e = this.$transform(this.$(t));
        this.R.set(t, e);
        if (e instanceof Promise) void e.then((e => {
            this.R.set(t, e);
        }));
        return e;
    }
    $(t) {
        let e;
        let r;
        let n;
        let i;
        const o = [];
        for (const s in t) {
            switch (typeof (e = t[s])) {
              case "object":
                if (null === e) continue;
                r = "function" === typeof e.register;
                n = false;
                i = Rt;
                break;

              case "function":
                r = "function" === typeof e.register;
                n = void 0 !== e.prototype;
                i = I.resource.getAll(e);
                break;

              default:
                continue;
            }
            o.push(new ModuleItem(s, e, r, n, i));
        }
        return new AnalyzedModule(t, o);
    }
}

class ModuleLoader {
    constructor() {
        this.transformers = new Map;
    }
    load(t, e = Nt) {
        const r = this.transformers;
        let n = r.get(e);
        if (void 0 === n) r.set(e, n = new ModuleTransformer(e));
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
    constructor(t, e, r, n, i) {
        this.key = t;
        this.value = e;
        this.isRegistry = r;
        this.isConstructable = n;
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

const Wt = D.createInterface("IEventAggregator", (t => t.singleton(EventAggregator)));

class EventAggregator {
    constructor() {
        this.eventLookup = {};
        this.messageHandlers = [];
    }
    publish(t, e) {
        if (!t) throw new Error(`Invalid channel name or instance: ${t}.`);
        if ("string" === typeof t) {
            let r = this.eventLookup[t];
            if (void 0 !== r) {
                r = r.slice();
                let n = r.length;
                while (n-- > 0) r[n](e, t);
            }
        } else {
            const e = this.messageHandlers.slice();
            let r = e.length;
            while (r-- > 0) e[r].handle(t);
        }
    }
    subscribe(t, e) {
        if (!t) throw new Error(`Invalid channel name or type: ${t}.`);
        let r;
        let n;
        if ("string" === typeof t) {
            if (void 0 === this.eventLookup[t]) this.eventLookup[t] = [];
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
                if (-1 !== t) n.splice(t, 1);
            }
        };
    }
    subscribeOnce(t, e) {
        const r = this.subscribe(t, (function(t, n) {
            r.dispose();
            e(t, n);
        }));
        return r;
    }
}

exports.Metadata = t.Metadata;

exports.applyMetadataPolyfill = t.applyMetadataPolyfill;

exports.isNullOrUndefined = t.isNullOrUndefined;

exports.isObject = t.isObject;

exports.metadata = t.metadata;

exports.Platform = e.Platform;

exports.Task = e.Task;

exports.TaskAbortError = e.TaskAbortError;

exports.TaskQueue = e.TaskQueue;

exports.TaskQueuePriority = e.TaskQueuePriority;

exports.TaskStatus = e.TaskStatus;

exports.AnalyzedModule = AnalyzedModule;

exports.ContainerConfiguration = ContainerConfiguration;

exports.DI = D;

exports.DefaultLogEvent = DefaultLogEvent;

exports.DefaultResolver = T;

exports.EventAggregator = EventAggregator;

exports.IContainer = N;

exports.IEventAggregator = Wt;

exports.ILogConfig = At;

exports.ILogEventFactory = Ot;

exports.ILogger = It;

exports.IModuleLoader = St;

exports.IPlatform = Ct;

exports.IServiceLocator = W;

exports.ISink = jt;

exports.InstanceProvider = InstanceProvider;

exports.LogConfig = LogConfig;

exports.LoggerConfiguration = Pt;

exports.ModuleItem = ModuleItem;

exports.Protocol = I;

exports.Registration = gt;

exports.all = q;

exports.bound = g;

exports.camelCase = u;

exports.compareNumber = p;

exports.emptyArray = Rt;

exports.emptyObject = mt;

exports.factory = Y;

exports.firstDefined = y;

exports.format = Lt;

exports.fromAnnotationOrDefinitionOrTypeOrDefault = M;

exports.fromAnnotationOrTypeOrDefault = F;

exports.fromDefinitionOrDefault = L;

exports.getPrototypeChain = R;

exports.ignore = X;

exports.inject = z;

exports.isArrayIndex = n;

exports.isNativeFunction = b;

exports.isNumberOrBigInt = i;

exports.isStringOrDate = o;

exports.kebabCase = c;

exports.lazy = V;

exports.mergeArrays = w;

exports.mergeDistinct = v;

exports.mergeObjects = x;

exports.newInstanceForScope = Z;

exports.newInstanceOf = tt;

exports.nextId = h;

exports.noop = bt;

exports.onResolve = C;

exports.optional = J;

exports.pascalCase = l;

exports.resetId = d;

exports.resolveAll = $;

exports.singleton = K;

exports.sink = Ft;

exports.toArray = f;

exports.transient = _;
//# sourceMappingURL=index.js.map
