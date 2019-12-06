import {
  DI,
  IContainer,
  IResolver,
  Registration,
  Key,
  Constructable,
} from '@aurelia/kernel';
import { INode } from './dom';
import { LifecycleFlags } from './flags';
import { IController, IViewModel, ILifecycle } from './lifecycle';
import {
  ContinuationTask,
  ILifecycleTask,
  IStartTaskManager,
} from './lifecycle-task';
import { IScope } from './observation';
import { Controller } from './templating/controller';
import { CustomElement } from './resources/custom-element';

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
    component: IViewModel,
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

  public deactivate(component: IViewModel, flags: LifecycleFlags = LifecycleFlags.fromStopTask): ILifecycleTask {
    const controller = this.getController(component);
    controller.detach(flags | LifecycleFlags.fromDetach);
    return controller.unbind(flags | LifecycleFlags.fromUnbind);
  }

  private render(
    host: INode,
    component: IViewModel,
    container: IContainer,
    flags: LifecycleFlags,
  ): void {
    const lifecycle = container.get(ILifecycle);
    Controller.forCustomElement(component, lifecycle, host, container, void 0, flags);
  }

  private bind(
    component: IViewModel,
    flags: LifecycleFlags,
    parentScope?: IScope,
  ): ILifecycleTask {
    return this.getController(component).bind(flags | LifecycleFlags.fromBind, parentScope);
  }

  private attach(
    component: IViewModel,
    flags: LifecycleFlags,
  ): void {
    this.getController(component).attach(flags | LifecycleFlags.fromAttach);
  }

  private getController(component: IViewModel): IController {
    return Controller.forCustomElement(
      component,
      (void 0)!,
      void 0 as unknown as INode,
      (void 0)!,
    );
  }
}
