import { DI as t, resolve as i, IServiceLocator as e, optional as s, IContainer as n, Registration as r, noop as o } from "@aurelia/kernel";

import { IValidator as a, parsePropertyName as l, ValidationResult as h, ValidateInstruction as c, PropertyRule as u, getDefaultValidationConfiguration as d, ValidationConfiguration as f } from "@aurelia/validation";

import { IPlatform as v, INode as g, bindable as p, CustomAttribute as m, BindingMode as w, BindingBehavior as b, PropertyBinding as V, IFlushQueue as C, BindingTargetSubscriber as y, CustomElement as B } from "@aurelia/runtime-html";

import { IExpressionParser as E } from "@aurelia/expression-parser";

import { astEvaluate as _, connectable as S, mixinNoopAstEvaluator as R, IObserverLocator as T } from "@aurelia/runtime";

function __esDecorate(t, i, e, s, n, r) {
    function accept(t) {
        if (t !== void 0 && typeof t !== "function") throw new TypeError("Function expected");
        return t;
    }
    var o = s.kind, a = o === "getter" ? "get" : o === "setter" ? "set" : "value";
    var l = {};
    var h, c = false;
    for (var u = e.length - 1; u >= 0; u--) {
        var d = {};
        for (var f in s) d[f] = f === "access" ? {} : s[f];
        for (var f in s.access) d.access[f] = s.access[f];
        d.addInitializer = function(t) {
            if (c) throw new TypeError("Cannot add initializers after decoration has completed");
            r.push(accept(t || null));
        };
        var v = (0, e[u])(o === "accessor" ? {
            get: l.get,
            set: l.set
        } : l[a], d);
        if (o === "accessor") {
            if (v === void 0) continue;
            if (v === null || typeof v !== "object") throw new TypeError("Object expected");
            if (h = accept(v.get)) l.get = h;
            if (h = accept(v.set)) l.set = h;
            if (h = accept(v.init)) n.unshift(h);
        } else if (h = accept(v)) {
            if (o === "field") n.unshift(h); else l[a] = h;
        }
    }
    c = true;
}

function __runInitializers(t, i, e) {
    var s = arguments.length > 2;
    for (var n = 0; n < i.length; n++) {
        e = s ? i[n].call(t, e) : i[n].call(t);
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
    constructor(t, i, e, s, n = void 0) {
        this.sourceObserver = t;
        this.target = i;
        this.scope = e;
        this.rules = s;
        this.propertyInfo = n;
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
    let r = true;
    let o = "";
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
                const o = n.key;
                if (r) {
                    r = o.$kind === "PrimitiveLiteral";
                }
                e = `[${_(o, s, t, i.sourceObserver).toString()}]`;
                break;
            }

          default:
            throw createMappedError(4205, n.constructor.name);
        }
        const a = o.startsWith("[") ? "" : ".";
        o = o.length === 0 ? e : `${e}${a}${o}`;
        n = n.object;
    }
    if (n === void 0) {
        throw createMappedError(4206, t.ast.expression);
    }
    let a;
    if (o.length === 0) {
        o = n.name;
        a = s.bindingContext;
    } else {
        a = _(n, s, t, i.sourceObserver);
    }
    if (a === null || a === void 0) {
        return void 0;
    }
    e = new PropertyInfo(a, o);
    if (r) {
        i.propertyInfo = e;
    }
    return e;
}

const I = /*@__PURE__*/ t.createInterface("IValidationController");

