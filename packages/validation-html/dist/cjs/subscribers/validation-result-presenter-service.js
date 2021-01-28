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
exports.ValidationResultPresenterService = void 0;
const runtime_html_1 = require("@aurelia/runtime-html");
const resultIdAttribute = 'validation-result-id';
const resultContainerAttribute = 'validation-result-container';
let ValidationResultPresenterService = class ValidationResultPresenterService {
    constructor(platform) {
        this.platform = platform;
    }
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
            messageContainer = this.platform.document.createElement('div');
            messageContainer.setAttribute(resultContainerAttribute, '');
            parent.appendChild(messageContainer);
        }
        return messageContainer;
    }
    showResults(messageContainer, results) {
        messageContainer.append(...results.reduce((acc, result) => {
            if (!result.valid) {
                const span = this.platform.document.createElement('span');
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
};
ValidationResultPresenterService = __decorate([
    __param(0, runtime_html_1.IPlatform)
], ValidationResultPresenterService);
exports.ValidationResultPresenterService = ValidationResultPresenterService;
//# sourceMappingURL=validation-result-presenter-service.js.map