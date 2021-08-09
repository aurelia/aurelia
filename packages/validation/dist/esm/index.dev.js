import { DI, Protocol, Metadata, toArray, ILogger, IServiceLocator, Registration, noop } from '@aurelia/kernel';
import * as AST from '@aurelia/runtime';
import { Scope, IExpressionParser, PrimitiveLiteralExpression } from '@aurelia/runtime';

const IValidationExpressionHydrator = DI.createInterface('IValidationExpressionHydrator');

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

const IValidationMessageProvider = DI.createInterface('IValidationMessageProvider');
const ValidationRuleAliasMessage = Object.freeze({
    aliasKey: Protocol.annotation.keyFor('validation-rule-alias-message'),
    define(target, definition) {
        ValidationRuleAliasMessage.setDefaultMessage(target, definition);
        return target;
    },
    setDefaultMessage(rule, { aliases }, append = true) {
        // conditionally merge
        const defaultMessages = append ? Metadata.getOwn(this.aliasKey, rule.prototype) : void 0;
        if (defaultMessages !== void 0) {
            // TODO: have polyfill for `Object.fromEntries` as IE does not yet support it
            const allMessages = {
                ...Object.fromEntries(defaultMessages.map(({ name, defaultMessage }) => [name, defaultMessage])),
                ...Object.fromEntries(aliases.map(({ name, defaultMessage }) => [name, defaultMessage])),
            };
            aliases = toArray(Object.entries(allMessages)).map(([name, defaultMessage]) => ({ name, defaultMessage }));
        }
        Metadata.define(ValidationRuleAliasMessage.aliasKey, aliases, rule instanceof Function ? rule.prototype : rule);
    },
    getDefaultMessages(rule) {
        return Metadata.get(this.aliasKey, rule instanceof Function ? rule.prototype : rule);
    }
});
function validationRule(definition) {
    return function (target) {
        return ValidationRuleAliasMessage.define(target, definition);
    };
}
/**
 * Abstract validation rule.
 */
let BaseValidationRule = class BaseValidationRule {
    constructor(messageKey = (void 0)) {
        this.messageKey = messageKey;
        this.tag = (void 0);
    }
    canExecute(_object) { return true; }
    execute(_value, _object) {
        throw new Error('No base implementation of execute. Did you forget to implement the execute method?'); // TODO: reporter
    }
    accept(_visitor) {
        throw new Error('No base implementation of accept. Did you forget to implement the accept method?'); // TODO: reporter
    }
};
BaseValidationRule.$TYPE = '';
BaseValidationRule = __decorate([
    validationRule({ aliases: [{ name: (void 0), defaultMessage: `\${$displayName} is invalid.` }] })
], BaseValidationRule);
/**
 * Passes the validation if the value is not `null`, and not `undefined`.
 * In case of string, it must not be empty.
 *
 * @see PropertyRule#required
 */
let RequiredRule = class RequiredRule extends BaseValidationRule {
    constructor() { super('required'); }
    execute(value) {
        return value !== null
            && value !== void 0
            && !(typeof value === 'string' && !/\S/.test(value));
    }
    accept(visitor) {
        return visitor.visitRequiredRule(this);
    }
};
RequiredRule.$TYPE = 'RequiredRule';
RequiredRule = __decorate([
    validationRule({ aliases: [{ name: 'required', defaultMessage: `\${$displayName} is required.` }] })
], RequiredRule);
/**
 * Passes the validation if the non-`null`, non-`undefined`, and non-empty string value matches the given pattern described by a regular expression.
 * There are 2 aliases: 'matches' (any random regex), and 'email' (with email regex).
 *
 * @see PropertyRule#matches
 * @see PropertyRule#email
 */
let RegexRule = class RegexRule extends BaseValidationRule {
    constructor(pattern, messageKey = 'matches') {
        super(messageKey);
        this.pattern = pattern;
    }
    execute(value) {
        return value === null
            || value === undefined
            || value.length === 0
            || this.pattern.test(value);
    }
    accept(visitor) {
        return visitor.visitRegexRule(this);
    }
};
RegexRule.$TYPE = 'RegexRule';
RegexRule = __decorate([
    validationRule({
        aliases: [
            { name: 'matches', defaultMessage: `\${$displayName} is not correctly formatted.` },
            { name: 'email', defaultMessage: `\${$displayName} is not a valid email.` },
        ]
    })
], RegexRule);
/**
 * Passes the validation if the non-`null`, non-`undefined`, and non-empty string value matches the given length constraint.
 * There are 2 aliases: 'minLength', and 'maxLength'.
 *
 * @see PropertyRule#minLength
 * @see PropertyRule#maxLength
 */
let LengthRule = class LengthRule extends BaseValidationRule {
    constructor(length, isMax) {
        super(isMax ? 'maxLength' : 'minLength');
        this.length = length;
        this.isMax = isMax;
    }
    execute(value) {
        return value === null
            || value === undefined
            || value.length === 0
            || (this.isMax ? value.length <= this.length : value.length >= this.length);
    }
    accept(visitor) {
        return visitor.visitLengthRule(this);
    }
};
LengthRule.$TYPE = 'LengthRule';
LengthRule = __decorate([
    validationRule({
        aliases: [
            { name: 'minLength', defaultMessage: `\${$displayName} must be at least \${$rule.length} character\${$rule.length === 1 ? '' : 's'}.` },
            { name: 'maxLength', defaultMessage: `\${$displayName} cannot be longer than \${$rule.length} character\${$rule.length === 1 ? '' : 's'}.` },
        ]
    })
], LengthRule);
/**
 * Passes the validation if the non-`null`, and non-`undefined` array value matches the given count constraint.
 * There are 2 aliases: 'minItems', and 'maxItems'.
 *
 * @see PropertyRule#minItems
 * @see PropertyRule#maxItems
 */
let SizeRule = class SizeRule extends BaseValidationRule {
    constructor(count, isMax) {
        super(isMax ? 'maxItems' : 'minItems');
        this.count = count;
        this.isMax = isMax;
    }
    execute(value) {
        return value === null
            || value === undefined
            || (this.isMax ? value.length <= this.count : value.length >= this.count);
    }
    accept(visitor) {
        return visitor.visitSizeRule(this);
    }
};
SizeRule.$TYPE = 'SizeRule';
SizeRule = __decorate([
    validationRule({
        aliases: [
            { name: 'minItems', defaultMessage: `\${$displayName} must contain at least \${$rule.count} item\${$rule.count === 1 ? '' : 's'}.` },
            { name: 'maxItems', defaultMessage: `\${$displayName} cannot contain more than \${$rule.count} item\${$rule.count === 1 ? '' : 's'}.` },
        ]
    })
], SizeRule);
/**
 * Passes the validation if the non-`null`, and non-`undefined` numeric value matches the given interval constraint.
 * There are 2 aliases: 'min' (`[min,]`), 'max' (`[, max]`), range (`[min, max]`), and 'between' (`(min, max)`).
 *
 * @see PropertyRule#min
 * @see PropertyRule#max
 * @see PropertyRule#range
 * @see PropertyRule#between
 */
