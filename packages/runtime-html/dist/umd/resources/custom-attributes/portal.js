(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/kernel", "@aurelia/runtime"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    function toTask(maybePromiseOrTask) {
        if (maybePromiseOrTask == null) {
            return runtime_1.LifecycleTask.done;
        }
        if (typeof maybePromiseOrTask.then === 'function') {
            return new runtime_1.TerminalTask(maybePromiseOrTask);
        }
        return maybePromiseOrTask;
    }
    let Portal = class Portal {
        constructor(factory, originalLoc, dom) {
            this.factory = factory;
            this.originalLoc = originalLoc;
            this.dom = dom;
            this.id = kernel_1.nextId('au$component');
            // to make the shape of this object consistent.
            // todo: is this necessary
            this.currentTarget = dom.createElement('div');
            this.task = runtime_1.LifecycleTask.done;
            this.view = this.factory.create();
            this.view.hold(originalLoc, 1 /* insertBefore */);
            this.strict = false;
        }
        binding(flags) {
            if (this.callbackContext == null) {
                this.callbackContext = this.$controller.scope.bindingContext;
            }
            return this.view.bind(flags, this.$controller.scope);
        }
        attached(flags) {
            this.targetChanged();
        }
        detaching(flags) {
            this.task = this.deactivate(flags);
        }
        unbinding(flags) {
            this.callbackContext = null;
            return this.view.unbind(flags);
        }
        targetChanged() {
            const $controller = this.$controller;
            if (($controller.state & 4 /* isBound */) === 0) {
                return;
            }
            this.project($controller.flags);
        }
        project(flags) {
            const oldTarget = this.currentTarget;
            const newTarget = this.currentTarget = this.resolveTarget();
            if (oldTarget === newTarget) {
                return;
            }
            this.task = this.deactivate(flags);
            this.task = this.activate(newTarget, flags);
        }
        activate(target, flags) {
            const { activating, activated, callbackContext, view } = this;
            let task = this.task;
            view.hold(target, 2 /* append */);
            if ((this.$controller.state & 40 /* isAttachedOrAttaching */) === 0) {
                return task;
            }
            if (typeof activating === 'function') {
                if (task.done) {
                    task = toTask(activating.call(callbackContext, target, view));
                }
                else {
                    task = new runtime_1.ContinuationTask(task, activating, callbackContext, target, view);
                }
            }
            if (task.done) {
                view.attach(flags);
            }
            else {
                task = new runtime_1.ContinuationTask(task, view.attach, view, flags);
            }
            if (typeof activated === 'function') {
                if (task.done) {
                    // TODO: chain this up with RAF queue mount callback so activated is called only when
                    // node is actually mounted (is this needed as per the spec of this resource?)
                    task = toTask(activated.call(callbackContext, target, view));
                }
                else {
                    task = new runtime_1.ContinuationTask(task, activated, callbackContext, target, view);
                }
            }
            return task;
        }
        deactivate(flags) {
            const { deactivating, deactivated, callbackContext, view, target: target } = this;
            let task = this.task;
            if (typeof deactivating === 'function') {
                if (task.done) {
                    task = toTask(deactivating.call(callbackContext, target, view));
                }
                else {
                    task = new runtime_1.ContinuationTask(task, deactivating, callbackContext, target, view);
                }
            }
            if (task.done) {
                view.detach(flags);
            }
            else {
                task = new runtime_1.ContinuationTask(task, view.detach, view, flags);
            }
            if (typeof deactivated === 'function') {
                if (task.done) {
                    task = toTask(deactivated.call(callbackContext, target, view));
                }
                else {
                    task = new runtime_1.ContinuationTask(task, deactivated, callbackContext, target, view);
                }
            }
            return task;
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
    };
    tslib_1.__decorate([
        runtime_1.bindable({ primary: true })
    ], Portal.prototype, "target", void 0);
    tslib_1.__decorate([
        runtime_1.bindable({ callback: 'targetChanged' })
    ], Portal.prototype, "renderContext", void 0);
    tslib_1.__decorate([
        runtime_1.bindable()
    ], Portal.prototype, "strict", void 0);
    tslib_1.__decorate([
        runtime_1.bindable()
    ], Portal.prototype, "deactivating", void 0);
    tslib_1.__decorate([
        runtime_1.bindable()
    ], Portal.prototype, "activating", void 0);
    tslib_1.__decorate([
        runtime_1.bindable()
    ], Portal.prototype, "deactivated", void 0);
    tslib_1.__decorate([
        runtime_1.bindable()
    ], Portal.prototype, "activated", void 0);
    tslib_1.__decorate([
        runtime_1.bindable()
    ], Portal.prototype, "callbackContext", void 0);
    Portal = tslib_1.__decorate([
        runtime_1.templateController('portal'),
        tslib_1.__param(0, runtime_1.IViewFactory),
        tslib_1.__param(1, runtime_1.IRenderLocation),
        tslib_1.__param(2, runtime_1.IDOM)
    ], Portal);
    exports.Portal = Portal;
});
//# sourceMappingURL=portal.js.map