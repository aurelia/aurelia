import { DI } from '@aurelia/kernel';
import { IExpressionParser, RuntimeConfiguration } from '@aurelia/runtime';
import { AtPrefixedTriggerAttributePattern, ColonPrefixedBindAttributePattern, DotSeparatedAttributePattern, RefAttributePattern } from './attribute-patterns';
import { CallBindingCommand, DefaultBindingCommand, ForBindingCommand, FromViewBindingCommand, OneTimeBindingCommand, ToViewBindingCommand, TwoWayBindingCommand } from './binding-commands';
import { parseExpression } from './expression-parser';
export const IExpressionParserRegistration = {
    register(container) {
        container.registerTransformer(IExpressionParser, parser => {
            Reflect.set(parser, 'parseCore', parseExpression);
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
    register(container) {
        return RuntimeConfiguration
            .register(container)
            .register(...DefaultComponents, ...DefaultBindingSyntax, ...DefaultBindingLanguage);
    },
    /**
     * Create a new container with this configuration applied to it.
     */
    createContainer() {
        return this.register(DI.createContainer());
    }
};
//# sourceMappingURL=configuration.js.map