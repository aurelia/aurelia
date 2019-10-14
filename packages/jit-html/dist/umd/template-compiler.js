(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/jit", "@aurelia/kernel", "@aurelia/runtime", "@aurelia/runtime-html", "./attribute-syntax-transformer", "./template-binder", "./template-element-factory"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const jit_1 = require("@aurelia/jit");
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    const runtime_html_1 = require("@aurelia/runtime-html");
    const attribute_syntax_transformer_1 = require("./attribute-syntax-transformer");
    const template_binder_1 = require("./template-binder");
    const template_element_factory_1 = require("./template-element-factory");
    const buildNotRequired = Object.freeze({
        required: false,
        compiler: 'default'
    });
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
            this.instructionRows = null;
            this.parts = null;
            this.scopeParts = null;
        }
        get name() {
            return 'default';
        }
        static register(container) {
            return kernel_1.Registration.singleton(runtime_1.ITemplateCompiler, this).register(container);
        }
        compile(dom, definition, descriptions) {
            const binder = new template_binder_1.TemplateBinder(dom, new jit_1.ResourceModel(descriptions), this.attrParser, this.exprParser, this.attrSyntaxModifier);
            const template = definition.template = this.factory.createTemplate(definition.template);
            const surrogate = binder.bind(template);
            if (definition.instructions === undefined || definition.instructions === kernel_1.PLATFORM.emptyArray) {
                definition.instructions = [];
            }
            if (surrogate.hasSlots === true) {
                definition.hasSlots = true;
            }
            if (definition.scopeParts === void 0 || definition.scopeParts === kernel_1.PLATFORM.emptyArray) {
                definition.scopeParts = [];
            }
            this.instructionRows = definition.instructions;
            this.parts = {};
            this.scopeParts = definition.scopeParts;
            const customAttributes = surrogate.customAttributes;
            const plainAttributes = surrogate.plainAttributes;
            const customAttributeLength = customAttributes.length;
            const plainAttributeLength = plainAttributes.length;
            if (customAttributeLength + plainAttributeLength > 0) {
                if (definition.surrogates === undefined || definition.surrogates === kernel_1.PLATFORM.emptyArray) {
                    definition.surrogates = Array(customAttributeLength + plainAttributeLength);
                }
                const surrogates = definition.surrogates;
                let offset = 0;
                for (let i = 0; customAttributeLength > i; ++i) {
                    surrogates[offset] = this.compileCustomAttribute(customAttributes[i]);
                    offset++;
                }
                for (let i = 0; i < plainAttributeLength; ++i) {
                    surrogates[offset] = this.compilePlainAttribute(plainAttributes[i]);
                    offset++;
                }
            }
            this.compileChildNodes(surrogate);
            this.instructionRows = null;
            this.parts = null;
            this.scopeParts = null;
            definition.build = buildNotRequired;
            return definition;
        }
        compileChildNodes(parent) {
            if ((parent.flags & 8192 /* hasChildNodes */) > 0) {
                const { childNodes } = parent;
                let childNode;
                const ii = childNodes.length;
                for (let i = 0; i < ii; ++i) {
                    childNode = childNodes[i];
                    if ((childNode.flags & 128 /* isText */) > 0) {
                        this.instructionRows.push([new runtime_html_1.TextBindingInstruction(childNode.interpolation)]);
                    }
                    else if ((childNode.flags & 32 /* isLetElement */) > 0) {
                        const bindings = childNode.bindings;
                        const instructions = [];
                        let binding;
                        const jj = bindings.length;
                        for (let j = 0; j < jj; ++j) {
                            binding = bindings[j];
                            instructions[j] = new runtime_1.LetBindingInstruction(binding.expression, binding.target);
                        }
                        this.instructionRows.push([new runtime_1.LetElementInstruction(instructions, childNode.toBindingContext)]);
                    }
                    else {
                        this.compileParentNode(childNode);
                    }
                }
            }
        }
        compileCustomElement(symbol) {
            // offset 1 to leave a spot for the hydrate instruction so we don't need to create 2 arrays with a spread etc
            const instructionRow = this.compileAttributes(symbol, 1);
            instructionRow[0] = new runtime_1.HydrateElementInstruction(symbol.res, this.compileBindings(symbol), this.compileParts(symbol));
            this.instructionRows.push(instructionRow);
            this.compileChildNodes(symbol);
        }
        compilePlainElement(symbol) {
            const attributes = this.compileAttributes(symbol, 0);
            if (attributes.length > 0) {
                this.instructionRows.push(attributes);
            }
            this.compileChildNodes(symbol);
        }
        compileParentNode(symbol) {
            switch (symbol.flags & 511 /* type */) {
                case 16 /* isCustomElement */:
                    this.compileCustomElement(symbol);
                    break;
                case 64 /* isPlainElement */:
                    this.compilePlainElement(symbol);
                    break;
                case 1 /* isTemplateController */:
                    this.compileTemplateController(symbol);
            }
        }
        compileTemplateController(symbol) {
            const bindings = this.compileBindings(symbol);
            const instructionRowsSave = this.instructionRows;
            const scopePartsSave = this.scopeParts;
            const controllerInstructions = this.instructionRows = [];
            const scopeParts = this.scopeParts = [];
            this.compileParentNode(symbol.template);
            this.instructionRows = instructionRowsSave;
            this.scopeParts = kernel_1.mergeDistinct(scopePartsSave, scopeParts, false);
            const def = {
                scopeParts,
                name: symbol.partName === null ? symbol.res : symbol.partName,
                template: symbol.physicalNode,
                instructions: controllerInstructions,
                build: buildNotRequired
            };
            let parts = void 0;
            if ((symbol.flags & 16384 /* hasParts */) > 0) {
                parts = {};
                for (const part of symbol.parts) {
                    parts[part.name] = this.parts[part.name];
                }
            }
            this.instructionRows.push([new runtime_1.HydrateTemplateController(def, symbol.res, bindings, symbol.res === 'else', parts)]);
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
                bindingInstructions = kernel_1.PLATFORM.emptyArray;
            }
            return bindingInstructions;
        }
        compileBinding(symbol) {
            if (symbol.command === null) {
                // either an interpolation or a normal string value assigned to an element or attribute binding
                if (symbol.expression === null) {
                    // the template binder already filtered out non-bindables, so we know we need a setProperty here
                    return new runtime_1.SetPropertyInstruction(symbol.rawValue, symbol.bindable.propName);
                }
                else {
                    // either an element binding interpolation or a dynamic options attribute binding interpolation
                    return new runtime_1.InterpolationInstruction(symbol.expression, symbol.bindable.propName);
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
                    attributeInstructions[offset] = this.compilePlainAttribute(plainAttributes[i]);
                    offset++;
                }
            }
            else if (offset > 0) {
                attributeInstructions = Array(offset);
            }
            else {
                attributeInstructions = kernel_1.PLATFORM.emptyArray;
            }
            return attributeInstructions;
        }
        compileCustomAttribute(symbol) {
            // a normal custom attribute (not template controller)
            const bindings = this.compileBindings(symbol);
            return new runtime_1.HydrateAttributeInstruction(symbol.res, bindings);
        }
        compilePlainAttribute(symbol) {
            if (symbol.command === null) {
                if (symbol.expression === null) {
                    // a plain attribute on a surrogate
                    return new runtime_html_1.SetAttributeInstruction(symbol.syntax.rawValue, symbol.syntax.target);
                }
                else {
                    // a plain attribute with an interpolation
                    return new runtime_1.InterpolationInstruction(symbol.expression, symbol.syntax.target);
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
        compileParts(symbol) {
            let parts;
            if ((symbol.flags & 16384 /* hasParts */) > 0) {
                parts = {};
                const replaceParts = symbol.parts;
                const ii = replaceParts.length;
                let instructionRowsSave;
                let partScopesSave;
                let scopeParts;
                let partInstructions;
                let replacePart;
                for (let i = 0; i < ii; ++i) {
                    replacePart = replaceParts[i];
                    instructionRowsSave = this.instructionRows;
                    partScopesSave = this.scopeParts;
                    if (!partScopesSave.includes(replacePart.name)) {
                        partScopesSave.push(replacePart.name);
                    }
                    scopeParts = this.scopeParts = [];
                    partInstructions = this.instructionRows = [];
                    this.compileParentNode(replacePart.template);
                    this.parts[replacePart.name] = parts[replacePart.name] = {
                        scopeParts,
                        name: replacePart.name,
                        template: replacePart.physicalNode,
                        instructions: partInstructions,
                        build: buildNotRequired,
                    };
                    this.instructionRows = instructionRowsSave;
                    this.scopeParts = partScopesSave;
                }
            }
            else {
                parts = kernel_1.PLATFORM.emptyObject;
            }
            return parts;
        }
    };
    TemplateCompiler = tslib_1.__decorate([
        tslib_1.__param(0, template_element_factory_1.ITemplateElementFactory),
        tslib_1.__param(1, jit_1.IAttributeParser),
        tslib_1.__param(2, runtime_1.IExpressionParser),
        tslib_1.__param(3, attribute_syntax_transformer_1.IAttrSyntaxTransformer)
    ], TemplateCompiler);
    exports.TemplateCompiler = TemplateCompiler;
});
//# sourceMappingURL=template-compiler.js.map