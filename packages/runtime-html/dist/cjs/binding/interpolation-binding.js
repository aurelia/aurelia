"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentBinding = exports.InterpolationPartBinding = exports.InterpolationBinding = void 0;
const runtime_1 = require("@aurelia/runtime");
const { toView } = runtime_1.BindingMode;
const queueTaskOptions = {
    reusable: false,
    preempt: true,
};
// a pseudo binding to manage multiple InterpolationBinding s
// ========
// Note: the child expressions of an Interpolation expression are full Aurelia expressions, meaning they may include
// value converters and binding behaviors.
// Each expression represents one ${interpolation}, and for each we create a child TextBinding unless there is only one,
// in which case the renderer will create the TextBinding directly
class InterpolationBinding {
    constructor(observerLocator, interpolation, target, targetProperty, mode, locator, taskQueue) {
        this.observerLocator = observerLocator;
        this.interpolation = interpolation;
        this.target = target;
        this.targetProperty = targetProperty;
        this.mode = mode;
        this.locator = locator;
        this.taskQueue = taskQueue;
        this.interceptor = this;
        this.isBound = false;
        this.$scope = void 0;
        this.$hostScope = null;
        this.task = null;
        this.targetObserver = observerLocator.getAccessor(target, targetProperty);
        const expressions = interpolation.expressions;
        const partBindings = this.partBindings = Array(expressions.length);
        for (let i = 0, ii = expressions.length; i < ii; ++i) {
            partBindings[i] = new InterpolationPartBinding(expressions[i], target, targetProperty, locator, observerLocator, this);
        }
    }
    updateTarget(value, flags) {
        const partBindings = this.partBindings;
        const staticParts = this.interpolation.parts;
        const ii = partBindings.length;
        let result = '';
        if (ii === 1) {
            result = staticParts[0] + partBindings[0].value + staticParts[1];
        }
        else {
            result = staticParts[0];
            for (let i = 0; ii > i; ++i) {
                result += partBindings[i].value + staticParts[i + 1];
            }
        }
        const targetObserver = this.targetObserver;
        // Alpha: during bind a simple strategy for bind is always flush immediately
        // todo:
        //  (1). determine whether this should be the behavior
        //  (2). if not, then fix tests to reflect the changes/platform to properly yield all with aurelia.start().wait()
        const shouldQueueFlush = (flags & 2 /* fromBind */) === 0 && (targetObserver.type & 4 /* Layout */) > 0;
        if (shouldQueueFlush) {
            // Queue the new one before canceling the old one, to prevent early yield
            const task = this.task;
            this.task = this.taskQueue.queueTask(() => {
                this.task = null;
                targetObserver.setValue(result, flags, this.target, this.targetProperty);
            }, queueTaskOptions);
            task === null || task === void 0 ? void 0 : task.cancel();
        }
        else {
            targetObserver.setValue(result, flags, this.target, this.targetProperty);
        }
    }
    $bind(flags, scope, hostScope) {
        if (this.isBound) {
            if (this.$scope === scope) {
                return;
            }
            this.interceptor.$unbind(flags);
        }
        this.isBound = true;
        this.$scope = scope;
        const partBindings = this.partBindings;
        for (let i = 0, ii = partBindings.length; ii > i; ++i) {
            partBindings[i].$bind(flags, scope, hostScope);
        }
        this.updateTarget(void 0, flags);
    }
    $unbind(flags) {
        var _a;
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        this.$scope = void 0;
        const partBindings = this.partBindings;
        for (let i = 0, ii = partBindings.length; i < ii; ++i) {
            partBindings[i].interceptor.$unbind(flags);
        }
        (_a = this.task) === null || _a === void 0 ? void 0 : _a.cancel();
        this.task = null;
    }
}
exports.InterpolationBinding = InterpolationBinding;
class InterpolationPartBinding {
    constructor(sourceExpression, target, targetProperty, locator, observerLocator, owner) {
        this.sourceExpression = sourceExpression;
        this.target = target;
        this.targetProperty = targetProperty;
        this.locator = locator;
        this.observerLocator = observerLocator;
        this.owner = owner;
        this.interceptor = this;
        // at runtime, mode may be overriden by binding behavior
        // but it wouldn't matter here, just start with something for later check
        this.mode = runtime_1.BindingMode.toView;
        this.value = '';
        this.$hostScope = null;
        this.task = null;
        this.isBound = false;
    }
    handleChange(newValue, oldValue, flags) {
        if (!this.isBound) {
            return;
        }
        const sourceExpression = this.sourceExpression;
        const obsRecord = this.obs;
        const canOptimize = sourceExpression.$kind === 10082 /* AccessScope */ && obsRecord.count === 1;
        if (!canOptimize) {
            const shouldConnect = (this.mode & toView) > 0;
            if (shouldConnect) {
                obsRecord.version++;
            }
            newValue = sourceExpression.evaluate(flags, this.$scope, this.$hostScope, this.locator, shouldConnect ? this.interceptor : null);
            if (shouldConnect) {
                obsRecord.clear(false);
            }
        }
        if (newValue != this.value) {
            this.value = newValue;
            if (newValue instanceof Array) {
                this.observeCollection(newValue);
            }
            this.owner.updateTarget(newValue, flags);
        }
    }
    handleCollectionChange(indexMap, flags) {
        this.owner.updateTarget(void 0, flags);
    }
    $bind(flags, scope, hostScope) {
        if (this.isBound) {
            if (this.$scope === scope) {
                return;
            }
            this.interceptor.$unbind(flags);
        }
        this.isBound = true;
        this.$scope = scope;
        this.$hostScope = hostScope;
        if (this.sourceExpression.hasBind) {
            this.sourceExpression.bind(flags, scope, hostScope, this.interceptor);
        }
        const v = this.value = this.sourceExpression.evaluate(flags, scope, hostScope, this.locator, (this.mode & toView) > 0 ? this.interceptor : null);
        if (v instanceof Array) {
            this.observeCollection(v);
        }
    }
    $unbind(flags) {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        if (this.sourceExpression.hasUnbind) {
            this.sourceExpression.unbind(flags, this.$scope, this.$hostScope, this.interceptor);
        }
        this.$scope = void 0;
        this.$hostScope = null;
        this.obs.clear(true);
    }
}
exports.InterpolationPartBinding = InterpolationPartBinding;
runtime_1.connectable(InterpolationPartBinding);
/**
 * A binding for handling the element content interpolation
 */
