(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "../../definitions", "../../dom", "../../flags", "../../lifecycle", "../../lifecycle-task", "../../templating/bindable", "../custom-attribute"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const definitions_1 = require("../../definitions");
    const dom_1 = require("../../dom");
    const flags_1 = require("../../flags");
    const lifecycle_1 = require("../../lifecycle");
    const lifecycle_task_1 = require("../../lifecycle-task");
    const bindable_1 = require("../../templating/bindable");
    const custom_attribute_1 = require("../custom-attribute");
    class If {
        constructor(ifFactory, location) {
            this.$observers = Object.freeze({
                value: this,
            });
            this.id = kernel_1.nextId('au$component');
            this.elseFactory = void 0;
            this.elseView = void 0;
            this.ifFactory = ifFactory;
            this.ifView = void 0;
            this.location = location;
            this.noProxy = true;
            this.task = lifecycle_task_1.LifecycleTask.done;
            this.view = void 0;
            this._value = false;
        }
        get value() {
            return this._value;
        }
        set value(newValue) {
            const oldValue = this._value;
            if (oldValue !== newValue) {
                this._value = newValue;
                this.valueChanged(newValue, oldValue, this.$controller.flags);
            }
        }
        static register(container) {
            container.register(kernel_1.Registration.transient('custom-attribute:if', this));
            container.register(kernel_1.Registration.transient(this, this));
        }
        getValue() {
            return this._value;
        }
        setValue(newValue, flags) {
            const oldValue = this._value;
            if (oldValue !== newValue) {
                this._value = newValue;
                this.valueChanged(newValue, oldValue, flags | this.$controller.flags);
            }
        }
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
            view.hold(this.location);
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
    }
    exports.If = If;
    If.inject = [lifecycle_1.IViewFactory, dom_1.IRenderLocation];
    If.kind = custom_attribute_1.CustomAttribute;
    If.description = Object.freeze({
        name: 'if',
        aliases: kernel_1.PLATFORM.emptyArray,
        defaultBindingMode: flags_1.BindingMode.toView,
        hasDynamicOptions: false,
        isTemplateController: true,
        bindables: Object.freeze(bindable_1.Bindable.for({ bindables: ['value'] }).get()),
        strategy: 1 /* getterSetter */,
        hooks: Object.freeze(new definitions_1.HooksDefinition(If.prototype)),
    });
    class Else {
        constructor(factory) {
            this.factory = factory;
        }
        static register(container) {
            container.register(kernel_1.Registration.transient('custom-attribute:else', this));
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
    }
    exports.Else = Else;
    Else.inject = [lifecycle_1.IViewFactory];
    Else.kind = custom_attribute_1.CustomAttribute;
    Else.description = {
        name: 'else',
        aliases: kernel_1.PLATFORM.emptyArray,
        defaultBindingMode: flags_1.BindingMode.toView,
        hasDynamicOptions: false,
        isTemplateController: true,
        bindables: kernel_1.PLATFORM.emptyObject,
        strategy: 1 /* getterSetter */,
        hooks: definitions_1.HooksDefinition.none,
    };
});
//# sourceMappingURL=if.js.map