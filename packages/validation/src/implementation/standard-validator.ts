import { Expression, LookupFunctions } from 'aurelia-binding';
import { ViewResources } from 'aurelia-templating';
import { Validator } from '../validator';
import { ValidateResult } from '../validate-result';
import { Rule } from './rule';
import { Rules } from './rules';
import { ValidationMessageProvider } from './validation-messages';

/**
 * Validates.
 * Responsible for validating objects and properties.
 */
export class StandardValidator extends Validator {
  public static inject = [ValidationMessageProvider, ViewResources];

  private messageProvider: ValidationMessageProvider;
  private lookupFunctions: LookupFunctions;
  private getDisplayName: (propertyName: string) => string;

  constructor(messageProvider: ValidationMessageProvider, resources: ViewResources) {
    super();
    this.messageProvider = messageProvider;
    this.lookupFunctions = (resources as any).lookupFunctions;
    this.getDisplayName = messageProvider.getDisplayName.bind(messageProvider);
  }

  /**
   * Validates the specified property.
   * @param object The object to validate.
   * @param propertyName The name of the property to validate.
   * @param rules Optional. If unspecified, the rules will be looked up using the metadata
   * for the object created by ValidationRules....on(class/object)
   */
  public validateProperty(object: any, propertyName: string | number, rules?: any): Promise<ValidateResult[]> {
    return this.validate(object, propertyName, rules || null);
  }

  /**
   * Validates all rules for specified object and it's properties.
   * @param object The object to validate.
   * @param rules Optional. If unspecified, the rules will be looked up using the metadata
   * for the object created by ValidationRules....on(class/object)
   */
  public validateObject(object: any, rules?: any): Promise<ValidateResult[]> {
    return this.validate(object, null, rules || null);
  }

  /**
   * Determines whether a rule exists in a set of rules.
   * @param rules The rules to search.
   * @parem rule The rule to find.
   */
  public ruleExists(rules: Rule<any, any>[][], rule: Rule<any, any>): boolean {
    let i = rules.length;
    while (i--) {
      if (rules[i].indexOf(rule) !== -1) {
        return true;
      }
    }
    return false;
  }

  private getMessage(rule: Rule<any, any>, object: any, value: any): string {
    const expression: Expression = rule.message || this.messageProvider.getMessage(rule.messageKey);
    // tslint:disable-next-line:prefer-const
    let { name: propertyName, displayName } = rule.property;
    if (propertyName !== null) {
      displayName = this.messageProvider.getDisplayName(propertyName, displayName);
    }
    const overrideContext: any = {
      $displayName: displayName,
      $propertyName: propertyName,
      $value: value,
      $object: object,
      $config: rule.config,
      // returns the name of a given property, given just the property name (irrespective of the property's displayName)
      // split on capital letters, first letter ensured to be capitalized
      $getDisplayName: this.getDisplayName
    };
    return expression.evaluate(
      { bindingContext: object, overrideContext },
      this.lookupFunctions);
  }

  private validateRuleSequence(
    object: any,
    propertyName: string | number | null,
    ruleSequence: Rule<any, any>[][],
    sequence: number,
    results: ValidateResult[]
  ): Promise<ValidateResult[]> {
    // are we validating all properties or a single property?
    const validateAllProperties = propertyName === null || propertyName === undefined;

    const rules = ruleSequence[sequence];
    let allValid = true;

    // validate each rule.
    const promises: Promise<boolean>[] = [];
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];

      // is the rule related to the property we're validating.
      // tslint:disable-next-line:triple-equals | Use loose equality for property keys
      if (!validateAllProperties && rule.property.name != propertyName) {
        continue;
      }

      // is this a conditional rule? is the condition met?
      if (rule.when && !rule.when(object)) {
        continue;
      }

      // validate.
      const value = rule.property.name === null ? object : object[rule.property.name];
      let promiseOrBoolean = rule.condition(value, object);
      if (!(promiseOrBoolean instanceof Promise)) {
        promiseOrBoolean = Promise.resolve(promiseOrBoolean);
      }
      promises.push(promiseOrBoolean.then(valid => {
          const message = valid ? null : this.getMessage(rule, object, value);
          results.push(new ValidateResult(rule, object, rule.property.name, valid, message));
          allValid = allValid && valid;
          return valid;
        }));
    }

    return Promise.all(promises)
      .then(() => {
      sequence++;
      if (allValid && sequence < ruleSequence.length) {
        return this.validateRuleSequence(object, propertyName, ruleSequence, sequence, results);
      }
      return results;
    });
  }

  private validate(
    object: any,
    propertyName: string | number | null,
    rules: Rule<any, any>[][] | null
  ): Promise<ValidateResult[]> {
    // rules specified?
    if (!rules) {
      // no. attempt to locate the rules.
      rules = Rules.get(object);
    }

    // any rules?
    if (!rules || rules.length === 0) {
      return Promise.resolve([]);
    }

    return this.validateRuleSequence(object, propertyName, rules, 0, []);
  }
}
