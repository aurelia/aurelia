import { IContainer, IRegistry } from '@aurelia/kernel';
export declare const IProjectorLocatorRegistration: IRegistry;
export declare const ITargetAccessorLocatorRegistration: IRegistry;
export declare const ITargetObserverLocatorRegistration: IRegistry;
export declare const ITemplateFactoryRegistration: IRegistry;
/**
 * Default HTML-specific (but environment-agnostic) implementations for the following interfaces:
 * - `IProjectorLocator`
 * - `ITargetAccessorLocator`
 * - `ITargetObserverLocator`
 * - `ITemplateFactory`
 */
export declare const DefaultComponents: IRegistry[];
export declare const AttrBindingBehaviorRegistration: IRegistry;
export declare const SelfBindingBehaviorRegistration: IRegistry;
export declare const UpdateTriggerBindingBehaviorRegistration: IRegistry;
export declare const ComposeRegistration: IRegistry;
export declare const PortalRegistration: IRegistry;
export declare const FocusRegistration: IRegistry;
export declare const BlurRegistration: IRegistry;
/**
 * Default HTML-specific (but environment-agnostic) resources:
 * - Binding Behaviors: `attr`, `self`, `updateTrigger`
 * - Custom Elements: `au-compose`
 * - Custom Attributes: `blur`, `focus`, `portal`
 */
export declare const DefaultResources: IRegistry[];
export declare const ListenerBindingRendererRegistration: IRegistry;
export declare const AttributeBindingRendererRegistration: IRegistry;
export declare const SetAttributeRendererRegistration: IRegistry;
export declare const SetClassAttributeRendererRegistration: IRegistry;
export declare const SetStyleAttributeRendererRegistration: IRegistry;
export declare const StylePropertyBindingRendererRegistration: IRegistry;
export declare const TextBindingRendererRegistration: IRegistry;
/**
 * Default HTML-specfic (but environment-agnostic) renderers for:
 * - Listener Bindings: `trigger`, `capture`, `delegate`
 * - SetAttribute
 * - StyleProperty: `style`, `css`
 * - TextBinding: `${}`
 */
export declare const DefaultRenderers: IRegistry[];
/**
 * A DI configuration object containing html-specific (but environment-agnostic) registrations:
 * - `RuntimeConfiguration` from `@aurelia/runtime`
 * - `DefaultComponents`
 * - `DefaultResources`
 * - `DefaultRenderers`
 */
export declare const RuntimeHtmlConfiguration: {
    /**
     * Apply this configuration to the provided container.
     */
    register(container: IContainer): IContainer;
    /**
     * Create a new container with this configuration applied to it.
     */
    createContainer(): IContainer;
};
//# sourceMappingURL=configuration.d.ts.map