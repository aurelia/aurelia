import { DI, IServiceLocator, optional, Registration, noop } from '../../../kernel/dist/native-modules/index.js';
import { parsePropertyName, ValidationResult, ValidateInstruction, PropertyRule, IValidator, getDefaultValidationConfiguration, ValidationConfiguration } from '../../../validation/dist/native-modules/index.js';
import { IPlatform, bindable, INode, BindingMode, customAttribute, bindingBehavior, BindingInterceptor, BindingMediator, PropertyBinding, CustomElement } from '../../../runtime-html/dist/native-modules/index.js';
import { IExpressionParser } from '../../../runtime/dist/native-modules/index.js';

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
***************************************************************************** */

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
}

var ValidateEventKind;
(function (ValidateEventKind) {
    ValidateEventKind["validate"] = "validate";
    ValidateEventKind["reset"] = "reset";
})(ValidateEventKind || (ValidateEventKind = {}));
/**
 * The result of a call to the validation controller's validate method.
 */
class ControllerValidateResult {
    /**
     * @param {boolean} valid - `true` if the validation passed, else `false`.
     * @param {ValidationResult[]} results - The validation result of every rule that was evaluated.
     * @param {ValidateInstruction} [instruction] - The instruction passed to the controller's validate method.
     */
    constructor(valid, results, instruction) {
        this.valid = valid;
        this.results = results;
        this.instruction = instruction;
    }
}
/**
 * Describes the validation result and target elements pair.
 * Used to notify the subscribers.
 */
class ValidationResultTarget {
    constructor(result, targets) {
        this.result = result;
        this.targets = targets;
    }
}
/**
 * Describes the contract of the validation event.
 * Used to notify the subscribers.
 */
class ValidationEvent {
    /**
     * @param {ValidateEventKind} kind - 'validate' or 'reset'.
     * @param {ValidationResultTarget[]} addedResults - new errors added.
     * @param {ValidationResultTarget[]} removedResults - old errors removed.
     * @memberof ValidationEvent
     */
    constructor(kind, addedResults, removedResults) {
        this.kind = kind;
        this.addedResults = addedResults;
        this.removedResults = removedResults;
    }
}
/**
 * Describes a binding information to the validation controller.
 * This is provided by the `validate` binding behavior during binding registration.
 */
