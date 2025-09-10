"use strict";

var t = require("@aurelia/kernel");

var i = require("@aurelia/validation");

var e = require("@aurelia/runtime-html");

var s = require("@aurelia/expression-parser");

var r = require("@aurelia/runtime");

function __esDecorate(t, i, e, s, r, n) {
    function accept(t) {
        if (t !== void 0 && typeof t !== "function") throw new TypeError("Function expected");
        return t;
    }
    var o = s.kind, a = o === "getter" ? "get" : o === "setter" ? "set" : "value";
    var l = !i && t ? s["static"] ? t : t.prototype : null;
    var h = i || (l ? Object.getOwnPropertyDescriptor(l, s.name) : {});
    var c, u = false;
    for (var d = e.length - 1; d >= 0; d--) {
        var f = {};
        for (var v in s) f[v] = v === "access" ? {} : s[v];
        for (var v in s.access) f.access[v] = s.access[v];
        f.addInitializer = function(t) {
            if (u) throw new TypeError("Cannot add initializers after decoration has completed");
            n.push(accept(t || null));
        };
        var g = (0, e[d])(o === "accessor" ? {
            get: h.get,
            set: h.set
        } : h[a], f);
        if (o === "accessor") {
            if (g === void 0) continue;
            if (g === null || typeof g !== "object") throw new TypeError("Object expected");
            if (c = accept(g.get)) h.get = c;
            if (c = accept(g.set)) h.set = c;
            if (c = accept(g.init)) r.unshift(c);
        } else if (c = accept(g)) {
            if (o === "field") r.unshift(c); else h[a] = c;
        }
    }
    if (l) Object.defineProperty(l, s.name, h);
    u = true;
}

function __runInitializers(t, i, e) {
    var s = arguments.length > 2;
    for (var r = 0; r < i.length; r++) {
        e = s ? i[r].call(t, e) : i[r].call(t);
    }
    return s ? e : void 0;
}

typeof SuppressedError === "function" ? SuppressedError : function(t, i, e) {
    var s = new Error(e);
    return s.name = "SuppressedError", s.error = t, s.suppressed = i, s;
};

const createMappedError = (t, ...i) => new Error(`AUR${String(t).padStart(4, "0")}:${i.map(String)}`);

class ControllerValidateResult {
    constructor(t, i, e) {
        this.valid = t;
        this.results = i;
        this.instruction = e;
    }
}

class ValidationResultTarget {
    constructor(t, i) {
        this.result = t;
        this.targets = i;
    }
}

class ValidationEvent {
    constructor(t, i, e) {
        this.kind = t;
        this.addedResults = i;
        this.removedResults = e;
    }
}

class BindingInfo {
    constructor(t, i, e, s, r = void 0) {
        this.sourceObserver = t;
        this.target = i;
        this.scope = e;
        this.rules = s;
        this.propertyInfo = r;
    }
}

class PropertyInfo {
    constructor(t, i) {
        this.object = t;
        this.propertyName = i;
    }
}

function getPropertyInfo(t, i) {
    let e = i.propertyInfo;
    if (e !== void 0) {
        return e;
    }
    const s = i.scope;
    let n = t.ast.expression;
    let o = true;
    let a = "";
    while (n !== void 0 && n?.$kind !== "AccessScope") {
        let e;
        switch (n.$kind) {
          case "BindingBehavior":
          case "ValueConverter":
            n = n.expression;
            continue;

          case "AccessMember":
            e = n.name;
            break;

          case "AccessKeyed":
            {
                const a = n.key;
                if (o) {
                    o = a.$kind === "PrimitiveLiteral";
                }
                e = `[${r.astEvaluate(a, s, t, i.sourceObserver).toString()}]`;
                break;
            }

          default:
            throw createMappedError(4205, n.constructor.name);
        }
        const l = a.startsWith("[") ? "" : ".";
        a = a.length === 0 ? e : `${e}${l}${a}`;
        n = n.object;
    }
    if (n === void 0) {
        throw createMappedError(4206, t.ast.expression);
    }
    let l;
    if (a.length === 0) {
        a = n.name;
        l = s.bindingContext;
    } else {
        l = r.astEvaluate(n, s, t, i.sourceObserver);
    }
    if (l === null || l === void 0) {
        return void 0;
    }
    e = new PropertyInfo(l, a);
    if (o) {
        i.propertyInfo = e;
    }
    return e;
}

