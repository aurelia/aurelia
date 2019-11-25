import { Class, IContainer } from '@aurelia/kernel';
import { IInterpolationExpression } from '@aurelia/runtime';
import { IValidationMessageProvider } from './validation-messages';
import { PropertyAccessor, PropertyAccessorParser } from '../property-accessor-parser';

export type IValidateable<T = any> = (Class<T> | object) & { [key in PropertyKey]: any };
export type ValidationDisplayNameAccessor = () => string;

/**
 * Information related to a property that is the subject of validation.
 */
export class RuleProperty {
  /**
   * @param {(string | number | null)} [name=null] - The property name. null indicates the rule targets the object itself.
   * @param {(string | ValidationDisplayNameAccessor | null)} [displayName=null] - The displayName of the property (or object).
   * @memberof RuleProperty
   */
  public constructor(
    public name: string | number | null = null,
    public displayName: string | ValidationDisplayNameAccessor | null = null,
  ) { }
}
export type RuleCondition<TObject extends IValidateable = IValidateable, TValue = any> = (value: TValue, object?: TObject) => boolean | Promise<boolean>;
// /**
//  * A rule definition. Associations a rule with a property or object.
//  */
// export class Rule<TObject extends IValidateable = IValidateable, TValue = any> {
//   private message: IInterpolationExpression;

//   public constructor(
//     private readonly messageProvider: IValidationMessageProvider,
//     public property: RuleProperty,
//     public condition: RuleCondition<TObject, TValue>,
//     public config: object,
//     public sequence: number,
//     public messageKey: string = 'default',
//     public when?: ((object: TObject) => boolean),
//     public tag?: string,
//   ) {
//     this.message = (void 0)!;
//   }

//   public setMessageKey(key: string) {
//     this.messageKey = key;
//     this.message = (void 0)!;
//   }

//   public setMessage(message: string) {
//     this.messageKey = 'custom';
//     this.message = this.messageProvider.parseMessage(message);
//   }

//   public getMessage() {
//     let message = this.message;
//     if (message !== void 0) {
//       return message;
//     }
//     message = this.message = this.messageProvider.getMessageByKey(this.messageKey);
//     return message;
//   }
// }

// TODO use metadata service for this.
/**
 * Sets, unsets and retrieves rules on an object or constructor function.
 */
export class Rules {
  /**
   * The name of the property that stores the rules.
   */
  private static key = '__rules__';

  /**
   * Applies the rules to a target.
   */
  public static set(target: IValidateable, rules: Rule[][]): void {
    if (target instanceof Function) {
      target = target.prototype;
    }
    Object.defineProperty(
      target,
      Rules.key,
      { enumerable: false, configurable: false, writable: true, value: rules });
  }

  /**
   * Removes rules from a target.
   */
  public static unset(target: IValidateable): void {
    if (target instanceof Function) {
      target = target.prototype;
    }
    target[Rules.key] = null;
  }

  /**
   * Retrieves the target's rules.
   */
  public static get(target: IValidateable): Rule[][] {
    return target[Rules.key];
  }
}

export type ValidationRuleExecutionPredicate = (object: IValidateable) => boolean;

export abstract class ValidationRule<TValue = any, TObject extends IValidateable = IValidateable> {
  public tag?: string = (void 0)!;
  protected _message: IInterpolationExpression = (void 0)!;

  protected _messageKey: string = 'default';
  public get messageKey() { return this._messageKey; }
  public set messageKey(key: string) {
    this._messageKey = key;
    this._message = (void 0)!;
  }

  public get message() {
    let message = this._message;
    if (message !== void 0) {
      return message;
    }
    message = this._message = this.messageProvider.getMessageByKey(this.messageKey);
    return message;
  }

  public setMessage(message: string) {
    this._messageKey = 'custom';
    this._message = this.messageProvider.parseMessage(message);
  }

  public constructor(protected readonly messageProvider: IValidationMessageProvider) { }

  public canExecute: ValidationRuleExecutionPredicate = () => true;
  public abstract execute(value: TValue, object?: TObject): boolean | Promise<boolean>;
}

