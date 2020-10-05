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
  hasAsyncWork,
  TerminalTask,
  LifecycleTask,
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
    flags: LifecycleFlags = LifecycleFlags.none,
    parentScope?: IScope
  ): ILifecycleTask {
    flags = flags === void 0 ? LifecycleFlags.none : flags;
    const mgr = this.taskManager;

    let task = mgr.runBeforeCompile();

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
      task = this.activateController(component, flags, parentScope);
    } else {
      task = new ContinuationTask(task, this.activateController, this, component, flags, parentScope);
    }

    if (task.done) {
      task = mgr.runAfterAttach();
    } else {
      task = new ContinuationTask(task, mgr.runAfterAttach, mgr);
    }

    return task;
  }

  public deactivate(
    component: ICustomElementViewModel,
    flags: LifecycleFlags = LifecycleFlags.none,
  ): ILifecycleTask {
    const controller = Controller.getCachedOrThrow(component);
    const ret = controller.deactivate(controller, null, flags);
    if (hasAsyncWork(ret)) {
      return new TerminalTask(ret);
    }
    return LifecycleTask.done;
  }

  private render(
    host: INode,
    component: ICustomElementViewModel,
    container: IContainer,
    flags: LifecycleFlags,
  ): void {
    const lifecycle = container.get(ILifecycle);
    Controller.forCustomElement(component, lifecycle, host, container, null, flags);
  }

  private activateController(
    component: ICustomElementViewModel,
    flags: LifecycleFlags,
    parentScope?: IScope,
  ): ILifecycleTask {
    const controller = Controller.getCachedOrThrow(component);
    const ret = controller.activate(controller, null, flags | LifecycleFlags.fromBind, parentScope);
    if (hasAsyncWork(ret)) {
      return new TerminalTask(ret);
    }
    return LifecycleTask.done;
  }
}
