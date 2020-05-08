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
import { nextId } from '@aurelia/kernel';
import { IRenderLocation } from '../../dom';
import { IViewFactory } from '../../lifecycle';
import { ContinuationTask, LifecycleTask, PromiseTask } from '../../lifecycle-task';
import { bindable } from '../../templating/bindable';
import { templateController } from '../custom-attribute';
let If = class If {
    constructor(ifFactory, location) {
        this.ifFactory = ifFactory;
        this.location = location;
        this.id = nextId('au$component');
        this.elseFactory = void 0;
        this.elseView = void 0;
        this.ifView = void 0;
        this.view = void 0;
        this.task = LifecycleTask.done;
        this.value = false;
    }
    ;
    beforeBind(flags) {
        if (this.task.done) {
            this.task = this.swap(this.value, flags);
        }
        else {
            this.task = new ContinuationTask(this.task, this.swap, this, this.value, flags);
        }
        return this.task;
    }
    beforeAttach(flags) {
        if (this.task.done) {
            this.attachView(flags);
        }
        else {
            this.task = new ContinuationTask(this.task, this.attachView, this, flags);
        }
    }
    beforeDetach(flags) {
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
    beforeUnbind(flags) {
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
        view.hold(this.location, 1 /* insertBefore */);
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
};
__decorate([
    bindable,
    __metadata("design:type", Boolean)
], If.prototype, "value", void 0);
If = __decorate([
    templateController('if'),
    __param(0, IViewFactory),
    __param(1, IRenderLocation),
    __metadata("design:paramtypes", [Object, Object])
], If);
export { If };
let Else = class Else {
    constructor(factory) {
        this.factory = factory;
        this.id = nextId('au$component');
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
Else = __decorate([
    templateController('else'),
    __param(0, IViewFactory),
    __metadata("design:paramtypes", [Object])
], Else);
export { Else };
//# sourceMappingURL=if.js.map