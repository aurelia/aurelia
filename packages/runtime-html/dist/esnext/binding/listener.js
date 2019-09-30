import { hasBind, hasUnbind } from '@aurelia/runtime';
const slice = Array.prototype.slice;
/**
 * Listener binding. Handle event binding between view and view model
 */
export class Listener {
    constructor(dom, targetEvent, delegationStrategy, sourceExpression, target, preventDefault, eventManager, locator) {
        this.dom = dom;
        this.$state = 0 /* none */;
        this.delegationStrategy = delegationStrategy;
        this.locator = locator;
        this.preventDefault = preventDefault;
        this.sourceExpression = sourceExpression;
        this.target = target;
        this.targetEvent = targetEvent;
        this.eventManager = eventManager;
    }
    callSource(event) {
        const overrideContext = this.$scope.overrideContext;
        overrideContext.$event = event;
        const result = this.sourceExpression.evaluate(2097152 /* mustEvaluate */, this.$scope, this.locator, this.part);
        Reflect.deleteProperty(overrideContext, '$event');
        if (result !== true && this.preventDefault) {
            event.preventDefault();
        }
        return result;
    }
    handleEvent(event) {
        this.callSource(event);
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
        const sourceExpression = this.sourceExpression;
        if (hasBind(sourceExpression)) {
            sourceExpression.bind(flags, scope, this);
        }
        this.handler = this.eventManager.addEventListener(this.dom, this.target, this.targetEvent, this, this.delegationStrategy);
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
        const sourceExpression = this.sourceExpression;
        if (hasUnbind(sourceExpression)) {
            sourceExpression.unbind(flags, this.$scope, this);
        }
        this.$scope = null;
        this.handler.dispose();
        this.handler = null;
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
//# sourceMappingURL=listener.js.map