import { DI, IContainer, IRegistry, Registration } from '@aurelia/kernel';
import { ILifecycle, Lifecycle } from './lifecycle';
import { IObserverLocator, ObserverLocator } from './observation/observer-locator';
import { BasicRenderer } from './renderer';
import { FromViewBindingBehavior, OneTimeBindingBehavior, ToViewBindingBehavior, TwoWayBindingBehavior } from './resources/binding-behaviors/binding-mode';
import { DebounceBindingBehavior } from './resources/binding-behaviors/debounce';
import { SignalBindingBehavior } from './resources/binding-behaviors/signals';
import { ThrottleBindingBehavior } from './resources/binding-behaviors/throttle';
import { Else, If } from './resources/custom-attributes/if';
import { Repeat } from './resources/custom-attributes/repeat';
import { Replaceable } from './resources/custom-attributes/replaceable';
import { With } from './resources/custom-attributes/with';
import { SanitizeValueConverter } from './resources/value-converters/sanitize';

export const GlobalResources: IRegistry[] = [
  If,
  Else,
  Repeat,
  Replaceable,
  With,
  SanitizeValueConverter,
  DebounceBindingBehavior,
  OneTimeBindingBehavior,
  ToViewBindingBehavior,
  FromViewBindingBehavior,
  SignalBindingBehavior,
  ThrottleBindingBehavior,
  TwoWayBindingBehavior
];

export const RuntimeConfiguration = {
  register(container: IContainer): void {
    container.register(
      BasicRenderer,
      Registration.singleton(IObserverLocator, ObserverLocator),
      Registration.singleton(ILifecycle, Lifecycle),
      ...GlobalResources
    );
  },
  createContainer(): IContainer {
    const container = DI.createContainer();
    container.register(RuntimeConfiguration);
    return container;
  }
};
