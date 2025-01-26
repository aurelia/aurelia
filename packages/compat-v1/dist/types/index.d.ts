import { IRegistry } from '@aurelia/kernel';
/**
 * Register all services/functionalities necessary for a v1 app to work with Aurelia v2.
 *
 * Ideally should only be used for migration as there maybe be perf penalties to application doing it this way.
 */
export declare const compatRegistration: IRegistry;
export { CallBinding, CallBindingCommand, CallBindingInstruction, CallBindingRenderer, callSyntax, } from './compat-call';
export { DelegateBindingCommand, DelegateBindingInstruction, DelegateListenerBinding, DelegateListenerOptions, EventDelegator, IEventDelegator, ListenerBindingRenderer, delegateSyntax, eventPreventDefaultBehavior, } from './compat-event';
export { BindingEngine, } from './compat-binding-engine';
export { enableComposeCompat, disableComposeCompat, } from './compat-au-compose';
export { inlineView, noView, } from './compat-custom-element';
//# sourceMappingURL=index.d.ts.map