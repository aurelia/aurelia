import { IServiceLocator } from '@aurelia/kernel';
import { IBindScope, ILifecycle, State } from '../lifecycle';
import { IScope, LifecycleFlags } from '../observation';
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
    $state: State;
    $scope: IScope;
    $lifecycle: ILifecycle;
    target: IBindingTarget;
    constructor(sourceExpression: IExpression, targetProperty: string, observerLocator: IObserverLocator, locator: IServiceLocator, toViewModel?: boolean);
    handleChange(newValue: any, previousValue: any, flags: LifecycleFlags): void;
    $bind(flags: LifecycleFlags, scope: IScope): void;
    $unbind(flags: LifecycleFlags): void;
}
//# sourceMappingURL=let-binding.d.ts.map