class BindingInfo {
    /**
     * @param {Element} target - The HTMLElement associated with the binding.
     * @param {Scope} scope - The binding scope.
     * @param {PropertyRule[]} [rules] - Rules bound to the binding behavior.
     * @param {(PropertyInfo | undefined)} [propertyInfo=void 0] - Information describing the associated property for the binding.
     * @memberof BindingInfo
     */
    constructor(target, scope, rules, propertyInfo = void 0) {
        this.target = target;
        this.scope = scope;
        this.rules = rules;
        this.propertyInfo = propertyInfo;
    }
}
class PropertyInfo {
    constructor(object, propertyName) {
        this.object = object;
        this.propertyName = propertyName;
    }
}
function getPropertyInfo(binding, info, flags = 0 /* none */) {
    let propertyInfo = info.propertyInfo;
    if (propertyInfo !== void 0) {
        return propertyInfo;
    }
    const scope = info.scope;
    let expression = binding.sourceExpression.expression;
    const locator = binding.locator;
    let toCachePropertyName = true;
    let propertyName = '';
    while (expression !== void 0 && (expression === null || expression === void 0 ? void 0 : expression.$kind) !== 10082 /* AccessScope */) {
        let memberName;
        switch (expression.$kind) {
            case 38962 /* BindingBehavior */:
            case 36913 /* ValueConverter */:
                expression = expression.expression;
                continue;
            case 9323 /* AccessMember */:
                memberName = expression.name;
                break;
            case 9324 /* AccessKeyed */: {
                const keyExpr = expression.key;
                if (toCachePropertyName) {
                    toCachePropertyName = keyExpr.$kind === 17925 /* PrimitiveLiteral */;
                }
                memberName = `[${keyExpr.evaluate(flags, scope, locator, null).toString()}]`;
                break;
            }
            default:
                throw new Error(`Unknown expression of type ${expression.constructor.name}`); // TODO: use reporter/logger
        }
        const separator = propertyName.startsWith('[') ? '' : '.';
        propertyName = propertyName.length === 0 ? memberName : `${memberName}${separator}${propertyName}`;
        expression = expression.object;
    }
    if (expression === void 0) {
        throw new Error(`Unable to parse binding expression: ${binding.sourceExpression.expression}`); // TODO: use reporter/logger
    }
    let object;
    if (propertyName.length === 0) {
        propertyName = expression.name;
        object = scope.bindingContext;
    }
    else {
        object = expression.evaluate(flags, scope, locator, null);
    }
    if (object === null || object === void 0) {
        return (void 0);
    }
    propertyInfo = new PropertyInfo(object, propertyName);
    if (toCachePropertyName) {
        info.propertyInfo = propertyInfo;
    }
    return propertyInfo;
}
const IValidationController = DI.createInterface('IValidationController');
let ValidationController = class ValidationController {
    constructor(validator, parser, platform, locator) {
        this.validator = validator;
        this.parser = parser;
        this.platform = platform;
        this.locator = locator;
        this.bindings = new Map();
        this.subscribers = new Set();
        this.results = [];
        this.validating = false;
        /**
         * Elements related to validation results that have been rendered.
         *
         * @private
         * @type {Map<ValidationResult, Element[]>}
         */
        this.elements = new WeakMap();
        this.objects = new Map();
    }
    addObject(object, rules) {
        this.objects.set(object, rules);
    }
    removeObject(object) {
        this.objects.delete(object);
        this.processResultDelta("reset" /* reset */, this.results.filter(result => result.object === object), []);
    }
    addError(message, object, propertyName) {
        let resolvedPropertyName;
        if (propertyName !== void 0) {
            [resolvedPropertyName] = parsePropertyName(propertyName, this.parser);
        }
        const result = new ValidationResult(false, message, resolvedPropertyName, object, undefined, undefined, true);
        this.processResultDelta("validate" /* validate */, [], [result]);
        return result;
    }
    removeError(result) {
        if (this.results.includes(result)) {
            this.processResultDelta("reset" /* reset */, [result], []);
        }
    }
    addSubscriber(subscriber) {
        this.subscribers.add(subscriber);
    }
    removeSubscriber(subscriber) {
        this.subscribers.delete(subscriber);
    }
    registerBinding(binding, info) {
        this.bindings.set(binding, info);
    }
    unregisterBinding(binding) {
        this.resetBinding(binding);
        this.bindings.delete(binding);
    }
    async validate(instruction) {
        var _a;
        const { object: obj, objectTag, flags } = instruction !== null && instruction !== void 0 ? instruction : {};
        let instructions;
        if (obj !== void 0) {
            instructions = [new ValidateInstruction(obj, instruction.propertyName, (_a = instruction.rules) !== null && _a !== void 0 ? _a : this.objects.get(obj), objectTag, instruction.propertyTag)];
        }
        else {
            // validate all objects and bindings.
            instructions = [
                ...Array.from(this.objects.entries())
                    .map(([object, rules]) => new ValidateInstruction(object, void 0, rules, objectTag)),
                ...(!objectTag ? Array.from(this.bindings.entries()) : [])
                    .reduce((acc, [binding, info]) => {
                    const propertyInfo = getPropertyInfo(binding, info, flags);
                    if (propertyInfo !== void 0 && !this.objects.has(propertyInfo.object)) {
                        acc.push(new ValidateInstruction(propertyInfo.object, propertyInfo.propertyName, info.rules));
                    }
                    return acc;
                }, [])
            ];
        }
        this.validating = true;
        const task = this.platform.domReadQueue.queueTask(async () => {
            try {
                const results = await Promise.all(instructions.map(async (x) => this.validator.validate(x)));
                const newResults = results.reduce((acc, resultSet) => {
                    acc.push(...resultSet);
                    return acc;
                }, []);
                const predicate = this.getInstructionPredicate(instruction);
                const oldResults = this.results.filter(predicate);
                this.processResultDelta("validate" /* validate */, oldResults, newResults);
                return new ControllerValidateResult(newResults.find(r => !r.valid) === void 0, newResults, instruction);
            }
            finally {
                this.validating = false;
            }
        });
        return task.result;
    }
    reset(instruction) {
        const predicate = this.getInstructionPredicate(instruction);
        const oldResults = this.results.filter(predicate);
        this.processResultDelta("reset" /* reset */, oldResults, []);
    }
    async validateBinding(binding) {
        if (!binding.isBound) {
            return;
        }
        const bindingInfo = this.bindings.get(binding);
        if (bindingInfo === void 0) {
            return;
        }
        const propertyInfo = getPropertyInfo(binding, bindingInfo);
        const rules = bindingInfo.rules;
        if (propertyInfo === void 0) {
            return;
        }
        const { object, propertyName } = propertyInfo;
        await this.validate(new ValidateInstruction(object, propertyName, rules));
    }
    resetBinding(binding) {
        const bindingInfo = this.bindings.get(binding);
        if (bindingInfo === void 0) {
            return;
        }
        const propertyInfo = getPropertyInfo(binding, bindingInfo);
        if (propertyInfo === void 0) {
            return;
        }
        bindingInfo.propertyInfo = void 0;
        const { object, propertyName } = propertyInfo;
        this.reset(new ValidateInstruction(object, propertyName));
    }
    async revalidateErrors() {
        const map = this.results
            .reduce((acc, { isManual, object, propertyRule, rule, valid }) => {
            if (!valid && !isManual && propertyRule !== void 0 && object !== void 0 && rule !== void 0) {
                let value = acc.get(object);
                if (value === void 0) {
                    acc.set(object, value = new Map());
                }
                let rules = value.get(propertyRule);
                if (rules === void 0) {
                    value.set(propertyRule, rules = []);
                }
                rules.push(rule);
            }
            return acc;
        }, new Map());
        const promises = [];
        for (const [object, innerMap] of map) {
            promises.push(this.validate(new ValidateInstruction(object, undefined, Array.from(innerMap)
                .map(([{ validationRules, messageProvider, property }, rules]) => new PropertyRule(this.locator, validationRules, messageProvider, property, [rules])))));
        }
        await Promise.all(promises);
    }
    /**
     * Interprets the instruction and returns a predicate that will identify relevant results in the list of rendered validation results.
     */
    getInstructionPredicate(instruction) {
        if (instruction === void 0) {
            return () => true;
        }
        const propertyName = instruction.propertyName;
        const rules = instruction.rules;
        return x => !x.isManual
            && x.object === instruction.object
            && (propertyName === void 0 || x.propertyName === propertyName)
            && (rules === void 0
                || rules.includes(x.propertyRule)
                || rules.some((r) => x.propertyRule === void 0 || r.$rules.flat().every(($r) => x.propertyRule.$rules.flat().includes($r))));
    }
    /**
     * Gets the elements associated with an object and propertyName (if any).
     */
    getAssociatedElements({ object, propertyName }) {
        const elements = [];
        for (const [binding, info] of this.bindings.entries()) {
            const propertyInfo = getPropertyInfo(binding, info);
            if (propertyInfo !== void 0 && propertyInfo.object === object && propertyInfo.propertyName === propertyName) {
                elements.push(info.target);
            }
        }
        return elements;
    }
    processResultDelta(kind, oldResults, newResults) {
        const eventData = new ValidationEvent(kind, [], []);
        // create a shallow copy of newResults so we can mutate it without causing side-effects.
        newResults = newResults.slice(0);
        const elements = this.elements;
        for (const oldResult of oldResults) {
            const removalTargets = elements.get(oldResult);
            elements.delete(oldResult);
            eventData.removedResults.push(new ValidationResultTarget(oldResult, removalTargets));
            // determine if there's a corresponding new result for the old result we are removing.
            const newResultIndex = newResults.findIndex(x => x.rule === oldResult.rule && x.object === oldResult.object && x.propertyName === oldResult.propertyName);
            if (newResultIndex === -1) {
                // no corresponding new result... simple remove.
                this.results.splice(this.results.indexOf(oldResult), 1);
            }
            else {
                // there is a corresponding new result...
                const newResult = newResults.splice(newResultIndex, 1)[0];
                const newTargets = this.getAssociatedElements(newResult);
                elements.set(newResult, newTargets);
                eventData.addedResults.push(new ValidationResultTarget(newResult, newTargets));
                // do an in-place replacement of the old result with the new result.
                // this ensures any repeats bound to this.results will not thrash.
                this.results.splice(this.results.indexOf(oldResult), 1, newResult);
            }
        }
        // add the remaining new results to the event data.
        for (const result of newResults) {
            const newTargets = this.getAssociatedElements(result);
            eventData.addedResults.push(new ValidationResultTarget(result, newTargets));
            elements.set(result, newTargets);
            this.results.push(result);
        }
        for (const subscriber of this.subscribers) {
            subscriber.handleValidationEvent(eventData);
        }
    }
};
ValidationController = __decorate([
    __param(0, IValidator),
    __param(1, IExpressionParser),
    __param(2, IPlatform),
    __param(3, IServiceLocator)
], ValidationController);
class ValidationControllerFactory {
    constructor() {
        this.Type = (void 0);
    }
    registerTransformer(_transformer) {
        return false;
    }
    construct(container, _dynamicDependencies) {
        return container.invoke(ValidationController, _dynamicDependencies);
    }
}

