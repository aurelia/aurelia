import { AnyBindingExpression, IAstEvaluator, IConnectableBinding } from '@aurelia/runtime';

export type IAstBasedBinding = IAstEvaluator & IConnectableBinding & {
  sourceExpression: AnyBindingExpression;
};
