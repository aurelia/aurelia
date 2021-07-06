"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.templateCompilerHooks = exports.TemplateCompilerHooks = exports.ITemplateCompilerHooks = exports.BindablesInfo = exports.TemplateCompiler = void 0;
const kernel_1 = require("@aurelia/kernel");
const runtime_1 = require("@aurelia/runtime");
const attribute_mapper_js_1 = require("./attribute-mapper.js");
const template_element_factory_js_1 = require("./template-element-factory.js");
const renderer_js_1 = require("./renderer.js");
const platform_js_1 = require("./platform.js");
const bindable_js_1 = require("./bindable.js");
const attribute_pattern_js_1 = require("./resources/attribute-pattern.js");
const custom_attribute_js_1 = require("./resources/custom-attribute.js");
const custom_element_js_1 = require("./resources/custom-element.js");
const binding_command_js_1 = require("./resources/binding-command.js");
const utilities_html_js_1 = require("./utilities-html.js");
const utilities_di_js_1 = require("./utilities-di.js");
class TemplateCompiler {
    constructor() {
        this.debug = false;
    }
    static register(container) {
        return kernel_1.Registration.singleton(renderer_js_1.ITemplateCompiler, this).register(container);
    }
    compile(partialDefinition, container, compilationInstruction) {
        var _a, _b, _c, _d;
        const definition = custom_element_js_1.CustomElementDefinition.getOrCreate(partialDefinition);
        if (definition.template === null || definition.template === void 0) {
            return definition;
        }
        if (definition.needsCompile === false) {
            return definition;
        }
        compilationInstruction !== null && compilationInstruction !== void 0 ? compilationInstruction : (compilationInstruction = emptyCompilationInstructions);
        const context = new CompilationContext(partialDefinition, container, compilationInstruction, null, null, void 0);
        const template = typeof definition.template === 'string' || !partialDefinition.enhance
            ? context.templateFactory.createTemplate(definition.template)
            : definition.template;
        const isTemplateElement = template.nodeName === 'TEMPLATE' && template.content != null;
        const content = isTemplateElement ? template.content : template;
        const hooks = container.get(utilities_di_js_1.allResources(exports.ITemplateCompilerHooks));
        const ii = hooks.length;
        let i = 0;
        if (ii > 0) {
            while (ii > i) {
                (_b = (_a = hooks[i]).beforeCompile) === null || _b === void 0 ? void 0 : _b.call(_a, template);
                ++i;
            }
        }
        if (template.hasAttribute(localTemplateIdentifier)) {
            throw new Error('The root cannot be a local template itself.');
        }
        this.local(content, context);
        this.node(content, context);
        return custom_element_js_1.CustomElementDefinition.create({
            ...partialDefinition,
            name: partialDefinition.name || custom_element_js_1.CustomElement.generateName(),
            dependencies: ((_c = partialDefinition.dependencies) !== null && _c !== void 0 ? _c : kernel_1.emptyArray).concat((_d = context.deps) !== null && _d !== void 0 ? _d : kernel_1.emptyArray),
            instructions: context.rows,
            surrogates: isTemplateElement
                ? this.surrogate(template, context)
                : kernel_1.emptyArray,
            template,
            hasSlots: context.hasSlot,
            needsCompile: false,
        });
    }
    /** @internal */
    surrogate(el, context) {
        var _a;
        const instructions = [];
        const attrs = el.attributes;
        const exprParser = context.exprParser;
        let ii = attrs.length;
        let i = 0;
        let attr;
        let attrName;
        let attrValue;
        let attrSyntax;
        let attrDef = null;
        let attrInstructions;
        let attrBindableInstructions;
        // eslint-disable-next-line
        let bindableInfo;
        let primaryBindable;
        let bindingCommand = null;
        let expr;
        let isMultiBindings;
        let realAttrTarget;
        let realAttrValue;
        for (; ii > i; ++i) {
            attr = attrs[i];
            attrName = attr.name;
            attrValue = attr.value;
            attrSyntax = context.attrParser.parse(attrName, attrValue);
            realAttrTarget = attrSyntax.target;
            realAttrValue = attrSyntax.rawValue;
            if (invalidSurrogateAttribute[realAttrTarget]) {
                throw new Error(`Attribute ${attrName} is invalid on surrogate.`);
            }
            bindingCommand = context.command(attrSyntax);
            if (bindingCommand !== null && bindingCommand.bindingType & 4096 /* IgnoreAttr */) {
                // when the binding command overrides everything
                // just pass the target as is to the binding command, and treat it as a normal attribute:
                // active.class="..."
                // background.style="..."
                // my-attr.attr="..."
                expr = exprParser.parse(realAttrValue, bindingCommand.bindingType);
                commandBuildInfo.node = el;
                commandBuildInfo.attr = attrSyntax;
                commandBuildInfo.expr = expr;
                commandBuildInfo.bindable = null;
                commandBuildInfo.def = null;
                instructions.push(bindingCommand.build(commandBuildInfo));
                // to next attribute
                continue;
            }
            attrDef = context.attr(realAttrTarget);
            if (attrDef !== null) {
                if (attrDef.isTemplateController) {
                    throw new Error(`Template controller ${realAttrTarget} is invalid on surrogate.`);
                }
                bindableInfo = BindablesInfo.from(attrDef, true);
                // Custom attributes are always in multiple binding mode,
                // except when they can't be
                // When they cannot be:
                //        * has explicit configuration noMultiBindings: false
                //        * has binding command, ie: <div my-attr.bind="...">.
                //          In this scenario, the value of the custom attributes is required to be a valid expression
                //        * has no colon: ie: <div my-attr="abcd">
                //          In this scenario, it's simply invalid syntax.
                //          Consider style attribute rule-value pair: <div style="rule: ruleValue">
                isMultiBindings = attrDef.noMultiBindings === false
                    && bindingCommand === null
                    && hasInlineBindings(realAttrValue);
                if (isMultiBindings) {
                    attrBindableInstructions = this.multiBindings(el, realAttrValue, attrDef, context);
                }
                else {
                    primaryBindable = bindableInfo.primary;
                    // custom attribute + single value + WITHOUT binding command:
                    // my-attr=""
                    // my-attr="${}"
                    if (bindingCommand === null) {
                        expr = exprParser.parse(realAttrValue, 2048 /* Interpolation */);
                        attrBindableInstructions = [
                            expr === null
                                ? new renderer_js_1.SetPropertyInstruction(realAttrValue, primaryBindable.property)
                                : new renderer_js_1.InterpolationInstruction(expr, primaryBindable.property)
                        ];
                    }
                    else {
                        // custom attribute with binding command:
                        // my-attr.bind="..."
                        // my-attr.two-way="..."
                        expr = exprParser.parse(realAttrValue, bindingCommand.bindingType);
                        commandBuildInfo.node = el;
                        commandBuildInfo.attr = attrSyntax;
                        commandBuildInfo.expr = expr;
                        commandBuildInfo.bindable = primaryBindable;
                        commandBuildInfo.def = attrDef;
                        attrBindableInstructions = [bindingCommand.build(commandBuildInfo)];
                    }
                }
                el.removeAttribute(attrName);
                --i;
                --ii;
                (attrInstructions !== null && attrInstructions !== void 0 ? attrInstructions : (attrInstructions = [])).push(new renderer_js_1.HydrateAttributeInstruction(attrDef.name, attrDef.aliases != null && attrDef.aliases.includes(realAttrTarget) ? realAttrTarget : void 0, attrBindableInstructions));
                continue;
            }
            if (bindingCommand === null) {
                expr = exprParser.parse(realAttrValue, 2048 /* Interpolation */);
                if (expr != null) {
                    el.removeAttribute(attrName);
                    --i;
                    --ii;
                    instructions.push(new renderer_js_1.InterpolationInstruction(expr, (_a = 
                    // if not a bindable, then ensure plain attribute are mapped correctly:
                    // e.g: colspan -> colSpan
                    //      innerhtml -> innerHTML
                    //      minlength -> minLength etc...
                    context.attrMapper.map(el, realAttrTarget)) !== null && _a !== void 0 ? _a : kernel_1.camelCase(realAttrTarget)));
                }
                else {
                    switch (attrName) {
                        case 'class':
                            instructions.push(new renderer_js_1.SetClassAttributeInstruction(realAttrValue));
                            break;
                        case 'style':
                            instructions.push(new renderer_js_1.SetStyleAttributeInstruction(realAttrValue));
                            break;
                        default:
                            // if not a custom attribute + no binding command + not a bindable + not an interpolation
                            // then it's just a plain attribute
                            instructions.push(new renderer_js_1.SetAttributeInstruction(realAttrValue, attrName));
                    }
                }
            }
            else {
                expr = exprParser.parse(realAttrValue, bindingCommand.bindingType);
                commandBuildInfo.node = el;
                commandBuildInfo.attr = attrSyntax;
                commandBuildInfo.expr = expr;
                commandBuildInfo.bindable = null;
                commandBuildInfo.def = null;
                instructions.push(bindingCommand.build(commandBuildInfo));
            }
        }
        resetCommandBuildInfo();
        if (attrInstructions != null) {
            return attrInstructions.concat(instructions);
        }
        return instructions;
    }
    // overall flow:
    // each of the method will be responsible for compiling its corresponding node type
    // and it should return the next node to be compiled
    /** @internal */
    node(node, context) {
        switch (node.nodeType) {
            case 1:
                switch (node.nodeName) {
                    case 'LET':
                        return this.declare(node, context);
                    // ------------------------------------
                    // todo: possible optimization:
                    // when two conditions below are met:
                    // 1. there's no attribute on au slot,
                    // 2. there's no projection
                    //
                    // -> flatten the au-slot into children as this is just a static template
                    // ------------------------------------
                    // case 'AU-SLOT':
                    //   return this.auSlot(node as Element, container, context);
                    default:
                        return this.element(node, context);
                }
            case 3:
                return this.text(node, context);
            case 11: {
                let current = node.firstChild;
                while (current !== null) {
                    current = this.node(current, context);
                }
                break;
            }
        }
        return node.nextSibling;
    }
    /** @internal */
    declare(el, context) {
        const attrs = el.attributes;
        const ii = attrs.length;
        const letInstructions = [];
        const exprParser = context.exprParser;
        let toBindingContext = false;
        let i = 0;
        let attr;
        let attrSyntax;
        let attrName;
        let attrValue;
        let bindingCommand;
        let realAttrTarget;
        let realAttrValue;
        let expr;
        for (; ii > i; ++i) {
            attr = attrs[i];
            attrName = attr.name;
            attrValue = attr.value;
            if (attrName === 'to-binding-context') {
                toBindingContext = true;
                continue;
            }
            attrSyntax = context.attrParser.parse(attrName, attrValue);
            realAttrTarget = attrSyntax.target;
            realAttrValue = attrSyntax.rawValue;
            bindingCommand = context.command(attrSyntax);
            if (bindingCommand !== null) {
                // supporting one time may not be as simple as it appears
                // as the let expression could compute its value from various expressions,
                // which means some value could be unavailable by the time it computes.
                //
                // Onetime means it will not have appropriate value, but it's also a good thing,
                // since often one it's just a simple declaration
                // todo: consider supporting one-time for <let>
                if (bindingCommand.bindingType === 50 /* ToViewCommand */
                    || bindingCommand.bindingType === 53 /* BindCommand */) {
                    letInstructions.push(new renderer_js_1.LetBindingInstruction(exprParser.parse(realAttrValue, bindingCommand.bindingType), kernel_1.camelCase(realAttrTarget)));
                    continue;
                }
                throw new Error(`Invalid command ${attrSyntax.command} for <let>. Only to-view/bind supported.`);
            }
            expr = exprParser.parse(realAttrValue, 2048 /* Interpolation */);
            if (expr === null) {
                context.logger.warn(`Property ${realAttrTarget} is declared with literal string ${realAttrValue}. ` +
                    `Did you mean ${realAttrTarget}.bind="${realAttrValue}"?`);
            }
            letInstructions.push(new renderer_js_1.LetBindingInstruction(expr === null ? new runtime_1.PrimitiveLiteralExpression(realAttrValue) : expr, kernel_1.camelCase(realAttrTarget)));
        }
        context.rows.push([new renderer_js_1.HydrateLetElementInstruction(letInstructions, toBindingContext)]);
        // probably no need to replace
        // as the let itself can be used as is
        // though still need to mark el as target to ensure the instruction is matched with a target
        return this.mark(el).nextSibling;
    }
    /** @internal */
    // eslint-disable-next-line
    element(el, context) {
        var _a, _b, _c, _d, _e;
        var _f, _g;
        // instructions sort:
        // 1. hydrate custom element instruction
        // 2. hydrate custom attribute instructions
        // 3. rest kept as is (except special cases & to-be-decided)
        const nextSibling = el.nextSibling;
        const elName = ((_a = el.getAttribute('as-element')) !== null && _a !== void 0 ? _a : el.nodeName).toLowerCase();
        const elDef = context.el(elName);
        const exprParser = context.exprParser;
        const removeAttr = this.debug
            ? kernel_1.noop
            : () => {
                el.removeAttribute(attrName);
                --i;
                --ii;
            };
        let attrs = el.attributes;
        let instructions;
        let ii = attrs.length;
        let i = 0;
        let attr;
        let attrName;
        let attrValue;
        let attrSyntax;
        let plainAttrInstructions;
        let elBindableInstructions;
        let attrDef = null;
        let isMultiBindings = false;
        let bindable;
        let attrInstructions;
        let attrBindableInstructions;
        let tcInstructions;
        let tcInstruction;
        let expr;
        let elementInstruction;
        let bindingCommand = null;
        // eslint-disable-next-line
        let bindablesInfo;
        let primaryBindable;
        let realAttrTarget;
        let realAttrValue;
        let processContentResult = true;
        let hasContainerless = false;
        if (elName === 'slot') {
            context.root.hasSlot = true;
        }
        if (elDef !== null) {
            // todo: this is a bit ... powerful
            // maybe do not allow it to process its own attributes
            processContentResult = (_b = elDef.processContent) === null || _b === void 0 ? void 0 : _b.call(elDef.Type, el, context.p);
            // might have changed during the process
            attrs = el.attributes;
            ii = attrs.length;
        }
        for (; ii > i; ++i) {
            attr = attrs[i];
            attrName = attr.name;
            attrValue = attr.value;
            switch (attrName) {
                case 'as-element':
                case 'containerless':
                    removeAttr();
                    if (!hasContainerless) {
                        hasContainerless = attrName === 'containerless';
                    }
                    continue;
            }
            attrSyntax = context.attrParser.parse(attrName, attrValue);
            bindingCommand = context.command(attrSyntax);
            if (bindingCommand !== null && bindingCommand.bindingType & 4096 /* IgnoreAttr */) {
                // when the binding command overrides everything
                // just pass the target as is to the binding command, and treat it as a normal attribute:
                // active.class="..."
                // background.style="..."
                // my-attr.attr="..."
                expr = exprParser.parse(attrValue, bindingCommand.bindingType);
                commandBuildInfo.node = el;
                commandBuildInfo.attr = attrSyntax;
                commandBuildInfo.expr = expr;
                commandBuildInfo.bindable = null;
                commandBuildInfo.def = null;
                (plainAttrInstructions !== null && plainAttrInstructions !== void 0 ? plainAttrInstructions : (plainAttrInstructions = [])).push(bindingCommand.build(commandBuildInfo));
                removeAttr();
                // to next attribute
                continue;
            }
            realAttrTarget = attrSyntax.target;
            realAttrValue = attrSyntax.rawValue;
            // if not a ignore attribute binding command
            // then process with the next possibilities
            attrDef = context.attr(realAttrTarget);
            // when encountering an attribute,
            // custom attribute takes precedence over custom element bindables
            if (attrDef !== null) {
                bindablesInfo = BindablesInfo.from(attrDef, true);
                // Custom attributes are always in multiple binding mode,
                // except when they can't be
                // When they cannot be:
                //        * has explicit configuration noMultiBindings: false
                //        * has binding command, ie: <div my-attr.bind="...">.
                //          In this scenario, the value of the custom attributes is required to be a valid expression
                //        * has no colon: ie: <div my-attr="abcd">
                //          In this scenario, it's simply invalid syntax.
                //          Consider style attribute rule-value pair: <div style="rule: ruleValue">
                isMultiBindings = attrDef.noMultiBindings === false
                    && bindingCommand === null
                    && hasInlineBindings(attrValue);
                if (isMultiBindings) {
                    attrBindableInstructions = this.multiBindings(el, attrValue, attrDef, context);
                }
                else {
                    primaryBindable = bindablesInfo.primary;
                    // custom attribute + single value + WITHOUT binding command:
                    // my-attr=""
                    // my-attr="${}"
                    if (bindingCommand === null) {
                        expr = exprParser.parse(attrValue, 2048 /* Interpolation */);
                        attrBindableInstructions = [
                            expr === null
                                ? new renderer_js_1.SetPropertyInstruction(attrValue, primaryBindable.property)
                                : new renderer_js_1.InterpolationInstruction(expr, primaryBindable.property)
                        ];
                    }
                    else {
                        // custom attribute with binding command:
                        // my-attr.bind="..."
                        // my-attr.two-way="..."
                        expr = exprParser.parse(attrValue, bindingCommand.bindingType);
                        commandBuildInfo.node = el;
                        commandBuildInfo.attr = attrSyntax;
                        commandBuildInfo.expr = expr;
                        commandBuildInfo.bindable = primaryBindable;
                        commandBuildInfo.def = attrDef;
                        attrBindableInstructions = [bindingCommand.build(commandBuildInfo)];
                    }
                }
                removeAttr();
                if (attrDef.isTemplateController) {
                    (tcInstructions !== null && tcInstructions !== void 0 ? tcInstructions : (tcInstructions = [])).push(new renderer_js_1.HydrateTemplateController(voidDefinition, attrDef.name, void 0, attrBindableInstructions));
                }
                else {
                    (attrInstructions !== null && attrInstructions !== void 0 ? attrInstructions : (attrInstructions = [])).push(new renderer_js_1.HydrateAttributeInstruction(attrDef.name, attrDef.aliases != null && attrDef.aliases.includes(realAttrTarget) ? realAttrTarget : void 0, attrBindableInstructions));
                }
                continue;
            }
            if (bindingCommand === null) {
                // reaching here means:
                // + maybe a bindable attribute with interpolation
                // + maybe a plain attribute with interpolation
                // + maybe a plain attribute
                if (elDef !== null) {
                    bindablesInfo = BindablesInfo.from(elDef, false);
                    bindable = bindablesInfo.attrs[realAttrTarget];
                    if (bindable !== void 0) {
                        expr = exprParser.parse(realAttrValue, 2048 /* Interpolation */);
                        (elBindableInstructions !== null && elBindableInstructions !== void 0 ? elBindableInstructions : (elBindableInstructions = [])).push(expr == null
                            ? new renderer_js_1.SetPropertyInstruction(realAttrValue, bindable.property)
                            : new renderer_js_1.InterpolationInstruction(expr, bindable.property));
                        removeAttr();
                        continue;
                    }
                }
                // reaching here means:
                // + maybe a plain attribute with interpolation
                // + maybe a plain attribute
                expr = exprParser.parse(realAttrValue, 2048 /* Interpolation */);
                if (expr != null) {
                    // if it's an interpolation, remove the attribute
                    removeAttr();
                    (plainAttrInstructions !== null && plainAttrInstructions !== void 0 ? plainAttrInstructions : (plainAttrInstructions = [])).push(new renderer_js_1.InterpolationInstruction(expr, (_c = 
                    // if not a bindable, then ensure plain attribute are mapped correctly:
                    // e.g: colspan -> colSpan
                    //      innerhtml -> innerHTML
                    //      minlength -> minLength etc...
                    context.attrMapper.map(el, realAttrTarget)) !== null && _c !== void 0 ? _c : kernel_1.camelCase(realAttrTarget)));
                }
                // if not a custom attribute + no binding command + not a bindable + not an interpolation
                // then it's just a plain attribute, do nothing
                continue;
            }
            // reaching here means:
            // + has binding command
            // + not an overriding binding command
            // + not a custom attribute
            removeAttr();
            if (elDef !== null) {
                // if the element is a custom element
                // - prioritize bindables on a custom element before plain attributes
                bindablesInfo = BindablesInfo.from(elDef, false);
                bindable = bindablesInfo.attrs[realAttrTarget];
                if (bindable !== void 0) {
                    // if it looks like: <my-el value.bind>
                    // it means        : <my-el value.bind="value">
                    // this is a shortcut
                    // and reuse attrValue variable
                    attrValue = attrValue.length === 0
                        && (bindingCommand.bindingType & (53 /* BindCommand */
                            | 49 /* OneTimeCommand */
                            | 50 /* ToViewCommand */
                            | 52 /* TwoWayCommand */)) > 0
                        ? kernel_1.camelCase(attrName)
                        : attrValue;
                    expr = exprParser.parse(attrValue, bindingCommand.bindingType);
                    commandBuildInfo.node = el;
                    commandBuildInfo.attr = attrSyntax;
                    commandBuildInfo.expr = expr;
                    commandBuildInfo.bindable = bindable;
                    commandBuildInfo.def = elDef;
                    (elBindableInstructions !== null && elBindableInstructions !== void 0 ? elBindableInstructions : (elBindableInstructions = [])).push(bindingCommand.build(commandBuildInfo));
                    continue;
                }
            }
            // reaching here means:
            // + a plain attribute
            // + has binding command
            expr = exprParser.parse(realAttrValue, bindingCommand.bindingType);
            commandBuildInfo.node = el;
            commandBuildInfo.attr = attrSyntax;
            commandBuildInfo.expr = expr;
            commandBuildInfo.bindable = null;
            commandBuildInfo.def = null;
            (plainAttrInstructions !== null && plainAttrInstructions !== void 0 ? plainAttrInstructions : (plainAttrInstructions = [])).push(bindingCommand.build(commandBuildInfo));
        }
        resetCommandBuildInfo();
        if (this.shouldReorderAttrs(el) && plainAttrInstructions != null && plainAttrInstructions.length > 1) {
            this.reorder(el, plainAttrInstructions);
        }
        if (elDef !== null) {
            elementInstruction = new renderer_js_1.HydrateElementInstruction(elDef.name, void 0, (elBindableInstructions !== null && elBindableInstructions !== void 0 ? elBindableInstructions : kernel_1.emptyArray), null, hasContainerless);
            if (elName === 'au-slot') {
                const slotName = el.getAttribute('name') || /* name="" is the same with no name */ 'default';
                const template = context.h('template');
                const fallbackContentContext = context.child();
                let node = el.firstChild;
                while (node !== null) {
                    // a special case:
                    // <au-slot> doesn't have its own template
                    // so anything attempting to project into it is discarded
                    // doing so during compilation via removing the node,
                    // instead of considering it as part of the fallback view
                    if (node.nodeType === 1 && node.hasAttribute('au-slot')) {
                        el.removeChild(node);
                    }
                    else {
                        template.content.appendChild(node);
                    }
                    node = el.firstChild;
                }
                this.node(template.content, fallbackContentContext);
                elementInstruction.auSlot = {
                    name: slotName,
                    fallback: custom_element_js_1.CustomElementDefinition.create({
                        name: custom_element_js_1.CustomElement.generateName(),
                        template,
                        instructions: fallbackContentContext.rows,
                        needsCompile: false,
                    }),
                };
                // todo: shouldn't have to eagerly replace everything like this
                // this is a leftover refactoring work from the old binder
                el = this.marker(el, context);
            }
        }
        if (plainAttrInstructions != null
            || elementInstruction != null
            || attrInstructions != null) {
            instructions = kernel_1.emptyArray.concat(elementInstruction !== null && elementInstruction !== void 0 ? elementInstruction : kernel_1.emptyArray, attrInstructions !== null && attrInstructions !== void 0 ? attrInstructions : kernel_1.emptyArray, plainAttrInstructions !== null && plainAttrInstructions !== void 0 ? plainAttrInstructions : kernel_1.emptyArray);
            this.mark(el);
        }
        let shouldCompileContent;
        if (tcInstructions != null) {
            ii = tcInstructions.length - 1;
            i = ii;
            tcInstruction = tcInstructions[i];
            let template;
            // assumption: el.parentNode is not null
            // but not always the case: e.g compile/enhance an element without parent with TC on it
            this.marker(el, context);
            if (el.nodeName === 'TEMPLATE') {
                template = el;
            }
            else {
                template = context.h('template');
                template.content.appendChild(el);
            }
            const mostInnerTemplate = template;
            const childContext = context.child(instructions == null ? [] : [instructions]);
            shouldCompileContent = elDef === null || !elDef.containerless && !hasContainerless && processContentResult !== false;
            // todo: shouldn't have to eagerly replace with a marker like this
            //       this should be the job of the renderer
            if (elDef !== null && elDef.containerless) {
                this.marker(el, context);
            }
            let child;
            let childEl;
            let targetSlot;
            let projections;
            let slotTemplateRecord;
            let slotTemplates;
            let slotTemplate;
            let marker;
            let projectionCompilationContext;
            let j = 0, jj = 0;
            if (shouldCompileContent) {
                if (elDef !== null) {
                    // for each child element of a custom element
                    // scan for [au-slot], if there's one
                    // then extract the element into a projection definition
                    // this allows support for [au-slot] declared on the same element with anther template controller
                    // e.g:
                    //
                    // can do:
                    //  <my-el>
                    //    <div au-slot if.bind="..."></div>
                    //    <div if.bind="..." au-slot></div>
                    //  </my-el>
                    //
                    // instead of:
                    //  <my-el>
                    //    <template au-slot><div if.bind="..."></div>
                    //  </my-el>
                    child = el.firstChild;
                    while (child !== null) {
                        if (child.nodeType === 1) {
                            // if has [au-slot] then it's a projection
                            childEl = child;
                            child = child.nextSibling;
                            targetSlot = childEl.getAttribute('au-slot');
                            if (targetSlot !== null) {
                                if (targetSlot === '') {
                                    targetSlot = 'default';
                                }
                                childEl.removeAttribute('au-slot');
                                el.removeChild(childEl);
                                ((_d = (_f = (slotTemplateRecord !== null && slotTemplateRecord !== void 0 ? slotTemplateRecord : (slotTemplateRecord = {})))[targetSlot]) !== null && _d !== void 0 ? _d : (_f[targetSlot] = [])).push(childEl);
                            }
                            // if not a targeted slot then use the common node method
                            // todo: in the future, there maybe more special case for a content of a custom element
                            //       it can be all done here
                        }
                        else {
                            child = child.nextSibling;
                        }
                    }
                    if (slotTemplateRecord != null) {
                        projections = {};
                        // aggregate all content targeting the same slot
                        // into a single template
                        // with some special rule around <template> element
                        for (targetSlot in slotTemplateRecord) {
                            template = context.h('template');
                            slotTemplates = slotTemplateRecord[targetSlot];
                            for (j = 0, jj = slotTemplates.length; jj > j; ++j) {
                                slotTemplate = slotTemplates[j];
                                if (slotTemplate.nodeName === 'TEMPLATE') {
                                    // this means user has some thing more than [au-slot] on a template
                                    // consider this intentional, and use it as is
                                    // e.g:
                                    // <my-element>
                                    //   <template au-slot repeat.for="i of items">
                                    // ----vs----
                                    // <my-element>
                                    //   <template au-slot>this is just some static stuff <b>And a b</b></template>
                                    if (slotTemplate.attributes.length > 0) {
                                        template.content.appendChild(slotTemplate);
                                    }
                                    else {
                                        template.content.appendChild(slotTemplate.content);
                                    }
                                }
                                else {
                                    template.content.appendChild(slotTemplate);
                                }
                            }
                            // after aggregating all the [au-slot] templates into a single one
                            // compile it
                            // technically, the most inner template controller compilation context
                            // is the parent of this compilation context
                            // but for simplicity in compilation, maybe start with a flatter hierarchy
                            // also, it wouldn't have any real uses
                            projectionCompilationContext = context.child();
                            this.node(template.content, projectionCompilationContext);
                            projections[targetSlot] = custom_element_js_1.CustomElementDefinition.create({
                                name: custom_element_js_1.CustomElement.generateName(),
                                template,
                                instructions: projectionCompilationContext.rows,
                                needsCompile: false,
                            });
                        }
                        elementInstruction.projections = projections;
                    }
                }
                // important:
                // ======================
                // only goes inside a template, if there is a template controller on it
                // otherwise, leave it alone
                if (el.nodeName === 'TEMPLATE') {
                    this.node(el.content, childContext);
                }
                else {
                    child = el.firstChild;
                    while (child !== null) {
                        child = this.node(child, childContext);
                    }
                }
            }
            tcInstruction.def = custom_element_js_1.CustomElementDefinition.create({
                name: custom_element_js_1.CustomElement.generateName(),
                template: mostInnerTemplate,
                instructions: childContext.rows,
                needsCompile: false,
            });
            while (i-- > 0) {
                // for each of the template controller from [right] to [left]
                // do create:
                // (1) a template
                // (2) add a marker to the template
                // (3) an instruction
                // instruction will be corresponded to the marker
                // =========================
                tcInstruction = tcInstructions[i];
                template = context.h('template');
                // appending most inner template is inaccurate, as the most outer one
                // is not really the parent of the most inner one
                // but it's only for the purpose of creating a marker,
                // so it's just an optimization hack
                marker = context.h('au-m');
                marker.classList.add('au');
                template.content.appendChild(marker);
                if (tcInstruction.def !== voidDefinition) {
                    throw new Error(`Invalid definition for processing ${tcInstruction.res}.`);
                }
                tcInstruction.def = custom_element_js_1.CustomElementDefinition.create({
                    name: custom_element_js_1.CustomElement.generateName(),
                    template,
                    needsCompile: false,
                    instructions: [[tcInstructions[i + 1]]]
                });
            }
            // the most outer template controller should be
            // the only instruction for peek instruction of the current context
            // e.g
            // <div if.bind="yes" with.bind="scope" repeat.for="i of items" data-id="i.id">
            // results in:
            // -----------
            //
            //  TC(if-[value=yes])
            //    | TC(with-[value=scope])
            //        | TC(repeat-[...])
            //            | div(data-id-[value=i.id])
            context.rows.push([tcInstruction]);
        }
        else {
            // if there's no template controller
            // then the instruction built is appropriate to be assigned as the peek row
            // and before the children compilation
            if (instructions != null) {
                context.rows.push(instructions);
            }
            shouldCompileContent = elDef === null || !elDef.containerless && !hasContainerless && processContentResult !== false;
            // todo: shouldn't have to eagerly replace with a marker like this
            //       this should be the job of the renderer
            if (elDef !== null && elDef.containerless) {
                this.marker(el, context);
            }
            if (shouldCompileContent && el.childNodes.length > 0) {
                let child = el.firstChild;
                let childEl;
                let targetSlot;
                let projections = null;
                let slotTemplateRecord;
                let slotTemplates;
                let slotTemplate;
                let template;
                let projectionCompilationContext;
                let j = 0, jj = 0;
                // for each child element of a custom element
                // scan for [au-slot], if there's one
                // then extract the element into a projection definition
                // this allows support for [au-slot] declared on the same element with anther template controller
                // e.g:
                //
                // can do:
                //  <my-el>
                //    <div au-slot if.bind="..."></div>
                //    <div if.bind="..." au-slot></div>
                //  </my-el>
                //
                // instead of:
                //  <my-el>
                //    <template au-slot><div if.bind="..."></div>
                //  </my-el>
                while (child !== null) {
                    if (child.nodeType === 1) {
                        // if has [au-slot] then it's a projection
                        childEl = child;
                        child = child.nextSibling;
                        targetSlot = childEl.getAttribute('au-slot');
                        if (targetSlot !== null) {
                            if (elDef === null) {
                                throw new Error(`Projection with [au-slot="${targetSlot}"] is attempted on a non custom element ${el.nodeName}.`);
                            }
                            if (targetSlot === '') {
                                targetSlot = 'default';
                            }
                            el.removeChild(childEl);
                            childEl.removeAttribute('au-slot');
                            ((_e = (_g = (slotTemplateRecord !== null && slotTemplateRecord !== void 0 ? slotTemplateRecord : (slotTemplateRecord = {})))[targetSlot]) !== null && _e !== void 0 ? _e : (_g[targetSlot] = [])).push(childEl);
                        }
                        // if not a targeted slot then use the common node method
                        // todo: in the future, there maybe more special case for a content of a custom element
                        //       it can be all done here
                    }
                    else {
                        child = child.nextSibling;
                    }
                }
                if (slotTemplateRecord != null) {
                    projections = {};
                    // aggregate all content targeting the same slot
                    // into a single template
                    // with some special rule around <template> element
                    for (targetSlot in slotTemplateRecord) {
                        template = context.h('template');
                        slotTemplates = slotTemplateRecord[targetSlot];
                        for (j = 0, jj = slotTemplates.length; jj > j; ++j) {
                            slotTemplate = slotTemplates[j];
                            if (slotTemplate.nodeName === 'TEMPLATE') {
                                // this means user has some thing more than [au-slot] on a template
                                // consider this intentional, and use it as is
                                // e.g:
                                // <my-element>
                                //   <template au-slot repeat.for="i of items">
                                // ----vs----
                                // <my-element>
                                //   <template au-slot>this is just some static stuff <b>And a b</b></template>
                                if (slotTemplate.attributes.length > 0) {
                                    template.content.appendChild(slotTemplate);
                                }
                                else {
                                    template.content.appendChild(slotTemplate.content);
                                }
                            }
                            else {
                                template.content.appendChild(slotTemplate);
                            }
                        }
                        // after aggregating all the [au-slot] templates into a single one
                        // compile it
                        projectionCompilationContext = context.child();
                        this.node(template.content, projectionCompilationContext);
                        projections[targetSlot] = custom_element_js_1.CustomElementDefinition.create({
                            name: custom_element_js_1.CustomElement.generateName(),
                            template,
                            instructions: projectionCompilationContext.rows,
                            needsCompile: false,
                        });
                    }
                    elementInstruction.projections = projections;
                }
                child = el.firstChild;
                while (child !== null) {
                    child = this.node(child, context);
                }
            }
        }
        return nextSibling;
    }
    /** @internal */
    text(node, context) {
        let text = '';
        let current = node;
        while (current !== null && current.nodeType === 3) {
            text += current.textContent;
            current = current.nextSibling;
        }
        const expr = context.exprParser.parse(text, 2048 /* Interpolation */);
        if (expr === null) {
            return current;
        }
        const parent = node.parentNode;
        // prepare a marker
        parent.insertBefore(this.mark(context.h('au-m')), node);
        // and the corresponding instruction
        context.rows.push([new renderer_js_1.TextBindingInstruction(expr, !!context.def.isStrictBinding)]);
        // and cleanup all the DOM for rendering text binding
        node.textContent = '';
        current = node.nextSibling;
        while (current !== null && current.nodeType === 3) {
            parent.removeChild(current);
            current = node.nextSibling;
        }
        return node.nextSibling;
    }
    /** @internal */
    multiBindings(node, attrRawValue, attrDef, context) {
        // custom attribute + multiple values:
        // my-attr="prop1: literal1 prop2.bind: ...; prop3: literal3"
        // my-attr="prop1.bind: ...; prop2.bind: ..."
        // my-attr="prop1: ${}; prop2.bind: ...; prop3: ${}"
        const bindableAttrsInfo = BindablesInfo.from(attrDef, true);
        const valueLength = attrRawValue.length;
        const instructions = [];
        let attrName = void 0;
        let attrValue = void 0;
        let start = 0;
        let ch = 0;
        let expr;
        let attrSyntax;
        let command;
        let bindable;
        for (let i = 0; i < valueLength; ++i) {
            ch = attrRawValue.charCodeAt(i);
            if (ch === 92 /* Backslash */) {
                ++i;
                // Ignore whatever comes next because it's escaped
            }
            else if (ch === 58 /* Colon */) {
                attrName = attrRawValue.slice(start, i);
                // Skip whitespace after colon
                while (attrRawValue.charCodeAt(++i) <= 32 /* Space */)
                    ;
                start = i;
                for (; i < valueLength; ++i) {
                    ch = attrRawValue.charCodeAt(i);
                    if (ch === 92 /* Backslash */) {
                        ++i;
                        // Ignore whatever comes next because it's escaped
                    }
                    else if (ch === 59 /* Semicolon */) {
                        attrValue = attrRawValue.slice(start, i);
                        break;
                    }
                }
                if (attrValue === void 0) {
                    // No semicolon found, so just grab the rest of the value
                    attrValue = attrRawValue.slice(start);
                }
                attrSyntax = context.attrParser.parse(attrName, attrValue);
                // ================================================
                // todo: should it always camel case???
                // const attrTarget = camelCase(attrSyntax.target);
                // ================================================
                command = context.command(attrSyntax);
                bindable = bindableAttrsInfo.attrs[attrSyntax.target];
                if (bindable == null) {
                    throw new Error(`Bindable ${attrSyntax.target} not found on ${attrDef.name}.`);
                }
                if (command === null) {
                    expr = context.exprParser.parse(attrValue, 2048 /* Interpolation */);
                    instructions.push(expr === null
                        ? new renderer_js_1.SetPropertyInstruction(attrValue, bindable.property)
                        : new renderer_js_1.InterpolationInstruction(expr, bindable.property));
                }
                else {
                    expr = context.exprParser.parse(attrValue, command.bindingType);
                    commandBuildInfo.node = node;
                    commandBuildInfo.attr = attrSyntax;
                    commandBuildInfo.expr = expr;
                    commandBuildInfo.bindable = bindable;
                    commandBuildInfo.def = attrDef;
                    // instructions.push(command.compile(new BindingSymbol(command, bindable, expr, attrValue, attrName)));
                    instructions.push(command.build(commandBuildInfo));
                }
                // Skip whitespace after semicolon
                while (i < valueLength && attrRawValue.charCodeAt(++i) <= 32 /* Space */)
                    ;
                start = i;
                attrName = void 0;
                attrValue = void 0;
            }
        }
        resetCommandBuildInfo();
        return instructions;
    }
    /** @internal */
    local(template, context) {
        const root = template;
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
            const LocalTemplateType = class LocalTemplate {
            };
            const content = localTemplate.content;
            const bindableEls = kernel_1.toArray(content.querySelectorAll('bindable'));
            const bindableInstructions = bindable_js_1.Bindable.for(LocalTemplateType);
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
                    context.logger.warn(`The attribute(s) ${ignoredAttributes.join(', ')} will be ignored for ${bindableEl.outerHTML}. Only ${allowedLocalTemplateBindableAttributes.join(', ')} are processed.`);
                }
                content.removeChild(bindableEl);
            }
            context.addDep(custom_element_js_1.CustomElement.define({ name, template: localTemplate }, LocalTemplateType));
            root.removeChild(localTemplate);
        }
    }
    shouldReorderAttrs(el) {
        return el.nodeName === 'INPUT' && orderSensitiveInputType[el.type] === 1;
    }
    reorder(el, instructions) {
        switch (el.nodeName) {
            case 'INPUT': {
                const _instructions = instructions;
                // swap the order of checked and model/value attribute,
                // so that the required observers are prepared for checked-observer
                let modelOrValueOrMatcherIndex = void 0;
                let checkedIndex = void 0;
                let found = 0;
                let instruction;
                for (let i = 0; i < _instructions.length && found < 3; i++) {
                    instruction = _instructions[i];
                    switch (instruction.to) {
                        case 'model':
                        case 'value':
                        case 'matcher':
                            modelOrValueOrMatcherIndex = i;
                            found++;
                            break;
                        case 'checked':
                            checkedIndex = i;
                            found++;
                            break;
                    }
                }
                if (checkedIndex !== void 0 && modelOrValueOrMatcherIndex !== void 0 && checkedIndex < modelOrValueOrMatcherIndex) {
                    [_instructions[modelOrValueOrMatcherIndex], _instructions[checkedIndex]] = [_instructions[checkedIndex], _instructions[modelOrValueOrMatcherIndex]];
                }
            }
        }
    }
    /**
     * Mark an element as target with a special css class
     * and return it
     *
     * @internal
     */
    mark(el) {
        el.classList.add('au');
        return el;
    }
    /**
     * Replace an element with a marker, and return the marker
     *
     * @internal
     */
    marker(node, context) {
        // todo: assumption made: parentNode won't be null
        const parent = node.parentNode;
        const marker = context.h('au-m');
        this.mark(parent.insertBefore(marker, node));
        parent.removeChild(node);
        return marker;
    }
}
exports.TemplateCompiler = TemplateCompiler;
// this class is intended to be an implementation encapsulating the information at the root level of a template
// this works at the time this is created because everything inside a template should be retrieved
// from the root itself.
// if anytime in the future, where it's desirable to retrieve information from somewhere other than root
// then consider dropping this
// goal: hide the root container, and all the resources finding calls
class CompilationContext {
    constructor(def, container, compilationInstruction, parent, root, instructions) {
        this.hasSlot = false;
        // todo: ideally binding command shouldn't have to be cached
        // it can just be a singleton where it' retrieved
        // the resources semantic should be defined by the resource itself,
        // rather than baked in the container
        this.commands = utilities_html_js_1.createLookup();
        const hasParent = parent !== null;
        this.c = container;
        this.root = root === null ? this : root;
        this.def = def;
        this.ci = compilationInstruction;
        this.parent = parent;
        this.templateFactory = hasParent ? parent.templateFactory : container.get(template_element_factory_js_1.ITemplateElementFactory);
        // todo: attr parser should be retrieved based in resource semantic (current leaf + root + ignore parent)
        this.attrParser = hasParent ? parent.attrParser : container.get(attribute_pattern_js_1.IAttributeParser);
        this.exprParser = hasParent ? parent.exprParser : container.get(runtime_1.IExpressionParser);
        this.attrMapper = hasParent ? parent.attrMapper : container.get(attribute_mapper_js_1.IAttrMapper);
        this.logger = hasParent ? parent.logger : container.get(kernel_1.ILogger);
        this.p = hasParent ? parent.p : container.get(platform_js_1.IPlatform);
        this.localEls = hasParent ? parent.localEls : new Set();
        this.rows = instructions !== null && instructions !== void 0 ? instructions : [];
    }
    addDep(dep) {
        var _a;
        var _b;
        ((_a = (_b = this.root).deps) !== null && _a !== void 0 ? _a : (_b.deps = [])).push(dep);
        this.root.c.register(dep);
    }
    h(name) {
        const el = this.p.document.createElement(name);
        if (name === 'template') {
            this.p.document.adoptNode(el.content);
        }
        return el;
    }
    /**
     * Find the custom element definition of a given name
     */
    el(name) {
        return this.c.find(custom_element_js_1.CustomElement, name);
    }
    /**
     * Find the custom attribute definition of a given name
     */
    attr(name) {
        return this.c.find(custom_attribute_js_1.CustomAttribute, name);
    }
    /**
     * Create a new child compilation context
     */
    child(instructions) {
        return new CompilationContext(this.def, this.c, this.ci, this, this.root, instructions);
    }
    /**
     * Retrieve a binding command resource instance.
     *
     * @param name - The parsed `AttrSyntax`
     *
     * @returns An instance of the command if it exists, or `null` if it does not exist.
     */
    command(syntax) {
        if (this.root !== this) {
            return this.root.command(syntax);
        }
        const name = syntax.command;
        if (name === null) {
            return null;
        }
        let result = this.commands[name];
        if (result === void 0) {
            result = this.c.create(binding_command_js_1.BindingCommand, name);
            if (result === null) {
                throw new Error(`Unknown binding command: ${name}`);
            }
            this.commands[name] = result;
        }
        return result;
    }
}
function hasInlineBindings(rawValue) {
    const len = rawValue.length;
    let ch = 0;
    for (let i = 0; i < len; ++i) {
        ch = rawValue.charCodeAt(i);
        if (ch === 92 /* Backslash */) {
            ++i;
            // Ignore whatever comes next because it's escaped
        }
        else if (ch === 58 /* Colon */) {
            return true;
        }
        else if (ch === 36 /* Dollar */ && rawValue.charCodeAt(i + 1) === 123 /* OpenBrace */) {
            return false;
        }
    }
    return false;
}
function resetCommandBuildInfo() {
    commandBuildInfo.node
        = commandBuildInfo.attr
            = commandBuildInfo.expr
                = commandBuildInfo.bindable
                    = commandBuildInfo.def = null;
}
const emptyCompilationInstructions = { projections: null };
// eslint-disable-next-line
const voidDefinition = { name: 'unnamed' };
const commandBuildInfo = {
    node: null,
    expr: null,
    attr: null,
    bindable: null,
    def: null,
};
const invalidSurrogateAttribute = Object.assign(utilities_html_js_1.createLookup(), {
    'id': true,
    'name': true,
    'au-slot': true,
    'as-element': true,
});
const orderSensitiveInputType = {
    checkbox: 1,
    radio: 1,
};
const bindableAttrsInfoCache = new WeakMap();
class BindablesInfo {
    constructor(attrs, bindables, primary) {
        this.attrs = attrs;
        this.bindables = bindables;
        this.primary = primary;
    }
    static from(def, isAttr) {
        let info = bindableAttrsInfoCache.get(def);
        if (info == null) {
            const bindables = def.bindables;
            const attrs = utilities_html_js_1.createLookup();
            const defaultBindingMode = isAttr
                ? def.defaultBindingMode === void 0
                    ? runtime_1.BindingMode.default
                    : def.defaultBindingMode
                : runtime_1.BindingMode.default;
            let bindable;
            let prop;
            let hasPrimary = false;
            let primary;
            let attr;
            // from all bindables, pick the first primary bindable
            // if there is no primary, pick the first bindable
            // if there's no bindables, create a new primary with property value
            for (prop in bindables) {
                bindable = bindables[prop];
                attr = bindable.attribute;
                if (bindable.primary === true) {
                    if (hasPrimary) {
                        throw new Error(`Primary already exists on ${def.name}`);
                    }
                    hasPrimary = true;
                    primary = bindable;
                }
                else if (!hasPrimary && primary == null) {
                    primary = bindable;
                }
                attrs[attr] = bindable_js_1.BindableDefinition.create(prop, bindable);
            }
            if (bindable == null && isAttr) {
                // if no bindables are present, default to "value"
                primary = attrs.value = bindable_js_1.BindableDefinition.create('value', { mode: defaultBindingMode });
            }
            bindableAttrsInfoCache.set(def, info = new BindablesInfo(attrs, bindables, primary));
        }
        return info;
    }
}
exports.BindablesInfo = BindablesInfo;
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
/**
 * An interface describing the hooks a compilation process should invoke.
 *
 * A feature available to the default template compiler.
 */
