import { IServiceLocator } from '@aurelia/kernel';
import { IBindScope, ILifecycle, State } from '../lifecycle';
import { IScope, LifecycleFlags } from '../observation';
import { IObserverLocator } from '../observation/observer-locator';
import { IExpression } from './ast';
import { IBindingTarget } from './binding';
import { IConnectableBinding, IPartialConnectableBinding } from './connectable';
export interface LetBinding extends IConnectableBinding {
}
export declare class LetBinding implements IPartialConnectableBinding {
    $nextBind: IBindScope;
    $prevBind: IBindScope;
    $state: State;
    $lifecycle: ILifecycle;
    $scope: IScope;
    locator: IServiceLocator;
    observerLocator: IObserverLocator;
    sourceExpression: IExpression;
    target: IBindingTarget;
    targetProperty: string;
    private toViewModel;
    constructor(sourceExpression: IExpression, targetProperty: string, observerLocator: IObserverLocator, locator: IServiceLocator, toViewModel?: boolean);
    handleChange(_newValue: unknown, _previousValue: unknown, flags: LifecycleFlags): void;
    $bind(flags: LifecycleFlags, scope: IScope): void;
    $unbind(flags: LifecycleFlags): void;
}
//# sourceMappingURL=let-binding.d.ts.map