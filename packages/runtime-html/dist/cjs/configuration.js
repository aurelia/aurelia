"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTriggerBindingBehaviorRegistration = exports.SelfBindingBehaviorRegistration = exports.AttrBindingBehaviorRegistration = exports.RejectedTemplateControllerRegistration = exports.FulfilledTemplateControllerRegistration = exports.PendingTemplateControllerRegistration = exports.PromiseTemplateControllerRegistration = exports.DefaultCaseRegistration = exports.CaseRegistration = exports.SwitchRegistration = exports.WithRegistration = exports.RepeatRegistration = exports.ElseRegistration = exports.IfRegistration = exports.ObserveShallowRegistration = exports.FrequentMutationsRegistration = exports.ViewValueConverterRegistration = exports.SanitizeValueConverterRegistration = exports.DefaultBindingLanguage = exports.StyleBindingCommandRegistration = exports.ClassBindingCommandRegistration = exports.AttrBindingCommandRegistration = exports.CaptureBindingCommandRegistration = exports.DelegateBindingCommandRegistration = exports.TriggerBindingCommandRegistration = exports.RefBindingCommandRegistration = exports.TwoWayBindingCommandRegistration = exports.ToViewBindingCommandRegistration = exports.OneTimeBindingCommandRegistration = exports.FromViewBindingCommandRegistration = exports.ForBindingCommandRegistration = exports.DefaultBindingCommandRegistration = exports.CallBindingCommandRegistration = exports.ShortHandBindingSyntax = exports.DefaultBindingSyntax = exports.DotSeparatedAttributePatternRegistration = exports.RefAttributePatternRegistration = exports.ColonPrefixedBindAttributePatternRegistration = exports.AtPrefixedTriggerAttributePatternRegistration = exports.SVGAnalyzerRegistration = exports.DefaultComponents = exports.INodeObserverLocatorRegistration = exports.ITemplateCompilerRegistration = exports.TwoWayBindingBehaviorRegistration = exports.ThrottleBindingBehaviorRegistration = exports.SignalBindingBehaviorRegistration = exports.FromViewBindingBehaviorRegistration = exports.ToViewBindingBehaviorRegistration = exports.OneTimeBindingBehaviorRegistration = exports.DebounceBindingBehaviorRegistration = void 0;
exports.StandardConfiguration = exports.DefaultRenderers = exports.TextBindingRendererRegistration = exports.StylePropertyBindingRendererRegistration = exports.SetStyleAttributeRendererRegistration = exports.SetClassAttributeRendererRegistration = exports.SetAttributeRendererRegistration = exports.AttributeBindingRendererRegistration = exports.ListenerBindingRendererRegistration = exports.TemplateControllerRendererRegistration = exports.SetPropertyRendererRegistration = exports.RefBindingRendererRegistration = exports.PropertyBindingRendererRegistration = exports.LetElementRendererRegistration = exports.IteratorBindingRendererRegistration = exports.InterpolationBindingRendererRegistration = exports.CustomElementRendererRegistration = exports.CustomAttributeRendererRegistration = exports.CallBindingRendererRegistration = exports.DefaultResources = exports.ShowRegistration = exports.BlurRegistration = exports.FocusRegistration = exports.PortalRegistration = exports.ComposeRegistration = void 0;
const kernel_1 = require("@aurelia/kernel");
const attribute_pattern_js_1 = require("./resources/attribute-pattern.js");
const binding_command_js_1 = require("./resources/binding-command.js");
const template_compiler_js_1 = require("./template-compiler.js");
const renderer_js_1 = require("./renderer.js");
const binding_mode_js_1 = require("./binding-behaviors/binding-mode.js");
const debounce_js_1 = require("./binding-behaviors/debounce.js");
const signals_js_1 = require("./binding-behaviors/signals.js");
const throttle_js_1 = require("./binding-behaviors/throttle.js");
const svg_analyzer_js_1 = require("./observation/svg-analyzer.js");
const attr_js_1 = require("./resources/binding-behaviors/attr.js");
const self_js_1 = require("./resources/binding-behaviors/self.js");
const update_trigger_js_1 = require("./resources/binding-behaviors/update-trigger.js");
const blur_js_1 = require("./resources/custom-attributes/blur.js");
const focus_js_1 = require("./resources/custom-attributes/focus.js");
const show_js_1 = require("./resources/custom-attributes/show.js");
const portal_js_1 = require("./resources/template-controllers/portal.js");
const flags_js_1 = require("./resources/template-controllers/flags.js");
const if_js_1 = require("./resources/template-controllers/if.js");
const repeat_js_1 = require("./resources/template-controllers/repeat.js");
const with_js_1 = require("./resources/template-controllers/with.js");
const switch_js_1 = require("./resources/template-controllers/switch.js");
const promise_js_1 = require("./resources/template-controllers/promise.js");
const compose_js_1 = require("./resources/custom-elements/compose.js");
const au_slot_js_1 = require("./resources/custom-elements/au-slot.js");
const sanitize_js_1 = require("./resources/value-converters/sanitize.js");
const view_js_1 = require("./resources/value-converters/view.js");
const observer_locator_js_1 = require("./observation/observer-locator.js");
exports.DebounceBindingBehaviorRegistration = debounce_js_1.DebounceBindingBehavior;
exports.OneTimeBindingBehaviorRegistration = binding_mode_js_1.OneTimeBindingBehavior;
exports.ToViewBindingBehaviorRegistration = binding_mode_js_1.ToViewBindingBehavior;
exports.FromViewBindingBehaviorRegistration = binding_mode_js_1.FromViewBindingBehavior;
exports.SignalBindingBehaviorRegistration = signals_js_1.SignalBindingBehavior;
exports.ThrottleBindingBehaviorRegistration = throttle_js_1.ThrottleBindingBehavior;
exports.TwoWayBindingBehaviorRegistration = binding_mode_js_1.TwoWayBindingBehavior;
exports.ITemplateCompilerRegistration = template_compiler_js_1.TemplateCompiler;
exports.INodeObserverLocatorRegistration = observer_locator_js_1.NodeObserverLocator;
/**
 * Default HTML-specific (but environment-agnostic) implementations for the following interfaces:
 * - `ITemplateCompiler`
 * - `ITargetAccessorLocator`
 * - `ITargetObserverLocator`
 */
