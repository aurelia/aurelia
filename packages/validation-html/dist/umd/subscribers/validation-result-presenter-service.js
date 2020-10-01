(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/runtime"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ValidationResultPresenterService = void 0;
    const runtime_1 = require("@aurelia/runtime");
    const resultIdAttribute = 'validation-result-id';
    const resultContainerAttribute = 'validation-result-container';
    class ValidationResultPresenterService {
        handleValidationEvent(event) {
            for (const [target, results] of this.reverseMap(event.removedResults)) {
                this.remove(target, results);
            }
            for (const [target, results] of this.reverseMap(event.addedResults)) {
                this.add(target, results);
            }
        }
        remove(target, results) {
            const messageContainer = this.getValidationMessageContainer(target);
            if (messageContainer === null) {
                return;
            }
            this.removeResults(messageContainer, results);
        }
        add(target, results) {
            const messageContainer = this.getValidationMessageContainer(target);
            if (messageContainer === null) {
                return;
            }
            this.showResults(messageContainer, results);
        }
        getValidationMessageContainer(target) {
            const parent = target.parentElement;
            if (parent === null) {
                return null;
            }
            let messageContainer = parent.querySelector(`[${resultContainerAttribute}]`);
            if (messageContainer === null) {
                messageContainer = runtime_1.DOM.createElement('div');
                messageContainer.setAttribute(resultContainerAttribute, '');
                parent.appendChild(messageContainer);
            }
            return messageContainer;
        }
        showResults(messageContainer, results) {
            messageContainer.append(...results.reduce((acc, result) => {
                if (!result.valid) {
                    const span = runtime_1.DOM.createElement('span');
                    span.setAttribute(resultIdAttribute, result.id.toString());
                    span.textContent = result.message;
                    acc.push(span);
                }
                return acc;
            }, []));
        }
        removeResults(messageContainer, results) {
            var _a;
            for (const result of results) {
                if (!result.valid) {
                    (_a = messageContainer.querySelector(`[${resultIdAttribute}="${result.id}"]`)) === null || _a === void 0 ? void 0 : _a.remove();
                }
            }
        }
        reverseMap(results) {
            const map = new Map();
            for (const { result, targets } of results) {
                for (const target of targets) {
                    let targetResults = map.get(target);
                    if (targetResults === void 0) {
                        map.set(target, targetResults = []);
                    }
                    targetResults.push(result);
                }
            }
            return map;
        }
    }
    exports.ValidationResultPresenterService = ValidationResultPresenterService;
});
//# sourceMappingURL=validation-result-presenter-service.js.map