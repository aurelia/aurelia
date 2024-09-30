import { DI as t, Registration as i, resolve as s, optional as n, all as e, ILogger as h, lazy as r, onResolve as o, isPromise as c, camelCase as a, IContainer as u, Protocol as l } from "@aurelia/kernel";

import { Scope as d, AccessorType as f, connectable as g, astEvaluate as S, astBind as p, astUnbind as B } from "@aurelia/runtime";

import { IWindow as b, State as m, mixinAstEvaluator as y, mixingBindingLimited as v, BindingMode as w, BindingBehavior as C, renderer as I, AppTask as D, LifecycleHooks as T, ILifecycleHooks as O } from "@aurelia/runtime-html";

const E = t.createInterface;

function createStateBindingScope(t, i) {
    const s = {
        bindingContext: t
    };
    const n = d.create(t, s, true);
    n.parent = i;
    return n;
}

function isSubscribable$1(t) {
    return t instanceof Object && "subscribe" in t;
}

const A = /*@__PURE__*/ E("IActionHandler");

const _ = /*@__PURE__*/ E("IStore");

const H = /*@__PURE__*/ E("IState");

const L = "__au_ah__";

const P = Object.freeze({
    define(t) {
        function registry(i, s) {
            return t(i, s);
        }
        registry[L] = true;
        registry.register = function(s) {
            i.instance(A, t).register(s);
        };
        return registry;
    },
    isType: t => typeof t === "function" && L in t
});

const k = /*@__PURE__*/ E("IDevToolsExtension", (t => t.cachedCallback((t => {
    const i = t.get(b);
    const s = i.__REDUX_DEVTOOLS_EXTENSION__;
    return s ?? null;
}))));