exports.DefaultComponents = [
    exports.ITemplateCompilerRegistration,
    exports.INodeObserverLocatorRegistration,
];
exports.SVGAnalyzerRegistration = svg_analyzer_js_1.SVGAnalyzer;
exports.AtPrefixedTriggerAttributePatternRegistration = attribute_pattern_js_1.AtPrefixedTriggerAttributePattern;
exports.ColonPrefixedBindAttributePatternRegistration = attribute_pattern_js_1.ColonPrefixedBindAttributePattern;
exports.RefAttributePatternRegistration = attribute_pattern_js_1.RefAttributePattern;
exports.DotSeparatedAttributePatternRegistration = attribute_pattern_js_1.DotSeparatedAttributePattern;
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
exports.CallBindingCommandRegistration = binding_command_js_1.CallBindingCommand;
exports.DefaultBindingCommandRegistration = binding_command_js_1.DefaultBindingCommand;
exports.ForBindingCommandRegistration = binding_command_js_1.ForBindingCommand;
exports.FromViewBindingCommandRegistration = binding_command_js_1.FromViewBindingCommand;
exports.OneTimeBindingCommandRegistration = binding_command_js_1.OneTimeBindingCommand;
exports.ToViewBindingCommandRegistration = binding_command_js_1.ToViewBindingCommand;
exports.TwoWayBindingCommandRegistration = binding_command_js_1.TwoWayBindingCommand;
exports.RefBindingCommandRegistration = binding_command_js_1.RefBindingCommand;
exports.TriggerBindingCommandRegistration = binding_command_js_1.TriggerBindingCommand;
exports.DelegateBindingCommandRegistration = binding_command_js_1.DelegateBindingCommand;
exports.CaptureBindingCommandRegistration = binding_command_js_1.CaptureBindingCommand;
exports.AttrBindingCommandRegistration = binding_command_js_1.AttrBindingCommand;
exports.ClassBindingCommandRegistration = binding_command_js_1.ClassBindingCommand;
exports.StyleBindingCommandRegistration = binding_command_js_1.StyleBindingCommand;
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
exports.SanitizeValueConverterRegistration = sanitize_js_1.SanitizeValueConverter;
exports.ViewValueConverterRegistration = view_js_1.ViewValueConverter;
exports.FrequentMutationsRegistration = flags_js_1.FrequentMutations;
exports.ObserveShallowRegistration = flags_js_1.ObserveShallow;
exports.IfRegistration = if_js_1.If;
exports.ElseRegistration = if_js_1.Else;
exports.RepeatRegistration = repeat_js_1.Repeat;
exports.WithRegistration = with_js_1.With;
exports.SwitchRegistration = switch_js_1.Switch;
exports.CaseRegistration = switch_js_1.Case;
exports.DefaultCaseRegistration = switch_js_1.DefaultCase;
exports.PromiseTemplateControllerRegistration = promise_js_1.PromiseTemplateController;
exports.PendingTemplateControllerRegistration = promise_js_1.PendingTemplateController;
exports.FulfilledTemplateControllerRegistration = promise_js_1.FulfilledTemplateController;
exports.RejectedTemplateControllerRegistration = promise_js_1.RejectedTemplateController;
// TODO: activate after the attribute parser and/or interpreter such that for `t`, `then` is not picked up.
// export const PromiseAttributePatternRegistration = PromiseAttributePattern as unknown as IRegistry;
// export const FulfilledAttributePatternRegistration = FulfilledAttributePattern as unknown as IRegistry;
// export const RejectedAttributePatternRegistration = RejectedAttributePattern as unknown as IRegistry;
exports.AttrBindingBehaviorRegistration = attr_js_1.AttrBindingBehavior;
exports.SelfBindingBehaviorRegistration = self_js_1.SelfBindingBehavior;
exports.UpdateTriggerBindingBehaviorRegistration = update_trigger_js_1.UpdateTriggerBindingBehavior;
exports.ComposeRegistration = compose_js_1.Compose;
exports.PortalRegistration = portal_js_1.Portal;
exports.FocusRegistration = focus_js_1.Focus;
exports.BlurRegistration = blur_js_1.Blur;
exports.ShowRegistration = show_js_1.Show;
/**
 * Default HTML-specific (but environment-agnostic) resources:
 * - Binding Behaviors: `oneTime`, `toView`, `fromView`, `twoWay`, `signal`, `debounce`, `throttle`, `attr`, `self`, `updateTrigger`
 * - Custom Elements: `au-compose`, `au-slot`
 * - Custom Attributes: `blur`, `focus`, `portal`
 * - Template controllers: `if`/`else`, `repeat`, `with`
 * - Value Converters: `sanitize`
 */
