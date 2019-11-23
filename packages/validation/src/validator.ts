import { Rule, Rules, IValidateable } from './implementation/rule';
import { ValidationMessageProvider } from './implementation/validation-messages';
import { ValidateResult } from './validate-result';
import { DI } from '@aurelia/kernel';

export const IValidator = DI.createInterface("IValidator");
/**
 * Validates objects and properties.
 */
export interface IValidator {

  /**
   * Validates the specified property.
   *
   * @param object - The object to validate.
   * @param propertyName - The name of the property to validate.
   * @param rules - Optional. If unspecified, the implementation should lookup the rules for the
   * specified object. This may not be possible for all implementations of this interface.
   */
  validateProperty(object: any, propertyName: string, rules?: any): Promise<ValidateResult[]>;

  /**
   * Validates all rules for specified object and it's properties.
   *
   * @param object - The object to validate.
   * @param rules - Optional. If unspecified, the implementation should lookup the rules for the
   * specified object. This may not be possible for all implementations of this interface.
   */
  validateObject(object: any, rules?: any): Promise<ValidateResult[]>;
}

/**
 * Validates.
 * Responsible for validating objects and properties.
 */
export class StandardValidator implements IValidator {
  private readonly messageProvider: ValidationMessageProvider;
  private readonly lookupFunctions: LookupFunctions;
  private readonly getDisplayName: (propertyName: string) => string;

  public constructor(messageProvider: ValidationMessageProvider, resources: ViewResources) {
    this.messageProvider = messageProvider;
    this.lookupFunctions = (resources as any).lookupFunctions;
    this.getDisplayName = messageProvider.getDisplayName.bind(messageProvider);
  }

  /**
   * Validates the specified property.
   *
   * @param {*} object - The object to validate.
   * @param {(string|number)} propertyName - The name of the property to validate.
   * @param {*} [rules] - If unspecified, the rules will be looked up using the metadata
   * for the object created by ValidationRules....on(class/object)
   */
  public async validateProperty(object: IValidateable, propertyName: string | number, rules?: Rule[][]): Promise<ValidateResult[]> {
    return this.validate(object, propertyName, rules);
  }

  /**
   * Validates all rules for specified object and it's properties.
   *
   * @param {*} object - The object to validate.
   * @param {*} [rules] - Optional. If unspecified, the rules will be looked up using the metadata
   * for the object created by ValidationRules....on(class/object)
   */
  public async validateObject(object: IValidateable, rules?: Rule[][]): Promise<ValidateResult[]> {
    return this.validate(object, void 0, rules);
  }

  private getMessage(rule: Rule, object: any, value: any): string {
    const expression: Expression = rule.message || this.messageProvider.getMessage(rule.messageKey);
    // eslint-disable-next-line prefer-const
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

  private async validateRuleSequence(
    object: IValidateable,
    propertyName: string | number | undefined,
    ruleSequence: Rule[][],
    sequence: number = 0,
    results: ValidateResult[] = [],
  ): Promise<ValidateResult[]> {
    // are we validating all properties or a single property?
    const validateAllProperties = propertyName === void 0;

    const rules = ruleSequence[sequence];
    let allValid = true;

    // validate each rule.
    const promises: Promise<boolean>[] = [];
    for (let i = 0, ii = rules.length; i < ii; i++) {
      const rule = rules[i];

      // is the rule related to the property we're validating.
      // eslint-disable-next-line eqeqeq
      if (!validateAllProperties && rule.property.name != propertyName) {
        continue;
      }

      // is this a conditional rule? is the condition met?
      if (rule.when?.(object) ?? false) {
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

  private async validate(
    object: IValidateable,
    propertyName?: string | number,
    rules?: Rule[][],
  ): Promise<ValidateResult[]> {
    rules = rules ?? Rules.get(object);

    return !Array.isArray(rules) || rules.length === 0
      ? Promise.resolve([] as ValidateResult[])
      : this.validateRuleSequence(object, propertyName, rules);
  }
}
