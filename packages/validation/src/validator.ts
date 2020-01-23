import { DI } from '@aurelia/kernel';
import { LifecycleFlags, Scope } from '@aurelia/runtime';
import { ValidationResult, validationRulesRegistrar } from './rule-provider';
import { ValidateInstruction } from './validation-controller';
import { IValidateable } from './rules';

export const IValidator = DI.createInterface<IValidator>("IValidator").noDefault();

/**
 * The core validator contract.
 */
export interface IValidator {
  /**
   * Core validate function that works with a validate instruction.
   *
   * @param {ValidateInstruction<T>} instruction - The instruction on how to perform the validation.
   * - case `{object}` - the default ruleset defined on the instance or the class are used.
   * - case `{object, propertyName}` - only the rules defined for the particular property are validated.
   * - case `{object, rules}`  or `{object, propertyName, rules}` - only the specified rules are used for validation.
   * - case `{object, objectTag}` - only the tagged ruleset are used for validation.
   * - case `{object, objectTag, propertyName}` - only the rules for the property in the tagged ruleset are used for validation.
   * - case `{object, objectTag, propertyName, propertyTag}` - only the tagged rules for the property in the tagged ruleset for the object are validated
   */
  validate<TObject extends IValidateable = IValidateable>(instruction: ValidateInstruction<TObject>): Promise<ValidationResult[]>;
}

/**
 * Standard implementation of `IValidator`.
 */
export class StandardValidator implements IValidator {
  public async validate<TObject extends IValidateable = IValidateable>(instruction: ValidateInstruction<TObject>): Promise<ValidationResult[]> {
    const object = instruction.object;
    const propertyName = instruction.propertyName;
    const propertyTag = instruction.propertyTag;

    const validateAllProperties = propertyName === void 0;
    const rules = instruction.rules ?? validationRulesRegistrar.get(object, instruction.objectTag) ?? [];

    const result = await Promise.all(rules.reduce((acc: Promise<ValidationResult[]>[], rule) => {
      const { name, expression } = rule.property;
      if (validateAllProperties || name === propertyName) {
        let value: unknown;
        if (expression === void 0) {
          value = object;
        } else {
          const scope = Scope.create(LifecycleFlags.none, object);
          value = expression.evaluate(LifecycleFlags.none, scope, null!);
        }
        acc.push(rule.validate(value, object, propertyTag));
      }
      return acc;
    }, []));

    return result.reduce((acc, propertyResult) => {
      acc.push(...propertyResult);
      return acc;
    }, []);
  }
}
