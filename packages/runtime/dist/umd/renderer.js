var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "./binding/call-binding", "./binding/expression-parser", "./binding/interpolation-binding", "./binding/let-binding", "./binding/property-binding", "./binding/ref-binding", "./definitions", "./flags", "./lifecycle", "./observation/observer-locator", "./resources/custom-attribute", "./resources/custom-element", "./templating/controller", "./templating/render-context", "./binding/ast", "./resources/binding-behavior"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const call_binding_1 = require("./binding/call-binding");
    const expression_parser_1 = require("./binding/expression-parser");
    const interpolation_binding_1 = require("./binding/interpolation-binding");
    const let_binding_1 = require("./binding/let-binding");
    const property_binding_1 = require("./binding/property-binding");
    const ref_binding_1 = require("./binding/ref-binding");
    const definitions_1 = require("./definitions");
    const flags_1 = require("./flags");
    const lifecycle_1 = require("./lifecycle");
    const observer_locator_1 = require("./observation/observer-locator");
    const custom_attribute_1 = require("./resources/custom-attribute");
    const custom_element_1 = require("./resources/custom-element");
    const controller_1 = require("./templating/controller");
    const render_context_1 = require("./templating/render-context");
    const ast_1 = require("./binding/ast");
    const binding_behavior_1 = require("./resources/binding-behavior");
    exports.ITemplateCompiler = kernel_1.DI.createInterface('ITemplateCompiler').noDefault();
    exports.IInstructionRenderer = kernel_1.DI.createInterface('IInstructionRenderer').noDefault();
    exports.IRenderer = kernel_1.DI.createInterface('IRenderer').noDefault();
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
                kernel_1.Registration.singleton(exports.IInstructionRenderer, decoratedTarget).register(container);
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
    let Renderer = class Renderer {
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
            return kernel_1.Registration.singleton(exports.IRenderer, this).register(container);
        }
        render(flags, context, controller, targets, definition, host, parts) {
            const targetInstructions = definition.instructions;
            if (targets.length !== targetInstructions.length) {
                throw new Error(`The compiled template is not aligned with the render instructions. There are ${targets.length} targets and ${targetInstructions.length} instructions.`);
            }
            for (let i = 0, ii = targets.length; i < ii; ++i) {
                this.renderInstructions(
                /* flags        */ flags, 
                /* context      */ context, 
                /* instructions */ targetInstructions[i], 
                /* controller   */ controller, 
                /* target       */ targets[i], 
                /* parts        */ parts);
            }
            if (host !== void 0 && host !== null) {
                this.renderInstructions(
                /* flags        */ flags, 
                /* context      */ context, 
                /* instructions */ definition.surrogates, 
                /* controller   */ controller, 
                /* target       */ host, 
                /* parts        */ parts);
            }
        }
        renderInstructions(flags, context, instructions, controller, target, parts) {
            const instructionRenderers = this.instructionRenderers;
            let current;
            for (let i = 0, ii = instructions.length; i < ii; ++i) {
                current = instructions[i];
                instructionRenderers[current.type](flags, context, controller, target, current, parts);
            }
        }
    };
    Renderer = __decorate([
        __param(0, kernel_1.all(exports.IInstructionRenderer)),
        __metadata("design:paramtypes", [Array])
    ], Renderer);
    exports.Renderer = Renderer;
    function ensureExpression(parser, srcOrExpr, bindingType) {
        if (typeof srcOrExpr === 'string') {
            return parser.parse(srcOrExpr, bindingType);
        }
        return srcOrExpr;
    }
    exports.ensureExpression = ensureExpression;
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
        switch (refTargetName) {
            case 'controller':
                // this means it supports returning undefined
                return custom_element_1.CustomElement.for(refHost);
            case 'view':
                // todo: returns node sequences for fun?
                throw new Error('Not supported API');
            case 'view-model':
                // this means it supports returning undefined
                return custom_element_1.CustomElement.for(refHost).viewModel;
            default: {
                const caController = custom_attribute_1.CustomAttribute.for(refHost, refTargetName);
                if (caController !== void 0) {
                    return caController.viewModel;
                }
                const ceController = custom_element_1.CustomElement.for(refHost, refTargetName);
                if (ceController === void 0) {
                    throw new Error(`Attempted to reference "${refTargetName}", but it was not found amongst the target's API.`);
                }
                return ceController.viewModel;
            }
        }
    }
    exports.getRefTarget = getRefTarget;
    let SetPropertyRenderer = 
    /** @internal */
    class SetPropertyRenderer {
        render(flags, context, controller, target, instruction) {
            const obj = getTarget(target);
            if (obj.$observers !== void 0 && obj.$observers[instruction.to] !== void 0) {
                obj.$observers[instruction.to].setValue(instruction.value, 4096 /* fromBind */);
            }
            else {
                obj[instruction.to] = instruction.value;
            }
        }
    };
    SetPropertyRenderer = __decorate([
        instructionRenderer("re" /* setProperty */)
        /** @internal */
    ], SetPropertyRenderer);
    exports.SetPropertyRenderer = SetPropertyRenderer;
    let CustomElementRenderer = 
    /** @internal */
    class CustomElementRenderer {
        render(flags, context, controller, target, instruction, parts) {
            parts = definitions_1.mergeParts(parts, instruction.parts);
            const factory = context.getComponentFactory(
            /* parentController */ controller, 
            /* host             */ target, 
            /* instruction      */ instruction, 
            /* viewFactory      */ void 0, 
            /* location         */ target);
            const key = custom_element_1.CustomElement.keyFrom(instruction.res);
            const component = factory.createComponent(key);
            const lifecycle = context.get(lifecycle_1.ILifecycle);
            const childController = controller_1.Controller.forCustomElement(
            /* viewModel       */ component, 
            /* lifecycle       */ lifecycle, 
            /* host            */ target, 
            /* parentContainer */ context, 
            /* parts           */ parts, 
            /* flags           */ flags);
            flags = childController.flags;
            kernel_1.Metadata.define(key, childController, target);
            context.renderInstructions(
            /* flags        */ flags, 
            /* instructions */ instruction.instructions, 
            /* controller   */ controller, 
            /* target       */ childController, 
            /* parts        */ parts);
            controller.addController(childController);
            factory.dispose();
        }
    };
    CustomElementRenderer = __decorate([
        instructionRenderer("ra" /* hydrateElement */)
        /** @internal */
    ], CustomElementRenderer);
    exports.CustomElementRenderer = CustomElementRenderer;
    let CustomAttributeRenderer = 
    /** @internal */
    class CustomAttributeRenderer {
        render(flags, context, controller, target, instruction, parts) {
            const factory = context.getComponentFactory(
            /* parentController */ controller, 
            /* host             */ target, 
            /* instruction      */ instruction, 
            /* viewFactory      */ void 0, 
            /* location         */ void 0);
            const key = custom_attribute_1.CustomAttribute.keyFrom(instruction.res);
            const component = factory.createComponent(key);
            const lifecycle = context.get(lifecycle_1.ILifecycle);
            const childController = controller_1.Controller.forCustomAttribute(
            /* viewModel */ component, 
            /* lifecycle */ lifecycle, 
            /* host      */ target, 
            /* flags     */ flags);
            kernel_1.Metadata.define(key, childController, target);
            context.renderInstructions(
            /* flags        */ flags, 
            /* instructions */ instruction.instructions, 
            /* controller   */ controller, 
            /* target       */ childController, 
            /* parts        */ parts);
            controller.addController(childController);
            factory.dispose();
        }
    };
    CustomAttributeRenderer = __decorate([
        instructionRenderer("rb" /* hydrateAttribute */)
        /** @internal */
    ], CustomAttributeRenderer);
    exports.CustomAttributeRenderer = CustomAttributeRenderer;
    let TemplateControllerRenderer = 
    /** @internal */
    class TemplateControllerRenderer {
        render(flags, parentContext, controller, target, instruction, parts) {
            parts = definitions_1.mergeParts(parts, instruction.parts);
            const viewFactory = render_context_1.getRenderContext(instruction.def, parentContext, parts).getViewFactory();
            const renderLocation = parentContext.dom.convertToRenderLocation(target);
            const componentFactory = parentContext.getComponentFactory(
            /* parentController */ controller, 
            /* host             */ target, 
            /* instruction      */ instruction, 
            /* viewFactory      */ viewFactory, 
            /* location         */ renderLocation);
            const key = custom_attribute_1.CustomAttribute.keyFrom(instruction.res);
            const component = componentFactory.createComponent(key);
            const lifecycle = parentContext.get(lifecycle_1.ILifecycle);
            const childController = controller_1.Controller.forCustomAttribute(
            /* viewModel */ component, 
            /* lifecycle */ lifecycle, 
            /* host      */ target, 
            /* flags     */ flags);
            kernel_1.Metadata.define(key, childController, renderLocation);
            if (instruction.link) {
                const controllers = controller.controllers;
                component.link(controllers[controllers.length - 1]);
            }
            parentContext.renderInstructions(
            /* flags        */ flags, 
            /* instructions */ instruction.instructions, 
            /* controller   */ controller, 
            /* target       */ childController, 
            /* parts        */ parts);
            controller.addController(childController);
            componentFactory.dispose();
        }
    };
    TemplateControllerRenderer = __decorate([
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
        render(flags, context, controller, target, instruction) {
            context.dom.remove(target);
            const childInstructions = instruction.instructions;
            const toBindingContext = instruction.toBindingContext;
            let childInstruction;
            let expr;
            let binding;
            for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
                childInstruction = childInstructions[i];
                expr = ensureExpression(this.parser, childInstruction.from, 48 /* IsPropertyCommand */);
                binding = applyBindingBehavior(new let_binding_1.LetBinding(expr, childInstruction.to, this.observerLocator, context, toBindingContext), expr, context);
                controller.addBinding(binding);
            }
        }
    };
    LetElementRenderer = __decorate([
        instructionRenderer("rd" /* hydrateLetElement */)
        /** @internal */
        ,
        __param(0, expression_parser_1.IExpressionParser),
        __param(1, observer_locator_1.IObserverLocator),
        __metadata("design:paramtypes", [Object, Object])
    ], LetElementRenderer);
    exports.LetElementRenderer = LetElementRenderer;
    let CallBindingRenderer = 
    /** @internal */
    class CallBindingRenderer {
        constructor(parser, observerLocator) {
            this.parser = parser;
            this.observerLocator = observerLocator;
        }
        render(flags, context, controller, target, instruction) {
            const expr = ensureExpression(this.parser, instruction.from, 153 /* CallCommand */);
            const binding = applyBindingBehavior(new call_binding_1.CallBinding(expr, getTarget(target), instruction.to, this.observerLocator, context), expr, context);
            controller.addBinding(binding);
        }
    };
    CallBindingRenderer = __decorate([
        instructionRenderer("rh" /* callBinding */)
        /** @internal */
        ,
        __param(0, expression_parser_1.IExpressionParser),
        __param(1, observer_locator_1.IObserverLocator),
        __metadata("design:paramtypes", [Object, Object])
    ], CallBindingRenderer);
    exports.CallBindingRenderer = CallBindingRenderer;
    let RefBindingRenderer = 
    /** @internal */
    class RefBindingRenderer {
        constructor(parser) {
            this.parser = parser;
        }
        render(flags, context, controller, target, instruction) {
            const expr = ensureExpression(this.parser, instruction.from, 5376 /* IsRef */);
            const binding = applyBindingBehavior(new ref_binding_1.RefBinding(expr, getRefTarget(target, instruction.to), context), expr, context);
            controller.addBinding(binding);
        }
    };
    RefBindingRenderer = __decorate([
        instructionRenderer("rj" /* refBinding */)
        /** @internal */
        ,
        __param(0, expression_parser_1.IExpressionParser),
        __metadata("design:paramtypes", [Object])
    ], RefBindingRenderer);
    exports.RefBindingRenderer = RefBindingRenderer;
    let InterpolationBindingRenderer = 
    /** @internal */
    class InterpolationBindingRenderer {
        constructor(parser, observerLocator) {
            this.parser = parser;
            this.observerLocator = observerLocator;
        }
        render(flags, context, controller, target, instruction) {
            let binding;
            const expr = ensureExpression(this.parser, instruction.from, 2048 /* Interpolation */);
            if (expr.isMulti) {
                binding = applyBindingBehavior(new interpolation_binding_1.MultiInterpolationBinding(this.observerLocator, expr, getTarget(target), instruction.to, flags_1.BindingMode.toView, context), expr, context);
            }
            else {
                binding = applyBindingBehavior(new interpolation_binding_1.InterpolationBinding(expr.firstExpression, expr, getTarget(target), instruction.to, flags_1.BindingMode.toView, this.observerLocator, context, true), expr, context);
            }
            controller.addBinding(binding);
        }
    };
    InterpolationBindingRenderer = __decorate([
        instructionRenderer("rf" /* interpolation */)
        /** @internal */
        ,
        __param(0, expression_parser_1.IExpressionParser),
        __param(1, observer_locator_1.IObserverLocator),
        __metadata("design:paramtypes", [Object, Object])
    ], InterpolationBindingRenderer);
    exports.InterpolationBindingRenderer = InterpolationBindingRenderer;
    let PropertyBindingRenderer = 
    /** @internal */
    class PropertyBindingRenderer {
        constructor(parser, observerLocator) {
            this.parser = parser;
            this.observerLocator = observerLocator;
        }
        render(flags, context, controller, target, instruction) {
            const expr = ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | instruction.mode);
            const binding = applyBindingBehavior(new property_binding_1.PropertyBinding(expr, getTarget(target), instruction.to, instruction.mode, this.observerLocator, context), expr, context);
            controller.addBinding(binding);
        }
    };
    PropertyBindingRenderer = __decorate([
        instructionRenderer("rg" /* propertyBinding */)
        /** @internal */
        ,
        __param(0, expression_parser_1.IExpressionParser),
        __param(1, observer_locator_1.IObserverLocator),
        __metadata("design:paramtypes", [Object, Object])
    ], PropertyBindingRenderer);
    exports.PropertyBindingRenderer = PropertyBindingRenderer;
    let IteratorBindingRenderer = 
    /** @internal */
    class IteratorBindingRenderer {
        constructor(parser, observerLocator) {
            this.parser = parser;
            this.observerLocator = observerLocator;
        }
        render(flags, context, controller, target, instruction) {
            const expr = ensureExpression(this.parser, instruction.from, 539 /* ForCommand */);
            const binding = applyBindingBehavior(new property_binding_1.PropertyBinding(expr, getTarget(target), instruction.to, flags_1.BindingMode.toView, this.observerLocator, context), expr, context);
            controller.addBinding(binding);
        }
    };
    IteratorBindingRenderer = __decorate([
        instructionRenderer("rk" /* iteratorBinding */)
        /** @internal */
        ,
        __param(0, expression_parser_1.IExpressionParser),
        __param(1, observer_locator_1.IObserverLocator),
        __metadata("design:paramtypes", [Object, Object])
    ], IteratorBindingRenderer);
    exports.IteratorBindingRenderer = IteratorBindingRenderer;
    let behaviorExpressionIndex = 0;
    const behaviorExpressions = [];
    function applyBindingBehavior(binding, expression, locator) {
        while (expression instanceof ast_1.BindingBehaviorExpression) {
            behaviorExpressions[behaviorExpressionIndex++] = expression;
            expression = expression.expression;
        }
        while (behaviorExpressionIndex > 0) {
            const behaviorExpression = behaviorExpressions[--behaviorExpressionIndex];
            const behaviorOrFactory = locator.get(behaviorExpression.behaviorKey);
            if (behaviorOrFactory instanceof binding_behavior_1.BindingBehaviorFactory) {
                binding = behaviorOrFactory.construct(binding, behaviorExpression);
            }
        }
        behaviorExpressions.length = 0;
        return binding;
    }
    exports.applyBindingBehavior = applyBindingBehavior;
});
//# sourceMappingURL=renderer.js.map