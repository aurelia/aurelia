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

  @bindable public value: any;

  /** @internal */
  public readonly cases: Case<T>[] = [];
  /** @internal */
  public defaultCase?: Case<T>;
  // TODO this needs to be converted to an array to support fall-through
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

    if (this.task.done) {
      this.task = this.swap(flags, this.value);
    } else {
      this.task = new ContinuationTask(this.task, this.swap, this, flags, this.value);
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

  public beforeDetach(flags: LifecycleFlags): ILifecycleTask {
    const view = this.activeCase?.view;
    if (view !== void 0) {
      if (this.task.done) {
        view.detach(flags);
      } else {
        this.task = new ContinuationTask(this.task, view.detach, view, flags);
      }
    }

    return this.task;
  }

  public beforeUnbind(flags: LifecycleFlags): ILifecycleTask {
    const view = this.activeCase?.view;
    if (view !== void 0) {
      if (this.task.done) {
        this.task = view.unbind(flags);
      } else {
        this.task = new ContinuationTask(this.task, view.unbind, view, flags);
      }
    }

    return this.task;
  }

  public valueChanged(_newValue: boolean, _oldValue: boolean, flags: LifecycleFlags): void {
    if ((this.$controller.state & State.isBound) === 0) {
      return;
    }
    if (this.task.done) {
      this.task = this.swap(flags, this.value);
    } else {
      this.task = new ContinuationTask(this.task, this.swap, this, flags, this.value);
    }
  }

  public caseChanged($case: Case<T>): void {

  }

  private swap(flags: LifecycleFlags, value: any): ILifecycleTask {
    const activeCase: Case<T> | undefined = this.activeCase = this.cases.find((c) => c.isMatch(value)) ?? this.defaultCase;

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
    const view = this.activeCase?.view;
    if (view !== void 0 && (this.$controller.state & State.isBoundOrBinding) > 0) {
      return view.bind(flags, controller.scope, controller.hostScope);
    }
    return LifecycleTask.done;
  }

  private attachView(flags: LifecycleFlags): void {
    const view = this.activeCase?.view;
    if (view !== void 0 && (this.$controller.state & State.isAttachedOrAttaching) > 0) {
      view.attach(flags);
    }
  }
}

@templateController('case')
export class Case<T extends INode = Node> implements ICustomAttributeViewModel<T> {
  public readonly id: number = nextId('au$component');
  public readonly $controller!: ICustomAttributeController<T, this>; // This is set by the controller after this instance is constructed

  @bindable public value: any;
  @bindable({ mode: BindingMode.oneTime }) public fallthrough: boolean = false;

  public view?: ISyntheticView<T> = void 0;
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

  public isMatch(value: any): boolean {
    const $value = this.value;
    return Array.isArray($value)
      ? $value.includes(value)
      : $value === value;
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