const n = /*@__PURE__*/ t.DI.createInterface("IValidationController");

class ValidationController {
    constructor() {
        this.bindings = new Map;
        this.subscribers = new Set;
        this.results = [];
        this.validating = false;
        this.elements = new WeakMap;
        this.objects = new Map;
        this.validator = t.resolve(i.IValidator);
        this.parser = t.resolve(s.IExpressionParser);
        this.platform = t.resolve(e.IPlatform);
        this.locator = t.resolve(t.IServiceLocator);
    }
    addObject(t, i) {
        this.objects.set(t, i);
    }
    removeObject(t) {
        this.objects.delete(t);
        this.processResultDelta("reset", this.results.filter(i => i.object === t), []);
    }
    addError(t, e, s) {
        let r;
        if (s !== void 0) {
            [r] = i.parsePropertyName(s, this.parser);
        }
        const n = new i.ValidationResult(false, t, r, e, undefined, undefined, true);
        this.processResultDelta("validate", [], [ n ]);
        return n;
    }
    removeError(t) {
        if (this.results.includes(t)) {
            this.processResultDelta("reset", [ t ], []);
        }
    }
    addSubscriber(t) {
        this.subscribers.add(t);
    }
    removeSubscriber(t) {
        this.subscribers.delete(t);
    }
    registerBinding(t, i) {
        this.bindings.set(t, i);
    }
    unregisterBinding(t) {
        this.resetBinding(t);
        this.bindings.delete(t);
    }
    async validate(t) {
        const {object: e, objectTag: s} = t ?? {};
        let n;
        if (e !== void 0) {
            n = [ new i.ValidateInstruction(e, t?.propertyName, t?.rules ?? this.objects.get(e), s, t?.propertyTag) ];
        } else {
            n = [ ...Array.from(this.objects.entries()).map(([t, e]) => new i.ValidateInstruction(t, void 0, e, s)), ...Array.from(this.bindings.entries()).reduce((e, [r, n]) => {
                if (!r.isBound) return e;
                const o = getPropertyInfo(r, n);
                if (o !== void 0 && !this.objects.has(o.object)) {
                    e.push(new i.ValidateInstruction(o.object, o.propertyName, n.rules, s, t?.propertyTag));
                }
                return e;
            }, []) ];
        }
        this.validating = true;
        const o = r.queueAsyncTask(async () => {
            try {
                const i = await Promise.all(n.map(async t => this.validator.validate(t)));
                const e = i.reduce((t, i) => {
                    t.push(...i);
                    return t;
                }, []);
                const s = this.getInstructionPredicate(t);
                const r = this.results.filter(s);
                this.processResultDelta("validate", r, e);
                return new ControllerValidateResult(e.find(t => !t.valid) === void 0, e, t);
            } finally {
                this.validating = false;
            }
        });
        return o.result;
    }
    reset(t) {
        const i = this.getInstructionPredicate(t);
        const e = this.results.filter(i);
        this.processResultDelta("reset", e, []);
    }
    async validateBinding(t) {
        if (!t.isBound) {
            return;
        }
        const e = this.bindings.get(t);
        if (e === void 0) {
            return;
        }
        const s = getPropertyInfo(t, e);
        const r = e.rules;
        if (s === void 0) {
            return;
        }
        const {object: n, propertyName: o} = s;
        await this.validate(new i.ValidateInstruction(n, o, r));
    }
    resetBinding(t) {
        const e = this.bindings.get(t);
        if (e === void 0) {
            return;
        }
        const s = getPropertyInfo(t, e);
        if (s === void 0) {
            return;
        }
        e.propertyInfo = void 0;
        const {object: r, propertyName: n} = s;
        this.reset(new i.ValidateInstruction(r, n));
    }
    async revalidateErrors() {
        const t = this.results.reduce((t, {isManual: i, object: e, propertyRule: s, rule: r, valid: n}) => {
            if (!n && !i && s !== void 0 && e !== void 0 && r !== void 0) {
                let i = t.get(e);
                if (i === void 0) {
                    t.set(e, i = new Map);
                }
                let n = i.get(s);
                if (n === void 0) {
                    i.set(s, n = []);
                }
                n.push(r);
            }
            return t;
        }, new Map);
        const e = [];
        for (const [s, r] of t) {
            e.push(this.validate(new i.ValidateInstruction(s, undefined, Array.from(r).map(([{validationRules: t, messageProvider: e, property: s}, r]) => new i.PropertyRule(this.locator, t, e, s, [ r ])))));
        }
        await Promise.all(e);
    }
    getInstructionPredicate(t) {
        if (t === void 0) {
            return () => true;
        }
        const i = t.propertyName;
        const e = t.rules;
        return s => !s.isManual && s.object === t.object && (i === void 0 || s.propertyName === i) && (e === void 0 || e.includes(s.propertyRule) || e.some(t => s.propertyRule === void 0 || t.$rules.flat().every(t => s.propertyRule.$rules.flat().includes(t))));
    }
    getAssociatedElements({object: t, propertyName: i}) {
        const e = [];
        for (const [s, r] of this.bindings.entries()) {
            const n = getPropertyInfo(s, r);
            if (n !== void 0 && n.object === t && n.propertyName === i) {
                e.push(r.target);
            }
        }
        return e;
    }
    processResultDelta(t, i, e) {
        const s = new ValidationEvent(t, [], []);
        e = e.slice(0);
        const r = this.elements;
        for (const t of i) {
            const i = r.get(t);
            r.delete(t);
            s.removedResults.push(new ValidationResultTarget(t, i));
            const n = e.findIndex(i => i.rule === t.rule && i.object === t.object && i.propertyName === t.propertyName);
            if (n === -1) {
                this.results.splice(this.results.indexOf(t), 1);
            } else {
                const i = e.splice(n, 1)[0];
                const o = this.getAssociatedElements(i);
                r.set(i, o);
                s.addedResults.push(new ValidationResultTarget(i, o));
                this.results.splice(this.results.indexOf(t), 1, i);
            }
        }
        for (const t of e) {
            const i = this.getAssociatedElements(t);
            s.addedResults.push(new ValidationResultTarget(t, i));
            r.set(t, i);
            this.results.push(t);
        }
        for (const t of this.subscribers) {
            t.handleValidationEvent(s);
        }
    }
}

