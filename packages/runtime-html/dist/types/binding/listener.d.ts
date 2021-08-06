import { DelegationStrategy, LifecycleFlags } from '@aurelia/runtime';
import type { IIndexable, IServiceLocator } from '@aurelia/kernel';
import type { IsBindingBehavior, Scope } from '@aurelia/runtime';
import type { IEventDelegator } from '../observation/event-delegator.js';
import type { IPlatform } from '../platform.js';
import { IAstBasedBinding } from './interfaces-bindings.js';
export interface Listener extends IAstBasedBinding {
}
/**
 * Listener binding. Handle event binding between view and view model
 */
export declare class Listener implements IAstBasedBinding {
    platform: IPlatform;
    targetEvent: string;
    delegationStrategy: DelegationStrategy;
    sourceExpression: IsBindingBehavior;
    target: Node;
    preventDefault: boolean;
    eventDelegator: IEventDelegator;
    locator: IServiceLocator;
    interceptor: this;
    isBound: boolean;
    $scope: Scope;
    private handler;
    constructor(platform: IPlatform, targetEvent: string, delegationStrategy: DelegationStrategy, sourceExpression: IsBindingBehavior, target: Node, preventDefault: boolean, eventDelegator: IEventDelegator, locator: IServiceLocator);
    callSource(event: Event): ReturnType<IsBindingBehavior['evaluate']>;
    handleEvent(event: Event): void;
    $bind(flags: LifecycleFlags, scope: Scope): void;
    $unbind(flags: LifecycleFlags): void;
    observe(obj: IIndexable, propertyName: string): void;
    handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void;
}
//# sourceMappingURL=listener.d.ts.map