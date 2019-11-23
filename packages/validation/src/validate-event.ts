import { ValidateResult } from './validate-result';
import { ValidateInstruction } from './validate-instruction';
import { ControllerValidateResult } from './controller-validate-result';

export class ValidateEvent {
  constructor(
    /**
     * The type of validate event. Either "validate" or "reset".
     */
    public readonly type: 'validate' | 'reset',

    /**
     * The controller's current array of errors. For an array containing both
     * failed rules and passed rules, use the "results" property.
     */
    public readonly errors: ValidateResult[],

    /**
     * The controller's current array of validate results. This
     * includes both passed rules and failed rules. For an array of only failed rules,
     * use the "errors" property.
     */
    public readonly results: ValidateResult[],

    /**
     * The instruction passed to the "validate" or "reset" event. Will be null when
     * the controller's validate/reset method was called with no instruction argument.
     */
    public readonly instruction: ValidateInstruction | null,

    /**
     * In events with type === "validate", this property will contain the result
     * of validating the instruction (see "instruction" property). Use the controllerValidateResult
     * to access the validate results specific to the call to "validate"
     * (as opposed to using the "results" and "errors" properties to access the controller's entire
     * set of results/errors).
     */
    public readonly controllerValidateResult: ControllerValidateResult | null

  ) { }
}
