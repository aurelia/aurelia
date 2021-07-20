"use strict";

Object.defineProperty(exports, "t", {
    value: true
});

var t = require("@aurelia/kernel");

var i = require("@aurelia/validation");

var s = require("@aurelia/runtime-html");

var e = require("@aurelia/runtime");

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */ function o(t, i, s, e) {
    var o = arguments.length, r = o < 3 ? i : null === e ? e = Object.getOwnPropertyDescriptor(i, s) : e, n;
    if ("object" === typeof Reflect && "function" === typeof Reflect.decorate) r = Reflect.decorate(t, i, s, e); else for (var l = t.length - 1; l >= 0; l--) if (n = t[l]) r = (o < 3 ? n(r) : o > 3 ? n(i, s, r) : n(i, s)) || r;
    return o > 3 && r && Object.defineProperty(i, s, r), r;
}

function r(t, i) {
    return function(s, e) {
        i(s, e, t);
    };
}

exports.ValidateEventKind = void 0;

(function(t) {
    t["validate"] = "validate";
    t["reset"] = "reset";
})(exports.ValidateEventKind || (exports.ValidateEventKind = {}));

class ControllerValidateResult {
    constructor(t, i, s) {
        this.valid = t;
        this.results = i;
        this.instruction = s;
    }
}

class ValidationResultTarget {
    constructor(t, i) {
        this.result = t;
        this.targets = i;
    }
}

class ValidationEvent {
    constructor(t, i, s) {
        this.kind = t;
        this.addedResults = i;
        this.removedResults = s;
    }
}

class BindingInfo {
    constructor(t, i, s, e = void 0) {
        this.target = t;
        this.scope = i;
        this.rules = s;
        this.propertyInfo = e;
    }
}

class PropertyInfo {
    constructor(t, i) {
        this.object = t;
        this.propertyName = i;
    }
}

function n(t, i, s = 0) {
    let e = i.propertyInfo;
    if (void 0 !== e) return e;
    const o = i.scope;
    let r = t.sourceExpression.expression;
    const n = t.locator;
    let l = true;
    let a = "";
    while (void 0 !== r && 10082 !== (null === r || void 0 === r ? void 0 : r.$kind)) {
        let t;
        switch (r.$kind) {
          case 38962:
          case 36913:
            r = r.expression;
            continue;

          case 9323:
            t = r.name;
            break;

          case 9324:
            {
                const i = r.key;
                if (l) l = 17925 === i.$kind;
                t = `[${i.evaluate(s, o, n, null).toString()}]`;
                break;
            }

          default:
            throw new Error(`Unknown expression of type ${r.constructor.name}`);
        }
        const i = a.startsWith("[") ? "" : ".";
        a = 0 === a.length ? t : `${t}${i}${a}`;
        r = r.object;
    }
    if (void 0 === r) throw new Error(`Unable to parse binding expression: ${t.sourceExpression.expression}`);
    let h;
    if (0 === a.length) {
        a = r.name;
        h = o.bindingContext;
    } else h = r.evaluate(s, o, n, null);
    if (null === h || void 0 === h) return;
    e = new PropertyInfo(h, a);
    if (l) i.propertyInfo = e;
    return e;
}

const l = t.DI.createInterface("IValidationController");

