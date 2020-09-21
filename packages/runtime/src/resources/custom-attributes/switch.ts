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
  IndexMap,
} from '../../observation';
import {
  IObserverLocator,
} from '../../observation/observer-locator';
import {
  bindable,
} from '../../templating/bindable';
import {
  templateController,
} from '../custom-attribute';

@templateController('switch')
export class Switch<T extends INode = Node> implements ICustomAttributeViewModel<T> {
  public readonly id: number = nextId('au$component');
  public readonly $controller!: ICustomAttributeController<T, this>; // This is set by the controller after this instance is constructed
  private view!: ISyntheticView<T>;

  @bindable public value: any;

  /** @internal */
  public readonly cases: Case<T>[] = [];
  /** @internal */
  public defaultCase?: Case<T>;
  private activeCases: Case<T>[] = [];

  private task: ILifecycleTask = LifecycleTask.done;

  public constructor(
    @IViewFactory private readonly factory: IViewFactory<T>,
    @IRenderLocation private readonly location: IRenderLocation<T>,
  ) { }

  public beforeBind(flags: LifecycleFlags): ILifecycleTask {
    const view = this.view = this.factory.create(flags, this.$controller);
    const $controller = this.$controller;

    let task = this.task.done
      ? view.bind(flags, $controller.scope, $controller.hostScope)
      : new ContinuationTask(this.task, view.bind, view, flags, $controller.scope, $controller.hostScope);
    if (task.done) {
      task = this.swap(flags, this.value);
    } else {
      task = new ContinuationTask(task, this.swap, this, flags, this.value);
    }
    return this.task = task;
  }

  public beforeAttach(flags: LifecycleFlags): void {
    if (this.task.done) {
      this.attachView(flags);
    } else {
      this.task = new ContinuationTask(this.task, this.attachView, this, flags);
    }
  }

  public beforeDetach(flags: LifecycleFlags): ILifecycleTask {
    const cases = this.activeCases;

    const length = cases.length;
    if (length === 0) { return LifecycleTask.done; }

    if (length === 1) {
      const view = cases[0].view;
      if (view === void 0) { return this.task; }

      if (this.task.done) {
        view.detach(flags);
      } else {
        this.task = new ContinuationTask(this.task, view.detach, view, flags);
      }
      return this.task;
    }

    let task = this.task;
    for (const $case of cases) {
      const view = $case.view;
      if (view === void 0) { continue; }

      if (task.done) {
        view.detach(flags);
      } else {
        task = new ContinuationTask(task, view.detach, view, flags);
      }
    }

    return this.task = task;
  }

