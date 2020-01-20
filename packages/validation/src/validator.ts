import { DI } from '@aurelia/kernel';
import { LifecycleFlags } from '@aurelia/runtime';
import { ValidationResult, validationRulesRegistrar } from './rule-provider';
import { ValidateInstruction } from './validation-controller';

export const IValidator = DI.createInterface<IValidator>("IValidator").noDefault();
export interface IValidator {
  validate<T>(instruction: ValidateInstruction<T>): Promise<ValidationResult[]>;
}

export class StandardValidator implements IValidator {
  public async validate<T>(instruction: ValidateInstruction<T>): Promise<ValidationResult[]> {
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
          const scope = { bindingContext: object, parentScope: null, scopeParts: [], overrideContext: (void 0)! };
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
