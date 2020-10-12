import { IServiceLocator } from '@aurelia/kernel';
import { LifecycleFlags } from '../flags';
import { IAccessor } from '../observation';
import { IObserverLocator } from '../observation/observer-locator';
import { IsBindingBehavior } from './ast';
import { IConnectableBinding } from './connectable';
import type { Scope } from '../observation/binding-context';
export interface CallBinding extends IConnectableBinding {
}
export declare class CallBinding {
    sourceExpression: IsBindingBehavior;
    readonly target: object;
    readonly targetProperty: string;
    locator: IServiceLocator;
    interceptor: this;
    isBound: boolean;
    $scope?: Scope;
    $hostScope: Scope | null;
    targetObserver: IAccessor;
    constructor(sourceExpression: IsBindingBehavior, target: object, targetProperty: string, observerLocator: IObserverLocator, locator: IServiceLocator);
    callSource(args: object): unknown;
    $bind(flags: LifecycleFlags, scope: Scope, hostScope: Scope | null): void;
    $unbind(flags: LifecycleFlags): void;
    observeProperty(flags: LifecycleFlags, obj: object, propertyName: string): void;
    handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void;
}
//# sourceMappingURL=call-binding.d.ts.map