import { DI } from '@aurelia/kernel';
import { DebounceBindingBehaviorRegistration, OneTimeBindingBehaviorRegistration, ToViewBindingBehaviorRegistration, FromViewBindingBehaviorRegistration, SignalBindingBehaviorRegistration, ThrottleBindingBehaviorRegistration, TwoWayBindingBehaviorRegistration, } from '@aurelia/runtime';
import { AtPrefixedTriggerAttributePattern, ColonPrefixedBindAttributePattern, DotSeparatedAttributePattern, RefAttributePattern, } from './resources/attribute-pattern';
import { CallBindingCommand, DefaultBindingCommand, ForBindingCommand, FromViewBindingCommand, OneTimeBindingCommand, ToViewBindingCommand, TwoWayBindingCommand, AttrBindingCommand, CaptureBindingCommand, ClassBindingCommand, DelegateBindingCommand, RefBindingCommand, StyleBindingCommand, TriggerBindingCommand, } from './resources/binding-command';
import { TemplateCompiler } from './template-compiler';
import { CallBindingRenderer, CustomAttributeRenderer, CustomElementRenderer, InterpolationBindingRenderer, IteratorBindingRenderer, LetElementRenderer, PropertyBindingRenderer, RefBindingRenderer, SetPropertyRenderer, TemplateControllerRenderer, AttributeBindingRenderer, ListenerBindingRenderer, SetAttributeRenderer, StylePropertyBindingRenderer, TextBindingRenderer, SetClassAttributeRenderer, SetStyleAttributeRenderer, } from './renderer';
import { TargetAccessorLocator, TargetObserverLocator } from './observation/observer-locator';
import { SVGAnalyzer } from './observation/svg-analyzer';
import { AttrBindingBehavior } from './resources/binding-behaviors/attr';
import { SelfBindingBehavior } from './resources/binding-behaviors/self';
import { UpdateTriggerBindingBehavior } from './resources/binding-behaviors/update-trigger';
import { Blur } from './resources/custom-attributes/blur';
import { Focus } from './resources/custom-attributes/focus';
import { Portal } from './resources/template-controllers/portal';
import { FrequentMutations, ObserveShallow } from './resources/template-controllers/flags';
import { Else, If } from './resources/template-controllers/if';
import { Repeat } from './resources/template-controllers/repeat';
import { With } from './resources/template-controllers/with';
import { Switch, Case, DefaultCase } from './resources/template-controllers/switch';
import { Compose } from './resources/custom-elements/compose';
import { AuSlot } from './resources/custom-elements/au-slot';
import { SanitizeValueConverter } from './resources/value-converters/sanitize';
import { ViewValueConverter } from './resources/value-converters/view';
export const ITemplateCompilerRegistration = TemplateCompiler;
export const ITargetAccessorLocatorRegistration = TargetAccessorLocator;
export const ITargetObserverLocatorRegistration = TargetObserverLocator;
/**
 * Default HTML-specific (but environment-agnostic) implementations for the following interfaces:
 * - `ITemplateCompiler`
 * - `ITargetAccessorLocator`
 * - `ITargetObserverLocator`
 */
export const DefaultComponents = [
    ITemplateCompilerRegistration,
    ITargetAccessorLocatorRegistration,
    ITargetObserverLocatorRegistration,
];
export const SVGAnalyzerRegistration = SVGAnalyzer;
export const AtPrefixedTriggerAttributePatternRegistration = AtPrefixedTriggerAttributePattern;
export const ColonPrefixedBindAttributePatternRegistration = ColonPrefixedBindAttributePattern;
export const RefAttributePatternRegistration = RefAttributePattern;
export const DotSeparatedAttributePatternRegistration = DotSeparatedAttributePattern;
/**
 * Default binding syntax for the following attribute name patterns:
 * - `ref`
 * - `target.command` (dot-separated)
 */
export const DefaultBindingSyntax = [
    RefAttributePatternRegistration,
    DotSeparatedAttributePatternRegistration
];
/**
 * Binding syntax for short-hand attribute name patterns:
 * - `@target` (short-hand for `target.trigger`)
 * - `:target` (short-hand for `target.bind`)
 */
export const ShortHandBindingSyntax = [
    AtPrefixedTriggerAttributePatternRegistration,
    ColonPrefixedBindAttributePatternRegistration
];
export const CallBindingCommandRegistration = CallBindingCommand;
export const DefaultBindingCommandRegistration = DefaultBindingCommand;
export const ForBindingCommandRegistration = ForBindingCommand;
export const FromViewBindingCommandRegistration = FromViewBindingCommand;
export const OneTimeBindingCommandRegistration = OneTimeBindingCommand;
export const ToViewBindingCommandRegistration = ToViewBindingCommand;
export const TwoWayBindingCommandRegistration = TwoWayBindingCommand;
export const RefBindingCommandRegistration = RefBindingCommand;
export const TriggerBindingCommandRegistration = TriggerBindingCommand;
export const DelegateBindingCommandRegistration = DelegateBindingCommand;
export const CaptureBindingCommandRegistration = CaptureBindingCommand;
export const AttrBindingCommandRegistration = AttrBindingCommand;
export const ClassBindingCommandRegistration = ClassBindingCommand;
export const StyleBindingCommandRegistration = StyleBindingCommand;
/**
 * Default HTML-specific (but environment-agnostic) binding commands:
 * - Property observation: `.bind`, `.one-time`, `.from-view`, `.to-view`, `.two-way`
 * - Function call: `.call`
 * - Collection observation: `.for`
 * - Event listeners: `.trigger`, `.delegate`, `.capture`
 */
