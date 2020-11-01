(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "@aurelia/runtime", "./resources/attribute-pattern", "./resources/binding-command", "./template-compiler", "./renderer", "./observation/observer-locator", "./observation/svg-analyzer", "./resources/binding-behaviors/attr", "./resources/binding-behaviors/self", "./resources/binding-behaviors/update-trigger", "./resources/custom-attributes/blur", "./resources/custom-attributes/focus", "./resources/template-controllers/portal", "./resources/template-controllers/flags", "./resources/template-controllers/if", "./resources/template-controllers/repeat", "./resources/template-controllers/with", "./resources/template-controllers/switch", "./resources/custom-elements/compose", "./resources/custom-elements/au-slot", "./resources/value-converters/sanitize", "./resources/value-converters/view"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StandardConfiguration = exports.DefaultRenderers = exports.TextBindingRendererRegistration = exports.StylePropertyBindingRendererRegistration = exports.SetStyleAttributeRendererRegistration = exports.SetClassAttributeRendererRegistration = exports.SetAttributeRendererRegistration = exports.AttributeBindingRendererRegistration = exports.ListenerBindingRendererRegistration = exports.TemplateControllerRendererRegistration = exports.SetPropertyRendererRegistration = exports.RefBindingRendererRegistration = exports.PropertyBindingRendererRegistration = exports.LetElementRendererRegistration = exports.IteratorBindingRendererRegistration = exports.InterpolationBindingRendererRegistration = exports.CustomElementRendererRegistration = exports.CustomAttributeRendererRegistration = exports.CallBindingRendererRegistration = exports.DefaultResources = exports.BlurRegistration = exports.FocusRegistration = exports.PortalRegistration = exports.ComposeRegistration = exports.UpdateTriggerBindingBehaviorRegistration = exports.SelfBindingBehaviorRegistration = exports.AttrBindingBehaviorRegistration = exports.DefaultCaseRegistration = exports.CaseRegistration = exports.SwitchRegistration = exports.WithRegistration = exports.RepeatRegistration = exports.ElseRegistration = exports.IfRegistration = exports.ObserveShallowRegistration = exports.InfrequentMutationsRegistration = exports.FrequentMutationsRegistration = exports.ViewValueConverterRegistration = exports.SanitizeValueConverterRegistration = exports.DefaultBindingLanguage = exports.StyleBindingCommandRegistration = exports.ClassBindingCommandRegistration = exports.AttrBindingCommandRegistration = exports.CaptureBindingCommandRegistration = exports.DelegateBindingCommandRegistration = exports.TriggerBindingCommandRegistration = exports.RefBindingCommandRegistration = exports.TwoWayBindingCommandRegistration = exports.ToViewBindingCommandRegistration = exports.OneTimeBindingCommandRegistration = exports.FromViewBindingCommandRegistration = exports.ForBindingCommandRegistration = exports.DefaultBindingCommandRegistration = exports.CallBindingCommandRegistration = exports.ShortHandBindingSyntax = exports.DefaultBindingSyntax = exports.DotSeparatedAttributePatternRegistration = exports.RefAttributePatternRegistration = exports.ColonPrefixedBindAttributePatternRegistration = exports.AtPrefixedTriggerAttributePatternRegistration = exports.SVGAnalyzerRegistration = exports.DefaultComponents = exports.ITargetObserverLocatorRegistration = exports.ITargetAccessorLocatorRegistration = exports.ITemplateCompilerRegistration = void 0;
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    const attribute_pattern_1 = require("./resources/attribute-pattern");
    const binding_command_1 = require("./resources/binding-command");
    const template_compiler_1 = require("./template-compiler");
    const renderer_1 = require("./renderer");
    const observer_locator_1 = require("./observation/observer-locator");
    const svg_analyzer_1 = require("./observation/svg-analyzer");
    const attr_1 = require("./resources/binding-behaviors/attr");
    const self_1 = require("./resources/binding-behaviors/self");
    const update_trigger_1 = require("./resources/binding-behaviors/update-trigger");
    const blur_1 = require("./resources/custom-attributes/blur");
    const focus_1 = require("./resources/custom-attributes/focus");
    const portal_1 = require("./resources/template-controllers/portal");
    const flags_1 = require("./resources/template-controllers/flags");
    const if_1 = require("./resources/template-controllers/if");
    const repeat_1 = require("./resources/template-controllers/repeat");
    const with_1 = require("./resources/template-controllers/with");
    const switch_1 = require("./resources/template-controllers/switch");
    const compose_1 = require("./resources/custom-elements/compose");
    const au_slot_1 = require("./resources/custom-elements/au-slot");
    const sanitize_1 = require("./resources/value-converters/sanitize");
    const view_1 = require("./resources/value-converters/view");
    exports.ITemplateCompilerRegistration = template_compiler_1.TemplateCompiler;
    exports.ITargetAccessorLocatorRegistration = observer_locator_1.TargetAccessorLocator;
    exports.ITargetObserverLocatorRegistration = observer_locator_1.TargetObserverLocator;
    /**
     * Default HTML-specific (but environment-agnostic) implementations for the following interfaces:
     * - `ITemplateCompiler`
     * - `ITargetAccessorLocator`
     * - `ITargetObserverLocator`
     */
    exports.DefaultComponents = [
        exports.ITemplateCompilerRegistration,
        exports.ITargetAccessorLocatorRegistration,
        exports.ITargetObserverLocatorRegistration,
    ];
    exports.SVGAnalyzerRegistration = svg_analyzer_1.SVGAnalyzer;
    exports.AtPrefixedTriggerAttributePatternRegistration = attribute_pattern_1.AtPrefixedTriggerAttributePattern;
    exports.ColonPrefixedBindAttributePatternRegistration = attribute_pattern_1.ColonPrefixedBindAttributePattern;
    exports.RefAttributePatternRegistration = attribute_pattern_1.RefAttributePattern;
    exports.DotSeparatedAttributePatternRegistration = attribute_pattern_1.DotSeparatedAttributePattern;
    /**
     * Default binding syntax for the following attribute name patterns:
     * - `ref`
     * - `target.command` (dot-separated)
     */
    exports.DefaultBindingSyntax = [
        exports.RefAttributePatternRegistration,
        exports.DotSeparatedAttributePatternRegistration
    ];
    /**
     * Binding syntax for short-hand attribute name patterns:
     * - `@target` (short-hand for `target.trigger`)
     * - `:target` (short-hand for `target.bind`)
     */
    exports.ShortHandBindingSyntax = [
        exports.AtPrefixedTriggerAttributePatternRegistration,
        exports.ColonPrefixedBindAttributePatternRegistration
    ];
    exports.CallBindingCommandRegistration = binding_command_1.CallBindingCommand;
    exports.DefaultBindingCommandRegistration = binding_command_1.DefaultBindingCommand;
    exports.ForBindingCommandRegistration = binding_command_1.ForBindingCommand;
    exports.FromViewBindingCommandRegistration = binding_command_1.FromViewBindingCommand;
    exports.OneTimeBindingCommandRegistration = binding_command_1.OneTimeBindingCommand;
    exports.ToViewBindingCommandRegistration = binding_command_1.ToViewBindingCommand;
    exports.TwoWayBindingCommandRegistration = binding_command_1.TwoWayBindingCommand;
    exports.RefBindingCommandRegistration = binding_command_1.RefBindingCommand;
    exports.TriggerBindingCommandRegistration = binding_command_1.TriggerBindingCommand;
    exports.DelegateBindingCommandRegistration = binding_command_1.DelegateBindingCommand;
    exports.CaptureBindingCommandRegistration = binding_command_1.CaptureBindingCommand;
    exports.AttrBindingCommandRegistration = binding_command_1.AttrBindingCommand;
    exports.ClassBindingCommandRegistration = binding_command_1.ClassBindingCommand;
    exports.StyleBindingCommandRegistration = binding_command_1.StyleBindingCommand;
    /**
     * Default HTML-specific (but environment-agnostic) binding commands:
     * - Property observation: `.bind`, `.one-time`, `.from-view`, `.to-view`, `.two-way`
     * - Function call: `.call`
     * - Collection observation: `.for`
     * - Event listeners: `.trigger`, `.delegate`, `.capture`
     */
    exports.DefaultBindingLanguage = [
        exports.DefaultBindingCommandRegistration,
        exports.OneTimeBindingCommandRegistration,
        exports.FromViewBindingCommandRegistration,
        exports.ToViewBindingCommandRegistration,
        exports.TwoWayBindingCommandRegistration,
        exports.CallBindingCommandRegistration,
        exports.ForBindingCommandRegistration,
        exports.RefBindingCommandRegistration,
        exports.TriggerBindingCommandRegistration,
        exports.DelegateBindingCommandRegistration,
        exports.CaptureBindingCommandRegistration,
        exports.ClassBindingCommandRegistration,
        exports.StyleBindingCommandRegistration,
        exports.AttrBindingCommandRegistration,
    ];
    exports.SanitizeValueConverterRegistration = sanitize_1.SanitizeValueConverter;
    exports.ViewValueConverterRegistration = view_1.ViewValueConverter;
    exports.FrequentMutationsRegistration = flags_1.FrequentMutations;
    exports.InfrequentMutationsRegistration = flags_1.InfrequentMutations;
    exports.ObserveShallowRegistration = flags_1.ObserveShallow;
    exports.IfRegistration = if_1.If;
    exports.ElseRegistration = if_1.Else;
    exports.RepeatRegistration = repeat_1.Repeat;
    exports.WithRegistration = with_1.With;
    exports.SwitchRegistration = switch_1.Switch;
    exports.CaseRegistration = switch_1.Case;
    exports.DefaultCaseRegistration = switch_1.DefaultCase;
    exports.AttrBindingBehaviorRegistration = attr_1.AttrBindingBehavior;
    exports.SelfBindingBehaviorRegistration = self_1.SelfBindingBehavior;
    exports.UpdateTriggerBindingBehaviorRegistration = update_trigger_1.UpdateTriggerBindingBehavior;
    exports.ComposeRegistration = compose_1.Compose;
    exports.PortalRegistration = portal_1.Portal;
    exports.FocusRegistration = focus_1.Focus;
    exports.BlurRegistration = blur_1.Blur;
    /**
     * Default HTML-specific (but environment-agnostic) resources:
     * - Binding Behaviors: `oneTime`, `toView`, `fromView`, `twoWay`, `signal`, `debounce`, `throttle`, `attr`, `self`, `updateTrigger`
     * - Custom Elements: `au-compose`, `au-slot`
     * - Custom Attributes: `blur`, `focus`, `portal`
     * - Template controllers: `if`/`else`, `repeat`, `with`
     * - Value Converters: `sanitize`
     */
    exports.DefaultResources = [
        runtime_1.DebounceBindingBehaviorRegistration,
        runtime_1.OneTimeBindingBehaviorRegistration,
        runtime_1.ToViewBindingBehaviorRegistration,
        runtime_1.FromViewBindingBehaviorRegistration,
        runtime_1.SignalBindingBehaviorRegistration,
        runtime_1.ThrottleBindingBehaviorRegistration,
        runtime_1.TwoWayBindingBehaviorRegistration,
        exports.SanitizeValueConverterRegistration,
        exports.ViewValueConverterRegistration,
        exports.FrequentMutationsRegistration,
        exports.InfrequentMutationsRegistration,
        exports.ObserveShallowRegistration,
        exports.IfRegistration,
        exports.ElseRegistration,
        exports.RepeatRegistration,
        exports.WithRegistration,
        exports.SwitchRegistration,
        exports.CaseRegistration,
        exports.DefaultCaseRegistration,
        exports.AttrBindingBehaviorRegistration,
        exports.SelfBindingBehaviorRegistration,
        exports.UpdateTriggerBindingBehaviorRegistration,
        exports.ComposeRegistration,
        exports.PortalRegistration,
        exports.FocusRegistration,
        exports.BlurRegistration,
        au_slot_1.AuSlot,
    ];
    exports.CallBindingRendererRegistration = renderer_1.CallBindingRenderer;
    exports.CustomAttributeRendererRegistration = renderer_1.CustomAttributeRenderer;
    exports.CustomElementRendererRegistration = renderer_1.CustomElementRenderer;
    exports.InterpolationBindingRendererRegistration = renderer_1.InterpolationBindingRenderer;
    exports.IteratorBindingRendererRegistration = renderer_1.IteratorBindingRenderer;
    exports.LetElementRendererRegistration = renderer_1.LetElementRenderer;
    exports.PropertyBindingRendererRegistration = renderer_1.PropertyBindingRenderer;
    exports.RefBindingRendererRegistration = renderer_1.RefBindingRenderer;
    exports.SetPropertyRendererRegistration = renderer_1.SetPropertyRenderer;
    exports.TemplateControllerRendererRegistration = renderer_1.TemplateControllerRenderer;
    exports.ListenerBindingRendererRegistration = renderer_1.ListenerBindingRenderer;
    exports.AttributeBindingRendererRegistration = renderer_1.AttributeBindingRenderer;
    exports.SetAttributeRendererRegistration = renderer_1.SetAttributeRenderer;
    exports.SetClassAttributeRendererRegistration = renderer_1.SetClassAttributeRenderer;
    exports.SetStyleAttributeRendererRegistration = renderer_1.SetStyleAttributeRenderer;
    exports.StylePropertyBindingRendererRegistration = renderer_1.StylePropertyBindingRenderer;
    exports.TextBindingRendererRegistration = renderer_1.TextBindingRenderer;
    /**
     * Default renderers for:
     * - PropertyBinding: `bind`, `one-time`, `to-view`, `from-view`, `two-way`
     * - IteratorBinding: `for`
     * - CallBinding: `call`
     * - RefBinding: `ref`
     * - InterpolationBinding: `${}`
     * - SetProperty
     * - `customElement` hydration
     * - `customAttribute` hydration
     * - `templateController` hydration
     * - `let` element hydration
     * - Listener Bindings: `trigger`, `capture`, `delegate`
     * - SetAttribute
     * - StyleProperty: `style`, `css`
     * - TextBinding: `${}`
     */
    exports.DefaultRenderers = [
        exports.PropertyBindingRendererRegistration,
        exports.IteratorBindingRendererRegistration,
        exports.CallBindingRendererRegistration,
        exports.RefBindingRendererRegistration,
        exports.InterpolationBindingRendererRegistration,
        exports.SetPropertyRendererRegistration,
        exports.CustomElementRendererRegistration,
        exports.CustomAttributeRendererRegistration,
        exports.TemplateControllerRendererRegistration,
        exports.LetElementRendererRegistration,
        exports.ListenerBindingRendererRegistration,
        exports.AttributeBindingRendererRegistration,
        exports.SetAttributeRendererRegistration,
        exports.SetClassAttributeRendererRegistration,
        exports.SetStyleAttributeRendererRegistration,
        exports.StylePropertyBindingRendererRegistration,
        exports.TextBindingRendererRegistration,
    ];
    /**
     * A DI configuration object containing html-specific (but environment-agnostic) registrations:
     * - `RuntimeConfiguration` from `@aurelia/runtime`
     * - `DefaultComponents`
     * - `DefaultResources`
     * - `DefaultRenderers`
     */
    exports.StandardConfiguration = {
        /**
         * Apply this configuration to the provided container.
         */
        register(container) {
            return container.register(...exports.DefaultComponents, ...exports.DefaultResources, ...exports.DefaultBindingSyntax, ...exports.DefaultBindingLanguage, ...exports.DefaultRenderers);
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