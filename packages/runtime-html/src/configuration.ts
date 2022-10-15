import { IContainer, IRegistry, noop } from '@aurelia/kernel';
import {
  AtPrefixedTriggerAttributePattern,
  ColonPrefixedBindAttributePattern,
  SpreadAttributePattern,
  DotSeparatedAttributePattern,
  RefAttributePattern,
} from './resources/attribute-pattern';
import {
  DefaultBindingCommand,
  ForBindingCommand,
  FromViewBindingCommand,
  OneTimeBindingCommand,
  ToViewBindingCommand,
  TwoWayBindingCommand,
  AttrBindingCommand,
  CaptureBindingCommand,
  ClassBindingCommand,
  RefBindingCommand,
  StyleBindingCommand,
  TriggerBindingCommand,
  SpreadBindingCommand,
} from './resources/binding-command';
import { TemplateCompiler } from './compiler/template-compiler';
import {
  CustomAttributeRenderer,
  CustomElementRenderer,
  InterpolationBindingRenderer,
  IteratorBindingRenderer,
  LetElementRenderer,
  PropertyBindingRenderer,
  RefBindingRenderer,
  SetPropertyRenderer,
  TemplateControllerRenderer,
  AttributeBindingRenderer,
  ListenerBindingRenderer,
  SetAttributeRenderer,
  StylePropertyBindingRenderer,
  TextBindingRenderer,
  SetClassAttributeRenderer,
  SetStyleAttributeRenderer,
  SpreadRenderer,
} from './renderer';
import {
  FromViewBindingBehavior,
  OneTimeBindingBehavior,
  ToViewBindingBehavior,
  TwoWayBindingBehavior,
} from './resources/binding-behaviors/binding-mode';
import { DebounceBindingBehavior } from './resources/binding-behaviors/debounce';
import { SignalBindingBehavior } from './resources/binding-behaviors/signals';
import { ThrottleBindingBehavior } from './resources/binding-behaviors/throttle';
import { SVGAnalyzer } from './observation/svg-analyzer';
import { AttrBindingBehavior } from './resources/binding-behaviors/attr';
import { SelfBindingBehavior } from './resources/binding-behaviors/self';
import { UpdateTriggerBindingBehavior } from './resources/binding-behaviors/update-trigger';
import { Focus } from './resources/custom-attributes/focus';
import { Show } from './resources/custom-attributes/show';
import { Portal } from './resources/template-controllers/portal';
import { Else, If } from './resources/template-controllers/if';
import { Repeat } from './resources/template-controllers/repeat';
import { With } from './resources/template-controllers/with';
import { Switch, Case, DefaultCase } from './resources/template-controllers/switch';
import {
  PromiseTemplateController,
  PendingTemplateController,
  FulfilledTemplateController,
  RejectedTemplateController,
  // TODO: activate after the attribute parser and/or interpreter such that for `t`, `then` is not picked up.
  PromiseAttributePattern,
  FulfilledAttributePattern,
  RejectedAttributePattern,
} from './resources/template-controllers/promise';
import { AuCompose } from './resources/custom-elements/au-compose';
import { AuSlot } from './resources/custom-elements/au-slot';
import { SanitizeValueConverter } from './resources/value-converters/sanitize';
import { NodeObserverLocator } from './observation/observer-locator';
import { ICoercionConfiguration } from '@aurelia/runtime';
import { instanceRegistration } from './utilities-di';

export const DebounceBindingBehaviorRegistration = DebounceBindingBehavior as unknown as IRegistry;
export const OneTimeBindingBehaviorRegistration = OneTimeBindingBehavior as unknown as IRegistry;
export const ToViewBindingBehaviorRegistration = ToViewBindingBehavior as unknown as IRegistry;
export const FromViewBindingBehaviorRegistration = FromViewBindingBehavior as unknown as IRegistry;
export const SignalBindingBehaviorRegistration = SignalBindingBehavior as unknown as IRegistry;
export const ThrottleBindingBehaviorRegistration = ThrottleBindingBehavior as unknown as IRegistry;
export const TwoWayBindingBehaviorRegistration = TwoWayBindingBehavior as unknown as IRegistry;

