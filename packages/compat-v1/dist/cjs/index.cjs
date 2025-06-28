"use strict";

var t = require("@aurelia/expression-parser");

var e = require("@aurelia/runtime");

var i = require("@aurelia/runtime-html");

var n = require("@aurelia/kernel");

var s = require("@aurelia/metadata");

let r = false;

function defineAstMethods() {
    if (r) {
        return;
    }
    r = true;
    const def = (t, e, i) => Object.defineProperty(t.prototype, e, {
        configurable: true,
        enumerable: false,
        writable: true,
        value: i
    });
    [ t.BindingBehaviorExpression, t.ValueConverterExpression, t.AssignExpression, t.ConditionalExpression, t.AccessThisExpression, t.AccessScopeExpression, t.AccessMemberExpression, t.AccessKeyedExpression, t.CallScopeExpression, t.CallMemberExpression, t.CallFunctionExpression, t.BinaryExpression, t.UnaryExpression, t.PrimitiveLiteralExpression, t.ArrayLiteralExpression, t.ObjectLiteralExpression, t.TemplateExpression, t.TaggedTemplateExpression, t.ArrayBindingPattern, t.ObjectBindingPattern, t.BindingIdentifier, t.ForOfStatement, t.Interpolation, t.DestructuringAssignmentExpression, t.DestructuringAssignmentSingleExpression, t.DestructuringAssignmentRestExpression, t.ArrowFunction ].forEach(i => {
        def(i, "evaluate", function(...t) {
            return e.astEvaluate(this, ...t);
        });
        def(i, "assign", function(...t) {
            return e.astAssign(this, ...t);
        });
        def(i, "accept", function(...e) {
            return t.astVisit(this, ...e);
        });
        def(i, "bind", function(...t) {
            return e.astBind(this, ...t);
        });
        def(i, "unbind", function(...t) {
            return e.astUnbind(this, ...t);
        });
    });
    console.warn('"evaluate"/"assign"/"accept"/"visit"/"bind"/"unbind" are only valid on AST with ast $kind "Custom".' + " Import and use astEvaluate/astAssign/astVisit/astBind/astUnbind accordingly.");
}

const o = Reflect.defineProperty;

const defineHiddenProp = (t, e, i) => {
    o(t, e, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: i
    });
    return i;
};

const ensureExpression = (t, e, i) => {
    if (n.isString(e)) {
        return t.parse(e, i);
    }
    return e;
};

const l = "IsFunction";

const a = s.Metadata.get;

s.Metadata.has;

const c = s.Metadata.define;

const {annotation: h} = n.Protocol;

const u = h.keyFor;

const d = new WeakSet;

const g = {
    register(t) {
        if (!d.has(t)) {
            d.add(t);
            t.register(CallBindingCommand, p);
        }
    }
};

const f = "rh";

class CallBindingInstruction {
    constructor(t, e) {
        this.from = t;
        this.to = e;
        this.type = f;
    }
}

class CallBindingCommand {
    get ignoreAttr() {
        return false;
    }
    build(t, e) {
        const i = t.bindable === null ? n.camelCase(t.attr.target) : t.bindable.name;
        return new CallBindingInstruction(e.parse(t.attr.rawValue, l), i);
    }
}

CallBindingCommand.$au = {
    type: "binding-command",
    name: "call"
};

