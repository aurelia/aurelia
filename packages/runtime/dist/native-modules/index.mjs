import { DestructuringAssignmentSingleExpression as t, IExpressionParser as e } from "../../../expression-parser/dist/native-modules/index.mjs";

import { DI as r, isObjectOrFunction as s, isFunction as n, isArray as i, isArrayIndex as a, isSet as o, isMap as c, areEqual as u, Registration as l, resolve as h, IPlatform as f, isObject as d, createLookup as p, emptyObject as b } from "../../../kernel/dist/native-modules/index.mjs";

import { Metadata as v } from "../../../metadata/dist/native-modules/index.mjs";

const w = Object.prototype.hasOwnProperty;

const g = Reflect.defineProperty;

function rtDefineHiddenProp(t, e, r) {
    g(t, e, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: r
    });
    return r;
}

function ensureProto(t, e, r) {
    if (!(e in t)) {
        rtDefineHiddenProp(t, e, r);
    }
}

const y = Object.assign;

const C = Object.freeze;

const O = String;

const A = r.createInterface;

const E = v.get;

const m = v.define;

const createMappedError = (t, ...e) => new Error(`AUR${O(t).padStart(4, "0")}:${e.map(O)}`);

class Scope {
    constructor(t, e, r, s) {
        this.parent = t;
        this.bindingContext = e;
        this.overrideContext = r;
        this.isBoundary = s;
    }
    static getContext(t, e, r) {
        if (t == null) {
            throw createMappedError(203);
        }
        let s = t.overrideContext;
        let n = t;
        if (r > 0) {
            while (r > 0) {
                r--;
                n = n.parent;
                if (n == null) {
                    return void 0;
                }
            }
            s = n.overrideContext;
            return e in s ? s : n.bindingContext;
        }
        while (n != null && !n.isBoundary && !(e in n.overrideContext) && !(e in n.bindingContext)) {
            n = n.parent;
        }
        if (n == null) {
            return t.bindingContext;
        }
        s = n.overrideContext;
        return e in s ? s : n.bindingContext;
    }
    static create(t, e, r) {
        if (t == null) {
            throw createMappedError(204);
        }
        return new Scope(null, t, e ?? new OverrideContext, r ?? false);
    }
    static fromParent(t, e, r = new OverrideContext) {
        if (t == null) {
            throw createMappedError(203);
        }
        return new Scope(t, e, r, false);
    }
}

class BindingContext {
    constructor(t, e) {
        if (t !== void 0) {
            this[t] = e;
        }
    }
}

class OverrideContext {}

