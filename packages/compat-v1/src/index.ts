import { IContainer, IRegistry } from '@aurelia/kernel';
import { defineAstMethods } from './compat-ast';
import { defineBindingMethods } from './compat-binding';
import { delegateSyntax, eventPreventDefaultBehavior } from './compat-event';
import { callSyntax } from './compat-call';
import { enableComposeCompat } from './compat-au-compose';

/**
 * Register all services/functionalities necessary for a v1 app to work with Aurelia v2.
 *
 * Ideally should only be used for migration as there maybe be perf penalties to application doing it this way.
 */
export const compatRegistration: IRegistry = {
  register(container: IContainer) {
    defineAstMethods();
    defineBindingMethods();
    enableComposeCompat();
    container.register(
      eventPreventDefaultBehavior,
      delegateSyntax,
      callSyntax,
    );
  }
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
  eventPreventDefaultBehavior,
} from './compat-event';

export {
  BindingEngine,
} from './compat-binding-engine';

export {
  enableComposeCompat,
  disableComposeCompat,
} from './compat-au-compose';
