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
        define(["require", "exports", "@aurelia/kernel"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EqualsRule = exports.RangeRule = exports.SizeRule = exports.LengthRule = exports.RegexRule = exports.RequiredRule = exports.BaseValidationRule = exports.validationRule = exports.ValidationRuleAliasMessage = exports.IValidationMessageProvider = void 0;
    const kernel_1 = require("@aurelia/kernel");
    exports.IValidationMessageProvider = kernel_1.DI.createInterface('IValidationMessageProvider');
    exports.ValidationRuleAliasMessage = Object.freeze({
        aliasKey: kernel_1.Protocol.annotation.keyFor('validation-rule-alias-message'),
        define(target, definition) {
            exports.ValidationRuleAliasMessage.setDefaultMessage(target, definition);
            return target;
        },
        setDefaultMessage(rule, { aliases }, append = true) {
            // conditionally merge
            const defaultMessages = append ? kernel_1.Metadata.getOwn(this.aliasKey, rule.prototype) : void 0;
            if (defaultMessages !== void 0) {
                // TODO: have polyfill for `Object.fromEntries` as IE does not yet support it
                const allMessages = {
                    ...Object.fromEntries(defaultMessages.map(({ name, defaultMessage }) => [name, defaultMessage])),
                    ...Object.fromEntries(aliases.map(({ name, defaultMessage }) => [name, defaultMessage])),
                };
                aliases = kernel_1.toArray(Object.entries(allMessages)).map(([name, defaultMessage]) => ({ name, defaultMessage }));
            }
            kernel_1.Metadata.define(exports.ValidationRuleAliasMessage.aliasKey, aliases, rule instanceof Function ? rule.prototype : rule);
        },
        getDefaultMessages(rule) {
            return kernel_1.Metadata.get(this.aliasKey, rule instanceof Function ? rule.prototype : rule);
        }
    });
    function validationRule(definition) {
        return function (target) {
            return exports.ValidationRuleAliasMessage.define(target, definition);
        };
    }
    exports.validationRule = validationRule;
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
    exports.BaseValidationRule = BaseValidationRule;
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
    exports.RequiredRule = RequiredRule;
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
    exports.RegexRule = RegexRule;
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
    exports.LengthRule = LengthRule;
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
    exports.SizeRule = SizeRule;
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
    exports.RangeRule = RangeRule;
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
    exports.EqualsRule = EqualsRule;
});
//# sourceMappingURL=rules.js.map