const {astAssign: S, astEvaluate: x, astBind: R, astUnbind: P} = /*@__PURE__*/ (() => {
    const e = "AccessThis";
    const r = "AccessBoundary";
    const o = "AccessGlobal";
    const c = "AccessScope";
    const u = "ArrayLiteral";
    const l = "ObjectLiteral";
    const h = "PrimitiveLiteral";
    const f = "New";
    const d = "Template";
    const p = "Unary";
    const b = "CallScope";
    const v = "CallMember";
    const w = "CallFunction";
    const g = "CallGlobal";
    const y = "AccessMember";
    const C = "AccessKeyed";
    const A = "TaggedTemplate";
    const E = "Binary";
    const m = "Conditional";
    const S = "Assign";
    const x = "ArrowFunction";
    const R = "ValueConverter";
    const P = "BindingBehavior";
    const I = "ArrayBindingPattern";
    const k = "ObjectBindingPattern";
    const _ = "BindingIdentifier";
    const D = "ForOfStatement";
    const M = "Interpolation";
    const L = "ArrayDestructuring";
    const N = "ObjectDestructuring";
    const V = "DestructuringAssignmentLeaf";
    const B = "Custom";
    const j = Scope.getContext;
    function astEvaluate(t, a, H, $) {
        switch (t.$kind) {
          case e:
            {
                let e = a.overrideContext;
                let r = a;
                let s = t.ancestor;
                while (s-- && e) {
                    r = r.parent;
                    e = r?.overrideContext ?? null;
                }
                return s < 1 && r ? r.bindingContext : void 0;
            }

          case r:
            {
                let t = a;
                while (t != null && !t.isBoundary) {
                    t = t.parent;
                }
                return t ? t.bindingContext : void 0;
            }

          case c:
            {
                const e = j(a, t.name, t.ancestor);
                if ($ !== null) {
                    $.observe(e, t.name);
                }
                const r = e[t.name];
                if (r == null) {
                    if (t.name === "$host") {
                        throw createMappedError(105);
                    }
                    return r;
                }
                return H?.boundFn && n(r) ? r.bind(e) : r;
            }

          case o:
            return globalThis[t.name];

          case g:
            {
                const e = globalThis[t.name];
                if (n(e)) {
                    return e(...t.args.map((t => astEvaluate(t, a, H, $))));
                }
                if (!H?.strict && e == null) {
                    return void 0;
                }
                throw createMappedError(107);
            }

          case u:
            return t.elements.map((t => astEvaluate(t, a, H, $)));

          case l:
            {
                const e = {};
                for (let r = 0; r < t.keys.length; ++r) {
                    e[t.keys[r]] = astEvaluate(t.values[r], a, H, $);
                }
                return e;
            }

          case h:
            return t.value;

          case f:
            {
                const e = astEvaluate(t.func, a, H, $);
                if (n(e)) {
                    return new e(...t.args.map((t => astEvaluate(t, a, H, $))));
                }
                throw createMappedError(107);
            }

          case d:
            {
                let e = t.cooked[0];
                for (let r = 0; r < t.expressions.length; ++r) {
                    e += O(astEvaluate(t.expressions[r], a, H, $));
                    e += t.cooked[r + 1];
                }
                return e;
            }

          case p:
            {
                const e = astEvaluate(t.expression, a, H, $);
                switch (t.operation) {
                  case "void":
                    return void e;

                  case "typeof":
                    return typeof e;

                  case "!":
                    return !e;

                  case "-":
                    return -e;

                  case "+":
                    return +e;

                  case "--":
                    if ($ != null) throw createMappedError(113);
                    return astAssign(t.expression, a, H, $, e - 1) + t.pos;

                  case "++":
                    if ($ != null) throw createMappedError(113);
                    return astAssign(t.expression, a, H, $, e + 1) - t.pos;

                  default:
                    throw createMappedError(109, t.operation);
                }
            }

          case b:
            {
                const e = j(a, t.name, t.ancestor);
                if (e == null) {
                    if (H?.strict) {
                        throw createMappedError(114, t.name, e);
                    }
                    return void 0;
                }
                const r = e[t.name];
                if (n(r)) {
                    return r.apply(e, t.args.map((t => astEvaluate(t, a, H, $))));
                }
                if (r == null) {
                    if (H?.strict && !t.optional) {
                        throw createMappedError(111, t.name);
                    }
                    return void 0;
                }
                throw createMappedError(111, t.name);
            }

          case v:
            {
                const e = astEvaluate(t.object, a, H, $);
                if (e == null) {
                    if (H?.strict && !t.optionalMember) {
                        throw createMappedError(114, t.name, e);
                    }
                }
                const r = e?.[t.name];
                if (r == null) {
                    if (!t.optionalCall && H?.strict) {
                        throw createMappedError(111, t.name);
                    }
                    return void 0;
                }
                if (!n(r)) {
                    throw createMappedError(111, t.name);
                }
                const s = r.apply(e, t.args.map((t => astEvaluate(t, a, H, $))));
                if (i(e) && F.includes(t.name)) {
                    $?.observeCollection(e);
                }
                return s;
            }

          case w:
            {
                const e = astEvaluate(t.func, a, H, $);
                if (n(e)) {
                    return e(...t.args.map((t => astEvaluate(t, a, H, $))));
                }
                if (e == null) {
                    if (!t.optional && H?.strict) {
                        throw createMappedError(107);
                    }
                    return void 0;
                }
                throw createMappedError(107);
            }

          case x:
            {
                const func = (...e) => {
                    const r = t.args;
                    const s = t.rest;
                    const n = r.length - 1;
                    const i = r.reduce(((t, r, i) => {
                        if (s && i === n) {
                            t[r.name] = e.slice(i);
                        } else {
                            t[r.name] = e[i];
                        }
                        return t;
                    }), {});
                    const o = Scope.fromParent(a, i);
                    return astEvaluate(t.body, o, H, $);
                };
                return func;
            }

          case y:
            {
                const e = astEvaluate(t.object, a, H, $);
                if (e == null) {
                    if (!t.optional && H?.strict) {
                        throw createMappedError(114, t.name, e);
                    }
                    return void 0;
                }
                if ($ !== null && !t.accessGlobal) {
                    $.observe(e, t.name);
                }
                const r = e[t.name];
                return H?.boundFn && n(r) ? r.bind(e) : r;
            }

          case C:
            {
                const e = astEvaluate(t.object, a, H, $);
                const r = astEvaluate(t.key, a, H, $);
                if (e == null) {
                    if (!t.optional && H?.strict) {
                        throw createMappedError(115, r, e);
                    }
                    return void 0;
                }
                if ($ !== null && !t.accessGlobal) {
                    $.observe(e, r);
                }
                return e[r];
            }

          case A:
            {
                const e = t.expressions.map((t => astEvaluate(t, a, H, $)));
                const r = astEvaluate(t.func, a, H, $);
                if (!n(r)) {
                    throw createMappedError(110);
                }
                return r(t.cooked, ...e);
            }

          case E:
            {
                const e = t.left;
                const r = t.right;
                switch (t.operation) {
                  case "&&":
                    return astEvaluate(e, a, H, $) && astEvaluate(r, a, H, $);

                  case "||":
                    return astEvaluate(e, a, H, $) || astEvaluate(r, a, H, $);

                  case "??":
                    return astEvaluate(e, a, H, $) ?? astEvaluate(r, a, H, $);

                  case "==":
                    return astEvaluate(e, a, H, $) == astEvaluate(r, a, H, $);

                  case "===":
                    return astEvaluate(e, a, H, $) === astEvaluate(r, a, H, $);

                  case "!=":
                    return astEvaluate(e, a, H, $) != astEvaluate(r, a, H, $);

                  case "!==":
                    return astEvaluate(e, a, H, $) !== astEvaluate(r, a, H, $);

                  case "instanceof":
                    {
                        const t = astEvaluate(r, a, H, $);
                        if (n(t)) {
                            return astEvaluate(e, a, H, $) instanceof t;
                        }
                        return false;
                    }

                  case "in":
                    {
                        const t = astEvaluate(r, a, H, $);
                        if (s(t)) {
                            return astEvaluate(e, a, H, $) in t;
                        }
                        return false;
                    }

                  case "+":
                    return astEvaluate(e, a, H, $) + astEvaluate(r, a, H, $);

                  case "-":
                    return astEvaluate(e, a, H, $) - astEvaluate(r, a, H, $);

                  case "*":
                    return astEvaluate(e, a, H, $) * astEvaluate(r, a, H, $);

                  case "/":
                    return astEvaluate(e, a, H, $) / astEvaluate(r, a, H, $);

                  case "%":
                    return astEvaluate(e, a, H, $) % astEvaluate(r, a, H, $);

                  case "**":
                    return astEvaluate(e, a, H, $) ** astEvaluate(r, a, H, $);

                  case "<":
                    return astEvaluate(e, a, H, $) < astEvaluate(r, a, H, $);

                  case ">":
                    return astEvaluate(e, a, H, $) > astEvaluate(r, a, H, $);

                  case "<=":
                    return astEvaluate(e, a, H, $) <= astEvaluate(r, a, H, $);

                  case ">=":
                    return astEvaluate(e, a, H, $) >= astEvaluate(r, a, H, $);

                  default:
                    throw createMappedError(108, t.operation);
                }
            }

          case m:
            return astEvaluate(t.condition, a, H, $) ? astEvaluate(t.yes, a, H, $) : astEvaluate(t.no, a, H, $);

          case S:
            {
                let e = astEvaluate(t.value, a, H, $);
                if (t.op !== "=") {
                    if ($ != null) {
                        throw createMappedError(113);
                    }
                    const r = astEvaluate(t.target, a, H, $);
                    switch (t.op) {
                      case "/=":
                        e = r / e;
                        break;

                      case "*=":
                        e = r * e;
                        break;

                      case "+=":
                        e = r + e;
                        break;

                      case "-=":
                        e = r - e;
                        break;

                      default:
                        throw createMappedError(108, t.op);
                    }
                }
                return astAssign(t.target, a, H, $, e);
            }

          case R:
            {
                return H?.useConverter?.(t.name, "toView", astEvaluate(t.expression, a, H, $), t.args.map((t => astEvaluate(t, a, H, $))));
            }

          case P:
            return astEvaluate(t.expression, a, H, $);

          case _:
            return t.name;

          case D:
            return astEvaluate(t.iterable, a, H, $);

          case M:
            if (t.isMulti) {
                let e = t.parts[0];
                let r = 0;
                for (;r < t.expressions.length; ++r) {
                    e += O(astEvaluate(t.expressions[r], a, H, $));
                    e += t.parts[r + 1];
                }
                return e;
            } else {
                return `${t.parts[0]}${astEvaluate(t.firstExpression, a, H, $)}${t.parts[1]}`;
            }

          case V:
            return astEvaluate(t.target, a, H, $);

          case L:
            {
                return t.list.map((t => astEvaluate(t, a, H, $)));
            }

          case I:
          case k:
          case N:
          default:
            return void 0;

          case B:
            return t.evaluate(a, H, $);
        }
    }
    function astAssign(e, r, n, o, u) {
        switch (e.$kind) {
          case c:
            {
                if (e.name === "$host") {
                    throw createMappedError(106);
                }
                const t = j(r, e.name, e.ancestor);
                return t[e.name] = u;
            }

          case y:
            {
                const t = astEvaluate(e.object, r, n, o);
                if (t == null) {
                    if (n?.strict) {
                        throw createMappedError(116, e.name);
                    }
                    astAssign(e.object, r, n, o, {
                        [e.name]: u
                    });
                } else if (s(t)) {
                    if (e.name === "length" && i(t) && !isNaN(u)) {
                        t.splice(u);
                    } else {
                        t[e.name] = u;
                    }
                } else ;
                return u;
            }

          case C:
            {
                const t = astEvaluate(e.object, r, n, o);
                const s = astEvaluate(e.key, r, n, o);
                if (t == null) {
                    if (n?.strict) {
                        throw createMappedError(116, s);
                    }
                    astAssign(e.object, r, n, o, {
                        [s]: u
                    });
                    return u;
                }
                if (i(t)) {
                    if (s === "length" && !isNaN(u)) {
                        t.splice(u);
                        return u;
                    }
                    if (a(s)) {
                        t.splice(s, 1, u);
                        return u;
                    }
                }
                return t[s] = u;
            }

          case S:
            astAssign(e.value, r, n, o, u);
            return astAssign(e.target, r, n, o, u);

          case R:
            {
                u = n?.useConverter?.(e.name, "fromView", u, e.args.map((t => astEvaluate(t, r, n, o))));
                return astAssign(e.expression, r, n, o, u);
            }

          case P:
            return astAssign(e.expression, r, n, o, u);

          case L:
          case N:
            {
                const t = e.list;
                const s = t.length;
                let i;
                let a;
                for (i = 0; i < s; i++) {
                    a = t[i];
                    switch (a.$kind) {
                      case V:
                        astAssign(a, r, n, o, u);
                        break;

                      case L:
                      case N:
                        {
                            if (typeof u !== "object" || u === null) {
                                throw createMappedError(112);
                            }
                            let t = astEvaluate(a.source, Scope.create(u), n, null);
                            if (t === void 0 && a.initializer) {
                                t = astEvaluate(a.initializer, r, n, null);
                            }
                            astAssign(a, r, n, o, t);
                            break;
                        }
                    }
                }
                break;
            }

          case V:
            {
                if (e instanceof t) {
                    if (u == null) {
                        return;
                    }
                    if (typeof u !== "object") {
                        throw createMappedError(112);
                    }
                    let t = astEvaluate(e.source, Scope.create(u), n, o);
                    if (t === void 0 && e.initializer) {
                        t = astEvaluate(e.initializer, r, n, o);
                    }
                    astAssign(e.target, r, n, o, t);
                } else {
                    if (u == null) {
                        return;
                    }
                    if (typeof u !== "object") {
                        throw createMappedError(112);
                    }
                    const t = e.indexOrProperties;
                    let s;
                    if (a(t)) {
                        if (!Array.isArray(u)) {
                            throw createMappedError(112);
                        }
                        s = u.slice(t);
                    } else {
                        s = Object.entries(u).reduce(((e, [r, s]) => {
                            if (!t.includes(r)) {
                                e[r] = s;
                            }
                            return e;
                        }), {});
                    }
                    astAssign(e.target, r, n, o, s);
                }
                break;
            }

          case B:
            return e.assign(r, n, u);

          default:
            return void 0;
        }
    }
    function astBind(t, e, r) {
        switch (t.$kind) {
          case P:
            {
                r.bindBehavior?.(t.name, e, t.args.map((t => astEvaluate(t, e, r, null))));
                astBind(t.expression, e, r);
                break;
            }

          case R:
            {
                r.bindConverter?.(t.name);
                astBind(t.expression, e, r);
                break;
            }

          case D:
            {
                astBind(t.iterable, e, r);
                break;
            }

          case B:
            {
                t.bind?.(e, r);
            }
        }
    }
    function astUnbind(t, e, r) {
        switch (t.$kind) {
          case P:
            {
                r.unbindBehavior?.(t.name, e);
                astUnbind(t.expression, e, r);
                break;
            }

          case R:
            {
                r.unbindConverter?.(t.name);
                astUnbind(t.expression, e, r);
                break;
            }

          case D:
            {
                astUnbind(t.iterable, e, r);
                break;
            }

          case B:
            {
                t.unbind?.(e, r);
            }
        }
    }
    const F = "at map filter includes indexOf lastIndexOf findIndex find flat flatMap join reduce reduceRight slice every some sort".split(" ");
    return {
        astEvaluate: astEvaluate,
        astAssign: astAssign,
        astBind: astBind,
        astUnbind: astUnbind
    };
})();