let RangeRule = class RangeRule extends BaseValidationRule {
    constructor(isInclusive, { min, max }) {
        super(min !== void 0 && max !== void 0
            ? (isInclusive ? 'range' : 'between')
            : (min !== void 0 ? 'min' : 'max'));
        this.isInclusive = isInclusive;
        this.min = Number.NEGATIVE_INFINITY;
        this.max = Number.POSITIVE_INFINITY;
        this.min = min !== null && min !== void 0 ? min : this.min;
        this.max = max !== null && max !== void 0 ? max : this.max;
    }
    execute(value, _object) {
        return value === null
            || value === undefined
            || (this.isInclusive
                ? value >= this.min && value <= this.max
                : value > this.min && value < this.max);
    }
    accept(visitor) {
        return visitor.visitRangeRule(this);
    }
};
RangeRule.$TYPE = 'RangeRule';
RangeRule = __decorate([
    validationRule({
        aliases: [
            { name: 'min', defaultMessage: `\${$displayName} must be at least \${$rule.min}.` },
            { name: 'max', defaultMessage: `\${$displayName} must be at most \${$rule.max}.` },
            { name: 'range', defaultMessage: `\${$displayName} must be between or equal to \${$rule.min} and \${$rule.max}.` },
            { name: 'between', defaultMessage: `\${$displayName} must be between but not equal to \${$rule.min} and \${$rule.max}.` },
        ]
    })
], RangeRule);
/**
 * Passes the validation if the the non-`null`, non-`undefined`, non-empty value matches given expected value.
 *
 * @see PropertyRule#equals
 */
let EqualsRule = class EqualsRule extends BaseValidationRule {
    constructor(expectedValue) {
        super('equals');
        this.expectedValue = expectedValue;
    }
    execute(value) {
        return value === null
            || value === undefined
            || value === ''
            || value === this.expectedValue;
    }
    accept(visitor) {
        return visitor.visitEqualsRule(this);
    }
};
EqualsRule.$TYPE = 'EqualsRule';
EqualsRule = __decorate([
    validationRule({
        aliases: [
            { name: 'equals', defaultMessage: `\${$displayName} must be \${$rule.expectedValue}.` },
        ]
    })
], EqualsRule);

