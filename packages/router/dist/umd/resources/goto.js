(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "../type-resolvers", "@aurelia/runtime", "../router", "@aurelia/runtime-html"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const type_resolvers_1 = require("../type-resolvers");
    const runtime_1 = require("@aurelia/runtime");
    const router_1 = require("../router");
    const runtime_html_1 = require("@aurelia/runtime-html");
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
            this.listener = this.eventManager.addEventListener(this.dom, this.element, 'click', this.router.linkHandler.handler, runtime_1.DelegationStrategy.none);
            this.updateValue();
            const observerLocator = this.router.container.get(runtime_1.IObserverLocator);
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
            const controller = runtime_1.CustomAttribute.for(this.element, 'goto').parent;
            const created = type_resolvers_1.NavigationInstructionResolver.createViewportInstructions(this.router, this.value, { context: controller });
            const instructions = type_resolvers_1.NavigationInstructionResolver.toViewportInstructions(this.router, created.instructions);
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
    tslib_1.__decorate([
        runtime_1.bindable({ mode: runtime_1.BindingMode.toView }),
        tslib_1.__metadata("design:type", Object)
    ], GotoCustomAttribute.prototype, "value", void 0);
    GotoCustomAttribute = tslib_1.__decorate([
        runtime_1.customAttribute('goto'),
        tslib_1.__param(0, runtime_1.IDOM),
        tslib_1.__param(1, runtime_1.INode),
        tslib_1.__param(2, router_1.IRouter),
        tslib_1.__param(3, runtime_html_1.IEventManager),
        tslib_1.__metadata("design:paramtypes", [Object, Object, Object, Object])
    ], GotoCustomAttribute);
    exports.GotoCustomAttribute = GotoCustomAttribute;
});
//# sourceMappingURL=goto.js.map