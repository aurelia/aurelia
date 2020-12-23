import { DI } from '@aurelia/kernel';
import { LifecycleFlags, Scope } from '@aurelia/runtime';
import { ValidationResult, validationRulesRegistrar, PropertyRule, rootObjectSymbol } from './rule-provider.js';
import { IValidateable } from './rule-interfaces.js';

/**
 * IInstruction for the validation controller's validate method.
 */
export class ValidateInstruction<TObject extends IValidateable = IValidateable> {
  /**
   * @param {TObject} [object=(void 0)!] - The object to validate.
   * @param {(keyof TObject | string)} [propertyName=(void 0)!] - The property name to validate.
   * @param {PropertyRule[]} [rules=(void 0)!] - The rules to validate.
   * @param {string} [objectTag=(void 0)!] - The tag indicating the ruleset defined for the object.
   * @param {string} [propertyTag=(void 0)!] - The tag indicating the ruleset for the property.
   * @param {LifecycleFlags} [flags=LifecycleFlags.none] - Use this to enable lifecycle flag sensitive expression evaluation.
   */
  public constructor(
    public object: TObject = (void 0)!,
    public propertyName: keyof TObject | string = (void 0)!,
    public rules: PropertyRule[] = (void 0)!,
    public objectTag: string = (void 0)!,
    public propertyTag: string = (void 0)!,
    public flags: LifecycleFlags = LifecycleFlags.none,
  ) { }
}

export const IValidator = DI.createInterface<IValidator>('IValidator');

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
    const flags = instruction.flags;

    const rules = instruction.rules ?? validationRulesRegistrar.get(object, instruction.objectTag) ?? [];
    const scope = Scope.create({ [rootObjectSymbol]: object });

    if (propertyName !== void 0) {
      return (await rules.find((r) => r.property.name === propertyName)?.validate(object, propertyTag, flags, scope)) ?? [];
    }

    return (await Promise.all(rules.map(async (rule) => rule.validate(object, propertyTag, flags, scope)))).flat();
  }
}
