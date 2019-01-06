import {
  DefaultBindingLanguage as JitDefaultBindingLanguage,
  DefaultBindingSyntax as JitDefaultBindingSyntax,
  DefaultComponents as JitDefaultComponents
} from '@aurelia/jit';
import { DI, IContainer, IRegistry } from '@aurelia/kernel';
import { BasicConfiguration as RuntimeHtmlBasicConfiguration } from '@aurelia/runtime-html';
import {
  CaptureBindingCommand,
  DelegateBindingCommand,
  TriggerBindingCommand
} from './binding-command';
import { TemplateCompiler } from './template-compiler';
import { HTMLTemplateElementFactory } from './template-element-factory';

export const ITemplateCompilerRegistration = TemplateCompiler as IRegistry;
export const ITemplateElementFactoryRegistration = HTMLTemplateElementFactory as IRegistry;

/**
 * Default HTML-specific (but environment-agnostic) implementations for the following interfaces:
 * - `ITemplateCompiler`
 * - `ITemplateElementFactory`
 */
export const DefaultComponents = [
  ITemplateCompilerRegistration,
  ITemplateElementFactoryRegistration
];

export const TriggerBindingCommandRegistration = TriggerBindingCommand as IRegistry;
export const DelegateBindingCommandRegistration = DelegateBindingCommand as IRegistry;
export const CaptureBindingCommandRegistration = CaptureBindingCommand as IRegistry;

/**
 * Default HTML-specific (but environment-agnostic) binding commands:
 * - Event listeners: `.trigger`, `.delegate`, `.capture`
 */
export const DefaultBindingLanguage = [
  TriggerBindingCommandRegistration,
  DelegateBindingCommandRegistration,
  CaptureBindingCommandRegistration
];

/**
 * A DI configuration object containing html-specific (but environment-agnostic) registrations:
 * - `BasicConfiguration` from `@aurelia/runtime-html`
 * - `DefaultComponents` from `@aurelia/jit`
 * - `DefaultBindingSyntax` from `@aurelia/jit`
 * - `DefaultBindingLanguage` from `@aurelia/jit`
 * - `DefaultComponents`
 * - `DefaultBindingLanguage`
 */
export const BasicConfiguration = {
  /**
   * Apply this configuration to the provided container.
   */
  register(container: IContainer): IContainer {
    return RuntimeHtmlBasicConfiguration
      .register(container)
      .register(
        ...JitDefaultComponents,
        ...JitDefaultBindingSyntax,
        ...JitDefaultBindingLanguage,
        ...DefaultComponents,
        ...DefaultBindingLanguage
      );
  },
  /**
   * Create a new container with this configuration applied to it.
   */
  createContainer(): IContainer {
    return this.register(DI.createContainer());
  }
};
