import { Class, ILogger, IServiceLocator } from '@aurelia/kernel';
import { IExpressionParser, Interpolation, IsBindingBehavior, LifecycleFlags, PrimitiveLiteralExpression, Scope } from '@aurelia/runtime';
import { ValidationRuleAlias, IValidationMessageProvider } from './rules.js';
import { IValidateable, ValidationRuleExecutionPredicate, IValidationVisitor, ValidationDisplayNameAccessor, IRuleProperty, IPropertyRule, IValidationExpressionHydrator, IValidationRule } from './rule-interfaces.js';
/**
 * Contract to register the custom messages for rules, during plugin registration.
 */
export interface ICustomMessage<TRule extends IValidationRule = IValidationRule> {
    rule: Class<TRule>;
    aliases: ValidationRuleAlias[];
}
export declare class RuleProperty implements IRuleProperty {
    expression?: IsBindingBehavior | undefined;
    name: string | number | undefined;
    displayName: string | ValidationDisplayNameAccessor | undefined;
    static $TYPE: string;
    constructor(expression?: IsBindingBehavior | undefined, name?: string | number | undefined, displayName?: string | ValidationDisplayNameAccessor | undefined);
    accept(visitor: IValidationVisitor): string;
}
export declare type RuleCondition<TObject extends IValidateable = IValidateable, TValue = any> = (value: TValue, object?: TObject) => boolean | Promise<boolean>;
export declare const validationRulesRegistrar: Readonly<{
    name: string;
    defaultRuleSetName: string;
    set(target: IValidateable, rules: IPropertyRule[], tag?: string | undefined): void;
    get(target: IValidateable, tag?: string | undefined): PropertyRule[];
    unset(target: IValidateable, tag?: string | undefined): void;
    isValidationRulesSet(target: IValidateable): boolean;
}>;
export declare class PropertyRule<TObject extends IValidateable = IValidateable, TValue = unknown> implements IPropertyRule {
    private readonly locator;
    readonly validationRules: IValidationRules;
    readonly messageProvider: IValidationMessageProvider;
    property: RuleProperty;
    $rules: IValidationRule[][];
    static readonly $TYPE: string;
    private latestRule?;
    constructor(locator: IServiceLocator, validationRules: IValidationRules, messageProvider: IValidationMessageProvider, property: RuleProperty, $rules?: IValidationRule[][]);
    accept(visitor: IValidationVisitor): string;
    private getLeafRules;
    validate(object?: IValidateable, tag?: string, flags?: LifecycleFlags, scope?: Scope): Promise<ValidationResult[]>;
    /**
     * Validate subsequent rules after previously declared rules have been validated successfully.
     * Use to postpone validation of costly rules until less expensive rules pass validation.
     */
    then(): this;
    /**
     * Specifies the key to use when looking up the rule's validation message.
     * Note that custom keys needs to be registered during plugin registration.
     */
    withMessageKey(key: string): this;
    /**
     * Specifies rule's validation message; this overrides the rules default validation message.
     */
    withMessage(message: string): this;
    /**
     * Specifies a condition that must be met before attempting to validate the rule.
     *
     * @param {ValidationRuleExecutionPredicate<TObject>} condition - A function that accepts the object as a parameter and returns true or false whether the rule should be evaluated.
     */
    when(this: PropertyRule<TObject>, condition: ValidationRuleExecutionPredicate<TObject>): PropertyRule<TObject, unknown>;
    /**
     * Tags the rule instance.
     * The tag can later be used to perform selective validation.
     */
    tag(tag: string): this;
    private assertLatestRule;
    /**
     * Sets the display name of the ensured property.
     */
    displayName(name: string | ValidationDisplayNameAccessor): this;
    /**
     * Applies an ad-hoc rule function to the ensured property or object.
     *
     * @param {RuleCondition} condition - The function to validate the rule. Will be called with two arguments, the property value and the object.
     */
    satisfies(condition: RuleCondition): this;
    /**
     * Applies a custom rule instance.
     *
     * @param {TRule} validationRule - rule instance.
     */
    satisfiesRule<TRule extends IValidationRule>(validationRule: TRule): this;
    /**
     * Applies an instance of `RequiredRule`.
     */
    required(): this;
    /**
     * Applies an instance of `RegexRule`.
     */
    matches(this: PropertyRule<TObject, string>, regex: RegExp): PropertyRule<TObject, string>;
    /**
     * Applies an instance of `RegexRule` with email pattern.
     */
    email(this: PropertyRule<TObject, string>): PropertyRule<TObject, string>;
    /**
     * Applies an instance of `LengthRule` with min `length` constraint.
     * Applicable for string value.
     */
    minLength(this: PropertyRule<TObject, string>, length: number): PropertyRule<TObject, string>;
    /**
     * Applies an instance of `LengthRule` with max `length` constraint.
     * Applicable for string value.
     */
    maxLength(this: PropertyRule<TObject, string>, length: number): PropertyRule<TObject, string>;
    /**
     * Applies an instance of `SizeRule` with min `count` constraint.
     * Applicable for array value.
     */
    minItems(this: PropertyRule<TObject, unknown[]>, count: number): PropertyRule<TObject, unknown[]>;
    /**
     * Applies an instance of `SizeRule` with max `count` constraint.
     * Applicable for array value.
     */
    maxItems(this: PropertyRule<TObject, unknown[]>, count: number): PropertyRule<TObject, unknown[]>;
    /**
     * Applies an instance of `RangeRule` with [`constraint`,] interval.
     * Applicable for number value.
     */
    min(this: PropertyRule<TObject, number>, constraint: number): PropertyRule<TObject, number>;
    /**
     * Applies an instance of `RangeRule` with [,`constraint`] interval.
     * Applicable for number value.
     */
    max(this: PropertyRule<TObject, number>, constraint: number): PropertyRule<TObject, number>;
    /**
     * Applies an instance of `RangeRule` with [`min`,`max`] interval.
     * Applicable for number value.
     */
    range(this: PropertyRule<TObject, number>, min: number, max: number): PropertyRule<TObject, number>;
    /**
     * Applies an instance of `RangeRule` with (`min`,`max`) interval.
     * Applicable for number value.
     */
    between(this: PropertyRule<TObject, number>, min: number, max: number): PropertyRule<TObject, number>;
    /**
     * Applies an instance of `EqualsRule` with the `expectedValue`.
     */
    equals(expectedValue: unknown): this;
    /**
     * Targets a object property for validation
     *
     * @param {(keyof TObject | string | PropertyAccessor<TObject, TValue>)} property - can be string or a property accessor function.
     */
    ensure<TProp extends keyof TObject>(property: TProp): PropertyRule<TObject, TObject[TProp]>;
    ensure<TValue>(property: PropertyAccessor<TObject, TValue>): PropertyRule<TObject, TValue>;
    ensure(property: string): PropertyRule;
    /**
     * Targets an object with validation rules.
     */
    ensureObject(): PropertyRule<IValidateable<any>, unknown>;
    /**
     * Rules that have been defined using the fluent API.
     */
    get rules(): PropertyRule<IValidateable<any>, unknown>[];
    /**
     * Applies the rules to a class or object, making them discoverable by the StandardValidator.
     *
     * @param {IValidateable} target - A class or object.
     * @param {string} [tag] - Tag to use to mark the ruleset for the `target`
     */
    on<TAnotherObject extends IValidateable = IValidateable>(target: Class<TAnotherObject> | TAnotherObject, tag?: string): IValidationRules<TAnotherObject>;
}
export declare class ModelBasedRule {
    ruleset: any;
    tag: string;
    constructor(ruleset: any, tag?: string);
}
export interface IValidationRules<TObject extends IValidateable = IValidateable> {
    rules: PropertyRule[];
    /**
     * Targets a object property for validation
     *
     * @param {(keyof TObject | string | PropertyAccessor<TObject, TValue>)} property - can be string or a property accessor function.
     */
    ensure<TProp extends keyof TObject>(property: TProp): PropertyRule<TObject, TObject[TProp]>;
    ensure<TValue>(property: string | PropertyAccessor<TObject, TValue>): PropertyRule<TObject, TValue>;
    /**
     * Targets an object with validation rules.
     */
    ensureObject(): PropertyRule;
    /**
     * Applies the rules to a class or object, making them discoverable by the StandardValidator.
     *
     * @param {IValidateable} target - A class or object.
     * @param {string} [tag] - Tag to use to mark the ruleset for the `target`
     */
    on<TAnotherObject extends IValidateable = IValidateable>(target: Class<TAnotherObject> | TAnotherObject, tag?: string): IValidationRules<TAnotherObject>;
    /**
     * Removes the rules from a class or object.
     *
     * @param {IValidateable} [target] - When omitted, it removes rules for all the objects, for which rules are registered via this instance of IValidationRules
     * @param {string} [tag] - Use this tag to remove a specific ruleset. If omitted all rulesets of the object are removed.
     */
    off<TAnotherObject extends IValidateable = IValidateable>(target?: Class<TAnotherObject> | TAnotherObject, tag?: string): void;
    applyModelBasedRules(target: IValidateable, rules: ModelBasedRule[]): void;
}
export declare const IValidationRules: import("@aurelia/kernel").InterfaceSymbol<IValidationRules<IValidateable<any>>>;
export declare class ValidationRules<TObject extends IValidateable = IValidateable> implements IValidationRules<TObject> {
    private readonly locator;
    private readonly parser;
    private readonly messageProvider;
    private readonly deserializer;
    rules: PropertyRule[];
    private readonly targets;
    constructor(locator: IServiceLocator, parser: IExpressionParser, messageProvider: IValidationMessageProvider, deserializer: IValidationExpressionHydrator);
    ensure<TValue>(property: keyof TObject | string | PropertyAccessor): PropertyRule;
    ensureObject(): PropertyRule;
    on(target: IValidateable, tag?: string): this;
    off(target?: IValidateable, tag?: string): void;
    applyModelBasedRules(target: IValidateable, rules: ModelBasedRule[]): void;
}
export declare const rootObjectSymbol = "$root";
export declare type PropertyAccessor<TObject extends IValidateable = IValidateable, TValue = unknown> = (object: TObject) => TValue;
export declare function parsePropertyName(property: string | PropertyAccessor, parser: IExpressionParser): [string, IsBindingBehavior];
/**
 * The result of validating an individual validation rule.
 */
