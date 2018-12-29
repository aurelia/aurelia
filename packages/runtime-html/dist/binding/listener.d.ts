import { IIndexable, IServiceLocator } from '@aurelia/kernel';
import { DelegationStrategy, IBinding, IBindScope, IConnectableBinding, IDOM, IsBindingBehavior, IScope, LifecycleFlags, State } from '@aurelia/runtime';
import { IEventManager } from '../observation/event-manager';
export interface Listener extends IConnectableBinding {
}
export declare class Listener implements IBinding {
    dom: IDOM;
    $nextBind: IBindScope;
    $prevBind: IBindScope;
    $state: State;
    $scope: IScope;
    delegationStrategy: DelegationStrategy;
    locator: IServiceLocator;
    preventDefault: boolean;
    sourceExpression: IsBindingBehavior;
    target: Node;
    targetEvent: string;
    private eventManager;
    private handler;
    constructor(dom: IDOM, targetEvent: string, delegationStrategy: DelegationStrategy, sourceExpression: IsBindingBehavior, target: Node, preventDefault: boolean, eventManager: IEventManager, locator: IServiceLocator);
    callSource(event: Event): ReturnType<IsBindingBehavior['evaluate']>;
    handleEvent(event: Event): void;
    $bind(flags: LifecycleFlags, scope: IScope): void;
    $unbind(flags: LifecycleFlags): void;
    observeProperty(obj: IIndexable, propertyName: string): void;
    handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void;
}
//# sourceMappingURL=listener.d.ts.map