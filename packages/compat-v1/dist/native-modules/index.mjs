import { BindingBehaviorExpression as t, ValueConverterExpression as e, AssignExpression as i, ConditionalExpression as n, AccessThisExpression as s, AccessScopeExpression as r, AccessMemberExpression as o, AccessKeyedExpression as l, CallScopeExpression as a, CallMemberExpression as h, CallFunctionExpression as c, BinaryExpression as u, UnaryExpression as d, PrimitiveLiteralExpression as g, ArrayLiteralExpression as f, ObjectLiteralExpression as p, TemplateExpression as m, TaggedTemplateExpression as b, ArrayBindingPattern as C, ObjectBindingPattern as v, BindingIdentifier as B, ForOfStatement as D, Interpolation as w, DestructuringAssignmentExpression as L, DestructuringAssignmentSingleExpression as E, DestructuringAssignmentRestExpression as I, ArrowFunction as y, astVisit as S, Unparser as k, IExpressionParser as x } from "../../../expression-parser/dist/native-modules/index.mjs";

import { astEvaluate as M, astAssign as O, astBind as A, astUnbind as R, IObserverLocator as T, getCollectionObserver as $, Scope as W } from "../../../runtime/dist/native-modules/index.mjs";

import { mixinUseScope as _, mixingBindingLimited as j, mixinAstEvaluator as P, renderer as V, IListenerBindingOptions as F, IEventTarget as U, AppTask as q, PropertyBinding as z, AttributeBinding as G, ListenerBinding as H, LetBinding as J, InterpolationPartBinding as K, ContentBinding as N, RefBinding as Q, AuCompose as X, CustomElement as Y, BindableDefinition as Z, ExpressionWatcher as tt } from "../../../runtime-html/dist/native-modules/index.mjs";

import { isString as et, camelCase as it, resolve as nt, isFunction as st, DI as rt, createLookup as ot } from "../../../kernel/dist/native-modules/index.mjs";

let lt = false;

function defineAstMethods() {
    if (lt) {
        return;
    }
    lt = true;
    const def = (t, e, i) => Object.defineProperty(t.prototype, e, {
        configurable: true,
        enumerable: false,
        writable: true,
        value: i
    });
    [ t, e, i, n, s, r, o, l, a, h, c, u, d, g, f, p, m, b, C, v, B, D, w, L, E, I, y ].forEach((t => {
        def(t, "evaluate", (function(...t) {
            return M(this, ...t);
        }));
        def(t, "assign", (function(...t) {
            return O(this, ...t);
        }));
        def(t, "accept", (function(...t) {
            return S(this, ...t);
        }));
        def(t, "bind", (function(...t) {
            return A(this, ...t);
        }));
        def(t, "unbind", (function(...t) {
            return R(this, ...t);
        }));
    }));
    console.warn('"evaluate"/"assign"/"accept"/"visit"/"bind"/"unbind" are only valid on AST with ast $kind "Custom".' + " Import and use astEvaluate/astAssign/astVisit/astBind/astUnbind accordingly.");
}

const at = Reflect.defineProperty;

const defineHiddenProp = (t, e, i) => {
    at(t, e, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: i
    });
    return i;
};

const ensureExpression = (t, e, i) => {
    if (et(e)) {
        return t.parse(e, i);
    }
    return e;
};

const ht = "IsFunction";

const ct = new WeakSet;

const ut = {
    register(t) {
        if (!ct.has(t)) {
            ct.add(t);
            t.register(CallBindingCommand, gt);
        }
    }
};

const dt = "rh";

class CallBindingInstruction {
    constructor(t, e) {
        this.from = t;
        this.to = e;
        this.type = dt;
    }
}

class CallBindingCommand {
    get ignoreAttr() {
        return false;
    }
    build(t, e) {
        const i = t.bindable === null ? it(t.attr.target) : t.bindable.name;
        return new CallBindingInstruction(e.parse(t.attr.rawValue, ht), i);
    }
}

CallBindingCommand.$au = {
    type: "binding-command",
    name: "call"
};

const gt = /*@__PURE__*/ V(class CallBindingRenderer {
    constructor() {
        this.target = dt;
    }
    render(t, e, i, n, s, r) {
        const o = ensureExpression(s, i.from, ht);
        t.addBinding(new CallBinding(t.container, r, o, getTarget(e), i.to));
    }
}, null);

function getTarget(t) {
    if (t.viewModel != null) {
        return t.viewModel;
    }
    return t;
}

class CallBinding {
    constructor(t, e, i, n, s) {
        this.ast = i;
        this.target = n;
        this.targetProperty = s;
        this.isBound = false;
        this.boundFn = false;
        this.l = t;
        this.targetObserver = e.getAccessor(n, s);
    }
    callSource(t) {
        const e = this.s.overrideContext;
        e.$event = t;
        const i = M(this.ast, this.s, this, null);
        Reflect.deleteProperty(e, "$event");
        return i;
    }
    bind(t) {
        if (this.isBound) {
            if (this.s === t) {
                return;
            }
            this.unbind();
        }
        this.s = t;
        A(this.ast, t, this);
        this.targetObserver.setValue((t => this.callSource(t)), this.target, this.targetProperty);
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        R(this.ast, this.s, this);
        this.s = void 0;
        this.targetObserver.setValue(null, this.target, this.targetProperty);
    }
}