exports.DefaultResources = [
    exports.DebounceBindingBehaviorRegistration,
    exports.OneTimeBindingBehaviorRegistration,
    exports.ToViewBindingBehaviorRegistration,
    exports.FromViewBindingBehaviorRegistration,
    exports.SignalBindingBehaviorRegistration,
    exports.ThrottleBindingBehaviorRegistration,
    exports.TwoWayBindingBehaviorRegistration,
    exports.SanitizeValueConverterRegistration,
    exports.ViewValueConverterRegistration,
    exports.FrequentMutationsRegistration,
    exports.ObserveShallowRegistration,
    exports.IfRegistration,
    exports.ElseRegistration,
    exports.RepeatRegistration,
    exports.WithRegistration,
    exports.SwitchRegistration,
    exports.CaseRegistration,
    exports.DefaultCaseRegistration,
    exports.PromiseTemplateControllerRegistration,
    exports.PendingTemplateControllerRegistration,
    exports.FulfilledTemplateControllerRegistration,
    exports.RejectedTemplateControllerRegistration,
    // TODO: activate after the attribute parser and/or interpreter such that for `t`, `then` is not picked up.
    // PromiseAttributePatternRegistration,
    // FulfilledAttributePatternRegistration,
    // RejectedAttributePatternRegistration,
    exports.AttrBindingBehaviorRegistration,
    exports.SelfBindingBehaviorRegistration,
    exports.UpdateTriggerBindingBehaviorRegistration,
    exports.ComposeRegistration,
    exports.PortalRegistration,
    exports.FocusRegistration,
    exports.BlurRegistration,
    exports.ShowRegistration,
    au_slot_js_1.AuSlot,
];
exports.CallBindingRendererRegistration = renderer_js_1.CallBindingRenderer;
exports.CustomAttributeRendererRegistration = renderer_js_1.CustomAttributeRenderer;
exports.CustomElementRendererRegistration = renderer_js_1.CustomElementRenderer;
exports.InterpolationBindingRendererRegistration = renderer_js_1.InterpolationBindingRenderer;
exports.IteratorBindingRendererRegistration = renderer_js_1.IteratorBindingRenderer;
exports.LetElementRendererRegistration = renderer_js_1.LetElementRenderer;
exports.PropertyBindingRendererRegistration = renderer_js_1.PropertyBindingRenderer;
exports.RefBindingRendererRegistration = renderer_js_1.RefBindingRenderer;
exports.SetPropertyRendererRegistration = renderer_js_1.SetPropertyRenderer;
exports.TemplateControllerRendererRegistration = renderer_js_1.TemplateControllerRenderer;
exports.ListenerBindingRendererRegistration = renderer_js_1.ListenerBindingRenderer;
exports.AttributeBindingRendererRegistration = renderer_js_1.AttributeBindingRenderer;
exports.SetAttributeRendererRegistration = renderer_js_1.SetAttributeRenderer;
exports.SetClassAttributeRendererRegistration = renderer_js_1.SetClassAttributeRenderer;
exports.SetStyleAttributeRendererRegistration = renderer_js_1.SetStyleAttributeRenderer;
exports.StylePropertyBindingRendererRegistration = renderer_js_1.StylePropertyBindingRenderer;
exports.TextBindingRendererRegistration = renderer_js_1.TextBindingRenderer;
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
//# sourceMappingURL=configuration.js.map