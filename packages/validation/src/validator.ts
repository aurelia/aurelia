import { DI } from '@aurelia/kernel';
import { Scope } from '@aurelia/runtime';
import { ValidationResult, validationRulesRegistrar, PropertyRule, rootObjectSymbol } from './rule-provider';
import { IValidateable } from './rule-interfaces';

/**
 * IInstruction for the validation controller's validate method.
 */
export class ValidateInstruction<TObject extends IValidateable = IValidateable> {
  /**
   * @param object - The object to validate.
   * @param propertyName - The property name to validate.
   * @param rules - The rules to validate.
   * @param objectTag - The tag indicating the ruleset defined for the object.
   * @param propertyTag - The tag indicating the ruleset for the property.
   */
  public constructor(
    public object: TObject = (void 0)!,
    public propertyName: keyof TObject | string = (void 0)!,
    public rules: PropertyRule[] = (void 0)!,
    public objectTag: string = (void 0)!,
    public propertyTag: string = (void 0)!,
  ) { }
}

export const IValidator = /*@__PURE__*/DI.createInterface<IValidator>('IValidator');

/**
 * The core validator contract.
 */
export interface IValidator {
  /**
   * Core validate function that works with a validate instruction.
   *
   * @template T
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
    let propertyName = instruction.propertyName;
    const propertyTag = instruction.propertyTag;

    const rules = instruction.rules ?? validationRulesRegistrar.get(object, instruction.objectTag) ?? [];
    const scope = Scope.create({ [rootObjectSymbol]: object });

    if (propertyName !== void 0) {
      let rule = rules.find((r) => r.property.name === propertyName);
      if (rule == null && typeof propertyName === 'string' && propertyName.startsWith('[') && propertyName.endsWith(']')) {
        // normalize property name: [foo][bar] -> foo.bar, [foo] -> foo
        propertyName = propertyName.replaceAll('][', '.').slice(1, -1);
        rule = rules.find((r) => r.property.name === propertyName);
      }
      return (await rule?.validate(object, propertyTag, scope)) ?? [];
    }

    return (await Promise.all(rules.map(async (rule) => rule.validate(object, propertyTag, scope)))).flat();
  }
}
