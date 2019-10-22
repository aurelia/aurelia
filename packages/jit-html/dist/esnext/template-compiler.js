import { __decorate, __param } from "tslib";
import { IAttributeParser, ResourceModel, } from '@aurelia/jit';
import { mergeDistinct, PLATFORM, Registration, mergeArrays, } from '@aurelia/kernel';
import { HydrateAttributeInstruction, HydrateElementInstruction, HydrateTemplateController, IExpressionParser, InterpolationInstruction, ITemplateCompiler, LetBindingInstruction, LetElementInstruction, SetPropertyInstruction, CustomElementDefinition } from '@aurelia/runtime';
import { SetAttributeInstruction, TextBindingInstruction, SetClassAttributeInstruction, SetStyleAttributeInstruction, } from '@aurelia/runtime-html';
import { IAttrSyntaxTransformer } from './attribute-syntax-transformer';
import { TemplateBinder } from './template-binder';
import { ITemplateElementFactory } from './template-element-factory';
class CustomElementCompilationUnit {
    constructor(partialDefinition, surrogate, template) {
        this.partialDefinition = partialDefinition;
        this.surrogate = surrogate;
        this.template = template;
        this.instructions = [];
        this.surrogates = [];
        this.scopeParts = [];
        this.parts = {};
    }
    toDefinition() {
        const def = this.partialDefinition;
        return CustomElementDefinition.create({
            ...def,
            instructions: mergeArrays(def.instructions, this.instructions),
            surrogates: mergeArrays(def.surrogates, this.surrogates),
            scopeParts: mergeArrays(def.scopeParts, this.scopeParts),
            template: this.template,
            needsCompile: false,
            hasSlots: this.surrogate.hasSlots,
        });
    }
}
/**
 * Default (runtime-agnostic) implementation for `ITemplateCompiler`.
 *
 * @internal
 */
