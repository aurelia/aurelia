import {
  DI,
  IContainer,
  IRegistry
} from '@aurelia/kernel';
import { Lifecycle } from './lifecycle';
import { StartTaskManager } from './lifecycle-task';
import { ObserverLocator } from './observation/observer-locator';
import {
  CallBindingRenderer,
  CustomAttributeRenderer,
  CustomElementRenderer,
  InterpolationBindingRenderer,
  IteratorBindingRenderer,
  LetElementRenderer,
  PropertyBindingRenderer,
  RefBindingRenderer,
  Renderer,
  SetPropertyRenderer,
  TemplateControllerRenderer
} from './renderer';
import {
  FromViewBindingBehavior,
  OneTimeBindingBehavior,
  ToViewBindingBehavior,
  TwoWayBindingBehavior
} from './resources/binding-behaviors/binding-mode';
import { DebounceBindingBehavior } from './resources/binding-behaviors/debounce';
import { SignalBindingBehavior } from './resources/binding-behaviors/signals';
import { ThrottleBindingBehavior } from './resources/binding-behaviors/throttle';
import { FrequentMutations, InfrequentMutations, ObserveShallow } from './resources/custom-attributes/flags';
import { Else, If } from './resources/custom-attributes/if';
import { Repeat } from './resources/custom-attributes/repeat';
import { Replaceable } from './resources/custom-attributes/replaceable';
import { With } from './resources/custom-attributes/with';
import { SanitizeValueConverter } from './resources/value-converters/sanitize';
import { ViewValueConverter } from './resources/value-converters/view';
import { ViewLocator } from './templating/view';
import { Clock } from './scheduler';

export const IObserverLocatorRegistration = ObserverLocator as IRegistry;
export const ILifecycleRegistration = Lifecycle as IRegistry;
export const IRendererRegistration = Renderer as IRegistry;
export const IStartTaskManagerRegistration = StartTaskManager as IRegistry;
export const IViewLocatorRegistration = ViewLocator as IRegistry;
export const IClockRegistration = Clock as IRegistry;

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
export const DefaultComponents = [
  IObserverLocatorRegistration,
  ILifecycleRegistration,
  IRendererRegistration,
  IStartTaskManagerRegistration,
  IViewLocatorRegistration,
  IClockRegistration,
];

export const FrequentMutationsRegistration = FrequentMutations as unknown as IRegistry;
export const InfrequentMutationsRegistration = InfrequentMutations as unknown as IRegistry;
export const ObserveShallowRegistration = ObserveShallow as unknown as IRegistry;
export const IfRegistration = If as unknown as IRegistry;
export const ElseRegistration = Else as unknown as IRegistry;
export const RepeatRegistration = Repeat as unknown as IRegistry;
export const ReplaceableRegistration = Replaceable as unknown as IRegistry;
export const WithRegistration = With as unknown as IRegistry;
export const SanitizeValueConverterRegistration = SanitizeValueConverter as unknown as IRegistry;
export const ViewValueConverterRegistration = ViewValueConverter as unknown as IRegistry;
export const DebounceBindingBehaviorRegistration = DebounceBindingBehavior as unknown as IRegistry;
export const OneTimeBindingBehaviorRegistration = OneTimeBindingBehavior as unknown as IRegistry;
export const ToViewBindingBehaviorRegistration = ToViewBindingBehavior as unknown as IRegistry;
export const FromViewBindingBehaviorRegistration = FromViewBindingBehavior as unknown as IRegistry;
export const SignalBindingBehaviorRegistration = SignalBindingBehavior as unknown as IRegistry;
export const ThrottleBindingBehaviorRegistration = ThrottleBindingBehavior as unknown as IRegistry;
export const TwoWayBindingBehaviorRegistration = TwoWayBindingBehavior as unknown as IRegistry;

/**
 * Default resources:
 * - Template controllers (`if`/`else`, `repeat`, `replaceable`, `with`)
 * - Value Converters (`sanitize`)
 * - Binding Behaviors (`oneTime`, `toView`, `fromView`, `twoWay`, `signal`, `debounce`, `throttle`)
 */
export const DefaultResources = [
  FrequentMutationsRegistration,
  InfrequentMutationsRegistration,
  ObserveShallowRegistration,
  IfRegistration,
  ElseRegistration,
  RepeatRegistration,
  ReplaceableRegistration,
  WithRegistration,
  SanitizeValueConverterRegistration,
  ViewValueConverterRegistration,
  DebounceBindingBehaviorRegistration,
  OneTimeBindingBehaviorRegistration,
  ToViewBindingBehaviorRegistration,
  FromViewBindingBehaviorRegistration,
  SignalBindingBehaviorRegistration,
  ThrottleBindingBehaviorRegistration,
  TwoWayBindingBehaviorRegistration
];

export const CallBindingRendererRegistration = CallBindingRenderer as unknown as IRegistry;
export const CustomAttributeRendererRegistration = CustomAttributeRenderer as unknown as IRegistry;
export const CustomElementRendererRegistration = CustomElementRenderer as unknown as IRegistry;
export const InterpolationBindingRendererRegistration = InterpolationBindingRenderer as unknown as IRegistry;
export const IteratorBindingRendererRegistration = IteratorBindingRenderer as unknown as IRegistry;
export const LetElementRendererRegistration = LetElementRenderer as unknown as IRegistry;
export const PropertyBindingRendererRegistration = PropertyBindingRenderer as unknown as IRegistry;
export const RefBindingRendererRegistration = RefBindingRenderer as unknown as IRegistry;
export const SetPropertyRendererRegistration = SetPropertyRenderer as unknown as IRegistry;
export const TemplateControllerRendererRegistration = TemplateControllerRenderer as unknown as IRegistry;

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
export const DefaultRenderers = [
  PropertyBindingRendererRegistration,
  IteratorBindingRendererRegistration,
  CallBindingRendererRegistration,
  RefBindingRendererRegistration,
  InterpolationBindingRendererRegistration,
  SetPropertyRendererRegistration,
  CustomElementRendererRegistration,
  CustomAttributeRendererRegistration,
  TemplateControllerRendererRegistration,
  LetElementRendererRegistration
];

/**
 * A DI configuration object containing environment/runtime-agnostic registrations:
 * - `DefaultComponents`
 * - `DefaultResources`
 * - `DefaultRenderers`
 */
export const RuntimeConfiguration = {
  /**
   * Apply this configuration to the provided container.
   */
  register(container: IContainer): IContainer {
    return container.register(
      ...DefaultComponents,
      ...DefaultResources,
      ...DefaultRenderers
    );
  },
  /**
   * Create a new container with this configuration applied to it.
   */
  createContainer(): IContainer {
    return this.register(DI.createContainer());
  }
};
