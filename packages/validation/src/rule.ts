import { Class, DI, Protocol, Constructable, Metadata } from '@aurelia/kernel';
import {
  BindingType,
  IExpressionParser,
  IInterpolationExpression,
  IsBindingBehavior,
  LifecycleFlags,
  PrimitiveLiteralExpression,
  Interpolation,
} from '@aurelia/runtime';
import { IValidationMessageProvider } from './validation-messages';

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
    public expression?: IsBindingBehavior,
    public name: string | number | undefined = void 0,
    public displayName: string | ValidationDisplayNameAccessor | undefined = void 0,
  ) { }
}
export type RuleCondition<TObject extends IValidateable = IValidateable, TValue = any> = (value: TValue, object?: TObject) => boolean | Promise<boolean>;

/** @internal */
export const validationRules = Object.freeze({
  name: 'validation-rules',
  key: Protocol.annotation.keyFor('validation-rules'),
  set(target: IValidateable, rules: PropertyRule[]): void {
    if (target instanceof Function) {
      const key = validationRules.name;
      Protocol.annotation.set(target as Constructable, key, rules);
      Protocol.annotation.appendTo(target as Constructable, key);
    } else {
      Metadata.define(validationRules.key, rules, target);
    }
  },
  get(target: IValidateable): PropertyRule[] {
    return target instanceof Function
      ? Protocol.annotation.get(target as Constructable, validationRules.name)
      : Metadata.getOwn(validationRules.key, target);
  },
  unset(target: IValidateable): void {
    if (!(target instanceof Function)) {
      Metadata.delete(validationRules.key, target);
    }
  }
});

export type ValidationRuleExecutionPredicate = (object?: IValidateable) => boolean;

export abstract class ValidationRule<TValue = any, TObject extends IValidateable = IValidateable> {
  public tag?: string = (void 0)!;
  protected _message: IInterpolationExpression | PrimitiveLiteralExpression = (void 0)!;

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
    console.log(this._message);
  }

  public constructor(protected readonly messageProvider: IValidationMessageProvider) { }

  public canExecute: ValidationRuleExecutionPredicate = () => true;
  public abstract execute(value: TValue, object?: TObject): boolean | Promise<boolean>;
}

export class RequiredRule extends ValidationRule {
  protected _messageKey: string = 'required';
  public execute(value: unknown): boolean | Promise<boolean> {
    return value !== null
      && value !== undefined
      && !(typeof value === 'string' && !/\S/.test(value));
  }
}
export class RegexRule extends ValidationRule<string> {

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
export class LengthRule extends ValidationRule<string> {

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
export class SizeRule extends ValidationRule<unknown[]> {

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
export class RangeRule extends ValidationRule<number> {

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
export class EqualsRule extends ValidationRule {
  protected _messageKey: string = 'equals';
  public constructor(
    messageProvider: IValidationMessageProvider,
    private readonly expectedValue: unknown,
  ) { super(messageProvider); }
  public execute(value: unknown): boolean | Promise<boolean> {
    return value === null || value === undefined || value as any === '' || value === this.expectedValue;
  }
}

export class PropertyRule<TObject extends IValidateable = IValidateable, TValue = unknown> {

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
    public $rules: ValidationRule[][] = [[]],
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

