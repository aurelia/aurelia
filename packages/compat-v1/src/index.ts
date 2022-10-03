import { IContainer, IRegistry } from '@aurelia/kernel';
import { defineAstMethods } from './compat-ast';
import { defineBindingMethods } from './compat-binding';
import { PreventFormActionlessSubmit } from './compat-form';
import { delegateRegistration } from './compat.delegate';

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
    delegateRegistration.register(container);
  }
};

export {
  PreventFormActionlessSubmit,
};

export {
  DelegateBindingCommand,
  DelegateBindingInstruction,
  DelegateListenerBinding,
  DelegateListenerOptions,
  EventDelegator,
  IEventDelegator,
  ListenerBindingRenderer,
  delegateRegistration
} from './compat.delegate';