exports.ValidationController = class ValidationController {
    constructor(t, i, s, e) {
        this.validator = t;
        this.parser = i;
        this.platform = s;
        this.locator = e;
        this.bindings = new Map;
        this.subscribers = new Set;
        this.results = [];
        this.validating = false;
        this.elements = new WeakMap;
        this.objects = new Map;
    }
    addObject(t, i) {
        this.objects.set(t, i);
    }
    removeObject(t) {
        this.objects.delete(t);
        this.processResultDelta("reset", this.results.filter((i => i.object === t)), []);
    }
    addError(t, s, e) {
        let o;
        if (void 0 !== e) [o] = i.parsePropertyName(e, this.parser);
        const r = new i.ValidationResult(false, t, o, s, void 0, void 0, true);
        this.processResultDelta("validate", [], [ r ]);
        return r;
    }
    removeError(t) {
        if (this.results.includes(t)) this.processResultDelta("reset", [ t ], []);
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
        var s;
        const {object: e, objectTag: o, flags: r} = null !== t && void 0 !== t ? t : {};
        let l;
        if (void 0 !== e) l = [ new i.ValidateInstruction(e, t.propertyName, null !== (s = t.rules) && void 0 !== s ? s : this.objects.get(e), o, t.propertyTag) ]; else l = [ ...Array.from(this.objects.entries()).map((([t, s]) => new i.ValidateInstruction(t, void 0, s, o))), ...(!o ? Array.from(this.bindings.entries()) : []).reduce(((t, [s, e]) => {
            const o = n(s, e, r);
            if (void 0 !== o && !this.objects.has(o.object)) t.push(new i.ValidateInstruction(o.object, o.propertyName, e.rules));
            return t;
        }), []) ];
        this.validating = true;
        const a = this.platform.domReadQueue.queueTask((async () => {
            try {
                const i = await Promise.all(l.map((async t => this.validator.validate(t))));
                const s = i.reduce(((t, i) => {
                    t.push(...i);
                    return t;
                }), []);
                const e = this.getInstructionPredicate(t);
                const o = this.results.filter(e);
                this.processResultDelta("validate", o, s);
                return new ControllerValidateResult(void 0 === s.find((t => !t.valid)), s, t);
            } finally {
                this.validating = false;
            }
        }));
        return a.result;
    }
    reset(t) {
        const i = this.getInstructionPredicate(t);
        const s = this.results.filter(i);
        this.processResultDelta("reset", s, []);
    }
    async validateBinding(t) {
        if (!t.isBound) return;
        const s = this.bindings.get(t);
        if (void 0 === s) return;
        const e = n(t, s);
        const o = s.rules;
        if (void 0 === e) return;
        const {object: r, propertyName: l} = e;
        await this.validate(new i.ValidateInstruction(r, l, o));
    }
    resetBinding(t) {
        const s = this.bindings.get(t);
        if (void 0 === s) return;
        const e = n(t, s);
        if (void 0 === e) return;
        s.propertyInfo = void 0;
        const {object: o, propertyName: r} = e;
        this.reset(new i.ValidateInstruction(o, r));
    }
    async revalidateErrors() {
        const t = this.results.reduce(((t, {isManual: i, object: s, propertyRule: e, rule: o, valid: r}) => {
            if (!r && !i && void 0 !== e && void 0 !== s && void 0 !== o) {
                let i = t.get(s);
                if (void 0 === i) t.set(s, i = new Map);
                let r = i.get(e);
                if (void 0 === r) i.set(e, r = []);
                r.push(o);
            }
            return t;
        }), new Map);
        const s = [];
        for (const [e, o] of t) s.push(this.validate(new i.ValidateInstruction(e, void 0, Array.from(o).map((([{validationRules: t, messageProvider: s, property: e}, o]) => new i.PropertyRule(this.locator, t, s, e, [ o ]))))));
        await Promise.all(s);
    }
    getInstructionPredicate(t) {
        if (void 0 === t) return () => true;
        const i = t.propertyName;
        const s = t.rules;
        return e => !e.isManual && e.object === t.object && (void 0 === i || e.propertyName === i) && (void 0 === s || s.includes(e.propertyRule) || s.some((t => void 0 === e.propertyRule || t.$rules.flat().every((t => e.propertyRule.$rules.flat().includes(t))))));
    }
    getAssociatedElements({object: t, propertyName: i}) {
        const s = [];
        for (const [e, o] of this.bindings.entries()) {
            const r = n(e, o);
            if (void 0 !== r && r.object === t && r.propertyName === i) s.push(o.target);
        }
        return s;
    }
    processResultDelta(t, i, s) {
        const e = new ValidationEvent(t, [], []);
        s = s.slice(0);
        const o = this.elements;
        for (const t of i) {
            const i = o.get(t);
            o.delete(t);
            e.removedResults.push(new ValidationResultTarget(t, i));
            const r = s.findIndex((i => i.rule === t.rule && i.object === t.object && i.propertyName === t.propertyName));
            if (-1 === r) this.results.splice(this.results.indexOf(t), 1); else {
                const i = s.splice(r, 1)[0];
                const n = this.getAssociatedElements(i);
                o.set(i, n);
                e.addedResults.push(new ValidationResultTarget(i, n));
                this.results.splice(this.results.indexOf(t), 1, i);
            }
        }
        for (const t of s) {
            const i = this.getAssociatedElements(t);
            e.addedResults.push(new ValidationResultTarget(t, i));
            o.set(t, i);
            this.results.push(t);
        }
        for (const t of this.subscribers) t.handleValidationEvent(e);
    }
};

