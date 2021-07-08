import { LifecycleFlags } from '@aurelia/runtime';
import { ValidationResult, PropertyRule } from './rule-provider.js';
import { IValidateable } from './rule-interfaces.js';
/**
 * IInstruction for the validation controller's validate method.
 */
export declare class ValidateInstruction<TObject extends IValidateable = IValidateable> {
    object: TObject;
    propertyName: keyof TObject | string;
    rules: PropertyRule[];
    objectTag: string;
    propertyTag: string;
    flags: LifecycleFlags;
    /**
     * @param {TObject} [object=(void 0)!] - The object to validate.
     * @param {(keyof TObject | string)} [propertyName=(void 0)!] - The property name to validate.
     * @param {PropertyRule[]} [rules=(void 0)!] - The rules to validate.
     * @param {string} [objectTag=(void 0)!] - The tag indicating the ruleset defined for the object.
     * @param {string} [propertyTag=(void 0)!] - The tag indicating the ruleset for the property.
     * @param {LifecycleFlags} [flags=LifecycleFlags.none] - Use this to enable lifecycle flag sensitive expression evaluation.
     */
    constructor(object?: TObject, propertyName?: keyof TObject | string, rules?: PropertyRule[], objectTag?: string, propertyTag?: string, flags?: LifecycleFlags);
}
export declare const IValidator: import("@aurelia/kernel").InterfaceSymbol<IValidator>;
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
export declare class StandardValidator implements IValidator {
    validate<TObject extends IValidateable = IValidateable>(instruction: ValidateInstruction<TObject>): Promise<ValidationResult[]>;
}
//# sourceMappingURL=validator.d.ts.map