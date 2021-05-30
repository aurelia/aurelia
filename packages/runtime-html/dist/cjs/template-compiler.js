"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateCompiler = void 0;
const kernel_1 = require("@aurelia/kernel");
const runtime_1 = require("@aurelia/runtime");
const attribute_syntax_transformer_js_1 = require("./attribute-syntax-transformer.js");
const template_binder_js_1 = require("./template-binder.js");
const template_element_factory_js_1 = require("./template-element-factory.js");
const renderer_js_1 = require("./renderer.js");
const platform_js_1 = require("./platform.js");
const bindable_js_1 = require("./bindable.js");
const attribute_pattern_js_1 = require("./resources/attribute-pattern.js");
const au_slot_js_1 = require("./resources/custom-elements/au-slot.js");
const custom_element_js_1 = require("./resources/custom-element.js");
class CustomElementCompilationUnit {
    constructor(partialDefinition, surrogate, template) {
        this.partialDefinition = partialDefinition;
        this.surrogate = surrogate;
        this.template = template;
        this.instructions = [];
        this.surrogates = [];
        this.projectionsMap = new Map();
    }
    toDefinition() {
        const def = this.partialDefinition;
        return custom_element_js_1.CustomElementDefinition.create({
            ...def,
            instructions: kernel_1.mergeArrays(def.instructions, this.instructions),
            surrogates: kernel_1.mergeArrays(def.surrogates, this.surrogates),
            template: this.template,
            needsCompile: false,
            hasSlots: this.surrogate.hasSlots,
            projectionsMap: this.projectionsMap,
        });
    }
}
var LocalTemplateBindableAttributes;
(function (LocalTemplateBindableAttributes) {
    LocalTemplateBindableAttributes["property"] = "property";
    LocalTemplateBindableAttributes["attribute"] = "attribute";
    LocalTemplateBindableAttributes["mode"] = "mode";
})(LocalTemplateBindableAttributes || (LocalTemplateBindableAttributes = {}));
const allowedLocalTemplateBindableAttributes = Object.freeze([
    "property" /* property */,
    "attribute" /* attribute */,
    "mode" /* mode */
]);
const localTemplateIdentifier = 'as-custom-element';
/**
 * Default (runtime-agnostic) implementation for `ITemplateCompiler`.
 *
 * @internal
 */
