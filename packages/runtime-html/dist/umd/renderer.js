var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
        define(["require", "exports", "@aurelia/kernel", "@aurelia/runtime", "./binding/call-binding.js", "./binding/attribute.js", "./binding/interpolation-binding.js", "./binding/let-binding.js", "./binding/property-binding.js", "./binding/ref-binding.js", "./binding/listener.js", "./observation/event-delegator.js", "./resources/custom-element.js", "./templating/render-context.js", "./resources/custom-attribute.js", "./dom.js", "./templating/controller.js", "./platform.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AttributeBindingRenderer = exports.StylePropertyBindingRenderer = exports.SetStyleAttributeRenderer = exports.SetClassAttributeRenderer = exports.SetAttributeRenderer = exports.ListenerBindingRenderer = exports.TextBindingRenderer = exports.applyBindingBehavior = exports.IteratorBindingRenderer = exports.PropertyBindingRenderer = exports.InterpolationBindingRenderer = exports.RefBindingRenderer = exports.CallBindingRenderer = exports.LetElementRenderer = exports.TemplateControllerRenderer = exports.CustomAttributeRenderer = exports.CustomElementRenderer = exports.SetPropertyRenderer = exports.renderer = exports.IRenderer = exports.ITemplateCompiler = exports.AttributeBindingInstruction = exports.SetStyleAttributeInstruction = exports.SetClassAttributeInstruction = exports.SetAttributeInstruction = exports.StylePropertyBindingInstruction = exports.ListenerBindingInstruction = exports.TextBindingInstruction = exports.LetBindingInstruction = exports.HydrateLetElementInstruction = exports.HydrateTemplateController = exports.HydrateAttributeInstruction = exports.HydrateElementInstruction = exports.SetPropertyInstruction = exports.RefBindingInstruction = exports.CallBindingInstruction = exports.IteratorBindingInstruction = exports.PropertyBindingInstruction = exports.InterpolationInstruction = exports.isInstruction = exports.IInstruction = exports.InstructionType = void 0;
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    const call_binding_js_1 = require("./binding/call-binding.js");
    const attribute_js_1 = require("./binding/attribute.js");
    const interpolation_binding_js_1 = require("./binding/interpolation-binding.js");
    const let_binding_js_1 = require("./binding/let-binding.js");
    const property_binding_js_1 = require("./binding/property-binding.js");
    const ref_binding_js_1 = require("./binding/ref-binding.js");
    const listener_js_1 = require("./binding/listener.js");
    const event_delegator_js_1 = require("./observation/event-delegator.js");
    const custom_element_js_1 = require("./resources/custom-element.js");
    const render_context_js_1 = require("./templating/render-context.js");
    const custom_attribute_js_1 = require("./resources/custom-attribute.js");
    const dom_js_1 = require("./dom.js");
    const controller_js_1 = require("./templating/controller.js");
    const platform_js_1 = require("./platform.js");
    var InstructionType;
    (function (InstructionType) {
        InstructionType["hydrateElement"] = "ra";
        InstructionType["hydrateAttribute"] = "rb";
        InstructionType["hydrateTemplateController"] = "rc";
        InstructionType["hydrateLetElement"] = "rd";
        InstructionType["setProperty"] = "re";
        InstructionType["interpolation"] = "rf";
        InstructionType["propertyBinding"] = "rg";
        InstructionType["callBinding"] = "rh";
        InstructionType["letBinding"] = "ri";
        InstructionType["refBinding"] = "rj";
        InstructionType["iteratorBinding"] = "rk";
        InstructionType["textBinding"] = "ha";
        InstructionType["listenerBinding"] = "hb";
        InstructionType["attributeBinding"] = "hc";
        InstructionType["stylePropertyBinding"] = "hd";
        InstructionType["setAttribute"] = "he";
        InstructionType["setClassAttribute"] = "hf";
        InstructionType["setStyleAttribute"] = "hg";
    })(InstructionType = exports.InstructionType || (exports.InstructionType = {}));
    exports.IInstruction = kernel_1.DI.createInterface('Instruction');
    function isInstruction(value) {
        const type = value.type;
        return typeof type === 'string' && type.length === 2;
    }
    exports.isInstruction = isInstruction;
    class InterpolationInstruction {
        constructor(from, to) {
            this.from = from;
            this.to = to;
        }
        get type() { return "rf" /* interpolation */; }
    }
    exports.InterpolationInstruction = InterpolationInstruction;
    class PropertyBindingInstruction {
        constructor(from, to, mode) {
            this.from = from;
            this.to = to;
            this.mode = mode;
        }
        get type() { return "rg" /* propertyBinding */; }
    }
    exports.PropertyBindingInstruction = PropertyBindingInstruction;
    class IteratorBindingInstruction {
        constructor(from, to) {
            this.from = from;
            this.to = to;
        }
        get type() { return "rk" /* iteratorBinding */; }
    }
    exports.IteratorBindingInstruction = IteratorBindingInstruction;
    class CallBindingInstruction {
        constructor(from, to) {
            this.from = from;
            this.to = to;
        }
        get type() { return "rh" /* callBinding */; }
    }
    exports.CallBindingInstruction = CallBindingInstruction;
    class RefBindingInstruction {
        constructor(from, to) {
            this.from = from;
            this.to = to;
        }
        get type() { return "rj" /* refBinding */; }
    }
    exports.RefBindingInstruction = RefBindingInstruction;
    class SetPropertyInstruction {
        constructor(value, to) {
            this.value = value;
            this.to = to;
        }
        get type() { return "re" /* setProperty */; }
    }
    exports.SetPropertyInstruction = SetPropertyInstruction;
    class HydrateElementInstruction {
        constructor(res, alias, instructions, slotInfo) {
            this.res = res;
            this.alias = alias;
            this.instructions = instructions;
            this.slotInfo = slotInfo;
        }
        get type() { return "ra" /* hydrateElement */; }
    }
    exports.HydrateElementInstruction = HydrateElementInstruction;
    class HydrateAttributeInstruction {
        constructor(res, alias, instructions) {
            this.res = res;
            this.alias = alias;
            this.instructions = instructions;
        }
        get type() { return "rb" /* hydrateAttribute */; }
    }
    exports.HydrateAttributeInstruction = HydrateAttributeInstruction;
    class HydrateTemplateController {
        constructor(def, res, alias, instructions) {
            this.def = def;
            this.res = res;
            this.alias = alias;
            this.instructions = instructions;
        }
        get type() { return "rc" /* hydrateTemplateController */; }
    }
    exports.HydrateTemplateController = HydrateTemplateController;
    class HydrateLetElementInstruction {
        constructor(instructions, toBindingContext) {
            this.instructions = instructions;
            this.toBindingContext = toBindingContext;
        }
        get type() { return "rd" /* hydrateLetElement */; }
    }
    exports.HydrateLetElementInstruction = HydrateLetElementInstruction;
    class LetBindingInstruction {
        constructor(from, to) {
            this.from = from;
            this.to = to;
        }
        get type() { return "ri" /* letBinding */; }
    }
    exports.LetBindingInstruction = LetBindingInstruction;
    class TextBindingInstruction {
        constructor(from) {
            this.from = from;
        }
        get type() { return "ha" /* textBinding */; }
    }
    exports.TextBindingInstruction = TextBindingInstruction;
    class ListenerBindingInstruction {
        constructor(from, to, preventDefault, strategy) {
            this.from = from;
            this.to = to;
            this.preventDefault = preventDefault;
            this.strategy = strategy;
        }
        get type() { return "hb" /* listenerBinding */; }
    }
    exports.ListenerBindingInstruction = ListenerBindingInstruction;
    class StylePropertyBindingInstruction {
        constructor(from, to) {
            this.from = from;
            this.to = to;
        }
        get type() { return "hd" /* stylePropertyBinding */; }
    }
    exports.StylePropertyBindingInstruction = StylePropertyBindingInstruction;
    class SetAttributeInstruction {
        constructor(value, to) {
            this.value = value;
            this.to = to;
        }
        get type() { return "he" /* setAttribute */; }
    }
    exports.SetAttributeInstruction = SetAttributeInstruction;
    class SetClassAttributeInstruction {
        constructor(value) {
            this.value = value;
            this.type = "hf" /* setClassAttribute */;
        }
    }
    exports.SetClassAttributeInstruction = SetClassAttributeInstruction;
    class SetStyleAttributeInstruction {
        constructor(value) {
            this.value = value;
            this.type = "hg" /* setStyleAttribute */;
        }
    }
    exports.SetStyleAttributeInstruction = SetStyleAttributeInstruction;
    class AttributeBindingInstruction {
        constructor(
        /**
         * `attr` and `to` have the same value on a normal attribute
         * Will be different on `class` and `style`
         * on `class`: attr = `class` (from binding command), to = attribute name
         * on `style`: attr = `style` (from binding command), to = attribute name
         */
        attr, from, to) {
            this.attr = attr;
            this.from = from;
            this.to = to;
        }
        get type() { return "hc" /* attributeBinding */; }
    }
    exports.AttributeBindingInstruction = AttributeBindingInstruction;
    exports.ITemplateCompiler = kernel_1.DI.createInterface('ITemplateCompiler');
    exports.IRenderer = kernel_1.DI.createInterface('IRenderer');
    function renderer(instructionType) {
        return function decorator(target) {
            // wrap the constructor to set the instructionType to the instance (for better performance than when set on the prototype)
            const decoratedTarget = function (...args) {
                const instance = new target(...args);
                instance.instructionType = instructionType;
                return instance;
            };
            // make sure we register the decorated constructor with DI
            decoratedTarget.register = function register(container) {
                kernel_1.Registration.singleton(exports.IRenderer, decoratedTarget).register(container);
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
    exports.renderer = renderer;
    function ensureExpression(parser, srcOrExpr, bindingType) {
        if (typeof srcOrExpr === 'string') {
            return parser.parse(srcOrExpr, bindingType);
        }
        return srcOrExpr;
    }
    function getTarget(potentialTarget) {
        if (potentialTarget.viewModel != null) {
            return potentialTarget.viewModel;
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
                return custom_element_js_1.CustomElement.for(refHost);
            case 'view':
                // todo: returns node sequences for fun?
                throw new Error('Not supported API');
            case 'view-model':
                // this means it supports returning undefined
                return custom_element_js_1.CustomElement.for(refHost).viewModel;
            default: {
                const caController = custom_attribute_js_1.CustomAttribute.for(refHost, refTargetName);
                if (caController !== void 0) {
                    return caController.viewModel;
                }
                const ceController = custom_element_js_1.CustomElement.for(refHost, { name: refTargetName });
                if (ceController === void 0) {
                    throw new Error(`Attempted to reference "${refTargetName}", but it was not found amongst the target's API.`);
                }
                return ceController.viewModel;
            }
        }
    }
    let SetPropertyRenderer = 
    /** @internal */
    class SetPropertyRenderer {
        render(flags, context, controller, target, instruction) {
            const obj = getTarget(target);
            if (obj.$observers !== void 0 && obj.$observers[instruction.to] !== void 0) {
                obj.$observers[instruction.to].setValue(instruction.value, 32 /* fromBind */);
            }
            else {
                obj[instruction.to] = instruction.value;
            }
        }
    };
    SetPropertyRenderer = __decorate([
        renderer("re" /* setProperty */)
        /** @internal */
    ], SetPropertyRenderer);
    exports.SetPropertyRenderer = SetPropertyRenderer;
    let CustomElementRenderer = 
    /** @internal */
    class CustomElementRenderer {
        render(flags, context, controller, target, instruction) {
            let viewFactory;
            const slotInfo = instruction.slotInfo;
            if (slotInfo !== null) {
                const projectionCtx = slotInfo.projectionContext;
                viewFactory = render_context_js_1.getRenderContext(projectionCtx.content, context).getViewFactory(void 0, slotInfo.type, projectionCtx.scope);
            }
            const factory = context.getComponentFactory(
            /* parentController */ controller, 
            /* host             */ target, 
            /* instruction      */ instruction, 
            /* viewFactory      */ viewFactory, 
            /* location         */ target);
            const key = custom_element_js_1.CustomElement.keyFrom(instruction.res);
            const component = factory.createComponent(key);
            const childController = controller_js_1.Controller.forCustomElement(
            /* root                */ controller.root, 
            /* container           */ context, 
            /* viewModel           */ component, 
            /* host                */ target, 
            /* targetedProjections */ context.getProjectionFor(instruction), 
            /* flags               */ flags);
            flags = childController.flags;
            kernel_1.Metadata.define(key, childController, target);
            context.renderChildren(
            /* flags        */ flags, 
            /* instructions */ instruction.instructions, 
            /* controller   */ controller, 
            /* target       */ childController);
            controller.addController(childController);
            factory.dispose();
        }
    };
    CustomElementRenderer = __decorate([
        renderer("ra" /* hydrateElement */)
        /** @internal */
    ], CustomElementRenderer);
    exports.CustomElementRenderer = CustomElementRenderer;
    let CustomAttributeRenderer = 
    /** @internal */
    class CustomAttributeRenderer {
        render(flags, context, controller, target, instruction) {
            const factory = context.getComponentFactory(
            /* parentController */ controller, 
            /* host             */ target, 
            /* instruction      */ instruction, 
            /* viewFactory      */ void 0, 
            /* location         */ void 0);
            const key = custom_attribute_js_1.CustomAttribute.keyFrom(instruction.res);
            const component = factory.createComponent(key);
            const childController = controller_js_1.Controller.forCustomAttribute(
            /* root      */ controller.root, 
            /* container */ context, 
            /* viewModel */ component, 
            /* host      */ target, 
            /* flags     */ flags);
            kernel_1.Metadata.define(key, childController, target);
            context.renderChildren(
            /* flags        */ flags, 
            /* instructions */ instruction.instructions, 
            /* controller   */ controller, 
            /* target       */ childController);
            controller.addController(childController);
            factory.dispose();
        }
    };
    CustomAttributeRenderer = __decorate([
        renderer("rb" /* hydrateAttribute */)
        /** @internal */
    ], CustomAttributeRenderer);
    exports.CustomAttributeRenderer = CustomAttributeRenderer;
    let TemplateControllerRenderer = 
    /** @internal */
    class TemplateControllerRenderer {
        render(flags, context, controller, target, instruction) {
            var _a;
            const viewFactory = render_context_js_1.getRenderContext(instruction.def, context).getViewFactory();
            const renderLocation = dom_js_1.convertToRenderLocation(target);
            const componentFactory = context.getComponentFactory(
            /* parentController */ controller, 
            /* host             */ target, 
            /* instruction      */ instruction, 
            /* viewFactory      */ viewFactory, 
            /* location         */ renderLocation);
            const key = custom_attribute_js_1.CustomAttribute.keyFrom(instruction.res);
            const component = componentFactory.createComponent(key);
            const childController = controller_js_1.Controller.forCustomAttribute(
            /* root      */ controller.root, 
            /* container */ context, 
            /* viewModel */ component, 
            /* host      */ target, 
            /* flags     */ flags);
            kernel_1.Metadata.define(key, childController, renderLocation);
            (_a = component.link) === null || _a === void 0 ? void 0 : _a.call(component, flags, context, controller, childController, target, instruction);
            context.renderChildren(
            /* flags        */ flags, 
            /* instructions */ instruction.instructions, 
            /* controller   */ controller, 
            /* target       */ childController);
            controller.addController(childController);
            componentFactory.dispose();
        }
    };
    TemplateControllerRenderer = __decorate([
        renderer("rc" /* hydrateTemplateController */)
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
            target.remove();
            const childInstructions = instruction.instructions;
            const toBindingContext = instruction.toBindingContext;
            let childInstruction;
            let expr;
            let binding;
            for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
                childInstruction = childInstructions[i];
                expr = ensureExpression(this.parser, childInstruction.from, 48 /* IsPropertyCommand */);
                binding = applyBindingBehavior(new let_binding_js_1.LetBinding(expr, childInstruction.to, this.observerLocator, context, toBindingContext), expr, context);
                controller.addBinding(binding);
            }
        }
    };
    LetElementRenderer = __decorate([
        renderer("rd" /* hydrateLetElement */)
        /** @internal */
        ,
        __param(0, runtime_1.IExpressionParser),
        __param(1, runtime_1.IObserverLocator)
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
            const binding = applyBindingBehavior(new call_binding_js_1.CallBinding(expr, getTarget(target), instruction.to, this.observerLocator, context), expr, context);
            controller.addBinding(binding);
        }
    };
    CallBindingRenderer = __decorate([
        renderer("rh" /* callBinding */)
        /** @internal */
        ,
        __param(0, runtime_1.IExpressionParser),
        __param(1, runtime_1.IObserverLocator)
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
            const binding = applyBindingBehavior(new ref_binding_js_1.RefBinding(expr, getRefTarget(target, instruction.to), context), expr, context);
            controller.addBinding(binding);
        }
    };
    RefBindingRenderer = __decorate([
        renderer("rj" /* refBinding */)
        /** @internal */
        ,
        __param(0, runtime_1.IExpressionParser)
    ], RefBindingRenderer);
    exports.RefBindingRenderer = RefBindingRenderer;
    let InterpolationBindingRenderer = 
    /** @internal */
    class InterpolationBindingRenderer {
        constructor(parser, observerLocator, platform) {
            this.parser = parser;
            this.observerLocator = observerLocator;
            this.platform = platform;
        }
        render(flags, context, controller, target, instruction) {
            const expr = ensureExpression(this.parser, instruction.from, 2048 /* Interpolation */);
            const binding = new interpolation_binding_js_1.InterpolationBinding(this.observerLocator, expr, getTarget(target), instruction.to, runtime_1.BindingMode.toView, context, this.platform.domWriteQueue);
            const partBindings = binding.partBindings;
            let partBinding;
            for (let i = 0, ii = partBindings.length; ii > i; ++i) {
                partBinding = partBindings[i];
                partBindings[i] = applyBindingBehavior(partBinding, partBinding.sourceExpression, context);
            }
            controller.addBinding(binding);
        }
    };
    InterpolationBindingRenderer = __decorate([
        renderer("rf" /* interpolation */)
        /** @internal */
        ,
        __param(0, runtime_1.IExpressionParser),
        __param(1, runtime_1.IObserverLocator),
        __param(2, platform_js_1.IPlatform)
    ], InterpolationBindingRenderer);
    exports.InterpolationBindingRenderer = InterpolationBindingRenderer;
    let PropertyBindingRenderer = 
    /** @internal */
    class PropertyBindingRenderer {
        constructor(parser, observerLocator, platform) {
            this.parser = parser;
            this.observerLocator = observerLocator;
            this.platform = platform;
        }
        render(flags, context, controller, target, instruction) {
            const expr = ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | instruction.mode);
            const binding = applyBindingBehavior(new property_binding_js_1.PropertyBinding(expr, getTarget(target), instruction.to, instruction.mode, this.observerLocator, context, this.platform.domWriteQueue), expr, context);
            controller.addBinding(binding);
        }
    };
    PropertyBindingRenderer = __decorate([
        renderer("rg" /* propertyBinding */)
        /** @internal */
        ,
        __param(0, runtime_1.IExpressionParser),
        __param(1, runtime_1.IObserverLocator),
        __param(2, platform_js_1.IPlatform)
    ], PropertyBindingRenderer);
    exports.PropertyBindingRenderer = PropertyBindingRenderer;
    let IteratorBindingRenderer = 
    /** @internal */
    class IteratorBindingRenderer {
        constructor(parser, observerLocator, platform) {
            this.parser = parser;
            this.observerLocator = observerLocator;
            this.platform = platform;
        }
        render(flags, context, controller, target, instruction) {
            const expr = ensureExpression(this.parser, instruction.from, 539 /* ForCommand */);
            const binding = applyBindingBehavior(new property_binding_js_1.PropertyBinding(expr, getTarget(target), instruction.to, runtime_1.BindingMode.toView, this.observerLocator, context, this.platform.domWriteQueue), expr, context);
            controller.addBinding(binding);
        }
    };
    IteratorBindingRenderer = __decorate([
        renderer("rk" /* iteratorBinding */)
        /** @internal */
        ,
        __param(0, runtime_1.IExpressionParser),
        __param(1, runtime_1.IObserverLocator),
        __param(2, platform_js_1.IPlatform)
    ], IteratorBindingRenderer);
    exports.IteratorBindingRenderer = IteratorBindingRenderer;
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
    let TextBindingRenderer = 
    /** @internal */
    class TextBindingRenderer {
        constructor(parser, observerLocator, platform) {
            this.parser = parser;
            this.observerLocator = observerLocator;
            this.platform = platform;
        }
        render(flags, context, controller, target, instruction) {
            const next = target.nextSibling;
            if (target.nodeName === 'AU-M') {
                target.remove();
            }
            const expr = ensureExpression(this.parser, instruction.from, 2048 /* Interpolation */);
            const binding = new interpolation_binding_js_1.InterpolationBinding(this.observerLocator, expr, next, 'textContent', runtime_1.BindingMode.toView, context, this.platform.domWriteQueue);
            const partBindings = binding.partBindings;
            let partBinding;
            for (let i = 0, ii = partBindings.length; ii > i; ++i) {
                partBinding = partBindings[i];
                partBindings[i] = applyBindingBehavior(partBinding, partBinding.sourceExpression, context);
            }
            controller.addBinding(binding);
        }
    };
    TextBindingRenderer = __decorate([
        renderer("ha" /* textBinding */)
        /** @internal */
        ,
        __param(0, runtime_1.IExpressionParser),
        __param(1, runtime_1.IObserverLocator),
        __param(2, platform_js_1.IPlatform)
    ], TextBindingRenderer);
    exports.TextBindingRenderer = TextBindingRenderer;
    let ListenerBindingRenderer = 
    /** @internal */
    class ListenerBindingRenderer {
        constructor(parser, eventDelegator) {
            this.parser = parser;
            this.eventDelegator = eventDelegator;
        }
        render(flags, context, controller, target, instruction) {
            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
            const expr = ensureExpression(this.parser, instruction.from, 80 /* IsEventCommand */ | (instruction.strategy + 6 /* DelegationStrategyDelta */));
            const binding = applyBindingBehavior(new listener_js_1.Listener(context.platform, instruction.to, instruction.strategy, expr, target, instruction.preventDefault, this.eventDelegator, context), expr, context);
            controller.addBinding(binding);
        }
    };
    ListenerBindingRenderer = __decorate([
        renderer("hb" /* listenerBinding */)
        /** @internal */
        ,
        __param(0, runtime_1.IExpressionParser),
        __param(1, event_delegator_js_1.IEventDelegator)
    ], ListenerBindingRenderer);
    exports.ListenerBindingRenderer = ListenerBindingRenderer;
    let SetAttributeRenderer = 
    /** @internal */
    class SetAttributeRenderer {
        render(flags, context, controller, target, instruction) {
            target.setAttribute(instruction.to, instruction.value);
        }
    };
    SetAttributeRenderer = __decorate([
        renderer("he" /* setAttribute */)
        /** @internal */
    ], SetAttributeRenderer);
    exports.SetAttributeRenderer = SetAttributeRenderer;
    let SetClassAttributeRenderer = class SetClassAttributeRenderer {
        render(flags, context, controller, target, instruction) {
            addClasses(target.classList, instruction.value);
        }
    };
    SetClassAttributeRenderer = __decorate([
        renderer("hf" /* setClassAttribute */)
    ], SetClassAttributeRenderer);
    exports.SetClassAttributeRenderer = SetClassAttributeRenderer;
    let SetStyleAttributeRenderer = class SetStyleAttributeRenderer {
        render(flags, context, controller, target, instruction) {
            target.style.cssText += instruction.value;
        }
    };
    SetStyleAttributeRenderer = __decorate([
        renderer("hg" /* setStyleAttribute */)
    ], SetStyleAttributeRenderer);
    exports.SetStyleAttributeRenderer = SetStyleAttributeRenderer;
    let StylePropertyBindingRenderer = 
    /** @internal */
    class StylePropertyBindingRenderer {
        constructor(parser, observerLocator, platform) {
            this.parser = parser;
            this.observerLocator = observerLocator;
            this.platform = platform;
        }
        render(flags, context, controller, target, instruction) {
            const expr = ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | runtime_1.BindingMode.toView);
            const binding = applyBindingBehavior(new property_binding_js_1.PropertyBinding(expr, target.style, instruction.to, runtime_1.BindingMode.toView, this.observerLocator, context, this.platform.domWriteQueue), expr, context);
            controller.addBinding(binding);
        }
    };
    StylePropertyBindingRenderer = __decorate([
        renderer("hd" /* stylePropertyBinding */)
        /** @internal */
        ,
        __param(0, runtime_1.IExpressionParser),
        __param(1, runtime_1.IObserverLocator),
        __param(2, platform_js_1.IPlatform)
    ], StylePropertyBindingRenderer);
    exports.StylePropertyBindingRenderer = StylePropertyBindingRenderer;
    let AttributeBindingRenderer = 
    /** @internal */
    class AttributeBindingRenderer {
        constructor(parser, observerLocator) {
            this.parser = parser;
            this.observerLocator = observerLocator;
        }
        render(flags, context, controller, target, instruction) {
            const expr = ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | runtime_1.BindingMode.toView);
            const binding = applyBindingBehavior(new attribute_js_1.AttributeBinding(expr, target, instruction.attr /* targetAttribute */, instruction.to /* targetKey */, runtime_1.BindingMode.toView, this.observerLocator, context), expr, context);
            controller.addBinding(binding);
        }
    };
    AttributeBindingRenderer = __decorate([
        renderer("hc" /* attributeBinding */)
        /** @internal */
        ,
        __param(0, runtime_1.IExpressionParser),
        __param(1, runtime_1.IObserverLocator)
    ], AttributeBindingRenderer);
    exports.AttributeBindingRenderer = AttributeBindingRenderer;
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
//# sourceMappingURL=renderer.js.map