const I = (() => t => {
    const e = t.prototype;
    [ "bindBehavior", "unbindBehavior", "bindConverter", "unbindConverter", "useConverter" ].forEach((t => {
        rtDefineHiddenProp(e, t, (() => {
            throw createMappedError(99, t);
        }));
    }));
})();

const k = /*@__PURE__*/ r.createInterface("ICoercionConfiguration");

const _ = 0;

const D = 1;

const M = 2;

const L = 4;

const N = /*@__PURE__*/ C({
    None: _,
    Observer: D,
    Node: M,
    Layout: L
});

function copyIndexMap(t, e, r) {
    const {length: s} = t;
    const n = Array(s);
    let i = 0;
    while (i < s) {
        n[i] = t[i];
        ++i;
    }
    if (e !== void 0) {
        n.deletedIndices = e.slice(0);
    } else if (t.deletedIndices !== void 0) {
        n.deletedIndices = t.deletedIndices.slice(0);
    } else {
        n.deletedIndices = [];
    }
    if (r !== void 0) {
        n.deletedItems = r.slice(0);
    } else if (t.deletedItems !== void 0) {
        n.deletedItems = t.deletedItems.slice(0);
    } else {
        n.deletedItems = [];
    }
    n.isIndexMap = true;
    return n;
}

function createIndexMap(t = 0) {
    const e = Array(t);
    let r = 0;
    while (r < t) {
        e[r] = r++;
    }
    e.deletedIndices = [];
    e.deletedItems = [];
    e.isIndexMap = true;
    return e;
}

function cloneIndexMap(t) {
    const e = t.slice();
    e.deletedIndices = t.deletedIndices.slice();
    e.deletedItems = t.deletedItems.slice();
    e.isIndexMap = true;
    return e;
}

function isIndexMap(t) {
    return i(t) && t.isIndexMap === true;
}

let V = new Map;

let B = false;

function batch(t) {
    const e = V;
    const r = V = new Map;
    B = true;
    try {
        t();
    } finally {
        V = null;
        B = false;
        try {
            let t;
            let s;
            let n;
            let i;
            let a;
            let o = false;
            let c;
            let u;
            for (t of r) {
                s = t[0];
                n = t[1];
                if (e?.has(s)) {
                    e.set(s, n);
                }
                if (n[0] === 1) {
                    s.notify(n[1], n[2]);
                } else {
                    i = n[1];
                    a = n[2];
                    o = false;
                    if (a.deletedIndices.length > 0) {
                        o = true;
                    } else {
                        for (c = 0, u = a.length; c < u; ++c) {
                            if (a[c] !== c) {
                                o = true;
                                break;
                            }
                        }
                    }
                    if (o) {
                        s.notifyCollection(i, a);
                    }
                }
            }
        } finally {
            V = e;
        }
    }
}

function addCollectionBatch(t, e, r) {
    if (!V.has(t)) {
        V.set(t, [ 2, e, r ]);
    } else {
        V.get(t)[2] = r;
    }
}

function addValueBatch(t, e, r) {
    const s = V.get(t);
    if (s === void 0) {
        V.set(t, [ 1, e, r ]);
    } else {
        s[1] = e;
        s[2] = r;
    }
}

const j = /*@__PURE__*/ (() => {
    function subscriberCollection(t, e) {
        return t == null ? subscriberCollectionDeco : subscriberCollectionDeco(t);
    }
    function getSubscriberRecord() {
        return rtDefineHiddenProp(this, "subs", new SubscriberRecord);
    }
    function addSubscriber(t) {
        return this.subs.add(t);
    }
    function removeSubscriber(t) {
        return this.subs.remove(t);
    }
    const t = new WeakSet;
    function subscriberCollectionDeco(e, r) {
        if (!t.has(e)) {
            t.add(e);
            const r = e.prototype;
            g(r, "subs", {
                get: getSubscriberRecord
            });
            ensureProto(r, "subscribe", addSubscriber);
            ensureProto(r, "unsubscribe", removeSubscriber);
        }
        return e;
    }
    class SubscriberRecord {
        constructor() {
            this.count = 0;
            this.t = [];
            this.i = [];
            this.u = false;
        }
        add(t) {
            if (this.t.includes(t)) {
                return false;
            }
            this.t[this.t.length] = t;
            if ("handleDirty" in t) {
                this.i[this.i.length] = t;
                this.u = true;
            }
            ++this.count;
            return true;
        }
        remove(t) {
            let e = this.t.indexOf(t);
            if (e !== -1) {
                this.t.splice(e, 1);
                e = this.i.indexOf(t);
                if (e !== -1) {
                    this.i.splice(e, 1);
                    this.u = this.i.length > 0;
                }
                --this.count;
                return true;
            }
            return false;
        }
        notify(t, e) {
            if (B) {
                addValueBatch(this, t, e);
                return;
            }
            for (const r of this.t.slice(0)) {
                r.handleChange(t, e);
            }
        }
        notifyCollection(t, e) {
            const r = this.t.slice(0);
            const s = r.length;
            let n = 0;
            for (;n < s; ++n) {
                r[n].handleCollectionChange(t, e);
            }
            return;
        }
        notifyDirty() {
            if (this.u) {
                for (const t of this.i.slice(0)) {
                    t.handleDirty();
                }
            }
        }
    }
    return subscriberCollection;
})();

class CollectionLengthObserver {
    constructor(t) {
        this.owner = t;
        this.type = D;
        this.v = (this.o = t.collection).length;
    }
    getValue() {
        return this.o.length;
    }
    setValue(t) {
        if (t !== this.v) {
            if (!Number.isNaN(t)) {
                this.o.splice(t);
                this.v = this.o.length;
            }
        }
    }
    handleDirty() {
        if (this.v !== this.o.length) {
            this.subs.notifyDirty();
        }
    }
    handleCollectionChange(t, e) {
        const r = this.v;
        const s = this.o.length;
        if ((this.v = s) !== r) {
            this.subs.notifyDirty();
            this.subs.notify(this.v, r);
        }
    }
}

(() => {
    implementLengthObserver(CollectionLengthObserver);
})();

class CollectionSizeObserver {
    constructor(t) {
        this.owner = t;
        this.type = D;
        this.v = (this.o = t.collection).size;
    }
    getValue() {
        return this.o.size;
    }
    setValue() {
        throw createMappedError(220);
    }
    handleDirty() {
        if (this.v !== this.o.size) {
            this.subs.notifyDirty();
        }
    }
    handleCollectionChange(t, e) {
        const r = this.v;
        const s = this.o.size;
        if ((this.v = s) !== r) {
            this.subs.notify(this.v, r);
        }
    }
}

(() => {
    implementLengthObserver(CollectionSizeObserver);
})();

function implementLengthObserver(t) {
    const e = t.prototype;
    ensureProto(e, "subscribe", subscribe);
    ensureProto(e, "unsubscribe", unsubscribe);
    return j(t, null);
}

function subscribe(t) {
    if (this.subs.add(t) && this.subs.count === 1) {
        this.owner.subscribe(this);
    }
}

function unsubscribe(t) {
    if (this.subs.remove(t) && this.subs.count === 0) {
        this.owner.subscribe(this);
    }
}