class ValidationController {
    constructor() {
        this.bindings = new Map;
        this.subscribers = new Set;
        this.results = [];
        this.validating = false;
        this.elements = new WeakMap;
        this.objects = new Map;
        this.validator = i(a);
        this.parser = i(E);
        this.platform = i(v);
        this.locator = i(e);
    }
    addObject(t, i) {
        this.objects.set(t, i);
    }
    removeObject(t) {
        this.objects.delete(t);
        this.processResultDelta("reset", this.results.filter((i => i.object === t)), []);
    }
    addError(t, i, e) {
        let s;
        if (e !== void 0) {
            [s] = l(e, this.parser);
        }
        const n = new h(false, t, s, i, undefined, undefined, true);
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
        const {object: i, objectTag: e} = t ?? {};
        let s;
        if (i !== void 0) {
            s = [ new c(i, t?.propertyName, t?.rules ?? this.objects.get(i), e, t?.propertyTag) ];
        } else {
            s = [ ...Array.from(this.objects.entries()).map((([t, i]) => new c(t, void 0, i, e))), ...Array.from(this.bindings.entries()).reduce(((i, [s, n]) => {
                if (!s.isBound) return i;
                const r = getPropertyInfo(s, n);
                if (r !== void 0 && !this.objects.has(r.object)) {
                    i.push(new c(r.object, r.propertyName, n.rules, e, t?.propertyTag));
                }
                return i;
            }), []) ];
        }
        this.validating = true;
        const n = this.platform.domQueue.queueTask((async () => {
            try {
                const i = await Promise.all(s.map((async t => this.validator.validate(t))));
                const e = i.reduce(((t, i) => {
                    t.push(...i);
                    return t;
                }), []);
                const n = this.getInstructionPredicate(t);
                const r = this.results.filter(n);
                this.processResultDelta("validate", r, e);
                return new ControllerValidateResult(e.find((t => !t.valid)) === void 0, e, t);
            } finally {
                this.validating = false;
            }
        }));
        return n.result;
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
        const i = this.bindings.get(t);
        if (i === void 0) {
            return;
        }
        const e = getPropertyInfo(t, i);
        const s = i.rules;
        if (e === void 0) {
            return;
        }
        const {object: n, propertyName: r} = e;
        await this.validate(new c(n, r, s));
    }
    resetBinding(t) {
        const i = this.bindings.get(t);
        if (i === void 0) {
            return;
        }
        const e = getPropertyInfo(t, i);
        if (e === void 0) {
            return;
        }
        i.propertyInfo = void 0;
        const {object: s, propertyName: n} = e;
        this.reset(new c(s, n));
    }
    async revalidateErrors() {
        const t = this.results.reduce(((t, {isManual: i, object: e, propertyRule: s, rule: n, valid: r}) => {
            if (!r && !i && s !== void 0 && e !== void 0 && n !== void 0) {
                let i = t.get(e);
                if (i === void 0) {
                    t.set(e, i = new Map);
                }
                let r = i.get(s);
                if (r === void 0) {
                    i.set(s, r = []);
                }
                r.push(n);
            }
            return t;
        }), new Map);
        const i = [];
        for (const [e, s] of t) {
            i.push(this.validate(new c(e, undefined, Array.from(s).map((([{validationRules: t, messageProvider: i, property: e}, s]) => new u(this.locator, t, i, e, [ s ]))))));
        }
        await Promise.all(i);
    }
    getInstructionPredicate(t) {
        if (t === void 0) {
            return () => true;
        }
        const i = t.propertyName;
        const e = t.rules;
        return s => !s.isManual && s.object === t.object && (i === void 0 || s.propertyName === i) && (e === void 0 || e.includes(s.propertyRule) || e.some((t => s.propertyRule === void 0 || t.$rules.flat().every((t => s.propertyRule.$rules.flat().includes(t))))));
    }
    getAssociatedElements({object: t, propertyName: i}) {
        const e = [];
        for (const [s, n] of this.bindings.entries()) {
            const r = getPropertyInfo(s, n);
            if (r !== void 0 && r.object === t && r.propertyName === i) {
                e.push(n.target);
            }
        }
        return e;
    }
    processResultDelta(t, i, e) {
        const s = new ValidationEvent(t, [], []);
        e = e.slice(0);
        const n = this.elements;
        for (const t of i) {
            const i = n.get(t);
            n.delete(t);
            s.removedResults.push(new ValidationResultTarget(t, i));
            const r = e.findIndex((i => i.rule === t.rule && i.object === t.object && i.propertyName === t.propertyName));
            if (r === -1) {
                this.results.splice(this.results.indexOf(t), 1);
            } else {
                const i = e.splice(r, 1)[0];
                const o = this.getAssociatedElements(i);
                n.set(i, o);
                s.addedResults.push(new ValidationResultTarget(i, o));
                this.results.splice(this.results.indexOf(t), 1, i);
            }
        }
        for (const t of e) {
            const i = this.getAssociatedElements(t);
            s.addedResults.push(new ValidationResultTarget(t, i));
            n.set(t, i);
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

const P = `\n<slot></slot>\n<slot name='secondary'>\n  <span repeat.for="error of errors">\n    \${error.result.message}\n  </span>\n</slot>\n`;

const A = {
    name: "validation-container",
    shadowOptions: {
        mode: "open"
    },
    hasSlots: true
};

let M = (() => {
    var t;
    let e;
    let n = [];
    let r = [];
    let o;
    let a = [];
    let l = [];
    return t = class ValidationContainerCustomElement {
        constructor() {
            this.controller = __runInitializers(this, n, void 0);
            this.errors = (__runInitializers(this, r), __runInitializers(this, a, []));
            this.host = (__runInitializers(this, l), i(g));
            this.scopedController = i(s(I));
        }
        handleValidationEvent(t) {
            for (const {result: i} of t.removedResults) {
                const t = this.errors.findIndex((t => t.result === i));
                if (t !== -1) {
                    this.errors.splice(t, 1);
                }
            }
            for (const {result: i, targets: e} of t.addedResults) {
                if (i.valid) {
                    continue;
                }
                const t = e.filter((t => this.host.contains(t)));
                if (t.length > 0) {
                    this.errors.push(new ValidationResultTarget(i, t));
                }
            }
            this.errors.sort(((t, i) => {
                if (t.targets[0] === i.targets[0]) {
                    return 0;
                }
                return compareDocumentPositionFlat(t.targets[0], i.targets[0]);
            }));
        }
        binding() {
            this.controller = this.controller ?? this.scopedController;
            this.controller.addSubscriber(this);
        }
        unbinding() {
            this.controller.removeSubscriber(this);
        }
    }, (() => {
        const i = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        e = [ p ];
        o = [ p ];
        __esDecorate(null, null, e, {
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
            metadata: i
        }, n, r);
        __esDecorate(null, null, o, {
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
            metadata: i
        }, a, l);
        if (i) Object.defineProperty(t, Symbol.metadata, {
            enumerable: true,
            configurable: true,
            writable: true,
            value: i
        });
    })(), t;
})();

class ValidationErrorsCustomAttribute {
    constructor() {
        this.errors = [];
        this.errorsInternal = [];
        this.host = i(g);
        this.scopedController = i(s(I));
    }
    handleValidationEvent(t) {
        for (const {result: i} of t.removedResults) {
            const t = this.errorsInternal.findIndex((t => t.result === i));
            if (t !== -1) {
                this.errorsInternal.splice(t, 1);
            }
        }
        for (const {result: i, targets: e} of t.addedResults) {
            if (i.valid) {
                continue;
            }
            const t = e.filter((t => this.host.contains(t)));
            if (t.length > 0) {
                this.errorsInternal.push(new ValidationResultTarget(i, t));
            }
        }
        this.errorsInternal.sort(((t, i) => {
            if (t.targets[0] === i.targets[0]) {
                return 0;
            }
            return compareDocumentPositionFlat(t.targets[0], i.targets[0]);
        }));
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

m.define({
    name: "validation-errors",
    bindables: {
        controller: {},
        errors: {
            primary: true,
            mode: w.twoWay
        }
    }
}, ValidationErrorsCustomAttribute);

var D;

(function(t) {
    t["manual"] = "manual";
    t["blur"] = "blur";
    t["focusout"] = "focusout";
    t["change"] = "change";
    t["changeOrBlur"] = "changeOrBlur";
    t["changeOrFocusout"] = "changeOrFocusout";
})(D || (D = {}));

const j = /*@__PURE__*/ t.createInterface("IDefaultTrigger");

const k = new WeakMap;

const O = new WeakMap;

class ValidateBindingBehavior {
    constructor() {
        this.p = i(v);
        this.oL = i(T);
    }
    bind(t, i) {
        if (!(i instanceof V)) {
            throw createMappedError(4200);
        }
        let e = k.get(i);
        if (e == null) {
            k.set(i, e = new ValidationConnector(this.p, this.oL, i.get(j), i, i.get(n)));
        }
        let s = O.get(i);
        if (s == null) {
            O.set(i, s = new WithValidationTargetSubscriber(e, i, i.get(C)));
        }
        e.start(t);
        i.useTargetSubscriber(s);
    }
    unbind(t, i) {
        k.get(i)?.stop();
    }
}

b.define("validate", ValidateBindingBehavior);

class ValidationConnector {
    constructor(t, i, e, s, n) {
        this.isChangeTrigger = false;
        this.isDirty = false;
        this.validatedOnce = false;
        this.triggerEvent = null;
        this.task = null;
        this.propertyBinding = s;
        this.target = s.target;
        this.defaultTrigger = e;
        this.p = t;
        this.oL = i;
        this.l = n;
        this.t = new BindingMediator("handleSourceChange", this, i, n);
        this.i = new BindingMediator("handleTriggerChange", this, i, n);
        this.h = new BindingMediator("handleControllerChange", this, i, n);
        this.u = new BindingMediator("handleRulesChange", this, i, n);
        if (n.has(I, true)) {
            this.scopedController = n.get(I);
        }
    }
    V() {
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
        this.target = this.C();
        const i = this.B();
        if (!this._(i) && this.bindingInfo != null) {
            this.controller?.registerBinding(this.propertyBinding, this.bindingInfo);
            this.controller?.addSubscriber(this);
        }
    }
    stop() {
        this.task?.cancel();
        this.scope = void 0;
        this.task = null;
        const t = this.triggerEvent;
        if (t !== null) {
            this.target?.removeEventListener(t, this);
        }
        this.controller?.resetBinding(this.propertyBinding);
        this.controller?.unregisterBinding(this.propertyBinding);
        this.controller?.removeSubscriber(this);
    }
    handleTriggerChange(t, i) {
        this._(new ValidateArgumentsDelta(void 0, this.R(t), void 0));
    }
    handleControllerChange(t, i) {
        this._(new ValidateArgumentsDelta(this.T(t), void 0, void 0));
    }
    handleRulesChange(t, i) {
        this._(new ValidateArgumentsDelta(void 0, void 0, this.I(t)));
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
        this.validatedOnce = t.addedResults.find((t => t.result.propertyName === e)) !== void 0;
    }
    B() {
        const t = this.scope;
        let i;
        let e;
        let s;
        let n = this.propertyBinding.ast;
        while (n.name !== "validate" && n !== void 0) {
            n = n.expression;
        }
        const r = n.args;
        for (let n = 0, o = r.length; n < o; n++) {
            const o = r[n];
            switch (n) {
              case 0:
                e = this.R(_(o, t, this, this.i));
                break;

              case 1:
                s = this.T(_(o, t, this, this.h));
                break;

              case 2:
                i = this.I(_(o, t, this, this.u));
                break;

              default:
                throw createMappedError(4201, n + 1, _(o, t, this, null));
            }
        }
        return new ValidateArgumentsDelta(this.T(s), this.R(e), i);
    }
    validateBinding() {
        const t = this.task;
        this.task = this.p.domQueue.queueTask((() => this.controller.validateBinding(this.propertyBinding)));
        if (t !== this.task) {
            t?.cancel();
        }
    }
    _(t) {
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
            this.isChangeTrigger = i === D.change || i === D.changeOrBlur || i === D.changeOrFocusout;
            t = this.triggerEvent = this.P(this.trigger);
            if (t !== null) {
                this.target.addEventListener(t, this);
            }
        }
        if (this.controller !== e || s !== void 0) {
            this.controller?.removeSubscriber(this);
            this.controller?.unregisterBinding(this.propertyBinding);
            this.controller = e;
            e.registerBinding(this.propertyBinding, this.A(s));
            e.addSubscriber(this);
            return true;
        }
        return false;
    }
    R(t) {
        if (t === void 0 || t === null) {
            t = this.defaultTrigger;
        } else if (!Object.values(D).includes(t)) {
            throw createMappedError(4202, t);
        }
        return t;
    }
    T(t) {
        if (t == null) {
            t = this.scopedController;
        } else if (!(t instanceof ValidationController)) {
            throw createMappedError(4203, t);
        }
        return t;
    }
    I(t) {
        if (Array.isArray(t) && t.every((t => t instanceof u))) {
            return t;
        }
    }
    C() {
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
    P(t) {
        let i = null;
        switch (t) {
          case D.blur:
          case D.changeOrBlur:
            i = "blur";
            break;

          case D.focusout:
          case D.changeOrFocusout:
            i = "focusout";
            break;
        }
        return i;
    }
    A(t) {
        return this.bindingInfo = new BindingInfo(this.t, this.target, this.scope, t);
    }
}

S(ValidationConnector, null);

R(ValidationConnector);

class WithValidationTargetSubscriber extends y {
    constructor(t, i, e) {
        super(i, e);
        this.vs = t;
    }
    handleChange(t, i) {
        super.handleChange(t, i);
        this.vs.V();
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

S(BindingMediator, null);

R(BindingMediator);

function getDefaultValidationHtmlConfiguration() {
    return {
        ...d(),
        ValidationControllerFactoryType: ValidationControllerFactory,
        DefaultTrigger: D.focusout,
        UseSubscriberCustomAttribute: true,
        SubscriberCustomElementTemplate: P
    };
}

function createConfiguration(t) {
    return {
        optionsProvider: t,
        register(i) {
            const e = getDefaultValidationHtmlConfiguration();
            t(e);
            i.registerFactory(I, new e.ValidationControllerFactoryType);
            i.register(f.customize((t => {
                for (const i of Object.keys(t)) {
                    if (i in e) {
                        t[i] = e[i];
                    }
                }
            })), r.instance(j, e.DefaultTrigger), ValidateBindingBehavior);
            if (e.UseSubscriberCustomAttribute) {
                i.register(ValidationErrorsCustomAttribute);
            }
            const s = e.SubscriberCustomElementTemplate;
            if (s) {
                i.register(B.define({
                    ...A,
                    template: s
                }, M));
            }
            return i;
        },
        customize(i) {
            return createConfiguration(i ?? t);
        }
    };
}

const $ = /*@__PURE__*/ createConfiguration(o);

const F = "validation-result-id";

const z = "validation-result-container";

const x = /*@__PURE__*/ t.createInterface("IValidationResultPresenterService", (t => t.transient(ValidationResultPresenterService)));

class ValidationResultPresenterService {
    constructor() {
        this.platform = i(v);
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
        let e = i.querySelector(`[${z}]`);
        if (e === null) {
            e = this.platform.document.createElement("div");
            e.setAttribute(z, "");
            i.appendChild(e);
        }
        return e;
    }
    showResults(t, i) {
        t.append(...i.reduce(((t, i) => {
            if (!i.valid) {
                const e = this.platform.document.createElement("span");
                e.setAttribute(F, i.id.toString());
                e.textContent = i.message;
                t.push(e);
            }
            return t;
        }), []));
    }
    removeResults(t, i) {
        for (const e of i) {
            if (!e.valid) {
                t.querySelector(`[${F}="${e.id}"]`)?.remove();
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

export { BindingInfo, BindingMediator, ControllerValidateResult, j as IDefaultTrigger, I as IValidationController, x as IValidationResultPresenterService, ValidateBindingBehavior, M as ValidationContainerCustomElement, ValidationController, ValidationControllerFactory, ValidationErrorsCustomAttribute, ValidationEvent, $ as ValidationHtmlConfiguration, ValidationResultPresenterService, ValidationResultTarget, D as ValidationTrigger, A as defaultContainerDefinition, P as defaultContainerTemplate, getDefaultValidationHtmlConfiguration, getPropertyInfo };
//# sourceMappingURL=index.mjs.map
