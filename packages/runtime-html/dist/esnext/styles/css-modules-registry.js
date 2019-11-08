import { __decorate, __metadata, __param } from "tslib";
import { bindable, customAttribute, INode } from '@aurelia/runtime';
import { getClassesToAdd } from '../observation/class-attribute-accessor';
export class CSSModulesProcessorRegistry {
    register(container, ...params) {
        const classLookup = Object.assign({}, ...params);
        let ClassCustomAttribute = class ClassCustomAttribute {
            constructor(element) {
                this.element = element;
            }
            binding() {
                this.valueChanged();
            }
            valueChanged() {
                if (!this.value) {
                    this.element.className = '';
                    return;
                }
                this.element.className = getClassesToAdd(this.value)
                    .map(x => classLookup[x] || x)
                    .join(' ');
            }
        };
        __decorate([
            bindable,
            __metadata("design:type", String)
        ], ClassCustomAttribute.prototype, "value", void 0);
        ClassCustomAttribute = __decorate([
            customAttribute('class'),
            __param(0, INode),
            __metadata("design:paramtypes", [Object])
        ], ClassCustomAttribute);
        container.register(ClassCustomAttribute);
    }
}
//# sourceMappingURL=css-modules-registry.js.map