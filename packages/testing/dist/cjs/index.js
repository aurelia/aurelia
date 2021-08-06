"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var e = require("@aurelia/kernel");

var t = require("@aurelia/runtime-html");

const {getPrototypeOf: n, getOwnPropertyDescriptor: i, getOwnPropertyDescriptors: r, getOwnPropertyNames: a, getOwnPropertySymbols: s, defineProperty: o, defineProperties: l} = Object;

const u = Object.keys;

const c = Object.is;

const h = Object.freeze;

const d = Object.assign;

const f = Number.isNaN;

const p = Reflect.apply;

const g = ArrayBuffer.isView;

function m(e) {
    return (t, ...n) => p(e, t, n);
}

const b = m(Object.prototype.hasOwnProperty);

const v = m(Object.prototype.propertyIsEnumerable);

const y = n(Uint8Array.prototype);

const x = m(i(y, Symbol.toStringTag).get);

const $ = m(Object.prototype.toString);

const w = m(RegExp.prototype.toString);

const k = m(Date.prototype.toISOString);

const C = m(Date.prototype.toString);

const S = m(Error.prototype.toString);

const O = m(Date.prototype.getTime);

const E = m(Set.prototype.values);

const L = m(Map.prototype.entries);

const A = m(Boolean.prototype.valueOf);

const T = m(Number.prototype.valueOf);

const j = m(Symbol.prototype.valueOf);

const M = m(String.prototype.valueOf);

function R(e) {
    return "number" === typeof e;
}

function z(e) {
    return "string" === typeof e;
}

function P(e) {
    return "symbol" === typeof e;
}

function q(e) {
    return void 0 === e;
}

function _(e) {
    return null !== e && "object" === typeof e;
}

function F(e) {
    return "function" === typeof e;
}

function N(e) {
    return null === e || "object" !== typeof e && "function" !== typeof e;
}

function I(e) {
    return e instanceof ArrayBuffer;
}

function V(e) {
    return e instanceof ArrayBuffer || "undefined" !== typeof SharedArrayBuffer && e instanceof SharedArrayBuffer;
}

function H(e) {
    return e instanceof Date;
}

function B(e) {
    return e instanceof Map;
}

function D(e) {
    return "[object Map Iterator]" === $(e);
}

function W(e) {
    return e instanceof RegExp;
}

function U(e) {
    return e instanceof Set;
}

function J(e) {
    return "[object Set Iterator]" === $(e);
}

function Q(e) {
    return e instanceof Error;
}

function G(e) {
    return e instanceof Number;
}

function Y(e) {
    return e instanceof String;
}

function K(e) {
    return e instanceof Boolean;
}

function X(e) {
    return e instanceof Symbol;
}

function Z(e) {
    return G(e) || Y(e) || K(e) || X(e);
}

function ee(e) {
    return void 0 !== x(e);
}

function te(e) {
    return "Uint8Array" === x(e);
}

function ne(e) {
    return "Uint8ClampedArray" === x(e);
}

function ie(e) {
    return "Uint16Array" === x(e);
}

function re(e) {
    return "Uint32Array" === x(e);
}

function ae(e) {
    return "Int8Array" === x(e);
}

function se(e) {
    return "Int16Array" === x(e);
}

function oe(e) {
    return "Int32Array" === x(e);
}

function le(e) {
    return "Float32Array" === x(e);
}

function ue(e) {
    return "Float64Array" === x(e);
}

function ce(e) {
    return "[object Arguments]" === $(e);
}

function he(e) {
    return "[object DataView]" === $(e);
}

function de(e) {
    return "[object Promise]" === $(e);
}

function fe(e) {
    return "[object WeakSet]" === $(e);
}

function pe(e) {
    return "[object WeakMap]" === $(e);
}

function ge(t, n) {
    if (n) return a(t).filter((t => !e.isArrayIndex(t))); else return u(t).filter((t => !e.isArrayIndex(t)));
}

function me(e, t) {
    return t.filter((t => v(e, t)));
}

const be = h({
    bold(e) {
        return `[1m${e}[22m`;
    },
    italic(e) {
        return `[3m${e}[23m`;
    },
    underline(e) {
        return `[4m${e}[24m`;
    },
    inverse(e) {
        return `[7m${e}[27m`;
    },
    white(e) {
        return `[37m${e}[39m`;
    },
    grey(e) {
        return `[90m${e}[39m`;
    },
    black(e) {
        return `[30m${e}[39m`;
    },
    blue(e) {
        return `[34m${e}[39m`;
    },
    cyan(e) {
        return `[36m${e}[39m`;
    },
    green(e) {
        return `[32m${e}[39m`;
    },
    magenta(e) {
        return `[35m${e}[39m`;
    },
    red(e) {
        return `[31m${e}[39m`;
    },
    yellow(e) {
        return `[33m${e}[39m`;
    }
});

