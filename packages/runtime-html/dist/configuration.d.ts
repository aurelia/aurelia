import { IContainer, IRegistry } from '@aurelia/kernel';
import { AuSlot } from './resources/custom-elements/au-slot';
export declare const ITemplateCompilerRegistration: IRegistry;
export declare const ITargetAccessorLocatorRegistration: IRegistry;
export declare const ITargetObserverLocatorRegistration: IRegistry;
/**
 * Default HTML-specific (but environment-agnostic) implementations for the following interfaces:
 * - `ITemplateCompiler`
 * - `IComposer`
 * - `ITargetAccessorLocator`
 * - `ITargetObserverLocator`
 */
export declare const DefaultComponents: IRegistry[];
export declare const SVGAnalyzerRegistration: IRegistry;
export declare const AtPrefixedTriggerAttributePatternRegistration: IRegistry;
export declare const ColonPrefixedBindAttributePatternRegistration: IRegistry;
export declare const RefAttributePatternRegistration: IRegistry;
export declare const DotSeparatedAttributePatternRegistration: IRegistry;
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
export declare const InfrequentMutationsRegistration: IRegistry;
export declare const ObserveShallowRegistration: IRegistry;
export declare const IfRegistration: IRegistry;
export declare const ElseRegistration: IRegistry;
export declare const RepeatRegistration: IRegistry;
export declare const WithRegistration: IRegistry;
export declare const SwitchRegistration: IRegistry;
export declare const CaseRegistration: IRegistry;
export declare const DefaultCaseRegistration: IRegistry;
export declare const AttrBindingBehaviorRegistration: IRegistry;
export declare const SelfBindingBehaviorRegistration: IRegistry;
export declare const UpdateTriggerBindingBehaviorRegistration: IRegistry;
export declare const ComposeRegistration: IRegistry;
export declare const PortalRegistration: IRegistry;
export declare const FocusRegistration: IRegistry;
export declare const BlurRegistration: IRegistry;
/**
 * Default HTML-specific (but environment-agnostic) resources:
 * - Binding Behaviors: `oneTime`, `toView`, `fromView`, `twoWay`, `signal`, `debounce`, `throttle`, `attr`, `self`, `updateTrigger`
 * - Custom Elements: `au-compose`, `au-slot`
 * - Custom Attributes: `blur`, `focus`, `portal`
 * - Template controllers: `if`/`else`, `repeat`, `with`
 * - Value Converters: `sanitize`
 */
export declare const DefaultResources: (IRegistry | typeof AuSlot)[];
export declare const CallBindingComposerRegistration: IRegistry;
export declare const CustomAttributeComposerRegistration: IRegistry;
export declare const CustomElementComposerRegistration: IRegistry;
export declare const InterpolationBindingComposerRegistration: IRegistry;
export declare const IteratorBindingComposerRegistration: IRegistry;
export declare const LetElementComposerRegistration: IRegistry;
export declare const PropertyBindingComposerRegistration: IRegistry;
export declare const RefBindingComposerRegistration: IRegistry;
export declare const SetPropertyComposerRegistration: IRegistry;
export declare const TemplateControllerComposerRegistration: IRegistry;
export declare const ListenerBindingComposerRegistration: IRegistry;
export declare const AttributeBindingComposerRegistration: IRegistry;
export declare const SetAttributeComposerRegistration: IRegistry;
export declare const SetClassAttributeComposerRegistration: IRegistry;
export declare const SetStyleAttributeComposerRegistration: IRegistry;
export declare const StylePropertyBindingComposerRegistration: IRegistry;
export declare const TextBindingComposerRegistration: IRegistry;
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
export declare const DefaultComposers: IRegistry[];
/**
 * A DI configuration object containing html-specific (but environment-agnostic) registrations:
 * - `RuntimeConfiguration` from `@aurelia/runtime`
 * - `DefaultComponents`
 * - `DefaultResources`
 * - `DefaultComposers`
 */
export declare const StandardConfiguration: {
    /**
     * Apply this configuration to the provided container.
     */
    register(container: IContainer): IContainer;
    /**
     * Create a new container with this configuration applied to it.
     */
    createContainer(): IContainer;
};
//# sourceMappingURL=configuration.d.ts.map