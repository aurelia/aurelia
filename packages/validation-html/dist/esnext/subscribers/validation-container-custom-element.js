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
import { INode, bindable } from '@aurelia/runtime';
import { ValidationResultTarget, IValidationController } from '../validation-controller';
import { compareDocumentPositionFlat } from './common';
import { optional } from '@aurelia/kernel';
export const defaultContainerTemplate = `
<slot></slot>
<slot name='secondary'>
  <span repeat.for="error of errors">
    \${error.result.message}
  </span>
</slot>
`;
export const defaultContainerDefinition = {
    name: 'validation-container',
    shadowOptions: { mode: 'open' },
    hasSlots: true,
};
let ValidationContainerCustomElement = /** @class */ (() => {
    let ValidationContainerCustomElement = class ValidationContainerCustomElement {
        constructor(host, scopedController) {
            this.scopedController = scopedController;
            this.errors = [];
            this.host = host;
        }
        handleValidationEvent(event) {
            for (const { result } of event.removedResults) {
                const index = this.errors.findIndex(x => x.result === result);
                if (index !== -1) {
                    this.errors.splice(index, 1);
                }
            }
            for (const { result, targets: elements } of event.addedResults) {
                if (result.valid) {
                    continue;
                }
                const targets = elements.filter(e => this.host.contains(e));
                if (targets.length > 0) {
                    this.errors.push(new ValidationResultTarget(result, targets));
                }
            }
            this.errors.sort((a, b) => {
                if (a.targets[0] === b.targets[0]) {
                    return 0;
                }
                return compareDocumentPositionFlat(a.targets[0], b.targets[0]);
            });
        }
        beforeBind() {
            var _a;
            this.controller = (_a = this.controller) !== null && _a !== void 0 ? _a : this.scopedController;
            this.controller.addSubscriber(this);
        }
        beforeUnbind() {
            this.controller.removeSubscriber(this);
        }
    };
    __decorate([
        bindable,
        __metadata("design:type", Object)
    ], ValidationContainerCustomElement.prototype, "controller", void 0);
    __decorate([
        bindable,
        __metadata("design:type", Array)
    ], ValidationContainerCustomElement.prototype, "errors", void 0);
    ValidationContainerCustomElement = __decorate([
        __param(0, INode),
        __param(1, optional(IValidationController)),
        __metadata("design:paramtypes", [Object, Object])
    ], ValidationContainerCustomElement);
    return ValidationContainerCustomElement;
})();
export { ValidationContainerCustomElement };
//# sourceMappingURL=validation-container-custom-element.js.map