export declare class ValidationResult<TRule extends IValidationRule = IValidationRule> {
    valid: boolean;
    message: string | undefined;
    propertyName: string | number | undefined;
    object: IValidateable | undefined;
    rule: TRule | undefined;
    propertyRule: PropertyRule | undefined;
    isManual: boolean;
    private static nextId;
    /**
     * A number that uniquely identifies the result instance.
     */
    id: number;
    /**
     * @param {boolean} valid - `true` is the validation was successful, else `false`.
     * @param {(string | undefined)} message - Evaluated validation message, if the result is not valid, else `undefined`.
     * @param {(string | number | undefined)} propertyName - Associated property name.
     * @param {(IValidateable | undefined)} object - Associated target object.
     * @param {(TRule | undefined)} rule - Associated instance of rule.
     * @param {(PropertyRule | undefined)} propertyRule - Associated parent property rule.
     * @param {boolean} [isManual=false] - `true` if the validation result is added manually.
     */
    constructor(valid: boolean, message: string | undefined, propertyName: string | number | undefined, object: IValidateable | undefined, rule: TRule | undefined, propertyRule: PropertyRule | undefined, isManual?: boolean);
    toString(): string | undefined;
}
export declare class ValidationMessageProvider implements IValidationMessageProvider {
    parser: IExpressionParser;
    private readonly logger;
    protected registeredMessages: WeakMap<IValidationRule, Interpolation | PrimitiveLiteralExpression>;
    constructor(parser: IExpressionParser, logger: ILogger, customMessages: ICustomMessage[]);
    getMessage(rule: IValidationRule): Interpolation | PrimitiveLiteralExpression;
    setMessage(rule: IValidationRule, message: string): Interpolation | PrimitiveLiteralExpression;
    parseMessage(message: string): Interpolation | PrimitiveLiteralExpression;
    getDisplayName(propertyName: string | number | undefined, displayName?: string | null | ValidationDisplayNameAccessor): string | undefined;
}
//# sourceMappingURL=rule-provider.d.ts.map