import { Constructable, Immutable, InjectArray, IRegistry } from '@aurelia/kernel';
import {
  bindable,
  ContinuationTask,
  CustomElementResource,
  ICustomElement,
  ICustomElementResource,
  IDOM,
  IHydrateElementInstruction,
  ILifecycleTask,
  INode,
  IRenderable,
  IRenderingEngine,
  ITargetedInstruction,
  ITemplateDefinition,
  IView,
  IViewFactory,
  LifecycleFlags,
  LifecycleTask,
  PromiseTask,
  State,
  TargetedInstruction,
  TemplateDefinition
} from '@aurelia/runtime';
import { createElement, RenderPlan } from '../../create-element';

const composeSource: ITemplateDefinition = {
  name: 'au-compose',
  containerless: true
};

const composeProps = ['subject', 'composing'];

export type Subject<T extends INode = Node> = IViewFactory<T> | IView<T> | RenderPlan<T> | Constructable | TemplateDefinition;
export type MaybeSubjectPromise<T> = Subject<T> | Promise<Subject<T>> | null;

export interface Compose<T extends INode = Node> extends ICustomElement<T> {}
export class Compose<T extends INode = Node> implements Compose<T> {
  public static readonly inject: InjectArray = [IDOM, IRenderable, ITargetedInstruction, IRenderingEngine];

  public static readonly register: IRegistry['register'];
  public static readonly kind: ICustomElementResource<Node>;
  public static readonly description: TemplateDefinition;
  public static readonly containerless: TemplateDefinition['containerless'];
  public static readonly shadowOptions: TemplateDefinition['shadowOptions'];
  public static readonly bindables: TemplateDefinition['bindables'];

  @bindable public subject: MaybeSubjectPromise<T>;
  @bindable public composing: boolean;

  private readonly dom: IDOM;
  private readonly properties: Record<string, TargetedInstruction>;
  private readonly renderable: IRenderable<T>;
  private readonly renderingEngine: IRenderingEngine;
  private lastSubject: MaybeSubjectPromise<T>;
  private task: ILifecycleTask;
  private currentView: IView<T> | null;
  private persistentFlags: LifecycleFlags; // TODO

  constructor(
    dom: IDOM<T>,
    renderable: IRenderable<T>,
    instruction: Immutable<IHydrateElementInstruction>,
    renderingEngine: IRenderingEngine
  ) {
    this.dom = dom;
    this.subject = null;
    this.composing = false;

    this.lastSubject = null;
    this.task = LifecycleTask.done;
    this.currentView = null;
    this.renderable = renderable;
    this.renderingEngine = renderingEngine;

    this.properties = instruction.instructions
      .filter((x: ITargetedInstruction & {to?: string}) => !composeProps.includes(x.to))
      .reduce(
        (acc, item: ITargetedInstruction & {to?: string}) => {
          if (item.to) {
            acc[item.to] = item;
          }

          return acc;
        },
        {}
      );
  }

  public binding(flags: LifecycleFlags): ILifecycleTask {
    if (this.task.done) {
      this.task = this.compose(this.subject, flags);
    } else {
      this.task = new ContinuationTask(this.task, this.compose, this, this.subject, flags);
    }

    if (this.task.done) {
      this.task = this.bindView(flags);
    } else {
      this.task = new ContinuationTask(this.task, this.bindView, this, flags);
    }

    return this.task;
  }

  public attaching(flags: LifecycleFlags): ILifecycleTask {
    if (this.task.done) {
      this.task = this.attachView(flags);
    } else {
      this.task = new ContinuationTask(this.task, this.attachView, this, flags);
    }

    return this.task;
  }

  public detaching(flags: LifecycleFlags): ILifecycleTask {
    if (this.currentView !== null) {
      if (this.task.done) {
        this.task = this.currentView.$detach(flags);
      } else {
        this.task = new ContinuationTask(this.task, this.currentView.$detach, this.currentView, flags);
      }
    }

    return this.task;
  }

  public unbinding(flags: LifecycleFlags): ILifecycleTask {
    this.lastSubject = null;
    if (this.currentView !== null) {
      if (this.task.done) {
        this.task = this.currentView.$unbind(flags);
      } else {
        this.task = new ContinuationTask(this.task, this.currentView.$unbind, this.currentView, flags);
      }
    }

    return this.task;
  }

