"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationContainerCustomElement = exports.defaultContainerDefinition = exports.defaultContainerTemplate = void 0;
const runtime_html_1 = require("@aurelia/runtime-html");
const validation_controller_js_1 = require("../validation-controller.js");
const common_js_1 = require("./common.js");
const kernel_1 = require("@aurelia/kernel");
exports.defaultContainerTemplate = `
<slot></slot>
<slot name='secondary'>
  <span repeat.for="error of errors">
    \${error.result.message}
  </span>
</slot>
`;
exports.defaultContainerDefinition = {
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
                this.errors.push(new validation_controller_js_1.ValidationResultTarget(result, targets));
            }
        }
        this.errors.sort((a, b) => {
            if (a.targets[0] === b.targets[0]) {
                return 0;
            }
            return common_js_1.compareDocumentPositionFlat(a.targets[0], b.targets[0]);
        });
    }
    binding() {
        var _a;
        this.controller = (_a = this.controller) !== null && _a !== void 0 ? _a : this.scopedController;
        this.controller.addSubscriber(this);
    }
    unbinding() {
        this.controller.removeSubscriber(this);
    }
};
__decorate([
    runtime_html_1.bindable
], ValidationContainerCustomElement.prototype, "controller", void 0);
__decorate([
    runtime_html_1.bindable
], ValidationContainerCustomElement.prototype, "errors", void 0);
ValidationContainerCustomElement = __decorate([
    __param(0, runtime_html_1.INode),
    __param(1, kernel_1.optional(validation_controller_js_1.IValidationController))
], ValidationContainerCustomElement);
exports.ValidationContainerCustomElement = ValidationContainerCustomElement;
//# sourceMappingURL=validation-container-custom-element.js.map