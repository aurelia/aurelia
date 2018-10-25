import { IServiceLocator } from '@aurelia/kernel';
import { IBindScope, LifecycleState } from '../lifecycle';
import { BindingFlags, IScope } from '../observation';
import { IExpression } from './ast';
import { IBindingTarget } from './binding';
import { IConnectableBinding, IPartialConnectableBinding } from './connectable';
import { IObserverLocator } from './observer-locator';
export interface LetBinding extends IConnectableBinding {
}
export declare class LetBinding implements IPartialConnectableBinding {
    sourceExpression: IExpression;
    targetProperty: string;
    observerLocator: IObserverLocator;
    locator: IServiceLocator;
    private toViewModel;
    $nextBind: IBindScope;
    $prevBind: IBindScope;
    $state: LifecycleState;
    $scope: IScope;
    target: IBindingTarget;
    constructor(sourceExpression: IExpression, targetProperty: string, observerLocator: IObserverLocator, locator: IServiceLocator, toViewModel?: boolean);
    handleChange(newValue: any, previousValue: any, flags: BindingFlags): void;
    $bind(flags: BindingFlags, scope: IScope): void;
    $unbind(flags: BindingFlags): void;
}
//# sourceMappingURL=let-binding.d.ts.map