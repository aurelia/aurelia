import { InjectArray, IRegistry } from '@aurelia/kernel';
import { AttributeDefinition, IAttributeDefinition } from '../../definitions';
import { INode, IRenderLocation } from '../../dom';
import { LifecycleFlags, State } from '../../flags';
import { ContinuationTask, ILifecycleTask, IView, IViewFactory, LifecycleTask, PromiseTask } from '../../lifecycle';
import { ProxyObserver } from '../../observation/proxy-observer';
import { bindable } from '../../templating/bindable';
import { CustomAttributeResource, ICustomAttribute, ICustomAttributeResource } from '../custom-attribute';

export interface If<T extends INode = INode> extends ICustomAttribute<T> {}
export class If<T extends INode = INode> implements If<T> {
  public static readonly inject: InjectArray = [IViewFactory, IRenderLocation];

  public static readonly register: IRegistry['register'];
  public static readonly bindables: IAttributeDefinition['bindables'];
  public static readonly kind: ICustomAttributeResource;
  public static readonly description: AttributeDefinition;

  @bindable public value: boolean;

  public elseFactory: IViewFactory<T> | null;
  public elseView: IView<T> | null;
  public ifFactory: IViewFactory<T>;
  public ifView: IView<T> | null;
  public location: IRenderLocation<T>;
  private persistentFlags: LifecycleFlags;
  private task: ILifecycleTask;
  private currentView: IView<T> | null;

  constructor(
    ifFactory: IViewFactory<T>,
    location: IRenderLocation<T>
  ) {
    this.value = false;

    this.elseFactory = null;
    this.elseView = null;
    this.ifFactory = ifFactory;
    this.ifView = null;
    this.location = location;
    this.persistentFlags = LifecycleFlags.none;
    this.task = LifecycleTask.done;
    this.currentView = null;
  }

  public binding(flags: LifecycleFlags): ILifecycleTask {
    this.persistentFlags = flags & LifecycleFlags.persistentBindingFlags;
    if (this.task.done) {
      this.task = this.swap(this.value, flags);
    } else {
      this.task = new ContinuationTask(this.task, this.swap, this, this.value, flags);
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
    if (this.ifView !== null && this.ifView.release(flags)) {
      this.ifView = null;
    }

    if (this.elseView !== null && this.elseView.release(flags)) {
      this.elseView = null;
    }

    this.currentView = null;
  }

  public valueChanged(newValue: boolean, oldValue: boolean, flags: LifecycleFlags): void {
    if ((this.$state & (State.isBound | State.isBinding)) > 0) {
      flags |= this.persistentFlags;
      const $this = ProxyObserver.getRawIfProxy(this);
      if (flags & LifecycleFlags.fromFlush) {
        if ($this.task.done) {
          this.task = this.swap(newValue, flags);
        } else {
          this.task = new ContinuationTask(this.task, this.swap, this, newValue, flags);
        }
      } else {
        $this.$lifecycle.enqueueFlush($this).catch(error => { throw error; });
      }
    }
  }

  public flush(flags: LifecycleFlags): void {
    flags |= this.persistentFlags;
    const $this = ProxyObserver.getRawIfProxy(this);
    if ($this.task.done) {
      this.task = this.swap(this.value, flags);
    } else {
      this.task = new ContinuationTask(this.task, this.swap, this, this.value, flags);
    }
  }

  /** @internal */
  public updateView(value: boolean, flags: LifecycleFlags): IView<T> | null {
    let view: IView<T> | null;
    if (value) {
      view = this.ifView = this.ensureView(this.ifView, this.ifFactory, flags);
    } else if (this.elseFactory !== null) {
      view = this.elseView  = this.ensureView(this.elseView, this.elseFactory, flags);
    } else {
      view = null;
    }
    return view;
  }

  /** @internal */
  public ensureView(view: IView<T> | null, factory: IViewFactory<T>, flags: LifecycleFlags): IView<T> {
    if (view === null) {
      view = factory.create(flags);
    }

    view.hold(this.location);

    return view;
  }

  private swap(value: boolean, flags: LifecycleFlags): ILifecycleTask {
    let task = this.deactivate(flags);
    if (task.done) {
      const view = this.updateView(value, flags);
      task = this.activate(view, flags);
    } else {
      task = new PromiseTask(task.wait().then(() => this.updateView(value, flags)), this.activate, this, flags);
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
      return this.currentView.$bind(flags, this.$scope);
    }
    return LifecycleTask.done;
  }

  private attachView(flags: LifecycleFlags): ILifecycleTask {
    if (this.currentView !== null && (this.$state & (State.isAttached | State.isAttaching)) > 0) {
      return this.currentView.$attach(flags);
    }
    return LifecycleTask.done;
  }
}
CustomAttributeResource.define({ name: 'if', isTemplateController: true }, If);

export interface Else<T extends INode = INode> extends ICustomAttribute<T> {}
export class Else<T extends INode = INode> implements Else<T> {
  public static readonly inject: InjectArray = [IViewFactory];

  public static readonly register: IRegistry['register'];
  public static readonly bindables: IAttributeDefinition['bindables'];
  public static readonly kind: ICustomAttributeResource;
  public static readonly description: AttributeDefinition;

  private readonly factory: IViewFactory<T>;

  constructor(factory: IViewFactory<T>) {
    this.factory = factory;
  }

  public link(ifBehavior: If<T>): void {
    ifBehavior.elseFactory = this.factory;
  }
}
CustomAttributeResource.define({ name: 'else', isTemplateController: true }, Else);
