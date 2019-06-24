import * as tslib_1 from "tslib";
import { Reporter, Tracer, } from '@aurelia/kernel';
import { ILifecycle, } from '../lifecycle';
import { connectable, } from './connectable';
const slice = Array.prototype.slice;
let LetBinding = class LetBinding {
    constructor(sourceExpression, targetProperty, observerLocator, locator, toViewModel = false) {
        connectable.assignIdTo(this);
        this.$state = 0 /* none */;
        this.$lifecycle = locator.get(ILifecycle);
        this.$scope = void 0;
        this.locator = locator;
        this.observerLocator = observerLocator;
        this.sourceExpression = sourceExpression;
        this.target = null;
        this.targetProperty = targetProperty;
        this.toViewModel = toViewModel;
    }
    handleChange(_newValue, _previousValue, flags) {
        if (Tracer.enabled) {
            Tracer.enter('LetBinding', 'handleChange', slice.call(arguments));
        }
        if (!(this.$state & 4 /* isBound */)) {
            if (Tracer.enabled) {
                Tracer.leave();
            }
            return;
        }
        if (flags & 16 /* updateTargetInstance */) {
            const { target, targetProperty } = this;
            const previousValue = target[targetProperty];
            const newValue = this.sourceExpression.evaluate(flags, this.$scope, this.locator);
            if (newValue !== previousValue) {
                target[targetProperty] = newValue;
            }
            if (Tracer.enabled) {
                Tracer.leave();
            }
            return;
        }
        throw Reporter.error(15, flags);
    }
    $bind(flags, scope) {
        if (Tracer.enabled) {
            Tracer.enter('LetBinding', '$bind', slice.call(arguments));
        }
        if (this.$state & 4 /* isBound */) {
            if (this.$scope === scope) {
                if (Tracer.enabled) {
                    Tracer.leave();
                }
                return;
            }
            this.$unbind(flags | 4096 /* fromBind */);
        }
        // add isBinding flag
        this.$state |= 1 /* isBinding */;
        this.$scope = scope;
        this.target = (this.toViewModel ? scope.bindingContext : scope.overrideContext);
        const sourceExpression = this.sourceExpression;
        if (sourceExpression.bind) {
            sourceExpression.bind(flags, scope, this);
        }
        // sourceExpression might have been changed during bind
        this.target[this.targetProperty] = this.sourceExpression.evaluate(4096 /* fromBind */, scope, this.locator);
        this.sourceExpression.connect(flags, scope, this);
        // add isBound flag and remove isBinding flag
        this.$state |= 4 /* isBound */;
        this.$state &= ~1 /* isBinding */;
        if (Tracer.enabled) {
            Tracer.leave();
        }
    }
    $unbind(flags) {
        if (Tracer.enabled) {
            Tracer.enter('LetBinding', '$unbind', slice.call(arguments));
        }
        if (!(this.$state & 4 /* isBound */)) {
            if (Tracer.enabled) {
                Tracer.leave();
            }
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
        if (Tracer.enabled) {
            Tracer.leave();
        }
    }
};
LetBinding = tslib_1.__decorate([
    connectable()
], LetBinding);
export { LetBinding };
//# sourceMappingURL=let-binding.js.map