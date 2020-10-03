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
  TwoWayBindingCommand
} from './binding-commands';

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
 * A DI configuration object containing runtime/environment-agnostic registrations:
 * - `RuntimeConfiguration` from `@aurelia/runtime`
 * - `DefaultComponents`
 * - `DefaultBindingSyntax`
 * - `DefaultBindingLanguage`
 */
export const JitConfiguration = {
  /**
   * Apply this configuration to the provided container.
   */
  register(container: IContainer): IContainer {
    return RuntimeConfiguration
      .register(container)
      .register(
        ...DefaultBindingSyntax,
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
