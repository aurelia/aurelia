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
        define(["require", "exports", "@aurelia/runtime", "./binding/attribute", "./binding/listener", "./observation/event-manager"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AttributeBindingRenderer = exports.StylePropertyBindingRenderer = exports.SetStyleAttributeRenderer = exports.SetClassAttributeRenderer = exports.SetAttributeRenderer = exports.ListenerBindingRenderer = exports.TextBindingRenderer = void 0;
    const runtime_1 = require("@aurelia/runtime");
    const attribute_1 = require("./binding/attribute");
    const listener_1 = require("./binding/listener");
    const event_manager_1 = require("./observation/event-manager");
    let TextBindingRenderer = 
    /** @internal */
    class TextBindingRenderer {
        constructor(parser, observerLocator, scheduler) {
            this.parser = parser;
            this.observerLocator = observerLocator;
            this.scheduler = scheduler;
        }
        render(flags, context, controller, target, instruction) {
            const next = target.nextSibling;
            if (context.dom.isMarker(target)) {
                context.dom.remove(target);
            }
            const expr = runtime_1.ensureExpression(this.parser, instruction.from, 2048 /* Interpolation */);
            const binding = new runtime_1.InterpolationBinding(this.observerLocator, expr, next, 'textContent', runtime_1.BindingMode.toView, context, this.scheduler);
            const partBindings = binding.partBindings;
            let partBinding;
            for (let i = 0, ii = partBindings.length; ii > i; ++i) {
                partBinding = partBindings[i];
                partBindings[i] = runtime_1.applyBindingBehavior(partBinding, partBinding.sourceExpression, context);
            }
            controller.addBinding(binding);
        }
    };
    TextBindingRenderer = __decorate([
        runtime_1.instructionRenderer("ha" /* textBinding */)
        /** @internal */
        ,
        __param(0, runtime_1.IExpressionParser),
        __param(1, runtime_1.IObserverLocator),
        __param(2, runtime_1.IScheduler),
        __metadata("design:paramtypes", [Object, Object, Object])
    ], TextBindingRenderer);
    exports.TextBindingRenderer = TextBindingRenderer;
    let ListenerBindingRenderer = 
    /** @internal */
    class ListenerBindingRenderer {
        constructor(parser, eventManager) {
            this.parser = parser;
            this.eventManager = eventManager;
        }
        render(flags, context, controller, target, instruction) {
            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
            const expr = runtime_1.ensureExpression(this.parser, instruction.from, 80 /* IsEventCommand */ | (instruction.strategy + 6 /* DelegationStrategyDelta */));
            const binding = runtime_1.applyBindingBehavior(new listener_1.Listener(context.dom, instruction.to, instruction.strategy, expr, target, instruction.preventDefault, this.eventManager, context), expr, context);
            controller.addBinding(binding);
        }
    };
    ListenerBindingRenderer = __decorate([
        runtime_1.instructionRenderer("hb" /* listenerBinding */)
        /** @internal */
        ,
        __param(0, runtime_1.IExpressionParser),
        __param(1, event_manager_1.IEventManager),
        __metadata("design:paramtypes", [Object, Object])
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
        runtime_1.instructionRenderer("he" /* setAttribute */)
        /** @internal */
    ], SetAttributeRenderer);
    exports.SetAttributeRenderer = SetAttributeRenderer;
    let SetClassAttributeRenderer = class SetClassAttributeRenderer {
        render(flags, context, controller, target, instruction) {
            addClasses(target.classList, instruction.value);
        }
    };
    SetClassAttributeRenderer = __decorate([
        runtime_1.instructionRenderer("hf" /* setClassAttribute */)
    ], SetClassAttributeRenderer);
    exports.SetClassAttributeRenderer = SetClassAttributeRenderer;
    let SetStyleAttributeRenderer = class SetStyleAttributeRenderer {
        render(flags, context, controller, target, instruction) {
            target.style.cssText += instruction.value;
        }
    };
    SetStyleAttributeRenderer = __decorate([
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
        render(flags, context, controller, target, instruction) {
            const expr = runtime_1.ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | runtime_1.BindingMode.toView);
            const binding = runtime_1.applyBindingBehavior(new runtime_1.PropertyBinding(expr, target.style, instruction.to, runtime_1.BindingMode.toView, this.observerLocator, context), expr, context);
            controller.addBinding(binding);
        }
    };
    StylePropertyBindingRenderer = __decorate([
        runtime_1.instructionRenderer("hd" /* stylePropertyBinding */)
        /** @internal */
        ,
        __param(0, runtime_1.IExpressionParser),
        __param(1, runtime_1.IObserverLocator),
        __metadata("design:paramtypes", [Object, Object])
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
            const expr = runtime_1.ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | runtime_1.BindingMode.toView);
            const binding = runtime_1.applyBindingBehavior(new attribute_1.AttributeBinding(expr, target, instruction.attr /* targetAttribute */, instruction.to /* targetKey */, runtime_1.BindingMode.toView, this.observerLocator, context), expr, context);
            controller.addBinding(binding);
        }
    };
    AttributeBindingRenderer = __decorate([
        runtime_1.instructionRenderer("hc" /* attributeBinding */)
        /** @internal */
        ,
        __param(0, runtime_1.IExpressionParser),
        __param(1, runtime_1.IObserverLocator),
        __metadata("design:paramtypes", [Object, Object])
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
//# sourceMappingURL=html-renderer.js.map