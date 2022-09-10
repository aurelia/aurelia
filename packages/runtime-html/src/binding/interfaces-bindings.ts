import { AnyBindingExpression, IAstEvaluator, IConnectableBinding } from '@aurelia/runtime';
import { State } from '../templating/controller';

export type IAstBasedBinding = IAstEvaluator & IConnectableBinding & {
  ast: AnyBindingExpression;
};

export interface IBindingController {
  readonly state: State;
}
