import { IServiceLocator } from '@aurelia/kernel';
import { INode } from '../dom';
import { IsBindingBehavior, StrictAny } from './ast';
import { IBinding } from './binding';
import { IScope } from './binding-context';
import { BindingFlags } from './binding-flags';
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
    $isBound: boolean;
    $scope: IScope;
    private handler;
    constructor(targetEvent: string, delegationStrategy: DelegationStrategy, sourceExpression: IsBindingBehavior, target: INode, preventDefault: boolean, eventManager: IEventManager, locator: IServiceLocator);
    callSource(event: Event): ReturnType<IsBindingBehavior['evaluate']>;
    handleEvent(event: Event): void;
    $bind(flags: BindingFlags, scope: IScope): void;
    $unbind(flags: BindingFlags): void;
    observeProperty(obj: StrictAny, propertyName: StrictAny): void;
    handleChange(newValue: any, previousValue: any, flags: BindingFlags): void;
}
//# sourceMappingURL=listener.d.ts.map