/**
 * Normalizes https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition into values usable for Array.prototype.sort.
 */
function compareDocumentPositionFlat(a, b) {
    switch (a.compareDocumentPosition(b) & 2 /* DOCUMENT_POSITION_PRECEDING */) {
        case 0: return 0; // same element
        case 2: return 1; // preceding element
        default: return -1; // assume following element otherwise
    }
}

const defaultContainerTemplate = `
<slot></slot>
<slot name='secondary'>
  <span repeat.for="error of errors">
    \${error.result.message}
  </span>
</slot>
`;
const defaultContainerDefinition = {
    name: 'validation-container',
    shadowOptions: { mode: 'open' },
    hasSlots: true,
};
let ValidationContainerCustomElement = class ValidationContainerCustomElement {
    constructor(host, scopedController) {
        this.host = host;
        this.scopedController = scopedController;
        this.errors = [];
    }
    handleValidationEvent(event) {
        for (const { result } of event.removedResults) {
            const index = this.errors.findIndex(x => x.result === result);
            if (index !== -1) {
                this.errors.splice(index, 1);
            }
        }
        for (const { result, targets: elements } of event.addedResults) {
            if (result.valid) {
                continue;
            }
            const targets = elements.filter(e => this.host.contains(e));
            if (targets.length > 0) {
                this.errors.push(new ValidationResultTarget(result, targets));
            }
        }
        this.errors.sort((a, b) => {
            if (a.targets[0] === b.targets[0]) {
                return 0;
            }
            return compareDocumentPositionFlat(a.targets[0], b.targets[0]);
        });
    }
    binding() {
        var _a;
        this.controller = (_a = this.controller) !== null && _a !== void 0 ? _a : this.scopedController;
        this.controller.addSubscriber(this);
    }
    unbinding() {
        this.controller.removeSubscriber(this);
    }
};
__decorate([
    bindable
], ValidationContainerCustomElement.prototype, "controller", void 0);
__decorate([
    bindable
], ValidationContainerCustomElement.prototype, "errors", void 0);
ValidationContainerCustomElement = __decorate([
    __param(0, INode),
    __param(1, optional(IValidationController))
], ValidationContainerCustomElement);

