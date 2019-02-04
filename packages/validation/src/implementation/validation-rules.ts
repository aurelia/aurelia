import { PropertyAccessor, PropertyAccessorParser } from '../property-accessor-parser';
import { isString } from '../util';
import { Rule, RuleProperty, ValidationDisplayNameAccessor } from './rule';
import { Rules } from './rules';
import { ValidationMessageParser } from './validation-message-parser';
import { validationMessages } from './validation-messages';

/**
 * Part of the fluent rule API. Enables customizing property rules.
 */
export class FluentRuleCustomizer<TObject, TValue> {
  private rule: Rule<TObject, TValue>;

  constructor(
    property: RuleProperty,
    condition: (value: TValue, object?: TObject) => boolean | Promise<boolean>,
    config: object = {},
    private fluentEnsure: FluentEnsure<TObject>,
    private fluentRules: FluentRules<TObject, TValue>,
    private parsers: Parsers
  ) {
    this.rule = {
      property,
      condition,
      config,
      when: null,
      messageKey: 'default',
      message: null,
      sequence: fluentRules.sequence
    };
    this.fluentEnsure._addRule(this.rule);
  }

  /**
   * Validate subsequent rules after previously declared rules have
   * been validated successfully. Use to postpone validation of costly
   * rules until less expensive rules pass validation.
   */
  public then(): this {
    this.fluentRules.sequence++;
    return this;
  }

  /**
   * Specifies the key to use when looking up the rule's validation message.
   */
  public withMessageKey(key: string): this {
    this.rule.messageKey = key;
    this.rule.message = null;
    return this;
  }

  /**
   * Specifies rule's validation message.
   */
  public withMessage(message: string): this {
    this.rule.messageKey = 'custom';
    this.rule.message = this.parsers.message.parse(message);
    return this;
  }

  /**
   * Specifies a condition that must be met before attempting to validate the rule.
   * @param condition A function that accepts the object as a parameter and returns true
   * or false whether the rule should be evaluated.
   */
  public when(condition: (object: TObject) => boolean): this {
    this.rule.when = condition;
    return this;
  }

  /**
   * Tags the rule instance, enabling the rule to be found easily
   * using ValidationRules.taggedRules(rules, tag)
   */
  public tag(tag: string): this {
    this.rule.tag = tag;
    return this;
  }

  ///// FluentEnsure APIs /////

  /**
   * Target a property with validation rules.
   * @param property The property to target. Can be the property name or a property accessor function.
   */
  public ensure<TValue2, TValue3 = any>(subject: string | ((model: TObject) => TValue2)): FluentRules<TObject, TValue3> {
    return this.fluentEnsure.ensure<TValue2>(subject);
  }

  /**
   * Targets an object with validation rules.
   */
  public ensureObject<TValue3 = any>(): FluentRules<TObject, TValue3> {
    return this.fluentEnsure.ensureObject();
  }

  /**
   * Rules that have been defined using the fluent API.
   */
  public get rules(): Rule<TObject, any>[][] {
    return this.fluentEnsure.rules;
  }

  /**
   * Applies the rules to a class or object, making them discoverable by the StandardValidator.
   * @param target A class or object.
   */
  public on(target: any): FluentEnsure<TObject> {
    return this.fluentEnsure.on(target);
  }

  ///////// FluentRules APIs /////////

  /**
   * Applies an ad-hoc rule function to the ensured property or object.
   * @param condition The function to validate the rule.
   * Will be called with two arguments, the property value and the object.
   * Should return a boolean or a Promise that resolves to a boolean.
   */
  public satisfies(condition: (value: TValue, object: TObject) => boolean | Promise<boolean>, config?: object) {
    return this.fluentRules.satisfies(condition, config);
  }

  /**
   * Applies a rule by name.
   * @param name The name of the custom or standard rule.
   * @param args The rule's arguments.
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
   * Applies the "equals" validation rule to the property.
   * null, undefined and empty-string values are considered valid.
   */
  public equals(expectedValue: TValue) {
    return this.fluentRules.equals(expectedValue);
  }
}

/**
 * Part of the fluent rule API. Enables applying rules to properties and objects.
 */
export class FluentRules<TObject, TValue> {
  public static customRules: {
    [name: string]: {
      condition: (value: any, object?: any, ...fluentArgs: any[]) => boolean | Promise<boolean>;
      argsToConfig?: (...args: any[]) => any;
    }
  } = {};

  /**
   * Current rule sequence number. Used to postpone evaluation of rules until rules
   * with lower sequence number have successfully validated. The "then" fluent API method
   * manages this property, there's usually no need to set it directly.
   */
  public sequence = 0;

  constructor(
    private fluentEnsure: FluentEnsure<TObject>,
    private parsers: Parsers,
    private property: RuleProperty
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
   * @param condition The function to validate the rule.
   * Will be called with two arguments, the property value and the object.
   * Should return a boolean or a Promise that resolves to a boolean.
   */
  public satisfies(condition: (value: TValue, object?: TObject) => boolean | Promise<boolean>, config?: object) {
    return new FluentRuleCustomizer<TObject, TValue>(
      this.property, condition, config, this.fluentEnsure, this, this.parsers);
  }

  /**
   * Applies a rule by name.
   * @param name The name of the custom or standard rule.
   * @param args The rule's arguments.
   */
  public satisfiesRule(name: string, ...args: any[]): FluentRuleCustomizer<TObject, TValue> {
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
      value =>
        value !== null
        && value !== undefined
        && !(isString(value) && !/\S/.test(value as any))
    ).withMessageKey('required');
  }

  /**
   * Applies the "matches" rule to the property.
   * Value must match the specified regular expression.
   * null, undefined and empty-string values are considered valid.
   */
  public matches(regex: RegExp) {
    return this.satisfies(
      value => value === null || value === undefined || (value as any).length === 0 || regex.test(value as any))
      .withMessageKey('matches');
  }

