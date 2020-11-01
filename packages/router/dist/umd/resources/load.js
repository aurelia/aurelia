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
        define(["require", "exports", "@aurelia/runtime-html", "../router", "../type-resolvers"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LoadCustomAttribute = void 0;
    const runtime_html_1 = require("@aurelia/runtime-html");
    const router_1 = require("../router");
    const type_resolvers_1 = require("../type-resolvers");
    let LoadCustomAttribute = class LoadCustomAttribute {
        constructor(element, router) {
            this.router = router;
            this.hasHref = null;
            this.activeClass = 'load-active';
            this.element = element;
        }
        binding() {
            this.element.addEventListener('click', this.router.linkHandler.handler);
            this.updateValue();
            const observerLocator = this.router.container.get(runtime_html_1.IObserverLocator);
            this.observer = observerLocator.getObserver(0 /* none */, this.router, 'activeComponents');
            this.observer.subscribe(this);
        }
        unbinding() {
            this.element.removeEventListener('click', this.router.linkHandler.handler);
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
            const controller = runtime_html_1.CustomAttribute.for(this.element, 'load').parent;
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
        runtime_html_1.bindable({ mode: runtime_html_1.BindingMode.toView }),
        __metadata("design:type", Object)
    ], LoadCustomAttribute.prototype, "value", void 0);
    LoadCustomAttribute = __decorate([
        runtime_html_1.customAttribute('load'),
        __param(0, runtime_html_1.INode),
        __param(1, router_1.IRouter),
        __metadata("design:paramtypes", [Object, Object])
    ], LoadCustomAttribute);
    exports.LoadCustomAttribute = LoadCustomAttribute;
});
//# sourceMappingURL=load.js.map