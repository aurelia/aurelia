import { DI } from '@aurelia/kernel';
import { IValidateable, PropertyRule, validationRules, ValidationResult } from './rule';

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
  validateProperty(object: IValidateable, propertyName: string, rules?: PropertyRule[]): Promise<ValidationResult[]>;

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
  public async validateProperty(object: IValidateable, propertyName: string | number, rules?: [PropertyRule]): Promise<ValidationResult[]> {
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

  // private getMessage(rule: PropertyRule, object: any, value: any): string {
  //   const expression = rule.getMessage();
  //   // eslint-disable-next-line prefer-const
  //   let { name: propertyName, displayName } = rule.property;
  //   if (propertyName !== null) {
  //     displayName = this.messageProvider.getDisplayName(propertyName, displayName);
  //   }
  //   const overrideContext: any = {
  //     $displayName: displayName,
  //     $propertyName: propertyName,
  //     $value: value,
  //     $object: object,
  //     $config: rule.config,
  //     // returns the name of a given property, given just the property name (irrespective of the property's displayName)
  //     // split on capital letters, first letter ensured to be capitalized
  //     $getDisplayName: this.getDisplayName
  //   };
  //   return expression.evaluate(
  //     LifecycleFlags.none,
  //     // { bindingContext: object, overrideContext },
  //     (void 0)!,
  //     null) as string;
  // }

  private async validate(
    object: IValidateable,
    propertyName?: string | number,
    rules?: PropertyRule[],
  ): Promise<ValidationResult[]> {
    rules = rules ?? validationRules.get(object);
    const validateAllProperties = propertyName === void 0;

    const result = await Promise.all(rules.reduce((acc: Promise<ValidationResult[]>[], rule) => {
      // eslint-disable-next-line eqeqeq
      if (validateAllProperties || rule.property.name == propertyName) {
        const value = rule.property.name === void 0 ? object : object[rule.property.name];
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
