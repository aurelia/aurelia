(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "@aurelia/runtime", "../../create-element"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    const create_element_1 = require("../../create-element");
    const bindables = ['subject', 'composing'];
    class Compose {
        constructor(dom, renderable, instruction, renderingEngine) {
            this.id = kernel_1.nextId('au$component');
            this.subject = void 0;
            this.composing = false;
            this.dom = dom;
            this.renderable = renderable;
            this.renderingEngine = renderingEngine;
            this.properties = instruction.instructions
                .filter((x) => !bindables.includes(x.to))
                .reduce((acc, item) => {
                if (item.to) {
                    acc[item.to] = item;
                }
                return acc;
            }, {});
            this.task = runtime_1.LifecycleTask.done;
            this.lastSubject = void 0;
            this.view = void 0;
        }
        static register(container) {
            container.register(kernel_1.Registration.transient('custom-element:au-compose', this));
            container.register(kernel_1.Registration.transient(this, this));
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
                view.hold(this.$controller.projector.host);
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
    }
    Compose.inject = [runtime_1.IDOM, runtime_1.IController, runtime_1.ITargetedInstruction, runtime_1.IRenderingEngine];
    Compose.kind = runtime_1.CustomElement;
    Compose.description = Object.freeze({
        name: 'au-compose',
        template: null,
        cache: 0,
        build: Object.freeze({ compiler: 'default', required: false }),
        bindables: Object.freeze({
            subject: runtime_1.Bindable.for({ bindables: ['subject'] }).get().subject,
            composing: {
                ...runtime_1.Bindable.for({ bindables: ['composing'] }).get().composing,
                mode: runtime_1.BindingMode.fromView,
            },
        }),
        instructions: kernel_1.PLATFORM.emptyArray,
        dependencies: kernel_1.PLATFORM.emptyArray,
        surrogates: kernel_1.PLATFORM.emptyArray,
        aliases: kernel_1.PLATFORM.emptyArray,
        containerless: true,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        shadowOptions: null,
        hasSlots: false,
        strategy: 1 /* getterSetter */,
        hooks: Object.freeze(new runtime_1.HooksDefinition(Compose.prototype)),
        scopeParts: kernel_1.PLATFORM.emptyArray,
        childrenObservers: kernel_1.PLATFORM.emptyObject
    });
    exports.Compose = Compose;
});
//# sourceMappingURL=compose.js.map