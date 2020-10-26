(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "@aurelia/runtime", "./attribute-patterns", "./binding-commands", "./template-compiler", "./composer", "./observation/observer-locator", "./observation/svg-analyzer", "./resources/binding-behaviors/attr", "./resources/binding-behaviors/self", "./resources/binding-behaviors/update-trigger", "./resources/custom-attributes/blur", "./resources/custom-attributes/focus", "./resources/custom-attributes/portal", "./resources/custom-attributes/flags", "./resources/custom-attributes/if", "./resources/custom-attributes/repeat", "./resources/custom-attributes/with", "./resources/custom-attributes/switch", "./resources/custom-elements/compose", "./resources/custom-elements/au-slot", "./resources/value-converters/sanitize", "./resources/value-converters/view"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StandardConfiguration = exports.DefaultComposers = exports.TextBindingComposerRegistration = exports.StylePropertyBindingComposerRegistration = exports.SetStyleAttributeComposerRegistration = exports.SetClassAttributeComposerRegistration = exports.SetAttributeComposerRegistration = exports.AttributeBindingComposerRegistration = exports.ListenerBindingComposerRegistration = exports.TemplateControllerComposerRegistration = exports.SetPropertyComposerRegistration = exports.RefBindingComposerRegistration = exports.PropertyBindingComposerRegistration = exports.LetElementComposerRegistration = exports.IteratorBindingComposerRegistration = exports.InterpolationBindingComposerRegistration = exports.CustomElementComposerRegistration = exports.CustomAttributeComposerRegistration = exports.CallBindingComposerRegistration = exports.DefaultResources = exports.BlurRegistration = exports.FocusRegistration = exports.PortalRegistration = exports.ComposeRegistration = exports.UpdateTriggerBindingBehaviorRegistration = exports.SelfBindingBehaviorRegistration = exports.AttrBindingBehaviorRegistration = exports.DefaultCaseRegistration = exports.CaseRegistration = exports.SwitchRegistration = exports.WithRegistration = exports.RepeatRegistration = exports.ElseRegistration = exports.IfRegistration = exports.ObserveShallowRegistration = exports.InfrequentMutationsRegistration = exports.FrequentMutationsRegistration = exports.ViewValueConverterRegistration = exports.SanitizeValueConverterRegistration = exports.DefaultBindingLanguage = exports.StyleBindingCommandRegistration = exports.ClassBindingCommandRegistration = exports.AttrBindingCommandRegistration = exports.CaptureBindingCommandRegistration = exports.DelegateBindingCommandRegistration = exports.TriggerBindingCommandRegistration = exports.RefBindingCommandRegistration = exports.TwoWayBindingCommandRegistration = exports.ToViewBindingCommandRegistration = exports.OneTimeBindingCommandRegistration = exports.FromViewBindingCommandRegistration = exports.ForBindingCommandRegistration = exports.DefaultBindingCommandRegistration = exports.CallBindingCommandRegistration = exports.ShortHandBindingSyntax = exports.DefaultBindingSyntax = exports.DotSeparatedAttributePatternRegistration = exports.RefAttributePatternRegistration = exports.ColonPrefixedBindAttributePatternRegistration = exports.AtPrefixedTriggerAttributePatternRegistration = exports.SVGAnalyzerRegistration = exports.DefaultComponents = exports.ITargetObserverLocatorRegistration = exports.ITargetAccessorLocatorRegistration = exports.ITemplateCompilerRegistration = void 0;
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    const attribute_patterns_1 = require("./attribute-patterns");
    const binding_commands_1 = require("./binding-commands");
    const template_compiler_1 = require("./template-compiler");
    const composer_1 = require("./composer");
    const observer_locator_1 = require("./observation/observer-locator");
    const svg_analyzer_1 = require("./observation/svg-analyzer");
    const attr_1 = require("./resources/binding-behaviors/attr");
    const self_1 = require("./resources/binding-behaviors/self");
    const update_trigger_1 = require("./resources/binding-behaviors/update-trigger");
    const blur_1 = require("./resources/custom-attributes/blur");
    const focus_1 = require("./resources/custom-attributes/focus");
    const portal_1 = require("./resources/custom-attributes/portal");
    const flags_1 = require("./resources/custom-attributes/flags");
    const if_1 = require("./resources/custom-attributes/if");
    const repeat_1 = require("./resources/custom-attributes/repeat");
    const with_1 = require("./resources/custom-attributes/with");
    const switch_1 = require("./resources/custom-attributes/switch");
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
     * - `IComposer`
     * - `ITargetAccessorLocator`
     * - `ITargetObserverLocator`
     */
    exports.DefaultComponents = [
        exports.ITemplateCompilerRegistration,
        exports.ITargetAccessorLocatorRegistration,
        exports.ITargetObserverLocatorRegistration,
    ];
    exports.SVGAnalyzerRegistration = svg_analyzer_1.SVGAnalyzer;
    exports.AtPrefixedTriggerAttributePatternRegistration = attribute_patterns_1.AtPrefixedTriggerAttributePattern;
    exports.ColonPrefixedBindAttributePatternRegistration = attribute_patterns_1.ColonPrefixedBindAttributePattern;
    exports.RefAttributePatternRegistration = attribute_patterns_1.RefAttributePattern;
    exports.DotSeparatedAttributePatternRegistration = attribute_patterns_1.DotSeparatedAttributePattern;
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
    exports.CallBindingCommandRegistration = binding_commands_1.CallBindingCommand;
    exports.DefaultBindingCommandRegistration = binding_commands_1.DefaultBindingCommand;
    exports.ForBindingCommandRegistration = binding_commands_1.ForBindingCommand;
    exports.FromViewBindingCommandRegistration = binding_commands_1.FromViewBindingCommand;
    exports.OneTimeBindingCommandRegistration = binding_commands_1.OneTimeBindingCommand;
    exports.ToViewBindingCommandRegistration = binding_commands_1.ToViewBindingCommand;
    exports.TwoWayBindingCommandRegistration = binding_commands_1.TwoWayBindingCommand;
    exports.RefBindingCommandRegistration = binding_commands_1.RefBindingCommand;
    exports.TriggerBindingCommandRegistration = binding_commands_1.TriggerBindingCommand;
    exports.DelegateBindingCommandRegistration = binding_commands_1.DelegateBindingCommand;
    exports.CaptureBindingCommandRegistration = binding_commands_1.CaptureBindingCommand;
    exports.AttrBindingCommandRegistration = binding_commands_1.AttrBindingCommand;
    exports.ClassBindingCommandRegistration = binding_commands_1.ClassBindingCommand;
    exports.StyleBindingCommandRegistration = binding_commands_1.StyleBindingCommand;
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
    exports.CallBindingComposerRegistration = composer_1.CallBindingComposer;
    exports.CustomAttributeComposerRegistration = composer_1.CustomAttributeComposer;
    exports.CustomElementComposerRegistration = composer_1.CustomElementComposer;
    exports.InterpolationBindingComposerRegistration = composer_1.InterpolationBindingComposer;
    exports.IteratorBindingComposerRegistration = composer_1.IteratorBindingComposer;
    exports.LetElementComposerRegistration = composer_1.LetElementComposer;
    exports.PropertyBindingComposerRegistration = composer_1.PropertyBindingComposer;
    exports.RefBindingComposerRegistration = composer_1.RefBindingComposer;
    exports.SetPropertyComposerRegistration = composer_1.SetPropertyComposer;
    exports.TemplateControllerComposerRegistration = composer_1.TemplateControllerComposer;
    exports.ListenerBindingComposerRegistration = composer_1.ListenerBindingComposer;
    exports.AttributeBindingComposerRegistration = composer_1.AttributeBindingComposer;
    exports.SetAttributeComposerRegistration = composer_1.SetAttributeComposer;
    exports.SetClassAttributeComposerRegistration = composer_1.SetClassAttributeComposer;
    exports.SetStyleAttributeComposerRegistration = composer_1.SetStyleAttributeComposer;
    exports.StylePropertyBindingComposerRegistration = composer_1.StylePropertyBindingComposer;
    exports.TextBindingComposerRegistration = composer_1.TextBindingComposer;
    /**
     * Default composers for:
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
    exports.DefaultComposers = [
        exports.PropertyBindingComposerRegistration,
        exports.IteratorBindingComposerRegistration,
        exports.CallBindingComposerRegistration,
        exports.RefBindingComposerRegistration,
        exports.InterpolationBindingComposerRegistration,
        exports.SetPropertyComposerRegistration,
        exports.CustomElementComposerRegistration,
        exports.CustomAttributeComposerRegistration,
        exports.TemplateControllerComposerRegistration,
        exports.LetElementComposerRegistration,
        exports.ListenerBindingComposerRegistration,
        exports.AttributeBindingComposerRegistration,
        exports.SetAttributeComposerRegistration,
        exports.SetClassAttributeComposerRegistration,
        exports.SetStyleAttributeComposerRegistration,
        exports.StylePropertyBindingComposerRegistration,
        exports.TextBindingComposerRegistration,
    ];
    /**
     * A DI configuration object containing html-specific (but environment-agnostic) registrations:
     * - `RuntimeConfiguration` from `@aurelia/runtime`
     * - `DefaultComponents`
     * - `DefaultResources`
     * - `DefaultComposers`
     */
    exports.StandardConfiguration = {
        /**
         * Apply this configuration to the provided container.
         */
        register(container) {
            return container.register(...exports.DefaultComponents, ...exports.DefaultResources, ...exports.DefaultBindingSyntax, ...exports.DefaultBindingLanguage, ...exports.DefaultComposers);
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