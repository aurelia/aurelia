import {
  IContainer,
  Key,
  nextId,
  PLATFORM,
  Registration
} from '@aurelia/kernel';
import {
  HooksDefinition,
  IAttributeDefinition
} from '../../definitions';
import {
  INode,
  IRenderLocation
} from '../../dom';
import {
  BindingMode,
  BindingStrategy,
  LifecycleFlags,
  State
} from '../../flags';
import {
  IController,
  IViewFactory,
} from '../../lifecycle';
import {
  ContinuationTask,
  ILifecycleTask,
  LifecycleTask,
  PromiseTask
} from '../../lifecycle-task';
import {
  InlineObserversLookup,
} from '../../observation';
import { Bindable } from '../../templating/bindable';
import {
  CustomAttribute,
  ICustomAttributeResource
} from '../custom-attribute';

export class If<T extends INode = INode> {

  public get value(): boolean {
    return this._value;
  }
  public set value(newValue: boolean) {
    const oldValue = this._value;
    if (oldValue !== newValue) {
      this._value = newValue;
      this.valueChanged(newValue, oldValue, this.$controller.flags);
    }
  }
  public static readonly inject: readonly Key[] = [IViewFactory, IRenderLocation];

  public static readonly kind: ICustomAttributeResource = CustomAttribute;
  public static readonly description: Required<IAttributeDefinition> = Object.freeze({
    name: 'if',
    aliases: PLATFORM.emptyArray as typeof PLATFORM.emptyArray & string[],
    defaultBindingMode: BindingMode.toView,
    isTemplateController: true,
    bindables: Object.freeze(Bindable.for({ bindables: ['value'] }).get()),
    strategy: BindingStrategy.getterSetter,
    hooks: Object.freeze(new HooksDefinition(If.prototype)),
  });

  public readonly id: number;

  public readonly $observers: InlineObserversLookup<this> = Object.freeze({
    value: this,
  });

  public elseFactory?: IViewFactory<T>;
  public elseView?: IController<T>;
  public ifFactory: IViewFactory<T>;
  public ifView?: IController<T>;
  public location: IRenderLocation<T>;
  public readonly noProxy: true;
  public view?: IController<T>;
  public $controller!: IController<T>; // This is set by the controller after this instance is constructed

  private task: ILifecycleTask;

  private _value: boolean;

  constructor(
    ifFactory: IViewFactory<T>,
    location: IRenderLocation<T>,
  ) {
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

  public static register(container: IContainer): void {
    container.register(Registration.transient('custom-attribute:if', this));
    container.register(Registration.transient(this, this));
  }

  public getValue(): boolean {
    return this._value;
  }

  public setValue(newValue: boolean, flags: LifecycleFlags): void {
    const oldValue = this._value;
    if (oldValue !== newValue) {
      this._value = newValue;
      this.valueChanged(newValue, oldValue, flags | this.$controller.flags);
    }
  }

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

    view.hold(this.location);

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

export class Else<T extends INode = INode> {
  public static readonly inject: readonly Key[] = [IViewFactory];

  public static readonly kind: ICustomAttributeResource = CustomAttribute;
  public static readonly description: Required<IAttributeDefinition> = {
    name: 'else',
    aliases: PLATFORM.emptyArray as typeof PLATFORM.emptyArray & string[],
    defaultBindingMode: BindingMode.toView,
    isTemplateController: true,
    bindables: PLATFORM.emptyObject,
    strategy: BindingStrategy.getterSetter,
    hooks: HooksDefinition.none,
  };

  private readonly factory: IViewFactory<T>;

  constructor(factory: IViewFactory<T>) {
    this.factory = factory;
  }

  public static register(container: IContainer): void {
    container.register(Registration.transient('custom-attribute:else', this));
  }

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
