import { IContainer, IRegistry } from '@aurelia/kernel';
import { AttrAttributePattern, ClassAttributePattern, StyleAttributePattern } from './attribute-patterns';
export declare const ITemplateCompilerRegistration: IRegistry;
export declare const ITemplateElementFactoryRegistration: IRegistry;
export declare const IAttrSyntaxTransformerRegistation: IRegistry;
/**
 * Default HTML-specific (but environment-agnostic) implementations for the following interfaces:
 * - `ITemplateCompiler`
 * - `ITemplateElementFactory`
 */
export declare const DefaultComponents: IRegistry[];
/**
 * Default HTML-specific (but environment-agnostic) implementations for style binding
 */
export declare const JitAttrBindingSyntax: (typeof AttrAttributePattern | typeof StyleAttributePattern | typeof ClassAttributePattern)[];
export declare const RefBindingCommandRegistration: IRegistry;
export declare const TriggerBindingCommandRegistration: IRegistry;
export declare const DelegateBindingCommandRegistration: IRegistry;
export declare const CaptureBindingCommandRegistration: IRegistry;
export declare const AttrBindingCommandRegistration: IRegistry;
export declare const ClassBindingCommandRegistration: IRegistry;
export declare const StyleBindingCommandRegistration: IRegistry;
/**
 * Default HTML-specific (but environment-agnostic) binding commands:
 * - Event listeners: `.trigger`, `.delegate`, `.capture`
 */
export declare const DefaultBindingLanguage: IRegistry[];
/**
 * A DI configuration object containing html-specific (but environment-agnostic) registrations:
 * - `RuntimeHtmlConfiguration` from `@aurelia/runtime-html`
 * - `DefaultComponents` from `@aurelia/jit`
 * - `DefaultBindingSyntax` from `@aurelia/jit`
 * - `DefaultBindingLanguage` from `@aurelia/jit`
 * - `DefaultComponents`
 * - `DefaultBindingLanguage`
 */
export declare const JitHtmlConfiguration: {
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