  public async validate(value: TValue, object?: IValidateable): Promise<ValidationResult[]> {

    let isValid = true;
    const validateRuleset = async (rules: ValidationRule[]) => {
      const validateRule = async (rule: ValidationRule) => {
        let isValidOrPromise = rule.execute(value, object);
        if (isValidOrPromise instanceof Promise) {
          isValidOrPromise = await isValidOrPromise;
        }
        isValid = isValid && isValidOrPromise;
        const message = rule.message.evaluate(
          LifecycleFlags.none,
          { bindingContext: object!, parentScope: null, scopeParts: [], overrideContext: (void 0)! }
          , null!) as string;
        return new ValidationResult(rule, object, this.property.name, isValidOrPromise, message);
      };

      const promises: Promise<ValidationResult>[] = [];
      for (const rule of rules) {
        if (rule.canExecute(object)) {
          promises.push(validateRule(rule));
        }
      }
      return Promise.all(promises);
    };
    const accumulateResult = async (results: ValidationResult[], rules: ValidationRule[]) => {
      const result = await validateRuleset(rules);
      results.push(...result);
      return results;
    };
    return this.$rules.reduce(async (acc, ruleset) => {
      if (isValid) {
        acc = acc.then(async (accValidateResult) => accumulateResult(accValidateResult, ruleset));
      }
      return acc;
    }, Promise.resolve([] as ValidationResult[]));
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
  public displayName(name: string | ValidationDisplayNameAccessor) {
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
  public matches(this: PropertyRule<TObject, string>, regex: RegExp) {
    return this.addRule(new RegexRule(this.messageProvider, regex));
  }

  /**
   * Applies the "email" rule to the property.
   * null, undefined and empty-string values are considered valid.
   */
  public email(this: PropertyRule<TObject, string>) {
    // eslint-disable-next-line no-useless-escape
    const emailPattern = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return this.addRule(new RegexRule(this.messageProvider, emailPattern, 'email'));
  }

  /**
   * Applies the "minLength" STRING validation rule to the property.
   * null, undefined and empty-string values are considered valid.
   */
  public minLength(this: PropertyRule<TObject, string>, length: number) {
    return this.addRule(new LengthRule(this.messageProvider, length, false));
  }

  /**
   * Applies the "maxLength" STRING validation rule to the property.
   * null, undefined and empty-string values are considered valid.
   */
  public maxLength(this: PropertyRule<TObject, string>, length: number) {
    return this.addRule(new LengthRule(this.messageProvider, length, true));
  }

  /**
   * Applies the "minItems" ARRAY validation rule to the property.
   * null and undefined values are considered valid.
   */
  public minItems(this: PropertyRule<TObject, unknown[]>, count: number) {
    return this.addRule(new SizeRule(this.messageProvider, count, false));
  }

  /**
   * Applies the "maxItems" ARRAY validation rule to the property.
   * null and undefined values are considered valid.
   */
  public maxItems(this: PropertyRule<TObject, unknown[]>, count: number) {
    return this.addRule(new SizeRule(this.messageProvider, count, true));
  }

  /**
   * Applies the "min" NUMBER validation rule to the property.
   * Value must be greater than or equal to the specified constraint.
   * null and undefined values are considered valid.
   */
  public min(this: PropertyRule<TObject, number>, constraint: number) {
    return this.addRule(new RangeRule(this.messageProvider, true, { min: constraint }));
  }

  /**
   * Applies the "max" NUMBER validation rule to the property.
   * Value must be less than or equal to the specified constraint.
   * null and undefined values are considered valid.
   */
  public max(this: PropertyRule<TObject, number>, constraint: number) {
    return this.addRule(new RangeRule(this.messageProvider, true, { max: constraint }));
  }

  /**
   * Applies the "range" NUMBER validation rule to the property.
   * Value must be between or equal to the specified min and max.
   * null and undefined values are considered valid.
   */
  public range(this: PropertyRule<TObject, number>, min: number, max: number) {
    return this.addRule(new RangeRule(this.messageProvider, true, { min, max }));
  }

  /**
   * Applies the "between" NUMBER validation rule to the property.
   * Value must be between but not equal to the specified min and max.
   * null and undefined values are considered valid.
   */
  public between(this: PropertyRule<TObject, number>, min: number, max: number) {
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
  public ensure<TProp extends keyof TObject>(property: TProp): PropertyRule<TObject, TObject[TProp]>;
  public ensure<TValue>(property: PropertyAccessor<TObject, TValue>): PropertyRule<TObject, TValue>;
  public ensure(property: string): PropertyRule;
  public ensure<TValue>(property: string | PropertyAccessor<TObject, TValue>) {
    this.latestRule = void 0;
    return this.validationRules.ensure<TValue>(property);
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

export interface IValidationRules<TObject extends IValidateable = IValidateable> {
  rules: PropertyRule[];
  ensure<TProp extends keyof TObject>(property: TProp): PropertyRule<TObject, TObject[TProp]>;
  ensure<TValue>(property: PropertyAccessor<TObject, TValue>): PropertyRule<TObject, TValue>;
  ensure(property: string): PropertyRule;
  ensureObject(): PropertyRule;
  on<TAnotherObject extends IValidateable = IValidateable>(target: Class<TAnotherObject>): IValidationRules<TAnotherObject>;
  on<TAnotherObject extends IValidateable = IValidateable>(target: TAnotherObject): IValidationRules<TAnotherObject>;
}
export const IValidationRules = DI.createInterface<IValidationRules>('IValidationRules').noDefault();

/**
 * Part of the fluent rule API. Enables targeting properties and objects with rules.
 */
export class ValidationRules<TObject extends IValidateable = IValidateable> implements IValidationRules<TObject> {
  // /**
  //  * Returns rules with the matching tag.
  //  *
  //  * @param rules - The rules to search.
  //  * @param tag - The tag to search for.
  //  */
  // public static taggedRules(rules: PropertyRule[], tag: string): PropertyRule[] {
  //   return rules.map(rule => rule.getTagedRules(tag));
  // }

  // /**
  //  * Returns rules that have no tag.
  //  *
  //  * @param rules - The rules to search.
  //  */
  // public static untaggedRules(rules: PropertyRule[]): PropertyRule[][] {
  //   return rules.map(rule => rule.getTagedRules(void 0));
  // }

  // /**
  //  * Removes the rules from a class or object.
  //  *
  //  * @param target - A class or object.
  //  */
  // public static off(target: IValidateable): void {
  //   Rules.unset(target);
  // }

  public rules: PropertyRule[] = [];
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IValidationMessageProvider private readonly messageProvider: IValidationMessageProvider,
  ) { }

  /**
   * Target a property with validation rules.
   *
   * @param property - The property to target. Can be the property name or a property accessor
   * function.
   */
  public ensure<TValue>(property: keyof TObject | string | PropertyAccessor): PropertyRule {
    // this.assertInitialized();
    const [name, expression] = parsePropertyName(property as any, this.parser);
    // eslint-disable-next-line eqeqeq
    let rule = this.rules.find((r) => r.property.name == name);
    if (rule === void 0) {
      rule = new PropertyRule(this, this.messageProvider, new RuleProperty(expression, name));
      this.rules.push(rule);
    }
    return rule;
  }

  /**
   * Targets an object with validation rules.
   */
  public ensureObject(): PropertyRule {
    // this.assertInitialized();
    const rule = new PropertyRule(this, this.messageProvider, new RuleProperty());
    this.rules.push(rule);
    return rule;
  }

  /**
   * Applies the rules to a class or object, making them discoverable by the StandardValidator.
   *
   * @param target - A class or object.
   */
  public on(target: IValidateable) {
    validationRules.set(target, this.rules);
    return this;
  }
}

export type PropertyAccessor<TObject extends IValidateable = IValidateable, TValue = unknown> = (object: TObject) => TValue;
/** @internal */
export function parsePropertyName(property: string | PropertyAccessor, parser: IExpressionParser): [string, IsBindingBehavior] {

  switch (typeof property) {
    case "string":
      break;
    case "function": {
      const classic = /^function\s*\([$_\w\d]+\)\s*\{(?:\s*"use strict";)?\s*(?:[$_\w\d.['"\]+;]+)?\s*return\s+[$_\w\d]+((\.[$_\w\d]+)+)\s*;?\s*\}$/;
      const arrow = /^\(?[$_\w\d]+\)?\s*=>\s*[$_\w\d]+((\.[$_\w\d]+)+)$/;
      const fn = property.toString();
      const match = classic.exec(fn) ?? arrow.exec(fn);
      if (match === null) {
        throw new Error(`Unable to parse accessor function:\n${fn}`); // TODO use reporter
      }
      property = match[1].substring(1);
      break;
    }
    default:
      throw new Error(`Unable to parse accessor function:\n${property}`); // TODO use reporter
  }

  return [property, parser.parse(property, BindingType.None)];
}

/**
 * The result of validating an individual validation rule.
 */
export class ValidationResult {
  private static nextId = 0;

  /**
   * A number that uniquely identifies the result instance.
   */
  public id: number;

  /**
   * @param rule - The rule associated with the result. Validator implementation specific.
   * @param object - The object that was validated.
   * @param propertyName - The name of the property that was validated.
   * @param error - The error, if the result is a validation error.
   */
  public constructor(
    public rule: any,
    public object: any,
    public propertyName: string | number | undefined, // TODO recheck if we need propertyName at this level
    public valid: boolean,
    public message: string | null = null
  ) {
    this.id = ValidationResult.nextId++;
  }

  public toString() {
    return this.valid ? 'Valid.' : this.message;
  }
}
