import { IServiceLocator } from '@aurelia/kernel';
import { INode } from '../dom';
import { IBindScope, State } from '../lifecycle';
import { IScope, LifecycleFlags } from '../observation';
import { IsBindingBehavior, StrictAny } from './ast';
import { IBinding } from './binding';
import { IConnectableBinding } from './connectable';
import { DelegationStrategy, IEventManager } from './event-manager';
export interface Listener extends IConnectableBinding {
}
export declare class Listener implements IBinding {
    targetEvent: string;
    delegationStrategy: DelegationStrategy;
    sourceExpression: IsBindingBehavior;
    target: INode;
    preventDefault: boolean;
    private eventManager;
    locator: IServiceLocator;
    $nextBind: IBindScope;
    $prevBind: IBindScope;
    $state: State;
    $scope: IScope;
    private handler;
    constructor(targetEvent: string, delegationStrategy: DelegationStrategy, sourceExpression: IsBindingBehavior, target: INode, preventDefault: boolean, eventManager: IEventManager, locator: IServiceLocator);
    callSource(event: Event): ReturnType<IsBindingBehavior['evaluate']>;
    handleEvent(event: Event): void;
    $bind(flags: LifecycleFlags, scope: IScope): void;
    $unbind(flags: LifecycleFlags): void;
    observeProperty(obj: StrictAny, propertyName: StrictAny): void;
    handleChange(newValue: any, previousValue: any, flags: LifecycleFlags): void;
}
//# sourceMappingURL=listener.d.ts.map