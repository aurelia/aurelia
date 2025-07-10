import { DI as t, Registration as i, resolve as s, optional as n, all as e, ILogger as r, lazy as h, onResolve as o, isPromise as c, camelCase as a, IContainer as u, Protocol as d } from "@aurelia/kernel";

import { Scope as l, connectable as f, astEvaluate as g, astBind as S, astUnbind as p } from "@aurelia/runtime";

import { IWindow as B, mixinAstEvaluator as b, mixingBindingLimited as m, BindingMode as w, BindingBehavior as y, renderer as v, AppTask as C, LifecycleHooks as I, ILifecycleHooks as D } from "@aurelia/runtime-html";

const T = t.createInterface;

function createStateBindingScope(t, i) {
    const s = {
        bindingContext: t
    };
    const n = l.create(t, s, true);
    n.parent = i;
    return n;
}

function isSubscribable$1(t) {
    return t instanceof Object && "subscribe" in t;
}

const A = /*@__PURE__*/ T("IActionHandler");

const O = /*@__PURE__*/ T("IStore");

const E = /*@__PURE__*/ T("IState");

const _ = /*@__PURE__*/ T("IDevToolsExtension", t => t.cachedCallback(t => {
    const i = t.get(B);
    const s = i.__REDUX_DEVTOOLS_EXTENSION__;
    return s ?? null;
}));

class Store {
    static register(t) {
        t.register(i.singleton(this, this), i.aliasTo(this, O));
    }
    constructor() {
        this.t = new Set;
        this.i = new Map;
        this.h = false;
        this.u = [];
        this.B = this._state = s(n(E)) ?? new State;
        this.C = s(e(A));
        this.I = s(r);
        this.T = s(h(_));
    }
    subscribe(t) {
        this.t.add(t);
    }
    unsubscribe(t) {
        this.t.delete(t);
    }
    registerMiddleware(t, i, s) {
        this.i.set(t, {
            placement: i,
            settings: s
        });
    }
    unregisterMiddleware(t) {
        if (this.i.has(t)) {
            this.i.delete(t);
        }
    }
    A(t) {
        const i = this._state;
        this._state = t;
        this.t.forEach(s => s.handleStateChange(t, i));
    }
    getState() {
        return this._state;
    }
    O(t, i, s) {
        const n = Array.from(this.i.entries()).filter(([t, s]) => s.placement === i);
        if (n.length === 0) {
            return t;
        }
        let e = t;
        for (const [t, i] of n) {
            e = o(e, n => {
                if (n === false) {
                    return false;
                }
                try {
                    const e = o(t(n, s, i.settings), t => {
                        if (t === false) {
                            return false;
                        }
                        if (t != null) {
                            return t;
                        }
                        return n;
                    });
                    if (c(e)) {
                        return e.catch(t => {
                            this.I.error(`Middleware execution failed: ${t}`);
                            return n;
                        });
                    }
                    return e;
                } catch (t) {
                    this.I.error(`Middleware execution failed: ${t}`);
                    return n;
                }
            });
        }
        return e;
    }
    _(t, i, s) {
        let n = i;
        for (const i of t) {
            n = o(n, t => i(t, s));
        }
        return n;
    }
    dispatch(t) {
        if (this.h) {
            this.u.push(t);
            return;
        }
        this.h = true;
        const processAction = t => {
            const finalize = () => {
                const t = this.u.shift();
                if (t != null) {
                    return processAction(t);
                } else {
                    this.h = false;
                }
            };
            const i = this.O(this._state, "before", t);
            const s = o(i, i => {
                if (i === false) {
                    return finalize();
                }
                const s = this._(this.C, i, t);
                const n = o(s, i => {
                    const s = this.O(i, "after", t);
                    return o(s, t => {
                        if (t !== false) {
                            this.A(t);
                        }
                        return finalize();
                    });
                });
                return n;
            });
            return s;
        };
        try {
            const i = processAction(t);
            if (c(i)) {
                return i.catch(t => {
                    this.h = false;
                    this.I.error(`Action or middleware failed: ${t}`);
                    throw t;
                });
            }
            return i;
        } catch (t) {
            this.h = false;
            this.I.error(`Action or middleware failed: ${t}`);
            throw t;
        }
    }
    connectDevTools(t) {
        const i = this.T();
        const s = i != null;
        if (!s) {
            throw new Error("Devtools extension is not available");
        }
        t.name ??= "Aurelia State plugin";
        const n = i.connect(t);
        n.init(this.B);
        n.subscribe(t => {
            this.I.info(`DevTools sent a message: ${JSON.stringify(t)}`);
            const i = typeof t.payload === "string" ? tryParseJson(t.payload) : t.payload;
            if (i === void 0) {
                return;
            }
            if (t.type === "ACTION") {
                if (i == null) {
                    throw new Error("DevTools sent an action with no payload");
                }
                void new Promise(t => {
                    t(this.dispatch(i));
                }).catch(t => {
                    throw new Error(`Issue when trying to dispatch an action through devtools:\n${t}`);
                }).then(() => {
                    n.send("ACTION", this._state);
                });
                return;
            }
            if (t.type === "DISPATCH" && i != null) {
                switch (i.type) {
                  case "JUMP_TO_STATE":
                  case "JUMP_TO_ACTION":
                    this.A(JSON.parse(t.state));
                    return;

                  case "COMMIT":
                    n.init(this._state);
                    return;

                  case "RESET":
                    n.init(this.B);
                    this.A(this.B);
                    return;

                  case "ROLLBACK":
                    {
                        const i = JSON.parse(t.state);
                        this.A(i);
                        n.send("ROLLBACK", i);
                        return;
                    }
                }
            }
        });
    }
}

