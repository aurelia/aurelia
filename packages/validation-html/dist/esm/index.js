import { DI as t, IServiceLocator as i, optional as s, Registration as e, noop as n } from "@aurelia/kernel";

import { parsePropertyName as o, ValidationResult as r, ValidateInstruction as l, PropertyRule as a, IValidator as h, getDefaultValidationConfiguration as c, ValidationConfiguration as u } from "@aurelia/validation";

import { IPlatform as d, bindable as f, INode as v, BindingMode as g, customAttribute as w, BindingInterceptor as p, BindingMediator as m, bindingBehavior as b, PropertyBinding as V, CustomElement as y } from "@aurelia/runtime-html";

import { IExpressionParser as C } from "@aurelia/runtime";

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
***************************************************************************** */ function E(t, i, s, e) {
    var n = arguments.length, o = n < 3 ? i : null === e ? e = Object.getOwnPropertyDescriptor(i, s) : e, r;
    if ("object" === typeof Reflect && "function" === typeof Reflect.decorate) o = Reflect.decorate(t, i, s, e); else for (var l = t.length - 1; l >= 0; l--) if (r = t[l]) o = (n < 3 ? r(o) : n > 3 ? r(i, s, o) : r(i, s)) || o;
    return n > 3 && o && Object.defineProperty(i, s, o), o;
}

function R(t, i) {
    return function(s, e) {
        i(s, e, t);
    };
}

var T;

(function(t) {
    t["validate"] = "validate";
    t["reset"] = "reset";
})(T || (T = {}));

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

function $(t, i, s = 0) {
    let e = i.propertyInfo;
    if (void 0 !== e) return e;
    const n = i.scope;
    let o = t.sourceExpression.expression;
    const r = t.locator;
    let l = true;
    let a = "";
    while (void 0 !== o && 10082 !== (null === o || void 0 === o ? void 0 : o.$kind)) {
        let t;
        switch (o.$kind) {
          case 38962:
          case 36913:
            o = o.expression;
            continue;

          case 9323:
            t = o.name;
            break;

          case 9324:
            {
                const i = o.key;
                if (l) l = 17925 === i.$kind;
                t = `[${i.evaluate(s, n, r, null).toString()}]`;
                break;
            }

          default:
            throw new Error(`Unknown expression of type ${o.constructor.name}`);
        }
        const i = a.startsWith("[") ? "" : ".";
        a = 0 === a.length ? t : `${t}${i}${a}`;
        o = o.object;
    }
    if (void 0 === o) throw new Error(`Unable to parse binding expression: ${t.sourceExpression.expression}`);
    let h;
    if (0 === a.length) {
        a = o.name;
        h = n.bindingContext;
    } else h = o.evaluate(s, n, r, null);
    if (null === h || void 0 === h) return;
    e = new PropertyInfo(h, a);
    if (l) i.propertyInfo = e;
    return e;
}

const B = t.createInterface("IValidationController");

