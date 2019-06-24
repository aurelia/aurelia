(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "@aurelia/runtime"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    const slice = Array.prototype.slice;
    /**
     * Listener binding. Handle event binding between view and view model
     */
    class Listener {
        // tslint:disable-next-line:parameters-max-number
        constructor(dom, targetEvent, delegationStrategy, sourceExpression, target, preventDefault, eventManager, locator) {
            this.dom = dom;
            this.$state = 0 /* none */;
            this.delegationStrategy = delegationStrategy;
            this.locator = locator;
            this.preventDefault = preventDefault;
            this.sourceExpression = sourceExpression;
            this.target = target;
            this.targetEvent = targetEvent;
            this.eventManager = eventManager;
        }
        callSource(event) {
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.enter('Listener', 'callSource', slice.call(arguments));
            }
            const overrideContext = this.$scope.overrideContext;
            overrideContext.$event = event;
            const result = this.sourceExpression.evaluate(2097152 /* mustEvaluate */, this.$scope, this.locator);
            Reflect.deleteProperty(overrideContext, '$event');
            if (result !== true && this.preventDefault) {
                event.preventDefault();
            }
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.leave();
            }
            return result;
        }
        handleEvent(event) {
            this.callSource(event);
        }
        $bind(flags, scope) {
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.enter('Listener', '$bind', slice.call(arguments));
            }
            if (this.$state & 4 /* isBound */) {
                if (this.$scope === scope) {
                    if (kernel_1.Tracer.enabled) {
                        kernel_1.Tracer.leave();
                    }
                    return;
                }
                this.$unbind(flags | 4096 /* fromBind */);
            }
            // add isBinding flag
            this.$state |= 1 /* isBinding */;
            this.$scope = scope;
            const sourceExpression = this.sourceExpression;
            if (runtime_1.hasBind(sourceExpression)) {
                sourceExpression.bind(flags, scope, this);
            }
            this.handler = this.eventManager.addEventListener(this.dom, this.target, this.targetEvent, this, this.delegationStrategy);
            // add isBound flag and remove isBinding flag
            this.$state |= 4 /* isBound */;
            this.$state &= ~1 /* isBinding */;
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.leave();
            }
        }
        $unbind(flags) {
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.enter('Listener', '$unbind', slice.call(arguments));
            }
            if (!(this.$state & 4 /* isBound */)) {
                if (kernel_1.Tracer.enabled) {
                    kernel_1.Tracer.leave();
                }
                return;
            }
            // add isUnbinding flag
            this.$state |= 2 /* isUnbinding */;
            const sourceExpression = this.sourceExpression;
            if (runtime_1.hasUnbind(sourceExpression)) {
                sourceExpression.unbind(flags, this.$scope, this);
            }
            this.$scope = null;
            this.handler.dispose();
            this.handler = null;
            // remove isBound and isUnbinding flags
            this.$state &= ~(4 /* isBound */ | 2 /* isUnbinding */);
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.leave();
            }
        }
        observeProperty(flags, obj, propertyName) {
            return;
        }
        handleChange(newValue, previousValue, flags) {
            return;
        }
    }
    exports.Listener = Listener;
});
//# sourceMappingURL=listener.js.map