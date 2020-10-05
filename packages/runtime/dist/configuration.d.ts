import { IContainer, IRegistry } from '@aurelia/kernel';
import { Now } from '@aurelia/scheduler';
import { AuSlot } from './resources/custom-elements/au-slot';
export declare const AtPrefixedTriggerAttributePatternRegistration: IRegistry;
export declare const ColonPrefixedBindAttributePatternRegistration: IRegistry;
export declare const RefAttributePatternRegistration: IRegistry;
export declare const DotSeparatedAttributePatternRegistration: IRegistry;
export declare const IExpressionParserRegistration: IRegistry;
export declare const IObserverLocatorRegistration: IRegistry;
export declare const ILifecycleRegistration: IRegistry;
export declare const IRendererRegistration: IRegistry;
export declare const IStartTaskManagerRegistration: IRegistry;
export declare const IViewLocatorRegistration: IRegistry;
/**
 * Default binding syntax for the following attribute name patterns:
 * - `ref`
 * - `target.command` (dot-separated)
 */
export declare const DefaultBindingSyntax: IRegistry[];
/**
 * Binding syntax for short-hand attribute name patterns:
 * - `@target` (short-hand for `target.trigger`)
 * - `:target` (short-hand for `target.bind`)
 */
export declare const ShortHandBindingSyntax: IRegistry[];
export declare const CallBindingCommandRegistration: IRegistry;
export declare const DefaultBindingCommandRegistration: IRegistry;
export declare const ForBindingCommandRegistration: IRegistry;
export declare const FromViewBindingCommandRegistration: IRegistry;
export declare const OneTimeBindingCommandRegistration: IRegistry;
export declare const ToViewBindingCommandRegistration: IRegistry;
export declare const TwoWayBindingCommandRegistration: IRegistry;
/**
 * Default runtime/environment-agnostic binding commands:
 * - Property observation: `.bind`, `.one-time`, `.from-view`, `.to-view`, `.two-way`
 * - Function call: `.call`
 * - Collection observation: `.for`
 */
export declare const DefaultBindingLanguage: IRegistry[];
/**
 * Default implementations for the following interfaces:
 * - `IExpressionParserRegistration`
 * - `IObserverLocator`
 * - `ILifecycle`
 * - `IRenderer`
 * - `IStartTaskManager`
 * - `IViewLocator`
 * - `IClockRegistration`
 * - `ISchedulerRegistration`
 */
export declare const DefaultComponents: (IRegistry | import("@aurelia/kernel").InterfaceSymbol<Now>)[];
export declare const FrequentMutationsRegistration: IRegistry;
export declare const InfrequentMutationsRegistration: IRegistry;
export declare const ObserveShallowRegistration: IRegistry;
export declare const IfRegistration: IRegistry;
export declare const ElseRegistration: IRegistry;
export declare const RepeatRegistration: IRegistry;
export declare const WithRegistration: IRegistry;
export declare const SanitizeValueConverterRegistration: IRegistry;
export declare const ViewValueConverterRegistration: IRegistry;
export declare const DebounceBindingBehaviorRegistration: IRegistry;
export declare const OneTimeBindingBehaviorRegistration: IRegistry;
export declare const ToViewBindingBehaviorRegistration: IRegistry;
export declare const FromViewBindingBehaviorRegistration: IRegistry;
export declare const SignalBindingBehaviorRegistration: IRegistry;
export declare const ThrottleBindingBehaviorRegistration: IRegistry;
export declare const TwoWayBindingBehaviorRegistration: IRegistry;
/**
 * Default resources:
 * - Template controllers (`if`/`else`, `repeat`, `with`)
 * - Value Converters (`sanitize`)
 * - Binding Behaviors (`oneTime`, `toView`, `fromView`, `twoWay`, `signal`, `debounce`, `throttle`)
 * - Custom element: au-slot
 */
export declare const DefaultResources: (typeof AuSlot | IRegistry)[];
export declare const CallBindingRendererRegistration: IRegistry;
export declare const CustomAttributeRendererRegistration: IRegistry;
export declare const CustomElementRendererRegistration: IRegistry;
export declare const InterpolationBindingRendererRegistration: IRegistry;
export declare const IteratorBindingRendererRegistration: IRegistry;
export declare const LetElementRendererRegistration: IRegistry;
export declare const PropertyBindingRendererRegistration: IRegistry;
export declare const RefBindingRendererRegistration: IRegistry;
export declare const SetPropertyRendererRegistration: IRegistry;
export declare const TemplateControllerRendererRegistration: IRegistry;
/**
 * Default renderers for:
 * - PropertyBinding: `bind`, `one-time`, `to-view`, `from-view`, `two-way`
 * - IteratorBinding: `for`
 * - CallBinding: `call`
 * - RefBinding: `ref`
 * - InterpolationBinding: `${}`
 * - SetProperty
 * - `customElement` hydration
 * - `customAttribute` hydration
 * - `templateController` hydration
 * - `let` element hydration
 */
export declare const DefaultRenderers: IRegistry[];
/**
 * A DI configuration object containing environment/runtime-agnostic registrations:
 * - `DefaultComponents`
 * - `DefaultResources`
 * - `DefaultRenderers`
 */
export declare const RuntimeConfiguration: {
    /**
     * Apply this configuration to the provided container.
     */
    register(container: IContainer): IContainer;
    /**
     * Create a new container with this configuration applied to it.
     */
    createContainer(): IContainer;
};
//# sourceMappingURL=configuration.d.ts.map