class RequiredRule extends ValidationRule {
  protected _messageKey: string = 'required';
  public execute(value: unknown): boolean | Promise<boolean> {
    return value !== null
      && value !== undefined
      && !(typeof value === 'string' && !/\S/.test(value));
  }
}
class RegexRule extends ValidationRule<string> {

  public constructor(
    messageProvider: IValidationMessageProvider,
    private readonly pattern: RegExp,
    protected readonly _messageKey: string = 'matches',
  ) {
    super(messageProvider);
  }

  public execute(value: string): boolean | Promise<boolean> {
    return value === null || value === undefined || value.length === 0 || this.pattern.test(value);
  }
}
class LengthRule extends ValidationRule<string> {

  public constructor(
    messageProvider: IValidationMessageProvider,
    private readonly length: number,
    private readonly isMax: boolean,
  ) {
    super(messageProvider);
    this.messageKey = isMax ? 'maxLength' : 'minLength';
  }

  public execute(value: string): boolean | Promise<boolean> {
    return value === null || value === undefined || value.length === 0 || (this.isMax ? value.length <= this.length : value.length >= this.length);
  }
}
class SizeRule extends ValidationRule<unknown[]> {

  public constructor(
    messageProvider: IValidationMessageProvider,
    private readonly count: number,
    private readonly isMax: boolean,
  ) {
    super(messageProvider);
    this.messageKey = isMax ? 'maxItems' : 'minItems';
  }

  public execute(value: unknown[]): boolean | Promise<boolean> {
    return value === null || value === undefined || (this.isMax ? value.length <= this.count : value.length >= this.count);
  }
}
type Range = { min?: number; max?: number };
class RangeRule extends ValidationRule<number> {

  private readonly min: number = Number.NEGATIVE_INFINITY;
  private readonly max: number = Number.POSITIVE_INFINITY;

  public constructor(
    messageProvider: IValidationMessageProvider,
    private readonly isInclusive: boolean,
    { min, max }: Range = {},
  ) {
    super(messageProvider);
    if (min !== void 0 && max !== void 0) {
      this._messageKey = this.isInclusive ? 'range' : 'between';
    } else {
      this._messageKey = min !== void 0 ? 'min' : 'max';
    }

    this.min = min ?? this.min;
    this.max = max ?? this.max;
  }

  public execute(value: number, _object?: IValidateable): boolean | Promise<boolean> {
    return value === null || value === undefined || (
      this.isInclusive
        ? value >= this.min && value <= this.max
        : value > this.min && value < this.max
    );
  }
}
class EqualsRule extends ValidationRule {
  protected _messageKey: string = 'equals';
  public constructor(
    messageProvider: IValidationMessageProvider,
    private readonly expectedValue: unknown,
  ) { super(messageProvider); }
  public execute(value: unknown): boolean | Promise<boolean> {
    return value === null || value === undefined || value as any === '' || value === this.expectedValue;
  }
}

export class PropertyRule {

  private latestRule?: ValidationRule;

  /**
   * @param {RuleProperty} property - Property to validate
   * @internal @param {ValidationRule[][]} [$rules=[]] - configured rules
   * @memberof PropertyRule
   */
  public constructor(
    private readonly validationRules: ValidationRules,
    private readonly messageProvider: IValidationMessageProvider,
    public property: RuleProperty,
    public $rules: ValidationRule[][] = [],
  ) { }

  /** @internal */
  public addRule(rule: ValidationRule) {
    const rules: ValidationRule[] = this.getLeafRules();
    rules.push(this.latestRule = rule);
    return this;
  }

  private getLeafRules(): ValidationRule[] {
    const depth = this.$rules.length - 1;
    return this.$rules[depth];
  }

  // #region customization API
  /**
   * Validate subsequent rules after previously declared rules have
   * been validated successfully. Use to postpone validation of costly
   * rules until less expensive rules pass validation.
   */
  public then() {
    this.$rules.push([]);
    return this;
  }

  /**
   * Specifies the key to use when looking up the rule's validation message.
   */
  public withMessageKey(key: string) {
    this.assertLatesRule(this.latestRule);
    this.latestRule.messageKey = key;
    return this;
  }

  /**
   * Specifies rule's validation message.
   */
  public withMessage(message: string) {
    this.assertLatesRule(this.latestRule);
    this.latestRule.setMessage(message);
    return this;
  }

