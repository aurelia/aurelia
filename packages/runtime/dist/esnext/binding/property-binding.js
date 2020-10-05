var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IServiceLocator, } from '@aurelia/kernel';
import { IScheduler, } from '@aurelia/scheduler';
import { BindingMode, } from '../flags';
import { ILifecycle } from '../lifecycle';
import { IObserverLocator } from '../observation/observer-locator';
import { connectable, } from './connectable';
// BindingMode is not a const enum (and therefore not inlined), so assigning them to a variable to save a member accessor is a minor perf tweak
const { oneTime, toView, fromView } = BindingMode;
// pre-combining flags for bitwise checks is a minor perf tweak
const toViewOrOneTime = toView | oneTime;
const updateTaskOpts = {
    reusable: false,
    preempt: true,
};
let PropertyBinding = /** @class */ (() => {
    let PropertyBinding = class PropertyBinding {
        constructor(sourceExpression, target, targetProperty, mode, observerLocator, locator) {
            this.sourceExpression = sourceExpression;
            this.target = target;
            this.targetProperty = targetProperty;
            this.mode = mode;
            this.observerLocator = observerLocator;
            this.locator = locator;
            this.interceptor = this;
            this.isBound = false;
            this.$scope = void 0;
            this.$hostScope = null;
            this.targetObserver = void 0;
            this.persistentFlags = 0 /* none */;
            this.task = null;
            connectable.assignIdTo(this);
            this.$lifecycle = locator.get(ILifecycle);
            this.$scheduler = locator.get(IScheduler);
        }
        ;
        updateTarget(value, flags) {
            flags |= this.persistentFlags;
            this.targetObserver.setValue(value, flags);
        }
        updateSource(value, flags) {
            flags |= this.persistentFlags;
            this.sourceExpression.assign(flags, this.$scope, this.$hostScope, this.locator, value);
        }
        handleChange(newValue, _previousValue, flags) {
            var _a, _b;
            if (!this.isBound) {
                return;
            }
            flags |= this.persistentFlags;
            const targetObserver = this.targetObserver;
            const interceptor = this.interceptor;
            const sourceExpression = this.sourceExpression;
            const $scope = this.$scope;
            const locator = this.locator;
            if ((flags & 8 /* updateTargetInstance */) > 0) {
                // if the only observable is an AccessScope then we can assume the passed-in newValue is the correct and latest value
                if (this.sourceExpression.$kind !== 10082 /* AccessScope */ || this.observerSlots > 1) {
                    newValue = this.sourceExpression.evaluate(flags, $scope, this.$hostScope, locator);
                }
                // Alpha: during bind a simple strategy for bind is always flush immediately
                // todo:
                //  (1). determine whether this should be the behavior
                //  (2). if not, then fix tests to reflect the changes/scheduler to properly yield all with aurelia.start().wait()
                const shouldQueueFlush = (flags & 32 /* fromBind */) === 0 && (targetObserver.type & 64 /* Layout */) > 0;
                const oldValue = targetObserver.getValue();
                if (sourceExpression.$kind !== 10082 /* AccessScope */ || this.observerSlots > 1) {
                    newValue = sourceExpression.evaluate(flags, $scope, this.$hostScope, locator);
                }
                // todo(fred): maybe let the obsrever decides whether it updates
                if (newValue !== oldValue) {
                    if (shouldQueueFlush) {
                        flags |= 4096 /* noTargetObserverQueue */;
                        (_a = this.task) === null || _a === void 0 ? void 0 : _a.cancel();
                        (_b = targetObserver.task) === null || _b === void 0 ? void 0 : _b.cancel();
                        targetObserver.task = this.task = this.$scheduler.queueRenderTask(() => {
                            var _a, _b;
                            (_b = (_a = targetObserver).flushChanges) === null || _b === void 0 ? void 0 : _b.call(_a, flags);
                            this.task = targetObserver.task = null;
                        }, updateTaskOpts);
                    }
                    interceptor.updateTarget(newValue, flags);
                }
                // todo: merge this with evaluate above
                if ((this.mode & oneTime) === 0) {
                    this.version++;
                    sourceExpression.connect(flags, $scope, this.$hostScope, this.interceptor);
                    interceptor.unobserve(false);
                }
                return;
            }
            if ((flags & 16 /* updateSourceExpression */) > 0) {
                if (newValue !== sourceExpression.evaluate(flags, $scope, this.$hostScope, locator)) {
                    interceptor.updateSource(newValue, flags);
                }
                return;
            }
            throw new Error('Unexpected handleChange context in PropertyBinding');
        }
        $bind(flags, scope, hostScope) {
            if (this.isBound) {
                if (this.$scope === scope) {
                    return;
                }
                this.interceptor.$unbind(flags | 32 /* fromBind */);
            }
            // Force property binding to always be strict
            flags |= 4 /* isStrictBindingStrategy */;
            // Store flags which we can only receive during $bind and need to pass on
            // to the AST during evaluate/connect/assign
            this.persistentFlags = flags & 31751 /* persistentBindingFlags */;
            this.$scope = scope;
            this.$hostScope = hostScope;
            let sourceExpression = this.sourceExpression;
            if (sourceExpression.hasBind) {
                sourceExpression.bind(flags, scope, hostScope, this.interceptor);
            }
            let $mode = this.mode;
            let targetObserver = this.targetObserver;
            if (!targetObserver) {
                const observerLocator = this.observerLocator;
                if ($mode & fromView) {
                    targetObserver = observerLocator.getObserver(flags, this.target, this.targetProperty);
                }
                else {
                    targetObserver = observerLocator.getAccessor(flags, this.target, this.targetProperty);
                }
                this.targetObserver = targetObserver;
            }
            if ($mode !== BindingMode.oneTime && targetObserver.bind) {
                targetObserver.bind(flags);
            }
            // deepscan-disable-next-line
            $mode = this.mode;
            // during bind, binding behavior might have changed sourceExpression
            sourceExpression = this.sourceExpression;
            const interceptor = this.interceptor;
            if ($mode & toViewOrOneTime) {
                interceptor.updateTarget(sourceExpression.evaluate(flags, scope, this.$hostScope, this.locator), flags);
            }
            if ($mode & toView) {
                sourceExpression.connect(flags, scope, this.$hostScope, interceptor);
            }
            if ($mode & fromView) {
                targetObserver.subscribe(interceptor);
                if (($mode & toView) === 0) {
                    interceptor.updateSource(targetObserver.getValue(), flags);
                }
                targetObserver[this.id] |= 16 /* updateSourceExpression */;
            }
            // add isBound flag and remove isBinding flag
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
            this.$scope = void 0;
            const targetObserver = this.targetObserver;
            const task = this.task;
            if (targetObserver.unbind) {
                targetObserver.unbind(flags);
            }
            if (targetObserver.unsubscribe) {
                targetObserver.unsubscribe(this.interceptor);
                targetObserver[this.id] &= ~16 /* updateSourceExpression */;
            }
            if (task != null) {
                task.cancel();
                if (task === targetObserver.task) {
                    targetObserver.task = null;
                }
                this.task = null;
            }
            this.interceptor.unobserve(true);
            this.isBound = false;
        }
        dispose() {
            this.interceptor = (void 0);
            this.sourceExpression = (void 0);
            this.locator = (void 0);
            this.targetObserver = (void 0);
            this.target = (void 0);
        }
    };
    PropertyBinding = __decorate([
        connectable(),
        __metadata("design:paramtypes", [Object, Object, String, Number, Object, Object])
    ], PropertyBinding);
    return PropertyBinding;
})();
export { PropertyBinding };
//# sourceMappingURL=property-binding.js.map