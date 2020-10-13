import { DI, IContainer, IRegistry } from '@aurelia/kernel';
import { RuntimeConfiguration } from '@aurelia/runtime';
import {
  AttrBindingCommand,
  CaptureBindingCommand,
  ClassBindingCommand,
  DelegateBindingCommand,
  RefBindingCommand,
  StyleBindingCommand,
  TriggerBindingCommand
} from './binding-commands';
import { HtmlAttrSyntaxTransformer } from './html-attribute-syntax-transformer';
import { TemplateCompiler } from './template-compiler';
import { HTMLTemplateElementFactory } from './template-element-factory';
import {
  AttributeBindingComposer,
  ListenerBindingComposer,
  SetAttributeComposer,
  StylePropertyBindingComposer,
  TextBindingComposer,
  SetClassAttributeComposer,
  SetStyleAttributeComposer
} from './html-composer';
import { TargetAccessorLocator, TargetObserverLocator } from './observation/observer-locator';
import { HTMLProjectorLocator } from './projectors';
import { AttrBindingBehavior } from './resources/binding-behaviors/attr';
import { SelfBindingBehavior } from './resources/binding-behaviors/self';
import { UpdateTriggerBindingBehavior } from './resources/binding-behaviors/update-trigger';
import { Blur } from './resources/custom-attributes/blur';
import { Focus } from './resources/custom-attributes/focus';
import { Portal } from './resources/custom-attributes/portal';
import { Compose } from './resources/custom-elements/compose';

export const ITemplateCompilerRegistration = TemplateCompiler as IRegistry;
export const ITemplateElementFactoryRegistration = HTMLTemplateElementFactory as IRegistry;
export const IAttrSyntaxTransformerRegistation = HtmlAttrSyntaxTransformer as IRegistry;
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
  ITemplateCompilerRegistration,
  ITemplateElementFactoryRegistration,
  IAttrSyntaxTransformerRegistation,
  IProjectorLocatorRegistration,
  ITargetAccessorLocatorRegistration,
  ITargetObserverLocatorRegistration,
];

export const RefBindingCommandRegistration = RefBindingCommand as unknown as IRegistry;
export const TriggerBindingCommandRegistration = TriggerBindingCommand as unknown as IRegistry;
export const DelegateBindingCommandRegistration = DelegateBindingCommand as unknown as IRegistry;
export const CaptureBindingCommandRegistration = CaptureBindingCommand as unknown as IRegistry;
export const AttrBindingCommandRegistration = AttrBindingCommand as unknown as IRegistry;
export const ClassBindingCommandRegistration = ClassBindingCommand as unknown as IRegistry;
export const StyleBindingCommandRegistration = StyleBindingCommand as unknown as IRegistry;

/**
 * Default HTML-specific (but environment-agnostic) binding commands:
 * - Event listeners: `.trigger`, `.delegate`, `.capture`
 */
export const DefaultBindingLanguage = [
  RefBindingCommandRegistration,
  TriggerBindingCommandRegistration,
  DelegateBindingCommandRegistration,
  CaptureBindingCommandRegistration,
  ClassBindingCommandRegistration,
  StyleBindingCommandRegistration,
  AttrBindingCommandRegistration
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

export const ListenerBindingRendererRegistration = ListenerBindingComposer as unknown as IRegistry;
export const AttributeBindingRendererRegistration = AttributeBindingComposer as unknown as IRegistry;
export const SetAttributeRendererRegistration = SetAttributeComposer as unknown as IRegistry;
export const SetClassAttributeRendererRegistration = SetClassAttributeComposer as unknown as IRegistry;
export const SetStyleAttributeRendererRegistration = SetStyleAttributeComposer as unknown as IRegistry;
export const StylePropertyBindingRendererRegistration = StylePropertyBindingComposer as unknown as IRegistry;
export const TextBindingRendererRegistration = TextBindingComposer as unknown as IRegistry;

/**
 * Default HTML-specfic (but environment-agnostic) renderers for:
 * - Listener Bindings: `trigger`, `capture`, `delegate`
 * - SetAttribute
 * - StyleProperty: `style`, `css`
 * - TextBinding: `${}`
 */
export const DefaultRenderers = [
  ListenerBindingRendererRegistration,
  AttributeBindingRendererRegistration,
  SetAttributeRendererRegistration,
  SetClassAttributeRendererRegistration,
  SetStyleAttributeRendererRegistration,
  StylePropertyBindingRendererRegistration,
  TextBindingRendererRegistration
];

/**
 * A DI configuration object containing html-specific (but environment-agnostic) registrations:
 * - `RuntimeConfiguration` from `@aurelia/runtime`
 * - `DefaultComponents`
 * - `DefaultResources`
 * - `DefaultRenderers`
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
        ...DefaultBindingLanguage,
        ...DefaultRenderers,
      );
  },
  /**
   * Create a new container with this configuration applied to it.
   */
  createContainer(): IContainer {
    return this.register(DI.createContainer());
  }
};