exports.ValidationController = o([ r(0, i.IValidator), r(1, e.IExpressionParser), r(2, s.IPlatform), r(3, t.IServiceLocator) ], exports.ValidationController);

class ValidationControllerFactory {
    constructor() {
        this.Type = void 0;
    }
    registerTransformer(t) {
        return false;
    }
    construct(t, o) {
        return void 0 !== o ? Reflect.construct(exports.ValidationController, o) : new exports.ValidationController(t.get(i.IValidator), t.get(e.IExpressionParser), t.get(s.IPlatform), t);
    }
}

function a(t, i) {
    switch (2 & t.compareDocumentPosition(i)) {
      case 0:
        return 0;

      case 2:
        return 1;

      default:
        return -1;
    }
}

const h = `\n<slot></slot>\n<slot name='secondary'>\n  <span repeat.for="error of errors">\n    \${error.result.message}\n  </span>\n</slot>\n`;

const c = {
    name: "validation-container",
    shadowOptions: {
        mode: "open"
    },
    hasSlots: true
};

exports.ValidationContainerCustomElement = class ValidationContainerCustomElement {
    constructor(t, i) {
        this.host = t;
        this.scopedController = i;
        this.errors = [];
    }
    handleValidationEvent(t) {
        for (const {result: i} of t.removedResults) {
            const t = this.errors.findIndex((t => t.result === i));
            if (-1 !== t) this.errors.splice(t, 1);
        }
        for (const {result: i, targets: s} of t.addedResults) {
            if (i.valid) continue;
            const t = s.filter((t => this.host.contains(t)));
            if (t.length > 0) this.errors.push(new ValidationResultTarget(i, t));
        }
        this.errors.sort(((t, i) => {
            if (t.targets[0] === i.targets[0]) return 0;
            return a(t.targets[0], i.targets[0]);
        }));
    }
    binding() {
        var t;
        this.controller = null !== (t = this.controller) && void 0 !== t ? t : this.scopedController;
        this.controller.addSubscriber(this);
    }
    unbinding() {
        this.controller.removeSubscriber(this);
    }
};

o([ s.bindable ], exports.ValidationContainerCustomElement.prototype, "controller", void 0);

o([ s.bindable ], exports.ValidationContainerCustomElement.prototype, "errors", void 0);

exports.ValidationContainerCustomElement = o([ r(0, s.INode), r(1, t.optional(l)) ], exports.ValidationContainerCustomElement);

exports.ValidationErrorsCustomAttribute = class ValidationErrorsCustomAttribute {
    constructor(t, i) {
        this.host = t;
        this.scopedController = i;
        this.errors = [];
        this.errorsInternal = [];
    }
    handleValidationEvent(t) {
        for (const {result: i} of t.removedResults) {
            const t = this.errorsInternal.findIndex((t => t.result === i));
            if (-1 !== t) this.errorsInternal.splice(t, 1);
        }
        for (const {result: i, targets: s} of t.addedResults) {
            if (i.valid) continue;
            const t = s.filter((t => this.host.contains(t)));
            if (t.length > 0) this.errorsInternal.push(new ValidationResultTarget(i, t));
        }
        this.errorsInternal.sort(((t, i) => {
            if (t.targets[0] === i.targets[0]) return 0;
            return a(t.targets[0], i.targets[0]);
        }));
        this.errors = this.errorsInternal;
    }
    binding() {
        var t;
        this.controller = null !== (t = this.controller) && void 0 !== t ? t : this.scopedController;
        this.controller.addSubscriber(this);
    }
    unbinding() {
        this.controller.removeSubscriber(this);
    }
};

