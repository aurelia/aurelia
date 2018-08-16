export enum BindingFlags {
  none                = 0b0000000000000,
  mustEvaluate        = 0b0000000000001,
  batchChanges        = 0b0000000000010,
  /**
   * The invocation originates from Aurelia's component.$bind (it is a "first" bind)
   *
   * Used to determine whether to do component initialization that should only happen once / on startup
   */
  isStarting          = 0b0000000000100,
  /**
   * The invocation originates from Aurelia's component.$unbind (it is a "final" unbind)
   *
   * Used to determine whether to do component disposal that is final and should only happen on shutdown
   */
  isStopping          = 0b0000000001000,
  /**
   * The invocation originates from a custom element/attribute's $bind
   *
   * e.g. for observers to determine whether they need to invoke subscribers or not
   *
   * May also be passed into a child $unbind call, which can then use it to determine a more efficient cleanup/caching strategy
   */
  isBinding           = 0b0000000010000,
  /**
   * The invocation originates from a custom element/attribute's $unbind
   *
   */
  isUnbinding         = 0b0000000100000,
  /**
   * The invocation originates from a bindable callback from an already-bound component
   *
   * This represents the counter-part to isBinding, and could be interpreted as "definitely invoke the subscribers"
   *
   * However, nothing is necessarily stopping both flags from being present simultaneously.
   * It is up to the receiver to decide what to do in such a case. We may actually want to revisit this at a later point
   * and decide certain guidelines on how to use the flags.
   */
  isBindableCallback  = 0b0000001000000,
  /**
   * The invocation/change originates from a sourceExpression and should flow towards a target observer, not back into the source.
   */
  sourceContext       = 0b0000010000000,
  /**
   * The invocation/change originates from a target observer and should flow towards a sourceExpression, not back into the target.
   */
  targetContext       = 0b0000100000000,
  // The following 4 are similar to source/target context and simply replace the strings from vCurrent. Not sure if they are really needed yet.
  computedContext     = 0b0001000000000,
  checkedArrayContext = 0b0010000000000,
  checkedValueContext = 0b0100000000000,
  selectArrayContext  = 0b1000000000000,
  context             = 0b1111111000000
}
