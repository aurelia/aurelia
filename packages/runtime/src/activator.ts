import {
  DI,
  IContainer,
  IResolver,
  Registration,
  Key,
} from '@aurelia/kernel';
import { INode } from './dom';
import { LifecycleFlags } from './flags';
import { IViewModel, ILifecycle, ICustomElementViewModel } from './lifecycle';
import {
  ContinuationTask,
  ILifecycleTask,
  IStartTaskManager,
} from './lifecycle-task';
import { IScope } from './observation';
import { Controller } from './templating/controller';

export interface IActivator {
  activate(host: INode, component: IViewModel, container: IContainer, flags?: LifecycleFlags, parentScope?: IScope): ILifecycleTask;
  deactivate(component: IViewModel, flags?: LifecycleFlags): ILifecycleTask;
}

export const IActivator = DI.createInterface<IActivator>('IActivator').withDefault(x => x.singleton(Activator));

/** @internal */
export class Activator implements IActivator {
  public static readonly inject: readonly Key[] = [IStartTaskManager];

  public constructor(
    private readonly taskManager: IStartTaskManager,
  ) {}

  public static register(container: IContainer): IResolver<IActivator> {
    return Registration.singleton(IActivator, this).register(container);
  }

  public activate(
    host: INode,
    component: ICustomElementViewModel,
    container: IContainer,
    flags: LifecycleFlags = LifecycleFlags.fromStartTask,
    parentScope?: IScope
  ): ILifecycleTask {
    flags = flags === void 0 ? LifecycleFlags.none : flags;
    const mgr = this.taskManager;

    let task = mgr.runBeforeRender();

    if (task.done) {
      this.render(host, component, container, flags);
    } else {
      task = new ContinuationTask(task, this.render, this, host, component, container, flags);
    }

    if (task.done) {
      task = mgr.runBeforeBind();
    } else {
      task = new ContinuationTask(task, mgr.runBeforeBind, mgr);
    }

    if (task.done) {
      task = this.bind(component, flags, parentScope);
    } else {
      task = new ContinuationTask(task, this.bind, this, component, flags, parentScope);
    }

    if (task.done) {
      task = mgr.runBeforeAttach();
    } else {
      task = new ContinuationTask(task, mgr.runBeforeAttach, mgr);
    }

    if (task.done) {
      this.attach(component, flags);
    } else {
      task = new ContinuationTask(task, this.attach, this, component, flags);
    }

    return task;
  }

  public deactivate(component: ICustomElementViewModel, flags: LifecycleFlags = LifecycleFlags.fromStopTask): ILifecycleTask {
    const controller = Controller.getCachedOrThrow(component);
    controller.detach(flags | LifecycleFlags.fromDetach);
    return controller.unbind(flags | LifecycleFlags.fromUnbind);
  }

  private render(
    host: INode,
    component: ICustomElementViewModel,
    container: IContainer,
    flags: LifecycleFlags,
  ): void {
    const lifecycle = container.get(ILifecycle);
    Controller.forCustomElement(component, lifecycle, host, container, void 0, flags);
  }

  private bind(
    component: ICustomElementViewModel,
    flags: LifecycleFlags,
    parentScope?: IScope,
  ): ILifecycleTask {
    return Controller.getCachedOrThrow(component).bind(flags | LifecycleFlags.fromBind, parentScope);
  }

  private attach(
    component: ICustomElementViewModel,
    flags: LifecycleFlags,
  ): void {
    Controller.getCachedOrThrow(component).attach(flags | LifecycleFlags.fromAttach);
  }
}
