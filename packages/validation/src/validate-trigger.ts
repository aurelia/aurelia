/**
 * Validation triggers.
 */
export enum validateTrigger {
  /**
   * Manual validation.  Use the controller's `validate()` and  `reset()` methods
   * to validate all bindings.
   */
  manual = 0,

  /**
   * Validate the binding when the binding's target element fires a DOM "blur" event.
   */
  blur = 1,

  /**
   * Validate the binding when it updates the model due to a change in the view.
   */
  change = 2,

  /**
   * Validate the binding when the binding's target element fires a DOM "blur" event and
   * when it updates the model due to a change in the view.
   */
  changeOrBlur = 3
}