(() => {
    _(CallBinding);
    j(CallBinding, (() => "callSource"));
    P(CallBinding);
})();

const ft = new WeakSet;

const pt = {
    register(t) {
        if (ft.has(t)) {
            return;
        }
        ft.add(t);
        t.get(F).prevent = true;
    }
};

const mt = new WeakSet;

const bt = {
    register(t) {
        if (!mt.has(t)) {
            mt.add(t);
            t.register(Bt, DelegateBindingCommand, Ct);
        }
    }
};

class DelegateBindingCommand {
    get ignoreAttr() {
        return true;
    }
    build(t, e) {
        return new DelegateBindingInstruction(e.parse(t.attr.rawValue, ht), t.attr.target, true);
    }
}

DelegateBindingCommand.$au = {
    type: "binding-command",
    name: "delegate"
};

const Ct = /*@__PURE__*/ V(class ListenerBindingRenderer {
    constructor() {
        this.target = "dl";
        this.t = nt(Bt);
    }
    render(t, e, i, n, s) {
        const r = ensureExpression(s, i.from, ht);
        t.addBinding(new DelegateListenerBinding(t.container, r, e, i.to, this.t, new DelegateListenerOptions(i.preventDefault)));
    }
}, null);

class DelegateBindingInstruction {
    constructor(t, e, i) {
        this.from = t;
        this.to = e;
        this.preventDefault = i;
        this.type = "dl";
    }
}

class DelegateListenerOptions {
    constructor(t) {
        this.prevent = t;
    }
}

class DelegateListenerBinding {
    constructor(t, e, i, n, s, r) {
        this.ast = e;
        this.target = i;
        this.targetEvent = n;
        this.eventDelegator = s;
        this.isBound = false;
        this.handler = null;
        this.boundFn = true;
        this.self = false;
        this.l = t;
        this.i = r;
    }
    callSource(t) {
        const e = this.s.overrideContext;
        e.$event = t;
        let i = M(this.ast, this.s, this, null);
        delete e.$event;
        if (st(i)) {
            i = i(t);
        }
        if (i !== true && this.i.prevent) {
            t.preventDefault();
        }
        return i;
    }
    handleEvent(t) {
        if (this.self) {
            if (this.target !== t.composedPath()[0]) {
                return;
            }
        }
        this.callSource(t);
    }
    bind(t) {
        if (this.isBound) {
            if (this.s === t) {
                return;
            }
            this.unbind();
        }
        this.s = t;
        A(this.ast, t, this);
        this.handler = this.eventDelegator.addEventListener(this.l.get(U), this.target, this.targetEvent, this);
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        R(this.ast, this.s, this);
        this.s = void 0;
        this.handler.dispose();
        this.handler = null;
    }
}

(() => {
    _(DelegateListenerBinding);
    j(DelegateListenerBinding, (() => "callSource"));
    P(DelegateListenerBinding);
})();

const vt = {
    capture: false
};

class ListenerTracker {
    constructor(t, e, i = vt) {
        this.h = t;
        this.u = e;
        this.i = i;
        this.C = 0;
        this.B = new Map;
        this.L = new Map;
    }
    I() {
        if (++this.C === 1) {
            this.h.addEventListener(this.u, this, this.i);
        }
    }
    M() {
        if (--this.C === 0) {
            this.h.removeEventListener(this.u, this, this.i);
        }
    }
    dispose() {
        if (this.C > 0) {
            this.C = 0;
            this.h.removeEventListener(this.u, this, this.i);
        }
        this.B.clear();
        this.L.clear();
    }
    O(t) {
        const e = this.i.capture === true ? this.B : this.L;
        let i = e.get(t);
        if (i === void 0) {
            e.set(t, i = ot());
        }
        return i;
    }
    handleEvent(t) {
        const e = this.i.capture === true ? this.B : this.L;
        const i = t.composedPath();
        if (this.i.capture === true) {
            i.reverse();
        }
        for (const n of i) {
            const i = e.get(n);
            if (i === void 0) {
                continue;
            }
            const s = i[this.u];
            if (s === void 0) {
                continue;
            }
            if (st(s)) {
                s(t);
            } else {
                s.handleEvent(t);
            }
            if (t.cancelBubble === true) {
                return;
            }
        }
    }
}

class DelegateSubscription {
    constructor(t, e, i, n) {
        this.A = t;
        this.R = e;
        this.u = i;
        t.I();
        e[i] = n;
    }
    dispose() {
        this.A.M();
        this.R[this.u] = void 0;
    }
}