o([ s.bindable ], exports.ValidationErrorsCustomAttribute.prototype, "controller", void 0);

o([ s.bindable({
    primary: true,
    mode: s.BindingMode.twoWay
}) ], exports.ValidationErrorsCustomAttribute.prototype, "errors", void 0);

exports.ValidationErrorsCustomAttribute = o([ s.customAttribute("validation-errors"), r(0, s.INode), r(1, t.optional(l)) ], exports.ValidationErrorsCustomAttribute);

exports.ValidationTrigger = void 0;

(function(t) {
    t["manual"] = "manual";
    t["blur"] = "blur";
    t["focusout"] = "focusout";
    t["change"] = "change";
    t["changeOrBlur"] = "changeOrBlur";
    t["changeOrFocusout"] = "changeOrFocusout";
})(exports.ValidationTrigger || (exports.ValidationTrigger = {}));

const u = t.DI.createInterface("IDefaultTrigger");

exports.ValidateBindingBehavior = class ValidateBindingBehavior extends s.BindingInterceptor {
    constructor(t, i) {
        super(t, i);
        this.binding = t;
        this.propertyBinding = void 0;
        this.target = void 0;
        this.isChangeTrigger = false;
        this.triggerMediator = new s.BindingMediator("handleTriggerChange", this, this.observerLocator, this.locator);
        this.controllerMediator = new s.BindingMediator("handleControllerChange", this, this.observerLocator, this.locator);
        this.rulesMediator = new s.BindingMediator("handleRulesChange", this, this.observerLocator, this.locator);
        this.isDirty = false;
        this.validatedOnce = false;
        this.triggerEvent = null;
        this.task = null;
        const e = this.locator;
        this.platform = e.get(s.IPlatform);
        this.defaultTrigger = e.get(u);
        if (e.has(l, true)) this.scopedController = e.get(l);
        this.setPropertyBinding();
    }
    updateSource(t, i) {
        if (this.interceptor !== this) this.interceptor.updateSource(t, i); else this.propertyBinding.updateSource(t, i);
        this.isDirty = true;
        const s = this.triggerEvent;
        if (this.isChangeTrigger && (null === s || null !== s && this.validatedOnce)) this.validateBinding();
    }
    handleEvent(t) {
        if (!this.isChangeTrigger || this.isChangeTrigger && this.isDirty) this.validateBinding();
    }
    $bind(t, i) {
        this.scope = i;
        this.binding.$bind(t, i);
        this.setTarget();
        const s = this.processBindingExpressionArgs(t);
        this.processDelta(s);
    }
    $unbind(t) {
        var i, s, e, o;
        null === (i = this.task) || void 0 === i ? void 0 : i.cancel();
        this.task = null;
        const r = this.triggerEvent;
        if (null !== r) null === (s = this.target) || void 0 === s ? void 0 : s.removeEventListener(r, this);
        null === (e = this.controller) || void 0 === e ? void 0 : e.removeSubscriber(this);
        null === (o = this.controller) || void 0 === o ? void 0 : o.unregisterBinding(this.propertyBinding);
        this.binding.$unbind(t);
    }
    handleTriggerChange(t, i, s) {
        this.processDelta(new ValidateArgumentsDelta(void 0, this.ensureTrigger(t), void 0));
    }
    handleControllerChange(t, i, s) {
        this.processDelta(new ValidateArgumentsDelta(this.ensureController(t), void 0, void 0));
    }
    handleRulesChange(t, i, s) {
        this.processDelta(new ValidateArgumentsDelta(void 0, void 0, this.ensureRules(t)));
    }
    handleValidationEvent(t) {
        var i;
        const s = this.triggerEvent;
        const e = null === (i = this.bindingInfo.propertyInfo) || void 0 === i ? void 0 : i.propertyName;
        if (void 0 !== e && null !== s && this.isChangeTrigger) this.validatedOnce = void 0 !== t.addedResults.find((t => t.result.propertyName === e));
    }
    processBindingExpressionArgs(t) {
        const i = this.scope;
        const s = this.locator;
        let e;
        let o;
        let r;
        let n = this.propertyBinding.sourceExpression;
        while ("validate" !== n.name && void 0 !== n) n = n.expression;
        const l = 1 | t;
        const a = n.args;
        for (let t = 0, n = a.length; t < n; t++) {
            const n = a[t];
            switch (t) {
              case 0:
                o = this.ensureTrigger(n.evaluate(l, i, s, this.triggerMediator));
                break;

              case 1:
                r = this.ensureController(n.evaluate(l, i, s, this.controllerMediator));
                break;

              case 2:
                e = this.ensureRules(n.evaluate(l, i, s, this.rulesMediator));
                break;

              default:
                throw new Error(`Unconsumed argument#${t + 1} for validate binding behavior: ${n.evaluate(l, i, s, null)}`);
            }
        }
        return new ValidateArgumentsDelta(this.ensureController(r), this.ensureTrigger(o), e);
    }
    validateBinding() {
        const t = this.task;
        this.task = this.platform.domReadQueue.queueTask((() => this.controller.validateBinding(this.propertyBinding)));
        if (t !== this.task) null === t || void 0 === t ? void 0 : t.cancel();
    }
    processDelta(t) {
        var i, s, e, o;
        const r = null !== (i = t.trigger) && void 0 !== i ? i : this.trigger;
        const n = null !== (s = t.controller) && void 0 !== s ? s : this.controller;
        const l = t.rules;
        if (this.trigger !== r) {
            let t = this.triggerEvent;
            if (null !== t) this.target.removeEventListener(t, this);
            this.validatedOnce = false;
            this.isDirty = false;
            this.trigger = r;
            this.isChangeTrigger = r === exports.ValidationTrigger.change || r === exports.ValidationTrigger.changeOrBlur || r === exports.ValidationTrigger.changeOrFocusout;
            t = this.setTriggerEvent(this.trigger);
            if (null !== t) this.target.addEventListener(t, this);
        }
        if (this.controller !== n || void 0 !== l) {
            null === (e = this.controller) || void 0 === e ? void 0 : e.removeSubscriber(this);
            null === (o = this.controller) || void 0 === o ? void 0 : o.unregisterBinding(this.propertyBinding);
            this.controller = n;
            n.registerBinding(this.propertyBinding, this.setBindingInfo(l));
            n.addSubscriber(this);
        }
    }
    ensureTrigger(t) {
        if (void 0 === t || null === t) t = this.defaultTrigger; else if (!Object.values(exports.ValidationTrigger).includes(t)) throw new Error(`${t} is not a supported validation trigger`);
        return t;
    }
    ensureController(t) {
        if (void 0 === t || null === t) t = this.scopedController; else if (!(t instanceof exports.ValidationController)) throw new Error(`${t} is not of type ValidationController`);
        return t;
    }
    ensureRules(t) {
        if (Array.isArray(t) && t.every((t => t instanceof i.PropertyRule))) return t;
    }
    setPropertyBinding() {
        let t = this.binding;
        while (!(t instanceof s.PropertyBinding) && void 0 !== t) t = t.binding;
        if (void 0 === t) throw new Error("Unable to set property binding");
        this.propertyBinding = t;
    }
    setTarget() {
        var t;
        const i = this.propertyBinding.target;
        if (i instanceof this.platform.Node) this.target = i; else {
            const s = null === (t = i) || void 0 === t ? void 0 : t.$controller;
            if (void 0 === s) throw new Error("Invalid binding target");
            this.target = s.host;
        }
    }
    setTriggerEvent(t) {
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
        return this.triggerEvent = i;
    }
    setBindingInfo(t) {
        return this.bindingInfo = new BindingInfo(this.target, this.scope, t);
    }
};

