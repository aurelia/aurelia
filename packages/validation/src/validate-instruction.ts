/**
 * Instructions for the validation controller's validate method.
 */
export interface ValidateInstruction {
  /**
   * The object to validate.
   */
  object: any;

  /**
   * The property to validate. Optional.
   */
  propertyName?: any;

  /**
   * The rules to validate. Optional.
   */
  rules?: any;
}
