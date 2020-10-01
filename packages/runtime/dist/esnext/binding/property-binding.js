var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IServiceLocator, Reporter, } from '@aurelia/kernel';
import { BindingMode, } from '../flags';
import { ILifecycle } from '../lifecycle';
import { IObserverLocator } from '../observation/observer-locator';
import { hasBind, hasUnbind, } from './ast';
import { connectable, } from './connectable';
// BindingMode is not a const enum (and therefore not inlined), so assigning them to a variable to save a member accessor is a minor perf tweak
const { oneTime, toView, fromView } = BindingMode;
// pre-combining flags for bitwise checks is a minor perf tweak
const toViewOrOneTime = toView | oneTime;
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
            this.targetObserver = void 0;
            this.persistentFlags = 0 /* none */;
            connectable.assignIdTo(this);
            this.$lifecycle = locator.get(ILifecycle);
        }
        ;
        updateTarget(value, flags) {
            flags |= this.persistentFlags;
            this.targetObserver.setValue(value, flags);
        }
        updateSource(value, flags) {
            flags |= this.persistentFlags;
            this.sourceExpression.assign(flags, this.$scope, this.locator, value, this.part);
        }
        handleChange(newValue, _previousValue, flags) {
            if (!this.isBound) {
                return;
            }
            flags |= this.persistentFlags;
            if ((flags & 8 /* updateTargetInstance */) > 0) {
                const previousValue = this.targetObserver.getValue();
                // if the only observable is an AccessScope then we can assume the passed-in newValue is the correct and latest value
                if (this.sourceExpression.$kind !== 10082 /* AccessScope */ || this.observerSlots > 1) {
                    newValue = this.sourceExpression.evaluate(flags, this.$scope, this.locator, this.part);
                }
                if (newValue !== previousValue) {
                    this.interceptor.updateTarget(newValue, flags);
                }
                if ((this.mode & oneTime) === 0) {
                    this.version++;
                    this.sourceExpression.connect(flags, this.$scope, this.interceptor, this.part);
                    this.interceptor.unobserve(false);
                }
                return;
            }
            if ((flags & 16 /* updateSourceExpression */) > 0) {
                if (newValue !== this.sourceExpression.evaluate(flags, this.$scope, this.locator, this.part)) {
                    this.interceptor.updateSource(newValue, flags);
                }
                return;
            }
            throw Reporter.error(15, flags);
        }
        $bind(flags, scope, part) {
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
            this.part = part;
            let sourceExpression = this.sourceExpression;
            if (hasBind(sourceExpression)) {
                sourceExpression.bind(flags, scope, this.interceptor);
            }
            let targetObserver = this.targetObserver;
            if (!targetObserver) {
                if (this.mode & fromView) {
                    targetObserver = this.targetObserver = this.observerLocator.getObserver(flags, this.target, this.targetProperty);
                }
                else {
                    targetObserver = this.targetObserver = this.observerLocator.getAccessor(flags, this.target, this.targetProperty);
                }
            }
            if (this.mode !== BindingMode.oneTime && targetObserver.bind) {
                targetObserver.bind(flags);
            }
            // during bind, binding behavior might have changed sourceExpression
            sourceExpression = this.sourceExpression;
            if (this.mode & toViewOrOneTime) {
                this.interceptor.updateTarget(sourceExpression.evaluate(flags, scope, this.locator, part), flags);
            }
            if (this.mode & toView) {
                sourceExpression.connect(flags, scope, this.interceptor, part);
            }
            if (this.mode & fromView) {
                targetObserver.subscribe(this.interceptor);
                if ((this.mode & toView) === 0) {
                    this.interceptor.updateSource(targetObserver.getValue(), flags);
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
            if (hasUnbind(this.sourceExpression)) {
                this.sourceExpression.unbind(flags, this.$scope, this.interceptor);
            }
            this.$scope = void 0;
            if (this.targetObserver.unbind) {
                this.targetObserver.unbind(flags);
            }
            if (this.targetObserver.unsubscribe) {
                this.targetObserver.unsubscribe(this.interceptor);
                this.targetObserver[this.id] &= ~16 /* updateSourceExpression */;
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