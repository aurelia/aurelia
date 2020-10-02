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
import { ILifecycle, } from '../lifecycle';
import { IObserverLocator } from '../observation/observer-locator';
import { connectable, } from './connectable';
let LetBinding = /** @class */ (() => {
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
            this.task = null;
            this.target = null;
            connectable.assignIdTo(this);
            this.$lifecycle = locator.get(ILifecycle);
        }
        handleChange(_newValue, _previousValue, flags) {
            if (!this.isBound) {
                return;
            }
            if (flags & 8 /* updateTargetInstance */) {
                const target = this.target;
                const targetProperty = this.targetProperty;
                const previousValue = target[targetProperty];
                const newValue = this.sourceExpression.evaluate(flags, this.$scope, this.locator, this.part);
                if (newValue !== previousValue) {
                    target[targetProperty] = newValue;
                }
                return;
            }
            throw new Error('Unexpected handleChange context in LetBinding');
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
            this.target = (this.toBindingContext ? scope.bindingContext : scope.overrideContext);
            const sourceExpression = this.sourceExpression;
            if (sourceExpression.bind) {
                sourceExpression.bind(flags, scope, this.interceptor);
            }
            // sourceExpression might have been changed during bind
            this.target[this.targetProperty] = this.sourceExpression.evaluate(flags | 32 /* fromBind */, scope, this.locator, part);
            this.sourceExpression.connect(flags, scope, this.interceptor, part);
            // add isBound flag and remove isBinding flag
            this.isBound = true;
        }
        $unbind(flags) {
            if (!this.isBound) {
                return;
            }
            const sourceExpression = this.sourceExpression;
            if (sourceExpression.unbind) {
                sourceExpression.unbind(flags, this.$scope, this.interceptor);
            }
            this.$scope = void 0;
            this.interceptor.unobserve(true);
            // remove isBound and isUnbinding flags
            this.isBound = false;
        }
        dispose() {
            this.interceptor = (void 0);
            this.sourceExpression = (void 0);
            this.locator = (void 0);
            this.target = (void 0);
        }
    };
    LetBinding = __decorate([
        connectable(),
        __metadata("design:paramtypes", [Object, String, Object, Object, Boolean])
    ], LetBinding);
    return LetBinding;
})();
export { LetBinding };
//# sourceMappingURL=let-binding.js.map