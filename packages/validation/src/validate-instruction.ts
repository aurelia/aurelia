import { IValidateable, PropertyRule } from './rule';

/**
 * Instructions for the validation controller's validate method.
 */
export interface ValidateInstruction {
  /**
   * The object to validate.
   */
  object: IValidateable;

  /**
   * The property to validate. Optional.
   */
  propertyName?: string;

  /**
   * The rules to validate. Optional.
   */
  rules?: PropertyRule[];
}