let TemplateCompiler = class TemplateCompiler {
    constructor(factory, attrParser, exprParser, attrSyntaxModifier) {
        this.factory = factory;
        this.attrParser = attrParser;
        this.exprParser = exprParser;
        this.attrSyntaxModifier = attrSyntaxModifier;
    }
    get name() {
        return 'default';
    }
    static register(container) {
        return Registration.singleton(ITemplateCompiler, this).register(container);
    }
    compile(dom, partialDefinition, descriptions) {
        const resources = new ResourceModel(descriptions);
        const { attrParser, exprParser, attrSyntaxModifier, factory } = this;
        const binder = new TemplateBinder(dom, resources, attrParser, exprParser, attrSyntaxModifier);
        const template = factory.createTemplate(partialDefinition.template);
        const surrogate = binder.bind(template);
        const compilation = this.compilation = new CustomElementCompilationUnit(partialDefinition, surrogate, template);
        const customAttributes = surrogate.customAttributes;
        const plainAttributes = surrogate.plainAttributes;
        const customAttributeLength = customAttributes.length;
        const plainAttributeLength = plainAttributes.length;
        if (customAttributeLength + plainAttributeLength > 0) {
            let offset = 0;
            for (let i = 0; customAttributeLength > i; ++i) {
                compilation.surrogates[offset] = this.compileCustomAttribute(customAttributes[i]);
                offset++;
            }
            for (let i = 0; i < plainAttributeLength; ++i) {
                compilation.surrogates[offset] = this.compilePlainAttribute(plainAttributes[i], true);
                offset++;
            }
        }
        this.compileChildNodes(surrogate, compilation.instructions, compilation.scopeParts);
        const definition = compilation.toDefinition();
        this.compilation = null;
        return definition;
    }
    compileChildNodes(parent, instructionRows, scopeParts) {
        if ((parent.flags & 8192 /* hasChildNodes */) > 0) {
            const { childNodes } = parent;
            let childNode;
            const ii = childNodes.length;
            for (let i = 0; i < ii; ++i) {
                childNode = childNodes[i];
                if ((childNode.flags & 128 /* isText */) > 0) {
                    instructionRows.push([new TextBindingInstruction(childNode.interpolation)]);
                }
                else if ((childNode.flags & 32 /* isLetElement */) > 0) {
                    const bindings = childNode.bindings;
                    const instructions = [];
                    let binding;
                    const jj = bindings.length;
                    for (let j = 0; j < jj; ++j) {
                        binding = bindings[j];
                        instructions[j] = new LetBindingInstruction(binding.expression, binding.target);
                    }
                    instructionRows.push([new LetElementInstruction(instructions, childNode.toBindingContext)]);
                }
                else {
                    this.compileParentNode(childNode, instructionRows, scopeParts);
                }
            }
        }
    }
    compileCustomElement(symbol, instructionRows, scopeParts) {
        // offset 1 to leave a spot for the hydrate instruction so we don't need to create 2 arrays with a spread etc
        const instructionRow = this.compileAttributes(symbol, 1);
        instructionRow[0] = new HydrateElementInstruction(symbol.res, this.compileBindings(symbol), this.compileParts(symbol, scopeParts));
        instructionRows.push(instructionRow);
        this.compileChildNodes(symbol, instructionRows, scopeParts);
    }
    compilePlainElement(symbol, instructionRows, scopeParts) {
        const attributes = this.compileAttributes(symbol, 0);
        if (attributes.length > 0) {
            instructionRows.push(attributes);
        }
        this.compileChildNodes(symbol, instructionRows, scopeParts);
    }
    compileParentNode(symbol, instructionRows, scopeParts) {
        switch (symbol.flags & 511 /* type */) {
            case 16 /* isCustomElement */:
                this.compileCustomElement(symbol, instructionRows, scopeParts);
                break;
            case 64 /* isPlainElement */:
                this.compilePlainElement(symbol, instructionRows, scopeParts);
                break;
            case 1 /* isTemplateController */:
                this.compileTemplateController(symbol, instructionRows, scopeParts);
        }
    }
    compileTemplateController(symbol, instructionRows, scopeParts) {
        const bindings = this.compileBindings(symbol);
        const controllerInstructionRows = [];
        const controllerScopeParts = [];
        this.compileParentNode(symbol.template, controllerInstructionRows, controllerScopeParts);
        mergeDistinct(scopeParts, controllerScopeParts, false);
        const def = CustomElementDefinition.create({
            name: symbol.partName === null ? symbol.res : symbol.partName,
            scopeParts: controllerScopeParts,
            template: symbol.physicalNode,
            instructions: controllerInstructionRows,
            needsCompile: false,
        });
        let parts = void 0;
        if ((symbol.flags & 16384 /* hasParts */) > 0) {
            parts = {};
            for (const part of symbol.parts) {
                parts[part.name] = this.compilation.parts[part.name];
            }
        }
        instructionRows.push([new HydrateTemplateController(def, symbol.res, bindings, symbol.res === 'else', parts)]);
    }
    compileBindings(symbol) {
        let bindingInstructions;
        if ((symbol.flags & 4096 /* hasBindings */) > 0) {
            // either a custom element with bindings, a custom attribute / template controller with dynamic options,
            // or a single value custom attribute binding
            const { bindings } = symbol;
            const len = bindings.length;
            bindingInstructions = Array(len);
            let i = 0;
            for (; i < len; ++i) {
                bindingInstructions[i] = this.compileBinding(bindings[i]);
            }
        }
        else {
            bindingInstructions = PLATFORM.emptyArray;
        }
        return bindingInstructions;
    }
    compileBinding(symbol) {
        if (symbol.command === null) {
            // either an interpolation or a normal string value assigned to an element or attribute binding
            if (symbol.expression === null) {
                // the template binder already filtered out non-bindables, so we know we need a setProperty here
                return new SetPropertyInstruction(symbol.rawValue, symbol.bindable.propName);
            }
            else {
                // either an element binding interpolation or a dynamic options attribute binding interpolation
                return new InterpolationInstruction(symbol.expression, symbol.bindable.propName);
            }
        }
        else {
            // either an element binding command, dynamic options attribute binding command,
            // or custom attribute / template controller (single value) binding command
            return symbol.command.compile(symbol);
        }
    }
    compileAttributes(symbol, offset) {
        let attributeInstructions;
        if ((symbol.flags & 2048 /* hasAttributes */) > 0) {
            // any attributes on a custom element (which are not bindables) or a plain element
            const customAttributes = symbol.customAttributes;
            const plainAttributes = symbol.plainAttributes;
            const customAttributeLength = customAttributes.length;
            const plainAttributesLength = plainAttributes.length;
            attributeInstructions = Array(offset + customAttributeLength + plainAttributesLength);
            for (let i = 0; customAttributeLength > i; ++i) {
                attributeInstructions[offset] = this.compileCustomAttribute(customAttributes[i]);
                offset++;
            }
            for (let i = 0; plainAttributesLength > i; ++i) {
                attributeInstructions[offset] = this.compilePlainAttribute(plainAttributes[i], false);
                offset++;
            }
        }
        else if (offset > 0) {
            attributeInstructions = Array(offset);
        }
        else {
            attributeInstructions = PLATFORM.emptyArray;
        }
        return attributeInstructions;
    }
    compileCustomAttribute(symbol) {
        // a normal custom attribute (not template controller)
        const bindings = this.compileBindings(symbol);
        return new HydrateAttributeInstruction(symbol.res, bindings);
    }
    compilePlainAttribute(symbol, isOnSurrogate) {
        if (symbol.command === null) {
            const syntax = symbol.syntax;
            if (symbol.expression === null) {
                const attrRawValue = syntax.rawValue;
                if (isOnSurrogate) {
                    switch (syntax.target) {
                        case 'class':
                            return new SetClassAttributeInstruction(attrRawValue);
                        case 'style':
                            return new SetStyleAttributeInstruction(attrRawValue);
                        // todo:  define how to merge other attribute peacefully
                        //        this is an existing feature request
                    }
                }
                // a plain attribute on a surrogate
                return new SetAttributeInstruction(attrRawValue, syntax.target);
            }
            else {
                // a plain attribute with an interpolation
                return new InterpolationInstruction(symbol.expression, syntax.target);
            }
        }
        else {
            // a plain attribute with a binding command
            return symbol.command.compile(symbol);
        }
    }
    // private compileAttribute(symbol: IAttributeSymbol): HTMLAttributeInstruction {
    //   // any attribute on a custom element (which is not a bindable) or a plain element
    //   if (symbol.flags & SymbolFlags.isCustomAttribute) {
    //     return this.compileCustomAttribute(symbol as CustomAttributeSymbol);
    //   } else {
    //     return this.compilePlainAttribute(symbol as PlainAttributeSymbol);
    //   }
    // }
    compileParts(symbol, scopeParts) {
        const parts = {};
        if ((symbol.flags & 16384 /* hasParts */) > 0) {
            const replaceParts = symbol.parts;
            const len = replaceParts.length;
            let s = scopeParts.length;
            for (let i = 0; i < len; ++i) {
                const replacePart = replaceParts[i];
                if (!scopeParts.includes(replacePart.name)) {
                    scopeParts[s++] = replacePart.name;
                }
                const partScopeParts = [];
                const partInstructionRows = [];
                this.compileParentNode(replacePart.template, partInstructionRows, partScopeParts);
                // TODO: the assignment to `this.compilation.parts[replacePart.name]` might be the cause of replaceable bug reported by rluba
                // need to verify this
                this.compilation.parts[replacePart.name] = parts[replacePart.name] = CustomElementDefinition.create({
                    name: replacePart.name,
                    scopeParts: partScopeParts,
                    template: replacePart.physicalNode,
                    instructions: partInstructionRows,
                    needsCompile: false,
                });
            }
        }
        return parts;
    }
};
TemplateCompiler = __decorate([
    __param(0, ITemplateElementFactory),
    __param(1, IAttributeParser),
    __param(2, IExpressionParser),
    __param(3, IAttrSyntaxTransformer)
], TemplateCompiler);
export { TemplateCompiler };
//# sourceMappingURL=template-compiler.js.map