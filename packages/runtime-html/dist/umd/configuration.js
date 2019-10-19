(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "@aurelia/runtime", "./dom", "./html-renderer", "./observation/observer-locator", "./projectors", "./resources/binding-behaviors/attr", "./resources/binding-behaviors/self", "./resources/binding-behaviors/update-trigger", "./resources/custom-attributes/blur", "./resources/custom-attributes/focus", "./resources/custom-attributes/portal", "./resources/custom-elements/compose"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    const dom_1 = require("./dom");
    const html_renderer_1 = require("./html-renderer");
    const observer_locator_1 = require("./observation/observer-locator");
    const projectors_1 = require("./projectors");
    const attr_1 = require("./resources/binding-behaviors/attr");
    const self_1 = require("./resources/binding-behaviors/self");
    const update_trigger_1 = require("./resources/binding-behaviors/update-trigger");
    const blur_1 = require("./resources/custom-attributes/blur");
    const focus_1 = require("./resources/custom-attributes/focus");
    const portal_1 = require("./resources/custom-attributes/portal");
    const compose_1 = require("./resources/custom-elements/compose");
    exports.IProjectorLocatorRegistration = projectors_1.HTMLProjectorLocator;
    exports.ITargetAccessorLocatorRegistration = observer_locator_1.TargetAccessorLocator;
    exports.ITargetObserverLocatorRegistration = observer_locator_1.TargetObserverLocator;
    exports.ITemplateFactoryRegistration = dom_1.HTMLTemplateFactory;
    /**
     * Default HTML-specific (but environment-agnostic) implementations for the following interfaces:
     * - `IProjectorLocator`
     * - `ITargetAccessorLocator`
     * - `ITargetObserverLocator`
     * - `ITemplateFactory`
     */
    exports.DefaultComponents = [
        exports.IProjectorLocatorRegistration,
        exports.ITargetAccessorLocatorRegistration,
        exports.ITargetObserverLocatorRegistration,
        exports.ITemplateFactoryRegistration
    ];
    exports.AttrBindingBehaviorRegistration = attr_1.AttrBindingBehavior;
    exports.SelfBindingBehaviorRegistration = self_1.SelfBindingBehavior;
    exports.UpdateTriggerBindingBehaviorRegistration = update_trigger_1.UpdateTriggerBindingBehavior;
    exports.ComposeRegistration = compose_1.Compose;
    exports.PortalRegistration = portal_1.Portal;
    exports.FocusRegistration = focus_1.Focus;
    exports.BlurRegistration = blur_1.Blur;
    /**
     * Default HTML-specific (but environment-agnostic) resources:
     * - Binding Behaviors: `attr`, `self`, `updateTrigger`
     * - Custom Elements: `au-compose`
     * - Custom Attributes: `blur`, `focus`, `portal`
     */
    exports.DefaultResources = [
        exports.AttrBindingBehaviorRegistration,
        exports.SelfBindingBehaviorRegistration,
        exports.UpdateTriggerBindingBehaviorRegistration,
        exports.ComposeRegistration,
        exports.PortalRegistration,
        exports.FocusRegistration,
        exports.BlurRegistration
    ];
    exports.ListenerBindingRendererRegistration = html_renderer_1.ListenerBindingRenderer;
    exports.AttributeBindingRendererRegistration = html_renderer_1.AttributeBindingRenderer;
    exports.SetAttributeRendererRegistration = html_renderer_1.SetAttributeRenderer;
    exports.SetClassAttributeRendererRegistration = html_renderer_1.SetClassAttributeRenderer;
    exports.SetStyleAttributeRendererRegistration = html_renderer_1.SetStyleAttributeRenderer;
    exports.StylePropertyBindingRendererRegistration = html_renderer_1.StylePropertyBindingRenderer;
    exports.TextBindingRendererRegistration = html_renderer_1.TextBindingRenderer;
    /**
     * Default HTML-specfic (but environment-agnostic) renderers for:
     * - Listener Bindings: `trigger`, `capture`, `delegate`
     * - SetAttribute
     * - StyleProperty: `style`, `css`
     * - TextBinding: `${}`
     */
    exports.DefaultRenderers = [
        exports.ListenerBindingRendererRegistration,
        exports.AttributeBindingRendererRegistration,
        exports.SetAttributeRendererRegistration,
        exports.SetClassAttributeRendererRegistration,
        exports.SetStyleAttributeRendererRegistration,
        exports.StylePropertyBindingRendererRegistration,
        exports.TextBindingRendererRegistration
    ];
    /**
     * A DI configuration object containing html-specific (but environment-agnostic) registrations:
     * - `RuntimeConfiguration` from `@aurelia/runtime`
     * - `DefaultComponents`
     * - `DefaultResources`
     * - `DefaultRenderers`
     */
    exports.RuntimeHtmlConfiguration = {
        /**
         * Apply this configuration to the provided container.
         */
        register(container) {
            return runtime_1.RuntimeConfiguration
                .register(container)
                .register(...exports.DefaultComponents, ...exports.DefaultResources, ...exports.DefaultRenderers);
        },
        /**
         * Create a new container with this configuration applied to it.
         */
        createContainer() {
            return this.register(kernel_1.DI.createContainer());
        }
    };
});
//# sourceMappingURL=configuration.js.map