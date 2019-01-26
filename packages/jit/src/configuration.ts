import { DI, IContainer, IRegistry } from '@aurelia/kernel';
import { IExpressionParser, RuntimeBasicConfiguration } from '@aurelia/runtime';
import {
  AtPrefixedTriggerAttributePattern,
  ColonPrefixedBindAttributePattern,
  DotSeparatedAttributePattern,
  RefAttributePattern
} from './attribute-pattern';
import {
  CallBindingCommand,
  DefaultBindingCommand,
  ForBindingCommand,
  FromViewBindingCommand,
  OneTimeBindingCommand,
  ToViewBindingCommand,
  TwoWayBindingCommand
} from './binding-command';
import { parseExpression } from './expression-parser';

export const IExpressionParserRegistration: IRegistry = {
  register(container: IContainer): void {
    container.registerTransformer(IExpressionParser, parser => {
      parser['parseCore'] = parseExpression;
      return parser;
    });
  }
};

/**
 * Default runtime/environment-agnostic implementations for the following interfaces:
 * - `IExpressionParser`
 */
export const DefaultComponents = [
  IExpressionParserRegistration
];

export const AtPrefixedTriggerAttributePatternRegistration = AtPrefixedTriggerAttributePattern as IRegistry;
export const ColonPrefixedBindAttributePatternRegistration = ColonPrefixedBindAttributePattern as IRegistry;
export const RefAttributePatternRegistration = RefAttributePattern as IRegistry;
export const DotSeparatedAttributePatternRegistration = DotSeparatedAttributePattern as IRegistry;

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

export const CallBindingCommandRegistration = CallBindingCommand as IRegistry;
export const DefaultBindingCommandRegistration = DefaultBindingCommand as IRegistry;
export const ForBindingCommandRegistration = ForBindingCommand as IRegistry;
export const FromViewBindingCommandRegistration = FromViewBindingCommand as IRegistry;
export const OneTimeBindingCommandRegistration = OneTimeBindingCommand as IRegistry;
export const ToViewBindingCommandRegistration = ToViewBindingCommand as IRegistry;
export const TwoWayBindingCommandRegistration = TwoWayBindingCommand as IRegistry;

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
 * - `BasicConfiguration` from `@aurelia/runtime`
 * - `DefaultComponents`
 * - `DefaultBindingSyntax`
 * - `DefaultBindingLanguage`
 */
export const BasicConfiguration = {
  /**
   * Apply this configuration to the provided container.
   */
  register(container: IContainer): IContainer {
    return RuntimeBasicConfiguration
      .register(container)
      .register(
        ...DefaultComponents,
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
