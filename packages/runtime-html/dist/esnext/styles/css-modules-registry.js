import { __decorate, __metadata, __param } from "tslib";
import { bindable, customAttribute, INode } from '@aurelia/runtime';
import { getClassesToAdd } from '../observation/class-attribute-accessor';
export function cssModules(...cssModules) {
    return new CSSModulesProcessorRegistry(cssModules);
}
export class CSSModulesProcessorRegistry {
    constructor(cssModules) {
        this.cssModules = cssModules;
    }
    register(container) {
        const classLookup = Object.assign({}, ...this.cssModules);
        let ClassCustomAttribute = class ClassCustomAttribute {
            constructor(element /* TODO(fkleuver): fix this type annotation reflection issue in AOT */) {
                this.element = element;
            }
            beforeBind() {
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