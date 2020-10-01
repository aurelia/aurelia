(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/runtime"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Listener = void 0;
    const runtime_1 = require("@aurelia/runtime");
    /**
     * Listener binding. Handle event binding between view and view model
     */
    class Listener {
        constructor(dom, targetEvent, delegationStrategy, sourceExpression, target, preventDefault, eventManager, locator) {
            this.dom = dom;
            this.targetEvent = targetEvent;
            this.delegationStrategy = delegationStrategy;
            this.sourceExpression = sourceExpression;
            this.target = target;
            this.preventDefault = preventDefault;
            this.eventManager = eventManager;
            this.locator = locator;
            this.interceptor = this;
            this.isBound = false;
        }
        callSource(event) {
            const overrideContext = this.$scope.overrideContext;
            overrideContext.$event = event;
            const result = this.sourceExpression.evaluate(128 /* mustEvaluate */, this.$scope, this.locator, this.part);
            Reflect.deleteProperty(overrideContext, '$event');
            if (result !== true && this.preventDefault) {
                event.preventDefault();
            }
            return result;
        }
        handleEvent(event) {
            this.interceptor.callSource(event);
        }
        $bind(flags, scope, part) {
            if (this.isBound) {
                if (this.$scope === scope) {
                    return;
                }
                this.interceptor.$unbind(flags | 32 /* fromBind */);
            }
            this.$scope = scope;
            this.part = part;
            const sourceExpression = this.sourceExpression;
            if (runtime_1.hasBind(sourceExpression)) {
                sourceExpression.bind(flags, scope, this.interceptor);
            }
            this.handler = this.eventManager.addEventListener(this.dom, this.target, this.targetEvent, this, this.delegationStrategy);
            // add isBound flag and remove isBinding flag
            this.isBound = true;
        }
        $unbind(flags) {
            if (!this.isBound) {
                return;
            }
            const sourceExpression = this.sourceExpression;
            if (runtime_1.hasUnbind(sourceExpression)) {
                sourceExpression.unbind(flags, this.$scope, this.interceptor);
            }
            this.$scope = null;
            this.handler.dispose();
            this.handler = null;
            // remove isBound and isUnbinding flags
            this.isBound = false;
        }
        observeProperty(flags, obj, propertyName) {
            return;
        }
        handleChange(newValue, previousValue, flags) {
            return;
        }
        dispose() {
            this.interceptor = (void 0);
            this.sourceExpression = (void 0);
            this.locator = (void 0);
            this.target = (void 0);
        }
    }
    exports.Listener = Listener;
});
//# sourceMappingURL=listener.js.map