class State {}

function tryParseJson(t) {
    try {
        return JSON.parse(t);
    } catch (i) {
        console.log(`Error parsing JSON:\n${(t ?? "").slice(0, 200)}\n${i}`);
        return undefined;
    }
}

const M = "__au_ah__";

const $ = Object.freeze({
    define(t) {
        function registry(i, s) {
            return t(i, s);
        }
        registry[M] = true;
        registry.register = function(s) {
            i.instance(A, t).register(s);
        };
        return registry;
    },
    isType: t => typeof t === "function" && M in t
});

class StateBinding {
    constructor(t, i, s, n, e, r, h, o) {
        this.isBound = false;
        this.v = void 0;
        this.M = void 0;
        this.$ = 0;
        this.boundFn = false;
        this.mode = w.toView;
        this.H = t;
        this.l = i;
        this.L = h;
        this.oL = s;
        this.ast = n;
        this.target = e;
        this.targetProperty = r;
        this.strict = o;
    }
    updateTarget(t) {
        const i = this.J;
        const s = this.target;
        const n = this.targetProperty;
        const e = this.$++;
        const isCurrentValue = () => e === this.$ - 1;
        this.P();
        if (isSubscribable(t)) {
            this.M = t.subscribe(t => {
                if (isCurrentValue()) {
                    i.setValue(t, s, n);
                }
            });
            return;
        }
        if (t instanceof Promise) {
            void t.then(t => {
                if (isCurrentValue()) {
                    i.setValue(t, s, n);
                }
            }, () => {});
            return;
        }
        i.setValue(t, s, n);
    }
    bind(t) {
        if (this.isBound) {
            return;
        }
        this.J = this.oL.getAccessor(this.target, this.targetProperty);
        this.L.subscribe(this);
        this.updateTarget(this.v = g(this.ast, this.s = createStateBindingScope(this.L.getState(), t), this, this.mode > w.oneTime ? this : null));
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        this.P();
        this.$++;
        this.s = void 0;
        this.L.unsubscribe(this);
    }
    handleChange(t) {
        if (!this.isBound) return;
        const i = this.obs;
        i.version++;
        t = g(this.ast, this.s, this, this);
        i.clear();
        this.updateTarget(t);
    }
    handleStateChange() {
        if (!this.isBound) return;
        const t = this.L.getState();
        const i = this.s;
        const s = i.overrideContext;
        i.bindingContext = s.bindingContext = t;
        const n = g(this.ast, i, this, this.mode > w.oneTime ? this : null);
        if (n === this.v) {
            return;
        }
        this.v = n;
        this.updateTarget(n);
    }
    P() {
        if (typeof this.M === "function") {
            this.M();
        } else if (this.M !== void 0) {
            this.M.dispose?.();
            this.M.unsubscribe?.();
        }
        this.M = void 0;
    }
}

(() => {
    f(StateBinding, null);
    b(StateBinding);
    m(StateBinding, () => "updateTarget");
})();

function isSubscribable(t) {
    return t instanceof Object && "subscribe" in t;
}

const H = new WeakMap;

