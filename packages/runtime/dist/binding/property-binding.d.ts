import { IServiceLocator } from '@aurelia/kernel';
import { IForOfStatement, IsBindingBehavior } from '../ast';
import { BindingMode, LifecycleFlags, State } from '../flags';
import { ILifecycle } from '../lifecycle';
import { AccessorOrObserver, IObservable, IScope } from '../observation';
import { IObserverLocator } from '../observation/observer-locator';
import { IConnectableBinding, IPartialConnectableBinding } from './connectable';
export interface PropertyBinding extends IConnectableBinding {
}
export declare class PropertyBinding implements IPartialConnectableBinding {
    id: number;
    $state: State;
    $lifecycle: ILifecycle;
    $scope?: IScope;
    part?: string;
    locator: IServiceLocator;
    mode: BindingMode;
    observerLocator: IObserverLocator;
    sourceExpression: IsBindingBehavior | IForOfStatement;
    target: IObservable;
    targetProperty: string;
    targetObserver?: AccessorOrObserver;
    persistentFlags: LifecycleFlags;
    constructor(sourceExpression: IsBindingBehavior | IForOfStatement, target: object, targetProperty: string, mode: BindingMode, observerLocator: IObserverLocator, locator: IServiceLocator);
    updateTarget(value: unknown, flags: LifecycleFlags): void;
    updateSource(value: unknown, flags: LifecycleFlags): void;
    handleChange(newValue: unknown, _previousValue: unknown, flags: LifecycleFlags): void;
    $bind(flags: LifecycleFlags, scope: IScope, part?: string): void;
    $unbind(flags: LifecycleFlags): void;
}
//# sourceMappingURL=property-binding.d.ts.map