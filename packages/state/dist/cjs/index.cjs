"use strict";

var t = require("@aurelia/kernel");

var i = require("@aurelia/runtime");

var s = require("@aurelia/runtime-html");

const e = t.DI.createInterface;

function createStateBindingScope(t, s) {
    const e = {
        bindingContext: t
    };
    const n = i.Scope.create(t, e, true);
    n.parent = s;
    return n;
}

function isSubscribable$1(t) {
    return t instanceof Object && "subscribe" in t;
}

const n = /*@__PURE__*/ e("IActionHandler");

const r = /*@__PURE__*/ e("IStore");

const o = /*@__PURE__*/ e("IState");

const h = /*@__PURE__*/ e("IDevToolsExtension", t => t.cachedCallback(t => {
    const i = t.get(s.IWindow);
    const e = i.__REDUX_DEVTOOLS_EXTENSION__;
    return e ?? null;
}));

class Store {
    static register(i) {
        i.register(t.Registration.singleton(this, this), t.Registration.aliasTo(this, r));
    }
    constructor() {
        this.t = new Set;
        this.i = new Map;
        this.h = false;
        this.u = [];
        this.B = this._state = t.resolve(t.optional(o)) ?? new State;
        this.C = t.resolve(t.all(n));
        this.I = t.resolve(t.ILogger);
        this.T = t.resolve(t.lazy(h));
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
    O(i, s, e) {
        const n = Array.from(this.i.entries()).filter(([t, i]) => i.placement === s);
        if (n.length === 0) {
            return i;
        }
        let r = i;
        for (const [i, s] of n) {
            r = t.onResolve(r, n => {
                if (n === false) {
                    return false;
                }
                try {
                    const r = t.onResolve(i(n, e, s.settings), t => {
                        if (t === false) {
                            return false;
                        }
                        if (t != null) {
                            return t;
                        }
                        return n;
                    });
                    if (t.isPromise(r)) {
                        return r.catch(t => {
                            this.I.error(`Middleware execution failed: ${t}`);
                            return n;
                        });
                    }
                    return r;
                } catch (t) {
                    this.I.error(`Middleware execution failed: ${t}`);
                    return n;
                }
            });
        }
        return r;
    }
    _(i, s, e) {
        let n = s;
        for (const s of i) {
            n = t.onResolve(n, t => s(t, e));
        }
        return n;
    }
    dispatch(i) {
        if (this.h) {
            this.u.push(i);
            return;
        }
        this.h = true;
        const processAction = i => {
            const finalize = () => {
                const t = this.u.shift();
                if (t != null) {
                    return processAction(t);
                } else {
                    this.h = false;
                }
            };
            const s = this.O(this._state, "before", i);
            const e = t.onResolve(s, s => {
                if (s === false) {
                    return finalize();
                }
                const e = this._(this.C, s, i);
                const n = t.onResolve(e, s => {
                    const e = this.O(s, "after", i);
                    return t.onResolve(e, t => {
                        if (t !== false) {
                            this.A(t);
                        }
                        return finalize();
                    });
                });
                return n;
            });
            return e;
        };
        try {
            const s = processAction(i);
            if (t.isPromise(s)) {
                return s.catch(t => {
                    this.h = false;
                    this.I.error(`Action or middleware failed: ${t}`);
                    throw t;
                });
            }
            return s;
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
        const e = i.connect(t);
        e.init(this.B);
        e.subscribe(t => {
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
                    e.send("ACTION", this._state);
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
                    e.init(this._state);
                    return;

                  case "RESET":
                    e.init(this.B);
                    this.A(this.B);
                    return;

                  case "ROLLBACK":
                    {
                        const i = JSON.parse(t.state);
                        this.A(i);
                        e.send("ROLLBACK", i);
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

const c = "__au_ah__";

const a = Object.freeze({
    define(i) {
        function registry(t, s) {
            return i(t, s);
        }
        registry[c] = true;
        registry.register = function(s) {
            t.Registration.instance(n, i).register(s);
        };
        return registry;
    },
    isType: t => typeof t === "function" && c in t
});

class StateBinding {
    constructor(t, i, e, n, r, o, h, c) {
        this.isBound = false;
        this.v = void 0;
        this.M = void 0;
        this.$ = 0;
        this.boundFn = false;
        this.mode = s.BindingMode.toView;
        this.H = t;
        this.l = i;
        this.L = h;
        this.oL = e;
        this.ast = n;
        this.target = r;
        this.targetProperty = o;
        this.strict = c;
    }
    updateTarget(t) {
        const i = this.J;
        const s = this.target;
        const e = this.targetProperty;
        const n = this.$++;
        const isCurrentValue = () => n === this.$ - 1;
        this.P();
        if (isSubscribable(t)) {
            this.M = t.subscribe(t => {
                if (isCurrentValue()) {
                    i.setValue(t, s, e);
                }
            });
            return;
        }
        if (t instanceof Promise) {
            void t.then(t => {
                if (isCurrentValue()) {
                    i.setValue(t, s, e);
                }
            }, () => {});
            return;
        }
        i.setValue(t, s, e);
    }
    bind(t) {
        if (this.isBound) {
            return;
        }
        this.J = this.oL.getAccessor(this.target, this.targetProperty);
        this.L.subscribe(this);
        this.updateTarget(this.v = i.astEvaluate(this.ast, this.s = createStateBindingScope(this.L.getState(), t), this, this.mode > s.BindingMode.oneTime ? this : null));
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
        const s = this.obs;
        s.version++;
        t = i.astEvaluate(this.ast, this.s, this, this);
        s.clear();
        this.updateTarget(t);
    }
    handleStateChange() {
        if (!this.isBound) return;
        const t = this.L.getState();
        const e = this.s;
        const n = e.overrideContext;
        e.bindingContext = n.bindingContext = t;
        const r = i.astEvaluate(this.ast, e, this, this.mode > s.BindingMode.oneTime ? this : null);
        if (r === this.v) {
            return;
        }
        this.v = r;
        this.updateTarget(r);
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
    i.connectable(StateBinding, null);
    s.mixinAstEvaluator(StateBinding);
    s.mixingBindingLimited(StateBinding, () => "updateTarget");
})();

function isSubscribable(t) {
    return t instanceof Object && "subscribe" in t;
}

const u = new WeakMap;

class StateBindingBehavior {
    constructor() {
        this.L = t.resolve(r);
    }
    bind(t, i) {
        const s = i instanceof StateBinding;
        t = s ? t : createStateBindingScope(this.L.getState(), t);
        let e;
        if (!s) {
            e = u.get(i);
            if (e == null) {
                u.set(i, e = new StateSubscriber(i, t));
            } else {
                e.N = t;
            }
            this.L.subscribe(e);
            i.useScope?.(t);
        }
    }
    unbind(t, i) {
        const s = i instanceof StateBinding;
        if (!s) {
            this.L.unsubscribe(u.get(i));
            u.delete(i);
        }
    }
}

s.BindingBehavior.define("state", StateBindingBehavior);

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
    constructor(t, i, s, e, n, r) {
        this.isBound = false;
        this.boundFn = false;
        this.l = t;
        this.L = n;
        this.ast = i;
        this.G = s;
        this.j = e;
        this.strict = r;
    }
    callSource(t) {
        const s = this.s;
        s.overrideContext.$event = t;
        const e = i.astEvaluate(this.ast, s, this, null);
        delete s.overrideContext.$event;
        void this.L.dispatch(e);
    }
    handleEvent(t) {
        this.callSource(t);
    }
    bind(t) {
        if (this.isBound) {
            return;
        }
        i.astBind(this.ast, t, this);
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
        i.astUnbind(this.ast, this.s, this);
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
    i.connectable(StateDispatchBinding, null);
    s.mixinAstEvaluator(StateDispatchBinding);
    s.mixingBindingLimited(StateDispatchBinding, () => "callSource");
})();

class StateBindingCommand {
    get ignoreAttr() {
        return false;
    }
    build(i, s, e) {
        const n = i.attr;
        let r = n.target;
        let o = n.rawValue;
        o = o === "" ? t.camelCase(r) : o;
        if (i.bindable == null) {
            r = e.map(i.node, r) ?? t.camelCase(r);
        } else {
            r = i.bindable.name;
        }
        return new StateBindingInstruction(o, r);
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

const d = /*@__PURE__*/ s.renderer(class StateBindingInstructionRenderer {
    constructor() {
        this.target = "sb";
        this.q = t.resolve(r);
    }
    render(t, i, s, e, n, r) {
        const o = ensureExpression(n, s.from, "IsFunction");
        t.addBinding(new StateBinding(t, t.container, r, o, i, s.to, this.q, t.strict ?? false));
    }
}, null);

const l = /*@__PURE__*/ s.renderer(class DispatchBindingInstructionRenderer {
    constructor() {
        this.target = "sd";
        this.q = t.resolve(r);
    }
    render(t, i, s, e, n) {
        const r = ensureExpression(n, s.ast, "IsProperty");
        t.addBinding(new StateDispatchBinding(t.container, r, i, s.from, this.q, t.strict ?? false));
    }
}, null);

function ensureExpression(t, i, s) {
    if (typeof i === "string") {
        return t.parse(i, s);
    }
    return i;
}

const f = [ StateBindingCommand, d, DispatchBindingCommand, l, StateBindingBehavior, Store ];

const createConfiguration = (i, e, n = {}) => ({
    register: c => {
        c.register(t.Registration.instance(o, i), ...f, ...e.map(a.define), s.AppTask.creating(t.IContainer, t => {
            const i = t.get(r);
            if (n.middlewares) {
                for (const t of n.middlewares) {
                    i.registerMiddleware(t.middleware, t.placement, t.settings);
                }
            }
            const s = t.get(h);
            if (n.devToolsOptions?.disable !== true && s != null) {
                i.connectDevTools(n.devToolsOptions ?? {});
            }
        }));
    },
    init: (t, i, ...s) => {
        const e = typeof i === "function";
        const n = e ? {} : i;
        s = e ? [ i, ...s ] : s;
        return createConfiguration(t, s, n);
    }
});

const g = /*@__PURE__*/ createConfiguration({}, []);

class StateGetterBinding {
    constructor(t, i, s, e) {
        this.isBound = false;
        this.v = void 0;
        this.M = void 0;
        this.$ = 0;
        this.L = s;
        this.$get = e;
        this.target = t;
        this.key = i;
    }
    updateTarget(t) {
        const i = this.target;
        const s = this.key;
        const e = this.$++;
        const isCurrentValue = () => e === this.$ - 1;
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
        const e = this.$get(this.L.getState());
        if (e === this.v) {
            return;
        }
        this.v = e;
        this.updateTarget(e);
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

i.connectable(StateGetterBinding, null);

function fromState(t) {
    return function(i, s) {
        if (!(i === void 0 && s.kind === "field" || typeof i === "function" && s.kind === "setter")) {
            throw new Error(`Invalid usage. @state can only be used on a field ${i} - ${s.kind}`);
        }
        const e = s.name;
        const n = s.metadata[S] ??= [];
        n.push(new HydratingLifecycleHooks(t, e), new CreatedLifecycleHooks(t, e));
    };
}

const S = t.Protocol.annotation.keyFor("dependencies");

class HydratingLifecycleHooks {
    constructor(t, i) {
        this.$get = t;
        this.key = i;
    }
    register(i) {
        t.Registration.instance(s.ILifecycleHooks, this).register(i);
    }
    hydrating(t, i) {
        const s = i.container;
        if (i.vmKind !== "customElement") return;
        i.addBinding(new StateGetterBinding(t, this.key, s.get(r), this.$get));
    }
}

s.LifecycleHooks.define({}, HydratingLifecycleHooks);

class CreatedLifecycleHooks {
    constructor(t, i) {
        this.$get = t;
        this.key = i;
    }
    register(i) {
        t.Registration.instance(s.ILifecycleHooks, this).register(i);
    }
    created(t, i) {
        const s = i.container;
        if (i.vmKind !== "customAttribute") return;
        i.addBinding(new StateGetterBinding(t, this.key, s.get(r), this.$get));
    }
}

s.LifecycleHooks.define({}, CreatedLifecycleHooks);

function createStateMemoizer(...t) {
    if (t.length === 1) {
        const i = t[0];
        let s;
        let e;
        return t => {
            if (t === s) {
                return e;
            }
            s = t;
            return e = i(t);
        };
    }
    const i = t[t.length - 1];
    const s = t.slice(0, -1);
    let e;
    let n;
    return t => {
        const r = s.map(i => i(t));
        if (e !== undefined && r.length === e.length && r.every((t, i) => t === e[i])) {
            return n;
        }
        e = r;
        return n = i(...r);
    };
}

exports.ActionHandler = a;

exports.DispatchBindingCommand = DispatchBindingCommand;

exports.DispatchBindingInstruction = DispatchBindingInstruction;

exports.DispatchBindingInstructionRenderer = l;

exports.IActionHandler = n;

exports.IState = o;

exports.IStore = r;

exports.StateBinding = StateBinding;

exports.StateBindingBehavior = StateBindingBehavior;

exports.StateBindingCommand = StateBindingCommand;

exports.StateBindingInstruction = StateBindingInstruction;

exports.StateBindingInstructionRenderer = d;

exports.StateDefaultConfiguration = g;

exports.StateDispatchBinding = StateDispatchBinding;

exports.Store = Store;

exports.createStateMemoizer = createStateMemoizer;

exports.fromState = fromState;
//# sourceMappingURL=index.cjs.map