/* @internal */
const ICustomMessages = DI.createInterface('ICustomMessages');
class RuleProperty {
    constructor(expression, name = void 0, displayName = void 0) {
        this.expression = expression;
        this.name = name;
        this.displayName = displayName;
    }
    accept(visitor) {
        return visitor.visitRuleProperty(this);
    }
}
RuleProperty.$TYPE = 'RuleProperty';
const validationRulesRegistrar = Object.freeze({
    name: 'validation-rules',
    defaultRuleSetName: '__default',
    set(target, rules, tag) {
        const key = `${validationRulesRegistrar.name}:${tag !== null && tag !== void 0 ? tag : validationRulesRegistrar.defaultRuleSetName}`;
        Metadata.define(Protocol.annotation.keyFor(key), rules, target);
        const keys = Metadata.getOwn(Protocol.annotation.name, target);
        if (keys === void 0) {
            Metadata.define(Protocol.annotation.name, [key], target);
        }
        else {
            keys.push(key);
        }
    },
    get(target, tag) {
        var _a;
        const key = Protocol.annotation.keyFor(validationRulesRegistrar.name, tag !== null && tag !== void 0 ? tag : validationRulesRegistrar.defaultRuleSetName);
        return (_a = Metadata.get(key, target)) !== null && _a !== void 0 ? _a : Metadata.getOwn(key, target.constructor);
    },
    unset(target, tag) {
        const keys = Metadata.getOwn(Protocol.annotation.name, target);
        for (const key of keys.slice(0)) {
            if (key.startsWith(validationRulesRegistrar.name) && (tag === void 0 || key.endsWith(tag))) {
                Metadata.delete(Protocol.annotation.keyFor(key), target);
                const index = keys.indexOf(key);
                if (index > -1) {
                    keys.splice(index, 1);
                }
            }
        }
    },
    isValidationRulesSet(target) {
        const keys = Metadata.getOwn(Protocol.annotation.name, target);
        return keys !== void 0 && keys.some((key) => key.startsWith(validationRulesRegistrar.name));
    }
});
class ValidationMessageEvaluationContext {
    constructor(messageProvider, $displayName, $propertyName, $value, $rule, $object) {
        this.messageProvider = messageProvider;
        this.$displayName = $displayName;
        this.$propertyName = $propertyName;
        this.$value = $value;
        this.$rule = $rule;
        this.$object = $object;
    }
    $getDisplayName(propertyName, displayName) {
        return this.messageProvider.getDisplayName(propertyName, displayName);
    }
}
class PropertyRule {
    constructor(locator, validationRules, messageProvider, property, $rules = [[]]) {
        this.locator = locator;
        this.validationRules = validationRules;
        this.messageProvider = messageProvider;
        this.property = property;
        this.$rules = $rules;
    }
    accept(visitor) {
        return visitor.visitPropertyRule(this);
    }
    /** @internal */
    addRule(rule) {
        const rules = this.getLeafRules();
        rules.push(this.latestRule = rule);
        return this;
    }
    getLeafRules() {
        const depth = this.$rules.length - 1;
        return this.$rules[depth];
    }
    async validate(object, tag, flags, scope) {
        if (flags === void 0) {
            flags = 0 /* none */;
        }
        if (scope === void 0) {
            scope = Scope.create({ [rootObjectSymbol]: object });
        }
        const expression = this.property.expression;
        let value;
        if (expression === void 0) {
            value = object;
        }
        else {
            value = expression.evaluate(flags, scope, this.locator, null);
        }
        let isValid = true;
        const validateRuleset = async (rules) => {
            const validateRule = async (rule) => {
                let isValidOrPromise = rule.execute(value, object);
                if (isValidOrPromise instanceof Promise) {
                    isValidOrPromise = await isValidOrPromise;
                }
                isValid = isValid && isValidOrPromise;
                const { displayName, name } = this.property;
                let message;
                if (!isValidOrPromise) {
                    const messageEvaluationScope = Scope.create(new ValidationMessageEvaluationContext(this.messageProvider, this.messageProvider.getDisplayName(name, displayName), name, value, rule, object));
                    message = this.messageProvider.getMessage(rule).evaluate(flags, messageEvaluationScope, null, null);
                }
                return new ValidationResult(isValidOrPromise, message, name, object, rule, this);
            };
            const promises = [];
            for (const rule of rules) {
                if (rule.canExecute(object) && (tag === void 0 || rule.tag === tag)) {
                    promises.push(validateRule(rule));
                }
            }
            return Promise.all(promises);
        };
        const accumulateResult = async (results, rules) => {
            const result = await validateRuleset(rules);
            results.push(...result);
            return results;
        };
        return this.$rules.reduce(async (acc, ruleset) => acc.then(async (accValidateResult) => isValid ? accumulateResult(accValidateResult, ruleset) : Promise.resolve(accValidateResult)), Promise.resolve([]));
    }
    // #region customization API
    /**
     * Validate subsequent rules after previously declared rules have been validated successfully.
     * Use to postpone validation of costly rules until less expensive rules pass validation.
     */
    then() {
        this.$rules.push([]);
        return this;
    }
    /**
     * Specifies the key to use when looking up the rule's validation message.
     * Note that custom keys needs to be registered during plugin registration.
     */
    withMessageKey(key) {
        this.assertLatestRule(this.latestRule);
        this.latestRule.messageKey = key;
        return this;
    }
    /**
     * Specifies rule's validation message; this overrides the rules default validation message.
     */
    withMessage(message) {
        const rule = this.latestRule;
        this.assertLatestRule(rule);
        this.messageProvider.setMessage(rule, message);
        return this;
    }
    /**
     * Specifies a condition that must be met before attempting to validate the rule.
     *
     * @param {ValidationRuleExecutionPredicate<TObject>} condition - A function that accepts the object as a parameter and returns true or false whether the rule should be evaluated.
     */
    when(condition) {
        this.assertLatestRule(this.latestRule);
        this.latestRule.canExecute = condition;
        return this;
    }
    /**
     * Tags the rule instance.
     * The tag can later be used to perform selective validation.
     */
    tag(tag) {
        this.assertLatestRule(this.latestRule);
        this.latestRule.tag = tag;
        return this;
    }
    assertLatestRule(latestRule) {
        if (latestRule === void 0) {
            throw new Error('No rule has been added'); // TODO: use reporter
        }
    }
    // #endregion
    // #region rule helper API
    /**
     * Sets the display name of the ensured property.
     */
    displayName(name) {
        this.property.displayName = name;
        return this;
    }
    /**
     * Applies an ad-hoc rule function to the ensured property or object.
     *
     * @param {RuleCondition} condition - The function to validate the rule. Will be called with two arguments, the property value and the object.
     */
    satisfies(condition) {
        const rule = new (class extends BaseValidationRule {
            constructor() {
                super(...arguments);
                this.execute = condition;
            }
        })();
        return this.addRule(rule);
    }
    /**
     * Applies a custom rule instance.
     *
     * @param {TRule} validationRule - rule instance.
     */
    satisfiesRule(validationRule) {
        return this.addRule(validationRule);
    }
    /**
     * Applies an instance of `RequiredRule`.
     */
    required() {
        return this.addRule(new RequiredRule());
    }
    /**
     * Applies an instance of `RegexRule`.
     */
    matches(regex) {
        return this.addRule(new RegexRule(regex));
    }
    /**
     * Applies an instance of `RegexRule` with email pattern.
     */
    email() {
        // eslint-disable-next-line no-useless-escape
        const emailPattern = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return this.addRule(new RegexRule(emailPattern, 'email'));
    }
    /**
     * Applies an instance of `LengthRule` with min `length` constraint.
     * Applicable for string value.
     */
    minLength(length) {
        return this.addRule(new LengthRule(length, false));
    }
    /**
     * Applies an instance of `LengthRule` with max `length` constraint.
     * Applicable for string value.
     */
    maxLength(length) {
        return this.addRule(new LengthRule(length, true));
    }
    /**
     * Applies an instance of `SizeRule` with min `count` constraint.
     * Applicable for array value.
     */
    minItems(count) {
        return this.addRule(new SizeRule(count, false));
    }
    /**
     * Applies an instance of `SizeRule` with max `count` constraint.
     * Applicable for array value.
     */
    maxItems(count) {
        return this.addRule(new SizeRule(count, true));
    }
    /**
     * Applies an instance of `RangeRule` with [`constraint`,] interval.
     * Applicable for number value.
     */
    min(constraint) {
        return this.addRule(new RangeRule(true, { min: constraint }));
    }
    /**
     * Applies an instance of `RangeRule` with [,`constraint`] interval.
     * Applicable for number value.
     */
    max(constraint) {
        return this.addRule(new RangeRule(true, { max: constraint }));
    }
    /**
     * Applies an instance of `RangeRule` with [`min`,`max`] interval.
     * Applicable for number value.
     */
    range(min, max) {
        return this.addRule(new RangeRule(true, { min, max }));
    }
    /**
     * Applies an instance of `RangeRule` with (`min`,`max`) interval.
     * Applicable for number value.
     */
    between(min, max) {
        return this.addRule(new RangeRule(false, { min, max }));
    }
    /**
     * Applies an instance of `EqualsRule` with the `expectedValue`.
     */
    equals(expectedValue) {
        return this.addRule(new EqualsRule(expectedValue));
    }
    ensure(property) {
        this.latestRule = void 0;
        return this.validationRules.ensure(property);
    }
    /**
     * Targets an object with validation rules.
     */
    ensureObject() {
        this.latestRule = void 0;
        return this.validationRules.ensureObject();
    }
    /**
     * Rules that have been defined using the fluent API.
     */
    get rules() {
        return this.validationRules.rules;
    }
    on(target, tag) {
        return this.validationRules.on(target, tag);
    }
}
PropertyRule.$TYPE = 'PropertyRule';
class ModelBasedRule {
    constructor(ruleset, tag = validationRulesRegistrar.defaultRuleSetName) {
        this.ruleset = ruleset;
        this.tag = tag;
    }
}
const IValidationRules = DI.createInterface('IValidationRules');
let ValidationRules = class ValidationRules {
    constructor(locator, parser, messageProvider, deserializer) {
        this.locator = locator;
        this.parser = parser;
        this.messageProvider = messageProvider;
        this.deserializer = deserializer;
        this.rules = [];
        this.targets = new Set();
    }
    ensure(property) {
        const [name, expression] = parsePropertyName(property, this.parser);
        // eslint-disable-next-line eqeqeq
        let rule = this.rules.find((r) => r.property.name == name);
        if (rule === void 0) {
            rule = new PropertyRule(this.locator, this, this.messageProvider, new RuleProperty(expression, name));
            this.rules.push(rule);
        }
        return rule;
    }
    ensureObject() {
        const rule = new PropertyRule(this.locator, this, this.messageProvider, new RuleProperty());
        this.rules.push(rule);
        return rule;
    }
    on(target, tag) {
        const rules = validationRulesRegistrar.get(target, tag);
        if (Object.is(rules, this.rules)) {
            return this;
        }
        this.rules = rules !== null && rules !== void 0 ? rules : [];
        validationRulesRegistrar.set(target, this.rules, tag);
        this.targets.add(target);
        return this;
    }
    off(target, tag) {
        const $targets = target !== void 0 ? [target] : Array.from(this.targets);
        for (const $target of $targets) {
            validationRulesRegistrar.unset($target, tag);
            if (!validationRulesRegistrar.isValidationRulesSet($target)) {
                this.targets.delete($target);
            }
        }
    }
    applyModelBasedRules(target, rules) {
        const tags = new Set();
        for (const rule of rules) {
            const tag = rule.tag;
            if (tags.has(tag)) {
                console.warn(`A ruleset for tag ${tag} is already defined which will be overwritten`); // TODO: use reporter/logger
            }
            const ruleset = this.deserializer.hydrateRuleset(rule.ruleset, this);
            validationRulesRegistrar.set(target, ruleset, tag);
            tags.add(tag);
        }
    }
};
ValidationRules = __decorate([
    __param(0, IServiceLocator),
    __param(1, IExpressionParser),
    __param(2, IValidationMessageProvider),
    __param(3, IValidationExpressionHydrator)
], ValidationRules);
// eslint-disable-next-line no-useless-escape
const classicAccessorPattern = /^function\s*\([$_\w\d]+\)\s*\{(?:\s*["']{1}use strict["']{1};)?(?:[$_\s\w\d\/\*.['"\]+;]+)?\s*return\s+[$_\w\d]+((\.[$_\w\d]+|\[['"$_\w\d]+\])+)\s*;?\s*\}$/;
const arrowAccessorPattern = /^\(?[$_\w\d]+\)?\s*=>\s*[$_\w\d]+((\.[$_\w\d]+|\[['"$_\w\d]+\])+)$/;
const rootObjectSymbol = '$root';
function parsePropertyName(property, parser) {
    var _a;
    switch (typeof property) {
        case 'string':
            break;
        case 'function': {
            const fn = property.toString();
            const match = (_a = arrowAccessorPattern.exec(fn)) !== null && _a !== void 0 ? _a : classicAccessorPattern.exec(fn);
            if (match === null) {
                throw new Error(`Unable to parse accessor function:\n${fn}`); // TODO: use reporter
            }
            property = match[1].substring(1);
            break;
        }
        default:
            throw new Error(`Unable to parse accessor function:\n${property}`); // TODO: use reporter
    }
    return [property, parser.parse(`${rootObjectSymbol}.${property}`, 8 /* IsProperty */)];
}
/**
 * The result of validating an individual validation rule.
 */
class ValidationResult {
    /**
     * @param {boolean} valid - `true` is the validation was successful, else `false`.
     * @param {(string | undefined)} message - Evaluated validation message, if the result is not valid, else `undefined`.
     * @param {(string | number | undefined)} propertyName - Associated property name.
     * @param {(IValidateable | undefined)} object - Associated target object.
     * @param {(TRule | undefined)} rule - Associated instance of rule.
     * @param {(PropertyRule | undefined)} propertyRule - Associated parent property rule.
     * @param {boolean} [isManual=false] - `true` if the validation result is added manually.
     */
    constructor(valid, message, propertyName, object, rule, propertyRule, isManual = false) {
        this.valid = valid;
        this.message = message;
        this.propertyName = propertyName;
        this.object = object;
        this.rule = rule;
        this.propertyRule = propertyRule;
        this.isManual = isManual;
        this.id = ValidationResult.nextId++;
    }
    toString() {
        return this.valid ? 'Valid.' : this.message;
    }
}
ValidationResult.nextId = 0;
const contextualProperties = new Set([
    'displayName',
    'propertyName',
    'value',
    'object',
    'config',
    'getDisplayName'
]);
let ValidationMessageProvider = class ValidationMessageProvider {
    constructor(parser, logger, customMessages) {
        this.parser = parser;
        this.registeredMessages = new WeakMap();
        this.logger = logger.scopeTo(ValidationMessageProvider.name);
        for (const { rule, aliases } of customMessages) {
            ValidationRuleAliasMessage.setDefaultMessage(rule, { aliases });
        }
    }
    getMessage(rule) {
        var _a;
        const parsedMessage = this.registeredMessages.get(rule);
        if (parsedMessage !== void 0) {
            return parsedMessage;
        }
        const validationMessages = ValidationRuleAliasMessage.getDefaultMessages(rule);
        const messageKey = rule.messageKey;
        let message;
        const messageCount = validationMessages.length;
        if (messageCount === 1 && messageKey === void 0) {
            message = validationMessages[0].defaultMessage;
        }
        else {
            message = (_a = validationMessages.find(m => m.name === messageKey)) === null || _a === void 0 ? void 0 : _a.defaultMessage;
        }
        if (!message) {
            message = ValidationRuleAliasMessage.getDefaultMessages(BaseValidationRule)[0].defaultMessage;
        }
        return this.setMessage(rule, message);
    }
    setMessage(rule, message) {
        const parsedMessage = this.parseMessage(message);
        this.registeredMessages.set(rule, parsedMessage);
        return parsedMessage;
    }
    parseMessage(message) {
        const parsed = this.parser.parse(message, 1 /* Interpolation */);
        if ((parsed === null || parsed === void 0 ? void 0 : parsed.$kind) === 24 /* Interpolation */) {
            for (const expr of parsed.expressions) {
                const name = expr.name;
                if (contextualProperties.has(name)) {
                    this.logger.warn(`Did you mean to use "$${name}" instead of "${name}" in this validation message template: "${message}"?`);
                }
                if (expr.$kind === 1793 /* AccessThis */ || expr.ancestor > 0) {
                    throw new Error('$parent is not permitted in validation message expressions.'); // TODO: use reporter
                }
            }
            return parsed;
        }
        return new PrimitiveLiteralExpression(message);
    }
    getDisplayName(propertyName, displayName) {
        if (displayName !== null && displayName !== undefined) {
            return (displayName instanceof Function) ? displayName() : displayName;
        }
        if (propertyName === void 0) {
            return;
        }
        // split on upper-case letters.
        const words = propertyName.toString().split(/(?=[A-Z])/).join(' ');
        // capitalize first letter.
        return words.charAt(0).toUpperCase() + words.slice(1);
    }
};
ValidationMessageProvider = __decorate([
    __param(0, IExpressionParser),
    __param(1, ILogger),
    __param(2, ICustomMessages)
], ValidationMessageProvider);

var ASTExpressionTypes;
(function (ASTExpressionTypes) {
    ASTExpressionTypes["BindingBehaviorExpression"] = "BindingBehaviorExpression";
    ASTExpressionTypes["ValueConverterExpression"] = "ValueConverterExpression";
    ASTExpressionTypes["AssignExpression"] = "AssignExpression";
    ASTExpressionTypes["ConditionalExpression"] = "ConditionalExpression";
    ASTExpressionTypes["AccessThisExpression"] = "AccessThisExpression";
    ASTExpressionTypes["AccessScopeExpression"] = "AccessScopeExpression";
    ASTExpressionTypes["AccessMemberExpression"] = "AccessMemberExpression";
    ASTExpressionTypes["AccessKeyedExpression"] = "AccessKeyedExpression";
    ASTExpressionTypes["CallScopeExpression"] = "CallScopeExpression";
    ASTExpressionTypes["CallMemberExpression"] = "CallMemberExpression";
    ASTExpressionTypes["CallFunctionExpression"] = "CallFunctionExpression";
    ASTExpressionTypes["BinaryExpression"] = "BinaryExpression";
    ASTExpressionTypes["UnaryExpression"] = "UnaryExpression";
    ASTExpressionTypes["PrimitiveLiteralExpression"] = "PrimitiveLiteralExpression";
    ASTExpressionTypes["ArrayLiteralExpression"] = "ArrayLiteralExpression";
    ASTExpressionTypes["ObjectLiteralExpression"] = "ObjectLiteralExpression";
    ASTExpressionTypes["TemplateExpression"] = "TemplateExpression";
    ASTExpressionTypes["TaggedTemplateExpression"] = "TaggedTemplateExpression";
    ASTExpressionTypes["ArrayBindingPattern"] = "ArrayBindingPattern";
    ASTExpressionTypes["ObjectBindingPattern"] = "ObjectBindingPattern";
    ASTExpressionTypes["BindingIdentifier"] = "BindingIdentifier";
    ASTExpressionTypes["ForOfStatement"] = "ForOfStatement";
    ASTExpressionTypes["Interpolation"] = "Interpolation";
})(ASTExpressionTypes || (ASTExpressionTypes = {}));
class Deserializer {
    static deserialize(serializedExpr) {
        const deserializer = new Deserializer();
        const raw = JSON.parse(serializedExpr);
        return deserializer.hydrate(raw);
    }
    hydrate(raw) {
        switch (raw.$TYPE) {
            case ASTExpressionTypes.AccessMemberExpression: {
                const expr = raw;
                return new AST.AccessMemberExpression(this.hydrate(expr.object), expr.name);
            }
            case ASTExpressionTypes.AccessKeyedExpression: {
                const expr = raw;
                return new AST.AccessKeyedExpression(this.hydrate(expr.object), this.hydrate(expr.key));
            }
            case ASTExpressionTypes.AccessThisExpression: {
                const expr = raw;
                return new AST.AccessThisExpression(expr.ancestor);
            }
            case ASTExpressionTypes.AccessScopeExpression: {
                const expr = raw;
                return new AST.AccessScopeExpression(expr.name, expr.ancestor);
            }
            case ASTExpressionTypes.ArrayLiteralExpression: {
                const expr = raw;
                return new AST.ArrayLiteralExpression(this.hydrate(expr.elements));
            }
            case ASTExpressionTypes.ObjectLiteralExpression: {
                const expr = raw;
                return new AST.ObjectLiteralExpression(this.hydrate(expr.keys), this.hydrate(expr.values));
            }
            case ASTExpressionTypes.PrimitiveLiteralExpression: {
                const expr = raw;
                return new AST.PrimitiveLiteralExpression(this.hydrate(expr.value));
            }
            case ASTExpressionTypes.CallFunctionExpression: {
                const expr = raw;
                return new AST.CallFunctionExpression(this.hydrate(expr.func), this.hydrate(expr.args));
            }
            case ASTExpressionTypes.CallMemberExpression: {
                const expr = raw;
                return new AST.CallMemberExpression(this.hydrate(expr.object), expr.name, this.hydrate(expr.args));
            }
            case ASTExpressionTypes.CallScopeExpression: {
                const expr = raw;
                return new AST.CallScopeExpression(expr.name, this.hydrate(expr.args), expr.ancestor);
            }
            case ASTExpressionTypes.TemplateExpression: {
                const expr = raw;
                return new AST.TemplateExpression(this.hydrate(expr.cooked), this.hydrate(expr.expressions));
            }
            case ASTExpressionTypes.TaggedTemplateExpression: {
                const expr = raw;
                return new AST.TaggedTemplateExpression(this.hydrate(expr.cooked), this.hydrate(expr.raw), this.hydrate(expr.func), this.hydrate(expr.expressions));
            }
            case ASTExpressionTypes.UnaryExpression: {
                const expr = raw;
                return new AST.UnaryExpression(expr.operation, this.hydrate(expr.expression));
            }
            case ASTExpressionTypes.BinaryExpression: {
                const expr = raw;
                return new AST.BinaryExpression(expr.operation, this.hydrate(expr.left), this.hydrate(expr.right));
            }
            case ASTExpressionTypes.ConditionalExpression: {
                const expr = raw;
                return new AST.ConditionalExpression(this.hydrate(expr.condition), this.hydrate(expr.yes), this.hydrate(expr.no));
            }
            case ASTExpressionTypes.AssignExpression: {
                const expr = raw;
                return new AST.AssignExpression(this.hydrate(expr.target), this.hydrate(expr.value));
            }
            case ASTExpressionTypes.ValueConverterExpression: {
                const expr = raw;
                return new AST.ValueConverterExpression(this.hydrate(expr.expression), expr.name, this.hydrate(expr.args));
            }
            case ASTExpressionTypes.BindingBehaviorExpression: {
                const expr = raw;
                return new AST.BindingBehaviorExpression(this.hydrate(expr.expression), expr.name, this.hydrate(expr.args));
            }
            case ASTExpressionTypes.ArrayBindingPattern: {
                const expr = raw;
                return new AST.ArrayBindingPattern(this.hydrate(expr.elements));
            }
            case ASTExpressionTypes.ObjectBindingPattern: {
                const expr = raw;
                return new AST.ObjectBindingPattern(this.hydrate(expr.keys), this.hydrate(expr.values));
            }
            case ASTExpressionTypes.BindingIdentifier: {
                const expr = raw;
                return new AST.BindingIdentifier(expr.name);
            }
            case ASTExpressionTypes.ForOfStatement: {
                const expr = raw;
                return new AST.ForOfStatement(this.hydrate(expr.declaration), this.hydrate(expr.iterable));
            }
            case ASTExpressionTypes.Interpolation: {
                const expr = raw;
                return new AST.Interpolation(this.hydrate(expr.cooked), this.hydrate(expr.expressions));
            }
            default:
                if (Array.isArray(raw)) {
                    if (typeof raw[0] === 'object') {
                        return this.deserializeExpressions(raw);
                    }
                    else {
                        return raw.map(deserializePrimitive);
                    }
                }
                else if (typeof raw !== 'object') {
                    return deserializePrimitive(raw);
                }
                throw new Error(`unable to deserialize the expression: ${raw}`); // TODO use reporter/logger
        }
    }
    deserializeExpressions(exprs) {
        const expressions = [];
        for (const expr of exprs) {
            expressions.push(this.hydrate(expr));
        }
        return expressions;
    }
}
class Serializer {
    static serialize(expr) {
        const visitor = new Serializer();
        if (expr == null || typeof expr.accept !== 'function') {
            return `${expr}`;
        }
        return expr.accept(visitor);
    }
    visitAccessMember(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.AccessMemberExpression}","name":"${expr.name}","object":${expr.object.accept(this)}}`;
    }
    visitAccessKeyed(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.AccessKeyedExpression}","object":${expr.object.accept(this)},"key":${expr.key.accept(this)}}`;
    }
    visitAccessThis(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.AccessThisExpression}","ancestor":${expr.ancestor}}`;
    }
    visitAccessScope(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.AccessScopeExpression}","name":"${expr.name}","ancestor":${expr.ancestor}}`;
    }
    visitArrayLiteral(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.ArrayLiteralExpression}","elements":${this.serializeExpressions(expr.elements)}}`;
    }
    visitObjectLiteral(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.ObjectLiteralExpression}","keys":${serializePrimitives(expr.keys)},"values":${this.serializeExpressions(expr.values)}}`;
    }
    visitPrimitiveLiteral(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.PrimitiveLiteralExpression}","value":${serializePrimitive(expr.value)}}`;
    }
    visitCallFunction(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.CallFunctionExpression}","func":${expr.func.accept(this)},"args":${this.serializeExpressions(expr.args)}}`;
    }
    visitCallMember(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.CallMemberExpression}","name":"${expr.name}","object":${expr.object.accept(this)},"args":${this.serializeExpressions(expr.args)}}`;
    }
    visitCallScope(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.CallScopeExpression}","name":"${expr.name}","ancestor":${expr.ancestor},"args":${this.serializeExpressions(expr.args)}}`;
    }
    visitTemplate(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.TemplateExpression}","cooked":${serializePrimitives(expr.cooked)},"expressions":${this.serializeExpressions(expr.expressions)}}`;
    }
    visitTaggedTemplate(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.TaggedTemplateExpression}","cooked":${serializePrimitives(expr.cooked)},"raw":${serializePrimitives(expr.cooked.raw)},"func":${expr.func.accept(this)},"expressions":${this.serializeExpressions(expr.expressions)}}`;
    }
    visitUnary(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.UnaryExpression}","operation":"${expr.operation}","expression":${expr.expression.accept(this)}}`;
    }
    visitBinary(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.BinaryExpression}","operation":"${expr.operation}","left":${expr.left.accept(this)},"right":${expr.right.accept(this)}}`;
    }
    visitConditional(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.ConditionalExpression}","condition":${expr.condition.accept(this)},"yes":${expr.yes.accept(this)},"no":${expr.no.accept(this)}}`;
    }
    visitAssign(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.AssignExpression}","target":${expr.target.accept(this)},"value":${expr.value.accept(this)}}`;
    }
    visitValueConverter(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.ValueConverterExpression}","name":"${expr.name}","expression":${expr.expression.accept(this)},"args":${this.serializeExpressions(expr.args)}}`;
    }
    visitBindingBehavior(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.BindingBehaviorExpression}","name":"${expr.name}","expression":${expr.expression.accept(this)},"args":${this.serializeExpressions(expr.args)}}`;
    }
    visitArrayBindingPattern(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.ArrayBindingPattern}","elements":${this.serializeExpressions(expr.elements)}}`;
    }
    visitObjectBindingPattern(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.ObjectBindingPattern}","keys":${serializePrimitives(expr.keys)},"values":${this.serializeExpressions(expr.values)}}`;
    }
    visitBindingIdentifier(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.BindingIdentifier}","name":"${expr.name}"}`;
    }
    visitHtmlLiteral(_expr) { throw new Error('visitHtmlLiteral'); }
    visitForOfStatement(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.ForOfStatement}","declaration":${expr.declaration.accept(this)},"iterable":${expr.iterable.accept(this)}}`;
    }
    visitInterpolation(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.Interpolation}","cooked":${serializePrimitives(expr.parts)},"expressions":${this.serializeExpressions(expr.expressions)}}`;
    }
    serializeExpressions(args) {
        let text = '[';
        for (let i = 0, ii = args.length; i < ii; ++i) {
            if (i !== 0) {
                text += ',';
            }
            text += args[i].accept(this);
        }
        text += ']';
        return text;
    }
}
function serializePrimitives(values) {
    let text = '[';
    for (let i = 0, ii = values.length; i < ii; ++i) {
        if (i !== 0) {
            text += ',';
        }
        text += serializePrimitive(values[i]);
    }
    text += ']';
    return text;
}
function serializePrimitive(value) {
    if (typeof value === 'string') {
        return `"\\"${escapeString(value)}\\""`;
    }
    else if (value == null) {
        return `"${value}"`;
    }
    else {
        return `${value}`;
    }
}
function escapeString(str) {
    let ret = '';
    for (let i = 0, ii = str.length; i < ii; ++i) {
        ret += escape(str.charAt(i));
    }
    return ret;
}
function escape(ch) {
    switch (ch) {
        case '\b': return '\\b';
        case '\t': return '\\t';
        case '\n': return '\\n';
        case '\v': return '\\v';
        case '\f': return '\\f';
        case '\r': return '\\r';
        case '"': return '\\"';
        // case '\'': return '\\\''; /* when used in serialization context, escaping `'` (single quote) is not needed as the string is wrapped in a par of `"` (double quote) */
        case '\\': return '\\\\';
        default: return ch;
    }
}
function deserializePrimitive(value) {
    if (typeof value === 'string') {
        if (value === 'null') {
            return null;
        }
        if (value === 'undefined') {
            return undefined;
        }
        return value.substring(1, value.length - 1);
    }
    else {
        return value;
    }
}