class StateBindingBehavior {
    constructor() {
        this.L = s(O);
    }
    bind(t, i) {
        const s = i instanceof StateBinding;
        t = s ? t : createStateBindingScope(this.L.getState(), t);
        let n;
        if (!s) {
            n = H.get(i);
            if (n == null) {
                H.set(i, n = new StateSubscriber(i, t));
            } else {
                n.N = t;
            }
            this.L.subscribe(n);
            i.useScope?.(t);
        }
    }
    unbind(t, i) {
        const s = i instanceof StateBinding;
        if (!s) {
            this.L.unsubscribe(H.get(i));
            H.delete(i);
        }
    }
}

y.define("state", StateBindingBehavior);

class StateSubscriber {
    constructor(t, i) {
        this.R = t;
        this.N = i;
    }
    handleStateChange(t) {
        const i = this.N;
        const s = i.overrideContext;
        i.bindingContext = s.bindingContext = t;
        this.R.handleChange?.(undefined, undefined);
    }
}

class StateDispatchBinding {
    constructor(t, i, s, n, e, r) {
        this.isBound = false;
        this.boundFn = false;
        this.l = t;
        this.L = e;
        this.ast = i;
        this.G = s;
        this.j = n;
        this.strict = r;
    }
    callSource(t) {
        const i = this.s;
        i.overrideContext.$event = t;
        const s = g(this.ast, i, this, null);
        delete i.overrideContext.$event;
        void this.L.dispatch(s);
    }
    handleEvent(t) {
        this.callSource(t);
    }
    bind(t) {
        if (this.isBound) {
            return;
        }
        S(this.ast, t, this);
        this.s = createStateBindingScope(this.L.getState(), t);
        this.G.addEventListener(this.j, this);
        this.L.subscribe(this);
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        p(this.ast, this.s, this);
        this.s = void 0;
        this.G.removeEventListener(this.j, this);
        this.L.unsubscribe(this);
    }
    handleStateChange(t) {
        const i = this.s;
        const s = i.overrideContext;
        i.bindingContext = s.bindingContext = t;
    }
}

(() => {
    f(StateDispatchBinding, null);
    b(StateDispatchBinding);
    m(StateDispatchBinding, () => "callSource");
})();

class StateBindingCommand {
    get ignoreAttr() {
        return false;
    }
    build(t, i, s) {
        const n = t.attr;
        let e = n.target;
        let r = n.rawValue;
        r = r === "" ? a(e) : r;
        if (t.bindable == null) {
            e = s.map(t.node, e) ?? a(e);
        } else {
            e = t.bindable.name;
        }
        return new StateBindingInstruction(r, e);
    }
}

StateBindingCommand.$au = {
    type: "binding-command",
    name: "state"
};

class DispatchBindingCommand {
    get ignoreAttr() {
        return true;
    }
    build(t) {
        const i = t.attr;
        return new DispatchBindingInstruction(i.target, i.rawValue);
    }
}

DispatchBindingCommand.$au = {
    type: "binding-command",
    name: "dispatch"
};

class StateBindingInstruction {
    constructor(t, i) {
        this.from = t;
        this.to = i;
        this.type = "sb";
    }
}

class DispatchBindingInstruction {
    constructor(t, i) {
        this.from = t;
        this.ast = i;
        this.type = "sd";
    }
}

const x = /*@__PURE__*/ v(class StateBindingInstructionRenderer {
    constructor() {
        this.target = "sb";
        this.K = s(O);
    }
    render(t, i, s, n, e, r) {
        const h = ensureExpression(e, s.from, "IsFunction");
        t.addBinding(new StateBinding(t, t.container, r, h, i, s.to, this.K, t.strict ?? false));
    }
}, null);

const L = /*@__PURE__*/ v(class DispatchBindingInstructionRenderer {
    constructor() {
        this.target = "sd";
        this.K = s(O);
    }
    render(t, i, s, n, e) {
        const r = ensureExpression(e, s.ast, "IsProperty");
        t.addBinding(new StateDispatchBinding(t.container, r, i, s.from, this.K, t.strict ?? false));
    }
}, null);

function ensureExpression(t, i, s) {
    if (typeof i === "string") {
        return t.parse(i, s);
    }
    return i;
}

const J = [ StateBindingCommand, x, DispatchBindingCommand, L, StateBindingBehavior, Store ];

