var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { INode, bindable } from '@aurelia/runtime-html';
import { ValidationResultTarget, IValidationController } from '../validation-controller.js';
import { compareDocumentPositionFlat } from './common.js';
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
let ValidationContainerCustomElement = class ValidationContainerCustomElement {
    constructor(host, scopedController) {
        this.host = host;
        this.scopedController = scopedController;
        this.errors = [];
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
    binding() {
        this.controller = this.controller ?? this.scopedController;
        this.controller.addSubscriber(this);
    }
    unbinding() {
        this.controller.removeSubscriber(this);
    }
};
__decorate([
    bindable
], ValidationContainerCustomElement.prototype, "controller", void 0);
__decorate([
    bindable
], ValidationContainerCustomElement.prototype, "errors", void 0);
ValidationContainerCustomElement = __decorate([
    __param(0, INode),
    __param(1, optional(IValidationController))
], ValidationContainerCustomElement);
export { ValidationContainerCustomElement };
//# sourceMappingURL=validation-container-custom-element.js.map