  public caching(flags: LifecycleFlags): void {
    this.currentView = null;
  }

  public subjectChanged(newValue: Subject<T> | Promise<Subject<T>>, previousValue: Subject<T> | Promise<Subject<T>>, flags: LifecycleFlags): void {
    if (this.task.done) {
      this.task = this.compose(newValue, flags);
    } else {
      this.task = new ContinuationTask(this.task, this.compose, this, newValue, flags);
    }
  }

  private compose(subject: MaybeSubjectPromise<T>, flags: LifecycleFlags): ILifecycleTask {
    if (this.lastSubject === subject) {
      return LifecycleTask.done;
    }

    this.lastSubject = subject;
    this.composing = true;

    let task = this.deactivate(flags);

    if (subject instanceof Promise) {
      let viewPromise: Promise<IView<T>>;
      if (task.done) {
        viewPromise = subject.then(s => this.resolveView(s, flags));
      } else {
        viewPromise = task.wait().then(() => subject.then(s => this.resolveView(s, flags)));
      }
      task = new PromiseTask(viewPromise, this.activate, this, flags);
    } else {
      const view = this.resolveView(subject, flags);
      if (task.done) {
        task = this.activate(view, flags);
      } else {
        task = new ContinuationTask(task, this.activate, this, view, flags);
      }
    }

    if (task.done) {
      this.onComposed();
    } else {
      task = new ContinuationTask(task, this.onComposed, this);
    }

    return task;
  }

  private deactivate(flags: LifecycleFlags): ILifecycleTask {
    const view = this.currentView;
    if (view === null) {
      return LifecycleTask.done;
    }
    let task = view.$detach(flags);
    if (task.done) {
      task = view.$unbind(flags);
    } else {
      task = new ContinuationTask(task, view.$unbind, view, flags);
    }
    return task;
  }

  private activate(view: IView<T>, flags: LifecycleFlags): ILifecycleTask {
    this.currentView = view;
    if (view === null) {
      return LifecycleTask.done;
    }
    let task = this.bindView(flags);
    if (task.done) {
      task = this.attachView(flags);
    } else {
      task = new ContinuationTask(task, this.attachView, this, flags);
    }
    return task;
  }

  private bindView(flags: LifecycleFlags): ILifecycleTask {
    if (this.currentView !== null && (this.$state & (State.isBound | State.isBinding)) > 0) {
      return this.currentView.$bind(flags, this.renderable.$scope);
    }
    return LifecycleTask.done;
  }

  private attachView(flags: LifecycleFlags): ILifecycleTask {
    if (this.currentView !== null && (this.$state & (State.isAttached | State.isAttaching)) > 0) {
      return this.currentView.$attach(flags);
    }
    return LifecycleTask.done;
  }

  private onComposed(): void {
    this.composing = false;
  }

  private resolveView(subject: Subject<T> | null, flags: LifecycleFlags): IView<T> | null {
    const view = this.provideViewFor(subject, flags);

    if (view) {
      view.hold(this.$projector.host);
      view.lockScope(this.renderable.$scope);
      return view;
    }

    return null;
  }

  private provideViewFor(subject: Subject<T> | null, flags: LifecycleFlags): IView<T> | null {
    if (!subject) {
      return null;
    }

    if ('lockScope' in subject) { // IView
      return subject;
    }

    if ('createView' in subject) { // RenderPlan
      return subject.createView(
        flags,
        this.renderingEngine,
        this.renderable.$context
      ) as IView<T>;
    }

    if ('create' in subject) { // IViewFactory
      return subject.create();
    }

    if ('template' in subject) { // Raw Template Definition
      return this.renderingEngine.getViewFactory(
        this.dom,
        subject,
        this.renderable.$context
      ).create() as IView<T>;
    }

    // Constructable (Custom Element Constructor)
    return createElement(
      this.dom,
      subject,
      this.properties,
      this.$projector.children
    ).createView(
      flags,
      this.renderingEngine,
      this.renderable.$context
    ) as IView<T>;
  }
}
CustomElementResource.define(composeSource, Compose);
