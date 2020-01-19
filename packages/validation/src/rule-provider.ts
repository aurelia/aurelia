/* eslint-disable no-template-curly-in-string */
import { Class, DI, Protocol, Constructable, Metadata, ILogger } from '@aurelia/kernel';
import {
  BindingType,
  IExpressionParser,
  IInterpolationExpression,
  IsBindingBehavior,
  LifecycleFlags,
  PrimitiveLiteralExpression,
  Interpolation,
  AccessScopeExpression,
  AccessThisExpression,
} from '@aurelia/runtime';
import {
  BaseValidationRule,
  ValidationRuleAlias,
  RequiredRule,
  RegexRule,
  LengthRule,
  SizeRule,
  RangeRule,
  EqualsRule,
  IValidateable,
  IValidationMessageProvider,
  ValidationRuleAliasMessage,
  ValidationRuleExecutionPredicate
} from './rules';

export interface ICustomMessage<T extends BaseValidationRule = BaseValidationRule> {
  rule: new (...args: any[]) => T;
  aliases: ValidationRuleAlias[];
}

/* @internal */
export const ICustomMessages = DI.createInterface<ICustomMessage[]>("ICustomMessages").noDefault();

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

export class PropertyRule<TObject extends IValidateable = IValidateable, TValue = unknown> {

  private latestRule?: BaseValidationRule;

  public constructor(
    public readonly validationRules: ValidationRules,
    public readonly messageProvider: IValidationMessageProvider,
    public property: RuleProperty,
    public $rules: BaseValidationRule[][] = [[]],
  ) { }

  /** @internal */
  public addRule(rule: BaseValidationRule) {
    const rules: BaseValidationRule[] = this.getLeafRules();
    rules.push(this.latestRule = rule);
    return this;
  }

  private getLeafRules(): BaseValidationRule[] {
    const depth = this.$rules.length - 1;
    return this.$rules[depth];
  }

