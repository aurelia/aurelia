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
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "@aurelia/runtime", "../../dom"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Portal = void 0;
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    const dom_1 = require("../../dom");
    let Portal = /** @class */ (() => {
        let Portal = class Portal {
            constructor(factory, originalLoc, dom) {
                this.factory = factory;
                this.originalLoc = originalLoc;
                this.dom = dom;
                this.id = kernel_1.nextId('au$component');
                this.strict = false;
                // to make the shape of this object consistent.
                // todo: is this necessary
                this.currentTarget = dom.createElement('div');
                this.view = this.factory.create();
                dom.setEffectiveParentNode(this.view.nodes, originalLoc);
            }
            afterAttach(initiator, parent, flags) {
                if (this.callbackContext == null) {
                    this.callbackContext = this.$controller.scope.bindingContext;
                }
                const newTarget = this.currentTarget = this.resolveTarget();
                this.view.setLocation(newTarget, 2 /* append */);
                return this.$activating(initiator, newTarget, flags);
            }
            afterUnbind(initiator, parent, flags) {
                return this.$deactivating(initiator, this.currentTarget, flags);
            }
            targetChanged() {
                const { $controller } = this;
                if (!$controller.isActive) {
                    return;
                }
                const oldTarget = this.currentTarget;
                const newTarget = this.currentTarget = this.resolveTarget();
                if (oldTarget === newTarget) {
                    return;
                }
                this.view.setLocation(newTarget, 2 /* append */);
                // TODO(fkleuver): fix and test possible race condition
                const ret = kernel_1.onResolve(this.$deactivating(null, newTarget, $controller.flags), () => {
                    return this.$activating(null, newTarget, $controller.flags);
                });
                if (ret instanceof Promise) {
                    ret.catch(err => { throw err; });
                }
            }
            $activating(initiator, target, flags) {
                const { activating, callbackContext, view } = this;
                view.setLocation(target, 2 /* append */);
                return kernel_1.onResolve(activating === null || activating === void 0 ? void 0 : activating.call(callbackContext, target, view), () => {
                    return this.activate(initiator, target, flags);
                });
            }
            activate(initiator, target, flags) {
                const { $controller, view } = this;
                if (initiator === null) {
                    view.nodes.appendTo(target);
                }
                else {
                    // TODO(fkleuver): fix and test possible race condition
                    return kernel_1.onResolve(view.activate(initiator !== null && initiator !== void 0 ? initiator : view, $controller, flags, $controller.scope), () => {
                        return this.$activated(target);
                    });
                }
                return this.$activated(target);
            }
            $activated(target) {
                const { activated, callbackContext, view } = this;
                return activated === null || activated === void 0 ? void 0 : activated.call(callbackContext, target, view);
            }
            $deactivating(initiator, target, flags) {
                const { deactivating, callbackContext, view } = this;
                return kernel_1.onResolve(deactivating === null || deactivating === void 0 ? void 0 : deactivating.call(callbackContext, target, view), () => {
                    return this.deactivate(initiator, target, flags);
                });
            }
            deactivate(initiator, target, flags) {
                const { $controller, view } = this;
                if (initiator === null) {
                    view.nodes.remove();
                }
                else {
                    return kernel_1.onResolve(view.deactivate(initiator, $controller, flags), () => {
                        return this.$deactivated(target);
                    });
                }
                return this.$deactivated(target);
            }
            $deactivated(target) {
                const { deactivated, callbackContext, view } = this;
                return deactivated === null || deactivated === void 0 ? void 0 : deactivated.call(callbackContext, target, view);
            }
            resolveTarget() {
                const dom = this.dom;
                // with a $ in front to make it less confusing/error prone
                const $document = dom.document;
                let target = this.target;
                let context = this.renderContext;
                if (typeof target === 'string') {
                    let queryContext = $document;
                    if (typeof context === 'string') {
                        context = $document.querySelector(context);
                    }
                    if (dom.isNodeInstance(context)) {
                        queryContext = context;
                    }
                    target = queryContext.querySelector(target);
                }
                if (dom.isNodeInstance(target)) {
                    return target;
                }
                if (target == null) {
                    if (this.strict) {
                        throw new Error('Render target not found');
                    }
                    else {
                        target = $document.body;
                    }
                }
                return target;
            }
            onCancel(initiator, parent, flags) {
                var _a;
                (_a = this.view) === null || _a === void 0 ? void 0 : _a.cancel(initiator, this.$controller, flags);
            }
            dispose() {
                this.view.dispose();
                this.view = (void 0);
                this.callbackContext = null;
            }
            accept(visitor) {
                var _a;
                if (((_a = this.view) === null || _a === void 0 ? void 0 : _a.accept(visitor)) === true) {
                    return true;
                }
            }
        };
        __decorate([
            runtime_1.bindable({ primary: true }),
            __metadata("design:type", Object)
        ], Portal.prototype, "target", void 0);
        __decorate([
            runtime_1.bindable({ callback: 'targetChanged' }),
            __metadata("design:type", Object)
        ], Portal.prototype, "renderContext", void 0);
        __decorate([
            runtime_1.bindable(),
            __metadata("design:type", Boolean)
        ], Portal.prototype, "strict", void 0);
        __decorate([
            runtime_1.bindable(),
            __metadata("design:type", Function)
        ], Portal.prototype, "deactivating", void 0);
        __decorate([
            runtime_1.bindable(),
            __metadata("design:type", Function)
        ], Portal.prototype, "activating", void 0);
        __decorate([
            runtime_1.bindable(),
            __metadata("design:type", Function)
        ], Portal.prototype, "deactivated", void 0);
        __decorate([
            runtime_1.bindable(),
            __metadata("design:type", Function)
        ], Portal.prototype, "activated", void 0);
        __decorate([
            runtime_1.bindable(),
            __metadata("design:type", Object)
        ], Portal.prototype, "callbackContext", void 0);
        Portal = __decorate([
            runtime_1.templateController('portal'),
            __param(0, runtime_1.IViewFactory),
            __param(1, runtime_1.IRenderLocation),
            __param(2, runtime_1.IDOM),
            __metadata("design:paramtypes", [Object, Object, dom_1.HTMLDOM])
        ], Portal);
        return Portal;
    })();
    exports.Portal = Portal;
});
//# sourceMappingURL=portal.js.map