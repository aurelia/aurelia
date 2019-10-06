import { nextId, PLATFORM, Registration } from '@aurelia/kernel';
import { HooksDefinition } from '../../definitions';
import { IRenderLocation } from '../../dom';
import { BindingMode } from '../../flags';
import { IViewFactory, } from '../../lifecycle';
import { ContinuationTask, LifecycleTask, PromiseTask } from '../../lifecycle-task';
import { Bindable } from '../../templating/bindable';
import { CustomAttribute } from '../custom-attribute';
export class If {
    constructor(ifFactory, location) {
        this.$observers = Object.freeze({
            value: this,
        });
        this.id = nextId('au$component');
        this.elseFactory = void 0;
        this.elseView = void 0;
        this.ifFactory = ifFactory;
        this.ifView = void 0;
        this.location = location;
        this.noProxy = true;
        this.task = LifecycleTask.done;
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
        container.register(Registration.transient('custom-attribute:if', this));
        container.register(Registration.transient(this, this));
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
            this.task = new ContinuationTask(this.task, this.swap, this, this.value, flags);
        }
        return this.task;
    }
    attaching(flags) {
        if (this.task.done) {
            this.attachView(flags);
        }
        else {
            this.task = new ContinuationTask(this.task, this.attachView, this, flags);
        }
    }
    detaching(flags) {
        if (this.view !== void 0) {
            if (this.task.done) {
                this.view.detach(flags);
            }
            else {
                this.task = new ContinuationTask(this.task, this.view.detach, this.view, flags);
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
                this.task = new ContinuationTask(this.task, this.view.unbind, this.view, flags);
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
            this.task = new ContinuationTask(this.task, this.swap, this, this.value, flags);
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
        let task = LifecycleTask.done;
        if ((value === true && this.elseView !== void 0)
            || (value !== true && this.ifView !== void 0)) {
            task = this.deactivate(flags);
        }
        if (task.done) {
            const view = this.updateView(value, flags);
            task = this.activate(view, flags);
        }
        else {
            task = new PromiseTask(task.wait().then(() => this.updateView(value, flags)), this.activate, this, flags);
        }
        return task;
    }
    deactivate(flags) {
        const view = this.view;
        if (view === void 0) {
            return LifecycleTask.done;
        }
        view.detach(flags); // TODO: link this up with unbind
        const task = view.unbind(flags);
        view.parent = void 0;
        return task;
    }
    activate(view, flags) {
        this.view = view;
        if (view === void 0) {
            return LifecycleTask.done;
        }
        let task = this.bindView(flags);
        if ((this.$controller.state & 32 /* isAttached */) === 0) {
            return task;
        }
        if (task.done) {
            this.attachView(flags);
        }
        else {
            task = new ContinuationTask(task, this.attachView, this, flags);
        }
        return task;
    }
    bindView(flags) {
        if (this.view !== void 0 && (this.$controller.state & 5 /* isBoundOrBinding */) > 0) {
            this.view.parent = this.$controller;
            return this.view.bind(flags, this.$controller.scope, this.$controller.part);
        }
        return LifecycleTask.done;
    }
    attachView(flags) {
        if (this.view !== void 0 && (this.$controller.state & 40 /* isAttachedOrAttaching */) > 0) {
            this.view.attach(flags);
        }
    }
}
If.inject = [IViewFactory, IRenderLocation];
If.kind = CustomAttribute;
If.description = Object.freeze({
    name: 'if',
    aliases: PLATFORM.emptyArray,
    defaultBindingMode: BindingMode.toView,
    isTemplateController: true,
    bindables: Object.freeze(Bindable.for({ bindables: ['value'] }).get()),
    strategy: 1 /* getterSetter */,
    hooks: Object.freeze(new HooksDefinition(If.prototype)),
});
export class Else {
    constructor(factory) {
        this.factory = factory;
    }
    static register(container) {
        container.register(Registration.transient('custom-attribute:else', this));
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
Else.inject = [IViewFactory];
Else.kind = CustomAttribute;
Else.description = {
    name: 'else',
    aliases: PLATFORM.emptyArray,
    defaultBindingMode: BindingMode.toView,
    isTemplateController: true,
    bindables: PLATFORM.emptyObject,
    strategy: 1 /* getterSetter */,
    hooks: HooksDefinition.none,
};
//# sourceMappingURL=if.js.map