class ValidationSerializer {
    static serialize(object) {
        if (object == null || typeof object.accept !== 'function') {
            return `${object}`;
        }
        const visitor = new ValidationSerializer();
        return object.accept(visitor);
    }
    visitRequiredRule(rule) {
        return `{"$TYPE":"${RequiredRule.$TYPE}","messageKey":"${rule.messageKey}","tag":${serializePrimitive(rule.tag)}}`;
    }
    visitRegexRule(rule) {
        const pattern = rule.pattern;
        return `{"$TYPE":"${RegexRule.$TYPE}","messageKey":"${rule.messageKey}","tag":${serializePrimitive(rule.tag)},"pattern":{"source":${serializePrimitive(pattern.source)},"flags":"${pattern.flags}"}}`;
    }
    visitLengthRule(rule) {
        return `{"$TYPE":"${LengthRule.$TYPE}","messageKey":"${rule.messageKey}","tag":${serializePrimitive(rule.tag)},"length":${serializePrimitive(rule.length)},"isMax":${serializePrimitive(rule.isMax)}}`;
    }
    visitSizeRule(rule) {
        return `{"$TYPE":"${SizeRule.$TYPE}","messageKey":"${rule.messageKey}","tag":${serializePrimitive(rule.tag)},"count":${serializePrimitive(rule.count)},"isMax":${serializePrimitive(rule.isMax)}}`;
    }
    visitRangeRule(rule) {
        return `{"$TYPE":"${RangeRule.$TYPE}","messageKey":"${rule.messageKey}","tag":${serializePrimitive(rule.tag)},"isInclusive":${rule.isInclusive},"min":${this.serializeNumber(rule.min)},"max":${this.serializeNumber(rule.max)}}`;
    }
    visitEqualsRule(rule) {
        const expectedValue = rule.expectedValue;
        let serializedExpectedValue;
        if (typeof expectedValue !== 'object' || expectedValue === null) {
            serializedExpectedValue = serializePrimitive(expectedValue);
        }
        else {
            serializedExpectedValue = JSON.stringify(expectedValue);
        }
        return `{"$TYPE":"${EqualsRule.$TYPE}","messageKey":"${rule.messageKey}","tag":${serializePrimitive(rule.tag)},"expectedValue":${serializedExpectedValue}}`;
    }
    visitRuleProperty(property) {
        const displayName = property.displayName;
        if (displayName !== void 0 && typeof displayName !== 'string') {
            throw new Error('Serializing a non-string displayName for rule property is not supported.'); // TODO: use reporter/logger
        }
        const expression = property.expression;
        return `{"$TYPE":"${RuleProperty.$TYPE}","name":${serializePrimitive(property.name)},"expression":${expression ? Serializer.serialize(expression) : null},"displayName":${serializePrimitive(displayName)}}`;
    }
    visitPropertyRule(propertyRule) {
        return `{"$TYPE":"${PropertyRule.$TYPE}","property":${propertyRule.property.accept(this)},"$rules":${this.serializeRules(propertyRule.$rules)}}`;
    }
    serializeNumber(num) {
        return num === Number.POSITIVE_INFINITY || num === Number.NEGATIVE_INFINITY ? null : num.toString();
    }
    serializeRules(ruleset) {
        return `[${ruleset.map((rules) => `[${rules.map((rule) => rule.accept(this)).join(',')}]`).join(',')}]`;
    }
}
let ValidationDeserializer = class ValidationDeserializer {
    constructor(locator, messageProvider, parser) {
        this.locator = locator;
        this.messageProvider = messageProvider;
        this.parser = parser;
        this.astDeserializer = new Deserializer();
    }
    static register(container) {
        this.container = container;
    }
    static deserialize(json, validationRules) {
        const messageProvider = this.container.get(IValidationMessageProvider);
        const parser = this.container.get(IExpressionParser);
        const deserializer = new ValidationDeserializer(this.container, messageProvider, parser);
        const raw = JSON.parse(json);
        return deserializer.hydrate(raw, validationRules);
    }
    hydrate(raw, validationRules) {
        var _a, _b;
        switch (raw.$TYPE) {
            case RequiredRule.$TYPE: {
                const $raw = raw;
                const rule = new RequiredRule();
                rule.messageKey = $raw.messageKey;
                rule.tag = this.astDeserializer.hydrate($raw.tag);
                return rule;
            }
            case RegexRule.$TYPE: {
                const $raw = raw;
                const pattern = $raw.pattern;
                const astDeserializer = this.astDeserializer;
                const rule = new RegexRule(new RegExp(astDeserializer.hydrate(pattern.source), pattern.flags), $raw.messageKey);
                rule.tag = astDeserializer.hydrate($raw.tag);
                return rule;
            }
            case LengthRule.$TYPE: {
                const $raw = raw;
                const rule = new LengthRule($raw.length, $raw.isMax);
                rule.messageKey = $raw.messageKey;
                rule.tag = this.astDeserializer.hydrate($raw.tag);
                return rule;
            }
            case SizeRule.$TYPE: {
                const $raw = raw;
                const rule = new SizeRule($raw.count, $raw.isMax);
                rule.messageKey = $raw.messageKey;
                rule.tag = this.astDeserializer.hydrate($raw.tag);
                return rule;
            }
            case RangeRule.$TYPE: {
                const $raw = raw;
                const rule = new RangeRule($raw.isInclusive, { min: (_a = $raw.min) !== null && _a !== void 0 ? _a : Number.NEGATIVE_INFINITY, max: (_b = $raw.max) !== null && _b !== void 0 ? _b : Number.POSITIVE_INFINITY });
                rule.messageKey = $raw.messageKey;
                rule.tag = this.astDeserializer.hydrate($raw.tag);
                return rule;
            }
            case EqualsRule.$TYPE: {
                const $raw = raw;
                const astDeserializer = this.astDeserializer;
                const rule = new EqualsRule(typeof $raw.expectedValue !== 'object' ? astDeserializer.hydrate($raw.expectedValue) : $raw.expectedValue);
                rule.messageKey = $raw.messageKey;
                rule.tag = astDeserializer.hydrate($raw.tag);
                return rule;
            }
            case RuleProperty.$TYPE: {
                const $raw = raw;
                const astDeserializer = this.astDeserializer;
                let name = $raw.name;
                name = name === 'undefined' ? void 0 : astDeserializer.hydrate(name);
                let expression = $raw.expression;
                if (expression !== null && expression !== void 0) {
                    expression = astDeserializer.hydrate(expression);
                }
                else if (name !== void 0) {
                    ([, expression] = parsePropertyName(name, this.parser));
                }
                else {
                    expression = void 0;
                }
                let displayName = $raw.displayName;
                displayName = displayName === 'undefined' ? void 0 : astDeserializer.hydrate(displayName);
                return new RuleProperty(expression, name, displayName);
            }
            case PropertyRule.$TYPE: {
                const $raw = raw;
                return new PropertyRule(this.locator, validationRules, this.messageProvider, this.hydrate($raw.property, validationRules), $raw.$rules.map((rules) => rules.map((rule) => this.hydrate(rule, validationRules))));
            }
        }
    }
    hydrateRuleset(ruleset, validationRules) {
        if (!Array.isArray(ruleset)) {
            throw new Error("The ruleset has to be an array of serialized property rule objects"); // TODO: use reporter
        }
        return ruleset.map(($rule) => this.hydrate($rule, validationRules));
    }
};
ValidationDeserializer = __decorate([
    __param(0, IServiceLocator),
    __param(1, IValidationMessageProvider),
    __param(2, IExpressionParser)
], ValidationDeserializer);
let ModelValidationExpressionHydrator = class ModelValidationExpressionHydrator {
    constructor(locator, messageProvider, parser) {
        this.locator = locator;
        this.messageProvider = messageProvider;
        this.parser = parser;
        this.astDeserializer = new Deserializer();
    }
    hydrate(_raw, _validationRules) {
        throw new Error('Method not implemented.');
    }
    hydrateRuleset(ruleset, validationRules) {
        const accRules = [];
        // depth first traversal
        const iterate = (entries, propertyPath = []) => {
            for (const [key, value] of entries) {
                if (this.isModelPropertyRule(value)) {
                    const rules = value.rules.map((rule) => Object.entries(rule).map(([ruleName, ruleConfig]) => this.hydrateRule(ruleName, ruleConfig)));
                    const propertyPrefix = propertyPath.join('.');
                    const property = this.hydrateRuleProperty({ name: propertyPrefix !== '' ? `${propertyPrefix}.${key}` : key, displayName: value.displayName });
                    accRules.push(new PropertyRule(this.locator, validationRules, this.messageProvider, property, rules));
                }
                else {
                    iterate(Object.entries(value), [...propertyPath, key]);
                }
            }
        };
        iterate(Object.entries(ruleset));
        return accRules;
    }
    hydrateRule(ruleName, ruleConfig) {
        switch (ruleName) {
            case 'required':
                return this.hydrateRequiredRule(ruleConfig);
            case 'regex':
                return this.hydrateRegexRule(ruleConfig);
            case 'maxLength':
                return this.hydrateLengthRule({ ...ruleConfig, isMax: true });
            case 'minLength':
                return this.hydrateLengthRule({ ...ruleConfig, isMax: false });
            case 'maxItems':
                return this.hydrateSizeRule({ ...ruleConfig, isMax: true });
            case 'minItems':
                return this.hydrateSizeRule({ ...ruleConfig, isMax: false });
            case 'range':
                return this.hydrateRangeRule({ ...ruleConfig, isInclusive: true });
            case 'between':
                return this.hydrateRangeRule({ ...ruleConfig, isInclusive: false });
            case 'equals':
                return this.hydrateEqualsRule(ruleConfig);
            default:
                throw new Error(`Unsupported rule ${ruleName}`);
        }
    }
    setCommonRuleProperties(raw, rule) {
        const messageKey = raw.messageKey;
        if (messageKey !== void 0 && messageKey !== null) {
            rule.messageKey = messageKey;
        }
        rule.tag = raw.tag;
        const when = raw.when;
        if (when) {
            if (typeof when === 'string') {
                const parsed = this.parser.parse(when, 0 /* None */);
                rule.canExecute = (object) => {
                    const flags = 0 /* none */; // TODO? need to get the flags propagated here?
                    return parsed.evaluate(flags, Scope.create({ $object: object }), this.locator, null);
                };
            }
            else if (typeof when === 'function') {
                rule.canExecute = when;
            }
        }
    }
    isModelPropertyRule(value) {
        return typeof value === 'object' && 'rules' in value;
    }
    hydrateRequiredRule(raw) {
        const rule = new RequiredRule();
        this.setCommonRuleProperties(raw, rule);
        return rule;
    }
    hydrateRegexRule(raw) {
        const pattern = raw.pattern;
        const rule = new RegexRule(new RegExp(pattern.source, pattern.flags), raw.messageKey);
        rule.tag = raw.tag;
        return rule;
    }
    hydrateLengthRule(raw) {
        const rule = new LengthRule(raw.length, raw.isMax);
        this.setCommonRuleProperties(raw, rule);
        return rule;
    }
    hydrateSizeRule(raw) {
        const rule = new SizeRule(raw.count, raw.isMax);
        this.setCommonRuleProperties(raw, rule);
        return rule;
    }
    hydrateRangeRule(raw) {
        const rule = new RangeRule(raw.isInclusive, { min: raw.min, max: raw.max });
        this.setCommonRuleProperties(raw, rule);
        return rule;
    }
    hydrateEqualsRule(raw) {
        const rule = new EqualsRule(raw.expectedValue);
        this.setCommonRuleProperties(raw, rule);
        return rule;
    }
    hydrateRuleProperty(raw) {
        const rawName = raw.name;
        if (!rawName || typeof rawName !== 'string') {
            throw new Error('The property name needs to be a non-empty string'); // TODO: use reporter
        }
        const [name, expression] = parsePropertyName(rawName, this.parser);
        return new RuleProperty(expression, name, raw.displayName);
    }
};
ModelValidationExpressionHydrator = __decorate([
    __param(0, IServiceLocator),
    __param(1, IValidationMessageProvider),
    __param(2, IExpressionParser)
], ModelValidationExpressionHydrator);

