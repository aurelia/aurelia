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
import { customAttribute, INode, bindable, BindingMode, IDOM, DelegationStrategy } from '@aurelia/runtime';
import { IRouter } from '../router';
import { GotoCustomAttribute } from '../configuration';
import { IEventManager } from '@aurelia/runtime-html';
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
            this.eventListener = this.eventManager.addEventListener(this.dom, this.element, 'click', this.router.linkHandler.handler, DelegationStrategy.none);
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
            && siblings.some(c => c.vmKind === 1 /* customAttribute */ && c.viewModel instanceof GotoCustomAttribute);
    }
};
__decorate([
    bindable({ mode: BindingMode.toView }),
    __metadata("design:type", Object)
], HrefCustomAttribute.prototype, "value", void 0);
HrefCustomAttribute = __decorate([
    customAttribute({
        name: 'href',
        noMultiBindings: true
    }),
    __param(0, IDOM),
    __param(1, INode),
    __param(2, IRouter),
    __param(3, IEventManager),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], HrefCustomAttribute);
export { HrefCustomAttribute };
//# sourceMappingURL=href.js.map