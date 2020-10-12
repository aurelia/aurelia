import { DI } from '@aurelia/kernel';
import { CallBindingRenderer, CustomAttributeRenderer, CustomElementRenderer, InterpolationBindingRenderer, IteratorBindingRenderer, LetElementRenderer, PropertyBindingRenderer, RefBindingRenderer, SetPropertyRenderer, TemplateControllerRenderer } from './renderer';
import { FromViewBindingBehavior, OneTimeBindingBehavior, ToViewBindingBehavior, TwoWayBindingBehavior } from './resources/binding-behaviors/binding-mode';
import { AtPrefixedTriggerAttributePattern, ColonPrefixedBindAttributePattern, DotSeparatedAttributePattern, RefAttributePattern } from './attribute-patterns';
import { CallBindingCommand, DefaultBindingCommand, ForBindingCommand, FromViewBindingCommand, OneTimeBindingCommand, ToViewBindingCommand, TwoWayBindingCommand } from './binding-commands';
import { DebounceBindingBehavior } from './resources/binding-behaviors/debounce';
import { SignalBindingBehavior } from './resources/binding-behaviors/signals';
import { ThrottleBindingBehavior } from './resources/binding-behaviors/throttle';
import { FrequentMutations, InfrequentMutations, ObserveShallow } from './resources/custom-attributes/flags';
import { Else, If } from './resources/custom-attributes/if';
import { Repeat } from './resources/custom-attributes/repeat';
import { With } from './resources/custom-attributes/with';
import { SanitizeValueConverter } from './resources/value-converters/sanitize';
import { ViewValueConverter } from './resources/value-converters/view';
import { Now } from '@aurelia/scheduler';
import { AuSlot } from './resources/custom-elements/au-slot';
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
/**
 * Default runtime/environment-agnostic binding commands:
 * - Property observation: `.bind`, `.one-time`, `.from-view`, `.to-view`, `.two-way`
 * - Function call: `.call`
 * - Collection observation: `.for`
 */
export const DefaultBindingLanguage = [
    DefaultBindingCommandRegistration,
    OneTimeBindingCommandRegistration,
    FromViewBindingCommandRegistration,
    ToViewBindingCommandRegistration,
    TwoWayBindingCommandRegistration,
    CallBindingCommandRegistration,
    ForBindingCommandRegistration
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
export const DefaultComponents = [
    Now,
];
export const FrequentMutationsRegistration = FrequentMutations;
export const InfrequentMutationsRegistration = InfrequentMutations;
export const ObserveShallowRegistration = ObserveShallow;
export const IfRegistration = If;
export const ElseRegistration = Else;
export const RepeatRegistration = Repeat;
export const WithRegistration = With;
export const SanitizeValueConverterRegistration = SanitizeValueConverter;
export const ViewValueConverterRegistration = ViewValueConverter;
export const DebounceBindingBehaviorRegistration = DebounceBindingBehavior;
export const OneTimeBindingBehaviorRegistration = OneTimeBindingBehavior;
export const ToViewBindingBehaviorRegistration = ToViewBindingBehavior;
export const FromViewBindingBehaviorRegistration = FromViewBindingBehavior;
export const SignalBindingBehaviorRegistration = SignalBindingBehavior;
export const ThrottleBindingBehaviorRegistration = ThrottleBindingBehavior;
export const TwoWayBindingBehaviorRegistration = TwoWayBindingBehavior;
/**
 * Default resources:
 * - Template controllers (`if`/`else`, `repeat`, `with`)
 * - Value Converters (`sanitize`)
 * - Binding Behaviors (`oneTime`, `toView`, `fromView`, `twoWay`, `signal`, `debounce`, `throttle`)
 * - Custom element: au-slot
 */
export const DefaultResources = [
    FrequentMutationsRegistration,
    InfrequentMutationsRegistration,
    ObserveShallowRegistration,
    IfRegistration,
    ElseRegistration,
    RepeatRegistration,
    WithRegistration,
    SanitizeValueConverterRegistration,
    ViewValueConverterRegistration,
    DebounceBindingBehaviorRegistration,
    OneTimeBindingBehaviorRegistration,
    ToViewBindingBehaviorRegistration,
    FromViewBindingBehaviorRegistration,
    SignalBindingBehaviorRegistration,
    ThrottleBindingBehaviorRegistration,
    TwoWayBindingBehaviorRegistration,
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
    LetElementRendererRegistration
];
/**
 * A DI configuration object containing environment/runtime-agnostic registrations:
 * - `DefaultComponents`
 * - `DefaultResources`
 * - `DefaultRenderers`
 */
export const RuntimeConfiguration = {
    /**
     * Apply this configuration to the provided container.
     */
    register(container) {
        return container.register(...DefaultComponents, ...DefaultResources, ...DefaultRenderers, ...DefaultBindingSyntax, ...DefaultBindingLanguage);
    },
    /**
     * Create a new container with this configuration applied to it.
     */
    createContainer() {
        return this.register(DI.createContainer());
    }
};
//# sourceMappingURL=configuration.js.map