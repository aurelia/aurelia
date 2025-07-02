"use strict";

var t = require("@aurelia/expression-parser");

var e = require("@aurelia/kernel");

var r = require("@aurelia/metadata");

const s = Object.prototype.hasOwnProperty;

const n = Reflect.defineProperty;

function rtDefineHiddenProp(t, e, r) {
    n(t, e, {
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

const i = Object.assign;

const o = Object.freeze;

const a = String;

const c = e.DI.createInterface;

const u = r.Metadata.get;

const l = r.Metadata.define;

const createMappedError = (t, ...e) => new Error(`AUR${a(t).padStart(4, "0")}:${e.map(a)}`);

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

const {astAssign: h, astEvaluate: f, astBind: d, astUnbind: p} = /*@__PURE__*/ (() => {
    const r = "AccessThis";
    const s = "AccessBoundary";
    const n = "AccessGlobal";
    const i = "AccessScope";
    const o = "ArrayLiteral";
    const c = "ObjectLiteral";
    const u = "PrimitiveLiteral";
    const l = "New";
    const h = "Template";
    const f = "Unary";
    const d = "CallScope";
    const p = "CallMember";
    const w = "CallFunction";
    const b = "CallGlobal";
    const v = "AccessMember";
    const g = "AccessKeyed";
    const y = "TaggedTemplate";
    const C = "Binary";
    const E = "Conditional";
    const A = "Assign";
    const O = "ArrowFunction";
    const x = "ValueConverter";
    const m = "BindingBehavior";
    const S = "ArrayBindingPattern";
    const k = "ObjectBindingPattern";
    const P = "BindingIdentifier";
    const R = "ForOfStatement";
    const I = "Interpolation";
    const _ = "ArrayDestructuring";
    const M = "ObjectDestructuring";
    const D = "DestructuringAssignmentLeaf";
    const L = "Custom";
    const N = Scope.getContext;
    function astEvaluate(t, B, T, j) {
        switch (t.$kind) {
          case r:
            {
                let e = B.overrideContext;
                let r = B;
                let s = t.ancestor;
                while (s-- && e) {
                    r = r.parent;
                    e = r?.overrideContext ?? null;
                }
                return s < 1 && r ? r.bindingContext : void 0;
            }

          case s:
            {
                let t = B;
                while (t != null && !t.isBoundary) {
                    t = t.parent;
                }
                return t ? t.bindingContext : void 0;
            }

          case i:
            {
                const r = N(B, t.name, t.ancestor);
                if (j !== null) {
                    j.observe(r, t.name);
                }
                const s = r[t.name];
                if (s == null) {
                    if (t.name === "$host") {
                        throw createMappedError(105);
                    }
                    return s;
                }
                return T?.boundFn && e.isFunction(s) ? s.bind(r) : s;
            }

          case n:
            return globalThis[t.name];

          case b:
            {
                const r = globalThis[t.name];
                if (e.isFunction(r)) {
                    return r(...t.args.map(t => astEvaluate(t, B, T, j)));
                }
                if (!T?.strict && r == null) {
                    return void 0;
                }
                throw createMappedError(107);
            }

          case o:
            return t.elements.map(t => astEvaluate(t, B, T, j));

          case c:
            {
                const e = {};
                for (let r = 0; r < t.keys.length; ++r) {
                    e[t.keys[r]] = astEvaluate(t.values[r], B, T, j);
                }
                return e;
            }

          case u:
            return t.value;

          case l:
            {
                const r = astEvaluate(t.func, B, T, j);
                if (e.isFunction(r)) {
                    return new r(...t.args.map(t => astEvaluate(t, B, T, j)));
                }
                throw createMappedError(107);
            }

          case h:
            {
                let e = t.cooked[0];
                for (let r = 0; r < t.expressions.length; ++r) {
                    e += a(astEvaluate(t.expressions[r], B, T, j));
                    e += t.cooked[r + 1];
                }
                return e;
            }

          case f:
            {
                const e = astEvaluate(t.expression, B, T, j);
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
                    if (j != null) throw createMappedError(113);
                    return astAssign(t.expression, B, T, j, e - 1) + t.pos;

                  case "++":
                    if (j != null) throw createMappedError(113);
                    return astAssign(t.expression, B, T, j, e + 1) - t.pos;

                  default:
                    throw createMappedError(109, t.operation);
                }
            }

          case d:
            {
                const r = N(B, t.name, t.ancestor);
                if (r == null) {
                    if (T?.strict) {
                        throw createMappedError(114, t.name, r);
                    }
                    return void 0;
                }
                const s = r[t.name];
                if (e.isFunction(s)) {
                    return s.apply(r, t.args.map(t => astEvaluate(t, B, T, j)));
                }
                if (s == null) {
                    if (T?.strict && !t.optional) {
                        throw createMappedError(111, t.name);
                    }
                    return void 0;
                }
                throw createMappedError(111, t.name);
            }

          case p:
            {
                const r = astEvaluate(t.object, B, T, j);
                if (r == null) {
                    if (T?.strict && !t.optionalMember) {
                        throw createMappedError(114, t.name, r);
                    }
                }
                const s = r?.[t.name];
                if (s == null) {
                    if (!t.optionalCall && T?.strict) {
                        throw createMappedError(111, t.name);
                    }
                    return void 0;
                }
                if (!e.isFunction(s)) {
                    throw createMappedError(111, t.name);
                }
                const n = s.apply(r, t.args.map(t => astEvaluate(t, B, T, j)));
                if (e.isArray(r) && V.includes(t.name)) {
                    j?.observeCollection(r);
                }
                return n;
            }

          case w:
            {
                const r = astEvaluate(t.func, B, T, j);
                if (e.isFunction(r)) {
                    return r(...t.args.map(t => astEvaluate(t, B, T, j)));
                }
                if (r == null) {
                    if (!t.optional && T?.strict) {
                        throw createMappedError(107);
                    }
                    return void 0;
                }
                throw createMappedError(107);
            }

          case O:
            {
                const func = (...e) => {
                    const r = t.args;
                    const s = t.rest;
                    const n = r.length - 1;
                    const i = r.reduce((t, r, i) => {
                        if (s && i === n) {
                            t[r.name] = e.slice(i);
                        } else {
                            t[r.name] = e[i];
                        }
                        return t;
                    }, {});
                    const o = Scope.fromParent(B, i);
                    return astEvaluate(t.body, o, T, j);
                };
                return func;
            }

          case v:
            {
                const r = astEvaluate(t.object, B, T, j);
                if (r == null) {
                    if (!t.optional && T?.strict) {
                        throw createMappedError(114, t.name, r);
                    }
                    return void 0;
                }
                if (j !== null && !t.accessGlobal) {
                    j.observe(r, t.name);
                }
                const s = r[t.name];
                return T?.boundFn && e.isFunction(s) ? s.bind(r) : s;
            }

          case g:
            {
                const e = astEvaluate(t.object, B, T, j);
                const r = astEvaluate(t.key, B, T, j);
                if (e == null) {
                    if (!t.optional && T?.strict) {
                        throw createMappedError(115, r, e);
                    }
                    return void 0;
                }
                if (j !== null && !t.accessGlobal) {
                    j.observe(e, r);
                }
                return e[r];
            }

          case y:
            {
                const r = t.expressions.map(t => astEvaluate(t, B, T, j));
                const s = astEvaluate(t.func, B, T, j);
                if (!e.isFunction(s)) {
                    throw createMappedError(110);
                }
                return s(t.cooked, ...r);
            }

          case C:
            {
                const r = t.left;
                const s = t.right;
                switch (t.operation) {
                  case "&&":
                    return astEvaluate(r, B, T, j) && astEvaluate(s, B, T, j);

                  case "||":
                    return astEvaluate(r, B, T, j) || astEvaluate(s, B, T, j);

                  case "??":
                    return astEvaluate(r, B, T, j) ?? astEvaluate(s, B, T, j);

                  case "==":
                    return astEvaluate(r, B, T, j) == astEvaluate(s, B, T, j);

                  case "===":
                    return astEvaluate(r, B, T, j) === astEvaluate(s, B, T, j);

                  case "!=":
                    return astEvaluate(r, B, T, j) != astEvaluate(s, B, T, j);

                  case "!==":
                    return astEvaluate(r, B, T, j) !== astEvaluate(s, B, T, j);

                  case "instanceof":
                    {
                        const t = astEvaluate(s, B, T, j);
                        if (e.isFunction(t)) {
                            return astEvaluate(r, B, T, j) instanceof t;
                        }
                        return false;
                    }

                  case "in":
                    {
                        const t = astEvaluate(s, B, T, j);
                        if (e.isObjectOrFunction(t)) {
                            return astEvaluate(r, B, T, j) in t;
                        }
                        return false;
                    }

                  case "+":
                    return astEvaluate(r, B, T, j) + astEvaluate(s, B, T, j);

                  case "-":
                    return astEvaluate(r, B, T, j) - astEvaluate(s, B, T, j);

                  case "*":
                    return astEvaluate(r, B, T, j) * astEvaluate(s, B, T, j);

                  case "/":
                    return astEvaluate(r, B, T, j) / astEvaluate(s, B, T, j);

                  case "%":
                    return astEvaluate(r, B, T, j) % astEvaluate(s, B, T, j);

                  case "**":
                    return astEvaluate(r, B, T, j) ** astEvaluate(s, B, T, j);

                  case "<":
                    return astEvaluate(r, B, T, j) < astEvaluate(s, B, T, j);

                  case ">":
                    return astEvaluate(r, B, T, j) > astEvaluate(s, B, T, j);

                  case "<=":
                    return astEvaluate(r, B, T, j) <= astEvaluate(s, B, T, j);

                  case ">=":
                    return astEvaluate(r, B, T, j) >= astEvaluate(s, B, T, j);

                  default:
                    throw createMappedError(108, t.operation);
                }
            }

          case E:
            return astEvaluate(t.condition, B, T, j) ? astEvaluate(t.yes, B, T, j) : astEvaluate(t.no, B, T, j);

          case A:
            {
                let e = astEvaluate(t.value, B, T, j);
                if (t.op !== "=") {
                    if (j != null) {
                        throw createMappedError(113);
                    }
                    const r = astEvaluate(t.target, B, T, j);
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
                return astAssign(t.target, B, T, j, e);
            }

          case x:
            {
                return T?.useConverter?.(t.name, "toView", astEvaluate(t.expression, B, T, j), t.args.map(t => astEvaluate(t, B, T, j)));
            }

          case m:
            return astEvaluate(t.expression, B, T, j);

          case P:
            return t.name;

          case R:
            return astEvaluate(t.iterable, B, T, j);

          case I:
            if (t.isMulti) {
                let e = t.parts[0];
                let r = 0;
                for (;r < t.expressions.length; ++r) {
                    e += a(astEvaluate(t.expressions[r], B, T, j));
                    e += t.parts[r + 1];
                }
                return e;
            } else {
                return `${t.parts[0]}${astEvaluate(t.firstExpression, B, T, j)}${t.parts[1]}`;
            }

          case D:
            return astEvaluate(t.target, B, T, j);

          case _:
            {
                return t.list.map(t => astEvaluate(t, B, T, j));
            }

          case S:
          case k:
          case M:
          default:
            return void 0;

          case L:
            return t.evaluate(B, T, j);
        }
    }
    function astAssign(r, s, n, o, a) {
        switch (r.$kind) {
          case i:
            {
                if (r.name === "$host") {
                    throw createMappedError(106);
                }
                const t = N(s, r.name, r.ancestor);
                return t[r.name] = a;
            }

          case v:
            {
                const t = astEvaluate(r.object, s, n, o);
                if (t == null) {
                    if (n?.strict) {
                        throw createMappedError(116, r.name);
                    }
                    astAssign(r.object, s, n, o, {
                        [r.name]: a
                    });
                } else if (e.isObjectOrFunction(t)) {
                    if (r.name === "length" && e.isArray(t) && !isNaN(a)) {
                        t.splice(a);
                    } else {
                        t[r.name] = a;
                    }
                } else ;
                return a;
            }

          case g:
            {
                const t = astEvaluate(r.object, s, n, o);
                const i = astEvaluate(r.key, s, n, o);
                if (t == null) {
                    if (n?.strict) {
                        throw createMappedError(116, i);
                    }
                    astAssign(r.object, s, n, o, {
                        [i]: a
                    });
                    return a;
                }
                if (e.isArray(t)) {
                    if (i === "length" && !isNaN(a)) {
                        t.splice(a);
                        return a;
                    }
                    if (e.isArrayIndex(i)) {
                        t.splice(i, 1, a);
                        return a;
                    }
                }
                return t[i] = a;
            }

          case A:
            astAssign(r.value, s, n, o, a);
            return astAssign(r.target, s, n, o, a);

          case x:
            {
                a = n?.useConverter?.(r.name, "fromView", a, r.args.map(t => astEvaluate(t, s, n, o)));
                return astAssign(r.expression, s, n, o, a);
            }

          case m:
            return astAssign(r.expression, s, n, o, a);

          case _:
          case M:
            {
                const t = r.list;
                const e = t.length;
                let i;
                let c;
                for (i = 0; i < e; i++) {
                    c = t[i];
                    switch (c.$kind) {
                      case D:
                        astAssign(c, s, n, o, a);
                        break;

                      case _:
                      case M:
                        {
                            if (typeof a !== "object" || a === null) {
                                throw createMappedError(112);
                            }
                            let t = astEvaluate(c.source, Scope.create(a), n, null);
                            if (t === void 0 && c.initializer) {
                                t = astEvaluate(c.initializer, s, n, null);
                            }
                            astAssign(c, s, n, o, t);
                            break;
                        }
                    }
                }
                break;
            }

          case D:
            {
                if (r instanceof t.DestructuringAssignmentSingleExpression) {
                    if (a == null) {
                        return;
                    }
                    if (typeof a !== "object") {
                        throw createMappedError(112);
                    }
                    let t = astEvaluate(r.source, Scope.create(a), n, o);
                    if (t === void 0 && r.initializer) {
                        t = astEvaluate(r.initializer, s, n, o);
                    }
                    astAssign(r.target, s, n, o, t);
                } else {
                    if (a == null) {
                        return;
                    }
                    if (typeof a !== "object") {
                        throw createMappedError(112);
                    }
                    const t = r.indexOrProperties;
                    let i;
                    if (e.isArrayIndex(t)) {
                        if (!Array.isArray(a)) {
                            throw createMappedError(112);
                        }
                        i = a.slice(t);
                    } else {
                        i = Object.entries(a).reduce((e, [r, s]) => {
                            if (!t.includes(r)) {
                                e[r] = s;
                            }
                            return e;
                        }, {});
                    }
                    astAssign(r.target, s, n, o, i);
                }
                break;
            }

          case L:
            return r.assign(s, n, a);

          default:
            return void 0;
        }
    }
    function astBind(t, e, r) {
        switch (t.$kind) {
          case m:
            {
                r.bindBehavior?.(t.name, e, t.args.map(t => astEvaluate(t, e, r, null)));
                astBind(t.expression, e, r);
                break;
            }

          case x:
            {
                r.bindConverter?.(t.name);
                astBind(t.expression, e, r);
                break;
            }

          case R:
            {
                astBind(t.iterable, e, r);
                break;
            }

          case L:
            {
                t.bind?.(e, r);
            }
        }
    }
    function astUnbind(t, e, r) {
        switch (t.$kind) {
          case m:
            {
                r.unbindBehavior?.(t.name, e);
                astUnbind(t.expression, e, r);
                break;
            }

          case x:
            {
                r.unbindConverter?.(t.name);
                astUnbind(t.expression, e, r);
                break;
            }

          case R:
            {
                astUnbind(t.iterable, e, r);
                break;
            }

          case L:
            {
                t.unbind?.(e, r);
            }
        }
    }
    const V = "at map filter includes indexOf lastIndexOf findIndex find flat flatMap join reduce reduceRight slice every some sort".split(" ");
    return {
        astEvaluate: astEvaluate,
        astAssign: astAssign,
        astBind: astBind,
        astUnbind: astUnbind
    };
})();

const w = (() => t => {
    const e = t.prototype;
    [ "bindBehavior", "unbindBehavior", "bindConverter", "unbindConverter", "useConverter" ].forEach(t => {
        rtDefineHiddenProp(e, t, () => {
            throw createMappedError(99, t);
        });
    });
})();

const b = "pending";

const v = "running";

const g = "completed";

const y = "canceled";

const C = Promise.resolve();

let E = false;

let A = false;

const O = [];

let x = 0;

let m = null;

let S = [];

let k = null;

let P = null;

const requestRun = () => {
    if (!E) {
        E = true;
        void C.then(() => {
            E = false;
            A = true;
            runTasks();
        });
    }
};

const signalSettled = t => {
    if (m && O.length === 0 && x === 0) {
        m = null;
        if (S.length > 0) {
            const t = S;
            S = [];
            if (t.length === 1) {
                P(t[0]);
            } else {
                P(new AggregateError(t, "One or more tasks failed."));
            }
        } else {
            k(t);
        }
    }
};

const runTasks = () => {
    const t = !A;
    A = false;
    m ??= new Promise((t, e) => {
        k = t;
        P = e;
    });
    let e = -O.length;
    const r = O.length === 0;
    while (O.length > 0) {
        if (++e > 1e4) {
            const t = new Error(`Potential deadlock detected. More than 10000 extra tasks were queued from within tasks.`);
            O.length = 0;
            P?.(t);
            m = null;
            throw t;
        }
        const t = O.shift();
        if (t instanceof Task) {
            t.run();
        } else {
            try {
                t();
            } catch (t) {
                S.push(t);
            }
        }
    }
    const s = S.slice();
    signalSettled(!r);
    if (t && s.length > 0) {
        if (s.length === 1) {
            throw s[0];
        } else {
            throw new AggregateError(s, "One or more tasks failed.");
        }
    }
};

const tasksSettled = () => {
    if (m) {
        return m;
    }
    if (O.length > 0 || x > 0) {
        return m ??= new Promise((t, e) => {
            k = t;
            P = e;
        });
    }
    return C.then(() => {
        if (O.length > 0 || x > 0) {
            return m ??= new Promise((t, e) => {
                k = t;
                P = e;
            });
        }
        return false;
    });
};

const queueTask = t => {
    requestRun();
    O.push(t);
};

const queueAsyncTask = (t, e) => {
    const r = new Task(t, e?.delay);
    if (r.delay != null && r.delay > 0) {
        ++x;
        r.t = setTimeout(() => {
            --x;
            r.t = undefined;
            if (r.status === y) {
                signalSettled(true);
                return;
            }
            O.push(r);
            requestRun();
        }, r.delay);
    } else {
        O.push(r);
        requestRun();
    }
    return r;
};

class TaskAbortError extends Error {
    constructor(t) {
        super(`Task ${t.id} was canceled.`);
        this.task = t;
    }
}

class Task {
    get result() {
        return this.i;
    }
    get status() {
        return this.u;
    }
    constructor(t, e) {
        this.callback = t;
        this.delay = e;
        this.id = ++Task.h;
        this.u = b;
        this.i = new Promise((t, e) => {
            this.C = t;
            this.A = e;
        });
    }
    run() {
        if (this.u !== b) {
            throw new Error(`Cannot run task in ${this.u} state`);
        }
        this.u = v;
        let t;
        try {
            t = this.callback();
        } catch (t) {
            this.u = y;
            this.A(t);
            S.push(t);
            return;
        }
        if (t instanceof Promise) {
            ++x;
            t.then(t => {
                this.u = g;
                this.C(t);
            }).catch(t => {
                this.u = y;
                this.A(t);
                S.push(t);
            }).finally(() => {
                --x;
                signalSettled(true);
            });
        } else {
            this.u = g;
            this.C(t);
        }
    }
    cancel() {
        if (this.t !== undefined) {
            clearTimeout(this.t);
            --x;
            this.t = undefined;
            this.u = y;
            this.A(new TaskAbortError(this));
            signalSettled(true);
            return true;
        }
        if (this.u === b) {
            const t = O.indexOf(this);
            if (t > -1) {
                O.splice(t, 1);
                this.u = y;
                this.A(new TaskAbortError(this));
                signalSettled(true);
                return true;
            }
        }
        return false;
    }
}

Task.h = 0;

const R = /*@__PURE__*/ e.DI.createInterface("ICoercionConfiguration");

const I = 0;

const _ = 1;

const M = 2;

const D = 4;

const L = /*@__PURE__*/ o({
    None: I,
    Observer: _,
    Node: M,
    Layout: D
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
    return e.isArray(t) && t.isIndexMap === true;
}

let N = new Map;

let V = false;

function batch(t) {
    const e = N;
    const r = N = new Map;
    V = true;
    try {
        t();
    } finally {
        N = null;
        V = false;
        try {
            let t;
            let s;
            let n;
            let i;
            let o;
            let a = false;
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
                    o = n[2];
                    a = false;
                    if (o.deletedIndices.length > 0) {
                        a = true;
                    } else {
                        for (c = 0, u = o.length; c < u; ++c) {
                            if (o[c] !== c) {
                                a = true;
                                break;
                            }
                        }
                    }
                    if (a) {
                        s.notifyCollection(i, o);
                    }
                }
            }
        } finally {
            N = e;
        }
    }
}

function addCollectionBatch(t, e, r) {
    if (!N.has(t)) {
        N.set(t, [ 2, e, r ]);
    } else {
        N.get(t)[2] = r;
    }
}

function addValueBatch(t, e, r) {
    const s = N.get(t);
    if (s === void 0) {
        N.set(t, [ 1, e, r ]);
    } else {
        s[1] = e;
        s[2] = r;
    }
}

const B = /*@__PURE__*/ (() => {
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
            n(r, "subs", {
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
            this.O = [];
            this.P = [];
            this.R = false;
        }
        add(t) {
            if (this.O.includes(t)) {
                return false;
            }
            this.O[this.O.length] = t;
            if ("handleDirty" in t) {
                this.P[this.P.length] = t;
                this.R = true;
            }
            ++this.count;
            return true;
        }
        remove(t) {
            let e = this.O.indexOf(t);
            if (e !== -1) {
                this.O.splice(e, 1);
                e = this.P.indexOf(t);
                if (e !== -1) {
                    this.P.splice(e, 1);
                    this.R = this.P.length > 0;
                }
                --this.count;
                return true;
            }
            return false;
        }
        notify(t, e) {
            if (V) {
                addValueBatch(this, t, e);
                return;
            }
            for (const r of this.O.slice(0)) {
                r.handleChange(t, e);
            }
        }
        notifyCollection(t, e) {
            const r = this.O.slice(0);
            const s = r.length;
            let n = 0;
            for (;n < s; ++n) {
                r[n].handleCollectionChange(t, e);
            }
            return;
        }
        notifyDirty() {
            if (this.R) {
                for (const t of this.P.slice(0)) {
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
        this.type = _;
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
        this.type = _;
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
    return B(t, null);
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

const T = /*@__PURE__*/ (() => {
    const t = Symbol.for("__au_arr_obs__");
    const r = Array[t] ?? rtDefineHiddenProp(Array, t, new WeakMap);
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
        let i, o, a, c, u;
        let l, h;
        for (l = r + 1; l < s; l++) {
            i = t[l];
            o = e[l];
            for (h = l - 1; h >= r; h--) {
                a = t[h];
                c = e[h];
                u = n(a, i);
                if (u > 0) {
                    t[h + 1] = a;
                    e[h + 1] = c;
                } else {
                    break;
                }
            }
            t[h + 1] = i;
            e[h + 1] = o;
        }
    }
    function quickSort(t, e, r, s, n) {
        let i = 0, o = 0;
        let a, c, u;
        let l, h, f;
        let d, p, w;
        let b, v;
        let g, y, C, E;
        let A, O, x, m;
        while (true) {
            if (s - r <= 10) {
                insertionSort(t, e, r, s, n);
                return;
            }
            i = r + (s - r >> 1);
            a = t[r];
            l = e[r];
            c = t[s - 1];
            h = e[s - 1];
            u = t[i];
            f = e[i];
            d = n(a, c);
            if (d > 0) {
                b = a;
                v = l;
                a = c;
                l = h;
                c = b;
                h = v;
            }
            p = n(a, u);
            if (p >= 0) {
                b = a;
                v = l;
                a = u;
                l = f;
                u = c;
                f = h;
                c = b;
                h = v;
            } else {
                w = n(c, u);
                if (w > 0) {
                    b = c;
                    v = h;
                    c = u;
                    h = f;
                    u = b;
                    f = v;
                }
            }
            t[r] = a;
            e[r] = l;
            t[s - 1] = u;
            e[s - 1] = f;
            g = c;
            y = h;
            C = r + 1;
            E = s - 1;
            t[i] = t[C];
            e[i] = e[C];
            t[C] = g;
            e[C] = y;
            t: for (o = C + 1; o < E; o++) {
                A = t[o];
                O = e[o];
                x = n(A, g);
                if (x < 0) {
                    t[o] = t[C];
                    e[o] = e[C];
                    t[C] = A;
                    e[C] = O;
                    C++;
                } else if (x > 0) {
                    do {
                        E--;
                        if (E == o) {
                            break t;
                        }
                        m = t[E];
                        x = n(m, g);
                    } while (x > 0);
                    t[o] = t[E];
                    e[o] = e[E];
                    t[E] = A;
                    e[E] = O;
                    if (x < 0) {
                        A = t[o];
                        O = e[o];
                        t[o] = t[C];
                        e[o] = e[C];
                        t[C] = A;
                        e[C] = O;
                        C++;
                    }
                }
            }
            if (s - E < C - r) {
                quickSort(t, e, E, s, n);
                s = C;
            } else {
                quickSort(t, e, r, C, n);
                r = E;
            }
        }
    }
    const s = Array.prototype;
    const i = [ "push", "unshift", "pop", "shift", "splice", "reverse", "sort" ];
    let o;
    function overrideArrayPrototypes() {
        const t = s.push;
        const a = s.unshift;
        const c = s.pop;
        const u = s.shift;
        const l = s.splice;
        const h = s.reverse;
        const f = s.sort;
        o = {
            push: function(...e) {
                const s = r.get(this);
                if (s === void 0) {
                    return t.apply(this, e);
                }
                const n = this.length;
                const i = e.length;
                if (i === 0) {
                    return n;
                }
                this.length = s.indexMap.length = n + i;
                let o = n;
                while (o < this.length) {
                    this[o] = e[o - n];
                    s.indexMap[o] = -2;
                    o++;
                }
                s.notify();
                return this.length;
            },
            unshift: function(...t) {
                const e = r.get(this);
                if (e === void 0) {
                    return a.apply(this, t);
                }
                const s = t.length;
                const n = new Array(s);
                let i = 0;
                while (i < s) {
                    n[i++] = -2;
                }
                a.apply(e.indexMap, n);
                const o = a.apply(this, t);
                e.notify();
                return o;
            },
            pop: function() {
                const t = r.get(this);
                if (t === void 0) {
                    return c.call(this);
                }
                const e = t.indexMap;
                const s = c.call(this);
                const n = e.length - 1;
                if (e[n] > -1) {
                    e.deletedIndices.push(e[n]);
                    e.deletedItems.push(s);
                }
                c.call(e);
                t.notify();
                return s;
            },
            shift: function() {
                const t = r.get(this);
                if (t === void 0) {
                    return u.call(this);
                }
                const e = t.indexMap;
                const s = u.call(this);
                if (e[0] > -1) {
                    e.deletedIndices.push(e[0]);
                    e.deletedItems.push(s);
                }
                u.call(e);
                t.notify();
                return s;
            },
            splice: function(...t) {
                const e = t[0];
                const s = t[1];
                const n = r.get(this);
                if (n === void 0) {
                    return l.apply(this, t);
                }
                const i = this.length;
                const o = e | 0;
                const a = o < 0 ? Math.max(i + o, 0) : Math.min(o, i);
                const c = n.indexMap;
                const u = t.length;
                const h = u === 0 ? 0 : u === 1 ? i - a : s;
                let f = a;
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
                if (u > 2) {
                    const t = u - 2;
                    const r = new Array(t);
                    while (f < t) {
                        r[f++] = -2;
                    }
                    l.call(c, e, s, ...r);
                } else {
                    l.apply(c, t);
                }
                const d = l.apply(this, t);
                if (h > 0 || f > 0) {
                    n.notify();
                }
                return d;
            },
            reverse: function() {
                const t = r.get(this);
                if (t === void 0) {
                    h.call(this);
                    return this;
                }
                const e = this.length;
                const s = e / 2 | 0;
                let n = 0;
                while (n !== s) {
                    const r = e - n - 1;
                    const s = this[n];
                    const i = t.indexMap[n];
                    const o = this[r];
                    const a = t.indexMap[r];
                    this[n] = o;
                    t.indexMap[n] = a;
                    this[r] = s;
                    t.indexMap[r] = i;
                    n++;
                }
                t.notify();
                return this;
            },
            sort: function(t) {
                const s = r.get(this);
                if (s === void 0) {
                    f.call(this, t);
                    return this;
                }
                let n = this.length;
                if (n < 2) {
                    return this;
                }
                quickSort(this, s.indexMap, 0, n, preSortCompare);
                let i = 0;
                while (i < n) {
                    if (this[i] === void 0) {
                        break;
                    }
                    i++;
                }
                if (t === void 0 || !e.isFunction(t)) {
                    t = sortCompare;
                }
                quickSort(this, s.indexMap, 0, i, t);
                let o = false;
                for (i = 0, n = s.indexMap.length; n > i; ++i) {
                    if (s.indexMap[i] !== i) {
                        o = true;
                        break;
                    }
                }
                if (o || V) {
                    s.notify();
                }
                return this;
            }
        };
        for (const t of i) {
            n(o[t], "observing", {
                value: true,
                writable: false,
                configurable: false,
                enumerable: false
            });
        }
    }
    let a = false;
    const c = "__au_arr_on__";
    function enableArrayObservation() {
        if (o === undefined) {
            overrideArrayPrototypes();
        }
        if (!(u(c, Array) ?? false)) {
            l(true, Array, c);
            for (const t of i) {
                if (s[t].observing !== true) {
                    rtDefineHiddenProp(s, t, o[t]);
                }
            }
        }
    }
    class ArrayObserverImpl {
        constructor(t) {
            this.type = _;
            if (!a) {
                a = true;
                enableArrayObservation();
            }
            this.indexObservers = {};
            this.collection = t;
            this.indexMap = createIndexMap(t.length);
            this.lenObs = void 0;
            r.set(t, this);
        }
        notify() {
            const t = this.subs;
            t.notifyDirty();
            const e = this.indexMap;
            if (V) {
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
        B(ArrayObserverImpl, null);
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
        B(ArrayIndexObserverImpl, null);
    })();
    return function getArrayObserver(t) {
        let e = r.get(t);
        if (e === void 0) {
            r.set(t, e = new ArrayObserverImpl(t));
            enableArrayObservation();
        }
        return e;
    };
})();

const j = /*@__PURE__*/ (() => {
    const t = Symbol.for("__au_set_obs__");
    const e = Set[t] ?? rtDefineHiddenProp(Set, t, new WeakMap);
    const {add: r, clear: s, delete: n} = Set.prototype;
    const i = [ "add", "clear", "delete" ];
    const o = {
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
            const o = r.indexMap;
            for (const e of this.keys()) {
                if (e === t) {
                    if (o[i] > -1) {
                        o.deletedIndices.push(o[i]);
                        o.deletedItems.push(e);
                    }
                    o.splice(i, 1);
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
            rtDefineHiddenProp(t, e, o[e]);
        }
    }
    class SetObserverImpl {
        constructor(t) {
            this.type = _;
            this.collection = t;
            this.indexMap = createIndexMap(t.size);
            this.lenObs = void 0;
        }
        notify() {
            const t = this.subs;
            t.notifyDirty();
            const e = this.indexMap;
            if (V) {
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
    B(SetObserverImpl, null);
    return function getSetObserver(t) {
        let r = e.get(t);
        if (r === void 0) {
            e.set(t, r = new SetObserverImpl(t));
            enableSetObservation(t);
        }
        return r;
    };
})();

const F = /*@__PURE__*/ (() => {
    const t = Symbol.for("__au_map_obs__");
    const e = Map[t] ?? rtDefineHiddenProp(Map, t, new WeakMap);
    const {set: r, clear: s, delete: n} = Map.prototype;
    const i = [ "set", "clear", "delete" ];
    const o = {
        set: function(t, s) {
            const n = e.get(this);
            if (n === undefined) {
                r.call(this, t, s);
                return this;
            }
            const i = this.get(t);
            const o = this.size;
            r.call(this, t, s);
            const a = this.size;
            if (a === o) {
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
            n.indexMap[o] = -2;
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
            const o = r.indexMap;
            for (const e of this.keys()) {
                if (e === t) {
                    if (o[i] > -1) {
                        o.deletedIndices.push(o[i]);
                        o.deletedItems.push(e);
                    }
                    o.splice(i, 1);
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
            rtDefineHiddenProp(t, e, o[e]);
        }
    }
    class MapObserverImpl {
        constructor(t) {
            this.type = _;
            this.collection = t;
            this.indexMap = createIndexMap(t.size);
            this.lenObs = void 0;
        }
        notify() {
            const t = this.subs;
            t.notifyDirty();
            const e = this.indexMap;
            if (V) {
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
    B(MapObserverImpl, null);
    return function getMapObserver(t) {
        let r = e.get(t);
        if (r === void 0) {
            e.set(t, r = new MapObserverImpl(t));
            enableMapObservation(t);
        }
        return r;
    };
})();

const H = /*@__PURE__*/ (() => {
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
        let r;
        if (e.isArray(t)) {
            r = T(t);
        } else if (e.isSet(t)) {
            r = j(t);
        } else if (e.isMap(t)) {
            r = F(t);
        } else {
            throw createMappedError(210, t);
        }
        this.obs.add(r);
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
        n(r, "obs", {
            get: getObserverRecord
        });
        ensureProto(r, "handleChange", noopHandleChange);
        ensureProto(r, "handleCollectionChange", noopHandleCollectionChange);
        return t;
    };
})();

function connectable(t, e) {
    return t == null ? H : H(t, e);
}

let $ = null;

const z = [];

let U = false;

function pauseConnecting() {
    U = false;
}

function resumeConnecting() {
    U = true;
}

function currentConnectable() {
    return $;
}

function enterConnectable(t) {
    if (t == null) {
        throw createMappedError(206);
    }
    if ($ == null) {
        $ = t;
        z[0] = $;
        U = true;
        return;
    }
    if ($ === t) {
        throw createMappedError(207);
    }
    z.push(t);
    $ = t;
    U = true;
}

function exitConnectable(t) {
    if (t == null) {
        throw createMappedError(208);
    }
    if ($ !== t) {
        throw createMappedError(209);
    }
    z.pop();
    $ = z.length > 0 ? z[z.length - 1] : null;
    U = $ != null;
}

const q = /*@__PURE__*/ o({
    get current() {
        return $;
    },
    get connecting() {
        return U;
    },
    enter: enterConnectable,
    exit: exitConnectable,
    pause: pauseConnecting,
    resume: resumeConnecting
});

const W = Reflect.get;

const K = Object.prototype.toString;

const G = new WeakMap;

const J = "__au_nw__";

const Q = "__au_nw";

function canWrap(t) {
    switch (K.call(t)) {
      case "[object Object]":
        return t.constructor[J] !== true;

      case "[object Array]":
      case "[object Map]":
      case "[object Set]":
        return true;

      default:
        return false;
    }
}

const X = "__raw__";

function wrap(t) {
    return canWrap(t) ? getProxy(t) : t;
}

function getProxy(t) {
    return G.get(t) ?? createProxy(t);
}

function getRaw(t) {
    return t[X] ?? t;
}

function unwrap(t) {
    return canWrap(t) && t[X] || t;
}

function doNotCollect(t, e) {
    return e === "constructor" || e === "__proto__" || e === "$observers" || e === Symbol.toPrimitive || e === Symbol.toStringTag || t.constructor[`${Q}_${a(e)}__`] === true;
}

function createProxy(t) {
    const r = e.isArray(t) ? Z : e.isMap(t) || e.isSet(t) ? tt : Y;
    const s = new Proxy(t, r);
    G.set(t, s);
    G.set(s, s);
    return s;
}

const Y = {
    get(t, e, r) {
        if (e === X) {
            return t;
        }
        const s = currentConnectable();
        if (!U || doNotCollect(t, e) || s == null) {
            return W(t, e, r);
        }
        s.observe(t, e);
        return wrap(W(t, e, r));
    },
    deleteProperty(t, e) {
        return delete t[e];
    }
};

const Z = {
    get(t, e, r) {
        if (e === X) {
            return t;
        }
        if (!U || doNotCollect(t, e) || $ == null) {
            return W(t, e, r);
        }
        switch (e) {
          case "length":
            $.observe(t, "length");
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
        $.observe(t, e);
        return wrap(W(t, e, r));
    },
    ownKeys(t) {
        currentConnectable()?.observe(t, "length");
        return Reflect.ownKeys(t);
    }
};

function wrappedArrayMap(t, e) {
    const r = getRaw(this);
    const s = r.map((r, s) => unwrap(t.call(e, wrap(r), s, this)));
    observeCollection($, r);
    return wrap(s);
}

function wrappedArrayEvery(t, e) {
    const r = getRaw(this);
    const s = r.every((r, s) => t.call(e, wrap(r), s, this));
    observeCollection($, r);
    return s;
}

function wrappedArrayFilter(t, e) {
    const r = getRaw(this);
    const s = r.filter((r, s) => unwrap(t.call(e, wrap(r), s, this)));
    observeCollection($, r);
    return wrap(s);
}

function wrappedArrayIncludes(t) {
    const e = getRaw(this);
    const r = e.includes(unwrap(t));
    observeCollection($, e);
    return r;
}

function wrappedArrayIndexOf(t) {
    const e = getRaw(this);
    const r = e.indexOf(unwrap(t));
    observeCollection($, e);
    return r;
}

function wrappedArrayLastIndexOf(t) {
    const e = getRaw(this);
    const r = e.lastIndexOf(unwrap(t));
    observeCollection($, e);
    return r;
}

function wrappedArrayFindIndex(t, e) {
    const r = getRaw(this);
    const s = r.findIndex((r, s) => unwrap(t.call(e, wrap(r), s, this)));
    observeCollection($, r);
    return s;
}

function wrappedArrayFind(t, e) {
    const r = getRaw(this);
    const s = r.find((e, r) => t(wrap(e), r, this), e);
    observeCollection($, r);
    return wrap(s);
}

function wrappedArrayFlat() {
    const t = getRaw(this);
    observeCollection($, t);
    return wrap(t.flat());
}

function wrappedArrayFlatMap(t, e) {
    const r = getRaw(this);
    observeCollection($, r);
    return getProxy(r.flatMap((r, s) => wrap(t.call(e, wrap(r), s, this))));
}

function wrappedArrayJoin(t) {
    const e = getRaw(this);
    observeCollection($, e);
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
    return wrap(getRaw(this).reverse());
}

function wrappedArraySome(t, e) {
    const r = getRaw(this);
    const s = r.some((r, s) => unwrap(t.call(e, wrap(r), s, this)));
    observeCollection($, r);
    return s;
}

function wrappedArraySort(t) {
    const e = getRaw(this);
    const r = e.sort(t);
    observeCollection($, e);
    return wrap(r);
}

function wrappedArraySlice(t, e) {
    const r = getRaw(this);
    observeCollection($, r);
    return getProxy(r.slice(t, e));
}

function wrappedReduce(t, e) {
    const r = getRaw(this);
    const s = r.reduce((e, r, s) => t(e, wrap(r), s, this), e);
    observeCollection($, r);
    return wrap(s);
}

function wrappedReduceRight(t, e) {
    const r = getRaw(this);
    const s = r.reduceRight((e, r, s) => t(e, wrap(r), s, this), e);
    observeCollection($, r);
    return wrap(s);
}

const tt = {
    get(t, r, s) {
        if (r === X) {
            return t;
        }
        const n = currentConnectable();
        if (!U || doNotCollect(t, r) || n == null) {
            return W(t, r, s);
        }
        switch (r) {
          case "size":
            n.observe(t, "size");
            return t.size;

          case "clear":
            return wrappedClear;

          case "delete":
            return wrappedDelete;

          case "forEach":
            return wrappedForEach;

          case "add":
            if (e.isSet(t)) {
                return wrappedAdd;
            }
            break;

          case "get":
            if (e.isMap(t)) {
                return wrappedGet;
            }
            break;

          case "set":
            if (e.isMap(t)) {
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
            return e.isMap(t) ? wrappedEntries : wrappedValues;
        }
        return wrap(W(t, r, s));
    }
};

function wrappedForEach(t, e) {
    const r = getRaw(this);
    observeCollection($, r);
    return r.forEach((r, s) => {
        t.call(e, wrap(r), wrap(s), this);
    });
}

function wrappedHas(t) {
    const e = getRaw(this);
    observeCollection($, e);
    return e.has(unwrap(t));
}

function wrappedGet(t) {
    const e = getRaw(this);
    observeCollection($, e);
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
    observeCollection($, t);
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
    observeCollection($, t);
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
    observeCollection($, t);
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

const et = /*@__PURE__*/ o({
    getProxy: getProxy,
    getRaw: getRaw,
    wrap: wrap,
    unwrap: unwrap,
    rawKey: X
});

class ComputedObserver {
    constructor(t, e, r, s, n = "async") {
        this.type = _;
        this.ov = void 0;
        this.v = void 0;
        this.I = false;
        this._ = false;
        this.D = false;
        this.cb = void 0;
        this.M = void 0;
        this.L = void 0;
        this.o = t;
        this.N = wrap(t);
        this.$get = e;
        this.$set = r;
        this.oL = s;
        this.V = n;
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
            this.I = false;
        }
        return this.v;
    }
    setValue(t) {
        if (e.isFunction(this.$set)) {
            if (this.M !== void 0) {
                t = this.M.call(null, t, this.L);
            }
            if (!e.areEqual(t, this.v)) {
                this.$set.call(this.o, t);
                this.run();
            }
        } else {
            throw createMappedError(221);
        }
    }
    useCoercer(t, e) {
        this.M = t;
        this.L = e;
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
            this.I = false;
        }
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && this.subs.count === 0) {
            this.D = true;
            this.obs.clearAll();
            this.ov = void 0;
            this.I = true;
        }
    }
    run() {
        if (this.V === "sync") {
            this.B();
            return;
        }
        if (this._) {
            return;
        }
        this._ = true;
        queueTask(() => {
            this._ = false;
            this.B();
        });
    }
    B() {
        const t = this.v;
        const r = this.ov;
        const s = this.compute();
        this.D = false;
        if (!this.I || !e.areEqual(s, t)) {
            this.cb?.(s, r);
            this.subs.notify(s, r);
            this.ov = this.v = s;
            this.I = true;
        }
    }
    compute() {
        this.obs.version++;
        try {
            enterConnectable(this);
            return this.v = unwrap(this.$get.call(this.N, this.N, this));
        } finally {
            this.obs.clear();
            exitConnectable(this);
        }
    }
}

(() => {
    connectable(ComputedObserver, null);
    B(ComputedObserver, null);
})();

typeof SuppressedError === "function" ? SuppressedError : function(t, e, r) {
    var s = new Error(r);
    return s.name = "SuppressedError", s.error = t, s.suppressed = e, s;
};

const rt = (() => {
    const t = new WeakMap;
    const normalizeKey = t => e.isSymbol(t) ? t : String(t);
    return {
        get: (e, r) => t.get(e)?.get(normalizeKey(r)),
        T: (e, r) => t.get(e)?.get(normalizeKey(r))?.flush,
        set: (e, r, s) => {
            if (!t.has(e)) {
                t.set(e, new Map);
            }
            t.get(e).set(normalizeKey(r), s);
        }
    };
})();

function computed(t) {
    return function decorator(e, r) {
        r.addInitializer(function() {
            const e = t.flush ?? "async";
            rt.set(this, r.name, {
                flush: e
            });
        });
    };
}

const st = /*@__PURE__*/ c("IDirtyChecker", void 0);

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
        t.register(e.Registration.singleton(this, this), e.Registration.aliasTo(this, st));
    }
    constructor() {
        this.tracked = [];
        this.j = null;
        this.F = 0;
        this.p = e.resolve(e.IPlatform);
        this.check = () => {
            if (nt.disabled) {
                return;
            }
            if (++this.F < nt.timeoutsPerCheck) {
                return;
            }
            this.F = 0;
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
        B(DirtyCheckProperty, null);
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
            this.j = this.p.taskQueue.queueTask(this.check, {
                persistent: true
            });
        }
    }
    removeProperty(t) {
        this.tracked.splice(this.tracked.indexOf(t), 1);
        if (this.tracked.length === 0) {
            this.j.cancel();
            this.j = null;
        }
    }
}

class DirtyCheckProperty {
    constructor(t, e, r) {
        this.obj = e;
        this.key = r;
        this.type = I;
        this.ov = void 0;
        this.H = t;
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
            this.H.addProperty(this);
        }
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && this.subs.count === 0) {
            this.H.removeProperty(this);
        }
    }
}

class PrimitiveObserver {
    get doNotCache() {
        return true;
    }
    constructor(t, e) {
        this.type = I;
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
        this.type = I;
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
        this.type = _;
        this.v = void 0;
        this.iO = false;
        this.cb = void 0;
        this.M = void 0;
        this.L = void 0;
        this.o = t;
        this.k = e;
    }
    getValue() {
        return this.v;
    }
    setValue(t) {
        if (this.M !== void 0) {
            t = this.M.call(void 0, t, this.L);
        }
        const r = this.v;
        if (this.iO) {
            if (e.areEqual(t, this.v)) {
                return;
            }
            this.v = t;
            this.subs.notifyDirty();
            this.subs.notify(t, r);
            if (e.areEqual(t, this.v)) {
                this.cb?.(t, r);
            }
        } else {
            this.v = this.o[this.k] = t;
            this.cb?.(t, r);
        }
    }
    useCallback(t) {
        this.cb = t;
        this.start();
        return true;
    }
    useCoercer(t, e) {
        this.M = t;
        this.L = e;
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
            n(this.o, this.k, {
                enumerable: true,
                configurable: true,
                get: i(() => this.getValue(), {
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
            n(this.o, this.k, {
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
    B(SetterObserver, null);
})();

const it = new PropertyAccessor;

const ot = /*@__PURE__*/ c("IObserverLocator", t => t.singleton(ObserverLocator));

const at = /*@__PURE__*/ c("INodeObserverLocator", t => t.cachedCallback(t => new DefaultNodeObserverLocator));

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

const ct = /*@__PURE__*/ c("IComputedObserverLocator", t => t.singleton(class DefaultLocator {
    getObserver(t, e, r, s) {
        const o = new ComputedObserver(t, r.get, r.set, s, rt.T(t, e));
        n(t, e, {
            enumerable: r.enumerable,
            configurable: true,
            get: i(() => o.getValue(), {
                getObserver: () => o
            }),
            set: t => {
                o.setValue(t);
            }
        });
        return o;
    }
}));

class ObserverLocator {
    constructor() {
        this.$ = [];
        this.H = e.resolve(st);
        this.U = e.resolve(at);
        this.q = e.resolve(ct);
    }
    addAdapter(t) {
        this.$.push(t);
    }
    getObserver(t, r) {
        if (t == null) {
            throw createMappedError(199, r);
        }
        if (!e.isObject(t)) {
            return new PrimitiveObserver(t, e.isFunction(r) ? "" : r);
        }
        if (e.isFunction(r)) {
            return new ComputedObserver(t, r, void 0, this);
        }
        const s = getObserverLookup(t);
        let n = s[r];
        if (n === void 0) {
            n = this.createObserver(t, r);
            if (!n.doNotCache) {
                s[r] = n;
            }
        }
        return n;
    }
    getAccessor(t, e) {
        const r = t.$observers?.[e];
        if (r !== void 0) {
            return r;
        }
        if (this.U.handles(t, e, this)) {
            return this.U.getAccessor(t, e, this);
        }
        return it;
    }
    getArrayObserver(t) {
        return T(t);
    }
    getMapObserver(t) {
        return F(t);
    }
    getSetObserver(t) {
        return j(t);
    }
    createObserver(t, r) {
        if (this.U.handles(t, r, this)) {
            return this.U.getObserver(t, r, this);
        }
        switch (r) {
          case "length":
            if (e.isArray(t)) {
                return T(t).getLengthObserver();
            }
            break;

          case "size":
            if (e.isMap(t)) {
                return F(t).getLengthObserver();
            } else if (e.isSet(t)) {
                return j(t).getLengthObserver();
            }
            break;

          default:
            if (e.isArray(t) && e.isArrayIndex(r)) {
                return T(t).getIndexObserver(Number(r));
            }
            break;
        }
        let n = lt(t, r);
        if (n === void 0) {
            let e = ut(t);
            while (e !== null) {
                n = lt(e, r);
                if (n === void 0) {
                    e = ut(e);
                } else {
                    break;
                }
            }
        }
        if (n !== void 0 && !s.call(n, "value")) {
            let e = this.W(t, r, n);
            if (e == null) {
                e = (n.get?.getObserver)?.(t);
            }
            return e == null ? n.configurable ? this.q.getObserver(t, r, n, this) : this.H.createProperty(t, r) : e;
        }
        return new SetterObserver(t, r);
    }
    W(t, e, r) {
        if (this.$.length > 0) {
            for (const s of this.$) {
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
    let r;
    if (e.isArray(t)) {
        r = T(t);
    } else if (e.isMap(t)) {
        r = F(t);
    } else if (e.isSet(t)) {
        r = j(t);
    }
    return r;
};

const ut = Object.getPrototypeOf;

const lt = Object.getOwnPropertyDescriptor;

const getObserverLookup = t => {
    let r = t.$observers;
    if (r === void 0) {
        n(t, "$observers", {
            enumerable: false,
            value: r = e.createLookup()
        });
    }
    return r;
};

const ht = /*@__PURE__*/ c("IObservation", t => t.singleton(Observation));

class Observation {
    constructor() {
        this.oL = e.resolve(ot);
        this.K = e.resolve(t.IExpressionParser);
    }
    run(t) {
        const e = new RunEffect(this.oL, t);
        e.run();
        return e;
    }
    watch(t, r, s, n) {
        let i = undefined;
        let o = false;
        let a;
        const c = this.oL.getObserver(t, r);
        const handleChange = (t, r) => {
            a?.();
            a = void 0;
            const n = s(t, i = r);
            if (e.isFunction(n)) {
                a = n;
            }
        };
        const u = {
            handleChange: handleChange
        };
        const run = () => {
            if (o) return;
            o = true;
            c.subscribe(u);
            handleChange(c.getValue(), i);
        };
        const stop = () => {
            if (!o) return;
            o = false;
            c.unsubscribe(u);
            a?.();
            a = void 0;
        };
        if (n?.immediate !== false) {
            run();
        }
        return {
            run: run,
            stop: stop
        };
    }
    watchExpression(t, r, s, n) {
        let i = false;
        let o;
        const handleChange = (t, r) => {
            o?.();
            o = void 0;
            const n = s(t, r);
            if (e.isFunction(n)) {
                o = n;
            }
        };
        const a = new ExpressionObserver(Scope.create(t), this.oL, this.K.parse(r, "IsProperty"), handleChange);
        const run = () => {
            if (i) return;
            i = true;
            a.run();
        };
        const stop = () => {
            if (!i) return;
            i = false;
            a.stop();
            o?.();
            o = void 0;
        };
        if (n?.immediate !== false) {
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
        this.G = undefined;
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
                this.G?.call(void 0);
                enterConnectable(this);
                this.G = this.fn(this);
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
            this.G?.call(void 0);
            this.G = void 0;
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
        const r = f(this.ast, this.s, this, this);
        this.obs.clear();
        if (!e.areEqual(r, t)) {
            this.v = r;
            this.cb.call(void 0, r, t);
        }
    }
    stop() {
        this.obs.clearAll();
        this.v = void 0;
    }
}

(() => {
    connectable(ExpressionObserver, null);
    w(ExpressionObserver);
})();

const ft = /*@__PURE__*/ (() => {
    function getObserversLookup(t) {
        if (t.$observers === void 0) {
            n(t, "$observers", {
                value: {}
            });
        }
        return t.$observers;
    }
    const t = {};
    function observable(r, s) {
        if (!SetterNotifier.mixed) {
            SetterNotifier.mixed = true;
            B(SetterNotifier, null);
        }
        let i = false;
        let o;
        if (typeof r === "object") {
            o = r;
        } else if (r != null) {
            o = {
                name: r
            };
            i = true;
        } else {
            o = e.emptyObject;
        }
        if (arguments.length === 0) {
            return function(t, e) {
                if (e.kind !== "field") throw createMappedError(224);
                return createFieldInitializer(e);
            };
        }
        if (s?.kind === "field") return createFieldInitializer(s);
        if (i) {
            return function(e, r) {
                createDescriptor(e, o.name, () => t, true);
            };
        }
        return function(e, r) {
            switch (r.kind) {
              case "field":
                return createFieldInitializer(r);

              case "class":
                return createDescriptor(e, o.name, () => t, true);

              default:
                throw createMappedError(224);
            }
        };
        function createFieldInitializer(t) {
            let e;
            t.addInitializer(function() {
                createDescriptor(this, t.name, () => e, false);
            });
            return function(t) {
                return e = t;
            };
        }
        function createDescriptor(t, e, r, s) {
            const i = o.callback || `${a(e)}Changed`;
            const c = o.set;
            const observableGetter = function() {
                const t = getNotifier(this, e, i, r, c);
                currentConnectable()?.subscribeTo(t);
                return t.getValue();
            };
            observableGetter.getObserver = function(t) {
                return getNotifier(t, e, i, r, c);
            };
            const u = {
                enumerable: true,
                configurable: true,
                get: observableGetter,
                set(t) {
                    getNotifier(this, e, i, r, c).setValue(t);
                }
            };
            if (s) n(t.prototype, e, u); else n(t, e, u);
        }
    }
    function getNotifier(e, r, s, n, i) {
        const o = getObserversLookup(e);
        let a = o[r];
        if (a == null) {
            const c = n();
            a = new SetterNotifier(e, s, i, c === t ? void 0 : c);
            o[r] = a;
        }
        return a;
    }
    class SetterNotifier {
        constructor(t, r, s, n) {
            this.type = _;
            this.v = void 0;
            this.ov = void 0;
            this.o = t;
            this.S = s;
            this.hs = e.isFunction(s);
            const i = t[r];
            this.cb = e.isFunction(i) ? i : void 0;
            this.v = n;
        }
        getValue() {
            return this.v;
        }
        setValue(t) {
            if (this.hs) {
                t = this.S(t);
            }
            if (!e.areEqual(t, this.v)) {
                this.ov = this.v;
                this.v = t;
                this.subs.notifyDirty();
                this.subs.notify(this.v, this.ov);
                if (e.areEqual(t, this.v)) {
                    this.cb?.call(this.o, this.v, this.ov);
                }
            }
        }
    }
    SetterNotifier.mixed = false;
    return observable;
})();

function nowrap(t, e) {
    return arguments.length === 0 ? decorator : decorator(t, e);
    function decorator(t, e) {
        switch (e.kind) {
          case "class":
            rtDefineHiddenProp(t, J, true);
            break;

          case "field":
            e.addInitializer(function() {
                const t = this.constructor;
                const r = `${Q}_${a(e.name)}__`;
                if (r in t) return;
                rtDefineHiddenProp(t, r, true);
            });
            break;
        }
    }
}

exports.AccessorType = L;

exports.BindingContext = BindingContext;

exports.CollectionLengthObserver = CollectionLengthObserver;

exports.CollectionSizeObserver = CollectionSizeObserver;

exports.ComputedObserver = ComputedObserver;

exports.ConnectableSwitcher = q;

exports.DirtyCheckProperty = DirtyCheckProperty;

exports.DirtyCheckSettings = nt;

exports.DirtyChecker = DirtyChecker;

exports.ICoercionConfiguration = R;

exports.IComputedObserverLocator = ct;

exports.IDirtyChecker = st;

exports.INodeObserverLocator = at;

exports.IObservation = ht;

exports.IObserverLocator = ot;

exports.Observation = Observation;

exports.ObserverLocator = ObserverLocator;

exports.PrimitiveObserver = PrimitiveObserver;

exports.PropertyAccessor = PropertyAccessor;

exports.ProxyObservable = et;

exports.Scope = Scope;

exports.SetterObserver = SetterObserver;

exports.Task = Task;

exports.TaskAbortError = TaskAbortError;

exports.astAssign = h;

exports.astBind = d;

exports.astEvaluate = f;

exports.astUnbind = p;

exports.batch = batch;

exports.cloneIndexMap = cloneIndexMap;

exports.computed = computed;

exports.connectable = connectable;

exports.copyIndexMap = copyIndexMap;

exports.createIndexMap = createIndexMap;

exports.getCollectionObserver = getCollectionObserver;

exports.getObserverLookup = getObserverLookup;

exports.isIndexMap = isIndexMap;

exports.mixinNoopAstEvaluator = w;

exports.nowrap = nowrap;

exports.observable = ft;

exports.queueAsyncTask = queueAsyncTask;

exports.queueTask = queueTask;

exports.runTasks = runTasks;

exports.subscriberCollection = B;

exports.tasksSettled = tasksSettled;
//# sourceMappingURL=index.cjs.map