const F = /*@__PURE__*/ (() => {
    const t = Symbol.for("__au_arr_obs__");
    const e = Array[t] ?? rtDefineHiddenProp(Array, t, new WeakMap);
    function sortCompare(t, e) {
        if (t === e) {
            return 0;
        }
        t = t === null ? "null" : t.toString();
        e = e === null ? "null" : e.toString();
        return t < e ? -1 : 1;
    }
    function preSortCompare(t, e) {
        if (t === void 0) {
            if (e === void 0) {
                return 0;
            } else {
                return 1;
            }
        }
        if (e === void 0) {
            return -1;
        }
        return 0;
    }
    function insertionSort(t, e, r, s, n) {
        let i, a, o, c, u;
        let l, h;
        for (l = r + 1; l < s; l++) {
            i = t[l];
            a = e[l];
            for (h = l - 1; h >= r; h--) {
                o = t[h];
                c = e[h];
                u = n(o, i);
                if (u > 0) {
                    t[h + 1] = o;
                    e[h + 1] = c;
                } else {
                    break;
                }
            }
            t[h + 1] = i;
            e[h + 1] = a;
        }
    }
    function quickSort(t, e, r, s, n) {
        let i = 0, a = 0;
        let o, c, u;
        let l, h, f;
        let d, p, b;
        let v, w;
        let g, y, C, O;
        let A, E, m, S;
        while (true) {
            if (s - r <= 10) {
                insertionSort(t, e, r, s, n);
                return;
            }
            i = r + (s - r >> 1);
            o = t[r];
            l = e[r];
            c = t[s - 1];
            h = e[s - 1];
            u = t[i];
            f = e[i];
            d = n(o, c);
            if (d > 0) {
                v = o;
                w = l;
                o = c;
                l = h;
                c = v;
                h = w;
            }
            p = n(o, u);
            if (p >= 0) {
                v = o;
                w = l;
                o = u;
                l = f;
                u = c;
                f = h;
                c = v;
                h = w;
            } else {
                b = n(c, u);
                if (b > 0) {
                    v = c;
                    w = h;
                    c = u;
                    h = f;
                    u = v;
                    f = w;
                }
            }
            t[r] = o;
            e[r] = l;
            t[s - 1] = u;
            e[s - 1] = f;
            g = c;
            y = h;
            C = r + 1;
            O = s - 1;
            t[i] = t[C];
            e[i] = e[C];
            t[C] = g;
            e[C] = y;
            t: for (a = C + 1; a < O; a++) {
                A = t[a];
                E = e[a];
                m = n(A, g);
                if (m < 0) {
                    t[a] = t[C];
                    e[a] = e[C];
                    t[C] = A;
                    e[C] = E;
                    C++;
                } else if (m > 0) {
                    do {
                        O--;
                        if (O == a) {
                            break t;
                        }
                        S = t[O];
                        m = n(S, g);
                    } while (m > 0);
                    t[a] = t[O];
                    e[a] = e[O];
                    t[O] = A;
                    e[O] = E;
                    if (m < 0) {
                        A = t[a];
                        E = e[a];
                        t[a] = t[C];
                        e[a] = e[C];
                        t[C] = A;
                        e[C] = E;
                        C++;
                    }
                }
            }
            if (s - O < C - r) {
                quickSort(t, e, O, s, n);
                s = C;
            } else {
                quickSort(t, e, r, C, n);
                r = O;
            }
        }
    }
    const r = Array.prototype;
    const s = [ "push", "unshift", "pop", "shift", "splice", "reverse", "sort" ];
    let i;
    function overrideArrayPrototypes() {
        const t = r.push;
        const a = r.unshift;
        const o = r.pop;
        const c = r.shift;
        const u = r.splice;
        const l = r.reverse;
        const h = r.sort;
        i = {
            push: function(...r) {
                const s = e.get(this);
                if (s === void 0) {
                    return t.apply(this, r);
                }
                const n = this.length;
                const i = r.length;
                if (i === 0) {
                    return n;
                }
                this.length = s.indexMap.length = n + i;
                let a = n;
                while (a < this.length) {
                    this[a] = r[a - n];
                    s.indexMap[a] = -2;
                    a++;
                }
                s.notify();
                return this.length;
            },
            unshift: function(...t) {
                const r = e.get(this);
                if (r === void 0) {
                    return a.apply(this, t);
                }
                const s = t.length;
                const n = new Array(s);
                let i = 0;
                while (i < s) {
                    n[i++] = -2;
                }
                a.apply(r.indexMap, n);
                const o = a.apply(this, t);
                r.notify();
                return o;
            },
            pop: function() {
                const t = e.get(this);
                if (t === void 0) {
                    return o.call(this);
                }
                const r = t.indexMap;
                const s = o.call(this);
                const n = r.length - 1;
                if (r[n] > -1) {
                    r.deletedIndices.push(r[n]);
                    r.deletedItems.push(s);
                }
                o.call(r);
                t.notify();
                return s;
            },
            shift: function() {
                const t = e.get(this);
                if (t === void 0) {
                    return c.call(this);
                }
                const r = t.indexMap;
                const s = c.call(this);
                if (r[0] > -1) {
                    r.deletedIndices.push(r[0]);
                    r.deletedItems.push(s);
                }
                c.call(r);
                t.notify();
                return s;
            },
            splice: function(...t) {
                const r = t[0];
                const s = t[1];
                const n = e.get(this);
                if (n === void 0) {
                    return u.apply(this, t);
                }
                const i = this.length;
                const a = r | 0;
                const o = a < 0 ? Math.max(i + a, 0) : Math.min(a, i);
                const c = n.indexMap;
                const l = t.length;
                const h = l === 0 ? 0 : l === 1 ? i - o : s;
                let f = o;
                if (h > 0) {
                    const t = f + h;
                    while (f < t) {
                        if (c[f] > -1) {
                            c.deletedIndices.push(c[f]);
                            c.deletedItems.push(this[f]);
                        }
                        f++;
                    }
                }
                f = 0;
                if (l > 2) {
                    const t = l - 2;
                    const e = new Array(t);
                    while (f < t) {
                        e[f++] = -2;
                    }
                    u.call(c, r, s, ...e);
                } else {
                    u.apply(c, t);
                }
                const d = u.apply(this, t);
                if (h > 0 || f > 0) {
                    n.notify();
                }
                return d;
            },
            reverse: function() {
                const t = e.get(this);
                if (t === void 0) {
                    l.call(this);
                    return this;
                }
                const r = this.length;
                const s = r / 2 | 0;
                let n = 0;
                while (n !== s) {
                    const e = r - n - 1;
                    const s = this[n];
                    const i = t.indexMap[n];
                    const a = this[e];
                    const o = t.indexMap[e];
                    this[n] = a;
                    t.indexMap[n] = o;
                    this[e] = s;
                    t.indexMap[e] = i;
                    n++;
                }
                t.notify();
                return this;
            },
            sort: function(t) {
                const r = e.get(this);
                if (r === void 0) {
                    h.call(this, t);
                    return this;
                }
                let s = this.length;
                if (s < 2) {
                    return this;
                }
                quickSort(this, r.indexMap, 0, s, preSortCompare);
                let i = 0;
                while (i < s) {
                    if (this[i] === void 0) {
                        break;
                    }
                    i++;
                }
                if (t === void 0 || !n(t)) {
                    t = sortCompare;
                }
                quickSort(this, r.indexMap, 0, i, t);
                let a = false;
                for (i = 0, s = r.indexMap.length; s > i; ++i) {
                    if (r.indexMap[i] !== i) {
                        a = true;
                        break;
                    }
                }
                if (a || B) {
                    r.notify();
                }
                return this;
            }
        };
        for (const t of s) {
            g(i[t], "observing", {
                value: true,
                writable: false,
                configurable: false,
                enumerable: false
            });
        }
    }
    let a = false;
    const o = "__au_arr_on__";
    function enableArrayObservation() {
        if (i === undefined) {
            overrideArrayPrototypes();
        }
        if (!(E(o, Array) ?? false)) {
            m(true, Array, o);
            for (const t of s) {
                if (r[t].observing !== true) {
                    rtDefineHiddenProp(r, t, i[t]);
                }
            }
        }
    }
    class ArrayObserverImpl {
        constructor(t) {
            this.type = D;
            if (!a) {
                a = true;
                enableArrayObservation();
            }
            this.indexObservers = {};
            this.collection = t;
            this.indexMap = createIndexMap(t.length);
            this.lenObs = void 0;
            e.set(t, this);
        }
        notify() {
            const t = this.subs;
            t.notifyDirty();
            const e = this.indexMap;
            if (B) {
                addCollectionBatch(t, this.collection, e);
                return;
            }
            const r = this.collection;
            const s = r.length;
            this.indexMap = createIndexMap(s);
            t.notifyCollection(r, e);
        }
        getLengthObserver() {
            return this.lenObs ??= new CollectionLengthObserver(this);
        }
        getIndexObserver(t) {
            return this.indexObservers[t] ??= new ArrayIndexObserverImpl(this, t);
        }
    }
    (() => {
        j(ArrayObserverImpl, null);
    })();
    class ArrayIndexObserverImpl {
        constructor(t, e) {
            this.owner = t;
            this.index = e;
            this.doNotCache = true;
            this.value = this.getValue();
        }
        getValue() {
            return this.owner.collection[this.index];
        }
        setValue(t) {
            if (t === this.getValue()) {
                return;
            }
            const e = this.owner;
            const r = this.index;
            const s = e.indexMap;
            if (s[r] > -1) {
                s.deletedIndices.push(s[r]);
            }
            s[r] = -2;
            e.collection[r] = t;
            e.notify();
        }
        handleDirty() {
            if (this.value !== this.getValue()) {
                this.subs.notifyDirty();
            }
        }
        handleCollectionChange(t, e) {
            const r = this.index;
            const s = e[r] === r;
            if (s) {
                return;
            }
            const n = this.value;
            const i = this.value = this.getValue();
            if (n !== i) {
                this.subs.notify(i, n);
            }
        }
        subscribe(t) {
            if (this.subs.add(t) && this.subs.count === 1) {
                this.owner.subscribe(this);
            }
        }
        unsubscribe(t) {
            if (this.subs.remove(t) && this.subs.count === 0) {
                this.owner.unsubscribe(this);
            }
        }
    }
    (() => {
        j(ArrayIndexObserverImpl, null);
    })();
    return function getArrayObserver(t) {
        let r = e.get(t);
        if (r === void 0) {
            e.set(t, r = new ArrayObserverImpl(t));
            enableArrayObservation();
        }
        return r;
    };
})();

