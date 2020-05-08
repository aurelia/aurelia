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
import { nextId, } from '@aurelia/kernel';
import { bindable, ContinuationTask, IDOM, IRenderLocation, IViewFactory, LifecycleTask, templateController, TerminalTask, } from '@aurelia/runtime';
import { HTMLDOM, } from '../../dom';
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
        this.strict = false;
        this.task = LifecycleTask.done;
        // to make the shape of this object consistent.
        // todo: is this necessary
        this.currentTarget = dom.createElement('div');
        this.view = this.factory.create();
        dom.setEffectiveParentNode(this.view.nodes, originalLoc);
        this.view.hold(originalLoc, 1 /* insertBefore */);
    }
    beforeBind(flags) {
        if (this.callbackContext == null) {
            this.callbackContext = this.$controller.scope.bindingContext;
        }
        return this.view.bind(flags, this.$controller.scope);
    }
    afterAttach(flags) {
        this.targetChanged();
    }
    beforeDetach(flags) {
        this.task = this.deactivate(flags);
    }
    beforeUnbind(flags) {
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
    bindable({ primary: true }),
    __metadata("design:type", Object)
], Portal.prototype, "target", void 0);
__decorate([
    bindable({ callback: 'targetChanged' }),
    __metadata("design:type", Object)
], Portal.prototype, "renderContext", void 0);
__decorate([
    bindable(),
    __metadata("design:type", Boolean)
], Portal.prototype, "strict", void 0);
__decorate([
    bindable(),
    __metadata("design:type", Function)
], Portal.prototype, "deactivating", void 0);
__decorate([
    bindable(),
    __metadata("design:type", Function)
], Portal.prototype, "activating", void 0);
__decorate([
    bindable(),
    __metadata("design:type", Function)
], Portal.prototype, "deactivated", void 0);
__decorate([
    bindable(),
    __metadata("design:type", Function)
], Portal.prototype, "activated", void 0);
__decorate([
    bindable(),
    __metadata("design:type", Object)
], Portal.prototype, "callbackContext", void 0);
Portal = __decorate([
    templateController('portal'),
    __param(0, IViewFactory),
    __param(1, IRenderLocation),
    __param(2, IDOM),
    __metadata("design:paramtypes", [Object, Object, HTMLDOM])
], Portal);
export { Portal };
//# sourceMappingURL=portal.js.map