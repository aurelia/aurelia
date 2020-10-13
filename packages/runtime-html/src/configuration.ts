import { DI, IContainer, IRegistry } from '@aurelia/kernel';
import { RuntimeConfiguration } from '@aurelia/runtime';
import {
  AtPrefixedTriggerAttributePattern,
  ColonPrefixedBindAttributePattern,
  DotSeparatedAttributePattern,
  RefAttributePattern
} from './attribute-patterns';
import {
  CallBindingCommand,
  DefaultBindingCommand,
  ForBindingCommand,
  FromViewBindingCommand,
  OneTimeBindingCommand,
  ToViewBindingCommand,
  TwoWayBindingCommand,
  AttrBindingCommand,
  CaptureBindingCommand,
  ClassBindingCommand,
  DelegateBindingCommand,
  RefBindingCommand,
  StyleBindingCommand,
  TriggerBindingCommand,
} from './binding-commands';
import { TemplateCompiler } from './template-compiler';
import {
  CallBindingComposer,
  CustomAttributeComposer,
  CustomElementComposer,
  InterpolationBindingComposer,
  IteratorBindingComposer,
  LetElementComposer,
  PropertyBindingComposer,
  RefBindingComposer,
  SetPropertyComposer,
  TemplateControllerComposer,
  AttributeBindingComposer,
  ListenerBindingComposer,
  SetAttributeComposer,
  StylePropertyBindingComposer,
  TextBindingComposer,
  SetClassAttributeComposer,
  SetStyleAttributeComposer,
  Composer,
} from './composer';
import { TargetAccessorLocator, TargetObserverLocator } from './observation/observer-locator';
import { HTMLProjectorLocator } from './projectors';
import { AttrBindingBehavior } from './resources/binding-behaviors/attr';
import { SelfBindingBehavior } from './resources/binding-behaviors/self';
import { UpdateTriggerBindingBehavior } from './resources/binding-behaviors/update-trigger';
import { Blur } from './resources/custom-attributes/blur';
import { Focus } from './resources/custom-attributes/focus';
import { Portal } from './resources/custom-attributes/portal';
import { Compose } from './resources/custom-elements/compose';

export const IComposerRegistration = Composer as IRegistry;
export const ITemplateCompilerRegistration = TemplateCompiler as IRegistry;
export const IProjectorLocatorRegistration = HTMLProjectorLocator as IRegistry;
export const ITargetAccessorLocatorRegistration = TargetAccessorLocator as IRegistry;
export const ITargetObserverLocatorRegistration = TargetObserverLocator as IRegistry;

/**
 * Default HTML-specific (but environment-agnostic) implementations for the following interfaces:
 * - `ITemplateCompiler`
 * - `ITemplateElementFactory`
 * - `IProjectorLocator`
 * - `ITargetAccessorLocator`
 * - `ITargetObserverLocator`
 * - `ITemplateFactory`
 */
export const DefaultComponents = [
  IComposerRegistration,
  ITemplateCompilerRegistration,
  IProjectorLocatorRegistration,
  ITargetAccessorLocatorRegistration,
  ITargetObserverLocatorRegistration,
];

export const AtPrefixedTriggerAttributePatternRegistration = AtPrefixedTriggerAttributePattern as unknown as IRegistry;
export const ColonPrefixedBindAttributePatternRegistration = ColonPrefixedBindAttributePattern as unknown as IRegistry;
export const RefAttributePatternRegistration = RefAttributePattern as unknown as IRegistry;
export const DotSeparatedAttributePatternRegistration = DotSeparatedAttributePattern as unknown as IRegistry;

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

