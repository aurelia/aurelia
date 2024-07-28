import { Class, DI, ILogger, IServiceLocator, resolve } from '@aurelia/kernel';
import {
  IExpressionParser,
  Interpolation,
  type IsBindingBehavior,
  PrimitiveLiteralExpression,
  AccessScopeExpression,
} from '@aurelia/expression-parser';
import {
  Scope,
  type IAstEvaluator,
  astEvaluate,
  mixinAstEvaluator,
} from '@aurelia/runtime-html';
import {
  ValidationRuleAlias,
  RequiredRule,
  RegexRule,
  LengthRule,
  SizeRule,
  RangeRule,
  EqualsRule,
  IValidationMessageProvider,
  ValidationRuleAliasMessage,
  BaseValidationRule,
  StateRule,
  explicitMessageKey,
} from './rules';
import {
  IValidateable,
  ValidationRuleExecutionPredicate,
  IValidationVisitor,
  ValidationDisplayNameAccessor,
  IRuleProperty,
  IPropertyRule,
  IValidationExpressionHydrator,
  IValidationRule,
} from './rule-interfaces';
import { defineMetadata, deleteMetadata, getAnnotationKeyFor, getMetadata } from './utilities-metadata';
import { ErrorNames, createMappedError } from './errors';

/**
 * Contract to register the custom messages for rules, during plugin registration.
 */
export interface ICustomMessage<TRule extends IValidationRule = IValidationRule> {
  rule: Class<TRule>;
  aliases: ValidationRuleAlias[];
}

/* @internal */
export const ICustomMessages = /*@__PURE__*/DI.createInterface<ICustomMessage[]>('ICustomMessages');

