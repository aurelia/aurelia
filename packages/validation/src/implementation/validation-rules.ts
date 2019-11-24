import { PropertyAccessor, PropertyAccessorParser } from '../property-accessor-parser';
import { Rule, RuleCondition, RuleProperty, Rules, ValidationDisplayNameAccessor, IValidateable, PropertyRule, ValidationRuleExecutionPredicate } from './rule';
import { validationMessages, IValidationMessageProvider } from './validation-messages';
import { IContainer, Registration } from '@aurelia/kernel';

/**
 * Part of the fluent rule API. Enables customizing property rules.
 */
export class FluentRuleCustomizer<TObject, TValue> {
  private rule: PropertyRule;

  public constructor(
    private readonly validationRules: ValidationRules,
    private readonly messageProvider: IValidationMessageProvider,
  ) {
    const rules = validationRules.rules;
    this.rule = rules[rules.length - 1];
  }
  // #region FluentEnsure APIs

  /**
   * Target a property with validation rules.
   *
   * @param property - The property to target. Can be the property name or a property accessor function.
   */
  public ensure<TValue2>(subject: string | ((model: TObject) => TValue2)) {
    return this.validationRules.ensure<TValue2>(subject);
  }

  /**
   * Targets an object with validation rules.
   */
  public ensureObject() {
    return this.validationRules.ensureObject();
  }

  /**
   * Rules that have been defined using the fluent API.
   */
  public get rules() {
    return this.validationRules.rules_old;
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

  // #region FluentRules APIs

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

  // /**
  //  * Defines a custom rule.
  //  *
  //  * @param name - The name of the custom rule. Also serves as the message key.
  //  * @param condition - The rule function.
  //  * @param message - The message expression
  //  * @param argsToConfig - A function that maps the rule's arguments to a "config"
  //  * object that can be used when evaluating the message expression.
  //  */
  // public static customRule(
  //   name: string,
  //   condition: (value: any, object?: any, ...args: any[]) => boolean | Promise<boolean>,
  //   message: string,
  //   argsToConfig?: (...args: any[]) => any
  // ) {
  //   // TODO replace this in favor of @customRule
  //   // validationMessages[name] = message;
  //   // FluentRules.customRules[name] = { condition, argsToConfig };
  // }

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
  public rules_old: Rule[][] = [];
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
    let rule = this.rules.find((rule) => rule.property.name == name);
    if (rule === void 0) {
      rule = new PropertyRule(this, ValidationRules.messageProvider, new RuleProperty(name));
      this.rules.push(rule);
    }
    return rule;
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
    Rules.set(target, this.rules_old);
    return this;
  }

  /**
   * Adds a rule definition to the sequenced ruleset.
   *
   * @internal
   */
  public _addRule(rule: Rule) {
    while (this.rules_old.length < rule.sequence + 1) {
      this.rules_old.push([]);
    }
    this.rules_old[rule.sequence].push(rule);
  }

  private assertInitialized() {
    if (ValidationRules.messageProvider === void 0 || ValidationRules.propertyParser === void 0) {
      return;
    }
    throw new Error(`Did you forget to register 'ValidationConfiguration' from '@aurelia/validation'?`);
  }

  private mergeRules(fluentRules: FluentRules<any>, propertyName: string | number | null) {
    // eslint-disable-next-line eqeqeq
    const existingRules = this.rules_old.find(r => r.length > 0 && r[0].property.name == propertyName);
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
