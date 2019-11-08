import { __decorate, __metadata, __param } from "tslib";
import { customAttribute, INode, bindable, BindingMode } from '@aurelia/runtime';
let GotoCustomAttribute = class GotoCustomAttribute {
    constructor(element) {
        this.hasHref = null;
        this.element = element;
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
    bindable({ mode: BindingMode.toView }),
    __metadata("design:type", Object)
], GotoCustomAttribute.prototype, "value", void 0);
GotoCustomAttribute = __decorate([
    customAttribute('goto'),
    __param(0, INode),
    __metadata("design:paramtypes", [Object])
], GotoCustomAttribute);
export { GotoCustomAttribute };
//# sourceMappingURL=goto.js.map