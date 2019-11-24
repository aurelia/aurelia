import { PropertyAccessor, PropertyAccessorParser } from '../property-accessor-parser';
import { Rule, RuleCondition, RuleProperty, Rules, ValidationDisplayNameAccessor, IValidateable } from './rule';
import { validationMessages, IValidationMessageProvider } from './validation-messages';
import { IContainer } from '@aurelia/kernel';

/**
 * Part of the fluent rule API. Enables customizing property rules.
 */
export class FluentRuleCustomizer<TObject, TValue> {
  private rule: Rule<TObject, TValue>;

  public constructor(
    property: RuleProperty,
    condition: RuleCondition,
    private readonly fluentEnsure: ValidationRules,
    private readonly fluentRules: FluentRules<TValue>,
    messageProvider: IValidationMessageProvider,
    config: object = {},
  ) {
    this.rule = new Rule(messageProvider, property, condition, config, fluentRules.sequence);
    this.fluentEnsure._addRule(this.rule);
  }

  /**
   * Validate subsequent rules after previously declared rules have
   * been validated successfully. Use to postpone validation of costly
   * rules until less expensive rules pass validation.
   */
  public then() {
    this.fluentRules.sequence++;
    return this;
  }

  /**
   * Specifies the key to use when looking up the rule's validation message.
   */
  public withMessageKey(key: string) {
    this.rule.setMessageKey(key);
    return this;
  }

  /**
   * Specifies rule's validation message.
   */
  public withMessage(message: string) {
    this.rule.setMessage(message);
    return this;
  }

  /**
   * Specifies a condition that must be met before attempting to validate the rule.
   *
   * @param condition - A function that accepts the object as a parameter and returns true
   * or false whether the rule should be evaluated.
   */
  public when(condition: (object: TObject) => boolean) {
    this.rule.when = condition;
    return this;
  }

  /**
   * Tags the rule instance, enabling the rule to be found easily
   * using ValidationRules.taggedRules(rules, tag)
   */
  public tag(tag: string) {
    this.rule.tag = tag;
    return this;
  }

  // #region FluentEnsure APIs

  /**
   * Target a property with validation rules.
   *
   * @param property - The property to target. Can be the property name or a property accessor function.
   */
  public ensure<TValue2>(subject: string | ((model: TObject) => TValue2)) {
    return this.fluentEnsure.ensure<TValue2>(subject);
  }

  /**
   * Targets an object with validation rules.
   */
  public ensureObject() {
    return this.fluentEnsure.ensureObject();
  }

  /**
   * Rules that have been defined using the fluent API.
   */
  public get rules() {
    return this.fluentEnsure.rules;
  }

  /**
   * Applies the rules to a class or object, making them discoverable by the StandardValidator.
   *
   * @param target - A class or object.
   */
  public on(target: IValidateable) {
    return this.fluentEnsure.on(target);
  }
  // #endregion

  // #region FluentRules APIs

  /**
   * Applies an ad-hoc rule function to the ensured property or object.
   *
   * @param condition - The function to validate the rule.
   * Will be called with two arguments, the property value and the object.
   * Should return a boolean or a Promise that resolves to a boolean.
   */
  public satisfies(condition: RuleCondition, config?: object) {
    return this.fluentRules.satisfies(condition, config);
  }

  /**
   * Applies a rule by name.
   *
   * @param name - The name of the custom or standard rule.
   * @param args - The rule's arguments.
   */
  public satisfiesRule(name: string, ...args: any[]) {
    return this.fluentRules.satisfiesRule(name, ...args);
  }

  /**
   * Applies the "required" rule to the property.
   * The value cannot be null, undefined or whitespace.
   */
  public required() {
    return this.fluentRules.required();
  }

  /**
   * Applies the "matches" rule to the property.
   * Value must match the specified regular expression.
   * null, undefined and empty-string values are considered valid.
   */
  public matches(regex: RegExp) {
    return this.fluentRules.matches(regex);
  }

