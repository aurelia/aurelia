import { AnyBindingExpression, IAstEvaluator, IConnectableBinding } from '@aurelia/runtime';

export interface IAstBasedBinding extends IConnectableBinding, IAstEvaluator {
  sourceExpression: AnyBindingExpression;
}