const Bt = /*@__PURE__*/ rt.createInterface("IEventDelegator", (t => t.cachedCallback((t => {
    const e = t.invoke(EventDelegator);
    t.register(q.deactivating((() => e.dispose())));
    return e;
}))));

class EventDelegator {
    constructor() {
        this.T = ot();
    }
    addEventListener(t, e, i, n, s) {
        const r = this.T[i] ??= new Map;
        let o = r.get(t);
        if (o === void 0) {
            r.set(t, o = new ListenerTracker(t, i, s));
        }
        return new DelegateSubscription(o, o.O(e), i, n);
    }
    dispose() {
        for (const t in this.T) {
            const e = this.T[t];
            for (const t of e.values()) {
                t.dispose();
            }
            e.clear();
        }
    }
}

let Dt = false;

const defineBindingMethods = () => {
    if (Dt) return;
    Dt = true;
    [ [ z, "Property binding" ], [ G, "Attribute binding" ], [ H, "Listener binding" ], [ CallBinding, "Call binding" ], [ J, "Let binding" ], [ K, "Interpolation binding" ], [ N, "Text binding" ], [ Q, "Ref binding" ], [ DelegateListenerBinding, "Delegate Listener binding" ] ].forEach((([t, e]) => {
        Object.defineProperty(t.prototype, "sourceExpression", {
            configurable: true,
            enumerable: false,
            get() {
                console.warn(getMessage(e, this.ast));
                return this.ast;
            },
            set(t) {
                console.warn(getMessage(e, this.ast));
                Reflect.set(this, "ast", t);
            }
        });
    }));
    const getMessage = (t, e) => console.warn(`[DEV:aurelia] @deprecated "sourceExpression" property for expression on ${t}. It has been renamed to "ast". expression: "${k.unparse(e)}"`);
};

let wt = false;

let Lt = false;

const Et = X.prototype;

const It = Symbol();

const yt = Et.attaching;

const St = Et.propertyChanged;

function enableComposeCompat() {
    if (wt) {
        return;
    }
    wt = true;
    if (!Lt) {
        Lt = true;
        const t = Y.getDefinition(X);
        t.bindables.viewModel = Z.create("viewModel");
        t.bindables.view = Z.create("view");
    }
    defineHiddenProp(Et, "viewModelChanged", (function(t) {
        this.component = t;
    }));
    defineHiddenProp(Et, "viewChanged", (function(t) {
        this.template = t;
    }));
    defineHiddenProp(Et, "attaching", (function(...t) {
        this[It] = true;
        if (this.viewModel !== void 0) {
            this.component = this.viewModel;
        }
        if (this.view !== void 0) {
            this.template = this.view;
        }
        this[It] = false;
        return yt.apply(this, t);
    }));
    defineHiddenProp(Et, "propertyChanged", (function(t) {
        if (this[It]) {
            return;
        }
        switch (t) {
          case "viewModel":
          case "view":
            return;
        }
        return St.call(this, t);
    }));
}

function disableComposeCompat() {
    if (!wt) {
        return;
    }
    if (Lt) {
        Lt = false;
        const t = Y.getDefinition(X);
        delete t.bindables.viewModel;
        delete t.bindables.view;
    }
    wt = false;
    delete Et.viewModelChanged;
    delete Et.viewChanged;
    defineHiddenProp(Et, "attaching", yt);
    defineHiddenProp(Et, "propertyChanged", St);
}

class BindingEngine {
    constructor() {
        this.parser = nt(x);
        this.observerLocator = nt(T);
    }
    propertyObserver(t, e) {
        return {
            subscribe: i => {
                const n = this.observerLocator.getObserver(t, e);
                const s = {
                    handleChange: (t, e) => i(t, e)
                };
                n.subscribe(s);
                return {
                    dispose: () => n.unsubscribe(s)
                };
            }
        };
    }
    collectionObserver(t) {
        return {
            subscribe: e => {
                const i = $(t);
                const n = {
                    handleCollectionChange: (t, i) => e(t, i)
                };
                i?.subscribe(n);
                return {
                    dispose: () => i?.unsubscribe(n)
                };
            }
        };
    }
    expressionObserver(t, e) {
        const i = W.create(t, {}, true);
        return {
            subscribe: t => {
                const n = new tt(i, null, this.observerLocator, this.parser.parse(e, "IsProperty"), t);
                n.bind();
                return {
                    dispose: () => n.unbind()
                };
            }
        };
    }
}

const kt = {
    register(t) {
        defineAstMethods();
        defineBindingMethods();
        enableComposeCompat();
        t.register(pt, bt, ut);
    }
};

export { BindingEngine, CallBinding, CallBindingCommand, CallBindingInstruction, gt as CallBindingRenderer, DelegateBindingCommand, DelegateBindingInstruction, DelegateListenerBinding, DelegateListenerOptions, EventDelegator, Bt as IEventDelegator, Ct as ListenerBindingRenderer, ut as callSyntax, kt as compatRegistration, bt as delegateSyntax, disableComposeCompat, enableComposeCompat, pt as eventPreventDefaultBehavior };

