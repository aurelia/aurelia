import { __decorate, __param } from "tslib";
import { customAttribute, INode, bindable, BindingMode } from '@aurelia/runtime';
let AuHrefCustomAttribute = class AuHrefCustomAttribute {
    constructor(element) {
        this.element = element;
        this.hasHref = null;
    }
    binding() {
        this.updateValue();
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
};
__decorate([
    bindable({ mode: BindingMode.toView })
], AuHrefCustomAttribute.prototype, "value", void 0);
AuHrefCustomAttribute = __decorate([
    customAttribute('au-href'),
    __param(0, INode)
], AuHrefCustomAttribute);
export { AuHrefCustomAttribute };
//# sourceMappingURL=au-href.js.map