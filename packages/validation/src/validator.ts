import { DI } from '@aurelia/kernel';
import { LifecycleFlags } from '@aurelia/runtime';
import { PropertyRule, ValidationResult, validationRules } from './rule-provider';
import { IValidateable } from './rules';

export const IValidator = DI.createInterface<IValidator>("IValidator").noDefault();
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
  validateProperty<T extends IValidateable = IValidateable>(object: T, propertyName: keyof T, rules?: PropertyRule[]): Promise<ValidationResult[]>;
  validateProperty<T extends IValidateable = IValidateable>(object: T, propertyName: string, rules?: PropertyRule[]): Promise<ValidationResult[]>;

  /**
   * Validates all rules for specified object and it's properties.
   *
   * @param object - The object to validate.
   * @param rules - Optional. If unspecified, the implementation should lookup the rules for the
   * specified object. This may not be possible for all implementations of this interface.
   */
  validateObject(object: IValidateable, rules?: PropertyRule[]): Promise<ValidationResult[]>;
}

/**
 * Validates.
 * Responsible for validating objects and properties.
 */
export class StandardValidator implements IValidator {
  /**
   * Validates the specified property.
   *
   * @param {*} object - The object to validate.
   * @param {(string|number)} propertyName - The name of the property to validate.
   * @param {*} [rules] - If unspecified, the rules will be looked up using the metadata
   * for the object created by ValidationRules....on(class/object)
   */
  public async validateProperty<T extends IValidateable = IValidateable>(object: T, propertyName: keyof T | string, rules?: PropertyRule[]): Promise<ValidationResult[]> {
    // TODO support filter by tags
    return this.validate(object, propertyName, rules);
  }

  /**
   * Validates all rules for specified object and it's properties.
   *
   * @param {*} object - The object to validate.
   * @param {*} [rules] - Optional. If unspecified, the rules will be looked up using the metadata
   * for the object created by ValidationRules....on(class/object)
   */
  public async validateObject(object: IValidateable, rules?: PropertyRule[]): Promise<ValidationResult[]> {
    // TODO support filter by tags
    return this.validate(object, void 0, rules);
  }

  private async validate<T extends IValidateable = IValidateable>(
    object: T,
    propertyName?: keyof T | string,
    rules?: PropertyRule[],
  ): Promise<ValidationResult[]> {
    rules = rules ?? validationRules.get(object);
    const validateAllProperties = propertyName === void 0;

    const result = await Promise.all(rules.reduce((acc: Promise<ValidationResult[]>[], rule) => {
      const { name, expression } = rule.property;
      // eslint-disable-next-line eqeqeq
      if (validateAllProperties || name == propertyName) {
        let value: unknown;
        if (expression === void 0) {
          value = object;
        } else {
          const scope = { bindingContext: object, parentScope: null, scopeParts: [], overrideContext: (void 0)! };
          value = expression.evaluate(LifecycleFlags.none, scope, null!);
        }
        acc.push(rule.validate(value, object));
      }
      return acc;
    }, []));

    return result.reduce((acc, propertyResult) => {
      acc.push(...propertyResult);
      return acc;
    }, []);
  }
}