class Store {
    static register(t) {
        t.register(i.singleton(this, this), i.aliasTo(this, _));
    }
    constructor() {
        this.t = new Set;
        this.i = false;
        this.h = [];
        this.u = this._state = s(n(H)) ?? new State;
        this.B = s(e(A));
        this.C = s(h);
        this.I = s(r(k));
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
        this.t.forEach((s => s.handleStateChange(t, i)));
    }
    getState() {
        return this._state;
    }
    O(t, i, s) {
        for (const n of t) {
            i = o(i, (t => n(t, s)));
        }
        return o(i, (t => t));
    }
    dispatch(t) {
        if (this.i) {
            this.h.push(t);
            return;
        }
        this.i = true;
        const afterDispatch = t => o(t, (t => {
            const i = this.h.shift();
            if (i != null) {
                return o(this.O(this.B, t, i), (t => {
                    this.T(t);
                    return afterDispatch(t);
                }));
            } else {
                this.i = false;
            }
        }));
        const i = this.O(this.B, this._state, t);
        if (c(i)) {
            return i.then((t => {
                this.T(t);
                return afterDispatch(this._state);
            }), (t => {
                this.i = false;
                throw t;
            }));
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
        n.subscribe((t => {
            this.C.info("DevTools sent a message:", t);
            const i = typeof t.payload === "string" ? tryParseJson(t.payload) : t.payload;
            if (i === void 0) {
                return;
            }
            if (t.type === "ACTION") {
                if (i == null) {
                    throw new Error("DevTools sent an action with no payload");
                }
                void new Promise((t => {
                    t(this.dispatch(i));
                })).catch((t => {
                    throw new Error(`Issue when trying to dispatch an action through devtools:\n${t}`);
                })).then((() => {
                    n.send("ACTION", this._state);
                }));
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
        }));
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

const J = f.Layout;

const x = m.activating;

class StateBinding {
    constructor(t, i, s, n, e, h, r, o, c) {
        this.isBound = false;
        this.A = null;
        this.v = void 0;
        this._ = void 0;
        this.H = 0;
        this.boundFn = false;
        this.mode = w.toView;
        this.L = t;
        this.l = i;
        this.P = n;
        this.J = o;
        this.oL = s;
        this.ast = e;
        this.target = h;
        this.targetProperty = r;
        this.strict = c;
    }
    updateTarget(t) {
        const i = this.N;
        const s = this.target;
        const n = this.targetProperty;
        const e = this.H++;
        const isCurrentValue = () => e === this.H - 1;
        this.$();
        if (isSubscribable(t)) {
            this._ = t.subscribe((t => {
                if (isCurrentValue()) {
                    i.setValue(t, s, n);
                }
            }));
            return;
        }
        if (t instanceof Promise) {
            void t.then((t => {
                if (isCurrentValue()) {
                    i.setValue(t, s, n);
                }
            }), (() => {}));
            return;
        }
        i.setValue(t, s, n);
    }
    bind(t) {
        if (this.isBound) {
            return;
        }
        this.N = this.oL.getAccessor(this.target, this.targetProperty);
        this.J.subscribe(this);
        this.updateTarget(this.v = S(this.ast, this.s = createStateBindingScope(this.J.getState(), t), this, this.mode > w.oneTime ? this : null));
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        this.$();
        this.H++;
        this.s = void 0;
        this.A?.cancel();
        this.A = null;
        this.J.unsubscribe(this);
    }
    handleChange(t) {
        if (!this.isBound) {
            return;
        }
        const i = this.L.state !== x && (this.N.type & J) > 0;
        const s = this.obs;
        s.version++;
        t = S(this.ast, this.s, this, this);
        s.clear();
        let n;
        if (i) {
            n = this.A;
            this.A = this.P.queueTask((() => {
                this.updateTarget(t);
                this.A = null;
            }), N);
            n?.cancel();
            n = null;
        } else {
            this.updateTarget(t);
        }
    }
    handleStateChange() {
        if (!this.isBound) {
            return;
        }
        const t = this.J.getState();
        const i = this.s;
        const s = i.overrideContext;
        i.bindingContext = s.bindingContext = t;
        const n = S(this.ast, i, this, this.mode > w.oneTime ? this : null);
        const e = this.L.state !== x && (this.N.type & J) > 0;
        if (n === this.v) {
            return;
        }
        this.v = n;
        let h = null;
        if (e) {
            h = this.A;
            this.A = this.P.queueTask((() => {
                this.updateTarget(n);
                this.A = null;
            }), N);
            h?.cancel();
        } else {
            this.updateTarget(this.v);
        }
    }
    $() {
        if (typeof this._ === "function") {
            this._();
        } else if (this._ !== void 0) {
            this._.dispose?.();
            this._.unsubscribe?.();
        }
        this._ = void 0;
    }
}

(() => {
    g(StateBinding, null);
    y(StateBinding);
    v(StateBinding, (() => "updateTarget"));
})();

function isSubscribable(t) {
    return t instanceof Object && "subscribe" in t;
}

const N = {
    preempt: true
};

const $ = new WeakMap;

class StateBindingBehavior {
    constructor() {
        this.J = s(_);
    }
    bind(t, i) {
        const s = i instanceof StateBinding;
        t = s ? t : createStateBindingScope(this.J.getState(), t);
        let n;
        if (!s) {
            n = $.get(i);
            if (n == null) {
                $.set(i, n = new StateSubscriber(i, t));
            } else {
                n.M = t;
            }
            this.J.subscribe(n);
            i.useScope?.(t);
        }
    }
    unbind(t, i) {
        const s = i instanceof StateBinding;
        if (!s) {
            this.J.unsubscribe($.get(i));
            $.delete(i);
        }
    }
}

C.define("state", StateBindingBehavior);

class StateSubscriber {
    constructor(t, i) {
        this.R = t;
        this.M = i;
    }
    handleStateChange(t) {
        const i = this.M;
        const s = i.overrideContext;
        i.bindingContext = s.bindingContext = t;
        this.R.handleChange?.(undefined, undefined);
    }
}

class StateDispatchBinding {
    constructor(t, i, s, n, e, h) {
        this.isBound = false;
        this.boundFn = false;
        this.l = t;
        this.J = e;
        this.ast = i;
        this.G = s;
        this.j = n;
        this.strict = h;
    }
    callSource(t) {
        const i = this.s;
        i.overrideContext.$event = t;
        const s = S(this.ast, i, this, null);
        delete i.overrideContext.$event;
        void this.J.dispatch(s);
    }
    handleEvent(t) {
        this.callSource(t);
    }
    bind(t) {
        if (this.isBound) {
            return;
        }
        p(this.ast, t, this);
        this.s = createStateBindingScope(this.J.getState(), t);
        this.G.addEventListener(this.j, this);
        this.J.subscribe(this);
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        B(this.ast, this.s, this);
        this.s = void 0;
        this.G.removeEventListener(this.j, this);
        this.J.unsubscribe(this);
    }
    handleStateChange(t) {
        const i = this.s;
        const s = i.overrideContext;
        i.bindingContext = s.bindingContext = t;
    }
}

(() => {
    g(StateDispatchBinding, null);
    y(StateDispatchBinding);
    v(StateDispatchBinding, (() => "callSource"));
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

const M = /*@__PURE__*/ I(class StateBindingInstructionRenderer {
    constructor() {
        this.target = "sb";
        this.K = s(_);
    }
    render(t, i, s, n, e, h) {
        const r = ensureExpression(e, s.from, "IsFunction");
        t.addBinding(new StateBinding(t, t.container, h, n.domQueue, r, i, s.to, this.K, t.strict ?? false));
    }
}, null);

const R = /*@__PURE__*/ I(class DispatchBindingInstructionRenderer {
    constructor() {
        this.target = "sd";
        this.K = s(_);
    }
    render(t, i, s, n, e) {
        const h = ensureExpression(e, s.ast, "IsProperty");
        t.addBinding(new StateDispatchBinding(t.container, h, i, s.from, this.K, t.strict ?? false));
    }
}, null);

function ensureExpression(t, i, s) {
    if (typeof i === "string") {
        return t.parse(i, s);
    }
    return i;
}

const G = [ StateBindingCommand, M, DispatchBindingCommand, R, StateBindingBehavior, Store ];

const createConfiguration = (t, s, n = {}) => ({
    register: e => {
        e.register(i.instance(H, t), ...G, ...s.map(P.define), D.creating(u, (t => {
            const i = t.get(_);
            const s = t.get(k);
            if (n.devToolsOptions?.disable !== true && s != null) {
                i.connectDevTools(n.devToolsOptions ?? {});
            }
        })));
    },
    init: (t, i, ...s) => {
        const n = typeof i === "function";
        const e = n ? {} : i;
        s = n ? [ i, ...s ] : s;
        return createConfiguration(t, s, e);
    }
});

const j = /*@__PURE__*/ createConfiguration({}, []);

class StateGetterBinding {
    constructor(t, i, s, n) {
        this.isBound = false;
        this.v = void 0;
        this._ = void 0;
        this.H = 0;
        this.J = s;
        this.$get = n;
        this.target = t;
        this.key = i;
    }
    updateTarget(t) {
        const i = this.target;
        const s = this.key;
        const n = this.H++;
        const isCurrentValue = () => n === this.H - 1;
        this.$();
        if (isSubscribable$1(t)) {
            this._ = t.subscribe((t => {
                if (isCurrentValue()) {
                    i[s] = t;
                }
            }));
            return;
        }
        if (t instanceof Promise) {
            void t.then((t => {
                if (isCurrentValue()) {
                    i[s] = t;
                }
            }), (() => {}));
            return;
        }
        i[s] = t;
    }
    bind(t) {
        if (this.isBound) {
            return;
        }
        const i = this.J.getState();
        this.s = createStateBindingScope(i, t);
        this.J.subscribe(this);
        this.updateTarget(this.v = this.$get(i));
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        this.$();
        this.H++;
        this.s = void 0;
        this.J.unsubscribe(this);
    }
    handleStateChange(t) {
        const i = this.s;
        const s = i.overrideContext;
        i.bindingContext = s.bindingContext = t;
        const n = this.$get(this.J.getState());
        if (n === this.v) {
            return;
        }
        this.v = n;
        this.updateTarget(n);
    }
    $() {
        if (typeof this._ === "function") {
            this._();
        } else if (this._ !== void 0) {
            this._.dispose?.();
            this._.unsubscribe?.();
        }
        this._ = void 0;
    }
}

g(StateGetterBinding, null);

function fromState(t) {
    return function(i, s) {
        if (!(i === void 0 && s.kind === "field" || typeof i === "function" && s.kind === "setter")) {
            throw new Error(`Invalid usage. @state can only be used on a field ${i} - ${s.kind}`);
        }
        const n = s.name;
        const e = s.metadata[K] ??= [];
        e.push(new HydratingLifecycleHooks(t, n), new CreatedLifecycleHooks(t, n));
    };
}

const K = l.annotation.keyFor("dependencies");

class HydratingLifecycleHooks {
    constructor(t, i) {
        this.$get = t;
        this.key = i;
    }
    register(t) {
        i.instance(O, this).register(t);
    }
    hydrating(t, i) {
        const s = i.container;
        if (i.vmKind !== "customElement") return;
        i.addBinding(new StateGetterBinding(t, this.key, s.get(_), this.$get));
    }
}

T.define({}, HydratingLifecycleHooks);

class CreatedLifecycleHooks {
    constructor(t, i) {
        this.$get = t;
        this.key = i;
    }
    register(t) {
        i.instance(O, this).register(t);
    }
    created(t, i) {
        const s = i.container;
        if (i.vmKind !== "customAttribute") return;
        i.addBinding(new StateGetterBinding(t, this.key, s.get(_), this.$get));
    }
}

T.define({}, CreatedLifecycleHooks);

export { P as ActionHandler, DispatchBindingCommand, DispatchBindingInstruction, R as DispatchBindingInstructionRenderer, A as IActionHandler, H as IState, _ as IStore, StateBinding, StateBindingBehavior, StateBindingCommand, StateBindingInstruction, M as StateBindingInstructionRenderer, j as StateDefaultConfiguration, StateDispatchBinding, fromState };
//# sourceMappingURL=index.mjs.map