const createConfiguration = (t, s, n = {}) => ({
    register: e => {
        e.register(i.instance(E, t), ...J, ...s.map($.define), C.creating(u, t => {
            const i = t.get(O);
            if (n.middlewares) {
                for (const t of n.middlewares) {
                    i.registerMiddleware(t.middleware, t.placement, t.settings);
                }
            }
            const s = t.get(_);
            if (n.devToolsOptions?.disable !== true && s != null) {
                i.connectDevTools(n.devToolsOptions ?? {});
            }
        }));
    },
    init: (t, i, ...s) => {
        const n = typeof i === "function";
        const e = n ? {} : i;
        s = n ? [ i, ...s ] : s;
        return createConfiguration(t, s, e);
    }
});

const P = /*@__PURE__*/ createConfiguration({}, []);

class StateGetterBinding {
    constructor(t, i, s, n) {
        this.isBound = false;
        this.v = void 0;
        this.M = void 0;
        this.$ = 0;
        this.L = s;
        this.$get = n;
        this.target = t;
        this.key = i;
    }
    updateTarget(t) {
        const i = this.target;
        const s = this.key;
        const n = this.$++;
        const isCurrentValue = () => n === this.$ - 1;
        this.P();
        if (isSubscribable$1(t)) {
            this.M = t.subscribe(t => {
                if (isCurrentValue()) {
                    i[s] = t;
                }
            });
            return;
        }
        if (t instanceof Promise) {
            void t.then(t => {
                if (isCurrentValue()) {
                    i[s] = t;
                }
            }, () => {});
            return;
        }
        i[s] = t;
    }
    bind(t) {
        if (this.isBound) {
            return;
        }
        const i = this.L.getState();
        this.s = createStateBindingScope(i, t);
        this.L.subscribe(this);
        this.updateTarget(this.v = this.$get(i));
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        this.P();
        this.$++;
        this.s = void 0;
        this.L.unsubscribe(this);
    }
    handleStateChange(t) {
        const i = this.s;
        const s = i.overrideContext;
        i.bindingContext = s.bindingContext = t;
        const n = this.$get(this.L.getState());
        if (n === this.v) {
            return;
        }
        this.v = n;
        this.updateTarget(n);
    }
    P() {
        if (typeof this.M === "function") {
            this.M();
        } else if (this.M !== void 0) {
            this.M.dispose?.();
            this.M.unsubscribe?.();
        }
        this.M = void 0;
    }
}

f(StateGetterBinding, null);

function fromState(t) {
    return function(i, s) {
        if (!(i === void 0 && s.kind === "field" || typeof i === "function" && s.kind === "setter")) {
            throw new Error(`Invalid usage. @state can only be used on a field ${i} - ${s.kind}`);
        }
        const n = s.name;
        const e = s.metadata[k] ??= [];
        e.push(new HydratingLifecycleHooks(t, n), new CreatedLifecycleHooks(t, n));
    };
}

const k = d.annotation.keyFor("dependencies");

class HydratingLifecycleHooks {
    constructor(t, i) {
        this.$get = t;
        this.key = i;
    }
    register(t) {
        i.instance(D, this).register(t);
    }
    hydrating(t, i) {
        const s = i.container;
        if (i.vmKind !== "customElement") return;
        i.addBinding(new StateGetterBinding(t, this.key, s.get(O), this.$get));
    }
}

I.define({}, HydratingLifecycleHooks);

class CreatedLifecycleHooks {
    constructor(t, i) {
        this.$get = t;
        this.key = i;
    }
    register(t) {
        i.instance(D, this).register(t);
    }
    created(t, i) {
        const s = i.container;
        if (i.vmKind !== "customAttribute") return;
        i.addBinding(new StateGetterBinding(t, this.key, s.get(O), this.$get));
    }
}

I.define({}, CreatedLifecycleHooks);

function createStateMemoizer(...t) {
    if (t.length === 1) {
        const i = t[0];
        let s;
        let n;
        return t => {
            if (t === s) {
                return n;
            }
            s = t;
            return n = i(t);
        };
    }
    const i = t[t.length - 1];
    const s = t.slice(0, -1);
    let n;
    let e;
    return t => {
        const r = s.map(i => i(t));
        if (n !== undefined && r.length === n.length && r.every((t, i) => t === n[i])) {
            return e;
        }
        n = r;
        return e = i(...r);
    };
}

export { $ as ActionHandler, DispatchBindingCommand, DispatchBindingInstruction, L as DispatchBindingInstructionRenderer, A as IActionHandler, E as IState, O as IStore, StateBinding, StateBindingBehavior, StateBindingCommand, StateBindingInstruction, x as StateBindingInstructionRenderer, P as StateDefaultConfiguration, StateDispatchBinding, Store, createStateMemoizer, fromState };
//# sourceMappingURL=index.mjs.map
