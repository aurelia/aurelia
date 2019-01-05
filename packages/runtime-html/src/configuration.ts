import { DI, IContainer, IRegistry } from '@aurelia/kernel';
import { RuntimeConfiguration } from '@aurelia/runtime';
import { HTMLTemplateFactory } from './dom';
import { HTMLRenderer } from './html-renderer';
import { TargetAccessorLocator, TargetObserverLocator } from './observation/observer-locator';
import { HTMLProjectorLocator } from './projectors';
import { AttrBindingBehavior } from './resources/binding-behaviors/attr';
import { SelfBindingBehavior } from './resources/binding-behaviors/self';
import { UpdateTriggerBindingBehavior } from './resources/binding-behaviors/update-trigger';
import { Compose } from './resources/custom-elements/compose';

export const AttrBindingBehaviorRegistration = AttrBindingBehavior as IRegistry;
export const SelfBindingBehaviorRegistration = SelfBindingBehavior as IRegistry;
export const UpdateTriggerBindingBehaviorRegistration = UpdateTriggerBindingBehavior as IRegistry;
export const ComposeRegistration = Compose as IRegistry;

export const HTMLRuntimeResources = [
  AttrBindingBehaviorRegistration,
  SelfBindingBehaviorRegistration,
  UpdateTriggerBindingBehaviorRegistration,
  ComposeRegistration,
];

export const ProjectorLocatorRegistration = HTMLProjectorLocator as IRegistry;
export const TargetAccessorLocatorRegistration = TargetAccessorLocator as IRegistry;
export const TargetObserverLocatorRegistration = TargetObserverLocator as IRegistry;
export const TemplateFactoryRegistration = HTMLTemplateFactory as IRegistry;

export const HTMLRuntimeConfiguration = {
  register(container: IContainer): void {
    container.register(
      ...HTMLRuntimeResources,
      RuntimeConfiguration,
      HTMLRenderer,
      ProjectorLocatorRegistration,
      TargetAccessorLocatorRegistration,
      TargetObserverLocatorRegistration,
      TemplateFactoryRegistration
    );
  },
  createContainer(): IContainer {
    const container = DI.createContainer();
    container.register(HTMLRuntimeConfiguration);
    return container;
  }
};