  /**
   * Specifies a condition that must be met before attempting to validate the rule.
   *
   * @param condition - A function that accepts the object as a parameter and returns true
   * or false whether the rule should be evaluated.
   */
  public when(condition: ValidationRuleExecutionPredicate) {
    this.assertLatesRule(this.latestRule);
    this.latestRule.canExecute = condition;
    return this;
  }

  /**
   * Tags the rule instance, enabling the rule to be found easily
   * using ValidationRules.taggedRules(rules, tag)
   */
  public tag(tag: string) {
    this.assertLatesRule(this.latestRule);
    this.latestRule.tag = tag;
    return this;
  }

  public getTagedRules(tag: string | undefined): any {
    return new PropertyRule(
      this.validationRules,
      this.messageProvider,
      this.property,
      this.$rules.map((rules) => rules.filter((rule) => rule.tag === tag)),
    );
  }

  private assertLatesRule(latestRule: ValidationRule | undefined): asserts latestRule is ValidationRule {
    if (latestRule === void 0) {
      throw new Error('No rule has been added'); // TODO use reporter
    }
  }
  // #endregion

  // #region rule helper API
  /**
   * Sets the display name of the ensured property.
   */
  public displayName(name: string | ValidationDisplayNameAccessor | null) {
    this.property.displayName = name;
    return this;
  }

  /**
   * Applies an ad-hoc rule function to the ensured property or object.
   *
   * @param condition - The function to validate the rule.
   * Will be called with two arguments, the property value and the object.
   * Should return a boolean or a Promise that resolves to a boolean.
   */
  public satisfies(condition: RuleCondition, config?: object) {
    // TODO handle config
    const rule = new (class extends ValidationRule { public execute: RuleCondition = condition; })(this.messageProvider);
    return this.addRule(rule);
  }

  /**
   * Applies a rule by name.
   *
   * @param name - The name of the custom or standard rule.
   * @param args - The rule's arguments.
   */
  public satisfiesRule(validationRule: ValidationRule) {
    return this.addRule(validationRule);
  }

  /**
   * Applies the "required" rule to the property.
   * The value cannot be null, undefined or whitespace.
   */
  public required() {
    return this.addRule(new RequiredRule(this.messageProvider));
  }

  /**
   * Applies the "matches" rule to the property.
   * Value must match the specified regular expression.
   * null, undefined and empty-string values are considered valid.
   */
  public matches(regex: RegExp) {
    return this.addRule(new RegexRule(this.messageProvider, regex));
  }

  /**
   * Applies the "email" rule to the property.
   * null, undefined and empty-string values are considered valid.
   */
  public email() {
    // eslint-disable-next-line no-useless-escape
    const emailPattern = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return this.addRule(new RegexRule(this.messageProvider, emailPattern, 'email'));
  }

  /**
   * Applies the "minLength" STRING validation rule to the property.
   * null, undefined and empty-string values are considered valid.
   */
  public minLength(length: number) {
    return this.addRule(new LengthRule(this.messageProvider, length, false));
  }

  /**
   * Applies the "maxLength" STRING validation rule to the property.
   * null, undefined and empty-string values are considered valid.
   */
  public maxLength(length: number) {
    return this.addRule(new LengthRule(this.messageProvider, length, true));
  }

  /**
   * Applies the "minItems" ARRAY validation rule to the property.
   * null and undefined values are considered valid.
   */
  public minItems(count: number) {
    return this.addRule(new SizeRule(this.messageProvider, count, false));
  }

  /**
   * Applies the "maxItems" ARRAY validation rule to the property.
   * null and undefined values are considered valid.
   */
  public maxItems(count: number) {
    return this.addRule(new SizeRule(this.messageProvider, count, true));
  }

  /**
   * Applies the "min" NUMBER validation rule to the property.
   * Value must be greater than or equal to the specified constraint.
   * null and undefined values are considered valid.
   */
  public min(constraint: number) {
    return this.addRule(new RangeRule(this.messageProvider, true, { min: constraint }));
  }

  /**
   * Applies the "max" NUMBER validation rule to the property.
   * Value must be less than or equal to the specified constraint.
   * null and undefined values are considered valid.
   */
  public max(constraint: number) {
    return this.addRule(new RangeRule(this.messageProvider, true, { max: constraint }));
  }

