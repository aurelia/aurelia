import {
  IContainer,
  InjectArray,
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
  Priority,
} from '../../lifecycle';
import {
  IObserversLookup,
} from '../../observation';
import { SetterObserver } from '../../observation/setter-observer';
import { Bindable } from '../../templating/bindable';
import {
  CustomAttributeResource,
  ICustomAttributeResource
} from '../custom-attribute';
import {
  ILifecycleTask,
  LifecycleTask,
  ContinuationTask,
  PromiseTask
} from '../../lifecycle-task';

export class If<T extends INode = INode> {
  public static readonly inject: InjectArray = [IViewFactory, IRenderLocation];

  public static readonly kind: ICustomAttributeResource = CustomAttributeResource;
  public static readonly description: Required<IAttributeDefinition> = Object.freeze({
    name: 'if',
    aliases: PLATFORM.emptyArray as typeof PLATFORM.emptyArray & string[],
    defaultBindingMode: BindingMode.toView,
    hasDynamicOptions: false,
    isTemplateController: true,
    bindables: Object.freeze(Bindable.for({ bindables: ['value'] }).get()),
    strategy: BindingStrategy.getterSetter,
    hooks: Object.freeze(new HooksDefinition(If.prototype)),
  });

  public get value(): boolean {
    return this._value;
  }
  public set value(newValue: boolean) {
    if (this._value !== newValue) {
      this.valueChanged(newValue, this._value, LifecycleFlags.none);
    }
  }

  public readonly $observers: IObserversLookup = {
    value: this as this & SetterObserver,
  };

  public elseFactory?: IViewFactory<T>;
  public elseView?: IController<T>;
  public ifFactory: IViewFactory<T>;
  public ifView?: IController<T>;
  public location: IRenderLocation<T>;
  public readonly noProxy: true;
  public view?: IController<T>;

  private task: ILifecycleTask;
  // tslint:disable-next-line: prefer-readonly // This is set by the controller after this instance is constructed
  private $controller!: IController<T>;

  private _prevValue: boolean;
  private _value: boolean;

  constructor(
    ifFactory: IViewFactory<T>,
    location: IRenderLocation<T>,
  ) {
    this.elseFactory = void 0;
    this.elseView = void 0;
    this.ifFactory = ifFactory;
    this.ifView = void 0;
    this.location = location;
    this.noProxy = true;

    this.task = LifecycleTask.done;
    this.view = void 0;

    this._value = false;
    this._prevValue = false;
  }

  public static register(container: IContainer): void {
    container.register(Registration.transient('custom-attribute:if', this));
    container.register(Registration.transient(this, this));
  }

  public getValue(): boolean {
    return this._value;
  }

  public setValue(newValue: boolean, flags: LifecycleFlags): void {
    if (this._value !== newValue) {
      this.valueChanged(newValue, this._value, LifecycleFlags.none);
    }
  }

  public created(flags: LifecycleFlags): void {
    this.$controller.lifecycle.enqueueRAF(this.flushRAF, this, Priority.bind);
  }

  public binding(flags: LifecycleFlags): ILifecycleTask {
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
    this._value = newValue;
    if (this.$controller.lifecycle.isFlushingRAF) {
      this.flushRAF(flags);
    } else if (this._prevValue !== newValue) {
      ++this.$controller.lifecycle.pendingChanges;
    }
  }

  public flushRAF(flags: LifecycleFlags): void {
    if (this._prevValue !== this._value && this.task.done) {
      this._prevValue = this._value;
      this.task = this.swap(this.value, flags);
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
    let task = this.deactivate(flags);
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
    return view.unbind(flags);
  }

  private activate(view: IController<T> | undefined, flags: LifecycleFlags): ILifecycleTask {
    this.view = view;
    if (view === void 0) {
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
    if (this.view !== void 0 && (this.$controller.state & State.isBoundOrBinding) > 0) {
      return this.view.bind(flags, this.$controller.scope);
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
  public static readonly inject: InjectArray = [IViewFactory];

  public static readonly kind: ICustomAttributeResource = CustomAttributeResource;
  public static readonly description: Required<IAttributeDefinition> = {
    name: 'else',
    aliases: PLATFORM.emptyArray as typeof PLATFORM.emptyArray & string[],
    defaultBindingMode: BindingMode.toView,
    hasDynamicOptions: false,
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
