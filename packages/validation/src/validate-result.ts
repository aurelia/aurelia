/**
 * The result of validating an individual validation rule.
 */
export class ValidateResult {
  private static nextId = 0;

  /**
   * A number that uniquely identifies the result instance.
   */
  public id: number;

  /**
   * @param rule The rule associated with the result. Validator implementation specific.
   * @param object The object that was validated.
   * @param propertyName The name of the property that was validated.
   * @param error The error, if the result is a validation error.
   */
  constructor(
    public rule: any,
    public object: any,
    public propertyName: string | number | null,
    public valid: boolean,
    public message: string | null = null
  ) {
    this.id = ValidateResult.nextId++;
  }

  public toString() {
    return this.valid ? 'Valid.' : this.message;
  }
}