export const ITemplateCompilerRegistration = TemplateCompiler as IRegistry;
export const INodeObserverLocatorRegistration = NodeObserverLocator as IRegistry;

/**
 * Default HTML-specific (but environment-agnostic) implementations for the following interfaces:
 * - `ITemplateCompiler`
 * - `ITargetAccessorLocator`
 * - `ITargetObserverLocator`
 */
export const DefaultComponents = [
  ITemplateCompilerRegistration,
  INodeObserverLocatorRegistration,
];

export const SVGAnalyzerRegistration = SVGAnalyzer as IRegistry;

export const AtPrefixedTriggerAttributePatternRegistration = AtPrefixedTriggerAttributePattern as unknown as IRegistry;
export const ColonPrefixedBindAttributePatternRegistration = ColonPrefixedBindAttributePattern as unknown as IRegistry;
export const RefAttributePatternRegistration = RefAttributePattern as unknown as IRegistry;
export const DotSeparatedAttributePatternRegistration = DotSeparatedAttributePattern as unknown as IRegistry;
export const SpreadAttributePatternRegistration = SpreadAttributePattern as unknown as IRegistry;

/**
 * Default binding syntax for the following attribute name patterns:
 * - `ref`
 * - `target.command` (dot-separated)
 */
export const DefaultBindingSyntax = [
  RefAttributePatternRegistration,
  DotSeparatedAttributePatternRegistration,
  SpreadAttributePatternRegistration,
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

export const DefaultBindingCommandRegistration = DefaultBindingCommand as unknown as IRegistry;
export const ForBindingCommandRegistration = ForBindingCommand as unknown as IRegistry;
export const FromViewBindingCommandRegistration = FromViewBindingCommand as unknown as IRegistry;
export const OneTimeBindingCommandRegistration = OneTimeBindingCommand as unknown as IRegistry;
export const ToViewBindingCommandRegistration = ToViewBindingCommand as unknown as IRegistry;
export const TwoWayBindingCommandRegistration = TwoWayBindingCommand as unknown as IRegistry;
export const RefBindingCommandRegistration = RefBindingCommand as unknown as IRegistry;
export const TriggerBindingCommandRegistration = TriggerBindingCommand as unknown as IRegistry;
export const CaptureBindingCommandRegistration = CaptureBindingCommand as unknown as IRegistry;
export const AttrBindingCommandRegistration = AttrBindingCommand as unknown as IRegistry;
export const ClassBindingCommandRegistration = ClassBindingCommand as unknown as IRegistry;
export const StyleBindingCommandRegistration = StyleBindingCommand as unknown as IRegistry;
export const SpreadBindingCommandRegistration = SpreadBindingCommand as unknown as IRegistry;

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
  ForBindingCommandRegistration,
  RefBindingCommandRegistration,
  TriggerBindingCommandRegistration,
  CaptureBindingCommandRegistration,
  ClassBindingCommandRegistration,
  StyleBindingCommandRegistration,
  AttrBindingCommandRegistration,
  SpreadBindingCommandRegistration,
];