class ValidationControllerFactory {
    constructor() {
        this.Type = void 0;
    }
    registerTransformer(t) {
        return false;
    }
    construct(t, i) {
        return t.invoke(ValidationController, i);
    }
}

function compareDocumentPositionFlat(t, i) {
    switch (t.compareDocumentPosition(i) & 2) {
      case 0:
        return 0;

      case 2:
        return 1;

      default:
        return -1;
    }
}

const o = `\n<slot></slot>\n<slot name='secondary'>\n  <span repeat.for="error of errors">\n    \${error.result.message}\n  </span>\n</slot>\n`;

const a = {
    name: "validation-container",
    shadowOptions: {
        mode: "open"
    },
    hasSlots: true
};

let l = (() => {
    var i;
    let s;
    let r = [];
    let o = [];
    let a;
    let l = [];
    let h = [];
    return i = class ValidationContainerCustomElement {
        constructor() {
            this.controller = __runInitializers(this, r, void 0);
            this.errors = (__runInitializers(this, o), __runInitializers(this, l, []));
            this.host = (__runInitializers(this, h), t.resolve(e.INode));
            this.scopedController = t.resolve(t.optional(n));
        }
        handleValidationEvent(t) {
            for (const {result: i} of t.removedResults) {
                const t = this.errors.findIndex(t => t.result === i);
                if (t !== -1) {
                    this.errors.splice(t, 1);
                }
            }
            for (const {result: i, targets: e} of t.addedResults) {
                if (i.valid) {
                    continue;
                }
                const t = e.filter(t => this.host.contains(t));
                if (t.length > 0) {
                    this.errors.push(new ValidationResultTarget(i, t));
                }
            }
            this.errors.sort((t, i) => {
                if (t.targets[0] === i.targets[0]) {
                    return 0;
                }
                return compareDocumentPositionFlat(t.targets[0], i.targets[0]);
            });
        }
        binding() {
            this.controller = this.controller ?? this.scopedController;
            this.controller.addSubscriber(this);
        }
        unbinding() {
            this.controller.removeSubscriber(this);
        }
    }, (() => {
        const t = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        s = [ e.bindable ];
        a = [ e.bindable ];
        __esDecorate(null, null, s, {
            kind: "field",
            name: "controller",
            static: false,
            private: false,
            access: {
                has: t => "controller" in t,
                get: t => t.controller,
                set: (t, i) => {
                    t.controller = i;
                }
            },
            metadata: t
        }, r, o);
        __esDecorate(null, null, a, {
            kind: "field",
            name: "errors",
            static: false,
            private: false,
            access: {
                has: t => "errors" in t,
                get: t => t.errors,
                set: (t, i) => {
                    t.errors = i;
                }
            },
            metadata: t
        }, l, h);
        if (t) Object.defineProperty(i, Symbol.metadata, {
            enumerable: true,
            configurable: true,
            writable: true,
            value: t
        });
    })(), i;
})();

