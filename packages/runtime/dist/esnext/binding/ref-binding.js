import { hasBind, hasUnbind, } from './ast';
export class RefBinding {
    constructor(sourceExpression, target, locator) {
        this.sourceExpression = sourceExpression;
        this.target = target;
        this.locator = locator;
        this.interceptor = this;
        this.isBound = false;
        this.$scope = void 0;
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
        if (hasBind(this.sourceExpression)) {
            this.sourceExpression.bind(flags, scope, this);
        }
        this.sourceExpression.assign(flags | 16 /* updateSourceExpression */, this.$scope, this.locator, this.target, part);
        // add isBound flag and remove isBinding flag
        this.isBound = true;
    }
    $unbind(flags) {
        if (!this.isBound) {
            return;
        }
        let sourceExpression = this.sourceExpression;
        if (sourceExpression.evaluate(flags, this.$scope, this.locator, this.part) === this.target) {
            sourceExpression.assign(flags, this.$scope, this.locator, null, this.part);
        }
        // source expression might have been modified durring assign, via a BB
        sourceExpression = this.sourceExpression;
        if (hasUnbind(sourceExpression)) {
            sourceExpression.unbind(flags, this.$scope, this.interceptor);
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
    dispose() {
        this.interceptor = (void 0);
        this.sourceExpression = (void 0);
        this.locator = (void 0);
        this.target = (void 0);
    }
}
//# sourceMappingURL=ref-binding.js.map