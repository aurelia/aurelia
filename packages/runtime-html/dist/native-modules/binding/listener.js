import { DelegationStrategy, } from '../../../../runtime/dist/native-modules/index.js';
import { IEventTarget } from '../dom.js';
const options = {
    [DelegationStrategy.capturing]: { capture: true },
    [DelegationStrategy.bubbling]: { capture: false },
};
/**
 * Listener binding. Handle event binding between view and view model
 */
export class Listener {
    constructor(platform, targetEvent, delegationStrategy, sourceExpression, target, preventDefault, eventDelegator, locator) {
        this.platform = platform;
        this.targetEvent = targetEvent;
        this.delegationStrategy = delegationStrategy;
        this.sourceExpression = sourceExpression;
        this.target = target;
        this.preventDefault = preventDefault;
        this.eventDelegator = eventDelegator;
        this.locator = locator;
        this.interceptor = this;
        this.isBound = false;
        this.$hostScope = null;
        this.handler = null;
    }
    callSource(event) {
        const overrideContext = this.$scope.overrideContext;
        overrideContext.$event = event;
        const result = this.sourceExpression.evaluate(8 /* mustEvaluate */, this.$scope, this.$hostScope, this.locator, null);
        Reflect.deleteProperty(overrideContext, '$event');
        if (result !== true && this.preventDefault) {
            event.preventDefault();
        }
        return result;
    }
    handleEvent(event) {
        this.interceptor.callSource(event);
    }
    $bind(flags, scope, hostScope) {
        if (this.isBound) {
            if (this.$scope === scope) {
                return;
            }
            this.interceptor.$unbind(flags | 2 /* fromBind */);
        }
        this.$scope = scope;
        this.$hostScope = hostScope;
        const sourceExpression = this.sourceExpression;
        if (sourceExpression.hasBind) {
            sourceExpression.bind(flags, scope, hostScope, this.interceptor);
        }
        if (this.delegationStrategy === DelegationStrategy.none) {
            this.target.addEventListener(this.targetEvent, this);
        }
        else {
            const eventTarget = this.locator.get(IEventTarget);
            this.handler = this.eventDelegator.addEventListener(eventTarget, this.target, this.targetEvent, this, options[this.delegationStrategy]);
        }
        // add isBound flag and remove isBinding flag
        this.isBound = true;
    }
    $unbind(flags) {
        if (!this.isBound) {
            return;
        }
        const sourceExpression = this.sourceExpression;
        if (sourceExpression.hasUnbind) {
            sourceExpression.unbind(flags, this.$scope, this.$hostScope, this.interceptor);
        }
        this.$scope = null;
        if (this.delegationStrategy === DelegationStrategy.none) {
            this.target.removeEventListener(this.targetEvent, this);
        }
        else {
            this.handler.dispose();
            this.handler = null;
        }
        // remove isBound and isUnbinding flags
        this.isBound = false;
    }
    observeProperty(obj, propertyName) {
        return;
    }
    handleChange(newValue, previousValue, flags) {
        return;
    }
}
//# sourceMappingURL=listener.js.map