class ValidationErrorsCustomAttribute {
    constructor() {
        this.errors = [];
        this.errorsInternal = [];
        this.host = t.resolve(e.INode);
        this.scopedController = t.resolve(t.optional(n));
    }
    handleValidationEvent(t) {
        for (const {result: i} of t.removedResults) {
            const t = this.errorsInternal.findIndex(t => t.result === i);
            if (t !== -1) {
                this.errorsInternal.splice(t, 1);
            }
        }
        for (const {result: i, targets: e} of t.addedResults) {
            if (i.valid) {
                continue;
            }
            const t = e.filter(t => this.host.contains(t));
            if (t.length > 0) {
                this.errorsInternal.push(new ValidationResultTarget(i, t));
            }
        }
        this.errorsInternal.sort((t, i) => {
            if (t.targets[0] === i.targets[0]) {
                return 0;
            }
            return compareDocumentPositionFlat(t.targets[0], i.targets[0]);
        });
        this.errors = this.errorsInternal;
    }
    binding() {
        this.controller = this.controller ?? this.scopedController;
        this.controller.addSubscriber(this);
    }
    unbinding() {
        this.controller.removeSubscriber(this);
    }
}

e.CustomAttribute.define({
    name: "validation-errors",
    bindables: {
        controller: {},
        errors: {
            primary: true,
            mode: e.BindingMode.twoWay
        }
    }
}, ValidationErrorsCustomAttribute);

exports.ValidationTrigger = void 0;

(function(t) {
    t["manual"] = "manual";
    t["blur"] = "blur";
    t["focusout"] = "focusout";
    t["change"] = "change";
    t["changeOrBlur"] = "changeOrBlur";
    t["changeOrFocusout"] = "changeOrFocusout";
})(exports.ValidationTrigger || (exports.ValidationTrigger = {}));

const h = /*@__PURE__*/ t.DI.createInterface("IDefaultTrigger");

const c = new WeakMap;

const u = new WeakMap;

