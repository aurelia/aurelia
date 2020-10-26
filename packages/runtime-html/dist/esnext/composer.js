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
import { all, Metadata, Registration, DI } from '@aurelia/kernel';
import { BindingMode, IExpressionParser, IObserverLocator, InterpolationBinding, PropertyBinding, BindingBehaviorExpression, CallBinding, LetBinding, RefBinding, BindingBehaviorFactory, } from '@aurelia/runtime';
import { AttributeBinding } from './binding/attribute';
import { Listener } from './binding/listener';
import { IEventDelegator } from './observation/event-delegator';
import { CustomElement } from './resources/custom-element';
import { getCompositionContext } from './templating/composition-context';
import { CustomAttribute } from './resources/custom-attribute';
import { convertToRenderLocation } from './dom';
import { Controller } from './templating/controller';
import { IPlatform } from './platform';
export const ITemplateCompiler = DI.createInterface('ITemplateCompiler').noDefault();
export const IInstructionComposer = DI.createInterface('IInstructionComposer').noDefault();
export function instructionComposer(instructionType) {
    return function decorator(target) {
        // wrap the constructor to set the instructionType to the instance (for better performance than when set on the prototype)
        const decoratedTarget = function (...args) {
            const instance = new target(...args);
            instance.instructionType = instructionType;
            return instance;
        };
        // make sure we register the decorated constructor with DI
        decoratedTarget.register = function register(container) {
            Registration.singleton(IInstructionComposer, decoratedTarget).register(container);
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
export const IComposer = DI.createInterface('IComposer').withDefault(x => x.singleton(Composer));
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
    __param(0, all(IInstructionComposer)),
    __metadata("design:paramtypes", [Array])
], Composer);
export { Composer };
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
export { SetPropertyComposer };
let CustomElementComposer = 
/** @internal */
class CustomElementComposer {
    compose(flags, context, controller, target, instruction) {
        let viewFactory;
        const slotInfo = instruction.slotInfo;
        if (slotInfo !== null) {
            const projectionCtx = slotInfo.projectionContext;
            viewFactory = getCompositionContext(projectionCtx.content, context).getViewFactory(void 0, slotInfo.type, projectionCtx.scope);
        }
        const factory = context.getComponentFactory(
        /* parentController */ controller, 
        /* host             */ target, 
        /* instruction      */ instruction, 
        /* viewFactory      */ viewFactory, 
        /* location         */ target);
        const key = CustomElement.keyFrom(instruction.res);
        const component = factory.createComponent(key);
        const childController = Controller.forCustomElement(
        /* root                */ controller.root, 
        /* container           */ context, 
        /* viewModel           */ component, 
        /* host                */ target, 
        /* targetedProjections */ context.getProjectionFor(instruction), 
        /* flags               */ flags);
        flags = childController.flags;
        Metadata.define(key, childController, target);
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
export { CustomElementComposer };
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
        const key = CustomAttribute.keyFrom(instruction.res);
        const component = factory.createComponent(key);
        const childController = Controller.forCustomAttribute(
        /* root      */ controller.root, 
        /* container */ context, 
        /* viewModel */ component, 
        /* host      */ target, 
        /* flags     */ flags);
        Metadata.define(key, childController, target);
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
export { CustomAttributeComposer };
let TemplateControllerComposer = 
/** @internal */
class TemplateControllerComposer {
    compose(flags, context, controller, target, instruction) {
        var _a;
        const viewFactory = getCompositionContext(instruction.def, context).getViewFactory();
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
        Metadata.define(key, childController, renderLocation);
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
export { TemplateControllerComposer };
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
            binding = applyBindingBehavior(new LetBinding(expr, childInstruction.to, this.observerLocator, context, toBindingContext), expr, context);
            controller.addBinding(binding);
        }
    }
};
LetElementComposer = __decorate([
    instructionComposer("rd" /* composeLetElement */)
    /** @internal */
    ,
    __param(0, IExpressionParser),
    __param(1, IObserverLocator),
    __metadata("design:paramtypes", [Object, Object])
], LetElementComposer);
export { LetElementComposer };
let CallBindingComposer = 
/** @internal */
class CallBindingComposer {
    constructor(parser, observerLocator) {
        this.parser = parser;
        this.observerLocator = observerLocator;
    }
    compose(flags, context, controller, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 153 /* CallCommand */);
        const binding = applyBindingBehavior(new CallBinding(expr, getTarget(target), instruction.to, this.observerLocator, context), expr, context);
        controller.addBinding(binding);
    }
};
CallBindingComposer = __decorate([
    instructionComposer("rh" /* callBinding */)
    /** @internal */
    ,
    __param(0, IExpressionParser),
    __param(1, IObserverLocator),
    __metadata("design:paramtypes", [Object, Object])
], CallBindingComposer);
export { CallBindingComposer };
let RefBindingComposer = 
/** @internal */
class RefBindingComposer {
    constructor(parser) {
        this.parser = parser;
    }
    compose(flags, context, controller, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 5376 /* IsRef */);
        const binding = applyBindingBehavior(new RefBinding(expr, getRefTarget(target, instruction.to), context), expr, context);
        controller.addBinding(binding);
    }
};
RefBindingComposer = __decorate([
    instructionComposer("rj" /* refBinding */)
    /** @internal */
    ,
    __param(0, IExpressionParser),
    __metadata("design:paramtypes", [Object])
], RefBindingComposer);
export { RefBindingComposer };
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
        const binding = new InterpolationBinding(this.observerLocator, expr, getTarget(target), instruction.to, BindingMode.toView, context, this.platform.domWriteQueue);
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
    __param(0, IExpressionParser),
    __param(1, IObserverLocator),
    __param(2, IPlatform),
    __metadata("design:paramtypes", [Object, Object, Object])
], InterpolationBindingComposer);
export { InterpolationBindingComposer };
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
        const binding = applyBindingBehavior(new PropertyBinding(expr, getTarget(target), instruction.to, instruction.mode, this.observerLocator, context, this.platform.domWriteQueue), expr, context);
        controller.addBinding(binding);
    }
};
PropertyBindingComposer = __decorate([
    instructionComposer("rg" /* propertyBinding */)
    /** @internal */
    ,
    __param(0, IExpressionParser),
    __param(1, IObserverLocator),
    __param(2, IPlatform),
    __metadata("design:paramtypes", [Object, Object, Object])
], PropertyBindingComposer);
export { PropertyBindingComposer };
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
        const binding = applyBindingBehavior(new PropertyBinding(expr, getTarget(target), instruction.to, BindingMode.toView, this.observerLocator, context, this.platform.domWriteQueue), expr, context);
        controller.addBinding(binding);
    }
};
IteratorBindingComposer = __decorate([
    instructionComposer("rk" /* iteratorBinding */)
    /** @internal */
    ,
    __param(0, IExpressionParser),
    __param(1, IObserverLocator),
    __param(2, IPlatform),
    __metadata("design:paramtypes", [Object, Object, Object])
], IteratorBindingComposer);
export { IteratorBindingComposer };
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
        const binding = new InterpolationBinding(this.observerLocator, expr, next, 'textContent', BindingMode.toView, context, this.platform.domWriteQueue);
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
    __param(0, IExpressionParser),
    __param(1, IObserverLocator),
    __param(2, IPlatform),
    __metadata("design:paramtypes", [Object, Object, Object])
], TextBindingComposer);
export { TextBindingComposer };
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
        const binding = applyBindingBehavior(new Listener(context.platform, instruction.to, instruction.strategy, expr, target, instruction.preventDefault, this.eventDelegator, context), expr, context);
        controller.addBinding(binding);
    }
};
ListenerBindingComposer = __decorate([
    instructionComposer("hb" /* listenerBinding */)
    /** @internal */
    ,
    __param(0, IExpressionParser),
    __param(1, IEventDelegator),
    __metadata("design:paramtypes", [Object, Object])
], ListenerBindingComposer);
export { ListenerBindingComposer };
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
export { SetAttributeComposer };
let SetClassAttributeComposer = class SetClassAttributeComposer {
    compose(flags, context, controller, target, instruction) {
        addClasses(target.classList, instruction.value);
    }
};
SetClassAttributeComposer = __decorate([
    instructionComposer("hf" /* setClassAttribute */)
], SetClassAttributeComposer);
export { SetClassAttributeComposer };
let SetStyleAttributeComposer = class SetStyleAttributeComposer {
    compose(flags, context, controller, target, instruction) {
        target.style.cssText += instruction.value;
    }
};
SetStyleAttributeComposer = __decorate([
    instructionComposer("hg" /* setStyleAttribute */)
], SetStyleAttributeComposer);
export { SetStyleAttributeComposer };
let StylePropertyBindingComposer = 
/** @internal */
class StylePropertyBindingComposer {
    constructor(parser, observerLocator, platform) {
        this.parser = parser;
        this.observerLocator = observerLocator;
        this.platform = platform;
    }
    compose(flags, context, controller, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | BindingMode.toView);
        const binding = applyBindingBehavior(new PropertyBinding(expr, target.style, instruction.to, BindingMode.toView, this.observerLocator, context, this.platform.domWriteQueue), expr, context);
        controller.addBinding(binding);
    }
};
StylePropertyBindingComposer = __decorate([
    instructionComposer("hd" /* stylePropertyBinding */)
    /** @internal */
    ,
    __param(0, IExpressionParser),
    __param(1, IObserverLocator),
    __param(2, IPlatform),
    __metadata("design:paramtypes", [Object, Object, Object])
], StylePropertyBindingComposer);
export { StylePropertyBindingComposer };
let AttributeBindingComposer = 
/** @internal */
class AttributeBindingComposer {
    constructor(parser, observerLocator) {
        this.parser = parser;
        this.observerLocator = observerLocator;
    }
    compose(flags, context, controller, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | BindingMode.toView);
        const binding = applyBindingBehavior(new AttributeBinding(expr, target, instruction.attr /* targetAttribute */, instruction.to /* targetKey */, BindingMode.toView, this.observerLocator, context), expr, context);
        controller.addBinding(binding);
    }
};
AttributeBindingComposer = __decorate([
    instructionComposer("hc" /* attributeBinding */)
    /** @internal */
    ,
    __param(0, IExpressionParser),
    __param(1, IObserverLocator),
    __metadata("design:paramtypes", [Object, Object])
], AttributeBindingComposer);
export { AttributeBindingComposer };
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
//# sourceMappingURL=composer.js.map