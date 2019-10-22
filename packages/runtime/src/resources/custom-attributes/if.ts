import { nextId } from '@aurelia/kernel';
import { INode, IRenderLocation } from '../../dom';
import { LifecycleFlags, State } from '../../flags';
import { IController, IViewFactory, MountStrategy } from '../../lifecycle';
import {
  ContinuationTask,
  ILifecycleTask,
  LifecycleTask,
  PromiseTask
} from '../../lifecycle-task';
import { bindable } from '../../templating/bindable';
import { templateController } from '../custom-attribute';

@templateController('if')
export class If<T extends INode = INode> {
  public readonly id: number = nextId('au$component');

  public elseFactory?: IViewFactory<T> = void 0;
  public elseView?: IController<T> = void 0;
  public ifView?: IController<T> = void 0;
  public view?: IController<T> = void 0;
  public $controller!: IController<T>; // This is set by the controller after this instance is constructed

  private task: ILifecycleTask = LifecycleTask.done;;

  @bindable public value: boolean = false;

  public constructor(
    @IViewFactory private readonly ifFactory: IViewFactory<T>,
    @IRenderLocation private readonly location: IRenderLocation<T>,
  ) {}

  public binding(flags: LifecycleFlags): ILifecycleTask {
    if (this.task.done) {
      this.task = this.swap(this.value, flags);
    } else {
      this.task = new ContinuationTask(this.task, this.swap, this, this.value, flags);
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

  public detaching(flags: LifecycleFlags): ILifecycleTask {
    if (this.view !== void 0) {
      if (this.task.done) {
        this.view.detach(flags);
      } else {
        this.task = new ContinuationTask(this.task, this.view.detach, this.view, flags);
      }
    }

    return this.task;
  }

  public unbinding(flags: LifecycleFlags): ILifecycleTask {
    if (this.view !== void 0) {
      if (this.task.done) {
        this.task = this.view.unbind(flags);
      } else {
        this.task = new ContinuationTask(this.task, this.view.unbind, this.view, flags);
      }
    }

    return this.task;
  }

  public caching(flags: LifecycleFlags): void {
    if (this.ifView !== void 0 && this.ifView.release(flags)) {
      this.ifView = void 0;
    }

    if (this.elseView !== void 0 && this.elseView.release(flags)) {
      this.elseView = void 0;
    }

    this.view = void 0;
  }

  public valueChanged(newValue: boolean, oldValue: boolean, flags: LifecycleFlags): void {
    if ((this.$controller.state & State.isBound) === 0) {
      return;
    }
    if (this.task.done) {
      this.task = this.swap(this.value, flags);
    } else {
      this.task = new ContinuationTask(this.task, this.swap, this, this.value, flags);
    }
  }

  /** @internal */
  public updateView(value: boolean, flags: LifecycleFlags): IController<T> | undefined {
    let view: IController<T> | undefined;
    if (value) {
      view = this.ifView = this.ensureView(this.ifView, this.ifFactory, flags);
    } else if (this.elseFactory != void 0) {
      view = this.elseView  = this.ensureView(this.elseView, this.elseFactory, flags);
    } else {
      view = void 0;
    }
    return view;
  }

  /** @internal */
  public ensureView(view: IController<T> | undefined, factory: IViewFactory<T>, flags: LifecycleFlags): IController<T> {
    if (view === void 0) {
      view = factory.create(flags);
    }

    view.hold(this.location, MountStrategy.insertBefore);

    return view;
  }

  private swap(value: boolean, flags: LifecycleFlags): ILifecycleTask {
    let task: ILifecycleTask = LifecycleTask.done;
    if (
      (value === true && this.elseView !== void 0)
      || (value !== true && this.ifView !== void 0)
    ) {
      task = this.deactivate(flags);
    }
    if (task.done) {
      const view = this.updateView(value, flags);
      task = this.activate(view, flags);
    } else {
      task = new PromiseTask<[LifecycleFlags], IController<T> | undefined>(task.wait().then(() => this.updateView(value, flags)), this.activate, this, flags);
    }
    return task;
  }

  private deactivate(flags: LifecycleFlags): ILifecycleTask {
    const view = this.view;
    if (view === void 0) {
      return LifecycleTask.done;
    }

    view.detach(flags); // TODO: link this up with unbind
    const task = view.unbind(flags);
    view.parent = void 0;
    return task;
  }

  private activate(view: IController<T> | undefined, flags: LifecycleFlags): ILifecycleTask {
    this.view = view;
    if (view === void 0) {
      return LifecycleTask.done;
    }
    let task = this.bindView(flags);
    if ((this.$controller.state & State.isAttached) === 0) {
      return task;
    }

    if (task.done) {
      this.attachView(flags);
    } else {
      task = new ContinuationTask(task, this.attachView, this, flags);
    }
    return task;
  }

  private bindView(flags: LifecycleFlags): ILifecycleTask {
    if (this.view !== void 0 && (this.$controller.state & State.isBoundOrBinding) > 0) {
      this.view.parent = this.$controller;
      return this.view.bind(flags, this.$controller.scope, this.$controller.part);
    }
    return LifecycleTask.done;
  }

  private attachView(flags: LifecycleFlags): void {
    if (this.view !== void 0 && (this.$controller.state & State.isAttachedOrAttaching) > 0) {
      this.view.attach(flags);
    }
  }
}

@templateController('else')
export class Else<T extends INode = INode> {
  public readonly id: number = nextId('au$component');

  public constructor(
    @IViewFactory private readonly factory: IViewFactory<T>,
  ) {}

  public link(ifBehavior: If<T> | IController<T>): void {
    if (ifBehavior instanceof If) {
      ifBehavior.elseFactory = this.factory;
    } else if (ifBehavior.viewModel instanceof If) {
      ifBehavior.viewModel.elseFactory = this.factory;
    } else {
      throw new Error(`Unsupported IfBehavior`); // TODO: create error code
    }
  }
}