let j = class ValidationController {
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
    addError(t, i, s) {
        let e;
        if (void 0 !== s) [e] = o(s, this.parser);
        const n = new r(false, t, e, i, void 0, void 0, true);
        this.processResultDelta("validate", [], [ n ]);
        return n;
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
        var i;
        const {object: s, objectTag: e, flags: n} = null !== t && void 0 !== t ? t : {};
        let o;
        if (void 0 !== s) o = [ new l(s, t.propertyName, null !== (i = t.rules) && void 0 !== i ? i : this.objects.get(s), e, t.propertyTag) ]; else o = [ ...Array.from(this.objects.entries()).map((([t, i]) => new l(t, void 0, i, e))), ...(!e ? Array.from(this.bindings.entries()) : []).reduce(((t, [i, s]) => {
            const e = $(i, s, n);
            if (void 0 !== e && !this.objects.has(e.object)) t.push(new l(e.object, e.propertyName, s.rules));
            return t;
        }), []) ];
        this.validating = true;
        const r = this.platform.domReadQueue.queueTask((async () => {
            try {
                const i = await Promise.all(o.map((async t => this.validator.validate(t))));
                const s = i.reduce(((t, i) => {
                    t.push(...i);
                    return t;
                }), []);
                const e = this.getInstructionPredicate(t);
                const n = this.results.filter(e);
                this.processResultDelta("validate", n, s);
                return new ControllerValidateResult(void 0 === s.find((t => !t.valid)), s, t);
            } finally {
                this.validating = false;
            }
        }));
        return r.result;
    }
    reset(t) {
        const i = this.getInstructionPredicate(t);
        const s = this.results.filter(i);
        this.processResultDelta("reset", s, []);
    }
    async validateBinding(t) {
        if (!t.isBound) return;
        const i = this.bindings.get(t);
        if (void 0 === i) return;
        const s = $(t, i);
        const e = i.rules;
        if (void 0 === s) return;
        const {object: n, propertyName: o} = s;
        await this.validate(new l(n, o, e));
    }
    resetBinding(t) {
        const i = this.bindings.get(t);
        if (void 0 === i) return;
        const s = $(t, i);
        if (void 0 === s) return;
        i.propertyInfo = void 0;
        const {object: e, propertyName: n} = s;
        this.reset(new l(e, n));
    }
    async revalidateErrors() {
        const t = this.results.reduce(((t, {isManual: i, object: s, propertyRule: e, rule: n, valid: o}) => {
            if (!o && !i && void 0 !== e && void 0 !== s && void 0 !== n) {
                let i = t.get(s);
                if (void 0 === i) t.set(s, i = new Map);
                let o = i.get(e);
                if (void 0 === o) i.set(e, o = []);
                o.push(n);
            }
            return t;
        }), new Map);
        const i = [];
        for (const [s, e] of t) i.push(this.validate(new l(s, void 0, Array.from(e).map((([{validationRules: t, messageProvider: i, property: s}, e]) => new a(this.locator, t, i, s, [ e ]))))));
        await Promise.all(i);
    }
    getInstructionPredicate(t) {
        if (void 0 === t) return () => true;
        const i = t.propertyName;
        const s = t.rules;
        return e => !e.isManual && e.object === t.object && (void 0 === i || e.propertyName === i) && (void 0 === s || s.includes(e.propertyRule) || s.some((t => void 0 === e.propertyRule || t.$rules.flat().every((t => e.propertyRule.$rules.flat().includes(t))))));
    }
    getAssociatedElements({object: t, propertyName: i}) {
        const s = [];
        for (const [e, n] of this.bindings.entries()) {
            const o = $(e, n);
            if (void 0 !== o && o.object === t && o.propertyName === i) s.push(n.target);
        }
        return s;
    }
    processResultDelta(t, i, s) {
        const e = new ValidationEvent(t, [], []);
        s = s.slice(0);
        const n = this.elements;
        for (const t of i) {
            const i = n.get(t);
            n.delete(t);
            e.removedResults.push(new ValidationResultTarget(t, i));
            const o = s.findIndex((i => i.rule === t.rule && i.object === t.object && i.propertyName === t.propertyName));
            if (-1 === o) this.results.splice(this.results.indexOf(t), 1); else {
                const i = s.splice(o, 1)[0];
                const r = this.getAssociatedElements(i);
                n.set(i, r);
                e.addedResults.push(new ValidationResultTarget(i, r));
                this.results.splice(this.results.indexOf(t), 1, i);
            }
        }
        for (const t of s) {
            const i = this.getAssociatedElements(t);
            e.addedResults.push(new ValidationResultTarget(t, i));
            n.set(t, i);
            this.results.push(t);
        }
        for (const t of this.subscribers) t.handleValidationEvent(e);
    }
};

j = E([ R(0, h), R(1, C), R(2, d), R(3, i) ], j);

class ValidationControllerFactory {
    constructor() {
        this.Type = void 0;
    }
    registerTransformer(t) {
        return false;
    }
    construct(t, i) {
        return t.invoke(j, i);
    }
}

function A(t, i) {
    switch (2 & t.compareDocumentPosition(i)) {
      case 0:
        return 0;

      case 2:
        return 1;

      default:
        return -1;
    }
}

const k = `\n<slot></slot>\n<slot name='secondary'>\n  <span repeat.for="error of errors">\n    \${error.result.message}\n  </span>\n</slot>\n`;

