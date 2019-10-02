import { DefaultBindingLanguage as JitDefaultBindingLanguage, DefaultBindingSyntax as JitDefaultBindingSyntax, DefaultComponents as JitDefaultComponents } from '@aurelia/jit';
import { DI } from '@aurelia/kernel';
import { RuntimeHtmlConfiguration } from '@aurelia/runtime-html';
import { AttrAttributePattern, ClassAttributePattern, StyleAttributePattern } from './attribute-patterns';
import { AttrBindingCommand, CaptureBindingCommand, ClassBindingCommand, DelegateBindingCommand, RefBindingCommand, StyleBindingCommand, TriggerBindingCommand } from './binding-commands';
import { HtmlAttrSyntaxTransformer } from './html-attribute-syntax-transformer';
import { TemplateCompiler } from './template-compiler';
import { HTMLTemplateElementFactory } from './template-element-factory';
export const ITemplateCompilerRegistration = TemplateCompiler;
export const ITemplateElementFactoryRegistration = HTMLTemplateElementFactory;
export const IAttrSyntaxTransformerRegistation = HtmlAttrSyntaxTransformer;
/**
 * Default HTML-specific (but environment-agnostic) implementations for the following interfaces:
 * - `ITemplateCompiler`
 * - `ITemplateElementFactory`
 */
export const DefaultComponents = [
    ITemplateCompilerRegistration,
    ITemplateElementFactoryRegistration,
    IAttrSyntaxTransformerRegistation
];
/**
 * Default HTML-specific (but environment-agnostic) implementations for style binding
 */
export const JitAttrBindingSyntax = [
    StyleAttributePattern,
    ClassAttributePattern,
    AttrAttributePattern
];
export const RefBindingCommandRegistration = RefBindingCommand;
export const TriggerBindingCommandRegistration = TriggerBindingCommand;
export const DelegateBindingCommandRegistration = DelegateBindingCommand;
export const CaptureBindingCommandRegistration = CaptureBindingCommand;
export const AttrBindingCommandRegistration = AttrBindingCommand;
export const ClassBindingCommandRegistration = ClassBindingCommand;
export const StyleBindingCommandRegistration = StyleBindingCommand;
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
/**
 * A DI configuration object containing html-specific (but environment-agnostic) registrations:
 * - `RuntimeHtmlConfiguration` from `@aurelia/runtime-html`
 * - `DefaultComponents` from `@aurelia/jit`
 * - `DefaultBindingSyntax` from `@aurelia/jit`
 * - `DefaultBindingLanguage` from `@aurelia/jit`
 * - `DefaultComponents`
 * - `DefaultBindingLanguage`
 */
export const JitHtmlConfiguration = {
    /**
     * Apply this configuration to the provided container.
     */
    register(container) {
        return RuntimeHtmlConfiguration
            .register(container)
            .register(...JitDefaultComponents, ...JitDefaultBindingSyntax, ...JitAttrBindingSyntax, ...JitDefaultBindingLanguage, ...DefaultComponents, ...DefaultBindingLanguage);
    },
    /**
     * Create a new container with this configuration applied to it.
     */
    createContainer() {
        return this.register(DI.createContainer());
    }
};
//# sourceMappingURL=configuration.js.map