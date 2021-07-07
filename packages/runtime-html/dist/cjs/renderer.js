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
const slot_injectables_js_1 = require("./resources/slot-injectables.js");
const custom_attribute_js_1 = require("./resources/custom-attribute.js");
const dom_js_1 = require("./dom.js");
const controller_js_1 = require("./templating/controller.js");
const platform_js_1 = require("./platform.js");
const view_js_1 = require("./templating/view.js");
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
    constructor(
    /**
     * The name of the custom element this instruction is associated with
     */
    // in theory, Constructor of resources should be accepted too
    // though it would be unnecessary right now
    res, alias, 
    /**
     * Bindable instructions for the custom element instance
     */
    instructions, 
    /**
     * Indicates what projections are associated with the element usage
     */
    projections, 
    /**
     * Indicates whether the usage of the custom element was with a containerless attribute or not
     */
    containerless) {
        this.res = res;
        this.alias = alias;
        this.instructions = instructions;
        this.projections = projections;
        this.containerless = containerless;
        /**
         * A special property that can be used to store <au-slot/> usage information
         */
        this.auSlot = null;
    }
    get type() { return "ra" /* hydrateElement */; }
}
exports.HydrateElementInstruction = HydrateElementInstruction;
class HydrateAttributeInstruction {
    constructor(
    // in theory, Constructor of resources should be accepted too
    // though it would be unnecessary right now
    res, alias, 
    /**
     * Bindable instructions for the custom attribute instance
     */
    instructions) {
        this.res = res;
        this.alias = alias;
        this.instructions = instructions;
    }
    get type() { return "rb" /* hydrateAttribute */; }
}
exports.HydrateAttributeInstruction = HydrateAttributeInstruction;
class HydrateTemplateController {
    constructor(def, 
    // in theory, Constructor of resources should be accepted too
    // though it would be unnecessary right now
    res, alias, 
    /**
     * Bindable instructions for the template controller instance
     */
    instructions) {
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
    constructor(from, 
    /**
     * Indicates whether the value of the expression "from"
     * should be evaluated in strict mode.
     *
     * In none strict mode, "undefined" and "null" are coerced into empty string
     */
    strict) {
        this.from = from;
        this.strict = strict;
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
    render(flags, context, renderingController, target, instruction) {
        const obj = getTarget(target);
        if (obj.$observers !== void 0 && obj.$observers[instruction.to] !== void 0) {
            obj.$observers[instruction.to].setValue(instruction.value, 2 /* fromBind */);
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
    render(flags, context, renderingController, target, instruction) {
        /* eslint-disable prefer-const */
        let def;
        let Ctor;
        let component;
        let childController;
        const res = instruction.res;
        const projections = instruction.projections;
        const ctxContainer = renderingController.container;
        const container = createElementContainer(
        /* parentController */ renderingController, 
        /* host             */ target, 
        /* instruction      */ instruction, 
        /* location         */ target, 
        /* auSlotsInfo      */ projections == null ? void 0 : new slot_injectables_js_1.AuSlotsInfo(Object.keys(projections)));
        switch (typeof res) {
            case 'string':
                def = ctxContainer.find(custom_element_js_1.CustomElement, res);
                if (def == null) {
                    throw new Error(`Element ${res} is not registered in ${renderingController['name']}.`);
                }
                break;
            // constructor based instruction
            // will be enabled later if needed.
            // As both AOT + runtime based can use definition for perf
            // -----------------
            // case 'function':
            //   def = CustomElement.getDefinition(res);
            //   break;
            default:
                def = res;
        }
        Ctor = def.Type;
        component = container.invoke(Ctor);
        container.registerResolver(Ctor, new kernel_1.InstanceProvider(def.key, component));
        childController = controller_js_1.Controller.forCustomElement(
        /* root                */ renderingController.root, 
        /* context ct          */ renderingController.container, 
        /* own container       */ container, 
        /* viewModel           */ component, 
        /* host                */ target, 
        /* instructions        */ instruction, 
        /* flags               */ flags, 
        /* hydrate             */ true, 
        /* definition          */ def);
        flags = childController.flags;
        dom_js_1.setRef(target, def.key, childController);
        context.renderChildren(
        /* flags        */ flags, 
        /* instructions */ instruction.instructions, 
        /* controller   */ renderingController, 
        /* target       */ childController);
        renderingController.addChild(childController);
        /* eslint-enable prefer-const */
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
    render(flags, context, 
    /**
     * The cotroller that is currently invoking this renderer
     */
    renderingController, target, instruction) {
        /* eslint-disable prefer-const */
        let ctxContainer = renderingController.container;
        let def;
        switch (typeof instruction.res) {
            case 'string':
                def = ctxContainer.find(custom_attribute_js_1.CustomAttribute, instruction.res);
                if (def == null) {
                    throw new Error(`Attribute ${instruction.res} is not registered in ${renderingController['name']}.`);
                }
                break;
            // constructor based instruction
            // will be enabled later if needed.
            // As both AOT + runtime based can use definition for perf
            // -----------------
            // case 'function':
            //   def = CustomAttribute.getDefinition(instruction.res);
            //   break;
            default:
                def = instruction.res;
        }
        const component = invokeAttribute(
        /* attr definition  */ def, 
        /* parentController */ renderingController, 
        /* host             */ target, 
        /* instruction      */ instruction, 
        /* viewFactory      */ void 0, 
        /* location         */ void 0);
        const childController = controller_js_1.Controller.forCustomAttribute(
        /* root       */ renderingController.root, 
        /* context ct */ renderingController.container, 
        /* viewModel  */ component, 
        /* host       */ target, 
        /* flags      */ flags, 
        /* definition */ def);
        dom_js_1.setRef(target, def.key, childController);
        context.renderChildren(
        /* flags        */ flags, 
        /* instructions */ instruction.instructions, 
        /* controller   */ renderingController, 
        /* target       */ childController);
        renderingController.addChild(childController);
        /* eslint-enable prefer-const */
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
    render(flags, context, renderingController, target, instruction) {
        var _a;
        /* eslint-disable prefer-const */
        let ctxContainer = renderingController.container;
        let def;
        switch (typeof instruction.res) {
            case 'string':
                def = ctxContainer.find(custom_attribute_js_1.CustomAttribute, instruction.res);
                if (def == null) {
                    throw new Error(`Attribute ${instruction.res} is not registered in ${renderingController['name']}.`);
                }
                break;
            // constructor based instruction
            // will be enabled later if needed.
            // As both AOT + runtime based can use definition for perf
            // -----------------
            // case 'function':
            //   def = CustomAttribute.getDefinition(instruction.res);
            //   break;
            default:
                def = instruction.res;
        }
        const viewFactory = render_context_js_1.getRenderContext(instruction.def, ctxContainer).getViewFactory();
        const renderLocation = dom_js_1.convertToRenderLocation(target);
        const component = invokeAttribute(
        /* attr definition  */ def, 
        /* parentController */ renderingController, 
        /* host             */ target, 
        /* instruction      */ instruction, 
        /* viewFactory      */ viewFactory, 
        /* location         */ renderLocation);
        const childController = controller_js_1.Controller.forCustomAttribute(
        /* root         */ renderingController.root, 
        /* container ct */ renderingController.container, 
        /* viewModel    */ component, 
        /* host         */ target, 
        /* flags        */ flags, 
        /* definition   */ def);
        dom_js_1.setRef(renderLocation, def.key, childController);
        (_a = component.link) === null || _a === void 0 ? void 0 : _a.call(component, flags, context, renderingController, childController, target, instruction);
        context.renderChildren(
        /* flags        */ flags, 
        /* instructions */ instruction.instructions, 
        /* controller   */ renderingController, 
        /* target       */ childController);
        renderingController.addChild(childController);
        /* eslint-enable prefer-const */
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
    render(flags, context, rendererController, target, instruction) {
        target.remove();
        const childInstructions = instruction.instructions;
        const toBindingContext = instruction.toBindingContext;
        let childInstruction;
        let expr;
        let binding;
        for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
            childInstruction = childInstructions[i];
            expr = ensureExpression(this.parser, childInstruction.from, 48 /* IsPropertyCommand */);
            binding = applyBindingBehavior(new let_binding_js_1.LetBinding(expr, childInstruction.to, this.observerLocator, rendererController.container, toBindingContext), expr, rendererController.container);
            rendererController.addBinding(binding);
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
    render(flags, context, rendererController, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 153 /* CallCommand */);
        const binding = applyBindingBehavior(new call_binding_js_1.CallBinding(expr, getTarget(target), instruction.to, this.observerLocator, rendererController.container), expr, rendererController.container);
        rendererController.addBinding(binding);
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
    render(flags, context, rendererController, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 5376 /* IsRef */);
        const binding = applyBindingBehavior(new ref_binding_js_1.RefBinding(expr, getRefTarget(target, instruction.to), rendererController.container), expr, rendererController.container);
        rendererController.addBinding(binding);
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
    render(flags, context, renderingController, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 2048 /* Interpolation */);
        const binding = new interpolation_binding_js_1.InterpolationBinding(this.observerLocator, expr, getTarget(target), instruction.to, runtime_1.BindingMode.toView, renderingController.container, this.platform.domWriteQueue);
        const partBindings = binding.partBindings;
        const ii = partBindings.length;
        let i = 0;
        let partBinding;
        for (; ii > i; ++i) {
            partBinding = partBindings[i];
            partBindings[i] = applyBindingBehavior(partBinding, partBinding.sourceExpression, renderingController.container);
        }
        renderingController.addBinding(binding);
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
    render(flags, context, renderingController, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | instruction.mode);
        const binding = applyBindingBehavior(new property_binding_js_1.PropertyBinding(expr, getTarget(target), instruction.to, instruction.mode, this.observerLocator, renderingController.container, this.platform.domWriteQueue), expr, renderingController.container);
        renderingController.addBinding(binding);
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
    render(flags, context, renderingController, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 539 /* ForCommand */);
        const binding = applyBindingBehavior(new property_binding_js_1.PropertyBinding(expr, getTarget(target), instruction.to, runtime_1.BindingMode.toView, this.observerLocator, renderingController.container, this.platform.domWriteQueue), expr, renderingController.container);
        renderingController.addBinding(binding);
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
    render(flags, context, renderingController, target, instruction) {
        const next = target.nextSibling;
        const parent = target.parentNode;
        const doc = this.platform.document;
        const expr = ensureExpression(this.parser, instruction.from, 2048 /* Interpolation */);
        const staticParts = expr.parts;
        const dynamicParts = expr.expressions;
        const ii = dynamicParts.length;
        let i = 0;
        let text = staticParts[0];
        if (text !== '') {
            parent.insertBefore(doc.createTextNode(text), next);
        }
        for (; ii > i; ++i) {
            // each of the dynamic expression of an interpolation
            // will be mapped to a ContentBinding
            renderingController.addBinding(applyBindingBehavior(new interpolation_binding_js_1.ContentBinding(dynamicParts[i], 
            // using a text node instead of comment, as a mean to:
            // support seamless transition between a html node, or a text
            // reduce the noise in the template, caused by html comment
            parent.insertBefore(doc.createTextNode(''), next), renderingController.container, this.observerLocator, this.platform, instruction.strict), dynamicParts[i], renderingController.container));
            // while each of the static part of an interpolation
            // will just be a text node
            text = staticParts[i + 1];
            if (text !== '') {
                parent.insertBefore(doc.createTextNode(text), next);
            }
        }
        if (target.nodeName === 'AU-M') {
            target.remove();
        }
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
    render(flags, context, renderingController, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 80 /* IsEventCommand */ | (instruction.strategy + 6 /* DelegationStrategyDelta */));
        const binding = applyBindingBehavior(new listener_js_1.Listener(renderingController.platform, instruction.to, instruction.strategy, expr, target, instruction.preventDefault, this.eventDelegator, renderingController.container), expr, renderingController.container);
        renderingController.addBinding(binding);
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
    render(flags, context, renderingController, target, instruction) {
        target.setAttribute(instruction.to, instruction.value);
    }
};
SetAttributeRenderer = __decorate([
    renderer("he" /* setAttribute */)
    /** @internal */
], SetAttributeRenderer);
exports.SetAttributeRenderer = SetAttributeRenderer;
let SetClassAttributeRenderer = class SetClassAttributeRenderer {
    render(flags, context, renderingController, target, instruction) {
        addClasses(target.classList, instruction.value);
    }
};
SetClassAttributeRenderer = __decorate([
    renderer("hf" /* setClassAttribute */)
], SetClassAttributeRenderer);
exports.SetClassAttributeRenderer = SetClassAttributeRenderer;
let SetStyleAttributeRenderer = class SetStyleAttributeRenderer {
    render(flags, context, renderingController, target, instruction) {
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
    render(flags, context, renderingController, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | runtime_1.BindingMode.toView);
        const binding = applyBindingBehavior(new property_binding_js_1.PropertyBinding(expr, target.style, instruction.to, runtime_1.BindingMode.toView, this.observerLocator, renderingController.container, this.platform.domWriteQueue), expr, renderingController.container);
        renderingController.addBinding(binding);
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
    render(flags, context, renderingController, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | runtime_1.BindingMode.toView);
        const binding = applyBindingBehavior(new attribute_js_1.AttributeBinding(expr, target, instruction.attr /* targetAttribute */, instruction.to /* targetKey */, runtime_1.BindingMode.toView, this.observerLocator, renderingController.container), expr, renderingController.container);
        renderingController.addBinding(binding);
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
const elProviderName = 'ElementProvider';
const controllerProviderName = 'IController';
const instructionProviderName = 'IInstruction';
const locationProviderName = 'IRenderLocation';
const slotInfoProviderName = 'IAuSlotsInfo';
function createElementContainer(renderingController, host, instruction, location, auSlotsInfo) {
    const p = renderingController.platform;
    const container = renderingController.container.createChild();
    // todo:
    // both node provider and location provider may not be allowed to throw
    // if there's no value associated, unlike InstanceProvider
    // reason being some custom element can have `containerless` attribute on them
    // causing the host to disappear, and replace by a location instead
    container.registerResolver(p.HTMLElement, container.registerResolver(p.Element, container.registerResolver(p.Node, container.registerResolver(dom_js_1.INode, new kernel_1.InstanceProvider(elProviderName, host)))));
    container.registerResolver(controller_js_1.IController, new kernel_1.InstanceProvider(controllerProviderName, renderingController));
    container.registerResolver(exports.IInstruction, new kernel_1.InstanceProvider(instructionProviderName, instruction));
    container.registerResolver(dom_js_1.IRenderLocation, location == null
        ? noLocationProvider
        : new kernel_1.InstanceProvider(locationProviderName, location));
    container.registerResolver(view_js_1.IViewFactory, noViewFactoryProvider);
    container.registerResolver(slot_injectables_js_1.IAuSlotsInfo, auSlotsInfo == null
        ? noAuSlotProvider
        : new kernel_1.InstanceProvider(slotInfoProviderName, auSlotsInfo));
    return container;
}
class ViewFactoryProvider {
    constructor(
    /**
     * The factory instance that this provider will resolves to,
     * until explicitly overridden by prepare call
     */
    factory) {
        this.f = factory;
    }
    get $isResolver() { return true; }
    resolve() {
        const f = this.f;
        if (f === null) {
            throw new Error('Cannot resolve ViewFactory before the provider was prepared.');
        }
        if (typeof f.name !== 'string' || f.name.length === 0) {
            throw new Error('Cannot resolve ViewFactory without a (valid) name.');
        }
        return f;
    }
}
function invokeAttribute(definition, renderingController, host, instruction, viewFactory, location, auSlotsInfo) {
    const p = renderingController.platform;
    const container = renderingController.container.createChild();
    container.registerResolver(p.HTMLElement, container.registerResolver(p.Element, container.registerResolver(p.Node, container.registerResolver(dom_js_1.INode, new kernel_1.InstanceProvider(elProviderName, host)))));
    container.registerResolver(controller_js_1.IController, new kernel_1.InstanceProvider(controllerProviderName, renderingController));
    container.registerResolver(exports.IInstruction, new kernel_1.InstanceProvider(instructionProviderName, instruction));
    container.registerResolver(dom_js_1.IRenderLocation, location == null
        ? noLocationProvider
        : new kernel_1.InstanceProvider(locationProviderName, location));
    container.registerResolver(view_js_1.IViewFactory, viewFactory == null
        ? noViewFactoryProvider
        : new ViewFactoryProvider(viewFactory));
    container.registerResolver(slot_injectables_js_1.IAuSlotsInfo, auSlotsInfo == null
        ? noAuSlotProvider
        : new kernel_1.InstanceProvider(slotInfoProviderName, auSlotsInfo));
    return container.invoke(definition.Type);
}
const noLocationProvider = new kernel_1.InstanceProvider(locationProviderName);
const noViewFactoryProvider = new ViewFactoryProvider(null);
const noAuSlotProvider = new kernel_1.InstanceProvider(slotInfoProviderName, new slot_injectables_js_1.AuSlotsInfo(kernel_1.emptyArray));
//# sourceMappingURL=renderer.js.map