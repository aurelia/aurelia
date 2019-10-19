import { nextId, PLATFORM, Registration, } from '@aurelia/kernel';
import { Bindable, BindingMode, ContinuationTask, CustomElement, HooksDefinition, IController, IDOM, IRenderingEngine, ITargetedInstruction, LifecycleTask, PromiseTask, } from '@aurelia/runtime';
import { createElement, } from '../../create-element';
const bindables = ['subject', 'composing'];
export class Compose {
    constructor(dom, renderable, instruction, renderingEngine) {
        this.id = nextId('au$component');
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
        this.task = LifecycleTask.done;
        this.lastSubject = void 0;
        this.view = void 0;
    }
    static register(container) {
        container.register(Registration.transient('custom-element:au-compose', this));
        container.register(Registration.transient(this, this));
    }
    binding(flags) {
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
    attaching(flags) {
        if (this.task.done) {
            this.attachView(flags);
        }
        else {
            this.task = new ContinuationTask(this.task, this.attachView, this, flags);
        }
    }
    detaching(flags) {
        if (this.view != void 0) {
            if (this.task.done) {
                this.view.detach(flags);
            }
            else {
                this.task = new ContinuationTask(this.task, this.view.detach, this.view, flags);
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
            return this.view.bind(flags, this.renderable.scope, this.$controller.part);
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
        return createElement(this.dom, subject, this.properties, this.$controller.projector === void 0
            ? PLATFORM.emptyArray
            : this.$controller.projector.children).createView(flags, this.renderingEngine, this.renderable.context);
    }
}
Compose.inject = [IDOM, IController, ITargetedInstruction, IRenderingEngine];
Compose.kind = CustomElement;
Compose.description = Object.freeze({
    name: 'au-compose',
    template: null,
    cache: 0,
    build: Object.freeze({ compiler: 'default', required: false }),
    bindables: Object.freeze({
        subject: Bindable.for({ bindables: ['subject'] }).get().subject,
        composing: {
            ...Bindable.for({ bindables: ['composing'] }).get().composing,
            mode: BindingMode.fromView,
        },
    }),
    instructions: PLATFORM.emptyArray,
    dependencies: PLATFORM.emptyArray,
    surrogates: PLATFORM.emptyArray,
    aliases: PLATFORM.emptyArray,
    containerless: true,
    isStrictBinding: true,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    shadowOptions: null,
    hasSlots: false,
    strategy: 1 /* getterSetter */,
    hooks: Object.freeze(new HooksDefinition(Compose.prototype)),
    scopeParts: PLATFORM.emptyArray,
    childrenObservers: PLATFORM.emptyObject
});
//# sourceMappingURL=compose.js.map