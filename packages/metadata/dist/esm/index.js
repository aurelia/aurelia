function t(t) {
    return "object" === typeof t && null !== t || "function" === typeof t;
}

function e(t) {
    return null === t || void 0 === t;
}

const n = new WeakMap;

function r(t, e, n, r, a) {
    return new TypeError(`${t}(${e.map(String).join(",")}) - Expected '${n}' to be of type ${a}, but got: ${Object.prototype.toString.call(r)} (${String(r)})`);
}

function a(t) {
    switch (typeof t) {
      case "undefined":
      case "string":
      case "symbol":
        return t;

      default:
        return `${t}`;
    }
}

function o(t) {
    switch (typeof t) {
      case "string":
      case "symbol":
        return t;

      default:
        return `${t}`;
    }
}

function i(t) {
    switch (typeof t) {
      case "undefined":
      case "string":
      case "symbol":
        return t;

      default:
        throw new TypeError(`Invalid metadata propertyKey: ${t}.`);
    }
}

function u(t, e, r) {
    let a = n.get(t);
    if (void 0 === a) {
        if (!r) return;
        a = new Map;
        n.set(t, a);
    }
    let o = a.get(e);
    if (void 0 === o) {
        if (!r) return;
        o = new Map;
        a.set(e, o);
    }
    return o;
}

function c(t, e, n) {
    const r = u(e, n, false);
    if (void 0 === r) return false;
    return r.has(t);
}

function f(t, e, n) {
    if (c(t, e, n)) return true;
    const r = Object.getPrototypeOf(e);
    if (null !== r) return f(t, r, n);
    return false;
}

function s(t, e, n) {
    const r = u(e, n, false);
    if (void 0 === r) return;
    return r.get(t);
}

function l(t, e, n) {
    if (c(t, e, n)) return s(t, e, n);
    const r = Object.getPrototypeOf(e);
    if (null !== r) return l(t, r, n);
    return;
}

function d(t, e, n, r) {
    const a = u(n, r, true);
    a.set(t, e);
}

function w(t, e) {
    const n = [];
    const r = u(t, e, false);
    if (void 0 === r) return n;
    const a = r.keys();
    let o = 0;
    for (const t of a) {
        n[o] = t;
        ++o;
    }
    return n;
}

function y(t, e) {
    const n = w(t, e);
    const r = Object.getPrototypeOf(t);
    if (null === r) return n;
    const a = y(r, e);
    const o = n.length;
    if (0 === o) return a;
    const i = a.length;
    if (0 === i) return n;
    const u = new Set;
    const c = [];
    let f = 0;
    let s;
    for (let t = 0; t < o; ++t) {
        s = n[t];
        if (!u.has(s)) {
            u.add(s);
            c[f] = s;
            ++f;
        }
    }
    for (let t = 0; t < i; ++t) {
        s = a[t];
        if (!u.has(s)) {
            u.add(s);
            c[f] = s;
            ++f;
        }
    }
    return c;
}

function h(t, e, n) {
    const r = u(t, n, false);
    if (void 0 === r) return false;
    return r.delete(e);
}

function g(e, n) {
    function a(a, o) {
        if (!t(a)) throw r("@metadata", [ e, n, a, o ], "target", a, "Object or Function");
        d(e, n, a, i(o));
    }
    return a;
}

function p(n, a, i, u) {
    if (void 0 !== i) {
        if (!Array.isArray(n)) throw r("Metadata.decorate", [ n, a, i, u ], "decorators", n, "Array");
        if (!t(a)) throw r("Metadata.decorate", [ n, a, i, u ], "target", a, "Object or Function");
        if (!t(u) && !e(u)) throw r("Metadata.decorate", [ n, a, i, u ], "attributes", u, "Object, Function, null, or undefined");
        if (null === u) u = void 0;
        i = o(i);
        return b(n, a, i, u);
    } else {
        if (!Array.isArray(n)) throw r("Metadata.decorate", [ n, a, i, u ], "decorators", n, "Array");
        if ("function" !== typeof a) throw r("Metadata.decorate", [ n, a, i, u ], "target", a, "Function");
        return M(n, a);
    }
}

function M(t, n) {
    for (let a = t.length - 1; a >= 0; --a) {
        const o = t[a];
        const i = o(n);
        if (!e(i)) {
            if ("function" !== typeof i) throw r("DecorateConstructor", [ t, n ], "decorated", i, "Function, null, or undefined");
            n = i;
        }
    }
    return n;
}

