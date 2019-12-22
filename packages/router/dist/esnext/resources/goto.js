import { __decorate, __metadata, __param } from "tslib";
import { NavigationInstructionResolver } from '../type-resolvers';
import { customAttribute, INode, bindable, BindingMode, IDOM, DelegationStrategy, IObserverLocator, CustomAttribute } from '@aurelia/runtime';
import { IRouter } from '../router';
import { IEventManager } from '@aurelia/runtime-html';
let GotoCustomAttribute = class GotoCustomAttribute {
    constructor(dom, element, router, eventManager) {
        this.dom = dom;
        this.router = router;
        this.eventManager = eventManager;
        this.listener = null;
        this.hasHref = null;
        this.activeClass = 'goto-active';
        this.element = element;
    }
    beforeBind() {
        this.listener = this.eventManager.addEventListener(this.dom, this.element, 'click', this.router.linkHandler.handler, DelegationStrategy.none);
        this.updateValue();
        const observerLocator = this.router.container.get(IObserverLocator);
        this.observer = observerLocator.getObserver(0 /* none */, this.router, 'activeComponents');
        this.observer.subscribe(this);
    }
    beforeUnbind() {
        if (this.listener !== null) {
            this.listener.dispose();
        }
        this.observer.unsubscribe(this);
    }
    valueChanged(newValue) {
        this.updateValue();
    }
    updateValue() {
        if (this.hasHref === null) {
            this.hasHref = this.element.hasAttribute('href');
        }
        if (!this.hasHref) {
            // TODO: Figure out a better value here for non-strings (using InstructionResolver?)
            const value = typeof this.value === 'string' ? this.value : JSON.stringify(this.value);
            this.element.setAttribute('href', value);
        }
    }
    handleChange() {
        const controller = CustomAttribute.for(this.element, 'goto').parent;
        const created = NavigationInstructionResolver.createViewportInstructions(this.router, this.value, { context: controller });
        const instructions = NavigationInstructionResolver.toViewportInstructions(this.router, created.instructions);
        for (const instruction of instructions) {
            if (instruction.scope === null) {
                instruction.scope = created.scope;
            }
        }
        // TODO: Use router configuration for class name and update target
        if (this.router.checkActive(instructions)) {
            this.element.classList.add(this.activeClass);
        }
        else {
            this.element.classList.remove(this.activeClass);
        }
    }
};
__decorate([
    bindable({ mode: BindingMode.toView }),
    __metadata("design:type", Object)
], GotoCustomAttribute.prototype, "value", void 0);
GotoCustomAttribute = __decorate([
    customAttribute('goto'),
    __param(0, IDOM),
    __param(1, INode),
    __param(2, IRouter),
    __param(3, IEventManager),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], GotoCustomAttribute);
export { GotoCustomAttribute };
//# sourceMappingURL=goto.js.map