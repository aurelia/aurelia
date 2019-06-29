import * as tslib_1 from "tslib";
import { all, Registration, Reporter, Tracer } from '@aurelia/kernel';
import { PropertyBinding } from './binding/property-binding';
import { CallBinding } from './binding/call-binding';
import { IExpressionParser } from './binding/expression-parser';
import { InterpolationBinding, MultiInterpolationBinding } from './binding/interpolation-binding';
import { LetBinding } from './binding/let-binding';
import { RefBinding } from './binding/ref-binding';
import { customAttributeKey, customElementKey } from './definitions';
import { BindingMode } from './flags';
import { Controller, } from './templating/controller';
import { IObserverLocator } from './observation/observer-locator';
import { IInstructionRenderer, IRenderer, IRenderingEngine } from './rendering-engine';
const slice = Array.prototype.slice;
export function instructionRenderer(instructionType) {
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
            return Registration.singleton(IInstructionRenderer, decoratedTarget).register(container, IInstructionRenderer);
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
/* @internal */
export class Renderer {
    constructor(instructionRenderers) {
        const record = this.instructionRenderers = {};
        instructionRenderers.forEach(item => {
            record[item.instructionType] = item;
        });
    }
    static register(container) {
        return Registration.singleton(IRenderer, this).register(container);
    }
    // tslint:disable-next-line:parameters-max-number
    render(flags, dom, context, renderable, targets, definition, host, parts) {
        if (Tracer.enabled) {
            Tracer.enter('Renderer', 'render', slice.call(arguments));
        }
        const targetInstructions = definition.instructions;
        const instructionRenderers = this.instructionRenderers;
        if (targets.length !== targetInstructions.length) {
            if (targets.length > targetInstructions.length) {
                throw Reporter.error(30);
            }
            else {
                throw Reporter.error(31);
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
        if (Tracer.enabled) {
            Tracer.leave();
        }
    }
}
// TODO: fix this
// @ts-ignore
Renderer.inject = [all(IInstructionRenderer)];
export function ensureExpression(parser, srcOrExpr, bindingType) {
    if (typeof srcOrExpr === 'string') {
        return parser.parse(srcOrExpr, bindingType);
    }
    return srcOrExpr;
}
export function addBinding(renderable, binding) {
    if (Tracer.enabled) {
        Tracer.enter('Renderer', 'addBinding', slice.call(arguments));
    }
    if (renderable.bindings == void 0) {
        renderable.bindings = [binding];
    }
    else {
        renderable.bindings.push(binding);
    }
    if (Tracer.enabled) {
        Tracer.leave();
    }
}
export function addComponent(renderable, component) {
    if (Tracer.enabled) {
        Tracer.enter('Renderer', 'addComponent', slice.call(arguments));
    }
    if (renderable.controllers == void 0) {
        renderable.controllers = [component];
    }
    else {
        renderable.controllers.push(component);
    }
    if (Tracer.enabled) {
        Tracer.leave();
    }
}
export function getTarget(potentialTarget) {
    if (potentialTarget.bindingContext !== void 0) {
        return potentialTarget.bindingContext;
    }
    return potentialTarget;
}
let SetPropertyRenderer = 
/** @internal */
class SetPropertyRenderer {
    render(flags, dom, context, renderable, target, instruction) {
        if (Tracer.enabled) {
            Tracer.enter('SetPropertyRenderer', 'render', slice.call(arguments));
        }
        getTarget(target)[instruction.to] = instruction.value; // Yeah, yeah..
        if (Tracer.enabled) {
            Tracer.leave();
        }
    }
};
SetPropertyRenderer = tslib_1.__decorate([
    instructionRenderer("re" /* setProperty */)
    /** @internal */
], SetPropertyRenderer);
export { SetPropertyRenderer };
let CustomElementRenderer = 
/** @internal */
class CustomElementRenderer {
    render(flags, dom, context, renderable, target, instruction) {
        if (Tracer.enabled) {
            Tracer.enter('CustomElementRenderer', 'render', slice.call(arguments));
        }
        const operation = context.beginComponentOperation(renderable, target, instruction, null, null, target, true);
        const component = context.get(customElementKey(instruction.res));
        const instructionRenderers = context.get(IRenderer).instructionRenderers;
        const childInstructions = instruction.instructions;
        const controller = Controller.forCustomElement(component, context, target, flags, instruction);
        let current;
        for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
            current = childInstructions[i];
            instructionRenderers[current.type].render(flags, dom, context, renderable, controller, current);
        }
        addComponent(renderable, controller);
        operation.dispose();
        if (Tracer.enabled) {
            Tracer.leave();
        }
    }
};
CustomElementRenderer = tslib_1.__decorate([
    instructionRenderer("ra" /* hydrateElement */)
    /** @internal */
], CustomElementRenderer);
export { CustomElementRenderer };
let CustomAttributeRenderer = 
/** @internal */
class CustomAttributeRenderer {
    render(flags, dom, context, renderable, target, instruction) {
        if (Tracer.enabled) {
            Tracer.enter('CustomAttributeRenderer', 'render', slice.call(arguments));
        }
        const operation = context.beginComponentOperation(renderable, target, instruction);
        const component = context.get(customAttributeKey(instruction.res));
        const instructionRenderers = context.get(IRenderer).instructionRenderers;
        const childInstructions = instruction.instructions;
        const controller = Controller.forCustomAttribute(component, context, flags);
        let current;
        for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
            current = childInstructions[i];
            instructionRenderers[current.type].render(flags, dom, context, renderable, controller, current);
        }
        addComponent(renderable, controller);
        operation.dispose();
        if (Tracer.enabled) {
            Tracer.leave();
        }
    }
};
CustomAttributeRenderer = tslib_1.__decorate([
    instructionRenderer("rb" /* hydrateAttribute */)
    /** @internal */
], CustomAttributeRenderer);
export { CustomAttributeRenderer };
let TemplateControllerRenderer = 
/** @internal */
class TemplateControllerRenderer {
    constructor(renderingEngine) {
        this.renderingEngine = renderingEngine;
    }
    render(flags, dom, context, renderable, target, instruction, parts) {
        if (Tracer.enabled) {
            Tracer.enter('TemplateControllerRenderer', 'render', slice.call(arguments));
        }
        const factory = this.renderingEngine.getViewFactory(dom, instruction.def, context);
        const operation = context.beginComponentOperation(renderable, target, instruction, factory, parts, dom.convertToRenderLocation(target), false);
        const component = context.get(customAttributeKey(instruction.res));
        const instructionRenderers = context.get(IRenderer).instructionRenderers;
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
        const controller = Controller.forCustomAttribute(component, context, flags);
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
        if (Tracer.enabled) {
            Tracer.leave();
        }
    }
};
TemplateControllerRenderer.inject = [IRenderingEngine];
TemplateControllerRenderer = tslib_1.__decorate([
    instructionRenderer("rc" /* hydrateTemplateController */)
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
    render(flags, dom, context, renderable, target, instruction) {
        if (Tracer.enabled) {
            Tracer.enter('LetElementRenderer', 'render', slice.call(arguments));
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
            binding = new LetBinding(expr, childInstruction.to, this.observerLocator, context, toViewModel);
            addBinding(renderable, binding);
        }
        if (Tracer.enabled) {
            Tracer.leave();
        }
    }
};
LetElementRenderer.inject = [IExpressionParser, IObserverLocator];
LetElementRenderer = tslib_1.__decorate([
    instructionRenderer("rd" /* hydrateLetElement */)
    /** @internal */
], LetElementRenderer);
export { LetElementRenderer };
let CallBindingRenderer = 
/** @internal */
class CallBindingRenderer {
    constructor(parser, observerLocator) {
        this.parser = parser;
        this.observerLocator = observerLocator;
    }
    render(flags, dom, context, renderable, target, instruction) {
        if (Tracer.enabled) {
            Tracer.enter('CallBindingRenderer', 'render', slice.call(arguments));
        }
        const expr = ensureExpression(this.parser, instruction.from, 153 /* CallCommand */);
        const binding = new CallBinding(expr, getTarget(target), instruction.to, this.observerLocator, context);
        addBinding(renderable, binding);
        if (Tracer.enabled) {
            Tracer.leave();
        }
    }
};
CallBindingRenderer.inject = [IExpressionParser, IObserverLocator];
CallBindingRenderer = tslib_1.__decorate([
    instructionRenderer("rh" /* callBinding */)
    /** @internal */
], CallBindingRenderer);
export { CallBindingRenderer };
let RefBindingRenderer = 
/** @internal */
class RefBindingRenderer {
    constructor(parser) {
        this.parser = parser;
    }
    render(flags, dom, context, renderable, target, instruction) {
        if (Tracer.enabled) {
            Tracer.enter('RefBindingRenderer', 'render', slice.call(arguments));
        }
        const expr = ensureExpression(this.parser, instruction.from, 1280 /* IsRef */);
        const binding = new RefBinding(expr, getTarget(target), context);
        addBinding(renderable, binding);
        if (Tracer.enabled) {
            Tracer.leave();
        }
    }
};
RefBindingRenderer.inject = [IExpressionParser];
RefBindingRenderer = tslib_1.__decorate([
    instructionRenderer("rj" /* refBinding */)
    /** @internal */
], RefBindingRenderer);
export { RefBindingRenderer };
let InterpolationBindingRenderer = 
/** @internal */
class InterpolationBindingRenderer {
    constructor(parser, observerLocator) {
        this.parser = parser;
        this.observerLocator = observerLocator;
    }
    render(flags, dom, context, renderable, target, instruction) {
        if (Tracer.enabled) {
            Tracer.enter('InterpolationBindingRenderer', 'render', slice.call(arguments));
        }
        let binding;
        const expr = ensureExpression(this.parser, instruction.from, 2048 /* Interpolation */);
        if (expr.isMulti) {
            binding = new MultiInterpolationBinding(this.observerLocator, expr, getTarget(target), instruction.to, BindingMode.toView, context);
        }
        else {
            binding = new InterpolationBinding(expr.firstExpression, expr, getTarget(target), instruction.to, BindingMode.toView, this.observerLocator, context, true);
        }
        addBinding(renderable, binding);
        if (Tracer.enabled) {
            Tracer.leave();
        }
    }
};
InterpolationBindingRenderer.inject = [IExpressionParser, IObserverLocator];
InterpolationBindingRenderer = tslib_1.__decorate([
    instructionRenderer("rf" /* interpolation */)
    /** @internal */
], InterpolationBindingRenderer);
export { InterpolationBindingRenderer };
let PropertyBindingRenderer = 
/** @internal */
class PropertyBindingRenderer {
    constructor(parser, observerLocator) {
        this.parser = parser;
        this.observerLocator = observerLocator;
    }
    render(flags, dom, context, renderable, target, instruction) {
        if (Tracer.enabled) {
            Tracer.enter('PropertyBindingRenderer', 'render', slice.call(arguments));
        }
        const expr = ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | instruction.mode);
        const binding = new PropertyBinding(expr, getTarget(target), instruction.to, instruction.mode, this.observerLocator, context);
        addBinding(renderable, binding);
        if (Tracer.enabled) {
            Tracer.leave();
        }
    }
};
PropertyBindingRenderer.inject = [IExpressionParser, IObserverLocator];
PropertyBindingRenderer = tslib_1.__decorate([
    instructionRenderer("rg" /* propertyBinding */)
    /** @internal */
], PropertyBindingRenderer);
export { PropertyBindingRenderer };
let IteratorBindingRenderer = 
/** @internal */
class IteratorBindingRenderer {
    constructor(parser, observerLocator) {
        this.parser = parser;
        this.observerLocator = observerLocator;
    }
    render(flags, dom, context, renderable, target, instruction) {
        if (Tracer.enabled) {
            Tracer.enter('IteratorBindingRenderer', 'render', slice.call(arguments));
        }
        const expr = ensureExpression(this.parser, instruction.from, 539 /* ForCommand */);
        const binding = new PropertyBinding(expr, getTarget(target), instruction.to, BindingMode.toView, this.observerLocator, context);
        addBinding(renderable, binding);
        if (Tracer.enabled) {
            Tracer.leave();
        }
    }
};
IteratorBindingRenderer.inject = [IExpressionParser, IObserverLocator];
IteratorBindingRenderer = tslib_1.__decorate([
    instructionRenderer("rk" /* iteratorBinding */)
    /** @internal */
], IteratorBindingRenderer);
export { IteratorBindingRenderer };
//# sourceMappingURL=renderer.js.map