import { DI as t, Registration as i, resolve as s, optional as n, all as e, ILogger as h, lazy as r, onResolve as o, isPromise as c, camelCase as a, IContainer as u, Protocol as d } from "@aurelia/kernel";

import { Scope as l, connectable as f, astEvaluate as g, astBind as S, astUnbind as B } from "@aurelia/runtime";

import { IWindow as p, mixinAstEvaluator as b, mixingBindingLimited as m, BindingMode as y, BindingBehavior as v, renderer as w, AppTask as C, LifecycleHooks as I, ILifecycleHooks as D } from "@aurelia/runtime-html";

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

const O = /*@__PURE__*/ T("IActionHandler");

const E = /*@__PURE__*/ T("IStore");

const A = /*@__PURE__*/ T("IState");

const _ = "__au_ah__";

const H = Object.freeze({
    define(t) {
        function registry(i, s) {
            return t(i, s);
        }
        registry[_] = true;
        registry.register = function(s) {
            i.instance(O, t).register(s);
        };
        return registry;
    },
    isType: t => typeof t === "function" && _ in t
});

const L = /*@__PURE__*/ T("IDevToolsExtension", t => t.cachedCallback(t => {
    const i = t.get(p);
    const s = i.__REDUX_DEVTOOLS_EXTENSION__;
    return s ?? null;
}));

