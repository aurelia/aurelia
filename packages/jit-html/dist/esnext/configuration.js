import { DefaultBindingLanguage as JitDefaultBindingLanguage, DefaultBindingSyntax as JitDefaultBindingSyntax, DefaultComponents as JitDefaultComponents } from '@aurelia/jit';
import { DI } from '@aurelia/kernel';
import { BasicConfiguration as RuntimeHtmlBasicConfiguration } from '@aurelia/runtime-html';
import { AttrAttributePattern, ClassAttributePattern, StyleAttributePattern } from './attribute-patterns';
import { AttrBindingCommand, CaptureBindingCommand, ClassBindingCommand, DelegateBindingCommand, StyleBindingCommand, TriggerBindingCommand } from './binding-commands';
import { TemplateCompiler } from './template-compiler';
import { HTMLTemplateElementFactory } from './template-element-factory';
export const ITemplateCompilerRegistration = TemplateCompiler;
export const ITemplateElementFactoryRegistration = HTMLTemplateElementFactory;
/**
 * Default HTML-specific (but environment-agnostic) implementations for the following interfaces:
 * - `ITemplateCompiler`
 * - `ITemplateElementFactory`
 */
export const DefaultComponents = [
    ITemplateCompilerRegistration,
    ITemplateElementFactoryRegistration
];
/**
 * Default HTML-specific (but environment-agnostic) implementations for style binding
 */
export const JitAttrBindingSyntax = [
    StyleAttributePattern,
    ClassAttributePattern,
    AttrAttributePattern
];
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
    TriggerBindingCommandRegistration,
    DelegateBindingCommandRegistration,
    CaptureBindingCommandRegistration,
    ClassBindingCommandRegistration,
    StyleBindingCommandRegistration,
    AttrBindingCommandRegistration
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
    register(container) {
        return RuntimeHtmlBasicConfiguration
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