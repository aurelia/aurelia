import { IContainer, IRegistry } from '@aurelia/kernel';
import { AuSlot } from './resources/custom-elements/au-slot.js';
import { ICoercionConfiguration } from '@aurelia/runtime';
export declare const DebounceBindingBehaviorRegistration: IRegistry;
export declare const OneTimeBindingBehaviorRegistration: IRegistry;
export declare const ToViewBindingBehaviorRegistration: IRegistry;
export declare const FromViewBindingBehaviorRegistration: IRegistry;
export declare const SignalBindingBehaviorRegistration: IRegistry;
export declare const ThrottleBindingBehaviorRegistration: IRegistry;
export declare const TwoWayBindingBehaviorRegistration: IRegistry;
export declare const ITemplateCompilerRegistration: IRegistry;
export declare const INodeObserverLocatorRegistration: IRegistry;
/**
 * Default HTML-specific (but environment-agnostic) implementations for the following interfaces:
 * - `ITemplateCompiler`
 * - `ITargetAccessorLocator`
 * - `ITargetObserverLocator`
 */
export declare const DefaultComponents: IRegistry[];
export declare const SVGAnalyzerRegistration: IRegistry;
export declare const AtPrefixedTriggerAttributePatternRegistration: IRegistry;
export declare const ColonPrefixedBindAttributePatternRegistration: IRegistry;
export declare const RefAttributePatternRegistration: IRegistry;
export declare const DotSeparatedAttributePatternRegistration: IRegistry;
export declare const SpreadAttributePatternRegistration: IRegistry;
/**
 * Default binding syntax for the following attribute name patterns:
 * - `ref`
 * - `target.command` (dot-separated)
 */
export declare const DefaultBindingSyntax: IRegistry[];
/**
 * Binding syntax for short-hand attribute name patterns:
 * - `@target` (short-hand for `target.trigger`)
 * - `:target` (short-hand for `target.bind`)
 */
export declare const ShortHandBindingSyntax: IRegistry[];
export declare const CallBindingCommandRegistration: IRegistry;
export declare const DefaultBindingCommandRegistration: IRegistry;
export declare const ForBindingCommandRegistration: IRegistry;
export declare const FromViewBindingCommandRegistration: IRegistry;
export declare const OneTimeBindingCommandRegistration: IRegistry;
export declare const ToViewBindingCommandRegistration: IRegistry;
export declare const TwoWayBindingCommandRegistration: IRegistry;
export declare const RefBindingCommandRegistration: IRegistry;
export declare const TriggerBindingCommandRegistration: IRegistry;
export declare const DelegateBindingCommandRegistration: IRegistry;
export declare const CaptureBindingCommandRegistration: IRegistry;
export declare const AttrBindingCommandRegistration: IRegistry;
export declare const ClassBindingCommandRegistration: IRegistry;
export declare const StyleBindingCommandRegistration: IRegistry;
export declare const SpreadBindingCommandRegistration: IRegistry;
/**
 * Default HTML-specific (but environment-agnostic) binding commands:
 * - Property observation: `.bind`, `.one-time`, `.from-view`, `.to-view`, `.two-way`
 * - Function call: `.call`
 * - Collection observation: `.for`
 * - Event listeners: `.trigger`, `.delegate`, `.capture`
 */
export declare const DefaultBindingLanguage: IRegistry[];
export declare const SanitizeValueConverterRegistration: IRegistry;
export declare const ViewValueConverterRegistration: IRegistry;
export declare const FrequentMutationsRegistration: IRegistry;
export declare const ObserveShallowRegistration: IRegistry;
export declare const IfRegistration: IRegistry;
export declare const ElseRegistration: IRegistry;
export declare const RepeatRegistration: IRegistry;
export declare const WithRegistration: IRegistry;
export declare const SwitchRegistration: IRegistry;
export declare const CaseRegistration: IRegistry;
export declare const DefaultCaseRegistration: IRegistry;
export declare const PromiseTemplateControllerRegistration: IRegistry;
export declare const PendingTemplateControllerRegistration: IRegistry;
export declare const FulfilledTemplateControllerRegistration: IRegistry;
export declare const RejectedTemplateControllerRegistration: IRegistry;
export declare const PromiseAttributePatternRegistration: IRegistry;
export declare const FulfilledAttributePatternRegistration: IRegistry;
export declare const RejectedAttributePatternRegistration: IRegistry;
export declare const AttrBindingBehaviorRegistration: IRegistry;
export declare const SelfBindingBehaviorRegistration: IRegistry;
export declare const UpdateTriggerBindingBehaviorRegistration: IRegistry;
export declare const AuRenderRegistration: IRegistry;
export declare const AuComposeRegistration: IRegistry;
export declare const PortalRegistration: IRegistry;
export declare const FocusRegistration: IRegistry;
export declare const ShowRegistration: IRegistry;
/**
 * Default HTML-specific (but environment-agnostic) resources:
 * - Binding Behaviors: `oneTime`, `toView`, `fromView`, `twoWay`, `signal`, `debounce`, `throttle`, `attr`, `self`, `updateTrigger`
 * - Custom Elements: `au-compose`, `au-slot`
 * - Custom Attributes: `blur`, `focus`, `portal`
 * - Template controllers: `if`/`else`, `repeat`, `with`
 * - Value Converters: `sanitize`
 */
export declare const DefaultResources: (IRegistry | typeof AuSlot)[];
export declare const CallBindingRendererRegistration: IRegistry;
export declare const CustomAttributeRendererRegistration: IRegistry;
export declare const CustomElementRendererRegistration: IRegistry;
export declare const InterpolationBindingRendererRegistration: IRegistry;
export declare const IteratorBindingRendererRegistration: IRegistry;
export declare const LetElementRendererRegistration: IRegistry;
export declare const PropertyBindingRendererRegistration: IRegistry;
export declare const RefBindingRendererRegistration: IRegistry;
export declare const SetPropertyRendererRegistration: IRegistry;
export declare const TemplateControllerRendererRegistration: IRegistry;
export declare const ListenerBindingRendererRegistration: IRegistry;
export declare const AttributeBindingRendererRegistration: IRegistry;
export declare const SetAttributeRendererRegistration: IRegistry;
export declare const SetClassAttributeRendererRegistration: IRegistry;
export declare const SetStyleAttributeRendererRegistration: IRegistry;
export declare const StylePropertyBindingRendererRegistration: IRegistry;
export declare const TextBindingRendererRegistration: IRegistry;
export declare const SpreadRendererRegistration: IRegistry;
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
export declare const DefaultRenderers: IRegistry[];
export declare const StandardConfiguration: {
    optionsProvider: ConfigurationOptionsProvider;
    /**
     * Apply this configuration to the provided container.
     */
    register(container: IContainer): IContainer;
    customize(cb?: ConfigurationOptionsProvider | undefined): any;
};
export declare type ConfigurationOptionsProvider = (options: IRuntimeHtmlConfigurationOptions) => void;
interface IRuntimeHtmlConfigurationOptions {
    coercingOptions: ICoercionConfiguration;
}
export {};
//# sourceMappingURL=configuration.d.ts.map