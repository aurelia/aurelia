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
import { nextId, PLATFORM, } from '@aurelia/kernel';
import { BindingMode, ContinuationTask, IDOM, ITargetedInstruction, LifecycleTask, PromiseTask, CustomElementDefinition, bindable, customElement, getRenderContext, } from '@aurelia/runtime';
import { createElement, } from '../../create-element';
const bindables = ['subject', 'composing'];
let Compose = class Compose {
    constructor(dom, instruction) {
        this.dom = dom;
        this.id = nextId('au$component');
        this.subject = void 0;
        this.composing = false;
        this.view = void 0;
        this.task = LifecycleTask.done;
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
    beforeBind(flags) {
        if (this.task.done) {
            this.task = this.compose(this.subject, flags);
        }
        else {
            this.task = new ContinuationTask(this.task, this.compose, this, this.subject, flags);
        }
        if (this.task.done) {
            this.task = this.bindView(flags);
        }
        else {
            this.task = new ContinuationTask(this.task, this.bindView, this, flags);
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
        if (this.view != void 0) {
            if (this.task.done) {
                this.view.detach(flags);
            }
            else {
                this.task = new ContinuationTask(this.task, this.view.detach, this.view, flags);
            }
        }
    }
    beforeUnbind(flags) {
        this.lastSubject = void 0;
        if (this.view != void 0) {
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
        this.view = void 0;
    }
    subjectChanged(newValue, previousValue, flags) {
        flags |= this.$controller.flags;
        if (this.task.done) {
            this.task = this.compose(newValue, flags);
        }
        else {
            this.task = new ContinuationTask(this.task, this.compose, this, newValue, flags);
        }
    }
    compose(subject, flags) {
        if (this.lastSubject === subject) {
            return LifecycleTask.done;
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
            task = new PromiseTask(viewPromise, this.activate, this, flags);
        }
        else {
            const view = this.resolveView(subject, flags);
            if (task.done) {
                task = this.activate(view, flags);
            }
            else {
                task = new ContinuationTask(task, this.activate, this, view, flags);
            }
        }
        if (task.done) {
            this.onComposed();
        }
        else {
            task = new ContinuationTask(task, this.onComposed, this);
        }
        return task;
    }
    deactivate(flags) {
        const view = this.view;
        if (view == void 0) {
            return LifecycleTask.done;
        }
        view.detach(flags);
        return view.unbind(flags);
    }
    activate(view, flags) {
        this.view = view;
        if (view == void 0) {
            return LifecycleTask.done;
        }
        let task = this.bindView(flags);
        if (task.done) {
            this.attachView(flags);
        }
        else {
            task = new ContinuationTask(task, this.attachView, this, flags);
        }
        return task;
    }
    bindView(flags) {
        if (this.view != void 0 && (this.$controller.state & (5 /* isBoundOrBinding */)) > 0) {
            return this.view.bind(flags, this.$controller.scope, this.$controller.part);
        }
        return LifecycleTask.done;
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
            view.lockScope(this.$controller.scope);
            return view;
        }
        return void 0;
    }
    provideViewFor(subject, flags) {
        if (!subject) {
            return void 0;
        }
        if (isController(subject)) { // IController
            return subject;
        }
        if ('createView' in subject) { // RenderPlan
            return subject.createView(this.$controller.context);
        }
        if ('create' in subject) { // IViewFactory
            return subject.create(flags);
        }
        if ('template' in subject) { // Raw Template Definition
            const definition = CustomElementDefinition.getOrCreate(subject);
            return getRenderContext(definition, this.$controller.context, void 0).getViewFactory().create(flags);
        }
        // Constructable (Custom Element Constructor)
        return createElement(this.dom, subject, this.properties, this.$controller.projector === void 0
            ? PLATFORM.emptyArray
            : this.$controller.projector.children).createView(this.$controller.context);
    }
};
__decorate([
    bindable,
    __metadata("design:type", Object)
], Compose.prototype, "subject", void 0);
__decorate([
    bindable({ mode: BindingMode.fromView }),
    __metadata("design:type", Boolean)
], Compose.prototype, "composing", void 0);
Compose = __decorate([
    customElement({ name: 'au-compose', template: null, containerless: true }),
    __param(0, IDOM),
    __param(1, ITargetedInstruction),
    __metadata("design:paramtypes", [Object, Object])
], Compose);
export { Compose };
function isController(subject) {
    return 'lockScope' in subject;
}
//# sourceMappingURL=compose.js.map