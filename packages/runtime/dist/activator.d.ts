import { IServiceLocator } from '@aurelia/kernel';
import { INode } from './dom';
import { LifecycleFlags } from './flags';
import { IViewModel } from './lifecycle';
import { ILifecycleTask } from './lifecycle-task';
import { IScope } from './observation';
export interface IActivator {
    activate(host: INode, component: IViewModel, locator: IServiceLocator, flags?: LifecycleFlags, parentScope?: IScope): ILifecycleTask;
    deactivate(component: IViewModel, flags?: LifecycleFlags): ILifecycleTask;
}
export declare const IActivator: import("@aurelia/kernel").InterfaceSymbol<IActivator>;
//# sourceMappingURL=activator.d.ts.map