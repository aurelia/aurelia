import { hasBind, hasUnbind, } from './ast';
const slice = Array.prototype.slice;
export class CallBinding {
    constructor(sourceExpression, target, targetProperty, observerLocator, locator) {
        this.$state = 0 /* none */;
        this.locator = locator;
        this.sourceExpression = sourceExpression;
        this.targetObserver = observerLocator.getObserver(0 /* none */, target, targetProperty);
    }
    callSource(args) {
        const overrideContext = this.$scope.overrideContext;
        Object.assign(overrideContext, args);
        const result = this.sourceExpression.evaluate(2097152 /* mustEvaluate */, this.$scope, this.locator, this.part);
        for (const prop in args) {
            Reflect.deleteProperty(overrideContext, prop);
        }
        return result;
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
        if (hasBind(this.sourceExpression)) {
            this.sourceExpression.bind(flags, scope, this);
        }
        this.targetObserver.setValue(($args) => this.callSource($args), flags);
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
        if (hasUnbind(this.sourceExpression)) {
            this.sourceExpression.unbind(flags, this.$scope, this);
        }
        this.$scope = void 0;
        this.targetObserver.setValue(null, flags);
        // remove isBound and isUnbinding flags
        this.$state &= ~(4 /* isBound */ | 2 /* isUnbinding */);
    }
    observeProperty(flags, obj, propertyName) {
        return;
    }
    handleChange(newValue, previousValue, flags) {
        return;
    }
}
//# sourceMappingURL=call-binding.js.map