/**
 * IInstruction for the validation controller's validate method.
 */
class ValidateInstruction {
    /**
     * @param {TObject} [object=(void 0)!] - The object to validate.
     * @param {(keyof TObject | string)} [propertyName=(void 0)!] - The property name to validate.
     * @param {PropertyRule[]} [rules=(void 0)!] - The rules to validate.
     * @param {string} [objectTag=(void 0)!] - The tag indicating the ruleset defined for the object.
     * @param {string} [propertyTag=(void 0)!] - The tag indicating the ruleset for the property.
     * @param {LifecycleFlags} [flags=LifecycleFlags.none] - Use this to enable lifecycle flag sensitive expression evaluation.
     */
    constructor(object = (void 0), propertyName = (void 0), rules = (void 0), objectTag = (void 0), propertyTag = (void 0), flags = 0 /* none */) {
        this.object = object;
        this.propertyName = propertyName;
        this.rules = rules;
        this.objectTag = objectTag;
        this.propertyTag = propertyTag;
        this.flags = flags;
    }
}
const IValidator = DI.createInterface('IValidator');
/**
 * Standard implementation of `IValidator`.
 */
class StandardValidator {
    async validate(instruction) {
        var _a, _b, _c, _d;
        const object = instruction.object;
        const propertyName = instruction.propertyName;
        const propertyTag = instruction.propertyTag;
        const flags = instruction.flags;
        const rules = (_b = (_a = instruction.rules) !== null && _a !== void 0 ? _a : validationRulesRegistrar.get(object, instruction.objectTag)) !== null && _b !== void 0 ? _b : [];
        const scope = Scope.create({ [rootObjectSymbol]: object });
        if (propertyName !== void 0) {
            return (_d = (await ((_c = rules.find((r) => r.property.name === propertyName)) === null || _c === void 0 ? void 0 : _c.validate(object, propertyTag, flags, scope)))) !== null && _d !== void 0 ? _d : [];
        }
        return (await Promise.all(rules.map(async (rule) => rule.validate(object, propertyTag, flags, scope)))).flat();
    }
}

