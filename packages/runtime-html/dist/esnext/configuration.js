import { DI } from '@aurelia/kernel';
import { RuntimeBasicConfiguration } from '@aurelia/runtime';
import { HTMLTemplateFactory } from './dom';
import { AttributeBindingRenderer, ListenerBindingRenderer, SetAttributeRenderer, StylePropertyBindingRenderer, TextBindingRenderer } from './html-renderer';
import { TargetAccessorLocator, TargetObserverLocator } from './observation/observer-locator';
import { HTMLProjectorLocator } from './projectors';
import { AttrBindingBehavior } from './resources/binding-behaviors/attr';
import { SelfBindingBehavior } from './resources/binding-behaviors/self';
import { UpdateTriggerBindingBehavior } from './resources/binding-behaviors/update-trigger';
import { Compose } from './resources/custom-elements/compose';
export const IProjectorLocatorRegistration = HTMLProjectorLocator;
export const ITargetAccessorLocatorRegistration = TargetAccessorLocator;
export const ITargetObserverLocatorRegistration = TargetObserverLocator;
export const ITemplateFactoryRegistration = HTMLTemplateFactory;
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
export const AttrBindingBehaviorRegistration = AttrBindingBehavior;
export const SelfBindingBehaviorRegistration = SelfBindingBehavior;
export const UpdateTriggerBindingBehaviorRegistration = UpdateTriggerBindingBehavior;
export const ComposeRegistration = Compose;
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
export const ListenerBindingRendererRegistration = ListenerBindingRenderer;
export const AttributeBindingRendererRegistration = AttributeBindingRenderer;
export const SetAttributeRendererRegistration = SetAttributeRenderer;
export const StylePropertyBindingRendererRegistration = StylePropertyBindingRenderer;
export const TextBindingRendererRegistration = TextBindingRenderer;
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
    StylePropertyBindingRendererRegistration,
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
    register(container) {
        return RuntimeBasicConfiguration
            .register(container)
            .register(...DefaultComponents, ...DefaultResources, ...DefaultRenderers);
    },
    /**
     * Create a new container with this configuration applied to it.
     */
    createContainer() {
        return this.register(DI.createContainer());
    }
};
//# sourceMappingURL=configuration.js.map