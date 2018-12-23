import { IIndexable, IServiceLocator } from '@aurelia/kernel';
import { IEvent, INode } from '../dom.interfaces';
import { IBindScope, State } from '../lifecycle';
import { IScope, LifecycleFlags } from '../observation';
import { DelegationStrategy, IEventManager } from '../observation/event-manager';
import { IsBindingBehavior } from './ast';
import { IBinding } from './binding';
import { IConnectableBinding } from './connectable';
export interface Listener extends IConnectableBinding {
}
export declare class Listener implements IBinding {
    $nextBind: IBindScope;
    $prevBind: IBindScope;
    $state: State;
    $scope: IScope;
    delegationStrategy: DelegationStrategy;
    locator: IServiceLocator;
    preventDefault: boolean;
    sourceExpression: IsBindingBehavior;
    target: INode;
    targetEvent: string;
    private eventManager;
    private handler;
    constructor(targetEvent: string, delegationStrategy: DelegationStrategy, sourceExpression: IsBindingBehavior, target: INode, preventDefault: boolean, eventManager: IEventManager, locator: IServiceLocator);
    callSource(event: IEvent): ReturnType<IsBindingBehavior['evaluate']>;
    handleEvent(event: IEvent): void;
    $bind(flags: LifecycleFlags, scope: IScope): void;
    $unbind(flags: LifecycleFlags): void;
    observeProperty(obj: IIndexable, propertyName: string): void;
    handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void;
}
//# sourceMappingURL=listener.d.ts.map