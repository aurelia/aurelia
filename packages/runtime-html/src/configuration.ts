import { DI, IContainer, IRegistry } from '@aurelia/kernel';
import { RuntimeConfiguration } from '@aurelia/runtime';
import { HTMLTemplateFactory } from './dom';
import {
  AttributeBindingRenderer,
  ListenerBindingRenderer,
  SetAttributeRenderer,
  StylePropertyBindingRenderer,
  TextBindingRenderer,
  SetClassAttributeRenderer,
  SetStyleAttributeRenderer
} from './html-renderer';
import { TargetAccessorLocator, TargetObserverLocator } from './observation/observer-locator';
import { HTMLProjectorLocator } from './projectors';
import { AttrBindingBehavior } from './resources/binding-behaviors/attr';
import { SelfBindingBehavior } from './resources/binding-behaviors/self';
import { UpdateTriggerBindingBehavior } from './resources/binding-behaviors/update-trigger';
import { Blur } from './resources/custom-attributes/blur';
import { Focus } from './resources/custom-attributes/focus';
import { Portal } from './resources/custom-attributes/portal';
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

export const AttrBindingBehaviorRegistration = AttrBindingBehavior as unknown as IRegistry;
export const SelfBindingBehaviorRegistration = SelfBindingBehavior as unknown as IRegistry;
export const UpdateTriggerBindingBehaviorRegistration = UpdateTriggerBindingBehavior as unknown as IRegistry;
export const ComposeRegistration = Compose as unknown as IRegistry;
export const PortalRegistration = Portal as unknown as IRegistry;
export const FocusRegistration = Focus as unknown as IRegistry;
export const BlurRegistration = Blur as unknown as IRegistry;

/**
 * Default HTML-specific (but environment-agnostic) resources:
 * - Binding Behaviors: `attr`, `self`, `updateTrigger`
 * - Custom Elements: `au-compose`
 * - Custom Attributes: `blur`, `focus`, `portal`
 */
export const DefaultResources = [
  AttrBindingBehaviorRegistration,
  SelfBindingBehaviorRegistration,
  UpdateTriggerBindingBehaviorRegistration,
  ComposeRegistration,
  PortalRegistration,
  FocusRegistration,
  BlurRegistration
];

export const ListenerBindingRendererRegistration = ListenerBindingRenderer as IRegistry;
export const AttributeBindingRendererRegistration = AttributeBindingRenderer as IRegistry;
export const SetAttributeRendererRegistration = SetAttributeRenderer as IRegistry;
export const SetClassAttributeRendererRegistration = SetClassAttributeRenderer as IRegistry;
export const SetStyleAttributeRendererRegistration = SetStyleAttributeRenderer as IRegistry;
export const StylePropertyBindingRendererRegistration = StylePropertyBindingRenderer as IRegistry;
export const TextBindingRendererRegistration = TextBindingRenderer as IRegistry;

/**
 * Default HTML-specfic (but environment-agnostic) renderers for:
 * - Listener Bindings: `trigger`, `capture`, `delegate`
 * - SetAttribute
 * - StyleProperty: `style`, `css`
 * - TextBinding: `${}`
 */
export const DefaultRenderers = [
  ListenerBindingRendererRegistration,
  AttributeBindingRendererRegistration,
  SetAttributeRendererRegistration,
  SetClassAttributeRendererRegistration,
  SetStyleAttributeRendererRegistration,
  StylePropertyBindingRendererRegistration,
  TextBindingRendererRegistration
];

/**
 * A DI configuration object containing html-specific (but environment-agnostic) registrations:
 * - `RuntimeConfiguration` from `@aurelia/runtime`
 * - `DefaultComponents`
 * - `DefaultResources`
 * - `DefaultRenderers`
 */
export const RuntimeHtmlConfiguration = {
  /**
   * Apply this configuration to the provided container.
   */
  register(container: IContainer): IContainer {
    return RuntimeConfiguration
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
