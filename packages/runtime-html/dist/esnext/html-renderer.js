import { __decorate } from "tslib";
import { addBinding, BindingMode, ensureExpression, IExpressionParser, instructionRenderer, InterpolationBinding, IObserverLocator, MultiInterpolationBinding, PropertyBinding } from '@aurelia/runtime';
import { AttributeBinding } from './binding/attribute';
import { Listener } from './binding/listener';
import { IEventManager } from './observation/event-manager';
const slice = Array.prototype.slice;
let TextBindingRenderer = 
/** @internal */
class TextBindingRenderer {
    constructor(parser, observerLocator) {
        this.parser = parser;
        this.observerLocator = observerLocator;
    }
    render(flags, dom, context, renderable, target, instruction) {
        const next = target.nextSibling;
        if (dom.isMarker(target)) {
            dom.remove(target);
        }
        let binding;
        const expr = ensureExpression(this.parser, instruction.from, 2048 /* Interpolation */);
        if (expr.isMulti) {
            binding = new MultiInterpolationBinding(this.observerLocator, expr, next, 'textContent', BindingMode.toView, context);
        }
        else {
            binding = new InterpolationBinding(expr.firstExpression, expr, next, 'textContent', BindingMode.toView, this.observerLocator, context, true);
        }
        addBinding(renderable, binding);
    }
};
TextBindingRenderer.inject = [IExpressionParser, IObserverLocator];
TextBindingRenderer = __decorate([
    instructionRenderer("ha" /* textBinding */)
    /** @internal */
], TextBindingRenderer);
export { TextBindingRenderer };
let ListenerBindingRenderer = 
/** @internal */
class ListenerBindingRenderer {
    constructor(parser, eventManager) {
        this.parser = parser;
        this.eventManager = eventManager;
    }
    render(flags, dom, context, renderable, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 80 /* IsEventCommand */ | (instruction.strategy + 6 /* DelegationStrategyDelta */));
        const binding = new Listener(dom, instruction.to, instruction.strategy, expr, target, instruction.preventDefault, this.eventManager, context);
        addBinding(renderable, binding);
    }
};
ListenerBindingRenderer.inject = [IExpressionParser, IEventManager];
ListenerBindingRenderer = __decorate([
    instructionRenderer("hb" /* listenerBinding */)
    /** @internal */
], ListenerBindingRenderer);
export { ListenerBindingRenderer };
let SetAttributeRenderer = 
/** @internal */
class SetAttributeRenderer {
    render(flags, dom, context, renderable, target, instruction) {
        target.setAttribute(instruction.to, instruction.value);
    }
};
SetAttributeRenderer = __decorate([
    instructionRenderer("he" /* setAttribute */)
    /** @internal */
], SetAttributeRenderer);
export { SetAttributeRenderer };
let StylePropertyBindingRenderer = 
/** @internal */
class StylePropertyBindingRenderer {
    constructor(parser, observerLocator) {
        this.parser = parser;
        this.observerLocator = observerLocator;
    }
    render(flags, dom, context, renderable, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | BindingMode.toView);
        const binding = new PropertyBinding(expr, target.style, instruction.to, BindingMode.toView, this.observerLocator, context);
        addBinding(renderable, binding);
    }
};
StylePropertyBindingRenderer.inject = [IExpressionParser, IObserverLocator];
StylePropertyBindingRenderer = __decorate([
    instructionRenderer("hd" /* stylePropertyBinding */)
    /** @internal */
], StylePropertyBindingRenderer);
export { StylePropertyBindingRenderer };
let AttributeBindingRenderer = 
/** @internal */
class AttributeBindingRenderer {
    constructor(parser, observerLocator) {
        this.parser = parser;
        this.observerLocator = observerLocator;
    }
    render(flags, dom, context, renderable, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | BindingMode.toView);
        const binding = new AttributeBinding(expr, target, instruction.attr /* targetAttribute */, instruction.to /* targetKey */, BindingMode.toView, this.observerLocator, context);
        addBinding(renderable, binding);
    }
};
AttributeBindingRenderer.inject = [IExpressionParser, IObserverLocator];
AttributeBindingRenderer = __decorate([
    instructionRenderer("hc" /* attributeBinding */)
    /** @internal */
], AttributeBindingRenderer);
export { AttributeBindingRenderer };
//# sourceMappingURL=html-renderer.js.map