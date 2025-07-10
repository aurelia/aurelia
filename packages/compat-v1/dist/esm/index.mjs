import { BindingBehaviorExpression as t, ValueConverterExpression as e, AssignExpression as i, ConditionalExpression as n, AccessThisExpression as s, AccessScopeExpression as r, AccessMemberExpression as o, AccessKeyedExpression as l, CallScopeExpression as a, CallMemberExpression as c, CallFunctionExpression as h, BinaryExpression as u, UnaryExpression as d, PrimitiveLiteralExpression as g, ArrayLiteralExpression as f, ObjectLiteralExpression as m, TemplateExpression as p, TaggedTemplateExpression as b, ArrayBindingPattern as C, ObjectBindingPattern as v, BindingIdentifier as B, ForOfStatement as w, Interpolation as D, DestructuringAssignmentExpression as L, DestructuringAssignmentSingleExpression as E, DestructuringAssignmentRestExpression as I, ArrowFunction as y, astVisit as S, Unparser as T, IExpressionParser as k } from "@aurelia/expression-parser";

import { astEvaluate as x, astAssign as M, astBind as O, astUnbind as A, IObserverLocator as R, getCollectionObserver as V, Scope as $ } from "@aurelia/runtime";

import { mixinUseScope as W, mixingBindingLimited as _, mixinAstEvaluator as j, renderer as P, IListenerBindingOptions as F, IEventTarget as U, AppTask as q, PropertyBinding as z, AttributeBinding as G, ListenerBinding as H, LetBinding as J, InterpolationPartBinding as K, ContentBinding as N, RefBinding as Q, AuCompose as X, CustomElement as Y, BindableDefinition as Z, ExpressionWatcher as tt } from "@aurelia/runtime-html";

import { Protocol as et, isString as it, camelCase as nt, resolve as st, isFunction as rt, DI as ot, createLookup as lt, getResourceKeyFor as at } from "@aurelia/kernel";

import { Metadata as ct } from "@aurelia/metadata";

let ht = false;

function defineAstMethods() {
    if (ht) {
        return;
    }
    ht = true;
    const def = (t, e, i) => Object.defineProperty(t.prototype, e, {
        configurable: true,
        enumerable: false,
        writable: true,
        value: i
    });
    [ t, e, i, n, s, r, o, l, a, c, h, u, d, g, f, m, p, b, C, v, B, w, D, L, E, I, y ].forEach(t => {
        def(t, "evaluate", function(...t) {
            return x(this, ...t);
        });
        def(t, "assign", function(...t) {
            return M(this, ...t);
        });
        def(t, "accept", function(...t) {
            return S(this, ...t);
        });
        def(t, "bind", function(...t) {
            return O(this, ...t);
        });
        def(t, "unbind", function(...t) {
            return A(this, ...t);
        });
    });
    console.warn('"evaluate"/"assign"/"accept"/"visit"/"bind"/"unbind" are only valid on AST with ast $kind "Custom".' + " Import and use astEvaluate/astAssign/astVisit/astBind/astUnbind accordingly.");
}

const ut = Reflect.defineProperty;

const defineHiddenProp = (t, e, i) => {
    ut(t, e, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: i
    });
    return i;
};

const ensureExpression = (t, e, i) => {
    if (it(e)) {
        return t.parse(e, i);
    }
    return e;
};

const dt = "IsFunction";

const gt = ct.get;

ct.has;

const ft = ct.define;

const {annotation: mt} = et;

const pt = mt.keyFor;

const bt = new WeakSet;

const Ct = {
    register(t) {
        if (!bt.has(t)) {
            bt.add(t);
            t.register(CallBindingCommand, Bt);
        }
    }
};

const vt = "rh";

class CallBindingInstruction {
    constructor(t, e) {
        this.from = t;
        this.to = e;
        this.type = vt;
    }
}

