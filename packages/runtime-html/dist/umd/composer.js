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
        define(["require", "exports", "@aurelia/kernel", "@aurelia/runtime", "./binding/attribute", "./binding/listener", "./observation/event-delegator", "./resources/custom-element", "./templating/composition-context", "./resources/custom-attribute", "./dom", "./templating/controller", "./platform"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AttributeBindingComposer = exports.StylePropertyBindingComposer = exports.SetStyleAttributeComposer = exports.SetClassAttributeComposer = exports.SetAttributeComposer = exports.ListenerBindingComposer = exports.TextBindingComposer = exports.applyBindingBehavior = exports.IteratorBindingComposer = exports.PropertyBindingComposer = exports.InterpolationBindingComposer = exports.RefBindingComposer = exports.CallBindingComposer = exports.LetElementComposer = exports.TemplateControllerComposer = exports.CustomAttributeComposer = exports.CustomElementComposer = exports.SetPropertyComposer = exports.Composer = exports.IComposer = exports.instructionComposer = exports.IInstructionComposer = exports.ITemplateCompiler = void 0;
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    const attribute_1 = require("./binding/attribute");
    const listener_1 = require("./binding/listener");
    const event_delegator_1 = require("./observation/event-delegator");
    const custom_element_1 = require("./resources/custom-element");
    const composition_context_1 = require("./templating/composition-context");
    const custom_attribute_1 = require("./resources/custom-attribute");
    const dom_1 = require("./dom");
    const controller_1 = require("./templating/controller");
    const platform_1 = require("./platform");
    exports.ITemplateCompiler = kernel_1.DI.createInterface('ITemplateCompiler').noDefault();
    exports.IInstructionComposer = kernel_1.DI.createInterface('IInstructionComposer').noDefault();
    function instructionComposer(instructionType) {
        return function decorator(target) {
            // wrap the constructor to set the instructionType to the instance (for better performance than when set on the prototype)
            const decoratedTarget = function (...args) {
                const instance = new target(...args);
                instance.instructionType = instructionType;
                return instance;
            };
            // make sure we register the decorated constructor with DI
            decoratedTarget.register = function register(container) {
                kernel_1.Registration.singleton(exports.IInstructionComposer, decoratedTarget).register(container);
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
    exports.instructionComposer = instructionComposer;
    exports.IComposer = kernel_1.DI.createInterface('IComposer').withDefault(x => x.singleton(Composer));
    let Composer = class Composer {
        constructor(instructionComposers) {
            const record = this.instructionComposers = {};
            instructionComposers.forEach(item => {
                // Binding the functions to the composer instances and calling the functions directly,
                // prevents the `compose` call sites from going megamorphic.
                // Consumes slightly more memory but significantly less CPU.
                record[item.instructionType] = item.compose.bind(item);
            });
        }
        compose(flags, context, controller, targets, definition, host) {
            const targetInstructions = definition.instructions;
            if (targets.length !== targetInstructions.length) {
                throw new Error(`The compiled template is not aligned with the compose instructions. There are ${targets.length} targets and ${targetInstructions.length} instructions.`);
            }
            for (let i = 0, ii = targets.length; i < ii; ++i) {
                this.composeChildren(
                /* flags        */ flags, 
                /* context      */ context, 
                /* instructions */ targetInstructions[i], 
                /* controller   */ controller, 
                /* target       */ targets[i]);
            }
            if (host !== void 0 && host !== null) {
                this.composeChildren(
                /* flags        */ flags, 
                /* context      */ context, 
                /* instructions */ definition.surrogates, 
                /* controller   */ controller, 
                /* target       */ host);
            }
        }
        composeChildren(flags, context, instructions, controller, target) {
            const instructionComposers = this.instructionComposers;
            let current;
            for (let i = 0, ii = instructions.length; i < ii; ++i) {
                current = instructions[i];
                instructionComposers[current.type](flags, context, controller, target, current);
            }
        }
    };
    Composer = __decorate([
        __param(0, kernel_1.all(exports.IInstructionComposer)),
        __metadata("design:paramtypes", [Array])
    ], Composer);
    exports.Composer = Composer;
    function ensureExpression(parser, srcOrExpr, bindingType) {
        if (typeof srcOrExpr === 'string') {
            return parser.parse(srcOrExpr, bindingType);
        }
        return srcOrExpr;
    }
    function getTarget(potentialTarget) {
        if (potentialTarget.bindingContext !== void 0) {
            return potentialTarget.bindingContext;
        }
        return potentialTarget;
    }
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
                const ceController = custom_element_1.CustomElement.for(refHost, { name: refTargetName });
                if (ceController === void 0) {
                    throw new Error(`Attempted to reference "${refTargetName}", but it was not found amongst the target's API.`);
                }
                return ceController.viewModel;
            }
        }
    }
    let SetPropertyComposer = 
    /** @internal */
    class SetPropertyComposer {
        compose(flags, context, controller, target, instruction) {
            const obj = getTarget(target);
            if (obj.$observers !== void 0 && obj.$observers[instruction.to] !== void 0) {
                obj.$observers[instruction.to].setValue(instruction.value, 32 /* fromBind */);
            }
            else {
                obj[instruction.to] = instruction.value;
            }
        }
    };
    SetPropertyComposer = __decorate([
        instructionComposer("re" /* setProperty */)
        /** @internal */
    ], SetPropertyComposer);
    exports.SetPropertyComposer = SetPropertyComposer;
    let CustomElementComposer = 
    /** @internal */
    class CustomElementComposer {
        compose(flags, context, controller, target, instruction) {
            let viewFactory;
            const slotInfo = instruction.slotInfo;
            if (slotInfo !== null) {
                const projectionCtx = slotInfo.projectionContext;
                viewFactory = composition_context_1.getCompositionContext(projectionCtx.content, context).getViewFactory(void 0, slotInfo.type, projectionCtx.scope);
            }
            const factory = context.getComponentFactory(
            /* parentController */ controller, 
            /* host             */ target, 
            /* instruction      */ instruction, 
            /* viewFactory      */ viewFactory, 
            /* location         */ target);
            const key = custom_element_1.CustomElement.keyFrom(instruction.res);
            const component = factory.createComponent(key);
            const childController = controller_1.Controller.forCustomElement(
            /* root                */ controller.root, 
            /* container           */ context, 
            /* viewModel           */ component, 
            /* host                */ target, 
            /* targetedProjections */ context.getProjectionFor(instruction), 
            /* flags               */ flags);
            flags = childController.flags;
            kernel_1.Metadata.define(key, childController, target);
            context.composeChildren(
            /* flags        */ flags, 
            /* instructions */ instruction.instructions, 
            /* controller   */ controller, 
            /* target       */ childController);
            controller.addController(childController);
            factory.dispose();
        }
    };
    CustomElementComposer = __decorate([
        instructionComposer("ra" /* composeElement */)
        /** @internal */
    ], CustomElementComposer);
    exports.CustomElementComposer = CustomElementComposer;
    let CustomAttributeComposer = 
    /** @internal */
    class CustomAttributeComposer {
        compose(flags, context, controller, target, instruction) {
            const factory = context.getComponentFactory(
            /* parentController */ controller, 
            /* host             */ target, 
            /* instruction      */ instruction, 
            /* viewFactory      */ void 0, 
            /* location         */ void 0);
            const key = custom_attribute_1.CustomAttribute.keyFrom(instruction.res);
            const component = factory.createComponent(key);
            const childController = controller_1.Controller.forCustomAttribute(
            /* root      */ controller.root, 
            /* container */ context, 
            /* viewModel */ component, 
            /* host      */ target, 
            /* flags     */ flags);
            kernel_1.Metadata.define(key, childController, target);
            context.composeChildren(
            /* flags        */ flags, 
            /* instructions */ instruction.instructions, 
            /* controller   */ controller, 
            /* target       */ childController);
            controller.addController(childController);
            factory.dispose();
        }
    };
    CustomAttributeComposer = __decorate([
        instructionComposer("rb" /* composeAttribute */)
        /** @internal */
    ], CustomAttributeComposer);
    exports.CustomAttributeComposer = CustomAttributeComposer;
    let TemplateControllerComposer = 
    /** @internal */
    class TemplateControllerComposer {
        compose(flags, context, controller, target, instruction) {
            var _a;
            const viewFactory = composition_context_1.getCompositionContext(instruction.def, context).getViewFactory();
            const renderLocation = dom_1.convertToRenderLocation(target);
            const componentFactory = context.getComponentFactory(
            /* parentController */ controller, 
            /* host             */ target, 
            /* instruction      */ instruction, 
            /* viewFactory      */ viewFactory, 
            /* location         */ renderLocation);
            const key = custom_attribute_1.CustomAttribute.keyFrom(instruction.res);
            const component = componentFactory.createComponent(key);
            const childController = controller_1.Controller.forCustomAttribute(
            /* root      */ controller.root, 
            /* container */ context, 
            /* viewModel */ component, 
            /* host      */ target, 
            /* flags     */ flags);
            kernel_1.Metadata.define(key, childController, renderLocation);
            (_a = component.link) === null || _a === void 0 ? void 0 : _a.call(component, flags, context, controller, childController, target, instruction);
            context.composeChildren(
            /* flags        */ flags, 
            /* instructions */ instruction.instructions, 
            /* controller   */ controller, 
            /* target       */ childController);
            controller.addController(childController);
            componentFactory.dispose();
        }
    };
    TemplateControllerComposer = __decorate([
        instructionComposer("rc" /* composeTemplateController */)
        /** @internal */
    ], TemplateControllerComposer);
    exports.TemplateControllerComposer = TemplateControllerComposer;
    let LetElementComposer = 
    /** @internal */
    class LetElementComposer {
        constructor(parser, observerLocator) {
            this.parser = parser;
            this.observerLocator = observerLocator;
        }
        compose(flags, context, controller, target, instruction) {
            target.remove();
            const childInstructions = instruction.instructions;
            const toBindingContext = instruction.toBindingContext;
            let childInstruction;
            let expr;
            let binding;
            for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
                childInstruction = childInstructions[i];
                expr = ensureExpression(this.parser, childInstruction.from, 48 /* IsPropertyCommand */);
                binding = applyBindingBehavior(new runtime_1.LetBinding(expr, childInstruction.to, this.observerLocator, context, toBindingContext), expr, context);
                controller.addBinding(binding);
            }
        }
    };
    LetElementComposer = __decorate([
        instructionComposer("rd" /* composeLetElement */)
        /** @internal */
        ,
        __param(0, runtime_1.IExpressionParser),
        __param(1, runtime_1.IObserverLocator),
        __metadata("design:paramtypes", [Object, Object])
    ], LetElementComposer);
    exports.LetElementComposer = LetElementComposer;
    let CallBindingComposer = 
    /** @internal */
    class CallBindingComposer {
        constructor(parser, observerLocator) {
            this.parser = parser;
            this.observerLocator = observerLocator;
        }
        compose(flags, context, controller, target, instruction) {
            const expr = ensureExpression(this.parser, instruction.from, 153 /* CallCommand */);
            const binding = applyBindingBehavior(new runtime_1.CallBinding(expr, getTarget(target), instruction.to, this.observerLocator, context), expr, context);
            controller.addBinding(binding);
        }
    };
    CallBindingComposer = __decorate([
        instructionComposer("rh" /* callBinding */)
        /** @internal */
        ,
        __param(0, runtime_1.IExpressionParser),
        __param(1, runtime_1.IObserverLocator),
        __metadata("design:paramtypes", [Object, Object])
    ], CallBindingComposer);
    exports.CallBindingComposer = CallBindingComposer;
    let RefBindingComposer = 
    /** @internal */
    class RefBindingComposer {
        constructor(parser) {
            this.parser = parser;
        }
        compose(flags, context, controller, target, instruction) {
            const expr = ensureExpression(this.parser, instruction.from, 5376 /* IsRef */);
            const binding = applyBindingBehavior(new runtime_1.RefBinding(expr, getRefTarget(target, instruction.to), context), expr, context);
            controller.addBinding(binding);
        }
    };
    RefBindingComposer = __decorate([
        instructionComposer("rj" /* refBinding */)
        /** @internal */
        ,
        __param(0, runtime_1.IExpressionParser),
        __metadata("design:paramtypes", [Object])
    ], RefBindingComposer);
    exports.RefBindingComposer = RefBindingComposer;
    let InterpolationBindingComposer = 
    /** @internal */
    class InterpolationBindingComposer {
        constructor(parser, observerLocator, platform) {
            this.parser = parser;
            this.observerLocator = observerLocator;
            this.platform = platform;
        }
        compose(flags, context, controller, target, instruction) {
            const expr = ensureExpression(this.parser, instruction.from, 2048 /* Interpolation */);
            const binding = new runtime_1.InterpolationBinding(this.observerLocator, expr, getTarget(target), instruction.to, runtime_1.BindingMode.toView, context, this.platform.domWriteQueue);
            const partBindings = binding.partBindings;
            let partBinding;
            for (let i = 0, ii = partBindings.length; ii > i; ++i) {
                partBinding = partBindings[i];
                partBindings[i] = applyBindingBehavior(partBinding, partBinding.sourceExpression, context);
            }
            controller.addBinding(binding);
        }
    };
    InterpolationBindingComposer = __decorate([
        instructionComposer("rf" /* interpolation */)
        /** @internal */
        ,
        __param(0, runtime_1.IExpressionParser),
        __param(1, runtime_1.IObserverLocator),
        __param(2, platform_1.IPlatform),
        __metadata("design:paramtypes", [Object, Object, Object])
    ], InterpolationBindingComposer);
    exports.InterpolationBindingComposer = InterpolationBindingComposer;
    let PropertyBindingComposer = 
    /** @internal */
    class PropertyBindingComposer {
        constructor(parser, observerLocator, platform) {
            this.parser = parser;
            this.observerLocator = observerLocator;
            this.platform = platform;
        }
        compose(flags, context, controller, target, instruction) {
            const expr = ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | instruction.mode);
            const binding = applyBindingBehavior(new runtime_1.PropertyBinding(expr, getTarget(target), instruction.to, instruction.mode, this.observerLocator, context, this.platform.domWriteQueue), expr, context);
            controller.addBinding(binding);
        }
    };
    PropertyBindingComposer = __decorate([
        instructionComposer("rg" /* propertyBinding */)
        /** @internal */
        ,
        __param(0, runtime_1.IExpressionParser),
        __param(1, runtime_1.IObserverLocator),
        __param(2, platform_1.IPlatform),
        __metadata("design:paramtypes", [Object, Object, Object])
    ], PropertyBindingComposer);
    exports.PropertyBindingComposer = PropertyBindingComposer;
    let IteratorBindingComposer = 
    /** @internal */
    class IteratorBindingComposer {
        constructor(parser, observerLocator, platform) {
            this.parser = parser;
            this.observerLocator = observerLocator;
            this.platform = platform;
        }
        compose(flags, context, controller, target, instruction) {
            const expr = ensureExpression(this.parser, instruction.from, 539 /* ForCommand */);
            const binding = applyBindingBehavior(new runtime_1.PropertyBinding(expr, getTarget(target), instruction.to, runtime_1.BindingMode.toView, this.observerLocator, context, this.platform.domWriteQueue), expr, context);
            controller.addBinding(binding);
        }
    };
    IteratorBindingComposer = __decorate([
        instructionComposer("rk" /* iteratorBinding */)
        /** @internal */
        ,
        __param(0, runtime_1.IExpressionParser),
        __param(1, runtime_1.IObserverLocator),
        __param(2, platform_1.IPlatform),
        __metadata("design:paramtypes", [Object, Object, Object])
    ], IteratorBindingComposer);
    exports.IteratorBindingComposer = IteratorBindingComposer;
    let behaviorExpressionIndex = 0;
    const behaviorExpressions = [];
    function applyBindingBehavior(binding, expression, locator) {
        while (expression instanceof runtime_1.BindingBehaviorExpression) {
            behaviorExpressions[behaviorExpressionIndex++] = expression;
            expression = expression.expression;
        }
        while (behaviorExpressionIndex > 0) {
            const behaviorExpression = behaviorExpressions[--behaviorExpressionIndex];
            const behaviorOrFactory = locator.get(behaviorExpression.behaviorKey);
            if (behaviorOrFactory instanceof runtime_1.BindingBehaviorFactory) {
                binding = behaviorOrFactory.construct(binding, behaviorExpression);
            }
        }
        behaviorExpressions.length = 0;
        return binding;
    }
    exports.applyBindingBehavior = applyBindingBehavior;
    let TextBindingComposer = 
    /** @internal */
    class TextBindingComposer {
        constructor(parser, observerLocator, platform) {
            this.parser = parser;
            this.observerLocator = observerLocator;
            this.platform = platform;
        }
        compose(flags, context, controller, target, instruction) {
            const next = target.nextSibling;
            if (target.nodeName === 'AU-M') {
                target.remove();
            }
            const expr = ensureExpression(this.parser, instruction.from, 2048 /* Interpolation */);
            const binding = new runtime_1.InterpolationBinding(this.observerLocator, expr, next, 'textContent', runtime_1.BindingMode.toView, context, this.platform.domWriteQueue);
            const partBindings = binding.partBindings;
            let partBinding;
            for (let i = 0, ii = partBindings.length; ii > i; ++i) {
                partBinding = partBindings[i];
                partBindings[i] = applyBindingBehavior(partBinding, partBinding.sourceExpression, context);
            }
            controller.addBinding(binding);
        }
    };
    TextBindingComposer = __decorate([
        instructionComposer("ha" /* textBinding */)
        /** @internal */
        ,
        __param(0, runtime_1.IExpressionParser),
        __param(1, runtime_1.IObserverLocator),
        __param(2, platform_1.IPlatform),
        __metadata("design:paramtypes", [Object, Object, Object])
    ], TextBindingComposer);
    exports.TextBindingComposer = TextBindingComposer;
    let ListenerBindingComposer = 
    /** @internal */
    class ListenerBindingComposer {
        constructor(parser, eventDelegator) {
            this.parser = parser;
            this.eventDelegator = eventDelegator;
        }
        compose(flags, context, controller, target, instruction) {
            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
            const expr = ensureExpression(this.parser, instruction.from, 80 /* IsEventCommand */ | (instruction.strategy + 6 /* DelegationStrategyDelta */));
            const binding = applyBindingBehavior(new listener_1.Listener(context.platform, instruction.to, instruction.strategy, expr, target, instruction.preventDefault, this.eventDelegator, context), expr, context);
            controller.addBinding(binding);
        }
    };
    ListenerBindingComposer = __decorate([
        instructionComposer("hb" /* listenerBinding */)
        /** @internal */
        ,
        __param(0, runtime_1.IExpressionParser),
        __param(1, event_delegator_1.IEventDelegator),
        __metadata("design:paramtypes", [Object, Object])
    ], ListenerBindingComposer);
    exports.ListenerBindingComposer = ListenerBindingComposer;
    let SetAttributeComposer = 
    /** @internal */
    class SetAttributeComposer {
        compose(flags, context, controller, target, instruction) {
            target.setAttribute(instruction.to, instruction.value);
        }
    };
    SetAttributeComposer = __decorate([
        instructionComposer("he" /* setAttribute */)
        /** @internal */
    ], SetAttributeComposer);
    exports.SetAttributeComposer = SetAttributeComposer;
    let SetClassAttributeComposer = class SetClassAttributeComposer {
        compose(flags, context, controller, target, instruction) {
            addClasses(target.classList, instruction.value);
        }
    };
    SetClassAttributeComposer = __decorate([
        instructionComposer("hf" /* setClassAttribute */)
    ], SetClassAttributeComposer);
    exports.SetClassAttributeComposer = SetClassAttributeComposer;
    let SetStyleAttributeComposer = class SetStyleAttributeComposer {
        compose(flags, context, controller, target, instruction) {
            target.style.cssText += instruction.value;
        }
    };
    SetStyleAttributeComposer = __decorate([
        instructionComposer("hg" /* setStyleAttribute */)
    ], SetStyleAttributeComposer);
    exports.SetStyleAttributeComposer = SetStyleAttributeComposer;
    let StylePropertyBindingComposer = 
    /** @internal */
    class StylePropertyBindingComposer {
        constructor(parser, observerLocator, platform) {
            this.parser = parser;
            this.observerLocator = observerLocator;
            this.platform = platform;
        }
        compose(flags, context, controller, target, instruction) {
            const expr = ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | runtime_1.BindingMode.toView);
            const binding = applyBindingBehavior(new runtime_1.PropertyBinding(expr, target.style, instruction.to, runtime_1.BindingMode.toView, this.observerLocator, context, this.platform.domWriteQueue), expr, context);
            controller.addBinding(binding);
        }
    };
    StylePropertyBindingComposer = __decorate([
        instructionComposer("hd" /* stylePropertyBinding */)
        /** @internal */
        ,
        __param(0, runtime_1.IExpressionParser),
        __param(1, runtime_1.IObserverLocator),
        __param(2, platform_1.IPlatform),
        __metadata("design:paramtypes", [Object, Object, Object])
    ], StylePropertyBindingComposer);
    exports.StylePropertyBindingComposer = StylePropertyBindingComposer;
    let AttributeBindingComposer = 
    /** @internal */
    class AttributeBindingComposer {
        constructor(parser, observerLocator) {
            this.parser = parser;
            this.observerLocator = observerLocator;
        }
        compose(flags, context, controller, target, instruction) {
            const expr = ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | runtime_1.BindingMode.toView);
            const binding = applyBindingBehavior(new attribute_1.AttributeBinding(expr, target, instruction.attr /* targetAttribute */, instruction.to /* targetKey */, runtime_1.BindingMode.toView, this.observerLocator, context), expr, context);
            controller.addBinding(binding);
        }
    };
    AttributeBindingComposer = __decorate([
        instructionComposer("hc" /* attributeBinding */)
        /** @internal */
        ,
        __param(0, runtime_1.IExpressionParser),
        __param(1, runtime_1.IObserverLocator),
        __metadata("design:paramtypes", [Object, Object])
    ], AttributeBindingComposer);
    exports.AttributeBindingComposer = AttributeBindingComposer;
    // http://jsben.ch/7n5Kt
    function addClasses(classList, className) {
        const len = className.length;
        let start = 0;
        for (let i = 0; i < len; ++i) {
            if (className.charCodeAt(i) === 0x20) {
                if (i !== start) {
                    classList.add(className.slice(start, i));
                }
                start = i + 1;
            }
            else if (i + 1 === len) {
                classList.add(className.slice(start));
            }
        }
    }
});
//# sourceMappingURL=composer.js.map