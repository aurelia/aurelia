import { Tracer, } from '@aurelia/kernel';
import { hasBind, hasUnbind, } from './ast';
const slice = Array.prototype.slice;
export class Call {
    constructor(sourceExpression, target, targetProperty, observerLocator, locator) {
        this.$state = 0 /* none */;
        this.locator = locator;
        this.sourceExpression = sourceExpression;
        this.targetObserver = observerLocator.getObserver(0 /* none */, target, targetProperty);
    }
    callSource(args) {
        if (Tracer.enabled) {
            Tracer.enter('Call', 'callSource', slice.call(arguments));
        }
        const overrideContext = this.$scope.overrideContext;
        Object.assign(overrideContext, args);
        const result = this.sourceExpression.evaluate(2097152 /* mustEvaluate */, this.$scope, this.locator);
        for (const prop in args) {
            Reflect.deleteProperty(overrideContext, prop);
        }
        if (Tracer.enabled) {
            Tracer.leave();
        }
        return result;
    }
    $bind(flags, scope) {
        if (Tracer.enabled) {
            Tracer.enter('Call', '$bind', slice.call(arguments));
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
        if (hasBind(this.sourceExpression)) {
            this.sourceExpression.bind(flags, scope, this);
        }
        this.targetObserver.setValue(($args) => this.callSource($args), flags);
        // add isBound flag and remove isBinding flag
        this.$state |= 4 /* isBound */;
        this.$state &= ~1 /* isBinding */;
        if (Tracer.enabled) {
            Tracer.leave();
        }
    }
    $unbind(flags) {
        if (Tracer.enabled) {
            Tracer.enter('Call', '$unbind', slice.call(arguments));
        }
        if (!(this.$state & 4 /* isBound */)) {
            if (Tracer.enabled) {
                Tracer.leave();
            }
            return;
        }
        // add isUnbinding flag
        this.$state |= 2 /* isUnbinding */;
        if (hasUnbind(this.sourceExpression)) {
            this.sourceExpression.unbind(flags, this.$scope, this);
        }
        this.$scope = void 0;
        this.targetObserver.setValue(null, flags);
        // remove isBound and isUnbinding flags
        this.$state &= ~(4 /* isBound */ | 2 /* isUnbinding */);
        if (Tracer.enabled) {
            Tracer.leave();
        }
    }
    observeProperty(flags, obj, propertyName) {
        return;
    }
    handleChange(newValue, previousValue, flags) {
        return;
    }
}
//# sourceMappingURL=call.js.map