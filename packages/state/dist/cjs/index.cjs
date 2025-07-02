"use strict";

var t = require("@aurelia/kernel");

var i = require("@aurelia/runtime");

var s = require("@aurelia/runtime-html");

const n = t.DI.createInterface;

function createStateBindingScope(t, s) {
    const n = {
        bindingContext: t
    };
    const e = i.Scope.create(t, n, true);
    e.parent = s;
    return e;
}

function isSubscribable$1(t) {
    return t instanceof Object && "subscribe" in t;
}

const e = /*@__PURE__*/ n("IActionHandler");

const r = /*@__PURE__*/ n("IStore");

const h = /*@__PURE__*/ n("IState");

const o = "__au_ah__";

const c = Object.freeze({
    define(i) {
        function registry(t, s) {
            return i(t, s);
        }
        registry[o] = true;
        registry.register = function(s) {
            t.Registration.instance(e, i).register(s);
        };
        return registry;
    },
    isType: t => typeof t === "function" && o in t
});

const a = /*@__PURE__*/ n("IDevToolsExtension", t => t.cachedCallback(t => {
    const i = t.get(s.IWindow);
    const n = i.__REDUX_DEVTOOLS_EXTENSION__;
    return n ?? null;
}));

class Store {
    static register(i) {
        i.register(t.Registration.singleton(this, this), t.Registration.aliasTo(this, r));
    }
    constructor() {
        this.t = new Set;
        this.i = false;
        this.h = [];
        this.u = this._state = t.resolve(t.optional(h)) ?? new State;
        this.B = t.resolve(t.all(e));
        this.C = t.resolve(t.ILogger);
        this.I = t.resolve(t.lazy(a));
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
    O(i, s, n) {
        for (const e of i) {
            s = t.onResolve(s, t => e(t, n));
        }
        return t.onResolve(s, t => t);
    }
    dispatch(i) {
        if (this.i) {
            this.h.push(i);
            return;
        }
        this.i = true;
        const afterDispatch = i => t.onResolve(i, i => {
            const s = this.h.shift();
            if (s != null) {
                return t.onResolve(this.O(this.B, i, s), t => {
                    this.T(t);
                    return afterDispatch(t);
                });
            } else {
                this.i = false;
            }
        });
        const s = this.O(this.B, this._state, i);
        if (t.isPromise(s)) {
            return s.then(t => {
                this.T(t);
                return afterDispatch(this._state);
            }, t => {
                this.i = false;
                throw t;
            });
        } else {
            this.T(s);
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
    constructor(t, i, n, e, r, h, o, c) {
        this.isBound = false;
        this.v = void 0;
        this.A = void 0;
        this._ = 0;
        this.boundFn = false;
        this.mode = s.BindingMode.toView;
        this.H = t;
        this.l = i;
        this.L = o;
        this.oL = n;
        this.ast = e;
        this.target = r;
        this.targetProperty = h;
        this.strict = c;
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
        this.updateTarget(this.v = i.astEvaluate(this.ast, this.s = createStateBindingScope(this.L.getState(), t), this, this.mode > s.BindingMode.oneTime ? this : null));
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
        const s = this.obs;
        s.version++;
        t = i.astEvaluate(this.ast, this.s, this, this);
        s.clear();
        this.updateTarget(t);
    }
    handleStateChange() {
        if (!this.isBound) return;
        const t = this.L.getState();
        const n = this.s;
        const e = n.overrideContext;
        n.bindingContext = e.bindingContext = t;
        const r = i.astEvaluate(this.ast, n, this, this.mode > s.BindingMode.oneTime ? this : null);
        if (r === this.v) {
            return;
        }
        this.v = r;
        this.updateTarget(r);
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
        let n;
        if (!s) {
            n = u.get(i);
            if (n == null) {
                u.set(i, n = new StateSubscriber(i, t));
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
            this.L.unsubscribe(u.get(i));
            u.delete(i);
        }
    }
}

s.BindingBehavior.define("state", StateBindingBehavior);

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
    constructor(t, i, s, n, e, r) {
        this.isBound = false;
        this.boundFn = false;
        this.l = t;
        this.L = e;
        this.ast = i;
        this.M = s;
        this.R = n;
        this.strict = r;
    }
    callSource(t) {
        const s = this.s;
        s.overrideContext.$event = t;
        const n = i.astEvaluate(this.ast, s, this, null);
        delete s.overrideContext.$event;
        void this.L.dispatch(n);
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
        this.M.addEventListener(this.R, this);
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
    i.connectable(StateDispatchBinding, null);
    s.mixinAstEvaluator(StateDispatchBinding);
    s.mixingBindingLimited(StateDispatchBinding, () => "callSource");
})();

class StateBindingCommand {
    get ignoreAttr() {
        return false;
    }
    build(i, s, n) {
        const e = i.attr;
        let r = e.target;
        let h = e.rawValue;
        h = h === "" ? t.camelCase(r) : h;
        if (i.bindable == null) {
            r = n.map(i.node, r) ?? t.camelCase(r);
        } else {
            r = i.bindable.name;
        }
        return new StateBindingInstruction(h, r);
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
        this.G = t.resolve(r);
    }
    render(t, i, s, n, e, r) {
        const h = ensureExpression(e, s.from, "IsFunction");
        t.addBinding(new StateBinding(t, t.container, r, h, i, s.to, this.G, t.strict ?? false));
    }
}, null);

const l = /*@__PURE__*/ s.renderer(class DispatchBindingInstructionRenderer {
    constructor() {
        this.target = "sd";
        this.G = t.resolve(r);
    }
    render(t, i, s, n, e) {
        const r = ensureExpression(e, s.ast, "IsProperty");
        t.addBinding(new StateDispatchBinding(t.container, r, i, s.from, this.G, t.strict ?? false));
    }
}, null);

function ensureExpression(t, i, s) {
    if (typeof i === "string") {
        return t.parse(i, s);
    }
    return i;
}

const f = [ StateBindingCommand, d, DispatchBindingCommand, l, StateBindingBehavior, Store ];

const createConfiguration = (i, n, e = {}) => ({
    register: o => {
        o.register(t.Registration.instance(h, i), ...f, ...n.map(c.define), s.AppTask.creating(t.IContainer, t => {
            const i = t.get(r);
            const s = t.get(a);
            if (e.devToolsOptions?.disable !== true && s != null) {
                i.connectDevTools(e.devToolsOptions ?? {});
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

const g = /*@__PURE__*/ createConfiguration({}, []);

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

i.connectable(StateGetterBinding, null);

function fromState(t) {
    return function(i, s) {
        if (!(i === void 0 && s.kind === "field" || typeof i === "function" && s.kind === "setter")) {
            throw new Error(`Invalid usage. @state can only be used on a field ${i} - ${s.kind}`);
        }
        const n = s.name;
        const e = s.metadata[S] ??= [];
        e.push(new HydratingLifecycleHooks(t, n), new CreatedLifecycleHooks(t, n));
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

exports.ActionHandler = c;

exports.DispatchBindingCommand = DispatchBindingCommand;

exports.DispatchBindingInstruction = DispatchBindingInstruction;

exports.DispatchBindingInstructionRenderer = l;

exports.IActionHandler = e;

exports.IState = h;

exports.IStore = r;

exports.StateBinding = StateBinding;

exports.StateBindingBehavior = StateBindingBehavior;

exports.StateBindingCommand = StateBindingCommand;

exports.StateBindingInstruction = StateBindingInstruction;

exports.StateBindingInstructionRenderer = d;

exports.StateDefaultConfiguration = g;

exports.StateDispatchBinding = StateDispatchBinding;

exports.fromState = fromState;
//# sourceMappingURL=index.cjs.map
