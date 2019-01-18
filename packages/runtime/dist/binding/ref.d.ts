import { IIndexable, IServiceLocator } from '@aurelia/kernel';
import { IsBindingBehavior } from '../ast';
import { LifecycleFlags, State } from '../flags';
import { IBindScope } from '../lifecycle';
import { IObservable, IScope } from '../observation';
import { IBinding } from './binding';
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
    target: IObservable;
    constructor(sourceExpression: IsBindingBehavior, target: IObservable, locator: IServiceLocator);
    $bind(flags: LifecycleFlags, scope: IScope): void;
    $unbind(flags: LifecycleFlags): void;
    observeProperty(flags: LifecycleFlags, obj: IIndexable, propertyName: string): void;
    handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void;
}
//# sourceMappingURL=ref.d.ts.map