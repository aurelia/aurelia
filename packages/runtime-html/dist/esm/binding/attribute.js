import { BindingMode, connectable, } from '@aurelia/runtime';
import { AttributeObserver } from '../observation/element-attribute-observer.js';
import { IPlatform } from '../platform.js';
// BindingMode is not a const enum (and therefore not inlined), so assigning them to a variable to save a member accessor is a minor perf tweak
const { oneTime, toView, fromView } = BindingMode;
// pre-combining flags for bitwise checks is a minor perf tweak
const toViewOrOneTime = toView | oneTime;
const taskOptions = {
    reusable: false,
    preempt: true,
};
/**
 * Attribute binding. Handle attribute binding betwen view/view model. Understand Html special attributes
 */
export class AttributeBinding {
    constructor(sourceExpression, target, 
    // some attributes may have inner structure
    // such as class -> collection of class names
    // such as style -> collection of style rules
    //
    // for normal attributes, targetAttribute and targetProperty are the same and can be ignore
    targetAttribute, targetProperty, mode, observerLocator, locator) {
        this.sourceExpression = sourceExpression;
        this.targetAttribute = targetAttribute;
        this.targetProperty = targetProperty;
        this.mode = mode;
        this.observerLocator = observerLocator;
        this.locator = locator;
        this.interceptor = this;
        this.isBound = false;
        this.$scope = null;
        this.$hostScope = null;
        this.task = null;
        this.persistentFlags = 0 /* none */;
        this.value = void 0;
        this.target = target;
        connectable.assignIdTo(this);
        this.$platform = locator.get(IPlatform);
    }
    updateTarget(value, flags) {
        flags |= this.persistentFlags;
        this.targetObserver.setValue(value, flags | 8 /* updateTarget */, this.target, this.targetProperty);
    }
    updateSource(value, flags) {
        flags |= this.persistentFlags;
        this.sourceExpression.assign(flags | 16 /* updateSource */, this.$scope, this.$hostScope, this.locator, value);
    }
    handleChange(newValue, _previousValue, flags) {
        if (!this.isBound) {
            return;
        }
        flags |= this.persistentFlags;
        const mode = this.mode;
        const interceptor = this.interceptor;
        const sourceExpression = this.sourceExpression;
        const $scope = this.$scope;
        const locator = this.locator;
        if (mode === BindingMode.fromView) {
            flags &= ~8 /* updateTarget */;
            flags |= 16 /* updateSource */;
        }
        if (flags & 8 /* updateTarget */) {
            const targetObserver = this.targetObserver;
            // Alpha: during bind a simple strategy for bind is always flush immediately
            // todo:
            //  (1). determine whether this should be the behavior
            //  (2). if not, then fix tests to reflect the changes/platform to properly yield all with aurelia.start()
            const shouldQueueFlush = (flags & 32 /* fromBind */) === 0 && (targetObserver.type & 4 /* Layout */) > 0;
            if (sourceExpression.$kind !== 10082 /* AccessScope */ || this.obs.count > 1) {
                const shouldConnect = (mode & oneTime) === 0;
                if (shouldConnect) {
                    this.obs.version++;
                }
                newValue = sourceExpression.evaluate(flags, $scope, this.$hostScope, locator, interceptor);
                if (shouldConnect) {
                    this.obs.clear(false);
                }
            }
            if (newValue !== this.value) {
                this.value = newValue;
                if (shouldQueueFlush) {
                    this.task?.cancel();
                    this.task = this.$platform.domWriteQueue.queueTask(() => {
                        this.task = null;
                        interceptor.updateTarget(newValue, flags);
                    }, taskOptions);
                }
                else {
                    interceptor.updateTarget(newValue, flags);
                }
            }
            return;
        }
        if (flags & 16 /* updateSource */) {
            if (newValue !== sourceExpression.evaluate(flags, $scope, this.$hostScope, locator, null)) {
                interceptor.updateSource(newValue, flags);
            }
            return;
        }
        throw new Error('Unexpected handleChange context in AttributeBinding');
    }
    $bind(flags, scope, hostScope, projection) {
        if (this.isBound) {
            if (this.$scope === scope) {
                return;
            }
            this.interceptor.$unbind(flags | 32 /* fromBind */);
        }
        // Store flags which we can only receive during $bind and need to pass on
        // to the AST during evaluate/connect/assign
        this.persistentFlags = flags & 15367 /* persistentBindingFlags */;
        this.$scope = scope;
        this.$hostScope = hostScope;
        this.projection = projection;
        let sourceExpression = this.sourceExpression;
        if (sourceExpression.hasBind) {
            sourceExpression.bind(flags, scope, hostScope, this.interceptor);
        }
        let targetObserver = this.targetObserver;
        if (!targetObserver) {
            targetObserver = this.targetObserver = new AttributeObserver(this.$platform, this.observerLocator, this.target, this.targetProperty, this.targetAttribute);
        }
        // during bind, binding behavior might have changed sourceExpression
        sourceExpression = this.sourceExpression;
        const $mode = this.mode;
        const interceptor = this.interceptor;
        if ($mode & toViewOrOneTime) {
            const shouldConnect = ($mode & toView) > 0;
            interceptor.updateTarget(this.value = sourceExpression.evaluate(flags, scope, this.$hostScope, this.locator, shouldConnect ? interceptor : null), flags);
        }
        if ($mode & fromView) {
            targetObserver[this.id] |= 16 /* updateSource */;
            targetObserver.subscribe(interceptor);
        }
        this.isBound = true;
    }
    $unbind(flags) {
        if (!this.isBound) {
            return;
        }
        // clear persistent flags
        this.persistentFlags = 0 /* none */;
        if (this.sourceExpression.hasUnbind) {
            this.sourceExpression.unbind(flags, this.$scope, this.$hostScope, this.interceptor);
        }
        this.$scope
            = this.$hostScope
                = null;
        this.value = void 0;
        const targetObserver = this.targetObserver;
        if (targetObserver.unsubscribe) {
            targetObserver.unsubscribe(this.interceptor);
            targetObserver[this.id] &= ~16 /* updateSource */;
        }
        this.task?.cancel();
        this.task = null;
        this.obs.clear(true);
        // remove isBound and isUnbinding flags
        this.isBound = false;
    }
}
connectable(AttributeBinding);
//# sourceMappingURL=attribute.js.map