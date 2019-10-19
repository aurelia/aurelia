import { DI } from '@aurelia/kernel';
import { RuntimeConfiguration } from '@aurelia/runtime';
import { HTMLTemplateFactory } from './dom';
import { AttributeBindingRenderer, ListenerBindingRenderer, SetAttributeRenderer, StylePropertyBindingRenderer, TextBindingRenderer, SetClassAttributeRenderer, SetStyleAttributeRenderer } from './html-renderer';
import { TargetAccessorLocator, TargetObserverLocator } from './observation/observer-locator';
import { HTMLProjectorLocator } from './projectors';
import { AttrBindingBehavior } from './resources/binding-behaviors/attr';
import { SelfBindingBehavior } from './resources/binding-behaviors/self';
import { UpdateTriggerBindingBehavior } from './resources/binding-behaviors/update-trigger';
import { Blur } from './resources/custom-attributes/blur';
import { Focus } from './resources/custom-attributes/focus';
import { Portal } from './resources/custom-attributes/portal';
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
export const PortalRegistration = Portal;
export const FocusRegistration = Focus;
export const BlurRegistration = Blur;
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
export const ListenerBindingRendererRegistration = ListenerBindingRenderer;
export const AttributeBindingRendererRegistration = AttributeBindingRenderer;
export const SetAttributeRendererRegistration = SetAttributeRenderer;
export const SetClassAttributeRendererRegistration = SetClassAttributeRenderer;
export const SetStyleAttributeRendererRegistration = SetStyleAttributeRenderer;
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
    register(container) {
        return RuntimeConfiguration
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