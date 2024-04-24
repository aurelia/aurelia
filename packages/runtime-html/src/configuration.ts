import { IContainer, noop } from '@aurelia/kernel';
import { DirtyChecker, ICoercionConfiguration } from '@aurelia/runtime';
import {
  AtPrefixedTriggerAttributePattern,
  ColonPrefixedBindAttributePattern,
  SpreadAttributePattern,
  DotSeparatedAttributePattern,
  RefAttributePattern,
  EventAttributePattern,

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
} from '@aurelia/template-compiler';
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
import { instanceRegistration } from './utilities-di';
import { EventModifierRegistration } from './binding/listener-binding';
import { templateCompilerComponents } from './compiler/template-compiler';

/**
 * Default HTML-specific (but environment-agnostic) implementations for the following interfaces:
 * - `ITemplateCompiler`
 * - `ITargetAccessorLocator`
 * - `ITargetObserverLocator`
 */
export const DefaultComponents = [
  templateCompilerComponents,
  DirtyChecker,
  NodeObserverLocator,
];

/**
 * Default binding syntax for the following attribute name patterns:
 * - `ref`
 * - `target.command` (dot-separated)
 */
export const DefaultBindingSyntax = [
  RefAttributePattern,
  DotSeparatedAttributePattern,
  SpreadAttributePattern,
  EventAttributePattern,
  EventModifierRegistration,
];

/**
 * Binding syntax for short-hand attribute name patterns:
 * - `@target` (short-hand for `target.trigger`)
 * - `:target` (short-hand for `target.bind`)
 */
export const ShortHandBindingSyntax = [
  AtPrefixedTriggerAttributePattern,
  ColonPrefixedBindAttributePattern
];

/**
 * Default HTML-specific (but environment-agnostic) binding commands:
 * - Property observation: `.bind`, `.one-time`, `.from-view`, `.to-view`, `.two-way
 * - Collection observation: `.for`
 * - Event listeners: `.trigger`, `.capture`
 */
export const DefaultBindingLanguage = [
  DefaultBindingCommand,
  OneTimeBindingCommand,
  FromViewBindingCommand,
  ToViewBindingCommand,
  TwoWayBindingCommand,
  ForBindingCommand,
  RefBindingCommand,
  TriggerBindingCommand,
  CaptureBindingCommand,
  ClassBindingCommand,
  StyleBindingCommand,
  AttrBindingCommand,
  SpreadBindingCommand,
];

/**
 * Default HTML-specific (but environment-agnostic) resources:
 * - Binding Behaviors: `oneTime`, `toView`, `fromView`, `twoWay`, `signal`, `debounce`, `throttle`, `attr`, `self`, `updateTrigger`
 * - Custom Elements: `au-compose`, `au-slot`
 * - Custom Attributes: `blur`, `focus`, `portal`
 * - Template controllers: `if`/`else`, `repeat`, `with`
 * - Value Converters: `sanitize`
 */
export const DefaultResources = [
  DebounceBindingBehavior,
  OneTimeBindingBehavior,
  ToViewBindingBehavior,
  FromViewBindingBehavior,
  SignalBindingBehavior,
  ThrottleBindingBehavior,
  TwoWayBindingBehavior,
  SanitizeValueConverter,
  If,
  Else,
  Repeat,
  With,
  Switch,
  Case,
  DefaultCase,
  PromiseTemplateController,
  PendingTemplateController,
  FulfilledTemplateController,
  RejectedTemplateController,
  // TODO: activate after the attribute parser and/or interpreter such that for `t`, `then` is not picked up.
  PromiseAttributePattern,
  FulfilledAttributePattern,
  RejectedAttributePattern,
  AttrBindingBehavior,
  SelfBindingBehavior,
  UpdateTriggerBindingBehavior,
  AuCompose,
  Portal,
  Focus,
  Show,
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

export const StandardConfiguration = /*@__PURE__*/createConfiguration(noop);

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
