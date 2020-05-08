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
import { BindingMode, } from '../flags';
import { IObserverLocator } from '../observation/observer-locator';
import { connectable, } from './connectable';
const { toView, oneTime } = BindingMode;
export class MultiInterpolationBinding {
    constructor(observerLocator, interpolation, target, targetProperty, mode, locator) {
        this.observerLocator = observerLocator;
        this.interpolation = interpolation;
        this.target = target;
        this.targetProperty = targetProperty;
        this.mode = mode;
        this.locator = locator;
        this.interceptor = this;
        this.$state = 0 /* none */;
        this.$scope = void 0;
        // Note: the child expressions of an Interpolation expression are full Aurelia expressions, meaning they may include
        // value converters and binding behaviors.
        // Each expression represents one ${interpolation}, and for each we create a child TextBinding unless there is only one,
        // in which case the renderer will create the TextBinding directly
        const expressions = interpolation.expressions;
        const parts = this.parts = Array(expressions.length);
        for (let i = 0, ii = expressions.length; i < ii; ++i) {
            parts[i] = new InterpolationBinding(expressions[i], interpolation, target, targetProperty, mode, observerLocator, locator, i === 0);
        }
    }
    ;
    $bind(flags, scope, part) {
        if (this.$state & 4 /* isBound */) {
            if (this.$scope === scope) {
                return;
            }
            this.interceptor.$unbind(flags);
        }
        this.$state |= 4 /* isBound */;
        this.$scope = scope;
        this.part = part;
        const parts = this.parts;
        for (let i = 0, ii = parts.length; i < ii; ++i) {
            parts[i].interceptor.$bind(flags, scope, part);
        }
    }
    $unbind(flags) {
        if (!(this.$state & 4 /* isBound */)) {
            return;
        }
        this.$state &= ~4 /* isBound */;
        this.$scope = void 0;
        const parts = this.parts;
        for (let i = 0, ii = parts.length; i < ii; ++i) {
            parts[i].interceptor.$unbind(flags);
        }
    }
}
let InterpolationBinding = class InterpolationBinding {
    constructor(sourceExpression, interpolation, target, targetProperty, mode, observerLocator, locator, isFirst) {
        this.sourceExpression = sourceExpression;
        this.interpolation = interpolation;
        this.target = target;
        this.targetProperty = targetProperty;
        this.mode = mode;
        this.observerLocator = observerLocator;
        this.locator = locator;
        this.isFirst = isFirst;
        this.interceptor = this;
        this.$state = 0 /* none */;
        connectable.assignIdTo(this);
        this.targetObserver = observerLocator.getAccessor(0 /* none */, target, targetProperty);
    }
    updateTarget(value, flags) {
        this.targetObserver.setValue(value, flags | 16 /* updateTargetInstance */);
    }
    handleChange(_newValue, _previousValue, flags) {
        if (!(this.$state & 4 /* isBound */)) {
            return;
        }
        const previousValue = this.targetObserver.getValue();
        const newValue = this.interpolation.evaluate(flags, this.$scope, this.locator, this.part);
        if (newValue !== previousValue) {
            this.interceptor.updateTarget(newValue, flags);
        }
        if ((this.mode & oneTime) === 0) {
            this.version++;
            this.sourceExpression.connect(flags, this.$scope, this.interceptor, this.part);
            this.interceptor.unobserve(false);
        }
    }
    $bind(flags, scope, part) {
        if (this.$state & 4 /* isBound */) {
            if (this.$scope === scope) {
                return;
            }
            this.interceptor.$unbind(flags);
        }
        this.$state |= 4 /* isBound */;
        this.$scope = scope;
        this.part = part;
        const sourceExpression = this.sourceExpression;
        if (sourceExpression.bind) {
            sourceExpression.bind(flags, scope, this.interceptor);
        }
        if (this.mode !== BindingMode.oneTime && this.targetObserver.bind) {
            this.targetObserver.bind(flags);
        }
        // since the interpolation already gets the whole value, we only need to let the first
        // text binding do the update if there are multiple
        if (this.isFirst) {
            this.interceptor.updateTarget(this.interpolation.evaluate(flags, scope, this.locator, part), flags);
        }
        if (this.mode & toView) {
            sourceExpression.connect(flags, scope, this.interceptor, part);
        }
    }
    $unbind(flags) {
        if (!(this.$state & 4 /* isBound */)) {
            return;
        }
        this.$state &= ~4 /* isBound */;
        const sourceExpression = this.sourceExpression;
        if (sourceExpression.unbind) {
            sourceExpression.unbind(flags, this.$scope, this.interceptor);
        }
        if (this.targetObserver.unbind) {
            this.targetObserver.unbind(flags);
        }
        this.$scope = void 0;
        this.interceptor.unobserve(true);
    }
};
InterpolationBinding = __decorate([
    connectable(),
    __metadata("design:paramtypes", [Object, Object, Object, String, Number, Object, Object, Boolean])
], InterpolationBinding);
export { InterpolationBinding };
//# sourceMappingURL=interpolation-binding.js.map