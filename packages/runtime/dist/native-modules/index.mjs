import { DestructuringAssignmentSingleExpression as t, IExpressionParser as e } from "../../../expression-parser/dist/native-modules/index.mjs";

import { DI as r, isObjectOrFunction as s, isFunction as n, isArray as i, isArrayIndex as o, noop as a, isSet as c, isMap as u, areEqual as h, isSymbol as l, Registration as f, resolve as d, IPlatform as p, isObject as w, createLookup as v, emptyObject as b } from "../../../kernel/dist/native-modules/index.mjs";

import { Metadata as g } from "../../../metadata/dist/native-modules/index.mjs";

import { Platform as y } from "../../../platform/dist/native-modules/index.mjs";

const C = Object.prototype.hasOwnProperty;

const E = Reflect.defineProperty;

function rtDefineHiddenProp(t, e, r) {
    E(t, e, {
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

const A = Object.assign;

const O = Object.freeze;

const m = String;

const S = r.createInterface;

const k = g.get;

const P = g.define;

const createMappedError = (t, ...e) => new Error(`AUR${m(t).padStart(4, "0")}:${e.map(m)}`);

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

const {astAssign: R, astEvaluate: x, astBind: I, astUnbind: _} = /*@__PURE__*/ (() => {
    const e = "AccessThis";
    const r = "AccessBoundary";
    const a = "AccessGlobal";
    const c = "AccessScope";
    const u = "ArrayLiteral";
    const h = "ObjectLiteral";
    const l = "PrimitiveLiteral";
    const f = "New";
    const d = "Template";
    const p = "Unary";
    const w = "CallScope";
    const v = "CallMember";
    const b = "CallFunction";
    const g = "CallGlobal";
    const y = "AccessMember";
    const C = "AccessKeyed";
    const E = "TaggedTemplate";
    const A = "Binary";
    const O = "Conditional";
    const S = "Assign";
    const k = "ArrowFunction";
    const P = "ValueConverter";
    const R = "BindingBehavior";
    const x = "ArrayBindingPattern";
    const I = "ObjectBindingPattern";
    const _ = "BindingIdentifier";
    const M = "ForOfStatement";
    const D = "Interpolation";
    const T = "ArrayDestructuring";
    const L = "ObjectDestructuring";
    const N = "DestructuringAssignmentLeaf";
    const V = "Custom";
    const B = Scope.getContext;
    function astEvaluate(t, o, F, H) {
        switch (t.$kind) {
          case e:
            {
                let e = o.overrideContext;
                let r = o;
                let s = t.ancestor;
                while (s-- && e) {
                    r = r.parent;
                    e = r?.overrideContext ?? null;
                }
                return s < 1 && r ? r.bindingContext : void 0;
            }

          case r:
            {
                let t = o;
                while (t != null && !t.isBoundary) {
                    t = t.parent;
                }
                return t ? t.bindingContext : void 0;
            }

          case c:
            {
                const e = B(o, t.name, t.ancestor);
                if (H !== null) {
                    H.observe(e, t.name);
                }
                const r = e[t.name];
                if (r == null) {
                    if (t.name === "$host") {
                        throw createMappedError(105);
                    }
                    return r;
                }
                return F?.boundFn && n(r) ? r.bind(e) : r;
            }

          case a:
            return globalThis[t.name];

          case g:
            {
                const e = globalThis[t.name];
                if (n(e)) {
                    return e(...t.args.map(t => astEvaluate(t, o, F, H)));
                }
                if (!F?.strict && e == null) {
                    return void 0;
                }
                throw createMappedError(107);
            }

          case u:
            return t.elements.map(t => astEvaluate(t, o, F, H));

          case h:
            {
                const e = {};
                for (let r = 0; r < t.keys.length; ++r) {
                    e[t.keys[r]] = astEvaluate(t.values[r], o, F, H);
                }
                return e;
            }

          case l:
            return t.value;

          case f:
            {
                const e = astEvaluate(t.func, o, F, H);
                if (n(e)) {
                    return new e(...t.args.map(t => astEvaluate(t, o, F, H)));
                }
                throw createMappedError(107);
            }

          case d:
            {
                let e = t.cooked[0];
                for (let r = 0; r < t.expressions.length; ++r) {
                    e += m(astEvaluate(t.expressions[r], o, F, H));
                    e += t.cooked[r + 1];
                }
                return e;
            }

          case p:
            {
                const e = astEvaluate(t.expression, o, F, H);
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
                    if (H != null) throw createMappedError(113);
                    return astAssign(t.expression, o, F, H, e - 1) + t.pos;

                  case "++":
                    if (H != null) throw createMappedError(113);
                    return astAssign(t.expression, o, F, H, e + 1) - t.pos;

                  default:
                    throw createMappedError(109, t.operation);
                }
            }

          case w:
            {
                const e = B(o, t.name, t.ancestor);
                if (e == null) {
                    if (F?.strict) {
                        throw createMappedError(114, t.name, e);
                    }
                    return void 0;
                }
                const r = e[t.name];
                if (n(r)) {
                    return r.apply(e, t.args.map(t => astEvaluate(t, o, F, H)));
                }
                if (r == null) {
                    if (F?.strict && !t.optional) {
                        throw createMappedError(111, t.name);
                    }
                    return void 0;
                }
                throw createMappedError(111, t.name);
            }

          case v:
            {
                const e = astEvaluate(t.object, o, F, H);
                if (e == null) {
                    if (F?.strict && !t.optionalMember) {
                        throw createMappedError(114, t.name, e);
                    }
                }
                const r = e?.[t.name];
                if (r == null) {
                    if (!t.optionalCall && F?.strict) {
                        throw createMappedError(111, t.name);
                    }
                    return void 0;
                }
                if (!n(r)) {
                    throw createMappedError(111, t.name);
                }
                const s = r.apply(e, t.args.map(t => astEvaluate(t, o, F, H)));
                if (i(e) && j.includes(t.name)) {
                    H?.observeCollection(e);
                }
                return s;
            }

          case b:
            {
                const e = astEvaluate(t.func, o, F, H);
                if (n(e)) {
                    return e(...t.args.map(t => astEvaluate(t, o, F, H)));
                }
                if (e == null) {
                    if (!t.optional && F?.strict) {
                        throw createMappedError(107);
                    }
                    return void 0;
                }
                throw createMappedError(107);
            }

          case k:
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
                    const a = Scope.fromParent(o, i);
                    return astEvaluate(t.body, a, F, H);
                };
                return func;
            }

          case y:
            {
                const e = astEvaluate(t.object, o, F, H);
                if (e == null) {
                    if (!t.optional && F?.strict) {
                        throw createMappedError(114, t.name, e);
                    }
                    return void 0;
                }
                if (H !== null && !t.accessGlobal) {
                    H.observe(e, t.name);
                }
                const r = e[t.name];
                return F?.boundFn && n(r) ? r.bind(e) : r;
            }

          case C:
            {
                const e = astEvaluate(t.object, o, F, H);
                const r = astEvaluate(t.key, o, F, H);
                if (e == null) {
                    if (!t.optional && F?.strict) {
                        throw createMappedError(115, r, e);
                    }
                    return void 0;
                }
                if (H !== null && !t.accessGlobal) {
                    H.observe(e, r);
                }
                return e[r];
            }

          case E:
            {
                const e = t.expressions.map(t => astEvaluate(t, o, F, H));
                const r = astEvaluate(t.func, o, F, H);
                if (!n(r)) {
                    throw createMappedError(110);
                }
                return r(t.cooked, ...e);
            }

          case A:
            {
                const e = t.left;
                const r = t.right;
                switch (t.operation) {
                  case "&&":
                    return astEvaluate(e, o, F, H) && astEvaluate(r, o, F, H);

                  case "||":
                    return astEvaluate(e, o, F, H) || astEvaluate(r, o, F, H);

                  case "??":
                    return astEvaluate(e, o, F, H) ?? astEvaluate(r, o, F, H);

                  case "==":
                    return astEvaluate(e, o, F, H) == astEvaluate(r, o, F, H);

                  case "===":
                    return astEvaluate(e, o, F, H) === astEvaluate(r, o, F, H);

                  case "!=":
                    return astEvaluate(e, o, F, H) != astEvaluate(r, o, F, H);

                  case "!==":
                    return astEvaluate(e, o, F, H) !== astEvaluate(r, o, F, H);

                  case "instanceof":
                    {
                        const t = astEvaluate(r, o, F, H);
                        if (n(t)) {
                            return astEvaluate(e, o, F, H) instanceof t;
                        }
                        return false;
                    }

                  case "in":
                    {
                        const t = astEvaluate(r, o, F, H);
                        if (s(t)) {
                            return astEvaluate(e, o, F, H) in t;
                        }
                        return false;
                    }

                  case "+":
                    return astEvaluate(e, o, F, H) + astEvaluate(r, o, F, H);

                  case "-":
                    return astEvaluate(e, o, F, H) - astEvaluate(r, o, F, H);

                  case "*":
                    return astEvaluate(e, o, F, H) * astEvaluate(r, o, F, H);

                  case "/":
                    return astEvaluate(e, o, F, H) / astEvaluate(r, o, F, H);

                  case "%":
                    return astEvaluate(e, o, F, H) % astEvaluate(r, o, F, H);

                  case "**":
                    return astEvaluate(e, o, F, H) ** astEvaluate(r, o, F, H);

                  case "<":
                    return astEvaluate(e, o, F, H) < astEvaluate(r, o, F, H);

                  case ">":
                    return astEvaluate(e, o, F, H) > astEvaluate(r, o, F, H);

                  case "<=":
                    return astEvaluate(e, o, F, H) <= astEvaluate(r, o, F, H);

                  case ">=":
                    return astEvaluate(e, o, F, H) >= astEvaluate(r, o, F, H);

                  default:
                    throw createMappedError(108, t.operation);
                }
            }

          case O:
            return astEvaluate(t.condition, o, F, H) ? astEvaluate(t.yes, o, F, H) : astEvaluate(t.no, o, F, H);

          case S:
            {
                let e = astEvaluate(t.value, o, F, H);
                if (t.op !== "=") {
                    if (H != null) {
                        throw createMappedError(113);
                    }
                    const r = astEvaluate(t.target, o, F, H);
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
                return astAssign(t.target, o, F, H, e);
            }

          case P:
            {
                return F?.useConverter?.(t.name, "toView", astEvaluate(t.expression, o, F, H), t.args.map(t => astEvaluate(t, o, F, H)));
            }

          case R:
            return astEvaluate(t.expression, o, F, H);

          case _:
            return t.name;

          case M:
            return astEvaluate(t.iterable, o, F, H);

          case D:
            if (t.isMulti) {
                let e = t.parts[0];
                let r = 0;
                for (;r < t.expressions.length; ++r) {
                    e += m(astEvaluate(t.expressions[r], o, F, H));
                    e += t.parts[r + 1];
                }
                return e;
            } else {
                return `${t.parts[0]}${astEvaluate(t.firstExpression, o, F, H)}${t.parts[1]}`;
            }

          case N:
            return astEvaluate(t.target, o, F, H);

          case T:
            {
                return t.list.map(t => astEvaluate(t, o, F, H));
            }

          case x:
          case I:
          case L:
          default:
            return void 0;

          case V:
            return t.evaluate(o, F, H);
        }
    }
    function astAssign(e, r, n, a, u) {
        switch (e.$kind) {
          case c:
            {
                if (e.name === "$host") {
                    throw createMappedError(106);
                }
                const t = B(r, e.name, e.ancestor);
                return t[e.name] = u;
            }

          case y:
            {
                const t = astEvaluate(e.object, r, n, a);
                if (t == null) {
                    if (n?.strict) {
                        throw createMappedError(116, e.name);
                    }
                    astAssign(e.object, r, n, a, {
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
                const t = astEvaluate(e.object, r, n, a);
                const s = astEvaluate(e.key, r, n, a);
                if (t == null) {
                    if (n?.strict) {
                        throw createMappedError(116, s);
                    }
                    astAssign(e.object, r, n, a, {
                        [s]: u
                    });
                    return u;
                }
                if (i(t)) {
                    if (s === "length" && !isNaN(u)) {
                        t.splice(u);
                        return u;
                    }
                    if (o(s)) {
                        t.splice(s, 1, u);
                        return u;
                    }
                }
                return t[s] = u;
            }

          case S:
            astAssign(e.value, r, n, a, u);
            return astAssign(e.target, r, n, a, u);

          case P:
            {
                u = n?.useConverter?.(e.name, "fromView", u, e.args.map(t => astEvaluate(t, r, n, a)));
                return astAssign(e.expression, r, n, a, u);
            }

          case R:
            return astAssign(e.expression, r, n, a, u);

          case T:
          case L:
            {
                const t = e.list;
                const s = t.length;
                let i;
                let o;
                for (i = 0; i < s; i++) {
                    o = t[i];
                    switch (o.$kind) {
                      case N:
                        astAssign(o, r, n, a, u);
                        break;

                      case T:
                      case L:
                        {
                            if (typeof u !== "object" || u === null) {
                                throw createMappedError(112);
                            }
                            let t = astEvaluate(o.source, Scope.create(u), n, null);
                            if (t === void 0 && o.initializer) {
                                t = astEvaluate(o.initializer, r, n, null);
                            }
                            astAssign(o, r, n, a, t);
                            break;
                        }
                    }
                }
                break;
            }

          case N:
            {
                if (e instanceof t) {
                    if (u == null) {
                        return;
                    }
                    if (typeof u !== "object") {
                        throw createMappedError(112);
                    }
                    let t = astEvaluate(e.source, Scope.create(u), n, a);
                    if (t === void 0 && e.initializer) {
                        t = astEvaluate(e.initializer, r, n, a);
                    }
                    astAssign(e.target, r, n, a, t);
                } else {
                    if (u == null) {
                        return;
                    }
                    if (typeof u !== "object") {
                        throw createMappedError(112);
                    }
                    const t = e.indexOrProperties;
                    let s;
                    if (o(t)) {
                        if (!Array.isArray(u)) {
                            throw createMappedError(112);
                        }
                        s = u.slice(t);
                    } else {
                        s = Object.entries(u).reduce((e, [r, s]) => {
                            if (!t.includes(r)) {
                                e[r] = s;
                            }
                            return e;
                        }, {});
                    }
                    astAssign(e.target, r, n, a, s);
                }
                break;
            }

          case V:
            return e.assign(r, n, u);

          default:
            return void 0;
        }
    }
    function astBind(t, e, r) {
        switch (t.$kind) {
          case R:
            {
                r.bindBehavior?.(t.name, e, t.args.map(t => astEvaluate(t, e, r, null)));
                astBind(t.expression, e, r);
                break;
            }

          case P:
            {
                r.bindConverter?.(t.name);
                astBind(t.expression, e, r);
                break;
            }

          case M:
            {
                astBind(t.iterable, e, r);
                break;
            }

          case V:
            {
                t.bind?.(e, r);
            }
        }
    }
    function astUnbind(t, e, r) {
        switch (t.$kind) {
          case R:
            {
                r.unbindBehavior?.(t.name, e);
                astUnbind(t.expression, e, r);
                break;
            }

          case P:
            {
                r.unbindConverter?.(t.name);
                astUnbind(t.expression, e, r);
                break;
            }

          case M:
            {
                astUnbind(t.iterable, e, r);
                break;
            }

          case V:
            {
                t.unbind?.(e, r);
            }
        }
    }
    const j = "at map filter includes indexOf lastIndexOf findIndex find flat flatMap join reduce reduceRight slice every some sort".split(" ");
    return {
        astEvaluate: astEvaluate,
        astAssign: astAssign,
        astBind: astBind,
        astUnbind: astUnbind
    };
})();

const M = (() => t => {
    const e = t.prototype;
    [ "bindBehavior", "unbindBehavior", "bindConverter", "unbindConverter", "useConverter" ].forEach(t => {
        rtDefineHiddenProp(e, t, () => {
            throw createMappedError(99, t);
        });
    });
})();

const D = "pending";

const T = "running";

const L = "completed";

const N = "canceled";

const V = Promise.resolve();

let B = false;

let j = false;

const F = [];

const H = [];

let $ = 0;

let z = null;

let U = [];

let W = null;

let q = null;

const requestRun = () => {
    if (!B) {
        B = true;
        void V.then(() => {
            B = false;
            j = true;
            runTasks();
        });
    }
};

const signalSettled = t => {
    if (z && F.length === 0 && $ === 0) {
        z = null;
        if (U.length > 0) {
            const t = U;
            U = [];
            if (t.length === 1) {
                q(t[0]);
            } else {
                q(new AggregateError(t, "One or more tasks failed."));
            }
        } else {
            W(t);
        }
    }
};

const runTasks = () => {
    const t = !j;
    j = false;
    z ??= new Promise((t, e) => {
        W = t;
        q = e;
    });
    let e = -F.length;
    const r = F.length === 0;
    while (F.length > 0) {
        if (++e > 1e4) {
            const t = new Error(`Potential deadlock detected. More than 10000 extra tasks were queued from within tasks.`);
            F.length = 0;
            q?.(t);
            z = null;
            throw t;
        }
        const t = F.shift();
        if (typeof t === "function") {
            try {
                t();
            } catch (t) {
                U.push(t);
            }
        } else {
            t.run();
        }
    }
    const s = U.slice();
    signalSettled(!r);
    if (t && s.length > 0) {
        if (s.length === 1) {
            throw s[0];
        } else {
            throw new AggregateError(s, "One or more tasks failed.");
        }
    }
};

const getRecurringTasks = () => H.slice();

const tasksSettled = () => {
    if (z) {
        return z;
    }
    if (F.length > 0 || $ > 0) {
        return z ??= new Promise((t, e) => {
            W = t;
            q = e;
        });
    }
    return V.then(() => {
        if (F.length > 0 || $ > 0) {
            return z ??= new Promise((t, e) => {
                W = t;
                q = e;
            });
        }
        return false;
    });
};

const queueTask = t => {
    requestRun();
    F.push(t);
};

const queueAsyncTask = (t, e) => {
    const r = new Task(t, e?.delay);
    if (r.delay != null && r.delay > 0) {
        ++$;
        r.t = y.getOrCreate(globalThis).setTimeout(() => {
            --$;
            r.t = undefined;
            if (r.status === N) {
                signalSettled(true);
                return;
            }
            F.push(r);
            requestRun();
        }, r.delay);
    } else {
        F.push(r);
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
        this.u = D;
        this.i = new Promise((t, e) => {
            this.C = t;
            this.A = e;
        });
    }
    then(t, e) {
        return this.result.then(t, e);
    }
    catch(t) {
        return this.result.catch(t);
    }
    finally(t) {
        return this.result.finally(t);
    }
    run() {
        if (this.u !== D) {
            throw new Error(`Cannot run task in ${this.u} state`);
        }
        this.u = T;
        let t;
        try {
            t = this.callback();
        } catch (t) {
            this.u = N;
            this.A(t);
            U.push(t);
            return;
        }
        if (t instanceof Promise) {
            ++$;
            t.then(t => {
                this.u = L;
                this.C(t);
            }).catch(t => {
                this.u = N;
                this.A(t);
                U.push(t);
            }).finally(() => {
                --$;
                signalSettled(true);
            });
        } else {
            this.u = L;
            this.C(t);
        }
    }
    cancel() {
        if (this.t !== undefined) {
            y.getOrCreate(globalThis).clearTimeout(this.t);
            --$;
            this.t = undefined;
            this.u = N;
            const t = new TaskAbortError(this);
            this.A(t);
            void this.i.catch(a);
            signalSettled(true);
            return true;
        }
        if (this.u === D) {
            const t = F.indexOf(this);
            if (t > -1) {
                F.splice(t, 1);
                this.u = N;
                const e = new TaskAbortError(this);
                this.A(e);
                void this.i.catch(a);
                signalSettled(true);
                return true;
            }
        }
        return false;
    }
}

Task.h = 0;

const queueRecurringTask = (t, e) => {
    const r = new RecurringTask(t, Math.max(e?.interval ?? 0, 0));
    H.push(r);
    r.O();
    return r;
};

class RecurringTask {
    constructor(t, e) {
        this.cb = t;
        this.P = e;
        this.id = ++RecurringTask.R;
        this.I = false;
        this._ = [];
    }
    run() {
        try {
            this.cb();
        } catch (t) {
            U.push(t);
            return;
        }
    }
    O() {
        if (this.I) {
            return;
        }
        this.t = y.getOrCreate(globalThis).setTimeout(() => {
            this.M();
            if (!this.I) {
                this.O();
            }
        }, this.P);
    }
    M() {
        F.push(this);
        requestRun();
        const t = this._.splice(0);
        for (const e of t) {
            e();
        }
    }
    next() {
        if (this.I) {
            return Promise.resolve();
        }
        return new Promise(t => this._.push(t));
    }
    cancel() {
        this.I = true;
        if (this.t !== undefined) {
            y.getOrCreate(globalThis).clearTimeout(this.t);
            this.t = undefined;
        }
        const t = H.indexOf(this);
        if (t > -1) {
            H.splice(t, 1);
        }
        const e = this._.splice(0);
        for (const t of e) {
            t();
        }
    }
}

RecurringTask.R = 0;

const K = /*@__PURE__*/ r.createInterface("ICoercionConfiguration");

const G = 0;

const J = 1;

const Q = 2;

const X = 4;

const Y = /*@__PURE__*/ O({
    None: G,
    Observer: J,
    Node: Q,
    Layout: X
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

let Z = new Map;

let tt = false;

function batch(t) {
    const e = Z;
    const r = Z = new Map;
    tt = true;
    try {
        t();
    } finally {
        Z = null;
        tt = false;
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
            Z = e;
        }
    }
}

function addCollectionBatch(t, e, r) {
    if (!Z.has(t)) {
        Z.set(t, [ 2, e, r ]);
    } else {
        Z.get(t)[2] = r;
    }
}

function addValueBatch(t, e, r) {
    const s = Z.get(t);
    if (s === void 0) {
        Z.set(t, [ 1, e, r ]);
    } else {
        s[1] = e;
        s[2] = r;
    }
}

const et = /*@__PURE__*/ (() => {
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
            E(r, "subs", {
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
            this.T = [];
            this.L = [];
            this.N = false;
        }
        add(t) {
            if (this.T.includes(t)) {
                return false;
            }
            this.T[this.T.length] = t;
            if ("handleDirty" in t) {
                this.L[this.L.length] = t;
                this.N = true;
            }
            ++this.count;
            return true;
        }
        remove(t) {
            let e = this.T.indexOf(t);
            if (e !== -1) {
                this.T.splice(e, 1);
                e = this.L.indexOf(t);
                if (e !== -1) {
                    this.L.splice(e, 1);
                    this.N = this.L.length > 0;
                }
                --this.count;
                return true;
            }
            return false;
        }
        notify(t, e) {
            if (tt) {
                addValueBatch(this, t, e);
                return;
            }
            for (const r of this.T.slice(0)) {
                r.handleChange(t, e);
            }
        }
        notifyCollection(t, e) {
            const r = this.T.slice(0);
            const s = r.length;
            let n = 0;
            for (;n < s; ++n) {
                r[n].handleCollectionChange(t, e);
            }
            return;
        }
        notifyDirty() {
            if (this.N) {
                for (const t of this.L.slice(0)) {
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
        this.type = J;
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
        this.type = J;
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
    return et(t, null);
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

const rt = /*@__PURE__*/ (() => {
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
        let i, o, a, c, u;
        let h, l;
        for (h = r + 1; h < s; h++) {
            i = t[h];
            o = e[h];
            for (l = h - 1; l >= r; l--) {
                a = t[l];
                c = e[l];
                u = n(a, i);
                if (u > 0) {
                    t[l + 1] = a;
                    e[l + 1] = c;
                } else {
                    break;
                }
            }
            t[l + 1] = i;
            e[l + 1] = o;
        }
    }
    function quickSort(t, e, r, s, n) {
        let i = 0, o = 0;
        let a, c, u;
        let h, l, f;
        let d, p, w;
        let v, b;
        let g, y, C, E;
        let A, O, m, S;
        while (true) {
            if (s - r <= 10) {
                insertionSort(t, e, r, s, n);
                return;
            }
            i = r + (s - r >> 1);
            a = t[r];
            h = e[r];
            c = t[s - 1];
            l = e[s - 1];
            u = t[i];
            f = e[i];
            d = n(a, c);
            if (d > 0) {
                v = a;
                b = h;
                a = c;
                h = l;
                c = v;
                l = b;
            }
            p = n(a, u);
            if (p >= 0) {
                v = a;
                b = h;
                a = u;
                h = f;
                u = c;
                f = l;
                c = v;
                l = b;
            } else {
                w = n(c, u);
                if (w > 0) {
                    v = c;
                    b = l;
                    c = u;
                    l = f;
                    u = v;
                    f = b;
                }
            }
            t[r] = a;
            e[r] = h;
            t[s - 1] = u;
            e[s - 1] = f;
            g = c;
            y = l;
            C = r + 1;
            E = s - 1;
            t[i] = t[C];
            e[i] = e[C];
            t[C] = g;
            e[C] = y;
            t: for (o = C + 1; o < E; o++) {
                A = t[o];
                O = e[o];
                m = n(A, g);
                if (m < 0) {
                    t[o] = t[C];
                    e[o] = e[C];
                    t[C] = A;
                    e[C] = O;
                    C++;
                } else if (m > 0) {
                    do {
                        E--;
                        if (E == o) {
                            break t;
                        }
                        S = t[E];
                        m = n(S, g);
                    } while (m > 0);
                    t[o] = t[E];
                    e[o] = e[E];
                    t[E] = A;
                    e[E] = O;
                    if (m < 0) {
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
    const r = Array.prototype;
    const s = [ "push", "unshift", "pop", "shift", "splice", "reverse", "sort" ];
    let i;
    function overrideArrayPrototypes() {
        const t = r.push;
        const o = r.unshift;
        const a = r.pop;
        const c = r.shift;
        const u = r.splice;
        const h = r.reverse;
        const l = r.sort;
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
                let o = n;
                while (o < this.length) {
                    this[o] = r[o - n];
                    s.indexMap[o] = -2;
                    o++;
                }
                s.notify();
                return this.length;
            },
            unshift: function(...t) {
                const r = e.get(this);
                if (r === void 0) {
                    return o.apply(this, t);
                }
                const s = t.length;
                const n = new Array(s);
                let i = 0;
                while (i < s) {
                    n[i++] = -2;
                }
                o.apply(r.indexMap, n);
                const a = o.apply(this, t);
                r.notify();
                return a;
            },
            pop: function() {
                const t = e.get(this);
                if (t === void 0) {
                    return a.call(this);
                }
                const r = t.indexMap;
                const s = a.call(this);
                const n = r.length - 1;
                if (r[n] > -1) {
                    r.deletedIndices.push(r[n]);
                    r.deletedItems.push(s);
                }
                a.call(r);
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
                const o = r | 0;
                const a = o < 0 ? Math.max(i + o, 0) : Math.min(o, i);
                const c = n.indexMap;
                const h = t.length;
                const l = h === 0 ? 0 : h === 1 ? i - a : s;
                let f = a;
                if (l > 0) {
                    const t = f + l;
                    while (f < t) {
                        if (c[f] > -1) {
                            c.deletedIndices.push(c[f]);
                            c.deletedItems.push(this[f]);
                        }
                        f++;
                    }
                }
                f = 0;
                if (h > 2) {
                    const t = h - 2;
                    const e = new Array(t);
                    while (f < t) {
                        e[f++] = -2;
                    }
                    u.call(c, r, s, ...e);
                } else {
                    u.apply(c, t);
                }
                const d = u.apply(this, t);
                if (l > 0 || f > 0) {
                    n.notify();
                }
                return d;
            },
            reverse: function() {
                const t = e.get(this);
                if (t === void 0) {
                    h.call(this);
                    return this;
                }
                const r = this.length;
                const s = r / 2 | 0;
                let n = 0;
                while (n !== s) {
                    const e = r - n - 1;
                    const s = this[n];
                    const i = t.indexMap[n];
                    const o = this[e];
                    const a = t.indexMap[e];
                    this[n] = o;
                    t.indexMap[n] = a;
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
                    l.call(this, t);
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
                let o = false;
                for (i = 0, s = r.indexMap.length; s > i; ++i) {
                    if (r.indexMap[i] !== i) {
                        o = true;
                        break;
                    }
                }
                if (o || tt) {
                    r.notify();
                }
                return this;
            }
        };
        for (const t of s) {
            E(i[t], "observing", {
                value: true
            });
        }
    }
    let o = false;
    const a = "__au_arr_on__";
    function enableArrayObservation() {
        if (i === undefined) {
            overrideArrayPrototypes();
        }
        if (!(k(a, Array) ?? false)) {
            P(true, Array, a);
            for (const t of s) {
                if (r[t].observing !== true) {
                    rtDefineHiddenProp(r, t, i[t]);
                }
            }
        }
    }
    class ArrayObserverImpl {
        constructor(t) {
            this.type = J;
            if (!o) {
                o = true;
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
            if (tt) {
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
        et(ArrayObserverImpl, null);
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
        et(ArrayIndexObserverImpl, null);
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

const st = /*@__PURE__*/ (() => {
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
            this.type = J;
            this.collection = t;
            this.indexMap = createIndexMap(t.size);
            this.lenObs = void 0;
        }
        notify() {
            const t = this.subs;
            t.notifyDirty();
            const e = this.indexMap;
            if (tt) {
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
    et(SetObserverImpl, null);
    return function getSetObserver(t) {
        let r = e.get(t);
        if (r === void 0) {
            e.set(t, r = new SetObserverImpl(t));
            enableSetObservation(t);
        }
        return r;
    };
})();

const nt = /*@__PURE__*/ (() => {
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
            this.type = J;
            this.collection = t;
            this.indexMap = createIndexMap(t.size);
            this.lenObs = void 0;
        }
        notify() {
            const t = this.subs;
            t.notifyDirty();
            const e = this.indexMap;
            if (tt) {
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
    et(MapObserverImpl, null);
    return function getMapObserver(t) {
        let r = e.get(t);
        if (r === void 0) {
            e.set(t, r = new MapObserverImpl(t));
            enableMapObservation(t);
        }
        return r;
    };
})();

const it = /*@__PURE__*/ (() => {
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
            e = rt(t);
        } else if (c(t)) {
            e = st(t);
        } else if (u(t)) {
            e = nt(t);
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
        E(r, "obs", {
            get: getObserverRecord
        });
        ensureProto(r, "handleChange", noopHandleChange);
        ensureProto(r, "handleCollectionChange", noopHandleCollectionChange);
        return t;
    };
})();

function connectable(t, e) {
    return t == null ? it : it(t, e);
}

let ot = null;

const at = [];

let ct = false;

function pauseConnecting() {
    ct = false;
}

function resumeConnecting() {
    ct = true;
}

function currentConnectable() {
    return ot;
}

function enterConnectable(t) {
    if (t == null) {
        throw createMappedError(206);
    }
    if (ot == null) {
        ot = t;
        at[0] = ot;
        ct = true;
        return;
    }
    if (ot === t) {
        throw createMappedError(207);
    }
    at.push(t);
    ot = t;
    ct = true;
}

function exitConnectable(t) {
    if (t == null) {
        throw createMappedError(208);
    }
    if (ot !== t) {
        throw createMappedError(209);
    }
    at.pop();
    ot = at.length > 0 ? at[at.length - 1] : null;
    ct = ot != null;
}

const ut = /*@__PURE__*/ O({
    get current() {
        return ot;
    },
    get connecting() {
        return ct;
    },
    enter: enterConnectable,
    exit: exitConnectable,
    pause: pauseConnecting,
    resume: resumeConnecting
});

const ht = Reflect.get;

const lt = Object.prototype.toString;

const ft = new WeakMap;

const dt = "__au_nw__";

const pt = "__au_nw";

function canWrap(t) {
    switch (lt.call(t)) {
      case "[object Object]":
        return t.constructor[dt] !== true;

      case "[object Array]":
      case "[object Map]":
      case "[object Set]":
        return true;

      default:
        return false;
    }
}

const wt = "__raw__";

function wrap(t) {
    return canWrap(t) ? getProxy(t) : t;
}

function getProxy(t) {
    return ft.get(t) ?? createProxy(t);
}

function getRaw(t) {
    return t[wt] ?? t;
}

function unwrap(t) {
    return canWrap(t) && t[wt] || t;
}

function doNotCollect(t, e) {
    if (e === "constructor" || e === "__proto__" || e === "$observers" || e === Symbol.toPrimitive || e === Symbol.toStringTag || t.constructor[`${pt}_${m(e)}__`] === true) {
        return true;
    }
    const r = Reflect.getOwnPropertyDescriptor(t, e);
    return r?.configurable === false && r.writable === false;
}

function createProxy(t) {
    const e = i(t) ? bt : u(t) || c(t) ? gt : vt;
    const r = new Proxy(t, e);
    ft.set(t, r);
    ft.set(r, r);
    return r;
}

const vt = {
    get(t, e, r) {
        if (e === wt) {
            return t;
        }
        const s = currentConnectable();
        if (!ct || doNotCollect(t, e) || s == null) {
            return ht(t, e, r);
        }
        s.observe(t, e);
        return wrap(ht(t, e, r));
    },
    deleteProperty(t, e) {
        return delete t[e];
    }
};

const bt = {
    get(t, e, r) {
        if (e === wt) {
            return t;
        }
        if (!ct || doNotCollect(t, e) || ot == null) {
            return ht(t, e, r);
        }
        switch (e) {
          case "length":
            ot.observe(t, "length");
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
        ot.observe(t, e);
        return wrap(ht(t, e, r));
    },
    ownKeys(t) {
        currentConnectable()?.observe(t, "length");
        return Reflect.ownKeys(t);
    }
};

function wrappedArrayMap(t, e) {
    const r = getRaw(this);
    const s = r.map((r, s) => unwrap(t.call(e, wrap(r), s, this)));
    observeCollection(ot, r);
    return wrap(s);
}

function wrappedArrayEvery(t, e) {
    const r = getRaw(this);
    const s = r.every((r, s) => t.call(e, wrap(r), s, this));
    observeCollection(ot, r);
    return s;
}

function wrappedArrayFilter(t, e) {
    const r = getRaw(this);
    const s = r.filter((r, s) => unwrap(t.call(e, wrap(r), s, this)));
    observeCollection(ot, r);
    return wrap(s);
}

function wrappedArrayIncludes(t) {
    const e = getRaw(this);
    const r = e.includes(unwrap(t));
    observeCollection(ot, e);
    return r;
}

function wrappedArrayIndexOf(t) {
    const e = getRaw(this);
    const r = e.indexOf(unwrap(t));
    observeCollection(ot, e);
    return r;
}

function wrappedArrayLastIndexOf(t) {
    const e = getRaw(this);
    const r = e.lastIndexOf(unwrap(t));
    observeCollection(ot, e);
    return r;
}

function wrappedArrayFindIndex(t, e) {
    const r = getRaw(this);
    const s = r.findIndex((r, s) => unwrap(t.call(e, wrap(r), s, this)));
    observeCollection(ot, r);
    return s;
}

function wrappedArrayFind(t, e) {
    const r = getRaw(this);
    const s = r.find((e, r) => t(wrap(e), r, this), e);
    observeCollection(ot, r);
    return wrap(s);
}

function wrappedArrayFlat() {
    const t = getRaw(this);
    observeCollection(ot, t);
    return wrap(t.flat());
}

function wrappedArrayFlatMap(t, e) {
    const r = getRaw(this);
    observeCollection(ot, r);
    return getProxy(r.flatMap((r, s) => wrap(t.call(e, wrap(r), s, this))));
}

function wrappedArrayJoin(t) {
    const e = getRaw(this);
    observeCollection(ot, e);
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
    observeCollection(ot, r);
    return s;
}

function wrappedArraySort(t) {
    const e = getRaw(this);
    const r = e.sort(t);
    observeCollection(ot, e);
    return wrap(r);
}

function wrappedArraySlice(t, e) {
    const r = getRaw(this);
    observeCollection(ot, r);
    return getProxy(r.slice(t, e));
}

function wrappedReduce(t, e) {
    const r = getRaw(this);
    const s = r.reduce((e, r, s) => t(e, wrap(r), s, this), e);
    observeCollection(ot, r);
    return wrap(s);
}

function wrappedReduceRight(t, e) {
    const r = getRaw(this);
    const s = r.reduceRight((e, r, s) => t(e, wrap(r), s, this), e);
    observeCollection(ot, r);
    return wrap(s);
}

const gt = {
    get(t, e, r) {
        if (e === wt) {
            return t;
        }
        const s = currentConnectable();
        if (!ct || doNotCollect(t, e) || s == null) {
            return ht(t, e, r);
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
            if (c(t)) {
                return wrappedAdd;
            }
            break;

          case "get":
            if (u(t)) {
                return wrappedGet;
            }
            break;

          case "set":
            if (u(t)) {
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
            return u(t) ? wrappedEntries : wrappedValues;
        }
        return wrap(ht(t, e, r));
    }
};

function wrappedForEach(t, e) {
    const r = getRaw(this);
    observeCollection(ot, r);
    return r.forEach((r, s) => {
        t.call(e, wrap(r), wrap(s), this);
    });
}

function wrappedHas(t) {
    const e = getRaw(this);
    observeCollection(ot, e);
    return e.has(unwrap(t));
}

function wrappedGet(t) {
    const e = getRaw(this);
    observeCollection(ot, e);
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
    observeCollection(ot, t);
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
    observeCollection(ot, t);
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
    observeCollection(ot, t);
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

const yt = /*@__PURE__*/ O({
    getProxy: getProxy,
    getRaw: getRaw,
    wrap: wrap,
    unwrap: unwrap,
    rawKey: wt
});

class ComputedObserver {
    constructor(t, e, r, s, n = "async") {
        this.type = J;
        this.ov = void 0;
        this.v = void 0;
        this.V = false;
        this.B = false;
        this.D = false;
        this.cb = void 0;
        this.j = void 0;
        this.F = void 0;
        this.o = t;
        this.H = wrap(t);
        this.$get = e;
        this.$set = r;
        this.oL = s;
        this.$ = n;
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
            this.V = false;
        }
        return this.v;
    }
    setValue(t) {
        if (n(this.$set)) {
            if (this.j !== void 0) {
                t = this.j.call(null, t, this.F);
            }
            if (!h(t, this.v)) {
                this.$set.call(this.o, t);
                this.run();
            }
        } else {
            throw createMappedError(221);
        }
    }
    useCoercer(t, e) {
        this.j = t;
        this.F = e;
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
            this.V = false;
        }
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && this.subs.count === 0) {
            this.D = true;
            this.obs.clearAll();
            this.ov = void 0;
            this.V = true;
        }
    }
    run() {
        if (this.$ === "sync") {
            this.U();
            return;
        }
        if (this.B) {
            return;
        }
        this.B = true;
        queueTask(() => {
            this.B = false;
            this.U();
        });
    }
    U() {
        const t = this.v;
        const e = this.ov;
        const r = this.compute();
        this.D = false;
        if (!this.V || !h(r, t)) {
            this.cb?.(r, e);
            this.subs.notify(r, e);
            this.ov = this.v = r;
            this.V = true;
        }
    }
    compute() {
        this.D = false;
        this.obs.version++;
        try {
            enterConnectable(this);
            const t = unwrap(this.$get.call(this.H, this.H, this));
            if (this.D) {
                throw createMappedError(227, this.$get.name ?? this.$get.toString());
            }
            return this.v = t;
        } catch (t) {
            this.D = true;
            throw t;
        } finally {
            this.obs.clear();
            exitConnectable(this);
        }
    }
}

(() => {
    connectable(ComputedObserver, null);
    et(ComputedObserver, null);
})();

typeof SuppressedError === "function" ? SuppressedError : function(t, e, r) {
    var s = new Error(r);
    return s.name = "SuppressedError", s.error = t, s.suppressed = e, s;
};

const Ct = (() => {
    const t = new WeakMap;
    const normalizeKey = t => l(t) ? t : String(t);
    return {
        get: (e, r) => t.get(e)?.get(normalizeKey(r)),
        W: (e, r) => t.get(e)?.get(normalizeKey(r))?.flush,
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
            Ct.set(this, r.name, {
                flush: e
            });
        });
    };
}

const Et = /*@__PURE__*/ S("IDirtyChecker", void 0);

const At = {
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
        t.register(f.singleton(this, this), f.aliasTo(this, Et));
    }
    constructor() {
        this.tracked = [];
        this.q = null;
        this.K = 0;
        this.p = d(p);
        this.check = () => {
            if (At.disabled) {
                return;
            }
            if (++this.K < At.timeoutsPerCheck) {
                return;
            }
            this.K = 0;
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
        et(DirtyCheckProperty, null);
    }
    createProperty(t, e) {
        if (At.throw) {
            throw createMappedError(218, e);
        }
        return new DirtyCheckProperty(this, t, e);
    }
    addProperty(t) {
        this.tracked.push(t);
        if (this.tracked.length === 1) {
            this.q = queueRecurringTask(this.check, {
                interval: 0
            });
        }
    }
    removeProperty(t) {
        this.tracked.splice(this.tracked.indexOf(t), 1);
        if (this.tracked.length === 0) {
            this.q.cancel();
            this.q = null;
        }
    }
}

class DirtyCheckProperty {
    constructor(t, e, r) {
        this.obj = e;
        this.key = r;
        this.type = G;
        this.ov = void 0;
        this.G = t;
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
            this.G.addProperty(this);
        }
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && this.subs.count === 0) {
            this.G.removeProperty(this);
        }
    }
}

class PrimitiveObserver {
    get doNotCache() {
        return true;
    }
    constructor(t, e) {
        this.type = G;
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
        this.type = G;
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
        this.type = J;
        this.v = void 0;
        this.iO = false;
        this.cb = void 0;
        this.j = void 0;
        this.F = void 0;
        this.o = t;
        this.k = e;
    }
    getValue() {
        return this.v;
    }
    setValue(t) {
        if (this.j !== void 0) {
            t = this.j.call(void 0, t, this.F);
        }
        const e = this.v;
        if (this.iO) {
            if (h(t, this.v)) {
                return;
            }
            this.v = t;
            this.subs.notifyDirty();
            this.subs.notify(t, e);
            if (h(t, this.v)) {
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
        this.j = t;
        this.F = e;
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
            E(this.o, this.k, {
                enumerable: true,
                configurable: true,
                get: A(() => this.getValue(), {
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
            E(this.o, this.k, {
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
    et(SetterObserver, null);
})();

const Ot = new PropertyAccessor;

const mt = /*@__PURE__*/ S("IObserverLocator", t => t.singleton(ObserverLocator));

const St = /*@__PURE__*/ S("INodeObserverLocator", t => t.cachedCallback(t => new DefaultNodeObserverLocator));

class DefaultNodeObserverLocator {
    handles() {
        return false;
    }
    getObserver() {
        return Ot;
    }
    getAccessor() {
        return Ot;
    }
}

const kt = /*@__PURE__*/ S("IComputedObserverLocator", t => t.singleton(class DefaultLocator {
    getObserver(t, e, r, s) {
        const n = new ComputedObserver(t, r.get, r.set, s, Ct.W(t, e));
        E(t, e, {
            enumerable: r.enumerable,
            configurable: true,
            get: A(() => n.getValue(), {
                getObserver: () => n
            }),
            set: t => {
                n.setValue(t);
            }
        });
        return n;
    }
}));

class ObserverLocator {
    constructor() {
        this.J = [];
        this.G = d(Et);
        this.X = d(St);
        this.Y = d(kt);
    }
    addAdapter(t) {
        this.J.push(t);
    }
    getObserver(t, e) {
        if (t == null) {
            throw createMappedError(199, e);
        }
        if (!w(t)) {
            return new PrimitiveObserver(t, n(e) ? "" : e);
        }
        if (n(e)) {
            return new ComputedObserver(t, e, void 0, this);
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
        if (this.X.handles(t, e, this)) {
            return this.X.getAccessor(t, e, this);
        }
        return Ot;
    }
    getArrayObserver(t) {
        return rt(t);
    }
    getMapObserver(t) {
        return nt(t);
    }
    getSetObserver(t) {
        return st(t);
    }
    createObserver(t, e) {
        if (this.X.handles(t, e, this)) {
            return this.X.getObserver(t, e, this);
        }
        switch (e) {
          case "length":
            if (i(t)) {
                return rt(t).getLengthObserver();
            }
            break;

          case "size":
            if (u(t)) {
                return nt(t).getLengthObserver();
            } else if (c(t)) {
                return st(t).getLengthObserver();
            }
            break;

          default:
            if (i(t) && o(e)) {
                return rt(t).getIndexObserver(Number(e));
            }
            break;
        }
        let r = Rt(t, e);
        if (r === void 0) {
            let s = Pt(t);
            while (s !== null) {
                r = Rt(s, e);
                if (r === void 0) {
                    s = Pt(s);
                } else {
                    break;
                }
            }
        }
        if (r !== void 0 && !C.call(r, "value")) {
            let s = this.Z(t, e, r);
            if (s == null) {
                s = (r.get?.getObserver)?.(t);
            }
            return s == null ? r.configurable ? this.Y.getObserver(t, e, r, this) : this.G.createProperty(t, e) : s;
        }
        return new SetterObserver(t, e);
    }
    Z(t, e, r) {
        if (this.J.length > 0) {
            for (const s of this.J) {
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
        e = rt(t);
    } else if (u(t)) {
        e = nt(t);
    } else if (c(t)) {
        e = st(t);
    }
    return e;
};

const Pt = Object.getPrototypeOf;

const Rt = Object.getOwnPropertyDescriptor;

const getObserverLookup = t => {
    let e = t.$observers;
    if (e === void 0) {
        E(t, "$observers", {
            value: e = v()
        });
    }
    return e;
};

const xt = /*@__PURE__*/ S("IObservation", t => t.singleton(Observation));

class Observation {
    constructor() {
        this.oL = d(mt);
        this.tt = d(e);
    }
    run(t) {
        const e = new RunEffect(this.oL, t);
        e.run();
        return e;
    }
    watch(t, e, r, s) {
        let i = undefined;
        let o = false;
        let a;
        const c = this.oL.getObserver(t, e);
        const handleChange = (t, e) => {
            a?.();
            a = void 0;
            const s = r(t, i = e);
            if (n(s)) {
                a = s;
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
        let o;
        const handleChange = (t, e) => {
            o?.();
            o = void 0;
            const s = r(t, e);
            if (n(s)) {
                o = s;
            }
        };
        const a = new ExpressionObserver(Scope.create(t), this.oL, this.tt.parse(e, "IsProperty"), handleChange);
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
        this.et = undefined;
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
                this.et?.call(void 0);
                enterConnectable(this);
                this.et = this.fn(this);
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
            this.et?.call(void 0);
            this.et = void 0;
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
        if (!h(e, t)) {
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
    M(ExpressionObserver);
})();

const It = /*@__PURE__*/ (() => {
    function getObserversLookup(t) {
        if (t.$observers === void 0) {
            E(t, "$observers", {
                value: {}
            });
        }
        return t.$observers;
    }
    const t = {};
    function observable(e, r) {
        if (!SetterNotifier.mixed) {
            SetterNotifier.mixed = true;
            et(SetterNotifier, null);
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
                createDescriptor(e, n.name, () => t, true);
            };
        }
        return function(e, r) {
            switch (r.kind) {
              case "field":
                return createFieldInitializer(r);

              case "class":
                return createDescriptor(e, n.name, () => t, true);

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
            const i = n.callback || `${m(e)}Changed`;
            const o = n.set;
            const observableGetter = function() {
                const t = getNotifier(this, e, i, r, o);
                currentConnectable()?.subscribeTo(t);
                return t.getValue();
            };
            observableGetter.getObserver = function(t) {
                return getNotifier(t, e, i, r, o);
            };
            const a = {
                enumerable: true,
                configurable: true,
                get: observableGetter,
                set(t) {
                    getNotifier(this, e, i, r, o).setValue(t);
                }
            };
            if (s) E(t.prototype, e, a); else E(t, e, a);
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
        constructor(t, e, r, s) {
            this.type = J;
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
            if (!h(t, this.v)) {
                this.ov = this.v;
                this.v = t;
                this.subs.notifyDirty();
                this.subs.notify(this.v, this.ov);
                if (h(t, this.v)) {
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
            rtDefineHiddenProp(t, dt, true);
            break;

          case "field":
            e.addInitializer(function() {
                const t = this.constructor;
                const r = `${pt}_${m(e.name)}__`;
                if (r in t) return;
                rtDefineHiddenProp(t, r, true);
            });
            break;
        }
    }
}

export { Y as AccessorType, BindingContext, CollectionLengthObserver, CollectionSizeObserver, ComputedObserver, ut as ConnectableSwitcher, DirtyCheckProperty, At as DirtyCheckSettings, DirtyChecker, K as ICoercionConfiguration, kt as IComputedObserverLocator, Et as IDirtyChecker, St as INodeObserverLocator, xt as IObservation, mt as IObserverLocator, Observation, ObserverLocator, PrimitiveObserver, PropertyAccessor, yt as ProxyObservable, RecurringTask, Scope, SetterObserver, Task, TaskAbortError, R as astAssign, I as astBind, x as astEvaluate, _ as astUnbind, batch, cloneIndexMap, computed, connectable, copyIndexMap, createIndexMap, getCollectionObserver, getObserverLookup, getRecurringTasks, isIndexMap, M as mixinNoopAstEvaluator, nowrap, It as observable, queueAsyncTask, queueRecurringTask, queueTask, runTasks, et as subscriberCollection, tasksSettled };