  /**
   * Applies the "email" rule to the property.
   * null, undefined and empty-string values are considered valid.
   */
  public email() {
    return this.fluentRules.email();
  }

  /**
   * Applies the "minLength" STRING validation rule to the property.
   * null, undefined and empty-string values are considered valid.
   */
  public minLength(length: number) {
    return this.fluentRules.minLength(length);
  }

  /**
   * Applies the "maxLength" STRING validation rule to the property.
   * null, undefined and empty-string values are considered valid.
   */
  public maxLength(length: number) {
    return this.fluentRules.maxLength(length);
  }

  /**
   * Applies the "minItems" ARRAY validation rule to the property.
   * null and undefined values are considered valid.
   */
  public minItems(count: number) {
    return this.fluentRules.minItems(count);
  }

  /**
   * Applies the "maxItems" ARRAY validation rule to the property.
   * null and undefined values are considered valid.
   */
  public maxItems(count: number) {
    return this.fluentRules.maxItems(count);
  }

  /**
   * Applies the "min" NUMBER validation rule to the property.
   * Value must be greater than or equal to the specified constraint.
   * null and undefined values are considered valid.
   */
  public min(value: number) {
    return this.fluentRules.min(value);
  }

  /**
   * Applies the "max" NUMBER validation rule to the property.
   * Value must be less than or equal to the specified constraint.
   * null and undefined values are considered valid.
   */
  public max(value: number) {
    return this.fluentRules.max(value);
  }

  /**
   * Applies the "range" NUMBER validation rule to the property.
   * Value must be between or equal to the specified min and max.
   * null and undefined values are considered valid.
   */
  public range(min: number, max: number) {
    return this.fluentRules.range(min, max);
  }

  /**
   * Applies the "between" NUMBER validation rule to the property.
   * Value must be between but not equal to the specified min and max.
   * null and undefined values are considered valid.
   */
  public between(min: number, max: number) {
    return this.fluentRules.between(min, max);
  }

  /**
   * Applies the "equals" validation rule to the property.
   * null, undefined and empty-string values are considered valid.
   */
  public equals(expectedValue: TValue) {
    return this.fluentRules.equals(expectedValue);
  }
  // #endregion
}

/**
 * Part of the fluent rule API. Enables applying rules to properties and objects.
 */
export class FluentRules<TValue> {
  public static customRules: {
    [name: string]: {
      condition: (value: any, object?: any, ...fluentArgs: any[]) => boolean | Promise<boolean>;
      argsToConfig?: (...args: any[]) => any;
    };
  } = {};

  /**
   * Current rule sequence number. Used to postpone evaluation of rules until rules
   * with lower sequence number have successfully validated. The "then" fluent API method
   * manages this property, there's usually no need to set it directly.
   */
  public sequence: number = 0;