class ContentBinding {
    constructor(sourceExpression, target, locator, observerLocator, p) {
        this.sourceExpression = sourceExpression;
        this.target = target;
        this.locator = locator;
        this.observerLocator = observerLocator;
        this.p = p;
        this.interceptor = this;
        // at runtime, mode may be overriden by binding behavior
        // but it wouldn't matter here, just start with something for later check
        this.mode = runtime_1.BindingMode.toView;
        this.value = '';
        this.$hostScope = null;
        this.task = null;
        this.isBound = false;
    }
    updateTarget(value, flags) {
        var _a, _b;
        const target = this.target;
        const NodeCtor = this.p.Node;
        const oldValue = this.value;
        this.value = value;
        if (oldValue instanceof NodeCtor) {
            (_a = oldValue.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(oldValue);
        }
        if (value instanceof NodeCtor) {
            target.textContent = '';
            (_b = target.parentNode) === null || _b === void 0 ? void 0 : _b.insertBefore(value, target);
        }
        else {
            target.textContent = String(value);
        }
    }
    handleChange(newValue, oldValue, flags) {
        var _a;
        if (!this.isBound) {
            return;
        }
        const sourceExpression = this.sourceExpression;
        const obsRecord = this.obs;
        const canOptimize = sourceExpression.$kind === 10082 /* AccessScope */ && obsRecord.count === 1;
        if (!canOptimize) {
            const shouldConnect = (this.mode & toView) > 0;
            if (shouldConnect) {
                obsRecord.version++;
            }
            newValue = sourceExpression.evaluate(flags, this.$scope, this.$hostScope, this.locator, shouldConnect ? this.interceptor : null);
            if (shouldConnect) {
                obsRecord.clear(false);
            }
        }
        if (newValue === this.value) {
            // in a frequent update, e.g collection mutation in a loop
            // value could be changing frequently and previous update task may be stale at this point
            // cancel if any task going on because the latest value is already the same
            (_a = this.task) === null || _a === void 0 ? void 0 : _a.cancel();
            this.task = null;
            return;
        }
        // Alpha: during bind a simple strategy for bind is always flush immediately
        // todo:
        //  (1). determine whether this should be the behavior
        //  (2). if not, then fix tests to reflect the changes/platform to properly yield all with aurelia.start().wait()
        const shouldQueueFlush = (flags & 2 /* fromBind */) === 0;
        if (shouldQueueFlush) {
            this.queueUpdate(newValue, flags);
        }
        else {
            this.updateTarget(newValue, flags);
        }
    }
    handleCollectionChange() {
        this.queueUpdate(this.value, 0 /* none */);
    }
    $bind(flags, scope, hostScope) {
        if (this.isBound) {
            if (this.$scope === scope) {
                return;
            }
            this.interceptor.$unbind(flags);
        }
        this.isBound = true;
        this.$scope = scope;
        this.$hostScope = hostScope;
        if (this.sourceExpression.hasBind) {
            this.sourceExpression.bind(flags, scope, hostScope, this.interceptor);
        }
        const v = this.value = this.sourceExpression.evaluate(flags, scope, hostScope, this.locator, (this.mode & toView) > 0 ? this.interceptor : null);
        if (v instanceof Array) {
            this.observeCollection(v);
        }
        this.updateTarget(v, flags);
    }
    $unbind(flags) {
        var _a;
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        if (this.sourceExpression.hasUnbind) {
            this.sourceExpression.unbind(flags, this.$scope, this.$hostScope, this.interceptor);
        }
        // TODO: should existing value (either connected node, or a string)
        // be removed when this binding is unbound?
        // this.updateTarget('', flags);
        this.$scope = void 0;
        this.$hostScope = null;
        this.obs.clear(true);
        (_a = this.task) === null || _a === void 0 ? void 0 : _a.cancel();
        this.task = null;
    }
    // queue a force update
    queueUpdate(newValue, flags) {
        const task = this.task;
        this.task = this.p.domWriteQueue.queueTask(() => {
            this.task = null;
            this.updateTarget(newValue, flags);
        }, queueTaskOptions);
        task === null || task === void 0 ? void 0 : task.cancel();
    }
}
exports.ContentBinding = ContentBinding;
runtime_1.connectable(ContentBinding);
//# sourceMappingURL=interpolation-binding.js.map