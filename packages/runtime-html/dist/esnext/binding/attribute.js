import { __decorate } from "tslib";
import { Reporter, } from '@aurelia/kernel';
import { BindingMode, connectable, hasBind, hasUnbind, IScheduler, } from '@aurelia/runtime';
import { AttributeObserver, } from '../observation/element-attribute-observer';
// BindingMode is not a const enum (and therefore not inlined), so assigning them to a variable to save a member accessor is a minor perf tweak
const { oneTime, toView, fromView } = BindingMode;
// pre-combining flags for bitwise checks is a minor perf tweak
const toViewOrOneTime = toView | oneTime;
/**
 * Attribute binding. Handle attribute binding betwen view/view model. Understand Html special attributes
 */
let AttributeBinding = class AttributeBinding {
    constructor(sourceExpression, target, 
    // some attributes may have inner structure
    // such as class -> collection of class names
    // such as style -> collection of style rules
    //
    // for normal attributes, targetAttribute and targetProperty are the same and can be ignore
    targetAttribute, targetProperty, mode, observerLocator, locator) {
        this.sourceExpression = sourceExpression;
        this.target = target;
        this.targetAttribute = targetAttribute;
        this.targetProperty = targetProperty;
        this.mode = mode;
        this.observerLocator = observerLocator;
        this.locator = locator;
        connectable.assignIdTo(this);
        this.$state = 0 /* none */;
        this.$scheduler = locator.get(IScheduler);
        this.$scope = null;
        this.persistentFlags = 0 /* none */;
    }
    updateTarget(value, flags) {
        flags |= this.persistentFlags;
        this.targetObserver.setValue(value, flags | 16 /* updateTargetInstance */);
    }
    updateSource(value, flags) {
        flags |= this.persistentFlags;
        this.sourceExpression.assign(flags | 32 /* updateSourceExpression */, this.$scope, this.locator, value);
    }
    handleChange(newValue, _previousValue, flags) {
        if (!(this.$state & 4 /* isBound */)) {
            return;
        }
        flags |= this.persistentFlags;
        if (this.mode === BindingMode.fromView) {
            flags &= ~16 /* updateTargetInstance */;
            flags |= 32 /* updateSourceExpression */;
        }
        if (flags & 16 /* updateTargetInstance */) {
            const previousValue = this.targetObserver.getValue();
            // if the only observable is an AccessScope then we can assume the passed-in newValue is the correct and latest value
            if (this.sourceExpression.$kind !== 10082 /* AccessScope */ || this.observerSlots > 1) {
                newValue = this.sourceExpression.evaluate(flags, this.$scope, this.locator, this.part);
            }
            if (newValue !== previousValue) {
                this.updateTarget(newValue, flags);
            }
            if ((this.mode & oneTime) === 0) {
                this.version++;
                this.sourceExpression.connect(flags, this.$scope, this, this.part);
                this.unobserve(false);
            }
            return;
        }
        if (flags & 32 /* updateSourceExpression */) {
            if (newValue !== this.sourceExpression.evaluate(flags, this.$scope, this.locator, this.part)) {
                this.updateSource(newValue, flags);
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
        // Store flags which we can only receive during $bind and need to pass on
        // to the AST during evaluate/connect/assign
        this.persistentFlags = flags & 2080374799 /* persistentBindingFlags */;
        this.$scope = scope;
        this.part = part;
        let sourceExpression = this.sourceExpression;
        if (hasBind(sourceExpression)) {
            sourceExpression.bind(flags, scope, this);
        }
        let targetObserver = this.targetObserver;
        if (!targetObserver) {
            targetObserver = this.targetObserver = new AttributeObserver(this.$scheduler, flags, this.observerLocator, this.target, this.targetProperty, this.targetAttribute);
        }
        if (targetObserver.bind) {
            targetObserver.bind(flags);
        }
        // during bind, binding behavior might have changed sourceExpression
        sourceExpression = this.sourceExpression;
        if (this.mode & toViewOrOneTime) {
            this.updateTarget(sourceExpression.evaluate(flags, scope, this.locator, part), flags);
        }
        if (this.mode & toView) {
            sourceExpression.connect(flags, scope, this, part);
        }
        if (this.mode & fromView) {
            targetObserver[this.id] |= 32 /* updateSourceExpression */;
            targetObserver.subscribe(this);
        }
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
        // clear persistent flags
        this.persistentFlags = 0 /* none */;
        if (hasUnbind(this.sourceExpression)) {
            this.sourceExpression.unbind(flags, this.$scope, this);
        }
        this.$scope = null;
        if (this.targetObserver.unbind) {
            this.targetObserver.unbind(flags);
        }
        if (this.targetObserver.unsubscribe) {
            this.targetObserver.unsubscribe(this);
            this.targetObserver[this.id] &= ~32 /* updateSourceExpression */;
        }
        this.unobserve(true);
        // remove isBound and isUnbinding flags
        this.$state &= ~(4 /* isBound */ | 2 /* isUnbinding */);
    }
    connect(flags) {
        if (this.$state & 4 /* isBound */) {
            flags |= this.persistentFlags;
            this.sourceExpression.connect(flags | 2097152 /* mustEvaluate */, this.$scope, this, this.part); // why do we have a connect method here in the first place? will this be called after bind?
        }
    }
};
AttributeBinding = __decorate([
    connectable()
], AttributeBinding);
export { AttributeBinding };
//# sourceMappingURL=attribute.js.map