import { hasBind, hasUnbind, } from './ast';
const slice = Array.prototype.slice;
export class RefBinding {
    constructor(sourceExpression, target, locator) {
        this.$state = 0 /* none */;
        this.$scope = void 0;
        this.locator = locator;
        this.sourceExpression = sourceExpression;
        this.target = target;
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
        this.sourceExpression.assign(flags | 32 /* updateSourceExpression */, this.$scope, this.locator, this.target, part);
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
        let sourceExpression = this.sourceExpression;
        if (sourceExpression.evaluate(flags, this.$scope, this.locator, this.part) === this.target) {
            sourceExpression.assign(flags, this.$scope, this.locator, null, this.part);
        }
        // source expression might have been modified durring assign, via a BB
        sourceExpression = this.sourceExpression;
        if (hasUnbind(sourceExpression)) {
            sourceExpression.unbind(flags, this.$scope, this);
        }
        this.$scope = void 0;
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
//# sourceMappingURL=ref-binding.js.map