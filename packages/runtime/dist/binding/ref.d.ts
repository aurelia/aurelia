import { IIndexable, IServiceLocator } from '@aurelia/kernel';
import { IBindScope, State } from '../lifecycle';
import { IScope, LifecycleFlags } from '../observation';
import { IsBindingBehavior } from './ast';
import { IBinding, IBindingTarget } from './binding';
import { IConnectableBinding } from './connectable';
export interface Ref extends IConnectableBinding {
}
export declare class Ref implements IBinding {
    $nextBind: IBindScope;
    $prevBind: IBindScope;
    $state: State;
    $scope: IScope;
    locator: IServiceLocator;
    sourceExpression: IsBindingBehavior;
    target: IBindingTarget;
    constructor(sourceExpression: IsBindingBehavior, target: IBindingTarget, locator: IServiceLocator);
    $bind(flags: LifecycleFlags, scope: IScope): void;
    $unbind(flags: LifecycleFlags): void;
    observeProperty(obj: IIndexable, propertyName: string): void;
    handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void;
}
//# sourceMappingURL=ref.d.ts.map