exports.ITemplateCompilerHooks = kernel_1.DI.createInterface('ITemplateCompilerHooks');
const typeToHooksDefCache = new WeakMap();
const compilerHooksResourceName = kernel_1.Protocol.resource.keyFor('compiler-hooks');
exports.TemplateCompilerHooks = Object.freeze({
    name: compilerHooksResourceName,
    /**
     * @param def - Placeholder for future extensions. Currently always an empty object.
     */
    define(Type) {
        let def = typeToHooksDefCache.get(Type);
        if (def === void 0) {
            typeToHooksDefCache.set(Type, def = new TemplateCompilerHooksDefinition(Type));
            kernel_1.Metadata.define(compilerHooksResourceName, def, Type);
            kernel_1.Protocol.resource.appendTo(Type, compilerHooksResourceName);
        }
        return Type;
    }
});
class TemplateCompilerHooksDefinition {
    constructor(Type) {
        this.Type = Type;
    }
    get name() { return ''; }
    register(c) {
        c.register(kernel_1.Registration.singleton(exports.ITemplateCompilerHooks, this.Type));
    }
}
/**
 * Decorator: Indicates that the decorated class is a template compiler hooks.
 *
 * An instance of this class will be created and appropriate compilation hooks will be invoked
 * at different phases of the default compiler.
 */
/* eslint-disable */
// deepscan-disable-next-line
const templateCompilerHooks = (target) => {
    return target === void 0 ? decorator : decorator(target);
    function decorator(t) {
        return exports.TemplateCompilerHooks.define(t);
    }
    ;
};
exports.templateCompilerHooks = templateCompilerHooks;
/* eslint-enable */
//# sourceMappingURL=template-compiler.js.map