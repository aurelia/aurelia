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
exports.RejectedTemplateController = exports.FulfilledTemplateController = exports.PendingTemplateController = exports.PromiseTemplateController = void 0;
const kernel_1 = require("@aurelia/kernel");
const runtime_1 = require("@aurelia/runtime");
const bindable_js_1 = require("../../bindable.js");
const dom_js_1 = require("../../dom.js");
const platform_js_1 = require("../../platform.js");
const view_js_1 = require("../../templating/view.js");
const custom_attribute_js_1 = require("../custom-attribute.js");
let PromiseTemplateController = class PromiseTemplateController {
    constructor(factory, location, platform, logger) {
        this.factory = factory;
        this.location = location;
        this.platform = platform;
        this.id = kernel_1.nextId('au$component');
        this.preSettledTask = null;
        this.postSettledTask = null;
        this.logger = logger.scopeTo('promise.resolve');
    }
    link(flags, _parentContext, _controller, _childController, _target, _instruction) {
        this.view = this.factory.create(flags, this.$controller).setLocation(this.location);
    }
    attaching(initiator, parent, flags) {
        const view = this.view;
        const $controller = this.$controller;
        return kernel_1.onResolve(view.activate(initiator, $controller, flags, this.viewScope = runtime_1.Scope.fromParent($controller.scope, {}), $controller.hostScope), () => this.swap(initiator, flags));
    }
    valueChanged(_newValue, _oldValue, flags) {
        if (!this.$controller.isActive) {
            return;
        }
        this.swap(null, flags);
    }
    swap(initiator, flags) {
        var _a, _b;
        const value = this.value;
        if (!(value instanceof Promise)) {
            this.logger.warn(`The value '${String(value)}' is not a promise. No change will be done.`);
            return;
        }
        const q = this.platform.domWriteQueue;
        const fulfilled = this.fulfilled;
        const rejected = this.rejected;
        const pending = this.pending;
        const $controller = this.$controller;
        const s = this.viewScope;
        const hs = $controller.hostScope;
        let preSettlePromise;
        const defaultQueuingOptions = { reusable: false };
        const $swap = () => {
            // Note that the whole thing is not wrapped in a q.queueTask intentionally.
            // Because that would block the app till the actual promise is resolved, which is not the goal anyway.
            void kernel_1.resolveAll(
            // At first deactivate the fulfilled and rejected views, as well as activate the pending view.
            // The order of these 3 should not necessarily be sequential (i.e. order-irrelevant).
            preSettlePromise = (this.preSettledTask = q.queueTask(() => {
                return kernel_1.resolveAll(fulfilled === null || fulfilled === void 0 ? void 0 : fulfilled.deactivate(initiator, flags), rejected === null || rejected === void 0 ? void 0 : rejected.deactivate(initiator, flags), pending === null || pending === void 0 ? void 0 : pending.activate(initiator, flags, s, hs));
            }, defaultQueuingOptions)).result, value
                .then((data) => {
                if (this.value !== value) {
                    return;
                }
                const fulfill = () => {
                    // Deactivation of pending view and the activation of the fulfilled view should not necessarily be sequential.
                    this.postSettlePromise = (this.postSettledTask = q.queueTask(() => kernel_1.resolveAll(pending === null || pending === void 0 ? void 0 : pending.deactivate(initiator, flags), rejected === null || rejected === void 0 ? void 0 : rejected.deactivate(initiator, flags), fulfilled === null || fulfilled === void 0 ? void 0 : fulfilled.activate(initiator, flags, s, hs, data)), defaultQueuingOptions)).result;
                };
                if (this.preSettledTask.status === 1 /* running */) {
                    void preSettlePromise.then(fulfill);
                }
                else {
                    this.preSettledTask.cancel();
                    fulfill();
                }
            }, (err) => {
                if (this.value !== value) {
                    return;
                }
                const reject = () => {
                    // Deactivation of pending view and the activation of the rejected view should also not necessarily be sequential.
                    this.postSettlePromise = (this.postSettledTask = q.queueTask(() => kernel_1.resolveAll(pending === null || pending === void 0 ? void 0 : pending.deactivate(initiator, flags), fulfilled === null || fulfilled === void 0 ? void 0 : fulfilled.deactivate(initiator, flags), rejected === null || rejected === void 0 ? void 0 : rejected.activate(initiator, flags, s, hs, err)), defaultQueuingOptions)).result;
                };
                if (this.preSettledTask.status === 1 /* running */) {
                    void preSettlePromise.then(reject);
                }
                else {
                    this.preSettledTask.cancel();
                    reject();
                }
            }));
        };
        if (((_a = this.postSettledTask) === null || _a === void 0 ? void 0 : _a.status) === 1 /* running */) {
            void this.postSettlePromise.then($swap);
        }
        else {
            (_b = this.postSettledTask) === null || _b === void 0 ? void 0 : _b.cancel();
            $swap();
        }
    }
    detaching(initiator, parent, flags) {
        var _a, _b;
        (_a = this.preSettledTask) === null || _a === void 0 ? void 0 : _a.cancel();
        (_b = this.postSettledTask) === null || _b === void 0 ? void 0 : _b.cancel();
        this.preSettledTask = this.postSettledTask = null;
        return this.view.deactivate(initiator, this.$controller, flags);
    }
    dispose() {
        var _a;
        (_a = this.view) === null || _a === void 0 ? void 0 : _a.dispose();
        this.view = (void 0);
    }
};
__decorate([
    bindable_js_1.bindable
], PromiseTemplateController.prototype, "value", void 0);
PromiseTemplateController = __decorate([
    custom_attribute_js_1.templateController('promise'),
    __param(0, view_js_1.IViewFactory),
    __param(1, dom_js_1.IRenderLocation),
    __param(2, platform_js_1.IPlatform),
    __param(3, kernel_1.ILogger)
], PromiseTemplateController);
exports.PromiseTemplateController = PromiseTemplateController;
let PendingTemplateController = class PendingTemplateController {
    constructor(factory, location) {
        this.factory = factory;
        this.id = kernel_1.nextId('au$component');
        this.view = this.factory.create().setLocation(location);
    }
    link(flags, parentContext, controller, _childController, _target, _instruction) {
        getPromiseController(controller).pending = this;
    }
    activate(initiator, flags, scope, hostScope) {
        const view = this.view;
        if (view.isActive) {
            return;
        }
        return view.activate(view, this.$controller, flags, scope, hostScope);
    }
    deactivate(initiator, flags) {
        const view = this.view;
        if (!view.isActive) {
            return;
        }
        return view.deactivate(view, this.$controller, flags);
    }
    detaching(initiator, parent, flags) {
        return this.deactivate(initiator, flags);
    }
    dispose() {
        var _a;
        (_a = this.view) === null || _a === void 0 ? void 0 : _a.dispose();
        this.view = (void 0);
    }
};
__decorate([
    bindable_js_1.bindable({ mode: runtime_1.BindingMode.toView })
], PendingTemplateController.prototype, "value", void 0);
PendingTemplateController = __decorate([
    custom_attribute_js_1.templateController('pending'),
    __param(0, view_js_1.IViewFactory),
    __param(1, dom_js_1.IRenderLocation)
], PendingTemplateController);
exports.PendingTemplateController = PendingTemplateController;
let FulfilledTemplateController = class FulfilledTemplateController {
    constructor(factory, location) {
        this.factory = factory;
        this.id = kernel_1.nextId('au$component');
        this.view = this.factory.create().setLocation(location);
    }
    link(flags, parentContext, controller, _childController, _target, _instruction) {
        getPromiseController(controller).fulfilled = this;
    }
    activate(initiator, flags, scope, hostScope, resolvedValue) {
        this.value = resolvedValue;
        const view = this.view;
        if (view.isActive) {
            return;
        }
        return view.activate(view, this.$controller, flags, scope, hostScope);
    }
    deactivate(initiator, flags) {
        const view = this.view;
        if (!view.isActive) {
            return;
        }
        return view.deactivate(view, this.$controller, flags);
    }
    detaching(initiator, parent, flags) {
        return this.deactivate(initiator, flags);
    }
    dispose() {
        var _a;
        (_a = this.view) === null || _a === void 0 ? void 0 : _a.dispose();
        this.view = (void 0);
    }
};
__decorate([
    bindable_js_1.bindable({ mode: runtime_1.BindingMode.toView })
], FulfilledTemplateController.prototype, "value", void 0);
FulfilledTemplateController = __decorate([
    custom_attribute_js_1.templateController('then'),
    __param(0, view_js_1.IViewFactory),
    __param(1, dom_js_1.IRenderLocation)
], FulfilledTemplateController);
exports.FulfilledTemplateController = FulfilledTemplateController;
let RejectedTemplateController = class RejectedTemplateController {
    constructor(factory, location) {
        this.factory = factory;
        this.id = kernel_1.nextId('au$component');
        this.view = this.factory.create().setLocation(location);
    }
    link(flags, parentContext, controller, _childController, _target, _instruction) {
        getPromiseController(controller).rejected = this;
    }
    activate(initiator, flags, scope, hostScope, error) {
        this.value = error;
        const view = this.view;
        if (view.isActive) {
            return;
        }
        return view.activate(view, this.$controller, flags, scope, hostScope);
    }
    deactivate(initiator, flags) {
        const view = this.view;
        if (!view.isActive) {
            return;
        }
        return view.deactivate(view, this.$controller, flags);
    }
    detaching(initiator, parent, flags) {
        return this.deactivate(initiator, flags);
    }
    dispose() {
        var _a;
        (_a = this.view) === null || _a === void 0 ? void 0 : _a.dispose();
        this.view = (void 0);
    }
};
__decorate([
    bindable_js_1.bindable({ mode: runtime_1.BindingMode.toView })
], RejectedTemplateController.prototype, "value", void 0);
RejectedTemplateController = __decorate([
    custom_attribute_js_1.templateController('catch'),
    __param(0, view_js_1.IViewFactory),
    __param(1, dom_js_1.IRenderLocation)
], RejectedTemplateController);
exports.RejectedTemplateController = RejectedTemplateController;
function getPromiseController(controller) {
    const promiseController = controller.parent;
    const $promise = promiseController === null || promiseController === void 0 ? void 0 : promiseController.viewModel;
    if ($promise instanceof PromiseTemplateController) {
        return $promise;
    }
    throw new Error('The parent promise.resolve not found; only `*[promise.resolve] > *[pending|then|catch]` relation is supported.');
}
// TODO: activate after the attribute parser and/or interpreter such that for `t`, `then` is not picked up.
// @attributePattern({ pattern: 'promise.resolve', symbols: '' })
// export class PromiseAttributePattern {
//   public 'promise.resolve'(name: string, value: string, _parts: string[]): AttrSyntax {
//     return new AttrSyntax(name, value, 'promise', 'bind');
//   }
// }
// @attributePattern({ pattern: 'then', symbols: '' })
// export class FulfilledAttributePattern {
//   public 'then'(name: string, value: string, _parts: string[]): AttrSyntax {
//     return new AttrSyntax(name, value, 'then', 'from-view');
//   }
// }
// @attributePattern({ pattern: 'catch', symbols: '' })
// export class RejectedAttributePattern {
//   public 'catch'(name: string, value: string, _parts: string[]): AttrSyntax {
//     return new AttrSyntax(name, value, 'catch', 'from-view');
//   }
// }
//# sourceMappingURL=promise.js.map