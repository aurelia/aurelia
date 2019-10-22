import { __decorate, __param } from "tslib";
import { all, Registration, Reporter, Metadata, } from '@aurelia/kernel';
import { CallBinding } from './binding/call-binding';
import { IExpressionParser } from './binding/expression-parser';
import { InterpolationBinding, MultiInterpolationBinding } from './binding/interpolation-binding';
import { LetBinding } from './binding/let-binding';
import { PropertyBinding } from './binding/property-binding';
import { RefBinding } from './binding/ref-binding';
import { BindingMode } from './flags';
import { IObserverLocator } from './observation/observer-locator';
import { IInstructionRenderer, IRenderer, IRenderingEngine } from './rendering-engine';
import { CustomAttribute, } from './resources/custom-attribute';
import { CustomElement, } from './resources/custom-element';
import { Controller, } from './templating/controller';
export function instructionRenderer(instructionType) {
    return function decorator(target) {
        // wrap the constructor to set the instructionType to the instance (for better performance than when set on the prototype)
        const decoratedTarget = function (...args) {
            const instance = new target(...args);
            instance.instructionType = instructionType;
            return instance;
        };
        // make sure we register the decorated constructor with DI
        decoratedTarget.register = function register(container) {
            Registration.singleton(IInstructionRenderer, decoratedTarget).register(container);
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
/* @internal */
export class Renderer {
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
        return Registration.singleton(IRenderer, this).register(container);
    }
    render(flags, dom, context, renderable, targets, definition, host, parts) {
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
Renderer.inject = [all(IInstructionRenderer)];
export function ensureExpression(parser, srcOrExpr, bindingType) {
    if (typeof srcOrExpr === 'string') {
        return parser.parse(srcOrExpr, bindingType);
    }
    return srcOrExpr;
}
export function addBinding(renderable, binding) {
    if (renderable.bindings == void 0) {
        renderable.bindings = [binding];
    }
    else {
        renderable.bindings.push(binding);
    }
}
export function addComponent(renderable, component) {
    if (renderable.controllers == void 0) {
        renderable.controllers = [component];
    }
    else {
        renderable.controllers.push(component);
    }
}
export function getTarget(potentialTarget) {
    if (potentialTarget.bindingContext !== void 0) {
        return potentialTarget.bindingContext;
    }
    return potentialTarget;
}
export function getRefTarget(refHost, refTargetName) {
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
SetPropertyRenderer = __decorate([
    instructionRenderer("re" /* setProperty */)
    /** @internal */
], SetPropertyRenderer);
export { SetPropertyRenderer };
let CustomElementRenderer = 
/** @internal */
class CustomElementRenderer {
    render(flags, dom, context, renderable, target, instruction) {
        const operation = context.beginComponentOperation(renderable, target, instruction, null, null, target, true);
        const component = context.get(CustomElement.keyFrom(instruction.res));
        const instructionRenderers = context.get(IRenderer).instructionRenderers;
        const childInstructions = instruction.instructions;
        const controller = Controller.forCustomElement(component, context, target, flags, instruction);
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
CustomElementRenderer = __decorate([
    instructionRenderer("ra" /* hydrateElement */)
    /** @internal */
], CustomElementRenderer);
export { CustomElementRenderer };
let CustomAttributeRenderer = 
/** @internal */
class CustomAttributeRenderer {
    render(flags, dom, context, renderable, target, instruction) {
        const operation = context.beginComponentOperation(renderable, target, instruction);
        const component = context.get(CustomAttribute.keyFrom(instruction.res));
        const instructionRenderers = context.get(IRenderer).instructionRenderers;
        const childInstructions = instruction.instructions;
        const controller = Controller.forCustomAttribute(component, context, flags);
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
CustomAttributeRenderer = __decorate([
    instructionRenderer("rb" /* hydrateAttribute */)
    /** @internal */
], CustomAttributeRenderer);
export { CustomAttributeRenderer };
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
        const component = context.get(CustomAttribute.keyFrom(instruction.res));
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
TemplateControllerRenderer = __decorate([
    instructionRenderer("rc" /* hydrateTemplateController */)
    /** @internal */
    ,
    __param(0, IRenderingEngine),
    __param(1, IObserverLocator)
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
        dom.remove(target);
        const childInstructions = instruction.instructions;
        const toBindingContext = instruction.toBindingContext;
        let childInstruction;
        let expr;
        let binding;
        for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
            childInstruction = childInstructions[i];
            expr = ensureExpression(this.parser, childInstruction.from, 48 /* IsPropertyCommand */);
            binding = new LetBinding(expr, childInstruction.to, this.observerLocator, context, toBindingContext);
            addBinding(renderable, binding);
        }
    }
};
LetElementRenderer = __decorate([
    instructionRenderer("rd" /* hydrateLetElement */)
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
    render(flags, dom, context, renderable, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 153 /* CallCommand */);
        const binding = new CallBinding(expr, getTarget(target), instruction.to, this.observerLocator, context);
        addBinding(renderable, binding);
    }
};
CallBindingRenderer = __decorate([
    instructionRenderer("rh" /* callBinding */)
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
    render(flags, dom, context, renderable, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 5376 /* IsRef */);
        const binding = new RefBinding(expr, getRefTarget(target, instruction.to), context);
        addBinding(renderable, binding);
    }
};
RefBindingRenderer = __decorate([
    instructionRenderer("rj" /* refBinding */)
    /** @internal */
    ,
    __param(0, IExpressionParser)
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
        let binding;
        const expr = ensureExpression(this.parser, instruction.from, 2048 /* Interpolation */);
        if (expr.isMulti) {
            binding = new MultiInterpolationBinding(this.observerLocator, expr, getTarget(target), instruction.to, BindingMode.toView, context);
        }
        else {
            binding = new InterpolationBinding(expr.firstExpression, expr, getTarget(target), instruction.to, BindingMode.toView, this.observerLocator, context, true);
        }
        addBinding(renderable, binding);
    }
};
InterpolationBindingRenderer = __decorate([
    instructionRenderer("rf" /* interpolation */)
    /** @internal */
    ,
    __param(0, IExpressionParser),
    __param(1, IObserverLocator)
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
        const expr = ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | instruction.mode);
        const binding = new PropertyBinding(expr, getTarget(target), instruction.to, instruction.mode, this.observerLocator, context);
        addBinding(renderable, binding);
    }
};
PropertyBindingRenderer = __decorate([
    instructionRenderer("rg" /* propertyBinding */)
    /** @internal */
    ,
    __param(0, IExpressionParser),
    __param(1, IObserverLocator)
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
        const expr = ensureExpression(this.parser, instruction.from, 539 /* ForCommand */);
        const binding = new PropertyBinding(expr, getTarget(target), instruction.to, BindingMode.toView, this.observerLocator, context);
        addBinding(renderable, binding);
    }
};
IteratorBindingRenderer = __decorate([
    instructionRenderer("rk" /* iteratorBinding */)
    /** @internal */
    ,
    __param(0, IExpressionParser),
    __param(1, IObserverLocator)
], IteratorBindingRenderer);
export { IteratorBindingRenderer };
//# sourceMappingURL=renderer.js.map