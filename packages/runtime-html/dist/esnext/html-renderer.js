import * as tslib_1 from "tslib";
import { Tracer } from '@aurelia/kernel';
import { addBinding, Binding, BindingMode, ensureExpression, IExpressionParser, instructionRenderer, InterpolationBinding, IObserverLocator, MultiInterpolationBinding } from '@aurelia/runtime';
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
        if (Tracer.enabled) {
            Tracer.enter('TextBindingRenderer', 'render', slice.call(arguments));
        }
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
        if (Tracer.enabled) {
            Tracer.leave();
        }
    }
};
TextBindingRenderer.inject = [IExpressionParser, IObserverLocator];
TextBindingRenderer = tslib_1.__decorate([
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
        if (Tracer.enabled) {
            Tracer.enter('ListenerBindingRenderer', 'render', slice.call(arguments));
        }
        const expr = ensureExpression(this.parser, instruction.from, 80 /* IsEventCommand */ | (instruction.strategy + 6 /* DelegationStrategyDelta */));
        const binding = new Listener(dom, instruction.to, instruction.strategy, expr, target, instruction.preventDefault, this.eventManager, context);
        addBinding(renderable, binding);
        if (Tracer.enabled) {
            Tracer.leave();
        }
    }
};
ListenerBindingRenderer.inject = [IExpressionParser, IEventManager];
ListenerBindingRenderer = tslib_1.__decorate([
    instructionRenderer("hb" /* listenerBinding */)
    /** @internal */
], ListenerBindingRenderer);
export { ListenerBindingRenderer };
let SetAttributeRenderer = 
/** @internal */
class SetAttributeRenderer {
    render(flags, dom, context, renderable, target, instruction) {
        if (Tracer.enabled) {
            Tracer.enter('SetAttributeRenderer', 'render', slice.call(arguments));
        }
        target.setAttribute(instruction.to, instruction.value);
        if (Tracer.enabled) {
            Tracer.leave();
        }
    }
};
SetAttributeRenderer = tslib_1.__decorate([
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
        if (Tracer.enabled) {
            Tracer.enter('StylePropertyBindingRenderer', 'render', slice.call(arguments));
        }
        const expr = ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | BindingMode.toView);
        const binding = new Binding(expr, target.style, instruction.to, BindingMode.toView, this.observerLocator, context);
        addBinding(renderable, binding);
        if (Tracer.enabled) {
            Tracer.leave();
        }
    }
};
StylePropertyBindingRenderer.inject = [IExpressionParser, IObserverLocator];
StylePropertyBindingRenderer = tslib_1.__decorate([
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
        if (Tracer.enabled) {
            Tracer.enter('StylePropertyBindingRenderer', 'render', slice.call(arguments));
        }
        const expr = ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | BindingMode.toView);
        const binding = new AttributeBinding(expr, target, instruction.attr /*targetAttribute*/, instruction.to /*targetKey*/, BindingMode.toView, this.observerLocator, context);
        addBinding(renderable, binding);
        if (Tracer.enabled) {
            Tracer.leave();
        }
    }
};
// @ts-ignore
AttributeBindingRenderer.inject = [IExpressionParser, IObserverLocator];
AttributeBindingRenderer = tslib_1.__decorate([
    instructionRenderer("hc" /* attributeBinding */)
    /** @internal */
], AttributeBindingRenderer);
export { AttributeBindingRenderer };
//# sourceMappingURL=html-renderer.js.map