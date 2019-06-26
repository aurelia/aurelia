(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/kernel", "./binding/binding", "./binding/call", "./binding/expression-parser", "./binding/interpolation-binding", "./binding/let-binding", "./binding/ref", "./definitions", "./flags", "./templating/controller", "./observation/observer-locator", "./rendering-engine"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@aurelia/kernel");
    const binding_1 = require("./binding/binding");
    const call_1 = require("./binding/call");
    const expression_parser_1 = require("./binding/expression-parser");
    const interpolation_binding_1 = require("./binding/interpolation-binding");
    const let_binding_1 = require("./binding/let-binding");
    const ref_1 = require("./binding/ref");
    const definitions_1 = require("./definitions");
    const flags_1 = require("./flags");
    const controller_1 = require("./templating/controller");
    const observer_locator_1 = require("./observation/observer-locator");
    const rendering_engine_1 = require("./rendering-engine");
    const slice = Array.prototype.slice;
    function instructionRenderer(instructionType) {
        return function decorator(target) {
            // wrap the constructor to set the instructionType to the instance (for better performance than when set on the prototype)
            const decoratedTarget = function (...args) {
                // TODO: fix this
                // @ts-ignore
                const instance = new target(...args);
                instance.instructionType = instructionType;
                return instance;
            };
            // make sure we register the decorated constructor with DI
            decoratedTarget.register = function register(container) {
                return kernel_1.Registration.singleton(rendering_engine_1.IInstructionRenderer, decoratedTarget).register(container, rendering_engine_1.IInstructionRenderer);
            };
            // copy over any static properties such as inject (set by preceding decorators)
            // also copy the name, to be less confusing to users (so they can still use constructor.name for whatever reason)
            // the length (number of ctor arguments) is copied for the same reason
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
                record[item.instructionType] = item;
            });
        }
        static register(container) {
            return kernel_1.Registration.singleton(rendering_engine_1.IRenderer, this).register(container);
        }
        // tslint:disable-next-line:parameters-max-number
        render(flags, dom, context, renderable, targets, definition, host, parts) {
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.enter('Renderer', 'render', slice.call(arguments));
            }
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
                    instructionRenderers[current.type].render(flags, dom, context, renderable, target, current, parts);
                }
            }
            if (host) {
                const surrogateInstructions = definition.surrogates;
                for (let i = 0, ii = surrogateInstructions.length; i < ii; ++i) {
                    current = surrogateInstructions[i];
                    instructionRenderers[current.type].render(flags, dom, context, renderable, host, current, parts);
                }
            }
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.leave();
            }
        }
    }
    // TODO: fix this
    // @ts-ignore
    Renderer.inject = [kernel_1.all(rendering_engine_1.IInstructionRenderer)];
    exports.Renderer = Renderer;
    function ensureExpression(parser, srcOrExpr, bindingType) {
        if (typeof srcOrExpr === 'string') {
            return parser.parse(srcOrExpr, bindingType);
        }
        return srcOrExpr;
    }
    exports.ensureExpression = ensureExpression;
    function addBinding(renderable, binding) {
        if (kernel_1.Tracer.enabled) {
            kernel_1.Tracer.enter('Renderer', 'addBinding', slice.call(arguments));
        }
        if (renderable.bindings == void 0) {
            renderable.bindings = [binding];
        }
        else {
            renderable.bindings.push(binding);
        }
        if (kernel_1.Tracer.enabled) {
            kernel_1.Tracer.leave();
        }
    }
    exports.addBinding = addBinding;
    function addComponent(renderable, component) {
        if (kernel_1.Tracer.enabled) {
            kernel_1.Tracer.enter('Renderer', 'addComponent', slice.call(arguments));
        }
        if (renderable.controllers == void 0) {
            renderable.controllers = [component];
        }
        else {
            renderable.controllers.push(component);
        }
        if (kernel_1.Tracer.enabled) {
            kernel_1.Tracer.leave();
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
    let SetPropertyRenderer = 
    /** @internal */
    class SetPropertyRenderer {
        render(flags, dom, context, renderable, target, instruction) {
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.enter('SetPropertyRenderer', 'render', slice.call(arguments));
            }
            getTarget(target)[instruction.to] = instruction.value; // Yeah, yeah..
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.leave();
            }
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
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.enter('CustomElementRenderer', 'render', slice.call(arguments));
            }
            const operation = context.beginComponentOperation(renderable, target, instruction, null, null, target, true);
            const component = context.get(definitions_1.customElementKey(instruction.res));
            const instructionRenderers = context.get(rendering_engine_1.IRenderer).instructionRenderers;
            const childInstructions = instruction.instructions;
            const controller = controller_1.Controller.forCustomElement(component, context, target, flags, instruction);
            let current;
            for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
                current = childInstructions[i];
                instructionRenderers[current.type].render(flags, dom, context, renderable, controller, current);
            }
            addComponent(renderable, controller);
            operation.dispose();
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.leave();
            }
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
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.enter('CustomAttributeRenderer', 'render', slice.call(arguments));
            }
            const operation = context.beginComponentOperation(renderable, target, instruction);
            const component = context.get(definitions_1.customAttributeKey(instruction.res));
            const instructionRenderers = context.get(rendering_engine_1.IRenderer).instructionRenderers;
            const childInstructions = instruction.instructions;
            const controller = controller_1.Controller.forCustomAttribute(component, context, flags);
            let current;
            for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
                current = childInstructions[i];
                instructionRenderers[current.type].render(flags, dom, context, renderable, controller, current);
            }
            addComponent(renderable, controller);
            operation.dispose();
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.leave();
            }
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
        constructor(renderingEngine) {
            this.renderingEngine = renderingEngine;
        }
        render(flags, dom, context, renderable, target, instruction, parts) {
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.enter('TemplateControllerRenderer', 'render', slice.call(arguments));
            }
            const factory = this.renderingEngine.getViewFactory(dom, instruction.def, context);
            const operation = context.beginComponentOperation(renderable, target, instruction, factory, parts, dom.convertToRenderLocation(target), false);
            const component = context.get(definitions_1.customAttributeKey(instruction.res));
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
            let current;
            for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
                current = childInstructions[i];
                instructionRenderers[current.type].render(flags, dom, context, renderable, controller, current);
            }
            addComponent(renderable, controller);
            operation.dispose();
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.leave();
            }
        }
    };
    TemplateControllerRenderer.inject = [rendering_engine_1.IRenderingEngine];
    TemplateControllerRenderer = tslib_1.__decorate([
        instructionRenderer("rc" /* hydrateTemplateController */)
        /** @internal */
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
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.enter('LetElementRenderer', 'render', slice.call(arguments));
            }
            dom.remove(target);
            const childInstructions = instruction.instructions;
            const toViewModel = instruction.toViewModel;
            let childInstruction;
            let expr;
            let binding;
            for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
                childInstruction = childInstructions[i];
                expr = ensureExpression(this.parser, childInstruction.from, 48 /* IsPropertyCommand */);
                binding = new let_binding_1.LetBinding(expr, childInstruction.to, this.observerLocator, context, toViewModel);
                addBinding(renderable, binding);
            }
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.leave();
            }
        }
    };
    LetElementRenderer.inject = [expression_parser_1.IExpressionParser, observer_locator_1.IObserverLocator];
    LetElementRenderer = tslib_1.__decorate([
        instructionRenderer("rd" /* hydrateLetElement */)
        /** @internal */
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
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.enter('CallBindingRenderer', 'render', slice.call(arguments));
            }
            const expr = ensureExpression(this.parser, instruction.from, 153 /* CallCommand */);
            const binding = new call_1.Call(expr, getTarget(target), instruction.to, this.observerLocator, context);
            addBinding(renderable, binding);
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.leave();
            }
        }
    };
    CallBindingRenderer.inject = [expression_parser_1.IExpressionParser, observer_locator_1.IObserverLocator];
    CallBindingRenderer = tslib_1.__decorate([
        instructionRenderer("rh" /* callBinding */)
        /** @internal */
    ], CallBindingRenderer);
    exports.CallBindingRenderer = CallBindingRenderer;
    let RefBindingRenderer = 
    /** @internal */
    class RefBindingRenderer {
        constructor(parser) {
            this.parser = parser;
        }
        render(flags, dom, context, renderable, target, instruction) {
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.enter('RefBindingRenderer', 'render', slice.call(arguments));
            }
            const expr = ensureExpression(this.parser, instruction.from, 1280 /* IsRef */);
            const binding = new ref_1.Ref(expr, getTarget(target), context);
            addBinding(renderable, binding);
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.leave();
            }
        }
    };
    RefBindingRenderer.inject = [expression_parser_1.IExpressionParser];
    RefBindingRenderer = tslib_1.__decorate([
        instructionRenderer("rj" /* refBinding */)
        /** @internal */
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
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.enter('InterpolationBindingRenderer', 'render', slice.call(arguments));
            }
            let binding;
            const expr = ensureExpression(this.parser, instruction.from, 2048 /* Interpolation */);
            if (expr.isMulti) {
                binding = new interpolation_binding_1.MultiInterpolationBinding(this.observerLocator, expr, getTarget(target), instruction.to, flags_1.BindingMode.toView, context);
            }
            else {
                binding = new interpolation_binding_1.InterpolationBinding(expr.firstExpression, expr, getTarget(target), instruction.to, flags_1.BindingMode.toView, this.observerLocator, context, true);
            }
            addBinding(renderable, binding);
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.leave();
            }
        }
    };
    InterpolationBindingRenderer.inject = [expression_parser_1.IExpressionParser, observer_locator_1.IObserverLocator];
    InterpolationBindingRenderer = tslib_1.__decorate([
        instructionRenderer("rf" /* interpolation */)
        /** @internal */
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
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.enter('PropertyBindingRenderer', 'render', slice.call(arguments));
            }
            const expr = ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | instruction.mode);
            const binding = new binding_1.Binding(expr, getTarget(target), instruction.to, instruction.mode, this.observerLocator, context);
            addBinding(renderable, binding);
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.leave();
            }
        }
    };
    PropertyBindingRenderer.inject = [expression_parser_1.IExpressionParser, observer_locator_1.IObserverLocator];
    PropertyBindingRenderer = tslib_1.__decorate([
        instructionRenderer("rg" /* propertyBinding */)
        /** @internal */
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
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.enter('IteratorBindingRenderer', 'render', slice.call(arguments));
            }
            const expr = ensureExpression(this.parser, instruction.from, 539 /* ForCommand */);
            const binding = new binding_1.Binding(expr, getTarget(target), instruction.to, flags_1.BindingMode.toView, this.observerLocator, context);
            addBinding(renderable, binding);
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.leave();
            }
        }
    };
    IteratorBindingRenderer.inject = [expression_parser_1.IExpressionParser, observer_locator_1.IObserverLocator];
    IteratorBindingRenderer = tslib_1.__decorate([
        instructionRenderer("rk" /* iteratorBinding */)
        /** @internal */
    ], IteratorBindingRenderer);
    exports.IteratorBindingRenderer = IteratorBindingRenderer;
});
//# sourceMappingURL=renderer.js.map