const H = /*@__PURE__*/ (() => {
    const t = Symbol.for("__au_set_obs__");
    const e = Set[t] ?? rtDefineHiddenProp(Set, t, new WeakMap);
    const {add: r, clear: s, delete: n} = Set.prototype;
    const i = [ "add", "clear", "delete" ];
    const a = {
        add: function(t) {
            const s = e.get(this);
            if (s === undefined) {
                r.call(this, t);
                return this;
            }
            const n = this.size;
            r.call(this, t);
            const i = this.size;
            if (i === n) {
                return this;
            }
            s.indexMap[n] = -2;
            s.notify();
            return this;
        },
        clear: function() {
            const t = e.get(this);
            if (t === undefined) {
                return s.call(this);
            }
            const r = this.size;
            if (r > 0) {
                const e = t.indexMap;
                let r = 0;
                for (const t of this.keys()) {
                    if (e[r] > -1) {
                        e.deletedIndices.push(e[r]);
                        e.deletedItems.push(t);
                    }
                    r++;
                }
                s.call(this);
                e.length = 0;
                t.notify();
            }
            return undefined;
        },
        delete: function(t) {
            const r = e.get(this);
            if (r === undefined) {
                return n.call(this, t);
            }
            const s = this.size;
            if (s === 0) {
                return false;
            }
            let i = 0;
            const a = r.indexMap;
            for (const e of this.keys()) {
                if (e === t) {
                    if (a[i] > -1) {
                        a.deletedIndices.push(a[i]);
                        a.deletedItems.push(e);
                    }
                    a.splice(i, 1);
                    const s = n.call(this, t);
                    if (s === true) {
                        r.notify();
                    }
                    return s;
                }
                i++;
            }
            return false;
        }
    };
    function enableSetObservation(t) {
        for (const e of i) {
            rtDefineHiddenProp(t, e, a[e]);
        }
    }
    class SetObserverImpl {
        constructor(t) {
            this.type = D;
            this.collection = t;
            this.indexMap = createIndexMap(t.size);
            this.lenObs = void 0;
        }
        notify() {
            const t = this.subs;
            t.notifyDirty();
            const e = this.indexMap;
            if (B) {
                addCollectionBatch(t, this.collection, e);
                return;
            }
            const r = this.collection;
            const s = r.size;
            this.indexMap = createIndexMap(s);
            t.notifyCollection(r, e);
        }
        getLengthObserver() {
            return this.lenObs ??= new CollectionSizeObserver(this);
        }
    }
    j(SetObserverImpl, null);
    return function getSetObserver(t) {
        let r = e.get(t);
        if (r === void 0) {
            e.set(t, r = new SetObserverImpl(t));
            enableSetObservation(t);
        }
        return r;
    };
})();

const $ = /*@__PURE__*/ (() => {
    const t = Symbol.for("__au_map_obs__");
    const e = Map[t] ?? rtDefineHiddenProp(Map, t, new WeakMap);
    const {set: r, clear: s, delete: n} = Map.prototype;
    const i = [ "set", "clear", "delete" ];
    const a = {
        set: function(t, s) {
            const n = e.get(this);
            if (n === undefined) {
                r.call(this, t, s);
                return this;
            }
            const i = this.get(t);
            const a = this.size;
            r.call(this, t, s);
            const o = this.size;
            if (o === a) {
                let e = 0;
                for (const r of this.entries()) {
                    if (r[0] === t) {
                        if (r[1] !== i) {
                            n.indexMap.deletedIndices.push(n.indexMap[e]);
                            n.indexMap.deletedItems.push(r);
                            n.indexMap[e] = -2;
                            n.notify();
                        }
                        return this;
                    }
                    e++;
                }
                return this;
            }
            n.indexMap[a] = -2;
            n.notify();
            return this;
        },
        clear: function() {
            const t = e.get(this);
            if (t === undefined) {
                return s.call(this);
            }
            const r = this.size;
            if (r > 0) {
                const e = t.indexMap;
                let r = 0;
                for (const t of this.keys()) {
                    if (e[r] > -1) {
                        e.deletedIndices.push(e[r]);
                        e.deletedItems.push(t);
                    }
                    r++;
                }
                s.call(this);
                e.length = 0;
                t.notify();
            }
            return undefined;
        },
        delete: function(t) {
            const r = e.get(this);
            if (r === undefined) {
                return n.call(this, t);
            }
            const s = this.size;
            if (s === 0) {
                return false;
            }
            let i = 0;
            const a = r.indexMap;
            for (const e of this.keys()) {
                if (e === t) {
                    if (a[i] > -1) {
                        a.deletedIndices.push(a[i]);
                        a.deletedItems.push(e);
                    }
                    a.splice(i, 1);
                    const s = n.call(this, t);
                    if (s === true) {
                        r.notify();
                    }
                    return s;
                }
                ++i;
            }
            return false;
        }
    };
    function enableMapObservation(t) {
        for (const e of i) {
            rtDefineHiddenProp(t, e, a[e]);
        }
    }
    class MapObserverImpl {
        constructor(t) {
            this.type = D;
            this.collection = t;
            this.indexMap = createIndexMap(t.size);
            this.lenObs = void 0;
        }
        notify() {
            const t = this.subs;
            t.notifyDirty();
            const e = this.indexMap;
            if (B) {
                addCollectionBatch(t, this.collection, e);
                return;
            }
            const r = this.collection;
            const s = r.size;
            this.indexMap = createIndexMap(s);
            t.notifyCollection(r, e);
        }
        getLengthObserver() {
            return this.lenObs ??= new CollectionSizeObserver(this);
        }
    }
    j(MapObserverImpl, null);
    return function getMapObserver(t) {
        let r = e.get(t);
        if (r === void 0) {
            e.set(t, r = new MapObserverImpl(t));
            enableMapObservation(t);
        }
        return r;
    };
})();

const z = /*@__PURE__*/ (() => {
    class BindingObserverRecord {
        constructor(t) {
            this.version = 0;
            this.count = 0;
            this.o = new Map;
            this.b = t;
        }
        add(t) {
            if (!this.o.has(t)) {
                t.subscribe(this.b);
                ++this.count;
            }
            this.o.set(t, this.version);
        }
        clear() {
            this.o.forEach(unsubscribeStale, this);
            this.count = this.o.size;
        }
        clearAll() {
            this.o.forEach(unsubscribeAll, this);
            this.o.clear();
            this.count = 0;
        }
    }
    function unsubscribeAll(t, e) {
        e.unsubscribe(this.b);
    }
    function unsubscribeStale(t, e) {
        if (this.version !== t) {
            e.unsubscribe(this.b);
            this.o.delete(e);
        }
    }
    function getObserverRecord() {
        return rtDefineHiddenProp(this, "obs", new BindingObserverRecord(this));
    }
    function observe(t, e) {
        this.obs.add(this.oL.getObserver(t, e));
    }
    function observeCollection(t) {
        let e;
        if (i(t)) {
            e = F(t);
        } else if (o(t)) {
            e = H(t);
        } else if (c(t)) {
            e = $(t);
        } else {
            throw createMappedError(210, t);
        }
        this.obs.add(e);
    }
    function subscribeTo(t) {
        this.obs.add(t);
    }
    function noopHandleChange() {
        throw createMappedError(99, "handleChange");
    }
    function noopHandleCollectionChange() {
        throw createMappedError(99, "handleCollectionChange");
    }
    return function connectableDecorator(t, e) {
        const r = t.prototype;
        ensureProto(r, "observe", observe);
        ensureProto(r, "observeCollection", observeCollection);
        ensureProto(r, "subscribeTo", subscribeTo);
        g(r, "obs", {
            get: getObserverRecord
        });
        ensureProto(r, "handleChange", noopHandleChange);
        ensureProto(r, "handleCollectionChange", noopHandleCollectionChange);
        return t;
    };
})();

function connectable(t, e) {
    return t == null ? z : z(t, e);
}

let U = null;

const T = [];

let W = false;

function pauseConnecting() {
    W = false;
}

function resumeConnecting() {
    W = true;
}

function currentConnectable() {
    return U;
}

function enterConnectable(t) {
    if (t == null) {
        throw createMappedError(206);
    }
    if (U == null) {
        U = t;
        T[0] = U;
        W = true;
        return;
    }
    if (U === t) {
        throw createMappedError(207);
    }
    T.push(t);
    U = t;
    W = true;
}

function exitConnectable(t) {
    if (t == null) {
        throw createMappedError(208);
    }
    if (U !== t) {
        throw createMappedError(209);
    }
    T.pop();
    U = T.length > 0 ? T[T.length - 1] : null;
    W = U != null;
}

const K = /*@__PURE__*/ C({
    get current() {
        return U;
    },
    get connecting() {
        return W;
    },
    enter: enterConnectable,
    exit: exitConnectable,
    pause: pauseConnecting,
    resume: resumeConnecting
});

const q = Reflect.get;

const G = Object.prototype.toString;

const J = new WeakMap;

const Q = "__au_nw__";

const X = "__au_nw";

function canWrap(t) {
    switch (G.call(t)) {
      case "[object Object]":
        return t.constructor[Q] !== true;

      case "[object Array]":
      case "[object Map]":
      case "[object Set]":
        return true;

      default:
        return false;
    }
}

const Y = "__raw__";

function wrap(t) {
    return canWrap(t) ? getProxy(t) : t;
}

function getProxy(t) {
    return J.get(t) ?? createProxy(t);
}

function getRaw(t) {
    return t[Y] ?? t;
}

function unwrap(t) {
    return canWrap(t) && t[Y] || t;
}

function doNotCollect(t, e) {
    return e === "constructor" || e === "__proto__" || e === "$observers" || e === Symbol.toPrimitive || e === Symbol.toStringTag || t.constructor[`${X}_${O(e)}__`] === true;
}

function createProxy(t) {
    const e = i(t) ? tt : c(t) || o(t) ? et : Z;
    const r = new Proxy(t, e);
    J.set(t, r);
    J.set(r, r);
    return r;
}

