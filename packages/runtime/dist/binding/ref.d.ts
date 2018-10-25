import { IServiceLocator } from '@aurelia/kernel';
import { IBindScope, LifecycleState } from '../lifecycle';
import { BindingFlags, IScope } from '../observation';
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
    $state: LifecycleState;
    $scope: IScope;
    constructor(sourceExpression: IsBindingBehavior, target: IBindingTarget, locator: IServiceLocator);
    $bind(flags: BindingFlags, scope: IScope): void;
    $unbind(flags: BindingFlags): void;
    observeProperty(obj: StrictAny, propertyName: StrictAny): void;
    handleChange(newValue: any, previousValue: any, flags: BindingFlags): void;
}
//# sourceMappingURL=ref.d.ts.map