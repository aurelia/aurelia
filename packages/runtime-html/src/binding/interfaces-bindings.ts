import { AnyBindingExpression, IConnectableBinding, LifecycleFlags } from '@aurelia/runtime';

export interface IAstBasedBinding extends IConnectableBinding {
  sourceExpression: AnyBindingExpression;
}

export const enum BindingFlags {
  /**
   * Indicates whether a binding should evaluate its expression in strict mode
   */
  strict = LifecycleFlags.isStrictBindingStrategy,
  /**
   * Indicates that a binding should only observe leaf properties in its expression
   */
  leafOnly = LifecycleFlags.observeLeafPropertiesOnly,
}
