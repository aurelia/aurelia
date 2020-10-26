(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RefBinding = void 0;
    class RefBinding {
        constructor(sourceExpression, target, locator) {
            this.sourceExpression = sourceExpression;
            this.target = target;
            this.locator = locator;
            this.interceptor = this;
            this.isBound = false;
            this.$scope = void 0;
            this.$hostScope = null;
        }
        $bind(flags, scope, hostScope) {
            if (this.isBound) {
                if (this.$scope === scope) {
                    return;
                }
                this.interceptor.$unbind(flags | 32 /* fromBind */);
            }
            this.$scope = scope;
            this.$hostScope = hostScope;
            if (this.sourceExpression.hasBind) {
                this.sourceExpression.bind(flags, scope, hostScope, this);
            }
            this.sourceExpression.assign(flags | 16 /* updateSourceExpression */, this.$scope, hostScope, this.locator, this.target);
            // add isBound flag and remove isBinding flag
            this.isBound = true;
        }
        $unbind(flags) {
            if (!this.isBound) {
                return;
            }
            let sourceExpression = this.sourceExpression;
            if (sourceExpression.evaluate(flags, this.$scope, this.$hostScope, this.locator, null) === this.target) {
                sourceExpression.assign(flags, this.$scope, this.$hostScope, this.locator, null);
            }
            // source expression might have been modified durring assign, via a BB
            sourceExpression = this.sourceExpression;
            if (sourceExpression.hasUnbind) {
                sourceExpression.unbind(flags, this.$scope, this.$hostScope, this.interceptor);
            }
            this.$scope = void 0;
            this.isBound = false;
        }
        observeProperty(flags, obj, propertyName) {
            return;
        }
        handleChange(newValue, previousValue, flags) {
            return;
        }
    }
    exports.RefBinding = RefBinding;
});
//# sourceMappingURL=ref-binding.js.map