const I = {
    name: "validation-container",
    shadowOptions: {
        mode: "open"
    },
    hasSlots: true
};

let D = class ValidationContainerCustomElement {
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
            return A(t.targets[0], i.targets[0]);
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

E([ f ], D.prototype, "controller", void 0);

E([ f ], D.prototype, "errors", void 0);

D = E([ R(0, v), R(1, s(B)) ], D);

let M = class ValidationErrorsCustomAttribute {
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
            return A(t.targets[0], i.targets[0]);
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

E([ f ], M.prototype, "controller", void 0);

E([ f({
    primary: true,
    mode: g.twoWay
}) ], M.prototype, "errors", void 0);

M = E([ w("validation-errors"), R(0, v), R(1, s(B)) ], M);

var O;

(function(t) {
    t["manual"] = "manual";
    t["blur"] = "blur";
    t["focusout"] = "focusout";
    t["change"] = "change";
    t["changeOrBlur"] = "changeOrBlur";
    t["changeOrFocusout"] = "changeOrFocusout";
})(O || (O = {}));

const P = t.createInterface("IDefaultTrigger");

let S = class ValidateBindingBehavior extends p {
    constructor(t, i) {
        super(t, i);
        this.binding = t;
        this.propertyBinding = void 0;
        this.target = void 0;
        this.isChangeTrigger = false;
        this.triggerMediator = new m("handleTriggerChange", this, this.oL, this.locator);
        this.controllerMediator = new m("handleControllerChange", this, this.oL, this.locator);
        this.rulesMediator = new m("handleRulesChange", this, this.oL, this.locator);
        this.isDirty = false;
        this.validatedOnce = false;
        this.triggerEvent = null;
        this.task = null;
        const s = this.locator;
        this.platform = s.get(d);
        this.defaultTrigger = s.get(P);
        if (s.has(B, true)) this.scopedController = s.get(B);
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
        var i, s, e, n;
        null === (i = this.task) || void 0 === i ? void 0 : i.cancel();
        this.task = null;
        const o = this.triggerEvent;
        if (null !== o) null === (s = this.target) || void 0 === s ? void 0 : s.removeEventListener(o, this);
        null === (e = this.controller) || void 0 === e ? void 0 : e.removeSubscriber(this);
        null === (n = this.controller) || void 0 === n ? void 0 : n.unregisterBinding(this.propertyBinding);
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
        let n;
        let o;
        let r = this.propertyBinding.sourceExpression;
        while ("validate" !== r.name && void 0 !== r) r = r.expression;
        const l = 1 | t;
        const a = r.args;
        for (let t = 0, r = a.length; t < r; t++) {
            const r = a[t];
            switch (t) {
              case 0:
                n = this.ensureTrigger(r.evaluate(l, i, s, this.triggerMediator));
                break;

              case 1:
                o = this.ensureController(r.evaluate(l, i, s, this.controllerMediator));
                break;

              case 2:
                e = this.ensureRules(r.evaluate(l, i, s, this.rulesMediator));
                break;

              default:
                throw new Error(`Unconsumed argument#${t + 1} for validate binding behavior: ${r.evaluate(l, i, s, null)}`);
            }
        }
        return new ValidateArgumentsDelta(this.ensureController(o), this.ensureTrigger(n), e);
    }
    validateBinding() {
        const t = this.task;
        this.task = this.platform.domReadQueue.queueTask((() => this.controller.validateBinding(this.propertyBinding)));
        if (t !== this.task) null === t || void 0 === t ? void 0 : t.cancel();
    }
    processDelta(t) {
        var i, s, e, n;
        const o = null !== (i = t.trigger) && void 0 !== i ? i : this.trigger;
        const r = null !== (s = t.controller) && void 0 !== s ? s : this.controller;
        const l = t.rules;
        if (this.trigger !== o) {
            let t = this.triggerEvent;
            if (null !== t) this.target.removeEventListener(t, this);
            this.validatedOnce = false;
            this.isDirty = false;
            this.trigger = o;
            this.isChangeTrigger = o === O.change || o === O.changeOrBlur || o === O.changeOrFocusout;
            t = this.setTriggerEvent(this.trigger);
            if (null !== t) this.target.addEventListener(t, this);
        }
        if (this.controller !== r || void 0 !== l) {
            null === (e = this.controller) || void 0 === e ? void 0 : e.removeSubscriber(this);
            null === (n = this.controller) || void 0 === n ? void 0 : n.unregisterBinding(this.propertyBinding);
            this.controller = r;
            r.registerBinding(this.propertyBinding, this.setBindingInfo(l));
            r.addSubscriber(this);
        }
    }
    ensureTrigger(t) {
        if (void 0 === t || null === t) t = this.defaultTrigger; else if (!Object.values(O).includes(t)) throw new Error(`${t} is not a supported validation trigger`);
        return t;
    }
    ensureController(t) {
        if (void 0 === t || null === t) t = this.scopedController; else if (!(t instanceof j)) throw new Error(`${t} is not of type ValidationController`);
        return t;
    }
    ensureRules(t) {
        if (Array.isArray(t) && t.every((t => t instanceof a))) return t;
    }
    setPropertyBinding() {
        let t = this.binding;
        while (!(t instanceof V) && void 0 !== t) t = t.binding;
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
          case O.blur:
          case O.changeOrBlur:
            i = "blur";
            break;

          case O.focusout:
          case O.changeOrFocusout:
            i = "focusout";
            break;
        }
        return this.triggerEvent = i;
    }
    setBindingInfo(t) {
        return this.bindingInfo = new BindingInfo(this.target, this.scope, t);
    }
};

S = E([ b("validate") ], S);

class ValidateArgumentsDelta {
    constructor(t, i, s) {
        this.controller = t;
        this.trigger = i;
        this.rules = s;
    }
}

function x() {
    return {
        ...c(),
        ValidationControllerFactoryType: ValidationControllerFactory,
        DefaultTrigger: O.focusout,
        UseSubscriberCustomAttribute: true,
        SubscriberCustomElementTemplate: k
    };
}

function F(t) {
    return {
        optionsProvider: t,
        register(i) {
            const s = x();
            t(s);
            i.registerFactory(B, new s.ValidationControllerFactoryType);
            i.register(u.customize((t => {
                for (const i of Object.keys(t)) if (i in s) t[i] = s[i];
            })), e.instance(P, s.DefaultTrigger), S);
            if (s.UseSubscriberCustomAttribute) i.register(M);
            const n = s.SubscriberCustomElementTemplate;
            if (n) i.register(y.define({
                ...I,
                template: n
            }, D));
            return i;
        },
        customize(i) {
            return F(null !== i && void 0 !== i ? i : t);
        }
    };
}

const U = F(n);

const N = "validation-result-id";

const z = "validation-result-container";

let W = class ValidationResultPresenterService {
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
        let s = i.querySelector(`[${z}]`);
        if (null === s) {
            s = this.platform.document.createElement("div");
            s.setAttribute(z, "");
            i.appendChild(s);
        }
        return s;
    }
    showResults(t, i) {
        t.append(...i.reduce(((t, i) => {
            if (!i.valid) {
                const s = this.platform.document.createElement("span");
                s.setAttribute(N, i.id.toString());
                s.textContent = i.message;
                t.push(s);
            }
            return t;
        }), []));
    }
    removeResults(t, i) {
        var s;
        for (const e of i) if (!e.valid) null === (s = t.querySelector(`[${N}="${e.id}"]`)) || void 0 === s ? void 0 : s.remove();
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

W = E([ R(0, d) ], W);

export { BindingInfo, ControllerValidateResult, P as IDefaultTrigger, B as IValidationController, S as ValidateBindingBehavior, T as ValidateEventKind, D as ValidationContainerCustomElement, j as ValidationController, ValidationControllerFactory, M as ValidationErrorsCustomAttribute, ValidationEvent, U as ValidationHtmlConfiguration, W as ValidationResultPresenterService, ValidationResultTarget, O as ValidationTrigger, I as defaultContainerDefinition, k as defaultContainerTemplate, x as getDefaultValidationHtmlConfiguration, $ as getPropertyInfo };
//# sourceMappingURL=index.js.map
