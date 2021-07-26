import { Constructable, Class } from '@aurelia/kernel';
import { Interpolation, PrimitiveLiteralExpression } from '@aurelia/runtime';
import { IValidateable, IValidationRule, IRequiredRule, IRegexRule, ILengthRule, ISizeRule, IRangeRule, IEqualsRule, IValidationVisitor, ValidationDisplayNameAccessor } from './rule-interfaces.js';
/**
 * Retrieves validation messages and property display names.
 */
export interface IValidationMessageProvider {
    /**
     * Gets the parsed message for the `rule`.
     */
    getMessage(rule: IValidationRule): Interpolation | PrimitiveLiteralExpression;
    /**
     * Gets the parsed message for the `rule`.
     */
    setMessage(rule: IValidationRule, message: string): Interpolation | PrimitiveLiteralExpression;
    /**
     * Core message parsing function.
     */
    parseMessage(message: string): Interpolation | PrimitiveLiteralExpression;
    /**
     * Formulates a property display name using the property name and the configured displayName (if provided).
     */
    getDisplayName(propertyName: string | number | undefined, displayName?: string | null | ValidationDisplayNameAccessor): string | undefined;
}
export declare const IValidationMessageProvider: import("@aurelia/kernel").InterfaceSymbol<IValidationMessageProvider>;
export interface ValidationRuleAlias {
    name: string;
    defaultMessage?: string;
}
export interface ValidationRuleDefinition {
    aliases: ValidationRuleAlias[];
}
export declare type RuleType<TRule extends IValidationRule> = Class<TRule, {
    $TYPE: string;
}>;
export declare const ValidationRuleAliasMessage: Readonly<{
    aliasKey: string;
    define<TRule extends IValidationRule<any, IValidateable<any>>>(target: RuleType<TRule>, definition: ValidationRuleDefinition): RuleType<TRule>;
    setDefaultMessage<TRule_1 extends IValidationRule<any, IValidateable<any>>>(rule: Constructable<TRule_1>, { aliases }: ValidationRuleDefinition, append?: boolean): void;
    getDefaultMessages<TRule_2 extends IValidationRule<any, IValidateable<any>>>(rule: TRule_2 | Constructable<TRule_2>): ValidationRuleAlias[];
}>;
export declare function validationRule(definition: ValidationRuleDefinition): <TRule extends IValidationRule<any, IValidateable<any>>>(target: RuleType<TRule>) => RuleType<TRule>;
/**
 * Abstract validation rule.
 */
export declare class BaseValidationRule<TValue = any, TObject extends IValidateable = IValidateable> implements IValidationRule<TValue, TObject> {
    messageKey: string;
    static readonly $TYPE: string;
    tag?: string;
    constructor(messageKey?: string);
    canExecute(_object?: IValidateable): boolean;
    execute(_value: TValue, _object?: TObject): boolean | Promise<boolean>;
    accept(_visitor: IValidationVisitor): any;
}
/**
 * Passes the validation if the value is not `null`, and not `undefined`.
 * In case of string, it must not be empty.
 *
 * @see PropertyRule#required
 */
export declare class RequiredRule extends BaseValidationRule implements IRequiredRule {
    static readonly $TYPE: string;
    constructor();
    execute(value: unknown): boolean | Promise<boolean>;
    accept(visitor: IValidationVisitor): string;
}
/**
 * Passes the validation if the non-`null`, non-`undefined`, and non-empty string value matches the given pattern described by a regular expression.
 * There are 2 aliases: 'matches' (any random regex), and 'email' (with email regex).
 *
 * @see PropertyRule#matches
 * @see PropertyRule#email
 */
export declare class RegexRule extends BaseValidationRule<string> implements IRegexRule {
    readonly pattern: RegExp;
    static readonly $TYPE: string;
    constructor(pattern: RegExp, messageKey?: string);
    execute(value: string): boolean | Promise<boolean>;
    accept(visitor: IValidationVisitor): string;
}
/**
 * Passes the validation if the non-`null`, non-`undefined`, and non-empty string value matches the given length constraint.
 * There are 2 aliases: 'minLength', and 'maxLength'.
 *
 * @see PropertyRule#minLength
 * @see PropertyRule#maxLength
 */
export declare class LengthRule extends BaseValidationRule<string> implements ILengthRule {
    readonly length: number;
    readonly isMax: boolean;
    static readonly $TYPE: string;
    constructor(length: number, isMax: boolean);
    execute(value: string): boolean | Promise<boolean>;
    accept(visitor: IValidationVisitor): string;
}
/**
 * Passes the validation if the non-`null`, and non-`undefined` array value matches the given count constraint.
 * There are 2 aliases: 'minItems', and 'maxItems'.
 *
 * @see PropertyRule#minItems
 * @see PropertyRule#maxItems
 */
export declare class SizeRule extends BaseValidationRule<unknown[]> implements ISizeRule {
    readonly count: number;
    readonly isMax: boolean;
    static readonly $TYPE: string;
    constructor(count: number, isMax: boolean);
    execute(value: unknown[]): boolean | Promise<boolean>;
    accept(visitor: IValidationVisitor): string;
}
declare type Range = {
    min?: number;
    max?: number;
};
/**
 * Passes the validation if the non-`null`, and non-`undefined` numeric value matches the given interval constraint.
 * There are 2 aliases: 'min' (`[min,]`), 'max' (`[, max]`), range (`[min, max]`), and 'between' (`(min, max)`).
 *
 * @see PropertyRule#min
 * @see PropertyRule#max
 * @see PropertyRule#range
 * @see PropertyRule#between
 */
export declare class RangeRule extends BaseValidationRule<number> implements IRangeRule {
    readonly isInclusive: boolean;
    static readonly $TYPE: string;
    readonly min: number;
    readonly max: number;
    constructor(isInclusive: boolean, { min, max }: Range);
    execute(value: number, _object?: IValidateable): boolean | Promise<boolean>;
    accept(visitor: IValidationVisitor): string;
}
/**
 * Passes the validation if the the non-`null`, non-`undefined`, non-empty value matches given expected value.
 *
 * @see PropertyRule#equals
 */
export declare class EqualsRule extends BaseValidationRule implements IEqualsRule {
    readonly expectedValue: unknown;
    static readonly $TYPE: string;
    constructor(expectedValue: unknown);
    execute(value: unknown): boolean | Promise<boolean>;
    accept(visitor: IValidationVisitor): string;
}
export {};
//# sourceMappingURL=rules.d.ts.map