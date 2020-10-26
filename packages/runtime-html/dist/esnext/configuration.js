import { DI } from '@aurelia/kernel';
import { DebounceBindingBehaviorRegistration, OneTimeBindingBehaviorRegistration, ToViewBindingBehaviorRegistration, FromViewBindingBehaviorRegistration, SignalBindingBehaviorRegistration, ThrottleBindingBehaviorRegistration, TwoWayBindingBehaviorRegistration, } from '@aurelia/runtime';
import { AtPrefixedTriggerAttributePattern, ColonPrefixedBindAttributePattern, DotSeparatedAttributePattern, RefAttributePattern } from './attribute-patterns';
import { CallBindingCommand, DefaultBindingCommand, ForBindingCommand, FromViewBindingCommand, OneTimeBindingCommand, ToViewBindingCommand, TwoWayBindingCommand, AttrBindingCommand, CaptureBindingCommand, ClassBindingCommand, DelegateBindingCommand, RefBindingCommand, StyleBindingCommand, TriggerBindingCommand, } from './binding-commands';
import { TemplateCompiler } from './template-compiler';
import { CallBindingComposer, CustomAttributeComposer, CustomElementComposer, InterpolationBindingComposer, IteratorBindingComposer, LetElementComposer, PropertyBindingComposer, RefBindingComposer, SetPropertyComposer, TemplateControllerComposer, AttributeBindingComposer, ListenerBindingComposer, SetAttributeComposer, StylePropertyBindingComposer, TextBindingComposer, SetClassAttributeComposer, SetStyleAttributeComposer, } from './composer';
import { TargetAccessorLocator, TargetObserverLocator } from './observation/observer-locator';
import { SVGAnalyzer } from './observation/svg-analyzer';
import { AttrBindingBehavior } from './resources/binding-behaviors/attr';
import { SelfBindingBehavior } from './resources/binding-behaviors/self';
import { UpdateTriggerBindingBehavior } from './resources/binding-behaviors/update-trigger';
import { Blur } from './resources/custom-attributes/blur';
import { Focus } from './resources/custom-attributes/focus';
import { Portal } from './resources/custom-attributes/portal';
import { FrequentMutations, InfrequentMutations, ObserveShallow } from './resources/custom-attributes/flags';
import { Else, If } from './resources/custom-attributes/if';
import { Repeat } from './resources/custom-attributes/repeat';
import { With } from './resources/custom-attributes/with';
import { Switch, Case, DefaultCase } from './resources/custom-attributes/switch';
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
 * - `IComposer`
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
export const InfrequentMutationsRegistration = InfrequentMutations;
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
    InfrequentMutationsRegistration,
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
export const CallBindingComposerRegistration = CallBindingComposer;
export const CustomAttributeComposerRegistration = CustomAttributeComposer;
export const CustomElementComposerRegistration = CustomElementComposer;
export const InterpolationBindingComposerRegistration = InterpolationBindingComposer;
export const IteratorBindingComposerRegistration = IteratorBindingComposer;
export const LetElementComposerRegistration = LetElementComposer;
export const PropertyBindingComposerRegistration = PropertyBindingComposer;
export const RefBindingComposerRegistration = RefBindingComposer;
export const SetPropertyComposerRegistration = SetPropertyComposer;
export const TemplateControllerComposerRegistration = TemplateControllerComposer;
export const ListenerBindingComposerRegistration = ListenerBindingComposer;
export const AttributeBindingComposerRegistration = AttributeBindingComposer;
export const SetAttributeComposerRegistration = SetAttributeComposer;
export const SetClassAttributeComposerRegistration = SetClassAttributeComposer;
export const SetStyleAttributeComposerRegistration = SetStyleAttributeComposer;
export const StylePropertyBindingComposerRegistration = StylePropertyBindingComposer;
export const TextBindingComposerRegistration = TextBindingComposer;
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
export const DefaultComposers = [
    PropertyBindingComposerRegistration,
    IteratorBindingComposerRegistration,
    CallBindingComposerRegistration,
    RefBindingComposerRegistration,
    InterpolationBindingComposerRegistration,
    SetPropertyComposerRegistration,
    CustomElementComposerRegistration,
    CustomAttributeComposerRegistration,
    TemplateControllerComposerRegistration,
    LetElementComposerRegistration,
    ListenerBindingComposerRegistration,
    AttributeBindingComposerRegistration,
    SetAttributeComposerRegistration,
    SetClassAttributeComposerRegistration,
    SetStyleAttributeComposerRegistration,
    StylePropertyBindingComposerRegistration,
    TextBindingComposerRegistration,
];
/**
 * A DI configuration object containing html-specific (but environment-agnostic) registrations:
 * - `RuntimeConfiguration` from `@aurelia/runtime`
 * - `DefaultComponents`
 * - `DefaultResources`
 * - `DefaultComposers`
 */
export const StandardConfiguration = {
    /**
     * Apply this configuration to the provided container.
     */
    register(container) {
        return container.register(...DefaultComponents, ...DefaultResources, ...DefaultBindingSyntax, ...DefaultBindingLanguage, ...DefaultComposers);
    },
    /**
     * Create a new container with this configuration applied to it.
     */
    createContainer() {
        return this.register(DI.createContainer());
    }
};
//# sourceMappingURL=configuration.js.map