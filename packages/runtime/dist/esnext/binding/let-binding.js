var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { connectable } from './connectable.js';
let LetBinding = class LetBinding {
    constructor(sourceExpression, targetProperty, observerLocator, locator, toBindingContext = false) {
        this.sourceExpression = sourceExpression;
        this.targetProperty = targetProperty;
        this.observerLocator = observerLocator;
        this.locator = locator;
        this.toBindingContext = toBindingContext;
        this.interceptor = this;
        this.isBound = false;
        this.$scope = void 0;
        this.$hostScope = null;
        this.task = null;
        this.target = null;
        connectable.assignIdTo(this);
    }
    handleChange(_newValue, _previousValue, flags) {
        if (!this.isBound) {
            return;
        }
        if (flags & 8 /* updateTarget */) {
            const target = this.target;
            const targetProperty = this.targetProperty;
            const previousValue = target[targetProperty];
            this.record.version++;
            const newValue = this.sourceExpression.evaluate(flags, this.$scope, this.$hostScope, this.locator, this.interceptor);
            this.record.clear(false);
            if (newValue !== previousValue) {
                target[targetProperty] = newValue;
            }
            return;
        }
        throw new Error('Unexpected handleChange context in LetBinding');
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
        this.target = (this.toBindingContext ? (hostScope !== null && hostScope !== void 0 ? hostScope : scope).bindingContext : (hostScope !== null && hostScope !== void 0 ? hostScope : scope).overrideContext);
        const sourceExpression = this.sourceExpression;
        if (sourceExpression.hasBind) {
            sourceExpression.bind(flags, scope, hostScope, this.interceptor);
        }
        // sourceExpression might have been changed during bind
        this.target[this.targetProperty]
            = this.sourceExpression.evaluate(flags | 32 /* fromBind */, scope, hostScope, this.locator, this.interceptor);
        // add isBound flag and remove isBinding flag
        this.isBound = true;
    }
    $unbind(flags) {
        if (!this.isBound) {
            return;
        }
        const sourceExpression = this.sourceExpression;
        if (sourceExpression.hasUnbind) {
            sourceExpression.unbind(flags, this.$scope, this.$hostScope, this.interceptor);
        }
        this.$scope = void 0;
        this.$hostScope = null;
        this.record.clear(true);
        // remove isBound and isUnbinding flags
        this.isBound = false;
    }
};
LetBinding = __decorate([
    connectable()
], LetBinding);
export { LetBinding };
//# sourceMappingURL=let-binding.js.map