export const DefaultBindingLanguage = [
    DefaultBindingCommandRegistration,
    OneTimeBindingCommandRegistration,
    FromViewBindingCommandRegistration,
    ToViewBindingCommandRegistration,
    TwoWayBindingCommandRegistration,
    CallBindingCommandRegistration,
    ForBindingCommandRegistration,
    RefBindingCommandRegistration,
    TriggerBindingCommandRegistration,
    DelegateBindingCommandRegistration,
    CaptureBindingCommandRegistration,
    ClassBindingCommandRegistration,
    StyleBindingCommandRegistration,
    AttrBindingCommandRegistration,
];
export const SanitizeValueConverterRegistration = SanitizeValueConverter;
export const ViewValueConverterRegistration = ViewValueConverter;
export const FrequentMutationsRegistration = FrequentMutations;
export const ObserveShallowRegistration = ObserveShallow;
export const IfRegistration = If;
export const ElseRegistration = Else;
export const RepeatRegistration = Repeat;
export const WithRegistration = With;
export const SwitchRegistration = Switch;
export const CaseRegistration = Case;
export const DefaultCaseRegistration = DefaultCase;
export const AttrBindingBehaviorRegistration = AttrBindingBehavior;
export const SelfBindingBehaviorRegistration = SelfBindingBehavior;
export const UpdateTriggerBindingBehaviorRegistration = UpdateTriggerBindingBehavior;
export const ComposeRegistration = Compose;
export const PortalRegistration = Portal;
export const FocusRegistration = Focus;
export const BlurRegistration = Blur;
/**
 * Default HTML-specific (but environment-agnostic) resources:
 * - Binding Behaviors: `oneTime`, `toView`, `fromView`, `twoWay`, `signal`, `debounce`, `throttle`, `attr`, `self`, `updateTrigger`
 * - Custom Elements: `au-compose`, `au-slot`
 * - Custom Attributes: `blur`, `focus`, `portal`
 * - Template controllers: `if`/`else`, `repeat`, `with`
 * - Value Converters: `sanitize`
 */
export const DefaultResources = [
    DebounceBindingBehaviorRegistration,
    OneTimeBindingBehaviorRegistration,
    ToViewBindingBehaviorRegistration,
    FromViewBindingBehaviorRegistration,
    SignalBindingBehaviorRegistration,
    ThrottleBindingBehaviorRegistration,
    TwoWayBindingBehaviorRegistration,
    SanitizeValueConverterRegistration,
    ViewValueConverterRegistration,
    FrequentMutationsRegistration,
    ObserveShallowRegistration,
    IfRegistration,
    ElseRegistration,
    RepeatRegistration,
    WithRegistration,
    SwitchRegistration,
    CaseRegistration,
    DefaultCaseRegistration,
    AttrBindingBehaviorRegistration,
    SelfBindingBehaviorRegistration,
    UpdateTriggerBindingBehaviorRegistration,
    ComposeRegistration,
    PortalRegistration,
    FocusRegistration,
    BlurRegistration,
    AuSlot,
];
export const CallBindingRendererRegistration = CallBindingRenderer;
export const CustomAttributeRendererRegistration = CustomAttributeRenderer;
export const CustomElementRendererRegistration = CustomElementRenderer;
export const InterpolationBindingRendererRegistration = InterpolationBindingRenderer;
export const IteratorBindingRendererRegistration = IteratorBindingRenderer;
export const LetElementRendererRegistration = LetElementRenderer;
export const PropertyBindingRendererRegistration = PropertyBindingRenderer;
export const RefBindingRendererRegistration = RefBindingRenderer;
export const SetPropertyRendererRegistration = SetPropertyRenderer;
export const TemplateControllerRendererRegistration = TemplateControllerRenderer;
export const ListenerBindingRendererRegistration = ListenerBindingRenderer;
export const AttributeBindingRendererRegistration = AttributeBindingRenderer;
export const SetAttributeRendererRegistration = SetAttributeRenderer;
export const SetClassAttributeRendererRegistration = SetClassAttributeRenderer;
export const SetStyleAttributeRendererRegistration = SetStyleAttributeRenderer;
export const StylePropertyBindingRendererRegistration = StylePropertyBindingRenderer;
export const TextBindingRendererRegistration = TextBindingRenderer;
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
export const DefaultRenderers = [
    PropertyBindingRendererRegistration,
    IteratorBindingRendererRegistration,
    CallBindingRendererRegistration,
    RefBindingRendererRegistration,
    InterpolationBindingRendererRegistration,
    SetPropertyRendererRegistration,
    CustomElementRendererRegistration,
    CustomAttributeRendererRegistration,
    TemplateControllerRendererRegistration,
    LetElementRendererRegistration,
    ListenerBindingRendererRegistration,
    AttributeBindingRendererRegistration,
    SetAttributeRendererRegistration,
    SetClassAttributeRendererRegistration,
    SetStyleAttributeRendererRegistration,
    StylePropertyBindingRendererRegistration,
    TextBindingRendererRegistration,
];
/**
 * A DI configuration object containing html-specific (but environment-agnostic) registrations:
 * - `RuntimeConfiguration` from `@aurelia/runtime`
 * - `DefaultComponents`
 * - `DefaultResources`
 * - `DefaultRenderers`
 */
export const StandardConfiguration = {
    /**
     * Apply this configuration to the provided container.
     */
    register(container) {
        return container.register(...DefaultComponents, ...DefaultResources, ...DefaultBindingSyntax, ...DefaultBindingLanguage, ...DefaultRenderers);
    },
    /**
     * Create a new container with this configuration applied to it.
     */
    createContainer() {
        return this.register(DI.createContainer());
    }
};
//# sourceMappingURL=configuration.js.map