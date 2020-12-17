var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "@aurelia/runtime-html", "@aurelia/validation", "./validation-controller.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ValidateBindingBehavior = exports.IDefaultTrigger = exports.ValidationTrigger = void 0;
    const kernel_1 = require("@aurelia/kernel");
    const runtime_html_1 = require("@aurelia/runtime-html");
    const validation_1 = require("@aurelia/validation");
    const validation_controller_js_1 = require("./validation-controller.js");
    /**
     * Validation triggers.
     */
    var ValidationTrigger;
    (function (ValidationTrigger) {
        /**
         * Manual validation.  Use the controller's `validate()` and  `reset()` methods to validate all bindings.
         */
        ValidationTrigger["manual"] = "manual";
        /**
         * Validate the binding when the binding's target element fires a DOM 'blur' event.
         */
        ValidationTrigger["blur"] = "blur";
        /**
         * Validate the binding when the binding's target element fires a DOM 'focusout' event.
         */
        ValidationTrigger["focusout"] = "focusout";
        /**
         * Validate the binding when it updates the model due to a change in the source property (usually triggered by some change in view)
         */
        ValidationTrigger["change"] = "change";
        /**
         * Validate the binding when the binding's target element fires a DOM 'blur' event and when it updates the model due to a change in the view.
         */
        ValidationTrigger["changeOrBlur"] = "changeOrBlur";
        /**
         * Validate the binding when the binding's target element fires a DOM 'focusout' event and when it updates the model due to a change in the view.
         */
        ValidationTrigger["changeOrFocusout"] = "changeOrFocusout";
    })(ValidationTrigger = exports.ValidationTrigger || (exports.ValidationTrigger = {}));
    /* @internal */
    exports.IDefaultTrigger = kernel_1.DI.createInterface('IDefaultTrigger');
    /**
     * Binding behavior. Indicates the bound property should be validated.
     */
    let ValidateBindingBehavior = class ValidateBindingBehavior extends runtime_html_1.BindingInterceptor {
        constructor(binding, expr) {
            super(binding, expr);
            this.binding = binding;
            this.propertyBinding = (void 0);
            this.target = (void 0);
            this.isChangeTrigger = false;
            this.hostScope = null;
            this.triggerMediator = new runtime_html_1.BindingMediator('handleTriggerChange', this, this.observerLocator, this.locator);
            this.controllerMediator = new runtime_html_1.BindingMediator('handleControllerChange', this, this.observerLocator, this.locator);
            this.rulesMediator = new runtime_html_1.BindingMediator('handleRulesChange', this, this.observerLocator, this.locator);
            this.isDirty = false;
            this.validatedOnce = false;
            this.triggerEvent = null;
            this.task = null;
            const locator = this.locator;
            this.platform = locator.get(runtime_html_1.IPlatform);
            this.defaultTrigger = locator.get(exports.IDefaultTrigger);
            if (locator.has(validation_controller_js_1.IValidationController, true)) {
                this.scopedController = locator.get(validation_controller_js_1.IValidationController);
            }
            this.setPropertyBinding();
        }
        updateSource(value, flags) {
            // TODO: need better approach. If done incorrectly may cause infinite loop, stack overflow 💣
            if (this.interceptor !== this) {
                this.interceptor.updateSource(value, flags);
            }
            else {
                // let binding = this as BindingInterceptor;
                // while (binding.binding !== void 0) {
                //   binding = binding.binding as unknown as BindingInterceptor;
                // }
                // binding.updateSource(value, flags);
                // this is a shortcut of the above code
                this.propertyBinding.updateSource(value, flags);
            }
            this.isDirty = true;
            const event = this.triggerEvent;
            if (this.isChangeTrigger && (event === null || event !== null && this.validatedOnce)) {
                this.validateBinding();
            }
        }
        handleEvent(_event) {
            if (!this.isChangeTrigger || this.isChangeTrigger && this.isDirty) {
                this.validateBinding();
            }
        }
        $bind(flags, scope, hostScope) {
            this.scope = scope;
            this.hostScope = hostScope;
            this.binding.$bind(flags, scope, hostScope);
            this.setTarget();
            const delta = this.processBindingExpressionArgs(flags);
            this.processDelta(delta);
        }
        $unbind(flags) {
            var _a, _b, _c, _d;
            (_a = this.task) === null || _a === void 0 ? void 0 : _a.cancel();
            this.task = null;
            const event = this.triggerEvent;
            if (event !== null) {
                (_b = this.target) === null || _b === void 0 ? void 0 : _b.removeEventListener(event, this);
            }
            (_c = this.controller) === null || _c === void 0 ? void 0 : _c.removeSubscriber(this);
            (_d = this.controller) === null || _d === void 0 ? void 0 : _d.unregisterBinding(this.propertyBinding);
            this.binding.$unbind(flags);
        }
        handleTriggerChange(newValue, _previousValue, _flags) {
            this.processDelta(new ValidateArgumentsDelta(void 0, this.ensureTrigger(newValue), void 0));
        }
        handleControllerChange(newValue, _previousValue, _flags) {
            this.processDelta(new ValidateArgumentsDelta(this.ensureController(newValue), void 0, void 0));
        }
        handleRulesChange(newValue, _previousValue, _flags) {
            this.processDelta(new ValidateArgumentsDelta(void 0, void 0, this.ensureRules(newValue)));
        }
        handleValidationEvent(event) {
            var _a;
            const triggerEvent = this.triggerEvent;
            const propertyName = (_a = this.bindingInfo.propertyInfo) === null || _a === void 0 ? void 0 : _a.propertyName;
            if (propertyName !== void 0 && triggerEvent !== null && this.isChangeTrigger) {
                this.validatedOnce = event.addedResults.find((r) => r.result.propertyName === propertyName) !== void 0;
            }
        }
        processBindingExpressionArgs(flags) {
            const scope = this.scope;
            const hostScope = this.hostScope;
            const locator = this.locator;
            let rules;
            let trigger;
            let controller;
            let expression = this.propertyBinding.sourceExpression;
            while (expression.name !== 'validate' && expression !== void 0) {
                expression = expression.expression;
            }
            const evaluationFlags = flags | 4 /* isStrictBindingStrategy */;
            const args = expression.args;
            for (let i = 0, ii = args.length; i < ii; i++) {
                const arg = args[i];
                switch (i) {
                    case 0:
                        trigger = this.ensureTrigger(arg.evaluate(evaluationFlags, scope, hostScope, locator, this.triggerMediator));
                        break;
                    case 1:
                        controller = this.ensureController(arg.evaluate(evaluationFlags, scope, hostScope, locator, this.controllerMediator));
                        break;
                    case 2:
                        rules = this.ensureRules(arg.evaluate(evaluationFlags, scope, hostScope, locator, this.rulesMediator));
                        break;
                    default:
                        throw new Error(`Unconsumed argument#${i + 1} for validate binding behavior: ${arg.evaluate(evaluationFlags, scope, hostScope, locator, null)}`);
                }
            }
            return new ValidateArgumentsDelta(this.ensureController(controller), this.ensureTrigger(trigger), rules);
        }
        validateBinding() {
            var _a;
            (_a = this.task) === null || _a === void 0 ? void 0 : _a.cancel();
            this.task = this.platform.domReadQueue.queueTask(async () => {
                await this.controller.validateBinding(this.propertyBinding);
            });
        }
        processDelta(delta) {
            var _a, _b, _c, _d;
            const trigger = (_a = delta.trigger) !== null && _a !== void 0 ? _a : this.trigger;
            const controller = (_b = delta.controller) !== null && _b !== void 0 ? _b : this.controller;
            const rules = delta.rules;
            if (this.trigger !== trigger) {
                let event = this.triggerEvent;
                if (event !== null) {
                    this.target.removeEventListener(event, this);
                }
                this.validatedOnce = false;
                this.isDirty = false;
                this.trigger = trigger;
                this.isChangeTrigger = trigger === ValidationTrigger.change
                    || trigger === ValidationTrigger.changeOrBlur
                    || trigger === ValidationTrigger.changeOrFocusout;
                event = this.setTriggerEvent(this.trigger);
                if (event !== null) {
                    this.target.addEventListener(event, this);
                }
            }
            if (this.controller !== controller || rules !== void 0) {
                (_c = this.controller) === null || _c === void 0 ? void 0 : _c.removeSubscriber(this);
                (_d = this.controller) === null || _d === void 0 ? void 0 : _d.unregisterBinding(this.propertyBinding);
                this.controller = controller;
                controller.registerBinding(this.propertyBinding, this.setBindingInfo(rules));
                controller.addSubscriber(this);
            }
        }
        ensureTrigger(trigger) {
            if (trigger === (void 0) || trigger === null) {
                trigger = this.defaultTrigger;
            }
            else if (!Object.values(ValidationTrigger).includes(trigger)) {
                throw new Error(`${trigger} is not a supported validation trigger`); // TODO: use reporter
            }
            return trigger;
        }
        ensureController(controller) {
            if (controller === (void 0) || controller === null) {
                controller = this.scopedController;
            }
            else if (!(controller instanceof validation_controller_js_1.ValidationController)) {
                throw new Error(`${controller} is not of type ValidationController`); // TODO: use reporter
            }
            return controller;
        }
        ensureRules(rules) {
            if (Array.isArray(rules) && rules.every((item) => item instanceof validation_1.PropertyRule)) {
                return rules;
            }
        }
        setPropertyBinding() {
            let binding = this.binding;
            while (!(binding instanceof runtime_html_1.PropertyBinding) && binding !== void 0) {
                binding = binding.binding;
            }
            if (binding === void 0) {
                throw new Error('Unable to set property binding');
            }
            this.propertyBinding = binding;
        }
        setTarget() {
            var _a;
            const target = this.propertyBinding.target;
            if (target instanceof this.platform.Node) {
                this.target = target;
            }
            else {
                const controller = (_a = target) === null || _a === void 0 ? void 0 : _a.$controller;
                if (controller === void 0) {
                    throw new Error('Invalid binding target'); // TODO: use reporter
                }
                this.target = controller.host;
            }
        }
        setTriggerEvent(trigger) {
            let triggerEvent = null;
            switch (trigger) {
                case ValidationTrigger.blur:
                case ValidationTrigger.changeOrBlur:
                    triggerEvent = 'blur';
                    break;
                case ValidationTrigger.focusout:
                case ValidationTrigger.changeOrFocusout:
                    triggerEvent = 'focusout';
                    break;
            }
            return this.triggerEvent = triggerEvent;
        }
        setBindingInfo(rules) {
            return this.bindingInfo = new validation_controller_js_1.BindingInfo(this.target, this.scope, this.hostScope, rules);
        }
    };
    ValidateBindingBehavior = __decorate([
        runtime_html_1.bindingBehavior('validate')
    ], ValidateBindingBehavior);
    exports.ValidateBindingBehavior = ValidateBindingBehavior;
    class ValidateArgumentsDelta {
        constructor(controller, trigger, rules) {
            this.controller = controller;
            this.trigger = trigger;
            this.rules = rules;
        }
    }
});
//# sourceMappingURL=validate-binding-behavior.js.map