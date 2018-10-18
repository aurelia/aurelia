import { IServiceLocator } from '@aurelia/kernel';
import { IExpression } from './ast';
import { IBindingTarget } from './binding';
import { IScope } from './binding-context';
import { BindingFlags } from './binding-flags';
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
    $isBound: boolean;
    $scope: IScope;
    target: IBindingTarget;
    constructor(sourceExpression: IExpression, targetProperty: string, observerLocator: IObserverLocator, locator: IServiceLocator, toViewModel?: boolean);
    handleChange(newValue: any, previousValue: any, flags: BindingFlags): void;
    $bind(flags: BindingFlags, scope: IScope): void;
    $unbind(flags: BindingFlags): void;
}
//# sourceMappingURL=let-binding.d.ts.map