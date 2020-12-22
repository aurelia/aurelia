var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { customAttribute, INode, bindable, BindingMode } from '@aurelia/runtime-html';
import { IRouter } from '../router.js';
import { GotoCustomAttribute } from '../configuration.js';
let HrefCustomAttribute = class HrefCustomAttribute {
    constructor(element, router) {
        this.element = element;
        this.router = router;
    }
    binding() {
        if (this.router.options.useHref && !this.hasGoto()) {
            this.element.addEventListener('click', this.router.linkHandler.handler);
        }
        this.updateValue();
    }
    unbinding() {
        this.element.removeEventListener('click', this.router.linkHandler.handler);
    }
    valueChanged() {
        this.updateValue();
    }
    updateValue() {
        this.element.setAttribute('href', this.value);
    }
    hasGoto() {
        const parent = this.$controller.parent;
        const siblings = parent.children;
        return siblings !== null
            && siblings.some(c => c.vmKind === 1 /* customAttribute */ && c.viewModel instanceof GotoCustomAttribute);
    }
};
__decorate([
    bindable({ mode: BindingMode.toView })
], HrefCustomAttribute.prototype, "value", void 0);
HrefCustomAttribute = __decorate([
    customAttribute({
        name: 'href',
        noMultiBindings: true
    }),
    __param(0, INode),
    __param(1, IRouter)
], HrefCustomAttribute);
export { HrefCustomAttribute };
//# sourceMappingURL=href.js.map