exports.ValidateBindingBehavior = o([ s.bindingBehavior("validate") ], exports.ValidateBindingBehavior);

class ValidateArgumentsDelta {
    constructor(t, i, s) {
        this.controller = t;
        this.trigger = i;
        this.rules = s;
    }
}

function d() {
    return {
        ...i.getDefaultValidationConfiguration(),
        ValidationControllerFactoryType: ValidationControllerFactory,
        DefaultTrigger: exports.ValidationTrigger.focusout,
        UseSubscriberCustomAttribute: true,
        SubscriberCustomElementTemplate: h
    };
}

function f(e) {
    return {
        optionsProvider: e,
        register(o) {
            const r = d();
            e(r);
            o.registerFactory(l, new r.ValidationControllerFactoryType);
            o.register(i.ValidationConfiguration.customize((t => {
                for (const i of Object.keys(t)) if (i in r) t[i] = r[i];
            })), t.Registration.instance(u, r.DefaultTrigger), exports.ValidateBindingBehavior);
            if (r.UseSubscriberCustomAttribute) o.register(exports.ValidationErrorsCustomAttribute);
            const n = r.SubscriberCustomElementTemplate;
            if (n) o.register(s.CustomElement.define({
                ...c,
                template: n
            }, exports.ValidationContainerCustomElement));
            return o;
        },
        customize(t) {
            return f(null !== t && void 0 !== t ? t : e);
        }
    };
}

