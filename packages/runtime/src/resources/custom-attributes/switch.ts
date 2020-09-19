import {
  nextId
} from '@aurelia/kernel';
import {
  INode,
  IRenderLocation,
} from '../../dom';
import {
  BindingMode,
  LifecycleFlags,
  State
} from '../../flags';
import {
  IController,
  ICustomAttributeController,
  ICustomAttributeViewModel,
  ISyntheticView,
  IViewFactory,
  MountStrategy
} from '../../lifecycle';
import {
  ContinuationTask,
  ILifecycleTask,
  LifecycleTask,
} from '../../lifecycle-task';
import {
  bindable,
} from '../../templating/bindable';
import {
  Controller,
} from '../../templating/controller';
import {
  templateController,
} from '../custom-attribute';

@templateController('switch')
export class Switch<T extends INode = Node> implements ICustomAttributeViewModel<T> {
  public readonly id: number = nextId('au$component');

  public readonly $controller!: ICustomAttributeController<T, this>; // This is set by the controller after this instance is constructed
  public view?: ISyntheticView<T> = void 0;

  @bindable public value: any;

  /** @internal */
  public readonly cases: Case<T>[] = [];
  public defaultCase?: Case<T>;
  private activeCase?: Case<T>;

  private task: ILifecycleTask = LifecycleTask.done;

  public constructor(
    @IViewFactory private readonly factory: IViewFactory<T>,
    @IRenderLocation private readonly location: IRenderLocation<T>,
  ) { }

  public beforeBind(flags: LifecycleFlags): ILifecycleTask {
    // TODO fix the linking via renderer?
    const controller = this.$controller as unknown as Controller;
    controller['hydrateSynthetic'](this.factory.context);
    // TODO do we really need reference to this view?
    this.view = controller as unknown as ISyntheticView<T>;

    if (this.task.done) {
      this.task = this.swap(flags);
    } else {
      this.task = new ContinuationTask(this.task, this.swap, this, flags);
    }
    return this.task;
  }

  public beforeAttach(flags: LifecycleFlags): void {
    if (this.task.done) {
      this.attachView(flags);
    } else {
      this.task = new ContinuationTask(this.task, this.attachView, this, flags);
    }
  }

  private swap(flags: LifecycleFlags): ILifecycleTask {
    const value = this.value;
    const activeCase: Case<T> | undefined = this.activeCase = this.cases.find((c) => c.value === value) ?? this.defaultCase;

    if (activeCase === void 0) {
      // TODO generate warning?
      return LifecycleTask.done;
    }

    const activeView = activeCase.createView(flags);
    if (activeView === void 0) {
      return LifecycleTask.done;
    }
    activeView.hold(this.location, MountStrategy.insertBefore);
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
    const controller = this.$controller;
    const activeView = this.activeCase?.view;
    if (activeView !== void 0 && (this.$controller.state & State.isBoundOrBinding) > 0) {
      return activeView.bind(flags, controller.scope, controller.hostScope);
    }
    return LifecycleTask.done;
  }

  private attachView(flags: LifecycleFlags): void {
    const activeView = this.activeCase?.view;
    if (activeView !== void 0 && (this.$controller.state & State.isAttachedOrAttaching) > 0) {
      activeView.attach(flags);
    }
  }
}

@templateController('case')
export class Case<T extends INode = Node> implements ICustomAttributeViewModel<T> {
  public readonly id: number = nextId('au$component');
  @bindable public value: any;
  @bindable({ mode: BindingMode.oneTime }) public fallthrough: boolean = false;
  protected task: ILifecycleTask = LifecycleTask.done;
  public view?: ISyntheticView<T> = void 0;
  public readonly $controller!: ICustomAttributeController<T, this>; // This is set by the controller after this instance is constructed
  private readonly auSwitch!: Switch<T>;

  public constructor(
    @IViewFactory private readonly factory: IViewFactory<T>,
    @IController controller: ICustomAttributeController<T>,
  ) {
    const auSwitch = controller.viewModel;
    if (auSwitch instanceof Switch) {
      this.auSwitch = auSwitch;
      this.linkToSwitch(auSwitch);
    } else {
      throw new Error(`Unsupported switch`);
    }
  }

  /** @internal */
  public createView(flags: LifecycleFlags): ISyntheticView<T> {
    const view = this.view = this.factory.create(flags);
    view.parent = this.$controller;
    return view;
  }

  protected linkToSwitch(auSwitch: Switch<T>) {
    auSwitch.cases.push(this);
  }
}

@templateController('default-case')
export class DefaultCase<T extends INode = Node> extends Case<T>{

  protected linkToSwitch(auSwitch: Switch<T>) {
    auSwitch.defaultCase = this;
  }
}
