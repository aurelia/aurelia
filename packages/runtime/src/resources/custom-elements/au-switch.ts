import {
  DI,
  IContainer,
  nextId,
  optional,
  Registration,
  Writable,
} from '@aurelia/kernel';
import {
  INode, IRenderLocation,
} from '../../dom';
import {
  LifecycleFlags,
  State,
} from '../../flags';
import {
  IController,
  ICustomAttributeController,
  ICustomElementController,
  ICustomElementViewModel,
  ISyntheticView,
  IViewFactory,
  MountStrategy,
} from '../../lifecycle';
import {
  ContinuationTask,
  ILifecycleTask,
  LifecycleTask,
} from '../../lifecycle-task';
import { Scope } from '../../observation/binding-context';
import {
  bindable,
} from '../../templating/bindable';
import { Controller } from '../../templating/controller';
import {
  templateController,
} from '../custom-attribute';
import {
  CustomElement,
  customElement,
} from '../custom-element';

// interface IAuSwitch<T extends INode = Node> {
//   readonly cases: Case<T>[];
//   defaultCase?: Case<T>;
// }
// const IAuSwitch = DI.createInterface<IAuSwitch>('IAuSwitch').noDefault();

@customElement({ name: 'au-switch', template: null/* , containerless: true */ })
export class AuSwitch<T extends INode = Node> implements ICustomElementViewModel<T> {
  // probably it is better to rename this to value.
  @bindable public expression: any;
  /** @internal */
  public readonly cases: Case<T>[] = [];
  public defaultCase?: Case<T>;

  public readonly $controller!: ICustomElementController<T, this>; // This is set by the controller after this instance is constructed

  private task: ILifecycleTask = LifecycleTask.done;

  public constructor(
    // @IViewFactory private readonly factory: IViewFactory<T>,
    @IRenderLocation private readonly location: IRenderLocation<T>,
  ) {
    console.log(`switch ctor:`, location);
    // const view = factory.create();
    // view.hold(location, MountStrategy.insertBefore);
  }

  public beforeBind(flags: LifecycleFlags): ILifecycleTask {
    console.log('before bind');
    console.log(`#cases: ${this.cases.length}`);
    console.log(`value: ${this.expression}`);
    console.log(`scope`, this.$controller.scope);
    if (this.task.done) {
      this.task = this.swap(flags);
    } else {
      this.task = new ContinuationTask(this.task, this.swap, this, flags);
    }
    return this.task;
  }

  private swap(flags: LifecycleFlags): ILifecycleTask {
    const value = this.expression;
    for (const $case of this.cases) {
      console.log(`$case.value: ${$case.value}`);
      if (value === $case.value) {
        return $case.activate(flags, this.location);
      }
    }
    return this.defaultCase?.activate(flags, this.location) ?? LifecycleTask.done;
  }
}

@templateController('case')
export class Case<T extends INode = Node> {
  public readonly id: number = nextId('au$component');
  @bindable public value: any;
  protected task: ILifecycleTask = LifecycleTask.done;
  public view?: ISyntheticView<T> = void 0;
  public readonly $controller!: ICustomAttributeController<T, this>; // This is set by the controller after this instance is constructed
  private readonly auSwitch: AuSwitch<T>;

  public constructor(
    @IViewFactory private readonly factory: IViewFactory<T>,
    @IRenderLocation private readonly location: IRenderLocation<T>,
    @INode node: Node,
  ) {
    const auSwitch = CustomElement.for(node, true)?.viewModel ?? null;
    if (auSwitch instanceof AuSwitch) {
      this.auSwitch = auSwitch;
      auSwitch.cases.push(this);
    } else {
      throw new Error(`Unsupported switch`);
    }
  }

  /** @internal */
  public activate(flags: LifecycleFlags, location: IRenderLocation<T>): ILifecycleTask {
    const controller = this.$controller as Writable<IController>;
    const pc = this.auSwitch.$controller;
    controller.scope = controller.scope ?? Scope.fromParent(flags, pc.scope, null!);
    controller.state |= flags;

    if (this.task.done) {
      this.task = this.activateCore(flags, location);
    } else {
      this.task = new ContinuationTask(this.task, this.activateCore, this, flags, location);
    }
    return this.task;
  }

  /** @internal */
  protected activateCore(flags: LifecycleFlags, location: IRenderLocation<T>): ILifecycleTask {
    const view = this.view = this.factory.create(flags);
    if (view === void 0) {
      return LifecycleTask.done;
    }
    view.hold(this.location, MountStrategy.insertBefore);
    let task = this.bindView(flags);
    console.log('bound');
    // if ((this.$controller.state & State.isAttached) === 0) {
    //   return task;
    // }

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
      console.log('binding');
      return this.view.bind(flags, this.$controller.scope, this.$controller.hostScope);
    }
    return LifecycleTask.done;
  }

  private attachView(flags: LifecycleFlags): void {
    console.log(`attachView`, this.$controller.state);
    if (this.view !== void 0 /* && (this.$controller.state & State.isAttachedOrAttaching) > 0 */) {
      this.view.attach(flags);
    }
  }
}

@templateController('default-case')
export class DefaultCase<T extends INode = Node> extends Case<T>{

  /** @internal */
  public link(auSwitch: AuSwitch<T> | ICustomElementController<T>): void {
    console.log(`DefaultCase#link`);
    if (auSwitch instanceof AuSwitch) {
      auSwitch.defaultCase = this;
    } else if (auSwitch.viewModel instanceof AuSwitch) {
      auSwitch.viewModel.defaultCase = this;
    } else {
      throw new Error(`Unsupported switch`);
    }
  }
}
