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
        define(["require", "exports", "@aurelia/runtime", "../router", "../configuration", "@aurelia/runtime-html"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const runtime_1 = require("@aurelia/runtime");
    const router_1 = require("../router");
    const configuration_1 = require("../configuration");
    const runtime_html_1 = require("@aurelia/runtime-html");
    let HrefCustomAttribute = class HrefCustomAttribute {
        constructor(dom, element, router, eventManager) {
            this.dom = dom;
            this.router = router;
            this.eventManager = eventManager;
            this.eventListener = null;
            this.element = element;
        }
        beforeBind() {
            if (this.router.options.useHref && !this.hasGoto()) {
                this.eventListener = this.eventManager.addEventListener(this.dom, this.element, 'click', this.router.linkHandler.handler, runtime_1.DelegationStrategy.none);
            }
            this.updateValue();
        }
        beforeUnbind() {
            if (this.eventListener !== null) {
                this.eventListener.dispose();
            }
        }
        valueChanged() {
            this.updateValue();
        }
        updateValue() {
            this.element.setAttribute('href', this.value);
        }
        hasGoto() {
            const parent = this.$controller.parent;
            const siblings = parent.vmKind !== 1 /* customAttribute */ ? parent.controllers : void 0;
            return siblings !== void 0
                && siblings.some(c => c.vmKind === 1 /* customAttribute */ && c.viewModel instanceof configuration_1.GotoCustomAttribute);
        }
    };
    __decorate([
        runtime_1.bindable({ mode: runtime_1.BindingMode.toView }),
        __metadata("design:type", Object)
    ], HrefCustomAttribute.prototype, "value", void 0);
    HrefCustomAttribute = __decorate([
        runtime_1.customAttribute({
            name: 'href',
            noMultiBindings: true
        }),
        __param(0, runtime_1.IDOM),
        __param(1, runtime_1.INode),
        __param(2, router_1.IRouter),
        __param(3, runtime_html_1.IEventManager),
        __metadata("design:paramtypes", [Object, Object, Object, Object])
    ], HrefCustomAttribute);
    exports.HrefCustomAttribute = HrefCustomAttribute;
});
//# sourceMappingURL=href.js.map