/**
 * A validation errors subscriber in form of a custom attribute.
 *
 * It registers itself as a subscriber to the validation controller available for the scope.
 * The target controller can be bound via the `@bindable controller`; when omitted it takes the controller currently registered in the container.
 *
 * The set of errors related to the host element or the children of it , are exposed via the `@bindable errors`.
 *
 * @example
 * ```html
 * <div id="div1" validation-errors.bind="nameErrors">
 *   <input id="target1" type="text" value.two-way="person.name & validate">
 *   <span class="error" repeat.for="errorInfo of nameErrors">
 *     ${errorInfo.result.message}
 *   </span>
 * </div>
 * ```
 */
let ValidationErrorsCustomAttribute = class ValidationErrorsCustomAttribute {
    constructor(host, scopedController) {
        this.host = host;
        this.scopedController = scopedController;
        this.errors = [];
        this.errorsInternal = [];
    }
    handleValidationEvent(event) {
        for (const { result } of event.removedResults) {
            const index = this.errorsInternal.findIndex((x) => x.result === result);
            if (index !== -1) {
                this.errorsInternal.splice(index, 1);
            }
        }
        for (const { result, targets: elements } of event.addedResults) {
            if (result.valid) {
                continue;
            }
            const targets = elements.filter((e) => this.host.contains(e));
            if (targets.length > 0) {
                this.errorsInternal.push(new ValidationResultTarget(result, targets));
            }
        }
        this.errorsInternal.sort((a, b) => {
            if (a.targets[0] === b.targets[0]) {
                return 0;
            }
            return compareDocumentPositionFlat(a.targets[0], b.targets[0]);
        });
        this.errors = this.errorsInternal;
    }
    binding() {
        var _a;
        this.controller = (_a = this.controller) !== null && _a !== void 0 ? _a : this.scopedController;
        this.controller.addSubscriber(this);
    }
    unbinding() {
        this.controller.removeSubscriber(this);
    }
};
__decorate([
    bindable
], ValidationErrorsCustomAttribute.prototype, "controller", void 0);
__decorate([
    bindable({ primary: true, mode: BindingMode.twoWay })
], ValidationErrorsCustomAttribute.prototype, "errors", void 0);
ValidationErrorsCustomAttribute = __decorate([
    customAttribute('validation-errors'),
    __param(0, INode),
    __param(1, optional(IValidationController))
], ValidationErrorsCustomAttribute);

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
})(ValidationTrigger || (ValidationTrigger = {}));
/* @internal */
const IDefaultTrigger = DI.createInterface('IDefaultTrigger');
/**
 * Binding behavior. Indicates the bound property should be validated.
 */
