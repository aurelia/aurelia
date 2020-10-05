(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "@aurelia/runtime", "./binding-commands", "./html-attribute-syntax-transformer", "./template-compiler", "./template-element-factory", "./html-renderer", "./observation/observer-locator", "./projectors", "./resources/binding-behaviors/attr", "./resources/binding-behaviors/self", "./resources/binding-behaviors/update-trigger", "./resources/custom-attributes/blur", "./resources/custom-attributes/focus", "./resources/custom-attributes/portal", "./resources/custom-elements/compose"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RuntimeHtmlConfiguration = exports.DefaultRenderers = exports.TextBindingRendererRegistration = exports.StylePropertyBindingRendererRegistration = exports.SetStyleAttributeRendererRegistration = exports.SetClassAttributeRendererRegistration = exports.SetAttributeRendererRegistration = exports.AttributeBindingRendererRegistration = exports.ListenerBindingRendererRegistration = exports.DefaultResources = exports.BlurRegistration = exports.FocusRegistration = exports.PortalRegistration = exports.ComposeRegistration = exports.UpdateTriggerBindingBehaviorRegistration = exports.SelfBindingBehaviorRegistration = exports.AttrBindingBehaviorRegistration = exports.DefaultBindingLanguage = exports.StyleBindingCommandRegistration = exports.ClassBindingCommandRegistration = exports.AttrBindingCommandRegistration = exports.CaptureBindingCommandRegistration = exports.DelegateBindingCommandRegistration = exports.TriggerBindingCommandRegistration = exports.RefBindingCommandRegistration = exports.DefaultComponents = exports.ITargetObserverLocatorRegistration = exports.ITargetAccessorLocatorRegistration = exports.IProjectorLocatorRegistration = exports.IAttrSyntaxTransformerRegistation = exports.ITemplateElementFactoryRegistration = exports.ITemplateCompilerRegistration = void 0;
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    const binding_commands_1 = require("./binding-commands");
    const html_attribute_syntax_transformer_1 = require("./html-attribute-syntax-transformer");
    const template_compiler_1 = require("./template-compiler");
    const template_element_factory_1 = require("./template-element-factory");
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
    exports.ITemplateCompilerRegistration = template_compiler_1.TemplateCompiler;
    exports.ITemplateElementFactoryRegistration = template_element_factory_1.HTMLTemplateElementFactory;
    exports.IAttrSyntaxTransformerRegistation = html_attribute_syntax_transformer_1.HtmlAttrSyntaxTransformer;
    exports.IProjectorLocatorRegistration = projectors_1.HTMLProjectorLocator;
    exports.ITargetAccessorLocatorRegistration = observer_locator_1.TargetAccessorLocator;
    exports.ITargetObserverLocatorRegistration = observer_locator_1.TargetObserverLocator;
    /**
     * Default HTML-specific (but environment-agnostic) implementations for the following interfaces:
     * - `ITemplateCompiler`
     * - `ITemplateElementFactory`
     * - `IProjectorLocator`
     * - `ITargetAccessorLocator`
     * - `ITargetObserverLocator`
     * - `ITemplateFactory`
     */
    exports.DefaultComponents = [
        exports.ITemplateCompilerRegistration,
        exports.ITemplateElementFactoryRegistration,
        exports.IAttrSyntaxTransformerRegistation,
        exports.IProjectorLocatorRegistration,
        exports.ITargetAccessorLocatorRegistration,
        exports.ITargetObserverLocatorRegistration,
    ];
    exports.RefBindingCommandRegistration = binding_commands_1.RefBindingCommand;
    exports.TriggerBindingCommandRegistration = binding_commands_1.TriggerBindingCommand;
    exports.DelegateBindingCommandRegistration = binding_commands_1.DelegateBindingCommand;
    exports.CaptureBindingCommandRegistration = binding_commands_1.CaptureBindingCommand;
    exports.AttrBindingCommandRegistration = binding_commands_1.AttrBindingCommand;
    exports.ClassBindingCommandRegistration = binding_commands_1.ClassBindingCommand;
    exports.StyleBindingCommandRegistration = binding_commands_1.StyleBindingCommand;
    /**
     * Default HTML-specific (but environment-agnostic) binding commands:
     * - Event listeners: `.trigger`, `.delegate`, `.capture`
     */
    exports.DefaultBindingLanguage = [
        exports.RefBindingCommandRegistration,
        exports.TriggerBindingCommandRegistration,
        exports.DelegateBindingCommandRegistration,
        exports.CaptureBindingCommandRegistration,
        exports.ClassBindingCommandRegistration,
        exports.StyleBindingCommandRegistration,
        exports.AttrBindingCommandRegistration
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
                .register(...exports.DefaultComponents, ...exports.DefaultResources, ...exports.DefaultBindingLanguage, ...exports.DefaultRenderers);
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