  public async validate(value: TValue, object?: IValidateable): Promise<ValidationResult[]> {

    let isValid = true;
    const validateRuleset = async (rules: BaseValidationRule[]) => {
      const validateRule = async (rule: BaseValidationRule) => {
        let isValidOrPromise = rule.execute(value, object);
        if (isValidOrPromise instanceof Promise) {
          isValidOrPromise = await isValidOrPromise;
        }
        isValid = isValid && isValidOrPromise;
        const { displayName, name } = this.property;
        let message: string | undefined;
        if (!isValidOrPromise) {
          const scope = {
            bindingContext: {
              $object: object,
              $displayName: displayName instanceof Function ? displayName() : displayName,
              $propertyName: name,
              $value: value,
              $rule: rule,
              $getDisplayName: this.messageProvider.getDisplayName
            }, parentScope: null, scopeParts: [], overrideContext: (void 0)!
          };
          message = rule.message.evaluate(LifecycleFlags.none, scope, null!) as string;
        }
        return new ValidationResult(isValidOrPromise, message, name, object, rule, this);
      };

      const promises: Promise<ValidationResult>[] = [];
      for (const rule of rules) {
        if (rule.canExecute(object)) {
          promises.push(validateRule(rule));
        }
      }
      return Promise.all(promises);
    };
    const accumulateResult = async (results: ValidationResult[], rules: BaseValidationRule[]) => {
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

  private assertLatesRule(latestRule: BaseValidationRule | undefined): asserts latestRule is BaseValidationRule {
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
    const rule = new (class extends BaseValidationRule { public execute: RuleCondition = condition; })(this.messageProvider);
    return this.addRule(rule);
  }

  /**
   * Applies a rule by name.
   *
   * @param name - The name of the custom or standard rule.
   * @param args - The rule's arguments.
   */
  public satisfiesRule(validationRule: BaseValidationRule) {
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
  public on<TAnotherObject extends IValidateable = IValidateable>(target: Class<TAnotherObject> | TAnotherObject): IValidationRules<TAnotherObject>;
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
  on<TAnotherObject extends IValidateable = IValidateable>(target: Class<TAnotherObject> | TAnotherObject): IValidationRules<TAnotherObject>;
  off<TAnotherObject extends IValidateable = IValidateable>(target?: Class<TAnotherObject> | TAnotherObject): void;
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
  public rules: PropertyRule[] = [];
  private readonly targets: Set<IValidateable> = new Set<IValidateable>();

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
    const rules = validationRules.get(target);
    if (Object.is(rules, this.rules)) {
      return this;
    }
    this.rules = rules ?? [];
    validationRules.set(target, this.rules);
    this.targets.add(target);
    return this;
  }

  /**
   * Removes the rules from a class or object.
   *
   * @param target - A class or object.
   */
  public off(target?: IValidateable): void {
    const $targets = target !== void 0 ? [target] : Array.from(this.targets);
    for (const $target of $targets) {
      validationRules.unset($target);
      this.targets.delete($target);
    }
  }
}

export type PropertyAccessor<TObject extends IValidateable = IValidateable, TValue = unknown> = (object: TObject) => TValue;
export function parsePropertyName(property: string | PropertyAccessor, parser: IExpressionParser): [string, IsBindingBehavior] {

  switch (typeof property) {
    case "string":
      break;
    case "function": {
      const classic = /^function\s*\([$_\w\d]+\)\s*\{(?:\s*["']{1}use strict["']{1};)?\s*(?:[$_\w\d.['"\]+;]+)?\s*return\s+[$_\w\d]+((\.[$_\w\d]+|\[['"$_\w\d]+\])+)\s*;?\s*\}$/;
      const arrow = /^\(?[$_\w\d]+\)?\s*=>\s*[$_\w\d]+((\.[$_\w\d]+|\[['"$_\w\d]+\])+)$/;
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
export class ValidationResult<TRule extends BaseValidationRule = BaseValidationRule> {
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
    public valid: boolean,
    public message: string | undefined,
    public propertyName: string | number | undefined, // TODO recheck if we need propertyName at this level
    public object: IValidateable | undefined,
    public rule: TRule | undefined,
    public propertyRule: PropertyRule | undefined,
    public isManual: boolean = false
  ) {
    this.id = ValidationResult.nextId++;
  }

  public toString() {
    return this.valid ? 'Valid.' : this.message;
  }
}

const contextualProperties: Readonly<Set<string>> = new Set([
  "displayName",
  "propertyName",
  "value",
  "object",
  "config",
  "getDisplayName"
]);
/**
 * Retrieves validation messages and property display names.
 */
export class ValidationMessageProvider implements IValidationMessageProvider {

  // TODO move the messages to rules as well as facilitate having custom message registration
  protected defaultMessages: Record<string, string> = {
    /**
     * The default validation message. Used with rules that have no standard message.
     */
    default: `\${$displayName} is invalid.`,
    required: `\${$displayName} is required.`,
    matches: `\${$displayName} is not correctly formatted.`,
    email: `\${$displayName} is not a valid email.`,
    minLength: `\${$displayName} must be at least \${$rule.length} character\${$rule.length === 1 ? '' : 's'}.`,
    maxLength: `\${$displayName} cannot be longer than \${$rule.length} character\${$rule.length === 1 ? '' : 's'}.`,
    minItems: `\${$displayName} must contain at least \${$rule.count} item\${$rule.count === 1 ? '' : 's'}.`,
    maxItems: `\${$displayName} cannot contain more than \${$rule.count} item\${$rule.count === 1 ? '' : 's'}.`,
    min: `\${$displayName} must be at least \${$rule.min}.`,
    max: `\${$displayName} must be at most \${$rule.max}.`,
    range: `\${$displayName} must be between or equal to \${$rule.min} and \${$rule.max}.`,
    between: `\${$displayName} must be between but not equal to \${$rule.min} and \${$rule.max}.`,
    equals: `\${$displayName} must be \${$rule.expectedValue}.`,
  };
  private readonly logger: ILogger;

  public constructor(
    @IExpressionParser public parser: IExpressionParser,
    @ILogger logger: ILogger,
    @ICustomMessages customMessages: ICustomMessage[],
  ) {
    this.logger = logger.scopeTo(ValidationMessageProvider.name);
    for (const { rule, aliases } of customMessages) {
      ValidationRuleAliasMessage.setDefaultMessage(rule, { aliases });
    }
  }

  /**
   * Returns a message binding expression that corresponds to the key.
   */
  public getMessage(rule: BaseValidationRule): IInterpolationExpression | PrimitiveLiteralExpression {
    const validationMessages = ValidationRuleAliasMessage.getDefaultMessages(rule);
    const messageKey = rule.messageKey;
    let message: string | undefined;
    const messageCount = validationMessages.length;
    if (messageCount === 1 && messageKey === void 0) {
      message = validationMessages[0].defaultMessage;
    } else {
      message = validationMessages.find(m => m.name === messageKey)?.defaultMessage;
    }
    if (!message) {
      message = ValidationRuleAliasMessage.getDefaultMessages(BaseValidationRule)[0].defaultMessage!;
    }
    return this.parseMessage(message);
  }

  public parseMessage(message: string): IInterpolationExpression | PrimitiveLiteralExpression {
    const parsed = this.parser.parse(message, BindingType.Interpolation);
    if (parsed instanceof Interpolation) {
      for (const expr of parsed.expressions) {
        const name = (expr as AccessScopeExpression).name;
        if (contextualProperties.has(name)) {
          this.logger.warn(`Did you mean to use "$${name}" instead of "${name}" in this validation message template: "${message}"?`);
        }
        if (expr instanceof AccessThisExpression || (expr as AccessScopeExpression).ancestor > 0) {
          throw new Error('$parent is not permitted in validation message expressions.'); // TODO use reporter
        }
      }
      return parsed;
    }
    return new PrimitiveLiteralExpression(message);
  }

  /**
   * Formulates a property display name using the property name and the configured
   * displayName (if provided).
   * Override this with your own custom logic.
   *
   * @param propertyName - The property name.
   */
  public getDisplayName(propertyName: string | number, displayName?: string | null | (() => string)): string {
    if (displayName !== null && displayName !== undefined) {
      return (displayName instanceof Function) ? displayName() : displayName as string;
    }

    // split on upper-case letters.
    const words = propertyName.toString().split(/(?=[A-Z])/).join(' ');
    // capitalize first letter.
    return words.charAt(0).toUpperCase() + words.slice(1);
  }
}

export class LocalizedValidationMessageProvider extends ValidationMessageProvider {
  // TODO no more monkey patching prototype in user code, rather a standard i18n validation message provider impl
}
