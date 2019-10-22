(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/kernel", "@aurelia/runtime", "../../create-element"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    const create_element_1 = require("../../create-element");
    const bindables = ['subject', 'composing'];
    let Compose = class Compose {
        constructor(dom, renderable, instruction, renderingEngine) {
            this.dom = dom;
            this.renderable = renderable;
            this.instruction = instruction;
            this.renderingEngine = renderingEngine;
            this.id = kernel_1.nextId('au$component');
            this.subject = void 0;
            this.composing = false;
            this.view = void 0;
            this.task = runtime_1.LifecycleTask.done;
            this.lastSubject = void 0;
            this.properties = instruction.instructions
                .filter((x) => !bindables.includes(x.to))
                .reduce((acc, item) => {
                if (item.to) {
                    acc[item.to] = item;
                }
                return acc;
            }, {});
        }
        binding(flags) {
            if (this.task.done) {
                this.task = this.compose(this.subject, flags);
            }
            else {
                this.task = new runtime_1.ContinuationTask(this.task, this.compose, this, this.subject, flags);
            }
            if (this.task.done) {
                this.task = this.bindView(flags);
            }
            else {
                this.task = new runtime_1.ContinuationTask(this.task, this.bindView, this, flags);
            }
            return this.task;
        }
        attaching(flags) {
            if (this.task.done) {
                this.attachView(flags);
            }
            else {
                this.task = new runtime_1.ContinuationTask(this.task, this.attachView, this, flags);
            }
        }
        detaching(flags) {
            if (this.view != void 0) {
                if (this.task.done) {
                    this.view.detach(flags);
                }
                else {
                    this.task = new runtime_1.ContinuationTask(this.task, this.view.detach, this.view, flags);
                }
            }
        }
        unbinding(flags) {
            this.lastSubject = void 0;
            if (this.view != void 0) {
                if (this.task.done) {
                    this.task = this.view.unbind(flags);
                }
                else {
                    this.task = new runtime_1.ContinuationTask(this.task, this.view.unbind, this.view, flags);
                }
            }
            return this.task;
        }
        caching(flags) {
            this.view = void 0;
        }
        subjectChanged(newValue, previousValue, flags) {
            flags |= this.$controller.flags;
            if (this.task.done) {
                this.task = this.compose(newValue, flags);
            }
            else {
                this.task = new runtime_1.ContinuationTask(this.task, this.compose, this, newValue, flags);
            }
        }
        compose(subject, flags) {
            if (this.lastSubject === subject) {
                return runtime_1.LifecycleTask.done;
            }
            this.lastSubject = subject;
            this.composing = true;
            let task = this.deactivate(flags);
            if (subject instanceof Promise) {
                let viewPromise;
                if (task.done) {
                    viewPromise = subject.then(s => this.resolveView(s, flags));
                }
                else {
                    viewPromise = task.wait().then(() => subject.then(s => this.resolveView(s, flags)));
                }
                task = new runtime_1.PromiseTask(viewPromise, this.activate, this, flags);
            }
            else {
                const view = this.resolveView(subject, flags);
                if (task.done) {
                    task = this.activate(view, flags);
                }
                else {
                    task = new runtime_1.ContinuationTask(task, this.activate, this, view, flags);
                }
            }
            if (task.done) {
                this.onComposed();
            }
            else {
                task = new runtime_1.ContinuationTask(task, this.onComposed, this);
            }
            return task;
        }
        deactivate(flags) {
            const view = this.view;
            if (view == void 0) {
                return runtime_1.LifecycleTask.done;
            }
            view.detach(flags);
            return view.unbind(flags);
        }
        activate(view, flags) {
            this.view = view;
            if (view == void 0) {
                return runtime_1.LifecycleTask.done;
            }
            let task = this.bindView(flags);
            if (task.done) {
                this.attachView(flags);
            }
            else {
                task = new runtime_1.ContinuationTask(task, this.attachView, this, flags);
            }
            return task;
        }
        bindView(flags) {
            if (this.view != void 0 && (this.$controller.state & (5 /* isBoundOrBinding */)) > 0) {
                return this.view.bind(flags, this.renderable.scope, this.$controller.part);
            }
            return runtime_1.LifecycleTask.done;
        }
        attachView(flags) {
            if (this.view != void 0 && (this.$controller.state & (40 /* isAttachedOrAttaching */)) > 0) {
                this.view.attach(flags);
            }
        }
        onComposed() {
            this.composing = false;
        }
        resolveView(subject, flags) {
            const view = this.provideViewFor(subject, flags);
            if (view) {
                view.hold(this.$controller.projector.host, 1 /* insertBefore */);
                view.lockScope(this.renderable.scope);
                return view;
            }
            return void 0;
        }
        provideViewFor(subject, flags) {
            if (!subject) {
                return void 0;
            }
            if ('lockScope' in subject) { // IController
                return subject;
            }
            if ('createView' in subject) { // RenderPlan
                return subject.createView(flags, this.renderingEngine, this.renderable.context);
            }
            if ('create' in subject) { // IViewFactory
                return subject.create();
            }
            if ('template' in subject) { // Raw Template Definition
                return this.renderingEngine.getViewFactory(this.dom, subject, this.renderable.context).create();
            }
            // Constructable (Custom Element Constructor)
            return create_element_1.createElement(this.dom, subject, this.properties, this.$controller.projector === void 0
                ? kernel_1.PLATFORM.emptyArray
                : this.$controller.projector.children).createView(flags, this.renderingEngine, this.renderable.context);
        }
    };
    tslib_1.__decorate([
        runtime_1.bindable
    ], Compose.prototype, "subject", void 0);
    tslib_1.__decorate([
        runtime_1.bindable({ mode: runtime_1.BindingMode.fromView })
    ], Compose.prototype, "composing", void 0);
    Compose = tslib_1.__decorate([
        runtime_1.customElement({ name: 'au-compose', template: null, containerless: true }),
        tslib_1.__param(0, runtime_1.IDOM),
        tslib_1.__param(1, runtime_1.IController),
        tslib_1.__param(2, runtime_1.ITargetedInstruction),
        tslib_1.__param(3, runtime_1.IRenderingEngine)
    ], Compose);
    exports.Compose = Compose;
});
//# sourceMappingURL=compose.js.map