const v = f(t.noop);

const p = "validation-result-id";

const g = "validation-result-container";

exports.ValidationResultPresenterService = class ValidationResultPresenterService {
    constructor(t) {
        this.platform = t;
    }
    handleValidationEvent(t) {
        for (const [i, s] of this.reverseMap(t.removedResults)) this.remove(i, s);
        for (const [i, s] of this.reverseMap(t.addedResults)) this.add(i, s);
    }
    remove(t, i) {
        const s = this.getValidationMessageContainer(t);
        if (null === s) return;
        this.removeResults(s, i);
    }
    add(t, i) {
        const s = this.getValidationMessageContainer(t);
        if (null === s) return;
        this.showResults(s, i);
    }
    getValidationMessageContainer(t) {
        const i = t.parentElement;
        if (null === i) return null;
        let s = i.querySelector(`[${g}]`);
        if (null === s) {
            s = this.platform.document.createElement("div");
            s.setAttribute(g, "");
            i.appendChild(s);
        }
        return s;
    }
    showResults(t, i) {
        t.append(...i.reduce(((t, i) => {
            if (!i.valid) {
                const s = this.platform.document.createElement("span");
                s.setAttribute(p, i.id.toString());
                s.textContent = i.message;
                t.push(s);
            }
            return t;
        }), []));
    }
    removeResults(t, i) {
        var s;
        for (const e of i) if (!e.valid) null === (s = t.querySelector(`[${p}="${e.id}"]`)) || void 0 === s ? void 0 : s.remove();
    }
    reverseMap(t) {
        const i = new Map;
        for (const {result: s, targets: e} of t) for (const t of e) {
            let e = i.get(t);
            if (void 0 === e) i.set(t, e = []);
            e.push(s);
        }
        return i;
    }
};

exports.ValidationResultPresenterService = o([ r(0, s.IPlatform) ], exports.ValidationResultPresenterService);

exports.BindingInfo = BindingInfo;

exports.ControllerValidateResult = ControllerValidateResult;

exports.IDefaultTrigger = u;

exports.IValidationController = l;

exports.ValidationControllerFactory = ValidationControllerFactory;

exports.ValidationEvent = ValidationEvent;

exports.ValidationHtmlConfiguration = v;

exports.ValidationResultTarget = ValidationResultTarget;

exports.defaultContainerDefinition = c;

exports.defaultContainerTemplate = h;

exports.getDefaultValidationHtmlConfiguration = d;

exports.getPropertyInfo = n;
//# sourceMappingURL=index.js.map
