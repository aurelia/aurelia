import {
  Constructable,
  nextId,
  PLATFORM,
} from '@aurelia/kernel';
import {
  BindingMode,
  ContinuationTask,
  IController,
  IDOM,
  IHydrateElementInstruction,
  ILifecycleTask,
  INode,
  IRenderingEngine,
  ITargetedInstruction,
  IViewFactory,
  LifecycleFlags,
  LifecycleTask,
  PromiseTask,
  State,
  TargetedInstruction,
  CustomElementDefinition,
  bindable,
  customElement,
  MountStrategy,
} from '@aurelia/runtime';
import {
  createElement,
  RenderPlan,
} from '../../create-element';

const bindables = ['subject', 'composing'];

export type Subject<T extends INode = Node> = IViewFactory<T> | IController<T> | RenderPlan<T> | Constructable | CustomElementDefinition;
export type MaybeSubjectPromise<T> = Subject<T> | Promise<Subject<T>> | undefined;

@customElement({ name: 'au-compose', template: null, containerless: true })
export class Compose<T extends INode = Node> {
  public readonly id: number = nextId('au$component');

  @bindable public subject?: MaybeSubjectPromise<T> = void 0;
  @bindable({ mode: BindingMode.fromView }) public composing: boolean = false;

  public view?: IController<T> = void 0;

  private readonly properties: Record<string, TargetedInstruction>;

  private task: ILifecycleTask = LifecycleTask.done;
  private lastSubject?: MaybeSubjectPromise<T> = void 0;
  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  private $controller!: IController<T>; // This is set by the controller after this instance is constructed

  public constructor(
    @IDOM private readonly dom: IDOM<T>,
    @IController private readonly renderable: IController<T>,
    @ITargetedInstruction private readonly instruction: IHydrateElementInstruction,
    @IRenderingEngine private readonly renderingEngine: IRenderingEngine,
  ) {
    this.properties = instruction.instructions
      .filter((x: ITargetedInstruction & { to?: string }) => !bindables.includes(x.to!))
      .reduce<Record<string, TargetedInstruction>>(
      (acc, item: ITargetedInstruction & { to?: string }) => {
        if (item.to) {
          acc[item.to] = item as TargetedInstruction;
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

  public attaching(flags: LifecycleFlags): void {
    if (this.task.done) {
      this.attachView(flags);
    } else {
      this.task = new ContinuationTask(this.task, this.attachView, this, flags);
    }
  }

  public detaching(flags: LifecycleFlags): void {
    if (this.view != void 0) {
      if (this.task.done) {
        this.view.detach(flags);
      } else {
        this.task = new ContinuationTask(this.task, this.view.detach, this.view, flags);
      }
    }
  }

  public unbinding(flags: LifecycleFlags): ILifecycleTask {
    this.lastSubject = void 0;
    if (this.view != void 0) {
      if (this.task.done) {
        this.task = this.view.unbind(flags);
      } else {
        this.task = new ContinuationTask(this.task, this.view.unbind, this.view, flags);
      }
    }

    return this.task;
  }

  public caching(flags: LifecycleFlags): void {
    this.view = void 0;
  }

  public subjectChanged(newValue: Subject<T> | Promise<Subject<T>>, previousValue: Subject<T> | Promise<Subject<T>>, flags: LifecycleFlags): void {
    flags |= this.$controller.flags;
    if (this.task.done) {
      this.task = this.compose(newValue, flags);
    } else {
      this.task = new ContinuationTask(this.task, this.compose, this, newValue, flags);
    }
  }

  private compose(subject: MaybeSubjectPromise<T> | undefined, flags: LifecycleFlags): ILifecycleTask {
    if (this.lastSubject === subject) {
      return LifecycleTask.done;
    }

    this.lastSubject = subject;
    this.composing = true;

    let task = this.deactivate(flags);

    if (subject instanceof Promise) {
      let viewPromise: Promise<IController<T> | undefined>;
      if (task.done) {
        viewPromise = subject.then(s => this.resolveView(s, flags));
      } else {
        viewPromise = task.wait().then(() => subject.then(s => this.resolveView(s, flags)));
      }
      task = new PromiseTask<[LifecycleFlags], IController<T> | undefined>(viewPromise, this.activate, this, flags);
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
    const view = this.view;
    if (view == void 0) {
      return LifecycleTask.done;
    }
    view.detach(flags);
    return view.unbind(flags);
  }

  private activate(view: IController<T> | undefined, flags: LifecycleFlags): ILifecycleTask {
    this.view = view;
    if (view == void 0) {
      return LifecycleTask.done;
    }
    let task = this.bindView(flags);
    if (task.done) {
      this.attachView(flags);
    } else {
      task = new ContinuationTask(task, this.attachView, this, flags);
    }
    return task;
  }

  private bindView(flags: LifecycleFlags): ILifecycleTask {
    if (this.view != void 0 && (this.$controller.state & (State.isBoundOrBinding)) > 0) {
      return this.view.bind(flags, this.renderable.scope, this.$controller.part);
    }
    return LifecycleTask.done;
  }

  private attachView(flags: LifecycleFlags): void {
    if (this.view != void 0 && (this.$controller.state & (State.isAttachedOrAttaching)) > 0) {
      this.view.attach(flags);
    }
  }

  private onComposed(): void {
    this.composing = false;
  }

  private resolveView(subject: Subject<T> | undefined, flags: LifecycleFlags): IController<T> | undefined {
    const view = this.provideViewFor(subject, flags);

    if (view) {
      view.hold(this.$controller.projector!.host, MountStrategy.insertBefore);
      view.lockScope(this.renderable.scope!);
      return view;
    }

    return void 0;
  }

  private provideViewFor(subject: Subject<T> | undefined, flags: LifecycleFlags): IController<T> | undefined {
    if (!subject) {
      return void 0;
    }

    if ('lockScope' in subject) { // IController
      return subject;
    }

    if ('createView' in subject) { // RenderPlan
      return subject.createView(
        flags,
        this.renderingEngine,
        this.renderable.context
      ) as IController<T>;
    }

    if ('create' in subject) { // IViewFactory
      return subject.create();
    }

    if ('template' in subject) { // Raw Template Definition
      return this.renderingEngine.getViewFactory(
        this.dom,
        subject,
        this.renderable.context
      ).create() as IController<T>;
    }

    // Constructable (Custom Element Constructor)
    return createElement(
      this.dom,
      subject,
      this.properties,
      this.$controller.projector === void 0
        ? PLATFORM.emptyArray
        : this.$controller.projector.children
    ).createView(
      flags,
      this.renderingEngine,
      this.renderable.context
    ) as IController<T>;
  }
}