  /**
   * Applies the "email" rule to the property.
   * null, undefined and empty-string values are considered valid.
   */
  public email() {
    // regex from https://html.spec.whatwg.org/multipage/forms.html#valid-e-mail-address
    /* tslint:disable:max-line-length */
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
      (value: any) => value === null || value === undefined || value.length === 0 || value.length >= length,
      { length })
      .withMessageKey('minLength');
  }

  /**
   * Applies the "maxLength" STRING validation rule to the property.
   * null, undefined and empty-string values are considered valid.
   */
  public maxLength(length: number) {
    return this.satisfies(
      (value: any) => value === null || value === undefined || value.length === 0 || value.length <= length,
      { length })
      .withMessageKey('maxLength');
  }

  /**
   * Applies the "minItems" ARRAY validation rule to the property.
   * null and undefined values are considered valid.
   */
  public minItems(count: number) {
    return this.satisfies((value: any) => value === null || value === undefined || value.length >= count, { count })
      .withMessageKey('minItems');
  }

  /**
   * Applies the "maxItems" ARRAY validation rule to the property.
   * null and undefined values are considered valid.
   */
  public maxItems(count: number) {
    return this.satisfies((value: any) => value === null || value === undefined || value.length <= count, { count })
      .withMessageKey('maxItems');
  }

  /**
   * Applies the "equals" validation rule to the property.
   * null and undefined values are considered valid.
   */
  public equals(expectedValue: TValue) {
    return this.satisfies(
      value => value === null || value === undefined || value as any === '' || value === expectedValue,
      { expectedValue })
      .withMessageKey('equals');
  }
}

/**
 * Part of the fluent rule API. Enables targeting properties and objects with rules.
 */
export class FluentEnsure<TObject> {
  /**
   * Rules that have been defined using the fluent API.
   */
  public rules: Rule<TObject, any>[][] = [];

  constructor(private parsers: Parsers) { }

  /**
   * Target a property with validation rules.
   * @param property The property to target. Can be the property name or a property accessor
   * function.
   */
  public ensure<TValue>(property: string | number | PropertyAccessor<TObject, TValue>) {
    this.assertInitialized();
    const name = this.parsers.property.parse(property);
    const fluentRules = new FluentRules<TObject, TValue>(
      this,
      this.parsers,
      { name, displayName: null });
    return this.mergeRules(fluentRules, name);
  }

  /**
   * Targets an object with validation rules.
   */
  public ensureObject() {
    this.assertInitialized();
    const fluentRules = new FluentRules<TObject, TObject>(
      this, this.parsers, { name: null, displayName: null });
    return this.mergeRules(fluentRules, null);
  }

  /**
   * Applies the rules to a class or object, making them discoverable by the StandardValidator.
   * @param target A class or object.
   */
  public on(target: any) {
    Rules.set(target, this.rules);
    return this;
  }

  /**
   * Adds a rule definition to the sequenced ruleset.
   * @internal
   */
  public _addRule(rule: Rule<TObject, any>) {
    while (this.rules.length < rule.sequence + 1) {
      this.rules.push([]);
    }
    this.rules[rule.sequence].push(rule);
  }

  private assertInitialized() {
    if (this.parsers) {
      return;
    }
    throw new Error(`Did you forget to add ".plugin('aurelia-validation')" to your main.js?`);
  }

  private mergeRules(fluentRules: FluentRules<TObject, any>, propertyName: string | number | null) {
    // tslint:disable-next-line:triple-equals | Use loose equality for property keys
    const existingRules = this.rules.find(r => r.length > 0 && r[0].property.name == propertyName);
    if (existingRules) {
      const rule = existingRules[existingRules.length - 1];
      fluentRules.sequence = rule.sequence;
      if (rule.property.displayName !== null) {
        fluentRules = fluentRules.displayName(rule.property.displayName);
      }
    }
    return fluentRules;
  }
}

/**
 * Fluent rule definition API.
 */
export class ValidationRules {
  private static parsers: Parsers;

  public static initialize(messageParser: ValidationMessageParser, propertyParser: PropertyAccessorParser) {
    this.parsers = {
      message: messageParser,
      property: propertyParser
    };
  }

  /**
   * Target a property with validation rules.
   * @param property The property to target. Can be the property name or a property accessor function.
   */
  public static ensure<TObject, TValue>(property: string | number | PropertyAccessor<TObject, TValue>) {
    return new FluentEnsure<TObject>(ValidationRules.parsers).ensure(property);
  }

  /**
   * Targets an object with validation rules.
   */
  public static ensureObject<TObject>() {
    return new FluentEnsure<TObject>(ValidationRules.parsers).ensureObject();
  }

  /**
   * Defines a custom rule.
   * @param name The name of the custom rule. Also serves as the message key.
   * @param condition The rule function.
   * @param message The message expression
   * @param argsToConfig A function that maps the rule's arguments to a "config"
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
   * @param rules The rules to search.
   * @param tag The tag to search for.
   */
  public static taggedRules(rules: Rule<any, any>[][], tag: string): Rule<any, any>[][] {
    return rules.map(x => x.filter(r => r.tag === tag));
  }

  /**
   * Returns rules that have no tag.
   * @param rules The rules to search.
   */
  public static untaggedRules(rules: Rule<any, any>[][]): Rule<any, any>[][] {
    return rules.map(x => x.filter(r => r.tag === undefined));
  }

  /**
   * Removes the rules from a class or object.
   * @param target A class or object.
   */
  public static off(target: any): void {
    Rules.unset(target);
  }
}

export interface Parsers {
  message: ValidationMessageParser;
  property: PropertyAccessorParser;
}
