import { Class } from '@aurelia/kernel';
import { IsBindingBehavior, IExpressionParser } from '@aurelia/runtime';
import { Deserializer } from './ast-serialization.js';
import { IValidationRules } from './rule-provider.js';
import { IValidationMessageProvider } from './rules.js';
export declare type IValidateable<T = any> = (Class<T> | object) & {
    [key in PropertyKey]: any;
};
export declare type ValidationRuleExecutionPredicate<TObject extends IValidateable = IValidateable> = (object?: TObject) => boolean;
export interface IValidationRule<TValue = any, TObject extends IValidateable = IValidateable> {
    tag?: string;
    messageKey: string;
    canExecute(object?: IValidateable): boolean;
    /**
     * Core rule execution.
     *
     * @param {TValue} value - value to validate
     * @param {TObject} [object] - target object
     * @returns {(boolean | Promise<boolean>)} - `true | Promise<true>` if the validation is successful, else `false | Promise<false>`.
     */
    execute(value: TValue, object?: TObject): boolean | Promise<boolean>;
    accept(visitor: IValidationVisitor): any;
}
export interface IRequiredRule extends IValidationRule {
}
export interface IRegexRule extends IValidationRule<string> {
    readonly pattern: RegExp;
}
export interface ILengthRule extends IValidationRule<string> {
    readonly length: number;
    readonly isMax: boolean;
}
export interface ISizeRule extends IValidationRule<unknown[]> {
    readonly count: number;
    readonly isMax: boolean;
}
export interface IRangeRule extends IValidationRule<number> {
    readonly min: number;
    readonly max: number;
    readonly isInclusive: boolean;
}
export interface IEqualsRule extends IValidationRule {
    readonly expectedValue: unknown;
}
export declare type ValidationDisplayNameAccessor = () => string;
/**
 * Describes a property to be validated.
 */
export interface IRuleProperty {
    /**
     * parsed property expression.
     */
    expression?: IsBindingBehavior;
    /**
     * name of the property; absent for a object validation.
     */
    name: string | number | undefined;
    /**
     * display name of the property to be used in validation error messages.
     */
    displayName: string | ValidationDisplayNameAccessor | undefined;
    accept(visitor: IValidationVisitor): any;
}
/**
 * Describes a collection of rules, defined on a property.
 */
export interface IPropertyRule {
    property: IRuleProperty;
    $rules: IValidationRule[][];
    accept(visitor: IValidationVisitor): any;
}
export interface IValidationVisitor {
    visitRequiredRule(rule: IRequiredRule): string;
    visitRegexRule(rule: IRegexRule): string;
    visitLengthRule(rule: ILengthRule): string;
    visitSizeRule(rule: ISizeRule): string;
    visitRangeRule(rule: IRangeRule): string;
    visitEqualsRule(rule: IEqualsRule): string;
    visitRuleProperty(property: IRuleProperty): string;
    visitPropertyRule(propertyRule: IPropertyRule): string;
}
export declare const IValidationExpressionHydrator: import("@aurelia/kernel").InterfaceSymbol<IValidationExpressionHydrator>;
export interface IValidationExpressionHydrator {
    readonly astDeserializer: Deserializer;
    readonly parser: IExpressionParser;
    readonly messageProvider: IValidationMessageProvider;
    hydrate(raw: any, validationRules: IValidationRules): any;
    hydrateRuleset(ruleset: any, validationRules: IValidationRules): IPropertyRule[];
}
//# sourceMappingURL=rule-interfaces.d.ts.map