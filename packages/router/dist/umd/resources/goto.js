var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../type-resolvers", "@aurelia/runtime", "../router", "@aurelia/runtime-html"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
    __decorate([
        runtime_1.bindable({ mode: runtime_1.BindingMode.toView }),
        __metadata("design:type", Object)
    ], GotoCustomAttribute.prototype, "value", void 0);
    GotoCustomAttribute = __decorate([
        runtime_1.customAttribute('goto'),
        __param(0, runtime_1.IDOM),
        __param(1, runtime_1.INode),
        __param(2, router_1.IRouter),
        __param(3, runtime_html_1.IEventManager),
        __metadata("design:paramtypes", [Object, Object, Object, Object])
    ], GotoCustomAttribute);
    exports.GotoCustomAttribute = GotoCustomAttribute;
});
//# sourceMappingURL=goto.js.map