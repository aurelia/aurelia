import { AnyBindingExpression, IAstEvaluator, IConnectableBinding } from '@aurelia/runtime';

export type IAstBasedBinding = IAstEvaluator & IConnectableBinding & {
  ast: AnyBindingExpression;
};