let ValidateBindingBehavior = class ValidateBindingBehavior extends BindingInterceptor {
    constructor(binding, expr) {
        super(binding, expr);
        this.binding = binding;
        this.propertyBinding = (void 0);
        this.target = (void 0);
        this.isChangeTrigger = false;
        this.triggerMediator = new BindingMediator('handleTriggerChange', this, this.oL, this.locator);
        this.controllerMediator = new BindingMediator('handleControllerChange', this, this.oL, this.locator);
        this.rulesMediator = new BindingMediator('handleRulesChange', this, this.oL, this.locator);
        this.isDirty = false;
        this.validatedOnce = false;
        this.triggerEvent = null;
        this.task = null;
        const locator = this.locator;
        this.platform = locator.get(IPlatform);
        this.defaultTrigger = locator.get(IDefaultTrigger);
        if (locator.has(IValidationController, true)) {
            this.scopedController = locator.get(IValidationController);
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
    $bind(flags, scope) {
        this.scope = scope;
        this.binding.$bind(flags, scope);
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
        const locator = this.locator;
        let rules;
        let trigger;
        let controller;
        let expression = this.propertyBinding.sourceExpression;
        while (expression.name !== 'validate' && expression !== void 0) {
            expression = expression.expression;
        }
        const evaluationFlags = flags | 1 /* isStrictBindingStrategy */;
        const args = expression.args;
        for (let i = 0, ii = args.length; i < ii; i++) {
            const arg = args[i];
            switch (i) {
                case 0:
                    trigger = this.ensureTrigger(arg.evaluate(evaluationFlags, scope, locator, this.triggerMediator));
                    break;
                case 1:
                    controller = this.ensureController(arg.evaluate(evaluationFlags, scope, locator, this.controllerMediator));
                    break;
                case 2:
                    rules = this.ensureRules(arg.evaluate(evaluationFlags, scope, locator, this.rulesMediator));
                    break;
                default:
                    throw new Error(`Unconsumed argument#${i + 1} for validate binding behavior: ${arg.evaluate(evaluationFlags, scope, locator, null)}`);
            }
        }
        return new ValidateArgumentsDelta(this.ensureController(controller), this.ensureTrigger(trigger), rules);
    }
    validateBinding() {
        // Queue the new one before canceling the old one, to prevent early yield
        const task = this.task;
        this.task = this.platform.domReadQueue.queueTask(() => this.controller.validateBinding(this.propertyBinding));
        if (task !== this.task) {
            task === null || task === void 0 ? void 0 : task.cancel();
        }
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
        else if (!(controller instanceof ValidationController)) {
            throw new Error(`${controller} is not of type ValidationController`); // TODO: use reporter
        }
        return controller;
    }
    ensureRules(rules) {
        if (Array.isArray(rules) && rules.every((item) => item instanceof PropertyRule)) {
            return rules;
        }
    }
    setPropertyBinding() {
        let binding = this.binding;
        while (!(binding instanceof PropertyBinding) && binding !== void 0) {
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
        return this.bindingInfo = new BindingInfo(this.target, this.scope, rules);
    }
};
ValidateBindingBehavior = __decorate([
    bindingBehavior('validate')
], ValidateBindingBehavior);
class ValidateArgumentsDelta {
    constructor(controller, trigger, rules) {
        this.controller = controller;
        this.trigger = trigger;
        this.rules = rules;
    }
}

function getDefaultValidationHtmlConfiguration() {
    return {
        ...getDefaultValidationConfiguration(),
        ValidationControllerFactoryType: ValidationControllerFactory,
        DefaultTrigger: ValidationTrigger.focusout,
        UseSubscriberCustomAttribute: true,
        SubscriberCustomElementTemplate: defaultContainerTemplate
    };
}
function createConfiguration(optionsProvider) {
    return {
        optionsProvider,
        register(container) {
            const options = getDefaultValidationHtmlConfiguration();
            optionsProvider(options);
            container.registerFactory(IValidationController, new options.ValidationControllerFactoryType());
            container.register(ValidationConfiguration.customize((opt) => {
                // copy the customization iff the key exists in validation configuration
                for (const optKey of Object.keys(opt)) {
                    if (optKey in options) {
                        opt[optKey] = options[optKey]; // TS cannot infer that the value of the same key is being copied from A to B, and rejects the assignment due to type broadening
                    }
                }
            }), Registration.instance(IDefaultTrigger, options.DefaultTrigger), ValidateBindingBehavior);
            if (options.UseSubscriberCustomAttribute) {
                container.register(ValidationErrorsCustomAttribute);
            }
            const template = options.SubscriberCustomElementTemplate;
            if (template) { // we need the boolean coercion here to ignore null, undefined, and ''
                container.register(CustomElement.define({ ...defaultContainerDefinition, template }, ValidationContainerCustomElement));
            }
            return container;
        },
        customize(cb) {
            return createConfiguration(cb !== null && cb !== void 0 ? cb : optionsProvider);
        },
    };
}
const ValidationHtmlConfiguration = createConfiguration(noop);

const resultIdAttribute = 'validation-result-id';
const resultContainerAttribute = 'validation-result-container';
let ValidationResultPresenterService = class ValidationResultPresenterService {
    constructor(platform) {
        this.platform = platform;
    }
    handleValidationEvent(event) {
        for (const [target, results] of this.reverseMap(event.removedResults)) {
            this.remove(target, results);
        }
        for (const [target, results] of this.reverseMap(event.addedResults)) {
            this.add(target, results);
        }
    }
    remove(target, results) {
        const messageContainer = this.getValidationMessageContainer(target);
        if (messageContainer === null) {
            return;
        }
        this.removeResults(messageContainer, results);
    }
    add(target, results) {
        const messageContainer = this.getValidationMessageContainer(target);
        if (messageContainer === null) {
            return;
        }
        this.showResults(messageContainer, results);
    }
    getValidationMessageContainer(target) {
        const parent = target.parentElement;
        if (parent === null) {
            return null;
        }
        let messageContainer = parent.querySelector(`[${resultContainerAttribute}]`);
        if (messageContainer === null) {
            messageContainer = this.platform.document.createElement('div');
            messageContainer.setAttribute(resultContainerAttribute, '');
            parent.appendChild(messageContainer);
        }
        return messageContainer;
    }
    showResults(messageContainer, results) {
        messageContainer.append(...results.reduce((acc, result) => {
            if (!result.valid) {
                const span = this.platform.document.createElement('span');
                span.setAttribute(resultIdAttribute, result.id.toString());
                span.textContent = result.message;
                acc.push(span);
            }
            return acc;
        }, []));
    }
    removeResults(messageContainer, results) {
        var _a;
        for (const result of results) {
            if (!result.valid) {
                (_a = messageContainer.querySelector(`[${resultIdAttribute}="${result.id}"]`)) === null || _a === void 0 ? void 0 : _a.remove();
            }
        }
    }
    reverseMap(results) {
        const map = new Map();
        for (const { result, targets } of results) {
            for (const target of targets) {
                let targetResults = map.get(target);
                if (targetResults === void 0) {
                    map.set(target, targetResults = []);
                }
                targetResults.push(result);
            }
        }
        return map;
    }
};
ValidationResultPresenterService = __decorate([
    __param(0, IPlatform)
], ValidationResultPresenterService);

export { BindingInfo, ControllerValidateResult, IDefaultTrigger, IValidationController, ValidateBindingBehavior, ValidateEventKind, ValidationContainerCustomElement, ValidationController, ValidationControllerFactory, ValidationErrorsCustomAttribute, ValidationEvent, ValidationHtmlConfiguration, ValidationResultPresenterService, ValidationResultTarget, ValidationTrigger, defaultContainerDefinition, defaultContainerTemplate, getDefaultValidationHtmlConfiguration, getPropertyInfo };
//# sourceMappingURL=index.dev.js.map
