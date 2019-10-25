import { IContainer, IRegistry } from '@aurelia/kernel';
export declare const IObserverLocatorRegistration: IRegistry;
export declare const ILifecycleRegistration: IRegistry;
export declare const IRendererRegistration: IRegistry;
export declare const IStartTaskManagerRegistration: IRegistry;
export declare const IViewLocatorRegistration: IRegistry;
export declare const IClockRegistration: IRegistry;
/**
 * Default implementations for the following interfaces:
 * - `IObserverLocator`
 * - `ILifecycle`
 * - `IRenderer`
 * - `IStartTaskManager`
 * - `IViewLocator`
 * - `IClockRegistration`
 * - `ISchedulerRegistration`
 */
export declare const DefaultComponents: IRegistry[];
export declare const FrequentMutationsRegistration: IRegistry;
export declare const InfrequentMutationsRegistration: IRegistry;
export declare const ObserveShallowRegistration: IRegistry;
export declare const IfRegistration: IRegistry;
export declare const ElseRegistration: IRegistry;
export declare const RepeatRegistration: IRegistry;
export declare const ReplaceableRegistration: IRegistry;
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
 * - Template controllers (`if`/`else`, `repeat`, `replaceable`, `with`)
 * - Value Converters (`sanitize`)
 * - Binding Behaviors (`oneTime`, `toView`, `fromView`, `twoWay`, `signal`, `debounce`, `throttle`)
 */
export declare const DefaultResources: IRegistry[];
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