class ValidateBindingBehavior {
    constructor() {
        this.p = t.resolve(e.IPlatform);
        this.oL = t.resolve(r.IObserverLocator);
    }
    bind(i, s) {
        if (!(s instanceof e.PropertyBinding)) {
            throw createMappedError(4200);
        }
        let r = c.get(s);
        if (r == null) {
            c.set(s, r = new ValidationConnector(this.p, this.oL, s.get(h), s, s.get(t.IContainer)));
        }
        let n = u.get(s);
        if (n == null) {
            u.set(s, n = new WithValidationTargetSubscriber(r, s, s.get(e.IFlushQueue)));
        }
        r.start(i);
        s.useTargetSubscriber(n);
    }
    unbind(t, i) {
        c.get(i)?.stop();
    }
}

e.BindingBehavior.define("validate", ValidateBindingBehavior);

class ValidationConnector {
    constructor(t, i, e, s, r) {
        this.isChangeTrigger = false;
        this.isDirty = false;
        this.validatedOnce = false;
        this.triggerEvent = null;
        this.t = false;
        this.propertyBinding = s;
        this.target = s.target;
        this.defaultTrigger = e;
        this.p = t;
        this.oL = i;
        this.l = r;
        this.i = new BindingMediator("handleSourceChange", this, i, r);
        this.h = new BindingMediator("handleTriggerChange", this, i, r);
        this.u = new BindingMediator("handleControllerChange", this, i, r);
        this.V = new BindingMediator("handleRulesChange", this, i, r);
        if (r.has(n, true)) {
            this.scopedController = r.get(n);
        }
    }
    C() {
        this.isDirty = true;
        const t = this.triggerEvent;
        if (this.isChangeTrigger && (t === null || t !== null && this.validatedOnce)) {
            this.validateBinding();
        }
    }
    handleEvent(t) {
        if (!this.isChangeTrigger || this.isChangeTrigger && this.isDirty) {
            this.validateBinding();
        }
    }
    start(t) {
        this.scope = t;
        this.target = this.B();
        const i = this._();
        if (!this.R(i) && this.bindingInfo != null) {
            this.controller?.registerBinding(this.propertyBinding, this.bindingInfo);
            this.controller?.addSubscriber(this);
        }
    }
    stop() {
        this.t = false;
        this.scope = void 0;
        const t = this.triggerEvent;
        if (t !== null) {
            this.target?.removeEventListener(t, this);
        }
        this.controller?.resetBinding(this.propertyBinding);
        this.controller?.unregisterBinding(this.propertyBinding);
        this.controller?.removeSubscriber(this);
    }
    handleTriggerChange(t, i) {
        this.R(new ValidateArgumentsDelta(void 0, this.T(t), void 0));
    }
    handleControllerChange(t, i) {
        this.R(new ValidateArgumentsDelta(this.I(t), void 0, void 0));
    }
    handleRulesChange(t, i) {
        this.R(new ValidateArgumentsDelta(void 0, void 0, this.P(t)));
    }
    handleSourceChange(t, i) {
        if (this.source !== t) {
            this.source = t;
            this.bindingInfo.propertyInfo = void 0;
        }
    }
    handleValidationEvent(t) {
        if (this.validatedOnce || !this.isChangeTrigger) return;
        const i = this.triggerEvent;
        if (i === null) return;
        const e = this.bindingInfo.propertyInfo?.propertyName;
        if (e === void 0) return;
        this.validatedOnce = t.addedResults.find(t => t.result.propertyName === e) !== void 0;
    }
    _() {
        const t = this.scope;
        let i;
        let e;
        let s;
        let n = this.propertyBinding.ast;
        while (n.name !== "validate" && n !== void 0) {
            n = n.expression;
        }
        const o = n.args;
        for (let n = 0, a = o.length; n < a; n++) {
            const a = o[n];
            switch (n) {
              case 0:
                e = this.T(r.astEvaluate(a, t, this, this.h));
                break;

              case 1:
                s = this.I(r.astEvaluate(a, t, this, this.u));
                break;

              case 2:
                i = this.P(r.astEvaluate(a, t, this, this.V));
                break;

              default:
                throw createMappedError(4201, n + 1, r.astEvaluate(a, t, this, null));
            }
        }
        return new ValidateArgumentsDelta(this.I(s), this.T(e), i);
    }
    validateBinding() {
        if (this.t) {
            return;
        }
        this.t = true;
        void r.queueAsyncTask(() => {
            this.t = false;
            return this.controller.validateBinding(this.propertyBinding);
        });
    }
    R(t) {
        const i = t.trigger ?? this.trigger;
        const e = t.controller ?? this.controller;
        const s = t.rules;
        if (this.trigger !== i) {
            let t = this.triggerEvent;
            if (t !== null) {
                this.target.removeEventListener(t, this);
            }
            this.validatedOnce = false;
            this.isDirty = false;
            this.trigger = i;
            this.isChangeTrigger = i === exports.ValidationTrigger.change || i === exports.ValidationTrigger.changeOrBlur || i === exports.ValidationTrigger.changeOrFocusout;
            t = this.triggerEvent = this.A(this.trigger);
            if (t !== null) {
                this.target.addEventListener(t, this);
            }
        }
        if (this.controller !== e || s !== void 0) {
            this.controller?.removeSubscriber(this);
            this.controller?.unregisterBinding(this.propertyBinding);
            this.controller = e;
            e.registerBinding(this.propertyBinding, this.M(s));
            e.addSubscriber(this);
            return true;
        }
        return false;
    }
    T(t) {
        if (t === void 0 || t === null) {
            t = this.defaultTrigger;
        } else if (!Object.values(exports.ValidationTrigger).includes(t)) {
            throw createMappedError(4202, t);
        }
        return t;
    }
    I(t) {
        if (t == null) {
            t = this.scopedController;
        } else if (!(t instanceof ValidationController)) {
            throw createMappedError(4203, t);
        }
        return t;
    }
    P(t) {
        if (Array.isArray(t) && t.every(t => t instanceof i.PropertyRule)) {
            return t;
        }
    }
    B() {
        const t = this.propertyBinding.target;
        if (t instanceof this.p.Node) {
            return t;
        } else {
            const i = t?.$controller;
            if (i === void 0) {
                throw createMappedError(4204);
            }
            return i.host;
        }
    }
    A(t) {
        let i = null;
        switch (t) {
          case exports.ValidationTrigger.blur:
          case exports.ValidationTrigger.changeOrBlur:
            i = "blur";
            break;

          case exports.ValidationTrigger.focusout:
          case exports.ValidationTrigger.changeOrFocusout:
            i = "focusout";
            break;
        }
        return i;
    }
    M(t) {
        return this.bindingInfo = new BindingInfo(this.i, this.target, this.scope, t);
    }
}