  public beforeUnbind(flags: LifecycleFlags): ILifecycleTask {
    const cases = this.activeCases;

    const length = cases.length;
    if (length === 0) { return LifecycleTask.done; }

    if (length === 1) {
      const view = cases[0].view;
      if (view === void 0) { return this.task; }

      if (this.task.done) {
        this.task = view.unbind(flags);
      } else {
        this.task = new ContinuationTask(this.task, view.unbind, view, flags);
      }

      return this.task;
    }

    let task = this.task;
    for (const $case of cases) {
      const view = $case.view;
      if (view === void 0) { continue; }

      if (task.done) {
        task = view.unbind(flags);
      } else {
        task = new ContinuationTask(task, view.unbind, view, flags);
      }
    }

    return this.task = task;
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

  public caseChanged($case: Case<T>, flags: LifecycleFlags): void {
    const isMatch = $case.isMatch(this.value, flags);

    // compute the new active cases
    const newActiveCases = [];
    let fallThrough = $case.fallThrough;
    if (!fallThrough) {
      newActiveCases.push($case);
    } else {
      const cases = this.cases;
      const idx = cases.findIndex((c) => c === $case);
      for (let i = idx, ii = cases.length; i < ii && fallThrough; i++) {
        const c = cases[i];
        newActiveCases.push(c);
        fallThrough = c.fallThrough;
      }
    }

    // optimize the common case
    if (this.activeCases.length === 1 && isMatch && this.activeCases[0].id > $case.id) {
      this.clearActiveCases(flags);
      this.activeCases = newActiveCases;

      $case.view.hold(this.location, MountStrategy.insertBefore);
      if (this.task.done) {
        this.task = this.bindView(flags);
      } else {
        this.task = new ContinuationTask(this.task, this.bindView, this, flags);
      }

      if (this.task.done) {
        this.attachView(flags);
      } else {
        this.task = new ContinuationTask(this.task, this.attachView, this, flags);
      }
      return;
    }

    this.clearActiveCases(flags);
    this.activeCases = newActiveCases;
    if (this.task.done) {
      this.task = this.swap(flags, this.value);
    } else {
      this.task = new ContinuationTask(this.task, this.swap, this, flags, this.value);
    }
  }

  private swap(flags: LifecycleFlags, value: any): ILifecycleTask {
    const activeCases: Case<T>[] = this.activeCases;

    if (activeCases.length > 0) {
      this.clearActiveCases(flags);
    }

    let fallThrough: boolean = false;
    for (const $case of this.cases) {
      if ($case.isMatch(value, flags) || fallThrough) {
        activeCases.push($case);
        fallThrough = $case.fallThrough;
        $case.view.hold(this.location, MountStrategy.insertBefore);
      }
      if (activeCases.length > 0 && !fallThrough) { break; }
    }
    const defaultCase = this.defaultCase;
    if (activeCases.length === 0 && defaultCase !== void 0) {
      activeCases.push(defaultCase);
      defaultCase.view.hold(this.location, MountStrategy.insertBefore);
    }

    if (activeCases.length === 0) {
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
    const controller = this.$controller;
    if ((controller.state & State.isBoundOrBinding) === 0) { return LifecycleTask.done; }

    const scope = controller.scope;
    const hostScope = controller.hostScope;

    const cases = this.activeCases;
    const length = cases.length;
    if (length === 0) { return LifecycleTask.done; }

    // most common case
    if (length === 1) {
      const view = cases[0].view;
      return view !== void 0 ? view.bind(flags, scope, hostScope) : LifecycleTask.done;
    }

    let task = LifecycleTask.done;
    for (const $case of cases) {
      const view = $case.view;
      if (view !== void 0) {
        task = task === LifecycleTask.done
          ? view.bind(flags, scope, hostScope)
          : new ContinuationTask(task, view.bind, view, flags, scope, hostScope);
      }
    }
    return task;
  }

  private attachView(flags: LifecycleFlags): void {
    if ((this.$controller.state & State.isAttachedOrAttaching) === 0) { return; }

    const cases = this.activeCases;
    const length = cases.length;
    if (length === 0) { return; }

    if (length === 1) {
      cases[0].view.attach(flags);
    }

    for (const $case of cases) {
      $case.view.attach(flags);
    }
  }

  private clearActiveCases(flags: LifecycleFlags): void {
    const cases = this.activeCases;
    const length = cases.length;
    if (length === 0) { return; }

    for (const $case of cases) {
      const view = $case.view;
      view.detach(flags);
      view.release(flags);
    }

    this.activeCases.splice(0);
  }
}

@templateController('case')
export class Case<T extends INode = Node> implements ICustomAttributeViewModel<T> {
  public readonly id: number = nextId('au$component');
  public readonly $controller!: ICustomAttributeController<T, this>; // This is set by the controller after this instance is constructed

  @bindable public value: any;
  @bindable({ mode: BindingMode.oneTime }) public fallThrough: boolean = false;

  public view: ISyntheticView<T>;
  private $switch!: Switch<T>;
  private isObserving: boolean = false;

  public constructor(
    @IViewFactory private readonly factory: IViewFactory<T>,
    @IObserverLocator private readonly locator: IObserverLocator,
    @IRenderLocation private readonly location: IRenderLocation<T>,
  ) {
    this.view = this.factory.create();
  }

  public link(controller: ICustomAttributeController<T>) {
    const $switch = controller.viewModel;
    if ($switch instanceof Switch) {
      this.$switch = $switch;
      this.$controller.parent = controller;
      this.linkToSwitch($switch);
    } else {
      throw new Error(`Unsupported switch`);
    }
  }

  public isMatch(value: any, flags: LifecycleFlags): boolean {
    const $value = this.value;
    if (Array.isArray($value)) {
      if (!this.isObserving) {
        const observer = this.locator.getArrayObserver(flags, $value);
        observer.addCollectionSubscriber(this);
        this.isObserving = true;
      }
      return $value.includes(value);
    }
    return $value === value;
  }

  public valueChanged(_newValue: boolean, _oldValue: boolean, flags: LifecycleFlags) {
    this.$switch.caseChanged(this, flags);
  }

  public handleCollectionChange(_indexMap: IndexMap, flags: LifecycleFlags) {
    this.$switch.caseChanged(this, flags);
  }

  protected linkToSwitch(auSwitch: Switch<T>) {
    auSwitch.cases.push(this);
  }
}

@templateController('default-case')
export class DefaultCase<T extends INode = Node> extends Case<T>{

  protected linkToSwitch($switch: Switch<T>) {
    $switch.defaultCase = this;
  }
}
