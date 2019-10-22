(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/kernel", "./binding/call-binding", "./binding/expression-parser", "./binding/interpolation-binding", "./binding/let-binding", "./binding/property-binding", "./binding/ref-binding", "./flags", "./observation/observer-locator", "./rendering-engine", "./resources/custom-attribute", "./resources/custom-element", "./templating/controller"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@aurelia/kernel");
    const call_binding_1 = require("./binding/call-binding");
    const expression_parser_1 = require("./binding/expression-parser");
    const interpolation_binding_1 = require("./binding/interpolation-binding");
    const let_binding_1 = require("./binding/let-binding");
    const property_binding_1 = require("./binding/property-binding");
    const ref_binding_1 = require("./binding/ref-binding");
    const flags_1 = require("./flags");
    const observer_locator_1 = require("./observation/observer-locator");
    const rendering_engine_1 = require("./rendering-engine");
    const custom_attribute_1 = require("./resources/custom-attribute");
    const custom_element_1 = require("./resources/custom-element");
    const controller_1 = require("./templating/controller");
    function instructionRenderer(instructionType) {
        return function decorator(target) {
            // wrap the constructor to set the instructionType to the instance (for better performance than when set on the prototype)
            const decoratedTarget = function (...args) {
                const instance = new target(...args);
                instance.instructionType = instructionType;
                return instance;
            };
            // make sure we register the decorated constructor with DI
            decoratedTarget.register = function register(container) {
                kernel_1.Registration.singleton(rendering_engine_1.IInstructionRenderer, decoratedTarget).register(container);
            };
            // copy over any metadata such as annotations (set by preceding decorators) as well as static properties set by the user
            // also copy the name, to be less confusing to users (so they can still use constructor.name for whatever reason)
            // the length (number of ctor arguments) is copied for the same reason
            const metadataKeys = kernel_1.Metadata.getOwnKeys(target);
            for (const key of metadataKeys) {
                kernel_1.Metadata.define(key, kernel_1.Metadata.getOwn(key, target), decoratedTarget);
            }
            const ownProperties = Object.getOwnPropertyDescriptors(target);
            Object.keys(ownProperties).filter(prop => prop !== 'prototype').forEach(prop => {
                Reflect.defineProperty(decoratedTarget, prop, ownProperties[prop]);
            });
            return decoratedTarget;
        };
    }
    exports.instructionRenderer = instructionRenderer;
    /* @internal */
    class Renderer {
        constructor(instructionRenderers) {
            const record = this.instructionRenderers = {};
            instructionRenderers.forEach(item => {
                // Binding the functions to the renderer instances and calling the functions directly,
                // prevents the `render` call sites from going megamorphic.
                // Consumes slightly more memory but significantly less CPU.
                record[item.instructionType] = item.render.bind(item);
            });
        }
        static register(container) {
            return kernel_1.Registration.singleton(rendering_engine_1.IRenderer, this).register(container);
        }
        render(flags, dom, context, renderable, targets, definition, host, parts) {
            const targetInstructions = definition.instructions;
            const instructionRenderers = this.instructionRenderers;
            if (targets.length !== targetInstructions.length) {
                if (targets.length > targetInstructions.length) {
                    throw kernel_1.Reporter.error(30);
                }
                else {
                    throw kernel_1.Reporter.error(31);
                }
            }
            let instructions;
            let target;
            let current;
            for (let i = 0, ii = targets.length; i < ii; ++i) {
                instructions = targetInstructions[i];
                target = targets[i];
                for (let j = 0, jj = instructions.length; j < jj; ++j) {
                    current = instructions[j];
                    instructionRenderers[current.type](flags, dom, context, renderable, target, current, parts);
                }
            }
            if (host) {
                const surrogateInstructions = definition.surrogates;
                for (let i = 0, ii = surrogateInstructions.length; i < ii; ++i) {
                    current = surrogateInstructions[i];
                    instructionRenderers[current.type](flags, dom, context, renderable, host, current, parts);
                }
            }
        }
    }
    exports.Renderer = Renderer;
    Renderer.inject = [kernel_1.all(rendering_engine_1.IInstructionRenderer)];
    function ensureExpression(parser, srcOrExpr, bindingType) {
        if (typeof srcOrExpr === 'string') {
            return parser.parse(srcOrExpr, bindingType);
        }
        return srcOrExpr;
    }
    exports.ensureExpression = ensureExpression;
    function addBinding(renderable, binding) {
        if (renderable.bindings == void 0) {
            renderable.bindings = [binding];
        }
        else {
            renderable.bindings.push(binding);
        }
    }
    exports.addBinding = addBinding;
    function addComponent(renderable, component) {
        if (renderable.controllers == void 0) {
            renderable.controllers = [component];
        }
        else {
            renderable.controllers.push(component);
        }
    }
    exports.addComponent = addComponent;
    function getTarget(potentialTarget) {
        if (potentialTarget.bindingContext !== void 0) {
            return potentialTarget.bindingContext;
        }
        return potentialTarget;
    }
    exports.getTarget = getTarget;
    function getRefTarget(refHost, refTargetName) {
        if (refTargetName === 'element') {
            return refHost;
        }
        const $auRefs = refHost.$au;
        if ($auRefs === void 0) {
            // todo: code error code, this message is from v1
            throw new Error(`No Aurelia APIs are defined for the element: "${refHost.tagName}".`);
        }
        let refTargetController;
        switch (refTargetName) {
            case 'controller':
                // this means it supports returning undefined
                return refHost.$controller;
            case 'view':
                // todo: returns node sequences for fun?
                throw new Error('Not supported API');
            case 'view-model':
                // this means it supports returning undefined
                return refHost.$controller.viewModel;
            default:
                refTargetController = $auRefs[refTargetName];
                if (refTargetController === void 0) {
                    throw new Error(`Attempted to reference "${refTargetName}", but it was not found amongst the target's API.`);
                }
                return refTargetController.viewModel;
        }
    }
    exports.getRefTarget = getRefTarget;
    function setControllerReference(controller, host, referenceName) {
        let $auRefs = host.$au;
        if ($auRefs === void 0) {
            $auRefs = host.$au = new ControllersLookup();
        }
        $auRefs[referenceName] = controller;
    }
    class ControllersLookup {
    }
    let SetPropertyRenderer = 
    /** @internal */
    class SetPropertyRenderer {
        render(flags, dom, context, renderable, target, instruction) {
            getTarget(target)[instruction.to] = (instruction.value === '' ? true : instruction.value); // Yeah, yeah..
        }
    };
    SetPropertyRenderer = tslib_1.__decorate([
        instructionRenderer("re" /* setProperty */)
        /** @internal */
    ], SetPropertyRenderer);
    exports.SetPropertyRenderer = SetPropertyRenderer;
    let CustomElementRenderer = 
    /** @internal */
    class CustomElementRenderer {
        render(flags, dom, context, renderable, target, instruction) {
            const operation = context.beginComponentOperation(renderable, target, instruction, null, null, target, true);
            const component = context.get(custom_element_1.CustomElement.keyFrom(instruction.res));
            const instructionRenderers = context.get(rendering_engine_1.IRenderer).instructionRenderers;
            const childInstructions = instruction.instructions;
            const controller = controller_1.Controller.forCustomElement(component, context, target, flags, instruction);
            setControllerReference(controller, controller.host, instruction.res);
            let current;
            for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
                current = childInstructions[i];
                instructionRenderers[current.type](flags, dom, context, renderable, controller, current);
            }
            addComponent(renderable, controller);
            operation.dispose();
        }
    };
    CustomElementRenderer = tslib_1.__decorate([
        instructionRenderer("ra" /* hydrateElement */)
        /** @internal */
    ], CustomElementRenderer);
    exports.CustomElementRenderer = CustomElementRenderer;
    let CustomAttributeRenderer = 
    /** @internal */
    class CustomAttributeRenderer {
        render(flags, dom, context, renderable, target, instruction) {
            const operation = context.beginComponentOperation(renderable, target, instruction);
            const component = context.get(custom_attribute_1.CustomAttribute.keyFrom(instruction.res));
            const instructionRenderers = context.get(rendering_engine_1.IRenderer).instructionRenderers;
            const childInstructions = instruction.instructions;
            const controller = controller_1.Controller.forCustomAttribute(component, context, flags);
            setControllerReference(controller, target, instruction.res);
            let current;
            for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
                current = childInstructions[i];
                instructionRenderers[current.type](flags, dom, context, renderable, controller, current);
            }
            addComponent(renderable, controller);
            operation.dispose();
        }
    };
    CustomAttributeRenderer = tslib_1.__decorate([
        instructionRenderer("rb" /* hydrateAttribute */)
        /** @internal */
    ], CustomAttributeRenderer);
    exports.CustomAttributeRenderer = CustomAttributeRenderer;
    let TemplateControllerRenderer = 
    /** @internal */
    class TemplateControllerRenderer {
        constructor(renderingEngine, observerLocator) {
            this.renderingEngine = renderingEngine;
            this.observerLocator = observerLocator;
        }
        render(flags, dom, context, renderable, target, instruction, parts) {
            const factory = this.renderingEngine.getViewFactory(dom, instruction.def, context);
            const renderLocation = dom.convertToRenderLocation(target);
            const operation = context.beginComponentOperation(renderable, target, instruction, factory, parts, renderLocation, false);
            const component = context.get(custom_attribute_1.CustomAttribute.keyFrom(instruction.res));
            const instructionRenderers = context.get(rendering_engine_1.IRenderer).instructionRenderers;
            const childInstructions = instruction.instructions;
            if (instruction.parts !== void 0) {
                if (parts === void 0) {
                    // Just assign it, no need to create new variables
                    parts = instruction.parts;
                }
                else {
                    // Create a new object because we shouldn't accidentally put child information in the parent part object.
                    // If the parts conflict, the instruction's parts overwrite the passed-in parts because they were declared last.
                    parts = {
                        ...parts,
                        ...instruction.parts,
                    };
                }
            }
            const controller = controller_1.Controller.forCustomAttribute(component, context, flags);
            if (instruction.link) {
                const controllers = renderable.controllers;
                component.link(controllers[controllers.length - 1]);
            }
            setControllerReference(controller, renderLocation, instruction.res);
            let current;
            for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
                current = childInstructions[i];
                instructionRenderers[current.type](flags, dom, context, renderable, controller, current);
            }
            addComponent(renderable, controller);
            operation.dispose();
        }
    };
    TemplateControllerRenderer = tslib_1.__decorate([
        instructionRenderer("rc" /* hydrateTemplateController */)
        /** @internal */
        ,
        tslib_1.__param(0, rendering_engine_1.IRenderingEngine),
        tslib_1.__param(1, observer_locator_1.IObserverLocator)
    ], TemplateControllerRenderer);
    exports.TemplateControllerRenderer = TemplateControllerRenderer;
    let LetElementRenderer = 
    /** @internal */
    class LetElementRenderer {
        constructor(parser, observerLocator) {
            this.parser = parser;
            this.observerLocator = observerLocator;
        }
        render(flags, dom, context, renderable, target, instruction) {
            dom.remove(target);
            const childInstructions = instruction.instructions;
            const toBindingContext = instruction.toBindingContext;
            let childInstruction;
            let expr;
            let binding;
            for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
                childInstruction = childInstructions[i];
                expr = ensureExpression(this.parser, childInstruction.from, 48 /* IsPropertyCommand */);
                binding = new let_binding_1.LetBinding(expr, childInstruction.to, this.observerLocator, context, toBindingContext);
                addBinding(renderable, binding);
            }
        }
    };
    LetElementRenderer = tslib_1.__decorate([
        instructionRenderer("rd" /* hydrateLetElement */)
        /** @internal */
        ,
        tslib_1.__param(0, expression_parser_1.IExpressionParser),
        tslib_1.__param(1, observer_locator_1.IObserverLocator)
    ], LetElementRenderer);
    exports.LetElementRenderer = LetElementRenderer;
    let CallBindingRenderer = 
    /** @internal */
    class CallBindingRenderer {
        constructor(parser, observerLocator) {
            this.parser = parser;
            this.observerLocator = observerLocator;
        }
        render(flags, dom, context, renderable, target, instruction) {
            const expr = ensureExpression(this.parser, instruction.from, 153 /* CallCommand */);
            const binding = new call_binding_1.CallBinding(expr, getTarget(target), instruction.to, this.observerLocator, context);
            addBinding(renderable, binding);
        }
    };
    CallBindingRenderer = tslib_1.__decorate([
        instructionRenderer("rh" /* callBinding */)
        /** @internal */
        ,
        tslib_1.__param(0, expression_parser_1.IExpressionParser),
        tslib_1.__param(1, observer_locator_1.IObserverLocator)
    ], CallBindingRenderer);
    exports.CallBindingRenderer = CallBindingRenderer;
    let RefBindingRenderer = 
    /** @internal */
    class RefBindingRenderer {
        constructor(parser) {
            this.parser = parser;
        }
        render(flags, dom, context, renderable, target, instruction) {
            const expr = ensureExpression(this.parser, instruction.from, 5376 /* IsRef */);
            const binding = new ref_binding_1.RefBinding(expr, getRefTarget(target, instruction.to), context);
            addBinding(renderable, binding);
        }
    };
    RefBindingRenderer = tslib_1.__decorate([
        instructionRenderer("rj" /* refBinding */)
        /** @internal */
        ,
        tslib_1.__param(0, expression_parser_1.IExpressionParser)
    ], RefBindingRenderer);
    exports.RefBindingRenderer = RefBindingRenderer;
    let InterpolationBindingRenderer = 
    /** @internal */
    class InterpolationBindingRenderer {
        constructor(parser, observerLocator) {
            this.parser = parser;
            this.observerLocator = observerLocator;
        }
        render(flags, dom, context, renderable, target, instruction) {
            let binding;
            const expr = ensureExpression(this.parser, instruction.from, 2048 /* Interpolation */);
            if (expr.isMulti) {
                binding = new interpolation_binding_1.MultiInterpolationBinding(this.observerLocator, expr, getTarget(target), instruction.to, flags_1.BindingMode.toView, context);
            }
            else {
                binding = new interpolation_binding_1.InterpolationBinding(expr.firstExpression, expr, getTarget(target), instruction.to, flags_1.BindingMode.toView, this.observerLocator, context, true);
            }
            addBinding(renderable, binding);
        }
    };
    InterpolationBindingRenderer = tslib_1.__decorate([
        instructionRenderer("rf" /* interpolation */)
        /** @internal */
        ,
        tslib_1.__param(0, expression_parser_1.IExpressionParser),
        tslib_1.__param(1, observer_locator_1.IObserverLocator)
    ], InterpolationBindingRenderer);
    exports.InterpolationBindingRenderer = InterpolationBindingRenderer;
    let PropertyBindingRenderer = 
    /** @internal */
    class PropertyBindingRenderer {
        constructor(parser, observerLocator) {
            this.parser = parser;
            this.observerLocator = observerLocator;
        }
        render(flags, dom, context, renderable, target, instruction) {
            const expr = ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | instruction.mode);
            const binding = new property_binding_1.PropertyBinding(expr, getTarget(target), instruction.to, instruction.mode, this.observerLocator, context);
            addBinding(renderable, binding);
        }
    };
    PropertyBindingRenderer = tslib_1.__decorate([
        instructionRenderer("rg" /* propertyBinding */)
        /** @internal */
        ,
        tslib_1.__param(0, expression_parser_1.IExpressionParser),
        tslib_1.__param(1, observer_locator_1.IObserverLocator)
    ], PropertyBindingRenderer);
    exports.PropertyBindingRenderer = PropertyBindingRenderer;
    let IteratorBindingRenderer = 
    /** @internal */
    class IteratorBindingRenderer {
        constructor(parser, observerLocator) {
            this.parser = parser;
            this.observerLocator = observerLocator;
        }
        render(flags, dom, context, renderable, target, instruction) {
            const expr = ensureExpression(this.parser, instruction.from, 539 /* ForCommand */);
            const binding = new property_binding_1.PropertyBinding(expr, getTarget(target), instruction.to, flags_1.BindingMode.toView, this.observerLocator, context);
            addBinding(renderable, binding);
        }
    };
    IteratorBindingRenderer = tslib_1.__decorate([
        instructionRenderer("rk" /* iteratorBinding */)
        /** @internal */
        ,
        tslib_1.__param(0, expression_parser_1.IExpressionParser),
        tslib_1.__param(1, observer_locator_1.IObserverLocator)
    ], IteratorBindingRenderer);
    exports.IteratorBindingRenderer = IteratorBindingRenderer;
});
//# sourceMappingURL=renderer.js.map