r.connectable(ValidationConnector, null);

r.mixinNoopAstEvaluator(ValidationConnector);

class WithValidationTargetSubscriber extends e.BindingTargetSubscriber {
    constructor(t, i, e) {
        super(i, e);
        this.vs = t;
    }
    handleChange(t, i) {
        super.handleChange(t, i);
        this.vs.C();
    }
}

class ValidateArgumentsDelta {
    constructor(t, i, e) {
        this.controller = t;
        this.trigger = i;
        this.rules = e;
    }
}

class BindingMediator {
    constructor(t, i, e, s) {
        this.key = t;
        this.binding = i;
        this.oL = e;
        this.l = s;
    }
    handleChange(t, i) {
        this.binding[this.key](t, i);
    }
}

r.connectable(BindingMediator, null);

r.mixinNoopAstEvaluator(BindingMediator);

function getDefaultValidationHtmlConfiguration() {
    return {
        ...i.getDefaultValidationConfiguration(),
        ValidationControllerFactoryType: ValidationControllerFactory,
        DefaultTrigger: exports.ValidationTrigger.focusout,
        UseSubscriberCustomAttribute: true,
        SubscriberCustomElementTemplate: o
    };
}

function createConfiguration(s) {
    return {
        optionsProvider: s,
        register(r) {
            const o = getDefaultValidationHtmlConfiguration();
            s(o);
            r.registerFactory(n, new o.ValidationControllerFactoryType);
            r.register(i.ValidationConfiguration.customize(t => {
                for (const i of Object.keys(t)) {
                    if (i in o) {
                        t[i] = o[i];
                    }
                }
            }), t.Registration.instance(h, o.DefaultTrigger), ValidateBindingBehavior);
            if (o.UseSubscriberCustomAttribute) {
                r.register(ValidationErrorsCustomAttribute);
            }
            const c = o.SubscriberCustomElementTemplate;
            if (c) {
                r.register(e.CustomElement.define({
                    ...a,
                    template: c
                }, l));
            }
            return r;
        },
        customize(t) {
            return createConfiguration(t ?? s);
        }
    };
}

