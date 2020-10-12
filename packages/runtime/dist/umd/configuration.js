(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "./renderer", "./resources/binding-behaviors/binding-mode", "./attribute-patterns", "./binding-commands", "./resources/binding-behaviors/debounce", "./resources/binding-behaviors/signals", "./resources/binding-behaviors/throttle", "./resources/custom-attributes/flags", "./resources/custom-attributes/if", "./resources/custom-attributes/repeat", "./resources/custom-attributes/with", "./resources/value-converters/sanitize", "./resources/value-converters/view", "@aurelia/scheduler", "./resources/custom-elements/au-slot"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RuntimeConfiguration = exports.DefaultRenderers = exports.TemplateControllerRendererRegistration = exports.SetPropertyRendererRegistration = exports.RefBindingRendererRegistration = exports.PropertyBindingRendererRegistration = exports.LetElementRendererRegistration = exports.IteratorBindingRendererRegistration = exports.InterpolationBindingRendererRegistration = exports.CustomElementRendererRegistration = exports.CustomAttributeRendererRegistration = exports.CallBindingRendererRegistration = exports.DefaultResources = exports.TwoWayBindingBehaviorRegistration = exports.ThrottleBindingBehaviorRegistration = exports.SignalBindingBehaviorRegistration = exports.FromViewBindingBehaviorRegistration = exports.ToViewBindingBehaviorRegistration = exports.OneTimeBindingBehaviorRegistration = exports.DebounceBindingBehaviorRegistration = exports.ViewValueConverterRegistration = exports.SanitizeValueConverterRegistration = exports.WithRegistration = exports.RepeatRegistration = exports.ElseRegistration = exports.IfRegistration = exports.ObserveShallowRegistration = exports.InfrequentMutationsRegistration = exports.FrequentMutationsRegistration = exports.DefaultComponents = exports.DefaultBindingLanguage = exports.TwoWayBindingCommandRegistration = exports.ToViewBindingCommandRegistration = exports.OneTimeBindingCommandRegistration = exports.FromViewBindingCommandRegistration = exports.ForBindingCommandRegistration = exports.DefaultBindingCommandRegistration = exports.CallBindingCommandRegistration = exports.ShortHandBindingSyntax = exports.DefaultBindingSyntax = exports.DotSeparatedAttributePatternRegistration = exports.RefAttributePatternRegistration = exports.ColonPrefixedBindAttributePatternRegistration = exports.AtPrefixedTriggerAttributePatternRegistration = void 0;
    const kernel_1 = require("@aurelia/kernel");
    const renderer_1 = require("./renderer");
    const binding_mode_1 = require("./resources/binding-behaviors/binding-mode");
    const attribute_patterns_1 = require("./attribute-patterns");
    const binding_commands_1 = require("./binding-commands");
    const debounce_1 = require("./resources/binding-behaviors/debounce");
    const signals_1 = require("./resources/binding-behaviors/signals");
    const throttle_1 = require("./resources/binding-behaviors/throttle");
    const flags_1 = require("./resources/custom-attributes/flags");
    const if_1 = require("./resources/custom-attributes/if");
    const repeat_1 = require("./resources/custom-attributes/repeat");
    const with_1 = require("./resources/custom-attributes/with");
    const sanitize_1 = require("./resources/value-converters/sanitize");
    const view_1 = require("./resources/value-converters/view");
    const scheduler_1 = require("@aurelia/scheduler");
    const au_slot_1 = require("./resources/custom-elements/au-slot");
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
    /**
     * Default runtime/environment-agnostic binding commands:
     * - Property observation: `.bind`, `.one-time`, `.from-view`, `.to-view`, `.two-way`
     * - Function call: `.call`
     * - Collection observation: `.for`
     */
    exports.DefaultBindingLanguage = [
        exports.DefaultBindingCommandRegistration,
        exports.OneTimeBindingCommandRegistration,
        exports.FromViewBindingCommandRegistration,
        exports.ToViewBindingCommandRegistration,
        exports.TwoWayBindingCommandRegistration,
        exports.CallBindingCommandRegistration,
        exports.ForBindingCommandRegistration
    ];
    /**
     * Default implementations for the following interfaces:
     * - `IExpressionParserRegistration`
     * - `IObserverLocator`
     * - `ILifecycle`
     * - `IRenderer`
     * - `IAppTaskManager`
     * - `IViewLocator`
     * - `IClockRegistration`
     * - `ISchedulerRegistration`
     */
    exports.DefaultComponents = [
        scheduler_1.Now,
    ];
    exports.FrequentMutationsRegistration = flags_1.FrequentMutations;
    exports.InfrequentMutationsRegistration = flags_1.InfrequentMutations;
    exports.ObserveShallowRegistration = flags_1.ObserveShallow;
    exports.IfRegistration = if_1.If;
    exports.ElseRegistration = if_1.Else;
    exports.RepeatRegistration = repeat_1.Repeat;
    exports.WithRegistration = with_1.With;
    exports.SanitizeValueConverterRegistration = sanitize_1.SanitizeValueConverter;
    exports.ViewValueConverterRegistration = view_1.ViewValueConverter;
    exports.DebounceBindingBehaviorRegistration = debounce_1.DebounceBindingBehavior;
    exports.OneTimeBindingBehaviorRegistration = binding_mode_1.OneTimeBindingBehavior;
    exports.ToViewBindingBehaviorRegistration = binding_mode_1.ToViewBindingBehavior;
    exports.FromViewBindingBehaviorRegistration = binding_mode_1.FromViewBindingBehavior;
    exports.SignalBindingBehaviorRegistration = signals_1.SignalBindingBehavior;
    exports.ThrottleBindingBehaviorRegistration = throttle_1.ThrottleBindingBehavior;
    exports.TwoWayBindingBehaviorRegistration = binding_mode_1.TwoWayBindingBehavior;
    /**
     * Default resources:
     * - Template controllers (`if`/`else`, `repeat`, `with`)
     * - Value Converters (`sanitize`)
     * - Binding Behaviors (`oneTime`, `toView`, `fromView`, `twoWay`, `signal`, `debounce`, `throttle`)
     * - Custom element: au-slot
     */
    exports.DefaultResources = [
        exports.FrequentMutationsRegistration,
        exports.InfrequentMutationsRegistration,
        exports.ObserveShallowRegistration,
        exports.IfRegistration,
        exports.ElseRegistration,
        exports.RepeatRegistration,
        exports.WithRegistration,
        exports.SanitizeValueConverterRegistration,
        exports.ViewValueConverterRegistration,
        exports.DebounceBindingBehaviorRegistration,
        exports.OneTimeBindingBehaviorRegistration,
        exports.ToViewBindingBehaviorRegistration,
        exports.FromViewBindingBehaviorRegistration,
        exports.SignalBindingBehaviorRegistration,
        exports.ThrottleBindingBehaviorRegistration,
        exports.TwoWayBindingBehaviorRegistration,
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
        exports.LetElementRendererRegistration
    ];
    /**
     * A DI configuration object containing environment/runtime-agnostic registrations:
     * - `DefaultComponents`
     * - `DefaultResources`
     * - `DefaultRenderers`
     */
    exports.RuntimeConfiguration = {
        /**
         * Apply this configuration to the provided container.
         */
        register(container) {
            return container.register(...exports.DefaultComponents, ...exports.DefaultResources, ...exports.DefaultRenderers, ...exports.DefaultBindingSyntax, ...exports.DefaultBindingLanguage);
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