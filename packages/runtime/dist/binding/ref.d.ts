import { IServiceLocator } from '@aurelia/kernel';
import { IBindScope, State } from '../lifecycle';
import { IScope, LifecycleFlags } from '../observation';
import { IsBindingBehavior, StrictAny } from './ast';
import { IBinding, IBindingTarget } from './binding';
import { IConnectableBinding } from './connectable';
export interface Ref extends IConnectableBinding {
}
export declare class Ref implements IBinding {
    sourceExpression: IsBindingBehavior;
    target: IBindingTarget;
    locator: IServiceLocator;
    $nextBind: IBindScope;
    $prevBind: IBindScope;
    $state: State;
    $scope: IScope;
    constructor(sourceExpression: IsBindingBehavior, target: IBindingTarget, locator: IServiceLocator);
    $bind(flags: LifecycleFlags, scope: IScope): void;
    $unbind(flags: LifecycleFlags): void;
    observeProperty(obj: StrictAny, propertyName: StrictAny): void;
    handleChange(newValue: any, previousValue: any, flags: LifecycleFlags): void;
}
//# sourceMappingURL=ref.d.ts.map