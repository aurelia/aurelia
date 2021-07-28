"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function t(t) {
    return "object" === typeof t && null !== t || "function" === typeof t;
}

function e(t) {
    return null === t || void 0 === t;
}

const n = new WeakMap;

function r(t, e, n, r, o) {
    return new TypeError(`${t}(${e.map(String).join(",")}) - Expected '${n}' to be of type ${o}, but got: ${Object.prototype.toString.call(r)} (${String(r)})`);
}

function o(t) {
    switch (typeof t) {
      case "undefined":
      case "string":
      case "symbol":
        return t;

      default:
        return `${t}`;
    }
}

function a(t) {
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
    let o = n.get(t);
    if (void 0 === o) {
        if (!r) return;
        o = new Map;
        n.set(t, o);
    }
    let a = o.get(e);
    if (void 0 === a) {
        if (!r) return;
        a = new Map;
        o.set(e, a);
    }
    return a;
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
    const o = u(n, r, true);
    o.set(t, e);
}

function w(t, e) {
    const n = [];
    const r = u(t, e, false);
    if (void 0 === r) return n;
    const o = r.keys();
    let a = 0;
    for (const t of o) {
        n[a] = t;
        ++a;
    }
    return n;
}

function p(t, e) {
    const n = w(t, e);
    const r = Object.getPrototypeOf(t);
    if (null === r) return n;
    const o = p(r, e);
    const a = n.length;
    if (0 === a) return o;
    const i = o.length;
    if (0 === i) return n;
    const u = new Set;
    const c = [];
    let f = 0;
    let s;
    for (let t = 0; t < a; ++t) {
        s = n[t];
        if (!u.has(s)) {
            u.add(s);
            c[f] = s;
            ++f;
        }
    }
    for (let t = 0; t < i; ++t) {
        s = o[t];
        if (!u.has(s)) {
            u.add(s);
            c[f] = s;
            ++f;
        }
    }
    return c;
}

function y(t, e, n) {
    const r = u(t, n, false);
    if (void 0 === r) return false;
    return r.delete(e);
}

function h(e, n) {
    function o(o, a) {
        if (!t(o)) throw r("@metadata", [ e, n, o, a ], "target", o, "Object or Function");
        d(e, n, o, i(a));
    }
    return o;
}

function g(n, o, i, u) {
    if (void 0 !== i) {
        if (!Array.isArray(n)) throw r("Metadata.decorate", [ n, o, i, u ], "decorators", n, "Array");
        if (!t(o)) throw r("Metadata.decorate", [ n, o, i, u ], "target", o, "Object or Function");
        if (!t(u) && !e(u)) throw r("Metadata.decorate", [ n, o, i, u ], "attributes", u, "Object, Function, null, or undefined");
        if (null === u) u = void 0;
        i = a(i);
        return b(n, o, i, u);
    } else {
        if (!Array.isArray(n)) throw r("Metadata.decorate", [ n, o, i, u ], "decorators", n, "Array");
        if ("function" !== typeof o) throw r("Metadata.decorate", [ n, o, i, u ], "target", o, "Function");
        return M(n, o);
    }
}

function M(t, n) {
    for (let o = t.length - 1; o >= 0; --o) {
        const a = t[o];
        const i = a(n);
        if (!e(i)) {
            if ("function" !== typeof i) throw r("DecorateConstructor", [ t, n ], "decorated", i, "Function, null, or undefined");
            n = i;
        }
    }
    return n;
}

function b(n, o, a, i) {
    for (let u = n.length - 1; u >= 0; --u) {
        const c = n[u];
        const f = c(o, a, i);
        if (!e(f)) {
            if (!t(f)) throw r("DecorateProperty", [ n, o, a, i ], "decorated", f, "Object, Function, null, or undefined");
            i = f;
        }
    }
    return i;
}

function O(e, n, a, i) {
    if (!t(a)) throw r("Metadata.define", [ e, n, a, i ], "target", a, "Object or Function");
    return d(e, n, a, o(i));
}

function m(e, n, a) {
    if (!t(n)) throw r("Metadata.has", [ e, n, a ], "target", n, "Object or Function");
    return f(e, n, o(a));
}

function j(e, n, a) {
    if (!t(n)) throw r("Metadata.hasOwn", [ e, n, a ], "target", n, "Object or Function");
    return c(e, n, o(a));
}

function v(e, n, a) {
    if (!t(n)) throw r("Metadata.get", [ e, n, a ], "target", n, "Object or Function");
    return l(e, n, o(a));
}

function $(e, n, a) {
    if (!t(n)) throw r("Metadata.getOwn", [ e, n, a ], "target", n, "Object or Function");
    return s(e, n, o(a));
}

function F(e, n) {
    if (!t(e)) throw r("Metadata.getKeys", [ e, n ], "target", e, "Object or Function");
    return p(e, o(n));
}

function K(e, n) {
    if (!t(e)) throw r("Metadata.getOwnKeys", [ e, n ], "target", e, "Object or Function");
    return w(e, o(n));
}

function x(e, n, a) {
    if (!t(n)) throw r("Metadata.delete", [ e, n, a ], "target", n, "Object or Function");
    return y(n, e, o(a));
}

const E = {
    define: O,
    has: m,
    hasOwn: j,
    get: v,
    getOwn: $,
    getKeys: F,
    getOwnKeys: K,
    delete: x
};

function A(t, e, n, r, o) {
    if (!Reflect.defineProperty(t, e, {
        writable: r,
        enumerable: false,
        configurable: o,
        value: n
    })) throw new Error(`Unable to apply metadata polyfill: could not add property '${e}' to the global Reflect object`);
}

const k = "[[$au]]";

function R(t) {
    return k in t;
}

function C(t, e, r) {
    A(t, k, n, e, r);
    A(t, "metadata", h, e, r);
    A(t, "decorate", g, e, r);
    A(t, "defineMetadata", O, e, r);
    A(t, "hasMetadata", m, e, r);
    A(t, "hasOwnMetadata", j, e, r);
    A(t, "getMetadata", v, e, r);
    A(t, "getOwnMetadata", $, e, r);
    A(t, "getMetadataKeys", F, e, r);
    A(t, "getOwnMetadataKeys", K, e, r);
    A(t, "deleteMetadata", x, e, r);
}

function I(t, e = true, r = false, o = true, a = true) {
    if (R(t)) {
        if (t[k] === n) return;
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
        } else if (r) C(t, o, a);
    } else C(t, o, a);
}

exports.Metadata = E;

exports.applyMetadataPolyfill = I;

exports.isNullOrUndefined = e;

exports.isObject = t;

exports.metadata = h;
//# sourceMappingURL=index.js.map
