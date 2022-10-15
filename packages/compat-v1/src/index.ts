import { IContainer, IRegistry } from '@aurelia/kernel';
import { defineAstMethods } from './compat-ast';
import { defineBindingMethods } from './compat-binding';
import { PreventFormActionlessSubmit } from './compat-form';
import { delegateSyntax } from './compat-delegate';
import { callSyntax } from './compat-call';

/**
 * Register all services/functionalities necessary for a v1 app to work with Aurelia v2.
 *
 * Ideally should only be used for migration as there maybe be perf penalties to application doing it this way.
 */
export const compatRegistration: IRegistry = {
  register(container: IContainer) {
    defineAstMethods();
    defineBindingMethods();
    container.register(PreventFormActionlessSubmit);
    delegateSyntax.register(container);
    callSyntax.register(container);
  }
};

export {
  PreventFormActionlessSubmit,
};

export {
  CallBinding,
  CallBindingCommand,
  CallBindingInstruction,
  CallBindingRenderer,
  callSyntax,
} from './compat-call';

export {
  DelegateBindingCommand,
  DelegateBindingInstruction,
  DelegateListenerBinding,
  DelegateListenerOptions,
  EventDelegator,
  IEventDelegator,
  ListenerBindingRenderer,
  delegateSyntax,
} from './compat-delegate';