const Z = {
    get(t, e, r) {
        if (e === Y) {
            return t;
        }
        const s = currentConnectable();
        if (!W || doNotCollect(t, e) || s == null) {
            return q(t, e, r);
        }
        s.observe(t, e);
        return wrap(q(t, e, r));
    },
    deleteProperty(t, e) {
        return delete t[e];
    }
};

const tt = {
    get(t, e, r) {
        if (e === Y) {
            return t;
        }
        if (!W || doNotCollect(t, e) || U == null) {
            return q(t, e, r);
        }
        switch (e) {
          case "length":
            U.observe(t, "length");
            return t.length;

          case "map":
            return wrappedArrayMap;

          case "includes":
            return wrappedArrayIncludes;

          case "indexOf":
            return wrappedArrayIndexOf;

          case "lastIndexOf":
            return wrappedArrayLastIndexOf;

          case "every":
            return wrappedArrayEvery;

          case "filter":
            return wrappedArrayFilter;

          case "find":
            return wrappedArrayFind;

          case "findIndex":
            return wrappedArrayFindIndex;

          case "flat":
            return wrappedArrayFlat;

          case "flatMap":
            return wrappedArrayFlatMap;

          case "join":
            return wrappedArrayJoin;

          case "push":
            return wrappedArrayPush;

          case "pop":
            return wrappedArrayPop;

          case "reduce":
            return wrappedReduce;

          case "reduceRight":
            return wrappedReduceRight;

          case "reverse":
            return wrappedArrayReverse;

          case "shift":
            return wrappedArrayShift;

          case "unshift":
            return wrappedArrayUnshift;

          case "slice":
            return wrappedArraySlice;

          case "splice":
            return wrappedArraySplice;

          case "some":
            return wrappedArraySome;

          case "sort":
            return wrappedArraySort;

          case "keys":
            return wrappedKeys;

          case "values":
          case Symbol.iterator:
            return wrappedValues;

          case "entries":
            return wrappedEntries;
        }
        U.observe(t, e);
        return wrap(q(t, e, r));
    },
    ownKeys(t) {
        currentConnectable()?.observe(t, "length");
        return Reflect.ownKeys(t);
    }
};

function wrappedArrayMap(t, e) {
    const r = getRaw(this);
    const s = r.map(((r, s) => unwrap(t.call(e, wrap(r), s, this))));
    observeCollection(U, r);
    return wrap(s);
}

function wrappedArrayEvery(t, e) {
    const r = getRaw(this);
    const s = r.every(((r, s) => t.call(e, wrap(r), s, this)));
    observeCollection(U, r);
    return s;
}

function wrappedArrayFilter(t, e) {
    const r = getRaw(this);
    const s = r.filter(((r, s) => unwrap(t.call(e, wrap(r), s, this))));
    observeCollection(U, r);
    return wrap(s);
}

function wrappedArrayIncludes(t) {
    const e = getRaw(this);
    const r = e.includes(unwrap(t));
    observeCollection(U, e);
    return r;
}

function wrappedArrayIndexOf(t) {
    const e = getRaw(this);
    const r = e.indexOf(unwrap(t));
    observeCollection(U, e);
    return r;
}

function wrappedArrayLastIndexOf(t) {
    const e = getRaw(this);
    const r = e.lastIndexOf(unwrap(t));
    observeCollection(U, e);
    return r;
}

function wrappedArrayFindIndex(t, e) {
    const r = getRaw(this);
    const s = r.findIndex(((r, s) => unwrap(t.call(e, wrap(r), s, this))));
    observeCollection(U, r);
    return s;
}

function wrappedArrayFind(t, e) {
    const r = getRaw(this);
    const s = r.find(((e, r) => t(wrap(e), r, this)), e);
    observeCollection(U, r);
    return wrap(s);
}

function wrappedArrayFlat() {
    const t = getRaw(this);
    observeCollection(U, t);
    return wrap(t.flat());
}

function wrappedArrayFlatMap(t, e) {
    const r = getRaw(this);
    observeCollection(U, r);
    return getProxy(r.flatMap(((r, s) => wrap(t.call(e, wrap(r), s, this)))));
}

function wrappedArrayJoin(t) {
    const e = getRaw(this);
    observeCollection(U, e);
    return e.join(t);
}

function wrappedArrayPop() {
    return wrap(getRaw(this).pop());
}

function wrappedArrayPush(...t) {
    return getRaw(this).push(...t);
}

function wrappedArrayShift() {
    return wrap(getRaw(this).shift());
}

function wrappedArrayUnshift(...t) {
    return getRaw(this).unshift(...t);
}

function wrappedArraySplice(...t) {
    return wrap(getRaw(this).splice(...t));
}

function wrappedArrayReverse(...t) {
    const e = getRaw(this);
    const r = e.reverse();
    observeCollection(U, e);
    return wrap(r);
}

function wrappedArraySome(t, e) {
    const r = getRaw(this);
    const s = r.some(((r, s) => unwrap(t.call(e, wrap(r), s, this))));
    observeCollection(U, r);
    return s;
}

function wrappedArraySort(t) {
    const e = getRaw(this);
    const r = e.sort(t);
    observeCollection(U, e);
    return wrap(r);
}

function wrappedArraySlice(t, e) {
    const r = getRaw(this);
    observeCollection(U, r);
    return getProxy(r.slice(t, e));
}

function wrappedReduce(t, e) {
    const r = getRaw(this);
    const s = r.reduce(((e, r, s) => t(e, wrap(r), s, this)), e);
    observeCollection(U, r);
    return wrap(s);
}

function wrappedReduceRight(t, e) {
    const r = getRaw(this);
    const s = r.reduceRight(((e, r, s) => t(e, wrap(r), s, this)), e);
    observeCollection(U, r);
    return wrap(s);
}

const et = {
    get(t, e, r) {
        if (e === Y) {
            return t;
        }
        const s = currentConnectable();
        if (!W || doNotCollect(t, e) || s == null) {
            return q(t, e, r);
        }
        switch (e) {
          case "size":
            s.observe(t, "size");
            return t.size;

          case "clear":
            return wrappedClear;

          case "delete":
            return wrappedDelete;

          case "forEach":
            return wrappedForEach;

          case "add":
            if (o(t)) {
                return wrappedAdd;
            }
            break;

          case "get":
            if (c(t)) {
                return wrappedGet;
            }
            break;

          case "set":
            if (c(t)) {
                return wrappedSet;
            }
            break;

          case "has":
            return wrappedHas;

          case "keys":
            return wrappedKeys;

          case "values":
            return wrappedValues;

          case "entries":
            return wrappedEntries;

          case Symbol.iterator:
            return c(t) ? wrappedEntries : wrappedValues;
        }
        return wrap(q(t, e, r));
    }
};

function wrappedForEach(t, e) {
    const r = getRaw(this);
    observeCollection(U, r);
    return r.forEach(((r, s) => {
        t.call(e, wrap(r), wrap(s), this);
    }));
}

function wrappedHas(t) {
    const e = getRaw(this);
    observeCollection(U, e);
    return e.has(unwrap(t));
}

function wrappedGet(t) {
    const e = getRaw(this);
    observeCollection(U, e);
    return wrap(e.get(unwrap(t)));
}

function wrappedSet(t, e) {
    return wrap(getRaw(this).set(unwrap(t), unwrap(e)));
}

function wrappedAdd(t) {
    return wrap(getRaw(this).add(unwrap(t)));
}

function wrappedClear() {
    return wrap(getRaw(this).clear());
}

function wrappedDelete(t) {
    return wrap(getRaw(this).delete(unwrap(t)));
}