export class RuleProperty implements IRuleProperty {
  public static $TYPE: string = 'RuleProperty';
  public constructor(
    public expression?: IsBindingBehavior,
    public name: string | number | undefined = void 0,
    public displayName: string | ValidationDisplayNameAccessor | undefined = void 0,
  ) { }
  public accept(visitor: IValidationVisitor): string {
    return visitor.visitRuleProperty(this);
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RuleCondition<TObject extends IValidateable = IValidateable, TValue = any> = (value: TValue, object?: TObject) => boolean | Promise<boolean>;

export const validationRulesRegistrar = Object.freeze({
  allRulesAnnotations: getAnnotationKeyFor('validation-rules-annotations'),
  name: 'validation-rules',
  defaultRuleSetName: '__default',
  set(target: IValidateable, rules: IPropertyRule[], tag?: string): void {
    const key = `${validationRulesRegistrar.name}:${tag ?? validationRulesRegistrar.defaultRuleSetName}`;
    defineMetadata(rules, target, getAnnotationKeyFor(key));
    const keys = getMetadata<string[]>(this.allRulesAnnotations, target);
    if (keys === void 0) {
      defineMetadata([key], target, this.allRulesAnnotations);
    } else {
      keys.push(key);
    }
  },
  get(target: IValidateable, tag?: string): PropertyRule[] | undefined {
    const key = getAnnotationKeyFor(validationRulesRegistrar.name, tag ?? validationRulesRegistrar.defaultRuleSetName);
    return getMetadata(key, target) ?? getMetadata(key, target.constructor);
  },
  unset(target: IValidateable, tag?: string): void {
    // const keys: string | string[] = Metadata.getOwn(Protocol.annotation.name, target);
    const keys: string | string[] | undefined = getMetadata(this.allRulesAnnotations, target);
    if (!Array.isArray(keys)) return;
    for (const key of keys.slice(0)) {
      if (key.startsWith(validationRulesRegistrar.name) && (tag === void 0 || key.endsWith(tag))) {
        deleteMetadata(getAnnotationKeyFor(key), target);
        const index = keys.indexOf(key);
        if (index > -1) {
          keys.splice(index, 1);
        }
      }
    }
  },
  isValidationRulesSet(target: IValidateable) {
    const keys = getMetadata(this.allRulesAnnotations, target) as string[];
    return keys !== void 0 && keys.some((key) => key.startsWith(validationRulesRegistrar.name));
  }
});

class ValidationMessageEvaluationContext {
  public constructor(
    private readonly messageProvider: IValidationMessageProvider,
    public readonly $displayName: string | undefined,
    public readonly $propertyName: string | number | undefined,
    public readonly $value: unknown,
    public readonly $rule: IValidationRule,
    public readonly $object?: IValidateable,
  ) { }
  public $getDisplayName(propertyName: string | number | undefined, displayName?: string | null | ValidationDisplayNameAccessor) {
    return this.messageProvider.getDisplayName(propertyName, displayName);
  }
}

export interface PropertyRule extends IAstEvaluator { }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class PropertyRule<TObject extends IValidateable = IValidateable, TValue = unknown> implements IPropertyRule {
  public static readonly $TYPE: string = 'PropertyRule';
  private latestRule?: IValidationRule;
  /** @internal */
  public readonly l: IServiceLocator;
  public linkedProperties: PropertyKey[] = [];

  public constructor(
    locator: IServiceLocator,
    public readonly validationRules: IValidationRules,
    public readonly messageProvider: IValidationMessageProvider,
    public property: RuleProperty,
    public $rules: IValidationRule[][] = [[]],
  ) {
    this.l = locator;
  }

  public accept(visitor: IValidationVisitor): string {
    return visitor.visitPropertyRule(this);
  }

  /** @internal */
  public addRule(rule: IValidationRule) {
    const rules: IValidationRule[] = this.getLeafRules();
    rules.push(this.latestRule = rule);
    return this;
  }

  private getLeafRules(): IValidationRule[] {
    const depth = this.$rules.length - 1;
    return this.$rules[depth];
  }

  public async validate(
    object?: IValidateable,
    tag?: string,
    scope?: Scope
  ): Promise<ValidationResult[]> {
    if (scope === void 0) {
      scope = Scope.create({ [rootObjectSymbol]: object });
    }
    const expression = this.property.expression;
    let value: unknown;
    if (expression === void 0) {
      value = object;
    } else {
      value = astEvaluate(expression, scope, this, null);
    }

    let isValid = true;
    const validateRuleset = async (rules: IValidationRule[]) => {
      const validateRule = async (rule: IValidationRule) => {
        let isValidOrPromise = rule.execute(value, object);
        if (isValidOrPromise instanceof Promise) {
          isValidOrPromise = await isValidOrPromise;
        }
        isValid = isValid && isValidOrPromise;
        const { displayName, name } = this.property;
        let message: string | undefined;
        if (!isValidOrPromise) {
          const messageEvaluationScope = Scope.create(
            new ValidationMessageEvaluationContext(
              this.messageProvider,
              this.messageProvider.getDisplayName(name, displayName),
              name,
              value,
              rule,
              object,
            ));
          message = astEvaluate(this.messageProvider.getMessage(rule), messageEvaluationScope, this, null) as string;
        }
        return new ValidationResult(isValidOrPromise, message, name, object, rule, this);
      };

      const promises: Promise<ValidationResult>[] = [];
      for (const rule of rules) {
        if (rule.canExecute(object) && (tag === void 0 || rule.tag === tag)) {
          promises.push(validateRule(rule));
        }
      }
      return Promise.all(promises);
    };
    const accumulateResult = async (results: ValidationResult[], rules: IValidationRule[]) => {
      const result = await validateRuleset(rules);
      results.push(...result);
      return results;
    };
    return this.$rules.reduce(
      async (acc, ruleset) => acc.then(async (accValidateResult) => isValid ? accumulateResult(accValidateResult, ruleset) : Promise.resolve(accValidateResult)),
      Promise.resolve([] as ValidationResult[])
    );
  }

  // #region customization API
  /**
   * Validate subsequent rules after previously declared rules have been validated successfully.
   * Use to postpone validation of costly rules until less expensive rules pass validation.
   */
  public then() {
    this.$rules.push([]);
    return this;
  }

  /**
   * Specifies the key to use when looking up the rule's validation message.
   * Note that custom keys needs to be registered during plugin registration.
   */
  public withMessageKey(key: string) {
    this.assertLatestRule(this.latestRule);
    this.latestRule.messageKey = key;
    return this;
  }

  /**
   * Specifies rule's validation message; this overrides the rules default validation message.
   */
  public withMessage(message: string) {
    const rule = this.latestRule;
    this.assertLatestRule(rule);
    this.messageProvider.setMessage(rule, message, explicitMessageKey);
    return this;
  }

  /**
   * Specifies a condition that must be met before attempting to validate the rule.
   *
   * @param  condition - A function that accepts the object as a parameter and returns true or false whether the rule should be evaluated.
   */
  public when(this: PropertyRule<TObject>, condition: ValidationRuleExecutionPredicate<TObject>) {
    this.assertLatestRule(this.latestRule);
    this.latestRule.canExecute = condition;
    return this;
  }

  /**
   * Tags the rule instance.
   * The tag can later be used to perform selective validation.
   */
  public tag(tag: string) {
    this.assertLatestRule(this.latestRule);
    this.latestRule.tag = tag;
    return this;
  }

  private assertLatestRule(latestRule: IValidationRule | undefined): asserts latestRule is IValidationRule {
    if (latestRule === void 0) {
      throw createMappedError(ErrorNames.rule_provider_no_rule_found);
    }
  }

  /**
   * Links the PropertyRule to other key values.
   * @param properties - Array of property keys to link.
   */
  public linkProperties(properties: PropertyKey[]) {
    this.linkedProperties.push(...properties);
    return this;
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

  public satisfiesState<TState extends PropertyKey, TVal>(this: PropertyRule<TObject, TVal>, validState: TState, stateFunction: (value: TVal, object?: TObject) => TState | Promise<TState>, messages: Partial<Record<TState, string>>) {
    return this.addRule(new StateRule(validState, stateFunction, messages));
  }

  /**
   * Applies an ad-hoc rule function to the ensured property or object.
   *
   * @param {RuleCondition} condition - The function to validate the rule. Will be called with two arguments, the property value and the object.
   */
  public satisfies(condition: RuleCondition) {
    const rule = new (class extends BaseValidationRule { public execute: RuleCondition = condition; })();
    return this.addRule(rule);
  }

  /**
   * Applies a custom rule instance.
   *
   * @param validationRule - rule instance.
   */
  public satisfiesRule<TRule extends IValidationRule>(validationRule: TRule) {
    return this.addRule(validationRule);
  }

  /**
   * Applies an instance of `RequiredRule`.
   */
  public required() {
    return this.addRule(new RequiredRule());
  }

  /**
   * Applies an instance of `RegexRule`.
   */
  public matches(this: PropertyRule<TObject, string>, regex: RegExp) {
    return this.addRule(new RegexRule(regex));
  }

  /**
   * Applies an instance of `RegexRule` with email pattern.
   */
  public email(this: PropertyRule<TObject, string>) {
    // eslint-disable-next-line no-useless-escape
    const emailPattern = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return this.addRule(new RegexRule(emailPattern, 'email'));
  }

  /**
   * Applies an instance of `LengthRule` with min `length` constraint.
   * Applicable for string value.
   */
  public minLength(this: PropertyRule<TObject, string>, length: number) {
    return this.addRule(new LengthRule(length, false));
  }

  /**
   * Applies an instance of `LengthRule` with max `length` constraint.
   * Applicable for string value.
   */
  public maxLength(this: PropertyRule<TObject, string>, length: number) {
    return this.addRule(new LengthRule(length, true));
  }

  /**
   * Applies an instance of `SizeRule` with min `count` constraint.
   * Applicable for array value.
   */
  public minItems(this: PropertyRule<TObject, unknown[]>, count: number) {
    return this.addRule(new SizeRule(count, false));
  }

  /**
   * Applies an instance of `SizeRule` with max `count` constraint.
   * Applicable for array value.
   */
  public maxItems(this: PropertyRule<TObject, unknown[]>, count: number) {
    return this.addRule(new SizeRule(count, true));
  }

  /**
   * Applies an instance of `RangeRule` with [`constraint`,] interval.
   * Applicable for number value.
   */
  public min(this: PropertyRule<TObject, number>, constraint: number) {
    return this.addRule(new RangeRule(true, { min: constraint }));
  }

  /**
   * Applies an instance of `RangeRule` with [,`constraint`] interval.
   * Applicable for number value.
   */
  public max(this: PropertyRule<TObject, number>, constraint: number) {
    return this.addRule(new RangeRule(true, { max: constraint }));
  }

  /**
   * Applies an instance of `RangeRule` with [`min`,`max`] interval.
   * Applicable for number value.
   */
  public range(this: PropertyRule<TObject, number>, min: number, max: number) {
    return this.addRule(new RangeRule(true, { min, max }));
  }

  /**
   * Applies an instance of `RangeRule` with (`min`,`max`) interval.
   * Applicable for number value.
   */
  public between(this: PropertyRule<TObject, number>, min: number, max: number) {
    return this.addRule(new RangeRule(false, { min, max }));
  }

  /**
   * Applies an instance of `EqualsRule` with the `expectedValue`.
   */
  public equals(expectedValue: unknown) {
    return this.addRule(new EqualsRule(expectedValue));
  }
  // #endregion

  // #region ValidationRules proxy
  /**
   * Targets a object property for validation
   *
   * @param property - can be string or a property accessor function.
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
   * @param {IValidateable} target - A class or object.
   * @param {string} [tag] - Tag to use to mark the ruleset for the `target`
   */
  public on<TAnotherObject extends IValidateable = IValidateable>(target: Class<TAnotherObject> | TAnotherObject, tag?: string): IValidationRules<TAnotherObject>;
  public on(target: IValidateable, tag?: string) {
    return this.validationRules.on(target, tag);
  }
  // #endregion
}
mixinAstEvaluator()(PropertyRule);

export class ModelBasedRule {
  public constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public ruleset: any,
    public tag: string = validationRulesRegistrar.defaultRuleSetName
  ) { }
}

export interface IValidationRules<TObject extends IValidateable = IValidateable> {
  rules: PropertyRule[];
  /**
   * Targets a object property for validation
   *
   * @param property - can be string or a property accessor function.
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
export const IValidationRules = /*@__PURE__*/DI.createInterface<IValidationRules>('IValidationRules');

export class ValidationRules<TObject extends IValidateable = IValidateable> implements IValidationRules<TObject> {
  public rules: PropertyRule[] = [];
  private readonly targets: Set<IValidateable> = new Set<IValidateable>();

  private readonly locator: IServiceLocator = resolve(IServiceLocator);
  private readonly parser: IExpressionParser = resolve(IExpressionParser);
  private readonly messageProvider: IValidationMessageProvider = resolve(IValidationMessageProvider);
  private readonly deserializer: IValidationExpressionHydrator = resolve(IValidationExpressionHydrator);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public ensure<TValue>(property: keyof TObject | string | PropertyAccessor): PropertyRule {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [name, expression] = parsePropertyName(property as any, this.parser);
    // eslint-disable-next-line eqeqeq
    let rule = this.rules.find((r) => r.property.name == name);
    if (rule === void 0) {
      rule = new PropertyRule(this.locator, this, this.messageProvider, new RuleProperty(expression, name));
      this.rules.push(rule);
    }
    return rule;
  }

  public ensureObject(): PropertyRule {
    const rule = new PropertyRule(this.locator, this, this.messageProvider, new RuleProperty());
    this.rules.push(rule);
    return rule;
  }

  public on(target: IValidateable, tag?: string) {
    const rules = validationRulesRegistrar.get(target, tag);
    if (Object.is(rules, this.rules)) {
      return this;
    }
    this.rules = rules ?? [];
    validationRulesRegistrar.set(target, this.rules, tag);
    this.targets.add(target);
    return this;
  }

  public off(target?: IValidateable, tag?: string): void {
    const $targets = target !== void 0 ? [target] : Array.from(this.targets);
    for (const $target of $targets) {
      validationRulesRegistrar.unset($target, tag);
      if (!validationRulesRegistrar.isValidationRulesSet($target)) {
        this.targets.delete($target);
      }
    }
  }

  public applyModelBasedRules(target: IValidateable, rules: ModelBasedRule[]): void {
    const tags: Set<string> = new Set<string>();
    for (const rule of rules) {
      const tag = rule.tag;
      if (__DEV__) {
        if (tags.has(tag)) {
          // eslint-disable-next-line no-console
          console.warn(`A ruleset for tag ${tag} is already defined which will be overwritten`); // TODO: use reporter/logger
        }
      }
      const ruleset = this.deserializer.hydrateRuleset(rule.ruleset, this);
      validationRulesRegistrar.set(target, ruleset, tag);
      tags.add(tag);
    }
  }
}

// eslint-disable-next-line no-useless-escape
const classicAccessorPattern = /^(?:function)?\s*\(?[$_\w\d]+\)?\s*(?:=>)?\s*\{(?:\s*["']{1}use strict["']{1};)?(?:[$_\s\w\d\/\*.['"\]+;\(\)]+)?\s*return\s+[$_\w\d]+((\.[$_\w\d]+|\[['"$_\w\d]+\])+)\s*;?\s*\}$/;
const arrowAccessorPattern = /^\(?[$_\w\d]+\)?\s*=>\s*[$_\w\d]+((\.[$_\w\d]+|\[['"$_\w\d]+\])+)$/;
export const rootObjectSymbol = '$root';
export type PropertyAccessor<TObject extends IValidateable = IValidateable, TValue = unknown> = (object: TObject) => TValue;
export function parsePropertyName(property: string | PropertyAccessor, parser: IExpressionParser): [string, IsBindingBehavior] {

  switch (typeof property) {
    case 'string':
      break;
    case 'function': {
      const fn = property.toString();
      const match = arrowAccessorPattern.exec(fn) ?? classicAccessorPattern.exec(fn);
      if (match === null) {
        throw createMappedError(ErrorNames.unable_to_parse_accessor_fn, fn);
      }
      property = match[1].substring(1);
      break;
    }
    default:
      throw createMappedError(ErrorNames.unable_to_parse_accessor_fn, property);
  }

  return [property, parser.parse(`${rootObjectSymbol}.${property}`, 'IsProperty')];
}

/**
 * The result of validating an individual validation rule.
 */
export class ValidationResult<TRule extends IValidationRule = IValidationRule> {
  private static nextId: number = 0;

  /**
   * A number that uniquely identifies the result instance.
   */
  public id: number;
  /**
   * @param valid - `true` is the validation was successful, else `false`.
   * @param message - Evaluated validation message, if the result is not valid, else `undefined`.
   * @param propertyName - Associated property name.
   * @param object - Associated target object.
   * @param rule - Associated instance of rule.
   * @param propertyRule - Associated parent property rule.
   * @param isManual - `true` if the validation result is added manually. Default is `false`.
   */
  public constructor(
    public valid: boolean,
    public message: string | undefined,
    public propertyName: string | number | undefined,
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
  'displayName',
  'propertyName',
  'value',
  'object',
  'config',
  'getDisplayName'
]);

export class ValidationMessageProvider implements IValidationMessageProvider {

  private readonly logger: ILogger;
  protected registeredMessages: WeakMap<IValidationRule, Map<string|symbol, Interpolation | PrimitiveLiteralExpression>> = new WeakMap();

  public parser: IExpressionParser = resolve(IExpressionParser);
  public constructor(
    logger: ILogger = resolve(ILogger),
    customMessages: ICustomMessage[] = resolve(ICustomMessages),
  ) {
    this.logger = logger.scopeTo(ValidationMessageProvider.name);
    for (const { rule, aliases } of customMessages) {
      ValidationRuleAliasMessage.setDefaultMessage(rule, { aliases }, true);
    }
  }

  public getMessage(rule: IValidationRule): Interpolation | PrimitiveLiteralExpression {
    const messageKey = rule.messageKey;
    const lookup = this.registeredMessages.get(rule);
    if (lookup != null) {
      const parsedMessage = lookup.get(explicitMessageKey) ?? lookup.get(messageKey);
      if (parsedMessage !== void 0) { return parsedMessage; }
    }

    const validationMessages = ValidationRuleAliasMessage.getDefaultMessages(rule);
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
    return this.setMessage(rule, message);
  }

  public setMessage(rule: IValidationRule, message: string, messageKey?: symbol): Interpolation | PrimitiveLiteralExpression {
    const parsedMessage = this.parseMessage(message);
    const rm = this.registeredMessages;
    let messageLookup = rm.get(rule);
    if (messageLookup === void 0) {
      rm.set(rule, messageLookup = new Map());
    }
    messageLookup.set(messageKey ?? rule.messageKey, parsedMessage);
    return parsedMessage;
  }

  public parseMessage(message: string): Interpolation | PrimitiveLiteralExpression {
    const parsed = this.parser.parse(message, 'Interpolation');
    if (parsed?.$kind === 'Interpolation') {
      for (const expr of parsed.expressions) {
        const name = (expr as AccessScopeExpression).name;
        if (contextualProperties.has(name)) {
          this.logger.warn(`Did you mean to use "$${name}" instead of "${name}" in this validation message template: "${message}"?`);
        }
        if (expr.$kind === 'AccessThis' || (expr as AccessScopeExpression).ancestor > 0) {
          throw new Error('$parent is not permitted in validation message expressions.'); // TODO: use reporter
        }
      }
      return parsed;
    }
    return new PrimitiveLiteralExpression(message);
  }

  public getDisplayName(propertyName: string | number | undefined, displayName?: string | null | ValidationDisplayNameAccessor): string | undefined {
    if (displayName !== null && displayName !== undefined) {
      return (displayName instanceof Function) ? displayName() : displayName;
    }

    if (propertyName === void 0) { return; }
    // split on upper-case letters.
    const words = propertyName.toString().split(/(?=[A-Z])/).join(' ');
    // capitalize first letter.
    return words.charAt(0).toUpperCase() + words.slice(1);
  }
}
