var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { DI, IServiceLocator, } from '@aurelia/kernel';
import { IExpressionParser } from '@aurelia/runtime';
import { parsePropertyName, PropertyRule, ValidationResult, IValidator, ValidateInstruction } from '@aurelia/validation';
import { IPlatform, } from '@aurelia/runtime-html';
export var ValidateEventKind;
(function (ValidateEventKind) {
    ValidateEventKind["validate"] = "validate";
    ValidateEventKind["reset"] = "reset";
})(ValidateEventKind || (ValidateEventKind = {}));
/**
 * The result of a call to the validation controller's validate method.
 */
export class ControllerValidateResult {
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
export class ValidationResultTarget {
    constructor(result, targets) {
        this.result = result;
        this.targets = targets;
    }
}
/**
 * Describes the contract of the validation event.
 * Used to notify the subscribers.
 */
export class ValidationEvent {
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
export class BindingInfo {
    /**
     * @param {Element} target - The HTMLElement associated with the binding.
     * @param {Scope} scope - The binding scope.
     * @param {Scope | null} [hostScope] - The host scope.
     * @param {PropertyRule[]} [rules] - Rules bound to the binding behavior.
     * @param {(PropertyInfo | undefined)} [propertyInfo=void 0] - Information describing the associated property for the binding.
     * @memberof BindingInfo
     */
    constructor(target, scope, hostScope, rules, propertyInfo = void 0) {
        this.target = target;
        this.scope = scope;
        this.hostScope = hostScope;
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
export function getPropertyInfo(binding, info, flags = 0 /* none */) {
    let propertyInfo = info.propertyInfo;
    if (propertyInfo !== void 0) {
        return propertyInfo;
    }
    const scope = info.scope;
    const hostScope = info.hostScope;
    let expression = binding.sourceExpression.expression;
    const locator = binding.locator;
    let toCachePropertyName = true;
    let propertyName = '';
    while (expression !== void 0 && expression?.$kind !== 10082 /* AccessScope */) {
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
                memberName = `[${keyExpr.evaluate(flags, scope, hostScope, locator, null).toString()}]`;
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
        object = expression.accessHostScope ? hostScope?.bindingContext : scope.bindingContext;
    }
    else {
        object = expression.evaluate(flags, scope, hostScope, locator, null);
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
export const IValidationController = DI.createInterface('IValidationController');
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
        const { object: obj, objectTag, flags } = instruction ?? {};
        let instructions;
        if (obj !== void 0) {
            instructions = [new ValidateInstruction(obj, instruction.propertyName, instruction.rules ?? this.objects.get(obj), objectTag, instruction.propertyTag)];
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
export { ValidationController };
export class ValidationControllerFactory {
    constructor() {
        this.Type = (void 0);
    }
    registerTransformer(_transformer) {
        return false;
    }
    construct(container, _dynamicDependencies) {
        return _dynamicDependencies !== void 0
            ? Reflect.construct(ValidationController, _dynamicDependencies)
            : new ValidationController(container.get(IValidator), container.get(IExpressionParser), container.get(IPlatform), container);
    }
}
//# sourceMappingURL=validation-controller.js.map