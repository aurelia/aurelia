import { IContainer, IRegistry } from '@aurelia/kernel';
export declare const IExpressionParserRegistration: IRegistry;
/**
 * Default runtime/environment-agnostic implementations for the following interfaces:
 * - `IExpressionParser`
 */
export declare const DefaultComponents: IRegistry[];
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
/**
 * Default runtime/environment-agnostic binding commands:
 * - Property observation: `.bind`, `.one-time`, `.from-view`, `.to-view`, `.two-way`
 * - Function call: `.call`
 * - Collection observation: `.for`
 */
export declare const DefaultBindingLanguage: IRegistry[];
/**
 * A DI configuration object containing runtime/environment-agnostic registrations:
 * - `RuntimeConfiguration` from `@aurelia/runtime`
 * - `DefaultComponents`
 * - `DefaultBindingSyntax`
 * - `DefaultBindingLanguage`
 */
export declare const JitConfiguration: {
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