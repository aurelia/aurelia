import { IServiceLocator } from '@aurelia/kernel';
import { BindingMode, LifecycleFlags } from '../flags';
import { ILifecycle } from '../lifecycle';
import { AccessorOrObserver, IScope } from '../observation';
import { IObserverLocator } from '../observation/observer-locator';
import { ForOfStatement, IsBindingBehavior } from './ast';
import { IConnectableBinding, IPartialConnectableBinding } from './connectable';
export interface PropertyBinding extends IConnectableBinding {
}
export declare class PropertyBinding implements IPartialConnectableBinding {
    sourceExpression: IsBindingBehavior | ForOfStatement;
    target: object;
    targetProperty: string;
    mode: BindingMode;
    observerLocator: IObserverLocator;
    locator: IServiceLocator;
    interceptor: this;
    id: number;
    isBound: boolean;
    $lifecycle: ILifecycle;
    $scope?: IScope;
    $hostScope: IScope | null;
    targetObserver?: AccessorOrObserver;
    persistentFlags: LifecycleFlags;
    private task;
    private readonly $scheduler;
    constructor(sourceExpression: IsBindingBehavior | ForOfStatement, target: object, targetProperty: string, mode: BindingMode, observerLocator: IObserverLocator, locator: IServiceLocator);
    updateTarget(value: unknown, flags: LifecycleFlags): void;
    updateSource(value: unknown, flags: LifecycleFlags): void;
    handleChange(newValue: unknown, _previousValue: unknown, flags: LifecycleFlags): void;
    $bind(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null): void;
    $unbind(flags: LifecycleFlags): void;
    dispose(): void;
}
//# sourceMappingURL=property-binding.d.ts.map