function b(n, a, o, i) {
    for (let u = n.length - 1; u >= 0; --u) {
        const c = n[u];
        const f = c(a, o, i);
        if (!e(f)) {
            if (!t(f)) throw r("DecorateProperty", [ n, a, o, i ], "decorated", f, "Object, Function, null, or undefined");
            i = f;
        }
    }
    return i;
}

function O(e, n, o, i) {
    if (!t(o)) throw r("Metadata.define", [ e, n, o, i ], "target", o, "Object or Function");
    return d(e, n, o, a(i));
}

function m(e, n, o) {
    if (!t(n)) throw r("Metadata.has", [ e, n, o ], "target", n, "Object or Function");
    return f(e, n, a(o));
}

function j(e, n, o) {
    if (!t(n)) throw r("Metadata.hasOwn", [ e, n, o ], "target", n, "Object or Function");
    return c(e, n, a(o));
}

function v(e, n, o) {
    if (!t(n)) throw r("Metadata.get", [ e, n, o ], "target", n, "Object or Function");
    return l(e, n, a(o));
}

function $(e, n, o) {
    if (!t(n)) throw r("Metadata.getOwn", [ e, n, o ], "target", n, "Object or Function");
    return s(e, n, a(o));
}

function F(e, n) {
    if (!t(e)) throw r("Metadata.getKeys", [ e, n ], "target", e, "Object or Function");
    return y(e, a(n));
}

function K(e, n) {
    if (!t(e)) throw r("Metadata.getOwnKeys", [ e, n ], "target", e, "Object or Function");
    return w(e, a(n));
}

function E(e, n, o) {
    if (!t(n)) throw r("Metadata.delete", [ e, n, o ], "target", n, "Object or Function");
    return h(n, e, a(o));
}

const A = {
    define: O,
    has: m,
    hasOwn: j,
    get: v,
    getOwn: $,
    getKeys: F,
    getOwnKeys: K,
    delete: E
};

function k(t, e, n, r, a) {
    if (!Reflect.defineProperty(t, e, {
        writable: r,
        enumerable: false,
        configurable: a,
        value: n
    })) throw new Error(`Unable to apply metadata polyfill: could not add property '${e}' to the global Reflect object`);
}

const R = "[[$au]]";

function C(t) {
    return R in t;
}

function I(t, e, r) {
    k(t, R, n, e, r);
    k(t, "metadata", g, e, r);
    k(t, "decorate", p, e, r);
    k(t, "defineMetadata", O, e, r);
    k(t, "hasMetadata", m, e, r);
    k(t, "hasOwnMetadata", j, e, r);
    k(t, "getMetadata", v, e, r);
    k(t, "getOwnMetadata", $, e, r);
    k(t, "getMetadataKeys", F, e, r);
    k(t, "getOwnMetadataKeys", K, e, r);
    k(t, "deleteMetadata", E, e, r);
}

function S(t, e = true, r = false, a = true, o = true) {
    if (C(t)) {
        if (t[R] === n) return;
        throw new Error(`Conflicting @aurelia/metadata module import detected. Please make sure you have the same version of all Aurelia packages in your dependency tree.`);
    }
    const i = [ "metadata", "decorate", "defineMetadata", "hasMetadata", "hasOwnMetadata", "getMetadata", "getOwnMetadata", "getMetadataKeys", "getOwnMetadataKeys", "deleteMetadata" ].filter((function(t) {
        return t in Reflect;
    }));
    if (i.length > 0) {
        if (e) {
            const t = i.map((function(t) {
                const e = `${Reflect[t].toString().slice(0, 100)}...`;
                return `${t}:\n${e}`;
            })).join("\n\n");
            throw new Error(`Conflicting reflect.metadata polyfill found. If you have 'reflect-metadata' or any other reflect polyfill imported, please remove it, if not (or if you must use a specific polyfill) please file an issue at https://github.com/aurelia/aurelia/issues so that we can look into compatibility options for this scenario. Implementation summary:\n\n${t}`);
        } else if (r) I(t, a, o);
    } else I(t, a, o);
}

export { A as Metadata, S as applyMetadataPolyfill, e as isNullOrUndefined, t as isObject, g as metadata };
//# sourceMappingURL=index.js.map