function getDefaultValidationConfiguration() {
    return {
        ValidatorType: StandardValidator,
        MessageProviderType: ValidationMessageProvider,
        CustomMessages: [],
        HydratorType: ModelValidationExpressionHydrator,
    };
}
function createConfiguration(optionsProvider) {
    return {
        optionsProvider,
        register(container) {
            const options = getDefaultValidationConfiguration();
            optionsProvider(options);
            container.register(Registration.instance(ICustomMessages, options.CustomMessages), Registration.singleton(IValidator, options.ValidatorType), Registration.singleton(IValidationMessageProvider, options.MessageProviderType), Registration.singleton(IValidationExpressionHydrator, options.HydratorType), Registration.transient(IValidationRules, ValidationRules), ValidationDeserializer);
            return container;
        },
        customize(cb) {
            return createConfiguration(cb !== null && cb !== void 0 ? cb : optionsProvider);
        },
    };
}
const ValidationConfiguration = createConfiguration(noop);

export { BaseValidationRule, Deserializer, EqualsRule, ICustomMessages, IValidationExpressionHydrator, IValidationMessageProvider, IValidationRules, IValidator, LengthRule, ModelBasedRule, ModelValidationExpressionHydrator, PropertyRule, RangeRule, RegexRule, RequiredRule, RuleProperty, Serializer, SizeRule, StandardValidator, ValidateInstruction, ValidationConfiguration, ValidationDeserializer, ValidationMessageProvider, ValidationResult, ValidationRuleAliasMessage, ValidationRules, ValidationSerializer, deserializePrimitive, getDefaultValidationConfiguration, parsePropertyName, rootObjectSymbol, serializePrimitive, serializePrimitives, validationRule, validationRulesRegistrar };
//# sourceMappingURL=index.dev.js.map
