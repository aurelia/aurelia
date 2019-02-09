import { DI, IContainer, IRegistry } from '@aurelia/kernel';
import { RuntimeBasicConfiguration } from '@aurelia/runtime';
import { HTMLTemplateFactory } from './dom';
import {
  ClassListBindingRenderer,
  CssRuleBindingRenderer,
  ListenerBindingRenderer,
  SetAttributeRenderer,
  StylePropertyBindingRenderer,
  TextBindingRenderer
} from './html-renderer';
import { TargetAccessorLocator, TargetObserverLocator } from './observation/observer-locator';
import { HTMLProjectorLocator } from './projectors';
import { AttrBindingBehavior } from './resources/binding-behaviors/attr';
import { SelfBindingBehavior } from './resources/binding-behaviors/self';
import { UpdateTriggerBindingBehavior } from './resources/binding-behaviors/update-trigger';
import { Compose } from './resources/custom-elements/compose';

export const IProjectorLocatorRegistration = HTMLProjectorLocator as IRegistry;
export const ITargetAccessorLocatorRegistration = TargetAccessorLocator as IRegistry;
export const ITargetObserverLocatorRegistration = TargetObserverLocator as IRegistry;
export const ITemplateFactoryRegistration = HTMLTemplateFactory as IRegistry;

/**
 * Default HTML-specific (but environment-agnostic) implementations for the following interfaces:
 * - `IProjectorLocator`
 * - `ITargetAccessorLocator`
 * - `ITargetObserverLocator`
 * - `ITemplateFactory`
 */
export const DefaultComponents = [
  IProjectorLocatorRegistration,
  ITargetAccessorLocatorRegistration,
  ITargetObserverLocatorRegistration,
  ITemplateFactoryRegistration
];

export const AttrBindingBehaviorRegistration = AttrBindingBehavior as IRegistry;
export const SelfBindingBehaviorRegistration = SelfBindingBehavior as IRegistry;
export const UpdateTriggerBindingBehaviorRegistration = UpdateTriggerBindingBehavior as IRegistry;
export const ComposeRegistration = Compose as IRegistry;

/**
 * Default HTML-specific (but environment-agnostic) resources:
 * - Binding Behaviors: `attr`, `self`, `updateTrigger`
 * - Custom Elements: `au-compose`
 */
export const DefaultResources = [
  AttrBindingBehaviorRegistration,
  SelfBindingBehaviorRegistration,
  UpdateTriggerBindingBehaviorRegistration,
  ComposeRegistration,
];

export const ListenerBindingRendererRegistration = ListenerBindingRenderer as IRegistry;
export const SetAttributeRendererRegistration = SetAttributeRenderer as IRegistry;
export const StylePropertyBindingRendererRegistration = StylePropertyBindingRenderer as IRegistry;
export const CssRuleBindingRendererRegistration = CssRuleBindingRenderer as IRegistry;
export const ClassListBindingRendererRegistration = ClassListBindingRenderer as IRegistry;
export const TextBindingRendererRegistration = TextBindingRenderer as IRegistry;

/**
 * Default HTML-specfic (but environment-agnostic) renderers for:
 * - Listener Bindings: `trigger`, `capture`, `delegate`
 * - SetAttribute
 * - StyleProperty: `style`, `css`
 * - TextBinding: `${}`
 */
export const DefaultRenderers = [
  CssRuleBindingRendererRegistration,
  ListenerBindingRendererRegistration,
  SetAttributeRendererRegistration,
  StylePropertyBindingRendererRegistration,
  ClassListBindingRendererRegistration,
  TextBindingRendererRegistration
];

/**
 * A DI configuration object containing html-specific (but environment-agnostic) registrations:
 * - `BasicConfiguration` from `@aurelia/runtime`
 * - `DefaultComponents`
 * - `DefaultResources`
 * - `DefaultRenderers`
 */
export const BasicConfiguration = {
  /**
   * Apply this configuration to the provided container.
   */
  register(container: IContainer): IContainer {
    return RuntimeBasicConfiguration
      .register(container)
      .register(
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
