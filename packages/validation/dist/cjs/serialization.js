"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelValidationExpressionHydrator = exports.ValidationDeserializer = exports.ValidationSerializer = void 0;
const kernel_1 = require("@aurelia/kernel");
const runtime_1 = require("@aurelia/runtime");
const ast_serialization_js_1 = require("./ast-serialization.js");
const rule_provider_js_1 = require("./rule-provider.js");
const rules_js_1 = require("./rules.js");
class ValidationSerializer {
    static serialize(object) {
        if (object == null || typeof object.accept !== 'function') {
            return `${object}`;
        }
        const visitor = new ValidationSerializer();
        return object.accept(visitor);
    }
    visitRequiredRule(rule) {
        return `{"$TYPE":"${rules_js_1.RequiredRule.$TYPE}","messageKey":"${rule.messageKey}","tag":${ast_serialization_js_1.serializePrimitive(rule.tag)}}`;
    }
    visitRegexRule(rule) {
        const pattern = rule.pattern;
        return `{"$TYPE":"${rules_js_1.RegexRule.$TYPE}","messageKey":"${rule.messageKey}","tag":${ast_serialization_js_1.serializePrimitive(rule.tag)},"pattern":{"source":${ast_serialization_js_1.serializePrimitive(pattern.source)},"flags":"${pattern.flags}"}}`;
    }
    visitLengthRule(rule) {
        return `{"$TYPE":"${rules_js_1.LengthRule.$TYPE}","messageKey":"${rule.messageKey}","tag":${ast_serialization_js_1.serializePrimitive(rule.tag)},"length":${ast_serialization_js_1.serializePrimitive(rule.length)},"isMax":${ast_serialization_js_1.serializePrimitive(rule.isMax)}}`;
    }
    visitSizeRule(rule) {
        return `{"$TYPE":"${rules_js_1.SizeRule.$TYPE}","messageKey":"${rule.messageKey}","tag":${ast_serialization_js_1.serializePrimitive(rule.tag)},"count":${ast_serialization_js_1.serializePrimitive(rule.count)},"isMax":${ast_serialization_js_1.serializePrimitive(rule.isMax)}}`;
    }
    visitRangeRule(rule) {
        return `{"$TYPE":"${rules_js_1.RangeRule.$TYPE}","messageKey":"${rule.messageKey}","tag":${ast_serialization_js_1.serializePrimitive(rule.tag)},"isInclusive":${rule.isInclusive},"min":${this.serializeNumber(rule.min)},"max":${this.serializeNumber(rule.max)}}`;
    }
    visitEqualsRule(rule) {
        const expectedValue = rule.expectedValue;
        let serializedExpectedValue;
        if (typeof expectedValue !== 'object' || expectedValue === null) {
            serializedExpectedValue = ast_serialization_js_1.serializePrimitive(expectedValue);
        }
        else {
            serializedExpectedValue = JSON.stringify(expectedValue);
        }
        return `{"$TYPE":"${rules_js_1.EqualsRule.$TYPE}","messageKey":"${rule.messageKey}","tag":${ast_serialization_js_1.serializePrimitive(rule.tag)},"expectedValue":${serializedExpectedValue}}`;
    }
    visitRuleProperty(property) {
        const displayName = property.displayName;
        if (displayName !== void 0 && typeof displayName !== 'string') {
            throw new Error('Serializing a non-string displayName for rule property is not supported.'); // TODO: use reporter/logger
        }
        const expression = property.expression;
        return `{"$TYPE":"${rule_provider_js_1.RuleProperty.$TYPE}","name":${ast_serialization_js_1.serializePrimitive(property.name)},"expression":${expression ? ast_serialization_js_1.Serializer.serialize(expression) : null},"displayName":${ast_serialization_js_1.serializePrimitive(displayName)}}`;
    }
    visitPropertyRule(propertyRule) {
        return `{"$TYPE":"${rule_provider_js_1.PropertyRule.$TYPE}","property":${propertyRule.property.accept(this)},"$rules":${this.serializeRules(propertyRule.$rules)}}`;
    }
    serializeNumber(num) {
        return num === Number.POSITIVE_INFINITY || num === Number.NEGATIVE_INFINITY ? null : num.toString();
    }
    serializeRules(ruleset) {
        return `[${ruleset.map((rules) => `[${rules.map((rule) => rule.accept(this)).join(',')}]`).join(',')}]`;
    }
}
exports.ValidationSerializer = ValidationSerializer;
let ValidationDeserializer = class ValidationDeserializer {
    constructor(locator, messageProvider, parser) {
        this.locator = locator;
        this.messageProvider = messageProvider;
        this.parser = parser;
        this.astDeserializer = new ast_serialization_js_1.Deserializer();
    }
    static register(container) {
        this.container = container;
    }
    static deserialize(json, validationRules) {
        const messageProvider = this.container.get(rules_js_1.IValidationMessageProvider);
        const parser = this.container.get(runtime_1.IExpressionParser);
        const deserializer = new ValidationDeserializer(this.container, messageProvider, parser);
        const raw = JSON.parse(json);
        return deserializer.hydrate(raw, validationRules);
    }
    hydrate(raw, validationRules) {
        var _a, _b;
        switch (raw.$TYPE) {
            case rules_js_1.RequiredRule.$TYPE: {
                const $raw = raw;
                const rule = new rules_js_1.RequiredRule();
                rule.messageKey = $raw.messageKey;
                rule.tag = this.astDeserializer.hydrate($raw.tag);
                return rule;
            }
            case rules_js_1.RegexRule.$TYPE: {
                const $raw = raw;
                const pattern = $raw.pattern;
                const astDeserializer = this.astDeserializer;
                const rule = new rules_js_1.RegexRule(new RegExp(astDeserializer.hydrate(pattern.source), pattern.flags), $raw.messageKey);
                rule.tag = astDeserializer.hydrate($raw.tag);
                return rule;
            }
            case rules_js_1.LengthRule.$TYPE: {
                const $raw = raw;
                const rule = new rules_js_1.LengthRule($raw.length, $raw.isMax);
                rule.messageKey = $raw.messageKey;
                rule.tag = this.astDeserializer.hydrate($raw.tag);
                return rule;
            }
            case rules_js_1.SizeRule.$TYPE: {
                const $raw = raw;
                const rule = new rules_js_1.SizeRule($raw.count, $raw.isMax);
                rule.messageKey = $raw.messageKey;
                rule.tag = this.astDeserializer.hydrate($raw.tag);
                return rule;
            }
            case rules_js_1.RangeRule.$TYPE: {
                const $raw = raw;
                const rule = new rules_js_1.RangeRule($raw.isInclusive, { min: (_a = $raw.min) !== null && _a !== void 0 ? _a : Number.NEGATIVE_INFINITY, max: (_b = $raw.max) !== null && _b !== void 0 ? _b : Number.POSITIVE_INFINITY });
                rule.messageKey = $raw.messageKey;
                rule.tag = this.astDeserializer.hydrate($raw.tag);
                return rule;
            }
            case rules_js_1.EqualsRule.$TYPE: {
                const $raw = raw;
                const astDeserializer = this.astDeserializer;
                const rule = new rules_js_1.EqualsRule(typeof $raw.expectedValue !== 'object' ? astDeserializer.hydrate($raw.expectedValue) : $raw.expectedValue);
                rule.messageKey = $raw.messageKey;
                rule.tag = astDeserializer.hydrate($raw.tag);
                return rule;
            }
            case rule_provider_js_1.RuleProperty.$TYPE: {
                const $raw = raw;
                const astDeserializer = this.astDeserializer;
                let name = $raw.name;
                name = name === 'undefined' ? void 0 : astDeserializer.hydrate(name);
                let expression = $raw.expression;
                if (expression !== null && expression !== void 0) {
                    expression = astDeserializer.hydrate(expression);
                }
                else if (name !== void 0) {
                    ([, expression] = rule_provider_js_1.parsePropertyName(name, this.parser));
                }
                else {
                    expression = void 0;
                }
                let displayName = $raw.displayName;
                displayName = displayName === 'undefined' ? void 0 : astDeserializer.hydrate(displayName);
                return new rule_provider_js_1.RuleProperty(expression, name, displayName);
            }
            case rule_provider_js_1.PropertyRule.$TYPE: {
                const $raw = raw;
                return new rule_provider_js_1.PropertyRule(this.locator, validationRules, this.messageProvider, this.hydrate($raw.property, validationRules), $raw.$rules.map((rules) => rules.map((rule) => this.hydrate(rule, validationRules))));
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
    __param(0, kernel_1.IServiceLocator),
    __param(1, rules_js_1.IValidationMessageProvider),
    __param(2, runtime_1.IExpressionParser)
], ValidationDeserializer);
exports.ValidationDeserializer = ValidationDeserializer;
let ModelValidationExpressionHydrator = class ModelValidationExpressionHydrator {
    constructor(locator, messageProvider, parser) {
        this.locator = locator;
        this.messageProvider = messageProvider;
        this.parser = parser;
        this.astDeserializer = new ast_serialization_js_1.Deserializer();
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
                    accRules.push(new rule_provider_js_1.PropertyRule(this.locator, validationRules, this.messageProvider, property, rules));
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
                    return parsed.evaluate(flags, runtime_1.Scope.create({ $object: object }), null, this.locator, null); // TODO get hostScope?
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
        const rule = new rules_js_1.RequiredRule();
        this.setCommonRuleProperties(raw, rule);
        return rule;
    }
    hydrateRegexRule(raw) {
        const pattern = raw.pattern;
        const rule = new rules_js_1.RegexRule(new RegExp(pattern.source, pattern.flags), raw.messageKey);
        rule.tag = raw.tag;
        return rule;
    }
    hydrateLengthRule(raw) {
        const rule = new rules_js_1.LengthRule(raw.length, raw.isMax);
        this.setCommonRuleProperties(raw, rule);
        return rule;
    }
    hydrateSizeRule(raw) {
        const rule = new rules_js_1.SizeRule(raw.count, raw.isMax);
        this.setCommonRuleProperties(raw, rule);
        return rule;
    }
    hydrateRangeRule(raw) {
        const rule = new rules_js_1.RangeRule(raw.isInclusive, { min: raw.min, max: raw.max });
        this.setCommonRuleProperties(raw, rule);
        return rule;
    }
    hydrateEqualsRule(raw) {
        const rule = new rules_js_1.EqualsRule(raw.expectedValue);
        this.setCommonRuleProperties(raw, rule);
        return rule;
    }
    hydrateRuleProperty(raw) {
        const rawName = raw.name;
        if (!rawName || typeof rawName !== 'string') {
            throw new Error('The property name needs to be a non-empty string'); // TODO: use reporter
        }
        const [name, expression] = rule_provider_js_1.parsePropertyName(rawName, this.parser);
        return new rule_provider_js_1.RuleProperty(expression, name, raw.displayName);
    }
};
ModelValidationExpressionHydrator = __decorate([
    __param(0, kernel_1.IServiceLocator),
    __param(1, rules_js_1.IValidationMessageProvider),
    __param(2, runtime_1.IExpressionParser)
], ModelValidationExpressionHydrator);
exports.ModelValidationExpressionHydrator = ModelValidationExpressionHydrator;
//# sourceMappingURL=serialization.js.map