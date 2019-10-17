(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/runtime", "./binding/attribute", "./binding/listener", "./observation/event-manager"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const runtime_1 = require("@aurelia/runtime");
    const attribute_1 = require("./binding/attribute");
    const listener_1 = require("./binding/listener");
    const event_manager_1 = require("./observation/event-manager");
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
            const expr = runtime_1.ensureExpression(this.parser, instruction.from, 2048 /* Interpolation */);
            if (expr.isMulti) {
                binding = new runtime_1.MultiInterpolationBinding(this.observerLocator, expr, next, 'textContent', runtime_1.BindingMode.toView, context);
            }
            else {
                binding = new runtime_1.InterpolationBinding(expr.firstExpression, expr, next, 'textContent', runtime_1.BindingMode.toView, this.observerLocator, context, true);
            }
            runtime_1.addBinding(renderable, binding);
        }
    };
    TextBindingRenderer.inject = [runtime_1.IExpressionParser, runtime_1.IObserverLocator];
    TextBindingRenderer = tslib_1.__decorate([
        runtime_1.instructionRenderer("ha" /* textBinding */)
        /** @internal */
    ], TextBindingRenderer);
    exports.TextBindingRenderer = TextBindingRenderer;
    let ListenerBindingRenderer = 
    /** @internal */
    class ListenerBindingRenderer {
        constructor(parser, eventManager) {
            this.parser = parser;
            this.eventManager = eventManager;
        }
        render(flags, dom, context, renderable, target, instruction) {
            const expr = runtime_1.ensureExpression(this.parser, instruction.from, 80 /* IsEventCommand */ | (instruction.strategy + 6 /* DelegationStrategyDelta */));
            const binding = new listener_1.Listener(dom, instruction.to, instruction.strategy, expr, target, instruction.preventDefault, this.eventManager, context);
            runtime_1.addBinding(renderable, binding);
        }
    };
    ListenerBindingRenderer.inject = [runtime_1.IExpressionParser, event_manager_1.IEventManager];
    ListenerBindingRenderer = tslib_1.__decorate([
        runtime_1.instructionRenderer("hb" /* listenerBinding */)
        /** @internal */
    ], ListenerBindingRenderer);
    exports.ListenerBindingRenderer = ListenerBindingRenderer;
    let SetAttributeRenderer = 
    /** @internal */
    class SetAttributeRenderer {
        render(flags, dom, context, renderable, target, instruction) {
            target.setAttribute(instruction.to, instruction.value);
        }
    };
    SetAttributeRenderer = tslib_1.__decorate([
        runtime_1.instructionRenderer("he" /* setAttribute */)
        /** @internal */
    ], SetAttributeRenderer);
    exports.SetAttributeRenderer = SetAttributeRenderer;
    let SetClassAttributeRenderer = class SetClassAttributeRenderer {
        render(flags, dom, context, renderable, target, instruction) {
            addClasses(target.classList, instruction.value);
        }
    };
    SetClassAttributeRenderer = tslib_1.__decorate([
        runtime_1.instructionRenderer("hf" /* setClassAttribute */)
    ], SetClassAttributeRenderer);
    exports.SetClassAttributeRenderer = SetClassAttributeRenderer;
    let SetStyleAttributeRenderer = class SetStyleAttributeRenderer {
        render(flags, dom, context, renderable, target, instruction) {
            target.style.cssText += instruction.value;
        }
    };
    SetStyleAttributeRenderer = tslib_1.__decorate([
        runtime_1.instructionRenderer("hg" /* setStyleAttribute */)
    ], SetStyleAttributeRenderer);
    exports.SetStyleAttributeRenderer = SetStyleAttributeRenderer;
    let StylePropertyBindingRenderer = 
    /** @internal */
    class StylePropertyBindingRenderer {
        constructor(parser, observerLocator) {
            this.parser = parser;
            this.observerLocator = observerLocator;
        }
        render(flags, dom, context, renderable, target, instruction) {
            const expr = runtime_1.ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | runtime_1.BindingMode.toView);
            const binding = new runtime_1.PropertyBinding(expr, target.style, instruction.to, runtime_1.BindingMode.toView, this.observerLocator, context);
            runtime_1.addBinding(renderable, binding);
        }
    };
    StylePropertyBindingRenderer.inject = [runtime_1.IExpressionParser, runtime_1.IObserverLocator];
    StylePropertyBindingRenderer = tslib_1.__decorate([
        runtime_1.instructionRenderer("hd" /* stylePropertyBinding */)
        /** @internal */
    ], StylePropertyBindingRenderer);
    exports.StylePropertyBindingRenderer = StylePropertyBindingRenderer;
    let AttributeBindingRenderer = 
    /** @internal */
    class AttributeBindingRenderer {
        constructor(parser, observerLocator) {
            this.parser = parser;
            this.observerLocator = observerLocator;
        }
        render(flags, dom, context, renderable, target, instruction) {
            const expr = runtime_1.ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | runtime_1.BindingMode.toView);
            const binding = new attribute_1.AttributeBinding(expr, target, instruction.attr /* targetAttribute */, instruction.to /* targetKey */, runtime_1.BindingMode.toView, this.observerLocator, context);
            runtime_1.addBinding(renderable, binding);
        }
    };
    AttributeBindingRenderer.inject = [runtime_1.IExpressionParser, runtime_1.IObserverLocator];
    AttributeBindingRenderer = tslib_1.__decorate([
        runtime_1.instructionRenderer("hc" /* attributeBinding */)
        /** @internal */
    ], AttributeBindingRenderer);
    exports.AttributeBindingRenderer = AttributeBindingRenderer;
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
//# sourceMappingURL=html-renderer.js.map