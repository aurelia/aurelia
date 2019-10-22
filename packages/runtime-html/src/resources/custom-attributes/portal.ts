import {
  nextId,
} from '@aurelia/kernel';
import {
  bindable,
  ContinuationTask,
  IController,
  MountStrategy,
  IDOM,
  ILifecycleTask,
  IRenderLocation,
  IViewFactory,
  LifecycleFlags,
  LifecycleTask,
  State,
  templateController,
  TerminalTask
} from '@aurelia/runtime';
import {
  HTMLDOM,
} from '../../dom';

export type PortalTarget<T extends ParentNode = ParentNode> = string | T | null | undefined;
type ResolvedTarget<T extends ParentNode = ParentNode> = T | null;

export type PortalLifecycleCallback<T extends ParentNode = ParentNode> = (target: PortalTarget<T>, view: IController<T>) => void | Promise<void> | ILifecycleTask;

function toTask(maybePromiseOrTask: void | Promise<void> | ILifecycleTask): ILifecycleTask {
  if (maybePromiseOrTask == null) {
    return LifecycleTask.done;
  }

  if (typeof (maybePromiseOrTask as Promise<void>).then === 'function') {
    return new TerminalTask(maybePromiseOrTask);
  }

  return maybePromiseOrTask as ILifecycleTask;
}

@templateController('portal')
export class Portal<T extends ParentNode = ParentNode> {

  public readonly id: number;

  @bindable({ primary: true })
  public target: PortalTarget<T>;

  @bindable({ callback: 'targetChanged' })
  public renderContext: PortalTarget<T>;

  @bindable()
  public strict: boolean;

  @bindable()
  public deactivating?: PortalLifecycleCallback<T>;

  @bindable()
  public activating?: PortalLifecycleCallback<T>;

  @bindable()
  public deactivated?: PortalLifecycleCallback<T>;

  @bindable()
  public activated?: PortalLifecycleCallback<T>;

  @bindable()
  public callbackContext: unknown;

  public readonly view: IController<T>;

  private task: ILifecycleTask;

  private currentTarget?: PortalTarget;

  // tslint:disable-next-line: prefer-readonly // This is set by the controller after this instance is constructed
  private readonly $controller!: IController<T>;

  public constructor(
    @IViewFactory private readonly factory: IViewFactory<T>,
    @IRenderLocation private readonly originalLoc: IRenderLocation<T>,
    @IDOM private readonly dom: HTMLDOM,
  ) {
    this.id = nextId('au$component');
    // to make the shape of this object consistent.
    // todo: is this necessary
    this.currentTarget = dom.createElement('div');

    this.task = LifecycleTask.done;
    this.view = this.factory.create();
    this.view.hold(originalLoc, MountStrategy.insertBefore);

    this.strict = false;
  }

  public binding(flags: LifecycleFlags): ILifecycleTask {
    if (this.callbackContext == null) {
      this.callbackContext = this.$controller.scope!.bindingContext;
    }

    return this.view.bind(flags, this.$controller.scope);
  }

  public attached(flags: LifecycleFlags): void {
    this.targetChanged();
  }

  public detaching(flags: LifecycleFlags): void {
    this.task = this.deactivate(flags);
  }

  public unbinding(flags: LifecycleFlags): ILifecycleTask {
    this.callbackContext = null;
    return this.view.unbind(flags);
  }

  public targetChanged(): void {
    const $controller = this.$controller;
    if (($controller.state & State.isBound) === 0) {
      return;
    }

    this.project($controller.flags);
  }

  private project(flags: LifecycleFlags): void {
    const oldTarget = this.currentTarget;
    const newTarget = this.currentTarget = this.resolveTarget();

    if (oldTarget === newTarget) {
      return;
    }

    this.task = this.deactivate(flags);
    this.task = this.activate(newTarget, flags);
  }

  private activate(target: T, flags: LifecycleFlags): ILifecycleTask {
    const {
      activating,
      activated,
      callbackContext,
      view
    } = this;
    let task = this.task;

    view.hold(target, MountStrategy.append);

    if ((this.$controller.state & State.isAttachedOrAttaching) === 0) {
      return task;
    }

    if (typeof activating === 'function') {
      if (task.done) {
        task = toTask(activating.call(callbackContext, target, view));
      } else {
        task = new ContinuationTask(task, activating, callbackContext, target, view);
      }
    }

    if (task.done) {
      view.attach(flags);
    } else {
      task = new ContinuationTask(task, view.attach, view, flags);
    }

    if (typeof activated === 'function') {
      if (task.done) {
        // TODO: chain this up with RAF queue mount callback so activated is called only when
        // node is actually mounted (is this needed as per the spec of this resource?)
        task = toTask(activated.call(callbackContext, target, view));
      } else {
        task = new ContinuationTask(task, activated, callbackContext, target, view);
      }
    }

    return task;
  }

  private deactivate(flags: LifecycleFlags): ILifecycleTask {
    const {
      deactivating,
      deactivated,
      callbackContext,
      view,
      target: target
    } = this;
    let task = this.task;

    if (typeof deactivating === 'function') {
      if (task.done) {
        task = toTask(deactivating.call(callbackContext, target, view));
      } else {
        task = new ContinuationTask(task, deactivating, callbackContext, target, view);
      }
    }

    if (task.done) {
      view.detach(flags);
    } else {
      task = new ContinuationTask(task, view.detach, view, flags);
    }

    if (typeof deactivated === 'function') {
      if (task.done) {
        task = toTask(deactivated.call(callbackContext, target, view));
      } else {
        task = new ContinuationTask(task, deactivated, callbackContext, target, view);
      }
    }

    return task;
  }

  private resolveTarget(): T {
    const dom = this.dom;
    // with a $ in front to make it less confusing/error prone
    const $document = dom.document;
    let target = this.target;
    let context = this.renderContext;

    if (typeof target === 'string') {
      let queryContext: ParentNode = $document;
      if (typeof context === 'string') {
        context = $document.querySelector(context) as ResolvedTarget<T>;
      }
      if (dom.isNodeInstance(context)) {
        queryContext = context;
      }
      target = queryContext.querySelector(target) as ResolvedTarget<T>;
    }

    if (dom.isNodeInstance(target)) {
      return target;
    }

    if (target == null) {
      if (this.strict) {
        throw new Error('Render target not found');
      } else {
        target = $document.body as unknown as ResolvedTarget<T>;
      }
    }

    return target!;
  }
}
