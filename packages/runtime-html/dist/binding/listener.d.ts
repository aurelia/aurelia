import { IIndexable, IServiceLocator } from '@aurelia/kernel';
import { DelegationStrategy, IBinding, IConnectableBinding, IDOM, IsBindingBehavior, IScope, LifecycleFlags, State } from '@aurelia/runtime';
import { IEventManager } from '../observation/event-manager';
export interface Listener extends IConnectableBinding {
}
/**
 * Listener binding. Handle event binding between view and view model
 */
export declare class Listener implements IBinding {
    dom: IDOM;
    $state: State;
    $scope: IScope;
    part?: string;
    delegationStrategy: DelegationStrategy;
    locator: IServiceLocator;
    preventDefault: boolean;
    sourceExpression: IsBindingBehavior;
    target: Node;
    targetEvent: string;
    private readonly eventManager;
    private handler;
    constructor(dom: IDOM, targetEvent: string, delegationStrategy: DelegationStrategy, sourceExpression: IsBindingBehavior, target: Node, preventDefault: boolean, eventManager: IEventManager, locator: IServiceLocator);
    callSource(event: Event): ReturnType<IsBindingBehavior['evaluate']>;
    handleEvent(event: Event): void;
    $bind(flags: LifecycleFlags, scope: IScope, part?: string): void;
    $unbind(flags: LifecycleFlags): void;
    observeProperty(flags: LifecycleFlags, obj: IIndexable, propertyName: string): void;
    handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void;
}
//# sourceMappingURL=listener.d.ts.map