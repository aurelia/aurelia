import { __decorate } from "tslib";
import { Reporter, } from '@aurelia/kernel';
import { ILifecycle, } from '../lifecycle';
import { connectable, } from './connectable';
let LetBinding = class LetBinding {
    constructor(sourceExpression, targetProperty, observerLocator, locator, toBindingContext = false) {
        this.sourceExpression = sourceExpression;
        this.targetProperty = targetProperty;
        this.observerLocator = observerLocator;
        this.locator = locator;
        this.toBindingContext = toBindingContext;
        this.$state = 0 /* none */;
        this.$scope = void 0;
        this.target = null;
        connectable.assignIdTo(this);
        this.$lifecycle = locator.get(ILifecycle);
    }
    handleChange(_newValue, _previousValue, flags) {
        if (!(this.$state & 4 /* isBound */)) {
            return;
        }
        if (flags & 16 /* updateTargetInstance */) {
            const { target, targetProperty } = this;
            const previousValue = target[targetProperty];
            const newValue = this.sourceExpression.evaluate(flags, this.$scope, this.locator, this.part);
            if (newValue !== previousValue) {
                target[targetProperty] = newValue;
            }
            return;
        }
        throw Reporter.error(15, flags);
    }
    $bind(flags, scope, part) {
        if (this.$state & 4 /* isBound */) {
            if (this.$scope === scope) {
                return;
            }
            this.$unbind(flags | 4096 /* fromBind */);
        }
        // add isBinding flag
        this.$state |= 1 /* isBinding */;
        this.$scope = scope;
        this.part = part;
        this.target = (this.toBindingContext ? scope.bindingContext : scope.overrideContext);
        const sourceExpression = this.sourceExpression;
        if (sourceExpression.bind) {
            sourceExpression.bind(flags, scope, this);
        }
        // sourceExpression might have been changed during bind
        this.target[this.targetProperty] = this.sourceExpression.evaluate(flags | 4096 /* fromBind */, scope, this.locator, part);
        this.sourceExpression.connect(flags, scope, this, part);
        // add isBound flag and remove isBinding flag
        this.$state |= 4 /* isBound */;
        this.$state &= ~1 /* isBinding */;
    }
    $unbind(flags) {
        if (!(this.$state & 4 /* isBound */)) {
            return;
        }
        // add isUnbinding flag
        this.$state |= 2 /* isUnbinding */;
        const sourceExpression = this.sourceExpression;
        if (sourceExpression.unbind) {
            sourceExpression.unbind(flags, this.$scope, this);
        }
        this.$scope = void 0;
        this.unobserve(true);
        // remove isBound and isUnbinding flags
        this.$state &= ~(4 /* isBound */ | 2 /* isUnbinding */);
    }
};
LetBinding = __decorate([
    connectable()
], LetBinding);
export { LetBinding };
//# sourceMappingURL=let-binding.js.map