const p = /*@__PURE__*/ i.renderer(class CallBindingRenderer {
    constructor() {
        this.target = f;
    }
    render(t, e, i, n, s, r) {
        const o = ensureExpression(s, i.from, l);
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
        const i = this.s.overrideContext;
        i.$event = t;
        const n = e.astEvaluate(this.ast, this.s, this, null);
        Reflect.deleteProperty(i, "$event");
        return n;
    }
    bind(t) {
        if (this.isBound) {
            if (this.s === t) {
                return;
            }
            this.unbind();
        }
        this.s = t;
        e.astBind(this.ast, t, this);
        this.targetObserver.setValue(t => this.callSource(t), this.target, this.targetProperty);
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        e.astUnbind(this.ast, this.s, this);
        this.s = void 0;
        this.targetObserver.setValue(null, this.target, this.targetProperty);
    }
}

(() => {
    i.mixinUseScope(CallBinding);
    i.mixingBindingLimited(CallBinding, () => "callSource");
    i.mixinAstEvaluator(CallBinding);
})();

const m = new WeakSet;

const b = {
    register(t) {
        if (m.has(t)) {
            return;
        }
        m.add(t);
        t.get(i.IListenerBindingOptions).prevent = true;
    }
};

const C = new WeakSet;

const v = {
    register(t) {
        if (!C.has(t)) {
            C.add(t);
            t.register(x, DelegateBindingCommand, B);
        }
    }
};

class DelegateBindingCommand {
    get ignoreAttr() {
        return true;
    }
    build(t, e) {
        return new DelegateBindingInstruction(e.parse(t.attr.rawValue, l), t.attr.target, true);
    }
}

DelegateBindingCommand.$au = {
    type: "binding-command",
    name: "delegate"
};

const B = /*@__PURE__*/ i.renderer(class ListenerBindingRenderer {
    constructor() {
        this.target = "dl";
        this.t = n.resolve(x);
    }
    render(t, e, i, n, s) {
        const r = ensureExpression(s, i.from, l);
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
        const i = this.s.overrideContext;
        i.$event = t;
        let s = e.astEvaluate(this.ast, this.s, this, null);
        delete i.$event;
        if (n.isFunction(s)) {
            s = s(t);
        }
        if (s !== true && this.i.prevent) {
            t.preventDefault();
        }
        return s;
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
        e.astBind(this.ast, t, this);
        this.handler = this.eventDelegator.addEventListener(this.l.get(i.IEventTarget), this.target, this.targetEvent, this);
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        e.astUnbind(this.ast, this.s, this);
        this.s = void 0;
        this.handler.dispose();
        this.handler = null;
    }
}

(() => {
    i.mixinUseScope(DelegateListenerBinding);
    i.mixingBindingLimited(DelegateListenerBinding, () => "callSource");
    i.mixinAstEvaluator(DelegateListenerBinding);
})();

const w = {
    capture: false
};

class ListenerTracker {
    constructor(t, e, i = w) {
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
            e.set(t, i = n.createLookup());
        }
        return i;
    }
    handleEvent(t) {
        const e = this.i.capture === true ? this.B : this.L;
        const i = t.composedPath();
        if (this.i.capture === true) {
            i.reverse();
        }
        for (const s of i) {
            const i = e.get(s);
            if (i === void 0) {
                continue;
            }
            const r = i[this.u];
            if (r === void 0) {
                continue;
            }
            if (n.isFunction(r)) {
                r(t);
            } else {
                r.handleEvent(t);
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

const x = /*@__PURE__*/ n.DI.createInterface("IEventDelegator", t => t.cachedCallback(t => {
    const e = t.invoke(EventDelegator);
    t.register(i.AppTask.deactivating(() => e.dispose()));
    return e;
}));

class EventDelegator {
    constructor() {
        this.R = n.createLookup();
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

let D = false;

const defineBindingMethods = () => {
    if (D) return;
    D = true;
    [ [ i.PropertyBinding, "Property binding" ], [ i.AttributeBinding, "Attribute binding" ], [ i.ListenerBinding, "Listener binding" ], [ CallBinding, "Call binding" ], [ i.LetBinding, "Let binding" ], [ i.InterpolationPartBinding, "Interpolation binding" ], [ i.ContentBinding, "Text binding" ], [ i.RefBinding, "Ref binding" ], [ DelegateListenerBinding, "Delegate Listener binding" ] ].forEach(([t, e]) => {
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
    const getMessage = (e, i) => console.warn(`[DEV:aurelia] @deprecated "sourceExpression" property for expression on ${e}. It has been renamed to "ast". expression: "${t.Unparser.unparse(i)}"`);
};

let L = false;

let E = false;

const I = i.AuCompose.prototype;

const y = Symbol();

const S = I.attaching;

const T = I.propertyChanged;

function enableComposeCompat() {
    if (L) {
        return;
    }
    L = true;
    if (!E) {
        E = true;
        const t = i.CustomElement.getDefinition(i.AuCompose);
        t.bindables.viewModel = i.BindableDefinition.create("viewModel");
        t.bindables.view = i.BindableDefinition.create("view");
    }
    defineHiddenProp(I, "viewModelChanged", function(t) {
        this.component = t;
    });
    defineHiddenProp(I, "viewChanged", function(t) {
        this.template = t;
    });
    defineHiddenProp(I, "attaching", function(...t) {
        this[y] = true;
        if (this.viewModel !== void 0) {
            this.component = this.viewModel;
        }
        if (this.view !== void 0) {
            this.template = this.view;
        }
        this[y] = false;
        return S.apply(this, t);
    });
    defineHiddenProp(I, "propertyChanged", function(t) {
        if (this[y]) {
            return;
        }
        switch (t) {
          case "viewModel":
          case "view":
            return;
        }
        return T.call(this, t);
    });
}

function disableComposeCompat() {
    if (!L) {
        return;
    }
    if (E) {
        E = false;
        const t = i.CustomElement.getDefinition(i.AuCompose);
        delete t.bindables.viewModel;
        delete t.bindables.view;
    }
    L = false;
    delete I.viewModelChanged;
    delete I.viewChanged;
    defineHiddenProp(I, "attaching", S);
    defineHiddenProp(I, "propertyChanged", T);
}

class BindingEngine {
    constructor() {
        this.parser = n.resolve(t.IExpressionParser);
        this.observerLocator = n.resolve(e.IObserverLocator);
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
            subscribe: i => {
                const n = e.getCollectionObserver(t);
                const s = {
                    handleCollectionChange: (t, e) => i(t, e)
                };
                n?.subscribe(s);
                return {
                    dispose: () => n?.unsubscribe(s)
                };
            }
        };
    }
    expressionObserver(t, n) {
        const s = e.Scope.create(t, {}, true);
        return {
            subscribe: t => {
                const e = new i.ExpressionWatcher(s, null, this.observerLocator, this.parser.parse(n, "IsProperty"), t);
                e.bind();
                return {
                    dispose: () => e.unbind()
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

const k = "custom-element";

const M = /*@__PURE__*/ n.getResourceKeyFor(k);

const annotateElementMetadata = (t, e, i) => {
    c(i, t, u(e));
};

function setTemplate(t, e) {
    const i = a(M, t);
    if (i === void 0) {
        annotateElementMetadata(t, "template", e);
        return;
    }
    i.template = e;
}

const O = {
    register(t) {
        defineAstMethods();
        defineBindingMethods();
        enableComposeCompat();
        t.register(b, v, g);
    }
};

exports.BindingEngine = BindingEngine;

exports.CallBinding = CallBinding;

exports.CallBindingCommand = CallBindingCommand;

exports.CallBindingInstruction = CallBindingInstruction;

exports.CallBindingRenderer = p;

exports.DelegateBindingCommand = DelegateBindingCommand;

exports.DelegateBindingInstruction = DelegateBindingInstruction;

exports.DelegateListenerBinding = DelegateListenerBinding;

exports.DelegateListenerOptions = DelegateListenerOptions;

exports.EventDelegator = EventDelegator;

exports.IEventDelegator = x;

exports.ListenerBindingRenderer = B;

exports.callSyntax = g;

exports.compatRegistration = O;

exports.delegateSyntax = v;

exports.disableComposeCompat = disableComposeCompat;

exports.enableComposeCompat = enableComposeCompat;

exports.eventPreventDefaultBehavior = b;

exports.inlineView = inlineView;

exports.noView = noView;
//# sourceMappingURL=index.cjs.map
