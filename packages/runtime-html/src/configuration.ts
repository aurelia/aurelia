import { DI, IContainer, IRegistry, Registration } from '@aurelia/kernel';
import {
  IDOMInitializer,
  IProjectorLocator,
  ITargetAccessorLocator,
  ITargetObserverLocator,
  ITemplateFactory,
  RuntimeConfiguration
} from '@aurelia/runtime';
import { HTMLDOMInitializer, HTMLTemplateFactory } from './dom';
import { HTMLRenderer } from './html-renderer';
import { TargetAccessorLocator, TargetObserverLocator } from './observation/observer-locator';
import { HTMLProjectorLocator } from './projectors';
import { AttrBindingBehavior } from './resources/binding-behaviors/attr';
import { SelfBindingBehavior } from './resources/binding-behaviors/self';
import { UpdateTriggerBindingBehavior } from './resources/binding-behaviors/update-trigger';
import { Compose } from './resources/custom-elements/compose';

export const HTMLRuntimeResources: IRegistry[] = [
  AttrBindingBehavior,
  SelfBindingBehavior,
  UpdateTriggerBindingBehavior,
  Compose
];

export const HTMLRuntimeConfiguration = {
  register(container: IContainer): void {
    container.register(
      ...HTMLRuntimeResources,
      RuntimeConfiguration,
      HTMLRenderer,
      Registration.singleton(IDOMInitializer, HTMLDOMInitializer),
      Registration.singleton(IProjectorLocator, HTMLProjectorLocator),
      Registration.singleton(ITargetAccessorLocator, TargetAccessorLocator),
      Registration.singleton(ITargetObserverLocator, TargetObserverLocator),
      Registration.singleton(ITemplateFactory, HTMLTemplateFactory)
    );
  },
  createContainer(): IContainer {
    const container = DI.createContainer();
    container.register(HTMLRuntimeConfiguration);
    return container;
  }
};
