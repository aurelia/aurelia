var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Metadata, Registration, DI } from '@aurelia/kernel';
import { BindingMode, IExpressionParser, IObserverLocator, BindingBehaviorExpression, BindingBehaviorFactory, } from '@aurelia/runtime';
import { CallBinding } from './binding/call-binding.js';
import { AttributeBinding } from './binding/attribute.js';
import { InterpolationBinding, ContentBinding } from './binding/interpolation-binding.js';
import { LetBinding } from './binding/let-binding.js';
import { PropertyBinding } from './binding/property-binding.js';
import { RefBinding } from './binding/ref-binding.js';
import { Listener } from './binding/listener.js';
import { IEventDelegator } from './observation/event-delegator.js';
import { CustomElement } from './resources/custom-element.js';
import { getRenderContext } from './templating/render-context.js';
import { AuSlotsInfo } from './resources/custom-elements/au-slot.js';
import { CustomAttribute } from './resources/custom-attribute.js';
import { convertToRenderLocation, setRef } from './dom.js';
import { Controller } from './templating/controller.js';
import { IPlatform } from './platform.js';
export var InstructionType;
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
})(InstructionType || (InstructionType = {}));
export const IInstruction = DI.createInterface('Instruction');
export function isInstruction(value) {
    const type = value.type;
    return typeof type === 'string' && type.length === 2;
}
export class InterpolationInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
    get type() { return "rf" /* interpolation */; }
}
export class PropertyBindingInstruction {
    constructor(from, to, mode) {
        this.from = from;
        this.to = to;
        this.mode = mode;
    }
    get type() { return "rg" /* propertyBinding */; }
}
export class IteratorBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
    get type() { return "rk" /* iteratorBinding */; }
}
export class CallBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
    get type() { return "rh" /* callBinding */; }
}
export class RefBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
    get type() { return "rj" /* refBinding */; }
}
export class SetPropertyInstruction {
    constructor(value, to) {
        this.value = value;
        this.to = to;
    }
    get type() { return "re" /* setProperty */; }
}
export class HydrateElementInstruction {
    constructor(res, alias, instructions, slotInfo) {
        this.res = res;
        this.alias = alias;
        this.instructions = instructions;
        this.slotInfo = slotInfo;
    }
    get type() { return "ra" /* hydrateElement */; }
}
export class HydrateAttributeInstruction {
    constructor(res, alias, instructions) {
        this.res = res;
        this.alias = alias;
        this.instructions = instructions;
    }
    get type() { return "rb" /* hydrateAttribute */; }
}
export class HydrateTemplateController {
    constructor(def, res, alias, instructions) {
        this.def = def;
        this.res = res;
        this.alias = alias;
        this.instructions = instructions;
    }
    get type() { return "rc" /* hydrateTemplateController */; }
}
export class HydrateLetElementInstruction {
    constructor(instructions, toBindingContext) {
        this.instructions = instructions;
        this.toBindingContext = toBindingContext;
    }
    get type() { return "rd" /* hydrateLetElement */; }
}
export class LetBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
    get type() { return "ri" /* letBinding */; }
}
export class TextBindingInstruction {
    constructor(from) {
        this.from = from;
    }
    get type() { return "ha" /* textBinding */; }
}
export class ListenerBindingInstruction {
    constructor(from, to, preventDefault, strategy) {
        this.from = from;
        this.to = to;
        this.preventDefault = preventDefault;
        this.strategy = strategy;
    }
    get type() { return "hb" /* listenerBinding */; }
}
export class StylePropertyBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
    get type() { return "hd" /* stylePropertyBinding */; }
}
export class SetAttributeInstruction {
    constructor(value, to) {
        this.value = value;
        this.to = to;
    }
    get type() { return "he" /* setAttribute */; }
}
export class SetClassAttributeInstruction {
    constructor(value) {
        this.value = value;
        this.type = "hf" /* setClassAttribute */;
    }
}
export class SetStyleAttributeInstruction {
    constructor(value) {
        this.value = value;
        this.type = "hg" /* setStyleAttribute */;
    }
}
export class AttributeBindingInstruction {
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
export const ITemplateCompiler = DI.createInterface('ITemplateCompiler');
export const IRenderer = DI.createInterface('IRenderer');
export function renderer(instructionType) {
    return function decorator(target) {
        // wrap the constructor to set the instructionType to the instance (for better performance than when set on the prototype)
        const decoratedTarget = function (...args) {
            const instance = new target(...args);
            instance.instructionType = instructionType;
            return instance;
        };
        // make sure we register the decorated constructor with DI
        decoratedTarget.register = function register(container) {
            Registration.singleton(IRenderer, decoratedTarget).register(container);
        };
        // copy over any metadata such as annotations (set by preceding decorators) as well as static properties set by the user
        // also copy the name, to be less confusing to users (so they can still use constructor.name for whatever reason)
        // the length (number of ctor arguments) is copied for the same reason
        const metadataKeys = Metadata.getOwnKeys(target);
        for (const key of metadataKeys) {
            Metadata.define(key, Metadata.getOwn(key, target), decoratedTarget);
        }
        const ownProperties = Object.getOwnPropertyDescriptors(target);
        Object.keys(ownProperties).filter(prop => prop !== 'prototype').forEach(prop => {
            Reflect.defineProperty(decoratedTarget, prop, ownProperties[prop]);
        });
        return decoratedTarget;
    };
}
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
            return CustomElement.for(refHost);
        case 'view':
            // todo: returns node sequences for fun?
            throw new Error('Not supported API');
        case 'view-model':
            // this means it supports returning undefined
            return CustomElement.for(refHost).viewModel;
        default: {
            const caController = CustomAttribute.for(refHost, refTargetName);
            if (caController !== void 0) {
                return caController.viewModel;
            }
            const ceController = CustomElement.for(refHost, { name: refTargetName });
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
export { SetPropertyRenderer };
let CustomElementRenderer = 
/** @internal */
class CustomElementRenderer {
    render(flags, context, controller, target, instruction) {
        var _a;
        let viewFactory;
        const slotInfo = instruction.slotInfo;
        if (slotInfo !== null) {
            viewFactory = getRenderContext(slotInfo.content, context).getViewFactory(void 0);
        }
        const targetedProjections = context.getProjectionFor(instruction);
        const factory = context.getComponentFactory(
        /* parentController */ controller, 
        /* host             */ target, 
        /* instruction      */ instruction, 
        /* viewFactory      */ viewFactory, 
        /* location         */ target, 
        /* auSlotsInfo      */ new AuSlotsInfo(Object.keys((_a = targetedProjections === null || targetedProjections === void 0 ? void 0 : targetedProjections.projections) !== null && _a !== void 0 ? _a : {})));
        const key = CustomElement.keyFrom(instruction.res);
        const component = factory.createComponent(key);
        const childController = Controller.forCustomElement(
        /* root                */ controller.root, 
        /* container           */ context, 
        /* viewModel           */ component, 
        /* host                */ target, 
        /* targetedProjections */ targetedProjections, 
        /* flags               */ flags);
        flags = childController.flags;
        setRef(target, key, childController);
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
export { CustomElementRenderer };
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
        const key = CustomAttribute.keyFrom(instruction.res);
        const component = factory.createComponent(key);
        const childController = Controller.forCustomAttribute(
        /* root      */ controller.root, 
        /* container */ context, 
        /* viewModel */ component, 
        /* host      */ target, 
        /* flags     */ flags);
        setRef(target, key, childController);
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
export { CustomAttributeRenderer };
let TemplateControllerRenderer = 
/** @internal */
class TemplateControllerRenderer {
    render(flags, context, controller, target, instruction) {
        var _a;
        const viewFactory = getRenderContext(instruction.def, context).getViewFactory();
        const renderLocation = convertToRenderLocation(target);
        const componentFactory = context.getComponentFactory(
        /* parentController */ controller, 
        /* host             */ target, 
        /* instruction      */ instruction, 
        /* viewFactory      */ viewFactory, 
        /* location         */ renderLocation);
        const key = CustomAttribute.keyFrom(instruction.res);
        const component = componentFactory.createComponent(key);
        const childController = Controller.forCustomAttribute(
        /* root      */ controller.root, 
        /* container */ context, 
        /* viewModel */ component, 
        /* host      */ target, 
        /* flags     */ flags);
        setRef(renderLocation, key, childController);
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
export { TemplateControllerRenderer };
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
            binding = applyBindingBehavior(new LetBinding(expr, childInstruction.to, this.observerLocator, context, toBindingContext), expr, context);
            controller.addBinding(binding);
        }
    }
};
LetElementRenderer = __decorate([
    renderer("rd" /* hydrateLetElement */)
    /** @internal */
    ,
    __param(0, IExpressionParser),
    __param(1, IObserverLocator)
], LetElementRenderer);
export { LetElementRenderer };
let CallBindingRenderer = 
/** @internal */
class CallBindingRenderer {
    constructor(parser, observerLocator) {
        this.parser = parser;
        this.observerLocator = observerLocator;
    }
    render(flags, context, controller, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 153 /* CallCommand */);
        const binding = applyBindingBehavior(new CallBinding(expr, getTarget(target), instruction.to, this.observerLocator, context), expr, context);
        controller.addBinding(binding);
    }
};
CallBindingRenderer = __decorate([
    renderer("rh" /* callBinding */)
    /** @internal */
    ,
    __param(0, IExpressionParser),
    __param(1, IObserverLocator)
], CallBindingRenderer);
export { CallBindingRenderer };
let RefBindingRenderer = 
/** @internal */
class RefBindingRenderer {
    constructor(parser) {
        this.parser = parser;
    }
    render(flags, context, controller, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 5376 /* IsRef */);
        const binding = applyBindingBehavior(new RefBinding(expr, getRefTarget(target, instruction.to), context), expr, context);
        controller.addBinding(binding);
    }
};
RefBindingRenderer = __decorate([
    renderer("rj" /* refBinding */)
    /** @internal */
    ,
    __param(0, IExpressionParser)
], RefBindingRenderer);
export { RefBindingRenderer };
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
        const binding = new InterpolationBinding(this.observerLocator, expr, getTarget(target), instruction.to, BindingMode.toView, context, this.platform.domWriteQueue);
        const partBindings = binding.partBindings;
        const ii = partBindings.length;
        let i = 0;
        let partBinding;
        for (; ii > i; ++i) {
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
    __param(0, IExpressionParser),
    __param(1, IObserverLocator),
    __param(2, IPlatform)
], InterpolationBindingRenderer);
export { InterpolationBindingRenderer };
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
        const binding = applyBindingBehavior(new PropertyBinding(expr, getTarget(target), instruction.to, instruction.mode, this.observerLocator, context, this.platform.domWriteQueue), expr, context);
        controller.addBinding(binding);
    }
};
PropertyBindingRenderer = __decorate([
    renderer("rg" /* propertyBinding */)
    /** @internal */
    ,
    __param(0, IExpressionParser),
    __param(1, IObserverLocator),
    __param(2, IPlatform)
], PropertyBindingRenderer);
export { PropertyBindingRenderer };
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
        const binding = applyBindingBehavior(new PropertyBinding(expr, getTarget(target), instruction.to, BindingMode.toView, this.observerLocator, context, this.platform.domWriteQueue), expr, context);
        controller.addBinding(binding);
    }
};
IteratorBindingRenderer = __decorate([
    renderer("rk" /* iteratorBinding */)
    /** @internal */
    ,
    __param(0, IExpressionParser),
    __param(1, IObserverLocator),
    __param(2, IPlatform)
], IteratorBindingRenderer);
export { IteratorBindingRenderer };
let behaviorExpressionIndex = 0;
const behaviorExpressions = [];
export function applyBindingBehavior(binding, expression, locator) {
    while (expression instanceof BindingBehaviorExpression) {
        behaviorExpressions[behaviorExpressionIndex++] = expression;
        expression = expression.expression;
    }
    while (behaviorExpressionIndex > 0) {
        const behaviorExpression = behaviorExpressions[--behaviorExpressionIndex];
        const behaviorOrFactory = locator.get(behaviorExpression.behaviorKey);
        if (behaviorOrFactory instanceof BindingBehaviorFactory) {
            binding = behaviorOrFactory.construct(binding, behaviorExpression);
        }
    }
    behaviorExpressions.length = 0;
    return binding;
}
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
            controller.addBinding(applyBindingBehavior(new ContentBinding(dynamicParts[i], 
            // using a text node instead of comment, as a mean to:
            // support seamless transition between a html node, or a text
            // reduce the noise in the template, caused by html comment
            parent.insertBefore(doc.createTextNode(''), next), context, this.observerLocator, this.platform), dynamicParts[i], context));
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
    __param(0, IExpressionParser),
    __param(1, IObserverLocator),
    __param(2, IPlatform)
], TextBindingRenderer);
export { TextBindingRenderer };
let ListenerBindingRenderer = 
/** @internal */
class ListenerBindingRenderer {
    constructor(parser, eventDelegator) {
        this.parser = parser;
        this.eventDelegator = eventDelegator;
    }
    render(flags, context, controller, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 80 /* IsEventCommand */ | (instruction.strategy + 6 /* DelegationStrategyDelta */));
        const binding = applyBindingBehavior(new Listener(context.platform, instruction.to, instruction.strategy, expr, target, instruction.preventDefault, this.eventDelegator, context), expr, context);
        controller.addBinding(binding);
    }
};
ListenerBindingRenderer = __decorate([
    renderer("hb" /* listenerBinding */)
    /** @internal */
    ,
    __param(0, IExpressionParser),
    __param(1, IEventDelegator)
], ListenerBindingRenderer);
export { ListenerBindingRenderer };
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
export { SetAttributeRenderer };
let SetClassAttributeRenderer = class SetClassAttributeRenderer {
    render(flags, context, controller, target, instruction) {
        addClasses(target.classList, instruction.value);
    }
};
SetClassAttributeRenderer = __decorate([
    renderer("hf" /* setClassAttribute */)
], SetClassAttributeRenderer);
export { SetClassAttributeRenderer };
let SetStyleAttributeRenderer = class SetStyleAttributeRenderer {
    render(flags, context, controller, target, instruction) {
        target.style.cssText += instruction.value;
    }
};
SetStyleAttributeRenderer = __decorate([
    renderer("hg" /* setStyleAttribute */)
], SetStyleAttributeRenderer);
export { SetStyleAttributeRenderer };
let StylePropertyBindingRenderer = 
/** @internal */
class StylePropertyBindingRenderer {
    constructor(parser, observerLocator, platform) {
        this.parser = parser;
        this.observerLocator = observerLocator;
        this.platform = platform;
    }
    render(flags, context, controller, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | BindingMode.toView);
        const binding = applyBindingBehavior(new PropertyBinding(expr, target.style, instruction.to, BindingMode.toView, this.observerLocator, context, this.platform.domWriteQueue), expr, context);
        controller.addBinding(binding);
    }
};
StylePropertyBindingRenderer = __decorate([
    renderer("hd" /* stylePropertyBinding */)
    /** @internal */
    ,
    __param(0, IExpressionParser),
    __param(1, IObserverLocator),
    __param(2, IPlatform)
], StylePropertyBindingRenderer);
export { StylePropertyBindingRenderer };
let AttributeBindingRenderer = 
/** @internal */
class AttributeBindingRenderer {
    constructor(parser, observerLocator) {
        this.parser = parser;
        this.observerLocator = observerLocator;
    }
    render(flags, context, controller, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | BindingMode.toView);
        const binding = applyBindingBehavior(new AttributeBinding(expr, target, instruction.attr /* targetAttribute */, instruction.to /* targetKey */, BindingMode.toView, this.observerLocator, context), expr, context);
        controller.addBinding(binding);
    }
};
AttributeBindingRenderer = __decorate([
    renderer("hc" /* attributeBinding */)
    /** @internal */
    ,
    __param(0, IExpressionParser),
    __param(1, IObserverLocator)
], AttributeBindingRenderer);
export { AttributeBindingRenderer };
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
//# sourceMappingURL=renderer.js.map