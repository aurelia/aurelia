import {
  nextId,
} from '@aurelia/kernel';

import {
  bindable,
  ContinuationTask,
  IController,
  IControllerHoldOptions,
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

const defaultPortalLocationHoldOptions: IControllerHoldOptions = {
  isContainer: true,
  strategy: 'append'
};

@templateController({
  name: 'portal',
  hasDynamicOptions: true
})
export class Portal<T extends ParentNode = ParentNode> {

  public readonly id: number;

  @bindable()
  public value: PortalTarget<T>;

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
  private $controller!: IController<T>;

  constructor(
    @IViewFactory private readonly factory: IViewFactory<T>,
    @IRenderLocation private readonly originalLoc: IRenderLocation<T>,
    @IDOM private readonly dom: HTMLDOM,
  ) {
    this.id = nextId('au$component');

    this.factory = factory;
    this.originalLoc = location;
    this.dom = dom;
    // to make the shape of this object consistent.
    // todo: is this necessary
    this.currentTarget = dom.createElement('div');

    this.task = LifecycleTask.done;
    this.view = this.factory.create();
    this.view.hold(location);

    this.strict = false;
  }

  public binding(flags: LifecycleFlags): ILifecycleTask {
    if (this.callbackContext == null) {
      this.callbackContext = this.$controller.scope!.bindingContext;
    }

    return this.view.bind(flags, this.$controller.scope);
  }

  public attached(flags: LifecycleFlags): void {
    this.valueChanged();
  }

  public detaching(flags: LifecycleFlags): void {
    this.task = this.deactivate(flags);
  }

  public unbinding(flags: LifecycleFlags): ILifecycleTask {
    this.callbackContext = null;
    return this.view.unbind(flags);
  }

  public valueChanged(): void {
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
    const { activating, activated, callbackContext, view } = this;
    let task = this.task;

    view.hold(target, defaultPortalLocationHoldOptions);

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
    const { deactivating, deactivated, callbackContext, view, value: target } = this;
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
    const document = dom.document;
    let target = this.value;
    let context = this.renderContext;

    if (typeof target === 'string') {
      let queryContext: ParentNode = document;
      if (typeof context === 'string') {
        context = document.querySelector(context) as ResolvedTarget<T>;
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
        target = document.body as unknown as ResolvedTarget<T>;
      }
    }

    return target!;
  }
}