export const SanitizeValueConverterRegistration = SanitizeValueConverter as unknown as IRegistry;
export const IfRegistration = If as unknown as IRegistry;
export const ElseRegistration = Else as unknown as IRegistry;
export const RepeatRegistration = Repeat as unknown as IRegistry;
export const WithRegistration = With as unknown as IRegistry;
export const SwitchRegistration = Switch as unknown as IRegistry;
export const CaseRegistration = Case as unknown as IRegistry;
export const DefaultCaseRegistration = DefaultCase as unknown as IRegistry;
export const PromiseTemplateControllerRegistration = PromiseTemplateController as unknown as IRegistry;
export const PendingTemplateControllerRegistration = PendingTemplateController as unknown as IRegistry;
export const FulfilledTemplateControllerRegistration = FulfilledTemplateController as unknown as IRegistry;
export const RejectedTemplateControllerRegistration = RejectedTemplateController as unknown as IRegistry;
// TODO: activate after the attribute parser and/or interpreter such that for `t`, `then` is not picked up.
export const PromiseAttributePatternRegistration = PromiseAttributePattern as unknown as IRegistry;
export const FulfilledAttributePatternRegistration = FulfilledAttributePattern as unknown as IRegistry;
export const RejectedAttributePatternRegistration = RejectedAttributePattern as unknown as IRegistry;
export const SelfBindingBehaviorRegistration = SelfBindingBehavior as unknown as IRegistry;
export const UpdateTriggerBindingBehaviorRegistration = UpdateTriggerBindingBehavior as unknown as IRegistry;
export const AuComposeRegistration = AuCompose as unknown as IRegistry;
export const PortalRegistration = Portal as unknown as IRegistry;
export const FocusRegistration = Focus as unknown as IRegistry;
export const ShowRegistration = Show as unknown as IRegistry;

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
  IfRegistration,
  ElseRegistration,
  RepeatRegistration,
  WithRegistration,
  SwitchRegistration,
  CaseRegistration,
  DefaultCaseRegistration,
  PromiseTemplateControllerRegistration,
  PendingTemplateControllerRegistration,
  FulfilledTemplateControllerRegistration,
  RejectedTemplateControllerRegistration,
  // TODO: activate after the attribute parser and/or interpreter such that for `t`, `then` is not picked up.
  PromiseAttributePatternRegistration,
  FulfilledAttributePatternRegistration,
  RejectedAttributePatternRegistration,
  AttrBindingBehavior,
  SelfBindingBehaviorRegistration,
  UpdateTriggerBindingBehaviorRegistration,
  AuComposeRegistration,
  PortalRegistration,
  FocusRegistration,
  ShowRegistration,
  AuSlot,
];

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
  PropertyBindingRenderer,
  IteratorBindingRenderer,
  RefBindingRenderer,
  InterpolationBindingRenderer,
  SetPropertyRenderer,
  CustomElementRenderer,
  CustomAttributeRenderer,
  TemplateControllerRenderer,
  LetElementRenderer,
  ListenerBindingRenderer,
  AttributeBindingRenderer,
  SetAttributeRenderer,
  SetClassAttributeRenderer,
  SetStyleAttributeRenderer,
  StylePropertyBindingRenderer,
  TextBindingRenderer,
  SpreadRenderer,
];

export const StandardConfiguration = createConfiguration(noop);

function createConfiguration(optionsProvider: ConfigurationOptionsProvider) {
  return {
    optionsProvider,
    /**
     * Apply this configuration to the provided container.
     */
    register(container: IContainer): IContainer {
      const runtimeConfigurationOptions: IRuntimeHtmlConfigurationOptions = {
        coercingOptions: {
          enableCoercion: false,
          coerceNullish: false
        }
      };

      optionsProvider(runtimeConfigurationOptions);

      /**
       * Standard DI configuration containing html-specific (but environment-agnostic) registrations:
       * - `RuntimeConfiguration` from `@aurelia/runtime`
       * - `DefaultComponents`
       * - `DefaultResources`
       * - `DefaultRenderers`
       */
      return container.register(
        instanceRegistration(ICoercionConfiguration, runtimeConfigurationOptions.coercingOptions),
        ...DefaultComponents,
        ...DefaultResources,
        ...DefaultBindingSyntax,
        ...DefaultBindingLanguage,
        ...DefaultRenderers,
      );
    },
    customize(cb?: ConfigurationOptionsProvider) {
      return createConfiguration(cb ?? optionsProvider);
    },
  };
}

export type ConfigurationOptionsProvider = (options: IRuntimeHtmlConfigurationOptions) => void;
interface IRuntimeHtmlConfigurationOptions {
  coercingOptions: ICoercionConfiguration;
}
