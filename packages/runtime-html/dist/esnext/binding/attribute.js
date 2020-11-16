var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IServiceLocator } from '@aurelia/kernel';
import { BindingMode, connectable, IObserverLocator, } from '@aurelia/runtime';
import { AttributeObserver } from '../observation/element-attribute-observer.js';
import { IPlatform } from '../platform.js';
import { INode } from '../dom.js';
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
let AttributeBinding = class AttributeBinding {
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
        var _a;
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
            const shouldQueueFlush = (flags & 32 /* fromBind */) === 0 && (targetObserver.type & 64 /* Layout */) > 0;
            // unlike property binding
            // attr binding read can be potentially expensive
            // so caching the read. Consider a way to force read configurably
            const oldValue = this.value;
            if (sourceExpression.$kind !== 10082 /* AccessScope */ || this.observerSlots > 1) {
                const shouldConnect = (mode & oneTime) === 0;
                if (shouldConnect) {
                    this.version++;
                }
                newValue = sourceExpression.evaluate(flags, $scope, this.$hostScope, locator, interceptor);
                if (shouldConnect) {
                    interceptor.unobserve(false);
                }
            }
            if (newValue !== oldValue) {
                this.value = newValue;
                if (shouldQueueFlush) {
                    (_a = this.task) === null || _a === void 0 ? void 0 : _a.cancel();
                    this.task = this.$platform.domWriteQueue.queueTask(() => {
                        if (this.isBound) {
                            interceptor.updateTarget(newValue, flags);
                        }
                        this.task = null;
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
        if (targetObserver.bind) {
            targetObserver.bind(flags);
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
        this.$scope = null;
        const targetObserver = this.targetObserver;
        const task = this.task;
        if (targetObserver.unbind) {
            targetObserver.unbind(flags);
        }
        if (targetObserver.unsubscribe) {
            targetObserver.unsubscribe(this.interceptor);
            targetObserver[this.id] &= ~16 /* updateSource */;
        }
        if (task != null) {
            task.cancel();
            this.task = null;
        }
        this.interceptor.unobserve(true);
        // remove isBound and isUnbinding flags
        this.isBound = false;
    }
};
AttributeBinding = __decorate([
    connectable(),
    __metadata("design:paramtypes", [Object, Object, String, String, Number, Object, Object])
], AttributeBinding);
export { AttributeBinding };
//# sourceMappingURL=attribute.js.map