let TemplateCompiler = class TemplateCompiler {
    constructor(factory, attrParser, exprParser, attrSyntaxModifier, logger, p) {
        this.factory = factory;
        this.attrParser = attrParser;
        this.exprParser = exprParser;
        this.attrSyntaxModifier = attrSyntaxModifier;
        this.p = p;
        this.logger = logger.scopeTo('TemplateCompiler');
    }
    get name() {
        return 'default';
    }
    static register(container) {
        return kernel_1.Registration.singleton(renderer_js_1.ITemplateCompiler, this).register(container);
    }
    compile(partialDefinition, context, targetedProjections) {
        const definition = custom_element_js_1.CustomElementDefinition.getOrCreate(partialDefinition);
        if (definition.template === null || definition.template === void 0) {
            return definition;
        }
        const { attrParser, exprParser, attrSyntaxModifier, factory } = this;
        const p = context.get(platform_js_1.IPlatform);
        const binder = new template_binder_js_1.TemplateBinder(p, context, attrParser, exprParser, attrSyntaxModifier);
        const template = definition.enhance === true
            ? definition.template
            : factory.createTemplate(definition.template);
        processLocalTemplates(template, definition, context, p, this.logger);
        const surrogate = binder.bind(template);
        const compilation = this.compilation = new CustomElementCompilationUnit(definition, surrogate, template);
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
        this.compileChildNodes(surrogate, compilation.instructions, compilation.projectionsMap, targetedProjections);
        const compiledDefinition = compilation.toDefinition();
        this.compilation = null;
        return compiledDefinition;
    }
    compileChildNodes(parent, instructionRows, projections, targetedProjections) {
        if ((parent.flags & 16384 /* hasChildNodes */) > 0) {
            const childNodes = parent.childNodes;
            const ii = childNodes.length;
            let childNode;
            for (let i = 0; i < ii; ++i) {
                childNode = childNodes[i];
                if ((childNode.flags & 128 /* isText */) > 0) {
                    instructionRows.push([new renderer_js_1.TextBindingInstruction(childNode.interpolation)]);
                }
                else if ((childNode.flags & 32 /* isLetElement */) > 0) {
                    const bindings = childNode.bindings;
                    const instructions = [];
                    let binding;
                    const jj = bindings.length;
                    for (let j = 0; j < jj; ++j) {
                        binding = bindings[j];
                        instructions[j] = new renderer_js_1.LetBindingInstruction(binding.expression, binding.target);
                    }
                    instructionRows.push([new renderer_js_1.HydrateLetElementInstruction(instructions, childNode.toBindingContext)]);
                }
                else {
                    this.compileParentNode(childNode, instructionRows, projections, targetedProjections);
                }
            }
        }
    }
    compileCustomElement(symbol, instructionRows, projections, targetedProjections) {
        var _a;
        const isAuSlot = (symbol.flags & 512 /* isAuSlot */) > 0;
        // offset 1 to leave a spot for the hydrate instruction so we don't need to create 2 arrays with a spread etc
        const instructionRow = this.compileAttributes(symbol, 1);
        const slotName = symbol.slotName;
        let slotInfo = null;
        if (isAuSlot) {
            const targetedProjection = (_a = targetedProjections === null || targetedProjections === void 0 ? void 0 : targetedProjections.projections) === null || _a === void 0 ? void 0 : _a[slotName];
            slotInfo = targetedProjection !== void 0
                ? new au_slot_js_1.SlotInfo(slotName, au_slot_js_1.AuSlotContentType.Projection, targetedProjection)
                : new au_slot_js_1.SlotInfo(slotName, au_slot_js_1.AuSlotContentType.Fallback, this.compileProjectionFallback(symbol, projections, targetedProjections));
        }
        const instruction = instructionRow[0] = new renderer_js_1.HydrateElementInstruction(symbol.res, symbol.info.alias, this.compileBindings(symbol), slotInfo);
        const compiledProjections = this.compileProjections(symbol, projections, targetedProjections);
        if (compiledProjections !== null) {
            projections.set(instruction, compiledProjections);
        }
        instructionRows.push(instructionRow);
        if (!isAuSlot) {
            this.compileChildNodes(symbol, instructionRows, projections, targetedProjections);
        }
    }
    compilePlainElement(symbol, instructionRows, projections, targetedProjections) {
        const attributes = this.compileAttributes(symbol, 0);
        if (attributes.length > 0) {
            instructionRows.push(attributes);
        }
        this.compileChildNodes(symbol, instructionRows, projections, targetedProjections);
    }
    compileParentNode(symbol, instructionRows, projections, targetedProjections) {
        switch (symbol.flags & 1023 /* type */) {
            case 16 /* isCustomElement */:
            case 512 /* isAuSlot */:
                this.compileCustomElement(symbol, instructionRows, projections, targetedProjections);
                break;
            case 64 /* isPlainElement */:
                this.compilePlainElement(symbol, instructionRows, projections, targetedProjections);
                break;
            case 1 /* isTemplateController */:
                this.compileTemplateController(symbol, instructionRows, projections, targetedProjections);
        }
    }
    compileTemplateController(symbol, instructionRows, projections, targetedProjections) {
        var _a;
        const bindings = this.compileBindings(symbol);
        const controllerInstructionRows = [];
        this.compileParentNode(symbol.template, controllerInstructionRows, projections, targetedProjections);
        const def = custom_element_js_1.CustomElementDefinition.create({
            name: (_a = symbol.info.alias) !== null && _a !== void 0 ? _a : symbol.info.name,
            template: symbol.physicalNode,
            instructions: controllerInstructionRows,
            needsCompile: false,
        });
        instructionRows.push([new renderer_js_1.HydrateTemplateController(def, symbol.res, symbol.info.alias, bindings)]);
    }
    compileBindings(symbol) {
        let bindingInstructions;
        if ((symbol.flags & 8192 /* hasBindings */) > 0) {
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
            bindingInstructions = kernel_1.emptyArray;
        }
        return bindingInstructions;
    }
    compileBinding(symbol) {
        if (symbol.command === null) {
            // either an interpolation or a normal string value assigned to an element or attribute binding
            if (symbol.expression === null) {
                // the template binder already filtered out non-bindables, so we know we need a setProperty here
                return new renderer_js_1.SetPropertyInstruction(symbol.rawValue, symbol.bindable.propName);
            }
            else {
                // either an element binding interpolation or a dynamic options attribute binding interpolation
                return new renderer_js_1.InterpolationInstruction(symbol.expression, symbol.bindable.propName);
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
        if ((symbol.flags & 4096 /* hasAttributes */) > 0) {
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
            attributeInstructions = kernel_1.emptyArray;
        }
        return attributeInstructions;
    }
    compileCustomAttribute(symbol) {
        // a normal custom attribute (not template controller)
        const bindings = this.compileBindings(symbol);
        return new renderer_js_1.HydrateAttributeInstruction(symbol.res, symbol.info.alias, bindings);
    }
    compilePlainAttribute(symbol, isOnSurrogate) {
        if (symbol.command === null) {
            const syntax = symbol.syntax;
            if (symbol.expression === null) {
                const attrRawValue = syntax.rawValue;
                if (isOnSurrogate) {
                    switch (syntax.target) {
                        case 'class':
                            return new renderer_js_1.SetClassAttributeInstruction(attrRawValue);
                        case 'style':
                            return new renderer_js_1.SetStyleAttributeInstruction(attrRawValue);
                        // todo:  define how to merge other attribute peacefully
                        //        this is an existing feature request
                    }
                }
                // a plain attribute on a surrogate
                return new renderer_js_1.SetAttributeInstruction(attrRawValue, syntax.target);
            }
            else {
                // a plain attribute with an interpolation
                return new renderer_js_1.InterpolationInstruction(symbol.expression, syntax.target);
            }
        }
        else {
            // a plain attribute with a binding command
            return symbol.command.compile(symbol);
        }
    }
    // private compileAttribute(symbol: IAttributeSymbol): AttributeInstruction {
    //   // any attribute on a custom element (which is not a bindable) or a plain element
    //   if (symbol.flags & SymbolFlags.isCustomAttribute) {
    //     return this.compileCustomAttribute(symbol as CustomAttributeSymbol);
    //   } else {
    //     return this.compilePlainAttribute(symbol as PlainAttributeSymbol);
    //   }
    // }
    compileProjections(symbol, projectionMap, targetedProjections) {
        if ((symbol.flags & 32768 /* hasProjections */) === 0) {
            return null;
        }
        const p = this.p;
        const projections = Object.create(null);
        const $projections = symbol.projections;
        const len = $projections.length;
        for (let i = 0; i < len; ++i) {
            const projection = $projections[i];
            const name = projection.name;
            const instructions = [];
            this.compileParentNode(projection.template, instructions, projectionMap, targetedProjections);
            const definition = projections[name];
            if (definition === void 0) {
                let template = projection.template.physicalNode;
                if (template.tagName !== 'TEMPLATE') {
                    const _template = p.document.createElement('template');
                    _template.content.appendChild(template);
                    template = _template;
                }
                projections[name] = custom_element_js_1.CustomElementDefinition.create({ name, template, instructions, needsCompile: false });
            }
            else {
                // consolidate the projections to same slot
                definition.template.content.appendChild(projection.template.physicalNode);
                definition.instructions.push(...instructions);
            }
        }
        return projections;
    }
    compileProjectionFallback(symbol, projections, targetedProjections) {
        const instructions = [];
        this.compileChildNodes(symbol, instructions, projections, targetedProjections);
        const template = this.p.document.createElement('template');
        template.content.append(...kernel_1.toArray(symbol.physicalNode.childNodes));
        return custom_element_js_1.CustomElementDefinition.create({ name: custom_element_js_1.CustomElement.generateName(), template, instructions, needsCompile: false });
    }
};
TemplateCompiler = __decorate([
    __param(0, template_element_factory_js_1.ITemplateElementFactory),
    __param(1, attribute_pattern_js_1.IAttributeParser),
    __param(2, runtime_1.IExpressionParser),
    __param(3, attribute_syntax_transformer_js_1.IAttrSyntaxTransformer),
    __param(4, kernel_1.ILogger),
    __param(5, platform_js_1.IPlatform)
], TemplateCompiler);
exports.TemplateCompiler = TemplateCompiler;
function processTemplateName(localTemplate, localTemplateNames) {
    const name = localTemplate.getAttribute(localTemplateIdentifier);
    if (name === null || name === '') {
        throw new Error('The value of "as-custom-element" attribute cannot be empty for local template');
    }
    if (localTemplateNames.has(name)) {
        throw new Error(`Duplicate definition of the local template named ${name}`);
    }
    else {
        localTemplateNames.add(name);
        localTemplate.removeAttribute(localTemplateIdentifier);
    }
    return name;
}
function getBindingMode(bindable) {
    switch (bindable.getAttribute("mode" /* mode */)) {
        case 'oneTime':
            return runtime_1.BindingMode.oneTime;
        case 'toView':
            return runtime_1.BindingMode.toView;
        case 'fromView':
            return runtime_1.BindingMode.fromView;
        case 'twoWay':
            return runtime_1.BindingMode.twoWay;
        case 'default':
        default:
            return runtime_1.BindingMode.default;
    }
}
function processLocalTemplates(template, definition, context, p, logger) {
    let root;
    if (template.nodeName === 'TEMPLATE') {
        if (template.hasAttribute(localTemplateIdentifier)) {
            throw new Error('The root cannot be a local template itself.');
        }
        root = template.content;
    }
    else {
        root = template;
    }
    const localTemplates = kernel_1.toArray(root.querySelectorAll('template[as-custom-element]'));
    const numLocalTemplates = localTemplates.length;
    if (numLocalTemplates === 0) {
        return;
    }
    if (numLocalTemplates === root.childElementCount) {
        throw new Error('The custom element does not have any content other than local template(s).');
    }
    const localTemplateNames = new Set();
    for (const localTemplate of localTemplates) {
        if (localTemplate.parentNode !== root) {
            throw new Error('Local templates needs to be defined directly under root.');
        }
        const name = processTemplateName(localTemplate, localTemplateNames);
        const localTemplateType = class LocalTemplate {
        };
        const content = localTemplate.content;
        const bindableEls = kernel_1.toArray(content.querySelectorAll('bindable'));
        const bindableInstructions = bindable_js_1.Bindable.for(localTemplateType);
        const properties = new Set();
        const attributes = new Set();
        for (const bindableEl of bindableEls) {
            if (bindableEl.parentNode !== content) {
                throw new Error('Bindable properties of local templates needs to be defined directly under root.');
            }
            const property = bindableEl.getAttribute("property" /* property */);
            if (property === null) {
                throw new Error(`The attribute 'property' is missing in ${bindableEl.outerHTML}`);
            }
            const attribute = bindableEl.getAttribute("attribute" /* attribute */);
            if (attribute !== null
                && attributes.has(attribute)
                || properties.has(property)) {
                throw new Error(`Bindable property and attribute needs to be unique; found property: ${property}, attribute: ${attribute}`);
            }
            else {
                if (attribute !== null) {
                    attributes.add(attribute);
                }
                properties.add(property);
            }
            bindableInstructions.add({
                property,
                attribute: attribute !== null && attribute !== void 0 ? attribute : void 0,
                mode: getBindingMode(bindableEl),
            });
            const ignoredAttributes = bindableEl.getAttributeNames().filter((attrName) => !allowedLocalTemplateBindableAttributes.includes(attrName));
            if (ignoredAttributes.length > 0) {
                logger.warn(`The attribute(s) ${ignoredAttributes.join(', ')} will be ignored for ${bindableEl.outerHTML}. Only ${allowedLocalTemplateBindableAttributes.join(', ')} are processed.`);
            }
            content.removeChild(bindableEl);
        }
        const localTemplateDefinition = custom_element_js_1.CustomElement.define({ name, template: localTemplate }, localTemplateType);
        // the casting is needed here as the dependencies are typed as readonly array
        definition.dependencies.push(localTemplateDefinition);
        context.register(localTemplateDefinition);
        root.removeChild(localTemplate);
    }
}
//# sourceMappingURL=template-compiler.js.map