
import { DI, IContainer, IResolver, IServiceLocator, Registration } from '@aurelia/kernel';
import { INode } from './dom';
import { LifecycleFlags } from './flags';
import { ContinuationTask, ILifecycleHooks, ILifecycleTask } from './lifecycle';
import { IScope } from './observation';
import { ExposedContext } from './rendering-engine';
import { Controller } from './templating/controller';

export interface IActivator {
  activate(host: INode, component: ILifecycleHooks, locator: IServiceLocator, flags?: LifecycleFlags, parentScope?: IScope): ILifecycleTask;
  deactivate(component: ILifecycleHooks, flags?: LifecycleFlags): ILifecycleTask;
}

export const IActivator = DI.createInterface<IActivator>('IActivator').withDefault(x => x.singleton(Activator));

/** @internal */
export class Activator implements IActivator {
  public static register(container: IContainer): IResolver<IActivator> {
    return Registration.singleton(IActivator, this).register(container);
  }

  public activate(
    host: INode,
    component: ILifecycleHooks,
    locator: IServiceLocator,
    flags: LifecycleFlags = LifecycleFlags.fromStartTask,
    parentScope?: IScope
  ): ILifecycleTask {
    flags = flags === void 0 ? LifecycleFlags.none : flags;
    const controller = Controller.forCustomElement(component, locator as ExposedContext, host, flags);
    let task = controller.bind(flags | LifecycleFlags.fromBind, parentScope);
    if (task.done) {
      controller.attach(flags | LifecycleFlags.fromAttach);
    } else {
      task = new ContinuationTask(task, controller.attach, controller, flags | LifecycleFlags.fromAttach);
    }
    return task;
  }

  public deactivate(component: ILifecycleHooks, flags: LifecycleFlags = LifecycleFlags.fromStopTask): ILifecycleTask {
    const controller = Controller.forCustomElement(component, (void 0)!, (void 0)!);
    controller.detach(flags | LifecycleFlags.fromDetach);
    return controller.unbind(flags | LifecycleFlags.fromUnbind);
  }
}
