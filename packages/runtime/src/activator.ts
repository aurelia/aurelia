
import { DI, IContainer, IResolver, IServiceLocator, Registration } from '@aurelia/kernel';
import { INode } from './dom';
import { LifecycleFlags } from './flags';
import { ContinuationTask, ILifecycleTask, isHydrated } from './lifecycle';
import { IScope } from './observation';
import { ICustomElement } from './resources/custom-element';

export interface IActivator {
  activate(host: INode, component: ICustomElement, locator: IServiceLocator, flags?: LifecycleFlags, parentScope?: IScope): ILifecycleTask;
  deactivate(component: ICustomElement, flags?: LifecycleFlags): ILifecycleTask;
}

export const IActivator = DI.createInterface<IActivator>('IActivator').withDefault(x => x.singleton(Activator));

/** @internal */
export class Activator implements IActivator {
  public static register(container: IContainer): IResolver<IActivator> {
    return Registration.singleton(IActivator, this).register(container);
  }

  public activate(
    host: INode,
    component: ICustomElement,
    locator: IServiceLocator,
    flags: LifecycleFlags = LifecycleFlags.fromStartTask,
    parentScope: IScope = null
  ): ILifecycleTask {
    parentScope = parentScope === undefined ? null : parentScope;
    flags = flags === undefined ? LifecycleFlags.none : flags;
    if (!isHydrated(component.$state)) {
      component.$hydrate(flags, locator, host);
    }
    let task = component.$bind(flags | LifecycleFlags.fromBind, parentScope);
    if (task.done) {
      task = component.$attach(flags | LifecycleFlags.fromAttach);
    } else {
      task = new ContinuationTask(task, component.$attach, component, flags | LifecycleFlags.fromAttach);
    }
    return task;
  }

  public deactivate(component: ICustomElement, flags: LifecycleFlags = LifecycleFlags.fromStopTask): ILifecycleTask {
    let task = component.$detach(flags | LifecycleFlags.fromDetach);
    if (task.done) {
      task = component.$unbind(flags | LifecycleFlags.fromUnbind);
    } else {
      task = new ContinuationTask(task, component.$unbind, component, flags | LifecycleFlags.fromUnbind);
    }
    return task;
  }
}