class CallBindingCommand {
    get ignoreAttr() {
        return false;
    }
    build(t, e) {
        const i = t.bindable === null ? nt(t.attr.target) : t.bindable.name;
        return new CallBindingInstruction(e.parse(t.attr.rawValue, dt), i);
    }
}

CallBindingCommand.$au = {
    type: "binding-command",
    name: "call"
};

const Bt = /*@__PURE__*/ P(class CallBindingRenderer {
    constructor() {
        this.target = vt;
    }
    render(t, e, i, n, s, r) {
        const o = ensureExpression(s, i.from, dt);
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
        const i = x(this.ast, this.s, this, null);
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
        O(this.ast, t, this);
        this.targetObserver.setValue(t => this.callSource(t), this.target, this.targetProperty);
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        A(this.ast, this.s, this);
        this.s = void 0;
        this.targetObserver.setValue(null, this.target, this.targetProperty);
    }
}

(() => {
    W(CallBinding);
    _(CallBinding, () => "callSource");
    j(CallBinding);
})();

const wt = new WeakSet;

const Dt = {
    register(t) {
        if (wt.has(t)) {
            return;
        }
        wt.add(t);
        t.get(F).prevent = true;
    }
};

const Lt = new WeakSet;

const Et = {
    register(t) {
        if (!Lt.has(t)) {
            Lt.add(t);
            t.register(St, DelegateBindingCommand, It);
        }
    }
};

class DelegateBindingCommand {
    get ignoreAttr() {
        return true;
    }
    build(t, e) {
        return new DelegateBindingInstruction(e.parse(t.attr.rawValue, dt), t.attr.target, true);
    }
}

DelegateBindingCommand.$au = {
    type: "binding-command",
    name: "delegate"
};

const It = /*@__PURE__*/ P(class ListenerBindingRenderer {
    constructor() {
        this.target = "dl";
        this.t = st(St);
    }
    render(t, e, i, n, s) {
        const r = ensureExpression(s, i.from, dt);
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
        let i = x(this.ast, this.s, this, null);
        delete e.$event;
        if (rt(i)) {
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
        O(this.ast, t, this);
        this.handler = this.eventDelegator.addEventListener(this.l.get(U), this.target, this.targetEvent, this);
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        A(this.ast, this.s, this);
        this.s = void 0;
        this.handler.dispose();
        this.handler = null;
    }
}

(() => {
    W(DelegateListenerBinding);
    _(DelegateListenerBinding, () => "callSource");
    j(DelegateListenerBinding);
})();

const yt = {
    capture: false
};

class ListenerTracker {
    constructor(t, e, i = yt) {
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
    T() {
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
    M(t) {
        const e = this.i.capture === true ? this.B : this.L;
        let i = e.get(t);
        if (i === void 0) {
            e.set(t, i = lt());
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
            if (rt(s)) {
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
        this.O = t;
        this.A = e;
        this.u = i;
        t.I();
        e[i] = n;
    }
    dispose() {
        this.O.T();
        this.A[this.u] = void 0;
    }
}

const St = /*@__PURE__*/ ot.createInterface("IEventDelegator", t => t.cachedCallback(t => {
    const e = t.invoke(EventDelegator);
    t.register(q.deactivating(() => e.dispose()));
    return e;
}));

class EventDelegator {
    constructor() {
        this.R = lt();
    }
    addEventListener(t, e, i, n, s) {
        const r = this.R[i] ??= new Map;
        let o = r.get(t);
        if (o === void 0) {
            r.set(t, o = new ListenerTracker(t, i, s));
        }
        return new DelegateSubscription(o, o.M(e), i, n);
    }
    dispose() {
        for (const t in this.R) {
            const e = this.R[t];
            for (const t of e.values()) {
                t.dispose();
            }
            e.clear();
        }
    }
}

let Tt = false;

const defineBindingMethods = () => {
    if (Tt) return;
    Tt = true;
    [ [ z, "Property binding" ], [ G, "Attribute binding" ], [ H, "Listener binding" ], [ CallBinding, "Call binding" ], [ J, "Let binding" ], [ K, "Interpolation binding" ], [ N, "Text binding" ], [ Q, "Ref binding" ], [ DelegateListenerBinding, "Delegate Listener binding" ] ].forEach(([t, e]) => {
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
    });
    const getMessage = (t, e) => console.warn(`[DEV:aurelia] @deprecated "sourceExpression" property for expression on ${t}. It has been renamed to "ast". expression: "${T.unparse(e)}"`);
};

let kt = false;

let xt = false;

const Mt = X.prototype;

const Ot = Symbol();

const At = Mt.attaching;

const Rt = Mt.propertyChanged;

function enableComposeCompat() {
    if (kt) {
        return;
    }
    kt = true;
    if (!xt) {
        xt = true;
        const t = Y.getDefinition(X);
        t.bindables.viewModel = Z.create("viewModel");
        t.bindables.view = Z.create("view");
    }
    defineHiddenProp(Mt, "viewModelChanged", function(t) {
        this.component = t;
    });
    defineHiddenProp(Mt, "viewChanged", function(t) {
        this.template = t;
    });
    defineHiddenProp(Mt, "attaching", function(...t) {
        this[Ot] = true;
        if (this.viewModel !== void 0) {
            this.component = this.viewModel;
        }
        if (this.view !== void 0) {
            this.template = this.view;
        }
        this[Ot] = false;
        return At.apply(this, t);
    });
    defineHiddenProp(Mt, "propertyChanged", function(t) {
        if (this[Ot]) {
            return;
        }
        switch (t) {
          case "viewModel":
          case "view":
            return;
        }
        return Rt.call(this, t);
    });
}

function disableComposeCompat() {
    if (!kt) {
        return;
    }
    if (xt) {
        xt = false;
        const t = Y.getDefinition(X);
        delete t.bindables.viewModel;
        delete t.bindables.view;
    }
    kt = false;
    delete Mt.viewModelChanged;
    delete Mt.viewChanged;
    defineHiddenProp(Mt, "attaching", At);
    defineHiddenProp(Mt, "propertyChanged", Rt);
}

class BindingEngine {
    constructor() {
        this.parser = st(k);
        this.observerLocator = st(R);
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
                const i = V(t);
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
        const i = $.create(t, {}, true);
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

function noView(t, e) {
    if (t === void 0) {
        return function(t, e) {
            e.addInitializer(function() {
                setTemplate(t, null);
            });
        };
    }
    e.addInitializer(function() {
        setTemplate(t, null);
    });
}

function inlineView(t) {
    return function(e, i) {
        i.addInitializer(function() {
            setTemplate(e, t);
        });
    };
}

const Vt = "custom-element";

const $t = /*@__PURE__*/ at(Vt);

const annotateElementMetadata = (t, e, i) => {
    ft(i, t, pt(e));
};

function setTemplate(t, e) {
    const i = gt($t, t);
    if (i === void 0) {
        annotateElementMetadata(t, "template", e);
        return;
    }
    i.template = e;
}

const Wt = {
    register(t) {
        defineAstMethods();
        defineBindingMethods();
        enableComposeCompat();
        t.register(Dt, Et, Ct);
    }
};

export { BindingEngine, CallBinding, CallBindingCommand, CallBindingInstruction, Bt as CallBindingRenderer, DelegateBindingCommand, DelegateBindingInstruction, DelegateListenerBinding, DelegateListenerOptions, EventDelegator, St as IEventDelegator, It as ListenerBindingRenderer, Ct as callSyntax, Wt as compatRegistration, Et as delegateSyntax, disableComposeCompat, enableComposeCompat, Dt as eventPreventDefaultBehavior, inlineView, noView };
//# sourceMappingURL=index.mjs.map
