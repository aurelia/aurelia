'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var kernel = require('@aurelia/kernel');
var metadata = require('@aurelia/metadata');
var AST = require('@aurelia/runtime');
var runtimeHtml = require('@aurelia/runtime-html');

function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
        for (var k in e) {
            n[k] = e[k];
        }
    }
    n["default"] = e;
    return Object.freeze(n);
}

var AST__namespace = /*#__PURE__*/_interopNamespace(AST);

const IValidationExpressionHydrator = kernel.DI.createInterface('IValidationExpressionHydrator');

/******************************************************************************
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

const IValidationMessageProvider = kernel.DI.createInterface('IValidationMessageProvider');
const ValidationRuleAliasMessage = Object.freeze({
    aliasKey: kernel.Protocol.annotation.keyFor('validation-rule-alias-message'),
    define(target, definition) {
        ValidationRuleAliasMessage.setDefaultMessage(target, definition);
        return target;
    },
    setDefaultMessage(rule, { aliases }, append = true) {
        const defaultMessages = append ? metadata.Metadata.getOwn(this.aliasKey, rule.prototype) : void 0;
        if (defaultMessages !== void 0) {
            const allMessages = {
                ...Object.fromEntries(defaultMessages.map(({ name, defaultMessage }) => [name, defaultMessage])),
                ...Object.fromEntries(aliases.map(({ name, defaultMessage }) => [name, defaultMessage])),
            };
            aliases = kernel.toArray(Object.entries(allMessages)).map(([name, defaultMessage]) => ({ name, defaultMessage }));
        }
        metadata.Metadata.define(ValidationRuleAliasMessage.aliasKey, aliases, rule instanceof Function ? rule.prototype : rule);
    },
    getDefaultMessages(rule) {
        return metadata.Metadata.get(this.aliasKey, rule instanceof Function ? rule.prototype : rule);
    }
});
function validationRule(definition) {
    return function (target) {
        return ValidationRuleAliasMessage.define(target, definition);
    };
}
exports.BaseValidationRule = class BaseValidationRule {
    constructor(messageKey = (void 0)) {
        this.messageKey = messageKey;
        this.tag = (void 0);
    }
    canExecute(_object) { return true; }
    execute(_value, _object) {
        throw new Error('No base implementation of execute. Did you forget to implement the execute method?');
    }
    accept(_visitor) {
        throw new Error('No base implementation of accept. Did you forget to implement the accept method?');
    }
};
exports.BaseValidationRule.$TYPE = '';
exports.BaseValidationRule = __decorate([
    validationRule({ aliases: [{ name: (void 0), defaultMessage: `\${$displayName} is invalid.` }] })
], exports.BaseValidationRule);
exports.RequiredRule = class RequiredRule extends exports.BaseValidationRule {
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
exports.RequiredRule.$TYPE = 'RequiredRule';
exports.RequiredRule = __decorate([
    validationRule({ aliases: [{ name: 'required', defaultMessage: `\${$displayName} is required.` }] })
], exports.RequiredRule);
exports.RegexRule = class RegexRule extends exports.BaseValidationRule {
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
exports.RegexRule.$TYPE = 'RegexRule';
exports.RegexRule = __decorate([
    validationRule({
        aliases: [
            { name: 'matches', defaultMessage: `\${$displayName} is not correctly formatted.` },
            { name: 'email', defaultMessage: `\${$displayName} is not a valid email.` },
        ]
    })
], exports.RegexRule);
exports.LengthRule = class LengthRule extends exports.BaseValidationRule {
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
exports.LengthRule.$TYPE = 'LengthRule';
exports.LengthRule = __decorate([
    validationRule({
        aliases: [
            { name: 'minLength', defaultMessage: `\${$displayName} must be at least \${$rule.length} character\${$rule.length === 1 ? '' : 's'}.` },
            { name: 'maxLength', defaultMessage: `\${$displayName} cannot be longer than \${$rule.length} character\${$rule.length === 1 ? '' : 's'}.` },
        ]
    })
], exports.LengthRule);
exports.SizeRule = class SizeRule extends exports.BaseValidationRule {
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
exports.SizeRule.$TYPE = 'SizeRule';
exports.SizeRule = __decorate([
    validationRule({
        aliases: [
            { name: 'minItems', defaultMessage: `\${$displayName} must contain at least \${$rule.count} item\${$rule.count === 1 ? '' : 's'}.` },
            { name: 'maxItems', defaultMessage: `\${$displayName} cannot contain more than \${$rule.count} item\${$rule.count === 1 ? '' : 's'}.` },
        ]
    })
], exports.SizeRule);
exports.RangeRule = class RangeRule extends exports.BaseValidationRule {
    constructor(isInclusive, { min, max }) {
        super(min !== void 0 && max !== void 0
            ? (isInclusive ? 'range' : 'between')
            : (min !== void 0 ? 'min' : 'max'));
        this.isInclusive = isInclusive;
        this.min = Number.NEGATIVE_INFINITY;
        this.max = Number.POSITIVE_INFINITY;
        this.min = min ?? this.min;
        this.max = max ?? this.max;
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
exports.RangeRule.$TYPE = 'RangeRule';
exports.RangeRule = __decorate([
    validationRule({
        aliases: [
            { name: 'min', defaultMessage: `\${$displayName} must be at least \${$rule.min}.` },
            { name: 'max', defaultMessage: `\${$displayName} must be at most \${$rule.max}.` },
            { name: 'range', defaultMessage: `\${$displayName} must be between or equal to \${$rule.min} and \${$rule.max}.` },
            { name: 'between', defaultMessage: `\${$displayName} must be between but not equal to \${$rule.min} and \${$rule.max}.` },
        ]
    })
], exports.RangeRule);
exports.EqualsRule = class EqualsRule extends exports.BaseValidationRule {
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
exports.EqualsRule.$TYPE = 'EqualsRule';
exports.EqualsRule = __decorate([
    validationRule({
        aliases: [
            { name: 'equals', defaultMessage: `\${$displayName} must be \${$rule.expectedValue}.` },
        ]
    })
], exports.EqualsRule);

const ICustomMessages = kernel.DI.createInterface('ICustomMessages');
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
        const key = `${validationRulesRegistrar.name}:${tag ?? validationRulesRegistrar.defaultRuleSetName}`;
        metadata.Metadata.define(kernel.Protocol.annotation.keyFor(key), rules, target);
        const keys = metadata.Metadata.getOwn(kernel.Protocol.annotation.name, target);
        if (keys === void 0) {
            metadata.Metadata.define(kernel.Protocol.annotation.name, [key], target);
        }
        else {
            keys.push(key);
        }
    },
    get(target, tag) {
        const key = kernel.Protocol.annotation.keyFor(validationRulesRegistrar.name, tag ?? validationRulesRegistrar.defaultRuleSetName);
        return metadata.Metadata.get(key, target) ?? metadata.Metadata.getOwn(key, target.constructor);
    },
    unset(target, tag) {
        const keys = metadata.Metadata.getOwn(kernel.Protocol.annotation.name, target);
        for (const key of keys.slice(0)) {
            if (key.startsWith(validationRulesRegistrar.name) && (tag === void 0 || key.endsWith(tag))) {
                metadata.Metadata.delete(kernel.Protocol.annotation.keyFor(key), target);
                const index = keys.indexOf(key);
                if (index > -1) {
                    keys.splice(index, 1);
                }
            }
        }
    },
    isValidationRulesSet(target) {
        const keys = metadata.Metadata.getOwn(kernel.Protocol.annotation.name, target);
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
        this.validationRules = validationRules;
        this.messageProvider = messageProvider;
        this.property = property;
        this.$rules = $rules;
        this.l = locator;
    }
    accept(visitor) {
        return visitor.visitPropertyRule(this);
    }
    addRule(rule) {
        const rules = this.getLeafRules();
        rules.push(this.latestRule = rule);
        return this;
    }
    getLeafRules() {
        const depth = this.$rules.length - 1;
        return this.$rules[depth];
    }
    async validate(object, tag, _flags, scope) {
        if (scope === void 0) {
            scope = AST.Scope.create({ [rootObjectSymbol]: object });
        }
        const expression = this.property.expression;
        let value;
        if (expression === void 0) {
            value = object;
        }
        else {
            value = AST.astEvaluate(expression, scope, this, null);
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
                    const messageEvaluationScope = AST.Scope.create(new ValidationMessageEvaluationContext(this.messageProvider, this.messageProvider.getDisplayName(name, displayName), name, value, rule, object));
                    message = AST.astEvaluate(this.messageProvider.getMessage(rule), messageEvaluationScope, this, null);
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
    then() {
        this.$rules.push([]);
        return this;
    }
    withMessageKey(key) {
        this.assertLatestRule(this.latestRule);
        this.latestRule.messageKey = key;
        return this;
    }
    withMessage(message) {
        const rule = this.latestRule;
        this.assertLatestRule(rule);
        this.messageProvider.setMessage(rule, message);
        return this;
    }
    when(condition) {
        this.assertLatestRule(this.latestRule);
        this.latestRule.canExecute = condition;
        return this;
    }
    tag(tag) {
        this.assertLatestRule(this.latestRule);
        this.latestRule.tag = tag;
        return this;
    }
    assertLatestRule(latestRule) {
        if (latestRule === void 0) {
            throw new Error('No rule has been added');
        }
    }
    displayName(name) {
        this.property.displayName = name;
        return this;
    }
    satisfies(condition) {
        const rule = new (class extends exports.BaseValidationRule {
            constructor() {
                super(...arguments);
                this.execute = condition;
            }
        })();
        return this.addRule(rule);
    }
    satisfiesRule(validationRule) {
        return this.addRule(validationRule);
    }
    required() {
        return this.addRule(new exports.RequiredRule());
    }
    matches(regex) {
        return this.addRule(new exports.RegexRule(regex));
    }
    email() {
        const emailPattern = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return this.addRule(new exports.RegexRule(emailPattern, 'email'));
    }
    minLength(length) {
        return this.addRule(new exports.LengthRule(length, false));
    }
    maxLength(length) {
        return this.addRule(new exports.LengthRule(length, true));
    }
    minItems(count) {
        return this.addRule(new exports.SizeRule(count, false));
    }
    maxItems(count) {
        return this.addRule(new exports.SizeRule(count, true));
    }
    min(constraint) {
        return this.addRule(new exports.RangeRule(true, { min: constraint }));
    }
    max(constraint) {
        return this.addRule(new exports.RangeRule(true, { max: constraint }));
    }
    range(min, max) {
        return this.addRule(new exports.RangeRule(true, { min, max }));
    }
    between(min, max) {
        return this.addRule(new exports.RangeRule(false, { min, max }));
    }
    equals(expectedValue) {
        return this.addRule(new exports.EqualsRule(expectedValue));
    }
    ensure(property) {
        this.latestRule = void 0;
        return this.validationRules.ensure(property);
    }
    ensureObject() {
        this.latestRule = void 0;
        return this.validationRules.ensureObject();
    }
    get rules() {
        return this.validationRules.rules;
    }
    on(target, tag) {
        return this.validationRules.on(target, tag);
    }
}
PropertyRule.$TYPE = 'PropertyRule';
runtimeHtml.mixinAstEvaluator()(PropertyRule);
class ModelBasedRule {
    constructor(ruleset, tag = validationRulesRegistrar.defaultRuleSetName) {
        this.ruleset = ruleset;
        this.tag = tag;
    }
}
const IValidationRules = kernel.DI.createInterface('IValidationRules');
exports.ValidationRules = class ValidationRules {
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
        this.rules = rules ?? [];
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
                console.warn(`A ruleset for tag ${tag} is already defined which will be overwritten`);
            }
            const ruleset = this.deserializer.hydrateRuleset(rule.ruleset, this);
            validationRulesRegistrar.set(target, ruleset, tag);
            tags.add(tag);
        }
    }
};
exports.ValidationRules = __decorate([
    __param(0, kernel.IServiceLocator),
    __param(1, AST.IExpressionParser),
    __param(2, IValidationMessageProvider),
    __param(3, IValidationExpressionHydrator)
], exports.ValidationRules);
const classicAccessorPattern = /^function\s*\([$_\w\d]+\)\s*\{(?:\s*["']{1}use strict["']{1};)?(?:[$_\s\w\d\/\*.['"\]+;]+)?\s*return\s+[$_\w\d]+((\.[$_\w\d]+|\[['"$_\w\d]+\])+)\s*;?\s*\}$/;
const arrowAccessorPattern = /^\(?[$_\w\d]+\)?\s*=>\s*[$_\w\d]+((\.[$_\w\d]+|\[['"$_\w\d]+\])+)$/;
const rootObjectSymbol = '$root';
function parsePropertyName(property, parser) {
    switch (typeof property) {
        case 'string':
            break;
        case 'function': {
            const fn = property.toString();
            const match = arrowAccessorPattern.exec(fn) ?? classicAccessorPattern.exec(fn);
            if (match === null) {
                throw new Error(`Unable to parse accessor function:\n${fn}`);
            }
            property = match[1].substring(1);
            break;
        }
        default:
            throw new Error(`Unable to parse accessor function:\n${property}`);
    }
    return [property, parser.parse(`${rootObjectSymbol}.${property}`, 16)];
}
class ValidationResult {
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
exports.ValidationMessageProvider = class ValidationMessageProvider {
    constructor(parser, logger, customMessages) {
        this.parser = parser;
        this.registeredMessages = new WeakMap();
        this.logger = logger.scopeTo(ValidationMessageProvider.name);
        for (const { rule, aliases } of customMessages) {
            ValidationRuleAliasMessage.setDefaultMessage(rule, { aliases });
        }
    }
    getMessage(rule) {
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
            message = validationMessages.find(m => m.name === messageKey)?.defaultMessage;
        }
        if (!message) {
            message = ValidationRuleAliasMessage.getDefaultMessages(exports.BaseValidationRule)[0].defaultMessage;
        }
        return this.setMessage(rule, message);
    }
    setMessage(rule, message) {
        const parsedMessage = this.parseMessage(message);
        this.registeredMessages.set(rule, parsedMessage);
        return parsedMessage;
    }
    parseMessage(message) {
        const parsed = this.parser.parse(message, 1);
        if (parsed?.$kind === 23) {
            for (const expr of parsed.expressions) {
                const name = expr.name;
                if (contextualProperties.has(name)) {
                    this.logger.warn(`Did you mean to use "$${name}" instead of "${name}" in this validation message template: "${message}"?`);
                }
                if (expr.$kind === 0 || expr.ancestor > 0) {
                    throw new Error('$parent is not permitted in validation message expressions.');
                }
            }
            return parsed;
        }
        return new AST.PrimitiveLiteralExpression(message);
    }
    getDisplayName(propertyName, displayName) {
        if (displayName !== null && displayName !== undefined) {
            return (displayName instanceof Function) ? displayName() : displayName;
        }
        if (propertyName === void 0) {
            return;
        }
        const words = propertyName.toString().split(/(?=[A-Z])/).join(' ');
        return words.charAt(0).toUpperCase() + words.slice(1);
    }
};
exports.ValidationMessageProvider = __decorate([
    __param(0, AST.IExpressionParser),
    __param(1, kernel.ILogger),
    __param(2, ICustomMessages)
], exports.ValidationMessageProvider);

const astVisit = AST__namespace.astVisit;
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
    ASTExpressionTypes["DestructuringAssignment"] = "DestructuringAssignment";
    ASTExpressionTypes["DestructuringSingleAssignment"] = "DestructuringSingleAssignment";
    ASTExpressionTypes["DestructuringRestAssignment"] = "DestructuringRestAssignment";
    ASTExpressionTypes["ArrowFunction"] = "ArrowFunction";
    ASTExpressionTypes["Custom"] = "Custom";
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
                return new AST__namespace.AccessMemberExpression(this.hydrate(expr.object), expr.name);
            }
            case ASTExpressionTypes.AccessKeyedExpression: {
                const expr = raw;
                return new AST__namespace.AccessKeyedExpression(this.hydrate(expr.object), this.hydrate(expr.key));
            }
            case ASTExpressionTypes.AccessThisExpression: {
                const expr = raw;
                return new AST__namespace.AccessThisExpression(expr.ancestor);
            }
            case ASTExpressionTypes.AccessScopeExpression: {
                const expr = raw;
                return new AST__namespace.AccessScopeExpression(expr.name, expr.ancestor);
            }
            case ASTExpressionTypes.ArrayLiteralExpression: {
                const expr = raw;
                return new AST__namespace.ArrayLiteralExpression(this.hydrate(expr.elements));
            }
            case ASTExpressionTypes.ObjectLiteralExpression: {
                const expr = raw;
                return new AST__namespace.ObjectLiteralExpression(this.hydrate(expr.keys), this.hydrate(expr.values));
            }
            case ASTExpressionTypes.PrimitiveLiteralExpression: {
                const expr = raw;
                return new AST__namespace.PrimitiveLiteralExpression(this.hydrate(expr.value));
            }
            case ASTExpressionTypes.CallFunctionExpression: {
                const expr = raw;
                return new AST__namespace.CallFunctionExpression(this.hydrate(expr.func), this.hydrate(expr.args));
            }
            case ASTExpressionTypes.CallMemberExpression: {
                const expr = raw;
                return new AST__namespace.CallMemberExpression(this.hydrate(expr.object), expr.name, this.hydrate(expr.args));
            }
            case ASTExpressionTypes.CallScopeExpression: {
                const expr = raw;
                return new AST__namespace.CallScopeExpression(expr.name, this.hydrate(expr.args), expr.ancestor);
            }
            case ASTExpressionTypes.TemplateExpression: {
                const expr = raw;
                return new AST__namespace.TemplateExpression(this.hydrate(expr.cooked), this.hydrate(expr.expressions));
            }
            case ASTExpressionTypes.TaggedTemplateExpression: {
                const expr = raw;
                return new AST__namespace.TaggedTemplateExpression(this.hydrate(expr.cooked), this.hydrate(expr.raw), this.hydrate(expr.func), this.hydrate(expr.expressions));
            }
            case ASTExpressionTypes.UnaryExpression: {
                const expr = raw;
                return new AST__namespace.UnaryExpression(expr.operation, this.hydrate(expr.expression));
            }
            case ASTExpressionTypes.BinaryExpression: {
                const expr = raw;
                return new AST__namespace.BinaryExpression(expr.operation, this.hydrate(expr.left), this.hydrate(expr.right));
            }
            case ASTExpressionTypes.ConditionalExpression: {
                const expr = raw;
                return new AST__namespace.ConditionalExpression(this.hydrate(expr.condition), this.hydrate(expr.yes), this.hydrate(expr.no));
            }
            case ASTExpressionTypes.AssignExpression: {
                const expr = raw;
                return new AST__namespace.AssignExpression(this.hydrate(expr.target), this.hydrate(expr.value));
            }
            case ASTExpressionTypes.ValueConverterExpression: {
                const expr = raw;
                return new AST__namespace.ValueConverterExpression(this.hydrate(expr.expression), expr.name, this.hydrate(expr.args));
            }
            case ASTExpressionTypes.BindingBehaviorExpression: {
                const expr = raw;
                return new AST__namespace.BindingBehaviorExpression(this.hydrate(expr.expression), expr.name, this.hydrate(expr.args));
            }
            case ASTExpressionTypes.ArrayBindingPattern: {
                const expr = raw;
                return new AST__namespace.ArrayBindingPattern(this.hydrate(expr.elements));
            }
            case ASTExpressionTypes.ObjectBindingPattern: {
                const expr = raw;
                return new AST__namespace.ObjectBindingPattern(this.hydrate(expr.keys), this.hydrate(expr.values));
            }
            case ASTExpressionTypes.BindingIdentifier: {
                const expr = raw;
                return new AST__namespace.BindingIdentifier(expr.name);
            }
            case ASTExpressionTypes.ForOfStatement: {
                const expr = raw;
                return new AST__namespace.ForOfStatement(this.hydrate(expr.declaration), this.hydrate(expr.iterable), this.hydrate(expr.semiIdx));
            }
            case ASTExpressionTypes.Interpolation: {
                const expr = raw;
                return new AST__namespace.Interpolation(this.hydrate(expr.cooked), this.hydrate(expr.expressions));
            }
            case ASTExpressionTypes.DestructuringAssignment: {
                return new AST__namespace.DestructuringAssignmentExpression(this.hydrate(raw.$kind), this.hydrate(raw.list), this.hydrate(raw.source), this.hydrate(raw.initializer));
            }
            case ASTExpressionTypes.DestructuringSingleAssignment: {
                return new AST__namespace.DestructuringAssignmentSingleExpression(this.hydrate(raw.target), this.hydrate(raw.source), this.hydrate(raw.initializer));
            }
            case ASTExpressionTypes.DestructuringRestAssignment: {
                return new AST__namespace.DestructuringAssignmentRestExpression(this.hydrate(raw.target), this.hydrate(raw.indexOrProperties));
            }
            case ASTExpressionTypes.ArrowFunction: {
                return new AST__namespace.ArrowFunction(this.hydrate(raw.parameters), this.hydrate(raw.body), this.hydrate(raw.rest));
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
                throw new Error(`unable to deserialize the expression: ${raw}`);
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
        if (expr == null) {
            return `${expr}`;
        }
        return astVisit(expr, visitor);
    }
    visitAccessMember(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.AccessMemberExpression}","name":"${expr.name}","object":${astVisit(expr.object, this)}}`;
    }
    visitAccessKeyed(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.AccessKeyedExpression}","object":${astVisit(expr.object, this)},"key":${astVisit(expr.key, this)}}`;
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
        return `{"$TYPE":"${ASTExpressionTypes.CallFunctionExpression}","func":${astVisit(expr.func, this)},"args":${this.serializeExpressions(expr.args)}}`;
    }
    visitCallMember(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.CallMemberExpression}","name":"${expr.name}","object":${astVisit(expr.object, this)},"args":${this.serializeExpressions(expr.args)}}`;
    }
    visitCallScope(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.CallScopeExpression}","name":"${expr.name}","ancestor":${expr.ancestor},"args":${this.serializeExpressions(expr.args)}}`;
    }
    visitTemplate(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.TemplateExpression}","cooked":${serializePrimitives(expr.cooked)},"expressions":${this.serializeExpressions(expr.expressions)}}`;
    }
    visitTaggedTemplate(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.TaggedTemplateExpression}","cooked":${serializePrimitives(expr.cooked)},"raw":${serializePrimitives(expr.cooked.raw)},"func":${astVisit(expr.func, this)},"expressions":${this.serializeExpressions(expr.expressions)}}`;
    }
    visitUnary(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.UnaryExpression}","operation":"${expr.operation}","expression":${astVisit(expr.expression, this)}}`;
    }
    visitBinary(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.BinaryExpression}","operation":"${expr.operation}","left":${astVisit(expr.left, this)},"right":${astVisit(expr.right, this)}}`;
    }
    visitConditional(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.ConditionalExpression}","condition":${astVisit(expr.condition, this)},"yes":${astVisit(expr.yes, this)},"no":${astVisit(expr.no, this)}}`;
    }
    visitAssign(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.AssignExpression}","target":${astVisit(expr.target, this)},"value":${astVisit(expr.value, this)}}`;
    }
    visitValueConverter(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.ValueConverterExpression}","name":"${expr.name}","expression":${astVisit(expr.expression, this)},"args":${this.serializeExpressions(expr.args)}}`;
    }
    visitBindingBehavior(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.BindingBehaviorExpression}","name":"${expr.name}","expression":${astVisit(expr.expression, this)},"args":${this.serializeExpressions(expr.args)}}`;
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
    visitForOfStatement(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.ForOfStatement}","declaration":${astVisit(expr.declaration, this)},"iterable":${astVisit(expr.iterable, this)},"semiIdx":${serializePrimitive(expr.semiIdx)}}`;
    }
    visitInterpolation(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.Interpolation}","cooked":${serializePrimitives(expr.parts)},"expressions":${this.serializeExpressions(expr.expressions)}}`;
    }
    visitDestructuringAssignmentExpression(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.DestructuringAssignment}","$kind":${serializePrimitive(expr.$kind)},"list":${this.serializeExpressions(expr.list)},"source":${expr.source === void 0 ? serializePrimitive(expr.source) : astVisit(expr.source, this)},"initializer":${expr.initializer === void 0 ? serializePrimitive(expr.initializer) : astVisit(expr.initializer, this)}}`;
    }
    visitDestructuringAssignmentSingleExpression(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.DestructuringSingleAssignment}","source":${astVisit(expr.source, this)},"target":${astVisit(expr.target, this)},"initializer":${expr.initializer === void 0 ? serializePrimitive(expr.initializer) : astVisit(expr.initializer, this)}}`;
    }
    visitDestructuringAssignmentRestExpression(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.DestructuringRestAssignment}","target":${astVisit(expr.target, this)},"indexOrProperties":${Array.isArray(expr.indexOrProperties) ? serializePrimitives(expr.indexOrProperties) : serializePrimitive(expr.indexOrProperties)}}`;
    }
    visitArrowFunction(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.ArrowFunction}","parameters":${this.serializeExpressions(expr.args)},"body":${astVisit(expr.body, this)},"rest":${serializePrimitive(expr.rest)}}`;
    }
    visitCustom(expr) {
        return `{"$TYPE":"${ASTExpressionTypes.Custom}","body":${expr.value}}`;
    }
    serializeExpressions(args) {
        let text = '[';
        for (let i = 0, ii = args.length; i < ii; ++i) {
            if (i !== 0) {
                text += ',';
            }
            text += astVisit(args[i], this);
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
        return `{"$TYPE":"${exports.RequiredRule.$TYPE}","messageKey":"${rule.messageKey}","tag":${serializePrimitive(rule.tag)}}`;
    }
    visitRegexRule(rule) {
        const pattern = rule.pattern;
        return `{"$TYPE":"${exports.RegexRule.$TYPE}","messageKey":"${rule.messageKey}","tag":${serializePrimitive(rule.tag)},"pattern":{"source":${serializePrimitive(pattern.source)},"flags":"${pattern.flags}"}}`;
    }
    visitLengthRule(rule) {
        return `{"$TYPE":"${exports.LengthRule.$TYPE}","messageKey":"${rule.messageKey}","tag":${serializePrimitive(rule.tag)},"length":${serializePrimitive(rule.length)},"isMax":${serializePrimitive(rule.isMax)}}`;
    }
    visitSizeRule(rule) {
        return `{"$TYPE":"${exports.SizeRule.$TYPE}","messageKey":"${rule.messageKey}","tag":${serializePrimitive(rule.tag)},"count":${serializePrimitive(rule.count)},"isMax":${serializePrimitive(rule.isMax)}}`;
    }
    visitRangeRule(rule) {
        return `{"$TYPE":"${exports.RangeRule.$TYPE}","messageKey":"${rule.messageKey}","tag":${serializePrimitive(rule.tag)},"isInclusive":${rule.isInclusive},"min":${this.serializeNumber(rule.min)},"max":${this.serializeNumber(rule.max)}}`;
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
        return `{"$TYPE":"${exports.EqualsRule.$TYPE}","messageKey":"${rule.messageKey}","tag":${serializePrimitive(rule.tag)},"expectedValue":${serializedExpectedValue}}`;
    }
    visitRuleProperty(property) {
        const displayName = property.displayName;
        if (displayName !== void 0 && typeof displayName !== 'string') {
            throw new Error('Serializing a non-string displayName for rule property is not supported.');
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
exports.ValidationDeserializer = class ValidationDeserializer {
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
        const parser = this.container.get(AST.IExpressionParser);
        const deserializer = new ValidationDeserializer(this.container, messageProvider, parser);
        const raw = JSON.parse(json);
        return deserializer.hydrate(raw, validationRules);
    }
    hydrate(raw, validationRules) {
        switch (raw.$TYPE) {
            case exports.RequiredRule.$TYPE: {
                const $raw = raw;
                const rule = new exports.RequiredRule();
                rule.messageKey = $raw.messageKey;
                rule.tag = this.astDeserializer.hydrate($raw.tag);
                return rule;
            }
            case exports.RegexRule.$TYPE: {
                const $raw = raw;
                const pattern = $raw.pattern;
                const astDeserializer = this.astDeserializer;
                const rule = new exports.RegexRule(new RegExp(astDeserializer.hydrate(pattern.source), pattern.flags), $raw.messageKey);
                rule.tag = astDeserializer.hydrate($raw.tag);
                return rule;
            }
            case exports.LengthRule.$TYPE: {
                const $raw = raw;
                const rule = new exports.LengthRule($raw.length, $raw.isMax);
                rule.messageKey = $raw.messageKey;
                rule.tag = this.astDeserializer.hydrate($raw.tag);
                return rule;
            }
            case exports.SizeRule.$TYPE: {
                const $raw = raw;
                const rule = new exports.SizeRule($raw.count, $raw.isMax);
                rule.messageKey = $raw.messageKey;
                rule.tag = this.astDeserializer.hydrate($raw.tag);
                return rule;
            }
            case exports.RangeRule.$TYPE: {
                const $raw = raw;
                const rule = new exports.RangeRule($raw.isInclusive, { min: $raw.min ?? Number.NEGATIVE_INFINITY, max: $raw.max ?? Number.POSITIVE_INFINITY });
                rule.messageKey = $raw.messageKey;
                rule.tag = this.astDeserializer.hydrate($raw.tag);
                return rule;
            }
            case exports.EqualsRule.$TYPE: {
                const $raw = raw;
                const astDeserializer = this.astDeserializer;
                const rule = new exports.EqualsRule(typeof $raw.expectedValue !== 'object' ? astDeserializer.hydrate($raw.expectedValue) : $raw.expectedValue);
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
            throw new Error("The ruleset has to be an array of serialized property rule objects");
        }
        return ruleset.map(($rule) => this.hydrate($rule, validationRules));
    }
};
exports.ValidationDeserializer = __decorate([
    __param(0, kernel.IServiceLocator),
    __param(1, IValidationMessageProvider),
    __param(2, AST.IExpressionParser)
], exports.ValidationDeserializer);
exports.ModelValidationExpressionHydrator = class ModelValidationExpressionHydrator {
    constructor(l, messageProvider, parser) {
        this.l = l;
        this.messageProvider = messageProvider;
        this.parser = parser;
        this.astDeserializer = new Deserializer();
    }
    hydrate(_raw, _validationRules) {
        throw new Error('Method not implemented.');
    }
    hydrateRuleset(ruleset, validationRules) {
        const accRules = [];
        const iterate = (entries, propertyPath = []) => {
            for (const [key, value] of entries) {
                if (this.isModelPropertyRule(value)) {
                    const rules = value.rules.map((rule) => Object.entries(rule).map(([ruleName, ruleConfig]) => this.hydrateRule(ruleName, ruleConfig)));
                    const propertyPrefix = propertyPath.join('.');
                    const property = this.hydrateRuleProperty({ name: propertyPrefix !== '' ? `${propertyPrefix}.${key}` : key, displayName: value.displayName });
                    accRules.push(new PropertyRule(this.l, validationRules, this.messageProvider, property, rules));
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
                const parsed = this.parser.parse(when, 0);
                rule.canExecute = (object) => {
                    return AST.astEvaluate(parsed, AST.Scope.create({ $object: object }), this, null);
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
        const rule = new exports.RequiredRule();
        this.setCommonRuleProperties(raw, rule);
        return rule;
    }
    hydrateRegexRule(raw) {
        const pattern = raw.pattern;
        const rule = new exports.RegexRule(new RegExp(pattern.source, pattern.flags), raw.messageKey);
        rule.tag = raw.tag;
        return rule;
    }
    hydrateLengthRule(raw) {
        const rule = new exports.LengthRule(raw.length, raw.isMax);
        this.setCommonRuleProperties(raw, rule);
        return rule;
    }
    hydrateSizeRule(raw) {
        const rule = new exports.SizeRule(raw.count, raw.isMax);
        this.setCommonRuleProperties(raw, rule);
        return rule;
    }
    hydrateRangeRule(raw) {
        const rule = new exports.RangeRule(raw.isInclusive, { min: raw.min, max: raw.max });
        this.setCommonRuleProperties(raw, rule);
        return rule;
    }
    hydrateEqualsRule(raw) {
        const rule = new exports.EqualsRule(raw.expectedValue);
        this.setCommonRuleProperties(raw, rule);
        return rule;
    }
    hydrateRuleProperty(raw) {
        const rawName = raw.name;
        if (!rawName || typeof rawName !== 'string') {
            throw new Error('The property name needs to be a non-empty string');
        }
        const [name, expression] = parsePropertyName(rawName, this.parser);
        return new RuleProperty(expression, name, raw.displayName);
    }
};
exports.ModelValidationExpressionHydrator = __decorate([
    __param(0, kernel.IServiceLocator),
    __param(1, IValidationMessageProvider),
    __param(2, AST.IExpressionParser)
], exports.ModelValidationExpressionHydrator);
runtimeHtml.mixinAstEvaluator()(exports.ModelValidationExpressionHydrator);

class ValidateInstruction {
    constructor(object = (void 0), propertyName = (void 0), rules = (void 0), objectTag = (void 0), propertyTag = (void 0), flags = 0) {
        this.object = object;
        this.propertyName = propertyName;
        this.rules = rules;
        this.objectTag = objectTag;
        this.propertyTag = propertyTag;
        this.flags = flags;
    }
}
const IValidator = kernel.DI.createInterface('IValidator');
class StandardValidator {
    async validate(instruction) {
        const object = instruction.object;
        const propertyName = instruction.propertyName;
        const propertyTag = instruction.propertyTag;
        const flags = instruction.flags;
        const rules = instruction.rules ?? validationRulesRegistrar.get(object, instruction.objectTag) ?? [];
        const scope = AST.Scope.create({ [rootObjectSymbol]: object });
        if (propertyName !== void 0) {
            return (await rules.find((r) => r.property.name === propertyName)?.validate(object, propertyTag, flags, scope)) ?? [];
        }
        return (await Promise.all(rules.map(async (rule) => rule.validate(object, propertyTag, flags, scope)))).flat();
    }
}

function getDefaultValidationConfiguration() {
    return {
        ValidatorType: StandardValidator,
        MessageProviderType: exports.ValidationMessageProvider,
        CustomMessages: [],
        HydratorType: exports.ModelValidationExpressionHydrator,
    };
}
function createConfiguration(optionsProvider) {
    return {
        optionsProvider,
        register(container) {
            const options = getDefaultValidationConfiguration();
            optionsProvider(options);
            container.register(kernel.Registration.instance(ICustomMessages, options.CustomMessages), kernel.Registration.singleton(IValidator, options.ValidatorType), kernel.Registration.singleton(IValidationMessageProvider, options.MessageProviderType), kernel.Registration.singleton(IValidationExpressionHydrator, options.HydratorType), kernel.Registration.transient(IValidationRules, exports.ValidationRules), exports.ValidationDeserializer);
            return container;
        },
        customize(cb) {
            return createConfiguration(cb ?? optionsProvider);
        },
    };
}
const ValidationConfiguration = createConfiguration(kernel.noop);

exports.Deserializer = Deserializer;
exports.ICustomMessages = ICustomMessages;
exports.IValidationExpressionHydrator = IValidationExpressionHydrator;
exports.IValidationMessageProvider = IValidationMessageProvider;
exports.IValidationRules = IValidationRules;
exports.IValidator = IValidator;
exports.ModelBasedRule = ModelBasedRule;
exports.PropertyRule = PropertyRule;
exports.RuleProperty = RuleProperty;
exports.Serializer = Serializer;
exports.StandardValidator = StandardValidator;
exports.ValidateInstruction = ValidateInstruction;
exports.ValidationConfiguration = ValidationConfiguration;
exports.ValidationResult = ValidationResult;
exports.ValidationRuleAliasMessage = ValidationRuleAliasMessage;
exports.ValidationSerializer = ValidationSerializer;
exports.deserializePrimitive = deserializePrimitive;
exports.getDefaultValidationConfiguration = getDefaultValidationConfiguration;
exports.parsePropertyName = parsePropertyName;
exports.rootObjectSymbol = rootObjectSymbol;
exports.serializePrimitive = serializePrimitive;
exports.serializePrimitives = serializePrimitives;
exports.validationRule = validationRule;
exports.validationRulesRegistrar = validationRulesRegistrar;
//# sourceMappingURL=index.dev.cjs.map