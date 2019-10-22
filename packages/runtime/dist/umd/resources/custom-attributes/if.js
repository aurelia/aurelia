(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/kernel", "../../dom", "../../lifecycle", "../../lifecycle-task", "../../templating/bindable", "../custom-attribute"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@aurelia/kernel");
    const dom_1 = require("../../dom");
    const lifecycle_1 = require("../../lifecycle");
    const lifecycle_task_1 = require("../../lifecycle-task");
    const bindable_1 = require("../../templating/bindable");
    const custom_attribute_1 = require("../custom-attribute");
    let If = class If {
        constructor(ifFactory, location) {
            this.ifFactory = ifFactory;
            this.location = location;
            this.id = kernel_1.nextId('au$component');
            this.elseFactory = void 0;
            this.elseView = void 0;
            this.ifView = void 0;
            this.view = void 0;
            this.task = lifecycle_task_1.LifecycleTask.done;
            this.value = false;
        }
        ;
        binding(flags) {
            if (this.task.done) {
                this.task = this.swap(this.value, flags);
            }
            else {
                this.task = new lifecycle_task_1.ContinuationTask(this.task, this.swap, this, this.value, flags);
            }
            return this.task;
        }
        attaching(flags) {
            if (this.task.done) {
                this.attachView(flags);
            }
            else {
                this.task = new lifecycle_task_1.ContinuationTask(this.task, this.attachView, this, flags);
            }
        }
        detaching(flags) {
            if (this.view !== void 0) {
                if (this.task.done) {
                    this.view.detach(flags);
                }
                else {
                    this.task = new lifecycle_task_1.ContinuationTask(this.task, this.view.detach, this.view, flags);
                }
            }
            return this.task;
        }
        unbinding(flags) {
            if (this.view !== void 0) {
                if (this.task.done) {
                    this.task = this.view.unbind(flags);
                }
                else {
                    this.task = new lifecycle_task_1.ContinuationTask(this.task, this.view.unbind, this.view, flags);
                }
            }
            return this.task;
        }
        caching(flags) {
            if (this.ifView !== void 0 && this.ifView.release(flags)) {
                this.ifView = void 0;
            }
            if (this.elseView !== void 0 && this.elseView.release(flags)) {
                this.elseView = void 0;
            }
            this.view = void 0;
        }
        valueChanged(newValue, oldValue, flags) {
            if ((this.$controller.state & 4 /* isBound */) === 0) {
                return;
            }
            if (this.task.done) {
                this.task = this.swap(this.value, flags);
            }
            else {
                this.task = new lifecycle_task_1.ContinuationTask(this.task, this.swap, this, this.value, flags);
            }
        }
        /** @internal */
        updateView(value, flags) {
            let view;
            if (value) {
                view = this.ifView = this.ensureView(this.ifView, this.ifFactory, flags);
            }
            else if (this.elseFactory != void 0) {
                view = this.elseView = this.ensureView(this.elseView, this.elseFactory, flags);
            }
            else {
                view = void 0;
            }
            return view;
        }
        /** @internal */
        ensureView(view, factory, flags) {
            if (view === void 0) {
                view = factory.create(flags);
            }
            view.hold(this.location, 1 /* insertBefore */);
            return view;
        }
        swap(value, flags) {
            let task = lifecycle_task_1.LifecycleTask.done;
            if ((value === true && this.elseView !== void 0)
                || (value !== true && this.ifView !== void 0)) {
                task = this.deactivate(flags);
            }
            if (task.done) {
                const view = this.updateView(value, flags);
                task = this.activate(view, flags);
            }
            else {
                task = new lifecycle_task_1.PromiseTask(task.wait().then(() => this.updateView(value, flags)), this.activate, this, flags);
            }
            return task;
        }
        deactivate(flags) {
            const view = this.view;
            if (view === void 0) {
                return lifecycle_task_1.LifecycleTask.done;
            }
            view.detach(flags); // TODO: link this up with unbind
            const task = view.unbind(flags);
            view.parent = void 0;
            return task;
        }
        activate(view, flags) {
            this.view = view;
            if (view === void 0) {
                return lifecycle_task_1.LifecycleTask.done;
            }
            let task = this.bindView(flags);
            if ((this.$controller.state & 32 /* isAttached */) === 0) {
                return task;
            }
            if (task.done) {
                this.attachView(flags);
            }
            else {
                task = new lifecycle_task_1.ContinuationTask(task, this.attachView, this, flags);
            }
            return task;
        }
        bindView(flags) {
            if (this.view !== void 0 && (this.$controller.state & 5 /* isBoundOrBinding */) > 0) {
                this.view.parent = this.$controller;
                return this.view.bind(flags, this.$controller.scope, this.$controller.part);
            }
            return lifecycle_task_1.LifecycleTask.done;
        }
        attachView(flags) {
            if (this.view !== void 0 && (this.$controller.state & 40 /* isAttachedOrAttaching */) > 0) {
                this.view.attach(flags);
            }
        }
    };
    tslib_1.__decorate([
        bindable_1.bindable
    ], If.prototype, "value", void 0);
    If = tslib_1.__decorate([
        custom_attribute_1.templateController('if'),
        tslib_1.__param(0, lifecycle_1.IViewFactory),
        tslib_1.__param(1, dom_1.IRenderLocation)
    ], If);
    exports.If = If;
    let Else = class Else {
        constructor(factory) {
            this.factory = factory;
            this.id = kernel_1.nextId('au$component');
        }
        link(ifBehavior) {
            if (ifBehavior instanceof If) {
                ifBehavior.elseFactory = this.factory;
            }
            else if (ifBehavior.viewModel instanceof If) {
                ifBehavior.viewModel.elseFactory = this.factory;
            }
            else {
                throw new Error(`Unsupported IfBehavior`); // TODO: create error code
            }
        }
    };
    Else = tslib_1.__decorate([
        custom_attribute_1.templateController('else'),
        tslib_1.__param(0, lifecycle_1.IViewFactory)
    ], Else);
    exports.Else = Else;
});
//# sourceMappingURL=if.js.map