function wrappedKeys() {
    const t = getRaw(this);
    observeCollection(U, t);
    const e = t.keys();
    return {
        next() {
            const t = e.next();
            const r = t.value;
            const s = t.done;
            return s ? {
                value: void 0,
                done: s
            } : {
                value: wrap(r),
                done: s
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

function wrappedValues() {
    const t = getRaw(this);
    observeCollection(U, t);
    const e = t.values();
    return {
        next() {
            const t = e.next();
            const r = t.value;
            const s = t.done;
            return s ? {
                value: void 0,
                done: s
            } : {
                value: wrap(r),
                done: s
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

function wrappedEntries() {
    const t = getRaw(this);
    observeCollection(U, t);
    const e = t.entries();
    return {
        next() {
            const t = e.next();
            const r = t.value;
            const s = t.done;
            return s ? {
                value: void 0,
                done: s
            } : {
                value: [ wrap(r[0]), wrap(r[1]) ],
                done: s
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

const observeCollection = (t, e) => t?.observeCollection(e);

const rt = /*@__PURE__*/ C({
    getProxy: getProxy,
    getRaw: getRaw,
    wrap: wrap,
    unwrap: unwrap,
    rawKey: Y
});

class ComputedObserver {
    constructor(t, e, r, s, n) {
        this.type = D;
        this.ov = void 0;
        this.v = void 0;
        this.h = false;
        this.ir = false;
        this.D = false;
        this.cb = void 0;
        this.C = void 0;
        this.O = void 0;
        this.o = t;
        this.A = n ? wrap(t) : t;
        this.$get = e;
        this.$set = r;
        this.oL = s;
    }
    init(t) {
        this.v = t;
        this.D = false;
    }
    getValue() {
        if (this.subs.count === 0) {
            return this.$get.call(this.o, this.o, this);
        }
        if (this.D) {
            this.compute();
            this.D = false;
            this.h = false;
        }
        return this.v;
    }
    setValue(t) {
        if (n(this.$set)) {
            if (this.C !== void 0) {
                t = this.C.call(null, t, this.O);
            }
            if (!u(t, this.v)) {
                this.ir = true;
                this.$set.call(this.o, t);
                this.ir = false;
                this.run();
            }
        } else {
            throw createMappedError(221);
        }
    }
    useCoercer(t, e) {
        this.C = t;
        this.O = e;
        return true;
    }
    useCallback(t) {
        this.cb = t;
        return true;
    }
    handleDirty() {
        if (!this.D) {
            this.D = true;
            this.subs.notifyDirty();
        }
    }
    handleChange() {
        this.D = true;
        if (this.subs.count > 0) {
            this.run();
        }
    }
    handleCollectionChange() {
        this.D = true;
        if (this.subs.count > 0) {
            this.run();
        }
    }
    subscribe(t) {
        if (this.subs.add(t) && this.subs.count === 1) {
            this.ov = this.compute();
            this.D = false;
            this.h = false;
        }
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && this.subs.count === 0) {
            this.D = true;
            this.obs.clearAll();
            this.ov = void 0;
            this.h = true;
        }
    }
    run() {
        if (this.ir) {
            return;
        }
        const t = this.v;
        const e = this.ov;
        const r = this.compute();
        this.D = false;
        if (!this.h || !u(r, t)) {
            this.cb?.(r, e);
            this.subs.notify(r, e);
            this.ov = this.v = r;
            this.h = true;
        }
    }
    compute() {
        this.ir = true;
        this.obs.version++;
        try {
            enterConnectable(this);
            return this.v = unwrap(this.$get.call(this.A, this.A, this));
        } finally {
            this.obs.clear();
            this.ir = false;
            exitConnectable(this);
        }
    }
}

(() => {
    connectable(ComputedObserver, null);
    j(ComputedObserver, null);
})();

const st = /*@__PURE__*/ A("IDirtyChecker", void 0);

const nt = {
    timeoutsPerCheck: 25,
    disabled: false,
    throw: false,
    resetToDefault() {
        this.timeoutsPerCheck = 6;
        this.disabled = false;
        this.throw = false;
    }
};

class DirtyChecker {
    static register(t) {
        t.register(l.singleton(this, this), l.aliasTo(this, st));
    }
    constructor() {
        this.tracked = [];
        this.R = null;
        this.P = 0;
        this.p = h(f);
        this.check = () => {
            if (nt.disabled) {
                return;
            }
            if (++this.P < nt.timeoutsPerCheck) {
                return;
            }
            this.P = 0;
            const t = this.tracked.slice(0);
            const e = t.length;
            let r;
            let s = 0;
            for (;s < e; ++s) {
                r = t[s];
                if (r.isDirty()) {
                    r.flush();
                }
            }
        };
        j(DirtyCheckProperty, null);
    }
    createProperty(t, e) {
        if (nt.throw) {
            throw createMappedError(218, e);
        }
        return new DirtyCheckProperty(this, t, e);
    }
    addProperty(t) {
        this.tracked.push(t);
        if (this.tracked.length === 1) {
            this.R = this.p.taskQueue.queueTask(this.check, {
                persistent: true
            });
        }
    }
    removeProperty(t) {
        this.tracked.splice(this.tracked.indexOf(t), 1);
        if (this.tracked.length === 0) {
            this.R.cancel();
            this.R = null;
        }
    }
}

class DirtyCheckProperty {
    constructor(t, e, r) {
        this.obj = e;
        this.key = r;
        this.type = _;
        this.ov = void 0;
        this.I = t;
    }
    getValue() {
        return this.obj[this.key];
    }
    setValue(t) {
        throw createMappedError(219, this.key);
    }
    isDirty() {
        return this.ov !== this.obj[this.key];
    }
    flush() {
        const t = this.ov;
        const e = this.getValue();
        this.ov = e;
        this.subs.notify(e, t);
    }
    subscribe(t) {
        if (this.subs.add(t) && this.subs.count === 1) {
            this.ov = this.obj[this.key];
            this.I.addProperty(this);
        }
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && this.subs.count === 0) {
            this.I.removeProperty(this);
        }
    }
}

class PrimitiveObserver {
    get doNotCache() {
        return true;
    }
    constructor(t, e) {
        this.type = _;
        this.o = t;
        this.k = e;
    }
    getValue() {
        return this.o[this.k];
    }
    setValue() {}
    subscribe() {}
    unsubscribe() {}
}

class PropertyAccessor {
    constructor() {
        this.type = _;
    }
    getValue(t, e) {
        return t[e];
    }
    setValue(t, e, r) {
        e[r] = t;
    }
}

class SetterObserver {
    constructor(t, e) {
        this.type = D;
        this.v = void 0;
        this.iO = false;
        this.cb = void 0;
        this.C = void 0;
        this.O = void 0;
        this.o = t;
        this.k = e;
    }
    getValue() {
        return this.v;
    }
    setValue(t) {
        if (this.C !== void 0) {
            t = this.C.call(void 0, t, this.O);
        }
        const e = this.v;
        if (this.iO) {
            if (u(t, this.v)) {
                return;
            }
            this.v = t;
            this.subs.notifyDirty();
            this.subs.notify(t, e);
            if (u(t, this.v)) {
                this.cb?.(t, e);
            }
        } else {
            this.v = this.o[this.k] = t;
            this.cb?.(t, e);
        }
    }
    useCallback(t) {
        this.cb = t;
        this.start();
        return true;
    }
    useCoercer(t, e) {
        this.C = t;
        this.O = e;
        this.start();
        return true;
    }
    subscribe(t) {
        if (this.iO === false) {
            this.start();
        }
        this.subs.add(t);
    }
    start() {
        if (this.iO === false) {
            this.iO = true;
            this.v = this.o[this.k];
            g(this.o, this.k, {
                enumerable: true,
                configurable: true,
                get: y((() => this.getValue()), {
                    getObserver: () => this
                }),
                set: t => {
                    this.setValue(t);
                }
            });
        }
        return this;
    }
    stop() {
        if (this.iO) {
            g(this.o, this.k, {
                enumerable: true,
                configurable: true,
                writable: true,
                value: this.v
            });
            this.iO = false;
        }
        return this;
    }
}

(() => {
    j(SetterObserver, null);
})();

const it = new PropertyAccessor;

const at = /*@__PURE__*/ A("IObserverLocator", (t => t.singleton(ObserverLocator)));

const ot = /*@__PURE__*/ A("INodeObserverLocator", (t => t.cachedCallback((t => new DefaultNodeObserverLocator))));

class DefaultNodeObserverLocator {
    handles() {
        return false;
    }
    getObserver() {
        return it;
    }
    getAccessor() {
        return it;
    }
}

const ct = /*@__PURE__*/ A("IComputedObserverLocator", (t => t.singleton(class DefaultLocator {
    getObserver(t, e, r, s) {
        const n = new ComputedObserver(t, r.get, r.set, s, true);
        g(t, e, {
            enumerable: r.enumerable,
            configurable: true,
            get: y((() => n.getValue()), {
                getObserver: () => n
            }),
            set: t => {
                n.setValue(t);
            }
        });
        return n;
    }
})));

class ObserverLocator {
    constructor() {
        this._ = [];
        this.I = h(st);
        this.M = h(ot);
        this.L = h(ct);
    }
    addAdapter(t) {
        this._.push(t);
    }
    getObserver(t, e) {
        if (t == null) {
            throw createMappedError(199, e);
        }
        if (!d(t)) {
            return new PrimitiveObserver(t, n(e) ? "" : e);
        }
        if (n(e)) {
            return new ComputedObserver(t, e, void 0, this, true);
        }
        const r = getObserverLookup(t);
        let s = r[e];
        if (s === void 0) {
            s = this.createObserver(t, e);
            if (!s.doNotCache) {
                r[e] = s;
            }
        }
        return s;
    }
    getAccessor(t, e) {
        const r = t.$observers?.[e];
        if (r !== void 0) {
            return r;
        }
        if (this.M.handles(t, e, this)) {
            return this.M.getAccessor(t, e, this);
        }
        return it;
    }
    getArrayObserver(t) {
        return F(t);
    }
    getMapObserver(t) {
        return $(t);
    }
    getSetObserver(t) {
        return H(t);
    }
    createObserver(t, e) {
        if (this.M.handles(t, e, this)) {
            return this.M.getObserver(t, e, this);
        }
        switch (e) {
          case "length":
            if (i(t)) {
                return F(t).getLengthObserver();
            }
            break;

          case "size":
            if (c(t)) {
                return $(t).getLengthObserver();
            } else if (o(t)) {
                return H(t).getLengthObserver();
            }
            break;

          default:
            if (i(t) && a(e)) {
                return F(t).getIndexObserver(Number(e));
            }
            break;
        }
        let r = lt(t, e);
        if (r === void 0) {
            let s = ut(t);
            while (s !== null) {
                r = lt(s, e);
                if (r === void 0) {
                    s = ut(s);
                } else {
                    break;
                }
            }
        }
        if (r !== void 0 && !w.call(r, "value")) {
            let s = this.N(t, e, r);
            if (s == null) {
                s = (r.get?.getObserver)?.(t);
            }
            return s == null ? r.configurable ? this.L.getObserver(t, e, r, this) : this.I.createProperty(t, e) : s;
        }
        return new SetterObserver(t, e);
    }
    N(t, e, r) {
        if (this._.length > 0) {
            for (const s of this._) {
                const n = s.getObserver(t, e, r, this);
                if (n != null) {
                    return n;
                }
            }
        }
        return null;
    }
}

const getCollectionObserver = t => {
    let e;
    if (i(t)) {
        e = F(t);
    } else if (c(t)) {
        e = $(t);
    } else if (o(t)) {
        e = H(t);
    }
    return e;
};

const ut = Object.getPrototypeOf;

const lt = Object.getOwnPropertyDescriptor;

const getObserverLookup = t => {
    let e = t.$observers;
    if (e === void 0) {
        g(t, "$observers", {
            enumerable: false,
            value: e = p()
        });
    }
    return e;
};

const ht = /*@__PURE__*/ A("IObservation", (t => t.singleton(Observation)));

class Observation {
    constructor() {
        this.oL = h(at);
        this.V = h(e);
    }
    run(t) {
        const e = new RunEffect(this.oL, t);
        e.run();
        return e;
    }
    watch(t, e, r, s) {
        let i = undefined;
        let a = false;
        let o;
        const c = this.oL.getObserver(t, e);
        const handleChange = (t, e) => {
            o?.();
            o = void 0;
            const s = r(t, i = e);
            if (n(s)) {
                o = s;
            }
        };
        const u = {
            handleChange: handleChange
        };
        const run = () => {
            if (a) return;
            a = true;
            c.subscribe(u);
            handleChange(c.getValue(), i);
        };
        const stop = () => {
            if (!a) return;
            a = false;
            c.unsubscribe(u);
            o?.();
            o = void 0;
        };
        if (s?.immediate !== false) {
            run();
        }
        return {
            run: run,
            stop: stop
        };
    }
    watchExpression(t, e, r, s) {
        let i = false;
        let a;
        const handleChange = (t, e) => {
            a?.();
            a = void 0;
            const s = r(t, e);
            if (n(s)) {
                a = s;
            }
        };
        const o = new ExpressionObserver(Scope.create(t), this.oL, this.V.parse(e, "IsProperty"), handleChange);
        const run = () => {
            if (i) return;
            i = true;
            o.run();
        };
        const stop = () => {
            if (!i) return;
            i = false;
            o.stop();
            a?.();
            a = void 0;
        };
        if (s?.immediate !== false) {
            run();
        }
        return {
            run: run,
            stop: stop
        };
    }
}

class RunEffect {
    constructor(t, e) {
        this.oL = t;
        this.fn = e;
        this.maxRunCount = 10;
        this.queued = false;
        this.running = false;
        this.runCount = 0;
        this.stopped = false;
        this.B = undefined;
        this.run = () => {
            if (this.stopped) {
                throw createMappedError(225);
            }
            if (this.running) {
                return;
            }
            ++this.runCount;
            this.running = true;
            this.queued = false;
            ++this.obs.version;
            try {
                this.B?.call(void 0);
                enterConnectable(this);
                this.B = this.fn(this);
            } finally {
                this.obs.clear();
                this.running = false;
                exitConnectable(this);
            }
            if (this.queued) {
                if (this.runCount > this.maxRunCount) {
                    this.runCount = 0;
                    throw createMappedError(226);
                }
                this.run();
            } else {
                this.runCount = 0;
            }
        };
        this.stop = () => {
            this.B?.call(void 0);
            this.B = void 0;
            this.stopped = true;
            this.obs.clearAll();
        };
    }
    handleChange() {
        this.queued = true;
        this.run();
    }
    handleCollectionChange() {
        this.queued = true;
        this.run();
    }
}

(() => {
    connectable(RunEffect, null);
})();

class ExpressionObserver {
    constructor(t, e, r, s) {
        this.oL = e;
        this.v = void 0;
        this.boundFn = false;
        this.s = t;
        this.ast = r;
        this.cb = s;
    }
    handleChange() {
        this.run();
    }
    handleCollectionChange() {
        this.run();
    }
    run() {
        this.obs.version++;
        const t = this.v;
        const e = x(this.ast, this.s, this, this);
        this.obs.clear();
        if (!u(e, t)) {
            this.v = e;
            this.cb.call(void 0, e, t);
        }
    }
    stop() {
        this.obs.clearAll();
        this.v = void 0;
    }
}

(() => {
    connectable(ExpressionObserver, null);
    I(ExpressionObserver);
})();

const ft = /*@__PURE__*/ (() => {
    function getObserversLookup(t) {
        if (t.$observers === void 0) {
            g(t, "$observers", {
                value: {}
            });
        }
        return t.$observers;
    }
    const t = {};
    function observable(e, r) {
        if (!SetterNotifier.mixed) {
            SetterNotifier.mixed = true;
            j(SetterNotifier, null);
        }
        let s = false;
        let n;
        if (typeof e === "object") {
            n = e;
        } else if (e != null) {
            n = {
                name: e
            };
            s = true;
        } else {
            n = b;
        }
        if (arguments.length === 0) {
            return function(t, e) {
                if (e.kind !== "field") throw createMappedError(224);
                return createFieldInitializer(e);
            };
        }
        if (r?.kind === "field") return createFieldInitializer(r);
        if (s) {
            return function(e, r) {
                createDescriptor(e, n.name, (() => t), true);
            };
        }
        return function(e, r) {
            switch (r.kind) {
              case "field":
                return createFieldInitializer(r);

              case "class":
                return createDescriptor(e, n.name, (() => t), true);

              default:
                throw createMappedError(224);
            }
        };
        function createFieldInitializer(t) {
            let e;
            t.addInitializer((function() {
                createDescriptor(this, t.name, (() => e), false);
            }));
            return function(t) {
                return e = t;
            };
        }
        function createDescriptor(t, e, r, s) {
            const i = n.callback || `${O(e)}Changed`;
            const a = n.set;
            const observableGetter = function() {
                const t = getNotifier(this, e, i, r, a);
                currentConnectable()?.subscribeTo(t);
                return t.getValue();
            };
            observableGetter.getObserver = function(t) {
                return getNotifier(t, e, i, r, a);
            };
            const o = {
                enumerable: true,
                configurable: true,
                get: observableGetter,
                set(t) {
                    getNotifier(this, e, i, r, a).setValue(t);
                }
            };
            if (s) g(t.prototype, e, o); else g(t, e, o);
        }
    }
    function getNotifier(e, r, s, n, i) {
        const a = getObserversLookup(e);
        let o = a[r];
        if (o == null) {
            const c = n();
            o = new SetterNotifier(e, s, i, c === t ? void 0 : c);
            a[r] = o;
        }
        return o;
    }
    class SetterNotifier {
        constructor(t, e, r, s) {
            this.type = D;
            this.v = void 0;
            this.ov = void 0;
            this.o = t;
            this.S = r;
            this.hs = n(r);
            const i = t[e];
            this.cb = n(i) ? i : void 0;
            this.v = s;
        }
        getValue() {
            return this.v;
        }
        setValue(t) {
            if (this.hs) {
                t = this.S(t);
            }
            if (!u(t, this.v)) {
                this.ov = this.v;
                this.v = t;
                this.subs.notifyDirty();
                this.subs.notify(this.v, this.ov);
                if (u(t, this.v)) {
                    this.cb?.call(this.o, this.v, this.ov);
                }
            }
        }
    }
    SetterNotifier.mixed = false;
    return observable;
})();

typeof SuppressedError === "function" ? SuppressedError : function(t, e, r) {
    var s = new Error(r);
    return s.name = "SuppressedError", s.error = t, s.suppressed = e, s;
};

function nowrap(t, e) {
    return arguments.length === 0 ? decorator : decorator(t, e);
    function decorator(t, e) {
        switch (e.kind) {
          case "class":
            rtDefineHiddenProp(t, Q, true);
            break;

          case "field":
            e.addInitializer((function() {
                const t = this.constructor;
                const r = `${X}_${O(e.name)}__`;
                if (r in t) return;
                rtDefineHiddenProp(t, r, true);
            }));
            break;
        }
    }
}

export { N as AccessorType, BindingContext, CollectionLengthObserver, CollectionSizeObserver, ComputedObserver, K as ConnectableSwitcher, DirtyCheckProperty, nt as DirtyCheckSettings, DirtyChecker, k as ICoercionConfiguration, ct as IComputedObserverLocator, st as IDirtyChecker, ot as INodeObserverLocator, ht as IObservation, at as IObserverLocator, Observation, ObserverLocator, PrimitiveObserver, PropertyAccessor, rt as ProxyObservable, Scope, SetterObserver, S as astAssign, R as astBind, x as astEvaluate, P as astUnbind, batch, cloneIndexMap, connectable, copyIndexMap, createIndexMap, getCollectionObserver, getObserverLookup, isIndexMap, I as mixinNoopAstEvaluator, nowrap, ft as observable, j as subscriberCollection };