class Store {
    static register(t) {
        t.register(i.singleton(this, this), i.aliasTo(this, E));
    }
    constructor() {
        this.t = new Set;
        this.i = false;
        this.h = [];
        this.u = this._state = s(n(A)) ?? new State;
        this.B = s(e(O));
        this.C = s(h);
        this.I = s(r(L));
    }
    subscribe(t) {
        this.t.add(t);
    }
    unsubscribe(t) {
        this.t.delete(t);
    }
    T(t) {
        const i = this._state;
        this._state = t;
        this.t.forEach(s => s.handleStateChange(t, i));
    }
    getState() {
        return this._state;
    }
    O(t, i, s) {
        for (const n of t) {
            i = o(i, t => n(t, s));
        }
        return o(i, t => t);
    }
    dispatch(t) {
        if (this.i) {
            this.h.push(t);
            return;
        }
        this.i = true;
        const afterDispatch = t => o(t, t => {
            const i = this.h.shift();
            if (i != null) {
                return o(this.O(this.B, t, i), t => {
                    this.T(t);
                    return afterDispatch(t);
                });
            } else {
                this.i = false;
            }
        });
        const i = this.O(this.B, this._state, t);
        if (c(i)) {
            return i.then(t => {
                this.T(t);
                return afterDispatch(this._state);
            }, t => {
                this.i = false;
                throw t;
            });
        } else {
            this.T(i);
            return afterDispatch(this._state);
        }
    }
    connectDevTools(t) {
        const i = this.I();
        const s = i != null;
        if (!s) {
            throw new Error("Devtools extension is not available");
        }
        t.name ??= "Aurelia State plugin";
        const n = i.connect(t);
        n.init(this.u);
        n.subscribe(t => {
            this.C.info("DevTools sent a message:", t);
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
                    this.T(JSON.parse(t.state));
                    return;

                  case "COMMIT":
                    n.init(this._state);
                    return;

                  case "RESET":
                    n.init(this.u);
                    this.T(this.u);
                    return;

                  case "ROLLBACK":
                    {
                        const i = JSON.parse(t.state);
                        this.T(i);
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

class StateBinding {
    constructor(t, i, s, n, e, h, r, o) {
        this.isBound = false;
        this.v = void 0;
        this.A = void 0;
        this._ = 0;
        this.boundFn = false;
        this.mode = y.toView;
        this.H = t;
        this.l = i;
        this.L = r;
        this.oL = s;
        this.ast = n;
        this.target = e;
        this.targetProperty = h;
        this.strict = o;
    }
    updateTarget(t) {
        const i = this.P;
        const s = this.target;
        const n = this.targetProperty;
        const e = this._++;
        const isCurrentValue = () => e === this._ - 1;
        this.J();
        if (isSubscribable(t)) {
            this.A = t.subscribe(t => {
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
        this.P = this.oL.getAccessor(this.target, this.targetProperty);
        this.L.subscribe(this);
        this.updateTarget(this.v = g(this.ast, this.s = createStateBindingScope(this.L.getState(), t), this, this.mode > y.oneTime ? this : null));
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        this.J();
        this._++;
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
        const n = g(this.ast, i, this, this.mode > y.oneTime ? this : null);
        if (n === this.v) {
            return;
        }
        this.v = n;
        this.updateTarget(n);
    }
    J() {
        if (typeof this.A === "function") {
            this.A();
        } else if (this.A !== void 0) {
            this.A.dispose?.();
            this.A.unsubscribe?.();
        }
        this.A = void 0;
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

const P = new WeakMap;

class StateBindingBehavior {
    constructor() {
        this.L = s(E);
    }
    bind(t, i) {
        const s = i instanceof StateBinding;
        t = s ? t : createStateBindingScope(this.L.getState(), t);
        let n;
        if (!s) {
            n = P.get(i);
            if (n == null) {
                P.set(i, n = new StateSubscriber(i, t));
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
            this.L.unsubscribe(P.get(i));
            P.delete(i);
        }
    }
}

v.define("state", StateBindingBehavior);

class StateSubscriber {
    constructor(t, i) {
        this.$ = t;
        this.N = i;
    }
    handleStateChange(t) {
        const i = this.N;
        const s = i.overrideContext;
        i.bindingContext = s.bindingContext = t;
        this.$.handleChange?.(undefined, undefined);
    }
}

class StateDispatchBinding {
    constructor(t, i, s, n, e, h) {
        this.isBound = false;
        this.boundFn = false;
        this.l = t;
        this.L = e;
        this.ast = i;
        this.M = s;
        this.R = n;
        this.strict = h;
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
        this.M.addEventListener(this.R, this);
        this.L.subscribe(this);
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        B(this.ast, this.s, this);
        this.s = void 0;
        this.M.removeEventListener(this.R, this);
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
        let h = n.rawValue;
        h = h === "" ? a(e) : h;
        if (t.bindable == null) {
            e = s.map(t.node, e) ?? a(e);
        } else {
            e = t.bindable.name;
        }
        return new StateBindingInstruction(h, e);
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

const k = /*@__PURE__*/ w(class StateBindingInstructionRenderer {
    constructor() {
        this.target = "sb";
        this.G = s(E);
    }
    render(t, i, s, n, e, h) {
        const r = ensureExpression(e, s.from, "IsFunction");
        t.addBinding(new StateBinding(t, t.container, h, r, i, s.to, this.G, t.strict ?? false));
    }
}, null);

const J = /*@__PURE__*/ w(class DispatchBindingInstructionRenderer {
    constructor() {
        this.target = "sd";
        this.G = s(E);
    }
    render(t, i, s, n, e) {
        const h = ensureExpression(e, s.ast, "IsProperty");
        t.addBinding(new StateDispatchBinding(t.container, h, i, s.from, this.G, t.strict ?? false));
    }
}, null);

function ensureExpression(t, i, s) {
    if (typeof i === "string") {
        return t.parse(i, s);
    }
    return i;
}

const x = [ StateBindingCommand, k, DispatchBindingCommand, J, StateBindingBehavior, Store ];

const createConfiguration = (t, s, n = {}) => ({
    register: e => {
        e.register(i.instance(A, t), ...x, ...s.map(H.define), C.creating(u, t => {
            const i = t.get(E);
            const s = t.get(L);
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

const N = /*@__PURE__*/ createConfiguration({}, []);

class StateGetterBinding {
    constructor(t, i, s, n) {
        this.isBound = false;
        this.v = void 0;
        this.A = void 0;
        this._ = 0;
        this.L = s;
        this.$get = n;
        this.target = t;
        this.key = i;
    }
    updateTarget(t) {
        const i = this.target;
        const s = this.key;
        const n = this._++;
        const isCurrentValue = () => n === this._ - 1;
        this.J();
        if (isSubscribable$1(t)) {
            this.A = t.subscribe(t => {
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
        this.J();
        this._++;
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
    J() {
        if (typeof this.A === "function") {
            this.A();
        } else if (this.A !== void 0) {
            this.A.dispose?.();
            this.A.unsubscribe?.();
        }
        this.A = void 0;
    }
}

f(StateGetterBinding, null);

function fromState(t) {
    return function(i, s) {
        if (!(i === void 0 && s.kind === "field" || typeof i === "function" && s.kind === "setter")) {
            throw new Error(`Invalid usage. @state can only be used on a field ${i} - ${s.kind}`);
        }
        const n = s.name;
        const e = s.metadata[$] ??= [];
        e.push(new HydratingLifecycleHooks(t, n), new CreatedLifecycleHooks(t, n));
    };
}

const $ = d.annotation.keyFor("dependencies");

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
        i.addBinding(new StateGetterBinding(t, this.key, s.get(E), this.$get));
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
        i.addBinding(new StateGetterBinding(t, this.key, s.get(E), this.$get));
    }
}

I.define({}, CreatedLifecycleHooks);

export { H as ActionHandler, DispatchBindingCommand, DispatchBindingInstruction, J as DispatchBindingInstructionRenderer, O as IActionHandler, A as IState, E as IStore, StateBinding, StateBindingBehavior, StateBindingCommand, StateBindingInstruction, k as StateBindingInstructionRenderer, N as StateDefaultConfiguration, StateDispatchBinding, fromState };
//# sourceMappingURL=index.mjs.map
