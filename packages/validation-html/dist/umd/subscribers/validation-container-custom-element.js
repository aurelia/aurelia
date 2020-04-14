(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/runtime", "../validation-controller", "./common", "@aurelia/kernel"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const runtime_1 = require("@aurelia/runtime");
    const validation_controller_1 = require("../validation-controller");
    const common_1 = require("./common");
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
                    this.errors.push(new validation_controller_1.ValidationResultTarget(result, targets));
                }
            }
            this.errors.sort((a, b) => {
                if (a.targets[0] === b.targets[0]) {
                    return 0;
                }
                return common_1.compareDocumentPositionFlat(a.targets[0], b.targets[0]);
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
    tslib_1.__decorate([
        runtime_1.bindable,
        tslib_1.__metadata("design:type", Object)
    ], ValidationContainerCustomElement.prototype, "controller", void 0);
    tslib_1.__decorate([
        runtime_1.bindable,
        tslib_1.__metadata("design:type", Array)
    ], ValidationContainerCustomElement.prototype, "errors", void 0);
    ValidationContainerCustomElement = tslib_1.__decorate([
        tslib_1.__param(0, runtime_1.INode),
        tslib_1.__param(1, kernel_1.optional(validation_controller_1.IValidationController)),
        tslib_1.__metadata("design:paramtypes", [Object, Object])
    ], ValidationContainerCustomElement);
    exports.ValidationContainerCustomElement = ValidationContainerCustomElement;
});
//# sourceMappingURL=validation-container-custom-element.js.map