const ve = /\u001b\[\d\d?m/g;

const ye = /[\x00-\x1f\x27\x5c]/;

const xe = /[\x00-\x1f\x27\x5c]/g;

const $e = /[\x00-\x1f\x5c]/;

const we = /[\x00-\x1f\x5c]/g;

function ke(e) {
    return e.replace(ve, "");
}

function Ce(e, t) {
    let n = "";
    if (0 !== e.length) {
        let i = 0;
        for (;i < e.length - 1; i++) {
            n += e[i];
            n += t;
        }
        n += e[i];
    }
    return n;
}

const Se = h([ "\\u0000", "\\u0001", "\\u0002", "\\u0003", "\\u0004", "\\u0005", "\\u0006", "\\u0007", "\\b", "\\t", "\\n", "\\u000b", "\\f", "\\r", "\\u000e", "\\u000f", "\\u0010", "\\u0011", "\\u0012", "\\u0013", "\\u0014", "\\u0015", "\\u0016", "\\u0017", "\\u0018", "\\u0019", "\\u001a", "\\u001b", "\\u001c", "\\u001d", "\\u001e", "\\u001f", "", "", "", "", "", "", "", "\\'", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "\\\\" ]);

function Oe(e, t) {
    if (-1 === t) return `"${e}"`;
    if (-2 === t) return `\`${e}\``;
    return `'${e}'`;
}

const Ee = e => Se[e.charCodeAt(0)];

function Le(e) {
    let t = ye;
    let n = xe;
    let i = 39;
    if (e.includes("'")) {
        if (!e.includes('"')) i = -1; else if (!e.includes("`") && !e.includes("${")) i = -2;
        if (39 !== i) {
            t = $e;
            n = we;
        }
    }
    if (e.length < 5e3 && !t.test(e)) return Oe(e, i);
    if (e.length > 100) {
        e = e.replace(n, Ee);
        return Oe(e, i);
    }
    let r = "";
    let a = 0;
    let s = 0;
    for (;s < e.length; s++) {
        const t = e.charCodeAt(s);
        if (t === i || 92 === t || t < 32) {
            if (a === s) r += Se[t]; else r += `${e.slice(a, s)}${Se[t]}`;
            a = s + 1;
        }
    }
    if (a !== s) r += e.slice(a);
    return Oe(r, i);
}

function Ae(e) {
    return e.replace(xe, Ee);
}

const Te = function() {
    const e = {};
    return function(t) {
        let n = e[t];
        if (void 0 === n) {
            n = "";
            const i = t.length;
            let r = 0;
            for (let e = 0; e < i; ++e) {
                r = t.charCodeAt(e);
                if (r > 32) n += String.fromCharCode(r);
            }
            e[t] = n;
        }
        return n;
    };
}();

function je(t, n, i) {
    const r = [];
    function a() {
        r.length = 0;
    }
    let s;
    let o;
    if (void 0 === t) {
        s = function e(...t) {
            r.push(t);
        };
        o = e.noop;
    } else if (void 0 === n) {
        s = function e(...n) {
            r.push(n);
            return t(...n);
        };
        o = e.noop;
    } else {
        if (!(n in t)) throw new Error(`No method named '${n}' exists in object of type ${Reflect.getPrototypeOf(t).constructor.name}`);
        let e = t;
        let a = Reflect.getOwnPropertyDescriptor(e, n);
        while (void 0 === a) {
            e = Reflect.getPrototypeOf(e);
            a = Reflect.getOwnPropertyDescriptor(e, n);
        }
        if (null !== a.value && ("object" === typeof a.value || "function" === typeof a.value) && "function" === typeof a.value.restore) {
            a.value.restore();
            a = Reflect.getOwnPropertyDescriptor(e, n);
        }
        o = function i() {
            if (t === e) Reflect.defineProperty(t, n, a); else Reflect.deleteProperty(t, n);
        };
        if (void 0 === i) s = function e(...t) {
            r.push(t);
        }; else if (true === i) s = function e(...n) {
            r.push(n);
            return a.value.apply(t, n);
        }; else if ("function" === typeof i) s = function e(...t) {
            r.push(t);
            return i(...t);
        }; else throw new Error(`Invalid spy`);
        Reflect.defineProperty(t, n, {
            ...a,
            value: s
        });
    }
    Reflect.defineProperty(s, "calls", {
        value: r
    });
    Reflect.defineProperty(s, "reset", {
        value: a
    });
    Reflect.defineProperty(s, "restore", {
        value: o
    });
    return s;
}

var Me;

(function(e) {
    e[e["noIterator"] = 0] = "noIterator";
    e[e["isArray"] = 1] = "isArray";
    e[e["isSet"] = 2] = "isSet";
    e[e["isMap"] = 3] = "isMap";
})(Me || (Me = {}));

function Re(e, t) {
    return e.source === t.source && e.flags === t.flags;
}

function ze(e, t) {
    if (e.byteLength !== t.byteLength) return false;
    const {byteLength: n} = e;
    for (let i = 0; i < n; ++i) if (e[i] !== t[i]) return false;
    return true;
}

function Pe(e, t) {
    if (e === t) return 0;
    const n = e.length;
    const i = t.length;
    const r = Math.min(n, i);
    for (let n = 0; n < r; ++n) if (e[n] !== t[n]) {
        const i = e[n];
        const r = t[n];
        if (i < r) return -1;
        if (r < i) return 1;
        return 0;
    }
    if (n < i) return -1;
    if (i < n) return 1;
    return 0;
}

function qe(e, t) {
    if (e.byteLength !== t.byteLength) return false;
    return 0 === Pe(new Uint8Array(e.buffer, e.byteOffset, e.byteLength), new Uint8Array(t.buffer, t.byteOffset, t.byteLength));
}

function _e(e, t) {
    return e.byteLength === t.byteLength && 0 === Pe(new Uint8Array(e), new Uint8Array(t));
}

function Fe(e, t) {
    if (G(e)) return G(t) && c(T(e), T(t));
    if (Y(e)) return Y(t) && M(e) === M(t);
    if (K(e)) return K(t) && A(e) === A(t);
    return X(t) && j(e) === j(t);
}

function Ne(e, t, i, r) {
    if (e === t) {
        if (0 !== e) return true;
        return i ? c(e, t) : true;
    }
    if (i) {
        if ("object" !== typeof e) return R(e) && f(e) && f(t);
        if ("object" !== typeof t || null === e || null === t) return false;
        if (n(e) !== n(t)) return false;
    } else {
        if (!_(e)) {
            if (!_(t)) return e == t;
            return false;
        }
        if (!_(t)) return false;
    }
    const a = $(e);
    const s = $(t);
    if (a !== s) return false;
    if ("[object URLSearchParams]" === a) return Ne(Array.from(e.entries()), Array.from(t.entries()), i, r);
    if (Array.isArray(e)) {
        if (e.length !== t.length) return false;
        const n = ge(e, false);
        const a = ge(t, false);
        if (n.length !== a.length) return false;
        return Ie(e, t, i, r, 1, n);
    }
    if ("[object Object]" === a) return Ie(e, t, i, r, 0);
    if (H(e)) {
        if (O(e) !== O(t)) return false;
    } else if (W(e)) {
        if (!Re(e, t)) return false;
    } else if (Q(e)) {
        if (e.message !== t.message || e.name !== t.name) return false;
    } else if (g(e)) {
        if (!i && (le(e) || ue(e))) {
            if (!ze(e, t)) return false;
        } else if (!qe(e, t)) return false;
        const n = ge(e, false);
        const a = ge(t, false);
        if (n.length !== a.length) return false;
        return Ie(e, t, i, r, 0, n);
    } else if (U(e)) {
        if (!U(t) || e.size !== t.size) return false;
        return Ie(e, t, i, r, 2);
    } else if (B(e)) {
        if (!B(t) || e.size !== t.size) return false;
        return Ie(e, t, i, r, 3);
    } else if (V(e)) {
        if (!_e(e, t)) return false;
    } else if (Z(e) && !Fe(e, t)) return false;
    return Ie(e, t, i, r, 0);
}

function Ie(e, t, n, i, r, a) {
    if (5 === arguments.length) {
        a = u(e);
        const n = u(t);
        if (a.length !== n.length) return false;
    }
    let o = 0;
    for (;o < a.length; o++) if (!b(t, a[o])) return false;
    if (n && 5 === arguments.length) {
        const n = s(e);
        if (0 !== n.length) {
            let i = 0;
            for (o = 0; o < n.length; o++) {
                const r = n[o];
                if (v(e, r)) {
                    if (!v(t, r)) return false;
                    a.push(r);
                    i++;
                } else if (v(t, r)) return false;
            }
            const r = s(t);
            if (n.length !== r.length && me(t, r).length !== i) return false;
        } else {
            const e = s(t);
            if (0 !== e.length && 0 !== me(t, e).length) return false;
        }
    }
    if (0 === a.length && (0 === r || 1 === r && 0 === e.length || 0 === e.size)) return true;
    if (void 0 === i) i = {
        val1: new Map,
        val2: new Map,
        position: 0
    }; else {
        const n = i.val1.get(e);
        if (void 0 !== n) {
            const e = i.val2.get(t);
            if (void 0 !== e) return n === e;
        }
        i.position++;
    }
    i.val1.set(e, i.position);
    i.val2.set(t, i.position);
    const l = Qe(e, t, n, a, i, r);
    i.val1.delete(e);
    i.val2.delete(t);
    return l;
}

function Ve(e, t, n, i) {
    for (const r of e) if (Ne(t, r, n, i)) {
        e.delete(r);
        return true;
    }
    return false;
}

function He(e) {
    switch (typeof e) {
      case "undefined":
        return null;

      case "object":
        return;

      case "symbol":
        return false;

      case "string":
        e = +e;

      case "number":
        if (f(e)) return false;
    }
    return true;
}

function Be(e, t, n) {
    const i = He(n);
    if (null != i) return i;
    return t.has(i) && !e.has(i);
}

function De(e, t, n, i, r) {
    const a = He(n);
    if (null != a) return a;
    const s = t.get(a);
    if (void 0 === s && !t.has(a) || !Ne(i, s, false, r)) return false;
    return !e.has(a) && Ne(i, s, false, r);
}

function We(e, t, n, i) {
    let r = null;
    for (const i of e) if (_(i)) {
        if (null === r) r = new Set;
        r.add(i);
    } else if (!t.has(i)) {
        if (n) return false;
        if (!Be(e, t, i)) return false;
        if (null === r) r = new Set;
        r.add(i);
    }
    if (null !== r) {
        for (const a of t) if (_(a)) {
            if (!Ve(r, a, n, i)) return false;
        } else if (!n && !e.has(a) && !Ve(r, a, n, i)) return false;
        return 0 === r.size;
    }
    return true;
}

function Ue(e, t, n, i, r, a) {
    for (const s of e) if (Ne(n, s, r, a) && Ne(i, t.get(s), r, a)) {
        e.delete(s);
        return true;
    }
    return false;
}

function Je(e, t, n, i) {
    let r = null;
    for (const [a, s] of e) if (_(a)) {
        if (null === r) r = new Set;
        r.add(a);
    } else {
        const o = t.get(a);
        if (void 0 === o && !t.has(a) || !Ne(s, o, n, i)) {
            if (n) return false;
            if (!De(e, t, a, s, i)) return false;
            if (null === r) r = new Set;
            r.add(a);
        }
    }
    if (null !== r) {
        for (const [a, s] of t) if (_(a)) {
            if (!Ue(r, e, a, s, n, i)) return false;
        } else if (!n && (!e.has(a) || !Ne(e.get(a), s, false, i)) && !Ue(r, e, a, s, false, i)) return false;
        return 0 === r.size;
    }
    return true;
}

function Qe(e, t, n, i, r, a) {
    let s = 0;
    if (2 === a) {
        if (!We(e, t, n, r)) return false;
    } else if (3 === a) {
        if (!Je(e, t, n, r)) return false;
    } else if (1 === a) for (;s < e.length; s++) if (b(e, s)) {
        if (!b(t, s) || !Ne(e[s], t[s], n, r)) return false;
    } else if (b(t, s)) return false; else {
        const i = u(e);
        for (;s < i.length; s++) {
            const a = i[s];
            if (!b(t, a) || !Ne(e[a], t[a], n, r)) return false;
        }
        if (i.length !== u(t).length) return false;
        return true;
    }
    for (s = 0; s < i.length; s++) {
        const a = i[s];
        if (!Ne(e[a], t[a], n, r)) return false;
    }
    return true;
}

function Ge(e, t) {
    return Ne(e, t, false);
}

function Ye(e, t) {
    return Ne(e, t, true);
}

class TestContext {
    constructor() {
        this._container = void 0;
        this._platform = void 0;
        this._templateCompiler = void 0;
        this.oL = void 0;
        this._domParser = void 0;
    }
    get wnd() {
        return this.platform.globalThis;
    }
    get doc() {
        return this.platform.document;
    }
    get userAgent() {
        return this.platform.navigator.userAgent;
    }
    get UIEvent() {
        return this.platform.globalThis.UIEvent;
    }
    get Event() {
        return this.platform.globalThis.Event;
    }
    get CustomEvent() {
        return this.platform.globalThis.CustomEvent;
    }
    get Node() {
        return this.platform.globalThis.Node;
    }
    get Element() {
        return this.platform.globalThis.Element;
    }
    get HTMLElement() {
        return this.platform.globalThis.HTMLElement;
    }
    get HTMLDivElement() {
        return this.platform.globalThis.HTMLDivElement;
    }
    get Text() {
        return this.platform.globalThis.Text;
    }
    get Comment() {
        return this.platform.globalThis.Comment;
    }
    get DOMParser() {
        return this.platform.globalThis.DOMParser;
    }
    get container() {
        if (void 0 === this._container) {
            this._container = e.DI.createContainer();
            t.StandardConfiguration.register(this._container);
            this._container.register(e.Registration.instance(TestContext, this));
            if (false === this._container.has(t.IPlatform, true)) this._container.register(exports.PLATFORMRegistration);
        }
        return this._container;
    }
    get platform() {
        if (void 0 === this._platform) this._platform = this.container.get(t.IPlatform);
        return this._platform;
    }
    get templateCompiler() {
        if (void 0 === this._templateCompiler) this._templateCompiler = this.container.get(t.ITemplateCompiler);
        return this._templateCompiler;
    }
    get observerLocator() {
        if (void 0 === this.oL) this.oL = this.container.get(t.IObserverLocator);
        return this.oL;
    }
    get domParser() {
        if (void 0 === this._domParser) this._domParser = this.doc.createElement("div");
        return this._domParser;
    }
    static create() {
        return new TestContext;
    }
    createElementFromMarkup(e) {
        this.domParser.innerHTML = e;
        return this.domParser.firstElementChild;
    }
    createElement(e) {
        return this.doc.createElement(e);
    }
    createAttribute(e, t) {
        const n = this.doc.createAttribute(e);
        n.value = t;
        return n;
    }
}

exports.PLATFORM = void 0;

exports.PLATFORMRegistration = void 0;

function Ke(n) {
    exports.PLATFORM = n;
    exports.PLATFORMRegistration = e.Registration.instance(t.IPlatform, n);
}

function Xe(...t) {
    return e.DI.createContainer().register(exports.PLATFORMRegistration, ...t);
}

let Ze;

let et;

function tt(e) {
    if (void 0 === et) try {
        function e() {
            e();
        }
        e();
    } catch (e) {
        et = e.message;
        Ze = e.name;
    }
    return e.name === Ze && e.message === et;
}

const nt = h({
    showHidden: false,
    depth: 2,
    colors: true,
    customInspect: true,
    showProxy: false,
    maxArrayLength: 100,
    breakLength: 60,
    compact: true,
    sorted: false,
    getters: false,
    userOptions: void 0,
    stylize: ut
});

const it = u(nt);

function rt(e) {
    const t = {};
    for (const n of it) t[n] = e[n];
    if (void 0 !== e.userOptions) d(t, e.userOptions);
    return t;
}

function at(e) {
    const t = {
        ...nt,
        budget: {},
        indentationLvl: 0,
        seen: [],
        currentDepth: 0,
        stylize: e.colors ? ut : ct
    };
    for (const n of it) if (b(e, n)) t[n] = e[n];
    if (void 0 === t.userOptions) t.userOptions = e;
    return t;
}

const st = h({
    special: "cyan",
    number: "yellow",
    boolean: "yellow",
    undefined: "grey",
    null: "bold",
    string: "green",
    symbol: "green",
    date: "magenta",
    regexp: "red"
});

const ot = h({
    deepStrictEqual: "Expected values to be strictly deep-equal:",
    strictEqual: "Expected values to be strictly equal:",
    strictEqualObject: 'Expected "actual" to be reference-equal to "expected":',
    deepEqual: "Expected values to be loosely deep-equal:",
    equal: "Expected values to be loosely equal:",
    notDeepStrictEqual: 'Expected "actual" not to be strictly deep-equal to:',
    notStrictEqual: 'Expected "actual" to be strictly unequal to:',
    notStrictEqualObject: 'Expected "actual" not to be reference-equal to "expected":',
    notDeepEqual: 'Expected "actual" not to be loosely deep-equal to:',
    notEqual: 'Expected "actual" to be loosely unequal to:',
    notIdentical: "Values identical but not reference-equal:"
});

const lt = Symbol.for("customInspect");

function ut(e, t) {
    const n = st[t];
    if (z(n)) return be[n](e); else return e;
}

function ct(e, t) {
    return e;
}

class AssertionError extends Error {
    constructor(e) {
        const {actual: t, expected: n, message: i, operator: r, stackStartFn: a} = e;
        const s = Error.stackTraceLimit;
        Error.stackTraceLimit = 0;
        let l = null == i ? "" : `${i} - `;
        if ("deepStrictEqual" === r || "strictEqual" === r) super(`${l}${dt(t, n, r)}`); else if ("notDeepStrictEqual" === r || "notStrictEqual" === r) {
            let e = ot[r];
            let n = cn(t).split("\n");
            if ("notStrictEqual" === r && _(t)) e = ot.notStrictEqualObject;
            if (n.length > 30) {
                n[26] = be.blue("...");
                while (n.length > 27) n.pop();
            }
            if (1 === n.length) super(`${l}${e} ${n[0]}`); else super(`${l}${e}\n\n${Ce(n, "\n")}\n`);
        } else {
            let e = cn(t);
            let i = "";
            const a = ot[r];
            if ("notDeepEqual" === r || "notEqual" === r) {
                e = `${ot[r]}\n\n${e}`;
                if (e.length > 1024) e = `${e.slice(0, 1021)}...`;
            } else {
                i = `${cn(n)}`;
                if (e.length > 512) e = `${e.slice(0, 509)}...`;
                if (i.length > 512) i = `${i.slice(0, 509)}...`;
                if ("deepEqual" === r || "equal" === r) e = `${a}\n\n${e}\n\nshould equal\n\n`; else i = ` ${r} ${i}`;
            }
            if (!r) {
                i = "";
                e = "";
                l = l.slice(0, -3);
            }
            super(`${l}${e}${i}`);
        }
        Error.stackTraceLimit = s;
        this.generatedMessage = !i || "Failed" === i;
        o(this, "name", {
            value: "AssertionError [ERR_ASSERTION]",
            enumerable: false,
            writable: true,
            configurable: true
        });
        this.code = "ERR_ASSERTION";
        this.actual = t;
        this.expected = n;
        this.operator = r;
        if ("function" === typeof Error.captureStackTrace) {
            Error.captureStackTrace(this, a);
            this.stack;
        } else Error().stack;
        this.name = "AssertionError";
    }
    toString() {
        return `${this.name} [${this.code}]: ${this.message}`;
    }
    [lt](e, t) {
        return un(this, {
            ...t,
            customInspect: false,
            depth: 0
        });
    }
}

const ht = 10;

function dt(e, t, n) {
    let i = "";
    let r = "";
    let a = 0;
    let s = "";
    let o = false;
    const l = cn(e);
    const u = l.split("\n");
    const c = cn(t).split("\n");
    let h = 0;
    let d = "";
    if ("strictEqual" === n && _(e) && _(t)) n = "strictEqualObject";
    if (1 === u.length && 1 === c.length && u[0] !== c[0]) {
        const i = u[0].length + c[0].length;
        if (i <= ht) {
            if (!_(e) && !_(t) && (0 !== e || 0 !== t)) return `${ot[n]}\n\n${u[0]} !== ${c[0]}\n`;
        } else if ("strictEqualObject" !== n && i < 80) {
            while (u[0][h] === c[0][h]) h++;
            if (h > 2) {
                d = `\n  ${" ".repeat(h)}^`;
                h = 0;
            }
        }
    }
    let f = u[u.length - 1];
    let p = c[c.length - 1];
    while (f === p) {
        if (h++ < 2) s = `\n  ${f}${s}`; else i = f;
        u.pop();
        c.pop();
        if (0 === u.length || 0 === c.length) break;
        f = u[u.length - 1];
        p = c[c.length - 1];
    }
    const g = Math.max(u.length, c.length);
    if (0 === g) {
        const e = l.split("\n");
        if (e.length > 30) {
            e[26] = be.blue("...");
            while (e.length > 27) e.pop();
        }
        return `${ot.notIdentical}\n\n${Ce(e, "\n")}\n`;
    }
    if (h > 3) {
        s = `\n${be.blue("...")}${s}`;
        o = true;
    }
    if ("" !== i) {
        s = `\n  ${i}${s}`;
        i = "";
    }
    let m = 0;
    const b = `${ot[n]}\n${be.green("+ actual")} ${be.red("- expected")}`;
    const v = ` ${be.blue("...")} Lines skipped`;
    for (h = 0; h < g; h++) {
        const e = h - a;
        if (u.length < h + 1) {
            if (e > 1 && h > 2) {
                if (e > 4) {
                    r += `\n${be.blue("...")}`;
                    o = true;
                } else if (e > 3) {
                    r += `\n  ${c[h - 2]}`;
                    m++;
                }
                r += `\n  ${c[h - 1]}`;
                m++;
            }
            a = h;
            i += `\n${be.red("-")} ${c[h]}`;
            m++;
        } else if (c.length < h + 1) {
            if (e > 1 && h > 2) {
                if (e > 4) {
                    r += `\n${be.blue("...")}`;
                    o = true;
                } else if (e > 3) {
                    r += `\n  ${u[h - 2]}`;
                    m++;
                }
                r += `\n  ${u[h - 1]}`;
                m++;
            }
            a = h;
            r += `\n${be.green("+")} ${u[h]}`;
            m++;
        } else {
            const t = c[h];
            let n = u[h];
            let s = n !== t && (!n.endsWith(",") || n.slice(0, -1) !== t);
            if (s && t.endsWith(",") && t.slice(0, -1) === n) {
                s = false;
                n += ",";
            }
            if (s) {
                if (e > 1 && h > 2) {
                    if (e > 4) {
                        r += `\n${be.blue("...")}`;
                        o = true;
                    } else if (e > 3) {
                        r += `\n  ${u[h - 2]}`;
                        m++;
                    }
                    r += `\n  ${u[h - 1]}`;
                    m++;
                }
                a = h;
                r += `\n${be.green("+")} ${n}`;
                i += `\n${be.red("-")} ${t}`;
                m += 2;
            } else {
                r += i;
                i = "";
                if (1 === e || 0 === h) {
                    r += `\n  ${n}`;
                    m++;
                }
            }
        }
        if (m > 1e3 && h < g - 2) return `${b}${v}\n${r}\n${be.blue("...")}${i}\n${be.blue("...")}`;
    }
    return `${b}${o ? v : ""}\n${r}${i}${s}${d}`;
}

const ft = 0;

const pt = 1;

const gt = 2;

const mt = new Int8Array(128);

const bt = new Int8Array(128);

for (let e = 0; e < 128; ++e) if (36 === e || 95 === e || e >= 65 && e <= 90 || e >= 97 && e <= 122) mt[e] = bt[e] = 1; else if (e >= 49 && e <= 57) bt[e] = 1;

function vt(e) {
    if (1 !== mt[e.charCodeAt(0)]) return false;
    const {length: t} = e;
    for (let n = 1; n < t; ++n) if (1 !== bt[e.charCodeAt(n)]) return false;
    return true;
}

const yt = {};

const xt = 16;

const $t = 0;

const wt = 1;

const kt = 2;

function Ct(e, t) {
    let n = 0;
    let i = 0;
    let r = 0;
    const a = new Array(t.length);
    for (;r < t.length; r++) {
        const s = e.colors ? ke(t[r]).length : t[r].length;
        a[r] = s;
        n += s;
        if (i < s) i = s;
    }
    const s = i + 2;
    if (3 * s + e.indentationLvl < e.breakLength && (n / i > 5 || i <= 6)) {
        const n = 2.5;
        const o = 1;
        const l = Math.min(Math.round(Math.sqrt(n * (s - o) * t.length) / (s - o)), 3 * e.compact, 10);
        if (l <= 1) return t;
        const u = [];
        let c = a[0];
        for (r = l; r < a.length; r += l) if (a[r] > c) c = a[r];
        for (r = 0; r < t.length; r += l) {
            let e = t[r].length - a[r];
            let n = t[r].padStart(c + e, " ");
            const s = Math.min(r + l, t.length);
            for (let o = r + 1; o < s; o++) {
                e = t[o].length - a[o];
                n += `, ${t[o].padStart(i + e, " ")}`;
            }
            u.push(n);
        }
        t = u;
    }
    return t;
}

function St(e, t, n, i, r) {
    if (tt(t)) {
        e.seen.pop();
        e.indentationLvl = r;
        return e.stylize(`[${Pt(n, i)}: Inspection interrupted prematurely. Maximum call stack size exceeded.]`, "special");
    }
    throw t;
}

const Ot = h([ "BYTES_PER_ELEMENT", "length", "byteLength", "byteOffset", "buffer" ]);

function Et(e) {
    const t = [];
    for (const [n, i] of e) t.push(n, i);
    return t;
}

function Lt(e, t, n) {
    let i = t.length + n;
    if (i + t.length > e.breakLength) return false;
    for (let n = 0; n < t.length; n++) {
        if (e.colors) i += ke(t[n]).length; else i += t[n].length;
        if (i > e.breakLength) return false;
    }
    return true;
}

function At(e, t, n, i, r = false) {
    if (true !== e.compact) {
        if (r) {
            const r = t.length + e.indentationLvl + i[0].length + n.length + 10;
            if (Lt(e, t, r)) return `${n ? `${n} ` : ""}${i[0]} ${Ce(t, ", ")} ${i[1]}`;
        }
        const a = `\n${" ".repeat(e.indentationLvl)}`;
        return `${n ? `${n} ` : ""}${i[0]}${a}  ${Ce(t, `,${a}  `)}${a}${i[1]}`;
    }
    if (Lt(e, t, 0)) return `${i[0]}${n ? ` ${n}` : ""} ${Ce(t, ", ")} ${i[1]}`;
    const a = " ".repeat(e.indentationLvl);
    const s = "" === n && 1 === i[0].length ? " " : `${n ? ` ${n}` : ""}\n${a}  `;
    return `${i[0]}${s}${Ce(t, `,\n${a}  `)} ${i[1]}`;
}

function Tt(e, t) {
    let r;
    while (e) {
        const t = i(e, "constructor");
        if (!q(t) && F(t.value) && "" !== t.value.name) return t.value.name;
        e = n(e);
        if (void 0 === r) r = e;
    }
    if (null === r) return null;
    const a = {
        ...t,
        customInspect: false
    };
    return `<${un(r, a)}>`;
}

function jt() {
    return [];
}

function Mt(e, t, n) {
    if (null === e) {
        if ("" !== t) return `[${n}: null prototype] [${t}] `;
        return `[${n}: null prototype] `;
    }
    if ("" !== t && e !== t) return `${e} [${t}] `;
    return `${e} `;
}

const Rt = Dt.bind(null, ct);

function zt(e, t) {
    let n;
    const i = s(e);
    if (t) {
        n = a(e);
        if (0 !== i.length) n.push(...i);
    } else {
        n = u(e);
        if (0 !== i.length) n.push(...i.filter((t => v(e, t))));
    }
    return n;
}

function Pt(e, t) {
    return e || t || "Object";
}

const qt = h([ [ te, Uint8Array ], [ ne, Uint8ClampedArray ], [ ie, Uint16Array ], [ re, Uint32Array ], [ ae, Int8Array ], [ se, Int16Array ], [ oe, Int32Array ], [ le, Float32Array ], [ ue, Float64Array ] ]);

const _t = qt.length;

function Ft(e) {
    for (let t = 0; t < _t; ++t) {
        const [n, i] = qt[t];
        if (n(e)) return i;
    }
    return;
}

function Nt(e, t) {
    if (t !== `${e} Iterator`) {
        if ("" !== t) t += "] [";
        t += `${e} Iterator`;
    }
    return [ `[${t}] {`, "}" ];
}

let It;

function Vt(e, t) {
    if (void 0 === It) It = new Map; else {
        const t = It.get(e);
        if (void 0 !== t) return t;
    }
    class NullPrototype extends e {
        get [Symbol.toStringTag]() {
            return "";
        }
    }
    o(NullPrototype.prototype.constructor, "name", {
        value: `[${t}: null prototype]`
    });
    It.set(e, NullPrototype);
    return NullPrototype;
}

function Ht(e, t, n) {
    let i;
    if (U(t)) {
        const e = Vt(Set, "Set");
        i = new e(E(t));
    } else if (B(t)) {
        const e = Vt(Map, "Map");
        i = new e(L(t));
    } else if (Array.isArray(t)) {
        const e = Vt(Array, "Array");
        i = new e(t.length);
    } else if (ee(t)) {
        const e = Ft(t);
        const n = Vt(e, e.name);
        i = new n(t);
    }
    if (void 0 !== i) {
        l(i, r(t));
        return on(e, i, n);
    }
    return;
}

function Bt(e, t) {
    return e(c(t, -0) ? "-0" : `${t}`, "number");
}

function Dt(e, t, n) {
    switch (typeof t) {
      case "string":
        if (true !== n.compact && n.indentationLvl + t.length > n.breakLength && t.length > xt) {
            const i = n.breakLength - n.indentationLvl;
            const r = Math.max(i, xt);
            const a = Math.ceil(t.length / r);
            const s = Math.ceil(t.length / a);
            const o = Math.max(s, xt);
            if (void 0 === yt[o]) yt[o] = new RegExp(`(.|\\n){1,${o}}(\\s|$)|(\\n|.)+?(\\s|$)`, "gm");
            const l = t.match(yt[o]);
            if (l.length > 1) {
                const t = " ".repeat(n.indentationLvl);
                let i = `${e(Le(l[0]), "string")} +\n`;
                let r = 1;
                for (;r < l.length - 1; r++) i += `${t}  ${e(Le(l[r]), "string")} +\n`;
                i += `${t}  ${e(Le(l[r]), "string")}`;
                return i;
            }
        }
        return e(Le(t), "string");

      case "number":
        return Bt(e, t);

      case "boolean":
        return e(t.toString(), "boolean");

      case "undefined":
        return e("undefined", "undefined");

      case "symbol":
        return e(t.toString(), "symbol");
    }
    throw new Error(`formatPrimitive only handles non-null primitives. Got: ${$(t)}`);
}

function Wt(e) {
    return e.stack || S(e);
}

function Ut(t, n, i, r, a, s) {
    const o = u(n);
    let l = s;
    for (;s < o.length && a.length < r; s++) {
        const u = o[s];
        const c = +u;
        if (c > 2 ** 32 - 2) break;
        if (`${l}` !== u) {
            if (!e.isArrayIndex(u)) break;
            const n = c - l;
            const i = n > 1 ? "s" : "";
            const s = `<${n} empty item${i}>`;
            a.push(t.stylize(s, "undefined"));
            l = c;
            if (a.length === r) break;
        }
        a.push(sn(t, n, i, u, pt));
        l++;
    }
    const c = n.length - l;
    if (a.length !== r) {
        if (c > 0) {
            const e = c > 1 ? "s" : "";
            const n = `<${c} empty item${e}>`;
            a.push(t.stylize(n, "undefined"));
        }
    } else if (c > 0) a.push(`... ${c} more item${c > 1 ? "s" : ""}`);
    return a;
}

function Jt(e, t) {
    const n = new Uint8Array(t);
    let i = Ce(n.slice(0, Math.min(e.maxArrayLength, n.length)).map((e => e.toString(16))), " ");
    const r = n.length - e.maxArrayLength;
    if (r > 0) i += ` ... ${r} more byte${r > 1 ? "s" : ""}`;
    return [ `${e.stylize("[Uint8Contents]", "special")}: <${i}>` ];
}

function Qt(e, t, n) {
    const i = t.length;
    const r = Math.min(Math.max(0, e.maxArrayLength), i);
    const a = i - r;
    const s = [];
    for (let i = 0; i < r; i++) {
        if (!b(t, i)) return Ut(e, t, n, r, s, i);
        s.push(sn(e, t, n, i, pt));
    }
    if (a > 0) s.push(`... ${a} more item${a > 1 ? "s" : ""}`);
    return s;
}

function Gt(e, t, n) {
    const i = Math.min(Math.max(0, e.maxArrayLength), t.length);
    const r = t.length - i;
    const a = new Array(i);
    let s = 0;
    for (;s < i; ++s) a[s] = Bt(e.stylize, t[s]);
    if (r > 0) a[s] = `... ${r} more item${r > 1 ? "s" : ""}`;
    if (e.showHidden) {
        e.indentationLvl += 2;
        for (const i of Ot) {
            const r = ln(e, t[i], n, true);
            a.push(`[${i}]: ${r}`);
        }
        e.indentationLvl -= 2;
    }
    return a;
}

function Yt(e, t, n) {
    const i = [];
    e.indentationLvl += 2;
    for (const r of t) i.push(ln(e, r, n));
    e.indentationLvl -= 2;
    if (e.showHidden) i.push(`[size]: ${e.stylize(t.size.toString(), "number")}`);
    return i;
}

function Kt(e, t, n) {
    const i = [];
    e.indentationLvl += 2;
    for (const [r, a] of t) i.push(`${ln(e, r, n)} => ${ln(e, a, n)}`);
    e.indentationLvl -= 2;
    if (e.showHidden) i.push(`[size]: ${e.stylize(t.size.toString(), "number")}`);
    return i;
}

function Xt(e, t, n, i) {
    const r = Math.max(e.maxArrayLength, 0);
    const a = Math.min(r, n.length);
    const s = new Array(a);
    e.indentationLvl += 2;
    for (let i = 0; i < a; i++) s[i] = ln(e, n[i], t);
    e.indentationLvl -= 2;
    if (i === $t) s.sort();
    const o = n.length - a;
    if (o > 0) s.push(`... ${o} more item${o > 1 ? "s" : ""}`);
    return s;
}

function Zt(e, t, n, i) {
    const r = Math.max(e.maxArrayLength, 0);
    const a = n.length / 2;
    const s = a - r;
    const o = Math.min(r, a);
    const l = new Array(o);
    let u = "";
    let c = "";
    let h = " => ";
    let d = 0;
    if (i === kt) {
        u = "[ ";
        c = " ]";
        h = ", ";
    }
    e.indentationLvl += 2;
    for (;d < o; d++) {
        const i = 2 * d;
        l[d] = `${u}${ln(e, n[i], t)}` + `${h}${ln(e, n[i + 1], t)}${c}`;
    }
    e.indentationLvl -= 2;
    if (i === $t) l.sort();
    if (s > 0) l.push(`... ${s} more item${s > 1 ? "s" : ""}`);
    return l;
}

function en(e) {
    return [ e.stylize("<items unknown>", "special") ];
}

function tn(e, t, n) {
    return Xt(e, n, [], $t);
}

function nn(e, t, n) {
    return Zt(e, n, [], $t);
}

function rn(e, t, n, i) {
    const r = Et(t.entries());
    if (t instanceof Map) {
        i[0] = i[0].replace(/ Iterator] {$/, " Entries] {");
        return Zt(e, n, r, kt);
    }
    return Xt(e, n, r, wt);
}

function an(e, t, n) {
    return [ "[object Promise]" ];
}

function sn(e, t, n, r, a) {
    switch (r) {
      case "$controller":
        return `$controller: { id: ${t.$controller.id} } (omitted for brevity)`;

      case "overrideContext":
        return "overrideContext: (omitted for brevity)";
    }
    let s, o;
    let l = " ";
    const u = i(t, r) || {
        value: t[r],
        enumerable: true
    };
    if (void 0 !== u.value) {
        const t = a !== ft || true !== e.compact ? 2 : 3;
        e.indentationLvl += t;
        o = ln(e, u.value, n);
        if (3 === t) {
            const t = e.colors ? ke(o).length : o.length;
            if (e.breakLength < t) l = `\n${" ".repeat(e.indentationLvl)}`;
        }
        e.indentationLvl -= t;
    } else if (void 0 !== u.get) {
        const i = void 0 !== u.set ? "Getter/Setter" : "Getter";
        const a = e.stylize;
        const s = "special";
        if (e.getters && (true === e.getters || "get" === e.getters && void 0 === u.set || "set" === e.getters && void 0 !== u.set)) try {
            const l = t[r];
            e.indentationLvl += 2;
            if (null === l) o = `${a(`[${i}:`, s)} ${a("null", "null")}${a("]", s)}`; else if ("object" === typeof l) o = `${a(`[${i}]`, s)} ${ln(e, l, n)}`; else {
                const t = Dt(a, l, e);
                o = `${a(`[${i}:`, s)} ${t}${a("]", s)}`;
            }
            e.indentationLvl -= 2;
        } catch (e) {
            const t = `<Inspection threw (${e.message})>`;
            o = `${a(`[${i}:`, s)} ${t}${a("]", s)}`;
        } else o = e.stylize(`[${i}]`, s);
    } else if (void 0 !== u.set) o = e.stylize("[Setter]", "special"); else o = e.stylize("undefined", "undefined");
    if (a === pt) return o;
    if (P(r)) {
        const t = Ae(r.toString());
        s = `[${e.stylize(t, "symbol")}]`;
    } else if (false === u.enumerable) s = `[${Ae(r.toString())}]`; else if (vt(r)) s = e.stylize(r, "name"); else s = e.stylize(Le(r), "string");
    return `${s}:${l}${o}`;
}

function on(e, t, n, i) {
    let r;
    const a = Tt(t, e);
    switch (a) {
      case "Container":
      case "ObserverLocator":
      case "Window":
        return e.stylize(`${a} (omitted for brevity)`, "special");

      case "Function":
        if ("Node" === t.name) return e.stylize("Node constructor (omitted for brevity)", "special");
    }
    let s = t[Symbol.toStringTag];
    if (!z(s)) s = "";
    let o = "";
    let l = jt;
    let u;
    let c = true;
    let h = 0;
    let d = ft;
    if (t[Symbol.iterator]) {
        c = false;
        if (Array.isArray(t)) {
            r = ge(t, e.showHidden);
            const n = Mt(a, s, "Array");
            u = [ `${"Array " === n ? "" : n}[`, "]" ];
            if (0 === t.length && 0 === r.length) return `${u[0]}]`;
            d = gt;
            l = Qt;
        } else if (U(t)) {
            r = zt(t, e.showHidden);
            const n = Mt(a, s, "Set");
            if (0 === t.size && 0 === r.length) return `${n}{}`;
            u = [ `${n}{`, "}" ];
            l = Yt;
        } else if (B(t)) {
            r = zt(t, e.showHidden);
            const n = Mt(a, s, "Map");
            if (0 === t.size && 0 === r.length) return `${n}{}`;
            u = [ `${n}{`, "}" ];
            l = Kt;
        } else if (ee(t)) {
            r = ge(t, e.showHidden);
            const n = null !== a ? Mt(a, s) : Mt(a, s, Ft(t).name);
            u = [ `${n}[`, "]" ];
            if (0 === t.length && 0 === r.length && !e.showHidden) return `${u[0]}]`;
            l = Gt;
            d = gt;
        } else if (D(t)) {
            r = zt(t, e.showHidden);
            u = Nt("Map", s);
            l = rn;
        } else if (J(t)) {
            r = zt(t, e.showHidden);
            u = Nt("Set", s);
            l = rn;
        } else c = true;
    }
    if (c) {
        r = zt(t, e.showHidden);
        u = [ "{", "}" ];
        if ("Object" === a) {
            if (ce(t)) u[0] = "[Arguments] {"; else if ("" !== s) u[0] = `${Mt(a, s, "Object")}{`;
            if (0 === r.length) return `${u[0]}}`;
        } else if (F(t)) {
            const n = a || s || "Function";
            let i = `${n}`;
            if (t.name && z(t.name)) i += `: ${t.name}`;
            if (0 === r.length) return e.stylize(`[${i}]`, "special");
            o = `[${i}]`;
        } else if (W(t)) {
            o = w(null !== a ? t : new RegExp(t));
            const i = Mt(a, s, "RegExp");
            if ("RegExp " !== i) o = `${i}${o}`;
            if (0 === r.length || n > e.depth && null !== e.depth) return e.stylize(o, "regexp");
        } else if (H(t)) {
            o = Number.isNaN(O(t)) ? C(t) : k(t);
            const n = Mt(a, s, "Date");
            if ("Date " !== n) o = `${n}${o}`;
            if (0 === r.length) return e.stylize(o, "date");
        } else if (Q(t)) {
            o = Wt(t);
            const n = o.indexOf("\n    at");
            if (-1 === n) o = `[${o}]`;
            if (0 !== e.indentationLvl) {
                const n = " ".repeat(e.indentationLvl);
                o = Wt(t).replace(/\n/g, `\n${n}`);
            }
            if (0 === r.length) return o;
            if (false === e.compact && -1 !== n) {
                u[0] += `${o.slice(n)}`;
                o = `[${o.slice(0, n)}]`;
            }
        } else if (V(t)) {
            const n = I(t) ? "ArrayBuffer" : "SharedArrayBuffer";
            const o = Mt(a, s, n);
            if (void 0 === i) l = Jt; else if (0 === r.length) return `${o}{ byteLength: ${Bt(e.stylize, t.byteLength)} }`;
            u[0] = `${o}{`;
            r.unshift("byteLength");
        } else if (he(t)) {
            u[0] = `${Mt(a, s, "DataView")}{`;
            r.unshift("byteLength", "byteOffset", "buffer");
        } else if (de(t)) {
            u[0] = `${Mt(a, s, "Promise")}{`;
            l = an;
        } else if (fe(t)) {
            u[0] = `${Mt(a, s, "WeakSet")}{`;
            l = e.showHidden ? tn : en;
        } else if (pe(t)) {
            u[0] = `${Mt(a, s, "WeakMap")}{`;
            l = e.showHidden ? nn : en;
        } else if (Z(t)) {
            let n;
            if (G(t)) {
                o = `[Number: ${Rt(T(t), e)}]`;
                n = "number";
            } else if (Y(t)) {
                o = `[String: ${Rt(M(t), e)}]`;
                n = "string";
                r = r.slice(t.length);
            } else if (K(t)) {
                o = `[Boolean: ${Rt(A(t), e)}]`;
                n = "boolean";
            } else {
                o = `[Symbol: ${Rt(j(t), e)}]`;
                n = "symbol";
            }
            if (0 === r.length) return e.stylize(o, n);
        } else {
            if (null === a) {
                const i = Ht(e, t, n);
                if (i) return i;
            }
            if (D(t)) {
                u = Nt("Map", s);
                l = rn;
            } else if (J(t)) {
                u = Nt("Set", s);
                l = rn;
            } else if (0 === r.length) return `${Mt(a, s, "Object")}{}`; else u[0] = `${Mt(a, s, "Object")}{`;
        }
    }
    if (n > e.depth && null !== e.depth) return e.stylize(`[${Pt(a, s)}]`, "special");
    n += 1;
    e.seen.push(t);
    e.currentDepth = n;
    let f;
    const p = e.indentationLvl;
    try {
        f = l(e, t, n, r, u);
        let i;
        const a = !(t instanceof exports.PLATFORM.Node);
        for (h = 0; h < r.length; h++) {
            i = r[h];
            if ((a || "textContent" === i || "outerHTML" === i) && "$$calls" !== i) f.push(sn(e, t, n, r[h], d));
        }
    } catch (t) {
        return St(e, t, a, s, p);
    }
    e.seen.pop();
    if (e.sorted) {
        const t = true === e.sorted ? void 0 : e.sorted;
        if (d === ft) f.sort(t); else if (r.length > 1) {
            const e = f.slice(f.length - r.length).sort(t);
            f.splice(f.length - r.length, r.length, ...e);
        }
    }
    let g = false;
    if (R(e.compact)) {
        const t = f.length;
        if (d === gt && f.length > 6) f = Ct(e, f);
        if (e.currentDepth - n < e.compact && t === f.length) g = true;
    }
    const m = At(e, f, o, u, g);
    const b = e.budget[e.indentationLvl] || 0;
    const v = b + m.length;
    e.budget[e.indentationLvl] = v;
    if (v > 2 ** 27) e.stop = true;
    return m;
}

function ln(e, t, n, i) {
    if ("object" !== typeof t && "function" !== typeof t) return Dt(e.stylize, t, e);
    if (null === t) return e.stylize("null", "null");
    if (void 0 !== e.stop) {
        const n = Tt(t, e) || t[Symbol.toStringTag];
        return e.stylize(`[${n || "Object"}]`, "special");
    }
    if (e.customInspect) {
        const i = t[lt];
        if (F(i) && i !== un && !(t.constructor && t.constructor.prototype === t)) {
            const r = null === e.depth ? null : e.depth - n;
            const a = i.call(t, r, rt(e));
            if (a !== t) {
                if (!z(a)) return ln(e, a, n);
                return a.replace(/\n/g, `\n${" ".repeat(e.indentationLvl)}`);
            }
        }
    }
    if (e.seen.includes(t)) return e.stylize("[Circular]", "special");
    return on(e, t, n, i);
}

function un(e, t = {}) {
    const n = at(t);
    return ln(n, e, 0);
}

function cn(e) {
    return un(e, {
        compact: false,
        customInspect: false,
        depth: 100,
        maxArrayLength: 1 / 0,
        showHidden: false,
        breakLength: 1 / 0,
        showProxy: false,
        sorted: true,
        getters: true
    });
}

function hn(e, t, n, i, r) {
    if (void 0 === n) n = 0;
    if ("object" !== typeof t || null === t) {
        hi.strictEqual(e, t, `actual, depth=${n}, prop=${i}, index=${r}`);
        return;
    }
    if (t instanceof Array) {
        for (let r = 0; r < t.length; r++) hn(e[r], t[r], n + 1, i, r);
        return;
    }
    if (t.nodeType > 0) {
        if (11 === t.nodeType) for (let r = 0; r < t.childNodes.length; r++) hn(e.childNodes.item(r), t.childNodes.item(r), n + 1, i, r); else hi.strictEqual(e.outerHTML, t.outerHTML, `actual.outerHTML, depth=${n}, prop=${i}, index=${r}`);
        return;
    }
    if (e) {
        hi.strictEqual(e.constructor.name, t.constructor.name, `actual.constructor.name, depth=${n}, prop=${i}, index=${r}`);
        hi.strictEqual(e.toString(), t.toString(), `actual.toString(), depth=${n}, prop=${i}, index=${r}`);
        for (const i of Object.keys(t)) hn(e[i], t[i], n + 1, i, r);
    }
}

function dn(e, t) {
    var n, i, r;
    const a = null !== (i = null !== (n = t.parentNode) && void 0 !== n ? n : t.host) && void 0 !== i ? i : null;
    if (null === a || a === e) return null;
    return null !== (r = a.nextSibling) && void 0 !== r ? r : dn(e, a);
}

function fn(e, n) {
    var i, r, a, s, o;
    return null !== (o = null !== (s = null !== (a = null === (r = null === (i = t.CustomElement.for(n, {
        optional: true
    })) || void 0 === i ? void 0 : i.shadowRoot) || void 0 === r ? void 0 : r.firstChild) && void 0 !== a ? a : n.firstChild) && void 0 !== s ? s : n.nextSibling) && void 0 !== o ? o : dn(e, n);
}

function pn(e, n) {
    var i, r, a;
    let s = "";
    let o = null !== (a = null === (r = null === (i = t.CustomElement.for(e, {
        optional: true
    })) || void 0 === i ? void 0 : i.shadowRoot) || void 0 === r ? void 0 : r.firstChild) && void 0 !== a ? a : e.firstChild;
    while (null !== o) {
        if (3 === o.nodeType) s += o.data;
        o = fn(e, o);
    }
    return n && s ? s.replace(/\s\s+/g, " ").trim() : s;
}

function gn(e) {
    switch (e) {
      case "ha":
        return "textBinding";

      case "rf":
        return "interpolation";

      case "rg":
        return "propertyBinding";

      case "rk":
        return "iteratorBinding";

      case "hb":
        return "listenerBinding";

      case "rh":
        return "callBinding";

      case "rj":
        return "refBinding";

      case "hd":
        return "stylePropertyBinding";

      case "re":
        return "setProperty";

      case "he":
        return "setAttribute";

      case "ra":
        return "hydrateElement";

      case "rb":
        return "hydrateAttribute";

      case "rc":
        return "hydrateTemplateController";

      case "rd":
        return "hydrateLetElement";

      case "ri":
        return "letBinding";

      default:
        return e;
    }
}

function mn(e, t, n, i) {
    if (void 0 === i) i = "instruction";
    if (void 0 === n) n = [];
    if (!(t instanceof Object) || !(e instanceof Object)) if (e !== t) if (i.endsWith(".name")) {
        if ("unnamed" === String(t) && String(e).startsWith("unnamed-")) n.push(`OK   : ${i} === ${t} (${e})`);
    } else if (i.endsWith(".key")) {
        if (String(t).endsWith("unnamed") && /unnamed-\d+$/.test(String(e))) n.push(`OK   : ${i} === ${t} (${e})`);
    } else {
        if ("object" === typeof t && null != t) t = JSON.stringify(t);
        if ("object" === typeof e && null != e) e = JSON.stringify(e);
        if (i.endsWith("type")) {
            t = gn(t);
            e = gn(e);
        }
        n.push(`WRONG: ${i} === ${e} (expected: ${t})`);
    } else n.push(`OK   : ${i} === ${t}`); else if (t instanceof Array) for (let r = 0, a = Math.max(t.length, e.length); r < a; ++r) mn(e[r], t[r], n, `${i}[${r}]`); else if (t.nodeType > 0) if (11 === t.nodeType) for (let r = 0, a = Math.max(t.childNodes.length, e.childNodes.length); r < a; ++r) mn(e.childNodes.item(r), t.childNodes.item(r), n, `${i}.childNodes[${r}]`); else if (e.outerHTML !== t["outerHTML"]) n.push(`WRONG: ${i}.outerHTML === ${e.outerHTML} (expected: ${t["outerHTML"]})`); else n.push(`OK   : ${i}.outerHTML === ${t}`); else if (e) {
        const r = {};
        for (const a in t) {
            mn(e[a], t[a], n, `${i}.${a}`);
            r[a] = true;
        }
        for (const a in e) if (!r[a]) mn(e[a], t[a], n, `${i}.${a}`);
    }
    if ("instruction" === i && n.some((e => e.startsWith("W")))) throw new Error(`Failed assertion: binding instruction mismatch\n  - ${n.join("\n  - ")}`);
}

function bn(e) {
    if (!e) e = t.BrowserPlatform.getOrCreate(globalThis);
    e.taskQueue.flush();
    e.taskQueue["pending"].forEach((e => e.cancel()));
    e.domWriteQueue.flush();
    e.domWriteQueue["pending"].forEach((e => e.cancel()));
    e.domReadQueue.flush();
    e.domReadQueue["pending"].forEach((e => e.cancel()));
}

const vn = Symbol("noException");

function yn(e) {
    if (Q(e.message)) throw e.message;
    throw new AssertionError(e);
}

function xn(e, t, n, i) {
    if (!n) {
        let r = false;
        if (0 === t) {
            r = true;
            i = "No value argument passed to `assert.ok()`";
        } else if (Q(i)) throw i;
        const a = new AssertionError({
            actual: n,
            expected: true,
            message: i,
            operator: "==",
            stackStartFn: e
        });
        a.generatedMessage = r;
        throw a;
    }
}

class Comparison {
    constructor(e, t, n) {
        for (const i of t) if (i in e) if (!q(n) && z(n[i]) && W(e[i]) && e[i].test(n[i])) this[i] = n[i]; else this[i] = e[i];
    }
}

function $n(e, t, n, i, r) {
    if (!(n in e) || !Ye(e[n], t[n])) {
        if (!i) {
            const n = new Comparison(e, r);
            const i = new Comparison(t, r, e);
            const a = new AssertionError({
                actual: n,
                expected: i,
                operator: "deepStrictEqual",
                stackStartFn: En
            });
            a.actual = e;
            a.expected = t;
            a.operator = "throws";
            throw a;
        }
        yn({
            actual: e,
            expected: t,
            message: i,
            operator: "throws",
            stackStartFn: En
        });
    }
}

function wn(e, t, n) {
    if (!F(t)) {
        if (W(t)) return t.test(e);
        if (N(e)) {
            const i = new AssertionError({
                actual: e,
                expected: t,
                message: n,
                operator: "deepStrictEqual",
                stackStartFn: En
            });
            i.operator = "throws";
            throw i;
        }
        const i = u(t);
        if (Q(t)) i.push("name", "message");
        for (const r of i) {
            if (z(e[r]) && W(t[r]) && t[r].test(e[r])) continue;
            $n(e, t, r, n, i);
        }
        return true;
    }
    if (void 0 !== t.prototype && e instanceof t) return true;
    if (Object.prototype.isPrototypeOf.call(Error, t)) return false;
    return true === t.call({}, e);
}

function kn(e) {
    try {
        e();
    } catch (e) {
        return e;
    }
    return vn;
}

async function Cn(e) {
    let t;
    if (F(e)) t = e(); else t = e;
    try {
        await t;
    } catch (e) {
        return e;
    }
    return vn;
}

function Sn(e, t, n, i) {
    if (z(n)) {
        i = n;
        n = void 0;
    }
    if (t === vn) {
        let t = "";
        if (n && n.name) t += ` (${n.name})`;
        t += i ? `: ${i}` : ".";
        const r = "rejects" === e.name ? "rejection" : "exception";
        yn({
            actual: void 0,
            expected: n,
            operator: e.name,
            message: `Missing expected ${r}${t}`,
            stackStartFn: e
        });
    }
    if (n && false === wn(t, n, i)) throw t;
}

function On(e, t, n, i) {
    if (t === vn) return;
    if (z(n)) {
        i = n;
        n = void 0;
    }
    if (!n || wn(t, n)) {
        const r = i ? `: ${i}` : ".";
        const a = "doesNotReject" === e.name ? "rejection" : "exception";
        yn({
            actual: t,
            expected: n,
            operator: e.name,
            message: `Got unwanted ${a}${r}\nActual message: "${t && t.message}"`,
            stackStartFn: e
        });
    }
    throw t;
}

function En(e, t, n) {
    Sn(En, kn(e), t, n);
}

async function Ln(e, t, n) {
    Sn(Ln, await Cn(e), t, n);
}

function An(e, t, n) {
    On(An, kn(e), t, n);
}

async function Tn(e, t, n) {
    On(Tn, await Cn(e), t, n);
}

function jn(...e) {
    xn(jn, e.length, ...e);
}

function Mn(e = "Failed") {
    if (Q(e)) throw e;
    const t = new AssertionError({
        message: e,
        actual: void 0,
        expected: void 0,
        operator: "fail",
        stackStartFn: Mn
    });
    t.generatedMessage = "Failed" === e;
    throw t;
}

function Rn(e, t, n) {
    const i = pn(e);
    if (i !== t) yn({
        actual: i,
        expected: t,
        message: n,
        operator: "==",
        stackStartFn: Rn
    });
}

function zn(e, t, n) {
    if (e != t) yn({
        actual: e,
        expected: t,
        message: n,
        operator: "==",
        stackStartFn: zn
    });
}

function Pn(e, t, n) {
    if (typeof e !== t) yn({
        actual: e,
        expected: t,
        message: n,
        operator: "typeof",
        stackStartFn: Pn
    });
}

function qn(e, t, n) {
    if (!(e instanceof t)) yn({
        actual: e,
        expected: t,
        message: n,
        operator: "instanceOf",
        stackStartFn: qn
    });
}

function _n(e, t, n) {
    if (e instanceof t) yn({
        actual: e,
        expected: t,
        message: n,
        operator: "notInstanceOf",
        stackStartFn: _n
    });
}

function Fn(e, t, n) {
    if (!e.includes(t)) yn({
        actual: e,
        expected: t,
        message: n,
        operator: "includes",
        stackStartFn: Fn
    });
}

function Nn(e, t, n) {
    if (e.includes(t)) yn({
        actual: e,
        expected: t,
        message: n,
        operator: "notIncludes",
        stackStartFn: Nn
    });
}

function In(e, t, n) {
    if (!e.contains(t)) yn({
        actual: e,
        expected: t,
        message: n,
        operator: "contains",
        stackStartFn: In
    });
}

function Vn(e, t, n) {
    if (e.contains(t)) yn({
        actual: e,
        expected: t,
        message: n,
        operator: "notContains",
        stackStartFn: Vn
    });
}

function Hn(e, t, n) {
    if (!(e > t)) yn({
        actual: e,
        expected: t,
        message: n,
        operator: "greaterThan",
        stackStartFn: Hn
    });
}

function Bn(e, t, n) {
    if (!(e >= t)) yn({
        actual: e,
        expected: t,
        message: n,
        operator: "greaterThanOrEqualTo",
        stackStartFn: Bn
    });
}

function Dn(e, t, n) {
    if (!(e < t)) yn({
        actual: e,
        expected: t,
        message: n,
        operator: "lessThan",
        stackStartFn: Dn
    });
}

function Wn(e, t, n) {
    if (!(e <= t)) yn({
        actual: e,
        expected: t,
        message: n,
        operator: "lessThanOrEqualTo",
        stackStartFn: Wn
    });
}

function Un(e, t, n) {
    if (e == t) yn({
        actual: e,
        expected: t,
        message: n,
        operator: "!=",
        stackStartFn: Un
    });
}

function Jn(e, t, n) {
    if (!Ge(e, t)) yn({
        actual: e,
        expected: t,
        message: n,
        operator: "deepEqual",
        stackStartFn: Jn
    });
}

function Qn(e, t, n) {
    if (Ge(e, t)) yn({
        actual: e,
        expected: t,
        message: n,
        operator: "notDeepEqual",
        stackStartFn: Qn
    });
}

function Gn(e, t, n) {
    if (!Ye(e, t)) yn({
        actual: e,
        expected: t,
        message: n,
        operator: "deepStrictEqual",
        stackStartFn: Gn
    });
}

function Yn(e, t, n) {
    if (Ye(e, t)) yn({
        actual: e,
        expected: t,
        message: n,
        operator: "notDeepStrictEqual",
        stackStartFn: Yn
    });
}

function Kn(e, t, n) {
    if (!c(e, t)) yn({
        actual: e,
        expected: t,
        message: n,
        operator: "strictEqual",
        stackStartFn: Kn
    });
}

function Xn(e, t, n) {
    if (c(e, t)) yn({
        actual: e,
        expected: t,
        message: n,
        operator: "notStrictEqual",
        stackStartFn: Xn
    });
}

function Zn(e, t, n) {
    if (!t.test(e)) yn({
        actual: e,
        expected: t,
        message: n,
        operator: "match",
        stackStartFn: Zn
    });
}

function ei(e, t, n) {
    if (t.test(e)) yn({
        actual: e,
        expected: t,
        message: n,
        operator: "notMatch",
        stackStartFn: ei
    });
}

function ti(e, n) {
    if (!t.CustomElement.isType(e)) yn({
        actual: false,
        expected: true,
        message: n,
        operator: "isCustomElementType",
        stackStartFn: ti
    });
}

function ni(e, n) {
    if (!t.CustomAttribute.isType(e)) yn({
        actual: false,
        expected: true,
        message: n,
        operator: "isCustomAttributeType",
        stackStartFn: ti
    });
}

function ii(e, t = exports.PLATFORM.document) {
    return "string" === typeof e ? t.querySelector(e) : e;
}

function ri(e, t, n, i) {
    const r = ii(e, i);
    const a = r && pn(r, true);
    if (a !== t) yn({
        actual: a,
        expected: t,
        message: n,
        operator: "==",
        stackStartFn: ri
    });
}

function ai(e, t, n, i) {
    const r = ii(e, i);
    const a = r instanceof HTMLInputElement && r.value;
    if (a !== t) yn({
        actual: a,
        expected: t,
        message: n,
        operator: "==",
        stackStartFn: ai
    });
}

function si(e, t, n, i, r = true) {
    const a = ii(e, i);
    let s = a.innerHTML;
    if (r) s = s.replace(/<!--au-start-->/g, "").replace(/<!--au-end-->/g, "").replace(/\s+/g, " ").trim();
    if (s !== t) yn({
        actual: s,
        expected: t,
        message: n,
        operator: "==",
        stackStartFn: si
    });
}

function oi(e, t) {
    const n = exports.PLATFORM.window.getComputedStyle(e);
    for (const [e, i] of Object.entries(t)) {
        const t = n[e];
        if (t !== i) return {
            isMatch: false,
            property: e,
            actual: t,
            expected: i
        };
    }
    return {
        isMatch: true
    };
}

function li(e, t, n) {
    const i = oi(e, t);
    if (!i.isMatch) {
        const {property: e, actual: t, expected: r} = i;
        yn({
            actual: `${e}:${t}`,
            expected: `${e}:${r}`,
            message: n,
            operator: "==",
            stackStartFn: li
        });
    }
}

function ui(e, t, n) {
    const i = oi(e, t);
    if (i.isMatch) {
        const e = Object.entries(t).map((([e, t]) => `${e}:${t}`)).join(",");
        yn({
            actual: e,
            expected: e,
            message: n,
            operator: "!=",
            stackStartFn: ui
        });
    }
}

const ci = function() {
    function e(e) {
        return (10 * e + .5 | 0) / 10;
    }
    function n(t) {
        var n;
        const i = t.id;
        const r = e(t.createdTime);
        const a = e(t.queueTime);
        const s = t.preempt;
        const o = t.reusable;
        const l = t.persistent;
        const u = t.status;
        return `    task id=${i} createdTime=${r} queueTime=${a} preempt=${s} reusable=${o} persistent=${l} status=${u}\n` + `    task callback="${null === (n = t.callback) || void 0 === n ? void 0 : n.toString()}"`;
    }
    function i(e, t) {
        const i = t["processing"];
        const r = t["pending"];
        const a = t["delayed"];
        const s = t["flushRequested"];
        let o = `${e} has processing=${i.length} pending=${r.length} delayed=${a.length} flushRequested=${s}\n\n`;
        if (i.length > 0) o += `  Tasks in processing:\n${i.map(n).join("")}`;
        if (r.length > 0) o += `  Tasks in pending:\n${r.map(n).join("")}`;
        if (a.length > 0) o += `  Tasks in delayed:\n${a.map(n).join("")}`;
        return o;
    }
    return function e(n) {
        const r = t.BrowserPlatform.getOrCreate(globalThis);
        const a = r.domWriteQueue;
        const s = r.taskQueue;
        const o = r.domReadQueue;
        let l = true;
        let u = "";
        if (!a.isEmpty) {
            u += `\n${i("domWriteQueue", a)}\n\n`;
            l = false;
        }
        if (!s.isEmpty) {
            u += `\n${i("taskQueue", s)}\n\n`;
            l = false;
        }
        if (!o.isEmpty) {
            u += `\n${i("domReadQueue", o)}\n\n`;
            l = false;
        }
        if (!l) {
            if (true === n) bn(r);
            yn({
                actual: void 0,
                expected: void 0,
                message: u,
                operator: "",
                stackStartFn: e
            });
        }
    };
}();

const hi = h({
    throws: En,
    doesNotThrow: An,
    rejects: Ln,
    doesNotReject: Tn,
    ok: jn,
    fail: Mn,
    equal: zn,
    typeOf: Pn,
    instanceOf: qn,
    notInstanceOf: _n,
    includes: Fn,
    notIncludes: Nn,
    contains: In,
    notContains: Vn,
    greaterThan: Hn,
    greaterThanOrEqualTo: Bn,
    lessThan: Dn,
    lessThanOrEqualTo: Wn,
    notEqual: Un,
    deepEqual: Jn,
    notDeepEqual: Qn,
    deepStrictEqual: Gn,
    notDeepStrictEqual: Yn,
    strictEqual: Kn,
    notStrictEqual: Xn,
    match: Zn,
    notMatch: ei,
    visibleTextEqual: Rn,
    areTaskQueuesEmpty: ci,
    isCustomElementType: ti,
    isCustomAttributeType: ni,
    strict: {
        deepEqual: Gn,
        notDeepEqual: Yn,
        equal: Kn,
        notEqual: Xn
    },
    html: {
        textContent: ri,
        innerEqual: si,
        value: ai,
        computedStyle: li,
        notComputedStyle: ui
    }
});

const di = {
    "align-content": {
        values: [ "baseline", "center", "end", "first baseline", "flex-end", "flex-start", "inherit", "initial", "last baseline", "normal", "safe", "space-around", "space-between", "space-evenly", "start", "stretch", "unsafe", "unset" ]
    },
    "align-items": {
        values: [ "baseline", "center", "end", "first baseline", "flex-end", "flex-start", "inherit", "initial", "last baseline", "normal", "safe", "self-end", "self-start", "start", "stretch", "unsafe", "unset" ]
    },
    "align-self": {
        values: [ "auto", "baseline", "center", "end", "first baseline", "flex-end", "flex-start", "inherit", "initial", "last baseline", "normal", "safe", "self-end", "self-start", "start", "stretch", "unsafe", "unset" ]
    },
    all: {
        values: [ "inherit", "initial", "unset" ]
    },
    animation: {
        values: [ "alternate", "alternate-reverse", "backwards", "both", "cubic-bezier", "ease", "ease-in", "ease-in-out", "ease-out", "forwards", "frames", "infinite", "inherit", "initial", "linear", "none", "normal", "paused", "reverse", "running", "step-end", "step-start", "steps", "unset" ]
    },
    "animation-delay": {
        values: [ "inherit", "initial", "unset" ]
    },
    "animation-direction": {
        values: [ "alternate", "alternate-reverse", "inherit", "initial", "normal", "reverse", "unset" ]
    },
    "animation-duration": {
        values: [ "inherit", "initial", "unset" ]
    },
    "animation-fill-mode": {
        values: [ "backwards", "both", "forwards", "inherit", "initial", "none", "unset" ]
    },
    "animation-iteration-count": {
        values: [ "infinite", "inherit", "initial", "unset" ]
    },
    "animation-name": {
        values: [ "inherit", "initial", "none", "unset" ]
    },
    "animation-play-state": {
        values: [ "inherit", "initial", "paused", "running", "unset" ]
    },
    "animation-timing-function": {
        values: [ "cubic-bezier", "ease", "ease-in", "ease-in-out", "ease-out", "frames", "inherit", "initial", "linear", "step-end", "step-start", "steps", "unset" ]
    },
    "backface-visibility": {
        values: [ "hidden", "inherit", "initial", "unset", "visible" ]
    },
    background: {
        values: [ "COLOR", "auto", "border-box", "bottom", "center", "contain", "content-box", "cover", "currentColor", "fixed", "hsl", "hsla", "inherit", "initial", "left", "linear-gradient", "local", "no-repeat", "none", "padding-box", "radial-gradient", "repeat", "repeat-x", "repeat-y", "repeating-linear-gradient", "repeating-radial-gradient", "rgb", "rgba", "right", "round", "scroll", "space", "text", "top", "transparent", "unset", "url" ]
    },
    "background-attachment": {
        values: [ "fixed", "inherit", "initial", "local", "scroll", "unset" ]
    },
    "background-blend-mode": {
        values: [ "color", "color-burn", "color-dodge", "darken", "difference", "exclusion", "hard-light", "hue", "inherit", "initial", "lighten", "luminosity", "multiply", "normal", "overlay", "saturation", "screen", "soft-light", "unset" ]
    },
    "background-clip": {
        values: [ "border-box", "content-box", "inherit", "initial", "padding-box", "text", "unset" ]
    },
    "background-color": {
        values: [ "COLOR", "currentColor", "hsl", "hsla", "inherit", "initial", "rgb", "rgba", "transparent", "unset" ]
    },
    "background-image": {
        values: [ "inherit", "initial", "linear-gradient", "none", "radial-gradient", "repeating-linear-gradient", "repeating-radial-gradient", "unset", "url" ]
    },
    "background-origin": {
        values: [ "border-box", "content-box", "inherit", "initial", "padding-box", "unset" ]
    },
    "background-position": {
        values: [ "bottom", "center", "inherit", "initial", "left", "right", "top", "unset" ]
    },
    "background-position-x": {
        values: [ "center", "inherit", "initial", "left", "right", "unset" ]
    },
    "background-position-y": {
        values: [ "bottom", "center", "inherit", "initial", "top", "unset" ]
    },
    "background-repeat": {
        values: [ "inherit", "initial", "no-repeat", "repeat", "repeat-x", "repeat-y", "round", "space", "unset" ]
    },
    "background-size": {
        values: [ "auto", "contain", "cover", "inherit", "initial", "unset" ]
    },
    "block-size": {
        values: [ "auto", "inherit", "initial", "unset" ]
    },
    border: {
        values: [ "COLOR", "currentColor", "dashed", "dotted", "double", "groove", "hidden", "hsl", "hsla", "inherit", "initial", "inset", "medium", "none", "outset", "rgb", "rgba", "ridge", "solid", "thick", "thin", "transparent", "unset" ]
    },
    "border-block-end": {
        values: [ "COLOR", "currentColor", "dashed", "dotted", "double", "groove", "hidden", "hsl", "hsla", "inherit", "initial", "inset", "medium", "none", "outset", "rgb", "rgba", "ridge", "solid", "thick", "thin", "transparent", "unset" ]
    },
    "border-block-end-color": {
        values: [ "COLOR", "currentColor", "hsl", "hsla", "inherit", "initial", "rgb", "rgba", "transparent", "unset" ]
    },
    "border-block-end-style": {
        values: [ "dashed", "dotted", "double", "groove", "hidden", "inherit", "initial", "inset", "none", "outset", "ridge", "solid", "unset" ]
    },
    "border-block-end-width": {
        values: [ "inherit", "initial", "medium", "thick", "thin", "unset" ]
    },
    "border-block-start": {
        values: [ "COLOR", "currentColor", "dashed", "dotted", "double", "groove", "hidden", "hsl", "hsla", "inherit", "initial", "inset", "medium", "none", "outset", "rgb", "rgba", "ridge", "solid", "thick", "thin", "transparent", "unset" ]
    },
    "border-block-start-color": {
        values: [ "COLOR", "currentColor", "hsl", "hsla", "inherit", "initial", "rgb", "rgba", "transparent", "unset" ]
    },
    "border-block-start-style": {
        values: [ "dashed", "dotted", "double", "groove", "hidden", "inherit", "initial", "inset", "none", "outset", "ridge", "solid", "unset" ]
    },
    "border-block-start-width": {
        values: [ "inherit", "initial", "medium", "thick", "thin", "unset" ]
    },
    "border-bottom": {
        values: [ "COLOR", "currentColor", "dashed", "dotted", "double", "groove", "hidden", "hsl", "hsla", "inherit", "initial", "inset", "medium", "none", "outset", "rgb", "rgba", "ridge", "solid", "thick", "thin", "transparent", "unset" ]
    },
    "border-bottom-color": {
        values: [ "COLOR", "currentColor", "hsl", "hsla", "inherit", "initial", "rgb", "rgba", "transparent", "unset" ]
    },
    "border-bottom-left-radius": {
        values: [ "inherit", "initial", "unset" ]
    },
    "border-bottom-right-radius": {
        values: [ "inherit", "initial", "unset" ]
    },
    "border-bottom-style": {
        values: [ "dashed", "dotted", "double", "groove", "hidden", "inherit", "initial", "inset", "none", "outset", "ridge", "solid", "unset" ]
    },
    "border-bottom-width": {
        values: [ "inherit", "initial", "medium", "thick", "thin", "unset" ]
    },
    "border-collapse": {
        values: [ "collapse", "inherit", "initial", "separate", "unset" ]
    },
    "border-color": {
        values: [ "COLOR", "currentColor", "hsl", "hsla", "inherit", "initial", "rgb", "rgba", "transparent", "unset" ]
    },
    "border-image": {
        values: [ "auto", "fill", "inherit", "initial", "linear-gradient", "none", "radial-gradient", "repeat", "repeating-linear-gradient", "repeating-radial-gradient", "round", "space", "stretch", "unset", "url" ]
    },
    "border-image-outset": {
        values: [ "inherit", "initial", "unset" ]
    },
    "border-image-repeat": {
        values: [ "inherit", "initial", "repeat", "round", "space", "stretch", "unset" ]
    },
    "border-image-slice": {
        values: [ "fill", "inherit", "initial", "unset" ]
    },
    "border-image-source": {
        values: [ "inherit", "initial", "linear-gradient", "none", "radial-gradient", "repeating-linear-gradient", "repeating-radial-gradient", "unset", "url" ]
    },
    "border-image-width": {
        values: [ "auto", "inherit", "initial", "unset" ]
    },
    "border-inline-end": {
        values: [ "COLOR", "currentColor", "dashed", "dotted", "double", "groove", "hidden", "hsl", "hsla", "inherit", "initial", "inset", "medium", "none", "outset", "rgb", "rgba", "ridge", "solid", "thick", "thin", "transparent", "unset" ]
    },
    "border-inline-end-color": {
        values: [ "COLOR", "currentColor", "hsl", "hsla", "inherit", "initial", "rgb", "rgba", "transparent", "unset" ]
    },
    "border-inline-end-style": {
        values: [ "dashed", "dotted", "double", "groove", "hidden", "inherit", "initial", "inset", "none", "outset", "ridge", "solid", "unset" ]
    },
    "border-inline-end-width": {
        values: [ "inherit", "initial", "medium", "thick", "thin", "unset" ]
    },
    "border-inline-start": {
        values: [ "COLOR", "currentColor", "dashed", "dotted", "double", "groove", "hidden", "hsl", "hsla", "inherit", "initial", "inset", "medium", "none", "outset", "rgb", "rgba", "ridge", "solid", "thick", "thin", "transparent", "unset" ]
    },
    "border-inline-start-color": {
        values: [ "COLOR", "currentColor", "hsl", "hsla", "inherit", "initial", "rgb", "rgba", "transparent", "unset" ]
    },
    "border-inline-start-style": {
        values: [ "dashed", "dotted", "double", "groove", "hidden", "inherit", "initial", "inset", "none", "outset", "ridge", "solid", "unset" ]
    },
    "border-inline-start-width": {
        values: [ "inherit", "initial", "medium", "thick", "thin", "unset" ]
    },
    "border-left": {
        values: [ "COLOR", "currentColor", "dashed", "dotted", "double", "groove", "hidden", "hsl", "hsla", "inherit", "initial", "inset", "medium", "none", "outset", "rgb", "rgba", "ridge", "solid", "thick", "thin", "transparent", "unset" ]
    },
    "border-left-color": {
        values: [ "COLOR", "currentColor", "hsl", "hsla", "inherit", "initial", "rgb", "rgba", "transparent", "unset" ]
    },
    "border-left-style": {
        values: [ "dashed", "dotted", "double", "groove", "hidden", "inherit", "initial", "inset", "none", "outset", "ridge", "solid", "unset" ]
    },
    "border-left-width": {
        values: [ "inherit", "initial", "medium", "thick", "thin", "unset" ]
    },
    "border-radius": {
        values: [ "inherit", "initial", "unset" ]
    },
    "border-right": {
        values: [ "COLOR", "currentColor", "dashed", "dotted", "double", "groove", "hidden", "hsl", "hsla", "inherit", "initial", "inset", "medium", "none", "outset", "rgb", "rgba", "ridge", "solid", "thick", "thin", "transparent", "unset" ]
    },
    "border-right-color": {
        values: [ "COLOR", "currentColor", "hsl", "hsla", "inherit", "initial", "rgb", "rgba", "transparent", "unset" ]
    },
    "border-right-style": {
        values: [ "dashed", "dotted", "double", "groove", "hidden", "inherit", "initial", "inset", "none", "outset", "ridge", "solid", "unset" ]
    },
    "border-right-width": {
        values: [ "inherit", "initial", "medium", "thick", "thin", "unset" ]
    },
    "border-spacing": {
        values: [ "inherit", "initial", "unset" ]
    },
    "border-style": {
        values: [ "dashed", "dotted", "double", "groove", "hidden", "inherit", "initial", "inset", "none", "outset", "ridge", "solid", "unset" ]
    },
    "border-top": {
        values: [ "COLOR", "currentColor", "dashed", "dotted", "double", "groove", "hidden", "hsl", "hsla", "inherit", "initial", "inset", "medium", "none", "outset", "rgb", "rgba", "ridge", "solid", "thick", "thin", "transparent", "unset" ]
    },
    "border-top-color": {
        values: [ "COLOR", "currentColor", "hsl", "hsla", "inherit", "initial", "rgb", "rgba", "transparent", "unset" ]
    },
    "border-top-left-radius": {
        values: [ "inherit", "initial", "unset" ]
    },
    "border-top-right-radius": {
        values: [ "inherit", "initial", "unset" ]
    },
    "border-top-style": {
        values: [ "dashed", "dotted", "double", "groove", "hidden", "inherit", "initial", "inset", "none", "outset", "ridge", "solid", "unset" ]
    },
    "border-top-width": {
        values: [ "inherit", "initial", "medium", "thick", "thin", "unset" ]
    },
    "border-width": {
        values: [ "inherit", "initial", "medium", "thick", "thin", "unset" ]
    },
    bottom: {
        values: [ "auto", "inherit", "initial", "unset" ]
    },
    "box-decoration-break": {
        values: [ "clone", "inherit", "initial", "slice", "unset" ]
    },
    "box-shadow": {
        values: [ "COLOR", "currentColor", "hsl", "hsla", "inherit", "initial", "inset", "none", "rgb", "rgba", "transparent", "unset" ]
    },
    "box-sizing": {
        values: [ "border-box", "content-box", "inherit", "initial", "unset" ]
    },
    "caption-side": {
        values: [ "bottom", "bottom-outside", "inherit", "initial", "left", "right", "top", "top-outside", "unset" ]
    },
    "caret-color": {
        values: [ "COLOR", "auto", "currentColor", "hsl", "hsla", "inherit", "initial", "rgb", "rgba", "transparent", "unset" ]
    },
    clear: {
        values: [ "both", "inherit", "initial", "inline-end", "inline-start", "left", "none", "right", "unset" ]
    },
    clip: {
        values: [ "auto", "inherit", "initial", "rect", "unset" ]
    },
    "clip-path": {
        values: [ "border-box", "circle", "content-box", "ellipse", "fill-box", "inherit", "initial", "inset", "margin-box", "none", "padding-box", "polygon", "stroke-box", "unset", "url", "view-box" ]
    },
    "clip-rule": {
        values: [ "evenodd", "inherit", "initial", "nonzero", "unset" ]
    },
    color: {
        values: [ "COLOR", "currentColor", "hsl", "hsla", "inherit", "initial", "rgb", "rgba", "transparent", "unset" ]
    },
    "color-adjust": {
        values: [ "economy", "exact", "inherit", "initial", "unset" ]
    },
    "color-interpolation": {
        values: [ "auto", "inherit", "initial", "linearrgb", "srgb", "unset" ]
    },
    "color-interpolation-filters": {
        values: [ "auto", "inherit", "initial", "linearrgb", "srgb", "unset" ]
    },
    "column-count": {
        values: [ "auto", "inherit", "initial", "unset" ]
    },
    "column-fill": {
        values: [ "auto", "balance", "inherit", "initial", "unset" ]
    },
    "column-gap": {
        values: [ "inherit", "initial", "normal", "unset" ]
    },
    "column-rule": {
        values: [ "COLOR", "currentColor", "dashed", "dotted", "double", "groove", "hidden", "hsl", "hsla", "inherit", "initial", "inset", "medium", "none", "outset", "rgb", "rgba", "ridge", "solid", "thick", "thin", "transparent", "unset" ]
    },
    "column-rule-color": {
        values: [ "COLOR", "currentColor", "hsl", "hsla", "inherit", "initial", "rgb", "rgba", "transparent", "unset" ]
    },
    "column-rule-style": {
        values: [ "dashed", "dotted", "double", "groove", "hidden", "inherit", "initial", "inset", "none", "outset", "ridge", "solid", "unset" ]
    },
    "column-rule-width": {
        values: [ "inherit", "initial", "medium", "thick", "thin", "unset" ]
    },
    "column-width": {
        values: [ "auto", "inherit", "initial", "unset" ]
    },
    columns: {
        values: [ "auto", "inherit", "initial", "unset" ]
    },
    content: {
        values: [ "attr", "close-quote", "counter", "counters", "inherit", "initial", "no-close-quote", "no-open-quote", "none", "normal", "open-quote", "unset", "url" ]
    },
    "counter-increment": {
        values: [ "inherit", "initial", "none", "unset" ]
    },
    "counter-reset": {
        values: [ "inherit", "initial", "none", "unset" ]
    },
    cursor: {
        values: [ "alias", "all-scroll", "auto", "cell", "col-resize", "context-menu", "copy", "crosshair", "default", "e-resize", "ew-resize", "grab", "grabbing", "help", "inherit", "initial", "move", "n-resize", "ne-resize", "nesw-resize", "no-drop", "none", "not-allowed", "ns-resize", "nw-resize", "nwse-resize", "pointer", "progress", "row-resize", "s-resize", "se-resize", "sw-resize", "text", "unset", "url", "vertical-text", "w-resize", "wait", "zoom-in", "zoom-out" ]
    },
    direction: {
        values: [ "inherit", "initial", "ltr", "rtl", "unset" ]
    },
    display: {
        values: [ "block", "contents", "flex", "flow-root", "grid", "inherit", "initial", "inline", "inline-block", "inline-flex", "inline-grid", "inline-table", "list-item", "none", "ruby", "ruby-base", "ruby-base-container", "ruby-text", "ruby-text-container", "table", "table-caption", "table-cell", "table-column", "table-column-group", "table-footer-group", "table-header-group", "table-row", "table-row-group", "unset" ]
    },
    "dominant-baseline": {
        values: [ "alphabetic", "auto", "central", "hanging", "ideographic", "inherit", "initial", "mathematical", "middle", "no-change", "reset-size", "text-after-edge", "text-before-edge", "unset", "use-script" ]
    },
    "empty-cells": {
        values: [ "hide", "inherit", "initial", "show", "unset" ]
    },
    fill: {
        values: [ "COLOR", "context-fill", "context-stroke", "currentColor", "hsl", "hsla", "inherit", "initial", "none", "rgb", "rgba", "transparent", "unset", "url" ]
    },
    "fill-opacity": {
        values: [ "context-fill-opacity", "context-stroke-opacity", "inherit", "initial", "unset" ]
    },
    "fill-rule": {
        values: [ "evenodd", "inherit", "initial", "nonzero", "unset" ]
    },
    filter: {
        values: [ "blur", "brightness", "contrast", "drop-shadow", "grayscale", "hue-rotate", "inherit", "initial", "invert", "none", "opacity", "saturate", "sepia", "unset", "url" ]
    },
    flex: {
        values: [ "auto", "content", "inherit", "initial", "unset" ]
    },
    "flex-basis": {
        values: [ "auto", "content", "inherit", "initial", "unset" ]
    },
    "flex-direction": {
        values: [ "column", "column-reverse", "inherit", "initial", "row", "row-reverse", "unset" ]
    },
    "flex-flow": {
        values: [ "column", "column-reverse", "inherit", "initial", "nowrap", "row", "row-reverse", "unset", "wrap", "wrap-reverse" ]
    },
    "flex-grow": {
        values: [ "inherit", "initial", "unset" ]
    },
    "flex-shrink": {
        values: [ "inherit", "initial", "unset" ]
    },
    "flex-wrap": {
        values: [ "inherit", "initial", "nowrap", "unset", "wrap", "wrap-reverse" ]
    },
    float: {
        values: [ "inherit", "initial", "inline-end", "inline-start", "left", "none", "right", "unset" ]
    },
    "flood-color": {
        values: [ "COLOR", "currentColor", "hsl", "hsla", "inherit", "initial", "rgb", "rgba", "transparent", "unset" ]
    },
    "flood-opacity": {
        values: [ "inherit", "initial", "unset" ]
    },
    font: {
        values: [ "all-petite-caps", "all-small-caps", "bold", "bolder", "caption", "condensed", "expanded", "extra-condensed", "extra-expanded", "icon", "inherit", "initial", "italic", "large", "larger", "lighter", "medium", "menu", "message-box", "normal", "oblique", "petite-caps", "semi-condensed", "semi-expanded", "small", "small-caps", "small-caption", "smaller", "status-bar", "titling-caps", "ultra-condensed", "ultra-expanded", "unicase", "unset", "x-large", "x-small", "xx-large", "xx-small" ]
    },
    "font-family": {
        values: [ "inherit", "initial", "unset" ]
    },
    "font-feature-settings": {
        values: [ "inherit", "initial", "normal", "unset" ]
    },
    "font-kerning": {
        values: [ "auto", "inherit", "initial", "none", "normal", "unset" ]
    },
    "font-language-override": {
        values: [ "inherit", "initial", "normal", "unset" ]
    },
    "font-optical-sizing": {
        values: [ "auto", "inherit", "initial", "none", "unset" ]
    },
    "font-size": {
        values: [ "inherit", "initial", "large", "larger", "medium", "small", "smaller", "unset", "x-large", "x-small", "xx-large", "xx-small" ]
    },
    "font-size-adjust": {
        values: [ "inherit", "initial", "none", "unset" ]
    },
    "font-stretch": {
        values: [ "condensed", "expanded", "extra-condensed", "extra-expanded", "inherit", "initial", "normal", "semi-condensed", "semi-expanded", "ultra-condensed", "ultra-expanded", "unset" ]
    },
    "font-style": {
        values: [ "inherit", "initial", "italic", "normal", "oblique", "unset" ]
    },
    "font-synthesis": {
        values: [ "inherit", "initial", "style", "unset", "weight" ]
    },
    "font-variant": {
        values: [ "all-petite-caps", "all-small-caps", "annotation", "character-variant", "common-ligatures", "contextual", "diagonal-fractions", "discretionary-ligatures", "full-width", "historical-forms", "historical-ligatures", "inherit", "initial", "jis04", "jis78", "jis83", "jis90", "lining-nums", "no-common-ligatures", "no-contextual", "no-discretionary-ligatures", "no-historical-ligatures", "none", "normal", "oldstyle-nums", "ordinal", "ornaments", "petite-caps", "proportional-nums", "proportional-width", "ruby", "simplified", "slashed-zero", "small-caps", "stacked-fractions", "styleset", "stylistic", "sub", "super", "swash", "tabular-nums", "titling-caps", "traditional", "unicase", "unset" ]
    },
    "font-variant-alternates": {
        values: [ "annotation", "character-variant", "historical-forms", "inherit", "initial", "normal", "ornaments", "styleset", "stylistic", "swash", "unset" ]
    },
    "font-variant-caps": {
        values: [ "all-petite-caps", "all-small-caps", "inherit", "initial", "normal", "petite-caps", "small-caps", "titling-caps", "unicase", "unset" ]
    },
    "font-variant-east-asian": {
        values: [ "full-width", "inherit", "initial", "jis04", "jis78", "jis83", "jis90", "normal", "proportional-width", "ruby", "simplified", "traditional", "unset" ]
    },
    "font-variant-ligatures": {
        values: [ "common-ligatures", "contextual", "discretionary-ligatures", "historical-ligatures", "inherit", "initial", "no-common-ligatures", "no-contextual", "no-discretionary-ligatures", "no-historical-ligatures", "none", "normal", "unset" ]
    },
    "font-variant-numeric": {
        values: [ "diagonal-fractions", "inherit", "initial", "lining-nums", "normal", "oldstyle-nums", "ordinal", "proportional-nums", "slashed-zero", "stacked-fractions", "tabular-nums", "unset" ]
    },
    "font-variant-position": {
        values: [ "inherit", "initial", "normal", "sub", "super", "unset" ]
    },
    "font-variation-settings": {
        values: [ "inherit", "initial", "normal", "unset" ]
    },
    "font-weight": {
        values: [ "bold", "bolder", "inherit", "initial", "lighter", "normal", "unset" ]
    },
    gap: {
        values: [ "inherit", "initial", "normal", "unset" ]
    },
    grid: {
        values: [ "auto", "column", "dense", "fit-content", "inherit", "initial", "max-content", "min-content", "minmax", "none", "repeat", "row", "unset" ]
    },
    "grid-area": {
        values: [ "inherit", "initial", "unset" ]
    },
    "grid-auto-columns": {
        values: [ "auto", "fit-content", "inherit", "initial", "max-content", "min-content", "minmax", "unset" ]
    },
    "grid-auto-flow": {
        values: [ "column", "dense", "inherit", "initial", "row", "unset" ]
    },
    "grid-auto-rows": {
        values: [ "auto", "fit-content", "inherit", "initial", "max-content", "min-content", "minmax", "unset" ]
    },
    "grid-column": {
        values: [ "inherit", "initial", "unset" ]
    },
    "grid-column-end": {
        values: [ "inherit", "initial", "unset" ]
    },
    "grid-column-gap": {
        values: [ "inherit", "initial", "normal", "unset" ]
    },
    "grid-column-start": {
        values: [ "inherit", "initial", "unset" ]
    },
    "grid-gap": {
        values: [ "inherit", "initial", "normal", "unset" ]
    },
    "grid-row": {
        values: [ "inherit", "initial", "unset" ]
    },
    "grid-row-end": {
        values: [ "inherit", "initial", "unset" ]
    },
    "grid-row-gap": {
        values: [ "inherit", "initial", "normal", "unset" ]
    },
    "grid-row-start": {
        values: [ "inherit", "initial", "unset" ]
    },
    "grid-template": {
        values: [ "auto", "fit-content", "inherit", "initial", "max-content", "min-content", "minmax", "none", "repeat", "unset" ]
    },
    "grid-template-areas": {
        values: [ "inherit", "initial", "none", "unset" ]
    },
    "grid-template-columns": {
        values: [ "auto", "fit-content", "inherit", "initial", "max-content", "min-content", "minmax", "none", "repeat", "unset" ]
    },
    "grid-template-rows": {
        values: [ "auto", "fit-content", "inherit", "initial", "max-content", "min-content", "minmax", "none", "repeat", "unset" ]
    },
    height: {
        values: [ "auto", "inherit", "initial", "unset" ]
    },
    hyphens: {
        values: [ "auto", "inherit", "initial", "manual", "none", "unset" ]
    },
    "image-orientation": {
        values: [ "from-image", "inherit", "initial", "none", "unset" ]
    },
    "image-rendering": {
        values: [ "auto", "inherit", "initial", "optimizequality", "optimizespeed", "unset" ]
    },
    "ime-mode": {
        values: [ "active", "auto", "disabled", "inactive", "inherit", "initial", "normal", "unset" ]
    },
    "inline-size": {
        values: [ "auto", "inherit", "initial", "unset" ]
    },
    "inset-block-end": {
        values: [ "auto", "inherit", "initial", "unset" ]
    },
    "inset-block-start": {
        values: [ "auto", "inherit", "initial", "unset" ]
    },
    "inset-inline-end": {
        values: [ "auto", "inherit", "initial", "unset" ]
    },
    "inset-inline-start": {
        values: [ "auto", "inherit", "initial", "unset" ]
    },
    isolation: {
        values: [ "auto", "inherit", "initial", "isolate", "unset" ]
    },
    "justify-content": {
        values: [ "center", "end", "flex-end", "flex-start", "inherit", "initial", "left", "normal", "right", "safe", "space-around", "space-between", "space-evenly", "start", "stretch", "unsafe", "unset" ]
    },
    "justify-items": {
        values: [ "baseline", "center", "end", "first baseline", "flex-end", "flex-start", "inherit", "initial", "last baseline", "left", "legacy", "normal", "right", "safe", "self-end", "self-start", "start", "stretch", "unsafe", "unset" ]
    },
    "justify-self": {
        values: [ "auto", "baseline", "center", "end", "first baseline", "flex-end", "flex-start", "inherit", "initial", "last baseline", "left", "normal", "right", "safe", "self-end", "self-start", "start", "stretch", "unsafe", "unset" ]
    },
    left: {
        values: [ "auto", "inherit", "initial", "unset" ]
    },
    "letter-spacing": {
        values: [ "inherit", "initial", "normal", "unset" ]
    },
    "lighting-color": {
        values: [ "COLOR", "currentColor", "hsl", "hsla", "inherit", "initial", "rgb", "rgba", "transparent", "unset" ]
    },
    "line-height": {
        values: [ "inherit", "initial", "normal", "unset" ]
    },
    "list-style": {
        values: [ "arabic-indic", "armenian", "bengali", "cambodian", "circle", "cjk-decimal", "cjk-earthly-branch", "cjk-heavenly-stem", "cjk-ideographic", "decimal", "decimal-leading-zero", "devanagari", "disc", "disclosure-closed", "disclosure-open", "ethiopic-numeric", "georgian", "gujarati", "gurmukhi", "hebrew", "hiragana", "hiragana-iroha", "inherit", "initial", "inside", "japanese-formal", "japanese-informal", "kannada", "katakana", "katakana-iroha", "khmer", "korean-hangul-formal", "korean-hanja-formal", "korean-hanja-informal", "lao", "lower-alpha", "lower-armenian", "lower-greek", "lower-latin", "lower-roman", "malayalam", "mongolian", "myanmar", "none", "oriya", "outside", "persian", "simp-chinese-formal", "simp-chinese-informal", "square", "symbols", "tamil", "telugu", "thai", "tibetan", "trad-chinese-formal", "trad-chinese-informal", "unset", "upper-alpha", "upper-armenian", "upper-latin", "upper-roman", "url" ]
    },
    "list-style-image": {
        values: [ "inherit", "initial", "none", "unset", "url" ]
    },
    "list-style-position": {
        values: [ "inherit", "initial", "inside", "outside", "unset" ]
    },
    "list-style-type": {
        values: [ "arabic-indic", "armenian", "bengali", "cambodian", "circle", "cjk-decimal", "cjk-earthly-branch", "cjk-heavenly-stem", "cjk-ideographic", "decimal", "decimal-leading-zero", "devanagari", "disc", "disclosure-closed", "disclosure-open", "ethiopic-numeric", "georgian", "gujarati", "gurmukhi", "hebrew", "hiragana", "hiragana-iroha", "inherit", "initial", "japanese-formal", "japanese-informal", "kannada", "katakana", "katakana-iroha", "khmer", "korean-hangul-formal", "korean-hanja-formal", "korean-hanja-informal", "lao", "lower-alpha", "lower-armenian", "lower-greek", "lower-latin", "lower-roman", "malayalam", "mongolian", "myanmar", "none", "oriya", "persian", "simp-chinese-formal", "simp-chinese-informal", "square", "symbols", "tamil", "telugu", "thai", "tibetan", "trad-chinese-formal", "trad-chinese-informal", "unset", "upper-alpha", "upper-armenian", "upper-latin", "upper-roman" ]
    },
    margin: {
        values: [ "auto", "inherit", "initial", "unset" ]
    },
    "margin-block-end": {
        values: [ "auto", "inherit", "initial", "unset" ]
    },
    "margin-block-start": {
        values: [ "auto", "inherit", "initial", "unset" ]
    },
    "margin-bottom": {
        values: [ "auto", "inherit", "initial", "unset" ]
    },
    "margin-inline-end": {
        values: [ "auto", "inherit", "initial", "unset" ]
    },
    "margin-inline-start": {
        values: [ "auto", "inherit", "initial", "unset" ]
    },
    "margin-left": {
        values: [ "auto", "inherit", "initial", "unset" ]
    },
    "margin-right": {
        values: [ "auto", "inherit", "initial", "unset" ]
    },
    "margin-top": {
        values: [ "auto", "inherit", "initial", "unset" ]
    },
    marker: {
        values: [ "inherit", "initial", "none", "unset", "url" ]
    },
    "marker-end": {
        values: [ "inherit", "initial", "none", "unset", "url" ]
    },
    "marker-mid": {
        values: [ "inherit", "initial", "none", "unset", "url" ]
    },
    "marker-start": {
        values: [ "inherit", "initial", "none", "unset", "url" ]
    },
    mask: {
        values: [ "add", "alpha", "auto", "border-box", "bottom", "center", "contain", "content-box", "cover", "exclude", "fill-box", "inherit", "initial", "intersect", "left", "linear-gradient", "luminance", "match-source", "no-clip", "no-repeat", "none", "padding-box", "radial-gradient", "repeat", "repeat-x", "repeat-y", "repeating-linear-gradient", "repeating-radial-gradient", "right", "round", "space", "stroke-box", "subtract", "top", "unset", "url", "view-box" ]
    },
    "mask-clip": {
        values: [ "border-box", "content-box", "fill-box", "inherit", "initial", "no-clip", "padding-box", "stroke-box", "unset", "view-box" ]
    },
    "mask-composite": {
        values: [ "add", "exclude", "inherit", "initial", "intersect", "subtract", "unset" ]
    },
    "mask-image": {
        values: [ "inherit", "initial", "linear-gradient", "none", "radial-gradient", "repeating-linear-gradient", "repeating-radial-gradient", "unset", "url" ]
    },
    "mask-mode": {
        values: [ "alpha", "inherit", "initial", "luminance", "match-source", "unset" ]
    },
    "mask-origin": {
        values: [ "border-box", "content-box", "fill-box", "inherit", "initial", "padding-box", "stroke-box", "unset", "view-box" ]
    },
    "mask-position": {
        values: [ "bottom", "center", "inherit", "initial", "left", "right", "top", "unset" ]
    },
    "mask-position-x": {
        values: [ "center", "inherit", "initial", "left", "right", "unset" ]
    },
    "mask-position-y": {
        values: [ "bottom", "center", "inherit", "initial", "top", "unset" ]
    },
    "mask-repeat": {
        values: [ "inherit", "initial", "no-repeat", "repeat", "repeat-x", "repeat-y", "round", "space", "unset" ]
    },
    "mask-size": {
        values: [ "auto", "contain", "cover", "inherit", "initial", "unset" ]
    },
    "mask-type": {
        values: [ "alpha", "inherit", "initial", "luminance", "unset" ]
    },
    "max-block-size": {
        values: [ "inherit", "initial", "none", "unset" ]
    },
    "max-height": {
        values: [ "inherit", "initial", "none", "unset" ]
    },
    "max-inline-size": {
        values: [ "inherit", "initial", "none", "unset" ]
    },
    "max-width": {
        values: [ "inherit", "initial", "none", "unset" ]
    },
    "min-block-size": {
        values: [ "auto", "inherit", "initial", "unset" ]
    },
    "min-height": {
        values: [ "auto", "inherit", "initial", "unset" ]
    },
    "min-inline-size": {
        values: [ "auto", "inherit", "initial", "unset" ]
    },
    "min-width": {
        values: [ "auto", "inherit", "initial", "unset" ]
    },
    "mix-blend-mode": {
        values: [ "color", "color-burn", "color-dodge", "darken", "difference", "exclusion", "hard-light", "hue", "inherit", "initial", "lighten", "luminosity", "multiply", "normal", "overlay", "saturation", "screen", "soft-light", "unset" ]
    },
    "object-fit": {
        values: [ "contain", "cover", "fill", "inherit", "initial", "none", "scale-down", "unset" ]
    },
    "object-position": {
        values: [ "bottom", "center", "inherit", "initial", "left", "right", "top", "unset" ]
    },
    opacity: {
        values: [ "inherit", "initial", "unset" ]
    },
    order: {
        values: [ "inherit", "initial", "unset" ]
    },
    outline: {
        values: [ "COLOR", "auto", "currentColor", "dashed", "dotted", "double", "groove", "hidden", "hsl", "hsla", "inherit", "initial", "inset", "medium", "none", "outset", "rgb", "rgba", "ridge", "solid", "thick", "thin", "transparent", "unset" ]
    },
    "outline-color": {
        values: [ "COLOR", "currentColor", "hsl", "hsla", "inherit", "initial", "rgb", "rgba", "transparent", "unset" ]
    },
    "outline-offset": {
        values: [ "inherit", "initial", "unset" ]
    },
    "outline-style": {
        values: [ "auto", "dashed", "dotted", "double", "groove", "hidden", "inherit", "initial", "inset", "none", "outset", "ridge", "solid", "unset" ]
    },
    "outline-width": {
        values: [ "inherit", "initial", "medium", "thick", "thin", "unset" ]
    },
    overflow: {
        values: [ "auto", "hidden", "inherit", "initial", "scroll", "unset", "visible" ]
    },
    "overflow-wrap": {
        values: [ "break-word", "inherit", "initial", "normal", "unset" ]
    },
    "overflow-x": {
        values: [ "auto", "hidden", "inherit", "initial", "scroll", "unset", "visible" ]
    },
    "overflow-y": {
        values: [ "auto", "hidden", "inherit", "initial", "scroll", "unset", "visible" ]
    },
    "overscroll-behavior": {
        values: [ "auto", "contain", "inherit", "initial", "none", "unset" ]
    },
    "overscroll-behavior-x": {
        values: [ "auto", "contain", "inherit", "initial", "none", "unset" ]
    },
    "overscroll-behavior-y": {
        values: [ "auto", "contain", "inherit", "initial", "none", "unset" ]
    },
    padding: {
        values: [ "inherit", "initial", "unset" ]
    },
    "padding-block-end": {
        values: [ "inherit", "initial", "unset" ]
    },
    "padding-block-start": {
        values: [ "inherit", "initial", "unset" ]
    },
    "padding-bottom": {
        values: [ "inherit", "initial", "unset" ]
    },
    "padding-inline-end": {
        values: [ "inherit", "initial", "unset" ]
    },
    "padding-inline-start": {
        values: [ "inherit", "initial", "unset" ]
    },
    "padding-left": {
        values: [ "inherit", "initial", "unset" ]
    },
    "padding-right": {
        values: [ "inherit", "initial", "unset" ]
    },
    "padding-top": {
        values: [ "inherit", "initial", "unset" ]
    },
    "page-break-after": {
        values: [ "always", "auto", "avoid", "inherit", "initial", "left", "right", "unset" ]
    },
    "page-break-before": {
        values: [ "always", "auto", "avoid", "inherit", "initial", "left", "right", "unset" ]
    },
    "page-break-inside": {
        values: [ "auto", "avoid", "inherit", "initial", "unset" ]
    },
    "paint-order": {
        values: [ "inherit", "initial", "unset" ]
    },
    perspective: {
        values: [ "inherit", "initial", "none", "unset" ]
    },
    "perspective-origin": {
        values: [ "bottom", "center", "inherit", "initial", "left", "right", "top", "unset" ]
    },
    "place-content": {
        values: [ "baseline", "center", "end", "first baseline", "flex-end", "flex-start", "inherit", "initial", "last baseline", "left", "normal", "right", "safe", "space-around", "space-between", "space-evenly", "start", "stretch", "unsafe", "unset" ]
    },
    "place-items": {
        values: [ "baseline", "center", "end", "first baseline", "flex-end", "flex-start", "inherit", "initial", "last baseline", "left", "legacy", "normal", "right", "safe", "self-end", "self-start", "start", "stretch", "unsafe", "unset" ]
    },
    "place-self": {
        values: [ "auto", "baseline", "center", "end", "first baseline", "flex-end", "flex-start", "inherit", "initial", "last baseline", "left", "normal", "right", "safe", "self-end", "self-start", "start", "stretch", "unsafe", "unset" ]
    },
    "pointer-events": {
        values: [ "all", "auto", "fill", "inherit", "initial", "none", "painted", "stroke", "unset", "visible", "visiblefill", "visiblepainted", "visiblestroke" ]
    },
    position: {
        values: [ "absolute", "fixed", "inherit", "initial", "relative", "static", "sticky", "unset" ]
    },
    quotes: {
        values: [ "inherit", "initial", "none", "unset" ]
    },
    resize: {
        values: [ "block", "both", "horizontal", "inherit", "initial", "inline", "none", "unset", "vertical" ]
    },
    right: {
        values: [ "auto", "inherit", "initial", "unset" ]
    },
    "row-gap": {
        values: [ "inherit", "initial", "normal", "unset" ]
    },
    "ruby-align": {
        values: [ "center", "inherit", "initial", "space-around", "space-between", "start", "unset" ]
    },
    "ruby-position": {
        values: [ "inherit", "initial", "over", "under", "unset" ]
    },
    "scroll-behavior": {
        values: [ "auto", "inherit", "initial", "smooth", "unset" ]
    },
    "scroll-snap-coordinate": {
        values: [ "bottom", "center", "inherit", "initial", "left", "none", "right", "top", "unset" ]
    },
    "scroll-snap-destination": {
        values: [ "bottom", "center", "inherit", "initial", "left", "right", "top", "unset" ]
    },
    "scroll-snap-points-x": {
        values: [ "inherit", "initial", "none", "repeat", "unset" ]
    },
    "scroll-snap-points-y": {
        values: [ "inherit", "initial", "none", "repeat", "unset" ]
    },
    "scroll-snap-type": {
        values: [ "inherit", "initial", "mandatory", "none", "proximity", "unset" ]
    },
    "scroll-snap-type-x": {
        values: [ "inherit", "initial", "mandatory", "none", "proximity", "unset" ]
    },
    "scroll-snap-type-y": {
        values: [ "inherit", "initial", "mandatory", "none", "proximity", "unset" ]
    },
    "shape-image-threshold": {
        values: [ "inherit", "initial", "unset" ]
    },
    "shape-margin": {
        values: [ "inherit", "initial", "unset" ]
    },
    "shape-outside": {
        values: [ "border-box", "circle", "content-box", "ellipse", "inherit", "initial", "inset", "linear-gradient", "margin-box", "none", "padding-box", "polygon", "radial-gradient", "repeating-linear-gradient", "repeating-radial-gradient", "unset", "url" ]
    },
    "shape-rendering": {
        values: [ "auto", "crispedges", "geometricprecision", "inherit", "initial", "optimizespeed", "unset" ]
    },
    "stop-color": {
        values: [ "COLOR", "currentColor", "hsl", "hsla", "inherit", "initial", "rgb", "rgba", "transparent", "unset" ]
    },
    "stop-opacity": {
        values: [ "inherit", "initial", "unset" ]
    },
    stroke: {
        values: [ "COLOR", "context-fill", "context-stroke", "currentColor", "hsl", "hsla", "inherit", "initial", "none", "rgb", "rgba", "transparent", "unset", "url" ]
    },
    "stroke-dasharray": {
        values: [ "context-value", "inherit", "initial", "none", "unset" ]
    },
    "stroke-dashoffset": {
        values: [ "context-value", "inherit", "initial", "unset" ]
    },
    "stroke-linecap": {
        values: [ "butt", "inherit", "initial", "round", "square", "unset" ]
    },
    "stroke-linejoin": {
        values: [ "bevel", "inherit", "initial", "miter", "round", "unset" ]
    },
    "stroke-miterlimit": {
        values: [ "inherit", "initial", "unset" ]
    },
    "stroke-opacity": {
        values: [ "context-fill-opacity", "context-stroke-opacity", "inherit", "initial", "unset" ]
    },
    "stroke-width": {
        values: [ "context-value", "inherit", "initial", "unset" ]
    },
    "table-layout": {
        values: [ "auto", "fixed", "inherit", "initial", "unset" ]
    },
    "text-align": {
        values: [ "center", "end", "inherit", "initial", "justify", "left", "match-parent", "right", "start", "unset" ]
    },
    "text-align-last": {
        values: [ "auto", "center", "end", "inherit", "initial", "justify", "left", "right", "start", "unset" ]
    },
    "text-anchor": {
        values: [ "end", "inherit", "initial", "middle", "start", "unset" ]
    },
    "text-combine-upright": {
        values: [ "all", "inherit", "initial", "none", "unset" ]
    },
    "text-decoration": {
        values: [ "COLOR", "blink", "currentColor", "dashed", "dotted", "double", "hsl", "hsla", "inherit", "initial", "line-through", "none", "overline", "rgb", "rgba", "solid", "transparent", "underline", "unset", "wavy" ]
    },
    "text-decoration-color": {
        values: [ "COLOR", "currentColor", "hsl", "hsla", "inherit", "initial", "rgb", "rgba", "transparent", "unset" ]
    },
    "text-decoration-line": {
        values: [ "blink", "inherit", "initial", "line-through", "none", "overline", "underline", "unset" ]
    },
    "text-decoration-style": {
        values: [ "dashed", "dotted", "double", "inherit", "initial", "solid", "unset", "wavy" ]
    },
    "text-emphasis": {
        values: [ "COLOR", "circle", "currentColor", "dot", "double-circle", "filled", "hsl", "hsla", "inherit", "initial", "none", "open", "rgb", "rgba", "sesame", "transparent", "triangle", "unset" ]
    },
    "text-emphasis-color": {
        values: [ "COLOR", "currentColor", "hsl", "hsla", "inherit", "initial", "rgb", "rgba", "transparent", "unset" ]
    },
    "text-emphasis-position": {
        values: [ "inherit", "initial", "left", "over", "right", "under", "unset" ]
    },
    "text-emphasis-style": {
        values: [ "circle", "dot", "double-circle", "filled", "inherit", "initial", "none", "open", "sesame", "triangle", "unset" ]
    },
    "text-indent": {
        values: [ "inherit", "initial", "unset" ]
    },
    "text-justify": {
        values: [ "auto", "distribute", "inherit", "initial", "inter-character", "inter-word", "none", "unset" ]
    },
    "text-orientation": {
        values: [ "inherit", "initial", "mixed", "sideways", "sideways-right", "unset", "upright" ]
    },
    "text-overflow": {
        values: [ "clip", "ellipsis", "inherit", "initial", "unset" ]
    },
    "text-rendering": {
        values: [ "auto", "geometricprecision", "inherit", "initial", "optimizelegibility", "optimizespeed", "unset" ]
    },
    "text-shadow": {
        values: [ "COLOR", "currentColor", "hsl", "hsla", "inherit", "initial", "none", "rgb", "rgba", "transparent", "unset" ]
    },
    "text-transform": {
        values: [ "capitalize", "full-width", "inherit", "initial", "lowercase", "none", "unset", "uppercase" ]
    },
    top: {
        values: [ "auto", "inherit", "initial", "unset" ]
    },
    "touch-action": {
        values: [ "auto", "inherit", "initial", "manipulation", "none", "pan-x", "pan-y", "unset" ]
    },
    transform: {
        values: [ "accumulatematrix", "inherit", "initial", "interpolatematrix", "matrix", "matrix3d", "none", "perspective", "rotate", "rotate3d", "rotateX", "rotateY", "rotateZ", "scale", "scale3d", "scaleX", "scaleY", "scaleZ", "skew", "skewX", "skewY", "translate", "translate3d", "translateX", "translateY", "translateZ", "unset" ]
    },
    "transform-box": {
        values: [ "border-box", "fill-box", "inherit", "initial", "unset", "view-box" ]
    },
    "transform-origin": {
        values: [ "bottom", "center", "inherit", "initial", "left", "right", "top", "unset" ]
    },
    "transform-style": {
        values: [ "flat", "inherit", "initial", "preserve-3d", "unset" ]
    },
    transition: {
        values: [ "all", "cubic-bezier", "ease", "ease-in", "ease-in-out", "ease-out", "frames", "inherit", "initial", "linear", "none", "step-end", "step-start", "steps", "unset" ]
    },
    "transition-delay": {
        values: [ "inherit", "initial", "unset" ]
    },
    "transition-duration": {
        values: [ "inherit", "initial", "unset" ]
    },
    "transition-property": {
        values: [ "all", "inherit", "initial", "none", "unset" ]
    },
    "transition-timing-function": {
        values: [ "cubic-bezier", "ease", "ease-in", "ease-in-out", "ease-out", "frames", "inherit", "initial", "linear", "step-end", "step-start", "steps", "unset" ]
    },
    "unicode-bidi": {
        values: [ "bidi-override", "embed", "inherit", "initial", "isolate", "isolate-override", "normal", "plaintext", "unset" ]
    },
    "vector-effect": {
        values: [ "inherit", "initial", "non-scaling-stroke", "none", "unset" ]
    },
    "vertical-align": {
        values: [ "baseline", "bottom", "inherit", "initial", "middle", "sub", "super", "text-bottom", "text-top", "top", "unset" ]
    },
    visibility: {
        values: [ "collapse", "hidden", "inherit", "initial", "unset", "visible" ]
    },
    "white-space": {
        values: [ "inherit", "initial", "normal", "nowrap", "pre", "pre-line", "pre-wrap", "unset" ]
    },
    width: {
        values: [ "auto", "inherit", "initial", "unset" ]
    },
    "will-change": {
        values: [ "auto", "inherit", "initial", "unset" ]
    },
    "word-break": {
        values: [ "break-all", "inherit", "initial", "keep-all", "normal", "unset" ]
    },
    "word-spacing": {
        values: [ "inherit", "initial", "normal", "unset" ]
    },
    "word-wrap": {
        values: [ "break-word", "inherit", "initial", "normal", "unset" ]
    },
    "writing-mode": {
        values: [ "horizontal-tb", "inherit", "initial", "lr", "lr-tb", "rl", "rl-tb", "sideways-lr", "sideways-rl", "tb", "tb-rl", "unset", "vertical-lr", "vertical-rl" ]
    },
    "z-index": {
        values: [ "auto", "inherit", "initial", "unset" ]
    }
};

const fi = [ ":after", ":before", ":backdrop", ":cue", ":first-letter", ":first-line", ":selection", ":placeholder" ];

const pi = [ "xml:lang", "xml:base", "accesskey", "autocapitalize", "aria-foo", "class", "contenteditable", "contextmenu", "data-foo", "dir", "draggable", "dropzone", "hidden", "id", "is", "itemid", "itemprop", "itemref", "itemscope", "itemtype", "lang", "slot", "spellcheck", "style", "tabindex", "title", "translate", "onabort", "onautocomplete", "onautocompleteerror", "onblur", "oncancel", "oncanplay", "oncanplaythrough", "onchange", "onclick", "onclose", "oncontextmenu", "oncuechange", "ondblclick", "ondrag", "ondragend", "ondragenter", "ondragexit", "ondragleave", "ondragover", "ondragstart", "ondrop", "ondurationchange", "onemptied", "onended", "onerror", "onfocus", "oninput", "oninvalid", "onkeydown", "onkeypress", "onkeyup", "onload", "onloadeddata", "onloadedmetadata", "onloadstart", "onmousedown", "onmouseenter", "onmouseleave", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "onmousewheel", "onpause", "onplay", "onplaying", "onprogress", "onratechange", "onreset", "onresize", "onscroll", "onseeked", "onseeking", "onselect", "onshow", "onsort", "onstalled", "onsubmit", "onsuspend", "ontimeupdate", "ontoggle", "onvolumechange", "onwaiting" ];

function gi(e, t) {
    e = e.slice(0).filter((e => e.length > 0));
    if ("function" !== typeof t) throw new Error("Callback is not a function");
    if (0 === e.length) return;
    const n = e.reduce(((e, t) => e *= t.length), 1);
    const i = Array(e.length).fill(0);
    const r = [];
    let a = null;
    try {
        a = mi(e, Array(e.length), i);
        t(...a);
    } catch (e) {
        r.push(e);
    }
    let s = 1;
    if (n === s) return;
    let o = false;
    while (!o) {
        const l = yi(e, i);
        if (l) {
            try {
                t(...mi(e, a, i));
            } catch (e) {
                r.push(e);
            }
            s++;
            if (n < s) throw new Error("Invalid loop implementation.");
        } else o = true;
    }
    if (r.length > 0) {
        const e = `eachCartesionJoinFactory failed to load ${r.length} tests:\n\n${r.map((e => e.message)).join("\n")}`;
        throw new Error(e);
    }
}

function mi(e, t, n) {
    for (let i = 0, r = e.length; r > i; ++i) t[i] = e[i][n[i]](...t);
    return t;
}

function bi(e, t) {
    e = e.slice(0).filter((e => e.length > 0));
    if ("function" !== typeof t) throw new Error("Callback is not a function");
    if (0 === e.length) return;
    const n = e.reduce(((e, t) => e *= t.length), 1);
    const i = Array(e.length).fill(0);
    const r = xi(e, Array(e.length), i);
    t(...r, 0);
    let a = 1;
    if (n === a) return;
    let s = false;
    while (!s) {
        const o = yi(e, i);
        if (o) {
            t(...xi(e, r, i), a);
            a++;
            if (n < a) throw new Error("Invalid loop implementation.");
        } else s = true;
    }
}

async function vi(e, t) {
    e = e.slice(0).filter((e => e.length > 0));
    if ("function" !== typeof t) throw new Error("Callback is not a function");
    if (0 === e.length) return;
    const n = e.reduce(((e, t) => e *= t.length), 1);
    const i = Array(e.length).fill(0);
    const r = xi(e, Array(e.length), i);
    await t(...r, 0);
    let a = 1;
    if (n === a) return;
    let s = false;
    while (!s) {
        const o = yi(e, i);
        if (o) {
            await t(...xi(e, r, i), a);
            a++;
            if (n < a) throw new Error("Invalid loop implementation.");
        } else s = true;
    }
}

function yi(e, t) {
    let n = e.length;
    while (n--) {
        if (t[n] === e[n].length - 1) {
            if (0 === n) return false;
            continue;
        }
        t[n] += 1;
        for (let i = n + 1, r = e.length; r > i; ++i) t[i] = 0;
        return true;
    }
    return false;
}

function xi(e, t, n) {
    for (let i = 0, r = e.length; r > i; ++i) t[i] = e[i][n[i]];
    return t;
}

function* $i(e) {
    const [t, ...n] = e;
    const i = n.length > 0 ? $i(n) : [ [] ];
    for (const e of i) for (const n of t) yield [ n, ...e ];
}

function wi(t, n = null, ...i) {
    const r = exports.PLATFORM.document;
    const a = r.createElement(t);
    for (const t in n) if ("class" === t || "className" === t || "cls" === t) {
        let i = n[t];
        i = void 0 === i || null === i ? e.emptyArray : Array.isArray(i) ? i : `${i}`.split(" ");
        a.classList.add(...i.filter(Boolean));
    } else if (t in a || "data" === t || t.startsWith("_")) a[t.replace(/^_/, "")] = n[t]; else a.setAttribute(t, n[t]);
    const s = "TEMPLATE" === a.tagName ? a.content : a;
    for (const e of i) {
        if (null === e || void 0 === e) continue;
        s.appendChild(ki(e) ? e : r.createTextNode(`${e}`));
    }
    return a;
}

function ki(e) {
    return e.nodeType > 0;
}

const Ci = {
    delegate: 1,
    capture: 1,
    call: 1
};

const Si = function(t, n, ...i) {
    const r = exports.PLATFORM.document;
    const a = r.createElement("let$" === t ? "let" : t);
    if (null != n) {
        let t;
        for (const i in n) {
            t = n[i];
            if ("class" === i || "className" === i || "cls" === i) {
                t = null == t ? [] : Array.isArray(t) ? t : `${t}`.split(" ");
                a.classList.add(...t);
            } else if (i in a || "data" === i || i.startsWith("_")) a[i] = t; else if ("asElement" === i) a.setAttribute("as-element", t); else if (i.startsWith("o") && "n" === i[1] && !i.endsWith("$")) {
                const n = e.kebabCase(i.slice(2));
                const r = n.split("-");
                if (r.length > 1) {
                    const e = r[r.length - 1];
                    const n = Ci[e] ? e : "trigger";
                    a.setAttribute(`${r.slice(0, -1).join("-")}.${n}`, t);
                } else a.setAttribute(`${r[0]}.trigger`, t);
            } else {
                const n = i.split("$");
                if (1 === n.length) a.setAttribute(e.kebabCase(i), t); else {
                    if ("" === n[n.length - 1]) n[n.length - 1] = "bind";
                    a.setAttribute(n.map(e.kebabCase).join("."), t);
                }
            }
        }
    }
    const s = null != a.content ? a.content : a;
    for (const e of i) {
        if (null == e) continue;
        if (Array.isArray(e)) for (const t of e) s.appendChild(t instanceof exports.PLATFORM.Node ? t : r.createTextNode(`${t}`)); else s.appendChild(e instanceof exports.PLATFORM.Node ? e : r.createTextNode(`${e}`));
    }
    return a;
};

function Oi(e, n, i = [], r = true, a = TestContext.create()) {
    const {container: s, platform: o, observerLocator: l} = a;
    s.register(...i);
    const u = a.doc.body.appendChild(a.doc.createElement("div"));
    const c = u.appendChild(a.createElement("app"));
    const h = new t.Aurelia(s);
    const d = t.CustomElement.define({
        name: "app",
        template: e
    }, n || class {});
    if (s.has(d, true)) throw new Error("Container of the context cotains instance of the application root component. " + "Consider using a different class, or context as it will likely cause surprises in tests.");
    const f = s.get(d);
    let p;
    if (r) {
        h.app({
            host: c,
            component: f
        });
        p = h.start();
    }
    return {
        startPromise: p,
        ctx: a,
        host: a.doc.firstElementChild,
        container: s,
        platform: o,
        testHost: u,
        appHost: c,
        au: h,
        component: f,
        observerLocator: l,
        start: async () => {
            await h.app({
                host: c,
                component: f
            }).start();
        },
        tearDown: async () => {
            await h.stop();
            u.remove();
            h.dispose();
        }
    };
}

class MockBinding {
    constructor() {
        this.interceptor = this;
        this.calls = [];
    }
    updateTarget(e, t) {
        this.trace("updateTarget", e, t);
    }
    updateSource(e, t) {
        this.trace("updateSource", e, t);
    }
    handleChange(e, t, n) {
        this.trace("handleChange", e, t, n);
    }
    handleCollectionChange(e, t) {
        this.trace("handleCollectionChange", e, t);
    }
    observe(e, t) {
        this.trace("observe", e, t);
    }
    observeCollection(e) {
        this.trace("observeCollection", e);
    }
    subscribeTo(e) {
        this.trace("subscribeTo", e);
    }
    $bind(e, t) {
        this.trace("$bind", e, t);
    }
    $unbind(e) {
        this.trace("$unbind", e);
    }
    trace(e, ...t) {
        this.calls.push([ e, ...t ]);
    }
    dispose() {
        this.trace("dispose");
    }
}

class MockBindingBehavior {
    constructor() {
        this.calls = [];
    }
    bind(e, t, n, ...i) {
        this.trace("bind", e, t, n, ...i);
    }
    unbind(e, t, n, ...i) {
        this.trace("unbind", e, t, n, ...i);
    }
    trace(e, ...t) {
        this.calls.push([ e, ...t ]);
    }
}

class MockServiceLocator {
    constructor(e) {
        this.registrations = e;
        this.calls = [];
    }
    get(e) {
        this.trace("get", e);
        return this.registrations.get(e);
    }
    trace(e, ...t) {
        this.calls.push([ e, ...t ]);
    }
}

class MockSignaler {
    constructor() {
        this.calls = [];
    }
    dispatchSignal(...e) {
        this.trace("dispatchSignal", ...e);
    }
    addSignalListener(...e) {
        this.trace("addSignalListener", ...e);
    }
    removeSignalListener(...e) {
        this.trace("removeSignalListener", ...e);
    }
    trace(e, ...t) {
        this.calls.push([ e, ...t ]);
    }
}

class MockPropertySubscriber {
    constructor() {
        this.calls = [];
    }
    handleChange(e, t, n) {
        this.trace(`handleChange`, e, t, n);
    }
    trace(e, ...t) {
        this.calls.push([ e, ...t ]);
    }
}

class MockTracingExpression {
    constructor(e) {
        this.inner = e;
        this.$kind = 2048 | 4096;
        this.calls = [];
    }
    evaluate(...e) {
        this.trace("evaluate", ...e);
        return this.inner.evaluate(...e);
    }
    assign(...e) {
        this.trace("assign", ...e);
        return this.inner.assign(...e);
    }
    connect(...e) {
        this.trace("connect", ...e);
        this.inner.connect(...e);
    }
    bind(...e) {
        this.trace("bind", ...e);
        if (this.inner.bind) this.inner.bind(...e);
    }
    unbind(...e) {
        this.trace("unbind", ...e);
        if (this.inner.unbind) this.inner.unbind(...e);
    }
    accept(...e) {
        this.trace("accept", ...e);
        this.inner.accept(...e);
    }
    trace(e, ...t) {
        this.calls.push([ e, ...t ]);
    }
}

class MockValueConverter {
    constructor(e) {
        this.calls = [];
        for (const t of e) this[t] = this[`$${t}`];
    }
    $fromView(e, ...t) {
        this.trace("fromView", e, ...t);
        return e;
    }
    $toView(e, ...t) {
        this.trace("toView", e, ...t);
        return e;
    }
    trace(e, ...t) {
        this.calls.push([ e, ...t ]);
    }
}

class MockContext {
    constructor() {
        this.log = [];
    }
}

class MockBrowserHistoryLocation {
    constructor() {
        this.states = [ {} ];
        this.paths = [ "" ];
        this.index = 0;
    }
    get length() {
        return this.states.length;
    }
    get state() {
        return this.states[this.index];
    }
    get path() {
        return this.paths[this.index];
    }
    get pathname() {
        const e = this.parts;
        let t = e.shift();
        if (!t.startsWith("/")) t = `/${t}`;
        return t;
    }
    get search() {
        const e = this.parts;
        e.shift();
        const t = e.shift();
        return void 0 !== t ? `?${t}` : "";
    }
    get hash() {
        const e = this.parts;
        e.shift();
        e.shift();
        const t = e.shift();
        return void 0 !== t ? `#${t}` : "";
    }
    set hash(e) {
        if (e.startsWith("#")) e = e.substring(1);
        const t = this.parts;
        let n = t.shift();
        const i = t.shift();
        if (void 0 !== i) n += `?${i}`;
        t.shift();
        n += `#${e}`;
        this.pushState({}, null, n);
        this.notifyChange();
    }
    activate() {
        return;
    }
    deactivate() {
        return;
    }
    get parts() {
        const e = [];
        const t = this.path.split("#");
        if (t.length > 1) e.unshift(t.pop()); else e.unshift(void 0);
        const n = t[0].split("?");
        if (n.length > 1) e.unshift(n.pop()); else e.unshift(void 0);
        e.unshift(n[0]);
        return e;
    }
    pushState(e, t, n) {
        this.states.splice(this.index + 1);
        this.paths.splice(this.index + 1);
        this.states.push(e);
        this.paths.push(n);
        this.index++;
    }
    replaceState(e, t, n) {
        this.states[this.index] = e;
        this.paths[this.index] = n;
    }
    go(e) {
        const t = this.index + e;
        if (t >= 0 && t < this.states.length) {
            this.index = t;
            this.notifyChange();
        }
    }
    notifyChange() {
        if (this.changeCallback) this.changeCallback(null).catch((e => {
            throw e;
        }));
    }
}

class ChangeSet {
    constructor(e, t, n, i) {
        this.index = e;
        this.flags = t;
        this._newValue = n;
        this._oldValue = i;
    }
    get newValue() {
        return this._newValue;
    }
    get oldValue() {
        return this._oldValue;
    }
    dispose() {
        this._newValue = void 0;
        this._oldValue = void 0;
    }
}

class ProxyChangeSet {
    constructor(e, t, n, i, r) {
        this.index = e;
        this.flags = t;
        this.key = n;
        this._newValue = i;
        this._oldValue = r;
    }
    get newValue() {
        return this._newValue;
    }
    get oldValue() {
        return this._oldValue;
    }
    dispose() {
        this._newValue = void 0;
        this._oldValue = void 0;
    }
}

class CollectionChangeSet {
    constructor(e, t, n) {
        this.index = e;
        this.flags = t;
        this._indexMap = n;
    }
    get indexMap() {
        return this._indexMap;
    }
    dispose() {
        this._indexMap = void 0;
    }
}

class SpySubscriber {
    constructor() {
        this._changes = void 0;
        this._proxyChanges = void 0;
        this._collectionChanges = void 0;
        this._callCount = 0;
    }
    get changes() {
        if (void 0 === this._changes) return e.emptyArray;
        return this._changes;
    }
    get proxyChanges() {
        if (void 0 === this._proxyChanges) return e.emptyArray;
        return this._proxyChanges;
    }
    get collectionChanges() {
        if (void 0 === this._collectionChanges) return e.emptyArray;
        return this._collectionChanges;
    }
    get hasChanges() {
        return void 0 !== this._changes;
    }
    get hasProxyChanges() {
        return void 0 !== this._proxyChanges;
    }
    get hasCollectionChanges() {
        return void 0 !== this._collectionChanges;
    }
    get callCount() {
        return this._callCount;
    }
    handleChange(e, t, n) {
        if (void 0 === this._changes) this._changes = [ new ChangeSet(this._callCount++, n, e, t) ]; else this._changes.push(new ChangeSet(this._callCount++, n, e, t));
    }
    handleProxyChange(e, t, n, i) {
        if (void 0 === this._proxyChanges) this._proxyChanges = [ new ProxyChangeSet(this._callCount++, i, e, t, n) ]; else this._proxyChanges.push(new ProxyChangeSet(this._callCount++, i, e, t, n));
    }
    handleCollectionChange(e, t) {
        if (void 0 === this._collectionChanges) this._collectionChanges = [ new CollectionChangeSet(this._callCount++, t, e) ]; else this._collectionChanges.push(new CollectionChangeSet(this._callCount++, t, e));
    }
    dispose() {
        if (void 0 !== this._changes) {
            this._changes.forEach((e => e.dispose()));
            this._changes = void 0;
        }
        if (void 0 !== this._proxyChanges) {
            this._proxyChanges.forEach((e => e.dispose()));
            this._proxyChanges = void 0;
        }
        if (void 0 !== this._collectionChanges) {
            this._collectionChanges.forEach((e => e.dispose()));
            this._collectionChanges = void 0;
        }
        this._callCount = 0;
    }
}

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
***************************************************************************** */ function Ei(e, t, n, i) {
    var r = arguments.length, a = r < 3 ? t : null === i ? i = Object.getOwnPropertyDescriptor(t, n) : i, s;
    if ("object" === typeof Reflect && "function" === typeof Reflect.decorate) a = Reflect.decorate(e, t, n, i); else for (var o = e.length - 1; o >= 0; o--) if (s = e[o]) a = (r < 3 ? s(a) : r > 3 ? s(t, n, a) : s(t, n)) || a;
    return r > 3 && a && Object.defineProperty(t, n, a), a;
}

exports.SortValueConverter = class SortValueConverter {
    toView(e, t, n = "asc") {
        if (Array.isArray(e)) {
            const i = "asc" === n ? 1 : -1;
            if (t && t.length) e.sort(((e, n) => e[t] - n[t] * i)); else e.sort(((e, t) => e - t * i));
        }
        return e;
    }
};

exports.SortValueConverter = Ei([ t.valueConverter("sort") ], exports.SortValueConverter);

exports.JsonValueConverter = class JsonValueConverter {
    toView(e) {
        return JSON.stringify(e);
    }
    fromView(e) {
        return JSON.parse(e);
    }
};

exports.JsonValueConverter = Ei([ t.valueConverter("json") ], exports.JsonValueConverter);

let Li = class NameTag {};

Ei([ t.bindable() ], Li.prototype, "name", void 0);

Li = Ei([ t.customElement({
    name: "name-tag",
    template: `<template>\${name}</template>`,
    needsCompile: true,
    dependencies: [],
    instructions: [],
    surrogates: []
}) ], Li);

const Ai = [ exports.SortValueConverter, exports.JsonValueConverter, Li ];

const Ti = {
    register(e) {
        e.register(...Ai);
    }
};

function ji(e, ...t) {
    const n = {
        result: ""
    };
    const i = t.length;
    for (let r = 0; r < i; ++r) n.result = n.result + e[r] + Pi(t[r], n);
    return n.result + e[i];
}

const Mi = /\r?\n/g;

const Ri = /\s+/g;

const zi = Object.prototype.toString;

function Pi(e, t) {
    const n = zi.call(e);
    switch (n) {
      case "[object Undefined]":
        return "undefined";

      case "[object Null]":
        return "null";

      case "[object String]":
        return `'${e}'`;

      case "[object Boolean]":
      case "[object Number]":
        return e;

      case "[object Array]":
        return `[${e.map((e => Pi(e, t))).join(",")}]`;

      case "[object Event]":
        return `'${e.type}'`;

      case "[object Object]":
        {
            const n = Object.getPrototypeOf(e);
            if (!n || !n.constructor || "Object" === n.constructor.name) return qi(e, t);
            return `class ${n.constructor.name}${qi(e, t)}`;
        }

      case "[object Function]":
        if (e.name && e.name.length) return `class ${e.name}`;
        return e.toString().replace(Ri, "");

      default:
        return qi(e, t);
    }
}

function qi(e, t) {
    if (t.result.length > 100) return "(json string)";
    try {
        let n = [];
        let i = 0;
        const r = JSON.stringify(e, (function(e, r) {
            if ("dom" === e) return "(dom)";
            if (2 === ++i) return String(r);
            if ("object" === typeof r && null !== r) {
                if (r.nodeType > 0) {
                    --i;
                    return _i(r, t);
                }
                if (n.includes(r)) try {
                    --i;
                    return JSON.parse(JSON.stringify(r));
                } catch (e) {
                    return;
                }
                n.push(r);
            }
            --i;
            return r;
        }));
        n = void 0;
        let a = r.replace(Mi, "");
        if (a.length > 25) {
            const e = a.length;
            a = `${a.slice(0, 25)}...(+${e - 25})`;
        }
        t.result += a;
        return a;
    } catch (e) {
        return `error stringifying to json: ${e}`;
    }
}

function _i(e, t) {
    if (t.result.length > 100) return "(html string)";
    if (null === e) return "null";
    if (void 0 === e) return "undefined";
    if (null != e.textContent && e.textContent.length || 3 === e.nodeType || 8 === e.nodeType) {
        const t = e.textContent.replace(Mi, "");
        if (t.length > 10) {
            const e = t.length;
            return `${t.slice(0, 10)}...(+${e - 10})`;
        }
        return t;
    }
    if (1 === e.nodeType) {
        if (e.innerHTML.length) {
            const t = e.innerHTML.replace(Mi, "");
            if (t.length > 10) {
                const e = t.length;
                return `${t.slice(0, 10)}...(+${e - 10})`;
            }
            return t;
        }
        if ("TEMPLATE" === e.nodeName) return _i(e.content, t);
    }
    let n = "";
    for (let i = 0, r = e.childNodes.length; i < r; ++i) {
        const r = e.childNodes[i];
        n += _i(r, t);
    }
    return n;
}

function Fi(e, t) {
    const n = `${e}`;
    const i = n.length;
    if (i >= t) return n;
    return n + new Array(t - i + 1).join(" ");
}

function Ni(e, t) {
    const n = `${e}`;
    const i = n.length;
    if (i >= t) return n;
    return new Array(t - i + 1).join(" ") + n;
}

function Ii(n) {
    let i;
    if (void 0 === n || !("get" in n)) i = Xe(); else i = n;
    const r = {
        handles() {
            return false;
        }
    };
    e.Registration.instance(t.IDirtyChecker, null).register(i);
    e.Registration.instance(t.INodeObserverLocator, r).register(i);
    return i.get(t.IObserverLocator);
}

function Vi(e = {}, n, i) {
    return n ? t.Scope.fromParent(t.Scope.create(n), e) : t.Scope.create(e, t.OverrideContext.create(e), i);
}

class Call {
    constructor(e, t, n, i) {
        this.instance = e;
        this.args = t;
        this.method = n;
        this.index = i;
    }
}

class CallCollection {
    constructor() {
        this.calls = [];
    }
    static register(t) {
        t.register(e.Registration.singleton(this, this));
    }
    addCall(e, t, ...n) {
        this.calls.push(new Call(e, n, t, this.calls.length));
        return this;
    }
}

function Hi(t, n) {
    const i = t.prototype;
    const a = r(i);
    for (const t in a) {
        const r = a[t];
        if ("constructor" !== t && "function" === typeof r.value && true === r.configurable && true === r.writable) {
            const e = r.value;
            const a = function(...i) {
                n.addCall(this, t, ...i);
                return p(e, this, i);
            };
            Reflect.defineProperty(a, "original", {
                value: e,
                writable: true,
                configurable: true,
                enumerable: false
            });
            Reflect.defineProperty(i, t, {
                value: a,
                writable: r.writable,
                configurable: r.configurable,
                enumerable: r.enumerable
            });
        } else {
            const {get: a, set: s} = r;
            let o, l;
            if (a) {
                o = function() {
                    n.addCall(this, `get ${t}`, e.emptyArray);
                    return p(a, this, e.emptyArray);
                };
                Reflect.defineProperty(o, "original", {
                    value: a
                });
            }
            if (s) {
                l = function(i) {
                    n.addCall(this, `get ${t}`, e.emptyArray);
                    p(s, this, [ i ]);
                };
                Reflect.defineProperty(l, "original", {
                    value: s
                });
            }
            if (a || s) Reflect.defineProperty(i, t, {
                ...r,
                get: o,
                set: l
            });
        }
    }
}

function Bi(e) {
    const t = e.prototype;
    const n = r(t);
    for (const e in n) {
        const i = n[e];
        if ("constructor" !== e && "function" === typeof i.value && true === i.configurable && true === i.writable) Reflect.defineProperty(t, e, {
            value: i.value.original,
            writable: i.writable,
            configurable: i.configurable,
            enumerable: i.enumerable
        }); else {
            const {get: n, set: r} = i;
            if (n || r) Reflect.defineProperty(t, e, {
                ...i,
                get: n && Reflect.get(n, "original"),
                set: r && Reflect.get(r, "original")
            });
        }
    }
}

function Di(e) {
    return function(t) {
        Hi(t, e);
    };
}

exports.CSS_PROPERTIES = di;

exports.Call = Call;

exports.CallCollection = CallCollection;

exports.ChangeSet = ChangeSet;

exports.CollectionChangeSet = CollectionChangeSet;

exports.MockBinding = MockBinding;

exports.MockBindingBehavior = MockBindingBehavior;

exports.MockBrowserHistoryLocation = MockBrowserHistoryLocation;

exports.MockContext = MockContext;

exports.MockPropertySubscriber = MockPropertySubscriber;

exports.MockServiceLocator = MockServiceLocator;

exports.MockSignaler = MockSignaler;

exports.MockTracingExpression = MockTracingExpression;

exports.MockValueConverter = MockValueConverter;

exports.PSEUDO_ELEMENTS = fi;

exports.ProxyChangeSet = ProxyChangeSet;

exports.SpySubscriber = SpySubscriber;

exports.TestConfiguration = Ti;

exports.TestContext = TestContext;

exports._ = ji;

exports.assert = hi;

exports.createContainer = Xe;

exports.createFixture = Oi;

exports.createObserverLocator = Ii;

exports.createScopeForTest = Vi;

exports.createSpy = je;

exports.eachCartesianJoin = bi;

exports.eachCartesianJoinAsync = vi;

exports.eachCartesianJoinFactory = gi;

exports.ensureTaskQueuesEmpty = bn;

exports.fail = Mn;

exports.generateCartesianProduct = $i;

exports.getVisibleText = pn;

exports.globalAttributeNames = pi;

exports.h = wi;

exports.hJsx = Si;

exports.htmlStringify = _i;

exports.inspect = un;

exports.instructionTypeName = gn;

exports.jsonStringify = qi;

exports.padLeft = Ni;

exports.padRight = Fi;

exports.recordCalls = Hi;

exports.setPlatform = Ke;

exports.stopRecordingCalls = Bi;

exports.stringify = Pi;

exports.trace = Di;

exports.trimFull = Te;

exports.verifyBindingInstructionsEqual = mn;

exports.verifyEqual = hn;
//# sourceMappingURL=index.js.map