  /**
   * Applies the "range" NUMBER validation rule to the property.
   * Value must be between or equal to the specified min and max.
   * null and undefined values are considered valid.
   */
  public range(min: number, max: number) {
    return this.addRule(new RangeRule(this.messageProvider, true, { min, max }));
  }

  /**
   * Applies the "between" NUMBER validation rule to the property.
   * Value must be between but not equal to the specified min and max.
   * null and undefined values are considered valid.
   */
  public between(min: number, max: number) {
    return this.addRule(new RangeRule(this.messageProvider, false, { min, max }));
  }

  /**
   * Applies the "equals" validation rule to the property.
   * null and undefined values are considered valid.
   */
  public equals(expectedValue: unknown) {
    return this.addRule(new EqualsRule(this.messageProvider, expectedValue));
  }
  // #endregion

  // #region ValidationRules proxy
  /**
   * Target a property with validation rules.
   *
   * @param property - The property to target. Can be the property name or a property accessor function.
   */
  public ensure<TValue>(subject: string | number | PropertyAccessor<IValidateable, TValue>) {
    this.latestRule = void 0;
    return this.validationRules.ensure<TValue>(subject);
  }

  /**
   * Targets an object with validation rules.
   */
  public ensureObject() {
    this.latestRule = void 0;
    return this.validationRules.ensureObject();
  }

  /**
   * Rules that have been defined using the fluent API.
   */
  public get rules() {
    return this.validationRules.rules;
  }

  /**
   * Applies the rules to a class or object, making them discoverable by the StandardValidator.
   *
   * @param target - A class or object.
   */
  public on(target: IValidateable) {
    return this.validationRules.on(target);
  }
  // #endregion
}

/**
 * Part of the fluent rule API. Enables targeting properties and objects with rules.
 */
export class ValidationRules {
  private static propertyParser: PropertyAccessorParser;
  private static messageProvider: IValidationMessageProvider;

  public static register(container: IContainer) {
    this.propertyParser = container.get(PropertyAccessorParser);
    this.messageProvider = container.get(IValidationMessageProvider);
  }

  /**
   * Returns rules with the matching tag.
   *
   * @param rules - The rules to search.
   * @param tag - The tag to search for.
   */
  public static taggedRules(rules: PropertyRule[], tag: string): PropertyRule[] {
    return rules.map(rule => rule.getTagedRules(tag));
  }

  /**
   * Returns rules that have no tag.
   *
   * @param rules - The rules to search.
   */
  public static untaggedRules(rules: PropertyRule[]): PropertyRule[][] {
    return rules.map(rule => rule.getTagedRules(void 0));
  }

  /**
   * Removes the rules from a class or object.
   *
   * @param target - A class or object.
   */
  public static off(target: IValidateable): void {
    Rules.unset(target);
  }

  public rules: PropertyRule[] = [];

  /**
   * Target a property with validation rules.
   *
   * @param property - The property to target. Can be the property name or a property accessor
   * function.
   */
  public ensure<TValue>(property: string | number | PropertyAccessor<IValidateable, TValue>): PropertyRule {
    this.assertInitialized();
    const name = ValidationRules.propertyParser.parse(property);
    // eslint-disable-next-line eqeqeq
    let rule = this.rules.find((r) => r.property.name == name);
    if (rule === void 0) {
      rule = new PropertyRule(this, ValidationRules.messageProvider, new RuleProperty(name));
      this.rules.push(rule);
    }
    return rule;
  }

  /**
   * Targets an object with validation rules.
   */
  public ensureObject(): PropertyRule {
    this.assertInitialized();
    const rule = new PropertyRule(this, ValidationRules.messageProvider, new RuleProperty());
    this.rules.push(rule);
    return rule;
  }

  /**
   * Applies the rules to a class or object, making them discoverable by the StandardValidator.
   *
   * @param target - A class or object.
   */
  public on(target: IValidateable) {
    Rules.set(target, this.rules);
    return this;
  }

  private assertInitialized() {
    if (ValidationRules.messageProvider === void 0 || ValidationRules.propertyParser === void 0) {
      return;
    }
    throw new Error(`Did you forget to register 'ValidationConfiguration' from '@aurelia/validation'?`);
  }
}
