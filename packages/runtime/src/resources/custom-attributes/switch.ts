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
  IScope,
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
    view.hold(this.location, MountStrategy.insertBefore);

    const $controller = this.$controller;

    let task = this.task.done
      ? view.bind(flags, $controller.scope, $controller.hostScope)
      : new ContinuationTask(this.task, view.bind, view, flags, $controller.scope, $controller.hostScope);
    task = task.done
      ? this.swap(flags, this.value)
      : new ContinuationTask(task, this.swap, this, flags, this.value);
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
    if (length === 0) { return this.task; }

    if (length === 1) {
      const $case = cases[0];
      if (this.task.done) {
        $case.detachView(flags);
      } else {
        this.task = new ContinuationTask(this.task, $case.detachView, $case, flags);
      }
      return this.task;
    }

    let task = this.task;
    for (const $case of cases) {
      if (task.done) {
        $case.detachView(flags);
      } else {
        task = new ContinuationTask(task, $case.detachView, $case, flags);
      }
    }

    return this.task = task;
  }

  public beforeUnbind(flags: LifecycleFlags): ILifecycleTask {
    const cases = this.activeCases;

    const length = cases.length;
    if (length === 0) { return this.task; }

    if (length === 1) {
      const view = cases[0].view;
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
    const activeCases = this.activeCases;
    const numActiveCases = activeCases.length;

    // Early termination #1
    if (!isMatch) {
      /** The previous match started with this; thus clear. */
      if (numActiveCases > 0 && activeCases[0].id === $case.id) {
        this.clearActiveCases(flags);
      }
      /**
       * There are 2 different scenarios here:
       * 1. $case in activeCases: Indicates by-product of fallthrough. The starting case still satisfies. Return.
       * 2. $case not in activeCases: It was previously not active, and currently also not a match. Return.
       */
      return;
    }

    // Early termination #2
    if (numActiveCases > 0 && activeCases[0].id < $case.id) {
      // Even if this case now a match, the previous case still wins by as that has lower ordinal.
      return;
    }

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
    this.clearActiveCases(flags, newActiveCases);
    this.activeCases = newActiveCases;

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
  }

  private swap(flags: LifecycleFlags, value: any): ILifecycleTask {
    const newActiveCases: Case<T>[] = [];

    let fallThrough: boolean = false;
    for (const $case of this.cases) {
      if (fallThrough || $case.isMatch(value, flags)) {
        newActiveCases.push($case);
        fallThrough = $case.fallThrough;
      }
      if (newActiveCases.length > 0 && !fallThrough) { break; }
    }
    const defaultCase = this.defaultCase;
    if (newActiveCases.length === 0 && defaultCase !== void 0) {
      newActiveCases.push(defaultCase);
    }

    if (this.activeCases.length > 0) {
      this.clearActiveCases(flags, newActiveCases);
    }
    this.activeCases = newActiveCases;

    if (newActiveCases.length === 0) {
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
      return cases[0].bindView(flags, scope, hostScope);
    }

    let task = LifecycleTask.done;
    for (const $case of cases) {
      task = task.done
        ? $case.bindView(flags, scope, hostScope)
        : new ContinuationTask(task, $case.bindView, $case, flags, scope, hostScope);
    }
    return task;
  }

  private attachView(flags: LifecycleFlags): void {
    if ((this.$controller.state & State.isAttachedOrAttaching) === 0) { return; }
    if ((this.$controller.state & State.isAttached) === 0) {
      this.view.attach(flags);
    }

    const cases = this.activeCases;
    const length = cases.length;
    if (length === 0) { return; }

    if (length === 1) {
      cases[0].attachView(flags);
    }

    for (const $case of cases) {
      $case.attachView(flags);
    }
  }

  private clearActiveCases(flags: LifecycleFlags, newActiveCases: Case<T>[] = []): void {
    const cases = this.activeCases;
    const numCases = cases.length;

    if (numCases === 0) { return; }

    if (numCases === 1) {
      const firstCase = cases[0];
      if (!newActiveCases.includes(firstCase)) {
        firstCase.detachView(flags);
        cases.splice(0);
      }
      return;
    }

    for (const $case of cases) {
      if (!newActiveCases.includes($case)) {
        $case.detachView(flags);
      }
    }
    cases.splice(0);
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
    @IRenderLocation location: IRenderLocation<T>,
  ) {
    const view = this.view = this.factory.create();
    view.hold(location, MountStrategy.insertBefore);
  }

  public link(controller: ICustomAttributeController<T>) {
    const $switch = controller?.viewModel;
    if ($switch instanceof Switch) {
      this.$switch = $switch;
      this.$controller.parent = controller;
      this.linkToSwitch($switch);
    } else {
      throw new Error('The parent switch not found; only `*[switch] > *[case|default-case]` relation is supported.');
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

  public bindView(flags: LifecycleFlags, scope: IScope | undefined, hostScope: IScope | null): ILifecycleTask {
    const view = this.view;
    return (view.state & State.isBound) === 0
      ? view.bind(flags, scope, hostScope)
      : LifecycleTask.done;
  }

  public attachView(flags: LifecycleFlags): void {
    const view = this.view;
    if ((view.state & State.isAttached) === 0) {
      view.attach(flags);
    }
  }

  public detachView(flags: LifecycleFlags): void {
    const view = this.view;
    view.detach(flags);
    view.release(flags);
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
