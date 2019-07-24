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
import { PriorityBindingBehavior } from './resources/binding-behaviors/priority';
import { SignalBindingBehavior } from './resources/binding-behaviors/signals';
import { ThrottleBindingBehavior } from './resources/binding-behaviors/throttle';
import {
  Else,
  If
} from './resources/custom-attributes/if';
import { Repeat } from './resources/custom-attributes/repeat';
import { Replaceable } from './resources/custom-attributes/replaceable';
import { With } from './resources/custom-attributes/with';
import { SanitizeValueConverter } from './resources/value-converters/sanitize';

export const IObserverLocatorRegistration = ObserverLocator as IRegistry;
export const ILifecycleRegistration = Lifecycle as IRegistry;
export const IRendererRegistration = Renderer as IRegistry;
export const IStartTaskManagerRegistration = StartTaskManager as IRegistry;

/**
 * Default implementations for the following interfaces:
 * - `IObserverLocator`
 * - `ILifecycle`
 * - `IRenderer`
 */
export const DefaultComponents = [
  IObserverLocatorRegistration,
  ILifecycleRegistration,
  IRendererRegistration,
  IStartTaskManagerRegistration,
];

export const IfRegistration = If as IRegistry;
export const ElseRegistration = Else as IRegistry;
export const RepeatRegistration = Repeat as IRegistry;
export const ReplaceableRegistration = Replaceable as IRegistry;
export const WithRegistration = With as IRegistry;
export const SanitizeValueConverterRegistration = SanitizeValueConverter as IRegistry;
export const DebounceBindingBehaviorRegistration = DebounceBindingBehavior as IRegistry;
export const OneTimeBindingBehaviorRegistration = OneTimeBindingBehavior as IRegistry;
export const ToViewBindingBehaviorRegistration = ToViewBindingBehavior as IRegistry;
export const FromViewBindingBehaviorRegistration = FromViewBindingBehavior as IRegistry;
export const SignalBindingBehaviorRegistration = SignalBindingBehavior as IRegistry;
export const ThrottleBindingBehaviorRegistration = ThrottleBindingBehavior as IRegistry;
export const TwoWayBindingBehaviorRegistration = TwoWayBindingBehavior as IRegistry;
export const PriorityBindingBehaviorRegistration = PriorityBindingBehavior as IRegistry;

/**
 * Default resources:
 * - Template controllers (`if`/`else`, `repeat`, `replaceable`, `with`)
 * - Value Converters (`sanitize`)
 * - Binding Behaviors (`oneTime`, `toView`, `fromView`, `twoWay`, `signal`, `debounce`, `throttle`)
 */
export const DefaultResources = [
  IfRegistration,
  ElseRegistration,
  RepeatRegistration,
  ReplaceableRegistration,
  WithRegistration,
  SanitizeValueConverterRegistration,
  DebounceBindingBehaviorRegistration,
  OneTimeBindingBehaviorRegistration,
  ToViewBindingBehaviorRegistration,
  FromViewBindingBehaviorRegistration,
  SignalBindingBehaviorRegistration,
  PriorityBindingBehaviorRegistration,
  ThrottleBindingBehaviorRegistration,
  TwoWayBindingBehaviorRegistration
];

export const CallBindingRendererRegistration = CallBindingRenderer as IRegistry;
export const CustomAttributeRendererRegistration = CustomAttributeRenderer as IRegistry;
export const CustomElementRendererRegistration = CustomElementRenderer as IRegistry;
export const InterpolationBindingRendererRegistration = InterpolationBindingRenderer as IRegistry;
export const IteratorBindingRendererRegistration = IteratorBindingRenderer as IRegistry;
export const LetElementRendererRegistration = LetElementRenderer as IRegistry;
export const PropertyBindingRendererRegistration = PropertyBindingRenderer as IRegistry;
export const RefBindingRendererRegistration = RefBindingRenderer as IRegistry;
export const SetPropertyRendererRegistration = SetPropertyRenderer as IRegistry;
export const TemplateControllerRendererRegistration = TemplateControllerRenderer as IRegistry;

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
export const RuntimeBasicConfiguration = {
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
