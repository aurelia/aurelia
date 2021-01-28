var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { IServiceLocator } from '@aurelia/kernel';
import { IExpressionParser, Scope } from '@aurelia/runtime';
import { Deserializer, serializePrimitive, Serializer } from './ast-serialization.js';
import { parsePropertyName, PropertyRule, RuleProperty } from './rule-provider.js';
import { EqualsRule, IValidationMessageProvider, LengthRule, RangeRule, RegexRule, RequiredRule, SizeRule, } from './rules.js';
export class ValidationSerializer {
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
export { ValidationDeserializer };
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
                    return parsed.evaluate(flags, Scope.create({ $object: object }), null, this.locator, null); // TODO get hostScope?
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
export { ModelValidationExpressionHydrator };
//# sourceMappingURL=serialization.js.map