import { __decorate, __param } from "tslib";
import { nextId, } from '@aurelia/kernel';
import { bindable, ContinuationTask, IDOM, IRenderLocation, IViewFactory, LifecycleTask, templateController, TerminalTask } from '@aurelia/runtime';
function toTask(maybePromiseOrTask) {
    if (maybePromiseOrTask == null) {
        return LifecycleTask.done;
    }
    if (typeof maybePromiseOrTask.then === 'function') {
        return new TerminalTask(maybePromiseOrTask);
    }
    return maybePromiseOrTask;
}
let Portal = class Portal {
    constructor(factory, originalLoc, dom) {
        this.factory = factory;
        this.originalLoc = originalLoc;
        this.dom = dom;
        this.id = nextId('au$component');
        // to make the shape of this object consistent.
        // todo: is this necessary
        this.currentTarget = dom.createElement('div');
        this.task = LifecycleTask.done;
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
                task = new ContinuationTask(task, activating, callbackContext, target, view);
            }
        }
        if (task.done) {
            view.attach(flags);
        }
        else {
            task = new ContinuationTask(task, view.attach, view, flags);
        }
        if (typeof activated === 'function') {
            if (task.done) {
                // TODO: chain this up with RAF queue mount callback so activated is called only when
                // node is actually mounted (is this needed as per the spec of this resource?)
                task = toTask(activated.call(callbackContext, target, view));
            }
            else {
                task = new ContinuationTask(task, activated, callbackContext, target, view);
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
                task = new ContinuationTask(task, deactivating, callbackContext, target, view);
            }
        }
        if (task.done) {
            view.detach(flags);
        }
        else {
            task = new ContinuationTask(task, view.detach, view, flags);
        }
        if (typeof deactivated === 'function') {
            if (task.done) {
                task = toTask(deactivated.call(callbackContext, target, view));
            }
            else {
                task = new ContinuationTask(task, deactivated, callbackContext, target, view);
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
__decorate([
    bindable({ primary: true })
], Portal.prototype, "target", void 0);
__decorate([
    bindable({ callback: 'targetChanged' })
], Portal.prototype, "renderContext", void 0);
__decorate([
    bindable()
], Portal.prototype, "strict", void 0);
__decorate([
    bindable()
], Portal.prototype, "deactivating", void 0);
__decorate([
    bindable()
], Portal.prototype, "activating", void 0);
__decorate([
    bindable()
], Portal.prototype, "deactivated", void 0);
__decorate([
    bindable()
], Portal.prototype, "activated", void 0);
__decorate([
    bindable()
], Portal.prototype, "callbackContext", void 0);
Portal = __decorate([
    templateController('portal'),
    __param(0, IViewFactory),
    __param(1, IRenderLocation),
    __param(2, IDOM)
], Portal);
export { Portal };
//# sourceMappingURL=portal.js.map