  public constructor(
    private readonly fluentEnsure: ValidationRules,
    private readonly property: RuleProperty,
    private readonly messageProvider: IValidationMessageProvider,
  ) { }

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
    return new FluentRuleCustomizer<IValidateable, TValue>(
      this.property, condition, this.fluentEnsure, this, this.messageProvider, config);
  }

  /**
   * Applies a rule by name.
   *
   * @param name - The name of the custom or standard rule.
   * @param args - The rule's arguments.
   */
  public satisfiesRule(name: string, ...args: any[]): FluentRuleCustomizer<IValidateable, TValue> {
    let rule = FluentRules.customRules[name];
    if (!rule) {
      // standard rule?
      rule = (this as any)[name];
      if (rule instanceof Function) {
        return rule.call(this, ...args);
      }
      throw new Error(`Rule with name "${name}" does not exist.`);
    }
    const config = rule.argsToConfig ? rule.argsToConfig(...args) : undefined;
    return this.satisfies((value, obj) => rule.condition.call(this, value, obj, ...args), config)
      .withMessageKey(name);
  }

  /**
   * Applies the "required" rule to the property.
   * The value cannot be null, undefined or whitespace.
   */
  public required() {
    return this.satisfies(
      (value) =>
        value !== null
        && value !== undefined
        && !(typeof value === 'string' && !/\S/.test(value))
    ).withMessageKey('required');
  }

  /**
   * Applies the "matches" rule to the property.
   * Value must match the specified regular expression.
   * null, undefined and empty-string values are considered valid.
   */
  public matches(regex: RegExp) {
    return this.satisfies(
      async (value: string) => Promise.resolve(value === null || value === undefined || value.length === 0 || regex.test(value)))
      .withMessageKey('matches');
  }

  /**
   * Applies the "email" rule to the property.
   * null, undefined and empty-string values are considered valid.
   */
  public email() {
    // regex from https://html.spec.whatwg.org/multipage/forms.html#valid-e-mail-address
    // eslint-disable-next-line no-useless-escape
    return this.matches(/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/)
      /* tslint:enable:max-line-length */
      .withMessageKey('email');
  }

  /**
   * Applies the "minLength" STRING validation rule to the property.
   * null, undefined and empty-string values are considered valid.
   */
  public minLength(length: number) {
    return this.satisfies(
      async (value: string) => Promise.resolve(value === null || value === undefined || value.length === 0 || value.length >= length),
      { length })
      .withMessageKey('minLength');
  }

  /**
   * Applies the "maxLength" STRING validation rule to the property.
   * null, undefined and empty-string values are considered valid.
   */
  public maxLength(length: number) {
    return this.satisfies(
      async (value: string) => Promise.resolve(value === null || value === undefined || value.length === 0 || value.length <= length),
      { length })
      .withMessageKey('maxLength');
  }

  /**
   * Applies the "minItems" ARRAY validation rule to the property.
   * null and undefined values are considered valid.
   */
  public minItems(count: number) {
    return this.satisfies(async (value: any[]) => Promise.resolve(value === null || value === undefined || value.length >= count), { count })
      .withMessageKey('minItems');
  }

  /**
   * Applies the "maxItems" ARRAY validation rule to the property.
   * null and undefined values are considered valid.
   */
  public maxItems(count: number) {
    return this.satisfies(async (value: any[]) => Promise.resolve(value === null || value === undefined || value.length <= count), { count })
      .withMessageKey('maxItems');
  }

  /**
   * Applies the "min" NUMBER validation rule to the property.
   * Value must be greater than or equal to the specified constraint.
   * null and undefined values are considered valid.
   */
  public min(constraint: number) {
    return this.satisfies(async (value?: number) => Promise.resolve(value === null || value === undefined || value >= constraint), { constraint })
      .withMessageKey('min');
  }

  /**
   * Applies the "max" NUMBER validation rule to the property.
   * Value must be less than or equal to the specified constraint.
   * null and undefined values are considered valid.
   */
  public max(constraint: number) {
    return this.satisfies(async (value?: number) => Promise.resolve(value === null || value === undefined || value <= constraint), { constraint })
      .withMessageKey('max');
  }

  /**
   * Applies the "range" NUMBER validation rule to the property.
   * Value must be between or equal to the specified min and max.
   * null and undefined values are considered valid.
   */
  public range(min: number, max: number) {
    return this.satisfies(async (value?: number) => Promise.resolve(value === null || value === undefined || (value >= min && value <= max)),
      { min, max })
      .withMessageKey('range');
  }

  /**
   * Applies the "between" NUMBER validation rule to the property.
   * Value must be between but not equal to the specified min and max.
   * null and undefined values are considered valid.
   */
  public between(min: number, max: number) {
    return this.satisfies(async (value?: number) => Promise.resolve(value === null || value === undefined || (value > min && value < max)),
      { min, max })
      .withMessageKey('between');
  }

  /**
   * Applies the "equals" validation rule to the property.
   * null and undefined values are considered valid.
   */
  public equals(expectedValue: TValue) {
    return this.satisfies(
      async (value) => Promise.resolve(value === null || value === undefined || value as any === '' || value === expectedValue),
      { expectedValue })
      .withMessageKey('equals');
  }
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
   * Target a property with validation rules.
   *
   * @param property - The property to target. Can be the property name or a property accessor function.
   */
  public static ensure<TObject, TValue>(property: string | number | PropertyAccessor<TObject, TValue>) {
    return new ValidationRules().ensure(property);
  }

  /**
   * Targets an object with validation rules.
   */
  public static ensureObject<TObject>() {
    return new ValidationRules().ensureObject();
  }

  /**
   * Defines a custom rule.
   *
   * @param name - The name of the custom rule. Also serves as the message key.
   * @param condition - The rule function.
   * @param message - The message expression
   * @param argsToConfig - A function that maps the rule's arguments to a "config"
   * object that can be used when evaluating the message expression.
   */
  public static customRule(
    name: string,
    condition: (value: any, object?: any, ...args: any[]) => boolean | Promise<boolean>,
    message: string,
    argsToConfig?: (...args: any[]) => any
  ) {
    validationMessages[name] = message;
    FluentRules.customRules[name] = { condition, argsToConfig };
  }

  /**
   * Returns rules with the matching tag.
   *
   * @param rules - The rules to search.
   * @param tag - The tag to search for.
   */
  public static taggedRules(rules: Rule[][], tag: string): Rule[][] {
    return rules.map(x => x.filter(r => r.tag === tag));
  }

  /**
   * Returns rules that have no tag.
   *
   * @param rules - The rules to search.
   */
  public static untaggedRules(rules: Rule[][]): Rule[][] {
    return rules.map(x => x.filter(r => r.tag === undefined));
  }

  /**
   * Removes the rules from a class or object.
   *
   * @param target - A class or object.
   */
  public static off(target: IValidateable): void {
    Rules.unset(target);
  }

  /**
   * Rules that have been defined using the fluent API.
   */
  public rules: Rule[][] = [];

  /**
   * Target a property with validation rules.
   *
   * @param property - The property to target. Can be the property name or a property accessor
   * function.
   */
  public ensure<TValue>(property: string | number | PropertyAccessor<IValidateable, TValue>): FluentRules<any> {
    this.assertInitialized();
    const name = ValidationRules.propertyParser.parse(property);
    const fluentRules = new FluentRules<TValue>(
      this,
      new RuleProperty(name),
      ValidationRules.messageProvider,
    );
    return this.mergeRules(fluentRules, name);
  }

  /**
   * Targets an object with validation rules.
   */
  public ensureObject(): FluentRules<any> {
    this.assertInitialized();
    const fluentRules = new FluentRules<IValidateable>(this, new RuleProperty(), ValidationRules.messageProvider);
    return this.mergeRules(fluentRules, null);
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

  /**
   * Adds a rule definition to the sequenced ruleset.
   *
   * @internal
   */
  public _addRule(rule: Rule) {
    while (this.rules.length < rule.sequence + 1) {
      this.rules.push([]);
    }
    this.rules[rule.sequence].push(rule);
  }

  private assertInitialized() {
    if (ValidationRules.messageProvider === void 0 || ValidationRules.propertyParser === void 0) {
      return;
    }
    throw new Error(`Did you forget to register 'ValidationConfiguration' from '@aurelia/validation'?`);
  }

  private mergeRules(fluentRules: FluentRules<any>, propertyName: string | number | null) {
    // eslint-disable-next-line eqeqeq
    const existingRules = this.rules.find(r => r.length > 0 && r[0].property.name == propertyName);
    if (existingRules !== void 0) {
      const rule = existingRules[existingRules.length - 1];
      fluentRules.sequence = rule.sequence;
      if (rule.property.displayName !== null) {
        fluentRules = fluentRules.displayName(rule.property.displayName);
      }
    }
    return fluentRules;
  }
}