const d = /*@__PURE__*/ createConfiguration(t.noop);

const f = "validation-result-id";

const v = "validation-result-container";

const g = /*@__PURE__*/ t.DI.createInterface("IValidationResultPresenterService", t => t.transient(ValidationResultPresenterService));

class ValidationResultPresenterService {
    constructor() {
        this.platform = t.resolve(e.IPlatform);
    }
    handleValidationEvent(t) {
        for (const [i, e] of this.reverseMap(t.removedResults)) {
            this.remove(i, e);
        }
        for (const [i, e] of this.reverseMap(t.addedResults)) {
            this.add(i, e);
        }
    }
    remove(t, i) {
        const e = this.getValidationMessageContainer(t);
        if (e === null) {
            return;
        }
        this.removeResults(e, i);
    }
    add(t, i) {
        const e = this.getValidationMessageContainer(t);
        if (e === null) {
            return;
        }
        this.showResults(e, i);
    }
    getValidationMessageContainer(t) {
        const i = t.parentElement;
        if (i === null) {
            return null;
        }
        let e = i.querySelector(`[${v}]`);
        if (e === null) {
            e = this.platform.document.createElement("div");
            e.setAttribute(v, "");
            i.appendChild(e);
        }
        return e;
    }
    showResults(t, i) {
        t.append(...i.reduce((t, i) => {
            if (!i.valid) {
                const e = this.platform.document.createElement("span");
                e.setAttribute(f, i.id.toString());
                e.textContent = i.message;
                t.push(e);
            }
            return t;
        }, []));
    }
    removeResults(t, i) {
        for (const e of i) {
            if (!e.valid) {
                t.querySelector(`[${f}="${e.id}"]`)?.remove();
            }
        }
    }
    reverseMap(t) {
        const i = new Map;
        for (const {result: e, targets: s} of t) {
            for (const t of s) {
                let s = i.get(t);
                if (s === void 0) {
                    i.set(t, s = []);
                }
                s.push(e);
            }
        }
        return i;
    }
}

exports.BindingInfo = BindingInfo;

exports.BindingMediator = BindingMediator;

exports.ControllerValidateResult = ControllerValidateResult;

exports.IDefaultTrigger = h;

exports.IValidationController = n;

exports.IValidationResultPresenterService = g;

exports.ValidateBindingBehavior = ValidateBindingBehavior;

exports.ValidationContainerCustomElement = l;

exports.ValidationController = ValidationController;

exports.ValidationControllerFactory = ValidationControllerFactory;

exports.ValidationErrorsCustomAttribute = ValidationErrorsCustomAttribute;

exports.ValidationEvent = ValidationEvent;

exports.ValidationHtmlConfiguration = d;

exports.ValidationResultPresenterService = ValidationResultPresenterService;

exports.ValidationResultTarget = ValidationResultTarget;

exports.defaultContainerDefinition = a;

exports.defaultContainerTemplate = o;

exports.getDefaultValidationHtmlConfiguration = getDefaultValidationHtmlConfiguration;

exports.getPropertyInfo = getPropertyInfo;
//# sourceMappingURL=index.cjs.map
