import { ValidateResult } from './validate-result';
import { ValidateInstruction } from './validate-instruction';

/**
 * The result of a call to the validation controller's validate method.
 */
export interface ControllerValidateResult {
  /**
   * Whether validation passed.
   */
  valid: boolean;

  /**
   * The validation result of every rule that was evaluated.
   */
  results: ValidateResult[];

  /**
   * The instruction passed to the controller's validate method.
   */
  instruction?: ValidateInstruction;
}
