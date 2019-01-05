import { DI, IContainer, IRegistry, Registration } from '@aurelia/kernel';
import { ILifecycle, Lifecycle } from './lifecycle';
import { IObserverLocator, ObserverLocator } from './observation/observer-locator';
import { BasicRenderer, Renderer } from './renderer';
import { IRenderer } from './rendering-engine';
import { FromViewBindingBehavior, OneTimeBindingBehavior, ToViewBindingBehavior, TwoWayBindingBehavior } from './resources/binding-behaviors/binding-mode';
import { DebounceBindingBehavior } from './resources/binding-behaviors/debounce';
import { SignalBindingBehavior } from './resources/binding-behaviors/signals';
import { ThrottleBindingBehavior } from './resources/binding-behaviors/throttle';
import { Else, If } from './resources/custom-attributes/if';
import { Repeat } from './resources/custom-attributes/repeat';
import { Replaceable } from './resources/custom-attributes/replaceable';
import { With } from './resources/custom-attributes/with';
import { SanitizeValueConverter } from './resources/value-converters/sanitize';

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

export const GlobalResources = [
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
  ThrottleBindingBehaviorRegistration,
  TwoWayBindingBehaviorRegistration
];

export const ObserverLocatorRegistration = Registration.singleton(IObserverLocator, ObserverLocator) as IRegistry;
export const LifecycleRegistration = Registration.singleton(ILifecycle, Lifecycle) as IRegistry;
export const RendererRegistration = Registration.singleton(IRenderer, Renderer) as IRegistry;

export const RuntimeConfiguration = {
  register(container: IContainer): void {
    container.register(
      BasicRenderer,
      ObserverLocatorRegistration,
      LifecycleRegistration,
      RendererRegistration,
      ...GlobalResources
    );
  },
  createContainer(): IContainer {
    const container = DI.createContainer();
    container.register(RuntimeConfiguration);
    return container;
  }
};
