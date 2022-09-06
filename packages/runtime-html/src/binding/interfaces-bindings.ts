import { AnyBindingExpression, IConnectableBinding } from '@aurelia/runtime';

export interface IAstBasedBinding extends IConnectableBinding {
  sourceExpression: AnyBindingExpression;
}