export const CallBindingCommandRegistration = CallBindingCommand as unknown as IRegistry;
export const DefaultBindingCommandRegistration = DefaultBindingCommand as unknown as IRegistry;
export const ForBindingCommandRegistration = ForBindingCommand as unknown as IRegistry;
export const FromViewBindingCommandRegistration = FromViewBindingCommand as unknown as IRegistry;
export const OneTimeBindingCommandRegistration = OneTimeBindingCommand as unknown as IRegistry;
export const ToViewBindingCommandRegistration = ToViewBindingCommand as unknown as IRegistry;
export const TwoWayBindingCommandRegistration = TwoWayBindingCommand as unknown as IRegistry;
export const RefBindingCommandRegistration = RefBindingCommand as unknown as IRegistry;
export const TriggerBindingCommandRegistration = TriggerBindingCommand as unknown as IRegistry;
export const DelegateBindingCommandRegistration = DelegateBindingCommand as unknown as IRegistry;
export const CaptureBindingCommandRegistration = CaptureBindingCommand as unknown as IRegistry;
export const AttrBindingCommandRegistration = AttrBindingCommand as unknown as IRegistry;
export const ClassBindingCommandRegistration = ClassBindingCommand as unknown as IRegistry;
export const StyleBindingCommandRegistration = StyleBindingCommand as unknown as IRegistry;

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

export const AttrBindingBehaviorRegistration = AttrBindingBehavior as unknown as IRegistry;
export const SelfBindingBehaviorRegistration = SelfBindingBehavior as unknown as IRegistry;
export const UpdateTriggerBindingBehaviorRegistration = UpdateTriggerBindingBehavior as unknown as IRegistry;
export const ComposeRegistration = Compose as unknown as IRegistry;
export const PortalRegistration = Portal as unknown as IRegistry;
export const FocusRegistration = Focus as unknown as IRegistry;
export const BlurRegistration = Blur as unknown as IRegistry;

/**
 * Default HTML-specific (but environment-agnostic) resources:
 * - Binding Behaviors: `attr`, `self`, `updateTrigger`
 * - Custom Elements: `au-compose`
 * - Custom Attributes: `blur`, `focus`, `portal`
 */
export const DefaultResources = [
  AttrBindingBehaviorRegistration,
  SelfBindingBehaviorRegistration,
  UpdateTriggerBindingBehaviorRegistration,
  ComposeRegistration,
  PortalRegistration,
  FocusRegistration,
  BlurRegistration
];

export const CallBindingComposerRegistration = CallBindingComposer as unknown as IRegistry;
export const CustomAttributeComposerRegistration = CustomAttributeComposer as unknown as IRegistry;
export const CustomElementComposerRegistration = CustomElementComposer as unknown as IRegistry;
export const InterpolationBindingComposerRegistration = InterpolationBindingComposer as unknown as IRegistry;
export const IteratorBindingComposerRegistration = IteratorBindingComposer as unknown as IRegistry;
export const LetElementComposerRegistration = LetElementComposer as unknown as IRegistry;
export const PropertyBindingComposerRegistration = PropertyBindingComposer as unknown as IRegistry;
export const RefBindingComposerRegistration = RefBindingComposer as unknown as IRegistry;
export const SetPropertyComposerRegistration = SetPropertyComposer as unknown as IRegistry;
export const TemplateControllerComposerRegistration = TemplateControllerComposer as unknown as IRegistry;
export const ListenerBindingComposerRegistration = ListenerBindingComposer as unknown as IRegistry;
export const AttributeBindingComposerRegistration = AttributeBindingComposer as unknown as IRegistry;
export const SetAttributeComposerRegistration = SetAttributeComposer as unknown as IRegistry;
export const SetClassAttributeComposerRegistration = SetClassAttributeComposer as unknown as IRegistry;
export const SetStyleAttributeComposerRegistration = SetStyleAttributeComposer as unknown as IRegistry;
export const StylePropertyBindingComposerRegistration = StylePropertyBindingComposer as unknown as IRegistry;
export const TextBindingComposerRegistration = TextBindingComposer as unknown as IRegistry;

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
export const RuntimeHtmlConfiguration = {
  /**
   * Apply this configuration to the provided container.
   */
  register(container: IContainer): IContainer {
    return RuntimeConfiguration
      .register(container)
      .register(
        ...DefaultComponents,
        ...DefaultResources,
        ...DefaultBindingSyntax,
        ...DefaultBindingLanguage,
        ...DefaultComposers,
      );
  },
  /**
   * Create a new container with this configuration applied to it.
   */
  createContainer(): IContainer {
    return this.register(DI.createContainer());
  }
};
